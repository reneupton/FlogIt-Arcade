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

  function setWinner(){
    setParams({winner: user.username, seller: undefined, filterBy: 'finished'})
    if(pathname != '/') router.push('/')
  }

  function setSeller(){
    setParams({seller: user.username, winner: undefined, filterBy: 'live'})
    if(pathname != '/') router.push('/')
  }

  const avatar = profile?.avatarUrl ?? `https://api.dicebear.com/7.x/thumbs/svg?seed=${user.username}`;

  const label = (
    <div className="flex items-center gap-3 bg-white/70 px-3 py-2 rounded-full border border-white/70 shadow-md">
      <div className="relative">
        <div className="h-10 w-10 rounded-full overflow-hidden border border-white/70 shadow relative">
          <Image src={avatar} alt="avatar" fill className="object-cover" />
        </div>
        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] bg-white/95 rounded-full px-2 py-0.5 shadow font-semibold text-slate-700">
          Lv {profile?.level ?? 1}
        </span>
      </div>
      <div className="flex flex-col leading-tight text-left">
        <span className="text-xs text-slate-500">Welcome back</span>
        <span className="font-semibold text-slate-800">{user.name ?? user.username}</span>
        <div className="flex gap-1 text-[10px] text-slate-600">
          <span className="badge badge-positive">FLOG {numberWithCommas(profile?.flogBalance ?? 0)}</span>
          <span className="badge badge-neutral">XP {numberWithCommas(profile?.experience ?? 0)}</span>
        </div>
      </div>
    </div>
  );

  return (
    <Dropdown
    inline
    label={label}
  >
    <Dropdown.Item icon={HiMiniSparkles} onClick={setSeller}>
        My Auctions
    </Dropdown.Item>
    <Dropdown.Item icon={BsTrophy} onClick={setWinner}>
        Auctions won
    </Dropdown.Item>
    <Dropdown.Item icon={HiOutlineRocketLaunch} onClick={() => router.push('/auctions/create')}>
        List new gear
    </Dropdown.Item>
    <Dropdown.Divider />
    <Dropdown.Item onClick={() => signOut({callbackUrl: '/'})}>
      Sign out
    </Dropdown.Item>
  </Dropdown>
  );
}
