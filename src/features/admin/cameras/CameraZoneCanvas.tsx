import type { MouseEventHandler, RefObject } from 'react';
import type { MapVersionEditor } from '../shared/services/adminApi';
import type { CanvasSize, PolygonPoint } from '../shared/types/admin.types';
import { CAMERA_ZONE_GRID_SIZE } from '../shared/constants';
import { isImageMapAsset, mapAssetUrl } from '../shared/utils';

type CameraZoneCanvasProps = {
  mapVersionId: string;
  cameraZoneMapEditor: MapVersionEditor | null;
  cameraZonePoints: PolygonPoint[];
  cameraZoneCanvasImageRect: CanvasSize & { left: number; top: number };
  cameraZoneCanvasRef: RefObject<HTMLDivElement | null>;
  onCanvasClick: MouseEventHandler<HTMLDivElement>;
  onRemovePoint: (pointIndex: number) => void;
};

export default function CameraZoneCanvas({
  mapVersionId,
  cameraZoneMapEditor,
  cameraZonePoints,
  cameraZoneCanvasImageRect,
  cameraZoneCanvasRef,
  onCanvasClick,
  onRemovePoint,
}: CameraZoneCanvasProps) {
  if (!mapVersionId) {
    return (
      <div className="admin-panel-subtle rounded-[8px] border-dashed p-5 text-sm text-[#8f96a3]">
        Polygon cizmek icin once bir harita surumu sec.
      </div>
    );
  }

  if (!cameraZoneMapEditor) {
    return (
      <div className="admin-panel-subtle rounded-[8px] border-dashed p-5 text-sm text-[#8f96a3]">
        Harita surumu yukleniyor.
      </div>
    );
  }

  if (!isImageMapAsset(cameraZoneMapEditor)) {
    return (
      <div className="admin-panel-subtle rounded-[8px] border-dashed p-5 text-sm text-[#8f96a3]">
        Kamera bolgesi cizimi su anda yalnizca gorsel haritalarda destekleniyor.
      </div>
    );
  }

  const polygonPoints = cameraZonePoints
    .map((point) => `${(point.x / cameraZoneMapEditor.width) * 100},${(point.y / cameraZoneMapEditor.height) * 100}`)
    .join(' ');
  const verticalGridLines = Array.from(
    { length: Math.floor(cameraZoneMapEditor.width / CAMERA_ZONE_GRID_SIZE) + 1 },
    (_, index) => index * CAMERA_ZONE_GRID_SIZE,
  ).filter((value) => value > 0 && value < cameraZoneMapEditor.width);
  const horizontalGridLines = Array.from(
    { length: Math.floor(cameraZoneMapEditor.height / CAMERA_ZONE_GRID_SIZE) + 1 },
    (_, index) => index * CAMERA_ZONE_GRID_SIZE,
  ).filter((value) => value > 0 && value < cameraZoneMapEditor.height);

  return (
    <div className="admin-map-shell">
      <div className="admin-map-toolbar flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-xs uppercase tracking-[0.2em] text-[#8f96a3]">
        <span>Polygon editor</span>
        <span>{CAMERA_ZONE_GRID_SIZE}px grid ile snap aktif</span>
      </div>
      <div
        ref={cameraZoneCanvasRef}
        className="relative cursor-crosshair bg-[#090b0d]"
        onClick={onCanvasClick}
        style={{ aspectRatio: `${cameraZoneMapEditor.width} / ${cameraZoneMapEditor.height}` }}
      >
        <img
          alt={cameraZoneMapEditor.name}
          className="h-full w-full object-contain"
          src={mapAssetUrl(cameraZoneMapEditor.assetPath)}
        />
        <svg
          className="pointer-events-none absolute"
          style={{
            left: cameraZoneCanvasImageRect.left,
            top: cameraZoneCanvasImageRect.top,
            width: cameraZoneCanvasImageRect.width,
            height: cameraZoneCanvasImageRect.height,
          }}
          viewBox={`0 0 ${cameraZoneMapEditor.width} ${cameraZoneMapEditor.height}`}
          preserveAspectRatio="none"
        >
          {verticalGridLines.map((x) => (
            <line
              key={`grid-x-${x}`}
              x1={x}
              y1={0}
              x2={x}
              y2={cameraZoneMapEditor.height}
              stroke="rgba(148,163,184,0.18)"
              strokeWidth="1"
            />
          ))}
          {horizontalGridLines.map((y) => (
            <line
              key={`grid-y-${y}`}
              x1={0}
              y1={y}
              x2={cameraZoneMapEditor.width}
              y2={y}
              stroke="rgba(148,163,184,0.18)"
              strokeWidth="1"
            />
          ))}
          {cameraZonePoints.length >= 3 ? (
            <polygon fill="rgba(37,99,235,0.2)" points={polygonPoints} stroke="#60a5fa" strokeWidth="2" />
          ) : null}
          {cameraZonePoints.length >= 2 ? (
            <polyline
              fill="none"
              points={polygonPoints}
              stroke="#93c5fd"
              strokeDasharray="6 4"
              strokeWidth="2"
            />
          ) : null}
        </svg>
        {cameraZonePoints.map((point, index) => (
          <button
            key={`${point.x}-${point.y}-${index}`}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-white bg-blue-500 px-2 py-1 text-[10px] font-semibold text-white shadow-lg"
            onClick={(event) => {
              event.stopPropagation();
              onRemovePoint(index);
            }}
            style={{
              left:
                cameraZoneCanvasImageRect.left +
                (point.x / cameraZoneMapEditor.width) * cameraZoneCanvasImageRect.width,
              top:
                cameraZoneCanvasImageRect.top +
                (point.y / cameraZoneMapEditor.height) * cameraZoneCanvasImageRect.height,
            }}
            type="button"
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
