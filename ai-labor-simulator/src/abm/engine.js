/**
 * ABM Simulation Engine
 *
 * Main engine that orchestrates the agent-based labor market simulation.
 * Coordinates workers, firms, training programs, and market dynamics over time.
 */

// Import agent classes in Node.js environment
// In browser, these are loaded via script tags before this file
if (typeof module !== 'undefined' && module.exports) {
    try {
        const { WorkerAgent: WA } = require('./agents/worker.js');
        const { FirmAgent: FA } = require('./agents/firm.js');
        const { TrainingProgramAgent: TPA } = require('./agents/training-program.js');
        const { LaborMarket: LM } = require('./market/labor-market.js');
        const { WageDynamics: WD } = require('./market/wage-dynamics.js');
        const { InformationDiffusion: ID } = require('./market/information.js');
        const { AICapabilityFrontier: AICF } = require('./environment/ai-frontier.js');
        const { RegionalMarketSystem: RMS } = require('./environment/regions.js');
        global.WorkerAgent = WA;
        global.FirmAgent = FA;
        global.TrainingProgramAgent = TPA;
        global.LaborMarket = LM;
        global.WageDynamics = WD;
        global.InformationDiffusion = ID;
        global.AICapabilityFrontier = AICF;
        global.RegionalMarketSystem = RMS;
    } catch (e) {
        console.warn('Some ABM classes not available:', e.message);
    }
}

class ABMSimulationEngine {
    constructor(config = {}) {
        this.config = {
            numWorkers: config.numWorkers || 10000,      // Default 10K for performance
            numFirms: config.numFirms || 500,
            numRegions: config.numRegions || 10,
            numTrainingPrograms: config.numTrainingPrograms || 50,
            durationMonths: config.durationMonths || 60, // 5 years default
            ...config
        };

        // Agent populations
        this.workers = [];
        this.firms = [];
        this.trainingPrograms = [];

        // Market mechanisms
        this.laborMarket = null;
        this.wageDynamics = null;
        this.informationDiffusion = null;

        // Environment
        this.aiCapability = null;
        this.regionalSystem = null;

        // Results collection
        this.results = {
            monthly: [],
            monthlyData: [], // Alias for monthly (for compatibility with display functions)
            summary: null,
            policySupport: [],
            emergentPatterns: [],
            regionalSnapshots: [],
            wageDistribution: []
        };

        // Simulation state
        this.currentMonth = 0;
        this.isRunning = false;
        this.isPaused = false;

        // Callbacks
        this.onProgress = config.onProgress || null;
        this.onComplete = config.onComplete || null;
    }

    /**
     * Initialize the simulation with agents
     */
    async initialize(scenario = {}) {
        console.log('Initializing ABM simulation...');

        // Create AI capability tracker (use new separate module if available)
        if (typeof AICapabilityFrontier !== 'undefined') {
            this.aiCapability = new AICapabilityFrontier(scenario);
        } else {
            // Fallback to inline implementation
            this.aiCapability = new AICapabilityFrontierInline(scenario);
        }

        // Initialize regional system (use new module if available)
        if (typeof RegionalMarketSystem !== 'undefined') {
            this.regionalSystem = new RegionalMarketSystem(this.config.numRegions);
        }

        // Generate worker population
        this.workers = this._generateWorkers(this.config.numWorkers, scenario);
        console.log(`Created ${this.workers.length} worker agents`);

        // Generate firm population
        this.firms = this._generateFirms(this.config.numFirms, scenario);
        console.log(`Created ${this.firms.length} firm agents`);

        // Generate training programs
        this.trainingPrograms = this._generateTrainingPrograms(this.config.numTrainingPrograms, scenario);
        console.log(`Created ${this.trainingPrograms.length} training program agents`);

        // Assign workers to firms (initial employment)
        this._assignInitialEmployment();

        // Build worker networks
        this._buildWorkerNetworks();

        // Set competitors for firms
        this._setFirmCompetitors();

        // Initialize labor market
        this.laborMarket = new LaborMarket({
            workers: this.workers,
            firms: this.firms,
            searchRadius: 2
        });

        // Initialize wage dynamics (if available)
        if (typeof WageDynamics !== 'undefined') {
            this.wageDynamics = new WageDynamics();
        }

        // Initialize information diffusion (if available)
        if (typeof InformationDiffusion !== 'undefined') {
            this.informationDiffusion = new InformationDiffusion();
        }

        // Reset state
        this.currentMonth = 0;
        this.results = {
            monthly: [],
            monthlyData: [], // Alias for monthly (for compatibility)
            summary: null,
            policySupport: [],
            emergentPatterns: [],
            regionalSnapshots: [],
            wageDistribution: []
        };

        console.log('ABM initialization complete');
        return this;
    }

