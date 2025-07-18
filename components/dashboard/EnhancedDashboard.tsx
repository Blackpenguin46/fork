'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ResourceCard } from '@/components/resources/ResourceCard'
import { useAuth } from '@/app/providers'
import { getUserDashboardStats, getAllUserProgress, getUserLearningPaths, getUserAchievements } from '@/lib/api/learning'
import { getUserBookmarks } from '@/lib/api/bookmarks'
import { getRecentResources, getFeaturedResources } from '@/lib/api/resources'
import {
  BookOpen,
  Award,
  Bookmark,
  TrendingUp,
  Clock,
  Target,
  Star,
  ArrowRight,
  Trophy,
  Calendar,
  Users,
  Zap
} from 'lucide-react'

interface DashboardStats {
  courses_started: number
  courses_completed: number
  bookmarks_count: number
  overall_progress: number
  achievements_count: number
  learning_paths_enrolled: number
  total_time_spent: number
}

export function EnhancedDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentProgress, setRecentProgress] = useState<any[]>([])
  const [recentBookmarks, setRecentBookmarks] = useState<any[]>([])
  const [learningPaths, setLearningPaths] = useState<any[]>([])
  const [achievements, setAchievements] = useState<any[]>([])
  const [recommendedResources, setRecommendedResources] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user, loadDashboardData])

  const loadDashboardData = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)

      // Load all dashboard data in parallel
      const [
        statsResult,
        progressResult,
        bookmarksResult,
        pathsResult,
        achievementsResult,
        recommendedResult
      ] = await Promise.allSettled([
        getUserDashboardStats(user.id),
        getAllUserProgress(user.id),
        getUserBookmarks(user.id),
        getUserLearningPaths(user.id),
        getUserAchievements(user.id),
        getFeaturedResources(6)
      ])

      // Process results
      if (statsResult.status === 'fulfilled' && statsResult.value.success) {
        setStats(statsResult.value.data || null)
      }

      if (progressResult.status === 'fulfilled' && progressResult.value.success) {
        setRecentProgress(statsResult.value.data?.slice(0, 5) || [])
      }

      if (bookmarksResult.status === 'fulfilled' && bookmarksResult.value.success) {
        setRecentBookmarks(bookmarksResult.value.data?.slice(0, 5) || [])
      }

      if (pathsResult.status === 'fulfilled' && pathsResult.value.success) {
        setLearningPaths(pathsResult.value.data?.slice(0, 3) || [])
      }

      if (achievementsResult.status === 'fulfilled' && achievementsResult.value.success) {
        setAchievements(achievementsResult.value.data?.slice(0, 6) || [])
      }

      if (recommendedResult.status === 'fulfilled' && recommendedResult.value.success) {
        setRecommendedResources(recommendedResult.value.data || [])
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Unable to load dashboard data</p>
        <Button onClick={loadDashboardData} className="mt-4">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back to Cybernex Academy!</h1>
        <p className="text-blue-100">Continue your cybersecurity learning journey</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.courses_started}</p>
                <p className="text-sm text-muted-foreground">Courses Started</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Award className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.courses_completed}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Bookmark className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{stats.bookmarks_count}</p>
                <p className="text-sm text-muted-foreground">Bookmarks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{Math.round(stats.overall_progress)}%</p>
                <p className="text-sm text-muted-foreground">Overall Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Learning Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Overall Progress</span>
                  <span>{Math.round(stats.overall_progress)}%</span>
                </div>
                <Progress value={stats.overall_progress} className="h-2" />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Time Spent</p>
                  <p className="font-semibold">{formatTime(stats.total_time_spent)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Learning Paths</p>
                  <p className="font-semibold">{stats.learning_paths_enrolled}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5" />
              <span>Achievements</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-600">{stats.achievements_count}</p>
                <p className="text-sm text-muted-foreground">Achievements Earned</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {achievements.slice(0, 6).map((achievement) => (
                  <div key={achievement.id} className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <div className="text-2xl mb-1">{achievement.achievement.icon}</div>
                    <p className="text-xs font-medium">{achievement.achievement.name}</p>
                  </div>
                ))}
              </div>
              {achievements.length > 6 && (
                <Link href="/dashboard/achievements">
                  <Button variant="outline" size="sm" className="w-full">
                    View All Achievements
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5" />
                <span>Recent Progress</span>
              </div>
              <Link href="/dashboard/progress">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProgress.length > 0 ? (
                recentProgress.map((progress) => (
                  <div key={progress.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{progress.resource?.title}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Progress value={progress.progress_percentage} className="h-1 flex-1" />
                        <span className="text-xs text-muted-foreground">{progress.progress_percentage}%</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recent progress</p>
                  <Link href="/academy">
                    <Button variant="outline" size="sm" className="mt-2">
                      Start Learning
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bookmark className="h-5 w-5" />
                <span>Recent Bookmarks</span>
              </div>
              <Link href="/dashboard/bookmarks">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBookmarks.length > 0 ? (
                recentBookmarks.map((bookmark) => (
                  <div key={bookmark.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                        <Bookmark className="h-5 w-5 text-yellow-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{bookmark.resource?.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {bookmark.resource?.resource_type} • {new Date(bookmark.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Bookmark className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No bookmarks yet</p>
                  <Link href="/resources">
                    <Button variant="outline" size="sm" className="mt-2">
                      Browse Resources
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Learning Paths */}
      {learningPaths.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Your Learning Paths</span>
              </div>
              <Link href="/academy/learning-paths">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {learningPaths.map((enrollment) => (
                <div key={enrollment.id} className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">{enrollment.learning_path.title}</h4>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {enrollment.learning_path.description}
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{enrollment.progress_percentage}%</span>
                    </div>
                    <Progress value={enrollment.progress_percentage} className="h-2" />
                    <Badge variant={enrollment.status === 'completed' ? 'default' : 'secondary'}>
                      {enrollment.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommended Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Recommended for You</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedResources.slice(0, 6).map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                variant="compact"
                showBookmark={true}
              />
            ))}
          </div>
          {recommendedResources.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recommendations available yet</p>
              <p className="text-sm">Complete more resources to get personalized recommendations</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/academy">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-blue-600" />
              <h3 className="font-semibold mb-2">Continue Learning</h3>
              <p className="text-sm text-muted-foreground">Explore courses and tutorials</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/community">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-green-600" />
              <h3 className="font-semibold mb-2">Join Community</h3>
              <p className="text-sm text-muted-foreground">Connect with other learners</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/insights">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-purple-600" />
              <h3 className="font-semibold mb-2">Latest Insights</h3>
              <p className="text-sm text-muted-foreground">Stay updated with trends</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}