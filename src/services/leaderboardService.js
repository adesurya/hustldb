// /src/services/leaderboardService.js - Fixed version dengan export yang benar
import apiService from '@/services/apiService'
import { API_ENDPOINTS } from '@/config/api'

class LeaderboardService {
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

  // Get comprehensive leaderboard data
  async getComprehensiveLeaderboard(params = {}) {
    try {
      console.log('🚀 Getting comprehensive leaderboard...', params)
      
      const queryParams = new URLSearchParams()
      if (params.date) queryParams.append('date', params.date)
      if (params.year) queryParams.append('year', params.year)
      if (params.month) queryParams.append('month', params.month)
      if (params.type) queryParams.append('type', params.type)
      
      const url = `${API_ENDPOINTS.LEADERBOARD.COMPREHENSIVE}?${queryParams.toString()}`
      console.log('📡 Request URL:', url)
      
      const response = await apiService.get(url)
      console.log('📦 Response data:', response.data)
      
      return apiService.constructor.handleApiResponse(response)
    } catch (error) {
      console.error('❌ getComprehensiveLeaderboard error:', error)
      throw apiService.constructor.handleApiError(error)
    }
  }

  // Get leaderboard statistics
  async getLeaderboardStatistics() {
    try {
      console.log('🚀 Getting leaderboard statistics...')
      
      const url = API_ENDPOINTS.LEADERBOARD.STATISTICS
      console.log('📡 Request URL:', url)
      
      const response = await apiService.get(url)
      console.log('📦 Response data:', response.data)
      
      return apiService.constructor.handleApiResponse(response)
    } catch (error) {
      console.error('❌ getLeaderboardStatistics error:', error)
      // Return empty data if statistics endpoint doesn't exist
      return {
        success: true,
        data: {},
        message: 'Statistics endpoint not available'
      }
    }
  }

  // Get points statistics
  async getPointsStatistics() {
    try {
      console.log('🚀 Getting points statistics...')
      
      const url = API_ENDPOINTS.POINTS.STATISTICS
      console.log('📡 Request URL:', url)
      
      const response = await apiService.get(url)
      console.log('📦 Response data:', response.data)
      
      return apiService.constructor.handleApiResponse(response)
    } catch (error) {
      console.error('❌ getPointsStatistics error:', error)
      throw apiService.constructor.handleApiError(error)
    }
  }

  // Get points transactions
  async getPointsTransactions(params = {}) {
    try {
      console.log('🚀 Getting points transactions...', params)
      
      const queryParams = new URLSearchParams()
      if (params.page) queryParams.append('page', params.page)
      if (params.limit) queryParams.append('limit', params.limit)
      if (params.userId) queryParams.append('userId', params.userId)
      if (params.transactionType) queryParams.append('transactionType', params.transactionType)
      if (params.activityType) queryParams.append('activityType', params.activityType)
      if (params.status) queryParams.append('status', params.status)
      if (params.startDate) queryParams.append('startDate', params.startDate)
      if (params.endDate) queryParams.append('endDate', params.endDate)
      
      const url = `${API_ENDPOINTS.POINTS.TRANSACTIONS}?${queryParams.toString()}`
      console.log('📡 Request URL:', url)
      
      const response = await apiService.get(url)
      console.log('📦 Response data:', response.data)
      
      return apiService.constructor.handleApiResponse(response)
    } catch (error) {
      console.error('❌ getPointsTransactions error:', error)
      throw apiService.constructor.handleApiError(error)
    }
  }

  // Award points to user manually
  async awardPoints(awardData) {
    try {
      console.log('🚀 Awarding points...', awardData)
      
      const payload = {
        userId: parseInt(awardData.userId),
        activityCode: awardData.activityCode || 'MANUAL_AWARD',
        customAmount: parseInt(awardData.customAmount),
        description: awardData.description || '',
        referenceId: awardData.referenceId || `manual_${Date.now()}`,
        referenceType: awardData.referenceType || 'manual_award'
      }
      
      console.log('📡 Request URL:', API_ENDPOINTS.POINTS.AWARD)
      console.log('📦 Payload:', payload)
      
      const response = await apiService.post(API_ENDPOINTS.POINTS.AWARD, payload)
      console.log('📦 Response data:', response.data)
      
      return apiService.constructor.handleApiResponse(response)
    } catch (error) {
      console.error('❌ awardPoints error:', error)
      throw apiService.constructor.handleApiError(error)
    }
  }

  // Get user's point balance
  async getUserPointBalance(userId) {
    try {
      console.log(`🚀 Getting user point balance for user ${userId}...`)
      
      const url = this.buildUrl(API_ENDPOINTS.POINTS.USER_BALANCE, { id: userId })
      console.log('📡 Request URL:', url)
      
      const response = await apiService.get(url)
      console.log('📦 Response data:', response.data)
      
      return apiService.constructor.handleApiResponse(response)
    } catch (error) {
      console.error('❌ getUserPointBalance error:', error)
      throw apiService.constructor.handleApiError(error)
    }
  }

  // Get user's point transactions
  async getUserPointTransactions(userId, params = {}) {
    try {
      console.log(`🚀 Getting user point transactions for user ${userId}...`, params)
      
      const queryParams = new URLSearchParams()
      if (params.page) queryParams.append('page', params.page)
      if (params.limit) queryParams.append('limit', params.limit)
      if (params.transactionType) queryParams.append('transactionType', params.transactionType)
      if (params.activityType) queryParams.append('activityType', params.activityType)
      if (params.startDate) queryParams.append('startDate', params.startDate)
      if (params.endDate) queryParams.append('endDate', params.endDate)
      
      const url = `${this.buildUrl(API_ENDPOINTS.POINTS.USER_TRANSACTIONS, { id: userId })}?${queryParams.toString()}`
      console.log('📡 Request URL:', url)
      
      const response = await apiService.get(url)
      console.log('📦 Response data:', response.data)
      
      return apiService.constructor.handleApiResponse(response)
    } catch (error) {
      console.error('❌ getUserPointTransactions error:', error)
      throw apiService.constructor.handleApiError(error)
    }
  }

  // Utility methods for date formatting
  formatDateForAPI(date) {
    if (!date) return null
    
    const d = new Date(date)
    return d.toISOString().split('T')[0] // Returns YYYY-MM-DD format
  }

  getCurrentDate() {
    return this.formatDateForAPI(new Date())
  }

  getCurrentMonth() {
    const now = new Date()
    return now.getMonth() + 1 // Returns 1-12
  }

  getCurrentYear() {
    return new Date().getFullYear()
  }

  // Generate comprehensive leaderboard parameters
  getLeaderboardParams(period = 'all_time', customDate = null) {
    const params = {}
    
    switch (period) {
      case 'daily':
        params.date = customDate || this.getCurrentDate()
        params.year = new Date(params.date).getFullYear()
        params.month = new Date(params.date).getMonth() + 1
        break
      
      case 'monthly':
        if (customDate) {
          const date = new Date(customDate)
          params.year = date.getFullYear()
          params.month = date.getMonth() + 1
        } else {
          params.year = this.getCurrentYear()
          params.month = this.getCurrentMonth()
        }
        params.date = customDate || this.getCurrentDate()
        break
      
      case 'all_time':
      default:
        // For all time, we still need to provide current date for context
        params.date = this.getCurrentDate()
        params.year = this.getCurrentYear()
        params.month = this.getCurrentMonth()
        break
    }
    
    return params
  }
}

// Create singleton instance and export
const leaderboardService = new LeaderboardService()
export default leaderboardService