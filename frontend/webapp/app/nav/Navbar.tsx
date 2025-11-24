import React from 'react'
import Search from './Search'
import Logo from './Logo'
import LoginButton from './LoginButton'
import UserActions from './UserActions';
import { getCurrentUser } from '../actions/authActions';

export default async function Navbar() {
  const user = await getCurrentUser();
  return (
    <header className='sticky top-0 z-50 px-6 py-4 bg-white/60 backdrop-blur-2xl border-b border-white/70 shadow-[0_20px_40px_rgba(15,23,42,0.08)]'>
      <div className='flex items-center gap-6'>
        <Logo />
        <div className='flex-1'>
          <Search />
        </div>
        {user ? (<UserActions user={user} /> ) : ( <LoginButton />)}
      </div>
    </header>
  )
}
