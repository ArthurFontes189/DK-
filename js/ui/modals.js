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


// ============================================================================
// DIÁLOGO DE CONFIRMAÇÃO MODERNO (SUBSTITUTO CLEAN DO confirm() DO NAVEGADOR)
// ============================================================================

function createConfirmModalDOM() {
  let modal = document.getElementById("customConfirmModal");
  if (modal) return modal;

  modal = document.createElement("div");
  modal.id = "customConfirmModal";
  modal.className = "modal-overlay";
  modal.style.zIndex = "9999999";
  modal.innerHTML = `
    <div class="modal-content confirm-modal-card">
      <div class="confirm-modal-icon-wrapper" id="confirmModalIcon"></div>
      <h3 class="confirm-modal-title" id="confirmModalTitle">Confirmação</h3>
      <p class="confirm-modal-msg" id="confirmModalMsg"></p>
      <div class="confirm-modal-actions">
        <button type="button" class="btn btn-outline" id="confirmModalBtnCancel">Cancelar</button>
        <button type="button" class="btn" id="confirmModalBtnOk">Confirmar</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  return modal;
}

function customConfirm(message, title = "Confirmação", options = {}) {
  return new Promise((resolve) => {
    const modal = createConfirmModalDOM();
    const titleEl = document.getElementById("confirmModalTitle");
    const msgEl = document.getElementById("confirmModalMsg");
    const iconEl = document.getElementById("confirmModalIcon");
    const btnCancel = document.getElementById("confirmModalBtnCancel");
    const btnOk = document.getElementById("confirmModalBtnOk");

    if (titleEl) titleEl.textContent = title;
    if (msgEl) msgEl.textContent = message;

    const isDanger = options.danger === true;
    const confirmText = options.confirmText || (isDanger ? "Excluir" : "Confirmar");
    const cancelText = options.cancelText || "Cancelar";

    btnOk.textContent = confirmText;
    btnCancel.textContent = cancelText;

    if (isDanger) {
      btnOk.className = "btn btn-danger";
      iconEl.className = "confirm-modal-icon-wrapper icon-danger";
      iconEl.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/></svg>`;
    } else if (options.icon === "success") {
      btnOk.className = "btn btn-primary";
      iconEl.className = "confirm-modal-icon-wrapper icon-success";
      iconEl.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
    } else {
      btnOk.className = "btn btn-primary";
      iconEl.className = "confirm-modal-icon-wrapper icon-info";
      iconEl.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    const cleanup = () => {
      modal.classList.remove("active");
      document.body.style.overflow = "";
      btnOk.onclick = null;
      btnCancel.onclick = null;
      document.removeEventListener("keydown", onKeyDown);
    };

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        cleanup();
        resolve(false);
      }
    };

    btnOk.onclick = () => {
      cleanup();
      resolve(true);
    };

    btnCancel.onclick = () => {
      cleanup();
      resolve(false);
    };

    document.addEventListener("keydown", onKeyDown);
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  });
}

window.customConfirm = customConfirm;
