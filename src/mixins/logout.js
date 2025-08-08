import { mapActions } from 'vuex'
import { useToast } from 'vue-toastification'

export const logoutMixin = {
  setup() {
    const toast = useToast()
    return { toast }
  },

  data() {
    return {
      isLoggingOut: false
    }
  },

  methods: {
    ...mapActions('auth', ['logout']),

    async handleLogout() {
      if (this.isLoggingOut) return // Prevent multiple logout attempts

      try {
        this.isLoggingOut = true
        
        // Show loading toast
        const loadingToast = this.toast.info('Logging out...', {
          timeout: false,
          closeOnClick: false,
          hideProgressBar: true
        })

        const result = await this.logout()
        
        // Clear loading toast
        this.toast.dismiss(loadingToast)

        // Show success message
        if (result && result.success) {
          this.toast.success(result.message || 'Logged out successfully')
        } else {
          this.toast.success('Logged out successfully')
        }

        // Navigate to login
        await this.$router.push('/login')
        
      } catch (error) {
        console.error('Logout error:', error)
        
        // Show error message
        this.toast.error('Logout failed. Please try again.')
        
        // Force clear auth data locally if logout fails
        this.logout().catch(() => {})
        
      } finally {
        this.isLoggingOut = false
      }
    }
  }
}

export default logoutMixin