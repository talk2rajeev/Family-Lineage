'use client';

import { FamilyTree } from '@/types/family';
import {
  Users,
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react';

interface Props {
  trees: Record<string, FamilyTree>;
  currentTreeId: string | null;
  isOpen: boolean;
  onToggle: () => void;
  onSelectTree: (id: string) => void;
}

const TREE_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  sharma:  { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400' },
};

function getTreeColor(id: string) {
  return TREE_COLORS[id] ?? { bg: 'bg-slate-50', text: 'text-slate-600', dot: 'bg-slate-400' };
}

export default function Sidebar({
  trees,
  currentTreeId,
  isOpen,
  onToggle,
  onSelectTree,
}: Props) {
  return (
    <aside
      className={`
        relative flex-shrink-0 h-full bg-white border-l border-slate-100 flex flex-col
        transition-all duration-300 ease-in-out
        ${isOpen ? 'w-72' : 'w-12'}
      `}
    >
      {/* Collapse / Expand toggle button */}
      <button
        onClick={onToggle}
        title={isOpen ? 'Collapse panel' : 'Expand panel'}
        className="absolute -left-3.5 top-6 z-10 w-7 h-7 rounded-full bg-white border border-slate-200 shadow-sm
          flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-300
          transition-colors"
      >
        {isOpen
          ? <PanelRightOpen className="w-3.5 h-3.5" />
          : <PanelRightClose className="w-3.5 h-3.5" />
        }
      </button>

      {/* Collapsed state — just show a vertical label */}
      {!isOpen && (
        <div className="flex-1 flex items-center justify-center">
          <span
            className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 select-none"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            Family Trees
          </span>
        </div>
      )}

      {/* Expanded content */}
      {isOpen && (
        <>
          {/* Tree list */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 scrollbar-thin">
            <div className="flex items-center gap-2 mb-3 px-1">
              <Users className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Family Trees</span>
            </div>

            {Object.values(trees).map((tree) => {
              const isActive = tree.id === currentTreeId;
              const color = getTreeColor(tree.id);

              return (
                <button
                  key={tree.id}
                  onClick={() => onSelectTree(tree.id)}
                  className={`
                    w-full text-left rounded-xl px-4 py-3.5
                    border transition-all duration-150
                    flex items-center gap-3
                    ${isActive
                      ? `${color.bg} border-transparent shadow-sm`
                      : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                    }
                  `}
                >
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${color.dot}`} />
                  <div className="flex-1 min-w-0">
                    <div className={`font-semibold text-sm ${isActive ? color.text : 'text-slate-700'}`}>
                      {tree.name}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {tree.nodes.filter((n) => !n.isSpouse).length} blood relatives · {tree.nodes.filter((n) => n.isSpouse).length} spouses
                    </div>
                  </div>
                  {isActive && (
                    <div className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${color.bg} ${color.text} border border-current/20`}>
                      Active
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </aside>
  );
}
