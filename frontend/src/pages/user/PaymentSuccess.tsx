import { CheckCircle } from 'lucide-react';
import { Button } from '../../components/button';
import { Card, CardContent } from '../../components/card';
import { useEffect } from 'react';

interface PaymentSuccessProps {
  setCurrentPage: (page: string) => void;
}

export function PaymentSuccess({ setCurrentPage }: PaymentSuccessProps) {
  useEffect(() => {
    // You can fetch the session_id from URL params if needed
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    console.log('Payment successful, session ID:', sessionId);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="text-center py-12 px-6">
          <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for your payment. Your transaction has been completed successfully.
            You will receive a confirmation email shortly.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            The seller will prepare your item for shipping. You'll be notified once your item has been shipped.
          </p>
          <div className="flex flex-col space-y-3">
            <Button 
              className="bg-black text-white hover:bg-gray-800"
              onClick={() => setCurrentPage('dashboard')}
            >
              View My Dashboard
            </Button>
            <Button 
              variant="outline"
              onClick={() => setCurrentPage('auctions')}
            >
              Browse More Auctions
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
