/**
 * Type definitions for AI Labor Market Simulator
 */

// ============================================
// Core Data Types
// ============================================

export interface LaborMarketSnapshot {
    unemployment_rate: number;
    total_employment: number;
    labor_force_participation: number;
    job_openings: number;
    unemployed_count: number;
}

export interface WageData {
    median_weekly: number;
    average_hourly: number;
    real_wage_growth: number;
}

export interface ProductivityData {
    growth_rate: number;
    output_per_hour: number;
}

export interface SectorData {
    [sectorName: string]: {
        employment: number;
        automation_exposure: number;
        growth_rate?: number;
        median_wage?: number;
    };
}

export interface EconomicSnapshot {
    timestamp: string;
    dataSource: 'live' | 'baseline';
    dataDate: string;
    lastUpdated: string | null;
    labor_market: LaborMarketSnapshot;
    wages: WageData;
    productivity: ProductivityData;
    sectors: SectorData;
    ai_indicators: AIIndicators;
    demographics: DemographicData;
}

// ============================================
// AI Indicators
// ============================================

export interface AIIndicators {
    ai_adoption_rate?: number;
    automation_investment?: number;
    ai_patents?: number;
    ai_job_postings_growth?: number;
    ai_enterprise_adoption?: number;
}

// ============================================
// Demographics
// ============================================

export interface DemographicData {
    age_groups: {
        [ageGroup: string]: {
            unemployment_rate: number;
            labor_force_participation: number;
        };
    };
    education_levels: {
        [level: string]: {
            unemployment_rate: number;
            median_wage: number;
        };
    };
    regions?: {
        [region: string]: {
            unemployment_rate: number;
            employment: number;
        };
    };
}

// ============================================
// Simulation Types
// ============================================

export interface ScenarioConfig {
    name: string;
    description?: string;
    end_year: number;
    target_unemployment: number;
    ai_adoption_rate: number;
    automation_pace: AutomationPace;
    adoption_curve: AdoptionCurve;
    gdp_growth?: number;
    inflation?: number;
    interest_rate?: number;
}

export type AutomationPace = 'slow' | 'moderate' | 'fast' | 'accelerating';
export type AdoptionCurve = 'linear' | 's_curve' | 'exponential';

export interface Scenario {
    id: number;
    name: string;
    description: string;
    created: string;
    timeframe: {
        start_year: number;
        end_year: number;
        steps_per_year: number;
    };
    targets: {
        unemployment_rate: number;
        ai_adoption_rate: number;
        productivity_growth: number;
        automation_pace: AutomationPace;
    };
    ai_parameters: {
        adoption_curve: AdoptionCurve;
        sector_variation: boolean;
        displacement_lag: number;
        new_job_multiplier: number;
    };
    economic_parameters: {
        gdp_growth: number;
        inflation: number;
        interest_rate: number;
        labor_elasticity: number;
    };
    interventions: Intervention[];
}

export interface SimulationStep {
    year: number;
    month: number;
    ai_adoption: number;
    unemployment_rate: number;
    employment: number;
    gdp_growth: number;
    inflation: number;
    wages: WageData;
    jobs_displaced: number;
    jobs_created: number;
    intervention_effects: InterventionEffect[];
}

export interface SimulationResults {
    scenario: Scenario;
    timeline: SimulationStep[];
    summary: SimulationSummary;
    analysis?: AIAnalysis;
}

export interface SimulationSummary {
    duration_years: number;
    total_steps: number;
    initial_unemployment_rate: number;
    final_unemployment_rate: number;
    peak_unemployment_rate: number;
    labor_market_changes: {
        unemployment_rate: { initial: number; final: number; change: number };
        employment: { initial: number; final: number; change: number };
    };
    ai_adoption: {
        initial_rate: number;
        final_rate: number;
    };
    job_impact: {
        total_displaced: number;
        total_created: number;
        net_change: number;
    };
    wages: {
        median_weekly: { initial: number; final: number; change: number };
        real_wage_growth: { initial: number; final: number };
    };
    productivity: {
        growth_rate: { initial: number; final: number };
    };
    interventions: InterventionSummary[];
}

