'use client'

import { useState, useEffect } from 'react'
import { UserProgressService, ResourcesService, LearningPathsService } from '@/lib/api'
import type { UserProgress, Resource, LearningPath } from '@/lib/api'
import { useAuth } from '@/app/providers'
import { useSubscription } from '@/hooks/useSubscription'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  BookOpen, 
  Clock, 
  TrendingUp, 
  Target, 
  Award, 
  Calendar,
  PlayCircle,
  CheckCircle,
  BarChart3,
  Flame,
  Star
} from 'lucide-react'
import Link from 'next/link'

export default function SimpleProgressOverview() {
  const { user } = useAuth()
  const { isPro, canAccessProgressTracker } = useSubscription()
  
  const [stats, setStats] = useState<{
    totalResources: number
    completedResources: number
    inProgressResources: number
    totalTimeSpent: number
    completionRate: number
    currentStreak: number
  } | null>(null)
  
  const [recentActivity, setRecentActivity] = useState<UserProgress[]>([])
  const [recommendedPaths, setRecommendedPaths] = useState<LearningPath[]>([])
  const [featuredContent, setFeaturedContent] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return

      try {
        setLoading(true)
        
        const [statsResult, activityResult, pathsResult, contentResult] = await Promise.all([
          UserProgressService.getUserStats(user.id),
          UserProgressService.getRecentActivity(user.id, 5),
          LearningPathsService.getRecommendedPaths(user.id, 3),
          ResourcesService.getFeaturedResources(4)
        ])

        if (statsResult.success && statsResult.data) {
          setStats(statsResult.data)
        }

        if (activityResult.success && activityResult.data) {
          setRecentActivity(activityResult.data)
        }

        if (pathsResult.success && pathsResult.data) {
          setRecommendedPaths(pathsResult.data)
        }

        if (contentResult.success && contentResult.data) {
          setFeaturedContent(contentResult.data)
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user?.id])

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
  }

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-500/10 text-green-400 border-green-500/20'
      case 'intermediate':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
      case 'advanced':
        return 'bg-red-500/10 text-red-400 border-red-500/20'
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-700 rounded-lg animate-pulse"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-700 rounded-lg animate-pulse"></div>
          <div className="h-64 bg-gray-700 rounded-lg animate-pulse"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Resources Started</p>
                <p className="text-2xl font-bold text-white">{stats?.totalResources || 0}</p>
              </div>
              <BookOpen className="h-8 w-8 text-cyber-cyan" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-white">{stats?.completedResources || 0}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Time Spent</p>
                <p className="text-2xl font-bold text-white">{formatTime(stats?.totalTimeSpent || 0)}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Current Streak</p>
                <p className="text-2xl font-bold text-white">{stats?.currentStreak || 0} days</p>
              </div>
              <Flame className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Summary */}
      {stats && stats.totalResources > 0 && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Learning Progress</CardTitle>
            <CardDescription className="text-gray-400">
              Your overall completion rate across all resources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Overall Completion</span>
                <span className="text-sm font-medium text-white">{Math.round(stats.completionRate)}%</span>
              </div>
              <Progress value={stats.completionRate} className="h-2" />
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="flex items-center space-x-2">
                  <PlayCircle className="h-4 w-4 text-blue-400" />
                  <span className="text-sm text-gray-400">
                    {stats.inProgressResources} in progress
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-gray-400">
                    {stats.completedResources} completed
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Recent Activity</span>
            </CardTitle>
            <CardDescription className="text-gray-400">
              Your latest learning progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <div className="text-center py-6">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-400 mb-4">No recent activity</p>
                <Button asChild>
                  <Link href="/academy">Start Learning</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-cyber-cyan/10 rounded-lg">
                        {activity.status === 'completed' ? (
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        ) : (
                          <PlayCircle className="h-4 w-4 text-blue-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white line-clamp-1">
                          {(activity as any).resources?.title || 'Learning Resource'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {activity.progress_percentage}% complete
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className={
                      activity.status === 'completed' 
                        ? 'text-green-400 border-green-500/30'
                        : 'text-blue-400 border-blue-500/30'
                    }>
                      {activity.status === 'completed' ? 'Done' : 'In Progress'}
                    </Badge>
                  </div>
                ))}
                
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/dashboard/progress">View All Progress</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recommended Learning Paths */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Recommended for You</span>
            </CardTitle>
            <CardDescription className="text-gray-400">
              Learning paths tailored to your progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recommendedPaths.length === 0 ? (
              <div className="text-center py-6">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-400 mb-4">No recommendations yet</p>
                <Button asChild>
                  <Link href="/academy/learning-paths">Browse Learning Paths</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recommendedPaths.map((path) => (
                  <div key={path.id} className="p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-white line-clamp-1">{path.title}</h4>
                      <Badge variant="outline" className={getDifficultyColor(path.difficulty_level)}>
                        {path.difficulty_level}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                      {path.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-xs text-gray-400">
                        {path.estimated_duration_hours && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{path.estimated_duration_hours}h</span>
                          </div>
                        )}
                      </div>
                      <Button size="sm" asChild>
                        <Link href={`/academy/learning-paths/${path.slug}`}>
                          Start Path
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
                
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/academy/learning-paths">View All Paths</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Featured Content */}
      {featuredContent.length > 0 && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Star className="h-5 w-5" />
              <span>Featured Content</span>
            </CardTitle>
            <CardDescription className="text-gray-400">
              Trending resources in cybersecurity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredContent.map((content) => (
                <div key={content.id} className="p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="outline" className={getDifficultyColor(content.difficulty_level)}>
                      {content.difficulty_level}
                    </Badge>
                    <Badge variant="outline" className="text-cyber-cyan border-cyber-cyan/30">
                      {content.resource_type}
                    </Badge>
                  </div>
                  
                  <h4 className="font-medium text-white mb-2 line-clamp-2">
                    {content.title}
                  </h4>
                  
                  <div className="flex items-center space-x-2 text-xs text-gray-400 mb-3">
                    {content.estimated_time_minutes && (
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{content.estimated_time_minutes}m</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="h-3 w-3" />
                      <span>{content.view_count}</span>
                    </div>
                  </div>
                  
                  <Button size="sm" className="w-full" asChild>
                    <Link href={`/resources/${content.slug}`}>
                      View Resource
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pro Features Teaser for Free Users */}
      {!isPro && (
        <Card className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Award className="h-5 w-5 text-yellow-400" />
              <span>Unlock Advanced Progress Tracking</span>
            </CardTitle>
            <CardDescription className="text-gray-300">
              Get detailed analytics, custom roadmaps, and personalized recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>Detailed progress analytics</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>Custom learning roadmaps</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>Personalized AI recommendations</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>Achievement system</span>
                  </li>
                </ul>
              </div>
              <div className="flex flex-col space-y-2">
                <Button asChild>
                  <Link href="/pricing">
                    Upgrade to Pro
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/pricing">
                    Learn More
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}