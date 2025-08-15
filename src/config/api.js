// /src/config/api.js - Updated with Leaderboard endpoints
const config = {
  development: {
    baseURL: process.env.VUE_APP_API_URL || 'https://apihustl.sijago.ai',
    timeout: 30000,
    enableLogs: true,
    retryAttempts: 3,
    retryDelay: 1000
  },
  
  production: {
    baseURL: process.env.VUE_APP_API_URL || 'https://apihustl.sijago.ai',
    timeout: 15000,
    enableLogs: false,
    retryAttempts: 2,
    retryDelay: 500
  },
  
  staging: {
    baseURL: process.env.VUE_APP_API_URL || 'https://staging.apihustl.sijago.ai',
    timeout: 20000,
    enableLogs: true,
    retryAttempts: 2,
    retryDelay: 1000
  }
}

const currentEnv = process.env.NODE_ENV || 'development'
const apiConfig = config[currentEnv]

// API Endpoints - Updated with Leaderboard endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    LOGOUT: '/api/v1/auth/logout',
    REFRESH: '/api/v1/auth/refresh',
    PROFILE: '/api/v1/auth/profile'
  },
  
  DASHBOARD: {
    ORDER_ANALYTICS: '/api/v1/tiktok/orders/analytics',
    AFFILIATE_STATISTICS: '/api/v1/tiktok/admin/statistics',
    LEADERBOARD_STATISTICS: '/api/v1/leaderboard/statistics',
    PRODUCT_STATISTICS: '/api/v1/products/statistics',
    POINT_STATISTICS: '/api/v1/points/admin/statistics',
    CAMPAIGN_STATISTICS: '/api/v1/campaigns/admin/statistics'
  },
  
  PRODUCTS: {
    LIST: '/api/v1/products',
    CREATE: '/api/v1/products',
    DETAIL: '/api/v1/products/:id',
    UPDATE: '/api/v1/products/:id',
    DELETE: '/api/v1/products/:id',
    TOGGLE_STATUS: '/api/v1/products/:id/toggle-status',
    TOGGLE_FEATURED: '/api/v1/products/:id/toggle-featured',
    BULK_DELETE: '/api/v1/products/bulk-delete',
    BULK_STATUS: '/api/v1/products/bulk-status',
    STATISTICS: '/api/v1/products/statistics'
  },
  
  CATEGORIES: {
    LIST: '/api/v1/categories',
    CREATE: '/api/v1/categories',
    DETAIL: '/api/v1/categories/:id',
    UPDATE: '/api/v1/categories/:id',
    DELETE: '/api/v1/categories/:id'
  },
  
  CAMPAIGNS: {
    LIST: '/api/v1/campaigns',
    CREATE: '/api/v1/campaigns',
    DETAIL: '/api/v1/campaigns/:id',
    UPDATE: '/api/v1/campaigns/:id',
    DELETE: '/api/v1/campaigns/:id',
    TOGGLE_STATUS: '/api/v1/campaigns/:id/toggle-status',
    ADD_PRODUCTS: '/api/v1/campaigns/:id/products',
    REMOVE_PRODUCTS: '/api/v1/campaigns/:id/products',
    GET_PRODUCTS: '/api/v1/campaigns/:id/products',
    BULK_DELETE: '/api/v1/campaigns/bulk-delete',
    BULK_STATUS: '/api/v1/campaigns/bulk-status',
    STATISTICS: '/api/v1/campaigns/admin/statistics'
  },
  
  USERS: {
    LIST: '/api/v1/users',
    CREATE: '/api/v1/users',
    DETAIL: '/api/v1/users/:id',
    UPDATE: '/api/v1/users/:id',
    DELETE: '/api/v1/users/:id',
    RESET_PASSWORD: '/api/v1/users/:id/reset-password',
    BAN: '/api/v1/users/:id/ban',
    UNBAN: '/api/v1/users/:id/unban',
    BANNED_LIST: '/api/v1/users/banned',
    BULK_DELETE: '/api/v1/users/bulk-delete',
    BULK_STATUS: '/api/v1/users/bulk-status',
    STATISTICS: '/api/v1/users/statistics'
  },

  REDEMPTIONS: {
    LIST: '/api/v1/points/admin/redemptions',
    DETAIL: '/api/v1/points/admin/redemptions/:id',
    PROCESS: '/api/v1/points/admin/redemptions/:id/process',
    BULK_APPROVE: '/api/v1/points/admin/redemptions/bulk-approve',
    BULK_REJECT: '/api/v1/points/admin/redemptions/bulk-reject',
    STATISTICS: '/api/v1/points/admin/redemptions/statistics'
  },

  // New Leaderboard endpoints
  LEADERBOARD: {
    COMPREHENSIVE: '/api/v1/leaderboard/comprehensive',
    STATISTICS: '/api/v1/leaderboard/statistics'
  },

  // New Points management endpoints
  POINTS: {
    STATISTICS: '/api/v1/points/admin/statistics',
    TRANSACTIONS: '/api/v1/points/admin/transactions',
    AWARD: '/api/v1/points/admin/award',
    USER_BALANCE: '/api/v1/points/admin/users/:id/balance',
    USER_TRANSACTIONS: '/api/v1/points/admin/users/:id/transactions'
  }
}

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503
}

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  TIMEOUT_ERROR: 'Request timeout. Please try again.',
  UNAUTHORIZED: 'Session expired. Please login again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input data.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
  FEATURE_NOT_AVAILABLE: 'This feature is not available yet.'
}

export default apiConfig