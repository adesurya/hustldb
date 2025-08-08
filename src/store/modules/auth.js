import apiService from '@/services/apiService'

const state = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isLoading: false
}

const mutations = {
  SET_LOADING (state, loading) {
    state.isLoading = loading
  },
  
  SET_USER (state, user) {
    state.user = user
    localStorage.setItem('user', JSON.stringify(user))
  },
  
  SET_TOKEN (state, token) {
    state.token = token
    localStorage.setItem('token', token)
    apiService.setAuthToken(token)
  },
  
  CLEAR_AUTH (state) {
    state.user = null
    state.token = null
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    apiService.setAuthToken(null)
  }
}

const actions = {
  async login ({ commit }, credentials) {
    try {
      commit('SET_LOADING', true)
      
      console.log('Making login request to API...')
      
      const payload = {
        identifier: credentials.email,
        password: credentials.password
      }
      
      console.log('Login payload:', {
        identifier: payload.identifier,
        password: '***' // Hide password in logs
      })
      
      const response = await apiService.post('/api/v1/auth/login', payload)
      
      console.log('Login response status:', response.status)
      console.log('Login response data:', response.data)

      if (response.data && response.data.success) {
        const { user, accessToken } = response.data.data
        
        console.log('Login successful, saving user and token')
        
        commit('SET_USER', user)
        commit('SET_TOKEN', accessToken)
        
        return { success: true }
      } else {
        console.error('Login API returned success=false:', response.data)
        return { 
          success: false, 
          message: response.data?.message || 'Login failed - invalid response' 
        }
      }
    } catch (error) {
      console.error('Login error details:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL
        }
      })
      
      let message = 'Login failed. Please check your credentials.'
      
      if (error.response?.data?.message) {
        message = error.response.data.message
      } else if (error.response?.status === 401) {
        message = 'Invalid email or password.'
      } else if (error.response?.status === 422) {
        message = 'Invalid input data. Please check your email and password.'
      } else if (error.response?.status >= 500) {
        message = 'Server error. Please try again later.'
      } else if (error.code === 'ERR_NETWORK') {
        message = 'Network error. Please check your connection.'
      } else if (error.code === 'ECONNABORTED') {
        message = 'Request timeout. Please try again.'
      }
      
      return { success: false, message }
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  async logout ({ commit }) {
    try {
      // Call logout API
      await apiService.post('/api/v1/auth/logout')
    } catch (error) {
      console.error('Logout API error:', error)
      // Continue with local logout even if API fails
    } finally {
      // Always clear local auth data
      commit('CLEAR_AUTH')
    }
  },
  
  initializeAuth ({ commit }) {
    const token = localStorage.getItem('token')
    if (token) {
      apiService.setAuthToken(token)
    }
  }
}

const getters = {
  isAuthenticated: (state) => !!state.token,
  user: (state) => state.user,
  isLoading: (state) => state.isLoading
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}