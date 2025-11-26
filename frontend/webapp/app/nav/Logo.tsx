"use client";

import { useParamStore } from "@/hooks/useParamsStore";
import React from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import heroIcon from "@/public/icon2.png";

export default function Logo() {
  const router = useRouter()
  const pathname = usePathname();
  const reset = useParamStore((state) => state.reset);

  function doReset() {
    if(pathname !== '/') router.push('/');
    reset();
  }

  return (
    <div
      onClick={doReset}
      className="cursor-pointer flex items-center gap-3 text-3xl font-bold"
    >
      <div className="h-18 w-18 md:h-20 md:w-20 rounded-[26px] relative overflow-hidden" style={{ backgroundColor: 'transparent' }}>
        <Image
          src={heroIcon}
          alt="Hero Exchange"
          fill
          className="object-contain drop-shadow-xl pointer-events-none"
          sizes="80px"
          priority
        />
      </div>
      <div className="flex flex-col leading-tight">
        <div className="text-xl font-extrabold text-[var(--text)] tracking-tight">Hero Exchange</div>
        <div className="text-xs uppercase text-[var(--muted)] tracking-[0.3em]">RPG Hero Market</div>
      </div>
    </div>
  );
}
