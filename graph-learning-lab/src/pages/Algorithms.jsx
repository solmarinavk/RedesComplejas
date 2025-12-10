import React, { useState, useMemo, useCallback } from 'react';
import {
  GitBranch,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  BarChart3,
  Users,
  Route,
  Lightbulb,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Slider } from '../components/UI/Slider';
import { GraphCanvas } from '../components/Graph/GraphCanvas';
import { useGraph } from '../contexts/GraphContext';
import { useAlgorithm } from '../hooks/useAlgorithm';
import {
  pageRank,
  louvain,
  labelPropagation,
  bfsWithSteps
} from '../utils/algorithms';

const COMMUNITY_COLORS = [
  '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'
];

// PageRank Visualizer Component
function PageRankVisualizer() {
  const { state } = useGraph();
  const { nodes, edges, directed } = state;
  const [expanded, setExpanded] = useState(true);
  const [dampingFactor, setDampingFactor] = useState(0.85);
  const [maxIterations, setMaxIterations] = useState(20);
  const [currentIteration, setCurrentIteration] = useState(0);
  const [prHistory, setPrHistory] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  const graph = useMemo(() => ({ nodes, edges, directed }), [nodes, edges, directed]);

  const handleRun = useCallback(() => {
    if (nodes.length === 0) return;

    const result = pageRank(graph, {
      dampingFactor,
      maxIterations,
      returnHistory: true
    });

    setPrHistory(result.history || []);
    setCurrentIteration(result.iterations);
  }, [graph, dampingFactor, maxIterations, nodes.length]);

  const handleStep = useCallback(() => {
    if (currentIteration < prHistory.length - 1) {
      setCurrentIteration(prev => prev + 1);
    }
  }, [currentIteration, prHistory.length]);

  const handleReset = useCallback(() => {
    setCurrentIteration(0);
    setPrHistory([]);
  }, []);

  const currentScores = prHistory[currentIteration] || {};

  // Calculate node sizes based on PageRank
  const nodeSizes = useMemo(() => {
    const sizes = {};
    const maxPr = Math.max(...Object.values(currentScores), 0.01);
    Object.entries(currentScores).forEach(([id, pr]) => {
      sizes[id] = 8 + (pr / maxPr) * 30;
    });
    return sizes;
  }, [currentScores]);

  // Ranking
  const ranking = useMemo(() => {
    return Object.entries(currentScores)
      .sort((a, b) => b[1] - a[1])
      .map(([id, score], idx) => {
        const node = nodes.find(n => n.id === id);
        return { id, label: node?.label || id, score, rank: idx + 1 };
      });
  }, [currentScores, nodes]);

  return (
    <div className="panel overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-slate-700/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/20 rounded-lg">
            <BarChart3 className="text-amber-400" size={20} />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-slate-100">PageRank</h3>
            <p className="text-sm text-slate-400">Algoritmo de importancia de nodos</p>
          </div>
        </div>
        {expanded ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
      </button>

      {expanded && (
        <div className="p-4 pt-0 space-y-4">
          {/* Explanation */}
          <div className="p-4 bg-slate-700/30 rounded-lg border-l-4 border-amber-500">
            <p className="text-sm text-slate-400">
              El algoritmo que hizo famoso a Google. Imagina un <strong className="text-cyan-400">"caminante aleatorio"</strong> que
              navega por los enlaces. PageRank mide la probabilidad de que el caminante esté en cada
              nodo después de infinitos pasos. Los nodos enlazados por nodos importantes serán más importantes.
            </p>
          </div>

          {/* Parameters */}
          <div className="space-y-3">
            <Slider
              label="Factor de amortiguación (d)"
              value={dampingFactor}
              onChange={setDampingFactor}
              min={0.5}
              max={0.99}
              step={0.01}
              formatValue={v => v.toFixed(2)}
            />
            <Slider
              label="Iteraciones máximas"
              value={maxIterations}
              onChange={setMaxIterations}
              min={1}
              max={100}
              step={1}
            />
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            <button
              onClick={handleRun}
              disabled={nodes.length === 0}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
            >
              <Play size={16} />
              Ejecutar
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg transition-colors"
            >
              <RotateCcw size={16} />
            </button>
          </div>

          {/* Iteration progress */}
          {prHistory.length > 0 && (
            <>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setCurrentIteration(Math.max(0, currentIteration - 1))}
                  disabled={currentIteration === 0}
                  className="p-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-lg"
                >
                  <SkipBack size={16} />
                </button>
                <div className="flex-1">
                  <div className="text-center text-sm text-slate-400 mb-1">
                    Iteración {currentIteration} / {prHistory.length - 1}
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={prHistory.length - 1}
                    value={currentIteration}
                    onChange={(e) => setCurrentIteration(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                <button
                  onClick={handleStep}
                  disabled={currentIteration >= prHistory.length - 1}
                  className="p-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-lg"
                >
                  <SkipForward size={16} />
                </button>
              </div>

              {/* Ranking table */}
              <div className="max-h-48 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-slate-800">
                    <tr className="text-slate-400 border-b border-slate-700">
                      <th className="text-left py-2 px-2">#</th>
                      <th className="text-left py-2">Nodo</th>
                      <th className="text-right py-2 px-2">PageRank</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ranking.slice(0, 10).map(item => (
                      <tr key={item.id} className="border-b border-slate-800">
                        <td className="py-2 px-2 text-slate-500">{item.rank}</td>
                        <td className="py-2 font-medium text-slate-300">{item.label}</td>
                        <td className="py-2 px-2 text-right font-mono text-cyan-400">
                          {item.score.toFixed(4)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Experiment */}
          <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/30">
            <p className="text-sm text-slate-300">
              <Lightbulb size={14} className="inline text-amber-400 mr-1" />
              <strong>Experimento:</strong> Crea un grafo en forma de estrella (un nodo central conectado a todos).
              ¿Cuál nodo tiene mayor PageRank? ¿El centro o los externos? ¿Por qué?
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Community Detection Component
function CommunityDetector() {
  const { state, dispatch } = useGraph();
  const { nodes, edges, directed } = state;
  const [expanded, setExpanded] = useState(false);
  const [algorithm, setAlgorithm] = useState('louvain');
  const [communities, setCommunities] = useState(null);
  const [nodeColors, setNodeColors] = useState({});

  const graph = useMemo(() => ({ nodes, edges, directed }), [nodes, edges, directed]);

  const handleDetect = useCallback(() => {
    if (nodes.length === 0) return;

    let result;
    if (algorithm === 'louvain') {
      result = louvain(graph);
    } else {
      result = labelPropagation(graph);
    }

    setCommunities(result);

    // Assign colors to nodes
    const colors = {};
    Object.entries(result.labels).forEach(([nodeId, communityIdx]) => {
      colors[nodeId] = COMMUNITY_COLORS[communityIdx % COMMUNITY_COLORS.length];
    });
    setNodeColors(colors);
  }, [graph, algorithm, nodes.length]);

  const handleReset = useCallback(() => {
    setCommunities(null);
    setNodeColors({});
  }, []);

  return (
    <div className="panel overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-slate-700/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <Users className="text-green-400" size={20} />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-slate-100">Detección de Comunidades</h3>
            <p className="text-sm text-slate-400">Encontrar grupos en la red</p>
          </div>
        </div>
        {expanded ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
      </button>

      {expanded && (
        <div className="p-4 pt-0 space-y-4">
          {/* Explanation */}
          <div className="p-4 bg-slate-700/30 rounded-lg border-l-4 border-green-500">
            <p className="text-sm text-slate-400">
              Las comunidades son grupos de nodos más densamente conectados entre sí que con el resto
              de la red. Son como <strong className="text-cyan-400">"clusters" naturales</strong>.
              La <strong>modularidad Q</strong> mide la calidad de la partición (mayor es mejor).
            </p>
          </div>

          {/* Algorithm selection */}
          <div>
            <label className="text-sm text-slate-300 mb-2 block">Algoritmo</label>
            <div className="flex gap-2">
              <button
                onClick={() => setAlgorithm('louvain')}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  algorithm === 'louvain'
                    ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                    : 'bg-slate-700 text-slate-300 border border-slate-600'
                }`}
              >
                Louvain
              </button>
              <button
                onClick={() => setAlgorithm('labelPropagation')}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  algorithm === 'labelPropagation'
                    ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                    : 'bg-slate-700 text-slate-300 border border-slate-600'
                }`}
              >
                Label Propagation
              </button>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            <button
              onClick={handleDetect}
              disabled={nodes.length === 0}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-400 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
            >
              <Play size={16} />
              Detectar
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg transition-colors"
            >
              <RotateCcw size={16} />
            </button>
          </div>

          {/* Results */}
          {communities && (
            <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Comunidades encontradas:</span>
                <span className="font-bold text-green-400">{communities.communities.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Modularidad Q:</span>
                <span className="font-mono text-cyan-400">{communities.modularity.toFixed(4)}</span>
              </div>

              {/* Community sizes */}
              <div className="space-y-2">
                <p className="text-sm text-slate-400">Tamaño de comunidades:</p>
                <div className="flex flex-wrap gap-2">
                  {communities.communities.map((comm, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${COMMUNITY_COLORS[idx % COMMUNITY_COLORS.length]}20`,
                        color: COMMUNITY_COLORS[idx % COMMUNITY_COLORS.length],
                        border: `1px solid ${COMMUNITY_COLORS[idx % COMMUNITY_COLORS.length]}50`
                      }}
                    >
                      C{idx + 1}: {comm.length} nodos
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pass colors to parent */}
      {Object.keys(nodeColors).length > 0 && (
        <div className="hidden" data-node-colors={JSON.stringify(nodeColors)} />
      )}
    </div>
  );
}

// Shortest Path Component
function ShortestPathFinder() {
  const { state, dispatch } = useGraph();
  const { nodes, edges, directed, selectedNode } = state;
  const [expanded, setExpanded] = useState(false);
  const [sourceNode, setSourceNode] = useState('');
  const [targetNode, setTargetNode] = useState('');
  const [result, setResult] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);

  const graph = useMemo(() => ({ nodes, edges, directed }), [nodes, edges, directed]);

  const handleFind = useCallback(() => {
    if (!sourceNode || !targetNode) return;

    const bfsResult = bfsWithSteps(graph, sourceNode, targetNode);
    setResult(bfsResult);
    setCurrentStep(bfsResult.steps.length - 1);
  }, [graph, sourceNode, targetNode]);

  const handleReset = useCallback(() => {
    setResult(null);
    setCurrentStep(0);
    setSourceNode('');
    setTargetNode('');
  }, []);

  // Use selected node as source
  React.useEffect(() => {
    if (selectedNode && !sourceNode) {
      setSourceNode(selectedNode);
    }
  }, [selectedNode, sourceNode]);

  // Highlighted nodes and edges
  const highlightedNodes = useMemo(() => {
    if (!result) return [];
    if (result.path) return result.path;
    return [];
  }, [result]);

  const highlightedEdges = useMemo(() => {
    if (!result?.path) return [];
    const edgeIds = [];
    for (let i = 0; i < result.path.length - 1; i++) {
      const source = result.path[i];
      const target = result.path[i + 1];
      const edge = edges.find(e =>
        (e.source === source && e.target === target) ||
        (!directed && e.source === target && e.target === source)
      );
      if (edge) edgeIds.push(edge.id);
    }
    return edgeIds;
  }, [result, edges, directed]);

  return (
    <div className="panel overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-slate-700/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Route className="text-blue-400" size={20} />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-slate-100">Camino Más Corto</h3>
            <p className="text-sm text-slate-400">BFS / Dijkstra</p>
          </div>
        </div>
        {expanded ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
      </button>

      {expanded && (
        <div className="p-4 pt-0 space-y-4">
          {/* Explanation */}
          <div className="p-4 bg-slate-700/30 rounded-lg border-l-4 border-blue-500">
            <p className="text-sm text-slate-400">
              El problema fundamental en grafos: encontrar la ruta más corta entre dos nodos.
              <strong className="text-cyan-400"> BFS</strong> encuentra el camino con menos aristas.
              Para grafos ponderados, usa <strong className="text-cyan-400">Dijkstra</strong>.
            </p>
          </div>

          {/* Node selection */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-slate-300 mb-1 block">Nodo origen</label>
              <select
                value={sourceNode}
                onChange={(e) => setSourceNode(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 text-sm"
              >
                <option value="">Seleccionar...</option>
                {nodes.map(n => (
                  <option key={n.id} value={n.id}>{n.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-300 mb-1 block">Nodo destino</label>
              <select
                value={targetNode}
                onChange={(e) => setTargetNode(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 text-sm"
              >
                <option value="">Seleccionar...</option>
                {nodes.map(n => (
                  <option key={n.id} value={n.id}>{n.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            <button
              onClick={handleFind}
              disabled={!sourceNode || !targetNode}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
            >
              <Play size={16} />
              Buscar Camino
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg transition-colors"
            >
              <RotateCcw size={16} />
            </button>
          </div>

          {/* Results */}
          {result && (
            <div className={`p-4 rounded-lg border ${
              result.found
                ? 'bg-green-500/10 border-green-500/30'
                : 'bg-red-500/10 border-red-500/30'
            }`}>
              {result.found ? (
                <>
                  <p className="text-green-400 font-medium mb-2">¡Camino encontrado!</p>
                  <div className="space-y-2 text-sm">
                    <p className="text-slate-300">
                      <span className="text-slate-400">Distancia:</span>{' '}
                      <span className="font-mono text-cyan-400">{result.path.length - 1} aristas</span>
                    </p>
                    <p className="text-slate-300">
                      <span className="text-slate-400">Camino:</span>{' '}
                      <span className="font-mono text-cyan-400">
                        {result.path.map(id => nodes.find(n => n.id === id)?.label).join(' → ')}
                      </span>
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-red-400">No existe camino entre los nodos seleccionados.</p>
              )}
            </div>
          )}

          {/* Experiment */}
          <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/30">
            <p className="text-sm text-slate-300">
              <Lightbulb size={14} className="inline text-amber-400 mr-1" />
              <strong>Experimento:</strong> En una red de pequeño mundo, ¿cuántos pasos en promedio
              hay entre dos nodos cualquiera? Compara con una red regular.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Main Algorithms Page
export function Algorithms() {
  const { state } = useGraph();
  const [activeAlgorithm, setActiveAlgorithm] = useState(null);
  const [nodeColors, setNodeColors] = useState({});
  const [nodeSizes, setNodeSizes] = useState({});
  const [highlightedNodes, setHighlightedNodes] = useState([]);
  const [highlightedEdges, setHighlightedEdges] = useState([]);

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <GitBranch className="text-cyan-400" size={24} />
            </div>
            <h1 className="text-2xl font-bold text-slate-100">Algoritmos Interactivos</h1>
          </div>
          <p className="text-slate-400">
            Visualiza paso a paso cómo funcionan los algoritmos más importantes en teoría de grafos.
            Crea un grafo en el Laboratorio y luego experimenta aquí.
          </p>
        </div>

        {/* Warning if no graph */}
        {state.nodes.length === 0 && (
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <p className="text-amber-400">
              No hay grafo cargado. Ve al <strong>Laboratorio</strong> o a <strong>Modelos Generativos</strong> para crear uno.
            </p>
          </div>
        )}

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Algorithm controls */}
          <div className="space-y-4">
            <PageRankVisualizer />
            <CommunityDetector />
            <ShortestPathFinder />
          </div>

          {/* Right: Graph visualization */}
          <div className="lg:sticky lg:top-20 h-fit">
            <div className="panel p-2">
              <GraphCanvas
                width={550}
                height={500}
                nodeColors={nodeColors}
                nodeSizes={nodeSizes}
                highlightedNodes={highlightedNodes}
                highlightedEdges={highlightedEdges}
              />
            </div>
            <p className="mt-2 text-xs text-slate-500 text-center">
              Los resultados de los algoritmos se visualizan aquí
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Algorithms;
