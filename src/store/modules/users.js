// /src/store/modules/users.js - User management store
import userService from '@/services/userService'

const state = {
  users: [],
  bannedUsers: [],
  currentUser: null,
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
    role: '',
    status: '',
    verified: ''
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

  SET_USERS(state, users) {
    state.users = users
  },

  SET_BANNED_USERS(state, bannedUsers) {
    state.bannedUsers = bannedUsers
  },

  SET_CURRENT_USER(state, user) {
    state.currentUser = user
  },

  SET_PAGINATION(state, pagination) {
    state.pagination = { ...state.pagination, ...pagination }
  },

  SET_FILTERS(state, filters) {
    state.filters = { ...state.filters, ...filters }
  },

  ADD_USER(state, user) {
    state.users.unshift(user)
  },

  UPDATE_USER(state, updatedUser) {
    const index = state.users.findIndex(u => u.id === updatedUser.id)
    if (index !== -1) {
      state.users.splice(index, 1, updatedUser)
    }
  },

  REMOVE_USER(state, userId) {
    state.users = state.users.filter(u => u.id !== userId)
  },

  REMOVE_USERS(state, userIds) {
    state.users = state.users.filter(u => !userIds.includes(u.id))
  },

  UPDATE_USER_STATUS(state, { userId, isActive }) {
    const user = state.users.find(u => u.id === userId)
    if (user) {
      user.isActive = isActive
    }
  },

  BAN_USER(state, userId) {
    const user = state.users.find(u => u.id === userId)
    if (user) {
      user.isActive = false
    }
  },

  UNBAN_USER(state, userId) {
    const user = state.users.find(u => u.id === userId)
    if (user) {
      user.isActive = true
    }
  },

  RESET_FILTERS(state) {
    state.filters = {
      search: '',
      role: '',
      status: '',
      verified: ''
    }
  }
}

