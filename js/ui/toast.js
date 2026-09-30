// ============================================================================
// COMPONENTE DE NOTIFICAÇÕES VISUAIS MODERNAS E CLEAN (TOASTS)
// Substitui popups nativos do navegador por notificações limpas e elegantes
// ============================================================================

function getToastContainer() {
  let container = document.getElementById("toastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "toast-container";
    container.setAttribute("aria-live", "polite");
    document.body.appendChild(container);
  }
  return container;
}

function showToast(msg, type = "info", duration = 3800) {
  if (!msg) return;
  const container = getToastContainer();

  // Auto-detecção de tipo caso não especificado ou padrão
  const lower = String(msg).toLowerCase();
  if (type === "info") {
    if (lower.includes("erro") || lower.includes("falha") || lower.includes("incorret") || lower.includes("bloqueou")) {
      type = "error";
    } else if (lower.includes("aviso") || lower.includes("atenção") || lower.includes("selecione") || lower.includes("preencha")) {
      type = "warning";
    } else if (lower.includes("sucesso") || lower.includes("concluíd") || lower.includes("salv") || lower.includes("gravad") || lower.includes("excluíd") || lower.includes("atualizad")) {
      type = "success";
    }
  }

  // Ícones SVG minimalistas para cada tipo
  let iconSvg = "";
  if (type === "success") {
    iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>`;
  } else if (type === "error") {
    iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
  } else if (type === "warning") {
    iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
  } else {
    iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
  }

  const toastItem = document.createElement("div");
  toastItem.className = `toast-item toast-${type}`;
  toastItem.innerHTML = `
    <div class="toast-icon">${iconSvg}</div>
    <div class="toast-content">${msg}</div>
    <button type="button" class="toast-close" title="Fechar">&times;</button>
  `;

  // Fechar no clique
  const closeBtn = toastItem.querySelector(".toast-close");
  const dismiss = () => {
    if (toastItem.classList.contains("toast-closing")) return;
    toastItem.classList.add("toast-closing");
    setTimeout(() => {
      if (toastItem.parentNode) toastItem.parentNode.removeChild(toastItem);
    }, 240);
  };

  closeBtn.addEventListener("click", dismiss);

  container.appendChild(toastItem);

  // Auto-fechar após a duração
  if (duration > 0) {
    setTimeout(dismiss, duration);
  }

  // Compatibilidade com elemento legado se existir
  const oldToast = document.getElementById("toastMessage");
  if (oldToast) oldToast.style.display = "none";
}

window.showToast = showToast;
window.notify = showToast;

// Intercepta e padroniza qualquer chamada a window.alert() para exibir Toast
window.alert = function(msg) {
  showToast(String(msg || ""));
};
