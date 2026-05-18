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
  return 'border-indigo-400';
}

function hoverEffectClass(gender: FamilyNode['gender']) {
  if (gender === 'F') return 'hover:border-pink-400';
  return 'hover:border-indigo-500';
}

const PLUS_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.75" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>`;
const MINUS_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.75" stroke-linecap="round"><path d="M5 12h14"/></svg>`;
const HEART_ICON_SIZE = 24;
const STACKED_ICON_SIZE = 22;
const STACKED_ICON_GAP = 5;
const HEART_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="${HEART_ICON_SIZE}" height="${HEART_ICON_SIZE}" viewBox="0 0 24 24" fill="#e11d48"><path d="M12 21s-6.716-4.35-9.193-8.155C.922 9.95 2.02 5.85 5.824 4.524c2.002-.699 4.286-.073 5.676 1.554 1.39-1.627 3.674-2.253 5.676-1.554 3.804 1.326 4.902 5.426 3.017 8.321C18.716 16.65 12 21 12 21z"/></svg>`;
const CARET_DOWN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="${STACKED_ICON_SIZE}" height="${STACKED_ICON_SIZE}" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`;

const TRANSITION_MS = 450;
const TRANSITION_EASE = d3.easeCubicInOut;

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
  const gRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);
  const isFirstRenderRef = useRef(true);
  const onToggleCollapseRef = useRef(onToggleCollapse);
  const onSelectPersonRef = useRef(onSelectPerson);
  const onClearSelectionRef = useRef(onClearSelection);
  useEffect(() => {
    onToggleCollapseRef.current = onToggleCollapse;
    onSelectPersonRef.current = onSelectPerson;
    onClearSelectionRef.current = onClearSelection;
  });
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

  const fitToView = useCallback((animate = true) => {
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

    const transform = d3.zoomIdentity.translate(tx, ty).scale(scale);
    if(animate) {
      svg.transition().duration(TRANSITION_MS).ease(TRANSITION_EASE).call(zoomRef.current.transform, transform);
    } else {
      svg.call(zoomRef.current.transform, transform);
    }
  }, [layout]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || !layout) return;

    const svg = d3.select(svgRef.current);
    const isFirst = isFirstRenderRef.current;
    
    if(!gRef.current) {
      svg.selectAll('*').remove();
      const g = svg.append('g').attr('class', 'tree-root');
      gRef.current = g;

      const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.15, 2.5])
      .on('zoom', (event) => {
        gRef.current?.attr('transform', event.transform);
      });

      zoomRef.current = zoom;
      svg.call(zoom).on('click', () => onClearSelection());
    }

    const g = gRef.current;

    const layoutNodeById = new Map(layout.nodes.map((node) => [node.id, node]));
    
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

    // -- Child links --
    const childLinkJoin = g
      .selectAll<SVGPathElement, (typeof layout.childLines)[number]>('.child-link')
      .data(layout.childLines, (d) => d.id);

    childLinkJoin.exit()
      .transition().duration(TRANSITION_MS).ease(TRANSITION_EASE)
      .style('opacity', 0)
      .remove();  

    const childLinkEnter = childLinkJoin.enter()
      .append('path')
      .attr('class', 'child-link')
      .attr('d', (d) => d.path)
      .attr('fill', 'none')
      .attr('stroke', '#a1a1aa')
      .attr('stroke-width', 1.75)
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round')
      .style('opacity', isFirst ? 1 : 0);

    if(!isFirst) {
      childLinkEnter.transition().duration(TRANSITION_MS).ease(TRANSITION_EASE).style('opacity', 1);
      childLinkJoin.transition().duration(TRANSITION_MS).ease(TRANSITION_EASE).attr('d', (d) => d.path);
    }

    // -- Spouse links --
    const spouseLinkJoin = g
      .selectAll<SVGLineElement, (typeof layout.spouseLines)[number]>('.spouse-link')
      .data(layout.spouseLines, (d) => d.id);

    spouseLinkJoin.exit()
      .transition().duration(TRANSITION_MS).ease(TRANSITION_EASE)
      .style('opacity', 0)
      .remove();  

    const spouseLinkEnter = spouseLinkJoin.enter()
      .append('line')
      .attr('class', 'spouse-link')
      .attr('x1', (d) => d.x1)
      .attr('y1', (d) => d.y1)
      .attr('x2', (d) => d.x2)
      .attr('y2', (d) => d.y2)
      .attr('stroke', '#a1a1aa')
      .attr('stroke-width', 1.75)
      .attr('stroke-linecap', 'round')
      .style('opacity', isFirst ? 1 : 0);

    if(!isFirst) {
      spouseLinkEnter.transition().duration(TRANSITION_MS).ease(TRANSITION_EASE).style('opacity', 1);
      spouseLinkJoin.transition().duration(TRANSITION_MS).ease(TRANSITION_EASE)
      .attr('x1', (d) => d.x1)
      .attr('y1', (d) => d.y1)
      .attr('x2', (d) => d.x2)
      .attr('y2', (d) => d.y2);
    }

    // union heart
    const heartJoin = g
      .selectAll<SVGGElement, (typeof layout.spouseLines)[number]>('.union-heart')
      .data(layout.spouseLines, (d) => d.id);
    
    heartJoin.exit()
      .transition().duration(TRANSITION_MS).ease(TRANSITION_EASE)
      .style('opacity', 0)
      .remove();  

    const heartEnter = heartJoin.enter()
      .append('g')
      .attr('class', 'union-heart')
      .attr('transform', (d) => `translate(${d.midX - HEART_ICON_SIZE / 2}, ${d.midY - HEART_ICON_SIZE / 2})`)
      .style('opacity', isFirst ? 1 : 0);

    heartEnter
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

    if(!isFirst) {
      heartEnter.transition().duration(TRANSITION_MS).ease(TRANSITION_EASE).style('opacity', 1);
      heartJoin.transition().duration(TRANSITION_MS).ease(TRANSITION_EASE)
        .attr('transform', (d) => `translate(${d.midX - HEART_ICON_SIZE / 2},${d.midY - HEART_ICON_SIZE / 2})`);
    } 
  
    // --- Union caret controls ---
    const watchJoin = g
      .selectAll<SVGGElement, (typeof spouseLineControls)[number]>('.union-watch')
      .data(spouseLineControls, (d) => d.id);
    
    watchJoin.exit()
      .transition().duration(TRANSITION_MS).ease(TRANSITION_EASE)
      .style('opacity', 0)
      .remove(); 
      
    const watchEnter = watchJoin.enter()
      .append('g')
      .attr('class', 'union-watch')
      .attr(
        'transform',
        (d) => `translate(${d.midX - STACKED_ICON_SIZE / 2},${d.midY + HEART_ICON_SIZE / 2 + STACKED_ICON_GAP})`
      )
      .style('opacity', isFirst ? 1 :0 );

    watchEnter
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
        onToggleCollapseRef.current(d.toggleTargetId);
      })
      .on('keydown', (event: KeyboardEvent, d) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        event.stopPropagation();
        onToggleCollapseRef.current(d.toggleTargetId);
      })
      .html(CARET_DOWN_SVG);

    if(!isFirst) {
      watchEnter.transition().duration(TRANSITION_MS).ease(TRANSITION_EASE).style('opacity', 1);
      watchJoin.transition().duration(TRANSITION_MS).ease(TRANSITION_EASE)
        .attr('transform', (d) => `translate(${d.midX - STACKED_ICON_SIZE / 2}, ${d.midY + HEART_ICON_SIZE / 2 + STACKED_ICON_GAP})`)   
    } 
    
    // --- Person nodes ---
    const nodeJoin = g
      .selectAll<SVGGElement, LayoutNode>('.person-node')
      .data(layout.nodes, (d) => d.id);

    nodeJoin.exit()
      .transition().duration(TRANSITION_MS).ease(TRANSITION_EASE)
      .style('opacity', 0)
      .remove();

    if(!isFirst) {
      nodeJoin.transition().duration(TRANSITION_MS).ease(TRANSITION_EASE)
        .attr('transform', (d) => `translate(${d.x}, ${d.y})`);
    }  

    const nodeEnter = nodeJoin.enter()
       .append('g')
       .attr('class', 'person-node')
       .attr('transform', (d) => `translate(${d.x}, ${d.y})`)
       .style('opacity', isFirst ? 1 : 0);

    if(!isFirst) {
      nodeEnter.transition().duration(TRANSITION_MS).ease(TRANSITION_EASE).style('opacity', 1);
    }
       
    nodeEnter.each(function (d) {
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
        .attr('data-node-id', d.id)
        .attr(
          'class',
          `person-card rounded-[10px] border-[2px] bg-white shadow-[0_8px_22px_rgba(148,163,184,0.16)] cursor-pointer ${hoverEffectClass(d.person.node.gender)} ${borderClass(d.person.node.gender)}`
        )
        .style('width', `${CARD_WIDTH}px`)
        .style('height', `${CARD_HEIGHT}px`)
        .style('box-sizing', 'border-box')
        .style('position', 'relative')
        .on('click', (event: MouseEvent) => {
          event.stopPropagation();
          onSelectPersonRef.current(d.id);
        });

      const body = card
        .append('xhtml:div')
        .attr('class', 'flex h-full flex-col items-center justify-center');

      body
        .append('xhtml:div')
        .attr('class', 'max-w-full text-center text-[12px] leading-tight text-slate-900')
        .text(d.person.node.name);

      body
        .append('xhtml:div')
        .attr('class', 'mt-2 text-center text-[11px] capitalize text-slate-500')
        .text(genderLabel(d.person.node.gender));
    });

    if(isFirst) {
      fitToView(false);
    } else {
      fitToView(true);
    }

     isFirstRenderRef.current = false;
  }, [layout, fitToView]);

  useEffect(() => {
    if(!gRef.current) return;
    const g = gRef.current;
    g.selectAll<HTMLDivElement, unknown>('.person-card').each(function () {
      const el = d3.select(this);
      const nodeId = el.attr('data-node-id');
      if(nodeId === selectedPersonId) {
        el.classed('ring-2', true).classed('ring-indigo-400', true).classed('ring-offset-2', true);
      } else {
        el.classed('ring-2', false).classed('ring-indigo-400', false).classed('ring-offset-2', false);
      }
    })
  }, [selectedPersonId])

  useEffect(() => {
    const onResize = () => fitToView();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [fitToView]);

  const handleZoomIn = useCallback(() => {
    if(!svgRef.current || !zoomRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().duration(300).ease(TRANSITION_EASE).call(zoomRef.current.scaleBy, 1.4);
  }, []);

  const handleZoomOut = useCallback(() => {
    if(!svgRef.current || !zoomRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().duration(300).ease(TRANSITION_EASE).call(zoomRef.current.scaleBy, 1 / 1.4);
  }, []);

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden bg-slate-50/80">
      <div className="pointer-events-none absolute left-0 right-0 top-3 z-10 flex justify-end px-4 md:px-6">
        <div className="pointer-events-auto">
          <TreeLayoutControl />
        </div>
      </div>
      <svg ref={svgRef} className="h-full w-full touch-none" />
      <div className="absolute bottom-4 left-4 z-10 flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <button 
          type="button" 
          onClick={handleZoomIn} 
          className="flex h-7 w-7 items-center justify-center border-b border-slate-200 text-slate-600 transition-colors hover:bg-slate-50" 
          title="Zoom In" 
          aria-label="Zoom In"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="10" height="10"><path d="M32 18.133H18.133V32h-4.266V18.133H0v-4.266h13.867V0h4.266v13.867H32z"></path></svg>
        </button>
        <button 
         type="button" 
         onClick={handleZoomOut} 
         className="flex h-7 w-7 items-center justify-center border-b text-slate-600 transition-colors hover:bg-slate-50" 
         title="Zoom Out" 
         aria-label="Zoom Out"
         >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 5"  width="10" height="10"><path d="M0 0h32v4.2H0z"></path></svg>
        </button>
      </div>
    </div>
  );
}
