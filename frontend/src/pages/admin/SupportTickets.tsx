import { useState } from 'react';
import { Search, Filter, MoreHorizontal, MessageCircle, User, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '../../components/button';
import { Input } from '../../components/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/card';
import { Badge } from '../../components/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/avatar';
import { Textarea } from '../../components/textarea';

type Ticket = {
  id: string;
  subject: string;
  user: { name: string; email: string; avatar: string | null };
  status: string;
  priority: string;
  category: string;
  createdAt: string;
  lastUpdated: string;
  messages: { id: number; sender: string; message: string; timestamp: string }[];
};

export function SupportTickets() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyMessage, setReplyMessage] = useState<string>('');

  const tickets = [
    {
      id: 'TKT-001',
      subject: 'Payment not processed after winning auction',
      user: {
        name: 'John Smith',
        email: 'john.smith@email.com',
        avatar: null
      },
      status: 'open',
      priority: 'high',
      category: 'payment',
      createdAt: '2024-09-10T10:30:00Z',
      lastUpdated: '2024-09-10T14:20:00Z',
      messages: [
        {
          id: 1,
          sender: 'user',
          message: 'I won an auction 3 days ago but my payment still shows as pending. Can you help?',
          timestamp: '2024-09-10T10:30:00Z'
        },
        {
          id: 2,
          sender: 'admin',
          message: 'Thank you for contacting us. I can see the auction in question. Let me investigate this issue.',
          timestamp: '2024-09-10T11:45:00Z'
        }
      ]
    },
    {
      id: 'TKT-002',
      subject: 'Unable to upload auction images',
      user: {
        name: 'Sarah Johnson',
        email: 'sarah.j@email.com',
        avatar: null
      },
      status: 'pending',
      priority: 'medium',
      category: 'technical',
      createdAt: '2024-09-10T09:15:00Z',
      lastUpdated: '2024-09-10T09:15:00Z',
      messages: [
        {
          id: 1,
          sender: 'user',
          message: 'I keep getting an error when trying to upload images for my auction. The error says "File too large" but my images are only 2MB each.',
          timestamp: '2024-09-10T09:15:00Z'
        }
      ]
    },
    {
      id: 'TKT-003',
      subject: 'Dispute regarding item condition',
      user: {
        name: 'Michael Chen',
        email: 'michael.chen@email.com',
        avatar: null
      },
      status: 'resolved',
      priority: 'high',
      category: 'dispute',
      createdAt: '2024-09-08T16:20:00Z',
      lastUpdated: '2024-09-09T13:30:00Z',
      messages: [
        {
          id: 1,
          sender: 'user',
          message: 'The item I received does not match the description. It has significant damage that was not mentioned.',
          timestamp: '2024-09-08T16:20:00Z'
        },
        {
          id: 2,
          sender: 'admin',
          message: 'I understand your concern. We take these matters seriously. I have initiated a return process.',
          timestamp: '2024-09-08T18:30:00Z'
        },
        {
          id: 3,
          sender: 'user',
          message: 'Thank you for your quick response. The return label has been received.',
          timestamp: '2024-09-09T13:30:00Z'
        }
      ]
    },
    {
      id: 'TKT-004',
      subject: 'Account verification issues',
      user: {
        name: 'Emma Wilson',
        email: 'emma.wilson@email.com',
        avatar: null
      },
      status: 'open',
      priority: 'low',
      category: 'account',
      createdAt: '2024-09-09T14:45:00Z',
      lastUpdated: '2024-09-09T14:45:00Z',
      messages: [
        {
          id: 1,
          sender: 'user',
          message: 'I submitted my documents for verification a week ago but haven\'t heard back. How long does it usually take?',
          timestamp: '2024-09-09T14:45:00Z'
        }
      ]
    },
    {
      id: 'TKT-005',
      subject: 'Seller commission question',
      user: {
        name: 'David Rodriguez',
        email: 'david.r@email.com',
        avatar: null
      },
      status: 'closed',
      priority: 'low',
      category: 'billing',
      createdAt: '2024-09-07T11:00:00Z',
      lastUpdated: '2024-09-07T15:20:00Z',
      messages: [
        {
          id: 1,
          sender: 'user',
          message: 'Could you explain how the seller commission is calculated? The amount seems higher than expected.',
          timestamp: '2024-09-07T11:00:00Z'
        },
        {
          id: 2,
          sender: 'admin',
          message: 'Certainly! The seller commission is 8.5% of the final sale price plus payment processing fees. I\'ve sent you a detailed breakdown via email.',
          timestamp: '2024-09-07T15:20:00Z'
        }
      ]
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-green-100 text-green-800">Open</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'resolved':
        return <Badge className="bg-blue-100 text-blue-800">Resolved</Badge>;
      case 'closed':
        return <Badge className="bg-gray-100 text-gray-800">Closed</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800">High</Badge>;
      case 'medium':
        return <Badge className="bg-orange-100 text-orange-800">Medium</Badge>;
      case 'low':
        return <Badge className="bg-gray-100 text-gray-800">Low</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{priority}</Badge>;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'medium':
        return <Clock className="w-4 h-4 text-orange-600" />;
      case 'low':
        return <CheckCircle className="w-4 h-4 text-gray-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const stats = [
    { label: 'Open Tickets', value: tickets.filter(t => t.status === 'open').length, color: 'text-green-600' },
    { label: 'Pending Response', value: tickets.filter(t => t.status === 'pending').length, color: 'text-yellow-600' },
    { label: 'High Priority', value: tickets.filter(t => t.priority === 'high').length, color: 'text-red-600' },
    { label: 'Avg Response Time', value: '2.3h', color: 'text-blue-600' }
  ];

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const handleSendReply = () => {
    if (replyMessage.trim() && selectedTicket) {
      console.log('Sending reply to ticket:', selectedTicket.id, replyMessage);
      setReplyMessage('');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Support Tickets</h1>
          <p className="text-gray-600 mt-1">Manage customer support requests and inquiries</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4 text-center">
              <div className={`text-2xl font-semibold ${stat.color}`}>{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <CardTitle>Support Tickets</CardTitle>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search tickets..."
                      value={searchTerm}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  
                  {/* Status Filter */}
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Priority Filter */}
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredTickets.map((ticket) => (
                  <div 
                    key={ticket.id} 
                    className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                      selectedTicket?.id === ticket.id ? 'bg-blue-50 border-blue-200' : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getPriorityIcon(ticket.priority)}
                        <span className="font-medium text-gray-900">{ticket.subject}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(ticket.status)}
                        {getPriorityBadge(ticket.priority)}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 mb-2">
                      <div className="flex items-center space-x-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={ticket.user.avatar} />
                          <AvatarFallback className="bg-gray-200 text-xs">
                            {ticket.user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-600">{ticket.user.name}</span>
                      </div>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-500">{ticket.id}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Created: {formatTimestamp(ticket.createdAt)}</span>
                      <span>{ticket.messages.length} message{ticket.messages.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ticket Detail */}
        <div>
          {selectedTicket ? (
            <Card>
              <CardHeader>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{selectedTicket.id}</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Mark as Resolved</DropdownMenuItem>
                        <DropdownMenuItem>Close Ticket</DropdownMenuItem>
                        <DropdownMenuItem>Escalate</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardTitle className="text-lg">{selectedTicket.subject}</CardTitle>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(selectedTicket.status)}
                    {getPriorityBadge(selectedTicket.priority)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* User Info */}
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Avatar>
                    <AvatarImage src={selectedTicket.user.avatar} />
                    <AvatarFallback className="bg-gray-200">
                      {selectedTicket.user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-gray-900">{selectedTicket.user.name}</div>
                    <div className="text-sm text-gray-500">{selectedTicket.user.email}</div>
                  </div>
                </div>

                {/* Messages */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {selectedTicket.messages.map((message) => (
                    <div 
                      key={message.id} 
                      className={`p-3 rounded-lg ${
                        message.sender === 'user' 
                          ? 'bg-gray-100 ml-4' 
                          : 'bg-blue-50 mr-4'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {message.sender === 'user' ? (
                            <User className="w-4 h-4 text-gray-600" />
                          ) : (
                            <MessageCircle className="w-4 h-4 text-blue-600" />
                          )}
                          <span className="text-sm font-medium">
                            {message.sender === 'user' ? selectedTicket.user.name : 'Admin'}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(message.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{message.message}</p>
                    </div>
                  ))}
                </div>

                {/* Reply Form */}
                <div className="space-y-3 border-t pt-4">
                  <Textarea
                    placeholder="Type your reply..."
                    value={replyMessage}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReplyMessage(e.target.value)}
                    rows={3}
                  />
                  <div className="flex justify-between">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        Add Note
                      </Button>
                      <Button variant="outline" size="sm">
                        Escalate
                      </Button>
                    </div>
                    <Button 
                      onClick={handleSendReply}
                      className="bg-black text-white hover:bg-gray-800"
                      disabled={!replyMessage.trim()}
                    >
                      Send Reply
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 mb-2">Select a Ticket</h3>
                <p className="text-sm text-gray-500">
                  Choose a support ticket from the list to view details and respond
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}