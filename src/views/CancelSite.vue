<template>
    <div class="error-page">
      <h1>Zahlung abgebrochen!</h1>
      <p>Deine Zahlung wurde abgebrochen. Versuche es erneut.</p>
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
    color: #f44336;
  }
  .btn-primary {
    margin-top: 20px;
    background-color: #4caf50;
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    text-decoration: none;
  }
  a {
    color: #4caf50;
    text-decoration: none;
  }
  </style>
  