// ============================================
// Interventions
// ============================================

export type InterventionType =
    | 'universal_basic_income'
    | 'job_retraining'
    | 'wage_subsidy'
    | 'education_subsidy'
    | 'reduced_work_week'
    | 'robot_tax'
    | 'public_works'
    | 'eitc_expansion'
    | 'ai_regulation';

export interface InterventionParams {
    [key: string]: number | string | boolean;
}

export interface Intervention {
    id: string;
    type: InterventionType;
    name: string;
    description: string;
    category: string;
    active: boolean;
    params: InterventionParams;
    start_year?: number;
    end_year?: number;
}

export interface InterventionEffect {
    type: InterventionType;
    unemployment_effect: number;
    wage_effect: number;
    cost: number;
}

export interface InterventionSummary {
    type: InterventionType;
    name: string;
    total_cost: number;
    unemployment_reduction: number;
    beneficiaries: number;
}

// ============================================
// Agent-Based Model Types
// ============================================

export type EmploymentStatus = 'employed' | 'unemployed' | 'retired' | 'student' | 'discouraged';
export type EducationLevel = 'less_than_hs' | 'high_school' | 'some_college' | 'bachelors' | 'graduate';
export type AIExperience = 'none' | 'user' | 'developer' | 'expert';
export type AIAdoptionStatus = 'none' | 'exploring' | 'piloting' | 'scaling' | 'mature';
export type FirmSize = 'small' | 'medium' | 'large' | 'enterprise';
export type LaborStrategy = 'cost_minimizer' | 'talent_investor' | 'balanced';

export interface WorkerAgentState {
    id: string;
    age: number;
    education: EducationLevel;
    skills: number[];
    wage: number;
    status: EmploymentStatus;
    firmId: string | null;
    regionId: string;
    aiExperience: AIExperience;
    jobSearchIntensity: number;
    displacementRisk: number;
    retrainingProgress: number;
}

export interface FirmAgentState {
    id: string;
    size: FirmSize;
    industry: string;
    region: string;
    employees: number;
    aiAdoption: AIAdoptionStatus;
    aiInvestment: number;
    laborStrategy: LaborStrategy;
    laborDemand: number;
    wages: { min: number; max: number; median: number };
}

export interface ABMConfig {
    numWorkers: number;
    numFirms: number;
    numRegions: number;
    durationMonths: number;
    onProgress?: (progress: ABMProgress) => void;
}

export interface ABMProgress {
    month: number;
    totalMonths: number;
    unemploymentRate: number;
    aiAdoptionRate: number;
}

export interface ABMResults {
    timeline: ABMTimelineStep[];
    summary: ABMSummary;
    workers: WorkerAgentState[];
    firms: FirmAgentState[];
}

export interface ABMTimelineStep {
    month: number;
    year: number;
    unemploymentRate: number;
    aiAdoptionRate: number;
    medianWage: number;
    jobOpenings: number;
    hires: number;
    layoffs: number;
    policySupport: Record<string, number>;
}

export interface ABMSummary {
    initial: {
        unemploymentRate: number;
        aiAdoptionRate: number;
    };
    final: {
        unemploymentRate: number;
        aiAdoptionRate: number;
    };
    peakUnemployment: number;
    totalHires: number;
    totalLayoffs: number;
    emergentPatterns: EmergentPattern[];
    finalPolicySupport: Record<string, PolicySupportStats>;
}

export interface EmergentPattern {
    type: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
    timeframe: { start: number; end: number };
}

export interface PolicySupportStats {
    mean: number;
    std: number;
    feasibilityScore: number;
}

// ============================================
// AI Analysis Types
// ============================================

export interface AIAnalysis {
    summary: string;
    keyFindings: string[];
    policyRecommendations: string[];
    uncertainties: string[];
    generatedAt: string;
}

// ============================================
// Visualization Types
// ============================================

export interface ChartConfig {
    type: 'line' | 'bar' | 'doughnut' | 'scatter';
    labels: string[];
    datasets: ChartDataset[];
    options?: Record<string, unknown>;
}

