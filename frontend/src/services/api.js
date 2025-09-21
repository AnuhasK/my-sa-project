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
      const error = await response.text();
      throw new Error(error || 'API request failed');
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
    return this.handleResponse(response);
  }

  async register(userData) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    return this.handleResponse(response);
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
  async getAuctions(page = 1, limit = 10, category = null, search = null) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(category && { category }),
      ...(search && { search }),
    });

    const response = await fetch(`${API_BASE_URL}/auctions?${params}`);
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
  async getTransactions(token) {
    const response = await fetch(`${API_BASE_URL}/transactions`, {
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
}

export const api = new ApiService();
export default api;