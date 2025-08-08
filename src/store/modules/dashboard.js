import apiService from '@/services/apiService'

const state = {
  orderStatistics: null,
  affiliateStatistics: null,
  leaderboardStatistics: null,
  campaignStatistics: null,
  isLoading: false
}

const mutations = {
  SET_LOADING (state, loading) {
    state.isLoading = loading
  },
  
  SET_ORDER_STATISTICS (state, data) {
    state.orderStatistics = data
  },
  
  SET_AFFILIATE_STATISTICS (state, data) {
    state.affiliateStatistics = data
  },
  
  SET_LEADERBOARD_STATISTICS (state, data) {
    state.leaderboardStatistics = data
  },
  
  SET_CAMPAIGN_STATISTICS (state, data) {
    state.campaignStatistics = data
  }
}

const actions = {
  async fetchOrderStatistics ({ commit }, { startDate, endDate }) {
    try {
      const response = await apiService.get('/api/v1/tiktok/orders/analytics', {
        params: { startDate, endDate }
      })
      
      if (response.data.success) {
        commit('SET_ORDER_STATISTICS', response.data.data)
      }
    } catch (error) {
      console.error('Failed to fetch order statistics:', error)
    }
  },
  
  async fetchAffiliateStatistics ({ commit }, period = '30d') {
    try {
      const response = await apiService.get('/api/v1/tiktok/admin/statistics', {
        params: { period }
      })
      
      if (response.data.success) {
        commit('SET_AFFILIATE_STATISTICS', response.data.data)
      }
    } catch (error) {
      console.error('Failed to fetch affiliate statistics:', error)
    }
  },
  
  async fetchLeaderboardStatistics ({ commit }) {
    try {
      const response = await apiService.get('/api/v1/leaderboard/statistics')
      
      if (response.data.success) {
        commit('SET_LEADERBOARD_STATISTICS', response.data.data)
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard statistics:', error)
    }
  },
  
  async fetchCampaignStatistics ({ commit }) {
    try {
      const response = await apiService.get('/api/v1/leaderboard/statistics')
      
      if (response.data.success) {
        commit('SET_CAMPAIGN_STATISTICS', response.data.data)
      }
    } catch (error) {
      console.error('Failed to fetch campaign statistics:', error)
    }
  },
  
  async fetchAllStatistics ({ dispatch }) {
    const today = new Date()
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
    const endDate = today.toISOString().split('T')[0]
    
    await Promise.all([
      dispatch('fetchOrderStatistics', { startDate, endDate }),
      dispatch('fetchAffiliateStatistics'),
      dispatch('fetchLeaderboardStatistics'),
      dispatch('fetchCampaignStatistics')
    ])
  }
}

const getters = {
  orderStatistics: (state) => state.orderStatistics,
  affiliateStatistics: (state) => state.affiliateStatistics,
  leaderboardStatistics: (state) => state.leaderboardStatistics,
  campaignStatistics: (state) => state.campaignStatistics,
  isLoading: (state) => state.isLoading
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}