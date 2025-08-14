<!-- /src/components/modals/CategoryModal.vue - Category Add/Edit Modal -->
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
            {{ isEdit ? 'Edit Category' : 'Add New Category' }}
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
              <!-- Category Name -->
              <div class="col-12">
                <label class="form-label fw-semibold">
                  Category Name <span class="text-danger">*</span>
                </label>
                <input
                  v-model="form.name"
                  @input="generateSlugFromName"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors.name }"
                  placeholder="Enter category name"
                  required
                >
                <div v-if="errors.name" class="invalid-feedback">
                  {{ errors.name }}
                </div>
              </div>

              <!-- Category Slug -->
              <div class="col-12">
                <label class="form-label fw-semibold">
                  Category Slug <span class="text-danger">*</span>
                </label>
                <input
                  v-model="form.slug"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors.slug }"
                  placeholder="category-slug"
                  required
                >
                <div class="form-text">
                  URL-friendly version of the name. Only lowercase letters, numbers, and hyphens.
                </div>
                <div v-if="errors.slug" class="invalid-feedback">
                  {{ errors.slug }}
                </div>
              </div>

              <!-- Description -->
              <div class="col-12">
                <label class="form-label fw-semibold">
                  Description
                </label>
                <textarea
                  v-model="form.description"
                  class="form-control"
                  :class="{ 'is-invalid': errors.description }"
                  rows="3"
                  placeholder="Enter category description"
                  maxlength="500"
                ></textarea>
                <div class="form-text">
                  {{ form.description ? form.description.length : 0 }}/500 characters
                </div>
                <div v-if="errors.description" class="invalid-feedback">
                  {{ errors.description }}
                </div>
              </div>

              <!-- Sort Order -->
              <div class="col-md-6">
                <label class="form-label fw-semibold">
                  Sort Order
                </label>
                <input
                  v-model.number="form.sortOrder"
                  type="number"
                  class="form-control"
                  :class="{ 'is-invalid': errors.sortOrder }"
                  placeholder="0"
                  min="0"
                >
                <div class="form-text">
                  Lower numbers appear first
                </div>
                <div v-if="errors.sortOrder" class="invalid-feedback">
                  {{ errors.sortOrder }}
                </div>
              </div>

              <!-- Status Toggle -->
              <div class="col-md-6">
                <label class="form-label fw-semibold d-block">
                  Status
                </label>
                <div class="mt-2">
                  <div class="form-check form-switch">
                    <input
                      v-model="form.isActive"
                      class="form-check-input"
                      type="checkbox"
                      id="isActive"
                    >
                    <label class="form-check-label fw-semibold" for="isActive">
                      {{ form.isActive ? 'Active' : 'Inactive' }}
                    </label>
                  </div>
                  <div class="form-text">
                    {{ form.isActive ? 'Category is visible and can be used' : 'Category is hidden and cannot be used' }}
                  </div>
                </div>
              </div>

              <!-- Preview Section -->
              <div v-if="form.name" class="col-12">
                <div class="preview-section">
                  <h6 class="fw-semibold text-muted mb-2">Preview</h6>
                  <div class="preview-card p-3 bg-light rounded">
                    <div class="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 class="mb-1 fw-bold">{{ form.name }}</h6>
                        <small class="text-muted">Order: {{ form.sortOrder || 0 }}</small>
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
            :disabled="isSubmitting || !isFormValid"
          >
            <i v-if="isSubmitting" class="fas fa-spinner fa-spin me-2"></i>
            <i v-else :class="isEdit ? 'fas fa-save' : 'fas fa-plus'" class="me-2"></i>
            {{ isEdit ? 'Update Category' : 'Create Category' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CategoryModal',
  
  props: {
    show: {
      type: Boolean,
      default: false
    },
    category: {
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
        sortOrder: 0,
        isActive: true
      },
      originalSlug: '',
      errors: {},
      isSubmitting: false
    }
  },

  computed: {
    isFormValid() {
      return this.form.name.trim() && 
             this.form.slug.trim() && 
             this.isValidSlug(this.form.slug) &&
             Object.keys(this.errors).length === 0
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

    category: {
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
      if (this.isEdit && this.category) {
        this.form = {
          name: this.category.name || '',
          slug: this.category.slug || '',
          description: this.category.description || '',
          sortOrder: this.category.sortOrder || 0,
          isActive: this.category.isActive !== undefined ? this.category.isActive : true
        }
        this.originalSlug = this.category.slug || ''
      } else {
        this.form = {
          name: '',
          slug: '',
          description: '',
          sortOrder: 0,
          isActive: true
        }
        this.originalSlug = ''
      }
      
      this.errors = {}
    },

    generateSlugFromName() {
      // Only auto-generate slug for new categories or if slug hasn't been manually changed
      if (!this.isEdit || this.form.slug === this.originalSlug || !this.form.slug) {
        this.form.slug = this.generateSlug(this.form.name)
      }
      this.validateSlug()
    },

    generateSlug(name) {
      if (!name) return ''
      
      return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
        .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    },

    isValidSlug(slug) {
      const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
      return slugPattern.test(slug)
    },

    validateSlug() {
      if (!this.form.slug.trim()) {
        this.errors.slug = 'Slug is required'
      } else if (!this.isValidSlug(this.form.slug)) {
        this.errors.slug = 'Slug must contain only lowercase letters, numbers, and hyphens'
      } else {
        delete this.errors.slug
      }
    },

    validateForm() {
      this.errors = {}

      // Validate name
      if (!this.form.name.trim()) {
        this.errors.name = 'Category name is required'
      } else if (this.form.name.trim().length < 2) {
        this.errors.name = 'Category name must be at least 2 characters'
      } else if (this.form.name.trim().length > 100) {
        this.errors.name = 'Category name must not exceed 100 characters'
      }

      // Validate slug
      this.validateSlug()

      // Validate description
      if (this.form.description && this.form.description.length > 500) {
        this.errors.description = 'Description must not exceed 500 characters'
      }

      // Validate sort order
      if (this.form.sortOrder !== undefined && this.form.sortOrder !== null) {
        if (isNaN(this.form.sortOrder) || this.form.sortOrder < 0) {
          this.errors.sortOrder = 'Sort order must be a positive number'
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
          sortOrder: parseInt(this.form.sortOrder) || 0,
          isActive: this.form.isActive
        }

        // Add original slug for edit mode
        if (this.isEdit) {
          formData.originalSlug = this.originalSlug
        }

        console.log('📤 Submitting category data:', formData)

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

.preview-section {
  border-top: 1px solid #dee2e6;
  padding-top: 1rem;
  margin-top: 1rem;
}

.preview-card {
  border: 1px solid #dee2e6;
}

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