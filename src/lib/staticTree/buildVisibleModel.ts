import type { FamilyEdge, FamilyNode, FamilyTree } from '@/types/family';
import { MAX_VISIBLE_LEVELS } from './constants';

export interface StaticVisiblePerson {
  node: FamilyNode;
  depth: number;
  hasChildren: boolean;
  isCollapsed: boolean;
}

function getChildrenByParent(edges: FamilyEdge[]) {
  const map = new Map<string, string[]>();
  edges.forEach((edge) => {
    if (edge.type !== 'parent-child') return;
    const list = map.get(edge.source) ?? [];
    list.push(edge.target);
    map.set(edge.source, list);
  });
  return map;
}

function getSpouseIdsByNode(nodes: FamilyNode[], edges: FamilyEdge[]) {
  const map = new Map<string, string[]>();
  const link = (a: string, b: string) => {
    const list = map.get(a) ?? [];
    if (!list.includes(b)) list.push(b);
    map.set(a, list);
  };
  nodes.forEach((n) => {
    if (n.isSpouse && n.spouseOf) {
      link(n.spouseOf, n.id);
      link(n.id, n.spouseOf);
    }
  });
  edges.forEach((e) => {
    if (e.type !== 'spouse') return;
    link(e.source, e.target);
    link(e.target, e.source);
  });
  return map;
}

function getNodeDepths(tree: FamilyTree) {
  const childrenByParent = getChildrenByParent(tree.edges);
  const depthByNodeId = new Map<string, number>();
  const childIds = new Set(
    tree.edges.filter((e) => e.type === 'parent-child').map((e) => e.target)
  );
  const roots = tree.nodes.filter((n) => !n.isSpouse && !childIds.has(n.id)).map((n) => n.id);
  const queue = roots.map((id) => ({ id, depth: 0 }));

  while (queue.length > 0) {
    const cur = queue.shift();
    if (!cur || depthByNodeId.has(cur.id)) continue;
    depthByNodeId.set(cur.id, cur.depth);
    (childrenByParent.get(cur.id) ?? []).forEach((childId) => {
      queue.push({ id: childId, depth: cur.depth + 1 });
    });
  }

  tree.nodes.forEach((n) => {
    if (n.isSpouse && n.spouseOf && depthByNodeId.has(n.spouseOf)) {
      depthByNodeId.set(n.id, depthByNodeId.get(n.spouseOf)!);
    }
  });

  return depthByNodeId;
}

export function getInitialCollapsedIds(tree: FamilyTree): string[] {
  const depthByNodeId = getNodeDepths(tree);
  const childrenByParent = getChildrenByParent(tree.edges);
  return tree.nodes
    .filter((n) => {
      const depth = depthByNodeId.get(n.id);
      const hasChildren = (childrenByParent.get(n.id) ?? []).length > 0;
      return depth !== undefined && depth >= MAX_VISIBLE_LEVELS - 1 && hasChildren;
    })
    .map((n) => n.id);
}

export function buildVisibleModel(tree: FamilyTree, collapsedNodeIds: string[]) {
  const collapsedSet = new Set(collapsedNodeIds);
  const childrenByParent = getChildrenByParent(tree.edges);
  const spouseIdsByNode = getSpouseIdsByNode(tree.nodes, tree.edges);
  const depthByNodeId = getNodeDepths(tree);
  const nodeById = new Map(tree.nodes.map((n) => [n.id, n]));
  const visibleIds = new Set<string>();
  const childIds = new Set(
    tree.edges.filter((e) => e.type === 'parent-child').map((e) => e.target)
  );
  const roots = tree.nodes.filter((n) => !n.isSpouse && !childIds.has(n.id)).map((n) => n.id);

  const markVisible = (id: string) => {
    visibleIds.add(id);
    (spouseIdsByNode.get(id) ?? []).forEach((sid) => visibleIds.add(sid));
  };

  const visit = (id: string) => {
    const depth = depthByNodeId.get(id);
    if (depth === undefined) return;

    markVisible(id);
    if (collapsedSet.has(id)) return;
    (childrenByParent.get(id) ?? []).forEach(visit);
  };

  roots.forEach(visit);

  const people: StaticVisiblePerson[] = [];
  visibleIds.forEach((id) => {
    const node = nodeById.get(id);
    if (!node) return;
    const depth = depthByNodeId.get(id) ?? 0;
    people.push({
      node,
      depth,
      hasChildren: (childrenByParent.get(id) ?? []).length > 0,
      isCollapsed: collapsedSet.has(id),
    });
  });

  const spousePairs: { a: string; b: string }[] = [];
  const seenPair = new Set<string>();
  tree.edges.forEach((e) => {
    if (e.type !== 'spouse') return;
    if (!visibleIds.has(e.source) || !visibleIds.has(e.target)) return;
    const key = [e.source, e.target].sort().join('::');
    if (seenPair.has(key)) return;
    seenPair.add(key);
    spousePairs.push({ a: e.source, b: e.target });
  });

  const parentChildLinks: { parentId: string; childId: string }[] = [];
  tree.edges.forEach((e) => {
    if (e.type !== 'parent-child') return;
    if (!visibleIds.has(e.source) || !visibleIds.has(e.target)) return;
    parentChildLinks.push({ parentId: e.source, childId: e.target });
  });

  return { people, spousePairs, parentChildLinks, depthByNodeId };
}
