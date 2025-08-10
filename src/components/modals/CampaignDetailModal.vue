<!-- /src/components/modals/CampaignDetailModal.vue - Complete Version -->
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
            <i class="fas fa-bullhorn text-primary me-2"></i>
            Campaign Details
          </h5>
          <button 
            @click="$emit('close')"
            type="button" 
            class="btn-close"
          ></button>
        </div>
        
        <div class="modal-body">
          <!-- Loading State -->
          <div v-if="isLoading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="text-muted mt-2">Loading campaign details...</p>
          </div>

          <!-- Campaign Detail Content -->
          <div v-else-if="campaignDetail" class="row g-4">
            <!-- Campaign Header -->
            <div class="col-12">
              <div class="campaign-header">
                <div class="row g-3">
                  <!-- Campaign Image -->
                  <div class="col-md-4">
                    <div class="campaign-image-container">
                      <img 
                        :src="getCampaignImageUrl(campaignDetail)"
                        :alt="campaignDetail.name"
                        class="img-fluid rounded"
                        crossorigin="anonymous"
                        referrerpolicy="no-referrer"
                        @error="handleImageError($event, campaignDetail)"
                        @load="handleImageLoad($event)"
                      >
                      <div class="campaign-badges">
                        <span 
                          v-if="campaignDetail.isCurrentlyActive"
                          class="badge bg-success"
                        >
                          <i class="fas fa-play me-1"></i>Running
                        </span>
                        <span 
                          :class="getStatusBadgeClass(campaignDetail.status)"
                          class="badge"
                        >
                          {{ getStatusText(campaignDetail.status) }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Campaign Info -->
                  <div class="col-md-8">
                    <div class="campaign-info">
                      <!-- Title and Status -->
                      <h3 class="campaign-title mb-2">{{ campaignDetail.name }}</h3>
                      <div class="mb-3">
                        <span class="badge bg-light text-dark">
                          ID: #{{ campaignDetail.id }}
                        </span>
                        <span class="badge bg-light text-dark ms-1">
                          Slug: {{ campaignDetail.slug }}
                        </span>
                        <span class="badge bg-info text-white ms-1">
                          <i class="fas fa-box me-1"></i>
                          {{ campaignDetail.productCount || 0 }} Products
                        </span>
                      </div>

                      <!-- Description -->
                      <div class="mb-4">
                        <h6 class="fw-semibold text-muted mb-2">Description</h6>
                        <p class="text-muted">{{ campaignDetail.description }}</p>
                      </div>

                      <!-- Date Information Grid -->
                      <div class="row g-3">
                        <div class="col-md-6">
                          <div class="info-card">
                            <div class="info-icon bg-primary bg-opacity-10">
                              <i class="fas fa-calendar-alt text-primary"></i>
                            </div>
                            <div class="info-content">
                              <div class="info-label">Start Date</div>
                              <div class="info-value text-primary fw-bold">
                                {{ formatDateTime(campaignDetail.startDate) }}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div class="col-md-6">
                          <div class="info-card">
                            <div class="info-icon bg-danger bg-opacity-10">
                              <i class="fas fa-calendar-times text-danger"></i>
                            </div>
                            <div class="info-content">
                              <div class="info-label">End Date</div>
                              <div class="info-value text-danger fw-bold">
                                {{ formatDateTime(campaignDetail.endDate) }}
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

            <!-- Campaign Products Section -->
            <div class="col-12">
              <div class="products-section">
                <div class="section-header">
                  <h5 class="fw-bold mb-0">
                    <i class="fas fa-box text-info me-2"></i>
                    Campaign Products ({{ campaignDetail.productCount || 0 }})
                  </h5>
                  <button 
                    @click="refreshProducts"
                    class="btn btn-sm btn-outline-primary"
                    :disabled="isLoadingProducts"
                  >
                    <i v-if="isLoadingProducts" class="fas fa-spinner fa-spin me-1"></i>
                    <i v-else class="fas fa-sync-alt me-1"></i>
                    Refresh
                  </button>
                </div>

                <!-- Products Grid -->
                <div v-if="isLoadingProducts" class="text-center py-4">
                  <div class="spinner-border spinner-border-sm text-primary" role="status">
                    <span class="visually-hidden">Loading products...</span>
                  </div>
                </div>

                <div v-else-if="campaignDetail.products && campaignDetail.products.length > 0" class="products-grid">
                  <div 
                    v-for="product in campaignDetail.products" 
                    :key="product.id"
                    class="product-card"
                  >
                    <div class="product-image">
                      <img 
                        :src="getProductImageUrl(product)"
                        :alt="product.title"
                        @error="handleProductImageError($event)"
                      >
                      
                      <!-- Product Status -->
                      <div class="product-status">
                        <span 
                          :class="product.isActive ? 'badge bg-success' : 'badge bg-secondary'"
                        >
                          {{ product.isActive ? 'Active' : 'Inactive' }}
                        </span>
                      </div>
                    </div>

                    <div class="product-info">
                      <h6 class="product-title mb-1">{{ product.title }}</h6>
                      <small class="text-muted d-block mb-2">{{ product.category?.name || 'No Category' }}</small>
                      
                      <div class="product-stats">
                        <div class="stat-item">
                          <span class="stat-label">Price</span>
                          <span class="stat-value text-success fw-bold">
                            {{ formatPrice(product.price) }}
                          </span>
                        </div>
                        <div class="stat-item">
                          <span class="stat-label">Points</span>
                          <span class="stat-value text-primary fw-bold">
                            {{ product.points || 0 }}
                          </span>
                        </div>
                      </div>

                      <!-- Product Actions -->
                      <div class="product-actions mt-2">
                        <a 
                          v-if="product.url"
                          :href="product.url"
                          target="_blank"
                          class="btn btn-sm btn-outline-primary"
                        >
                          <i class="fas fa-external-link-alt me-1"></i>
                          View
                        </a>
                        <span 
                          v-else
                          class="text-muted small"
                        >
                          No URL available
                        </span>
                      </div>

                      <!-- Campaign Relation Info -->
                      <div class="relation-info mt-2">
                        <small class="text-muted">
                          Added: {{ formatDateTime(product.addedAt) }}
                        </small>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-else class="empty-products">
                  <div class="text-center py-5">
                    <i class="fas fa-box-open fa-3x text-muted mb-3"></i>
                    <h6 class="text-muted">No Products in Campaign</h6>
                    <p class="text-muted small">This campaign doesn't have any products associated with it yet.</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Campaign Statistics -->
            <div class="col-12">
              <div class="campaign-stats">
                <h6 class="fw-semibold mb-3">Campaign Statistics</h6>
                
                <div class="row g-3">
                  <div class="col-md-3 col-6">
                    <div class="stat-card">
                      <div class="stat-icon bg-info bg-opacity-10">
                        <i class="fas fa-box text-info"></i>
                      </div>
                      <div class="stat-content">
                        <div class="stat-number">{{ campaignDetail.productCount || 0 }}</div>
                        <div class="stat-label">Total Products</div>
                      </div>
                    </div>
                  </div>

                  <div class="col-md-3 col-6">
                    <div class="stat-card">
                      <div class="stat-icon bg-success bg-opacity-10">
                        <i class="fas fa-check-circle text-success"></i>
                      </div>
                      <div class="stat-content">
                        <div class="stat-number">{{ getActiveProductsCount() }}</div>
                        <div class="stat-label">Active Products</div>
                      </div>
                    </div>
                  </div>

                  <div class="col-md-3 col-6">
                    <div class="stat-card">
                      <div class="stat-icon bg-warning bg-opacity-10">
                        <i class="fas fa-clock text-warning"></i>
                      </div>
                      <div class="stat-content">
                        <div class="stat-number">{{ campaignDetail.daysUntilStart || 0 }}</div>
                        <div class="stat-label">Days to Start</div>
                      </div>
                    </div>
                  </div>

                  <div class="col-md-3 col-6">
                    <div class="stat-card">
                      <div class="stat-icon bg-danger bg-opacity-10">
                        <i class="fas fa-hourglass-end text-danger"></i>
                      </div>
                      <div class="stat-content">
                        <div class="stat-number">{{ campaignDetail.daysUntilEnd || 0 }}</div>
                        <div class="stat-label">Days to End</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Additional Information -->
            <div class="col-12">
              <div class="additional-info">
                <h6 class="fw-semibold mb-3">Campaign Information</h6>
                
                <div class="row g-3">
                  <!-- Campaign Settings -->
                  <div class="col-md-6">
                    <div class="info-section">
                      <h6 class="info-section-title">Status & Settings</h6>
                      <div class="info-item">
                        <span class="info-item-label">Active Status:</span>
                        <span class="info-item-value">
                          <span :class="campaignDetail.isActive ? 'text-success' : 'text-danger'">
                            <i :class="campaignDetail.isActive ? 'fas fa-check-circle' : 'fas fa-times-circle'" class="me-1"></i>
                            {{ campaignDetail.isActive ? 'Active' : 'Inactive' }}
                          </span>
                        </span>
                      </div>
                      <div class="info-item">
                        <span class="info-item-label">Currently Running:</span>
                        <span class="info-item-value">
                          <span :class="campaignDetail.isCurrentlyActive ? 'text-success' : 'text-muted'">
                            <i :class="campaignDetail.isCurrentlyActive ? 'fas fa-play' : 'fas fa-pause'" class="me-1"></i>
                            {{ campaignDetail.isCurrentlyActive ? 'Yes' : 'No' }}
                          </span>
                        </span>
                      </div>
                      <div class="info-item">
                        <span class="info-item-label">Campaign Status:</span>
                        <span class="info-item-value">
                          <span :class="getStatusBadgeClass(campaignDetail.status)" class="badge">
                            {{ getStatusText(campaignDetail.status) }}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- System Information -->
                  <div class="col-md-6">
                    <div class="info-section">
                      <h6 class="info-section-title">System Information</h6>
                      <div class="info-item">
                        <span class="info-item-label">Campaign ID:</span>
                        <span class="info-item-value">#{{ campaignDetail.id }}</span>
                      </div>
                      <div class="info-item">
                        <span class="info-item-label">Slug:</span>
                        <span class="info-item-value">{{ campaignDetail.slug }}</span>
                      </div>
                      <div class="info-item">
                        <span class="info-item-label">Created By:</span>
                        <span class="info-item-value">
                          {{ campaignDetail.createdBy ? `User #${campaignDetail.createdBy}` : 'System' }}
                        </span>
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
                              {{ formatDateTime(campaignDetail.created_at) }}
                            </span>
                          </div>
                        </div>
                        <div class="col-md-4">
                          <div class="info-item">
                            <span class="info-item-label">Updated:</span>
                            <span class="info-item-value">
                              {{ formatDateTime(campaignDetail.updated_at) }}
                            </span>
                          </div>
                        </div>
                        <div class="col-md-4">
                          <div class="info-item">
                            <span class="info-item-label">Updated By:</span>
                            <span class="info-item-value">
                              {{ campaignDetail.updatedBy ? `User #${campaignDetail.updatedBy}` : 'Not updated' }}
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

          <!-- Error State -->
          <div v-else class="text-center py-5">
            <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
            <h6 class="text-muted">No campaign data available</h6>
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
            @click="editCampaign"
            type="button" 
            class="btn btn-primary"
          >
            <i class="fas fa-edit me-2"></i>
            Edit Campaign
          </button>
          <button 
            @click="manageProducts"
            type="button" 
            class="btn btn-success"
          >
            <i class="fas fa-box me-2"></i>
            Manage Products
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import campaignService from '@/services/campaignService'

export default {
  name: 'CampaignDetailModal',
  
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

  emits: ['close', 'edit', 'manage-products'],

  data() {
    return {
      campaignDetail: null,
      isLoading: false,
      isLoadingProducts: false
    }
  },

  watch: {
    show: {
      handler(newVal) {
        if (newVal) {
          this.loadCampaignDetail()
          document.body.style.overflow = 'hidden'
        } else {
          document.body.style.overflow = 'auto'
          this.campaignDetail = null
        }
      },
      immediate: true
    },

    campaign: {
      handler() {
        if (this.show && this.campaign) {
          this.loadCampaignDetail()
        }
      },
      immediate: true
    }
  },

  beforeUnmount() {
    document.body.style.overflow = 'auto'
  },

  methods: {
    async loadCampaignDetail() {
      if (!this.campaign?.id) return
      
      this.isLoading = true
      try {
        console.log('🚀 Loading campaign detail for:', this.campaign.id)
        const response = await campaignService.getCampaignDetail(this.campaign.id)
        if (response.success) {
          this.campaignDetail = response.data
          console.log('📦 Campaign detail loaded:', this.campaignDetail)
        }
      } catch (error) {
        console.error('Failed to load campaign detail:', error)
        this.campaignDetail = null
      } finally {
        this.isLoading = false
      }
    },

    async refreshProducts() {
      if (!this.campaignDetail?.id) return
      
      this.isLoadingProducts = true
      try {
        console.log('🔄 Refreshing campaign products...')
        const response = await campaignService.getCampaignProducts(this.campaignDetail.id, { page: 1, limit: 100 })
        if (response.success) {
          this.campaignDetail.products = response.data
          this.campaignDetail.productCount = response.data.length
          console.log('✅ Products refreshed:', response.data.length, 'products')
        }
      } catch (error) {
        console.error('Failed to refresh products:', error)
      } finally {
        this.isLoadingProducts = false
      }
    },

    getActiveProductsCount() {
      if (!this.campaignDetail?.products) return 0
      return this.campaignDetail.products.filter(product => product.isActive).length
    },

    editCampaign() {
      this.$emit('edit', this.campaignDetail)
    },

    manageProducts() {
      this.$emit('manage-products', this.campaignDetail)
    },

    formatNumber(value) {
      if (!value && value !== 0) return '0'
      return parseFloat(value).toLocaleString('id-ID')
    },

    formatPrice(value) {
      if (!value && value !== 0) return 'Rp 0'
      return `Rp ${parseFloat(value).toLocaleString('id-ID')}`
    },

    formatDateTime(dateString) {
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

    // Image handling methods
    getCampaignImageUrl(campaign) {
      if (campaign.imageUrl) return campaign.imageUrl
      if (campaign.image) {
        if (campaign.image.startsWith('http')) {
          return campaign.image
        } else {
          return `${process.env.VUE_APP_API_URL || 'https://apihustl.sijago.ai'}/uploads/campaigns/${campaign.image}`
        }
      }
      return 'https://cdn.create.web.com/images/industries/common/images/placeholder-product-image-sq.jpg'
    },

    getProductImageUrl(product) {
      if (product.imageUrl) return product.imageUrl
      if (product.image) {
        if (product.image.startsWith('http')) {
          return product.image
        } else {
          return `${process.env.VUE_APP_API_URL || 'https://apihustl.sijago.ai'}/uploads/products/${product.image}`
        }
      }
      return 'https://cdn.create.web.com/images/industries/common/images/placeholder-product-image-sq.jpg'
    },

    handleImageError(event, campaign) {
      console.warn('Image failed to load for campaign:', campaign.name)
      event.target.src = 'https://cdn.create.web.com/images/industries/common/images/placeholder-product-image-sq.jpg'
      event.target.classList.add('image-error')
    },

    handleProductImageError(event) {
      console.warn('Product image failed to load')
      event.target.src = 'https://cdn.create.web.com/images/industries/common/images/placeholder-product-image-sq.jpg'
      event.target.classList.add('image-error')
    },

    handleImageLoad(event) {
      event.target.classList.remove('image-error')
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

/* Campaign Header */
.campaign-header {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #dee2e6;
}

.campaign-image-container {
  position: relative;
  text-align: center;
}

.campaign-image-container img {
  max-height: 250px;
  object-fit: cover;
  border: 1px solid #dee2e6;
  border-radius: 8px;
}

.campaign-image-container img.image-error {
  opacity: 0.7;
  filter: grayscale(20%);
}

.campaign-badges {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.campaign-badges .badge {
  font-size: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
}

.campaign-title {
  color: #495057;
  font-weight: 700;
  line-height: 1.3;
}

.info-card {
  display: flex;
  align-items: center;
  padding: 1rem;
  background-color: white;
  border-radius: 10px;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
  height: 100%;
}

.info-card:hover {
  background-color: #f8f9fa;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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

/* Products Section */
.products-section {
  background-color: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e9ecef;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #dee2e6;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.product-card {
  background: white;
  border-radius: 10px;
  padding: 1rem;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border-color: #007bff;
}

.product-image {
  position: relative;
  text-align: center;
  margin-bottom: 1rem;
}

.product-image img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.product-image img.image-error {
  opacity: 0.7;
  filter: grayscale(20%);
}

.product-status {
  position: absolute;
  top: -5px;
  right: calc(50% - 40px);
}

.product-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #495057;
  line-height: 1.3;
}

.product-stats {
  display: flex;
  justify-content: space-between;
  margin: 0.75rem 0;
}

.stat-item {
  text-align: center;
  flex: 1;
}

.stat-label {
  font-size: 0.7rem;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: block;
}

.stat-value {
  font-size: 0.8rem;
  margin-top: 0.25rem;
  display: block;
}

.product-actions {
  text-align: center;
}

.relation-info {
  text-align: center;
  padding-top: 0.5rem;
  border-top: 1px solid #e9ecef;
}

.empty-products {
  background: white;
  border-radius: 8px;
  border: 2px dashed #dee2e6;
  margin: 1rem 0;
}

/* Campaign Statistics */
.campaign-stats {
  background-color: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e9ecef;
}

.stat-card {
  background: white;
  border-radius: 10px;
  padding: 1rem;
  border: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-card .stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #495057;
  line-height: 1;
}

.stat-content .stat-label {
  font-size: 0.8rem;
  color: #6c757d;
  margin-top: 0.25rem;
}

/* Additional Information */
.additional-info {
  background-color: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e9ecef;
}

.info-section {
  background: white;
  border-radius: 8px;
  padding: 1rem;
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

.badge.bg-info {
  background-color: #17a2b8 !important;
}

/* Button Styles */
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

.btn-success {
  background-color: #28a745;
  border-color: #28a745;
}

.btn-success:hover {
  background-color: #218838;
  border-color: #1e7e34;
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

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
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

/* Animations */
.fa-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

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

.product-card {
  animation: fadeInUp 0.5s ease-out;
}

.product-card:nth-child(1) { animation-delay: 0.1s; }
.product-card:nth-child(2) { animation-delay: 0.2s; }
.product-card:nth-child(3) { animation-delay: 0.3s; }
.product-card:nth-child(4) { animation-delay: 0.4s; }

/* Responsive Design */
@media (max-width: 1200px) {
  .modal-dialog {
    max-width: 90%;
  }
  
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

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
  
  .campaign-header {
    padding: 1rem;
  }
  
  .products-section,
  .campaign-stats,
  .additional-info {
    padding: 1rem;
  }
  
  .products-grid {
    grid-template-columns: 1fr;
  }
  
  .info-card {
    padding: 0.75rem;
  }
  
  .info-icon {
    width: 32px;
    height: 32px;
    margin-right: 0.5rem;
  }
  
  .campaign-image-container img {
    max-height: 200px;
  }
  
  .stat-card {
    padding: 0.75rem;
  }
  
  .stat-card .stat-icon {
    width: 32px;
    height: 32px;
    margin-right: 0.5rem;
  }
  
  .stat-number {
    font-size: 1.25rem;
  }
}

@media (max-width: 576px) {
  .modal-dialog {
    margin: 0.5rem;
    max-width: calc(100% - 1rem);
  }
  
  .campaign-image-container img {
    max-height: 150px;
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
  
  .product-stats {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .stat-item {
    text-align: left;
  }
  
  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .section-header .btn {
    width: auto;
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

/* Utility Classes */
.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.fw-semibold {
  font-weight: 600;
}

/* Loading States */
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
</style>