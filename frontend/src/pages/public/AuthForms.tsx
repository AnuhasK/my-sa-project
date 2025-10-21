import { useState } from 'react';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/button';
import { Input } from '../../components/input';
import { Label } from '../../components/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/card';
import { Checkbox } from '../../components/checkbox';
import { useAuth } from '../../contexts/AuthContext';

interface AuthFormsProps {
  mode: 'login' | 'register' | 'reset-password';
  setCurrentPage: (page: string) => void;
}

export function AuthForms({ mode, setCurrentPage }: AuthFormsProps) {
  const { login, register, loading, isAdmin } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    userName: '', // Changed from firstName/lastName to userName for backend
    acceptTerms: false
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      if (mode === 'login') {
        const success = await login({
          email: formData.email,
          password: formData.password
        });
        
        if (success) {
          // Redirect will be handled by App.tsx based on role
          setCurrentPage('home');
        } else {
          setError('Invalid email or password');
        }
      } else if (mode === 'register') {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return;
        }
        
        if (formData.password.length < 4) {
          setError('Password must be at least 4 characters long');
          return;
        }
        
        if (!formData.acceptTerms) {
          setError('Please accept the terms and conditions');
          return;
        }
        
        const success = await register({
          userName: formData.userName,
          email: formData.email,
          password: formData.password
        });
        
        if (success) {
          // Redirect will be handled by App.tsx based on role
          setCurrentPage('home');
        } else {
          setError('Registration failed. Please try again.');
        }
      } else if (mode === 'reset-password') {
        // Handle password reset - would need backend endpoint
        setError('Password reset functionality coming soon');
        // setCurrentPage('login');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
      console.error('Auth error:', error);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'login': return 'Welcome Back';
      case 'register': return 'Create Account';
      case 'reset-password': return 'Reset Password';
    }
  };

  const getDescription = () => {
    switch (mode) {
      case 'login': return 'Sign in to your account to start bidding';
      case 'register': return 'Join our community of collectors and bidders';
      case 'reset-password': return 'Enter your email to receive a reset link';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => setCurrentPage('home')}
          className="mb-6 flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Button>

        <Card className="shadow-lg border-0">
          <CardHeader className="text-center space-y-2">
            {/* Logo */}
            <div className="flex justify-center mb-4">
              <img 
                src="/img/logo.png" 
                alt="Auction House Logo" 
                className="h-16 w-auto cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setCurrentPage('home')}
              />
            </div>
            
            <CardTitle className="text-2xl font-bold text-gray-900">{getTitle()}</CardTitle>
            <CardDescription className="text-gray-600">{getDescription()}</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Register Form Fields */}
              {mode === 'register' && (
                <div className="space-y-2">
                  <Label htmlFor="userName">Username</Label>
                  <Input
                    id="userName"
                    type="text"
                    value={formData.userName}
                    onChange={(e) => handleInputChange('userName', e.target.value)}
                    className="border-gray-200 focus:border-gray-400 focus:ring-0"
                    required
                  />
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="border-gray-200 focus:border-gray-400 focus:ring-0"
                  placeholder="Enter your email"
                  required
                />
              </div>

              {/* Password Fields */}
              {mode !== 'reset-password' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className="border-gray-200 focus:border-gray-400 focus:ring-0 pr-10"
                        placeholder="Enter your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {mode === 'register' && (
                      <p className="text-sm text-gray-500">
                        Password must be at least 4 characters long
                      </p>
                    )}
                  </div>

                  {/* Confirm Password for Register */}
                  {mode === 'register' && (
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                          className="border-gray-200 focus:border-gray-400 focus:ring-0 pr-10"
                          placeholder="Confirm your password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Terms and Conditions for Register */}
              {mode === 'register' && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="acceptTerms"
                    checked={formData.acceptTerms}
                    onCheckedChange={(checked: boolean) => handleInputChange('acceptTerms', checked)}
                  />
                  <label htmlFor="acceptTerms" className="text-sm text-gray-600">
                    I agree to the{' '}
                    <a href="#" className="text-black hover:underline">Terms of Service</a>
                    {' '}and{' '}
                    <a href="#" className="text-black hover:underline">Privacy Policy</a>
                  </label>
                </div>
              )}

              {/* Forgot Password Link for Login */}
              {mode === 'login' && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="remember" />
                    <label htmlFor="remember" className="text-sm text-gray-600">
                      Remember me
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentPage('reset-password')}
                    className="text-sm text-black hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-black text-white hover:bg-gray-800 py-3"
                disabled={(mode === 'register' && !formData.acceptTerms) || loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {mode === 'login' && 'Signing In...'}
                    {mode === 'register' && 'Creating Account...'}
                    {mode === 'reset-password' && 'Sending Reset Link...'}
                  </div>
                ) : (
                  <>
                    {mode === 'login' && 'Sign In'}
                    {mode === 'register' && 'Create Account'}
                    {mode === 'reset-password' && 'Send Reset Link'}
                  </>
                )}
              </Button>

              {/* Switch Mode Links */}
              <div className="text-center text-sm">
                {mode === 'login' && (
                  <span className="text-gray-600">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setCurrentPage('register')}
                      className="text-black hover:underline font-medium"
                    >
                      Sign up
                    </button>
                  </span>
                )}
                {mode === 'register' && (
                  <span className="text-gray-600">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setCurrentPage('login')}
                      className="text-black hover:underline font-medium"
                    >
                      Sign in
                    </button>
                  </span>
                )}
                {mode === 'reset-password' && (
                  <span className="text-gray-600">
                    Remember your password?{' '}
                    <button
                      type="button"
                      onClick={() => setCurrentPage('login')}
                      className="text-black hover:underline font-medium"
                    >
                      Sign in
                    </button>
                  </span>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}