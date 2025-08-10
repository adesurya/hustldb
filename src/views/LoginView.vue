<template>
  <div class="login-container d-flex min-vh-100">
    <div class="row w-100 m-0">
      <!-- Left side - Login Form -->
      <div class="col-md-6 d-flex align-items-center justify-content-center p-4">
        <div class="login-form-container">
          <div class="text-center mb-4">
            <div class="hazel-brand">
              <!-- Logo Image -->
              <div class="brand-logo">
                <img src="/images/logo.png" alt="Hazel Logo" class="logo-image" />
              </div>
              
              <!-- Brand Text Image -->
              <div class="brand-text">
                <img src="/images/LogoText.png" alt="Hazel Text" class="text-image" />
              </div>
              
              <!-- Subtitle -->
              <p class="brand-subtitle text-muted">Share Link & Rewards</p>
            </div>
          </div>

          <div class="card shadow-sm border-0" style="max-width: 400px;">
            <div class="card-body p-4">
              <h4 class="card-title mb-3">Log in to your account.</h4>
              <p class="text-muted mb-4">Enter your email address and password to log in.</p>

              <form @submit.prevent="handleSubmit">
                <div class="mb-3">
                  <div class="input-group">
                    <span class="input-group-text bg-light border-end-0">
                      <i class="fas fa-envelope text-muted"></i>
                    </span>
                    <input
                      type="email"
                      class="form-control border-start-0"
                      placeholder="Email address"
                      v-model="form.email"
                      :class="{ 'is-invalid': errors.email }"
                      required
                    >
                  </div>
                  <div v-if="errors.email" class="invalid-feedback d-block">
                    {{ errors.email }}
                  </div>
                </div>

                <div class="mb-3">
                  <div class="input-group">
                    <span class="input-group-text bg-light border-end-0">
                      <i class="fas fa-lock text-muted"></i>
                    </span>
                    <input
                      :type="showPassword ? 'text' : 'password'"
                      class="form-control border-start-0 border-end-0"
                      placeholder="Password"
                      v-model="form.password"
                      :class="{ 'is-invalid': errors.password }"
                      required
                    >
                    <button
                      type="button"
                      class="btn btn-outline-secondary border-start-0"
                      @click="togglePassword"
                    >
                      <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                    </button>
                  </div>
                  <div v-if="errors.password" class="invalid-feedback d-block">
                    {{ errors.password }}
                  </div>
                </div>

                <div class="text-end mb-3">
                  <a href="#" class="text-primary text-decoration-none small">Forgot password?</a>
                </div>

                <button
                  type="submit"
                  class="btn btn-primary w-100 py-2 mb-2"
                  :disabled="isLoading"
                >
                  <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                  {{ isLoading ? 'Logging in...' : 'Login' }}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- Right side - Mascot -->
      <div class="col-md-6 bg-light d-flex align-items-center justify-content-center p-4">
        <div class="text-center">
          <div class="hazel-mascot">
            <img src="/images/logo.png" alt="Hazel Mascot" class="mascot-image" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { useToast } from 'vue-toastification'

