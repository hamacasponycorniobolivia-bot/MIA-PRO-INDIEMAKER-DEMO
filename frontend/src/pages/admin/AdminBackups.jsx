import { useState } from 'react';
import { Database, Download, RotateCcw, ShieldCheck } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function AdminBackups() {
  const [backupPath, setBackupPath] = useState('');
  const [restorePath, setRestorePath] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');

  const handleBackup = async () => {
    if (!backupPath.trim()) {
      setMessage('Debes indicar dónde guardar el backup.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API}/api/admin/backups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ path: backupPath.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'No se pudo crear el backup.');
      }

      setMessage(`Backup creado correctamente: ${data.file || backupPath}`);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!restorePath.trim()) {
      setMessage('Debes indicar la ruta del backup.');
      return;
    }

    if (!window.confirm('¿Confirmas restaurar este backup? Esta operación modificará la base de datos.')) {
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API}/api/admin/backups/restore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ path: restorePath.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'No se pudo restaurar el backup.');
      }

      setMessage('Backup restaurado correctamente.');
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Backups</h1>
        <p className="mt-2 text-slate-400">
          Gestión segura de copias de respaldo de MIA Pro.
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Database className="w-6 h-6 text-emerald-400" />
          <div>
            <h2 className="text-lg font-semibold text-white">Crear Backup</h2>
            <p className="text-sm text-slate-400">
              Indica la ruta donde quieres guardar la copia.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <input
            type="text"
            value={backupPath}
            onChange={(e) => setBackupPath(e.target.value)}
            placeholder="/mnt/MIA/SEGURIDAD_BACKUPS"
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-500"
          />

          <button
            onClick={handleBackup}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            <Download className="w-5 h-5" />
            {loading ? 'Procesando...' : 'Crear Backup'}
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-red-900/50 bg-slate-900 p-6">
        <div className="flex items-center gap-3 mb-6">
          <RotateCcw className="w-6 h-6 text-red-400" />
          <div>
            <h2 className="text-lg font-semibold text-white">Restaurar Backup</h2>
            <p className="text-sm text-slate-400">
              Indica la ruta del archivo .dump que deseas restaurar.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <input
            type="text"
            value={restorePath}
            onChange={(e) => setRestorePath(e.target.value)}
            placeholder="/mnt/MIA/SEGURIDAD_BACKUPS/mia_pro_20260829-120000.dump"
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-red-500"
          />

          <button
            onClick={handleRestore}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-500 disabled:opacity-50"
          >
            <RotateCcw className="w-5 h-5" />
            {loading ? 'Procesando...' : 'Restaurar Backup'}
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span className="text-sm text-slate-300">
            Las operaciones requieren autenticación administrativa.
          </span>
        </div>
      </div>

      {message && (
        <div className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-300">
          {message}
        </div>
      )}
    </div>
  );
}
