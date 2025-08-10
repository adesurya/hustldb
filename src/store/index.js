// /src/store/index.js - Updated with campaigns module
import { createStore } from 'vuex'
import auth from './modules/auth'
import dashboard from './modules/dashboard'
import products from './modules/products'
import campaigns from './modules/campaigns'
import users from './modules/users'

export default createStore({
  modules: {
    auth,
    dashboard,
    products,
    campaigns,
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