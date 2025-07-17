'use client'

import { useState, useEffect } from 'react'
import { LearningPathsService, UserProgressService } from '@/lib/api'
import type { LearningPath, UserProgress } from '@/lib/api'
import { useAuth } from '@/app/providers'
import { useSubscription } from '@/hooks/useSubscription'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { 
  GraduationCap, 
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
  Filter,
  CheckCircle,
  BookOpen,
  ArrowRight,
  Zap
} from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function LearningPathsPage() {
  const { user } = useAuth()
  const { isPro, canAccessPremiumResources } = useSubscription()
  
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([])
  const [userProgress, setUserProgress] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('popular')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        const [pathsResult, progressResult] = await Promise.allSettled([
          LearningPathsService.getAllLearningPaths(),
          user?.id ? UserProgressService.getUserLearningPathProgress(user.id) : Promise.resolve({ success: false })
        ])

        if (pathsResult.status === 'fulfilled' && pathsResult.value.success) {
          setLearningPaths(pathsResult.value.data || [])
        }

        if (progressResult.status === 'fulfilled' && progressResult.value.success) {
          const progressData = progressResult.value.data || []
          const progressMap = progressData.reduce((acc: any, progress: any) => {
            acc[progress.learning_path_id] = progress
            return acc
          }, {})
          setUserProgress(progressMap)
        }
      } catch (error) {
        console.error('Error fetching learning paths:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user?.id])

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-500/10 text-green-400 border-green-500/20'
      case 'intermediate':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
      case 'advanced':
        return 'bg-red-500/10 text-red-400 border-red-500/20'
      case 'expert':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
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
      case 'expert':
        return <Award className="h-4 w-4" />
      default:
        return <BookOpen className="h-4 w-4" />
    }
  }

  const filteredAndSortedPaths = () => {
    let filtered = learningPaths.filter(path => {
      const matchesSearch = !searchQuery || 
        path.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        path.description.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesDifficulty = difficultyFilter === 'all' || path.difficulty_level === difficultyFilter
      
      return matchesSearch && matchesDifficulty
    })

    // Sort paths
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => (b.enrollment_count || 0) - (a.enrollment_count || 0))
        break
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case 'duration':
        filtered.sort((a, b) => (a.estimated_duration_hours || 0) - (b.estimated_duration_hours || 0))
        break
      case 'difficulty':
        const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 }
        filtered.sort((a, b) => (difficultyOrder[a.difficulty_level as keyof typeof difficultyOrder] || 0) - 
                                (difficultyOrder[b.difficulty_level as keyof typeof difficultyOrder] || 0))
        break
    }

    return filtered
  }

  const getPathProgress = (pathId: string) => {
    return userProgress[pathId] || null
  }

  const getPathStatus = (path: LearningPath) => {
    const progress = getPathProgress(path.id)
    if (!progress) return 'not_started'
    if (progress.completion_percentage >= 100) return 'completed'
    if (progress.completion_percentage > 0) return 'in_progress'
    return 'not_started'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400'
      case 'in_progress':
        return 'text-blue-400'
      default:
        return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      case 'in_progress':
        return <Play className="h-4 w-4" />
      default:
        return <BookOpen className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-deep-space-blue pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-700 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const paths = filteredAndSortedPaths()

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
            <GraduationCap className="h-8 w-8 text-cyber-cyan" />
            <h1 className="text-4xl font-bold text-white">Learning Paths</h1>
          </div>
          <p className="text-xl text-gray-300 mb-6">
            Structured learning journeys to master cybersecurity skills step by step
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-cyber-cyan" />
                  <div>
                    <p className="text-2xl font-bold text-white">{paths.length}</p>
                    <p className="text-sm text-gray-400">Total Paths</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {Object.values(userProgress).filter((p: any) => p.completion_percentage >= 100).length}
                    </p>
                    <p className="text-sm text-gray-400">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Play className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {Object.values(userProgress).filter((p: any) => p.completion_percentage > 0 && p.completion_percentage < 100).length}
                    </p>
                    <p className="text-sm text-gray-400">In Progress</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Crown className="h-5 w-5 text-yellow-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {paths.filter(p => p.is_premium).length}
                    </p>
                    <p className="text-sm text-gray-400">Premium</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search learning paths..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white"
              />
            </div>
            
            <div className="flex gap-4">
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger className="w-48 bg-gray-800 border-gray-700">
                  <SelectValue placeholder="All Difficulty Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48 bg-gray-800 border-gray-700">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="duration">Duration</SelectItem>
                  <SelectItem value="difficulty">Difficulty</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        {/* Learning Paths Grid */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {paths.map((path, index) => {
            const status = getPathStatus(path)
            const progress = getPathProgress(path.id)
            
            return (
              <motion.div
                key={path.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-gray-700 hover:border-cyber-cyan/50 transition-all duration-300 h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline" className={getDifficultyColor(path.difficulty_level)}>
                        <div className="flex items-center space-x-1">
                          {getDifficultyIcon(path.difficulty_level)}
                          <span>{path.difficulty_level}</span>
                        </div>
                      </Badge>
                      
                      <div className="flex items-center space-x-2">
                        {path.is_premium && <Crown className="h-4 w-4 text-yellow-400" />}
                        <div className={`flex items-center space-x-1 ${getStatusColor(status)}`}>
                          {getStatusIcon(status)}
                          <span className="text-xs capitalize">{status.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </div>
                    
                    <CardTitle className="text-white line-clamp-2">{path.title}</CardTitle>
                    <CardDescription className="text-gray-300 line-clamp-3">
                      {path.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col">
                    {/* Progress Bar */}
                    {progress && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-400">Progress</span>
                          <span className="text-sm font-medium text-white">
                            {Math.round(progress.completion_percentage)}%
                          </span>
                        </div>
                        <Progress value={progress.completion_percentage} className="h-2" />
                      </div>
                    )}

                    {/* Path Info */}
                    <div className="flex items-center justify-between mb-4 text-sm text-gray-400">
                      <div className="flex items-center space-x-4">
                        {path.estimated_duration_hours && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{path.estimated_duration_hours}h</span>
                          </div>
                        )}
                        {path.enrollment_count && (
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{path.enrollment_count}</span>
                          </div>
                        )}
                      </div>
                      
                      {path.completion_certificate && (
                        <div className="flex items-center space-x-1 text-yellow-400">
                          <Award className="h-4 w-4" />
                          <span className="text-xs">Certificate</span>
                        </div>
                      )}
                    </div>

                    {/* Prerequisites */}
                    {path.prerequisites && path.prerequisites.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-400 mb-2">Prerequisites:</p>
                        <div className="flex flex-wrap gap-1">
                          {path.prerequisites.slice(0, 2).map((prereq, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {prereq}
                            </Badge>
                          ))}
                          {path.prerequisites.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{path.prerequisites.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <div className="mt-auto">
                      <Button 
                        asChild 
                        className="w-full"
                        disabled={path.is_premium && !canAccessPremiumResources}
                      >
                        <Link href={`/academy/learning-paths/${path.slug}`}>
                          <div className="flex items-center justify-center space-x-2">
                            {status === 'completed' ? (
                              <>
                                <CheckCircle className="h-4 w-4" />
                                <span>Review Path</span>
                              </>
                            ) : status === 'in_progress' ? (
                              <>
                                <Play className="h-4 w-4" />
                                <span>Continue Learning</span>
                              </>
                            ) : (
                              <>
                                <ArrowRight className="h-4 w-4" />
                                <span>Start Path</span>
                              </>
                            )}
                          </div>
                        </Link>
                      </Button>

                      {path.is_premium && !canAccessPremiumResources && (
                        <p className="text-xs text-yellow-400 mt-2 text-center">
                          Premium content - upgrade to access
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Empty State */}
        {paths.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No learning paths found</h3>
            <p className="text-gray-400 mb-6">
              Try adjusting your search criteria or explore our featured content
            </p>
            <Button asChild>
              <Link href="/academy">Browse Academy</Link>
            </Button>
          </motion.div>
        )}

        {/* Pro Features Teaser */}
        {!isPro && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12"
          >
            <Card className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-yellow-400" />
                  <span>Unlock Advanced Learning Features</span>
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Get access to premium learning paths, personalized recommendations, and progress analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <span>Access to all premium learning paths</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <span>Personalized learning recommendations</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <span>Advanced progress tracking and analytics</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <span>Completion certificates</span>
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
          </motion.div>
        )}
      </div>
    </div>
  )
}