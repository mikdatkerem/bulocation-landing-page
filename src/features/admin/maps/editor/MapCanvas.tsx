import type { MouseEventHandler, RefObject } from 'react';
import { Eye, EyeOff, MousePointer2, Plus, Waypoints } from 'lucide-react';
import type { FacilityMapNode, MapVersionEditor } from '../../shared/services/adminApi';
import type {
  CanvasSize,
  MapEditorSelectionState,
  MapEditorTool,
} from '../../shared/types/admin.types';
import { isImageMapAsset, mapAssetUrl, nodeTypeGeneratesQr } from '../../shared/utils';

type MapCanvasProps = {
  mapEditor: MapVersionEditor;
  selectedMapCanEdit: boolean;
  mapEditorTool: MapEditorTool;
  mapEditorSelection: MapEditorSelectionState;
  connectionStartNodeId: string;
  connectionStartNode: FacilityMapNode | null;
  nodeQrDataUrls: Record<string, string>;
  hiddenNodeIds: Record<string, boolean>;
  mapCanvasImageRect: CanvasSize & { left: number; top: number };
  mapCanvasRef: RefObject<HTMLDivElement | null>;
  onCanvasClick: MouseEventHandler<HTMLDivElement>;
  onToolSelect: (tool: MapEditorTool) => void;
  onNodeClick: (node: FacilityMapNode) => void;
  onToggleNodeVisibility: (nodeId: string) => void;
};

