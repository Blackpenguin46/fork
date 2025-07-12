'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, MessageSquare, ExternalLink, Star, Crown, Clock } from 'lucide-react'
import Link from 'next/link'

export default function DiscordPage() {
  const discordServers = [
    {
      id: '1',
      name: 'CyberSec Hub',
      description: 'The largest cybersecurity Discord community with 25,000+ active members. Daily discussions on threats, career advice, and networking.',
      members: 25000,
      isActive: true,
      isPremium: false,
      isFeatured: true,
      categories: ['General Discussion', 'Career Advice', 'Threat Analysis', 'Tools & Resources'],
      inviteCode: 'cybersechub',
      rating: 4.8,
      lastActive: '2 minutes ago'
    },
    {
      id: '2',
      name: 'InfoSec Professionals',
      description: 'Premium Discord server for certified cybersecurity professionals. Exclusive job postings and advanced technical discussions.',
      members: 8500,
      isActive: true,
      isPremium: true,
      isFeatured: true,
      categories: ['CISSP Study Group', 'Incident Response', 'Penetration Testing', 'Compliance'],
      inviteCode: 'infosecpros',
      rating: 4.9,
      lastActive: '5 minutes ago'
    },
    {
      id: '3',
      name: 'Ethical Hackers Unite',
      description: 'Community for ethical hackers and penetration testers. Share exploits, discuss bug bounties, and collaborate on security research.',
      members: 15000,
      isActive: true,
      isPremium: false,
      isFeatured: true,
      categories: ['Bug Bounty', 'CTF Challenges', 'Exploit Development', 'Tool Development'],
      inviteCode: 'ethicalhackers',
      rating: 4.7,
      lastActive: '1 minute ago'
    },
    {
      id: '4',
      name: 'Cloud Security Central',
      description: 'Focused on cloud security across AWS, Azure, and GCP. Expert discussions on container security, serverless, and DevSecOps.',
      members: 6200,
      isActive: true,
      isPremium: true,
      isFeatured: false,
      categories: ['AWS Security', 'Azure Security', 'GCP Security', 'DevSecOps', 'Container Security'],
      inviteCode: 'cloudseccentral',
      rating: 4.6,
      lastActive: '15 minutes ago'
    },
    {
      id: '5',
      name: 'DFIR Specialists',
      description: 'Digital forensics and incident response community. Case studies, tool discussions, and certification support.',
      members: 4800,
      isActive: true,
      isPremium: true,
      isFeatured: false,
      categories: ['Digital Forensics', 'Incident Response', 'Malware Analysis', 'Memory Forensics'],
      inviteCode: 'dfirspecialists',
      rating: 4.8,
      lastActive: '8 minutes ago'
    },
    {
      id: '6',
      name: 'CyberSec Students',
      description: 'Community for cybersecurity students and newcomers. Study groups, mentorship, and career guidance.',
      members: 12000,
      isActive: true,
      isPremium: false,
      isFeatured: false,
      categories: ['Study Groups', 'Mentorship', 'Career Guidance', 'Project Collaboration'],
      inviteCode: 'cybersecstudents',
      rating: 4.5,
      lastActive: '3 minutes ago'
    }
  ]

  const formatMembers = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`
    }
    return count.toString()
  }

  const featuredServers = discordServers.filter(server => server.isFeatured)
  const regularServers = discordServers.filter(server => !server.isFeatured)

  return (
    <div className="min-h-screen bg-deep-space-blue pt-16">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <MessageSquare className="h-8 w-8 text-cyber-cyan" />
            <h1 className="text-4xl font-bold text-white">Discord Communities</h1>
          </div>
          <p className="text-xl text-gray-300 mb-6">
            Join active Discord servers where cybersecurity professionals share knowledge, collaborate, and network
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">{discordServers.length}</p>
                    <p className="text-sm text-gray-400">Active Servers</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-green-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">71k+</p>
                    <p className="text-sm text-gray-400">Total Members</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Crown className="h-5 w-5 text-yellow-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">3</p>
                    <p className="text-sm text-gray-400">Premium Servers</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-purple-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">24/7</p>
                    <p className="text-sm text-gray-400">Active Support</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Featured Servers */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Featured Communities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredServers.map((server) => (
              <Card key={server.id} className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-cyber-cyan/30 hover:border-cyber-cyan/60 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-cyber-cyan border-cyber-cyan/30">
                        Featured
                      </Badge>
                      {server.isPremium && (
                        <Crown className="h-4 w-4 text-yellow-400" />
                      )}
                    </div>
                    <div className="flex items-center space-x-1 text-yellow-400">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm">{server.rating}</span>
                    </div>
                  </div>
                  
                  <CardTitle className="text-white">{server.name}</CardTitle>
                  <CardDescription className="text-gray-300">
                    {server.description}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{formatMembers(server.members)} members</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>{server.lastActive}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs text-gray-500">Popular Channels:</p>
                      <div className="flex flex-wrap gap-1">
                        {server.categories.slice(0, 3).map((category) => (
                          <Badge key={category} variant="secondary" className="text-xs">
                            {category}
                          </Badge>
                        ))}
                        {server.categories.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{server.categories.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <Button asChild className="w-full">
                      <a 
                        href={`https://discord.gg/${server.inviteCode}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        Join Server
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>

                    {server.isPremium && (
                      <p className="text-xs text-yellow-400 text-center">
                        Premium server - verification required
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* All Servers */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">All Discord Communities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {regularServers.map((server) => (
              <Card key={server.id} className="bg-gray-800/50 border-gray-700 hover:border-cyber-cyan/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      {server.isPremium && (
                        <Crown className="h-4 w-4 text-yellow-400" />
                      )}
                    </div>
                    <div className="flex items-center space-x-1 text-yellow-400">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm">{server.rating}</span>
                    </div>
                  </div>
                  
                  <CardTitle className="text-white">{server.name}</CardTitle>
                  <CardDescription className="text-gray-400">
                    {server.description}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{formatMembers(server.members)} members</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>{server.lastActive}</span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button asChild className="flex-1">
                        <a 
                          href={`https://discord.gg/${server.inviteCode}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          Join Server
                        </a>
                      </Button>
                    </div>

                    {server.isPremium && (
                      <p className="text-xs text-yellow-400 text-center">
                        Premium server - verification required
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Guidelines */}
        <div className="mt-12">
          <Card className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-blue-500/30">
            <CardHeader>
              <CardTitle className="text-white">Discord Community Guidelines</CardTitle>
              <CardDescription className="text-gray-300">
                Important tips for joining and participating in cybersecurity Discord communities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-white font-semibold mb-2">Do&apos;s</h4>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>• Read and follow server rules</li>
                    <li>• Introduce yourself in welcome channels</li>
                    <li>• Share knowledge and help others</li>
                    <li>• Use appropriate channels for discussions</li>
                    <li>• Respect other members and moderators</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-2">Don&apos;ts</h4>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>• Share malicious code or exploits</li>
                    <li>• Spam or self-promote excessively</li>
                    <li>• Discuss illegal activities</li>
                    <li>• Share personal or sensitive information</li>
                    <li>• Harass or discriminate against others</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}