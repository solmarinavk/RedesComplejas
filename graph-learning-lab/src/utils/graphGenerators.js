// Graph Generation Models

/**
 * Generate a random ID for nodes
 */
function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Erdős-Rényi G(n,p) model
 * Each pair of nodes is connected with probability p
 */
export function generateErdosRenyi(n, p, options = {}) {
  const { directed = false, weighted = false } = options;
  const nodes = [];
  const edges = [];

  // Create n nodes
  for (let i = 0; i < n; i++) {
    nodes.push({
      id: `node-${i}`,
      label: `${i + 1}`,
      x: Math.random() * 600 + 100,
      y: Math.random() * 400 + 100
    });
  }

  // Connect each pair with probability p
  for (let i = 0; i < n; i++) {
    const jStart = directed ? 0 : i + 1;
    for (let j = jStart; j < n; j++) {
      if (i !== j && Math.random() < p) {
        const edge = {
          id: `edge-${i}-${j}`,
          source: nodes[i].id,
          target: nodes[j].id
        };
        if (weighted) {
          edge.weight = Math.floor(Math.random() * 10) + 1;
        }
        edges.push(edge);
      }
    }
  }

  return { nodes, edges, directed, weighted };
}

/**
 * Calculate theoretical predictions for Erdős-Rényi model
 */
export function erdosRenyiPredictions(n, p) {
  const expectedDegree = p * (n - 1);
  const expectedEdges = p * (n * (n - 1)) / 2;
  const connectivityThreshold = Math.log(n) / n;
  const isLikelyConnected = p > connectivityThreshold;

  return {
    expectedDegree,
    expectedEdges,
    density: p,
    connectivityThreshold,
    isLikelyConnected
  };
}

/**
 * Watts-Strogatz Small World model
 * Creates a ring lattice and rewires edges with probability beta
 */
export function generateWattsStrogatz(n, k, beta, options = {}) {
  const { weighted = false } = options;
  const nodes = [];
  const edges = [];
  const edgeSet = new Set();

  // Create n nodes arranged in a circle
  const radius = Math.min(300, n * 10);
  for (let i = 0; i < n; i++) {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    nodes.push({
      id: `node-${i}`,
      label: `${i + 1}`,
      x: 400 + radius * Math.cos(angle),
      y: 300 + radius * Math.sin(angle)
    });
  }

  // Create ring lattice: connect each node to k/2 neighbors on each side
  const halfK = Math.floor(k / 2);
  const originalEdges = [];

  for (let i = 0; i < n; i++) {
    for (let j = 1; j <= halfK; j++) {
      const neighbor = (i + j) % n;
      const edgeKey = [Math.min(i, neighbor), Math.max(i, neighbor)].join('-');

      if (!edgeSet.has(edgeKey)) {
        edgeSet.add(edgeKey);
        originalEdges.push({
          source: i,
          target: neighbor,
          original: true
        });
      }
    }
  }

  // Rewire edges with probability beta
  const rewiredEdges = [];
  originalEdges.forEach((edge, idx) => {
    if (Math.random() < beta) {
      // Find a new target that doesn't create a duplicate or self-loop
      let newTarget;
      let attempts = 0;
      do {
        newTarget = Math.floor(Math.random() * n);
        attempts++;
      } while (
        (newTarget === edge.source ||
          edgeSet.has([Math.min(edge.source, newTarget), Math.max(edge.source, newTarget)].join('-'))) &&
        attempts < 100
      );

      if (attempts < 100) {
        // Remove old edge from set
        const oldKey = [Math.min(edge.source, edge.target), Math.max(edge.source, edge.target)].join('-');
        edgeSet.delete(oldKey);

        // Add new edge
        const newKey = [Math.min(edge.source, newTarget), Math.max(edge.source, newTarget)].join('-');
        edgeSet.add(newKey);

        rewiredEdges.push({
          id: `edge-${idx}`,
          source: nodes[edge.source].id,
          target: nodes[newTarget].id,
          rewired: true,
          weight: weighted ? Math.floor(Math.random() * 10) + 1 : undefined
        });
      } else {
        rewiredEdges.push({
          id: `edge-${idx}`,
          source: nodes[edge.source].id,
          target: nodes[edge.target].id,
          rewired: false,
          weight: weighted ? Math.floor(Math.random() * 10) + 1 : undefined
        });
      }
    } else {
      rewiredEdges.push({
        id: `edge-${idx}`,
        source: nodes[edge.source].id,
        target: nodes[edge.target].id,
        rewired: false,
        weight: weighted ? Math.floor(Math.random() * 10) + 1 : undefined
      });
    }
  });

  return {
    nodes,
    edges: rewiredEdges,
    directed: false,
    weighted,
    metadata: {
      model: 'watts-strogatz',
      params: { n, k, beta }
    }
  };
}

