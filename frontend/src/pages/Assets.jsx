
import { useTranslation } from 'react-i18next';

export default function Assets() {
  const { t } = useTranslation();
  const assets = [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">
          {t('Mis Activos')}
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          {t('Tus activos digitales aparecerán aquí cuando existan.')}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-10 text-center">
        <div className="text-5xl font-bold text-white">
          {assets.length}
        </div>

        <div className="mt-2 text-base text-slate-300">
          {t('Assets disponibles')}
        </div>

        <div className="mt-3 text-sm text-slate-500">
          {t('No hay assets disponibles actualmente.')}
        </div>
      </div>
    </div>
  );
}
