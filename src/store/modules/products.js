// /src/store/modules/products.js - Fixed with proper API integration
import productService from '@/services/productService'

const state = {
  products: [],
  categories: [],
  currentProduct: null,
  statistics: {
    totalProducts: 0,
    activeProducts: 0,
    featuredProducts: 0,
    outOfStockProducts: 0,
    topViewedProducts: [],
    productsByCategory: []
  },
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
    category: '',
    status: '',
    featured: ''
  },
  isLoading: false,
  isSubmitting: false
}

const mutations = {
  SET_LOADING(state, loading) {
    state.isLoading = loading
  },

  SET_SUBMITTING(state, submitting) {
    state.isSubmitting = submitting
  },

  SET_PRODUCTS(state, products) {
    state.products = products
  },

  SET_CATEGORIES(state, categories) {
    state.categories = categories
  },

  SET_CURRENT_PRODUCT(state, product) {
    state.currentProduct = product
  },

  SET_STATISTICS(state, statistics) {
    state.statistics = { ...state.statistics, ...statistics }
  },

  SET_PAGINATION(state, pagination) {
    state.pagination = { ...state.pagination, ...pagination }
  },

  SET_FILTERS(state, filters) {
    state.filters = { ...state.filters, ...filters }
  },

  ADD_PRODUCT(state, product) {
    state.products.unshift(product)
    // Update statistics
    state.statistics.totalProducts += 1
    if (product.isActive) state.statistics.activeProducts += 1
    if (product.isFeatured) state.statistics.featuredProducts += 1
  },

  UPDATE_PRODUCT(state, updatedProduct) {
    const index = state.products.findIndex(p => p.id === updatedProduct.id)
    if (index !== -1) {
      // Store old values for statistics update
      const oldProduct = state.products[index]
      
      // Update product
      state.products.splice(index, 1, updatedProduct)
      
      // Update statistics
      if (oldProduct.isActive !== updatedProduct.isActive) {
        state.statistics.activeProducts += updatedProduct.isActive ? 1 : -1
      }
      if (oldProduct.isFeatured !== updatedProduct.isFeatured) {
        state.statistics.featuredProducts += updatedProduct.isFeatured ? 1 : -1
      }
    }
    
    // Update current product if it's the same
    if (state.currentProduct && state.currentProduct.id === updatedProduct.id) {
      state.currentProduct = updatedProduct
    }
  },

  REMOVE_PRODUCT(state, productId) {
    const productIndex = state.products.findIndex(p => p.id === productId)
    if (productIndex !== -1) {
      const product = state.products[productIndex]
      state.products.splice(productIndex, 1)
      
      // Update statistics
      state.statistics.totalProducts -= 1
      if (product.isActive) state.statistics.activeProducts -= 1
      if (product.isFeatured) state.statistics.featuredProducts -= 1
    }
  },

  REMOVE_PRODUCTS(state, productIds) {
    const productsToRemove = state.products.filter(p => productIds.includes(p.id))
    state.products = state.products.filter(p => !productIds.includes(p.id))
    
    // Update statistics
    state.statistics.totalProducts -= productsToRemove.length
    state.statistics.activeProducts -= productsToRemove.filter(p => p.isActive).length
    state.statistics.featuredProducts -= productsToRemove.filter(p => p.isFeatured).length
  },

  UPDATE_PRODUCT_STATUS(state, { productId, isActive }) {
    const product = state.products.find(p => p.id === productId)
    if (product) {
      const wasActive = product.isActive
      product.isActive = isActive
      
      // Update statistics
      if (wasActive !== isActive) {
        state.statistics.activeProducts += isActive ? 1 : -1
      }
    }
  },

  UPDATE_PRODUCT_FEATURED(state, { productId, isFeatured }) {
    const product = state.products.find(p => p.id === productId)
    if (product) {
      const wasFeatured = product.isFeatured
      product.isFeatured = isFeatured
      
      // Update statistics
      if (wasFeatured !== isFeatured) {
        state.statistics.featuredProducts += isFeatured ? 1 : -1
      }
    }
  },

  BULK_UPDATE_STATUS(state, { productIds, isActive }) {
    productIds.forEach(productId => {
      const product = state.products.find(p => p.id === productId)
      if (product) {
        const wasActive = product.isActive
        product.isActive = isActive
        
        // Update statistics
        if (wasActive !== isActive) {
          state.statistics.activeProducts += isActive ? 1 : -1
        }
      }
    })
  },

  RESET_FILTERS(state) {
    state.filters = {
      search: '',
      category: '',
      status: '',
      featured: ''
    }
  }
}

