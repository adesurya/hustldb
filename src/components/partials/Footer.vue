<!-- /src/components/partials/Footer.vue -->
<template>
  <footer class="footer bg-white border-top">
    <div class="container-fluid px-4">
      <div class="row align-items-center py-3">
        <!-- Copyright -->
        <div class="col-md-6 col-12 text-center text-md-start">
          <span class="text-muted small">
            © {{ currentYear }} 
            <strong class="text-primary">Hazel</strong>. 
            All rights reserved.
          </span>
        </div>

        <!-- Links -->
        <div class="col-md-6 col-12 text-center text-md-end mt-2 mt-md-0">
          <div class="footer-links">
            <a href="#" class="text-muted text-decoration-none small me-3">
              Privacy Policy
            </a>
            <a href="#" class="text-muted text-decoration-none small me-3">
              Terms of Service
            </a>
            <a href="#" class="text-muted text-decoration-none small me-3">
              Support
            </a>
            <span class="text-muted small">
              Version {{ appVersion }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer',
  
  computed: {
    currentYear() {
      return new Date().getFullYear()
    },
    
    appVersion() {
      return process.env.VUE_APP_VERSION || '1.0.0'
    }
  }
}
</script>

<style scoped>
.footer {
  margin-top: auto;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.05);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.footer-links a {
  transition: all 0.3s ease;
}

.footer-links a:hover {
  color: #007bff !important;
  transform: translateY(-1px);
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .footer-links {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .footer-links a {
    margin-right: 0 !important;
  }
}

@media (max-width: 576px) {
  .footer .row {
    text-align: center;
  }
  
  .footer .col-md-6 {
    text-align: center !important;
  }
  
  .footer-links {
    gap: 0.25rem;
  }
}
</style>