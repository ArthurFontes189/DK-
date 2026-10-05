// ============================================================================
// SERVIÇO DE CACHE E ESTADO EM MEMÓRIA (OFFLINE-FIRST CAPABILITY)
// DK Revestimentos - Mídias Reais do Google Drive com Títulos Ajustados
// ============================================================================

const DEFAULT_REAL_PORTFOLIO = [
  {
    id: 1,
    titulo: "Tour em Vídeo: Ambiente Planejado Sob Medida",
    categoria: "Marcenaria Sob Medida",
    tipoMidia: "video",
    proporcao: "vertical",
    midiaUrl: "https://drive.google.com/file/d/1-RgNwqu-yqW4O7axmiJ4LZcirHDD5QaS/preview",
    posterUrl: "assets/portfolio/poster_VID-20261004-WA0053.jpg",
    gdriveId: "1-RgNwqu-yqW4O7axmiJ4LZcirHDD5QaS",
    gdriveLink: "https://drive.google.com/file/d/1-RgNwqu-yqW4O7axmiJ4LZcirHDD5QaS/view?usp=drivesdk",
    descricao: "Vídeo vertical destacando acabamento refinado, aproveitamento inteligente de espaço e iluminação integrada.",
    tipoRegistro: "ambiente_finalizado"
  },
  {
    id: 2,
    titulo: "Painel e Revestimento em Madeira Nobre",
    categoria: "Painéis & Revestimentos",
    tipoMidia: "video",
    proporcao: "vertical",
    midiaUrl: "https://drive.google.com/file/d/1W-Wfu-bxrmqwkW8HfAsaOHDPqRW0zjkv/preview",
    posterUrl: "assets/portfolio/poster_VID-20261004-WA0024.jpg",
    gdriveId: "1W-Wfu-bxrmqwkW8HfAsaOHDPqRW0zjkv",
    gdriveLink: "https://drive.google.com/file/d/1W-Wfu-bxrmqwkW8HfAsaOHDPqRW0zjkv/view?usp=drivesdk",
    descricao: "Marcenaria de alto padrão com revestimento ripado, alinhamento milimétrico e sistema de passagem oculta.",
    tipoRegistro: "ambiente_finalizado"
  },
  {
    id: 3,
    titulo: "Tour Panorâmico: Mobiliário Sob Medida",
    categoria: "Marcenaria Sob Medida",
    tipoMidia: "video",
    proporcao: "horizontal",
    midiaUrl: "https://drive.google.com/file/d/14TPKO6E7hUDjcHqkw558chwjqZLSD5MJ/preview",
    posterUrl: "assets/portfolio/poster_VID-20261004-WA0021.jpg",
    gdriveId: "14TPKO6E7hUDjcHqkw558chwjqZLSD5MJ",
    gdriveLink: "https://drive.google.com/file/d/14TPKO6E7hUDjcHqkw558chwjqZLSD5MJ/view?usp=drivesdk",
    descricao: "Visão panorâmica em vídeo demonstrando fluidez espacial, nichos sob medida e armários planejados.",
    tipoRegistro: "ambiente_finalizado"
  },
  {
    id: 4,
    titulo: "Detalhamento e Acabamento de Marcenaria Fina",
    categoria: "Marcenaria Sob Medida",
    tipoMidia: "video",
    proporcao: "vertical",
    midiaUrl: "https://drive.google.com/file/d/1dML6s-wxahq_tJtpFw0XHM8QXFewdHn_/preview",
    posterUrl: "assets/portfolio/poster_VID-20261004-WA0022.jpg",
    gdriveId: "1dML6s-wxahq_tJtpFw0XHM8QXFewdHn_",
    gdriveLink: "https://drive.google.com/file/d/1dML6s-wxahq_tJtpFw0XHM8QXFewdHn_/view?usp=drivesdk",
    descricao: "Demonstração prática de corrediças ocultas, amortecimento suave e encaixes de alta precisão.",
    tipoRegistro: "detalhe_acabamento"
  },
  {
    id: 5,
    titulo: "Portão e Painel em Madeira para Área Externa",
    categoria: "Áreas Externas",
    tipoMidia: "video",
    proporcao: "horizontal",
    midiaUrl: "https://drive.google.com/file/d/1eyvDs5Q7en3ilnhku_Mt3PzDYOc0VnFe/preview",
    posterUrl: "assets/portfolio/poster_VID-20261004-WA0023.jpg",
    gdriveId: "1eyvDs5Q7en3ilnhku_Mt3PzDYOc0VnFe",
    gdriveLink: "https://drive.google.com/file/d/1eyvDs5Q7en3ilnhku_Mt3PzDYOc0VnFe/view?usp=drivesdk",
    descricao: "Estrutura ripada em madeira maciça com tratamento para intempéries e acabamento refinado para áreas abertas.",
    tipoRegistro: "processo_fabricacao"
  },
  {
    id: 6,
    titulo: "Projeto em Madeira para Área Externa",
    categoria: "Áreas Externas",
    tipoMidia: "video",
    proporcao: "horizontal",
    midiaUrl: "https://drive.google.com/file/d/1KYP9CVH94EqBlIJno7avKsTkxYf6xFCs/preview",
    posterUrl: "assets/portfolio/IMG-20261004-WA0006.jpg",
    gdriveId: "1KYP9CVH94EqBlIJno7avKsTkxYf6xFCs",
    gdriveLink: "https://drive.google.com/file/d/1KYP9CVH94EqBlIJno7avKsTkxYf6xFCs/view?usp=drivesdk",
    descricao: "Execução completa de marcenaria externa em madeira nobre tratada, unindo resistência e estética natural.",
    tipoRegistro: "ambiente_finalizado"
  },
  {
    id: 7,
    titulo: "Deck e Estrutura em Madeira Maciça",
    categoria: "Áreas Externas",
    tipoMidia: "foto",
    proporcao: "vertical",
    midiaUrl: "assets/portfolio/IMG-20261004-WA0006.jpg",
    posterUrl: "assets/portfolio/IMG-20261004-WA0006.jpg",
    gdriveId: "1vD0o54VW9e0CoLFHr4NxvEqF5c3qmfs2",
    gdriveLink: "https://drive.google.com/file/d/1vD0o54VW9e0CoLFHr4NxvEqF5c3qmfs2/view?usp=drivesdk",
    descricao: "Projeto externo com réguas selecionadas de madeira nobre e acabamento protetor acetinado.",
    tipoRegistro: "ambiente_finalizado"
  },
  {
    id: 8,
    titulo: "Mobiliário Planejado para Sala de Estar",
    categoria: "Salas & Livings",
    tipoMidia: "foto",
    proporcao: "horizontal",
    midiaUrl: "assets/portfolio/IMG-20261004-WA0013.jpg",
    posterUrl: "assets/portfolio/IMG-20261004-WA0013.jpg",
    gdriveId: "18koAp3WQPfUI7-XGCsTJnkNdT3ag-n8j",
    gdriveLink: "https://drive.google.com/file/d/18koAp3WQPfUI7-XGCsTJnkNdT3ag-n8j/view?usp=drivesdk",
    descricao: "Linhas limpas, marcenaria sob medida e harmonização de texturas para ambientes integrados.",
    tipoRegistro: "foto_ampla"
  },
  {
    id: 9,
    titulo: "Bancada e Armários com Cava Integrada",
    categoria: "Salas & Livings",
    tipoMidia: "foto",
    proporcao: "horizontal",
    midiaUrl: "assets/portfolio/IMG-20261004-WA0014.jpg",
    posterUrl: "assets/portfolio/IMG-20261004-WA0014.jpg",
    gdriveId: "1p3Sr741KCf6hhjLtQy7OwzNSg6RkbX4f",
    gdriveLink: "https://drive.google.com/file/d/1p3Sr741KCf6hhjLtQy7OwzNSg6RkbX4f/view?usp=drivesdk",
    descricao: "Mobiliário autoral com acabamento fosco e puxadores esculpidos na própria madeira.",
    tipoRegistro: "foto_ampla"
  },
  {
    id: 10,
    titulo: "Armário Planejado com Portas Deslizantes",
    categoria: "Dormitórios & Closets",
    tipoMidia: "foto",
    proporcao: "vertical",
    midiaUrl: "assets/portfolio/IMG-20261004-WA0015.jpg",
    posterUrl: "assets/portfolio/IMG-20261004-WA0015.jpg",
    gdriveId: "19ExhkajsWto9piV8CBPzWXUkpnop4UcN",
    gdriveLink: "https://drive.google.com/file/d/19ExhkajsWto9piV8CBPzWXUkpnop4UcN/view?usp=drivesdk",
    descricao: "Marcenaria vertical com divisão funcional e esquadrias de alumínio para deslizamento silencioso.",
    tipoRegistro: "ambiente_finalizado"
  },
  {
    id: 11,
    titulo: "Módulo Sob Medida com Nichos Decorativos",
    categoria: "Marcenaria Sob Medida",
    tipoMidia: "foto",
    proporcao: "vertical",
    midiaUrl: "assets/portfolio/IMG-20261004-WA0016.jpg",
    posterUrl: "assets/portfolio/IMG-20261004-WA0016.jpg",
    gdriveId: "1QcLIs0It9t7nfIF7UfpcfGDHIXg7bp6u",
    gdriveLink: "https://drive.google.com/file/d/1QcLIs0It9t7nfIF7UfpcfGDHIXg7bp6u/view?usp=drivesdk",
    descricao: "Mobiliário planejado com nichos e encaixes precisos para organização de eletros e decoração.",
    tipoRegistro: "detalhe_acabamento"
  },
  {
    id: 12,
    titulo: "Espaço Gourmet com Marcenaria Exclusiva",
    categoria: "Cozinhas & Gourmet",
    tipoMidia: "foto",
    proporcao: "horizontal",
    midiaUrl: "assets/portfolio/IMG-20261004-WA0017.jpg",
    posterUrl: "assets/portfolio/IMG-20261004-WA0017.jpg",
    gdriveId: "1vRcS5p-vUlI8gA0JD0hHSV_MHLbN-D61",
    gdriveLink: "https://drive.google.com/file/d/1vRcS5p-vUlI8gA0JD0hHSV_MHLbN-D61/view?usp=drivesdk",
    descricao: "Bancadas planejadas e gabinetes sob medida projetados para funcionalidade e durabilidade.",
    tipoRegistro: "foto_ampla"
  },
  {
    id: 13,
    titulo: "Estante e Painel com Prateleiras Flutuantes",
    categoria: "Salas & Livings",
    tipoMidia: "foto",
    proporcao: "horizontal",
    midiaUrl: "assets/portfolio/IMG-20261004-WA0018.jpg",
    posterUrl: "assets/portfolio/IMG-20261004-WA0018.jpg",
    gdriveId: "1lbzwv1kntpKbitrPzRBWaCNNQuMqH57m",
    gdriveLink: "https://drive.google.com/file/d/1lbzwv1kntpKbitrPzRBWaCNNQuMqH57m/view?usp=drivesdk",
    descricao: "Composição de prateleiras com fixação oculta e painel de fundo em lâmina natural.",
    tipoRegistro: "foto_ampla"
  },
  {
    id: 14,
    titulo: "Oratório Artesanal em Madeira Ripada",
    categoria: "Marcenaria Sob Medida",
    tipoMidia: "foto",
    proporcao: "vertical",
    midiaUrl: "assets/portfolio/IMG-20261004-WA0019.jpg",
    posterUrl: "assets/portfolio/IMG-20261004-WA0019.jpg",
    gdriveId: "1K1hF4glYsmHyBz5YNhnNZ9SE9SsGhBN6",
    gdriveLink: "https://drive.google.com/file/d/1K1hF4glYsmHyBz5YNhnNZ9SE9SsGhBN6/view?usp=drivesdk",
    descricao: "Peça sacra autoral esculpida em madeira nobre com laterais em detalhe ripado e visor frontal em vidro.",
    tipoRegistro: "detalhe_acabamento"
  },
  {
    id: 15,
    titulo: "Painel Decorativo com Porta Mimetizada",
    categoria: "Painéis & Revestimentos",
    tipoMidia: "foto",
    proporcao: "vertical",
    midiaUrl: "assets/portfolio/IMG-20261004-WA0020.jpg",
    posterUrl: "assets/portfolio/IMG-20261004-WA0020.jpg",
    gdriveId: "1jpFzyrxbXQgHclrM0Zp0dCKWsmVNsrMX",
    gdriveLink: "https://drive.google.com/file/d/1jpFzyrxbXQgHclrM0Zp0dCKWsmVNsrMX/view?usp=drivesdk",
    descricao: "Solução arquitetônica contínua onde a passagem é camuflada nos frisos da marcenaria.",
    tipoRegistro: "detalhe_acabamento"
  },
  {
    id: 16,
    titulo: "Caderno Técnico de Detalhamento e Plantas",
    categoria: "Marcenaria Sob Medida",
    tipoMidia: "foto",
    proporcao: "vertical",
    midiaUrl: "assets/portfolio/Digitalizado_20261004-2113.pdf",
    posterUrl: "assets/portfolio/pdf_page1.jpg",
    gdriveId: "18P3cPr_-pc8WOQ2jEdeYfjGUCXMwKg2o",
    gdriveLink: "https://drive.google.com/file/d/18P3cPr_-pc8WOQ2jEdeYfjGUCXMwKg2o/view?usp=drivesdk",
    descricao: "Desenhos técnicos, cotas de marcenaria e especificações executivas de projetos sob medida.",
    tipoRegistro: "processo_fabricacao"
  }
];

