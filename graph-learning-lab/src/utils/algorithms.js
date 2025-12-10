// Graph Algorithms

import { buildAdjacencyList, findConnectedComponents } from './graphMetrics';

/**
 * PageRank Algorithm
 * Returns PageRank scores for all nodes
 */
export function pageRank(graph, options = {}) {
  const {
    dampingFactor = 0.85,
    maxIterations = 100,
    tolerance = 1e-6,
    returnHistory = false
  } = options;

  const { nodes, edges, directed } = graph;
  const n = nodes.length;

  if (n === 0) return { scores: {}, iterations: 0, history: [] };

  // Build adjacency lists
  const outgoing = {};
  const incoming = {};

  nodes.forEach(node => {
    outgoing[node.id] = [];
    incoming[node.id] = [];
  });

  edges.forEach(edge => {
    outgoing[edge.source].push(edge.target);
    incoming[edge.target].push(edge.source);

    if (!directed) {
      outgoing[edge.target].push(edge.source);
      incoming[edge.source].push(edge.target);
    }
  });

  // Initialize PageRank
  let pr = {};
  const initialValue = 1 / n;
  nodes.forEach(node => {
    pr[node.id] = initialValue;
  });

  const history = returnHistory ? [{ ...pr }] : [];
  let iterations = 0;

  for (let iter = 0; iter < maxIterations; iter++) {
    const newPr = {};
    let diff = 0;

    nodes.forEach(node => {
      // Sum of PR from incoming nodes
      let sum = 0;
      incoming[node.id].forEach(sourceId => {
        const outDegree = outgoing[sourceId].length;
        if (outDegree > 0) {
          sum += pr[sourceId] / outDegree;
        }
      });

      // Handle dangling nodes (redistribute their PR)
      let danglingSum = 0;
      nodes.forEach(n => {
        if (outgoing[n.id].length === 0) {
          danglingSum += pr[n.id] / n;
        }
      });

      newPr[node.id] = (1 - dampingFactor) / n + dampingFactor * (sum + danglingSum);
      diff += Math.abs(newPr[node.id] - pr[node.id]);
    });

    pr = newPr;
    iterations++;

    if (returnHistory) {
      history.push({ ...pr });
    }

    if (diff < tolerance) break;
  }

  // Normalize to sum to 1
  const total = Object.values(pr).reduce((a, b) => a + b, 0);
  Object.keys(pr).forEach(id => {
    pr[id] /= total;
  });

  return {
    scores: pr,
    iterations,
    history: returnHistory ? history : undefined
  };
}

/**
 * PageRank step by step (for visualization)
 */
export function pageRankStep(graph, currentScores, dampingFactor = 0.85) {
  const { nodes, edges, directed } = graph;
  const n = nodes.length;

  if (n === 0) return {};

  // Build adjacency
  const outgoing = {};
  const incoming = {};

  nodes.forEach(node => {
    outgoing[node.id] = [];
    incoming[node.id] = [];
  });

  edges.forEach(edge => {
    outgoing[edge.source].push(edge.target);
    incoming[edge.target].push(edge.source);

    if (!directed) {
      outgoing[edge.target].push(edge.source);
      incoming[edge.source].push(edge.target);
    }
  });

  const newScores = {};

  nodes.forEach(node => {
    let sum = 0;
    incoming[node.id].forEach(sourceId => {
      const outDegree = outgoing[sourceId].length;
      if (outDegree > 0) {
        sum += currentScores[sourceId] / outDegree;
      }
    });

    newScores[node.id] = (1 - dampingFactor) / n + dampingFactor * sum;
  });

  // Normalize
  const total = Object.values(newScores).reduce((a, b) => a + b, 0);
  Object.keys(newScores).forEach(id => {
    newScores[id] /= total;
  });

  return newScores;
}

/**
 * Label Propagation Algorithm for Community Detection
 */
