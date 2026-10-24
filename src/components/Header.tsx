'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { BookOpen, ShieldCheck, Bookmark, LogOut, LogIn, Plus } from 'lucide-react';
import ThemeSwitcher from '@/components/ThemeSwitcher';

export default function Header({ onOpenCreate }: { onOpenCreate?: () => void }) {
  const { data: session } = useSession();
  const user = session?.user as any;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b-2 border-slate-200 dark:border-zinc-800 transition-colors shadow-xs">
      <div className="w-full px-6 sm:px-10 h-16 flex items-center justify-between relative">
        {/* Left Section: Logo & Nav Links */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group whitespace-nowrap">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-md group-hover:scale-105 transition-transform">
              🎓
            </div>
            <span className="font-black text-xl tracking-tight text-slate-900 dark:text-zinc-100">
              Class<span className="text-indigo-600 dark:text-indigo-400">Up</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-5">
            <Link
              href="/catalog"
              className="text-xs sm:text-sm font-bold text-slate-700 dark:text-zinc-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <BookOpen className="w-4 h-4 flex-shrink-0" />
              <span>База скриптов</span>
            </Link>
            {user && (
              <Link
                href="/saved"
                className="text-xs sm:text-sm font-bold text-slate-700 dark:text-zinc-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5 whitespace-nowrap"
              >
                <Bookmark className="w-4 h-4 flex-shrink-0" />
                <span>Мои закладки</span>
              </Link>
            )}
          </nav>
        </div>

        {/* Center Section: Theme Switcher Strictly Centered */}
        <div className="hidden sm:block absolute left-1/2 -translate-x-1/2">
          <ThemeSwitcher />
        </div>

        {/* Right Section: Add Script, Admin Icon, User & Logout */}
        <div className="flex items-center gap-3">
          {/* Mobile Theme Switcher fallback */}
          <div className="sm:hidden">
            <ThemeSwitcher />
          </div>

          {onOpenCreate && user && (
            <button
              onClick={onOpenCreate}
              className="inline-flex items-center gap-1 px-3.5 py-2 rounded-2xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white transition-all shadow-md cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Скрипт</span>
            </button>
          )}

          {user ? (
            <div className="flex items-center gap-3.5 pl-2 border-l-2 border-slate-200 dark:border-zinc-800">
              {/* Admin Button as Icon-Only next to Logout */}
              {user?.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  title="Панель администратора"
                  className="p-2.5 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border-2 border-amber-300 dark:border-amber-700 hover:bg-amber-200 dark:hover:bg-amber-900 transition-colors flex items-center justify-center cursor-pointer shadow-xs"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </Link>
              )}

              <div className="text-right hidden sm:block whitespace-nowrap">
                <div className="text-xs font-black text-slate-900 dark:text-zinc-100">{user.name}</div>
                <div className="text-[10px] font-bold text-slate-500 dark:text-zinc-400">
                  {user.role === 'ADMIN' ? 'Администратор' : 'Педагог'}
                </div>
              </div>

              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                title="Выйти из аккаунта"
                className="p-2.5 rounded-2xl text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-rose-600 transition-colors cursor-pointer border-2 border-slate-200 dark:border-zinc-700"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-md whitespace-nowrap"
            >
              <LogIn className="w-4 h-4" />
              <span>Войти</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
