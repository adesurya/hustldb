<!-- /src/components/modals/UserDetailModal.vue -->
<template>
  <div 
    v-if="show"
    class="modal fade show d-block"
    tabindex="-1"
    style="background-color: rgba(0,0,0,0.5);"
  >
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content border-0">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title fw-bold">
            User Details
          </h5>
          <button 
            @click="$emit('close')"
            type="button" 
            class="btn-close"
          ></button>
        </div>
        
        <div class="modal-body">
          <div v-if="user" class="row g-4">
            <!-- User Avatar and Basic Info -->
            <div class="col-md-4">
              <div class="user-profile-container text-center">
                <div class="user-avatar-large mx-auto mb-3">
                  <div class="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                       style="width: 120px; height: 120px; font-size: 2.5rem;">
                    {{ getUserInitials(user.username) }}
                  </div>
                </div>
                <h4 class="user-name mb-1">{{ user.username }}</h4>
                <p class="text-muted mb-3">{{ user.email }}</p>
                
                <div class="user-badges mb-3">
                  <span class="badge me-2" :class="getRoleBadgeClass(user.role)">
                    <i :class="getRoleIcon(user.role)" class="me-1"></i>
                    {{ user.role }}
                  </span>
                  <span class="badge" :class="user.isActive ? 'bg-success' : 'bg-danger'">
                    {{ user.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </div>

                <div class="user-stats">
                  <div class="stat-item">
                    <div class="stat-value">{{ formatNumber(user.currentPoints) }}</div>
                    <div class="stat-label">Points</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- User Information -->
            <div class="col-md-8">
              <div class="user-details">
                <!-- Contact Information -->
                <div class="info-section mb-4">
                  <h6 class="section-title">
                    <i class="fas fa-address-book me-2"></i>
                    Contact Information
                  </h6>
                  <div class="row g-3">
                    <div class="col-md-6">
                      <div class="info-item">
                        <div class="info-label">Email Address</div>
                        <div class="info-value">
                          {{ user.email }}
                          <span v-if="user.isVerified" class="text-success ms-2">
                            <i class="fas fa-check-circle"></i> Verified
                          </span>
                          <span v-else class="text-warning ms-2">
                            <i class="fas fa-clock"></i> Unverified
                          </span>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="info-item">
                        <div class="info-label">Phone Number</div>
                        <div class="info-value">
                          {{ user.phoneNumber || 'Not provided' }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Account Status -->
                <div class="info-section mb-4">
                  <h6 class="section-title">
                    <i class="fas fa-user-shield me-2"></i>
                    Account Status
                  </h6>
                  <div class="row g-3">
                    <div class="col-md-4">
                      <div class="status-card">
                        <div class="status-icon bg-primary bg-opacity-10">
                          <i class="fas fa-user text-primary"></i>
                        </div>
                        <div class="status-content">
                          <div class="status-label">Account Status</div>
                          <div class="status-value">
                            <span class="badge" :class="user.isActive ? 'bg-success' : 'bg-danger'">
                              {{ user.isActive ? 'Active' : 'Inactive' }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div class="col-md-4">
                      <div class="status-card">
                        <div class="status-icon bg-success bg-opacity-10">
                          <i class="fas fa-shield-alt text-success"></i>
                        </div>
                        <div class="status-content">
                          <div class="status-label">Email Verified</div>
                          <div class="status-value">
                            <span class="badge" :class="user.isVerified ? 'bg-success' : 'bg-warning'">
                              {{ user.isVerified ? 'Yes' : 'No' }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="col-md-4">
                      <div class="status-card">
                        <div class="status-icon bg-warning bg-opacity-10">
                          <i class="fas fa-coins text-warning"></i>
                        </div>
                        <div class="status-content">
                          <div class="status-label">Can Earn Points</div>
                          <div class="status-value">
                            <span class="badge" :class="user.canEarnPoints ? 'bg-success' : 'bg-secondary'">
                              {{ user.canEarnPoints ? 'Yes' : 'No' }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Security Information -->
                <div class="info-section mb-4">
                  <h6 class="section-title">
                    <i class="fas fa-lock me-2"></i>
                    Security Information
                  </h6>
                  <div class="row g-3">
                    <div class="col-md-6">
                      <div class="info-item">
                        <div class="info-label">Two-Factor Authentication</div>
                        <div class="info-value">
                          <span class="badge" :class="user.twoFactorEnabled ? 'bg-success' : 'bg-secondary'">
                            {{ user.twoFactorEnabled ? 'Enabled' : 'Disabled' }}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="info-item">
                        <div class="info-label">Login Attempts</div>
                        <div class="info-value">
                          <span :class="user.loginAttempts > 3 ? 'text-warning' : 'text-success'">
                            {{ user.loginAttempts || 0 }} attempts
                          </span>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="info-item">
                        <div class="info-label">Account Locked</div>
                        <div class="info-value">
                          <span class="badge" :class="user.lockedUntil ? 'bg-danger' : 'bg-success'">
                            {{ user.lockedUntil ? 'Yes' : 'No' }}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="info-item">
                        <div class="info-label">Token Version</div>
                        <div class="info-value">{{ user.tokenVersion || 0 }}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Activity Information -->
                <div class="info-section">
                  <h6 class="section-title">
                    <i class="fas fa-clock me-2"></i>
                    Activity Information
                  </h6>
                  <div class="row g-3">
                    <div class="col-md-6">
                      <div class="info-item">
                        <div class="info-label">Last Login</div>
                        <div class="info-value">
                          {{ formatDateTime(user.lastLogin) || 'Never' }}
                        </div>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="info-item">
                        <div class="info-label">Password Changed</div>
                        <div class="info-value">
                          {{ formatDateTime(user.passwordChangedAt) || 'Never' }}
                        </div>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="info-item">
                        <div class="info-label">Email Verified At</div>
                        <div class="info-value">
                          {{ formatDateTime(user.emailVerifiedAt) || 'Not verified' }}
                        </div>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="info-item">
                        <div class="info-label">Account Created</div>
                        <div class="info-value">
                          {{ formatDateTime(user.created_at) }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- System Information -->
            <div class="col-12">
              <div class="system-info card bg-light border">
                <div class="card-body">
                  <h6 class="card-title fw-semibold mb-3">
                    <i class="fas fa-cog me-2"></i>
                    System Information
                  </h6>
                  <div class="row g-2">
                    <div class="col-md-3">
                      <div class="system-item">
                        <div class="system-label">User ID</div>
                        <div class="system-value">#{{ user.id }}</div>
                      </div>
                    </div>
                    <div class="col-md-3">
                      <div class="system-item">
                        <div class="system-label">Google ID</div>
                        <div class="system-value">{{ user.googleId || 'Not linked' }}</div>
                      </div>
                    </div>
                    <div class="col-md-3">
                      <div class="system-item">
                        <div class="system-label">Profile Picture</div>
                        <div class="system-value">{{ user.profilePicture ? 'Yes' : 'No' }}</div>
                      </div>
                    </div>
                    <div class="col-md-3">
                      <div class="system-item">
                        <div class="system-label">Deleted At</div>
                        <div class="system-value">{{ user.deleted_at || 'Active' }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer border-0 pt-0">
          <button 
            @click="$emit('close')"
            type="button" 
            class="btn btn-light"
          >
            Close
          </button>
          <button 
            @click="editUser"
            type="button" 
            class="btn btn-primary"
          >
            <i class="fas fa-edit me-2"></i>
            Edit User
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserDetailModal',
  
  props: {
    show: {
      type: Boolean,
      default: false
    },
    user: {
      type: Object,
      default: null
    }
  },

  emits: ['close', 'edit'],

  watch: {
    show(newVal) {
      if (newVal) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = 'auto'
      }
    }
  },

  beforeUnmount() {
    document.body.style.overflow = 'auto'
  },

  methods: {
    formatNumber(value) {
      if (!value && value !== 0) return '0'
      return parseFloat(value).toLocaleString('id-ID')
    },

    formatDateTime(dateString) {
      if (!dateString) return null
      
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      } catch (error) {
        return 'Invalid date'
      }
    },

    getUserInitials(username) {
      if (!username) return 'U'
      return username.substring(0, 2).toUpperCase()
    },

    getRoleBadgeClass(role) {
      switch (role) {
        case 'admin':
          return 'bg-danger'
        case 'user':
          return 'bg-primary'
        default:
          return 'bg-secondary'
      }
    },

    getRoleIcon(role) {
      switch (role) {
        case 'admin':
          return 'fas fa-crown'
        case 'user':
          return 'fas fa-user'
        default:
          return 'fas fa-question'
      }
    },

    editUser() {
      this.$emit('edit', this.user)
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.modal {
  z-index: 1060;
}

.modal-content {
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  padding: 1.5rem 1.5rem 0;
}

.modal-body {
  padding: 1.5rem;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-footer {
  padding: 0 1.5rem 1.5rem;
}

.user-profile-container {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  padding: 2rem 1rem;
}

.user-name {
  color: #495057;
  font-weight: 700;
}

.user-badges .badge {
  font-size: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
}

.user-stats {
  background-color: white;
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid #e9ecef;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #007bff;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-section {
  margin-bottom: 1.5rem;
}

.section-title {
  color: #495057;
  font-weight: 600;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e9ecef;
}

.info-item {
  margin-bottom: 1rem;
}

.info-label {
  font-size: 0.75rem;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.25rem;
}

.info-value {
  font-size: 0.875rem;
  color: #495057;
  font-weight: 500;
}

.status-card {
  display: flex;
  align-items: center;
  padding: 1rem;
  background-color: white;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.status-card:hover {
  background-color: #f8f9fa;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.status-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
  flex-shrink: 0;
}

.status-content {
  flex: 1;
}

.status-label {
  font-size: 0.75rem;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.25rem;
}

.status-value {
  font-size: 0.875rem;
}

.system-info {
  border-radius: 12px;
}

.system-item {
  text-align: center;
  padding: 0.5rem;
}

.system-label {
  font-size: 0.75rem;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.25rem;
}

.system-value {
  font-size: 0.875rem;
  color: #495057;
  font-weight: 500;
}

.badge {
  font-size: 0.75rem;
  padding: 0.4rem 0.6rem;
  border-radius: 6px;
}

.badge.bg-danger {
  background-color: #dc3545 !important;
}

.badge.bg-primary {
  background-color: #007bff !important;
}

.badge.bg-success {
  background-color: #28a745 !important;
}

.badge.bg-warning {
  background-color: #ffc107 !important;
  color: #000;
}

.badge.bg-secondary {
  background-color: #6c757d !important;
}

.btn {
  border-radius: 8px;
  font-weight: 500;
  padding: 0.75rem 1.5rem;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #007bff;
  border-color: #007bff;
}

.btn-primary:hover {
  background-color: #0056b3;
  border-color: #0056b3;
  transform: translateY(-1px);
}

.btn-light {
  background-color: #f8f9fa;
  border-color: #f8f9fa;
  color: #6c757d;
}

.btn-light:hover {
  background-color: #e9ecef;
  border-color: #e9ecef;
  color: #495057;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.2rem;
  opacity: 0.5;
  transition: opacity 0.3s ease;
}

.btn-close:hover {
  opacity: 0.75;
}

/* Responsive Design */
@media (max-width: 768px) {
  .modal-dialog {
    margin: 1rem;
    max-width: calc(100% - 2rem);
  }
  
  .modal-header,
  .modal-body,
  .modal-footer {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  .modal-body {
    max-height: 70vh;
  }
  
  .user-profile-container {
    padding: 1.5rem 1rem;
  }
  
  .user-avatar-large > div {
    width: 80px !important;
    height: 80px !important;
    font-size: 1.8rem !important;
  }
  
  .status-card {
    padding: 0.75rem;
  }
  
  .status-icon {
    width: 32px;
    height: 32px;
    margin-right: 0.5rem;
  }
  
  .system-item {
    padding: 0.25rem;
  }
}

@media (max-width: 576px) {
  .modal-dialog {
    margin: 0.5rem;
    max-width: calc(100% - 1rem);
  }
  
  .user-avatar-large > div {
    width: 60px !important;
    height: 60px !important;
    font-size: 1.2rem !important;
  }
  
  .btn {
    width: 100%;
    margin-bottom: 0.5rem;
  }
  
  .modal-footer {
    flex-direction: column-reverse;
  }
  
  .modal-footer .btn:last-child {
    margin-bottom: 0;
  }
  
  .stat-value {
    font-size: 1.25rem;
  }
  
  .section-title {
    font-size: 0.9rem;
  }
}

/* Custom scrollbar */
.modal-body::-webkit-scrollbar {
  width: 6px;
}

.modal-body::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Animation */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.status-card {
  animation: fadeInUp 0.3s ease-out;
}

.status-card:nth-child(1) { animation-delay: 0.1s; }
.status-card:nth-child(2) { animation-delay: 0.2s; }
.status-card:nth-child(3) { animation-delay: 0.3s; }
</style>