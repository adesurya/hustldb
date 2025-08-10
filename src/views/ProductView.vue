<!-- Updated ProductView.vue with enhanced product management features -->
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
      
      <!-- Product Content Container -->
      <main class="product-container">
        <!-- Page Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 class="mb-1 fw-bold text-dark">Product Management</h2>
            <p class="text-muted mb-0">Manage your products and inventory</p>
          </div>
          <button 
            @click="showAddProductModal = true"
            class="btn btn-primary d-flex align-items-center"
          >
            <i class="fas fa-plus me-2"></i>
            Add Product
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
                      <i class="fas fa-box text-primary"></i>
                    </div>
                    <h3 class="mb-1 fw-bold text-dark">{{ filteredProductsList.length }}</h3>
                    <h6 class="text-muted mb-0 small">
                      {{ searchQuery || selectedCategory ? 'Filtered' : 'Total' }} Products
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
                    <h3 class="mb-1 fw-bold text-dark">{{ getActiveProductsCount }}</h3>
                    <h6 class="text-muted mb-0 small">Active Products</h6>
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
                      <i class="fas fa-star text-warning"></i>
                    </div>
                    <h3 class="mb-1 fw-bold text-dark">{{ getFeaturedProductsCount }}</h3>
                    <h6 class="text-muted mb-0 small">Featured Products</h6>
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
                      <i class="fas fa-tags text-info"></i>
                    </div>
                    <h3 class="mb-1 fw-bold text-dark">{{ categories.length }}</h3>
                    <h6 class="text-muted mb-0 small">Categories</h6>
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
                    placeholder="Search products by title or description..."
                  >
                  <i class="fas fa-search position-absolute search-icon"></i>
                </div>
              </div>

              <!-- Category Filter -->
              <div class="col-lg-3 col-md-4">
                <select 
                  v-model="selectedCategory"
                  @change="handleCategoryFilter"
                  class="form-select"
                >
                  <option value="">All Categories</option>
                  <option 
                    v-for="category in categories" 
                    :key="category.id"
                    :value="category.id.toString()"
                  >
                    {{ category.name }}
                  </option>
                </select>
              </div>

              <!-- Clear Filters -->
              <div class="col-lg-3 col-md-12">
                <button 
                  @click="clearFilters"
                  class="btn btn-outline-secondary w-100"
                  :disabled="!searchQuery && !selectedCategory"
                >
                  <i class="fas fa-times me-2"></i>
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Bulk Actions -->
        <div v-if="selectedProducts.length > 0" class="card border-0 mb-4">
          <div class="card-body bg-light">
            <div class="d-flex justify-content-between align-items-center">
              <span class="text-muted">
                {{ selectedProducts.length }} product(s) selected
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

        <!-- Products Grid -->
        <div v-if="isLoading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <div v-else-if="filteredProductsList.length === 0" class="text-center py-5">
          <div class="empty-state">
            <i class="fas fa-search fa-3x text-muted mb-3"></i>
            <h5 class="text-muted">No products found</h5>
            <p class="text-muted">
              {{ searchQuery || selectedCategory ? 'Try adjusting your search or filters' : 'Start by adding your first product' }}
            </p>
            <button 
              v-if="!searchQuery && !selectedCategory"
              @click="showAddProductModal = true"
              class="btn btn-primary"
            >
              <i class="fas fa-plus me-2"></i>
              Add Product
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
            v-for="product in filteredProductsList" 
            :key="product.id"
            class="col-xl-4 col-lg-6 col-md-6"
          >
            <div class="product-card card h-100 border-0 position-relative">
              <!-- Selection Checkbox -->
              <div class="position-absolute top-0 start-0 p-3">
                <input
                  v-model="selectedProducts"
                  :value="product.id"
                  type="checkbox"
                  class="form-check-input"
                >
              </div>

              <!-- Product Menu -->
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
                        @click="editProduct(product)"
                        class="dropdown-item"
                        href="#"
                      >
                        <i class="fas fa-edit me-2"></i>Edit
                      </a>
                    </li>
                    <li>
                      <a 
                        @click="toggleStatus(product)"
                        class="dropdown-item"
                        href="#"
                      >
                        <i 
                          :class="product.isActive ? 'fas fa-pause' : 'fas fa-play'"
                          class="me-2"
                        ></i>
                        {{ product.isActive ? 'Deactivate' : 'Activate' }}
                      </a>
                    </li>
                    <li>
                      <a 
                        @click="toggleFeatured(product)"
                        class="dropdown-item"
                        href="#"
                      >
                        <i 
                          :class="product.isFeatured ? 'fas fa-star-o' : 'fas fa-star'"
                          class="me-2"
                        ></i>
                        {{ product.isFeatured ? 'Unfeature' : 'Feature' }}
                      </a>
                    </li>
                    <li>
                      <a 
                        @click="viewProduct(product)"
                        class="dropdown-item"
                        href="#"
                      >
                        <i class="fas fa-eye me-2"></i>View Details
                      </a>
                    </li>
                    <li><hr class="dropdown-divider"></li>
                    <li>
                      <a 
                        @click="confirmDeleteProduct(product)"
                        class="dropdown-item text-danger"
                        href="#"
                      >
                        <i class="fas fa-trash me-2"></i>Delete
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

              <!-- Product Image -->
              <div class="product-image">
                <img 
                  :src="getProductImageUrl(product)"
                  :alt="product.title"
                  class="card-img-top"
                  crossorigin="anonymous"
                  referrerpolicy="no-referrer"
                  @error="handleImageError($event, product)"
                  @load="handleImageLoad($event)"
                >
                <div class="product-badges">
                  <span 
                    v-if="product.isFeatured"
                    class="badge bg-warning text-dark"
                  >
                    <i class="fas fa-star me-1"></i>Featured
                  </span>
                  <span 
                    :class="product.isActive ? 'bg-success' : 'bg-secondary'"
                    class="badge"
                  >
                    {{ product.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </div>
              </div>

              <!-- Product Info -->
              <div class="card-body p-3">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <h6 class="card-title mb-0 fw-bold text-truncate">
                    {{ product.title }}
                  </h6>
                </div>

                <p class="card-text text-muted small text-truncate-2 mb-3">
                  {{ product.description }}
                </p>

                <div class="row g-2 mb-3">
                  <div class="col-6">
                    <div class="product-stat">
                      <span class="stat-label">Price</span>
                      <span class="stat-value text-primary fw-bold">
                        {{ product.formattedPrice }}
                      </span>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="product-stat">
                      <span class="stat-label">Points</span>
                      <span class="stat-value text-success fw-bold">
                        {{ formatNumber(product.points) }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="row g-2 mb-3">
                  <div class="col-6">
                    <div class="product-stat">
                      <span class="stat-label">Stock</span>
                      <span class="stat-value">{{ formatNumber(product.stockQuantity) }}</span>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="product-stat">
                      <span class="stat-label">Views</span>
                      <span class="stat-value">{{ formatNumber(product.viewCount) }}</span>
                    </div>
                  </div>
                </div>

                <div class="mb-3">
                  <span class="badge bg-light text-dark">
                    {{ product.category?.name || 'No Category' }}
                  </span>
                </div>

                <!-- Action Buttons -->
                <div class="row g-2">
                  <div class="col-6">
                    <button 
                      @click="editProduct(product)"
                      class="btn btn-primary btn-sm w-100"
                    >
                      <i class="fas fa-edit me-1"></i>Edit
                    </button>
                  </div>
                  <div class="col-6">
                    <button 
                      @click="confirmDeleteProduct(product)"
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

    <!-- Add/Edit Product Modal -->
    <ProductModal
      v-if="showAddProductModal || showEditProductModal"
      :show="showAddProductModal || showEditProductModal"
      :product="selectedProduct"
      :categories="categories"
      :isEdit="showEditProductModal"
      @close="closeProductModal"
      @save="handleProductSave"
    />

    <!-- Product Detail Modal -->
    <ProductDetailModal
      v-if="showDetailModal"
      :show="showDetailModal"
      :product="selectedProduct"
      @close="showDetailModal = false"
      @edit="editProductFromDetail"
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
            <p class="mb-3">Are you sure you want to delete this product?</p>
            
            <div v-if="productToDelete" class="alert alert-light border">
              <div class="d-flex align-items-center">
                <img 
                  :src="getProductImageUrl(productToDelete)"
                  :alt="productToDelete.title"
                  class="me-3"
                  style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;"
                  @error="handleImageError($event, productToDelete)"
                >
                <div>
                  <h6 class="mb-1 fw-bold">{{ productToDelete.title }}</h6>
                  <small class="text-muted">{{ productToDelete.category?.name || 'No Category' }}</small>
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
              {{ isDeleting ? 'Deleting...' : 'Delete Product' }}
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
import ProductModal from '@/components/modals/ProductModal.vue'
import ProductDetailModal from '@/components/modals/ProductDetailModal.vue'

export default {
  name: 'ProductView',
  
  components: {
    Sidebar,
    Header,
    Footer,
    ProductModal,
    ProductDetailModal
  },

  setup() {
    const toast = useToast()
    return { toast }
  },

  data() {
    return {
      isRefreshing: false,
      sidebarVisible: true,
      selectedProducts: [],
      selectedProduct: null,
      showAddProductModal: false,
      showEditProductModal: false,
      showDetailModal: false,
      showDeleteModal: false,
      productToDelete: null,
      isDeleting: false,
      // Simplified filters - only search and category
      searchQuery: '',
      selectedCategory: '',
      searchTimeout: null
    }
  },

  mounted() {
    this.checkMobileScreen()
    window.addEventListener('resize', this.checkMobileScreen)
    this.initializeProducts()
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.checkMobileScreen)
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout)
    }
  },

  computed: {
    ...mapGetters('products', [
      'products',
      'categories',
      'pagination',
      'filters',
      'isLoading',
      'isSubmitting',
      'activeProducts',
      'featuredProducts'
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

    // Client-side filtering for search and category
    filteredProductsList() {
      let filtered = [...this.products]

      // Filter by search query
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase().trim()
        filtered = filtered.filter(product => 
          product.title.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query)
        )
      }

      // Filter by category
      if (this.selectedCategory) {
        filtered = filtered.filter(product => 
          product.categoryId.toString() === this.selectedCategory
        )
      }

      return filtered
    },

    // Get active products count from filtered list
    getActiveProductsCount() {
      return this.filteredProductsList.filter(product => product.isActive).length
    },

    // Get featured products count from filtered list
    getFeaturedProductsCount() {
      return this.filteredProductsList.filter(product => product.isFeatured).length
    }
  },

  methods: {
    ...mapActions('products', [
      'fetchProducts',
      'fetchCategories',
      'createProduct',
      'updateProduct',
      'deleteProduct',
      'toggleProductStatus',
      'toggleFeaturedStatus',
      'bulkDeleteProducts',
      'bulkUpdateStatus',
      'setFilters',
      'setPagination',
      'resetFilters'
    ]),

    async initializeProducts() {
      this.isRefreshing = true
      try {
        await Promise.all([
          this.fetchProducts(),
          this.fetchCategories()
        ])
      } catch (error) {
        console.error('Failed to load products:', error)
        this.toast.error('Failed to load products')
      } finally {
        this.isRefreshing = false
      }
    },

    async handleRefresh() {
      await this.initializeProducts()
      this.toast.success('Products refreshed successfully!')
    },

    handleSidebarLogout() {
      this.$router.push('/login')
    },

    formatNumber(value) {
      if (!value) return '0'
      return parseFloat(value).toLocaleString('id-ID')
    },

    // Search functionality
    handleSearch() {
      // Debounce search for better performance
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout)
      }
      
      this.searchTimeout = setTimeout(() => {
        // Search is handled by computed property filteredProductsList
        console.log('Searching for:', this.searchQuery)
      }, 300)
    },

    // Category filter functionality
    handleCategoryFilter() {
      console.log('Filtering by category:', this.selectedCategory)
      // Filter is handled by computed property filteredProductsList
    },

    // Clear all filters
    clearFilters() {
      this.searchQuery = ''
      this.selectedCategory = ''
      console.log('Filters cleared')
    },

    // Remove old filter methods
    debounceSearch() {
      // This method is no longer needed
    },

    applyFilters() {
      // This method is no longer needed
    },

    goToPage(page) {
      if (page >= 1 && page <= this.pagination.totalPages) {
        this.setPagination({ currentPage: page })
      }
    },

    editProduct(product) {
      this.selectedProduct = { ...product }
      this.showEditProductModal = true
    },

    editProductFromDetail(product) {
      this.selectedProduct = { ...product }
      this.showDetailModal = false
      this.showEditProductModal = true
    },

    viewProduct(product) {
      this.selectedProduct = product
      this.showDetailModal = true
    },

    async handleDeleteProduct(product) {
      if (confirm(`Are you sure you want to delete "${product.title}"?`)) {
        try {
          const response = await this.deleteProduct(product.id)
          if (response.success) {
            this.toast.success('Product deleted successfully!')
            this.selectedProducts = this.selectedProducts.filter(id => id !== product.id)
          }
        } catch (error) {
          console.error('Delete error:', error)
          this.toast.error(error.message || 'Failed to delete product')
        }
      }
    },

    // New method with better naming
    confirmDeleteProduct(product) {
      this.productToDelete = product
      this.showDeleteModal = true
    },

    async executeDelete() {
      if (!this.productToDelete) return
      
      this.isDeleting = true
      try {
        const response = await this.deleteProduct(this.productToDelete.id)
        if (response.success) {
          this.toast.success('Product deleted successfully!')
          this.selectedProducts = this.selectedProducts.filter(id => id !== this.productToDelete.id)
          this.showDeleteModal = false
          this.productToDelete = null
        }
      } catch (error) {
        console.error('Delete error:', error)
        this.toast.error(error.message || 'Failed to delete product')
      } finally {
        this.isDeleting = false
      }
    },

    async toggleStatus(product) {
      try {
        const response = await this.toggleProductStatus(product.id)
        if (response.success) {
          this.toast.success(response.message || 'Product status updated successfully!')
        }
      } catch (error) {
        console.error('Toggle status error:', error)
        this.toast.error(error.message || 'Failed to update product status')
      }
    },

    async toggleFeatured(product) {
      try {
        const response = await this.toggleFeaturedStatus(product.id)
        if (response.success) {
          this.toast.success(response.message || 'Product featured status updated successfully!')
        }
      } catch (error) {
        console.error('Toggle featured error:', error)
        this.toast.error(error.message || 'Failed to update featured status')
      }
    },

    async bulkActivate() {
      if (this.selectedProducts.length === 0) return
      
      try {
        const response = await this.bulkUpdateStatus({
          productIds: this.selectedProducts,
          isActive: true
        })
        if (response.success) {
          this.toast.success(`${this.selectedProducts.length} product(s) activated successfully!`)
          this.selectedProducts = []
        }
      } catch (error) {
        console.error('Bulk activate error:', error)
        this.toast.error(error.message || 'Failed to activate products')
      }
    },

    async bulkDeactivate() {
      if (this.selectedProducts.length === 0) return
      
      try {
        const response = await this.bulkUpdateStatus({
          productIds: this.selectedProducts,
          isActive: false
        })
        if (response.success) {
          this.toast.success(`${this.selectedProducts.length} product(s) deactivated successfully!`)
          this.selectedProducts = []
        }
      } catch (error) {
        console.error('Bulk deactivate error:', error)
        this.toast.error(error.message || 'Failed to deactivate products')
      }
    },

    async bulkDelete() {
      if (this.selectedProducts.length === 0) return
      
      if (confirm(`Are you sure you want to delete ${this.selectedProducts.length} product(s)?`)) {
        try {
          const response = await this.bulkDeleteProducts(this.selectedProducts)
          if (response.success) {
            this.toast.success(`${this.selectedProducts.length} product(s) deleted successfully!`)
            this.selectedProducts = []
          }
        } catch (error) {
          console.error('Bulk delete error:', error)
          this.toast.error(error.message || 'Failed to delete products')
        }
      }
    },

    closeProductModal() {
      this.showAddProductModal = false
      this.showEditProductModal = false
      this.selectedProduct = null
    },

    async handleProductSave(productData) {
      try {
        let response
        if (this.showEditProductModal) {
          response = await this.updateProduct({
            id: this.selectedProduct.id,
            productData
          })
          this.toast.success('Product updated successfully!')
        } else {
          response = await this.createProduct(productData)
          this.toast.success('Product created successfully!')
        }
        
        if (response.success) {
          this.closeProductModal()
        }
      } catch (error) {
        console.error('Save product error:', error)
        this.toast.error(
          error.message || 
          (this.showEditProductModal 
            ? 'Failed to update product' 
            : 'Failed to create product')
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
    getProductImageUrl(product) {
      // Simple approach - return original URL or placeholder
      if (product.imageUrl) {
        return product.imageUrl
      }
      
      if (product.image) {
        // If image is just filename, construct full URL
        if (product.image.startsWith('http')) {
          return product.image
        } else {
          return `${process.env.VUE_APP_API_URL}/uploads/products/${product.image}`
        }
      }
      
      // Return fallback image URL
      return 'https://cdn.create.web.com/images/industries/common/images/placeholder-product-image-sq.jpg'
    },

    handleImageError(event, product) {
      console.warn('Image failed to load for product:', product.title, 'URL:', event.target.src)
      console.warn('Error details:', event)
      
      // Set fallback image
      event.target.src = 'https://cdn.create.web.com/images/industries/common/images/placeholder-product-image-sq.jpg'
      
      // Add error class for styling
      event.target.classList.add('image-error')
    },

    handleImageLoad(event) {
      // Remove error class if image loads successfully
      event.target.classList.remove('image-error')
      console.log('Image loaded successfully:', event.target.src)
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

.product-container {
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

/* Product Card */
.product-card {
  transition: all 0.3s ease;
  overflow: hidden;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.product-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-image img.image-error {
  opacity: 0.7;
  filter: grayscale(20%);
}

.product-card:hover .product-image img:not(.image-error) {
  transform: scale(1.05);
}

.product-badges {
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.product-badges .badge {
  font-size: 0.7rem;
  padding: 0.4rem 0.6rem;
}

.product-stat {
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

.badge.bg-warning {
  background-color: #ffc107 !important;
  color: #000;
}

.badge.bg-success {
  background-color: #28a745 !important;
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
  .product-container {
    padding: 1rem;
  }
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }
  
  .product-container {
    padding: 0.75rem;
    margin-top: 70px;
  }
  
  .stat-card .card-body {
    padding: 1rem;
  }
  
  .product-image {
    height: 150px;
  }
  
  .stat-icon {
    width: 32px;
    height: 32px;
  }
  
  .card-header h6 {
    font-size: 0.9rem;
  }
}

@media (max-width: 576px) {
  .product-container {
    padding: 0.5rem;
  }
  
  .stat-card .card-body {
    padding: 0.75rem;
  }
  
  .stat-card h3 {
    font-size: 1.5rem;
  }
  
  .product-image {
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
.product-card {
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
.product-card:hover .card-title {
  color: #007bff;
}

.dropdown-toggle::after {
  display: none;
}

/* Focus states for accessibility */
.product-card:focus,
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