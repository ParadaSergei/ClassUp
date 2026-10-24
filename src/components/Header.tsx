'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { BookOpen, ShieldCheck, Bookmark, LogOut, LogIn, Plus, Bell, CheckCheck, FileText } from 'lucide-react';
import ThemeSwitcher from '@/components/ThemeSwitcher';

export default function Header({ onOpenCreate }: { onOpenCreate?: () => void }) {
  const { data: session } = useSession();
  const user = session?.user as any;

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isBellOpen, setIsBellOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [user]);

  // Handle outside click to close popover
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsBellOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch('/api/notifications', { method: 'PATCH' });
      if (res.ok) {
        setUnreadCount(0);
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      }
    } catch (err) {
      console.error('Error marking notifications as read:', err);
    }
  };

  const handleNotificationClick = async (notif: any) => {
    if (!notif.isRead) {
      fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: notif.id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    setIsBellOpen(false);
  };

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

        {/* Center Section: Theme Switcher & Bell Button Immediately to the Right */}
        <div className="hidden sm:flex items-center gap-3 absolute left-1/2 -translate-x-1/2">
          <ThemeSwitcher />

          {/* Bell Icon Button & Popover Notification Dropdown */}
          {user && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsBellOpen(!isBellOpen)}
                title="Уведомления от администрации"
                className="relative p-2.5 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer border-2 border-slate-200 dark:border-zinc-700 shadow-xs flex items-center justify-center"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-600 text-white font-black text-[10px] flex items-center justify-center border-2 border-white dark:border-zinc-900 animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Popover Area for Notifications */}
              {isBellOpen && (
                <div className="absolute top-12 left-0 w-80 sm:w-96 bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border-2 border-slate-200 dark:border-zinc-700 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b-2 border-slate-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span className="text-xs font-black text-slate-900 dark:text-zinc-100">
                        Уведомления от администрации
                      </span>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Прочитать все</span>
                      </button>
                    )}
                  </div>

                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs font-bold text-slate-400 dark:text-zinc-500">
                      Уведомлений пока нет
                    </div>
                  ) : (
                    <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1">
                      {notifications.map((n) => (
                        <Link
                          key={n.id}
                          href={`/catalog?scriptId=${n.scriptId}`}
                          onClick={() => handleNotificationClick(n)}
                          className={`block p-3 rounded-2xl border-2 transition-all text-left ${
                            n.isRead
                              ? 'bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-800 opacity-75'
                              : 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 shadow-xs'
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <div className="p-2 rounded-xl bg-indigo-600 text-white flex-shrink-0 mt-0.5">
                              <FileText className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-extrabold text-slate-900 dark:text-zinc-100 line-clamp-2">
                                {n.message}
                              </p>
                              {n.script?.title && (
                                <p className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 mt-1 truncate">
                                  📌 {n.script.title}
                                </p>
                              )}
                              <span className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 mt-1 block">
                                {new Date(n.createdAt).toLocaleString('ru-RU', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Section: Add Script, Admin Icon, User & Logout */}
        <div className="flex items-center gap-3">
          {/* Mobile Theme Switcher fallback */}
          <div className="sm:hidden flex items-center gap-2">
            <ThemeSwitcher />
            {user && (
              <button
                onClick={() => setIsBellOpen(!isBellOpen)}
                className="relative p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            )}
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
