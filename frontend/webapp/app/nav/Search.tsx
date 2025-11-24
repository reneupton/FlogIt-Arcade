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
    <div className='flex w-full items-center rounded-full px-4 py-2 border border-white/70 bg-white/80 backdrop-blur-lg shadow-lg gap-2'>
        <input 
        onKeyDown={(e: any) => {
            if(e.key === 'Enter') search();
        }}
        value={searchValue}
        onChange={onChange}
        type="text"
        placeholder='Search for gear by title, brand or category'
        className='
        input-custom text-sm text-gray-700 placeholder:text-slate-400
        '
        />
        <button onClick={search}>
            <FaSearch size={34} className='bg-gradient-to-br from-[#5b7bff] to-[#9f7aea] text-white rounded-full p-2 cursor-pointer mx-2 shadow-md'/>
        </button>
    </div>
  )
}
