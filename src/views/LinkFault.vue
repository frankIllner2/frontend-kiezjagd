<template>
    <div class="error-page">
      <h1>Link abgelaufen</h1>
      <p>Leider ist der Link für dieses Spiel nicht mehr gültig.</p><br />
      <router-link to="/" class="btn btn--primary">Zurück zur Startseite</router-link>
    </div>
  </template>
  
  <script>
  export default {
    name: 'LinkFault',
  };
  </script>
  
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
  