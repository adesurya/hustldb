<!-- /src/views/CategoryView.vue - Category Management Page -->
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
      
      <!-- Category Content Container -->
      <main class="category-container">
        <!-- Page Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 class="mb-1 fw-bold text-dark">Category Management</h2>
            <p class="text-muted mb-0">Manage your product categories</p>
          </div>
          <button 
            @click="showAddCategoryModal = true"
            class="btn btn-primary d-flex align-items-center"
          >
            <i class="fas fa-plus me-2"></i>
            Add Category
          </button>
        </div>

        <!-- Statistics Cards -->
        <div class="row g-3 mb-4">
          <div class="col-xl-4 col-lg-6 col-md-6">
            <div class="stat-card card h-100 border-0">
              <div class="card-body p-3">
                <div class="d-flex align-items-center justify-content-between">
                  <div class="stat-content">
                    <div class="stat-icon bg-primary bg-opacity-10 p-2 rounded-circle mb-2">
                      <i class="fas fa-tags text-primary"></i>
                    </div>
                    <h3 class="mb-1 fw-bold text-dark">{{ statistics.totalCategories || 0 }}</h3>
                    <h6 class="text-muted mb-0 small">Total Categories</h6>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-xl-4 col-lg-6 col-md-6">
            <div class="stat-card card h-100 border-0">
              <div class="card-body p-3">
                <div class="d-flex align-items-center justify-content-between">
                  <div class="stat-content">
                    <div class="stat-icon bg-success bg-opacity-10 p-2 rounded-circle mb-2">
                      <i class="fas fa-check-circle text-success"></i>
                    </div>
                    <h3 class="mb-1 fw-bold text-dark">{{ statistics.activeCategories || 0 }}</h3>
                    <h6 class="text-muted mb-0 small">Active Categories</h6>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-xl-4 col-lg-6 col-md-6">
            <div class="stat-card card h-100 border-0">
              <div class="card-body p-3">
                <div class="d-flex align-items-center justify-content-between">
                  <div class="stat-content">
                    <div class="stat-icon bg-secondary bg-opacity-10 p-2 rounded-circle mb-2">
                      <i class="fas fa-pause-circle text-secondary"></i>
                    </div>
                    <h3 class="mb-1 fw-bold text-dark">{{ statistics.inactiveCategories || 0 }}</h3>
                    <h6 class="text-muted mb-0 small">Inactive Categories</h6>
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
                    placeholder="Search categories by name or description..."
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
        <div v-if="selectedCategories.length > 0" class="card border-0 mb-4">
          <div class="card-body bg-light">
            <div class="d-flex justify-content-between align-items-center">
              <span class="text-muted">
                {{ selectedCategories.length }} category(s) selected
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

        <!-- Categories Table -->
        <div class="card border-0">
          <div class="card-header bg-white border-0 pb-0">
            <div class="d-flex justify-content-between align-items-center">
              <h6 class="fw-bold text-dark mb-0">Category List</h6>
              <div class="d-flex align-items-center">
                <label class="form-check-label me-3 text-muted small">
                  <input
                    v-model="selectAll"
                    @change="toggleSelectAll"
                    type="checkbox"
                    class="form-check-input me-2"
                  >
                  Select All
                </label>
                <span class="text-muted small">
                  Showing {{ filteredCategoriesList.length }} of {{ categories.length }} categories
                </span>
              </div>
            </div>
          </div>

          <div class="card-body">
            <!-- Loading State -->
            <div v-if="isLoading" class="text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else-if="filteredCategoriesList.length === 0" class="text-center py-5">
              <div class="empty-state">
                <i class="fas fa-search fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">No categories found</h5>
                <p class="text-muted">
                  {{ searchQuery || selectedStatus ? 'Try adjusting your search or filters' : 'Start by adding your first category' }}
                </p>
                <button 
                  v-if="!searchQuery && !selectedStatus"
                  @click="showAddCategoryModal = true"
                  class="btn btn-primary"
                >
                  <i class="fas fa-plus me-2"></i>
                  Add Category
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

            <!-- Categories Grid -->
            <div v-else class="row g-3">
              <div 
                v-for="category in filteredCategoriesList" 
                :key="category.id"
                class="col-xl-4 col-lg-6 col-md-6"
              >
                <div class="category-card card h-100 border-0 position-relative">
                  <!-- Selection Checkbox -->
                  <div class="position-absolute top-0 start-0 p-3" style="z-index: 5;">
                    <input
                      v-model="selectedCategories"
                      :value="category.id"
                      type="checkbox"
                      class="form-check-input"
                    >
                  </div>

                  <!-- Category Menu -->
                  <div class="position-absolute top-0 end-0 p-3" style="z-index: 5;">
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
                            @click="editCategory(category)"
                            class="dropdown-item"
                            href="#"
                          >
                            <i class="fas fa-edit me-2"></i>Edit
                          </a>
                        </li>
                        <li>
                          <a 
                            @click="toggleStatus(category)"
                            class="dropdown-item"
                            href="#"
                          >
                            <i 
                              :class="category.isActive ? 'fas fa-pause' : 'fas fa-play'"
                              class="me-2"
                            ></i>
                            {{ category.isActive ? 'Deactivate' : 'Activate' }}
                          </a>
                        </li>
                        <li><hr class="dropdown-divider"></li>
                        <li>
                          <a 
                            @click="confirmDeleteCategory(category)"
                            class="dropdown-item text-danger"
                            href="#"
                          >
                            <i class="fas fa-trash me-2"></i>Delete
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <!-- Category Content -->
                  <div class="card-body p-4">
                    <!-- Category Icon and Status -->
                    <div class="text-center mb-3">
                      <div class="category-icon bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-2">
                        <i class="fas fa-tag text-primary fa-2x"></i>
                      </div>
                      <div class="category-badges">
                        <span 
                          :class="category.isActive ? 'bg-success' : 'bg-secondary'"
                          class="badge"
                        >
                          {{ category.isActive ? 'Active' : 'Inactive' }}
                        </span>
                      </div>
                    </div>

                    <!-- Category Info -->
                    <div class="text-center mb-3">
                      <h6 class="card-title mb-1 fw-bold text-truncate">
                        {{ category.name }}
                      </h6>
                      <small class="text-muted">{{ category.slug }}</small>
                      <p v-if="category.description" class="card-text text-muted small text-truncate-2 mt-2 mb-0">
                        {{ category.description }}
                      </p>
                    </div>

                    <!-- Category Stats -->
                    <div class="row g-2 mb-3">
                      <div class="col-6">
                        <div class="category-stat text-center">
                          <span class="stat-label">Sort Order</span>
                          <span class="stat-value">{{ category.sortOrder || 0 }}</span>
                        </div>
                      </div>
                      <div class="col-6">
                        <div class="category-stat text-center">
                          <span class="stat-label">Created</span>
                          <span class="stat-value">{{ formatDate(category.created_at) }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="row g-2">
                      <div class="col-6">
                        <button 
                          @click="editCategory(category)"
                          class="btn btn-primary btn-sm w-100"
                          title="Edit Category"
                        >
                          <i class="fas fa-edit me-1"></i>Edit
                        </button>
                      </div>
                      <div class="col-6">
                        <button 
                          @click="confirmDeleteCategory(category)"
                          class="btn btn-danger btn-sm w-100"
                          title="Delete Category"
                        >
                          <i class="fas fa-trash me-1"></i>Delete
                        </button>
                      </div>
                    </div>
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

    <!-- Add/Edit Category Modal -->
    <CategoryModal
      v-if="showAddCategoryModal || showEditCategoryModal"
      :show="showAddCategoryModal || showEditCategoryModal"
      :category="selectedCategory"
      :isEdit="showEditCategoryModal"
      @close="closeCategoryModal"
      @save="handleCategorySave"
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
            <p class="mb-3">Are you sure you want to delete this category?</p>
            
            <div v-if="categoryToDelete" class="alert alert-light border">
              <div class="d-flex align-items-center">
                <div class="category-icon bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 50px; height: 50px;">
                  <i class="fas fa-tag text-primary"></i>
                </div>
                <div>
                  <h6 class="mb-1 fw-bold">{{ categoryToDelete.name }}</h6>
                  <small class="text-muted">{{ categoryToDelete.slug }}</small>
                </div>
              </div>
            </div>
            
            <p class="text-muted small mb-0">
              <i class="fas fa-info-circle me-1"></i>
              This action cannot be undone. All products in this category will become uncategorized.
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
              {{ isDeleting ? 'Deleting...' : 'Delete Category' }}
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
import CategoryModal from '@/components/modals/CategoryModal.vue'

export default {
  name: 'CategoryView',
  
  components: {
    Sidebar,
    Header,
    Footer,
    CategoryModal
  },

  setup() {
    const toast = useToast()
    return { toast }
  },

  data() {
    return {
      isRefreshing: false,
      sidebarVisible: true,
      selectedCategories: [],
      selectedCategory: null,
      showAddCategoryModal: false,
      showEditCategoryModal: false,
      showDeleteModal: false,
      categoryToDelete: null,
      isDeleting: false,
      // Simplified filters - only search and status
      searchQuery: '',
      selectedStatus: '',
      searchTimeout: null,
      selectAll: false
    }
  },

  mounted() {
    this.checkMobileScreen()
    window.addEventListener('resize', this.checkMobileScreen)
    this.initializeCategories()
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.checkMobileScreen)
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout)
    }
  },

  computed: {
    ...mapGetters('categories', [
      'categories',
      'statistics',
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
    filteredCategoriesList() {
      let filtered = [...this.categories]

      // Filter by search query
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase().trim()
        filtered = filtered.filter(category => 
          category.name.toLowerCase().includes(query) ||
          (category.description && category.description.toLowerCase().includes(query)) ||
          category.slug.toLowerCase().includes(query)
        )
      }

      // Filter by status
      if (this.selectedStatus) {
        filtered = filtered.filter(category => 
          (this.selectedStatus === 'active' && category.isActive) ||
          (this.selectedStatus === 'inactive' && !category.isActive)
        )
      }

      return filtered
    }
  },

  watch: {
    selectedCategories: {
      handler(newVal) {
        this.selectAll = newVal.length === this.filteredCategoriesList.length && this.filteredCategoriesList.length > 0
      },
      deep: true
    },

    filteredCategoriesList: {
      handler() {
        // Reset select all when filter changes
        this.selectAll = false
        this.selectedCategories = []
      }
    }
  },

  methods: {
    ...mapActions('categories', [
      'fetchCategories',
      'fetchCategory',
      'createCategory',
      'updateCategory',
      'deleteCategory',
      'toggleCategoryStatus',
      'bulkDeleteCategories',
      'bulkUpdateStatus',
      'setFilters',
      'setPagination',
      'resetFilters'
    ]),

    async initializeCategories() {
      this.isRefreshing = true
      try {
        await this.fetchCategories()
      } catch (error) {
        console.error('Failed to load categories:', error)
        this.toast.error('Failed to load categories')
      } finally {
        this.isRefreshing = false
      }
    },

    async handleRefresh() {
      await this.initializeCategories()
      this.toast.success('Categories refreshed successfully!')
    },

    handleSidebarLogout() {
      this.$router.push('/login')
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

    // Search functionality
    handleSearch() {
      // Debounce search for better performance
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout)
      }
      
      this.searchTimeout = setTimeout(() => {
        // Search is handled by computed property filteredCategoriesList
        console.log('Searching for:', this.searchQuery)
      }, 300)
    },

    // Status filter functionality
    handleStatusFilter() {
      console.log('Filtering by status:', this.selectedStatus)
      // Filter is handled by computed property filteredCategoriesList
    },

    // Clear all filters
    clearFilters() {
      this.searchQuery = ''
      this.selectedStatus = ''
      this.selectedCategories = []
      this.selectAll = false
      console.log('Filters cleared')
    },

    // Select all functionality
    toggleSelectAll() {
      if (this.selectAll) {
        this.selectedCategories = this.filteredCategoriesList.map(category => category.id)
      } else {
        this.selectedCategories = []
      }
    },

    goToPage(page) {
      if (page >= 1 && page <= this.pagination.totalPages) {
        this.setPagination({ currentPage: page })
      }
    },

    editCategory(category) {
      this.selectedCategory = { ...category }
      this.showEditCategoryModal = true
    },

    confirmDeleteCategory(category) {
      this.categoryToDelete = category
      this.showDeleteModal = true
    },

    async executeDelete() {
      if (!this.categoryToDelete) return
      
      this.isDeleting = true
      try {
        const response = await this.deleteCategory(this.categoryToDelete.id)
        if (response.success) {
          this.toast.success('Category deleted successfully!')
          this.selectedCategories = this.selectedCategories.filter(id => id !== this.categoryToDelete.id)
          this.showDeleteModal = false
          this.categoryToDelete = null
        }
      } catch (error) {
        console.error('Delete error:', error)
        this.toast.error(error.message || 'Failed to delete category')
      } finally {
        this.isDeleting = false
      }
    },

    async toggleStatus(category) {
      try {
        const response = await this.toggleCategoryStatus(category.id)
        if (response.success) {
          this.toast.success(response.message || 'Category status updated successfully!')
        }
      } catch (error) {
        console.error('Toggle status error:', error)
        this.toast.error(error.message || 'Failed to update category status')
      }
    },

    async bulkActivate() {
      if (this.selectedCategories.length === 0) return
      
      try {
        const response = await this.bulkUpdateStatus({
          categoryIds: this.selectedCategories,
          isActive: true
        })
        if (response.success) {
          this.toast.success(`${this.selectedCategories.length} category(s) activated successfully!`)
          this.selectedCategories = []
          this.selectAll = false
        }
      } catch (error) {
        console.error('Bulk activate error:', error)
        this.toast.error(error.message || 'Failed to activate categories')
      }
    },

    async bulkDeactivate() {
      if (this.selectedCategories.length === 0) return
      
      try {
        const response = await this.bulkUpdateStatus({
          categoryIds: this.selectedCategories,
          isActive: false
        })
        if (response.success) {
          this.toast.success(`${this.selectedCategories.length} category(s) deactivated successfully!`)
          this.selectedCategories = []
          this.selectAll = false
        }
      } catch (error) {
        console.error('Bulk deactivate error:', error)
        this.toast.error(error.message || 'Failed to deactivate categories')
      }
    },

    async bulkDelete() {
      if (this.selectedCategories.length === 0) return
      
      if (confirm(`Are you sure you want to delete ${this.selectedCategories.length} category(s)? This action cannot be undone.`)) {
        try {
          const response = await this.bulkDeleteCategories(this.selectedCategories)
          if (response.success) {
            this.toast.success(`${this.selectedCategories.length} category(s) deleted successfully!`)
            this.selectedCategories = []
            this.selectAll = false
          }
        } catch (error) {
          console.error('Bulk delete error:', error)
          this.toast.error(error.message || 'Failed to delete categories')
        }
      }
    },

    closeCategoryModal() {
      this.showAddCategoryModal = false
      this.showEditCategoryModal = false
      this.selectedCategory = null
    },

    async handleCategorySave(categoryData) {
      try {
        let response
        if (this.showEditCategoryModal) {
          response = await this.updateCategory({
            id: this.selectedCategory.id,
            categoryData
          })
          this.toast.success('Category updated successfully!')
        } else {
          response = await this.createCategory(categoryData)
          this.toast.success('Category created successfully!')
        }
        
        if (response.success) {
          this.closeCategoryModal()
        }
      } catch (error) {
        console.error('Save category error:', error)
        this.toast.error(
          error.message || 
          (this.showEditCategoryModal 
            ? 'Failed to update category' 
            : 'Failed to create category')
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

.category-container {
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

/* Category Card Styles */
.category-card {
  transition: all 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.category-icon {
  width: 80px;
  height: 80px;
}

.category-badges {
  margin-top: 0.5rem;
}

.category-badges .badge {
  font-size: 0.7rem;
  padding: 0.4rem 0.6rem;
  border-radius: 6px;
}

.category-stat {
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

.badge.bg-secondary {
  background-color: #6c757d !important;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .category-container {
    padding: 1rem;
  }
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }
  
  .category-container {
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
  
  .category-icon {
    width: 60px;
    height: 60px;
  }
}

@media (max-width: 576px) {
  .category-container {
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
.category-card {
  animation: fadeInUp 0.5s ease-out;
}

.stat-card:nth-child(1) { animation-delay: 0.1s; }
.stat-card:nth-child(2) { animation-delay: 0.2s; }
.stat-card:nth-child(3) { animation-delay: 0.3s; }

/* Hover effects */
.category-card:hover .card-title {
  color: #007bff;
}

.dropdown-toggle::after {
  display: none;
}

/* Focus states for accessibility */
.category-card:focus,
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