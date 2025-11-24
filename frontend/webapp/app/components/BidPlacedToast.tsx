import { Auction, Bid } from '@/types'
import Link from 'next/link'
import React from 'react'
import Image from 'next/image'
import { formatFlog } from '../lib/numberWithComma'

type Props = {
    bid: Bid
    auction: Auction
}

export default function AuctionCreatedToast({bid, auction} : Props) {
  return (
    <Link href={`/auctions/details/${bid.auctionId}`} className='flex flex-col items-center'>
        <div className='flex flex-row items-center gap-3 bg-white/85 px-3 py-2 rounded-2xl border border-white/70 shadow-lg'>
            <Image 
                src={auction.imageUrl}
                alt='image'
                height={80}
                width={80}
                className='rounded-xl w-auto h-auto shadow'
            />

            <span className='text-sm text-slate-700'>{formatFlog(bid.amount)} bid placed on {auction.title} ({auction.brand})</span>
        </div>
        </Link>
  )
}