/**
 * Barabási-Albert Preferential Attachment model
 * New nodes prefer to connect to nodes with high degree
 */
export function generateBarabasiAlbert(n, m, options = {}) {
  const { weighted = false, animated = false } = options;
  const nodes = [];
  const edges = [];
  const degrees = {};

  // Start with a complete graph of m+1 nodes
  const m0 = m + 1;
  for (let i = 0; i < m0; i++) {
    const node = {
      id: `node-${i}`,
      label: `${i + 1}`,
      x: Math.random() * 600 + 100,
      y: Math.random() * 400 + 100,
      addedAt: 0
    };
    nodes.push(node);
    degrees[node.id] = 0;
  }

  // Connect initial nodes in a complete graph
  for (let i = 0; i < m0; i++) {
    for (let j = i + 1; j < m0; j++) {
      const edge = {
        id: `edge-${edges.length}`,
        source: nodes[i].id,
        target: nodes[j].id,
        addedAt: 0
      };
      if (weighted) {
        edge.weight = Math.floor(Math.random() * 10) + 1;
      }
      edges.push(edge);
      degrees[nodes[i].id]++;
      degrees[nodes[j].id]++;
    }
  }

  // Add remaining nodes with preferential attachment
  for (let i = m0; i < n; i++) {
    const newNode = {
      id: `node-${i}`,
      label: `${i + 1}`,
      x: Math.random() * 600 + 100,
      y: Math.random() * 400 + 100,
      addedAt: i - m0 + 1
    };
    nodes.push(newNode);
    degrees[newNode.id] = 0;

    // Calculate total degree
    let totalDegree = Object.values(degrees).reduce((a, b) => a + b, 0);

    // Select m nodes to connect to based on preferential attachment
    const connected = new Set();
    const existingNodes = nodes.slice(0, i);

    while (connected.size < m && connected.size < existingNodes.length) {
      // Roulette wheel selection
      let r = Math.random() * totalDegree;
      let cumulative = 0;

      for (const node of existingNodes) {
        if (connected.has(node.id)) continue;
        cumulative += degrees[node.id] || 1; // Minimum degree of 1 to avoid 0 probability
        if (cumulative >= r) {
          connected.add(node.id);
          break;
        }
      }

      // Fallback: pick random node
      if (connected.size === 0) {
        const randomIdx = Math.floor(Math.random() * existingNodes.length);
        connected.add(existingNodes[randomIdx].id);
      }
    }

    // Create edges
    connected.forEach(targetId => {
      const edge = {
        id: `edge-${edges.length}`,
        source: newNode.id,
        target: targetId,
        addedAt: i - m0 + 1
      };
      if (weighted) {
        edge.weight = Math.floor(Math.random() * 10) + 1;
      }
      edges.push(edge);
      degrees[newNode.id]++;
      degrees[targetId]++;
    });
  }

  return {
    nodes,
    edges,
    directed: false,
    weighted,
    degrees,
    metadata: {
      model: 'barabasi-albert',
      params: { n, m }
    }
  };
}

/**
 * Generate a simple random graph quickly
 */
export function generateQuickRandom(nodeCount = 10, edgeProbability = 0.3) {
  return generateErdosRenyi(nodeCount, edgeProbability);
}

/**
 * Generate a complete graph
 */
