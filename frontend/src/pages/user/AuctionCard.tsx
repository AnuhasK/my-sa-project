import { Clock, Eye } from 'lucide-react';
import { Button } from '../../components/button';
import { Badge } from '../../components/badge';

interface AuctionCardProps {
  id: string;
  title: string;
  currentBid: number;
  timeLeft: string;
  imageUrl: string;
  views: number;
  category: string;
  isEnding?: boolean;
  onClick?: () => void;
}

export function AuctionCard({
  title,
  currentBid,
  timeLeft,
  imageUrl,
  views,
  category,
  isEnding = false,
  onClick
}: AuctionCardProps) {
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
        <div className="absolute top-3 right-3 bg-black/60 text-white px-2 py-1 rounded text-xs flex items-center space-x-1">
          <Eye className="w-3 h-3" />
          <span>{views}</span>
        </div>
      </div>
      
      <div className="p-4 space-y-3">
        <div className="space-y-2">
          <Badge variant="secondary" className="text-xs">
            {category}
          </Badge>
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