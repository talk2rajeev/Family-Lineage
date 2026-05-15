'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import CleanStaticTreeCanvas from '@/components/static-tree/CleanStaticTreeCanvas';
import PersonDetailDrawer from '@/components/PersonDetailDrawer';
import { sampleTrees } from '@/data/sampleData';
import { getInitialCollapsedIds } from '@/lib/staticTree/buildVisibleModel';
import type { FamilyNode } from '@/types/family';

const STATIC_TREE_ID = 'bachchan';

export default function CleanStaticTreePage() {
  const tree = sampleTrees[STATIC_TREE_ID];
  const [collapsedNodeIds, setCollapsedNodeIds] = useState<string[]>([]);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);

  useEffect(() => {
    setCollapsedNodeIds(getInitialCollapsedIds(tree));
  }, [tree]);

  const nodeById = useMemo(() => new Map(tree.nodes.map((n) => [n.id, n])), [tree.nodes]);

  const selectedPerson: FamilyNode | null =
    selectedPersonId === null ? null : (nodeById.get(selectedPersonId) ?? null);

  useEffect(() => {
    if (selectedPersonId !== null && !nodeById.has(selectedPersonId)) {
      setSelectedPersonId(null);
    }
  }, [nodeById, selectedPersonId]);

  const handleToggleCollapse = useCallback((nodeId: string) => {
    const effectiveNodeId = nodeById.get(nodeId)?.spouseOf ?? nodeId;

    setCollapsedNodeIds((prev) =>
      prev.includes(effectiveNodeId)
        ? prev.filter((id) => id !== effectiveNodeId)
        : [...prev, effectiveNodeId]
    );
  }, [nodeById]);

  const resolveName = useCallback((id: string) => nodeById.get(id)?.name, [nodeById]);

  return (
    <>
      <div className="flex h-full min-h-0 flex-1 overflow-hidden">
        <main className="relative min-h-0 min-w-0 flex-1">
          <CleanStaticTreeCanvas
            tree={tree}
            collapsedNodeIds={collapsedNodeIds}
            onToggleCollapse={handleToggleCollapse}
            selectedPersonId={selectedPersonId}
            onSelectPerson={setSelectedPersonId}
            onClearSelection={() => setSelectedPersonId(null)}
          />
        </main>
      </div>

      <PersonDetailDrawer
        person={selectedPerson}
        onClose={() => setSelectedPersonId(null)}
        resolveName={resolveName}
      />
    </>
  );
}
