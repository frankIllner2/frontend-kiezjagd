import { createApp } from 'vue';
import App from './App.vue';
import './registerServiceWorker';
import router from './router';
import './assets/scss/main.scss';

// ✅ vue-meta hinzufügen
import { createMetaManager } from 'vue-meta';

// Font Awesome Imports
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faEdit, faTrash, faExternalLinkAlt, faArrowLeft, faPuzzlePiece, faMobileAlt, faUsers,
  faTrophy, faArrowRight, faPlus, faMinus, faMinusCircle, faPlusCircle, faVolumeUp, faStar, faPlay, faPause, faStop
} from '@fortawesome/free-solid-svg-icons';
import { faFacebook, faTwitter, faInstagram } from '@fortawesome/free-brands-svg-icons';

library.add(
  faEdit, faTrash, faExternalLinkAlt,
  faArrowLeft, faPuzzlePiece, faMobileAlt,
  faUsers, faTrophy, faFacebook,
  faTwitter, faInstagram, faVolumeUp, faStar,
  faArrowRight, faMinus, faPlus, faMinusCircle, faPlusCircle,
  faPlay, faPause, faStop
);

const app = createApp(App);

// vue-meta aktivieren
const metaManager = createMetaManager();
app.use(metaManager);

// Font Awesome-Komponente global registrieren
app.component('font-awesome-icon', FontAwesomeIcon);

// Router und App mounten
app.use(router).mount('#app');
