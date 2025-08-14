<!-- /src/components/modals/RedemptionProcessModal.vue -->
<template>
  <div 
    v-if="show"
    class="modal fade show d-block"
    tabindex="-1"
    style="background-color: rgba(0,0,0,0.5);"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content border-0">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title fw-bold" :class="actionType === 'approve' ? 'text-success' : 'text-danger'">
            <i :class="actionType === 'approve' ? 'fas fa-check-circle' : 'fas fa-times-circle'" class="me-2"></i>
            {{ actionType === 'approve' ? 'Approve Redemption' : 'Reject Redemption' }}
          </h5>
          <button 
            @click="$emit('close')"
            type="button" 
            class="btn-close"
          ></button>
        </div>
        
        <div class="modal-body">
          <p class="mb-3">
            Are you sure you want to {{ actionType }} this redemption?
          </p>
          
          <!-- Redemption Summary -->
          <div v-if="redemption" class="alert" :class="actionType === 'approve' ? 'alert-success' : 'alert-danger'" style="background-color: rgba(40, 167, 69, 0.1); border-color: rgba(40, 167, 69, 0.2);">
            <div class="d-flex align-items-start">
              <div class="me-3">
                <i class="fas fa-user-circle fa-2x text-muted"></i>
              </div>
              <div class="flex-grow-1">
                <h6 class="mb-1 fw-bold">{{ redemption.user.username }}</h6>
                <small class="text-muted d-block mb-2">{{ redemption.user.email }}</small>
                
                <div class="row g-2 small">
                  <div class="col-6">
                    <strong>Points:</strong> {{ formatNumber(redemption.pointsRedeemed) }}
                  </div>
                  <div class="col-6">
                    <strong>Value:</strong> {{ formatCurrency(redemption.redemptionValue) }}
                  </div>
                  <div class="col-6">
                    <strong>Type:</strong> {{ redemption.redemptionType }}
                  </div>
                  <div class="col-6">
                    <strong>Bank:</strong> {{ redemption.redemptionDetails.bankName }}
                  </div>
                </div>
                
                <div class="mt-2 small">
                  <strong>Account:</strong> {{ redemption.redemptionDetails.accountName }} - {{ redemption.redemptionDetails.bankAccount }}
                </div>
              </div>
            </div>
          </div>
          
          <!-- Notes Input -->
          <div class="mb-3">
            <label class="form-label fw-semibold">
              Admin Notes {{ actionType === 'reject' ? '(Required)' : '(Optional)' }}
            </label>
            <textarea
              v-model="notes"
              class="form-control"
              :class="{ 'is-invalid': errors.notes }"
              rows="3"
              :placeholder="actionType === 'approve' ? 'Enter approval notes (optional)...' : 'Enter rejection reason...'"
              :required="actionType === 'reject'"
            ></textarea>
            <div v-if="errors.notes" class="invalid-feedback">
              {{ errors.notes }}
            </div>
            <div class="form-text">
              {{ actionType === 'approve' 
                ? 'Optional notes for the approval decision.' 
                : 'Please provide a clear reason for rejection.' 
              }}
            </div>
          </div>
          
          <!-- Warning for rejection -->
          <div v-if="actionType === 'reject'" class="alert alert-warning border-warning">
            <div class="d-flex align-items-center">
              <i class="fas fa-exclamation-triangle me-2"></i>
              <small>
                <strong>Note:</strong> Rejecting this redemption will return the points to the user's account.
              </small>
            </div>
          </div>
          
          <!-- Confirmation for approval -->
          <div v-if="actionType === 'approve'" class="alert alert-info border-info">
            <div class="d-flex align-items-center">
              <i class="fas fa-info-circle me-2"></i>
              <small>
                <strong>Note:</strong> Approving this redemption will process the payment and mark it as completed.
              </small>
            </div>
          </div>
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
            :class="actionType === 'approve' ? 'btn btn-success' : 'btn btn-danger'"
            :disabled="isSubmitting || (actionType === 'reject' && !notes.trim())"
          >
            <i v-if="isSubmitting" class="fas fa-spinner fa-spin me-2"></i>
            <i v-else :class="actionType === 'approve' ? 'fas fa-check' : 'fas fa-times'" class="me-2"></i>
            {{ isSubmitting 
              ? (actionType === 'approve' ? 'Approving...' : 'Rejecting...') 
              : (actionType === 'approve' ? 'Approve Redemption' : 'Reject Redemption') 
            }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RedemptionProcessModal',
  
  props: {
    show: {
      type: Boolean,
      default: false
    },
    redemption: {
      type: Object,
      default: null
    },
    actionType: {
      type: String,
      default: 'approve', // 'approve' or 'reject'
      validator: (value) => ['approve', 'reject'].includes(value)
    }
  },

  emits: ['close', 'submit'],

  data() {
    return {
      notes: '',
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

    actionType() {
      this.initializeForm()
    },

    notes() {
      // Clear errors when user starts typing
      if (this.errors.notes) {
        delete this.errors.notes
      }
    }
  },

  beforeUnmount() {
    document.body.style.overflow = 'auto'
  },

  methods: {
    initializeForm() {
      this.notes = ''
      this.errors = {}
      this.isSubmitting = false
    },

    formatNumber(value) {
      if (!value && value !== 0) return '0'
      return parseFloat(value).toLocaleString('id-ID')
    },

    formatCurrency(value) {
      if (!value && value !== 0) return 'Rp 0'
      return `Rp ${parseFloat(value).toLocaleString('id-ID')}`
    },

    validateForm() {
      this.errors = {}

      // Notes are required for rejection
      if (this.actionType === 'reject' && !this.notes.trim()) {
        this.errors.notes = 'Rejection reason is required'
      }

      // Notes should be reasonable length
      if (this.notes.trim() && this.notes.trim().length < 3) {
        this.errors.notes = 'Please provide a more detailed note'
      }

      if (this.notes.trim() && this.notes.trim().length > 500) {
        this.errors.notes = 'Notes must be less than 500 characters'
      }

      return Object.keys(this.errors).length === 0
    },

    async handleSubmit() {
      if (!this.validateForm()) {
        return
      }

      this.isSubmitting = true

      try {
        const submitData = {
          redemption: this.redemption,
          actionType: this.actionType,
          notes: this.notes.trim()
        }

        console.log('📤 Submitting redemption process:', submitData)

        this.$emit('submit', submitData)
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
  z-index: 1070;
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

.form-control {
  border-radius: 8px;
  border: 1px solid #dee2e6;
  padding: 0.75rem 1rem;
  transition: all 0.3s ease;
}

.form-control:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.form-control.is-invalid {
  border-color: #dc3545;
}

.form-control.is-invalid:focus {
  border-color: #dc3545;
  box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
}

.invalid-feedback {
  display: block;
  font-size: 0.875rem;
  color: #dc3545;
  margin-top: 0.25rem;
}

.alert {
  border-radius: 8px;
  padding: 1rem;
}

.alert-success {
  background-color: rgba(40, 167, 69, 0.1);
  border-color: rgba(40, 167, 69, 0.2);
  color: #155724;
}

.alert-danger {
  background-color: rgba(220, 53, 69, 0.1);
  border-color: rgba(220, 53, 69, 0.2);
  color: #721c24;
}

.alert-warning {
  background-color: rgba(255, 193, 7, 0.1);
  border-color: rgba(255, 193, 7, 0.2);
  color: #856404;
}

.alert-info {
  background-color: rgba(23, 162, 184, 0.1);
  border-color: rgba(23, 162, 184, 0.2);
  color: #0c5460;
}

.btn {
  border-radius: 8px;
  font-weight: 500;
  padding: 0.75rem 1.5rem;
  transition: all 0.3s ease;
}

.btn-success {
  background-color: #28a745;
  border-color: #28a745;
}

.btn-success:hover:not(:disabled) {
  background-color: #218838;
  border-color: #1e7e34;
  transform: translateY(-1px);
}

.btn-danger {
  background-color: #dc3545;
  border-color: #dc3545;
}

.btn-danger:hover:not(:disabled) {
  background-color: #c82333;
  border-color: #bd2130;
  transform: translateY(-1px);
}

.btn:disabled {
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

.text-success {
  color: #28a745 !important;
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
  
  .form-control {
    padding: 0.5rem 0.75rem;
  }
}

@media (max-width: 576px) {
  .modal-dialog {
    margin: 0.5rem;
    max-width: calc(100% - 1rem);
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
</style>