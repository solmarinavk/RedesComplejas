import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { GraphProvider, useGraph } from './contexts/GraphContext';
import { Navbar } from './components/Layout/Navbar';
import { Footer } from './components/Layout/Footer';
import { Home } from './pages/Home';
import { Laboratory } from './pages/Laboratory';
import { Generators } from './pages/Generators';
import { Algorithms } from './pages/Algorithms';
import { Exercises } from './pages/Exercises';
import { Reference } from './pages/Reference';

// Keyboard shortcuts handler
function KeyboardShortcuts() {
  const { dispatch } = useGraph();

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'v':
          dispatch({ type: 'SET_MODE', payload: 'select' });
          break;
        case 'n':
          dispatch({ type: 'SET_MODE', payload: 'addNode' });
          break;
        case 'e':
          dispatch({ type: 'SET_MODE', payload: 'addEdge' });
          break;
        case 'd':
          dispatch({ type: 'SET_MODE', payload: 'delete' });
          break;
        case 'z':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            if (e.shiftKey) {
              dispatch({ type: 'REDO' });
            } else {
              dispatch({ type: 'UNDO' });
            }
          }
          break;
        case 'escape':
          dispatch({ type: 'SELECT_NODE', payload: null });
          dispatch({ type: 'SET_CONNECTING_FROM', payload: null });
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch]);

  return null;
}

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// Main App Layout
function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      <KeyboardShortcuts />
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/laboratory" element={<Laboratory />} />
          <Route path="/generators" element={<Generators />} />
          <Route path="/algorithms" element={<Algorithms />} />
          <Route path="/exercises" element={<Exercises />} />
          <Route path="/reference" element={<Reference />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <GraphProvider>
      <Router>
        <AppLayout />
      </Router>
    </GraphProvider>
  );
}

export default App;
