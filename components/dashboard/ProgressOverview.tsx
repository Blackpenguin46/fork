'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Clock, 
  Target, 
  Award, 
  BookOpen, 
  Zap,
  Calendar,
  BarChart3
} from 'lucide-react';
import { ProgressAnalyticsService, UserProgressStats } from '@/lib/services/progress-analytics';
import { useAuth } from '@/app/providers';

interface ProgressCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

const ProgressCard: React.FC<ProgressCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  className = ''
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-cyan-500/50 transition-colors ${className}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center text-sm ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
            <TrendingUp className={`w-4 h-4 mr-1 ${!trend.isPositive && 'rotate-180'}`} />
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <h3 className="text-2xl font-bold text-white">{value}</h3>
        <p className="text-gray-400 text-sm">{title}</p>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
    </motion.div>
  );
};

interface SkillProficiencyBarProps {
  skill: {
    skillName: string;
    skillCategory: string;
    proficiencyLevel: number;
    assessmentType: string;
  };
}

const SkillProficiencyBar: React.FC<SkillProficiencyBarProps> = ({ skill }) => {
  const getColorByLevel = (level: number) => {
    if (level >= 80) return 'bg-green-500';
    if (level >= 60) return 'bg-yellow-500';
    if (level >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-white font-medium">{skill.skillName}</p>
          <p className="text-xs text-gray-400">{skill.skillCategory}</p>
        </div>
        <div className="text-right">
          <p className="text-white font-semibold">{skill.proficiencyLevel}%</p>
          <p className="text-xs text-gray-400 capitalize">{skill.assessmentType}</p>
        </div>
      </div>
      
      <div className="w-full bg-gray-700 rounded-full h-2">
        <motion.div
          className={`h-2 rounded-full ${getColorByLevel(skill.proficiencyLevel)}`}
          initial={{ width: 0 }}
          animate={{ width: `${skill.proficiencyLevel}%` }}
          transition={{ duration: 1, delay: 0.2 }}
        />
      </div>
    </div>
  );
};

interface WeeklyProgressChartProps {
  data: {
    week: string;
    hoursSpent: number;
    resourcesCompleted: number;
  }[];
}

const WeeklyProgressChart: React.FC<WeeklyProgressChartProps> = ({ data }) => {
  const maxHours = Math.max(...data.map(d => d.hoursSpent));
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white flex items-center">
        <BarChart3 className="w-5 h-5 mr-2 text-cyan-400" />
        Weekly Progress
      </h3>
      
      <div className="space-y-3">
        {data.slice(-4).map((week, index) => (
          <div key={week.week} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">
                Week of {new Date(week.week).toLocaleDateString()}
              </span>
              <span className="text-white">
                {week.hoursSpent.toFixed(1)}h • {week.resourcesCompleted} completed
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <motion.div
                className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${(week.hoursSpent / maxHours) * 100}%` }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface RecentAchievementProps {
  achievement: {
    name: string;
    description: string;
    earnedAt: string;
    pointsAwarded: number;
    isFeatured: boolean;
  };
}

const RecentAchievement: React.FC<RecentAchievementProps> = ({ achievement }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`p-4 rounded-lg border ${
        achievement.isFeatured 
          ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30' 
          : 'bg-gray-800/50 border-gray-700'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="text-white font-medium flex items-center">
            <Award className={`w-4 h-4 mr-2 ${achievement.isFeatured ? 'text-yellow-400' : 'text-cyan-400'}`} />
            {achievement.name}
          </h4>
          <p className="text-gray-400 text-sm mt-1">{achievement.description}</p>
          <p className="text-xs text-gray-500 mt-2">
            {new Date(achievement.earnedAt).toLocaleDateString()}
          </p>
        </div>
        {achievement.pointsAwarded > 0 && (
          <span className="text-cyan-400 font-semibold text-sm">
            +{achievement.pointsAwarded}
          </span>
        )}
      </div>
    </motion.div>
  );
};

const ProgressOverview: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserProgressStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProgressStats = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const analyticsService = new ProgressAnalyticsService();
        const progressStats = await analyticsService.getUserProgressStats(user.id);
        setStats(progressStats);
      } catch (err) {
        console.error('Error fetching progress stats:', err);
        setError('Failed to load progress data');
      } finally {
        setLoading(false);
      }
    };

    fetchProgressStats();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-800/50 rounded-xl p-6 animate-pulse">
              <div className="w-8 h-8 bg-gray-700 rounded-lg mb-4"></div>
              <div className="w-16 h-8 bg-gray-700 rounded mb-2"></div>
              <div className="w-24 h-4 bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
        <p className="text-red-400">{error || 'No progress data available'}</p>
      </div>
    );
  }

  const formatTime = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    return `${hours.toFixed(1)}h`;
  };

  const totalResources = stats.completedResources + stats.inProgressResources;
  const completionRate = totalResources > 0 ? Math.round((stats.completedResources / totalResources) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ProgressCard
          title="Learning Streak"
          value={stats.currentStreak.toString()}
          subtitle={`Best: ${stats.longestStreak} days`}
          icon={<Zap className="w-6 h-6" />}
          trend={{
            value: Math.round(((stats.currentStreak / Math.max(stats.longestStreak, 1)) * 100)),
            isPositive: stats.currentStreak > 0
          }}
        />
        
        <ProgressCard
          title="Time Invested"
          value={formatTime(stats.totalTimeSpent)}
          subtitle="Total learning time"
          icon={<Clock className="w-6 h-6" />}
        />
        
        <ProgressCard
          title="Completed"
          value={stats.completedResources.toString()}
          subtitle={`${completionRate}% completion rate`}
          icon={<BookOpen className="w-6 h-6" />}
          trend={{
            value: completionRate,
            isPositive: completionRate > 50
          }}
        />
        
        <ProgressCard
          title="Achievements"
          value={stats.achievements.length.toString()}
          subtitle={`${stats.achievements.filter(a => a.isFeatured).length} featured`}
          icon={<Award className="w-6 h-6" />}
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Skill Proficiencies */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-cyan-400" />
              Skill Proficiencies
            </h3>
            
            <div className="space-y-4">
              {stats.skillProficiencies.slice(0, 5).map((skill, index) => (
                <SkillProficiencyBar key={`${skill.skillCategory}-${skill.skillName}-${index}`} skill={skill} />
              ))}
              
              {stats.skillProficiencies.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-4">
                  Complete assessments to see your skill levels
                </p>
              )}
            </div>
          </div>

          {/* Learning Goals */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-cyan-400" />
              Active Goals
            </h3>
            
            <div className="space-y-3">
              {stats.learningGoals.filter(goal => goal.status === 'active').slice(0, 3).map((goal) => (
                <div key={goal.id} className="p-3 bg-gray-700/30 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-white font-medium text-sm">{goal.title}</h4>
                    <span className="text-cyan-400 text-sm">{goal.currentProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-1.5">
                    <motion.div
                      className="h-1.5 rounded-full bg-cyan-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${goal.currentProgress}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                  {goal.targetDate && (
                    <p className="text-xs text-gray-400 mt-2">
                      <Calendar className="w-3 h-3 inline mr-1" />
                      Due: {new Date(goal.targetDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
              
              {stats.learningGoals.filter(goal => goal.status === 'active').length === 0 && (
                <p className="text-gray-400 text-sm text-center py-4">
                  Set learning goals to track your progress
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Weekly Progress & Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Weekly Progress Chart */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <WeeklyProgressChart data={stats.weeklyProgress} />
          </div>

          {/* Recent Achievements */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2 text-cyan-400" />
              Recent Achievements
            </h3>
            
            <div className="space-y-3">
              {stats.achievements.slice(0, 3).map((achievement) => (
                <RecentAchievement key={achievement.id} achievement={achievement} />
              ))}
              
              {stats.achievements.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-4">
                  Complete activities to earn achievements
                </p>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
            
            <div className="space-y-3">
              {stats.recentActivity.slice(0, 5).map((activity) => (
                <div key={activity.date} className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{new Date(activity.date).toLocaleDateString()}</p>
                    <p className="text-gray-400 text-sm">
                      {activity.activitiesCompleted} activities • {activity.resourcesAccessed} resources
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-cyan-400 font-semibold">{formatTime(activity.timeSpent)}</p>
                    <p className="text-gray-400 text-xs">
                      {activity.bookmarksAdded} bookmarks
                    </p>
                  </div>
                </div>
              ))}
              
              {stats.recentActivity.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-4">
                  Start learning to see your activity
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressOverview;