import { Auction, AuctionFinished } from '@/types'
import Link from 'next/link'
import React from 'react'
import Image from 'next/image'
import { formatGold } from '../lib/numberWithComma'

type Props = {
    finishedAuction: AuctionFinished
    auction: Auction
}

export default function AuctionFinishedToast({finishedAuction, auction} : Props) {
  return (
    <Link href={`/auctions/details/${auction.id}`} className='flex flex-col items-center'>
        <div className='flex flex-row items-center gap-3 bg-white/85 px-3 py-2 rounded-2xl border border-white/70 shadow-lg'>
            <Image 
                src={auction.imageUrl}
                alt='image'
                height={80}
                width={80}
                className='rounded-xl w-auto h-auto shadow'
            />

            <div className='flex flex-col text-left'>
                <span className='font-semibold text-slate-800'>Auction finished: {auction.title} ({auction.brand})</span>
                {finishedAuction.itemSold && finishedAuction.amount ? (
                    <p className='text-sm text-slate-600'>
                      Congrats {finishedAuction.winner}! Victory price {formatGold(finishedAuction.amount)}
                    </p>
                ) : (
                    <p className='text-sm text-slate-600'>This item did not sell</p>
                )}
            </div>

        </div>
        </Link>
  )
}
