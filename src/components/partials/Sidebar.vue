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
        <img src="/images/hazel-logo.png" alt="Hazel Logo" class="logo-image me-2" />
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
          <a href="#" class="sidebar-link d-flex align-items-center">
            <i class="fas fa-box me-3"></i>
            Product
          </a>
        </li>
        
        <li class="nav-item mb-1">
          <a href="#" class="sidebar-link d-flex align-items-center">
            <i class="fas fa-bullhorn me-3"></i>
            Campaign
          </a>
        </li>
        
        <li class="nav-item mb-1">
          <a href="#" class="sidebar-link d-flex align-items-center">
            <i class="fas fa-user me-3"></i>
            User
          </a>
        </li>
        
        <li class="nav-item mb-1">
          <a href="#" class="sidebar-link d-flex align-items-center">
            <i class="fas fa-credit-card me-3"></i>
            Transaction
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
          <div class="text-white small fw-semibold">{{ user?.username || 'User' }}</div>
          <div class="text-light opacity-75" style="font-size: 0.75rem;">
            {{ user?.role || 'Admin' }}
          </div>
        </div>
      </div>
      
      <button 
        @click="handleLogout" 
        class="btn btn-outline-light btn-sm w-100 d-flex align-items-center justify-content-center"
        :disabled="isLoggingOut"
      >
        <div v-if="isLoggingOut" class="spinner-border spinner-border-sm me-2"></div>
        <i v-else class="fas fa-sign-out-alt me-2"></i>
        {{ isLoggingOut ? 'Logging out...' : 'Logout' }}
      </button>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'Sidebar',
  
  emits: ['close'],
  
  computed: {
    ...mapGetters('auth', ['user']),
    
    userInitials() {
      if (!this.user?.username) return 'U'
      return this.user.username.substring(0, 2).toUpperCase()
    }
  },
  
  methods: {
    ...mapActions('auth', ['logout']),
    
    async handleLogout() {
      try {
        this.isLoggingOut = true
        await this.logout()
        this.$toast.success('Logged out successfully')
        this.$router.push('/login')
      } catch (error) {
        this.$toast.error('Logout failed. Please try again.')
        console.error('Logout error:', error)
      } finally {
        this.isLoggingOut = false
      }
    }
  },

  data() {
    return {
      isLoggingOut: false
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

@media (max-width: 768px) {
  .sidebar {
    z-index: 1060;
  }
}
</style>