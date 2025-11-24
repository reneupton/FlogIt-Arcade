"use client";

import { useParamStore } from "@/hooks/useParamsStore";
import React from "react";
import { usePathname, useRouter } from "next/navigation";

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
      <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#5b7bff] via-[#9f7aea] to-[#7dd3fc] flex items-center justify-center text-white shadow-lg relative overflow-hidden">
        <span className="text-xl font-extrabold tracking-tight">FI</span>
        <span className="absolute inset-0 bg-white/10" />
      </div>
      <div className="flex flex-col leading-tight">
        <div className="text-xl font-extrabold text-slate-900 tracking-tight">FLOG IT - TECH</div>
        <div className="text-xs uppercase text-slate-500 tracking-[0.3em]">Arcade Auctions</div>
      </div>
    </div>
  );
}
