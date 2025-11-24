import { PlayerProfile } from "@/types";
import { create } from "zustand";

type State = {
  profile?: PlayerProfile;
  leaderboard: PlayerProfile[];
};

type Actions = {
  setProfile: (profile?: PlayerProfile) => void;
  setLeaderboard: (entries: PlayerProfile[]) => void;
};

export const useProfileStore = create<State & Actions>()((set) => ({
  profile: undefined,
  leaderboard: [],
  setProfile: (profile) => set({ profile }),
  setLeaderboard: (leaderboard) => set({ leaderboard }),
}));
