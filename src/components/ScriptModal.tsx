'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { ScriptItem } from './ScriptCard';
import { X, Star, MessageSquare, Lightbulb, Send, Edit, Trash2, ShieldCheck } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-2xl w-full my-8 p-6 sm:p-8 shadow-2xl relative border-2 border-slate-200 dark:border-zinc-700 max-h-[90vh] flex flex-col justify-between">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto pr-1 space-y-6">
          {/* Header & Badges */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                {script.category.name}
              </span>
              {script.author && (
                <span className="text-xs text-slate-600 dark:text-zinc-400 font-semibold flex items-center gap-1">
                  Автор: {script.author.name}
                  {script.author.role === 'ADMIN' && (
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-500 inline" />
                  )}
                </span>
              )}
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight leading-snug">
              {script.title}
            </h2>
          </div>

          {/* Situation Box */}
          <div className="bg-slate-50 dark:bg-zinc-800/60 rounded-2xl p-4 border-2 border-slate-200 dark:border-zinc-700">
            <h4 className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
              Отказ / Проблемная ситуация:
            </h4>
            <p className="text-sm text-slate-800 dark:text-zinc-200 font-medium leading-relaxed italic">
              «{script.situation}»
            </p>
          </div>

          {/* Recommended Script Content */}
          <div className="bg-indigo-50/80 dark:bg-indigo-950/40 border-l-4 border-indigo-600 rounded-r-2xl p-5 border-y border-r border-indigo-200 dark:border-indigo-900/50">
            <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              🗣️ Рекомендуемый скрипт / фраза:
            </h4>
            <p className="text-base text-slate-900 dark:text-zinc-100 font-semibold leading-relaxed whitespace-pre-line">
              {script.content}
            </p>
          </div>

          {/* Methodological Tip */}
          {script.methodTip && (
            <div className="bg-amber-50/90 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-800/60 rounded-2xl p-4 flex gap-3">
              <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider mb-1">
                  Методическая рекомендация:
                </h4>
                <p className="text-xs text-amber-950 dark:text-amber-200 font-medium leading-relaxed">
                  {script.methodTip}
                </p>
              </div>
            </div>
          )}

          {/* Overall Rating Info */}
          <div className="pt-4 border-t-2 border-slate-200 dark:border-zinc-800 flex items-center justify-between">
            <div className="text-xs text-slate-600 dark:text-zinc-400 font-bold">Общий рейтинг скрипта</div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-zinc-100">
                {script.avgRating > 0 ? script.avgRating : '—'}
              </span>
              <div className="flex items-center text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(script.avgRating) ? 'fill-amber-400' : 'text-slate-300 dark:text-zinc-700'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-slate-500 dark:text-zinc-400">({script.ratingsCount} оценок)</span>
            </div>
          </div>

          {/* Comments & Interactive User Rating Section */}
          <div className="pt-4 border-t-2 border-slate-200 dark:border-zinc-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-base font-black text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Комментарии ({commentsList.length})
              </h3>

              {/* Rate Action for user right after Comments title */}
              <div className="bg-slate-50 dark:bg-zinc-800/80 px-3.5 py-2 rounded-2xl border-2 border-slate-200 dark:border-zinc-700 flex items-center gap-2 shadow-xs">
                <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">Ваша оценка:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      onClick={() => handleRate(val)}
                      onMouseEnter={() => setHoverRating(val)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-0.5 transition-transform hover:scale-110 cursor-pointer"
                      title={`Оценить на ${val}`}
                    >
                      <Star
                        className={`w-4 h-4 ${
                          val <= (hoverRating || rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300 dark:text-zinc-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Add Comment Form with Auto-Expanding Textarea & 1000 Char Limit */}
            {user ? (
              <form onSubmit={handleAddComment} className="space-y-2">
                <div className="relative">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    maxLength={1000}
                    placeholder="Напишите ваш комментарий или альтернативную фразу..."
                    rows={2}
                    className="w-full px-4 py-3 text-sm font-medium rounded-2xl border-2 border-slate-300 dark:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-zinc-100 bg-white dark:bg-zinc-800 resize-y min-h-[70px] max-h-[220px]"
                  />
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-zinc-400 px-1 mt-1">
                    <span>
                      {commentText.length} / 1000 символов
                    </span>
                    <button
                      type="submit"
                      disabled={isSubmittingComment || !commentText.trim()}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl font-bold text-xs transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Отправить</span>
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <p className="text-xs text-slate-600 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 p-3 rounded-2xl text-center font-medium border border-slate-200 dark:border-zinc-700">
                Авторизуйтесь, чтобы участвовать в обсуждении.
              </p>
            )}

            {/* Comments List with User Rating & Date */}
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {commentsList.map((comm) => (
                <div key={comm.id} className="bg-slate-50 dark:bg-zinc-800/80 rounded-2xl p-4 border-2 border-slate-200 dark:border-zinc-700 shadow-xs">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 mb-1.5">
                    <span className="font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                      {comm.user?.name || 'Педагог'}
                      {comm.user?.role === 'ADMIN' && (
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-500 inline" />
                      )}
                    </span>

                    {/* Rating stars & Date */}
                    <div className="flex items-center gap-2.5">
                      {comm.userRating && (
                        <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 font-bold text-[11px]">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{comm.userRating}</span>
                        </div>
                      )}
                      <span className="font-semibold">{new Date(comm.createdAt).toLocaleDateString('ru-RU')}</span>
                    </div>
                  </div>
                  <p className="text-xs font-medium text-slate-800 dark:text-zinc-200 whitespace-pre-line leading-relaxed">
                    {comm.text}
                  </p>
                </div>
              ))}
              {commentsList.length === 0 && (
                <p className="text-xs text-slate-500 dark:text-zinc-400 italic text-center py-3">
                  Комментариев пока нет. Будьте первыми!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Modal Actions (Edit/Delete if author or admin) */}
        {canManage && (
          <div className="pt-4 mt-4 border-t-2 border-slate-200 dark:border-zinc-800 flex items-center justify-end gap-3">
            {onEdit && (
              <button
                onClick={() => onEdit(script)}
                className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5 border-2 border-slate-300 dark:border-zinc-600 cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
                Редактировать
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(script.id)}
                className="px-4 py-2.5 rounded-2xl text-xs font-bold text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors flex items-center gap-1.5 border-2 border-rose-300 dark:border-rose-800 cursor-pointer"
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
