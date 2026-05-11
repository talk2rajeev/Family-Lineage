'use client';

import { create } from 'zustand';
import { Edge, Node } from '@xyflow/react';
import { FamilyTree, FamilyNode, FamilyEdge, FamilyPartner } from '@/types/family';
import { sampleTrees } from '@/data/sampleData';
import { getAutoLayout } from '@/lib/layout';

const INITIAL_VISIBLE_LEVELS = 3;
const LEVEL_VERTICAL_GAP = 72;

function getChildrenByParent(edges: FamilyEdge[]) {
  const childrenByParent = new Map<string, string[]>();

  edges.forEach((edge) => {
    if (edge.type !== 'parent-child') {
      return;
    }

    const children = childrenByParent.get(edge.source) ?? [];
    children.push(edge.target);
    childrenByParent.set(edge.source, children);
  });

  return childrenByParent;
}

function getSpouseIdsByNode(nodes: FamilyNode[], edges: FamilyEdge[]) {
  const spouseIdsByNode = new Map<string, string[]>();

  const linkSpouse = (personId: string, spouseId: string) => {
    const spouseIds = spouseIdsByNode.get(personId) ?? [];
    if (!spouseIds.includes(spouseId)) {
      spouseIds.push(spouseId);
      spouseIdsByNode.set(personId, spouseIds);
    }
  };

  nodes.forEach((node) => {
    if (node.isSpouse && node.spouseOf) {
      linkSpouse(node.spouseOf, node.id);
      linkSpouse(node.id, node.spouseOf);
    }
  });

  edges.forEach((edge) => {
    if (edge.type !== 'spouse') {
      return;
    }

    linkSpouse(edge.source, edge.target);
    linkSpouse(edge.target, edge.source);
  });

  return spouseIdsByNode;
}

function getPrimarySpouseByNode(nodes: FamilyNode[], edges: FamilyEdge[]) {
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const primarySpouseByNode = new Map<string, FamilyPartner>();

  const toPartner = (node: FamilyNode): FamilyPartner => ({
    id: node.id,
    name: node.name,
    gender: node.gender,
    birthYear: node.birthYear,
    deathYear: node.deathYear,
    photoUrl: node.photoUrl,
    role: node.role,
    familyTreeId: node.familyTreeId,
  });

  nodes.forEach((node) => {
    if (!node.isSpouse || !node.spouseOf || primarySpouseByNode.has(node.spouseOf)) {
      return;
    }

    primarySpouseByNode.set(node.spouseOf, toPartner(node));
  });

  edges.forEach((edge) => {
    if (edge.type !== 'spouse' || primarySpouseByNode.has(edge.source)) {
      return;
    }

    const targetNode = nodeById.get(edge.target);
    if (targetNode?.isSpouse) {
      primarySpouseByNode.set(edge.source, toPartner(targetNode));
    }
  });

  return primarySpouseByNode;
}

function getNodeDepths(tree: FamilyTree) {
  const childrenByParent = getChildrenByParent(tree.edges);
  const depthByNodeId = new Map<string, number>();
  const childNodeIds = new Set(
    tree.edges
      .filter((edge) => edge.type === 'parent-child')
      .map((edge) => edge.target)
  );

  const rootIds = tree.nodes
    .filter((node) => !node.isSpouse && !childNodeIds.has(node.id))
    .map((node) => node.id);

  const queue = rootIds.map((id) => ({ id, depth: 0 }));

  while (queue.length > 0) {
    const current = queue.shift();

    if (!current || depthByNodeId.has(current.id)) {
      continue;
    }

    depthByNodeId.set(current.id, current.depth);

    (childrenByParent.get(current.id) ?? []).forEach((childId) => {
      queue.push({ id: childId, depth: current.depth + 1 });
    });
  }

  return depthByNodeId;
}

