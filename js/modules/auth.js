// ============================================================================
// MÓDULO DE AUTENTICAÇÃO E NAVEGAÇÃO ENTRE SITE E PAINEL MARCENEIRO
// DK Revestimentos
// ============================================================================

let isAdminLoggedIn = localStorage.getItem("marcenaria_admin_logged") === "true";

function isUserAdmin() {
  return localStorage.getItem("marcenaria_admin_logged") === "true";
}
window.isUserAdmin = isUserAdmin;

function updateAdminButton() {
  const btnText = document.getElementById("adminBtnText");
  if (btnText) {
    btnText.textContent = isAdminLoggedIn ? "Painel Ativo" : "Painel Marceneiro";
  }
}

function handleAdminAccessClick() {
  const adminArea = document.getElementById("adminArea");
  if (adminArea) {
    if (isUserAdmin()) {
      goToAdminPanel();
    } else {
      openModal("loginModal");
    }
  } else {
    // Redireciona para o painel dedicado admin.html
    window.location.href = "admin.html";
  }
}

function handleAdminLogin(e) {
  if (e && e.preventDefault) e.preventDefault();
  const userEl = document.getElementById("loginUser");
  const passEl = document.getElementById("loginPass");
  const user = userEl ? userEl.value.trim() : "";
  const pass = passEl ? passEl.value.trim() : "";

  if (user === "admin" && pass === "1234") {
    isAdminLoggedIn = true;
    localStorage.setItem("marcenaria_admin_logged", "true");
    
    // Fecha modal flutuante se estiver ativo
    if (typeof closeModal === "function") {
      closeModal("loginModal");
    }
    
    // Alterna a visualização in-page se estiver em admin.html
    const loginView = document.getElementById("adminLoginView");
    const adminArea = document.getElementById("adminArea");
    if (loginView) loginView.style.display = "none";
    if (adminArea) adminArea.style.display = "block";

    updateAdminButton();
    showToast("Login realizado com sucesso! Bem-vindo ao painel.", "success");
    goToAdminPanel();
  } else {
    showToast("Usuário ou senha incorretos. Padrão: admin / 1234", "error");
  }
}

function adminLogout() {
  isAdminLoggedIn = false;
  localStorage.removeItem("marcenaria_admin_logged");
  updateAdminButton();
  showToast("Você saiu do painel administrativo.", "info");

  const loginView = document.getElementById("adminLoginView");
  const adminArea = document.getElementById("adminArea");
  if (loginView && adminArea) {
    adminArea.style.display = "none";
    loginView.style.display = "flex";
    window.scrollTo(0, 0);
  } else {
    goToClientSite();
  }
}

function goToAdminPanel() {
  const clientArea = document.getElementById("clientArea");
  const adminArea = document.getElementById("adminArea");
  const loginView = document.getElementById("adminLoginView");
  
  if (loginView) loginView.style.display = "none";
  if (clientArea) clientArea.style.display = "none";
  if (adminArea) adminArea.style.display = "block";
  
  if (typeof fetchCloudData === "function") fetchCloudData();
  if (typeof renderAdmin === "function") renderAdmin();
  window.scrollTo(0, 0);
}

function goToClientSite() {
  const clientArea = document.getElementById("clientArea");
  const adminArea = document.getElementById("adminArea");
  
  if (adminArea) adminArea.style.display = "none";
  if (clientArea) {
    clientArea.style.display = "block";
    if (typeof renderPublicCatalog === "function") renderPublicCatalog();
    window.scrollTo(0, 0);
  } else {
    window.location.href = "index.html";
  }
}

function toggleMobileMenu() {
  const m = document.getElementById("mobileMenu");
  if (m) m.classList.toggle("open");
}

function switchAdminTab(tabName, el) {
  document.querySelectorAll(".admin-nav-tab").forEach(b => b.classList.remove("active"));
  document.querySelectorAll(".admin-tab-content").forEach(s => s.style.display = "none");
  
  const tabBtn = el || document.getElementById("tabBtn-" + tabName);
  if (tabBtn) tabBtn.classList.add("active");

  if (tabName === "crm") {
    const el = document.getElementById("tabCRM");
    if (el) el.style.display = "block";
    if (typeof renderLeads === "function" && typeof db !== "undefined") renderLeads(db.leads || []);
  } else if (tabName === "clientes") {
    const el = document.getElementById("tabClientes");
    if (el) el.style.display = "block";
    if (typeof renderClients === "function" && typeof db !== "undefined") renderClients(db.clients || [], db.services || [], db.transactions || []);
  } else if (tabName === "servicos") {
    const el = document.getElementById("tabServicos");
    if (el) el.style.display = "block";
    if (typeof renderServices === "function" && typeof db !== "undefined") renderServices(db.services || []);
  } else if (tabName === "funcionarios") {
    const el = document.getElementById("tabFuncionarios");
    if (el) el.style.display = "block";
    if (typeof loadEmployeesFromDb === "function") loadEmployeesFromDb(); 
    else if (typeof renderEmployees === "function" && typeof db !== "undefined") renderEmployees(db.employees || []);
  } else if (tabName === "financeiro") {
    const el = document.getElementById("tabFinanceiro");
    if (el) el.style.display = "block";
    if (typeof renderFinanceiro === "function" && typeof db !== "undefined") renderFinanceiro(db.transactions || []);
  } else if (tabName === "portfolioAdmin") {
    const el = document.getElementById("tabPortfolioAdmin");
    if (el) el.style.display = "block";
    if (typeof renderAdminPortfolio === "function" && typeof db !== "undefined") renderAdminPortfolio(db.portfolio || []);
  }
}

window.isAdminLoggedIn = isAdminLoggedIn;
window.isUserAdmin = isUserAdmin;
window.updateAdminButton = updateAdminButton;
window.handleAdminAccessClick = handleAdminAccessClick;
window.handleAdminLogin = handleAdminLogin;
window.adminLogout = adminLogout;
window.goToAdminPanel = goToAdminPanel;
window.goToClientSite = goToClientSite;
window.toggleMobileMenu = toggleMobileMenu;
window.switchAdminTab = switchAdminTab;
