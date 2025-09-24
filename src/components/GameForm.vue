<template>
  <form @submit.prevent="saveGame" class="game-form">
    <h4>{{ localGame._id ? 'Spiel bearbeiten' : 'Neues Spiel erstellen' }}</h4><br />

    <div class="form-row">
      <div class="form-group">
        <label for="name">Spielname</label>
        <input v-model="localGame.name" id="name" placeholder="Spielname eingeben" required />
      </div>

      <div class="form-group form-group--city-plz">
          <div class="two-col">
            <div class="col col-plz">
              <label for="plz">PLZ</label>
              <input
                id="plz"
                v-model="localGame.plz"
                placeholder="z. B. 10407"
                inputmode="numeric"
                maxlength="5"
                autocomplete="postal-code"
                required
              />
            </div>

            <div class="col col-city">
              <label for="city">Stadt</label>
              <input
                id="city"
                v-model="localGame.city"
                placeholder="z. B. Berlin"
                autocomplete="address-level2"
                required
              />
            </div>
          </div>
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
      ></textarea>
      <small>{{ localGame.infohistory?.length || 0}}/1200 Zeichen</small>
    </div>

    <div class="form-group">
      <label for="mailtext">Individueller E-Mail Text</label>
      <textarea 
        v-model="localGame.mailtext" 
        id="mailtextEmail" 
        maxlength="1200" 
        placeholder="Email Text zum Spie" 
        rows="4"
      ></textarea>
      <small>{{ localGame.mailtext?.length || 0}}/1200 Zeichen</small><br />
      <div class="form-group checkbox-group">
        <input type="checkbox" id="withCertificate" v-model="localGame.withCertificate" />
        <label for="withCertificate">Mit Urkunde im Anhang</label>
      </div>
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

        <input type="checkbox" id="isVoucher" v-model="localGame.isVoucher" />
        <label for="isVoucher">Spiel mit Gutschein-Code einlösen</label>
    </div>
    <div class="form-group" v-if="localGame.isVoucher">
      <label for="voucherName">Gutschein-Name (Admin)</label>
      <input
        id="voucherName"
        v-model="localGame.voucherName"
        placeholder="z. B. TEST2025"
        
      />
   
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
      localGame: { voucherName: '', 
      ...this.game }, 
      previewImage: null, 
      uploadedImage: null 
    };
  },
  watch: {
    game: {
      handler(newValue) {
        this.localGame = { voucherName: '', ...newValue };
      },
      deep: true,
    },
    'localGame.isVoucher'(val) {
      if (!val) this.localGame.voucherName = '';
    }
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
          gameImage: imageUrl, 
          voucherName: this.localGame.isVoucher ? this.localGame.voucherName : ''
        };
        
        this.$emit('save', gameData);  // Sende die Daten an Admin.vue
      } catch (error) {
        console.error('❌ Fehler beim Hochladen des Bildes:', error);
      }
    }
  },
};
</script>

<style lang="sass" scoped>
/* City + PLZ nebeneinander, mobil untereinander */
.form-group--city-plz .two-col {
  display: grid;
  grid-template-columns: minmax(90px, 140px) 1fr; /* PLZ schmal, Stadt flexibel */
  gap: 12px;
  align-items: end;
}

.form-group--city-plz .col input {
  width: 100%;
}

@media (max-width: 640px) {
  .form-group--city-plz .two-col {
    grid-template-columns: 1fr; /* mobil: untereinander */
  }
}


</style>
