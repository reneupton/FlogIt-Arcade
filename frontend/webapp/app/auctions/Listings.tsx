"use client";

import React, { useCallback, useEffect, useState } from "react";
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
import goldIcon from "@/public/gold2.png";
import { numberWithCommas } from "../lib/numberWithComma";
import { getLeaderboard, getMyProgress, summonHero } from "../actions/gamificationActions";
import { usePathname, useRouter } from "next/navigation";
import LoadingSpinner from "../components/LoadingSpinner";
import { characterCatalog, CharacterDefinition } from "../data/characterCatalog";
import AnimatedHeroSprite from "../components/AnimatedHeroSprite";
import { signIn } from "next-auth/react";
import BidList from "./details/[id]/BidList";

type Props = {
  user: User | null;
};

export default function Listings({ user }: Props) {
  const [loading, setLoading] = useState(true);
  const [reward, setReward] = useState<{heroName: string; rarity: string; gold: number} | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(!user);
  const pathname = usePathname();
  const router = useRouter();
  const profile = useProfileStore((state) => state.profile);
  const leaderboard = useProfileStore((state) => state.leaderboard);
  const setProfile = useProfileStore((state) => state.setProfile);
  const setLeaderboard = useProfileStore((state) => state.setLeaderboard);
  const hashToCharacter = (auctionId: string): CharacterDefinition => {
    const hash = Array.from(auctionId).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    const idx = Math.abs(hash) % characterCatalog.length;
    return characterCatalog[idx];
  };

  const ownedIds = new Set(
    [
      ...((profile?.ownedHeroes ?? []).map((h) => h.variantId ?? h.heroId) || []),
      ...(profile?.recentPurchases ?? []),
    ].filter(Boolean) as string[]
  );
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
  const sellerActive = params.seller === user?.username;
  const winnerActive = params.winner === user?.username;
  const [selected, setSelected] = useState<{ auction: Auction; character: CharacterDefinition } | null>(null);

  const combined = data.auctions.map((auction) => ({
    auction,
    character: hashToCharacter(auction.id),
  }));
  const ownedList = characterCatalog.filter((c) => ownedIds.has(c.id));

  const totalStats =
    profile?.totalHeroPower ??
    ownedList.reduce((sum, c) => {
      const s = c.stats;
      return sum + s.strength + s.intellect + s.vitality + s.agility;
    }, 0);
  const derivedLevel = profile?.level ?? Math.max(1, Math.floor(totalStats / 120));
  const nextThreshold = (derivedLevel + 1) * 120;
  const progressPct = nextThreshold ? Math.min(100, Math.round((totalStats / nextThreshold) * 100)) : 0;

  const refreshProfileAndBoard = useCallback(async (): Promise<void> => {
    if (!user) return;
    try {
      const profile = await getMyProgress();
      if (profile) {
        setProfile(profile);
      }
      const leaderboard = await getLeaderboard();
      if (leaderboard && leaderboard.length > 0) {
        setLeaderboard(leaderboard);
      }
    } catch {
      // ignore errors; keep current state
    }
  }, [user, setProfile, setLeaderboard]);

  const ensureDicebearPng = (url: string) => {
    if (!url.includes("dicebear.com")) return url;
    const converted = url
      .replace(/\/7\.x\/[^/]+\//, "/7.x/adventurer/")
      .replace("/svg", "/png");
    if (converted.includes("?")) return converted;
    return `${converted}?seed=${user?.username ?? "avatar"}&backgroundType=gradientLinear&radius=40`;
  };

  function setWinner(){
    if(!user?.username) return;
    setParams({winner: user.username, seller: undefined, filterBy: 'finished'})
  }
  
  function setSeller(){
    if(!user?.username) return;
    setParams({seller: user.username, winner: undefined, filterBy: 'live'})
  }

  const formatShortId = (id: string) => id.replace(/-/g, '').slice(0, 8).toUpperCase();
  const deriveBasePath = (cardImage: string) => {
    const match = cardImage.match(/(.*)\/card\/frame_\d+\.png$/);
    return match ? match[1] : "";
  };

  const handleLogin = () => {
    signIn("id-server");
  };

  const handleGuestLogin = () => {
    const guestHint = process.env.NEXT_PUBLIC_GUEST_LOGIN_HINT || "guest";
    signIn("id-server", { login_hint: guestHint });
  };

  async function handleMysteryBox() {
    if (!profile || !canOpen || !user?.username) return;
    const result = await summonHero(user.username);
    if (result) {
      if (result.profile) {
        setProfile(result.profile);
      }
      if (result.hero) {
        setReward({ heroName: result.hero.name, rarity: result.hero.rarity, gold: result.goldAwarded });
      }
      await refreshProfileAndBoard();
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

  useEffect(() => {
    refreshProfileAndBoard();
    if (!user) return;
    const onFocus = () => refreshProfileAndBoard();
    const onPageShow = () => refreshProfileAndBoard();
    const onVisibility = () => {
      if (document.visibilityState === "visible") refreshProfileAndBoard();
    };
    window.addEventListener("focus", onFocus);
    window.addEventListener("pageshow", onPageShow);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("pageshow", onPageShow);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [user, refreshProfileAndBoard]);

  // Also refresh when the route changes back to listings (Next.js client-side back)
  useEffect(() => {
    refreshProfileAndBoard();
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    if (nav?.type === "back_forward") {
      router.refresh();
      refreshProfileAndBoard();
    }
  }, [pathname, refreshProfileAndBoard, router]);

  if (loading) return <LoadingSpinner label="Summoning auctions..." />;

  if(isMobile) return <h3> This website is not supported for mobile devices. Please use a desktop to preview this demo. You will be able to still see activity notifications. </h3>

  const rarityTone: Record<CharacterDefinition['rarity'], string> = {
    Common: 'bg-[rgba(255,255,255,0.08)] text-[var(--text)] border-[var(--card-border)]',
    Rare: 'bg-gradient-to-r from-[rgba(59,130,246,0.25)] to-[rgba(56,189,248,0.18)] text-[var(--text)] border-[rgba(59,130,246,0.6)]',
    Epic: 'bg-gradient-to-r from-[rgba(139,92,246,0.3)] to-[rgba(236,72,153,0.2)] text-[var(--text)] border-[rgba(139,92,246,0.6)]',
    Legendary: 'bg-gradient-to-r from-[rgba(245,158,11,0.35)] to-[rgba(249,115,22,0.25)] text-[var(--text)] border-[rgba(245,158,11,0.65)]',
  };

  return (
    <>
      {!user && showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="glass-panel rounded-3xl p-6 border border-[var(--card-border)] max-w-md w-full text-[var(--text)]">
            <h2 className="text-2xl font-bold mb-2">Welcome to Hero Exchange</h2>
            <p className="text-sm text-[var(--muted)] mb-6">
              Sign in to bid, list heroes, and track your progress. You can also jump in as a guest to try the experience.
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={handleLogin} className="soft-button w-full justify-center py-3 text-base">
                Login
              </button>
              <button onClick={handleGuestLogin} className="soft-button-ghost w-full justify-center py-3 text-base">
                Login as Guest
              </button>
              <button
                onClick={() => setShowAuthModal(false)}
                className="w-full text-sm text-[var(--muted)] hover:text-[var(--text)]"
              >
                Continue browsing
              </button>
            </div>
          </div>
        </div>
      )}

      {user && (
        <div className="grid grid-cols-3 gap-4 items-stretch mb-6">
          {/* Profile */}
          <div className="glass-panel ios-shadow rounded-3xl p-5 border border-[var(--accent-3)]/30 h-full flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="relative h-14 w-14">
                <div className="h-full w-full rounded-2xl overflow-hidden border border-white/70 shadow-lg bg-gradient-to-br from-[#5b7bff] to-[#9f7aea]" />
                <Image
                  src={ensureDicebearPng(
                    profile?.avatarUrl ??
                      `https://api.dicebear.com/7.x/adventurer/png?seed=${user.username}&backgroundType=gradientLinear&radius=40`
                  )}
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
                <div className="flex items-center gap-2 mt-1">
                  <span className="badge badge-positive flex items-center gap-2">
                    <Image src={goldIcon} alt="gold" width={20} height={20} className="object-contain" />
                    {numberWithCommas(profile?.flogBalance ?? 0)}
                  </span>
                  <span className="badge">Level {derivedLevel}</span>
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
                Total stats {totalStats} • Progress to next {progressPct}%
                </div>
              </div>
              <div className="text-[11px] text-slate-500">
                Sold: {profile?.auctionsSold ?? 0} • Won: {profile?.auctionsWon ?? 0} • Bids: {profile?.bidsPlaced ?? 0}
              </div>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/60 bg-white/80 px-4 py-3 shadow-sm">
              <div className="flex flex-col">
                <span className="text-xs uppercase text-slate-500 tracking-wide">Daily Summons</span>
                <span className="text-sm font-semibold text-slate-800">
                  {recentReward && !canOpen
                    ? `+${recentReward.coins} • +${recentReward.xp} power`
                  : reward
                    ? `+${reward?.gold ?? 0} • ${reward?.heroName ?? ""} (${reward?.rarity ?? ""})`
                    : canOpen
                    ? "Tap to reveal today's bonus"
                    : "Come back tomorrow"
                  }
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
                className={`chip bg-[rgba(46,58,80,0.8)] text-[var(--text)] border-[var(--card-border)] ${sellerActive ? 'chip-active text-white' : ''}`}
              >
                My Listings
              </button>
              <button
                onClick={setWinner}
                className={`chip bg-[rgba(46,58,80,0.8)] text-[var(--text)] border-[var(--card-border)] ${winnerActive ? 'chip-active text-white' : ''}`}
              >
                Auctions Won
              </button>
              <Link href="/auctions/create" className="chip-cta text-sm text-center">
                List a hero
              </Link>
            </div>
          </div>

          {/* Daily quests */}
          <div className="glass-panel ios-shadow rounded-3xl p-5 border border-[var(--accent-3)]/30 h-full flex flex-col gap-3">
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
          <div className="glass-panel ios-shadow rounded-3xl p-5 border border-[var(--accent-3)]/30 h-full flex flex-col" id="leaderboard">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                Leaderboard
              </div>
              <span className="badge badge-neutral">Top 10</span>
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
                        src={ensureDicebearPng(entry.avatarUrl)}
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
                        Lv {entry.level}  {numberWithCommas(entry.experience)} XP
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-slate-700">
                    Gold {numberWithCommas(entry.flogBalance)}
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
      <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-6 mt-8">
        <aside className="glass-panel ios-shadow rounded-3xl p-5 border border-[var(--card-border)] h-full">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-[var(--text)]">Collection</h3>
            <span className="badge badge-neutral-soft">{ownedList.length} owned</span>
          </div>
          {ownedList.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">
              You don&apos;t own any heroes yet. Win auctions to add them to your collection.
            </p>
          ) : (
            <div className="space-y-3 max-h-[520px] overflow-auto pr-1">
              {ownedList.map((c) => (
                <div key={c.id} className="flex items-center gap-3 rounded-2xl border border-[var(--card-border)] bg-[rgba(26,32,48,0.65)] p-3">
                  <div className="relative h-12 w-12">
                    <Image src={c.cardImage} alt={c.name} fill className="object-contain rounded-xl" />
                  </div>
                  <div className="flex flex-col text-[var(--text)]">
                    <span className="text-sm font-semibold">{c.name}</span>
                    <span className="text-xs text-[var(--muted)]">{c.discipline}  {c.rarity}</span>
                  </div>
                  <span className="ml-auto badge badge-positive flex items-center gap-2">
                    <Image src={goldIcon} alt="gold" width={20} height={20} className="object-contain" />
                    {c.gold.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </aside>
        <section className="flex flex-col gap-4">
          <Filters />
          {data.totalCount === 0 ? (
            <EmptyFilter showReset />
          ) : (
            <div className="flex flex-col gap-6 min-h-[520px]">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
                {combined.map(({ auction, character }) => (
                  <AuctionCard
                    auction={auction}
                    character={character}
                    owned={ownedIds.has(character.id)}
                    key={auction.id}
                    onSelect={() => setSelected({ auction, character })}
                  />
                ))}
              </div>

              <div className="flex justify-center mt-auto">
                <AppPagination
                  pageChanged={setPageNumber}
                  currentPage={params.pageNumber}
                  pageCount={data.pageCount}
                />
              </div>
            </div>
          )}
        </section>
      </div>

      {selected && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          onClick={() => setSelected(null)}
        >
          <div
            className="glass-panel rounded-3xl p-6 pt-10 border border-[var(--card-border)] max-w-6xl w-full relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 text-xl font-bold text-[var(--text)] z-10"
            >
              ✕
            </button>
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(380px,0.8fr)] gap-6 mt-4 pr-2">
              <div className="flex flex-col gap-4">
                <div className="relative w-full aspect-square min-h-[320px] rounded-2xl overflow-hidden bg-[rgba(26,32,48,0.7)] border border-[var(--card-border)]">
                  <Image
                    src={selected.character.cardImage}
                    alt={selected.character.name}
                    fill
                    className="object-contain pointer-events-none"
                  />
                  {deriveBasePath(selected.character.cardImage) && (
                    <AnimatedHeroSprite
                      basePath={deriveBasePath(selected.character.cardImage)}
                      frameCount={18}
                      hero={false}
                      intervalMs={140}
                      idleFrames={[0, 1, 2, 3, 4, 5, 4, 3, 2, 1]}
                      blinkFrames={[15, 16, 15]}
                      minBlinkDelayMs={4200}
                      maxBlinkDelayMs={8400}
                      alt={selected.character.name}
                    />
                  )}
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="badge badge-positive text-base flex items-center gap-2">
                      <Image src={goldIcon} alt="gold" width={18} height={18} className="object-contain" />
                      {selected.character.gold.toLocaleString()}
                    </span>
                    <span className="badge badge-neutral-soft">{selected.character.discipline}</span>
                    <span className={`badge ${rarityTone[selected.character.rarity]}`}>{selected.character.rarity}</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[var(--text)]">{selected.character.name}</h2>
                    <div className="text-xs text-[var(--muted)] font-mono">
                      Listing ID: {formatShortId(selected.auction.id)}
                    </div>
                  </div>
                  <p className="text-sm text-[var(--muted)]">
                    {selected.character.lore ??
                      selected.auction.specs ??
                      "Legend speaks of this hero's untold potential."}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Strength', value: selected.character.stats.strength },
                      { label: 'Intellect', value: selected.character.stats.intellect },
                      { label: 'Vitality', value: selected.character.stats.vitality },
                      { label: 'Agility', value: selected.character.stats.agility },
                    ].map((stat) => (
                      <div key={stat.label} className="rounded-xl border border-[var(--card-border)] bg-[rgba(26,32,48,0.6)] px-3 py-2">
                        <div className="text-xs text-[var(--muted)]">{stat.label}</div>
                        <div className="text-lg font-semibold text-[var(--text)]">{stat.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="w-full max-h-[70vh] overflow-auto">
                <BidList user={user} auction={selected.auction} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

