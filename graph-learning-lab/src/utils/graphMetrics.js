// Graph Metrics Calculations

/**
 * Calculate the degree of a node
 * For directed graphs, returns { in: number, out: number, total: number }
 * For undirected graphs, returns the degree
 */
export function calculateDegree(graph, nodeId) {
  const { nodes, edges, directed } = graph;

  if (directed) {
    const inDegree = edges.filter(e => e.target === nodeId).length;
    const outDegree = edges.filter(e => e.source === nodeId).length;
    return { in: inDegree, out: outDegree, total: inDegree + outDegree };
  } else {
    return edges.filter(e => e.source === nodeId || e.target === nodeId).length;
  }
}

/**
 * Calculate degree distribution
 */
export function degreeDistribution(graph) {
  const { nodes, directed } = graph;
  const distribution = {};

  nodes.forEach(node => {
    const degree = directed
      ? calculateDegree(graph, node.id).total
      : calculateDegree(graph, node.id);
    distribution[degree] = (distribution[degree] || 0) + 1;
  });

  return distribution;
}

/**
 * Calculate average degree
 */
export function averageDegree(graph) {
  const { nodes, edges } = graph;
  if (nodes.length === 0) return 0;
  return (2 * edges.length) / nodes.length;
}

/**
 * Calculate graph density
 */
export function calculateDensity(graph) {
  const { nodes, edges, directed } = graph;
  const n = nodes.length;
  if (n < 2) return 0;

  const maxEdges = directed ? n * (n - 1) : (n * (n - 1)) / 2;
  return edges.length / maxEdges;
}

/**
 * Build adjacency list from graph
 */
export function buildAdjacencyList(graph) {
  const { nodes, edges, directed } = graph;
  const adjacency = {};

  nodes.forEach(node => {
    adjacency[node.id] = [];
  });

  edges.forEach(edge => {
    adjacency[edge.source].push(edge.target);
    if (!directed) {
      adjacency[edge.target].push(edge.source);
    }
  });

  return adjacency;
}

/**
 * BFS to find shortest paths from a source node
 */
export function bfsShortestPaths(graph, sourceId) {
  const adjacency = buildAdjacencyList(graph);
  const distances = {};
  const visited = new Set();
  const queue = [{ id: sourceId, distance: 0 }];

  graph.nodes.forEach(node => {
    distances[node.id] = Infinity;
  });
  distances[sourceId] = 0;

  while (queue.length > 0) {
    const { id, distance } = queue.shift();

    if (visited.has(id)) continue;
    visited.add(id);

    const neighbors = adjacency[id] || [];
    neighbors.forEach(neighbor => {
      if (!visited.has(neighbor) && distances[neighbor] === Infinity) {
        distances[neighbor] = distance + 1;
        queue.push({ id: neighbor, distance: distance + 1 });
      }
    });
  }

  return distances;
}

/**
 * Find all shortest paths between two nodes
 */
export function findShortestPath(graph, sourceId, targetId) {
  const adjacency = buildAdjacencyList(graph);
  const distances = {};
  const predecessors = {};
  const visited = new Set();
  const queue = [sourceId];

  graph.nodes.forEach(node => {
    distances[node.id] = Infinity;
    predecessors[node.id] = [];
  });
  distances[sourceId] = 0;

  while (queue.length > 0) {
    const current = queue.shift();

    if (visited.has(current)) continue;
    visited.add(current);

    if (current === targetId) break;

    const neighbors = adjacency[current] || [];
    neighbors.forEach(neighbor => {
      const newDist = distances[current] + 1;
      if (newDist < distances[neighbor]) {
        distances[neighbor] = newDist;
        predecessors[neighbor] = [current];
        queue.push(neighbor);
      } else if (newDist === distances[neighbor]) {
        predecessors[neighbor].push(current);
      }
    });
  }

  // Reconstruct path
  if (distances[targetId] === Infinity) return null;

  const path = [];
  let current = targetId;
  while (current !== sourceId) {
    path.unshift(current);
    current = predecessors[current][0];
  }
  path.unshift(sourceId);

  return { path, distance: distances[targetId] };
}

/**
 * Calculate diameter (longest shortest path)
 */
export function calculateDiameter(graph) {
  const { nodes } = graph;
  if (nodes.length < 2) return 0;

  let maxDistance = 0;

  nodes.forEach(node => {
    const distances = bfsShortestPaths(graph, node.id);
    Object.values(distances).forEach(d => {
      if (d !== Infinity && d > maxDistance) {
        maxDistance = d;
      }
    });
  });

  return maxDistance === 0 ? Infinity : maxDistance;
}

