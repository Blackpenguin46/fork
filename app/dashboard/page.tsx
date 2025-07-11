'use client'

import React, { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/app/providers'
import { useSubscription } from '@/hooks/useSubscription'
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
  CheckCircle,
  Bot,
  MessageSquare,
  Bookmark,
  Video,
  Zap
} from 'lucide-react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import ProgressOverview from '@/components/dashboard/SimpleProgressOverview';

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
  const { isPro, isFree, dashboardType, canAccessProgressTracker, canScheduleMeetings, loading: subscriptionLoading } = useSubscription()
  const router = useRouter();
  const searchParams = useSearchParams()
  const message = searchParams.get('message')
  const [activeTab, setActiveTab] = useState('overview');

  // Debug authentication state
  useEffect(() => {
    console.log('🏠 Dashboard auth state:', {
      hasUser: !!user,
      userEmail: user?.email,
      loading,
      subscriptionLoading,
      url: window.location.href
    })
  }, [user, loading, subscriptionLoading])

  // Show loading while auth is being determined
  if (loading || subscriptionLoading) {
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
          <div className="text-gray-400">Loading your dashboard...</div>
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

  // Dashboard tabs based on subscription tier
  const freeTabs: TabProps[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <Clock className="w-4 h-4" />
    }
  ];

  const proTabs: TabProps[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <TrendingUp className="w-4 h-4" />
    },
    {
      id: 'progress',
      label: 'Progress Tracker',
      icon: <Target className="w-4 h-4" />
    },
    {
      id: 'roadmaps',
      label: 'Custom Roadmaps',
      icon: <BookOpen className="w-4 h-4" />
    },
    {
      id: 'achievements',
      label: 'Achievements',
      icon: <Award className="w-4 h-4" />
    },
    {
      id: 'bookmarks',
      label: 'Bookmarks',
      icon: <Bookmark className="w-4 h-4" />
    }
  ];

  const tabs = isPro ? proTabs : freeTabs;

  // Quick actions based on subscription tier
  const freeQuickActions = [
    {
      title: 'Browse Free Resources',
      description: 'Explore cybersecurity learning materials',
      icon: <BookOpen className="w-6 h-6" />,
      href: '/academy',
      color: 'green'
    },
    {
      title: 'Community Forums',
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
      title: 'Upgrade to Pro',
      description: 'Unlock premium features and content',
      icon: <Crown className="w-6 h-6" />,
      href: '/pricing',
      color: 'orange'
    }
  ];

  const proQuickActions = [
    {
      title: 'AI Assistant',
      description: 'Get personalized cybersecurity guidance',
      icon: <Bot className="w-6 h-6" />,
      href: '/dashboard/ai',
      color: 'cyan'
    },
    {
      title: 'Schedule 1-on-1',
      description: 'Book a meeting with cybersecurity expert',
      icon: <Video className="w-6 h-6" />,
      href: '/dashboard/meetings',
      color: 'green'
    },
    {
      title: 'Premium Discord',
      description: 'Access exclusive community discussions',
      icon: <MessageSquare className="w-6 h-6" />,
      href: '/community/discord-premium',
      color: 'blue'
    },
    {
      title: 'Custom Roadmaps',
      description: 'Create personalized learning paths',
      icon: <Target className="w-6 h-6" />,
      href: '/dashboard/roadmaps',
      color: 'purple'
    }
  ];

  const quickActions = isPro ? proQuickActions : freeQuickActions;

  const QuickAction: React.FC<any> = ({
    title,
    description,
    icon,
    href,
    color
  }) => {
    return (
      <button
        onClick={() => router.push(href)}
        className={`p-4 bg-gray-800/50 border border-gray-700 rounded-lg hover:border-${color}-500/50 transition-all duration-200 text-left w-full group`}
      >
        <div className="flex items-center space-x-3">
          <div className={`p-2 bg-${color}-500/10 rounded-lg text-${color}-400`}>
            {icon}
          </div>
          <div>
            <h3 className="text-white font-medium group-hover:text-${color}-400 transition-colors">{title}</h3>
            <p className="text-gray-400 text-sm">{description}</p>
          </div>
        </div>
      </button>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        if (isFree) {
          // Basic dashboard for free users - just membership duration
          const memberSince = user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'
          return (
            <div className="space-y-6">
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Your Membership</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Clock className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Member since {memberSince}</p>
                      <p className="text-gray-400 text-sm">Free Tier</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => router.push('/pricing')}
                    size="sm"
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade
                  </Button>
                </div>
              </div>
            </div>
          )
        }
        return <ProgressOverview />;
      
      case 'progress':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">Progress Tracker</h2>
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-400 font-medium">Pro Feature</span>
              </div>
            </div>
            <ProgressOverview />
          </div>
        );
      
      case 'roadmaps':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">Custom Roadmaps</h2>
              <button className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors">
                Create New Roadmap
              </button>
            </div>
            
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <p className="text-gray-400 text-center">
                Custom learning roadmaps will be implemented here
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
      
      case 'bookmarks':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">Saved Resources</h2>
              <div className="flex items-center space-x-2">
                <Bookmark className="w-4 h-4 text-cyan-400" />
                <span className="text-gray-400 text-sm">Unlimited</span>
              </div>
            </div>
            
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <p className="text-gray-400 text-center">
                Bookmarked resources will be displayed here
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


        {/* Welcome Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-white mb-2">
            {getGreeting()}, {user?.user_metadata?.username || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Professional'}!
          </h1>
          <p className="text-gray-400">
            Ready to continue your cybersecurity learning journey?
          </p>
        </motion.div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.slice(0, 4).map((action, index) => (
              <QuickAction key={index} {...action} />
            ))}
          </div>
        </div>

        {/* Dashboard Tabs */}
        {/* Dashboard Tabs - Only show if user has Pro */}
        {isPro && (
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
        )}

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderTabContent()}
        </motion.div>

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