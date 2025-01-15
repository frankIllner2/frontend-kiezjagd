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
    // Route für Benutzer mit sessionId und gameId
    path: '/game/:sessionId/:gameId',
    name: 'GameWithValidation',
    component: GamePage,
    props: true,
    beforeEnter: async (to, from, next) => {
      const { sessionId } = to.params;

      if (to.query.from === 'admin') {
        console.log('🔓 Admin-Bereich: Validierung übersprungen');
        next();
        return;
      }

      try {
        const response = await axios.get(
          `${process.env.VUE_APP_API_BASE_URL}/order/validate-link/${sessionId}`
        );
        console.log('✅ Link gültig:', response.data);
        next();
      } catch (error) {
        console.error('❌ Linkprüfung fehlgeschlagen:', error.response?.data || error.message);
        next({ name: 'LinkFault' });
      }
    },
  },
  {
    // Direkter Aufruf mit gameId (z.B. aus dem Admin-Bereich)
    path: '/game/:gameId',
    name: 'GameDirect',
    component: GamePage,
    props: true,
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
    path: '/linkFault',
    name: 'LinkFault',
    component: LinkFault,
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFoundPage,
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
