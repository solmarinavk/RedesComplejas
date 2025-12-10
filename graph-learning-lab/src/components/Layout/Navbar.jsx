import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  FlaskConical,
  Dices,
  GitBranch,
  BookOpen,
  FileText,
  Network
} from 'lucide-react';

const navItems = [
  { to: '/', icon: Home, label: 'Inicio' },
  { to: '/laboratory', icon: FlaskConical, label: 'Laboratorio' },
  { to: '/generators', icon: Dices, label: 'Modelos' },
  { to: '/algorithms', icon: GitBranch, label: 'Algoritmos' },
  { to: '/exercises', icon: BookOpen, label: 'Ejercicios' },
  { to: '/reference', icon: FileText, label: 'Referencia' }
];

export function Navbar() {
  return (
    <nav className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <Network className="text-cyan-400" size={24} />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-slate-100">Graph Learning Lab</h1>
              <p className="text-xs text-slate-400">Profesor Royer Rojas</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-400'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                  }`
                }
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-slate-700 overflow-x-auto">
        <div className="flex px-2 py-2 gap-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center px-3 py-2 rounded-lg text-xs font-medium transition-all min-w-[64px] ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`
              }
            >
              <Icon size={20} />
              <span className="mt-1">{label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
