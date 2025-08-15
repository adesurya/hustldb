<!-- /src/views/LeaderboardView.vue - Complete Implementation -->
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
      
      <!-- Leaderboard Content Container -->
      <main class="leaderboard-container">
        <!-- Page Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 class="mb-1 fw-bold text-dark">Leaderboard</h2>
            <p class="text-muted mb-0">Track user rankings and point activities</p>
          </div>
          <div class="d-flex gap-2">
            <button 
              @click="showPointTransactionsModal = true"
              class="btn btn-outline-primary d-flex align-items-center"
            >
              <i class="fas fa-history me-2"></i>
              View Transactions
            </button>
            <button 
              @click="showAwardPointsModal = true"
              class="btn btn-primary d-flex align-items-center"
            >
              <i class="fas fa-gift me-2"></i>
              Award Points
            </button>
          </div>
        </div>

        <!-- Period Filter -->
        <div class="card border-0 mb-4">
          <div class="card-body">
            <div class="row g-3 align-items-end">
              <!-- Period Selection -->
              <div class="col-lg-4 col-md-6">
                <label class="form-label fw-semibold">Time Period</label>
                <div class="btn-group w-100" role="group">
                  <button 
                    v-for="period in periods" 
                    :key="period.value"
                    @click="setPeriodFilter(period.value)"
                    type="button" 
                    class="btn"
                    :class="currentPeriod === period.value ? 'btn-primary' : 'btn-outline-primary'"
                  >
                    {{ period.label }}
                  </button>
                </div>
              </div>

              <!-- Date Filter (for daily and monthly) -->
              <div v-if="currentPeriod !== 'all_time'" class="col-lg-4 col-md-6">
                <label class="form-label fw-semibold">
                  {{ currentPeriod === 'daily' ? 'Select Date' : 'Select Month' }}
                </label>
                <input
                  v-model="selectedDate"
                  @change="handleDateChange"
                  :type="currentPeriod === 'daily' ? 'date' : 'month'"
                  class="form-control"
                  :max="getCurrentDate()"
                >
              </div>

              <!-- Reset Button -->
              <div class="col-lg-4 col-md-12">
                <button 
                  @click="resetToToday"
                  class="btn btn-outline-secondary w-100"
                >
                  <i class="fas fa-refresh me-2"></i>
                  Reset to Current
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Statistics Cards -->
        <div class="row g-3 mb-4">
          <div class="col-xl-3 col-lg-6 col-md-6">
            <div class="stat-card card h-100 border-0">
              <div class="card-body p-3">
                <div class="d-flex align-items-center justify-content-between">
                  <div class="stat-content">
                    <div class="stat-icon bg-primary bg-opacity-10 p-2 rounded-circle mb-2">
                      <i class="fas fa-users text-primary"></i>
                    </div>
                    <h3 class="mb-1 fw-bold text-dark">{{ totalParticipants }}</h3>
                    <h6 class="text-muted mb-0 small">Total Participants</h6>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-xl-3 col-lg-6 col-md-6">
            <div class="stat-card card h-100 border-0">
              <div class="card-body p-3">
                <div class="d-flex align-items-center justify-content-between">
                  <div class="stat-content">
                    <div class="stat-icon bg-success bg-opacity-10 p-2 rounded-circle mb-2">
                      <i class="fas fa-coins text-success"></i>
                    </div>
                    <h3 class="mb-1 fw-bold text-dark">{{ formatNumber(systemOverview.totalPointsAwarded || 0) }}</h3>
                    <h6 class="text-muted mb-0 small">Total Points Awarded</h6>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-xl-3 col-lg-6 col-md-6">
            <div class="stat-card card h-100 border-0">
              <div class="card-body p-3">
                <div class="d-flex align-items-center justify-content-between">
                  <div class="stat-content">
                    <div class="stat-icon bg-warning bg-opacity-10 p-2 rounded-circle mb-2">
                      <i class="fas fa-exchange-alt text-warning"></i>
                    </div>
                    <h3 class="mb-1 fw-bold text-dark">{{ formatNumber(systemOverview.totalTransactions || 0) }}</h3>
                    <h6 class="text-muted mb-0 small">Total Transactions</h6>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-xl-3 col-lg-6 col-md-6">
            <div class="stat-card card h-100 border-0">
              <div class="card-body p-3">
                <div class="d-flex align-items-center justify-content-between">
                  <div class="stat-content">
                    <div class="stat-icon bg-info bg-opacity-10 p-2 rounded-circle mb-2">
                      <i class="fas fa-user-check text-info"></i>
                    </div>
                    <h3 class="mb-1 fw-bold text-dark">{{ formatNumber(systemOverview.activeUsers || 0) }}</h3>
                    <h6 class="text-muted mb-0 small">Active Users</h6>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Leaderboard Content -->
        <div class="row g-4">
          <!-- Top 3 Winners (Podium) -->
          <div class="col-12">
            <div class="card border-0 mb-4">
              <div class="card-header bg-white border-0 pb-0">
                <h5 class="card-title fw-bold mb-0">
                  <i class="fas fa-trophy me-2 text-warning"></i>
                  Top {{ currentPeriod === 'all_time' ? 'All Time' : currentPeriod === 'daily' ? 'Daily' : 'Monthly' }} Leaders
                </h5>
              </div>
              <div class="card-body">
                <div v-if="isLoading" class="text-center py-5">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                </div>

                <div v-else-if="topThreeUsers.length === 0" class="text-center py-5">
                  <div class="empty-state">
                    <i class="fas fa-trophy fa-3x text-muted mb-3"></i>
                    <h5 class="text-muted">No rankings available</h5>
                    <p class="text-muted">No users have earned points in this period yet</p>
                  </div>
                </div>

                <!-- Podium Display -->
                <div v-else class="podium-container">
                  <div class="row justify-content-center">
                    <!-- 2nd Place -->
                    <div v-if="topThreeUsers[1]" class="col-lg-3 col-md-4 col-6">
                      <div class="podium-item silver">
                        <div class="podium-rank">2</div>
                        <div class="podium-user">
                          <div class="user-avatar">
                            <div class="bg-secondary rounded-circle d-flex align-items-center justify-content-center" 
                                 style="width: 60px; height: 60px;">
                              <span class="text-white fw-bold">{{ getUserInitials(topThreeUsers[1].user.username) }}</span>
                            </div>
                          </div>
                          <h6 class="mt-2 mb-1 fw-bold">{{ topThreeUsers[1].user.username }}</h6>
                          <p class="text-muted small mb-1">{{ topThreeUsers[1].user.email }}</p>
                          <div class="points-badge bg-secondary text-white">
                            <i class="fas fa-coins me-1"></i>
                            {{ formatNumber(topThreeUsers[1].points) }} pts
                          </div>
                          <div class="badge-award mt-2">
                            🥈 Silver
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- 1st Place -->
                    <div v-if="topThreeUsers[0]" class="col-lg-3 col-md-4 col-6">
                      <div class="podium-item gold">
                        <div class="podium-rank">1</div>
                        <div class="podium-user">
                          <div class="user-avatar">
                            <div class="bg-warning rounded-circle d-flex align-items-center justify-content-center" 
                                 style="width: 80px; height: 80px;">
                              <span class="text-dark fw-bold fs-4">{{ getUserInitials(topThreeUsers[0].user.username) }}</span>
                            </div>
                          </div>
                          <h5 class="mt-2 mb-1 fw-bold text-warning">{{ topThreeUsers[0].user.username }}</h5>
                          <p class="text-muted small mb-1">{{ topThreeUsers[0].user.email }}</p>
                          <div class="points-badge bg-warning text-dark">
                            <i class="fas fa-coins me-1"></i>
                            {{ formatNumber(topThreeUsers[0].points) }} pts
                          </div>
                          <div class="badge-award mt-2">
                            🥇 Gold
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- 3rd Place -->
                    <div v-if="topThreeUsers[2]" class="col-lg-3 col-md-4 col-6">
                      <div class="podium-item bronze">
                        <div class="podium-rank">3</div>
                        <div class="podium-user">
                          <div class="user-avatar">
                            <div class="bg-warning rounded-circle d-flex align-items-center justify-content-center" 
                                 style="width: 60px; height: 60px; opacity: 0.7;">
                              <span class="text-dark fw-bold">{{ getUserInitials(topThreeUsers[2].user.username) }}</span>
                            </div>
                          </div>
                          <h6 class="mt-2 mb-1 fw-bold">{{ topThreeUsers[2].user.username }}</h6>
                          <p class="text-muted small mb-1">{{ topThreeUsers[2].user.email }}</p>
                          <div class="points-badge bg-warning text-dark" style="opacity: 0.7;">
                            <i class="fas fa-coins me-1"></i>
                            {{ formatNumber(topThreeUsers[2].points) }} pts
                          </div>
                          <div class="badge-award mt-2">
                            🥉 Bronze
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Full Leaderboard Table -->
          <div class="col-12">
            <div class="card border-0">
              <div class="card-header bg-white border-0">
                <div class="d-flex justify-content-between align-items-center">
                  <h5 class="card-title fw-bold mb-0">
                    <i class="fas fa-list me-2"></i>
                    Complete Rankings
                  </h5>
                  <small class="text-muted">
                    Showing {{ currentLeaderboard?.leaderboard?.length || 0 }} participants
                  </small>
                </div>
              </div>
              <div class="card-body p-0">
                <div v-if="isLoading" class="text-center py-5">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                </div>

                <div v-else-if="!currentLeaderboard?.leaderboard?.length" class="text-center py-5">
                  <div class="empty-state">
                    <i class="fas fa-list fa-3x text-muted mb-3"></i>
                    <h5 class="text-muted">No rankings available</h5>
                    <p class="text-muted">No users have participated in this period yet</p>
                  </div>
                </div>

                <div v-else class="table-responsive">
                  <table class="table table-hover mb-0">
                    <thead class="table-light">
                      <tr>
                        <th style="width: 80px;">Rank</th>
                        <th>User</th>
                        <th style="width: 120px;">Points</th>
                        <th style="width: 100px;">Badge</th>
                        <th style="width: 150px;">Joined Date</th>
                        <th style="width: 120px;">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="entry in currentLeaderboard.leaderboard" :key="entry.rank">
                        <!-- Rank -->
                        <td>
                          <div class="rank-display">
                            <span 
                              :class="{
                                'rank-gold': entry.rank === 1,
                                'rank-silver': entry.rank === 2,
                                'rank-bronze': entry.rank === 3,
                                'rank-default': entry.rank > 3
                              }"
                              class="rank-number"
                            >
                              #{{ entry.rank }}
                            </span>
                          </div>
                        </td>

                        <!-- User Info -->
                        <td>
                          <div class="d-flex align-items-center">
                            <div class="user-avatar me-3">
                              <div class="bg-primary rounded-circle d-flex align-items-center justify-content-center" 
                                   style="width: 40px; height: 40px;">
                                <span class="text-white fw-bold small">{{ getUserInitials(entry.user.username) }}</span>
                              </div>
                            </div>
                            <div>
                              <div class="fw-semibold">{{ entry.user.username }}</div>
                              <div class="text-muted small">{{ entry.user.email }}</div>
                            </div>
                          </div>
                        </td>

                        <!-- Points -->
                        <td>
                          <span class="fw-bold text-success">
                            <i class="fas fa-coins me-1"></i>
                            {{ formatNumber(entry.points) }}
                          </span>
                        </td>

                        <!-- Badge -->
                        <td>
                          <span class="badge-award">{{ entry.badge }}</span>
                        </td>

                        <!-- Joined Date -->
                        <td>
                          <span class="text-muted small">
                            {{ formatDate(entry.user.created_at) }}
                          </span>
                        </td>

                        <!-- Actions -->
                        <td>
                          <div class="d-flex gap-1">
                            <button
                              @click="viewUserTransactions(entry.user)"
                              class="btn btn-sm btn-outline-info"
                              title="View Transactions"
                            >
                              <i class="fas fa-history"></i>
                            </button>
                            <button
                              @click="awardPointsToUser(entry.user)"
                              class="btn btn-sm btn-outline-primary"
                              title="Award Points"
                            >
                              <i class="fas fa-gift"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Current User Ranking (if available) -->
        <div v-if="currentUserRanking" class="row mt-4">
          <div class="col-12">
            <div class="card border-primary">
              <div class="card-header bg-primary text-white">
                <h6 class="card-title mb-0 fw-bold">
                  <i class="fas fa-user me-2"></i>
                  Your Current Ranking
                </h6>
              </div>
              <div class="card-body">
                <div class="row align-items-center">
                  <div class="col-md-2 text-center">
                    <div class="rank-display-large">
                      <span class="rank-number-large">#{{ currentUserRanking.rank }}</span>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="d-flex align-items-center">
                      <div class="user-avatar me-3">
                        <div class="bg-primary rounded-circle d-flex align-items-center justify-content-center" 
                             style="width: 50px; height: 50px;">
                          <span class="text-white fw-bold">{{ getUserInitials(currentUserRanking.user.username) }}</span>
                        </div>
                      </div>
                      <div>
                        <div class="fw-bold">{{ currentUserRanking.user.username }}</div>
                        <div class="text-muted small">{{ currentUserRanking.user.email }}</div>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-3 text-center">
                    <div class="fw-bold text-success fs-5">
                      <i class="fas fa-coins me-1"></i>
                      {{ formatNumber(currentUserRanking.points) }} pts
                    </div>
                  </div>
                  <div class="col-md-3 text-center">
                    <span class="badge-award fs-6">{{ currentUserRanking.badge }}</span>
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

    <!-- Award Points Modal -->
    <AwardPointsModal
      v-if="showAwardPointsModal"
      :show="showAwardPointsModal"
      :users="availableUsers"
      :preselectedUser="selectedUserForAward"
      @close="closeAwardPointsModal"
      @award="handleAwardPoints"
    />

    <!-- Point Transactions Modal -->
    <PointTransactionsModal
      v-if="showPointTransactionsModal"
      :show="showPointTransactionsModal"
      :transactions="pointTransactions"
      :pagination="transactionsPagination"
      :selectedUser="selectedUserForTransactions"
      :isLoading="isLoadingTransactions"
      @close="closePointTransactionsModal"
      @filter-change="handleTransactionFilterChange"
      @page-change="handleTransactionPageChange"
      @view-details="handleViewTransactionDetails"
    />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { useToast } from 'vue-toastification'
