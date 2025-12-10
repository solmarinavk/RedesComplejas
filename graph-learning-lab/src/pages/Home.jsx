import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Network,
  Circle,
  Link2,
  ArrowRight,
  Play,
  BookOpen,
  FlaskConical,
  Dices,
  GitBranch,
  ChevronRight,
  Lightbulb,
  Target,
  Users,
  Zap
} from 'lucide-react';

const glossaryTerms = [
  {
    term: 'Nodo (Vértice)',
    definition: 'Un punto en el grafo que representa una entidad. En redes sociales, cada persona es un nodo.',
    icon: Circle
  },
  {
    term: 'Arista (Enlace)',
    definition: 'Una conexión entre dos nodos. Representa una relación, como una amistad o un enlace web.',
    icon: Link2
  },
  {
    term: 'Grado',
    definition: 'El número de aristas conectadas a un nodo. Un nodo con grado 5 tiene 5 conexiones.',
    icon: Target
  },
  {
    term: 'Camino',
    definition: 'Una secuencia de nodos conectados por aristas. La longitud del camino es el número de aristas.',
    icon: ArrowRight
  },
  {
    term: 'Componente Conexa',
    definition: 'Un subgrafo donde existe un camino entre cualquier par de nodos. Un grafo puede tener múltiples componentes.',
    icon: Network
  },
  {
    term: 'Grafo Dirigido',
    definition: 'Un grafo donde las aristas tienen dirección (flechas). El enlace A→B no implica B→A.',
    icon: ArrowRight
  }
];

const features = [
  {
    icon: FlaskConical,
    title: 'Laboratorio de Grafos',
    description: 'Crea y edita grafos manualmente. Observa métricas en tiempo real.',
    link: '/laboratory',
    color: 'cyan'
  },
  {
    icon: Dices,
    title: 'Modelos Generativos',
    description: 'Experimenta con Erdős-Rényi, Watts-Strogatz y Barabási-Albert.',
    link: '/generators',
    color: 'green'
  },
  {
    icon: GitBranch,
    title: 'Algoritmos',
    description: 'Visualiza PageRank, detección de comunidades y caminos más cortos.',
    link: '/algorithms',
    color: 'purple'
  },
  {
    icon: BookOpen,
    title: 'Ejercicios Guiados',
    description: 'Practica con ejercicios interactivos y verifica tus respuestas.',
    link: '/exercises',
    color: 'amber'
  }
];

const tutorialSteps = [
  {
    title: '¿Qué es un Grafo?',
    content: 'Un grafo es una estructura matemática formada por nodos (puntos) y aristas (líneas que conectan los puntos). Los grafos nos permiten modelar relaciones: redes sociales, internet, rutas de transporte, moléculas, y mucho más.',
    visual: 'intro'
  },
  {
    title: 'Nodos y Aristas',
    content: 'Los nodos representan entidades (personas, páginas web, ciudades). Las aristas representan relaciones entre ellas (amistades, enlaces, carreteras). Juntos forman la estructura del grafo.',
    visual: 'nodes'
  },
  {
    title: 'Tipos de Grafos',
    content: 'Los grafos pueden ser dirigidos (las aristas tienen dirección, como los enlaces web) o no dirigidos (las relaciones son mutuas, como las amistades en Facebook). También pueden ser ponderados si las aristas tienen un valor asociado.',
    visual: 'types'
  },
  {
    title: 'Métricas Importantes',
    content: 'Podemos medir muchas propiedades: grado (conexiones de un nodo), densidad (qué tan conectado está el grafo), clustering (tendencia a formar grupos), y centralidad (importancia de cada nodo).',
    visual: 'metrics'
  },
  {
    title: '¡A Experimentar!',
    content: 'Ahora es tu turno. Ve al Laboratorio para crear tu primer grafo, o explora los Modelos Generativos para ver cómo se forman redes con diferentes propiedades.',
    visual: 'practice'
  }
];

