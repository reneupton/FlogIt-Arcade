import React from 'react'
import { formatGold } from '../lib/numberWithComma'

type Props = {
    amount?: number
    reservePrice: number
}

export default function CurrentBid({amount, reservePrice} : Props) {
    const text = amount ? formatGold(amount) : 'No bids yet';
    const color = amount
      ? amount > reservePrice
        ? 'badge-positive'
        : 'badge-warn'
      : 'badge-neutral-soft';

  return (
    <div className = {`badge ${color} pointer-events-auto`}>
        {text}
    </div>
  )
}
