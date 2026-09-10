import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import {
  Users,
  UserPlus,
  Trash2,
  Download,
  RefreshCw,
  Search,
  X,
  Shield,
  Mail
} from 'lucide-react';

const API =
  import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function AdminUsers() {
  const { token } = useAuth();
  const { i18n } = useTranslation();

  const isEs = i18n.language?.startsWith('es');

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    email: '',
    password: '',
    role: 'USER'
  });

  const loadUsers = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API}/api/users`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('No se pudieron obtener los usuarios');
      }

      const data = await response.json();

      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(
        isEs
          ? 'No se pudieron cargar los usuarios.'
          : 'Unable to load users.'
      );
    } finally {
      setLoading(false);
    }
  }, [token, isEs]);

  useEffect(() => {
    const timer = setTimeout(() => loadUsers(), 0);
    return () => clearTimeout(timer);
  }, [loadUsers]);

  const createUser = async (event) => {
    event.preventDefault();

    if (!form.email || !form.password) {
      setError(
        isEs
          ? 'Email y contraseña son obligatorios.'
          : 'Email and password are required.'
      );
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.error ||
          (isEs
            ? 'No se pudo crear el usuario.'
            : 'Unable to create user.')
        );
      }

      setSuccess(
        isEs
          ? 'Usuario creado correctamente.'
          : 'User created successfully.'
      );

      setForm({
        email: '',
        password: '',
        role: 'USER'
      });

      setShowCreate(false);

      await loadUsers();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async (user) => {
    const confirmed = window.confirm(
      isEs
        ? `¿Eliminar al usuario ${user.email}? Esta acción no se puede deshacer.`
        : `Delete user ${user.email}? This action cannot be undone.`
    );

    if (!confirmed) return;

    setError('');
    setSuccess('');

    try {
      const response = await fetch(
        `${API}/api/users/${user.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.error ||
          (isEs
            ? 'No se pudo eliminar el usuario.'
            : 'Unable to delete user.')
        );
      }

      setSuccess(
        isEs
          ? 'Usuario eliminado correctamente.'
          : 'User deleted successfully.'
      );

      await loadUsers();
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const exportUsers = () => {
    const rows = users.map((user) => ({
      id: user.id ?? '',
      email: user.email ?? '',
      role: user.role ?? '',
      tenant_id: user.tenant_id ?? '',
      created_at: user.created_at ?? ''
    }));

    const headers = [
      'id',
      'email',
      'role',
      'tenant_id',
      'created_at'
    ];

    const csv = [
      headers.join(','),
      ...rows.map((row) =>
        headers
          .map((header) =>
            `"${String(row[header] ?? '').replaceAll('"', '""')}"`
          )
          .join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `mia-users-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  const filteredUsers = users.filter((user) => {
    const value = search.toLowerCase();

    return (
      String(user.email || '')
        .toLowerCase()
        .includes(value) ||
      String(user.role || '')
        .toLowerCase()
        .includes(value) ||
      String(user.id || '')
        .toLowerCase()
        .includes(value)
    );
  });

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10">
              <Users size={22} className="text-emerald-300" />
            </div>

            <div>
              <h1 className="text-2xl font-black text-white">
                {isEs ? 'Gestión de Usuarios' : 'User Management'}
              </h1>

              <p className="mt-1 text-sm text-slate-400">
                {isEs
                  ? 'Crear, administrar y eliminar usuarios de MIA Pro.'
                  : 'Create, manage and delete MIA Pro users.'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">

          <button
            onClick={loadUsers}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/[0.08]"
          >
            <RefreshCw size={16} />
            {isEs ? 'Actualizar' : 'Refresh'}
          </button>

          <button
            onClick={exportUsers}
            disabled={users.length === 0}
            className="flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2.5 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/15 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Download size={16} />
            {isEs ? 'Exportar CSV' : 'Export CSV'}
          </button>

          <button
            onClick={() => {
              setShowCreate(true);
              setError('');
              setSuccess('');
            }}
            className="flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-2.5 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-400/15"
          >
            <UserPlus size={16} />
            {isEs ? 'Agregar Usuario' : 'Add User'}
          </button>

        </div>
      </div>

      {/* ALERTS */}
      {error && (
        <div className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          {success}
        </div>
      )}

      {/* SEARCH / STATS */}
      <div className="grid gap-4 md:grid-cols-3">

        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
          <div className="text-xs uppercase tracking-wider text-slate-500">
            {isEs ? 'Usuarios totales' : 'Total users'}
          </div>

          <div className="mt-2 text-3xl font-black text-white">
            {users.length}
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
          <div className="text-xs uppercase tracking-wider text-slate-500">
            {isEs ? 'Usuarios mostrados' : 'Displayed users'}
          </div>

          <div className="mt-2 text-3xl font-black text-emerald-300">
            {filteredUsers.length}
          </div>
        </div>

        <div className="relative rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
          <Search
            size={17}
            className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={
              isEs
                ? 'Buscar por email, ID o rol...'
                : 'Search by email, ID or role...'
            }
            className="w-full rounded-xl border border-white/10 bg-slate-950/60 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-400/30"
          />
        </div>

      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025]">

        <div className="border-b border-white/[0.07] px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-white">
                {isEs ? 'Usuarios registrados' : 'Registered users'}
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {isEs
                  ? 'Datos obtenidos directamente desde la API.'
                  : 'Data loaded directly from the API.'}
              </p>
            </div>

            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
              {loading ? 'LOADING' : 'LIVE'}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-slate-400">
            {isEs ? 'Cargando usuarios...' : 'Loading users...'}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <Users
              size={36}
              className="mx-auto text-slate-700"
            />

            <h3 className="mt-4 font-bold text-slate-300">
              {isEs ? 'No hay usuarios' : 'No users found'}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {search
                ? isEs
                  ? 'No hay resultados para esa búsqueda.'
                  : 'No results for this search.'
                : isEs
                  ? 'Agregá el primer usuario.'
                  : 'Add the first user.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full min-w-[760px]">

              <thead>
                <tr className="border-b border-white/[0.07] bg-slate-950/40 text-left">
                  <th className="px-5 py-4 text-[10px] uppercase tracking-wider text-slate-500">
                    ID
                  </th>

                  <th className="px-5 py-4 text-[10px] uppercase tracking-wider text-slate-500">
                    {isEs ? 'Usuario' : 'User'}
                  </th>

                  <th className="px-5 py-4 text-[10px] uppercase tracking-wider text-slate-500">
                    {isEs ? 'Rol' : 'Role'}
                  </th>

                  <th className="px-5 py-4 text-[10px] uppercase tracking-wider text-slate-500">
                    Tenant
                  </th>

                  <th className="px-5 py-4 text-right text-[10px] uppercase tracking-wider text-slate-500">
                    {isEs ? 'Acciones' : 'Actions'}
                  </th>
                </tr>
              </thead>

              <tbody>

                {filteredUsers.map((user, index) => (
                  <tr
                    key={user.id || index}
                    className="border-b border-white/[0.05] transition hover:bg-white/[0.025]"
                  >

                    <td className="px-5 py-4 text-xs font-mono text-slate-500">
                      {user.id}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">

                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/10">
                          <Mail
                            size={15}
                            className="text-emerald-300"
                          />
                        </div>

                        <div>
                          <div className="text-sm font-semibold text-slate-200">
                            {user.email}
                          </div>

                          {user.created_at && (
                            <div className="mt-0.5 text-[10px] text-slate-600">
                              {user.created_at}
                            </div>
                          )}
                        </div>

                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/15 bg-cyan-400/10 px-2.5 py-1 text-[10px] font-bold text-cyan-300">
                        <Shield size={11} />
                        {user.role || 'USER'}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-xs text-slate-400">
                      {user.tenant_id || '—'}
                    </td>

                    <td className="px-5 py-4 text-right">

                    {["SUPER_ADMIN","ADMIN"].includes(String(user?.role || "").toUpperCase()) && (
                                          <button
                        onClick={() => deleteUser(user)}
                        className="inline-flex items-center gap-2 rounded-lg border border-red-400/10 bg-red-500/[0.04] px-3 py-2 text-xs font-medium text-red-400 transition hover:border-red-400/20 hover:bg-red-500/10 hover:text-red-300"
                      >
                        <Trash2 size={14} />
                        {isEs ? 'Eliminar' : 'Delete'}
                      </button>
                  )}




                    </td>

                  </tr>
                ))}

              </tbody>

            </table>
          </div>
        )}

      </div>

      {/* CREATE USER MODAL */}
      {showCreate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">

          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-950 p-6 shadow-2xl">

            <div className="mb-6 flex items-center justify-between">

              <div>
                <h2 className="text-xl font-black text-white">
                  {isEs ? 'Agregar Usuario' : 'Add User'}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {isEs
                    ? 'Crear una nueva cuenta en MIA Pro.'
                    : 'Create a new MIA Pro account.'}
                </p>
              </div>

              <button
                onClick={() => setShowCreate(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-white/5 hover:text-white"
              >
                <X size={20} />
              </button>

            </div>

            <form
              onSubmit={createUser}
              className="space-y-4"
            >

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Email
                </label>

                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      email: event.target.value
                    })
                  }
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-emerald-400/30"
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {isEs ? 'Contraseña' : 'Password'}
                </label>

                <input
                  type="password"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      password: event.target.value
                    })
                  }
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-emerald-400/30"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {isEs ? 'Rol' : 'Role'}
                </label>

                <select
                  value={form.role}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      role: event.target.value
                    })
                  }
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400/30"
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                </select>
              </div>

              <div className="flex gap-3 pt-3">

                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="flex-1 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-white/5"
                >
                  {isEs ? 'Cancelar' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
                >
                  {saving
                    ? isEs
                      ? 'Creando...'
                      : 'Creating...'
                    : isEs
                      ? 'Crear Usuario'
                      : 'Create User'}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
