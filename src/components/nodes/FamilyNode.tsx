'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { FamilyNode as FamilyNodeData } from '@/types/family';
import { Heart, Skull, Plus, Minus } from 'lucide-react';

type FamilyNodeProps = NodeProps & {
  data: FamilyNodeData & {
    isCollapsed?: boolean;
    hasChildren?: boolean;
    onToggleChildren?: () => void;
  };
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarClasses(gender: FamilyNodeData['gender'], isDeceased: boolean) {
  if (isDeceased) {
    return 'bg-slate-100 border-slate-300 text-slate-500';
  }

  return gender === 'F'
    ? 'bg-pink-100 border-pink-300 text-pink-700'
    : 'bg-indigo-100 border-indigo-300 text-indigo-700';
}

function renderYears(birthYear?: number, deathYear?: number) {
  if (birthYear && deathYear) {
    return `${birthYear}–${deathYear}`;
  }

  if (birthYear) {
    return `b. ${birthYear}`;
  }

  return null;
}

function FamilyNode({ data, selected }: FamilyNodeProps) {
  const isDeceased = Boolean(data.deathYear);
  const { isCollapsed, hasChildren } = data;
  const spouse = data.spouse;
  const spouseIsDeceased = Boolean(spouse?.deathYear);

  return (
    <div
      className={`
        family-node group flex min-w-[170px] max-w-[200px] flex-col
        ${hasChildren ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'}
      `}
    >
      <div
        className={`
          relative
          rounded-xl
          border-[1.5px]
          transition-all duration-200
          hover:-translate-y-0.5
          ${selected ? 'ring-2 ring-offset-2' : ''}
          ${isDeceased
            ? 'bg-slate-50 border-slate-300 shadow-slate-100 hover:shadow-slate-200 shadow-sm hover:shadow-md ' + (selected ? 'ring-slate-400' : '')
            : 'bg-white border-indigo-400 shadow-indigo-100 hover:shadow-indigo-200 shadow-sm hover:shadow-md ' + (selected ? 'ring-indigo-400' : '')
          }
        `}
      >
        {/* Deceased overlay */}
        {isDeceased && (
          <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-500 flex items-center justify-center shadow-sm z-10">
            <Skull className="w-2.5 h-2.5 text-white" />
          </div>
        )}

        {/* Collapse/Expand toggle — centered on bottom border */}
        {hasChildren && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              data.onToggleChildren?.();
            }}
            className={`absolute bottom-0 left-1/2 z-10 flex h-7 w-7 origin-center -translate-x-1/2 translate-y-1/2 items-center justify-center rounded-full border-2 shadow-sm transition-all duration-200 ease-out hover:scale-[1.11] hover:shadow-lg hover:shadow-indigo-500/35
              ${isCollapsed
                ? 'border-indigo-600 bg-indigo-600 text-white'
                : 'border-indigo-400 bg-white text-indigo-500 hover:bg-indigo-50'
              }`}
            aria-label={isCollapsed ? 'Expand branch' : 'Collapse branch'}
          >
            {isCollapsed ? <Plus className="h-4 w-4" strokeWidth={2.75} /> : <Minus className="h-4 w-4" strokeWidth={2.75} />}
          </button>
        )}

        {spouse && (
          <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center shadow-sm z-10">
            <Heart className="w-2.5 h-2.5 text-white" fill="white" />
          </div>
        )}

        <div className="p-2.5">
        {/* Avatar */}
        <div className="flex items-center gap-2.5">
          <div
            className={`
              w-9 h-9 rounded-full flex-shrink-0
              flex items-center justify-center
              text-xs font-bold tracking-wide
              border-[1.5px]
              ${getAvatarClasses(data.gender, isDeceased)}
            `}
          >
            {data.photoUrl ? (
              <img
                src={data.photoUrl}
                alt={data.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              getInitials(data.name)
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className={`font-semibold text-[13px] leading-tight truncate ${isDeceased ? 'text-slate-500' : 'text-slate-800'}`}>
              {data.name}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              {renderYears(data.birthYear, data.deathYear) && (
                <span className="text-[10px] text-slate-400 whitespace-nowrap">
                  {renderYears(data.birthYear, data.deathYear)}
                </span>
              )}
              {data.role && (
                <span className="text-[9px] font-bold uppercase tracking-tighter text-indigo-500 truncate">
                  {data.role}
                </span>
              )}
            </div>
          </div>
        </div>

        {spouse && (
          <div className="mt-2.5 border-t border-amber-100 pt-2.5">
            <div className="mb-1.5 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-amber-600">
              <Heart className="h-2.5 w-2.5" fill="currentColor" />
              Married to
            </div>
            <div className="flex items-center gap-2.5 rounded-lg bg-amber-50/80 px-2 py-2">
              <div
                className={`
                  w-8 h-8 rounded-full flex-shrink-0
                  flex items-center justify-center
                  text-[10px] font-bold tracking-wide
                  border-[1.5px]
                  ${getAvatarClasses(spouse.gender, spouseIsDeceased)}
                `}
              >
                {spouse.photoUrl ? (
                  <img
                    src={spouse.photoUrl}
                    alt={spouse.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  getInitials(spouse.name)
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className={`truncate text-[12px] font-semibold leading-tight ${spouseIsDeceased ? 'text-slate-500' : 'text-slate-700'}`}>
                  {spouse.name}
                </div>
                <div className="mt-0.5 flex items-center gap-1.5">
                  {renderYears(spouse.birthYear, spouse.deathYear) && (
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">
                      {renderYears(spouse.birthYear, spouse.deathYear)}
                    </span>
                  )}
                  {spouse.role && (
                    <span className="truncate text-[9px] font-bold uppercase tracking-tighter text-amber-600">
                      {spouse.role}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2 !h-2 !bg-slate-300 !border-slate-400"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="child"
        className="!w-2 !h-2 !bg-indigo-400 !border-indigo-500"
      />
      </div>

      {hasChildren ? <div className="h-[15px] w-full shrink-0" aria-hidden /> : null}
    </div>
  );
}

export default memo(FamilyNode);
