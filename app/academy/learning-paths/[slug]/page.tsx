'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { LearningPathsService, UserProgressService, ResourcesService } from '@/lib/api'
import type { LearningPath, UserProgress, Resource } from '@/lib/api'
import type { LearningPathResource } from '@/lib/types/learning-paths'
import { useAuth } from '@/app/providers'
import { useSubscription } from '@/hooks/useSubscription'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  GraduationCap, 
  Clock, 
  Users, 
  Star, 
  Crown, 
  Play,
  CheckCircle,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Award,
  Target,
  BarChart,
  Lock,
  Unlock,
  FileText,
  Video,
  Code,
  ExternalLink,
  Download
} from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function LearningPathDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { isPro, canAccessPremiumResources } = useSubscription()
  
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null)
  const [pathResources, setPathResources] = useState<LearningPathResource[]>([])
  const [userProgress, setUserProgress] = useState<any>(null)
  const [resourceProgress, setResourceProgress] = useState<Record<string, UserProgress>>({})
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const fetchData = async () => {
      if (!params.slug) return

      try {
        setLoading(true)
        
        const [pathResult, resourcesResult, progressResult, resourceProgressResult] = await Promise.allSettled([
          LearningPathsService.getLearningPathBySlug(params.slug as string),
          LearningPathsService.getLearningPathResources(params.slug as string),
          user?.id ? UserProgressService.getUserLearningPathProgress(user.id, params.slug as string) : Promise.resolve({ success: false }),
          user?.id ? UserProgressService.getUserProgressByPath(user.id, params.slug as string) : Promise.resolve({ success: false })
        ])

        if (pathResult.status === 'fulfilled' && pathResult.value.success) {
          setLearningPath(pathResult.value.data || null)
        }

        if (resourcesResult.status === 'fulfilled' && resourcesResult.value.success) {
          setPathResources(resourcesResult.value.data || [])
        }

        if (progressResult.status === 'fulfilled' && progressResult.value.success) {
          setUserProgress((progressResult.value as any).data || null)
        }

        if (resourceProgressResult.status === 'fulfilled' && resourceProgressResult.value.success) {
          const progressData = (resourceProgressResult.value as any).data || []
          const progressMap = progressData.reduce((acc: any, progress: any) => {
            acc[progress.resource_id] = progress
            return acc
          }, {})
          setResourceProgress(progressMap)
        }
      } catch (error) {
        console.error('Error fetching learning path:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.slug, user?.id])

  const handleEnroll = async () => {
    if (!user?.id || !learningPath?.id) return

    try {
      setEnrolling(true)
      const result = await LearningPathsService.enrollInLearningPath(learningPath.id, user.id)
      
      if (result.success) {
        // Refresh progress data
        const progressResult = await UserProgressService.getUserLearningPathProgress(user.id, params.slug as string)
        if (progressResult.success) {
          setUserProgress(progressResult.data)
        }
      }
    } catch (error) {
      console.error('Error enrolling in learning path:', error)
    } finally {
      setEnrolling(false)
    }
  }

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

  const getResourceTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />
      case 'article':
        return <FileText className="h-4 w-4" />
      case 'course':
        return <BookOpen className="h-4 w-4" />
      case 'tool':
        return <Code className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getResourceStatus = (resourceId: string) => {
    const progress = resourceProgress[resourceId]
    if (!progress) return 'not_started'
    if (progress.status === 'completed') return 'completed'
    if (progress.progress_percentage > 0) return 'in_progress'
    return 'not_started'
  }

  const getResourceStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case 'in_progress':
        return <Play className="h-4 w-4 text-blue-400" />
      default:
        return <BookOpen className="h-4 w-4 text-gray-400" />
    }
  }

  const isResourceUnlocked = (resource: LearningPathResource, index: number) => {
    if (index === 0) return true // First resource is always unlocked
    
    // Check if previous resource is completed
    const prevResource = pathResources[index - 1]
    if (!prevResource) return true
    
    const prevStatus = getResourceStatus(prevResource.resource_id)
    return prevStatus === 'completed'
  }

  const getOverallProgress = () => {
    if (pathResources.length === 0) return 0
    
    const completedResources = pathResources.filter(resource => 
      getResourceStatus(resource.resource_id) === 'completed'
    ).length
    
    return (completedResources / pathResources.length) * 100
  }

  const getEstimatedTimeRemaining = () => {
    const remainingResources = pathResources.filter(resource => 
      getResourceStatus(resource.resource_id) !== 'completed'
    )
    
    return remainingResources.reduce((total, resource) => {
      return total + (resource.estimated_time_minutes || 0)
    }, 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-deep-space-blue pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-700 rounded w-1/2"></div>
            <div className="h-64 bg-gray-700 rounded"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-700 rounded"></div>
                ))}
              </div>
              <div className="h-96 bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!learningPath) {
    return (
      <div className="min-h-screen bg-deep-space-blue pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Learning path not found</h3>
            <p className="text-gray-400 mb-6">
              The learning path you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Button asChild>
              <Link href="/academy/learning-paths">Browse Learning Paths</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const isEnrolled = !!userProgress
  const canAccess = !learningPath.is_premium || canAccessPremiumResources
  const overallProgress = getOverallProgress()
  const timeRemaining = getEstimatedTimeRemaining()

  return (
    <div className="min-h-screen bg-deep-space-blue pt-16">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-2 mb-4 text-sm text-gray-400">
            <Link href="/academy" className="hover:text-white">Academy</Link>
            <ArrowRight className="h-4 w-4" />
            <Link href="/academy/learning-paths" className="hover:text-white">Learning Paths</Link>
            <ArrowRight className="h-4 w-4" />
            <span className="text-white">{learningPath.title}</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <Badge variant="outline" className={getDifficultyColor(learningPath.difficulty_level)}>
                  {learningPath.difficulty_level}
                </Badge>
                {learningPath.is_premium && <Crown className="h-5 w-5 text-yellow-400" />}
                {(learningPath as any).completion_certificate && (
                  <div className="flex items-center space-x-1 text-yellow-400">
                    <Award className="h-4 w-4" />
                    <span className="text-sm">Certificate</span>
                  </div>
                )}
              </div>

              <h1 className="text-4xl font-bold text-white mb-4">{learningPath.title}</h1>
              <p className="text-xl text-gray-300 mb-6">{learningPath.description}</p>

              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400">
                {learningPath.estimated_duration_hours && (
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>{learningPath.estimated_duration_hours} hours</span>
                  </div>
                )}
                {(learningPath as any).enrollment_count && (
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>{(learningPath as any).enrollment_count} enrolled</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4" />
                  <span>{pathResources.length} resources</span>
                </div>
              </div>
            </div>

            {/* Action Card */}
            <Card className="w-full lg:w-80 bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                {isEnrolled && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Progress</span>
                      <span className="text-sm font-medium text-white">
                        {Math.round(overallProgress)}%
                      </span>
                    </div>
                    <Progress value={overallProgress} className="h-2 mb-2" />
                    <p className="text-xs text-gray-400">
                      {pathResources.filter(r => getResourceStatus(r.resource_id) === 'completed').length} of {pathResources.length} completed
                    </p>
                  </div>
                )}

                {timeRemaining > 0 && isEnrolled && (
                  <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="flex items-center space-x-2 text-blue-400">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {Math.round(timeRemaining / 60)}h {timeRemaining % 60}m remaining
                      </span>
                    </div>
                  </div>
                )}

                {!canAccess ? (
                  <div className="text-center">
                    <Lock className="h-8 w-8 text-yellow-400 mx-auto mb-3" />
                    <p className="text-yellow-400 font-medium mb-2">Premium Content</p>
                    <p className="text-sm text-gray-400 mb-4">
                      Upgrade to Pro to access this learning path
                    </p>
                    <Button asChild className="w-full">
                      <Link href="/pricing">Upgrade to Pro</Link>
                    </Button>
                  </div>
                ) : !isEnrolled ? (
                  <div className="text-center">
                    <Button 
                      onClick={handleEnroll}
                      disabled={enrolling}
                      className="w-full mb-3"
                    >
                      {enrolling ? 'Enrolling...' : 'Enroll in Path'}
                    </Button>
                    <p className="text-xs text-gray-400">
                      Free to enroll • Start learning immediately
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Button asChild className="w-full">
                      <Link href={`#resources`}>
                        Continue Learning
                      </Link>
                    </Button>
                    {overallProgress >= 100 && (learningPath as any).completion_certificate && (
                      <Button variant="outline" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Download Certificate
                      </Button>
                    )}
                  </div>
                )}
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
            <TabsList className="grid w-full grid-cols-3 bg-gray-800/50">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="prerequisites">Prerequisites</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">About This Path</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-invert max-w-none">
                        <p className="text-gray-300 leading-relaxed">
                          {learningPath.description}
                        </p>
                        
                        {(learningPath as any).learning_objectives && (learningPath as any).learning_objectives.length > 0 && (
                          <div className="mt-6">
                            <h4 className="text-white font-semibold mb-3">Learning Objectives</h4>
                            <ul className="space-y-2">
                              {(learningPath as any).learning_objectives.map((objective: string, index: number) => (
                                <li key={index} className="flex items-start space-x-2">
                                  <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                                  <span className="text-gray-300">{objective}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  {/* Path Stats */}
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Path Statistics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Total Resources</span>
                        <span className="text-white font-medium">{pathResources.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Estimated Duration</span>
                        <span className="text-white font-medium">
                          {learningPath.estimated_duration_hours}h
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Difficulty Level</span>
                        <Badge variant="outline" className={getDifficultyColor(learningPath.difficulty_level)}>
                          {learningPath.difficulty_level}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Students Enrolled</span>
                        <span className="text-white font-medium">
                          {(learningPath as any).enrollment_count || 0}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Skills You'll Learn */}
                  {(learningPath as any).skills_covered && (learningPath as any).skills_covered.length > 0 && (
                    <Card className="bg-gray-800/50 border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-white">Skills You&apos;ll Learn</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {(learningPath as any).skills_covered.map((skill: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-cyber-cyan border-cyber-cyan/30">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Resources Tab */}
            <TabsContent value="resources" className="mt-6" id="resources">
              <div className="space-y-4">
                {pathResources.map((pathResource, index) => {
                  const status = getResourceStatus(pathResource.resource_id)
                  const isUnlocked = isResourceUnlocked(pathResource, index)
                  const progress = resourceProgress[pathResource.resource_id]
                  
                  return (
                    <motion.div
                      key={pathResource.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className={`bg-gray-800/50 border-gray-700 ${
                        isUnlocked ? 'hover:border-cyber-cyan/50' : 'opacity-60'
                      } transition-colors`}>
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                                isUnlocked ? 'bg-gray-700 text-gray-400' : 'bg-gray-800 text-gray-500'
                              }`}>
                                {isUnlocked ? getResourceStatusIcon(status) : <Lock className="h-4 w-4" />}
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <h3 className={`font-medium ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>
                                    {pathResource.title || `Resource ${index + 1}`}
                                  </h3>
                                  <Badge variant="outline" className="text-xs">
                                    {pathResource.resource_type}
                                  </Badge>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  {pathResource.estimated_time_minutes && (
                                    <div className="flex items-center space-x-1 text-xs text-gray-400">
                                      <Clock className="h-3 w-3" />
                                      <span>{pathResource.estimated_time_minutes}m</span>
                                    </div>
                                  )}
                                  {getResourceTypeIcon(pathResource.resource_type)}
                                </div>
                              </div>

                              {pathResource.description && (
                                <p className={`text-sm mb-3 ${isUnlocked ? 'text-gray-300' : 'text-gray-500'}`}>
                                  {pathResource.description}
                                </p>
                              )}

                              {progress && progress.progress_percentage > 0 && (
                                <div className="mb-3">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-gray-400">Progress</span>
                                    <span className="text-xs text-white">
                                      {Math.round(progress.progress_percentage)}%
                                    </span>
                                  </div>
                                  <Progress value={progress.progress_percentage} className="h-1" />
                                </div>
                              )}

                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <span className={`text-xs ${
                                    status === 'completed' ? 'text-green-400' :
                                    status === 'in_progress' ? 'text-blue-400' :
                                    isUnlocked ? 'text-gray-400' : 'text-gray-500'
                                  }`}>
                                    {status === 'completed' ? 'Completed' :
                                     status === 'in_progress' ? 'In Progress' :
                                     isUnlocked ? 'Not Started' : 'Locked'}
                                  </span>
                                </div>

                                {isUnlocked && canAccess && isEnrolled && (
                                  <Button size="sm" asChild>
                                    <Link href={`/resources/${pathResource.resource_slug || pathResource.resource_id}`}>
                                      {status === 'completed' ? 'Review' : 
                                       status === 'in_progress' ? 'Continue' : 'Start'}
                                      <ExternalLink className="h-3 w-3 ml-1" />
                                    </Link>
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            </TabsContent>

            {/* Prerequisites Tab */}
            <TabsContent value="prerequisites" className="mt-6">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Prerequisites & Requirements</CardTitle>
                  <CardDescription className="text-gray-400">
                    What you should know before starting this learning path
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {(learningPath as any).prerequisites && (learningPath as any).prerequisites.length > 0 ? (
                    <div className="space-y-4">
                      <h4 className="text-white font-medium">Required Knowledge</h4>
                      <ul className="space-y-2">
                        {(learningPath as any).prerequisites.map((prereq: string, index: number) => (
                          <li key={index} className="flex items-start space-x-2">
                            <Target className="h-4 w-4 text-cyber-cyan mt-0.5 flex-shrink-0" />
                            <span className="text-gray-300">{prereq}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Unlock className="h-12 w-12 text-green-400 mx-auto mb-3" />
                      <h4 className="text-white font-medium mb-2">No Prerequisites Required</h4>
                      <p className="text-gray-400">
                        This learning path is designed for beginners and doesn&apos;t require any prior knowledge.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}