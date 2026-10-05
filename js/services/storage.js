// ============================================================================
// SERVIÇO DE CACHE E ESTADO EM MEMÓRIA (OFFLINE-FIRST CAPABILITY)
// DK Revestimentos - Mídias Reais do Google Drive Pré-carregadas
// ============================================================================

const DEFAULT_REAL_PORTFOLIO = [
  {
    id: 1,
    titulo: "Suíte Master com Armários Planejados e Iluminação LED",
    categoria: "Dormitórios & Closets",
    tipoMidia: "video",
    proporcao: "vertical",
    midiaUrl: "assets/portfolio/VID-20261004-WA0053.mp4",
    posterUrl: "assets/portfolio/poster_VID-20261004-WA0053.jpg",
    gdriveId: "1-RgNwqu-yqW4O7axmiJ4LZcirHDD5QaS",
    gdriveLink: "https://drive.google.com/file/d/1-RgNwqu-yqW4O7axmiJ4LZcirHDD5QaS/view?usp=drivesdk",
    descricao: "Tour vertical mostrando divisão inteligente de espaço, gaveteiros com amortecedores e iluminação embutida em perfil de LED.",
    tipoRegistro: "ambiente_finalizado"
  },
  {
    id: 2,
    titulo: "Living Integrado com Painel Ripado e Portas de Passagem Ocultas",
    categoria: "Painéis & Revestimentos",
    tipoMidia: "video",
    proporcao: "vertical",
    midiaUrl: "assets/portfolio/VID-20261004-WA0024.mp4",
    posterUrl: "assets/portfolio/poster_VID-20261004-WA0024.jpg",
    gdriveId: "1W-Wfu-bxrmqwkW8HfAsaOHDPqRW0zjkv",
    gdriveLink: "https://drive.google.com/file/d/1W-Wfu-bxrmqwkW8HfAsaOHDPqRW0zjkv/view?usp=drivesdk",
    descricao: "Execução de marcenaria de alto padrão com revestimento ripado em lâmina nobre, mimetizando portas de acesso com fechamento suave.",
    tipoRegistro: "ambiente_finalizado"
  },
  {
    id: 3,
    titulo: "Tour Panorâmico: Cozinha Gourmet Planejada e Ilha Integrada",
    categoria: "Cozinhas & Gourmet",
    tipoMidia: "video",
    proporcao: "horizontal",
    midiaUrl: "assets/portfolio/VID-20261004-WA0021.mp4",
    posterUrl: "assets/portfolio/poster_VID-20261004-WA0021.jpg",
    gdriveId: "14TPKO6E7hUDjcHqkw558chwjqZLSD5MJ",
    gdriveLink: "https://drive.google.com/file/d/14TPKO6E7hUDjcHqkw558chwjqZLSD5MJ/view?usp=drivesdk",
    descricao: "Vídeo panorâmico completo destacando a amplitude do living gourmet, armários com abertura por toque e nichos para eletrodomésticos.",
    tipoRegistro: "ambiente_finalizado"
  },
  {
    id: 4,
    titulo: "Acabamento Fino: Corrediças Ocultas e Puxadores Cava",
    categoria: "Salas & Livings",
    tipoMidia: "video",
    proporcao: "vertical",
    midiaUrl: "assets/portfolio/VID-20261004-WA0022.mp4",
    posterUrl: "assets/portfolio/poster_VID-20261004-WA0022.jpg",
    gdriveId: "1dML6s-wxahq_tJtpFw0XHM8QXFewdHn_",
    gdriveLink: "https://drive.google.com/file/d/1dML6s-wxahq_tJtpFw0XHM8QXFewdHn_/view?usp=drivesdk",
    descricao: "Demonstração prática da suavidade dos sistemas de gavetas alemãs, encaixes milimétricos e ausência de folgas nos armários.",
    tipoRegistro: "detalhe_acabamento"
  },
  {
    id: 5,
    titulo: "Montagem e Alinhamento a Laser no Canteiro da Obra",
    categoria: "Marcenaria Sob Medida",
    tipoMidia: "video",
    proporcao: "horizontal",
    midiaUrl: "assets/portfolio/VID-20261004-WA0023.mp4",
    posterUrl: "assets/portfolio/poster_VID-20261004-WA0023.jpg",
    gdriveId: "1eyvDs5Q7en3ilnhku_Mt3PzDYOc0VnFe",
    gdriveLink: "https://drive.google.com/file/d/1eyvDs5Q7en3ilnhku_Mt3PzDYOc0VnFe/view?usp=drivesdk",
    descricao: "A precisão que antecede o acabamento: equipe especializada na fixação e prumo dos módulos estruturais no canteiro.",
    tipoRegistro: "processo_fabricacao"
  },
  {
    id: 6,
    titulo: "Deck Suspenso em Cumaru & Revestimentos de Área Externa",
    categoria: "Áreas Externas",
    tipoMidia: "video",
    proporcao: "horizontal",
    midiaUrl: "https://drive.google.com/file/d/1KYP9CVH94EqBlIJno7avKsTkxYf6xFCs/preview",
    posterUrl: "assets/portfolio/IMG-20261004-WA0006.jpg",
    gdriveId: "1KYP9CVH94EqBlIJno7avKsTkxYf6xFCs",
    gdriveLink: "https://drive.google.com/file/d/1KYP9CVH94EqBlIJno7avKsTkxYf6xFCs/view?usp=drivesdk",
    descricao: "Projeto completo de deck em madeira maciça nobre Cumaru com iluminação paisagística e tratamento anti-intempéries.",
    tipoRegistro: "ambiente_finalizado"
  },
  {
    id: 7,
    titulo: "Deck Suspenso em Madeira Cumaru com Iluminação Embutida",
    categoria: "Áreas Externas",
    tipoMidia: "foto",
    proporcao: "vertical",
    midiaUrl: "assets/portfolio/IMG-20261004-WA0006.jpg",
    posterUrl: "assets/portfolio/IMG-20261004-WA0006.jpg",
    gdriveId: "1vD0o54VW9e0CoLFHr4NxvEqF5c3qmfs2",
    gdriveLink: "https://drive.google.com/file/d/1vD0o54VW9e0CoLFHr4NxvEqF5c3qmfs2/view?usp=drivesdk",
    descricao: "Fotografia vertical destacando os balizadores de piso integrados e acabamento acetinado com proteção UV.",
    tipoRegistro: "ambiente_finalizado"
  },
  {
    id: 8,
    titulo: "Living Integrado com Bancada e Painel Amplo de TV",
    categoria: "Salas & Livings",
    tipoMidia: "foto",
    proporcao: "horizontal",
    midiaUrl: "assets/portfolio/IMG-20261004-WA0013.jpg",
    posterUrl: "assets/portfolio/IMG-20261004-WA0013.jpg",
    gdriveId: "18koAp3WQPfUI7-XGCsTJnkNdT3ag-n8j",
    gdriveLink: "https://drive.google.com/file/d/18koAp3WQPfUI7-XGCsTJnkNdT3ag-n8j/view?usp=drivesdk",
    descricao: "Visão ampla horizontal mostrando a harmonia de marcenaria entre o painel e os armários inferiores com puxadores integrados.",
    tipoRegistro: "foto_ampla"
  },
  {
    id: 9,
    titulo: "Mobiliário Planejado com Acabamento Acetinado e Cavas Cavas",
    categoria: "Salas & Livings",
    tipoMidia: "foto",
    proporcao: "horizontal",
    midiaUrl: "assets/portfolio/IMG-20261004-WA0014.jpg",
    posterUrl: "assets/portfolio/IMG-20261004-WA0014.jpg",
    gdriveId: "1p3Sr741KCf6hhjLtQy7OwzNSg6RkbX4f",
    gdriveLink: "https://drive.google.com/file/d/1p3Sr741KCf6hhjLtQy7OwzNSg6RkbX4f/view?usp=drivesdk",
    descricao: "Perspectiva de marcenaria minimalista com gavetões profundos e acabamento resistente a riscos.",
    tipoRegistro: "foto_ampla"
  },
  {
    id: 10,
    titulo: "Armário de Suíte com Portas Deslizantes e Espelho Bronze",
    categoria: "Dormitórios & Closets",
    tipoMidia: "foto",
    proporcao: "vertical",
    midiaUrl: "assets/portfolio/IMG-20261004-WA0015.jpg",
    posterUrl: "assets/portfolio/IMG-20261004-WA0015.jpg",
    gdriveId: "19ExhkajsWto9piV8CBPzWXUkpnop4UcN",
    gdriveLink: "https://drive.google.com/file/d/19ExhkajsWto9piV8CBPzWXUkpnop4UcN/view?usp=drivesdk",
    descricao: "Fotografia vertical mostrando aproveitamento de pé-direito com armário embutido e portas com perfil de alumínio.",
    tipoRegistro: "ambiente_finalizado"
  },
  {
    id: 11,
    titulo: "Torre Quente e Nichos Planejados sob Medida",
    categoria: "Cozinhas & Gourmet",
    tipoMidia: "foto",
    proporcao: "vertical",
    midiaUrl: "assets/portfolio/IMG-20261004-WA0016.jpg",
    posterUrl: "assets/portfolio/IMG-20261004-WA0016.jpg",
    gdriveId: "1QcLIs0It9t7nfIF7UfpcfGDHIXg7bp6u",
    gdriveLink: "https://drive.google.com/file/d/1QcLIs0It9t7nfIF7UfpcfGDHIXg7bp6u/view?usp=drivesdk",
    descricao: "Módulo vertical para forno e micro-ondas embutidos com ventilação oculta e nichos decorativos.",
    tipoRegistro: "detalhe_acabamento"
  },
  {
    id: 12,
    titulo: "Espaço Gourmet com Ilha em Madeira Nobre e Granito",
    categoria: "Cozinhas & Gourmet",
    tipoMidia: "foto",
    proporcao: "horizontal",
    midiaUrl: "assets/portfolio/IMG-20261004-WA0017.jpg",
    posterUrl: "assets/portfolio/IMG-20261004-WA0017.jpg",
    gdriveId: "1vRcS5p-vUlI8gA0JD0hHSV_MHLbN-D61",
    gdriveLink: "https://drive.google.com/file/d/1vRcS5p-vUlI8gA0JD0hHSV_MHLbN-D61/view?usp=drivesdk",
    descricao: "Visão horizontal de bancada gourmet com marcenaria sob medida e gaveteiros térmicos.",
    tipoRegistro: "foto_ampla"
  },
  {
    id: 13,
    titulo: "Home Office Planejado com Prateleiras Flutuantes Reforçadas",
    categoria: "Salas & Livings",
    tipoMidia: "foto",
    proporcao: "horizontal",
    midiaUrl: "assets/portfolio/IMG-20261004-WA0018.jpg",
    posterUrl: "assets/portfolio/IMG-20261004-WA0018.jpg",
    gdriveId: "1lbzwv1kntpKbitrPzRBWaCNNQuMqH57m",
    gdriveLink: "https://drive.google.com/file/d/1lbzwv1kntpKbitrPzRBWaCNNQuMqH57m/view?usp=drivesdk",
    descricao: "Prateleiras engastadas com fixação invisível suportando peso e mesa de trabalho ergonômica.",
    tipoRegistro: "foto_ampla"
  },
  {
    id: 14,
    titulo: "Gabinete de Banheiro Suspenso com Ripado Impermeabilizado",
    categoria: "Marcenaria Sob Medida",
    tipoMidia: "foto",
    proporcao: "vertical",
    midiaUrl: "assets/portfolio/IMG-20261004-WA0019.jpg",
    posterUrl: "assets/portfolio/IMG-20261004-WA0019.jpg",
    gdriveId: "1K1hF4glYsmHyBz5YNhnNZ9SE9SsGhBN6",
    gdriveLink: "https://drive.google.com/file/d/1K1hF4glYsmHyBz5YNhnNZ9SE9SsGhBN6/view?usp=drivesdk",
    descricao: "Marcenaria com MDF naval resistente à umidade, gavetão com recorte para sifão e acabamento ripado fino.",
    tipoRegistro: "detalhe_acabamento"
  },
  {
    id: 15,
    titulo: "Porta Mimetizada em Painel com Encaixe Oculto",
    categoria: "Painéis & Revestimentos",
    tipoMidia: "foto",
    proporcao: "vertical",
    midiaUrl: "assets/portfolio/IMG-20261004-WA0020.jpg",
    posterUrl: "assets/portfolio/IMG-20261004-WA0020.jpg",
    gdriveId: "1jpFzyrxbXQgHclrM0Zp0dCKWsmVNsrMX",
    gdriveLink: "https://drive.google.com/file/d/1jpFzyrxbXQgHclrM0Zp0dCKWsmVNsrMX/view?usp=drivesdk",
    descricao: "Fechamento contínuo onde a porta do lavabo se funde perfeitamente com os frisos do painel decorativo da sala.",
    tipoRegistro: "detalhe_acabamento"
  },
  {
    id: 16,
    titulo: "Caderno de Projetos & Desenhos Técnicos de Marcenaria",
    categoria: "Marcenaria Sob Medida",
    tipoMidia: "foto",
    proporcao: "vertical",
    midiaUrl: "assets/portfolio/Digitalizado_20261004-2113.pdf",
    posterUrl: "assets/portfolio/pdf_page1.jpg",
    gdriveId: "18P3cPr_-pc8WOQ2jEdeYfjGUCXMwKg2o",
    gdriveLink: "https://drive.google.com/file/d/18P3cPr_-pc8WOQ2jEdeYfjGUCXMwKg2o/view?usp=drivesdk",
    descricao: "Desenhos técnicos, detalhamento de cortes, cotas e especificações arquitetônicas dos móveis sob medida da DK Revestimentos.",
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
    
    // Fusão inteligente: sempre garante que todas as mídias da pasta do Google Drive estejam ativas no catálogo
    if (cachedPortfolio && Array.isArray(cachedPortfolio) && cachedPortfolio.length > 0) {
      const existingGdriveIds = new Set(cachedPortfolio.map(p => p.gdriveId).filter(Boolean));
      const existingTitles = new Set(cachedPortfolio.map(p => p.titulo));

      const missingRealItems = DEFAULT_REAL_PORTFOLIO.filter(item =>
        (!item.gdriveId || !existingGdriveIds.has(item.gdriveId)) && !existingTitles.has(item.titulo)
      );

      if (missingRealItems.length > 0) {
        db.portfolio = [...DEFAULT_REAL_PORTFOLIO, ...cachedPortfolio.filter(p => !existingTitles.has(p.titulo))];
        saveCacheDB("portfolio", db.portfolio);
      } else {
        db.portfolio = cachedPortfolio;
      }
    } else {
      db.portfolio = [...DEFAULT_REAL_PORTFOLIO];
      saveCacheDB("portfolio", db.portfolio);
    }

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
