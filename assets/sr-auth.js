// ============================================================
//  SR Central — login compartilhado entre todos os sistemas
//  Login por USUÁRIO + SENHA (cadastrados em Configurações).
//  Expõe window.SRAuth. Sem dependências.
//
//  Uso num sistema:
//    <script src="/assets/sr-config.js"></script>
//    <script src="/assets/sr-auth.js"></script>
//    const cad = await SRAuth.entrar('joao', '1234');
//    SRAuth.temAcesso(cad, 'compras')  -> true/false
//    await SRAuth.rest('minha_tabela?select=*')
// ============================================================
(function () {
  'use strict';

  const CFG = window.SR_SUPABASE || {};
  const URL_BASE = String(CFG.url || '').replace(/\/+$/, '');
  const CHAVE = CFG.chave || '';
  const CHAVE_SESSAO = 'sr_sessao';
  const DOMINIO = 'usuarios.sr-central.app';     // igual à Edge Function sr-admin
  const senhaInterna = (s) => 'SR#' + s + '#SR'; // igual à Edge Function sr-admin
  const normalizar = (u) => String(u || '').trim().toLowerCase();

  // ---------- sessão (compartilhada entre os sistemas do mesmo site) ----------
  function sessao() {
    try { return JSON.parse(localStorage.getItem(CHAVE_SESSAO)); } catch (e) { return null; }
  }
  function gravar(s) {
    try { s ? localStorage.setItem(CHAVE_SESSAO, JSON.stringify(s)) : localStorage.removeItem(CHAVE_SESSAO); } catch (e) {}
  }

  function traduzir(msg) {
    const m = String(msg || '');
    if (/invalid login credentials/i.test(m)) return 'Usuário ou senha incorretos.';
    if (/banned/i.test(m)) return 'Este usuário está desativado. Fale com o administrador.';
    if (/rate limit|too many/i.test(m)) return 'Muitas tentativas. Aguarde alguns minutos e tente de novo.';
    if (/failed to fetch|networkerror|load failed/i.test(m)) return 'Sem conexão com o servidor. Verifique a internet.';
    if (/jwt expired|invalid jwt/i.test(m)) return 'Sua sessão expirou. Entre de novo.';
    return m || 'Erro inesperado.';
  }

  async function chamar(url, opts) {
    let r;
    try { r = await fetch(url, opts); } catch (e) { throw new Error(traduzir(e.message)); }
    const txt = await r.text();
    let j = null;
    try { j = txt ? JSON.parse(txt) : null; } catch (e) { j = txt; }
    if (!r.ok) {
      const msg = j && (j.erro || j.error_description || j.msg || j.message || j.error);
      const e = new Error(traduzir(msg || ('Erro ' + r.status)));
      e.status = r.status;
      throw e;
    }
    return j;
  }

  function normalizarSessao(j) {
    return {
      access_token: j.access_token,
      refresh_token: j.refresh_token,
      expires_at: j.expires_at || Math.floor(Date.now() / 1000) + (j.expires_in || 3600),
      user_id: j.user && j.user.id
    };
  }

  // ---------- login / logout ----------
  async function entrar(usuario, senha) {
    const u = normalizar(usuario);
    if (!u || !senha) throw new Error('Informe usuário e senha.');
    const j = await chamar(URL_BASE + '/auth/v1/token?grant_type=password', {
      method: 'POST',
      headers: { apikey: CHAVE, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: u + '@' + DOMINIO, password: senhaInterna(senha) })
    });
    gravar(normalizarSessao(j));
    cacheCad = null;
    const cad = await meuCadastro();
    if (!cad) { await sair(); throw new Error('Usuário sem cadastro na SR Central. Fale com o administrador.'); }
    if (!cad.ativo) { await sair(); throw new Error('Este usuário está desativado. Fale com o administrador.'); }
    return cad;
  }

  async function sair() {
    const s = sessao();
    gravar(null);
    cacheCad = null;
    if (s && s.access_token) {
      fetch(URL_BASE + '/auth/v1/logout', {
        method: 'POST', headers: { apikey: CHAVE, Authorization: 'Bearer ' + s.access_token }
      }).catch(() => {});
    }
  }

  let renovando = null;
  async function renovar() {
    const s = sessao();
    if (!s || !s.refresh_token) return null;
    try {
      const j = await chamar(URL_BASE + '/auth/v1/token?grant_type=refresh_token', {
        method: 'POST',
        headers: { apikey: CHAVE, 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: s.refresh_token })
      });
      const n = normalizarSessao(j);
      gravar(n);
      return n;
    } catch (e) {
      // outro sistema aberto pode ter renovado ao mesmo tempo
      const atual = sessao();
      if (atual && atual.refresh_token !== s.refresh_token) return atual;
      gravar(null);
      return null;
    }
  }

  async function token() {
    let s = sessao();
    if (!s) return null;
    if (s.expires_at - 60 < Date.now() / 1000) {
      renovando = renovando || renovar().finally(() => { renovando = null; });
      s = await renovando;
    }
    return s ? s.access_token : null;
  }

  // ---------- dados ----------
  // Chamada à API REST do banco. caminho ex.: "pedidos?select=*&status=eq.aberto"
  async function rest(caminho, opts) {
    opts = opts || {};
    const t = await token();
    const headers = Object.assign({ apikey: CHAVE, 'Content-Type': 'application/json' },
      t ? { Authorization: 'Bearer ' + t } : {}, opts.headers || {});
    return chamar(URL_BASE + '/rest/v1/' + caminho, {
      method: opts.method || 'GET',
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined
    });
  }

  // Cadastro do usuário logado (tabela usuarios), ou null se não estiver logado
  let cacheCad = null;
  async function meuCadastro(forcar) {
    const s = sessao();
    if (!s) return null;
    if (cacheCad && !forcar && cacheCad.id === s.user_id) return cacheCad;
    try {
      const t = await token();
      if (!t) return null;
      const lista = await rest('usuarios?select=*&id=eq.' + encodeURIComponent(sessao().user_id));
      cacheCad = (lista && lista[0]) || null;
      return cacheCad;
    } catch (e) {
      if (e.status === 401) { gravar(null); return null; }
      throw e;
    }
  }

  function temAcesso(cad, sistema) {
    return !!(cad && cad.ativo && (cad.admin || (cad.sistemas || []).includes(sistema)));
  }

  // Ações de administrador (Edge Function sr-admin)
  async function admin(acao, dados) {
    const t = await token();
    if (!t) { const e = new Error('Sua sessão expirou. Entre de novo.'); e.status = 401; throw e; }
    return chamar(URL_BASE + '/functions/v1/sr-admin', {
      method: 'POST',
      headers: { apikey: CHAVE, Authorization: 'Bearer ' + t, 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.assign({ acao }, dados || {}))
    });
  }

  // Avisa quando a sessão muda em outro sistema/aba (ex.: alguém clicou em Sair)
  function aoMudarSessao(fn) {
    window.addEventListener('storage', (e) => { if (e.key === CHAVE_SESSAO) { cacheCad = null; fn(sessao()); } });
  }

  window.SRAuth = { entrar, sair, sessao, token, rest, meuCadastro, temAcesso, admin, aoMudarSessao, normalizar };
})();
