import { useState } from 'react';
import { ArrowLeft, Heart, Share2, Eye, User, MapPin, Clock, Gavel, Shield, TrendingUp } from 'lucide-react';
import { Button } from '../../components/button';
import { Input } from '../../components/input';
import { Badge } from '../../components/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/card';
import { CountdownTimer } from './CountdownTimer';

interface AuctionDetailsPageProps {
  auctionId: string;
  setCurrentPage: (page: string) => void;
}

export function AuctionDetailsPage({ auctionId, setCurrentPage }: AuctionDetailsPageProps) {
  const [bidAmount, setBidAmount] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWatching, setIsWatching] = useState(false);

  // Mock auction data
  const auction = {
    id: auctionId,
    title: 'Vintage Omega Speedmaster Professional Moonwatch',
    currentBid: 2850,
    minBid: 2900,
    buyNowPrice: 4200,
    timeLeft: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000), // 2d 14h from now
    images: [
      'https://images.unsplash.com/photo-1695528589305-5103f5c52306?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwd2F0Y2glMjBsdXh1cnklMjBhdWN0aW9ufGVufDF8fHx8MTc1NzUwMDE3Nnww&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1695528589305-5103f5c52306?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwd2F0Y2glMjBsdXh1cnklMjBhdWN0aW9ufGVufDF8fHx8MTc1NzUwMDE3Nnww&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1695528589305-5103f5c52306?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwd2F0Y2glMjBsdXh1cnklMjBhdWN0aW9ufGVufDF8fHx8MTc1NzUwMDE3Nnww&ixlib=rb-4.1.0&q=80&w=1080'
    ],
    category: 'Watches',
    condition: 'Very Good',
    views: 1247,
    watchers: 89,
    bids: 23,
    description: `This exceptional Omega Speedmaster Professional is a true collector's piece. Known as the "Moonwatch," this timepiece has a rich history and remains one of the most iconic chronographs ever made.

    Key Features:
    • Authentic Omega Speedmaster Professional
    • Manual wind movement 
    • Hesalite crystal (original specification)
    • Stainless steel case and bracelet
    • Black dial with luminous markers
    • Tachymeter bezel
    • Water resistant to 50m

    This particular example shows honest wear consistent with its age but has been well-maintained. The movement keeps excellent time and all chronograph functions operate smoothly. Original box and papers are not included, but authenticity is guaranteed.

    A perfect addition to any serious watch collection.`,
    seller: {
      name: 'TimeCollector',
      rating: 4.9,
      reviews: 147,
      memberSince: '2019',
      location: 'New York, NY',
      avatar: null
    },
    shipping: {
      cost: 25,
      methods: ['Standard Shipping', 'Express Shipping', 'International Available']
    }
  };

  const bidHistory = [
    { bidder: 'w***r', amount: 2850, time: '2 minutes ago' },
    { bidder: 'c***k', amount: 2800, time: '15 minutes ago' },
    { bidder: 'w***r', amount: 2750, time: '32 minutes ago' },
    { bidder: 'm***s', amount: 2700, time: '1 hour ago' },
    { bidder: 'c***k', amount: 2650, time: '2 hours ago' }
  ];

  const handlePlaceBid = () => {
    const bid = parseFloat(bidAmount);
    if (bid >= auction.minBid) {
      // Handle bid placement
      console.log('Placing bid:', bid);
      setBidAmount('');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => setCurrentPage('auctions')}
          className="mb-6 flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Auctions</span>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative">
                <img
                  src={auction.images[selectedImage]}
                  alt={auction.title}
                  className="w-full h-96 md:h-[500px] object-cover rounded-lg border border-gray-200"
                />
                <div className="absolute top-4 right-4 flex space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsWatching(!isWatching)}
                    className={`${isWatching ? 'bg-red-100 text-red-700' : 'bg-white/90'}`}
                  >
                    <Heart className={`w-4 h-4 ${isWatching ? 'fill-current' : ''}`} />
                  </Button>
                  <Button variant="secondary" size="sm" className="bg-white/90">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Thumbnail Images */}
              <div className="flex space-x-2">
                {auction.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 rounded-lg border-2 overflow-hidden ${
                      selectedImage === index ? 'border-black' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`View ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>

              {/* Item Details Tabs */}
              <Card className="mt-8">
                <Tabs defaultValue="description" className="w-full">
                  <CardHeader>
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="description">Description</TabsTrigger>
                      <TabsTrigger value="shipping">Shipping</TabsTrigger>
                      <TabsTrigger value="seller">Seller Info</TabsTrigger>
                    </TabsList>
                  </CardHeader>
                  <CardContent>
                    <TabsContent value="description" className="space-y-4">
                      <div className="prose prose-gray max-w-none">
                        <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                          {auction.description}
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="shipping" className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Shipping Cost:</span>
                          <span className="font-medium">${auction.shipping.cost}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 block mb-2">Available Methods:</span>
                          <ul className="space-y-1">
                            {auction.shipping.methods.map((method, index) => (
                              <li key={index} className="text-sm text-gray-700">• {method}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="seller" className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={auction.seller.avatar} />
                          <AvatarFallback className="bg-gray-200">
                            {auction.seller.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-gray-900">{auction.seller.name}</h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <span>⭐ {auction.seller.rating}</span>
                            <span>•</span>
                            <span>{auction.seller.reviews} reviews</span>
                          </div>
                          <div className="flex items-center space-x-1 text-sm text-gray-600 mt-1">
                            <MapPin className="w-3 h-3" />
                            <span>{auction.seller.location}</span>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </CardContent>
                </Tabs>
              </Card>
            </div>
          </div>

          {/* Right Column - Bidding */}
          <div className="space-y-6">
            {/* Auction Info Card */}
            <Card>
              <CardHeader>
                <div className="space-y-2">
                  <Badge variant="secondary" className="w-fit">
                    {auction.category}
                  </Badge>
                  <CardTitle className="text-xl leading-tight">{auction.title}</CardTitle>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{auction.views} views</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Heart className="w-4 h-4" />
                      <span>{auction.watchers} watching</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Bid */}
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Current Bid</div>
                  <div className="text-3xl font-bold text-gray-900">
                    ${auction.currentBid.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {auction.bids} bids
                  </div>
                </div>

                {/* Countdown Timer */}
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <div className="text-sm text-gray-600 mb-3">Time Remaining</div>
                  <CountdownTimer endTime={auction.timeLeft} />
                </div>

                {/* Bidding Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Minimum bid:</span>
                    <span className="font-medium">${auction.minBid.toLocaleString()}</span>
                  </div>
                  
                  <div className="space-y-3">
                    <Input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder={`Enter $${auction.minBid} or more`}
                      className="text-center text-lg font-medium"
                    />
                    <Button 
                      onClick={handlePlaceBid}
                      className="w-full bg-black text-white hover:bg-gray-800 py-3"
                      disabled={!bidAmount || parseFloat(bidAmount) < auction.minBid}
                    >
                      <Gavel className="w-4 h-4 mr-2" />
                      Place Bid
                    </Button>
                  </div>

                  {auction.buyNowPrice && (
                    <Button 
                      variant="outline"
                      className="w-full border-gray-300 py-3"
                    >
                      Buy Now - ${auction.buyNowPrice.toLocaleString()}
                    </Button>
                  )}
                </div>

                <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 pt-4 border-t">
                  <Shield className="w-4 h-4" />
                  <span>Secure bidding with buyer protection</span>
                </div>
              </CardContent>
            </Card>

            {/* Bid History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Bid History</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {bidHistory.map((bid, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-gray-200 text-xs">
                            {bid.bidder.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">{bid.bidder}</div>
                          <div className="text-xs text-gray-500">{bid.time}</div>
                        </div>
                      </div>
                      <div className="font-semibold text-gray-900">
                        ${bid.amount.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Seller Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Seller</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback className="bg-gray-200">
                      {auction.seller.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{auction.seller.name}</div>
                    <div className="text-sm text-gray-600">
                      ⭐ {auction.seller.rating} • {auction.seller.reviews} reviews
                    </div>
                    <div className="text-xs text-gray-500">
                      Member since {auction.seller.memberSince}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}