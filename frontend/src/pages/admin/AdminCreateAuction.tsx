import { ArrowLeft } from 'lucide-react';
import { Button } from '../../components/button';
import { CreateAuctionForm } from '../../components/CreateAuctionForm';

interface AdminCreateAuctionProps {
  setCurrentPage: (page: string) => void;
}

export function AdminCreateAuction({ setCurrentPage }: AdminCreateAuctionProps) {
  const handleAuctionCreated = () => {
    // Show success message and redirect to auctions page
    alert('Auction created successfully!');
    setCurrentPage('admin-auctions');
  };

  const handleCancel = () => {
    setCurrentPage('admin-auctions');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage('admin-auctions')}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Auctions
          </Button>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Create New Auction</h1>
        <p className="text-gray-600 mt-1">Add a new auction to the platform</p>
      </div>

      {/* Create Auction Form */}
      <CreateAuctionForm
        onAuctionCreated={handleAuctionCreated}
        onCancel={handleCancel}
      />
    </div>
  );
}
