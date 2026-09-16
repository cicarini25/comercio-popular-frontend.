import { registerSW } from 'virtual:pwa-register';

export function setupServiceWorker() {
  if ('serviceWorker' in navigator) {
    const updateSW = registerSW({
      onNeedRefresh() {
        console.log('Novo conteúdo disponível. Atualizando aplicação...');
        updateSW(true);
      },
      onOfflineReady() {
        console.log('Comércio Popular pronto para funcionar offline.');
      },
      onRegistered(r) {
        console.log('Service Worker registrado com sucesso:', r);
      },
      onRegisterError(error) {
        console.warn('Erro ao registrar Service Worker:', error);
      }
    });
  }
}
