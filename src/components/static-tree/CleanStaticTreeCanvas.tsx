'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { FamilyNode, FamilyTree } from '@/types/family';
import { buildVisibleModel } from '@/lib/staticTree/buildVisibleModel';
import { layoutStaticTree, type LayoutNode } from '@/lib/staticTree/elkLayout';
import { CARD_WIDTH, CARD_HEIGHT, CARD_BOTTOM_PAD } from '@/lib/staticTree/constants';
import TreeLayoutControl from '@/components/TreeLayoutControl';

interface Props {
  tree: FamilyTree;
  collapsedNodeIds: string[];
  onToggleCollapse: (nodeId: string) => void;
  selectedPersonId: string | null;
  onSelectPerson: (nodeId: string) => void;
  onClearSelection: () => void;
}

function genderLabel(gender: FamilyNode['gender']) {
  if (gender === 'M') return 'male';
  if (gender === 'F') return 'female';
  return 'other';
}

function borderClass(gender: FamilyNode['gender']) {
  if (gender === 'F') return 'border-pink-300';
  return 'border-sky-300';
}

const PLUS_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.75" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>`;
const MINUS_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.75" stroke-linecap="round"><path d="M5 12h14"/></svg>`;
const HEART_ICON_SIZE = 24;
const STACKED_ICON_SIZE = 22;
const STACKED_ICON_GAP = 5;
const HEART_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="${HEART_ICON_SIZE}" height="${HEART_ICON_SIZE}" viewBox="0 0 24 24" fill="#e11d48"><path d="M12 21s-6.716-4.35-9.193-8.155C.922 9.95 2.02 5.85 5.824 4.524c2.002-.699 4.286-.073 5.676 1.554 1.39-1.627 3.674-2.253 5.676-1.554 3.804 1.326 4.902 5.426 3.017 8.321C18.716 16.65 12 21 12 21z"/></svg>`;
const CARET_DOWN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="${STACKED_ICON_SIZE}" height="${STACKED_ICON_SIZE}" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`;

