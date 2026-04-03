<template>
  <div class="gf-stores-page">
    <div class="page-header">
      <h1 class="page-title">無麩質網路店家</h1>
      <p class="page-subtitle">精選台灣無麩質商品網路賣家</p>
    </div>

    <div class="search-bar">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2.2" stroke-linecap="round" class="search-icon-svg">
        <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input
        class="search-input"
        type="text"
        v-model="searchQuery"
        placeholder="搜尋店名、產品類型…"
      >
    </div>

    <div class="stores-grid" v-if="filteredAndSortedStores.length > 0">
      <a
        v-for="store in filteredAndSortedStores"
        :key="store.name"
        :href="store.url"
        target="_blank"
        rel="noopener noreferrer"
        class="store-card"
      >
        <div class="card-top">
          <span class="store-name">{{ store.name }}</span>
          <span class="card-arrow">↗</span>
        </div>
        <div class="card-badges">
          <span class="badge badge-type">{{ store.product_type }}</span>
          <span v-if="store.shared_line === '否'" class="badge badge-safe">
            ✓ 專用生產線
          </span>
          <span v-else-if="store.shared_line === '是'" class="badge badge-warn">
            ⚠ 共用生產線
          </span>
        </div>
        <p v-if="store.notes" class="card-notes">{{ store.notes }}</p>
      </a>
    </div>

    <div class="empty-state" v-else>
      <span class="empty-icon">🔍</span>
      <p>沒有符合「{{ searchQuery }}」的店家</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { web_storesRef } from '@/firebase'
import { onValue } from 'firebase/database'

interface WebStore {
  name: string
  url: string
  product_type: string
  shared_line: string
  notes?: string
}

const stores = ref<WebStore[]>([])
const searchQuery = ref('')

const filteredAndSortedStores = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  const filtered = query
    ? stores.value.filter(store =>
        (store.name || '').toLowerCase().includes(query) ||
        (store.product_type || '').toLowerCase().includes(query)
      )
    : stores.value

  return filtered.sort((a, b) => {
    if (a.shared_line !== b.shared_line) return a.shared_line === '否' ? -1 : 1
    return (a.name || '').localeCompare(b.name || '', 'zh-TW')
  })
})

onMounted(() => {
  onValue(web_storesRef, (snapshot) => {
    const data = snapshot.val()
    if (data) stores.value = Object.values(data) as WebStore[]
  }, (error) => {
    console.error('Error loading web stores:', error)
  })
})
</script>

<style scoped>
.gf-stores-page {
  max-width: 980px;
  margin: 0 auto;
  padding: 2.5rem 1.25rem 5rem;
}

/* ── 頁首 ── */
.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--gf-green-deep);
  letter-spacing: 0.04em;
  margin-bottom: 0.4rem;
}

.page-subtitle {
  color: var(--gf-text-muted);
  font-size: 0.95rem;
}

/* ── 搜尋列 ── */
.search-bar {
  display: flex;
  align-items: center;
  background: var(--gf-bg-card);
  border: 1.5px solid var(--gf-border);
  border-radius: var(--gf-radius-pill);
  padding: 0 1.1rem;
  margin-bottom: 2rem;
  box-shadow: var(--gf-shadow-sm);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.search-bar:focus-within {
  border-color: var(--gf-border-focus);
  box-shadow: 0 0 0 3px rgba(64, 145, 108, 0.1);
}

.search-icon-svg {
  color: var(--gf-text-muted);
  flex-shrink: 0;
  margin-right: 0.5rem;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  padding: 0.8rem 0;
  font-size: 0.95rem;
  color: var(--gf-text);
  background: transparent;
  font-family: inherit;
}

.search-input::placeholder {
  color: #8aab97;
}

/* ── 卡片格線 ── */
.stores-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(288px, 1fr));
  gap: 1.1rem;
}

.store-card {
  display: block;
  text-decoration: none;
  background: var(--gf-bg-card);
  border: 1.5px solid var(--gf-border);
  border-radius: var(--gf-radius-lg);
  padding: 1.1rem 1.25rem 1.15rem;
  color: inherit;
  box-shadow: var(--gf-shadow-sm);
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
}

.store-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 22px rgba(30, 77, 50, 0.14);
  border-color: rgba(64, 145, 108, 0.4);
}

.card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.65rem;
}

.store-name {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--gf-green-deep);
  line-height: 1.4;
}

.card-arrow {
  font-size: 1.05rem;
  color: var(--gf-green-sage);
  flex-shrink: 0;
  margin-top: 0.05rem;
}

/* ── 標籤 ── */
.card-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 0.5rem;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  padding: 2px 9px;
  border-radius: var(--gf-radius-pill);
  font-size: 0.77rem;
  font-weight: 500;
  line-height: 1.6;
}

.badge-type {
  background: var(--gf-green-mist);
  color: var(--gf-green-forest);
  border: 1px solid rgba(64, 145, 108, 0.25);
}

.badge-safe {
  background: var(--gf-green-pale);
  color: var(--gf-green-deep);
  border: 1px solid rgba(64, 145, 108, 0.3);
  font-weight: 600;
}

.badge-warn {
  background: var(--gf-gold-light);
  color: var(--gf-gold);
  border: 1px solid rgba(181, 131, 47, 0.3);
}

.card-notes {
  font-size: 0.84rem;
  color: var(--gf-text-muted);
  line-height: 1.55;
  margin-top: 0.35rem;
}

/* ── 空狀態 ── */
.empty-state {
  text-align: center;
  padding: 5rem 2rem;
  color: var(--gf-text-muted);
}

.empty-icon {
  font-size: 2.8rem;
  display: block;
  margin-bottom: 0.75rem;
  opacity: 0.6;
}

/* ── 行動裝置 ── */
@media (max-width: 480px) {
  .stores-grid {
    grid-template-columns: 1fr;
  }

  .gf-stores-page {
    padding: 1.5rem 1rem 3rem;
  }

  .page-title {
    font-size: 1.45rem;
  }
}
</style>
