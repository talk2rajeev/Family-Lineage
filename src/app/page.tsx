'use client';

import { useEffect, useState } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import FamilyTreeCanvas from '@/components/FamilyTreeCanvas';
import AuthModal from '@/components/AuthModal';
import { useFamilyStore } from '@/store/familyStore';
import { LogIn, UserCircle } from 'lucide-react';

export default function Home() {
  const { 
    nodes, 
    edges, 
    loadSampleData, 
    exploreLineage 
  } = useFamilyStore();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    loadSampleData();
  }, [loadSampleData]);

  const handleExploreLineage = (familyTreeId: string) => {
    exploreLineage(familyTreeId);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm z-10 font-sans">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-blue-200">L</div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Lineage</h1>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold transition-all shadow-md shadow-blue-100 active:scale-95"
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 border-r bg-white p-6 overflow-y-auto hidden md:block">
          <h3 className="uppercase text-xs tracking-widest text-gray-400 mb-6 font-bold">YOUR FAMILY TREES</h3>
          
          <div className="space-y-3">
            <button className="w-full text-left p-4 rounded-2xl bg-blue-50 border border-blue-100 shadow-sm transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 group-hover:animate-pulse" />
                <span className="font-bold text-gray-800">Sharma Family Tree</span>
              </div>
              <p className="text-xs text-blue-600 mt-1 font-medium">Sample Tree Loaded</p>
            </button>
          </div>

          <div className="mt-10 pt-10 border-t border-gray-100">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center">
                <UserCircle className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Sign in to save</p>
                <p className="text-xs text-gray-500 mt-1">Your changes will be synced to the cloud.</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Canvas */}
        <main className="flex-1 relative bg-slate-50/50">
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
            />
          </ReactFlowProvider>
        </main>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </div>
  );
}
