'use client'

import { useParamStore } from '@/hooks/useParamsStore'
import { usePathname, useRouter } from 'next/navigation'
import React, { useState } from 'react'
import {FaSearch} from 'react-icons/fa'
import {isMobile} from 'react-device-detect';


export default function Search() {
  const router = useRouter();
  const pathname = usePathname();
  const setParams = useParamStore(state => state.setParams);
  const setSearchValue = useParamStore(state => state.setSearchValue);
  const searchValue = useParamStore(state => state.searchValue);

  function onChange(event: any) {
    setSearchValue(event.target.value);
  }

  function search(){
    if(pathname !== '/') router.push('/');
    setParams({searchTerm: searchValue})
  }

  if(isMobile) return (
    <div></div>
  )
  return (
    <div className='flex w-full items-center rounded-full px-4 py-2 border border-[var(--card-border)] bg-[rgba(26,32,48,0.8)] backdrop-blur-lg shadow-lg gap-2'>
        <input 
        onKeyDown={(e: any) => {
            if(e.key === 'Enter') search();
        }}
        value={searchValue}
        onChange={onChange}
        type="text"
        placeholder='Search for heroes by name, discipline or rarity'
        className='
        input-custom text-sm text-[var(--text)] placeholder:text-[var(--muted)]
        '
        />
        <button onClick={search}>
            <FaSearch size={34} className='bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] text-white rounded-full p-2 cursor-pointer mx-2 shadow-md border border-[var(--card-border)]'/>
        </button>
    </div>
  )
}