    /**
     * Run the full simulation
     */
    async runSimulation(scenario = {}) {
        if (this.workers.length === 0) {
            await this.initialize(scenario);
        }

        this.isRunning = true;
        this.isPaused = false;

        const startTime = Date.now();

        try {
            for (let month = 0; month < this.config.durationMonths; month++) {
                if (!this.isRunning || this.isPaused) break;

                // Run one month of simulation
                await this._runMonth(month, scenario);

                // Collect monthly results
                this._collectMonthlyResults(month);

                // Progress callback
                if (this.onProgress) {
                    this.onProgress({
                        month,
                        totalMonths: this.config.durationMonths,
                        progress: (month + 1) / this.config.durationMonths,
                        currentStats: this.results.monthly[this.results.monthly.length - 1]
                    });
                }

                // Allow UI to update (yield to event loop)
                if (month % 12 === 0) {
                    await new Promise(resolve => setTimeout(resolve, 0));
                }
            }

            // Finalize results
            this._finalizeResults();

            this.isRunning = false;

            const duration = (Date.now() - startTime) / 1000;
            console.log(`Simulation complete in ${duration.toFixed(2)}s`);

            if (this.onComplete) {
                this.onComplete(this.results);
            }

            return this.results;

        } catch (error) {
            this.isRunning = false;
            console.error('Simulation error:', error);
            throw error;
        }
    }

    /**
     * Run a single month of simulation
     */
    async _runMonth(month, scenario) {
        this.currentMonth = month;

        // 1. Advance AI capabilities
        this.aiCapability.advance(month, scenario);

        // 2. Firms make AI adoption decisions
        this.firms.forEach(firm => {
            const competitors = this._getCompetitors(firm);
            firm.makeMonthlyDecisions(this.aiCapability, this.laborMarket, competitors);
        });

        // 3. Workers evaluate their situations and make decisions
        this.workers.forEach(worker => {
            worker.makeMonthlyDecisions(this.laborMarket, this.aiCapability, scenario.interventions);
        });

        // 4. Training programs process enrollments and graduations
        this._processTrainingPrograms(month);

        // 5. Labor market matching
        const matchingResults = this.laborMarket.runMonthlyMatching();

        // 6. Wage dynamics adjustment
        if (this.wageDynamics) {
            this.wageDynamics.adjustMarketWages(this.workers, this.firms, this.laborMarket);
        }

        // 7. Apply interventions
        if (scenario.interventions) {
            this._applyInterventions(scenario.interventions, month);
        }

        // 8. Information diffusion
        this._diffuseInformation(month, matchingResults);

        // 9. Update regional statistics
        if (this.regionalSystem) {
            this.regionalSystem.updateAllRegions(this.workers, this.firms);
        }

        // 10. Detect emergent patterns
        if (month > 0 && month % 6 === 0) {
            this._detectPatterns(month);
        }

        return matchingResults;
    }

