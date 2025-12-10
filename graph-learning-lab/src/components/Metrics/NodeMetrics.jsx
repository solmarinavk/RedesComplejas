import React, { useMemo } from 'react';
import { User, Activity, Target, GitBranch, Layers } from 'lucide-react';
import { MetricTooltip } from '../UI/Tooltip';
import { useGraph } from '../../contexts/GraphContext';
import { useMetrics } from '../../hooks/useMetrics';
import { pageRank } from '../../utils/algorithms';

const metricDefinitions = {
  degree: {
    title: 'Grado',
    formula: 'k(v) = |{u : (v,u) ∈ E}|',
    explanation: 'El número de aristas conectadas al nodo. En grafos dirigidos se divide en grado de entrada (aristas que llegan) y grado de salida (aristas que salen).',
    example: 'Un nodo con grado 5 tiene 5 conexiones directas con otros nodos.'
  },
  clustering: {
    title: 'Clustering Local',
    formula: 'C(v) = 2T(v) / (k(v)(k(v)-1))',
    explanation: 'Mide qué tan conectados están los vecinos de un nodo entre sí. T(v) es el número de triángulos que incluyen al nodo.',
    example: 'Si todos tus amigos son amigos entre sí, tu clustering local es 1.'
  },
  degreeCentrality: {
    title: 'Centralidad de Grado',
    formula: 'C_D(v) = k(v) / (n-1)',
    explanation: 'La fracción de nodos a los que este nodo está conectado directamente. Normalizado entre 0 y 1.',
    example: 'Una centralidad de grado de 0.5 significa que el nodo está conectado a la mitad de todos los nodos.'
  },
  closenessCentrality: {
    title: 'Centralidad de Cercanía',
    formula: 'C_C(v) = (n-1) / Σd(v,u)',
    explanation: 'Qué tan cerca está este nodo de todos los demás. Nodos con alta cercanía pueden alcanzar a otros nodos rápidamente.',
    example: 'Un nodo con alta cercanía es como una estación de metro central: puedes llegar a cualquier lugar rápidamente.'
  },
  betweennessCentrality: {
    title: 'Centralidad de Intermediación',
    formula: 'C_B(v) = Σ σ_st(v)/σ_st',
    explanation: 'La proporción de caminos más cortos entre otros pares de nodos que pasan por este nodo. Indica qué tan "puente" es el nodo.',
    example: 'Un nodo con alta intermediación es un punto de paso obligatorio para la comunicación entre muchos otros nodos.'
  },
  pageRank: {
    title: 'PageRank',
    formula: 'PR(v) = (1-d)/n + d Σ PR(u)/L(u)',
    explanation: 'La probabilidad de que un "caminante aleatorio" esté en este nodo. Considera no solo cuántas conexiones tiene, sino también la importancia de los nodos que lo enlazan.',
    example: 'Un nodo enlazado por muchos nodos importantes tendrá alto PageRank (el algoritmo original de Google).'
  }
};

export function NodeMetrics() {
  const { state } = useGraph();
  const { selectedNode, nodes, directed } = state;
  const { getNodeMetrics, graph } = useMetrics();

  const nodeData = useMemo(() => {
    if (!selectedNode) return null;

    const node = nodes.find(n => n.id === selectedNode);
    if (!node) return null;

    const metrics = getNodeMetrics(selectedNode);
    if (!metrics) return null;

    // Calculate PageRank
    const pr = pageRank(graph);
    const nodePageRank = pr.scores[selectedNode] || 0;

    return {
      node,
      metrics,
      pageRank: nodePageRank
    };
  }, [selectedNode, nodes, getNodeMetrics, graph]);

  if (!nodeData) {
    return (
      <div className="panel p-4">
        <h3 className="font-semibold text-slate-100 mb-4 flex items-center gap-2">
          <User size={18} className="text-cyan-400" />
          Nodo Seleccionado
        </h3>
        <p className="text-sm text-slate-400 italic">
          Selecciona un nodo para ver sus métricas
        </p>
      </div>
    );
  }

  const { node, metrics, pageRank: nodePageRank } = nodeData;

  return (
    <div className="panel p-4">
      <h3 className="font-semibold text-slate-100 mb-4 flex items-center gap-2">
        <User size={18} className="text-cyan-400" />
        Nodo Seleccionado
      </h3>

      <div className="mb-4 p-3 bg-slate-700/50 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-400 font-bold">
            {node.label}
          </div>
          <div>
            <p className="font-medium text-slate-200">Nodo {node.label}</p>
            <p className="text-xs text-slate-400 font-mono">{node.id}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {/* Degree */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-slate-400" />
            <span className="text-sm text-slate-300">Grado</span>
            <MetricTooltip {...metricDefinitions.degree} />
          </div>
          <span className="text-sm font-mono text-cyan-400">
            {directed
              ? `${metrics.degree.total} (↓${metrics.degree.in} ↑${metrics.degree.out})`
              : metrics.degree.total
            }
          </span>
        </div>

        {/* Clustering */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers size={14} className="text-slate-400" />
            <span className="text-sm text-slate-300">Clustering local</span>
            <MetricTooltip {...metricDefinitions.clustering} />
          </div>
          <span className="text-sm font-mono text-cyan-400">
            {metrics.clustering.toFixed(3)}
          </span>
        </div>

        {/* Degree Centrality */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target size={14} className="text-slate-400" />
            <span className="text-sm text-slate-300">C. de grado</span>
            <MetricTooltip {...metricDefinitions.degreeCentrality} />
          </div>
          <span className="text-sm font-mono text-cyan-400">
            {metrics.degreeCentrality.toFixed(3)}
          </span>
        </div>

        {/* Closeness Centrality */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target size={14} className="text-slate-400" />
            <span className="text-sm text-slate-300">C. de cercanía</span>
            <MetricTooltip {...metricDefinitions.closenessCentrality} />
          </div>
          <span className="text-sm font-mono text-cyan-400">
            {metrics.closenessCentrality.toFixed(3)}
          </span>
        </div>

        {/* Betweenness Centrality */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch size={14} className="text-slate-400" />
            <span className="text-sm text-slate-300">C. intermediación</span>
            <MetricTooltip {...metricDefinitions.betweennessCentrality} />
          </div>
          <span className="text-sm font-mono text-cyan-400">
            {metrics.betweennessCentrality.toFixed(3)}
          </span>
        </div>

        {/* PageRank */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-slate-400" />
            <span className="text-sm text-slate-300">PageRank</span>
            <MetricTooltip {...metricDefinitions.pageRank} />
          </div>
          <span className="text-sm font-mono text-cyan-400">
            {nodePageRank.toFixed(4)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default NodeMetrics;