/**
 * Calculate radius
 */
export function calculateRadius(graph) {
  const { nodes } = graph;
  if (nodes.length < 2) return 0;

  const eccentricities = [];

  nodes.forEach(node => {
    const distances = bfsShortestPaths(graph, node.id);
    const finiteDistances = Object.values(distances).filter(d => d !== Infinity);
    if (finiteDistances.length > 0) {
      eccentricities.push(Math.max(...finiteDistances));
    }
  });

  return eccentricities.length > 0 ? Math.min(...eccentricities) : Infinity;
}

/**
 * Calculate average path length
 */
export function averagePathLength(graph) {
  const { nodes } = graph;
  if (nodes.length < 2) return 0;

  let totalDistance = 0;
  let pathCount = 0;

  nodes.forEach(node => {
    const distances = bfsShortestPaths(graph, node.id);
    Object.entries(distances).forEach(([targetId, d]) => {
      if (targetId !== node.id && d !== Infinity) {
        totalDistance += d;
        pathCount++;
      }
    });
  });

  return pathCount > 0 ? totalDistance / pathCount : 0;
}

/**
 * Count triangles involving a node
 */
export function countTriangles(graph, nodeId) {
  const adjacency = buildAdjacencyList(graph);
  const neighbors = adjacency[nodeId] || [];
  let triangles = 0;

  for (let i = 0; i < neighbors.length; i++) {
    for (let j = i + 1; j < neighbors.length; j++) {
      if (adjacency[neighbors[i]]?.includes(neighbors[j])) {
        triangles++;
      }
    }
  }

  return triangles;
}

/**
 * Calculate local clustering coefficient
 */
export function localClusteringCoefficient(graph, nodeId) {
  const degree = graph.directed
    ? calculateDegree(graph, nodeId).total
    : calculateDegree(graph, nodeId);

  if (degree < 2) return 0;

  const triangles = countTriangles(graph, nodeId);
  const possibleTriangles = (degree * (degree - 1)) / 2;

  return triangles / possibleTriangles;
}

/**
 * Calculate global clustering coefficient
 */
export function globalClusteringCoefficient(graph) {
  const { nodes } = graph;
  let totalTriangles = 0;
  let totalTriplets = 0;

  nodes.forEach(node => {
    const degree = graph.directed
      ? calculateDegree(graph, node.id).total
      : calculateDegree(graph, node.id);

    if (degree >= 2) {
      totalTriangles += countTriangles(graph, node.id);
      totalTriplets += (degree * (degree - 1)) / 2;
    }
  });

  // Each triangle is counted 3 times (once per vertex)
  return totalTriplets > 0 ? totalTriangles / totalTriplets : 0;
}

/**
 * Find connected components using DFS
 */
export function findConnectedComponents(graph) {
  const adjacency = buildAdjacencyList(graph);
  const visited = new Set();
  const components = [];

  function dfs(nodeId, component) {
    visited.add(nodeId);
    component.push(nodeId);

    const neighbors = adjacency[nodeId] || [];
    neighbors.forEach(neighbor => {
      if (!visited.has(neighbor)) {
        dfs(neighbor, component);
      }
    });
  }

  graph.nodes.forEach(node => {
    if (!visited.has(node.id)) {
      const component = [];
      dfs(node.id, component);
      components.push(component);
    }
  });

  return components;
}

/**
 * Calculate degree centrality
 */
export function degreeCentrality(graph, nodeId) {
  const { nodes, directed } = graph;
  const n = nodes.length;
  if (n < 2) return 0;

  const degree = directed
    ? calculateDegree(graph, nodeId).total
    : calculateDegree(graph, nodeId);

  return degree / (n - 1);
}

/**
 * Calculate closeness centrality
 */
export function closenessCentrality(graph, nodeId) {
  const { nodes } = graph;
  const n = nodes.length;
  if (n < 2) return 0;

  const distances = bfsShortestPaths(graph, nodeId);
  let totalDistance = 0;
  let reachable = 0;

  Object.entries(distances).forEach(([id, d]) => {
    if (id !== nodeId && d !== Infinity) {
      totalDistance += d;
      reachable++;
    }
  });

  if (reachable === 0) return 0;

  // Normalized closeness centrality
  return reachable / totalDistance;
}

/**
 * Calculate betweenness centrality
 */
