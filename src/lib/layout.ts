import { Node, Edge } from '@xyflow/react';
import ELK, { ElkNode, ElkExtendedEdge } from 'elkjs/lib/elk.bundled.js';

const elk = new ELK();

const DEFAULT_WIDTH = 220;
const SPOUSE_WIDTH = 240;
const DEFAULT_HEIGHT = 100;
const SPOUSE_HEIGHT = 150;

export async function getAutoLayout(nodes: Node[], edges: Edge[]) {
  const graph: ElkNode = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': 'DOWN',
      'elk.spacing.nodeNode': '80',
      'elk.layered.spacing.nodeNodeBetweenLayers': '120',
      'elk.spacing.edgeEdge': '40',
      'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF',
      'elk.padding': '[top=50,left=50,bottom=50,right=50]',
    },
    children: nodes.map((node) => ({
      id: node.id,
      width: (node.data as { spouse?: unknown } | undefined)?.spouse ? SPOUSE_WIDTH : DEFAULT_WIDTH,
      height: (node.data as { spouse?: unknown } | undefined)?.spouse ? SPOUSE_HEIGHT : DEFAULT_HEIGHT,
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
    })) as ElkExtendedEdge[],
  };

  try {
    const layoutedGraph = await elk.layout(graph);

    return {
      nodes: nodes.map((node) => {
        const layoutNode = layoutedGraph.children?.find((n) => n.id === node.id);
        return {
          ...node,
          position: {
            x: layoutNode?.x ?? node.position.x,
            y: layoutNode?.y ?? node.position.y,
          },
        };
      }),
      edges,
    };
  } catch (error) {
    console.error('Layout failed:', error);
    return { nodes, edges };
  }
}
