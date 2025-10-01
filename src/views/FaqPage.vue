<template>
  <section class="faq-page container">
    <h1 class="page-title">Häufige Fragen (FAQ)</h1>

    <!-- Intro -->
    <div class="intro">
    <p>Willkommen bei den Kiezjagd-FAQs!</p><br />
    <p>Hier findest du Antworten auf alles, was euch rund um unsere Abenteuer-Spiele beschäftigt:<br>
    Wie funktioniert Kiezjagd?<br>
    Was braucht ihr an Technik?<br>
    Und was ist, wenn mal etwas nicht klappt?</p><br />
    <p>Tippt oder klickt einfach auf eine Frage und schon öffnet sich die passende Antwort – schnell, einfach und verständlich. So seid ihr bestens vorbereitet für euer Rätsel-Abenteuer im Kiez!</p>
    </div>

    <!-- Suchleiste -->
    <div class="faq-controls" role="search">
      <label class="visually-hidden" for="faq-search">FAQ durchsuchen</label>
      <input
        id="faq-search"
        v-model="query"
        type="search"
        inputmode="search"
        placeholder="Suche nach Stichworten (z. B. Standort, Gutschein, Audio)"
        aria-label="FAQ durchsuchen"
      />
    </div>

    <!-- Categories as accordions -->
    <div
      v-for="(section, sIdx) in filteredSections"
      :key="sIdx"
      class="faq-section"
      v-show="section.items.length"
    >
      <h2 class="section-title">{{ section.title }}</h2>

      <details
        v-for="(item, idx) in section.items"
        :key="idx"
        class="faq-item"
        :open="isInitiallyOpen(section, item, sIdx, idx)"
      >
        <summary class="faq-q">{{ item.q }}</summary>
        <div class="faq-a">
          <div class="faq-a-inner" v-html="item.a" />
        </div>
      </details>
    </div>

    <p v-if="filteredSections.length === 0" class="no-results">
      Keine Treffer. Versuch es mit anderen Begriffen (z. B. „Standort“, „Promo-Code“, „Rechnung“).
    </p>

    <div class="wrapper">
      <div class="icons-header" aria-hidden="true">
        <img src="@/assets/img/icons/fritz.png" alt="" />
        <img src="@/assets/img/icons/susi.png" alt="" />
        <img src="@/assets/img/icons/julia.png" alt="" />
        <img src="@/assets/img/icons/frank.png" alt="" />
      </div>

      <!-- Contact Teaser -->
      <div class="contact-teaser">
        <b>Noch Fragen?</b>
        <p>
          Schreib uns gern: <a :href="`mailto:${contactEmail}`">{{ contactEmail }}</a>
          <span v-if="contactPhone"> · Tel.: <a :href="`tel:${contactPhone}`">{{ contactPhone }}</a></span>
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// 🔧 Kontakte anpassen
const contactEmail = 'support@kiezjagd.de'
const contactPhone = '' // z. B. '+49 30 1234567'

// Helper: Paragraph
const p = (strings) => strings[0]

// Suche
const query = ref('')
const stripTags = (s) => s.replace(/<[^>]*>/g, ' ')
const isMatch = (item) => {
  const q = query.value.trim().toLowerCase()
  if (!q) return false
  return (
    item.q.toLowerCase().includes(q) ||
    stripTags(item.a).toLowerCase().includes(q)
  )
}

