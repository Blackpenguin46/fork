'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  TrendingUp, 
  AlertTriangle, 
  Shield, 
  Eye, 
  Clock, 
  ExternalLink,
  Search,
  Filter,
  Calendar,
  Globe,
  Zap,
  Target,
  Bug,
  Lock,
  Unlock,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  Users,
  Server,
  Smartphone,
  Wifi,
  Database,
  Cloud,
  Code,
  FileText,
  Video,
  Newspaper,
  Rss,
  Bell,
  Star,
  Bookmark,
  Share,
  Download,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/app/providers'
import { useSubscription } from '@/hooks/useSubscription'

interface ThreatIntelligence {
  id: string
  title: string
  description: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  category: string
  source: string
  published_at: string
  cve_id?: string
  affected_systems: string[]
  mitigation_steps: string[]
  references: string[]
}

interface SecurityNews {
  id: string
  title: string
  summary: string
  content: string
  author: string
  published_at: string
  category: string
  tags: string[]
  read_time: number
  image_url?: string
  source_url: string
}

interface ThreatMetrics {
  total_threats: number
  critical_threats: number
  new_cves: number
  active_campaigns: number
  threat_trend: 'up' | 'down' | 'stable'
  top_attack_vectors: Array<{ name: string; count: number; trend: 'up' | 'down' | 'stable' }>
  geographic_distribution: Array<{ country: string; threat_count: number }>
}