import Sidebar from '@/components/partials/Sidebar.vue'
import Header from '@/components/partials/Header.vue'
import Footer from '@/components/partials/Footer.vue'
import AwardPointsModal from '@/components/modals/AwardPointsModal.vue'
import PointTransactionsModal from '@/components/modals/PointTransactionsModal.vue'

export default {
  name: 'LeaderboardView',
  
  components: {
    Sidebar,
    Header,
    Footer,
    AwardPointsModal,
    PointTransactionsModal
  },

  setup() {
    const toast = useToast()
    return { toast }
  },

  data() {
    return {
      isRefreshing: false,
      sidebarVisible: true,
      selectedDate: null,
      showAwardPointsModal: false,
      showPointTransactionsModal: false,
      selectedUserForAward: null,
      selectedUserForTransactions: null,
      periods: [
        { value: 'all_time', label: 'All Time' },
        { value: 'monthly', label: 'Monthly' },
        { value: 'daily', label: 'Daily' }
      ]
    }
  },

  mounted() {
    this.checkMobileScreen()
    window.addEventListener('resize', this.checkMobileScreen)
    this.initializeLeaderboard()
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.checkMobileScreen)
  },

  computed: {
    ...mapGetters('leaderboard', [
      'leaderboards',
      'userRankings', 
      'metadata',
      'currentLeaderboard',
      'currentUserRanking',
      'pointsStatistics',
      'systemOverview',
      'topPointUsers',
      'pointTransactions',
      'transactionsPagination',
      'currentPeriod',
      'currentDate',
      'isLoading',
      'isLoadingStatistics',
      'isLoadingTransactions',
      'isSubmitting',
      'totalParticipants',
      'topThreeUsers',
      'restOfUsers'
    ]),

    availableUsers() {
      // Combine topPointUsers with leaderboard users
      const users = []
      
      // Add users from topPointUsers (from statistics)
      if (this.topPointUsers && this.topPointUsers.length > 0) {
        users.push(...this.topPointUsers)
      }
      
      // Add users from current leaderboard
      if (this.currentLeaderboard && this.currentLeaderboard.leaderboard) {
        this.currentLeaderboard.leaderboard.forEach(entry => {
          if (!users.find(u => u.id === entry.user.id)) {
            users.push({
              id: entry.user.id,
              username: entry.user.username,
              email: entry.user.email,
              currentPoints: entry.points || 0
            })
          }
        })
      }
      
      return users
    }
  },

  methods: {
    ...mapActions('leaderboard', [
      'fetchLeaderboard',
      'fetchPointsStatistics',
      'fetchPointTransactions',
      'fetchUserTransactions',
      'awardPoints',
      'setPeriod',
      'setDateFilter',
      'setTransactionFilters',
      'setSelectedUser'
    ]),

    async initializeLeaderboard() {
      this.isRefreshing = true
      try {
        await Promise.all([
          this.fetchLeaderboard(),
          this.fetchPointsStatistics()
        ])
        
        // Set default date
        this.selectedDate = this.getCurrentDate()
      } catch (error) {
        console.error('Failed to load leaderboard:', error)
        this.toast.error('Failed to load leaderboard data')
      } finally {
        this.isRefreshing = false
      }
    },

    async handleRefresh() {
      await this.initializeLeaderboard()
      this.toast.success('Leaderboard refreshed successfully!')
    },

    handleSidebarLogout() {
      this.$router.push('/login')
    },

    getUserInitials(username) {
      if (!username) return 'U'
      return username.substring(0, 2).toUpperCase()
    },

    formatNumber(value) {
      if (!value && value !== 0) return '0'
      return parseFloat(value).toLocaleString('id-ID')
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A'
      
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      } catch (error) {
        return 'N/A'
      }
    },

    getCurrentDate() {
      return new Date().toISOString().split('T')[0]
    },

    getCurrentMonth() {
      const now = new Date()
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    },

    async setPeriodFilter(period) {
      try {
        await this.setPeriod(period)
        
        // Update selected date based on period
        if (period === 'daily') {
          this.selectedDate = this.getCurrentDate()
        } else if (period === 'monthly') {
          this.selectedDate = this.getCurrentMonth()
        } else {
          this.selectedDate = null
        }
      } catch (error) {
        console.error('Failed to set period:', error)
        this.toast.error('Failed to update time period')
      }
    },

    async handleDateChange() {
      if (!this.selectedDate) return
      
      try {
        await this.setDateFilter({
          period: this.currentPeriod,
          date: this.selectedDate
        })
      } catch (error) {
        console.error('Failed to apply date filter:', error)
        this.toast.error('Failed to apply date filter')
      }
    },

    async resetToToday() {
      try {
        if (this.currentPeriod === 'daily') {
          this.selectedDate = this.getCurrentDate()
        } else if (this.currentPeriod === 'monthly') {
          this.selectedDate = this.getCurrentMonth()
        }
        
        await this.handleDateChange()
        this.toast.success('Reset to current period successfully!')
      } catch (error) {
        console.error('Failed to reset to today:', error)
        this.toast.error('Failed to reset to current period')
      }
    },

    // Award Points Modal Methods
    awardPointsToUser(user) {
      this.selectedUserForAward = user
      this.showAwardPointsModal = true
    },

    closeAwardPointsModal() {
      this.showAwardPointsModal = false
      this.selectedUserForAward = null
    },

    async handleAwardPoints(awardData) {
      try {
        const response = await this.awardPoints(awardData)
        if (response.success) {
          this.toast.success(`${awardData.customAmount} points awarded successfully to ${response.data.targetUser.username}!`)
          this.closeAwardPointsModal()
        }
      } catch (error) {
        console.error('Award points error:', error)
        this.toast.error(error.message || 'Failed to award points')
      }
    },

    // Point Transactions Modal Methods
    viewUserTransactions(user) {
      this.selectedUserForTransactions = user
      this.setSelectedUser(user)
      this.showPointTransactionsModal = true
      
      // Fetch user transactions
      this.fetchUserTransactions({ userId: user.id })
    },

    closePointTransactionsModal() {
      this.showPointTransactionsModal = false
      this.selectedUserForTransactions = null
      this.setSelectedUser(null)
    },

    async handleTransactionFilterChange(filters) {
      try {
        await this.setTransactionFilters(filters)
      } catch (error) {
        console.error('Failed to apply transaction filters:', error)
        this.toast.error('Failed to apply filters')
      }
    },

    async handleTransactionPageChange(page) {
      try {
        if (this.selectedUserForTransactions) {
          await this.fetchUserTransactions({ 
            userId: this.selectedUserForTransactions.id,
            params: { page }
          })
        } else {
          await this.fetchPointTransactions({ page })
        }
      } catch (error) {
        console.error('Failed to change page:', error)
        this.toast.error('Failed to load page')
      }
    },

    handleViewTransactionDetails(transaction) {
      // Could open a detailed transaction modal or navigate to details page
      console.log('View transaction details:', transaction)
      this.toast.info('Transaction details feature coming soon!')
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

.leaderboard-container {
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

/* Podium Styles */
.podium-container {
  padding: 2rem 0;
}

.podium-item {
  position: relative;
  text-align: center;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
}

.podium-item.gold {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4a 100%);
  transform: scale(1.05);
  box-shadow: 0 8px 30px rgba(255, 215, 0, 0.3);
  order: 2;
}

.podium-item.silver {
  background: linear-gradient(135deg, #c0c0c0 0%, #e2e8f0 100%);
  box-shadow: 0 4px 20px rgba(192, 192, 192, 0.3);
  order: 1;
}

.podium-item.bronze {
  background: linear-gradient(135deg, #cd7f32 0%, #d69e2e 100%);
  box-shadow: 0 4px 20px rgba(205, 127, 50, 0.3);
  order: 3;
}

.podium-rank {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  background: #fff;
  border: 3px solid #007bff;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #007bff;
}

.podium-user {
  margin-top: 1rem;
}

.points-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: bold;
  font-size: 0.875rem;
}

.badge-award {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
}

/* Rank Display */
.rank-display {
  text-align: center;
}

.rank-number {
  font-weight: bold;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
}

.rank-gold {
  background-color: #ffd700;
  color: #000;
}

.rank-silver {
  background-color: #c0c0c0;
  color: #000;
}

.rank-bronze {
  background-color: #cd7f32;
  color: #fff;
}

.rank-default {
  background-color: #f8f9fa;
  color: #495057;
  border: 1px solid #dee2e6;
}

.rank-display-large {
  text-align: center;
  margin-bottom: 1rem;
}

.rank-number-large {
  font-size: 2rem;
  font-weight: bold;
  color: #007bff;
}

/* Table Styles */
.table {
  font-size: 0.875rem;
}

.table th {
  background-color: #f8f9fa;
  border-top: none;
  border-bottom: 2px solid #dee2e6;
  font-weight: 600;
  color: #495057;
  white-space: nowrap;
}

.table td {
  vertical-align: middle;
  border-color: #f1f3f4;
}

.table-hover tbody tr:hover {
  background-color: #f8f9fa;
}

/* Empty State */
.empty-state {
  padding: 3rem 1rem;
}

.empty-state i {
  opacity: 0.5;
}

/* Button Styles */
.btn {
  border-radius: 8px;
  font-weight: 500;
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

.btn-outline-primary {
  color: #007bff;
  border-color: #007bff;
}

.btn-outline-primary:hover {
  background-color: #007bff;
  border-color: #007bff;
}

.btn-outline-primary.active {
  background-color: #007bff;
  border-color: #007bff;
  color: white;
}

.btn-sm {
  font-size: 0.8rem;
  padding: 0.375rem 0.75rem;
}

/* Form Controls */
.form-control,
.form-select {
  border-radius: 8px;
  border: 1px solid #dee2e6;
  transition: all 0.3s ease;
}

.form-control:focus,
.form-select:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

/* Responsive Design */
@media (max-width: 1200px) {
  .leaderboard-container {
    padding: 1rem;
  }
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }
  
  .leaderboard-container {
    padding: 0.75rem;
    margin-top: 70px;
  }
  
  .stat-card .card-body {
    padding: 1rem;
  }
  
  .stat-icon {
    width: 32px;
    height: 32px;
  }
  
  .podium-item {
    padding: 1rem;
    margin-bottom: 0.5rem;
  }
  
  .podium-item.gold {
    transform: none;
  }
  
  .podium-container .row {
    flex-direction: column;
  }
  
  .table {
    font-size: 0.8rem;
  }
}

@media (max-width: 576px) {
  .leaderboard-container {
    padding: 0.5rem;
  }
  
  .stat-card .card-body {
    padding: 0.75rem;
  }
  
  .stat-card h3 {
    font-size: 1.5rem;
  }
  
  .btn-sm {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
  }
  
  .table {
    font-size: 0.75rem;
  }
  
  .podium-item {
    padding: 0.75rem;
  }
  
  .rank-number-large {
    font-size: 1.5rem;
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
.podium-item,
.table tbody tr {
  animation: fadeInUp 0.5s ease-out;
}

.stat-card:nth-child(1) { animation-delay: 0.1s; }
.stat-card:nth-child(2) { animation-delay: 0.2s; }
.stat-card:nth-child(3) { animation-delay: 0.3s; }
.stat-card:nth-child(4) { animation-delay: 0.4s; }

.podium-item:nth-child(1) { animation-delay: 0.2s; }
.podium-item:nth-child(2) { animation-delay: 0.1s; }
.podium-item:nth-child(3) { animation-delay: 0.3s; }

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

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>