const sections = [
  {
    title: 'Allgemein & Bedienung',
    items: [
      {
        q: 'Was ist Kiezjagd?',
        a: p`Gemeinsam mit eurer Familie oder Freund:innen startet ihr draußen ein interaktives Abenteuer direkt in eurem Kiez.
            Jede Kiezjagd erzählt eine spannende Geschichte und stellt euch vor Rätsel und Aufgaben, die sich an besonderen Orten verstecken.`
      },
      {
        q: 'Was ist das Besondere an Kiezjagd?',
        a: p`Kiezjagd ist interaktiv und verknüpft Draußenzeit mit spielerischem Lernen. Anders als bei klassischen Schnitzeljagden braucht es keine Vorbereitung.
            Ihr wählt euer Spiel und euer Smartphone wird zum Spielleiter. So könnt ihr sofort loslegen – jederzeit und ohne Material.`
      },
      {
        q: 'Wie starte ich ein Spiel?',
        a: p`Nach dem Kauf erhaltet ihr eine E-Mail mit eurem Spiel-Link. Klickt ihn an, tippt euren Teamnamen ein – und das Abenteuer startet.
            Ab dann führt euch Kiezjagd Schritt für Schritt durch die Geschichte. Manchmal braucht die E-Mail ein paar Minuten – bitte etwas Geduld.`
      },
      {
        q: 'Wie lange dauert ein Spiel?',
        a: p`Je nach Spiel und Tempo seid ihr ca. 15 bis 60 Minuten unterwegs. Mit Kindern lohnt es sich, etwas Extra-Zeit einzuplanen
            – für Staunen, Toben und kleine Pausen.`
      },
      {
        q: 'Brauche ich mobiles Internet?',
        a: p`Ja, eine stabile Verbindung ist ideal. Kurze Aussetzer sind kein Problem – die Seite merkt sich den Fortschritt.
            Für ortsbezogene Aufgaben müssen die Standortdienste aktiviert sein.`
      },
      {
        q: 'Kann ich mit mehreren Personen auf einem Gerät spielen?',
        a: p`Am bequemsten zu zweit oder dritt an einem Smartphone; ein Tablet geht auch. Seid ihr mehr Personen?
            Teilt euch in zwei Teams auf – mit je einem eigenen Spiel-Link – und startet gleichzeitig.`
      }
    ]
  },
  {
    title: 'Technik (Geräte, Standort, Audio)',
    items: [
      {
        q: 'Welche Geräte und Browser werden unterstützt?',
        a: p`Aktuelle Versionen von Chrome, Safari, Firefox und Edge auf iOS (ab iOS 15), Android (ab Android 9) und moderne Desktop-Browser.
            Bitte automatische Browser-Updates aktivieren.`
      },
      {
        q: 'Funktioniert die Standortprüfung auch mit einem Tablet ohne SIM-Karte?',
        a: p`Ja. Verbindet euer Tablet mit dem WLAN und schaltet die Standortdienste ein – der Standort wird über WLAN (und je nach Gerät auch GPS) bestimmt.`
      },
      {
        q: 'Brauche ich die Standortfreigabe?',
        a: p`Nur für Rätsel, die an einen Ort gebunden sind. Der Browser fragt euch automatisch; ihr könnt die Freigabe später wieder entziehen.`
      },
      {
        q: 'Speichert ihr meinen Standort?',
        a: p`Nein. Die Prüfung läuft im Browser. Wir speichern lediglich, ob eine Aufgabe gelöst wurde – keine Roh-Koordinaten.`
      },
      {
        q: 'Das Audio wird nicht abgespielt – was tun?',
        a: p`Tippt einmal aktiv auf ▶️ (Autoplay-Schutz). Prüft Stumm-Schalter und Medienlautstärke. iOS: Lautlos-Schalter aus. Android: Medienlautstärke hoch.`
      },
      {
        q: 'Kann ich das Spiel auf mehreren Geräten nutzen?',
        a: p`Euer Zugang ist 48 Stunden nach Start gültig. Standardmäßig ist das Spielen für das zuerst verwendete Gerät vorgesehen,
            damit Teams nicht parallel auf mehreren Geräten spielen.`
      }
    ]
  },
  {
    title: 'Bestellung, Zahlung & Gutscheine',
    items: [
      {
        q: 'Wie könnt ihr bezahlen?',
        a: p`Einfach und sicher über Stripe mit gängigen Karten. Je nach Gerät und Browser funktionieren auch Apple Pay oder Google Pay.`
      },
      {
        q: 'Wo kann ich meinen Gutschein oder Promo-Code eingeben?',
        a: p`Im Stripe-Checkout findest du – sofern kein automatischer Rabatt aktiv ist – das Feld „Promotion code“. Code eingeben und bestätigen.`
      },
      {
        q: 'Wie erhalte ich eine Rechnung?',
        a: p`Nach dem Kauf erhaltet ihr eine E-Mail-Bestätigung mit Bestellinfos sowie eine Rechnung. Den Spiel-Link erhaltet ihr in einer separaten E-Mail.`
      },
      {
        q: 'Bekommen wir am Ende eine Urkunde?',
        a: p`Bei manchen Kiezjagden gibt es am Ende eine persönliche PDF-Urkunde. Wenn die Funktion für das Spiel aktiviert ist,
            bekommt ihr sie automatisch per E-Mail.`
      }
    ]
  },
  {
    title: 'Rechtliches & Datenschutz',
    items: [
      {
        q: 'Wie steht’s mit dem Datenschutz?',
        a: p`Wir erheben nur notwendige Daten (z. B. eure E-Mail für den Spiel-Link). Für Reichweitenmessung nutzen wir Plausible – cookielos und ohne Profile.`
      },
      {
        q: 'Habt ihr ein Widerrufsrecht?',
        a: p`Bei digitalen Inhalten kann das Widerrufsrecht erlöschen, sobald ihr zustimmt, dass wir direkt starten. Details stehen in der Widerrufsbelehrung.`
      },
      {
        q: 'Wer haftet, wenn etwas passiert?',
        a: p`Ihr spielt eigenverantwortlich im öffentlichen Raum. Achtet auf Verkehr, Wege und Wetter. Kinder brauchen die Begleitung und Aufsicht Erwachsener.`
      },
      {
        q: 'Darf ich Texte, Bilder und Materialien weiterverwenden?',
        a: p`Alle Inhalte sind urheberrechtlich geschützt und nur für das Spiel gedacht. Eine Weitergabe oder Veröffentlichung ist nicht erlaubt.`
      }
    ]
  },
  {
    title: 'Kontakt',
    items: [
      {
        q: 'Wie können wir euch erreichen?',
        a: p`Am schnellsten per E-Mail an <a href="mailto:${contactEmail}">${contactEmail}</a>.`
      }
    ]
  },
  {
    title: 'Troubleshooting (Kurz & Knapp)',
    items: [
      {
        q: 'Die Seite reagiert nicht oder lädt langsam – was tun?',
        a: p`Browser neu laden, schwaches Netz wechseln (WLAN/LTE), ggf. Browser-Cache leeren. Wenn gar nichts hilft: Gerät neu starten.`
      },
      {
        q: 'Warum wird mein Standort nicht erkannt?',
        a: p`Standortfreigabe erteilen, WLAN/GPS aktivieren und Browser-Rechte prüfen. Bei Tablets ohne SIM: mit WLAN verbinden.`
      },
      {
        q: 'Warum höre ich kein Audio?',
        a: p`Einmal aktiv auf ▶️ tippen, Stummschalter aus, Medienlautstärke hoch. Verbundene Bluetooth-Geräte prüfen.`
      }
    ]
  }
]

