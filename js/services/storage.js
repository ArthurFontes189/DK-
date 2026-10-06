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
    "midiaUrl": "https://drive.google.com/file/d/1-RgNwqu-yqW4O7axmiJ4LZcirHDD5QaS/preview",
    "posterUrl": "assets/portfolio/poster_VID-20261004-WA0053.jpg",
    "gdriveId": "1-RgNwqu-yqW4O7axmiJ4LZcirHDD5QaS",
    "gdriveLink": "https://drive.google.com/file/d/1-RgNwqu-yqW4O7axmiJ4LZcirHDD5QaS/view?usp=drivesdk",
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
    "midiaUrl": "https://drive.google.com/file/d/1W-Wfu-bxrmqwkW8HfAsaOHDPqRW0zjkv/preview",
    "posterUrl": "assets/portfolio/poster_VID-20261004-WA0024.jpg",
    "gdriveId": "1W-Wfu-bxrmqwkW8HfAsaOHDPqRW0zjkv",
    "gdriveLink": "https://drive.google.com/file/d/1W-Wfu-bxrmqwkW8HfAsaOHDPqRW0zjkv/view?usp=drivesdk",
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
    "midiaUrl": "https://drive.google.com/file/d/14TPKO6E7hUDjcHqkw558chwjqZLSD5MJ/preview",
    "posterUrl": "assets/portfolio/poster_VID-20261004-WA0021.jpg",
    "gdriveId": "14TPKO6E7hUDjcHqkw558chwjqZLSD5MJ",
    "gdriveLink": "https://drive.google.com/file/d/14TPKO6E7hUDjcHqkw558chwjqZLSD5MJ/view?usp=drivesdk",
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
    "midiaUrl": "https://drive.google.com/file/d/1dML6s-wxahq_tJtpFw0XHM8QXFewdHn_/preview",
    "posterUrl": "assets/portfolio/poster_VID-20261004-WA0022.jpg",
    "gdriveId": "1dML6s-wxahq_tJtpFw0XHM8QXFewdHn_",
    "gdriveLink": "https://drive.google.com/file/d/1dML6s-wxahq_tJtpFw0XHM8QXFewdHn_/view?usp=drivesdk",
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
    "midiaUrl": "https://drive.google.com/file/d/1eyvDs5Q7en3ilnhku_Mt3PzDYOc0VnFe/preview",
    "posterUrl": "assets/portfolio/poster_VID-20261004-WA0023.jpg",
    "gdriveId": "1eyvDs5Q7en3ilnhku_Mt3PzDYOc0VnFe",
    "gdriveLink": "https://drive.google.com/file/d/1eyvDs5Q7en3ilnhku_Mt3PzDYOc0VnFe/view?usp=drivesdk",
    "descricao": "Estrutura robusta e elegante em madeira tratada contra intempéries com fechamento artesanal.",
    "destaque": true
  },
  {
    "id": 6,
    "titulo": "ÁREA EXTERNA EM MADEIRA",
    "subtitulo": "Soluções estruturais e decorativas para áreas abertas",
    "categoria": "ÁREAS EXTERNAS",
    "tipoMidia": "video",
    "proporcao": "horizontal",
    "midiaUrl": "https://drive.google.com/file/d/1KYP9CVH94EqBlIJno7avKsTkxYf6xFCs/preview",
    "posterUrl": "assets/portfolio/IMG-20261004-WA0006.jpg",
    "gdriveId": "1KYP9CVH94EqBlIJno7avKsTkxYf6xFCs",
    "gdriveLink": "https://drive.google.com/file/d/1KYP9CVH94EqBlIJno7avKsTkxYf6xFCs/view?usp=drivesdk",
    "descricao": "Projeto e montagem de estruturas externas resistentes ao sol e chuva com estética natural.",
    "destaque": false
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
    "gdriveId": "1vD0o54VW9e0CoLFHr4NxvEqF5c3qmfs2",
    "gdriveLink": "https://drive.google.com/file/d/1vD0o54VW9e0CoLFHr4NxvEqF5c3qmfs2/view?usp=drivesdk",
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
    "gdriveId": "18koAp3WQPfUI7-XGCsTJnkNdT3ag-n8j",
    "gdriveLink": "https://drive.google.com/file/d/18koAp3WQPfUI7-XGCsTJnkNdT3ag-n8j/view?usp=drivesdk",
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
    "gdriveId": "1p3Sr741KCf6hhjLtQy7OwzNSg6RkbX4f",
    "gdriveLink": "https://drive.google.com/file/d/1p3Sr741KCf6hhjLtQy7OwzNSg6RkbX4f/view?usp=drivesdk",
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
    "gdriveId": "19ExhkajsWto9piV8CBPzWXUkpnop4UcN",
    "gdriveLink": "https://drive.google.com/file/d/19ExhkajsWto9piV8CBPzWXUkpnop4UcN/view?usp=drivesdk",
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
    "gdriveId": "1QcLIs0It9t7nfIF7UfpcfGDHIXg7bp6u",
    "gdriveLink": "https://drive.google.com/file/d/1QcLIs0It9t7nfIF7UfpcfGDHIXg7bp6u/view?usp=drivesdk",
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
    "gdriveId": "1vRcS5p-vUlI8gA0JD0hHSV_MHLbN-D61",
    "gdriveLink": "https://drive.google.com/file/d/1vRcS5p-vUlI8gA0JD0hHSV_MHLbN-D61/view?usp=drivesdk",
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
    "gdriveId": "1lbzwv1kntpKbitrPzRBWaCNNQuMqH57m",
    "gdriveLink": "https://drive.google.com/file/d/1lbzwv1kntpKbitrPzRBWaCNNQuMqH57m/view?usp=drivesdk",
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
    "gdriveId": "1K1hF4glYsmHyBz5YNhnNZ9SE9SsGhBN6",
    "gdriveLink": "https://drive.google.com/file/d/1K1hF4glYsmHyBz5YNhnNZ9SE9SsGhBN6/view?usp=drivesdk",
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
    "gdriveId": "1jpFzyrxbXQgHclrM0Zp0dCKWsmVNsrMX",
    "gdriveLink": "https://drive.google.com/file/d/1jpFzyrxbXQgHclrM0Zp0dCKWsmVNsrMX/view?usp=drivesdk",
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
    "gdriveId": "18P3cPr_-pc8WOQ2jEdeYfjGUCXMwKg2o",
    "gdriveLink": "https://drive.google.com/file/d/18P3cPr_-pc8WOQ2jEdeYfjGUCXMwKg2o/view?usp=drivesdk",
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

    const cachedPortfolio = JSON.parse(localStorage.getItem("marcenaria_portfolio") || "null");
    
    // Sempre prioriza os títulos corretos e todas as 16 mídias canônicas
    if (cachedPortfolio && Array.isArray(cachedPortfolio) && cachedPortfolio.length > 0) {
      const defaultIds = new Set(DEFAULT_REAL_PORTFOLIO.map(p => String(p.id)));
      const customUserItems = cachedPortfolio.filter(p => !defaultIds.has(String(p.id)));
      db.portfolio = [...DEFAULT_REAL_PORTFOLIO, ...customUserItems];
    } else {
      db.portfolio = [...DEFAULT_REAL_PORTFOLIO];
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
    db.portfolio = [...DEFAULT_REAL_PORTFOLIO];
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
