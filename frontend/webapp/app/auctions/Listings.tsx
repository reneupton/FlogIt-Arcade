"use client";

import React, { useEffect, useState } from "react";
import AuctionCard from "./AuctionCard";
import { Auction, PagedResult } from "@/types";
import AppPagination from "../components/AppPagination";
import { getData } from "../actions/auctionActions";
import Filters from "./Filters";
import { useParamStore } from "@/hooks/useParamsStore";
import { shallow } from "zustand/shallow";
import qs from "query-string";
import EmptyFilter from "../components/EmptyFilter";
import { useAuctionStore } from "@/hooks/useAuctionStore";
import {isMobile} from 'react-device-detect';
import { User } from "next-auth";
import { useProfileStore } from "@/hooks/useProfileStore";
import Link from "next/link";
import Image from "next/image";
import { numberWithCommas } from "../lib/numberWithComma";
import { openMysteryBox } from "../actions/gamificationActions";


type Props = {
  user: User | null;
};

export default function Listings({ user }: Props) {
  const [loading, setLoading] = useState(true);
  const [reward, setReward] = useState<{xp: number; coins: number} | null>(null);
  const profile = useProfileStore((state) => state.profile);
  const leaderboard = useProfileStore((state) => state.leaderboard);
  const setProfile = useProfileStore((state) => state.setProfile);
  const progressPct = profile
    ? Math.min(
        100,
        Math.floor(((profile.experience ?? 0) / (profile.nextLevelAt || 1)) * 100)
      )
    : 0;
  const lastMystery = profile?.lastMysteryRewardAt ? new Date(profile.lastMysteryRewardAt).getTime() : 0;
  const now = Date.now();
  const windowMs = 24 * 60 * 60 * 1000;
  const elapsed = Math.max(0, now - lastMystery);
  const remaining = Math.max(0, windowMs - elapsed);
  const canOpen = remaining === 0;
  const cooldownProgress = Math.min(1, elapsed / windowMs);
  const recentReward =
    profile?.lastMysteryRewardAt &&
    remaining > 0 &&
    profile.lastMysteryRewardXp &&
    profile.lastMysteryRewardCoins
      ? { xp: profile.lastMysteryRewardXp, coins: profile.lastMysteryRewardCoins }
      : null;
  const params = useParamStore(
    (state) => ({
      pageNumber: state.pageNumber,
      pageSize: state.pageSize,
      searchTerm: state.searchTerm,
      orderBy: state.orderBy,
      filterBy: state.filterBy,
      seller: state.seller,
      winner: state.winner,
    }),
    shallow
  );
  const data = useAuctionStore(
    (state) => ({
      auctions: state.auctions,
      totalCount: state.totalCount,
      pageCount: state.pageCount,
    }),
    shallow
  );

  const setData = useAuctionStore(state => state.setData);

  const setParams = useParamStore((state) => state.setParams);
  const url = qs.stringifyUrl({ url: "", query: params });

  function setWinner(){
    if(!user?.username) return;
    setParams({winner: user.username, seller: undefined, filterBy: 'finished'})
  }
  
  function setSeller(){
    if(!user?.username) return;
    setParams({seller: user.username, winner: undefined, filterBy: 'live'})
  }

  async function handleMysteryBox() {
    if (!profile || !canOpen) return;
    const updated = await openMysteryBox();
    if (updated) {
      const xp = updated.lastMysteryRewardXp ?? 0;
      const coins = updated.lastMysteryRewardCoins ?? 0;
      setReward({ xp, coins });
      setProfile(updated);
    }
  }

  function setPageNumber(pageNumber: number) {
    setParams({ pageNumber: pageNumber });
  }

  useEffect(() => {
    getData(url).then((data) => {
      setData(data);
      setLoading(false);
    });
  }, [url, setData]);

  if (loading) return <h3>Loading ...</h3>;

  if(isMobile) return <h3> This website is not supported for mobile devices. Please use a desktop to preview this demo. You will be able to still see activity notifications. </h3>

  return (
    <>
      {user && (
        <div className="grid grid-cols-3 gap-4 items-stretch mb-6">
          {/* Profile */}
          <div className="glass-panel ios-shadow rounded-3xl p-5 border border-white/60 h-full flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="relative h-14 w-14">
                <div className="h-full w-full rounded-2xl overflow-hidden border border-white/70 shadow-lg bg-gradient-to-br from-[#5b7bff] to-[#9f7aea]" />
                <Image
                  src={profile?.avatarUrl ?? `https://api.dicebear.com/7.x/thumbs/svg?seed=${user.username}`}
                  alt="avatar"
                  fill
                  className="rounded-2xl object-cover"
                />
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/90 shadow text-slate-700">
                  Lv {profile?.level ?? 1}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs uppercase text-slate-500 tracking-wide">
                  Welcome back, {user.name ?? user.username}
                </span>
                <div className="text-xl font-bold text-slate-900">
                  FLOG IT - TECH
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="badge badge-positive">FLOG {numberWithCommas(profile?.flogBalance ?? 0)}</span>
                  <span className="badge">XP {numberWithCommas(profile?.experience ?? 0)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="h-2 bg-white/60 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#5b7bff] via-[#9f7aea] to-[#7dd3fc]"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {progressPct}% to level {(profile?.level ?? 1) + 1}
                </div>
              </div>
              <div className="text-[11px] text-slate-500">
                Sold: {profile?.auctionsSold ?? 0} • Won: {profile?.auctionsWon ?? 0} • Bids: {profile?.bidsPlaced ?? 0}
              </div>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/60 bg-white/80 px-4 py-3 shadow-sm">
              <div className="flex flex-col">
                <span className="text-xs uppercase text-slate-500 tracking-wide">Daily Mystery Box</span>
                <span className="text-sm font-semibold text-slate-800">
                  {recentReward && !canOpen
                    ? `+${recentReward.xp} XP • +${recentReward.coins} FLOG`
                    : reward
                    ? `+${reward.xp} XP • +${reward.coins} FLOG`
                    : canOpen
                    ? "Tap to reveal today's bonus"
                    : "Come back tomorrow"}
                </span>
              </div>
              <button
                onClick={handleMysteryBox}
                disabled={!profile || !canOpen}
                className="relative h-12 w-12 rounded-2xl shadow-lg overflow-hidden"
              >
                {!canOpen && (
                  <div
                    className="absolute inset-0 rounded-2xl"
                    style={{
                      background: `conic-gradient(from 90deg, rgba(226,232,240,0.9) ${cooldownProgress *
                        100}%, rgba(91,123,255,0.9) ${cooldownProgress * 100}%)`,
                    }}
                  />
                )}
                {canOpen && (
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#7dd3fc] via-[#9f7aea] to-[#5b7bff] animate-pulse" />
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`h-8 w-8 rounded-xl bg-white/85 backdrop-blur-sm flex items-center justify-center text-[11px] font-bold text-slate-700 ${!canOpen ? "text-slate-500" : ""}`}>
                    {canOpen ? "Open" : `${Math.ceil(remaining / 3600000)}h`}
                  </div>
                </div>
              </button>
            </div>
            <div className="flex items-center gap-2 mt-auto">
              <button
                onClick={setSeller}
                className="soft-button px-4 py-2 text-sm"
              >
                My Listings
              </button>
              <button
                onClick={setWinner}
                className="soft-button-ghost px-4 py-2 text-sm"
              >
                Auctions Won
              </button>
              <Link href="/auctions/create" className="soft-button-ghost px-4 py-2 text-sm text-center border border-white/70 rounded-full">
                List new gear
              </Link>
            </div>
          </div>

          {/* Daily quests */}
          <div className="glass-panel ios-shadow rounded-3xl p-5 border border-white/60 h-full flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Daily quests</div>
              <span className="badge badge-neutral">Reset daily</span>
            </div>
            <div className="space-y-2 flex-1">
              {[
                { label: "Place 2 bids", progress: Math.min(2, profile?.bidsPlaced ?? 0), total: 2, reward: "+15 XP" },
                { label: "Win an auction", progress: Math.min(1, profile?.auctionsWon ?? 0), total: 1, reward: "+50 XP" },
                { label: "List a new item", progress: Math.min(1, profile?.auctionsCreated ?? 0), total: 1, reward: "+25 XP" },
              ].map((quest, idx) => {
                const pct = Math.min(100, Math.round((quest.progress / quest.total) * 100));
                return (
                  <div key={idx} className="rounded-2xl border border-white/60 bg-white/80 px-3 py-2">
                    <div className="flex items-center justify-between text-sm text-slate-800">
                      <span>{quest.label}</span>
                      <span className="text-xs text-slate-500">{quest.reward}</span>
                    </div>
                    <div className="mt-1 h-2 bg-white/60 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#5b7bff] to-[#9f7aea]" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      {quest.progress}/{quest.total} completed
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Leaderboard */}
          <div className="glass-panel ios-shadow rounded-3xl p-5 border border-white/60 h-full flex flex-col" id="leaderboard">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                Leaderboard
              </div>
              <span className="badge badge-neutral">Top 50</span>
            </div>
            <div className="space-y-2 flex-1 overflow-auto pr-1 max-h-[220px]">
              {leaderboard.slice(0, 50).map((entry, idx) => (
                <div
                  key={entry.username}
                  className="flex items-center justify-between rounded-2xl border border-white/60 bg-white/80 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 w-6 text-center">
                      #{idx + 1}
                    </span>
                    <div className="relative h-8 w-8">
                      <Image
                        src={entry.avatarUrl}
                        alt={entry.username}
                        fill
                        className="rounded-full border border-white/70 shadow object-cover"
                      />
                    </div>
                    <div className="flex flex-col leading-tight">
                      <span className="text-sm font-semibold text-slate-800">
                        {entry.username}
                      </span>
                      <span className="text-xs text-slate-500">
                        Lv {entry.level} • {numberWithCommas(entry.experience)} XP
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-slate-700">
                    FLOG {numberWithCommas(entry.flogBalance)}
                  </span>
                </div>
              ))}
              {leaderboard.length === 0 && (
                <div className="text-sm text-slate-500">
                  Keep playing to claim your spot.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <Filters />
      {data.totalCount === 0 ? (
        <EmptyFilter showReset />
      ) : (
        <>
          <div className="grid grid-cols-5 gap-6">
            {data.auctions.map((auction) => (
              <AuctionCard auction={auction} key={auction.id} />
            ))}
          </div>

          <div className="flex justify-center mt-4">
            <AppPagination
              pageChanged={setPageNumber}
              currentPage={params.pageNumber}
              pageCount={data.pageCount}
            />
          </div>
        </>
      )}
    </>
  );
}
