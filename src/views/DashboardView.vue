/* Mobile Overlay */
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

.sidebar-hidden .main-content {
  margin-left: 0;
}<template>
  <div class="dashboard-layout">
    <Sidebar :class="{ 'sidebar-mobile-hidden': !sidebarVisible }" />
    
    <!-- Mobile Overlay -->
    <div 
      v-if="sidebarVisible" 
      class="mobile-overlay d-md-none"
      @click="toggleSidebar"
    ></div>
    
    <div class="main-content" :class="{ 'sidebar-hidden': !sidebarVisible }">
      <Header 
        @refresh="handleRefresh" 
        @toggle-sidebar="toggleSidebar"
        :isRefreshing="isRefreshing" 
      />
      
      <div class="dashboard-container">
        <!-- Statistics Cards Row -->
        <div class="row g-3 mb-4">
          <!-- All Users Card -->
          <div class="col-xl-3 col-lg-6 col-md-6">
            <div class="stat-card card h-100 border-0">
              <div class="card-body p-3">
                <div class="d-flex align-items-center justify-content-between">
                  <div class="stat-content">
                    <div class="stat-icon bg-primary bg-opacity-10 p-2 rounded-circle mb-2">
                      <i class="fas fa-users text-primary"></i>
                    </div>
                    <h3 class="mb-1 fw-bold text-dark">{{ orderStats?.statistics?.totalOrders || '18' }}</h3>
                    <h6 class="text-muted mb-0 small">All Users</h6>
                    <small class="text-success">
                      <i class="fas fa-arrow-up me-1"></i>+12% from last month
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- New Users Card -->
          <div class="col-xl-3 col-lg-6 col-md-6">
            <div class="stat-card card h-100 border-0">
              <div class="card-body p-3">
                <div class="d-flex align-items-center justify-content-between">
                  <div class="stat-content">
                    <div class="stat-icon bg-success bg-opacity-10 p-2 rounded-circle mb-2">
                      <i class="fas fa-user-plus text-success"></i>
                    </div>
                    <h3 class="mb-1 fw-bold text-dark">{{ affiliateStats?.overall?.activeUsers || '1' }}</h3>
                    <h6 class="text-muted mb-0 small">New Users</h6>
                    <small class="text-success">
                      <i class="fas fa-arrow-up me-1"></i>+8% from last month
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Qualified Users Card -->
          <div class="col-xl-3 col-lg-6 col-md-6">
            <div class="stat-card card h-100 border-0">
              <div class="card-body p-3">
                <div class="d-flex align-items-center justify-content-between">
                  <div class="stat-content">
                    <div class="stat-icon bg-danger bg-opacity-10 p-2 rounded-circle mb-2">
                      <i class="fas fa-trophy text-danger"></i>
                    </div>
                    <h3 class="mb-1 fw-bold text-dark">{{ leaderboardStats?.overview?.users_with_points || '2' }}</h3>
                    <h6 class="text-muted mb-0 small">Qualified Users</h6>
                    <small class="text-success">
                      <i class="fas fa-arrow-up me-1"></i>+5% from last month
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Free Link & Rewards Card -->
          <div class="col-xl-3 col-lg-6 col-md-6">
            <div class="stat-card card h-100 border-0">
              <div class="card-body p-3">
                <div class="d-flex align-items-center justify-content-between">
                  <div class="stat-content">
                    <div class="stat-icon bg-warning bg-opacity-10 p-2 rounded-circle mb-2">
                      <i class="fas fa-dollar-sign text-warning"></i>
                    </div>
                    <h3 class="mb-1 fw-bold text-dark">1500/Month</h3>
                    <h6 class="text-muted mb-0 small">Free Link & Rewards</h6>
                    <small class="text-success">
                      <i class="fas fa-arrow-up me-1"></i>+15% from last month
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Row -->
        <div class="row g-3 mb-4">
          <!-- Reports Chart -->
          <div class="col-xl-8 col-lg-12">
            <div class="card border-0 h-100">
              <div class="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                <h6 class="mb-0 fw-semibold">Reports</h6>
                <button class="btn btn-sm btn-outline-secondary" @click="exportReports">
                  <i class="fas fa-download me-1"></i>
                  <span class="d-none d-md-inline">Export</span>
                </button>
              </div>
              <div class="card-body">
                <LineChart 
                  :data="reportsChartData" 
                  :options="reportsChartOptions"
                  :height="280"
                />
              </div>
            </div>
          </div>

          <!-- Analytics Chart -->
          <div class="col-xl-4 col-lg-12">
            <div class="card border-0 h-100">
              <div class="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                <h6 class="mb-0 fw-semibold">Analytics</h6>
                <button class="btn btn-sm btn-outline-secondary" @click="viewAnalyticsDetails">
                  <i class="fas fa-expand-alt"></i>
                </button>
              </div>
              <div class="card-body d-flex align-items-center justify-content-center">
                <DoughnutChart 
                  :data="analyticsChartData" 
                  :options="analyticsChartOptions"
                  :height="250"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Row -->
        <div class="row g-3">
          <!-- Top Performing Shops -->
          <div class="col-xl-8 col-lg-12">
            <div class="card border-0">
              <div class="card-header bg-white border-0 py-3">
                <h6 class="mb-0 fw-semibold">Top Performing Shops</h6>
              </div>
              <div class="card-body p-0">
                <div class="table-responsive">
                  <table class="table table-hover align-middle mb-0">
                    <thead class="table-light">
                      <tr>
                        <th class="border-0 py-3 ps-4">Shop Name</th>
                        <th class="border-0 py-3 text-center">Orders</th>
                        <th class="border-0 py-3 text-end">Total Sales</th>
                        <th class="border-0 py-3 text-end">Commission</th>
                        <th class="border-0 py-3 text-end pe-4">Avg Order</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr 
                        v-for="(shop, index) in topShops" 
                        :key="index"
                        class="cursor-pointer"
                        @click="viewShopDetails(shop)"
                      >
                        <td class="py-3 ps-4">
                          <div class="d-flex align-items-center">
                            <div class="shop-avatar bg-primary bg-opacity-10 rounded p-2 me-3">
                              <i class="fas fa-store text-primary small"></i>
                            </div>
                            <div>
                              <div class="fw-medium text-dark">{{ shop.shopName }}</div>
                            </div>
                          </div>
                        </td>
                        <td class="py-3 text-center">
                          <span class="badge bg-light text-dark">{{ shop.orderCount }}</span>
                        </td>
                        <td class="py-3 text-end">
                          <span class="text-dark fw-medium">Rp {{ formatCurrency(shop.totalSales) }}</span>
                        </td>
                        <td class="py-3 text-end">
                          <span class="text-success fw-medium">Rp {{ formatCurrency(shop.totalCommission) }}</span>
                        </td>
                        <td class="py-3 text-end pe-4">
                          <span class="text-muted">Rp {{ formatCurrency(shop.averageOrderValue) }}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- Share Platform Analytics -->
          <div class="col-xl-4 col-lg-12">
            <div class="card border-0">
              <div class="card-header bg-white border-0 py-3">
                <h6 class="mb-0 fw-semibold">Share Platform Analytics</h6>
              </div>
              <div class="card-body">
                <ColumnChart 
                  :data="shareAnalyticsData" 
                  :options="shareAnalyticsOptions"
                  :height="280"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
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
import { ColumnChart, PieChart, DoughnutChart, LineChart } from '@/components/charts'

