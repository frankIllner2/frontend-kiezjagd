<template>
  <div class="legal-wrap">
    <header class="legal-header">
      <div class="brand">Kiezjagd</div>
      <div class="meta">
        Stand: <time datetime="2025-08-27">27.08.2025</time>
      </div>
    </header>

    <section id="impressum" class="section">
      <h1>Impressum</h1>

      <h3>Angaben gemäß § 5 DDG</h3>
      <p><strong>Frank Illner</strong></p>
      <p>
        Pasteurstraße 4<br />
        10407 Berlin
      </p>
      <p>
        Telefon: <a href="tel:+491735402049">0173&nbsp;5402049</a><br />
        E-Mail: <a href="mailto:mail@kiezjagd.de">mail@kiezjagd.de</a>
      </p>

      <h3>Dienstleistungsangebot &amp; Zahlungsabwicklung</h3>
      <p>
        Über die Website <strong>www.kiezjagd.de</strong> bieten wir digitale Spiele an.
        Die Zahlungsabwicklung erfolgt über den externen Dienstleister <em>Stripe Payments Europe</em>.
      </p>
      <p>
        Weitere Informationen findest du in unseren
        <a href="/agb">Allgemeinen Geschäftsbedingungen (AGB)</a>.
      </p>

      <h3>Haftung für Inhalte</h3>
      <p>
        Als Diensteanbieter sind wir nach § 7 Abs. 1 DDG für eigene Inhalte auf diesen
        Seiten verantwortlich. Nach §§ 8 bis 10 DDG sind wir jedoch nicht verpflichtet,
        übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen
        zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
      </p>

      <h3>Haftung für Links</h3>
      <p>
        Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir
        keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine
        Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige
        Anbieter oder Betreiber verantwortlich.
      </p>

      <h3>Verbraucherstreitbeilegung (§ 36 VSBG)</h3>
      <p>
        Wir sind weder verpflichtet noch bereit, an Streitbeilegungsverfahren vor einer
        Verbraucherschlichtungsstelle teilzunehmen.
      </p>
    </section>
  </div>
</template>

<script>
export default {
  name: "ImpressumSite",
};
</script>

<style scoped lang="scss">
/* ============ Kiezjagd – Legal Pages (Impressum) ============ */
$fg: #355b4c;
$muted: #666;
$line: #e8e8e8;
$accent: #355b4c;
$bg: #fff;
$max: 920px;

.legal-wrap {
  max-width: $max;
  margin-inline: auto;
  padding: 32px 20px;
  color: $fg;
  background: $bg;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, "Helvetica Neue", Arial, sans-serif;
  line-height: 1.65;
}

.legal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;

  .brand { font-weight: 700; letter-spacing: .2px; }
  .meta { font-size: .9rem; color: $muted; }
}

h1 {
  font-size: clamp(1.5rem, 1.1rem + 1.2vw, 1.9rem);
  margin: 0 0 8px;
  line-height: 1.25;
}
h3 {
  font-size: 1.05rem;
  margin: 20px 0 6px;
  line-height: 1.3;
}

strong {
  font-size: clamp(1rem, 1.3vw, 1em);
}

p { margin: 0 0 12px; }

a {
  color: $accent;
  text-decoration: underline;
  text-underline-offset: .15em;
}

.section { padding-block: 12px; border-top: 1px solid $line; }

/* Print */
@media print {
  a { color: inherit; text-decoration: none; }
  .section { page-break-inside: avoid; }
}
</style>
