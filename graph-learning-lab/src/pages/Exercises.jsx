import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Lightbulb,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useGraph } from '../contexts/GraphContext';
import { GraphCanvas } from '../components/Graph/GraphCanvas';
import {
  findConnectedComponents,
  calculateGlobalMetrics,
  globalClusteringCoefficient,
  averagePathLength
} from '../utils/graphMetrics';
import { generateWattsStrogatz } from '../utils/graphGenerators';

const exercises = [
  {
    id: 1,
    title: 'Componentes Conexas',
    difficulty: 'Básico',
    objective: 'Entender qué es una componente conexa',
    instructions: [
      'Crea 6 nodos en el Laboratorio',
      'Conecta los nodos 1-2-3 en cadena',
      'Conecta los nodos 4-5-6 en cadena (sin conectar con los anteriores)',
      '¿Cuántas componentes conexas hay?'
    ],
    questions: [
      {
        question: '¿Cuántas componentes conexas tiene el grafo?',
        type: 'number',
        answer: 2,
        hint: 'Una componente conexa es un grupo de nodos donde puedes ir de cualquiera a cualquier otro.'
      },
      {
        question: 'Si conectas el nodo 3 con el 4, ¿cuántas componentes habrá?',
        type: 'number',
        answer: 1,
        hint: 'Al conectar las dos cadenas, todos los nodos quedan conectados entre sí.'
      }
    ]
  },
  {
    id: 2,
    title: 'Redes de Pequeño Mundo',
    difficulty: 'Intermedio',
    objective: 'Experimentar el fenómeno del pequeño mundo',
    instructions: [
      'Ve a Modelos Generativos → Watts-Strogatz',
      'Genera un grafo con n=20, k=4, β=0',
      'Anota el clustering y la longitud promedio de camino',
      'Ahora cambia β a 0.1 y genera otro',
      'Compara las métricas'
    ],
    questions: [
      {
        question: '¿El clustering con β=0.1 es mayor o menor que con β=0?',
        type: 'choice',
        options: ['Mayor', 'Menor', 'Igual'],
        answer: 'Menor',
        hint: 'Al reconectar aristas, se rompen algunos triángulos locales.'
      },
      {
        question: '¿La longitud de camino con β=0.1 es mucho menor que con β=0?',
        type: 'choice',
        options: ['Sí', 'No'],
        answer: 'Sí',
        hint: 'Los "atajos" creados por la reconexión reducen drásticamente las distancias.'
      },
      {
        question: '¿Qué valor de β produce el mejor "pequeño mundo" (alto C, bajo L)?',
        type: 'choice',
        options: ['β=0', 'β≈0.1', 'β=1'],
        answer: 'β≈0.1',
        hint: 'El pequeño mundo aparece con valores intermedios de β.'
      }
    ]
  },
  {
    id: 3,
    title: 'Redes de Escala Libre',
    difficulty: 'Intermedio',
    objective: 'Entender el preferential attachment',
    instructions: [
      'Ve a Modelos Generativos → Barabási-Albert',
      'Genera una red con n=50 y m=2',
      'Observa los nodos con mayor grado (hubs)',
      'Fíjate en qué momento fueron agregados los hubs'
    ],
    questions: [
      {
        question: '¿Los hubs (nodos con más conexiones) tienden a ser nodos tempranos o tardíos?',
        type: 'choice',
        options: ['Tempranos', 'Tardíos', 'No hay patrón'],
        answer: 'Tempranos',
        hint: 'Los nodos tempranos han tenido más tiempo para acumular conexiones.'
      },
      {
        question: '¿La distribución de grado es uniforme (todos tienen grado similar)?',
        type: 'choice',
        options: ['Sí', 'No'],
        answer: 'No',
        hint: 'En redes de escala libre, hay muchos nodos con pocas conexiones y pocos nodos con muchas.'
      }
    ]
  },
  {
    id: 4,
    title: 'PageRank y Centralidad',
    difficulty: 'Avanzado',
    objective: 'Entender cómo PageRank mide importancia',
    instructions: [
      'Ve al Laboratorio y crea un grafo "estrella": un nodo central conectado a 5 nodos externos',
      'Ve a Algoritmos → PageRank y ejecútalo',
      'Observa qué nodo tiene mayor PageRank'
    ],
    questions: [
      {
        question: 'En un grafo estrella, ¿qué nodo tiene mayor PageRank?',
        type: 'choice',
        options: ['El centro', 'Los externos', 'Todos igual'],
        answer: 'Los externos',
        hint: 'PageRank considera de dónde vienen los enlaces. El centro recibe enlaces de nodos de grado 1.'
      },
      {
        question: '¿Por qué el centro no tiene el mayor PageRank a pesar de tener más conexiones?',
        type: 'text',
        answerContains: ['grado', 'enlace', 'distribuye', 'importancia'],
        hint: 'Piensa en cómo se distribuye el PageRank desde nodos con muchas vs pocas conexiones.'
      }
    ]
  },
  {
    id: 5,
    title: 'Umbral de Conectividad',
    difficulty: 'Avanzado',
    objective: 'Experimentar con el umbral de conectividad de Erdős-Rényi',
    instructions: [
      'Ve a Modelos Generativos → Erdős-Rényi',
      'Con n=50, calcula el umbral: p_c = ln(50)/50 ≈ 0.078',
      'Genera grafos con p=0.05 (menor que p_c) varias veces',
      'Luego genera con p=0.1 (mayor que p_c) varias veces',
      'Compara el número de componentes'
    ],
    questions: [
      {
        question: '¿Con p < p_c, el grafo suele estar conectado (1 componente)?',
        type: 'choice',
        options: ['Sí, casi siempre', 'No, casi nunca'],
        answer: 'No, casi nunca',
        hint: 'Por debajo del umbral, la red tiende a estar fragmentada.'
      },
      {
        question: '¿Con p > p_c, el grafo suele estar conectado?',
        type: 'choice',
        options: ['Sí, casi siempre', 'No, casi nunca'],
        answer: 'Sí, casi siempre',
        hint: 'Por encima del umbral, aparece una componente gigante que conecta casi todos los nodos.'
      }
    ]
  }
];

