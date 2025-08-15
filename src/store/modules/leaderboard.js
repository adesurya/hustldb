// /src/store/modules/leaderboard.js - Leaderboard Vuex store module
import leaderboardService from '@/services/leaderboardService'

const state = {
  // Leaderboard data
  leaderboards: {
    daily: {
      type: 'daily',
      date: null,
      total_participants: 0,
      leaderboard: []
    },
    monthly: {
      type: 'monthly',
      year: null,
      month: null,
      month_name: null,
      total_participants: 0,
      leaderboard: []
    },
    all_time: {
      type: 'all_time',
      total_participants: 0,
      leaderboard: []
    }
  },
  
  // User rankings
  userRankings: {
    daily: null,
    monthly: null,
    all_time: null
  },
  
  // Metadata
  metadata: {
    generated_at: null,
    target_date: null,
    target_month: null
  },
  
  // Points statistics
  pointsStatistics: {
    systemOverview: {
      totalTransactions: 0,
      totalPointsAwarded: 0,
      totalPointsRedeemed: 0,
      activeUsers: 0,
      netPointsInCirculation: 0
    },
    totalPointsInUserBalances: 0,
    transactionsByActivity: [],
    activityStatistics: [],
    topPointUsers: [],
    consistencyCheck: {
      calculatedTotal: 0,
      actualTotal: 0,
      isConsistent: false,
      usersWithBalanceIssues: 0,
      balanceIssues: []
    }
  },
  
  // Point transactions
  pointTransactions: [],
  transactionsPagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  },
  
  // Selected user for transactions view
  selectedUser: null,
  userTransactions: [],
  userTransactionsPagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  },
  
  // Current view settings
  currentPeriod: 'all_time', // all_time, monthly, daily
  currentDate: null,
  currentYear: null,
  currentMonth: null,
  
  // Loading states
  isLoading: false,
  isLoadingStatistics: false,
  isLoadingTransactions: false,
  isSubmitting: false,
  
  // Filters for transactions
  transactionFilters: {
    userId: '',
    transactionType: '', // credit, debit
    activityType: '', // DAILY_LOGIN, PRODUCT_SHARE, etc.
    status: '', // completed, pending, failed
    startDate: '',
    endDate: ''
  }
}

const mutations = {
  SET_LOADING(state, loading) {
    state.isLoading = loading
  },

  SET_LOADING_STATISTICS(state, loading) {
    state.isLoadingStatistics = loading
  },

  SET_LOADING_TRANSACTIONS(state, loading) {
    state.isLoadingTransactions = loading
  },

  SET_SUBMITTING(state, submitting) {
    state.isSubmitting = submitting
  },

  SET_LEADERBOARDS(state, data) {
    if (data.leaderboards) {
      state.leaderboards = { ...state.leaderboards, ...data.leaderboards }
    }
    if (data.user_rankings) {
      state.userRankings = { ...state.userRankings, ...data.user_rankings }
    }
    if (data.metadata) {
      state.metadata = { ...state.metadata, ...data.metadata }
    }
  },

  SET_POINTS_STATISTICS(state, statistics) {
    state.pointsStatistics = { ...state.pointsStatistics, ...statistics }
  },

  SET_POINT_TRANSACTIONS(state, data) {
    state.pointTransactions = data.transactions || []
    if (data.pagination) {
      state.transactionsPagination = { ...state.transactionsPagination, ...data.pagination }
    }
  },

  SET_USER_TRANSACTIONS(state, data) {
    state.userTransactions = data.transactions || []
    if (data.pagination) {
      state.userTransactionsPagination = { ...state.userTransactionsPagination, ...data.pagination }
    }
  },

  SET_SELECTED_USER(state, user) {
    state.selectedUser = user
  },

  SET_CURRENT_PERIOD(state, period) {
    state.currentPeriod = period
  },

  SET_CURRENT_DATE(state, date) {
    state.currentDate = date
  },

  SET_CURRENT_YEAR(state, year) {
    state.currentYear = year
  },

  SET_CURRENT_MONTH(state, month) {
    state.currentMonth = month
  },

  SET_TRANSACTION_FILTERS(state, filters) {
    state.transactionFilters = { ...state.transactionFilters, ...filters }
  },

  RESET_TRANSACTION_FILTERS(state) {
    state.transactionFilters = {
      userId: '',
      transactionType: '',
      activityType: '',
      status: '',
      startDate: '',
      endDate: ''
    }
  },

  ADD_POINT_TRANSACTION(state, transaction) {
    state.pointTransactions.unshift(transaction)
    // Update statistics if needed
    if (transaction.transactionType === 'credit') {
      state.pointsStatistics.systemOverview.totalPointsAwarded += transaction.amount
      state.pointsStatistics.systemOverview.totalTransactions += 1
    }
  }
}

