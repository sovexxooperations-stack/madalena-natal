(() => {
  const dados = JSON.parse(document.getElementById("dados").textContent);
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* Tradicional / mais leve */
  const seccao = $("#versoes");
  const botoes = $$(".troca button");
  const escolher = (v, foco) => {
    seccao.dataset.versao = v;
    botoes.forEach((b) => {
      const ativo = b.dataset.versao === v;
      b.setAttribute("aria-checked", String(ativo));
      b.tabIndex = ativo ? 0 : -1;
      if (ativo && foco) b.focus();
    });
    $("#versao-desc").textContent = dados.rabanadas[v].desc;
    dados.rabanadas[v].medidas.forEach((m, i) => {
      const el = $$(".medida")[i];
      $("dd", el).textContent = m.texto;
      $("i", el).style.width = `${m.pct}%`;
    });
  };
  botoes.forEach((b) => {
    b.addEventListener("click", () => escolher(b.dataset.versao));
    b.addEventListener("keydown", (e) => {
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;
      e.preventDefault();
      escolher(b.dataset.versao === "t" ? "l" : "t", true);
    });
  });
  escolher("t");

  /* Filtro por capítulo */
  const chips = $$(".chips button");
  const azulejos = $$(".azulejo");
  chips.forEach((c) => c.addEventListener("click", () => {
    chips.forEach((x) => x.setAttribute("aria-pressed", String(x === c)));
    azulejos.forEach((a) => {
      a.dataset.apagado = String(Boolean(c.dataset.cap) && a.dataset.cap !== c.dataset.cap);
    });
  }));

  /* Ficha do prato */
  const dialogo = $("#prato");
  const abrir = (n) => {
    const r = dados.receitas[n];
    const img = $("#prato-img");
    img.src = `assets/pratos/${String(n).padStart(2, "0")}.webp`;
    img.alt = r.nome;
    $("#prato-cap").textContent = r.capitulo;
    $("#prato-nome").textContent = r.nome;
    $("#prato-meta").textContent = r.meta;
    $("#prato-leve").textContent = r.leve;
    $("#prato-muda").textContent = r.muda;
    $("#prato-kcal").textContent = `Por ${r.unidade}: cerca de ${r.kcalT} kcal na tradicional e ${r.kcalL} kcal na mais leve (estimativa).`;
    dialogo.showModal();
  };
  azulejos.forEach((a) => a.addEventListener("click", () => abrir(a.dataset.n)));
  $("#prato-fechar").addEventListener("click", () => dialogo.close());
  dialogo.addEventListener("click", (e) => { if (e.target === dialogo) dialogo.close(); });

  /* Barra de compra no telemóvel: aparece depois do topo e sai junto ao pedido */
  const barra = $("#barra");
  const visivel = { hero: true, pedido: false };
  const atualizar = () => { barra.hidden = visivel.hero || visivel.pedido; };
  const obs = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => {
      if (e.target.classList.contains("hero-compra")) visivel.hero = e.isIntersecting;
      else visivel.pedido = e.isIntersecting;
    });
    atualizar();
  });
  obs.observe($(".hero-compra"));
  obs.observe($("#pedido"));

  /* Compra: pede a entrega imediata e, em pré-visualização, não sai da página */
  const comprar = $("#comprar");
  const consentimento = $("#consentimento");
  const aviso = $("#aviso-checkout");
  const mostrar = (texto) => { aviso.textContent = texto; aviso.hidden = false; };
  consentimento.addEventListener("change", () => { if (consentimento.checked) aviso.hidden = true; });
  comprar.addEventListener("click", (e) => {
    if (!consentimento.checked) {
      e.preventDefault();
      mostrar("Marca a caixa da entrega imediata para continuar.");
      consentimento.focus();
    } else if (comprar.dataset.publicado !== "sim") {
      e.preventDefault();
      mostrar("Esta página é uma pré-visualização. O livro ainda não está à venda.");
    }
  });
})();
