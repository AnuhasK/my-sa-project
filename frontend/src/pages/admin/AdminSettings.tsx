import { useState } from 'react';
import { Save, Upload, Shield, DollarSign, Clock, Mail, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/card';
import { Button } from '../../components/button';
import { Input } from '../../components/input';
import { Textarea } from '../../components/textarea';
import { Switch } from '../../components/switch';
import { Label } from '../../components/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/tabs';
import { Separator } from '../../components/separator';

type Settings = {
  platformName: string;
  platformDescription: string;
  contactEmail: string;
  supportPhone: string;
  timezone: string;
  maintenanceMode: boolean;
  minBidIncrement: number;
  maxAuctionDuration: number;
  defaultAuctionDuration: number;
  bidExtensionTime: number;
  sellerCommission: number;
  buyersPremium: number;
  requireEmailVerification: boolean;
  requirePhoneVerification: boolean;
  enableTwoFactor: boolean;
  passwordMinLength: number;
  maxLoginAttempts: number;
  sessionTimeout: number;
  smtpServer: string;
  smtpPort: number;
  smtpUsername: string;
  emailNotifications: boolean;
  bidNotifications: boolean;
  outbidNotifications: boolean;
  auctionEndNotifications: boolean;
  paymentGateway: string;
  acceptedPayments: string[];
  paymentHoldDuration: number;
  instantPayoutThreshold: number;
  maxImageSize: number;
  allowedImageFormats: string[];
  moderationRequired: boolean;
  autoApproveThreshold: number;
};

export function AdminSettings() {
  const [settings, setSettings] = useState<Settings>({
    // Platform Settings
    platformName: 'AuctionHouse',
    platformDescription: 'Your trusted partner for premium auctions',
    contactEmail: 'support@auctionhouse.com',
    supportPhone: '+1 (555) 123-4567',
    timezone: 'EST',
    maintenanceMode: false,
    
    // Auction Settings
    minBidIncrement: 5,
    maxAuctionDuration: 30,
    defaultAuctionDuration: 7,
    bidExtensionTime: 5,
    sellerCommission: 8.5,
    buyersPremium: 10,
    
    // Security Settings
    requireEmailVerification: true,
    requirePhoneVerification: false,
    enableTwoFactor: true,
    passwordMinLength: 8,
    maxLoginAttempts: 5,
    sessionTimeout: 30,
    
    // Email Settings
    smtpServer: 'smtp.auctionhouse.com',
    smtpPort: 587,
    smtpUsername: 'notifications@auctionhouse.com',
    emailNotifications: true,
    bidNotifications: true,
    outbidNotifications: true,
    auctionEndNotifications: true,
    
    // Payment Settings
    paymentGateway: 'stripe',
    acceptedPayments: ['credit_card', 'paypal', 'bank_transfer'],
    paymentHoldDuration: 7,
    instantPayoutThreshold: 1000,
    
    // Content Settings
    maxImageSize: 5,
    allowedImageFormats: ['jpg', 'png', 'gif'],
    moderationRequired: true,
    autoApproveThreshold: 100
  });

  const handleSettingChange = (key: keyof Settings, value: Settings[keyof Settings]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = () => {
    console.log('Saving settings:', settings);
    // Implementation would save to backend
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Platform Settings</h1>
          <p className="text-gray-600 mt-1">Configure your auction platform</p>
        </div>
        <Button onClick={handleSaveSettings} className="bg-black text-white hover:bg-gray-800">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="auctions">Auctions</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="w-5 h-5" />
                <span>Platform Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="platformName">Platform Name</Label>
                  <Input
                    id="platformName"
                    value={settings.platformName}
                    onChange={(e) => handleSettingChange('platformName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={settings.timezone} onValueChange={(value: string) => handleSettingChange('timezone', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EST">Eastern Time (EST)</SelectItem>
                      <SelectItem value="PST">Pacific Time (PST)</SelectItem>
                      <SelectItem value="GMT">Greenwich Mean Time (GMT)</SelectItem>
                      <SelectItem value="CET">Central European Time (CET)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="platformDescription">Platform Description</Label>
                <Textarea
                  id="platformDescription"
                  value={settings.platformDescription}
                  onChange={(e) => handleSettingChange('platformDescription', e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => handleSettingChange('contactEmail', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportPhone">Support Phone</Label>
                  <Input
                    id="supportPhone"
                    value={settings.supportPhone}
                    onChange={(e) => handleSettingChange('supportPhone', e.target.value)}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-gray-500">Temporarily disable public access to the platform</p>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked: boolean) => handleSettingChange('maintenanceMode', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Auction Settings */}
        <TabsContent value="auctions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Auction Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minBidIncrement">Min Bid Increment ($)</Label>
                  <Input
                    id="minBidIncrement"
                    type="number"
                    value={settings.minBidIncrement}
                    onChange={(e) => handleSettingChange('minBidIncrement', parseFloat(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxAuctionDuration">Max Duration (days)</Label>
                  <Input
                    id="maxAuctionDuration"
                    type="number"
                    value={settings.maxAuctionDuration}
                    onChange={(e) => handleSettingChange('maxAuctionDuration', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultAuctionDuration">Default Duration (days)</Label>
                  <Input
                    id="defaultAuctionDuration"
                    type="number"
                    value={settings.defaultAuctionDuration}
                    onChange={(e) => handleSettingChange('defaultAuctionDuration', parseInt(e.target.value))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bidExtensionTime">Bid Extension Time (minutes)</Label>
                <Input
                  id="bidExtensionTime"
                  type="number"
                  value={settings.bidExtensionTime}
                  onChange={(e) => handleSettingChange('bidExtensionTime', parseInt(e.target.value))}
                  className="w-full md:w-48"
                />
                <p className="text-sm text-gray-500">Extend auction time when bids are placed near the end</p>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sellerCommission">Seller Commission (%)</Label>
                  <Input
                    id="sellerCommission"
                    type="number"
                    step="0.1"
                    value={settings.sellerCommission}
                    onChange={(e) => handleSettingChange('sellerCommission', parseFloat(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="buyersPremium">Buyer's Premium (%)</Label>
                  <Input
                    id="buyersPremium"
                    type="number"
                    step="0.1"
                    value={settings.buyersPremium}
                    onChange={(e) => handleSettingChange('buyersPremium', parseFloat(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Security & Authentication</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Verification Required</Label>
                    <p className="text-sm text-gray-500">Require users to verify their email address</p>
                  </div>
                  <Switch
                    checked={settings.requireEmailVerification}
                    onCheckedChange={(checked: boolean) => handleSettingChange('requireEmailVerification', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Phone Verification Required</Label>
                    <p className="text-sm text-gray-500">Require phone number verification for new accounts</p>
                  </div>
                  <Switch
                    checked={settings.requirePhoneVerification}
                    onCheckedChange={(checked: boolean) => handleSettingChange('requirePhoneVerification', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-500">Enable 2FA options for users</p>
                  </div>
                  <Switch
                    checked={settings.enableTwoFactor}
                    onCheckedChange={(checked: boolean) => handleSettingChange('enableTwoFactor', checked)}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="passwordMinLength">Min Password Length</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    value={settings.passwordMinLength}
                    onChange={(e) => handleSettingChange('passwordMinLength', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={settings.maxLoginAttempts}
                    onChange={(e) => handleSettingChange('maxLoginAttempts', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5" />
                <span>Payment Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="paymentGateway">Payment Gateway</Label>
                <Select value={settings.paymentGateway} onValueChange={(value: string) => handleSettingChange('paymentGateway', value)}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stripe">Stripe</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="square">Square</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Accepted Payment Methods</Label>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="credit_card"
                      checked={settings.acceptedPayments.includes('credit_card')}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const methods = settings.acceptedPayments;
                        if (e.target.checked) {
                          handleSettingChange('acceptedPayments', [...methods, 'credit_card']);
                        } else {
                          handleSettingChange('acceptedPayments', methods.filter(m => m !== 'credit_card'));
                        }
                      }}
                    />
                    <Label htmlFor="credit_card">Credit Cards</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="paypal"
                      checked={settings.acceptedPayments.includes('paypal')}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const methods = settings.acceptedPayments;
                        if (e.target.checked) {
                          handleSettingChange('acceptedPayments', [...methods, 'paypal']);
                        } else {
                          handleSettingChange('acceptedPayments', methods.filter(m => m !== 'paypal'));
                        }
                      }}
                    />
                    <Label htmlFor="paypal">PayPal</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="bank_transfer"
                      checked={settings.acceptedPayments.includes('bank_transfer')}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const methods = settings.acceptedPayments;
                        if (e.target.checked) {
                          handleSettingChange('acceptedPayments', [...methods, 'bank_transfer']);
                        } else {
                          handleSettingChange('acceptedPayments', methods.filter(m => m !== 'bank_transfer'));
                        }
                      }}
                    />
                    <Label htmlFor="bank_transfer">Bank Transfer</Label>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentHoldDuration">Payment Hold Duration (days)</Label>
                  <Input
                    id="paymentHoldDuration"
                    type="number"
                    value={settings.paymentHoldDuration}
                    onChange={(e) => handleSettingChange('paymentHoldDuration', parseInt(e.target.value))}
                  />
                  <p className="text-sm text-gray-500">Hold payments before releasing to sellers</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instantPayoutThreshold">Instant Payout Threshold ($)</Label>
                  <Input
                    id="instantPayoutThreshold"
                    type="number"
                    value={settings.instantPayoutThreshold}
                    onChange={(e) => handleSettingChange('instantPayoutThreshold', parseInt(e.target.value))}
                  />
                  <p className="text-sm text-gray-500">Minimum amount for instant payouts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="w-5 h-5" />
                <span>Email & Notifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpServer">SMTP Server</Label>
                  <Input
                    id="smtpServer"
                    value={settings.smtpServer}
                    onChange={(e) => handleSettingChange('smtpServer', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input
                    id="smtpPort"
                    type="number"
                    value={settings.smtpPort}
                    onChange={(e) => handleSettingChange('smtpPort', parseInt(e.target.value))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="smtpUsername">SMTP Username</Label>
                <Input
                  id="smtpUsername"
                  value={settings.smtpUsername}
                  onChange={(e) => handleSettingChange('smtpUsername', e.target.value)}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-gray-500">Enable email notifications system</p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked: boolean) => handleSettingChange('emailNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Bid Notifications</Label>
                    <p className="text-sm text-gray-500">Notify users when they place bids</p>
                  </div>
                  <Switch
                    checked={settings.bidNotifications}
                    onCheckedChange={(checked: boolean) => handleSettingChange('bidNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Outbid Notifications</Label>
                    <p className="text-sm text-gray-500">Notify users when they are outbid</p>
                  </div>
                  <Switch
                    checked={settings.outbidNotifications}
                    onCheckedChange={(checked: boolean) => handleSettingChange('outbidNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auction End Notifications</Label>
                    <p className="text-sm text-gray-500">Notify users when auctions end</p>
                  </div>
                  <Switch
                    checked={settings.auctionEndNotifications}
                    onCheckedChange={(checked: boolean) => handleSettingChange('auctionEndNotifications', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Settings */}
        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="w-5 h-5" />
                <span>Content & Moderation</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxImageSize">Max Image Size (MB)</Label>
                  <Input
                    id="maxImageSize"
                    type="number"
                    value={settings.maxImageSize}
                    onChange={(e) => handleSettingChange('maxImageSize', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="autoApproveThreshold">Auto-Approve Threshold ($)</Label>
                  <Input
                    id="autoApproveThreshold"
                    type="number"
                    value={settings.autoApproveThreshold}
                    onChange={(e) => handleSettingChange('autoApproveThreshold', parseInt(e.target.value))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Allowed Image Formats</Label>
                <div className="flex flex-wrap gap-4">
                  {['jpg', 'png', 'gif', 'webp'].map(format => (
                    <div key={format} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={format}
                        checked={settings.allowedImageFormats.includes(format)}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const formats = settings.allowedImageFormats;
                          if (e.target.checked) {
                            handleSettingChange('allowedImageFormats', [...formats, format]);
                          } else {
                            handleSettingChange('allowedImageFormats', formats.filter(f => f !== format));
                          }
                        }}
                      />
                      <Label htmlFor={format}>.{format.toUpperCase()}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Manual Moderation Required</Label>
                  <p className="text-sm text-gray-500">Require manual approval for new auction listings</p>
                </div>
                <Switch
                  checked={settings.moderationRequired}
                  onCheckedChange={(checked: boolean) => handleSettingChange('moderationRequired', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}