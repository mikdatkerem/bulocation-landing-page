import type { MouseEvent } from 'react';
import { actionButtonClassName, rowCardClassName, sectionCardClassName, statusLabel } from '../shared/utils';

type MapVersionListItem = {
  id: string;
  name: string;
  status: number | string;
  floorCode: string;
  floorName: string;
  floorId: string;
  buildingId: string;
  siteId: string;
};

type MapVersionPanelProps = {
  selectedMapVersionId: string;
  filteredMapVersions: MapVersionListItem[];
  onSelectVersion: (version: MapVersionListItem) => void;
  onRename: (versionId: string, versionName: string) => void;
  onDuplicate: (versionId: string, versionName: string) => void;
  onArchive: (versionId: string) => void;
  onDelete: (versionId: string) => void;
};

export default function MapVersionPanel({
  selectedMapVersionId,
  filteredMapVersions,
  onSelectVersion,
  onRename,
  onDuplicate,
  onArchive,
  onDelete,
}: MapVersionPanelProps) {
  const stop = (event: MouseEvent<HTMLSpanElement>) => {
    event.stopPropagation();
  };

  return (
    <div className={sectionCardClassName()}>
      <p className="admin-kicker">Harita surumleri</p>
      <h3 className="admin-heading mt-2 text-2xl font-semibold">Taslak veya yayindaki editoru sec</h3>
      <div className="mt-6 space-y-3">
        {filteredMapVersions.length === 0 ? (
          <div className="admin-panel-subtle border-dashed p-5 text-sm text-[#8f96a3]">
            Secili filtreler icin henuz harita surumu yok.
          </div>
        ) : (
          filteredMapVersions.map((version) => {
            const active = version.id === selectedMapVersionId;
            return (
              <button
                key={version.id}
                className={rowCardClassName(active)}
                onClick={() => onSelectVersion(version)}
                type="button"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{version.name}</p>
                    <p className={`mt-1 text-xs ${active ? 'text-slate-300' : 'text-slate-400'}`}>
                      {version.floorCode} - {version.floorName}
                    </p>
                  </div>
                  <span className="admin-pill px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]">
                    {statusLabel(version.status)}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span
                    className={actionButtonClassName('neutral')}
                    onClick={(event) => {
                      stop(event);
                      onRename(version.id, version.name);
                    }}
                  >
                    Yeniden adlandir
                  </span>
                  <span
                    className={actionButtonClassName('accent')}
                    onClick={(event) => {
                      stop(event);
                      onDuplicate(version.id, version.name);
                    }}
                  >
                    Kopyala
                  </span>
                  <span
                    className={actionButtonClassName('neutral')}
                    onClick={(event) => {
                      stop(event);
                      onArchive(version.id);
                    }}
                  >
                    Arsivle
                  </span>
                  <span
                    className={actionButtonClassName('danger')}
                    onClick={(event) => {
                      stop(event);
                      onDelete(version.id);
                    }}
                  >
                    Sil
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
