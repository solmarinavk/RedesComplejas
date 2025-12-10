import React, { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';

export function Tooltip({ content, children }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && (
        <div className="absolute z-50 w-64 p-3 mt-2 bg-slate-700 rounded-lg shadow-xl border border-slate-600 text-sm">
          {content}
        </div>
      )}
    </div>
  );
}

export function MetricTooltip({ title, formula, explanation, example }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-1 text-slate-400 hover:text-cyan-400 transition-colors"
        aria-label={`Más información sobre ${title}`}
      >
        <HelpCircle size={14} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 max-w-md mx-4 shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-cyan-400">{title}</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-slate-300 mb-1">Explicación</h4>
                <p className="text-slate-400 text-sm">{explanation}</p>
              </div>

              {formula && (
                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-1">Fórmula</h4>
                  <code className="block bg-slate-900 p-3 rounded-lg text-cyan-300 font-mono text-sm">
                    {formula}
                  </code>
                </div>
              )}

              {example && (
                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-1">Ejemplo</h4>
                  <p className="text-slate-400 text-sm bg-slate-900/50 p-3 rounded-lg">
                    {example}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function InfoTooltip({ children }) {
  return (
    <Tooltip content={children}>
      <HelpCircle size={14} className="text-slate-400 hover:text-cyan-400 cursor-help" />
    </Tooltip>
  );
}

export default Tooltip;
