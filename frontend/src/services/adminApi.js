/**
 * Admin API Service
 * Handles all admin-related API calls
 * All endpoints require Admin role authorization
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class AdminApi {
  /**
   * Get authorization headers with token
   */
  getAuthHeaders(token) {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  /**
   * Handle API response
   */
  async handleResponse(response) {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // ==================== Dashboard ====================
  
  /**
   * Get dashboard statistics
   * @param {string} token - JWT token
   * @returns {Promise<Object>} Dashboard stats (totalUsers, activeAuctions, revenue, etc.)
   */
  async getDashboardStats(token) {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });
    return this.handleResponse(response);
  }

  // ==================== User Management ====================

  /**
   * Get all users (paginated with optional search)
   * @param {string} token - JWT token
   * @param {number} pageNumber - Page number (default: 1)
   * @param {number} pageSize - Items per page (default: 50)
   * @param {string} searchTerm - Optional search term
   * @returns {Promise<Object>} Paginated user list
   */
  async getAllUsers(token, pageNumber = 1, pageSize = 50, searchTerm = null) {
    const params = new URLSearchParams({
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString(),
    });
    
    if (searchTerm) {
      params.append('searchTerm', searchTerm);
    }

    const response = await fetch(`${API_BASE_URL}/admin/users?${params.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });
    return this.handleResponse(response);
  }

  /**
   * Get detailed information about a specific user
   * @param {number} userId - User ID
   * @param {string} token - JWT token
   * @returns {Promise<Object>} User details
   */
  async getUserDetails(userId, token) {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });
    return this.handleResponse(response);
  }

  /**
   * Suspend a user
   * @param {number} userId - User ID
   * @param {string} reason - Reason for suspension
   * @param {string} token - JWT token
   * @returns {Promise<Object>} Success message
   */
  async suspendUser(userId, reason, token) {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/suspend`, {
      method: 'PUT',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify({ reason }),
    });
    return this.handleResponse(response);
  }

  /**
   * Activate a suspended user
   * @param {number} userId - User ID
   * @param {string} token - JWT token
   * @returns {Promise<Object>} Success message
   */
  async activateUser(userId, token) {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/activate`, {
      method: 'PUT',
      headers: this.getAuthHeaders(token),
    });
    return this.handleResponse(response);
  }

  /**
   * Delete a user (hard delete)
   * @param {number} userId - User ID
   * @param {string} token - JWT token
   * @returns {Promise<Object>} Success message
   */
  async deleteUser(userId, token) {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(token),
    });
    return this.handleResponse(response);
  }

  /**
   * Create a new user
   * @param {Object} userData - User data {username, email, password, role}
   * @param {string} token - JWT token
   * @returns {Promise<Object>} Success message with userId
   */
  async createUser(userData, token) {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(userData),
    });
    return this.handleResponse(response);
  }

  /**
   * Update user role
   * @param {number} userId - User ID
   * @param {string} role - New role (Admin, Buyer, Seller)
   * @param {string} token - JWT token
   * @returns {Promise<Object>} Success message
   */
  async updateUserRole(userId, role, token) {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
      method: 'PUT',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify({ role }),
    });
    return this.handleResponse(response);
  }

  // ==================== Auction Management ====================

  /**
   * Get flagged auctions
   * @param {string} token - JWT token
   * @returns {Promise<Array>} List of flagged auctions
   */
  async getFlaggedAuctions(token) {
    const response = await fetch(`${API_BASE_URL}/admin/auctions/flagged`, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });
    return this.handleResponse(response);
  }

  /**
   * Remove an auction
   * @param {number} auctionId - Auction ID
   * @param {string} reason - Reason for removal
   * @param {string} token - JWT token
   * @returns {Promise<Object>} Success message
   */
  async removeAuction(auctionId, reason, token) {
    const response = await fetch(`${API_BASE_URL}/admin/auctions/${auctionId}/remove`, {
      method: 'PUT',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify({ reason }),
    });
    return this.handleResponse(response);
  }
}

// Export singleton instance
export const adminApi = new AdminApi();
export default adminApi;
