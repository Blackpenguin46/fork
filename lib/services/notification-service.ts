/**
 * Comprehensive Notification Service
 * Handles in-app notifications, email notifications, and push notifications
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  data?: Record<string, any>
  isRead: boolean
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: 'system' | 'learning' | 'community' | 'billing' | 'security'
  actionUrl?: string
  actionText?: string
  expiresAt?: Date
  createdAt: Date
  readAt?: Date
}

export type NotificationType = 
  | 'welcome'
  | 'course_completed'
  | 'achievement_earned'
  | 'payment_success'
  | 'payment_failed'
  | 'subscription_expiring'
  | 'new_resource'
  | 'forum_reply'
  | 'system_maintenance'
  | 'security_alert'
  | 'learning_reminder'
  | 'milestone_reached'

export interface NotificationPreferences {
  userId: string
  emailNotifications: boolean
  pushNotifications: boolean
  categories: {
    system: boolean
    learning: boolean
    community: boolean
    billing: boolean
    security: boolean
  }
  frequency: 'immediate' | 'daily' | 'weekly'
  quietHours: {
    enabled: boolean
    start: string // HH:MM format
    end: string   // HH:MM format
  }
}

export class NotificationService {
  /**
   * Create a new notification
   */
  static async createNotification(notification: Omit<Notification, 'id' | 'isRead' | 'createdAt'>): Promise<string> {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: notification.userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        priority: notification.priority,
        category: notification.category,
        action_url: notification.actionUrl,
        action_text: notification.actionText,
        expires_at: notification.expiresAt?.toISOString(),
        is_read: false,
        created_at: new Date().toISOString()
      })
      .select('id')
      .single()

    if (error) {
      throw new Error(`Failed to create notification: ${error.message}`)
    }

    const notificationId = data.id

    // Send additional notifications based on user preferences
    await this.processNotificationDelivery(notificationId, notification)

    return notificationId
  }

  /**
   * Create bulk notifications for multiple users
   */
  static async createBulkNotifications(
    userIds: string[],
    notification: Omit<Notification, 'id' | 'userId' | 'isRead' | 'createdAt'>
  ): Promise<string[]> {
    const notifications = userIds.map(userId => ({
      user_id: userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data,
      priority: notification.priority,
      category: notification.category,
      action_url: notification.actionUrl,
      action_text: notification.actionText,
      expires_at: notification.expiresAt?.toISOString(),
      is_read: false,
      created_at: new Date().toISOString()
    }))

    const { data, error } = await supabase
      .from('notifications')
      .insert(notifications)
      .select('id')

    if (error) {
      throw new Error(`Failed to create bulk notifications: ${error.message}`)
    }

    return data.map(n => n.id)
  }

  /**
   * Get notifications for a user
   */
  static async getUserNotifications(
    userId: string,
    options: {
      limit?: number
      offset?: number
      unreadOnly?: boolean
      category?: string
      priority?: string
    } = {}
  ): Promise<{
    notifications: Notification[]
    total: number
    unreadCount: number
  }> {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)

    if (options.unreadOnly) {
      query = query.eq('is_read', false)
    }

    if (options.category) {
      query = query.eq('category', options.category)
    }

    if (options.priority) {
      query = query.eq('priority', options.priority)
    }

    // Get total count - create a fresh query for count
    let countQuery = supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', userId)
    
    if (options.category) {
      countQuery = countQuery.eq('category', options.category)
    }
    if (options.unreadOnly) {
      countQuery = countQuery.eq('is_read', false)
    }
    if (options.priority) {
      countQuery = countQuery.eq('priority', options.priority)
    }
    
    const { count: totalCount } = await countQuery

    // Get unread count
    const { count: unreadCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    // Get paginated results
    query = query
      .order('created_at', { ascending: false })
      .range(options.offset || 0, (options.offset || 0) + (options.limit || 20) - 1)

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to get notifications: ${error.message}`)
    }

    const notifications: Notification[] = (data || []).map(n => ({
      id: n.id,
      userId: n.user_id,
      type: n.type,
      title: n.title,
      message: n.message,
      data: n.data,
      isRead: n.is_read,
      priority: n.priority,
      category: n.category,
      actionUrl: n.action_url,
      actionText: n.action_text,
      expiresAt: n.expires_at ? new Date(n.expires_at) : undefined,
      createdAt: new Date(n.created_at),
      readAt: n.read_at ? new Date(n.read_at) : undefined
    }))

    return {
      notifications,
      total: totalCount || 0,
      unreadCount: unreadCount || 0
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('id', notificationId)
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Failed to mark notification as read: ${error.message}`)
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('is_read', false)

    if (error) {
      throw new Error(`Failed to mark all notifications as read: ${error.message}`)
    }
  }

  /**
   * Delete notification
   */
  static async deleteNotification(notificationId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Failed to delete notification: ${error.message}`)
    }
  }

  /**
   * Get user notification preferences
   */
  static async getUserPreferences(userId: string): Promise<NotificationPreferences> {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('notification_preferences')
      .eq('user_id', userId)
      .single()

    if (error || !data) {
      // Return default preferences
      return {
        userId,
        emailNotifications: true,
        pushNotifications: true,
        categories: {
          system: true,
          learning: true,
          community: true,
          billing: true,
          security: true
        },
        frequency: 'immediate',
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '08:00'
        }
      }
    }

    return {
      userId,
      ...data.notification_preferences
    }
  }

  /**
   * Update user notification preferences
   */
  static async updateUserPreferences(
    userId: string, 
    preferences: Partial<NotificationPreferences>
  ): Promise<void> {
    const { error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        notification_preferences: preferences,
        updated_at: new Date().toISOString()
      })

    if (error) {
      throw new Error(`Failed to update notification preferences: ${error.message}`)
    }
  }

  /**
   * Send welcome notification to new user
   */
  static async sendWelcomeNotification(userId: string, userName?: string): Promise<void> {
    await this.createNotification({
      userId,
      type: 'welcome',
      title: 'Welcome to Cybernex Academy!',
      message: `Welcome ${userName || 'to our community'}! Start your cybersecurity learning journey today.`,
      priority: 'medium',
      category: 'system',
      actionUrl: '/academy',
      actionText: 'Explore Academy'
    })
  }

  /**
   * Send course completion notification
   */
  static async sendCourseCompletionNotification(
    userId: string, 
    courseName: string, 
    certificateUrl?: string
  ): Promise<void> {
    await this.createNotification({
      userId,
      type: 'course_completed',
      title: 'Course Completed!',
      message: `Congratulations! You've completed "${courseName}".`,
      priority: 'high',
      category: 'learning',
      actionUrl: certificateUrl || '/dashboard',
      actionText: certificateUrl ? 'Download Certificate' : 'View Progress',
      data: { courseName, certificateUrl }
    })
  }

  /**
   * Send achievement notification
   */
  static async sendAchievementNotification(
    userId: string, 
    achievementName: string, 
    achievementDescription: string
  ): Promise<void> {
    await this.createNotification({
      userId,
      type: 'achievement_earned',
      title: 'Achievement Unlocked!',
      message: `You've earned the "${achievementName}" achievement! ${achievementDescription}`,
      priority: 'high',
      category: 'learning',
      actionUrl: '/dashboard?tab=achievements',
      actionText: 'View Achievements',
      data: { achievementName, achievementDescription }
    })
  }

  /**
   * Send payment success notification
   */
  static async sendPaymentSuccessNotification(
    userId: string, 
    amount: number, 
    plan: string
  ): Promise<void> {
    await this.createNotification({
      userId,
      type: 'payment_success',
      title: 'Payment Successful',
      message: `Your payment of $${amount} for ${plan} has been processed successfully.`,
      priority: 'medium',
      category: 'billing',
      actionUrl: '/dashboard?tab=billing',
      actionText: 'View Billing',
      data: { amount, plan }
    })
  }

  /**
   * Send payment failed notification
   */
  static async sendPaymentFailedNotification(
    userId: string, 
    amount: number, 
    reason?: string
  ): Promise<void> {
    await this.createNotification({
      userId,
      type: 'payment_failed',
      title: 'Payment Failed',
      message: `Your payment of $${amount} could not be processed. ${reason || 'Please update your payment method.'}`,
      priority: 'urgent',
      category: 'billing',
      actionUrl: '/dashboard?tab=billing',
      actionText: 'Update Payment Method',
      data: { amount, reason }
    })
  }

  /**
   * Send subscription expiring notification
   */
  static async sendSubscriptionExpiringNotification(
    userId: string, 
    expiryDate: Date
  ): Promise<void> {
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    
    await this.createNotification({
      userId,
      type: 'subscription_expiring',
      title: 'Subscription Expiring Soon',
      message: `Your subscription will expire in ${daysUntilExpiry} days. Renew now to continue accessing premium content.`,
      priority: 'high',
      category: 'billing',
      actionUrl: '/pricing',
      actionText: 'Renew Subscription',
      data: { expiryDate: expiryDate.toISOString(), daysUntilExpiry }
    })
  }

  /**
   * Send new resource notification
   */
  static async sendNewResourceNotification(
    userIds: string[], 
    resourceTitle: string, 
    resourceId: string
  ): Promise<void> {
    await this.createBulkNotifications(userIds, {
      type: 'new_resource',
      title: 'New Learning Resource Available',
      message: `Check out the new resource: "${resourceTitle}"`,
      priority: 'low',
      category: 'learning',
      actionUrl: `/resources/${resourceId}`,
      actionText: 'View Resource',
      data: { resourceTitle, resourceId }
    })
  }

  /**
   * Send forum reply notification
   */
  static async sendForumReplyNotification(
    userId: string, 
    postTitle: string, 
    replierName: string, 
    postId: string
  ): Promise<void> {
    await this.createNotification({
      userId,
      type: 'forum_reply',
      title: 'New Reply to Your Post',
      message: `${replierName} replied to your post "${postTitle}"`,
      priority: 'medium',
      category: 'community',
      actionUrl: `/community/posts/${postId}`,
      actionText: 'View Reply',
      data: { postTitle, replierName, postId }
    })
  }

  /**
   * Send system maintenance notification
   */
  static async sendMaintenanceNotification(
    userIds: string[], 
    maintenanceDate: Date, 
    duration: string
  ): Promise<void> {
    await this.createBulkNotifications(userIds, {
      type: 'system_maintenance',
      title: 'Scheduled Maintenance',
      message: `System maintenance is scheduled for ${maintenanceDate.toLocaleDateString()} and will last approximately ${duration}.`,
      priority: 'medium',
      category: 'system',
      data: { maintenanceDate: maintenanceDate.toISOString(), duration }
    })
  }

  /**
   * Process notification delivery based on user preferences
   */
  private static async processNotificationDelivery(
    notificationId: string, 
    notification: Omit<Notification, 'id' | 'isRead' | 'createdAt'>
  ): Promise<void> {
    const preferences = await this.getUserPreferences(notification.userId)

    // Check if user wants notifications for this category
    if (!preferences.categories[notification.category]) {
      return
    }

    // Check quiet hours
    if (preferences.quietHours.enabled && this.isInQuietHours(preferences.quietHours)) {
      // Schedule for later delivery
      await this.scheduleDelayedDelivery(notificationId, preferences.quietHours.end)
      return
    }

    // Send email notification if enabled
    if (preferences.emailNotifications) {
      await this.sendEmailNotification(notification)
    }

    // Send push notification if enabled
    if (preferences.pushNotifications) {
      await this.sendPushNotification(notification)
    }
  }

  /**
   * Check if current time is in quiet hours
   */
  private static isInQuietHours(quietHours: { start: string; end: string }): boolean {
    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()
    
    const [startHour, startMin] = quietHours.start.split(':').map(Number)
    const [endHour, endMin] = quietHours.end.split(':').map(Number)
    
    const startTime = startHour * 60 + startMin
    const endTime = endHour * 60 + endMin
    
    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime
    } else {
      // Quiet hours span midnight
      return currentTime >= startTime || currentTime <= endTime
    }
  }

  /**
   * Schedule delayed notification delivery
   */
  private static async scheduleDelayedDelivery(notificationId: string, endTime: string): Promise<void> {
    // This would integrate with a job queue system like Bull or Agenda
    // For now, we'll just log it
    console.log(`Scheduling delayed delivery for notification ${notificationId} until ${endTime}`)
  }

  /**
   * Send email notification
   */
  private static async sendEmailNotification(
    notification: Omit<Notification, 'id' | 'isRead' | 'createdAt'>
  ): Promise<void> {
    // This would integrate with an email service like Resend, SendGrid, or AWS SES
    console.log(`Sending email notification to user ${notification.userId}: ${notification.title}`)
  }

  /**
   * Send push notification
   */
  private static async sendPushNotification(
    notification: Omit<Notification, 'id' | 'isRead' | 'createdAt'>
  ): Promise<void> {
    // This would integrate with a push notification service like Firebase or OneSignal
    console.log(`Sending push notification to user ${notification.userId}: ${notification.title}`)
  }

  /**
   * Clean up expired notifications
   */
  static async cleanupExpiredNotifications(): Promise<number> {
    const { data, error } = await supabase
      .from('notifications')
      .delete()
      .lt('expires_at', new Date().toISOString())
      .select('id')

    if (error) {
      throw new Error(`Failed to cleanup expired notifications: ${error.message}`)
    }

    return data?.length || 0
  }

  /**
   * Get notification statistics
   */
  static async getNotificationStats(userId?: string): Promise<{
    total: number
    unread: number
    byCategory: Record<string, number>
    byPriority: Record<string, number>
  }> {
    let query = supabase.from('notifications').select('category, priority, is_read')
    
    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to get notification stats: ${error.message}`)
    }

    const notifications = data || []
    const total = notifications.length
    const unread = notifications.filter(n => !n.is_read).length

    const byCategory = notifications.reduce((acc, n) => {
      acc[n.category] = (acc[n.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const byPriority = notifications.reduce((acc, n) => {
      acc[n.priority] = (acc[n.priority] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      total,
      unread,
      byCategory,
      byPriority
    }
  }
}