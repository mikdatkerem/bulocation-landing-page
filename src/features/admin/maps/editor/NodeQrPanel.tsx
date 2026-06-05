import type { FacilityMapNode } from '../../shared/services/adminApi';
import { nodeTypeGeneratesQr } from '../../shared/utils';

type NodeQrPanelProps = {
  selectedMapNode: FacilityMapNode | null;
  selectedMapIsPublished: boolean;
  selectedNodeQrDataUrl: string;
  selectedNodeMapsiteUrl: string;
  copiedNodeLinkType: string;
  onCopyNodeMapsiteLink: () => void;
};

export default function NodeQrPanel({
  selectedMapNode,
  selectedMapIsPublished,
  selectedNodeQrDataUrl,
  selectedNodeMapsiteUrl,
  copiedNodeLinkType,
  onCopyNodeMapsiteLink,
}: NodeQrPanelProps) {
  if (!selectedMapNode || !nodeTypeGeneratesQr(selectedMapNode.nodeType)) {
    return null;
  }

  return (
    <div className="admin-panel-subtle p-4">
      <p className="admin-kicker">QR ve linkler</p>
      <p className="mt-2 text-sm font-semibold text-[#F5F3EF]">
        {selectedMapNode.code} - {selectedMapNode.label}
      </p>

      {!selectedMapIsPublished ? (
        <div className="mt-4 border border-dashed border-[rgba(245,243,239,0.12)] bg-[#0d1013] p-4 text-sm leading-6 text-[#8f96a3]">
          Bu QR canli mapsite linkidir. Taslak surumlerde kullanima acilmaz; haritayi yayina aldiktan sonra QR ve link burada gorunur.
        </div>
      ) : selectedNodeQrDataUrl ? (
        <div className="mt-4 border border-[rgba(245,243,239,0.08)] bg-[#0d1013] p-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
            <img
              alt={`${selectedMapNode.code} QR`}
              className="h-32 w-32 shrink-0 rounded-[8px] border border-[rgba(245,243,239,0.08)] bg-white p-3"
              src={selectedNodeQrDataUrl}
            />
            <div className="min-w-0 flex-1 space-y-3 text-xs leading-5 text-[#8f96a3]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8f96a3]">
                  Tek QR linki
                </p>
                <p className="mt-2 break-all font-mono text-xs leading-5 text-[#d7d2ca]">
                  {selectedNodeMapsiteUrl}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <a
                  className="admin-action inline-flex items-center justify-center px-3 py-2 font-semibold transition"
                  href={selectedNodeMapsiteUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  Mapsite'de ac
                </a>
                <a
                  className="admin-action inline-flex items-center justify-center px-3 py-2 font-semibold transition"
                  download={`${selectedMapNode.code.toLowerCase()}-qr.png`}
                  href={selectedNodeQrDataUrl}
                >
                  QR indir
                </a>
                <button
                  className="admin-action inline-flex items-center justify-center px-3 py-2 font-semibold transition"
                  onClick={onCopyNodeMapsiteLink}
                  type="button"
                >
                  {copiedNodeLinkType === 'node-mapsite' ? 'Kopyalandi' : 'Link kopyala'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
