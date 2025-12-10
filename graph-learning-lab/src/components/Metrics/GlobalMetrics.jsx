import React from 'react';
import {
  Circle,
  Link2,
  Percent,
  Activity,
  Ruler,
  Target,
  Share2,
  Layers
} from 'lucide-react';
import { MetricTooltip } from '../UI/Tooltip';
import { useMetrics } from '../../hooks/useMetrics';

const metricDefinitions = {
  nodeCount: {
    title: 'Número de Nodos',
    formula: 'n = |V|',
    explanation: 'El número total de vértices (nodos) en el grafo.',
    example: 'En una red social, cada persona sería un nodo.'
  },
  edgeCount: {
    title: 'Número de Aristas',
    formula: 'm = |E|',
    explanation: 'El número total de conexiones (aristas) entre nodos.',
    example: 'En una red social, cada amistad sería una arista.'
  },
  density: {
    title: 'Densidad',
    formula: 'D = 2m / (n(n-1))',
    explanation: 'La proporción de aristas existentes respecto al máximo posible. Varía entre 0 (sin aristas) y 1 (grafo completo).',
    example: 'Una densidad de 0.5 significa que existen la mitad de todas las conexiones posibles.'
  },
  averageDegree: {
    title: 'Grado Promedio',
    formula: '⟨k⟩ = 2m / n',
    explanation: 'El número promedio de conexiones por nodo.',
    example: 'Si el grado promedio es 3, cada persona tiene en promedio 3 amigos.'
  },
  diameter: {
    title: 'Diámetro',
    formula: 'd = max{d(u,v) : u,v ∈ V}',
    explanation: 'La distancia máxima entre cualquier par de nodos conectados. Representa el "tamaño" del grafo.',
    example: 'Un diámetro de 6 significa que cualquier par de nodos está conectado en máximo 6 pasos.'
  },
  radius: {
    title: 'Radio',
    formula: 'r = min{e(v) : v ∈ V}',
    explanation: 'La excentricidad mínima de todos los nodos. Es la distancia máxima desde el nodo más "central".',
    example: 'Un radio de 3 indica que existe al menos un nodo desde el cual todos los demás están a máximo 3 pasos.'
  },
  averagePathLength: {
    title: 'Longitud Promedio de Camino',
    formula: 'L = (1/n(n-1)) Σ d(u,v)',
    explanation: 'La distancia promedio entre todos los pares de nodos. Indica qué tan "conectado" está el grafo.',
    example: 'En redes sociales reales, este valor suele ser sorprendentemente pequeño (~6 grados de separación).'
  },
  clusteringCoefficient: {
    title: 'Coeficiente de Clustering Global',
    formula: 'C = 3 × triángulos / tripletas',
    explanation: 'Mide la tendencia de los nodos a formar grupos cerrados. Indica qué tan "agrupados" están los vecinos.',
    example: 'Un clustering alto indica que "los amigos de tus amigos probablemente también son tus amigos".'
  },
  components: {
    title: 'Componentes Conexas',
    formula: '-',
    explanation: 'El número de subgrafos conectados independientes. Un grafo conexo tiene exactamente 1 componente.',
    example: 'Si hay 2 componentes, significa que el grafo está dividido en 2 partes sin conexión entre ellas.'
  }
};

export function GlobalMetrics() {
  const { globalMetrics } = useMetrics();

  const metrics = [
    { key: 'nodeCount', icon: Circle, label: 'Nodos', value: globalMetrics.nodeCount, format: v => v },
    { key: 'edgeCount', icon: Link2, label: 'Aristas', value: globalMetrics.edgeCount, format: v => v },
    { key: 'density', icon: Percent, label: 'Densidad', value: globalMetrics.density, format: v => v.toFixed(3) },
    { key: 'averageDegree', icon: Activity, label: 'Grado promedio', value: globalMetrics.averageDegree, format: v => v.toFixed(2) },
    { key: 'diameter', icon: Ruler, label: 'Diámetro', value: globalMetrics.diameter, format: v => v === Infinity ? '∞' : v },
    { key: 'radius', icon: Target, label: 'Radio', value: globalMetrics.radius, format: v => v === Infinity ? '∞' : v },
    { key: 'averagePathLength', icon: Share2, label: 'Camino promedio', value: globalMetrics.averagePathLength, format: v => v.toFixed(2) },
    { key: 'clusteringCoefficient', icon: Layers, label: 'Clustering', value: globalMetrics.clusteringCoefficient, format: v => v.toFixed(3) },
    { key: 'components', icon: Layers, label: 'Componentes', value: globalMetrics.components, format: v => v }
  ];

  return (
    <div className="panel p-4">
      <h3 className="font-semibold text-slate-100 mb-4 flex items-center gap-2">
        <Activity size={18} className="text-cyan-400" />
        Métricas Globales
      </h3>

      <div className="space-y-3">
        {metrics.map(({ key, icon: Icon, label, value, format }) => (
          <div key={key} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon size={14} className="text-slate-400" />
              <span className="text-sm text-slate-300">{label}</span>
              <MetricTooltip {...metricDefinitions[key]} />
            </div>
            <span className="text-sm font-mono text-cyan-400">
              {format(value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GlobalMetrics;
