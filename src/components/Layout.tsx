import React from 'react'
import Header from './Header'
import Footer from './Footer'

export default function Layout({ children }: { children?: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <a className="sr-only focus:not-sr-only" href="#main">Skip to content</a>
      <Header />
      <main id="main" className="max-w-3xl mx-auto p-4">{children}</main>
      <Footer />
    </div>
  )
}
