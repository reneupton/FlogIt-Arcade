import { formatGold } from '@/app/lib/numberWithComma';
import { Bid } from '@/types'
import { format } from 'date-fns';
import React from 'react'

type Props = {
    bid: Bid
}

export default function BidItem({bid} : Props) {
    function getBidInfo() {
        let bgColor = '';
        let text = '';

        switch(bid.bidStatus) {
            case 'Accepted':
                bgColor = 'bg-emerald-100 text-emerald-800'
                text = 'Bid accepted'
                break;
            case 'AcceptedBelowReserve':
                bgColor = 'bg-amber-100 text-amber-800'
                text = 'Reserve not met'
                break;
            case 'TooLow':
                bgColor = 'bg-rose-100 text-rose-800'
                text = 'Bid was too low'
                break;
            default:
                bgColor = 'bg-rose-100 text-rose-800'
                text = 'Bid placed after auction finished'
                break;
        }
        return {bgColor, text};
    }

  return (
    <div className={`
        border border-white/60 bg-white/85 px-3 py-3 rounded-2xl glass-panel
        flex justify-between items-center mb-2 shadow-sm
        ${getBidInfo().bgColor}
    `}>
        <div className = 'flex flex-col'>
            <span className='font-semibold text-slate-800'>Bidder: {bid.bidder}</span>
            <span className='text-gray-700 text-sm'>Time: {format(new Date(bid.bidTime), "dd MMM yyyy h:mm a")}</span>
        </div>
        <div className='flex flex-col text-right'>
            <div className='text-xl font-semibold'>{formatGold(bid.amount)}</div>
            <div className='flex flex-row items-center'>
                <span>{getBidInfo().text}</span>
            </div>
        </div>
    </div>
  )
}
