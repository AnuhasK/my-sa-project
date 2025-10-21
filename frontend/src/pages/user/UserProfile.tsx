import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, FileText, Lock, Upload, Save, X } from 'lucide-react';
import { Button } from '../../components/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/card';
import { Input } from '../../components/input';
import { Textarea } from '../../components/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/avatar';
import { Label } from '../../components/label';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { toast } from 'sonner';

// Helper function to build full image URL
const getImageUrl = (relativeUrl: string | undefined) => {
  if (!relativeUrl) return undefined;
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5021/api';
  // Remove /api from the end since the image URL already includes it
  const baseUrl = apiBase.replace(/\/api$/, '');
  return `${baseUrl}${relativeUrl}`;
};

interface ProfileData {
  id: number;
  username: string;
  email: string;
  role: string;
  profileImageUrl?: string;
  phoneNumber?: string;
  address?: string;
  bio?: string;
  createdAt: string;
}

export function UserProfile() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [editing, setEditing] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  const [formData, setFormData] = useState({
    phoneNumber: '',
    address: '',
    bio: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profileData = await api.getCurrentUser(token);
      setProfile(profileData);
      setFormData({
        phoneNumber: profileData.phoneNumber || '',
        address: profileData.address || '',
        bio: profileData.bio || '',
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const updated = await api.updateProfile(formData, token);
      setProfile(updated);
      setEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      phoneNumber: profile?.phoneNumber || '',
      address: profile?.address || '',
      bio: profile?.bio || '',
    });
    setEditing(false);
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      await api.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      }, token);
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setShowPasswordDialog(false);
      toast.success('Password changed successfully!');
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password. Check your current password.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only image files (JPEG, PNG, GIF, WebP) are allowed');
      return;
    }

    try {
      setLoading(true);
      const uploadResponse = await api.uploadImage(file, token);
      console.log('Upload response:', uploadResponse);
      
      // Backend returns { imageUrl: "..." }, not { url: "..." }
      const imageUrl = uploadResponse.imageUrl || uploadResponse.url;
      console.log('Image URL to save:', imageUrl);
      
      await api.updateProfileImage(imageUrl, token);
      
      // Force reload to get updated profile
      const updatedProfile = await api.getCurrentUser(token);
      console.log('Updated profile:', updatedProfile);
      setProfile(updatedProfile);
      
      toast.success('Profile image updated!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your personal information and settings</p>
        </div>

        {/* Profile Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage 
                      src={getImageUrl(profile?.profileImageUrl)} 
                      alt={profile?.username} 
                    />
                    <AvatarFallback>
                      <User className="h-10 w-10" />
                    </AvatarFallback>
                  </Avatar>
                  <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-black text-white rounded-full p-1.5 cursor-pointer hover:bg-gray-800 transition">
                    <Upload className="h-3 w-3" />
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={loading}
                    />
                  </label>
                </div>
                <div>
                  <CardTitle className="text-2xl">{profile?.username}</CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <Mail className="h-4 w-4 mr-2" />
                    {profile?.email}
                  </CardDescription>
                  <span className="inline-block mt-2 px-3 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                    {profile?.role}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                {!editing ? (
                  <>
                    <Button
                      onClick={() => setEditing(true)}
                      variant="outline"
                    >
                      Edit Profile
                    </Button>
                    <Button
                      onClick={() => setShowPasswordDialog(true)}
                      variant="outline"
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      Change Password
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={handleSaveProfile}
                      disabled={loading}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button
                      onClick={handleCancelEdit}
                      variant="outline"
                      disabled={loading}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Phone Number */}
            <div>
              <Label htmlFor="phoneNumber" className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                Phone Number
              </Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                disabled={!editing || loading}
                placeholder="Enter your phone number"
                className="mt-1"
              />
            </div>

            {/* Address */}
            <div>
              <Label htmlFor="address" className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                Address
              </Label>
              <Input
                id="address"
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                disabled={!editing || loading}
                placeholder="Enter your address"
                className="mt-1"
              />
            </div>

            {/* Bio */}
            <div>
              <Label htmlFor="bio" className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Bio
              </Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                disabled={!editing || loading}
                placeholder="Tell us about yourself..."
                rows={4}
                className="mt-1"
              />
            </div>

            {/* Account Info */}
            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Account Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Member Since:</span>
                  <p className="font-medium">
                    {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Account Type:</span>
                  <p className="font-medium">{profile?.role}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Change Password Dialog */}
        {showPasswordDialog && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Change Password</span>
                <Button
                  onClick={() => setShowPasswordDialog(false)}
                  variant="ghost"
                  size="sm"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                  disabled={loading}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                  disabled={loading}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                  disabled={loading}
                  className="mt-1"
                />
              </div>
              <Button
                onClick={handleChangePassword}
                disabled={loading || !passwordData.currentPassword || !passwordData.newPassword}
                className="w-full"
              >
                Change Password
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
