/* ============================================================
   HINÁRIO DIGITAL — app.js
   Toda a lógica do app. Depende de dados.js (BASE_DE_DADOS).
   ============================================================ */

(function () {
  "use strict";

  // ---------- ESTADO ----------
  const state = {
    currentTab: "home", // home | ministerio | favoritos | avisos
    currentCategoria: null, // 'harpa' | 'senhoras' | ...
    searchTerm: "",
    fontSize: parseInt(localStorage.getItem("hinario:fontSize") || "19", 10),
    theme: localStorage.getItem("hinario:theme") || "light",
    favoritos: JSON.parse(localStorage.getItem("hinario:favoritos") || "[]")
  };

  // ---------- HELPERS ----------
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  function favKey(categoria, numero) {
    return `${categoria}:${numero}`;
  }

  function isFavorito(categoria, numero) {
    return state.favoritos.includes(favKey(categoria, numero));
  }

  function toggleFavorito(categoria, numero) {
    const key = favKey(categoria, numero);
    const idx = state.favoritos.indexOf(key);
    if (idx >= 0) {
      state.favoritos.splice(idx, 1);
    } else {
      state.favoritos.push(key);
    }
    localStorage.setItem("hinario:favoritos", JSON.stringify(state.favoritos));
  }

  function todosOsHinos() {
    return Object.values(BASE_DE_DADOS.hinos).flat();
  }

  function buscarHinoPorChave(chave) {
    const [categoria, numeroStr] = chave.split(":");
    const numero = parseInt(numeroStr, 10);
    return (BASE_DE_DADOS.hinos[categoria] || []).find((h) => h.numero === numero);
  }

  function showToast(msg) {
    const toast = $("#toast");
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove("show"), 1800);
  }

  // ---------- TEMA (Dark / Light) ----------
  function applyTheme() {
    document.documentElement.setAttribute("data-theme", state.theme);
    $("#themeToggle").innerHTML = state.theme === "dark" ? ICONS.sun : ICONS.moon;
  }

  function toggleTheme() {
    state.theme = state.theme === "dark" ? "light" : "dark";
    localStorage.setItem("hinario:theme", state.theme);
    applyTheme();
  }

  // ---------- NAVEGAÇÃO ENTRE ABAS ----------
  function goToTab(tab, categoria) {
    state.currentTab = tab;
    state.currentCategoria = categoria || null;
    state.searchTerm = "";
    $("#searchInput").value = "";
    telaAntesDaBusca = null;

    $$(".screen").forEach((s) => s.classList.add("hidden"));
    $$(".nav-btn").forEach((b) => b.classList.remove("active"));

    if (tab === "home") {
      $("#screen-home").classList.remove("hidden");
      $('.nav-btn[data-tab="home"]').classList.add("active");
    } else if (tab === "lista") {
      $("#screen-lista").classList.remove("hidden");
      renderLista();
    } else if (tab === "favoritos") {
      $("#screen-favoritos").classList.remove("hidden");
      $('.nav-btn[data-tab="favoritos"]').classList.add("active");
      renderFavoritos();
    } else if (tab === "avisos") {
      $("#screen-avisos").classList.remove("hidden");
      $('.nav-btn[data-tab="avisos"]').classList.add("active");
      renderAvisos();
    }

    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  }

  // ---------- RENDER: HOME ----------
  function renderHome() {
    const grid = $("#ministryGrid");
    grid.innerHTML = BASE_DE_DADOS.ministerios
      .map((m) => {
        const qtd =
          m.id === "favoritos"
            ? state.favoritos.length
            : (BASE_DE_DADOS.hinos[m.id] || []).length;
        const logoClass = m.temLogo ? "has-logo" : "";
        return `
          <button class="ministry-card ${m.classe} ${logoClass}" data-ministerio="${m.id}">
            <span class="m-icon">${m.icone}</span>
            <span class="m-name">${m.nome}</span>
            <span class="m-count">${qtd} ${qtd === 1 ? "hino" : "hinos"}</span>
          </button>`;
      })
      .join("");

    $$(".ministry-card", grid).forEach((card) => {
      card.addEventListener("click", () => {
        const id = card.dataset.ministerio;
        if (id === "favoritos") {
          goToTab("favoritos");
        } else {
          goToTab("lista", id);
        }
      });
    });
  }

  // ---------- RENDER: LISTA DE HINOS (com busca) ----------
  function renderLista() {
    const categoria = state.currentCategoria;
    const meta = BASE_DE_DADOS.ministerios.find((m) => m.id === categoria);
    $("#listaTitulo").textContent = meta ? meta.nome : "Hinos";

    const termo = state.searchTerm.trim().toLowerCase();
    let hinos = BASE_DE_DADOS.hinos[categoria] || [];

    if (termo) {
      hinos = hinos.filter((h) => {
        const noTexto = String(h.numero).includes(termo);
        const noTitulo = h.titulo.toLowerCase().includes(termo);
        const naLetra = h.letra.join(" ").toLowerCase().includes(termo);
        return noTexto || noTitulo || naLetra;
      });
    }

    const container = $("#listaHinos");
    if (hinos.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="big">🔍</div>
          <p>Nenhum hino encontrado para "${state.searchTerm}".</p>
        </div>`;
      return;
    }

    container.innerHTML = hinos
      .map((h) => hymnRowHTML(h, categoria))
      .join("");

    bindHymnRowEvents(container, categoria);
  }

  function hymnRowHTML(h, categoria) {
    const fav = isFavorito(categoria, h.numero);
    return `
      <div class="hymn-row" data-numero="${h.numero}" data-categoria="${categoria}">
        <div class="hymn-number">${h.numero}</div>
        <div class="hymn-info">
          <div class="t">${escapeHtml(h.titulo)}</div>
          <div class="sub">${meta_nomeCategoria(categoria)}</div>
        </div>
        <button class="fav-toggle ${fav ? "active" : ""}" data-fav="${h.numero}" aria-label="Favoritar">
          ${fav ? "♥" : "♡"}
        </button>
      </div>`;
  }

  function meta_nomeCategoria(categoria) {
    const m = BASE_DE_DADOS.ministerios.find((x) => x.id === categoria);
    return m ? m.nome : categoria;
  }

  function bindHymnRowEvents(container, categoriaPadrao) {
    $$(".hymn-row", container).forEach((row) => {
      row.addEventListener("click", (e) => {
        if (e.target.closest(".fav-toggle")) return;
        const numero = parseInt(row.dataset.numero, 10);
        const categoria = row.dataset.categoria || categoriaPadrao;
        abrirHino(categoria, numero);
      });
    });
    $$(".fav-toggle", container).forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const row = btn.closest(".hymn-row");
        const numero = parseInt(row.dataset.numero, 10);
        const categoria = row.dataset.categoria || categoriaPadrao;
        toggleFavorito(categoria, numero);
        btn.classList.toggle("active");
        btn.textContent = btn.classList.contains("active") ? "♥" : "♡";
        if (state.currentTab === "favoritos") renderFavoritos();
      });
    });
  }

  // ---------- BUSCA GLOBAL (todos os ministérios de uma vez) ----------
  // Não filtra "favoritos" (não é um cancioneiro) nem duplica hinos.
  function buscarEmTodosMinisterios(termo) {
    const termoLower = termo.trim().toLowerCase();
    const resultados = [];
    Object.keys(BASE_DE_DADOS.hinos).forEach((categoria) => {
      BASE_DE_DADOS.hinos[categoria].forEach((h) => {
        const noNumero = String(h.numero).includes(termoLower);
        const noTitulo = h.titulo.toLowerCase().includes(termoLower);
        const naLetra = h.letra.join(" ").toLowerCase().includes(termoLower);
        if (noNumero || noTitulo || naLetra) {
          resultados.push({ hino: h, categoria });
        }
      });
    });
    return resultados;
  }

  function renderBuscaGlobal(termo) {
    // Reaproveita a tela de lista, mas mostrando resultados de TODOS os ministérios
    $$(".screen").forEach((s) => s.classList.add("hidden"));
    $$(".nav-btn").forEach((b) => b.classList.remove("active"));
    $("#screen-lista").classList.remove("hidden");

    const resultados = buscarEmTodosMinisterios(termo);
    $("#listaTitulo").textContent = `Busca: "${termo}"`;

    const container = $("#listaHinos");
    if (resultados.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="big">🔍</div>
          <p>Nenhum hino encontrado em nenhum ministério para "${escapeHtml(termo)}".</p>
        </div>`;
      return;
    }

    container.innerHTML = resultados
      .map(({ hino, categoria }) => hymnRowHTML(hino, categoria))
      .join("");

    bindHymnRowEvents(container, null);
  }

  // ---------- RENDER: FAVORITOS ----------
  function renderFavoritos() {
    const container = $("#listaFavoritos");
    if (state.favoritos.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="big">🤍</div>
          <p>Você ainda não tem hinos favoritos.<br>Toque no coração de um hino para salvá-lo aqui.</p>
        </div>`;
      return;
    }

    const html = state.favoritos
      .map((key) => {
        const [categoria] = key.split(":");
        const hino = buscarHinoPorChave(key);
        if (!hino) return "";
        return hymnRowHTML(hino, categoria);
      })
      .join("");

    container.innerHTML = html || `
      <div class="empty-state"><div class="big">🤍</div><p>Nenhum favorito válido encontrado.</p></div>`;

    bindHymnRowEvents(container, null);
  }

  // ---------- RENDER: AVISOS ----------
  function renderAvisos() {
    const container = $("#listaAvisos");
    container.innerHTML = BASE_DE_DADOS.avisos
      .map(
        (a) => `
        <div class="aviso-card">
          <div class="aviso-banner" style="background-image:url('${a.imagem}')"></div>
          <div class="aviso-body">
            <div class="date">${escapeHtml(a.data)}</div>
            <h3>${escapeHtml(a.titulo)}</h3>
            <p>${escapeHtml(a.texto)}</p>
          </div>
        </div>`
      )
      .join("");
  }

  // ---------- LEITOR DE HINO ----------
  function abrirHino(categoria, numero) {
    const hino = (BASE_DE_DADOS.hinos[categoria] || []).find((h) => h.numero === numero);
    if (!hino) return;

    $("#readerNumero").textContent = `Hino ${hino.numero} · ${meta_nomeCategoria(categoria)}`;
    $("#readerTitulo").textContent = hino.titulo;

    const versos = hino.letra
      .map((v) => `<p class="verse">${escapeHtml(v)}</p>`)
      .join("");
    const coro = hino.coro
      ? `<p class="verse chorus">${escapeHtml(hino.coro)}</p>`
      : "";
    const aviso = `
      <div class="placeholder-note">
        💡 Preencha o título e a letra deste hino no arquivo <strong>dados.js</strong>
        (hino nº ${hino.numero}) usando o texto oficial da sua Harpa Cristã / hinário.
      </div>`;

    $("#readerBody").innerHTML = versos + coro + aviso;

    const favBtn = $("#readerFav");
    const fav = isFavorito(categoria, numero);
    favBtn.classList.toggle("active", fav);
    favBtn.innerHTML = fav ? "♥" : "♡";
    favBtn.onclick = () => {
      toggleFavorito(categoria, numero);
      const nowFav = isFavorito(categoria, numero);
      favBtn.classList.toggle("active", nowFav);
      favBtn.innerHTML = nowFav ? "♥" : "♡";
      showToast(nowFav ? "Adicionado aos favoritos" : "Removido dos favoritos");
      if (state.currentTab === "lista") renderLista();
      if (state.currentTab === "favoritos") renderFavoritos();
    };

    applyFontSize();
    $("#hymnReader").classList.add("open");
  }

  function fecharHino() {
    $("#hymnReader").classList.remove("open");
  }

  function applyFontSize() {
    document.documentElement.style.setProperty("--reading-font-size", state.fontSize + "px");
  }

  function mudarFonte(delta) {
    state.fontSize = Math.min(30, Math.max(14, state.fontSize + delta));
    localStorage.setItem("hinario:fontSize", String(state.fontSize));
    applyFontSize();
  }

  // ---------- BUSCA ----------
  // A barra de busca do cabeçalho funciona em QUALQUER tela: digitou,
  // pesquisa em todos os ministérios ao mesmo tempo (Harpa, Senhoras,
  // Jovens, Adolescentes, Crianças), sem precisar abrir um específico.
  let searchDebounce = null;
  let telaAntesDaBusca = null; // pra voltar pro lugar certo ao apagar a busca

  function onSearchInput(value) {
    state.searchTerm = value;
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => {
      const termo = value.trim();

      if (termo.length === 0) {
        // Campo de busca vazio: volta pra onde o usuário estava
        if (telaAntesDaBusca) {
          goToTab(telaAntesDaBusca.tab, telaAntesDaBusca.categoria);
          telaAntesDaBusca = null;
        }
        return;
      }

      // Guarda onde o usuário estava ANTES de começar a digitar,
      // só na primeira letra da busca
      if (!telaAntesDaBusca) {
        telaAntesDaBusca = { tab: state.currentTab, categoria: state.currentCategoria };
      }

      renderBuscaGlobal(termo);
    }, 60); // debounce curto: filtragem em tempo real, sem travar
  }

  // ---------- SEGURANÇA: evitar injeção de HTML nos textos ----------
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  // ---------- ÍCONES SVG INLINE ----------
  const ICONS = {
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>'
  };

  // ---------- INICIALIZAÇÃO ----------
  function init() {
    applyTheme();
    applyFontSize();
    renderHome();
    goToTab("home");

    $("#themeToggle").addEventListener("click", toggleTheme);
    $("#searchInput").addEventListener("input", (e) => onSearchInput(e.target.value));
    $("#backFromLista").addEventListener("click", () => goToTab("home"));
    $("#closeReader").addEventListener("click", fecharHino);
    $("#fontMinus").addEventListener("click", () => mudarFonte(-1));
    $("#fontPlus").addEventListener("click", () => mudarFonte(1));

    $$(".nav-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const tab = btn.dataset.tab;
        if (tab === "home") goToTab("home");
        if (tab === "favoritos") goToTab("favoritos");
        if (tab === "avisos") goToTab("avisos");
      });
    });

    // Registra o Service Worker (PWA offline)
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("./sw.js")
          .catch((err) => console.warn("Falha ao registrar o Service Worker:", err));
      });
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();