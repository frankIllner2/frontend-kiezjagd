<template>
  <div class="not-found">
    <h1>404 - Seite nicht gefunden</h1>
    <p>Die gesuchte Seite existiert nicht.</p><br />
    <router-link to="/" class="btn btn--primary">Zurück zur Startseite</router-link>
  </div>
</template>

<style scoped>
.not-found {
  text-align: center;
  margin-top: 50px;
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