export function labelPropagation(graph, maxIterations = 100) {
  const { nodes } = graph;
  const adjacency = buildAdjacencyList(graph);

  // Initialize: each node is its own community
  const labels = {};
  nodes.forEach((node, idx) => {
    labels[node.id] = idx;
  });

  for (let iter = 0; iter < maxIterations; iter++) {
    let changed = false;

    // Shuffle nodes for random order
    const shuffled = [...nodes].sort(() => Math.random() - 0.5);

    shuffled.forEach(node => {
      const neighbors = adjacency[node.id];
      if (neighbors.length === 0) return;

      // Count labels of neighbors
      const labelCounts = {};
      neighbors.forEach(neighbor => {
        const label = labels[neighbor];
        labelCounts[label] = (labelCounts[label] || 0) + 1;
      });

      // Find most common label
      let maxCount = 0;
      let maxLabels = [];
      Object.entries(labelCounts).forEach(([label, count]) => {
        if (count > maxCount) {
          maxCount = count;
          maxLabels = [parseInt(label)];
        } else if (count === maxCount) {
          maxLabels.push(parseInt(label));
        }
      });

      // Randomly pick among ties
      const newLabel = maxLabels[Math.floor(Math.random() * maxLabels.length)];

      if (labels[node.id] !== newLabel) {
        labels[node.id] = newLabel;
        changed = true;
      }
    });

    if (!changed) break;
  }

  // Group nodes by label
  const communities = {};
  Object.entries(labels).forEach(([nodeId, label]) => {
    if (!communities[label]) {
      communities[label] = [];
    }
    communities[label].push(nodeId);
  });

  return {
    labels,
    communities: Object.values(communities),
    modularity: calculateModularity(graph, labels)
  };
}

/**
 * Louvain Algorithm for Community Detection
 */
export function louvain(graph) {
  const { nodes, edges } = graph;
  const adjacency = buildAdjacencyList(graph);

  // Calculate total edge weight (2m for undirected)
  const m = edges.length;
  if (m === 0) {
    const labels = {};
    nodes.forEach((node, idx) => {
      labels[node.id] = idx;
    });
    return { labels, communities: nodes.map(n => [n.id]), modularity: 0 };
  }

  // Initialize: each node is its own community
  let labels = {};
  nodes.forEach((node, idx) => {
    labels[node.id] = node.id;
  });

  // Calculate node degrees
  const degrees = {};
  nodes.forEach(node => {
    degrees[node.id] = adjacency[node.id].length;
  });

  let improved = true;
  let iterations = 0;
  const maxIterations = 100;

  while (improved && iterations < maxIterations) {
    improved = false;
    iterations++;

    // Shuffle nodes
    const shuffled = [...nodes].sort(() => Math.random() - 0.5);

    shuffled.forEach(node => {
      const currentCommunity = labels[node.id];

      // Find neighboring communities
      const neighborCommunities = new Set();
      adjacency[node.id].forEach(neighbor => {
        neighborCommunities.add(labels[neighbor]);
      });

      let bestCommunity = currentCommunity;
      let bestGain = 0;

      neighborCommunities.forEach(community => {
        if (community === currentCommunity) return;

        // Calculate modularity gain
        const gain = modularityGain(graph, labels, node.id, community, degrees, m);

        if (gain > bestGain) {
          bestGain = gain;
          bestCommunity = community;
        }
      });

      if (bestGain > 0) {
        labels[node.id] = bestCommunity;
        improved = true;
      }
    });
  }

  // Renumber communities
  const uniqueLabels = [...new Set(Object.values(labels))];
  const labelMap = {};
  uniqueLabels.forEach((label, idx) => {
    labelMap[label] = idx;
  });

  const finalLabels = {};
  Object.entries(labels).forEach(([nodeId, label]) => {
    finalLabels[nodeId] = labelMap[label];
  });

  // Group into communities
  const communities = {};
  Object.entries(finalLabels).forEach(([nodeId, label]) => {
    if (!communities[label]) {
      communities[label] = [];
    }
    communities[label].push(nodeId);
  });

  return {
    labels: finalLabels,
    communities: Object.values(communities),
    modularity: calculateModularity(graph, finalLabels)
  };
}

/**
 * Calculate modularity gain for moving a node to a community
 */
