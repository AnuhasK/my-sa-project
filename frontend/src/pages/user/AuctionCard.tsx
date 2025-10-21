import { Clock, Eye, Heart } from 'lucide-react';
import { Button } from '../../components/button';
import { Badge } from '../../components/badge';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

interface AuctionCardProps {
  id: string;
  title: string;
  currentBid: number;
  timeLeft: string;
  imageUrl: string;
  views: number;
  category: string;
  status?: string;
  isEnding?: boolean;
  onClick?: () => void;
}

export function AuctionCard({
  id,
  title,
  currentBid,
  timeLeft,
  imageUrl,
  views,
  category,
  status,
  isEnding = false,
  onClick
}: AuctionCardProps) {
  const { isAuthenticated, token, user } = useAuth();
  const [isWatched, setIsWatched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [watchersCount, setWatchersCount] = useState(0);
  
  console.log(`🏷️ AuctionCard rendered for auction ${id}, isAuthenticated: ${isAuthenticated}`);

  // Check if auction is in watchlist on component mount
  useEffect(() => {
    const checkWatchlistStatus = async () => {
      if (isAuthenticated && token) {
        try {
          const watched = await api.checkWatchlist(id, token);
          setIsWatched(watched);
        } catch (error) {
          console.error('Error checking watchlist status:', error);
        }
      }
    };

    const fetchWatchersCount = async () => {
      try {
        const count = await api.getWatchersCount(id);
        setWatchersCount(count);
      } catch (error) {
        console.error('Error fetching watchers count:', error);
      }
    };

    checkWatchlistStatus();
    fetchWatchersCount();
  }, [id, isAuthenticated, token]);

  const handleHeartClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    console.log('🎯 Heart button clicked!');
    
    // Get fresh token from localStorage
    const currentToken = localStorage.getItem('token');
    
    console.log('Auth check:', { 
      hasLocalStorageToken: !!currentToken,
      contextToken: !!token, 
      isAuthenticated,
      hasUser: !!user
    });
    
    if (!currentToken) {
      console.log('❌ No token in localStorage');
      alert('Please log in to add items to your watchlist');
      return;
    }
    
    console.log('✅ Token found, proceeding with API call');

    setIsLoading(true);
    try {
      if (isWatched) {
        console.log(`Removing auction ${id} from watchlist`);
        await api.removeFromWatchlist(id, currentToken);
        setIsWatched(false);
        setWatchersCount(prev => Math.max(0, prev - 1));
        console.log('✅ Removed from watchlist');
      } else {
        console.log(`Adding auction ${id} to watchlist`);
        await api.addToWatchlist(id, currentToken);
        setIsWatched(true);
        setWatchersCount(prev => prev + 1);
        console.log('✅ Added to watchlist');
      }
    } catch (error) {
      console.error('❌ Error toggling watchlist:', error);
      alert('Failed to update watchlist. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer"
      onClick={onClick}
    >
      <div className="relative">
        {imageUrl && imageUrl !== '/img/placeholder-auction.jpg' ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-48 object-cover"
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div 
          className={`w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center text-gray-500 ${
            imageUrl && imageUrl !== '/img/placeholder-auction.jpg' ? 'hidden' : ''
          }`}
        >
          <div className="text-4xl mb-2">🏛️</div>
          <div className="text-sm text-center px-4">Auction Item</div>
        </div>
        {isEnding && (
          <Badge className="absolute top-3 left-3 bg-red-600 text-white">
            Ending Soon
          </Badge>
        )}
        <div 
          className="absolute top-3 right-3 flex items-center space-x-2 z-20"
          onClick={(e) => e.stopPropagation()}
          style={{ pointerEvents: 'auto' }}
        >
          <button
            type="button"
            onClick={handleHeartClick}
            onMouseEnter={() => console.log('🖱️ Mouse entered heart button')}
            disabled={isLoading}
            className={`p-2 rounded-full transition-all duration-200 relative ${
              isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 cursor-pointer'
            } ${
              isWatched 
                ? 'bg-red-500 text-white' 
                : 'bg-black/60 text-white hover:bg-black/80'
            }`}
            style={{ pointerEvents: 'auto' }}
            title={isWatched ? 'Remove from watchlist' : 'Add to watchlist'}
          >
            <Heart 
              className={`w-4 h-4 ${isWatched ? 'fill-current' : ''}`}
            />
          </button>
          <div className="bg-black/60 text-white px-2 py-1 rounded text-xs flex items-center space-x-1">
            <Eye className="w-3 h-3" />
            <span>{views}</span>
          </div>
        </div>
      </div>
      
      <div className="p-4 space-y-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {category}
            </Badge>
            {status && (
              <Badge 
                className={`text-xs ${
                  status === 'Open' ? 'bg-green-100 text-green-800' :
                  status === 'Closed' ? 'bg-gray-100 text-gray-800' :
                  status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}
              >
                {status}
              </Badge>
            )}
          </div>
          <h3 className="font-medium text-gray-900 line-clamp-2 leading-tight">
            {title}
          </h3>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Current Bid</span>
            <span className="font-semibold text-gray-900">
              ${currentBid.toLocaleString()}
            </span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{timeLeft}</span>
          </div>
        </div>
        
        <Button 
          className="w-full mt-3 bg-black text-white hover:bg-gray-800"
          size="sm"
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            onClick?.();
          }}
        >
          View Details
        </Button>
      </div>
    </div>
  );
}