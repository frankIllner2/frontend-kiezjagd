<template>
  <!-- HEADER -->
  <header
    class="top-header-menu"
    :class="{ 'is-open': isMenuOpen, 'is-translucent': isTranslucent }"
    role="banner"
  >
    <div class="container header-wrapper">
      <!-- Hamburger: links -->
      <button
        class="hamburger"
        type="button"
        :aria-expanded="isMenuOpen.toString()"
        aria-controls="main-drawer"
        :aria-label="isMenuOpen ? 'Hauptmenü schließen' : 'Hauptmenü öffnen'"
        @click="toggleMenu"
        ref="hamburgerBtn"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <!-- Logo: Mitte (als Link zur Startseite) -->
      <div class="logo">
        <a href="/" aria-label="Zur Startseite">
          <img src="@/assets/img/logo.svg" alt="Kiezjagd" />
        </a>
      </div>

      <!-- Rechts: Shop + Insta -->
      <nav class="desktop-menu desktop-menu-right" aria-label="Schnellzugriffe">
        <ul>
          <!-- <li><router-link to="/shop/" class="shop-lp">Shop</router-link></li> -->
        </ul>
        <div class="social-icons">
          <a
            href="https://www.instagram.com/kiezjagd/"
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

  <!-- BACKDROP nur wenn offen; nicht fokussierbar/sichtbar für SR -->
  <div v-if="isMenuOpen" class="backdrop" aria-hidden="true" @click="closeMenu" />

  <!-- DRAWER: als Dialog-artiges Aside mit Focus-Trap -->
  <aside
    id="main-drawer"
    class="mobile-menu"
    :class="{ 'menu-open': isMenuOpen }"
    role="dialog"
    aria-modal="true"
    aria-label="Hauptnavigation"
    @keydown.esc="closeMenu"
    @keydown.tab.prevent="trapFocus"
    ref="drawerEl"
  >
    <!-- Focus-Sentinels für Trap -->
    <span tabindex="0" ref="sentinelStart" class="sr-only"></span>

    <!-- Close-X -->
    <button
      class="close-btn"
      type="button"
      @click="closeMenu"
      aria-label="Menü schließen"
      ref="closeBtn"
    >
      ×
    </button>

    <!-- Menü-Links -->
    <nav aria-label="Menü">
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
          <a href="#" @click.prevent="handleNav('features-section')"> Wie geht's? </a>
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
          <a href="/impressum" target="_blank" rel="noopener" @click="closeMenu">
            Impressum
          </a>
        </li>
        <li>
          <a href="/agb" target="_blank" rel="noopener" @click="closeMenu"
            >AGB/Datenschutz</a
          >
        </li>
        <li>
          <div class="social-icons">
            <a
              href="https://www.instagram.com/kiezjaeger/"
              target="_blank"
              rel="noopener"
              aria-label="Instagram (öffnet in neuem Tab)"
              @click="closeMenu"
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

    <span tabindex="0" ref="sentinelEnd" class="sr-only"></span>
  </aside>
</template>

<script setup>
import { ref, nextTick, onMounted, onBeforeUnmount } from "vue";

const isTranslucent = false; // Header optional halbtransparent

const isMenuOpen = ref(false);
const hamburgerBtn = ref(null);
const drawerEl = ref(null);
const closeBtn = ref(null);
const sentinelStart = ref(null);
const sentinelEnd = ref(null);

const ANIM_MS = 300;

const lockScroll = (lock) => {
  if (lock) {
    document.documentElement.style.overflow = "hidden";
  } else {
    document.documentElement.style.overflow = "";
  }
};

const setInertOnMain = (inert) => {
  // Modern: native inert – Fallback: aria-hidden
  const main = document.querySelector("main");
  if (!main) return;
  if (inert) {
    main.setAttribute("inert", "");
    main.setAttribute("aria-hidden", "true");
  } else {
    main.removeAttribute("inert");
    main.removeAttribute("aria-hidden");
  }
};

const toggleMenu = async () => {
  if (isMenuOpen.value) return closeMenu();
  return openMenu();
};

const openMenu = async () => {
  isMenuOpen.value = true;
  lockScroll(true);
  setInertOnMain(true);
  await nextTick();
  // Fokus ins Menü setzen: auf Close-Button, dann erstes Link
  if (closeBtn.value) closeBtn.value.focus();
  const firstLink = drawerEl.value?.querySelector(".menu a");
  if (firstLink) firstLink.focus();
};

const closeMenu = async () => {
  if (!isMenuOpen.value) return;
  isMenuOpen.value = false;
  lockScroll(false);
  setInertOnMain(false);
  await nextTick();
  setTimeout(() => {
    hamburgerBtn.value?.focus?.();
  }, ANIM_MS);
};

const handleNav = (id) => {
  closeMenu();
  setTimeout(() => {
    const el = document.getElementById(id);
    if (el) {
      el.setAttribute("tabindex", "-1");
      el.scrollIntoView({ behavior: "smooth" });
      el.focus({ preventScroll: true });
    }
  }, ANIM_MS + 20);
};

// Fokus-Falle innerhalb des Drawers
const trapFocus = (e) => {
  if (!isMenuOpen.value) return;
  const focusable = drawerEl.value?.querySelectorAll(
    'a[href], button:not([disabled]), textarea, input:not([disabled]), select, [tabindex]:not([tabindex="-1"])'
  );
  if (!focusable || !focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const active = document.activeElement;
  const isShift = e.shiftKey;

  if (!isShift && active === last) {
    first.focus();
  } else if (isShift && active === first) {
    last.focus();
  }
};

const onKeydown = (e) => {
  if (e.key === "Escape") closeMenu();
};

onMounted(() => window.addEventListener("keydown", onKeydown));
onBeforeUnmount(() => window.removeEventListener("keydown", onKeydown));
</script>
