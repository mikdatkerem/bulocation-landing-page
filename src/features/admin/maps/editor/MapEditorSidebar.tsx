import { Plus, Waypoints } from 'lucide-react';
import type {
  FacilityMapConnection,
  FacilityMapNode,
  FacilityMapTransition,
  MapVersionEditor,
} from '../../shared/services/adminApi';
import CodeGuide from '../../shared/components/CodeGuide';
import FieldShell from '../../shared/components/FieldShell';
import type {
  ConnectionForm,
  MapEditorSelectionState,
  MapEditorTool,
  NodeForm,
  TransitionForm,
} from '../../shared/types/admin.types';
import { allNodeTypeOptions, nodeTypeOptions, transitionTypeOptions } from '../../shared/constants';
import {
  actionButtonClassName,
  enumLabel,
  inputClassName,
  nodeTypeGeneratesQr,
  sectionCardClassName,
  selectClassName,
  statusLabel,
} from '../../shared/utils';

type MapVersionReference = {
  id: string;
  name: string;
  floorName: string;
  status: number | string;
};

type MapGraphSearchState = {
  fromNodeTerm: string;
  toNodeTerm: string;
  transitionFromNodeTerm: string;
  transitionMapTerm: string;
  transitionToNodeTerm: string;
  nodeListTerm: string;
  connectionListTerm: string;
};

type MapEditorSidebarProps = {
  busy: boolean;
  mapEditor: MapVersionEditor | null;
  selectedMapVersionId: string;
  selectedMapCanEdit: boolean;
  selectedMapIsPublished: boolean;
  isParkingSpotNode: boolean;
  selectedMapNode: FacilityMapNode | null;
  selectedNodeQrDataUrl: string;
  selectedNodeMapsiteUrl: string;
  copiedNodeLinkType: string;
  connectionStartNode: FacilityMapNode | null;
  mapEditorSelection: MapEditorSelectionState;
  nodeForm: NodeForm;
  connectionForm: ConnectionForm;
  transitionForm: TransitionForm;
  mapEditorTool: MapEditorTool;
  mapGraphSearch: MapGraphSearchState;
  filteredFromNodes: FacilityMapNode[];
  filteredToNodes: FacilityMapNode[];
  filteredMapNodes: FacilityMapNode[];
  filteredMapConnections: FacilityMapConnection[];
  transitionSourceNodes: FacilityMapNode[];
  transitionTargetNodes: FacilityMapNode[];
  transitionTargetEditor: MapVersionEditor | null;
  transitionTargetMapVersions: MapVersionReference[];
  mapTransitions: FacilityMapTransition[];
  mapVersionById: Map<string, MapVersionReference>;
  onNodeFormChange: (next: NodeForm) => void;
  onConnectionFormChange: (next: ConnectionForm) => void;
  onTransitionFormChange: (next: TransitionForm) => void;
  onMapEditorToolChange: (tool: MapEditorTool) => void;
  onMapGraphSearchChange: (next: MapGraphSearchState) => void;
  onDuplicateMapVersion: () => void;
  onSaveNode: () => void;
  onSaveConnection: () => void;
  onSaveTransition: () => void;
  onCopyNodeMapsiteLink: () => void;
  onStartNodeEdit: (node: FacilityMapNode) => void;
  onDeleteNode: (nodeId: string) => void;
  onStartConnectionEdit: (connection: FacilityMapConnection) => void;
  onDeleteConnection: (connectionId: string) => void;
  onDeleteTransition: (transitionId: string) => void;
};