const actions = {
  async fetchProducts({ commit, state }) {
    commit('SET_LOADING', true)
    try {
      const params = {
        page: state.pagination.currentPage,
        limit: state.pagination.itemsPerPage,
        ...state.filters
      }

      // Remove empty filter values
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key]
      })

      const response = await productService.getProducts(params)
      
      if (response.success) {
        commit('SET_PRODUCTS', response.data || [])
        if (response.meta && response.meta.pagination) {
          commit('SET_PAGINATION', response.meta.pagination)
        }
      }
      
      return response
    } catch (error) {
      console.error('Failed to fetch products:', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async fetchCategories({ commit }) {
    try {
      const response = await productService.getCategories()
      if (response.success) {
        commit('SET_CATEGORIES', response.data || [])
      }
      return response
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      throw error
    }
  },

  async fetchProduct({ commit }, productId) {
    commit('SET_LOADING', true)
    try {
      const response = await productService.getProduct(productId)
      if (response.success) {
        commit('SET_CURRENT_PRODUCT', response.data)
        return response.data
      }
      throw new Error(response.message || 'Failed to fetch product')
    } catch (error) {
      console.error('Failed to fetch product:', error)
      // Don't set current product if failed, let the UI handle the error
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async fetchStatistics({ commit }) {
    try {
      const response = await productService.getProductStatistics()
      if (response.success) {
        commit('SET_STATISTICS', response.data)
      }
      return response
    } catch (error) {
      console.error('Failed to fetch statistics:', error)
      throw error
    }
  },

  async createProduct({ commit, dispatch }, productData) {
    commit('SET_SUBMITTING', true)
    try {
      const response = await productService.createProduct(productData)
      if (response.success) {
        commit('ADD_PRODUCT', response.data)
        // Refresh the product list to get updated data
        await dispatch('fetchProducts')
        await dispatch('fetchStatistics')
        return response
      }
      throw new Error(response.message || 'Failed to create product')
    } catch (error) {
      console.error('Failed to create product:', error)
      throw error
    } finally {
      commit('SET_SUBMITTING', false)
    }
  },

  async updateProduct({ commit, dispatch }, { id, productData }) {
    commit('SET_SUBMITTING', true)
    try {
      const response = await productService.updateProduct(id, productData)
      if (response.success) {
        commit('UPDATE_PRODUCT', response.data)
        // Refresh the product list to get updated data
        await dispatch('fetchProducts')
        await dispatch('fetchStatistics')
        return response
      }
      throw new Error(response.message || 'Failed to update product')
    } catch (error) {
      console.error('Failed to update product:', error)
      throw error
    } finally {
      commit('SET_SUBMITTING', false)
    }
  },

  async deleteProduct({ commit, dispatch }, productId) {
    try {
      const response = await productService.deleteProduct(productId)
      if (response.success) {
        commit('REMOVE_PRODUCT', productId)
        await dispatch('fetchStatistics')
        return response
      } else {
        throw new Error(response.message || 'Failed to delete product')
      }
    } catch (error) {
      console.error('Failed to delete product:', error)
      throw error
    }
  },

  async bulkDeleteProducts({ commit, dispatch }, productIds) {
    commit('SET_SUBMITTING', true)
    try {
      const response = await productService.bulkDeleteProducts(productIds)
      if (response.success) {
        commit('REMOVE_PRODUCTS', productIds)
        await dispatch('fetchStatistics')
        return response
      }
      throw new Error(response.message || 'Failed to bulk delete products')
    } catch (error) {
      console.error('Failed to bulk delete products:', error)
      throw error
    } finally {
      commit('SET_SUBMITTING', false)
    }
  },

  async toggleProductStatus({ commit, dispatch }, productId) {
    try {
      const response = await productService.toggleProductStatus(productId)
      if (response.success) {
        const updatedProduct = response.data
        commit('UPDATE_PRODUCT_STATUS', { 
          productId, 
          isActive: updatedProduct.isActive 
        })
        // Update the product in the list as well
        commit('UPDATE_PRODUCT', updatedProduct)
        await dispatch('fetchStatistics')
        return response
      }
      throw new Error(response.message || 'Failed to toggle product status')
    } catch (error) {
      console.error('Failed to toggle product status:', error)
      throw error
    }
  },

  async toggleFeaturedStatus({ commit, dispatch }, productId) {
    try {
      const response = await productService.toggleFeaturedStatus(productId)
      if (response.success) {
        const updatedProduct = response.data
        commit('UPDATE_PRODUCT_FEATURED', { 
          productId, 
          isFeatured: updatedProduct.isFeatured 
        })
        // Update the product in the list as well
        commit('UPDATE_PRODUCT', updatedProduct)
        await dispatch('fetchStatistics')
        return response
      }
      throw new Error(response.message || 'Failed to toggle featured status')
    } catch (error) {
      console.error('Failed to toggle featured status:', error)
      throw error
    }
  },

  async bulkUpdateStatus({ commit, dispatch }, { productIds, isActive }) {
    commit('SET_SUBMITTING', true)
    try {
      const response = await productService.bulkUpdateStatus(productIds, isActive)
      if (response.success) {
        commit('BULK_UPDATE_STATUS', { productIds, isActive })
        await dispatch('fetchStatistics')
        return response
      }
      throw new Error(response.message || 'Failed to bulk update status')
    } catch (error) {
      console.error('Failed to bulk update status:', error)
      throw error
    } finally {
      commit('SET_SUBMITTING', false)
    }
  },

  setFilters({ commit, dispatch }, filters) {
    commit('SET_FILTERS', filters)
    commit('SET_PAGINATION', { currentPage: 1 })
    dispatch('fetchProducts')
  },

  setPagination({ commit, dispatch }, pagination) {
    commit('SET_PAGINATION', pagination)
    dispatch('fetchProducts')
  },

  resetFilters({ commit, dispatch }) {
    commit('RESET_FILTERS')
    commit('SET_PAGINATION', { currentPage: 1 })
    dispatch('fetchProducts')
  }
}

const getters = {
  products: (state) => state.products,
  categories: (state) => state.categories,
  currentProduct: (state) => state.currentProduct,
  statistics: (state) => state.statistics,
  pagination: (state) => state.pagination,
  filters: (state) => state.filters,
  isLoading: (state) => state.isLoading,
  isSubmitting: (state) => state.isSubmitting,
  
  filteredProducts: (state) => {
    return state.products.filter(product => {
      const matchesSearch = !state.filters.search || 
        product.title.toLowerCase().includes(state.filters.search.toLowerCase()) ||
        product.description.toLowerCase().includes(state.filters.search.toLowerCase())
      
      const matchesCategory = !state.filters.category || 
        product.categoryId.toString() === state.filters.category
      
      const matchesStatus = !state.filters.status || 
        (state.filters.status === 'active' && product.isActive) ||
        (state.filters.status === 'inactive' && !product.isActive)
      
      const matchesFeatured = !state.filters.featured ||
        (state.filters.featured === 'featured' && product.isFeatured) ||
        (state.filters.featured === 'not_featured' && !product.isFeatured)
      
      return matchesSearch && matchesCategory && matchesStatus && matchesFeatured
    })
  },

  activeProducts: (state) => state.products.filter(p => p.isActive),
  inactiveProducts: (state) => state.products.filter(p => !p.isActive),
  featuredProducts: (state) => state.products.filter(p => p.isFeatured),
  
  productsByCategory: (state) => {
    const categoryMap = {}
    state.products.forEach(product => {
      const categoryName = product.category?.name || 'Uncategorized'
      if (!categoryMap[categoryName]) {
        categoryMap[categoryName] = []
      }
      categoryMap[categoryName].push(product)
    })
    return categoryMap
  },

  totalProducts: (state) => state.statistics.totalProducts,
  activeProductsCount: (state) => state.statistics.activeProducts,
  featuredProductsCount: (state) => state.statistics.featuredProducts,
  outOfStockProductsCount: (state) => state.statistics.outOfStockProducts,
  topViewedProducts: (state) => state.statistics.topViewedProducts,
  productsCategoryBreakdown: (state) => state.statistics.productsByCategory
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}