export interface ChartDataset {
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
    fill?: boolean;
    tension?: number;
}

// ============================================
// Service Types
// ============================================

export interface EconomicDataService {
    loadBaselineData(): Promise<unknown>;
    loadLiveData(): Promise<unknown>;
    getCurrentSnapshot(): Promise<EconomicSnapshot>;
    getSectorData(): Promise<SectorData>;
    getDemographicData(): Promise<DemographicData>;
    getAIIndicators(): Promise<AIIndicators>;
    getHistoricalTrends(): Promise<unknown>;
    getLiveDataStatus(): LiveDataStatus;
}

export interface LiveDataStatus {
    available: boolean;
    lastUpdated: string | null;
    sources: {
        bls: 'success' | 'failed' | 'unavailable';
        fred: 'success' | 'failed' | 'unavailable';
    };
    summary?: Record<string, number>;
}

// ============================================
// Global Window Extensions
// ============================================

declare global {
    interface Window {
        // Data Services
        EconomicDataService: new () => EconomicDataService;
        dataService: EconomicDataService;

        // Simulation
        SimulationEngine: new (dataService: EconomicDataService, indicators: unknown) => unknown;
        simulationEngine: unknown;
        InterventionSystem: new () => unknown;
        interventionSystem: unknown;

        // Indicators
        EconomicIndicators: new () => unknown;
        indicators: unknown;

        // Visualization
        VisualizationManager: new () => unknown;
        vizManager: unknown;

        // ABM
        ABMSimulationEngine: new (config: ABMConfig) => unknown;
        WorkerAgent: new (config: unknown) => unknown;
        FirmAgent: new (config: unknown) => unknown;

        // Utilities
        DOMUtils: {
            createElement: (tag: string, text?: string, attrs?: Record<string, unknown>) => HTMLElement;
            setText: (element: HTMLElement | string, text: string) => void;
            clearChildren: (element: HTMLElement | string) => void;
            appendChildren: (parent: HTMLElement, ...children: HTMLElement[]) => void;
            createFragment: (...elements: HTMLElement[]) => DocumentFragment;
            createTableRow: (cells: unknown[], rowAttrs?: Record<string, unknown>) => HTMLTableRowElement;
            createCard: (options: { title?: string; content?: string | HTMLElement; className?: string; style?: Record<string, string> }) => HTMLElement;
            createLoadingSpinner: (message?: string) => HTMLElement;
            createErrorMessage: (message: string) => HTMLElement;
            createStatDisplay: (options: { label: string; value: string | number; unit?: string; color?: string }) => HTMLElement;
            createButton: (options: { text: string; onClick?: () => void; className?: string; disabled?: boolean; style?: Record<string, string> }) => HTMLButtonElement;
            createProgressBar: (percentage: number, color?: string) => HTMLElement;
            createTag: (text: string, variant?: string) => HTMLElement;
            escapeHtml: (str: string) => string;
            parseSimpleMarkdown: (text: string) => DocumentFragment;
        };

        // Calculations
        EconomicCalculations: {
            okunLaw: (gdpGap: number, coefficient: number) => number;
            phillipsCurve: (unemployment: number, naturalRate: number, expectedInflation: number, slope: number) => number;
            beveridgeCurve: (vacancyRate: number) => number;
            giniCoefficient: (values: number[]) => number;
            compoundGrowth: (initial: number, rate: number, periods: number) => number;
            formatNumber: (value: number) => string;
            formatPercent: (value: number, precision?: number) => string;
        };

        // Features
        scenarioComparison: unknown;
        occupationDrilldown: unknown;
        sensitivityAnalysis: unknown;
        monteCarloSimulation: unknown;
        pdfExporter: unknown;
        regionalHeatMap: unknown;
        timelinePlayer: unknown;
        demographicsAnalyzer: unknown;
        skillsGapAnalyzer: unknown;

        // Services
        aiSummaryService: unknown;
        aiScenarioEnhancer: unknown;
        modelTrainer: unknown;
        resultsInterpreter: unknown;
        simulationHistory: unknown;
        simulationSharing: unknown;
    }
}

export {};
