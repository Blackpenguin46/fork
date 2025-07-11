'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/providers'
import { AuthService } from '@/lib/services/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, 
  UserPlus, 
  Shield, 
  Activity,
  Search,
  Crown,
  BarChart3,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Download,
  RefreshCw,
  Settings,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'
import Link from 'next/link'

interface UserStats {
  total_users: number
  admin_count: number
  super_admin_count: number
  free_users: number
  premium_users: number
  enterprise_users: number
  new_users_week: number
  new_users_month: number
}

interface UserActivity {
  id: string
  email: string
  username: string
  full_name: string
  role: string
  subscription_tier: string
  joined_at: string
  last_action: string
  last_activity: string
  last_action_success: boolean
}

interface AuditLog {
  id: string
  user_id: string
  action: string
  details: Record<string, any>
  success: boolean
  error_message?: string
  created_at: string
}

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth()
  
  const [stats, setStats] = useState<UserStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<UserActivity[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // Check if user is admin
  const isAdmin = user?.user_metadata?.role === 'admin' || user?.user_metadata?.role === 'super_admin'

  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      fetchAdminData()
    }
  }, [authLoading, user, isAdmin])

  const fetchAdminData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [statsResult, activityResult, auditResult] = await Promise.all([
        AuthService.getUserStats(),
        AuthService.getRecentUserActivity(50),
        AuthService.getAuthAuditLogs(undefined, 100)
      ])

      if (statsResult.success && statsResult.data) {
        setStats(statsResult.data)
      }

      if (activityResult.success && activityResult.data) {
        setRecentActivity(activityResult.data)
      }

      if (auditResult.success && auditResult.data) {
        setAuditLogs(auditResult.data)
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchAdminData()
    setRefreshing(false)
  }

  const handlePromoteUser = async (userId: string, role: 'admin' | 'super_admin') => {
    try {
      const result = await AuthService.promoteToAdmin(userId, role)
      if (result.success) {
        await fetchAdminData() // Refresh data
      } else {
        setError(result.error || 'Failed to promote user')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to promote user')
    }
  }

  const filteredActivity = recentActivity.filter(activity => 
    !searchQuery || 
    activity.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    activity.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    activity.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-red-500/10 text-red-400 border-red-500/20'
      case 'admin':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20'
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    }
  }

  const getSubscriptionColor = (tier: string) => {
    switch (tier) {
      case 'enterprise':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
      case 'premium':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      default:
        return 'bg-green-500/10 text-green-400 border-green-500/20'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  // Redirect if not admin
  if (!authLoading && (!user || !isAdmin)) {
    return (
      <div className="min-h-screen bg-deep-space-blue pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <Shield className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
            <p className="text-gray-400 mb-6">
              You don&apos;t have permission to access the admin dashboard.
            </p>
            <Button asChild>
              <Link href="/dashboard">Return to Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-deep-space-blue pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-700 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-700 rounded-lg"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-700 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-deep-space-blue pt-16">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-cyber-cyan" />
            <div>
              <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-xl text-gray-300">User management and system overview</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
              className="border-gray-600"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button asChild>
              <Link href="/admin/settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="bg-red-900/50 border-red-500/50 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <p className="text-red-400">{error}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setError(null)}
                  className="ml-auto"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Users</p>
                    <p className="text-3xl font-bold text-white">{stats.total_users.toLocaleString()}</p>
                  </div>
                  <Users className="h-8 w-8 text-cyber-cyan" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">New This Week</p>
                    <p className="text-3xl font-bold text-white">{stats.new_users_week}</p>
                  </div>
                  <UserPlus className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Premium Users</p>
                    <p className="text-3xl font-bold text-white">{stats.premium_users}</p>
                  </div>
                  <Crown className="h-8 w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Admins</p>
                    <p className="text-3xl font-bold text-white">{stats.admin_count + stats.super_admin_count}</p>
                  </div>
                  <Shield className="h-8 w-8 text-orange-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="bg-gray-800 border-gray-700">
            <TabsTrigger value="users" className="data-[state=active]:bg-cyber-cyan data-[state=active]:text-black">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-cyber-cyan data-[state=active]:text-black">
              <Activity className="h-4 w-4 mr-2" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="audit" className="data-[state=active]:bg-cyber-cyan data-[state=active]:text-black">
              <BarChart3 className="h-4 w-4 mr-2" />
              Audit Log
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">User Management</CardTitle>
                    <CardDescription className="text-gray-400">
                      Manage user accounts and permissions
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-64 bg-gray-900 border-gray-600"
                      />
                    </div>
                    <Button variant="outline" className="border-gray-600">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredActivity.map((user) => (
                    <div key={user.id} className="p-4 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-cyber-cyan/10 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-cyber-cyan" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <p className="font-medium text-white">{user.full_name || user.username}</p>
                              <Badge variant="outline" className={getRoleColor(user.role)}>
                                {user.role}
                              </Badge>
                              <Badge variant="outline" className={getSubscriptionColor(user.subscription_tier)}>
                                {user.subscription_tier}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-400">{user.email}</p>
                            <p className="text-xs text-gray-500">
                              Joined {formatDate(user.joined_at)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className="text-right text-sm text-gray-400">
                            {user.last_action && (
                              <div className="flex items-center space-x-1">
                                {user.last_action_success ? (
                                  <CheckCircle className="h-3 w-3 text-green-400" />
                                ) : (
                                  <XCircle className="h-3 w-3 text-red-400" />
                                )}
                                <span>{user.last_action}</span>
                              </div>
                            )}
                            {user.last_activity && (
                              <p className="text-xs text-gray-500">
                                {formatDate(user.last_activity)}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            {user.role === 'user' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handlePromoteUser(user.id, 'admin')}
                              >
                                <Crown className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Recent Activity</CardTitle>
                <CardDescription className="text-gray-400">
                  Latest user actions and system events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.slice(0, 20).map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-700/20 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.last_action_success ? 'bg-green-400' : 'bg-red-400'
                        }`} />
                        <div>
                          <p className="text-sm text-white">
                            <span className="font-medium">{activity.username || activity.email}</span>
                            <span className="text-gray-400 ml-2">{activity.last_action}</span>
                          </p>
                          <p className="text-xs text-gray-500">{formatDate(activity.last_activity)}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={getRoleColor(activity.role)}>
                        {activity.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Log Tab */}
          <TabsContent value="audit">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Audit Log</CardTitle>
                    <CardDescription className="text-gray-400">
                      Detailed system audit trail
                    </CardDescription>
                  </div>
                  <Button variant="outline" className="border-gray-600">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {auditLogs.slice(0, 50).map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 bg-gray-700/10 rounded border border-gray-700/50">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          log.success ? 'bg-green-400' : 'bg-red-400'
                        }`} />
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-white">{log.action}</p>
                            {!log.success && (
                              <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20">
                                Failed
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-400">
                            {log.user_id} • {formatDate(log.created_at)}
                          </p>
                          {log.error_message && (
                            <p className="text-xs text-red-400 mt-1">{log.error_message}</p>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}