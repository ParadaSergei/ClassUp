'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { ScriptItem } from './ScriptCard';
import { X, Star, MessageSquare, Lightbulb, Bookmark, Send, Edit, Trash2, ShieldCheck } from 'lucide-react';

interface ScriptModalProps {
  script: ScriptItem | null;
  onClose: () => void;
  onUpdate?: () => void;
  onEdit?: (script: ScriptItem) => void;
  onDelete?: (id: string) => void;
}

export default function ScriptModal({ script, onClose, onUpdate, onEdit, onDelete }: ScriptModalProps) {
  const { data: session } = useSession();
  const user = session?.user as any;

  const [rating, setRating] = useState<number>(script?.userRating || 0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentsList, setCommentsList] = useState<any[]>(script ? (script as any).comments || [] : []);

  if (!script) return null;

  const canManage = user?.role === 'ADMIN' || (user?.id && user.id === script.author?.id);

  const handleRate = async (val: number) => {
    if (!user) {
      alert('Пожалуйста, войдите в аккаунт, чтобы оставить оценку.');
      return;
    }
    setRating(val);
    try {
      const res = await fetch(`/api/scripts/${script.id}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: val }),
      });
      if (res.ok) {
        if (onUpdate) onUpdate();
      }
    } catch (err) {
      console.error('Error submitting rating:', err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Пожалуйста, войдите в аккаунт, чтобы оставить комментарий.');
      return;
    }
    if (!commentText.trim()) return;

    setIsSubmittingComment(true);
    try {
      const res = await fetch(`/api/scripts/${script.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: commentText }),
      });
      if (res.ok) {
        const data = await res.json();
        setCommentsList([data.comment, ...commentsList]);
        setCommentText('');
        if (onUpdate) onUpdate();
      }
    } catch (err) {
      console.error('Error adding comment:', err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full my-8 p-6 sm:p-8 shadow-2xl relative border border-slate-100 max-h-[90vh] flex flex-col justify-between">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto pr-1 space-y-6">
          {/* Header & Badges */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                {script.category.name}
              </span>
              {script.author && (
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  Автор: {script.author.name}
                  {script.author.role === 'ADMIN' && (
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600 inline" />
                  )}
                </span>
              )}
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {script.title}
            </h2>
          </div>

          {/* Situation Box */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Отказ / Проблемная ситуация:
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed italic">
              «{script.situation}»
            </p>
          </div>

          {/* Recommended Script Content */}
          <div className="bg-indigo-50/70 border-l-4 border-indigo-600 rounded-r-2xl p-5">
            <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              🗣️ Рекомендуемый скрипт / фраза:
            </h4>
            <p className="text-base text-slate-800 font-medium leading-relaxed whitespace-pre-line">
              {script.content}
            </p>
          </div>

          {/* Methodological Tip */}
          {script.methodTip && (
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex gap-3">
              <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-1">
                  Методическая рекомендация:
                </h4>
                <p className="text-xs text-amber-950 leading-relaxed">
                  {script.methodTip}
                </p>
              </div>
            </div>
          )}

          {/* Interactive Rating Section */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs text-slate-500 font-medium mb-1">Общий рейтинг скрипта</div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold text-slate-900">
                  {script.avgRating > 0 ? script.avgRating : '—'}
                </span>
                <div className="flex items-center text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= Math.round(script.avgRating) ? 'fill-amber-400' : 'text-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-slate-400">({script.ratingsCount} оценок)</span>
              </div>
            </div>

            {/* Rate Action for user */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
              <div className="text-xs font-semibold text-slate-700 mb-1">Ваша оценка:</div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    onClick={() => handleRate(val)}
                    onMouseEnter={() => setHoverRating(val)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        val <= (hoverRating || rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              Обсуждение и опыт коллег ({commentsList.length})
            </h3>

            {/* Add Comment Form */}
            {user ? (
              <form onSubmit={handleAddComment} className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Напишите ваш отзыв или альтернативную фразу..."
                  className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={isSubmittingComment || !commentText.trim()}
                  className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-medium text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl mb-4 text-center">
                Авторизуйтесь, чтобы участвовать в обсуждении.
              </p>
            )}

            {/* Comments List */}
            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {commentsList.map((comm) => (
                <div key={comm.id} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span className="font-semibold text-slate-800">{comm.user?.name || 'Педагог'}</span>
                    <span>{new Date(comm.createdAt).toLocaleDateString('ru-RU')}</span>
                  </div>
                  <p className="text-xs text-slate-700">{comm.text}</p>
                </div>
              ))}
              {commentsList.length === 0 && (
                <p className="text-xs text-slate-400 italic text-center py-2">
                  Комментариев пока нет. Будьте первыми!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Modal Actions (Edit/Delete if author or admin) */}
        {canManage && (
          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            {onEdit && (
              <button
                onClick={() => onEdit(script)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1.5 border border-slate-200"
              >
                <Edit className="w-3.5 h-3.5" />
                Редактировать
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(script.id)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-1.5 border border-rose-200"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Удалить
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
