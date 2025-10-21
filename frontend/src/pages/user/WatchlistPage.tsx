import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { AuctionCard } from './AuctionCard';
import { Heart, AlertCircle } from 'lucide-react';

interface WatchlistAuction {
  id: number;  // Watchlist entry ID
  auctionId: number;  // Actual auction ID
  title: string;
  description: string;
  startingPrice: number;
  currentBid: number;
  endDate: string;
  imageUrl: string;
  categoryName: string;
  status: string;
  totalBids: number;
  addedToWatchlistDate: string;
  isEnding: boolean;
}

interface WatchlistPageProps {
  setCurrentPage: (page: string) => void;
  setSelectedAuction: (id: string) => void;
}

export function WatchlistPage({ setCurrentPage, setSelectedAuction }: WatchlistPageProps) {
  const { user, token } = useAuth();
  const [auctions, setAuctions] = useState<WatchlistAuction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || !token) {
      setCurrentPage('login');
      return;
    }

    const fetchWatchlist = async () => {
      try {
        setLoading(true);
        const data = await api.getWatchlist(token);
        setAuctions(data);
      } catch (err: any) {
        console.error('Error fetching watchlist:', err);
        setError(err.message || 'Failed to load watchlist');
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlist();
  }, [user, token, setCurrentPage]);

  const calculateTimeLeft = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your watchlist...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Watchlist</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Heart className="w-8 h-8 text-red-500 fill-current" />
            <h1 className="text-3xl font-bold text-gray-900">My Watchlist</h1>
          </div>
          <p className="text-gray-600">
            {auctions.length === 0 
              ? 'No items in your watchlist yet' 
              : `You're watching ${auctions.length} ${auctions.length === 1 ? 'item' : 'items'}`
            }
          </p>
        </div>

        {auctions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">Your watchlist is empty</h2>
            <p className="text-gray-500 mb-6">
              Start adding items to your watchlist by clicking the heart icon on auctions you're interested in.
            </p>
            <button
              onClick={() => setCurrentPage('auctions')}
              className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Browse Auctions
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {auctions.map((auction) => (
              <AuctionCard
                key={auction.id}
                id={auction.auctionId.toString()}
                title={auction.title}
                currentBid={auction.currentBid}
                timeLeft={calculateTimeLeft(auction.endDate)}
                imageUrl={auction.imageUrl || '/img/placeholder-auction.jpg'}
                views={auction.totalBids}
                category={auction.categoryName || 'Uncategorized'}
                status={auction.status}
                isEnding={auction.isEnding}
                onClick={() => {
                  setSelectedAuction(auction.auctionId.toString());
                  setCurrentPage('auction-details');
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
