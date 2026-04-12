"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 w-full lg:hidden z-50 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md flex justify-around items-center px-4 py-3 pb-safe border-t border-slate-200/50 dark:border-slate-800/50 shadow-[0_-4px_20px_rgba(13,52,89,0.05)]">
      <Link
        className={`flex flex-col items-center justify-center transition-transform active:scale-90 ${pathname === '/' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/40 rounded-2xl px-4 py-1.5' : 'text-slate-400 dark:text-slate-500 hover:text-indigo-500'}`}
        href="/"
      >
        <span className="material-symbols-outlined" style={pathname === '/' ? { fontVariationSettings: "'FILL' 1" } : {}}>home</span>
        <span className="text-[11px] font-['Inter'] font-medium">Home</span>
      </Link>
      <Link
        className={`flex flex-col items-center justify-center transition-transform active:scale-90 ${pathname === '/tutor' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/40 rounded-2xl px-4 py-1.5' : 'text-slate-400 dark:text-slate-500 hover:text-indigo-500'}`}
        href="/tutor"
      >
        <span className="material-symbols-outlined" style={pathname === '/tutor' ? { fontVariationSettings: "'FILL' 1" } : {}}>record_voice_over</span>
        <span className="text-[11px] font-['Inter'] font-medium">Screener</span>
      </Link>
      <Link
        className={`flex flex-col items-center justify-center transition-transform active:scale-90 ${pathname === '/studio' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/40 rounded-2xl px-4 py-1.5' : 'text-slate-400 dark:text-slate-500 hover:text-indigo-500'}`}
        href="/studio"
      >
        <span className="material-symbols-outlined" style={pathname === '/studio' ? { fontVariationSettings: "'FILL' 1" } : {}}>auto_awesome</span>
        <span className="text-[11px] font-['Inter'] font-medium">Studio</span>
      </Link>
      <Link
        className={`flex flex-col items-center justify-center transition-transform active:scale-90 ${pathname === '/dashboard' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/40 rounded-2xl px-4 py-1.5' : 'text-slate-400 dark:text-slate-500 hover:text-indigo-500'}`}
        href="/dashboard"
      >
        <span className="material-symbols-outlined" style={pathname === '/dashboard' ? { fontVariationSettings: "'FILL' 1" } : {}}>dashboard</span>
        <span className="text-[11px] font-['Inter'] font-medium">Dash</span>
      </Link>
      <Link
        className={`flex flex-col items-center justify-center transition-transform active:scale-90 ${pathname === '/analytics' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/40 rounded-2xl px-4 py-1.5' : 'text-slate-400 dark:text-slate-500 hover:text-indigo-500'}`}
        href="/analytics"
      >
        <span className="material-symbols-outlined" style={pathname === '/analytics' ? { fontVariationSettings: "'FILL' 1" } : {}}>leaderboard</span>
        <span className="text-[11px] font-['Inter'] font-medium">Stats</span>
      </Link>
    </nav>
  );
}
