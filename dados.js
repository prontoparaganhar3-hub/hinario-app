/* ============================================================
   HINÁRIO DIGITAL — dados.js
   ------------------------------------------------------------
   LEIA ISTO ANTES DE EDITAR:

   1) Por respeito a direitos autorais de letras de música
      (mesmo hinos antigos), este arquivo NÃO vem com letras
      reais pré-escritas. Toda "letra" está como placeholder
      "COLE_AQUI_A_LETRA_DO_HINO_X" — você cola o texto oficial
      da sua Harpa Cristã impressa ou do hinário do ministério.

   2) A Harpa Cristã tem 640 hinos. Abaixo, a função
      gerarEsqueletoHarpa() já cria os 640 números prontos,
      só faltando você preencher "titulo" e "letra" de cada um.
      Isso evita number/título errado por engano — você preenche
      direto da fonte oficial que você já tem em mãos.

   3) Estrutura de cada hino:
      {
        numero: 1,
        titulo: "Título do hino",
        categoria: "harpa" | "senhoras" | "jovens" | "adolescentes" | "criancas",
        tom: "Ré Maior",              // opcional, pode deixar ""
        letra: [                      // cada item é uma estrofe
          "Linha 1 da estrofe\nLinha 2\nLinha 3\nLinha 4"
        ],
        coro: "Linha 1 do coro\nLinha 2 do coro"   // opcional, "" se não tiver
      }
   ============================================================ */

// ---------- 1. ESQUELETO COMPLETO DA HARPA CRISTÃ (640 hinos) ----------
function gerarEsqueletoHarpa() {
  const total = 640;
  const hinos = [];
  for (let n = 1; n <= total; n++) {
    hinos.push({
      numero: n,
      titulo: `COLE_AQUI_O_TITULO_DO_HINO_${n}`,
      categoria: "harpa",
      tom: "",
      letra: [`COLE_AQUI_A_LETRA_DO_HINO_${n}_ESTROFE_1`],
      coro: ""
    });
  }
  return hinos;
}

// ---------- 2. EXEMPLO PREENCHIDO (para você ver o padrão) ----------
// Este é um hino FICTÍCIO de demonstração, só para mostrar como
// preencher corretamente. Substitua pelos hinos reais.
const hinoExemploPreenchido = {
  numero: 1,
  titulo: "Exemplo — Substitua Pelo Título Real do Hino 1",
  categoria: "harpa",
  tom: "Sol Maior",
  letra: [
    "COLE_AQUI_A_1ª_ESTROFE_COMPLETA_DO_HINO_1\nLINHA_2\nLINHA_3\nLINHA_4",
    "COLE_AQUI_A_2ª_ESTROFE_COMPLETA_DO_HINO_1\nLINHA_2\nLINHA_3\nLINHA_4"
  ],
  coro: "COLE_AQUI_O_CORO_DO_HINO_1_SE_HOUVER\nLINHA_2_DO_CORO"
};

// Monta a lista da Harpa Cristã e já injeta o exemplo preenchido na posição 1
const harpaCrista = gerarEsqueletoHarpa();
harpaCrista[0] = hinoExemploPreenchido;

// ---------- 3. OUTROS MINISTÉRIOS ----------
// Mesmo esquema: preencha "titulo" e "letra" com o cancioneiro
// oficial de cada ministério da sua igreja.
function gerarEsqueletoMinisterio(categoria, quantidade) {
  const lista = [];
  for (let n = 1; n <= quantidade; n++) {
    lista.push({
      numero: n,
      titulo: `COLE_AQUI_O_TITULO_${categoria.toUpperCase()}_${n}`,
      categoria,
      tom: "",
      letra: [`COLE_AQUI_A_LETRA_${categoria.toUpperCase()}_${n}_ESTROFE_1`],
      coro: ""
    });
  }
  return lista;
}

const cantSenhoras = gerarEsqueletoMinisterio("senhoras", 6);
const cantJovens = gerarEsqueletoMinisterio("jovens", 6);
const cantAdolescentes = gerarEsqueletoMinisterio("adolescentes", 6);
const cantCriancas = gerarEsqueletoMinisterio("criancas", 6);

// ---------- 4. METADADOS DOS MINISTÉRIOS (cards da Home) ----------
const ministerios = [
  { id: "harpa", nome: "Harpa Cristã", icone: "🎼", classe: "harpa", temLogo: true },
  { id: "senhoras", nome: "Senhoras", icone: "🌷", classe: "senhoras", temLogo: true },
  { id: "jovens", nome: "Jovens", icone: "🔥", classe: "jovens", temLogo: true },
  { id: "adolescentes", nome: "Adolescentes", icone: "⭐", classe: "adolescentes", temLogo: true },
  { id: "criancas", nome: "Crianças", icone: "🎈", classe: "criancas", temLogo: true },
  { id: "favoritos", nome: "Favoritos", icone: "❤️", classe: "favoritos", temLogo: false }
  /* "Casais" ainda não entrou aqui — a imagem casais-logo-NAO-USADO-AINDA.png
     já está na pasta /img, só falta confirmar se este card deve existir. */
];

// ---------- 5. AVISOS DA IGREJA ----------
// Texto livre (não é letra de música), pode editar como quiser.
// Troque a "imagem" pela foto/banner real do evento.
const avisos = [
  {
    id: "aviso-1",
    data: "24 de Agosto",
    titulo: "Culto de Jovens — Noite de Adoração",
    texto:
      "Neste sábado teremos uma noite especial de adoração e ministração da Palavra, às 19h30, no templo sede. Convide um amigo!",
    imagem: "/* COLOQUE_O_LINK_DA_IMAGEM_DO_AVISO_1_AQUI */"
  },
  {
    id: "aviso-2",
    data: "01 de Setembro",
    titulo: "Encontro de Senhoras",
    texto:
      "Encontro mensal do ministério de senhoras, com um momento de comunhão, ensino da Palavra e oração. Todas estão convidadas.",
    imagem: "/* COLOQUE_O_LINK_DA_IMAGEM_DO_AVISO_2_AQUI */"
  },
  {
    id: "aviso-3",
    data: "07 de Setembro",
    titulo: "Ceia do Senhor",
    texto:
      "Neste domingo, no culto da noite, celebraremos a Santa Ceia. Venha se preparar em oração durante a semana.",
    imagem: "/* COLOQUE_O_LINK_DA_IMAGEM_DO_AVISO_3_AQUI */"
  }
];

// ---------- 6. EXPORTA TUDO PARA O app.js USAR ----------
const BASE_DE_DADOS = {
  ministerios,
  avisos,
  hinos: {
    harpa: harpaCrista,
    senhoras: cantSenhoras,
    jovens: cantJovens,
    adolescentes: cantAdolescentes,
    criancas: cantCriancas
  }
};