    _generateWorkers(count, scenario) {
        const workers = [];

        // Use regional system for population distribution if available
        const selectRegion = this.regionalSystem
            ? () => this.regionalSystem.selectRegionByPopulation()
            : (regionPops) => this._selectRegion(regionPops);

        const regionPopulations = this._getRegionPopulations(this.config.numRegions);

        for (let i = 0; i < count; i++) {
            // Select region
            const region = this.regionalSystem
                ? this.regionalSystem.selectRegionByPopulation()
                : this._selectRegion(regionPopulations);

            const worker = new WorkerAgent({
                id: `w_${i}`,
                region,
                // Initial unemployment rate based on scenario
                status: Math.random() < (scenario.initialUnemploymentRate || 0.04)
                    ? 'unemployed'
                    : 'employed'
            });

            workers.push(worker);
        }

        return workers;
    }

    _generateFirms(count, scenario) {
        const firms = [];

        for (let i = 0; i < count; i++) {
            const region = this.regionalSystem
                ? this.regionalSystem.selectRegionByPopulation()
                : Math.floor(Math.random() * this.config.numRegions) + 1;

            const firm = new FirmAgent({
                id: `f_${i}`,
                region
            });

            // Initial AI adoption based on scenario
            if (scenario.initialAIAdoption && Math.random() < scenario.initialAIAdoption) {
                firm.aiAdoptionStatus = 'exploring';
            }

            firms.push(firm);
        }

        return firms;
    }

    _generateTrainingPrograms(count, scenario) {
        const programs = [];

        // Only generate if TrainingProgramAgent is available
        if (typeof TrainingProgramAgent === 'undefined') {
            return programs;
        }

        for (let i = 0; i < count; i++) {
            const region = this.regionalSystem
                ? this.regionalSystem.selectRegionByPopulation()
                : Math.floor(Math.random() * this.config.numRegions) + 1;

            const program = new TrainingProgramAgent({
                id: `prog_${i}`,
                region,
                subsidyAvailable: scenario.trainingSubsidy || 0.3
            });

            programs.push(program);
        }

        return programs;
    }

    _processTrainingPrograms(month) {
        if (this.trainingPrograms.length === 0) return;

        // Process each training program
        this.trainingPrograms.forEach(program => {
            program.processMonth(month);
        });

        // Enroll workers who want retraining
        const workersWantingRetraining = this.workers.filter(w =>
            w.wantsRetraining &&
            !w.retrainingProgram &&
            w.age < 60
        );

        // Match workers to programs
        workersWantingRetraining.forEach(worker => {
            // Find suitable program in same region (or nearby)
            const suitablePrograms = this.trainingPrograms.filter(p =>
                p.isAcceptingApplications() &&
                (p.region === worker.region || Math.random() < 0.2) // 20% chance to consider other regions
            );

            if (suitablePrograms.length > 0) {
                // Sort by best fit (ROI, quality, etc.)
                suitablePrograms.sort((a, b) => {
                    const roiA = a.calculateROIForWorker(worker);
                    const roiB = b.calculateROIForWorker(worker);
                    return roiB.roi - roiA.roi;
                });

                // Try to enroll in best program
                const result = suitablePrograms[0].enrollWorker(worker, month);
                if (result.success) {
                    worker.wantsRetraining = false;
                }
            }
        });
    }

    _assignInitialEmployment() {
        // Get employed workers
        const employedWorkers = this.workers.filter(w => w.status === 'employed');

        // Shuffle and assign to firms
        const shuffled = employedWorkers.sort(() => Math.random() - 0.5);

        let workerIndex = 0;
        this.firms.forEach(firm => {
            const targetEmployees = firm.targetHeadcount;

            for (let i = 0; i < targetEmployees && workerIndex < shuffled.length; i++) {
                const worker = shuffled[workerIndex++];
                worker.employer = firm;
                worker.industry = firm.industry;
                firm.employees.push(worker);
            }
        });
    }

    _buildWorkerNetworks() {
        // Simple network: each worker connected to ~10-50 other workers
        this.workers.forEach(worker => {
            const networkSize = worker.networkSize;
            const potentialContacts = this.workers.filter(w =>
                w.id !== worker.id &&
                (w.region === worker.region || Math.random() < 0.1) // Same region or random
            );

            // Shuffle and select
            const shuffled = potentialContacts.sort(() => Math.random() - 0.5);
            worker.network = shuffled.slice(0, Math.min(networkSize, shuffled.length));

            // Add closeness scores
            worker.network.forEach(contact => {
                contact.closeness = Math.random() * 0.5 + 0.3; // 0.3-0.8
            });
        });
    }

