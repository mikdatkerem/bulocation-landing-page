import { Plus, Waypoints } from 'lucide-react';
import type {
  FacilityMapConnection,
  FacilityMapNode,
  FacilityMapTransition,
  MapVersionEditor,
} from '../../shared/services/adminApi';
import CodeGuide from '../../shared/components/CodeGuide';
import FieldShell from '../../shared/components/FieldShell';
import LockedMapNotice from './LockedMapNotice';
import MapGraphList from './MapGraphList';
import NodeQrPanel from './NodeQrPanel';
import { getNodeTypeGuide } from './nodeTypeGuide';
import type {
  ConnectionForm,
  MapEditorSelectionState,
  MapEditorTool,
  NodeForm,
  TransitionForm,
} from '../../shared/types/admin.types';
import { allNodeTypeOptions, nodeTypeOptions, transitionTypeOptions } from '../../shared/constants';
import {
  enumLabel,
  inputClassName,
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
          <LockedMapNotice
            mapEditor={mapEditor}
            selectedMapCanEdit={selectedMapCanEdit}
            onDuplicateMapVersion={onDuplicateMapVersion}
          />
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
              {getNodeTypeGuide(nodeForm.nodeType, isParkingSpotNode)}
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
            <NodeQrPanel
              selectedMapNode={selectedMapNode}
              selectedMapIsPublished={selectedMapIsPublished}
              selectedNodeQrDataUrl={selectedNodeQrDataUrl}
              selectedNodeMapsiteUrl={selectedNodeMapsiteUrl}
              copiedNodeLinkType={copiedNodeLinkType}
              onCopyNodeMapsiteLink={onCopyNodeMapsiteLink}
            />
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
        <MapGraphList
          mapEditor={mapEditor}
          selectedMapCanEdit={selectedMapCanEdit}
          mapGraphSearch={mapGraphSearch}
          filteredMapNodes={filteredMapNodes}
          filteredMapConnections={filteredMapConnections}
          mapTransitions={mapTransitions}
          mapVersionById={mapVersionById}
          onMapGraphSearchChange={onMapGraphSearchChange}
          onStartNodeEdit={onStartNodeEdit}
          onDeleteNode={onDeleteNode}
          onStartConnectionEdit={onStartConnectionEdit}
          onDeleteConnection={onDeleteConnection}
          onDeleteTransition={onDeleteTransition}
        />
      ) : null}
    </>
  );
}
