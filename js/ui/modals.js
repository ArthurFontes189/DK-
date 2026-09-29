// ============================================================================
// GERENCIADOR DE MODAIS E ACESSIBILIDADE
// ============================================================================

function openModal(id) {
  const el = document.getElementById(id);
  if (el) {
    el.classList.add("active");
    // Trava rolagem do fundo para melhor experiência
    document.body.style.overflow = "hidden";
  }
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) {
    el.classList.remove("active");
    // Restaura rolagem se não houver outros modais abertos
    const activeModals = document.querySelectorAll(".modal-overlay.active");
    if (activeModals.length === 0) {
      document.body.style.overflow = "";
    }
  }
}

// Fechamento ao clicar fora do conteúdo
window.addEventListener("click", function(e) {
  if (e.target.classList.contains("modal-overlay")) {
    e.target.classList.remove("active");
    document.body.style.overflow = "";
  }
});

// Fechamento com tecla ESC
window.addEventListener("keydown", function(e) {
  if (e.key === "Escape") {
    const activeModal = document.querySelector(".modal-overlay.active");
    if (activeModal) {
      activeModal.classList.remove("active");
      document.body.style.overflow = "";
    }
  }
});
