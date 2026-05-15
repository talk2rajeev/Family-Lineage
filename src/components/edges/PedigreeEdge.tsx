'use client';

import { BaseEdge, EdgeProps } from '@xyflow/react';

const PEDIGREE_BRANCH_DROP = 64;

export default function PedigreeEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style,
}: EdgeProps) {
  const branchY = Math.min(sourceY + PEDIGREE_BRANCH_DROP, targetY - 18);
  const path = [
    `M ${sourceX} ${sourceY}`,
    `L ${sourceX} ${branchY}`,
    `L ${targetX} ${branchY}`,
    `L ${targetX} ${targetY}`,
  ].join(' ');

  return <BaseEdge id={id} path={path} style={style} />;
}
