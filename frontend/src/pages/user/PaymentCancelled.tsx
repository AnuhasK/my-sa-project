import { XCircle } from 'lucide-react';
import { Button } from '../../components/button';
import { Card, CardContent } from '../../components/card';

interface PaymentCancelledProps {
  setCurrentPage: (page: string) => void;
}

export function PaymentCancelled({ setCurrentPage }: PaymentCancelledProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="text-center py-12 px-6">
          <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Cancelled</h1>
          <p className="text-gray-600 mb-6">
            Your payment was cancelled. No charges have been made to your account.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            You can try again anytime from your dashboard's "Won Items" tab.
          </p>
          <div className="flex flex-col space-y-3">
            <Button 
              className="bg-black text-white hover:bg-gray-800"
              onClick={() => setCurrentPage('dashboard')}
            >
              Return to Dashboard
            </Button>
            <Button 
              variant="outline"
              onClick={() => setCurrentPage('auctions')}
            >
              Browse Auctions
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
