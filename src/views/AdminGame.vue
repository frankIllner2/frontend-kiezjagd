<template>
    <div class="game-container">
      <b>🔧 Admin-Modus: Spielansicht</b>
      <GameView :gameId="encryptedId" /> <!-- ✅ Hier wird die ID explizit übergeben -->
    </div>
  </template>
  
  <script>
  import GameView from "@/views/Game.vue";
  
  export default {
    components: { GameView },
    props: ["encryptedId"], // 🔥 AdminGame empfängt `encryptedId`
    mounted() {
      console.log("🛠 AdminGame geladen mit encryptedId:", this.encryptedId);
    }
  };
  </script>
  