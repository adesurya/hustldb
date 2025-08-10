<!-- /src/views/CampaignView.vue - Final version with complete layout -->
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
      
      <!-- Campaign Content Container -->
      <main class="campaign-container">
        <!-- Page Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 class="mb-1 fw-bold text-dark">Campaign Management</h2>
            <p class="text-muted mb-0">Manage your marketing campaigns and promotions</p>
          </div>
          <button 
            @click="showAddCampaignModal = true"
            class="btn btn-primary d-flex align-items-center"
          >
            <i class="fas fa-plus me-2"></i>
            Add Campaign
          </button>
        </div>

        <!-- Statistics Cards -->
        <div class="row g-3 mb-4">
          <div class="col-xl-3 col-lg-6 col-md-6">
            <div class="stat-card card h-100 border-0">
              <div class="card-body p-3">
                <div class="d-flex align-items-center justify-content-between">
                  <div class="stat-content">
                    <div class="stat-icon bg-primary bg-opacity-10 p-2 rounded-circle mb-2">
                      <i class="fas fa-bullhorn text-primary"></i>
                    </div>
                    <h3 class="mb-1 fw-bold text-dark">{{ filteredCampaignsList.length }}</h3>
                    <h6 class="text-muted mb-0 small">
                      {{ searchQuery || selectedStatus ? 'Filtered' : 'Total' }} Campaigns
                    </h6>
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
                    <h3 class="mb-1 fw-bold text-dark">{{ getActiveCampaignsCount }}</h3>
                    <h6 class="text-muted mb-0 small">Active Campaigns</h6>
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
                    <div class="stat-icon bg-warning bg-opacity-10 p-2 rounded-circle mb-2">
                      <i class="fas fa-clock text-warning"></i>
                    </div>
                    <h3 class="mb-1 fw-bold text-dark">{{ getUpcomingCampaignsCount }}</h3>
                    <h6 class="text-muted mb-0 small">Upcoming Campaigns</h6>
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
                    <h3 class="mb-1 fw-bold text-dark">{{ getExpiredCampaignsCount }}</h3>
                    <h6 class="text-muted mb-0 small">Expired Campaigns</h6>
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
              <div class="col-lg-6 col-md-8">
                <div class="search-box position-relative">
                  <input
                    v-model="searchQuery"
                    @input="handleSearch"
                    type="text"
                    class="form-control ps-5"
                    placeholder="Search campaigns by name or description..."
                  >
                  <i class="fas fa-search position-absolute search-icon"></i>
                </div>
              </div>

              <!-- Status Filter -->
              <div class="col-lg-3 col-md-4">
                <select 
                  v-model="selectedStatus"
                  @change="handleStatusFilter"
                  class="form-select"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="expired">Expired</option>
                </select>
              </div>

              <!-- Clear Filters -->
              <div class="col-lg-3 col-md-12">
                <button 
                  @click="clearFilters"
                  class="btn btn-outline-secondary w-100"
                  :disabled="!searchQuery && !selectedStatus"
                >
                  <i class="fas fa-times me-2"></i>
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Bulk Actions -->
        <div v-if="selectedCampaigns.length > 0" class="card border-0 mb-4">
          <div class="card-body bg-light">
            <div class="d-flex justify-content-between align-items-center">
              <span class="text-muted">
                {{ selectedCampaigns.length }} campaign(s) selected
              </span>
              <div class="btn-group">
                <button 
                  @click="bulkActivate"
                  class="btn btn-sm btn-success"
                  :disabled="isSubmitting"
                >
                  <i class="fas fa-check me-1"></i>
                  Activate
                </button>
                <button 
                  @click="bulkDeactivate"
                  class="btn btn-sm btn-warning"
                  :disabled="isSubmitting"
                >
                  <i class="fas fa-pause me-1"></i>
                  Deactivate
                </button>
                <button 
                  @click="bulkDelete"
                  class="btn btn-sm btn-danger"
                  :disabled="isSubmitting"
                >
                  <i class="fas fa-trash me-1"></i>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Campaigns Grid -->
        <div v-if="isLoading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <div v-else-if="filteredCampaignsList.length === 0" class="text-center py-5">
          <div class="empty-state">
            <i class="fas fa-search fa-3x text-muted mb-3"></i>
            <h5 class="text-muted">No campaigns found</h5>
            <p class="text-muted">
              {{ searchQuery || selectedStatus ? 'Try adjusting your search or filters' : 'Start by adding your first campaign' }}
            </p>
            <button 
              v-if="!searchQuery && !selectedStatus"
              @click="showAddCampaignModal = true"
              class="btn btn-primary"
            >
              <i class="fas fa-plus me-2"></i>
              Add Campaign
            </button>
            <button 
              v-else
              @click="clearFilters"
              class="btn btn-outline-primary"
            >
              <i class="fas fa-times me-2"></i>
              Clear Filters
            </button>
          </div>
        </div>

        <div v-else class="row g-3">
          <div 
            v-for="campaign in filteredCampaignsList" 
            :key="campaign.id"
            class="col-xl-4 col-lg-6 col-md-6"
          >
            <div class="campaign-card card h-100 border-0 position-relative">
              <!-- Selection Checkbox -->
              <div class="position-absolute top-0 start-0 p-3">
                <input
                  v-model="selectedCampaigns"
                  :value="campaign.id"
                  type="checkbox"
                  class="form-check-input"
                >
              </div>

              <!-- Campaign Menu -->
              <div class="position-absolute top-0 end-0 p-3">
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
                        @click="editCampaign(campaign)"
                        class="dropdown-item"
                        href="#"
                      >
                        <i class="fas fa-edit me-2"></i>Edit
                      </a>
                    </li>
                    <li>
                      <a 
                        @click="toggleStatus(campaign)"
                        class="dropdown-item"
                        href="#"
                      >
                        <i 
                          :class="campaign.isActive ? 'fas fa-pause' : 'fas fa-play'"
                          class="me-2"
                        ></i>
                        {{ campaign.isActive ? 'Deactivate' : 'Activate' }}
                      </a>
                    </li>
                    <li>
                      <a 
                        @click="viewCampaign(campaign)"
                        class="dropdown-item"
                        href="#"
                      >
                        <i class="fas fa-eye me-2"></i>View Details
                      </a>
                    </li>
                    <li>
                      <a 
                        @click="manageCampaignProducts(campaign)"
                        class="dropdown-item"
                        href="#"
                      >
                        <i class="fas fa-box me-2"></i>Manage Products
                      </a>
                    </li>
                    <li><hr class="dropdown-divider"></li>
                    <li>
                      <a 
                        @click="confirmDeleteCampaign(campaign)"
                        class="dropdown-item text-danger"
                        href="#"
                      >
                        <i class="fas fa-trash me-2"></i>Delete
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

              <!-- Campaign Image -->
              <div class="campaign-image">
                <img 
                  :src="getCampaignImageUrl(campaign)"
                  :alt="campaign.name"
                  class="card-img-top"
                  crossorigin="anonymous"
                  referrerpolicy="no-referrer"
                  @error="handleImageError($event, campaign)"
                  @load="handleImageLoad($event)"
                >
                <div class="campaign-badges">
                  <span 
                    v-if="campaign.isCurrentlyActive"
                    class="badge bg-success"
                  >
                    <i class="fas fa-play me-1"></i>Running
                  </span>
                  <span 
                    :class="getStatusBadgeClass(campaign.status)"
                    class="badge"
                  >
                    {{ getStatusText(campaign.status) }}
                  </span>
                </div>
              </div>

              <!-- Campaign Info -->
              <div class="card-body p-3">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <h6 class="card-title mb-0 fw-bold text-truncate">
                    {{ campaign.name }}
                  </h6>
                </div>

                <p class="card-text text-muted small text-truncate-2 mb-3">
                  {{ campaign.description }}
                </p>

                <div class="row g-2 mb-3">
                  <div class="col-6">
                    <div class="campaign-stat">
                      <span class="stat-label">Start Date</span>
                      <span class="stat-value text-primary fw-bold">
                        {{ formatDate(campaign.startDate) }}
                      </span>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="campaign-stat">
                      <span class="stat-label">End Date</span>
                      <span class="stat-value text-danger fw-bold">
                        {{ formatDate(campaign.endDate) }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="row g-2 mb-3">
                  <div class="col-6">
                    <div class="campaign-stat">
                      <span class="stat-label">Days Until Start</span>
                      <span class="stat-value">{{ campaign.daysUntilStart || 0 }}</span>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="campaign-stat">
                      <span class="stat-label">Days Until End</span>
                      <span class="stat-value">{{ campaign.daysUntilEnd || 0 }}</span>
                    </div>
                  </div>
                </div>

                <div class="mb-3">
                  <span class="badge bg-light text-dark">
                    Products: {{ campaign.productCount || 0 }}
                  </span>
                  <span class="badge bg-light text-dark ms-1">
                    ID: #{{ campaign.id }}
                  </span>
                </div>

                <!-- Action Buttons -->
                <div class="row g-2">
                  <div class="col-6">
                    <button 
                      @click="editCampaign(campaign)"
                      class="btn btn-primary btn-sm w-100"
                    >
                      <i class="fas fa-edit me-1"></i>Edit
                    </button>
                  </div>
                  <div class="col-6">
                    <button 
                      @click="confirmDeleteCampaign(campaign)"
                      class="btn btn-danger btn-sm w-100"
                    >
                      <i class="fas fa-trash me-1"></i>Delete
                    </button>
                  </div>
                </div>
              </div>
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

    <!-- Add/Edit Campaign Modal -->
    <CampaignModal
      v-if="showAddCampaignModal || showEditCampaignModal"
      :show="showAddCampaignModal || showEditCampaignModal"
      :campaign="selectedCampaign"
      :isEdit="showEditCampaignModal"
      @close="closeCampaignModal"
      @save="handleCampaignSave"
    />

    <!-- Campaign Detail Modal -->
    <CampaignDetailModal
    v-if="showDetailModal"
    :show="showDetailModal"
    :campaign="selectedCampaign"
    @close="showDetailModal = false"
    @edit="editCampaignFromDetail"
    @manage-products="manageCampaignProductsFromDetail"
    />

    <!-- Campaign Products Modal -->
    <CampaignProductsModal
      v-if="showProductsModal"
      :show="showProductsModal"
      :campaign="selectedCampaign"
      @close="showProductsModal = false"
      @refresh="handleRefresh"
    />

    <!-- Delete Confirmation Modal -->
    <div 
      v-if="showDeleteModal"
      class="modal fade show d-block"
      tabindex="-1"
      style="background-color: rgba(0,0,0,0.5);"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title fw-bold text-danger">
              <i class="fas fa-exclamation-triangle me-2"></i>
              Confirm Delete
            </h5>
            <button 
              @click="showDeleteModal = false"
              type="button" 
              class="btn-close"
            ></button>
          </div>
          
          <div class="modal-body">
            <p class="mb-3">Are you sure you want to delete this campaign?</p>
            
            <div v-if="campaignToDelete" class="alert alert-light border">
              <div class="d-flex align-items-center">
                <img 
                  :src="getCampaignImageUrl(campaignToDelete)"
                  :alt="campaignToDelete.name"
                  class="me-3"
                  style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;"
                  @error="handleImageError($event, campaignToDelete)"
                >
                <div>
                  <h6 class="mb-1 fw-bold">{{ campaignToDelete.name }}</h6>
                  <small class="text-muted">{{ getStatusText(campaignToDelete.status) }}</small>
                </div>
              </div>
            </div>
            
            <p class="text-muted small mb-0">
              <i class="fas fa-info-circle me-1"></i>
              This action cannot be undone.
            </p>
          </div>
          
          <div class="modal-footer border-0 pt-0">
            <button 
              @click="showDeleteModal = false"
              type="button" 
              class="btn btn-light"
            >
              Cancel
            </button>
            <button 
              @click="executeDelete"
              type="button" 
              class="btn btn-danger"
              :disabled="isDeleting"
            >
              <i v-if="isDeleting" class="fas fa-spinner fa-spin me-2"></i>
              <i v-else class="fas fa-trash me-2"></i>
              {{ isDeleting ? 'Deleting...' : 'Delete Campaign' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { useToast } from 'vue-toastification'
import Sidebar from '@/components/partials/Sidebar.vue'
import Header from '@/components/partials/Header.vue'
import Footer from '@/components/partials/Footer.vue'
import CampaignModal from '@/components/modals/CampaignModal.vue'
import CampaignDetailModal from '@/components/modals/CampaignDetailModal.vue'
import CampaignProductsModal from '@/components/modals/CampaignProductsModal.vue'

export default {
  name: 'CampaignView',
  
  components: {
    Sidebar,
    Header,
    Footer,
    CampaignModal,
    CampaignDetailModal,
    CampaignProductsModal
  },

  setup() {
    const toast = useToast()
    return { toast }
  },

  data() {
    return {
      isRefreshing: false,
      sidebarVisible: true,
      selectedCampaigns: [],
      selectedCampaign: null,
      showAddCampaignModal: false,
      showEditCampaignModal: false,
      showDetailModal: false,
      showProductsModal: false,
      showDeleteModal: false,
      campaignToDelete: null,
      isDeleting: false,
      // Simplified filters - only search and status
      searchQuery: '',
      selectedStatus: '',
      searchTimeout: null
    }
  },

  mounted() {
    this.checkMobileScreen()
    window.addEventListener('resize', this.checkMobileScreen)
    this.initializeCampaigns()
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.checkMobileScreen)
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout)
    }
  },

  computed: {
    ...mapGetters('campaigns', [
      'campaigns',
      'pagination',
      'filters',
      'isLoading',
      'isSubmitting'
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

    // Client-side filtering for search and status
    filteredCampaignsList() {
      let filtered = [...this.campaigns]

      // Filter by search query
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase().trim()
        filtered = filtered.filter(campaign => 
          campaign.name.toLowerCase().includes(query) ||
          campaign.description.toLowerCase().includes(query)
        )
      }

      // Filter by status
      if (this.selectedStatus) {
        filtered = filtered.filter(campaign => {
          switch (this.selectedStatus) {
            case 'active':
              return campaign.isActive
            case 'inactive':
              return !campaign.isActive
            case 'upcoming':
              return campaign.status === 'upcoming'
            case 'expired':
              return campaign.status === 'expired'
            default:
              return true
          }
        })
      }

      return filtered
    },

    // Get active campaigns count from filtered list
    getActiveCampaignsCount() {
      return this.filteredCampaignsList.filter(campaign => campaign.isActive).length
    },

    // Get upcoming campaigns count from filtered list
    getUpcomingCampaignsCount() {
      return this.filteredCampaignsList.filter(campaign => campaign.status === 'upcoming').length
    },

    // Get expired campaigns count from filtered list
    getExpiredCampaignsCount() {
      return this.filteredCampaignsList.filter(campaign => campaign.status === 'expired').length
    }
  },

  methods: {
    ...mapActions('campaigns', [
      'fetchCampaigns',
      'createCampaign',
      'updateCampaign',
      'deleteCampaign',
      'toggleCampaignStatus',
      'bulkDeleteCampaigns',
      'bulkUpdateStatus',
      'setFilters',
      'setPagination',
      'resetFilters'
    ]),

    async initializeCampaigns() {
      this.isRefreshing = true
      try {
        await this.fetchCampaigns()
      } catch (error) {
        console.error('Failed to load campaigns:', error)
        this.toast.error('Failed to load campaigns')
      } finally {
        this.isRefreshing = false
      }
    },

    async handleRefresh() {
      await this.initializeCampaigns()
      this.toast.success('Campaigns refreshed successfully!')
    },

    handleSidebarLogout() {
      this.$router.push('/login')
    },

    formatNumber(value) {
      if (!value) return '0'
      return parseFloat(value).toLocaleString('id-ID')
    },

    formatDate(dateString) {
      if (!dateString) return 'Not set'
      
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

    getStatusText(status) {
      const statusMap = {
        'active': 'Active',
        'inactive': 'Inactive',
        'upcoming': 'Upcoming',
        'expired': 'Expired'
      }
      return statusMap[status] || status
    },

    getStatusBadgeClass(status) {
      const classMap = {
        'active': 'bg-success',
        'inactive': 'bg-secondary',
        'upcoming': 'bg-warning',
        'expired': 'bg-danger'
      }
      return classMap[status] || 'bg-secondary'
    },

    // Search functionality
    handleSearch() {
      // Debounce search for better performance
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout)
      }
      
      this.searchTimeout = setTimeout(() => {
        // Search is handled by computed property filteredCampaignsList
        console.log('Searching for:', this.searchQuery)
      }, 300)
    },

    // Status filter functionality
    handleStatusFilter() {
      console.log('Filtering by status:', this.selectedStatus)
      // Filter is handled by computed property filteredCampaignsList
    },

    // Clear all filters
    clearFilters() {
      this.searchQuery = ''
      this.selectedStatus = ''
      console.log('Filters cleared')
    },

    goToPage(page) {
      if (page >= 1 && page <= this.pagination.totalPages) {
        this.setPagination({ currentPage: page })
      }
    },

    editCampaign(campaign) {
      this.selectedCampaign = { ...campaign }
      this.showEditCampaignModal = true
    },

    editCampaignFromDetail(campaign) {
        console.log('✏️ Editing campaign from detail:', campaign.name)
        this.selectedCampaign = { ...campaign }
        this.showDetailModal = false
        this.showEditCampaignModal = true
    },

    viewCampaign(campaign) {
        console.log('👁️ Viewing campaign details:', campaign.name)
        this.selectedCampaign = campaign
        this.showDetailModal = true
    },


    manageCampaignProductsFromDetail(campaign) {
        console.log('📦 Managing products from detail:', campaign.name)
        this.selectedCampaign = campaign
        this.showDetailModal = false
        this.showProductsModal = true
    },

    // New method with better naming
    confirmDeleteCampaign(campaign) {
      this.campaignToDelete = campaign
      this.showDeleteModal = true
    },

    async executeDelete() {
      if (!this.campaignToDelete) return
      
      this.isDeleting = true
      try {
        const response = await this.deleteCampaign(this.campaignToDelete.id)
        if (response.success) {
          this.toast.success('Campaign deleted successfully!')
          this.selectedCampaigns = this.selectedCampaigns.filter(id => id !== this.campaignToDelete.id)
          this.showDeleteModal = false
          this.campaignToDelete = null
        }
      } catch (error) {
        console.error('Delete error:', error)
        this.toast.error(error.message || 'Failed to delete campaign')
      } finally {
        this.isDeleting = false
      }
    },

    async toggleStatus(campaign) {
      try {
        const response = await this.toggleCampaignStatus(campaign.id)
        if (response.success) {
          this.toast.success(response.message || 'Campaign status updated successfully!')
        }
      } catch (error) {
        console.error('Toggle status error:', error)
        this.toast.error(error.message || 'Failed to update campaign status')
      }
    },

    async bulkActivate() {
      if (this.selectedCampaigns.length === 0) return
      
      try {
        const response = await this.bulkUpdateStatus({
          campaignIds: this.selectedCampaigns,
          isActive: true
        })
        if (response.success) {
          this.toast.success(`${this.selectedCampaigns.length} campaign(s) activated successfully!`)
          this.selectedCampaigns = []
        }
      } catch (error) {
        console.error('Bulk activate error:', error)
        this.toast.error(error.message || 'Failed to activate campaigns')
      }
    },

    async bulkDeactivate() {
      if (this.selectedCampaigns.length === 0) return
      
      try {
        const response = await this.bulkUpdateStatus({
          campaignIds: this.selectedCampaigns,
          isActive: false
        })
        if (response.success) {
          this.toast.success(`${this.selectedCampaigns.length} campaign(s) deactivated successfully!`)
          this.selectedCampaigns = []
        }
      } catch (error) {
        console.error('Bulk deactivate error:', error)
        this.toast.error(error.message || 'Failed to deactivate campaigns')
      }
    },

    async bulkDelete() {
      if (this.selectedCampaigns.length === 0) return
      
      if (confirm(`Are you sure you want to delete ${this.selectedCampaigns.length} campaign(s)?`)) {
        try {
          const response = await this.bulkDeleteCampaigns(this.selectedCampaigns)
          if (response.success) {
            this.toast.success(`${this.selectedCampaigns.length} campaign(s) deleted successfully!`)
            this.selectedCampaigns = []
          }
        } catch (error) {
          console.error('Bulk delete error:', error)
          this.toast.error(error.message || 'Failed to delete campaigns')
        }
      }
    },

    closeCampaignModal() {
      this.showAddCampaignModal = false
      this.showEditCampaignModal = false
      this.selectedCampaign = null
    },

    async handleCampaignSave(campaignData) {
      try {
        let response
        if (this.showEditCampaignModal) {
          response = await this.updateCampaign({
            id: this.selectedCampaign.id,
            campaignData
          })
          this.toast.success('Campaign updated successfully!')
        } else {
          response = await this.createCampaign(campaignData)
          this.toast.success('Campaign created successfully!')
        }
        
        if (response.success) {
          this.closeCampaignModal()
        }
      } catch (error) {
        console.error('Save campaign error:', error)
        this.toast.error(
          error.message || 
          (this.showEditCampaignModal 
            ? 'Failed to update campaign' 
            : 'Failed to create campaign')
        )
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
    },

    // Image handling methods
    getCampaignImageUrl(campaign) {
      // Simple approach - return original URL or placeholder
      if (campaign.imageUrl) {
        return campaign.imageUrl
      }
      
      if (campaign.image) {
        // If image is just filename, construct full URL
        if (campaign.image.startsWith('http')) {
          return campaign.image
        } else {
          return `${process.env.VUE_APP_API_URL}/uploads/campaigns/${campaign.image}`
        }
      }
      
      // Return fallback image URL
      return 'https://cdn.create.web.com/images/industries/common/images/placeholder-product-image-sq.jpg'
    },

    handleImageError(event, campaign) {
      console.warn('Image failed to load for campaign:', campaign.name)
      // Set fallback image
      event.target.src = 'https://cdn.create.web.com/images/industries/common/images/placeholder-product-image-sq.jpg'
      // Add error class for styling
      event.target.classList.add('image-error')
    },

    handleImageLoad(event) {
      // Remove error class if image loads successfully
      event.target.classList.remove('image-error')
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

.campaign-container {
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

/* Campaign Card */
.campaign-card {
  transition: all 0.3s ease;
  overflow: hidden;
}

.campaign-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.campaign-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.campaign-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.campaign-image img.image-error {
  opacity: 0.7;
  filter: grayscale(20%);
}

.campaign-card:hover .campaign-image img:not(.image-error) {
  transform: scale(1.05);
}

.campaign-badges {
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.campaign-badges .badge {
  font-size: 0.7rem;
  padding: 0.4rem 0.6rem;
}

.campaign-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-label {
  font-size: 0.75rem;
  color: #6c757d;
  margin-bottom: 2px;
}

.stat-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #495057;
}

.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
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

.badge.bg-success {
  background-color: #28a745 !important;
}

.badge.bg-warning {
  background-color: #ffc107 !important;
  color: #000;
}

.badge.bg-danger {
  background-color: #dc3545 !important;
}

.badge.bg-secondary {
  background-color: #6c757d !important;
}

.badge.bg-light {
  background-color: #f8f9fa !important;
  color: #495057 !important;
  border: 1px solid #dee2e6;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .campaign-container {
    padding: 1rem;
  }
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }
  
  .campaign-container {
    padding: 0.75rem;
    margin-top: 70px;
  }
  
  .stat-card .card-body {
    padding: 1rem;
  }
  
  .campaign-image {
    height: 150px;
  }
  
  .stat-icon {
    width: 32px;
    height: 32px;
  }
}

@media (max-width: 576px) {
  .campaign-container {
    padding: 0.5rem;
  }
  
  .stat-card .card-body {
    padding: 0.75rem;
  }
  
  .stat-card h3 {
    font-size: 1.5rem;
  }
  
  .campaign-image {
    height: 120px;
  }
  
  .btn-sm {
    font-size: 0.75rem;
    padding: 0.4rem 0.8rem;
  }
  
  .badge {
    font-size: 0.7rem;
    padding: 0.4rem 0.6rem;
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
.campaign-card {
  animation: fadeInUp 0.5s ease-out;
}

.stat-card:nth-child(1) { animation-delay: 0.1s; }
.stat-card:nth-child(2) { animation-delay: 0.2s; }
.stat-card:nth-child(3) { animation-delay: 0.3s; }
.stat-card:nth-child(4) { animation-delay: 0.4s; }

/* Loading states */
.loading-shimmer {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Hover effects */
.campaign-card:hover .card-title {
  color: #007bff;
}

.dropdown-toggle::after {
  display: none;
}

/* Focus states for accessibility */
.campaign-card:focus,
.btn:focus {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

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