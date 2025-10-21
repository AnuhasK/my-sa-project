import { useState, useEffect } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Textarea } from './textarea';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { ImageUpload } from './ImageUpload';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  description?: string;
}

interface CreateAuctionFormProps {
  onAuctionCreated?: () => void;
  onCancel?: () => void;
}

export function CreateAuctionForm({ onAuctionCreated, onCancel }: CreateAuctionFormProps) {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    startPrice: '',
    startTime: '',
    endTime: ''
  });
  const [images, setImages] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const data = await api.getCategories();
        setCategories(data);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories');
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

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
      if (!formData.title || !formData.description || !formData.categoryId || !formData.startPrice || !formData.startTime || !formData.endTime) {
        throw new Error('Please fill in all required fields including category');
      }

      // Validate field lengths (match backend validation)
      if (formData.title.length < 5 || formData.title.length > 100) {
        throw new Error('Title must be between 5 and 100 characters');
      }

      if (formData.description.length < 20 || formData.description.length > 1000) {
        throw new Error('Description must be between 20 and 1000 characters');
      }

      // Validate start price
      const startPrice = parseFloat(formData.startPrice);
      if (startPrice <= 0) {
        throw new Error('Start price must be greater than 0');
      }

      // Validate times
      const now = new Date();
      const startTime = new Date(formData.startTime);
      const endTime = new Date(formData.endTime);

      if (startTime <= now) {
        throw new Error('Start time must be in the future');
      }

      if (endTime <= startTime) {
        throw new Error('End time must be after start time');
      }

      const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      if (durationHours < 1) {
        throw new Error('Auction must run for at least 1 hour');
      }

      // Create auction data
      const auctionData = {
        title: formData.title,
        description: formData.description,
        categoryId: parseInt(formData.categoryId),
        startPrice: startPrice,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString()
      };

      // Create the auction
      const auction = await api.createAuction(auctionData, token);
      
      console.log('Auction created:', auction);
      
      // Associate uploaded images with the auction
      if (images.length > 0) {
        console.log(`Associating ${images.length} images with auction...`);
        for (let i = 0; i < images.length; i++) {
          const imageUrl = images[i];
          try {
            await api.addAuctionImageByUrl(auction.id, imageUrl, token);
            console.log(`Image ${i + 1} associated successfully`);
          } catch (imgError) {
            console.error(`Failed to associate image ${i + 1}:`, imgError);
            // Continue with other images even if one fails
          }
        }
        console.log('All images associated');
      }
      
      alert('Auction created successfully!');
      onAuctionCreated?.();
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        categoryId: '',
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
                Title * <span className="text-xs text-gray-500 font-normal">(5-100 characters)</span>
              </label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter auction title"
                minLength={5}
                maxLength={100}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.title.length}/100 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description * <span className="text-xs text-gray-500 font-normal">(20-1000 characters)</span>
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the item in detail (minimum 20 characters)"
                rows={4}
                minLength={20}
                maxLength={1000}
                required
              />
              <p className={`text-xs mt-1 ${formData.description.length < 20 ? 'text-red-600' : 'text-gray-500'}`}>
                {formData.description.length}/1000 characters {formData.description.length < 20 && `(${20 - formData.description.length} more needed)`}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              {loadingCategories ? (
                <div className="flex items-center space-x-2 text-gray-500 py-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Loading categories...</span>
                </div>
              ) : (
                <Select
                  value={formData.categoryId}
                  onValueChange={(value: string) => handleInputChange('categoryId', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {categories.length === 0 && !loadingCategories && (
                <p className="text-sm text-red-600 mt-1">No categories available. Please contact support.</p>
              )}
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
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {loading ? 'Creating Auction...' : 'Create Auction'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}