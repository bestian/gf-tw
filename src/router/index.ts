import { createRouter, createWebHistory } from 'vue-router'
import GF_TW_View from '../views/GF_TW_View.vue'
import WebStoresView from '../views/WebStoresView.vue'
import CollaborationView from '../views/CollaborationView.vue'
import DataReviewView from '../views/DataReviewView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: GF_TW_View
    },
    {
      path: '/web-stores',
      name: 'web-stores',
      component: WebStoresView
    },
    {
      path: '/collaborate',
      name: 'collaborate',
      component: CollaborationView
    },
    {
      path: '/review',
      name: 'review',
      component: DataReviewView
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
  ],
})

export default router
