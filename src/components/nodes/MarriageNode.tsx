'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';

type MarriageData = { kind: 'marriage'; childCount?: number };

function MarriageNode({ selected, data }: NodeProps) {
  const marriageData = data as MarriageData | undefined;
  const count = typeof marriageData?.childCount === 'number' ? marriageData.childCount : 0;

  return (
    <div
      className={`
        relative flex h-[26px] w-[108px] items-center justify-center rounded-full border border-slate-900 bg-white px-2 text-[10px] font-semibold text-slate-800 shadow-sm
        ${selected ? 'ring-2 ring-slate-400 ring-offset-2' : ''}
      `}
    >
      <span className="whitespace-nowrap">Married to</span>
      {count > 0 && (
        <span className="ml-1 tabular-nums text-slate-500">({count})</span>
      )}

      <Handle
        type="target"
        position={Position.Left}
        id="partner-left"
        className="!left-0 !top-1/2 !h-1.5 !w-1.5 !-translate-y-1/2 !border-slate-900 !bg-white !opacity-0"
      />
      <Handle
        type="target"
        position={Position.Right}
        id="partner-right"
        className="!right-0 !top-1/2 !h-1.5 !w-1.5 !-translate-y-1/2 !border-slate-900 !bg-white !opacity-0"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="child"
        className="!bottom-0 !left-1/2 !h-1.5 !w-1.5 !-translate-x-1/2 !border-slate-900 !bg-white !opacity-0"
      />
    </div>
  );
}

export default memo(MarriageNode);