export default function InsightsPage() {
  const { user } = useAuth()
  const { isPro, canAccessPremiumInsights } = useSubscription()
  
  const [threatIntel, setThreatIntel] = useState<ThreatIntelligence[]>([])
  const [securityNews, setSecurityNews] = useState<SecurityNews[]>([])
  const [threatMetrics, setThreatMetrics] = useState<ThreatMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Simulate API calls - replace with real API endpoints
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock threat intelligence data
        const mockThreatIntel: ThreatIntelligence[] = [
          {
            id: '1',
            title: 'Critical RCE Vulnerability in Apache Struts',
            description: 'A critical remote code execution vulnerability has been discovered in Apache Struts framework affecting versions 2.5.0 to 2.5.30.',
            severity: 'critical',
            category: 'Vulnerability',
            source: 'NIST NVD',
            published_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            cve_id: 'CVE-2023-50164',
            affected_systems: ['Apache Struts 2.5.0-2.5.30', 'Web Applications'],
            mitigation_steps: [
              'Upgrade to Apache Struts 2.5.31 or later',
              'Apply security patches immediately',
              'Review and audit existing applications'
            ],
            references: ['https://nvd.nist.gov/vuln/detail/CVE-2023-50164']
          },
          {
            id: '2',
            title: 'New Ransomware Campaign Targeting Healthcare',
            description: 'Security researchers have identified a new ransomware campaign specifically targeting healthcare organizations with sophisticated social engineering tactics.',
            severity: 'high',
            category: 'Malware',
            source: 'CrowdStrike',
            published_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            affected_systems: ['Windows Systems', 'Healthcare Networks'],
            mitigation_steps: [
              'Implement email security controls',
              'Regular backup verification',
              'Employee security awareness training'
            ],
            references: ['https://crowdstrike.com/threat-intel']
          },
          {
            id: '3',
            title: 'Supply Chain Attack on NPM Packages',
            description: 'Multiple malicious NPM packages discovered containing cryptocurrency miners and data exfiltration capabilities.',
            severity: 'medium',
            category: 'Supply Chain',
            source: 'GitHub Security',
            published_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            affected_systems: ['Node.js Applications', 'JavaScript Projects'],
            mitigation_steps: [
              'Audit NPM dependencies',
              'Use package vulnerability scanners',
              'Implement software composition analysis'
            ],
            references: ['https://github.com/advisories']
          }
        ]

        // Mock security news data
        const mockSecurityNews: SecurityNews[] = [
          {
            id: '1',
            title: 'Zero Trust Architecture: Implementation Best Practices for 2024',
            summary: 'Comprehensive guide to implementing Zero Trust security architecture in modern enterprise environments.',
            content: 'Zero Trust has evolved from a buzzword to a critical security framework...',
            author: 'Sarah Chen',
            published_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            category: 'Architecture',
            tags: ['Zero Trust', 'Enterprise Security', 'Best Practices'],
            read_time: 8,
            source_url: 'https://cybernexacademy.com/insights/zero-trust-2024'
          },
          {
            id: '2',
            title: 'AI-Powered Threat Detection: The Future of SOC Operations',
            summary: 'How artificial intelligence is revolutionizing security operations centers and threat detection capabilities.',
            content: 'The integration of AI and machine learning in cybersecurity...',
            author: 'Michael Rodriguez',
            published_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
            category: 'Technology',
            tags: ['AI', 'Machine Learning', 'SOC', 'Threat Detection'],
            read_time: 12,
            source_url: 'https://cybernexacademy.com/insights/ai-threat-detection'
          },
          {
            id: '3',
            title: 'Cloud Security Misconfigurations: Top 10 Risks and Remediation',
            summary: 'Analysis of the most common cloud security misconfigurations and how to prevent them.',
            content: 'Cloud adoption continues to accelerate, but security misconfigurations...',
            author: 'Lisa Wang',
            published_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            category: 'Cloud Security',
            tags: ['Cloud Security', 'AWS', 'Azure', 'GCP', 'Misconfiguration'],
            read_time: 10,
            source_url: 'https://cybernexacademy.com/insights/cloud-misconfigurations'
          }
        ]

        // Mock threat metrics
        const mockThreatMetrics: ThreatMetrics = {
          total_threats: 1247,
          critical_threats: 23,
          new_cves: 156,
          active_campaigns: 8,
          threat_trend: 'up',
          top_attack_vectors: [
            { name: 'Phishing', count: 342, trend: 'up' },
            { name: 'Ransomware', count: 189, trend: 'stable' },
            { name: 'Supply Chain', count: 87, trend: 'up' },
            { name: 'Zero-day', count: 34, trend: 'down' }
          ],
          geographic_distribution: [
            { country: 'United States', threat_count: 423 },
            { country: 'China', threat_count: 298 },
            { country: 'Russia', threat_count: 187 },
            { country: 'North Korea', threat_count: 156 }
          ]
        }

        setThreatIntel(mockThreatIntel)
        setSecurityNews(mockSecurityNews)
        setThreatMetrics(mockThreatMetrics)
      } catch (error) {
        console.error('Error fetching insights data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/10 text-red-400 border-red-500/20'
      case 'high':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20'
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
      case 'low':
        return 'bg-green-500/10 text-green-400 border-green-500/20'
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4" />
      case 'high':
        return <Zap className="h-4 w-4" />
      case 'medium':
        return <Target className="h-4 w-4" />
      case 'low':
        return <Shield className="h-4 w-4" />
      default:
        return <Eye className="h-4 w-4" />
    }
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <ArrowUp className="h-4 w-4 text-red-400" />
      case 'down':
        return <ArrowDown className="h-4 w-4 text-green-400" />
      default:
        return <Minus className="h-4 w-4 text-gray-400" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return date.toLocaleDateString()
  }

  const filteredThreatIntel = threatIntel.filter(threat => {
    const matchesSearch = !searchQuery || 
      threat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      threat.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesSeverity = severityFilter === 'all' || threat.severity === severityFilter
    const matchesCategory = categoryFilter === 'all' || threat.category.toLowerCase() === categoryFilter.toLowerCase()
    
    return matchesSearch && matchesSeverity && matchesCategory
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-deep-space-blue pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-700 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-700 rounded-lg"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-3 mb-4">
            <TrendingUp className="h-8 w-8 text-cyber-cyan" />
            <h1 className="text-4xl font-bold text-white">Cybersecurity Insights</h1>
          </div>
          <p className="text-xl text-gray-300 mb-6">
            Real-time threat intelligence, security news, and industry analysis
          </p>
          
          {/* Threat Metrics Dashboard */}
          {threatMetrics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-cyber-cyan" />
                    <div>
                      <p className="text-2xl font-bold text-white">{threatMetrics.total_threats.toLocaleString()}</p>
                      <p className="text-sm text-gray-400">Total Threats</p>
                    </div>
                    {getTrendIcon(threatMetrics.threat_trend)}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                    <div>
                      <p className="text-2xl font-bold text-white">{threatMetrics.critical_threats}</p>
                      <p className="text-sm text-gray-400">Critical Threats</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Bug className="h-5 w-5 text-orange-400" />
                    <div>
                      <p className="text-2xl font-bold text-white">{threatMetrics.new_cves}</p>
                      <p className="text-sm text-gray-400">New CVEs</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-yellow-400" />
                    <div>
                      <p className="text-2xl font-bold text-white">{threatMetrics.active_campaigns}</p>
                      <p className="text-sm text-gray-400">Active Campaigns</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </motion.div>

        {/* Content Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-800/50">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="threats">Threat Intel</TabsTrigger>
              <TabsTrigger value="news">Security News</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {/* Latest Threats */}
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-white">Latest Threat Intelligence</CardTitle>
                          <CardDescription className="text-gray-400">
                            Most recent security threats and vulnerabilities
                          </CardDescription>
                        </div>
                        <Button variant="outline" asChild>
                          <Link href="#threats">View All</Link>
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {threatIntel.slice(0, 3).map((threat) => (
                          <div key={threat.id} className="p-4 bg-gray-700/30 rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline" className={getSeverityColor(threat.severity)}>
                                  <div className="flex items-center space-x-1">
                                    {getSeverityIcon(threat.severity)}
                                    <span>{threat.severity.toUpperCase()}</span>
                                  </div>
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {threat.category}
                                </Badge>
                              </div>
                              <span className="text-xs text-gray-400">{formatDate(threat.published_at)}</span>
                            </div>
                            <h4 className="text-white font-medium mb-2 line-clamp-1">{threat.title}</h4>
                            <p className="text-gray-300 text-sm mb-3 line-clamp-2">{threat.description}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-400">Source: {threat.source}</span>
                              <Button size="sm" variant="outline">
                                View Details
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Security News */}
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-white">Security News & Analysis</CardTitle>
                          <CardDescription className="text-gray-400">
                            Latest cybersecurity news and expert analysis
                          </CardDescription>
                        </div>
                        <Button variant="outline" asChild>
                          <Link href="#news">View All</Link>
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {securityNews.slice(0, 3).map((article) => (
                          <div key={article.id} className="p-4 bg-gray-700/30 rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <Badge variant="outline" className="text-xs">
                                {article.category}
                              </Badge>
                              <span className="text-xs text-gray-400">{formatDate(article.published_at)}</span>
                            </div>
                            <h4 className="text-white font-medium mb-2 line-clamp-1">{article.title}</h4>
                            <p className="text-gray-300 text-sm mb-3 line-clamp-2">{article.summary}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 text-xs text-gray-400">
                                <span>by {article.author}</span>
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{article.read_time}m read</span>
                                </div>
                              </div>
                              <Button size="sm" variant="outline">
                                Read More
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Top Attack Vectors */}
                  {threatMetrics && (
                    <Card className="bg-gray-800/50 border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-white">Top Attack Vectors</CardTitle>
                        <CardDescription className="text-gray-400">
                          Most common threat types this week
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {threatMetrics.top_attack_vectors.map((vector, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="text-white font-medium">{vector.name}</span>
                                {getTrendIcon(vector.trend)}
                              </div>
                              <span className="text-cyber-cyan font-medium">{vector.count}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Quick Actions */}
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button className="w-full justify-start" variant="outline">
                        <Bell className="h-4 w-4 mr-2" />
                        Set Threat Alerts
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export Report
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        <Rss className="h-4 w-4 mr-2" />
                        Subscribe to Feed
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Pro Features */}
                  {!isPro && (
                    <Card className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-500/30">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center space-x-2">
                          <Zap className="h-5 w-5 text-yellow-400" />
                          <span>Pro Insights</span>
                        </CardTitle>
                        <CardDescription className="text-gray-300">
                          Advanced threat intelligence for Pro members
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-sm text-gray-300 mb-4">
                          <li className="flex items-center space-x-2">
                            <Star className="h-3 w-3 text-yellow-400" />
                            <span>Real-time threat feeds</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <Star className="h-3 w-3 text-yellow-400" />
                            <span>Custom threat alerts</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <Star className="h-3 w-3 text-yellow-400" />
                            <span>Advanced analytics</span>
                          </li>
                        </ul>
                        <Button asChild className="w-full">
                          <Link href="/pricing">Upgrade to Pro</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Threat Intelligence Tab */}
            <TabsContent value="threats" className="mt-6" id="threats">
              <div className="mb-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search threat intelligence..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  
                  <div className="flex gap-4">
                    <Select value={severityFilter} onValueChange={setSeverityFilter}>
                      <SelectTrigger className="w-48 bg-gray-800 border-gray-700">
                        <SelectValue placeholder="All Severities" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Severities</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-48 bg-gray-800 border-gray-700">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="vulnerability">Vulnerability</SelectItem>
                        <SelectItem value="malware">Malware</SelectItem>
                        <SelectItem value="supply chain">Supply Chain</SelectItem>
                        <SelectItem value="phishing">Phishing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {filteredThreatIntel.map((threat, index) => (
                  <motion.div
                    key={threat.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-gray-800/50 border-gray-700 hover:border-cyber-cyan/50 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className={getSeverityColor(threat.severity)}>
                              <div className="flex items-center space-x-1">
                                {getSeverityIcon(threat.severity)}
                                <span>{threat.severity.toUpperCase()}</span>
                              </div>
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {threat.category}
                            </Badge>
                            {threat.cve_id && (
                              <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/20">
                                {threat.cve_id}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-400">{formatDate(threat.published_at)}</span>
                            <Button size="sm" variant="ghost">
                              <Bookmark className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Share className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <h3 className="text-white font-semibold text-lg mb-3">{threat.title}</h3>
                        <p className="text-gray-300 mb-4">{threat.description}</p>

                        {threat.affected_systems.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-white font-medium mb-2">Affected Systems:</h4>
                            <div className="flex flex-wrap gap-2">
                              {threat.affected_systems.map((system, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {system}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {threat.mitigation_steps.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-white font-medium mb-2">Mitigation Steps:</h4>
                            <ul className="space-y-1">
                              {threat.mitigation_steps.map((step, i) => (
                                <li key={i} className="text-gray-300 text-sm flex items-start space-x-2">
                                  <Shield className="h-3 w-3 text-green-400 mt-0.5 flex-shrink-0" />
                                  <span>{step}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">Source: {threat.source}</span>
                          <div className="flex space-x-2">
                            {threat.references.map((ref, i) => (
                              <Button key={i} size="sm" variant="outline" asChild>
                                <a href={ref} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  Reference
                                </a>
                              </Button>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Security News Tab */}
            <TabsContent value="news" className="mt-6" id="news">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {securityNews.map((article, index) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-gray-800/50 border-gray-700 hover:border-cyber-cyan/50 transition-colors h-full">
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <Badge variant="outline" className="text-xs">
                            {article.category}
                          </Badge>
                          <span className="text-xs text-gray-400">{formatDate(article.published_at)}</span>
                        </div>
                        <CardTitle className="text-white line-clamp-2">{article.title}</CardTitle>
                        <CardDescription className="text-gray-300 line-clamp-3">
                          {article.summary}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col">
                        <div className="flex flex-wrap gap-1 mb-4">
                          {article.tags.slice(0, 3).map((tag, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="mt-auto">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-gray-400">by {article.author}</span>
                            <div className="flex items-center space-x-1 text-xs text-gray-400">
                              <Clock className="h-3 w-3" />
                              <span>{article.read_time}m read</span>
                            </div>
                          </div>
                          
                          <Button asChild className="w-full">
                            <a href={article.source_url} target="_blank" rel="noopener noreferrer">
                              Read Full Article
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Attack Vector Trends */}
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Attack Vector Trends</CardTitle>
                    <CardDescription className="text-gray-400">
                      Weekly comparison of threat types
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <BarChart3 className="h-12 w-12 mx-auto mb-3" />
                        <p>Interactive chart would be displayed here</p>
                        <p className="text-sm">Showing attack vector distribution</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Geographic Distribution */}
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Geographic Distribution</CardTitle>
                    <CardDescription className="text-gray-400">
                      Threat origins by country
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {threatMetrics?.geographic_distribution.map((country, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Globe className="h-4 w-4 text-cyber-cyan" />
                            <span className="text-white">{country.country}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-cyber-cyan h-2 rounded-full" 
                                style={{ width: `${(country.threat_count / 500) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-cyber-cyan font-medium w-12 text-right">
                              {country.threat_count}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Severity Distribution */}
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Severity Distribution</CardTitle>
                    <CardDescription className="text-gray-400">
                      Breakdown of threat severity levels
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <PieChart className="h-12 w-12 mx-auto mb-3" />
                        <p>Pie chart would be displayed here</p>
                        <p className="text-sm">Showing severity distribution</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Threat Timeline */}
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Threat Timeline</CardTitle>
                    <CardDescription className="text-gray-400">
                      Threat volume over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <LineChart className="h-12 w-12 mx-auto mb-3" />
                        <p>Time series chart would be displayed here</p>
                        <p className="text-sm">Showing threat trends over time</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}