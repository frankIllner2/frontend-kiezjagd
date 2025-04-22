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
    margin-top: 50px;
    width: 50%;
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
  