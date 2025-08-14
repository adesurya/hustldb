<!-- /src/views/RedemptionView.vue -->
<template>
  <div class="dashboard-layout">
    <!-- Sidebar Component -->
    <Sidebar 
      :class="{ 'sidebar-mobile-hidden': !sidebarVisible }" 
      @close="toggleSidebar"
      @logout="handleSidebarLogout"
    />
    
    <!-- Mobile Overlay -->
    <div 
      v-if="sidebarVisible" 
      class="mobile-overlay d-md-none"
      @click="toggleSidebar"
    ></div>
    
    <!-- Main Content Area -->
    <div class="main-content" :class="{ 'sidebar-hidden': !sidebarVisible }">
      <!-- Header Component -->
      <Header 
        @refresh="handleRefresh" 
        @toggle-sidebar="toggleSidebar"
        :isRefreshing="isRefreshing" 
        :sidebarVisible="sidebarVisible"
      />
      
      <!-- Redemption Content Container -->
      <main class="redemption-container">
        <!-- Page Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 class="mb-1 fw-bold text-dark">Redemption Management</h2>
            <p class="text-muted mb-0">Manage user point redemptions and approvals</p>
          </div>
        </div>

        <!-- Statistics Cards -->
        <div class="row g-3 mb-4">
          <div class="col-xl-3 col-lg-6 col-md-6">
            <div class="stat-card card h-100 border-0">
              <div class="card-body p-3">
                <div class="d-flex align-items-center justify-content-between">
                  <div class="stat-content">
                    <div class="stat-icon bg-warning bg-opacity-10 p-2 rounded-circle mb-2">
                      <i class="fas fa-clock text-warning"></i>
                    </div>
                    <h3 class="mb-1 fw-bold text-dark">{{ statistics.pendingRedemptions || 0 }}</h3>
                    <h6 class="text-muted mb-0 small">Pending</h6>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-xl-3 col-lg-6 col-md-6">
            <div class="stat-card card h-100 border-0">
              <div class="card-body p-3">
                <div class="d-flex align-items-center justify-content-between">
                  <div class="stat-content">
                    <div class="stat-icon bg-success bg-opacity-10 p-2 rounded-circle mb-2">
                      <i class="fas fa-check-circle text-success"></i>
                    </div>
                    <h3 class="mb-1 fw-bold text-dark">{{ statistics.approvedRedemptions || 0 }}</h3>
                    <h6 class="text-muted mb-0 small">Approved</h6>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-xl-3 col-lg-6 col-md-6">
            <div class="stat-card card h-100 border-0">
              <div class="card-body p-3">
                <div class="d-flex align-items-center justify-content-between">
                  <div class="stat-content">
                    <div class="stat-icon bg-danger bg-opacity-10 p-2 rounded-circle mb-2">
                      <i class="fas fa-times-circle text-danger"></i>
                    </div>
                    <h3 class="mb-1 fw-bold text-dark">{{ statistics.rejectedRedemptions || 0 }}</h3>
                    <h6 class="text-muted mb-0 small">Rejected</h6>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-xl-3 col-lg-6 col-md-6">
            <div class="stat-card card h-100 border-0">
              <div class="card-body p-3">
                <div class="d-flex align-items-center justify-content-between">
                  <div class="stat-content">
                    <div class="stat-icon bg-info bg-opacity-10 p-2 rounded-circle mb-2">
                      <i class="fas fa-coins text-info"></i>
                    </div>
                    <h3 class="mb-1 fw-bold text-dark">{{ formatNumber(statistics.totalPointsRedeemed) || 0 }}</h3>
                    <h6 class="text-muted mb-0 small">Total Points</h6>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Filters and Search -->
        <div class="card border-0 mb-4">
          <div class="card-body">
            <div class="row g-3">
              <!-- Search -->
              <div class="col-lg-4 col-md-6">
                <div class="search-box position-relative">
                  <input
                    v-model="searchQuery"
                    @input="handleSearch"
                    type="text"
                    class="form-control ps-5"
                    placeholder="Search by username, email, or account name..."
                  >
                  <i class="fas fa-search position-absolute search-icon"></i>
                </div>
              </div>

              <!-- Status Filter -->
              <div class="col-lg-2 col-md-3">
                <select 
                  v-model="selectedStatus"
                  @change="handleStatusFilter"
                  class="form-select"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <!-- Type Filter -->
              <div class="col-lg-2 col-md-3">
                <select 
                  v-model="selectedType"
                  @change="handleTypeFilter"
                  class="form-select"
                >
                  <option value="">All Types</option>
                  <option value="cash">Cash</option>
                  <option value="voucher">Voucher</option>
                  <option value="product">Product</option>
                </select>
              </div>

              <!-- Clear Filters -->
              <div class="col-lg-2 col-md-6">
                <button 
                  @click="clearFilters"
                  class="btn btn-outline-secondary w-100"
                  :disabled="!searchQuery && !selectedStatus && !selectedType"
                >
                  <i class="fas fa-times me-2"></i>
                  Clear
                </button>
              </div>

              <!-- Refresh Button -->
              <div class="col-lg-2 col-md-6">
                <button 
                  @click="handleRefresh"
                  class="btn btn-primary w-100"
                  :disabled="isRefreshing"
                >
                  <i v-if="isRefreshing" class="fas fa-spinner fa-spin me-2"></i>
                  <i v-else class="fas fa-refresh me-2"></i>
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Bulk Actions -->
        <div v-if="selectedRedemptions.length > 0" class="card border-0 mb-4">
          <div class="card-body bg-light">
            <div class="d-flex justify-content-between align-items-center">
              <span class="text-muted">
                {{ selectedRedemptions.length }} redemption(s) selected
              </span>
              <div class="btn-group">
                <button 
                  @click="bulkApprove"
                  class="btn btn-sm btn-success"
                  :disabled="isSubmitting || !hasPendingSelected"
                >
                  <i class="fas fa-check me-1"></i>
                  Approve Selected
                </button>
                <button 
                  @click="bulkReject"
                  class="btn btn-sm btn-danger"
                  :disabled="isSubmitting || !hasPendingSelected"
                >
                  <i class="fas fa-times me-1"></i>
                  Reject Selected
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Redemptions Table -->
        <div class="card border-0">
          <div class="card-body p-0">
            <!-- Loading State -->
            <div v-if="isLoading" class="text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else-if="filteredRedemptionsList.length === 0" class="text-center py-5">
              <div class="empty-state">
                <i class="fas fa-search fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">No redemptions found</h5>
                <p class="text-muted">
                  {{ searchQuery || selectedStatus || selectedType ? 'Try adjusting your search or filters' : 'No redemption requests yet' }}
                </p>
                <button 
                  v-if="searchQuery || selectedStatus || selectedType"
                  @click="clearFilters"
                  class="btn btn-outline-primary"
                >
                  <i class="fas fa-times me-2"></i>
                  Clear Filters
                </button>
              </div>
            </div>

            <!-- Redemptions Table -->
            <div v-else class="table-responsive">
              <table class="table table-hover mb-0">
                <thead class="table-light">
                  <tr>
                    <th style="width: 40px;">
                      <input
                        v-model="selectAll"
                        @change="toggleSelectAll"
                        type="checkbox"
                        class="form-check-input"
                      >
                    </th>
                    <th>User</th>
                    <th>Points</th>
                    <th>Value</th>
                    <th>Type</th>
                    <th>Bank Details</th>
                    <th>Request Date</th>
                    <th>Status</th>
                    <th style="width: 100px;">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr 
                    v-for="redemption in filteredRedemptionsList" 
                    :key="redemption.id"
                    class="redemption-row"
                  >
                    <!-- Selection Checkbox -->
                    <td>
                      <input
                        v-model="selectedRedemptions"
                        :value="redemption.id"
                        type="checkbox"
                        class="form-check-input"
                        :disabled="redemption.status !== 'pending'"
                      >
                    </td>

                    <!-- User Info -->
                    <td>
                      <div class="user-info">
                        <div class="d-flex align-items-center">
                          <div class="user-avatar me-2">
                            <div class="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" 
                                 style="width: 40px; height: 40px;">
                              <span class="text-primary fw-bold">{{ getUserInitials(redemption.user.username) }}</span>
                            </div>
                          </div>
                          <div>
                            <div class="fw-semibold">{{ redemption.user.username }}</div>
                            <small class="text-muted">{{ redemption.user.email }}</small>
                          </div>
                        </div>
                      </div>
                    </td>

                    <!-- Points -->
                    <td>
                      <span class="badge bg-primary bg-opacity-10 text-primary fw-bold">
                        {{ formatNumber(redemption.pointsRedeemed) }}
                      </span>
                    </td>

                    <!-- Value -->
                    <td>
                      <span class="text-success fw-bold">
                        {{ formatCurrency(redemption.redemptionValue) }}
                      </span>
                    </td>

                    <!-- Type -->
                    <td>
                      <span class="badge bg-info text-capitalize">
                        {{ redemption.redemptionType }}
                      </span>
                    </td>

                    <!-- Bank Details -->
                    <td>
                      <div class="bank-details">
                        <div class="fw-semibold">{{ redemption.redemptionDetails.bankName }}</div>
                        <small class="text-muted">{{ redemption.redemptionDetails.accountName }}</small>
                        <br>
                        <small class="text-muted">{{ redemption.redemptionDetails.bankAccount }}</small>
                      </div>
                    </td>

                    <!-- Request Date -->
                    <td>
                      <small>{{ formatDate(redemption.requestedAt) }}</small>
                    </td>

                    <!-- Status -->
                    <td>
                      <span 
                        :class="getStatusBadgeClass(redemption.status)"
                        class="badge"
                      >
                        {{ redemption.status.charAt(0).toUpperCase() + redemption.status.slice(1) }}
                      </span>
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
                              @click="viewRedemptionDetails(redemption)"
                              class="dropdown-item"
                              href="#"
                            >
                              <i class="fas fa-eye me-2"></i>View Details
                            </a>
                          </li>
                          <li v-if="redemption.status === 'pending'">
                            <a 
                              @click="approveRedemption(redemption)"
                              class="dropdown-item text-success"
                              href="#"
                            >
                              <i class="fas fa-check me-2"></i>Approve
                            </a>
                          </li>
                          <li v-if="redemption.status === 'pending'">
                            <a 
                              @click="rejectRedemption(redemption)"
                              class="dropdown-item text-danger"
                              href="#"
                            >
                              <i class="fas fa-times me-2"></i>Reject
                            </a>
                          </li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.totalPages > 1" class="d-flex justify-content-center mt-4">
          <nav>
            <ul class="pagination">
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
      </main>
      
      <!-- Footer Component -->
      <Footer />
    </div>

    <!-- Redemption Detail Modal -->
    <RedemptionDetailModal
      v-if="showDetailModal"
      :show="showDetailModal"
      :redemption="selectedRedemption"
      @close="showDetailModal = false"
      @approve="handleModalApprove"
      @reject="handleModalReject"
    />

    <!-- Process Modal (Approve/Reject) -->
    <RedemptionProcessModal
      v-if="showProcessModal"
      :show="showProcessModal"
      :redemption="selectedRedemption"
      :actionType="processActionType"
      @close="showProcessModal = false"
      @submit="handleProcessSubmit"
    />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { useToast } from 'vue-toastification'
