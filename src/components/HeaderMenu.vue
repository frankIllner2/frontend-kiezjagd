<template>
  <!-- HEADER -->
  <header
    class="top-header-menu"
    :class="{ 'is-open': isMenuOpen, 'is-translucent': isTranslucent }"
  >
    <div class="container header-wrapper">
      <!-- Hamburger: links -->
      <button
        class="hamburger"
        type="button"
        :aria-expanded="isMenuOpen.toString()"
        aria-controls="main-drawer"
        aria-label="Hauptmenü öffnen"
        @click="openMenu"
        ref="hamburgerBtn"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <!-- Logo: Mitte -->
      <div class="logo">
        <img src="@/assets/img/logo.svg" alt="Kiezjagd Logo" />
      </div>

      <!-- Rechts: Shop + Insta -->
      <nav class="desktop-menu desktop-menu-right" aria-label="Schnellzugriffe">
        <ul>
         <!-- <li><router-link to="/shop/" class="shop-lp">Shop</router-link></li> -->
        </ul>
        <div class="social-icons">
          <a
            href="https://www.instagram.com/kiezjaeger/"
            target="_blank"
            rel="noopener"
            aria-label="Instagram (öffnet in neuem Tab)"
          >
            <font-awesome-icon
              :icon="['fab', 'instagram']"
              class="social-icon instagram"
            />
          </a>
        </div>
      </nav>
    </div>
  </header>

  <!-- BACKDROP (über die GANZE Seite) -->
  <div class="backdrop" @click="closeMenu"></div>

  <!-- DRAWER -->
  <nav
    id="main-drawer"
    class="mobile-menu"
    :class="{ 'menu-open': isMenuOpen }"
    aria-label="Hauptnavigation"
    @keydown.esc="closeMenu"
  >
    <!-- Close-X -->
    <button
      class="close-btn"
      type="button"
      @click="closeMenu"
      aria-label="Menü schließen"
    >
      ×
    </button>

    <!-- Menü-Links -->
    <ul class="menu">
      <li>
        <a href="#" @click.prevent="handleNav('what-is-headline')">
          Was ist Kiezjagd?
        </a>
      </li>
      <li>
        <a href="#" @click.prevent="handleNav('game-preview-section')">
          Spiele entdecken
        </a>
      </li>
      <li>
        <a href="#" @click.prevent="handleNav('features-section')">
          Wie geht's?
        </a>
      </li>
      <!-- <li><router-link to="/shop/" class="shop-lp">Shop</router-link></li> -->
      <li>
        <a
          href="mailto:support@kiezjagd.de?subject=Wie%20gehts!&body=Hallo%20Kiezjagd-Team,"
          @click="closeMenu"
        >
          Schreib uns
        </a>
      </li>
      <li>
        <a href="/Impressum" target="_blank" rel="noopener" @click="closeMenu">
          Impressum
        </a>
      </li>
      <li>
        <a href="/Agb" target="_blank" rel="noopener" @click="closeMenu">AGB/Datenschutz</a>
      </li>
      <li>
      
        <div class="social-icons">
          <a
            href="https://www.instagram.com/kiezjaeger/"
            target="_blank"
            rel="noopener"
            aria-label="Instagram (öffnet in neuem Tab)"
          >
            <font-awesome-icon
              :icon="['fab', 'instagram']"
              class="social-icon instagram"
            />
          </a>
        </div>
      </li>
   
    </ul>



  </nav>
</template>

<script setup>
import { ref, nextTick, onMounted, onBeforeUnmount } from "vue";

const isTranslucent = false; // Header optional halbtransparent

const isMenuOpen = ref(false);
const hamburgerBtn = ref(null);

const ANIM_MS = 300;

const openMenu = async () => {
  isMenuOpen.value = true;
  document.body.classList.add("menu-open");
  await nextTick();
  focusFirstLink();
};

const closeMenu = async () => {
  if (!isMenuOpen.value) return;
  isMenuOpen.value = false;
  document.body.classList.remove("menu-open");
  await nextTick();
  setTimeout(() => {
    hamburgerBtn.value?.focus?.();
  }, ANIM_MS);
};

const handleNav = (id) => {
  closeMenu();
  setTimeout(() => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }, ANIM_MS + 20);
};

const focusFirstLink = () => {
  const el = document.querySelector("#main-drawer .menu a");
  el?.focus?.();
};

const onKeydown = (e) => {
  if (e.key === "Escape") closeMenu();
};

onMounted(() => window.addEventListener("keydown", onKeydown));
onBeforeUnmount(() => window.removeEventListener("keydown", onKeydown));
</script>
