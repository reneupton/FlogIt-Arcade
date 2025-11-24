import React from 'react'
import CountdownTimer from './CountdownTimer'
import CarImage from './CarImage'
import { Auction } from '@/types'
import Link from 'next/link'
import CurrentBid from './CurrentBid'

type Props = {
    auction: Auction
}

export default function AuctionCard({auction}: Props) {
  return (
    <Link href={`/auctions/details/${auction.id}`} className='group'>
        <div className='glass-panel ios-shadow rounded-3xl p-3 transition-transform duration-150 hover:-translate-y-1 hover:shadow-2xl border border-white/60'>
            <div className='w-full aspect-w-16 aspect-h-10 rounded-2xl overflow-hidden relative bg-gradient-to-br from-slate-100 to-white'>
                <CarImage imageUrl={auction.imageUrl} />
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/0 to-black/50 pointer-events-none" />
                <div className="absolute inset-0 flex flex-col justify-between p-3 pointer-events-none">
                    <div className="flex justify-between">
                        <span className="badge badge-neutral">Category: {auction.category}</span>
                        <CurrentBid 
                        reservePrice={auction.reservePrice} 
                        amount = {auction.currentHighBid}/>
                    </div>
                    <div className='flex justify-between items-end'>
                        <CountdownTimer auctionEnd={auction.auctionEnd}/>
                    </div>
                </div>
            </div>
            <div className='flex justify-between items-center mt-4'>
                <div className='flex flex-col'>
                  <h3 className='text-slate-900 font-semibold'>{auction.title}</h3>
                  <p className='text-xs text-slate-500'>{auction.brand} • {auction.variant}</p>
                </div>
                <p className='font-semibold text-sm text-slate-500'>{auction.releaseYear ?? ''}</p>
            </div>
        </div>
    </Link>
  )
}
