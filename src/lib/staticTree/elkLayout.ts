import ELK, { ElkNode, ElkExtendedEdge } from 'elkjs/lib/elk.bundled.js';
import {
  CARD_WIDTH,
  CARD_HEIGHT,
  CARD_BOTTOM_PAD,
  FAMILY_UNIT_GAP,
  ROW_GAP,
  SPOUSE_GAP,
} from './constants';
import type { StaticVisiblePerson } from './buildVisibleModel';

const elk = new ELK();
const UNION_MARKER_SIZE = 24;
const UNION_MARKER_RADIUS = UNION_MARKER_SIZE / 2;
const STACKED_ICON_SIZE = 22;
const STACKED_ICON_GAP = 5;
const CHILD_BRANCH_GAP = 4;

export interface LayoutNode {
  id: string;
  person: StaticVisiblePerson;
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  bottomY: number;
}

export interface SpouseLine {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  midX: number;
  midY: number;
  childStartX: number;
  childStartY: number;
  hasChildBranch: boolean;
}

export interface ChildLine {
  id: string;
  path: string;
}

function orderSpouses(
  primaryId: string,
  spouseIds: string[],
  nodeById: Map<string, StaticVisiblePerson>
) {
  const primary = nodeById.get(primaryId);
  if (!primary) return spouseIds;

  return [...spouseIds].sort((a, b) => {
    const na = nodeById.get(a)?.node;
    const nb = nodeById.get(b)?.node;
    if (!na || !nb) return 0;
    if (na.gender === 'F' && nb.gender !== 'F') return -1;
    if (nb.gender === 'F' && na.gender !== 'F') return 1;
    return na.name.localeCompare(nb.name);
  });
}

function alignSpouseRow(
  layoutById: Map<string, LayoutNode>,
  spousePairs: { a: string; b: string }[],
  people: StaticVisiblePerson[],
  unitCenterById: Map<string, number>
) {
  const nodeById = new Map(people.map((p) => [p.node.id, p]));
  const spouseOf = new Map<string, string[]>();
  spousePairs.forEach(({ a, b }) => {
    if (!spouseOf.has(a)) spouseOf.set(a, []);
    if (!spouseOf.has(b)) spouseOf.set(b, []);
    spouseOf.get(a)!.push(b);
    spouseOf.get(b)!.push(a);
  });

  const visited = new Set<string>();

  people.forEach((p) => {
    const id = p.node.id;
    if (visited.has(id)) return;

    const partners = spouseOf.get(id) ?? [];
    if (partners.length === 0) {
      visited.add(id);
      return;
    }

    const cluster = new Set<string>([id]);
    const queue = [id];
    while (queue.length) {
      const cur = queue.shift()!;
      (spouseOf.get(cur) ?? []).forEach((pid) => {
        if (!cluster.has(pid) && layoutById.has(pid)) {
          cluster.add(pid);
          queue.push(pid);
        }
      });
    }

    const clusterIds = [...cluster];
    const primary =
      clusterIds.find((cid) => !nodeById.get(cid)?.node.isSpouse) ?? clusterIds[0];
    const spouses = clusterIds.filter((cid) => cid !== primary);
    const primaryNode = nodeById.get(primary)?.node;
    const femaleSpouses = spouses.filter((id) => nodeById.get(id)?.node.gender === 'F');
    const otherSpouses = spouses.filter((id) => nodeById.get(id)?.node.gender !== 'F');

    let ordered: string[];
    if (
      primaryNode?.gender === 'M' &&
      femaleSpouses.length >= 2 &&
      otherSpouses.length === 0
    ) {
      ordered = [femaleSpouses[0], primary, femaleSpouses[1], ...femaleSpouses.slice(2)];
    } else if (primaryNode?.gender === 'M' && femaleSpouses.length === 1) {
      ordered = [femaleSpouses[0], primary, ...otherSpouses];
    } else if (primaryNode?.gender === 'F' && spouses.length === 1) {
      const spouse = spouses[0];
      const spouseNode = nodeById.get(spouse)?.node;
      ordered =
        spouseNode?.gender === 'M'
          ? [spouse, primary]
          : [primary, spouse];
    } else {
      ordered = [primary, ...orderSpouses(primary, spouses, nodeById)];
    }

    const anchor = layoutById.get(primary);
    if (!anchor) return;
    const unitCenterX = unitCenterById.get(primary) ?? anchor.centerX;

    const rowY = anchor.y;
    ordered.forEach((cid) => {
      const ln = layoutById.get(cid);
      if (ln) ln.y = rowY;
    });

    const totalWidth =
      ordered.length * CARD_WIDTH + (ordered.length - 1) * SPOUSE_GAP;
    const x = unitCenterX - totalWidth / 2 + CARD_WIDTH / 2;
    ordered.forEach((cid, i) => {
      const ln = layoutById.get(cid);
      if (!ln) return;
      ln.x = x + i * (CARD_WIDTH + SPOUSE_GAP) - CARD_WIDTH / 2;
      ln.centerX = ln.x + CARD_WIDTH / 2;
      ln.centerY = ln.y + CARD_HEIGHT / 2;
      ln.bottomY = ln.y + CARD_HEIGHT;
      visited.add(cid);
    });
  });
}

