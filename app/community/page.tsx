'use client'

import { useState, useEffect } from 'react'
import { ResourcesService, CategoriesService } from '@/lib/api'
import type { Resource, Category } from '@/lib/api'
import { useAuth } from '@/app/providers'
import { useSubscription } from '@/hooks/useSubscription'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, MessageSquare, ExternalLink, Search, Star, Eye, Crown, Globe, MessageCircle } from 'lucide-react'
import Link from 'next/link'

export default function CommunityPage() {
  const { user } = useAuth()
  const subscriptionData = useSubscription()
  const { canAccessPremiumResources, canAccessPremiumDiscord } = subscriptionData || { 
    canAccessPremiumResources: false, 
    canAccessPremiumDiscord: false 
  }
  
  const [resources, setResources] = useState<Resource[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        const [resourcesResult, categoriesResult] = await Promise.all([
          ResourcesService.getResourcesByType('community', 50),
          CategoriesService.getCategory('community')
        ])

        if (resourcesResult.success && resourcesResult.data) {
          setResources(resourcesResult.data)
        }

        if (categoriesResult.success && categoriesResult.data) {
          // Get subcategories
          const subcategoriesResult = await CategoriesService.getCategories({
            parentId: categoriesResult.data.id,
            isActive: true
          })
          
          if (subcategoriesResult.success && subcategoriesResult.data) {
            setCategories(subcategoriesResult.data.data)
          }
        }
      } catch (error) {
        console.error('Error fetching community data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredResources = resources.filter(resource => {
    const matchesSearch = !searchQuery || 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || 
      resource.slug.includes(selectedCategory.toLowerCase().replace(/\s+/g, '-'))
    
    return matchesSearch && matchesCategory
  })

  const getResourceIcon = (resourceSlug: string) => {
    if (resourceSlug.includes('discord')) return <MessageSquare className="h-5 w-5 text-blue-400" />
    if (resourceSlug.includes('reddit')) return <MessageCircle className="h-5 w-5 text-orange-400" />
    return <Users className="h-5 w-5 text-green-400" />
  }

  const getCommunityStats = () => {
    const totalCommunities = resources.length
    const discordServers = resources.filter(r => r.slug.includes('discord')).length
    const redditCommunities = resources.filter(r => r.slug.includes('reddit')).length
    const forums = resources.filter(r => r.slug.includes('forum')).length
    
    return { totalCommunities, discordServers, redditCommunities, forums }
  }

  const stats = getCommunityStats()

  const featuredCommunities = resources.filter(r => r.is_featured).slice(0, 3)
  const premiumCommunities = resources.filter(r => r.is_premium)

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
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Users className="h-8 w-8 text-cyber-cyan" />
            <h1 className="text-4xl font-bold text-white">Community</h1>
          </div>
          <p className="text-xl text-gray-300 mb-6">
            Connect with cybersecurity professionals and enthusiasts worldwide
          </p>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-cyber-cyan" />
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.totalCommunities}</p>
                    <p className="text-sm text-gray-400">Communities</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.discordServers}</p>
                    <p className="text-sm text-gray-400">Discord Servers</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <MessageCircle className="h-5 w-5 text-orange-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.redditCommunities}</p>
                    <p className="text-sm text-gray-400">Reddit Communities</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-green-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.forums}</p>
                    <p className="text-sm text-gray-400">Professional Forums</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Featured Communities */}
        {featuredCommunities.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Featured Communities</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredCommunities.map((community) => (
                <Card key={community.id} className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-cyber-cyan/30 hover:border-cyber-cyan/60 transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {getResourceIcon(community.slug)}
                        <Badge variant="outline" className="text-cyber-cyan border-cyber-cyan/30">
                          Featured
                        </Badge>
                      </div>
                      {community.is_premium && (
                        <Crown className="h-4 w-4 text-yellow-400" />
                      )}
                    </div>
                    
                    <CardTitle className="text-white">{community.title}</CardTitle>
                    <CardDescription className="text-gray-300">
                      {community.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span>{community.view_count}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4" />
                          <span>{community.like_count}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button asChild className="flex-1" disabled={community.is_premium && !canAccessPremiumResources}>
                        <Link href={`/resources/${community.slug}`}>
                          View Community
                        </Link>
                      </Button>
                      
                      {community.url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={community.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>

                    {community.is_premium && !canAccessPremiumResources && (
                      <p className="text-xs text-yellow-400 mt-2">
                        Premium community - upgrade to access
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search communities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white"
              />
            </div>
          </div>
        </div>

        {/* Community Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800/50">
            <TabsTrigger value="all">All Communities</TabsTrigger>
            <TabsTrigger value="discord">Discord Servers</TabsTrigger>
            <TabsTrigger value="reddit">Reddit</TabsTrigger>
            <TabsTrigger value="forums">Forums</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-6">
            {filteredResources.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">No communities found matching your criteria</p>
                <Button onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('all')
                }} variant="outline">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.map((community) => (
                  <Card key={community.id} className="bg-gray-800/50 border-gray-700 hover:border-cyber-cyan/50 transition-colors">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          {getResourceIcon(community.slug)}
                          {community.is_featured && (
                            <Badge variant="outline" className="text-cyber-cyan border-cyber-cyan/30">
                              Featured
                            </Badge>
                          )}
                        </div>
                        {community.is_premium && (
                          <Crown className="h-4 w-4 text-yellow-400" />
                        )}
                      </div>
                      
                      <CardTitle className="text-white line-clamp-2">
                        {community.title}
                      </CardTitle>
                      
                      <CardDescription className="text-gray-400 line-clamp-3">
                        {community.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Eye className="h-4 w-4" />
                            <span>{community.view_count}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4" />
                            <span>{community.like_count}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button 
                          asChild 
                          className="flex-1"
                          disabled={community.is_premium && !canAccessPremiumResources}
                        >
                          <Link href={`/resources/${community.slug}`}>
                            View Community
                          </Link>
                        </Button>
                        
                        {community.url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={community.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>

                      {community.is_premium && !canAccessPremiumResources && (
                        <p className="text-xs text-yellow-400 mt-2">
                          Premium community - upgrade to access
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Premium Discord Section */}
        {canAccessPremiumDiscord && premiumCommunities.length > 0 && (
          <div className="mt-12">
            <Card className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-500/30">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Crown className="h-6 w-6 text-yellow-400" />
                  <CardTitle className="text-white">Premium Discord Access</CardTitle>
                </div>
                <CardDescription className="text-gray-300">
                  Exclusive access to premium cybersecurity Discord communities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {premiumCommunities.slice(0, 2).map((community) => (
                    <div key={community.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <MessageSquare className="h-5 w-5 text-purple-400" />
                        <div>
                          <p className="text-white font-medium">{community.title}</p>
                          <p className="text-sm text-gray-400">{community.description}</p>
                        </div>
                      </div>
                      <Button size="sm" asChild>
                        <Link href={`/resources/${community.slug}`}>
                          Join
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}