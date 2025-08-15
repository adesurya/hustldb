<!-- /src/components/modals/AwardPointsModal.vue - Award Points Modal -->
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
            <i class="fas fa-gift me-2 text-primary"></i>
            Award Points to User
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
              <!-- User Selection -->
              <div class="col-12">
                <label class="form-label fw-semibold">
                  Select User <span class="text-danger">*</span>
                </label>
                <select
                  v-model="form.userId"
                  class="form-select"
                  :class="{ 'is-invalid': errors.userId }"
                  required
                  @change="handleUserChange"
                >
                  <option value="">Select a user to award points</option>
                  <option 
                    v-for="user in users" 
                    :key="user.id"
                    :value="user.id"
                  >
                    {{ user.username }} ({{ user.email }}) - Current: {{ formatNumber(user.currentPoints || 0) }} pts
                  </option>
                </select>
                <div v-if="errors.userId" class="invalid-feedback">
                  {{ errors.userId }}
                </div>
              </div>

              <!-- Selected User Info -->
              <div v-if="selectedUserInfo" class="col-12">
                <div class="alert alert-light border">
                  <div class="d-flex align-items-center">
                    <div class="user-avatar me-3">
                      <div class="bg-primary rounded-circle d-flex align-items-center justify-content-center" 
                           style="width: 50px; height: 50px;">
                        <span class="text-white fw-bold">{{ getUserInitials(selectedUserInfo.username) }}</span>
                      </div>
                    </div>
                    <div class="flex-grow-1">
                      <h6 class="mb-1 fw-bold">{{ selectedUserInfo.username }}</h6>
                      <p class="mb-1 text-muted small">{{ selectedUserInfo.email }}</p>
                      <p class="mb-0 text-success fw-semibold">
                        <i class="fas fa-coins me-1"></i>
                        Current Points: {{ formatNumber(selectedUserInfo.currentPoints || 0) }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Points Amount -->
              <div class="col-md-6">
                <label class="form-label fw-semibold">
                  Points Amount <span class="text-danger">*</span>
                </label>
                <div class="input-group">
                  <span class="input-group-text">
                    <i class="fas fa-coins text-warning"></i>
                  </span>
                  <input
                    v-model="form.customAmount"
                    type="number"
                    class="form-control"
                    :class="{ 'is-invalid': errors.customAmount }"
                    placeholder="Enter points amount"
                    min="1"
                    max="10000"
                    required
                  >
                  <div v-if="errors.customAmount" class="invalid-feedback">
                    {{ errors.customAmount }}
                  </div>
                </div>
                <div class="form-text">
                  Enter the number of points to award (1 - 10,000)
                </div>
              </div>

              <!-- Activity Code -->
              <div class="col-md-6">
                <label class="form-label fw-semibold">
                  Activity Type
                </label>
                <select
                  v-model="form.activityCode"
                  class="form-select"
                >
                  <option value="MANUAL_AWARD">Manual Award</option>
                  <option value="BONUS_REWARD">Bonus Reward</option>
                  <option value="ACHIEVEMENT_BONUS">Achievement Bonus</option>
                  <option value="SPECIAL_EVENT">Special Event</option>
                  <option value="COMPENSATION">Compensation</option>
                </select>
              </div>

              <!-- Description -->
              <div class="col-12">
                <label class="form-label fw-semibold">
                  Description <span class="text-danger">*</span>
                </label>
                <textarea
                  v-model="form.description"
                  class="form-control"
                  :class="{ 'is-invalid': errors.description }"
                  rows="3"
                  placeholder="Enter reason for awarding points (e.g., Excellent engagement, Special achievement, etc.)"
                  required
                ></textarea>
                <div v-if="errors.description" class="invalid-feedback">
                  {{ errors.description }}
                </div>
              </div>

              <!-- Reference Information -->
              <div class="col-md-6">
                <label class="form-label fw-semibold">
                  Reference ID
                </label>
                <input
                  v-model="form.referenceId"
                  type="text"
                  class="form-control"
                  placeholder="Optional reference ID"
                >
                <div class="form-text">
                  Optional: Add a reference ID for tracking
                </div>
              </div>

              <div class="col-md-6">
                <label class="form-label fw-semibold">
                  Reference Type
                </label>
                <select
                  v-model="form.referenceType"
                  class="form-select"
                >
                  <option value="manual_award">Manual Award</option>
                  <option value="admin_bonus">Admin Bonus</option>
                  <option value="special_event">Special Event</option>
                  <option value="compensation">Compensation</option>
                  <option value="achievement">Achievement</option>
                </select>
              </div>

              <!-- Preview Section -->
              <div v-if="form.userId && form.customAmount" class="col-12">
                <div class="card bg-light">
                  <div class="card-body">
                    <h6 class="card-title fw-bold mb-3">
                      <i class="fas fa-preview me-2"></i>Award Preview
                    </h6>
                    <div class="row g-2">
                      <div class="col-md-4">
                        <div class="preview-item">
                          <span class="preview-label">User:</span>
                          <span class="preview-value">{{ selectedUserInfo?.username || 'Not selected' }}</span>
                        </div>
                      </div>
                      <div class="col-md-4">
                        <div class="preview-item">
                          <span class="preview-label">Current Points:</span>
                          <span class="preview-value text-muted">{{ formatNumber(selectedUserInfo?.currentPoints || 0) }}</span>
                        </div>
                      </div>
                      <div class="col-md-4">
                        <div class="preview-item">
                          <span class="preview-label">Award Amount:</span>
                          <span class="preview-value text-success fw-bold">+{{ formatNumber(form.customAmount) }}</span>
                        </div>
                      </div>
                      <div class="col-12">
                        <hr class="my-2">
                        <div class="preview-item">
                          <span class="preview-label">New Balance:</span>
                          <span class="preview-value text-primary fw-bold fs-5">
                            {{ formatNumber((selectedUserInfo?.currentPoints || 0) + parseInt(form.customAmount || 0)) }} points
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
            :disabled="isSubmitting || !isFormValid"
          >
            <i v-if="isSubmitting" class="fas fa-spinner fa-spin me-2"></i>
            <i v-else class="fas fa-gift me-2"></i>
            {{ isSubmitting ? 'Awarding Points...' : 'Award Points' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AwardPointsModal',
  
  props: {
    show: {
      type: Boolean,
      default: false
    },
    users: {
      type: Array,
      default: () => []
    },
    preselectedUser: {
      type: Object,
      default: null
    }
  },

  emits: ['close', 'award'],

  data() {
    return {
      form: {
        userId: '',
        customAmount: '',
        activityCode: 'MANUAL_AWARD',
        description: '',
        referenceId: '',
        referenceType: 'manual_award'
      },
      errors: {},
      isSubmitting: false
    }
  },

  computed: {
    selectedUserInfo() {
      if (!this.form.userId) return null
      return this.users.find(user => user.id.toString() === this.form.userId.toString())
    },

    isFormValid() {
      return this.form.userId && 
             this.form.customAmount && 
             parseInt(this.form.customAmount) > 0 && 
             this.form.description.trim()
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

    preselectedUser: {
      handler(user) {
        if (user && this.show) {
          this.form.userId = user.id.toString()
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
      this.form = {
        userId: this.preselectedUser ? this.preselectedUser.id.toString() : '',
        customAmount: '',
        activityCode: 'MANUAL_AWARD',
        description: '',
        referenceId: `manual_${Date.now()}`,
        referenceType: 'manual_award'
      }
      this.errors = {}
    },

    handleUserChange() {
      // Clear any previous errors when user changes
      delete this.errors.userId
    },

    getUserInitials(username) {
      if (!username) return 'U'
      return username.substring(0, 2).toUpperCase()
    },

    formatNumber(value) {
      if (!value && value !== 0) return '0'
      return parseFloat(value).toLocaleString('id-ID')
    },

    validateForm() {
      this.errors = {}

      if (!this.form.userId) {
        this.errors.userId = 'Please select a user'
      }

      if (!this.form.customAmount) {
        this.errors.customAmount = 'Points amount is required'
      } else {
        const amount = parseInt(this.form.customAmount)
        if (amount <= 0) {
          this.errors.customAmount = 'Points amount must be greater than 0'
        } else if (amount > 10000) {
          this.errors.customAmount = 'Points amount cannot exceed 10,000'
        }
      }

      if (!this.form.description.trim()) {
        this.errors.description = 'Description is required'
      } else if (this.form.description.trim().length < 10) {
        this.errors.description = 'Description must be at least 10 characters'
      }

      return Object.keys(this.errors).length === 0
    },

    async handleSubmit() {
      if (!this.validateForm()) {
        return
      }

      this.isSubmitting = true

      try {
        const awardData = {
          userId: parseInt(this.form.userId),
          customAmount: parseInt(this.form.customAmount),
          activityCode: this.form.activityCode,
          description: this.form.description.trim(),
          referenceId: this.form.referenceId || `manual_${Date.now()}`,
          referenceType: this.form.referenceType
        }

        console.log('📤 Submitting award data:', awardData)

        this.$emit('award', awardData)
      } catch (error) {
        console.error('Form submission error:', error)
      } finally {
        this.isSubmitting = false
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

.input-group-text {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px 0 0 8px;
  color: #6c757d;
  font-weight: 500;
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

.alert {
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.user-avatar .bg-primary {
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%) !important;
}

.preview-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.preview-label {
  font-weight: 500;
  color: #6c757d;
  font-size: 0.875rem;
}

.preview-value {
  color: #495057;
  font-weight: 600;
}

.card {
  border-radius: 8px;
  border: 1px solid #dee2e6;
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

  .preview-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .preview-label {
    margin-bottom: 0.25rem;
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