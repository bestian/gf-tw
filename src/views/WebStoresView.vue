<template>
  <div class="web-stores-container">
    <h1>無麩質網路店面</h1>

    <!-- 搜尋框 -->
    <div class="ui search">
      <div class="ui icon input" style="width: 100%;">
        <input
          class="prompt"
          type="text"
          v-model="searchQuery"
          placeholder="搜尋店名、產品類型..."
        >
        <i class="search icon"></i>
      </div>
    </div>

    <div class="ui segment">
      <div class="ui divided relaxed list">
        <div v-for="store in filteredAndSortedStores" :key="store.name" class="item">
          <div class="content">
            <a :href="store.url" target="_blank" class="header">{{ store.name }}</a>
            <div class="description">
              <div class="ui label">
                <i class="shopping bag icon"></i>
                {{ store.product_type }}
              </div>
              <div v-if="store.shared_line === '是'" class="ui orange label">
                <i class="exclamation triangle icon"></i>
                與麩質產品共用生產線
              </div>
              <div v-if="store.shared_line === '否'" class="ui green label">
                <i class="check circle icon"></i>
                無麩質專用生產線
              </div>
              <div v-if="store.notes" class="notes">
                <i class="info circle icon"></i>
                {{ store.notes }}
              </div>
            </div>
          </div>
        </div>
      </div>
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

// 過濾和排序後的商店列表
const filteredAndSortedStores = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()

  // 過濾
  const filtered = query
    ? stores.value.filter(store =>
        (store.name || '').toLowerCase().includes(query) ||
        (store.product_type || '').toLowerCase().includes(query)
      )
    : stores.value

  // 排序
  return filtered.sort((a, b) => {
    // 先按 shared_line 排序（'否' 在前）
    if (a.shared_line !== b.shared_line) {
      return a.shared_line === '否' ? -1 : 1
    }
    // 再按店名排序
    return (a.name || '').localeCompare(b.name || '', 'zh-TW')
  })
})

onMounted(() => {
  onValue(web_storesRef, (snapshot) => {
    const data = snapshot.val()
    if (data) {
      stores.value = Object.values(data) as WebStore[]
    }
  }, (error) => {
    console.error('Error loading web stores:', error)
  })
})
</script>

<style scoped>
.web-stores-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 2rem;
}

.ui.search {
  margin-bottom: 2rem;
}

.ui.search .prompt {
  border-radius: 4px;
  padding: 0.8rem 1rem;
  font-size: 1rem;
}

.ui.list .item {
  padding: 1rem 0;
}

.ui.list .item .header {
  font-size: 1.2rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.ui.list .item .description {
  margin-top: 0.5rem;
}

.ui.label {
  margin-right: 0.5rem;
}

.ui.label i.icon {
  margin-right: 0.3rem;
}

@media (max-width: 768px) {
  .web-stores-container {
    padding: 1rem;
  }
}

.notes {
  margin-top: 0.5rem;
}
</style>
