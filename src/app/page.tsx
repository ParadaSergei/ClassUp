'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ScriptCard, { ScriptItem } from '@/components/ScriptCard';
import ScriptModal from '@/components/ScriptModal';
import ScriptFormModal from '@/components/ScriptFormModal';
import { Search, Sparkles, SlidersHorizontal } from 'lucide-react';

export default function Home() {
  const [scripts, setScripts] = useState<ScriptItem[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals state
  const [selectedScript, setSelectedScript] = useState<ScriptItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [scriptToEdit, setScriptToEdit] = useState<ScriptItem | null>(null);

  const fetchScripts = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.set('category', selectedCategory);
      if (searchQuery) params.set('search', searchQuery);
      if (sortBy) params.set('sort', sortBy);

      const res = await fetch(`/api/scripts?${params.toString()}`);
      const data = await res.json();

      if (data.scripts) {
        setScripts(data.scripts);

        if (categories.length === 0) {
          const catMap = new Map();
          data.scripts.forEach((s: any) => {
            if (s.category) catMap.set(s.category.slug, s.category);
          });
          setCategories(Array.from(catMap.values()));
        }
      }
    } catch (err) {
      console.error('Error fetching scripts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchScripts();
  }, [selectedCategory, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchScripts();
  };

  const handleToggleSave = async (id: string) => {
    try {
      await fetch(`/api/scripts/${id}/save`, { method: 'POST' });
    } catch (err) {
      console.error('Error toggling save:', err);
    }
  };

  const handleDeleteScript = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот скрипт?')) return;
    try {
      const res = await fetch(`/api/scripts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSelectedScript(null);
        fetchScripts();
      }
    } catch (err) {
      console.error('Error deleting script:', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors">
      {/* Header */}
      <Header onOpenCreate={() => { setScriptToEdit(null); setIsFormOpen(true); }} />

      {/* Hero Section with Animated Gradient Background */}
      <section className="animated-gradient-color pt-20 pb-24 relative overflow-hidden shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 border border-white/30 text-white text-xs font-bold mb-6 backdrop-blur-md shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Ускоренная адаптация молодых педагогов
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight max-w-4xl mx-auto leading-tight text-white drop-shadow-md">
            База готовых ответов и скриптов для молодых учителей
          </h1>

          <p className="mt-4 text-sm sm:text-base text-white/95 max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-xs">
            Проверенные алгоритмы коммуникации во взаимодействии со школьниками и их родителями. Уверенность в каждом решении и сохранение профессиональных границ.
          </p>

          {/* Quick Stats Cards */}
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="bg-white/15 backdrop-blur-md p-4.5 rounded-3xl border border-white/20 shadow-md">
              <div className="text-2xl font-black text-amber-300">50+</div>
              <div className="text-xs text-white font-bold">Готовых сценариев</div>
            </div>
            <div className="bg-white/15 backdrop-blur-md p-4.5 rounded-3xl border border-white/20 shadow-md">
              <div className="text-2xl font-black text-amber-300">100%</div>
              <div className="text-xs text-white font-bold">Практические советы</div>
            </div>
            <div className="bg-white/15 backdrop-blur-md p-4.5 rounded-3xl border border-white/20 shadow-md">
              <div className="text-2xl font-black text-amber-300">Excel</div>
              <div className="text-xs text-white font-bold">Выгрузка & Импорт</div>
            </div>
            <div className="bg-white/15 backdrop-blur-md p-4.5 rounded-3xl border border-white/20 shadow-md">
              <div className="text-2xl font-black text-amber-300">RBAC</div>
              <div className="text-xs text-white font-bold">Панель админа</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full" id="catalog">
        {/* Search & Filters */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-md border-2 border-slate-200 dark:border-zinc-700 mb-8 space-y-6">
          <form onSubmit={handleSearchSubmit} className="relative max-w-2xl mx-auto">
            <Search className="w-5 h-5 text-slate-500 dark:text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2 z-10" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по ситуациям, фразам, фразам-отказам..."
              className="w-full pl-12 pr-28 py-3.5 bg-slate-50 dark:bg-zinc-800 rounded-2xl border-2 border-slate-300 dark:border-zinc-600 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-zinc-100 transition-all"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              Найти
            </button>
          </form>

          {/* Categories Tags */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t-2 border-slate-100 dark:border-zinc-800">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-700 border border-slate-300 dark:border-zinc-700'
                }`}
              >
                Все категории
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    selectedCategory === cat.slug
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-700 border border-slate-300 dark:border-zinc-700'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Sorting */}
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-zinc-300">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Сортировка:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent font-bold text-slate-900 dark:text-zinc-100 focus:outline-none cursor-pointer border-b-2 border-indigo-500 py-1"
              >
                <option value="newest" className="dark:bg-zinc-900">Сначала новые</option>
                <option value="rating" className="dark:bg-zinc-900">По рейтингу</option>
                <option value="popular" className="dark:bg-zinc-900">По популярности</option>
              </select>
            </div>
          </div>
        </div>

        {/* Scripts Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-slate-200/60 dark:bg-zinc-800/60 rounded-3xl animate-pulse border-2 border-slate-200 dark:border-zinc-700" />
            ))}
          </div>
        ) : scripts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scripts.map((script) => (
              <ScriptCard
                key={script.id}
                script={script}
                onClick={() => setSelectedScript(script)}
                onToggleSave={handleToggleSave}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-12 text-center border-2 border-slate-200 dark:border-zinc-800 max-w-md mx-auto shadow-md">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3 text-xl font-bold">
              🔍
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100 mb-1">Скрипты не найдены</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mb-4">
              Попробуйте изменить поисковый запрос или фильтр категорий.
            </p>
            <button
              onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold transition-colors cursor-pointer shadow-sm"
            >
              Сбросить фильтры
            </button>
          </div>
        )}
      </main>

      {/* Modals */}
      {selectedScript && (
        <ScriptModal
          script={selectedScript}
          onClose={() => setSelectedScript(null)}
          onUpdate={fetchScripts}
          onEdit={(s) => {
            setSelectedScript(null);
            setScriptToEdit(s);
            setIsFormOpen(true);
          }}
          onDelete={handleDeleteScript}
        />
      )}

      {isFormOpen && (
        <ScriptFormModal
          scriptToEdit={scriptToEdit}
          onClose={() => setIsFormOpen(false)}
          onSaved={fetchScripts}
        />
      )}

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-black text-slate-300 dark:text-zinc-400 py-12 border-t-2 border-slate-800 dark:border-zinc-900 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs">
          <p className="mb-2 font-medium">
            &copy; 2025 ClassUp. Платформа психологической и методической поддержки молодых педагогов.
          </p>
          <p className="text-slate-400 dark:text-zinc-500">
            Next.js App Router • Prisma ORM • PostgreSQL • Excel Integration • NextAuth RBAC
          </p>
        </div>
      </footer>
    </div>
  );
}
