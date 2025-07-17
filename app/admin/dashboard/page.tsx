'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/providers'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Settings,
  BarChart3,
  PieChart,
  Activity,
  DollarSign,
  Crown,
  Shield,
  Database,
  Server,
  Zap
} from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface AdminStats {
  totalUsers: number
  activeUsers: number
  premiumUsers: number
  totalResources: number
  publishedResources: number
  unpublishedResources: number
  totalRevenue: number
  monthlyRevenue: number
  conversionRate: number
  churnRate: number
}

interface RecentActivity {
  id: string
  type: 'user_registration' | 'resource_published' | 'subscription_created' | 'forum_post'
  description: string
  timestamp: string
  user?: string
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    // Check if user is admin
    if (!user) {
      router.push('/auth/login')
      return
    }

    // In a real app, check user role from database
    // For now, we'll simulate admin access
    
    const fetchAdminData = async () => {
      try {
        setLoading(true)
        
        // Simulate API calls - replace with real endpoints
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock admin stats
        const mockStats: AdminStats = {
          totalUsers: 52847,
          activeUsers: 12456,
          premiumUsers: 3247,
          totalResources: 639,
          publishedResources: 471,
          unpublishedResources: 168,
          totalRevenue: 284750,
          monthlyRevenue: 64890,
          conversionRate: 6.2,
          churnRate: 2.8
        }

        // Mock recent activity
        const mockActivity: RecentActivity[] = [
          {
            id: '1',
            type: 'user_registration',
            description: 'New user registered: john.doe@example.com',
            timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
            user: 'john.doe@example.com'
          },
          {
            id: '2',
            type: 'resource_published',
            description: 'Resource published: "Advanced Penetration Testing Techniques"',
            timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            user: 'admin'
          },
          {
            id: '3',
            type: 'subscription_created',
            description: 'New premium subscription created',
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            user: 'sarah.chen@example.com'
          },
          {
            id: '4',
            type: 'forum_post',
            description: 'New forum post: "Best SIEM tools for 2024"',
            timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
            user: 'security_expert'
          }
        ]

        setStats(mockStats)
        setRecentActivity(mockActivity)
      } catch (error) {
        console.error('Error fetching admin data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAdminData()
  }, [user, router])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registration':
        return <Users className="h-4 w-4 text-green-400" />
      case 'resource_published':
        return <BookOpen className="h-4 w-4 text-blue-400" />
      case 'subscription_created':
        return <Crown className="h-4 w-4 text-yellow-400" />
      case 'forum_post':
        return <Activity className="h-4 w-4 text-purple-400" />
      default:
        return <Activity className="h-4 w-4 text-gray-400" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return date.toLocaleDateString()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-deep-space-blue pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-700 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-deep-space-blue pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Access Denied</h3>
            <p className="text-gray-400 mb-6">
              You don't have permission to access the admin dashboard.
            </p>
            <Button asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-deep-space-blue pt-16">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <Shield className="h-8 w-8 text-cyber-cyan" />
                <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
              </div>
              <p className="text-xl text-gray-300">
                Platform management and analytics
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <Button>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.totalUsers.toLocaleString()}</p>
                    <p className="text-sm text-gray-400">Total Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-green-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.activeUsers.toLocaleString()}</p>
                    <p className="text-sm text-gray-400">Active Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Crown className="h-5 w-5 text-yellow-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.premiumUsers.toLocaleString()}</p>
                    <p className="text-sm text-gray-400">Premium Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-purple-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.totalResources}</p>
                    <p className="text-sm text-gray-400">Total Resources</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.publishedResources}</p>
                    <p className="text-sm text-gray-400">Published</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-orange-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.unpublishedResources}</p>
                    <p className="text-sm text-gray-400">Unpublished</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-green-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">{formatCurrency(stats.monthlyRevenue)}</p>
                    <p className="text-sm text-gray-400">Monthly Revenue</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-cyber-cyan" />
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.conversionRate}%</p>
                    <p className="text-sm text-gray-400">Conversion</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Content Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6 bg-gray-800/50">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {/* Critical Actions */}
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Critical Actions Required</CardTitle>
                      <CardDescription className="text-gray-400">
                        Items that need immediate attention
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <AlertTriangle className="h-5 w-5 text-orange-400" />
                            <div>
                              <p className="text-white font-medium">168 Unpublished Resources</p>
                              <p className="text-sm text-gray-400">26.3% of resources need to be published</p>
                            </div>
                          </div>
                          <Button asChild>
                            <Link href="/admin/resources?filter=unpublished">
                              Review Resources
                            </Link>
                          </Button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Users className="h-5 w-5 text-blue-400" />
                            <div>
                              <p className="text-white font-medium">User Verification Pending</p>
                              <p className="text-sm text-gray-400">23 users awaiting manual verification</p>
                            </div>
                          </div>
                          <Button variant="outline" asChild>
                            <Link href="/admin/users?filter=pending">
                              Review Users
                            </Link>
                          </Button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="h-5 w-5 text-green-400" />
                            <div>
                              <p className="text-white font-medium">System Health: Good</p>
                              <p className="text-sm text-gray-400">All systems operational</p>
                            </div>
                          </div>
                          <Button variant="outline" asChild>
                            <Link href="/admin/system">
                              View Details
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Stats */}
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Platform Performance</CardTitle>
                      <CardDescription className="text-gray-400">
                        Key performance indicators
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <p className="text-3xl font-bold text-green-400">{stats.conversionRate}%</p>
                          <p className="text-sm text-gray-400">Conversion Rate</p>
                          <p className="text-xs text-green-400">↑ 0.8% from last month</p>
                        </div>
                        <div className="text-center">
                          <p className="text-3xl font-bold text-red-400">{stats.churnRate}%</p>
                          <p className="text-sm text-gray-400">Churn Rate</p>
                          <p className="text-xs text-red-400">↑ 0.3% from last month</p>
                        </div>
                        <div className="text-center">
                          <p className="text-3xl font-bold text-blue-400">98.7%</p>
                          <p className="text-sm text-gray-400">Uptime</p>
                          <p className="text-xs text-green-400">↑ 0.1% from last month</p>
                        </div>
                        <div className="text-center">
                          <p className="text-3xl font-bold text-yellow-400">1.2s</p>
                          <p className="text-sm text-gray-400">Avg Load Time</p>
                          <p className="text-xs text-green-400">↓ 0.3s from last month</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Recent Activity */}
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Recent Activity</CardTitle>
                      <CardDescription className="text-gray-400">
                        Latest platform events
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {recentActivity.map((activity) => (
                          <div key={activity.id} className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-1">
                              {getActivityIcon(activity.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white line-clamp-2">
                                {activity.description}
                              </p>
                              <p className="text-xs text-gray-400">
                                {formatDate(activity.timestamp)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button className="w-full justify-start" asChild>
                        <Link href="/admin/resources/new">
                          <Plus className="h-4 w-4 mr-2" />
                          Add New Resource
                        </Link>
                      </Button>
                      <Button className="w-full justify-start" variant="outline" asChild>
                        <Link href="/admin/users">
                          <Users className="h-4 w-4 mr-2" />
                          Manage Users
                        </Link>
                      </Button>
                      <Button className="w-full justify-start" variant="outline" asChild>
                        <Link href="/admin/analytics">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          View Analytics
                        </Link>
                      </Button>
                      <Button className="w-full justify-start" variant="outline" asChild>
                        <Link href="/admin/system">
                          <Server className="h-4 w-4 mr-2" />
                          System Status
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>

                  {/* System Status */}
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">System Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">Database</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-sm text-green-400">Healthy</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">API</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-sm text-green-400">Operational</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">CDN</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-sm text-green-400">Fast</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">Payments</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-sm text-green-400">Processing</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Other tabs would be implemented here */}
            <TabsContent value="users" className="mt-6">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">User Management</CardTitle>
                  <CardDescription className="text-gray-400">
                    Manage platform users and permissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">User Management</h3>
                    <p className="text-gray-400 mb-6">
                      Detailed user management interface coming soon
                    </p>
                    <Button asChild>
                      <Link href="/admin/users">Go to User Management</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="resources" className="mt-6">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Resource Management</CardTitle>
                  <CardDescription className="text-gray-400">
                    Manage learning resources and content
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Resource Management</h3>
                    <p className="text-gray-400 mb-6">
                      Detailed resource management interface coming soon
                    </p>
                    <Button asChild>
                      <Link href="/admin/resources">Go to Resource Management</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="revenue" className="mt-6">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Revenue Analytics</CardTitle>
                  <CardDescription className="text-gray-400">
                    Financial performance and subscription metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Revenue Analytics</h3>
                    <p className="text-gray-400 mb-6">
                      Detailed revenue analytics coming soon
                    </p>
                    <Button asChild>
                      <Link href="/admin/revenue">Go to Revenue Analytics</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="mt-6">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Platform Analytics</CardTitle>
                  <CardDescription className="text-gray-400">
                    User behavior and platform performance metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Platform Analytics</h3>
                    <p className="text-gray-400 mb-6">
                      Detailed analytics dashboard coming soon
                    </p>
                    <Button asChild>
                      <Link href="/admin/analytics">Go to Analytics</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="system" className="mt-6">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">System Management</CardTitle>
                  <CardDescription className="text-gray-400">
                    System health, performance, and configuration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Server className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">System Management</h3>
                    <p className="text-gray-400 mb-6">
                      Detailed system management interface coming soon
                    </p>
                    <Button asChild>
                      <Link href="/admin/system">Go to System Management</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}