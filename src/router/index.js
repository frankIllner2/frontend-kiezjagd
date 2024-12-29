import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../views/Home.vue';
import GamePage from '../views/Game.vue';
import AdminPage from '../views/Admin.vue';
import GameEditForm from '../components/GameEditForm.vue'; // Bearbeitungsformular hinzufügen

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
  },
  {
    path: '/admin/edit/:id',
    name: 'EditGame',
    component: GameEditForm,
    props: true, // Parameter id wird als Prop übergeben
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