import Sidebar from '@/components/partials/Sidebar.vue'
import Header from '@/components/partials/Header.vue'
import Footer from '@/components/partials/Footer.vue'
import RedemptionDetailModal from '@/components/modals/RedemptionDetailModal.vue'
import RedemptionProcessModal from '@/components/modals/RedemptionProcessModal.vue'

export default {
  name: 'RedemptionView',
  
  components: {
    Sidebar,
    Header,
    Footer,
    RedemptionDetailModal,
    RedemptionProcessModal
  },

  setup() {
    const toast = useToast()
    return { toast }
  },

  data() {
    return {
      isRefreshing: false,
      sidebarVisible: true,
      selectedRedemptions: [],
      selectedRedemption: null,
      showDetailModal: false,
      showProcessModal: false,
      processActionType: 'approve', // 'approve' or 'reject'
      selectAll: false,
      // Filters
      searchQuery: '',
      selectedStatus: '',
      selectedType: '',
      searchTimeout: null
    }
  },

  mounted() {
    this.checkMobileScreen()
    window.addEventListener('resize', this.checkMobileScreen)
    this.initializeRedemptions()
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.checkMobileScreen)
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout)
    }
  },

  computed: {
    ...mapGetters('redemptions', [
      'redemptions',
      'statistics',
      'pagination',
      'filters',
      'isLoading',
      'isSubmitting',
      'pendingRedemptions',
      'approvedRedemptions',
      'rejectedRedemptions'
    ]),

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
    },

    // Client-side filtering for search, status, and type
    filteredRedemptionsList() {
      let filtered = [...this.redemptions]

      // Filter by search query
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase().trim()
        filtered = filtered.filter(redemption => 
          redemption.user.username.toLowerCase().includes(query) ||
          redemption.user.email.toLowerCase().includes(query) ||
          redemption.redemptionDetails.accountName.toLowerCase().includes(query) ||
          redemption.redemptionDetails.bankName.toLowerCase().includes(query)
        )
      }

      // Filter by status
      if (this.selectedStatus) {
        filtered = filtered.filter(redemption => 
          redemption.status === this.selectedStatus
        )
      }

      // Filter by type
      if (this.selectedType) {
        filtered = filtered.filter(redemption => 
          redemption.redemptionType === this.selectedType
        )
      }

      return filtered
    },

    hasPendingSelected() {
      return this.selectedRedemptions.some(id => {
        const redemption = this.redemptions.find(r => r.id === id)
        return redemption && redemption.status === 'pending'
      })
    }
  },

  methods: {
    ...mapActions('redemptions', [
      'fetchRedemptions',
      'fetchStatistics',
      'fetchRedemption',
      'approveRedemption',
      'rejectRedemption',
      'bulkApproveRedemptions',
      'bulkRejectRedemptions',
      'setFilters',
      'setPagination',
      'resetFilters'
    ]),

    async initializeRedemptions() {
      this.isRefreshing = true
      try {
        await Promise.all([
          this.fetchRedemptions(),
          this.fetchStatistics()
        ])
      } catch (error) {
        console.error('Failed to load redemptions:', error)
        this.toast.error('Failed to load redemptions')
      } finally {
        this.isRefreshing = false
      }
    },

    async handleRefresh() {
      await this.initializeRedemptions()
      this.toast.success('Redemptions refreshed successfully!')
    },

    handleSidebarLogout() {
      this.$router.push('/login')
    },

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
          month: 'short',
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

    // Search functionality
    handleSearch() {
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout)
      }
      
      this.searchTimeout = setTimeout(() => {
        console.log('Searching for:', this.searchQuery)
      }, 300)
    },

    // Filter functionality
    handleStatusFilter() {
      console.log('Filtering by status:', this.selectedStatus)
    },

    handleTypeFilter() {
      console.log('Filtering by type:', this.selectedType)
    },

    // Clear all filters
    clearFilters() {
      this.searchQuery = ''
      this.selectedStatus = ''
      this.selectedType = ''
      console.log('Filters cleared')
    },

    goToPage(page) {
      if (page >= 1 && page <= this.pagination.totalPages) {
        this.setPagination({ currentPage: page })
      }
    },

    // Selection methods
    toggleSelectAll() {
      if (this.selectAll) {
        this.selectedRedemptions = this.filteredRedemptionsList
          .filter(r => r.status === 'pending')
          .map(r => r.id)
      } else {
        this.selectedRedemptions = []
      }
    },

    // View redemption details
    async viewRedemptionDetails(redemption) {
      try {
        console.log('📖 Viewing redemption details for ID:', redemption.id)
        
        this.selectedRedemption = { 
          ...redemption, 
          isLoading: true
        }
        this.showDetailModal = true
        
        const detailedRedemption = await this.fetchRedemption(redemption.id)
        
        this.selectedRedemption = {
          ...detailedRedemption,
          isLoading: false
        }
        
        this.toast.success('Redemption details loaded successfully!')
      } catch (error) {
        console.error('❌ Failed to fetch redemption details:', error)
        this.toast.error(error.message || 'Failed to load redemption details')
        this.showDetailModal = false
        this.selectedRedemption = null
      }
    },

    // Approve/Reject single redemption
    approveRedemption(redemption) {
      this.selectedRedemption = redemption
      this.processActionType = 'approve'
      this.showProcessModal = true
    },

    rejectRedemption(redemption) {
      this.selectedRedemption = redemption
      this.processActionType = 'reject'
      this.showProcessModal = true
    },

    // Handle approve/reject from detail modal
    handleModalApprove(redemption) {
      this.showDetailModal = false
      this.approveRedemption(redemption)
    },

    handleModalReject(redemption) {
      this.showDetailModal = false
      this.rejectRedemption(redemption)
    },

    // Handle process submission
    async handleProcessSubmit({ redemption, actionType, notes }) {
      try {
        let response
        if (actionType === 'approve') {
          response = await this.approveRedemption({ id: redemption.id, notes })
          this.toast.success('Redemption approved successfully!')
        } else {
          response = await this.rejectRedemption({ id: redemption.id, notes })
          this.toast.success('Redemption rejected successfully!')
        }
        
        if (response.success) {
          this.showProcessModal = false
          this.selectedRedemption = null
        }
      } catch (error) {
        console.error('Process redemption error:', error)
        this.toast.error(
          error.message || 
          `Failed to ${actionType} redemption`
        )
      }
    },

    // Bulk actions
    async bulkApprove() {
      if (this.selectedRedemptions.length === 0) return
      
      const notes = prompt('Enter approval notes (optional):') || ''
      
      try {
        const response = await this.bulkApproveRedemptions({
          redemptionIds: this.selectedRedemptions,
          notes
        })
        if (response.success) {
          this.toast.success(`${this.selectedRedemptions.length} redemption(s) approved successfully!`)
          this.selectedRedemptions = []
          this.selectAll = false
        }
      } catch (error) {
        console.error('Bulk approve error:', error)
        this.toast.error(error.message || 'Failed to approve redemptions')
      }
    },

    async bulkReject() {
      if (this.selectedRedemptions.length === 0) return
      
      const notes = prompt('Enter rejection reason (required):')
      if (!notes || !notes.trim()) {
        this.toast.error('Rejection reason is required')
        return
      }
      
      try {
        const response = await this.bulkRejectRedemptions({
          redemptionIds: this.selectedRedemptions,
          notes
        })
        if (response.success) {
          this.toast.success(`${this.selectedRedemptions.length} redemption(s) rejected successfully!`)
          this.selectedRedemptions = []
          this.selectAll = false
        }
      } catch (error) {
        console.error('Bulk reject error:', error)
        this.toast.error(error.message || 'Failed to reject redemptions')
      }
    },

    toggleSidebar() {
      this.sidebarVisible = !this.sidebarVisible
    },

    checkMobileScreen() {
      if (window.innerWidth <= 768) {
        this.sidebarVisible = false
      } else {
        this.sidebarVisible = true
      }
    }
  }
}
</script>

