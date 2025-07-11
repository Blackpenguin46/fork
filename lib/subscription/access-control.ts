import { User } from '@supabase/supabase-js'
import { ProfilesService } from '@/lib/services/profiles'
import type { Profile } from '@/lib/types/database'

export type SubscriptionTier = 'free' | 'pro'
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing'

// Using the Profile type from database types, extending with subscription status
export interface UserProfile extends Profile {
  subscription_status?: SubscriptionStatus
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
  try {
    const result = await ProfilesService.getProfile(userId)
    
    if (!result.success || !result.data) {
      console.warn('User profile not found:', result.error)
      return null
    }

    // For now, assume active subscription status if user has profile
    // This will be enhanced when subscription table is used
    return {
      ...result.data,
      subscription_status: 'active'
    } as UserProfile
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

  const accessLevel = getAccessLevel(profile.subscription_tier, profile.subscription_status || 'active')
  return accessLevel[feature] as boolean
}

/**
 * Get user's access level
 */
export async function getUserAccessLevel(user: User): Promise<AccessLevel | null> {
  if (!user?.id) return null

  const profile = await getUserProfile(user.id)
  if (!profile) return null

  return getAccessLevel(profile.subscription_tier, profile.subscription_status || 'active')
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