<!-- /src/components/modals/ProductModal.vue - Updated with file upload support -->
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
            {{ isEdit ? 'Edit Product' : 'Add New Product' }}
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
              <!-- Title -->
              <div class="col-12">
                <label class="form-label fw-semibold">
                  Product Title <span class="text-danger">*</span>
                </label>
                <input
                  v-model="form.title"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors.title }"
                  placeholder="Enter product title"
                  required
                >
                <div v-if="errors.title" class="invalid-feedback">
                  {{ errors.title }}
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
                  placeholder="Enter product description"
                  required
                ></textarea>
                <div v-if="errors.description" class="invalid-feedback">
                  {{ errors.description }}
                </div>
              </div>

              <!-- Category and Price -->
              <div class="col-md-6">
                <label class="form-label fw-semibold">
                  Category <span class="text-danger">*</span>
                </label>
                <select
                  v-model="form.categoryId"
                  class="form-select"
                  :class="{ 'is-invalid': errors.categoryId }"
                  required
                >
                  <option value="">Select category</option>
                  <option 
                    v-for="category in categories" 
                    :key="category.id"
                    :value="category.id"
                  >
                    {{ category.name }}
                  </option>
                </select>
                <div v-if="errors.categoryId" class="invalid-feedback">
                  {{ errors.categoryId }}
                </div>
              </div>

              <div class="col-md-6">
                <label class="form-label fw-semibold">
                  Price <span class="text-danger">*</span>
                </label>
                <div class="input-group">
                  <span class="input-group-text">Rp</span>
                  <input
                    v-model="form.price"
                    type="number"
                    class="form-control"
                    :class="{ 'is-invalid': errors.price }"
                    placeholder="0"
                    min="0"
                    step="0.01"
                    required
                  >
                  <div v-if="errors.price" class="invalid-feedback">
                    {{ errors.price }}
                  </div>
                </div>
              </div>

              <!-- Points and Stock -->
              <div class="col-md-6">
                <label class="form-label fw-semibold">
                  Points <span class="text-danger">*</span>
                </label>
                <input
                  v-model="form.points"
                  type="number"
                  class="form-control"
                  :class="{ 'is-invalid': errors.points }"
                  placeholder="0"
                  min="0"
                  required
                >
                <div v-if="errors.points" class="invalid-feedback">
                  {{ errors.points }}
                </div>
              </div>

              <div class="col-md-6">
                <label class="form-label fw-semibold">
                  Stock Quantity <span class="text-danger">*</span>
                </label>
                <input
                  v-model="form.stockQuantity"
                  type="number"
                  class="form-control"
                  :class="{ 'is-invalid': errors.stockQuantity }"
                  placeholder="0"
                  min="0"
                  required
                >
                <div v-if="errors.stockQuantity" class="invalid-feedback">
                  {{ errors.stockQuantity }}
                </div>
              </div>

              <!-- URL -->
              <div class="col-12">
                <label class="form-label fw-semibold">
                  Product URL
                </label>
                <input
                  v-model="form.url"
                  type="url"
                  class="form-control"
                  :class="{ 'is-invalid': errors.url }"
                  placeholder="https://example.com/product"
                >
                <div v-if="errors.url" class="invalid-feedback">
                  {{ errors.url }}
                </div>
              </div>

              <!-- Image Upload -->
              <div class="col-12">
                <label class="form-label fw-semibold">
                  Product Image
                </label>
                <div class="mb-2">
                  <input
                    ref="imageInput"
                    type="file"
                    class="form-control"
                    :class="{ 'is-invalid': errors.image }"
                    accept="image/*"
                    @change="handleImageUpload"
                  >
                  <div class="form-text">
                    Upload product image (JPG, PNG, GIF). Max size: 5MB
                  </div>
                  <div v-if="errors.image" class="invalid-feedback">
                    {{ errors.image }}
                  </div>
                </div>

                <!-- Image Preview -->
                <div v-if="imagePreview" class="mt-2">
                  <div class="image-preview-container">
                    <img 
                      :src="imagePreview" 
                      alt="Preview"
                      class="img-thumbnail image-preview"
                    >
                    <button
                      type="button"
                      class="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                      @click="removeImage"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                </div>

                <!-- Current Image (for edit mode) -->
                <div v-else-if="isEdit && currentImageUrl" class="mt-2">
                  <div class="current-image-container">
                    <label class="form-label small text-muted">Current Image:</label>
                    <img 
                      :src="currentImageUrl" 
                      alt="Current"
                      class="img-thumbnail current-image"
                      @error="handleCurrentImageError"
                    >
                  </div>
                </div>
              </div>

              <!-- Meta Information -->
              <div class="col-md-6">
                <label class="form-label fw-semibold">
                  Meta Title
                </label>
                <input
                  v-model="form.metaTitle"
                  type="text"
                  class="form-control"
                  placeholder="SEO title"
                >
              </div>

              <div class="col-md-6">
                <label class="form-label fw-semibold">
                  Sort Order
                </label>
                <input
                  v-model="form.sortOrder"
                  type="number"
                  class="form-control"
                  placeholder="0"
                  min="0"
                >
              </div>

              <!-- Meta Description -->
              <div class="col-12">
                <label class="form-label fw-semibold">
                  Meta Description
                </label>
                <textarea
                  v-model="form.metaDescription"
                  class="form-control"
                  rows="2"
                  placeholder="SEO description"
                ></textarea>
              </div>

              <!-- Status Toggles -->
              <div class="col-12">
                <div class="row g-3">
                  <div class="col-md-4">
                    <div class="form-check form-switch">
                      <input
                        v-model="form.isActive"
                        class="form-check-input"
                        type="checkbox"
                        id="isActive"
                      >
                      <label class="form-check-label fw-semibold" for="isActive">
                        Active Product
                      </label>
                    </div>
                  </div>
                  
                  <div class="col-md-4">
                    <div class="form-check form-switch">
                      <input
                        v-model="form.isFeatured"
                        class="form-check-input"
                        type="checkbox"
                        id="isFeatured"
                      >
                      <label class="form-check-label fw-semibold" for="isFeatured">
                        Featured Product
                      </label>
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
            :disabled="isSubmitting"
          >
            <i v-if="isSubmitting" class="fas fa-spinner fa-spin me-2"></i>
            <i v-else :class="isEdit ? 'fas fa-save' : 'fas fa-plus'" class="me-2"></i>
            {{ isEdit ? 'Update Product' : 'Create Product' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProductModal',
  
  props: {
    show: {
      type: Boolean,
      default: false
    },
    product: {
      type: Object,
      default: null
    },
    categories: {
      type: Array,
      default: () => []
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
        title: '',
        description: '',
        categoryId: '',
        price: '',
        points: '',
        stockQuantity: '',
        url: '',
        image: null,
        metaTitle: '',
        metaDescription: '',
        sortOrder: 0,
        isActive: true,
        isFeatured: false
      },
      errors: {},
      isSubmitting: false,
      imagePreview: null,
      currentImageUrl: null
    }
  },

  watch: {
    show: {
      handler(newVal) {
        if (newVal) {
          this.initializeForm()
          document.body.style.overflow = 'hidden'
        } else {
          document.body.style.overflow = 'auto'
        }
      },
      immediate: true
    },

    product: {
      handler() {
        if (this.show) {
          this.initializeForm()
        }
      },
      immediate: true
    }
  },

  beforeUnmount() {
    document.body.style.overflow = 'auto'
  },

  methods: {
    initializeForm() {
      if (this.isEdit && this.product) {
        this.form = {
          title: this.product.title || '',
          description: this.product.description || '',
          categoryId: this.product.categoryId || '',
          price: this.product.price || '',
          points: this.product.points || '',
          stockQuantity: this.product.stockQuantity || '',
          url: this.product.url || '',
          image: null,
          metaTitle: this.product.metaTitle || '',
          metaDescription: this.product.metaDescription || '',
          sortOrder: this.product.sortOrder || 0,
          isActive: this.product.isActive !== undefined ? this.product.isActive : true,
          isFeatured: this.product.isFeatured !== undefined ? this.product.isFeatured : false
        }
        
        // Set current image URL for preview
        this.currentImageUrl = this.product.imageUrl || this.product.image || null
      } else {
        this.form = {
          title: '',
          description: '',
          categoryId: '',
          price: '',
          points: '',
          stockQuantity: '',
          url: '',
          image: null,
          metaTitle: '',
          metaDescription: '',
          sortOrder: 0,
          isActive: true,
          isFeatured: false
        }
        this.currentImageUrl = null
      }
      
      this.errors = {}
      this.imagePreview = null
    },

    handleImageUpload(event) {
      const file = event.target.files[0]
      
      if (!file) {
        this.form.image = null
        this.imagePreview = null
        return
      }

      // Validate file
      if (!this.validateImage(file)) {
        this.$refs.imageInput.value = ''
        return
      }

      this.form.image = file
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        this.imagePreview = e.target.result
      }
      reader.readAsDataURL(file)
      
      // Clear current image when new image is selected
      this.currentImageUrl = null
    },

    validateImage(file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
      const maxSize = 5 * 1024 * 1024 // 5MB

      if (!allowedTypes.includes(file.type)) {
        this.errors.image = 'Please select a valid image file (JPG, PNG, GIF)'
        return false
      }

      if (file.size > maxSize) {
        this.errors.image = 'Image size must be less than 5MB'
        return false
      }

      delete this.errors.image
      return true
    },

    removeImage() {
      this.form.image = null
      this.imagePreview = null
      this.$refs.imageInput.value = ''
      
      // If editing, show current image again
      if (this.isEdit && this.product) {
        this.currentImageUrl = this.product.imageUrl || this.product.image || null
      }
    },

    handleCurrentImageError() {
      this.currentImageUrl = null
    },

    validateForm() {
      this.errors = {}

      if (!this.form.title.trim()) {
        this.errors.title = 'Product title is required'
      }

      if (!this.form.description.trim()) {
        this.errors.description = 'Product description is required'
      }

      if (!this.form.categoryId) {
        this.errors.categoryId = 'Category is required'
      }

      if (!this.form.price || parseFloat(this.form.price) <= 0) {
        this.errors.price = 'Valid price is required'
      }

      if (!this.form.points || parseInt(this.form.points) < 0) {
        this.errors.points = 'Valid points value is required'
      }

      if (!this.form.stockQuantity || parseInt(this.form.stockQuantity) < 0) {
        this.errors.stockQuantity = 'Valid stock quantity is required'
      }

      if (this.form.url && !this.isValidUrl(this.form.url)) {
        this.errors.url = 'Please enter a valid URL'
      }

      return Object.keys(this.errors).length === 0
    },

    isValidUrl(string) {
      try {
        new URL(string)
        return true
      } catch (_) {
        return false
      }
    },

    async handleSubmit() {
      if (!this.validateForm()) {
        return
      }

      this.isSubmitting = true

      try {
        // Prepare form data
        const formData = {
          ...this.form,
          price: parseFloat(this.form.price),
          points: parseInt(this.form.points),
          stockQuantity: parseInt(this.form.stockQuantity),
          sortOrder: parseInt(this.form.sortOrder) || 0,
          categoryId: parseInt(this.form.categoryId)
        }

        // Remove empty optional fields
        if (!formData.url) delete formData.url
        if (!formData.metaTitle) delete formData.metaTitle
        if (!formData.metaDescription) delete formData.metaDescription

        this.$emit('save', formData)
      } catch (error) {
        console.error('Form submission error:', error)
      } finally {
        this.isSubmitting = false
      }
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

.form-control.is-invalid:focus,
.form-select.is-invalid:focus {
  border-color: #dc3545;
  box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
}

.invalid-feedback {
  display: block;
  font-size: 0.875rem;
  color: #dc3545;
  margin-top: 0.25rem;
}

.input-group-text {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px 0 0 8px;
  color: #6c757d;
  font-weight: 500;
}

.form-check-input {
  width: 2.5rem;
  height: 1.25rem;
  border-radius: 1rem;
  background-color: #dee2e6;
  border: none;
  transition: all 0.3s ease;
}

.form-check-input:checked {
  background-color: #007bff;
  border-color: #007bff;
}

.form-check-input:focus {
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.form-check-label {
  color: #495057;
  margin-left: 0.5rem;
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

.img-thumbnail {
  border-radius: 8px;
  border: 1px solid #dee2e6;
  padding: 0.25rem;
}

.image-preview-container {
  position: relative;
  display: inline-block;
}

.image-preview {
  max-height: 120px;
  max-width: 200px;
  object-fit: cover;
}

.current-image-container {
  text-align: center;
}

.current-image {
  max-height: 80px;
  max-width: 150px;
  object-fit: cover;
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
}

@media (max-width: 576px) {
  .modal-dialog {
    margin: 0.5rem;
    max-width: calc(100% - 1rem);
  }
  
  .modal-body {
    max-height: 70vh;
    overflow-y: auto;
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

/* Custom scrollbar for modal body */
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