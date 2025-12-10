import React, { useState } from 'react';
import {
  FileText,
  Circle,
  Link2,
  Activity,
  Target,
  Layers,
  GitBranch,
  Network,
  ChevronDown,
  ChevronUp,
  BookOpen
} from 'lucide-react';

const sections = [
  {
    id: 'node-metrics',
    title: 'Métricas de Nodos',
    icon: Circle,
    items: [
      {
        name: 'Grado',
        symbol: 'k(v)',
        formula: 'k(v) = |{u : (v,u) ∈ E}|',
        description: 'Número de aristas incidentes al nodo. En grafos dirigidos se divide en grado de entrada (in-degree) y grado de salida (out-degree).',
        example: 'Un nodo con 5 conexiones tiene grado 5.'
      },
      {
        name: 'Coeficiente de Clustering Local',
        symbol: 'C(v)',
        formula: 'C(v) = 2T(v) / (k(v) × (k(v)-1))',
        description: 'Proporción de pares de vecinos que están conectados entre sí. T(v) es el número de triángulos que incluyen al nodo v.',
        example: 'Si tienes 4 amigos y 3 parejas de ellos son amigos entre sí, C = 2×3/(4×3) = 0.5'
      },
      {
        name: 'Centralidad de Grado',
        symbol: 'C_D(v)',
        formula: 'C_D(v) = k(v) / (n-1)',
        description: 'Fracción de nodos a los que v está conectado directamente. Normalizado entre 0 y 1.',
        example: 'En un grafo de 10 nodos, si un nodo tiene 4 conexiones, C_D = 4/9 ≈ 0.44'
      },
      {
        name: 'Centralidad de Cercanía',
        symbol: 'C_C(v)',
        formula: 'C_C(v) = (n-1) / Σ d(v,u)',
        description: 'Inverso de la suma de distancias a todos los demás nodos. Nodos con alta cercanía pueden alcanzar a otros rápidamente.',
        example: 'Un nodo central en una red tiene alta cercanía porque está a pocas aristas de todos.'
      },
      {
        name: 'Centralidad de Intermediación',
        symbol: 'C_B(v)',
        formula: 'C_B(v) = Σ σ_st(v) / σ_st',
        description: 'Proporción de caminos más cortos entre otros pares de nodos que pasan por v. σ_st es el número de caminos más cortos entre s y t.',
        example: 'Un "puente" entre dos comunidades tendrá alta intermediación.'
      },
      {
        name: 'PageRank',
        symbol: 'PR(v)',
        formula: 'PR(v) = (1-d)/n + d × Σ PR(u)/L(u)',
        description: 'Probabilidad de que un caminante aleatorio esté en el nodo v. d es el factor de amortiguación (típicamente 0.85), L(u) es el grado de salida de u.',
        example: 'El algoritmo original de Google para ordenar páginas web por importancia.'
      }
    ]
  },
  {
    id: 'graph-metrics',
    title: 'Métricas de Red',
    icon: Network,
    items: [
      {
        name: 'Densidad',
        symbol: 'D',
        formula: 'D = 2m / (n × (n-1))  [no dirigido]',
        description: 'Proporción de aristas existentes respecto al máximo posible. D=1 es un grafo completo, D=0 no tiene aristas.',
        example: 'Un grafo con 10 nodos y 20 aristas tiene D = 40/90 ≈ 0.44'
      },
      {
        name: 'Grado Promedio',
        symbol: '⟨k⟩',
        formula: '⟨k⟩ = 2m / n',
        description: 'Número promedio de conexiones por nodo.',
        example: 'Con 10 nodos y 15 aristas, ⟨k⟩ = 30/10 = 3'
      },
      {
        name: 'Coeficiente de Clustering Global',
        symbol: 'C',
        formula: 'C = 3 × triángulos / tripletas conectadas',
        description: 'Medida global de la tendencia a formar triángulos. Una tripleta conectada son 3 nodos con al menos 2 aristas.',
        example: 'Redes sociales típicamente tienen C entre 0.1 y 0.5'
      },
      {
        name: 'Diámetro',
        symbol: 'd',
        formula: 'd = max{d(u,v) : u,v ∈ V}',
        description: 'Máxima distancia entre cualquier par de nodos en la componente conexa más grande.',
        example: 'Un diámetro de 6 significa que cualquier par está a máximo 6 pasos.'
      },
      {
        name: 'Radio',
        symbol: 'r',
        formula: 'r = min{e(v) : v ∈ V}',
        description: 'Mínima excentricidad. La excentricidad e(v) es la máxima distancia desde v a cualquier otro nodo.',
        example: 'El centro del grafo tiene excentricidad igual al radio.'
      },
      {
        name: 'Longitud Promedio de Camino',
        symbol: 'L',
        formula: 'L = (1/(n(n-1))) × Σ d(u,v)',
        description: 'Distancia promedio entre todos los pares de nodos conectados.',
        example: 'En redes de pequeño mundo, L es sorprendentemente pequeño.'
      },
      {
        name: 'Modularidad',
        symbol: 'Q',
        formula: 'Q = (1/2m) × Σ [A_ij - k_i×k_j/2m] × δ(c_i,c_j)',
        description: 'Calidad de una partición en comunidades. Q cerca de 1 indica buena estructura comunitaria.',
        example: 'Un valor Q > 0.3 generalmente indica estructura comunitaria significativa.'
      }
    ]
  },
  {
    id: 'models',
    title: 'Modelos Generativos',
    icon: Layers,
    items: [
      {
        name: 'Erdős-Rényi G(n,p)',
        symbol: '-',
        formula: 'P(arista entre u,v) = p',
        description: 'Cada par de nodos se conecta independientemente con probabilidad p. Produce distribución de grado tipo Poisson.',
        properties: [
          'Grado esperado: ⟨k⟩ = p(n-1)',
          'Umbral de conectividad: p_c = ln(n)/n',
          'Distribución de grado: P(k) ~ Poisson(⟨k⟩)',
          'Clustering: C ~ p (muy bajo para n grande)'
        ]
      },
      {
        name: 'Watts-Strogatz',
        symbol: '-',
        formula: 'Reconexión con probabilidad β',
        description: 'Comienza con anillo regular de k vecinos, reconecta aristas con probabilidad β. Produce redes de pequeño mundo.',
        properties: [
          'β=0: Red regular (alto C, alto L)',
          'β≈0.1: Pequeño mundo (alto C, bajo L)',
          'β=1: Red aleatoria (bajo C, bajo L)',
          'Transición rápida de L, lenta de C'
        ]
      },
      {
        name: 'Barabási-Albert',
        symbol: '-',
        formula: 'P(conexión a v) ∝ k(v)',
        description: 'Crecimiento con preferential attachment. Nodos nuevos prefieren conectarse a nodos con alto grado.',
        properties: [
          'Distribución de grado: P(k) ~ k^(-3)',
          'Red de escala libre',
          'Formación de hubs',
          'No tiene clustering alto intrínsecamente'
        ]
      }
    ]
  },
  {
    id: 'algorithms',
    title: 'Algoritmos',
    icon: GitBranch,
    items: [
      {
        name: 'BFS (Breadth-First Search)',
        complexity: 'O(n + m)',
        formula: '-',
        description: 'Recorre el grafo por niveles desde un nodo fuente. Encuentra caminos más cortos en grafos no ponderados.',
        steps: [
          'Inicializa cola con nodo fuente',
          'Extrae nodo de cola, marca como visitado',
          'Agrega vecinos no visitados a la cola',
          'Repite hasta cola vacía'
        ]
      },
      {
        name: 'Dijkstra',
        complexity: 'O((n + m) log n)',
        formula: '-',
        description: 'Encuentra caminos más cortos en grafos ponderados con pesos no negativos.',
        steps: [
          'Inicializa distancias a infinito, fuente a 0',
          'Extrae nodo con menor distancia tentativa',
          'Actualiza distancias de vecinos si hay mejora',
          'Repite hasta procesar todos los nodos'
        ]
      },
      {
        name: 'PageRank',
        complexity: 'O(m × iteraciones)',
        formula: 'PR(v) = (1-d)/n + d × Σ PR(u)/L(u)',
        description: 'Calcula importancia de nodos basada en caminata aleatoria.',
        steps: [
          'Inicializa PR(v) = 1/n para todos',
          'Itera: PR_nuevo(v) = (1-d)/n + d × Σ PR(u)/L(u)',
          'Normaliza valores',
          'Repite hasta convergencia'
        ]
      },
      {
        name: 'Louvain (Detección de Comunidades)',
        complexity: 'O(n log n)',
        formula: 'Maximiza modularidad Q',
        description: 'Algoritmo voraz que optimiza modularidad en dos fases: optimización local y agregación.',
        steps: [
          'Cada nodo es su propia comunidad',
          'Mueve nodos a comunidad vecina que maximice ΔQ',
          'Cuando no hay mejora, agrega comunidades',
          'Repite hasta convergencia'
        ]
      }
    ]
  }
];

