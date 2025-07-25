'use client'

import { useState, useEffect } from 'react'
import { ResourcesService, LearningPathsService, CategoriesService } from '@/lib/api'
import type { Resource, LearningPath, Category } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/app/providers'
import { useSubscription } from '@/hooks/useSubscription'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  GraduationCap, 
  BookOpen, 
  Clock, 
  Users, 
  Star, 
  Crown, 
  Search, 
  Play,
  BarChart,
  Target,
  Award,
  TrendingUp,
  Filter
} from 'lucide-react'
import Link from 'next/link'
import { ErrorBoundary } from '@/components/error-boundary'

function AcademyPageContent() {
  console.log('🚀 Academy: Component mounting/rendering')
  
  const { user } = useAuth()
  const subscriptionData = useSubscription()
  const { canAccessPremiumResources } = subscriptionData || { canAccessPremiumResources: false }
  
  console.log('👤 Academy: Auth state:', { user: !!user, hasSubscriptionData: !!subscriptionData })
  
  const [learningPaths, setLearningPaths] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [articles, setArticles] = useState<any[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('overview')
  const [debugInfo, setDebugInfo] = useState<any>({})

  // Basic useEffect to test if React hooks are working
  useEffect(() => {
    console.log('⚡ Academy: Basic useEffect running')
    setDebugInfo({ basicTest: 'useEffect working', timestamp: Date.now() })
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🎓 Academy: Starting data fetch...')
        setLoading(true)
        
        // Fetch real data from backend services with detailed logging
        console.log('🔄 Academy: Calling API services...')
        const [pathsResult, coursesResult, articlesResult] = await Promise.allSettled([
          LearningPathsService.getFeaturedLearningPaths(10),
          ResourcesService.getResourcesByType('course', 20),
          ResourcesService.getResourcesByType('article', 20)
        ])

        console.log('📊 Academy: API results:', {
          paths: pathsResult.status,
          courses: coursesResult.status, 
          articles: articlesResult.status
        })

        // Handle learning paths
        if (pathsResult.status === 'fulfilled' && pathsResult.value.success) {
          const data = pathsResult.value.data || []
          console.log('✅ Academy: Learning paths success:', data.length)
          setLearningPaths(data)
        } else {
          console.warn('❌ Academy: Learning paths failed:', 
            pathsResult.status === 'rejected' ? pathsResult.reason : 
            pathsResult.status === 'fulfilled' ? (pathsResult.value as any).error : 'Unknown error'
          )
          setLearningPaths([])
        }

        // Handle courses
        if (coursesResult.status === 'fulfilled' && coursesResult.value.success) {
          const data = coursesResult.value.data || []
          console.log('✅ Academy: Courses success:', data.length)
          setCourses(data)
        } else {
          console.warn('❌ Academy: Courses failed:', 
            coursesResult.status === 'rejected' ? coursesResult.reason : 
            coursesResult.status === 'fulfilled' ? (coursesResult.value as any).error : 'Unknown error'
          )
          setCourses([])
        }

        // Handle articles
        if (articlesResult.status === 'fulfilled' && articlesResult.value.success) {
          const data = articlesResult.value.data || []
          console.log('✅ Academy: Articles success:', data.length)
          setArticles(data)
        } else {
          console.warn('❌ Academy: Articles failed:', 
            articlesResult.status === 'rejected' ? articlesResult.reason : 
            articlesResult.status === 'fulfilled' ? (articlesResult.value as any).error : 'Unknown error'
          )
          setArticles([])
        }

        console.log('✅ Academy: Data fetch complete')
        
        // Set debug info
        setDebugInfo({
          pathsCount: learningPaths.length,
          coursesCount: courses.length,
          articlesCount: articles.length,
          hasSupabase: !!supabase,
          timestamp: new Date().toISOString()
        })
        
      } catch (error) {
        console.error('❌ Academy: Fatal error during data fetch:', error)
        // Set empty arrays as fallback
        setLearningPaths([])
        setCourses([])
        setArticles([])
        setDebugInfo({
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [learningPaths.length, courses.length, articles.length])

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

  const getDifficultyIcon = (level: string) => {
    switch (level) {
      case 'beginner':
        return <Play className="h-4 w-4" />
      case 'intermediate':
        return <BarChart className="h-4 w-4" />
      case 'advanced':
        return <Target className="h-4 w-4" />
      default:
        return <BookOpen className="h-4 w-4" />
    }
  }

  const filteredContent = (items: (LearningPath | Resource)[]) => {
    return items.filter(item => {
      const matchesSearch = !searchQuery || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesDifficulty = !difficultyFilter || difficultyFilter === 'all' || item.difficulty_level === difficultyFilter
      
      return matchesSearch && matchesDifficulty
    })
  }

  const getStats = () => {
    const totalPaths = learningPaths.length
    const totalCourses = courses.length
    const totalArticles = articles.length
    const premiumContent = [...courses, ...articles].filter(item => item.is_premium).length
    
    return { totalPaths, totalCourses, totalArticles, premiumContent }
  }

  const stats = getStats()

  if (loading) {
    return (
      <div className="min-h-screen bg-deep-space-blue pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-700 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        {/* Debug Panel (remove in production) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-4 bg-gray-800/50 border border-yellow-500/30 rounded">
            <h3 className="text-yellow-400 text-sm font-bold mb-2">🔧 Debug Panel</h3>
            <div className="mb-2">
              <button 
                onClick={() => {
                  console.log('🔵 Button clicked!')
                  alert('Button works! Check console for logs.')
                }}
                className="px-3 py-1 bg-blue-600 text-white rounded text-xs mr-2"
              >
                Test Console Log
              </button>
              <button 
                onClick={() => {
                  console.log('🔄 Forcing data refetch...')
                  setLoading(true)
                  // Force re-run of data fetch
                  setDebugInfo({ ...debugInfo, forcedRefetch: Date.now() })
                }}
                className="px-3 py-1 bg-green-600 text-white rounded text-xs"
              >
                Force Refetch
              </button>
            </div>
            <pre className="text-xs text-gray-300">
              {JSON.stringify({
                componentRendered: true,
                loading,
                pathsCount: learningPaths.length,
                coursesCount: courses.length,
                articlesCount: articles.length,
                hasSupabase: !!supabase,
                timestamp: new Date().toISOString(),
                debugInfo
              }, null, 2)}
            </pre>
          </div>
        )}
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <GraduationCap className="h-8 w-8 text-cyber-cyan" />
            <h1 className="text-4xl font-bold text-white">Cybersecurity Academy</h1>
          </div>
          <p className="text-xl text-gray-300 mb-6">
            Master cybersecurity through structured learning paths and comprehensive courses
          </p>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <GraduationCap className="h-5 w-5 text-cyber-cyan" />
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.totalPaths}</p>
                    <p className="text-sm text-gray-400">Learning Paths</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-green-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.totalCourses}</p>
                    <p className="text-sm text-gray-400">Courses</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.totalArticles}</p>
                    <p className="text-sm text-gray-400">Articles</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Crown className="h-5 w-5 text-yellow-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.premiumContent}</p>
                    <p className="text-sm text-gray-400">Premium Content</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search learning content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-48 bg-gray-800 border-gray-700">
                <SelectValue placeholder="All Difficulty Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800/50">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="paths">Learning Paths</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="articles">Articles</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            {/* Featured Learning Paths */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Featured Learning Paths</h2>
                <Button variant="outline" asChild>
                  <Link href="/academy/learning-paths">View All Paths</Link>
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {learningPaths.slice(0, 3).map((path) => (
                  <Card key={path.id} className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-cyber-cyan/30 hover:border-cyber-cyan/60 transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <Badge variant="outline" className={getDifficultyColor(path.difficulty_level)}>
                          <div className="flex items-center space-x-1">
                            {getDifficultyIcon(path.difficulty_level)}
                            <span>{path.difficulty_level}</span>
                          </div>
                        </Badge>
                        {path.is_premium && (
                          <Crown className="h-4 w-4 text-yellow-400" />
                        )}
                      </div>
                      
                      <CardTitle className="text-white">{path.title}</CardTitle>
                      <CardDescription className="text-gray-300">
                        {path.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          {path.estimated_duration_hours && (
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{path.estimated_duration_hours}h</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <Button 
                        asChild 
                        className="w-full"
                        disabled={path.is_premium && !canAccessPremiumResources}
                      >
                        <Link href={`/academy/learning-paths/${path.slug}`}>
                          Start Learning Path
                        </Link>
                      </Button>

                      {path.is_premium && !canAccessPremiumResources && (
                        <p className="text-xs text-yellow-400 mt-2 text-center">
                          Premium content - upgrade to access
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Featured Courses */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Popular Courses</h2>
                <Button variant="outline" asChild>
                  <Link href="/academy/courses">View All Courses</Link>
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {courses.slice(0, 4).map((course) => (
                  <Card key={course.id} className="bg-gray-800/50 border-gray-700 hover:border-cyber-cyan/50 transition-colors">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <Badge variant="outline" className={getDifficultyColor(course.difficulty_level)}>
                          {course.difficulty_level}
                        </Badge>
                        {course.is_premium && (
                          <Crown className="h-4 w-4 text-yellow-400" />
                        )}
                      </div>
                      
                      <CardTitle className="text-white text-sm line-clamp-2">
                        {course.title}
                      </CardTitle>
                    </CardHeader>

                    <CardContent>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2 text-xs text-gray-400">
                          {course.estimated_time_minutes && (
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{Math.round(course.estimated_time_minutes / 60)}h</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3" />
                            <span>{course.like_count}</span>
                          </div>
                        </div>
                      </div>

                      <Button 
                        asChild 
                        size="sm"
                        className="w-full"
                        disabled={course.is_premium && !canAccessPremiumResources}
                      >
                        <Link href={`/resources/${course.slug}`}>
                          View Course
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Recent Articles */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Latest Articles</h2>
                <Button variant="outline" asChild>
                  <Link href="/academy/articles">View All Articles</Link>
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {articles.slice(0, 4).map((article) => (
                  <Card key={article.id} className="bg-gray-800/50 border-gray-700 hover:border-cyber-cyan/50 transition-colors">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <Badge variant="outline" className={getDifficultyColor(article.difficulty_level)}>
                          {article.difficulty_level}
                        </Badge>
                        {article.is_premium && (
                          <Crown className="h-4 w-4 text-yellow-400" />
                        )}
                      </div>
                      
                      <CardTitle className="text-white line-clamp-2">
                        {article.title}
                      </CardTitle>
                      
                      <CardDescription className="text-gray-400 line-clamp-2">
                        {article.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          {article.estimated_time_minutes && (
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{article.estimated_time_minutes}m read</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4" />
                            <span>{article.like_count}</span>
                          </div>
                        </div>
                      </div>

                      <Button 
                        asChild 
                        className="w-full"
                        disabled={article.is_premium && !canAccessPremiumResources}
                      >
                        <Link href={`/resources/${article.slug}`}>
                          Read Article
                        </Link>
                      </Button>

                      {article.is_premium && !canAccessPremiumResources && (
                        <p className="text-xs text-yellow-400 mt-2 text-center">
                          Premium content - upgrade to access
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Learning Paths Tab */}
          <TabsContent value="paths" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContent(learningPaths).map((path) => (
                <Card key={path.id} className="bg-gray-800/50 border-gray-700 hover:border-cyber-cyan/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <Badge variant="outline" className={getDifficultyColor(path.difficulty_level)}>
                        <div className="flex items-center space-x-1">
                          {getDifficultyIcon(path.difficulty_level)}
                          <span>{path.difficulty_level}</span>
                        </div>
                      </Badge>
                      {path.is_premium && (
                        <Crown className="h-4 w-4 text-yellow-400" />
                      )}
                    </div>
                    
                    <CardTitle className="text-white">{path.title}</CardTitle>
                    <CardDescription className="text-gray-400">
                      {path.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        {'estimated_duration_hours' in path && path.estimated_duration_hours && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{path.estimated_duration_hours}h</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <Button 
                      asChild 
                      className="w-full"
                      disabled={path.is_premium && !canAccessPremiumResources}
                    >
                      <Link href={`/academy/learning-paths/${path.slug}`}>
                        Start Learning Path
                      </Link>
                    </Button>

                    {path.is_premium && !canAccessPremiumResources && (
                      <p className="text-xs text-yellow-400 mt-2 text-center">
                        Premium content - upgrade to access
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContent(courses).map((course) => (
                <Card key={course.id} className="bg-gray-800/50 border-gray-700 hover:border-cyber-cyan/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <Badge variant="outline" className={getDifficultyColor(course.difficulty_level)}>
                        {course.difficulty_level}
                      </Badge>
                      {course.is_premium && (
                        <Crown className="h-4 w-4 text-yellow-400" />
                      )}
                    </div>
                    
                    <CardTitle className="text-white line-clamp-2">
                      {course.title}
                    </CardTitle>
                    
                    <CardDescription className="text-gray-400 line-clamp-3">
                      {course.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        {'estimated_time_minutes' in course && course.estimated_time_minutes && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{Math.round(course.estimated_time_minutes / 60)}h</span>
                          </div>
                        )}
                        {'like_count' in course && (
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4" />
                            <span>{course.like_count}</span>
                          </div>
                        )}
                        {'view_count' in course && (
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{course.view_count}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <Button 
                      asChild 
                      className="w-full"
                      disabled={course.is_premium && !canAccessPremiumResources}
                    >
                      <Link href={`/resources/${course.slug}`}>
                        View Course
                      </Link>
                    </Button>

                    {course.is_premium && !canAccessPremiumResources && (
                      <p className="text-xs text-yellow-400 mt-2 text-center">
                        Premium content - upgrade to access
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Articles Tab */}
          <TabsContent value="articles" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredContent(articles).map((article) => (
                <Card key={article.id} className="bg-gray-800/50 border-gray-700 hover:border-cyber-cyan/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <Badge variant="outline" className={getDifficultyColor(article.difficulty_level)}>
                        {article.difficulty_level}
                      </Badge>
                      {article.is_premium && (
                        <Crown className="h-4 w-4 text-yellow-400" />
                      )}
                    </div>
                    
                    <CardTitle className="text-white line-clamp-2">
                      {article.title}
                    </CardTitle>
                    
                    <CardDescription className="text-gray-400 line-clamp-3">
                      {article.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        {'estimated_time_minutes' in article && article.estimated_time_minutes && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{article.estimated_time_minutes}m read</span>
                          </div>
                        )}
                        {'like_count' in article && (
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4" />
                            <span>{article.like_count}</span>
                          </div>
                        )}
                        {'view_count' in article && (
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{article.view_count}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <Button 
                      asChild 
                      className="w-full"
                      disabled={article.is_premium && !canAccessPremiumResources}
                    >
                      <Link href={`/resources/${article.slug}`}>
                        Read Article
                      </Link>
                    </Button>

                    {article.is_premium && !canAccessPremiumResources && (
                      <p className="text-xs text-yellow-400 mt-2 text-center">
                        Premium content - upgrade to access
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default function AcademyPage() {
  return (
    <ErrorBoundary>
      <AcademyPageContent />
    </ErrorBoundary>
  )
}