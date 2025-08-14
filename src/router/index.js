// /src/router/index.js - Updated with Redemption route
import { createRouter, createWebHistory } from 'vue-router'
import store from '../store'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/products',
    name: 'Products',
    component: () => import('../views/ProductView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/campaigns',
    name: 'Campaigns',
    component: () => import('../views/CampaignView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/category',
    name: 'Category',
    component: () => import('../views/CategoryView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/users',
    name: 'Users',
    component: () => import('../views/UserView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/redemption',
    name: 'Redemption',
    component: () => import('../views/RedemptionView.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// Navigation Guards
router.beforeEach((to, from, next) => {
  const isAuthenticated = store.getters['auth/isAuthenticated']
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresGuest && isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router