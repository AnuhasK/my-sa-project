import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '../components/button';
import { api } from '../services/api';

interface ImageUploadProps {
  onImageUploaded?: (imageUrl: string) => void;
  onImageRemoved?: (imageUrl: string) => void;
  maxImages?: number;
  existingImages?: string[];
  token?: string;
}

export function ImageUpload({ 
  onImageUploaded, 
  onImageRemoved, 
  maxImages = 5, 
  existingImages = [],
  token 
}: ImageUploadProps) {
  const [images, setImages] = useState<string[]>(existingImages);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || !token) return;

    const remainingSlots = maxImages - images.length;
    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    for (const file of filesToUpload) {
      try {
        setUploading(true);
        const response = await api.uploadImage(file, token);
        const imageUrl = api.getImageUrl(response.imageUrl);
        
        setImages(prev => [...prev, imageUrl]);
        onImageUploaded?.(imageUrl);
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Failed to upload image. Please try again.');
      } finally {
        setUploading(false);
      }
    }
  };

  const handleRemoveImage = async (imageUrl: string) => {
    try {
      // Extract filename from URL for deletion
      const fileName = imageUrl.split('/').pop();
      if (fileName && token) {
        await api.deleteImage(fileName, token);
      }
      
      setImages(prev => prev.filter(img => img !== imageUrl));
      onImageRemoved?.(imageUrl);
    } catch (error) {
      console.error('Error removing image:', error);
      alert('Failed to remove image. Please try again.');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        } ${images.length >= maxImages ? 'opacity-50 pointer-events-none' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={images.length >= maxImages || uploading}
        />
        
        <div className="flex flex-col items-center space-y-2">
          <Upload className="w-8 h-8 text-gray-400" />
          <div className="text-sm text-gray-600">
            <span className="font-medium">Click to upload</span> or drag and drop
          </div>
          <div className="text-xs text-gray-500">
            PNG, JPG, GIF up to 5MB ({images.length}/{maxImages})
          </div>
        </div>
        
        <Button
          type="button"
          variant="outline"
          className="mt-3"
          onClick={() => fileInputRef.current?.click()}
          disabled={images.length >= maxImages || uploading}
        >
          {uploading ? 'Uploading...' : 'Select Images'}
        </Button>
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((imageUrl, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={imageUrl}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3QgeD0iMyIgeT0iMyIgd2lkdGg9IjE4IiBoZWlnaHQ9IjE4IiByeD0iMiIgc3Ryb2tlPSIjOTMzQkY0IiBzdHJva2Utd2lkdGg9IjIiLz4KPGNpcmNsZSBjeD0iOC41IiBjeT0iOC41IiByPSIxLjUiIGZpbGw9IiM5MzNCRjQiLz4KPHBhdGggZD0ibTIxIDIxLTE1LTE1IDUgNSIgc3Ryb2tlPSIjOTMzQkY0IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K';
                  }}
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemoveImage(imageUrl)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}