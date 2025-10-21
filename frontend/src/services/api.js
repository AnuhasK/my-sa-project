// API service for connecting React frontend to ASP.NET backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  // Helper method to get auth headers
  getAuthHeaders(token) {
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  // Helper method to handle API responses
  async handleResponse(response) {
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', response.status, errorText);
      throw new Error(errorText || `HTTP ${response.status}: API request failed`);
    }
    return response.json();
  }

  // Authentication endpoints
  async login(credentials) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(credentials),
    });
    const data = await this.handleResponse(response);
    
    // Transform backend response to frontend format
    if (data.userId && data.username && data.token) {
      return {
        token: data.token,
        user: {
          id: data.userId,
          username: data.username
        }
      };
    }
    return data;
  }

  async register(userData) {
    // Convert userName to Username for backend compatibility
    const requestData = {
      Username: userData.userName,
      Email: userData.email,
      Password: userData.password
    };
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(requestData),
      });
      
      const data = await this.handleResponse(response);
      
      // Transform backend response to frontend format
      if (data.userId && data.username && data.token) {
        return {
          token: data.token,
          user: {
            id: data.userId,
            username: data.username
          }
        };
      }
      return data;
    } catch (error) {
      console.error('Registration request failed:', error);
      throw error;
    }
  }

  async logout(token) {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
    });
    return this.handleResponse(response);
  }

  async getCurrentUser(token) {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });
    return this.handleResponse(response);
  }

  async updateProfile(profileData, token) {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(profileData),
    });
    return this.handleResponse(response);
  }

  async changePassword(passwordData, token) {
    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(passwordData),
    });
    return this.handleResponse(response);
  }

  async updateProfileImage(imageUrl, token) {
    const response = await fetch(`${API_BASE_URL}/auth/profile-image`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(imageUrl),
    });
    return this.handleResponse(response);
  }

  // User statistics endpoints
  async getUserStats(token) {
    const response = await fetch(`${API_BASE_URL}/users/stats`, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });
    return this.handleResponse(response);
  }

  async getUserActiveBids(token) {
    const response = await fetch(`${API_BASE_URL}/users/active-bids`, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });
    return this.handleResponse(response);
  }

  async getUserWonAuctions(token) {
    const response = await fetch(`${API_BASE_URL}/users/won-auctions`, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });
    return this.handleResponse(response);
  }

  // Auction endpoints
  async getAuctions(filters = {}) {
    const params = new URLSearchParams();
    
    // Add filter parameters if provided
    if (filters.search) params.append('search', filters.search);
    if (filters.categoryId) params.append('categoryId', filters.categoryId);
    if (filters.status) params.append('status', filters.status);
    if (filters.minPrice) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    
    // Keep backward compatibility with pagination
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const url = params.toString() ? `${API_BASE_URL}/auctions?${params}` : `${API_BASE_URL}/auctions`;
    const response = await fetch(url);
    return this.handleResponse(response);
  }

  async getAuction(id) {
    const response = await fetch(`${API_BASE_URL}/auctions/${id}`);
    return this.handleResponse(response);
  }

  async createAuction(auctionData, token) {
    const response = await fetch(`${API_BASE_URL}/auctions`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(auctionData),
    });
    return this.handleResponse(response);
  }

  async updateAuction(id, auctionData, token) {
    const response = await fetch(`${API_BASE_URL}/auctions/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(auctionData),
    });
    return this.handleResponse(response);
  }

  async deleteAuction(id, token) {
    const response = await fetch(`${API_BASE_URL}/auctions/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(token),
    });
    return this.handleResponse(response);
  }

  async closeAuction(id, token) {
    const response = await fetch(`${API_BASE_URL}/auctions/${id}/close`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Failed to close auction`);
    }
    return response.status === 204 ? { success: true } : this.handleResponse(response);
  }

  async getUserAuctions(token) {
    const response = await fetch(`${API_BASE_URL}/auctions/my-auctions`, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });
    return this.handleResponse(response);
  }

  // Bid endpoints
  async placeBid(auctionId, amount, token) {
    const response = await fetch(`${API_BASE_URL}/bids`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify({ auctionId, amount }),
    });
    return this.handleResponse(response);
  }

  async getBidsForAuction(auctionId) {
    const response = await fetch(`${API_BASE_URL}/bids/auction/${auctionId}`);
    return this.handleResponse(response);
  }

  async getUserBids(token) {
    const response = await fetch(`${API_BASE_URL}/bids/my-bids`, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });
    return this.handleResponse(response);
  }

  // Image upload endpoints
  async uploadAuctionImage(auctionId, imageFile, isPrimary = false, token) {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('isPrimary', isPrimary.toString());

    const response = await fetch(`${API_BASE_URL}/auctions/${auctionId}/images`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    return this.handleResponse(response);
  }

  async addAuctionImageByUrl(auctionId, imageUrl, token) {
    const response = await fetch(`${API_BASE_URL}/auctions/${auctionId}/images/url`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify({ url: imageUrl }),
    });
    return this.handleResponse(response);
  }

  async deleteAuctionImage(auctionId, imageId, token) {
    const response = await fetch(`${API_BASE_URL}/auctions/${auctionId}/images/${imageId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(token),
    });
    return this.handleResponse(response);
  }

  // Transaction endpoints
  async getBuyerTransactions(token) {
    const response = await fetch(`${API_BASE_URL}/transactions/buyer`, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });
    return this.handleResponse(response);
  }

  async getSellerTransactions(token) {
    const response = await fetch(`${API_BASE_URL}/transactions/seller`, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });
    return this.handleResponse(response);
  }

  async getTransaction(id, token) {
    const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });
    return this.handleResponse(response);
  }

  // Payment endpoints
  async createCheckoutSession(transactionId, token) {
    const response = await fetch(`${API_BASE_URL}/payments/create-checkout-session/${transactionId}`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
    });
    return this.handleResponse(response);
  }

  async createTransaction(auctionId, buyerId, amount, token) {
    const response = await fetch(`${API_BASE_URL}/transactions`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify({ auctionId, buyerId, amount }),
    });
    return this.handleResponse(response);
  }

  async updatePaymentStatus(transactionId, paymentStatus, token) {
    const response = await fetch(`${API_BASE_URL}/transactions/${transactionId}/payment-status`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify({ paymentStatus }),
    });
    return this.handleResponse(response);
  }

  // Categories endpoints (when implemented)
  async getCategories() {
    const response = await fetch(`${API_BASE_URL}/categories`);
    return this.handleResponse(response);
  }

  // Notifications endpoints
  async getNotifications(token, pageNumber = 1, pageSize = 10, isRead = null) {
    let url = `${API_BASE_URL}/notifications?pageNumber=${pageNumber}&pageSize=${pageSize}`;
    if (isRead !== null) {
      url += `&isRead=${isRead}`;
    }
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });
    return this.handleResponse(response);
  }

  async getUnreadCount(token) {
    const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });
    return this.handleResponse(response);
  }

  async markNotificationAsRead(id, token) {
    const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
      method: 'PUT',
      headers: this.getAuthHeaders(token),
    });
    return this.handleResponse(response);
  }

  async markAllNotificationsAsRead(token) {
    const response = await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
      method: 'PUT',
      headers: this.getAuthHeaders(token),
    });
    return this.handleResponse(response);
  }

  async deleteNotification(id, token) {
    const response = await fetch(`${API_BASE_URL}/notifications/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(token),
    });
    return this.handleResponse(response);
  }

  // Image upload endpoints
  async uploadImage(file, token) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/images/upload`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
        // Don't set Content-Type, let browser set it for FormData
      },
      body: formData,
    });
    return this.handleResponse(response);
  }

  async deleteImage(fileName, token) {
    const response = await fetch(`${API_BASE_URL}/images/${fileName}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(token),
    });
    return this.handleResponse(response);
  }

  // Category endpoints
  async getCategories() {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getCategory(id) {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Watchlist endpoints
  async addToWatchlist(auctionId, token) {
    const response = await fetch(`${API_BASE_URL}/watchlist/${auctionId}`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
    });
    return this.handleResponse(response);
  }

  async removeFromWatchlist(auctionId, token) {
    const response = await fetch(`${API_BASE_URL}/watchlist/${auctionId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(token),
    });
    return this.handleResponse(response);
  }

  async getWatchlist(token) {
    const response = await fetch(`${API_BASE_URL}/watchlist`, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });
    return this.handleResponse(response);
  }

  async checkWatchlist(auctionId, token) {
    const response = await fetch(`${API_BASE_URL}/watchlist/check/${auctionId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });
    const data = await this.handleResponse(response);
    // Backend returns { auctionId, isInWatchlist }, extract the boolean
    return data.isInWatchlist;
  }

  async getWatchersCount(auctionId) {
    const response = await fetch(`${API_BASE_URL}/watchlist/watchers/${auctionId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    const data = await this.handleResponse(response);
    // Backend returns { auctionId, watchersCount }, extract the count
    return data.watchersCount;
  }

  // Transaction management endpoints
  async getAllTransactions(token) {
    const response = await fetch(`${API_BASE_URL}/transactions`, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });
    return this.handleResponse(response);
  }

  async updateShippingInfo(transactionId, shippingData, token) {
    const response = await fetch(`${API_BASE_URL}/transactions/${transactionId}/shipping`, {
      method: 'PUT',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(shippingData),
    });
    return this.handleResponse(response);
  }

  async updateTransactionStatus(transactionId, status, token) {
    const response = await fetch(`${API_BASE_URL}/transactions/${transactionId}/payment-status`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify({ paymentStatus: status }),
    });
    return this.handleResponse(response);
  }

  // Mark transaction as shipped (admin only)
  async markAsShipped(transactionId, shippingInfo, token) {
    const response = await fetch(`${API_BASE_URL}/transactions/${transactionId}/shipping`, {
      method: 'PUT',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(shippingInfo),
    });
    return this.handleResponse(response);
  }

  // Helper method to get image URL
  getImageUrl(imagePath) {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_BASE_URL.replace('/api', '')}${imagePath}`;
  }
}

export const api = new ApiService();
export default api;