export function Home() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);

  const colorClasses = {
    cyan: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30 hover:border-cyan-500/50',
    green: 'bg-green-500/20 text-green-400 border-green-500/30 hover:border-green-500/50',
    purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30 hover:border-purple-500/50',
    amber: 'bg-amber-500/20 text-amber-400 border-amber-500/30 hover:border-amber-500/50'
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/80 rounded-full border border-slate-700 mb-6">
            <Network className="text-cyan-400" size={20} />
            <span className="text-sm text-slate-300">Redes Complejas - UPC Perú</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-slate-100 mb-6">
            Graph Learning Lab
          </h1>

          <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
            Una herramienta interactiva para aprender teoría de grafos y redes complejas
            mediante experimentación visual y práctica.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => setShowTutorial(true)}
              className="flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold rounded-xl transition-all shadow-lg shadow-cyan-500/25"
            >
              <Play size={20} />
              Comenzar Tutorial
            </button>
            <button
              onClick={() => navigate('/laboratory')}
              className="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-100 font-semibold rounded-xl transition-all border border-slate-600"
            >
              <FlaskConical size={20} />
              Ir al Laboratorio
            </button>
          </div>
        </div>
      </section>

      {/* Tutorial Modal */}
      {showTutorial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lightbulb className="text-amber-400" size={24} />
                  <h2 className="text-xl font-bold text-slate-100">Tutorial Interactivo</h2>
                </div>
                <button
                  onClick={() => setShowTutorial(false)}
                  className="text-slate-400 hover:text-slate-200"
                >
                  ✕
                </button>
              </div>
              <div className="flex gap-1 mt-4">
                {tutorialSteps.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      idx <= currentStep ? 'bg-cyan-400' : 'bg-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-lg font-semibold text-cyan-400 mb-3">
                {tutorialSteps[currentStep].title}
              </h3>
              <p className="text-slate-300 leading-relaxed mb-6">
                {tutorialSteps[currentStep].content}
              </p>

              {/* Visual representation */}
              <div className="bg-slate-900 rounded-xl p-6 mb-6 flex items-center justify-center min-h-[200px]">
                {currentStep === 0 && (
                  <div className="relative">
                    <svg width="300" height="150" viewBox="0 0 300 150">
                      {/* Simple graph illustration */}
                      <circle cx="50" cy="75" r="15" fill="#3b82f6" />
                      <circle cx="150" cy="40" r="15" fill="#3b82f6" />
                      <circle cx="150" cy="110" r="15" fill="#3b82f6" />
                      <circle cx="250" cy="75" r="15" fill="#3b82f6" />
                      <line x1="65" y1="70" x2="135" y2="45" stroke="#475569" strokeWidth="2" />
                      <line x1="65" y1="80" x2="135" y2="105" stroke="#475569" strokeWidth="2" />
                      <line x1="165" y1="45" x2="235" y2="70" stroke="#475569" strokeWidth="2" />
                      <line x1="165" y1="105" x2="235" y2="80" stroke="#475569" strokeWidth="2" />
                      <line x1="150" y1="55" x2="150" y2="95" stroke="#475569" strokeWidth="2" />
                    </svg>
                  </div>
                )}
                {currentStep === 1 && (
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-8 mb-4">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">A</div>
                        <span className="text-slate-400 text-sm mt-2">Nodo</span>
                      </div>
                      <div className="w-20 h-0.5 bg-slate-500 relative">
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-slate-400 text-sm">Arista</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">B</div>
                        <span className="text-slate-400 text-sm mt-2">Nodo</span>
                      </div>
                    </div>
                  </div>
                )}
                {currentStep === 2 && (
                  <div className="flex gap-8">
                    <div className="text-center">
                      <svg width="100" height="80" viewBox="0 0 100 80">
                        <circle cx="30" cy="40" r="12" fill="#3b82f6" />
                        <circle cx="70" cy="40" r="12" fill="#3b82f6" />
                        <line x1="42" y1="40" x2="58" y2="40" stroke="#475569" strokeWidth="2" />
                      </svg>
                      <p className="text-slate-400 text-sm">No dirigido</p>
                    </div>
                    <div className="text-center">
                      <svg width="100" height="80" viewBox="0 0 100 80">
                        <circle cx="30" cy="40" r="12" fill="#3b82f6" />
                        <circle cx="70" cy="40" r="12" fill="#3b82f6" />
                        <line x1="42" y1="40" x2="55" y2="40" stroke="#475569" strokeWidth="2" />
                        <polygon points="58,40 52,36 52,44" fill="#475569" />
                      </svg>
                      <p className="text-slate-400 text-sm">Dirigido</p>
                    </div>
                  </div>
                )}
                {currentStep === 3 && (
                  <div className="grid grid-cols-2 gap-4 text-center text-sm">
                    <div className="p-3 bg-slate-800 rounded-lg">
                      <p className="text-cyan-400 font-semibold">Grado = 3</p>
                      <p className="text-slate-400">Conexiones del nodo</p>
                    </div>
                    <div className="p-3 bg-slate-800 rounded-lg">
                      <p className="text-cyan-400 font-semibold">Densidad = 0.5</p>
                      <p className="text-slate-400">Conectividad del grafo</p>
                    </div>
                    <div className="p-3 bg-slate-800 rounded-lg">
                      <p className="text-cyan-400 font-semibold">Clustering = 0.67</p>
                      <p className="text-slate-400">Formación de grupos</p>
                    </div>
                    <div className="p-3 bg-slate-800 rounded-lg">
                      <p className="text-cyan-400 font-semibold">PageRank = 0.15</p>
                      <p className="text-slate-400">Importancia del nodo</p>
                    </div>
                  </div>
                )}
                {currentStep === 4 && (
                  <div className="text-center">
                    <Zap className="text-amber-400 mx-auto mb-4" size={48} />
                    <p className="text-slate-300">¡Listo para experimentar!</p>
                  </div>
                )}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0}
                  className="px-4 py-2 text-slate-400 hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                {currentStep < tutorialSteps.length - 1 ? (
                  <button
                    onClick={() => setCurrentStep(currentStep + 1)}
                    className="px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-medium rounded-lg transition-colors"
                  >
                    Siguiente
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setShowTutorial(false);
                      navigate('/laboratory');
                    }}
                    className="px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-medium rounded-lg transition-colors"
                  >
                    Ir al Laboratorio
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-100 text-center mb-12">
            Explora las Herramientas
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <button
                key={idx}
                onClick={() => navigate(feature.link)}
                className={`card text-left border ${colorClasses[feature.color]} transition-all hover:scale-105`}
              >
                <feature.icon size={32} className="mb-4" />
                <h3 className="font-semibold text-slate-100 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400">{feature.description}</p>
                <div className="flex items-center gap-1 mt-4 text-sm font-medium">
                  Explorar
                  <ChevronRight size={16} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Glossary Section */}
      <section className="py-16 px-4 bg-slate-800/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-100 text-center mb-4">
            Glosario de Términos
          </h2>
          <p className="text-slate-400 text-center mb-12">
            Conceptos fundamentales que necesitarás conocer
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            {glossaryTerms.map((item, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-800 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-cyan-500/20 rounded-lg">
                    <item.icon size={20} className="text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-100 mb-1">{item.term}</h3>
                    <p className="text-sm text-slate-400">{item.definition}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Users className="text-cyan-400 mx-auto mb-6" size={48} />
          <h2 className="text-2xl font-bold text-slate-100 mb-4">
            ¿Listo para empezar?
          </h2>
          <p className="text-slate-400 mb-8">
            Comienza creando tu primer grafo en el laboratorio o explora los modelos
            generativos para entender cómo se forman las redes complejas.
          </p>
          <button
            onClick={() => navigate('/laboratory')}
            className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold rounded-xl transition-all shadow-lg"
          >
            Comenzar a Experimentar
          </button>
        </div>
      </section>
    </div>
  );
}

export default Home;
