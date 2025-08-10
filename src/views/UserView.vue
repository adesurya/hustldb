<!-- Updated UserView.vue with enhanced user management features -->
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
      
      <!-- User Content Container -->
      <main class="user-container">
        <!-- Page Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 class="mb-1 fw-bold text-dark">User Management</h2>
            <p class="text-muted mb-0">Manage user accounts and permissions</p>
          </div>
          <button 
            @click.prevent="openAddUserModal"
            class="btn btn-primary d-flex align-items-center"
            type="button"
          >
            <i class="fas fa-plus me-2"></i>
            Add User
          </button>
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
                    <h3 class="mb-1 fw-bold text-dark">{{ filteredUsersList.length }}</h3>
                    <h6 class="text-muted mb-0 small">
                      {{ searchQuery || selectedRole || selectedStatus ? 'Filtered' : 'Total' }} Users
                    </h6>
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
                      <i class="fas fa-user-check text-success"></i>
                    </div>
                    <h3 class="mb-1 fw-bold text-dark">{{ getActiveUsersCount }}</h3>
                    <h6 class="text-muted mb-0 small">Active Users</h6>
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
                      <i class="fas fa-shield-alt text-info"></i>
                    </div>
                    <h3 class="mb-1 fw-bold text-dark">{{ getVerifiedUsersCount }}</h3>
                    <h6 class="text-muted mb-0 small">Verified Users</h6>
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
                      <i class="fas fa-user-cog text-warning"></i>
                    </div>
                    <h3 class="mb-1 fw-bold text-dark">{{ getAdminUsersCount }}</h3>
                    <h6 class="text-muted mb-0 small">Admin Users</h6>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Filters and Search -->
        <div class="card border-0 mb-4">
          <div class="card-body">
            <div class="row g-3">
              <!-- Search -->
              <div class="col-lg-4 col-md-6">
                <div class="search-box position-relative">
                  <input
                    v-model="searchQuery"
                    @input="handleSearch"
                    type="text"
                    class="form-control ps-5"
                    placeholder="Search users by name or email..."
                  >
                  <i class="fas fa-search position-absolute search-icon"></i>
                </div>
              </div>

              <!-- Role Filter -->
              <div class="col-lg-2 col-md-3">
                <select 
                  v-model="selectedRole"
                  @change="handleRoleFilter"
                  class="form-select"
                >
                  <option value="">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
              </div>

              <!-- Status Filter -->
              <div class="col-lg-2 col-md-3">
                <select 
                  v-model="selectedStatus"
                  @change="handleStatusFilter"
                  class="form-select"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <!-- Verified Filter -->
              <div class="col-lg-2 col-md-6">
                <select 
                  v-model="selectedVerified"
                  @change="handleVerifiedFilter"
                  class="form-select"
                >
                  <option value="">All</option>
                  <option value="verified">Verified</option>
                  <option value="unverified">Unverified</option>
                </select>
              </div>

              <!-- Clear Filters -->
              <div class="col-lg-2 col-md-6">
                <button 
                  @click="clearFilters"
                  class="btn btn-outline-secondary w-100"
                  :disabled="!searchQuery && !selectedRole && !selectedStatus && !selectedVerified"
                >
                  <i class="fas fa-times me-2"></i>
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Bulk Actions -->
        <div v-if="selectedUsers.length > 0" class="card border-0 mb-4">
          <div class="card-body bg-light">
            <div class="d-flex justify-content-between align-items-center">
              <span class="text-muted">
                {{ selectedUsers.length }} user(s) selected
              </span>
              <div class="btn-group">
                <button 
                  @click="bulkActivate"
                  class="btn btn-sm btn-success"
                  :disabled="isSubmitting"
                >
                  <i class="fas fa-check me-1"></i>
                  Activate
                </button>
                <button 
                  @click="bulkDeactivate"
                  class="btn btn-sm btn-warning"
                  :disabled="isSubmitting"
                >
                  <i class="fas fa-pause me-1"></i>
                  Deactivate
                </button>
                <button 
                  @click="bulkDelete"
                  class="btn btn-sm btn-danger"
                  :disabled="isSubmitting"
                >
                  <i class="fas fa-trash me-1"></i>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Users Table -->
        <div class="card border-0">
          <div class="card-body p-0">
            <div v-if="isLoading" class="text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>

            <div v-else-if="filteredUsersList.length === 0" class="text-center py-5">
              <div class="empty-state">
                <i class="fas fa-users fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">No users found</h5>
                <p class="text-muted">
                  {{ searchQuery || selectedRole || selectedStatus ? 'Try adjusting your search or filters' : 'Start by adding your first user' }}
                </p>
                <button 
                  v-if="!searchQuery && !selectedRole && !selectedStatus"
                  @click="openAddUserModal"
                  class="btn btn-primary"
                >
                  <i class="fas fa-plus me-2"></i>
                  Add User
                </button>
                <button 
                  v-else
                  @click="clearFilters"
                  class="btn btn-outline-primary"
                >
                  <i class="fas fa-times me-2"></i>
                  Clear Filters
                </button>
              </div>
            </div>

            <div v-else class="table-responsive">
              <table class="table table-hover">
                <thead class="table-light">
                  <tr>
                    <th class="border-0">
                      <input
                        v-model="selectAll"
                        @change="handleSelectAll"
                        type="checkbox"
                        class="form-check-input"
                      >
                    </th>
                    <th class="border-0">User</th>
                    <th class="border-0">Email</th>
                    <th class="border-0">Phone</th>
                    <th class="border-0">Role</th>
                    <th class="border-0">Points</th>
                    <th class="border-0">Status</th>
                    <th class="border-0">Last Login</th>
                    <th class="border-0">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr 
                    v-for="user in filteredUsersList" 
                    :key="user.id"
                    class="user-row"
                  >
                    <td>
                      <input
                        v-model="selectedUsers"
                        :value="user.id"
                        type="checkbox"
                        class="form-check-input"
                      >
                    </td>
                    <td>
                      <div class="d-flex align-items-center">
                        <div class="user-avatar me-3">
                          <div class="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                               style="width: 40px; height: 40px;">
                            {{ getUserInitials(user.username) }}
                          </div>
                        </div>
                        <div>
                          <div class="fw-semibold text-dark">{{ user.username }}</div>
                          <small class="text-muted">ID: {{ user.id }}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div class="text-dark">{{ user.email }}</div>
                      <div v-if="user.isVerified" class="text-success small">
                        <i class="fas fa-check-circle me-1"></i>Verified
                      </div>
                      <div v-else class="text-warning small">
                        <i class="fas fa-clock me-1"></i>Unverified
                      </div>
                    </td>
                    <td>
                      <span v-if="user.phoneNumber" class="text-dark">{{ user.phoneNumber }}</span>
                      <span v-else class="text-muted">-</span>
                    </td>
                    <td>
                      <span class="badge" :class="getRoleBadgeClass(user.role)">
                        <i :class="getRoleIcon(user.role)" class="me-1"></i>
                        {{ user.role }}
                      </span>
                    </td>
                    <td>
                      <div class="text-dark fw-semibold">{{ formatNumber(user.currentPoints) }}</div>
                      <small class="text-muted">points</small>
                    </td>
                    <td>
                      <span class="badge" :class="user.isActive ? 'bg-success' : 'bg-danger'">
                        {{ user.isActive ? 'Active' : 'Inactive' }}
                      </span>
                    </td>
                    <td>
                      <div v-if="user.lastLogin" class="text-dark">
                        {{ formatDate(user.lastLogin) }}
                      </div>
                      <span v-else class="text-muted">Never</span>
                    </td>
                    <td>
                      <div class="dropdown position-relative">
                        <button
                          class="btn btn-sm btn-outline-secondary"
                          type="button"
                          @click.stop="activeDropdown = activeDropdown === user.id ? null : user.id"
                        >
                          <i class="fas fa-ellipsis-v"></i>
                        </button>
                        <div 
                          v-show="activeDropdown === user.id"
                          class="dropdown-menu dropdown-menu-end show position-absolute"
                          style="z-index: 1000;"
                        >
                          <button 
                            @click.stop="viewUserAction(user)"
                            class="dropdown-item"
                            type="button"
                          >
                            <i class="fas fa-eye me-2"></i>View Details
                          </button>
                          <button 
                            @click.stop="editUserAction(user)"
                            class="dropdown-item"
                            type="button"
                          >
                            <i class="fas fa-edit me-2"></i>Edit
                          </button>
                          <button 
                            @click.stop="resetPasswordAction(user)"
                            class="dropdown-item"
                            type="button"
                          >
                            <i class="fas fa-key me-2"></i>Reset Password
                          </button>
                          <hr class="dropdown-divider">
                          <button 
                            v-if="user.isActive"
                            @click.stop="banUserAction(user)"
                            class="dropdown-item text-warning"
                            type="button"
                          >
                            <i class="fas fa-ban me-2"></i>Ban User
                          </button>
                          <button 
                            v-else
                            @click.stop="unbanUserAction(user)"
                            class="dropdown-item text-success"
                            type="button"
                          >
                            <i class="fas fa-check-circle me-2"></i>Unban User
                          </button>
                          <hr class="dropdown-divider">
                          <button 
                            @click.stop="deleteUserAction(user)"
                            class="dropdown-item text-danger"
                            type="button"
                          >
                            <i class="fas fa-trash me-2"></i>Delete
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.totalPages > 1" class="d-flex justify-content-center mt-4">
          <nav>
            <ul class="pagination">
              <li class="page-item" :class="{ disabled: !pagination.hasPrevPage }">
                <button 
                  @click="goToPage(pagination.currentPage - 1)"
                  class="page-link"
                  :disabled="!pagination.hasPrevPage"
                >
                  Previous
                </button>
              </li>
              
              <li 
                v-for="page in visiblePages" 
                :key="page"
                class="page-item"
                :class="{ active: page === pagination.currentPage }"
              >
                <button 
                  @click="goToPage(page)"
                  class="page-link"
                >
                  {{ page }}
                </button>
              </li>
              
              <li class="page-item" :class="{ disabled: !pagination.hasNextPage }">
                <button 
                  @click="goToPage(pagination.currentPage + 1)"
                  class="page-link"
                  :disabled="!pagination.hasNextPage"
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </main>
      
      <!-- Footer Component -->
      <Footer />
    </div>

    <!-- Add/Edit User Modal -->
    <UserModal
      v-if="showAddUserModal || showEditUserModal"
      :show="showAddUserModal || showEditUserModal"
      :user="selectedUser"
      :isEdit="showEditUserModal"
      @close="closeUserModal"
      @save="handleUserSave"
    />

    <!-- User Detail Modal -->
    <UserDetailModal
      v-if="showDetailModal"
      :show="showDetailModal"
      :user="selectedUser"
      @close="showDetailModal = false"
      @edit="editUserFromDetail"
    />

    <!-- Reset Password Modal -->
    <div 
      v-if="showResetModal"
      class="modal fade show d-block"
      tabindex="-1"
      style="background-color: rgba(0,0,0,0.5);"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title fw-bold text-warning">
              <i class="fas fa-key me-2"></i>
              Reset Password
            </h5>
            <button 
              @click="showResetModal = false"
              type="button" 
              class="btn-close"
            ></button>
          </div>
          
          <div class="modal-body">
            <p class="mb-3">Enter a new password for this user:</p>
            
            <div v-if="userToReset" class="alert alert-light border mb-3">
              <div class="d-flex align-items-center">
                <div class="user-avatar me-3">
                  <div class="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                       style="width: 40px; height: 40px;">
                    {{ getUserInitials(userToReset.username) }}
                  </div>
                </div>
                <div>
                  <h6 class="mb-1 fw-bold">{{ userToReset.username }}</h6>
                  <small class="text-muted">{{ userToReset.email }}</small>
                </div>
              </div>
            </div>
            
            <div class="mb-3">
              <label class="form-label fw-semibold">New Password</label>
              <input
                v-model="newPassword"
                type="password"
                class="form-control"
                placeholder="Enter new password"
                minlength="8"
                required
              >
              <div class="form-text">Password must be at least 8 characters long</div>
            </div>
          </div>
          
          <div class="modal-footer border-0 pt-0">
            <button 
              @click="showResetModal = false"
              type="button" 
              class="btn btn-light"
            >
              Cancel
            </button>
            <button 
              @click="executeResetPassword"
              type="button" 
              class="btn btn-warning"
              :disabled="isSubmitting || !newPassword || newPassword.length < 8"
            >
              <i v-if="isSubmitting" class="fas fa-spinner fa-spin me-2"></i>
              <i v-else class="fas fa-key me-2"></i>
              {{ isSubmitting ? 'Resetting...' : 'Reset Password' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Ban User Modal -->
    <div 
      v-if="showBanUserModal"
      class="modal fade show d-block"
      tabindex="-1"
      style="background-color: rgba(0,0,0,0.5);"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title fw-bold text-warning">
              <i class="fas fa-ban me-2"></i>
              Ban User
            </h5>
            <button 
              @click="showBanUserModal = false"
              type="button" 
              class="btn-close"
            ></button>
          </div>
          
          <div class="modal-body">
            <p class="mb-3">Are you sure you want to ban this user?</p>
            
            <div v-if="userToBan" class="alert alert-light border mb-3">
              <div class="d-flex align-items-center">
                <div class="user-avatar me-3">
                  <div class="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                       style="width: 40px; height: 40px;">
                    {{ getUserInitials(userToBan.username) }}
                  </div>
                </div>
                <div>
                  <h6 class="mb-1 fw-bold">{{ userToBan.username }}</h6>
                  <small class="text-muted">{{ userToBan.email }}</small>
                </div>
              </div>
            </div>
            
            <div class="mb-3">
              <label class="form-label fw-semibold">Reason for Ban</label>
              <textarea
                v-model="banReason"
                class="form-control"
                rows="3"
                placeholder="Enter reason for banning this user..."
                required
              ></textarea>
            </div>

            <div class="form-check">
              <input
                v-model="notifyUserBan"
                class="form-check-input"
                type="checkbox"
                id="notifyBan"
              >
              <label class="form-check-label" for="notifyBan">
                Notify user via email
              </label>
            </div>
          </div>
          
          <div class="modal-footer border-0 pt-0">
            <button 
              @click="showBanUserModal = false"
              type="button" 
              class="btn btn-light"
            >
              Cancel
            </button>
            <button 
              @click="executeBanUser"
              type="button" 
              class="btn btn-warning"
              :disabled="isSubmitting || !banReason.trim()"
            >
              <i v-if="isSubmitting" class="fas fa-spinner fa-spin me-2"></i>
              <i v-else class="fas fa-ban me-2"></i>
              {{ isSubmitting ? 'Banning...' : 'Ban User' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Unban User Modal -->
    <div 
      v-if="showUnbanUserModal"
      class="modal fade show d-block"
      tabindex="-1"
      style="background-color: rgba(0,0,0,0.5);"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title fw-bold text-success">
              <i class="fas fa-check-circle me-2"></i>
              Unban User
            </h5>
            <button 
              @click="showUnbanUserModal = false"
              type="button" 
              class="btn-close"
            ></button>
          </div>
          
          <div class="modal-body">
            <p class="mb-3">Are you sure you want to unban this user?</p>
            
            <div v-if="userToUnban" class="alert alert-light border mb-3">
              <div class="d-flex align-items-center">
                <div class="user-avatar me-3">
                  <div class="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                       style="width: 40px; height: 40px;">
                    {{ getUserInitials(userToUnban.username) }}
                  </div>
                </div>
                <div>
                  <h6 class="mb-1 fw-bold">{{ userToUnban.username }}</h6>
                  <small class="text-muted">{{ userToUnban.email }}</small>
                </div>
              </div>
            </div>
            
            <div class="mb-3">
              <label class="form-label fw-semibold">Reason for Unban</label>
              <textarea
                v-model="unbanReason"
                class="form-control"
                rows="3"
                placeholder="Enter reason for unbanning this user..."
                required
              ></textarea>
            </div>

            <div class="form-check">
              <input
                v-model="notifyUserUnban"
                class="form-check-input"
                type="checkbox"
                id="notifyUnban"
              >
              <label class="form-check-label" for="notifyUnban">
                Notify user via email
              </label>
            </div>
          </div>
          
          <div class="modal-footer border-0 pt-0">
            <button 
              @click="showUnbanUserModal = false"
              type="button" 
              class="btn btn-light"
            >
              Cancel
            </button>
            <button 
              @click="executeUnbanUser"
              type="button" 
              class="btn btn-success"
              :disabled="isSubmitting || !unbanReason.trim()"
            >
              <i v-if="isSubmitting" class="fas fa-spinner fa-spin me-2"></i>
              <i v-else class="fas fa-check-circle me-2"></i>
              {{ isSubmitting ? 'Unbanning...' : 'Unban User' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div 
      v-if="showDeleteModal"
      class="modal fade show d-block"
      tabindex="-1"
      style="background-color: rgba(0,0,0,0.5);"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title fw-bold text-danger">
              <i class="fas fa-exclamation-triangle me-2"></i>
              Confirm Delete
            </h5>
            <button 
              @click="showDeleteModal = false"
              type="button" 
              class="btn-close"
            ></button>
          </div>
          
          <div class="modal-body">
            <p class="mb-3">Are you sure you want to delete this user?</p>
            
            <div v-if="userToDelete" class="alert alert-light border">
              <div class="d-flex align-items-center">
                <div class="user-avatar me-3">
                  <div class="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                       style="width: 40px; height: 40px;">
                    {{ getUserInitials(userToDelete.username) }}
                  </div>
                </div>
                <div>
                  <h6 class="mb-1 fw-bold">{{ userToDelete.username }}</h6>
                  <small class="text-muted">{{ userToDelete.email }}</small>
                </div>
              </div>
            </div>
            
            <p class="text-muted small mb-0">
              <i class="fas fa-info-circle me-1"></i>
              This action cannot be undone. All user data will be permanently deleted.
            </p>
          </div>
          
          <div class="modal-footer border-0 pt-0">
            <button 
              @click="showDeleteModal = false"
              type="button" 
              class="btn btn-light"
            >
              Cancel
            </button>
            <button 
              @click="executeDelete"
              type="button" 
              class="btn btn-danger"
              :disabled="isDeleting"
            >
              <i v-if="isDeleting" class="fas fa-spinner fa-spin me-2"></i>
              <i v-else class="fas fa-trash me-2"></i>
              {{ isDeleting ? 'Deleting...' : 'Delete User' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { useToast } from 'vue-toastification'
import Sidebar from '@/components/partials/Sidebar.vue'
import Header from '@/components/partials/Header.vue'
import Footer from '@/components/partials/Footer.vue'
import UserModal from '@/components/modals/UserModal.vue'
import UserDetailModal from '@/components/modals/UserDetailModal.vue'

export default {
  name: 'UserView',
  
  components: {
    Sidebar,
    Header,
    Footer,
    UserModal,
    UserDetailModal
  },

  setup() {
    const toast = useToast()
    return { toast }
  },

  data() {
    return {
      isRefreshing: false,
      sidebarVisible: true,
      selectedUsers: [],
      selectedUser: null,
      showAddUserModal: false,
      showEditUserModal: false,
      showDetailModal: false,
      showDeleteModal: false,
      showResetModal: false,
      showBanUserModal: false,
      showUnbanUserModal: false,
      userToDelete: null,
      userToReset: null,
      userToBan: null,
      userToUnban: null,
      isDeleting: false,
      selectAll: false,
      activeDropdown: null,
      // Filters
      searchQuery: '',
      selectedRole: '',
      selectedStatus: '',
      selectedVerified: '',
      searchTimeout: null,
      // Reset password data
      newPassword: '',
      // Ban/Unban data
      banReason: '',
      unbanReason: '',
      notifyUserBan: true,
      notifyUserUnban: true
    }
  },

  mounted() {
    this.checkMobileScreen()
    window.addEventListener('resize', this.checkMobileScreen)
    this.initializeData()
    
    // Add global click listener for closing dropdowns
    document.addEventListener('click', this.handleGlobalClick)
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.checkMobileScreen)
    document.removeEventListener('click', this.handleGlobalClick)
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout)
    }
  },

  computed: {
    ...mapGetters('users', [
      'users',
      'pagination',
      'filters',
      'isLoading',
      'isSubmitting'
    ]),

    visiblePages() {
      const current = this.pagination.currentPage || 1
      const total = this.pagination.totalPages || 1
      const delta = 2
      const range = []
      const rangeWithDots = []

      if (total <= 1) return [1]

      for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
        range.push(i)
      }

      if (current - delta > 2) {
        rangeWithDots.push(1, '...')
      } else {
        rangeWithDots.push(1)
      }

      rangeWithDots.push(...range)

      if (current + delta < total - 1) {
        rangeWithDots.push('...', total)
      } else if (total > 1) {
        rangeWithDots.push(total)
      }

      return rangeWithDots.filter((v, i, a) => a.indexOf(v) === i && v !== 1 || i === 0)
    },

    // Client-side filtering
    filteredUsersList() {
      let filtered = [...this.users]

      // Filter by search query
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase().trim()
        filtered = filtered.filter(user => 
          (user.username && user.username.toLowerCase().includes(query)) ||
          (user.email && user.email.toLowerCase().includes(query))
        )
      }

      // Filter by role
      if (this.selectedRole) {
        filtered = filtered.filter(user => user.role === this.selectedRole)
      }

      // Filter by status
      if (this.selectedStatus) {
        filtered = filtered.filter(user => 
          (this.selectedStatus === 'active' && user.isActive) ||
          (this.selectedStatus === 'inactive' && !user.isActive)
        )
      }

      // Filter by verified status
      if (this.selectedVerified) {
        filtered = filtered.filter(user => 
          (this.selectedVerified === 'verified' && user.isVerified) ||
          (this.selectedVerified === 'unverified' && !user.isVerified)
        )
      }

      return filtered
    },

    // Statistics
    getActiveUsersCount() {
      return this.filteredUsersList.filter(user => user.isActive).length
    },

    getVerifiedUsersCount() {
      return this.filteredUsersList.filter(user => user.isVerified).length
    },

    getAdminUsersCount() {
      return this.filteredUsersList.filter(user => user.role === 'admin').length
    }
  },

  watch: {
    selectedUsers(newVal) {
      this.selectAll = newVal.length === this.filteredUsersList.length && this.filteredUsersList.length > 0
    }
  },

  methods: {
    ...mapActions('users', [
      'fetchUsers',
      'createUser',
      'updateUser',
      'deleteUser',
      'resetPassword',
      'banUser',
      'unbanUser',
      'bulkDeleteUsers',
      'bulkUpdateStatus',
      'setFilters',
      'setPagination',
      'resetFilters'
    ]),

    // Simple dropdown and action methods
    viewUserAction(user) {
      this.activeDropdown = null
      this.selectedUser = user
      this.showDetailModal = true
    },

    editUserAction(user) {
      this.activeDropdown = null
      this.selectedUser = { ...user }
      this.showEditUserModal = true
    },

    resetPasswordAction(user) {
      this.activeDropdown = null
      this.userToReset = user
      this.newPassword = ''
      this.showResetModal = true
    },

    banUserAction(user) {
      this.activeDropdown = null
      this.userToBan = user
      this.banReason = ''
      this.notifyUserBan = true
      this.showBanUserModal = true
    },

    unbanUserAction(user) {
      this.activeDropdown = null
      this.userToUnban = user
      this.unbanReason = ''
      this.notifyUserUnban = true
      this.showUnbanUserModal = true
    },

    deleteUserAction(user) {
      this.activeDropdown = null
      this.userToDelete = user
      this.showDeleteModal = true
    },

    // Modal control methods
    openAddUserModal() {
      this.selectedUser = null
      this.showAddUserModal = true
    },

    closeUserModal() {
      this.showAddUserModal = false
      this.showEditUserModal = false
      this.selectedUser = null
    },

    editUserFromDetail(user) {
      this.selectedUser = { ...user }
      this.showDetailModal = false
      this.showEditUserModal = true
    },

    // Global event handlers
    handleGlobalClick(event) {
      if (!event.target.closest('.dropdown')) {
        this.activeDropdown = null
      }
    },

    // Initialize and setup methods
    async initializeData() {
      this.isRefreshing = true
      try {
        await this.fetchUsers()
      } catch (error) {
        console.error('Failed to load users:', error)
        this.toast.error('Failed to load users')
      } finally {
        this.isRefreshing = false
      }
    },

    async handleRefresh() {
      await this.initializeData()
      this.toast.success('Users refreshed successfully!')
    },

    handleSidebarLogout() {
      this.$router.push('/login')
    },

    // Utility methods
    formatNumber(value) {
      if (!value && value !== 0) return '0'
      try {
        return Number(value).toLocaleString('id-ID')
      } catch (error) {
        console.error('Number formatting error:', error)
        return String(value || '0')
      }
    },

    formatDate(dateString) {
      if (!dateString) return 'Never'
      
      try {
        const date = new Date(dateString)
        if (isNaN(date.getTime())) return 'Invalid date'
        
        return date.toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      } catch (error) {
        console.error('Date formatting error:', error)
        return 'Invalid date'
      }
    },

    getUserInitials(username) {
      if (!username) return 'U'
      try {
        return String(username).substring(0, 2).toUpperCase()
      } catch (error) {
        console.error('Get initials error:', error)
        return 'U'
      }
    },

    getRoleBadgeClass(role) {
      switch (role) {
        case 'admin':
          return 'bg-danger'
        case 'user':
          return 'bg-primary'
        default:
          return 'bg-secondary'
      }
    },

    getRoleIcon(role) {
      switch (role) {
        case 'admin':
          return 'fas fa-crown'
        case 'user':
          return 'fas fa-user'
        default:
          return 'fas fa-question'
      }
    },

    // Search and filter methods
    handleSearch() {
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout)
      }
      
      this.searchTimeout = setTimeout(() => {
        // Search handled by computed property
      }, 300)
    },

    handleRoleFilter() {
      // Filter handled by computed property
    },

    handleStatusFilter() {
      // Filter handled by computed property
    },

    handleVerifiedFilter() {
      // Filter handled by computed property
    },

    clearFilters() {
      this.searchQuery = ''
      this.selectedRole = ''
      this.selectedStatus = ''
      this.selectedVerified = ''
    },

    // Selection methods
    handleSelectAll() {
      if (this.selectAll) {
        this.selectedUsers = this.filteredUsersList.map(user => user.id)
      } else {
        this.selectedUsers = []
      }
    },

    // Pagination
    goToPage(page) {
      if (page >= 1 && page <= this.pagination.totalPages) {
        this.setPagination({ currentPage: page })
      }
    },

    // Execute action methods
    async executeResetPassword() {
      if (!this.userToReset || !this.newPassword || this.newPassword.length < 8) return
      
      try {
        const response = await this.resetPassword({
          userId: this.userToReset.id,
          newPassword: this.newPassword
        })
        if (response.success) {
          this.toast.success('Password reset successfully!')
          this.showResetModal = false
          this.userToReset = null
          this.newPassword = ''
        }
      } catch (error) {
        console.error('Reset password error:', error)
        this.toast.error(error.message || 'Failed to reset password')
      }
    },

    async executeBanUser() {
      if (!this.userToBan || !this.banReason.trim()) return
      
      try {
        const response = await this.banUser({
          userId: this.userToBan.id,
          reason: this.banReason,
          notifyUser: this.notifyUserBan
        })
        if (response.success) {
          this.toast.success('User banned successfully!')
          this.showBanUserModal = false
          this.userToBan = null
          this.banReason = ''
        }
      } catch (error) {
        console.error('Ban user error:', error)
        this.toast.error(error.message || 'Failed to ban user')
      }
    },

    async executeUnbanUser() {
      if (!this.userToUnban || !this.unbanReason.trim()) return
      
      try {
        const response = await this.unbanUser({
          userId: this.userToUnban.id,
          reason: this.unbanReason,
          notifyUser: this.notifyUserUnban
        })
        if (response.success) {
          this.toast.success('User unbanned successfully!')
          this.showUnbanUserModal = false
          this.userToUnban = null
          this.unbanReason = ''
        }
      } catch (error) {
        console.error('Unban user error:', error)
        this.toast.error(error.message || 'Failed to unban user')
      }
    },

    async executeDelete() {
      if (!this.userToDelete) return
      
      this.isDeleting = true
      try {
        const response = await this.deleteUser(this.userToDelete.id)
        if (response.success) {
          this.toast.success('User deleted successfully!')
          this.selectedUsers = this.selectedUsers.filter(id => id !== this.userToDelete.id)
          this.showDeleteModal = false
          this.userToDelete = null
        }
      } catch (error) {
        console.error('Delete error:', error)
        this.toast.error(error.message || 'Failed to delete user')
      } finally {
        this.isDeleting = false
      }
    },

    // Bulk actions
    async bulkActivate() {
      if (this.selectedUsers.length === 0) return
      
      try {
        const response = await this.bulkUpdateStatus({
          userIds: this.selectedUsers,
          isActive: true
        })
        if (response.success) {
          this.toast.success(`${this.selectedUsers.length} user(s) activated successfully!`)
          this.selectedUsers = []
          this.selectAll = false
        }
      } catch (error) {
        console.error('Bulk activate error:', error)
        this.toast.error(error.message || 'Failed to activate users')
      }
    },

    async bulkDeactivate() {
      if (this.selectedUsers.length === 0) return
      
      try {
        const response = await this.bulkUpdateStatus({
          userIds: this.selectedUsers,
          isActive: false
        })
        if (response.success) {
          this.toast.success(`${this.selectedUsers.length} user(s) deactivated successfully!`)
          this.selectedUsers = []
          this.selectAll = false
        }
      } catch (error) {
        console.error('Bulk deactivate error:', error)
        this.toast.error(error.message || 'Failed to deactivate users')
      }
    },

    async bulkDelete() {
      if (this.selectedUsers.length === 0) return
      
      if (confirm(`Are you sure you want to delete ${this.selectedUsers.length} user(s)?`)) {
        try {
          const response = await this.bulkDeleteUsers(this.selectedUsers)
          if (response.success) {
            this.toast.success(`${this.selectedUsers.length} user(s) deleted successfully!`)
            this.selectedUsers = []
            this.selectAll = false
          }
        } catch (error) {
          console.error('Bulk delete error:', error)
          this.toast.error(error.message || 'Failed to delete users')
        }
      }
    },

    async handleUserSave(userData) {
      try {
        let response
        if (this.showEditUserModal) {
          response = await this.updateUser({
            id: this.selectedUser.id,
            userData
          })
          this.toast.success('User updated successfully!')
        } else {
          response = await this.createUser(userData)
          this.toast.success('User created successfully!')
        }
        
        if (response.success) {
          this.closeUserModal()
        }
      } catch (error) {
        console.error('Save user error:', error)
        this.toast.error(
          error.message || 
          (this.showEditUserModal 
            ? 'Failed to update user' 
            : 'Failed to create user')
        )
      }
    },

    // Layout methods
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

.user-container {
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

/* Search Box */
.search-box {
  position: relative;
}

.search-icon {
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  z-index: 5;
}

.search-box input {
  padding-left: 45px;
}

/* Table Styles */
.table {
  margin-bottom: 0;
}

.table th {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  font-weight: 600;
  color: #495057;
  padding: 1rem 0.75rem;
}

.table td {
  padding: 1rem 0.75rem;
  vertical-align: middle;
  border-bottom: 1px solid #f1f3f4;
}

.user-row {
  transition: all 0.2s ease;
}

.user-row:hover {
  background-color: #f8f9fa;
}

.user-avatar .bg-primary {
  font-size: 14px;
}

/* Empty State */
.empty-state {
  padding: 3rem 1rem;
}

.empty-state i {
  opacity: 0.5;
}

/* Pagination */
.pagination {
  margin: 0;
}

.page-link {
  color: #007bff;
  border: 1px solid #dee2e6;
  padding: 0.75rem 1rem;
}

.page-link:hover {
  background-color: #e9ecef;
  border-color: #dee2e6;
}

.page-item.active .page-link {
  background-color: #007bff;
  border-color: #007bff;
}

/* Dropdown Menu */
.dropdown {
  position: relative;
}

.dropdown-menu {
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  min-width: 180px;
  z-index: 1000;
  background-color: white;
  padding: 0.5rem 0;
}

.dropdown-menu.show {
  display: block;
}

.dropdown-item {
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #495057;
  display: flex;
  align-items: center;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
  color: #495057;
}

.dropdown-item.text-danger {
  color: #dc3545 !important;
}

.dropdown-item.text-danger:hover {
  background-color: #f5c6cb;
  color: #721c24 !important;
}

.dropdown-item.text-warning {
  color: #f57c00 !important;
}

.dropdown-item.text-warning:hover {
  background-color: #fff3cd;
  color: #856404 !important;
}

.dropdown-item.text-success {
  color: #28a745 !important;
}

.dropdown-item.text-success:hover {
  background-color: #d4edda;
  color: #155724 !important;
}

.dropdown-divider {
  height: 0;
  margin: 0.5rem 0;
  overflow: hidden;
  border-top: 1px solid #e9ecef;
}

/* Button Styles */
.btn {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;
  user-select: none;
  border: 1px solid transparent;
  text-decoration: none;
  display: inline-block;
  text-align: center;
  vertical-align: middle;
}

.btn:not(:disabled):not(.disabled) {
  cursor: pointer;
}

.btn:focus {
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.btn-primary {
  background-color: #007bff;
  border-color: #007bff;
  padding: 0.75rem 1.5rem;
}

.btn-primary:hover {
  background-color: #0056b3;
  border-color: #0056b3;
  transform: translateY(-1px);
}

.btn-sm {
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  border-radius: 6px;
}

.btn-outline-secondary {
  border-color: #6c757d;
  color: #6c757d;
}

.btn-outline-secondary:hover {
  background-color: #6c757d;
  border-color: #6c757d;
  color: white;
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

/* Badge Styles */
.badge {
  font-size: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
}

.badge.bg-danger {
  background-color: #dc3545 !important;
}

.badge.bg-primary {
  background-color: #007bff !important;
}

.badge.bg-success {
  background-color: #28a745 !important;
}

.badge.bg-secondary {
  background-color: #6c757d !important;
}

.badge.bg-warning {
  background-color: #ffc107 !important;
  color: #000;
}

/* Modal Styles */
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

/* Responsive Design */
@media (max-width: 1200px) {
  .user-container {
    padding: 1rem;
  }
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }
  
  .user-container {
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
  
  .table-responsive {
    font-size: 0.875rem;
  }
  
  .user-avatar .bg-primary {
    width: 32px !important;
    height: 32px !important;
    font-size: 12px !important;
  }
}

@media (max-width: 576px) {
  .user-container {
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
    padding: 0.4rem 0.8rem;
  }
  
  .badge {
    font-size: 0.7rem;
    padding: 0.4rem 0.6rem;
  }
  
  .table td,
  .table th {
    padding: 0.75rem 0.5rem;
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

.stat-card {
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

/* Focus states for accessibility */
.btn:focus {
  outline: 2px solid #007bff;
  outline-offset: 2px;
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