// Gefilterte Ansicht für die Suche
const filteredSections = computed(() => {
  const q = query.value.trim()
  if (!q) return sections
  const mapped = sections.map((sec) => ({
    title: sec.title,
    items: sec.items.filter(isMatch)
  }))
  return mapped.filter((sec) => sec.items.length > 0)
})

// Auto-Öffnen: Bei Suche öffnen wir nur die Treffer; ohne Suche bleibt (0,0) geöffnet
const isInitiallyOpen = (section, item, sIdx, idx) => {
  if (query.value.trim()) return isMatch(item)
  return idx === 0 && sIdx === 0
}

// SEO: FAQPage Schema.org (unabhängig von der Suche immer mit allen Fragen)
const schemaOrg = computed(() => {
  const qa = sections.flatMap((sec) =>
    sec.items.map((item) => ({
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

// JSON-LD in <head> einfügen (ohne externe Abhängigkeit)
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
  color: #355b4c;
}
.page-title {
  font-size: clamp(1.6rem, 2vw, 2.2rem);
  font-weight: 800;
  margin: 0 0 0.75rem;
}
.intro {
  color: #355b4c;
  margin-bottom: 1.25rem;
}

/* Suche */
.faq-controls { margin: 1rem 0 1.25rem; }
.faq-controls input[type="search"] {
  width: 100%;
  padding: .75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: .75rem;
  font-size: 1rem;
  outline: none;
}
.faq-controls input[type="search"]:focus {
  border-color: #355b4c;
  box-shadow: 0 0 0 3px rgba(53,91,76,.15);
}
.no-results { color: #6b7280; font-style: italic; margin: .75rem 0 1rem; }

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
  background: #f4ebd0;
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
  content: '▼';
  position: absolute;
  right: 1rem;
  transition: transform .2s ease;
}
.faq-item[open] .faq-q::after { transform: rotate(180deg); }

/* Animierte Antwort (Fade + leichter Slide) */
.faq-a { padding: 0 1rem 1rem; }
.faq-a-inner {
  color: #334155;
  opacity: 0;
  transform: translateY(-4px);
  transition: opacity .22s ease, transform .22s ease;
}
.faq-item[open] .faq-a-inner {
  opacity: 1;
  transform: translateY(0);
}

.contact-teaser {
  margin-top: 2rem;
  padding: 1rem;
  background: #f4ebd0;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
}
.contact-teaser h2 { margin: 0 0 .25rem; }

/* Dark mode (optional) */
@media (prefers-color-scheme: dark) {
  .faq-item { background: #0b1220; border-color: #1f2937; }
  .faq-item[open] { border-color: #334155; }
  .faq-q { color: #e5e7eb; }
  .faq-a-inner { color: #cbd5e1; }
  .intro { color: #9aa7b3; }
  .section-title { color: #e5e7eb; }
  .contact-teaser { background: #0b1220; border-color: #1f2937; }
}

.icons-header {
  display: flex;
  justify-content: space-evenly;
  flex-direction: row;
  margin-bottom: -30px;
}
.icons-header img {
  max-width: 100px;
  height: auto;
}

/* Mobile: nur 1 Bild sichtbar */
@media (max-width: 599px) {
  .icons-header img:not(:first-child) { display: none; }
}
/* Tablet: nur die ersten 2 sichtbar */
@media (min-width: 600px) and (max-width: 899px) {
  .icons-header img:nth-child(n+3) { display: none; }
}
/* Größeres Tablet: nur die ersten 3 sichtbar */
@media (min-width: 900px) and (max-width: 1199px) {
  .icons-header img:nth-child(n+4) { display: none; }
}
/* Desktop: alle 4 sichtbar */
@media (min-width: 1200px) {
  .icons-header img { display: inline; }
}

/* A11y helper */
.visually-hidden {
  position: absolute !important;
  height: 1px; width: 1px;
  overflow: hidden; clip: rect(1px,1px,1px,1px);
  white-space: nowrap;
}
</style>
