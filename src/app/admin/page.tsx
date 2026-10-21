'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
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
  AlertCircle,
  X,
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
  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'excel'>('analytics');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // User modal state
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userRole, setUserRole] = useState('TEACHER');
  const [userError, setUserError] = useState('');

  // Excel file upload state
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importStatus, setImportStatus] = useState<string>('');
  const [isImporting, setIsImporting] = useState<boolean>(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users'),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users);
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

  // Save User (Create / Edit)
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
    setUserRole('TEACHER');
    setUserError('');
  };

  const handleEditUserClick = (user: any) => {
    setEditingUser(user);
    setUserName(user.name);
    setUserEmail(user.email);
    setUserPassword('');
    setUserRole(user.role);
    setIsUserModalOpen(true);
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

  // Excel Export
  const handleExportExcel = (type: 'scripts' | 'users') => {
    window.open(`/api/excel/export?type=${type}`, '_blank');
  };

  // Excel Import
  const handleImportExcel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) return;

    setIsImporting(true);
    setImportStatus('');

    const formData = new FormData();
    formData.append('file', importFile);

    try {
      const res = await fetch('/api/excel', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Ошибка при импорте Excel');
      }

      setImportStatus(`Успешно! ${data.message}`);
      setImportFile(null);
      fetchData();
    } catch (err: any) {
      setImportStatus(`Ошибка: ${err.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  const COLORS = ['#4f46e5', '#06b6d4', '#f59e0b', '#10b981', '#ec4899'];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        {/* Title */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
              Администрирование ClassUp
            </span>
            <h1 className="text-3xl font-black text-slate-900 mt-2">Панель управления</h1>
          </div>

          {/* Nav Tabs */}
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-sm">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'analytics'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Аналитика
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'users'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4" />
              Пользователи ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('excel')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'excel'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              Excel Модуль
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {isLoading ? (
          <div className="h-96 bg-white rounded-3xl border border-slate-200 animate-pulse flex items-center justify-center text-slate-400">
            Загрузка данных системы...
          </div>
        ) : (
          <>
            {/* ANALYTICS TAB */}
            {activeTab === 'analytics' && stats && (
              <div className="space-y-8">
                {/* Stats Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Всего скриптов
                    </div>
                    <div className="text-3xl font-black text-indigo-600 mt-2">
                      {stats.summary.totalScripts}
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Пользователей
                    </div>
                    <div className="text-3xl font-black text-amber-500 mt-2">
                      {stats.summary.totalUsers}
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Оценок выставлено
                    </div>
                    <div className="text-3xl font-black text-emerald-600 mt-2">
                      {stats.summary.totalRatings}
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Комментариев
                    </div>
                    <div className="text-3xl font-black text-sky-600 mt-2">
                      {stats.summary.totalComments}
                    </div>
                  </div>
                </div>

                {/* Recharts Distribution Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
                    <h3 className="text-base font-bold text-slate-900 mb-6">
                      Распределение скриптов по категориям
                    </h3>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.categoryStats}>
                          <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                          <Tooltip />
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
                  <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
                    <h3 className="text-base font-bold text-slate-900 mb-4">
                      Топ полезных скриптов по рейтингу
                    </h3>
                    <div className="space-y-3">
                      {stats.topScripts.map((sc: any, idx: number) => (
                        <div
                          key={sc.id}
                          className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-extrabold flex items-center justify-center text-xs">
                              {idx + 1}
                            </span>
                            <div>
                              <div className="font-bold text-slate-800 line-clamp-1">{sc.title}</div>
                              <div className="text-slate-400">{sc.category}</div>
                            </div>
                          </div>
                          <div className="text-right font-semibold">
                            <div className="text-amber-500 font-extrabold">⭐ {sc.avgRating}</div>
                            <div className="text-slate-400">{sc.ratingsCount} отзыв.</div>
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
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Управление пользователями</h3>
                    <p className="text-xs text-slate-500">
                      Назначение ролей, создание и удаление учетных записей
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      resetUserForm();
                      setIsUserModalOpen(true);
                    }}
                    className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Создать пользователя
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-3 px-4">Имя / ФИО</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Роль</th>
                        <th className="py-3 px-4">Активность</th>
                        <th className="py-3 px-4 text-right">Действия</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-slate-900 flex items-center gap-2">
                            {u.name}
                            {u.role === 'ADMIN' && (
                              <ShieldCheck className="w-4 h-4 text-amber-600" />
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 text-xs">{u.email}</td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                u.role === 'ADMIN'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-indigo-50 text-indigo-700'
                              }`}
                            >
                              {u.role === 'ADMIN' ? 'Администратор' : 'Учитель'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-xs text-slate-500">
                            Скрипты: {u._count?.scripts || 0} • Оценки: {u._count?.ratings || 0}
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-2">
                            <button
                              onClick={() => handleEditUserClick(u)}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-slate-100"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50"
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
                <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                      <Download className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">
                      Экспорт данных в Excel (.xlsx)
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed mb-6">
                      Выгрузите полную базу данных скриптов, ситуаций, рейтингов и пользователей в удобную таблицу Microsoft Excel для дальнейшего методического анализа.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => handleExportExcel('scripts')}
                      className="w-full py-3 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      Скачать таблицы скриптов (.xlsx)
                    </button>
                    <button
                      onClick={() => handleExportExcel('users')}
                      className="w-full py-3 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition-colors flex items-center justify-center gap-2"
                    >
                      <Users className="w-4 h-4" />
                      Скачать список пользователей (.xlsx)
                    </button>
                  </div>
                </div>

                {/* Import Card */}
                <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4">
                      <Upload className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">
                      Импорт скриптов из Excel
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      Загрузите готовый документ Excel (.xlsx) с колонками: «Заголовок», «Ситуация», «Текст скрипта / фраза», «Методический совет», «Категория».
                    </p>
                  </div>

                  <form onSubmit={handleImportExcel} className="space-y-4">
                    <input
                      type="file"
                      accept=".xlsx, .xls"
                      onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                      className="w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                      required
                    />

                    {importStatus && (
                      <div
                        className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                          importStatus.startsWith('Ошибка')
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                        <span>{importStatus}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isImporting || !importFile}
                      className="w-full py-3 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative border border-slate-100">
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold text-slate-900 mb-6">
                {editingUser ? 'Редактировать пользователя' : 'Создание нового пользователя'}
              </h2>

              {userError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200">
                  {userError}
                </div>
              )}

              <form onSubmit={handleSaveUser} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ФИО / Имя пользователя *
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email адрес *
                  </label>
                  <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Пароль {editingUser && '(оставьте пустым, если не меняете)'}
                  </label>
                  <input
                    type="password"
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500"
                    required={!editingUser}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Роль пользователя
                  </label>
                  <select
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="TEACHER">Учитель / Педагог</option>
                    <option value="ADMIN">Администратор</option>
                  </select>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsUserModalOpen(false)}
                    className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-xs font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-sm"
                  >
                    Сохранить
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
