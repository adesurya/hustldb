// /src/store/modules/campaigns.js - Fixed campaign store module
import campaignService from '@/services/campaignService'

const state = {
  campaigns: [],
  activeCampaigns: [],
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

  SET_ACTIVE_CAMPAIGNS(state, campaigns) {
    console.log('🔄 Store - Setting active campaigns:', campaigns)
    state.activeCampaigns = Array.isArray(campaigns) ? campaigns : []
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
    
    // Also update in active campaigns if exists
    const activeIndex = state.activeCampaigns.findIndex(c => c.id === updatedCampaign.id)
    if (activeIndex !== -1) {
      if (updatedCampaign.isActive) {
        state.activeCampaigns.splice(activeIndex, 1, updatedCampaign)
      } else {
        state.activeCampaigns.splice(activeIndex, 1)
      }
    } else if (updatedCampaign.isActive) {
      state.activeCampaigns.push(updatedCampaign)
    }
  },

  REMOVE_CAMPAIGN(state, campaignId) {
    state.campaigns = state.campaigns.filter(c => c.id !== campaignId)
    state.activeCampaigns = state.activeCampaigns.filter(c => c.id !== campaignId)
  },

  REMOVE_CAMPAIGNS(state, campaignIds) {
    state.campaigns = state.campaigns.filter(c => !campaignIds.includes(c.id))
    state.activeCampaigns = state.activeCampaigns.filter(c => !campaignIds.includes(c.id))
  },

  UPDATE_CAMPAIGN_STATUS(state, { campaignId, isActive }) {
    // Update in campaigns array
    const campaign = state.campaigns.find(c => c.id === campaignId)
    if (campaign) {
      campaign.isActive = isActive
      campaign.status = isActive ? 'active' : 'inactive'
    }

    // Update in active campaigns array
    const activeCampaign = state.activeCampaigns.find(c => c.id === campaignId)
    if (activeCampaign) {
      if (isActive) {
        activeCampaign.isActive = isActive
        activeCampaign.status = 'active'
      } else {
        // Remove from active campaigns
        state.activeCampaigns = state.activeCampaigns.filter(c => c.id !== campaignId)
      }
    } else if (isActive && campaign) {
      // Add to active campaigns
      state.activeCampaigns.push({ ...campaign, isActive: true, status: 'active' })
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

  async fetchActiveCampaigns({ commit }) {
    console.log('🚀 Store - Fetching active campaigns...')
    
    commit('SET_LOADING', true)
    commit('CLEAR_ERROR')
    
    try {
      const response = await campaignService.getActiveCampaigns()
      
      console.log('📦 Store - Active campaigns response:', response)
      
      if (response.success) {
        const activeCampaigns = response.data || []
        console.log('✅ Store - Active campaigns data:', activeCampaigns)
        
        commit('SET_ACTIVE_CAMPAIGNS', activeCampaigns)
        
        console.log('✅ Store - Active campaigns successfully loaded:', activeCampaigns.length, 'items')
      } else {
        throw new Error(response.message || 'Failed to fetch active campaigns')
      }
    } catch (error) {
      console.error('❌ Store - Failed to fetch active campaigns:', error)
      commit('SET_ERROR', error)
      commit('SET_ACTIVE_CAMPAIGNS', [])
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

  async fetchCampaignDetail({ commit }, campaignId) {
    console.log('🚀 Store - Fetching campaign detail:', campaignId)
    
    commit('SET_LOADING', true)
    commit('CLEAR_ERROR')
    
    try {
      const response = await campaignService.getCampaignDetail(campaignId)
      
      if (response.success) {
        commit('SET_CURRENT_CAMPAIGN', response.data)
        
        // Set campaign products if available
        if (response.data.products) {
          commit('SET_CAMPAIGN_PRODUCTS', response.data.products)
        }
        
        return response.data
      } else {
        throw new Error(response.message || 'Failed to fetch campaign detail')
      }
    } catch (error) {
      console.error('❌ Store - Failed to fetch campaign detail:', error)
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
        // Handle product addition results if available
        if (response.data.productAdditionResults) {
          const results = response.data.productAdditionResults
          console.log('📊 Product addition results:', results)
          
          // You can show additional info about failed products
          if (results.failed && results.failed.length > 0) {
            console.warn('⚠️ Some products could not be added:', results.failed)
          }
        }
        
        commit('ADD_CAMPAIGN', response.data)
        
        // Refresh the campaign list to get updated data
        await dispatch('fetchCampaigns')
        
        // If campaign is active, also refresh active campaigns
        if (response.data.isActive) {
          await dispatch('fetchActiveCampaigns')
        }
        
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
        
        // Refresh active campaigns as status might have changed
        await dispatch('fetchActiveCampaigns')
        
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

  async deleteCampaign({ commit, dispatch }, campaignId) {
    console.log('🚀 Store - Deleting campaign:', campaignId)
    
    commit('CLEAR_ERROR')
    
    try {
      const response = await campaignService.deleteCampaign(campaignId)
      
      if (response.success) {
        commit('REMOVE_CAMPAIGN', campaignId)
        
        // Show info about released products if available
        if (response.data.releasedProducts) {
          console.log(`📦 Released ${response.data.releasedProducts} products for reuse`)
        }
        
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

  async bulkDeleteCampaigns({ commit, dispatch }, campaignIds) {
    console.log('🚀 Store - Bulk deleting campaigns:', campaignIds)
    
    commit('SET_SUBMITTING', true)
    commit('CLEAR_ERROR')
    
    try {
      const response = await campaignService.bulkDeleteCampaigns(campaignIds)
      
      if (response.success) {
        commit('REMOVE_CAMPAIGNS', campaignIds)
        
        // Refresh campaigns to ensure consistency
        await dispatch('fetchCampaigns')
        await dispatch('fetchActiveCampaigns')
        
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

  async toggleCampaignStatus({ commit, dispatch }, campaignId) {
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
        
        // Refresh active campaigns as status changed
        await dispatch('fetchActiveCampaigns')
        
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

  async bulkUpdateStatus({ commit, dispatch }, { campaignIds, isActive }) {
    console.log('🚀 Store - Bulk updating status:', { campaignIds, isActive })
    
    commit('SET_SUBMITTING', true)
    commit('CLEAR_ERROR')
    
    try {
      const response = await campaignService.bulkUpdateStatus(campaignIds, isActive)
      
      if (response.success) {
        campaignIds.forEach(campaignId => {
          commit('UPDATE_CAMPAIGN_STATUS', { campaignId, isActive })
        })
        
        // Refresh campaigns to ensure consistency
        await dispatch('fetchCampaigns')
        await dispatch('fetchActiveCampaigns')
        
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
        
        // Refresh campaigns to update product counts
        await dispatch('fetchCampaigns')
        
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
        
        // Refresh campaigns to update product counts
        await dispatch('fetchCampaigns')
        
        return response
      } else {
        throw new Error(response.message || 'Failed to remove products from campaign')
      }
    } catch (error) {
      console.error('❌ Store - Failed to remove products from campaign:', error)
      throw error
    }
  },

  async validateProductForCampaign({ commit }, { campaignId, productId }) {
    console.log('🚀 Store - Validating product for campaign:', { campaignId, productId })
    
    try {
      const response = await campaignService.validateProductForCampaign(campaignId, productId)
      
      if (response.success) {
        return response.data
      } else {
        throw new Error(response.message || 'Failed to validate product')
      }
    } catch (error) {
      console.error('❌ Store - Failed to validate product:', error)
      commit('SET_ERROR', error)
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
  activeCampaigns: (state) => state.activeCampaigns,
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
  },

  // Get campaign by ID
  getCampaignById: (state) => (id) => {
    return state.campaigns.find(campaign => campaign.id === id) || null
  },

  // Get active campaigns count
  activeCampaignsCount: (state) => state.activeCampaigns.length,

  // Get campaigns with products
  campaignsWithProducts: (state) => {
    return state.campaigns.filter(campaign => campaign.productCount > 0)
  },

  // Get campaigns without products
  campaignsWithoutProducts: (state) => {
    return state.campaigns.filter(campaign => campaign.productCount === 0)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}