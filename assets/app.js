// ============================================================
//  SR Central — tela inicial e troca entre sistemas
//  Sem login aqui: cada sistema cuida do próprio acesso.
// ============================================================
(function () {
  'use strict';

  const SISTEMAS = window.SR_SISTEMAS || [];
  const CENTRAL = window.SR_CENTRAL || { nome: 'SR Central', empresa: 'Souza Ribeiro' };

  // ---------- ícones (SVG em linha) ----------
  const ICONES = {
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/>',
    cart: '<circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2.5 3h2.6l2.4 12.2a1.5 1.5 0 0 0 1.5 1.2h8.7a1.5 1.5 0 0 0 1.5-1.1L21 7.5H6"/>',
    chart: '<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 6-7"/><path d="M16 7h4v4"/>',
    check: '<rect x="3" y="3" width="18" height="18" rx="4"/><path d="m8 12 3 3 5-6"/>',
    box: '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5"/><path d="M12 13v8"/><path d="m7.5 5.5 9 5"/>',
    truck: '<path d="M2 6h11v10H2z"/><path d="M13 9h4.5L21 12.5V16h-8"/><circle cx="6.5" cy="17.5" r="2"/><circle cx="17" cy="17.5" r="2"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/>',
    external: '<path d="M14 4h6v6"/><path d="M20 4 11 13"/><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/>',
    expand: '<path d="M4 9V4h5"/><path d="M20 9V4h-5"/><path d="M4 15v5h5"/><path d="M20 15v5h-5"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2.5"/><path d="M8 11V7.5a4 4 0 0 1 8 0V11"/>',
    arrow: '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    shield: '<path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5V6z"/><path d="m9 12 2 2 4-4"/>',
    key: '<circle cx="7.5" cy="15.5" r="4"/><path d="m10.5 12.5 9-9"/><path d="m16 6 3 3"/><path d="m14 8 2 2"/>',
    logout: '<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3"/><path d="M10 17l-5-5 5-5"/><path d="M5 12h11"/>',
    edit: '<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
    trash: '<path d="M4 7h16"/><path d="M10 11v6M14 11v6"/><path d="M6 7l1 13h10l1-13"/><path d="M9 7V4h6v3"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    alert: '<path d="M12 3 2 20h20z"/><path d="M12 10v4"/><path d="M12 17.5v.01"/>',
    'check-mini': '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/>'
  };
  const ic = (n) => '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">' + (ICONES[n] || ICONES.grid) + '</svg>';
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const semAcento = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const ehMac = /Mac|iPhone|iPad/.test(navigator.platform);
  const TECLA_CMD = ehMac ? '⌘' : 'Ctrl';
  const TECLA_ALT = ehMac ? '⌥' : 'Alt';

  function toast(msg, tipo) {
    let box = document.getElementById('toasts');
    if (!box) { box = document.createElement('div'); box.id = 'toasts'; document.body.appendChild(box); }
    const t = document.createElement('div');
    t.className = 'toast' + (tipo === 'erro' ? ' erro' : '');
    t.innerHTML = ic(tipo === 'erro' ? 'alert' : 'check-mini') + '<span>' + esc(msg) + '</span>';
    box.appendChild(t);
    setTimeout(() => { t.classList.add('sai'); setTimeout(() => t.remove(), 300); }, 3200);
  }
  window.SRUI = { ic, esc, semAcento, toast };

  // ---------- estado ----------
  const estado = { atual: null, quadros: {} };
  const $ = (sel, raiz) => (raiz || document).querySelector(sel);
  const $$ = (sel, raiz) => Array.from((raiz || document).querySelectorAll(sel));
  const porId = (id) => SISTEMAS.find((s) => s.id === id);

  // ---------- montagem ----------
  function montar() {
    const docks = SISTEMAS.map((s, i) => `
      <button class="dock" data-ir="${esc(s.id)}" style="--c:${esc(s.cor)}" aria-label="${esc(s.nome)}">
        ${ic(s.icone)}<i class="aberto"></i>
        <span class="dica">${esc(s.nome)} <kbd>${TECLA_ALT} ${i + 1}</kbd></span>
      </button>`).join('');

    const cartoes = SISTEMAS.map((s, i) => `
      <button class="cartao" data-ir="${esc(s.id)}" style="--c:${esc(s.cor)};animation-delay:${120 + i * 70}ms">
        <div class="cartao-topo">
          <div class="cartao-ic">${ic(s.icone)}</div>
          <div class="cartao-tecla"><span class="estado-pill"><i></i>Aberto</span><kbd>${i + 1}</kbd></div>
        </div>
        <h3>${esc(s.nome)}</h3>
        <p>${esc(s.desc)}</p>
        <div class="etiquetas">${(s.recursos || []).map((r) => '<span>' + esc(r) + '</span>').join('')}</div>
        <div class="cartao-rodape">
          <span class="login-nota">${ic('lock')} Acesso com login</span>
          <span class="entrar">Abrir ${ic('arrow')}</span>
        </div>
      </button>`).join('');

    $('#app').innerHTML = `
      <div class="shell">
        <nav class="trilho" aria-label="Sistemas">
          <button class="logo" data-ir="" aria-label="Início" title="Início">
            <img src="assets/marca/simbolo.png" alt="">
          </button>
          <div class="trilho-sep"></div>
          <div class="trilho-lista">${docks}</div>
          <div class="trilho-fim">
            <button class="dock dock-cfg" data-ir="configuracoes" style="--c:var(--lima)" aria-label="Configurações">${ic('gear')}<span class="dica">Configurações</span></button>
            <button class="dock" data-acao="paleta" aria-label="Buscar">${ic('search')}<span class="dica">Buscar <kbd>${TECLA_CMD} K</kbd></span></button>
          </div>
        </nav>

        <main class="principal">
          <header class="topo">
            <div class="migalha" id="migalha"></div>
            <div class="topo-meio">
              <button class="busca-btn" data-acao="paleta">${ic('search')}<span class="txt">Ir para um sistema…</span><kbd>${TECLA_CMD} K</kbd></button>
            </div>
            <div class="topo-acoes">
              <span class="relogio" id="relogio"></span>
              <button class="ic-btn" data-acao="recarregar" title="Recarregar sistema" hidden>${ic('refresh')}</button>
              <button class="ic-btn so-desktop" data-acao="tela-cheia" title="Tela cheia" hidden>${ic('expand')}</button>
              <button class="ic-btn" data-acao="nova-aba" title="Abrir em nova aba" hidden>${ic('external')}</button>
              <button class="ic-btn" data-acao="fechar" title="Fechar sistema" hidden>${ic('close')}</button>
            </div>
          </header>

          <div class="palco" id="palco">
            <div class="barra-carga" id="carga"></div>
            <section class="config" id="config" hidden></section>
            <section class="inicio" id="inicio">
              <div class="fundo"><div class="grade-bg"></div><div class="brilho-1"></div><div class="brilho-2"></div></div>
              <div class="inicio-conteudo">
                <div class="heroi">
                  <div>
                    <img class="marca-completa" src="assets/marca/logo-completo.png" alt="${esc(CENTRAL.empresa)}">
                    <h1><span id="saudacao">Olá</span>.<br><em>Todos os sistemas</em><br>num só lugar.</h1>
                    <p class="lead">Escolha um sistema para começar. Cada um pede o seu próprio login.</p>
                    <button class="atalho-busca" data-acao="paleta">${ic('search')} Buscar sistema… <kbd>${TECLA_CMD} K</kbd></button>
                  </div>
                  <div class="heroi-lado">
                    <div class="heroi-hora" id="hora">--:--</div>
                    <div class="heroi-data" id="data"></div>
                  </div>
                </div>

                <div class="rotulo-secao">Sistemas <span>${SISTEMAS.length}</span></div>
                <div class="cartoes">${cartoes}</div>

                <footer class="rodape-inicio">
                  <div>© ${new Date().getFullYear()} ${esc(CENTRAL.empresa)} Distribuidora · Araguari-MG</div>
                  <div class="dicas">
                    <span><kbd>1</kbd>–<kbd>${SISTEMAS.length}</kbd> abre um sistema</span>
                    <span><kbd>${TECLA_ALT}</kbd>+<kbd>nº</kbd> troca de qualquer lugar</span>
                    <span><kbd>${TECLA_CMD} K</kbd> buscar</span>
                  </div>
                </footer>
              </div>
            </section>
          </div>
        </main>
      </div>

      <div class="paleta-veu" id="paleta" hidden>
        <div class="paleta" role="dialog" aria-label="Ir para sistema">
          <div class="paleta-campo">${ic('search')}<input id="paleta-busca" placeholder="Digite o nome do sistema…" autocomplete="off"></div>
          <div class="paleta-lista" id="paleta-lista"></div>
          <div class="paleta-pe"><span><kbd>↑</kbd><kbd>↓</kbd> navegar</span><span><kbd>Enter</kbd> abrir</span><span><kbd>Esc</kbd> fechar</span></div>
        </div>
      </div>`;

    ligarEventos();
    relogio();
    setInterval(relogio, 10000);
  }

  // ---------- relógio e saudação ----------
  function relogio() {
    const d = new Date();
    const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const h = d.getHours();
    const saud = h < 5 ? 'Boa noite' : h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
    const set = (id, v) => { const el = document.getElementById(id); if (el && el.textContent !== v) el.textContent = v; };
    set('hora', hora);
    set('relogio', hora);
    set('saudacao', saud);
    set('data', d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }));
  }

  // ---------- navegação ----------
  function irPara(id) {
    const alvo = id ? '#/' + id : '#/';
    if (location.hash !== alvo) location.hash = alvo; else aplicarRota();
  }

  function aplicarRota() {
    const id = (location.hash.match(/^#\/([\w-]+)/) || [])[1] || null;
    if (id === 'configuracoes') return mostrarConfig();
    const s = id && porId(id);
    if (s && s.novaAba) { window.open(s.caminho, '_blank', 'noopener'); history.replaceState(null, '', '#/'); return mostrarInicio(); }
    s ? mostrarSistema(s) : mostrarInicio();
  }

  function mostrarConfig() {
    estado.atual = 'configuracoes';
    Object.values(estado.quadros).forEach((q) => q.classList.remove('visivel'));
    $('#inicio').hidden = true;
    const el = $('#config');
    el.hidden = false;
    document.title = 'Configurações · ' + CENTRAL.nome;
    atualizarTopo();
    window.SRConfig.mostrar(el);
  }

  function mostrarInicio() {
    estado.atual = null;
    $('#config').hidden = true;
    if (window.SRConfig) window.SRConfig.fecharModal();
    Object.values(estado.quadros).forEach((q) => q.classList.remove('visivel'));
    $('#inicio').hidden = false;
    document.title = CENTRAL.nome + ' · ' + CENTRAL.empresa;
    atualizarTopo();
  }

  function mostrarSistema(s) {
    estado.atual = s.id;
    let q = estado.quadros[s.id];
    if (!q) {
      q = document.createElement('iframe');
      q.className = 'quadro';
      q.title = s.nome;
      q.setAttribute('allow', 'clipboard-read; clipboard-write; fullscreen; camera; geolocation');
      q.addEventListener('load', () => { fimCarga(); ligarAtalhosNoQuadro(q); });
      q.src = s.caminho;
      $('#palco').appendChild(q);
      estado.quadros[s.id] = q;
      inicioCarga(s.cor);
    }
    Object.entries(estado.quadros).forEach(([k, el]) => el.classList.toggle('visivel', k === s.id));
    $('#inicio').hidden = true;
    $('#config').hidden = true;
    if (window.SRConfig) window.SRConfig.fecharModal();
    document.title = s.nome + ' · ' + CENTRAL.nome;
    atualizarTopo();
  }

  function fecharSistema(id) {
    const q = estado.quadros[id];
    if (q) { q.remove(); delete estado.quadros[id]; }
    irPara('');
  }

  function atualizarTopo() {
    const s = estado.atual && porId(estado.atual);
    const cfg = estado.atual === 'configuracoes';
    $('#migalha').innerHTML = cfg
      ? `<button class="raiz" data-ir="">${esc(CENTRAL.nome)}</button><span class="barra">/</span><span class="atual">${ic('gear')}Configurações</span>`
      : s
      ? `<button class="raiz" data-ir="">${esc(CENTRAL.nome)}</button><span class="barra">/</span>
         <span class="atual"><i class="bolinha" style="background:${esc(s.cor)};box-shadow:0 0 10px ${esc(s.cor)}"></i>${esc(s.nome)}</span>`
      : `<span class="atual">${esc(CENTRAL.nome)}</span>`;
    $$('.topo-acoes .ic-btn').forEach((b) => { b.hidden = !s; });
    $('#relogio').style.display = (s || cfg) ? '' : 'none';
    $$('.trilho .dock[data-ir]').forEach((d) => {
      d.classList.toggle('ativo', d.dataset.ir === estado.atual);
      d.classList.toggle('carregado', !!estado.quadros[d.dataset.ir]);
    });
    $('.logo').classList.toggle('ativo', !s && !cfg);
    $('.dock-cfg').classList.toggle('ativo', cfg);
    $$('.cartao').forEach((c) => c.classList.toggle('carregado', !!estado.quadros[c.dataset.ir]));
  }

  // ---------- barra de carregamento ----------
  let tCarga;
  function inicioCarga(cor) {
    const b = $('#carga');
    b.style.setProperty('--c', cor);
    b.className = 'barra-carga';
    void b.offsetWidth;
    b.classList.add('ativa');
    clearTimeout(tCarga);
    tCarga = setTimeout(fimCarga, 8000);
  }
  function fimCarga() {
    const b = $('#carga');
    b.classList.add('fim');
    clearTimeout(tCarga);
    setTimeout(() => { b.className = 'barra-carga'; }, 700);
  }

  // ---------- ações do topo ----------
  function acao(nome) {
    const s = estado.atual && porId(estado.atual);
    const q = s && estado.quadros[s.id];
    if (nome === 'paleta') return abrirPaleta();
    if (!s) return;
    if (nome === 'recarregar') {
      inicioCarga(s.cor);
      try { q.contentWindow.location.reload(); } catch (e) { q.src = s.caminho; }
    } else if (nome === 'nova-aba') {
      window.open(s.caminho, '_blank', 'noopener');
    } else if (nome === 'tela-cheia') {
      if (q.requestFullscreen) q.requestFullscreen().catch(() => {});
    } else if (nome === 'fechar') {
      fecharSistema(s.id);
    }
  }

  // ---------- paleta de comandos ----------
  let selPaleta = 0;
  let itensPaleta = [];

  function abrirPaleta() {
    const veu = $('#paleta');
    veu.hidden = false;
    const inp = $('#paleta-busca');
    inp.value = '';
    renderPaleta('');
    setTimeout(() => inp.focus(), 10);
  }
  function fecharPaleta() { $('#paleta').hidden = true; }

  function renderPaleta(termo) {
    const t = semAcento(termo.trim());
    const base = [{ id: '', nome: 'Início', desc: 'Tela inicial com todos os sistemas', icone: 'home', cor: 'var(--lima)' }]
      .concat(SISTEMAS.map((s, i) => Object.assign({ tecla: i + 1 }, s)))
      .concat([{ id: 'configuracoes', nome: 'Configurações', desc: 'Usuários, senhas e acessos aos sistemas', icone: 'gear', cor: 'var(--lima)' }]);
    itensPaleta = base.filter((s) => !t || semAcento([s.nome, s.curto, s.desc, (s.recursos || []).join(' ')].join(' ')).includes(t));
    selPaleta = Math.min(selPaleta, Math.max(itensPaleta.length - 1, 0));
    if (t) selPaleta = 0;
    $('#paleta-lista').innerHTML = itensPaleta.length
      ? '<div class="paleta-grupo">Sistemas</div>' + itensPaleta.map((s, i) => `
        <button class="paleta-item${i === selPaleta ? ' sel' : ''}" data-i="${i}" style="--c:${esc(s.cor)}">
          <span class="pi-ic">${ic(s.icone)}</span>
          <span class="pi-txt"><div class="pi-nome">${esc(s.nome)}</div><div class="pi-desc">${esc(s.desc)}</div></span>
          ${estado.quadros[s.id] ? '<span class="mudo" style="font-size:11px;color:var(--c)">aberto</span>' : ''}
          ${s.tecla ? '<kbd>' + TECLA_ALT + ' ' + s.tecla + '</kbd>' : ''}
        </button>`).join('')
      : '<div class="paleta-vazia">Nenhum sistema encontrado.</div>';
  }

  function escolherPaleta(i) {
    const s = itensPaleta[i];
    if (!s) return;
    fecharPaleta();
    irPara(s.id);
  }

  // ---------- atalhos de teclado ----------
  function tratarTecla(e, dentroDoQuadro) {
    const k = e.key;
    if ((e.ctrlKey || e.metaKey) && k.toLowerCase() === 'k') {
      e.preventDefault();
      $('#paleta').hidden ? abrirPaleta() : fecharPaleta();
      return;
    }
    if (e.altKey && /^[1-9]$/.test(k)) {
      const s = SISTEMAS[Number(k) - 1];
      if (s) { e.preventDefault(); fecharPaleta(); irPara(s.id); }
      return;
    }
    if (e.altKey && (k === '0' || k === 'Home')) { e.preventDefault(); irPara(''); return; }
    if (dentroDoQuadro) return;

    if (!$('#paleta').hidden) {
      if (k === 'Escape') { e.preventDefault(); fecharPaleta(); }
      else if (k === 'ArrowDown' || k === 'ArrowUp') {
        e.preventDefault();
        if (!itensPaleta.length) return;
        selPaleta = (selPaleta + (k === 'ArrowDown' ? 1 : -1) + itensPaleta.length) % itensPaleta.length;
        $$('.paleta-item').forEach((el, i) => el.classList.toggle('sel', i === selPaleta));
        const sel = $('.paleta-item.sel'); if (sel) sel.scrollIntoView({ block: 'nearest' });
      } else if (k === 'Enter') { e.preventDefault(); escolherPaleta(selPaleta); }
      return;
    }

    const digitando = /^(INPUT|TEXTAREA|SELECT)$/.test((document.activeElement || {}).tagName || '');
    if (!estado.atual && !digitando && !e.ctrlKey && !e.metaKey && !e.altKey && /^[1-9]$/.test(k)) {
      const s = SISTEMAS[Number(k) - 1];
      if (s) irPara(s.id);
    }
  }

  // Repassa os atalhos globais quando o foco está dentro de um sistema
  function ligarAtalhosNoQuadro(q) {
    try {
      q.contentWindow.document.addEventListener('keydown', (e) => tratarTecla(e, true));
    } catch (e) { /* sistema em outro domínio: atalhos só funcionam fora dele */ }
  }

  // ---------- eventos ----------
  function ligarEventos() {
    document.addEventListener('click', (e) => {
      const ir = e.target.closest('[data-ir]');
      if (ir) { irPara(ir.dataset.ir); return; }
      const ac = e.target.closest('[data-acao]');
      if (ac) { acao(ac.dataset.acao); return; }
      const pi = e.target.closest('.paleta-item');
      if (pi) { escolherPaleta(Number(pi.dataset.i)); return; }
      if (e.target.id === 'paleta') fecharPaleta();
    });
    document.addEventListener('keydown', (e) => tratarTecla(e, false));
    $('#paleta-busca').addEventListener('input', (e) => renderPaleta(e.target.value));
    $('#paleta-lista').addEventListener('mousemove', (e) => {
      const pi = e.target.closest('.paleta-item');
      if (pi && Number(pi.dataset.i) !== selPaleta) {
        selPaleta = Number(pi.dataset.i);
        $$('.paleta-item').forEach((el, i) => el.classList.toggle('sel', i === selPaleta));
      }
    });
    // brilho que acompanha o mouse nos cartões
    $$('.cartao').forEach((c) => c.addEventListener('pointermove', (e) => {
      const r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }));
    window.addEventListener('hashchange', aplicarRota);
  }

  function iniciar() { montar(); aplicarRota(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
