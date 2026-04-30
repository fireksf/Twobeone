import { useState, useEffect } from 'react';
import { Search, Users, Heart, TrendingUp, Calendar, RefreshCw, Trash2, Mail, UserCircle } from 'lucide-react';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
  partnerId: string | null;
  partnerName: string | null;
  joinedDate: string;
  lastActive: string;
  completedDays: number;
  journalEntries: number;
  prayerRequests: number;
  status: 'active' | 'inactive';
}

interface UsersManagerProps {
  accessToken?: string;
}

export function UsersManager({ accessToken }: UsersManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6d579fee/admin/users`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken || publicAnonKey}`
          }
        }
      );

      if (response.ok) {
        const { users: apiUsers } = await response.json();
        
        // Transform API data to match User interface
        const transformedUsers = apiUsers.map((u: any) => ({
          id: u.id,
          name: u.name || 'Unknown User',
          email: u.email,
          partnerId: u.partnerId || null,
          partnerName: u.partnerName || null,
          joinedDate: u.createdAt || u.relationshipStart || new Date().toISOString(),
          lastActive: u.createdAt || new Date().toISOString(),
          completedDays: 0, // Will be enhanced later with real completion data
          journalEntries: 0, // Will be enhanced later
          prayerRequests: 0, // Will be enhanced later
          status: 'active' as const
        }));

        setUsers(transformedUsers);
      } else {
        throw new Error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  // Group users into couples
  const couples = users.reduce((acc, user) => {
    if (user.partnerId) {
      const coupleId = [user.id, user.partnerId].sort().join('-');
      if (!acc.find(c => c.id === coupleId)) {
        const partner = users.find(u => u.id === user.partnerId);
        if (partner) {
          acc.push({
            id: coupleId,
            user1: user,
            user2: partner,
          });
        }
      }
    }
    return acc;
  }, [] as Array<{ id: string; user1: User; user2: User }>);

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCouples = couples.filter(c =>
    c.user1.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.user2.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.user1.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.user2.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    totalUsers: users.length,
    activeCouples: couples.length,
    activeToday: users.filter(u => {
      const lastActive = new Date(u.lastActive);
      const today = new Date();
      return lastActive.toDateString() === today.toDateString();
    }).length,
    avgCompletion: Math.round(users.reduce((acc, u) => acc + u.completedDays, 0) / users.length),
  };

  const handleDeleteUser = async (userId: string) => {
    setIsDeleting(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6d579fee/admin/users/${userId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken || publicAnonKey}`
          }
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete user');
      }

      const result = await response.json();
      toast.success(result.message || 'User deleted successfully');
      
      // Reload users
      await loadUsers();
      setUserToDelete(null);
    } catch (error: any) {
      console.error('Failed to delete user:', error);
      toast.error(error.message || 'Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold mb-2">User Management</h2>
        <p className="text-sm text-gray-600">View and manage registered users and couples</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-1 sm:mb-2">
            <Users className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <p className="text-sm font-medium text-gray-600 truncate">Total Users</p>
          </div>
          <p className="text-2xl font-bold">{stats.totalUsers}</p>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-1 sm:mb-2">
            <Heart className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <p className="text-sm font-medium text-gray-600 truncate">Active Couples</p>
          </div>
          <p className="text-2xl font-bold">{stats.activeCouples}</p>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-1 sm:mb-2">
            <TrendingUp className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-sm font-medium text-gray-600 truncate">Active Today</p>
          </div>
          <p className="text-2xl font-bold">{stats.activeToday}</p>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-1 sm:mb-2">
            <Calendar className="w-5 h-5 text-purple-600 flex-shrink-0" />
            <p className="text-sm font-medium text-gray-600 truncate">Avg Completion</p>
          </div>
          <p className="text-2xl font-bold">{stats.avgCompletion} days</p>
        </Card>
      </div>

      {/* Search */}
      <Card className="p-3 sm:p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 text-base"
          />
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="couples">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="couples" className="text-sm font-medium">
            <Heart className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Couples View</span>
            <span className="sm:hidden">Couples</span>
          </TabsTrigger>
          <TabsTrigger value="individuals" className="text-sm font-medium">
            <Users className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Individual Users</span>
            <span className="sm:hidden">Individual</span>
          </TabsTrigger>
        </TabsList>

        {/* Couples View */}
        <TabsContent value="couples" className="mt-3 sm:mt-4">
          <Card className="overflow-hidden border-2 border-gray-300 shadow-sm">
            {/* Desktop Table View - Excel Style */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-b from-gray-100 to-gray-200 border-b-2 border-gray-400">
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-800 border-r border-gray-300">Couple</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-800 border-r border-gray-300">Partner 1</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-800 border-r border-gray-300">Partner 2</th>
                    <th className="px-4 py-3 text-center text-sm font-bold text-gray-800 border-r border-gray-300">Days</th>
                    <th className="px-4 py-3 text-center text-sm font-bold text-gray-800 border-r border-gray-300">Journal</th>
                    <th className="px-4 py-3 text-center text-sm font-bold text-gray-800 border-r border-gray-300">Prayers</th>
                    <th className="px-4 py-3 text-center text-sm font-bold text-gray-800">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCouples.map((couple, index) => (
                    <tr 
                      key={couple.id} 
                      className={`border-b border-gray-300 transition-colors hover:bg-blue-50 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <td className="px-4 py-3 border-r border-gray-300">
                        <div className="flex items-center gap-3">
                          <Heart className="w-5 h-5 text-rose-600 fill-rose-600 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-gray-900">
                              {couple.user1.name} & {couple.user2.name}
                            </p>
                            <p className="text-xs text-gray-600">
                              Since {new Date(couple.user1.joinedDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 border-r border-gray-300">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8 flex-shrink-0 border-2 border-purple-200">
                            <AvatarFallback className="bg-purple-100 text-purple-700 text-xs font-semibold">
                              {couple.user1.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-medium text-sm text-gray-900 truncate">{couple.user1.name}</p>
                            <p className="text-xs text-gray-600 truncate">{couple.user1.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 border-r border-gray-300">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8 flex-shrink-0 border-2 border-rose-200">
                            <AvatarFallback className="bg-rose-100 text-rose-700 text-xs font-semibold">
                              {couple.user2.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-medium text-sm text-gray-900 truncate">{couple.user2.name}</p>
                            <p className="text-xs text-gray-600 truncate">{couple.user2.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 border-r border-gray-300 text-center bg-gray-50">
                        <p className="text-sm font-bold text-gray-900">
                          {couple.user1.completedDays + couple.user2.completedDays}
                        </p>
                      </td>
                      <td className="px-4 py-3 border-r border-gray-300 text-center bg-gray-50">
                        <p className="text-sm font-bold text-gray-900">
                          {couple.user1.journalEntries + couple.user2.journalEntries}
                        </p>
                      </td>
                      <td className="px-4 py-3 border-r border-gray-300 text-center bg-gray-50">
                        <p className="text-sm font-bold text-gray-900">
                          {couple.user1.prayerRequests + couple.user2.prayerRequests}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge className="bg-green-700 text-white text-xs font-semibold px-3 py-1 border border-green-800">
                          Active
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredCouples.length === 0 && (
                <div className="text-center py-12 text-gray-500 bg-gray-50 border-t border-gray-300">
                  <Heart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-base font-semibold text-gray-700">No couples found</p>
                  <p className="text-sm text-gray-600">Try adjusting your search</p>
                </div>
              )}
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden divide-y divide-gray-200">
              {filteredCouples.map((couple) => (
                <div key={couple.id} className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Heart className="w-5 h-5 text-rose-600 fill-rose-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base">
                        {couple.user1.name} & {couple.user2.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Since {new Date(couple.user1.joinedDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="default" className="bg-green-600 text-xs flex-shrink-0">Active</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {/* User 1 */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarFallback className="bg-purple-100 text-purple-700 text-xs">
                            {couple.user1.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">{couple.user1.name}</p>
                          <p className="text-xs text-gray-600 truncate">{couple.user1.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* User 2 */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarFallback className="bg-rose-100 text-rose-700 text-xs">
                            {couple.user2.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">{couple.user2.name}</p>
                          <p className="text-xs text-gray-600 truncate">{couple.user2.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-3 border-t">
                    <div className="text-center">
                      <p className="text-xs text-gray-600 mb-1">Days</p>
                      <p className="text-base font-semibold">{couple.user1.completedDays + couple.user2.completedDays}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600 mb-1">Journal</p>
                      <p className="text-base font-semibold">{couple.user1.journalEntries + couple.user2.journalEntries}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600 mb-1">Prayers</p>
                      <p className="text-base font-semibold">{couple.user1.prayerRequests + couple.user2.prayerRequests}</p>
                    </div>
                  </div>
                </div>
              ))}
              {filteredCouples.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Heart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-base font-medium">No couples found</p>
                  <p className="text-sm">Try adjusting your search</p>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Individual Users View */}
        <TabsContent value="individuals" className="mt-3 sm:mt-4">
          <Card className="overflow-hidden border-2 border-gray-300 shadow-sm">
            {/* Desktop Table View - Excel Style */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-b from-gray-100 to-gray-200 border-b-2 border-gray-400">
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-800 border-r border-gray-300">User</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-800 border-r border-gray-300">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-800 border-r border-gray-300">Partner</th>
                    <th className="px-4 py-3 text-center text-sm font-bold text-gray-800 border-r border-gray-300">Joined</th>
                    <th className="px-4 py-3 text-center text-sm font-bold text-gray-800 border-r border-gray-300">Days</th>
                    <th className="px-4 py-3 text-center text-sm font-bold text-gray-800 border-r border-gray-300">Journal</th>
                    <th className="px-4 py-3 text-center text-sm font-bold text-gray-800 border-r border-gray-300">Prayers</th>
                    <th className="px-4 py-3 text-center text-sm font-bold text-gray-800 border-r border-gray-300">Status</th>
                    <th className="px-4 py-3 text-center text-sm font-bold text-gray-800">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, index) => (
                    <tr 
                      key={user.id} 
                      className={`border-b border-gray-300 transition-colors hover:bg-blue-50 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <td className="px-4 py-3 border-r border-gray-300">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8 flex-shrink-0 border-2 border-purple-200">
                            <AvatarFallback className="bg-purple-100 text-purple-700 text-xs font-semibold">
                              {user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-gray-900 truncate">{user.name}</p>
                            <p className="text-xs text-gray-600">
                              Last: {new Date(user.lastActive).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 border-r border-gray-300">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Mail className="w-4 h-4 flex-shrink-0 text-gray-500" />
                          <span className="truncate font-medium">{user.email}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 border-r border-gray-300">
                        {user.partnerId ? (
                          <div className="flex items-center gap-2">
                            <Heart className="w-4 h-4 text-rose-600 fill-rose-600 flex-shrink-0" />
                            <span className="text-sm font-medium text-gray-900 truncate">{user.partnerName}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500 italic">Single</span>
                        )}
                      </td>
                      <td className="px-4 py-3 border-r border-gray-300 text-center bg-gray-50">
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(user.joinedDate).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-4 py-3 border-r border-gray-300 text-center bg-gray-50">
                        <p className="text-sm font-bold text-gray-900">{user.completedDays}</p>
                      </td>
                      <td className="px-4 py-3 border-r border-gray-300 text-center bg-gray-50">
                        <p className="text-sm font-bold text-gray-900">{user.journalEntries}</p>
                      </td>
                      <td className="px-4 py-3 border-r border-gray-300 text-center bg-gray-50">
                        <p className="text-sm font-bold text-gray-900">{user.prayerRequests}</p>
                      </td>
                      <td className="px-4 py-3 border-r border-gray-300 text-center">
                        <Badge 
                          className={`text-xs font-semibold px-3 py-1 border ${
                            user.status === 'active' 
                              ? 'bg-green-700 text-white border-green-800' 
                              : 'bg-gray-400 text-white border-gray-500'
                          }`}
                        >
                          {user.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-700 hover:text-red-800 hover:bg-red-100 font-medium"
                          onClick={() => setUserToDelete(user)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <div className="text-center py-12 text-gray-500 bg-gray-50 border-t border-gray-300">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-base font-semibold text-gray-700">No users found</p>
                  <p className="text-sm text-gray-600">Try adjusting your search</p>
                </div>
              )}
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <div key={user.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10 flex-shrink-0">
                      <AvatarFallback className="bg-purple-100 text-purple-700 text-sm">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-base">{user.name}</h3>
                        <Badge variant={user.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                          {user.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 truncate">{user.email}</p>
                      
                      {user.partnerId && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                          <Heart className="w-3 h-3 text-rose-500 fill-rose-500 flex-shrink-0" />
                          <span className="truncate">Partnered with {user.partnerName}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                        <div>
                          <p className="text-xs text-gray-600">Joined</p>
                          <p className="font-medium">{new Date(user.joinedDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Last Active</p>
                          <p className="font-medium">{new Date(user.lastActive).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 pt-3 border-t">
                        <div className="text-center">
                          <p className="text-xs text-gray-600 mb-1">Days</p>
                          <p className="text-base font-semibold">{user.completedDays}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-600 mb-1">Journal</p>
                          <p className="text-base font-semibold">{user.journalEntries}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-600 mb-1">Prayers</p>
                          <p className="text-base font-semibold">{user.prayerRequests}</p>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                      onClick={() => setUserToDelete(user)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {filteredUsers.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-base font-medium">No users found</p>
                  <p className="text-sm">Try adjusting your search</p>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base sm:text-lg">Delete User</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="text-xs sm:text-sm">
                <p>
                  Are you sure you want to delete <strong>{userToDelete?.name}</strong> ({userToDelete?.email})?
                </p>
                <p className="mt-3 sm:mt-4">This will permanently delete:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>User profile and account</li>
                  <li>All journal entries</li>
                  <li>All prayer requests</li>
                  <li>All milestones</li>
                  <li>All question responses</li>
                  <li>All devotional completions</li>
                  <li>Scripture memory progress</li>
                  {userToDelete?.partnerId && (
                    <li className="text-yellow-600">
                      <strong>Warning:</strong> This will unlink their partner ({userToDelete.partnerName})
                    </li>
                  )}
                </ul>
                <p className="mt-3 sm:mt-4">
                  <strong className="text-red-600">This action cannot be undone.</strong>
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel disabled={isDeleting} className="text-xs sm:text-sm">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => userToDelete && handleDeleteUser(userToDelete.id)}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-xs sm:text-sm"
            >
              {isDeleting ? 'Deleting...' : 'Delete User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}