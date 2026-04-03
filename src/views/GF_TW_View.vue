<template>
  <div class="gf-map-page">
    <!-- 搜尋控制列 -->
    <div class="gf-controls-bar">
      <div class="controls-row">
        <div class="search-wrap" :class="{ active: search }">
          <svg class="search-svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
            <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            v-model="search"
            placeholder="搜尋店名、地址、料理類型…"
            class="search-input"
          >
          <button v-if="search" class="clear-btn" @click="search = ''" aria-label="清除">✕</button>
        </div>

        <select v-model="vegetarian" class="veg-filter">
          <option value="">葷素皆可</option>
          <option value="全店">🥬 全店素食</option>
          <option value="部份">🥗 部份素食</option>
          <option value="無">🍖 無素食</option>
        </select>

        <span class="count-chip" v-if="filteredMarkers.length > 0">
          {{ filteredMarkers.length }} 家
        </span>
      </div>
    </div>

    <!-- 地圖 -->
    <div class="gf-map-area">
      <l-map
        style="height: 100%; width: 100%"
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
            <div class="gf-popup-card">
              <div class="popup-title">{{ marker.name || '未命名' }}</div>
              <div class="popup-rows">
                <div class="popup-row" v-if="marker.address">
                  <span class="popup-tag">📍</span>
                  <a
                    :href="`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(marker.address)}`"
                    target="_blank" rel="noopener noreferrer" class="popup-link"
                  >{{ marker.address }}</a>
                </div>
                <div class="popup-row" v-if="marker.phone">
                  <span class="popup-tag">☎</span>
                  <span>{{ marker.phone }}</span>
                </div>
                <div class="popup-row">
                  <span class="popup-tag">✓</span>
                  <span class="gf-badge">無麩質：{{ marker.glutenFree || '無資料' }}</span>
                </div>
                <div class="popup-row" v-if="marker.vegetarian">
                  <span class="popup-tag">🥬</span>
                  <span>素食：{{ marker.vegetarian }}</span>
                </div>
                <div class="popup-row" v-if="marker.menu">
                  <span class="popup-tag">🍽</span>
                  <span>{{ marker.menu }}</span>
                </div>
                <div class="popup-row" v-if="marker.businessHours">
                  <span class="popup-tag">⏰</span>
                  <span>{{ marker.businessHours }}</span>
                </div>
                <div class="popup-row" v-if="marker.category">
                  <span class="popup-tag">🏷</span>
                  <span>{{ marker.category }}</span>
                </div>
                <div class="popup-row" v-if="marker.notes">
                  <span class="popup-tag">📝</span>
                  <span>{{ marker.notes }}</span>
                </div>
                <div class="popup-row" v-if="marker.url">
                  <span class="popup-tag">🔗</span>
                  <a :href="marker.url" target="_blank" rel="noopener noreferrer" class="popup-link">
                    官方網站 ↗
                  </a>
                </div>
              </div>
            </div>
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

function createCustomIcon(name: string) {
  const safeName = name.replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return L.divIcon({
    className: 'gf-marker',
    html: `
      <div class="gf-pin-wrap">
        <div class="gf-pin-label">${safeName}</div>
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 28 40">
          <path d="M14 2C8.48 2 4 6.48 4 12c0 8.5 10 26 10 26s10-17.5 10-26C24 6.48 19.52 2 14 2z"
                fill="#40916c" stroke="#1e4d32" stroke-width="1.5"/>
          <circle cx="14" cy="12" r="5.8" fill="white" opacity="0.93"/>
          <path d="M14 7.5 C17 9.5 17 12.2 14 15.8 C11 12.2 11 9.5 14 7.5Z" fill="#2d6a4f" opacity="0.85"/>
        </svg>
      </div>
    `,
    iconSize: [28, 40],
    iconAnchor: [14, 40],
    popupAnchor: [0, -44]
  })
}

// 修復 Leaflet 預設圖示（備用）
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

function getDefaultRestaurant(): Restaurant {
  return {
    name: '', address: '', phone: '', businessHours: '',
    glutenFree: '', vegetarian: '', category: '', menu: '',
    notes: '', latlng: [0, 0]
  }
}

const center = ref<[number, number]>([23.5, 121])
const zoom = ref(7)
const markers = ref<Restaurant[]>([])
const search = ref('')
const vegetarian = ref('')

const filteredMarkers = computed(() =>
  markers.value.filter(marker => {
    if (
      search.value &&
      !marker.name.toLowerCase().includes(search.value.toLowerCase()) &&
      !marker.address.toLowerCase().includes(search.value.toLowerCase()) &&
      !marker.category.toLowerCase().includes(search.value.toLowerCase()) &&
      !marker.menu.toLowerCase().includes(search.value.toLowerCase()) &&
      !marker.notes.toLowerCase().includes(search.value.toLowerCase()) &&
      !marker.phone.toLowerCase().includes(search.value.toLowerCase()) &&
      !marker.businessHours.toLowerCase().includes(search.value.toLowerCase()) &&
      !marker.glutenFree.toLowerCase().includes(search.value.toLowerCase())
    ) return false
    if (vegetarian.value && vegetarian.value !== marker.vegetarian) return false
    return true
  })
)

