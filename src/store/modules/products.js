// /src/store/modules/products.js - Updated with new API methods
import productService from '@/services/productService'

const state = {
  products: [],
  categories: [],
  currentProduct: null,
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

  SET_PAGINATION(state, pagination) {
    state.pagination = { ...state.pagination, ...pagination }
  },

  SET_FILTERS(state, filters) {
    state.filters = { ...state.filters, ...filters }
  },

  ADD_PRODUCT(state, product) {
    state.products.unshift(product)
  },

  UPDATE_PRODUCT(state, updatedProduct) {
    const index = state.products.findIndex(p => p.id === updatedProduct.id)
    if (index !== -1) {
      state.products.splice(index, 1, updatedProduct)
    }
  },

  REMOVE_PRODUCT(state, productId) {
    state.products = state.products.filter(p => p.id !== productId)
  },

  REMOVE_PRODUCTS(state, productIds) {
    state.products = state.products.filter(p => !productIds.includes(p.id))
  },

  UPDATE_PRODUCT_STATUS(state, { productId, isActive }) {
    const product = state.products.find(p => p.id === productId)
    if (product) {
      product.isActive = isActive
    }
  },

  UPDATE_PRODUCT_FEATURED(state, { productId, isFeatured }) {
    const product = state.products.find(p => p.id === productId)
    if (product) {
      product.isFeatured = isFeatured
    }
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
      // Remove client-side filtering from API params since we'll do it on frontend
      const params = {
        page: state.pagination.currentPage,
        limit: state.pagination.itemsPerPage
        // Remove filters - we'll handle search and category on frontend
      }

      const response = await productService.getProducts(params)
      
      if (response.success) {
        commit('SET_PRODUCTS', response.data)
        if (response.meta && response.meta.pagination) {
          commit('SET_PAGINATION', response.meta.pagination)
        }
      }
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
        commit('SET_CATEGORIES', response.data)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
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
    } catch (error) {
      console.error('Failed to fetch product:', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
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

  async deleteProduct({ commit }, productId) {
    try {
      const response = await productService.deleteProduct(productId)
      if (response.success) {
        commit('REMOVE_PRODUCT', productId)
        return response
      } else {
        throw new Error(response.message || 'Failed to delete product')
      }
    } catch (error) {
      console.error('Failed to delete product:', error)
      throw error
    }
  },

  async bulkDeleteProducts({ commit }, productIds) {
    commit('SET_SUBMITTING', true)
    try {
      const response = await productService.bulkDeleteProducts(productIds)
      if (response.success) {
        commit('REMOVE_PRODUCTS', productIds)
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

  async toggleProductStatus({ commit }, productId) {
    try {
      const response = await productService.toggleProductStatus(productId)
      if (response.success) {
        const updatedProduct = response.data
        commit('UPDATE_PRODUCT_STATUS', { 
          productId, 
          isActive: updatedProduct.isActive 
        })
        return response
      }
      throw new Error(response.message || 'Failed to toggle product status')
    } catch (error) {
      console.error('Failed to toggle product status:', error)
      throw error
    }
  },

  async toggleFeaturedStatus({ commit }, productId) {
    try {
      const response = await productService.toggleFeaturedStatus(productId)
      if (response.success) {
        const updatedProduct = response.data
        commit('UPDATE_PRODUCT_FEATURED', { 
          productId, 
          isFeatured: updatedProduct.isFeatured 
        })
        return response
      }
      throw new Error(response.message || 'Failed to toggle featured status')
    } catch (error) {
      console.error('Failed to toggle featured status:', error)
      throw error
    }
  },

  async bulkUpdateStatus({ commit }, { productIds, isActive }) {
    commit('SET_SUBMITTING', true)
    try {
      const response = await productService.bulkUpdateStatus(productIds, isActive)
      if (response.success) {
        productIds.forEach(productId => {
          commit('UPDATE_PRODUCT_STATUS', { productId, isActive })
        })
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
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}