'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { LogIn, Lock, Mail, ShieldAlert } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error);
      } else {
        router.push('/catalog');
        router.refresh();
      }
    } catch (err) {
      setError('Ошибка при входе в систему');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors">
      <Header />

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 max-w-md w-full shadow-xl border-2 border-slate-200 dark:border-zinc-700">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto mb-3 text-2xl font-bold shadow-md">
              🎓
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-zinc-100">Вход в ClassUp</h1>
            <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1 font-semibold">
              Авторизуйтесь для доступа к банку скриптов и оценкам
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border-2 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1.5">
                Email адрес
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 dark:text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 z-10" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@classup.ru"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-slate-300 dark:border-zinc-600 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1.5">
                Пароль
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 dark:text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 z-10" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-slate-300 dark:border-zinc-600 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-2xl font-bold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              {isLoading ? 'Авторизация...' : 'Войти в систему'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
