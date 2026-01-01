import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Network, DataSet } from "vis-network/standalone";
import type { Node, Edge } from "vis-network/standalone";

type CraftingNode = {
  id: string;
  image: string;
  size?: number;
};

type CraftingEdge = {
  from: string;
  to: string;
};

type CraftingGraphProps = {
  nodes: CraftingNode[];
  edges: CraftingEdge[];
};

const getCSSVar = (name: string) => {
  const style = getComputedStyle(window.document.body);
  const value = style.getPropertyValue(name).trim();

  return value;
}

export function CraftingGraph({ nodes, edges }: CraftingGraphProps) {
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement | null>(null);
  const networkRef = useRef<Network | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const visNodes = new DataSet<Node & {data: CraftingNode }>(
      nodes.map((node) => ({
        id: node.id,
        shape: "circularImage",
        image: node.image,
        size: node.size ?? 25,
        imagePadding: 10,
        borderWidth: 4,
        color: {
          border: getCSSVar('var(--color-surface-strong)'),
          background: getCSSVar('var(--color-highlight)'),
        },
        data: node,
        title: node.id, // tooltip
      }))
    );

    const visEdges = new DataSet<Edge>(
      edges.map((edge) => ({
        from: edge.from,
        to: edge.to,
        color: { color: getCSSVar('var(--color-surface-muted)') },
      }))
    );

    networkRef.current = new Network(
      containerRef.current,
      { nodes: visNodes, edges: visEdges },
      {
        layout: {
          improvedLayout: true,
        },
        interaction: {
          hover: true,
          dragNodes: true,
        },
        physics: {
          stabilization: true,
          barnesHut: {
            gravitationalConstant: -3000,
            springLength: 120,
          },
        },
        nodes: {
          borderWidth: 0,
        },
      }
    );

    networkRef.current.on("click", (params) => {
      if (params.nodes.length <= 0) return;

      const nodeId = params.nodes[0];
      const clickedNode = visNodes.get(nodeId) as any;
      navigate(`/item/${nodeId}`);
      
      console.log("ID:", nodeId);
      console.log("Nome:", clickedNode.label);
      console.log("Dados completos:", clickedNode.data);
    });

    return () => {
      networkRef.current?.destroy();
    };
  }, [nodes, edges]);

  return (
    <div
      ref={containerRef}
      className="grap-container h-150 w-full rounded-lg"
    />
  );
}