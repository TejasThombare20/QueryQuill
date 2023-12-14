import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { cn, constructMetaData } from '@/lib/utils'
import Navbar from '@/components/Navbar'
import Provider from '@/components/Provider'
import { Toaster } from '@/components/ui/toaster'

import 'react-loading-skeleton/dist/skeleton.css'
import 'simplebar-react/dist/simplebar.min.css';


const inter = Inter({ subsets: ['latin'] })

export const metadata = constructMetaData()

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className='light'>
      <Provider >
        {/* <body className={cn("min-h-screen font-sans antialiased grainy", inter.className)}> */}
        <body className={cn("min-h-screen font-sans antialiased ", inter.className)}>
          <Toaster/>
          <Navbar />
          {children}

        </body>
      </Provider>
    </html>
  )
}