function buildChildPaths(
  layoutById: Map<string, LayoutNode>,
  parentChildLinks: { parentId: string; childId: string }[],
  spousePairs: { a: string; b: string }[]
) {
  const childrenByParent = new Map<string, string[]>();
  parentChildLinks.forEach(({ parentId, childId }) => {
    const list = childrenByParent.get(parentId) ?? [];
    list.push(childId);
    childrenByParent.set(parentId, list);
  });

  const spouseMap = new Map<string, string[]>();
  spousePairs.forEach(({ a, b }) => {
    if (!spouseMap.has(a)) spouseMap.set(a, []);
    if (!spouseMap.has(b)) spouseMap.set(b, []);
    spouseMap.get(a)!.push(b);
    spouseMap.get(b)!.push(a);
  });

  const spouseLineByParent = new Map<string, { unionX: number; unionY: number; childStartX: number; childStartY: number }>();
  const childBearingPairIds = new Set<string>();

  parentChildLinks.forEach(({ parentId }) => {
    const pair = spousePairs.find(({ a, b }) => a === parentId || b === parentId);
    if (pair) {
      childBearingPairIds.add(`${pair.a}::${pair.b}`);
    }
  });

  spousePairs.forEach(({ a, b }) => {
    const na = layoutById.get(a);
    const nb = layoutById.get(b);
    if (!na || !nb) return;

    const left = na.x <= nb.x ? na : nb;
    const right = na.x <= nb.x ? nb : na;
    const unionX = (left.x + CARD_WIDTH + right.x) / 2;
    const unionY = left.y + CARD_HEIGHT / 2;
    const childStartX = unionX;
    const childStartY =
      unionY + UNION_MARKER_RADIUS + STACKED_ICON_GAP + STACKED_ICON_SIZE + CHILD_BRANCH_GAP;
    if (!spouseLineByParent.has(a)) {
      spouseLineByParent.set(a, { unionX, unionY, childStartX, childStartY });
    }
    if (!spouseLineByParent.has(b)) {
      spouseLineByParent.set(b, { unionX, unionY, childStartX, childStartY });
    }
  });

  const lines: ChildLine[] = [];
  const drawn = new Set<string>();

  parentChildLinks.forEach(({ parentId, childId }) => {
    const key = `${parentId}->${childId}`;
    if (drawn.has(key)) return;
    drawn.add(key);

    const parentLayout = layoutById.get(parentId);
    const childLayout = layoutById.get(childId);
    if (!parentLayout || !childLayout) return;

    const partners = spouseMap.get(parentId) ?? [];
    const partnerLayouts = partners
      .map((pid) => layoutById.get(pid))
      .filter((l): l is LayoutNode => Boolean(l));

    const spouseJoin = spouseLineByParent.get(parentId);
    const allParents = [parentLayout, ...partnerLayouts];
    const minX = Math.min(...allParents.map((p) => p.x));
    const maxX = Math.max(...allParents.map((p) => p.x + CARD_WIDTH));
    const unionX = spouseJoin?.childStartX ?? spouseJoin?.unionX ?? (minX + maxX) / 2;
    const unionY = spouseJoin?.unionY ?? (Math.max(...allParents.map((p) => p.bottomY)) + CARD_BOTTOM_PAD / 2);
    const childStartY = spouseJoin?.childStartY ?? unionY;

    const childTopY = childLayout.y;
    const branchY = childStartY + (childTopY - childStartY) / 2;

    const path = [
      `M ${unionX} ${childStartY}`,
      `L ${unionX} ${branchY}`,
      `L ${childLayout.centerX} ${branchY}`,
      `L ${childLayout.centerX} ${childTopY}`,
    ].join(' ');

    lines.push({ id: key, path });
  });

  return lines;
}

