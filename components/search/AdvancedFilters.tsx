'use client'

import { useState, useEffect } from 'react'
import { CategoriesService, TagsService } from '@/lib/api'
import type { Category, Tag } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { 
  Filter, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Tag as TagIcon,
  BookOpen,
  Clock,
  Crown,
  TrendingUp,
  Calendar,
  BarChart3
} from 'lucide-react'

interface FilterOptions {
  categories: string[]
  tags: string[]
  resourceTypes: string[]
  difficultyLevels: string[]
  isPremium?: boolean
  dateRange?: {
    start: string
    end: string
  }
  estimatedTimeRange?: {
    min: number
    max: number
  }
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

interface AdvancedFiltersProps {
  isOpen: boolean
  onClose: () => void
  onApplyFilters: (filters: FilterOptions) => void
  initialFilters?: Partial<FilterOptions>
  showCompactView?: boolean
}

export default function AdvancedFilters({ 
  isOpen, 
  onClose, 
  onApplyFilters, 
  initialFilters = {},
  showCompactView = false
}: AdvancedFiltersProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  
  const [filters, setFilters] = useState<FilterOptions>({
    categories: [],
    tags: [],
    resourceTypes: [],
    difficultyLevels: [],
    isPremium: undefined,
    dateRange: undefined,
    estimatedTimeRange: undefined,
    sortBy: 'created_at',
    sortOrder: 'desc',
    ...initialFilters
  })

  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    tags: true,
    resourceTypes: true,
    difficulty: true,
    premium: true,
    time: false,
    date: false,
    sort: true
  })

  useEffect(() => {
    fetchFilterData()
  }, [])

  const fetchFilterData = async () => {
    try {
      setLoading(true)
      
      const [categoriesResult, tagsResult] = await Promise.all([
        CategoriesService.getCategories(),
        TagsService.getPopularTags(20)
      ])

      if (categoriesResult.success && categoriesResult.data) {
        setCategories(categoriesResult.data.data || [])
      }

      if (tagsResult.success && tagsResult.data) {
        setTags(tagsResult.data)
      }
    } catch (error) {
      console.error('Error fetching filter data:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleFilterChange = (filterType: keyof FilterOptions, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
  }

  const handleArrayFilterToggle = (filterType: 'categories' | 'tags' | 'resourceTypes' | 'difficultyLevels', value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter(item => item !== value)
        : [...prev[filterType], value]
    }))
  }

  const clearAllFilters = () => {
    setFilters({
      categories: [],
      tags: [],
      resourceTypes: [],
      difficultyLevels: [],
      isPremium: undefined,
      dateRange: undefined,
      estimatedTimeRange: undefined,
      sortBy: 'created_at',
      sortOrder: 'desc'
    })
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.categories.length > 0) count += filters.categories.length
    if (filters.tags.length > 0) count += filters.tags.length
    if (filters.resourceTypes.length > 0) count += filters.resourceTypes.length
    if (filters.difficultyLevels.length > 0) count += filters.difficultyLevels.length
    if (filters.isPremium !== undefined) count += 1
    if (filters.dateRange) count += 1
    if (filters.estimatedTimeRange) count += 1
    return count
  }

  const applyFilters = () => {
    onApplyFilters(filters)
    onClose()
  }

  if (!isOpen) return null

  const FilterSection = ({ 
    title, 
    icon, 
    sectionKey, 
    children 
  }: { 
    title: string
    icon: React.ReactNode
    sectionKey: keyof typeof expandedSections
    children: React.ReactNode 
  }) => (
    <div className="border-b border-gray-700 last:border-b-0">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center space-x-2">
          {icon}
          <span className="font-medium text-white">{title}</span>
        </div>
        {expandedSections[sectionKey] ? (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        )}
      </button>
      {expandedSections[sectionKey] && (
        <div className="px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="border-b border-gray-700">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <span>Advanced Filters</span>
                {getActiveFiltersCount() > 0 && (
                  <Badge variant="outline" className="bg-cyber-cyan/10 text-cyber-cyan">
                    {getActiveFiltersCount()} active
                  </Badge>
                )}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0 max-h-[70vh] overflow-y-auto">
            {/* Categories */}
            <FilterSection 
              title="Categories" 
              icon={<BookOpen className="h-4 w-4 text-blue-400" />}
              sectionKey="categories"
            >
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {categories.map((category) => (
                  <label key={category.id} className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-800/50 rounded">
                    <Checkbox
                      checked={filters.categories.includes(category.id)}
                      onCheckedChange={() => handleArrayFilterToggle('categories', category.id)}
                    />
                    <span className="text-sm text-gray-300">{category.name}</span>
                  </label>
                ))}
              </div>
            </FilterSection>

            {/* Tags */}
            <FilterSection 
              title="Tags" 
              icon={<TagIcon className="h-4 w-4 text-green-400" />}
              sectionKey="tags"
            >
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => handleArrayFilterToggle('tags', tag.id)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      filters.tags.includes(tag.id)
                        ? 'bg-cyber-cyan text-black'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {tag.name}
                    {tag.usage_count && (
                      <span className="ml-1 opacity-60">({tag.usage_count})</span>
                    )}
                  </button>
                ))}
              </div>
            </FilterSection>

            {/* Resource Types */}
            <FilterSection 
              title="Resource Types" 
              icon={<BarChart3 className="h-4 w-4 text-purple-400" />}
              sectionKey="resourceTypes"
            >
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {['course', 'article', 'video', 'tool', 'community', 'documentation'].map((type) => (
                  <label key={type} className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-800/50 rounded">
                    <Checkbox
                      checked={filters.resourceTypes.includes(type)}
                      onCheckedChange={() => handleArrayFilterToggle('resourceTypes', type)}
                    />
                    <span className="text-sm text-gray-300 capitalize">{type}</span>
                  </label>
                ))}
              </div>
            </FilterSection>

            {/* Difficulty Levels */}
            <FilterSection 
              title="Difficulty Levels" 
              icon={<TrendingUp className="h-4 w-4 text-orange-400" />}
              sectionKey="difficulty"
            >
              <div className="grid grid-cols-3 gap-2">
                {['beginner', 'intermediate', 'advanced'].map((level) => (
                  <label key={level} className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-800/50 rounded">
                    <Checkbox
                      checked={filters.difficultyLevels.includes(level)}
                      onCheckedChange={() => handleArrayFilterToggle('difficultyLevels', level)}
                    />
                    <span className="text-sm text-gray-300 capitalize">{level}</span>
                  </label>
                ))}
              </div>
            </FilterSection>

            {/* Premium Content */}
            <FilterSection 
              title="Access Level" 
              icon={<Crown className="h-4 w-4 text-yellow-400" />}
              sectionKey="premium"
            >
              <div className="space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-800/50 rounded">
                  <input
                    type="radio"
                    name="premium"
                    checked={filters.isPremium === undefined}
                    onChange={() => handleFilterChange('isPremium', undefined)}
                    className="text-cyber-cyan"
                  />
                  <span className="text-sm text-gray-300">All Content</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-800/50 rounded">
                  <input
                    type="radio"
                    name="premium"
                    checked={filters.isPremium === false}
                    onChange={() => handleFilterChange('isPremium', false)}
                    className="text-cyber-cyan"
                  />
                  <span className="text-sm text-gray-300">Free Only</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-800/50 rounded">
                  <input
                    type="radio"
                    name="premium"
                    checked={filters.isPremium === true}
                    onChange={() => handleFilterChange('isPremium', true)}
                    className="text-cyber-cyan"
                  />
                  <span className="text-sm text-gray-300">Premium Only</span>
                </label>
              </div>
            </FilterSection>

            {/* Estimated Time */}
            <FilterSection 
              title="Estimated Time" 
              icon={<Clock className="h-4 w-4 text-cyan-400" />}
              sectionKey="time"
            >
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="timeMin" className="text-sm text-gray-400">Min (minutes)</Label>
                    <input
                      id="timeMin"
                      type="number"
                      min="0"
                      max="1440"
                      value={filters.estimatedTimeRange?.min || ''}
                      onChange={(e) => handleFilterChange('estimatedTimeRange', {
                        ...filters.estimatedTimeRange,
                        min: parseInt(e.target.value) || 0
                      })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="timeMax" className="text-sm text-gray-400">Max (minutes)</Label>
                    <input
                      id="timeMax"
                      type="number"
                      min="0"
                      max="1440"
                      value={filters.estimatedTimeRange?.max || ''}
                      onChange={(e) => handleFilterChange('estimatedTimeRange', {
                        ...filters.estimatedTimeRange,
                        max: parseInt(e.target.value) || 1440
                      })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: '< 15 min', min: 0, max: 15 },
                    { label: '15-30 min', min: 15, max: 30 },
                    { label: '30-60 min', min: 30, max: 60 },
                    { label: '1-2 hours', min: 60, max: 120 },
                    { label: '2+ hours', min: 120, max: 1440 }
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => handleFilterChange('estimatedTimeRange', { min: preset.min, max: preset.max })}
                      className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-sm text-gray-300 transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </FilterSection>

            {/* Sort Options */}
            <FilterSection 
              title="Sort Options" 
              icon={<BarChart3 className="h-4 w-4 text-gray-400" />}
              sectionKey="sort"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sortBy" className="text-sm text-gray-400">Sort by</Label>
                  <select
                    id="sortBy"
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                  >
                    <option value="created_at">Date Created</option>
                    <option value="updated_at">Date Updated</option>
                    <option value="view_count">View Count</option>
                    <option value="like_count">Like Count</option>
                    <option value="title">Title</option>
                    <option value="difficulty_level">Difficulty</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="sortOrder" className="text-sm text-gray-400">Order</Label>
                  <select
                    id="sortOrder"
                    value={filters.sortOrder}
                    onChange={(e) => handleFilterChange('sortOrder', e.target.value as 'asc' | 'desc')}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                  >
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </select>
                </div>
              </div>
            </FilterSection>
          </CardContent>

          {/* Footer */}
          <div className="border-t border-gray-700 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={clearAllFilters}>
                Clear All
              </Button>
              <span className="text-sm text-gray-400">
                {getActiveFiltersCount()} filter{getActiveFiltersCount() !== 1 ? 's' : ''} active
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={applyFilters} className="bg-cyber-cyan hover:bg-cyber-cyan/80">
                Apply Filters
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}