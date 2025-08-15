<!-- /src/components/modals/PointTransactionsModal.vue - Point Transactions History Modal -->
<template>
  <div 
    v-if="show"
    class="modal fade show d-block"
    tabindex="-1"
    style="background-color: rgba(0,0,0,0.5);"
  >
    <div class="modal-dialog modal-xl modal-dialog-centered">
      <div class="modal-content border-0">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title fw-bold">
            <i class="fas fa-history me-2 text-primary"></i>
            {{ selectedUser ? `${selectedUser.username}'s Point History` : 'All Point Transactions' }}
          </h5>
          <button 
            @click="$emit('close')"
            type="button" 
            class="btn-close"
          ></button>
        </div>
        
        <div class="modal-body">
          <!-- User Info (if specific user selected) -->
          <div v-if="selectedUser" class="mb-4">
            <div class="alert alert-light border">
              <div class="d-flex align-items-center">
                <div class="user-avatar me-3">
                  <div class="bg-primary rounded-circle d-flex align-items-center justify-content-center" 
                       style="width: 50px; height: 50px;">
                    <span class="text-white fw-bold">{{ getUserInitials(selectedUser.username) }}</span>
                  </div>
                </div>
                <div class="flex-grow-1">
                  <h6 class="mb-1 fw-bold">{{ selectedUser.username }}</h6>
                  <p class="mb-1 text-muted small">{{ selectedUser.email }}</p>
                  <p class="mb-0 text-success fw-semibold">
                    <i class="fas fa-coins me-1"></i>
                    Current Points: {{ formatNumber(selectedUser.currentPoints || 0) }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Filters -->
          <div class="card border-0 mb-4">
            <div class="card-body bg-light">
              <h6 class="card-title fw-bold mb-3">
                <i class="fas fa-filter me-2"></i>Filters
              </h6>
              <div class="row g-3">
                <!-- Transaction Type -->
                <div class="col-md-3">
                  <label class="form-label small fw-semibold">Transaction Type</label>
                  <select 
                    v-model="filters.transactionType"
                    @change="applyFilters"
                    class="form-select form-select-sm"
                  >
                    <option value="">All Types</option>
                    <option value="credit">Credit (+)</option>
                    <option value="debit">Debit (-)</option>
                  </select>
                </div>

                <!-- Activity Type -->
                <div class="col-md-3">
                  <label class="form-label small fw-semibold">Activity Type</label>
                  <select 
                    v-model="filters.activityType"
                    @change="applyFilters"
                    class="form-select form-select-sm"
                  >
                    <option value="">All Activities</option>
                    <option value="DAILY_LOGIN">Daily Login</option>
                    <option value="PRODUCT_SHARE">Product Share</option>
                    <option value="CAMPAIGN_SHARE">Campaign Share</option>
                    <option value="EMAIL_VERIFY">Email Verification</option>
                    <option value="MANUAL_AWARD">Manual Award</option>
                    <option value="REDEMPTION">Redemption</option>
                  </select>
                </div>

                <!-- Status -->
                <div class="col-md-3">
                  <label class="form-label small fw-semibold">Status</label>
                  <select 
                    v-model="filters.status"
                    @change="applyFilters"
                    class="form-select form-select-sm"
                  >
                    <option value="">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>

                <!-- Clear Filters -->
                <div class="col-md-3 d-flex align-items-end">
                  <button 
                    @click="clearFilters"
                    class="btn btn-outline-secondary btn-sm w-100"
                    :disabled="!hasActiveFilters"
                  >
                    <i class="fas fa-times me-2"></i>
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="isLoading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="text-muted mt-2">Loading transactions...</p>
          </div>

          <!-- Transactions Table -->
          <div v-else-if="transactions.length === 0" class="text-center py-5">
            <div class="empty-state">
              <i class="fas fa-history fa-3x text-muted mb-3"></i>
              <h5 class="text-muted">No transactions found</h5>
              <p class="text-muted">
                {{ hasActiveFilters ? 'Try adjusting your filters' : 'No point transactions available' }}
              </p>
            </div>
          </div>

          <div v-else class="table-responsive">
            <table class="table table-hover">
              <thead class="table-light">
                <tr>
                  <th style="width: 80px;">Type</th>
                  <th v-if="!selectedUser" style="width: 150px;">User</th>
                  <th style="width: 100px;">Amount</th>
                  <th style="width: 120px;">Activity</th>
                  <th>Description</th>
                  <th style="width: 100px;">Status</th>
                  <th style="width: 130px;">Date</th>
                  <th style="width: 60px;">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="transaction in transactions" :key="transaction.id">
                  <!-- Transaction Type -->
                  <td>
                    <span 
                      :class="transaction.transactionType === 'credit' ? 'badge bg-success' : 'badge bg-danger'"
                    >
                      <i 
                        :class="transaction.transactionType === 'credit' ? 'fas fa-plus' : 'fas fa-minus'"
                        class="me-1"
                      ></i>
                      {{ transaction.transactionType === 'credit' ? 'Credit' : 'Debit' }}
                    </span>
                  </td>

                  <!-- User (only show if not viewing specific user) -->
                  <td v-if="!selectedUser">
                    <div v-if="transaction.user">
                      <div class="fw-semibold small">{{ transaction.user.username }}</div>
                      <div class="text-muted smaller">{{ transaction.user.email }}</div>
                    </div>
                    <span v-else class="text-muted small">Deleted User</span>
                  </td>

                  <!-- Amount -->
                  <td>
                    <span 
                      :class="transaction.transactionType === 'credit' ? 'text-success' : 'text-danger'"
                      class="fw-bold"
                    >
                      {{ transaction.transactionType === 'credit' ? '+' : '-' }}{{ formatNumber(transaction.amount) }}
                    </span>
                  </td>

                  <!-- Activity -->
                  <td>
                    <span class="badge bg-light text-dark">
                      {{ getActivityLabel(transaction.activityType) }}
                    </span>
                  </td>

                  <!-- Description -->
                  <td>
                    <div class="description-cell">
                      <div class="fw-semibold small">{{ transaction.activityDescription }}</div>
                      <div v-if="transaction.metadata?.adminNote" class="text-muted smaller">
                        {{ transaction.metadata.adminNote }}
                      </div>
                      <div v-if="transaction.notes" class="text-muted smaller">
                        {{ transaction.notes }}
                      </div>
                    </div>
                  </td>

                  <!-- Status -->
                  <td>
                    <span 
                      :class="{
                        'badge bg-success': transaction.status === 'completed',
                        'badge bg-warning': transaction.status === 'pending',
                        'badge bg-danger': transaction.status === 'failed'
                      }"
                    >
                      {{ transaction.status }}
                    </span>
                  </td>

                  <!-- Date -->
                  <td>
                    <div class="small">
                      <div>{{ formatDate(transaction.created_at) }}</div>
                      <div class="text-muted smaller">{{ formatTime(transaction.created_at) }}</div>
                    </div>
                  </td>

                  <!-- Actions -->
                  <td>
                    <div class="dropdown">
                      <button
                        class="btn btn-sm btn-light rounded-circle"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        <i class="fas fa-ellipsis-v"></i>
                      </button>
                      <ul class="dropdown-menu dropdown-menu-end">
                        <li>
                          <a 
                            @click="viewTransactionDetails(transaction)"
                            class="dropdown-item"
                            href="#"
                          >
                            <i class="fas fa-eye me-2"></i>View Details
                          </a>
                        </li>
                        <li v-if="transaction.referenceId">
                          <a 
                            @click="copyReferenceId(transaction.referenceId)"
                            class="dropdown-item"
                            href="#"
                          >
                            <i class="fas fa-copy me-2"></i>Copy Reference
                          </a>
                        </li>
                      </ul>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div v-if="pagination.totalPages > 1" class="d-flex justify-content-center mt-4">
            <nav>
              <ul class="pagination pagination-sm">
                <li class="page-item" :class="{ disabled: !pagination.hasPrevPage }">
                  <button 
                    @click="goToPage(pagination.currentPage - 1)"
                    class="page-link"
                    :disabled="!pagination.hasPrevPage"
                  >
                    Previous
                  </button>
                </li>
                
                <li 
                  v-for="page in visiblePages" 
                  :key="page"
                  class="page-item"
                  :class="{ active: page === pagination.currentPage }"
                >
                  <button 
                    @click="goToPage(page)"
                    class="page-link"
                  >
                    {{ page }}
                  </button>
                </li>
                
                <li class="page-item" :class="{ disabled: !pagination.hasNextPage }">
                  <button 
                    @click="goToPage(pagination.currentPage + 1)"
                    class="page-link"
                    :disabled="!pagination.hasNextPage"
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
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
            v-if="!selectedUser"
            @click="exportTransactions"
            type="button" 
            class="btn btn-outline-primary"
            :disabled="isLoading"
          >
            <i class="fas fa-download me-2"></i>
            Export CSV
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PointTransactionsModal',
  
  props: {
    show: {
      type: Boolean,
      default: false
    },
    transactions: {
      type: Array,
      default: () => []
    },
    pagination: {
      type: Object,
      default: () => ({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 20,
        hasPrevPage: false,
        hasNextPage: false
      })
    },
    selectedUser: {
      type: Object,
      default: null
    },
    isLoading: {
      type: Boolean,
      default: false
    }
  },

  emits: ['close', 'filter-change', 'page-change', 'view-details'],

  data() {
    return {
      filters: {
        transactionType: '',
        activityType: '',
        status: '',
        startDate: '',
        endDate: ''
      }
    }
  },

  computed: {
    hasActiveFilters() {
      return Object.values(this.filters).some(value => value !== '')
    },

    visiblePages() {
      const current = this.pagination.currentPage
      const total = this.pagination.totalPages
      const delta = 2
      const range = []
      const rangeWithDots = []

      for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
        range.push(i)
      }

      if (current - delta > 2) {
        rangeWithDots.push(1, '...')
      } else {
        rangeWithDots.push(1)
      }

      rangeWithDots.push(...range)

      if (current + delta < total - 1) {
        rangeWithDots.push('...', total)
      } else {
        rangeWithDots.push(total)
      }

      return rangeWithDots.filter((v, i, a) => a.indexOf(v) === i && v !== 1 || i === 0)
    }
  },

  watch: {
    show: {
      handler(newVal) {
        if (newVal) {
          document.body.style.overflow = 'hidden'
        } else {
          document.body.style.overflow = 'auto'
        }
      },
      immediate: true
    }
  },

  beforeUnmount() {
    document.body.style.overflow = 'auto'
  },

  methods: {
    getUserInitials(username) {
      if (!username) return 'U'
      return username.substring(0, 2).toUpperCase()
    },

    formatNumber(value) {
      if (!value && value !== 0) return '0'
      return parseFloat(value).toLocaleString('id-ID')
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A'
      
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
    },

    formatTime(dateString) {
      if (!dateString) return 'N/A'
      
      try {
        const date = new Date(dateString)
        return date.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit'
        })
      } catch (error) {
        return 'Invalid time'
      }
    },

    getActivityLabel(activityType) {
      const labels = {
        'DAILY_LOGIN': 'Daily Login',
        'PRODUCT_SHARE': 'Product Share',
        'CAMPAIGN_SHARE': 'Campaign Share',
        'EMAIL_VERIFY': 'Email Verify',
        'PROFILE_COMPLETE': 'Profile Complete',
        'MANUAL_AWARD': 'Manual Award',
        'REDEMPTION': 'Redemption',
        'BONUS_REWARD': 'Bonus Reward',
        'ACHIEVEMENT_BONUS': 'Achievement',
        'SPECIAL_EVENT': 'Special Event',
        'COMPENSATION': 'Compensation'
      }
      return labels[activityType] || activityType
    },

    applyFilters() {
      this.$emit('filter-change', { ...this.filters })
    },

    clearFilters() {
      this.filters = {
        transactionType: '',
        activityType: '',
        status: '',
        startDate: '',
        endDate: ''
      }
      this.applyFilters()
    },

    goToPage(page) {
      if (page >= 1 && page <= this.pagination.totalPages && page !== '...') {
        this.$emit('page-change', page)
      }
    },

    viewTransactionDetails(transaction) {
      this.$emit('view-details', transaction)
    },

    copyReferenceId(referenceId) {
      navigator.clipboard.writeText(referenceId).then(() => {
        // You can emit an event or show a toast here
        console.log('Reference ID copied to clipboard:', referenceId)
      }).catch(err => {
        console.error('Failed to copy reference ID:', err)
      })
    },

    exportTransactions() {
      // Implementation for CSV export
      const csvContent = this.generateCSV()
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `point_transactions_${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    },

    generateCSV() {
      const headers = [
        'ID',
        'User',
        'Email',
        'Type',
        'Amount',
        'Activity',
        'Description',
        'Status',
        'Reference ID',
        'Created At'
      ]

      const rows = this.transactions.map(transaction => [
        transaction.id,
        transaction.user?.username || 'Deleted User',
        transaction.user?.email || 'N/A',
        transaction.transactionType,
        transaction.amount,
        transaction.activityType,
        transaction.activityDescription,
        transaction.status,
        transaction.referenceId || 'N/A',
        transaction.created_at
      ])

      const csvContent = [headers, ...rows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n')

      return csvContent
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

.user-avatar .bg-primary {
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%) !important;
}

.table {
  font-size: 0.875rem;
}

.table th {
  background-color: #f8f9fa;
  border-top: none;
  border-bottom: 2px solid #dee2e6;
  font-weight: 600;
  color: #495057;
  white-space: nowrap;
}

.table td {
  vertical-align: middle;
  border-color: #f1f3f4;
}

.table-hover tbody tr:hover {
  background-color: #f8f9fa;
}

.description-cell {
  max-width: 200px;
}

.description-cell .small {
  line-height: 1.3;
}

.smaller {
  font-size: 0.75rem;
}

.badge {
  font-size: 0.7rem;
  padding: 0.4rem 0.6rem;
  border-radius: 4px;
}

.empty-state {
  padding: 2rem 1rem;
}

.empty-state i {
  opacity: 0.5;
}

.form-select-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

.pagination-sm .page-link {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

.dropdown-toggle::after {
  display: none;
}

.card {
  border-radius: 8px;
}

.alert {
  border-radius: 8px;
}

.btn {
  border-radius: 6px;
  font-weight: 500;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
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
  
  .table {
    font-size: 0.8rem;
  }
  
  .description-cell {
    max-width: 150px;
  }
}

@media (max-width: 576px) {
  .modal-dialog {
    margin: 0.5rem;
    max-width: calc(100% - 1rem);
  }
  
  .table {
    font-size: 0.75rem;
  }
  
  .description-cell {
    max-width: 120px;
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

.table tbody tr {
  animation: fadeInUp 0.3s ease-out;
}

.table tbody tr:nth-child(1) { animation-delay: 0.1s; }
.table tbody tr:nth-child(2) { animation-delay: 0.2s; }
.table tbody tr:nth-child(3) { animation-delay: 0.3s; }
.table tbody tr:nth-child(4) { animation-delay: 0.4s; }
.table tbody tr:nth-child(5) { animation-delay: 0.5s; }
</style>