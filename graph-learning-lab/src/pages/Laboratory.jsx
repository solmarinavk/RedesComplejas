import React, { useState, useCallback } from 'react';
import { FlaskConical, Maximize2, Minimize2 } from 'lucide-react';
import { GraphCanvas } from '../components/Graph/GraphCanvas';
import { GraphControls } from '../components/Graph/GraphControls';
import { GlobalMetrics } from '../components/Metrics/GlobalMetrics';
import { NodeMetrics } from '../components/Metrics/NodeMetrics';

export function Laboratory() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900 p-4">
        <div className="relative h-full">
          <button
            onClick={handleFullscreen}
            className="absolute top-4 right-4 z-10 p-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 text-slate-300"
          >
            <Minimize2 size={20} />
          </button>
          <GraphCanvas
            height={window.innerHeight - 32}
            className="h-full"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <FlaskConical className="text-cyan-400" size={24} />
            </div>
            <h1 className="text-2xl font-bold text-slate-100">Laboratorio de Grafos</h1>
          </div>
          <p className="text-slate-400">
            Crea y experimenta con grafos. Haz clic para agregar nodos, arrástralos para moverlos,
            y observa las métricas en tiempo real.
          </p>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Panel - Tools */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            <GraphControls onFullscreen={handleFullscreen} />
          </div>

          {/* Center - Canvas */}
          <div className="lg:col-span-6 order-1 lg:order-2 min-w-0">
            <div className="panel p-2 relative overflow-hidden">
              <button
                onClick={handleFullscreen}
                className="absolute top-4 right-4 z-10 p-2 bg-slate-700/80 hover:bg-slate-600 rounded-lg text-slate-300 transition-colors"
                title="Pantalla completa"
              >
                <Maximize2 size={16} />
              </button>
              <GraphCanvas
                height={500}
              />
            </div>

            {/* Quick help */}
            <div className="mt-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
              <h4 className="text-sm font-medium text-slate-300 mb-2">Atajos de teclado</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-slate-700 rounded text-slate-300">V</kbd>
                  <span className="text-slate-400">Seleccionar</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-slate-700 rounded text-slate-300">N</kbd>
                  <span className="text-slate-400">Agregar nodo</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-slate-700 rounded text-slate-300">E</kbd>
                  <span className="text-slate-400">Conectar</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-slate-700 rounded text-slate-300">D</kbd>
                  <span className="text-slate-400">Eliminar</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Metrics */}
          <div className="lg:col-span-3 order-3 space-y-4">
            <GlobalMetrics />
            <NodeMetrics />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Laboratory;
