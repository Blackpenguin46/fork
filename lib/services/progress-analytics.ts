import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

type Client = ReturnType<typeof createClientComponentClient<Database>>;

export interface UserProgressStats {
  totalTimeSpent: number; // in hours
  completedResources: number;
  inProgressResources: number;
  currentStreak: number;
  longestStreak: number;
  skillProficiencies: SkillProficiency[];
  recentActivity: ActivitySummary[];
  achievements: Achievement[];
  learningGoals: LearningGoal[];
  weeklyProgress: WeeklyProgress[];
}

export interface SkillProficiency {
  skillCategory: string;
  skillName: string;
  proficiencyLevel: number;
  lastAssessed: string;
  assessmentType: string;
  improvementAreas: string[];
  nextRecommendedContent: string[];
}

export interface ActivitySummary {
  date: string;
  timeSpent: number;
  resourcesAccessed: number;
  activitiesCompleted: number;
  notesAdded: number;
  bookmarksAdded: number;
}

export interface Achievement {
  id: string;
  type: string;
  name: string;
  description: string;
  earnedAt: string;
  badgeImageUrl?: string;
  pointsAwarded: number;
  isFeatured: boolean;
}

export interface LearningGoal {
  id: string;
  title: string;
  description: string;
  type: 'certification' | 'skill' | 'career' | 'project';
  targetDate?: string;
  currentProgress: number;
  status: 'active' | 'paused' | 'completed' | 'abandoned';
  relatedPaths: string[];
  milestones: Milestone[];
}

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: string;
}

export interface WeeklyProgress {
  week: string;
  hoursSpent: number;
  resourcesCompleted: number;
  streakDays: number;
  skillsImproved: number;
}

export interface LearningSession {
  id: string;
  resourceId: string;
  sessionStart: string;
  sessionEnd?: string;
  durationSeconds?: number;
  activitiesCompleted: number;
  notesTaken: number;
  bookmarksAdded: number;
  difficultyEncountered: boolean;
  helpRequested: boolean;
  sessionRating?: number;
}

export class ProgressAnalyticsService {
  private supabase: Client;

  constructor() {
    this.supabase = createClientComponentClient<Database>();
  }

  async getUserProgressStats(userId: string): Promise<UserProgressStats> {
    try {
      const [
        progressData,
        streakData,
        skillData,
        activityData,
        achievementData,
        goalData,
        weeklyData
      ] = await Promise.all([
        this.getProgressData(userId),
        this.getStreakData(userId),
        this.getSkillProficiencies(userId),
        this.getRecentActivity(userId),
        this.getAchievements(userId),
        this.getLearningGoals(userId),
        this.getWeeklyProgress(userId)
      ]);

      return {
        totalTimeSpent: progressData.totalTimeSpent,
        completedResources: progressData.completedResources,
        inProgressResources: progressData.inProgressResources,
        currentStreak: streakData.currentStreak,
        longestStreak: streakData.longestStreak,
        skillProficiencies: skillData,
        recentActivity: activityData,
        achievements: achievementData,
        learningGoals: goalData,
        weeklyProgress: weeklyData
      };
    } catch (error) {
      console.error('Error fetching user progress stats:', error);
      throw new Error('Failed to fetch progress statistics');
    }
  }

  private async getProgressData(userId: string) {
    const { data, error } = await this.supabase
      .from('user_progress_detailed')
      .select('time_spent_seconds, progress_percentage, completed_at')
      .eq('user_id', userId);

    if (error) throw error;

    const totalTimeSpent = data.reduce((sum, item) => sum + (item.time_spent_seconds || 0), 0) / 3600; // Convert to hours
    const completedResources = data.filter(item => item.progress_percentage === 100).length;
    const inProgressResources = data.filter(item => item.progress_percentage > 0 && item.progress_percentage < 100).length;

    return { totalTimeSpent, completedResources, inProgressResources };
  }

  private async getStreakData(userId: string) {
    const { data, error } = await this.supabase
      .from('user_learning_streaks')
      .select('current_streak, longest_streak')
      .eq('user_id', userId)
      .eq('streak_type', 'daily')
      .single();

    if (error) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    return {
      currentStreak: data.current_streak || 0,
      longestStreak: data.longest_streak || 0
    };
  }