    _setFirmCompetitors() {
        // Group firms by industry
        const byIndustry = {};
        this.firms.forEach(firm => {
            if (!byIndustry[firm.industry]) {
                byIndustry[firm.industry] = [];
            }
            byIndustry[firm.industry].push(firm);
        });

        // Assign competitors (firms in same industry)
        this.firms.forEach(firm => {
            const sameindustry = byIndustry[firm.industry] || [];
            firm.competitors = sameindustry
                .filter(f => f.id !== firm.id)
                .slice(0, 10); // Max 10 competitors to track
        });
    }

    _getCompetitors(firm) {
        return firm.competitors || [];
    }

    _getRegionPopulations(numRegions) {
        // Simplified population distribution
        const populations = [];
        let total = 0;

        for (let i = 0; i < numRegions; i++) {
            // Some variation in region sizes
            const pop = 0.5 + Math.random() * 1.5;
            populations.push(pop);
            total += pop;
        }

        // Normalize
        return populations.map(p => p / total);
    }

    _selectRegion(regionPopulations) {
        const rand = Math.random();
        let cumulative = 0;

        for (let i = 0; i < regionPopulations.length; i++) {
            cumulative += regionPopulations[i];
            if (rand <= cumulative) {
                return i + 1;
            }
        }

        return regionPopulations.length;
    }

    _applyInterventions(interventions, month) {
        if (!interventions || !Array.isArray(interventions)) return;

        interventions.forEach(intervention => {
            if (!intervention.active) return;

            switch (intervention.type) {
                case 'ubi':
                    this._applyUBI(intervention, month);
                    break;
                case 'retraining':
                    this._applyRetraining(intervention, month);
                    break;
                case 'wage_subsidy':
                    this._applyWageSubsidy(intervention, month);
                    break;
                // Add more intervention types as needed
            }
        });
    }

    _applyUBI(intervention, month) {
        const amount = intervention.amount || 1000;
        const eligibleWorkers = this.workers.filter(w =>
            w.status === 'unemployed' || intervention.universal
        );

        eligibleWorkers.forEach(worker => {
            worker.receiveUBI(amount);
        });
    }

    _applyRetraining(intervention, month) {
        // If we have training programs, use them
        if (this.trainingPrograms.length > 0) {
            // Increase subsidies for training programs
            this.trainingPrograms.forEach(program => {
                program.receiveSubsidy(intervention.subsidyLevel || 0.5);
            });
            return;
        }

        // Fallback: direct enrollment (old behavior)
        const eligibleWorkers = this.workers.filter(w =>
            (w.status === 'unemployed' || w.wantsRetraining) &&
            w.age < 60 &&
            !w.retrainingProgram
        );

        const spotsAvailable = intervention.capacity || 1000;
        const enrolled = eligibleWorkers.slice(0, spotsAvailable);

        enrolled.forEach(worker => {
            worker.enrollInRetraining({
                id: `retrain_${month}_${worker.id}`,
                duration: intervention.duration || 6,
                skillsProvided: intervention.skills || {
                    dataAnalysis: 0.3,
                    programming: 0.2,
                    technical: 0.2
                }
            });
            worker.wantsRetraining = false;
        });
    }

    _applyWageSubsidy(intervention, month) {
        // Firms receive subsidy for maintaining employment
        this.firms.forEach(firm => {
            if (firm.employees.length > 0) {
                const subsidy = intervention.amountPerWorker || 500;
                firm.employees.forEach(worker => {
                    // Worker knows their job was protected
                    if (worker.markedForLayoff) {
                        worker.markedForLayoff = false;
                        worker.policySupport.wageSubsidy = Math.min(1,
                            worker.policySupport.wageSubsidy + 0.15);
                        worker.benefitedFromIntervention = 'wageSubsidy';
                    }
                });
            }
        });
    }

