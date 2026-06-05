import type { MapVersionEditor } from '../../shared/services/adminApi';
import { statusLabel } from '../../shared/utils';

type LockedMapNoticeProps = {
  mapEditor: MapVersionEditor | null;
  selectedMapCanEdit: boolean;
  onDuplicateMapVersion: () => void;
};

export default function LockedMapNotice({
  mapEditor,
  selectedMapCanEdit,
  onDuplicateMapVersion,
}: LockedMapNoticeProps) {
  if (!mapEditor || selectedMapCanEdit) {
    return null;
  }

  return (
    <div className="admin-panel-subtle mt-4 p-4 text-sm leading-6 text-[#d7d2ca]">
      <p className="font-semibold text-[#F5F3EF]">
        Bu surum {statusLabel(mapEditor.status).toLowerCase()} oldugu icin kilitli.
      </p>
      <p className="mt-1 text-[#8f96a3]">
        Duzenlemek icin taslak kopya olustur; yeni kopya otomatik secilir.
      </p>
      <button
        className="admin-action admin-action-accent mt-3 inline-flex items-center justify-center px-4 py-2 text-sm font-semibold"
        onClick={onDuplicateMapVersion}
        type="button"
      >
        Taslak kopya olustur
      </button>
    </div>
  );
}
