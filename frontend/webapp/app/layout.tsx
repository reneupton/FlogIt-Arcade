import './globals.css'
import type { Metadata } from 'next'
import Navbar from './nav/Navbar'
import ToasterProvider from './providers/ToasterProvider'
import SignalRProvider from './providers/SignalRProvider'
import { getCurrentUser } from './actions/authActions'
import GamificationBootstrap from './providers/GamificationBootstrap'


export const metadata: Metadata = {
  title: 'FLOG IT - TECH',
  description: 'Arcade auctions for gaming gear, powered by FLOG coins.',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser();
  return (
    <html lang="en">
      <body className="min-h-screen bg-transparent text-slate-900">
        <div className="fixed inset-0 -z-10">
          <div className="h-full w-full bg-[radial-gradient(circle_at_20%_20%,#dbe8ff_0,transparent_28%),radial-gradient(circle_at_80%_0,#efe5ff_0,transparent_26%),linear-gradient(180deg,#f5f7fb,#eef2fb)]" />
        </div>
        <ToasterProvider />
        <Navbar></Navbar>
        <main className='container mx-auto px-5 pt-10'>
          <SignalRProvider user={user}>
            <GamificationBootstrap user={user}>
              {children}
            </GamificationBootstrap>
          </SignalRProvider>
          
          </main>
        
        </body>
    </html>
  )
}
