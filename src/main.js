import { createApp } from 'vue';
import App from './App.vue';
import './registerServiceWorker';
import router from './router';
import 'animate.css';
import './assets/scss/main.scss';



// Font Awesome Imports
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faEdit, faTrash, faExternalLinkAlt, faArrowLeft, faPuzzlePiece, faMobileAlt, faUsers, faTrophy } from '@fortawesome/free-solid-svg-icons';
import { faFacebook, faTwitter, faInstagram } from '@fortawesome/free-brands-svg-icons';
// Icons zur Bibliothek hinzufügen
library.add(faEdit, faTrash, faExternalLinkAlt, faArrowLeft, faPuzzlePiece, faMobileAlt, faUsers, faTrophy, faFacebook, faTwitter, faInstagram);

const app = createApp(App);

// Font Awesome-Komponente global registrieren
app.component('font-awesome-icon', FontAwesomeIcon);

// Router und Mounten
app.use(router).mount('#app');
