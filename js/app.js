// ============================================================================
// APLICAÇÃO PRINCIPAL DO SITE PÚBLICO (CLIENT-FACING ONLY)
// DK Revestimentos - Foco em Apresentação de Portfólio, Credibilidade e Contato
// ============================================================================

document.addEventListener("DOMContentLoaded", () => {
  console.log("🪵 DK Revestimentos - Site Público Inicializado");
  
  // Carrega catálogo e dados públicos em cache
  if (typeof loadCachedDB === "function") {
    loadCachedDB();
  }
  
  // Renderiza a galeria de trabalhos reais
  if (typeof renderPublicCatalog === "function") {
    renderPublicCatalog();
  }
});
