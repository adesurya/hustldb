// /src/services/campaignService.js - Fixed: Correct API usage according to documentation
class CampaignService {
  constructor() {
    this.baseURL = process.env.VUE_APP_API_URL || 'https://apihustl.sijago.ai'
  }

  // Get authentication headers (for authenticated operations)
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

  // Get public headers (for read operations)
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

  // Get public config for fetch (without auth - only cookies)
  getPublicConfig(additionalOptions = {}) {
    // Ensure refresh token is set as cookie for public endpoints
    this.ensureRefreshTokenCookie()

    const config = {
      headers: this.getPublicHeaders(),
      credentials: 'include', // Include cookies for refreshToken
      ...additionalOptions
    }

    return config
  }

  // Ensure refresh token is available in cookie
  ensureRefreshTokenCookie() {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        document.cookie = `refreshToken=${refreshToken}; path=/; secure; samesite=strict`
        console.log('🍪 Refresh token cookie set for request')
      } else {
        console.warn('⚠️ No refresh token found in localStorage')
      }
    } catch (error) {
      console.error('❌ Failed to set refresh token cookie:', error)
    }
  }

  // 1. LIST ALL CAMPAIGNS - Uses cookies only
  async getCampaigns(params = {}) {
    try {
      console.log('🚀 Getting all campaigns...')
      
      const url = new URL(`${this.baseURL}/api/v1/campaigns/`)
      
      // Add query parameters if provided
      if (params.page) url.searchParams.append('page', params.page)
      if (params.limit) url.searchParams.append('limit', params.limit)
      if (params.status) url.searchParams.append('status', params.status)
      
      console.log('📡 Request URL:', url.toString())
      
      // Use public config (cookies only)
      const response = await fetch(url.toString(), {
        method: 'GET',
        ...this.getPublicConfig()
      })

      console.log('📡 Response status:', response.status)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('📦 Campaigns response:', data)
      
      return this.handleApiResponse(data)
    } catch (error) {
      console.error('❌ getCampaigns error:', error)
      throw this.handleApiError(error)
    }
  }

  // 2. LIST ACTIVE CAMPAIGNS - Uses cookies only
  async getActiveCampaigns(params = {}) {
    try {
      console.log('🚀 Getting active campaigns...')
      
      const url = new URL(`${this.baseURL}/api/v1/campaigns/active`)
      
      // Add query parameters if provided
      if (params.page) url.searchParams.append('page', params.page)
      if (params.limit) url.searchParams.append('limit', params.limit)
      
      console.log('📡 Request URL:', url.toString())
      
      // Use public config (cookies only)
      const response = await fetch(url.toString(), {
        method: 'GET',
        ...this.getPublicConfig()
      })

      console.log('📡 Response status:', response.status)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('📦 Active campaigns response:', data)
      
      return this.handleApiResponse(data)
    } catch (error) {
      console.error('❌ getActiveCampaigns error:', error)
      throw this.handleApiError(error)
    }
  }

  // 3. GET SINGLE CAMPAIGN DETAIL - Uses cookies only
  async getCampaign(id) {
    try {
      console.log(`🚀 Getting campaign detail ${id}...`)
      
      const url = `${this.baseURL}/api/v1/campaigns/${id}`
      console.log('📡 Request URL:', url)
      
      // Use public config (cookies only)
      const response = await fetch(url, {
        method: 'GET',
        ...this.getPublicConfig()
      })

      console.log('📡 Response status:', response.status)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('📦 Campaign detail response:', data)
      
      return this.handleApiResponse(data)
    } catch (error) {
      console.error('❌ getCampaign error:', error)
      throw this.handleApiError(error)
    }
  }

  // 4. CREATE CAMPAIGN (REQUIRES AUTH)
  async createCampaign(campaignData) {
    try {
      console.log('🚀 Creating campaign (WITH AUTH)...')
      
      const url = `${this.baseURL}/api/v1/campaigns`
      
      // Validate required fields
      if (!campaignData.name || !campaignData.slug || !campaignData.description) {
        throw new Error('Name, slug, and description are required')
      }

      // Validate dates
      const startDate = new Date(campaignData.startDate)
      const endDate = new Date(campaignData.endDate)
      const now = new Date()

      if (startDate <= now) {
        throw new Error('Start date must be in the future')
      }

      if (endDate <= startDate) {
        throw new Error('End date must be after start date')
      }

      // Prepare payload according to API specification
      const payload = {
        name: campaignData.name.trim(),
        slug: campaignData.slug.trim(),
        description: campaignData.description.trim(),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        isActive: campaignData.isActive || false,
        productIds: campaignData.productIds || []
      }

      // Add image if provided
      if (campaignData.image && typeof campaignData.image === 'string') {
        payload.image = campaignData.image
      }

      console.log('📤 Campaign payload:', payload)
      
      // Ensure we have valid authentication
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No access token found. Please login again.')
      }
      
      // Use auth config (with authentication + cookies)
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
      console.log('📦 Create campaign response:', data)
      
      return this.handleApiResponse(data)
    } catch (error) {
      console.error('❌ createCampaign error:', error)
      throw this.handleApiError(error)
    }
  }

  // 5. UPDATE CAMPAIGN (REQUIRES AUTH)
  async updateCampaign(id, campaignData) {
    try {
      console.log(`🚀 Updating campaign ${id} (WITH AUTH)...`)
      
      const url = `${this.baseURL}/api/v1/campaigns/${id}`
      
      // Validate dates if provided
      if (campaignData.startDate && campaignData.endDate) {
        const startDate = new Date(campaignData.startDate)
        const endDate = new Date(campaignData.endDate)
        const now = new Date()

        if (startDate <= now) {
          throw new Error('Start date must be in the future')
        }

        if (endDate <= startDate) {
          throw new Error('End date must be after start date')
        }
      }

      // Prepare payload according to API specification
      const payload = {
        name: campaignData.name?.trim(),
        slug: campaignData.slug?.trim(),
        description: campaignData.description?.trim(),
        isActive: campaignData.isActive
      }

      // Add dates if provided
      if (campaignData.startDate) {
        payload.startDate = new Date(campaignData.startDate).toISOString()
      }
      if (campaignData.endDate) {
        payload.endDate = new Date(campaignData.endDate).toISOString()
      }

      // Add image if provided
      if (campaignData.image && typeof campaignData.image === 'string') {
        payload.image = campaignData.image
      }

      // Remove undefined values
      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined) {
          delete payload[key]
        }
      })

      console.log('📤 Update campaign payload:', payload)
      
      // Ensure we have valid authentication
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No access token found. Please login again.')
      }
      
      // Use auth config (with authentication + cookies)
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
      console.log('📦 Update campaign response:', data)
      
      return this.handleApiResponse(data)
    } catch (error) {
      console.error('❌ updateCampaign error:', error)
      throw this.handleApiError(error)
    }
  }

  // 6. DELETE CAMPAIGN (REQUIRES AUTH)
  async deleteCampaign(id) {
    try {
      console.log(`🚀 Deleting campaign ${id} (WITH AUTH)...`)
      
      const url = `${this.baseURL}/api/v1/campaigns/${id}`
      
      // Ensure we have valid authentication
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No access token found. Please login again.')
      }
      
      // Use auth config (with authentication + cookies)
      const response = await fetch(url, {
        method: 'DELETE',
        ...this.getAuthConfig()
      })

      console.log('📡 Response status:', response.status)

      if (!response.ok) {
        const errorData = await response.text()
        console.error('❌ Error response:', errorData)
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('📦 Delete campaign response:', data)
      
      return this.handleApiResponse(data)
    } catch (error) {
      console.error('❌ deleteCampaign error:', error)
      throw this.handleApiError(error)
    }
  }

  // 7. ADD PRODUCTS TO CAMPAIGN (REQUIRES AUTH)
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
      
      const payload = { 
        productIds: Array.isArray(productIds) ? productIds : [productIds] 
      }
      console.log('📤 Add products payload:', payload)
      
      // Use auth config (with authentication + cookies)
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
      console.log('📦 Add products response:', data)
      
      return this.handleApiResponse(data)
    } catch (error) {
      console.error('❌ addProductsToCampaign error:', error)
      throw this.handleApiError(error)
    }
  }

  // 8. REMOVE PRODUCTS FROM CAMPAIGN (REQUIRES AUTH)
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
      
      const payload = { 
        productIds: Array.isArray(productIds) ? productIds : [productIds] 
      }
      console.log('📤 Remove products payload:', payload)
      
      // Use auth config (with authentication + cookies)
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
      console.log('📦 Remove products response:', data)
      
      return this.handleApiResponse(data)
    } catch (error) {
      console.error('❌ removeProductsFromCampaign error:', error)
      throw this.handleApiError(error)
    }
  }

  // 9. VALIDATE PRODUCT AVAILABILITY (REQUIRES AUTH)
  async validateProductForCampaign(campaignId, productId) {
    try {
      console.log(`🚀 Validating product ${productId} for campaign ${campaignId} (WITH AUTH)...`)
      
      const url = `${this.baseURL}/api/v1/campaigns/${campaignId}/validate-product`
      
      // Ensure we have valid authentication
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No access token found. Please login again.')
      }
      
      const payload = { productId }
      console.log('📤 Validate product payload:', payload)
      
      // Use auth config (with authentication + cookies)
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
      console.log('📦 Validate product response:', data)
      
      return this.handleApiResponse(data)
    } catch (error) {
      console.error('❌ validateProductForCampaign error:', error)
      throw this.handleApiError(error)
    }
  }

  // Helper method to get campaign detail with products (uses getCampaign)
  async getCampaignDetail(campaignId) {
    try {
      console.log(`🚀 Getting detailed campaign info for ${campaignId}...`)
      
      // Get campaign with products using the single endpoint
      const response = await this.getCampaign(campaignId)
      
      if (response.success && response.data) {
        // The API returns products array in the data
        const campaignDetail = {
          ...response.data,
          // Ensure productCount is accurate
          productCount: response.data.products ? response.data.products.length : 0
        }
        
        console.log('📦 Campaign detail processed:', campaignDetail)
        
        return {
          success: true,
          data: campaignDetail,
          message: 'Campaign detail retrieved successfully'
        }
      }
      
      return response
    } catch (error) {
      console.error('❌ getCampaignDetail error:', error)
      throw this.handleApiError(error)
    }
  }

  // Legacy method for compatibility (redirects to getCampaign since API includes products)
  async getCampaignProducts(campaignId, params = {}) {
    try {
      console.log(`🚀 Getting products for campaign ${campaignId}...`)
      
      // Get campaign detail which includes products
      const response = await this.getCampaign(campaignId)
      
      if (response.success && response.data && response.data.products) {
        // Transform the response to match expected format
        const products = response.data.products.map(product => {
          return {
            ...product,
            // Add campaign relation info if available
            campaignProductId: product.CampaignProduct?.id || product.campaignProduct?.id,
            addedBy: product.CampaignProduct?.added_by || product.campaignProduct?.added_by,
            addedAt: product.CampaignProduct?.created_at || product.campaignProduct?.created_at
          }
        })
        
        return {
          success: true,
          data: products,
          message: 'Campaign products retrieved successfully',
          meta: {
            pagination: {
              totalItems: products.length,
              currentPage: 1,
              totalPages: 1
            }
          }
        }
      }
      
      return {
        success: true,
        data: [],
        message: 'No products found for this campaign'
      }
    } catch (error) {
      console.error('❌ getCampaignProducts error:', error)
      throw this.handleApiError(error)
    }
  }

  // Toggle campaign active status (placeholder - implement if API provides this endpoint)
  async toggleCampaignStatus(id) {
    try {
      console.log(`🚀 Toggling campaign ${id} status...`)
      
      // Get current campaign first
      const currentResponse = await this.getCampaign(id)
      if (!currentResponse.success) {
        throw new Error('Failed to get current campaign status')
      }
      
      // Toggle the status
      const newStatus = !currentResponse.data.isActive
      
      // Update the campaign with new status
      const updateResponse = await this.updateCampaign(id, { 
        isActive: newStatus 
      })
      
      return updateResponse
    } catch (error) {
      console.error('❌ toggleCampaignStatus error:', error)
      throw this.handleApiError(error)
    }
  }

  // Bulk operations (implement if API provides these endpoints)
  async bulkDeleteCampaigns(campaignIds) {
    try {
      console.log('🚀 Bulk deleting campaigns...')
      
      // Since no bulk endpoint is documented, delete one by one
      const results = []
      for (const id of campaignIds) {
        try {
          const result = await this.deleteCampaign(id)
          results.push({ id, success: true, result })
        } catch (error) {
          results.push({ id, success: false, error: error.message })
        }
      }
      
      const successCount = results.filter(r => r.success).length
      const failedCount = results.filter(r => !r.success).length
      
      return {
        success: true,
        message: `Bulk delete completed: ${successCount} successful, ${failedCount} failed`,
        data: results
      }
    } catch (error) {
      console.error('❌ bulkDeleteCampaigns error:', error)
      throw this.handleApiError(error)
    }
  }

  async bulkUpdateStatus(campaignIds, isActive) {
    try {
      console.log('🚀 Bulk updating campaign status...')
      
      // Since no bulk endpoint is documented, update one by one
      const results = []
      for (const id of campaignIds) {
        try {
          const result = await this.updateCampaign(id, { isActive })
          results.push({ id, success: true, result })
        } catch (error) {
          results.push({ id, success: false, error: error.message })
        }
      }
      
      const successCount = results.filter(r => r.success).length
      const failedCount = results.filter(r => !r.success).length
      
      return {
        success: true,
        message: `Bulk status update completed: ${successCount} successful, ${failedCount} failed`,
        data: results
      }
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