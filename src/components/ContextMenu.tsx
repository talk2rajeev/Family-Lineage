'use client';

import { useEffect, useRef } from 'react';
import { ContextMenuState } from '@/types/family';
import {
  Search,
  Pencil,
  Baby,
  Heart,
  Trash2,
  UserCircle2,
  ChevronRight,
} from 'lucide-react';

interface Props {
  menu: ContextMenuState;
  onExplore: (familyTreeId: string) => void;
  onEdit: (nodeId: string) => void;
  onClose: () => void;
}

export default function ContextMenu({ menu, onExplore, onEdit, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { node, screenPosition } = menu;
  const data = node.data;

  // Close on outside click or Escape
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  // Nudge menu into viewport
  const menuWidth = 240;
  const menuHeight = 280;
  const x = Math.min(screenPosition.x, window.innerWidth - menuWidth - 8);
  const y = Math.min(screenPosition.y, window.innerHeight - menuHeight - 8);

  return (
    <div
      ref={ref}
      className="fixed z-50 w-60 rounded-2xl overflow-hidden shadow-2xl"
      style={{ top: y, left: x }}
    >
      {/* Glass header */}
      <div
        className={`px-4 py-3 flex items-center gap-3 ${
          data.isSpouse
            ? 'bg-amber-500'
            : 'bg-indigo-600'
        }`}
      >
        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
          <UserCircle2 className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0">
          <div className="text-white font-semibold text-sm truncate">{data.name}</div>
          {data.birthYear && (
            <div className="text-white/70 text-xs">
              {data.birthYear}
              {data.deathYear ? ` – ${data.deathYear}` : ''}
            </div>
          )}
        </div>
      </div>

      {/* Menu items */}
      <div className="bg-white/90 backdrop-blur-sm py-1">
        {/* Explore lineage — only for spouses with a known family tree */}
        {data.isSpouse && data.familyTreeId && (
          <>
            <button
              onClick={() => { onExplore(data.familyTreeId!); onClose(); }}
              className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-indigo-50 transition-colors text-left group"
            >
              <div className="w-7 h-7 rounded-lg bg-indigo-100 group-hover:bg-indigo-200 flex items-center justify-center flex-shrink-0 transition-colors">
                <Search className="w-3.5 h-3.5 text-indigo-600" />
              </div>
              <span className="text-sm font-medium text-slate-700 flex-1">Explore Family Lineage</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
            </button>
            <div className="mx-4 border-t border-slate-100 my-1" />
          </>
        )}

        <button
          onClick={() => { onEdit(node.id); onClose(); }}
          className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left group"
        >
          <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center flex-shrink-0 transition-colors">
            <Pencil className="w-3.5 h-3.5 text-slate-600" />
          </div>
          <span className="text-sm font-medium text-slate-700">Edit Person</span>
        </button>

        <button
          className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left group"
        >
          <div className="w-7 h-7 rounded-lg bg-green-100 group-hover:bg-green-200 flex items-center justify-center flex-shrink-0 transition-colors">
            <Baby className="w-3.5 h-3.5 text-green-600" />
          </div>
          <span className="text-sm font-medium text-slate-700">Add Child</span>
        </button>

        {!data.isSpouse && (
          <button
            className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left group"
          >
            <div className="w-7 h-7 rounded-lg bg-amber-100 group-hover:bg-amber-200 flex items-center justify-center flex-shrink-0 transition-colors">
              <Heart className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <span className="text-sm font-medium text-slate-700">
              {data.gender === 'M' ? 'Add Wife' : data.gender === 'F' ? 'Add Husband' : 'Add Spouse'}
            </span>
          </button>
        )}

        {data.isSpouse && (
          <>
            <div className="mx-4 border-t border-slate-100 my-1" />
            <button
              className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-red-50 transition-colors text-left group"
            >
              <div className="w-7 h-7 rounded-lg bg-red-100 group-hover:bg-red-200 flex items-center justify-center flex-shrink-0 transition-colors">
                <Trash2 className="w-3.5 h-3.5 text-red-600" />
              </div>
              <span className="text-sm font-medium text-red-600">
                {data.gender === 'M' ? 'Remove Husband' : data.gender === 'F' ? 'Remove Wife' : 'Remove Spouse'}
              </span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
