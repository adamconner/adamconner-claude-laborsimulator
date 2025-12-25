/**
 * AI Labor Market Simulator - Main Entry Point
 *
 * This file serves as the entry point for the Vite build.
 * It imports all modules and initializes the application.
 */

// Import Chart.js
import Chart from 'chart.js/auto';

// Make Chart available globally for existing code
window.Chart = Chart;

// Import core data and models
import { EconomicDataService } from './data/economic-data.js';
import { EconomicIndicators } from './models/indicators.js';
import { RealMetricsSystem } from './models/real-metrics.js';
import { HypotheticalIndicatorsSystem } from './models/hypothetical-indicators.js';

// Import simulation engine
import { SimulationEngine } from './simulation/engine.js';
import { InterventionSystem } from './simulation/interventions.js';

// Import utilities
import { EconomicCalculations } from './utils/calculations.js';
import * as DOMUtils from './utils/dom-utils.js';

// Import visualization
import { VisualizationManager } from './components/visualizations.js';

// Import services
import { AISummaryService } from './services/ai-summary.js';
import { AIScenarioEnhancer } from './services/ai-scenario-enhancer.js';
import { ModelTrainer } from './services/model-trainer.js';
import { ResultsInterpreter } from './services/results-interpreter.js';
import { SimulationHistoryService } from './services/simulation-history.js';
import { SimulationSharingService } from './services/simulation-sharing.js';

// Import features
import { ScenarioComparison } from './features/scenario-comparison.js';
import { OccupationDrilldown } from './features/occupation-drilldown.js';
import { PDFExporter } from './features/pdf-export.js';
import { PDFReportGenerator } from './features/pdf-report.js';
import { SensitivityAnalysis } from './features/sensitivity-analysis.js';
import { MonteCarloSimulation } from './features/monte-carlo.js';
import { InterventionCostCalculator } from './features/intervention-cost-calculator.js';
import { TimelinePlayer, TimelineUI, initializeTimeline } from './features/timeline-player.js';
import { RegionalHeatMap } from './features/regional-heatmap.js';
import { DemographicsAnalyzer } from './features/demographics-analysis.js';
import { ABMSensitivityAnalysis } from './features/abm-sensitivity.js';
import { SkillsGapAnalyzer } from './features/skills-gap-analysis.js';
import { showShareModal, hideShareModal, copyShareUrl } from './features/url-sharing.js';

// Import ABM components
import { WorkerAgent, EmploymentStatus, EducationLevel, AIExperience } from './abm/agents/worker.js';
import { FirmAgent, AIAdoptionStatus, FirmSize, LaborStrategy } from './abm/agents/firm.js';
import { TrainingProgramAgent, ProgramType, ProgramStatus } from './abm/agents/training-program.js';
import { LaborMarket } from './abm/market/labor-market.js';
import { WageDynamics } from './abm/market/wage-dynamics.js';
import { InformationDiffusion, InformationType, MediaEventType } from './abm/market/information.js';
import { AICapabilityFrontier, TaskCategories, OCCUPATION_AUTOMATION_DATA, INDUSTRY_AUTOMATION } from './abm/environment/ai-frontier.js';
import { Region, RegionalMarketSystem, US_REGIONS, INDUSTRY_SECTORS } from './abm/environment/regions.js';
import { ABMSimulationEngine, AICapabilityFrontierInline } from './abm/engine.js';
import { initializeABM, testABM } from './abm/index.js';

// Import worker manager
import { WorkerManager, ParallelSimulationManager } from './workers/worker-manager.js';

// Make DOMUtils globally available
window.DOMUtils = DOMUtils;

// The app.js file contains all application logic
// It will be loaded after all dependencies are available
// For now, we'll dynamically import it to ensure proper initialization

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    // Import and execute app.js
    await import('./app.js');

    // Call initApp if it exists on window
    if (typeof window.initApp === 'function') {
        window.initApp();
    }
});

// Export everything for potential module usage
export {
    // Chart
    Chart,

    // Data & Models
    EconomicDataService,
    EconomicIndicators,
    RealMetricsSystem,
    HypotheticalIndicatorsSystem,

    // Simulation
    SimulationEngine,
    InterventionSystem,

    // Utilities
    EconomicCalculations,
    DOMUtils,

    // Visualization
    VisualizationManager,

    // Services
    AISummaryService,
    AIScenarioEnhancer,
    ModelTrainer,
    ResultsInterpreter,
    SimulationHistoryService,
    SimulationSharingService,

    // Features
    ScenarioComparison,
    OccupationDrilldown,
    PDFExporter,
    PDFReportGenerator,
    SensitivityAnalysis,
    MonteCarloSimulation,
    InterventionCostCalculator,
    TimelinePlayer,
    TimelineUI,
    initializeTimeline,
    RegionalHeatMap,
    DemographicsAnalyzer,
    ABMSensitivityAnalysis,
    SkillsGapAnalyzer,
    showShareModal,
    hideShareModal,
    copyShareUrl,

    // ABM
    WorkerAgent,
    EmploymentStatus,
    EducationLevel,
    AIExperience,
    FirmAgent,
    AIAdoptionStatus,
    FirmSize,
    LaborStrategy,
    TrainingProgramAgent,
    ProgramType,
    ProgramStatus,
    LaborMarket,
    WageDynamics,
    InformationDiffusion,
    InformationType,
    MediaEventType,
    AICapabilityFrontier,
    TaskCategories,
    OCCUPATION_AUTOMATION_DATA,
    INDUSTRY_AUTOMATION,
    Region,
    RegionalMarketSystem,
    US_REGIONS,
    INDUSTRY_SECTORS,
    ABMSimulationEngine,
    AICapabilityFrontierInline,
    initializeABM,
    testABM,

    // Workers
    WorkerManager,
    ParallelSimulationManager
};