function ReferenceSection({ section, isExpanded, onToggle }) {
  const Icon = section.icon;

  return (
    <div className="panel overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-slate-700/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/20 rounded-lg">
            <Icon className="text-cyan-400" size={20} />
          </div>
          <h2 className="font-semibold text-slate-100">{section.title}</h2>
        </div>
        {isExpanded ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
      </button>

      {isExpanded && (
        <div className="p-4 pt-0 space-y-4">
          {section.items.map((item, idx) => (
            <div
              key={idx}
              className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/50"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-slate-100">{item.name}</h3>
                {item.symbol && item.symbol !== '-' && (
                  <code className="text-cyan-400 font-mono text-sm bg-slate-800 px-2 py-0.5 rounded">
                    {item.symbol}
                  </code>
                )}
                {item.complexity && (
                  <code className="text-amber-400 font-mono text-sm bg-slate-800 px-2 py-0.5 rounded">
                    {item.complexity}
                  </code>
                )}
              </div>

              {item.formula && item.formula !== '-' && (
                <div className="mb-3 p-3 bg-slate-800 rounded-lg font-mono text-cyan-300 text-sm overflow-x-auto">
                  {item.formula}
                </div>
              )}

              <p className="text-sm text-slate-400 mb-3">{item.description}</p>

              {item.example && (
                <div className="text-sm text-slate-300 p-2 bg-slate-800/50 rounded border-l-2 border-cyan-500/50">
                  <strong className="text-cyan-400">Ejemplo:</strong> {item.example}
                </div>
              )}

              {item.properties && (
                <div className="mt-3">
                  <p className="text-xs text-slate-500 mb-2">Propiedades:</p>
                  <ul className="space-y-1">
                    {item.properties.map((prop, i) => (
                      <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                        <span className="text-cyan-500">•</span>
                        {prop}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {item.steps && (
                <div className="mt-3">
                  <p className="text-xs text-slate-500 mb-2">Pasos:</p>
                  <ol className="space-y-1">
                    {item.steps.map((step, i) => (
                      <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-700 text-slate-300 text-xs flex items-center justify-center">
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function Reference() {
  const [expandedSections, setExpandedSections] = useState(['node-metrics']);

  const toggleSection = (sectionId) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <FileText className="text-purple-400" size={24} />
            </div>
            <h1 className="text-2xl font-bold text-slate-100">Referencia Rápida</h1>
          </div>
          <p className="text-slate-400">
            Todas las fórmulas, definiciones y algoritmos en un solo lugar.
            Úsala como guía de consulta mientras experimentas.
          </p>
        </div>

        {/* Quick navigation */}
        <div className="mb-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
          <p className="text-sm text-slate-400 mb-3">Ir a sección:</p>
          <div className="flex flex-wrap gap-2">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => {
                    setExpandedSections([section.id]);
                    document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-slate-300 transition-colors"
                >
                  <Icon size={14} />
                  {section.title}
                </button>
              );
            })}
          </div>
        </div>

        {/* Expand/Collapse all */}
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setExpandedSections(sections.map(s => s.id))}
            className="px-3 py-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            Expandir todo
          </button>
          <span className="text-slate-600">|</span>
          <button
            onClick={() => setExpandedSections([])}
            className="px-3 py-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            Colapsar todo
          </button>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {sections.map((section) => (
            <div key={section.id} id={section.id}>
              <ReferenceSection
                section={section}
                isExpanded={expandedSections.includes(section.id)}
                onToggle={() => toggleSection(section.id)}
              />
            </div>
          ))}
        </div>

        {/* Additional resources */}
        <div className="mt-8 p-6 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-xl border border-slate-700/50">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="text-cyan-400" size={24} />
            <h3 className="text-lg font-semibold text-slate-100">Recursos Adicionales</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <p className="font-medium text-slate-300">Libros recomendados:</p>
              <ul className="space-y-1 text-slate-400">
                <li>• Network Science - Albert-László Barabási</li>
                <li>• Networks: An Introduction - Mark Newman</li>
                <li>• Graph Theory - Reinhard Diestel</li>
              </ul>
            </div>
            <div className="space-y-2">
              <p className="font-medium text-slate-300">Cursos online:</p>
              <ul className="space-y-1 text-slate-400">
                <li>• Social Network Analysis (Coursera)</li>
                <li>• Networks, Crowds, and Markets (edX)</li>
                <li>• Applied Social Network Analysis (Coursera)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reference;
