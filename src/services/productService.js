// /src/services/productService.js - Fixed with proper authentication and API endpoints
import apiService from '@/services/apiService'
import { API_ENDPOINTS } from '@/config/api'

class ProductService {
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

  // Get all products with pagination and filters
  async getProducts(params = {}) {
    try {
      console.log('🚀 Getting products...')
      
      const queryParams = new URLSearchParams()
      if (params.page) queryParams.append('page', params.page)
      if (params.limit) queryParams.append('limit', params.limit)
      if (params.category) queryParams.append('category', params.category)
      if (params.search) queryParams.append('search', params.search)
      if (params.status) queryParams.append('status', params.status)
      if (params.featured) queryParams.append('featured', params.featured)
      
      const url = `${API_ENDPOINTS.PRODUCTS.LIST}?${queryParams.toString()}`
      console.log('📡 Request URL:', url)
      
      const response = await apiService.get(url)
      console.log('📦 Response data:', response.data)
      
      return apiService.constructor.handleApiResponse(response)
    } catch (error) {
      console.error('❌ getProducts error:', error)
      throw apiService.constructor.handleApiError(error)
    }
  }

  // Get single product by ID
  async getProduct(id) {
    try {
      console.log(`🚀 Getting product ${id}...`)
      
      const url = this.buildUrl(API_ENDPOINTS.PRODUCTS.DETAIL, { id })
      console.log('📡 Request URL:', url)
      
      const response = await apiService.get(url)
      console.log('📦 Response data:', response.data)
      
      return apiService.constructor.handleApiResponse(response)
    } catch (error) {
      console.error('❌ getProduct error:', error)
      throw apiService.constructor.handleApiError(error)
    }
  }