function getInitialCollapsedNodeIds(tree: FamilyTree) {
  const depthByNodeId = getNodeDepths(tree);
  const childrenByParent = getChildrenByParent(tree.edges);

  return tree.nodes
    .filter((node) => {
      const depth = depthByNodeId.get(node.id);
      const hasChildren = (childrenByParent.get(node.id) ?? []).length > 0;

      return depth !== undefined && depth >= INITIAL_VISIBLE_LEVELS - 1 && hasChildren;
    })
    .map((node) => node.id);
}

function getVisiblePosition(position: { x: number; y: number }, depth: number) {
  return {
    x: position.x,
    y: position.y + depth * LEVEL_VERTICAL_GAP,
  };
}

function getStoredPosition(position: { x: number; y: number }, depth: number) {
  return {
    x: position.x,
    y: position.y - depth * LEVEL_VERTICAL_GAP,
  };
}

function buildVisibleTree(tree: FamilyTree, collapsedNodeIds: string[]) {
  const collapsedSet = new Set(collapsedNodeIds);
  const childrenByParent = getChildrenByParent(tree.edges);
  const spouseIdsByNode = getSpouseIdsByNode(tree.nodes, tree.edges);
  const primarySpouseByNode = getPrimarySpouseByNode(tree.nodes, tree.edges);
  const depthByNodeId = getNodeDepths(tree);
  const childNodeIds = new Set(
    tree.edges
      .filter((edge) => edge.type === 'parent-child')
      .map((edge) => edge.target)
  );
  const visibleNodeIds = new Set<string>();

  const rootIds = tree.nodes
    .filter((node) => !node.isSpouse && !childNodeIds.has(node.id))
    .map((node) => node.id);

  const markVisible = (nodeId: string) => {
    visibleNodeIds.add(nodeId);
    (spouseIdsByNode.get(nodeId) ?? []).forEach((spouseId) => {
      visibleNodeIds.add(spouseId);
    });
  };

  const visit = (nodeId: string) => {
    markVisible(nodeId);

    if (collapsedSet.has(nodeId)) {
      return;
    }

    (childrenByParent.get(nodeId) ?? []).forEach(visit);
  };

  rootIds.forEach(visit);

  return {
    nodes: tree.nodes
      .filter((node) => visibleNodeIds.has(node.id) && !node.isSpouse)
      .map((node) => ({
        ...node,
        position: getVisiblePosition(node.position, depthByNodeId.get(node.id) ?? 0),
        hasChildren: (childrenByParent.get(node.id) ?? []).length > 0,
        isCollapsed: collapsedSet.has(node.id),
        spouse: primarySpouseByNode.get(node.id),
      }))
      .sort((a, b) => (depthByNodeId.get(a.id) ?? 0) - (depthByNodeId.get(b.id) ?? 0)),
    edges: tree.edges.filter(
      (edge) =>
        edge.type !== 'spouse' &&
        visibleNodeIds.has(edge.source) &&
        visibleNodeIds.has(edge.target)
    ),
  };
}

function setTreeView(
  treeId: string,
  trees: Record<string, FamilyTree>,
  collapsedNodeIds?: string[]
) {
  const tree = trees[treeId];

  if (!tree) {
    return null;
  }

  const nextCollapsedNodeIds = collapsedNodeIds ?? getInitialCollapsedNodeIds(tree);
  const visibleTree = buildVisibleTree(tree, nextCollapsedNodeIds);

  return {
    currentTreeId: treeId,
    collapsedNodeIds: nextCollapsedNodeIds,
    nodes: visibleTree.nodes,
    edges: visibleTree.edges,
  };
}

// Re-export types for React Flow compatibility
export type RFNode = FamilyNode & { 
  type?: string;
  data: FamilyNode;
};

export type RFEdge = FamilyEdge;

interface FamilyStore {
  currentTreeId: string | null;
  trees: Record<string, FamilyTree>;
  nodes: FamilyNode[];
  edges: FamilyEdge[];
  collapsedNodeIds: string[];
  loading: boolean;

