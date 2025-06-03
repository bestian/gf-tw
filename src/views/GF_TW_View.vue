<template>
  <div class="ui container">
    <div class="map-container">
      <div class="ui header">
        <h1>無麩質餐廳地圖</h1>
      </div>
      <div class ="ui form">
        <div class="two stackable fields">
          <div class="field">
            <label>搜尋</label>
            <input type="text" v-model="search" placeholder="搜尋">
          </div>
          <div class="field">
            <label>素食</label>
            <select v-model="vegetarian" class="ui dropdown">
              <option value="">葷素皆可</option>
              <option value="全店">全店素食</option>
              <option value="部份">部份餐點素食</option>
              <option value="無">無素食</option>
            </select>
          </div>
        </div>
      </div>

      <l-map
        style="height: calc(100vh - 100px); width: 100%"
        :zoom="zoom"
        :center="center"
        @ready="onMapReady"
      >
        <l-tile-layer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <l-marker
          v-for="(marker, index) in filteredMarkers"
          :key="index"
          :lat-lng="marker.latlng"
          :options="{ icon: createCustomIcon(marker.name) }"
        >
          <l-popup>
            <strong>{{ marker.name || '未命名' }}</strong><br />
            📍 <a :href="`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(marker.address)}`" target="_blank" rel="noopener noreferrer">{{ marker.address || '無地址' }}</a><br />
            ☎️ {{ marker.phone || '無電話' }}<br />
            ✅ 無麩質：{{ marker.glutenFree || '無資料' }}<br />
            🥬 素食：{{ marker.vegetarian || '無資料' }}<br />
            🍽 餐點：{{ marker.menu || '無餐點資料' }}<br />
            <span v-if="marker.businessHours">⏰ {{ marker.businessHours }}</span>
            <span v-if="marker.category">🏷️ {{ marker.category }}</span>
            <span v-if="marker.notes">📝 {{ marker.notes }}</span>
            <br/>
            <span v-if="marker.url">
              <a :href="marker.url" target="_blank" rel="noopener noreferrer">🔗網址
                {{ marker.url }}
              </a>
            </span>
          </l-popup>
        </l-marker>
      </l-map>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { LMap, LTileLayer, LMarker, LPopup } from '@vue-leaflet/vue-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { physical_storesRef } from '@/firebase'
import { onValue } from 'firebase/database'

// 創建自定義圖示函數
function createCustomIcon(name: string) {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="marker-container">
        <img src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png" class="marker-icon">
        <div class="marker-label">${name}</div>
      </div>
    `,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
  })
}

// 修復 Leaflet 圖示問題
delete (L.Icon.Default.prototype as { _getIconUrl?: string })._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface Restaurant {
  name: string
  address: string
  phone: string
  businessHours: string
  glutenFree: string
  vegetarian: string
  category: string
  menu: string
  notes: string
  latlng: [number, number]
  timestamp?: string
  url?: string
}

// 添加預設值函數
function getDefaultRestaurant(): Restaurant {
  return {
    name: '',
    address: '',
    phone: '',
    businessHours: '',
    glutenFree: '',
    vegetarian: '',
    category: '',
    menu: '',
    notes: '',
    latlng: [0, 0]
  }
}

// 台灣中心
const center = ref<[number, number]>([23.5, 121]) // 台北市中心
const zoom = ref(7)
const markers = ref<Restaurant[]>([])
const search = ref('')
const vegetarian = ref('')

const filteredMarkers = computed(() => {
  return markers.value.filter(marker => {

    let ans = true
    if (search.value &&
      !marker.name.toLowerCase().includes(search.value.toLowerCase())
      && !marker.address.toLowerCase().includes(search.value.toLowerCase())
      && !marker.category.toLowerCase().includes(search.value.toLowerCase())
      && !marker.menu.toLowerCase().includes(search.value.toLowerCase())
      && !marker.notes.toLowerCase().includes(search.value.toLowerCase())
      && !marker.phone.toLowerCase().includes(search.value.toLowerCase())
      && !marker.businessHours.toLowerCase().includes(search.value.toLowerCase())
      && !marker.glutenFree.toLowerCase().includes(search.value.toLowerCase())
    ) {
      ans = false
    }

    if (vegetarian.value && vegetarian.value != marker.vegetarian) {
      ans = false
    }
    return ans
  })
})

async function loadMarkers() {
  // 使用 Firebase 即時監聽資料
  onValue(physical_storesRef, (snapshot) => {
    const data = snapshot.val()
    if (data) {
      markers.value = Object.values(data).map(store => {
        const defaultStore = getDefaultRestaurant()
        return {
          ...defaultStore,
          ...(store as Partial<Restaurant>)
        } as Restaurant
      })
    }
  }, (error) => {
    console.error('Error loading markers:', error)
  })
}

function onMapReady() {
  console.log('Map is ready')
  loadMarkers()
}

onMounted(() => {
  console.log('Component mounted')
})
</script>

<style>
html, body, #app {
  margin: 0;
  height: 100%;
}

.map-container {
  position: relative;
  height: 100vh;
}

.nav-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50px;
  background-color: #42b983;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  margin: 0 0.5rem;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-link.router-link-active {
  background-color: rgba(255, 255, 255, 0.2);
}

.custom-marker {
  background: none;
  border: none;
}

.marker-container {
  position: relative;
  display: inline-block;
}

.marker-icon {
  width: 25px;
  height: 41px;
}

.marker-label {
  position: absolute;
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  padding: 2px 6px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  font-size: 16px;
  white-space: nowrap;
  z-index: 1000;
}

/* 添加連結樣式 */
.leaflet-popup-content a {
  color: #42b983;
  text-decoration: none;
}

.leaflet-popup-content a:hover {
  text-decoration: underline;
}

.leaflet-popup-content {
  font-size: 14px;
}
</style>