export default function MapEditorSidebar({
  busy,
  mapEditor,
  selectedMapVersionId,
  selectedMapCanEdit,
  selectedMapIsPublished,
  isParkingSpotNode,
  selectedMapNode,
  selectedNodeQrDataUrl,
  selectedNodeMapsiteUrl,
  copiedNodeLinkType,
  connectionStartNode,
  mapEditorSelection,
  nodeForm,
  connectionForm,
  transitionForm,
  mapGraphSearch,
  filteredFromNodes,
  filteredToNodes,
  filteredMapNodes,
  filteredMapConnections,
  transitionSourceNodes,
  transitionTargetNodes,
  transitionTargetEditor,
  transitionTargetMapVersions,
  mapTransitions,
  mapVersionById,
  onNodeFormChange,
  onConnectionFormChange,
  onTransitionFormChange,
  onMapEditorToolChange,
  onMapGraphSearchChange,
  onDuplicateMapVersion,
  onSaveNode,
  onSaveConnection,
  onSaveTransition,
  onCopyNodeMapsiteLink,
  onStartNodeEdit,
  onDeleteNode,
  onStartConnectionEdit,
  onDeleteConnection,
  onDeleteTransition,
}: MapEditorSidebarProps) {
  return (
    <>
      <div className="grid gap-6 xl:grid-cols-2 2xl:grid-cols-3">
        <div className={sectionCardClassName()}>
          <p className="admin-kicker">Dugum ekle</p>
          {mapEditor && !selectedMapCanEdit ? (
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
          ) : null}
          <div className="mt-6 grid gap-4">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {nodeTypeOptions.map((option) => {
                const active = nodeForm.nodeType === option.value;
                return (
                  <button
                    key={option.value}
                    className={`admin-map-tool px-3 py-2 text-left text-xs font-semibold ${
                      active ? 'admin-map-tool-active' : ''
                    }`}
                    onClick={() => {
                      onNodeFormChange({ ...nodeForm, nodeType: option.value });
                      onMapEditorToolChange('node');
                    }}
                    type="button"
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
            <FieldShell label="Etiket">
              <input
                className={inputClassName()}
                value={nodeForm.label}
                onChange={(event) => onNodeFormChange({ ...nodeForm, label: event.target.value })}
              />
            </FieldShell>
            <FieldShell label="Dugum tipi">
              <select
                className={selectClassName()}
                value={nodeForm.nodeType}
                onChange={(event) => onNodeFormChange({ ...nodeForm, nodeType: Number(event.target.value) })}
              >
                {nodeTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FieldShell>
            <div className="grid gap-4 sm:grid-cols-2">
              <FieldShell label="Piksel X">
                <input
                  className={inputClassName()}
                  type="number"
                  value={nodeForm.pixelX}
                  onChange={(event) => onNodeFormChange({ ...nodeForm, pixelX: Number(event.target.value) })}
                />
              </FieldShell>
              <FieldShell label="Piksel Y">
                <input
                  className={inputClassName()}
                  type="number"
                  value={nodeForm.pixelY}
                  onChange={(event) => onNodeFormChange({ ...nodeForm, pixelY: Number(event.target.value) })}
                />
              </FieldShell>
            </div>
            <CodeGuide>
              {isParkingSpotNode
                ? 'Bu nokta kaydedildiginde park kaydi ve QR kodu sistem tarafinda otomatik olusturulur.'
                : 'Bu nokta kaydedildiginde QR kodu sistem tarafinda otomatik olusturulur.'}
            </CodeGuide>
            <label className="admin-panel-subtle flex items-center gap-3 px-4 py-3 text-sm text-[#d7d2ca]">
              <input
                checked={nodeForm.isAccessible}
                onChange={(event) => onNodeFormChange({ ...nodeForm, isAccessible: event.target.checked })}
                type="checkbox"
              />
              Erisilebilir dugum
            </label>
            <button
              className="admin-action admin-action-accent inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold disabled:opacity-60"
              disabled={busy || !selectedMapVersionId || !selectedMapCanEdit || !nodeForm.label.trim()}
              onClick={onSaveNode}
              type="button"
            >
              <Plus className="h-4 w-4" />
              {mapEditorSelection.editingNodeId ? 'Dugumu guncelle' : 'Dugum ekle'}
            </button>
            {selectedMapNode && nodeTypeGeneratesQr(selectedMapNode.nodeType) ? (
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
            ) : null}
          </div>
        </div>

        <div className={sectionCardClassName()}>
          <p className="admin-kicker">Baglanti ekle</p>
          {connectionStartNode ? (
            <div className="admin-panel-subtle mt-4 p-3 text-xs leading-5 text-[#d7d2ca]">
              Canvas secimi: {connectionStartNode.code} - {connectionStartNode.label}
            </div>
          ) : null}
          <div className="mt-6 grid gap-4">
            <FieldShell label="Baslangic dugumu">
              <input
                className={`${inputClassName()} mb-3`}
                placeholder="Kod veya etiket ara"
                value={mapGraphSearch.fromNodeTerm}
                onChange={(event) => onMapGraphSearchChange({ ...mapGraphSearch, fromNodeTerm: event.target.value })}
              />
              <select
                className={selectClassName()}
                value={connectionForm.fromNodeId}
                onChange={(event) => onConnectionFormChange({ ...connectionForm, fromNodeId: event.target.value })}
              >
                <option value="">Dugum sec</option>
                {filteredFromNodes.map((node) => (
                  <option key={node.id} value={node.id}>
                    {node.code} - {node.label}
                  </option>
                ))}
              </select>
            </FieldShell>
            <FieldShell label="Hedef dugumu">
              <input
                className={`${inputClassName()} mb-3`}
                placeholder="Kod veya etiket ara"
                value={mapGraphSearch.toNodeTerm}
                onChange={(event) => onMapGraphSearchChange({ ...mapGraphSearch, toNodeTerm: event.target.value })}
              />
              <select
                className={selectClassName()}
                value={connectionForm.toNodeId}
                onChange={(event) => onConnectionFormChange({ ...connectionForm, toNodeId: event.target.value })}
              >
                <option value="">Dugum sec</option>
                {filteredToNodes.map((node) => (
                  <option key={node.id} value={node.id}>
                    {node.code} - {node.label}
                  </option>
                ))}
              </select>
            </FieldShell>
            <FieldShell label="Mesafe metre">
              <input
                className={inputClassName()}
                type="number"
                min="0"
                step="0.1"
                value={connectionForm.distanceMeters}
                onChange={(event) =>
                  onConnectionFormChange({ ...connectionForm, distanceMeters: Number(event.target.value) })
                }
              />
            </FieldShell>
            <label className="admin-panel-subtle flex items-center gap-3 px-4 py-3 text-sm text-[#d7d2ca]">
              <input
                checked={connectionForm.isBidirectional}
                onChange={(event) =>
                  onConnectionFormChange({ ...connectionForm, isBidirectional: event.target.checked })
                }
                type="checkbox"
              />
              Cift yonlu
            </label>
            <label className="admin-panel-subtle flex items-center gap-3 px-4 py-3 text-sm text-[#d7d2ca]">
              <input
                checked={connectionForm.isAccessible}
                onChange={(event) =>
                  onConnectionFormChange({ ...connectionForm, isAccessible: event.target.checked })
                }
                type="checkbox"
              />
              Erisilebilir baglanti
            </label>
            <button
              className="admin-action admin-action-accent inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold disabled:opacity-60"
              disabled={
                busy ||
                !selectedMapVersionId ||
                !selectedMapCanEdit ||
                !connectionForm.fromNodeId ||
                !connectionForm.toNodeId ||
                connectionForm.fromNodeId === connectionForm.toNodeId
              }
              onClick={onSaveConnection}
              type="button"
            >
              <Waypoints className="h-4 w-4" />
              {mapEditorSelection.editingConnectionId ? 'Baglantiyi guncelle' : 'Baglanti ekle'}
            </button>
          </div>
        </div>

        <div className={sectionCardClassName()}>
          <p className="admin-kicker">Kat gecisi ekle</p>
          <div className="admin-panel-subtle mt-4 p-3 text-xs leading-5 text-[#8f96a3]">
            Asansor, merdiven, giris ve cikis gibi gecis dugumlerini ayni binadaki baska kat haritasina baglar.
          </div>
          <div className="mt-6 grid gap-4">
            <FieldShell label="Bu kattaki gecis dugumu">
              <input
                className={`${inputClassName()} mb-3`}
                placeholder="Kod, etiket veya tip ara"
                value={mapGraphSearch.transitionFromNodeTerm}
                onChange={(event) =>
                  onMapGraphSearchChange({ ...mapGraphSearch, transitionFromNodeTerm: event.target.value })
                }
              />
              <select
                className={selectClassName()}
                value={transitionForm.fromNodeId}
                onChange={(event) => onTransitionFormChange({ ...transitionForm, fromNodeId: event.target.value })}
              >
                <option value="">Dugum sec</option>
                {transitionSourceNodes.map((node) => (
                  <option key={node.id} value={node.id}>
                    {node.code} - {node.label} / {enumLabel(node.nodeType, allNodeTypeOptions)}
                  </option>
                ))}
              </select>
            </FieldShell>
            <FieldShell label="Hedef kat haritasi">
              <input
                className={`${inputClassName()} mb-3`}
                placeholder="Kat veya harita adi ara"
                value={mapGraphSearch.transitionMapTerm}
                onChange={(event) =>
                  onMapGraphSearchChange({ ...mapGraphSearch, transitionMapTerm: event.target.value })
                }
              />
              <select
                className={selectClassName()}
                value={transitionForm.toMapVersionId}
                onChange={(event) =>
                  onTransitionFormChange({
                    ...transitionForm,
                    toMapVersionId: event.target.value,
                    toNodeId: '',
                  })
                }
              >
                <option value="">Hedef harita sec</option>
                {transitionTargetMapVersions.map((version) => (
                  <option key={version.id} value={version.id}>
                    {version.floorName} - {version.name} / {statusLabel(version.status)}
                  </option>
                ))}
              </select>
            </FieldShell>
            <FieldShell label="Hedef kattaki dugum">
              <input
                className={`${inputClassName()} mb-3`}
                placeholder="Kod, etiket veya tip ara"
                value={mapGraphSearch.transitionToNodeTerm}
                onChange={(event) =>
                  onMapGraphSearchChange({ ...mapGraphSearch, transitionToNodeTerm: event.target.value })
                }
              />
              <select
                className={selectClassName()}
                disabled={!transitionTargetEditor}
                value={transitionForm.toNodeId}
                onChange={(event) => onTransitionFormChange({ ...transitionForm, toNodeId: event.target.value })}
              >
                <option value="">Hedef dugum sec</option>
                {transitionTargetNodes.map((node) => (
                  <option key={node.id} value={node.id}>
                    {node.code} - {node.label} / {enumLabel(node.nodeType, allNodeTypeOptions)}
                  </option>
                ))}
              </select>
            </FieldShell>
            <FieldShell label="Gecis tipi">
              <select
                className={selectClassName()}
                value={transitionForm.connectionType}
                onChange={(event) =>
                  onTransitionFormChange({ ...transitionForm, connectionType: Number(event.target.value) })
                }
              >
                {transitionTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FieldShell>
            <FieldShell label="Mesafe metre">
              <input
                className={inputClassName()}
                min="0.1"
                step="0.1"
                type="number"
                value={transitionForm.distanceMeters}
                onChange={(event) =>
                  onTransitionFormChange({ ...transitionForm, distanceMeters: Number(event.target.value) })
                }
              />
            </FieldShell>
            <label className="admin-panel-subtle flex items-center gap-3 px-4 py-3 text-sm text-[#d7d2ca]">
              <input
                checked={transitionForm.isBidirectional}
                onChange={(event) =>
                  onTransitionFormChange({ ...transitionForm, isBidirectional: event.target.checked })
                }
                type="checkbox"
              />
              Cift yonlu
            </label>
            <label className="admin-panel-subtle flex items-center gap-3 px-4 py-3 text-sm text-[#d7d2ca]">
              <input
                checked={transitionForm.isAccessible}
                onChange={(event) =>
                  onTransitionFormChange({ ...transitionForm, isAccessible: event.target.checked })
                }
                type="checkbox"
              />
              Erisilebilir gecis
            </label>
            <button
              className="admin-action admin-action-accent inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold disabled:opacity-60"
              disabled={
                busy ||
                !selectedMapVersionId ||
                !selectedMapCanEdit ||
                !transitionForm.fromNodeId ||
                !transitionForm.toMapVersionId ||
                !transitionForm.toNodeId
              }
              onClick={onSaveTransition}
              type="button"
            >
              <Waypoints className="h-4 w-4" />
              Kat gecisi ekle
            </button>
          </div>
        </div>
      </div>

      {mapEditor ? (
        <div className={sectionCardClassName()}>
          <p className="admin-kicker">Mevcut grafik</p>
          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-[#F5F3EF]">Dugumler</p>
                <div className="w-full max-w-xs">
                  <input
                    className={inputClassName()}
                    placeholder="Kod, etiket veya tip ara"
                    value={mapGraphSearch.nodeListTerm}
                    onChange={(event) => onMapGraphSearchChange({ ...mapGraphSearch, nodeListTerm: event.target.value })}
                  />
                </div>
              </div>
              <div className="mt-4 space-y-3">
                {filteredMapNodes.map((node) => (
                  <div key={node.id} className="admin-panel-subtle p-4">
                    <p className="text-sm font-semibold text-[#F5F3EF]">
                      {node.code} - {node.label}
                    </p>
                    <p className="mt-1 text-xs text-[#8f96a3]">
                      {enumLabel(node.nodeType, allNodeTypeOptions)} - ({node.pixelX}, {node.pixelY})
                    </p>
                    <div className="mt-3 flex gap-2">
                      <button className={actionButtonClassName('neutral')} onClick={() => onStartNodeEdit(node)} type="button">Duzenle</button>
                      <button className={actionButtonClassName('danger')} disabled={!selectedMapCanEdit} onClick={() => onDeleteNode(node.id)} type="button">Sil</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-[#F5F3EF]">Baglantilar</p>
                <div className="w-full max-w-xs">
                  <input
                    className={inputClassName()}
                    placeholder="Baslangic veya hedef ara"
                    value={mapGraphSearch.connectionListTerm}
                    onChange={(event) =>
                      onMapGraphSearchChange({ ...mapGraphSearch, connectionListTerm: event.target.value })
                    }
                  />
                </div>
              </div>
              <div className="mt-4 space-y-3">
                {filteredMapConnections.map((connection) => {
                  const fromNode = mapEditor.nodes.find((node) => node.id === connection.fromNodeId);
                  const toNode = mapEditor.nodes.find((node) => node.id === connection.toNodeId);
                  return (
                    <div key={connection.id} className="admin-panel-subtle p-4">
                      <p className="text-sm font-semibold text-[#F5F3EF]">
                        {fromNode ? `${fromNode.code} - ${fromNode.label}` : connection.fromNodeId.slice(0, 8)}
                        {' -> '}
                        {toNode ? `${toNode.code} - ${toNode.label}` : connection.toNodeId.slice(0, 8)}
                      </p>
                      <p className="mt-1 text-xs text-[#8f96a3]">
                        {connection.distanceMeters}m - {connection.isBidirectional ? 'Cift yonlu' : 'Tek yonlu'}
                      </p>
                      <div className="mt-3 flex gap-2">
                        <button className={actionButtonClassName('neutral')} onClick={() => onStartConnectionEdit(connection)} type="button">Duzenle</button>
                        <button className={actionButtonClassName('danger')} disabled={!selectedMapCanEdit} onClick={() => onDeleteConnection(connection.id)} type="button">Sil</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-[rgba(245,243,239,0.08)] pt-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#F5F3EF]">Kat gecisleri</p>
                <p className="mt-1 text-xs leading-5 text-[#8f96a3]">
                  Bu haritadan veya bu haritaya tanimlanan asansor, merdiven ve giris baglantilari.
                </p>
              </div>
              <span className="admin-pill px-3 py-1.5 text-xs font-semibold">
                {mapTransitions.length} kayit
              </span>
            </div>
            <div className="mt-4 grid gap-3 xl:grid-cols-2">
              {mapTransitions.length === 0 ? (
                <div className="admin-panel-subtle border-dashed p-4 text-sm text-[#8f96a3]">
                  Henuz kat gecisi yok.
                </div>
              ) : null}
              {mapTransitions.map((transition) => {
                const fromMap = mapVersionById.get(transition.fromMapVersionId);
                const toMap = mapVersionById.get(transition.toMapVersionId);
                const fromNode =
                  transition.fromMapVersionId === mapEditor.id
                    ? mapEditor.nodes.find((node) => node.id === transition.fromNodeId)
                    : null;
                const toNode =
                  transition.toMapVersionId === mapEditor.id
                    ? mapEditor.nodes.find((node) => node.id === transition.toNodeId)
                    : null;
                return (
                  <div key={transition.id} className="admin-panel-subtle p-4">
                    <p className="text-sm font-semibold text-[#F5F3EF]">
                      {fromNode ? `${fromNode.code} - ${fromNode.label}` : fromMap?.floorName ?? 'Kaynak kat'}
                      {' -> '}
                      {toNode ? `${toNode.code} - ${toNode.label}` : toMap?.floorName ?? 'Hedef kat'}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[#8f96a3]">
                      {fromMap ? `${fromMap.floorName} / ${fromMap.name}` : transition.fromMapVersionId.slice(0, 8)}
                      {' -> '}
                      {toMap ? `${toMap.floorName} / ${toMap.name}` : transition.toMapVersionId.slice(0, 8)}
                    </p>
                    <p className="mt-1 text-xs text-[#8f96a3]">
                      {enumLabel(transition.connectionType, transitionTypeOptions)} - {transition.distanceMeters}m -{' '}
                      {transition.isBidirectional ? 'Cift yonlu' : 'Tek yonlu'}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <button
                        className={actionButtonClassName('danger')}
                        disabled={!selectedMapCanEdit}
                        onClick={() => onDeleteTransition(transition.id)}
                        type="button"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
