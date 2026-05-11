export type Gender = 'M' | 'F' | 'O';

export interface FamilyPartner {
  id: string;
  name: string;
  gender: Gender;
  birthYear?: number;
  deathYear?: number;
  photoUrl?: string;
  role?: string;
  familyTreeId?: string;
}

export interface FamilyNode {
  id: string;
  name: string;
  gender: Gender;
  birthYear?: number;
  deathYear?: number;
  photoUrl?: string;
  role?: string;

  // Spouse & Lineage Logic
  isSpouse?: boolean;       // true = in-law / spouse node
  spouseOf?: string;        // ID of the main blood relative
  familyTreeId?: string;    // The tree this person "belongs" to (for explore lineage)
  isCollapsed?: boolean;
  hasChildren?: boolean;
  spouse?: FamilyPartner;

  // React Flow position
  position: { x: number; y: number };
}

export interface FamilyEdge {
  id: string;
  source: string;
  target: string;
  type: 'parent-child' | 'spouse';
  animated?: boolean;
  style?: Record<string, string | number>;
}

export interface FamilyTree {
  id: string;
  name: string;
  ownerId: string;
  isPublic: boolean;
  nodes: FamilyNode[];
  edges: FamilyEdge[];
}

export interface ContextMenuState {
  node: {
    id: string;
    data: FamilyNode;
    position: { x: number; y: number };
  };
  screenPosition: { x: number; y: number };
}

export interface BreadcrumbEntry {
  treeId: string;
  treeName: string;
}
