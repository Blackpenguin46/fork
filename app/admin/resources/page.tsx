'use client'

// Force dynamic rendering to prevent prerendering errors
export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '@/app/providers'
import { useRouter, useSearchParams } from 'next/navigation'
import { ResourcesService } from '@/lib/api'
import type { Resource } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  BookOpen, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Plus,
  Upload,
  Download,
  CheckCircle,
  Clock,
  AlertTriangle,
  Crown,
  FileText,
  Video,
  Code,
  ExternalLink,
  Calendar,
  User,
  Tag,
  BarChart3,
  TrendingUp,
  Settings
} from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface ResourceFilters {
  search: string
  status: 'all' | 'published' | 'unpublished' | 'draft'
  type: string
  category: string
  difficulty: string
  premium: 'all' | 'free' | 'premium'
}

function AdminResourcesPageContent() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedResources, setSelectedResources] = useState<string[]>([])
  const [bulkAction, setBulkAction] = useState<string>('')
  const [filters, setFilters] = useState<ResourceFilters>({
    search: '',
    status: searchParams.get('filter') === 'unpublished' ? 'unpublished' : 'all',
    type: 'all',
    category: 'all',
    difficulty: 'all',
    premium: 'all'
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // In a real app, this would be an admin-specific API call
        const result = await ResourcesService.getResources({
          searchQuery: filters.search,
          page: 1,
          limit: 100
          // Add other filters as needed
        })

        if (result.success) {
          setResources(result.data?.data || [])
        } else {
          setError(result.error || 'Failed to fetch resources')
        }
      } catch (error) {
        console.error('Error fetching resources:', error)
        setError('Failed to fetch resources')
      } finally {
        setLoading(false)
      }
    }

    fetchResources()
  }, [filters])

  const getStatusColor = (isPublished: boolean) => {
    return isPublished 
      ? 'bg-green-500/10 text-green-400 border-green-500/20'
      : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
  }

  const getStatusIcon = (isPublished: boolean) => {
    return isPublished ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />
  }

  const getTypeIcon = (type: string) => {
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

  const filteredResources = resources.filter(resource => {
    const matchesSearch = !filters.search || 
      resource.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      resource.description.toLowerCase().includes(filters.search.toLowerCase())
    
    const matchesStatus = filters.status === 'all' || 
      (filters.status === 'published' && resource.is_published) ||
      (filters.status === 'unpublished' && !resource.is_published)
    
    const matchesType = filters.type === 'all' || resource.resource_type === filters.type
    const matchesDifficulty = filters.difficulty === 'all' || resource.difficulty_level === filters.difficulty
    const matchesPremium = filters.premium === 'all' || 
      (filters.premium === 'premium' && resource.is_premium) ||
      (filters.premium === 'free' && !resource.is_premium)
    
    return matchesSearch && matchesStatus && matchesType && matchesDifficulty && matchesPremium
  })

  const handleSelectResource = (resourceId: string) => {
    setSelectedResources(prev => 
      prev.includes(resourceId) 
        ? prev.filter(id => id !== resourceId)
        : [...prev, resourceId]
    )
  }

  const handleSelectAll = () => {
    if (selectedResources.length === filteredResources.length) {
      setSelectedResources([])
    } else {
      setSelectedResources(filteredResources.map(r => r.id))
    }
  }

  const handleBulkAction = async () => {
    if (!bulkAction || selectedResources.length === 0) return

    try {
      // Implement bulk actions
      switch (bulkAction) {
        case 'publish':
          console.log('Publishing resources:', selectedResources)
          // Call API to publish resources
          break
        case 'unpublish':
          console.log('Unpublishing resources:', selectedResources)
          // Call API to unpublish resources
          break
        case 'delete':
          console.log('Deleting resources:', selectedResources)
          // Call API to delete resources
          break
        case 'premium':
          console.log('Making resources premium:', selectedResources)
          // Call API to make resources premium
          break
      }
      
      // Reset selection
      setSelectedResources([])
      setBulkAction('')
    } catch (error) {
      console.error('Error performing bulk action:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-deep-space-blue pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-700 rounded w-1/3"></div>
            <div className="grid grid-cols-1 gap-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const stats = {
    total: resources.length,
    published: resources.filter(r => r.is_published).length,
    unpublished: resources.filter(r => !r.is_published).length,
    premium: resources.filter(r => r.is_premium).length
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
                <BookOpen className="h-8 w-8 text-cyber-cyan" />
                <h1 className="text-4xl font-bold text-white">Resource Management</h1>
              </div>
              <p className="text-xl text-gray-300">
                Manage learning resources and content
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Import Resources
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Resource
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.total}</p>
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
                    <p className="text-2xl font-bold text-white">{stats.published}</p>
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
                    <p className="text-2xl font-bold text-white">{stats.unpublished}</p>
                    <p className="text-sm text-gray-400">Unpublished</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Crown className="h-5 w-5 text-yellow-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.premium}</p>
                    <p className="text-sm text-gray-400">Premium</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search resources..."
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-10 bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>

                <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value as any }))}>
                  <SelectTrigger className="bg-gray-700 border-gray-600">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="unpublished">Unpublished</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger className="bg-gray-700 border-gray-600">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="article">Article</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="course">Course</SelectItem>
                    <SelectItem value="tool">Tool</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.difficulty} onValueChange={(value) => setFilters(prev => ({ ...prev, difficulty: value }))}>
                  <SelectTrigger className="bg-gray-700 border-gray-600">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.premium} onValueChange={(value) => setFilters(prev => ({ ...prev, premium: value as any }))}>
                  <SelectTrigger className="bg-gray-700 border-gray-600">
                    <SelectValue placeholder="Access" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Access</SelectItem>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bulk Actions */}
        {selectedResources.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="bg-blue-500/10 border-blue-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-white font-medium">
                      {selectedResources.length} resource{selectedResources.length !== 1 ? 's' : ''} selected
                    </span>
                    <Select value={bulkAction} onValueChange={setBulkAction}>
                      <SelectTrigger className="w-48 bg-gray-700 border-gray-600">
                        <SelectValue placeholder="Bulk Actions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="publish">Publish</SelectItem>
                        <SelectItem value="unpublish">Unpublish</SelectItem>
                        <SelectItem value="premium">Make Premium</SelectItem>
                        <SelectItem value="free">Make Free</SelectItem>
                        <SelectItem value="delete">Delete</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button onClick={handleBulkAction} disabled={!bulkAction}>
                      Apply Action
                    </Button>
                    <Button variant="outline" onClick={() => setSelectedResources([])}>
                      Clear Selection
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Resources List */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {/* Header Row */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <Checkbox
                  checked={selectedResources.length === filteredResources.length && filteredResources.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <div className="flex-1 grid grid-cols-12 gap-4 text-sm font-medium text-gray-400">
                  <div className="col-span-4">Resource</div>
                  <div className="col-span-2">Type</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-2">Difficulty</div>
                  <div className="col-span-1">Views</div>
                  <div className="col-span-1">Actions</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resource Rows */}
          {filteredResources.map((resource, index) => (
            <motion.div
              key={resource.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="bg-gray-800/50 border-gray-700 hover:border-cyber-cyan/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <Checkbox
                      checked={selectedResources.includes(resource.id)}
                      onCheckedChange={() => handleSelectResource(resource.id)}
                    />
                    
                    <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                      {/* Resource Info */}
                      <div className="col-span-4">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            {getTypeIcon(resource.resource_type)}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-white font-medium line-clamp-1">{resource.title}</h3>
                            <p className="text-sm text-gray-400 line-clamp-2">{resource.description}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              {resource.is_premium && <Crown className="h-3 w-3 text-yellow-400" />}
                              <span className="text-xs text-gray-500">
                                Created {formatDate(resource.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Type */}
                      <div className="col-span-2">
                        <Badge variant="outline" className="text-xs">
                          {resource.resource_type}
                        </Badge>
                      </div>

                      {/* Status */}
                      <div className="col-span-2">
                        <Badge variant="outline" className={getStatusColor(resource.is_published)}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(resource.is_published)}
                            <span>{resource.is_published ? 'Published' : 'Unpublished'}</span>
                          </div>
                        </Badge>
                      </div>

                      {/* Difficulty */}
                      <div className="col-span-2">
                        <Badge variant="outline" className={getDifficultyColor(resource.difficulty_level)}>
                          {resource.difficulty_level}
                        </Badge>
                      </div>

                      {/* Views */}
                      <div className="col-span-1">
                        <div className="flex items-center space-x-1 text-sm text-gray-400">
                          <Eye className="h-3 w-3" />
                          <span>{resource.view_count || 0}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="col-span-1">
                        <div className="flex items-center space-x-1">
                          <Button size="sm" variant="ghost" asChild>
                            <Link href={`/admin/resources/${resource.id}/edit`}>
                              <Edit className="h-3 w-3" />
                            </Link>
                          </Button>
                          <Button size="sm" variant="ghost" asChild>
                            <Link href={`/resources/${resource.id}`} target="_blank">
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {/* Empty State */}
          {filteredResources.length === 0 && (
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-12">
                <div className="text-center">
                  <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No resources found</h3>
                  <p className="text-gray-400 mb-6">
                    Try adjusting your search criteria or add new resources
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Resource
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Pagination would go here */}
      </div>
    </div>
  )
}

export default function AdminResourcesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-deep-space-blue pt-16 flex items-center justify-center text-white">Loading...</div>}>
      <AdminResourcesPageContent />
    </Suspense>
  )
}