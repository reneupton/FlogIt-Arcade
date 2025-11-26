const BASE_URL = process.env.NEXT_PUBLIC_GAMIFICATION_API_URL || 'http://localhost:7004';

export const gamificationService = {
  // Wallet endpoints
  async getWallet(userId: string) {
    const res = await fetch(`${BASE_URL}/api/wallet/${userId}`);
    if (!res.ok) throw new Error('Failed to fetch wallet');
    return res.json();
  },

  async getBalance(userId: string) {
    const res = await fetch(`${BASE_URL}/api/wallet/${userId}/balance`);
    if (!res.ok) throw new Error('Failed to fetch balance');
    return res.json();
  },

  async getTransactionHistory(userId: string, limit = 50) {
    const res = await fetch(`${BASE_URL}/api/wallet/${userId}/transactions?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch transactions');
    return res.json();
  },

  async stakeFlog(userId: string, amount: number) {
    const res = await fetch(`${BASE_URL}/api/wallet/${userId}/stake`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    });
    if (!res.ok) throw new Error('Failed to stake Gold');
    return res.json();
  },

  async unstakeFlog(userId: string, amount: number) {
    const res = await fetch(`${BASE_URL}/api/wallet/${userId}/unstake`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    });
    if (!res.ok) throw new Error('Failed to unstake Gold');
    return res.json();
  },

  // Gamification endpoints
  async getUserGamification(userId: string) {
    const res = await fetch(`${BASE_URL}/api/gamification/${userId}`);
    if (!res.ok) throw new Error('Failed to fetch user gamification');
    return res.json();
  },

  async addExperience(userId: string, amount: number) {
    const res = await fetch(`${BASE_URL}/api/gamification/${userId}/xp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    });
    if (!res.ok) throw new Error('Failed to add experience');
    return res.json();
  },

  async updateLoginStreak(userId: string) {
    const res = await fetch(`${BASE_URL}/api/gamification/${userId}/login`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to update login streak');
    return res.json();
  },

  async getLeaderboard(limit = 100) {
    const res = await fetch(`${BASE_URL}/api/gamification/leaderboard?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch leaderboard');
    return res.json();
  },

  // Quest endpoints
  async getDailyQuests() {
    const res = await fetch(`${BASE_URL}/api/quests/daily`);
    if (!res.ok) throw new Error('Failed to fetch daily quests');
    return res.json();
  },

  async getUserQuestProgress(userId: string) {
    const res = await fetch(`${BASE_URL}/api/quests/${userId}/progress`);
    if (!res.ok) throw new Error('Failed to fetch quest progress');
    return res.json();
  },

  async updateQuestProgress(userId: string, questType: string, incrementAmount = 1) {
    const res = await fetch(`${BASE_URL}/api/quests/${userId}/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questType, incrementAmount }),
    });
    if (!res.ok) throw new Error('Failed to update quest progress');
    return res.json();
  },

  async claimQuestReward(userId: string, questProgressId: string) {
    const res = await fetch(`${BASE_URL}/api/quests/${userId}/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questProgressId }),
    });
    if (!res.ok) throw new Error('Failed to claim quest reward');
    return res.json();
  },

  // Achievement endpoints
  async getAllAchievements() {
    const res = await fetch(`${BASE_URL}/api/achievements`);
    if (!res.ok) throw new Error('Failed to fetch achievements');
    return res.json();
  },

  async getUserAchievements(userId: string) {
    const res = await fetch(`${BASE_URL}/api/achievements/${userId}`);
    if (!res.ok) throw new Error('Failed to fetch user achievements');
    return res.json();
  },

  async unlockAchievement(userId: string, achievementId: string) {
    const res = await fetch(`${BASE_URL}/api/achievements/${userId}/unlock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ achievementId }),
    });
    if (!res.ok) throw new Error('Failed to unlock achievement');
    return res.json();
  },

  // Activity feed endpoints
  async getRecentActivity(limit = 50) {
    const res = await fetch(`${BASE_URL}/api/activityfeed?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch activity feed');
    return res.json();
  },

  async getUserActivity(userId: string, limit = 50) {
    const res = await fetch(`${BASE_URL}/api/activityfeed/${userId}?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch user activity');
    return res.json();
  },

  // Mystery box endpoints
  async getAllMysteryBoxes() {
    const res = await fetch(`${BASE_URL}/api/mysteryboxes`);
    if (!res.ok) throw new Error('Failed to fetch mystery boxes');
    return res.json();
  },

  async openBox(userId: string, boxId: string) {
    const res = await fetch(`${BASE_URL}/api/mysteryboxes/${userId}/open`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ boxId }),
    });
    if (!res.ok) throw new Error('Failed to open mystery box');
    return res.json();
  },
};
