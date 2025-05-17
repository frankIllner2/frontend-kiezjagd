<template>
  <form @submit.prevent="saveGame" class="game-form">
    <h2>{{ localGame._id ? 'Spiel bearbeiten' : 'Neues Spiel erstellen' }}</h2>

    <div class="form-row">
      <div class="form-group">
        <label for="name">Spielname</label>
        <input v-model="localGame.name" id="name" placeholder="Spielname eingeben" required />
      </div>

      <div class="form-group">
        <label for="city">Stadt/PLZ</label>
        <input v-model="localGame.city" id="city" placeholder="Stadt/PLZ eingeben" required />
      </div>
    </div>

    <div class="form-group">
      <label for="gameImage">Spielbild</label>
      <input type="file" @change="handleImageUpload" id="gameImage" accept="image/*" />
      <img v-if="previewImage" :src="previewImage" alt="Vorschau" class="image-preview" />
    </div>

    <div class="form-row">
      <div class="form-group">
        <label for="playtime">Dauer</label>
        <input v-model="localGame.playtime" id="playtime" placeholder="Spieldauer eingeben" required />
      </div>

      <div class="form-group">
        <label for="startloction">Start</label>
        <input v-model="localGame.startloction" id="startloction" placeholder="Wo startet das Spiel" required />
      </div>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label for="endloction">Ende</label>
        <input v-model="localGame.endloction" id="endloction" placeholder="Wo endet das Spiel" required />
      </div>

      <div class="form-group">
        <label for="price">Preis</label>
        <input v-model="localGame.price" id="price" placeholder="Preis" required />
      </div>
    </div>

    <div class="form-group">
      <label for="description">Spielbeschreibung</label>
      <textarea 
        v-model="localGame.description" 
        id="description"
        maxlength="560" 
        placeholder="Kurze Beschreibung des Spiels hinzufügen" 
        rows="4"
        required
      ></textarea>
      <small>{{ localGame.description?.length || 0 }}/560 Zeichen</small>
    </div>

    <div class="form-group">
      <label for="prehistory">Vorgeschiechte</label>
      <textarea 
        v-model="localGame.prehistory" 
        id="prehistory"
        maxlength="650" 
        placeholder="Die Geschichte des Spiels" 
        rows="4"
        required
      ></textarea>
      <small>{{ localGame.prehistory?.length || 0 }}/650 Zeichen</small>
    </div>

    <div class="form-group">
      <label for="infohistory">Infos zur Geschichte</label>
      <textarea 
        v-model="localGame.infohistory" 
        id="infohistory" 
        maxlength="1200" 
        placeholder="Infos zur Geschichte" 
        rows="4"
        required
      ></textarea>
      <small>{{ localGame.infohistory?.length || 0}}/1200 Zeichen</small>
    </div>

    <div class="form-group">
      <label for="ageGroup">Altersgruppe</label>
      <select v-model="localGame.ageGroup" id="ageGroup" required>
        <option value="">Altersgruppe auswählen</option>
        <option>Mini</option>
        <option>Medi</option>
        <option>Maxi</option>
      </select>
    </div>

    <div class="form-group checkbox-group">
        <input type="checkbox" id="disabled" v-model="localGame.isDisabled" />
        <label for="disabled">Spiel deaktivieren</label>
      </div>

    <div class="form-actions">
      <button type="submit" class="btn btn--save">Speichern</button>
    </div>
  </form>
</template>

<script>
import { apiService } from "@/services/apiService";
export default {
  props: {
    game: {
      type: Object,
      required: true,
    },
  },
  emits: ['save', 'update:game'],
  data() {
    return {
      localGame: { ...this.game }, previewImage: null, uploadedImage: null };
  },
  watch: {
    game: {
      handler(newValue) {
        this.localGame = { ...newValue };
      },
      deep: true,
    },
  },
  methods: {
    handleImageUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.uploadedImage = file;
        this.previewImage = URL.createObjectURL(file);
      }
    },
    async saveGame() {
      console.log('test2');
      try {
        let imageUrl = '';
    
        if (this.uploadedImage instanceof File) {
          imageUrl = await apiService.uploadImage(this.uploadedImage);
        } else if (typeof this.localGame.gameImage === 'string' && this.localGame.gameImage.startsWith('http')) {
          imageUrl = this.localGame.gameImage; // bereits vorhanden
        } else {
          console.warn("⚠️ Kein Bild zum Hochladen ausgewählt.");
        }
        const gameData = { 
          ...this.localGame,
          gameImage: imageUrl  // Verwende die hochgeladene URL
        };
        
        this.$emit('save', gameData);  // Sende die Daten an Admin.vue
      } catch (error) {
        console.error('❌ Fehler beim Hochladen des Bildes:', error);
      }
    }
  },
};
</script>
