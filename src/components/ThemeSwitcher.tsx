'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon, Palette, Laptop } from 'lucide-react';

export default function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-32 h-9 rounded-2xl bg-slate-100 dark:bg-zinc-800 animate-pulse" />
    );
  }

  return (
    <div className="inline-flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs gap-1">
      <button
        onClick={() => setTheme('light')}
        title="Белая тема (Light)"
        className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all flex items-center gap-1 ${
          theme === 'light'
            ? 'bg-white text-indigo-600 shadow-xs font-semibold'
            : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
        }`}
      >
        <Sun className="w-3.5 h-3.5" />
        <span className="hidden lg:inline">White</span>
      </button>

      <button
        onClick={() => setTheme('grey')}
        title="Серая тема (Grey)"
        className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all flex items-center gap-1 ${
          theme === 'grey'
            ? 'bg-zinc-700 text-indigo-300 shadow-xs font-semibold'
            : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
        }`}
      >
        <Palette className="w-3.5 h-3.5" />
        <span className="hidden lg:inline">Grey</span>
      </button>

      <button
        onClick={() => setTheme('dark')}
        title="Черная тема (Black)"
        className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all flex items-center gap-1 ${
          theme === 'dark'
            ? 'bg-zinc-800 text-indigo-400 shadow-xs font-semibold'
            : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
        }`}
      >
        <Moon className="w-3.5 h-3.5" />
        <span className="hidden lg:inline">Black</span>
      </button>

      <button
        onClick={() => setTheme('system')}
        title="Системная тема"
        className={`p-1.5 rounded-xl text-xs font-medium transition-all ${
          theme === 'system'
            ? 'bg-indigo-600 text-white shadow-xs font-semibold'
            : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
        }`}
      >
        <Laptop className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
