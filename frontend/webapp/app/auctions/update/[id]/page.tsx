import Heading from '@/app/components/Heading'
import React from 'react'
import AuctionForm from '../../AuctionForm'
import { getDetailedViewData } from '@/app/actions/auctionActions'

export default async function Update({params} :{params: {id: string}}) {
  const data = await getDetailedViewData(params.id);
  return (
    <div className='max-w-5xl mx-auto'>
      <div className='glass-panel ios-shadow rounded-3xl p-10 border border-white/70'>
        <Heading title='Refine your listing' subtitle='Tune your specs, artwork, and reserve to keep the hype rolling.' />
        <AuctionForm auction={data} />
      </div>
    </div>
  )
}
