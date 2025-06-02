<template>
  <div class="data-review-container">
    <h1>校對店家資料</h1>

    <div class="ui top attached tabular menu">
      <a class="item" :class="{ active: activeTab === 'physical' }" @click="activeTab = 'physical'">
        實體店面
      </a>
      <a class="item" :class="{ active: activeTab === 'web' }" @click="activeTab = 'web'">
        網路店面
      </a>
    </div>

    <!-- 實體店面資料表格 -->
    <div v-if="activeTab === 'physical'" class="ui bottom attached tab segment" :class="{ active: activeTab === 'physical' }">
      <div class="ui stackable table">
        <table>
          <thead>
            <tr>
              <th>餐廳名稱</th>
              <th>地址</th>
              <th>電話</th>
              <th>營業時間</th>
              <th>網址</th>
              <th>無麩質選項</th>
              <th>素食選項</th>
              <th>類型</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(store, index) in physicalStores" :key="index">
              <td>
                <input type="text" v-model="store.name" class="ui input">
              </td>
              <td>
                <input type="text" v-model="store.address" class="ui input">
              </td>
              <td>
                <input type="text" v-model="store.phone" class="ui input">
              </td>
              <td>
                <input type="text" v-model="store.businessHours" class="ui input">
              </td>
              <td>
                <input type="url" v-model="store.url" class="ui input" placeholder="https://...">
              </td>
              <td>
                <select v-model="store.glutenFree" class="ui dropdown">
                  <option value="全">全店無麩質</option>
                  <option value="部份">部分餐點無麩質</option>
                  <option value="提供無麩質菜單">提供無麩質菜單</option>
                </select>
              </td>
              <td>
                <select v-model="store.vegetarian" class="ui dropdown">
                  <option value="全店">全店素食</option>
                  <option value="部份">部分餐點素食</option>
                  <option value="無">無素食</option>
                </select>
              </td>
              <td>
                <input type="text" v-model="store.category" class="ui input">
              </td>
              <td>
                <button class="ui primary button" @click="savePhysicalStore(index)">儲存</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 網路店面資料表格 -->
    <div v-if="activeTab === 'web'" class="ui bottom attached tab segment" :class="{ active: activeTab === 'web' }">
      <div class="ui stackable table">
        <table>
          <thead>
            <tr>
              <th>商店名稱</th>
              <th>網址</th>
              <th>產品類型</th>
              <th>生產線狀態</th>
              <th>備註</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(store, index) in webStores" :key="index">
              <td>
                <input type="text" v-model="store.name" class="ui input">
              </td>
              <td>
                <input type="url" v-model="store.url" class="ui input">
              </td>
              <td>
                <input type="text" v-model="store.product_type" class="ui input">
              </td>
              <td>
                <select v-model="store.shared_line" class="ui dropdown">
                  <option value="否">無麩質專用生產線</option>
                  <option value="是">與麩質產品共用生產線</option>
                </select>
              </td>
              <td>
                <input type="text" v-model="store.notes" class="ui input">
              </td>
              <td>
                <button class="ui primary button" @click="saveWebStore(index)">儲存</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 成功/錯誤訊息 -->
    <div v-if="showMessage" :class="['ui message', messageType]">
      <div class="content">
        <p>{{ messageText }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { physical_storesRef, web_storesRef, db } from '@/firebase'
import { set, ref as dbRef, onValue } from 'firebase/database'

interface PhysicalStore {
  name: string
  address: string
  phone: string
  businessHours: string
  glutenFree: string
  vegetarian: string
  category: string
  menu: string
  notes: string
  url: string
  latlng?: [number, number]
  timestamp?: string
}

interface WebStore {
  name: string
  url: string
  product_type: string
  shared_line: string
  notes: string
  timestamp?: string
}

const activeTab = ref('physical')
const physicalStores = ref<PhysicalStore[]>([])
const webStores = ref<WebStore[]>([])
const showMessage = ref(false)
const messageText = ref('')
const messageType = ref('success')

// 載入資料
onMounted(() => {
  loadPhysicalStores()
  loadWebStores()
})

function loadPhysicalStores() {
  onValue(physical_storesRef, (snapshot) => {
    const data = snapshot.val()
    if (data) {
      physicalStores.value = Object.values(data) as PhysicalStore[]
    }
  })
}

function loadWebStores() {
  onValue(web_storesRef, (snapshot) => {
    const data = snapshot.val()
    if (data) {
      webStores.value = Object.values(data) as WebStore[]
    }
  })
}

// 儲存實體店面資料
async function savePhysicalStore(index: number) {
  try {
    const store = physicalStores.value[index]
    await set(dbRef(db, `physical_stores/${index}`), {
      ...store,
      timestamp: new Date().toISOString()
    })
    showSuccessMessage('實體店面資料已更新')
  } catch (error) {
    console.error('Error saving physical store:', error)
    showErrorMessage('儲存實體店面資料時發生錯誤')
  }
}

// 儲存網路店面資料
async function saveWebStore(index: number) {
  try {
    const store = webStores.value[index]
    await set(dbRef(db, `web_stores/${index}`), {
      ...store,
      timestamp: new Date().toISOString()
    })
    showSuccessMessage('網路店面資料已更新')
  } catch (error) {
    console.error('Error saving web store:', error)
    showErrorMessage('儲存網路店面資料時發生錯誤')
  }
}

// 顯示訊息
function showSuccessMessage(message: string) {
  messageText.value = message
  messageType.value = 'success'
  showMessage.value = true
  setTimeout(() => {
    showMessage.value = false
  }, 3000)
}

function showErrorMessage(message: string) {
  messageText.value = message
  messageType.value = 'error'
  showMessage.value = true
  setTimeout(() => {
    showMessage.value = false
  }, 3000)
}
</script>

<style scoped>
.data-review-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 2rem;
}

.ui.table {
  margin-top: 1rem;
}

.ui.table input,
.ui.table select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.ui.table td {
  padding: 0.5rem;
}

.ui.button {
  margin: 0.25rem;
  width: 100%;
}

.ui.message {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
  min-width: 200px;
}

.ui.message.success {
  background-color: #d4edda;
  color: #155724;
}

.ui.message.error {
  background-color: #f8d7da;
  color: #721c24;
}

@media (max-width: 768px) {
  .data-review-container {
    padding: 1rem;
  }

  .ui.stackable.table {
    display: block;
    width: 100%;
    overflow-x: auto;
  }
}
</style>
