// /src/store/modules/dashboard.js - Fixed with better error handling
import apiService from '@/services/apiService'
import { API_ENDPOINTS } from '@/config/api'

const state = {
  statistics: {
    // Order Analytics
    orders: {
      totalOrders: 0,
      pendingOrders: 0,
      completedOrders: 0,
      totalRevenue: 0,
      dailyOrders: [],
      monthlyRevenue: []
    },
    // Affiliate Statistics
    affiliates: {
      totalAffiliates: 0,
      activeAffiliates: 0,
      totalCommissions: 0,
      topPerformers: []
    },
    // Leaderboard Statistics
    leaderboard: {
      topUsers: [],
      totalPoints: 0,
      activeUsers: 0
    },
    // Product Statistics
    products: {
      totalProducts: 0,
      activeProducts: 0,
      featuredProducts: 0,
      outOfStockProducts: 0
    },
    // Point Statistics
    points: {
      totalPointsIssued: 0,
      totalPointsRedeemed: 0,
      pendingRedemptions: 0,
      totalUsers: 0
    },
    // Campaign Statistics (with fallback)
    campaigns: {
      totalCampaigns: 0,
      activeCampaigns: 0,
      completedCampaigns: 0,
      totalParticipants: 0
    },
    // Redemption Statistics
    redemptions: {
      totalRedemptions: 0,
      pendingRedemptions: 0,
      approvedRedemptions: 0,
      rejectedRedemptions: 0,
      totalPointsRedeemed: 0
    }
  },
  isLoading: false,
  lastUpdated: null,
  errors: {}
}

const mutations = {
  SET_LOADING(state, loading) {
    state.isLoading = loading
  },

  SET_ORDER_STATISTICS(state, data) {
    state.statistics.orders = { ...state.statistics.orders, ...data }
  },

  SET_AFFILIATE_STATISTICS(state, data) {
    state.statistics.affiliates = { ...state.statistics.affiliates, ...data }
  },

  SET_LEADERBOARD_STATISTICS(state, data) {
    state.statistics.leaderboard = { ...state.statistics.leaderboard, ...data }
  },

  SET_PRODUCT_STATISTICS(state, data) {
    state.statistics.products = { ...state.statistics.products, ...data }
  },

  SET_POINT_STATISTICS(state, data) {
    state.statistics.points = { ...state.statistics.points, ...data }
  },

  SET_CAMPAIGN_STATISTICS(state, data) {
    state.statistics.campaigns = { ...state.statistics.campaigns, ...data }
  },

  SET_REDEMPTION_STATISTICS(state, data) {
    state.statistics.redemptions = { ...state.statistics.redemptions, ...data }
  },

  SET_ERROR(state, { section, error }) {
    state.errors = { ...state.errors, [section]: error }
  },

  CLEAR_ERROR(state, section) {
    const errors = { ...state.errors }
    delete errors[section]
    state.errors = errors
  },

  SET_LAST_UPDATED(state) {
    state.lastUpdated = new Date().toISOString()
  }
}

