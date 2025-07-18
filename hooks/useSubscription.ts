'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/providers'
import { 
  getUserProfile, 
  getUserAccessLevel, 
  UserProfile, 
  AccessLevel,
  SubscriptionTier 
} from '@/lib/subscription/access-control'

export function useSubscription() {
  const authData = useAuth()
  const { user } = authData || {}
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [accessLevel, setAccessLevel] = useState<AccessLevel | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSubscriptionData() {
      try {
        if (!user?.id) {
          setProfile(null)
          setAccessLevel(null)
          setLoading(false)
          return
        }

        setLoading(true)
        const [userProfile, userAccessLevel] = await Promise.all([
          getUserProfile(user.id),
          getUserAccessLevel(user)
        ])

        setProfile(userProfile)
        setAccessLevel(userAccessLevel)
      } catch (error) {
        console.error('Error fetching subscription data:', error)
        setProfile(null)
        setAccessLevel(null)
      } finally {
        setLoading(false)
      }
    }

    fetchSubscriptionData()
  }, [user?.id])

  const isPro = profile?.subscription_tier === 'pro' && profile?.subscription_status === 'active'
  const isFree = profile?.subscription_tier === 'free' || !isPro

  return {
    profile,
    accessLevel,
    loading,
    isPro,
    isFree,
    tier: profile?.subscription_tier || 'free' as SubscriptionTier,
    status: profile?.subscription_status || 'active',
    
    // Feature access flags
    canAccessPremiumResources: accessLevel?.canAccessPremiumResources || false,
    canScheduleMeetings: accessLevel?.canScheduleMeetings || false,
    canBookmarkResources: accessLevel?.canBookmarkResources || false,
    canAccessPremiumDiscord: accessLevel?.canAccessPremiumDiscord || false,
    canAccessAI: accessLevel?.canAccessAI || false,
    canAccessNewsFeed: accessLevel?.canAccessNewsFeed || false,
    canAccessCustomRoadmaps: accessLevel?.canAccessCustomRoadmaps || false,
    canAccessPremiumInsights: accessLevel?.canAccessInsights || isPro,
    canAccessProgressTracker: accessLevel?.canAccessProgressTracker || false,
    dashboardType: accessLevel?.dashboardType || 'basic'
  }
}