<template>
  <div class="impressum-container">
    <h3>Datenschutzerklärung</h3>

    <h4>1. Verantwortliche Stelle</h4>
    <p>Frank Illner und Julia Schmidt</p>
    <p>Pasteurstraße 4<br>10407 Berlin</p>
    <p>Telefon: <a href="tel:+491735402049">0173 5402049</a></p>
    <p>E-Mail: <a href="mailto:mail@kiezjagd.de">mail@kiezjagd.de</a></p>

    <h4>2. Welche Daten wir speichern</h4>
    <p>
      Wir speichern ausschließlich die E-Mail-Adresse und Spielergebnisse (Teamnamen, Punktestand),
      um die Teilnahme am Spiel zu ermöglichen und Nachrichten zu versenden. Die Spielergebnisse werden dauerhaft gespeichert,
      die E-Mail-Adresse kann vom Nutzer jederzeit selbstständig gelöscht werden. Es erfolgt keine Weitergabe der Daten an Dritte.
    </p>

    <h4>3. Hosting</h4>
    <p>
      Unsere Website wird bei Vercel und Render gehostet. Dabei werden beim Aufruf Verbindungsdaten (z.&#8201;B. IP-Adresse, Zeitstempel)
      in Server-Logfiles erfasst. Diese Daten dienen ausschließlich der technischen Bereitstellung und werden nicht dauerhaft gespeichert.
    </p>

    <h4>4. Zahlungsabwicklung mit Stripe</h4>
    <p>
      Die Zahlungsabwicklung erfolgt über den externen Dienstleister Stripe Payments Europe, Ltd. (Irland). Zahlungsdaten
      werden direkt an Stripe übermittelt und dort verarbeitet. Wir speichern selbst keine Zahlungsinformationen.
    </p>
    <p>
      Weitere Informationen finden Sie in der <a href="https://stripe.com/de/privacy" target="_blank" rel="noopener">Datenschutzerklärung von Stripe</a>.
    </p>

    <h4>5. Cookies und Tracking</h4>
    <p>
      Unsere Website verwendet keine externen Tracking-Tools. Es werden lediglich technisch notwendige Cookies zur
      Session-Verwaltung verwendet, um Spielstände zu speichern. Eine Auswertung erfolgt nicht.
    </p>

    <h4>6. Formulareingaben</h4>
    <p>
      Bei der Bestellung wird Ihre E-Mail-Adresse abgefragt, um Sie dem Spiel zuzuordnen und Ihnen Informationen zu senden.
      Mit der Eingabe erklären Sie sich mit der Verarbeitung einverstanden. Eine gesonderte Checkbox zur Einwilligung wird aktuell nicht verwendet.
    </p>

    <h4>7. Öffentliche Sichtbarkeit</h4>
    <p>
      Die Spielergebnisse (Teamname, Punktestand) sind auf der Website öffentlich sichtbar. E-Mail-Adressen werden dabei niemals angezeigt.
    </p>

    <h4>8. Ihre Rechte</h4>
    <p>
      Sie haben das Recht auf Auskunft, Berichtigung, Löschung oder Einschränkung Ihrer gespeicherten Daten sowie das Recht auf Widerspruch und Datenübertragbarkeit.
      Bitte wenden Sie sich dazu an: <a href="mailto:mail@kiezjagd.de">mail@kiezjagd.de</a>
    </p>

    <h4>9. Änderungen</h4>
    <p>
      Diese Datenschutzerklärung kann jederzeit angepasst werden, z.&#8201;B. bei technischen Änderungen oder gesetzlichen Vorgaben.
    </p>

    <p><em>Stand: Mai 2025</em></p>
  </div>
</template>

<script>
export default {
  name: 'PrivacypolicySite',
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
.impressum-container h1,
.impressum-container h4,
.impressum-container h4 {
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
