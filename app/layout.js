import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'TMOF Couriers - Driver Portal',
  description: 'Mobile PWA for TMOF Couriers Drivers',
  manifest: '/manifest.json',
  themeColor: '#ffd215',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/tmof-logo-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/tmof-logo-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Primary favicon - SVG for modern browsers */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/tmof-logo-192.png" type="image/png" sizes="192x192" />
        <link rel="icon" href="/tmof-logo-512.png" type="image/png" sizes="512x512" />
        
        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/icon-192x192.png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/icon-512x512.png" sizes="512x512" />
        
        {/* PWA Configuration */}
        <meta name="theme-color" content="#ffd215" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="TMOF Driver" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Additional PWA meta tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="TMOF Driver" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}