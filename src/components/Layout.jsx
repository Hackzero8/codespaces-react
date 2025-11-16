import React from 'react'
import Navbar from './Navbar'
// Sidebar moved to DropdownMenu in Navbar; keep Sidebar file for reference
import MobileNav from './MobileNav'
import Footer from './Footer'

export default function Layout({ children, page, setPage, user, onLogout }) {
  return (
    <div className="min-h-screen flex bg-[rgb(var(--bg))] text-[rgb(var(--text))]">
      {/* Dropdown menu replaces persistent sidebar */}
      {/* Sidebar removed per UX request; to keep menu accessible we use DropdownMenu in Navbar */}

      <div className="flex-1">
        <Navbar user={user} setPage={setPage} />
        <main className="pt-16 md:pt-20">
          <div className="w-full px-4 md:container-center">
            {children}
          </div>
        </main>
        <Footer />
      </div>

      {/* Mobile nav */}
      <MobileNav page={page} setPage={setPage} user={user} onLogout={onLogout} />
    </div>
  )
}
