<template>
  <section class="faq-page container">
    <h1 class="page-title">Häufige Fragen (FAQ)</h1>

    <!-- Intro -->
    <p class="intro">
      Hier beantworten wir die wichtigsten Fragen rund um Kiezjagd: Bedienung, Technik,
      Rechtliches und Kontakt. Tippe/Klicke auf eine Frage, um die Antwort zu öffnen.
    </p>

    <!-- Categories as accordions -->
    <div v-for="(section, sIdx) in sections" :key="sIdx" class="faq-section">
      <h2 class="section-title">{{ section.title }}</h2>

      <details v-for="(item, idx) in section.items" :key="idx" class="faq-item" :open="idx === 0 && sIdx === 0">
        <summary class="faq-q">{{ item.q }}</summary>
        <div class="faq-a" v-html="item.a" />
      </details>
    </div>

    <!-- Contact Teaser -->
    <div class="contact-teaser">
      <h2>Noch Fragen?</h2>
      <p>
        Schreib uns gern: <a :href="`mailto:${contactEmail}`">{{ contactEmail }}</a>
        <span v-if="contactPhone"> · Tel.: <a :href="`tel:${contactPhone}`">{{ contactPhone }}</a></span>
      </p>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'

// 🔧 Passen Sie diese Kontaktdaten an Ihr Projekt an
const contactEmail = 'support@kiezjagd.de'
const contactPhone = '' // optional, z. B. '+49 30 1234567'

// Helper to wrap paragraphs safely
const p = (strings) => strings[0]

