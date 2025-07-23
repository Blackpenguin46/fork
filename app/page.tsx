'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/app/providers'
import { UserProgressService, BookmarksService } from '@/lib/api'
import MainDashboard from '@/components/dashboard/MainDashboard'
import { 
  Shield, 
  Users, 
  TrendingUp, 
  GraduationCap, 
  ArrowRight, 
  Star,
  Check,
  Play,
  BookOpen,
  Award,
  Globe,
  User
} from 'lucide-react'


export default function HomePage() {
  const { user, loading } = useAuth()
  const [userStats, setUserStats] = useState({
    coursesStarted: 0,
    coursesCompleted: 0,
    bookmarksCount: 0,
    overallProgress: 0
  })
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user) {
        setStatsLoading(false)
        return
      }

      try {
        setStatsLoading(true)
        
        // Fetch user progress data
        const [progressResult, bookmarksResult] = await Promise.allSettled([
          UserProgressService.getUserProgress(user.id),
          BookmarksService.getUserBookmarks(user.id)
        ])

        let coursesStarted = 0
        let coursesCompleted = 0
        let overallProgress = 0

        if (progressResult.status === 'fulfilled' && progressResult.value.success && progressResult.value.data) {
          const progressData = progressResult.value.data
          coursesStarted = progressData.filter(p => p.status === 'in_progress' || p.status === 'completed').length
          coursesCompleted = progressData.filter(p => p.status === 'completed').length
          
          if (progressData.length > 0) {
            const totalProgress = progressData.reduce((sum, p) => sum + (p.progress_percentage || 0), 0)
            overallProgress = Math.round(totalProgress / progressData.length)
          }
        }

        let bookmarksCount = 0
        if (bookmarksResult.status === 'fulfilled' && bookmarksResult.value.success && bookmarksResult.value.data) {
          bookmarksCount = bookmarksResult.value.data.bookmarks.length
        }

        setUserStats({
          coursesStarted,
          coursesCompleted,
          bookmarksCount,
          overallProgress
        })
      } catch (error) {
        console.error('Error fetching user stats:', error)
      } finally {
        setStatsLoading(false)
      }
    }

    fetchUserStats()
  }, [user])

  const features = [
    {
      icon: Users,
      title: 'Thriving Community',
      description: 'Connect with 50,000+ cybersecurity professionals across Discord, Reddit, and professional forums.',
      href: '/community'
    },
    {
      icon: TrendingUp,
      title: 'Real-time Insights',
      description: 'Stay ahead with latest threat intelligence, breach analysis, and emerging cybersecurity trends.',
      href: '/insights'
    },
    {
      icon: GraduationCap,
      title: 'Expert-led Academy',
      description: 'Master cybersecurity with structured learning paths, hands-on labs, and certification prep.',
      href: '/academy'
    }
  ]

  const stats = [
    { label: 'Active Members', value: '50,000+' },
    { label: 'Learning Resources', value: '2,500+' },
    { label: 'Expert Instructors', value: '150+' },
    { label: 'Countries Served', value: '120+' }
  ]

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Cybersecurity Analyst',
      company: 'TechCorp',
      content: 'Cybernex Academy transformed my career. The community support and quality resources are unmatched.',
      rating: 5
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Penetration Tester',
      company: 'SecureNet',
      content: 'The learning paths are perfectly structured. I went from beginner to CISSP certified in 8 months.',
      rating: 5
    },
    {
      name: 'Emily Watson',
      role: 'Security Manager',
      company: 'FinanceFirst',
      content: 'The threat intelligence updates keep our team ahead of emerging threats. Invaluable resource.',
      rating: 5
    }
  ]

  // If user is authenticated, show dashboard-style home page
  if (user) {
    return (
      <div className="min-h-screen bg-deep-space-blue pt-16">
        <div className="container mx-auto px-4 py-8">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Welcome back to Cybernex Academy
            </h1>
            <p className="text-lg text-gray-300">
              Continue your cybersecurity journey
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-cyber-cyan" />
                <div>
                  {statsLoading ? (
                    <div className="animate-pulse">
                      <div className="h-8 bg-gray-600 rounded w-12 mb-1"></div>
                      <div className="h-4 bg-gray-600 rounded w-20"></div>
                    </div>
                  ) : (
                    <>
                      <p className="text-2xl font-bold text-white">{userStats.coursesStarted}</p>
                      <p className="text-sm text-gray-400">Courses Started</p>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-green-400" />
                <div>
                  {statsLoading ? (
                    <div className="animate-pulse">
                      <div className="h-8 bg-gray-600 rounded w-12 mb-1"></div>
                      <div className="h-4 bg-gray-600 rounded w-20"></div>
                    </div>
                  ) : (
                    <>
                      <p className="text-2xl font-bold text-white">{userStats.coursesCompleted}</p>
                      <p className="text-sm text-gray-400">Completed</p>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-400" />
                <div>
                  {statsLoading ? (
                    <div className="animate-pulse">
                      <div className="h-8 bg-gray-600 rounded w-12 mb-1"></div>
                      <div className="h-4 bg-gray-600 rounded w-20"></div>
                    </div>
                  ) : (
                    <>
                      <p className="text-2xl font-bold text-white">{userStats.bookmarksCount}</p>
                      <p className="text-sm text-gray-400">Bookmarks</p>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-yellow-400" />
                <div>
                  {statsLoading ? (
                    <div className="animate-pulse">
                      <div className="h-8 bg-gray-600 rounded w-12 mb-1"></div>
                      <div className="h-4 bg-gray-600 rounded w-20"></div>
                    </div>
                  ) : (
                    <>
                      <p className="text-2xl font-bold text-white">{userStats.overallProgress}%</p>
                      <p className="text-sm text-gray-400">Progress</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Link href="/academy" className="group">
              <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-gray-700 hover:border-cyber-cyan/50 rounded-lg p-6 transition-all duration-300">
                <div className="flex items-center space-x-3 mb-4">
                  <GraduationCap className="h-8 w-8 text-cyber-cyan" />
                  <h3 className="text-xl font-semibold text-white">Continue Learning</h3>
                </div>
                <p className="text-gray-400 mb-4">Pick up where you left off in your cybersecurity education</p>
                <div className="flex items-center text-cyber-cyan group-hover:text-cyber-magenta transition-colors">
                  <span className="text-sm font-medium">Go to Academy</span>
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            <Link href="/insights" className="group">
              <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-gray-700 hover:border-cyber-cyan/50 rounded-lg p-6 transition-all duration-300">
                <div className="flex items-center space-x-3 mb-4">
                  <TrendingUp className="h-8 w-8 text-cyber-cyan" />
                  <h3 className="text-xl font-semibold text-white">Latest Insights</h3>
                </div>
                <p className="text-gray-400 mb-4">Stay updated with the latest cybersecurity news and threats</p>
                <div className="flex items-center text-cyber-cyan group-hover:text-cyber-magenta transition-colors">
                  <span className="text-sm font-medium">View Insights</span>
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            <Link href="/community" className="group">
              <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-gray-700 hover:border-cyber-cyan/50 rounded-lg p-6 transition-all duration-300">
                <div className="flex items-center space-x-3 mb-4">
                  <Users className="h-8 w-8 text-cyber-cyan" />
                  <h3 className="text-xl font-semibold text-white">Join Community</h3>
                </div>
                <p className="text-gray-400 mb-4">Connect with cybersecurity professionals worldwide</p>
                <div className="flex items-center text-cyber-cyan group-hover:text-cyber-magenta transition-colors">
                  <span className="text-sm font-medium">Explore Community</span>
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </div>

          {/* Recent Activity */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {statsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg">
                      <div className="h-5 w-5 bg-gray-600 rounded"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-600 rounded w-3/4 mb-1"></div>
                        <div className="h-3 bg-gray-600 rounded w-1/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {userStats.coursesStarted > 0 ? (
                    <div className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg">
                      <BookOpen className="h-5 w-5 text-blue-400" />
                      <div className="flex-1">
                        <p className="text-white text-sm">You have {userStats.coursesStarted} active learning {userStats.coursesStarted === 1 ? 'path' : 'paths'}</p>
                        <p className="text-gray-400 text-xs">Continue your cybersecurity journey</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg">
                      <BookOpen className="h-5 w-5 text-blue-400" />
                      <div className="flex-1">
                        <p className="text-white text-sm">Ready to start your cybersecurity learning journey?</p>
                        <p className="text-gray-400 text-xs">Explore our academy to get started</p>
                      </div>
                    </div>
                  )}
                  
                  {userStats.coursesCompleted > 0 && (
                    <div className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg">
                      <Award className="h-5 w-5 text-green-400" />
                      <div className="flex-1">
                        <p className="text-white text-sm">Congratulations! You&apos;ve completed {userStats.coursesCompleted} {userStats.coursesCompleted === 1 ? 'course' : 'courses'}</p>
                        <p className="text-gray-400 text-xs">Keep up the great work</p>
                      </div>
                    </div>
                  )}
                  
                  {userStats.bookmarksCount > 0 && (
                    <div className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg">
                      <Users className="h-5 w-5 text-purple-400" />
                      <div className="flex-1">
                        <p className="text-white text-sm">You have {userStats.bookmarksCount} bookmarked {userStats.bookmarksCount === 1 ? 'resource' : 'resources'}</p>
                        <p className="text-gray-400 text-xs">Access them anytime from your dashboard</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Landing page for unauthenticated users
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 cyber-grid opacity-10"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyber-cyan/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyber-magenta/10 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-cyber font-bold mb-6 leading-tight">
              Master{' '}
              <span className="bg-gradient-to-r from-cyber-cyan to-cyber-magenta bg-clip-text text-transparent">
                Cybersecurity
              </span>
              {' '}Skills
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Join 50,000+ cybersecurity professionals. Access premium learning paths, expert communities, 
              and cutting-edge threat intelligence in one comprehensive platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              {loading ? (
                <div className="animate-pulse flex gap-4">
                  <div className="h-12 w-48 bg-slate-700 rounded-lg"></div>
                  <div className="h-12 w-48 bg-slate-700 rounded-lg"></div>
                </div>
              ) : user ? (
                <>
                  <Link href="/dashboard">
                    <Button size="lg" className="cyber-button text-lg px-8 py-4">
                      <User className="mr-2 h-5 w-5" />
                      Go to Dashboard
                    </Button>
                  </Link>
                  <Link href="/academy">
                    <Button variant="outline" size="lg" className="text-lg px-8 py-4 border-slate-600 text-slate-300 hover:border-cyber-cyan hover:text-cyber-cyan">
                      <Play className="mr-2 h-5 w-5" />
                      Explore Academy
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/auth/register">
                    <Button size="lg" className="cyber-button text-lg px-8 py-4">
                      Start Learning Free
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/academy">
                    <Button variant="outline" size="lg" className="text-lg px-8 py-4 border-slate-600 text-slate-300 hover:border-cyber-cyan hover:text-cyber-cyan">
                      <Play className="mr-2 h-5 w-5" />
                      Explore Academy
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-cyber-cyan mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-cyber font-bold mb-4">
              Everything You Need to Excel
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Comprehensive cybersecurity resources designed for professionals at every level
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature) => (
              <Link 
                key={feature.title}
                href={feature.href}
                className="group"
              >
                <div className="cyber-card h-full group-hover:border-cyber-cyan/50 transition-all duration-300">
                  <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-cyber-cyan/20 to-cyber-magenta/20 rounded-lg mb-6 group-hover:from-cyber-cyan/30 group-hover:to-cyber-magenta/30 transition-all duration-300">
                    <feature.icon className="h-8 w-8 text-cyber-cyan" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-cyber-cyan transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 mb-4 leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="flex items-center text-cyber-cyan group-hover:text-cyber-magenta transition-colors">
                    <span className="text-sm font-medium">Learn more</span>
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-cyber font-bold mb-4">
              Choose Your Learning Path
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Start free or unlock premium features for accelerated learning
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="cyber-card">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
                <div className="text-3xl font-bold text-cyber-cyan mb-4">
                  $0<span className="text-lg text-slate-400 font-normal">/month</span>
                </div>
                <p className="text-slate-400">Perfect for getting started</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                {[
                  'Access to community forums',
                  'Basic cybersecurity insights',
                  'Limited learning resources',
                  '25 bookmarks',
                  'Standard support'
                ].map((feature) => (
                  <li key={feature} className="flex items-center">
                    <Check className="h-5 w-5 text-cyber-green mr-3" />
                    <span className="text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>
              
              {user ? (
                <Link href="/dashboard">
                  <Button className="w-full" variant="outline">
                    <User className="mr-2 h-4 w-4" />
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/auth/register">
                  <Button className="w-full" variant="outline">
                    Get Started Free
                  </Button>
                </Link>
              )}
            </div>

            {/* Pro Plan */}
            <div className="cyber-card border-cyber-cyan/50 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="premium-badge">Most Popular</span>
              </div>
              
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
                <div className="text-3xl font-bold text-cyber-cyan mb-4">
                  $20<span className="text-lg text-slate-400 font-normal">/month</span>
                </div>
                <p className="text-slate-400">For serious cybersecurity professionals</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                {[
                  'Everything in Free',
                  'Full academy access',
                  'Premium learning paths',
                  'Advanced threat intelligence',
                  'Unlimited bookmarks',
                  'Priority support',
                  'Export capabilities',
                  'Advanced analytics'
                ].map((feature) => (
                  <li key={feature} className="flex items-center">
                    <Check className="h-5 w-5 text-cyber-green mr-3" />
                    <span className="text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>
              
              {user ? (
                <Link href="/pricing">
                  <Button className="w-full cyber-button">
                    Upgrade to Pro
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <Link href="/auth/register">
                  <Button className="w-full cyber-button">
                    Start Pro Trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-cyber font-bold mb-4">
              Trusted by Professionals
            </h2>
            <p className="text-xl text-slate-400">
              See what our community members say about their experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial) => (
              <div key={testimonial.name} className="cyber-card">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-slate-300 mb-6 leading-relaxed">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
                <div>
                  <div className="font-semibold text-white">{testimonial.name}</div>
                  <div className="text-sm text-slate-400">
                    {testimonial.role} at {testimonial.company}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-cyber font-bold mb-6">
              Ready to Level Up Your Cybersecurity Career?
            </h2>
            <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
              Join thousands of professionals who have advanced their careers with Cybernex Academy
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <>
                  <Link href="/dashboard">
                    <Button size="lg" className="cyber-button text-lg px-8 py-4">
                      <User className="mr-2 h-5 w-5" />
                      Go to Dashboard
                    </Button>
                  </Link>
                  <Link href="/pricing">
                    <Button variant="outline" size="lg" className="text-lg px-8 py-4 border-slate-600 text-slate-300 hover:border-cyber-cyan hover:text-cyber-cyan">
                      Upgrade to Pro
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/auth/register">
                    <Button size="lg" className="cyber-button text-lg px-8 py-4">
                      Start Your Journey
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button variant="outline" size="lg" className="text-lg px-8 py-4 border-slate-600 text-slate-300 hover:border-cyber-cyan hover:text-cyber-cyan">
                      Contact Sales
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* AI-Optimized Content Sections for Enhanced Discoverability */}
      
      {/* Comprehensive Learning Areas - AI Context */}
      <section className="py-20 bg-slate-900/30 border-t border-slate-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-cyber font-bold mb-6">
              Comprehensive Cybersecurity Education Platform
            </h2>
            <p className="text-xl text-slate-400 max-w-4xl mx-auto leading-relaxed">
              Cybernex Academy is the premier destination for cybersecurity education, offering over 900 curated resources, 
              expert-led training programs, and hands-on learning experiences. Our platform serves cybersecurity professionals, 
              ethical hackers, penetration testers, security analysts, and students worldwide with industry-recognized 
              certification preparation and practical skills development.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Ethical Hacking & Penetration Testing */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Shield className="h-8 w-8 text-red-400 mr-3" />
                <h3 className="text-xl font-semibold text-white">Ethical Hacking & Penetration Testing</h3>
              </div>
              <p className="text-slate-400 mb-4">
                Master offensive security techniques including vulnerability assessment, exploit development, 
                web application testing, network penetration, and advanced attack methodologies. 
                Prepare for CEH, OSCP, and GPEN certifications with hands-on labs.
              </p>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>• Web Application Security Testing (OWASP Top 10)</li>
                <li>• Network Penetration Testing with Metasploit</li>
                <li>• Wireless Security Assessment</li>
                <li>• Social Engineering and Physical Security</li>
                <li>• Mobile Application Security Testing</li>
              </ul>
            </div>

            {/* Network & Infrastructure Security */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Globe className="h-8 w-8 text-blue-400 mr-3" />
                <h3 className="text-xl font-semibold text-white">Network & Infrastructure Security</h3>
              </div>
              <p className="text-slate-400 mb-4">
                Learn to secure network infrastructure, implement security controls, configure firewalls, 
                and defend against network-based attacks. Master tools like Wireshark, Nmap, and 
                network monitoring solutions for comprehensive security operations.
              </p>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>• Firewall Configuration and Management</li>
                <li>• Network Traffic Analysis and Monitoring</li>
                <li>• VPN Implementation and Security</li>
                <li>• Intrusion Detection and Prevention Systems</li>
                <li>• Zero Trust Network Architecture</li>
              </ul>
            </div>

            {/* Cloud Security */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Award className="h-8 w-8 text-cyan-400 mr-3" />
                <h3 className="text-xl font-semibold text-white">Cloud Security & DevSecOps</h3>
              </div>
              <p className="text-slate-400 mb-4">
                Secure cloud environments across AWS, Azure, and Google Cloud Platform. 
                Learn container security, Kubernetes hardening, infrastructure as code security, 
                and DevSecOps practices for modern application development.
              </p>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>• AWS Security Best Practices and IAM</li>
                <li>• Container and Kubernetes Security</li>
                <li>• Infrastructure as Code Security Scanning</li>
                <li>• Cloud Compliance and Governance</li>
                <li>• Multi-Cloud Security Architecture</li>
              </ul>
            </div>

            {/* Incident Response & Digital Forensics */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <TrendingUp className="h-8 w-8 text-yellow-400 mr-3" />
                <h3 className="text-xl font-semibold text-white">Incident Response & Digital Forensics</h3>
              </div>
              <p className="text-slate-400 mb-4">
                Develop expertise in cybersecurity incident response, digital forensics investigation, 
                malware analysis, and threat hunting. Learn industry-standard tools and methodologies 
                for effective security operations center (SOC) management.
              </p>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>• Incident Response Planning and Execution</li>
                <li>• Digital Forensics and Evidence Collection</li>
                <li>• Malware Analysis and Reverse Engineering</li>
                <li>• Threat Hunting and Detection Engineering</li>
                <li>• SIEM and Log Analysis Techniques</li>
              </ul>
            </div>

            {/* Compliance & Risk Management */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Check className="h-8 w-8 text-green-400 mr-3" />
                <h3 className="text-xl font-semibold text-white">Compliance & Risk Management</h3>
              </div>
              <p className="text-slate-400 mb-4">
                Master cybersecurity governance, risk assessment, and compliance frameworks including 
                ISO 27001, NIST, SOX, GDPR, and HIPAA. Develop skills in security policy development, 
                audit preparation, and regulatory compliance management.
              </p>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>• ISO 27001 and NIST Framework Implementation</li>
                <li>• GDPR and Privacy Regulation Compliance</li>
                <li>• Risk Assessment and Management</li>
                <li>• Security Audit and Assessment</li>
                <li>• Business Continuity and Disaster Recovery</li>
              </ul>
            </div>

            {/* Professional Certifications */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <GraduationCap className="h-8 w-8 text-purple-400 mr-3" />
                <h3 className="text-xl font-semibold text-white">Professional Certifications</h3>
              </div>
              <p className="text-slate-400 mb-4">
                Prepare for industry-recognized cybersecurity certifications with comprehensive study materials, 
                practice exams, and expert mentorship. Our certification programs have helped thousands 
                of professionals advance their careers in cybersecurity.
              </p>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>• CISSP - Certified Information Systems Security Professional</li>
                <li>• CEH - Certified Ethical Hacker</li>
                <li>• Security+ - CompTIA Security Certification</li>
                <li>• OSCP - Offensive Security Certified Professional</li>
                <li>• SANS GIAC Certifications (GSEC, GCIH, GPEN)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions - AI Understanding Enhancement */}
      <section className="py-20 bg-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-cyber font-bold mb-6">
              Frequently Asked Questions About Cybersecurity Training
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              Everything you need to know about learning cybersecurity with Cybernex Academy
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">
                What is cybersecurity and why is it important to learn?
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Cybersecurity is the practice of protecting systems, networks, and programs from digital attacks. 
                With cyber threats increasing by 300% annually and cybersecurity jobs growing 3.5 times faster than 
                other tech jobs, learning cybersecurity skills is essential for modern IT professionals. Our platform 
                provides comprehensive training in ethical hacking, penetration testing, incident response, and 
                security operations to prepare you for this high-demand field.
              </p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">
                How long does it take to become a cybersecurity professional?
              </h3>
              <p className="text-slate-400 leading-relaxed">
                The timeline varies based on your background and goals. Complete beginners typically need 6-12 months 
                of dedicated study to gain entry-level skills, while IT professionals can transition to cybersecurity 
                in 3-6 months. Our structured learning paths guide you from fundamentals through advanced topics like 
                penetration testing and digital forensics, with hands-on labs and real-world scenarios to accelerate 
                your learning.
              </p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">
                What cybersecurity tools will I learn to use at Cybernex Academy?
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Our hands-on training covers industry-standard cybersecurity tools including Metasploit for penetration 
                testing, Wireshark for network analysis, Nmap for network discovery, Burp Suite for web application 
                testing, Splunk for SIEM and log analysis, Volatility for memory forensics, and many others. You&apos;ll 
                gain practical experience with both open-source and commercial security tools used by professionals 
                in security operations centers (SOCs) and penetration testing teams.
              </p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">
                Do I need programming skills to learn cybersecurity?
              </h3>
              <p className="text-slate-400 leading-relaxed">
                While programming knowledge is helpful, it&apos;s not required to start learning cybersecurity. Our beginner 
                courses cover essential scripting languages like Python and PowerShell as they relate to security tasks. 
                However, many cybersecurity roles focus on security analysis, incident response, and risk management 
                rather than development. We provide programming foundations alongside security concepts to give you a 
                well-rounded skill set.
              </p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">
                What makes Cybernex Academy different from other cybersecurity training platforms?
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Cybernex Academy combines expert-led instruction with hands-on practice in virtual labs, real-world 
                scenarios, and a supportive community of 50,000+ cybersecurity professionals. Our platform offers 
                1,000+ curated resources, personalized learning paths, industry mentorship, and direct connections to 
                cybersecurity job opportunities. Unlike other platforms, we focus on practical skills that employers 
                value, with content updated regularly to reflect the latest threats and security technologies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Statistics - Trust and Authority Signals */}
      <section className="py-20 border-t border-slate-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-cyber font-bold mb-6">
              Leading Cybersecurity Education Platform
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              Trusted by cybersecurity professionals worldwide for comprehensive training and career advancement
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center bg-slate-800/30 border border-slate-700 rounded-lg p-6">
              <div className="text-3xl lg:text-4xl font-bold text-cyber-cyan mb-2">50,000+</div>
              <div className="text-slate-400">Active Members</div>
              <p className="text-sm text-slate-500 mt-2">Cybersecurity professionals in our community</p>
            </div>
            
            <div className="text-center bg-slate-800/30 border border-slate-700 rounded-lg p-6">
              <div className="text-3xl lg:text-4xl font-bold text-cyber-cyan mb-2">900+</div>
              <div className="text-slate-400">Learning Resources</div>
              <p className="text-sm text-slate-500 mt-2">Courses, tools, guides, and practical exercises</p>
            </div>
            
            <div className="text-center bg-slate-800/30 border border-slate-700 rounded-lg p-6">
              <div className="text-3xl lg:text-4xl font-bold text-cyber-cyan mb-2">95%</div>
              <div className="text-slate-400">Success Rate</div>
              <p className="text-sm text-slate-500 mt-2">Certification pass rate for our students</p>
            </div>
            
            <div className="text-center bg-slate-800/30 border border-slate-700 rounded-lg p-6">
              <div className="text-3xl lg:text-4xl font-bold text-cyber-cyan mb-2">24/7</div>
              <div className="text-slate-400">Expert Support</div>
              <p className="text-sm text-slate-500 mt-2">Round-the-clock mentorship and assistance</p>
            </div>
          </div>

          <div className="mt-16 text-center">
            <h3 className="text-2xl font-semibold text-white mb-6">Industry Recognition and Partnerships</h3>
            <p className="text-slate-400 max-w-4xl mx-auto leading-relaxed">
              Cybernex Academy is recognized by leading cybersecurity organizations and maintains partnerships with 
              major technology companies. Our curriculum aligns with industry standards from NIST, ISO, and SANS, 
              ensuring our graduates are well-prepared for real-world cybersecurity challenges. Our expert instructors 
              include certified professionals with CISSP, CEH, OSCP, and SANS certifications, bringing years of 
              practical experience from Fortune 500 companies and government agencies.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}