'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/app/providers'
import { Button } from '@/components/ui/button'
import GlobalSearch from '@/components/search/GlobalSearch'
import { 
  Shield, 
  Menu, 
  X, 
  Users, 
  TrendingUp, 
  GraduationCap,
  Search,
  User,
  LogOut,
  Settings,
  Crown,
  BookOpen,
  FileText,
  Video,
  Wrench,
  Podcast,
  Layers
} from 'lucide-react'

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const pathname = usePathname()
  const { user, signOut, loading } = useAuth()

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Handle global search shortcut (Ctrl+K / Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen(true)
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const navigation = [
    {
      name: 'Community',
      href: '/community',
      icon: Users,
      description: 'Connect with cybersecurity professionals',
      subcategories: [
        { name: 'Discord Servers', href: '/community/discord' },
        { name: 'Reddit Communities', href: '/community/reddit' },
        { name: 'Forums', href: '/community/forums' },
        { name: 'Skool Communities', href: '/community/skool' },
      ]
    },
    {
      name: 'Insights',
      href: '/insights',
      icon: TrendingUp,
      description: 'Latest cybersecurity news and intelligence',
      subcategories: [
        { name: 'Latest News', href: '/insights/news' },
        { name: 'Data Breaches', href: '/insights/breaches' },
        { name: 'Threat Intelligence', href: '/insights/threats' },
        { name: 'Security Tools', href: '/insights/tools' },
        { name: 'Podcasts', href: '/insights/podcasts' },
      ]
    },
    {
      name: 'Academy',
      href: '/academy',
      icon: GraduationCap,
      description: 'Comprehensive cybersecurity education',
      subcategories: [
        { name: 'Learning Paths', href: '/academy/learning-paths' },
        { name: 'Courses', href: '/academy/courses' },
        { name: 'Videos', href: '/academy/videos' },
        { name: 'Documentation', href: '/academy/documentation' },
        { name: 'Cheat Sheets', href: '/academy/cheatsheets' },
      ]
    }
  ]

  const isActivePath = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const handleSignOut = async () => {
    await signOut()
    setIsMobileMenuOpen(false)
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-slate-950/95 backdrop-blur-md border-b border-slate-800/50' 
        : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center space-x-3 group"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="relative">
              <Shield className="h-8 w-8 text-cyber-cyan transition-all duration-300 group-hover:text-cyber-magenta" />
              <div className="absolute inset-0 bg-cyber-cyan/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="flex flex-col">
              <span className="font-cyber text-lg font-bold text-white group-hover:text-cyber-cyan transition-colors">
                Cybernex
              </span>
              <span className="font-cyber text-xs text-slate-400 -mt-1">
                Academy
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            {/* Home Link */}
            <Link
              href="/"
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                pathname === '/'
                  ? 'text-cyber-cyan bg-slate-800/50'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/30'
              }`}
            >
              <span className="font-medium">Home</span>
            </Link>

            {navigation.map((item) => (
              <div key={item.name} className="relative group">
                <Link
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ease-in-out hover:scale-[1.02] ${
                    isActivePath(item.href)
                      ? 'text-cyber-cyan bg-slate-800/50 shadow-lg shadow-cyber-cyan/10'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50 hover:shadow-md hover:shadow-slate-700/20'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="font-medium">{item.name}</span>
                </Link>
                
                {/* Dropdown Menu - Only show for authenticated users */}
                {user && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-slate-900/98 backdrop-blur-md border border-slate-700/50 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-out transform translate-y-2 group-hover:translate-y-0">
                    <div className="p-4">
                      <p className="text-sm text-slate-400 mb-3">{item.description}</p>
                      <div className="space-y-1">
                        {item.subcategories.map((sub) => (
                          <Link
                            key={sub.name}
                            href={sub.href}
                            className="block px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all duration-200 ease-in-out hover:translate-x-1 hover:shadow-sm"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Search */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsSearchOpen(true)}
              className="text-slate-400 hover:text-cyber-cyan transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-lg hover:shadow-cyber-cyan/20"
            >
              <Search className="h-4 w-4" />
            </Button>

            {/* Auth Actions */}
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-slate-800 animate-pulse" />
            ) : user ? (
              <div className="relative group">
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-cyber-cyan transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-lg hover:shadow-cyber-cyan/20">
                  <User className="h-4 w-4" />
                </Button>
                
                {/* User Dropdown */}
                <div className="absolute top-full right-0 mt-2 w-48 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-out transform translate-y-2 group-hover:translate-y-0">
                  <div className="p-2">
                    <Link
                      href="/dashboard"
                      className="flex items-center space-x-2 px-3 py-2 text-sm text-slate-300 hover:text-cyber-cyan hover:bg-slate-800/50 rounded-md transition-all duration-200 ease-in-out hover:translate-x-1 hover:shadow-sm"
                    >
                      <User className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      className="flex items-center space-x-2 px-3 py-2 text-sm text-slate-300 hover:text-cyber-cyan hover:bg-slate-800/50 rounded-md transition-all duration-200 ease-in-out hover:translate-x-1 hover:shadow-sm"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                    {/* Admin Dashboard Link - Only show for admin users */}
                    {(user?.user_metadata?.role === 'admin' || user?.user_metadata?.role === 'super_admin') && (
                      <>
                        <Link
                          href="/admin"
                          className="flex items-center space-x-2 px-3 py-2 text-sm text-slate-300 hover:text-orange-400 hover:bg-orange-500/10 rounded-md transition-all duration-200 ease-in-out hover:translate-x-1 hover:shadow-sm"
                        >
                          <Shield className="h-4 w-4" />
                          <span>Admin Dashboard</span>
                        </Link>
                        <hr className="my-2 border-slate-700" />
                      </>
                    )}
                    
                    <Link
                      href="/pricing"
                      className="flex items-center space-x-2 px-3 py-2 text-sm text-slate-300 hover:text-cyber-cyan hover:bg-slate-800/50 rounded-md transition-all duration-200 ease-in-out hover:translate-x-1 hover:shadow-sm"
                    >
                      <Crown className="h-4 w-4" />
                      <span>Upgrade</span>
                    </Link>
                    <hr className="my-2 border-slate-700" />
                    <button
                      onClick={handleSignOut}
                      className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-slate-300 hover:text-red-400 hover:bg-slate-800/50 rounded-md transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm" className="text-slate-300 hover:text-cyber-cyan">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm" className="cyber-button">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-slate-400 hover:text-cyber-cyan transition-colors"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed top-16 left-0 right-0 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/50 shadow-xl z-40">
            <div className="px-4 pt-4 pb-6 space-y-2 max-h-[calc(100vh-4rem)] overflow-y-auto">
              {/* Mobile Search */}
              {user && (
                <button
                  onClick={() => {
                    setIsSearchOpen(true)
                    setIsMobileMenuOpen(false)
                  }}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ease-in-out text-slate-200 hover:text-cyber-cyan hover:bg-slate-800/50 hover:translate-x-1 hover:shadow-md"
                >
                  <Search className="h-5 w-5" />
                  <span>Search</span>
                  <span className="ml-auto text-xs text-slate-400">⌘K</span>
                </button>
              )}

              {/* Home link */}
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ease-in-out ${
                  pathname === '/'
                    ? 'text-cyber-cyan bg-slate-800/70 border border-cyber-cyan/30 shadow-lg shadow-cyber-cyan/10'
                    : 'text-slate-200 hover:text-cyber-cyan hover:bg-slate-800/50 hover:translate-x-1 hover:shadow-md'
                }`}
              >
                <Shield className="h-5 w-5" />
                <span>Home</span>
              </Link>
              
              {/* Navigation items */}
              {navigation.map((item) => (
                <div key={item.name} className="space-y-1">
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ease-in-out ${
                      isActivePath(item.href)
                        ? 'text-cyber-cyan bg-slate-800/70 border border-cyber-cyan/30 shadow-lg shadow-cyber-cyan/10'
                        : 'text-slate-200 hover:text-cyber-cyan hover:bg-slate-800/50 hover:translate-x-1 hover:shadow-md'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                  
                  {/* Mobile Subcategories - Only show for authenticated users */}
                  {user && (
                    <div className="ml-6 pl-4 border-l border-slate-700 space-y-1">
                      {item.subcategories.map((sub) => (
                        <Link
                          key={sub.name}
                          href={sub.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block px-3 py-2 text-sm text-slate-300 hover:text-cyber-cyan hover:bg-slate-800/30 rounded-md transition-all duration-200 ease-in-out hover:translate-x-1 hover:shadow-sm"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              {/* Mobile Auth */}
              <div className="pt-4 mt-4 border-t border-slate-700">
                {user ? (
                  <div className="space-y-2">
                    <Link
                      href="/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 text-slate-200 hover:text-cyber-cyan hover:bg-slate-800/50 rounded-lg transition-all duration-300 ease-in-out hover:translate-x-1 hover:shadow-md"
                    >
                      <User className="h-5 w-5" />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 text-slate-200 hover:text-cyber-cyan hover:bg-slate-800/50 rounded-lg transition-all duration-300 ease-in-out hover:translate-x-1 hover:shadow-md"
                    >
                      <Settings className="h-5 w-5" />
                      <span>Settings</span>
                    </Link>
                    
                    {/* Mobile Admin Dashboard Link */}
                    {(user?.user_metadata?.role === 'admin' || user?.user_metadata?.role === 'super_admin') && (
                      <Link
                        href="/admin"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center space-x-3 px-4 py-3 text-slate-200 hover:text-orange-400 hover:bg-orange-500/10 rounded-lg transition-all duration-300 ease-in-out hover:translate-x-1 hover:shadow-md"
                      >
                        <Shield className="h-5 w-5" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}
                    
                    <button
                      onClick={handleSignOut}
                      className="flex items-center space-x-3 w-full px-4 py-3 text-slate-200 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-300 ease-in-out hover:translate-x-1 hover:shadow-md hover:shadow-red-500/20"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link
                      href="/auth/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-3 text-slate-200 hover:text-cyber-cyan hover:bg-slate-800/50 rounded-lg transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-md text-center border border-slate-700"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-3 bg-gradient-to-r from-cyber-cyan to-cyber-magenta text-white font-medium rounded-lg hover:from-cyber-cyan/90 hover:to-cyber-magenta/90 transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-lg hover:shadow-cyber-cyan/20 text-center"
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Global Search Modal */}
      <GlobalSearch 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </nav>
  )
}