export default {
  name: 'LoginView',
  
  setup() {
    const toast = useToast()
    return { toast }
  },

  data() {
    return {
      form: {
        email: 'admin@example.com', // Pre-fill dengan credentials yang valid
        password: 'Admin@123'
      },
      errors: {},
      showPassword: false
    }
  },

  computed: {
    ...mapGetters('auth', ['isLoading'])
  },

  methods: {
    ...mapActions('auth', ['login']),

    togglePassword() {
      this.showPassword = !this.showPassword
    },

    validateForm() {
      this.errors = {}
      
      if (!this.form.email) {
        this.errors.email = 'Email is required'
      } else if (!/\S+@\S+\.\S+/.test(this.form.email)) {
        this.errors.email = 'Email is invalid'
      }
      
      if (!this.form.password) {
        this.errors.password = 'Password is required'
      } else if (this.form.password.length < 6) {
        this.errors.password = 'Password must be at least 6 characters'
      }
      
      return Object.keys(this.errors).length === 0
    },

    async handleSubmit() {
      if (!this.validateForm()) {
        return
      }

      console.log('Login attempt with:', {
        email: this.form.email,
        password: '***' // Hide password in logs
      })

      try {
        const result = await this.login({
          email: this.form.email,
          password: this.form.password
        })

        console.log('Login result:', result)

        if (result.success) {
          this.toast.success('Login successful!')
          this.$router.push('/dashboard')
        } else {
          this.toast.error(result.message || 'Login failed. Please check your credentials.')
          console.error('Login failed:', result.message)
        }
      } catch (error) {
        console.error('Login error:', error)
        this.toast.error('An unexpected error occurred. Please try again.')
      }
    }
  }
}
</script>

<style scoped>
<style scoped>
.login-container {
  background: #f0f2f5;
}

.login-form-container {
  width: 100%;
  max-width: 450px;
}

/* Brand Styles */
.hazel-brand {
  margin-bottom: 2.5rem;
}

.brand-logo {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1rem;
}

.logo-image {
  width: 70px;
  height: 70px;
  object-fit: contain;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
}

.brand-text {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 0.5rem;
}

.text-image {
  max-width: 160px;
  height: auto;
  object-fit: contain;
}

.brand-subtitle {
  font-size: 0.875rem;
  color: #6c757d !important;
  font-weight: 400;
  margin: 0;
}

/* Card Styles */
.card {
  border-radius: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: none;
}

/* Input Styles */
.input-group-text {
  border: 1px solid #e3e6f0;
  background-color: #f8f9fc;
}

.form-control {
  border: 1px solid #e3e6f0;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
}

.form-control:focus {
  border-color: #00d4ff;
  box-shadow: 0 0 0 0.2rem rgba(0, 212, 255, 0.25);
}

/* Button Styles */
.btn-primary {
  background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #0099cc 0%, #007aa3 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 212, 255, 0.3);
}

.btn-primary:disabled {
  background: #6c757d;
  transform: none;
  box-shadow: none;
}

/* Text link styles */
.text-primary {
  color: #00d4ff !important;
}

.text-primary:hover {
  color: #0099cc !important;
}

/* Mascot Styles */
.hazel-mascot {
  max-width: 400px;
  margin: 0 auto;
}

.mascot-image {
  max-width: 100%;
  height: auto;
  max-height: 400px;
  object-fit: contain;
  filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.1));
}

/* Error styles */
.is-invalid {
  border-color: #e74a3b;
}

.invalid-feedback {
  color: #e74a3b;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

/* Spinner styles */
.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

/* Right side background */
.col-md-6.bg-light {
  background: linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%) !important;
}

/* Responsive */
@media (max-width: 768px) {
  .login-container .row {
    flex-direction: column-reverse;
  }
  
  .hazel-mascot {
    max-width: 250px;
  }
  
  .mascot-image {
    max-height: 250px;
  }
  
  .card {
    margin: 1rem;
  }
  
  .logo-image {
    width: 55px;
    height: 55px;
  }
  
  .text-image {
    max-width: 130px;
  }
  
  .hazel-brand {
    margin-bottom: 2rem;
  }
}

@media (max-width: 576px) {
  .login-form-container {
    max-width: 100%;
  }
  
  .card-body {
    padding: 1.5rem !important;
  }
  
  .hazel-mascot {
    max-width: 200px;
  }
  
  .mascot-image {
    max-height: 200px;
  }
  
  .logo-image {
    width: 45px;
    height: 45px;
  }
  
  .text-image {
    max-width: 110px;
  }
  
  .brand-subtitle {
    font-size: 0.8rem;
  }
  
  .hazel-brand {
    margin-bottom: 1.5rem;
  }
}
</style>
