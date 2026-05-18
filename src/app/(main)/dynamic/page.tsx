'use client';

import { useEffect, useState } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import FamilyTreeCanvas from '@/components/FamilyTreeCanvas';
import PersonDetailDrawer from '@/components/PersonDetailDrawer';
import { useFamilyStore } from '@/store/familyStore';
import { FamilyNode } from '@/types/family';

export default function DynamicTreePage() {
  const { nodes, edges, loadSampleData, exploreLineage } = useFamilyStore();

  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);

  const selectedPerson: FamilyNode | null =
    selectedPersonId === null ? null : (nodes.find((n) => n.id === selectedPersonId) ?? null);

  useEffect(() => {
    loadSampleData();
  }, [loadSampleData]);

  const handleExploreLineage = (familyTreeId: string) => {
    exploreLineage(familyTreeId);
  };

  const resolveName = (id: string) => nodes.find((n) => n.id === id)?.name;

  return (
    <>
      <div className="flex h-full min-h-0 flex-1 overflow-hidden">
        <main className="relative min-h-0 min-w-0 flex-1 bg-slate-50/50">
          <ReactFlowProvider>
            <FamilyTreeCanvas
              rfNodes={nodes.map((node) => ({
                ...node,
                type: 'familyNode',
                data: node,
              }))}
              rfEdges={edges}
              onExploreLineage={handleExploreLineage}
              onEditPerson={(nodeId) => console.log('Edit clicked for:', nodeId)}
              onSelectPerson={(id) => setSelectedPersonId(id)}
              onClearSelection={() => setSelectedPersonId(null)}
            />
          </ReactFlowProvider>
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
