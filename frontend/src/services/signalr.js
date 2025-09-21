// SignalR service for real-time bidding functionality

import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

class SignalRService {
  constructor() {
    this.connection = null;
    this.isConnected = false;
    this.eventHandlers = new Map();
  }

  async start(token = null) {
    try {
      const hubUrl = import.meta.env.VITE_SIGNALR_URL || 'http://localhost:5000/auctionHub';
      
      const connectionBuilder = new HubConnectionBuilder()
        .withUrl(hubUrl, {
          ...(token && {
            accessTokenFactory: () => token
          })
        })
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Information);

      this.connection = connectionBuilder.build();

      // Set up event handlers
      this.setupEventHandlers();

      await this.connection.start();
      this.isConnected = true;
      console.log('SignalR Connected successfully');

      return true;
    } catch (error) {
      console.error('SignalR Connection Error:', error);
      this.isConnected = false;
      return false;
    }
  }

  async stop() {
    if (this.connection) {
      try {
        await this.connection.stop();
        this.isConnected = false;
        console.log('SignalR Disconnected');
      } catch (error) {
        console.error('Error stopping SignalR connection:', error);
      }
    }
  }

  setupEventHandlers() {
    if (!this.connection) return;

    // Handle connection events
    this.connection.onreconnecting(() => {
      console.log('SignalR Reconnecting...');
      this.isConnected = false;
    });

    this.connection.onreconnected(() => {
      console.log('SignalR Reconnected');
      this.isConnected = true;
    });

    this.connection.onclose(() => {
      console.log('SignalR Connection Closed');
      this.isConnected = false;
    });
  }

  // Auction Group Management
  async joinAuctionGroup(auctionId) {
    if (this.connection && this.isConnected) {
      try {
        await this.connection.invoke('JoinAuctionGroup', auctionId.toString());
        console.log(`Joined auction group: ${auctionId}`);
      } catch (error) {
        console.error('Error joining auction group:', error);
      }
    }
  }

  async leaveAuctionGroup(auctionId) {
    if (this.connection && this.isConnected) {
      try {
        await this.connection.invoke('LeaveAuctionGroup', auctionId.toString());
        console.log(`Left auction group: ${auctionId}`);
      } catch (error) {
        console.error('Error leaving auction group:', error);
      }
    }
  }

  // Event Listeners
  onBidPlaced(callback) {
    if (this.connection) {
      this.connection.on('BidPlaced', (bidData) => {
        console.log('New bid received:', bidData);
        callback(bidData);
      });
    }
  }

  onAuctionEnded(callback) {
    if (this.connection) {
      this.connection.on('AuctionEnded', (auctionData) => {
        console.log('Auction ended:', auctionData);
        callback(auctionData);
      });
    }
  }

  onAuctionUpdated(callback) {
    if (this.connection) {
      this.connection.on('AuctionUpdated', (auctionData) => {
        console.log('Auction updated:', auctionData);
        callback(auctionData);
      });
    }
  }

  onUserJoined(callback) {
    if (this.connection) {
      this.connection.on('UserJoined', (userData) => {
        console.log('User joined auction:', userData);
        callback(userData);
      });
    }
  }

  onUserLeft(callback) {
    if (this.connection) {
      this.connection.on('UserLeft', (userData) => {
        console.log('User left auction:', userData);
        callback(userData);
      });
    }
  }

  // Remove event listeners
  offBidPlaced() {
    if (this.connection) {
      this.connection.off('BidPlaced');
    }
  }

  offAuctionEnded() {
    if (this.connection) {
      this.connection.off('AuctionEnded');
    }
  }

  offAuctionUpdated() {
    if (this.connection) {
      this.connection.off('AuctionUpdated');
    }
  }

  offUserJoined() {
    if (this.connection) {
      this.connection.off('UserJoined');
    }
  }

  offUserLeft() {
    if (this.connection) {
      this.connection.off('UserLeft');
    }
  }

  // Utility methods
  getConnectionState() {
    if (!this.connection) return 'Disconnected';
    return this.connection.state;
  }

  isConnectionActive() {
    return this.isConnected && this.connection && this.connection.state === 'Connected';
  }

  // Send custom messages (if needed for future features)
  async sendMessage(methodName, ...args) {
    if (this.connection && this.isConnected) {
      try {
        return await this.connection.invoke(methodName, ...args);
      } catch (error) {
        console.error(`Error invoking ${methodName}:`, error);
        throw error;
      }
    }
    throw new Error('SignalR connection not available');
  }
}

// Create and export a singleton instance
export const signalRService = new SignalRService();
export default signalRService;