    _diffuseInformation(month, matchingResults = {}) {
        // Use advanced information diffusion if available
        if (this.informationDiffusion) {
            const marketConditions = {
                unemploymentRate: this.laborMarket.getMarketStatistics()?.unemploymentRate || 0.05,
                layoffCount: matchingResults.layoffs || 0,
                aiAdoptionRate: this.aiCapability.getCurrentLevel(),
                policyChanges: [] // Could track policy changes here
            };

            this.informationDiffusion.processMonth(this.workers, this.firms, month, marketConditions);
            return;
        }

        // Fallback: simple information diffusion
        this.workers.forEach(worker => {
            if (worker.network.length === 0) return;

            // Average information level of network
            const networkInfo = worker.network.reduce((sum, contact) =>
                sum + (contact.informationLevel || 0.5), 0) / worker.network.length;

            // Worker's info level moves toward network average
            const diff = networkInfo - worker.informationLevel;
            worker.informationLevel += diff * 0.05;
        });
    }

    _detectPatterns(month) {
        const stats = this.laborMarket.getMarketStatistics();
        const prevStats = this.results.monthly[this.results.monthly.length - 6];

        if (!prevStats) return;

        // Check for tipping points
        const unemploymentChange = stats.unemploymentRate - prevStats.unemploymentRate;
        if (Math.abs(unemploymentChange) > 0.02) {
            this.results.emergentPatterns.push({
                type: 'tipping_point',
                month,
                description: unemploymentChange > 0
                    ? `Unemployment spiked ${(unemploymentChange * 100).toFixed(1)}% in 6 months`
                    : `Rapid recovery: unemployment dropped ${(Math.abs(unemploymentChange) * 100).toFixed(1)}%`,
                metrics: { unemploymentChange }
            });
        }

        // Check for AI adoption cascade
        const aiAdoptionChange = stats.aiAdoptionRate - prevStats.aiAdoptionRate;
        if (aiAdoptionChange > 0.1) {
            this.results.emergentPatterns.push({
                type: 'feedback_loop',
                month,
                description: `AI adoption accelerated - ${(aiAdoptionChange * 100).toFixed(0)}% more firms adopting`,
                effect: 'Competitive pressure cascade'
            });
        }

        // Check information diffusion cascades
        if (this.informationDiffusion) {
            const cascades = this.informationDiffusion.detectCascades();
            cascades.forEach(cascade => {
                this.results.emergentPatterns.push({
                    type: 'information_cascade',
                    month,
                    description: `${cascade.type} ${cascade.direction} by ${(cascade.magnitude * 100).toFixed(1)}%`,
                    metrics: cascade
                });
            });
        }

        // Check for regional divergence
        if (this.regionalSystem) {
            const nationalStats = this.regionalSystem.getNationalStats();
            if (nationalStats.regionalVariation.stdDev > 0.03) {
                this.results.emergentPatterns.push({
                    type: 'regional_divergence',
                    month,
                    description: `Regional unemployment diverging (std dev: ${(nationalStats.regionalVariation.stdDev * 100).toFixed(1)}%)`,
                    metrics: nationalStats.regionalVariation
                });
            }
        }
    }

