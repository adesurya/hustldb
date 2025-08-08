<template>
  <header class="header bg-white shadow-sm border-bottom" style="margin-left: 250px;">
    <div class="container-fluid">
      <div class="row align-items-center py-3">
        <div class="col-md-6">
          <div class="d-flex align-items-center">
            <div class="page-title">
              <h1 class="h4 mb-0 fw-bold text-dark">{{ pageTitle }}</h1>
              <div class="breadcrumb-container mt-1">
                <nav aria-label="breadcrumb">
                  <ol class="breadcrumb mb-0">
                    <li class="breadcrumb-item">
                      <router-link to="/dashboard" class="text-muted text-decoration-none">
                        <font-awesome-icon icon="home" class="me-1" />
                        Home
                      </router-link>
                    </li>
                    <li class="breadcrumb-item active text-primary" aria-current="page">
                      {{ pageTitle }}
                    </li>
                  </ol>
                </nav>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-md-6">
          <div class="d-flex align-items-center justify-content-end">
            <!-- Date Range Display -->
            <div class="date-range me-4">
              <div class="d-flex align-items-center text-muted">
                <i class="fas fa-calendar-alt me-2"></i>
                <span class="small">{{ dateRange }}</span>
              </div>
            </div>
            
            <!-- Refresh Button -->
            <button 
              @click="$emit('refresh')"
              class="btn btn-outline-primary btn-sm me-3"
              :disabled="isRefreshing"
            >
              <font-awesome-icon 
                icon="sync-alt" 
                :class="{ 'fa-spin': isRefreshing }" 
                class="me-1"
              />
              Refresh
            </button>
            
            <!-- User Profile Dropdown -->
            <div class="dropdown">
              <button 
                class="btn btn-link text-decoration-none p-0 d-flex align-items-center"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <div class="user-avatar me-2">
                  <div class="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                       style="width: 36px; height: 36px; font-size: 14px;">
                    {{ userInitials }}
                  </div>
                </div>
                <div class="user-info text-start d-none d-md-block">
                  <div class="text-dark fw-semibold" style="font-size: 14px;">
                    {{ user?.username || 'User' }}
                  </div>
                  <div class="text-muted" style="font-size: 12px;">
                    {{ user?.email || 'user@example.com' }}
                  </div>
                </div>
                <i class="fas fa-chevron-down ms-2 text-muted small"></i>
              </button>
              
              <ul class="dropdown-menu dropdown-menu-end shadow">
                <li>
                  <div class="dropdown-item-text">
                    <div class="d-flex align-items-center">
                      <div class="user-avatar me-3">
                        <div class="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                             style="width: 40px; height: 40px;">
                          {{ userInitials }}
                        </div>
                      </div>
                      <div>
                        <div class="fw-semibold">{{ user?.username || 'User' }}</div>
                        <div class="text-muted small">{{ user?.email || 'user@example.com' }}</div>
                        <div class="small">
                          <span class="badge bg-success">{{ user?.role || 'Admin' }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
                <li><hr class="dropdown-divider"></li>
                <li>
                  <a class="dropdown-item d-flex align-items-center" href="#">
                    <i class="fas fa-user me-2"></i>
                    Profile Settings
                  </a>
                </li>
                <li>
                  <a class="dropdown-item d-flex align-items-center" href="#">
                    <i class="fas fa-cog me-2"></i>
                    Account Settings
                  </a>
                </li>
                <li><hr class="dropdown-divider"></li>
                <li>
                  <button 
                    @click="handleLogout"
                    class="dropdown-item d-flex align-items-center text-danger"
                    :disabled="isLoggingOut"
                  >
                    <div v-if="isLoggingOut" class="spinner-border spinner-border-sm me-2"></div>
                    <i v-else class="fas fa-sign-out-alt me-2"></i>
                    {{ isLoggingOut ? 'Signing out...' : 'Sign Out' }}
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'Header',
  
  props: {
    isRefreshing: {
      type: Boolean,
      default: false
    }
  },
  
  emits: ['refresh', 'toggle-sidebar'],
  
  computed: {
    ...mapGetters('auth', ['user']),
    
    pageTitle() {
      const routeNames = {
        'Dashboard': 'Dashboard',
        'Products': 'Products',
        'Campaign': 'Campaign',
        'Users': 'Users',
        'Transactions': 'Transactions'
      }
      return routeNames[this.$route.name] || 'Dashboard'
    },
    
    userInitials() {
      if (!this.user?.username) return 'U'
      return this.user.username.substring(0, 2).toUpperCase()
    },
    
    dateRange() {
      const today = new Date()
      const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }
      
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      const endDate = today
      
      return `${startOfMonth.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`
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
.header {
  position: fixed;
  top: 0;
  right: 0;
  left: 250px;
  z-index: 999;
  background-color: #ffffff;
}

.breadcrumb-item + .breadcrumb-item::before {
  content: "›";
  color: #6c757d;
}

.breadcrumb-item.active {
  font-weight: 500;
}

.user-avatar {
  cursor: pointer;
}

.dropdown-toggle::after {
  display: none;
}

.dropdown-menu {
  min-width: 280px;
  border: none;
  border-radius: 0.5rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  margin-top: 0.5rem;
}

.dropdown-item {
  padding: 0.5rem 1rem;
  transition: background-color 0.15s ease-in-out;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
}

.dropdown-item.text-danger:hover {
  background-color: #f8d7da;
  color: #721c24 !important;
}

.btn-outline-primary {
  border-color: #dee2e6;
  color: #6c757d;
}

.btn-outline-primary:hover {
  background-color: #007bff;
  border-color: #007bff;
  color: white;
}

@media (max-width: 768px) {
  .header {
    left: 0;
    margin-left: 0;
  }
  
  .date-range {
    display: none !important;
  }
  
  .user-info {
    display: none !important;
  }
}
</style>