<template>
    <div class="error-page">
      <h1>Zahlung abgebrochen!</h1>
      <p>Deine Zahlung wurde abgebrochen. Versuche es erneut.</p><br /><br />
      <router-link to="/" class="btn btn--primary">Zurück zur Startseite</router-link>
    </div>
</template>


  <style scoped>
  .error-page {
    text-align: center;
    width: 70%;
    margin: 150px auto;
  }
  h1 {
    color: #355b4c;
  }
  .btn-primary {
    margin-top: 20px;
    background-color: #355b4c;
    color: #FAC227;
    padding: 10px 20px;
    border-radius: 5px;
    text-decoration: none;
  }
  a {
    color: #355b4c;
    text-decoration: none;
  }
  </style>
  