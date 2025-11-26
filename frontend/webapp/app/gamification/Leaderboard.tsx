'use client';

import { useEffect, useState } from 'react';
import { gamificationService } from '../services/gamificationService';
import { FaTrophy, FaMedal, FaAward, FaCoins, FaStar } from 'react-icons/fa';

type LeaderboardEntry = {
  userId: string;
  username: string;
  level: number;
  xp: number;
  title: string;
  flogBalance: number;
  achievementCount: number;
  rank: number;
};

type Props = {
  userId?: string;
  limit?: number;
};

export default function Leaderboard({ userId, limit = 100 }: Props) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'level' | 'flog' | 'achievements'>('level');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const data = await gamificationService.getLeaderboard(limit);
        setLeaderboard(data);
      } catch (err) {
        console.error('Failed to load leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [limit]);

  const sortedLeaderboard = [...leaderboard].sort((a, b) => {
    switch (activeTab) {
      case 'level':
        return b.level !== a.level ? b.level - a.level : b.xp - a.xp;
      case 'flog':
        return b.flogBalance - a.flogBalance;
      case 'achievements':
        return b.achievementCount - a.achievementCount;
      default:
        return 0;
    }
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <FaTrophy className="text-[var(--accent-2)] text-2xl" />;
      case 2:
        return <FaMedal className="text-[var(--accent-3)] text-2xl" />;
      case 3:
        return <FaMedal className="text-[var(--accent)] text-2xl" />;
      default:
        return <span className="text-[var(--muted)] font-bold">#{rank}</span>;
    }
  };

  const getRankBgClass = (rank: number, isCurrentUser: boolean) => {
    if (isCurrentUser) {
      return 'bg-[rgba(34,211,238,0.08)] border-[var(--accent-3)]';
    }
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-[rgba(245,158,11,0.24)] to-[rgba(245,158,11,0.12)] border-[rgba(245,158,11,0.6)]';
      case 2:
        return 'bg-gradient-to-r from-[rgba(34,211,238,0.18)] to-[rgba(139,92,246,0.14)] border-[rgba(34,211,238,0.5)]';
      case 3:
        return 'bg-gradient-to-r from-[rgba(139,92,246,0.24)] to-[rgba(245,158,11,0.14)] border-[var(--accent)]';
      default:
        return 'bg-[rgba(26,32,48,0.7)] border-[var(--card-border)]';
    }
  };

  if (loading) {
    return (
      <div className="glass-panel rounded-xl p-6 shadow-2xl border border-[var(--card-border)]">
        <div className="animate-pulse">
          <div className="h-8 bg-[rgba(255,255,255,0.06)] rounded w-48 mb-6"></div>
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-16 bg-[rgba(255,255,255,0.04)] rounded mb-2"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-xl p-6 shadow-2xl border border-[var(--card-border)] text-[var(--text)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FaTrophy className="text-[var(--accent-2)]" />
          Leaderboard
        </h2>
        <div className="text-sm text-[var(--muted)]">Top {limit} Players</div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setActiveTab('level')}
          className={`chip ${activeTab === 'level' ? 'chip-active' : ''}`}
        >
          <FaStar className="inline mr-2" />
          Level
        </button>
        <button
          onClick={() => setActiveTab('flog')}
          className={`chip ${activeTab === 'flog' ? 'chip-active' : ''}`}
        >
          <FaCoins className="inline mr-2" />
          Gold
        </button>
        <button
          onClick={() => setActiveTab('achievements')}
          className={`chip ${activeTab === 'achievements' ? 'chip-active' : ''}`}
        >
          <FaAward className="inline mr-2" />
          Achievements
        </button>
      </div>

      {/* Leaderboard List */}
      <div className="space-y-2 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-glow">
        {sortedLeaderboard.length === 0 ? (
          <div className="text-center py-12 text-[var(--muted)]">
            <FaTrophy className="text-5xl mx-auto mb-3 opacity-30" />
            <p>No leaderboard data available</p>
          </div>
        ) : (
          sortedLeaderboard.map((entry, index) => {
            const rank = index + 1;
            const isCurrentUser = userId === entry.userId;
            return (
              <div
                key={entry.userId}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-all hover:scale-[1.02] ${getRankBgClass(
                  rank,
                  isCurrentUser
                )}`}
              >
                {/* Rank */}
                <div className="w-12 flex items-center justify-center">
                  {getRankIcon(rank)}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-[var(--text)] font-semibold truncate">
                      {entry.username}
                      {isCurrentUser && (
                        <span className="ml-2 text-xs text-[var(--accent-3)]">(You)</span>
                      )}
                    </h3>
                  </div>
                  <div className="text-sm text-[var(--muted)]">{entry.title}</div>
                </div>

                {/* Stats */}
                <div className="flex gap-6 text-sm">
                  {activeTab === 'level' && (
                    <>
                      <div className="text-center">
                        <div className="text-[var(--accent)] font-bold text-lg">
                          {entry.level}
                        </div>
                        <div className="text-[var(--muted)] text-xs">Level</div>
                      </div>
                      <div className="text-center">
                        <div className="text-[var(--accent-3)] font-semibold">
                          {entry.xp.toLocaleString()}
                        </div>
                        <div className="text-[var(--muted)] text-xs">XP</div>
                      </div>
                    </>
                  )}
                  {activeTab === 'flog' && (
                    <>
                      <div className="text-center">
                        <div className="text-[var(--accent-2)] font-bold text-lg">
                          {entry.flogBalance.toLocaleString()}
                        </div>
                        <div className="text-[var(--muted)] text-xs">Gold</div>
                      </div>
                      <div className="text-center">
                        <div className="text-[var(--accent)] font-semibold">
                          {entry.level}
                        </div>
                        <div className="text-[var(--muted)] text-xs">Level</div>
                      </div>
                    </>
                  )}
                  {activeTab === 'achievements' && (
                    <>
                      <div className="text-center">
                        <div className="text-[var(--accent-3)] font-bold text-lg">
                          {entry.achievementCount}
                        </div>
                        <div className="text-[var(--muted)] text-xs">Unlocks</div>
                      </div>
                      <div className="text-center">
                        <div className="text-[var(--accent-2)] font-semibold">
                          {entry.level}
                        </div>
                        <div className="text-[var(--muted)] text-xs">Level</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* User's Current Rank */}
      {userId && !sortedLeaderboard.some((e) => e.userId === userId) && (
        <div className="mt-4 pt-4 border-t border-[var(--card-border)]">
          <div className="text-sm text-[var(--muted)] text-center">
            You are not currently ranked in the top {limit}
          </div>
        </div>
      )}
    </div>
  );
}
