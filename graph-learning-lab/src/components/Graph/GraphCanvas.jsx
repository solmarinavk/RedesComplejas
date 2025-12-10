import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { useGraph } from '../../contexts/GraphContext';

// Color palette for communities
const COMMUNITY_COLORS = [
  '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'
];

export function GraphCanvas({
  width = 800,
  height = 600,
  nodeColors = {},      // { nodeId: color }
  nodeSizes = {},       // { nodeId: size }
  edgeColors = {},      // { edgeId: color }
  highlightedNodes = [],
  highlightedEdges = [],
  showLabels = true,
  showWeights = true,
  interactive = true,
  onNodeClick,
  onEdgeClick,
  onCanvasClick,
  layout = 'force',     // 'force', 'circular', 'grid'
  className = ''
}) {
  const svgRef = useRef(null);
  const simulationRef = useRef(null);
  const { state, dispatch } = useGraph();
  const { nodes, edges, directed, weighted, selectedNode, mode, connectingFrom } = state;

  const [tooltip, setTooltip] = useState(null);
  const [transform, setTransform] = useState(d3.zoomIdentity);

  // Handle canvas click for adding nodes
  const handleCanvasClick = useCallback((event) => {
    if (!interactive) return;

    const svg = svgRef.current;
    const point = d3.pointer(event, svg);
    const [x, y] = transform.invert(point);

    if (mode === 'addNode') {
      dispatch({
        type: 'ADD_NODE',
        payload: { x, y }
      });
    } else if (onCanvasClick) {
      onCanvasClick({ x, y });
    }
  }, [mode, transform, dispatch, interactive, onCanvasClick]);

  // Handle node click
  const handleNodeClick = useCallback((event, node) => {
    event.stopPropagation();

    if (!interactive) {
      if (onNodeClick) onNodeClick(node);
      return;
    }

    if (mode === 'delete') {
      dispatch({ type: 'REMOVE_NODE', payload: node.id });
    } else if (mode === 'addEdge') {
      if (connectingFrom === null) {
        dispatch({ type: 'SET_CONNECTING_FROM', payload: node.id });
      } else if (connectingFrom !== node.id) {
        dispatch({
          type: 'ADD_EDGE',
          payload: { source: connectingFrom, target: node.id }
        });
      } else {
        dispatch({ type: 'SET_CONNECTING_FROM', payload: null });
      }
    } else {
      dispatch({ type: 'SELECT_NODE', payload: node.id });
      if (onNodeClick) onNodeClick(node);
    }
  }, [mode, connectingFrom, dispatch, interactive, onNodeClick]);

  // Handle edge click
  const handleEdgeClick = useCallback((event, edge) => {
    event.stopPropagation();

    if (!interactive) {
      if (onEdgeClick) onEdgeClick(edge);
      return;
    }

    if (mode === 'delete') {
      dispatch({ type: 'REMOVE_EDGE', payload: edge.id });
    } else {
      dispatch({ type: 'SELECT_EDGE', payload: edge.id });
      if (onEdgeClick) onEdgeClick(edge);
    }
  }, [mode, dispatch, interactive, onEdgeClick]);

  // Handle node drag
  const handleDrag = useCallback((simulation) => {
    function dragstarted(event, d) {
      if (!interactive || mode !== 'select') return;
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      if (!interactive || mode !== 'select') return;
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!interactive || mode !== 'select') return;
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;

      dispatch({
        type: 'UPDATE_NODE_POSITION',
        payload: { id: d.id, x: d.x, y: d.y }
      });
    }

    return d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);
  }, [interactive, mode, dispatch]);

  // Main D3 rendering effect
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create arrow marker for directed graphs
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

    // Container for zoom
    const g = svg.append('g');

    // Setup zoom
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        setTransform(event.transform);
      });

    svg.call(zoom);

    // Create links
    const nodeMap = new Map(nodes.map(n => [n.id, { ...n }]));

    const linkData = edges.map(e => ({
      ...e,
      source: nodeMap.get(e.source) || { id: e.source, x: 0, y: 0 },
      target: nodeMap.get(e.target) || { id: e.target, x: 0, y: 0 }
    }));

    // Draw edges
    const links = g.append('g')
      .attr('class', 'edges')
      .selectAll('line')
      .data(linkData)
      .join('line')
      .attr('class', d => `edge ${highlightedEdges.includes(d.id) ? 'highlighted' : ''}`)
      .attr('stroke', d => edgeColors[d.id] || (highlightedEdges.includes(d.id) ? '#22d3ee' : '#475569'))
      .attr('stroke-width', d => highlightedEdges.includes(d.id) ? 3 : 2)
      .attr('stroke-opacity', 0.8)
      .attr('marker-end', directed ? (d => highlightedEdges.includes(d.id) ? 'url(#arrowhead-highlighted)' : 'url(#arrowhead)') : null)
      .style('cursor', interactive ? 'pointer' : 'default')
      .on('click', (event, d) => handleEdgeClick(event, d));

    // Edge labels for weights
    if (weighted && showWeights) {
      g.append('g')
        .attr('class', 'edge-labels')
        .selectAll('text')
        .data(linkData)
        .join('text')
        .attr('class', 'edge-label')
        .attr('font-size', 10)
        .attr('fill', '#94a3b8')
        .attr('text-anchor', 'middle')
        .text(d => d.weight || '');
    }

    // Draw nodes
    const nodeData = nodes.map(n => ({ ...n }));

    const nodeGroup = g.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(nodeData)
      .join('g')
      .attr('class', 'node-group')
      .style('cursor', interactive ? 'pointer' : 'default');

    // Node circles
    nodeGroup.append('circle')
      .attr('class', d => `node ${selectedNode === d.id ? 'selected' : ''} ${highlightedNodes.includes(d.id) ? 'highlighted' : ''}`)
      .attr('r', d => nodeSizes[d.id] || 12)
      .attr('fill', d => nodeColors[d.id] || (highlightedNodes.includes(d.id) ? '#22d3ee' : '#3b82f6'))
      .attr('stroke', d => {
        if (selectedNode === d.id) return '#fbbf24';
        if (connectingFrom === d.id) return '#22d3ee';
        return '#1e293b';
      })
      .attr('stroke-width', d => selectedNode === d.id || connectingFrom === d.id ? 3 : 2)
      .on('click', (event, d) => handleNodeClick(event, d))
      .on('mouseenter', (event, d) => {
        setTooltip({
          x: event.pageX,
          y: event.pageY,
          content: `Nodo ${d.label || d.id}`
        });
      })
      .on('mouseleave', () => setTooltip(null));

    // Node labels
    if (showLabels) {
      nodeGroup.append('text')
        .attr('class', 'node-label')
        .attr('text-anchor', 'middle')
        .attr('dy', '.35em')
        .attr('font-size', 10)
        .attr('fill', '#f1f5f9')
        .attr('pointer-events', 'none')
        .text(d => d.label || d.id);
    }

    // Setup force simulation if using force layout
    if (layout === 'force') {
      const simulation = d3.forceSimulation(nodeData)
        .force('link', d3.forceLink(linkData)
          .id(d => d.id)
          .distance(100))
        .force('charge', d3.forceManyBody().strength(-300))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(30));

      simulationRef.current = simulation;

      simulation.on('tick', () => {
        links
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y);

        nodeGroup.attr('transform', d => `translate(${d.x},${d.y})`);

        if (weighted && showWeights) {
          g.selectAll('.edge-label')
            .attr('x', d => (d.source.x + d.target.x) / 2)
            .attr('y', d => (d.source.y + d.target.y) / 2);
        }
      });

      nodeGroup.call(handleDrag(simulation));
    } else if (layout === 'circular') {
      // Circular layout
      const radius = Math.min(width, height) / 3;
      nodeData.forEach((node, i) => {
        const angle = (2 * Math.PI * i) / nodeData.length - Math.PI / 2;
        node.x = width / 2 + radius * Math.cos(angle);
        node.y = height / 2 + radius * Math.sin(angle);
      });

      links
        .attr('x1', d => nodeMap.get(d.source.id)?.x || d.source.x)
        .attr('y1', d => nodeMap.get(d.source.id)?.y || d.source.y)
        .attr('x2', d => nodeMap.get(d.target.id)?.x || d.target.x)
        .attr('y2', d => nodeMap.get(d.target.id)?.y || d.target.y);

      nodeGroup.attr('transform', d => `translate(${d.x},${d.y})`);
    } else {
      // Use stored positions
      links
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      nodeGroup.attr('transform', d => `translate(${d.x},${d.y})`);
    }

    // Click handler for canvas
    svg.on('click', handleCanvasClick);

    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
    };
  }, [
    nodes, edges, directed, weighted, selectedNode, connectingFrom, mode,
    width, height, nodeColors, nodeSizes, edgeColors, highlightedNodes, highlightedEdges,
    showLabels, showWeights, interactive, layout, handleDrag, handleNodeClick, handleEdgeClick, handleCanvasClick
  ]);

  return (
    <div className={`relative ${className}`}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="graph-canvas bg-slate-900 rounded-lg border border-slate-700"
        style={{ touchAction: 'none' }}
      />

      {/* Tooltip */}
      {tooltip && (
        <div
          className="tooltip"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y + 10
          }}
        >
          {tooltip.content}
        </div>
      )}

      {/* Connection indicator */}
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