const actions = {
  async fetchLeaderboard({ commit, state }, params = {}) {
    commit('SET_LOADING', true)
    try {
      // Use current state values as defaults
      const requestParams = {
        date: params.date || state.currentDate || leaderboardService.getCurrentDate(),
        year: params.year || state.currentYear || leaderboardService.getCurrentYear(),
        month: params.month || state.currentMonth || leaderboardService.getCurrentMonth(),
        ...params
      }

      const response = await leaderboardService.getComprehensiveLeaderboard(requestParams)
      
      if (response.success) {
        commit('SET_LEADERBOARDS', response.data)
        
        // Update current state
        if (requestParams.date) commit('SET_CURRENT_DATE', requestParams.date)
        if (requestParams.year) commit('SET_CURRENT_YEAR', requestParams.year)
        if (requestParams.month) commit('SET_CURRENT_MONTH', requestParams.month)
      }
      
      return response
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async fetchPointsStatistics({ commit }) {
    commit('SET_LOADING_STATISTICS', true)
    try {
      const response = await leaderboardService.getPointsStatistics()
      
      if (response.success) {
        commit('SET_POINTS_STATISTICS', response.data)
      }
      
      return response
    } catch (error) {
      console.error('Failed to fetch points statistics:', error)
      throw error
    } finally {
      commit('SET_LOADING_STATISTICS', false)
    }
  },

  async fetchPointTransactions({ commit, state }, params = {}) {
    commit('SET_LOADING_TRANSACTIONS', true)
    try {
      const requestParams = {
        page: state.transactionsPagination.currentPage,
        limit: state.transactionsPagination.itemsPerPage,
        ...state.transactionFilters,
        ...params
      }

      // Remove empty filter values
      Object.keys(requestParams).forEach(key => {
        if (!requestParams[key]) delete requestParams[key]
      })

      const response = await leaderboardService.getPointsTransactions(requestParams)
      
      if (response.success) {
        commit('SET_POINT_TRANSACTIONS', response.data)
      }
      
      return response
    } catch (error) {
      console.error('Failed to fetch point transactions:', error)
      throw error
    } finally {
      commit('SET_LOADING_TRANSACTIONS', false)
    }
  },

  async fetchUserTransactions({ commit, state }, { userId, params = {} }) {
    commit('SET_LOADING_TRANSACTIONS', true)
    try {
      const requestParams = {
        page: state.userTransactionsPagination.currentPage,
        limit: state.userTransactionsPagination.itemsPerPage,
        ...params
      }

      // Remove empty filter values
      Object.keys(requestParams).forEach(key => {
        if (!requestParams[key]) delete requestParams[key]
      })

      const response = await leaderboardService.getUserPointTransactions(userId, requestParams)
      
      if (response.success) {
        commit('SET_USER_TRANSACTIONS', response.data)
      }
      
      return response
    } catch (error) {
      console.error('Failed to fetch user transactions:', error)
      throw error
    } finally {
      commit('SET_LOADING_TRANSACTIONS', false)
    }
  },

  async awardPoints({ commit, dispatch }, awardData) {
    commit('SET_SUBMITTING', true)
    try {
      const response = await leaderboardService.awardPoints(awardData)
      
      if (response.success) {
        // Refresh relevant data
        await Promise.all([
          dispatch('fetchPointsStatistics'),
          dispatch('fetchPointTransactions'),
          dispatch('fetchLeaderboard')
        ])
      }
      
      return response
    } catch (error) {
      console.error('Failed to award points:', error)
      throw error
    } finally {
      commit('SET_SUBMITTING', false)
    }
  },

  setPeriod({ commit, dispatch }, period) {
    commit('SET_CURRENT_PERIOD', period)
    
    // Fetch leaderboard data for the new period
    const params = leaderboardService.getLeaderboardParams(period)
    dispatch('fetchLeaderboard', params)
  },

  setDateFilter({ commit, dispatch }, { period, date }) {
    commit('SET_CURRENT_PERIOD', period)
    
    const params = leaderboardService.getLeaderboardParams(period, date)
    commit('SET_CURRENT_DATE', params.date)
    if (params.year) commit('SET_CURRENT_YEAR', params.year)
    if (params.month) commit('SET_CURRENT_MONTH', params.month)
    
    dispatch('fetchLeaderboard', params)
  },

  setTransactionFilters({ commit, dispatch }, filters) {
    commit('SET_TRANSACTION_FILTERS', filters)
    dispatch('fetchPointTransactions')
  },

  resetTransactionFilters({ commit, dispatch }) {
    commit('RESET_TRANSACTION_FILTERS')
    dispatch('fetchPointTransactions')
  },

  setSelectedUser({ commit }, user) {
    commit('SET_SELECTED_USER', user)
  }
}

const getters = {
  // Leaderboard getters
  leaderboards: (state) => state.leaderboards,
  userRankings: (state) => state.userRankings,
  metadata: (state) => state.metadata,
  
  currentLeaderboard: (state) => {
    return state.leaderboards[state.currentPeriod] || {}
  },
  
  currentUserRanking: (state) => {
    return state.userRankings[state.currentPeriod] || null
  },
  
  // Points statistics getters
  pointsStatistics: (state) => state.pointsStatistics,
  systemOverview: (state) => state.pointsStatistics.systemOverview,
  topPointUsers: (state) => state.pointsStatistics.topPointUsers,
  activityStatistics: (state) => state.pointsStatistics.activityStatistics,
  
  // Transaction getters
  pointTransactions: (state) => state.pointTransactions,
  transactionsPagination: (state) => state.transactionsPagination,
  userTransactions: (state) => state.userTransactions,
  userTransactionsPagination: (state) => state.userTransactionsPagination,
  transactionFilters: (state) => state.transactionFilters,
  
  // User getters
  selectedUser: (state) => state.selectedUser,
  
  // State getters
  currentPeriod: (state) => state.currentPeriod,
  currentDate: (state) => state.currentDate,
  currentYear: (state) => state.currentYear,
  currentMonth: (state) => state.currentMonth,
  
  // Loading states
  isLoading: (state) => state.isLoading,
  isLoadingStatistics: (state) => state.isLoadingStatistics,
  isLoadingTransactions: (state) => state.isLoadingTransactions,
  isSubmitting: (state) => state.isSubmitting,
  
  // Computed getters
  totalParticipants: (state) => {
    const current = state.leaderboards[state.currentPeriod]
    return current ? current.total_participants : 0
  },
  
  topThreeUsers: (state) => {
    const current = state.leaderboards[state.currentPeriod]
    return current && current.leaderboard ? current.leaderboard.slice(0, 3) : []
  },
  
  restOfUsers: (state) => {
    const current = state.leaderboards[state.currentPeriod]
    return current && current.leaderboard ? current.leaderboard.slice(3) : []
  },
  
  hasTransactionFilters: (state) => {
    return Object.values(state.transactionFilters).some(value => value !== '')
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}