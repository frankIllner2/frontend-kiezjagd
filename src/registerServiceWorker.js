/* eslint-disable no-console */
import { register } from 'register-service-worker';

if (process.env.NODE_ENV === 'production') {
  register(`${process.env.BASE_URL}service-worker.js`, {
    ready() {
      console.log(
        '✅ Die App wird von einem Service Worker aus dem Cache geladen. Weitere Details unter https://goo.gl/AFskqB'
      );
    },
    registered() {
      console.log('✅ Service Worker wurde erfolgreich registriert.');
    },
    cached() {
      console.log('✅ Inhalte wurden zwischengespeichert und sind offline verfügbar.');
    },
    updatefound() {
      console.log('🔄 Ein neues Update wird heruntergeladen.');
    },
    updated(registration) {
      console.log('⚡ Neues Update verfügbar. Bitte die Seite aktualisieren.');

      // Optionale Benachrichtigung für den Benutzer
      if (confirm('Eine neue Version ist verfügbar. Möchten Sie die Seite aktualisieren?')) {
        registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }
    },
    offline() {
      console.log('⚠️ Keine Internetverbindung gefunden. Die App läuft im Offline-Modus.');
    },
    error(error) {
      console.error('❌ Fehler bei der Registrierung des Service Workers:', error);
    },
  });
}
