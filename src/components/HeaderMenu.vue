<template>
  <header class="top-header-menu">
    <div class="container header-wrapper">
      <!-- Desktop-Menü (links) -->
      <nav class="desktop-menu desktop-menu-left">
        <ul>
          <li><a href="#" @click.prevent="scrollToSection('what-is-headline')">Was ist Kiezjagd?</a></li>
          <li><a href="#" @click.prevent="scrollToSection('game-preview-section')">Spiele entdecken</a></li>
          <li><a href="#" @click.prevent="scrollToSection('features-section')">Wie geht's?</a></li>
        </ul>
      </nav>

      <!-- Logo (Mitte) -->
      <div class="logo">
        <img src="@/assets/img/logo.svg" alt="Kiezjagd Logo" />
      </div>

      <!-- Desktop-Menü (rechts) -->
      <nav class="desktop-menu desktop-menu-right">
        <ul>
          <li class="bottom-menu"><a href="mailto:support@kiezjagd.de?subject=Wie%20gehts!&body=Hallo%20Kiezjagd-Team,">Schreib uns</a></li>
          <li><router-link to="/shop/" class="shop-lp">Shop</router-link></li>
        </ul>
        <!-- Social Media (Desktop) -->
        <div class="social-icons">
          <a href="https://www.instagram.com/kiezjaeger/" target="_blank">
            <font-awesome-icon :icon="['fab', 'instagram']" class="social-icon instagram" />
          </a>
        </div>
      </nav>

      <!-- Hamburger-Button für Mobile Ansicht -->
      <button class="hamburger" @click="toggleMenu">
        <span :class="{ open: isMenuOpen }"></span>
        <span :class="{ open: isMenuOpen }"></span>
        <span :class="{ open: isMenuOpen }"></span>
      </button>

      <!-- Mobiles Menü (Slide-in von rechts) -->
      <nav class="mobile-menu" :class="{ 'menu-open': isMenuOpen }" v-show="isMenuOpen">
        <div class="close-btn" @click="closeMenu">×</div>
        <ul class="menu">
          <li><a href="#" @click.prevent="closeMenu; scrollToSection('what-is-headline')">Was ist Kiezjagd?</a></li>
          <li><a href="#" @click.prevent="closeMenu; scrollToSection('game-preview-section')">Spiele entdecken</a></li>
          <li><a href="#" @click.prevent="closeMenu; scrollToSection('features-section')">Wie geht's?</a></li>
          <li><router-link to="/shop/" class="shop-lp">Shop</router-link></li>
          <li><a href="mailto:support@kiezjagd.de?subject=Wie%20gehts!&body=Hallo%20Kiezjagd-Team,">Schreib uns</a></li>
          <li><a href="/Impressum" target="_blank" rel="noopener">Impressum</a></li>
          <li><a href="/Agb" target="_blank" rel="noopener">AGB</a></li>
          <li><a href="/Datenschutz" target="_blank" rel="noopener">Datenschutz</a></li>
        </ul>
        <div class="social-icons">
         <a href="https://www.instagram.com/kiezjaeger/" target="_blank">
            <font-awesome-icon :icon="['fab', 'instagram']" class="social-icon instagram" />
          </a>
        </div>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { ref } from "vue";

const isMenuOpen = ref(false);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const closeMenu = () => {
  isMenuOpen.value = false;
};

const scrollToSection = (id) => {
  console.log(id);
  const target = document.getElementById(id);
  if (target) {
    target.scrollIntoView({ behavior: 'smooth' });
  }
};
</script>

