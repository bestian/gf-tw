import { createRouter, createWebHistory } from 'vue-router'
import GF_TW_View from '../views/GF_TW_View.vue'
import CollaborationView from '../views/CollaborationView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'map',
      component: GF_TW_View
    },
    {
      path: '/collaborate',
      name: 'collaborate',
      component: CollaborationView
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