export default function CleanStaticTreeCanvas({
  tree,
  collapsedNodeIds,
  onToggleCollapse,
  selectedPersonId,
  onSelectPerson,
  onClearSelection,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const [layout, setLayout] = useState<{
    nodes: LayoutNode[];
    spouseLines: { id: string; x1: number; y1: number; x2: number; y2: number; midX: number; midY: number; childStartX: number; childStartY: number; hasChildBranch: boolean }[];
    childLines: { id: string; path: string }[];
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const model = buildVisibleModel(tree, collapsedNodeIds);
    layoutStaticTree(model.people, model.spousePairs, model.parentChildLinks).then((result) => {
      if (!cancelled) setLayout(result);
    });
    return () => {
      cancelled = true;
    };
  }, [tree, collapsedNodeIds]);

  const fitToView = useCallback(() => {
    if (!svgRef.current || !containerRef.current || !layout?.nodes.length || !zoomRef.current) return;
    const svg = d3.select(svgRef.current);
    const g = svg.select<SVGGElement>('g.tree-root');
    const bounds = g.node()?.getBBox();
    if (!bounds || bounds.width === 0) return;

    const { width, height } = containerRef.current.getBoundingClientRect();
    const pad = 48;
    const scale = Math.min(
      (width - pad * 2) / bounds.width,
      (height - pad * 2) / bounds.height,
      1.2
    );
    const tx = width / 2 - scale * (bounds.x + bounds.width / 2);
    const ty = pad - scale * bounds.y;

    svg
      .transition()
      .duration(500)
      .call(zoomRef.current.transform, d3.zoomIdentity.translate(tx, ty).scale(scale));
  }, [layout]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || !layout) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg.append('g').attr('class', 'tree-root');
    const layoutNodeById = new Map(layout.nodes.map((node) => [node.id, node]));
    const spouseJoinByNodeId = new Map<
      string,
      { midX: number; midY: number; childStartX: number; childStartY: number; toggleOwnerId: string; toggleTargetId: string; hasChildBranch: boolean }
    >();
    layout.spouseLines.forEach((line) => {
      const [a, b] = line.id.split('::');
      const nodeA = layoutNodeById.get(a);
      const nodeB = layoutNodeById.get(b);
      const bloodRelativeNode =
        nodeA && !nodeA.person.node.isSpouse
          ? nodeA
          : nodeB && !nodeB.person.node.isSpouse
            ? nodeB
            : nodeA;
      const wifeNode =
        nodeA?.person.node.gender === 'F' ? nodeA : nodeB?.person.node.gender === 'F' ? nodeB : nodeA;
      const toggleTargetNode =
        nodeA?.person.hasChildren
          ? nodeA
          : nodeB?.person.hasChildren
            ? nodeB
            : bloodRelativeNode ?? wifeNode ?? nodeA;

      spouseJoinByNodeId.set(a, {
        midX: line.midX,
        midY: line.midY,
        childStartX: line.childStartX,
        childStartY: line.childStartY,
        toggleOwnerId: wifeNode?.id ?? bloodRelativeNode?.id ?? a,
        toggleTargetId: toggleTargetNode?.id ?? a,
        hasChildBranch: line.hasChildBranch,
      });
      spouseJoinByNodeId.set(b, {
        midX: line.midX,
        midY: line.midY,
        childStartX: line.childStartX,
        childStartY: line.childStartY,
        toggleOwnerId: wifeNode?.id ?? bloodRelativeNode?.id ?? b,
        toggleTargetId: toggleTargetNode?.id ?? b,
        hasChildBranch: line.hasChildBranch,
      });
    });

    const spouseLineControls = layout.spouseLines.flatMap((line) => {
      const [a, b] = line.id.split('::');
      const nodeA = layoutNodeById.get(a);
      const nodeB = layoutNodeById.get(b);
      const bloodRelativeNode =
        nodeA && !nodeA.person.node.isSpouse
          ? nodeA
          : nodeB && !nodeB.person.node.isSpouse
            ? nodeB
            : nodeA;
      const toggleTargetNode =
        nodeA?.person.hasChildren
          ? nodeA
          : nodeB?.person.hasChildren
            ? nodeB
            : bloodRelativeNode ?? nodeA;

      if (!line.hasChildBranch || !toggleTargetNode) {
        return [];
      }

      return [
        {
          ...line,
          toggleTargetId: toggleTargetNode.id,
          isCollapsed: toggleTargetNode.person.isCollapsed,
        },
      ];
    });

    g.selectAll('.child-link')
      .data(layout.childLines)
      .join('path')
      .attr('class', 'child-link')
      .attr('d', (d) => d.path)
      .attr('fill', 'none')
      .attr('stroke', '#a1a1aa')
      .attr('stroke-width', 1.75)
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round');

    g.selectAll('.spouse-link')
      .data(layout.spouseLines)
      .join('line')
      .attr('class', 'spouse-link')
      .attr('x1', (d) => d.x1)
      .attr('y1', (d) => d.y1)
      .attr('x2', (d) => d.x2)
      .attr('y2', (d) => d.y2)
      .attr('stroke', '#a1a1aa')
      .attr('stroke-width', 1.75)
      .attr('stroke-linecap', 'round');

    const unionHeart = g.selectAll('.union-heart')
      .data(layout.spouseLines)
      .join('g')
      .attr('class', 'union-heart')
      .attr('transform', (d) => `translate(${d.midX - HEART_ICON_SIZE / 2},${d.midY - HEART_ICON_SIZE / 2})`);

    unionHeart
      .append('foreignObject')
      .attr('width', HEART_ICON_SIZE)
      .attr('height', HEART_ICON_SIZE)
      .attr('x', 0)
      .attr('y', 0)
      .append('xhtml:div')
      .attr('xmlns', 'http://www.w3.org/1999/xhtml')
      .style('width', `${HEART_ICON_SIZE}px`)
      .style('height', `${HEART_ICON_SIZE}px`)
      .style('display', 'flex')
      .style('align-items', 'center')
      .style('justify-content', 'center')
      .style('background', 'white')
      .style('border-radius', '9999px')
      .style('box-shadow', '0 1px 3px rgba(15, 23, 42, 0.15)')
      .html(HEART_SVG);

    const unionWatch = g.selectAll('.union-watch')
      .data(spouseLineControls)
      .join('g')
      .attr('class', 'union-watch')
      .attr(
        'transform',
        (d) =>
          `translate(${d.midX - STACKED_ICON_SIZE / 2},${d.midY + HEART_ICON_SIZE / 2 + STACKED_ICON_GAP})`
      );

    unionWatch
      .append('foreignObject')
      .attr('width', STACKED_ICON_SIZE)
      .attr('height', STACKED_ICON_SIZE)
      .attr('x', 0)
      .attr('y', 0)
      .append('xhtml:div')
      .attr('xmlns', 'http://www.w3.org/1999/xhtml')
      .style('width', `${STACKED_ICON_SIZE}px`)
      .style('height', `${STACKED_ICON_SIZE}px`)
      .style('display', 'flex')
      .style('align-items', 'center')
      .style('justify-content', 'center')
      .style('background', 'white')
      .style('border-radius', '9999px')
      .style('box-shadow', '0 1px 3px rgba(15, 23, 42, 0.12)')
      .style('cursor', 'pointer')
      .style('transition', 'transform 180ms ease, background-color 180ms ease')
      .attr('role', 'button')
      .attr('tabindex', '0')
      .attr('aria-label', (d) => (d.isCollapsed ? 'Expand children' : 'Collapse children'))
      .on('mouseenter', function () {
        d3.select(this)
          .style('background-color', '#eef2ff')
          .style('transform', 'scale(1.08)');
      })
      .on('mouseleave', function () {
        d3.select(this)
          .style('background-color', 'white')
          .style('transform', 'scale(1)');
      })
      .on('click', (event: MouseEvent, d) => {
        event.stopPropagation();
        onToggleCollapse(d.toggleTargetId);
      })
      .on('keydown', (event: KeyboardEvent, d) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        event.stopPropagation();
        onToggleCollapse(d.toggleTargetId);
      })
      .html(CARET_DOWN_SVG);

    const nodeGroups = g
      .selectAll<SVGGElement, LayoutNode>('.person-node')
      .data(layout.nodes, (d) => d.id)
      .join('g')
      .attr('class', 'person-node')
      .attr('transform', (d) => `translate(${d.x},${d.y})`);

    nodeGroups.each(function (d) {
      const group = d3.select(this);
      const fo = group
        .append('foreignObject')
        .attr('width', CARD_WIDTH)
        .attr('height', CARD_HEIGHT + CARD_BOTTOM_PAD)
        .attr('x', 0)
        .attr('y', 0);

      const wrapper = fo
        .append('xhtml:div')
        .attr('xmlns', 'http://www.w3.org/1999/xhtml')
        .style('width', `${CARD_WIDTH}px`)
        .style('height', `${CARD_HEIGHT + CARD_BOTTOM_PAD}px`)
        .style('position', 'relative')
        .style('overflow', 'visible');

      const card = wrapper
        .append('xhtml:div')
        .attr(
          'class',
          `rounded-[28px] border-[3px] bg-white shadow-[0_8px_22px_rgba(148,163,184,0.16)] cursor-pointer ${borderClass(d.person.node.gender)} ${
            selectedPersonId === d.id ? 'ring-2 ring-indigo-400 ring-offset-2' : ''
          }`
        )
        .style('width', `${CARD_WIDTH}px`)
        .style('height', `${CARD_HEIGHT}px`)
        .style('box-sizing', 'border-box')
        .style('position', 'relative')
        .on('click', (event: MouseEvent) => {
          event.stopPropagation();
          onSelectPerson(d.id);
        });

      const body = card
        .append('xhtml:div')
        .attr('class', 'flex h-full flex-col items-center justify-center p-2');

      body
        .append('xhtml:div')
        .attr('class', 'max-w-full text-center text-[14px] font-bold leading-tight text-slate-900')
        .text(d.person.node.name);

      body
        .append('xhtml:div')
        .attr('class', 'mt-3 text-center text-[14px] capitalize text-slate-500')
        .text(genderLabel(d.person.node.gender));

      const spouseJoin = spouseJoinByNodeId.get(d.id);
      const shouldRenderToggle = spouseJoin
        ? spouseJoin.hasChildBranch && spouseJoin.toggleOwnerId === d.id
        : d.person.hasChildren;
      const toggleStateNode = spouseJoin
        ? layoutNodeById.get(spouseJoin.toggleTargetId)
        : d;

      if (shouldRenderToggle) {
        const toggleButton = wrapper
          .append('xhtml:button')
          .attr('type', 'button')
          .attr(
            'class',
            `absolute z-10 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full border-2 shadow-sm transition-all duration-200 ease-out hover:scale-[1.11] hover:shadow-lg hover:shadow-indigo-500/35 ${
              toggleStateNode?.person.isCollapsed
                ? 'border-indigo-600 bg-indigo-600 text-white'
                : 'border-indigo-400 bg-white text-indigo-500 hover:bg-indigo-50'
            }`
          )
          .attr('aria-label', toggleStateNode?.person.isCollapsed ? 'Expand branch' : 'Collapse branch')
          .html(toggleStateNode?.person.isCollapsed ? PLUS_SVG : MINUS_SVG)
          .on('click', (event: MouseEvent) => {
            event.stopPropagation();
            onToggleCollapse(spouseJoin?.toggleTargetId ?? d.id);
          });

        if (spouseJoin) {
          toggleButton
            .style('left', '50%')
            .style('bottom', '0px');
        } else {
          toggleButton
            .attr('class', `${toggleButton.attr('class')} bottom-0 left-1/2 translate-y-1/2`);
        }
      }
    });

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.15, 2.5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    zoomRef.current = zoom;
    svg.call(zoom).on('click', () => onClearSelection());

    requestAnimationFrame(() => fitToView());
  }, [layout, selectedPersonId, onSelectPerson, onToggleCollapse, onClearSelection, fitToView]);

  useEffect(() => {
    const onResize = () => fitToView();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [fitToView]);

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden bg-slate-50/80">
      <div className="pointer-events-none absolute left-0 right-0 top-3 z-10 flex justify-end px-4 md:px-6">
        <div className="pointer-events-auto">
          <TreeLayoutControl />
        </div>
      </div>
      <svg ref={svgRef} className="h-full w-full touch-none" />
    </div>
  );
}
