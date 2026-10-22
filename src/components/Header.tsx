'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { BookOpen, ShieldCheck, Bookmark, LogOut, LogIn, PlusCircle } from 'lucide-react';
import ThemeSwitcher from '@/components/ThemeSwitcher';

export default function Header({ onOpenCreate }: { onOpenCreate?: () => void }) {
  const { data: session } = useSession();
  const user = session?.user as any;

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-zinc-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:scale-105 transition-transform">
            🎓
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-zinc-100">
            Class<span className="text-indigo-600 dark:text-indigo-400">Up</span>
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/catalog"
            className="text-sm font-medium text-slate-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4" />
            База скриптов
          </Link>
          {user && (
            <Link
              href="/saved"
              className="text-sm font-medium text-slate-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5"
            >
              <Bookmark className="w-4 h-4" />
              Мои закладки
            </Link>
          )}
          {user?.role === 'ADMIN' && (
            <Link
              href="/admin"
              className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-100/80 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/50 hover:bg-amber-200 transition-colors flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Панель администратора
            </Link>
          )}
        </nav>

        {/* Actions & Theme Switcher */}
        <div className="flex items-center gap-3">
          {/* Theme Switcher */}
          <ThemeSwitcher />

          {onOpenCreate && user && (
            <button
              onClick={onOpenCreate}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              Добавить скрипт
            </button>
          )}

          {user ? (
            <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-zinc-800">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-slate-800 dark:text-zinc-200">{user.name}</div>
                <div className="text-[10px] text-slate-500 dark:text-zinc-400">
                  {user.role === 'ADMIN' ? 'Администратор' : 'Педагог'}
                </div>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                title="Выйти"
                className="p-2 rounded-2xl text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-rose-600 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Войти
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
