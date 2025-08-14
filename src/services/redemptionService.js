// /src/services/redemptionService.js - Redemption API service
import apiService from '@/services/apiService'
import { API_ENDPOINTS } from '@/config/api'

class RedemptionService {
  constructor() {
    this.baseURL = process.env.VUE_APP_API_URL || 'https://apihustl.sijago.ai'
  }

  // Helper method to build URL with parameters
  buildUrl(endpoint, params = {}) {
    let url = endpoint
    Object.keys(params).forEach(key => {
      url = url.replace(`:${key}`, params[key])
    })
    return url
  }

  // Get all redemptions with pagination and filters
  async getRedemptions(params = {}) {
    try {
      console.log('🚀 Getting redemptions...')
      
      const queryParams = new URLSearchParams()
      if (params.page) queryParams.append('page', params.page)
      if (params.limit) queryParams.append('limit', params.limit)
      if (params.status) queryParams.append('status', params.status)
      if (params.search) queryParams.append('search', params.search)
      if (params.userId) queryParams.append('userId', params.userId)
      if (params.type) queryParams.append('type', params.type)
      
      const url = `${API_ENDPOINTS.REDEMPTIONS.LIST}?${queryParams.toString()}`
      console.log('📡 Request URL:', url)
      
      const response = await apiService.get(url)
      console.log('📦 Response data:', response.data)
      
      return apiService.constructor.handleApiResponse(response)
    } catch (error) {
      console.error('❌ getRedemptions error:', error)
      throw apiService.constructor.handleApiError(error)
    }
  }

  // Get single redemption by ID
  async getRedemption(id) {
    try {
      console.log(`🚀 Getting redemption ${id}...`)
      
      const url = this.buildUrl(API_ENDPOINTS.REDEMPTIONS.DETAIL, { id })
      console.log('📡 Request URL:', url)
      
      const response = await apiService.get(url)
      console.log('📦 Response data:', response.data)
      
      return apiService.constructor.handleApiResponse(response)
    } catch (error) {
      console.error('❌ getRedemption error:', error)
      throw apiService.constructor.handleApiError(error)
    }
  }

  // Approve redemption
  async approveRedemption(id, notes = '') {
    try {
      console.log(`🚀 Approving redemption ${id}...`, notes)
      
      const url = this.buildUrl(API_ENDPOINTS.REDEMPTIONS.PROCESS, { id })
      console.log('📡 Request URL:', url)
      
      const response = await apiService.put(url, {
        action: 'approve',
        notes: notes
      })
      
      console.log('📦 Response data:', response.data)
      
      return apiService.constructor.handleApiResponse(response)
    } catch (error) {
      console.error('❌ approveRedemption error:', error)
      throw apiService.constructor.handleApiError(error)
    }
  }

  // Reject redemption
  async rejectRedemption(id, notes = '') {
    try {
      console.log(`🚀 Rejecting redemption ${id}...`, notes)
      
      const url = this.buildUrl(API_ENDPOINTS.REDEMPTIONS.PROCESS, { id })
      console.log('📡 Request URL:', url)
      
      const response = await apiService.put(url, {
        action: 'reject',
        notes: notes
      })
      
      console.log('📦 Response data:', response.data)
      
      return apiService.constructor.handleApiResponse(response)
    } catch (error) {
      console.error('❌ rejectRedemption error:', error)
      throw apiService.constructor.handleApiError(error)
    }
  }

  // Get redemption statistics
  async getRedemptionStatistics() {
    try {
      console.log('🚀 Getting redemption statistics...')
      
      const url = API_ENDPOINTS.REDEMPTIONS.STATISTICS
      console.log('📡 Request URL:', url)
      
      const response = await apiService.get(url)
      console.log('📦 Response data:', response.data)
      
      return apiService.constructor.handleApiResponse(response)
    } catch (error) {
      console.error('❌ getRedemptionStatistics error:', error)
      throw apiService.constructor.handleApiError(error)
    }
  }

  // Bulk approve redemptions
  async bulkApproveRedemptions(redemptionIds, notes = '') {
    try {
      console.log('🚀 Bulk approving redemptions...', redemptionIds)
      
      const response = await apiService.post(API_ENDPOINTS.REDEMPTIONS.BULK_APPROVE, {
        redemptionIds,
        notes
      })
      
      console.log('📦 Response data:', response.data)
      
      return apiService.constructor.handleApiResponse(response)
    } catch (error) {
      console.error('❌ bulkApproveRedemptions error:', error)
      throw apiService.constructor.handleApiError(error)
    }
  }

  // Bulk reject redemptions
  async bulkRejectRedemptions(redemptionIds, notes = '') {
    try {
      console.log('🚀 Bulk rejecting redemptions...', redemptionIds)
      
      const response = await apiService.post(API_ENDPOINTS.REDEMPTIONS.BULK_REJECT, {
        redemptionIds,
        notes
      })
      
      console.log('📦 Response data:', response.data)
      
      return apiService.constructor.handleApiResponse(response)
    } catch (error) {
      console.error('❌ bulkRejectRedemptions error:', error)
      throw apiService.constructor.handleApiError(error)
    }
  }

  // Search redemptions by query
  async searchRedemptions(query, params = {}) {
    try {
      console.log(`🚀 Searching redemptions: "${query}"...`)
      
      return await this.getRedemptions({
        search: query,
        ...params
      })
    } catch (error) {
      console.error('❌ searchRedemptions error:', error)
      throw error
    }
  }
}

export default new RedemptionService()