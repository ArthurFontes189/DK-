// ============================================================================
// SERVIÇO DE CACHE E ESTADO EM MEMÓRIA (OFFLINE-FIRST CAPABILITY)
// DK Revestimentos - Acervo Canônico de Projetos & Obras
// ============================================================================

const DEFAULT_REAL_PORTFOLIO = [
  {
    "id": 1,
    "titulo": "AMBIENTE PLANEJADO",
    "subtitulo": "Aproveitamento inteligente de espaço e marcenaria fina",
    "categoria": "MARCENARIA",
    "tipoMidia": "video",
    "proporcao": "vertical",
    "midiaUrl": "assets/portfolio/VID-20261004-WA0053.mp4",
    "posterUrl": "assets/portfolio/poster_VID-20261004-WA0053.jpg",
    "descricao": "Projeto e execução de ambiente sob medida com marcenaria integrada e iluminação embutida.",
    "destaque": false
  },
  {
    "id": 2,
    "titulo": "PAINEL RIPADO EM MADEIRA",
    "subtitulo": "Revestimento vertical ripado com passagem oculta",
    "categoria": "MADEIRA & REVESTIMENTOS",
    "tipoMidia": "video",
    "proporcao": "vertical",
    "midiaUrl": "assets/portfolio/VID-20261004-WA0024.mp4",
    "posterUrl": "assets/portfolio/poster_VID-20261004-WA0024.jpg",
    "descricao": "Revestimento ripado em madeira nobre com alinhamento milimétrico e porta de acesso mimetizada.",
    "destaque": true
  },
  {
    "id": 3,
    "titulo": "MOBILIÁRIO SOB MEDIDA",
    "subtitulo": "Mobiliário personalizado para residência",
    "categoria": "MÓVEIS SOB MEDIDA",
    "tipoMidia": "video",
    "proporcao": "horizontal",
    "midiaUrl": "assets/portfolio/VID-20261004-WA0021.mp4",
    "posterUrl": "assets/portfolio/poster_VID-20261004-WA0021.jpg",
    "descricao": "Composição de armários e bancadas desenhados para máxima fluidez e funcionalidade.",
    "destaque": false
  },
  {
    "id": 4,
    "titulo": "MARCENARIA DE ALTO PADRÃO",
    "subtitulo": "Acabamento refinado e precisão nos encaixes",
    "categoria": "MARCENARIA",
    "tipoMidia": "video",
    "proporcao": "vertical",
    "midiaUrl": "assets/portfolio/VID-20261004-WA0022.mp4",
    "posterUrl": "assets/portfolio/poster_VID-20261004-WA0022.jpg",
    "descricao": "Demonstração prática dos sistemas de abertura suave, gavetões reforçados e marcenaria de precisão.",
    "destaque": false
  },
  {
    "id": 5,
    "titulo": "PORTÃO E PAINEL EM MADEIRA",
    "subtitulo": "Fechamento em réguas de madeira maciça tratada",
    "categoria": "ÁREAS EXTERNAS",
    "tipoMidia": "video",
    "proporcao": "horizontal",
    "midiaUrl": "assets/portfolio/VID-20261004-WA0023.mp4",
    "posterUrl": "assets/portfolio/poster_VID-20261004-WA0023.jpg",
    "descricao": "Estrutura robusta e elegante em madeira tratada contra intempéries com fechamento artesanal.",
    "destaque": true
  },
  {
    "id": 7,
    "titulo": "DECK EM MADEIRA MACIÇA",
    "subtitulo": "Projeto e execução para área externa",
    "categoria": "ÁREAS EXTERNAS",
    "tipoMidia": "foto",
    "proporcao": "vertical",
    "midiaUrl": "assets/portfolio/IMG-20261004-WA0006.jpg",
    "posterUrl": "assets/portfolio/IMG-20261004-WA0006.jpg",
    "descricao": "Deck suspenso em réguas de madeira nobre com balizadores de piso integrados e acabamento acetinado.",
    "destaque": true
  },
  {
    "id": 8,
    "titulo": "MÓVEL PARA LIVING",
    "subtitulo": "Móvel baixo sob medida com gavetões e painel",
    "categoria": "MÓVEIS SOB MEDIDA",
    "tipoMidia": "foto",
    "proporcao": "horizontal",
    "midiaUrl": "assets/portfolio/IMG-20261004-WA0013.jpg",
    "posterUrl": "assets/portfolio/IMG-20261004-WA0013.jpg",
    "descricao": "Mobiliário planejado para sala de estar integrando painel de TV e armários inferiores.",
    "destaque": false
  },
  {
    "id": 9,
    "titulo": "BANCADA COM CAVA INTEGRADA",
    "subtitulo": "Puxadores usinados em cava e acabamento acetinado",
    "categoria": "MÓVEIS SOB MEDIDA",
    "tipoMidia": "foto",
    "proporcao": "horizontal",
    "midiaUrl": "assets/portfolio/IMG-20261004-WA0014.jpg",
    "posterUrl": "assets/portfolio/IMG-20261004-WA0014.jpg",
    "descricao": "Solução minimalista de armários sem puxadores externos, valorizando a pureza das linhas.",
    "destaque": false
  },
  {
    "id": 10,
    "titulo": "ARMÁRIO DE DORMITÓRIO",
    "subtitulo": "Portas de correr com perfil e aproveitamento de pé-direito",
    "categoria": "MÓVEIS SOB MEDIDA",
    "tipoMidia": "foto",
    "proporcao": "vertical",
    "midiaUrl": "assets/portfolio/IMG-20261004-WA0015.jpg",
    "posterUrl": "assets/portfolio/IMG-20261004-WA0015.jpg",
    "descricao": "Armário planejado para quarto com portas deslizantes leves e divisão interna personalizada.",
    "destaque": false
  },
  {
    "id": 11,
    "titulo": "MÓDULO COM NICHOS DECORATIVOS",
    "subtitulo": "Divisão proporcional sob medida para ambientes internos",
    "categoria": "MÓVEIS SOB MEDIDA",
    "tipoMidia": "foto",
    "proporcao": "vertical",
    "midiaUrl": "assets/portfolio/IMG-20261004-WA0016.jpg",
    "posterUrl": "assets/portfolio/IMG-20261004-WA0016.jpg",
    "descricao": "Módulo torre com nichos decorativos integrados e suporte para embutimento sob medida.",
    "destaque": false
  },
  {
    "id": 12,
    "titulo": "BANCADA GOURMET SOB MEDIDA",
    "subtitulo": "Marcenaria funcional para cozinha e área gourmet",
    "categoria": "MÓVEIS SOB MEDIDA",
    "tipoMidia": "foto",
    "proporcao": "horizontal",
    "midiaUrl": "assets/portfolio/IMG-20261004-WA0017.jpg",
    "posterUrl": "assets/portfolio/IMG-20261004-WA0017.jpg",
    "descricao": "Composição de bancada e gaveteiros térmicos com encaixe ergonômico para área gourmet.",
    "destaque": false
  },
  {
    "id": 13,
    "titulo": "ESTANTE COM PRATELEIRAS FLUTUANTES",
    "subtitulo": "Fixação oculta e composição minimalista para sala",
    "categoria": "MÓVEIS SOB MEDIDA",
    "tipoMidia": "foto",
    "proporcao": "horizontal",
    "midiaUrl": "assets/portfolio/IMG-20261004-WA0018.jpg",
    "posterUrl": "assets/portfolio/IMG-20261004-WA0018.jpg",
    "descricao": "Prateleiras engastadas com estrutura interna reforçada suportando peso com leveza visual.",
    "destaque": false
  },
  {
    "id": 14,
    "titulo": "ORATÓRIO EM MADEIRA RIPADA",
    "subtitulo": "Peça personalizada esculpida em madeira nobre",
    "categoria": "PROJETOS ESPECIAIS",
    "tipoMidia": "foto",
    "proporcao": "vertical",
    "midiaUrl": "assets/portfolio/IMG-20261004-WA0019.jpg",
    "posterUrl": "assets/portfolio/IMG-20261004-WA0019.jpg",
    "descricao": "Obra autoral esculpida em madeira nobre com detalhe ripado e visor frontal em vidro.",
    "destaque": true
  },
  {
    "id": 15,
    "titulo": "PAINEL COM PORTA MIMETIZADA",
    "subtitulo": "Integração contínua entre revestimento e passagem oculta",
    "categoria": "MADEIRA & REVESTIMENTOS",
    "tipoMidia": "foto",
    "proporcao": "vertical",
    "midiaUrl": "assets/portfolio/IMG-20261004-WA0020.jpg",
    "posterUrl": "assets/portfolio/IMG-20261004-WA0020.jpg",
    "descricao": "Painel decorativo contínuo com porta oculta que se integra perfeitamente ao ambiente.",
    "destaque": false
  },
  {
    "id": 16,
    "titulo": "PROJETO & DESENHO TÉCNICO",
    "subtitulo": "Detalhamento milimétrico, plantas e especificações executivas",
    "categoria": "PROJETOS ESPECIAIS",
    "tipoMidia": "foto",
    "proporcao": "vertical",
    "midiaUrl": "assets/portfolio/Digitalizado_20261004-2113.pdf",
    "posterUrl": "assets/portfolio/pdf_page1.jpg",
    "descricao": "Plantas, cotas e especificações de marcenaria que garantem fidelidade total na execução.",
    "destaque": false
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

    const deletedIds = new Set(JSON.parse(localStorage.getItem("marcenaria_deleted_portfolio_ids") || "[]").map(String));
    const deletedTitles = new Set(JSON.parse(localStorage.getItem("marcenaria_deleted_portfolio_titles") || "[]").map(t => (t || "").toLowerCase().trim()));

    const cachedPortfolio = JSON.parse(localStorage.getItem("marcenaria_portfolio") || "null");
    
    if (cachedPortfolio && Array.isArray(cachedPortfolio)) {
      // Respeita estritamente as alterações e exclusões feitas pelo usuário
      db.portfolio = cachedPortfolio.filter(p => !deletedIds.has(String(p.id)) && !deletedTitles.has((p.titulo || "").toLowerCase().trim()));
    } else {
      // Primeira inicialização em navegador limpo
      db.portfolio = DEFAULT_REAL_PORTFOLIO.filter(p => !deletedIds.has(String(p.id)) && !deletedTitles.has((p.titulo || "").toLowerCase().trim()));
    }
    saveCacheDB("portfolio", db.portfolio);

    db.services.forEach(srv => {
      if (typeof srv.pago === "undefined") {
        srv.pago = (srv.statusPagamento === "Pago" || srv.statusPagamento === "Quitado");
      }
      if (typeof srv.concluido === "undefined") {
        srv.concluido = (srv.status === "Concluído" || srv.status === "Entregue");
      }
    });

  } catch (e) {
    console.error("Erro ao carregar dados do cache:", e);
    const deletedIds = new Set(JSON.parse(localStorage.getItem("marcenaria_deleted_portfolio_ids") || "[]").map(String));
    db.portfolio = DEFAULT_REAL_PORTFOLIO.filter(p => !deletedIds.has(String(p.id)));
  }
}

function saveCacheDB(entity, data) {
  try {
    localStorage.setItem("marcenaria_" + entity, JSON.stringify(data));
  } catch (e) {
    console.error("Erro ao gravar cache:", e);
  }
}

window.DEFAULT_REAL_PORTFOLIO = DEFAULT_REAL_PORTFOLIO;
window.loadCachedDB = loadCachedDB;
window.saveCacheDB = saveCacheDB;