const sections = [
  {
    title: 'Allgemein & Bedienung',
    items: [
      {
        q: 'Was ist Kiezjagd?',
        a: p`Kiezjagd ist ein interaktives Rätsel- und Entdeckungsspiel für Familien und Gruppen.
            Ihr folgt einer Geschichte, löst Aufgaben vor Ort (z. B. an Brunnen, Statuen oder Schildern)
            und sammelt Hinweise, um am Ende den Geheimcode zu knacken.`
      },
      {
        q: 'Wie starte ich ein Spiel?',
        a: p`Nach dem Kauf erhaltet ihr einen Link per E-Mail. Öffnet den Link auf eurem Gerät,
            gebt euren Teamnamen ein und folgt der ersten Anweisung. Das Spiel führt euch Schritt für Schritt.`
      },
      {
        q: 'Wie lange dauert ein Spiel?',
        a: p`Je nach Spiel und Tempo ca. 15–60 Minuten. Plant bei Ausflügen mit Kindern lieber etwas Luft ein.`
      },
      {
        q: 'Brauche ich mobiles Internet?',
        a: p`Ja, ein stabiler Internetzugang ist empfohlen. Kurze Unterbrechungen sind unkritisch,
            die Seite puffert Inhalte. Für Standort-Aufgaben müssen die Standortdienste aktiviert sein.`
      },
      {
        q: 'Kann ich mit mehreren Personen auf einem Gerät spielen?',
        a: p`Ja. Am bequemsten spielt es sich zu zweit/dritt an einem Smartphone. Alternativ kann ein Tablet genutzt werden.`
      }
    ]
  },
  {
    title: 'Technik (Geräte, Standort, Audio)',
    items: [
      {
        q: 'Welche Geräte und Browser werden unterstützt?',
        a: p`Aktuelle Versionen von Chrome, Safari, Firefox und Edge auf iOS (ab iOS 15) und Android (ab Android 9)
            sowie moderne Desktop-Browser. Bitte automatische Browser-Updates aktivieren.`
      },
      {
        q: 'Tablet ohne SIM – funktioniert die Standortprüfung?',
        a: p`Ja. Verbindet das Tablet per WLAN und aktiviert die Standortdienste. Die Position wird dann über WLAN-Netze
            (und ggf. GPS je nach Gerät) bestimmt.`
      },
      {
        q: 'Muss ich meinen Standort freigeben?',
        a: p`Nur bei Aufgaben, die einen Ort prüfen. Der Browser fragt euch automatisch. Ihr könnt die Freigabe später in den Einstellungen widerrufen.`
      },
      {
        q: 'Speichert ihr meinen Standort?',
        a: p`Nein. Die Standortprüfung passiert im Browser. Wir speichern lediglich, ob eine Aufgabe gelöst wurde – keine Roh-Koordinaten.`
      },
      {
        q: 'Audio wird nicht abgespielt – was tun?',
        a: p`Tippt zuerst einmal auf den ▶️-Button (Autoplay-Schutz). Prüft die Systemlautstärke und den Stumm-Schalter.
            In iOS: Lautlos-Schalter deaktivieren. In Android: Medienlautstärke erhöhen.`
      },
      {
        q: 'Kann ich das Spiel auf mehreren Geräten nutzen?',
        a: p`Euer Zugang ist 72 Stunden nach Start gültig. Standardmäßig ist das Spielen für das zuerst verwendete Gerät vorgesehen,
            damit Teams nicht parallel auf mehreren Geräten spielen.`
      }
    ]
  },
  {
    title: 'Bestellung, Zahlung & Gutscheine',
    items: [
      {
        q: 'Welche Zahlungsarten sind möglich?',
        a: p`Die Bezahlung erfolgt sicher über Stripe mit gängigen Karten. Apple Pay / Google Pay können – je nach Gerät und Browser – ebenfalls verfügbar sein.`
      },
      {
        q: 'Wo gebe ich einen Gutschein- oder Promo-Code ein?',
        a: p`Im Stripe-Checkout gibt es (sofern kein automatischer Rabatt aktiv ist) ein Feld "Promotion code".
            Den Code dort eingeben und bestätigen.`
      },
      {
        q: 'Erhalte ich eine Rechnung / Bestätigung?',
        a: p`Ja, nach dem Kauf erhaltet ihr eine E-Mail-Bestätigung mit Bestellinformationen und dem Spiel-Link.`
      },
      {
        q: 'Bekommen wir am Ende eine Urkunde?',
        a: p`Optional: Am Ende kann automatisch eine personalisierte PDF-Urkunde erzeugt und per E-Mail gesendet werden (wenn beim Spiel aktiviert).`
      }
    ]
  },
  {
    title: 'Rechtliches & Datenschutz',
    items: [
      {
        q: 'Wie geht ihr mit Datenschutz um?',
        a: p`Wir erheben nur die Daten, die für den Betrieb notwendig sind (z. B. E-Mail zur Zustellung des Spiel-Links).
            Für Reichweitenmessung nutzen wir Plausible Analytics – cookielos und ohne personalisierte Profile.`
      },
      {
        q: 'Gibt es ein Widerrufsrecht?',
        a: p`Für digitale Inhalte kann das Widerrufsrecht erlöschen, sobald ihr ausdrücklich zustimmt, dass wir mit der Ausführung vor Ablauf der Frist beginnen.
            Details findet ihr in der Widerrufsbelehrung auf unserer Website.`
      },
      {
        q: 'Wer haftet bei Unfällen während des Spiels?',
        a: p`Ihr spielt eigenverantwortlich im öffentlichen Raum. Achtet auf Verkehr, Wege und Witterung.
            Kinder benötigen die Aufsicht ihrer Begleitpersonen.`
      },
      {
        q: 'Urheberrecht & Nutzung der Inhalte',
        a: p`Texte, Bilder, Audio und Spielmaterialien sind urheberrechtlich geschützt. Eine Weitergabe oder Veröffentlichung außerhalb des Spiels ist nicht gestattet.`
      }
    ]
  },
  {
    title: 'Kontakt',
    items: [
      {
        q: 'Wie können wir euch erreichen?',
        a: p`Am schnellsten per E-Mail an <a href="mailto:${contactEmail}">${contactEmail}</a>.
            Bitte nennt Spieltitel, Kaufdatum und – falls vorhanden – eure Bestellnummer, damit wir schneller helfen können.`
      },
      {
        q: 'Support-Zeiten',
        a: p`Wir antworten i. d. R. werktags binnen 24–48 Stunden.`
      }
    ]
  },
  {
    title: 'Troubleshooting (Kurz & Knapp)',
    items: [
      {
        q: 'Seite reagiert nicht oder lädt langsam',
        a: p`Browser neu laden, schwaches Netz wechseln (WLAN/LTE), ggf. Browser-Cache leeren. Notfalls Gerät neu starten.`
      },
      {
        q: 'Standort wird nicht erkannt',
        a: p`Standortfreigabe erteilen, WLAN/GPS aktivieren, Browser-Rechte prüfen. Bei Tablets ohne SIM: mit WLAN verbinden.`
      },
      {
        q: 'Audio ist stumm',
        a: p`Einmal aktiv abspielen (Tap/Klick), Stummschalter aus, Medienlautstärke hoch. Externe Bluetooth-Geräte prüfen.`
      }
    ]
  }
]