    _collectMonthlyResults(month) {
        const stats = this.laborMarket.getMarketStatistics();
        const policyStats = this.laborMarket.getPolicySupportStatistics();

        // AI adoption by status
        const aiAdoptionByStatus = {};
        ['none', 'exploring', 'piloting', 'scaling', 'mature'].forEach(status => {
            aiAdoptionByStatus[status] = this.firms.filter(f =>
                f.aiAdoptionStatus === status).length;
        });

        // Wage distribution
        let wageDistribution = null;
        if (this.wageDynamics) {
            wageDistribution = this.wageDynamics.getWageDistribution(this.workers);
        }

        // Training program stats
        const trainingStats = {
            totalPrograms: this.trainingPrograms.length,
            totalEnrolled: this.trainingPrograms.reduce((sum, p) => sum + p.currentEnrollment, 0),
            totalGraduates: this.trainingPrograms.reduce((sum, p) => sum + p.totalGraduates, 0),
            avgCompletionRate: this.trainingPrograms.length > 0
                ? this.trainingPrograms.reduce((sum, p) => sum + p.completionRate, 0) / this.trainingPrograms.length
                : 0
        };

        this.results.monthly.push({
            month,
            year: Math.floor(month / 12) + 2025,
            ...stats,
            aiAdoptionByStatus,
            policySupport: policyStats,
            wageDistribution,
            trainingStats,
            aiCapabilityLevel: this.aiCapability.getCurrentLevel()
        });

        // Track policy support trajectory
        this.results.policySupport.push({
            month,
            ...policyStats
        });

        // Track regional snapshots (every 6 months)
        if (this.regionalSystem && month % 6 === 0) {
            this.results.regionalSnapshots.push({
                month,
                regions: this.regionalSystem.getAllRegionSnapshots()
            });
        }

        // Track wage distribution
        if (wageDistribution) {
            this.results.wageDistribution.push({
                month,
                ...wageDistribution
            });
        }
    }

    _finalizeResults() {
        const firstMonth = this.results.monthly[0];
        const lastMonth = this.results.monthly[this.results.monthly.length - 1];

        // Provide monthlyData as alias for monthly (for compatibility with display functions)
        this.results.monthlyData = this.results.monthly;

        this.results.summary = {
            durationMonths: this.config.durationMonths,
            totalWorkers: this.config.numWorkers,
            totalFirms: this.config.numFirms,
            totalTrainingPrograms: this.trainingPrograms.length,

            initial: {
                unemploymentRate: firstMonth?.unemploymentRate || 0,
                aiAdoptionRate: firstMonth?.aiAdoptionRate || 0,
                medianWage: firstMonth?.medianWage || 0,
                aiCapabilityLevel: firstMonth?.aiCapabilityLevel || 0
            },

            final: {
                unemploymentRate: lastMonth?.unemploymentRate || 0,
                aiAdoptionRate: lastMonth?.aiAdoptionRate || 0,
                medianWage: lastMonth?.medianWage || 0,
                employed: lastMonth?.employed || 0,
                unemployed: lastMonth?.unemployed || 0,
                outOfLaborForce: lastMonth?.outOfLaborForce || 0,
                aiCapabilityLevel: lastMonth?.aiCapabilityLevel || 0
            },

            changes: {
                unemploymentChange: (lastMonth?.unemploymentRate || 0) - (firstMonth?.unemploymentRate || 0),
                wageChange: ((lastMonth?.medianWage || 0) - (firstMonth?.medianWage || 0)) / (firstMonth?.medianWage || 1),
                aiAdoptionChange: (lastMonth?.aiAdoptionRate || 0) - (firstMonth?.aiAdoptionRate || 0)
            },

            // Peak unemployment
            peakUnemployment: Math.max(...this.results.monthly.map(m => m.unemploymentRate)),
            peakUnemploymentMonth: this.results.monthly.findIndex(m =>
                m.unemploymentRate === Math.max(...this.results.monthly.map(m => m.unemploymentRate))),

            // Total job flows
            totalHires: this.results.monthly.reduce((sum, m) => sum + (m.monthlyHires || 0), 0),
            totalLayoffs: this.results.monthly.reduce((sum, m) => sum + (m.monthlyLayoffs || 0), 0),

            // Training outcomes
            trainingOutcomes: {
                totalGraduates: this.trainingPrograms.reduce((sum, p) => sum + p.totalGraduates, 0),
                totalDropouts: this.trainingPrograms.reduce((sum, p) => sum + p.totalDropouts, 0),
                avgCompletionRate: this.trainingPrograms.length > 0
                    ? this.trainingPrograms.reduce((sum, p) => sum + p.completionRate, 0) / this.trainingPrograms.length
                    : 0
            },

            // Wage inequality
            wageInequality: lastMonth?.wageDistribution ? {
                gini: lastMonth.wageDistribution.gini,
                p90p10Ratio: lastMonth.wageDistribution.p90 / (lastMonth.wageDistribution.p10 || 1)
            } : null,

            // Final policy support
            finalPolicySupport: lastMonth?.policySupport || {},

            // Emergent patterns
            emergentPatterns: this.results.emergentPatterns,

            // AI capability summary
            aiCapabilitySummary: this.aiCapability.getSummary ? this.aiCapability.getSummary() : null,

            // Information diffusion summary
            informationSummary: this.informationDiffusion?.getSummary() || null
        };
    }

