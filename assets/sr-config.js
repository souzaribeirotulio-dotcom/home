// ============================================================
//  SR Central — conexão com o Supabase
//  A "publishable key" é pública por natureza (vai para o navegador).
//  Quem protege os dados são as regras RLS do banco.
//  NUNCA coloque a chave secreta (sb_secret_... / service_role) aqui.
// ============================================================
window.SR_SUPABASE = {
  url: 'https://cvhcgihumdvytjvbkxvt.supabase.co',
  chave: 'sb_publishable_BgIApLyc9EWW2isPjl4-5A_VHh3eQGS'
};
