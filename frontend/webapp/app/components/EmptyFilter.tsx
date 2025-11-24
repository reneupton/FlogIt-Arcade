'use client'

import { useParamStore } from '@/hooks/useParamsStore'
import React from 'react'
import Heading from './Heading'
import { Button } from 'flowbite-react'
import { signIn } from 'next-auth/react'

type Props = {
    title? : string
    subtitle?: string
    showReset?: boolean
    showLogin?: boolean
    callbackUrl?: string
}

export default function EmptyFilter({
    title = 'No matches for this filter',
    subtitle = 'Try changing or resetting the filter',
    showReset,
    showLogin,
    callbackUrl
}: Props) {

    const reset = useParamStore(state => state.reset);

  return (
    <div className='h-[40vh] flex flex-col gap-3 justify-center items-center glass-panel rounded-3xl p-6 border border-white/70 ios-shadow text-center'>
        <Heading title={title} subtitle={subtitle} center />
        <div className='mt-4'>
            {showReset && (
                <Button outline color="light" className="soft-button-ghost" onClick={reset}>Remove Filters</Button>
            )}
            {showLogin && (
                <Button outline color="light" className="soft-button-ghost ml-2" onClick={() => signIn('id-server', {callbackUrl})}>Login</Button>
            )}
        </div>
    </div>
  )
}
