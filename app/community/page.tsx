'use client'

import { useState, useEffect } from 'react'
// import { ForumService } from '@/lib/api'
// import type { ForumPost, ForumCategory } from '@/lib/api'

// Mock types for now
interface ForumPost {
  id: string
  title: string
  content: string
  author_username?: string
  created_at: string
  category_name?: string
  is_pinned?: boolean
  is_locked?: boolean
  view_count?: number
  reply_count?: number
  like_count?: number
}

interface ForumCategory {
  id: string
  name: string
  slug: string
  description: string
  post_count?: number
  member_count?: number
}
import { useAuth } from '@/app/providers'
import { useSubscription } from '@/hooks/useSubscription'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Clock, 
  Eye, 
  ThumbsUp,
  Pin,
  Lock,
  Search,
  Plus,
  Filter,
  Star,
  Award,
  Crown,
  Flame,
  Calendar,
  ArrowRight,
  ExternalLink,
  MessageCircle,
  HelpCircle,
  Lightbulb,
  Briefcase,
  Code
} from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function CommunityPage() {
  const { user } = useAuth()
  const { isPro } = useSubscription()
  
  const [categories, setCategories] = useState<ForumCategory[]>([])
  const [recentPosts, setRecentPosts] = useState<ForumPost[]>([])
  const [trendingPosts, setTrendingPosts] = useState<ForumPost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Mock data for now
        const mockCategories: ForumCategory[] = [
          {
            id: '1',
            name: 'General Discussion',
            slug: 'general',
            description: 'General cybersecurity discussions and news',
            post_count: 1247,
            member_count: 8934
          },
          {
            id: '2',
            name: 'Help & Support',
            slug: 'help',
            description: 'Get help with cybersecurity questions',
            post_count: 892,
            member_count: 5621
          },
          {
            id: '3',
            name: 'Showcase',
            slug: 'showcase',
            description: 'Share your projects and achievements',
            post_count: 456,
            member_count: 3245
          },
          {
            id: '4',
            name: 'Career Advice',
            slug: 'career',
            description: 'Career guidance and job opportunities',
            post_count: 678,
            member_count: 4567
          }
        ]

        const mockRecentPosts: ForumPost[] = [
          {
            id: '1',
            title: 'Best practices for incident response in 2024',
            content: 'What are the current best practices for incident response? Looking for updated frameworks and methodologies.',
            author_username: 'SecurityPro',
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            category_name: 'General Discussion',
            view_count: 234,
            reply_count: 12,
            like_count: 18
          },
          {
            id: '2',
            title: 'Help with SIEM configuration',
            content: 'Having trouble configuring Splunk for our environment. Any tips?',
            author_username: 'NewAnalyst',
            created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            category_name: 'Help & Support',
            view_count: 156,
            reply_count: 8,
            like_count: 5
          }
        ]

        const mockTrendingPosts: ForumPost[] = [
          {
            id: '3',
            title: 'Zero Trust Architecture Implementation Guide',
            content: 'Comprehensive guide to implementing Zero Trust in enterprise environments.',
            author_username: 'ZeroTrustExpert',
            created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            category_name: 'General Discussion',
            view_count: 1234,
            reply_count: 45,
            like_count: 89,
            is_pinned: true
          }
        ]

        setCategories(mockCategories)
        setRecentPosts(mockRecentPosts)
        setTrendingPosts(mockTrendingPosts)
      } catch (error) {
        console.error('Error fetching community data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'general':
        return <MessageCircle className="h-5 w-5" />
      case 'help':
        return <HelpCircle className="h-5 w-5" />
      case 'showcase':
        return <Lightbulb className="h-5 w-5" />
      case 'career':
        return <Briefcase className="h-5 w-5" />
      case 'technical':
        return <Code className="h-5 w-5" />
      default:
        return <MessageSquare className="h-5 w-5" />
    }
  }

  const getCategoryColor = (slug: string) => {
    switch (slug) {
      case 'general':
        return 'text-blue-400'
      case 'help':
        return 'text-green-400'
      case 'showcase':
        return 'text-purple-400'
      case 'career':
        return 'text-yellow-400'
      case 'technical':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return date.toLocaleDateString()
  }

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`
    }
    return num.toString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-deep-space-blue pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-700 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-700 rounded-lg"></div>
              ))}
            </div>
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
          <div className="flex items-center space-x-3 mb-4">
            <Users className="h-8 w-8 text-cyber-cyan" />
            <h1 className="text-4xl font-bold text-white">Community</h1>
          </div>
          <p className="text-xl text-gray-300 mb-6">
            Connect with 50,000+ cybersecurity professionals worldwide
          </p>
          
          {/* Community Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-cyber-cyan" />
                  <div>
                    <p className="text-2xl font-bold text-white">50K+</p>
                    <p className="text-sm text-gray-400">Members</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-green-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">{formatNumber(recentPosts.length * 100)}</p>
                    <p className="text-sm text-gray-400">Discussions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">1.2K</p>
                    <p className="text-sm text-gray-400">Daily Active</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-yellow-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">150+</p>
                    <p className="text-sm text-gray-400">Experts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-500/30 hover:border-purple-500/50 transition-colors cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <MessageSquare className="h-8 w-8 text-purple-400" />
                  <div>
                    <h3 className="text-white font-semibold">Join Discord</h3>
                    <p className="text-gray-300 text-sm">Real-time chat with the community</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-purple-400 ml-auto" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-900/50 to-cyan-900/50 border-blue-500/30 hover:border-blue-500/50 transition-colors cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <ExternalLink className="h-8 w-8 text-blue-400" />
                  <div>
                    <h3 className="text-white font-semibold">Reddit Community</h3>
                    <p className="text-gray-300 text-sm">Join our subreddit discussions</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-blue-400 ml-auto" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 border-green-500/30 hover:border-green-500/50 transition-colors cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <Plus className="h-8 w-8 text-green-400" />
                  <div>
                    <h3 className="text-white font-semibold">Start Discussion</h3>
                    <p className="text-gray-300 text-sm">Ask questions or share insights</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-green-400 ml-auto" />
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Content Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-800/50">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="recent">Recent Posts</TabsTrigger>
              <TabsTrigger value="trending">Trending</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {/* Featured Categories */}
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Popular Categories</CardTitle>
                      <CardDescription className="text-gray-400">
                        Most active discussion topics
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {categories.slice(0, 4).map((category) => (
                          <Link key={category.id} href={`/community/categories/${category.slug}`}>
                            <Card className="bg-gray-700/30 border-gray-600 hover:border-cyber-cyan/50 transition-colors cursor-pointer">
                              <CardContent className="p-4">
                                <div className="flex items-center space-x-3">
                                  <div className={getCategoryColor(category.slug)}>
                                    {getCategoryIcon(category.slug)}
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="text-white font-medium">{category.name}</h4>
                                    <p className="text-gray-400 text-sm line-clamp-1">
                                      {category.description}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-white font-medium">{category.post_count || 0}</p>
                                    <p className="text-gray-400 text-xs">posts</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Activity */}
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-white">Recent Activity</CardTitle>
                          <CardDescription className="text-gray-400">
                            Latest discussions from the community
                          </CardDescription>
                        </div>
                        <Button variant="outline" asChild>
                          <Link href="/community/recent">View All</Link>
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {recentPosts.slice(0, 5).map((post) => (
                          <div key={post.id} className="flex items-start space-x-3 p-3 bg-gray-700/20 rounded-lg hover:bg-gray-700/40 transition-colors">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-cyber-cyan/10 rounded-full flex items-center justify-center">
                                <MessageSquare className="h-4 w-4 text-cyber-cyan" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="text-white font-medium line-clamp-1">{post.title}</h4>
                                {post.is_pinned && <Pin className="h-3 w-3 text-yellow-400" />}
                                {post.is_locked && <Lock className="h-3 w-3 text-red-400" />}
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-400">
                                <span>by {post.author_username || 'Anonymous'}</span>
                                <span>{formatDate(post.created_at)}</span>
                                <div className="flex items-center space-x-1">
                                  <MessageSquare className="h-3 w-3" />
                                  <span>{post.reply_count || 0}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <ThumbsUp className="h-3 w-3" />
                                  <span>{post.like_count || 0}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Community Guidelines */}
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Community Guidelines</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm text-gray-300">
                        <li className="flex items-start space-x-2">
                          <Star className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                          <span>Be respectful and professional</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <Star className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                          <span>Share knowledge and help others</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <Star className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                          <span>Stay on topic and relevant</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <Star className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                          <span>No spam or self-promotion</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Top Contributors */}
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Top Contributors</CardTitle>
                      <CardDescription className="text-gray-400">
                        Most helpful community members
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          { name: 'Alex Chen', role: 'Security Expert', points: 2450 },
                          { name: 'Sarah Kim', role: 'Penetration Tester', points: 1890 },
                          { name: 'Mike Johnson', role: 'CISO', points: 1650 },
                          { name: 'Lisa Wang', role: 'SOC Analyst', points: 1420 }
                        ].map((contributor, index) => (
                          <div key={index} className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                                index === 1 ? 'bg-gray-400/20 text-gray-400' :
                                index === 2 ? 'bg-orange-500/20 text-orange-400' :
                                'bg-blue-500/20 text-blue-400'
                              }`}>
                                {index + 1}
                              </div>
                            </div>
                            <div className="flex-1">
                              <p className="text-white font-medium text-sm">{contributor.name}</p>
                              <p className="text-gray-400 text-xs">{contributor.role}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-cyber-cyan font-medium text-sm">{contributor.points}</p>
                              <p className="text-gray-400 text-xs">points</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Pro Community Access */}
                  {!isPro && (
                    <Card className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-500/30">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center space-x-2">
                          <Crown className="h-5 w-5 text-yellow-400" />
                          <span>Pro Community</span>
                        </CardTitle>
                        <CardDescription className="text-gray-300">
                          Exclusive access for Pro members
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-sm text-gray-300 mb-4">
                          <li className="flex items-center space-x-2">
                            <Star className="h-3 w-3 text-yellow-400" />
                            <span>Private Discord channels</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <Star className="h-3 w-3 text-yellow-400" />
                            <span>Expert AMAs and Q&As</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <Star className="h-3 w-3 text-yellow-400" />
                            <span>Priority support</span>
                          </li>
                        </ul>
                        <Button asChild className="w-full">
                          <Link href="/pricing">Upgrade to Pro</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Categories Tab */}
            <TabsContent value="categories" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: categories.indexOf(category) * 0.1 }}
                  >
                    <Link href={`/community/categories/${category.slug}`}>
                      <Card className="bg-gray-800/50 border-gray-700 hover:border-cyber-cyan/50 transition-colors cursor-pointer h-full">
                        <CardHeader>
                          <div className="flex items-center space-x-3">
                            <div className={getCategoryColor(category.slug)}>
                              {getCategoryIcon(category.slug)}
                            </div>
                            <div>
                              <CardTitle className="text-white">{category.name}</CardTitle>
                              <CardDescription className="text-gray-400">
                                {category.description}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-sm text-gray-400">
                              <div className="flex items-center space-x-1">
                                <MessageSquare className="h-4 w-4" />
                                <span>{category.post_count || 0} posts</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Users className="h-4 w-4" />
                                <span>{category.member_count || 0} members</span>
                              </div>
                            </div>
                            <ArrowRight className="h-4 w-4 text-cyber-cyan" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Recent Posts Tab */}
            <TabsContent value="recent" className="mt-6">
              <div className="space-y-4">
                {recentPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-gray-800/50 border-gray-700 hover:border-cyber-cyan/50 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-cyber-cyan/10 rounded-full flex items-center justify-center">
                              <MessageSquare className="h-5 w-5 text-cyber-cyan" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="text-white font-semibold line-clamp-1">{post.title}</h3>
                              {post.is_pinned && <Pin className="h-4 w-4 text-yellow-400" />}
                              {post.is_locked && <Lock className="h-4 w-4 text-red-400" />}
                            </div>
                            <p className="text-gray-300 mb-3 line-clamp-2">{post.content}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 text-sm text-gray-400">
                                <span>by {post.author_username || 'Anonymous'}</span>
                                <span>{formatDate(post.created_at)}</span>
                                <Badge variant="outline" className="text-xs">
                                  {post.category_name}
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-400">
                                <div className="flex items-center space-x-1">
                                  <Eye className="h-4 w-4" />
                                  <span>{post.view_count || 0}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <MessageSquare className="h-4 w-4" />
                                  <span>{post.reply_count || 0}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <ThumbsUp className="h-4 w-4" />
                                  <span>{post.like_count || 0}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Trending Tab */}
            <TabsContent value="trending" className="mt-6">
              <div className="space-y-4">
                {trendingPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-gray-800/50 border-gray-700 hover:border-cyber-cyan/50 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center">
                              <Flame className="h-5 w-5 text-orange-400" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="text-white font-semibold line-clamp-1">{post.title}</h3>
                              <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/20">
                                Trending
                              </Badge>
                            </div>
                            <p className="text-gray-300 mb-3 line-clamp-2">{post.content}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 text-sm text-gray-400">
                                <span>by {post.author_username || 'Anonymous'}</span>
                                <span>{formatDate(post.created_at)}</span>
                                <Badge variant="outline" className="text-xs">
                                  {post.category_name}
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-400">
                                <div className="flex items-center space-x-1">
                                  <Eye className="h-4 w-4" />
                                  <span>{formatNumber(post.view_count || 0)}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <MessageSquare className="h-4 w-4" />
                                  <span>{post.reply_count || 0}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <ThumbsUp className="h-4 w-4" />
                                  <span>{post.like_count || 0}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}