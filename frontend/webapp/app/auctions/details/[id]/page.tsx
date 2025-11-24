
import {
  getBidsForAuction,
  getDetailedViewData,
} from "@/app/actions/auctionActions";
import Heading from "@/app/components/Heading";
import React from "react";
import CountdownTimer from "../../CountdownTimer";
import CarImage from "../../CarImage";
import DetailedSpecs from "./DetailedSpecs";
import { getCurrentUser } from "@/app/actions/authActions";
import EditButton from "./EditButton";
import DeleteButton from "../DeleteButton";
import BidList from "./BidList";
import { formatFlog } from "@/app/lib/numberWithComma";

export default async function Details({ params }: { params: { id: string } }) {
  const data = await getDetailedViewData(params.id);
  const user = await getCurrentUser();

  return (
    <div className="space-y-6">
      <div className="glass-panel ios-shadow rounded-3xl p-6 flex flex-col gap-4">
        <div className="flex flex-wrap justify-between gap-4 items-center">
          <div className="flex items-center gap-3">
            <Heading title={`${data.title}`} />
            <span className="badge">{data.brand}</span>
            {user?.username === data.seller && (
              <>
                <EditButton id={data.id} />
                <DeleteButton id={data.id} />
              </>
            )}
          </div>

          <div className="flex items-center gap-3 text-sm text-slate-600 bg-white/70 rounded-full px-4 py-2 border border-white/60 shadow">
            <span className="font-medium text-slate-700">Time remaining:</span>
            <CountdownTimer auctionEnd={data.auctionEnd} />
          </div>
        </div>
        <div className="flex flex-wrap gap-3 text-sm text-slate-700">
          <span className="badge badge-neutral">Category: {data.category}</span>
          <span className="badge badge-positive">Current: {formatFlog(data.currentHighBid ?? 0)}</span>
          <span className="badge badge-warn">Reserve: {data.reservePrice > 0 ? formatFlog(data.reservePrice) : 'No reserve'}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="w-full bg-gray-200 aspect-h-10 aspect-w-16 rounded-2xl overflow-hidden relative ios-shadow">
            <CarImage imageUrl={data.imageUrl} />
          </div>
          <BidList user={user} auction={data} />
        </div>
      </div>

      <div className="glass-panel ios-shadow rounded-3xl p-6">
        <DetailedSpecs auction={data} />
      </div>
    </div>
  );
}
