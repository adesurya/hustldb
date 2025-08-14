// /src/store/modules/redemptions.js - Redemption Vuex store module
import redemptionService from '@/services/redemptionService'

const state = {
  redemptions: [],
  currentRedemption: null,
  statistics: {
    totalRedemptions: 0,
    pendingRedemptions: 0,
    approvedRedemptions: 0,
    rejectedRedemptions: 0,
    totalPointsRedeemed: 0,
    totalValue: 0,
    recentRedemptions: [],
    redemptionsByType: []
  },
  pagination: {
    currentPage: 1,
    itemsPerPage: 20,
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  },
  filters: {
    search: '',
    status: '',
    type: '',
    userId: ''
  },
  isLoading: false,
  isSubmitting: false
}

const mutations = {
  SET_LOADING(state, loading) {
    state.isLoading = loading
  },

  SET_SUBMITTING(state, submitting) {
    state.isSubmitting = submitting
  },

  SET_REDEMPTIONS(state, redemptions) {
    state.redemptions = redemptions
  },

  SET_CURRENT_REDEMPTION(state, redemption) {
    state.currentRedemption = redemption
  },

  SET_STATISTICS(state, statistics) {
    state.statistics = { ...state.statistics, ...statistics }
  },

  SET_PAGINATION(state, pagination) {
    state.pagination = { ...state.pagination, ...pagination }
  },

  SET_FILTERS(state, filters) {
    state.filters = { ...state.filters, ...filters }
  },

  UPDATE_REDEMPTION(state, updatedRedemption) {
    const index = state.redemptions.findIndex(r => r.id === updatedRedemption.id)
    if (index !== -1) {
      // Store old values for statistics update
      const oldRedemption = state.redemptions[index]
      
      // Update redemption
      state.redemptions.splice(index, 1, updatedRedemption)
      
      // Update statistics
      if (oldRedemption.status !== updatedRedemption.status) {
        if (oldRedemption.status === 'pending') state.statistics.pendingRedemptions -= 1
        if (oldRedemption.status === 'approved') state.statistics.approvedRedemptions -= 1
        if (oldRedemption.status === 'rejected') state.statistics.rejectedRedemptions -= 1
        
        if (updatedRedemption.status === 'pending') state.statistics.pendingRedemptions += 1
        if (updatedRedemption.status === 'approved') state.statistics.approvedRedemptions += 1
        if (updatedRedemption.status === 'rejected') state.statistics.rejectedRedemptions += 1
      }
    }
    
    // Update current redemption if it's the same
    if (state.currentRedemption && state.currentRedemption.id === updatedRedemption.id) {
      state.currentRedemption = updatedRedemption
    }
  },

  BULK_UPDATE_REDEMPTIONS(state, { redemptionIds, status }) {
    redemptionIds.forEach(redemptionId => {
      const redemption = state.redemptions.find(r => r.id === redemptionId)
      if (redemption) {
        const oldStatus = redemption.status
        redemption.status = status
        redemption.processedAt = new Date().toISOString()
        
        // Update statistics
        if (oldStatus !== status) {
          if (oldStatus === 'pending') state.statistics.pendingRedemptions -= 1
          if (oldStatus === 'approved') state.statistics.approvedRedemptions -= 1
          if (oldStatus === 'rejected') state.statistics.rejectedRedemptions -= 1
          
          if (status === 'pending') state.statistics.pendingRedemptions += 1
          if (status === 'approved') state.statistics.approvedRedemptions += 1
          if (status === 'rejected') state.statistics.rejectedRedemptions += 1
        }
      }
    })
  },

  RESET_FILTERS(state) {
    state.filters = {
      search: '',
      status: '',
      type: '',
      userId: ''
    }
  }
}

