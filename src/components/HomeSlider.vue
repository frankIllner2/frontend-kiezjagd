<template>
  <BaseSlider
    title="Wähle dein Spiel!"
    :items="games"
    sliderId="game-preview-section"
    containerClass="container game-preview-section"
  >
    <template v-slot:default="{ item, index }">
      <div class="short-description">
        <img
          :src="getGameImagePath(item.gameImage)"
          :alt="item.name"
          class="image-game"
        />
        <div class="headline-game-name">
        <b>{{ item.name }}</b>
        </div>
        <div class="short">
          <div class="short-left">
            <b>{{ item.startloction }}</b>
          </div>
          <div class="game-infos" @click="toggleLayer(index)">
            <b>{{ item.ageGroup }}</b>
            <img src="@/assets/img/icons/open-plus.png" alt="open" class="open-layer" />
          </div>
          <div class="short-right">
            <div class="button">
              <button
                class="btn btn--fourth"
                @click="$emit('open-modal', item.encryptedId)"
              >
                Kaufen
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ✅ Long-description direkt nach short-description -->
      <div
        class="long-description"
        :class="{ 'long-description-active': activeIndex === index }"
      >
        <div class="long-description-content">
          <div class="top-content">
            <div class="top-info">
              <b>{{ item.name }}</b>
            </div>
            <div class="close-btn" @click="closeLayer">
              <img
                src="@/assets/img/icons/show-back.svg"
                alt="Schließen"
                class="close-icon-2"
              />
            </div>
          </div>
          <div class="game-information">
            <div class="game-infos">
              <p>
                <span>Schwierigkeit</span>
                <span>{{ item.ageGroup }}</span>
              </p>
              <p>
                <span>Start</span>
                <span>{{ item.startloction }}</span>
              </p>
              <p>
                <span>Dauer</span>
                <span>{{ item.playtime }}</span>
              </p>
              <p>
                <span>Ende</span>
                <span>{{ item.endloction }}</span>
              </p>
              <p>
                <span>Preis</span>
                <span>{{ item.price }}</span>
              </p>
            </div>
          </div>
          <div class="game-description">
            <span>Was wir wissen:</span>
            <span>{{ item.description }}</span>
          </div>
      
          <div class="button">
            <button
              class="btn btn--primary"
              @click="$emit('open-modal', item.encryptedId)"
            >
              Kaufen
            </button>
          </div>
        </div>
      </div>
    </template>
  </BaseSlider>
</template>

<script>
import BaseSlider from "@/components/BaseSlider.vue";

export default {
  components: { BaseSlider },
  props: {
    games: Array,
  },
  data() {
    return {
      activeIndex: null, // Speichert den aktiven Index
    };
  },
  methods: {
    getGameImagePath(imagePath) {
      return new URL(imagePath, import.meta.url).href;
    },

    // ✅ Neu hinzugefügt: Methode für das Öffnen/Schließen der Beschreibung
    toggleLayer(index) {
      this.activeIndex = this.activeIndex === index ? null : index;
    },

    closeLayer() {
      this.activeIndex = null;
    },
  },
};
</script>

<style scoped>
.short-description {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #fac227;
  border-radius: 20px;
  width: 100%;
  padding-bottom: 15px;

  .image-game {
    max-width: 422px;
    width: 100%;
    margin-bottom: 10px;
    border-radius: 20px 20px 0 0;
  }
}
.short {
  .game-infos {
    img {
      transition: transform 0.5s ease-in-out;
    }

    img:hover {
      transform: rotate(360deg);
    }
  }

  .short-right .open-layer {
    width: 50px;
    height: auto;
    margin-right: 10px; /* Abstand zwischen dem Icon und dem Button */
  }

  .short-right .button button {
    padding: 10px 30px;
  }
}
/* long-description */
.long-description {
  position: absolute;
  bottom: -100%; /* Versteckt den Container außerhalb des sichtbaren Bereichs */
  left: 0;
  width: 100%; /* Nimmt die gesamte Breite ein */
  padding: 20px;
  background-color: #e9e2d0; /* Hintergrundfarbe */
  color: #355b4c;
  border: 1px solid #355b4c;
  z-index: 5; /* Unter dem Hover-Layer */
  transition: bottom 0.2s ease-in-out; /* Animationseffekt */
  height: 100%;
  border-radius: 20px;
  .game-infos {
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: 0 30px;
    p {
      display: flex;
      justify-content: space-between;
  
    }
  }
}

.long-description-active {
  bottom: 0px; /* Zeigt den Container an */
}
.long-description-content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: inherit;

}
.long-description .top-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
 
}
.long-description .close-btn {
  font-size: 30px;
  cursor: pointer;
}
.long-description .game-information {
  display: flex;
  justify-content: stretch;

}

.long-description .button {
  display: flex;
  justify-content: flex-end; /* Den Button rechts ausrichten */
}
</style>