const actions = {
  async fetchAllStatistics({ dispatch }) {
    const results = await Promise.allSettled([
      dispatch('fetchOrderAnalytics'),
      dispatch('fetchAffiliateStatistics'),
      dispatch('fetchLeaderboardStatistics'),
      dispatch('fetchProductStatistics'),
      dispatch('fetchPointStatistics'),
      dispatch('fetchCampaignStatistics'),
      dispatch('fetchRedemptionStatistics')
    ])

    // Log any failed requests for debugging
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        const sections = ['orders', 'affiliates', 'leaderboard', 'products', 'points', 'campaigns', 'redemptions']
        console.warn(`Failed to fetch ${sections[index]} statistics:`, result.reason)
      }
    })

    return results
  },

  async fetchOrderAnalytics({ commit }) {
    try {
      commit('CLEAR_ERROR', 'orders')
      const response = await apiService.get(API_ENDPOINTS.DASHBOARD.ORDER_ANALYTICS)
      
      if (response.data && response.data.success) {
        commit('SET_ORDER_STATISTICS', response.data.data)
      }
      
      return response.data
    } catch (error) {
      console.error('Failed to fetch order analytics:', error)
      commit('SET_ERROR', { section: 'orders', error: error.message })
      
      // Set default values on error
      commit('SET_ORDER_STATISTICS', {
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        totalRevenue: 0,
        dailyOrders: [],
        monthlyRevenue: []
      })
      
      throw error
    }
  },

  async fetchAffiliateStatistics({ commit }) {
    try {
      commit('CLEAR_ERROR', 'affiliates')
      const response = await apiService.get(API_ENDPOINTS.DASHBOARD.AFFILIATE_STATISTICS)
      
      if (response.data && response.data.success) {
        commit('SET_AFFILIATE_STATISTICS', response.data.data)
      }
      
      return response.data
    } catch (error) {
      console.error('Failed to fetch affiliate statistics:', error)
      commit('SET_ERROR', { section: 'affiliates', error: error.message })
      
      // Set default values on error
      commit('SET_AFFILIATE_STATISTICS', {
        totalAffiliates: 0,
        activeAffiliates: 0,
        totalCommissions: 0,
        topPerformers: []
      })
      
      throw error
    }
  },

  async fetchLeaderboardStatistics({ commit }) {
    try {
      commit('CLEAR_ERROR', 'leaderboard')
      const response = await apiService.get(API_ENDPOINTS.DASHBOARD.LEADERBOARD_STATISTICS)
      
      if (response.data && response.data.success) {
        commit('SET_LEADERBOARD_STATISTICS', response.data.data)
      }
      
      return response.data
    } catch (error) {
      console.error('Failed to fetch leaderboard statistics:', error)
      commit('SET_ERROR', { section: 'leaderboard', error: error.message })
      
      // Set default values on error
      commit('SET_LEADERBOARD_STATISTICS', {
        topUsers: [],
        totalPoints: 0,
        activeUsers: 0
      })
      
      throw error
    }
  },

  async fetchProductStatistics({ commit }) {
    try {
      commit('CLEAR_ERROR', 'products')
      const response = await apiService.get(API_ENDPOINTS.DASHBOARD.PRODUCT_STATISTICS)
      
      if (response.data && response.data.success) {
        commit('SET_PRODUCT_STATISTICS', response.data.data)
      }
      
      return response.data
    } catch (error) {
      console.error('Failed to fetch product statistics:', error)
      commit('SET_ERROR', { section: 'products', error: error.message })
      
      // Set default values on error
      commit('SET_PRODUCT_STATISTICS', {
        totalProducts: 0,
        activeProducts: 0,
        featuredProducts: 0,
        outOfStockProducts: 0
      })
      
      throw error
    }
  },

  async fetchPointStatistics({ commit }) {
    try {
      commit('CLEAR_ERROR', 'points')
      const response = await apiService.get(API_ENDPOINTS.DASHBOARD.POINT_STATISTICS)
      
      if (response.data && response.data.success) {
        commit('SET_POINT_STATISTICS', response.data.data)
      }
      
      return response.data
    } catch (error) {
      console.error('Failed to fetch point statistics:', error)
      commit('SET_ERROR', { section: 'points', error: error.message })
      
      // Set default values on error
      commit('SET_POINT_STATISTICS', {
        totalPointsIssued: 0,
        totalPointsRedeemed: 0,
        pendingRedemptions: 0,
        totalUsers: 0
      })
      
      throw error
    }
  },

  async fetchCampaignStatistics({ commit }) {
    try {
      commit('CLEAR_ERROR', 'campaigns')
      
      // Check if campaigns endpoint exists before making request
      if (!API_ENDPOINTS.CAMPAIGNS || !API_ENDPOINTS.CAMPAIGNS.STATISTICS) {
        console.warn('Campaign statistics endpoint not configured')
        commit('SET_CAMPAIGN_STATISTICS', {
          totalCampaigns: 0,
          activeCampaigns: 0,
          completedCampaigns: 0,
          totalParticipants: 0
        })
        return { success: true, data: {} }
      }

      const response = await apiService.get(API_ENDPOINTS.CAMPAIGNS.STATISTICS)
      
      if (response.data && response.data.success) {
        commit('SET_CAMPAIGN_STATISTICS', response.data.data)
      }
      
      return response.data
    } catch (error) {
      console.warn('Campaign statistics endpoint not available:', error.message)
      commit('SET_ERROR', { section: 'campaigns', error: 'Campaign statistics not available' })
      
      // Set default values on error (don't throw for optional features)
      commit('SET_CAMPAIGN_STATISTICS', {
        totalCampaigns: 0,
        activeCampaigns: 0,
        completedCampaigns: 0,
        totalParticipants: 0
      })
      
      // Don't throw error for campaigns as it might be optional
      return { success: false, message: 'Campaign statistics not available' }
    }
  },

  async fetchRedemptionStatistics({ commit }) {
    try {
      commit('CLEAR_ERROR', 'redemptions')
      
      // Check if redemptions endpoint exists
      if (!API_ENDPOINTS.REDEMPTIONS || !API_ENDPOINTS.REDEMPTIONS.STATISTICS) {
        console.warn('Redemption statistics endpoint not configured')
        commit('SET_REDEMPTION_STATISTICS', {
          totalRedemptions: 0,
          pendingRedemptions: 0,
          approvedRedemptions: 0,
          rejectedRedemptions: 0,
          totalPointsRedeemed: 0
        })
        return { success: true, data: {} }
      }

      const response = await apiService.get(API_ENDPOINTS.REDEMPTIONS.STATISTICS)
      
      if (response.data && response.data.success) {
        commit('SET_REDEMPTION_STATISTICS', response.data.data)
      }
      
      return response.data
    } catch (error) {
      console.warn('Redemption statistics endpoint not available:', error.message)
      commit('SET_ERROR', { section: 'redemptions', error: 'Redemption statistics not available' })
      
      // Set default values on error
      commit('SET_REDEMPTION_STATISTICS', {
        totalRedemptions: 0,
        pendingRedemptions: 0,
        approvedRedemptions: 0,
        rejectedRedemptions: 0,
        totalPointsRedeemed: 0
      })
      
      // Don't throw error for redemptions as it might be optional
      return { success: false, message: 'Redemption statistics not available' }
    }
  },

  // Refresh all statistics
  async refreshStatistics({ commit, dispatch }) {
    commit('SET_LOADING', true)
    try {
      await dispatch('fetchAllStatistics')
      commit('SET_LAST_UPDATED')
    } catch (error) {
      console.error('Failed to refresh statistics:', error)
    } finally {
      commit('SET_LOADING', false)
    }
  }
}