const actions = {
  async fetchUsers({ commit, state }) {
    commit('SET_LOADING', true)
    try {
      const params = {
        page: state.pagination.currentPage,
        limit: state.pagination.itemsPerPage,
        ...state.filters
      }

      const response = await userService.getUsers(params)
      
      if (response.success) {
        commit('SET_USERS', response.data.users || response.data)
        if (response.data.pagination) {
          commit('SET_PAGINATION', response.data.pagination)
        }
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async fetchBannedUsers({ commit }) {
    commit('SET_LOADING', true)
    try {
      const response = await userService.getBannedUsers()
      if (response.success) {
        commit('SET_BANNED_USERS', response.data.bannedUsers || response.data)
      }
    } catch (error) {
      console.error('Failed to fetch banned users:', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async fetchUser({ commit }, userId) {
    commit('SET_LOADING', true)
    try {
      const response = await userService.getUser(userId)
      if (response.success) {
        commit('SET_CURRENT_USER', response.data)
        return response.data
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async createUser({ commit, dispatch }, userData) {
    commit('SET_SUBMITTING', true)
    try {
      const response = await userService.createUser(userData)
      if (response.success) {
        commit('ADD_USER', response.data.user || response.data)
        await dispatch('fetchUsers')
        return response
      }
      throw new Error(response.message || 'Failed to create user')
    } catch (error) {
      console.error('Failed to create user:', error)
      throw error
    } finally {
      commit('SET_SUBMITTING', false)
    }
  },

  async updateUser({ commit, dispatch }, { id, userData }) {
    commit('SET_SUBMITTING', true)
    try {
      const response = await userService.updateUser(id, userData)
      if (response.success) {
        commit('UPDATE_USER', response.data.user || response.data)
        await dispatch('fetchUsers')
        return response
      }
      throw new Error(response.message || 'Failed to update user')
    } catch (error) {
      console.error('Failed to update user:', error)
      throw error
    } finally {
      commit('SET_SUBMITTING', false)
    }
  },

  async deleteUser({ commit }, userId) {
    try {
      const response = await userService.deleteUser(userId)
      if (response.success) {
        commit('REMOVE_USER', userId)
        return response
      } else {
        throw new Error(response.message || 'Failed to delete user')
      }
    } catch (error) {
      console.error('Failed to delete user:', error)
      throw error
    }
  },

  async resetPassword({ commit }, { userId, newPassword }) {
    commit('SET_SUBMITTING', true)
    try {
      const response = await userService.resetPassword(userId, newPassword)
      if (response.success) {
        return response
      }
      throw new Error(response.message || 'Failed to reset password')
    } catch (error) {
      console.error('Failed to reset password:', error)
      throw error
    } finally {
      commit('SET_SUBMITTING', false)
    }
  },

  async banUser({ commit }, { userId, reason, notifyUser = true }) {
    commit('SET_SUBMITTING', true)
    try {
      const response = await userService.banUser(userId, reason, notifyUser)
      if (response.success) {
        commit('BAN_USER', userId)
        return response
      }
      throw new Error(response.message || 'Failed to ban user')
    } catch (error) {
      console.error('Failed to ban user:', error)
      throw error
    } finally {
      commit('SET_SUBMITTING', false)
    }
  },

  async unbanUser({ commit }, { userId, reason, notifyUser = true }) {
    commit('SET_SUBMITTING', true)
    try {
      const response = await userService.unbanUser(userId, reason, notifyUser)
      if (response.success) {
        commit('UNBAN_USER', userId)
        return response
      }
      throw new Error(response.message || 'Failed to unban user')
    } catch (error) {
      console.error('Failed to unban user:', error)
      throw error
    } finally {
      commit('SET_SUBMITTING', false)
    }
  },

  async bulkDeleteUsers({ commit }, userIds) {
    commit('SET_SUBMITTING', true)
    try {
      const response = await userService.bulkDeleteUsers(userIds)
      if (response.success) {
        commit('REMOVE_USERS', userIds)
        return response
      }
      throw new Error(response.message || 'Failed to bulk delete users')
    } catch (error) {
      console.error('Failed to bulk delete users:', error)
      throw error
    } finally {
      commit('SET_SUBMITTING', false)
    }
  },

  async bulkUpdateStatus({ commit }, { userIds, isActive }) {
    commit('SET_SUBMITTING', true)
    try {
      const response = await userService.bulkUpdateStatus(userIds, isActive)
      if (response.success) {
        userIds.forEach(userId => {
          commit('UPDATE_USER_STATUS', { userId, isActive })
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
    dispatch('fetchUsers')
  },

  setPagination({ commit, dispatch }, pagination) {
    commit('SET_PAGINATION', pagination)
    dispatch('fetchUsers')
  },

  resetFilters({ commit, dispatch }) {
    commit('RESET_FILTERS')
    commit('SET_PAGINATION', { currentPage: 1 })
    dispatch('fetchUsers')
  }
}

const getters = {
  users: (state) => state.users,
  bannedUsers: (state) => state.bannedUsers,
  currentUser: (state) => state.currentUser,
  pagination: (state) => state.pagination,
  filters: (state) => state.filters,
  isLoading: (state) => state.isLoading,
  isSubmitting: (state) => state.isSubmitting,
  
  filteredUsers: (state) => {
    return state.users.filter(user => {
      const matchesSearch = !state.filters.search || 
        user.username.toLowerCase().includes(state.filters.search.toLowerCase()) ||
        user.email.toLowerCase().includes(state.filters.search.toLowerCase())
      
      const matchesRole = !state.filters.role || user.role === state.filters.role
      
      const matchesStatus = !state.filters.status || 
        (state.filters.status === 'active' && user.isActive) ||
        (state.filters.status === 'inactive' && !user.isActive)
      
      const matchesVerified = !state.filters.verified ||
        (state.filters.verified === 'verified' && user.isVerified) ||
        (state.filters.verified === 'unverified' && !user.isVerified)
      
      return matchesSearch && matchesRole && matchesStatus && matchesVerified
    })
  },

  activeUsers: (state) => state.users.filter(u => u.isActive),
  inactiveUsers: (state) => state.users.filter(u => !u.isActive),
  verifiedUsers: (state) => state.users.filter(u => u.isVerified),
  unverifiedUsers: (state) => state.users.filter(u => !u.isVerified),
  adminUsers: (state) => state.users.filter(u => u.role === 'admin'),
  regularUsers: (state) => state.users.filter(u => u.role === 'user'),
  
  usersByRole: (state) => {
    const roleMap = {}
    state.users.forEach(user => {
      const role = user.role || 'user'
      if (!roleMap[role]) {
        roleMap[role] = []
      }
      roleMap[role].push(user)
    })
    return roleMap
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}