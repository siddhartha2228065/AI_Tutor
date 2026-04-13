import Image from "next/image";
import { useTheme } from "./ThemeContext";
import { useSound } from "@/hooks/useSound";

export default function Header() {
  const { theme, toggle } = useTheme();
  const { playHover, playClick, playThemeSwitch } = useSound();
  return (
    <header className="w-full sticky top-0 z-40 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-xl flex justify-between items-center px-6 py-3 font-['Plus_Jakarta_Sans'] font-medium">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="flex items-center bg-slate-100 dark:bg-slate-900 rounded-full px-4 py-2 w-full max-w-md group focus-within:ring-2 ring-primary/20 transition-all">
          <span className="material-symbols-outlined text-slate-400 mr-2">search</span>
          <input
            className="bg-transparent border-none focus:ring-0 text-sm w-full outline-none placeholder:text-slate-400"
            placeholder="Search math topics or Grade 8 lessons..."
            type="text"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button 
          onClick={() => { toggle(); playThemeSwitch(); }}
          onMouseEnter={playHover}
          className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors rounded-full active:scale-95 duration-200"
          title={`Switch to ${theme === 'nexus' ? 'Brand' : 'Nexus'} theme`}
        >
          <span className="material-symbols-outlined">
            {theme === 'nexus' ? 'light_mode' : 'dark_mode'}
          </span>
        </button>
        <button 
          onClick={playClick}
          onMouseEnter={playHover}
          className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors rounded-full active:scale-95 duration-200"
        >
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button 
          onClick={playClick}
          onMouseEnter={playHover}
          className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors rounded-full active:scale-95 duration-200"
        >
          <span className="material-symbols-outlined">settings</span>
        </button>
        <div className="flex items-center gap-6 pl-6 border-l border-white/5">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1">Expert Level</p>
            <div className="flex items-center gap-2">
               <div className="h-1.5 w-16 bg-white/5 rounded-full overflow-hidden">
                 <div className="h-full w-3/4 bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
               </div>
               <span className="text-[10px] font-bold text-white">Lvl 14</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-400/20 flex items-center justify-center group hover:bg-indigo-500/20 transition-all cursor-pointer">
            <span className="material-symbols-outlined text-indigo-400 text-xl group-hover:scale-110 transition-transform">person</span>
          </div>
        </div>
      </div>
    </header>
  );
}
