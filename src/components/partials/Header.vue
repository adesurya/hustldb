<template>
  <header class="header bg-white shadow-sm border-bottom">
    <div class="container-fluid">
      <div class="row align-items-center py-3">
        <!-- Left Side: Mobile Menu + Page Title -->
        <div class="col-md-6">
          <div class="d-flex align-items-center">
            <!-- Mobile Menu Button -->
            <button 
              class="btn btn-link text-muted p-0 me-3 d-md-none"
              @click="$emit('toggle-sidebar')"
            >
              <i class="fas fa-bars fs-5"></i>
            </button>
            
            <!-- Page Title -->
            <div class="page-title">
              <h1 class="h4 mb-0 fw-bold text-dark">{{ pageTitle }}</h1>
              <div class="breadcrumb-container mt-1">
                <nav aria-label="breadcrumb">
                  <ol class="breadcrumb mb-0">
                    <li class="breadcrumb-item">
                      <router-link to="/dashboard" class="text-muted text-decoration-none">
                        <i class="fas fa-home me-1"></i>
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
        
        <!-- Right Side: Date Range + Actions + Profile -->
        <div class="col-md-6">
          <div class="d-flex align-items-center justify-content-end">
            <!-- Refresh Button -->
            <button 
              @click="$emit('refresh')"
              class="btn btn-outline-primary btn-sm me-3"
              :disabled="isRefreshing"
            >
              <i 
                class="fas fa-sync-alt me-1"
                :class="{ 'fa-spin': isRefreshing }" 
              ></i>
              <span class="d-none d-sm-inline">Refresh</span>
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
                <div class="user-info text-start d-none d-lg-block">
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
    },
    sidebarVisible: {
      type: Boolean,
      default: true
    }
  },
  
  emits: ['refresh', 'toggle-sidebar'],
  
  data() {
    return {
      isLoggingOut: false
    }
  },
  
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
  }
}
</script>

<style scoped>
/* Header Positioning */
.header {
  position: fixed;
  top: 0;
  left: 250px;
  right: 0;
  z-index: 999;
  background-color: #ffffff;
  height: 80px;
  transition: left 0.3s ease;
}

/* Header Content */
.container-fluid {
  height: 100%;
}

.row {
  height: 100%;
}

/* Breadcrumb Styling */
.breadcrumb-item + .breadcrumb-item::before {
  content: "›";
  color: #6c757d;
  font-weight: bold;
}

.breadcrumb-item.active {
  font-weight: 500;
}

.breadcrumb {
  font-size: 0.875rem;
}

/* User Avatar */
.user-avatar {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.user-avatar:hover {
  transform: scale(1.05);
}

/* Dropdown Styling */
.dropdown-toggle::after {
  display: none;
}

.dropdown-menu {
  min-width: 280px;
  border: none;
  border-radius: 12px;
  box-shadow: 0 0.5rem 2rem rgba(0, 0, 0, 0.15);
  margin-top: 0.5rem;
  padding: 0.5rem 0;
}

.dropdown-item {
  padding: 0.75rem 1.25rem;
  transition: all 0.15s ease-in-out;
  border-radius: 8px;
  margin: 0 0.5rem;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
  transform: translateX(2px);
}

.dropdown-item.text-danger:hover {
  background-color: #f8d7da;
  color: #721c24 !important;
}

.dropdown-item-text {
  padding: 1rem 1.25rem;
  margin: 0 0.5rem;
  background-color: #f8f9fa;
  border-radius: 8px;
}

/* Button Styling */
.btn-outline-primary {
  border-color: #e9ecef;
  color: #6c757d;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.btn-outline-primary:hover {
  background-color: #007bff;
  border-color: #007bff;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 123, 255, 0.25);
}

.btn-outline-primary:disabled {
  opacity: 0.65;
  transform: none;
  box-shadow: none;
}

.btn-link:hover {
  color: #007bff !important;
}

/* Date Range Styling */
.date-range {
  background-color: #f8f9fa;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

/* Responsive Design */
@media (max-width: 768px) {
  .header {
    left: 0;
    height: 70px;
  }
  
  .page-title h1 {
    font-size: 1.25rem;
  }
  
  .breadcrumb {
    font-size: 0.75rem;
  }
  
  .user-info {
    display: none !important;
  }
  
  .date-range {
    display: none !important;
  }
  
  .btn-sm {
    padding: 0.375rem 0.5rem;
  }
  
  .dropdown-menu {
    min-width: 250px;
  }
}

@media (max-width: 576px) {
  .header {
    height: 60px;
  }
  
  .page-title h1 {
    font-size: 1.1rem;
  }
  
  .breadcrumb-container {
    display: none;
  }
  
  .user-avatar > div {
    width: 32px !important;
    height: 32px !important;
    font-size: 12px !important;
  }
  
  .btn-sm span {
    display: none !important;
  }
}

/* Animation for mobile menu button */
.btn-link i {
  transition: transform 0.2s ease;
}

.btn-link:hover i {
  transform: scale(1.1);
}

/* Loading spinner */
.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

/* Enhanced hover effects */
.dropdown-item i {
  width: 16px;
  text-align: center;
}

.dropdown-divider {
  margin: 0.5rem 1rem;
  opacity: 0.5;
}

/* Focus states for accessibility */
.btn:focus,
.dropdown-toggle:focus {
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  outline: none;
}
</style>  