const actions = {
  async fetchRedemptions({ commit, state }) {
    commit('SET_LOADING', true)
    try {
      const params = {
        page: state.pagination.currentPage,
        limit: state.pagination.itemsPerPage,
        ...state.filters
      }

      // Remove empty filter values
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key]
      })

      const response = await redemptionService.getRedemptions(params)
      
      if (response.success) {
        commit('SET_REDEMPTIONS', response.data.redemptions || [])
        if (response.data.pagination) {
          commit('SET_PAGINATION', response.data.pagination)
        }
      }
      
      return response
    } catch (error) {
      console.error('Failed to fetch redemptions:', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async fetchRedemption({ commit }, redemptionId) {
    commit('SET_LOADING', true)
    try {
      const response = await redemptionService.getRedemption(redemptionId)
      if (response.success) {
        commit('SET_CURRENT_REDEMPTION', response.data)
        return response.data
      }
      throw new Error(response.message || 'Failed to fetch redemption')
    } catch (error) {
      console.error('Failed to fetch redemption:', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async fetchStatistics({ commit }) {
    try {
      const response = await redemptionService.getRedemptionStatistics()
      if (response.success) {
        commit('SET_STATISTICS', response.data)
      }
      return response
    } catch (error) {
      console.error('Failed to fetch statistics:', error)
      throw error
    }
  },

  async approveRedemption({ commit, dispatch }, { id, notes }) {
    commit('SET_SUBMITTING', true)
    try {
      const response = await redemptionService.approveRedemption(id, notes)
      if (response.success) {
        commit('UPDATE_REDEMPTION', response.data.redemption)
        await dispatch('fetchStatistics')
        return response
      }
      throw new Error(response.message || 'Failed to approve redemption')
    } catch (error) {
      console.error('Failed to approve redemption:', error)
      throw error
    } finally {
      commit('SET_SUBMITTING', false)
    }
  },

  async rejectRedemption({ commit, dispatch }, { id, notes }) {
    commit('SET_SUBMITTING', true)
    try {
      const response = await redemptionService.rejectRedemption(id, notes)
      if (response.success) {
        commit('UPDATE_REDEMPTION', response.data.redemption)
        await dispatch('fetchStatistics')
        return response
      }
      throw new Error(response.message || 'Failed to reject redemption')
    } catch (error) {
      console.error('Failed to reject redemption:', error)
      throw error
    } finally {
      commit('SET_SUBMITTING', false)
    }
  },

  async bulkApproveRedemptions({ commit, dispatch }, { redemptionIds, notes }) {
    commit('SET_SUBMITTING', true)
    try {
      const response = await redemptionService.bulkApproveRedemptions(redemptionIds, notes)
      if (response.success) {
        commit('BULK_UPDATE_REDEMPTIONS', { redemptionIds, status: 'approved' })
        await dispatch('fetchStatistics')
        return response
      }
      throw new Error(response.message || 'Failed to bulk approve redemptions')
    } catch (error) {
      console.error('Failed to bulk approve redemptions:', error)
      throw error
    } finally {
      commit('SET_SUBMITTING', false)
    }
  },

  async bulkRejectRedemptions({ commit, dispatch }, { redemptionIds, notes }) {
    commit('SET_SUBMITTING', true)
    try {
      const response = await redemptionService.bulkRejectRedemptions(redemptionIds, notes)
      if (response.success) {
        commit('BULK_UPDATE_REDEMPTIONS', { redemptionIds, status: 'rejected' })
        await dispatch('fetchStatistics')
        return response
      }
      throw new Error(response.message || 'Failed to bulk reject redemptions')
    } catch (error) {
      console.error('Failed to bulk reject redemptions:', error)
      throw error
    } finally {
      commit('SET_SUBMITTING', false)
    }
  },

  setFilters({ commit, dispatch }, filters) {
    commit('SET_FILTERS', filters)
    commit('SET_PAGINATION', { currentPage: 1 })
    dispatch('fetchRedemptions')
  },

  setPagination({ commit, dispatch }, pagination) {
    commit('SET_PAGINATION', pagination)
    dispatch('fetchRedemptions')
  },

  resetFilters({ commit, dispatch }) {
    commit('RESET_FILTERS')
    commit('SET_PAGINATION', { currentPage: 1 })
    dispatch('fetchRedemptions')
  }
}

const getters = {
  redemptions: (state) => state.redemptions,
  currentRedemption: (state) => state.currentRedemption,
  statistics: (state) => state.statistics,
  pagination: (state) => state.pagination,
  filters: (state) => state.filters,
  isLoading: (state) => state.isLoading,
  isSubmitting: (state) => state.isSubmitting,
  
  filteredRedemptions: (state) => {
    return state.redemptions.filter(redemption => {
      const matchesSearch = !state.filters.search || 
        redemption.user.username.toLowerCase().includes(state.filters.search.toLowerCase()) ||
        redemption.user.email.toLowerCase().includes(state.filters.search.toLowerCase()) ||
        redemption.redemptionDetails.accountName.toLowerCase().includes(state.filters.search.toLowerCase())
      
      const matchesStatus = !state.filters.status || 
        redemption.status === state.filters.status
      
      const matchesType = !state.filters.type || 
        redemption.redemptionType === state.filters.type
      
      const matchesUser = !state.filters.userId || 
        redemption.userId.toString() === state.filters.userId
      
      return matchesSearch && matchesStatus && matchesType && matchesUser
    })
  },

  pendingRedemptions: (state) => state.redemptions.filter(r => r.status === 'pending'),
  approvedRedemptions: (state) => state.redemptions.filter(r => r.status === 'approved'),
  rejectedRedemptions: (state) => state.redemptions.filter(r => r.status === 'rejected'),
  
  redemptionsByType: (state) => {
    const typeMap = {}
    state.redemptions.forEach(redemption => {
      const type = redemption.redemptionType
      if (!typeMap[type]) {
        typeMap[type] = []
      }
      typeMap[type].push(redemption)
    })
    return typeMap
  },

  totalRedemptions: (state) => state.statistics.totalRedemptions,
  pendingRedemptionsCount: (state) => state.statistics.pendingRedemptions,
  approvedRedemptionsCount: (state) => state.statistics.approvedRedemptions,
  rejectedRedemptionsCount: (state) => state.statistics.rejectedRedemptions,
  totalPointsRedeemed: (state) => state.statistics.totalPointsRedeemed,
  totalRedemptionValue: (state) => state.statistics.totalValue,
  recentRedemptions: (state) => state.statistics.recentRedemptions
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}