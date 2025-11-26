import './globals.css'
import type { Metadata } from 'next'
import Navbar from './nav/Navbar'
import ToasterProvider from './providers/ToasterProvider'
import SignalRProvider from './providers/SignalRProvider'
import { getCurrentUser } from './actions/authActions'
import GamificationBootstrap from './providers/GamificationBootstrap'


export const metadata: Metadata = {
  title: 'Hero Exchange',
  description: 'RPG hero marketplace for rare adventurers, powered by gold.',
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser();
  return (
    <html lang="en">
      <body className="min-h-screen bg-transparent text-[var(--text)]">
        <div className="fixed inset-0 -z-10">
          <div className="h-full w-full bg-[radial-gradient(circle_at_20%_20%,rgba(139,92,246,0.12)_0,transparent_28%),radial-gradient(circle_at_80%_0,rgba(34,211,238,0.12)_0,transparent_26%),linear-gradient(180deg,var(--bg),var(--bg-2))]" />
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
