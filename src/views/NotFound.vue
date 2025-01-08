<template>
    <div class="not-found">
      <h1>404 - Seite nicht gefunden</h1>
      <p>Die gesuchte Seite existiert nicht.</p>
      <router-link to="/">Zurück zur Startseite</router-link>
    </div>
  </template>
  
  <style scoped>
  .not-found {
    text-align: center;
    margin-top: 50px;
  }
  h1 {
    font-size: 2rem;
    margin-bottom: 10px;
  }
  p {
    font-size: 1.2rem;
  }
  a {
    color: #4caf50;
    text-decoration: none;
  }
  </style>
  