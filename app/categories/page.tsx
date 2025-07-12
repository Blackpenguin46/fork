'use client'

import { useState, useEffect } from 'react'
import { CategoriesService } from '@/lib/api'
import type { Category } from '@/lib/api'

interface CategoryWithChildren extends Category {
  children?: Category[]
}
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  BookOpen, 
  FileText, 
  Wrench, 
  Users, 
  TrendingUp,
  Search, 
  ChevronRight,
  Home,
  Grid3X3,
  FolderOpen,
  Layers
} from 'lucide-react'
import Link from 'next/link'

const categoryIcons = {
  'learning-paths': BookOpen,
  'courses': BookOpen,
  'tools': Wrench,
  'community': Users,
  'insights': TrendingUp,
  'certifications': FileText,
  'default': FolderOpen
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithChildren[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        
        const result = await CategoriesService.getCategoriesWithChildren()
        
        if (result.success && result.data) {
          setCategories(result.data)
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const getCategoryIcon = (slug: string) => {
    const IconComponent = categoryIcons[slug as keyof typeof categoryIcons] || categoryIcons.default
    return <IconComponent className="h-6 w-6" />
  }

  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.children?.some(child => 
      child.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      child.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  return (
    <div className="min-h-screen bg-deep-space-blue pt-16">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center space-x-2 text-sm text-gray-400 mb-6">
          <Link href="/" className="hover:text-cyber-cyan transition-colors">
            <Home className="h-4 w-4" />
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/resources" className="hover:text-cyber-cyan transition-colors">
            Resources
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-white">Categories</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-cyber-cyan/20 rounded-lg">
              <Layers className="h-8 w-8 text-cyber-cyan" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Browse Categories</h1>
              <p className="text-xl text-gray-300 mt-2">
                Explore our organized collection of cybersecurity resources
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <span>{categories.length} main categories</span>
            <span>{categories.reduce((acc, cat) => acc + (cat.children?.length || 0), 0)} subcategories</span>
          </div>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white"
            />
          </div>
        </div>

        {/* Categories */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-48 bg-gray-700 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-12">
            <div className="p-4 bg-gray-800/50 rounded-lg inline-block mb-4">
              <Grid3X3 className="h-12 w-12 text-gray-400 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No categories found</h3>
            <p className="text-gray-400">
              {searchQuery ? 'Try a different search term' : 'No categories are available at the moment'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category) => (
              <Card key={category.id} className="bg-gray-800/50 border-gray-700 hover:border-cyber-cyan/50 transition-all duration-300 group">
                <CardHeader>
                  <Link href={`/category/${category.slug}`} className="block">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-cyber-cyan/20 rounded-lg group-hover:bg-cyber-cyan/30 transition-colors">
                          {getCategoryIcon(category.slug)}
                        </div>
                        <div>
                          <CardTitle className="text-white group-hover:text-cyber-cyan transition-colors">
                            {category.name}
                          </CardTitle>
                          {category.description && (
                            <CardDescription className="text-gray-400 text-sm mt-1">
                              {category.description}
                            </CardDescription>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-cyber-cyan group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                </CardHeader>

                <CardContent>
                  {/* Subcategories */}
                  {category.children && category.children.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-300 mb-3">Subcategories:</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {category.children.slice(0, 4).map((subcategory) => (
                          <Link 
                            key={subcategory.id}
                            href={`/category/${subcategory.slug}`}
                            className="group/sub"
                          >
                            <div className="flex items-center justify-between p-2 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors">
                              <div className="flex items-center space-x-2">
                                <div className="w-1.5 h-1.5 bg-cyber-cyan rounded-full opacity-60 group-hover/sub:opacity-100 transition-opacity"></div>
                                <span className="text-sm text-gray-300 group-hover/sub:text-white transition-colors">
                                  {subcategory.name}
                                </span>
                              </div>
                              <ChevronRight className="h-3 w-3 text-gray-500 group-hover/sub:text-cyber-cyan group-hover/sub:translate-x-0.5 transition-all" />
                            </div>
                          </Link>
                        ))}
                        
                        {category.children.length > 4 && (
                          <Link href={`/category/${category.slug}`}>
                            <div className="text-center p-2 text-xs text-cyber-cyan hover:text-cyber-magenta transition-colors">
                              +{category.children.length - 4} more subcategories
                            </div>
                          </Link>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Category Stats */}
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>Click to explore resources</span>
                      <Badge variant="outline" className="text-xs">
                        {category.children?.length || 0} subcategories
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Quick Links */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Access</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/resources" className="group">
              <div className="flex items-center space-x-2 p-3 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors">
                <BookOpen className="h-4 w-4 text-cyber-cyan" />
                <span className="text-sm text-white group-hover:text-cyber-cyan transition-colors">All Resources</span>
              </div>
            </Link>
            
            <Link href="/resources?type=course" className="group">
              <div className="flex items-center space-x-2 p-3 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors">
                <BookOpen className="h-4 w-4 text-green-400" />
                <span className="text-sm text-white group-hover:text-green-400 transition-colors">Courses</span>
              </div>
            </Link>
            
            <Link href="/resources?type=tool" className="group">
              <div className="flex items-center space-x-2 p-3 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors">
                <Wrench className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-white group-hover:text-blue-400 transition-colors">Tools</span>
              </div>
            </Link>
            
            <Link href="/resources?premium=false" className="group">
              <div className="flex items-center space-x-2 p-3 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors">
                <Users className="h-4 w-4 text-purple-400" />
                <span className="text-sm text-white group-hover:text-purple-400 transition-colors">Free Resources</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}