"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "./SidebarContext";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";
import { useSound } from "@/hooks/useSound";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/tutor", label: "AI Screener", icon: "record_voice_over" },
  { href: "/roadmap", label: "Roadmap", icon: "map" },
  { href: "/studio", label: "AI Studio", icon: "auto_awesome" },
  { href: "/analytics", label: "Math Analytics", icon: "analytics" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isOpen, toggle } = useSidebar();
  const { isOnline, pendingSyncCount } = useOfflineStatus();
  const { playHover, playClick } = useSound();

  const connectivityColor = !isOnline 
    ? 'bg-rose-500' 
    : pendingSyncCount > 0 
      ? 'bg-amber-500 animate-pulse' 
      : 'bg-emerald-500';

  return (
    <aside
      className={`h-screen fixed left-0 top-0 hidden lg:flex flex-col bg-slate-950 font-['Plus_Jakarta_Sans'] p-3 gap-2 border-r border-white/5 z-50 transition-all duration-300 ease-in-out ${
        isOpen ? "w-64" : "w-[72px]"
      }`}
    >
      {/* Logo + Toggle */}
      <Link
        href="/#hero"
        className={`flex items-center gap-3 px-2 py-4 cursor-pointer group`}
      >
        <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center flex-shrink-0 group-hover:shadow-lg group-hover:shadow-indigo-500/30 transition-shadow relative">
          <span
            className="material-symbols-outlined text-indigo-400"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            calculate
          </span>
          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-950 ${connectivityColor}`} />
        </div>
        {isOpen && (
          <div className="overflow-hidden animate-fade-in text-white">
            <h2 className="text-xl font-black tracking-tight leading-tight whitespace-nowrap">
              Cuemath
            </h2>
            <p className="text-[10px] uppercase tracking-[0.2em] text-indigo-400/60 font-black whitespace-nowrap">
              The Math Expert
            </p>
          </div>
        )}
      </Link>

      {/* Toggle button */}
      <button
        onClick={() => { toggle(); playClick(); }}
        onMouseEnter={playHover}
        className="w-full flex items-center justify-center py-2 mb-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-white/5"
      >
        <span className="material-symbols-outlined text-lg transition-transform duration-300" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          chevron_right
        </span>
      </button>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
              <Link
              key={item.href}
              onClick={playClick}
              onMouseEnter={playHover}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 ease-in-out group relative ${
                isActive
                  ? "bg-indigo-600 text-white font-semibold shadow-xl shadow-indigo-600/40 border border-indigo-400/50"
                  : "text-slate-500 hover:text-white hover:bg-white/5"
              } ${isOpen ? "" : "justify-center"}`}
              href={item.href}
            >
              <span
                className="material-symbols-outlined text-[22px] flex-shrink-0"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {item.icon}
              </span>
              {isOpen && (
                <span className="whitespace-nowrap text-sm">{item.label}</span>
              )}

              {/* Tooltip on collapsed state */}
              {!isOpen && (
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 border border-white/10 text-white text-xs font-bold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-2xl z-50">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="mt-auto space-y-2">
        {isOpen && (
          <div className="bg-indigo-600/10 border border-indigo-500/20 p-4 rounded-xl relative overflow-hidden group cursor-pointer transition-transform active:scale-95 shadow-inner">
            <div className="relative z-10">
              <p className="text-indigo-400 text-[10px] font-black tracking-widest mb-1 uppercase">PRO PLAN</p>
              <p className="text-white text-sm font-bold">Unlock potential</p>
            </div>
            <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-indigo-500/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
          </div>
        )}
        <Link
          onClick={playClick}
          onMouseEnter={playHover}
          className={`flex items-center gap-3 px-3 py-3 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300 ease-in-out ${isOpen ? "" : "justify-center"}`}
          href="#"
        >
          <span className="material-symbols-outlined text-[22px]">help_outline</span>
          {isOpen && <span className="text-sm font-medium">Help Center</span>}
        </Link>
      </div>
    </aside>
  );
}
