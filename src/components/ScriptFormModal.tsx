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
    // Fetch categories
    async function fetchCategories() {
      try {
        const res = await fetch('/api/scripts');
        const data = await res.json();
        if (data.scripts) {
          // Extract unique categories
          const catMap = new Map();
          data.scripts.forEach((s: any) => {
            if (s.category) catMap.set(s.category.id, s.category);
          });
          const uniqueCats = Array.from(catMap.values());
          setCategories(uniqueCats);
          if (!categoryId && uniqueCats.length > 0) {
            setCategoryId(uniqueCats[0].id);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full my-8 p-6 sm:p-8 shadow-2xl relative border border-slate-100">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-slate-900 mb-6">
          {scriptToEdit ? 'Редактирование скрипта' : 'Добавление нового скрипта'}
        </h2>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Категория *
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Заголовок / Название темы *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Отказ выходить к доске"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Описание ситуации / Отказ *
            </label>
            <textarea
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              placeholder="Опишите, какая ситуация возникает в школе..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Рекомендуемый текст скрипта / фразы *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="«Точные слова и алгоритм ответа учителя...»"
              rows={4}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Методический совет / Рекомендация (опционально)
            </label>
            <textarea
              value={methodTip}
              onChange={(e) => setMethodTip(e.target.value)}
              placeholder="Совет по тону речи, невербальным сигналам и границам..."
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors flex items-center gap-1.5 disabled:opacity-50"
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
