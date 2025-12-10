import React, { createContext, useContext, useReducer, useEffect } from 'react';

const GraphContext = createContext(null);

const initialState = {
  nodes: [],
  edges: [],
  directed: false,
  weighted: false,
  selectedNode: null,
  selectedEdge: null,
  mode: 'select', // 'select', 'addNode', 'addEdge', 'delete'
  connectingFrom: null,
  history: [],
  historyIndex: -1
};

function graphReducer(state, action) {
  switch (action.type) {
    case 'ADD_NODE': {
      const newNode = {
        id: `node-${Date.now()}`,
        label: `${state.nodes.length + 1}`,
        x: action.payload.x,
        y: action.payload.y,
        ...action.payload
      };
      const newState = {
        ...state,
        nodes: [...state.nodes, newNode],
        selectedNode: newNode.id
      };
      return addToHistory(state, newState);
    }

    case 'ADD_EDGE': {
      const { source, target, weight } = action.payload;

      // Check if edge already exists
      const exists = state.edges.some(
        e => (e.source === source && e.target === target) ||
             (!state.directed && e.source === target && e.target === source)
      );

      if (exists || source === target) {
        return state;
      }

      const newEdge = {
        id: `edge-${Date.now()}`,
        source,
        target,
        ...(state.weighted && { weight: weight || 1 })
      };

      const newState = {
        ...state,
        edges: [...state.edges, newEdge],
        connectingFrom: null
      };
      return addToHistory(state, newState);
    }

    case 'REMOVE_NODE': {
      const nodeId = action.payload;
      const newState = {
        ...state,
        nodes: state.nodes.filter(n => n.id !== nodeId),
        edges: state.edges.filter(e => e.source !== nodeId && e.target !== nodeId),
        selectedNode: state.selectedNode === nodeId ? null : state.selectedNode
      };
      return addToHistory(state, newState);
    }

    case 'REMOVE_EDGE': {
      const edgeId = action.payload;
      const newState = {
        ...state,
        edges: state.edges.filter(e => e.id !== edgeId),
        selectedEdge: state.selectedEdge === edgeId ? null : state.selectedEdge
      };
      return addToHistory(state, newState);
    }

    case 'UPDATE_NODE_POSITION': {
      const { id, x, y } = action.payload;
      return {
        ...state,
        nodes: state.nodes.map(n =>
          n.id === id ? { ...n, x, y } : n
        )
      };
    }

    case 'UPDATE_NODE': {
      const { id, ...updates } = action.payload;
      const newState = {
        ...state,
        nodes: state.nodes.map(n =>
          n.id === id ? { ...n, ...updates } : n
        )
      };
      return addToHistory(state, newState);
    }

    case 'UPDATE_EDGE': {
      const { id, ...updates } = action.payload;
      const newState = {
        ...state,
        edges: state.edges.map(e =>
          e.id === id ? { ...e, ...updates } : e
        )
      };
      return addToHistory(state, newState);
    }

    case 'SELECT_NODE':
      return {
        ...state,
        selectedNode: action.payload,
        selectedEdge: null
      };

    case 'SELECT_EDGE':
      return {
        ...state,
        selectedEdge: action.payload,
        selectedNode: null
      };

    case 'SET_MODE':
      return {
        ...state,
        mode: action.payload,
        connectingFrom: null
      };

    case 'SET_CONNECTING_FROM':
      return {
        ...state,
        connectingFrom: action.payload
      };

    case 'SET_DIRECTED':
      return {
        ...state,
        directed: action.payload
      };

    case 'SET_WEIGHTED':
      return {
        ...state,
        weighted: action.payload
      };

    case 'LOAD_GRAPH': {
      const { nodes, edges, directed, weighted } = action.payload;
      const newState = {
        ...state,
        nodes: nodes || [],
        edges: edges || [],
        directed: directed || false,
        weighted: weighted || false,
        selectedNode: null,
        selectedEdge: null
      };
      return addToHistory(state, newState);
    }

    case 'CLEAR_GRAPH': {
      const newState = {
        ...state,
        nodes: [],
        edges: [],
        selectedNode: null,
        selectedEdge: null,
        connectingFrom: null
      };
      return addToHistory(state, newState);
    }

    case 'UNDO': {
      if (state.historyIndex <= 0) return state;
      const prevState = state.history[state.historyIndex - 1];
      return {
        ...state,
        ...prevState,
        history: state.history,
        historyIndex: state.historyIndex - 1
      };
    }

    case 'REDO': {
      if (state.historyIndex >= state.history.length - 1) return state;
      const nextState = state.history[state.historyIndex + 1];
      return {
        ...state,
        ...nextState,
        history: state.history,
        historyIndex: state.historyIndex + 1
      };
    }

    case 'UPDATE_NODES_BATCH': {
      return {
        ...state,
        nodes: action.payload
      };
    }

    default:
      return state;
  }
}

function addToHistory(oldState, newState) {
  const stateToSave = {
    nodes: newState.nodes,
    edges: newState.edges,
    directed: newState.directed,
    weighted: newState.weighted
  };

  const newHistory = oldState.history.slice(0, oldState.historyIndex + 1);
  newHistory.push(stateToSave);

  // Limit history size
  if (newHistory.length > 50) {
    newHistory.shift();
  }

  return {
    ...newState,
    history: newHistory,
    historyIndex: newHistory.length - 1
  };
}

export function GraphProvider({ children }) {
  const [state, dispatch] = useReducer(graphReducer, initialState);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('graphLearningLab_graph');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        dispatch({ type: 'LOAD_GRAPH', payload: parsed });
      } catch (e) {
        console.error('Failed to load saved graph:', e);
      }
    }
  }, []);

  // Save to localStorage on changes
  useEffect(() => {
    if (state.nodes.length > 0 || state.edges.length > 0) {
      const toSave = {
        nodes: state.nodes,
        edges: state.edges,
        directed: state.directed,
        weighted: state.weighted
      };
      localStorage.setItem('graphLearningLab_graph', JSON.stringify(toSave));
    }
  }, [state.nodes, state.edges, state.directed, state.weighted]);

  return (
    <GraphContext.Provider value={{ state, dispatch }}>
      {children}
    </GraphContext.Provider>
  );
}

export function useGraph() {
  const context = useContext(GraphContext);
  if (!context) {
    throw new Error('useGraph must be used within a GraphProvider');
  }
  return context;
}

export default GraphContext;
