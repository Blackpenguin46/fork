'use client'

import React, { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/app/providers'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  User, 
  BookOpen, 
  Heart, 
  TrendingUp, 
  Clock, 
  Award,
  Users,
  Activity,
  Crown,
  Settings,
  Bell,
  Target,
  Calendar,
  Newspaper,
  GraduationCap,
  Filter,
  Search,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import ProgressOverview from '@/components/dashboard/ProgressOverview';

interface TabProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  count?: number;
}

const DashboardTab: React.FC<TabProps & { isActive: boolean; onClick: () => void }> = ({
  id,
  label,
  icon,
  count,
  isActive,
  onClick
}) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors relative ${
        isActive
          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
          : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
      {count !== undefined && count > 0 && (
        <span className="bg-cyan-500 text-white text-xs px-2 py-1 rounded-full">
          {count}
        </span>
      )}
    </button>
  );
};

function DashboardContent() {
  const { user, loading } = useAuth()
  const router = useRouter();
  const searchParams = useSearchParams()
  const message = searchParams.get('message')
  const verified = searchParams.get('verified')
  const autoLogin = searchParams.get('auto_login')
  const [activeTab, setActiveTab] = useState('overview');
  const [authCheckDelay, setAuthCheckDelay] = useState(0)

  // Debug logging
  console.log('Dashboard auth state:', { 
    user: user?.id, 
    loading, 
    verified, 
    autoLogin,
    authCheckDelay 
  })

  // Handle auto-login after email verification
  useEffect(() => {
    if (verified === 'true' && autoLogin === 'true' && !user && !loading) {
      console.log('Auto-login flow: waiting for session detection...')
      if (authCheckDelay < 5) {
        // Wait longer for auto-login to establish session
        setTimeout(() => setAuthCheckDelay(prev => prev + 1), 1000)
        return
      } else {
        // If auto-login failed after 5 seconds, redirect to login
        console.log('Auto-login failed, redirecting to login page')
        window.location.href = '/auth/login?message=' + encodeURIComponent('Please sign in to access your account')
      }
    }
  }, [verified, autoLogin, user, loading, authCheckDelay])

  // Show loading while auth is being determined or during auto-login flow
  if (loading || (verified === 'true' && autoLogin === 'true' && !user && authCheckDelay < 5)) {
    const isAutoLogin = autoLogin === 'true'
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-deep-space-blue">
        <div className="text-center">
          <div className="animate-pulse flex space-x-4 justify-center mb-4">
            <div className="rounded-full bg-slate-700 h-10 w-10"></div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-700 rounded w-40"></div>
              <div className="h-4 bg-slate-700 rounded w-32"></div>
            </div>
          </div>
          <div className="text-gray-400">
            {isAutoLogin ? (
              <>
                <div>Email verified successfully! 🎉</div>
                <div className="mt-2 text-sm">Logging you in automatically...</div>
                <div className="mt-1 text-xs">({authCheckDelay}/5)</div>
              </>
            ) : (
              'Loading your dashboard...'
            )}
          </div>
        </div>
      </div>
    )
  }

  // If not authenticated, redirect to login page (not embedded login)
  if (!user) {
    console.log('No user found after auth check, redirecting to login page')
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login?redirect=/dashboard'
    }
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Redirecting to login...</div>
      </div>
    )
  }

  const tabs: TabProps[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <TrendingUp className="w-4 h-4" />
    },
    {
      id: 'learning',
      label: 'Learning Paths',
      icon: <BookOpen className="w-4 h-4" />
    },
    {
      id: 'goals',
      label: 'Goals',
      icon: <Target className="w-4 h-4" />
    },
    {
      id: 'achievements',
      label: 'Achievements',
      icon: <Award className="w-4 h-4" />
    },
    {
      id: 'activity',
      label: 'Activity',
      icon: <Calendar className="w-4 h-4" />
    }
  ];

  const quickActions = [
    {
      title: 'Continue Learning',
      description: 'Resume your last learning session',
      icon: <BookOpen className="w-6 h-6" />,
      href: '/academy',
      color: 'green'
    },
    {
      title: 'Browse Community',
      description: 'Connect with cybersecurity professionals',
      icon: <Users className="w-6 h-6" />,
      href: '/community',
      color: 'blue'
    },
    {
      title: 'Latest Insights',
      description: 'Stay updated with cybersecurity news',
      icon: <Newspaper className="w-6 h-6" />,
      href: '/insights',
      color: 'purple'
    },
    {
      title: 'Skill Assessment',
      description: 'Evaluate your cybersecurity knowledge',
      icon: <GraduationCap className="w-6 h-6" />,
      href: '/academy/assessment',
      color: 'orange'
    }
  ];

  const QuickAction: React.FC<any> = ({
    title,
    description,
    icon,
    href,
    color
  }) => {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => router.push(href)}
        className={`p-6 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl hover:border-${color}-500/50 transition-colors text-left w-full`}
      >
        <div className={`p-3 bg-${color}-500/10 rounded-lg w-fit mb-4 text-${color}-400`}>
          {icon}
        </div>
        <h3 className="text-white font-semibold mb-2">{title}</h3>
        <p className="text-gray-400 text-sm">{description}</p>
      </motion.button>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <ProgressOverview />;
      
      case 'learning':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">Your Learning Paths</h2>
              <button className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors">
                Browse All Paths
              </button>
            </div>
            
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <p className="text-gray-400 text-center">
                Learning paths component will be implemented here
              </p>
            </div>
          </div>
        );
      
      case 'goals':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">Learning Goals</h2>
              <button className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors">
                Add New Goal
              </button>
            </div>
            
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <p className="text-gray-400 text-center">
                Learning goals management will be implemented here
              </p>
            </div>
          </div>
        );
      
      case 'achievements':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">Your Achievements</h2>
              <div className="flex space-x-2">
                <button className="px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors">
                  <Filter className="w-4 h-4" />
                </button>
                <button className="px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors">
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <p className="text-gray-400 text-center">
                Achievements gallery will be implemented here
              </p>
            </div>
          </div>
        );
      
      case 'activity':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
            
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <p className="text-gray-400 text-center">
                Activity timeline will be implemented here
              </p>
            </div>
          </div>
        );
      
      default:
        return <ProgressOverview />;
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-deep-space-blue">
      <div className="container mx-auto px-4 py-8 mt-16">
        {/* Success Message */}
        {message && (
          <Alert variant="success" className="mb-6">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {/* Email Verification Success */}
        {verified === 'true' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl"
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Welcome to Cybernex Academy! 🎉
                </h3>
                <p className="text-green-300 text-sm">
                  Your email has been verified successfully. You now have full access to all our cybersecurity learning resources.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Welcome Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-6 mb-8"
        >
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">
                {getGreeting()}, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Cybersecurity Professional'}! 👋
              </h1>
              <p className="text-gray-300">
                Ready to continue your cybersecurity learning journey?
              </p>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <QuickAction key={index} {...action} />
            ))}
          </div>
        </div>

        {/* Dashboard Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <DashboardTab
                key={tab.id}
                {...tab}
                isActive={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              />
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderTabContent()}
        </motion.div>

        {/* Settings and Profile Quick Access */}
        <div className="fixed bottom-6 right-6 flex flex-col space-y-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => router.push('/dashboard/profile')}
            className="p-3 bg-gray-800 border border-gray-700 rounded-full text-gray-400 hover:text-white hover:border-cyan-500/50 transition-colors shadow-lg backdrop-blur-sm"
          >
            <User className="w-5 h-5" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => router.push('/dashboard/settings')}
            className="p-3 bg-gray-800 border border-gray-700 rounded-full text-gray-400 hover:text-white hover:border-cyan-500/50 transition-colors shadow-lg backdrop-blur-sm"
          >
            <Settings className="w-5 h-5" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-3 bg-gray-800 border border-gray-700 rounded-full text-gray-400 hover:text-white hover:border-cyan-500/50 transition-colors shadow-lg backdrop-blur-sm"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </motion.button>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-slate-700 h-10 w-10"></div>
          <div className="space-y-2">
            <div className="h-4 bg-slate-700 rounded w-40"></div>
            <div className="h-4 bg-slate-700 rounded w-32"></div>
          </div>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}