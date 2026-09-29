// ============================================================================
// COMPONENTE DE NOTIFICAÇÕES VISUAIS (TOAST MESSAGES)
// ============================================================================

let toastTimeout = null;

function showToast(msg) {
  const toast = document.getElementById("toastMessage");
  if (!toast) return;
  
  if (toastTimeout) clearTimeout(toastTimeout);
  
  toast.textContent = msg;
  toast.style.display = "block";
  toastTimeout = setTimeout(() => {
    toast.style.display = "none";
  }, 3200);
}
