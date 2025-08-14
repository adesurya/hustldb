<!-- Updated Sidebar Component with User link -->
<template>
  <div class="sidebar d-flex flex-column position-fixed h-100">
    <!-- Mobile Close Button -->
    <div class="sidebar-close d-md-none">
      <button class="btn btn-link text-white p-2" @click="$emit('close')">
        <i class="fas fa-times"></i>
      </button>
    </div>

    <!-- Logo -->
    <div class="sidebar-header p-3 text-center border-bottom border-light border-opacity-25">
      <div class="d-flex align-items-center justify-content-center">
        <img src="/images/logo.png" alt="Hazel Logo" class="logo-image me-2" />
        <h4 class="text-white mb-0 fw-bold">hazel</h4>
      </div>
      <small class="text-light opacity-75">Share Link & Rewards</small>
    </div>

    <!-- Navigation Menu -->
    <nav class="flex-grow-1 p-3">
      <ul class="nav flex-column">
        <li class="nav-item mb-1">
          <router-link 
            to="/dashboard" 
            class="sidebar-link d-flex align-items-center"
            :class="{ active: $route.name === 'Dashboard' }"
          >
            <i class="fas fa-home me-3"></i>
            Dashboard
          </router-link>
        </li>
        
        <li class="nav-item mb-1">
          <router-link 
            to="/category" 
            class="sidebar-link d-flex align-items-center"
            :class="{ active: $route.name === 'Category' }"
          >
            <i class="fas fa-tags me-3"></i>
            Category
          </router-link>
        </li>

        <li class="nav-item mb-1">
          <router-link 
            to="/products" 
            class="sidebar-link d-flex align-items-center"
            :class="{ active: $route.name === 'Products' }"
          >
            <i class="fas fa-box me-3"></i>
            Product
          </router-link>
        </li>

        <li class="nav-item mb-1">
          <router-link 
            to="/campaigns" 
            class="sidebar-link d-flex align-items-center"
            :class="{ active: $route.name === 'Campaigns' }"
          >
            <i class="fas fa-box me-3"></i>
            Campaigns
          </router-link>
        </li>
        
       <li class="nav-item mb-1">
          <router-link 
            to="/users" 
            class="sidebar-link d-flex align-items-center"
            :class="{ active: $route.name === 'Users' }"
          >
            <i class="fas fa-users me-3"></i>
            User
          </router-link>
        </li>
        
        <li class="nav-item mb-1">
          <a href="#" class="sidebar-link d-flex align-items-center">
            <i class="fas fa-credit-card me-3"></i>
            Order
          </a>
        </li>
      </ul>
    </nav>

    <!-- User Profile -->
    <div class="sidebar-footer p-3 border-top border-light border-opacity-25">
      <div class="d-flex align-items-center mb-2">
        <div class="avatar me-3">
          <div class="bg-light rounded-circle d-flex align-items-center justify-content-center" 
               style="width: 40px; height: 40px;">
            <span class="text-primary fw-bold">{{ userInitials }}</span>
          </div>
        </div>
        <div class="flex-grow-1">
          <div class="text-white small fw-semibold">{{ username }}</div>
          <div class="text-light opacity-75" style="font-size: 0.75rem;">
            {{ userRole }}
          </div>
        </div>
      </div>
      
      <button 
        @click="handleLogout" 
        class="btn btn-outline-light btn-sm w-100 d-flex align-items-center justify-content-center logout-btn"
        type="button"
        :disabled="isLoggingOut"
      >
        <i v-if="!isLoggingOut" class="fas fa-sign-out-alt me-2"></i>
        <i v-else class="fas fa-spinner fa-spin me-2"></i>
        {{ isLoggingOut ? 'Logging out...' : 'Logout' }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Sidebar',
  
  emits: ['close'],
  
  data() {
    return {
      isLoggingOut: false
    }
  },
  
  computed: {
    username() {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        return user.username || 'User'
      } catch {
        return 'User'
      }
    },
    
    userRole() {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        return user.role || 'Admin'
      } catch {
        return 'Admin'
      }
    },
    
    userInitials() {
      try {
        const username = this.username
        if (username && username !== 'User') {
          return username.substring(0, 2).toUpperCase()
        }
        return 'U'
      } catch {
        return 'U'
      }
    }
  },
  
  methods: {
    async handleLogout() {
      if (this.isLoggingOut) return
      
      this.isLoggingOut = true
      
      try {
        console.log('Starting logout process...')
        
        // Call API logout jika ada
        await this.callLogoutAPI()
        
        // Clear all session data
        this.clearAllSessionData()
        
        // Emit logout event ke parent component
        this.$emit('logout')
        
        // Redirect to login
        await this.redirectToLogin()
        
      } catch (error) {
        console.error('Logout error:', error)
        
        // Tetap clear session meskipun API gagal
        this.clearAllSessionData()
        
        // Redirect tetap dilakukan
        await this.redirectToLogin()
        
      } finally {
        this.isLoggingOut = false
      }
    },
    
    async callLogoutAPI() {
      try {
        const token = localStorage.getItem('token')
        
        if (token) {
          // Panggil API logout jika ada endpoint-nya
          // Ganti URL sesuai dengan endpoint API Anda
          const response = await fetch('/api/logout', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          })
          
          if (!response.ok) {
            console.warn('Logout API failed, but continuing with client-side logout')
          }
        }
      } catch (error) {
        console.warn('Logout API error:', error)
        // Lanjutkan proses logout meskipun API gagal
      }
    },
    
    clearAllSessionData() {
      try {
        console.log('Clearing all session data...')
        
        // Clear localStorage items
        const itemsToRemove = [
          'token', 
          'user', 
          'refreshToken', 
          'authToken',
          'userData',
          'session',
          'loginTime',
          'permissions'
        ]
        
        itemsToRemove.forEach(item => {
          localStorage.removeItem(item)
        })
        
        // Clear sessionStorage
        sessionStorage.clear()
        
        // Clear cookies terkait authentication
        this.clearAuthCookies()
        
        console.log('Session data cleared successfully')
        
      } catch (error) {
        console.error('Error clearing session data:', error)
      }
    },
    
    clearAuthCookies() {
      try {
        // Daftar cookie yang mungkin perlu dihapus
        const cookiesToClear = [
          'token',
          'authToken', 
          'session',
          'user',
          'remember_token',
          'access_token'
        ]
        
        cookiesToClear.forEach(cookieName => {
          // Clear cookie for current domain
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`
          
          // Clear cookie for all subdomains
          const domain = window.location.hostname
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${domain};`
        })
        
      } catch (error) {
        console.error('Error clearing cookies:', error)
      }
    },
    
    async redirectToLogin() {
      try {
        console.log('Redirecting to login...')
        
        // Tunggu sebentar untuk memastikan state sudah clear
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Coba gunakan Vue Router dulu
        if (this.$router) {
          await this.$router.push({ name: 'Login', query: { logout: 'true' } })
          
          // Reload untuk memastikan semua state ter-reset
          setTimeout(() => {
            window.location.reload()
          }, 100)
          
        } else {
          // Fallback ke window.location
          window.location.href = '/login?logout=true'
        }
        
      } catch (error) {
        console.error('Router redirect failed, using window.location:', error)
        
        // Fallback ultimate
        window.location.href = '/login?logout=true'
      }
    }
  }
}
</script>

<style scoped>
.sidebar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  width: 250px;
  z-index: 1000;
  transition: transform 0.3s ease;
}

.sidebar-close {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
}

.logo-image {
  width: 36px;
  height: 36px;
  object-fit: contain;
}

.sidebar-link {
  color: rgba(255, 255, 255, 0.8);
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  text-decoration: none;
  border-radius: 0.5rem;
  margin-bottom: 0.25rem;
  transition: all 0.3s ease;
}

.sidebar-link:hover,
.sidebar-link.active {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  text-decoration: none;
  transform: translateX(5px);
}

.sidebar-link:hover {
  background-color: rgba(255, 255, 255, 0.15);
}

.btn-outline-light:hover {
  background-color: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
  color: white;
}

.logout-btn {
  cursor: pointer !important;
  pointer-events: auto !important;
  position: relative;
  z-index: 10;
  transition: all 0.3s ease;
}

.logout-btn:hover:not(:disabled) {
  background-color: rgba(255, 255, 255, 0.2) !important;
  transform: none;
}

.logout-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed !important;
}

.fa-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .sidebar {
    z-index: 1060;
  }
}
</style>