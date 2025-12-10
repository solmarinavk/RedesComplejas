import React from 'react';
import { Heart, Github } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-800 border-t border-slate-700 py-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="text-slate-400 text-sm">
              Desarrollado por{' '}
              <span className="text-cyan-400 font-medium">Sol Vivanco</span>
            </p>
            <p className="text-slate-500 text-xs mt-1">
              Maestría en Data Science - Redes Complejas
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <span>Hecho con</span>
              <Heart size={14} className="text-red-400 fill-red-400" />
              <span>para UPC Perú</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-700/50 text-center">
          <p className="text-slate-500 text-xs">
            Graph Learning Lab © {new Date().getFullYear()} - Herramienta educativa para el aprendizaje de teoría de grafos
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
