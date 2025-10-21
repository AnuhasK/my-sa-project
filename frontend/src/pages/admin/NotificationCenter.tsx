import { useState, useEffect } from 'react';
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
  Mail,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/card';
import { Button } from '../../components/button';
import { Input } from '../../components/input';
import { Textarea } from '../../components/textarea';
import { Badge } from '../../components/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/tabs';
import { Checkbox } from '../../components/checkbox';
import { Label } from '../../components/label';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { toast } from 'sonner';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface Announcement {
  id: number;
  title: string;
  message: string;
  type: string;
  recipients: string;
  status: string;
  createdAt: string;
  sentAt?: string;
  sentTimeAgo: string;
}

export function NotificationCenter() {
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);
  const [sendingAnnouncement, setSendingAnnouncement] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    message: '',
    type: 'info',
    recipients: 'all'
  });

  // Fetch notifications from backend
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!token) return;
      
      try {
        setLoading(true);
        const data = await api.getNotifications(token, 1, 50); // Get first 50 notifications
        setNotifications(data);
      } catch (err: any) {
        console.error('Error fetching notifications:', err);
        toast.error('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [token]);

  // Fetch announcements from backend
  useEffect(() => {
    const fetchAnnouncements = async () => {
      if (!token) return;
      
      try {
        setAnnouncementsLoading(true);
        const { adminApi } = await import('../../services/adminApi');
        const data = await adminApi.getAnnouncements(token);
        setAnnouncements(data);
      } catch (err: any) {
        console.error('Error fetching announcements:', err);
        toast.error('Failed to load announcements');
      } finally {
        setAnnouncementsLoading(false);
      }
    };

    fetchAnnouncements();
  }, [token]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

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

  const handleSendAnnouncement = async () => {
    if (!newAnnouncement.title || !newAnnouncement.message) {
      toast.error('Please fill in all fields');
      return;
    }
    
    if (!token) {
      toast.error('Authentication required');
      return;
    }

    try {
      setSendingAnnouncement(true);
      const { adminApi } = await import('../../services/adminApi');
      
      // Create the announcement
      const created = await adminApi.createAnnouncement(newAnnouncement, token) as Announcement;
      
      // Send it immediately
      await adminApi.sendAnnouncement(created.id, token);
      
      toast.success('Announcement sent successfully!');
      setNewAnnouncement({ title: '', message: '', type: 'info', recipients: 'all' });
      
      // Refresh announcements list
      const updated = await adminApi.getAnnouncements(token);
      setAnnouncements(updated);
    } catch (err: any) {
      console.error('Error sending announcement:', err);
      toast.error(err.message || 'Failed to send announcement');
    } finally {
      setSendingAnnouncement(false);
    }
  };

  const stats = [
    { label: 'Total Notifications', value: notifications.length, icon: Bell, color: 'text-blue-600' },
    { label: 'Unread', value: notifications.filter(n => !n.isRead).length, icon: Bell, color: 'text-orange-600' },
    { label: 'Read', value: notifications.filter(n => n.isRead).length, icon: CheckCircle, color: 'text-green-600' },
    { label: 'Announcements Sent', value: announcements.filter(a => a.status === 'sent').length, icon: Megaphone, color: 'text-blue-600' }
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
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={typeFilter} onValueChange={(value: string) => setTypeFilter(value)}>
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
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                    <span className="ml-2 text-gray-600">Loading notifications...</span>
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600">No notifications found</p>
                  </div>
                ) : (
                  filteredNotifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`p-4 border rounded-lg ${
                        !notification.isRead ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <h3 className={`font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                                {notification.title}
                              </h3>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              {getNotificationBadge(notification.type)}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{notification.message}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">{formatTimestamp(notification.createdAt)}</span>
                            <div className="flex space-x-2">
                              {!notification.isRead && (
                                <Button variant="outline" size="sm">Mark as Read</Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter announcement title..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select 
                    value={newAnnouncement.type} 
                    onValueChange={(value: string) => setNewAnnouncement(prev => ({ ...prev, type: value }))}
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
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewAnnouncement(prev => ({ ...prev, message: e.target.value }))}
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
                      onCheckedChange={(checked: boolean) => 
                        checked && setNewAnnouncement(prev => ({ ...prev, recipients: 'all' }))
                      }
                    />
                    <Label htmlFor="all-users">All Users</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="active-users" 
                      checked={newAnnouncement.recipients === 'active'}
                      onCheckedChange={(checked: boolean) => 
                        checked && setNewAnnouncement(prev => ({ ...prev, recipients: 'active' }))
                      }
                    />
                    <Label htmlFor="active-users">Active Users</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="suspended-users" 
                      checked={newAnnouncement.recipients === 'suspended'}
                      onCheckedChange={(checked: boolean) => 
                        checked && setNewAnnouncement(prev => ({ ...prev, recipients: 'suspended' }))
                      }
                    />
                    <Label htmlFor="suspended-users">Suspended Users</Label>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={handleSendAnnouncement}
                className="bg-black text-white hover:bg-gray-800"
                disabled={!newAnnouncement.title || !newAnnouncement.message || sendingAnnouncement}
              >
                {sendingAnnouncement ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Announcement
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Recent Announcements */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Announcements</CardTitle>
            </CardHeader>
            <CardContent>
              {announcementsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  <span className="ml-2 text-gray-600">Loading announcements...</span>
                </div>
              ) : announcements.length > 0 ? (
                <div className="space-y-4">
                  {announcements.slice(0, 5).map((announcement) => (
                    <div key={announcement.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-gray-600" />
                          <h3 className="font-medium text-gray-900">{announcement.title}</h3>
                          {getNotificationBadge(announcement.type)}
                        </div>
                        <span className="text-xs text-gray-500">{announcement.sentTimeAgo}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{announcement.message}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Recipients: {announcement.recipients}</span>
                        <Badge className={
                          announcement.status === 'sent' 
                            ? 'bg-green-100 text-green-800' 
                            : announcement.status === 'draft'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }>
                          {announcement.status.charAt(0).toUpperCase() + announcement.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">No announcements yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}