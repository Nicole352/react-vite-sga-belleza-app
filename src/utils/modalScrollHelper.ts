/**
 * Helper para hacer scroll automático al abrir modales
 * Se ejecuta automáticamente cuando se detecta un modal-overlay en el DOM
 */

// Observador para detectar cuando se agregan modales al DOM
const observeModals = () => {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLElement && node.classList.contains('modal-overlay')) {
          // Hacer scroll al inicio inmediatamente
          requestAnimationFrame(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            node.scrollTop = 0;
          });
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // También agregar listener de clicks para detectar cuando se abre un modal
  document.addEventListener('click', () => {
    setTimeout(() => {
      const modalOverlay = document.querySelector('.modal-overlay');
      if (modalOverlay) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        modalOverlay.scrollTop = 0;
      }
    }, 100);
  });
};

// Inicializar cuando el DOM esté listo
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observeModals);
  } else {
    observeModals();
  }
}

export default observeModals;
