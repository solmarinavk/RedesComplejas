import { useState, useCallback } from 'react';
import { useGraph } from '../contexts/GraphContext';
import {
  pageRank,
  pageRankStep,
  labelPropagation,
  louvain,
  girvanNewman,
  bfsWithSteps,
  dijkstraWithSteps
} from '../utils/algorithms';

/**
 * Hook for running algorithms with step-by-step visualization
 */
export function useAlgorithm() {
  const { state } = useGraph();
  const { nodes, edges, directed, weighted } = state;

  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [results, setResults] = useState(null);
  const [steps, setSteps] = useState([]);

  const graph = { nodes, edges, directed, weighted };

  // PageRank
  const runPageRank = useCallback((options = {}) => {
    setIsRunning(true);
    const result = pageRank(graph, { ...options, returnHistory: true });
    setResults(result);
    setSteps(result.history || []);
    setCurrentStep(0);
    setIsRunning(false);
    return result;
  }, [graph]);

  const stepPageRank = useCallback((currentScores, dampingFactor = 0.85) => {
    return pageRankStep(graph, currentScores, dampingFactor);
  }, [graph]);

  // Community Detection
  const runLabelPropagation = useCallback(() => {
    setIsRunning(true);
    const result = labelPropagation(graph);
    setResults(result);
    setIsRunning(false);
    return result;
  }, [graph]);

  const runLouvain = useCallback(() => {
    setIsRunning(true);
    const result = louvain(graph);
    setResults(result);
    setIsRunning(false);
    return result;
  }, [graph]);

  const runGirvanNewman = useCallback((targetCommunities = 2) => {
    setIsRunning(true);
    const stepsResult = girvanNewman(graph, targetCommunities);
    setSteps(stepsResult);
    setCurrentStep(0);
    setResults({
      communities: stepsResult[stepsResult.length - 1]?.components || 0,
      steps: stepsResult
    });
    setIsRunning(false);
    return stepsResult;
  }, [graph]);

  // Shortest Path
  const runBFS = useCallback((sourceId, targetId = null) => {
    setIsRunning(true);
    const result = bfsWithSteps(graph, sourceId, targetId);
    setResults(result);
    setSteps(result.steps);
    setCurrentStep(0);
    setIsRunning(false);
    return result;
  }, [graph]);

  const runDijkstra = useCallback((sourceId, targetId = null) => {
    setIsRunning(true);
    const result = dijkstraWithSteps(graph, sourceId, targetId);
    setResults(result);
    setSteps(result.steps);
    setCurrentStep(0);
    setIsRunning(false);
    return result;
  }, [graph]);

  // Step navigation
  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, steps.length]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback((step) => {
    if (step >= 0 && step < steps.length) {
      setCurrentStep(step);
    }
  }, [steps.length]);

  const reset = useCallback(() => {
    setResults(null);
    setSteps([]);
    setCurrentStep(0);
  }, []);

  return {
    // State
    isRunning,
    currentStep,
    totalSteps: steps.length,
    results,
    steps,
    currentStepData: steps[currentStep] || null,

    // PageRank
    runPageRank,
    stepPageRank,

    // Community Detection
    runLabelPropagation,
    runLouvain,
    runGirvanNewman,

    // Shortest Path
    runBFS,
    runDijkstra,

    // Navigation
    nextStep,
    prevStep,
    goToStep,
    reset
  };
}

export default useAlgorithm;
