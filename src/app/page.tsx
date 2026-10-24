'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import ScriptCard, { ScriptItem } from '@/components/ScriptCard';
import ScriptModal from '@/components/ScriptModal';
import ScriptFormModal from '@/components/ScriptFormModal';
import { Search, Sparkles, BookOpen, Users, CheckCircle2, SlidersHorizontal, ArrowRight } from 'lucide-react';

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

        // Extract categories if empty
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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Header */}
      <Header onOpenCreate={() => { setScriptToEdit(null); setIsFormOpen(true); }} />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-indigo-900 via-indigo-800 to-slate-900 text-white pt-16 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.15),transparent)] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-medium mb-6 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Ускоренная адаптация молодых педагогов
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight sm:leading-tight">
            База готовых ответов и скриптов для молодых учителей
          </h1>

          <p className="mt-4 text-base sm:text-lg text-indigo-100/80 max-w-2xl mx-auto font-light leading-relaxed">
            Проверенные алгоритмы коммуникации во взаимодействии со школьниками и их родителями. Уверенность в каждом решении и сохранение профессиональных границ.
          </p>

          {/* Quick Stats */}
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <div className="text-2xl font-black text-amber-300">50+</div>
              <div className="text-xs text-indigo-200 font-medium">Готовых сценариев</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <div className="text-2xl font-black text-amber-300">100%</div>
              <div className="text-xs text-indigo-200 font-medium">Практические советы</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <div className="text-2xl font-black text-amber-300">Excel</div>
              <div className="text-xs text-indigo-200 font-medium">Выгрузка & Импорт</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <div className="text-2xl font-black text-amber-300">RBAC</div>
              <div className="text-xs text-indigo-200 font-medium">Панель администратора</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full" id="catalog">
        {/* Search & Filters */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 mb-8 space-y-6">
          <form onSubmit={handleSearchSubmit} className="relative max-w-2xl mx-auto">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по ситуациям, фразам, фразам-отказам..."
              className="w-full pl-12 pr-28 py-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-colors"
            >
              Найти
            </button>
          </form>

          {/* Categories Tags */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Все категории
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                    selectedCategory === cat.slug
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Sorting */}
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Сортировка:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="newest">Сначала новые</option>
                <option value="rating">По рейтингу</option>
                <option value="popular">По популярности</option>
              </select>
            </div>
          </div>
        </div>

        {/* Scripts Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-slate-200/60 rounded-2xl animate-pulse" />
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
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3 text-xl">
              🔍
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Скрипты не найдены</h3>
            <p className="text-xs text-slate-500 mb-4">
              Попробуйте изменить поисковый запрос или фильтр категорий.
            </p>
            <button
              onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
              className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-semibold hover:bg-indigo-100 transition-colors"
            >
              Сбросить фильтры
            </button>
          </div>
        )}
      </main>

      {/* Script Detailed Modal */}
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

      {/* Script Create/Edit Form Modal */}
      {isFormOpen && (
        <ScriptFormModal
          scriptToEdit={scriptToEdit}
          onClose={() => setIsFormOpen(false)}
          onSaved={fetchScripts}
        />
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs">
          <p className="mb-2">
            &copy; 2025 ClassUp. Платформа психологической и методической поддержки молодых педагогов.
          </p>
          <p className="text-slate-500">
            Next.js App Router • Prisma ORM • PostgreSQL • Excel Integration • NextAuth RBAC
          </p>
        </div>
      </footer>
    </div>
  );
}
