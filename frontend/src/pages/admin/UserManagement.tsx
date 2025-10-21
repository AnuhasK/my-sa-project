import { useState, useEffect } from 'react';
import { Search, Filter, MoreHorizontal, Eye, Edit, Ban, CheckCircle, XCircle, Download, Loader2, AlertTriangle, Trash2, Plus, UserPlus } from 'lucide-react';
import { Button } from '../../components/button';
import { Input } from '../../components/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/card';
import { Badge } from '../../components/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/table';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/dialog';
import { Label } from '../../components/label';
import { useAuth } from '../../contexts/AuthContext';
import { adminApi } from '../../services/adminApi';
import { toast } from 'sonner';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  deletedAt?: string;
}

export function UserManagement() {
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(50);
  const [totalUsers, setTotalUsers] = useState(0);
  
  // Create user dialog state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    role: 'User' // Default to "User" role
  });
  const [isCreating, setIsCreating] = useState(false);

  // Fetch users from backend
  useEffect(() => {
    const fetchUsers = async () => {
      if (!token) return;

      try {
        setLoading(true);
        setError(null);
        const data: any = await adminApi.getAllUsers(token, pageNumber, pageSize, searchTerm || undefined);
        setUsers(data.items || data || []);
        setTotalUsers(data.totalCount || data.length || 0);
      } catch (err: any) {
        console.error('Error fetching users:', err);
        setError(err.message || 'Failed to load users');
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token, pageNumber, pageSize, searchTerm]);

  // Refresh users list
  const refreshUsers = async () => {
    if (!token) return;
    try {
      const data: any = await adminApi.getAllUsers(token, pageNumber, pageSize, searchTerm || undefined);
      setUsers(data.items || data || []);
    } catch (err) {
      console.error('Error refreshing users:', err);
    }
  };

  // Handle user actions
  const handleSuspendUser = async (userId: number) => {
    if (!token) {
      toast.error('Authentication required');
      return;
    }

    // Prevent self-suspension
    if (currentUser && parseInt(currentUser.id) === userId) {
      toast.error('You cannot suspend your own account');
      return;
    }

    if (!confirm('Are you sure you want to suspend this user?')) return;

    try {
      const reason = prompt('Enter suspension reason:') || 'No reason provided';
      if (!reason) return; // User cancelled
      
      console.log('Suspending user:', userId, 'Reason:', reason);
      await adminApi.suspendUser(userId, reason, token);
      toast.success('User suspended successfully');
      await refreshUsers();
    } catch (err: any) {
      console.error('Error suspending user:', err);
      toast.error(err.message || 'Failed to suspend user');
    }
  };

  const handleActivateUser = async (userId: number) => {
    if (!token) {
      toast.error('Authentication required');
      return;
    }

    if (!confirm('Are you sure you want to activate this user?')) return;

    try {
      console.log('Activating user:', userId);
      await adminApi.activateUser(userId, token);
      toast.success('User activated successfully');
      await refreshUsers();
    } catch (err: any) {
      console.error('Error activating user:', err);
      toast.error(err.message || 'Failed to activate user');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!token) {
      toast.error('Authentication required');
      return;
    }

    // Prevent self-deletion
    if (currentUser && parseInt(currentUser.id) === userId) {
      toast.error('You cannot delete your own account');
      return;
    }

    if (!confirm('Are you sure you want to permanently delete this user? This action cannot be undone and the user will be removed from the database.')) return;

    try {
      console.log('Deleting user:', userId);
      await adminApi.deleteUser(userId, token);
      toast.success('User permanently deleted from database');
      await refreshUsers();
    } catch (err: any) {
      console.error('Error deleting user:', err);
      toast.error(err.message || 'Failed to delete user');
    }
  };

  // Handle create user
  const handleCreateUser = async () => {
    if (!token) {
      toast.error('Authentication required');
      return;
    }

    // Validation
    if (!newUser.username || !newUser.email || !newUser.password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (newUser.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      setIsCreating(true);
      await adminApi.createUser(newUser, token);
      toast.success('User created successfully');
      setIsCreateDialogOpen(false);
      setNewUser({ username: '', email: '', password: '', role: 'User' }); // Reset to default "User" role
      await refreshUsers();
    } catch (err: any) {
      console.error('Error creating user:', err);
      toast.error(err.message || 'Failed to create user');
    } finally {
      setIsCreating(false);
    }
  };

  // Handle update user role
  const handleUpdateRole = async (userId: number, newRole: string) => {
    if (!token) {
      toast.error('Authentication required');
      return;
    }

    try {
      await adminApi.updateUserRole(userId, newRole, token);
      toast.success(`User role updated to ${newRole}`);
      await refreshUsers();
    } catch (err: any) {
      console.error('Error updating user role:', err);
      toast.error(err.message || 'Failed to update user role');
    }
  };

  const getStatusBadge = (user: User) => {
    const status = getUserStatus(user);
    const statusColors = {
      active: 'bg-green-100 text-green-800',
      suspended: 'bg-orange-100 text-orange-800',
      deleted: 'bg-red-100 text-red-800',
      inactive: 'bg-gray-100 text-gray-800',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Get user status from backend fields
  const getUserStatus = (user: User): string => {
    if (user.deletedAt) return 'deleted';
    return user.isActive ? 'active' : 'suspended';
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || getUserStatus(user) === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage user accounts and permissions</p>
        </div>
        <div className="flex gap-3">
          <Button 
            className="bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Create User
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>
                  Add a new user to the system with a specific role
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="Enter username"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password (min 6 characters)"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={newUser.role} onValueChange={(value: string) => setNewUser({ ...newUser, role: value })}>
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="User">User</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={isCreating}>
                  Cancel
                </Button>
                <Button onClick={handleCreateUser} disabled={isCreating}>
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create User'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button className="bg-black text-white hover:bg-gray-800">
            <Download className="w-4 h-4 mr-2" />
            Export Users
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-semibold text-gray-900">{totalUsers.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Users</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-semibold text-green-600">
              {users.filter(u => u.isActive && !u.deletedAt).length.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Active Users</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-semibold text-orange-600">
              {users.filter(u => !u.isActive && !u.deletedAt).length.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Inactive</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-semibold text-red-600">
              {users.filter(u => u.deletedAt).length.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Suspended</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <CardTitle>User Directory</CardTitle>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="deleted">Deleted</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                  <SelectItem value="activity">Last Activity</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              <span className="ml-3 text-gray-600">Loading users...</span>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Users</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </div>
            </div>
          )}

          {/* Users Table */}
          {!loading && !error && (
            <div className="relative">
              <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        No users found matching your criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-gray-200">
                            {user.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-gray-900">{user.username}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(user)}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" sideOffset={5}>
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            View Profile
                          </DropdownMenuItem>
                          {currentUser && parseInt(currentUser.id) === user.id ? (
                            <DropdownMenuItem disabled className="text-gray-400">
                              <Ban className="w-4 h-4 mr-2" />
                              Cannot modify own account
                            </DropdownMenuItem>
                          ) : getUserStatus(user) === 'deleted' ? (
                            <DropdownMenuItem disabled className="text-gray-400">
                              <Trash2 className="w-4 h-4 mr-2" />
                              User Deleted
                            </DropdownMenuItem>
                          ) : (
                            <>
                              <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">Change Role</div>
                              {user.role !== 'User' && (
                                <DropdownMenuItem 
                                  onClick={() => handleUpdateRole(user.id, 'User')}
                                >
                                  <UserPlus className="w-4 h-4 mr-2" />
                                  Set as User
                                </DropdownMenuItem>
                              )}
                              {user.role !== 'Admin' && (
                                <DropdownMenuItem 
                                  onClick={() => handleUpdateRole(user.id, 'Admin')}
                                >
                                  <UserPlus className="w-4 h-4 mr-2" />
                                  Set as Admin
                                </DropdownMenuItem>
                              )}
                              <div className="my-1 h-px bg-gray-200" />
                              {getUserStatus(user) === 'active' ? (
                                <DropdownMenuItem 
                                  className="text-orange-600"
                                  onClick={() => handleSuspendUser(user.id)}
                                >
                                  <Ban className="w-4 h-4 mr-2" />
                                  Suspend User
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem 
                                  className="text-green-600"
                                  onClick={() => handleActivateUser(user.id)}
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Activate User
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete User
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              </div>
            </div>
          )}
          
          {/* Pagination */}
          {!loading && !error && filteredUsers.length > 0 && (
            <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-500">
              Showing {filteredUsers.length} of {users.length} users
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" className="bg-black text-white">
                1
              </Button>
              <Button variant="outline" size="sm">
                2
              </Button>
              <Button variant="outline" size="sm">
                3
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}