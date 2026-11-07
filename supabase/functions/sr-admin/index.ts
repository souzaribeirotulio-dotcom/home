// ============================================================
//  SR Central — Edge Function "sr-admin"
//  Gerencia o cadastro de usuários (somente administradores).
//  Usa a chave secreta do projeto, que nunca vai para o site.
//
//  Ações (POST JSON { acao, ... }):
//   listar
//   criar      { username, nome, senha, sistemas[], admin }
//   atualizar  { id, nome?, sistemas?, admin?, ativo? }
//   senha      { id, senha }
//   excluir    { id }
// ============================================================
import { createClient } from "npm:@supabase/supabase-js@2";

const DOMINIO = "usuarios.sr-central.app"; // e-mail interno: <username>@DOMINIO
const SISTEMAS = ["compras", "comercial", "tarefas", "expedicao", "motorista"];

// Mesma transformação usada no site (assets/sr-auth.js)
const senhaInterna = (s: string) => "SR#" + s + "#SR";
const normalizarUsuario = (u: string) => String(u || "").trim().toLowerCase();

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function resposta(corpo: unknown, status = 200) {
  return new Response(JSON.stringify(corpo), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}
const erro = (msg: string, status = 400) => resposta({ erro: msg }, status);

function chaveSecreta(): string {
  try {
    const k = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}");
    if (k.default) return k.default;
  } catch (_) { /* usa a legada */ }
  return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
}

const admin = createClient(Deno.env.get("SUPABASE_URL")!, chaveSecreta(), {
  auth: { persistSession: false, autoRefreshToken: false },
});

function validarSenha(s: unknown) {
  if (typeof s !== "string" || s.length < 4) return "A senha precisa ter pelo menos 4 caracteres.";
  if (s.length > 64) return "A senha pode ter no máximo 64 caracteres.";
  return null;
}
function limparSistemas(lista: unknown): string[] {
  if (!Array.isArray(lista)) return [];
  return [...new Set(lista.map(String).filter((s) => SISTEMAS.includes(s)))];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return erro("Método não permitido.", 405);

  // ---- quem está chamando? precisa ser admin ativo ----
  const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token) return erro("Faça login nas Configurações.", 401);
  const { data: quem, error: eQuem } = await admin.auth.getUser(token);
  if (eQuem || !quem?.user) return erro("Sessão expirada. Entre de novo.", 401);

  const { data: eu } = await admin.from("usuarios").select("*").eq("id", quem.user.id).maybeSingle();
  if (!eu || !eu.admin || !eu.ativo) return erro("Acesso restrito ao administrador.", 403);

  let corpo: Record<string, unknown>;
  try { corpo = await req.json(); } catch (_) { return erro("Requisição inválida."); }
  const acao = String(corpo.acao || "");

  try {
    // ---------- listar ----------
    if (acao === "listar") {
      const { data, error } = await admin.from("usuarios").select("*").order("admin", { ascending: false }).order("nome");
      if (error) throw error;
      return resposta({ usuarios: data, eu: eu.id });
    }

    // ---------- criar ----------
    if (acao === "criar") {
      const username = normalizarUsuario(String(corpo.username || ""));
      if (!/^[a-z0-9._-]{2,32}$/.test(username))
        return erro("Usuário inválido. Use de 2 a 32 caracteres: letras, números, ponto, hífen ou sublinhado, sem espaços.");
      const eSenha = validarSenha(corpo.senha);
      if (eSenha) return erro(eSenha);

      const { data: existe } = await admin.from("usuarios").select("id").eq("username", username).maybeSingle();
      if (existe) return erro("Já existe um usuário com esse nome.");

      const { data: novo, error: eNovo } = await admin.auth.admin.createUser({
        email: `${username}@${DOMINIO}`,
        password: senhaInterna(String(corpo.senha)),
        email_confirm: true,
        user_metadata: { username },
      });
      if (eNovo || !novo?.user) throw eNovo || new Error("Falha ao criar usuário.");

      const { data, error } = await admin.from("usuarios").insert({
        id: novo.user.id,
        username,
        nome: String(corpo.nome || "").trim() || username,
        admin: !!corpo.admin,
        ativo: true,
        sistemas: limparSistemas(corpo.sistemas),
      }).select().single();
      if (error) { await admin.auth.admin.deleteUser(novo.user.id); throw error; }
      return resposta({ usuario: data });
    }

    const id = String(corpo.id || "");
    if (!id) return erro("Usuário não informado.");
    const { data: alvo } = await admin.from("usuarios").select("*").eq("id", id).maybeSingle();
    if (!alvo) return erro("Usuário não encontrado.", 404);
    const ehEu = alvo.id === eu.id;

    // ---------- atualizar ----------
    if (acao === "atualizar") {
      const mud: Record<string, unknown> = {};
      if (typeof corpo.nome === "string") mud.nome = corpo.nome.trim() || alvo.username;
      if (corpo.sistemas !== undefined) mud.sistemas = limparSistemas(corpo.sistemas);
      if (typeof corpo.admin === "boolean") {
        if (ehEu && !corpo.admin) return erro("Você não pode tirar o seu próprio acesso de administrador.");
        mud.admin = corpo.admin;
      }
      if (typeof corpo.ativo === "boolean") {
        if (ehEu && !corpo.ativo) return erro("Você não pode desativar o seu próprio usuário.");
        mud.ativo = corpo.ativo;
        // bloqueia/desbloqueia o login no Supabase Auth
        await admin.auth.admin.updateUserById(id, { ban_duration: corpo.ativo ? "none" : "876000h" });
      }
      const { data, error } = await admin.from("usuarios").update(mud).eq("id", id).select().single();
      if (error) throw error;
      return resposta({ usuario: data });
    }

    // ---------- trocar senha ----------
    if (acao === "senha") {
      const eSenha = validarSenha(corpo.senha);
      if (eSenha) return erro(eSenha);
      const { error } = await admin.auth.admin.updateUserById(id, { password: senhaInterna(String(corpo.senha)) });
      if (error) throw error;
      await admin.from("usuarios").update({ senha_padrao: false }).eq("id", id);
      return resposta({ ok: true });
    }

    // ---------- excluir ----------
    if (acao === "excluir") {
      if (ehEu) return erro("Você não pode excluir o seu próprio usuário.");
      const { error } = await admin.auth.admin.deleteUser(id); // apaga também em public.usuarios (cascade)
      if (error) throw error;
      return resposta({ ok: true });
    }

    return erro("Ação desconhecida.");
  } catch (e) {
    console.error(e);
    return erro((e as Error)?.message || "Erro inesperado.", 500);
  }
});
