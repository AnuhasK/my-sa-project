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
  setIsLoggedIn: (loggedIn: boolean) => void;
}

export function AuthForms({ mode, setCurrentPage, setIsLoggedIn }: AuthFormsProps) {
  const { login, register, loading } = useAuth();
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
          setIsLoggedIn(true);
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
          setIsLoggedIn(true);
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
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">A</span>
              </div>
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

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or</span>
                </div>
              </div>

              {/* Social Sign In */}
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" type="button" className="border-gray-200 text-gray-700 hover:bg-gray-50">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </Button>
                <Button variant="outline" type="button" className="border-gray-200 text-gray-700 hover:bg-gray-50">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </Button>
              </div>

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