"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; email: string; department: string } | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem('userSession');
    if (session) {
      setUser(JSON.parse(session));
    } else {
      router.push('/login');
    }
  }, [router]);

  if (!user) {
    return <div className="flex min-h-screen items-center justify-center bg-v-white text-v-text">Loading...</div>;
  }

  const navLinks = [
    { label: 'Department', href: '/dashboard', icon: '🏛️' },
    { label: 'Upload', href: '/dashboard/upload', icon: '📤' },
    { label: 'Leaderboard', href: '/dashboard/leaderboard', icon: '🏆' },
    { label: 'Queries', href: '/dashboard/queries', icon: '💬' },
  ];

  return (
    <div className="flex min-h-screen bg-v-white text-v-text">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-v-blue/30 bg-v-blue md:flex shadow-2xl shadow-v-blue/20">
        <div className="flex h-40 items-center justify-center px-4 border-b border-v-lavender/20">
          <img 
            src="/logo-degree.png" 
            alt="DeGree Logo" 
            className="h-24 w-auto object-contain hover:scale-105 transition-transform duration-300 cursor-pointer drop-shadow-lg"
          />
        </div>
        {/* Sidebar Nav */}
        <nav className="flex-1 space-y-2 px-4 py-4">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-2xl px-5 py-4 text-sm font-black transition-all duration-300 ${
                  isActive 
                    ? 'bg-v-lavender text-v-text shadow-xl shadow-v-lavender/40 scale-[1.05]' 
                    : 'text-v-text/60 hover:bg-white/20 hover:text-v-text'
                }`}
              >
                <span className="text-xl">{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-v-lavender/20">
          <button 
            onClick={() => {
              localStorage.removeItem('userSession');
              router.push('/login');
            }}
            className="flex w-full items-center gap-3 rounded-2xl px-5 py-3 text-sm font-black text-v-text/60 transition-all hover:bg-v-peach/30 hover:text-v-text"
          >
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* Mobile Top Bar & Overlay Menu */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-v-blue/30 bg-v-blue px-4 md:hidden">
          <span className="text-xl font-black text-v-text tracking-tighter">DeGree</span>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-v-text focus:outline-none focus:bg-white/20 rounded-xl transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen 
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </header>

        {/* Mobile Navigation Dropdown */}
        {isMobileMenuOpen && (
          <nav className="border-b border-v-blue/30 bg-v-blue px-4 py-4 md:hidden space-y-2">
            {navLinks.map((link) => {
               const isActive = pathname === link.href;
               return (
                 <Link
                   key={link.href}
                   href={link.href}
                   onClick={() => setIsMobileMenuOpen(false)}
                   className={`flex items-center gap-3 rounded-2xl px-6 py-4 text-base font-black transition-all ${
                     isActive 
                       ? 'bg-v-lavender text-v-text shadow-xl' 
                       : 'text-v-text/60 hover:bg-white/20'
                   }`}
                 >
                   <span className="text-2xl">{link.icon}</span>
                   {link.label}
                 </Link>
               );
            })}
            <button 
              onClick={() => {
                localStorage.removeItem('userSession');
                router.push('/login');
              }}
              className="flex w-full mt-4 items-center gap-3 rounded-2xl px-6 py-4 text-base font-black text-v-text/60 hover:bg-v-peach/30"
            >
              <span className="text-2xl">🚪</span> Logout
            </button>
          </nav>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-v-white p-4 md:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
