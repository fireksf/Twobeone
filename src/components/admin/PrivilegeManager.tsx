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
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8" />
            <div>
              <CardTitle className="text-2xl">User Privilege Management</CardTitle>
              <CardDescription className="text-purple-100">
                Manage admin privileges and monitor access control
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Total Users</p>
                <p className="text-2xl sm:text-3xl font-bold mt-1">{users.length}</p>
              </div>
              <Users className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 opacity-75" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Active Admins</p>
                <p className="text-2xl sm:text-3xl font-bold mt-1">{admins.length}</p>
              </div>
              <ShieldCheck className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600 opacity-75" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Recent Changes</p>
                <p className="text-2xl sm:text-3xl font-bold mt-1">{activityLog.length}</p>
              </div>
              <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-green-600 opacity-75" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="p-3 sm:p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search users by email or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 sm:pl-10 text-xs sm:text-sm"
          />
        </div>
      </Card>

      {/* Tabs */}
      <Card>
        <CardHeader>
          <div className="flex gap-2 border-b pb-2">
            <Button
              variant={selectedTab === 'users' ? 'default' : 'ghost'}
              onClick={() => setSelectedTab('users')}
              className="flex-1"
            >
              <UserCheck className="w-4 h-4 mr-2" />
              All Users
            </Button>
            <Button
              variant={selectedTab === 'admins' ? 'default' : 'ghost'}
              onClick={() => setSelectedTab('admins')}
              className="flex-1"
            >
              <ShieldCheck className="w-4 h-4 mr-2" />
              Admins ({admins.length})
            </Button>
            <Button
              variant={selectedTab === 'activity' ? 'default' : 'ghost'}
              onClick={() => setSelectedTab('activity')}
              className="flex-1"
            >
              <Clock className="w-4 h-4 mr-2" />
              Activity Log
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <p className="text-gray-600 mt-2">Loading...</p>
            </div>
          ) : (
            <>
              {/* All Users Tab */}
              {selectedTab === 'users' && (
                <div className="space-y-2">
                  {filteredUsers.length === 0 ? (
                    <div className="text-center py-12">
                      <UserX className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-600">No users found</p>
                    </div>
                  ) : (
                    filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{user.email}</p>
                            {user.isAdmin && (
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" />
                                Admin
                              </span>
                            )}
                            {user.hasPartner && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                                Coupled
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{user.name}</p>
                          <p className="text-xs text-gray-400">Joined {formatDate(user.createdAt)}</p>
                        </div>

                        <div className="flex gap-2">
                          {user.isAdmin ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => revokeAdminPrivilege(user.id)}
                              disabled={processingUserId === user.id}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              {processingUserId === user.id ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
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
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              {processingUserId === user.id ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
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
              )}

              {/* Admins Tab */}
              {selectedTab === 'admins' && (
                <div className="space-y-2">
                  {admins.length === 0 ? (
                    <div className="text-center py-12">
                      <ShieldOff className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-600">No admins found</p>
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
                          className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-indigo-50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center">
                              <ShieldCheck className="w-5 h-5 text-purple-700" />
                            </div>
                            <div>
                              <p className="font-medium">{admin.email}</p>
                              <p className="text-sm text-gray-600">{admin.name}</p>
                              <p className="text-xs text-gray-400">Admin since {formatDate(admin.addedAt)}</p>
                            </div>
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => revokeAdminPrivilege(admin.id)}
                            disabled={processingUserId === admin.id}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            {processingUserId === admin.id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                                Revoking...
                              </>
                            ) : (
                              <>
                                <ShieldOff className="w-4 h-4 mr-1" />
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
                      <Clock className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-600">No activity recorded</p>
                    </div>
                  ) : (
                    activityLog.map((log, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          log.action === 'granted' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {log.action === 'granted' ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">
                            {log.action === 'granted' ? 'Admin Privileges Granted' : 'Admin Privileges Revoked'}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
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
        <CardContent className="p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
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