export function betweennessCentrality(graph, nodeId) {
  const { nodes } = graph;
  const n = nodes.length;
  if (n < 3) return 0;

  let betweenness = 0;

  // For each pair of nodes (s, t)
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const s = nodes[i].id;
      const t = nodes[j].id;

      if (s === nodeId || t === nodeId) continue;

      // Count shortest paths and those passing through nodeId
      const result = countShortestPathsThroughNode(graph, s, t, nodeId);
      if (result.total > 0) {
        betweenness += result.through / result.total;
      }
    }
  }

  // Normalize
  return betweenness / ((n - 1) * (n - 2) / 2);
}

/**
 * Helper function to count shortest paths through a node
 */
function countShortestPathsThroughNode(graph, source, target, viaNode) {
  const adjacency = buildAdjacencyList(graph);

  // BFS from source
  const distFromSource = {};
  const pathsFromSource = {};
  graph.nodes.forEach(n => {
    distFromSource[n.id] = Infinity;
    pathsFromSource[n.id] = 0;
  });
  distFromSource[source] = 0;
  pathsFromSource[source] = 1;

  const queue = [source];
  while (queue.length > 0) {
    const current = queue.shift();
    const neighbors = adjacency[current] || [];
    neighbors.forEach(neighbor => {
      if (distFromSource[neighbor] === Infinity) {
        distFromSource[neighbor] = distFromSource[current] + 1;
        queue.push(neighbor);
      }
      if (distFromSource[neighbor] === distFromSource[current] + 1) {
        pathsFromSource[neighbor] += pathsFromSource[current];
      }
    });
  }

  // BFS from target
  const distFromTarget = {};
  const pathsFromTarget = {};
  graph.nodes.forEach(n => {
    distFromTarget[n.id] = Infinity;
    pathsFromTarget[n.id] = 0;
  });
  distFromTarget[target] = 0;
  pathsFromTarget[target] = 1;

  const queue2 = [target];
  while (queue2.length > 0) {
    const current = queue2.shift();
    const neighbors = adjacency[current] || [];
    neighbors.forEach(neighbor => {
      if (distFromTarget[neighbor] === Infinity) {
        distFromTarget[neighbor] = distFromTarget[current] + 1;
        queue2.push(neighbor);
      }
      if (distFromTarget[neighbor] === distFromTarget[current] + 1) {
        pathsFromTarget[neighbor] += pathsFromTarget[current];
      }
    });
  }

  const totalPaths = pathsFromSource[target];
  const shortestDist = distFromSource[target];

  // Check if viaNode is on a shortest path
  let pathsThrough = 0;
  if (distFromSource[viaNode] + distFromTarget[viaNode] === shortestDist) {
    pathsThrough = pathsFromSource[viaNode] * pathsFromTarget[viaNode];
  }

  return { total: totalPaths, through: pathsThrough };
}

/**
 * Calculate all centrality metrics for a node
 */
export function calculateNodeMetrics(graph, nodeId) {
  const degree = calculateDegree(graph, nodeId);

  return {
    degree: graph.directed ? degree : { total: degree },
    clustering: localClusteringCoefficient(graph, nodeId),
    degreeCentrality: degreeCentrality(graph, nodeId),
    closenessCentrality: closenessCentrality(graph, nodeId),
    betweennessCentrality: betweennessCentrality(graph, nodeId)
  };
}

/**
 * Calculate all global metrics for a graph
 */
export function calculateGlobalMetrics(graph) {
  const { nodes, edges } = graph;

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

  const components = findConnectedComponents(graph);

  return {
    nodeCount: nodes.length,
    edgeCount: edges.length,
    density: calculateDensity(graph),
    averageDegree: averageDegree(graph),
    diameter: calculateDiameter(graph),
    radius: calculateRadius(graph),
    averagePathLength: averagePathLength(graph),
    clusteringCoefficient: globalClusteringCoefficient(graph),
    components: components.length
  };
}

export default {
  calculateDegree,
  degreeDistribution,
  averageDegree,
  calculateDensity,
  buildAdjacencyList,
  bfsShortestPaths,
  findShortestPath,
  calculateDiameter,
  calculateRadius,
  averagePathLength,
  countTriangles,
  localClusteringCoefficient,
  globalClusteringCoefficient,
  findConnectedComponents,
  degreeCentrality,
  closenessCentrality,
  betweennessCentrality,
  calculateNodeMetrics,
  calculateGlobalMetrics
};