export default {
  name: 'DashboardView',
  
  components: {
    Sidebar,
    Header,
    Footer,
    ColumnChart,
    PieChart,
    DoughnutChart,
    LineChart
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

  mounted() {
    this.checkMobileScreen()
    window.addEventListener('resize', this.checkMobileScreen)
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.checkMobileScreen)
  },

  computed: {
    ...mapGetters('dashboard', [
      'orderStatistics',
      'affiliateStatistics', 
      'leaderboardStatistics',
      'campaignStatistics'
    ]),

    orderStats() {
      return this.orderStatistics
    },

    affiliateStats() {
      return this.affiliateStatistics
    },

    leaderboardStats() {
      return this.leaderboardStatistics
    },

    campaignStats() {
      return this.campaignStatistics
    },

    topShops() {
      return this.orderStats?.topShops?.slice(0, 5) || []
    },

    // Reports Chart Data (Line Chart)
    reportsChartData() {
      return {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            label: 'Orders',
            data: [45, 52, 38, 24, 33, 26, 21, 20, 6, 8, 15, 10],
            borderColor: '#007bff',
            backgroundColor: 'rgba(0, 123, 255, 0.1)',
            fill: true,
            tension: 0.4
          },
          {
            label: 'Revenue',
            data: [30, 40, 35, 50, 49, 60, 70, 91, 125, 85, 70, 40],
            borderColor: '#28a745',
            backgroundColor: 'rgba(40, 167, 69, 0.1)',
            fill: true,
            tension: 0.4
          }
        ]
      }
    },

    reportsChartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    },

    // Analytics Chart Data (Doughnut)
    analyticsChartData() {
      return {
        labels: ['Sale', 'Distribute', 'Return'],
        datasets: [
          {
            data: [80, 15, 5],
            backgroundColor: [
              '#007bff',
              '#ffc107', 
              '#fd7e14'
            ],
            borderWidth: 0
          }
        ]
      }
    },

    analyticsChartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 20
            }
          }
        },
        centerText: {
          value: '80%',
          label: 'Success Rate'
        }
      }
    },

    // Share Analytics Data (Column Chart)
    shareAnalyticsData() {
      if (!this.affiliateStats?.shareAnalytics?.sharesByPlatform) {
        return {
          labels: ['WhatsApp', 'Facebook', 'Twitter', 'Instagram', 'Telegram'],
          datasets: [
            {
              label: 'Shares',
              data: [25, 20, 15, 30, 10],
              backgroundColor: [
                '#25d366',
                '#4267B2', 
                '#1da1f2',
                '#E4405F',
                '#0088cc'
              ]
            }
          ]
        }
      }

      const platforms = this.affiliateStats.shareAnalytics.sharesByPlatform
      return {
        labels: platforms.map(p => p.platform.charAt(0).toUpperCase() + p.platform.slice(1)),
        datasets: [
          {
            label: 'Shares',
            data: platforms.map(p => p.shareCount),
            backgroundColor: [
              '#25d366', // whatsapp
              '#4267B2', // facebook
              '#1da1f2', // twitter  
              '#E4405F', // instagram
              '#0088cc'  // telegram
            ]
          }
        ]
      }
    },

    shareAnalyticsOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    }
  },

  async mounted() {
    await this.initializeDashboard()
  },

  methods: {
    ...mapActions('dashboard', ['fetchAllStatistics']),

    async initializeDashboard() {
      this.isRefreshing = true
      try {
        await this.fetchAllStatistics()
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        this.isRefreshing = false
      }
    },

    async handleRefresh() {
      await this.initializeDashboard()
    },

    formatCurrency(value) {
      if (!value) return '0'
      return parseFloat(value).toLocaleString('id-ID')
    },

    // Button Actions
    exportReports() {
      this.toast.info('Exporting reports...')
      // Add export logic here
      setTimeout(() => {
        this.toast.success('Reports exported successfully!')
      }, 1500)
    },

    viewAnalyticsDetails() {
      this.toast.info('Opening analytics details...')
      // Add navigation to detailed analytics page
    },

    viewShopDetails(shop) {
      this.toast.info(`Viewing details for ${shop.shopName}`)
      // Add navigation to shop details page
      console.log('Shop details:', shop)
    },

    // Sidebar functionality
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
.dashboard-layout {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.main-content {
  margin-left: 250px;
  padding-top: 80px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.dashboard-container {
  flex: 1;
  padding: 1.5rem;
}

.stat-card {
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
}

.card-header {
  background: #ffffff;
  border-bottom: 1px solid #f0f0f0;
}

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
}

.table tbody tr:hover {
  background-color: #f8f9fa;
}

.cursor-pointer {
  cursor: pointer;
}

.shop-avatar {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-sm {
  font-size: 0.8rem;
  padding: 0.375rem 0.75rem;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .main-content {
    margin-left: 250px;
  }
  
  .dashboard-container {
    padding: 1rem;
  }
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    padding-top: 60px;
  }
  
  .dashboard-container {
    padding: 0.75rem;
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
  
  .shop-avatar {
    width: 28px;
    height: 28px;
  }
}
</style>