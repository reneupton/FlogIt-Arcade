'use client';

import { useState } from 'react';
import { gamificationService } from '../services/gamificationService';
import { FaGift, FaCoins, FaStar, FaLock } from 'react-icons/fa';
import RarityBadge, { RarityBorder } from './RarityBadge';
import toast from 'react-hot-toast';

type BoxTier = 'Bronze' | 'Silver' | 'Gold';

type MysteryBoxType = {
  id: string;
  tier: BoxTier;
  name: string;
  description: string;
  cost: number;
  guaranteedRarity?: string;
};

type BoxReward = {
  itemName: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
  flogValue: number;
  bonusXP: number;
};

type Props = {
  userId: string;
  userBalance: number;
  onPurchase?: () => void;
};

export default function MysteryBox({ userId, userBalance, onPurchase }: Props) {
  const [opening, setOpening] = useState(false);
  const [selectedBox, setSelectedBox] = useState<MysteryBoxType | null>(null);
  const [rewards, setRewards] = useState<BoxReward[]>([]);
  const [showRewards, setShowRewards] = useState(false);

  const boxes: MysteryBoxType[] = [
    {
      id: 'bronze',
      tier: 'Bronze',
      name: 'Bronze Mystery Box',
      description: 'Common items with a chance for rare finds',
      cost: 100,
    },
    {
      id: 'silver',
      tier: 'Silver',
      name: 'Silver Mystery Box',
      description: 'Guaranteed uncommon or better',
      cost: 500,
      guaranteedRarity: 'Uncommon',
    },
    {
      id: 'gold',
      tier: 'Gold',
      name: 'Gold Mystery Box',
      description: 'High chance for epic and legendary items',
      cost: 1500,
      guaranteedRarity: 'Rare',
    },
  ];

  const getTierConfig = (tier: BoxTier) => {
    switch (tier) {
      case 'Bronze':
        return {
          gradient: 'from-[rgba(245,158,11,0.28)] to-[rgba(245,158,11,0.12)]',
          borderColor: 'border-[rgba(245,158,11,0.6)]',
          iconColor: 'text-[var(--accent-2)]',
          glowColor: 'shadow-[0_15px_40px_rgba(245,158,11,0.25)]',
        };
      case 'Silver':
        return {
          gradient: 'from-[rgba(255,255,255,0.18)] to-[rgba(255,255,255,0.05)]',
          borderColor: 'border-[rgba(255,255,255,0.35)]',
          iconColor: 'text-[var(--accent-3)]',
          glowColor: 'shadow-[0_15px_40px_rgba(255,255,255,0.18)]',
        };
      case 'Gold':
        return {
          gradient: 'from-[rgba(139,92,246,0.35)] to-[rgba(34,211,238,0.25)]',
          borderColor: 'border-[var(--accent)]',
          iconColor: 'text-[var(--accent)]',
          glowColor: 'shadow-[0_15px_40px_rgba(139,92,246,0.28)]',
        };
    }
  };

  const handleOpenBox = async (box: MysteryBoxType) => {
    if (userBalance < box.cost) {
      toast.error('Insufficient Gold balance!');
      return;
    }

    try {
      setSelectedBox(box);
      setOpening(true);
      setShowRewards(false);

      // Simulate opening animation delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const result = await gamificationService.openBox(userId, box.id);

      setRewards(result.rewards);
      setShowRewards(true);

      toast.success(
        `Opened ${box.name}! Received ${result.rewards.length} items!`,
        {
          icon: '🎁',
          duration: 4000,
        }
      );

      if (onPurchase) {
        onPurchase();
      }
    } catch (err) {
      toast.error('Failed to open mystery box');
      console.error(err);
    } finally {
      setTimeout(() => {
        setOpening(false);
        setSelectedBox(null);
      }, 5000);
    }
  };

  const handleCloseRewards = () => {
    setShowRewards(false);
    setRewards([]);
    setSelectedBox(null);
  };

  return (
    <div className="glass-panel rounded-2xl p-6 shadow-2xl border border-[var(--card-border)] text-[var(--text)]">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2 mb-2">
          <FaGift className="text-[var(--accent)]" />
          Mystery Boxes
        </h2>
        <p className="text-[var(--muted)] text-sm">
          Take a chance on random loot! Higher tier boxes guarantee better rewards.
        </p>
      </div>

      {/* User Balance */}
      <div className="rounded-xl p-4 mb-6 border border-[var(--card-border)] bg-[rgba(26,32,48,0.65)]">
        <div className="flex items-center justify-between">
          <span className="text-[var(--muted)]">Your Balance</span>
          <div className="flex items-center gap-2 text-[var(--accent-2)] font-bold text-lg">
            <FaCoins />
            {userBalance.toLocaleString()} Gold
          </div>
        </div>
      </div>

      {/* Box Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {boxes.map((box) => {
          const config = getTierConfig(box.tier);
          const canAfford = userBalance >= box.cost;

          return (
            <div
              key={box.id}
              className={`relative bg-gradient-to-br ${config.gradient} rounded-xl p-6 border-2 ${
                config.borderColor
              } transition-all ${
                canAfford
                  ? `hover:scale-105 cursor-pointer shadow-lg ${config.glowColor}`
                  : 'opacity-50 cursor-not-allowed'
              }`}
              onClick={() => canAfford && !opening && handleOpenBox(box)}
            >
              {/* Lock overlay for unaffordable boxes */}
              {!canAfford && (
                <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                  <FaLock className="text-4xl text-[var(--muted)]" />
                </div>
              )}

              {/* Box icon */}
              <div className="text-center mb-4">
                <FaGift className={`text-6xl ${config.iconColor} mx-auto mb-2`} />
                <h3 className="text-[var(--text)] font-bold text-lg">{box.name}</h3>
              </div>

              {/* Description */}
              <p className="text-[var(--muted)] text-sm text-center mb-4">
                {box.description}
              </p>

              {/* Guaranteed rarity */}
              {box.guaranteedRarity && (
                <div className="flex justify-center mb-4">
                  <RarityBadge
                    rarity={box.guaranteedRarity as any}
                    size="sm"
                    showGlow
                  />
                </div>
              )}

              {/* Cost */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-[var(--accent-2)] font-bold text-xl">
                  <FaCoins />
                  {box.cost.toLocaleString()}
                </div>
                <div className="text-[var(--muted)] text-xs mt-1">Gold</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Opening Animation */}
      {opening && selectedBox && !showRewards && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-bounce mb-6">
              <FaGift
                className={`text-9xl ${
                  getTierConfig(selectedBox.tier).iconColor
                } animate-pulse`}
              />
            </div>
            <h3 className="text-[var(--text)] text-2xl font-bold mb-2">
              Opening {selectedBox.name}...
            </h3>
            <div className="flex items-center justify-center gap-2">
              <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-white rounded-full animate-bounce delay-100"></div>
              <div className="w-3 h-3 bg-white rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        </div>
      )}

      {/* Rewards Display */}
      {showRewards && rewards.length > 0 && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="glass-panel rounded-2xl p-8 max-w-2xl w-full border border-[var(--card-border)]">
            <h3 className="text-3xl font-bold text-[var(--text)] mb-6 text-center flex items-center justify-center gap-3">
              <FaStar className="text-[var(--accent-2)]" />
              Your Rewards!
              <FaStar className="text-[var(--accent-2)]" />
            </h3>

            {/* Rewards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {rewards.map((reward, index) => (
                <RarityBorder
                  key={index}
                  rarity={reward.rarity}
                  showGlow
                  showShimmer={reward.rarity === 'Legendary'}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-[var(--text)] font-semibold">{reward.itemName}</h4>
                      <RarityBadge rarity={reward.rarity} size="xs" />
                    </div>
                    <div className="flex gap-3 text-sm">
                      <div className="flex items-center gap-1 text-[var(--accent-2)]">
                        <FaCoins />
                        <span>{reward.flogValue.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[var(--accent)]">
                        <FaStar />
                        <span>+{reward.bonusXP} XP</span>
                      </div>
                    </div>
                  </div>
                </RarityBorder>
              ))}
            </div>

            {/* Total Value */}
            <div className="rounded-lg p-4 mb-4 border border-[var(--card-border)] bg-[rgba(26,32,48,0.65)]">
              <div className="text-center">
                <div className="text-[var(--muted)] text-sm mb-1">Total Value</div>
                <div className="flex items-center justify-center gap-4">
                  <div className="flex items-center gap-2 text-[var(--accent-2)] font-bold text-xl">
                    <FaCoins />
                    {rewards.reduce((sum, r) => sum + r.flogValue, 0).toLocaleString()}
                  </div>
                  <div className="flex items-center gap-2 text-[var(--accent)] font-bold text-xl">
                    <FaStar />
                    +{rewards.reduce((sum, r) => sum + r.bonusXP, 0)} XP
                  </div>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={handleCloseRewards}
              className="w-full soft-button py-3 rounded-xl justify-center"
            >
              Claim Rewards
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
