<!-- /src/components/modals/CampaignProductsModal.vue - Simple and Functional -->
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
            <i class="fas fa-box-open text-primary me-2"></i>
            Manage Campaign Products
          </h5>
          <button 
            @click="$emit('close')"
            type="button" 
            class="btn-close"
          ></button>
        </div>
        
        <div class="modal-body">
          <div v-if="campaign">
            <!-- Campaign Info Header -->
            <div class="campaign-header mb-4">
              <div class="d-flex align-items-center">
                <div class="campaign-icon me-3">
                  <i class="fas fa-bullhorn text-primary"></i>
                </div>
                <div>
                  <h6 class="mb-0 fw-bold">{{ campaign.name }}</h6>
                  <small class="text-muted">{{ campaign.description }}</small>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h6 class="mb-0">Campaign Products</h6>
                <small class="text-muted">Manage products associated with this campaign</small>
              </div>
              <div class="btn-group">
                <button 
                  @click="showAddProducts = !showAddProducts"
                  class="btn btn-primary btn-sm"
                  :disabled="isSubmitting"
                >
                  <i class="fas fa-plus me-2"></i>
                  {{ showAddProducts ? 'Hide' : 'Add Products' }}
                </button>
                <button 
                  @click="handleRefresh"
                  class="btn btn-outline-primary btn-sm"
                  :disabled="isSubmitting"
                >
                  <i v-if="isSubmitting" class="fas fa-spinner fa-spin me-1"></i>
                  <i v-else class="fas fa-sync-alt me-1"></i>
                  Refresh
                </button>
              </div>
            </div>

            <!-- Campaign Products List -->
            <div class="row">
              <!-- Current Campaign Products -->
              <div class="col-md-6">
                <div class="products-section">
                  <div class="section-header">
                    <h6 class="fw-semibold mb-0">
                      <i class="fas fa-check-circle text-success me-2"></i>
                      Campaign Products
                    </h6>
                    <span class="badge bg-success">{{ campaignProducts.length }}</span>
                  </div>
                  
                  <div class="products-list">
                    <div v-if="isLoading" class="text-center py-4">
                      <div class="spinner-border spinner-border-sm" role="status">
                        <span class="visually-hidden">Loading...</span>
                      </div>
                      <p class="text-muted mt-2">Loading products...</p>
                    </div>
                    
                    <div v-else-if="campaignProducts.length === 0" class="empty-state py-4">
                      <i class="fas fa-box fa-2x text-muted mb-2"></i>
                      <p class="text-muted mb-0">No products in this campaign</p>
                      <button 
                        @click="showAddProducts = true"
                        class="btn btn-sm btn-primary mt-2"
                      >
                        <i class="fas fa-plus me-1"></i>
                        Add First Product
                      </button>
                    </div>
                    
                    <div v-else>
                      <div 
                        v-for="product in campaignProducts" 
                        :key="product.id"
                        class="product-item"
                      >
                        <div class="d-flex align-items-center">
                          <img 
                            :src="getProductImageUrl(product)"
                            :alt="product.title"
                            class="product-image me-3"
                            @error="handleImageError($event)"
                          >
                          <div class="flex-grow-1">
                            <h6 class="mb-1 product-title">{{ product.title }}</h6>
                            <small class="text-muted">{{ product.category?.name || 'No Category' }}</small>
                            <div class="mt-1">
                              <span class="badge bg-light text-dark me-1">
                                {{ formatPrice(product.price) }}
                              </span>
                              <span class="badge bg-light text-dark me-1">
                                {{ product.points || 0 }} pts
                              </span>
                            </div>
                          </div>
                          <button 
                            @click="removeProduct(product.id, product.title)"
                            class="btn btn-sm btn-outline-danger"
                            :disabled="isSubmitting"
                          >
                            <i class="fas fa-times"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Available Products -->
              <div v-if="showAddProducts" class="col-md-6">
                <div class="products-section">
                  <div class="section-header">
                    <h6 class="fw-semibold mb-0">
                      <i class="fas fa-plus-circle text-primary me-2"></i>
                      Available Products
                    </h6>
                    <button 
                      @click="showAddProducts = false"
                      class="btn btn-sm btn-outline-secondary"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                  </div>

                  <!-- Search Products -->
                  <div class="search-products mb-3">
                    <input
                      v-model="productSearch"
                      type="text"
                      class="form-control form-control-sm"
                      placeholder="Search available products..."
                    >
                  </div>

                  <!-- Selected Products for Addition -->
                  <div v-if="selectedProducts.length > 0" class="selected-products mb-3">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                      <small class="text-muted fw-semibold">
                        Selected: {{ selectedProducts.length }}
                      </small>
                      <div class="btn-group btn-group-sm">
                        <button 
                          @click="addSelectedProducts"
                          class="btn btn-success"
                          :disabled="isSubmitting"
                        >
                          <i v-if="isSubmitting" class="fas fa-spinner fa-spin me-1"></i>
                          <i v-else class="fas fa-plus me-1"></i>
                          Add Selected
                        </button>
                        <button 
                          @click="clearSelection"
                          class="btn btn-outline-secondary"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div class="products-list">
                    <div v-if="isLoading" class="text-center py-4">
                      <div class="spinner-border spinner-border-sm" role="status">
                        <span class="visually-hidden">Loading...</span>
                      </div>
                    </div>
                    
                    <div v-else-if="filteredAvailableProducts.length === 0" class="empty-state py-4">
                      <i class="fas fa-search fa-2x text-muted mb-2"></i>
                      <p class="text-muted mb-0">
                        {{ productSearch ? 'No products match your search' : 'No products available' }}
                      </p>
                    </div>
                    
                    <div v-else>
                      <div 
                        v-for="product in filteredAvailableProducts" 
                        :key="product.id"
                        class="product-item selectable"
                        :class="{ selected: selectedProducts.includes(product.id) }"
                        @click="toggleProductSelection(product.id)"
                      >
                        <div class="d-flex align-items-center">
                          <div class="form-check me-2">
                            <input
                              v-model="selectedProducts"
                              :value="product.id"
                              type="checkbox"
                              class="form-check-input"
                              @click.stop
                            >
                          </div>
                          <img 
                            :src="getProductImageUrl(product)"
                            :alt="product.title"
                            class="product-image me-3"
                            @error="handleImageError($event)"
                          >
                          <div class="flex-grow-1">
                            <h6 class="mb-1 product-title">{{ product.title }}</h6>
                            <small class="text-muted">{{ product.category?.name || 'No Category' }}</small>
                            <div class="mt-1">
                              <span class="badge bg-light text-dark me-1">
                                {{ formatPrice(product.price) }}
                              </span>
                              <span class="badge bg-light text-dark me-1">
                                {{ product.points || 0 }} pts
                              </span>
                            </div>
                          </div>
                        </div>
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
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useToast } from 'vue-toastification'
import campaignService from '@/services/campaignService'

