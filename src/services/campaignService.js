// /src/services/campaignService.js - Fixed: Correct API usage and product count parsing
class CampaignService {
  constructor() {
    this.baseURL = process.env.VUE_APP_API_URL || 'https://apihustl.sijago.ai'
  }

  // Get authentication headers (for create, update, delete operations)
  getAuthHeaders() {
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }

    // Add Bearer token if available
    const token = localStorage.getItem('token')
    if (token) {
      headers.Authorization = `Bearer ${token}`
    } else {
      console.warn('⚠️ No access token found in localStorage')
    }

    return headers
  }

  // Get public headers (for read operations like GET campaigns)
  getPublicHeaders() {
    return {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }

  // Get authentication config for fetch (with auth)
  getAuthConfig(additionalOptions = {}) {
    // Ensure refresh token is set as cookie
    this.ensureRefreshTokenCookie()

    const config = {
      headers: this.getAuthHeaders(),
      credentials: 'include', // Include cookies for refreshToken
      ...additionalOptions
    }

    return config
  }

  // Get public config for fetch (without auth)
  getPublicConfig(additionalOptions = {}) {
    const config = {
      headers: this.getPublicHeaders(),
      ...additionalOptions
    }

    return config
  }

  // Ensure refresh token is available in cookie (for authenticated requests)
  ensureRefreshTokenCookie() {
    try {
      // Check if refresh token exists in localStorage
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        // Set it as cookie for the request
        document.cookie = `refreshToken=${refreshToken}; path=/; secure; samesite=strict`
        console.log('🍪 Refresh token cookie set for authenticated request')
      } else {
        console.warn('⚠️ No refresh token found in localStorage')
      }
    } catch (error) {
      console.error('❌ Failed to set refresh token cookie:', error)
    }
  }

  // Get all campaigns with pagination and filters - FIXED WITH PROPER PRODUCT COUNT
  async getCampaigns(params = {}) {
    try {
      console.log('🚀 Getting campaigns with product count...')
      
      const url = new URL(`${this.baseURL}/api/v1/campaigns`)
      
      if (params.page) url.searchParams.append('page', params.page)
      if (params.limit) url.searchParams.append('limit', params.limit)
      if (params.status) url.searchParams.append('status', params.status)
      
      console.log('📡 Request URL:', url.toString())
      
      // Use public config (no authentication for listing)
      const response = await fetch(url.toString(), {
        method: 'GET',
        ...this.getPublicConfig()
      })

      console.log('📡 Response status:', response.status)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('📦 Raw campaigns response:', data)
      
      // Enhance campaign data with accurate product count
      if (data.success && data.data && Array.isArray(data.data)) {
        console.log('🔧 Enhancing campaigns with product count...')
        data.data = await this.enhanceCampaignsWithProductCount(data.data)
      }
      
      return this.handleApiResponse(data)
    } catch (error) {
      console.error('❌ getCampaigns error:', error)
      throw this.handleApiError(error)
    }
  }

  // Get single campaign by ID with product count - FIXED
  async getCampaign(id) {
    try {
      console.log(`🚀 Getting campaign ${id} with product details...`)
      
      const url = `${this.baseURL}/api/v1/campaigns/${id}`
      console.log('📡 Request URL:', url)
      
      // Use public config (no authentication for reading)
      const response = await fetch(url, {
        method: 'GET',
        ...this.getPublicConfig()
      })

      console.log('📡 Response status:', response.status)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('📦 Raw campaign response:', data)
      
      // Enhance single campaign with accurate product count
      if (data.success && data.data) {
        console.log('🔧 Enhancing campaign with product count...')
        data.data = await this.enhanceCampaignWithProductCount(data.data)
      }
      
      return this.handleApiResponse(data)
    } catch (error) {
      console.error('❌ getCampaign error:', error)
      throw this.handleApiError(error)
    }
  }

  // Enhanced method to get accurate product count for multiple campaigns
  async enhanceCampaignsWithProductCount(campaigns) {
    console.log('📊 Processing', campaigns.length, 'campaigns for product count...')
    
    const enhancedCampaigns = []
    
    // Process campaigns in parallel for better performance
    const enhancePromises = campaigns.map(campaign => this.enhanceCampaignWithProductCount(campaign))
    const results = await Promise.all(enhancePromises)
    
    results.forEach((enhancedCampaign, index) => {
      console.log(`📈 Campaign ${enhancedCampaign.id}: ${enhancedCampaign.productCount} products`)
      enhancedCampaigns.push(enhancedCampaign)
    })
    
    return enhancedCampaigns
  }

  // Enhanced method to get accurate product count for single campaign - FIXED
  async enhanceCampaignWithProductCount(campaign) {
    try {
      // If productCount is already provided and valid, use it
      if (campaign.productCount !== undefined && campaign.productCount !== null && campaign.productCount > 0) {
        console.log(`✅ Campaign ${campaign.id} already has product count:`, campaign.productCount)
        return campaign
      }

      // If products array is provided, count it
      if (campaign.products && Array.isArray(campaign.products)) {
        campaign.productCount = campaign.products.length
        console.log(`✅ Campaign ${campaign.id} product count from products array:`, campaign.productCount)
        return campaign
      }

      // Fetch product count using the correct API endpoint with auth
      console.log(`🔍 Fetching product count for campaign ${campaign.id}...`)
      
      const productResponse = await this.getCampaignProducts(campaign.id, { page: 1, limit: 1 })
      
      if (productResponse.success) {
        // Use meta.pagination.totalItems for accurate count
        if (productResponse.meta && productResponse.meta.pagination && productResponse.meta.pagination.totalItems !== undefined) {
          campaign.productCount = productResponse.meta.pagination.totalItems
          console.log(`✅ Campaign ${campaign.id} product count from meta:`, campaign.productCount)
        } 
        // Fallback to data array length
        else if (productResponse.data && Array.isArray(productResponse.data)) {
          // For accurate count, we need to fetch all products
          const fullProductResponse = await this.getCampaignProducts(campaign.id, { page: 1, limit: 100 })
          campaign.productCount = fullProductResponse.data ? fullProductResponse.data.length : 0
          console.log(`✅ Campaign ${campaign.id} product count from full data:`, campaign.productCount)
        } else {
          campaign.productCount = 0
        }
      } else {
        campaign.productCount = 0
      }

      return campaign
    } catch (error) {
      console.warn(`⚠️ Failed to get product count for campaign ${campaign.id}:`, error.message)
      campaign.productCount = 0
      return campaign
    }
  }

  // Get campaign products with AUTH - FIXED TO USE CORRECT ENDPOINT
  async getCampaignProducts(campaignId, params = {}) {
    try {
      console.log(`🚀 Getting products for campaign ${campaignId} (WITH AUTH)...`)
      
      const url = new URL(`${this.baseURL}/api/v1/campaigns/${campaignId}/products`)
      
      // Add pagination parameters
      const page = params.page || 1
      const limit = params.limit || 20
      
      url.searchParams.append('page', page)
      url.searchParams.append('limit', limit)
      
      console.log('📡 Request URL:', url.toString())
      
      // Ensure we have valid authentication
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No access token found. Please login again.')
      }
      
      // Use auth config (with authentication) - API requires auth for product details
      const response = await fetch(url.toString(), {
        method: 'GET',
        ...this.getAuthConfig()
      })

      console.log('📡 Response status:', response.status)

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required. Please login again.')
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('📦 Campaign products response:', data)
      
      // Transform the response to match our expected format
      if (data.success && data.data && Array.isArray(data.data)) {
        // Extract actual products from the campaign_products structure
        const products = data.data.map(item => {
          // If the item has a 'product' property, use that
          if (item.product) {
            return {
              ...item.product,
              // Add campaign relation info
              campaignProductId: item.id,
              addedBy: item.addedBy,
              addedAt: item.createdAt
            }
          }
          // Otherwise, assume the item is the product itself
          return item
        })
        
        return {
          success: true,
          data: products,
          message: data.message,
          code: data.code,
          meta: data.meta
        }
      }
      
      return this.handleApiResponse(data)
    } catch (error) {
      console.error('❌ getCampaignProducts error:', error)
      throw this.handleApiError(error)
    }
  }

  // Get campaign detail with products - NEW FEATURE
  async getCampaignDetail(campaignId) {
    try {
      console.log(`🚀 Getting campaign detail for ${campaignId}...`)
      
      // Get campaign basic info
      const campaignResponse = await this.getCampaign(campaignId)
      if (!campaignResponse.success) {
        throw new Error('Failed to fetch campaign details')
      }
      
      // Get campaign products
      const productsResponse = await this.getCampaignProducts(campaignId, { page: 1, limit: 100 })
      
      const campaignDetail = {
        ...campaignResponse.data,
        products: productsResponse.success ? productsResponse.data : [],
        productCount: productsResponse.success ? productsResponse.data.length : 0,
        meta: productsResponse.meta || null
      }
      
      console.log('📦 Campaign detail:', campaignDetail)
      
      return {
        success: true,
        data: campaignDetail,
        message: 'Campaign detail retrieved successfully'
      }
    } catch (error) {
      console.error('❌ getCampaignDetail error:', error)
      throw this.handleApiError(error)
    }
  }

  // Create new campaign (REQUIRES AUTH)
  async createCampaign(campaignData) {
    try {
      console.log('🚀 Creating campaign (WITH AUTH)...')
      
      const url = `${this.baseURL}/api/v1/campaigns`
      
      // Prepare payload according to API specification
      const payload = {
        name: campaignData.name,
        slug: campaignData.slug,
        description: campaignData.description,
        startDate: campaignData.startDate,
        endDate: campaignData.endDate,
        isActive: campaignData.isActive || false,
        productIds: campaignData.productIds || []
      }

      // Add image if provided
      if (campaignData.image && typeof campaignData.image === 'string') {
        payload.image = campaignData.image
      }

      console.log('📤 Campaign payload:', payload)
      console.log('🔑 Auth headers:', this.getAuthHeaders())
      
      // Ensure we have valid authentication
      const token = localStorage.getItem('token')
      const refreshToken = localStorage.getItem('refreshToken')
      
      if (!token) {
        throw new Error('No access token found. Please login again.')
      }
      
      if (!refreshToken) {
        console.warn('⚠️ No refresh token found. Request might fail if token is expired.')
      }
      
      // Use auth config (with authentication)
      const response = await fetch(url, {
        method: 'POST',
        ...this.getAuthConfig(),
        body: JSON.stringify(payload)
      })

      console.log('📡 Response status:', response.status)
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorData = await response.text()
        console.error('❌ Error response:', errorData)
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('📦 Response data:', data)
      
      // Enhance the created campaign with product count
      if (data.success && data.data) {
        data.data = await this.enhanceCampaignWithProductCount(data.data)
      }
      
      return this.handleApiResponse(data)
    } catch (error) {
      console.error('❌ createCampaign error:', error)
      throw this.handleApiError(error)
    }
  }

  // Update campaign (REQUIRES AUTH)
  async updateCampaign(id, campaignData) {
    try {
      console.log(`🚀 Updating campaign ${id} (WITH AUTH)...`)
      
      const url = `${this.baseURL}/api/v1/campaigns/${id}`
      
      // Prepare payload according to API specification
      const payload = {
        name: campaignData.name,
        slug: campaignData.slug,
        description: campaignData.description,
        startDate: campaignData.startDate,
        endDate: campaignData.endDate,
        isActive: campaignData.isActive || false
      }

      // Add productIds only if provided (for adding/updating products)
      if (campaignData.productIds && Array.isArray(campaignData.productIds)) {
        payload.productIds = campaignData.productIds
      }

      // Add image if provided
      if (campaignData.image && typeof campaignData.image === 'string') {
        payload.image = campaignData.image
      }

      console.log('📤 Update campaign payload:', payload)
      console.log('🔑 Auth headers:', this.getAuthHeaders())
      
      // Ensure we have valid authentication
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No access token found. Please login again.')
      }
      
      // Use auth config (with authentication)
      const response = await fetch(url, {
        method: 'PUT',
        ...this.getAuthConfig(),
        body: JSON.stringify(payload)
      })

      console.log('📡 Response status:', response.status)

      if (!response.ok) {
        const errorData = await response.text()
        console.error('❌ Error response:', errorData)
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('📦 Response data:', data)
      
      // Enhance the updated campaign with product count
      if (data.success && data.data) {
        data.data = await this.enhanceCampaignWithProductCount(data.data)
      }
      
      return this.handleApiResponse(data)
    } catch (error) {
      console.error('❌ updateCampaign error:', error)
      throw this.handleApiError(error)
    }
  }

  // Delete campaign (REQUIRES AUTH)
  async deleteCampaign(id) {
    try {
      console.log(`🚀 Deleting campaign ${id} (WITH AUTH)...`)
      
      const url = `${this.baseURL}/api/v1/campaigns/${id}`
      
      // Ensure we have valid authentication
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No access token found. Please login again.')
      }
      
      // Use auth config (with authentication)
      const response = await fetch(url, {
        method: 'DELETE',
        ...this.getAuthConfig()
      })

      console.log('📡 Response status:', response.status)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('📦 Response data:', data)
      
      return this.handleApiResponse(data)
    } catch (error) {
      console.error('❌ deleteCampaign error:', error)
      throw this.handleApiError(error)
    }
  }

  // Toggle campaign active status (REQUIRES AUTH)
  async toggleCampaignStatus(id) {
    try {
      console.log(`🚀 Toggling campaign ${id} status (WITH AUTH)...`)
      
      const url = `${this.baseURL}/api/v1/campaigns/${id}/toggle-status`
      
      // Ensure we have valid authentication
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No access token found. Please login again.')
      }
      
      // Use auth config (with authentication)
      const response = await fetch(url, {
        method: 'PATCH',
        ...this.getAuthConfig()
      })

      console.log('📡 Response status:', response.status)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('📦 Response data:', data)
      
      return this.handleApiResponse(data)
    } catch (error) {
      console.error('❌ toggleCampaignStatus error:', error)
      throw this.handleApiError(error)
    }
  }

  // Add products to campaign (REQUIRES AUTH)
  async addProductsToCampaign(campaignId, productIds) {
    try {
      console.log(`🚀 Adding products to campaign ${campaignId} (WITH AUTH)...`)
      console.log('📦 Product IDs to add:', productIds)
      
      const url = `${this.baseURL}/api/v1/campaigns/${campaignId}/products`
      
      // Ensure we have valid authentication
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No access token found. Please login again.')
      }
      
      const payload = { productIds: Array.isArray(productIds) ? productIds : [productIds] }
      console.log('📤 Add products payload:', payload)
      
      // Use auth config (with authentication)
      const response = await fetch(url, {
        method: 'POST',
        ...this.getAuthConfig(),
        body: JSON.stringify(payload)
      })

      console.log('📡 Response status:', response.status)

      if (!response.ok) {
        const errorData = await response.text()
        console.error('❌ Error response:', errorData)
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('📦 Response data:', data)
      
      return this.handleApiResponse(data)
    } catch (error) {
      console.error('❌ addProductsToCampaign error:', error)
      throw this.handleApiError(error)
    }
  }

  // Remove products from campaign (REQUIRES AUTH)
  async removeProductsFromCampaign(campaignId, productIds) {
    try {
      console.log(`🚀 Removing products from campaign ${campaignId} (WITH AUTH)...`)
      console.log('📦 Product IDs to remove:', productIds)
      
      const url = `${this.baseURL}/api/v1/campaigns/${campaignId}/products`
      
      // Ensure we have valid authentication
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No access token found. Please login again.')
      }
      
      const payload = { productIds: Array.isArray(productIds) ? productIds : [productIds] }
      console.log('📤 Remove products payload:', payload)
      
      // Use auth config (with authentication)
      const response = await fetch(url, {
        method: 'DELETE',
        ...this.getAuthConfig(),
        body: JSON.stringify(payload)
      })

      console.log('📡 Response status:', response.status)

      if (!response.ok) {
        const errorData = await response.text()
        console.error('❌ Error response:', errorData)
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('📦 Response data:', data)
      
      return this.handleApiResponse(data)
    } catch (error) {
      console.error('❌ removeProductsFromCampaign error:', error)
      throw this.handleApiError(error)
    }
  }

  // Bulk delete campaigns (REQUIRES AUTH)
  async bulkDeleteCampaigns(campaignIds) {
    try {
      console.log('🚀 Bulk deleting campaigns (WITH AUTH)...')
      
      const url = `${this.baseURL}/api/v1/campaigns/bulk-delete`
      
      // Ensure we have valid authentication
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No access token found. Please login again.')
      }
      
      // Use auth config (with authentication)
      const response = await fetch(url, {
        method: 'POST',
        ...this.getAuthConfig(),
        body: JSON.stringify({ ids: campaignIds })
      })

      console.log('📡 Response status:', response.status)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('📦 Response data:', data)
      
      return this.handleApiResponse(data)
    } catch (error) {
      console.error('❌ bulkDeleteCampaigns error:', error)
      throw this.handleApiError(error)
    }
  }

  // Bulk update campaign status (REQUIRES AUTH)
  async bulkUpdateStatus(campaignIds, isActive) {
    try {
      console.log('🚀 Bulk updating campaign status (WITH AUTH)...')
      
      const url = `${this.baseURL}/api/v1/campaigns/bulk-status`
      
      // Ensure we have valid authentication
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No access token found. Please login again.')
      }
      
      // Use auth config (with authentication)
      const response = await fetch(url, {
        method: 'POST',
        ...this.getAuthConfig(),
        body: JSON.stringify({ ids: campaignIds, isActive })
      })

      console.log('📡 Response status:', response.status)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('📦 Response data:', data)
      
      return this.handleApiResponse(data)
    } catch (error) {
      console.error('❌ bulkUpdateStatus error:', error)
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
            // Clear invalid tokens
            localStorage.removeItem('token')
            localStorage.removeItem('refreshToken')
            // Redirect to login
            if (typeof window !== 'undefined') {
              setTimeout(() => {
                window.location.href = '/login'
              }, 1000)
            }
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

export default new CampaignService()