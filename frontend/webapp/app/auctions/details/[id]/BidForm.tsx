"use client";

type Props = {
  auctionId: string;
  highBid: number;
};

import { placeBidForAuction } from "@/app/actions/auctionActions";
import { formatFlog, numberWithCommas } from "@/app/lib/numberWithComma";
import { awardGamification, getMyProgress } from "@/app/actions/gamificationActions";
import { useBidStore } from "@/hooks/useBidStore";
import { useProfileStore } from "@/hooks/useProfileStore";
import React from "react";
import { FieldValues, useForm } from "react-hook-form";
import toast from "react-hot-toast";

export default function BidForm({ auctionId, highBid }: Props) {
  const {
    register,
    handleSubmit,
    reset,
  } = useForm();
  const addBid = useBidStore((state) => state.addBid);
  const setProfile = useProfileStore((state) => state.setProfile);

  async function onSubmit(data: FieldValues) {
    if (data.amount <= highBid) {
      reset();
      return toast.error(`Bid must be at least ${formatFlog(highBid + 1)}`);
    }

    placeBidForAuction(auctionId, +data.amount)
      .then((bid) => {
        if (bid.error) throw bid.error;
        addBid(bid);
        reset();
        return awardGamification("bid").then((profile) => profile ?? getMyProgress());
      })
      .then((profile) => setProfile(profile ?? undefined))
      .catch((err) => toast.error(err.message));
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex items-center gap-3 bg-white/85 border border-white/70 rounded-2xl px-3 py-3 shadow pointer-events-auto"
    >
      <input
        type="number"
        {...register("amount")}
        className="input-custom text-sm text-gray-700"
        placeholder={`Enter your bid (minimum bid is ${numberWithCommas(
          highBid + 1
        )} FLOG)`}
      />
      <button
        type="submit"
        className="soft-button whitespace-nowrap px-5 py-2 text-sm"
      >
        Place bid
      </button>
    </form>
  );
}