  private async getSkillProficiencies(userId: string): Promise<SkillProficiency[]> {
    const { data, error } = await this.supabase
      .from('user_skill_assessments')
      .select('*')
      .eq('user_id', userId)
      .order('assessment_date', { ascending: false });

    if (error) throw error;

    return data.map(assessment => ({
      skillCategory: assessment.skill_category,
      skillName: assessment.skill_name,
      proficiencyLevel: assessment.proficiency_level,
      lastAssessed: assessment.assessment_date,
      assessmentType: assessment.assessment_type,
      improvementAreas: assessment.improvement_areas as string[] || [],
      nextRecommendedContent: assessment.next_recommended_content || []
    }));
  }

  private async getRecentActivity(userId: string, days = 7): Promise<ActivitySummary[]> {
    const { data, error } = await this.supabase
      .from('user_learning_sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('session_start', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('session_start', { ascending: false });

    if (error) throw error;

    // Group by date
    const activityByDate = data.reduce((acc, session) => {
      const date = session.session_start.split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          date,
          timeSpent: 0,
          resourcesAccessed: 0,
          activitiesCompleted: 0,
          notesAdded: 0,
          bookmarksAdded: 0
        };
      }

      acc[date].timeSpent += (session.duration_seconds || 0) / 3600;
      acc[date].resourcesAccessed += 1;
      acc[date].activitiesCompleted += session.activities_completed;
      acc[date].notesAdded += session.notes_taken;
      acc[date].bookmarksAdded += session.bookmarks_added;

      return acc;
    }, {} as Record<string, ActivitySummary>);