function ExerciseCard({ exercise, isExpanded, onToggle }) {
  const { state } = useGraph();
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState({});
  const [showHints, setShowHints] = useState({});

  const handleAnswerChange = (questionIdx, value) => {
    setAnswers(prev => ({ ...prev, [questionIdx]: value }));
    setResults(prev => ({ ...prev, [questionIdx]: undefined }));
  };

  const checkAnswer = (questionIdx) => {
    const question = exercise.questions[questionIdx];
    const userAnswer = answers[questionIdx];

    let isCorrect = false;

    if (question.type === 'number') {
      isCorrect = parseFloat(userAnswer) === question.answer;
    } else if (question.type === 'choice') {
      isCorrect = userAnswer === question.answer;
    } else if (question.type === 'text') {
      const lowerAnswer = userAnswer?.toLowerCase() || '';
      isCorrect = question.answerContains.some(word =>
        lowerAnswer.includes(word.toLowerCase())
      );
    }

    setResults(prev => ({ ...prev, [questionIdx]: isCorrect }));
  };

  const toggleHint = (questionIdx) => {
    setShowHints(prev => ({ ...prev, [questionIdx]: !prev[questionIdx] }));
  };

  const difficultyColors = {
    'Básico': 'bg-green-500/20 text-green-400 border-green-500/30',
    'Intermedio': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    'Avanzado': 'bg-red-500/20 text-red-400 border-red-500/30'
  };

  return (
    <div className="panel overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-slate-700/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 font-bold">
            {exercise.id}
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-slate-100">{exercise.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 text-xs rounded-full border ${difficultyColors[exercise.difficulty]}`}>
                {exercise.difficulty}
              </span>
            </div>
          </div>
        </div>
        {isExpanded ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
      </button>

      {isExpanded && (
        <div className="p-4 pt-0 space-y-4">
          {/* Objective */}
          <div className="p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
            <p className="text-sm text-cyan-400">
              <strong>Objetivo:</strong> {exercise.objective}
            </p>
          </div>

          {/* Instructions */}
          <div>
            <h4 className="font-medium text-slate-300 mb-2">Instrucciones</h4>
            <ol className="space-y-2">
              {exercise.instructions.map((instruction, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-400">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-700 text-slate-300 text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  {instruction}
                </li>
              ))}
            </ol>
          </div>

          {/* Questions */}
          <div className="space-y-4">
            <h4 className="font-medium text-slate-300">Preguntas</h4>

            {exercise.questions.map((q, idx) => (
              <div key={idx} className="p-4 bg-slate-900/50 rounded-lg space-y-3">
                <p className="text-sm text-slate-200">{q.question}</p>

                {/* Answer input based on type */}
                {q.type === 'number' && (
                  <input
                    type="number"
                    value={answers[idx] || ''}
                    onChange={(e) => handleAnswerChange(idx, e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 text-sm"
                    placeholder="Tu respuesta..."
                  />
                )}

                {q.type === 'choice' && (
                  <div className="flex flex-wrap gap-2">
                    {q.options.map((option) => (
                      <button
                        key={option}
                        onClick={() => handleAnswerChange(idx, option)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          answers[idx] === option
                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                            : 'bg-slate-700 text-slate-300 border border-slate-600 hover:bg-slate-600'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}

                {q.type === 'text' && (
                  <textarea
                    value={answers[idx] || ''}
                    onChange={(e) => handleAnswerChange(idx, e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 text-sm resize-none"
                    rows={2}
                    placeholder="Tu respuesta..."
                  />
                )}

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => checkAnswer(idx)}
                    disabled={!answers[idx]}
                    className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Verificar
                  </button>
                  <button
                    onClick={() => toggleHint(idx)}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Lightbulb size={14} />
                    Pista
                  </button>

                  {/* Result indicator */}
                  {results[idx] !== undefined && (
                    results[idx] ? (
                      <div className="flex items-center gap-1 text-green-400 text-sm">
                        <CheckCircle2 size={18} />
                        ¡Correcto!
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-red-400 text-sm">
                        <XCircle size={18} />
                        Intenta de nuevo
                      </div>
                    )
                  )}
                </div>

                {/* Hint */}
                {showHints[idx] && (
                  <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/30">
                    <p className="text-sm text-amber-300">
                      <Lightbulb size={14} className="inline mr-1" />
                      {q.hint}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function Exercises() {
  const [expandedExercise, setExpandedExercise] = useState(1);

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <BookOpen className="text-amber-400" size={24} />
            </div>
            <h1 className="text-2xl font-bold text-slate-100">Ejercicios Guiados</h1>
          </div>
          <p className="text-slate-400">
            Practica los conceptos de teoría de grafos con ejercicios interactivos.
            Cada ejercicio te guía paso a paso y verifica tus respuestas.
          </p>
        </div>

        {/* Progress overview */}
        <div className="mb-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Ejercicios disponibles</span>
            <span className="text-cyan-400 font-bold">{exercises.length}</span>
          </div>
          <div className="mt-3 flex gap-2">
            {exercises.map((ex) => (
              <button
                key={ex.id}
                onClick={() => setExpandedExercise(ex.id)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  expandedExercise === ex.id
                    ? 'bg-cyan-500 text-white'
                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                }`}
              >
                {ex.id}
              </button>
            ))}
          </div>
        </div>

        {/* Exercise cards */}
        <div className="space-y-4">
          {exercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              isExpanded={expandedExercise === exercise.id}
              onToggle={() => setExpandedExercise(
                expandedExercise === exercise.id ? null : exercise.id
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Exercises;
