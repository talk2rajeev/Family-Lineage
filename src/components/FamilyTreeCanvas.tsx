'use client';

import { useCallback, useState, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  NodeChange,
  applyNodeChanges,
  useReactFlow,
} from '@xyflow/react';
import { Wand2 } from 'lucide-react';
import '@xyflow/react/dist/style.css';
import FamilyNode from '@/components/nodes/FamilyNode';
import ContextMenu from '@/components/ContextMenu';
import Legend from '@/components/Legend';
import TreeLayoutControl from '@/components/TreeLayoutControl';
import { ContextMenuState, FamilyNode as FamilyNodeData } from '@/types/family';
import { RFNode, RFEdge, useFamilyStore } from '@/store/familyStore';

const nodeTypes = { familyNode: FamilyNode };

function toRFCompatNode(n: RFNode): Node {
  return n as unknown as Node;
}

function toRFCompatEdge(e: RFEdge): Edge {
  return e as unknown as Edge;
}

interface Props {
  rfNodes: RFNode[];
  rfEdges: RFEdge[];
  onExploreLineage: (familyTreeId: string) => void;
  onEditPerson: (nodeId: string) => void;
  onSelectPerson: (nodeId: string) => void;
  onClearSelection: () => void;
}

export default function FamilyTreeCanvas({
  rfNodes,
  rfEdges,
  onExploreLineage,
  onEditPerson,
  onSelectPerson,
  onClearSelection,
}: Props) {
  const updateNodePosition = useFamilyStore((s) => s.updateNodePosition);
  const applyAutoLayout = useFamilyStore((s) => s.applyAutoLayout);
  const toggleCollapse = useFamilyStore((s) => s.toggleCollapse);
  const isLayouting = useFamilyStore((s) => s.loading);
  const { fitView } = useReactFlow();
  
  const [nodes, setNodes] = useNodesState(rfNodes.map(toRFCompatNode));
  const [edges, setEdges] = useEdgesState(rfEdges.map(toRFCompatEdge));
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  const handleAutoLayout = async () => {
    await applyAutoLayout();
    setTimeout(() => fitView({ duration: 800, padding: 0.2 }), 50);
  };

  useEffect(() => {
    setNodes(
      rfNodes.map((raw) => {
        const n = toRFCompatNode(raw);
        if (raw.type !== 'familyNode') {
          return n;
        }
        const id = raw.id;
        const base = raw.data as unknown as FamilyNodeData;
        return {
          ...n,
          data: {
            ...base,
            onToggleChildren: () => {
              toggleCollapse(id);
              setTimeout(() => fitView({ duration: 500, padding: 0.15 }), 50);
            },
          },
        };
      })
    );
  }, [rfNodes, setNodes, toggleCollapse, fitView]);

  useEffect(() => {
    setEdges(rfEdges.map(toRFCompatEdge));
  }, [rfEdges, setEdges]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
      changes.forEach((change) => {
        if (change.type === 'position' && change.position) {
          updateNodePosition(change.id, change.position);
        }
      });
    },
    [setNodes, updateNodePosition]
  );

  const onNodeContextMenu = useCallback((event: React.MouseEvent, node: Node) => {
    event.preventDefault();
    const nodeData = node.data as unknown as FamilyNodeData;
    setContextMenu({
      node: { id: node.id, data: nodeData, position: node.position },
      screenPosition: { x: event.clientX, y: event.clientY },
    });
  }, []);

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      if (node.type !== 'familyNode') {
        return;
      }
      onSelectPerson(node.id);
    },
    [onSelectPerson]
  );

  const onPaneClick = useCallback(() => {
    setContextMenu(null);
    onClearSelection();
  }, [onClearSelection]);

  return (
    <div className="relative h-full w-full">
      <div className="pointer-events-none absolute left-0 right-0 top-3 z-10 grid grid-cols-[1fr_minmax(0,auto)_1fr] items-start gap-3 px-4">
        <div aria-hidden className="min-w-0" />
        <div className="pointer-events-auto min-w-0 justify-self-center">
          <Legend />
        </div>
        <div className="pointer-events-auto justify-self-end pr-1 pt-0.5">
          <TreeLayoutControl />
        </div>
      </div>

      {/* Floating Action Bar */}
      <div className="absolute left-6 top-[4.25rem] z-10 flex flex-col gap-2">
        <button
          onClick={handleAutoLayout}
          disabled={isLayouting}
          className={`
            flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 
            bg-white/80 backdrop-blur-md shadow-sm text-slate-700 font-medium text-sm
            hover:bg-white hover:border-blue-300 hover:text-blue-600 transition-all
            active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          <Wand2 className={`w-4 h-4 ${isLayouting ? 'animate-pulse' : ''}`} />
          {isLayouting ? 'Arranging...' : 'Auto Arrange'}
        </button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onNodeClick={onNodeClick}
        onNodeContextMenu={onNodeContextMenu}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.1}
        maxZoom={4}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.5}
          color="#e2e8f0"
        />
        <MiniMap
          nodeColor={(node) => {
            const data = node.data as { isSpouse?: boolean; deathYear?: number };
            if (data?.isSpouse) return '#f59e0b';
            if (data?.deathYear) return '#94a3b8';
            return '#6366f1';
          }}
          maskColor="rgba(248,250,252,0.85)"
          className="!rounded-xl !border !border-slate-200 !shadow-sm"
        />
        <Controls className="!rounded-xl !border !border-slate-200 !shadow-sm !overflow-hidden" />
      </ReactFlow>

      {contextMenu && (
        <ContextMenu
          menu={contextMenu}
          onExplore={onExploreLineage}
          onEdit={onEditPerson}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}