// SEO: FAQPage Schema.org
const schemaOrg = computed(() => {
  const qa = sections.flatMap(sec =>
    sec.items.map(item => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a }
    }))
  )
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: qa
  })
})

// JSON-LD via Head einfügen ohne zusätzliche Abhängigkeit
let ldScriptEl = null
onMounted(() => {
  try {
    const el = document.createElement('script')
    el.type = 'application/ld+json'
    el.text = schemaOrg.value
    document.head.appendChild(el)
    ldScriptEl = el
  } catch (e) {
    console.warn('JSON-LD konnte nicht in den <head> eingefügt werden:', e)
  }
})

onUnmounted(() => {
  if (ldScriptEl && ldScriptEl.parentNode) {
    ldScriptEl.parentNode.removeChild(ldScriptEl)
    ldScriptEl = null
  }
})
</script>

<style scoped>
.container {
  max-width: 960px;
  margin: 0 auto;
  padding: 1.5rem;
}
.page-title {
  font-size: clamp(1.6rem, 2vw, 2.2rem);
  font-weight: 800;
  margin: 0 0 0.75rem;
}
.intro {
  color: #475569;
  margin-bottom: 1.25rem;
}
.faq-section { margin: 1.5rem 0; }
.section-title {
  font-size: 1.125rem;
  font-weight: 700;
  margin: 1rem 0 0.5rem;
}
.faq-item {
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  margin: 0.5rem 0;
  background: #fff;
  overflow: hidden;
}
.faq-item[open] {
  border-color: #cbd5e1;
  box-shadow: 0 2px 8px rgba(0,0,0,.04);
}
.faq-q {
  cursor: pointer;
  list-style: none;
  padding: 0.9rem 1rem;
  font-weight: 600;
  position: relative;
}
.faq-q::marker { display: none; }
.faq-q::-webkit-details-marker { display: none; }
.faq-q::after {
  content: '\25BC';
  position: absolute;
  right: 1rem;
  transition: transform .2s ease;
}
.faq-item[open] .faq-q::after { transform: rotate(180deg); }
.faq-a {
  padding: 0 1rem 1rem;
  color: #334155;
}
.contact-teaser {
  margin-top: 2rem;
  padding: 1rem;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
}
.contact-teaser h2 { margin: 0 0 .25rem; }

/* Dark mode (optional) */
@media (prefers-color-scheme: dark) {
  .faq-item { background: #0b1220; border-color: #1f2937; }
  .faq-item[open] { border-color: #334155; }
  .faq-q { color: #e5e7eb; }
  .faq-a { color: #cbd5e1; }
  .intro { color: #9aa7b3; }
  .section-title { color: #e5e7eb; }
  .contact-teaser { background: #0b1220; border-color: #1f2937; }
}
</style>
