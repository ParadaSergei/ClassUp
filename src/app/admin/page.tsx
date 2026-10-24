'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ScriptFormModal from '@/components/ScriptFormModal';
import { ScriptItem } from '@/components/ScriptCard';
import {
  Users,
  FileSpreadsheet,
  BarChart3,
  Plus,
  Trash2,
  Edit,
  Download,
  Upload,
  ShieldCheck,
  CheckCircle2,
  X,
  FileText,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  MessageSquare,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'scripts' | 'excel'>('analytics');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [adminScripts, setAdminScripts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // User modal state
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userRole, setUserRole] = useState('USER');
  const [userIsActive, setUserIsActive] = useState(true);
  const [userError, setUserError] = useState('');

  // Script modal state
  const [isScriptModalOpen, setIsScriptModalOpen] = useState(false);
  const [scriptToEdit, setScriptToEdit] = useState<ScriptItem | null>(null);

  // Excel file upload state
  const [importType, setImportType] = useState<'scripts' | 'users'>('scripts');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importStatus, setImportStatus] = useState<string>('');
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState<boolean>(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, usersRes, scriptsRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users'),
        fetch('/api/admin/scripts'),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users || []);
      }

      if (scriptsRes.ok) {
        const scriptsData = await scriptsRes.json();
        setAdminScripts(scriptsData.scripts || []);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserError('');

    try {
      const url = editingUser ? `/api/admin/users/${editingUser.id}` : '/api/admin/users';
      const method = editingUser ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userName,
          email: userEmail,
          password: userPassword,
          role: userRole,
          isActive: userIsActive,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Ошибка сохранения пользователя');
      }

      setIsUserModalOpen(false);
      resetUserForm();
      fetchData();
    } catch (err: any) {
      setUserError(err.message);
    }
  };

  const resetUserForm = () => {
    setEditingUser(null);
    setUserName('');
    setUserEmail('');
    setUserPassword('');
    setUserRole('USER');
    setUserIsActive(true);
    setUserError('');
  };

  const handleEditUserClick = (user: any) => {
    setEditingUser(user);
    setUserName(user.name);
    setUserEmail(user.email);
    setUserPassword('');
    setUserRole(user.role);
    setUserIsActive(user.isActive !== undefined ? user.isActive : true);
    setIsUserModalOpen(true);
  };

  const handleToggleUserActive = async (user: any) => {
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Error toggling user status:', err);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Вы действительно хотите удалить этого пользователя?')) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error);
        return;
      }
      fetchData();
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

  const handleTogglePublishScript = async (script: any) => {
    try {
      const res = await fetch(`/api/admin/scripts/${script.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !script.isPublished }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Error toggling publish status:', err);
    }
  };

  const handleDeleteScript = async (id: string) => {
    if (!confirm('Вы действительно хотите удалить этот скрипт?')) return;
    try {
      const res = await fetch(`/api/admin/scripts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Error deleting script:', err);
    }
  };

  // Fixed URL from /api/excel/export to /api/excel to avoid 404
  const handleExportExcel = (type: 'scripts' | 'users' | 'comments') => {
    window.open(`/api/excel?type=${type}`, '_blank');
  };

  const handleImportExcel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) return;

    setIsImporting(true);
    setImportStatus('');
    setImportErrors([]);

    const formData = new FormData();
    formData.append('file', importFile);
    formData.append('type', importType);

    try {
      const res = await fetch('/api/excel', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Ошибка при импорте Excel');
      }

      setImportStatus(data.message);
      if (data.errors) {
        setImportErrors(data.errors);
      }
      setImportFile(null);
      fetchData();
    } catch (err: any) {
      setImportStatus(`Ошибка: ${err.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  const COLORS = ['#6366f1', '#06b6d4', '#f59e0b', '#10b981', '#ec4899'];

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-800 dark:text-zinc-100 transition-colors">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        {/* Title */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border-2 border-amber-300 dark:border-amber-700">
              Администрирование ClassUp
            </span>
            <h1 className="text-3xl font-black text-slate-900 dark:text-zinc-100 mt-2">Панель управления</h1>
          </div>

          {/* Nav Tabs */}
          <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-zinc-900 p-2 rounded-2xl border-2 border-slate-300 dark:border-zinc-700 shadow-sm">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'analytics'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Аналитика
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'users'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Users className="w-4 h-4" />
              Пользователи ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('scripts')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'scripts'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              Скрипты ({adminScripts.length})
            </button>
            <button
              onClick={() => setActiveTab('excel')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'excel'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              Excel Модуль
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {isLoading ? (
          <div className="h-96 bg-white dark:bg-zinc-900 rounded-3xl border-2 border-slate-200 dark:border-zinc-800 animate-pulse flex items-center justify-center text-slate-500 font-bold">
            Загрузка данных системы...
          </div>
        ) : (
          <>
            {/* ANALYTICS TAB */}
            {activeTab === 'analytics' && stats && (
              <div className="space-y-8">
                {/* Stats Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border-2 border-slate-200 dark:border-zinc-800 shadow-sm">
                    <div className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                      Всего скриптов
                    </div>
                    <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-2">
                      {stats.summary.totalScripts}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border-2 border-slate-200 dark:border-zinc-800 shadow-sm">
                    <div className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                      Пользователей
                    </div>
                    <div className="text-3xl font-black text-amber-500 mt-2">
                      {stats.summary.totalUsers}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border-2 border-slate-200 dark:border-zinc-800 shadow-sm">
                    <div className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                      Оценок выставлено
                    </div>
                    <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
                      {stats.summary.totalRatings}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border-2 border-slate-200 dark:border-zinc-800 shadow-sm">
                    <div className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                      Комментариев
                    </div>
                    <div className="text-3xl font-black text-sky-600 dark:text-sky-400 mt-2">
                      {stats.summary.totalComments}
                    </div>
                  </div>
                </div>

                {/* Recharts Distribution Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border-2 border-slate-200 dark:border-zinc-800 shadow-sm">
                    <h3 className="text-base font-black text-slate-900 dark:text-zinc-100 mb-6">
                      Распределение скриптов по категориям
                    </h3>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.categoryStats}>
                          <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} tickLine={false} />
                          <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#18181b',
                              borderColor: '#3f3f46',
                              borderRadius: '0.75rem',
                              color: '#f4f4f5',
                            }}
                          />
                          <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                            {stats.categoryStats.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Top Rated Scripts Table */}
                  <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border-2 border-slate-200 dark:border-zinc-800 shadow-sm">
                    <h3 className="text-base font-black text-slate-900 dark:text-zinc-100 mb-4">
                      Топ полезных скриптов по рейтингу
                    </h3>
                    <div className="space-y-3">
                      {stats.topScripts.map((sc: any, idx: number) => (
                        <div
                          key={sc.id}
                          className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/80 border-2 border-slate-200 dark:border-zinc-700 text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black flex items-center justify-center text-xs shadow-xs">
                              {idx + 1}
                            </span>
                            <div>
                              <div className="font-bold text-slate-900 dark:text-zinc-100 line-clamp-1">{sc.title}</div>
                              <div className="text-slate-500 dark:text-zinc-400 font-medium">{sc.category}</div>
                            </div>
                          </div>
                          <div className="text-right font-bold">
                            <div className="text-amber-500 font-black">⭐ {sc.avgRating}</div>
                            <div className="text-slate-500 dark:text-zinc-400">{sc.ratingsCount} отзыв.</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* USERS MANAGEMENT TAB */}
            {activeTab === 'users' && (
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border-2 border-slate-200 dark:border-zinc-800 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-zinc-100">Управление пользователями</h3>
                    <p className="text-xs text-slate-600 dark:text-zinc-400 font-medium">
                      Назначение ролей, блокировка пользователей, создание и удаление учетных записей
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      resetUserForm();
                      setIsUserModalOpen(true);
                    }}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Создать пользователя
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b-2 border-slate-200 dark:border-zinc-800 text-xs font-black text-slate-600 dark:text-zinc-300 uppercase tracking-wider">
                        <th className="py-3 px-4">Имя / ФИО</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Роль</th>
                        <th className="py-3 px-4">Статус</th>
                        <th className="py-3 px-4">Активность</th>
                        <th className="py-3 px-4 text-right">Действия</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-zinc-800 text-sm text-slate-800 dark:text-zinc-200 font-medium">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                            {u.name}
                            {u.role === 'ADMIN' && (
                              <ShieldCheck className="w-4 h-4 text-amber-500" />
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 dark:text-zinc-400 text-xs font-bold">{u.email}</td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${
                                u.role === 'ADMIN'
                                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700'
                                  : 'bg-indigo-50 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800'
                              }`}
                            >
                              {u.role === 'ADMIN' ? 'Администратор' : 'Педагог'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <button
                              onClick={() => handleToggleUserActive(u)}
                              title={u.isActive ? 'Заблокировать пользователя' : 'Разблокировать пользователя'}
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-colors border ${
                                u.isActive
                                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700'
                                  : 'bg-rose-100 dark:bg-rose-950 text-rose-900 dark:text-rose-200 border-rose-300 dark:border-rose-700'
                              }`}
                            >
                              {u.isActive ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                              <span>{u.isActive ? 'Активен' : 'Заблокирован'}</span>
                            </button>
                          </td>
                          <td className="py-3.5 px-4 text-xs font-semibold text-slate-600 dark:text-zinc-400">
                            Скрипты: {u._count?.scripts || 0} • Оценки: {u._count?.ratings || 0}
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-2">
                            <button
                              onClick={() => handleEditUserClick(u)}
                              className="p-2 text-slate-600 dark:text-zinc-300 hover:text-indigo-600 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-700 cursor-pointer"
                              title="Редактировать"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="p-2 text-slate-600 dark:text-zinc-300 hover:text-rose-600 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-slate-200 dark:border-zinc-700 cursor-pointer"
                              title="Удалить"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SCRIPTS MANAGEMENT TAB */}
            {activeTab === 'scripts' && (
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border-2 border-slate-200 dark:border-zinc-800 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-zinc-100">Управление скриптами</h3>
                    <p className="text-xs text-slate-600 dark:text-zinc-400 font-medium">
                      Модерация, публикация/скрытие, редактирование и удаление скриптов в базе
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setScriptToEdit(null);
                      setIsScriptModalOpen(true);
                    }}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Добавить новый скрипт
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b-2 border-slate-200 dark:border-zinc-800 text-xs font-black text-slate-600 dark:text-zinc-300 uppercase tracking-wider">
                        <th className="py-3 px-4">Заголовок / Ситуация</th>
                        <th className="py-3 px-4">Категория</th>
                        <th className="py-3 px-4">Автор</th>
                        <th className="py-3 px-4">Статус публикации</th>
                        <th className="py-3 px-4">Статистика</th>
                        <th className="py-3 px-4 text-right">Действия</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-zinc-800 text-sm text-slate-800 dark:text-zinc-200 font-medium">
                      {adminScripts.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-zinc-100 max-w-xs">
                            <div className="line-clamp-1">{s.title}</div>
                            <div className="text-xs font-medium text-slate-500 dark:text-zinc-400 line-clamp-1">
                              {s.situation}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-xs font-bold text-slate-700 dark:text-zinc-300">
                            {s.category}
                          </td>
                          <td className="py-3.5 px-4 text-xs font-bold text-slate-700 dark:text-zinc-300">
                            {s.author}
                          </td>
                          <td className="py-3.5 px-4">
                            <button
                              onClick={() => handleTogglePublishScript(s)}
                              title={s.isPublished ? 'Скрыть от пользователей' : 'Опубликовать'}
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-colors border ${
                                s.isPublished
                                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700'
                                  : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700'
                              }`}
                            >
                              {s.isPublished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                              <span>{s.isPublished ? 'Опубликован' : 'Скрыт'}</span>
                            </button>
                          </td>
                          <td className="py-3.5 px-4 text-xs font-bold text-slate-600 dark:text-zinc-400">
                            ⭐ {s.avgRating} ({s.ratingsCount}) • 💬 {s.commentsCount}
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-2">
                            <button
                              onClick={() => {
                                setScriptToEdit(s);
                                setIsScriptModalOpen(true);
                              }}
                              className="p-2 text-slate-600 dark:text-zinc-300 hover:text-indigo-600 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-700 cursor-pointer"
                              title="Редактировать"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteScript(s.id)}
                              className="p-2 text-slate-600 dark:text-zinc-300 hover:text-rose-600 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-slate-200 dark:border-zinc-700 cursor-pointer"
                              title="Удалить"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* EXCEL MODULE TAB */}
            {activeTab === 'excel' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Export Card */}
                <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border-2 border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center mb-4 border border-emerald-300 dark:border-emerald-700">
                      <Download className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-zinc-100 mb-2">
                      Экспорт данных в Excel (.xlsx)
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-zinc-400 font-medium leading-relaxed mb-6">
                      Выгрузите таблицы скриптов, пользователей или комментариев в удобную таблицу Microsoft Excel для проведения методического анализа.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => handleExportExcel('scripts')}
                      className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-extrabold transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      Скачать таблицы скриптов (.xlsx)
                    </button>
                    <button
                      onClick={() => handleExportExcel('users')}
                      className="w-full py-3.5 bg-slate-800 dark:bg-zinc-800 hover:bg-slate-900 dark:hover:bg-zinc-700 text-white rounded-2xl text-xs font-extrabold transition-colors flex items-center justify-center gap-2 border border-slate-700 dark:border-zinc-600 cursor-pointer"
                    >
                      <Users className="w-4 h-4" />
                      Скачать список пользователей (.xlsx)
                    </button>
                    <button
                      onClick={() => handleExportExcel('comments')}
                      className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-extrabold transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Скачать базу комментариев (.xlsx)
                    </button>
                  </div>
                </div>

                {/* Import Card */}
                <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border-2 border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 flex items-center justify-center mb-4 border border-indigo-300 dark:border-indigo-700">
                      <Upload className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-zinc-100 mb-2">
                      Массовый импорт из Excel
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-zinc-400 font-medium leading-relaxed mb-4">
                      Выберите тип загружаемых данных (скрипты или пользователи) и прикрепите документ Excel (.xlsx).
                    </p>
                  </div>

                  <form onSubmit={handleImportExcel} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1.5">
                        Тип импортируемых данных
                      </label>
                      <select
                        value={importType}
                        onChange={(e) => setImportType(e.target.value as 'scripts' | 'users')}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-800 rounded-2xl border-2 border-slate-300 dark:border-zinc-600 text-xs font-bold text-slate-900 dark:text-zinc-100"
                      >
                        <option value="scripts">Массовый импорт скриптов</option>
                        <option value="users">Массовый импорт пользователей</option>
                      </select>
                    </div>

                    <input
                      type="file"
                      accept=".xlsx, .xls"
                      onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                      className="w-full text-xs font-semibold text-slate-700 dark:text-zinc-300 file:mr-4 file:py-2.5 file:px-4 file:rounded-2xl file:border-2 file:border-indigo-300 dark:file:border-indigo-700 file:text-xs file:font-bold file:bg-indigo-50 dark:file:bg-indigo-950 file:text-indigo-800 dark:file:text-indigo-200 hover:file:bg-indigo-100 cursor-pointer"
                      required
                    />

                    {importStatus && (
                      <div
                        className={`p-3.5 rounded-2xl text-xs font-bold ${
                          importStatus.startsWith('Ошибка')
                            ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border-2 border-rose-300 dark:border-rose-800'
                            : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-2 border-emerald-300 dark:border-emerald-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                          <span>{importStatus}</span>
                        </div>
                        {importErrors.length > 0 && (
                          <ul className="mt-2 text-[11px] list-disc list-inside space-y-1 font-medium opacity-90 max-h-32 overflow-y-auto">
                            {importErrors.map((err, i) => (
                              <li key={i}>{err}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isImporting || !importFile}
                      className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-extrabold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-md cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      {isImporting ? 'Импортирование...' : 'Загрузить в систему'}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </>
        )}

        {/* User Create/Edit Modal */}
        {isUserModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative border-2 border-slate-200 dark:border-zinc-700">
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-100 mb-6">
                {editingUser ? 'Редактировать пользователя' : 'Создание нового пользователя'}
              </h2>

              {userError && (
                <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 text-xs font-bold border-2 border-rose-300 dark:border-rose-800">
                  {userError}
                </div>
              )}

              <form onSubmit={handleSaveUser} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1.5">
                    ФИО / Имя пользователя *
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-800 rounded-2xl border-2 border-slate-300 dark:border-zinc-600 text-sm font-semibold text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1.5">
                    Email адрес *
                  </label>
                  <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-800 rounded-2xl border-2 border-slate-300 dark:border-zinc-600 text-sm font-semibold text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1.5">
                    Пароль {editingUser && '(оставьте пустым, если не меняете)'}
                  </label>
                  <input
                    type="password"
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-800 rounded-2xl border-2 border-slate-300 dark:border-zinc-600 text-sm font-semibold text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500"
                    required={!editingUser}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1.5">
                      Роль
                    </label>
                    <select
                      value={userRole}
                      onChange={(e) => setUserRole(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-800 rounded-2xl border-2 border-slate-300 dark:border-zinc-600 text-sm font-semibold text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="USER">Педагог (USER)</option>
                      <option value="ADMIN">Администратор (ADMIN)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1.5">
                      Статус
                    </label>
                    <select
                      value={userIsActive ? 'true' : 'false'}
                      onChange={(e) => setUserIsActive(e.target.value === 'true')}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-800 rounded-2xl border-2 border-slate-300 dark:border-zinc-600 text-sm font-semibold text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="true">Активен</option>
                      <option value="false">Заблокирован</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsUserModalOpen(false)}
                    className="px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-2xl cursor-pointer"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-md cursor-pointer"
                  >
                    Сохранить
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Script Create/Edit Modal */}
        {isScriptModalOpen && (
          <ScriptFormModal
            scriptToEdit={scriptToEdit}
            onClose={() => setIsScriptModalOpen(false)}
            onSaved={fetchData}
          />
        )}
      </main>
    </div>
  );
}
