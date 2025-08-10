// /src/store/modules/campaigns.js - Simplified campaign store module
import campaignService from '@/services/campaignService'

const state = {
  campaigns: [],
  currentCampaign: null,
  campaignProducts: [],
  pagination: {
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  },
  filters: {
    search: '',
    status: '',
    dateRange: ''
  },
  isLoading: false,
  isSubmitting: false,
  lastError: null
}

const mutations = {
  SET_LOADING(state, loading) {
    state.isLoading = loading
  },

  SET_SUBMITTING(state, submitting) {
    state.isSubmitting = submitting
  },

  SET_CAMPAIGNS(state, campaigns) {
    console.log('🔄 Store - Setting campaigns:', campaigns)
    state.campaigns = Array.isArray(campaigns) ? campaigns : []
  },

  SET_CURRENT_CAMPAIGN(state, campaign) {
    state.currentCampaign = campaign
  },

  SET_CAMPAIGN_PRODUCTS(state, products) {
    state.campaignProducts = Array.isArray(products) ? products : []
  },

  SET_PAGINATION(state, pagination) {
    state.pagination = { ...state.pagination, ...pagination }
  },

  SET_FILTERS(state, filters) {
    state.filters = { ...state.filters, ...filters }
  },

  SET_ERROR(state, error) {
    state.lastError = error
  },

  CLEAR_ERROR(state) {
    state.lastError = null
  },

  ADD_CAMPAIGN(state, campaign) {
    if (campaign) {
      state.campaigns.unshift(campaign)
    }
  },

  UPDATE_CAMPAIGN(state, updatedCampaign) {
    const index = state.campaigns.findIndex(c => c.id === updatedCampaign.id)
    if (index !== -1) {
      state.campaigns.splice(index, 1, updatedCampaign)
    }
  },

  REMOVE_CAMPAIGN(state, campaignId) {
    state.campaigns = state.campaigns.filter(c => c.id !== campaignId)
  },

  REMOVE_CAMPAIGNS(state, campaignIds) {
    state.campaigns = state.campaigns.filter(c => !campaignIds.includes(c.id))
  },

  UPDATE_CAMPAIGN_STATUS(state, { campaignId, isActive }) {
    const campaign = state.campaigns.find(c => c.id === campaignId)
    if (campaign) {
      campaign.isActive = isActive
      campaign.status = isActive ? 'active' : 'inactive'
    }
  },

  RESET_FILTERS(state) {
    state.filters = {
      search: '',
      status: '',
      dateRange: ''
    }
  }
}

