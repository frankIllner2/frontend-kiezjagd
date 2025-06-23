<template>
  <div class="agb-container">
    <h3>Allgemeine Geschäftsbedingungen (AGB)</h3>

    <h3>1. Geltungsbereich</h3>
    <p>Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Verträge, die über die Website <strong>www.kiezjagd.de</strong> zwischen den Kunden und den Betreibern der Website, Frank Illner und Julia Schmidt, abgeschlossen werden.</p>

    <h3>2. Vertragsabschluss</h3>
    <p>Durch den Abschluss einer Bestellung über unseren Zahlungsanbieter <strong>Stripe</strong> kommt ein verbindlicher Vertrag zwischen dem Kunden und uns zustande. Nach erfolgreicher Zahlung erhält der Kunde Zugriff auf die gekaufte digitale Ware.</p>

    <h3>3. Bereitstellung digitaler Inhalte</h3>
    <p>Die Bereitstellung der digitalen Spiele erfolgt unmittelbar nach Zahlungseingang. Der Kunde erhält per E-Mail oder über das Benutzerkonto einen Download-Link bzw. direkten Zugriff auf die gekauften Inhalte.</p>

    <h3>4. Widerrufsrecht</h3>
    <p>Da es sich um digitale Produkte handelt, die nach dem Kauf sofort zur Verfügung gestellt werden, entfällt das gesetzliche Widerrufsrecht gemäß § 356 Abs. 5 BGB, sobald der Kunde dem Beginn der Ausführung ausdrücklich zugestimmt hat.</p>

    <h3>5. Preise & Zahlungsabwicklung</h3>
    <p>Alle Preise verstehen sich in Euro und enthalten die gesetzliche Mehrwertsteuer. Die Zahlungsabwicklung erfolgt über <strong>Stripe</strong>. Durch Nutzung dieses Dienstes akzeptiert der Kunde die AGB von Stripe (<a href="https://stripe.com/de/legal" target="_blank">https://stripe.com/de/legal</a>).</p>

    <h3>6. Spielvoraussetzungen & Teilnahmebedingungen</h3>
    <p>Für die Durchführung der Spiele wird ein internetfähiges Smartphone benötigt. Die Nutzung erfolgt im öffentlichen Raum und erfordert Aufmerksamkeit im Straßenverkehr sowie wettergerechte Kleidung. Die Teilnahme setzt eine ausreichende körperliche Verfassung der Teilnehmenden voraus.</p>

    <h3>7. Gewährleistung & Haftung</h3>
    <p>Wir haften nicht für technische Störungen oder Unverträglichkeiten der digitalen Inhalte mit der Hardware oder Software des Kunden. Sollte es Probleme mit dem Download oder der Nutzung geben, bitten wir um Kontaktaufnahme unter <a href="mailto:support@kiezjagd.de">support@kiezjagd.de</a>.</p>

    <p>Die Teilnahme an den Spielen erfolgt auf eigene Gefahr. Eltern bzw. Erziehungsberechtigte sind während des gesamten Spiels für die Aufsicht und Sicherheit ihrer Kinder verantwortlich. Die Betreiber übernehmen keine Haftung für Personen- oder Sachschäden, die während der Durchführung des Spiels entstehen, insbesondere nicht für Verletzungen durch Stürze oder für Schäden an mitgeführten Geräten (z. B. Smartphones). Wir weisen ausdrücklich darauf hin, dass die Nutzung im öffentlichen Raum stattfindet und entsprechende Vorsicht geboten ist.</p>

    <h3>8. Verfügbarkeit & technische Hinweise</h3>
    <p>Wir bemühen uns um eine hohe Verfügbarkeit der Inhalte, übernehmen jedoch keine Garantie für eine unterbrechungsfreie Nutzung. Wartungsarbeiten oder technische Störungen können den Zugriff vorübergehend einschränken.</p>

    <h3>9. Kontakt bei Problemen</h3>
    <p>Bei technischen Schwierigkeiten, Fragen zur Nutzung oder Problemen während des Spiels erreichen Sie uns jederzeit unter <a href="mailto:support@kiezjagd.de">support@kiezjagd.de</a>. Wir bemühen uns um eine zeitnahe Rückmeldung.</p>

    <h3>10. Datenschutz</h3>
    <p>Alle personenbezogenen Daten werden gemäß unserer <a href="/datenschutz">Datenschutzerklärung</a> verarbeitet.</p>

    <h3>11. Schlussbestimmungen</h3>
    <p>Es gilt das Recht der Bundesrepublik Deutschland. Sollten einzelne Bestimmungen dieser AGB unwirksam sein, bleibt die Gültigkeit der übrigen Bestimmungen unberührt.</p>
  </div>
</template>

<script>
export default {
  name: 'AgbSite',
};
</script>

<style scoped>
.agb-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
  line-height: 1.6;
}
.agb-container h1, .agb-container h3 {
  color: #333;
}
.agb-container a {
  color: #0066cc;
  text-decoration: none;
}
.agb-container a:hover {
  text-decoration: underline;
}
</style>
