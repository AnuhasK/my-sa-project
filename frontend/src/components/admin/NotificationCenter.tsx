import { useState } from 'react';
import { 
  Bell, 
  Send, 
  Filter, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  XCircle,
  Users,
  Megaphone,
  Mail
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';

export function NotificationCenter() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    message: '',
    type: 'info',
    recipients: 'all'
  });

  const notifications = [
    {
      id: '1',
      type: 'warning',
      title: 'Payment Dispute Reported',
      message: 'A payment dispute has been reported for auction #AUC-1247. Requires immediate attention.',
      timestamp: '5 minutes ago',
      read: false,
      actionRequired: true
    },
    {
      id: '2',
      type: 'success',
      title: 'High-Value Auction Completed',
      message: 'Auction "Vintage Rolex Collection" completed successfully with final bid of $12,500.',
      timestamp: '15 minutes ago',
      read: false,
      actionRequired: false
    },
    {
      id: '3',
      type: 'info',
      title: 'New User Registration Spike',
      message: '50+ new users registered in the last hour. Consider reviewing server capacity.',
      timestamp: '32 minutes ago',
      read: true,
      actionRequired: false
    },
    {
      id: '4',
      type: 'error',
      title: 'System Error Detected',
      message: 'Error in payment processing system. Some transactions may be delayed.',
      timestamp: '1 hour ago',
      read: false,
      actionRequired: true
    },
    {
      id: '5',
      type: 'info',
      title: 'Weekly Report Available',
      message: 'Your weekly performance report is ready for review.',
      timestamp: '2 hours ago',
      read: true,
      actionRequired: false
    },
    {
      id: '6',
      type: 'warning',
      title: 'Suspicious Activity Alert',
      message: 'Multiple failed login attempts detected for user account: john.doe@email.com',
      timestamp: '3 hours ago',
      read: true,
      actionRequired: true
    }
  ];

  const recentAnnouncements = [
    {
      id: '1',
      title: 'Platform Maintenance Scheduled',
      message: 'We will be performing routine maintenance on September 15th from 2:00 AM to 4:00 AM EST.',
      type: 'info',
      recipients: 'All Users',
      sentAt: '2 days ago',
      status: 'sent'
    },
    {
      id: '2',
      title: 'New Category Added: Vintage Electronics',
      message: 'We are excited to announce a new auction category for vintage electronics and gadgets.',
      type: 'success',
      recipients: 'All Users',
      sentAt: '5 days ago',
      status: 'sent'
    },
    {
      id: '3',
      title: 'Updated Terms of Service',
      message: 'Please review our updated Terms of Service, effective October 1st, 2024.',
      type: 'warning',
      recipients: 'All Users',
      sentAt: '1 week ago',
      status: 'sent'
    }
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getNotificationBadge = (type: string) => {
    switch (type) {
      case 'warning':
        return <Badge className="bg-orange-100 text-orange-800">Warning</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Success</Badge>;
      case 'info':
      default:
        return <Badge className="bg-blue-100 text-blue-800">Info</Badge>;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || notification.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleSendAnnouncement = () => {
    if (newAnnouncement.title && newAnnouncement.message) {
      console.log('Sending announcement:', newAnnouncement);
      setNewAnnouncement({ title: '', message: '', type: 'info', recipients: 'all' });
    }
  };

  const stats = [
    { label: 'Unread Notifications', value: notifications.filter(n => !n.read).length, icon: Bell, color: 'text-orange-600' },
    { label: 'Action Required', value: notifications.filter(n => n.actionRequired).length, icon: AlertTriangle, color: 'text-red-600' },
    { label: 'Announcements Sent', value: recentAnnouncements.length, icon: Megaphone, color: 'text-blue-600' },
    { label: 'Active Recipients', value: '12,847', icon: Users, color: 'text-green-600' }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Notification Center</h1>
          <p className="text-gray-600 mt-1">Monitor system alerts and manage announcements</p>
        </div>
        <Button className="bg-black text-white hover:bg-gray-800">
          <Send className="w-4 h-4 mr-2" />
          New Announcement
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className={`text-2xl font-semibold ${stat.color}`}>{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
                <Icon className={`w-8 h-8 ${stat.color}`} />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="alerts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="alerts">System Alerts</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <CardTitle>System Notifications</CardTitle>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search notifications..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredNotifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-4 border rounded-lg ${
                      !notification.read ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <h3 className={`font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {getNotificationBadge(notification.type)}
                            {notification.actionRequired && (
                              <Badge className="bg-red-100 text-red-800">Action Required</Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{notification.message}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">{notification.timestamp}</span>
                          <div className="flex space-x-2">
                            {!notification.read && (
                              <Button variant="outline" size="sm">Mark as Read</Button>
                            )}
                            {notification.actionRequired && (
                              <Button size="sm" className="bg-black text-white hover:bg-gray-800">
                                Take Action
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="announcements" className="space-y-6">
          {/* Create Announcement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Megaphone className="w-5 h-5" />
                <span>Create New Announcement</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Announcement Title</Label>
                  <Input
                    id="title"
                    value={newAnnouncement.title}
                    onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter announcement title..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select 
                    value={newAnnouncement.type} 
                    onValueChange={(value) => setNewAnnouncement(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Information</SelectItem>
                      <SelectItem value="success">Good News</SelectItem>
                      <SelectItem value="warning">Important Update</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={newAnnouncement.message}
                  onChange={(e) => setNewAnnouncement(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Enter your announcement message..."
                  rows={4}
                />
              </div>
              
              <div className="space-y-3">
                <Label>Recipients</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="all-users" 
                      checked={newAnnouncement.recipients === 'all'}
                      onCheckedChange={(checked) => 
                        checked && setNewAnnouncement(prev => ({ ...prev, recipients: 'all' }))
                      }
                    />
                    <Label htmlFor="all-users">All Users (12,847)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="sellers" 
                      checked={newAnnouncement.recipients === 'sellers'}
                      onCheckedChange={(checked) => 
                        checked && setNewAnnouncement(prev => ({ ...prev, recipients: 'sellers' }))
                      }
                    />
                    <Label htmlFor="sellers">Sellers Only (3,421)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="buyers" 
                      checked={newAnnouncement.recipients === 'buyers'}
                      onCheckedChange={(checked) => 
                        checked && setNewAnnouncement(prev => ({ ...prev, recipients: 'buyers' }))
                      }
                    />
                    <Label htmlFor="buyers">Active Buyers (9,426)</Label>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={handleSendAnnouncement}
                className="bg-black text-white hover:bg-gray-800"
                disabled={!newAnnouncement.title || !newAnnouncement.message}
              >
                <Send className="w-4 h-4 mr-2" />
                Send Announcement
              </Button>
            </CardContent>
          </Card>

          {/* Recent Announcements */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Announcements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAnnouncements.map((announcement) => (
                  <div key={announcement.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-600" />
                        <h3 className="font-medium text-gray-900">{announcement.title}</h3>
                        {getNotificationBadge(announcement.type)}
                      </div>
                      <span className="text-xs text-gray-500">{announcement.sentAt}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{announcement.message}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Recipients: {announcement.recipients}</span>
                      <Badge className="bg-green-100 text-green-800">Sent</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}