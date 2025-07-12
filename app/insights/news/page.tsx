'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TrendingUp, Clock, ExternalLink, Calendar } from 'lucide-react'
import Link from 'next/link'

export default function NewsPage() {
  const newsArticles = [
    {
      id: '1',
      title: 'Major Zero-Day Vulnerability Discovered in Popular VPN Software',
      excerpt: 'Security researchers have identified a critical zero-day vulnerability affecting millions of VPN users worldwide. Immediate patching recommended.',
      source: 'CyberSecDaily',
      publishedAt: '2024-07-11T10:30:00Z',
      category: 'Vulnerabilities',
      severity: 'Critical',
      readTime: 5,
      url: 'https://example.com/zero-day-vpn-vulnerability'
    },
    {
      id: '2',
      title: 'Ransomware Group Targets Healthcare Sector with New Encryption Method',
      excerpt: 'A sophisticated ransomware campaign is targeting hospitals and healthcare facilities using advanced encryption techniques.',
      source: 'ThreatWatch',
      publishedAt: '2024-07-11T08:15:00Z',
      category: 'Ransomware',
      severity: 'High',
      readTime: 7,
      url: 'https://example.com/ransomware-healthcare-attack'
    },
    {
      id: '3',
      title: 'AI-Powered Phishing Attacks Surge 300% in Q2 2024',
      excerpt: 'Cybercriminals are increasingly leveraging artificial intelligence to create more convincing phishing campaigns.',
      source: 'InfoSec Today',
      publishedAt: '2024-07-11T06:45:00Z',
      category: 'Phishing',
      severity: 'Medium',
      readTime: 4,
      url: 'https://example.com/ai-phishing-surge'
    },
    {
      id: '4',
      title: 'New NIST Cybersecurity Framework 2.0 Released',
      excerpt: 'NIST has released the updated Cybersecurity Framework 2.0 with enhanced guidelines for modern threat landscapes.',
      source: 'Compliance Weekly',
      publishedAt: '2024-07-10T16:20:00Z',
      category: 'Compliance',
      severity: 'Info',
      readTime: 6,
      url: 'https://example.com/nist-framework-2-0'
    },
    {
      id: '5',
      title: 'Supply Chain Attack Compromises Popular JavaScript Library',
      excerpt: 'A widely-used JavaScript library has been compromised, potentially affecting thousands of web applications.',
      source: 'DevSecOps News',
      publishedAt: '2024-07-10T14:30:00Z',
      category: 'Supply Chain',
      severity: 'High',
      readTime: 8,
      url: 'https://example.com/supply-chain-js-library'
    },
    {
      id: '6',
      title: 'Quantum Computing Threat to Current Encryption Methods',
      excerpt: 'Experts discuss the timeline and implications of quantum computing on current cryptographic standards.',
      source: 'Quantum Security Today',
      publishedAt: '2024-07-10T12:00:00Z',
      category: 'Cryptography',
      severity: 'Medium',
      readTime: 10,
      url: 'https://example.com/quantum-encryption-threat'
    }
  ]

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-500/10 text-red-400 border-red-500/20'
      case 'High':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20'
      case 'Medium':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
      case 'Info':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-deep-space-blue pt-16">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <TrendingUp className="h-8 w-8 text-cyber-cyan" />
            <h1 className="text-4xl font-bold text-white">Latest Cybersecurity News</h1>
          </div>
          <p className="text-xl text-gray-300 mb-6">
            Stay informed with the latest cybersecurity threats, vulnerabilities, and industry developments
          </p>
        </div>

        {/* News Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Article */}
          <div className="lg:col-span-2">
            <Card className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-cyber-cyan/30 hover:border-cyber-cyan/60 transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Badge variant="outline" className={getSeverityColor(newsArticles[0].severity)}>
                    {newsArticles[0].severity}
                  </Badge>
                  <Badge variant="outline" className="text-cyber-cyan border-cyber-cyan/30">
                    {newsArticles[0].category}
                  </Badge>
                </div>
                
                <CardTitle className="text-white text-2xl">{newsArticles[0].title}</CardTitle>
                <CardDescription className="text-gray-300 text-lg">
                  {newsArticles[0].excerpt}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(newsArticles[0].publishedAt)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{newsArticles[0].readTime} min read</span>
                    </div>
                    <span>{newsArticles[0].source}</span>
                  </div>
                </div>

                <Button asChild className="w-full">
                  <a href={newsArticles[0].url} target="_blank" rel="noopener noreferrer">
                    Read Full Article
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Side Articles */}
          <div className="space-y-6">
            {newsArticles.slice(1, 4).map((article) => (
              <Card key={article.id} className="bg-gray-800/50 border-gray-700 hover:border-cyber-cyan/50 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="outline" className={getSeverityColor(article.severity)}>
                      {article.severity}
                    </Badge>
                  </div>
                  
                  <CardTitle className="text-white text-lg line-clamp-2">
                    {article.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="pt-0">
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                    {article.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span>{formatDate(article.publishedAt)}</span>
                    <span>{article.readTime} min</span>
                  </div>

                  <Button asChild size="sm" variant="outline" className="w-full">
                    <a href={article.url} target="_blank" rel="noopener noreferrer">
                      Read More
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Additional Articles */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-6">More News</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {newsArticles.slice(4).map((article) => (
              <Card key={article.id} className="bg-gray-800/50 border-gray-700 hover:border-cyber-cyan/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <Badge variant="outline" className={getSeverityColor(article.severity)}>
                      {article.severity}
                    </Badge>
                    <Badge variant="outline" className="text-gray-400 border-gray-600">
                      {article.category}
                    </Badge>
                  </div>
                  
                  <CardTitle className="text-white line-clamp-2">
                    {article.title}
                  </CardTitle>
                  
                  <CardDescription className="text-gray-400 line-clamp-3">
                    {article.excerpt}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(article.publishedAt)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{article.readTime}m</span>
                      </div>
                    </div>
                  </div>

                  <Button asChild className="w-full" size="sm">
                    <a href={article.url} target="_blank" rel="noopener noreferrer">
                      Read Article
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12">
          <Card className="bg-gradient-to-r from-cyan-900/50 to-blue-900/50 border-cyan-500/30">
            <CardHeader>
              <CardTitle className="text-white text-center">Stay Updated</CardTitle>
              <CardDescription className="text-gray-300 text-center">
                Get the latest cybersecurity news delivered to your inbox
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild>
                <Link href="/pricing">
                  Subscribe for Premium News Alerts
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}