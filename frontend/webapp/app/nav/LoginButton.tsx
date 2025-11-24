'use client'

import { signIn } from 'next-auth/react'
import {isMobile} from 'react-device-detect';
import React from 'react'

export default function LoginButton() {
  if(isMobile) return (
    <div></div>
  )
  return (
    <button className="soft-button px-4 py-2" onClick={() => signIn('id-server', {callbackUrl: '/'}, {prompt: 'login'})}>
        Login
    </button>
  )
}
