// /src/services/userService.js - Fixed User management service
import apiService from '@/services/apiService'

class UserService {
  // Get all users with pagination and filters
  async getUsers(params = {}) {
    try {
      const response = await apiService.get('/api/v1/users', { params })
      return this.handleApiResponse(response)
    } catch (error) {
      throw this.handleApiError(error)
    }
  }

  // Get single user by ID
  async getUser(id) {
    try {
      const response = await apiService.get(`/api/v1/users/${id}`)
      return this.handleApiResponse(response)
    } catch (error) {
      throw this.handleApiError(error)
    }
  }

  // Create new user
  async createUser(userData) {
    try {
      const response = await apiService.post('/api/v1/users', userData)
      return this.handleApiResponse(response)
    } catch (error) {
      throw this.handleApiError(error)
    }
  }

  // Update user
  async updateUser(id, userData) {
    try {
      const response = await apiService.put(`/api/v1/users/${id}`, userData)
      return this.handleApiResponse(response)
    } catch (error) {
      throw this.handleApiError(error)
    }
  }

  // Delete user
  async deleteUser(id) {
    try {
      const response = await apiService.delete(`/api/v1/users/${id}`)
      return this.handleApiResponse(response)
    } catch (error) {
      throw this.handleApiError(error)
    }
  }

  // Reset user password
  async resetPassword(id, newPassword) {
    try {
      const response = await apiService.patch(`/api/v1/users/${id}/reset-password`, {
        newPassword
      })
      return this.handleApiResponse(response)
    } catch (error) {
      throw this.handleApiError(error)
    }
  }

  // Ban user
  async banUser(id, reason, notifyUser = true) {
    try {
      const response = await apiService.patch(`/api/v1/users/${id}/ban`, {
        reason,
        notifyUser
      })
      return this.handleApiResponse(response)
    } catch (error) {
      throw this.handleApiError(error)
    }
  }

  // Unban user
  async unbanUser(id, reason, notifyUser = true) {
    try {
      const response = await apiService.patch(`/api/v1/users/${id}/unban`, {
        reason,
        notifyUser
      })
      return this.handleApiResponse(response)
    } catch (error) {
      throw this.handleApiError(error)
    }
  }

  // Get banned users
  async getBannedUsers(params = {}) {
    try {
      const response = await apiService.get('/api/v1/users/banned', { params })
      return this.handleApiResponse(response)
    } catch (error) {
      throw this.handleApiError(error)
    }
  }

  // Check user ban status
  async checkBanStatus(id) {
    try {
      const response = await apiService.get(`/api/v1/users/${id}/ban-status`)
      return this.handleApiResponse(response)
    } catch (error) {
      throw this.handleApiError(error)
    }
  }

  // Bulk delete users
  async bulkDeleteUsers(userIds) {
    try {
      const response = await apiService.post('/api/v1/users/bulk-delete', { 
        ids: userIds 
      })
      return this.handleApiResponse(response)
    } catch (error) {
      throw this.handleApiError(error)
    }
  }

  // Bulk update user status
  async bulkUpdateStatus(userIds, isActive) {
    try {
      const response = await apiService.post('/api/v1/users/bulk-status', { 
        ids: userIds, 
        isActive 
      })
      return this.handleApiResponse(response)
    } catch (error) {
      throw this.handleApiError(error)
    }
  }

  // Utility method for handling API responses
  handleApiResponse(response) {
    if (response.data && response.data.success !== undefined) {
      return {
        success: response.data.success,
        data: response.data.data || response.data,
        message: response.data.message,
        meta: response.data.meta,
        code: response.data.code,
        timestamp: response.data.timestamp
      }
    }
    
    return {
      success: true,
      data: response.data,
      message: 'Request successful'
    }
  }

  // Utility method for handling API errors
  handleApiError(error) {
    let message = 'An unexpected error occurred'
    let code = 'UNKNOWN_ERROR'

    if (error.response) {
      const status = error.response.status
      
      switch (status) {
        case 400:
          message = error.response.data?.message || 'Bad request'
          code = 'BAD_REQUEST'
          break
        case 401:
          message = 'Session expired. Please login again.'
          code = 'UNAUTHORIZED'
          break
        case 403:
          message = 'You do not have permission to perform this action.'
          code = 'FORBIDDEN'
          break
        case 404:
          message = 'The requested user was not found.'
          code = 'NOT_FOUND'
          break
        case 422:
          message = error.response.data?.message || 'Validation error'
          code = 'VALIDATION_ERROR'
          break
        case 500:
        case 502:
        case 503:
          message = 'Server error. Please try again later.'
          code = 'SERVER_ERROR'
          break
        default:
          message = error.response.data?.message || 'An unexpected error occurred'
      }
    } else if (error.code === 'ECONNABORTED') {
      message = 'Request timeout. Please try again.'
      code = 'TIMEOUT_ERROR'
    } else if (error.code === 'ERR_NETWORK') {
      message = 'Network error. Please check your connection.'
      code = 'NETWORK_ERROR'
    }

    return {
      success: false,
      message,
      code,
      details: error.response?.data
    }
  }
}

export default new UserService()