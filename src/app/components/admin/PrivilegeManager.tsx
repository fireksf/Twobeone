import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Shield, ShieldCheck, ShieldOff, UserCheck, UserX, Search, Clock, AlertCircle, CheckCircle, XCircle, Users } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

interface User {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  hasPartner: boolean;
  createdAt: string;
}

interface Admin {
  id: string;
  email: string;
  name: string;
  addedAt: string;
}

interface ActivityLog {
  action: 'granted' | 'revoked';
  targetUser: {
    id: string;
    email: string;
    name: string;
  };
  performedBy: {
    id?: string;
    email: string;
    name?: string;
  };
  timestamp: string;
}

interface PrivilegeManagerProps {
  accessToken?: string;
}

export function PrivilegeManager({ accessToken }: PrivilegeManagerProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'users' | 'admins' | 'activity'>('users');
  const [processingUserId, setProcessingUserId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [accessToken]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadUsers(),
        loadAdmins(),
        loadActivityLog()
      ]);
    } catch (error) {
      console.error('Error loading privilege data:', error);
      toast.error('Failed to load privilege data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6d579fee/admin/privileges/users`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken || publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load users');
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
      throw error;
    }
  };

  const loadAdmins = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6d579fee/admin/privileges/list`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken || publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load admins');
      }

      const data = await response.json();
      setAdmins(data.admins || []);
    } catch (error) {
      console.error('Error loading admins:', error);
      throw error;
    }
  };

  const loadActivityLog = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6d579fee/admin/privileges/activity-log`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken || publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load activity log');
      }

      const data = await response.json();
      setActivityLog(data.activityLog || []);
    } catch (error) {
      console.error('Error loading activity log:', error);
      throw error;
    }
  };

  const grantAdminPrivilege = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const confirmMessage = `Are you sure you want to grant admin privileges to ${user.email}?\n\nThis will give them full access to:\n• Admin Panel\n• Content Management\n• User Management\n• System Statistics`;
    
    if (!confirm(confirmMessage)) return;

    setProcessingUserId(userId);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6d579fee/admin/privileges/grant`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken || publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ targetUserId: userId })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to grant admin privilege');
      }

      toast.success(`Admin privileges granted to ${user.email}`);
      await loadData();
    } catch (error: any) {
      console.error('Error granting admin privilege:', error);
      toast.error(error.message || 'Failed to grant admin privilege');
    } finally {
      setProcessingUserId(null);
    }
  };

  const revokeAdminPrivilege = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const confirmMessage = `Are you sure you want to revoke admin privileges from ${user.email}?\n\nThey will lose access to:\n• Admin Panel\n• Content Management\n• User Management\n• System Statistics\n\nNote: You cannot revoke your own admin privileges.`;
    
    if (!confirm(confirmMessage)) return;

    setProcessingUserId(userId);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6d579fee/admin/privileges/revoke`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken || publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ targetUserId: userId })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to revoke admin privilege');
      }

      toast.success(`Admin privileges revoked from ${user.email}`);
      await loadData();
    } catch (error: any) {
      console.error('Error revoking admin privilege:', error);
      toast.error(error.message || 'Failed to revoke admin privilege');
    } finally {
      setProcessingUserId(null);
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold mb-2">User Privilege Management</h2>
        <p className="text-sm text-gray-600">Manage admin privileges and monitor access control</p>
      </div>

      {/* Stats Overview - Enhanced Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="overflow-hidden border-2 border-gray-200 hover:border-blue-300 transition-all hover:shadow-lg">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{users.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-700" />
              </div>
            </div>
            <div className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" style={{ width: '75%' }} />
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-2 border-gray-200 hover:border-purple-300 transition-all hover:shadow-lg">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Active Admins</p>
                <p className="text-3xl font-bold text-gray-900">{admins.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-purple-700" />
              </div>
            </div>
            <div className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full" style={{ width: '60%' }} />
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-2 border-gray-200 hover:border-green-300 transition-all hover:shadow-lg">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Recent Changes</p>
                <p className="text-3xl font-bold text-gray-900">{activityLog.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-700" />
              </div>
            </div>
            <div className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full" style={{ width: '85%' }} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="p-3 sm:p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search users by email or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 text-base"
          />
        </div>
      </Card>

      {/* Tabs */}
      <Card className="overflow-hidden">
        <div className="bg-gray-50 border-b-2 border-gray-300 px-4 py-3">
          <div className="flex gap-2">
            <Button
              variant={selectedTab === 'users' ? 'default' : 'ghost'}
              onClick={() => setSelectedTab('users')}
              className="text-sm font-medium"
              size="sm"
            >
              <UserCheck className="w-4 h-4 mr-2" />
              All Users
            </Button>
            <Button
              variant={selectedTab === 'admins' ? 'default' : 'ghost'}
              onClick={() => setSelectedTab('admins')}
              className="text-sm font-medium"
              size="sm"
            >
              <ShieldCheck className="w-4 h-4 mr-2" />
              Admins ({admins.length})
            </Button>
            <Button
              variant={selectedTab === 'activity' ? 'default' : 'ghost'}
              onClick={() => setSelectedTab('activity')}
              className="text-sm font-medium"
              size="sm"
            >
              <Clock className="w-4 h-4 mr-2" />
              Activity Log
            </Button>
          </div>
        </div>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <p className="text-gray-600 mt-2 text-sm">Loading...</p>
            </div>
          ) : (
            <>
              {/* All Users Tab - Table View */}
              {selectedTab === 'users' && (
                <div className="overflow-x-auto">
                  {/* Desktop Table */}
                  <div className="hidden lg:block">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gradient-to-b from-gray-100 to-gray-200 border-b-2 border-gray-400">
                          <th className="px-4 py-3 text-left text-sm font-bold text-gray-800 border-r border-gray-300">Email</th>
                          <th className="px-4 py-3 text-left text-sm font-bold text-gray-800 border-r border-gray-300">Name</th>
                          <th className="px-4 py-3 text-center text-sm font-bold text-gray-800 border-r border-gray-300">Status</th>
                          <th className="px-4 py-3 text-center text-sm font-bold text-gray-800 border-r border-gray-300">Joined</th>
                          <th className="px-4 py-3 text-center text-sm font-bold text-gray-800">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="text-center py-12 bg-gray-50 border-t border-gray-300">
                              <UserX className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                              <p className="text-base font-semibold text-gray-700">No users found</p>
                              <p className="text-sm text-gray-600">Try adjusting your search</p>
                            </td>
                          </tr>
                        ) : (
                          filteredUsers.map((user, index) => (
                            <tr
                              key={user.id}
                              className={`border-b border-gray-300 transition-colors hover:bg-blue-50 ${
                                index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                              }`}
                            >
                              <td className="px-4 py-3 border-r border-gray-300">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-sm text-gray-900 truncate">{user.email}</p>
                                  {user.hasPartner && (
                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full flex-shrink-0 font-medium">
                                      Coupled
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3 border-r border-gray-300">
                                <p className="text-sm text-gray-900 truncate">{user.name}</p>
                              </td>
                              <td className="px-4 py-3 border-r border-gray-300 text-center">
                                {user.isAdmin ? (
                                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-700 text-white text-xs rounded-full font-semibold border border-purple-800">
                                    <ShieldCheck className="w-3 h-3" />
                                    Admin
                                  </span>
                                ) : (
                                  <span className="text-sm text-gray-500 italic">User</span>
                                )}
                              </td>
                              <td className="px-4 py-3 border-r border-gray-300 text-center bg-gray-50">
                                <p className="text-xs text-gray-600">{formatDate(user.createdAt)}</p>
                              </td>
                              <td className="px-4 py-3 text-center">
                                {user.isAdmin ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => revokeAdminPrivilege(user.id)}
                                    disabled={processingUserId === user.id}
                                    className="text-red-700 hover:text-red-800 hover:bg-red-100 font-medium"
                                  >
                                    {processingUserId === user.id ? (
                                      <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-1"></div>
                                        Revoking...
                                      </>
                                    ) : (
                                      <>
                                        <ShieldOff className="w-4 h-4 mr-1" />
                                        Revoke Admin
                                      </>
                                    )}
                                  </Button>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => grantAdminPrivilege(user.id)}
                                    disabled={processingUserId === user.id}
                                    className="text-green-700 hover:text-green-800 hover:bg-green-100 font-medium"
                                  >
                                    {processingUserId === user.id ? (
                                      <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-1"></div>
                                        Granting...
                                      </>
                                    ) : (
                                      <>
                                        <ShieldCheck className="w-4 h-4 mr-1" />
                                        Grant Admin
                                      </>
                                    )}
                                  </Button>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="lg:hidden divide-y divide-gray-200">
                    {filteredUsers.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <UserX className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-base font-medium">No users found</p>
                        <p className="text-sm">Try adjusting your search</p>
                      </div>
                    ) : (
                      filteredUsers.map((user) => (
                        <div key={user.id} className="p-4">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold text-base truncate">{user.email}</p>
                                {user.isAdmin && (
                                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full flex items-center gap-1 flex-shrink-0 font-medium">
                                    <ShieldCheck className="w-3 h-3" />
                                    Admin
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 truncate">{user.name}</p>
                              <p className="text-xs text-gray-400 mt-1">Joined {formatDate(user.createdAt)}</p>
                            </div>
                            {user.hasPartner && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full flex-shrink-0 font-medium">
                                Coupled
                              </span>
                            )}
                          </div>

                          <div className="flex gap-2">
                            {user.isAdmin ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => revokeAdminPrivilege(user.id)}
                                disabled={processingUserId === user.id}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 text-sm flex-1"
                              >
                                {processingUserId === user.id ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-1"></div>
                                    Revoking...
                                  </>
                                ) : (
                                  <>
                                    <ShieldOff className="w-4 h-4 mr-1" />
                                    Revoke Admin
                                  </>
                                )}
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => grantAdminPrivilege(user.id)}
                                disabled={processingUserId === user.id}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50 text-sm flex-1"
                              >
                                {processingUserId === user.id ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-1"></div>
                                    Granting...
                                  </>
                                ) : (
                                  <>
                                    <ShieldCheck className="w-4 h-4 mr-1" />
                                    Grant Admin
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Admins Tab */}
              {selectedTab === 'admins' && (
                <div className="space-y-2">
                  {admins.length === 0 ? (
                    <div className="text-center py-12">
                      <ShieldOff className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-600 text-xs sm:text-sm">No admins found</p>
                    </div>
                  ) : (
                    admins
                      .filter(admin =>
                        admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        admin.name.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((admin) => (
                        <div
                          key={admin.id}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-indigo-50 gap-3"
                        >
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-200 flex items-center justify-center flex-shrink-0">
                              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-purple-700" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-sm sm:text-base truncate">{admin.email}</p>
                              <p className="text-xs sm:text-sm text-gray-600 truncate">{admin.name}</p>
                              <p className="text-xs text-gray-400">Admin since {formatDate(admin.addedAt)}</p>
                            </div>
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => revokeAdminPrivilege(admin.id)}
                            disabled={processingUserId === admin.id}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs w-full sm:w-auto"
                          >
                            {processingUserId === admin.id ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-red-600 mr-1 sm:mr-2"></div>
                                <span className="hidden sm:inline">Revoking...</span>
                                <span className="sm:hidden">...</span>
                              </>
                            ) : (
                              <>
                                <ShieldOff className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                Revoke
                              </>
                            )}
                          </Button>
                        </div>
                      ))
                  )}
                </div>
              )}

              {/* Activity Log Tab */}
              {selectedTab === 'activity' && (
                <div className="space-y-2">
                  {activityLog.length === 0 ? (
                    <div className="text-center py-12">
                      <Clock className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-600 text-xs sm:text-sm">No activity recorded</p>
                    </div>
                  ) : (
                    activityLog.map((log, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 sm:gap-4 p-3 sm:p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          log.action === 'granted' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {log.action === 'granted' ? (
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm sm:text-base">
                            {log.action === 'granted' ? 'Admin Privileges Granted' : 'Admin Privileges Revoked'}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600 mt-1">
                            <span className="font-medium">{log.performedBy.email}</span>
                            {' '}{log.action === 'granted' ? 'granted' : 'revoked'} admin privileges
                            {' '}{log.action === 'granted' ? 'to' : 'from'}{' '}
                            <span className="font-medium">{log.targetUser.email}</span>
                          </p>
                          <p className="text-xs text-gray-400 mt-1">{formatDate(log.timestamp)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Warning Notice */}
      <Card className="border-orange-300 bg-orange-50">
        <CardContent className="p-3 sm:p-4">
          <div className="flex gap-2 sm:gap-3">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm min-w-0">
              <p className="font-medium text-orange-900">Important Security Notice</p>
              <p className="text-orange-700 mt-1">
                Admin privileges grant full access to all system features including content management, 
                user data, and system configuration. Only grant admin access to trusted users. 
                All privilege changes are logged for security audit purposes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}