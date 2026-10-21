'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ScriptCard, { ScriptItem } from '@/components/ScriptCard';
import ScriptModal from '@/components/ScriptModal';
import { Bookmark, BookOpen } from 'lucide-react';

export default function SavedPage() {
  const [savedScripts, setSavedScripts] = useState<ScriptItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedScript, setSelectedScript] = useState<ScriptItem | null>(null);

  const fetchSavedScripts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/scripts');
      const data = await res.json();
      if (data.scripts) {
        const savedOnly = data.scripts.filter((s: ScriptItem) => s.isSaved);
        setSavedScripts(savedOnly);
      }
    } catch (err) {
      console.error('Error fetching saved scripts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedScripts();
  }, []);

  const handleToggleSave = async (id: string) => {
    try {
      await fetch(`/api/scripts/${id}/save`, { method: 'POST' });
      fetchSavedScripts();
    } catch (err) {
      console.error('Error toggling save:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Bookmark className="w-5 h-5 fill-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Мои сохраненные скрипты</h1>
            <p className="text-xs text-slate-500">
              Быстрый доступ к выбранным сценариям педагогических решений
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-slate-200/60 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : savedScripts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedScripts.map((script) => (
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
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <Bookmark className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">У вас пока нет сохраненных скриптов</h3>
            <p className="text-xs text-slate-500 mb-4">
              Нажимайте на иконку закладки на карточке скрипта в каталоге, чтобы сохранить его сюда.
            </p>
          </div>
        )}
      </main>

      {selectedScript && (
        <ScriptModal
          script={selectedScript}
          onClose={() => setSelectedScript(null)}
          onUpdate={fetchSavedScripts}
        />
      )}
    </div>
  );
}
