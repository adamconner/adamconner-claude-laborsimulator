/**
 * Application State Management
 * Centralized state for the AI Labor Market Simulator
 */

// HTML escape helper for XSS prevention
export const escapeHtml = (str) => {
    if (str === null || str === undefined) return '';
    const div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
};

// Global service instances
export let dataService = null;
export let indicators = null;
export let simulationEngine = null;
export let interventionSystem = null;
export let vizManager = null;

// Current state
export let currentResults = null;
export let currentAIAnalysis = null;
export let isAISimulationResult = false;
export let baselineUnemploymentRate = null;

// Default configuration values
export const DEFAULT_CONFIG = {
    scenarioName: 'My Scenario',
    targetYear: '2029',
    targetUR: 10,
    aiAdoption: 70,
    automationPace: 'moderate',
    adoptionCurve: 's_curve'
};

// Storage keys
export const STORAGE_KEY = 'ai_labor_simulator_saved_simulations';
export const API_KEYS_STORAGE = {};

// State setters
export function setDataService(service) {
    dataService = service;
}

export function setIndicators(ind) {
    indicators = ind;
}

export function setSimulationEngine(engine) {
    simulationEngine = engine;
}

export function setInterventionSystem(system) {
    interventionSystem = system;
}

export function setVizManager(manager) {
    vizManager = manager;
}

export function setCurrentResults(results) {
    currentResults = results;
}

export function setCurrentAIAnalysis(analysis) {
    currentAIAnalysis = analysis;
}

export function setIsAISimulationResult(value) {
    isAISimulationResult = value;
}

export function setBaselineUnemploymentRate(rate) {
    baselineUnemploymentRate = rate;
}

// Export to window for backwards compatibility
if (typeof window !== 'undefined') {
    window.escapeHtml = escapeHtml;
    window.DEFAULT_CONFIG = DEFAULT_CONFIG;
    window.STORAGE_KEY = STORAGE_KEY;

    // Expose state getters on window
    Object.defineProperty(window, 'dataService', {
        get: () => dataService,
        set: (v) => { dataService = v; }
    });
    Object.defineProperty(window, 'indicators', {
        get: () => indicators,
        set: (v) => { indicators = v; }
    });
    Object.defineProperty(window, 'simulationEngine', {
        get: () => simulationEngine,
        set: (v) => { simulationEngine = v; }
    });
    Object.defineProperty(window, 'interventionSystem', {
        get: () => interventionSystem,
        set: (v) => { interventionSystem = v; }
    });
    Object.defineProperty(window, 'vizManager', {
        get: () => vizManager,
        set: (v) => { vizManager = v; }
    });
    Object.defineProperty(window, 'currentResults', {
        get: () => currentResults,
        set: (v) => { currentResults = v; }
    });
    Object.defineProperty(window, 'currentAIAnalysis', {
        get: () => currentAIAnalysis,
        set: (v) => { currentAIAnalysis = v; }
    });
    Object.defineProperty(window, 'isAISimulationResult', {
        get: () => isAISimulationResult,
        set: (v) => { isAISimulationResult = v; }
    });
    Object.defineProperty(window, 'baselineUnemploymentRate', {
        get: () => baselineUnemploymentRate,
        set: (v) => { baselineUnemploymentRate = v; }
    });
}
