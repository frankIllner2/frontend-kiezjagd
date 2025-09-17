<template>
  <div class="ecwid-shop-wrapper">
    <!-- 🧚‍♀️ Header -->
    <header class="shop-header">
        <div class="logo">
        <router-link to="/" class="logo-lp">
            <img src="@/assets/img/logo.svg" alt="Kiezjagd Logo" />
        </router-link>
      </div>
      <h3 class="shop-title">Kiezjagd Kinderkollektion</h3>
    </header>

    <!-- 🛒 Ecwid Shop -->
    <div id="my-store-119751753"></div>
    <div id="ecwid-shop-script"></div>

    <!-- 📄 Footer -->
    <footer class="bottom">
      <div class="left">
        <a href="/impressum" target="_blank" rel="noopener">Impressum</a>
        <a href="/agb" target="_blank" rel="noopener">AGB/Datenschutz</a>
      </div>

      <div class="right">
        <span>© 2025 Kiezjagd</span>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  const storeId = process.env.VUE_APP_ECWID_STORE_ID;

  if (!window.Ecwid) {
    const script = document.createElement('script');
    script.src = `https://app.ecwid.com/script.js?${storeId}&data_platform=code&data_date=2025-06-19`;
    script.async = true;
    script.onload = () => {
      window.xProductBrowser?.(
        "categoriesPerRow=3",
        "views=grid(20,3) list(60) table(60)",
        "categoryView=grid",
        "searchView=list",
        `id=my-store-${storeId}`
      );
    };
    document.getElementById('ecwid-shop-script')?.appendChild(script);
  } else {
    window.xProductBrowser?.(
      "categoriesPerRow=3",
      "views=grid(20,3) list(60) table(60)",
      "categoryView=grid",
      "searchView=list",
      `id=my-store-${storeId}`
    );
  }
});
</script>

<style scoped lang="scss">
.ecwid-shop-wrapper {
  background-color: #E9E2D0;

  min-height: 100vh;
  display: flex;
  flex-direction: column;
  .grid-product__image-wrap {
     background-color: #E9E2D0;
  }
}

.shop-header {
  height: 6em;
  background-color: #FAC227;
  text-align: center;
  margin-bottom: 2rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  h3 {
    color: #355b4c ;
  }
  .shop-logo {
    height: 60px;
    margin-bottom: 0.5rem;
    }
}

/* Footer */
.bottom {
  margin-top: 3rem;
  padding-top: 1.5rem;
  border-top: 1px solid #ccc;
  font-size: 12px;
  color: #666;
  text-align: center;
}

.bottom .left {
  display: flex;
  justify-content: center;;
  gap: 1rem;
}

.bottom .left a {
  font-size: 12px;
  margin-right: 1.5rem;
  color: #666;
  text-decoration: none;
}

.bottom .left a:hover {
  text-decoration: underline;
}

.bottom .right {
  margin-left: auto;
}
</style>