export default function MapCanvas({
  mapEditor,
  selectedMapCanEdit,
  mapEditorTool,
  mapEditorSelection,
  connectionStartNodeId,
  connectionStartNode,
  nodeQrDataUrls,
  hiddenNodeIds,
  mapCanvasImageRect,
  mapCanvasRef,
  onCanvasClick,
  onToolSelect,
  onNodeClick,
  onToggleNodeVisibility,
}: MapCanvasProps) {
  if (!isImageMapAsset(mapEditor)) {
    return (
      <div className="admin-panel-subtle rounded-[8px] border-dashed p-6 text-sm leading-6 text-[#8f96a3]">
        Bu surum gorsel olmayan bir dosya turu kullaniyor. PDF veya baska formatlar icin su anda sadece liste
        tabanli editor aktif.
      </div>
    );
  }

  const nodeMap = new globalThis.Map(mapEditor.nodes.map((node) => [node.id, node]));

  return (
    <div className="admin-map-shell">
      <div className="admin-map-toolbar flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          {([
            { key: 'select' as const, label: 'Sec', icon: MousePointer2 },
            { key: 'node' as const, label: 'Nokta', icon: Plus },
            { key: 'connection' as const, label: 'Baglanti', icon: Waypoints },
          ]).map((tool) => {
            const Icon = tool.icon;
            const active = mapEditorTool === tool.key;
            const disabled = tool.key !== 'select' && !selectedMapCanEdit;
            return (
              <button
                key={tool.key}
                className={`admin-map-tool inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold ${
                  active ? 'admin-map-tool-active' : ''
                }`}
                disabled={disabled}
                onClick={() => onToolSelect(tool.key)}
                type="button"
              >
                <Icon className="h-3.5 w-3.5" />
                {tool.label}
              </button>
            );
          })}
        </div>
        <div className="text-xs uppercase tracking-[0.2em] text-[#8f96a3]">
          {mapEditorTool === 'connection'
            ? connectionStartNode
              ? `${connectionStartNode.code} secildi, hedef dugume tikla`
              : 'Baslangic dugumune tikla'
            : mapEditorTool === 'node'
              ? 'Bos alana tikla, koordinat sec'
              : 'Dugume tikla, duzenle'}
        </div>
      </div>
      <div
        ref={mapCanvasRef}
        className={`relative bg-[#090b0d] ${
          mapEditorTool === 'node'
            ? 'cursor-crosshair'
            : mapEditorTool === 'connection'
              ? 'cursor-copy'
              : 'cursor-default'
        }`}
        onClick={onCanvasClick}
        style={{ aspectRatio: `${mapEditor.width} / ${mapEditor.height}` }}
      >
        <img alt={mapEditor.name} className="h-full w-full object-contain" src={mapAssetUrl(mapEditor.assetPath)} />
        <svg
          className="pointer-events-none absolute"
          style={{
            left: mapCanvasImageRect.left,
            top: mapCanvasImageRect.top,
            width: mapCanvasImageRect.width,
            height: mapCanvasImageRect.height,
          }}
          viewBox={`0 0 ${mapEditor.width} ${mapEditor.height}`}
          preserveAspectRatio="none"
        >
          {mapEditor.connections.map((connection) => {
            const fromNode = nodeMap.get(connection.fromNodeId);
            const toNode = nodeMap.get(connection.toNodeId);

            if (!fromNode || !toNode) {
              return null;
            }

            return (
              <line
                key={connection.id}
                x1={fromNode.pixelX}
                y1={fromNode.pixelY}
                x2={toNode.pixelX}
                y2={toNode.pixelY}
                stroke={connection.isAccessible ? '#38bdf8' : '#94a3b8'}
                strokeWidth="3"
                strokeDasharray={connection.isBidirectional ? '0' : '8 6'}
                strokeOpacity="0.9"
              />
            );
          })}
        </svg>
        {mapEditor.nodes.map((node) => {
          const selected = mapEditorSelection.editingNodeId === node.id;
          const connectionStart = connectionStartNodeId === node.id;
          const qrPreview = nodeQrDataUrls[node.id];
          const showQrPreview = nodeTypeGeneratesQr(node.nodeType) && !!qrPreview;
          const hidden = !!hiddenNodeIds[node.id];

          return (
            <div
              key={node.id}
              className={`absolute -translate-x-1/2 -translate-y-1/2 ${selected ? 'z-20' : 'z-10'}`}
              style={{
                left: mapCanvasImageRect.left + (node.pixelX / mapEditor.width) * mapCanvasImageRect.width,
                top: mapCanvasImageRect.top + (node.pixelY / mapEditor.height) * mapCanvasImageRect.height,
              }}
            >
              <div className="flex items-center gap-1">
                {!hidden ? (
                  <button
                    className={`border px-2 py-1 text-[10px] font-semibold shadow-lg transition ${
                      selected || connectionStart
                        ? 'border-[#1836B9] bg-[#1836B9] text-[#F5F3EF]'
                        : 'border-[rgba(245,243,239,0.12)] bg-[#0f1216] text-[#F5F3EF]'
                    } ${showQrPreview ? 'rounded-[8px]' : 'rounded-full'}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      onNodeClick(node);
                    }}
                    type="button"
                  >
                    <span className="flex items-center gap-1.5">
                      {showQrPreview ? (
                        <img
                          alt={`${node.code} mini qr`}
                          className={`h-4 w-4 rounded-[4px] border ${
                            selected ? 'border-white/30 bg-white p-0.5' : 'border-white/10 bg-white p-0.5'
                          }`}
                          src={qrPreview}
                        />
                      ) : null}
                      <span>{node.code}</span>
                    </span>
                  </button>
                ) : null}
                <button
                  aria-label={hidden ? `${node.code} goster` : `${node.code} gizle`}
                  className={`inline-flex h-6 w-6 items-center justify-center rounded-full border shadow-sm transition ${
                    hidden
                      ? 'border-[#9B18B9]/30 bg-[#9B18B9]/15 text-[#e9d6ff]'
                      : 'border-[rgba(245,243,239,0.12)] bg-[#0f1216] text-[#d7d2ca]'
                  }`}
                  onClick={(event) => {
                    event.stopPropagation();
                    onToggleNodeVisibility(node.id);
                  }}
                  type="button"
                >
                  {hidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
