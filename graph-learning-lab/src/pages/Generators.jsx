import React, { useState, useMemo } from 'react';
import {
  Dices,
  Play,
  BarChart3,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  TrendingUp,
  Circle
} from 'lucide-react';
import { Slider } from '../components/UI/Slider';
import { GraphCanvas } from '../components/Graph/GraphCanvas';
import { useGraph } from '../contexts/GraphContext';
import {
  generateErdosRenyi,
  erdosRenyiPredictions,
  generateWattsStrogatz,
  generateBarabasiAlbert
} from '../utils/graphGenerators';
import {
  calculateGlobalMetrics,
  degreeDistribution,
  averagePathLength,
  globalClusteringCoefficient
} from '../utils/graphMetrics';

// Erdős-Rényi Generator Component
function ErdosRenyiGenerator() {
  const { dispatch } = useGraph();
  const [n, setN] = useState(20);
  const [p, setP] = useState(0.15);
  const [expanded, setExpanded] = useState(true);
  const [localGraph, setLocalGraph] = useState(null);
  const [realMetrics, setRealMetrics] = useState(null);

  const predictions = useMemo(() => erdosRenyiPredictions(n, p), [n, p]);

  const handleGenerate = () => {
    const graph = generateErdosRenyi(n, p);
    setLocalGraph(graph);
    dispatch({ type: 'LOAD_GRAPH', payload: graph });

    const metrics = calculateGlobalMetrics(graph);
    const distribution = degreeDistribution(graph);
    setRealMetrics({ ...metrics, distribution });
  };

  return (
    <div className="panel overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-slate-700/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Dices className="text-blue-400" size={20} />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-slate-100">Modelo Erdős-Rényi G(n,p)</h3>
            <p className="text-sm text-slate-400">Grafo aleatorio simple</p>
          </div>
        </div>
        {expanded ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
      </button>

      {expanded && (
        <div className="p-4 pt-0 space-y-6">
          {/* Explanation */}
          <div className="p-4 bg-slate-700/30 rounded-lg border-l-4 border-blue-500">
            <h4 className="font-medium text-slate-200 mb-2">Explicación</h4>
            <p className="text-sm text-slate-400">
              El modelo más simple de grafo aleatorio. Dados <strong className="text-cyan-400">n</strong> nodos,
              cada par de nodos se conecta independientemente con probabilidad <strong className="text-cyan-400">p</strong>.
              La distribución de grado resultante sigue aproximadamente una distribución de Poisson.
            </p>
          </div>

          {/* Parameters */}
          <div className="space-y-4">
            <h4 className="font-medium text-slate-300">Parámetros</h4>
            <Slider
              label="n (número de nodos)"
              value={n}
              onChange={setN}
              min={5}
              max={100}
              step={1}
            />
            <Slider
              label="p (probabilidad de conexión)"
              value={p}
              onChange={setP}
              min={0}
              max={1}
              step={0.01}
              formatValue={v => v.toFixed(2)}
            />
          </div>

          {/* Theoretical Predictions */}
          <div className="p-4 bg-slate-900/50 rounded-lg">
            <h4 className="font-medium text-slate-300 mb-3 flex items-center gap-2">
              <TrendingUp size={16} className="text-green-400" />
              Predicciones Teóricas
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-slate-400">Grado esperado:</span>
                <span className="ml-2 font-mono text-cyan-400">⟨k⟩ = {predictions.expectedDegree.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-slate-400">Aristas esperadas:</span>
                <span className="ml-2 font-mono text-cyan-400">{Math.round(predictions.expectedEdges)}</span>
              </div>
              <div>
                <span className="text-slate-400">Umbral conectividad:</span>
                <span className="ml-2 font-mono text-cyan-400">p_c = {predictions.connectivityThreshold.toFixed(4)}</span>
              </div>
              <div>
                <span className="text-slate-400">¿Conexo probable?:</span>
                <span className={`ml-2 font-medium ${predictions.isLikelyConnected ? 'text-green-400' : 'text-amber-400'}`}>
                  {predictions.isLikelyConnected ? 'Sí' : 'No'} (p {predictions.isLikelyConnected ? '>' : '<'} p_c)
                </span>
              </div>
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-400 text-white font-medium rounded-lg transition-colors"
          >
            <Play size={18} />
            Generar Grafo
          </button>

          {/* Real metrics comparison */}
          {realMetrics && (
            <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
              <h4 className="font-medium text-green-400 mb-3 flex items-center gap-2">
                <BarChart3 size={16} />
                Métricas Reales vs Teóricas
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-slate-400">Grado real:</span>
                  <span className="ml-2 font-mono text-white">{realMetrics.averageDegree.toFixed(2)}</span>
                  <span className="text-slate-500 ml-1">(esperado: {predictions.expectedDegree.toFixed(2)})</span>
                </div>
                <div>
                  <span className="text-slate-400">Aristas:</span>
                  <span className="ml-2 font-mono text-white">{realMetrics.edgeCount}</span>
                  <span className="text-slate-500 ml-1">(esperado: {Math.round(predictions.expectedEdges)})</span>
                </div>
                <div>
                  <span className="text-slate-400">Componentes:</span>
                  <span className="ml-2 font-mono text-white">{realMetrics.components}</span>
                </div>
                <div>
                  <span className="text-slate-400">Clustering:</span>
                  <span className="ml-2 font-mono text-white">{realMetrics.clusteringCoefficient.toFixed(3)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Experiment suggestion */}
          <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/30">
            <h4 className="font-medium text-amber-400 mb-2 flex items-center gap-2">
              <Lightbulb size={16} />
              Experimento Sugerido
            </h4>
            <p className="text-sm text-slate-300">
              Genera varios grafos con n=50 y p=0.1. Observa cómo varía el número de componentes conexas.
              ¿Qué pasa cuando aumentas p a 0.15? ¿Y cuando p supera el umbral de conectividad?
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Watts-Strogatz Generator Component
function WattsStrogatzGenerator() {
  const { dispatch } = useGraph();
  const [n, setN] = useState(30);
  const [k, setK] = useState(4);
  const [beta, setBeta] = useState(0.1);
  const [expanded, setExpanded] = useState(false);
  const [localGraph, setLocalGraph] = useState(null);
  const [metricsHistory, setMetricsHistory] = useState([]);

  const handleGenerate = () => {
    const graph = generateWattsStrogatz(n, k, beta);
    setLocalGraph(graph);
    dispatch({ type: 'LOAD_GRAPH', payload: graph });

    const clustering = globalClusteringCoefficient(graph);
    const avgPath = averagePathLength(graph);

    setMetricsHistory(prev => [
      ...prev.slice(-9),
      { beta, clustering, avgPath }
    ]);
  };

  const handleBetaSweep = () => {
    const results = [];
    for (let b = 0; b <= 1; b += 0.1) {
      const graph = generateWattsStrogatz(n, k, b);
      results.push({
        beta: b,
        clustering: globalClusteringCoefficient(graph),
        avgPath: averagePathLength(graph)
      });
    }
    setMetricsHistory(results);

    // Generate final graph with current beta
    handleGenerate();
  };

  return (
    <div className="panel overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-slate-700/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <Circle className="text-green-400" size={20} />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-slate-100">Modelo Watts-Strogatz</h3>
            <p className="text-sm text-slate-400">Redes de Pequeño Mundo</p>
          </div>
        </div>
        {expanded ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
      </button>

      {expanded && (
        <div className="p-4 pt-0 space-y-6">
          {/* Explanation */}
          <div className="p-4 bg-slate-700/30 rounded-lg border-l-4 border-green-500">
            <h4 className="font-medium text-slate-200 mb-2">Explicación</h4>
            <p className="text-sm text-slate-400">
              Comienza con un anillo regular donde cada nodo se conecta a sus <strong className="text-cyan-400">k</strong> vecinos
              más cercanos. Luego, cada arista se reconecta aleatoriamente con probabilidad <strong className="text-cyan-400">β</strong>.
              Esto produce redes con <strong>alto clustering Y caminos cortos</strong> - el fenómeno del "pequeño mundo".
            </p>
          </div>

          {/* Parameters */}
          <div className="space-y-4">
            <h4 className="font-medium text-slate-300">Parámetros</h4>
            <Slider
              label="n (número de nodos)"
              value={n}
              onChange={setN}
              min={10}
              max={100}
              step={1}
            />
            <Slider
              label="k (vecinos iniciales)"
              value={k}
              onChange={(v) => setK(v % 2 === 0 ? v : v + 1)}
              min={2}
              max={10}
              step={2}
            />
            <Slider
              label="β (probabilidad de reconexión)"
              value={beta}
              onChange={setBeta}
              min={0}
              max={1}
              step={0.01}
              formatValue={v => v.toFixed(2)}
            />
          </div>

          {/* Transition explanation */}
          <div className="p-4 bg-slate-900/50 rounded-lg">
            <h4 className="font-medium text-slate-300 mb-2">Transición β=0 → β=1</h4>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex-1 text-center">
                <p className="text-slate-400">β = 0</p>
                <p className="text-green-400 font-medium">Regular</p>
                <p className="text-xs text-slate-500">Alto C, Alto L</p>
              </div>
              <div className="flex-1 text-center border-x border-slate-700 py-2">
                <p className="text-slate-400">β ≈ 0.1</p>
                <p className="text-cyan-400 font-medium">Pequeño Mundo</p>
                <p className="text-xs text-slate-500">Alto C, Bajo L</p>
              </div>
              <div className="flex-1 text-center">
                <p className="text-slate-400">β = 1</p>
                <p className="text-amber-400 font-medium">Aleatorio</p>
                <p className="text-xs text-slate-500">Bajo C, Bajo L</p>
              </div>
            </div>
          </div>

          {/* Generate buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleGenerate}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-400 text-white font-medium rounded-lg transition-colors"
            >
              <Play size={18} />
              Generar
            </button>
            <button
              onClick={handleBetaSweep}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-slate-100 font-medium rounded-lg transition-colors"
              title="Generar para varios valores de β"
            >
              <RefreshCw size={18} />
              Sweep β
            </button>
          </div>

          {/* Metrics history */}
          {metricsHistory.length > 0 && (
            <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
              <h4 className="font-medium text-green-400 mb-3 flex items-center gap-2">
                <BarChart3 size={16} />
                Métricas vs β
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-700">
                      <th className="text-left py-2">β</th>
                      <th className="text-left py-2">Clustering (C)</th>
                      <th className="text-left py-2">Camino medio (L)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metricsHistory.map((m, idx) => (
                      <tr key={idx} className="border-b border-slate-800">
                        <td className="py-2 font-mono text-cyan-400">{m.beta.toFixed(2)}</td>
                        <td className="py-2 font-mono text-white">{m.clustering.toFixed(3)}</td>
                        <td className="py-2 font-mono text-white">{m.avgPath.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Experiment suggestion */}
          <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/30">
            <h4 className="font-medium text-amber-400 mb-2 flex items-center gap-2">
              <Lightbulb size={16} />
              Experimento Sugerido
            </h4>
            <p className="text-sm text-slate-300">
              Con n=30 y k=4, varía β de 0 a 1 lentamente usando el botón "Sweep β".
              Observa cómo con <strong>β≈0.1</strong> ya tienes caminos cortos pero aún alto clustering.
              ¡Este es el "pequeño mundo"!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Barabási-Albert Generator Component
function BarabasiAlbertGenerator() {
  const { dispatch } = useGraph();
  const [n, setN] = useState(50);
  const [m, setM] = useState(2);
  const [expanded, setExpanded] = useState(false);
  const [localGraph, setLocalGraph] = useState(null);
  const [distribution, setDistribution] = useState(null);

  const handleGenerate = () => {
    const graph = generateBarabasiAlbert(n, m);
    setLocalGraph(graph);
    dispatch({ type: 'LOAD_GRAPH', payload: graph });

    // Calculate degree distribution
    const dist = degreeDistribution(graph);
    setDistribution(dist);
  };

  // Find hubs (top 3 highest degree nodes)
  const hubs = useMemo(() => {
    if (!localGraph) return [];

    const degreeCounts = {};
    localGraph.edges.forEach(e => {
      degreeCounts[e.source] = (degreeCounts[e.source] || 0) + 1;
      degreeCounts[e.target] = (degreeCounts[e.target] || 0) + 1;
    });

    return Object.entries(degreeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id, degree]) => {
        const node = localGraph.nodes.find(n => n.id === id);
        return { id, label: node?.label, degree, addedAt: node?.addedAt };
      });
  }, [localGraph]);

  return (
    <div className="panel overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-slate-700/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <TrendingUp className="text-purple-400" size={20} />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-slate-100">Modelo Barabási-Albert</h3>
            <p className="text-sm text-slate-400">Redes de Escala Libre</p>
          </div>
        </div>
        {expanded ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
      </button>

      {expanded && (
        <div className="p-4 pt-0 space-y-6">
          {/* Explanation */}
          <div className="p-4 bg-slate-700/30 rounded-lg border-l-4 border-purple-500">
            <h4 className="font-medium text-slate-200 mb-2">Explicación</h4>
            <p className="text-sm text-slate-400">
              Simula cómo crecen redes reales (internet, redes sociales). Los nodos nuevos
              prefieren conectarse a nodos que ya tienen muchas conexiones -
              <strong className="text-purple-400"> "los ricos se hacen más ricos"</strong> (preferential attachment).
              Esto produce una distribución de grado que sigue una <strong className="text-cyan-400">ley de potencias</strong>: P(k) ~ k⁻³
            </p>
          </div>

          {/* Parameters */}
          <div className="space-y-4">
            <h4 className="font-medium text-slate-300">Parámetros</h4>
            <Slider
              label="n (nodos finales)"
              value={n}
              onChange={setN}
              min={20}
              max={200}
              step={1}
            />
            <Slider
              label="m (aristas por nuevo nodo)"
              value={m}
              onChange={setM}
              min={1}
              max={5}
              step={1}
            />
            <p className="text-xs text-slate-500">
              m₀ (nodos iniciales) = {m + 1} (automático)
            </p>
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-500 hover:bg-purple-400 text-white font-medium rounded-lg transition-colors"
          >
            <Play size={18} />
            Generar Grafo
          </button>

          {/* Degree distribution */}
          {distribution && (
            <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
              <h4 className="font-medium text-purple-400 mb-3 flex items-center gap-2">
                <BarChart3 size={16} />
                Distribución de Grado
              </h4>
              <div className="h-32 flex items-end gap-1">
                {Object.entries(distribution)
                  .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
                  .slice(0, 20)
                  .map(([degree, count]) => (
                    <div
                      key={degree}
                      className="flex-1 bg-purple-500 rounded-t"
                      style={{
                        height: `${(count / Math.max(...Object.values(distribution))) * 100}%`,
                        minWidth: '8px'
                      }}
                      title={`Grado ${degree}: ${count} nodos`}
                    />
                  ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-slate-500">
                <span>k=1</span>
                <span>Distribución de grado (debería seguir ley de potencias)</span>
                <span>k→</span>
              </div>
            </div>
          )}

          {/* Hubs identification */}
          {hubs.length > 0 && (
            <div className="p-4 bg-slate-900/50 rounded-lg">
              <h4 className="font-medium text-slate-300 mb-3">Hubs Identificados (Top 3)</h4>
              <div className="space-y-2">
                {hubs.map((hub, idx) => (
                  <div key={hub.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        idx === 0 ? 'bg-amber-500/20 text-amber-400' :
                        idx === 1 ? 'bg-slate-500/20 text-slate-300' :
                        'bg-orange-900/20 text-orange-400'
                      }`}>
                        {idx + 1}
                      </span>
                      <span className="text-slate-300">Nodo {hub.label}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-cyan-400">grado: {hub.degree}</span>
                      <span className="text-slate-500 ml-2 text-xs">(añadido: paso {hub.addedAt})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Experiment suggestion */}
          <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/30">
            <h4 className="font-medium text-amber-400 mb-2 flex items-center gap-2">
              <Lightbulb size={16} />
              Experimento Sugerido
            </h4>
            <p className="text-sm text-slate-300">
              Genera una red con n=100 y m=2. Identifica los 3 nodos con mayor grado (hubs).
              ¿Son los primeros nodos que se agregaron? <strong>¿Por qué los nodos tempranos tienden a ser hubs?</strong>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Main Generators Page
export function Generators() {
  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Dices className="text-purple-400" size={24} />
            </div>
            <h1 className="text-2xl font-bold text-slate-100">Modelos Generativos</h1>
          </div>
          <p className="text-slate-400">
            Explora cómo se forman diferentes tipos de redes mediante modelos matemáticos.
            Cada modelo produce grafos con propiedades distintivas.
          </p>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Generators */}
          <div className="space-y-4">
            <ErdosRenyiGenerator />
            <WattsStrogatzGenerator />
            <BarabasiAlbertGenerator />
          </div>

          {/* Right: Graph Preview */}
          <div className="lg:sticky lg:top-20 h-fit">
            <div className="panel p-2">
              <GraphCanvas
                width={550}
                height={500}
                layout="force"
              />
            </div>
            <p className="mt-2 text-xs text-slate-500 text-center">
              El grafo generado se muestra aquí y también se carga en el Laboratorio
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Generators;