  setCurrentTree: (treeId: string) => void;
  updateNodePosition: (id: string, position: { x: number; y: number }) => void;
  loadSampleData: () => void;
  exploreLineage: (familyTreeId: string) => void;
  toggleCollapse: (nodeId: string) => void;
  applyAutoLayout: () => Promise<void>;
}

export const useFamilyStore = create<FamilyStore>((set, get) => ({
  currentTreeId: 'sharma',
  trees: sampleTrees,
  nodes: [],
  edges: [],
  collapsedNodeIds: [],
  loading: false,

  setCurrentTree: (treeId) => {
    const nextState = setTreeView(treeId, get().trees);

    if (nextState) {
      set(nextState);
    }
  },

  updateNodePosition: (id, position) => {
    set((state) => {
      const depthByNodeId = state.currentTreeId
        ? getNodeDepths(state.trees[state.currentTreeId])
        : new Map<string, number>();
      const storedPosition = getStoredPosition(position, depthByNodeId.get(id) ?? 0);

      if (!state.currentTreeId) {
        return {
          nodes: state.nodes.map((node) =>
            node.id === id ? { ...node, position } : node
          ),
        };
      }

      const currentTree = state.trees[state.currentTreeId];
      const nextTreeNodes = currentTree.nodes.map((node) =>
        node.id === id ? { ...node, position: storedPosition } : node
      );

      return {
        nodes: state.nodes.map((node) =>
          node.id === id ? { ...node, position } : node
        ),
        trees: {
          ...state.trees,
          [state.currentTreeId]: {
            ...currentTree,
            nodes: nextTreeNodes,
          },
        },
      };
    });
  },

  loadSampleData: () => {
    const nextState = setTreeView('sharma', sampleTrees);

    if (nextState) {
      set({
        trees: sampleTrees,
        ...nextState,
      });
    }
  },

  exploreLineage: (familyTreeId) => {
    const nextState = setTreeView(familyTreeId, get().trees);

    if (nextState) {
      set(nextState);
    }
  },

  toggleCollapse: (nodeId: string) => {
    const { currentTreeId, trees, collapsedNodeIds } = get();

    if (!currentTreeId) {
      return;
    }

    const tree = trees[currentTreeId];
    const hasChildren = tree.edges.some(
      (edge) => edge.type === 'parent-child' && edge.source === nodeId
    );

    if (!hasChildren) {
      return;
    }

    const nextCollapsedNodeIds = collapsedNodeIds.includes(nodeId)
      ? collapsedNodeIds.filter((id) => id !== nodeId)
      : [...collapsedNodeIds, nodeId];

    const nextState = setTreeView(currentTreeId, trees, nextCollapsedNodeIds);

    if (nextState) {
      set(nextState);
    }
  },

  applyAutoLayout: async () => {
    const { nodes, edges } = get();
    set({ loading: true });
    try {
      const { nodes: layoutedNodes } = await getAutoLayout(
        nodes as unknown as Node[],
        edges as unknown as Edge[]
      );

      set((state) => {
        if (!state.currentTreeId) {
          return { nodes: layoutedNodes as unknown as FamilyNode[] };
        }

        const currentTree = state.trees[state.currentTreeId];
        const layoutedPositionById = new Map(
          (layoutedNodes as unknown as FamilyNode[]).map((node) => [
            node.id,
            getStoredPosition(node.position, getNodeDepths(currentTree).get(node.id) ?? 0),
          ])
        );
        const nextTree: FamilyTree = {
          ...currentTree,
          nodes: currentTree.nodes.map((node) => ({
            ...node,
            position: layoutedPositionById.get(node.id) ?? node.position,
          })),
        };
        const visibleTree = buildVisibleTree(nextTree, state.collapsedNodeIds);

        return {
          trees: {
            ...state.trees,
            [state.currentTreeId]: nextTree,
          },
          nodes: visibleTree.nodes,
          edges: visibleTree.edges,
        };
      });
    } catch (err) {
      console.error('Layout failed:', err);
    } finally {
      set({ loading: false });
    }
  },
}));