    return Object.values(activityByDate);
  }

  private async getAchievements(userId: string): Promise<Achievement[]> {
    const { data, error } = await this.supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    if (error) throw error;

    return data.map(achievement => ({
      id: achievement.id,
      type: achievement.achievement_type,
      name: achievement.achievement_name,
      description: achievement.achievement_description || '',
      earnedAt: achievement.earned_at,
      badgeImageUrl: achievement.badge_image_url,
      pointsAwarded: achievement.points_awarded,
      isFeatured: achievement.is_featured
    }));
  }

  private async getLearningGoals(userId: string): Promise<LearningGoal[]> {
    const { data, error } = await this.supabase
      .from('user_learning_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(goal => ({
      id: goal.id,
      title: goal.goal_title,
      description: goal.goal_description || '',
      type: goal.goal_type as 'certification' | 'skill' | 'career' | 'project',
      targetDate: goal.target_completion_date,
      currentProgress: goal.current_progress,
      status: goal.status as 'active' | 'paused' | 'completed' | 'abandoned',
      relatedPaths: goal.related_learning_paths || [],
      milestones: goal.milestones as Milestone[] || []
    }));
  }

  private async getWeeklyProgress(userId: string, weeks = 8): Promise<WeeklyProgress[]> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - weeks * 7 * 24 * 60 * 60 * 1000);

    const { data, error } = await this.supabase
      .from('user_learning_sessions')
      .select('session_start, duration_seconds, activities_completed')
      .eq('user_id', userId)
      .gte('session_start', startDate.toISOString())
      .order('session_start', { ascending: true });

    if (error) throw error;

    // Group by week
    const weeklyData = data.reduce((acc, session) => {
      const sessionDate = new Date(session.session_start);
      const weekStart = new Date(sessionDate);
      weekStart.setDate(sessionDate.getDate() - sessionDate.getDay()); // Start of week (Sunday)
      const weekKey = weekStart.toISOString().split('T')[0];

      if (!acc[weekKey]) {
        acc[weekKey] = {
          week: weekKey,
          hoursSpent: 0,
          resourcesCompleted: 0,
          streakDays: 0,
          skillsImproved: 0
        };
      }

      acc[weekKey].hoursSpent += (session.duration_seconds || 0) / 3600;
      acc[weekKey].resourcesCompleted += session.activities_completed;

      return acc;
    }, {} as Record<string, WeeklyProgress>);

    return Object.values(weeklyData);
  }

  async updateProgress(
    userId: string,
    resourceId: string,
    progressUpdate: {
      progressPercentage?: number;
      timeSpentSeconds?: number;
      milestones?: string[];
      userRating?: number;
      difficultyRating?: number;
      notes?: string;
    }
  ): Promise<void> {
    try {
      const { data: existingProgress } = await this.supabase
        .from('user_progress_detailed')
        .select('*')
        .eq('user_id', userId)
        .eq('resource_id', resourceId)
        .single();

      const updateData = {
        user_id: userId,
        resource_id: resourceId,
        progress_percentage: progressUpdate.progressPercentage,
        time_spent_seconds: existingProgress 
          ? (existingProgress.time_spent_seconds || 0) + (progressUpdate.timeSpentSeconds || 0)
          : progressUpdate.timeSpentSeconds,
        last_accessed_at: new Date().toISOString(),
        user_rating: progressUpdate.userRating,
        difficulty_rating: progressUpdate.difficultyRating,
        notes: progressUpdate.notes,
        milestones_completed: progressUpdate.milestones || [],
        session_count: existingProgress ? (existingProgress.session_count || 0) + 1 : 1,
        updated_at: new Date().toISOString(),
        ...(progressUpdate.progressPercentage === 100 && { completed_at: new Date().toISOString() })
      };

      const { error } = await this.supabase
        .from('user_progress_detailed')
        .upsert(updateData);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating progress:', error);
      throw new Error('Failed to update progress');
    }
  }

  async startLearningSession(userId: string, resourceId: string): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .from('user_learning_sessions')
        .insert({
          user_id: userId,
          resource_id: resourceId,
          session_start: new Date().toISOString()
        })
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error starting learning session:', error);
      throw new Error('Failed to start learning session');
    }
  }

  async endLearningSession(
    sessionId: string,
    sessionData: {
      activitiesCompleted?: number;
      notesTaken?: number;
      bookmarksAdded?: number;
      difficultyEncountered?: boolean;
      helpRequested?: boolean;
      sessionRating?: number;
    }
  ): Promise<void> {
    try {
      const sessionEnd = new Date().toISOString();
      
      const { data: session } = await this.supabase
        .from('user_learning_sessions')
        .select('session_start')
        .eq('id', sessionId)
        .single();

      const durationSeconds = session 
        ? Math.floor((new Date(sessionEnd).getTime() - new Date(session.session_start).getTime()) / 1000)
        : 0;

      const { error } = await this.supabase
        .from('user_learning_sessions')
        .update({
          session_end: sessionEnd,
          duration_seconds: durationSeconds,
          activities_completed: sessionData.activitiesCompleted || 0,
          notes_taken: sessionData.notesTaken || 0,
          bookmarks_added: sessionData.bookmarksAdded || 0,
          difficulty_encountered: sessionData.difficultyEncountered || false,
          help_requested: sessionData.helpRequested || false,
          session_rating: sessionData.sessionRating
        })
        .eq('id', sessionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error ending learning session:', error);
      throw new Error('Failed to end learning session');
    }
  }

  async addAchievement(userId: string, achievementData: {
    type: string;
    name: string;
    description: string;
    badgeImageUrl?: string;
    pointsAwarded?: number;
    isFeatured?: boolean;
  }): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('user_achievements')
        .insert({
          user_id: userId,
          achievement_type: achievementData.type,
          achievement_name: achievementData.name,
          achievement_description: achievementData.description,
          badge_image_url: achievementData.badgeImageUrl,
          points_awarded: achievementData.pointsAwarded || 0,
          is_featured: achievementData.isFeatured || false
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error adding achievement:', error);
      throw new Error('Failed to add achievement');
    }
  }

  async createLearningGoal(userId: string, goalData: {
    title: string;
    description?: string;
    type: 'certification' | 'skill' | 'career' | 'project';
    targetDate?: string;
    relatedPaths?: string[];
    milestones?: Milestone[];
  }): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .from('user_learning_goals')
        .insert({
          user_id: userId,
          goal_title: goalData.title,
          goal_description: goalData.description,
          goal_type: goalData.type,
          target_completion_date: goalData.targetDate,
          related_learning_paths: goalData.relatedPaths || [],
          milestones: goalData.milestones || []
        })
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error creating learning goal:', error);
      throw new Error('Failed to create learning goal');
    }
  }

  async updateLearningGoal(goalId: string, updates: {
    title?: string;
    description?: string;
    targetDate?: string;
    currentProgress?: number;
    status?: 'active' | 'paused' | 'completed' | 'abandoned';
    milestones?: Milestone[];
  }): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('user_learning_goals')
        .update({
          goal_title: updates.title,
          goal_description: updates.description,
          target_completion_date: updates.targetDate,
          current_progress: updates.currentProgress,
          status: updates.status,
          milestones: updates.milestones,
          updated_at: new Date().toISOString()
        })
        .eq('id', goalId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating learning goal:', error);
      throw new Error('Failed to update learning goal');
    }
  }
}