export default {
  name: 'CampaignProductsModal',
  
  props: {
    show: {
      type: Boolean,
      default: false
    },
    campaign: {
      type: Object,
      default: null
    }
  },

  emits: ['close', 'refresh'],

  setup() {
    const toast = useToast()
    return { toast }
  },

  data() {
    return {
      campaignProducts: [],
      availableProducts: [],
      selectedProducts: [],
      showAddProducts: false,
      isLoading: false,
      isSubmitting: false,
      productSearch: ''
    }
  },

  computed: {
    filteredAvailableProducts() {
      let filtered = this.availableProducts.filter(product => 
        !this.campaignProducts.some(cp => cp.id === product.id)
      )

      if (this.productSearch.trim()) {
        const query = this.productSearch.toLowerCase()
        filtered = filtered.filter(product =>
          product.title.toLowerCase().includes(query) ||
          (product.category?.name || '').toLowerCase().includes(query)
        )
      }

      return filtered.slice(0, 50)
    }
  },

  watch: {
    show: {
      handler(newVal) {
        if (newVal) {
          this.initializeModal()
          document.body.style.overflow = 'hidden'
        } else {
          document.body.style.overflow = 'auto'
          this.resetModal()
        }
      },
      immediate: true
    }
  },

  beforeUnmount() {
    document.body.style.overflow = 'auto'
  },

  methods: {
    async initializeModal() {
      if (!this.campaign) return
      
      try {
        await Promise.all([
          this.loadCampaignProducts(),
          this.loadAvailableProducts()
        ])
      } catch (error) {
        console.error('Failed to initialize modal:', error)
        this.toast.error('Failed to load data')
      }
    },

    resetModal() {
      this.showAddProducts = false
      this.selectedProducts = []
      this.productSearch = ''
    },

    async loadCampaignProducts() {
      if (!this.campaign?.id) return
      
      this.isLoading = true
      try {
        const response = await campaignService.getCampaignProducts(this.campaign.id)
        if (response.success) {
          this.campaignProducts = response.data || []
        }
      } catch (error) {
        console.error('Failed to load campaign products:', error)
        this.campaignProducts = []
        this.toast.error('Failed to load campaign products')
      } finally {
        this.isLoading = false
      }
    },

    async loadAvailableProducts() {
      this.isLoading = true
      try {
        const response = await fetch(`${process.env.VUE_APP_API_URL || 'https://apihustl.sijago.ai'}/api/v1/products?limit=100`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          this.availableProducts = data.data || []
        } else {
          this.availableProducts = []
        }
      } catch (error) {
        console.error('Failed to load products:', error)
        this.availableProducts = []
        this.toast.error('Failed to load available products')
      } finally {
        this.isLoading = false
      }
    },

    toggleProductSelection(productId) {
      const index = this.selectedProducts.indexOf(productId)
      if (index > -1) {
        this.selectedProducts.splice(index, 1)
      } else {
        this.selectedProducts.push(productId)
      }
    },

    clearSelection() {
      this.selectedProducts = []
    },

    async addSelectedProducts() {
      if (this.selectedProducts.length === 0) return

      this.isSubmitting = true
      try {
        const response = await campaignService.addProductsToCampaign(
          this.campaign.id,
          this.selectedProducts
        )
        
        if (response.success) {
          const successCount = response.data.success ? response.data.success.length : 0
          const failedCount = response.data.failed ? response.data.failed.length : 0
          
          if (successCount > 0) {
            this.toast.success(`Added ${successCount} product(s) to campaign`)
          }
          
          if (failedCount > 0) {
            this.toast.warning(`${failedCount} product(s) could not be added`)
          }
          
          this.selectedProducts = []
          await this.loadCampaignProducts()
          this.$emit('refresh')
        }
      } catch (error) {
        console.error('Failed to add products:', error)
        this.toast.error('Failed to add products to campaign')
      } finally {
        this.isSubmitting = false
      }
    },

    async removeProduct(productId, productTitle) {
      if (!confirm(`Are you sure you want to remove "${productTitle}" from this campaign?`)) {
        return
      }

      this.isSubmitting = true
      try {
        const response = await campaignService.removeProductsFromCampaign(
          this.campaign.id,
          [productId]
        )
        
        if (response.success) {
          this.toast.success('Product removed from campaign')
          await this.loadCampaignProducts()
          this.$emit('refresh')
        }
      } catch (error) {
        console.error('Failed to remove product:', error)
        this.toast.error('Failed to remove product from campaign')
      } finally {
        this.isSubmitting = false
      }
    },

    async handleRefresh() {
      await this.initializeModal()
      this.toast.success('Data refreshed successfully!')
    },

    formatPrice(value) {
      if (!value && value !== 0) return 'Rp 0'
      return `Rp ${parseFloat(value).toLocaleString('id-ID')}`
    },

    getProductImageUrl(product) {
      if (!product) return this.getPlaceholderImage()
      
      if (product.imageUrl) {
        return product.imageUrl
      }
      
      if (product.image) {
        if (product.image.startsWith('http')) {
          return product.image
        } else {
          return `https://apihustl.sijago.ai/uploads/products/${product.image}`
        }
      }
      
      return this.getPlaceholderImage()
    },

    getPlaceholderImage() {
      return 'https://cdn.create.web.com/images/industries/common/images/placeholder-product-image-sq.jpg'
    },

    handleImageError(event) {
      event.target.src = this.getPlaceholderImage()
      event.target.classList.add('image-error')
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

.campaign-header {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid #e9ecef;
}

.campaign-icon {
  width: 40px;
  height: 40px;
  background-color: #e3f2fd;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.products-section {
  background-color: #fff;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  height: 500px;
  display: flex;
  flex-direction: column;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e9ecef;
  background-color: #f8f9fa;
  border-radius: 10px 10px 0 0;
}

.products-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
}

.product-item {
  padding: 0.75rem;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  transition: all 0.3s ease;
}

.product-item:last-child {
  margin-bottom: 0;
}

.product-item:hover {
  background-color: #f8f9fa;
  border-color: #007bff;
}

.product-item.selectable {
  cursor: pointer;
}

.product-item.selectable.selected {
  background-color: #e3f2fd;
  border-color: #007bff;
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.15);
}

.product-image {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #dee2e6;
}

.product-image.image-error {
  opacity: 0.7;
  filter: grayscale(20%);
}

.product-title {
  font-size: 0.9rem;
  margin-bottom: 0;
  font-weight: 600;
  color: #495057;
}

.empty-state {
  text-align: center;
  color: #6c757d;
}

.empty-state i {
  opacity: 0.5;
}

.selected-products {
  background-color: #e3f2fd;
  border: 1px solid #007bff;
  border-radius: 6px;
  padding: 0.75rem;
}

.badge {
  font-size: 0.7rem;
  padding: 0.25rem 0.5rem;
}

.badge.bg-light {
  background-color: #f8f9fa !important;
  color: #495057 !important;
  border: 1px solid #dee2e6;
}

.badge.bg-success {
  background-color: #28a745 !important;
}

.btn {
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.8rem;
}

.btn-primary {
  background-color: #007bff;
  border-color: #007bff;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0056b3;
  border-color: #0056b3;
}

.btn-success {
  background-color: #28a745;
  border-color: #28a745;
}

.btn-success:hover:not(:disabled) {
  background-color: #218838;
  border-color: #1e7e34;
}

.btn-outline-danger {
  color: #dc3545;
  border-color: #dc3545;
}

.btn-outline-danger:hover:not(:disabled) {
  background-color: #dc3545;
  border-color: #dc3545;
  color: white;
}

.btn-outline-secondary {
  color: #6c757d;
  border-color: #6c757d;
}

.btn-outline-secondary:hover:not(:disabled) {
  background-color: #6c757d;
  border-color: #6c757d;
  color: white;
}

.btn-outline-primary {
  color: #007bff;
  border-color: #007bff;
}

.btn-outline-primary:hover:not(:disabled) {
  background-color: #007bff;
  border-color: #007bff;
  color: white;
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

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

.form-check-input {
  width: 1rem;
  height: 1rem;
}

.form-check-input:checked {
  background-color: #007bff;
  border-color: #007bff;
}

.form-control {
  border-radius: 6px;
  border: 1px solid #dee2e6;
  transition: all 0.3s ease;
}

.form-control:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
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
  
  .modal-body {
    max-height: 70vh;
  }
  
  .products-section {
    height: 400px;
  }
  
  .row .col-md-6:not(:first-child) {
    margin-top: 1rem;
  }
}

@media (max-width: 576px) {
  .modal-dialog {
    margin: 0.5rem;
    max-width: calc(100% - 1rem);
  }
  
  .products-section {
    height: 350px;
  }
  
  .btn {
    width: 100%;
    margin-bottom: 0.5rem;
  }
  
  .modal-footer {
    flex-direction: column-reverse;
  }
}
</style>