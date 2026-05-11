import type { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import type { MapVersionEditor } from '../shared/services/adminApi';
import { actionButtonClassName, sectionCardClassName, statusLabel } from '../shared/utils';

type MapPublishPanelProps = {
  busy: boolean;
  mapEditor: MapVersionEditor | null;
  copiedNodeLinkType: string;
  selectedMapsiteFloorUrl: string;
  selectedMapsiteEmbedUrl: string;
  readinessContent: ReactNode;
  onPublish: () => void;
  onCopyEmbedHeader: () => void;
  onCopyFloorLink: () => void;
  onCopyEmbedLink: () => void;
};

export default function MapPublishPanel({
  busy,
  mapEditor,
  copiedNodeLinkType,
  selectedMapsiteFloorUrl,
  selectedMapsiteEmbedUrl,
  readinessContent,
  onPublish,
  onCopyEmbedHeader,
  onCopyFloorLink,
  onCopyEmbedLink,
}: MapPublishPanelProps) {
  return (
    <div className={sectionCardClassName()}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="admin-kicker">Harita editoru</p>
          <h3 className="admin-heading mt-2 text-2xl font-semibold">
            {mapEditor ? mapEditor.name : 'Bir harita surumu sec'}
          </h3>
        </div>
        {mapEditor ? (
          <div className="flex flex-wrap justify-end gap-2">
            <a
              className="admin-action inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold"
              href={selectedMapsiteFloorUrl}
              rel="noreferrer"
              target="_blank"
            >
              Mapsite
              <ArrowRight className="h-4 w-4" />
            </a>
            <button
              className="admin-action inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold"
              onClick={onCopyEmbedHeader}
              type="button"
            >
              {copiedNodeLinkType === 'embed' ? 'Embed kopyalandi' : 'Embed link'}
            </button>
            <button
              className="admin-action admin-action-accent inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold disabled:opacity-60"
              disabled={busy}
              onClick={onPublish}
              type="button"
            >
              Yayinla
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>

      {mapEditor ? (
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="admin-panel-subtle p-4">
            <p className="admin-kicker">Durum</p>
            <p className="mt-2 text-lg font-semibold text-[#F5F3EF]">{statusLabel(mapEditor.status)}</p>
          </div>
          <div className="admin-panel-subtle p-4">
            <p className="admin-kicker">Boyut</p>
            <p className="mt-2 text-lg font-semibold text-[#F5F3EF]">
              {mapEditor.width} x {mapEditor.height}
            </p>
          </div>
          <div className="admin-panel-subtle p-4">
            <p className="admin-kicker">Dugum</p>
            <p className="mt-2 text-lg font-semibold text-[#F5F3EF]">{mapEditor.nodes.length}</p>
          </div>
          <div className="admin-panel-subtle p-4">
            <p className="admin-kicker">Baglanti</p>
            <p className="mt-2 text-lg font-semibold text-[#F5F3EF]">{mapEditor.connections.length}</p>
          </div>
        </div>
      ) : (
        <div className="admin-panel-subtle mt-6 border-dashed p-5 text-sm text-[#8f96a3]">
          Once bir harita surumu sec veya olustur.
        </div>
      )}

      {readinessContent}

      {mapEditor ? (
        <div className="admin-panel-subtle mt-6 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="admin-kicker">Mapsite linkleri</p>
              <p className="mt-2 text-sm leading-6 text-[#8f96a3]">
                Yayindaki kat haritasini web sitesi veya embed yuzeyinde acmak icin kullan.
              </p>
            </div>
            <span className="admin-pill px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em]">
              {statusLabel(mapEditor.status)}
            </span>
          </div>
          <div className="mt-4 grid gap-3">
            <div className="border border-[rgba(245,243,239,0.08)] bg-[#0d1013] p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8f96a3]">Kat linki</p>
              <p className="mt-2 break-all font-mono text-xs leading-5 text-[#d7d2ca]">{selectedMapsiteFloorUrl}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a className={actionButtonClassName('neutral')} href={selectedMapsiteFloorUrl} rel="noreferrer" target="_blank">Ac</a>
                <button className={actionButtonClassName('neutral')} onClick={onCopyFloorLink} type="button">
                  {copiedNodeLinkType === 'floor' ? 'Kopyalandi' : 'Kopyala'}
                </button>
              </div>
            </div>
            <div className="border border-[rgba(245,243,239,0.08)] bg-[#0d1013] p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8f96a3]">Embed linki</p>
              <p className="mt-2 break-all font-mono text-xs leading-5 text-[#d7d2ca]">{selectedMapsiteEmbedUrl}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a className={actionButtonClassName('neutral')} href={selectedMapsiteEmbedUrl} rel="noreferrer" target="_blank">Ac</a>
                <button className={actionButtonClassName('neutral')} onClick={onCopyEmbedLink} type="button">
                  {copiedNodeLinkType === 'embed-panel' ? 'Kopyalandi' : 'Kopyala'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
