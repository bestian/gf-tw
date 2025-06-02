<template>
  <div class="collaboration-container">
    <h1>新增無麩質店家</h1>

    <div class="ui top attached tabular menu">
      <a class="item" :class="{ active: activeTab === 'physical' }" @click="activeTab = 'physical'">
        上傳實體店面
      </a>
      <a class="item" :class="{ active: activeTab === 'web' }" @click="activeTab = 'web'">
        上傳網路店面
      </a>
    </div>

    <!-- 實體店面表單 -->
    <div v-if="activeTab === 'physical'" class="ui bottom attached tab segment" :class="{ active: activeTab === 'physical' }">
      <form @submit.prevent="submitPhysicalStore" class="restaurant-form">
        <div class="form-group">
          <label for="name">餐廳名稱 *</label>
          <input
            type="text"
            id="name"
            v-model="formData.name"
            required
            placeholder="請輸入餐廳名稱"
          >
        </div>

        <div class="form-group">
          <label for="address">地址 *</label>
          <input
            type="text"
            id="address"
            v-model="formData.address"
            required
            placeholder="請輸入完整地址"
          >
        </div>

        <div class="form-group">
          <label for="phone">電話</label>
          <input
            type="tel"
            id="phone"
            v-model="formData.phone"
            placeholder="請輸入電話號碼"
          >
        </div>

        <div class="form-group">
          <label for="businessHours">營業時間</label>
          <input
            type="text"
            id="businessHours"
            v-model="formData.businessHours"
            placeholder="例如：11:00-21:00"
          >
        </div>

        <div class="form-group">
          <label for="url">網址</label>
          <input
            type="url"
            id="url"
            v-model="formData.url"
            placeholder="https://..."
          >
        </div>

        <div class="form-group">
          <label for="glutenFree">無麩質選項 *</label>
          <select id="glutenFree" v-model="formData.glutenFree" required>
            <option value="全">全店無麩質</option>
            <option value="部份">部分餐點無麩質</option>
            <option value="提供無麩質菜單">提供無麩質菜單</option>
          </select>
        </div>


        <div class="form-group">
          <label for="vegetarian">素食選項 *</label>
          <select id="vegetarian" v-model="formData.vegetarian" required>
            <option value="全店">全店素食</option>
            <option value="部份">部分餐點素食</option>
            <option value="無">無素食</option>
          </select>
        </div>

        <div class="form-group">
          <label for="category">餐廳類型</label>
          <input
            type="text"
            id="category"
            v-model="formData.category"
            placeholder="例如：西式、中式、甜點店等"
          >
        </div>

        <div class="form-group">
          <label for="menu">無麩質餐點</label>
          <textarea
            id="menu"
            v-model="formData.menu"
            placeholder="請列出無麩質餐點選項"
            rows="3"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="notes">備註</label>
          <textarea
            id="notes"
            v-model="formData.notes"
            placeholder="其他想補充的資訊"
            rows="3"
          ></textarea>
        </div>

        <button type="submit" class="submit-btn">送出資料</button>
      </form>
    </div>

    <!-- 網路店面表單 -->
    <div v-if="activeTab === 'web'" class="ui bottom attached tab segment" :class="{ active: activeTab === 'web' }">
      <form @submit.prevent="submitWebStore" class="restaurant-form">
        <div class="form-group">
          <label for="webName">商店名稱 *</label>
          <input
            type="text"
            id="webName"
            v-model="webFormData.name"
            required
            placeholder="請輸入商店名稱"
          >
        </div>

        <div class="form-group">
          <label for="url">商店網址 *</label>
          <input
            type="url"
            id="url"
            v-model="webFormData.url"
            required
            placeholder="請輸入商店網址"
          >
        </div>

        <div class="form-group">
          <label for="productType">產品類型 *</label>
          <input
            type="text"
            id="productType"
            v-model="webFormData.product_type"
            required
            placeholder="例如：麵包、甜點、零食等"
          >
        </div>

        <div class="form-group">
          <label for="sharedLine">生產線狀態 *</label>
          <select id="sharedLine" v-model="webFormData.shared_line" required>
            <option value="否">無麩質專用生產線</option>
            <option value="是">與麩質產品共用生產線</option>
          </select>
        </div>

        <div class="form-group">
          <label for="webNotes">備註</label>
          <textarea
            id="webNotes"
            v-model="webFormData.notes"
            placeholder="其他想補充的資訊"
            rows="3"
          ></textarea>
        </div>

        <button type="submit" class="submit-btn">送出資料</button>
      </form>
    </div>

    <div v-if="showSuccess" class="success-message">
      資料已成功儲存！
    </div>

    <div v-if="showError" class="error-message">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { physical_storesRef, web_storesRef, db } from '@/firebase'
import { set, ref as dbRef, onValue } from 'firebase/database'

interface RestaurantForm {
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
}

