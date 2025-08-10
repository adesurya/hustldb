// /src/utils/authDebugHelper.js - Debug helper for authentication issues
class AuthDebugHelper {
  static debugAuthState() {
    const token = localStorage.getItem('token')
    const refreshToken = localStorage.getItem('refreshToken')
    
    console.group('🔍 Authentication Debug Info')
    console.log('🔑 Access Token:', token ? 'Present' : 'Missing')
    console.log('🔄 Refresh Token:', refreshToken ? 'Present' : 'Missing')
    
    if (token) {
      try {
        // Decode JWT without verification (just for debugging)
        const payload = this.decodeJWTPayload(token)
        console.log('📝 Token Payload:', payload)
        
        if (payload.exp) {
          const expiryDate = new Date(payload.exp * 1000)
          const isExpired = Date.now() >= payload.exp * 1000
          console.log('⏰ Token Expires:', expiryDate.toLocaleString())
          console.log('❓ Token Expired:', isExpired)
        }
      } catch (error) {
        console.warn('⚠️ Failed to decode token:', error.message)
      }
    }
    
    // Check cookies
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [name, value] = cookie.trim().split('=')
      acc[name] = value
      return acc
    }, {})
    
    console.log('🍪 Cookies:', cookies)
    console.log('🍪 RefreshToken Cookie:', cookies.refreshToken ? 'Present' : 'Missing')
    
    console.groupEnd()
    
    return {
      hasAccessToken: !!token,
      hasRefreshToken: !!refreshToken,
      hasRefreshTokenCookie: !!cookies.refreshToken,
      tokenExpired: token ? this.isTokenExpired(token) : null
    }
  }

  static decodeJWTPayload(token) {
    try {
      const parts = token.split('.')
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format')
      }
      
      const payload = parts[1]
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
      return JSON.parse(decoded)
    } catch (error) {
      throw new Error(`Failed to decode JWT: ${error.message}`)
    }
  }

  static isTokenExpired(token) {
    try {
      const payload = this.decodeJWTPayload(token)
      if (!payload.exp) return false
      
      return Date.now() >= payload.exp * 1000
    } catch (error) {
      console.warn('Could not check token expiry:', error.message)
      return true // Assume expired if we can't decode
    }
  }

  static async testAuthenticatedRequest(url = 'https://apihustl.sijago.ai/api/v1/campaigns') {
    console.group('🧪 Testing Authenticated Request')
    
    const debugInfo = this.debugAuthState()
    
    if (!debugInfo.hasAccessToken) {
      console.error('❌ No access token available')
      console.groupEnd()
      return { success: false, error: 'No access token' }
    }

    if (debugInfo.tokenExpired) {
      console.warn('⚠️ Access token appears to be expired')
    }

    try {
      const token = localStorage.getItem('token')
      const refreshToken = localStorage.getItem('refreshToken')
      
      // Set refresh token as cookie
      if (refreshToken) {
        document.cookie = `refreshToken=${refreshToken}; path=/; secure; samesite=strict`
      }

      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }

      console.log('📡 Request Headers:', headers)
      console.log('📡 Request URL:', url)

      const response = await fetch(url, {
        method: 'GET',
        headers,
        credentials: 'include'
      })

      console.log('📡 Response Status:', response.status)
      console.log('📡 Response Headers:', Object.fromEntries(response.headers.entries()))

      const data = await response.json()
      console.log('📦 Response Data:', data)

      const result = {
        success: response.ok,
        status: response.status,
        data: data
      }

      if (!response.ok) {
        console.error('❌ Request failed:', response.status, response.statusText)
      } else {
        console.log('✅ Request successful')
      }

      console.groupEnd()
      return result

    } catch (error) {
      console.error('❌ Request error:', error)
      console.groupEnd()
      return { success: false, error: error.message }
    }
  }

  static async testCreateCampaign(campaignData) {
    console.group('🧪 Testing Create Campaign Request')
    
    const debugInfo = this.debugAuthState()
    
    if (!debugInfo.hasAccessToken) {
      console.error('❌ No access token available')
      console.groupEnd()
      return { success: false, error: 'No access token' }
    }

    try {
      const token = localStorage.getItem('token')
      const refreshToken = localStorage.getItem('refreshToken')
      
      // Set refresh token as cookie
      if (refreshToken) {
        document.cookie = `refreshToken=${refreshToken}; path=/; secure; samesite=strict`
        console.log('🍪 Set refresh token cookie')
      }

      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }

      const testPayload = campaignData || {
        name: 'Test Campaign ' + Date.now(),
        slug: 'test-campaign-' + Date.now(),
        description: 'Test campaign for debugging',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
        productIds: []
      }

      console.log('📤 Payload:', testPayload)
      console.log('📡 Request Headers:', headers)

      const response = await fetch('https://apihustl.sijago.ai/api/v1/campaigns', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(testPayload)
      })

      console.log('📡 Response Status:', response.status)
      console.log('📡 Response Headers:', Object.fromEntries(response.headers.entries()))

      const data = await response.json()
      console.log('📦 Response Data:', data)

      const result = {
        success: response.ok,
        status: response.status,
        data: data
      }

      if (!response.ok) {
        console.error('❌ Create campaign failed:', response.status, response.statusText)
      } else {
        console.log('✅ Create campaign successful')
      }

      console.groupEnd()
      return result

    } catch (error) {
      console.error('❌ Create campaign error:', error)
      console.groupEnd()
      return { success: false, error: error.message }
    }
  }

  static validateTokenFormat(token) {
    if (!token) return { valid: false, error: 'Token is empty' }
    
    const parts = token.split('.')
    if (parts.length !== 3) {
      return { valid: false, error: 'Invalid JWT format - should have 3 parts' }
    }

    try {
      // Try to decode each part
      const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')))
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
      
      return {
        valid: true,
        header,
        payload,
        hasExpiry: !!payload.exp,
        isExpired: payload.exp ? Date.now() >= payload.exp * 1000 : false
      }
    } catch (error) {
      return { valid: false, error: `Failed to decode token: ${error.message}` }
    }
  }

  static clearAllAuth() {
    console.log('🧹 Clearing all authentication data...')
    
    // Clear localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    
    // Clear cookies
    document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    
    console.log('✅ All authentication data cleared')
  }

  static async refreshTokenTest() {
    console.group('🔄 Testing Token Refresh')
    
    const refreshToken = localStorage.getItem('refreshToken')
    if (!refreshToken) {
      console.error('❌ No refresh token available')
      console.groupEnd()
      return { success: false, error: 'No refresh token' }
    }

    try {
      // Set refresh token as cookie
      document.cookie = `refreshToken=${refreshToken}; path=/; secure; samesite=strict`

      const response = await fetch('https://apihustl.sijago.ai/api/v1/auth/refresh', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      console.log('📡 Refresh Response Status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('📦 Refresh Response Data:', data)
        
        if (data.token) {
          localStorage.setItem('token', data.token)
          console.log('✅ New token saved to localStorage')
        }
        
        console.groupEnd()
        return { success: true, data }
      } else {
        const errorData = await response.text()
        console.error('❌ Refresh failed:', response.status, errorData)
        console.groupEnd()
        return { success: false, error: `HTTP ${response.status}` }
      }
    } catch (error) {
      console.error('❌ Refresh error:', error)
      console.groupEnd()
      return { success: false, error: error.message }
    }
  }
}

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  window.AuthDebug = AuthDebugHelper
}

export default AuthDebugHelper