function buildSpouseLines(
  layoutById: Map<string, LayoutNode>,
  spousePairs: { a: string; b: string }[]
): SpouseLine[] {
  const lines: SpouseLine[] = [];
  const childBearingPairIds = new Set<string>();

  layoutById.forEach((node) => {
    if (!node.person.hasChildren) {
      return;
    }

    const pair = spousePairs.find(({ a, b }) => a === node.id || b === node.id);
    if (pair) {
      childBearingPairIds.add(`${pair.a}::${pair.b}`);
    }
  });

  spousePairs.forEach(({ a, b }) => {
    const na = layoutById.get(a);
    const nb = layoutById.get(b);
    if (!na || !nb) return;

    const left = na.x <= nb.x ? na : nb;
    const right = na.x <= nb.x ? nb : na;
    const y = left.y + CARD_HEIGHT / 2;
    const x1 = left.x + CARD_WIDTH;
    const x2 = right.x;
    const midX = (x1 + x2) / 2;

    lines.push({
      id: `${a}::${b}`,
      x1,
      y1: y,
      x2,
      y2: y,
      midX,
      midY: y,
      childStartX: midX,
      childStartY:
        y + UNION_MARKER_RADIUS + STACKED_ICON_GAP + STACKED_ICON_SIZE + CHILD_BRANCH_GAP,
      hasChildBranch: childBearingPairIds.has(`${a}::${b}`),
    });
  });
  return lines;
}

export async function layoutStaticTree(
  people: StaticVisiblePerson[],
  spousePairs: { a: string; b: string }[],
  parentChildLinks: { parentId: string; childId: string }[]
) {
  if (people.length === 0) {
    return { nodes: [] as LayoutNode[], spouseLines: [] as SpouseLine[], childLines: [] as ChildLine[] };
  }

  const bloodPeople = people.filter((p) => !p.node.isSpouse);
  const spouseIdsByPrimary = new Map<string, string[]>();
  people.forEach((person) => {
    if (!person.node.isSpouse || !person.node.spouseOf) {
      return;
    }

    const spouseIds = spouseIdsByPrimary.get(person.node.spouseOf) ?? [];
    spouseIds.push(person.node.id);
    spouseIdsByPrimary.set(person.node.spouseOf, spouseIds);
  });

  const unitWidthById = new Map<string, number>();
  bloodPeople.forEach((person) => {
    const spouseCount = spouseIdsByPrimary.get(person.node.id)?.length ?? 0;
    const cardCount = 1 + spouseCount;
    const unitWidth = cardCount * CARD_WIDTH + Math.max(0, cardCount - 1) * SPOUSE_GAP;
    unitWidthById.set(person.node.id, unitWidth);
  });

  const elkGraph: ElkNode = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': 'DOWN',
      'elk.spacing.nodeNode': String(FAMILY_UNIT_GAP),
      'elk.layered.spacing.nodeNodeBetweenLayers': String(ROW_GAP),
      'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
      'elk.padding': '[top=40,left=40,bottom=80,right=40]',
    },
    children: bloodPeople.map((p) => ({
      id: p.node.id,
      width: unitWidthById.get(p.node.id) ?? CARD_WIDTH,
      height: CARD_HEIGHT + CARD_BOTTOM_PAD,
    })),
    edges: parentChildLinks
      .filter((l) => bloodPeople.some((p) => p.node.id === l.parentId))
      .map((l, i) => ({
        id: `e-${i}`,
        sources: [l.parentId],
        targets: [l.childId],
      })) as ElkExtendedEdge[],
  };

  const layouted = await elk.layout(elkGraph);
  const layoutById = new Map<string, LayoutNode>();
  const unitCenterById = new Map<string, number>();

  layouted.children?.forEach((elkNode) => {
    const unitWidth = unitWidthById.get(elkNode.id) ?? CARD_WIDTH;
    unitCenterById.set(elkNode.id, (elkNode.x ?? 0) + unitWidth / 2);
  });

  people.forEach((person) => {
    let elkNode = layouted.children?.find((c) => c.id === person.node.id);
    if (!elkNode && person.node.isSpouse && person.node.spouseOf) {
      elkNode = layouted.children?.find((c) => c.id === person.node.spouseOf);
    }
    const ownerId = person.node.isSpouse && person.node.spouseOf ? person.node.spouseOf : person.node.id;
    const unitCenterX = unitCenterById.get(ownerId);
    const x = unitCenterX !== undefined ? unitCenterX - CARD_WIDTH / 2 : (elkNode?.x ?? 0);
    const y = elkNode?.y ?? person.depth * ROW_GAP;
    layoutById.set(person.node.id, {
      id: person.node.id,
      person,
      x,
      y,
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      centerX: x + CARD_WIDTH / 2,
      centerY: y + CARD_HEIGHT / 2,
      bottomY: y + CARD_HEIGHT,
    });
  });

  alignSpouseRow(layoutById, spousePairs, people, unitCenterById);

  const spouseLines = buildSpouseLines(layoutById, spousePairs);
  const childLines = buildChildPaths(layoutById, parentChildLinks, spousePairs);

  return {
    nodes: [...layoutById.values()],
    spouseLines,
    childLines,
  };
}