interface WebStoreForm {
  name: string
  url: string
  product_type: string
  shared_line: string
  notes: string
}

const activeTab = ref('physical')
const physical_stores = ref<RestaurantForm[]>([])
const web_stores = ref<WebStoreForm[]>([])

onValue(physical_storesRef, (snapshot) => {
  const data = snapshot.val()
  if (data) {
    physical_stores.value = Object.values(data) as RestaurantForm[]
  }
})

onValue(web_storesRef, (snapshot) => {
  const data = snapshot.val()
  if (data) {
    web_stores.value = Object.values(data) as WebStoreForm[]
  }
})

const formData = reactive<RestaurantForm>({
  name: '',
  address: '',
  phone: '',
  businessHours: '',
  glutenFree: '',
  vegetarian: '',
  category: '',
  menu: '',
  notes: '',
  url: ''
})

const webFormData = reactive<WebStoreForm>({
  name: '',
  url: '',
  product_type: '',
  shared_line: '',
  notes: ''
})

const showSuccess = ref(false)
const showError = ref(false)
const errorMessage = ref('')

async function fetchCoordinates(address: string): Promise<[number, number] | null> {
  try {
    const apiKey = '8ec79654fd464538b929d9bf0bec0929'
    const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(address)}&apiKey=${apiKey}`

    const response = await fetch(url)
    const data = await response.json()

    console.log('Geoapify API response:', data)

    if (data.features && data.features.length > 0) {
      const [lon, lat] = data.features[0].geometry.coordinates
      console.log(`Found coordinates for ${address}:`, [lat, lon])
      return [lat, lon]
    }

    console.log('No coordinates found for:', address)
    return null
  } catch (error) {
    console.error('Error fetching coordinates:', error)
    return null
  }
}

async function submitPhysicalStore() {
  try {
    // 獲取座標
    const latlng = await fetchCoordinates(formData.address)

    if (!latlng) {
      showError.value = true
      errorMessage.value = '無法獲取地址座標，請確認地址是否正確'
      return
    }

    // 準備要儲存的資料
    const storeData = {
      ...formData,
      latlng,
      timestamp: new Date().toISOString()
    }

    const index = physical_stores.value.length

    // 使用 Firebase 儲存資料
    await set(dbRef(db, 'physical_stores/' + index), storeData)

    // 顯示成功訊息
    showSuccess.value = true

    // 重置表單
    Object.assign(formData, {
      name: '',
      address: '',
      phone: '',
      businessHours: '',
      glutenFree: '',
      vegetarian: '',
      category: '',
      menu: '',
      notes: '',
      url: '',
      latlng: undefined
    })

    // 3秒後隱藏成功訊息
    setTimeout(() => {
      showSuccess.value = false
    }, 3000)
  } catch (error) {
    console.error('Error submitting physical store form:', error)
    showError.value = true
    errorMessage.value = '提交資料時發生錯誤'
  }
}

async function submitWebStore() {
  try {
    // 準備要儲存的資料
    const storeData = {
      ...webFormData,
      timestamp: new Date().toISOString()
    }

    const index = web_stores.value.length

    // 使用 Firebase 儲存資料
    await set(dbRef(db, 'web_stores/' + index), storeData)

    // 顯示成功訊息
    showSuccess.value = true

    // 重置表單
    Object.assign(webFormData, {
      name: '',
      url: '',
      product_type: '',
      shared_line: '',
      notes: ''
    })

    // 3秒後隱藏成功訊息
    setTimeout(() => {
      showSuccess.value = false
    }, 3000)
  } catch (error) {
    console.error('Error submitting web store form:', error)
    showError.value = true
    errorMessage.value = '提交資料時發生錯誤'
  }
}
</script>

<style scoped>
.collaboration-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 2rem;
}

.restaurant-form {
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 500;
}

input, select, textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: #42b983;
  box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.2);
}

.submit-btn {
  background-color: #42b983;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  width: 100%;
  transition: background-color 0.3s;
}

.submit-btn:hover {
  background-color: #3aa876;
}

.success-message {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #d4edda;
  color: #155724;
  border-radius: 4px;
  text-align: center;
}

.error-message {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f8d7da;
  color: #721c24;
  border-radius: 4px;
  text-align: center;
}

@media (max-width: 768px) {
  .collaboration-container {
    padding: 1rem;
  }

  .restaurant-form {
    padding: 1rem;
  }
}

.ui.tabular.menu {
  margin-bottom: 0;
}

.ui.tabular.menu .item {
  cursor: pointer;
}

.ui.tabular.menu .item.active {
  background-color: #fff;
  border-color: #ddd;
  border-bottom-color: #fff;
  font-weight: bold;
}

.ui.bottom.attached.tab.segment {
  border-top: none;
  border-radius: 0 0 4px 4px;
  margin-top: 0;
  padding: 1rem;
  display: none;
}

.ui.bottom.attached.tab.segment.active {
  display: block;
}
</style>
