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

  // Notifications endpoints (when implemented)
  async getNotifications(token) {
    const response = await fetch(`${API_BASE_URL}/notifications`, {
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
    return this.handleResponse(response);
  }

  async getWatchersCount(auctionId) {
    const response = await fetch(`${API_BASE_URL}/watchlist/watchers/${auctionId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
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