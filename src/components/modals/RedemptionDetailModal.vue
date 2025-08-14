<!-- /src/components/modals/RedemptionDetailModal.vue -->
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
            Redemption Details
          </h5>
          <button 
            @click="$emit('close')"
            type="button" 
            class="btn-close"
          ></button>
        </div>
        
        <div class="modal-body">
          <!-- Loading State -->
          <div v-if="redemption && redemption.isLoading" class="text-center py-5">
            <div class="spinner-border text-primary mb-3" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="text-muted">Loading redemption details...</p>
          </div>

          <!-- Redemption Content -->
          <div v-else-if="redemption" class="row g-4">
            <!-- User Information -->
            <div class="col-md-6">
              <div class="info-section">
                <h6 class="info-section-title">User Information</h6>
                <div class="info-item">
                  <span class="info-item-label">Username:</span>
                  <span class="info-item-value">{{ redemption.user.username }}</span>
                </div>
                <div class="info-item">
                  <span class="info-item-label">Email:</span>
                  <span class="info-item-value">{{ redemption.user.email }}</span>
                </div>
                <div class="info-item">
                  <span class="info-item-label">User ID:</span>
                  <span class="info-item-value">#{{ redemption.userId }}</span>
                </div>
              </div>
            </div>

            <!-- Redemption Information -->
            <div class="col-md-6">
              <div class="info-section">
                <h6 class="info-section-title">Redemption Information</h6>
                <div class="info-item">
                  <span class="info-item-label">Points Redeemed:</span>
                  <span class="info-item-value text-primary fw-bold">
                    {{ formatNumber(redemption.pointsRedeemed) }}
                  </span>
                </div>
                <div class="info-item">
                  <span class="info-item-label">Type:</span>
                  <span class="info-item-value">
                    <span class="badge bg-info text-capitalize">
                      {{ redemption.redemptionType }}
                    </span>
                  </span>
                </div>
                <div class="info-item">
                  <span class="info-item-label">Value:</span>
                  <span class="info-item-value text-success fw-bold">
                    {{ formatCurrency(redemption.redemptionValue) }}
                  </span>
                </div>
                <div class="info-item">
                  <span class="info-item-label">Status:</span>
                  <span class="info-item-value">
                    <span 
                      :class="getStatusBadgeClass(redemption.status)"
                      class="badge"
                    >
                      {{ redemption.status.charAt(0).toUpperCase() + redemption.status.slice(1) }}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <!-- Bank Details -->
            <div class="col-12" v-if="redemption.redemptionDetails">
              <div class="info-section">
                <h6 class="info-section-title">Bank Details</h6>
                <div class="row g-3">
                  <div class="col-md-4">
                    <div class="info-item">
                      <span class="info-item-label">Bank Name:</span>
                      <span class="info-item-value">
                        {{ redemption.redemptionDetails.bankName }}
                      </span>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="info-item">
                      <span class="info-item-label">Account Name:</span>
                      <span class="info-item-value">
                        {{ redemption.redemptionDetails.accountName }}
                      </span>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="info-item">
                      <span class="info-item-label">Account Number:</span>
                      <span class="info-item-value">
                        {{ redemption.redemptionDetails.bankAccount }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Timestamps -->
            <div class="col-12">
              <div class="info-section">
                <h6 class="info-section-title">Timestamps</h6>
                <div class="row g-2">
                  <div class="col-md-6">
                    <div class="info-item">
                      <span class="info-item-label">Requested At:</span>
                      <span class="info-item-value">
                        {{ formatDate(redemption.requestedAt) }}
                      </span>
                    </div>
                  </div>
                  <div class="col-md-6" v-if="redemption.processedAt">
                    <div class="info-item">
                      <span class="info-item-label">Processed At:</span>
                      <span class="info-item-value">
                        {{ formatDate(redemption.processedAt) }}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div class="row g-2 mt-2">
                  <div class="col-md-6" v-if="redemption.processedBy">
                    <div class="info-item">
                      <span class="info-item-label">Processed By:</span>
                      <span class="info-item-value">
                        Admin #{{ redemption.processedBy }}
                      </span>
                    </div>
                  </div>
                  <div class="col-md-6" v-if="redemption.transactionId">
                    <div class="info-item">
                      <span class="info-item-label">Transaction ID:</span>
                      <span class="info-item-value">
                        #{{ redemption.transactionId }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Admin Notes -->
            <div class="col-12" v-if="redemption.adminNotes">
              <div class="info-section">
                <h6 class="info-section-title">Admin Notes</h6>
                <div class="alert alert-light border">
                  <p class="mb-0">{{ redemption.adminNotes }}</p>
                </div>
              </div>
            </div>

            <!-- System Information -->
            <div class="col-12">
              <div class="info-section">
                <h6 class="info-section-title">System Information</h6>
                <div class="row g-2">
                  <div class="col-md-4">
                    <div class="info-item">
                      <span class="info-item-label">Redemption ID:</span>
                      <span class="info-item-value">#{{ redemption.id }}</span>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="info-item">
                      <span class="info-item-label">Created:</span>
                      <span class="info-item-value">
                        {{ formatDate(redemption.created_at) }}
                      </span>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="info-item">
                      <span class="info-item-label">Updated:</span>
                      <span class="info-item-value">
                        {{ formatDate(redemption.updated_at) }}
                      </span>
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
          
          <!-- Action Buttons for Pending Redemptions -->
          <div v-if="redemption && redemption.status === 'pending'" class="btn-group">
            <button 
              @click="handleApprove"
              type="button" 
              class="btn btn-success"
              :disabled="isProcessing"
            >
              <i v-if="isProcessing" class="fas fa-spinner fa-spin me-2"></i>
              <i v-else class="fas fa-check me-2"></i>
              Approve
            </button>
            <button 
              @click="handleReject"
              type="button" 
              class="btn btn-danger"
              :disabled="isProcessing"
            >
              <i v-if="isProcessing" class="fas fa-spinner fa-spin me-2"></i>
              <i v-else class="fas fa-times me-2"></i>
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RedemptionDetailModal',
  
  props: {
    show: {
      type: Boolean,
      default: false
    },
    redemption: {
      type: Object,
      default: null
    }
  },

  emits: ['close', 'approve', 'reject'],

  data() {
    return {
      isProcessing: false
    }
  },

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

    formatCurrency(value) {
      if (!value && value !== 0) return 'Rp 0'
      return `Rp ${parseFloat(value).toLocaleString('id-ID')}`
    },

    formatDate(dateString) {
      if (!dateString) return 'Not available'
      
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

    getStatusBadgeClass(status) {
      switch (status) {
        case 'pending':
          return 'bg-warning text-dark'
        case 'approved':
          return 'bg-success'
        case 'rejected':
          return 'bg-danger'
        default:
          return 'bg-secondary'
      }
    },

    handleApprove() {
      this.$emit('approve', this.redemption)
    },

    handleReject() {
      this.$emit('reject', this.redemption)
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

.info-section {
  background-color: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e9ecef;
  margin-bottom: 1rem;
}

.info-section:last-child {
  margin-bottom: 0;
}

.info-section-title {
  color: #495057;
  font-weight: 600;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #dee2e6;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.info-item:last-child {
  border-bottom: none;
}

.info-item-label {
  font-weight: 500;
  color: #6c757d;
  min-width: 120px;
  margin-right: 1rem;
}

.info-item-value {
  color: #495057;
  text-align: right;
  flex: 1;
  word-break: break-word;
}

.badge {
  font-size: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
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
  
  .modal-body {
    max-height: 70vh;
  }
  
  .info-section {
    padding: 1rem;
  }
  
  .info-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .info-item-label {
    min-width: auto;
    margin-right: 0;
    margin-bottom: 0.25rem;
  }
  
  .info-item-value {
    text-align: left;
  }
}

@media (max-width: 576px) {
  .modal-dialog {
    margin: 0.5rem;
    max-width: calc(100% - 1rem);
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
</style>