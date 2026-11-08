'use client';

import { useState } from 'react';
import { Star, MessageSquare, Bookmark, ChevronRight } from 'lucide-react';

export interface ScriptItem {
  id: string;
  title: string;
  situation: string;
  content: string;
  methodTip?: string | null;
  category: { id: string; name: string; slug: string };
  author?: { id: string; name: string; role: string } | null;
  avgRating: number;
  ratingsCount: number;
  userRating?: number | null;
  commentsCount: number;
  isSaved?: boolean;
}

interface ScriptCardProps {
  script: ScriptItem;
  onClick: () => void;
  onToggleSave?: (id: string) => void;
}

export default function ScriptCard({ script, onClick, onToggleSave }: ScriptCardProps) {
  const [saved, setSaved] = useState(script.isSaved || false);

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSaved(!saved);
    if (onToggleSave) {
      onToggleSave(script.id);
    }
  };

  return (
    <div
      onClick={onClick}
      className="group bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-slate-200/80 dark:border-zinc-800 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-400 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div>
        {/* Category Badge & Bookmark */}
        <div className="flex items-center justify-between mb-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/50">
            {script.category.name}
          </span>
          <button
            onClick={handleSave}
            title={saved ? 'Убрать из закладок' : 'Сохранить в закладки'}
            className={`p-2 rounded-2xl transition-colors ${
              saved
                ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                : 'text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${saved ? 'fill-amber-500' : ''}`} />
          </button>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 mb-2">
          {script.title}
        </h3>

        {/* Situation Preview */}
        <p className="text-xs text-slate-600 dark:text-zinc-400 line-clamp-3 mb-4 leading-relaxed">
          {script.situation}
        </p>
      </div>

      {/* Card Footer Meta */}
      <div className="pt-4 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
        <div className="flex items-center gap-3">
          {/* Rating */}
          <div className="flex items-center gap-1 font-semibold text-slate-700 dark:text-zinc-300">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{script.avgRating > 0 ? script.avgRating : '—'}</span>
            <span className="text-slate-400 dark:text-zinc-500 font-normal">({script.ratingsCount})</span>
          </div>

          {/* Comments count */}
          <div className="flex items-center gap-1 text-slate-500 dark:text-zinc-400">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{script.commentsCount}</span>
          </div>
        </div>

        {/* Author / Arrow */}
        <div className="flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform">
          <span>Открыть</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
