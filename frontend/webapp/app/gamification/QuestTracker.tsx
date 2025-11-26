'use client';

import { useEffect, useState } from 'react';
import { useGamificationStore } from '@/hooks/useGamificationStore';
import { gamificationService } from '../services/gamificationService';
import { FaCheckCircle, FaClock, FaCoins, FaStar, FaGift } from 'react-icons/fa';
import toast from 'react-hot-toast';

type Props = {
  userId: string;
};

export default function QuestTracker({ userId }: Props) {
  const { questProgress, setQuestProgress } = useGamificationStore();
  const [claiming, setClaiming] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuests = async () => {
      try {
        const data = await gamificationService.getUserQuestProgress(userId);
        setQuestProgress(data);
      } catch (err) {
        console.error('Failed to load quests:', err);
      }
    };

    if (userId) {
      fetchQuests();
    }
  }, [userId, setQuestProgress]);

  const handleClaimReward = async (questProgressId: string, questName: string) => {
    try {
      setClaiming(questProgressId);
      const result = await gamificationService.claimQuestReward(userId, questProgressId);

      toast.success(`Quest completed! +${result.flogRewarded} Gold, +${result.xpRewarded} XP`, {
        icon: '🎉',
        duration: 4000,
      });

      // Refresh quests
      const data = await gamificationService.getUserQuestProgress(userId);
      setQuestProgress(data);
    } catch (err) {
      toast.error('Failed to claim reward');
    } finally {
      setClaiming(null);
    }
  };

  const getProgressPercentage = (progress: number, target: number) => {
    return Math.min((progress / target) * 100, 100);
  };

  return (
    <div className="glass-panel rounded-2xl p-6 shadow-2xl border border-[var(--card-border)] text-[var(--text)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-[var(--text)]">
          <FaClock className="text-[var(--accent-3)]" />
          Daily Quests
        </h2>
        <div className="text-sm text-[var(--muted)]">
          Resets in{' '}
          <span className="text-[var(--text)] font-semibold">
            {new Date(new Date().setHours(24, 0, 0, 0) - Date.now()).getHours()}h
          </span>
        </div>
      </div>

      {/* Quest List */}
      <div className="space-y-4">
        {questProgress.length === 0 ? (
          <div className="text-center py-8 text-[var(--muted)]">
            <FaGift className="text-4xl mx-auto mb-2 opacity-50 text-[var(--accent)]" />
            <p>No quests available</p>
          </div>
        ) : (
          questProgress.map((qp) => (
            <div
              key={qp.id}
              className={`rounded-xl p-4 border transition-all bg-[rgba(26,32,48,0.7)] backdrop-blur ${
                qp.completed
                  ? 'border-[var(--accent-3)] shadow-[0_0_25px_rgba(34,211,238,0.25)]'
                  : 'border-[var(--card-border)] hover:border-[var(--accent)]'
              }`}
            >
              {/* Quest Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-[var(--text)] font-semibold">{qp.quest.name}</h3>
                    {qp.completed && (
                      <FaCheckCircle className="text-[var(--accent-3)]" />
                    )}
                  </div>
                  <p className="text-sm text-[var(--muted)]">{qp.quest.description}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-[var(--muted)] mb-1">
                  <span>Progress</span>
                  <span>
                    {qp.progress} / {qp.target}
                  </span>
                </div>
                <div className="relative h-2 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden border border-[var(--card-border)]">
                  <div
                    className={`absolute top-0 left-0 h-full transition-all duration-500 ${
                      qp.completed
                        ? 'bg-gradient-to-r from-[var(--accent-3)] to-[var(--accent)]'
                        : 'bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)]'
                    }`}
                    style={{ width: `${getProgressPercentage(qp.progress, qp.target)}%` }}
                  ></div>
                </div>
              </div>

              {/* Rewards and Actions */}
              <div className="flex items-center justify-between">
                <div className="flex gap-3 text-sm">
                  <div className="flex items-center gap-1 text-[var(--accent-2)]">
                    <FaCoins />
                    <span className="font-semibold">+{qp.quest.flogReward}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[var(--accent)]">
                    <FaStar />
                    <span className="font-semibold">+{qp.quest.xpReward} XP</span>
                  </div>
                </div>

                {qp.completed && !qp.claimed && (
                  <button
                    onClick={() => handleClaimReward(qp.id, qp.quest.name)}
                    disabled={claiming === qp.id}
                    className="soft-button px-5 py-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {claiming === qp.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/70 border-t-transparent rounded-full animate-spin"></div>
                        Claiming...
                      </>
                    ) : (
                      <>
                        <FaGift />
                        Claim Reward
                      </>
                    )}
                  </button>
                )}

                {qp.claimed && (
                  <div className="text-sm text-[var(--muted)] italic flex items-center gap-1">
                    <FaCheckCircle className="text-[var(--accent-3)]" />
                    Claimed
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
