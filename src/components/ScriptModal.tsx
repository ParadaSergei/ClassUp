'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { ScriptItem } from './ScriptCard';
import { X, Star, MessageSquare, Lightbulb, Send, Edit, Trash2, ShieldCheck, Check } from 'lucide-react';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedMsg, setSubmittedMsg] = useState(false);
  const [commentsList, setCommentsList] = useState<any[]>(script ? (script as any).comments || [] : []);

  if (!script) return null;

  // Only ADMIN can edit or delete script
  const canManageScript = user?.role === 'ADMIN';

  // Admin can delete individual comments
  const handleAdminDeleteComment = async (commentId: string) => {
    if (!confirm('Вы действительно хотите удалить этот комментарий?')) return;
    try {
      const res = await fetch(`/api/scripts/${script.id}/comments?commentId=${commentId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setCommentsList(commentsList.filter((c) => c.id !== commentId));
        if (onUpdate) onUpdate();
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  const handleSubmitRatingAndComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Пожалуйста, войдите в аккаунт, чтобы оставить оценку или комментарий.');
      return;
    }

    const hasText = commentText.trim().length > 0;
    const hasRating = rating > 0;

    if (!hasText && !hasRating) return;

    setIsSubmitting(true);
    try {
      // 1. Submit rating if selected
      if (hasRating) {
        await fetch(`/api/scripts/${script.id}/rate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value: rating }),
        });
      }

      // 2. Submit comment text if present
      if (hasText) {
        const res = await fetch(`/api/scripts/${script.id}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: commentText.trim() }),
        });
        if (res.ok) {
          const data = await res.json();
          setCommentsList([data.comment, ...commentsList]);
          setCommentText('');
        }
      }

      setSubmittedMsg(true);
      setTimeout(() => setSubmittedMsg(false), 3000);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Error submitting form:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-5xl w-full my-4 p-5 sm:p-7 shadow-2xl relative border-2 border-slate-200 dark:border-zinc-700 max-h-[92vh] flex flex-col justify-between">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 2 Column Grid Layout */}
        <div className="overflow-y-auto pr-2 grid grid-cols-1 md:grid-cols-12 gap-6 flex-1 min-h-0">
          {/* LEFT COLUMN: Main Script Content */}
          <div className="md:col-span-7 space-y-4 border-b md:border-b-0 md:border-r-2 border-slate-200 dark:border-zinc-800 pb-5 md:pb-0 md:pr-5">
            {/* Header Badges */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2.5">
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
              <h2 className="text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-tight leading-snug">
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
            <div className="bg-indigo-50/80 dark:bg-indigo-950/40 border-l-4 border-indigo-600 rounded-r-2xl p-4.5 border-y border-r border-indigo-200 dark:border-indigo-900/50">
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
          </div>

          {/* RIGHT COLUMN: Rating & Comments */}
          <div className="md:col-span-5 flex flex-col justify-between space-y-4 min-h-0">
            {/* Overall Rating & User Stars */}
            <div className="space-y-3">
              <div className="bg-slate-50 dark:bg-zinc-800/60 p-3.5 rounded-2xl border-2 border-slate-200 dark:border-zinc-700 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider mb-0.5">
                    Общий рейтинг
                  </div>
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
                  </div>
                </div>
                <span className="text-xs text-slate-500 dark:text-zinc-400 font-bold">({script.ratingsCount} оценок)</span>
              </div>

              {/* User Rating Interactive Stars Box */}
              <div className="bg-indigo-50/60 dark:bg-indigo-950/30 p-3.5 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800/60">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">Ваша оценка:</span>
                  {submittedMsg && (
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Отправлено!
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setRating(val)}
                      onMouseEnter={() => setHoverRating(val)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transition-transform hover:scale-125 cursor-pointer"
                      title={`Выбрать ${val} звезд`}
                    >
                      <Star
                        className={`w-6 h-6 ${
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

            {/* Comments Area Extending Vertically */}
            <div className="flex-1 flex flex-col justify-between space-y-3 min-h-0">
              <h3 className="text-base font-black text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Комментарии ({commentsList.length})
              </h3>

              {/* Form to submit rating AND/OR comment */}
              {user ? (
                <form onSubmit={handleSubmitRatingAndComment} className="space-y-2">
                  <div className="relative">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      maxLength={1000}
                      placeholder="Напишите комментарий или отправьте выбранную выше оценку..."
                      rows={2}
                      className="w-full px-4 py-2.5 text-xs font-medium rounded-2xl border-2 border-slate-300 dark:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-zinc-100 bg-white dark:bg-zinc-800 resize-y min-h-[70px] max-h-[160px]"
                    />
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-zinc-400 px-1 mt-1">
                      <span>{commentText.length} / 1000</span>
                      <button
                        type="submit"
                        disabled={isSubmitting || (!commentText.trim() && rating === 0)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl font-bold text-xs transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-md cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Отправить</span>
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <p className="text-xs text-slate-600 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 p-2.5 rounded-2xl text-center font-medium border border-slate-200 dark:border-zinc-700">
                  Авторизуйтесь, чтобы зафиксировать оценку или комментарий.
                </p>
              )}

              {/* Extended Comments List with Date + Time and Admin Delete Option */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[160px] max-h-[280px]">
                {commentsList.map((comm) => (
                  <div key={comm.id} className="bg-slate-50 dark:bg-zinc-800/80 rounded-2xl p-3 border-2 border-slate-200 dark:border-zinc-700 shadow-xs relative group">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 mb-1">
                      <span className="font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                        {comm.user?.name || 'Педагог'}
                        {comm.user?.role === 'ADMIN' && (
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-500 inline" />
                        )}
                      </span>

                      <div className="flex items-center gap-2">
                        {comm.userRating && (
                          <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 font-bold text-[10px]">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{comm.userRating}</span>
                          </div>
                        )}
                        <span className="font-semibold text-[10px]">
                          {new Date(comm.createdAt).toLocaleString('ru-RU', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </span>

                        {/* Admin Delete Comment Button */}
                        {canManageScript && (
                          <button
                            onClick={() => handleAdminDeleteComment(comm.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                            title="Удалить комментарий (Админ)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs font-medium text-slate-800 dark:text-zinc-200 whitespace-pre-line leading-relaxed">
                      {comm.text}
                    </p>
                  </div>
                ))}
                {commentsList.length === 0 && (
                  <p className="text-xs text-slate-500 dark:text-zinc-400 italic text-center py-4">
                    Комментариев пока нет. Будьте первыми!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions (Edit/Delete strictly for ADMIN only) */}
        {canManageScript && (
          <div className="pt-3 mt-3 border-t-2 border-slate-200 dark:border-zinc-800 flex items-center justify-end gap-3">
            {onEdit && (
              <button
                onClick={() => onEdit(script)}
                className="px-4 py-2 rounded-2xl text-xs font-bold text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5 border-2 border-slate-300 dark:border-zinc-600 cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
                Редактировать
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(script.id)}
                className="px-4 py-2 rounded-2xl text-xs font-bold text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors flex items-center gap-1.5 border-2 border-rose-300 dark:border-rose-800 cursor-pointer"
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
