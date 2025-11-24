"use client";

import { useBidStore } from "@/hooks/useBidStore";
import { usePathname } from "next/navigation";
import React from "react";
import Countdown, { zeroPad } from "react-countdown";

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
    ? "badge-neutral"
    : days === 0 && hours < 10
    ? "badge-warn"
    : "badge-positive";

  return (
    <div
      className={`badge ${statusClass} shadow-lg`}
    >
      {completed ? (
        <span> Auction finished</span>
      ) : (
        <span suppressHydrationWarning>
          {zeroPad(days)}:{zeroPad(hours)}:{zeroPad(minutes)}:{zeroPad(seconds)}
        </span>
      )}
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
