"use client";

import { getBidsForAuction } from "@/app/actions/auctionActions";
import { useBidStore } from "@/hooks/useBidStore";
import { Auction, Bid } from "@/types";
import { User } from "next-auth";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import BidItem from "./BidItem";
import { formatGold, numberWithCommas } from "@/app/lib/numberWithComma";
import EmptyFilter from "@/app/components/EmptyFilter";
import BidForm from "./BidForm";
import Image from "next/image";
import goldIcon from "@/public/gold2.png";

type Props = {
  user: User | null;
  auction: Auction;
};
export default function BidList({ user, auction }: Props) {
  const [loading, setLoading] = useState(true);
  const allBids = useBidStore((state) => state.bids);
  const bids = allBids.filter((bid) => bid.auctionId === auction.id);
  const setBids = useBidStore((state) => state.setBids);
  const open = useBidStore((state) => state.open);
  const setOpen = useBidStore((state) => state.setOpen);
  const isLive = auction.status?.toLowerCase() === "live";
  const openForBids = isLive && new Date(auction.auctionEnd) > new Date();

  const highBid = bids.reduce(
    (prev, current) =>
      prev > current.amount
        ? prev
        : current.bidStatus.includes("Accepted")
        ? current.amount
        : prev,
    0
  );

  useEffect(() => {
    getBidsForAuction(auction.id)
      .then((res: any) => {
        if (res.error) {
          throw res.error;
        }
        setBids(res as Bid[]);
      })
      .catch((err) => {
        toast.error(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [auction.id, setLoading, setBids]);

  useEffect(() => {
    setOpen(openForBids);
  }, [openForBids, setOpen]);

  if (loading) return <span>Loading bids...</span>;

  return (
    <div className="glass-panel ios-shadow rounded-2xl h-full flex flex-col">
      <div className="py-3 px-4 bg-transparent border-b border-white/60">
        <div className="flex items-center justify-between gap-2 text-[var(--text)]">
          <div className="flex items-center gap-2 text-sm md:text-base font-semibold">
            <Image src={goldIcon} alt="gold" width={18} height={18} className="object-contain" />
            <span>Current high bid</span>
            <span className="text-[var(--accent)]">{numberWithCommas(highBid)}</span>
          </div>
          <div className="text-xs text-[var(--muted)]">{formatGold(highBid)}</div>
        </div>
      </div>

      <div className="overflow-auto h-[400px] flex flex-col-reverse px-3 py-2 gap-2">
        {bids.length === 0 ? (
          <EmptyFilter
            title="No bids for this item"
            subtitle={open ? "Please feel free to make a bid" : ""}
          />
        ) : (
          <>
            {bids.map((bid) => (
              <BidItem key={bid.id} bid={bid} />
            ))}
          </>
        )}
      </div>

      <div className="px-3 pb-3 text-gray-600">
        {!open ? (
          <div className="flex items-center justify-center p2 text-sm font-semibold text-slate-600 bg-white/70 rounded-xl px-4 py-3">
            This auction has finished
          </div>
        ) : !user ? (
          <div className="flex items-center justify-center p2 text-sm font-semibold text-slate-600 bg-white/70 rounded-xl px-4 py-3">
            Please login to make a bid
          </div>
        ) : user && user.username === auction.seller ? (
          <div className="flex items-center justify-center p2 text-sm font-semibold text-slate-600 bg-white/70 rounded-xl px-4 py-3">
            You cannot bid on your own auction
          </div>
        ) : (
          <BidForm auctionId={auction.id} highBid={highBid} />
        )}
      </div>
    </div>
  );
}
