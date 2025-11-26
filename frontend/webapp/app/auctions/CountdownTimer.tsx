"use client";

import { useBidStore } from "@/hooks/useBidStore";
import { usePathname } from "next/navigation";
import React from "react";
import Countdown from "react-countdown";

type Props = {
  auctionEnd: string;
};

const renderer = ({
  days,
  hours,
  minutes,
  seconds,
  completed,
}: {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  completed: boolean;
}) => {
  const statusClass = completed
    ? "badge-neutral-soft"
    : days === 0 && hours < 2
    ? "badge-warn"
    : "badge-positive";

  let label: string;
  if (completed) {
    label = "Auction finished";
  } else if (days > 0) {
    label = `${days}d ${hours}h`;
  } else if (hours > 0) {
    label = `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    label = `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
  } else {
    label = `${seconds}s`;
  }

  return (
    <div
      className={`badge ${statusClass} shadow-lg`}
    >
      <span suppressHydrationWarning>{label}</span>
    </div>
  );
};

export default function CountdownTimer({ auctionEnd }: Props) {
  const setOpen = useBidStore((state) => state.setOpen);
  const pathname = usePathname();

  function auctionFinished() {
    if (pathname.startsWith("/auctions/details")) {
      setOpen(false);
    }
  }

  return (
    <div className="pointer-events-auto">
      <Countdown date={auctionEnd} renderer={renderer} onComplete={auctionFinished} />
    </div>
  );
}
