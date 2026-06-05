import type {
  FacilityMapConnection,
  FacilityMapNode,
  FacilityMapTransition,
  MapVersionEditor,
} from '../../shared/services/adminApi';
import { allNodeTypeOptions, transitionTypeOptions } from '../../shared/constants';
import { actionButtonClassName, enumLabel, inputClassName, sectionCardClassName } from '../../shared/utils';

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

type MapGraphListProps = {
  mapEditor: MapVersionEditor;
  selectedMapCanEdit: boolean;
  mapGraphSearch: MapGraphSearchState;
  filteredMapNodes: FacilityMapNode[];
  filteredMapConnections: FacilityMapConnection[];
  mapTransitions: FacilityMapTransition[];
  mapVersionById: Map<string, MapVersionReference>;
  onMapGraphSearchChange: (next: MapGraphSearchState) => void;
  onStartNodeEdit: (node: FacilityMapNode) => void;
  onDeleteNode: (nodeId: string) => void;
  onStartConnectionEdit: (connection: FacilityMapConnection) => void;
  onDeleteConnection: (connectionId: string) => void;
  onDeleteTransition: (transitionId: string) => void;
};

export default function MapGraphList({
  mapEditor,
  selectedMapCanEdit,
  mapGraphSearch,
  filteredMapNodes,
  filteredMapConnections,
  mapTransitions,
  mapVersionById,
  onMapGraphSearchChange,
  onStartNodeEdit,
  onDeleteNode,
  onStartConnectionEdit,
  onDeleteConnection,
  onDeleteTransition,
}: MapGraphListProps) {
  return (
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
                  <button className={actionButtonClassName('neutral')} onClick={() => onStartNodeEdit(node)} type="button">
                    Duzenle
                  </button>
                  <button
                    className={actionButtonClassName('danger')}
                    disabled={!selectedMapCanEdit}
                    onClick={() => onDeleteNode(node.id)}
                    type="button"
                  >
                    Sil
                  </button>
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
                    <button className={actionButtonClassName('neutral')} onClick={() => onStartConnectionEdit(connection)} type="button">
                      Duzenle
                    </button>
                    <button
                      className={actionButtonClassName('danger')}
                      disabled={!selectedMapCanEdit}
                      onClick={() => onDeleteConnection(connection.id)}
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
  );
}
