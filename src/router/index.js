import axios from 'axios';
import { createRouter, createWebHistory } from 'vue-router';

// ✅ Seiten importieren
import HomePage from '../views/Home.vue';
import GamePage from '../views/Game.vue';
import AdminPage from '../views/Admin.vue';
import GameEditForm from '../components/GameEditForm.vue';
import AdminLogin from '../views/AdminLogin.vue';
import SuccessPage from '../views/Success.vue';
import CancelPage from '../views/CancelSite.vue';
import NotFoundPage from '../views/NotFound.vue';
import LinkFault from '../views/LinkFault.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
  },
  {
    path: '/game/:sessionId/:gameId',
    name: 'Game',
    component: GamePage,
    props: true, // Parameter encryptedId wird als Prop übergeben
    beforeEnter: async (to, from, next) => {
      // Wenn der Aufruf aus dem Admin-Bereich kommt, überspringe die Validierung
      if (to.query.from === 'admin') {
        next();
        return;
      }
      // Prüfe die Linkgültigkeit für normale Benutzer
      try {
        const sessionId = to.params.sessionId;
        const response = await axios.get(
          `${process.env.VUE_APP_API_BASE_URL}/order/validate-link/${sessionId}`
        );
        console.log('✅ Link gültig:', response.data);

        next();
      } catch (error) {
        console.error('❌ Linkprüfung fehlgeschlagen:', error.response?.data || error.message);

        // Link ist ungültig, zur Fehlerseite weiterleiten
        next({ name: 'LinkFault' });
      }
    },
  },
  {
    path: '/game/:gameId',
    name: 'Game',
    component: GamePage,
    props: true, // Parameter encryptedId wird als Prop übergeben
  },
  {
    path: '/admin',
    name: 'Admin',
    component: AdminPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/edit/:id',
    name: 'EditGame',
    component: GameEditForm,
    meta: { requiresAuth: true },
    props: true,
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: AdminLogin,
  },
  {
    path: '/success',
    name: 'Success',
    component: SuccessPage,
    meta: { requiresAuth: false },
  },
  {
    path: '/cancel',
    name: 'Cancel',
    component: CancelPage,
    meta: { requiresAuth: false },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFoundPage,
  },
  {
    path: '/linkFault',
    name: 'LinkFault',
    component: LinkFault,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// ✅ Navigation Guard für Auth-Schutz
router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem('token');

  if (to.meta.requiresAuth) {
    if (!token) {
      next('/admin/login');
    } else {
      try {
        await axios.get(`${process.env.VUE_APP_API_AUTH_URL}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        next();
      } catch (err) {
        console.error('❌ Token ungültig:', err.response?.data?.message || err.message);
        localStorage.removeItem('token');
        next('/admin/login');
      }
    }
  } else {
    next();
  }
});

export default router;
