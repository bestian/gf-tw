<template>
  <div class="map-container">
    <nav class="nav-bar">
      <router-link to="/" class="nav-link">地圖</router-link>
      <router-link to="/collaborate" class="nav-link">新增餐廳</router-link>
    </nav>

    <l-map
      style="height: calc(100vh - 50px); width: 100%"
      :zoom="zoom"
      :center="center"
      @ready="onMapReady"
    >
      <l-tile-layer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <l-marker
        v-for="(marker, index) in markers"
        :key="index"
        :lat-lng="marker.latlng"
      >
        <l-popup>
          <strong>{{ marker.name }}</strong><br />
          📍 {{ marker.address }}<br />
          ☎️ {{ marker.phone }}<br />
          ✅ 無麩質：{{ marker.glutenFree }}<br />
          🍽 餐點：{{ marker.menu }}<br />
          <span v-if="marker.businessHours">⏰ {{ marker.businessHours }}</span>
          <span v-if="marker.category">🏷️ {{ marker.category }}</span>
          <span v-if="marker.notes">📝 {{ marker.notes }}</span>
        </l-popup>
      </l-marker>
    </l-map>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { LMap, LTileLayer, LMarker, LPopup } from '@vue-leaflet/vue-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// 修復 Leaflet 圖示問題
delete (L.Icon.Default.prototype as any)._getIconUrl
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
  category: string
  menu: string
  notes: string
  latlng?: [number, number]
  timestamp?: string
}

const center = ref([25.0418, 121.5485]) // 台北市中心
const zoom = ref(12)
const markers = ref<Restaurant[]>([])

// 已知座標的餐廳
const knownLocations: { [key: string]: [number, number] } = {
  '撒福豆無麩質蔬食餐廳': [25.0418, 121.5485],
  '茹絲葵牛排館(台北內湖店)': [25.0789, 121.5647]
}

async function fetchLatLng(address: string): Promise<[number, number] | null> {
  try {
    console.log('Fetching coordinates for:', address)
    const searchQuery = `${address}, 台灣`
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=tw&limit=1`
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'VueDemoApp',
        'Accept-Language': 'zh-TW'
      }
    })
    const data = await res.json()
    if (data && data.length > 0) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)] as [number, number]
    }
    return null
  } catch (error) {
    console.error('Error fetching coordinates:', error)
    return null
  }
}

async function loadMarkers() {
  // 從 localStorage 讀取資料
  const storedData = localStorage.getItem('restaurants')
  if (storedData) {
    const restaurants = JSON.parse(storedData)
    for (const r of restaurants) {
      // 如果是已知位置的餐廳，直接使用已知座標
      if (knownLocations[r.name]) {
        markers.value.push({ ...r, latlng: knownLocations[r.name] })
      } else {
        // 否則嘗試獲取座標
        const latlng = await fetchLatLng(r.address)
        if (latlng) {
          markers.value.push({ ...r, latlng })
        }
      }
    }
  }
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
</style>