function modularityGain(graph, labels, nodeId, newCommunity, degrees, m) {
  const adjacency = buildAdjacencyList(graph);

  // Edges to new community
  let edgesToNew = 0;
  adjacency[nodeId].forEach(neighbor => {
    if (labels[neighbor] === newCommunity) {
      edgesToNew++;
    }
  });

  // Sum of degrees in new community
  let sumDegreesNew = 0;
  Object.entries(labels).forEach(([id, label]) => {
    if (label === newCommunity) {
      sumDegreesNew += degrees[id];
    }
  });

  const ki = degrees[nodeId];

  return (edgesToNew / m) - (ki * sumDegreesNew) / (2 * m * m);
}

/**
 * Calculate modularity of a partition
 */
export function calculateModularity(graph, labels) {
  const { edges } = graph;
  const m = edges.length;

  if (m === 0) return 0;

  const adjacency = buildAdjacencyList(graph);
  const degrees = {};

  graph.nodes.forEach(node => {
    degrees[node.id] = adjacency[node.id].length;
  });

  let q = 0;

  edges.forEach(edge => {
    const ci = labels[edge.source];
    const cj = labels[edge.target];

    if (ci === cj) {
      const ki = degrees[edge.source];
      const kj = degrees[edge.target];
      q += 1 - (ki * kj) / (2 * m);
    }
  });

  return q / m;
}

/**
 * Girvan-Newman Algorithm (edge betweenness based)
 * Returns steps for visualization
 */
export function girvanNewman(graph, targetCommunities = 2) {
  const steps = [];
  let currentGraph = {
    nodes: [...graph.nodes],
    edges: [...graph.edges],
    directed: graph.directed
  };

  // Initial state
  const components = findConnectedComponents(currentGraph);
  steps.push({
    graph: JSON.parse(JSON.stringify(currentGraph)),
    components: components.length,
    removedEdge: null
  });

  while (components.length < targetCommunities && currentGraph.edges.length > 0) {
    // Calculate edge betweenness
    const betweenness = calculateEdgeBetweenness(currentGraph);

    // Find edge with highest betweenness
    let maxBetweenness = 0;
    let maxEdge = null;

    Object.entries(betweenness).forEach(([edgeId, value]) => {
      if (value > maxBetweenness) {
        maxBetweenness = value;
        maxEdge = edgeId;
      }
    });

    if (!maxEdge) break;

    // Remove the edge
    currentGraph.edges = currentGraph.edges.filter(e => e.id !== maxEdge);

    // Recalculate components
    const newComponents = findConnectedComponents(currentGraph);

    steps.push({
      graph: JSON.parse(JSON.stringify(currentGraph)),
      components: newComponents.length,
      removedEdge: maxEdge,
      betweenness: maxBetweenness
    });

    if (newComponents.length >= targetCommunities) break;
  }

  return steps;
}

/**
 * Calculate edge betweenness for all edges
 */
function calculateEdgeBetweenness(graph) {
  const { nodes, edges } = graph;
  const adjacency = buildAdjacencyList(graph);
  const betweenness = {};

  edges.forEach(edge => {
    betweenness[edge.id] = 0;
  });

  // For each node as source
  nodes.forEach(source => {
    // BFS from source
    const distances = {};
    const numPaths = {};
    const predecessors = {};

    nodes.forEach(node => {
      distances[node.id] = -1;
      numPaths[node.id] = 0;
      predecessors[node.id] = [];
    });

    distances[source.id] = 0;
    numPaths[source.id] = 1;

    const queue = [source.id];
    const stack = [];

    while (queue.length > 0) {
      const current = queue.shift();
      stack.push(current);

      adjacency[current].forEach(neighbor => {
        // First visit
        if (distances[neighbor] === -1) {
          distances[neighbor] = distances[current] + 1;
          queue.push(neighbor);
        }
        // Shortest path
        if (distances[neighbor] === distances[current] + 1) {
          numPaths[neighbor] += numPaths[current];
          predecessors[neighbor].push(current);
        }
      });
    }

    // Accumulate betweenness
    const dependencies = {};
    nodes.forEach(node => {
      dependencies[node.id] = 0;
    });

    while (stack.length > 0) {
      const w = stack.pop();

      predecessors[w].forEach(v => {
        // Find the edge between v and w
        const edge = edges.find(
          e => (e.source === v && e.target === w) || (e.source === w && e.target === v)
        );

        if (edge && numPaths[w] > 0) {
          const contribution = (numPaths[v] / numPaths[w]) * (1 + dependencies[w]);
          dependencies[v] += contribution;
          betweenness[edge.id] += contribution;
        }
      });
    }
  });

  // Normalize (each edge counted twice for undirected)
  if (!graph.directed) {
    Object.keys(betweenness).forEach(edgeId => {
      betweenness[edgeId] /= 2;
    });
  }

  return betweenness;
}

