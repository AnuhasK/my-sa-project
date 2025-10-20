import { useState } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Textarea } from './textarea';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { ImageUpload } from './ImageUpload';
import { api } from '../services/api';

interface CreateAuctionFormProps {
  onAuctionCreated?: () => void;
  onCancel?: () => void;
}

export function CreateAuctionForm({ onAuctionCreated, onCancel }: CreateAuctionFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startPrice: '',
    startTime: '',
    endTime: ''
  });
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get user token (you might need to get this from your auth context)
  const token = localStorage.getItem('token'); // Adjust based on your auth implementation

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUploaded = (imageUrl: string) => {
    setImages(prev => [...prev, imageUrl]);
  };

  const handleImageRemoved = (imageUrl: string) => {
    setImages(prev => prev.filter(img => img !== imageUrl));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setError('You must be logged in to create an auction');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Validate required fields
      if (!formData.title || !formData.description || !formData.startPrice || !formData.startTime || !formData.endTime) {
        throw new Error('Please fill in all required fields');
      }

      // Create auction data
      const auctionData = {
        title: formData.title,
        description: formData.description,
        startPrice: parseFloat(formData.startPrice),
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString()
      };

      // Create the auction
      const auction = await api.createAuction(auctionData, token);
      
      // TODO: Add images to the auction (you might need to create an endpoint for this)
      // For now, we've uploaded the images but need to associate them with the auction
      
      console.log('Auction created:', auction);
      console.log('Images uploaded:', images);
      
      onAuctionCreated?.();
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        startPrice: '',
        startTime: '',
        endTime: ''
      });
      setImages([]);
      
    } catch (err: any) {
      console.error('Error creating auction:', err);
      setError(err.message || 'Failed to create auction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Auction</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter auction title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the item in detail"
                rows={4}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Starting Price * ($)
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.startPrice}
                onChange={(e) => handleInputChange('startPrice', e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time *
                </label>
                <Input
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => handleInputChange('startTime', e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time *
                </label>
                <Input
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => handleInputChange('endTime', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Images
            </label>
            <ImageUpload
              onImageUploaded={handleImageUploaded}
              onImageRemoved={handleImageRemoved}
              maxImages={5}
              existingImages={images}
              token={token || undefined}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-black text-white hover:bg-gray-800"
            >
              {loading ? 'Creating...' : 'Create Auction'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}