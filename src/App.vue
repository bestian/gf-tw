<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from "vue-router";
const route = useRoute();
</script>

<template>
  <nav class="gf-nav">
    <RouterLink class="gf-nav-brand" to="/" tabindex="-1" aria-label="首頁">
      <span class="brand-icon">🪴</span>
      <span class="brand-name">無麩質台灣</span>
    </RouterLink>
    <div class="gf-nav-links">
      <RouterLink class="gf-nav-link" to="/">實體店</RouterLink>
      <RouterLink class="gf-nav-link" to="/web-stores">網路店</RouterLink>
      <RouterLink class="gf-nav-link" to="/collaborate">新增店家</RouterLink>
      <RouterLink class="gf-nav-link" to="/review">校對資料</RouterLink>
    </div>
  </nav>

  <RouterView />

  <footer class="gf-footer" v-if="route.path !== '/'">
    <div class="gf-footer-inner">
      <span>本站資料為開放協作，歡迎協力校對維護。</span>
      <a href="https://github.com/bestian/gf-tw" target="_blank" rel="noopener noreferrer">
        原始碼 ↗
      </a>
    </div>
  </footer>
</template>

<style scoped>
/* ── 導覽列 ── */
.gf-nav {
  display: flex;
  align-items: center;
  height: var(--nav-h);
  padding: 0 1.25rem;
  background: #ffffff;
  border-bottom: 1.5px solid var(--gf-border);
  box-shadow: 0 1px 6px rgba(30, 77, 50, 0.08);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.gf-nav-brand {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin-right: 1.5rem;
  flex-shrink: 0;
  text-decoration: none;
}

.brand-icon {
  font-size: 1.35rem;
  line-height: 1;
}

.brand-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--gf-green-deep);
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.gf-nav-links {
  display: flex;
  align-items: stretch;
  height: 100%;
  flex: 1;
}

.gf-nav-link {
  display: flex;
  align-items: center;
  padding: 0 0.95rem;
  font-size: 0.875rem;
  color: var(--gf-text-muted);
  text-decoration: none;
  border-bottom: 2.5px solid transparent;
  transition:
    background-color 0.2s,
    color 0.2s;
  white-space: nowrap;
}

.gf-nav-link:hover {
  color: var(--gf-green-forest);
  background-color: var(--gf-green-mist);
}

.gf-nav-link.router-link-exact-active {
  color: var(--gf-green-deep);
  font-weight: 600;
  border-bottom-color: var(--gf-green-mid);
  background-color: var(--gf-green-mist);
}

/* ── 頁尾 ── */
.gf-footer {
  background: var(--gf-green-mist);
  border-top: 1.5px solid var(--gf-border);
  padding: 1rem 1.5rem;
  margin-top: 3rem;
}

.gf-footer-inner {
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-size: 0.84rem;
  color: var(--gf-text-muted);
}

.gf-footer-inner a {
  color: var(--gf-green-mid);
  text-decoration: none;
  transition: color 0.2s;
}

.gf-footer-inner a:hover {
  color: var(--gf-green-deep);
}

/* ── 行動裝置 ── */
@media (max-width: 600px) {
  .brand-name {
    display: none;
  }

  .gf-nav-link {
    padding: 0 0.6rem;
    font-size: 0.8rem;
  }
}
</style>
