// ============================================================================
// APLICAÇÃO PRINCIPAL DO SITE PÚBLICO (CLIENT-FACING ONLY)
// DK Revestimentos - Foco em Apresentação de Portfólio, Credibilidade e Contato
// ============================================================================

document.addEventListener("DOMContentLoaded", () => {
  console.log("🪵 DK Revestimentos - Site Público Inicializado");
  
  // 1. Carrega imediatamente o catálogo e dados locais em cache (renderização instantânea offline-first)
  if (typeof loadCachedDB === "function") {
    loadCachedDB();
  }
  
  // 2. Renderiza a galeria de trabalhos reais com dados locais disponíveis
  if (typeof renderPublicCatalog === "function") {
    renderPublicCatalog();
  }

  // 3. Conecta ao Supabase para buscar novos vídeos e fotos cadastrados no admin em tempo real
  if (typeof initSupabase === "function") {
    try {
      initSupabase();
    } catch (e) {
      console.warn("initSupabase offline/error:", e);
    }
  }
});

function toggleMobileMenu() {
  const m = document.getElementById("mobileMenu");
  if (m) m.classList.toggle("open");
}
window.toggleMobileMenu = toggleMobileMenu;

function goToClientSite() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
window.goToClientSite = goToClientSite;