window.db = window.db || {
  leads: [],
  clients: [],
  services: [],
  transactions: [],
  portfolio: [],
  employees: []
};

var db = window.db;

function loadCachedDB() {
  try {
    db.leads = JSON.parse(localStorage.getItem("marcenaria_leads") || "[]");
    db.clients = JSON.parse(localStorage.getItem("marcenaria_clients") || "[]");
    db.services = JSON.parse(localStorage.getItem("marcenaria_services") || "[]");
    db.transactions = JSON.parse(localStorage.getItem("marcenaria_transactions") || "[]");
    db.employees = JSON.parse(localStorage.getItem("marcenaria_employees") || "[]");

    const cachedPortfolio = JSON.parse(localStorage.getItem("marcenaria_portfolio") || "null");
    
    // Sempre prioriza os títulos corretos e todas as 16 mídias do Google Drive
    if (cachedPortfolio && Array.isArray(cachedPortfolio) && cachedPortfolio.length > 0) {
      const defaultIds = new Set(DEFAULT_REAL_PORTFOLIO.map(p => String(p.id)));
      const customUserItems = cachedPortfolio.filter(p => !defaultIds.has(String(p.id)));
      db.portfolio = [...DEFAULT_REAL_PORTFOLIO, ...customUserItems];
    } else {
      db.portfolio = [...DEFAULT_REAL_PORTFOLIO];
    }
    saveCacheDB("portfolio", db.portfolio);

    db.services.forEach(srv => {
      if (!Array.isArray(srv.workers)) srv.workers = [];
      if (!Array.isArray(srv.expenses)) srv.expenses = [];
    });
  } catch (e) {
    console.warn("Erro ao ler cache local:", e);
    db.portfolio = [...DEFAULT_REAL_PORTFOLIO];
  }
  return db;
}

function saveCacheDB(key, data) {
  try {
    localStorage.setItem("marcenaria_" + key, JSON.stringify(data));
  } catch (e) {
    console.warn("Erro ao salvar cache:", e);
  }
}

window.loadCachedDB = loadCachedDB;
window.saveCacheDB = saveCacheDB;
window.DEFAULT_REAL_PORTFOLIO = DEFAULT_REAL_PORTFOLIO;