const getters = {
  statistics: (state) => state.statistics,
  isLoading: (state) => state.isLoading,
  lastUpdated: (state) => state.lastUpdated,
  errors: (state) => state.errors,
  hasErrors: (state) => Object.keys(state.errors).length > 0,
  
  // Order getters
  orderStatistics: (state) => state.statistics.orders,
  totalOrders: (state) => state.statistics.orders.totalOrders,
  totalRevenue: (state) => state.statistics.orders.totalRevenue,
  
  // Affiliate getters
  affiliateStatistics: (state) => state.statistics.affiliates,
  totalAffiliates: (state) => state.statistics.affiliates.totalAffiliates,
  totalCommissions: (state) => state.statistics.affiliates.totalCommissions,
  
  // Product getters
  productStatistics: (state) => state.statistics.products,
  totalProducts: (state) => state.statistics.products.totalProducts,
  activeProducts: (state) => state.statistics.products.activeProducts,
  
  // Point getters
  pointStatistics: (state) => state.statistics.points,
  totalPointsIssued: (state) => state.statistics.points.totalPointsIssued,
  totalPointsRedeemed: (state) => state.statistics.points.totalPointsRedeemed,
  
  // Campaign getters
  campaignStatistics: (state) => state.statistics.campaigns,
  totalCampaigns: (state) => state.statistics.campaigns.totalCampaigns,
  activeCampaigns: (state) => state.statistics.campaigns.activeCampaigns,
  
  // Redemption getters
  redemptionStatistics: (state) => state.statistics.redemptions,
  totalRedemptions: (state) => state.statistics.redemptions.totalRedemptions,
  pendingRedemptions: (state) => state.statistics.redemptions.pendingRedemptions
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}