export function generateCompleteGraph(n, options = {}) {
  const { weighted = false } = options;
  const nodes = [];
  const edges = [];

  // Create nodes in a circle
  const radius = Math.min(250, n * 15);
  for (let i = 0; i < n; i++) {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    nodes.push({
      id: `node-${i}`,
      label: `${i + 1}`,
      x: 400 + radius * Math.cos(angle),
      y: 300 + radius * Math.sin(angle)
    });
  }

  // Connect every pair
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const edge = {
        id: `edge-${i}-${j}`,
        source: nodes[i].id,
        target: nodes[j].id
      };
      if (weighted) {
        edge.weight = Math.floor(Math.random() * 10) + 1;
      }
      edges.push(edge);
    }
  }

  return { nodes, edges, directed: false, weighted };
}

/**
 * Generate a star graph
 */
export function generateStarGraph(n, options = {}) {
  const { weighted = false } = options;
  const nodes = [];
  const edges = [];

  // Center node
  nodes.push({
    id: 'node-center',
    label: 'C',
    x: 400,
    y: 300
  });

  // Outer nodes in a circle
  const radius = 200;
  for (let i = 0; i < n - 1; i++) {
    const angle = (2 * Math.PI * i) / (n - 1) - Math.PI / 2;
    nodes.push({
      id: `node-${i}`,
      label: `${i + 1}`,
      x: 400 + radius * Math.cos(angle),
      y: 300 + radius * Math.sin(angle)
    });

    // Connect to center
    const edge = {
      id: `edge-center-${i}`,
      source: 'node-center',
      target: `node-${i}`
    };
    if (weighted) {
      edge.weight = Math.floor(Math.random() * 10) + 1;
    }
    edges.push(edge);
  }

  return { nodes, edges, directed: false, weighted };
}

/**
 * Generate a cycle graph
 */
export function generateCycleGraph(n, options = {}) {
  const { weighted = false } = options;
  const nodes = [];
  const edges = [];

  // Create nodes in a circle
  const radius = Math.min(250, n * 15);
  for (let i = 0; i < n; i++) {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    nodes.push({
      id: `node-${i}`,
      label: `${i + 1}`,
      x: 400 + radius * Math.cos(angle),
      y: 300 + radius * Math.sin(angle)
    });
  }

  // Connect in a cycle
  for (let i = 0; i < n; i++) {
    const edge = {
      id: `edge-${i}`,
      source: nodes[i].id,
      target: nodes[(i + 1) % n].id
    };
    if (weighted) {
      edge.weight = Math.floor(Math.random() * 10) + 1;
    }
    edges.push(edge);
  }

  return { nodes, edges, directed: false, weighted };
}

/**
 * Generate a grid graph
 */
export function generateGridGraph(rows, cols, options = {}) {
  const { weighted = false } = options;
  const nodes = [];
  const edges = [];
  const spacing = 60;
  const offsetX = 400 - (cols * spacing) / 2;
  const offsetY = 300 - (rows * spacing) / 2;

  // Create nodes
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      nodes.push({
        id: `node-${r}-${c}`,
        label: `${r * cols + c + 1}`,
        x: offsetX + c * spacing,
        y: offsetY + r * spacing
      });
    }
  }

  // Connect adjacent nodes
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const current = `node-${r}-${c}`;

      // Right neighbor
      if (c < cols - 1) {
        const edge = {
          id: `edge-${r}-${c}-h`,
          source: current,
          target: `node-${r}-${c + 1}`
        };
        if (weighted) {
          edge.weight = Math.floor(Math.random() * 10) + 1;
        }
        edges.push(edge);
      }

      // Bottom neighbor
      if (r < rows - 1) {
        const edge = {
          id: `edge-${r}-${c}-v`,
          source: current,
          target: `node-${r + 1}-${c}`
        };
        if (weighted) {
          edge.weight = Math.floor(Math.random() * 10) + 1;
        }
        edges.push(edge);
      }
    }
  }

  return { nodes, edges, directed: false, weighted };
}

export default {
  generateErdosRenyi,
  erdosRenyiPredictions,
  generateWattsStrogatz,
  generateBarabasiAlbert,
  generateQuickRandom,
  generateCompleteGraph,
  generateStarGraph,
  generateCycleGraph,
  generateGridGraph
};
