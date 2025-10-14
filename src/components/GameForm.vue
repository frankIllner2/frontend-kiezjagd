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

    <!-- 🔥 Sortierung (neu) -->
    <div class="form-group">
      <label for="sortIndex">Sortierung im Slider</label>
      <input
        id="sortIndex"
        v-model.number="localGame.sortIndex"
        type="number"
        min="0"
        step="1"
        placeholder="z. B. 1 für ganz vorne"
      />
      <small>Kleinere Zahl = weiter vorne. Standard: 9999.</small>
    </div>

    <div class="form-group">
      <label for="description">Spielbeschreibung</label>
      <textarea
        v-model="localGame.description"
        id="description"
        maxlength="500"
        placeholder="Kurze Beschreibung des Spiels hinzufügen"
        rows="4"
        required
      ></textarea>
      <small>{{ localGame.description?.length || 0 }}/500 Zeichen</small>
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
        placeholder="Email Text zum Spiel"
        rows="4"
      ></textarea>
      <small>{{ localGame.mailtext?.length || 0}}/1200 Zeichen</small><br />
      <div class="form-group checkbox-group">
        <input type="checkbox" id="withCertificate" v-model="localGame.withCertificate" />
        <label for="withCertificate">E-Mail mit Urkunde im Anhang</label>
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

    <div class="form-group">
      <label for="landingPageUrl">LP - URL</label>
      <input
        id="landingPageUrl"
        v-model="localGame.landingPageUrl"
        placeholder="/spiel/spurensuche-mama"
      />
    </div>

        <!-- 💡 Aktivierung + Serientermin -->
    <div class="form-group checkbox-group">
      <input type="checkbox" id="activationEnabled" v-model="localGame.activation.enabled" />
      <label for="activationEnabled">Spiel aktivieren (Zeitfenster)</label>
    </div>

    <div class="form-group form-group--city-plz" v-if="localGame.activation.enabled">
      <div class="three-col">
        <div class="col">
          <label for="activationFrom">Aktiv ab</label>
          <input id="activationFrom" type="datetime-local" v-model="activationFromLocal" />
        </div>
        <div class="col">
          <label for="activationUntil">Aktiv bis</label>
          <input id="activationUntil" type="datetime-local" v-model="activationUntilLocal" />
        </div>
         <div class="col">
           <label for="repeatYearly">Jährlich wiederkehrend (Serientermin)</label>
           <input type="checkbox" id="repeatYearly" v-model="localGame.activation.repeatYearly" />
        </div>
      </div>
      <small>Zeiten werden als UTC gespeichert, lokale Anzeige in Europe/Berlin.</small>
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
      localGame: {
        voucherName: '',
        sortIndex: 9999,
        activation: { enabled: false, from: null, until: null, repeatYearly: false },
        ...this.game
      },
      activationFromLocal: "",
      activationUntilLocal: "",
      previewImage: null,
      uploadedImage: null
    };
  },
  watch: {
    game: {
      handler(newValue) {
        this.localGame = { voucherName: '', sortIndex: 9999, activation: { enabled: false, from: null, until: null, repeatYearly: false }, ...newValue };
        if (this.localGame.sortIndex === undefined || this.localGame.sortIndex === null) {
          this.localGame.sortIndex = 9999;
        }
        // Prefill local datetime inputs
        const toLocalInput = (iso) => {
          if (!iso) return "";
          const d = new Date(iso);
          const pad = (n) => String(n).padStart(2, "0");
          return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        };
        this.activationFromLocal = toLocalInput(this.localGame.activation?.from);
        this.activationUntilLocal = toLocalInput(this.localGame.activation?.until);
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
        // Validierung
        if (this.localGame.activation.enabled) {
          if (!this.activationFromLocal && !this.activationUntilLocal) {
            alert("Bitte Zeitraum wählen.");
            return;
          }
          if (this.localGame.activation.repeatYearly && (!this.activationFromLocal || !this.activationUntilLocal)) {
            alert("Für jährlich wiederkehrend bitte Start UND Ende wählen.");
            return;
          }
        }

        let imageUrl = '';

        if (this.uploadedImage instanceof File) {
          imageUrl = await apiService.uploadImage(this.uploadedImage);
        } else if (typeof this.localGame.gameImage === 'string' && this.localGame.gameImage.startsWith('http')) {
          imageUrl = this.localGame.gameImage; // bereits vorhanden
        } else {
          console.warn("⚠️ Kein Bild zum Hochladen ausgewählt.");
        }

        const toISO = (local) => {
          if (!local) return null;
          const d = new Date(local);
          return isNaN(d.getTime()) ? null : d.toISOString();
        };

        const gameData = {
          ...this.localGame,
          gameImage: imageUrl,
          voucherName: this.localGame.isVoucher ? this.localGame.voucherName : '',
          activation: {
            enabled: !!this.localGame.activation?.enabled,
            from: this.localGame.activation?.enabled ? toISO(this.activationFromLocal) : null,
            until: this.localGame.activation?.enabled ? toISO(this.activationUntilLocal) : null,
            repeatYearly: !!this.localGame.activation?.repeatYearly,
          },
        };

        this.$emit('save', gameData);
      } catch (error) {
        console.error('❌ Fehler beim Hochladen/Speichern:', error);
      }
    }
  },
};
</script>

<style lang="sass" scoped>

.form-group--city-plz .three-col {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  align-items: end;
}

.form-group--city-plz .col {
  display: flex;
  flex-direction: column;
}

.form-group--city-plz .col label {
  font-weight: 500;
  margin-bottom: 4px;
}

.form-group--city-plz .col input[type="datetime-local"],
.form-group--city-plz .col input[type="text"],
.form-group--city-plz .col input[type="number"] {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
}

/* Checkbox sauber vertikal ausrichten */
.form-group--city-plz .col input[type="checkbox"] {
  margin-top: auto;
  transform: scale(1.2);
  cursor: pointer;
}

/* Mobile: alles untereinander */
@media (max-width: 640px) {
  .form-group--city-plz .three-col {
    grid-template-columns: 1fr;
  }
}

</style>
