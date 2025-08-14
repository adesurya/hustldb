// /src/services/categoryService.js - Category service with proper authentication and API endpoints
import apiService from '@/services/apiService'
import { API_ENDPOINTS } from '@/config/api'

class CategoryService {
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

  // Get all categories with pagination and filters
  async getCategories(params = {}) {
    try {
      console.log('🚀 Getting categories...')
      
      const queryParams = new URLSearchParams()
      if (params.page) queryParams.append('page', params.page)
      if (params.limit) queryParams.append('limit', params.limit)
      if (params.search) queryParams.append('search', params.search)
      if (params.status) queryParams.append('status', params.status)
      if (params.sort) queryParams.append('sort', params.sort)
      
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

  // Get single category by ID
  async getCategory(id) {
    try {
      console.log(`🚀 Getting category ${id}...`)
      
      const url = this.buildUrl(API_ENDPOINTS.CATEGORIES.DETAIL, { id })
      console.log('📡 Request URL:', url)
      
      const response = await apiService.get(url)
      console.log('📦 Response data:', response.data)
      
      return apiService.constructor.handleApiResponse(response)
    } catch (error) {
      console.error('❌ getCategory error:', error)
      throw apiService.constructor.handleApiError(error)
    }
  }

  // Create new category
  async createCategory(categoryData) {
    try {
      console.log('🚀 Creating category...', categoryData)
      
      const requestData = {
        name: categoryData.name,
        slug: categoryData.slug || this.generateSlug(categoryData.name),
        description: categoryData.description,
        isActive: categoryData.isActive !== undefined ? categoryData.isActive : true,
        sortOrder: categoryData.sortOrder || 0
      }
      
      console.log('📡 Request URL:', API_ENDPOINTS.CATEGORIES.CREATE)
      console.log('📦 Request data:', requestData)
      
      const response = await apiService.post(API_ENDPOINTS.CATEGORIES.CREATE, requestData)
      
      console.log('📦 Response data:', response.data)
      
      return apiService.constructor.handleApiResponse(response)
    } catch (error) {
      console.error('❌ createCategory error:', error)
      throw apiService.constructor.handleApiError(error)
    }
  }

  // Update existing category
  async updateCategory(id, categoryData) {
    try {
      console.log(`🚀 Updating category ${id}...`, categoryData)
      
      const requestData = {
        name: categoryData.name,
        description: categoryData.description,
        isActive: categoryData.isActive !== undefined ? categoryData.isActive : true,
        sortOrder: categoryData.sortOrder || 0
      }

      // Only include slug if it's provided and different
      if (categoryData.slug && categoryData.slug !== categoryData.originalSlug) {
        requestData.slug = categoryData.slug
      }
      
      const url = this.buildUrl(API_ENDPOINTS.CATEGORIES.UPDATE, { id })
      console.log('📡 Request URL:', url)
      console.log('📦 Request data:', requestData)
      
      const response = await apiService.put(url, requestData)
      
      console.log('📦 Response data:', response.data)
      
      return apiService.constructor.handleApiResponse(response)
    } catch (error) {
      console.error('❌ updateCategory error:', error)
      throw apiService.constructor.handleApiError(error)
    }
  }

  // Delete category
  async deleteCategory(id) {
    try {
      console.log(`🚀 Deleting category ${id}...`)
      
      const url = this.buildUrl(API_ENDPOINTS.CATEGORIES.DELETE, { id })
      console.log('📡 Request URL:', url)
      
      const response = await apiService.delete(url)
      console.log('📦 Response data:', response.data)
      
      return apiService.constructor.handleApiResponse(response)
    } catch (error) {
      console.error('❌ deleteCategory error:', error)
      throw apiService.constructor.handleApiError(error)
    }
  }

  // Toggle category status (active/inactive)
  async toggleCategoryStatus(id) {
    try {
      console.log(`🚀 Toggling category status ${id}...`)
      
      // Since there's no specific toggle endpoint, we'll get the category first
      const categoryResponse = await this.getCategory(id)
      if (!categoryResponse.success) {
        throw new Error('Failed to get category details')
      }
      
      const category = categoryResponse.data
      const newStatus = !category.isActive
      
      // Update with new status
      const response = await this.updateCategory(id, {
        ...category,
        isActive: newStatus
      })
      
      return response
    } catch (error) {
      console.error('❌ toggleCategoryStatus error:', error)
      throw apiService.constructor.handleApiError(error)
    }
  }

  // Bulk delete categories
  async bulkDeleteCategories(categoryIds) {
    try {
      console.log('🚀 Bulk deleting categories...', categoryIds)
      
      // Since there's no bulk delete endpoint, delete one by one
      const results = []
      for (const id of categoryIds) {
        try {
          const result = await this.deleteCategory(id)
          results.push({ id, success: true, result })
        } catch (error) {
          results.push({ id, success: false, error })
        }
      }
      
      const successCount = results.filter(r => r.success).length
      const failCount = results.length - successCount
      
      return {
        success: failCount === 0,
        message: `${successCount} categories deleted successfully${failCount > 0 ? `, ${failCount} failed` : ''}`,
        data: results
      }
    } catch (error) {
      console.error('❌ bulkDeleteCategories error:', error)
      throw apiService.constructor.handleApiError(error)
    }
  }

  // Bulk update status
  async bulkUpdateStatus(categoryIds, isActive) {
    try {
      console.log('🚀 Bulk updating status...', { categoryIds, isActive })
      
      // Since there's no bulk update endpoint, update one by one
      const results = []
      for (const id of categoryIds) {
        try {
          // Get category first
          const categoryResponse = await this.getCategory(id)
          if (categoryResponse.success) {
            const category = categoryResponse.data
            const result = await this.updateCategory(id, {
              ...category,
              isActive
            })
            results.push({ id, success: true, result })
          } else {
            results.push({ id, success: false, error: 'Category not found' })
          }
        } catch (error) {
          results.push({ id, success: false, error })
        }
      }
      
      const successCount = results.filter(r => r.success).length
      const failCount = results.length - successCount
      
      return {
        success: failCount === 0,
        message: `${successCount} categories updated successfully${failCount > 0 ? `, ${failCount} failed` : ''}`,
        data: results
      }
    } catch (error) {
      console.error('❌ bulkUpdateStatus error:', error)
      throw apiService.constructor.handleApiError(error)
    }
  }

  // Search categories by query
  async searchCategories(query, params = {}) {
    try {
      console.log(`🚀 Searching categories: "${query}"...`)
      
      return await this.getCategories({
        search: query,
        ...params
      })
    } catch (error) {
      console.error('❌ searchCategories error:', error)
      throw error
    }
  }

  // Generate slug from name
  generateSlug(name) {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
  }

  // Validate category data
  validateCategoryData(data) {
    const errors = {}

    if (!data.name || !data.name.trim()) {
      errors.name = 'Category name is required'
    } else if (data.name.trim().length < 2) {
      errors.name = 'Category name must be at least 2 characters'
    } else if (data.name.trim().length > 100) {
      errors.name = 'Category name must not exceed 100 characters'
    }

    if (data.description && data.description.length > 500) {
      errors.description = 'Description must not exceed 500 characters'
    }

    if (data.sortOrder !== undefined && data.sortOrder !== null) {
      if (isNaN(data.sortOrder) || data.sortOrder < 0) {
        errors.sortOrder = 'Sort order must be a positive number'
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }
}

export default new CategoryService()