function loadMarkers() {
  onValue(physical_storesRef, (snapshot) => {
    const data = snapshot.val()
    if (data) {
      markers.value = Object.values(data).map(store => ({
        ...getDefaultRestaurant(),
        ...(store as Partial<Restaurant>)
      } as Restaurant))
    }
  }, (error) => {
    console.error('Error loading markers:', error)
  })
}

function onMapReady() {
  loadMarkers()
}

onMounted(() => {})
</script>

<style>
/* 全版地圖頁基底 */
html, body {
  margin: 0;
  padding: 0;
}

.gf-map-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - var(--nav-h));
  overflow: hidden;
}

/* ── 搜尋控制列 ── */
.gf-controls-bar {
  flex-shrink: 0;
  background: var(--gf-bg-card);
  border-bottom: 1px solid var(--gf-border);
  padding: 0.55rem 1rem;
  box-shadow: 0 2px 8px rgba(30, 77, 50, 0.08);
  z-index: 999;
}

.controls-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  max-width: 900px;
}

.search-wrap {
  display: flex;
  align-items: center;
  flex: 1;
  background: var(--gf-bg-soft);
  border: 1.5px solid var(--gf-border);
  border-radius: var(--gf-radius-pill);
  padding: 0 0.85rem;
  transition: border-color 0.2s, box-shadow 0.2s, background-color 0.2s;
}

.search-wrap:focus-within {
  border-color: var(--gf-border-focus);
  box-shadow: 0 0 0 3px rgba(64, 145, 108, 0.1);
  background: var(--gf-bg-card);
}

.search-svg {
  color: var(--gf-text-muted);
  flex-shrink: 0;
  margin-right: 0.4rem;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 0.52rem 0;
  font-size: 0.9rem;
  color: var(--gf-text);
  outline: none;
  font-family: inherit;
}

.search-input::placeholder {
  color: #8aab97;
}

.clear-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--gf-text-muted);
  font-size: 0.8rem;
  padding: 0.1rem 0.2rem;
  line-height: 1;
  transition: color 0.2s;
  flex-shrink: 0;
}

.clear-btn:hover {
  color: var(--gf-text);
}

.veg-filter {
  border: 1.5px solid var(--gf-border);
  border-radius: var(--gf-radius-pill);
  padding: 0.5rem 0.9rem;
  font-size: 0.875rem;
  color: var(--gf-text);
  background: var(--gf-bg-card);
  outline: none;
  cursor: pointer;
  transition: border-color 0.2s;
  font-family: inherit;
  flex-shrink: 0;
}

.veg-filter:focus {
  border-color: var(--gf-border-focus);
  box-shadow: 0 0 0 3px rgba(64, 145, 108, 0.1);
}

.count-chip {
  display: inline-flex;
  align-items: center;
  background: var(--gf-green-pale);
  color: var(--gf-green-deep);
  font-size: 0.8rem;
  font-weight: 700;
  padding: 0.28rem 0.75rem;
  border-radius: var(--gf-radius-pill);
  white-space: nowrap;
  flex-shrink: 0;
}

/* ── 地圖區 ── */
.gf-map-area {
  flex: 1;
  position: relative;
  min-height: 0;
}

/* ── 自訂地標 ── */
.gf-marker {
  background: none !important;
  border: none !important;
  overflow: visible !important;
}

.gf-pin-wrap {
  position: relative;
  display: inline-block;
  overflow: visible;
}

.gf-pin-label {
  position: absolute;
  top: -28px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.97);
  color: var(--gf-green-deep);
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.18);
  border: 1.5px solid rgba(64, 145, 108, 0.4);
  max-width: 110px;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.5;
  pointer-events: none;
  font-family: 'PingFang TC', 'Noto Sans TC', sans-serif;
}

/* ── 彈出視窗 ── */
.leaflet-popup-content-wrapper {
  border-radius: var(--gf-radius-lg) !important;
  box-shadow: 0 6px 24px rgba(30, 77, 50, 0.2) !important;
  border: 1px solid var(--gf-border) !important;
  padding: 0 !important;
  overflow: hidden;
}

.leaflet-popup-content {
  margin: 0 !important;
  font-family: 'PingFang TC', 'Noto Sans TC', sans-serif !important;
}

.leaflet-popup-tip-container {
  margin-top: -1px;
}

.gf-popup-card {
  min-width: 210px;
  max-width: 270px;
  font-size: 13px;
  padding: 12px 14px 14px;
}

.popup-title {
  font-size: 15px;
  font-weight: 800;
  color: var(--gf-green-deep);
  margin-bottom: 0.55rem;
  padding-bottom: 0.45rem;
  border-bottom: 2px solid var(--gf-green-pale);
  letter-spacing: 0.02em;
}

.popup-rows {
  display: flex;
  flex-direction: column;
  gap: 0.32rem;
}

.popup-row {
  display: flex;
  align-items: flex-start;
  gap: 0.4rem;
  line-height: 1.55;
  color: var(--gf-text);
}

.popup-tag {
  flex-shrink: 0;
  width: 18px;
  text-align: center;
  font-size: 13px;
  line-height: 1.55;
}

.gf-badge {
  display: inline-block;
  background: var(--gf-green-pale);
  color: var(--gf-green-deep);
  padding: 1px 7px;
  border-radius: var(--gf-radius-sm);
  font-weight: 600;
  font-size: 12px;
}

.popup-link {
  color: var(--gf-green-mid);
  text-decoration: none;
  word-break: break-all;
}

.popup-link:hover {
  text-decoration: underline;
}
</style>
