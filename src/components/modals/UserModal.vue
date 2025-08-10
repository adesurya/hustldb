<!-- /src/components/modals/UserModal.vue - User add/edit modal -->
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
            {{ isEdit ? 'Edit User' : 'Add New User' }}
          </h5>
          <button 
            @click="$emit('close')"
            type="button" 
            class="btn-close"
          ></button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <div class="row g-3">
              <!-- Username -->
              <div class="col-md-6">
                <label class="form-label fw-semibold">
                  Username <span class="text-danger">*</span>
                </label>
                <input
                  v-model="form.username"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors.username }"
                  placeholder="Enter username"
                  required
                >
                <div v-if="errors.username" class="invalid-feedback">
                  {{ errors.username }}
                </div>
              </div>

              <!-- Email -->
              <div class="col-md-6">
                <label class="form-label fw-semibold">
                  Email <span class="text-danger">*</span>
                </label>
                <input
                  v-model="form.email"
                  type="email"
                  class="form-control"
                  :class="{ 'is-invalid': errors.email }"
                  placeholder="Enter email address"
                  required
                >
                <div v-if="errors.email" class="invalid-feedback">
                  {{ errors.email }}
                </div>
              </div>

              <!-- Password (only for new users) -->
              <div v-if="!isEdit" class="col-12">
                <label class="form-label fw-semibold">
                  Password <span class="text-danger">*</span>
                </label>
                <input
                  v-model="form.password"
                  type="password"
                  class="form-control"
                  :class="{ 'is-invalid': errors.password }"
                  placeholder="Enter password"
                  minlength="8"
                  required
                >
                <div class="form-text">Password must be at least 8 characters long</div>
                <div v-if="errors.password" class="invalid-feedback">
                  {{ errors.password }}
                </div>
              </div>

              <!-- Phone Number -->
              <div class="col-md-6">
                <label class="form-label fw-semibold">
                  Phone Number
                </label>
                <input
                  v-model="form.phoneNumber"
                  type="tel"
                  class="form-control"
                  :class="{ 'is-invalid': errors.phoneNumber }"
                  placeholder="Enter phone number"
                >
                <div v-if="errors.phoneNumber" class="invalid-feedback">
                  {{ errors.phoneNumber }}
                </div>
              </div>

              <!-- Role -->
              <div class="col-md-6">
                <label class="form-label fw-semibold">
                  Role <span class="text-danger">*</span>
                </label>
                <select
                  v-model="form.role"
                  class="form-select"
                  :class="{ 'is-invalid': errors.role }"
                  required
                >
                  <option value="">Select role</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                <div v-if="errors.role" class="invalid-feedback">
                  {{ errors.role }}
                </div>
              </div>

              <!-- Current Points (only for edit) -->
              <div v-if="isEdit" class="col-md-6">
                <label class="form-label fw-semibold">
                  Current Points
                </label>
                <input
                  v-model="form.currentPoints"
                  type="number"
                  class="form-control"
                  :class="{ 'is-invalid': errors.currentPoints }"
                  placeholder="0"
                  min="0"
                >
                <div v-if="errors.currentPoints" class="invalid-feedback">
                  {{ errors.currentPoints }}
                </div>
              </div>

              <!-- Status Toggles -->
              <div class="col-12">
                <div class="row g-3">
                  <div class="col-md-4">
                    <div class="form-check form-switch">
                      <input
                        v-model="form.isActive"
                        class="form-check-input"
                        type="checkbox"
                        id="isActive"
                      >
                      <label class="form-check-label fw-semibold" for="isActive">
                        Active User
                      </label>
                    </div>
                  </div>
                  
                  <div class="col-md-4">
                    <div class="form-check form-switch">
                      <input
                        v-model="form.isVerified"
                        class="form-check-input"
                        type="checkbox"
                        id="isVerified"
                      >
                      <label class="form-check-label fw-semibold" for="isVerified">
                        Email Verified
                      </label>
                    </div>
                  </div>

                  <div class="col-md-4">
                    <div class="form-check form-switch">
                      <input
                        v-model="form.canEarnPoints"
                        class="form-check-input"
                        type="checkbox"
                        id="canEarnPoints"
                      >
                      <label class="form-check-label fw-semibold" for="canEarnPoints">
                        Can Earn Points
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <!-- User Information (for edit mode) -->
              <div v-if="isEdit && user" class="col-12">
                <div class="card bg-light border">
                  <div class="card-body">
                    <h6 class="card-title fw-semibold mb-3">
                      <i class="fas fa-info-circle me-2"></i>
                      User Information
                    </h6>
                    <div class="row g-2">
                      <div class="col-md-4">
                        <small class="text-muted">User ID:</small>
                        <div class="fw-semibold">#{{ user.id }}</div>
                      </div>
                      <div class="col-md-4">
                        <small class="text-muted">Created:</small>
                        <div class="fw-semibold">{{ formatDate(user.created_at) }}</div>
                      </div>
                      <div class="col-md-4">
                        <small class="text-muted">Last Login:</small>
                        <div class="fw-semibold">{{ formatDate(user.lastLogin) || 'Never' }}</div>
                      </div>
                      <div class="col-md-4">
                        <small class="text-muted">Login Attempts:</small>
                        <div class="fw-semibold">{{ user.loginAttempts || 0 }}</div>
                      </div>
                      <div class="col-md-4">
                        <small class="text-muted">Token Version:</small>
                        <div class="fw-semibold">{{ user.tokenVersion || 0 }}</div>
                      </div>
                      <div class="col-md-4">
                        <small class="text-muted">Two Factor:</small>
                        <div class="fw-semibold">
                          <span class="badge" :class="user.twoFactorEnabled ? 'bg-success' : 'bg-secondary'">
                            {{ user.twoFactorEnabled ? 'Enabled' : 'Disabled' }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
        
        <div class="modal-footer border-0 pt-0">
          <button 
            @click="$emit('close')"
            type="button" 
            class="btn btn-light"
          >
            Cancel
          </button>
          <button 
            @click="handleSubmit"
            type="button" 
            class="btn btn-primary"
            :disabled="isSubmitting"
          >
            <i v-if="isSubmitting" class="fas fa-spinner fa-spin me-2"></i>
            <i v-else :class="isEdit ? 'fas fa-save' : 'fas fa-plus'" class="me-2"></i>
            {{ isEdit ? 'Update User' : 'Create User' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserModal',
  
  props: {
    show: {
      type: Boolean,
      default: false
    },
    user: {
      type: Object,
      default: null
    },
    isEdit: {
      type: Boolean,
      default: false
    }
  },

  emits: ['close', 'save'],

  data() {
    return {
      form: {
        username: '',
        email: '',
        password: '',
        phoneNumber: '',
        role: 'user',
        currentPoints: 0,
        isActive: true,
        isVerified: true,
        canEarnPoints: true
      },
      errors: {},
      isSubmitting: false
    }
  },

  watch: {
    show: {
      handler(newVal) {
        if (newVal) {
          this.initializeForm()
          document.body.style.overflow = 'hidden'
        } else {
          document.body.style.overflow = 'auto'
        }
      },
      immediate: true
    },

    user: {
      handler() {
        if (this.show) {
          this.initializeForm()
        }
      },
      immediate: true
    }
  },

  beforeUnmount() {
    document.body.style.overflow = 'auto'
  },

  methods: {
    initializeForm() {
      if (this.isEdit && this.user) {
        this.form = {
          username: this.user.username || '',
          email: this.user.email || '',
          password: '', // Never populate password for security
          phoneNumber: this.user.phoneNumber || '',
          role: this.user.role || 'user',
          currentPoints: this.user.currentPoints || 0,
          isActive: this.user.isActive !== undefined ? this.user.isActive : true,
          isVerified: this.user.isVerified !== undefined ? this.user.isVerified : true,
          canEarnPoints: this.user.canEarnPoints !== undefined ? this.user.canEarnPoints : true
        }
      } else {
        this.form = {
          username: '',
          email: '',
          password: '',
          phoneNumber: '',
          role: 'user',
          currentPoints: 0,
          isActive: true,
          isVerified: true,
          canEarnPoints: true
        }
      }
      
      this.errors = {}
    },

    validateForm() {
      this.errors = {}

      if (!this.form.username.trim()) {
        this.errors.username = 'Username is required'
      } else if (this.form.username.length < 3) {
        this.errors.username = 'Username must be at least 3 characters'
      }

      if (!this.form.email.trim()) {
        this.errors.email = 'Email is required'
      } else if (!this.isValidEmail(this.form.email)) {
        this.errors.email = 'Please enter a valid email address'
      }

      if (!this.isEdit) {
        if (!this.form.password) {
          this.errors.password = 'Password is required'
        } else if (this.form.password.length < 8) {
          this.errors.password = 'Password must be at least 8 characters'
        }
      }

      if (!this.form.role) {
        this.errors.role = 'Role is required'
      }

      if (this.form.phoneNumber && !this.isValidPhoneNumber(this.form.phoneNumber)) {
        this.errors.phoneNumber = 'Please enter a valid phone number'
      }

      if (this.form.currentPoints < 0) {
        this.errors.currentPoints = 'Points cannot be negative'
      }

      return Object.keys(this.errors).length === 0
    },

    isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(email)
    },

    isValidPhoneNumber(phone) {
      // Basic phone validation - adjust regex as needed
      const phoneRegex = /^[\d\s\-\+\(\)]{8,15}$/
      return phoneRegex.test(phone.replace(/\s/g, ''))
    },

    async handleSubmit() {
      if (!this.validateForm()) {
        return
      }

      this.isSubmitting = true

      try {
        // Prepare form data
        const formData = {
          ...this.form,
          currentPoints: parseInt(this.form.currentPoints) || 0
        }

        // Remove empty optional fields
        if (!formData.phoneNumber) delete formData.phoneNumber
        if (this.isEdit && !formData.password) delete formData.password

        this.$emit('save', formData)
      } catch (error) {
        console.error('Form submission error:', error)
      } finally {
        this.isSubmitting = false
      }
    },

    formatDate(dateString) {
      if (!dateString) return 'Not available'
      
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      } catch (error) {
        return 'Invalid date'
      }
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
}

.modal-footer {
  padding: 0 1.5rem 1.5rem;
}

.form-label {
  color: #495057;
  margin-bottom: 0.5rem;
}

.form-control,
.form-select {
  border-radius: 8px;
  border: 1px solid #dee2e6;
  padding: 0.75rem 1rem;
  transition: all 0.3s ease;
}

.form-control:focus,
.form-select:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.form-control.is-invalid,
.form-select.is-invalid {
  border-color: #dc3545;
}

.form-control.is-invalid:focus,
.form-select.is-invalid:focus {
  border-color: #dc3545;
  box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
}

.invalid-feedback {
  display: block;
  font-size: 0.875rem;
  color: #dc3545;
  margin-top: 0.25rem;
}

.form-check-input {
  width: 2.5rem;
  height: 1.25rem;
  border-radius: 1rem;
  background-color: #dee2e6;
  border: none;
  transition: all 0.3s ease;
}

.form-check-input:checked {
  background-color: #007bff;
  border-color: #007bff;
}

.form-check-input:focus {
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.form-check-label {
  color: #495057;
  margin-left: 0.5rem;
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

.btn-primary:hover:not(:disabled) {
  background-color: #0056b3;
  border-color: #0056b3;
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

.card {
  border-radius: 8px;
}

.badge {
  font-size: 0.75rem;
  padding: 0.4rem 0.6rem;
  border-radius: 6px;
}

.badge.bg-success {
  background-color: #28a745 !important;
}

.badge.bg-secondary {
  background-color: #6c757d !important;
}

.text-danger {
  color: #dc3545 !important;
}

.fw-semibold {
  font-weight: 600;
}

.fa-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
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
  
  .btn {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }
  
  .form-control,
  .form-select {
    padding: 0.5rem 0.75rem;
  }
}

@media (max-width: 576px) {
  .modal-dialog {
    margin: 0.5rem;
    max-width: calc(100% - 1rem);
  }
  
  .modal-body {
    max-height: 70vh;
    overflow-y: auto;
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
}

/* Custom scrollbar for modal body */
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
</style>