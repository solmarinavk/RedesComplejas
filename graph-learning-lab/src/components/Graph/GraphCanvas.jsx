import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { useGraph } from '../../contexts/GraphContext';

export function GraphCanvas({
  width: propWidth,
  height: propHeight = 500,
  nodeColors = {},
  nodeSizes = {},
  edgeColors = {},
  highlightedNodes = [],
  highlightedEdges = [],
  showLabels = true,
  showWeights = true,
  interactive = true,
  onNodeClick,
  onEdgeClick,
  onCanvasClick,
  layout = 'force',
  className = ''
}) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const gRef = useRef(null);
  const simulationRef = useRef(null);
  const nodesDataRef = useRef([]);
  const linksDataRef = useRef([]);
  const isInitializedRef = useRef(false);

  const { state, dispatch } = useGraph();
  const { nodes, edges, directed, weighted, selectedNode, mode, connectingFrom } = state;

  // Store current state in refs for use in D3 callbacks
  const stateRef = useRef({ mode, connectingFrom, selectedNode, directed, weighted });
  stateRef.current = { mode, connectingFrom, selectedNode, directed, weighted };

  const [tooltip, setTooltip] = useState(null);
  const [dimensions, setDimensions] = useState({ width: propWidth || 600, height: propHeight });

  // Track previous nodes/edges to detect real changes
  const prevDataRef = useRef({ nodesLength: 0, edgesLength: 0, nodeIds: '', edgeIds: '' });

  const { width, height } = dimensions;

  // Responsive dimensions
  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      const container = containerRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        setDimensions({
          width: propWidth || Math.max(300, rect.width - 4),
          height: propHeight
        });
      }
    };

    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, [propWidth, propHeight]);

  // Initialize SVG structure once
  useEffect(() => {
    if (!svgRef.current || isInitializedRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create defs for arrow markers
    const defs = svg.append('defs');

    defs.append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 20)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 8)
      .attr('markerHeight', 8)
      .append('path')
      .attr('d', 'M 0,-5 L 10,0 L 0,5')
      .attr('fill', '#475569');

    defs.append('marker')
      .attr('id', 'arrowhead-highlighted')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 20)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 8)
      .attr('markerHeight', 8)
      .append('path')
      .attr('d', 'M 0,-5 L 10,0 L 0,5')
      .attr('fill', '#22d3ee');

    // Create main group for zoom/pan
    const g = svg.append('g').attr('class', 'main-group');
    gRef.current = g;

    // Add sub-groups
    g.append('g').attr('class', 'edges-group');
    g.append('g').attr('class', 'edge-labels-group');
    g.append('g').attr('class', 'nodes-group');

    // Setup zoom
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);
    isInitializedRef.current = true;
  }, []);

  // Handle canvas click
  const handleCanvasClick = useCallback((event) => {
    if (!interactive) return;

    const target = event.target;
    if (target.classList.contains('node-circle') ||
        target.classList.contains('edge-line') ||
        target.classList.contains('node-label')) {
      return;
    }

    const svg = svgRef.current;
    if (!svg) return;

    const transform = d3.zoomTransform(svg);
    const rect = svg.getBoundingClientRect();
    const x = (event.clientX - rect.left - transform.x) / transform.k;
    const y = (event.clientY - rect.top - transform.y) / transform.k;

    if (stateRef.current.mode === 'addNode') {
      dispatch({ type: 'ADD_NODE', payload: { x, y } });
    } else if (onCanvasClick) {
      onCanvasClick({ x, y });
    }
  }, [interactive, dispatch, onCanvasClick]);

  // Function to update tick positions
  const updatePositions = useCallback(() => {
    if (!gRef.current) return;

    const g = gRef.current;
    const allLinks = g.select('.edges-group').selectAll('line.edge-line');
    const allNodeGroups = g.select('.nodes-group').selectAll('g.node-group');
    const edgeLabels = g.select('.edge-labels-group').selectAll('text.edge-label');

    allLinks
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);

    allNodeGroups.attr('transform', d => `translate(${d.x},${d.y})`);

    edgeLabels
      .attr('x', d => (d.source.x + d.target.x) / 2)
      .attr('y', d => (d.source.y + d.target.y) / 2);
  }, []);

  // Main data update effect - only runs when nodes/edges structure changes
  useEffect(() => {
    if (!svgRef.current || !gRef.current || width === 0) return;

    const svg = d3.select(svgRef.current);
    const g = gRef.current;
    const edgesGroup = g.select('.edges-group');
    const edgeLabelsGroup = g.select('.edge-labels-group');
    const nodesGroup = g.select('.nodes-group');

    // Show empty state
    svg.select('.empty-state').remove();
    if (nodes.length === 0) {
      svg.append('text')
        .attr('class', 'empty-state')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#64748b')
        .attr('font-size', '14px')
        .text(stateRef.current.mode === 'addNode' ? 'Haz clic aquí para crear un nodo' : 'Selecciona "Agregar Nodo" y haz clic aquí');

      edgesGroup.selectAll('*').remove();
      edgeLabelsGroup.selectAll('*').remove();
      nodesGroup.selectAll('*').remove();

      if (simulationRef.current) {
        simulationRef.current.stop();
        simulationRef.current = null;
      }
      nodesDataRef.current = [];
      linksDataRef.current = [];
      return;
    }

    // Check if data actually changed
    const currentNodeIds = nodes.map(n => n.id).sort().join(',');
    const currentEdgeIds = edges.map(e => e.id).sort().join(',');
    const dataChanged = currentNodeIds !== prevDataRef.current.nodeIds ||
                       currentEdgeIds !== prevDataRef.current.edgeIds;

    // Build node data - preserve existing positions
    const existingNodesMap = new Map(nodesDataRef.current.map(n => [n.id, n]));

    const nodeData = nodes.map(n => {
      const existing = existingNodesMap.get(n.id);
      if (existing) {
        return {
          ...n,
          x: existing.x,
          y: existing.y,
          vx: existing.vx || 0,
          vy: existing.vy || 0,
          fx: existing.fx,
          fy: existing.fy
        };
      }
      return {
        ...n,
        x: n.x !== undefined ? n.x : width / 2 + (Math.random() - 0.5) * 100,
        y: n.y !== undefined ? n.y : height / 2 + (Math.random() - 0.5) * 100
      };
    });

    nodesDataRef.current = nodeData;
    const nodeById = new Map(nodeData.map(n => [n.id, n]));

    // Build link data
    const linkData = edges
      .map(e => {
        const source = nodeById.get(e.source);
        const target = nodeById.get(e.target);
        if (!source || !target) return null;
        return { ...e, source, target };
      })
      .filter(Boolean);

    linksDataRef.current = linkData;

    // Update edges with D3 data join
    const links = edgesGroup.selectAll('line.edge-line')
      .data(linkData, d => d.id);

    links.exit().remove();

    const linksEnter = links.enter()
      .append('line')
      .attr('class', 'edge-line')
      .attr('stroke-opacity', 0.8)
      .style('cursor', interactive ? 'pointer' : 'default');

    const allLinks = linksEnter.merge(links);

    allLinks
      .attr('stroke', d => edgeColors[d.id] || (highlightedEdges.includes(d.id) ? '#22d3ee' : '#475569'))
      .attr('stroke-width', d => highlightedEdges.includes(d.id) ? 3 : 2)
      .attr('marker-end', stateRef.current.directed ? 'url(#arrowhead)' : null)
      .on('click', function(event, d) {
        event.stopPropagation();
        if (!interactive) {
          if (onEdgeClick) onEdgeClick(d);
          return;
        }
        if (stateRef.current.mode === 'delete') {
          dispatch({ type: 'REMOVE_EDGE', payload: d.id });
        } else {
          dispatch({ type: 'SELECT_EDGE', payload: d.id });
          if (onEdgeClick) onEdgeClick(d);
        }
      });

    // Update edge labels
    if (stateRef.current.weighted && showWeights) {
      const edgeLabels = edgeLabelsGroup.selectAll('text.edge-label')
        .data(linkData, d => d.id);

      edgeLabels.exit().remove();

      const edgeLabelsEnter = edgeLabels.enter()
        .append('text')
        .attr('class', 'edge-label')
        .attr('font-size', 10)
        .attr('fill', '#94a3b8')
        .attr('text-anchor', 'middle');

      edgeLabelsEnter.merge(edgeLabels).text(d => d.weight || '');
    } else {
      edgeLabelsGroup.selectAll('*').remove();
    }

    // Update nodes with D3 data join
    const nodeGroups = nodesGroup.selectAll('g.node-group')
      .data(nodeData, d => d.id);

    nodeGroups.exit().remove();

    const nodeGroupsEnter = nodeGroups.enter()
      .append('g')
      .attr('class', 'node-group')
      .style('cursor', interactive ? 'pointer' : 'default');

    nodeGroupsEnter.append('circle').attr('class', 'node-circle');

    if (showLabels) {
      nodeGroupsEnter.append('text')
        .attr('class', 'node-label')
        .attr('text-anchor', 'middle')
        .attr('dy', '.35em')
        .attr('font-size', 10)
        .attr('fill', '#f1f5f9')
        .attr('pointer-events', 'none');
    }

    const allNodeGroups = nodeGroupsEnter.merge(nodeGroups);

    // Update circle attributes (selection styles handled in separate effect)
    allNodeGroups.select('circle.node-circle')
      .attr('r', d => nodeSizes[d.id] || 12)
      .attr('fill', d => nodeColors[d.id] || (highlightedNodes.includes(d.id) ? '#22d3ee' : '#3b82f6'))
      .attr('stroke', '#1e293b')
      .attr('stroke-width', 2)
      .on('click', function(event, d) {
        event.stopPropagation();
        if (!interactive) {
          if (onNodeClick) onNodeClick(d);
          return;
        }
        const { mode: currentMode, connectingFrom: currentConnecting } = stateRef.current;

        if (currentMode === 'delete') {
          dispatch({ type: 'REMOVE_NODE', payload: d.id });
        } else if (currentMode === 'addEdge') {
          if (currentConnecting === null) {
            dispatch({ type: 'SET_CONNECTING_FROM', payload: d.id });
          } else if (currentConnecting !== d.id) {
            dispatch({ type: 'ADD_EDGE', payload: { source: currentConnecting, target: d.id } });
          } else {
            dispatch({ type: 'SET_CONNECTING_FROM', payload: null });
          }
        } else {
          dispatch({ type: 'SELECT_NODE', payload: d.id });
          if (onNodeClick) onNodeClick(d);
        }
      })
      .on('mouseenter', function(event, d) {
        if (!svgRef.current) return;
        const rect = svgRef.current.getBoundingClientRect();
        setTooltip({
          x: event.clientX - rect.left + 10,
          y: event.clientY - rect.top - 10,
          content: `Nodo ${d.label || d.id}`
        });
      })
      .on('mouseleave', () => setTooltip(null));

    if (showLabels) {
      allNodeGroups.select('text.node-label').text(d => d.label || '');
    }

    // Handle simulation
    if (layout === 'force') {
      const needsNewSimulation = !simulationRef.current || dataChanged;

      if (needsNewSimulation) {
        if (simulationRef.current) {
          simulationRef.current.stop();
        }

        const simulation = d3.forceSimulation(nodeData)
          .force('link', d3.forceLink(linkData).id(d => d.id).distance(80))
          .force('charge', d3.forceManyBody().strength(-200))
          .force('center', d3.forceCenter(width / 2, height / 2))
          .force('collision', d3.forceCollide().radius(25))
          .alphaDecay(0.02);

        simulation.on('tick', updatePositions);
        simulationRef.current = simulation;
      }

      // Setup drag
      const drag = d3.drag()
        .on('start', function(event, d) {
          if (!interactive || stateRef.current.mode !== 'select') return;
          if (!event.active && simulationRef.current) {
            simulationRef.current.alphaTarget(0.3).restart();
          }
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', function(event, d) {
          if (!interactive || stateRef.current.mode !== 'select') return;
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', function(event, d) {
          if (!interactive || stateRef.current.mode !== 'select') return;
          if (!event.active && simulationRef.current) {
            simulationRef.current.alphaTarget(0);
          }
          d.fx = null;
          d.fy = null;
          dispatch({ type: 'UPDATE_NODE_POSITION', payload: { id: d.id, x: d.x, y: d.y } });
        });

      allNodeGroups.call(drag);
    } else {
      if (simulationRef.current) {
        simulationRef.current.stop();
        simulationRef.current = null;
      }

      if (layout === 'circular') {
        const radius = Math.min(width, height) / 3;
        nodeData.forEach((node, i) => {
          const angle = (2 * Math.PI * i) / nodeData.length - Math.PI / 2;
          node.x = width / 2 + radius * Math.cos(angle);
          node.y = height / 2 + radius * Math.sin(angle);
        });
      }

      updatePositions();
    }

    // Update tracking refs
    prevDataRef.current = {
      nodesLength: nodes.length,
      edgesLength: edges.length,
      nodeIds: currentNodeIds,
      edgeIds: currentEdgeIds
    };

  }, [nodes, edges, width, height, layout, showWeights, showLabels,
      nodeColors, nodeSizes, edgeColors, highlightedNodes, highlightedEdges,
      interactive, dispatch, onNodeClick, onEdgeClick, updatePositions]);

  // Separate effect for selection visual updates (no simulation restart)
  useEffect(() => {
    if (!gRef.current) return;

    const nodesGroup = gRef.current.select('.nodes-group');

    nodesGroup.selectAll('circle.node-circle')
      .attr('stroke', function(d) {
        if (selectedNode === d.id) return '#fbbf24';
        if (connectingFrom === d.id) return '#22d3ee';
        return '#1e293b';
      })
      .attr('stroke-width', function(d) {
        return (selectedNode === d.id || connectingFrom === d.id) ? 3 : 2;
      });
  }, [selectedNode, connectingFrom]);

  // Update arrow markers when directed changes
  useEffect(() => {
    if (!gRef.current) return;

    gRef.current.select('.edges-group').selectAll('line.edge-line')
      .attr('marker-end', directed ? 'url(#arrowhead)' : null);
  }, [directed]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
    };
  }, []);

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="graph-canvas bg-slate-900 rounded-lg border border-slate-700"
        style={{ touchAction: 'none', display: 'block' }}
        onClick={handleCanvasClick}
      />

      {tooltip && (
        <div
          className="absolute z-50 px-3 py-2 text-sm bg-slate-700 text-slate-100 rounded-lg shadow-lg border border-slate-600 pointer-events-none"
          style={{
            left: Math.min(tooltip.x, width - 100),
            top: Math.max(tooltip.y, 10)
          }}
        >
          {tooltip.content}
        </div>
      )}

      {connectingFrom && (
        <div className="absolute top-4 left-4 px-3 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded-lg text-cyan-400 text-sm">
          Conectando desde nodo {nodes.find(n => n.id === connectingFrom)?.label}...
          <br />
          <span className="text-xs text-cyan-300">Haz clic en otro nodo para conectar</span>
        </div>
      )}
    </div>
  );
}

export default GraphCanvas;
