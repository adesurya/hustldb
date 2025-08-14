// /src/store/index.js - Updated with categories module
import { createStore } from 'vuex'
import auth from './modules/auth'
import dashboard from './modules/dashboard'
import products from './modules/products'
import campaigns from './modules/campaigns'
import categories from './modules/categories' // Add categories module
import users from './modules/users'

export default createStore({
  modules: {
    auth,
    dashboard,
    products,
    campaigns,
    categories, // Include categories module
    users
  },
  
  state: {
    // Global state
  },
  
  mutations: {
    // Global mutations
  },
  
  actions: {
    // Global actions
  },
  
  getters: {
    // Global getters
  }
})