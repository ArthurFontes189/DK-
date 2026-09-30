// ============================================================================
// SERVIÇO DE CACHE E ESTADO EM MEMÓRIA (OFFLINE-FIRST CAPABILITY)
// ============================================================================

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
    db.portfolio = JSON.parse(localStorage.getItem("marcenaria_portfolio") || "[]");
    db.employees = JSON.parse(localStorage.getItem("marcenaria_employees") || "[]");

    db.services.forEach(srv => {
      if (!Array.isArray(srv.workers)) srv.workers = [];
      if (!Array.isArray(srv.expenses)) srv.expenses = [];
    });
  } catch (e) {
    console.warn("Erro ao ler cache local:", e);
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
