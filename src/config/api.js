// API Configuration for different environments
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

// API Endpoints
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
    LEADERBOARD_STATISTICS: '/api/v1/leaderboard/statistics'
  },
  
  USER: {
    LIST: '/api/v1/users',
    DETAIL: '/api/v1/users/:id',
    UPDATE: '/api/v1/users/:id',
    DELETE: '/api/v1/users/:id'
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
  UNKNOWN_ERROR: 'An unexpected error occurred.'
}

export default apiConfig