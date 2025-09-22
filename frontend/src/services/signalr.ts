// SignalR service for real-time bidding functionality

import { HubConnectionBuilder, LogLevel, HubConnection } from '@microsoft/signalr';

class SignalRService {
  private connection: HubConnection | null = null;
  private isConnected: boolean = false;
  private eventHandlers: Map<string, any> = new Map();

  async start(token?: string | null): Promise<boolean> {
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

  async stop(): Promise<void> {
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

  private setupEventHandlers(): void {
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
  async joinAuctionGroup(auctionId: number | string): Promise<void> {
    if (this.connection && this.isConnected) {
      try {
        await this.connection.invoke('JoinAuctionGroup', auctionId.toString());
        console.log(`Joined auction group: ${auctionId}`);
      } catch (error) {
        console.error('Error joining auction group:', error);
      }
    }
  }

  async leaveAuctionGroup(auctionId: number | string): Promise<void> {
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
  onBidPlaced(callback: (bidData: any) => void): void {
    if (this.connection) {
      this.connection.on('BidPlaced', (bidData) => {
        console.log('New bid received:', bidData);
        callback(bidData);
      });
    }
  }

  onAuctionEnded(callback: (auctionData: any) => void): void {
    if (this.connection) {
      this.connection.on('AuctionEnded', (auctionData) => {
        console.log('Auction ended:', auctionData);
        callback(auctionData);
      });
    }
  }

  onAuctionUpdated(callback: (auctionData: any) => void): void {
    if (this.connection) {
      this.connection.on('AuctionUpdated', (auctionData) => {
        console.log('Auction updated:', auctionData);
        callback(auctionData);
      });
    }
  }

  onUserJoined(callback: (userData: any) => void): void {
    if (this.connection) {
      this.connection.on('UserJoined', (userData) => {
        console.log('User joined auction:', userData);
        callback(userData);
      });
    }
  }

  onUserLeft(callback: (userData: any) => void): void {
    if (this.connection) {
      this.connection.on('UserLeft', (userData) => {
        console.log('User left auction:', userData);
        callback(userData);
      });
    }
  }

  // Remove event listeners
  offBidPlaced(): void {
    if (this.connection) {
      this.connection.off('BidPlaced');
    }
  }

  offAuctionEnded(): void {
    if (this.connection) {
      this.connection.off('AuctionEnded');
    }
  }

  offAuctionUpdated(): void {
    if (this.connection) {
      this.connection.off('AuctionUpdated');
    }
  }

  offUserJoined(): void {
    if (this.connection) {
      this.connection.off('UserJoined');
    }
  }

  offUserLeft(): void {
    if (this.connection) {
      this.connection.off('UserLeft');
    }
  }

  // Utility methods
  getConnectionState(): string {
    if (!this.connection) return 'Disconnected';
    return this.connection.state;
  }

  isConnectionActive(): boolean {
    return this.isConnected && this.connection !== null && this.connection.state === 'Connected';
  }

  // Send custom messages (if needed for future features)
  async sendMessage(methodName: string, ...args: any[]): Promise<any> {
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