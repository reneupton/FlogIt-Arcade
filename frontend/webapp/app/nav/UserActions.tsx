'use client'
import { useParamStore } from "@/hooks/useParamsStore";
import { Dropdown } from "flowbite-react";
import { User } from "next-auth";
import { signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import Image from "next/image";
import { HiArrowTrendingUp, HiMiniSparkles, HiOutlineRocketLaunch } from "react-icons/hi2";
import { BsTrophy } from "react-icons/bs";
import { numberWithCommas } from "../lib/numberWithComma";
import { useProfileStore } from "@/hooks/useProfileStore";

type Props = {
  user: User
}

export default function UserActions({user} : Props) {
  const router = useRouter();
  const pathname = usePathname();
  const setParams = useParamStore(state => state.setParams);
  const profile = useProfileStore((state) => state.profile);

  const ensureDicebearPng = (url: string) => {
    if (!url.includes("dicebear.com")) return url;
    const converted = url
      .replace(/\/7\.x\/[^/]+\//, "/7.x/adventurer/")
      .replace("/svg", "/png");
    if (converted.includes("?")) return converted;
    return `${converted}?seed=${user?.username ?? "avatar"}&backgroundType=gradientLinear&radius=40`;
  };

  function setWinner(){
    setParams({winner: user.username, seller: undefined, filterBy: 'finished'})
    if(pathname != '/') router.push('/')
  }

  function setSeller(){
    setParams({seller: user.username, winner: undefined, filterBy: 'live'})
    if(pathname != '/') router.push('/')
  }

  const avatar = ensureDicebearPng(
    profile?.avatarUrl ??
      `https://api.dicebear.com/7.x/adventurer/png?seed=${user.username}&backgroundType=gradientLinear&radius=40`
  );

  const label = (
    <div className="flex items-center gap-3 bg-[rgba(26,32,48,0.9)] px-3 py-2 rounded-full border border-[var(--card-border)] shadow-md">
      <div className="relative">
        <div className="h-10 w-10 rounded-full overflow-hidden border border-[var(--card-border)] shadow relative">
          <Image src={avatar} alt="avatar" fill className="object-cover" />
        </div>
        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] bg-gradient-to-r from-[var(--accent)] to-[var(--accent-3)] text-[var(--bg)] rounded-full px-2 py-0.5 shadow font-semibold">
          Lv {profile?.level ?? 1}
        </span>
      </div>
      <div className="flex flex-col leading-tight text-left">
        <span className="text-xs text-[var(--muted)]">Welcome back</span>
        <span className="font-semibold text-[var(--text)]">{user.name ?? user.username}</span>
        <div className="flex gap-1 text-[10px] text-[var(--muted)]">
          <span className="badge badge-positive">Gold {numberWithCommas(profile?.flogBalance ?? 0)}</span>
          <span className="badge badge-neutral-soft">XP {numberWithCommas(profile?.experience ?? 0)}</span>
        </div>
      </div>
    </div>
  );

  return (
    <Dropdown
    inline
    label={label}
    className="bg-[rgba(26,32,48,0.95)] border border-[var(--card-border)] rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.35)] text-[var(--text)]"
  >
    <Dropdown.Item className="text-[var(--text)] hover:bg-[rgba(139,92,246,0.15)]" icon={HiMiniSparkles} onClick={setSeller}>
        My Auctions
    </Dropdown.Item>
    <Dropdown.Item className="text-[var(--text)] hover:bg-[rgba(139,92,246,0.15)]" icon={BsTrophy} onClick={setWinner}>
        Auctions won
    </Dropdown.Item>
    <Dropdown.Item className="text-[var(--text)] hover:bg-[rgba(139,92,246,0.15)]" icon={HiOutlineRocketLaunch} onClick={() => router.push('/auctions/create')}>
        List a hero
    </Dropdown.Item>
    <Dropdown.Divider />
    <Dropdown.Item className="text-[var(--text)] hover:bg-[rgba(244,63,94,0.15)]" onClick={() => signOut({callbackUrl: '/'})}>
      Sign out
    </Dropdown.Item>
  </Dropdown>
  );
}
