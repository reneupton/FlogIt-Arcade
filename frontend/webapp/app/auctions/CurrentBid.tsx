import React from 'react'
import { formatFlog } from '../lib/numberWithComma'

type Props = {
    amount?: number
    reservePrice: number
}

export default function CurrentBid({amount, reservePrice} : Props) {
    const text = amount ? formatFlog(amount) : 'No bids yet';
    const color = amount
      ? amount > reservePrice
        ? 'badge-positive'
        : 'badge-warn'
      : 'badge-neutral';

  return (
    <div className = {`badge ${color} pointer-events-auto`}>
        {text}
    </div>
  )
}
