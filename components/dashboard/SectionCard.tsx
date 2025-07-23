'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useAnalytics } from '@/lib/services/analytics'
import type { LucideIcon } from 'lucide-react'

interface SectionStats {
  [key: string]: number | string
}

interface SectionCardProps {
  title: string
  description: string
  href: string
  icon: LucideIcon
  stats: SectionStats
  gradient: string
  loading?: boolean
  className?: string
}

export default function SectionCard({
  title,
  description,
  href,
  icon: Icon,
  stats,
  gradient,
  loading = false,
  className = ''
}: SectionCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const { trackSectionClick } = useAnalytics()

  const handleClick = () => {
    trackSectionClick(title.toLowerCase() as 'community' | 'insights' | 'academy')
  }

  const formatStatValue = (value: number | string): string => {
    if (typeof value === 'string') return value
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
    return value.toLocaleString()
  }

  const formatStatName = (key: string): string => {
    const nameMap: Record<string, string> = {
      totalMembers: 'Total Members',
      dailyActiveUsers: 'Daily Active',
      expertCount: 'Expert Contributors',
      totalThreats: 'Total Threats',
      criticalThreats: 'Critical Alerts',
      newCves: 'New CVEs',
      activeCampaigns: 'Active Campaigns',
      learningPaths: 'Learning Paths',
      totalCourses: 'Total Courses',
      totalArticles: 'Articles & Guides',
      premiumContent: 'Premium Content'
    }
    
    return nameMap[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
  }

  const getStatIcon = (key: string, value: number | string) => {
    // Simple trend detection based on stat names
    if (key.toLowerCase().includes('trend') || key.toLowerCase().includes('growth')) {
      if (typeof value === 'number') {
        if (value > 0) return <TrendingUp className="h-3 w-3 text-green-400" />
        if (value < 0) return <TrendingDown className="h-3 w-3 text-red-400" />
      }
      return <Minus className="h-3 w-3 text-gray-400" />
    }
    return null
  }

  // Prioritize most important stats based on section
  const getImportantStats = (title: string, stats: SectionStats) => {
    const entries = Object.entries(stats)
    
    switch (title.toLowerCase()) {
      case 'community':
        return entries.filter(([key]) => 
          ['totalMembers', 'dailyActiveUsers', 'expertCount'].includes(key)
        ).slice(0, 3)
      case 'insights':
        return entries.filter(([key]) => 
          ['totalThreats', 'criticalThreats', 'newCves'].includes(key)
        ).slice(0, 3)
      case 'academy':
        return entries.filter(([key]) => 
          ['learningPaths', 'totalCourses', 'totalArticles'].includes(key)
        ).slice(0, 3)
      default:
        return entries.slice(0, 3)
    }
  }

  const mainStats = getImportantStats(title, stats)
  const hasMoreStats = Object.keys(stats).length > mainStats.length

  if (loading) {
    return (
      <Card className={`bg-gray-800/50 border-gray-700 ${className}`}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-700 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-6 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-full"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-700 rounded w-1/2"></div>
              <div className="h-4 bg-gray-700 rounded w-1/3"></div>
              <div className="h-4 bg-gray-700 rounded w-2/3"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Link href={href} className="group block" onClick={handleClick}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className={className}
      >
        <Card className="bg-gray-800/50 border-gray-700 hover:border-cyber-cyan/50 transition-all duration-300 h-full group-hover:shadow-lg group-hover:shadow-cyber-cyan/10">
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-lg bg-gradient-to-r ${gradient} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white group-hover:text-cyber-cyan transition-colors">
                    {title}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                    {description}
                  </p>
                </div>
              </div>
              
              <motion.div
                animate={{ x: isHovered ? 4 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-cyber-cyan transition-colors" />
              </motion.div>
            </div>

            {/* Statistics */}
            <div className="space-y-3">
              {mainStats.map(([key, value], index) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-300">
                      {formatStatName(key)}
                    </span>
                    {getStatIcon(key, value)}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-semibold text-white">
                      {formatStatValue(value)}
                    </span>
                    {typeof value === 'number' && value > 1000 && (
                      <Badge variant="outline" className="text-xs bg-cyber-cyan/10 text-cyber-cyan border-cyber-cyan/20">
                        Popular
                      </Badge>
                    )}
                  </div>
                </motion.div>
              ))}
              
              {hasMoreStats && (
                <div className="pt-2 border-t border-gray-700">
                  <span className="text-xs text-gray-400">
                    +{Object.keys(stats).length - 3} more metrics
                  </span>
                </div>
              )}
            </div>

            {/* Call to Action */}
            <div className="mt-6 pt-4 border-t border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">
                  Explore {title.toLowerCase()}
                </span>
                <div className="flex items-center space-x-1 text-cyber-cyan group-hover:text-white transition-colors">
                  <span className="text-sm font-medium">View All</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  )
}