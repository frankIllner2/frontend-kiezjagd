/* eslint-disable no-console */
import { register } from 'register-service-worker';

if (process.env.NODE_ENV === 'production') {
  let hasRefreshed = false;

  if (navigator.serviceWorker) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (hasRefreshed) return;
      hasRefreshed = true;
      window.location.reload();
    });
  }

  register(`${process.env.BASE_URL}service-worker.js`, {
    ready() {
      console.log('✅ Die App wird von einem Service Worker aus dem Cache geladen. Weitere Details unter https://goo.gl/AFskqB');
    },

    registered(registration) {
      console.log('✅ Service Worker wurde erfolgreich registriert.');

      if (registration.waiting) {
        promptUserAndActivate(registration);
      }

      if (registration.installing) {
        registration.installing.addEventListener('statechange', () => {
          if (registration.waiting) {
            promptUserAndActivate(registration);
          }
        });
      }
    },

    cached() {
      console.log('✅ Inhalte wurden zwischengespeichert und sind offline verfügbar.');
    },

    updatefound() {
      console.log('🔄 Ein neues Update wird heruntergeladen.');
    },

    updated(registration) {
      console.log('⚡ Neues Update verfügbar. Bitte die Seite aktualisieren.');
      promptUserAndActivate(registration);
    },

    offline() {
      console.log('⚠️ Keine Internetverbindung gefunden. Die App läuft im Offline-Modus.');
    },

    error(error) {
      console.error('❌ Fehler bei der Registrierung des Service Workers:', error);
    },
  });
}

function promptUserAndActivate(registration) {
  const versionKey = (registration.waiting && registration.waiting.scriptURL) || 'sw-unknown';
  const shownKey = `sw-prompt-shown:${versionKey}`;

  try {
    if (window.localStorage && localStorage.getItem(shownKey)) {
      return;
    }
  } catch (e) {
    // localStorage nicht verfügbar → ignorieren
  }

  const ok = window.confirm('Eine neue Version ist verfügbar. Möchten Sie die Seite aktualisieren?');
  if (!ok) {
    try {
      if (window.localStorage) {
        localStorage.setItem(shownKey, '1');
      }
    } catch (e) {
      // Speicherung fehlgeschlagen → ignorieren
    }
    return;
  }

  if (registration.waiting) {
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    try {
      if (window.localStorage) {
        localStorage.setItem(shownKey, '1');
      }
    } catch (e) {
      // Speicherung fehlgeschlagen → ignorieren
    }
  }
}
