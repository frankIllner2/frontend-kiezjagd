
import axios from 'axios';
import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../views/Home.vue';
import GamePage from '../views/Game.vue';
import AdminPage from '../views/Admin.vue';
import GameEditForm from '../components/GameEditForm.vue'; // Bearbeitungsformular hinzufügen
import AdminLogin from '../views/AdminLogin.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
  },
  {
    path: '/game/:encryptedId',
    name: 'Game',
    component: GamePage,
    props: true, // Parameter encryptedId wird als Prop übergeben
  },
  {
    path: '/admin',
    name: 'Admin',
    component: AdminPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/edit/:id',
    name: 'EditGame',
    component: GameEditForm,
    meta: { requiresAuth: true },
    props: true, // Parameter id wird als Prop übergeben
  },
  { 
    path: '/admin/login', 
    name: 'AdminLogin', 
    component: AdminLogin 
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation Guard für Auth-Schutz
router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem('token');

  if (to.meta.requiresAuth) {
    if (!token) {
      next('/admin/login');
    } else {
      try {
        await axios.get(`${process.env.VUE_APP_API_AUTH_URL}`, {
          headers: { Authorization: `Bearer ${token}` }
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
