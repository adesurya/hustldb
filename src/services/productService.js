// /src/services/productService.js - Simple Product Service for Campaign Modal
class ProductService {
  constructor() {
    this.baseURL = process.env.VUE_APP_API_URL || 'https://apihustl.sijago.ai'
  }

  // Get public headers (for read operations)
  getPublicHeaders() {
    return {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }

  // Get public config for fetch (without auth)
  getPublicConfig(additionalOptions = {}) {
    const config = {
      headers: this.getPublicHeaders(),
      ...additionalOptions
    }

    return config
  }

  // Get all products (PUBLIC - NO AUTH)
  async getProducts(params = {}) {
    try {
      console.log('🚀 Getting products (PUBLIC - no auth)...')
      
      const url = new URL(`${this.baseURL}/api/v1/products`)
      
      if (params.page) url.searchParams.append('page', params.page)
      if (params.limit) url.searchParams.append('limit', params.limit)
      if (params.category) url.searchParams.append('category', params.category)
      if (params.search) url.searchParams.append('search', params.search)
      
      console.log('📡 Request URL:', url.toString())
      
      // Use public config (no authentication)
      const response = await fetch(url.toString(), {
        method: 'GET',
        ...this.getPublicConfig()
      })

      console.log('📡 Response status:', response.status)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('📦 Response data:', data)
      
      return this.handleApiResponse(data)
    } catch (error) {
      console.error('❌ getProducts error:', error)
      throw this.handleApiError(error)
    }
  }

  // Get single product by ID (PUBLIC - NO AUTH)
  async getProduct(id) {
    try {
      console.log(`🚀 Getting product ${id} (PUBLIC - no auth)...`)
      
      const url = `${this.baseURL}/api/v1/products/${id}`
      console.log('📡 Request URL:', url)
      
      // Use public config (no authentication)
      const response = await fetch(url, {
        method: 'GET',
        ...this.getPublicConfig()
      })

      console.log('📡 Response status:', response.status)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('📦 Response data:', data)
      
      return this.handleApiResponse(data)
    } catch (error) {
      console.error('❌ getProduct error:', error)
      throw this.handleApiError(error)
    }
  }

  // Search products by query (PUBLIC - NO AUTH)
  async searchProducts(query, params = {}) {
    try {
      console.log(`🚀 Searching products: "${query}" (PUBLIC - no auth)...`)
      
      const url = new URL(`${this.baseURL}/api/v1/products`)
      
      if (query) url.searchParams.append('search', query)
      if (params.page) url.searchParams.append('page', params.page)
      if (params.limit) url.searchParams.append('limit', params.limit)
      if (params.category) url.searchParams.append('category', params.category)
      
      console.log('📡 Request URL:', url.toString())
      
      // Use public config (no authentication)
      const response = await fetch(url.toString(), {
        method: 'GET',
        ...this.getPublicConfig()
      })

      console.log('📡 Response status:', response.status)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('📦 Response data:', data)
      
      return this.handleApiResponse(data)
    } catch (error) {
      console.error('❌ searchProducts error:', error)
      throw this.handleApiError(error)
    }
  }

  // Get product categories (PUBLIC - NO AUTH)
  async getCategories(params = {}) {
    try {
      console.log('🚀 Getting categories (PUBLIC - no auth)...')
      
      const url = new URL(`${this.baseURL}/api/v1/categories`)
      
      if (params.page) url.searchParams.append('page', params.page)
      if (params.limit) url.searchParams.append('limit', params.limit)
      
      console.log('📡 Request URL:', url.toString())
      
      // Use public config (no authentication)
      const response = await fetch(url.toString(), {
        method: 'GET',
        ...this.getPublicConfig()
      })

      console.log('📡 Response status:', response.status)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('📦 Response data:', data)
      
      return this.handleApiResponse(data)
    } catch (error) {
      console.error('❌ getCategories error:', error)
      throw this.handleApiError(error)
    }
  }

  // Utility method for handling API responses
  handleApiResponse(data) {
    if (data && typeof data.success === 'boolean') {
      return {
        success: data.success,
        data: data.data || [],
        message: data.message || 'Request completed',
        code: data.code || 'SUCCESS',
        timestamp: data.timestamp,
        meta: data.meta || null
      }
    }
    
    return {
      success: true,
      data: data || [],
      message: 'Request successful',
      code: 'SUCCESS'
    }
  }

  // Utility method for handling API errors
  handleApiError(error) {
    let message = 'An unexpected error occurred'
    let code = 'UNKNOWN_ERROR'

    if (error instanceof TypeError && error.message.includes('fetch')) {
      message = 'Network error. Please check your connection.'
      code = 'NETWORK_ERROR'
    } else if (error.message.includes('HTTP')) {
      const match = error.message.match(/HTTP (\d+): (.+)/)
      if (match) {
        const status = parseInt(match[1])
        const statusText = match[2]
        
        switch (status) {
          case 400:
            message = 'Bad request - Please check your input data'
            code = 'BAD_REQUEST'
            break
          case 401:
            message = 'Authentication required - Please login again'
            code = 'UNAUTHORIZED'
            break
          case 403:
            message = 'You do not have permission to perform this action'
            code = 'FORBIDDEN'
            break
          case 404:
            message = 'The requested resource was not found'
            code = 'NOT_FOUND'
            break
          case 422:
            message = 'Validation error - Please check your input data'
            code = 'VALIDATION_ERROR'
            break
          case 500:
            message = 'Internal server error - Please try again later'
            code = 'SERVER_ERROR'
            break
          case 502:
          case 503:
            message = 'Service temporarily unavailable - Please try again later'
            code = 'SERVICE_UNAVAILABLE'
            break
          default:
            message = `HTTP ${status} error: ${statusText}`
            code = `HTTP_${status}`
        }
      }
    } else if (error.message) {
      message = error.message
      code = 'CLIENT_ERROR'
    }

    return {
      success: false,
      message,
      code,
      details: error,
      originalError: error
    }
  }
}

export default new ProductService()