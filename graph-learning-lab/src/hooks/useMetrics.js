import { useMemo } from 'react';
import { useGraph } from '../contexts/GraphContext';
import {
  calculateGlobalMetrics,
  calculateNodeMetrics,
  degreeDistribution
} from '../utils/graphMetrics';

/**
 * Hook for calculating graph metrics
 */
export function useMetrics() {
  const { state } = useGraph();
  const { nodes, edges, directed, weighted } = state;

  const graph = useMemo(() => ({
    nodes,
    edges,
    directed,
    weighted
  }), [nodes, edges, directed, weighted]);

  const globalMetrics = useMemo(() => {
    if (nodes.length === 0) {
      return {
        nodeCount: 0,
        edgeCount: 0,
        density: 0,
        averageDegree: 0,
        diameter: 0,
        radius: 0,
        averagePathLength: 0,
        clusteringCoefficient: 0,
        components: 0
      };
    }
    return calculateGlobalMetrics(graph);
  }, [graph, nodes.length]);

  const distribution = useMemo(() => {
    if (nodes.length === 0) return {};
    return degreeDistribution(graph);
  }, [graph, nodes.length]);

  const getNodeMetrics = (nodeId) => {
    if (!nodeId || nodes.length === 0) return null;
    return calculateNodeMetrics(graph, nodeId);
  };

  return {
    globalMetrics,
    distribution,
    getNodeMetrics,
    graph
  };
}

export default useMetrics;
