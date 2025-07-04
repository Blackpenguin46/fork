import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export type SubscriptionTier = 'free' | 'pro'
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing'

export interface UserProfile {
  id: string
  email: string
  username?: string
  full_name?: string
  subscription_tier: SubscriptionTier
  subscription_status: SubscriptionStatus
  stripe_customer_id?: string
  stripe_subscription_id?: string
}

export interface AccessLevel {
  canAccessCommunity: boolean
  canAccessInsights: boolean
  canAccessAcademy: boolean
  canAccessPremiumResources: boolean
  canScheduleMeetings: boolean
  canBookmarkResources: boolean
  canAccessPremiumDiscord: boolean
  canAccessAI: boolean
  canAccessNewsFeed: boolean
  canAccessCustomRoadmaps: boolean
  canAccessProgressTracker: boolean
  dashboardType: 'basic' | 'advanced'
}

/**
 * Get user's subscription tier and status from database
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (!supabase) {
    console.warn('Supabase not configured')
    return null
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, username, full_name, subscription_tier, subscription_status, stripe_customer_id, stripe_subscription_id')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
      return null
    }

    return data as UserProfile
  } catch (error) {
    console.error('Error in getUserProfile:', error)
    return null
  }
}

/**
 * Get access level based on subscription tier and status
 */
export function getAccessLevel(tier: SubscriptionTier, status: SubscriptionStatus): AccessLevel {
  // Free tier access - basic features only
  const freeAccess: AccessLevel = {
    canAccessCommunity: true,
    canAccessInsights: true,
    canAccessAcademy: true,
    canAccessPremiumResources: false,
    canScheduleMeetings: false,
    canBookmarkResources: false,
    canAccessPremiumDiscord: false,
    canAccessAI: false,
    canAccessNewsFeed: false,
    canAccessCustomRoadmaps: false,
    canAccessProgressTracker: false,
    dashboardType: 'basic'
  }

  // Pro tier access - all premium features
  const proAccess: AccessLevel = {
    canAccessCommunity: true,
    canAccessInsights: true,
    canAccessAcademy: true,
    canAccessPremiumResources: true,
    canScheduleMeetings: true,
    canBookmarkResources: true,
    canAccessPremiumDiscord: true,
    canAccessAI: true,
    canAccessNewsFeed: true,
    canAccessCustomRoadmaps: true,
    canAccessProgressTracker: true,
    dashboardType: 'advanced'
  }

  // If subscription is not active, default to free access
  if (status !== 'active' && status !== 'trialing') {
    return freeAccess
  }

  // Return access based on tier
  switch (tier) {
    case 'pro':
      return proAccess
    case 'free':
    default:
      return freeAccess
  }
}

/**
 * Check if user has access to a specific feature
 */
export async function checkUserAccess(user: User, feature: keyof AccessLevel): Promise<boolean> {
  if (!user?.id) return false

  const profile = await getUserProfile(user.id)
  if (!profile) return false

  const accessLevel = getAccessLevel(profile.subscription_tier, profile.subscription_status)
  return accessLevel[feature] as boolean
}

/**
 * Get user's access level
 */
export async function getUserAccessLevel(user: User): Promise<AccessLevel | null> {
  if (!user?.id) return null

  const profile = await getUserProfile(user.id)
  if (!profile) return null

  return getAccessLevel(profile.subscription_tier, profile.subscription_status)
}

/**
 * Check if content should be accessible to user
 */
export function isContentAccessible(
  contentType: 'free' | 'pro',
  userAccessLevel: AccessLevel
): boolean {
  switch (contentType) {
    case 'free':
      return true // Free content accessible to all authenticated users
    case 'pro':
      return userAccessLevel.canAccessPremiumResources
    default:
      return false
  }
}

/**
 * Hook for checking user access in components
 */
export function useSubscriptionAccess() {
  return {
    getUserProfile,
    getAccessLevel,
    checkUserAccess,
    getUserAccessLevel,
    isContentAccessible
  }
}