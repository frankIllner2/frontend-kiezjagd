import { createRouter, createWebHistory } from 'vue-router';
import axios from 'axios';

// 🔁 Slug-ID-Mapping importieren
import slugMap from '@/data/slug-map.json';

// ✅ Seiten importieren
import HomePage from '../views/Home.vue';
import GamePage from '../views/Game.vue';
import AdminPage from '../views/Admin.vue';
import AdminGameView from '../views/AdminGame.vue';
import GameEditForm from '../components/GameEditForm.vue';
import GameLandingPage from '../components/GameLandingPage.vue';
import ShopSite from '../components/ShopView.vue';
import AdminLogin from '../views/AdminLogin.vue';
import SuccessPage from '../views/Success.vue';
import CancelPage from '../views/CancelSite.vue';
import NotFoundPage from '../views/NotFound.vue';
import LinkFault from '../views/LinkFault.vue';
import ImpressumSite from '../views/ImpressumSite.vue';
import AgbSite from '../views/AgbSite.vue';
import PrivacypolicySite from '../views/PrivacypolicySite.vue';

// ✅ Dynamisch generierte, statische Slug-Routen für Spiele
const gameSlugRoutes = slugMap.map(entry => ({
  path: `/spiel/${entry.slug}`,
  name: `GameLanding-${entry.slug}`,
  component: GameLandingPage,
  props: { encryptedId: entry.id }
}));

const routes = [
  ...gameSlugRoutes,

  // Optional: Weiterleitung von alter ID-Route zur Slug-Route
  {
    path: '/spiel/:encryptedId',
    redirect: to => {
      const match = slugMap.find(entry => entry.id === to.params.encryptedId);
      return match ? `/spiel/${match.slug}` : '/notfound';
    }
  },

  {
    path: '/',
    name: 'Home',
    component: HomePage,
  },
  {
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
    path: '/game/:gameId',
    name: 'GameDirect',
    component: GamePage,
    props: true,
  },
  {
    path: '/admin/game/:encryptedId',
    name: 'AdminGame',
    component: AdminGameView,
    meta: { requiresAuth: true, isAdmin: true },
    props: true 
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
    path: '/Impressum',
    name: 'Impressum',
    component: ImpressumSite,
  },
  {
    path: '/Agb',
    name: 'Agb',
    component: AgbSite,
  },
  {
    path: '/Datenschutz',
    name: 'Datenschutz',
    component: PrivacypolicySite,
  },
  {
    path: '/shop',
    name: 'Shop',
    component: ShopSite
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFoundPage,
  }
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
