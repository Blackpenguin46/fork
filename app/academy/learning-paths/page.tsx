'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { GraduationCap, Clock, Crown, Search, Play, BarChart, Target, BookOpen } from 'lucide-react'
import Link from 'next/link'

export default function LearningPathsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('')

  const learningPaths = [
    {
      id: '1',
      title: 'Cybersecurity Fundamentals',
      description: 'Start your cybersecurity journey with essential concepts, threat landscape overview, and basic security principles.',
      difficulty_level: 'beginner',
      estimated_duration_hours: 40,
      is_premium: false,
      modules: 8,
      completion_rate: 87,
      slug: 'cybersecurity-fundamentals'
    },
    {
      id: '2',
      title: 'Network Security Mastery',
      description: 'Master network security protocols, firewalls, intrusion detection, and network monitoring techniques.',
      difficulty_level: 'intermediate',
      estimated_duration_hours: 60,
      is_premium: true,
      modules: 12,
      completion_rate: 73,
      slug: 'network-security-mastery'
    },
    {
      id: '3',
      title: 'Ethical Hacking & Penetration Testing',
      description: 'Learn ethical hacking methodologies, penetration testing frameworks, and vulnerability assessment.',
      difficulty_level: 'advanced',
      estimated_duration_hours: 80,
      is_premium: true,
      modules: 15,
      completion_rate: 65,
      slug: 'ethical-hacking-pentesting'
    },
    {
      id: '4',
      title: 'Cloud Security Architecture',
      description: 'Comprehensive guide to securing cloud infrastructure across AWS, Azure, and Google Cloud.',
      difficulty_level: 'intermediate',
      estimated_duration_hours: 50,
      is_premium: true,
      modules: 10,
      completion_rate: 78,
      slug: 'cloud-security-architecture'
    },
    {
      id: '5',
      title: 'Incident Response & Forensics',
      description: 'Master incident response procedures, digital forensics, and cybersecurity crisis management.',
      difficulty_level: 'advanced',
      estimated_duration_hours: 70,
      is_premium: true,
      modules: 14,
      completion_rate: 69,
      slug: 'incident-response-forensics'
    },
    {
      id: '6',
      title: 'CISSP Certification Path',
      description: 'Complete preparation for CISSP certification covering all 8 domains of cybersecurity knowledge.',
      difficulty_level: 'advanced',
      estimated_duration_hours: 120,
      is_premium: true,
      modules: 24,
      completion_rate: 58,
      slug: 'cissp-certification-path'
    }
  ]

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

  const filteredPaths = learningPaths.filter(path => {
    const matchesSearch = !searchQuery || 
      path.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      path.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesDifficulty = !difficultyFilter || path.difficulty_level === difficultyFilter
    
    return matchesSearch && matchesDifficulty
  })

  return (
    <div className="min-h-screen bg-deep-space-blue pt-16">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <GraduationCap className="h-8 w-8 text-cyber-cyan" />
            <h1 className="text-4xl font-bold text-white">Learning Paths</h1>
          </div>
          <p className="text-xl text-gray-300 mb-6">
            Structured learning journeys designed to take you from beginner to expert in cybersecurity
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search learning paths..."
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
                <SelectItem value="">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Learning Paths Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPaths.map((path) => (
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
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{path.estimated_duration_hours}h</span>
                    </div>
                    <span>{path.modules} modules</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Completion Rate</span>
                      <span className="text-gray-300">{path.completion_rate}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-cyber-cyan rounded-full h-2 transition-all duration-300"
                        style={{ width: `${path.completion_rate}%` }}
                      />
                    </div>
                  </div>
                </div>

                <Button asChild className="w-full">
                  <Link href={`/academy/learning-paths/${path.slug}`}>
                    Start Learning Path
                  </Link>
                </Button>

                {path.is_premium && (
                  <p className="text-xs text-yellow-400 mt-2 text-center">
                    Premium content - upgrade to access
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPaths.length === 0 && (
          <div className="text-center py-12">
            <GraduationCap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">No learning paths found matching your criteria</p>
            <Button onClick={() => {
              setSearchQuery('')
              setDifficultyFilter('')
            }} variant="outline">
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}