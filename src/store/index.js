// /src/store/index.js - Updated with leaderboard module
import { createStore } from 'vuex'
import auth from './modules/auth'
import dashboard from './modules/dashboard'
import products from './modules/products'
import campaigns from './modules/campaigns'
import categories from './modules/categories'
import users from './modules/users'
import redemptions from './modules/redemptions'
import leaderboard from './modules/leaderboard' // Add leaderboard module

export default createStore({
  modules: {
    auth,
    dashboard,
    products,
    campaigns,
    categories,
    users,
    redemptions,
    leaderboard // Include leaderboard module
  },
  
  state: {
    // Global state
    isLoading: false,
    error: null
  },
  
  mutations: {
    SET_GLOBAL_LOADING(state, loading) {
      state.isLoading = loading
    },
    
    SET_GLOBAL_ERROR(state, error) {
      state.error = error
    },
    
    CLEAR_GLOBAL_ERROR(state) {
      state.error = null
    }
  },
  
  actions: {
    setGlobalLoading({ commit }, loading) {
      commit('SET_GLOBAL_LOADING', loading)
    },
    
    setGlobalError({ commit }, error) {
      commit('SET_GLOBAL_ERROR', error)
    },
    
    clearGlobalError({ commit }) {
      commit('CLEAR_GLOBAL_ERROR')
    }
  },
  
  getters: {
    isGlobalLoading: (state) => state.isLoading,
    globalError: (state) => state.error,
    hasGlobalError: (state) => !!state.error
  }
})