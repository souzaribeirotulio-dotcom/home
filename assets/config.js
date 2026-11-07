// ============================================================
//  SR Central — Configurações (cadastro de usuários)
//  Área restrita ao administrador. Expõe window.SRConfig.
// ============================================================
(function () {
  'use strict';

  const SIS = window.SR_SISTEMAS || [];
  const A = window.SRAuth;
  const ic = (n) => window.SRUI.ic(n);
  const esc = (s) => window.SRUI.esc(s);
  const toast = (m, t) => window.SRUI.toast(m, t);

  const st = { el: null, cad: null, usuarios: [], busca: '', carregando: false };

  // ---------- entrada ----------
  async function mostrar(el) {
    st.el = el;
    if (!el.dataset.pronto) {
      el.dataset.pronto = '1';
      ligarEventos(el);
      A.aoMudarSessao(() => { if (!el.hidden) mostrar(el); });
    }
    if (!A.sessao()) return telaLogin();
    el.innerHTML = '<div class="cfg-centro"><div class="spinner"></div></div>';
    try {
      st.cad = await A.meuCadastro(true);
    } catch (e) {
      return telaLogin(e.message);
    }
    if (!st.cad) return telaLogin();
    if (!st.cad.admin) return telaSemPermissao();
    await carregarUsuarios();
  }

  // ---------- login ----------
  function telaLogin(msg) {
    st.el.innerHTML = `
      <div class="cfg-centro">
        <form class="cfg-login" id="cfg-login" autocomplete="on">
          <div class="cfg-login-ic">${ic('gear')}</div>
          <h1>Configurações</h1>
          <p>Área restrita ao administrador. Aqui você cadastra as pessoas e define quais sistemas cada uma pode usar.</p>
          ${msg ? '<div class="msg-erro">' + esc(msg) + '</div>' : ''}
          <label class="campo"><span>Usuário</span><input class="inp" name="usuario" autocomplete="username" autocapitalize="none" spellcheck="false" required></label>
          <label class="campo"><span>Senha</span><input class="inp" name="senha" type="password" autocomplete="current-password" required></label>
          <button class="btn btn-lima btn-cheio" type="submit">Entrar</button>
        </form>
      </div>`;
    setTimeout(() => { const i = st.el.querySelector('[name=usuario]'); if (i) i.focus(); }, 30);
  }

  function telaSemPermissao() {
    st.el.innerHTML = `
      <div class="cfg-centro">
        <div class="cfg-login">
          <div class="cfg-login-ic">${ic('shield')}</div>
          <h1>Sem permissão</h1>
          <p>Você está conectado como <b>${esc(st.cad.nome)}</b> (@${esc(st.cad.username)}), que não é administrador.</p>
          <button class="btn btn-sec btn-cheio" data-cfg="sair">Sair e entrar com outro usuário</button>
        </div>
      </div>`;
  }

  // ---------- painel ----------
  async function carregarUsuarios() {
    try {
      const r = await A.admin('listar');
      st.usuarios = r.usuarios || [];
      renderPainel();
    } catch (e) {
      if (e.status === 401) { await A.sair(); return telaLogin(e.message); }
      st.el.innerHTML = `<div class="cfg-centro"><div class="cfg-login"><div class="cfg-login-ic">${ic('alert')}</div>
        <h1>Não foi possível carregar</h1><p>${esc(e.message)}</p>
        <button class="btn btn-sec btn-cheio" data-cfg="recarregar">Tentar de novo</button></div></div>`;
    }
  }

  function iniciais(nome) {
    const p = String(nome || '?').trim().split(/\s+/);
    return ((p[0] || '')[0] + ((p.length > 1 ? p[p.length - 1][0] : (p[0] || '')[1]) || '')).toUpperCase();
  }

  function chipsSistemas(u) {
    if (u.admin) return '<span class="sis-chip todos">' + ic('shield') + 'Todos (admin)</span>';
    const lista = SIS.filter((s) => (u.sistemas || []).includes(s.id));
    if (!lista.length) return '<span class="mudo">Nenhum sistema</span>';
    return lista.map((s) => `<span class="sis-chip" style="--c:${esc(s.cor)}">${ic(s.icone)}${esc(s.curto || s.nome)}</span>`).join('');
  }

  function renderPainel() {
    const t = window.SRUI.semAcento(st.busca);
    const lista = st.usuarios.filter((u) => !t || window.SRUI.semAcento(u.nome + ' ' + u.username).includes(t));
    const ativos = st.usuarios.filter((u) => u.ativo).length;
    const contagem = SIS.map((s) => ({ s, n: st.usuarios.filter((u) => u.ativo && (u.admin || (u.sistemas || []).includes(s.id))).length }));

    st.el.innerHTML = `
      <div class="cfg-pagina">
        <div class="cfg-cabeca">
          <div>
            <div class="cfg-kicker">${ic('gear')} Configurações</div>
            <h1>Usuários e acessos</h1>
            <p>Cadastre as pessoas, defina a senha e escolha quais sistemas cada uma pode usar.</p>
          </div>
          <div class="cfg-quem">
            <div class="avatar">${esc(iniciais(st.cad.nome))}</div>
            <div><div class="quem-nome">${esc(st.cad.nome)}</div><div class="quem-sub">@${esc(st.cad.username)} · administrador</div></div>
            <button class="ic-btn" data-cfg="minha-senha" title="Trocar minha senha">${ic('key')}</button>
            <button class="ic-btn" data-cfg="sair" title="Sair">${ic('logout')}</button>
          </div>
        </div>

        ${st.cad.senha_padrao ? `
        <div class="cfg-alerta">
          ${ic('alert')}
          <div><b>Você ainda está usando a senha padrão (ADMIN).</b> Como o site é público na internet, qualquer pessoa que tentar ADMIN / ADMIN entra aqui e controla todos os acessos. Troque por uma senha só sua.</div>
          <button class="btn btn-lima" data-cfg="minha-senha">Trocar agora</button>
        </div>` : ''}

        <div class="cfg-stats">
          <div class="stat"><div class="stat-n">${st.usuarios.length}</div><div class="stat-r">usuários</div></div>
          <div class="stat"><div class="stat-n">${ativos}</div><div class="stat-r">ativos</div></div>
          ${contagem.map(({ s, n }) => `<div class="stat stat-sis" style="--c:${esc(s.cor)}"><div class="stat-ic">${ic(s.icone)}</div><div><div class="stat-n">${n}</div><div class="stat-r">${esc(s.curto || s.nome)}</div></div></div>`).join('')}
        </div>

        <div class="cfg-barra">
          <div class="busca-inline">${ic('search')}<input class="inp" id="cfg-busca" placeholder="Buscar por nome ou usuário…" value="${esc(st.busca)}"></div>
          <button class="btn btn-lima" data-cfg="novo">${ic('plus')} Novo usuário</button>
        </div>

        <div class="cfg-tabela">
          <div class="linha cabeca"><div>Pessoa</div><div>Sistemas liberados</div><div>Situação</div><div></div></div>
          ${lista.length ? lista.map((u) => `
            <div class="linha${u.ativo ? '' : ' inativo'}">
              <div class="pessoa">
                <div class="avatar${u.admin ? ' adm' : ''}">${esc(iniciais(u.nome))}</div>
                <div><div class="p-nome">${esc(u.nome)}${u.id === st.cad.id ? ' <span class="voce">você</span>' : ''}</div><div class="p-user">@${esc(u.username)}</div></div>
              </div>
              <div class="sis-lista">${chipsSistemas(u)}</div>
              <div><span class="situacao ${u.ativo ? 'on' : 'off'}"><i></i>${u.ativo ? 'Ativo' : 'Inativo'}</span></div>
              <div class="acoes">
                <button class="ic-btn" data-cfg="editar" data-id="${esc(u.id)}" title="Editar">${ic('edit')}</button>
                <button class="ic-btn" data-cfg="senha" data-id="${esc(u.id)}" title="Trocar senha">${ic('key')}</button>
                ${u.id === st.cad.id ? '' : `<button class="ic-btn perigo" data-cfg="excluir" data-id="${esc(u.id)}" title="Excluir">${ic('trash')}</button>`}
              </div>
            </div>`).join('') : `<div class="vazio">${st.busca ? 'Ninguém encontrado com essa busca.' : 'Nenhum usuário ainda.'}</div>`}
        </div>
        <p class="cfg-nota">O login de cada pessoa é o <b>usuário</b> e a <b>senha</b> cadastrados aqui. O usuário não diferencia maiúsculas de minúsculas, mas a senha sim.</p>
      </div>`;

    const b = st.el.querySelector('#cfg-busca');
    b.addEventListener('input', (e) => {
      st.busca = e.target.value;
      const pos = e.target.selectionStart;
      renderPainel();
      const nb = st.el.querySelector('#cfg-busca');
      nb.focus(); nb.setSelectionRange(pos, pos);
    });
  }

  // ---------- modais ----------
  function abrirModal(html, aoEnviar) {
    fecharModal();
    const veu = document.createElement('div');
    veu.className = 'modal-veu';
    veu.id = 'cfg-modal';
    veu.innerHTML = '<form class="modal" novalidate>' + html + '</form>';
    document.body.appendChild(veu);
    const form = veu.querySelector('form');
    veu.addEventListener('mousedown', (e) => { if (e.target === veu) fecharModal(); });
    form.addEventListener('click', (e) => { if (e.target.closest('[data-fechar]')) { e.preventDefault(); fecharModal(); } });
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('[type=submit]');
      const erroEl = form.querySelector('.msg-erro');
      erroEl.hidden = true;
      btn.disabled = true;
      const txt = btn.innerHTML;
      btn.innerHTML = '<span class="spinner mini"></span>';
      try {
        await aoEnviar(form);
        fecharModal();
      } catch (err) {
        erroEl.textContent = err.message;
        erroEl.hidden = false;
        btn.disabled = false;
        btn.innerHTML = txt;
      }
    });
    setTimeout(() => { const f = form.querySelector('input:not([disabled]):not([type=checkbox])'); if (f) f.focus(); }, 30);
    return form;
  }
  function fecharModal() { const m = document.getElementById('cfg-modal'); if (m) m.remove(); }

  function modalUsuario(u) {
    const novo = !u;
    u = u || { nome: '', username: '', sistemas: [], admin: false, ativo: true };
    const ehEu = !novo && u.id === st.cad.id;
    const form = abrirModal(`
      <div class="modal-topo"><h2>${novo ? 'Novo usuário' : 'Editar usuário'}</h2><button class="ic-btn" data-fechar>${ic('close')}</button></div>
      <div class="msg-erro" hidden></div>
      <div class="grade-2">
        <label class="campo"><span>Nome</span><input class="inp" name="nome" value="${esc(u.nome)}" placeholder="Ex.: João Silva" required></label>
        <label class="campo"><span>Usuário (login)</span><input class="inp" name="username" value="${esc(u.username)}" placeholder="Ex.: joao" autocapitalize="none" spellcheck="false" ${novo ? 'required' : 'disabled'}></label>
      </div>
      ${novo ? `<label class="campo"><span>Senha</span><input class="inp" name="senha" type="text" placeholder="Mínimo 4 caracteres" autocomplete="off" required></label>` : ''}
      <div class="campo"><span>Sistemas que pode acessar</span>
        <div class="sis-opcoes">
          ${SIS.map((s) => `
            <label class="sis-opcao" style="--c:${esc(s.cor)}">
              <input type="checkbox" name="sis" value="${esc(s.id)}" ${(u.sistemas || []).includes(s.id) ? 'checked' : ''}>
              <span class="so-ic">${ic(s.icone)}</span><span class="so-nome">${esc(s.nome)}</span><span class="so-check">${ic('check-mini')}</span>
            </label>`).join('')}
        </div>
      </div>
      <div class="interruptores">
        <label class="interruptor-linha"><span><b>Administrador</b><small>Acessa todos os sistemas e estas Configurações</small></span>
          <span class="interruptor"><input type="checkbox" name="admin" ${u.admin ? 'checked' : ''} ${ehEu ? 'disabled' : ''}><i></i></span></label>
        ${novo ? '' : `<label class="interruptor-linha"><span><b>Ativo</b><small>Desativado não consegue mais entrar</small></span>
          <span class="interruptor"><input type="checkbox" name="ativo" ${u.ativo ? 'checked' : ''} ${ehEu ? 'disabled' : ''}><i></i></span></label>`}
      </div>
      <div class="modal-pe"><button class="btn btn-sec" data-fechar>Cancelar</button><button class="btn btn-lima" type="submit">${novo ? 'Criar usuário' : 'Salvar'}</button></div>
    `, async (f) => {
      const dados = {
        nome: f.nome.value.trim(),
        sistemas: Array.from(f.querySelectorAll('[name=sis]:checked')).map((c) => c.value),
        admin: f.admin.checked
      };
      if (!dados.nome) throw new Error('Informe o nome.');
      if (novo) {
        dados.username = A.normalizar(f.username.value);
        dados.senha = f.senha.value;
        if (!dados.username) throw new Error('Informe o usuário.');
        if (/\s/.test(dados.username)) throw new Error('O usuário não pode ter espaços.');
        if ((dados.senha || '').length < 4) throw new Error('A senha precisa ter pelo menos 4 caracteres.');
        await A.admin('criar', dados);
        toast('Usuário @' + dados.username + ' criado.');
      } else {
        if (ehEu) delete dados.admin;
        else dados.ativo = f.ativo.checked;
        await A.admin('atualizar', Object.assign({ id: u.id }, dados));
        toast('Alterações salvas.');
      }
      await carregarUsuarios();
    });
    // admin marca tudo visualmente
    const sincAdmin = () => form.classList.toggle('modo-admin', form.admin.checked);
    form.admin.addEventListener('change', sincAdmin); sincAdmin();
  }

  function modalSenha(u) {
    const ehEu = u.id === st.cad.id;
    abrirModal(`
      <div class="modal-topo"><h2>${ehEu ? 'Trocar minha senha' : 'Trocar senha'}</h2><button class="ic-btn" data-fechar>${ic('close')}</button></div>
      <p class="modal-sub">${ehEu ? 'Escolha uma senha que só você saiba.' : 'Nova senha para <b>' + esc(u.nome) + '</b> (@' + esc(u.username) + ').'}</p>
      <div class="msg-erro" hidden></div>
      <label class="campo"><span>Nova senha</span><input class="inp" name="s1" type="password" autocomplete="new-password" placeholder="Mínimo 4 caracteres" required></label>
      <label class="campo"><span>Repita a senha</span><input class="inp" name="s2" type="password" autocomplete="new-password" required></label>
      <div class="modal-pe"><button class="btn btn-sec" data-fechar>Cancelar</button><button class="btn btn-lima" type="submit">Salvar senha</button></div>
    `, async (f) => {
      if (f.s1.value.length < 4) throw new Error('A senha precisa ter pelo menos 4 caracteres.');
      if (f.s1.value !== f.s2.value) throw new Error('As duas senhas não são iguais.');
      await A.admin('senha', { id: u.id, senha: f.s1.value });
      toast('Senha alterada.');
      if (ehEu) st.cad = await A.meuCadastro(true);
      await carregarUsuarios();
    });
  }

  function modalExcluir(u) {
    abrirModal(`
      <div class="modal-topo"><h2>Excluir usuário</h2><button class="ic-btn" data-fechar>${ic('close')}</button></div>
      <p class="modal-sub">Tem certeza que quer excluir <b>${esc(u.nome)}</b> (@${esc(u.username)})? Essa ação não pode ser desfeita. Se for só temporário, prefira <b>desativar</b> em Editar.</p>
      <div class="msg-erro" hidden></div>
      <div class="modal-pe"><button class="btn btn-sec" data-fechar>Cancelar</button><button class="btn btn-perigo" type="submit">${ic('trash')} Excluir</button></div>
    `, async () => {
      await A.admin('excluir', { id: u.id });
      toast('Usuário excluído.');
      await carregarUsuarios();
    });
  }

  // ---------- eventos ----------
  function ligarEventos(el) {
    el.addEventListener('submit', async (e) => {
      if (e.target.id !== 'cfg-login') return;
      e.preventDefault();
      const f = e.target;
      const btn = f.querySelector('button');
      btn.disabled = true; btn.innerHTML = '<span class="spinner mini"></span>';
      try {
        await A.entrar(f.usuario.value, f.senha.value);
        await mostrar(el);
      } catch (err) {
        telaLogin(err.message);
        const i = el.querySelector('[name=usuario]'); if (i) i.value = f.usuario.value;
        const s = el.querySelector('[name=senha]'); if (s) s.focus();
      }
    });
    el.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-cfg]');
      if (!b) return;
      const acao = b.dataset.cfg;
      const u = st.usuarios.find((x) => x.id === b.dataset.id);
      if (acao === 'sair') { await A.sair(); toast('Você saiu.'); telaLogin(); }
      else if (acao === 'recarregar') mostrar(el);
      else if (acao === 'novo') modalUsuario(null);
      else if (acao === 'editar' && u) modalUsuario(u);
      else if (acao === 'senha' && u) modalSenha(u);
      else if (acao === 'excluir' && u) modalExcluir(u);
      else if (acao === 'minha-senha') modalSenha(st.usuarios.find((x) => x.id === st.cad.id) || st.cad);
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') fecharModal(); });
  }

  window.SRConfig = { mostrar, fecharModal };
})();
