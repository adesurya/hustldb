<template>
  <footer class="footer bg-white border-top py-3 mt-auto" style="margin-left: 250px;">
    <div class="container-fluid">
      <div class="row align-items-center">
        <div class="col-md-6">
          <div class="d-flex align-items-center">
            <img src="/images/hazel-logo.png" alt="Hazel Logo" class="logo-small me-2" />
            <span class="text-muted small">
              © {{ currentYear }} Hazel Dashboard. Made with ❤️ for affiliate marketing.
            </span>
          </div>
        </div>
        
        <div class="col-md-6">
          <div class="d-flex align-items-center justify-content-md-end justify-content-start mt-2 mt-md-0">
            <div class="footer-links d-flex align-items-center">
              <a href="#" class="text-muted text-decoration-none me-3 small">
                <i class="fas fa-question-circle me-1"></i>
                Help & Support
              </a>
              <a href="#" class="text-muted text-decoration-none me-3 small">
                <i class="fas fa-shield-alt me-1"></i>
                Privacy Policy
              </a>
              <a href="#" class="text-muted text-decoration-none me-3 small">
                <i class="fas fa-file-contract me-1"></i>
                Terms of Service
              </a>
              
              <!-- Status indicator -->
              <div class="status-indicator d-flex align-items-center">
                <div class="status-dot bg-success me-2"></div>
                <span class="text-muted small">All systems operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Additional info row -->
      <div class="row mt-2 pt-2 border-top">
        <div class="col-12">
          <div class="d-flex flex-wrap align-items-center justify-content-between">
            <div class="footer-info d-flex flex-wrap align-items-center">
              <span class="text-muted me-3 small">
                <i class="fas fa-code me-1"></i>
                Version 1.0.0
              </span>
              <span class="text-muted me-3 small">
                <i class="fas fa-server me-1"></i>
                Server: {{ serverStatus }}
              </span>
              <span class="text-muted me-3 small">
                <i class="fas fa-clock me-1"></i>
                Last updated: {{ lastUpdated }}
              </span>
            </div>
            
            <div class="social-links d-flex align-items-center">
              <a href="#" class="text-muted me-2" title="Documentation">
                <i class="fas fa-book"></i>
              </a>
              <a href="#" class="text-muted me-2" title="GitHub">
                <i class="fab fa-github"></i>
              </a>
              <a href="#" class="text-muted me-2" title="Support">
                <i class="fas fa-headset"></i>
              </a>
              <a href="#" class="text-muted" title="Feedback">
                <i class="fas fa-comment-dots"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer',
  
  data() {
    return {
      serverStatus: 'Online',
      lastUpdated: this.formatDateTime(new Date())
    }
  },
  
  computed: {
    currentYear() {
      return new Date().getFullYear()
    }
  },
  
  mounted() {
    // Update last updated time every minute
    this.updateTimer = setInterval(() => {
      this.lastUpdated = this.formatDateTime(new Date())
    }, 60000)
  },
  
  beforeUnmount() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer)
    }
  },
  
  methods: {
    formatDateTime(date) {
      return date.toLocaleString('en-US', {
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    }
  }
}
</script>

<style scoped>
.footer {
  position: relative;
  z-index: 100;
}

.logo-small {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(40, 167, 69, 0.7);
  }
  
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(40, 167, 69, 0);
  }
  
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(40, 167, 69, 0);
  }
}

.footer-links a:hover {
  color: #007bff !important;
  transition: color 0.3s ease;
}

.social-links a {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.social-links a:hover {
  background-color: #f8f9fa;
  color: #007bff !important;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .footer {
    left: 0;
    margin-left: 0;
  }
  
  .footer-info {
    flex-direction: column;
    align-items: flex-start !important;
  }
  
  .footer-info span {
    margin-bottom: 0.25rem;
  }
  
  .social-links {
    margin-top: 0.5rem;
  }
  
  .footer-links {
    flex-direction: column;
    align-items: flex-start !important;
  }
  
  .footer-links a {
    margin-bottom: 0.25rem;
  }
}
</style>