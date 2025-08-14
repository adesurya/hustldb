<!-- /src/components/modals/ProductDetailModal.vue - Fixed version -->
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
            Product Details
          </h5>
          <button 
            @click="$emit('close')"
            type="button" 
            class="btn-close"
          ></button>
        </div>
        
        <div class="modal-body">
          <!-- Loading State -->
          <div v-if="product && product.isLoading" class="text-center py-5">
            <div class="spinner-border text-primary mb-3" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="text-muted">Loading product details...</p>
          </div>

          <!-- Product Content -->
          <div v-else-if="product" class="row g-4">
            <!-- Product Image -->
            <div class="col-md-5">
              <div class="product-image-container">
                <img 
                  :src="getProductImageUrl(product)"
                  :alt="product.title"
                  class="img-fluid rounded"
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
            </div>

            <!-- Product Information -->
            <div class="col-md-7">
              <div class="product-info">
                <!-- Title and Category -->
                <h3 class="product-title mb-2">{{ product.title }}</h3>
                <div class="mb-3">
                  <span class="badge bg-light text-dark">
                    {{ product.category?.name || 'No Category' }}
                  </span>
                </div>

                <!-- Description -->
                <div class="mb-4">
                  <h6 class="fw-semibold text-muted mb-2">Description</h6>
                  <p class="text-muted">{{ product.description }}</p>
                </div>

                <!-- Pricing Information -->
                <div class="row g-3 mb-4">
                  <div class="col-6">
                    <div class="info-card">
                      <div class="info-icon bg-primary bg-opacity-10">
                        <i class="fas fa-tag text-primary"></i>
                      </div>
                      <div class="info-content">
                        <div class="info-label">Price</div>
                        <div class="info-value text-primary fw-bold">
                          {{ product.formattedPrice || formatPrice(product.price) }}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="col-6">
                    <div class="info-card">
                      <div class="info-icon bg-success bg-opacity-10">
                        <i class="fas fa-coins text-success"></i>
                      </div>
                      <div class="info-content">
                        <div class="info-label">Points</div>
                        <div class="info-value text-success fw-bold">
                          {{ formatNumber(product.points) }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Stock and Views -->
                <div class="row g-3 mb-4">
                  <div class="col-6">
                    <div class="info-card">
                      <div class="info-icon bg-info bg-opacity-10">
                        <i class="fas fa-box text-info"></i>
                      </div>
                      <div class="info-content">
                        <div class="info-label">Stock</div>
                        <div class="info-value fw-bold">
                          {{ formatNumber(product.stockQuantity) }}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="col-6">
                    <div class="info-card">
                      <div class="info-icon bg-warning bg-opacity-10">
                        <i class="fas fa-eye text-warning"></i>
                      </div>
                      <div class="info-content">
                        <div class="info-label">Views</div>
                        <div class="info-value fw-bold">
                          {{ formatNumber(product.viewCount) }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Product URL -->
                <div v-if="product.url" class="mb-4">
                  <h6 class="fw-semibold text-muted mb-2">Product URL</h6>
                  <a 
                    :href="product.url" 
                    target="_blank" 
                    class="btn btn-outline-primary btn-sm"
                  >
                    <i class="fas fa-external-link-alt me-2"></i>
                    View Product
                  </a>
                </div>
              </div>
            </div>

            <!-- Additional Information -->
            <div class="col-12">
              <div class="additional-info">
                <h6 class="fw-semibold mb-3">Additional Information</h6>
                
                <div class="row g-3">
                  <!-- Meta Information -->
                  <div class="col-md-6">
                    <div class="info-section">
                      <h6 class="info-section-title">SEO Information</h6>
                      <div class="info-item">
                        <span class="info-item-label">Meta Title:</span>
                        <span class="info-item-value">
                          {{ product.metaTitle || 'Not set' }}
                        </span>
                      </div>
                      <div class="info-item">
                        <span class="info-item-label">Meta Description:</span>
                        <span class="info-item-value">
                          {{ product.metaDescription || 'Not set' }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- System Information -->
                  <div class="col-md-6">
                    <div class="info-section">
                      <h6 class="info-section-title">System Information</h6>
                      <div class="info-item">
                        <span class="info-item-label">Product ID:</span>
                        <span class="info-item-value">#{{ product.id }}</span>
                      </div>
                      <div class="info-item">
                        <span class="info-item-label">Slug:</span>
                        <span class="info-item-value">{{ product.slug }}</span>
                      </div>
                      <div class="info-item">
                        <span class="info-item-label">Sort Order:</span>
                        <span class="info-item-value">{{ product.sortOrder || 0 }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Timestamps -->
                  <div class="col-12">
                    <div class="info-section">
                      <h6 class="info-section-title">Timestamps</h6>
                      <div class="row g-2">
                        <div class="col-md-4">
                          <div class="info-item">
                            <span class="info-item-label">Created:</span>
                            <span class="info-item-value">
                              {{ formatDate(product.createdAt) }}
                            </span>
                          </div>
                        </div>
                        <div class="col-md-4">
                          <div class="info-item">
                            <span class="info-item-label">Updated:</span>
                            <span class="info-item-value">
                              {{ formatDate(product.updatedAt) }}
                            </span>
                          </div>
                        </div>
                      <div class="row g-2">
                        <div class="col-md-4">
                          <div class="info-item">
                            <span class="info-item-label">Created:</span>
                            <span class="info-item-value">
                              {{ formatDate(product.createdAt) }}
                            </span>
                          </div>
                        </div>
                        <div class="col-md-4">
                          <div class="info-item">
                            <span class="info-item-label">Updated:</span>
                            <span class="info-item-value">
                              {{ formatDate(product.updatedAt) }}
                            </span>
                          </div>
                        </div>
                        <div class="col-md-4">
                          <div class="info-item">
                            <span class="info-item-label">Created By:</span>
                            <span class="info-item-value">
                              {{ product.createdBy ? `User #${product.createdBy}` : 'System' }}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <!-- Additional row for extra fields -->
                      <div class="row g-2 mt-2">
                        <div class="col-md-6">
                          <div class="info-item">
                            <span class="info-item-label">Updated By:</span>
                            <span class="info-item-value">
                              {{ product.updatedBy ? `User #${product.updatedBy}` : 'Not updated' }}
                            </span>
                          </div>
                        </div>
                        <div class="col-md-6">
                          <div class="info-item">
                            <span class="info-item-label">Status:</span>
                            <span class="info-item-value">
                              {{ product.deletedAt ? 'Deleted' : 'Active' }}
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
          <button 
            @click="editProduct"
            type="button" 
            class="btn btn-primary"
          >
            <i class="fas fa-edit me-2"></i>
            Edit Product
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProductDetailModal',
  
  props: {
    show: {
      type: Boolean,
      default: false
    },
    product: {
      type: Object,
      default: null
    }
  },

  emits: ['close', 'edit'],

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

    formatPrice(value) {
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

    editProduct() {
      this.$emit('edit', this.product)
      this.$emit('close')
    },

    // Image handling methods - Updated to use the correct API base URL
    getProductImageUrl(product) {
      // Use the imageUrl from API response if available
      if (product.imageUrl) {
        return product.imageUrl
      }
      
      // Fallback to constructing URL from image filename
      if (product.image) {
        if (product.image.startsWith('http')) {
          return product.image
        } else {
          return `https://apihustl.sijago.ai/uploads/products/${product.image}`
        }
      }
      
      // Return fallback placeholder image
      return 'https://cdn.create.web.com/images/industries/common/images/placeholder-product-image-sq.jpg'
    },

    handleImageError(event, product) {
      console.warn('Image failed to load for product:', product.title, 'URL:', event.target.src)
      console.warn('Error details:', event)
      
      // Set fallback placeholder image
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

.product-image-container {
  position: relative;
  text-align: center;
}

.product-image-container img {
  max-height: 300px;
  object-fit: cover;
  border: 1px solid #dee2e6;
}

.product-image-container img.image-error {
  opacity: 0.7;
  filter: grayscale(20%);
}

.product-badges {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.product-badges .badge {
  font-size: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
}

.product-title {
  color: #495057;
  font-weight: 700;
  line-height: 1.3;
}

.info-card {
  display: flex;
  align-items: center;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 10px;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.info-card:hover {
  background-color: #e9ecef;
  transform: translateY(-2px);
}

.info-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
  flex-shrink: 0;
}

.info-content {
  flex: 1;
}

.info-label {
  font-size: 0.75rem;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.25rem;
}

.info-value {
  font-size: 1rem;
  color: #495057;
}

.additional-info {
  background-color: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e9ecef;
}

.info-section {
  margin-bottom: 1.5rem;
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

.btn-primary:hover {
  background-color: #0056b3;
  border-color: #0056b3;
  transform: translateY(-1px);
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

.btn-outline-primary {
  color: #007bff;
  border-color: #007bff;
}

.btn-outline-primary:hover {
  background-color: #007bff;
  border-color: #007bff;
  color: white;
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
  
  .info-card {
    padding: 0.75rem;
  }
  
  .info-icon {
    width: 32px;
    height: 32px;
    margin-right: 0.5rem;
  }
  
  .additional-info {
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
  
  .product-title {
    font-size: 1.25rem;
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

.info-card {
  animation: fadeInUp 0.3s ease-out;
}

.info-card:nth-child(1) { animation-delay: 0.1s; }
.info-card:nth-child(2) { animation-delay: 0.2s; }
.info-card:nth-child(3) { animation-delay: 0.3s; }
.info-card:nth-child(4) { animation-delay: 0.4s; }
</style>