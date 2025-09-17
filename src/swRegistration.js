import { registerSW } from 'virtual:pwa-register';

registerSW({
  onNeedRefresh() {
    if (confirm('New version available. Refresh now?')) {
      window.location.reload();
    }
  },
  onOfflineReady() {
    console.log('App ready to work offline');
  },
});
