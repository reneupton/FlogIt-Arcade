'use server'

import { OwnedHero, PlayerProfile } from "@/types";
import { fetchWrapper } from "../lib/fetchWrapper";

export type SummonResult = {
  profile: PlayerProfile;
  hero?: OwnedHero | null;
  goldAwarded: number;
  rarity: string;
};

export async function getMyProgress(): Promise<PlayerProfile | null> {
  try {
    const res = await fetchWrapper.get("progress/me");
    if ((res as any)?.error) return null;
    return res as PlayerProfile;
  } catch {
    return null;
  }
}

export async function awardGamification(action: string, amount?: number): Promise<PlayerProfile | null> {
  try {
    const res = await fetchWrapper.post("progress/award", { action, amount });
    if ((res as any)?.error) return null;
    return res as PlayerProfile;
  } catch {
    return null;
  }
}

export async function getLeaderboard(): Promise<PlayerProfile[]> {
  try {
    const res = await fetchWrapper.get("progress/leaderboard");
    if ((res as any)?.error) return [];
    return res as PlayerProfile[];
  } catch {
    return [];
  }
}

export async function openMysteryBox(): Promise<SummonResult | null> {
  try {
    const res = await fetchWrapper.post("progress/mystery", {});
    if ((res as any)?.error) return null;
    const result = res as { profile: PlayerProfile; hero?: OwnedHero; goldAwarded: number; rarity: string };
    return {
      profile: result.profile,
      hero: result.hero,
      goldAwarded: result.goldAwarded,
      rarity: result.rarity,
    };
  } catch {
    return null;
  }
}

export async function summonHero(username: string): Promise<SummonResult | null> {
  try {
    const res = await fetchWrapper.post("progress/mystery", {});
    if ((res as any)?.error) return null;
    const result = res as { profile: PlayerProfile; hero?: OwnedHero; goldAwarded: number; rarity: string };
    return {
      profile: result.profile,
      hero: result.hero,
      goldAwarded: result.goldAwarded,
      rarity: result.rarity,
    };
  } catch {
    return null;
  }
}
