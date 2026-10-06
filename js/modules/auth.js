// ============================================================================
// MÓDULO DE AUTENTICAÇÃO E NAVEGAÇÃO ENTRE SITE E PAINEL MARCENEIRO
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
  if (isAdminLoggedIn) {
    goToAdminPanel();
  } else {
    openModal("loginModal");
  }
}

function handleAdminLogin(e) {
  e.preventDefault();
  const user = document.getElementById("loginUser").value.trim();
  const pass = document.getElementById("loginPass").value.trim();

  if (user === "admin" && pass === "1234") {
    isAdminLoggedIn = true;
    localStorage.setItem("marcenaria_admin_logged", "true");
    closeModal("loginModal");
    updateAdminButton();
    showToast("Login realizado com sucesso!", "success");
    if (typeof renderPublicCatalog === "function") renderPublicCatalog();
    goToAdminPanel();
  } else {
    showToast("Usuário ou senha incorretos. Padrão: admin / 1234", "error");
  }
}

function adminLogout() {
  isAdminLoggedIn = false;
  localStorage.removeItem("marcenaria_admin_logged");
  updateAdminButton();
  if (typeof renderPublicCatalog === "function") renderPublicCatalog();
  showToast("Você saiu do painel administrativo.", "info");
  goToClientSite();
}

function goToAdminPanel() {
  document.getElementById("clientArea").style.display = "none";
  document.getElementById("adminArea").style.display = "block";
  fetchCloudData();
  renderAdmin();
  window.scrollTo(0, 0);
}

function goToClientSite() {
  document.getElementById("adminArea").style.display = "none";
  document.getElementById("clientArea").style.display = "block";
  renderPublicCatalog();
  window.scrollTo(0, 0);
}

function toggleMobileMenu() {
  document.getElementById("mobileMenu").classList.toggle("open");
}

function switchAdminTab(tabName, el) {
  document.querySelectorAll(".admin-nav-tab").forEach(b => b.classList.remove("active"));
  document.querySelectorAll(".admin-tab-content").forEach(s => s.style.display = "none");
  
  const tabBtn = el || document.getElementById("tabBtn-" + tabName);
  if (tabBtn) tabBtn.classList.add("active");

  if (tabName === "crm") {
    document.getElementById("tabCRM").style.display = "block";
    if (typeof renderLeads === "function") renderLeads(db.leads);
  } else if (tabName === "clientes") {
    document.getElementById("tabClientes").style.display = "block";
    if (typeof renderClients === "function") renderClients(db.clients, db.services, db.transactions);
  } else if (tabName === "servicos") {
    document.getElementById("tabServicos").style.display = "block";
    if (typeof renderServices === "function") renderServices(db.services);
  } else if (tabName === "funcionarios") {
    document.getElementById("tabFuncionarios").style.display = "block";
    if (typeof loadEmployeesFromDb === "function") loadEmployeesFromDb(); else if (typeof renderEmployees === "function") renderEmployees(db.employees);
  } else if (tabName === "financeiro") {
    document.getElementById("tabFinanceiro").style.display = "block";
    if (typeof renderFinanceiro === "function") renderFinanceiro(db.transactions);
  } else if (tabName === "portfolioAdmin") {
    document.getElementById("tabPortfolioAdmin").style.display = "block";
    if (typeof renderAdminPortfolio === "function") renderAdminPortfolio(db.portfolio);
  }
}

window.isAdminLoggedIn = isAdminLoggedIn;
window.updateAdminButton = updateAdminButton;
window.handleAdminAccessClick = handleAdminAccessClick;
window.handleAdminLogin = handleAdminLogin;
window.adminLogout = adminLogout;
window.goToAdminPanel = goToAdminPanel;
window.goToClientSite = goToClientSite;
window.toggleMobileMenu = toggleMobileMenu;
window.switchAdminTab = switchAdminTab;
