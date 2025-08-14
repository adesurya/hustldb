<template>
  <div class="dashboard-layout">
    <!-- Sidebar Component -->
    <Sidebar 
      :class="{ 'sidebar-mobile-hidden': !sidebarVisible }" 
      @close="toggleSidebar"
      @logout="handleSidebarLogout"
    />
    
    <!-- Mobile Overlay -->
    <div 
      v-if="sidebarVisible" 
      class="mobile-overlay d-md-none"
      @click="toggleSidebar"
    ></div>
    
    <!-- Main Content Area -->
    <div class="main-content" :class="{ 'sidebar-hidden': !sidebarVisible }">
      <!-- Header Component -->
      <Header 
        @refresh="handleRefresh" 
        @toggle-sidebar="toggleSidebar"
        :isRefreshing="isRefreshing" 
        :sidebarVisible="sidebarVisible"
      />
      
      <!-- Dashboard Content Container -->
      <main class="dashboard-container">
        <!-- Statistics Cards Row -->
        <div class="row g-3 mb-4">
          <!-- Product Statistics Card -->
          <div class="col-xl-3 col-lg-6 col-md-6">
            <div class="stat-card card h-100 border-0">
              <div class="card-body p-3">
                <div class="d-flex align-items-center justify-content-between">
                  <div class="stat-content">
                    <div class="stat-icon bg-primary bg-opacity-10 p-2 rounded-circle mb-2">
                      <i class="fas fa-box text-primary"></i>
                    </div>
                    <h3 class="mb-1 fw-bold text-dark">{{ productStats?.totalProducts || '0' }}</h3>
                    <h6 class="text-muted mb-0 small">Total Products</h6>
                    <small class="text-success">
                      <i class="fas fa-arrow-up me-1"></i>{{ productStats?.activeProducts || '0' }} Active
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Point Statistics Card -->
          <div class="col-xl-3 col-lg-6 col-md-6">
            <div class="stat-card card h-100 border-0">
              <div class="card-body p-3">
                <div class="d-flex align-items-center justify-content-between">
                  <div class="stat-content">
                    <div class="stat-icon bg-success bg-opacity-10 p-2 rounded-circle mb-2">
                      <i class="fas fa-coins text-success"></i>
                    </div>
                    <h3 class="mb-1 fw-bold text-dark">{{ formatNumber(pointStats?.systemOverview?.totalPointsAwarded || '0') }}</h3>
                    <h6 class="text-muted mb-0 small">Points Awarded</h6>
                    <small class="text-info">
                      <i class="fas fa-users me-1"></i>{{ pointStats?.systemOverview?.activeUsers || '0' }} Active Users
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Leaderboard Statistics Card -->
          <div class="col-xl-3 col-lg-6 col-md-6">
            <div class="stat-card card h-100 border-0">
              <div class="card-body p-3">
                <div class="d-flex align-items-center justify-content-between">
                  <div class="stat-content">
                    <div class="stat-icon bg-warning bg-opacity-10 p-2 rounded-circle mb-2">
                      <i class="fas fa-trophy text-warning"></i>
                    </div>
                    <h3 class="mb-1 fw-bold text-dark">{{ leaderboardStats?.overview?.users_with_points || '0' }}</h3>
                    <h6 class="text-muted mb-0 small">Users with Points</h6>
                    <small class="text-success">
                      <i class="fas fa-percentage me-1"></i>{{ leaderboardStats?.overview?.participation_rate || '0' }}% Participation
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Campaign Statistics Card -->
          <div class="col-xl-3 col-lg-6 col-md-6">
            <div class="stat-card card h-100 border-0">
              <div class="card-body p-3">
                <div class="d-flex align-items-center justify-content-between">
                  <div class="stat-content">
                    <div class="stat-icon bg-danger bg-opacity-10 p-2 rounded-circle mb-2">
                      <i class="fas fa-bullhorn text-danger"></i>
                    </div>
                    <h3 class="mb-1 fw-bold text-dark">{{ campaignStats?.totalCampaigns || '0' }}</h3>
                    <h6 class="text-muted mb-0 small">Total Campaigns</h6>
                    <small class="text-success">
                      <i class="fas fa-play me-1"></i>{{ campaignStats?.activeCampaigns || '0' }} Active
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Statistics Overview Row -->
        <div class="row g-3 mb-4">
          <!-- Product Category Overview -->
          <div class="col-xl-4 col-lg-6">
            <div class="card border-0 h-100">
              <div class="card-header bg-white border-0 py-3">
                <h6 class="mb-0 fw-semibold text-dark">Product Categories</h6>
              </div>
              <div class="card-body">
                <div class="category-list">
                  <div 
                    v-for="(category, index) in productCategories" 
                    :key="index"
                    class="category-item d-flex justify-content-between align-items-center mb-3"
                  >
                    <div class="d-flex align-items-center">
                      <div 
                        class="category-color me-3"
                        :style="{ backgroundColor: getCategoryColor(index) }"
                      ></div>
                      <span class="category-name">{{ category.name }}</span>
                    </div>
                    <span class="badge bg-light text-dark">{{ category.productCount }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Point Activities Overview -->
          <div class="col-xl-4 col-lg-6">
            <div class="card border-0 h-100">
              <div class="card-header bg-white border-0 py-3">
                <h6 class="mb-0 fw-semibold text-dark">Point Activities</h6>
              </div>
              <div class="card-body">
                <div class="activity-list">
                  <div 
                    v-for="(activity, index) in pointActivities" 
                    :key="index"
                    class="activity-item mb-3"
                  >
                    <div class="d-flex justify-content-between align-items-center mb-1">
                      <span class="activity-name small text-muted">{{ activity.activity_name }}</span>
                      <span class="activity-points fw-bold text-success">{{ activity.total_points_awarded }}</span>
                    </div>
                    <div class="progress" style="height: 4px;">
                      <div 
                        class="progress-bar bg-success" 
                        :style="{ width: getActivityProgressWidth(activity.total_points_awarded) + '%' }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Share Platform Overview -->
          <div class="col-xl-4 col-lg-12">
            <div class="card border-0 h-100">
              <div class="card-header bg-white border-0 py-3">
                <h6 class="mb-0 fw-semibold text-dark">Share Platforms</h6>
              </div>
              <div class="card-body">
                <div class="platform-list">
                  <div 
                    v-for="(platform, index) in sharePlatforms" 
                    :key="index"
                    class="platform-item d-flex justify-content-between align-items-center mb-3"
                  >
                    <div class="d-flex align-items-center">
                      <i 
                        :class="getPlatformIcon(platform.platform)" 
                        :style="{ color: getPlatformColor(platform.platform) }"
                        class="me-3"
                      ></i>
                      <span class="platform-name text-capitalize">{{ platform.platform }}</span>
                    </div>
                    <span class="badge bg-primary">{{ platform.shareCount }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Row -->
        <div class="row g-3 mb-4">
          <!-- Top Point Users -->
          <div class="col-xl-8 col-lg-12">
            <div class="card border-0">
              <div class="card-header bg-white border-0 py-3">
                <h6 class="mb-0 fw-semibold text-dark">Top Point Users</h6>
              </div>
              <div class="card-body p-0">
                <div class="table-responsive">
                  <table class="table table-hover align-middle mb-0">
                    <thead class="table-light">
                      <tr>
                        <th class="border-0 py-3 ps-4">Rank</th>
                        <th class="border-0 py-3">Username</th>
                        <th class="border-0 py-3 text-center">Email</th>
                        <th class="border-0 py-3 text-end pe-4">Current Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr 
                        v-for="(user, index) in topPointUsers" 
                        :key="index"
                        class="cursor-pointer"
                        @click="viewUserDetails(user)"
                      >
                        <td class="py-3 ps-4">
                          <div class="rank-badge d-flex align-items-center justify-content-center">
                            <span class="fw-bold" :class="getRankClass(index)">{{ index + 1 }}</span>
                          </div>
                        </td>
                        <td class="py-3">
                          <div class="d-flex align-items-center">
                            <div class="user-avatar bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                              <i class="fas fa-user text-primary small"></i>
                            </div>
                            <div>
                              <div class="fw-medium text-dark">{{ user.username }}</div>
                            </div>
                          </div>
                        </td>
                        <td class="py-3 text-center">
                          <span class="text-muted small">{{ user.email }}</span>
                        </td>
                        <td class="py-3 text-end pe-4">
                          <span class="badge bg-success">{{ formatNumber(user.currentPoints) }} pts</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- Leaderboard Stats -->
          <div class="col-xl-4 col-lg-12">
            <div class="card border-0">
              <div class="card-header bg-white border-0 py-3">
                <h6 class="mb-0 fw-semibold text-dark">Leaderboard Overview</h6>
              </div>
              <div class="card-body">
                <div class="leaderboard-stats">
                  <div class="stat-row mb-3">
                    <div class="d-flex justify-content-between align-items-center">
                      <span class="text-muted small">Daily Top Score</span>
                      <span class="fw-bold text-primary">{{ leaderboardStats?.current_period?.daily_top_score || '0' }}</span>
                    </div>
                  </div>
                  <div class="stat-row mb-3">
                    <div class="d-flex justify-content-between align-items-center">
                      <span class="text-muted small">Monthly Top Score</span>
                      <span class="fw-bold text-success">{{ leaderboardStats?.current_period?.monthly_top_score || '0' }}</span>
                    </div>
                  </div>
                  <div class="stat-row mb-3">
                    <div class="d-flex justify-content-between align-items-center">
                      <span class="text-muted small">All Time Top Score</span>
                      <span class="fw-bold text-warning">{{ formatNumber(leaderboardStats?.current_period?.all_time_top_score || '0') }}</span>
                    </div>
                  </div>
                  <div class="stat-row">
                    <div class="d-flex justify-content-between align-items-center">
                      <span class="text-muted small">Daily Participants</span>
                      <span class="fw-bold text-info">{{ leaderboardStats?.current_period?.daily_participants || '0' }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <!-- Footer Component -->
      <Footer />
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { useToast } from 'vue-toastification'
import Sidebar from '@/components/partials/Sidebar.vue'
import Header from '@/components/partials/Header.vue'
import Footer from '@/components/partials/Footer.vue'

export default {
  name: 'DashboardView',
  
  components: {
    Sidebar,
    Header,
    Footer
  },

  
  setup() {
    const toast = useToast()
    return { toast }
  },

  data() {
    return {
      isRefreshing: false,
      sidebarVisible: true
    }
  },

  async mounted() {
    this.checkMobileScreen()
    window.addEventListener('resize', this.checkMobileScreen)
    await this.initializeDashboard()
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.checkMobileScreen)
  },

  computed: {
    ...mapGetters('dashboard', [
      'productStatistics',
      'pointStatistics',
      'leaderboardStatistics',
      'campaignStatistics',
      'affiliateStatistics'
    ]),

    productStats() {
      return this.productStatistics
    },

    pointStats() {
      return this.pointStatistics
    },

    leaderboardStats() {
      return this.leaderboardStatistics
    },

    campaignStats() {
      return this.campaignStatistics
    },

    affiliateStats() {
      return this.affiliateStatistics
    },

    topPointUsers() {
      return this.pointStats?.topPointUsers?.slice(0, 5) || []
    },

    productCategories() {
      return this.productStats?.productsByCategory?.filter(cat => parseInt(cat.productCount) > 0) || []
    },

    pointActivities() {
      return this.pointStats?.activityStatistics?.filter(act => parseInt(act.total_points_awarded) > 0) || []
    },

    sharePlatforms() {
      return this.affiliateStats?.shareAnalytics?.sharesByPlatform || []
    }
  },

  methods: {
    ...mapActions('dashboard', ['fetchAllStatistics']),

    async initializeDashboard() {
      this.isRefreshing = true
      try {
        console.log('🚀 Initializing dashboard...')
        
        // Fetch all statistics with enhanced error handling
        const results = await this.fetchAllStatistics()
        
        // Count successful and failed requests
        const successful = results.filter(result => result.status === 'fulfilled').length
        const failed = results.filter(result => result.status === 'rejected').length
        
        console.log(`📊 Dashboard loaded: ${successful} successful, ${failed} failed`)
        
        // Show appropriate toast based on results
        if (failed === 0) {
          this.toast.success('Dashboard loaded successfully!')
        } else if (successful > 0) {
          this.toast.warning(`Dashboard loaded with ${failed} unavailable feature(s)`)
        } else {
          this.toast.error('Failed to load dashboard data')
        }
        
      } catch (error) {
        console.error('❌ Failed to initialize dashboard:', error)
        this.toast.error('Failed to load dashboard')
      } finally {
        this.isRefreshing = false
      }
    },

    async handleRefresh() {
      this.isRefreshing = true
      try {
        console.log('🔄 Refreshing dashboard...')
        
        const results = await this.refreshStatistics()
        
        // Count successful and failed requests
        const successful = results.filter(result => result.status === 'fulfilled').length
        const failed = results.filter(result => result.status === 'rejected').length
        
        if (failed === 0) {
          this.toast.success('Dashboard refreshed successfully!')
        } else if (successful > 0) {
          this.toast.info(`Dashboard refreshed (${failed} features unavailable)`)
        } else {
          this.toast.error('Failed to refresh dashboard')
        }
        
      } catch (error) {
        console.error('❌ Failed to refresh dashboard:', error)
        this.toast.error('Failed to refresh dashboard')
      } finally {
        this.isRefreshing = false
      }
    },

    handleSidebarLogout() {
      this.$router.push('/login')
    },

    formatNumber(value) {
      if (!value) return '0'
      return parseFloat(value).toLocaleString('id-ID')
    },

    formatCurrency(value) {
      if (!value) return '0'
      return parseFloat(value).toLocaleString('id-ID')
    },

    getCategoryColor(index) {
      const colors = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1', '#17a2b8', '#fd7e14', '#e83e8c', '#6c757d', '#20c997']
      return colors[index % colors.length]
    },

    getActivityProgressWidth(totalPoints) {
      const maxPoints = Math.max(...this.pointActivities.map(act => parseInt(act.total_points_awarded)))
      return maxPoints > 0 ? (parseInt(totalPoints) / maxPoints) * 100 : 0
    },

    getPlatformIcon(platform) {
      const icons = {
        whatsapp: 'fab fa-whatsapp',
        facebook: 'fab fa-facebook',
        twitter: 'fab fa-twitter',
        instagram: 'fab fa-instagram',
        telegram: 'fab fa-telegram',
        copyurl: 'fas fa-link'
      }
      return icons[platform] || 'fas fa-share-alt'
    },

    getPlatformColor(platform) {
      const colors = {
        whatsapp: '#25d366',
        facebook: '#4267B2',
        twitter: '#1da1f2',
        instagram: '#E4405F',
        telegram: '#0088cc',
        copyurl: '#6c757d'
      }
      return colors[platform] || '#6c757d'
    },

    getRankClass(index) {
      if (index === 0) return 'text-warning' // Gold
      if (index === 1) return 'text-secondary' // Silver
      if (index === 2) return 'text-danger' // Bronze
      return 'text-muted'
    },

    viewUserDetails(user) {
      this.toast.info(`Viewing details for ${user.username}`)
      console.log('User details:', user)
    },

    toggleSidebar() {
      this.sidebarVisible = !this.sidebarVisible
    },

    checkMobileScreen() {
      if (window.innerWidth <= 768) {
        this.sidebarVisible = false
      } else {
        this.sidebarVisible = true
      }
    }
  }
}
</script>

<style scoped>
/* Layout Structure */
.dashboard-layout {
  min-height: 100vh;
  background-color: #f8f9fa;
  display: flex;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 250px;
  min-height: 100vh;
  transition: margin-left 0.3s ease;
}

.main-content.sidebar-hidden {
  margin-left: 0;
}

.dashboard-container {
  flex: 1;
  padding: 1.5rem;
  margin-top: 80px;
}

.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1050;
}

.sidebar-mobile-hidden {
  transform: translateX(-100%);
}

/* Card Styles */
.stat-card {
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.card-header {
  background: #ffffff;
  border-bottom: 1px solid #f0f0f0;
  border-radius: 12px 12px 0 0 !important;
}

/* Category List Styles */
.category-item {
  padding: 0.75rem;
  border-radius: 8px;
  background-color: #f8f9fa;
  transition: background-color 0.2s ease;
}

.category-item:hover {
  background-color: #e9ecef;
}

.category-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.category-name {
  font-size: 0.875rem;
  color: #495057;
}

/* Activity List Styles */
.activity-item {
  padding: 0.75rem;
  border-radius: 8px;
  background-color: #f8f9fa;
  transition: background-color 0.2s ease;
}

.activity-item:hover {
  background-color: #e9ecef;
}

.activity-name {
  font-size: 0.8rem;
}

.activity-points {
  font-size: 0.875rem;
}

.progress {
  border-radius: 10px;
}

.progress-bar {
  border-radius: 10px;
  transition: width 0.3s ease;
}

/* Platform List Styles */
.platform-item {
  padding: 0.75rem;
  border-radius: 8px;
  background-color: #f8f9fa;
  transition: background-color 0.2s ease;
}

.platform-item:hover {
  background-color: #e9ecef;
}

.platform-name {
  font-size: 0.875rem;
  color: #495057;
}

/* Table Styles */
.table {
  font-size: 0.875rem;
}

.table thead th {
  font-weight: 600;
  color: #6c757d;
  background-color: #f8f9fa;
  border: none;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.table tbody tr {
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s ease;
}

.table tbody tr:hover {
  background-color: rgba(0, 123, 255, 0.02);
}

.cursor-pointer {
  cursor: pointer;
}

.user-avatar {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rank-badge {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #f8f9fa;
  font-size: 0.875rem;
}

/* Leaderboard Stats Styles */
.leaderboard-stats {
  padding: 1rem 0;
}

.stat-row {
  padding: 0.75rem;
  border-radius: 8px;
  background-color: #f8f9fa;
  transition: background-color 0.2s ease;
}

.stat-row:hover {
  background-color: #e9ecef;
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

.badge.bg-light {
  background-color: #f8f9fa !important;
  color: #495057 !important;
  border: 1px solid #dee2e6;
}

.badge.bg-primary {
  background-color: #007bff !important;
}

/* Icon Styles */
.fab, .fas {
  font-size: 1.1rem;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .dashboard-container {
    padding: 1rem;
  }
  
  .stat-row {
    padding: 0.5rem;
  }
  
  .category-item,
  .activity-item,
  .platform-item {
    padding: 0.5rem;
  }
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }
  
  .dashboard-container {
    padding: 0.75rem;
    margin-top: 70px;
  }
  
  .stat-card .card-body {
    padding: 1rem;
  }
  
  .table-responsive {
    font-size: 0.8rem;
  }
  
  .stat-icon {
    width: 32px;
    height: 32px;
  }
  
  .card-header h6 {
    font-size: 0.9rem;
  }
  
  .row .col-xl-8,
  .row .col-xl-4,
  .row .col-xl-6 {
    margin-bottom: 1rem;
  }
  
  .leaderboard-stats {
    padding: 0.5rem 0;
  }
  
  .stat-row {
    padding: 0.5rem;
    margin-bottom: 0.5rem;
  }
  
  .category-item,
  .activity-item,
  .platform-item {
    padding: 0.5rem;
    margin-bottom: 0.5rem;
  }
  
  .user-avatar {
    width: 28px;
    height: 28px;
  }
  
  .rank-badge {
    width: 25px;
    height: 25px;
    font-size: 0.8rem;
  }
}

@media (max-width: 576px) {
  .dashboard-container {
    padding: 0.5rem;
  }
  
  .stat-card .card-body {
    padding: 0.75rem;
  }
  
  .stat-card h3 {
    font-size: 1.5rem;
  }
  
  .table thead th {
    font-size: 0.7rem;
    padding: 0.5rem 0.25rem;
  }
  
  .table tbody td {
    padding: 0.75rem 0.25rem;
  }
  
  .badge {
    font-size: 0.7rem;
    padding: 0.4rem 0.6rem;
  }
  
  .category-name,
  .platform-name {
    font-size: 0.8rem;
  }
  
  .activity-name {
    font-size: 0.75rem;
  }
  
  .activity-points {
    font-size: 0.8rem;
  }
}

/* Animation enhancements */
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

.stat-card,
.card {
  animation: fadeInUp 0.5s ease-out;
}

.stat-card:nth-child(1) { animation-delay: 0.1s; }
.stat-card:nth-child(2) { animation-delay: 0.2s; }
.stat-card:nth-child(3) { animation-delay: 0.3s; }
.stat-card:nth-child(4) { animation-delay: 0.4s; }

/* Loading states */
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

/* Hover effects */
.category-item:hover .category-name,
.activity-item:hover .activity-name,
.platform-item:hover .platform-name {
  color: #007bff;
}

.stat-row:hover span {
  color: #007bff !important;
}

/* Focus states for accessibility */
.category-item:focus,
.activity-item:focus,
.platform-item:focus,
.stat-row:focus {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}
</style>