const actions = {
  async fetchCampaigns({ commit, state }) {
    console.log('🚀 Store - Fetching campaigns...')
    
    commit('SET_LOADING', true)
    commit('CLEAR_ERROR')
    
    try {
      const params = {
        page: state.pagination.currentPage,
        limit: state.pagination.itemsPerPage
      }

      console.log('📡 Store - API call params:', params)
      
      const response = await campaignService.getCampaigns(params)
      
      console.log('📦 Store - API response:', response)
      
      if (response.success) {
        // The API returns campaigns in response.data array
        const campaigns = response.data || []
        console.log('✅ Store - Campaigns data:', campaigns)
        
        commit('SET_CAMPAIGNS', campaigns)
        
        // Handle pagination if provided in response
        if (response.meta && response.meta.pagination) {
          commit('SET_PAGINATION', response.meta.pagination)
        } else {
          // Set basic pagination info
          commit('SET_PAGINATION', {
            totalItems: campaigns.length,
            totalPages: Math.ceil(campaigns.length / state.pagination.itemsPerPage),
            hasNextPage: false,
            hasPrevPage: false
          })
        }
        
        console.log('✅ Store - Campaigns successfully loaded:', campaigns.length, 'items')
      } else {
        throw new Error(response.message || 'Failed to fetch campaigns')
      }
    } catch (error) {
      console.error('❌ Store - Failed to fetch campaigns:', error)
      commit('SET_ERROR', error)
      commit('SET_CAMPAIGNS', []) // Set empty array on error
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async fetchCampaign({ commit }, campaignId) {
    console.log('🚀 Store - Fetching campaign:', campaignId)
    
    commit('SET_LOADING', true)
    commit('CLEAR_ERROR')
    
    try {
      const response = await campaignService.getCampaign(campaignId)
      
      if (response.success) {
        commit('SET_CURRENT_CAMPAIGN', response.data)
        return response.data
      } else {
        throw new Error(response.message || 'Failed to fetch campaign')
      }
    } catch (error) {
      console.error('❌ Store - Failed to fetch campaign:', error)
      commit('SET_ERROR', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async createCampaign({ commit, dispatch }, campaignData) {
    console.log('🚀 Store - Creating campaign:', campaignData)
    
    commit('SET_SUBMITTING', true)
    commit('CLEAR_ERROR')
    
    try {
      const response = await campaignService.createCampaign(campaignData)
      
      if (response.success) {
        commit('ADD_CAMPAIGN', response.data)
        // Refresh the campaign list to get updated data
        await dispatch('fetchCampaigns')
        return response
      } else {
        throw new Error(response.message || 'Failed to create campaign')
      }
    } catch (error) {
      console.error('❌ Store - Failed to create campaign:', error)
      commit('SET_ERROR', error)
      throw error
    } finally {
      commit('SET_SUBMITTING', false)
    }
  },

  async updateCampaign({ commit, dispatch }, { id, campaignData }) {
    console.log('🚀 Store - Updating campaign:', id, campaignData)
    
    commit('SET_SUBMITTING', true)
    commit('CLEAR_ERROR')
    
    try {
      const response = await campaignService.updateCampaign(id, campaignData)
      
      if (response.success) {
        commit('UPDATE_CAMPAIGN', response.data)
        // Refresh the campaign list to get updated data
        await dispatch('fetchCampaigns')
        return response
      } else {
        throw new Error(response.message || 'Failed to update campaign')
      }
    } catch (error) {
      console.error('❌ Store - Failed to update campaign:', error)
      commit('SET_ERROR', error)
      throw error
    } finally {
      commit('SET_SUBMITTING', false)
    }
  },

  async deleteCampaign({ commit }, campaignId) {
    console.log('🚀 Store - Deleting campaign:', campaignId)
    
    commit('CLEAR_ERROR')
    
    try {
      const response = await campaignService.deleteCampaign(campaignId)
      
      if (response.success) {
        commit('REMOVE_CAMPAIGN', campaignId)
        return response
      } else {
        throw new Error(response.message || 'Failed to delete campaign')
      }
    } catch (error) {
      console.error('❌ Store - Failed to delete campaign:', error)
      commit('SET_ERROR', error)
      throw error
    }
  },

  async bulkDeleteCampaigns({ commit }, campaignIds) {
    console.log('🚀 Store - Bulk deleting campaigns:', campaignIds)
    
    commit('SET_SUBMITTING', true)
    commit('CLEAR_ERROR')
    
    try {
      const response = await campaignService.bulkDeleteCampaigns(campaignIds)
      
      if (response.success) {
        commit('REMOVE_CAMPAIGNS', campaignIds)
        return response
      } else {
        throw new Error(response.message || 'Failed to bulk delete campaigns')
      }
    } catch (error) {
      console.error('❌ Store - Failed to bulk delete campaigns:', error)
      commit('SET_ERROR', error)
      throw error
    } finally {
      commit('SET_SUBMITTING', false)
    }
  },

  async toggleCampaignStatus({ commit }, campaignId) {
    console.log('🚀 Store - Toggling campaign status:', campaignId)
    
    commit('CLEAR_ERROR')
    
    try {
      const response = await campaignService.toggleCampaignStatus(campaignId)
      
      if (response.success) {
        const updatedCampaign = response.data
        commit('UPDATE_CAMPAIGN_STATUS', { 
          campaignId, 
          isActive: updatedCampaign.isActive 
        })
        return response
      } else {
        throw new Error(response.message || 'Failed to toggle campaign status')
      }
    } catch (error) {
      console.error('❌ Store - Failed to toggle campaign status:', error)
      commit('SET_ERROR', error)
      throw error
    }
  },

  async bulkUpdateStatus({ commit }, { campaignIds, isActive }) {
    console.log('🚀 Store - Bulk updating status:', { campaignIds, isActive })
    
    commit('SET_SUBMITTING', true)
    commit('CLEAR_ERROR')
    
    try {
      const response = await campaignService.bulkUpdateStatus(campaignIds, isActive)
      
      if (response.success) {
        campaignIds.forEach(campaignId => {
          commit('UPDATE_CAMPAIGN_STATUS', { campaignId, isActive })
        })
        return response
      } else {
        throw new Error(response.message || 'Failed to bulk update status')
      }
    } catch (error) {
      console.error('❌ Store - Failed to bulk update status:', error)
      commit('SET_ERROR', error)
      throw error
    } finally {
      commit('SET_SUBMITTING', false)
    }
  },

  async fetchCampaignProducts({ commit }, campaignId) {
    console.log('🚀 Store - Fetching campaign products:', campaignId)
    
    commit('SET_LOADING', true)
    commit('CLEAR_ERROR')
    
    try {
      const response = await campaignService.getCampaignProducts(campaignId)
      
      if (response.success) {
        commit('SET_CAMPAIGN_PRODUCTS', response.data)
        return response.data
      } else {
        throw new Error(response.message || 'Failed to fetch campaign products')
      }
    } catch (error) {
      console.error('❌ Store - Failed to fetch campaign products:', error)
      commit('SET_ERROR', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async addProductsToCampaign({ dispatch }, { campaignId, productIds }) {
    console.log('🚀 Store - Adding products to campaign:', { campaignId, productIds })
    
    try {
      const response = await campaignService.addProductsToCampaign(campaignId, productIds)
      
      if (response.success) {
        // Refresh campaign products
        await dispatch('fetchCampaignProducts', campaignId)
        return response
      } else {
        throw new Error(response.message || 'Failed to add products to campaign')
      }
    } catch (error) {
      console.error('❌ Store - Failed to add products to campaign:', error)
      throw error
    }
  },

  async removeProductsFromCampaign({ dispatch }, { campaignId, productIds }) {
    console.log('🚀 Store - Removing products from campaign:', { campaignId, productIds })
    
    try {
      const response = await campaignService.removeProductsFromCampaign(campaignId, productIds)
      
      if (response.success) {
        // Refresh campaign products
        await dispatch('fetchCampaignProducts', campaignId)
        return response
      } else {
        throw new Error(response.message || 'Failed to remove products from campaign')
      }
    } catch (error) {
      console.error('❌ Store - Failed to remove products from campaign:', error)
      throw error
    }
  },

  setFilters({ commit, dispatch }, filters) {
    commit('SET_FILTERS', filters)
    commit('SET_PAGINATION', { currentPage: 1 })
    dispatch('fetchCampaigns')
  },

  setPagination({ commit, dispatch }, pagination) {
    commit('SET_PAGINATION', pagination)
    dispatch('fetchCampaigns')
  },

  resetFilters({ commit, dispatch }) {
    commit('RESET_FILTERS')
    commit('SET_PAGINATION', { currentPage: 1 })
    dispatch('fetchCampaigns')
  },

  clearError({ commit }) {
    commit('CLEAR_ERROR')
  }
}

const getters = {
  campaigns: (state) => state.campaigns,
  currentCampaign: (state) => state.currentCampaign,
  campaignProducts: (state) => state.campaignProducts,
  pagination: (state) => state.pagination,
  filters: (state) => state.filters,
  isLoading: (state) => state.isLoading,
  isSubmitting: (state) => state.isSubmitting,
  lastError: (state) => state.lastError,
  
  filteredCampaigns: (state) => {
    return state.campaigns.filter(campaign => {
      const matchesSearch = !state.filters.search || 
        campaign.name.toLowerCase().includes(state.filters.search.toLowerCase()) ||
        campaign.description.toLowerCase().includes(state.filters.search.toLowerCase())
      
      const matchesStatus = !state.filters.status || 
        (state.filters.status === 'active' && campaign.isActive) ||
        (state.filters.status === 'inactive' && !campaign.isActive) ||
        (state.filters.status === 'upcoming' && campaign.status === 'upcoming') ||
        (state.filters.status === 'expired' && campaign.status === 'expired')
      
      return matchesSearch && matchesStatus
    })
  },

  activeCampaigns: (state) => state.campaigns.filter(c => c.isActive),
  inactiveCampaigns: (state) => state.campaigns.filter(c => !c.isActive),
  upcomingCampaigns: (state) => state.campaigns.filter(c => c.status === 'upcoming'),
  expiredCampaigns: (state) => state.campaigns.filter(c => c.status === 'expired'),
  
  campaignStats: (state) => {
    return {
      total: state.campaigns.length,
      active: state.campaigns.filter(c => c.isActive).length,
      inactive: state.campaigns.filter(c => !c.isActive).length,
      upcoming: state.campaigns.filter(c => c.status === 'upcoming').length,
      expired: state.campaigns.filter(c => c.status === 'expired').length
    }
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}