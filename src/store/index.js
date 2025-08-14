// /src/store/index.js - Updated with redemptions module
import { createStore } from 'vuex'
import auth from './modules/auth'
import dashboard from './modules/dashboard'
import products from './modules/products'
import campaigns from './modules/campaigns'
import categories from './modules/categories'
import users from './modules/users'
import redemptions from './modules/redemptions' // Add redemptions module

export default createStore({
  modules: {
    auth,
    dashboard,
    products,
    campaigns,
    categories,
    users,
    redemptions // Include redemptions module
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