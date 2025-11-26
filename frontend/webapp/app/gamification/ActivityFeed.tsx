'use client';

import { useEffect, useState } from 'react';
import { gamificationService } from '../services/gamificationService';
import {
  FaShoppingCart,
  FaTag,
  FaTrophy,
  FaStar,
  FaGift,
  FaCoins,
  FaUserPlus,
} from 'react-icons/fa';

type ActivityType =
  | 'purchase'
  | 'listing'
  | 'achievement'
  | 'level_up'
  | 'quest_complete'
  | 'mystery_box'
  | 'new_user';

type Activity = {
  id: string;
  userId: string;
  username: string;
  activityType: ActivityType;
  description: string;
  metadata?: {
    itemName?: string;
    amount?: number;
    level?: number;
    achievementName?: string;
    questName?: string;
    boxTier?: string;
  };
  timestamp: string;
  createdAt: string;
};

type Props = {
  userId?: string;
  limit?: number;
  showUserOnly?: boolean;
};

export default function ActivityFeed({
  userId,
  limit = 50,
  showUserOnly = false,
}: Props) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const data = showUserOnly && userId
          ? await gamificationService.getUserActivity(userId, limit)
          : await gamificationService.getRecentActivity(limit);
        setActivities(data);
      } catch (err) {
        console.error('Failed to load activity feed:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchActivities, 30000);
    return () => clearInterval(interval);
  }, [userId, limit, showUserOnly]);

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'purchase':
        return <FaShoppingCart className="text-green-400" />;
      case 'listing':
        return <FaTag className="text-blue-400" />;
      case 'achievement':
        return <FaTrophy className="text-yellow-400" />;
      case 'level_up':
        return <FaStar className="text-purple-400" />;
      case 'quest_complete':
        return <FaGift className="text-pink-400" />;
      case 'mystery_box':
        return <FaCoins className="text-orange-400" />;
      case 'new_user':
        return <FaUserPlus className="text-cyan-400" />;
      default:
        return <FaCoins className="text-gray-400" />;
    }
  };

  const getActivityColor = (type: ActivityType) => {
    switch (type) {
      case 'purchase':
        return 'border-green-500/30 bg-green-500/5';
      case 'listing':
        return 'border-blue-500/30 bg-blue-500/5';
      case 'achievement':
        return 'border-yellow-500/30 bg-yellow-500/5';
      case 'level_up':
        return 'border-purple-500/30 bg-purple-500/5';
      case 'quest_complete':
        return 'border-pink-500/30 bg-pink-500/5';
      case 'mystery_box':
        return 'border-orange-500/30 bg-orange-500/5';
      case 'new_user':
        return 'border-cyan-500/30 bg-cyan-500/5';
      default:
        return 'border-gray-700 bg-gray-800/50';
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const secondsAgo = Math.floor((now.getTime() - activityTime.getTime()) / 1000);

    if (secondsAgo < 60) return 'Just now';
    if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)}m ago`;
    if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)}h ago`;
    if (secondsAgo < 604800) return `${Math.floor(secondsAgo / 86400)}d ago`;
    return activityTime.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-xl p-6 shadow-2xl border border-gray-800">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-48 mb-6"></div>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-800 rounded mb-2"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-xl p-6 shadow-2xl border border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <FaCoins className="text-orange-400" />
          {showUserOnly ? 'Your Activity' : 'Live Activity Feed'}
        </h2>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-400">Live</span>
        </div>
      </div>

      {/* Activity List */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {activities.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FaCoins className="text-5xl mx-auto mb-3 opacity-30" />
            <p>No recent activity</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className={`flex items-start gap-4 p-4 rounded-lg border transition-all hover:scale-[1.01] ${getActivityColor(
                activity.activityType
              )}`}
            >
              {/* Icon */}
              <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0 text-xl">
                {getActivityIcon(activity.activityType)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-white text-sm">
                    <span className="font-semibold text-blue-400">
                      {activity.username}
                    </span>{' '}
                    {activity.description}
                  </p>
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {getTimeAgo(activity.timestamp)}
                  </span>
                </div>

                {/* Metadata */}
                {activity.metadata && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {activity.metadata.itemName && (
                      <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">
                        {activity.metadata.itemName}
                      </span>
                    )}
                    {activity.metadata.amount !== undefined && (
                        <span className="text-xs bg-[rgba(245,158,11,0.25)] text-[var(--accent-2)] px-2 py-1 rounded font-semibold">
                          {activity.metadata.amount.toLocaleString()} Gold
                        </span>
                    )}
                    {activity.metadata.level !== undefined && (
                      <span className="text-xs bg-purple-900/30 text-purple-400 px-2 py-1 rounded font-semibold">
                        Level {activity.metadata.level}
                      </span>
                    )}
                    {activity.metadata.achievementName && (
                      <span className="text-xs bg-yellow-900/30 text-yellow-400 px-2 py-1 rounded">
                        {activity.metadata.achievementName}
                      </span>
                    )}
                    {activity.metadata.questName && (
                      <span className="text-xs bg-pink-900/30 text-pink-400 px-2 py-1 rounded">
                        {activity.metadata.questName}
                      </span>
                    )}
                    {activity.metadata.boxTier && (
                      <span className="text-xs bg-orange-900/30 text-orange-400 px-2 py-1 rounded">
                        {activity.metadata.boxTier} Box
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-800 text-center">
        <p className="text-xs text-gray-500">
          Showing {activities.length} recent {showUserOnly ? 'activities' : 'marketplace events'}
        </p>
      </div>
    </div>
  );
}