/**
 * BFS Algorithm with step-by-step tracking
 */
export function bfsWithSteps(graph, sourceId, targetId = null) {
  const adjacency = buildAdjacencyList(graph);
  const visited = new Set();
  const distances = {};
  const predecessors = {};
  const steps = [];

  graph.nodes.forEach(node => {
    distances[node.id] = Infinity;
    predecessors[node.id] = null;
  });

  distances[sourceId] = 0;
  const queue = [sourceId];

  steps.push({
    current: sourceId,
    queue: [...queue],
    visited: new Set(visited),
    distances: { ...distances },
    found: false
  });

  while (queue.length > 0) {
    const current = queue.shift();

    if (visited.has(current)) continue;
    visited.add(current);

    if (current === targetId) {
      steps.push({
        current,
        queue: [...queue],
        visited: new Set(visited),
        distances: { ...distances },
        found: true
      });
      break;
    }

    const neighbors = adjacency[current] || [];

    neighbors.forEach(neighbor => {
      if (!visited.has(neighbor) && distances[neighbor] === Infinity) {
        distances[neighbor] = distances[current] + 1;
        predecessors[neighbor] = current;
        queue.push(neighbor);
      }
    });

    steps.push({
      current,
      queue: [...queue],
      visited: new Set(visited),
      distances: { ...distances },
      found: false
    });
  }

  // Reconstruct path if target was found
  let path = null;
  if (targetId && distances[targetId] !== Infinity) {
    path = [];
    let current = targetId;
    while (current !== null) {
      path.unshift(current);
      current = predecessors[current];
    }
  }

  return {
    steps,
    distances,
    path,
    found: targetId ? distances[targetId] !== Infinity : true
  };
}

/**
 * Dijkstra's Algorithm for weighted graphs (with steps)
 */
export function dijkstraWithSteps(graph, sourceId, targetId = null) {
  const { nodes, edges, directed } = graph;
  const distances = {};
  const predecessors = {};
  const visited = new Set();
  const steps = [];

  // Build weighted adjacency
  const adjacency = {};
  nodes.forEach(node => {
    adjacency[node.id] = [];
    distances[node.id] = Infinity;
    predecessors[node.id] = null;
  });

  edges.forEach(edge => {
    const weight = edge.weight || 1;
    adjacency[edge.source].push({ node: edge.target, weight });
    if (!directed) {
      adjacency[edge.target].push({ node: edge.source, weight });
    }
  });

  distances[sourceId] = 0;

  // Priority queue (simple array implementation)
  const pq = [{ id: sourceId, distance: 0 }];

  while (pq.length > 0) {
    // Get node with minimum distance
    pq.sort((a, b) => a.distance - b.distance);
    const { id: current, distance } = pq.shift();

    if (visited.has(current)) continue;
    visited.add(current);

    steps.push({
      current,
      visited: new Set(visited),
      distances: { ...distances },
      found: current === targetId
    });

    if (current === targetId) break;

    adjacency[current].forEach(({ node: neighbor, weight }) => {
      if (!visited.has(neighbor)) {
        const newDist = distances[current] + weight;
        if (newDist < distances[neighbor]) {
          distances[neighbor] = newDist;
          predecessors[neighbor] = current;
          pq.push({ id: neighbor, distance: newDist });
        }
      }
    });
  }

  // Reconstruct path
  let path = null;
  if (targetId && distances[targetId] !== Infinity) {
    path = [];
    let current = targetId;
    while (current !== null) {
      path.unshift(current);
      current = predecessors[current];
    }
  }

  return {
    steps,
    distances,
    path,
    found: targetId ? distances[targetId] !== Infinity : true
  };
}

export default {
  pageRank,
  pageRankStep,
  labelPropagation,
  louvain,
  calculateModularity,
  girvanNewman,
  bfsWithSteps,
  dijkstraWithSteps
};
