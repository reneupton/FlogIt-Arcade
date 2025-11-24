import Heading from '@/app/components/Heading'
import React from 'react'
import AuctionForm from '../AuctionForm'

export default function Create() {
  return (
    <div className='max-w-5xl mx-auto'>
        <div className='glass-panel ios-shadow rounded-3xl p-10 border border-white/70'>
          <Heading title='List your tech drop' subtitle='Showcase your gear, earn FLOG coins, and let the arena bid it up.' />
          <AuctionForm />
        </div>
      </div>
  )
}
