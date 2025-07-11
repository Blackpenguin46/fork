'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/app/providers'
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
                  <p className="text-2xl font-bold text-white">12</p>
                  <p className="text-sm text-gray-400">Courses Started</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-green-400" />
                <div>
                  <p className="text-2xl font-bold text-white">5</p>
                  <p className="text-sm text-gray-400">Completed</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-400" />
                <div>
                  <p className="text-2xl font-bold text-white">25</p>
                  <p className="text-sm text-gray-400">Bookmarks</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-yellow-400" />
                <div>
                  <p className="text-2xl font-bold text-white">78%</p>
                  <p className="text-sm text-gray-400">Progress</p>
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
              <div className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg">
                <BookOpen className="h-5 w-5 text-blue-400" />
                <div className="flex-1">
                  <p className="text-white text-sm">Started course: &ldquo;Advanced Penetration Testing&rdquo;</p>
                  <p className="text-gray-400 text-xs">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg">
                <Award className="h-5 w-5 text-green-400" />
                <div className="flex-1">
                  <p className="text-white text-sm">Completed: &ldquo;Network Security Fundamentals&rdquo;</p>
                  <p className="text-gray-400 text-xs">1 day ago</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg">
                <Users className="h-5 w-5 text-purple-400" />
                <div className="flex-1">
                  <p className="text-white text-sm">Joined community discussion on &ldquo;Zero Trust Architecture&rdquo;</p>
                  <p className="text-gray-400 text-xs">3 days ago</p>
                </div>
              </div>
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
    </div>
  )
}