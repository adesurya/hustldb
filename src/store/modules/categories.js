// /src/store/modules/categories.js - Category Vuex store module
import categoryService from '@/services/categoryService'

const state = {
  categories: [],
  currentCategory: null,
  statistics: {
    totalCategories: 0,
    activeCategories: 0,
    inactiveCategories: 0,
    topCategories: []
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
    status: '',
    sort: 'name'
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

  SET_CATEGORIES(state, categories) {
    state.categories = categories
  },

  SET_CURRENT_CATEGORY(state, category) {
    state.currentCategory = category
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

  ADD_CATEGORY(state, category) {
    state.categories.unshift(category)
    // Update statistics
    state.statistics.totalCategories += 1
    if (category.isActive) state.statistics.activeCategories += 1
    else state.statistics.inactiveCategories += 1
  },

  UPDATE_CATEGORY(state, updatedCategory) {
    const index = state.categories.findIndex(c => c.id === updatedCategory.id)
    if (index !== -1) {
      // Store old values for statistics update
      const oldCategory = state.categories[index]
      
      // Update category
      state.categories.splice(index, 1, updatedCategory)
      
      // Update statistics
      if (oldCategory.isActive !== updatedCategory.isActive) {
        if (updatedCategory.isActive) {
          state.statistics.activeCategories += 1
          state.statistics.inactiveCategories -= 1
        } else {
          state.statistics.activeCategories -= 1
          state.statistics.inactiveCategories += 1
        }
      }
    }
    
    // Update current category if it's the same
    if (state.currentCategory && state.currentCategory.id === updatedCategory.id) {
      state.currentCategory = updatedCategory
    }
  },

  REMOVE_CATEGORY(state, categoryId) {
    const categoryIndex = state.categories.findIndex(c => c.id === categoryId)
    if (categoryIndex !== -1) {
      const category = state.categories[categoryIndex]
      state.categories.splice(categoryIndex, 1)
      
      // Update statistics
      state.statistics.totalCategories -= 1
      if (category.isActive) state.statistics.activeCategories -= 1
      else state.statistics.inactiveCategories -= 1
    }
  },

  REMOVE_CATEGORIES(state, categoryIds) {
    const categoriesToRemove = state.categories.filter(c => categoryIds.includes(c.id))
    state.categories = state.categories.filter(c => !categoryIds.includes(c.id))
    
    // Update statistics
    state.statistics.totalCategories -= categoriesToRemove.length
    state.statistics.activeCategories -= categoriesToRemove.filter(c => c.isActive).length
    state.statistics.inactiveCategories -= categoriesToRemove.filter(c => !c.isActive).length
  },

  UPDATE_CATEGORY_STATUS(state, { categoryId, isActive }) {
    const category = state.categories.find(c => c.id === categoryId)
    if (category) {
      const wasActive = category.isActive
      category.isActive = isActive
      
      // Update statistics
      if (wasActive !== isActive) {
        if (isActive) {
          state.statistics.activeCategories += 1
          state.statistics.inactiveCategories -= 1
        } else {
          state.statistics.activeCategories -= 1
          state.statistics.inactiveCategories += 1
        }
      }
    }
  },

  BULK_UPDATE_STATUS(state, { categoryIds, isActive }) {
    categoryIds.forEach(categoryId => {
      const category = state.categories.find(c => c.id === categoryId)
      if (category) {
        const wasActive = category.isActive
        category.isActive = isActive
        
        // Update statistics
        if (wasActive !== isActive) {
          if (isActive) {
            state.statistics.activeCategories += 1
            state.statistics.inactiveCategories -= 1
          } else {
            state.statistics.activeCategories -= 1
            state.statistics.inactiveCategories += 1
          }
        }
      }
    })
  },

  CALCULATE_STATISTICS(state) {
    const totalCategories = state.categories.length
    const activeCategories = state.categories.filter(c => c.isActive).length
    const inactiveCategories = totalCategories - activeCategories
    
    state.statistics = {
      ...state.statistics,
      totalCategories,
      activeCategories,
      inactiveCategories
    }
  },

  RESET_FILTERS(state) {
    state.filters = {
      search: '',
      status: '',
      sort: 'name'
    }
  }
}

const actions = {
  async fetchCategories({ commit, state }) {
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

      const response = await categoryService.getCategories(params)
      
      if (response.success) {
        commit('SET_CATEGORIES', response.data || [])
        if (response.meta && response.meta.pagination) {
          commit('SET_PAGINATION', response.meta.pagination)
        }
        // Calculate statistics after setting categories
        commit('CALCULATE_STATISTICS')
      }
      
      return response
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async fetchCategory({ commit }, categoryId) {
    commit('SET_LOADING', true)
    try {
      const response = await categoryService.getCategory(categoryId)
      if (response.success) {
        commit('SET_CURRENT_CATEGORY', response.data)
        return response.data
      }
      throw new Error(response.message || 'Failed to fetch category')
    } catch (error) {
      console.error('Failed to fetch category:', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async createCategory({ commit, dispatch }, categoryData) {
    commit('SET_SUBMITTING', true)
    try {
      // Validate data
      const validation = categoryService.validateCategoryData(categoryData)
      if (!validation.isValid) {
        throw new Error(Object.values(validation.errors)[0])
      }

      const response = await categoryService.createCategory(categoryData)
      if (response.success) {
        commit('ADD_CATEGORY', response.data)
        // Refresh the category list to get updated data
        await dispatch('fetchCategories')
        return response
      }
      throw new Error(response.message || 'Failed to create category')
    } catch (error) {
      console.error('Failed to create category:', error)
      throw error
    } finally {
      commit('SET_SUBMITTING', false)
    }
  },

  async updateCategory({ commit, dispatch }, { id, categoryData }) {
    commit('SET_SUBMITTING', true)
    try {
      // Validate data
      const validation = categoryService.validateCategoryData(categoryData)
      if (!validation.isValid) {
        throw new Error(Object.values(validation.errors)[0])
      }

      const response = await categoryService.updateCategory(id, categoryData)
      if (response.success) {
        commit('UPDATE_CATEGORY', response.data)
        // Refresh the category list to get updated data
        await dispatch('fetchCategories')
        return response
      }
      throw new Error(response.message || 'Failed to update category')
    } catch (error) {
      console.error('Failed to update category:', error)
      throw error
    } finally {
      commit('SET_SUBMITTING', false)
    }
  },

  async deleteCategory({ commit, dispatch }, categoryId) {
    try {
      const response = await categoryService.deleteCategory(categoryId)
      if (response.success) {
        commit('REMOVE_CATEGORY', categoryId)
        return response
      } else {
        throw new Error(response.message || 'Failed to delete category')
      }
    } catch (error) {
      console.error('Failed to delete category:', error)
      throw error
    }
  },

  async bulkDeleteCategories({ commit, dispatch }, categoryIds) {
    commit('SET_SUBMITTING', true)
    try {
      const response = await categoryService.bulkDeleteCategories(categoryIds)
      if (response.success) {
        commit('REMOVE_CATEGORIES', categoryIds)
        return response
      }
      throw new Error(response.message || 'Failed to bulk delete categories')
    } catch (error) {
      console.error('Failed to bulk delete categories:', error)
      throw error
    } finally {
      commit('SET_SUBMITTING', false)
    }
  },

  async toggleCategoryStatus({ commit, dispatch }, categoryId) {
    try {
      const response = await categoryService.toggleCategoryStatus(categoryId)
      if (response.success) {
        const updatedCategory = response.data
        commit('UPDATE_CATEGORY_STATUS', { 
          categoryId, 
          isActive: updatedCategory.isActive 
        })
        // Update the category in the list as well
        commit('UPDATE_CATEGORY', updatedCategory)
        return response
      }
      throw new Error(response.message || 'Failed to toggle category status')
    } catch (error) {
      console.error('Failed to toggle category status:', error)
      throw error
    }
  },

  async bulkUpdateStatus({ commit, dispatch }, { categoryIds, isActive }) {
    commit('SET_SUBMITTING', true)
    try {
      const response = await categoryService.bulkUpdateStatus(categoryIds, isActive)
      if (response.success) {
        commit('BULK_UPDATE_STATUS', { categoryIds, isActive })
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
    dispatch('fetchCategories')
  },

  setPagination({ commit, dispatch }, pagination) {
    commit('SET_PAGINATION', pagination)
    dispatch('fetchCategories')
  },

  resetFilters({ commit, dispatch }) {
    commit('RESET_FILTERS')
    commit('SET_PAGINATION', { currentPage: 1 })
    dispatch('fetchCategories')
  }
}

const getters = {
  categories: (state) => state.categories,
  currentCategory: (state) => state.currentCategory,
  statistics: (state) => state.statistics,
  pagination: (state) => state.pagination,
  filters: (state) => state.filters,
  isLoading: (state) => state.isLoading,
  isSubmitting: (state) => state.isSubmitting,
  
  filteredCategories: (state) => {
    return state.categories.filter(category => {
      const matchesSearch = !state.filters.search || 
        category.name.toLowerCase().includes(state.filters.search.toLowerCase()) ||
        (category.description && category.description.toLowerCase().includes(state.filters.search.toLowerCase()))
      
      const matchesStatus = !state.filters.status || 
        (state.filters.status === 'active' && category.isActive) ||
        (state.filters.status === 'inactive' && !category.isActive)
      
      return matchesSearch && matchesStatus
    })
  },

  activeCategories: (state) => state.categories.filter(c => c.isActive),
  inactiveCategories: (state) => state.categories.filter(c => !c.isActive),
  
  sortedCategories: (state, getters) => {
    const categories = [...getters.filteredCategories]
    
    switch (state.filters.sort) {
      case 'name':
        return categories.sort((a, b) => a.name.localeCompare(b.name))
      case 'created':
        return categories.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      case 'updated':
        return categories.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      case 'sortOrder':
        return categories.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
      default:
        return categories
    }
  },

  totalCategories: (state) => state.statistics.totalCategories,
  activeCategoriesCount: (state) => state.statistics.activeCategories,
  inactiveCategoriesCount: (state) => state.statistics.inactiveCategories
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}