'use client';

import { useEffect } from 'react';
import { useWalletStore } from '@/hooks/useWalletStore';
import { gamificationService } from '../services/gamificationService';
import { FaCoins, FaLock, FaArrowUp, FaArrowDown } from 'react-icons/fa';

type Props = {
  userId: string;
  compact?: boolean;
};

export default function FlogWallet({ userId, compact = false }: Props) {
  const { wallet, loading, setWallet, setLoading, setError } = useWalletStore();

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        setLoading(true);
        const data = await gamificationService.getWallet(userId);
        setWallet(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load wallet');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchWallet();
    }
  }, [userId, setWallet, setLoading, setError]);

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-800 rounded-lg p-4">
        <div className="h-6 bg-gray-700 rounded w-24 mb-2"></div>
        <div className="h-8 bg-gray-700 rounded w-32"></div>
      </div>
    );
  }

  if (!wallet) return null;

  if (compact) {
    return (
      <div className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg">
        <FaCoins className="text-xl" />
        <span className="font-bold text-lg">
          {wallet.flogBalance.toLocaleString()}
        </span>
        <span className="text-sm opacity-90">Gold</span>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 shadow-2xl border border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <FaCoins className="text-yellow-500" />
          Gold Wallet
        </h2>
        <div className="text-sm text-gray-400">Demo Currency</div>
      </div>

      {/* Main Balance */}
      <div className="mb-6">
        <div className="text-gray-400 text-sm mb-1">Available Balance</div>
        <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
          {wallet.flogBalance.toLocaleString()}
        </div>
        <div className="text-gray-400 text-lg">Gold</div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
            <FaLock className="text-blue-400" />
            Staked
          </div>
          <div className="text-2xl font-bold text-white">
            {wallet.flogStaked.toLocaleString()}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
            <FaArrowUp className="text-green-400" />
            Total Earned
          </div>
          <div className="text-2xl font-bold text-green-400">
            {wallet.totalEarned.toLocaleString()}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
            <FaArrowDown className="text-red-400" />
            Total Spent
          </div>
          <div className="text-2xl font-bold text-red-400">
            {wallet.totalSpent.toLocaleString()}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-gray-400 text-sm mb-1">Net Profit</div>
          <div
            className={`text-2xl font-bold ${
              wallet.totalEarned - wallet.totalSpent >= 0
                ? 'text-green-400'
                : 'text-red-400'
            }`}
          >
            {(wallet.totalEarned - wallet.totalSpent).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Exchange Rates */}
      <div className="border-t border-gray-700 pt-4">
        <div className="text-gray-400 text-sm mb-2">Fake Exchange Rates</div>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="text-center">
            <div className="text-gray-500">GBP</div>
            <div className="text-white font-semibold">
              £{(wallet.flogBalance * wallet.flogToGBP).toFixed(2)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-gray-500">USD</div>
            <div className="text-white font-semibold">
              ${(wallet.flogBalance * wallet.flogToUSD).toFixed(2)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-gray-500">EUR</div>
            <div className="text-white font-semibold">
              €{(wallet.flogBalance * wallet.flogToEUR).toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
