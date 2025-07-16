<template>
    <div class="impressum-container">
      <h3>Impressum</h3>
      <p>Angaben gemäß § 5 TMG:</p>
      <p><strong>Frank Illner und Julia Schmidt</strong></p>
      <p>Pasteurstraße 4<br>10407 Berlin</p>
      <p>Telefon: <a href="tel:+491735402049">0173 5402049</a></p>
      <p>E-Mail: <a href="mailto:mail@kiezjagd.de">mail@kiezjagd.de</a></p>
      
      <h4>Dienstleistungsangebot & Zahlungsabwicklung</h4>
      <p>
        Über die Website www.kiezjagd.de bieten wir digitale Spiele an. Die Zahlungsabwicklung erfolgt über den externen Dienstleister Stripe, Inc.
      </p>
      <p>
        Adresse: 354 Oyster Point Blvd, South San Francisco, CA 94080, USA
      </p>
      <p>
        Weitere Informationen zu den Vertragsbedingungen und dem Zahlungsprozess finden Sie in unseren <a href="/agb">Allgemeinen Geschäftsbedingungen (AGB)</a>.
      </p>
      
      <h4>Haftung für Inhalte</h4>
      <p>
        Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten
        nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch
        nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen
        zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
      </p>
      
      <h4>Haftung für Links</h4>
      <p>
        Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben.
        Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten
        Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
      </p>
      
      <h4>Online-Streitbeilegung</h4>
      <p>
        Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:
        <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener">https://ec.europa.eu/consumers/odr</a>.
      </p>
      <p>
        Unsere E-Mail-Adresse finden Sie oben im Impressum.
      </p>
    </div>
  </template>

  <script>
  export default {
    name: 'ImpressumSite',
  };
  </script>
  
  <style scoped>
  .impressum-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    font-family: Arial, sans-serif;
    line-height: 1.6;
  }
  .impressum-container h1, .impressum-container h3 {
    color: #333;
  }
  .impressum-container a {
    color: #0066cc;
    text-decoration: none;
  }
  .impressum-container a:hover {
    text-decoration: underline;
  }
  </style>