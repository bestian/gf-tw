<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <nav class="ui top fluid menu">
    <RouterLink class="item" to="/">實體店</RouterLink>
    <RouterLink class="item" to="/web-stores">網路店</RouterLink>
    <RouterLink class="item" to="/collaborate">協作店面資料</RouterLink>
    <RouterLink class="item" to="/review">校對資料</RouterLink>
  </nav>
  <RouterView />
  <footer class="ui footer">
    <div class="footer-content">
      <p>本站資料為開放協作，請協力校對維護。</p>
      <p>本站原始碼： <a href="https://github.com/bestian/gf-tw" target="_blank" rel="noopener noreferrer">https://github.com/bestian/gf-tw</a></p>
    </div>
  </footer>
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text) !important;
  background-color: #c8f9c8 !important;
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

.ui.footer {
  display: none;
  background-color: #f8f9fa;
  padding: 2rem 0;
  margin-top: 3rem;
  border-top: 1px solid #e9ecef;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  margin-top: 1rem;
  text-align: center;
  color: #6c757d;
  line-height: 1.6;
}

.footer-content a {
  color: #42b983;
  text-decoration: none;
}

.footer-content a:hover {
  text-decoration: underline;
}

@media (min-width: 768px) {
  .ui.footer {
    display: block;
  }
}
</style>
