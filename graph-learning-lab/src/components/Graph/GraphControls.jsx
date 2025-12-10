import React from 'react';
import {
  MousePointer,
  Circle,
  Link2,
  Trash2,
  RotateCcw,
  Shuffle,
  ArrowRight,
  Hash,
  Download,
  Upload,
  Maximize2
} from 'lucide-react';
import { useGraph } from '../../contexts/GraphContext';
import { generateQuickRandom } from '../../utils/graphGenerators';

const modes = [
  { id: 'select', icon: MousePointer, label: 'Seleccionar', shortcut: 'V' },
  { id: 'addNode', icon: Circle, label: 'Agregar Nodo', shortcut: 'N' },
  { id: 'addEdge', icon: Link2, label: 'Conectar', shortcut: 'E' },
  { id: 'delete', icon: Trash2, label: 'Eliminar', shortcut: 'D' }
];

export function GraphControls({ onFullscreen }) {
  const { state, dispatch } = useGraph();
  const { mode, directed, weighted, nodes, edges } = state;

  const handleModeChange = (newMode) => {
    dispatch({ type: 'SET_MODE', payload: newMode });
  };

  const handleClear = () => {
    if (nodes.length === 0 || window.confirm('¿Estás seguro de que quieres limpiar el grafo?')) {
      dispatch({ type: 'CLEAR_GRAPH' });
    }
  };

  const handleRandomGraph = () => {
    const graph = generateQuickRandom(8, 0.35);
    dispatch({ type: 'LOAD_GRAPH', payload: graph });
  };

  const handleExportJSON = () => {
    const data = {
      nodes,
      edges,
      directed,
      weighted
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'grafo.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target.result);
            dispatch({ type: 'LOAD_GRAPH', payload: data });
          } catch (err) {
            alert('Error al cargar el archivo JSON');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleExportPNG = () => {
    const svg = document.querySelector('.graph-canvas');
    if (!svg) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      canvas.width = svg.clientWidth * 2;
      canvas.height = svg.clientHeight * 2;
      ctx.scale(2, 2);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const pngUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = 'grafo.png';
      a.click();
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  return (
    <div className="panel p-4 space-y-4">
      <h3 className="font-semibold text-slate-100">Herramientas</h3>

      {/* Mode buttons */}
      <div className="grid grid-cols-2 gap-2">
        {modes.map(({ id, icon: Icon, label, shortcut }) => (
          <button
            key={id}
            onClick={() => handleModeChange(id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === id
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                : 'bg-slate-700/50 text-slate-300 border border-slate-600 hover:bg-slate-700'
            }`}
            title={`${label} (${shortcut})`}
          >
            <Icon size={16} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Graph options */}
      <div className="space-y-3 pt-2 border-t border-slate-700">
        <h4 className="text-sm font-medium text-slate-300">Tipo de grafo</h4>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={directed}
            onChange={(e) => dispatch({ type: 'SET_DIRECTED', payload: e.target.checked })}
            className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-cyan-500 focus:ring-cyan-500"
          />
          <div className="flex items-center gap-2">
            <ArrowRight size={16} className="text-slate-400" />
            <span className="text-sm text-slate-300">Dirigido</span>
          </div>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={weighted}
            onChange={(e) => dispatch({ type: 'SET_WEIGHTED', payload: e.target.checked })}
            className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-cyan-500 focus:ring-cyan-500"
          />
          <div className="flex items-center gap-2">
            <Hash size={16} className="text-slate-400" />
            <span className="text-sm text-slate-300">Ponderado</span>
          </div>
        </label>
      </div>

      {/* Action buttons */}
      <div className="space-y-2 pt-2 border-t border-slate-700">
        <button
          onClick={handleRandomGraph}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors"
        >
          <Shuffle size={16} />
          Grafo aleatorio
        </button>

        <button
          onClick={handleClear}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm transition-colors"
        >
          <RotateCcw size={16} />
          Limpiar todo
        </button>
      </div>

      {/* Export/Import */}
      <div className="space-y-2 pt-2 border-t border-slate-700">
        <h4 className="text-sm font-medium text-slate-300">Exportar / Importar</h4>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleExportJSON}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors"
            title="Exportar como JSON"
          >
            <Download size={14} />
            JSON
          </button>
          <button
            onClick={handleExportPNG}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors"
            title="Exportar como PNG"
          >
            <Download size={14} />
            PNG
          </button>
        </div>

        <button
          onClick={handleImportJSON}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors"
        >
          <Upload size={14} />
          Importar JSON
        </button>

        {onFullscreen && (
          <button
            onClick={onFullscreen}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-lg text-sm transition-colors"
          >
            <Maximize2 size={14} />
            Pantalla completa
          </button>
        )}
      </div>
    </div>
  );
}

export default GraphControls;
