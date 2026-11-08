'use client';

import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { ScriptItem } from './ScriptCard';

interface ScriptFormModalProps {
  scriptToEdit?: ScriptItem | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function ScriptFormModal({ scriptToEdit, onClose, onSaved }: ScriptFormModalProps) {
  const [title, setTitle] = useState(scriptToEdit?.title || '');
  const [situation, setSituation] = useState(scriptToEdit?.situation || '');
  const [content, setContent] = useState(scriptToEdit?.content || '');
  const [methodTip, setMethodTip] = useState(scriptToEdit?.methodTip || '');
  const [categoryId, setCategoryId] = useState(scriptToEdit?.category?.id || '');
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (data.categories && data.categories.length > 0) {
          setCategories(data.categories);
          if (!categoryId) {
            setCategoryId(data.categories[0].id);
          }
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    }
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !situation || !content || !categoryId) {
      setError('Заполните все обязательные поля');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const url = scriptToEdit ? `/api/scripts/${scriptToEdit.id}` : '/api/scripts';
      const method = scriptToEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          situation,
          content,
          methodTip,
          categoryId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Ошибка при сохранении');
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-xl w-full my-8 p-6 sm:p-8 shadow-2xl relative border-2 border-slate-200 dark:border-zinc-700">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-100 mb-6">
          {scriptToEdit ? 'Редактирование скрипта' : 'Добавление нового скрипта'}
        </h2>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border-2 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-sm font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1.5">
              Категория *
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border-2 border-slate-300 dark:border-zinc-600 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-zinc-100 bg-white dark:bg-zinc-800"
              required
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id} className="text-slate-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 font-medium py-1">
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1.5">
              Заголовок / Название темы *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Отказ выходить к доске"
              className="w-full px-4 py-3 rounded-2xl border-2 border-slate-300 dark:border-zinc-600 text-sm font-medium focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-zinc-100"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1.5">
              Описание ситуации / Отказ *
            </label>
            <textarea
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              placeholder="Опишите, какая ситуация возникает в школе..."
              rows={3}
              className="w-full px-4 py-3 rounded-2xl border-2 border-slate-300 dark:border-zinc-600 text-sm font-medium focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-zinc-100"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1.5">
              Рекомендуемый текст скрипта / фразы *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="«Точные слова и алгоритм ответа учителя...»"
              rows={4}
              className="w-full px-4 py-3 rounded-2xl border-2 border-slate-300 dark:border-zinc-600 text-sm font-medium focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-zinc-100"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1.5">
              Методический совет / Рекомендация (опционально)
            </label>
            <textarea
              value={methodTip}
              onChange={(e) => setMethodTip(e.target.value)}
              placeholder="Совет по тону речи, невербальным сигналам и границам..."
              rows={2}
              className="w-full px-4 py-3 rounded-2xl border-2 border-slate-300 dark:border-zinc-600 text-sm font-medium focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-zinc-100"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors flex items-center gap-1.5 disabled:opacity-50 shadow-md cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {isLoading ? 'Сохранение...' : 'Сохранить скрипт'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
