// ============================================================================
// APLICAÇÃO PRINCIPAL - BOOTSTRAP E RENDERIZAÇÃO
// DK Revestimentos
// ============================================================================

// Renderiza todas as abas e métricas do Painel Administrativo
function renderAdmin() {
  if (typeof renderLeads === "function") renderLeads(db.leads);
  if (typeof renderClients === "function") renderClients(db.clients, db.services, db.transactions);
  if (typeof renderServices === "function") renderServices(db.services);
  if (typeof renderEmployees === "function") renderEmployees(db.employees);
  if (typeof renderFinanceiro === "function") renderFinanceiro(db.transactions);
  if (typeof renderAdminPortfolio === "function") renderAdminPortfolio(db.portfolio);
}

// Inicialização automática quando a página carregar
document.addEventListener("DOMContentLoaded", () => {
  console.log("🪵 DK Revestimentos - Iniciando aplicação modular...");
  loadCachedDB();
  initSupabase();
  updateAdminButton();
  renderPublicCatalog();
  renderAdmin();
});

window.renderAdmin = renderAdmin;
