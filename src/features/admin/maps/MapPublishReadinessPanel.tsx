import { Check, X } from 'lucide-react';
import type { MapPublishReadiness } from '../shared/services/adminApi';

type MapPublishReadinessPanelProps = {
  mapPublishReadiness: MapPublishReadiness | null;
};

export default function MapPublishReadinessPanel({
  mapPublishReadiness,
}: MapPublishReadinessPanelProps) {
  if (!mapPublishReadiness) {
    return (
      <div className="admin-panel-subtle mt-6 border-dashed p-5 text-sm text-[#8f96a3]">
        Yayin hazirlik kontrolu yukleniyor.
      </div>
    );
  }

  return (
    <div className="mt-6 admin-panel-subtle p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="admin-kicker">Yayin hazirligi</p>
          <p className="mt-2 text-sm text-[#d7d2ca]">
            {mapPublishReadiness.canPublish
              ? 'Bu surum mobil ve mapsite yayini icin temel kontrollerden gecti.'
              : 'Yayina almadan once asagidaki hatalari tamamlayin.'}
          </p>
        </div>
        <span
          className={`admin-pill px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] ${
            mapPublishReadiness.canPublish ? 'text-emerald-200' : 'text-rose-200'
          }`}
        >
          {mapPublishReadiness.canPublish ? 'Hazir' : 'Eksik'}
        </span>
      </div>

      <div className="mt-5 grid gap-3">
        {mapPublishReadiness.checks.map((checkItem) => {
          const passed = checkItem.status === 'pass';
          return (
            <div
              key={checkItem.code}
              className={`border px-4 py-3 ${
                passed ? 'border-emerald-500/20 bg-emerald-950/10' : 'border-rose-500/25 bg-rose-950/15'
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                    passed ? 'border-emerald-400/40 text-emerald-200' : 'border-rose-400/40 text-rose-200'
                  }`}
                >
                  {passed ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#F5F3EF]">{checkItem.label}</p>
                  <p className="mt-1 text-xs leading-5 text-[#8f96a3]">{checkItem.message}</p>
                  {checkItem.details.length > 0 ? (
                    <ul className="mt-3 space-y-1 text-xs leading-5 text-[#d7d2ca]">
                      {checkItem.details.slice(0, 6).map((detail) => (
                        <li key={detail}>{detail}</li>
                      ))}
                      {checkItem.details.length > 6 ? <li>{checkItem.details.length - 6} kayit daha var.</li> : null}
                    </ul>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