<style scoped>
/* Layout Structure */
.dashboard-layout {
  min-height: 100vh;
  background-color: #f8f9fa;
  display: flex;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 250px;
  min-height: 100vh;
  transition: margin-left 0.3s ease;
}

.main-content.sidebar-hidden {
  margin-left: 0;
}

.redemption-container {
  flex: 1;
  padding: 1.5rem;
  margin-top: 80px;
}

.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1050;
}

.sidebar-mobile-hidden {
  transform: translateX(-100%);
}

/* Card Styles */
.stat-card {
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

/* Search Box */
.search-box {
  position: relative;
}

.search-icon {
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  z-index: 5;
}

.search-box input {
  padding-left: 45px;
}

/* Table Styles */
.table {
  margin-bottom: 0;
}

.table th {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  font-weight: 600;
  color: #495057;
  padding: 1rem 0.75rem;
}

.table td {
  padding: 1rem 0.75rem;
  vertical-align: middle;
  border-bottom: 1px solid #f1f3f4;
}

.redemption-row:hover {
  background-color: #f8f9fa;
}

.user-avatar {
  flex-shrink: 0;
}

.bank-details {
  max-width: 200px;
}

/* Empty State */
.empty-state {
  padding: 3rem 1rem;
}

.empty-state i {
  opacity: 0.5;
}

/* Pagination */
.pagination {
  margin: 0;
}

.page-link {
  color: #007bff;
  border: 1px solid #dee2e6;
  padding: 0.75rem 1rem;
}

.page-link:hover {
  background-color: #e9ecef;
  border-color: #dee2e6;
}

.page-item.active .page-link {
  background-color: #007bff;
  border-color: #007bff;
}

/* Dropdown Menu */
.dropdown-menu {
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.dropdown-item {
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
}

.dropdown-item.text-success:hover {
  background-color: #d1eddf;
  color: #155724;
}

.dropdown-item.text-danger:hover {
  background-color: #f5c6cb;
  color: #721c24;
}

/* Button Styles */
.btn {
  border-radius: 8px;
  font-weight: 500;
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

.btn-sm {
  font-size: 0.8rem;
  padding: 0.5rem 1rem;
}

/* Form Controls */
.form-control,
.form-select {
  border-radius: 8px;
  border: 1px solid #dee2e6;
  transition: all 0.3s ease;
}

.form-control:focus,
.form-select:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

/* Badge Styles */
.badge {
  font-size: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
}

.badge.bg-warning {
  background-color: #ffc107 !important;
  color: #000;
}

.badge.bg-success {
  background-color: #28a745 !important;
}

.badge.bg-danger {
  background-color: #dc3545 !important;
}

.badge.bg-info {
  background-color: #17a2b8 !important;
}

.badge.bg-primary {
  background-color: #007bff !important;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .redemption-container {
    padding: 1rem;
  }
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }
  
  .redemption-container {
    padding: 0.75rem;
    margin-top: 70px;
  }
  
  .stat-card .card-body {
    padding: 1rem;
  }
  
  .stat-icon {
    width: 32px;
    height: 32px;
  }
  
  .table-responsive {
    font-size: 0.875rem;
  }
  
  .table th,
  .table td {
    padding: 0.5rem 0.25rem;
  }
  
  .bank-details {
    max-width: 150px;
  }
}

@media (max-width: 576px) {
  .redemption-container {
    padding: 0.5rem;
  }
  
  .stat-card .card-body {
    padding: 0.75rem;
  }
  
  .stat-card h3 {
    font-size: 1.5rem;
  }
  
  .btn-sm {
    font-size: 0.75rem;
    padding: 0.4rem 0.8rem;
  }
  
  .badge {
    font-size: 0.7rem;
    padding: 0.4rem 0.6rem;
  }
  
  .table-responsive {
    font-size: 0.8rem;
  }
}

/* Animation enhancements */
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

.stat-card,
.card {
  animation: fadeInUp 0.5s ease-out;
}

.stat-card:nth-child(1) { animation-delay: 0.1s; }
.stat-card:nth-child(2) { animation-delay: 0.2s; }
.stat-card:nth-child(3) { animation-delay: 0.3s; }
.stat-card:nth-child(4) { animation-delay: 0.4s; }

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>