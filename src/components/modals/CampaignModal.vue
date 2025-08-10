<!-- /src/components/modals/CampaignModal.vue - Improved with Image Upload & Better Toggle -->
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
            {{ isEdit ? 'Edit Campaign' : 'Add New Campaign' }}
          </h5>
          <button 
            @click="$emit('close')"
            type="button" 
            class="btn-close"
          ></button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <div class="row g-3">
              <!-- Campaign Name -->
              <div class="col-12">
                <label class="form-label fw-semibold">
                  Campaign Name <span class="text-danger">*</span>
                </label>
                <input
                  v-model="form.name"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors.name }"
                  placeholder="Enter campaign name"
                  required
                  @input="generateSlug"
                >
                <div v-if="errors.name" class="invalid-feedback">
                  {{ errors.name }}
                </div>
              </div>

              <!-- Campaign Slug -->
              <div class="col-12">
                <label class="form-label fw-semibold">
                  Campaign Slug <span class="text-danger">*</span>
                </label>
                <input
                  v-model="form.slug"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors.slug }"
                  placeholder="campaign-slug"
                  required
                >
                <div class="form-text">
                  URL-friendly version of the campaign name
                </div>
                <div v-if="errors.slug" class="invalid-feedback">
                  {{ errors.slug }}
                </div>
              </div>

              <!-- Description -->
              <div class="col-12">
                <label class="form-label fw-semibold">
                  Description <span class="text-danger">*</span>
                </label>
                <textarea
                  v-model="form.description"
                  class="form-control"
                  :class="{ 'is-invalid': errors.description }"
                  rows="3"
                  placeholder="Enter campaign description"
                  required
                ></textarea>
                <div v-if="errors.description" class="invalid-feedback">
                  {{ errors.description }}
                </div>
              </div>

              <!-- Campaign Image -->
              <div class="col-12">
                <label class="form-label fw-semibold">
                  Campaign Image
                </label>
                
                <!-- Current Image Preview -->
                <div v-if="currentImagePreview" class="current-image-preview mb-3">
                  <div class="image-preview-container">
                    <img 
                      :src="currentImagePreview" 
                      :alt="form.name"
                      class="img-thumbnail"
                    >
                    <button 
                      type="button"
                      @click="removeCurrentImage"
                      class="btn btn-sm btn-danger remove-image-btn"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                  <small class="text-muted">Current image</small>
                </div>

                <!-- Image Upload Options -->
                <div class="image-upload-options">
                  <!-- Upload from Computer -->
                  <div class="upload-option mb-3">
                    <label class="form-label fw-semibold text-primary">
                      <i class="fas fa-upload me-2"></i>
                      Upload from Computer
                    </label>
                    <input
                      ref="fileInput"
                      type="file"
                      class="form-control"
                      accept="image/*"
                      @change="handleFileUpload"
                      :disabled="isUploadingImage"
                    >
                    <div class="form-text">
                      Supported formats: JPG, PNG, GIF. Max size: 5MB
                    </div>
                    
                    <!-- Upload Progress -->
                    <div v-if="isUploadingImage" class="upload-progress mt-2">
                      <div class="d-flex align-items-center">
                        <div class="spinner-border spinner-border-sm me-2" role="status">
                          <span class="visually-hidden">Uploading...</span>
                        </div>
                        <span class="text-muted">Uploading image...</span>
                      </div>
                    </div>
                  </div>

                  <!-- Image URL Input -->
                  <div class="upload-option">
                    <label class="form-label fw-semibold text-success">
                      <i class="fas fa-link me-2"></i>
                      Or Enter Image URL
                    </label>
                    <input
                      v-model="form.imageUrl"
                      type="url"
                      class="form-control"
                      placeholder="https://example.com/image.jpg"
                      @blur="validateImageUrl"
                    >
                    <div class="form-text">
                      Enter a direct link to an image
                    </div>
                  </div>

                  <!-- Preview for URL or Uploaded Image -->
                  <div v-if="imagePreview && !currentImagePreview" class="image-preview mt-3">
                    <img 
                      :src="imagePreview" 
                      :alt="form.name"
                      class="img-thumbnail"
                      @load="handlePreviewLoad"
                      @error="handlePreviewError"
                    >
                    <button 
                      type="button"
                      @click="clearImagePreview"
                      class="btn btn-sm btn-outline-danger mt-2"
                    >
                      <i class="fas fa-times me-1"></i>
                      Remove
                    </button>
                  </div>
                </div>
              </div>

              <!-- Start Date and End Date -->
              <div class="col-md-6">
                <label class="form-label fw-semibold">
                  Start Date <span class="text-danger">*</span>
                </label>
                <input
                  v-model="form.startDate"
                  type="datetime-local"
                  class="form-control"
                  :class="{ 'is-invalid': errors.startDate }"
                  required
                >
                <div v-if="errors.startDate" class="invalid-feedback">
                  {{ errors.startDate }}
                </div>
              </div>

              <div class="col-md-6">
                <label class="form-label fw-semibold">
                  End Date <span class="text-danger">*</span>
                </label>
                <input
                  v-model="form.endDate"
                  type="datetime-local"
                  class="form-control"
                  :class="{ 'is-invalid': errors.endDate }"
                  required
                >
                <div v-if="errors.endDate" class="invalid-feedback">
                  {{ errors.endDate }}
                </div>
              </div>

              <!-- Campaign Status Toggle - Improved -->
              <div class="col-12">
                <div class="campaign-status-section">
                  <label class="form-label fw-semibold">Campaign Status</label>
                  
                  <div class="status-toggle-container">
                    <!-- Toggle Switch -->
                    <div class="form-check form-switch form-switch-lg">
                      <input
                        v-model="form.isActive"
                        class="form-check-input"
                        type="checkbox"
                        id="campaignActiveToggle"
                        role="switch"
                      >
                      <label class="form-check-label fw-semibold" for="campaignActiveToggle">
                        <span :class="form.isActive ? 'text-success' : 'text-muted'">
                          {{ form.isActive ? 'Active' : 'Inactive' }}
                        </span>
                      </label>
                    </div>
                    
                    <!-- Status Indicator -->
                    <div class="status-indicator">
                      <span 
                        :class="form.isActive ? 'badge bg-success' : 'badge bg-secondary'"
                        class="status-badge"
                      >
                        <i :class="form.isActive ? 'fas fa-check-circle' : 'fas fa-pause-circle'" class="me-1"></i>
                        {{ form.isActive ? 'Campaign will be active' : 'Campaign will be inactive' }}
                      </span>
                    </div>
                    
                    <!-- Helper Text -->
                    <div class="form-text">
                      {{ form.isActive 
                        ? 'This campaign will be activated immediately after creation' 
                        : 'This campaign will be created as inactive and can be activated later' 
                      }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Product Selection - Simplified -->
              <div class="col-12">
                <label class="form-label fw-semibold">
                  Select Products (Optional)
                </label>
                <div class="products-selection">
                  <div class="search-products mb-2">
                    <input
                      v-model="productSearch"
                      type="text"
                      class="form-control form-control-sm"
                      placeholder="Search products..."
                    >
                  </div>
                  
                  <div class="products-list" style="max-height: 200px; overflow-y: auto;">
                    <div v-if="isLoadingProducts" class="text-center py-2">
                      <div class="spinner-border spinner-border-sm" role="status">
                        <span class="visually-hidden">Loading...</span>
                      </div>
                    </div>
                    
                    <div v-else-if="filteredProducts.length === 0" class="text-muted text-center py-2">
                      No products found
                    </div>
                    
                    <div v-else>
                      <div 
                        v-for="product in filteredProducts" 
                        :key="product.id"
                        class="product-item"
                        :class="{ 'selected': form.productIds.includes(product.id) }"
                        @click="toggleProductSelection(product.id)"
                      >
                        <div class="d-flex align-items-center">
                          <div class="form-check me-3">
                            <input
                              v-model="form.productIds"
                              :value="product.id"
                              type="checkbox"
                              class="form-check-input"
                              @click.stop
                            >
                          </div>
                          
                          <div class="product-image me-3">
                            <img 
                              :src="getProductImageUrl(product)"
                              :alt="product.title"
                              @error="handleImageError($event)"
                            >
                          </div>
                          
                          <div class="flex-grow-1">
                            <h6 class="mb-1 product-title">{{ product.title }}</h6>
                            <small class="text-muted">{{ product.category?.name || 'No Category' }}</small>
                            <div class="mt-1">
                              <span class="badge bg-light text-dark me-1">
                                {{ formatPrice(product.price) }}
                              </span>
                              <span class="badge bg-light text-dark">
                                {{ product.points || 0 }} pts
                              </span>
                            </div>
                          </div>
                          
                          <!-- Selection Indicator -->
                          <div v-if="form.productIds.includes(product.id)" class="selection-indicator">
                            <div class="selected-badge">
                              <i class="fas fa-check text-white"></i>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div v-if="form.productIds.length > 0" class="selected-products mt-3">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                      <small class="text-muted fw-semibold">
                        Selected Products ({{ form.productIds.length }})
                      </small>
                      <button 
                        type="button"
                        @click="clearAllSelection"
                        class="btn btn-sm btn-outline-danger"
                      >
                        Clear All
                      </button>
                    </div>
                    
                    <div class="selected-items">
                      <div 
                        v-for="productId in form.productIds" 
                        :key="`selected-${productId}`"
                        class="selected-item"
                      >
                        <span class="selected-item-name">
                          {{ getProductNameById(productId) }}
                        </span>
                        <button 
                          type="button"
                          @click="removeProductSelection(productId)"
                          class="btn btn-sm btn-outline-secondary ms-2"
                        >
                          <i class="fas fa-times"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
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
            class="btn btn-primary"
            :disabled="isSubmitting || isUploadingImage"
          >
            <i v-if="isSubmitting" class="fas fa-spinner fa-spin me-2"></i>
            <i v-else :class="isEdit ? 'fas fa-save' : 'fas fa-plus'" class="me-2"></i>
            {{ isEdit ? 'Update Campaign' : 'Create Campaign' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CampaignModal',
  
  props: {
    show: {
      type: Boolean,
      default: false
    },
    campaign: {
      type: Object,
      default: null
    },
    isEdit: {
      type: Boolean,
      default: false
    }
  },

  emits: ['close', 'save'],

  data() {
    return {
      form: {
        name: '',
        slug: '',
        description: '',
        startDate: '',
        endDate: '',
        productIds: [],
        isActive: true,
        image: '',
        imageUrl: ''
      },
      errors: {},
      isSubmitting: false,
      isUploadingImage: false,
      availableProducts: [],
      isLoadingProducts: false,
      productSearch: '',
      imagePreview: '',
      currentImagePreview: ''
    }
  },

  computed: {
    filteredProducts() {
      if (!this.productSearch.trim()) {
        return this.availableProducts.slice(0, 20) // Limit to 20 items for performance
      }
      
      const query = this.productSearch.toLowerCase()
      return this.availableProducts.filter(product =>
        product.title.toLowerCase().includes(query)
      ).slice(0, 20)
    }
  },

  watch: {
    show: {
      handler(newVal) {
        if (newVal) {
          this.initializeForm()
          this.loadProducts()
          document.body.style.overflow = 'hidden'
        } else {
          document.body.style.overflow = 'auto'
          this.resetForm()
        }
      },
      immediate: true
    },

    campaign: {
      handler() {
        if (this.show) {
          this.initializeForm()
        }
      },
      immediate: true
    },

    'form.imageUrl': {
      handler(newUrl) {
        if (newUrl && newUrl.trim()) {
          this.imagePreview = newUrl.trim()
          this.form.image = '' // Clear uploaded file when URL is entered
        } else {
          if (!this.form.image) {
            this.imagePreview = ''
          }
        }
      }
    }
  },

  beforeUnmount() {
    document.body.style.overflow = 'auto'
  },

  methods: {
    initializeForm() {
      if (this.isEdit && this.campaign) {
        // Format dates for datetime-local input
        const startDate = this.campaign.startDate ? 
          new Date(this.campaign.startDate).toISOString().slice(0, 16) : ''
        const endDate = this.campaign.endDate ? 
          new Date(this.campaign.endDate).toISOString().slice(0, 16) : ''

        this.form = {
          name: this.campaign.name || '',
          slug: this.campaign.slug || '',
          description: this.campaign.description || '',
          startDate: startDate,
          endDate: endDate,
          productIds: this.campaign.productIds || [],
          isActive: this.campaign.isActive !== undefined ? this.campaign.isActive : true,
          image: '',
          imageUrl: ''
        }

        // Set current image preview if exists
        if (this.campaign.image || this.campaign.imageUrl) {
          this.currentImagePreview = this.getCampaignImageUrl(this.campaign)
        }
      } else {
        // Set default start and end dates
        const now = new Date()
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

        this.form = {
          name: '',
          slug: '',
          description: '',
          startDate: tomorrow.toISOString().slice(0, 16),
          endDate: nextWeek.toISOString().slice(0, 16),
          productIds: [],
          isActive: true,
          image: '',
          imageUrl: ''
        }
        this.currentImagePreview = ''
      }
      
      this.errors = {}
      this.productSearch = ''
      this.imagePreview = ''
    },

    resetForm() {
      this.form = {
        name: '',
        slug: '',
        description: '',
        startDate: '',
        endDate: '',
        productIds: [],
        isActive: true,
        image: '',
        imageUrl: ''
      }
      this.errors = {}
      this.productSearch = ''
      this.imagePreview = ''
      this.currentImagePreview = ''
      this.isUploadingImage = false
    },

    async loadProducts() {
      this.isLoadingProducts = true
      try {
        // Simple fetch to get products
        const response = await fetch(`${process.env.VUE_APP_API_URL || 'https://apihustl.sijago.ai'}/api/v1/products`, {
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
      } finally {
        this.isLoadingProducts = false
      }
    },

    generateSlug() {
      if (!this.isEdit) {
        // Auto-generate slug from name
        this.form.slug = this.form.name
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
          .replace(/\s+/g, '-') // Replace spaces with hyphens
          .replace(/-+/g, '-') // Replace multiple hyphens with single
          .trim('-') // Remove leading/trailing hyphens
      }
    },

    // Image handling methods
    async handleFileUpload(event) {
      const file = event.target.files[0]
      if (!file) return

      // Validate file
      if (!this.validateImageFile(file)) {
        this.$refs.fileInput.value = '' // Clear input
        return
      }

      this.isUploadingImage = true
      try {
        // Create preview
        const reader = new FileReader()
        reader.onload = (e) => {
          this.imagePreview = e.target.result
        }
        reader.readAsDataURL(file)

        // Here you would typically upload to your server
        // For now, we'll just use the filename
        this.form.image = file.name
        this.form.imageUrl = '' // Clear URL when file is uploaded
        
        // Simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        console.log('Image uploaded:', file.name)
      } catch (error) {
        console.error('Failed to upload image:', error)
        this.clearImagePreview()
      } finally {
        this.isUploadingImage = false
      }
    },

    validateImageFile(file) {
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid image file (JPG, PNG, GIF)')
        return false
      }

      // Check file size (5MB max)
      const maxSize = 5 * 1024 * 1024 // 5MB in bytes
      if (file.size > maxSize) {
        alert('Image size must be less than 5MB')
        return false
      }

      return true
    },

    validateImageUrl() {
      if (!this.form.imageUrl) return

      const img = new Image()
      img.onload = () => {
        console.log('Image URL is valid')
      }
      img.onerror = () => {
        alert('Please enter a valid image URL')
        this.form.imageUrl = ''
        this.imagePreview = ''
      }
      img.src = this.form.imageUrl
    },

    removeCurrentImage() {
      this.currentImagePreview = ''
      // If editing, you might want to mark for deletion
    },

    clearImagePreview() {
      this.imagePreview = ''
      this.form.image = ''
      this.form.imageUrl = ''
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = ''
      }
    },

    handlePreviewLoad() {
      console.log('Preview image loaded successfully')
    },

    handlePreviewError() {
      console.error('Failed to load preview image')
      this.imagePreview = ''
    },

    validateForm() {
      this.errors = {}

      if (!this.form.name.trim()) {
        this.errors.name = 'Campaign name is required'
      }

      if (!this.form.slug.trim()) {
        this.errors.slug = 'Campaign slug is required'
      } else if (!/^[a-z0-9-]+$/.test(this.form.slug)) {
        this.errors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens'
      }

      if (!this.form.description.trim()) {
        this.errors.description = 'Campaign description is required'
      }

      if (!this.form.startDate) {
        this.errors.startDate = 'Start date is required'
      }

      if (!this.form.endDate) {
        this.errors.endDate = 'End date is required'
      }

      if (this.form.startDate && this.form.endDate) {
        const start = new Date(this.form.startDate)
        const end = new Date(this.form.endDate)
        
        if (start >= end) {
          this.errors.endDate = 'End date must be after start date'
        }
      }

      return Object.keys(this.errors).length === 0
    },

    async handleSubmit() {
      if (!this.validateForm()) {
        return
      }

      this.isSubmitting = true

      try {
        // Prepare form data
        const formData = {
          name: this.form.name.trim(),
          slug: this.form.slug.trim(),
          description: this.form.description.trim(),
          startDate: new Date(this.form.startDate).toISOString(),
          endDate: new Date(this.form.endDate).toISOString(),
          isActive: this.form.isActive,
          productIds: this.form.productIds || []
        }

        // Add image data
        if (this.form.image) {
          formData.image = this.form.image
        } else if (this.form.imageUrl) {
          formData.image = this.form.imageUrl
        }

        console.log('📤 Submitting campaign data:', formData)

        this.$emit('save', formData)
      } catch (error) {
        console.error('Form submission error:', error)
      } finally {
        this.isSubmitting = false
      }
    },

    // Product selection methods
    toggleProductSelection(productId) {
      const index = this.form.productIds.indexOf(productId)
      if (index > -1) {
        this.form.productIds.splice(index, 1)
      } else {
        this.form.productIds.push(productId)
      }
    },

    removeProductSelection(productId) {
      const index = this.form.productIds.indexOf(productId)
      if (index > -1) {
        this.form.productIds.splice(index, 1)
      }
    },

    clearAllSelection() {
      this.form.productIds = []
    },

    getProductNameById(productId) {
      const product = this.availableProducts.find(p => p.id === productId)
      return product ? product.title : `Product #${productId}`
    },

    // Image URL helpers
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
      if (!product) return this.getPlaceholderImage()
      
      if (product.imageUrl) {
        return product.imageUrl
      }
      
      if (product.image) {
        if (product.image.startsWith('http')) {
          return product.image
        } else {
          return `${process.env.VUE_APP_API_URL || 'https://apihustl.sijago.ai'}/uploads/products/${product.image}`
        }
      }
      
      return this.getPlaceholderImage()
    },

    getPlaceholderImage() {
      return 'https://cdn.create.web.com/images/industries/common/images/placeholder-product-image-sq.jpg'
    },

    handleImageError(event) {
      event.target.src = this.getPlaceholderImage()
    },

    formatPrice(value) {
      if (!value && value !== 0) return 'Rp 0'
      return `Rp ${parseFloat(value).toLocaleString('id-ID')}`
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

.form-label {
  color: #495057;
  margin-bottom: 0.5rem;
}

.form-control,
.form-select {
  border-radius: 8px;
  border: 1px solid #dee2e6;
  padding: 0.75rem 1rem;
  transition: all 0.3s ease;
}

.form-control:focus,
.form-select:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.form-control.is-invalid,
.form-select.is-invalid {
  border-color: #dc3545;
}

.invalid-feedback {
  display: block;
  font-size: 0.875rem;
  color: #dc3545;
  margin-top: 0.25rem;
}

/* Image Upload Styles */
.image-upload-options {
  border: 2px dashed #dee2e6;
  border-radius: 10px;
  padding: 1.5rem;
  background-color: #f8f9fa;
  transition: all 0.3s ease;
}

.image-upload-options:hover {
  border-color: #007bff;
  background-color: #e3f2fd;
}

.upload-option {
  padding: 1rem;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background-color: white;
}

.current-image-preview,
.image-preview {
  text-align: center;
}

.image-preview-container {
  position: relative;
  display: inline-block;
}

.img-thumbnail {
  max-width: 200px;
  max-height: 150px;
  object-fit: cover;
}

.remove-image-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-progress {
  background-color: #e3f2fd;
  border: 1px solid #007bff;
  border-radius: 6px;
  padding: 0.75rem;
}

/* Campaign Status Toggle Styles */
.campaign-status-section {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  padding: 1.5rem;
}

.status-toggle-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-switch-lg .form-check-input {
  width: 3rem;
  height: 1.5rem;
  border-radius: 3rem;
  background-color: #6c757d;
  border: none;
  transition: all 0.3s ease;
}

.form-switch-lg .form-check-input:checked {
  background-color: #28a745;
  border-color: #28a745;
}

.form-switch-lg .form-check-input:focus {
  box-shadow: 0 0 0 0.25rem rgba(40, 167, 69, 0.25);
}

.form-switch-lg .form-check-label {
  margin-left: 0.5rem;
  font-size: 1.1rem;
  cursor: pointer;
}

.status-indicator {
  display: flex;
  align-items: center;
}

.status-badge {
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  transition: all 0.3s ease;
}

/* Products Selection */
.products-selection {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1rem;
  background-color: #f8f9fa;
}

.products-list {
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 0.5rem;
  background-color: white;
}

.product-item {
  padding: 0.75rem;
  border: 2px solid transparent;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
}

.product-item:last-child {
  margin-bottom: 0;
}

.product-item:hover {
  background-color: #f8f9fa;
  border-color: #007bff;
}

.product-item.selected {
  background-color: #e3f2fd;
  border-color: #007bff;
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.15);
}

.product-image {
  width: 40px;
  height: 40px;
  overflow: hidden;
  border-radius: 6px;
  border: 1px solid #dee2e6;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-title {
  font-size: 0.9rem;
  margin-bottom: 0;
  font-weight: 600;
  color: #495057;
}

.selection-indicator {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
}

.selected-badge {
  width: 24px;
  height: 24px;
  background-color: #007bff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  box-shadow: 0 2px 4px rgba(0, 123, 255, 0.3);
}

.selected-products {
  background-color: #e3f2fd;
  border: 1px solid #007bff;
  border-radius: 6px;
  padding: 0.75rem;
}

.selected-items {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.selected-item {
  display: flex;
  align-items: center;
  background-color: white;
  border: 1px solid #007bff;
  border-radius: 6px;
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

.selected-item-name {
  color: #007bff;
  font-weight: 500;
}

.form-check-input {
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 0.25rem;
  transition: all 0.3s ease;
}

.form-check-input:checked {
  background-color: #007bff;
  border-color: #007bff;
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

.btn-primary:hover:not(:disabled) {
  background-color: #0056b3;
  border-color: #0056b3;
  transform: translateY(-1px);
}

.btn-primary:disabled {
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
  
  .form-control,
  .form-select {
    padding: 0.5rem 0.75rem;
  }

  .image-upload-options {
    padding: 1rem;
  }

  .campaign-status-section {
    padding: 1rem;
  }

  .status-toggle-container {
    gap: 0.75rem;
  }
}

@media (max-width: 576px) {
  .modal-dialog {
    margin: 0.5rem;
    max-width: calc(100% - 1rem);
  }
  
  .modal-body {
    max-height: 70vh;
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

  .img-thumbnail {
    max-width: 150px;
    max-height: 100px;
  }

  .form-switch-lg .form-check-input {
    width: 2.5rem;
    height: 1.25rem;
  }
}
</style>