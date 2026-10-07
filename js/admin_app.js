// ============================================================================
// BOOTSTRAP DO PAINEL ADMINISTRATIVO (ADMIN.HTML)
// DK Revestimentos
// ============================================================================

function renderAdmin() {
  console.log("📊 Renderizando abas do painel administrativo...");
  try {
    if (typeof renderLeads === "function" && typeof db !== "undefined") {
      renderLeads(db.leads || []);
    }
  } catch (e) { console.error("Erro renderLeads:", e); }

  try {
    if (typeof renderClients === "function" && typeof db !== "undefined") {
      renderClients(db.clients || [], db.services || [], db.transactions || []);
    }
  } catch (e) { console.error("Erro renderClients:", e); }

  try {
    if (typeof renderServices === "function" && typeof db !== "undefined") {
      renderServices(db.services || []);
    }
  } catch (e) { console.error("Erro renderServices:", e); }

  try {
    if (typeof renderEmployees === "function" && typeof db !== "undefined") {
      renderEmployees(db.employees || []);
    }
  } catch (e) { console.error("Erro renderEmployees:", e); }

  try {
    if (typeof renderFinanceiro === "function" && typeof db !== "undefined") {
      renderFinanceiro(db.transactions || []);
    }
  } catch (e) { console.error("Erro renderFinanceiro:", e); }

  try {
    if (typeof renderAdminPortfolio === "function" && typeof db !== "undefined") {
      renderAdminPortfolio(db.portfolio || []);
    }
  } catch (e) { console.error("Erro renderAdminPortfolio:", e); }
}

function initAdminPage() {
  console.log("⚙️ DK Revestimentos - Painel Administrativo Inicializado");
  if (typeof loadCachedDB === "function") {
    try { loadCachedDB(); } catch (e) { console.error("loadCachedDB error:", e); }
  }

  const isLogged = (typeof isUserAdmin === "function") ? isUserAdmin() : (localStorage.getItem("marcenaria_admin_logged") === "true");
  const loginView = document.getElementById("adminLoginView");
  const adminArea = document.getElementById("adminArea");

  if (isLogged) {
    if (loginView) loginView.style.display = "none";
    if (adminArea) adminArea.style.display = "block";
    // Renderiza imediatamente com os dados locais em cache para que nenhuma aba fique em loading!
    renderAdmin();
  } else {
    if (loginView) loginView.style.display = "flex";
    if (adminArea) adminArea.style.display = "none";
  }

  // Inicializa conexão Supabase e sincroniza em background
  if (typeof initSupabase === "function") {
    try { 
      initSupabase(); 
    } catch (e) { 
      console.warn("initSupabase offline/error:", e);
      if (typeof updateSyncIndicator === "function") updateSyncIndicator(false);
    }
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAdminPage);
} else {
  initAdminPage();
}

window.renderAdmin = renderAdmin;
window.initAdminPage = initAdminPage;
