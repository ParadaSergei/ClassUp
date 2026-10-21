'use client';

import { useState } from 'react';
import { Star, MessageSquare, Bookmark, User, ChevronRight } from 'lucide-react';

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
      className="group bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-sky-400 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div>
        {/* Category Badge & Bookmark */}
        <div className="flex items-center justify-between mb-3">
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
            {script.category.name}
          </span>
          <button
            onClick={handleSave}
            title={saved ? 'Убрать из закладок' : 'Сохранить в закладки'}
            className={`p-1.5 rounded-lg transition-colors ${
              saved ? 'text-amber-500 bg-amber-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${saved ? 'fill-amber-500' : ''}`} />
          </button>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 mb-2">
          {script.title}
        </h3>

        {/* Situation Preview */}
        <p className="text-sm text-slate-600 line-clamp-3 mb-4 leading-relaxed">
          {script.situation}
        </p>
      </div>

      {/* Card Footer Meta */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-3">
          {/* Rating */}
          <div className="flex items-center gap-1 font-semibold text-slate-700">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{script.avgRating > 0 ? script.avgRating : '—'}</span>
            <span className="text-slate-400 font-normal">({script.ratingsCount})</span>
          </div>

          {/* Comments count */}
          <div className="flex items-center gap-1 text-slate-500">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{script.commentsCount}</span>
          </div>
        </div>

        {/* Author / Arrow */}
        <div className="flex items-center gap-1 font-medium text-indigo-600 group-hover:translate-x-0.5 transition-transform">
          <span>Открыть</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
