'use client';

import { TreePine, Search, UserPlus, Share2, Info } from 'lucide-react';

interface Props {
  currentTreeName?: string;
  memberCount?: number;
}

export default function Header({ currentTreeName, memberCount }: Props) {
  return (
    <header className="flex-shrink-0 h-16 bg-white border-b border-slate-100 shadow-sm flex items-center justify-between px-6 z-10">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-sm">
          <TreePine className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent tracking-tight">
            Lineage
          </span>
          <span className="ml-2 text-xs font-medium text-slate-400 hidden sm:inline">
            Family Tree Explorer
          </span>
        </div>
      </div>

      {/* Active tree info */}
      {currentTreeName && (
        <div className="hidden md:flex items-center gap-2 bg-slate-50 rounded-xl px-4 py-2 border border-slate-100">
          <div className="w-2 h-2 rounded-full bg-indigo-400" />
          <span className="text-sm font-semibold text-slate-700">{currentTreeName}</span>
          {memberCount !== undefined && (
            <span className="text-xs text-slate-400">{memberCount} members</span>
          )}
        </div>
      )}

      {/* Action buttons (future) */}
      <div className="flex items-center gap-2">
        <button
          title="Search (coming soon)"
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <Search className="w-[18px] h-[18px]" />
        </button>
        <button
          title="Add person (coming soon)"
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <UserPlus className="w-[18px] h-[18px]" />
        </button>
        <button
          title="Share (coming soon)"
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <Share2 className="w-[18px] h-[18px]" />
        </button>
        <div className="w-px h-5 bg-slate-200 mx-1" />
        <button
          title="About"
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <Info className="w-[18px] h-[18px]" />
        </button>
      </div>
    </header>
  );
}
