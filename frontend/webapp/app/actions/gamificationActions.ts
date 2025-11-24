'use server'

import { PlayerProfile } from "@/types";
import { fetchWrapper } from "../lib/fetchWrapper";

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

export async function openMysteryBox(): Promise<PlayerProfile | null> {
  try {
    const res = await fetchWrapper.post("progress/mystery", {});
    if ((res as any)?.error) return null;
    return res as PlayerProfile;
  } catch {
    return null;
  }
}
