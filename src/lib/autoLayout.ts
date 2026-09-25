import ELK from 'elkjs/lib/elk.bundled.js'
import { Node, Edge } from '@xyflow/react'

const elk = new ELK()

export async function getLayoutedElements<T extends Node = Node>(
  nodes: T[],
  edges: Edge[],
  direction: 'DOWN' | 'RIGHT' = 'DOWN'
): Promise<{ nodes: T[]; edges: Edge[] }> {
  const graph = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': direction,
      'elk.spacing.nodeNode': '80',
      'elk.layered.spacing.nodeNodeBetweenLayers': '100',
      'elk.edgeRouting': 'ORTHOGONAL',
    },
    children: nodes.map((node) => ({
      id: node.id,
      width: 250,
      height: 120,
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
    })),
  }

  const layoutedGraph = await elk.layout(graph)

  const layoutedNodes = nodes.map((node) => {
    const layoutedNode = layoutedGraph.children?.find((n) => n.id === node.id)
    return {
      ...node,
      position: {
        x: layoutedNode?.x ?? node.position.x,
        y: layoutedNode?.y ?? node.position.y,
      },
    }
  })

  return { nodes: layoutedNodes, edges }
}
