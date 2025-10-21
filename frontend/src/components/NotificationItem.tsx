import { Bell, DollarSign, Gavel, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface NotificationItemProps {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  onMarkAsRead: (id: number) => void;
  onDelete: (id: number) => void;
  onClick?: () => void;
}

export function NotificationItem({
  id,
  type,
  title,
  message,
  isRead,
  createdAt,
  onMarkAsRead,
  onDelete,
  onClick
}: NotificationItemProps) {
  const getIcon = () => {
    switch (type) {
      case 'BidPlaced':
        return <Gavel className="w-4 h-4 text-blue-600" />;
      case 'BidOutbid':
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
      case 'AuctionEnding':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'AuctionWon':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'AuctionLost':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'TransactionCreated':
      case 'TransactionPaid':
        return <DollarSign className="w-4 h-4 text-green-600" />;
      case 'AuctionCreated':
      case 'AuctionSold':
        return <Gavel className="w-4 h-4 text-purple-600" />;
      case 'SystemMessage':
        return <Info className="w-4 h-4 text-gray-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const getBackgroundColor = () => {
    if (!isRead) {
      return 'bg-blue-50 hover:bg-blue-100';
    }
    return 'bg-white hover:bg-gray-50';
  };

  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true });

  return (
    <div
      className={`p-3 border-b border-gray-100 transition-colors cursor-pointer ${getBackgroundColor()}`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-1">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            {getIcon()}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className={`text-sm font-medium ${isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                {title}
              </p>
              <p className={`text-sm mt-1 ${isRead ? 'text-gray-500' : 'text-gray-600'}`}>
                {message}
              </p>
              <p className="text-xs text-gray-400 mt-1">{timeAgo}</p>
            </div>

            {/* Unread indicator */}
            {!isRead && (
              <div className="flex-shrink-0">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-2">
            {!isRead && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAsRead(id);
                }}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Mark as read
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(id);
              }}
              className="text-xs text-red-600 hover:text-red-700 font-medium"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