    /**
     * Stop the simulation
     */
    stop() {
        this.isRunning = false;
    }

    /**
     * Pause the simulation
     */
    pause() {
        this.isPaused = true;
    }

    /**
     * Resume the simulation
     */
    resume() {
        this.isPaused = false;
    }

    /**
     * Get current state
     */
    getCurrentState() {
        return {
            month: this.currentMonth,
            isRunning: this.isRunning,
            isPaused: this.isPaused,
            workerCount: this.workers.length,
            firmCount: this.firms.length,
            trainingProgramCount: this.trainingPrograms.length,
            currentStats: this.laborMarket?.getMarketStatistics() || null,
            aiCapabilityLevel: this.aiCapability?.getCurrentLevel() || 0
        };
    }

    /**
     * Get detailed breakdown by region
     */
    getRegionalBreakdown() {
        if (!this.regionalSystem) {
            return null;
        }
        return this.regionalSystem.getAllRegionSnapshots();
    }

    /**
     * Get training program statistics
     */
    getTrainingStats() {
        return this.trainingPrograms.map(p => p.getSummary());
    }

    /**
     * Get wage analysis
     */
    getWageAnalysis() {
        if (!this.wageDynamics) {
            return null;
        }
        return this.wageDynamics.getSummary(this.workers);
    }
}

/**
 * Fallback AI Capability Frontier - Used when separate module not loaded
 */
class AICapabilityFrontierInline {
    constructor(scenario = {}) {
        this.scenario = scenario;
        this.currentLevel = scenario.initialAILevel || 0.3;
        this.adoptionCurve = scenario.adoptionCurve || 's_curve';
        this.automationPace = scenario.automationPace || 'moderate';
        this.occupationExposure = {};
    }

    advance(month, scenario) {
        const paceMultipliers = {
            slow: 0.5,
            moderate: 1.0,
            fast: 1.5,
            accelerating: 2.0
        };

        const pace = paceMultipliers[this.automationPace] || 1.0;

        switch (this.adoptionCurve) {
            case 'linear':
                this.currentLevel += 0.005 * pace;
                break;
            case 'exponential':
                this.currentLevel *= 1 + (0.01 * pace);
                break;
            case 's_curve':
            default:
                const midpoint = 60;
                const steepness = 0.05;
                const sCurveGrowth = 0.01 * pace / (1 + Math.exp(-steepness * (month - midpoint)));
                this.currentLevel += sCurveGrowth;
                break;
        }

        this.currentLevel = Math.min(0.95, this.currentLevel);
    }

    getCurrentLevel() {
        return this.currentLevel;
    }

    getOccupationExposure(occupation) {
        if (this.occupationExposure[occupation]) {
            return this.occupationExposure[occupation] * this.currentLevel;
        }
        this.occupationExposure[occupation] = 0.3 + Math.random() * 0.5;
        return this.occupationExposure[occupation] * this.currentLevel;
    }

    getSummary() {
        return {
            currentLevel: this.currentLevel,
            adoptionCurve: this.adoptionCurve,
            automationPace: this.automationPace
        };
    }
}

// Export for ES modules
export { ABMSimulationEngine, AICapabilityFrontierInline };

// Also export to window for backwards compatibility with script tags
if (typeof window !== 'undefined') {
    window.ABMSimulationEngine = ABMSimulationEngine;
    window.AICapabilityFrontierInline = AICapabilityFrontierInline;
}
