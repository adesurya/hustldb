// /src/services/apiService.js - Updated with cookie authentication
import axios from 'axios'
import apiConfig, { HTTP_STATUS, ERROR_MESSAGES } from '@/config/api'

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: apiConfig.baseURL,
      timeout: apiConfig.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      withCredentials: true // Enable sending cookies
    })

    this.setupInterceptors()
  }

  setupInterceptors() {
    // Request Interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available (fallback method)
        const token = localStorage.getItem('token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }

        // Get refreshToken from localStorage and set as cookie
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          // Set refreshToken as cookie for this request
          config.headers.Cookie = `refreshToken=${refreshToken}`
          
          // Alternative: Set cookie directly (if not already set)
          document.cookie = `refreshToken=${refreshToken}; path=/; secure; samesite=strict`
        }

        // Add request timestamp for monitoring
        config.metadata = { startTime: new Date() }

        // Log request in development
        if (apiConfig.enableLogs) {
          console.log('🚀 API Request:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            baseURL: config.baseURL,
            headers: this.sanitizeHeaders(config.headers),
            params: config.params
          })
        }

        return config
      },
      (error) => {
        if (apiConfig.enableLogs) {
          console.error('❌ Request Error:', error)
        }
        return Promise.reject(error)
      }
    )

    // Response Interceptor
    this.client.interceptors.response.use(
      (response) => {
        // Calculate response time
        const endTime = new Date()
        const duration = endTime - response.config.metadata.startTime

        // Log response in development
        if (apiConfig.enableLogs) {
          console.log('✅ API Response:', {
            status: response.status,
            statusText: response.statusText,
            url: response.config.url,
            duration: `${duration}ms`,
            dataType: typeof response.data,
            success: response.data?.success
          })
        }

        return response
      },
      async (error) => {
        const originalRequest = error.config

        // Log error details
        if (apiConfig.enableLogs) {
          console.error('❌ API Error:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            message: error.message,
            url: originalRequest?.url,
            data: error.response?.data
          })
        }

        // Handle different error scenarios
        await this.handleErrorResponse(error, originalRequest)

        return Promise.reject(error)
      }
    )
  }

  async handleErrorResponse(error, originalRequest) {
    const status = error.response?.status

    switch (status) {
      case HTTP_STATUS.UNAUTHORIZED:
        await this.handleUnauthorized(originalRequest)
        break
      
      case HTTP_STATUS.FORBIDDEN:
        this.handleForbidden()
        break
      
      case HTTP_STATUS.NOT_FOUND:
        this.handleNotFound(error)
        break
      
      case HTTP_STATUS.UNPROCESSABLE_ENTITY:
        this.handleValidationError(error)
        break
      
      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
      case HTTP_STATUS.BAD_GATEWAY:
      case HTTP_STATUS.SERVICE_UNAVAILABLE:
        this.handleServerError(error)
        break
      
      default:
        if (error.code === 'ECONNABORTED') {
          this.handleTimeout()
        } else if (error.code === 'ERR_NETWORK') {
          this.handleNetworkError()
        }
    }
  }

  async handleUnauthorized(originalRequest) {
    // Clear auth data
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('refreshToken')
    
    // Clear cookies
    document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;'
    
    // Don't redirect during login attempts
    if (!originalRequest?.url?.includes('/auth/login')) {
      // Redirect to login
      window.location.href = '/login'
    }
  }

  handleForbidden() {
    if (apiConfig.enableLogs) {
      console.warn('Access forbidden')
    }
  }

  handleNotFound(error) {
    if (apiConfig.enableLogs) {
      console.warn('Resource not found:', error.config?.url)
    }
  }

  handleValidationError(error) {
    if (apiConfig.enableLogs) {
      console.warn('Validation error:', error.response?.data)
    }
  }

  handleServerError(error) {
    if (apiConfig.enableLogs) {
      console.error('Server error:', error.response?.status, error.response?.data)
    }
  }

  handleTimeout() {
    if (apiConfig.enableLogs) {
      console.warn('Request timeout')
    }
  }

  handleNetworkError() {
    if (apiConfig.enableLogs) {
      console.error('Network error - API might be unreachable')
    }
  }

  sanitizeHeaders(headers) {
    const sanitized = { ...headers }
    if (sanitized.Authorization) {
      sanitized.Authorization = 'Bearer ***'
    }
    if (sanitized.Cookie) {
      sanitized.Cookie = 'refreshToken=***'
    }
    return sanitized
  }

  // Public methods
  setAuthToken(token) {
    if (token) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`
      localStorage.setItem('token', token)
    } else {
      delete this.client.defaults.headers.common['Authorization']
      localStorage.removeItem('token')
    }
  }

  setRefreshToken(refreshToken) {
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken)
      // Set as httpOnly cookie for security
      document.cookie = `refreshToken=${refreshToken}; path=/; secure; samesite=strict`
    } else {
      localStorage.removeItem('refreshToken')
      document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;'
    }
  }

  // HTTP Methods
  get(url, config = {}) {
    return this.client.get(url, config)
  }

  post(url, data = {}, config = {}) {
    return this.client.post(url, data, config)
  }

  put(url, data = {}, config = {}) {
    return this.client.put(url, data, config)
  }

  patch(url, data = {}, config = {}) {
    return this.client.patch(url, data, config)
  }

  delete(url, config = {}) {
    return this.client.delete(url, config)
  }

  // Utility method for handling API responses
  static handleApiResponse(response) {
    if (response.data && response.data.success !== undefined) {
      return {
        success: response.data.success,
        data: response.data.data || response.data,
        message: response.data.message,
        meta: response.data.meta
      }
    }
    
    return {
      success: true,
      data: response.data,
      message: 'Request successful'
    }
  }

  // Utility method for handling API errors
  static handleApiError(error) {
    let message = ERROR_MESSAGES.UNKNOWN_ERROR
    let code = 'UNKNOWN_ERROR'

    if (error.response) {
      const status = error.response.status
      
      switch (status) {
        case HTTP_STATUS.BAD_REQUEST:
          message = error.response.data?.message || ERROR_MESSAGES.VALIDATION_ERROR
          code = 'VALIDATION_ERROR'
          break
        case HTTP_STATUS.UNAUTHORIZED:
          message = ERROR_MESSAGES.UNAUTHORIZED
          code = 'UNAUTHORIZED'
          break
        case HTTP_STATUS.FORBIDDEN:
          message = ERROR_MESSAGES.FORBIDDEN
          code = 'FORBIDDEN'
          break
        case HTTP_STATUS.NOT_FOUND:
          message = ERROR_MESSAGES.NOT_FOUND
          code = 'NOT_FOUND'
          break
        case HTTP_STATUS.UNPROCESSABLE_ENTITY:
          message = error.response.data?.message || ERROR_MESSAGES.VALIDATION_ERROR
          code = 'VALIDATION_ERROR'
          break
        case HTTP_STATUS.INTERNAL_SERVER_ERROR:
        case HTTP_STATUS.BAD_GATEWAY:
        case HTTP_STATUS.SERVICE_UNAVAILABLE:
          message = ERROR_MESSAGES.SERVER_ERROR
          code = 'SERVER_ERROR'
          break
        default:
          message = error.response.data?.message || ERROR_MESSAGES.UNKNOWN_ERROR
      }
    } else if (error.code === 'ECONNABORTED') {
      message = ERROR_MESSAGES.TIMEOUT_ERROR
      code = 'TIMEOUT_ERROR'
    } else if (error.code === 'ERR_NETWORK') {
      message = ERROR_MESSAGES.NETWORK_ERROR
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

// Create and export singleton instance
const apiService = new ApiService()
export default apiService