  // Create new product with file upload
  async createProduct(productData) {
    try {
      console.log('🚀 Creating product...', productData)
      
      const formData = new FormData()
      
      // Add all product fields to FormData
      formData.append('title', productData.title)
      formData.append('description', productData.description)
      formData.append('points', productData.points.toString())
      formData.append('price', productData.price.toString())
      formData.append('categoryId', productData.categoryId.toString())
      formData.append('stockQuantity', productData.stockQuantity.toString())
      formData.append('isFeatured', productData.isFeatured ? 'true' : 'false')
      formData.append('isActive', productData.isActive ? 'true' : 'false')
      
      // Optional fields
      if (productData.url) formData.append('url', productData.url)
      if (productData.metaTitle) formData.append('metaTitle', productData.metaTitle)
      if (productData.metaDescription) formData.append('metaDescription', productData.metaDescription)
      if (productData.sortOrder) formData.append('sortOrder', productData.sortOrder.toString())
      
      // Add image file if provided
      if (productData.image) {
        formData.append('image', productData.image)
      }
      
      console.log('📡 Request URL:', API_ENDPOINTS.PRODUCTS.CREATE)
      
      const response = await apiService.post(API_ENDPOINTS.PRODUCTS.CREATE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      console.log('📦 Response data:', response.data)
      
      return apiService.constructor.handleApiResponse(response)
    } catch (error) {
      console.error('❌ createProduct error:', error)
      throw apiService.constructor.handleApiError(error)
    }
  }

  // Update existing product
  async updateProduct(id, productData) {
    try {
      console.log(`🚀 Updating product ${id}...`, productData)
      
      const formData = new FormData()
      
      // Add all product fields to FormData
      formData.append('title', productData.title)
      formData.append('description', productData.description)
      formData.append('points', productData.points.toString())
      formData.append('price', productData.price.toString())
      formData.append('categoryId', productData.categoryId.toString())
      formData.append('stockQuantity', productData.stockQuantity.toString())
      formData.append('isFeatured', productData.isFeatured ? 'true' : 'false')
      formData.append('isActive', productData.isActive ? 'true' : 'false')
      
      // Optional fields
      if (productData.url) formData.append('url', productData.url)
      if (productData.metaTitle) formData.append('metaTitle', productData.metaTitle)
      if (productData.metaDescription) formData.append('metaDescription', productData.metaDescription)
      if (productData.sortOrder) formData.append('sortOrder', productData.sortOrder.toString())
      
      // Add image file if provided
      if (productData.image) {
        formData.append('image', productData.image)
      }
      
      const url = this.buildUrl(API_ENDPOINTS.PRODUCTS.UPDATE, { id })
      console.log('📡 Request URL:', url)
      
      const response = await apiService.put(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      console.log('📦 Response data:', response.data)
      
      return apiService.constructor.handleApiResponse(response)
    } catch (error) {
      console.error('❌ updateProduct error:', error)
      throw apiService.constructor.handleApiError(error)
    }
  }

  // Delete product
  async deleteProduct(id) {
    try {
      console.log(`🚀 Deleting product ${id}...`)
      
      const url = this.buildUrl(API_ENDPOINTS.PRODUCTS.DELETE, { id })
      console.log('📡 Request URL:', url)
      
      const response = await apiService.delete(url)
      console.log('📦 Response data:', response.data)
      
      return apiService.constructor.handleApiResponse(response)
    } catch (error) {
      console.error('❌ deleteProduct error:', error)
      throw apiService.constructor.handleApiError(error)
    }
  }

  // Toggle product status (active/inactive)
  async toggleProductStatus(id) {
    try {
      console.log(`🚀 Toggling product status ${id}...`)
      
      const url = this.buildUrl(API_ENDPOINTS.PRODUCTS.TOGGLE_STATUS, { id }).replace('/status', '/toggle-status')
      console.log('📡 Request URL:', url)
      
      const response = await apiService.patch(url)
      console.log('📦 Response data:', response.data)
      
      return apiService.constructor.handleApiResponse(response)
    } catch (error) {
      console.error('❌ toggleProductStatus error:', error)
      throw apiService.constructor.handleApiError(error)
    }
  }

  // Toggle featured status
  async toggleFeaturedStatus(id) {
    try {
      console.log(`🚀 Toggling featured status ${id}...`)
      
      const url = `${this.baseURL}/api/v1/products/${id}/toggle-featured`
      console.log('📡 Request URL:', url)
      
      const response = await apiService.patch(url)
      console.log('📦 Response data:', response.data)
      
      return apiService.constructor.handleApiResponse(response)
    } catch (error) {
      console.error('❌ toggleFeaturedStatus error:', error)
      throw apiService.constructor.handleApiError(error)
    }
  }

  // Get product statistics
  async getProductStatistics() {
    try {
      console.log('🚀 Getting product statistics...')
      
      const url = API_ENDPOINTS.PRODUCTS.STATISTICS
      console.log('📡 Request URL:', url)
      
      const response = await apiService.get(url)
      console.log('📦 Response data:', response.data)
      
      return apiService.constructor.handleApiResponse(response)
    } catch (error) {
      console.error('❌ getProductStatistics error:', error)
      throw apiService.constructor.handleApiError(error)
    }
  }

  // Bulk delete products
  async bulkDeleteProducts(productIds) {
    try {
      console.log('🚀 Bulk deleting products...', productIds)
      
      const response = await apiService.post(API_ENDPOINTS.PRODUCTS.BULK_DELETE, {
        productIds
      })
      
      console.log('📦 Response data:', response.data)
      
      return apiService.constructor.handleApiResponse(response)
    } catch (error) {
      console.error('❌ bulkDeleteProducts error:', error)
      throw apiService.constructor.handleApiError(error)
    }
  }

  // Bulk update status
  async bulkUpdateStatus(productIds, isActive) {
    try {
      console.log('🚀 Bulk updating status...', { productIds, isActive })
      
      const response = await apiService.post(API_ENDPOINTS.PRODUCTS.BULK_STATUS, {
        productIds,
        isActive
      })
      
      console.log('📦 Response data:', response.data)
      
      return apiService.constructor.handleApiResponse(response)
    } catch (error) {
      console.error('❌ bulkUpdateStatus error:', error)
      throw apiService.constructor.handleApiError(error)
    }
  }

  // Search products by query
  async searchProducts(query, params = {}) {
    try {
      console.log(`🚀 Searching products: "${query}"...`)
      
      return await this.getProducts({
        search: query,
        ...params
      })
    } catch (error) {
      console.error('❌ searchProducts error:', error)
      throw error
    }
  }

  // Get product categories
  async getCategories(params = {}) {
    try {
      console.log('🚀 Getting categories...')
      
      const queryParams = new URLSearchParams()
      if (params.page) queryParams.append('page', params.page)
      if (params.limit) queryParams.append('limit', params.limit)
      
      const url = `${API_ENDPOINTS.CATEGORIES.LIST}?${queryParams.toString()}`
      console.log('📡 Request URL:', url)
      
      const response = await apiService.get(url)
      console.log('📦 Response data:', response.data)
      
      return apiService.constructor.handleApiResponse(response)
    } catch (error) {
      console.error('❌ getCategories error:', error)
      throw apiService.constructor.handleApiError(error)
    }
  }
}

export default new ProductService()