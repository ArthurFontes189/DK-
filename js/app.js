// ============================================================================
// APLICAÇÃO PRINCIPAL - BOOTSTRAP E RENDERIZAÇÃO
// DK Construtora & Serviços
// ============================================================================

// Renderiza todas as abas e métricas do Painel Administrativo
function renderAdmin() {
  renderLeads(db.leads);
  renderClients(db.clients, db.services, db.transactions);
  renderServices(db.services);
  if (typeof renderEmployees === "function") {
    renderEmployees(db.employees);
  }
  renderFinanceiro(db.transactions);
  renderAdminPortfolio(db.portfolio);
}

// Inicialização automática quando a página carregar
document.addEventListener("DOMContentLoaded", () => {
  console.log("🪵 DK Construtora & Serviços - Iniciando aplicação modular...");
  loadCachedDB();
  initSupabase();
  updateAdminButton();
  renderPublicCatalog();
});
