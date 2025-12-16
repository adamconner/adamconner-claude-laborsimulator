/**
 * AI Labor Market Impact Simulator - Main Application
 */

// Global instances
let dataService;
let indicators;
let simulationEngine;
let interventionSystem;
let vizManager;
let currentResults = null;
let currentAIAnalysis = null;  // Store current AI analysis for re-viewing

// Default configuration values
const DEFAULT_CONFIG = {
    scenarioName: 'My Scenario',
    targetYear: '2029',
    targetUR: 10,
    aiAdoption: 70,
    automationPace: 'moderate',
    adoptionCurve: 's_curve'
};

// Storage key for saved simulations
const STORAGE_KEY = 'ai_labor_simulator_saved_simulations';

// Storage keys for API keys
const API_KEYS_STORAGE = {
    bls: 'ai_labor_sim_bls_api_key',
    fred: 'ai_labor_sim_fred_api_key',
    gemini: 'ai_labor_sim_gemini_api_key'
};

/**
 * Initialize the application
 */
async function initApp() {
    try {
        // Initialize services
        dataService = new EconomicDataService();
        indicators = new EconomicIndicators();
        interventionSystem = new InterventionSystem();
        vizManager = new VisualizationManager();
        vizManager.initDefaults();

        // Load baseline data
        await dataService.loadBaselineData();

        // Initialize simulation engine
        simulationEngine = new SimulationEngine(dataService, indicators);
        await simulationEngine.initialize();

        // Setup UI
        setupEventListeners();
        populateCurrentSnapshot();
        populateSectorTable();
        populateInterventionTypes();
        createHistoricalChart();
        createSectorChart();
        updateSavedSimulationsList();
        updateAISettingsStatus();
        renderHypotheticalIndicators();
        renderOccupationList();
        renderSensitivityOverview();
        await initializeRealMetrics();
        initializeSettings();

        // Check for shared simulation in URL
        await checkForSharedSimulation();

        console.log('AI Labor Market Simulator initialized');
    } catch (error) {
        console.error('Initialization error:', error);
        alert('Failed to initialize simulator. Please refresh the page.');
    }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Range slider value displays
    document.getElementById('targetUR').addEventListener('input', function() {
        document.getElementById('urValue').textContent = this.value;
    });

    document.getElementById('aiAdoption').addEventListener('input', function() {
        document.getElementById('aiValue').textContent = this.value;
    });
}

/**
 * Show section by ID
 */
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));

    // Show selected section
    document.getElementById(`${sectionId}-section`).classList.add('active');

    // Update nav tabs
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
}

/**
 * Populate current snapshot stats
 */
async function populateCurrentSnapshot() {
    const snapshot = await dataService.getCurrentSnapshot();

    document.getElementById('stat-ur').textContent =
        snapshot.labor_market.unemployment_rate.toFixed(1) + '%';
    document.getElementById('stat-emp').textContent =
        (snapshot.labor_market.total_employment / 1e6).toFixed(1) + 'M';
    document.getElementById('stat-lfpr').textContent =
        snapshot.labor_market.labor_force_participation.toFixed(1) + '%';
    document.getElementById('stat-jo').textContent =
        (snapshot.labor_market.job_openings / 1e6).toFixed(1) + 'M';
}

/**
 * Populate sector analysis table
 */
async function populateSectorTable() {
    const sectors = await dataService.getSectorData();
    const tbody = document.getElementById('sectorTableBody');

    const sectorExposure = indicators.calculateSectorExposure(sectors);
    const riskSummary = indicators.calculateJobsAtRisk(sectors);

    let html = '';
    for (const [key, data] of Object.entries(sectorExposure)) {
        const riskClass = data.risk_level === 'high' ? 'tag-high' :
            data.risk_level.includes('medium') ? 'tag-medium' : 'tag-low';

        html += `
            <tr>
                <td><strong>${data.name}</strong></td>
                <td>${(data.employment / 1e6).toFixed(1)}M</td>
                <td>
                    <div class="progress-bar" style="width: 100px; display: inline-block; vertical-align: middle;">
                        <div class="fill" style="width: ${data.exposure * 100}%; background: ${
            data.risk_level === 'high' ? 'var(--danger)' :
                data.risk_level.includes('medium') ? 'var(--warning)' : 'var(--secondary)'
        }"></div>
                    </div>
                    <span style="margin-left: 8px;">${(data.exposure * 100).toFixed(0)}%</span>
                </td>
                <td><span class="tag ${riskClass}">${data.risk_level.replace('-', ' ')}</span></td>
                <td>${(data.at_risk_jobs / 1e6).toFixed(1)}M</td>
            </tr>
        `;
    }

    tbody.innerHTML = html;

    // Update risk summary
    const summaryDiv = document.getElementById('riskSummary');
    summaryDiv.innerHTML = `
        <div class="indicator-item">
            <div>
                <div class="indicator-name">Total Employment</div>
            </div>
            <div class="indicator-value">${(riskSummary.total_employment / 1e6).toFixed(1)}M</div>
        </div>
        <div class="indicator-item">
            <div>
                <div class="indicator-name">Total Jobs at Risk</div>
            </div>
            <div class="indicator-value" style="color: var(--danger);">${(riskSummary.total_at_risk / 1e6).toFixed(1)}M</div>
        </div>
        <div class="indicator-item">
            <div>
                <div class="indicator-name">Percentage at Risk</div>
            </div>
            <div class="indicator-value">${riskSummary.percentage_at_risk}%</div>
        </div>
        <div class="indicator-item">
            <div>
                <div class="indicator-name">High Risk Employment</div>
            </div>
            <div class="indicator-value">${(riskSummary.by_risk_level.high / 1e6).toFixed(1)}M</div>
        </div>
    `;

    // Create risk level chart
    createRiskLevelChart(riskSummary);
}

/**
 * Populate intervention types
 */
function populateInterventionTypes() {
    const types = interventionSystem.getAvailableTypes();
    const container = document.getElementById('interventionTypes');

    let html = '';
    for (const type of types) {
        html += `
            <div class="card" style="cursor: pointer;" onclick="quickAddIntervention('${type.type}')">
                <h4 style="margin-bottom: 8px;">${type.name}</h4>
                <p style="font-size: 0.875rem; color: var(--gray-500); margin-bottom: 12px;">
                    ${type.description}
                </p>
                <span class="tag tag-medium">${type.category.replace('_', ' ')}</span>
            </div>
        `;
    }

    container.innerHTML = html;
}

/**
 * Create historical chart
 */
async function createHistoricalChart() {
    const historical = await dataService.getHistoricalTrends();

    const ctx = document.getElementById('historicalChart');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: historical.unemployment_rate.map(d => d.year),
            datasets: [{
                label: 'Unemployment Rate (%)',
                data: historical.unemployment_rate.map(d => d.value),
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 12
                }
            }
        }
    });
}

/**
 * Create sector employment chart
 */
async function createSectorChart() {
    const sectors = await dataService.getSectorData();
    vizManager.createSectorEmploymentChart('sectorEmploymentChart', sectors);
}

/**
 * Create risk level chart
 */
function createRiskLevelChart(riskSummary) {
    const ctx = document.getElementById('riskLevelChart');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['High Risk', 'Medium-High', 'Medium', 'Low Risk'],
            datasets: [{
                data: [
                    riskSummary.by_risk_level.high / 1e6,
                    riskSummary.by_risk_level['medium-high'] / 1e6,
                    riskSummary.by_risk_level.medium / 1e6,
                    riskSummary.by_risk_level.low / 1e6
                ],
                backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6', '#10b981']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

/**
 * Load preset scenario
 */
function loadPreset(preset) {
    const presets = {
        moderate: {
            targetUR: 8,
            aiAdoption: 55,
            automationPace: 'moderate',
            adoptionCurve: 's_curve',
            targetYear: 2029
        },
        rapid: {
            targetUR: 12,
            aiAdoption: 80,
            automationPace: 'fast',
            adoptionCurve: 'exponential',
            targetYear: 2027
        },
        managed: {
            targetUR: 6,
            aiAdoption: 60,
            automationPace: 'moderate',
            adoptionCurve: 's_curve',
            targetYear: 2029,
            interventions: ['job_retraining', 'transition_assistance']
        }
    };

    const config = presets[preset];
    if (!config) return;

    document.getElementById('targetUR').value = config.targetUR;
    document.getElementById('urValue').textContent = config.targetUR;
    document.getElementById('aiAdoption').value = config.aiAdoption;
    document.getElementById('aiValue').textContent = config.aiAdoption;
    document.getElementById('automationPace').value = config.automationPace;
    document.getElementById('adoptionCurve').value = config.adoptionCurve;
    document.getElementById('targetYear').value = config.targetYear;
    document.getElementById('scenarioName').value =
        preset.charAt(0).toUpperCase() + preset.slice(1) + ' Disruption Scenario';

    // Clear existing interventions
    interventionSystem.interventions = [];

    // Add preset interventions
    if (config.interventions) {
        for (const type of config.interventions) {
            interventionSystem.addIntervention(type);
        }
    }

    updateInterventionsList();
}

/**
 * Get current scenario configuration from form inputs
 */
function getCurrentScenario() {
    const currentYear = new Date().getFullYear();
    return {
        name: document.getElementById('scenarioName')?.value || 'My Scenario',
        timeframe: {
            start_year: currentYear,
            end_year: parseInt(document.getElementById('targetYear')?.value || '2029')
        },
        targets: {
            unemployment_rate: parseFloat(document.getElementById('targetUR')?.value || '10'),
            ai_adoption_rate: parseInt(document.getElementById('aiAdoption')?.value || '70'),
            automation_pace: document.getElementById('automationPace')?.value || 'moderate'
        },
        ai_parameters: {
            adoption_curve: document.getElementById('adoptionCurve')?.value || 's_curve'
        },
        interventions: typeof interventionSystem !== 'undefined'
            ? interventionSystem.interventions.filter(i => i.active)
            : []
    };
}

/**
 * Run simulation
 */
async function runSimulation() {
    const config = {
        name: document.getElementById('scenarioName').value,
        end_year: parseInt(document.getElementById('targetYear').value),
        target_unemployment: parseFloat(document.getElementById('targetUR').value),
        ai_adoption_rate: parseInt(document.getElementById('aiAdoption').value),
        automation_pace: document.getElementById('automationPace').value,
        adoption_curve: document.getElementById('adoptionCurve').value
    };

    // Show loading state
    const resultsDiv = document.getElementById('simulation-results');
    resultsDiv.innerHTML = `
        <div class="card" style="text-align: center; padding: 60px;">
            <div class="loading">
                <div class="spinner"></div>
                <span>Running simulation...</span>
            </div>
        </div>
    `;

    // Switch to simulation tab (index 3)
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById('simulation-section').classList.add('active');
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-tab')[3].classList.add('active');

    try {
        // Create and run scenario
        const scenario = simulationEngine.createScenario(config);

        // Add active interventions
        scenario.interventions = interventionSystem.interventions.filter(i => i.active);

        const results = await simulationEngine.runSimulation();
        currentResults = results;

        // Display results
        displaySimulationResults(results);

        // Save to history
        if (typeof simulationHistory !== 'undefined') {
            simulationHistory.save(results);
        }

        // Show share button
        showShareButton();

        // Calculate and display baseline unemployment (without interventions)
        calculateAndDisplayBaseline(config);

    } catch (error) {
        console.error('Simulation error:', error);
        resultsDiv.innerHTML = `
            <div class="card" style="text-align: center; padding: 60px;">
                <h3 style="color: var(--danger);">Simulation Error</h3>
                <p>${error.message}</p>
            </div>
        `;
    }
}

// ============================================
// TARGET UNEMPLOYMENT OPTIMIZER
// ============================================

let baselineUnemploymentRate = null;

/**
 * Toggle target unemployment optimizer controls
 */
function toggleTargetOptimizer() {
    const enabled = document.getElementById('enableTargetOptimizer').checked;
    const controls = document.getElementById('targetOptimizerControls');
    const actions = document.getElementById('optimizerActions');

    controls.style.display = enabled ? 'block' : 'none';
    actions.style.display = enabled ? 'block' : 'none';

    if (enabled && baselineUnemploymentRate !== null) {
        // Set initial target to something achievable (baseline - 2%)
        const initialTarget = Math.max(2, baselineUnemploymentRate - 2);
        document.getElementById('targetUnemploymentRate').value = initialTarget;
        document.getElementById('targetURValue').textContent = initialTarget.toFixed(1);
    }
}

/**
 * Calculate baseline unemployment rate (AI impact without interventions)
 */
async function calculateAndDisplayBaseline(config) {
    try {
        // Store current interventions
        const savedInterventions = [...interventionSystem.interventions];

        // Temporarily clear interventions
        interventionSystem.interventions = [];

        // Create scenario without interventions
        const baselineScenario = simulationEngine.createScenario({
            ...config,
            interventions: []
        });

        // Run baseline simulation
        const baselineResults = await simulationEngine.runSimulation();
        baselineUnemploymentRate = baselineResults.summary.final_unemployment_rate;

        // Restore interventions
        interventionSystem.interventions = savedInterventions;

        // Update display
        const display = document.getElementById('baselineUnemploymentDisplay');
        if (display) {
            display.innerHTML = `${baselineUnemploymentRate.toFixed(1)}%`;
            display.style.color = baselineUnemploymentRate > 8 ? 'var(--danger)' :
                                  baselineUnemploymentRate > 6 ? 'var(--warning)' : 'var(--secondary)';

            // Update helper text
            display.nextElementSibling.textContent = `By ${config.end_year}`;
        }

        // Re-run original simulation with interventions to restore state
        simulationEngine.createScenario(config);
        simulationEngine.scenario.interventions = savedInterventions.filter(i => i.active);

    } catch (error) {
        console.error('Error calculating baseline:', error);
    }
}

/**
 * Optimize interventions to reach target unemployment rate
 */
async function optimizeInterventions() {
    if (baselineUnemploymentRate === null) {
        showNotification('Run a simulation first to calculate baseline unemployment.', 'warning');
        return;
    }

    const targetRate = parseFloat(document.getElementById('targetUnemploymentRate').value);
    const btn = document.getElementById('optimizeBtn');
    const resultsDiv = document.getElementById('optimizationResults');
    const contentDiv = document.getElementById('optimizationContent');

    // Validate target
    if (targetRate >= baselineUnemploymentRate) {
        showNotification('Target must be lower than baseline unemployment rate.', 'warning');
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner" style="width: 14px; height: 14px; margin-right: 6px;"></span> Analyzing...';

    try {
        const reductionNeeded = baselineUnemploymentRate - targetRate;
        const optimization = await findOptimalInterventionMix(reductionNeeded, targetRate);

        // Display results
        resultsDiv.style.display = 'block';
        contentDiv.innerHTML = generateOptimizationResultsHTML(optimization, targetRate);

    } catch (error) {
        console.error('Optimization error:', error);
        showNotification('Optimization failed: ' + error.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<span style="margin-right: 6px;">&#9881;</span> Find Intervention Mix';
    }
}

/**
 * Find optimal intervention mix to achieve target reduction
 */
async function findOptimalInterventionMix(reductionNeeded, targetRate) {
    // Intervention effectiveness estimates (unemployment reduction per $1B spent annually)
    const interventionEffectiveness = {
        job_retraining: {
            name: 'Job Retraining Programs',
            ur_reduction_per_billion: 0.15,
            min_budget: 10,
            max_budget: 100,
            default_params: { annual_budget: 50, success_rate: 70 },
            cost_per_point: 6.67, // $B per 1% UR reduction
            implementation_time: 'Medium-term (1-2 years)'
        },
        ubi: {
            name: 'Universal Basic Income',
            ur_reduction_per_billion: 0.08,
            min_budget: 500,
            max_budget: 3000,
            default_params: { monthly_amount: 1000, eligibility_threshold: 50000 },
            cost_per_point: 12.5,
            implementation_time: 'Immediate'
        },
        public_works: {
            name: 'Public Works Programs',
            ur_reduction_per_billion: 0.25,
            min_budget: 20,
            max_budget: 200,
            default_params: { annual_budget: 75, job_creation_rate: 15000 },
            cost_per_point: 4.0,
            implementation_time: 'Short-term (6-12 months)'
        },
        tax_incentives: {
            name: 'Tax Incentives for Hiring',
            ur_reduction_per_billion: 0.12,
            min_budget: 10,
            max_budget: 100,
            default_params: { credit_per_employee: 5000, eligibility: 'all' },
            cost_per_point: 8.33,
            implementation_time: 'Short-term (3-6 months)'
        },
        education_investment: {
            name: 'Education Investment',
            ur_reduction_per_billion: 0.10,
            min_budget: 20,
            max_budget: 150,
            default_params: { annual_budget: 50, focus_area: 'stem' },
            cost_per_point: 10.0,
            implementation_time: 'Long-term (3-5 years)'
        },
        transition_assistance: {
            name: 'Transition Assistance',
            ur_reduction_per_billion: 0.18,
            min_budget: 5,
            max_budget: 50,
            default_params: { stipend_months: 12, monthly_amount: 2000 },
            cost_per_point: 5.56,
            implementation_time: 'Immediate'
        },
        reduced_work_week: {
            name: 'Reduced Work Week',
            ur_reduction_per_billion: 0.20,
            min_budget: 30,
            max_budget: 200,
            default_params: { hours_per_week: 32, wage_adjustment: 0 },
            cost_per_point: 5.0,
            implementation_time: 'Medium-term (1-2 years)'
        },
        early_retirement: {
            name: 'Early Retirement Incentives',
            ur_reduction_per_billion: 0.14,
            min_budget: 20,
            max_budget: 100,
            default_params: { eligible_age: 60, benefit_percentage: 80 },
            cost_per_point: 7.14,
            implementation_time: 'Short-term (6-12 months)'
        },
        entrepreneurship: {
            name: 'Entrepreneurship Support',
            ur_reduction_per_billion: 0.22,
            min_budget: 5,
            max_budget: 50,
            default_params: { grant_amount: 25000, loan_rate: 2 },
            cost_per_point: 4.55,
            implementation_time: 'Medium-term (1-2 years)'
        }
    };

    // Sort by cost-effectiveness (lowest cost per point first)
    const sortedInterventions = Object.entries(interventionEffectiveness)
        .sort((a, b) => a[1].cost_per_point - b[1].cost_per_point);

    // Greedy algorithm: pick most cost-effective interventions until target is reached
    const recommendedMix = [];
    let remainingReduction = reductionNeeded;
    let totalAnnualCost = 0;
    let totalMultiYearCost = 0;
    const simulationYears = parseInt(document.getElementById('targetYear').value) - new Date().getFullYear();

    for (const [type, data] of sortedInterventions) {
        if (remainingReduction <= 0) break;

        // Calculate how much budget needed to achieve remaining reduction
        const budgetNeeded = (remainingReduction / data.ur_reduction_per_billion);
        const actualBudget = Math.min(Math.max(budgetNeeded, data.min_budget), data.max_budget);
        const actualReduction = actualBudget * data.ur_reduction_per_billion;

        if (actualReduction > 0.05) { // Only include if meaningful impact
            recommendedMix.push({
                type,
                name: data.name,
                budget: actualBudget,
                ur_reduction: actualReduction,
                cost_per_point: data.cost_per_point,
                implementation_time: data.implementation_time,
                params: { ...data.default_params, annual_budget: actualBudget }
            });

            remainingReduction -= actualReduction;
            totalAnnualCost += actualBudget;
        }
    }

    totalMultiYearCost = totalAnnualCost * simulationYears;

    // Calculate achievable rate
    const achievableReduction = reductionNeeded - Math.max(0, remainingReduction);
    const achievableRate = baselineUnemploymentRate - achievableReduction;

    return {
        targetRate,
        baselineRate: baselineUnemploymentRate,
        achievableRate,
        reductionNeeded,
        achievableReduction,
        gap: Math.max(0, remainingReduction),
        recommendations: recommendedMix,
        totalAnnualCost,
        totalMultiYearCost,
        simulationYears,
        feasible: remainingReduction <= 0.1 // Within 0.1% is feasible
    };
}

/**
 * Generate HTML for optimization results
 */
function generateOptimizationResultsHTML(optimization, targetRate) {
    const formatCost = (n) => {
        if (n >= 1000) return '$' + (n / 1000).toFixed(1) + 'T';
        return '$' + n.toFixed(0) + 'B';
    };

    const feasibilityClass = optimization.feasible ? 'var(--secondary)' : 'var(--warning)';
    const feasibilityText = optimization.feasible ? 'Achievable' : 'Partially Achievable';

    let html = `
        <div style="background: var(--gray-800); border-radius: 6px; padding: 10px; margin-bottom: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.75rem; color: var(--gray-400);">Target</span>
                <span style="font-weight: 600; color: var(--primary);">${targetRate.toFixed(1)}%</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
                <span style="font-size: 0.75rem; color: var(--gray-400);">Achievable</span>
                <span style="font-weight: 600; color: ${feasibilityClass};">${optimization.achievableRate.toFixed(1)}%</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
                <span style="font-size: 0.75rem; color: var(--gray-400);">Status</span>
                <span style="font-size: 0.75rem; color: ${feasibilityClass};">${feasibilityText}</span>
            </div>
        </div>

        <div style="font-size: 0.7rem; color: var(--gray-400); margin-bottom: 6px;">RECOMMENDED INTERVENTIONS</div>
    `;

    for (const rec of optimization.recommendations) {
        html += `
            <div style="background: var(--gray-800); border-radius: 6px; padding: 8px; margin-bottom: 6px; font-size: 0.8rem;">
                <div style="font-weight: 500; color: var(--text-primary); margin-bottom: 2px;">${rec.name}</div>
                <div style="display: flex; justify-content: space-between; color: var(--gray-400);">
                    <span>${formatCost(rec.budget)}/yr</span>
                    <span style="color: var(--secondary);">-${rec.ur_reduction.toFixed(2)}%</span>
                </div>
            </div>
        `;
    }

    html += `
        <div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2)); border-radius: 6px; padding: 10px; margin-top: 10px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span style="font-size: 0.75rem; color: var(--gray-300);">Annual Cost</span>
                <span style="font-weight: 600; color: var(--primary);">${formatCost(optimization.totalAnnualCost)}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
                <span style="font-size: 0.75rem; color: var(--gray-300);">${optimization.simulationYears}-Year Total</span>
                <span style="font-weight: 600; color: var(--warning);">${formatCost(optimization.totalMultiYearCost)}</span>
            </div>
        </div>

        <button class="btn btn-primary btn-block btn-sm" onclick="applyOptimizedInterventions()" style="margin-top: 10px;">
            Apply These Interventions
        </button>
    `;

    // Store optimization for applying
    window.lastOptimization = optimization;

    return html;
}

/**
 * Apply the optimized interventions
 */
function applyOptimizedInterventions() {
    if (!window.lastOptimization) {
        showNotification('No optimization results to apply.', 'warning');
        return;
    }

    // Clear existing interventions
    interventionSystem.interventions = [];

    // Add recommended interventions
    for (const rec of window.lastOptimization.recommendations) {
        interventionSystem.addIntervention(rec.type, rec.params);
    }

    // Update UI
    updateInterventionsList();

    showNotification(`Applied ${window.lastOptimization.recommendations.length} interventions. Run simulation to see results.`, 'success');

    // Uncheck the optimizer toggle and hide controls
    document.getElementById('enableTargetOptimizer').checked = false;
    document.getElementById('targetOptimizerControls').style.display = 'none';
    document.getElementById('optimizerActions').style.display = 'none';
}

/**
 * Generate HTML for intervention impact display
 */
function generateInterventionImpactHTML(interventionSummary, interventions) {
    if (!interventionSummary || interventions.length === 0) {
        return '<p style="color: var(--gray-500);">No intervention data available.</p>';
    }

    const formatNumber = (n) => {
        if (n === undefined || n === null || isNaN(n)) return '0';
        if (Math.abs(n) >= 1e12) return (n / 1e12).toFixed(1) + 'T';
        if (Math.abs(n) >= 1e9) return (n / 1e9).toFixed(1) + 'B';
        if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(1) + 'M';
        if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(1) + 'K';
        return n.toFixed(0);
    };

    const safePercent = (n) => {
        if (n === undefined || n === null || isNaN(n)) return '0.00';
        return (n * 100).toFixed(2);
    };

    const totalJobs = interventionSummary.total_job_effect || 0;
    const totalEconomic = interventionSummary.total_economic_impact || 0;
    const totalFiscal = interventionSummary.total_fiscal_cost || 0;
    const avgWageEffect = interventionSummary.monthly_averages?.wage_effect || 0;

    // Generate details breakdown
    const detailsHTML = (interventionSummary.details || []).map(d => {
        const jobEffect = d.job_effect || 0;
        const wageEffect = d.wage_effect || 0;
        const economicImpact = d.economic_impact || 0;
        const fiscalCost = d.fiscal_cost || 0;
        return `
        <tr>
            <td><strong>${d.intervention || 'Unknown'}</strong></td>
            <td style="text-align: right; color: ${jobEffect >= 0 ? 'var(--secondary)' : 'var(--danger)'};">
                ${jobEffect >= 0 ? '+' : ''}${formatNumber(jobEffect * 12)}/yr
            </td>
            <td style="text-align: right; color: ${wageEffect >= 0 ? 'var(--secondary)' : 'var(--danger)'};">
                ${wageEffect >= 0 ? '+' : ''}${safePercent(wageEffect)}%
            </td>
            <td style="text-align: right; color: ${economicImpact >= 0 ? 'var(--secondary)' : 'var(--danger)'};">
                $${formatNumber(economicImpact * 12)}
            </td>
            <td style="text-align: right; color: ${fiscalCost <= 0 ? 'var(--secondary)' : 'var(--warning)'};">
                ${fiscalCost < 0 ? '+' : '-'}$${formatNumber(Math.abs(fiscalCost * 12))}
            </td>
        </tr>
    `}).join('');

    return `
        <div style="margin-bottom: 24px;">
            <!-- Summary Cards -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 16px; margin-bottom: 24px;">
                <div style="background: var(--gray-50); padding: 16px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 0.75rem; color: var(--gray-500); text-transform: uppercase;">Jobs Impact</div>
                    <div style="font-size: 1.25rem; font-weight: 700; color: ${totalJobs >= 0 ? 'var(--secondary)' : 'var(--danger)'};">
                        ${totalJobs >= 0 ? '+' : ''}${formatNumber(totalJobs)}
                    </div>
                    <div style="font-size: 0.7rem; color: var(--gray-400);">cumulative</div>
                </div>
                <div style="background: var(--gray-50); padding: 16px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 0.75rem; color: var(--gray-500); text-transform: uppercase;">Wage Effect</div>
                    <div style="font-size: 1.25rem; font-weight: 700; color: ${avgWageEffect >= 0 ? 'var(--secondary)' : 'var(--danger)'};">
                        ${avgWageEffect >= 0 ? '+' : ''}${safePercent(avgWageEffect)}%
                    </div>
                    <div style="font-size: 0.7rem; color: var(--gray-400);">monthly avg</div>
                </div>
                <div style="background: var(--gray-50); padding: 16px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 0.75rem; color: var(--gray-500); text-transform: uppercase;">Economic Impact</div>
                    <div style="font-size: 1.25rem; font-weight: 700; color: var(--primary);">
                        $${formatNumber(totalEconomic)}
                    </div>
                    <div style="font-size: 0.7rem; color: var(--gray-400);">cumulative GDP</div>
                </div>
                <div style="background: var(--gray-50); padding: 16px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 0.75rem; color: var(--gray-500); text-transform: uppercase;">Fiscal Impact</div>
                    <div style="font-size: 1.25rem; font-weight: 700; color: ${totalFiscal <= 0 ? 'var(--secondary)' : 'var(--warning)'};">
                        ${totalFiscal < 0 ? '+' : '-'}$${formatNumber(Math.abs(totalFiscal))}
                    </div>
                    <div style="font-size: 0.7rem; color: var(--gray-400);">${totalFiscal < 0 ? 'revenue' : 'cost'}</div>
                </div>
            </div>

            <!-- Intervention Breakdown -->
            ${interventionSummary.details && interventionSummary.details.length > 0 ? `
            <h4 style="font-size: 0.875rem; color: var(--gray-500); margin-bottom: 12px; text-transform: uppercase;">
                Intervention Breakdown
            </h4>
            <div style="overflow-x: auto;">
                <table style="width: 100%; font-size: 0.875rem; border-collapse: collapse;">
                    <thead>
                        <tr style="border-bottom: 2px solid var(--gray-200);">
                            <th style="text-align: left; padding: 8px 12px;">Intervention</th>
                            <th style="text-align: right; padding: 8px 12px;">Jobs/Year</th>
                            <th style="text-align: right; padding: 8px 12px;">Wage Effect</th>
                            <th style="text-align: right; padding: 8px 12px;">Economic/Year</th>
                            <th style="text-align: right; padding: 8px 12px;">Fiscal/Year</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${detailsHTML}
                    </tbody>
                </table>
            </div>
            ` : ''}
        </div>
    `;
}

/**
 * Generate HTML for demographics analysis display
 */
function generateDemographicsHTML(demographics) {
    if (!demographics) {
        return '<p style="color: var(--gray-500);">No demographics data available.</p>';
    }

    const formatNumber = (n) => {
        if (n === undefined || n === null || isNaN(n)) return '0';
        if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(1) + 'M';
        if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(1) + 'K';
        return Math.round(n).toString();
    };

    const safePercent = (n) => {
        if (n === undefined || n === null || isNaN(n)) return '0';
        return typeof n === 'number' ? n.toFixed(1) : n;
    };

    // Build age group cards - using estimated_displacement and displacement_rate from analyzer
    const ageGroupsHTML = demographics.by_age ? Object.entries(demographics.by_age).map(([group, data]) => {
        const displacement = data.estimated_displacement || 0;
        const rate = data.displacement_rate || 0;
        const impactLevel = data.impact_level || 'Low';
        return `
        <div style="background: var(--gray-50); padding: 12px; border-radius: 8px; min-width: 140px;">
            <div style="font-size: 0.75rem; color: var(--gray-500); text-transform: uppercase;">Age ${group}</div>
            <div style="font-size: 1.1rem; font-weight: 600; color: ${displacement > 0 ? 'var(--danger)' : 'var(--secondary)'};">
                -${formatNumber(displacement)} jobs
            </div>
            <div style="font-size: 0.7rem; color: var(--gray-400);">Risk: ${safePercent(rate)}%</div>
        </div>
    `}).join('') : '';

    // Build education cards
    const educationHTML = demographics.by_education ? Object.entries(demographics.by_education).map(([level, data]) => {
        const displacement = data.estimated_displacement || 0;
        const rate = data.displacement_rate || 0;
        return `
        <div style="background: var(--gray-50); padding: 12px; border-radius: 8px; min-width: 140px;">
            <div style="font-size: 0.75rem; color: var(--gray-500); text-transform: uppercase;">${level}</div>
            <div style="font-size: 1.1rem; font-weight: 600; color: ${displacement > 0 ? 'var(--danger)' : 'var(--secondary)'};">
                -${formatNumber(displacement)} jobs
            </div>
            <div style="font-size: 0.7rem; color: var(--gray-400);">Risk: ${safePercent(rate)}%</div>
        </div>
    `}).join('') : '';

    // Build most vulnerable list - using displacement_rate from analyzer
    const vulnerableHTML = demographics.most_vulnerable ? demographics.most_vulnerable.slice(0, 5).map((v, i) => `
        <div style="display: flex; justify-content: space-between; padding: 8px; ${i < demographics.most_vulnerable.length - 1 ? 'border-bottom: 1px solid var(--gray-100);' : ''}">
            <span style="font-weight: 500;">${v.group || 'Unknown'}</span>
            <span style="color: var(--danger);">${safePercent(v.displacement_rate)}% at risk</span>
        </div>
    `).join('') : '';

    // Build recommendations - these are objects with target, priority, actions
    const recommendationsHTML = demographics.recommendations ? demographics.recommendations.slice(0, 4).map(rec => {
        if (typeof rec === 'string') {
            return `<li style="margin-bottom: 8px; color: var(--text-secondary);">${rec}</li>`;
        }
        // Handle object format from analyzer
        const target = rec.target || 'General';
        const actions = rec.actions || [];
        return `
            <li style="margin-bottom: 12px;">
                <strong style="color: var(--text-primary);">${target}</strong>
                <span style="font-size: 0.75rem; color: ${rec.priority === 'Critical' ? 'var(--danger)' : rec.priority === 'High' ? 'var(--warning)' : 'var(--gray-500)'}; margin-left: 8px;">(${rec.priority || 'Medium'} Priority)</span>
                <ul style="margin: 4px 0 0 0; padding-left: 16px; font-size: 0.85rem; color: var(--text-secondary);">
                    ${actions.slice(0, 2).map(a => `<li>${a}</li>`).join('')}
                </ul>
            </li>
        `;
    }).join('') : '';

    return `
        <div style="margin-bottom: 20px;">
            <h4 style="font-size: 0.875rem; color: var(--gray-500); margin-bottom: 12px; text-transform: uppercase;">
                Impact by Age Group
            </h4>
            <div style="display: flex; gap: 12px; flex-wrap: wrap; overflow-x: auto; padding-bottom: 8px;">
                ${ageGroupsHTML}
            </div>
        </div>

        <div style="margin-bottom: 20px;">
            <h4 style="font-size: 0.875rem; color: var(--gray-500); margin-bottom: 12px; text-transform: uppercase;">
                Impact by Education Level
            </h4>
            <div style="display: flex; gap: 12px; flex-wrap: wrap; overflow-x: auto; padding-bottom: 8px;">
                ${educationHTML}
            </div>
        </div>

        ${demographics.most_vulnerable && demographics.most_vulnerable.length > 0 ? `
        <div style="margin-bottom: 20px;">
            <h4 style="font-size: 0.875rem; color: var(--gray-500); margin-bottom: 12px; text-transform: uppercase;">
                Most Vulnerable Groups
            </h4>
            <div style="background: rgba(239, 68, 68, 0.05); border-radius: 8px; overflow: hidden;">
                ${vulnerableHTML}
            </div>
        </div>
        ` : ''}

        ${demographics.recommendations && demographics.recommendations.length > 0 ? `
        <div>
            <h4 style="font-size: 0.875rem; color: var(--gray-500); margin-bottom: 12px; text-transform: uppercase;">
                Policy Recommendations
            </h4>
            <ul style="margin: 0; padding-left: 20px; font-size: 0.875rem;">
                ${recommendationsHTML}
            </ul>
        </div>
        ` : ''}
    `;
}

/**
 * Generate HTML for skills gap analysis display
 */
function generateSkillsGapHTML(skillsGap) {
    if (!skillsGap) {
        return '<p style="color: var(--gray-500);">No skills gap data available.</p>';
    }

    const formatSalary = (n) => {
        if (n === undefined || n === null || isNaN(n)) return '$0K';
        return '$' + (n / 1000).toFixed(0) + 'K';
    };

    const safeRate = (n) => {
        if (n === undefined || n === null || isNaN(n)) return '0';
        return n;
    };

    // Declining skills
    const decliningHTML = skillsGap.declining_skills ? skillsGap.declining_skills.slice(0, 6).map(skill => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: rgba(239, 68, 68, 0.05); border-radius: 6px; margin-bottom: 8px;">
            <div>
                <span style="font-weight: 500;">${skill.name || 'Unknown Skill'}</span>
                <span style="font-size: 0.75rem; color: var(--gray-400); margin-left: 8px;">${skill.sector || ''}</span>
            </div>
            <span style="color: var(--danger); font-weight: 600;">-${safeRate(skill.decline_rate)}%</span>
        </div>
    `).join('') : '';

    // Growing skills
    const growingHTML = skillsGap.growing_skills ? skillsGap.growing_skills.slice(0, 6).map(skill => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: rgba(16, 185, 129, 0.05); border-radius: 6px; margin-bottom: 8px;">
            <div>
                <span style="font-weight: 500;">${skill.name || 'Unknown Skill'}</span>
                <span style="font-size: 0.75rem; color: var(--gray-400); margin-left: 8px;">${formatSalary(skill.avg_salary)}</span>
            </div>
            <span style="color: var(--secondary); font-weight: 600;">+${safeRate(skill.growth_rate)}%</span>
        </div>
    `).join('') : '';

    // Training recommendations - handle object format from analyzer
    const trainingHTML = skillsGap.training_recommendations ? skillsGap.training_recommendations.slice(0, 4).map(rec => {
        const skillName = rec.skill || rec.program || 'Training Program';
        const priority = rec.priority || 'Medium';
        const careerOutcomes = rec.career_outcomes || rec.career_paths || [];
        // Get first program if programs is an array
        const firstProgram = Array.isArray(rec.programs) && rec.programs.length > 0 ? rec.programs[0] : null;
        const duration = firstProgram?.duration || rec.duration;
        const cost = firstProgram?.cost || rec.cost || rec.estimated_cost;
        const provider = firstProgram?.provider || rec.provider;

        return `
        <div style="border: 1px solid var(--gray-200); border-radius: 8px; padding: 12px; margin-bottom: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <span style="font-weight: 600;">${skillName}</span>
                <span style="font-size: 0.7rem; padding: 2px 8px; border-radius: 4px; background: ${priority === 'Critical' ? 'var(--danger)' : priority === 'High' ? 'var(--warning)' : 'var(--gray-200)'}; color: ${priority === 'Critical' || priority === 'High' ? 'white' : 'var(--gray-600)'};">${priority}</span>
            </div>
            <div style="display: flex; gap: 16px; font-size: 0.8rem; color: var(--gray-500);">
                ${duration ? `<span>&#128197; ${duration} months</span>` : ''}
                ${cost ? `<span>&#128176; ${cost}</span>` : ''}
                ${provider ? `<span>&#127979; ${provider}</span>` : ''}
            </div>
            ${careerOutcomes.length > 0 ? `
            <div style="margin-top: 8px; font-size: 0.75rem; color: var(--gray-400);">
                Leads to: ${careerOutcomes.slice(0, 3).join(', ')}
            </div>
            ` : ''}
        </div>
    `}).join('') : '';

    // Transition paths - handle array format from analyzer (objects with from_skill, to_skill)
    let transitionsHTML = '';
    if (skillsGap.transition_paths) {
        if (Array.isArray(skillsGap.transition_paths)) {
            // Array of objects format
            transitionsHTML = skillsGap.transition_paths.slice(0, 4).map(path => `
                <div style="margin-bottom: 10px;">
                    <span style="color: var(--danger);">${path.from_skill || 'Unknown'}</span>
                    <span style="margin: 0 8px;">&#8594;</span>
                    <span style="color: var(--secondary);">${path.to_skill || 'Unknown'}</span>
                    ${path.training_duration ? `<span style="font-size: 0.75rem; color: var(--gray-400); margin-left: 8px;">(${path.training_duration})</span>` : ''}
                </div>
            `).join('');
        } else {
            // Object/dictionary format (fallback)
            transitionsHTML = Object.entries(skillsGap.transition_paths).slice(0, 4).map(([from, paths]) => `
                <div style="margin-bottom: 10px;">
                    <span style="color: var(--danger);">${from}</span>
                    <span style="margin: 0 8px;">&#8594;</span>
                    <span style="color: var(--secondary);">${Array.isArray(paths) ? paths.slice(0, 2).join(', ') : (typeof paths === 'string' ? paths : 'Various')}</span>
                </div>
            `).join('');
        }
    }

    return `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 20px;">
            <div>
                <h4 style="font-size: 0.875rem; color: var(--danger); margin-bottom: 12px; text-transform: uppercase;">
                    &#128308; Declining Skills
                </h4>
                ${decliningHTML || '<p style="color: var(--gray-400); font-size: 0.875rem;">No declining skills data</p>'}
            </div>
            <div>
                <h4 style="font-size: 0.875rem; color: var(--secondary); margin-bottom: 12px; text-transform: uppercase;">
                    &#128994; In-Demand Skills
                </h4>
                ${growingHTML || '<p style="color: var(--gray-400); font-size: 0.875rem;">No growing skills data</p>'}
            </div>
        </div>

        ${transitionsHTML ? `
        <div style="margin-bottom: 20px;">
            <h4 style="font-size: 0.875rem; color: var(--gray-500); margin-bottom: 12px; text-transform: uppercase;">
                Recommended Skill Transitions
            </h4>
            <div style="background: var(--gray-50); border-radius: 8px; padding: 12px; font-size: 0.875rem;">
                ${transitionsHTML}
            </div>
        </div>
        ` : ''}

        ${trainingHTML ? `
        <div>
            <h4 style="font-size: 0.875rem; color: var(--gray-500); margin-bottom: 12px; text-transform: uppercase;">
                Training Programs
            </h4>
            ${trainingHTML}
        </div>
        ` : ''}
    `;
}

/**
 * Download PDF report of simulation results
 */
async function downloadPDFReport() {
    if (!currentResults) {
        showNotification('No simulation results to export. Run a simulation first.', 'warning');
        return;
    }

    const btn = document.getElementById('downloadPDFBtn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="spinner" style="width: 16px; height: 16px; margin-right: 8px;"></span> Generating PDF...';
    btn.disabled = true;

    try {
        // Add demographics and skills gap data to results for PDF
        const enrichedResults = { ...currentResults };

        if (typeof demographicsAnalyzer !== 'undefined') {
            enrichedResults.summary.demographics = demographicsAnalyzer.analyzeImpacts(currentResults);
        }

        if (typeof skillsGapAnalyzer !== 'undefined') {
            enrichedResults.summary.skills_gap = skillsGapAnalyzer.analyzeSkillsGap(currentResults);
        }

        if (typeof pdfReportGenerator !== 'undefined') {
            const filename = await pdfReportGenerator.generateReport(enrichedResults);
            showNotification(`PDF report downloaded: ${filename}`, 'success');
        } else {
            throw new Error('PDF generator not available');
        }
    } catch (error) {
        console.error('PDF generation error:', error);
        showNotification('Failed to generate PDF report: ' + error.message, 'error');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

/**
 * Display simulation results
 */
function displaySimulationResults(results) {
    const resultsDiv = document.getElementById('simulation-results');
    const summary = results.summary;

    // Check if AI summary is available (proxy or user API key)
    const aiAvailable = typeof aiSummaryService !== 'undefined' && aiSummaryService.isAvailable();

    // Comparison button state
    const comparisonAvailable = typeof scenarioComparison !== 'undefined';
    const canAddToComparison = comparisonAvailable && scenarioComparison.canAddMore();
    const comparisonCount = comparisonAvailable ? scenarioComparison.getCount() : 0;

    const comparisonButton = comparisonAvailable ? `
        <button id="addToComparisonBtn" class="btn btn-success" onclick="addToComparison()" ${!canAddToComparison ? 'disabled' : ''}>
            ${canAddToComparison ? `Add to Comparison (${comparisonCount}/3)` : 'Comparison Full (3/3)'}
        </button>
    ` : '';

    // Check if we have an AI-enhanced analysis available
    const hasEnhancedAnalysis = currentAIAnalysis !== null;

    const aiSummarySection = `
        <div class="card" id="aiSummaryCard" style="margin-bottom: 24px; border-left: 4px solid var(--primary);">
            <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
                <h3 style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 1.25rem;">&#129302;</span> AI Analysis
                </h3>
                <div style="display: flex; gap: 8px;">
                    ${comparisonButton}
                </div>
            </div>
            <div id="aiSummaryContent" style="line-height: 1.7;">
                ${hasEnhancedAnalysis ? `
                    <div style="display: flex; align-items: center; gap: 16px; padding: 16px; background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1)); border-radius: 8px; margin-bottom: 16px;">
                        <div style="flex: 1;">
                            <p style="margin: 0 0 4px 0; font-weight: 600; color: var(--text-primary);">
                                ✨ AI-Enhanced Analysis Available
                            </p>
                            <p style="margin: 0; font-size: 0.875rem; color: var(--text-secondary);">
                                View the comprehensive AI analysis with policy recommendations and insights.
                            </p>
                        </div>
                        <button class="btn" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; white-space: nowrap;" onclick="showAIAnalysis()">
                            View AI Report
                        </button>
                    </div>
                ` : ''}
                ${aiAvailable ? `
                    <p style="color: var(--gray-500); margin-bottom: 16px;">
                        Get AI-powered analysis of your simulation results, including key insights,
                        policy implications, and risk assessments.
                    </p>
                    <button class="btn btn-primary" onclick="generateAISummary(currentResults)" id="generateAIBtn">
                        Generate AI Analysis
                    </button>
                ` : `
                    <p style="color: var(--gray-500);">
                        Configure your Gemini API key to get AI-powered analysis of your simulation results.
                    </p>
                    <button class="btn btn-primary btn-sm" onclick="showAISettingsModal()" style="margin-top: 12px;">
                        Configure API Key
                    </button>
                `}
            </div>
        </div>
    `;

    resultsDiv.innerHTML = `
        <div class="fade-in">
            ${aiSummarySection}
            ${vizManager.createSummaryHTML(summary)}

            <div class="card-grid">
                <div class="card">
                    <div class="card-header">
                        <h3>Unemployment Projection</h3>
                    </div>
                    <div class="chart-container">
                        <canvas id="projectedURChart"></canvas>
                    </div>
                </div>
                <div class="card">
                    <div class="card-header">
                        <h3>AI Adoption Curve</h3>
                    </div>
                    <div class="chart-container">
                        <canvas id="adoptionCurveChart"></canvas>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3>AI Job Impact Over Time</h3>
                </div>
                <div class="chart-container large">
                    <canvas id="jobImpactChart"></canvas>
                </div>
            </div>

            <div class="card-grid">
                <div class="card">
                    <div class="card-header">
                        <h3>Wage Trends</h3>
                    </div>
                    <div class="chart-container">
                        <canvas id="wageTrendChart"></canvas>
                    </div>
                </div>
                <div class="card">
                    <div class="card-header">
                        <h3>Productivity</h3>
                    </div>
                    <div class="chart-container">
                        <canvas id="productivityChart"></canvas>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3>Sector Employment Changes</h3>
                </div>
                <div class="chart-container large">
                    <canvas id="sectorChangeChart"></canvas>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3>Simulation Inputs & Assumptions</h3>
                </div>
                <table class="data-table">
                    <tbody>
                        <tr>
                            <td><strong>Scenario Name</strong></td>
                            <td>${results.scenario.name}</td>
                        </tr>
                        <tr>
                            <td><strong>Timeframe</strong></td>
                            <td>${results.scenario.timeframe.start_year} - ${results.scenario.timeframe.end_year}</td>
                        </tr>
                        <tr>
                            <td><strong>Target Unemployment</strong></td>
                            <td>${results.scenario.targets.unemployment_rate}%</td>
                        </tr>
                        <tr>
                            <td><strong>Target AI Adoption</strong></td>
                            <td>${results.scenario.targets.ai_adoption_rate}%</td>
                        </tr>
                        <tr>
                            <td><strong>Automation Pace</strong></td>
                            <td>${results.scenario.targets.automation_pace}</td>
                        </tr>
                        <tr>
                            <td><strong>Adoption Curve</strong></td>
                            <td>${results.scenario.ai_parameters.adoption_curve.replace('_', '-')}</td>
                        </tr>
                        <tr>
                            <td><strong>New Job Multiplier</strong></td>
                            <td>${results.scenario.ai_parameters.new_job_multiplier}</td>
                        </tr>
                        <tr>
                            <td><strong>Active Interventions</strong></td>
                            <td>${results.scenario.interventions.length > 0 ?
        results.scenario.interventions.map(i => i.name).join(', ') : 'None'}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Timeline Player Section -->
            <div class="card" id="timelineCard" style="border-left: 4px solid var(--secondary);">
                <div class="card-header">
                    <h3 style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 1.25rem;">&#9199;</span> Timeline Player
                    </h3>
                    <span style="font-size: 0.875rem; color: var(--gray-500);">Animate through simulation years</span>
                </div>
                <div id="timeline-player-container" style="padding: 20px;">
                    <div style="text-align: center; color: var(--gray-500);">
                        <div class="spinner" style="margin: 0 auto 12px; width: 24px; height: 24px;"></div>
                        <p>Loading timeline player...</p>
                    </div>
                </div>
            </div>

            <!-- Monte Carlo Analysis Section -->
            <div class="card" id="monteCarloCard" style="border-left: 4px solid var(--info);">
                <div class="card-header">
                    <h3 style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 1.25rem;">&#127922;</span> Monte Carlo Analysis
                    </h3>
                    <button class="btn btn-primary btn-sm" onclick="runMonteCarloAnalysis()" id="runMonteCarloBtn">
                        Run 1000 Iterations
                    </button>
                </div>
                <div id="monteCarloContent">
                    <p style="color: var(--gray-500); margin-bottom: 12px;">
                        Monte Carlo simulation runs your scenario 1000+ times with randomized parameters
                        to show probability distributions instead of single point estimates.
                    </p>
                    <p style="font-size: 0.875rem; color: var(--gray-400);">
                        Click "Run 1000 Iterations" to see the range of possible outcomes and their likelihoods.
                    </p>
                </div>
            </div>

            <!-- Intervention Impact Section -->
            ${results.scenario.interventions && results.scenario.interventions.length > 0 && results.summary.interventions ? `
            <div class="card" id="interventionImpactCard" style="border-left: 4px solid var(--secondary);">
                <div class="card-header">
                    <h3 style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 1.25rem;">&#128200;</span> Intervention Impact
                    </h3>
                    <span style="font-size: 0.875rem; color: var(--gray-500);">Effects on simulation outcomes</span>
                </div>
                <div id="interventionImpactContent">
                    ${generateInterventionImpactHTML(results.summary.interventions, results.scenario.interventions)}
                </div>
            </div>
            ` : ''}

            <!-- Intervention Cost Calculator Section -->
            ${results.scenario.interventions && results.scenario.interventions.length > 0 ? `
            <div class="card" id="costCalculatorCard" style="border-left: 4px solid var(--warning);">
                <div class="card-header">
                    <h3 style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 1.25rem;">&#128176;</span> Intervention Cost Analysis
                    </h3>
                </div>
                <div id="costCalculatorContent">
                    ${typeof interventionCostCalculator !== 'undefined'
                        ? interventionCostCalculator.generateSummaryHTML(
                            interventionCostCalculator.calculateAllCosts(results.scenario.interventions, results)
                          )
                        : '<p style="color: var(--gray-500);">Cost calculator not available.</p>'
                    }
                </div>
            </div>
            ` : ''}

            <!-- Demographics Analysis Section -->
            <div class="card" id="demographicsCard" style="border-left: 4px solid #ec4899;">
                <div class="card-header">
                    <h3 style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 1.25rem;">&#128101;</span> Demographic Impact Analysis
                    </h3>
                    <span style="font-size: 0.875rem; color: var(--gray-500);">Impact by age, education, and gender</span>
                </div>
                <div id="demographicsContent">
                    ${typeof demographicsAnalyzer !== 'undefined'
                        ? generateDemographicsHTML(demographicsAnalyzer.analyzeImpacts(results))
                        : '<p style="color: var(--gray-500);">Demographics analyzer not available.</p>'
                    }
                </div>
            </div>

            <!-- Skills Gap Analysis Section -->
            <div class="card" id="skillsGapCard" style="border-left: 4px solid #14b8a6;">
                <div class="card-header">
                    <h3 style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 1.25rem;">&#128218;</span> Skills Gap Analysis
                    </h3>
                    <span style="font-size: 0.875rem; color: var(--gray-500);">Declining and growing skills with training paths</span>
                </div>
                <div id="skillsGapContent">
                    ${typeof skillsGapAnalyzer !== 'undefined'
                        ? generateSkillsGapHTML(skillsGapAnalyzer.analyzeSkillsGap(results))
                        : '<p style="color: var(--gray-500);">Skills gap analyzer not available.</p>'
                    }
                </div>
            </div>

            <!-- Export Actions Section -->
            <div class="card" id="exportActionsCard" style="border-left: 4px solid var(--gray-400);">
                <div class="card-header">
                    <h3 style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 1.25rem;">&#128190;</span> Export & Download
                    </h3>
                </div>
                <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                    <button class="btn btn-primary" onclick="downloadPDFReport()" id="downloadPDFBtn">
                        <span style="margin-right: 6px;">&#128196;</span> Download PDF Report
                    </button>
                    <button class="btn btn-outline" onclick="exportResults()">
                        <span style="margin-right: 6px;">&#128202;</span> Export JSON Data
                    </button>
                    <button class="btn btn-outline" onclick="copyScenarioURL()">
                        <span style="margin-right: 6px;">&#128279;</span> Copy Share URL
                    </button>
                </div>
            </div>
        </div>
    `;

    // Create charts
    setTimeout(() => {
        vizManager.createUnemploymentChart('projectedURChart', results.results);
        vizManager.createAdoptionChart('adoptionCurveChart', results.results);
        vizManager.createJobImpactChart('jobImpactChart', results.results);
        vizManager.createWageChart('wageTrendChart', results.results);
        vizManager.createProductivityChart('productivityChart', results.results);
        vizManager.createSectorImpactChart('sectorChangeChart',
            results.results[0].sectors,
            results.results[results.results.length - 1].sectors
        );
    }, 100);

    // Initialize timeline player
    if (typeof initializeTimeline !== 'undefined') {
        setTimeout(() => {
            initializeTimeline(results);
        }, 150);
    }
}

/**
 * Show intervention modal
 */
function showInterventionModal() {
    document.getElementById('interventionModal').style.display = 'flex';
    updateInterventionParams();
}

/**
 * Hide intervention modal
 */
function hideInterventionModal() {
    document.getElementById('interventionModal').style.display = 'none';
}

/**
 * Update intervention parameters form
 */
function updateInterventionParams() {
    const type = document.getElementById('interventionType').value;
    const types = interventionSystem.interventionTypes;
    const params = types[type].parameters;

    let html = '';
    for (const [key, config] of Object.entries(params)) {
        if (config.type === 'number') {
            html += `
                <div class="form-group">
                    <label style="color: var(--gray-700);">${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        ${config.unit ? `(${config.unit})` : ''}</label>
                    <input type="number" id="param_${key}" value="${config.default}"
                        min="${config.min || 0}" max="${config.max || 100}"
                        style="color: var(--gray-900);">
                </div>
            `;
        } else if (config.type === 'select') {
            html += `
                <div class="form-group">
                    <label style="color: var(--gray-700);">${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</label>
                    <select id="param_${key}" style="color: var(--gray-900);">
                        ${config.options.map(o => `<option value="${o}" ${o === config.default ? 'selected' : ''}>${o.replace(/_/g, ' ')}</option>`).join('')}
                    </select>
                </div>
            `;
        }
    }

    document.getElementById('interventionParams').innerHTML = html;
}

/**
 * Add intervention from modal
 */
function addIntervention() {
    const type = document.getElementById('interventionType').value;
    const types = interventionSystem.interventionTypes;
    const paramDefs = types[type].parameters;

    const params = {};
    for (const key of Object.keys(paramDefs)) {
        const el = document.getElementById(`param_${key}`);
        if (el) {
            params[key] = paramDefs[key].type === 'number' ?
                parseFloat(el.value) : el.value;
        }
    }

    interventionSystem.addIntervention(type, params);
    updateInterventionsList();
    hideInterventionModal();
}

/**
 * Quick add intervention with defaults
 */
function quickAddIntervention(type) {
    interventionSystem.addIntervention(type);
    updateInterventionsList();
}

/**
 * Update interventions list in sidebar
 */
function updateInterventionsList() {
    const container = document.getElementById('interventionsList');
    const interventions = interventionSystem.interventions;

    if (interventions.length === 0) {
        container.innerHTML = '<p class="no-interventions-message">No interventions added</p>';
        return;
    }

    let html = '';
    for (const intervention of interventions) {
        html += `
            <div class="intervention-card">
                <div class="header">
                    <span class="name">${intervention.name}</span>
                    <div class="toggle ${intervention.active ? 'active' : ''}"
                         onclick="toggleIntervention('${intervention.id}')"></div>
                </div>
                <div class="intervention-card-footer">
                    <span class="category">${intervention.category.replace('_', ' ')}</span>
                    <button class="btn btn-sm remove-btn" onclick="removeIntervention('${intervention.id}')">Remove</button>
                </div>
            </div>
        `;
    }

    container.innerHTML = html;
}

/**
 * Toggle intervention active state
 */
function toggleIntervention(id) {
    const intervention = interventionSystem.interventions.find(i => i.id == id);
    if (intervention) {
        intervention.active = !intervention.active;
        updateInterventionsList();
    }
}

/**
 * Remove intervention
 */
function removeIntervention(id) {
    interventionSystem.removeIntervention(parseFloat(id));
    updateInterventionsList();
}

/**
 * Export results - show options modal
 */
function exportResults() {
    if (!currentResults) {
        alert('No simulation results to export. Please run a simulation first.');
        return;
    }

    const choice = confirm('Export as PDF report?\n\nClick OK for PDF report\nClick Cancel for JSON data export');

    if (choice) {
        exportAsPDF();
    } else {
        exportAsJSON();
    }
}

/**
 * Export results as PDF report
 */
function exportAsPDF() {
    if (!currentResults) {
        alert('No simulation results to export. Please run a simulation first.');
        return;
    }

    if (typeof pdfExporter !== 'undefined') {
        pdfExporter.generateReport(currentResults);
    } else {
        alert('PDF export not available.');
    }
}

/**
 * Export results as JSON
 */
function exportAsJSON() {
    if (!currentResults) {
        alert('No simulation results to export. Please run a simulation first.');
        return;
    }

    const data = simulationEngine.exportResults('json');
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `simulation-results-${Date.now()}.json`;
    a.click();

    URL.revokeObjectURL(url);
}

/**
 * Reset simulation to defaults
 */
function resetSimulation() {
    resetToDefaults();
}

/**
 * Reset all settings to default values
 */
function resetToDefaults() {
    currentResults = null;
    interventionSystem.interventions = [];

    // Reset form values to defaults
    document.getElementById('scenarioName').value = DEFAULT_CONFIG.scenarioName;
    document.getElementById('targetYear').value = DEFAULT_CONFIG.targetYear;
    document.getElementById('targetUR').value = DEFAULT_CONFIG.targetUR;
    document.getElementById('urValue').textContent = DEFAULT_CONFIG.targetUR.toFixed(1);
    document.getElementById('aiAdoption').value = DEFAULT_CONFIG.aiAdoption;
    document.getElementById('aiValue').textContent = DEFAULT_CONFIG.aiAdoption;
    document.getElementById('automationPace').value = DEFAULT_CONFIG.automationPace;
    document.getElementById('adoptionCurve').value = DEFAULT_CONFIG.adoptionCurve;

    updateInterventionsList();

    // Reset results display
    document.getElementById('simulation-results').innerHTML = `
        <div class="card" style="text-align: center; padding: 60px;">
            <h3 style="margin-bottom: 16px;">No Simulation Run Yet</h3>
            <p style="color: var(--gray-500); margin-bottom: 24px;">
                Configure your scenario parameters and click "Run Simulation" to see projected impacts.
            </p>
            <button class="btn btn-primary" onclick="runSimulation()">Run Simulation</button>
        </div>
    `;

    // Show snapshot section
    showSection('snapshot');
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-tab')[0].classList.add('active');
}

/**
 * Get all saved simulations from localStorage
 */
function getSavedSimulations() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch (error) {
        console.error('Error loading saved simulations:', error);
        return [];
    }
}

/**
 * Save current simulation
 */
function saveSimulation() {
    if (!currentResults) {
        alert('No simulation results to save. Please run a simulation first.');
        return;
    }

    const name = prompt('Enter a name for this simulation:', currentResults.scenario.name);
    if (!name) return;

    const simulations = getSavedSimulations();

    const simulationToSave = {
        id: Date.now(),
        name: name,
        savedAt: new Date().toISOString(),
        config: {
            scenarioName: currentResults.scenario.name,
            targetYear: currentResults.scenario.timeframe.end_year,
            targetUR: currentResults.scenario.targets.unemployment_rate,
            aiAdoption: currentResults.scenario.targets.ai_adoption_rate,
            automationPace: currentResults.scenario.targets.automation_pace,
            adoptionCurve: currentResults.scenario.ai_parameters.adoption_curve
        },
        interventions: interventionSystem.interventions.map(i => ({
            type: i.type,
            parameters: i.parameters,
            active: i.active
        })),
        results: currentResults,
        summary: currentResults.summary
    };

    simulations.push(simulationToSave);

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(simulations));
        updateSavedSimulationsList();
        alert(`Simulation "${name}" saved successfully!`);
    } catch (error) {
        console.error('Error saving simulation:', error);
        alert('Failed to save simulation. Storage may be full.');
    }
}

/**
 * Load a saved simulation
 */
function loadSavedSimulation(id) {
    const simulations = getSavedSimulations();
    const simulation = simulations.find(s => s.id === id);

    if (!simulation) {
        alert('Simulation not found.');
        return;
    }

    // Load config into form
    document.getElementById('scenarioName').value = simulation.config.scenarioName;
    document.getElementById('targetYear').value = simulation.config.targetYear;
    document.getElementById('targetUR').value = simulation.config.targetUR;
    document.getElementById('urValue').textContent = simulation.config.targetUR;
    document.getElementById('aiAdoption').value = simulation.config.aiAdoption;
    document.getElementById('aiValue').textContent = simulation.config.aiAdoption;
    document.getElementById('automationPace').value = simulation.config.automationPace;
    document.getElementById('adoptionCurve').value = simulation.config.adoptionCurve;

    // Load interventions
    interventionSystem.interventions = [];
    for (const intervention of simulation.interventions) {
        interventionSystem.addIntervention(intervention.type, intervention.parameters, {
            active: intervention.active
        });
    }
    updateInterventionsList();

    // Load results
    currentResults = simulation.results;
    displaySimulationResults(currentResults);

    // Switch to simulation tab (index 3)
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById('simulation-section').classList.add('active');
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-tab')[3].classList.add('active');

    // Close modal if open
    hideSavedSimulationsModal();
}

/**
 * Delete a saved simulation
 */
function deleteSavedSimulation(id, event) {
    if (event) event.stopPropagation();

    if (!confirm('Are you sure you want to delete this simulation?')) {
        return;
    }

    const simulations = getSavedSimulations();
    const filtered = simulations.filter(s => s.id !== id);

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        updateSavedSimulationsList();
    } catch (error) {
        console.error('Error deleting simulation:', error);
        alert('Failed to delete simulation.');
    }
}

/**
 * Update the saved simulations list in sidebar
 */
function updateSavedSimulationsList() {
    const container = document.getElementById('savedSimulationsList');
    if (!container) return;

    const simulations = getSavedSimulations();

    if (simulations.length === 0) {
        container.innerHTML = '<p style="font-size: 0.875rem; color: var(--gray-400);">No saved simulations</p>';
        return;
    }

    let html = '';
    // Show most recent 3 simulations
    const recentSimulations = simulations.slice(-3).reverse();

    for (const sim of recentSimulations) {
        const date = new Date(sim.savedAt).toLocaleDateString();
        html += `
            <div class="saved-sim-card" onclick="loadSavedSimulation(${sim.id})" style="
                background: var(--gray-700);
                border-radius: 6px;
                padding: 10px;
                margin-bottom: 8px;
                cursor: pointer;
                transition: background 0.2s;
            " onmouseover="this.style.background='var(--gray-600)'" onmouseout="this.style.background='var(--gray-700)'">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <div style="font-weight: 500; font-size: 0.875rem;">${sim.name}</div>
                        <div style="font-size: 0.75rem; color: var(--gray-400);">${date}</div>
                        <div style="font-size: 0.75rem; color: var(--gray-400);">
                            UR: ${sim.summary.labor_market_changes.unemployment_rate.final}%
                        </div>
                    </div>
                    <button class="btn btn-sm" style="padding: 2px 6px; background: var(--gray-600); font-size: 0.7rem;"
                            onclick="deleteSavedSimulation(${sim.id}, event)">X</button>
                </div>
            </div>
        `;
    }

    if (simulations.length > 3) {
        html += `
            <button class="btn btn-outline btn-block btn-sm" onclick="showSavedSimulationsModal()" style="margin-top: 8px;">
                View All (${simulations.length})
            </button>
        `;
    }

    container.innerHTML = html;
}

/**
 * Show saved simulations modal
 */
function showSavedSimulationsModal() {
    const simulations = getSavedSimulations();
    const modal = document.getElementById('savedSimulationsModal');

    let html = '';
    if (simulations.length === 0) {
        html = '<p style="text-align: center; color: var(--gray-500);">No saved simulations</p>';
    } else {
        for (const sim of simulations.slice().reverse()) {
            const date = new Date(sim.savedAt).toLocaleDateString();
            const time = new Date(sim.savedAt).toLocaleTimeString();
            html += `
                <div class="card" style="margin-bottom: 12px; cursor: pointer;" onclick="loadSavedSimulation(${sim.id})">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div>
                            <h4 style="margin-bottom: 4px;">${sim.name}</h4>
                            <p style="font-size: 0.875rem; color: var(--gray-500); margin-bottom: 8px;">
                                Saved: ${date} at ${time}
                            </p>
                            <div style="display: flex; gap: 16px; font-size: 0.875rem;">
                                <span><strong>Target Year:</strong> ${sim.config.targetYear}</span>
                                <span><strong>Final UR:</strong> ${sim.summary.labor_market_changes.unemployment_rate.final}%</span>
                                <span><strong>AI Adoption:</strong> ${sim.summary.ai_impact.ai_adoption.final}%</span>
                            </div>
                            ${sim.interventions.length > 0 ? `
                                <div style="margin-top: 8px; font-size: 0.75rem; color: var(--gray-400);">
                                    Interventions: ${sim.interventions.filter(i => i.active).map(i => i.type.replace(/_/g, ' ')).join(', ')}
                                </div>
                            ` : ''}
                        </div>
                        <button class="btn btn-danger btn-sm" onclick="deleteSavedSimulation(${sim.id}, event)">Delete</button>
                    </div>
                </div>
            `;
        }
    }

    document.getElementById('savedSimulationsContent').innerHTML = html;
    modal.style.display = 'flex';
}

/**
 * Hide saved simulations modal
 */
function hideSavedSimulationsModal() {
    document.getElementById('savedSimulationsModal').style.display = 'none';
}

/**
 * Clear all saved simulations
 */
function clearAllSavedSimulations() {
    if (!confirm('Are you sure you want to delete ALL saved simulations? This cannot be undone.')) {
        return;
    }

    try {
        localStorage.removeItem(STORAGE_KEY);
        updateSavedSimulationsList();
        hideSavedSimulationsModal();
        alert('All saved simulations have been deleted.');
    } catch (error) {
        console.error('Error clearing simulations:', error);
        alert('Failed to clear simulations.');
    }
}

// ==========================================
// Hypothetical Indicators Functions
// ==========================================

/**
 * Render hypothetical indicators list
 */
function renderHypotheticalIndicators() {
    const container = document.getElementById('hypotheticalIndicatorsList');
    if (!container || typeof hypotheticalIndicators === 'undefined') return;

    const allIndicators = hypotheticalIndicators.getAllIndicators();
    const categoryNames = hypotheticalIndicators.getCategoryDisplayNames();

    // Group by category
    const grouped = {};
    Object.values(allIndicators).forEach(ind => {
        const cat = ind.category || 'other';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(ind);
    });

    let html = '';

    Object.entries(grouped).forEach(([category, indicators]) => {
        html += `
            <div style="margin-bottom: 20px;">
                <h4 style="font-size: 0.875rem; color: var(--gray-600); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
                    ${categoryNames[category] || category}
                </h4>
                <div style="display: grid; gap: 12px;">
        `;

        indicators.forEach(ind => {
            const isAdjusted = ind.manuallyAdjusted;
            const isCustom = ind.isCustom;
            const trendIcon = ind.trend === 'increasing' ? '↑' : ind.trend === 'decreasing' ? '↓' : '→';
            const trendClass = ind.trend === 'increasing' ? 'positive' : ind.trend === 'decreasing' ? 'negative' : '';

            html += `
                <div class="hypothetical-indicator-card" style="
                    background: var(--gray-50);
                    border: 1px solid ${isAdjusted ? 'var(--warning)' : 'var(--gray-200)'};
                    border-radius: 8px;
                    padding: 16px;
                    ${isAdjusted ? 'border-left: 3px solid var(--warning);' : ''}
                ">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 1.25rem;">${ind.icon}</span>
                            <div>
                                <div style="font-weight: 600; color: var(--gray-800);">
                                    ${ind.name}
                                    ${isCustom ? '<span class="tag tag-medium" style="margin-left: 8px; font-size: 0.65rem;">Custom</span>' : ''}
                                    ${isAdjusted ? '<span class="tag tag-high" style="margin-left: 8px; font-size: 0.65rem;">Adjusted</span>' : ''}
                                </div>
                                <div style="font-size: 0.75rem; color: var(--gray-500);">${ind.shortName} • ${ind.source}</div>
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 1.5rem; font-weight: 700; color: var(--gray-800);">
                                ${formatIndicatorValue(ind.value, ind.unit)}
                            </div>
                            <div class="change ${trendClass}" style="font-size: 0.75rem;">
                                ${trendIcon} ${ind.trend}
                            </div>
                        </div>
                    </div>

                    <p style="font-size: 0.8rem; color: var(--gray-600); margin-bottom: 12px;">
                        ${ind.description}
                    </p>

                    <div style="margin-bottom: 8px;">
                        <label style="font-size: 0.75rem; color: var(--gray-500); display: flex; justify-content: space-between;">
                            <span>Adjust Value</span>
                            <span>${ind.range.min} - ${ind.range.max}</span>
                        </label>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <input type="range"
                                   id="slider_${ind.id}"
                                   min="${ind.range.min}"
                                   max="${ind.range.max}"
                                   step="${(ind.range.max - ind.range.min) / 100}"
                                   value="${ind.value}"
                                   onchange="updateIndicatorValue('${ind.id}', this.value)"
                                   style="flex: 1;">
                            <input type="number"
                                   id="input_${ind.id}"
                                   value="${ind.value.toFixed(1)}"
                                   min="${ind.range.min}"
                                   max="${ind.range.max}"
                                   step="0.1"
                                   onchange="updateIndicatorValue('${ind.id}', this.value)"
                                   style="width: 70px; padding: 4px 8px; border: 1px solid var(--gray-300); border-radius: 4px; color: var(--gray-800);">
                        </div>
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="font-size: 0.7rem; color: var(--gray-400);">
                            Linked: ${ind.linkedMetrics.length > 0 ? ind.linkedMetrics.join(', ') : 'None'}
                        </div>
                        <div style="display: flex; gap: 8px;">
                            ${isAdjusted ? `
                                <button class="btn btn-sm btn-outline" onclick="resetIndicator('${ind.id}')" style="font-size: 0.7rem; padding: 2px 8px;">
                                    Reset
                                </button>
                            ` : ''}
                            ${isCustom ? `
                                <button class="btn btn-sm btn-danger" onclick="deleteCustomIndicator('${ind.id}')" style="font-size: 0.7rem; padding: 2px 8px;">
                                    Delete
                                </button>
                            ` : ''}
                            <button class="btn btn-sm btn-outline" onclick="showIndicatorDetails('${ind.id}')" style="font-size: 0.7rem; padding: 2px 8px;">
                                Details
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

/**
 * Format indicator value with appropriate unit
 */
function formatIndicatorValue(value, unit) {
    switch (unit) {
        case 'percent':
        case 'percent_workers':
        case 'percent_jobs_exposed':
        case 'percent_augmented':
        case 'percent_premium':
        case 'percent_monthly':
        case 'percent_new_roles':
        case 'percent_annual_change':
            return `${value.toFixed(1)}%`;
        case 'index_0_100':
            return value.toFixed(0);
        case 'millions':
            return `${value.toFixed(1)}M`;
        case 'thousands':
            return `${value.toFixed(0)}K`;
        case 'currency':
            return `$${value.toFixed(0)}`;
        case 'ratio':
            return value.toFixed(2);
        default:
            return value.toFixed(1);
    }
}

/**
 * Update indicator value from slider/input
 */
function updateIndicatorValue(id, value) {
    if (typeof hypotheticalIndicators === 'undefined') return;

    const numValue = parseFloat(value);
    hypotheticalIndicators.setIndicatorValue(id, numValue);

    // Update both slider and input
    const slider = document.getElementById(`slider_${id}`);
    const input = document.getElementById(`input_${id}`);
    if (slider) slider.value = numValue;
    if (input) input.value = numValue.toFixed(1);

    // Re-render to show adjusted state
    renderHypotheticalIndicators();
}

/**
 * Reset a single indicator
 */
function resetIndicator(id) {
    if (typeof hypotheticalIndicators === 'undefined') return;
    hypotheticalIndicators.resetIndicator(id);
    renderHypotheticalIndicators();
}

/**
 * Reset all hypothetical indicators
 */
function resetAllHypotheticalIndicators() {
    if (!confirm('Reset all hypothetical indicators to their default values?')) return;
    if (typeof hypotheticalIndicators === 'undefined') return;
    hypotheticalIndicators.resetAllIndicators();
    renderHypotheticalIndicators();
}

/**
 * Show indicator details modal
 */
function showIndicatorDetails(id) {
    if (typeof hypotheticalIndicators === 'undefined') return;

    const ind = hypotheticalIndicators.getIndicator(id);
    if (!ind) return;

    const linkedInfo = Object.entries(ind.linkageFormula)
        .map(([metric, coef]) => `${metric}: ${coef > 0 ? '+' : ''}${coef}`)
        .join(', ') || 'None';

    alert(`${ind.icon} ${ind.name} (${ind.shortName})

Description:
${ind.description}

Methodology:
${ind.methodology}

Source: ${ind.source}
${ind.sourceUrl ? `URL: ${ind.sourceUrl}` : ''}

Current Value: ${formatIndicatorValue(ind.value, ind.unit)}
Base Value: ${formatIndicatorValue(ind.baseValue, ind.unit)}
Range: ${ind.range.min} - ${ind.range.max}

Linkage Coefficients:
${linkedInfo}

Confidence: ${ind.confidence}
Trend: ${ind.trend}`);
}

/**
 * Toggle sources details visibility
 */
function toggleSourcesDetails() {
    const details = document.getElementById('sourcesDetails');
    if (details) {
        details.style.display = details.style.display === 'none' ? 'block' : 'none';
    }
}

/**
 * Show custom indicator modal
 */
function showCustomIndicatorModal() {
    document.getElementById('customIndicatorModal').style.display = 'flex';

    // Reset form
    document.getElementById('customIndName').value = '';
    document.getElementById('customIndShortName').value = '';
    document.getElementById('customIndDescription').value = '';
    document.getElementById('customIndValue').value = '';
    document.getElementById('customIndMin').value = '0';
    document.getElementById('customIndMax').value = '100';
    document.getElementById('customIndCategory').value = 'custom';
    document.getElementById('customIndIcon').value = '📊';

    // Reset checkboxes
    document.getElementById('link_unemployment').checked = false;
    document.getElementById('link_ai_adoption').checked = false;
    document.getElementById('link_productivity').checked = false;
    document.getElementById('link_wages').checked = false;
}

/**
 * Hide custom indicator modal
 */
function hideCustomIndicatorModal() {
    document.getElementById('customIndicatorModal').style.display = 'none';
}

/**
 * Save custom indicator
 */
function saveCustomIndicator() {
    if (typeof hypotheticalIndicators === 'undefined') return;

    const name = document.getElementById('customIndName').value.trim();
    const value = parseFloat(document.getElementById('customIndValue').value);

    if (!name) {
        alert('Please enter an indicator name.');
        return;
    }

    if (isNaN(value)) {
        alert('Please enter a valid initial value.');
        return;
    }

    const linkedMetrics = [];
    const linkageFormula = {};

    if (document.getElementById('link_unemployment').checked) {
        linkedMetrics.push('unemployment_rate');
        linkageFormula.unemployment_rate = 0.2;
    }
    if (document.getElementById('link_ai_adoption').checked) {
        linkedMetrics.push('ai_adoption');
        linkageFormula.ai_adoption = 0.3;
    }
    if (document.getElementById('link_productivity').checked) {
        linkedMetrics.push('productivity_growth');
        linkageFormula.productivity_growth = 0.2;
    }
    if (document.getElementById('link_wages').checked) {
        linkedMetrics.push('wage_growth');
        linkageFormula.wage_growth = 0.15;
    }

    const config = {
        name,
        shortName: document.getElementById('customIndShortName').value.trim() || name.substring(0, 4).toUpperCase(),
        description: document.getElementById('customIndDescription').value.trim(),
        value,
        unit: document.getElementById('customIndUnit').value,
        range: {
            min: parseFloat(document.getElementById('customIndMin').value) || 0,
            max: parseFloat(document.getElementById('customIndMax').value) || 100
        },
        category: document.getElementById('customIndCategory').value,
        icon: document.getElementById('customIndIcon').value,
        linkedMetrics,
        linkageFormula
    };

    hypotheticalIndicators.addCustomIndicator(config);
    hideCustomIndicatorModal();
    renderHypotheticalIndicators();

    alert(`Custom indicator "${name}" created successfully!`);
}

/**
 * Delete custom indicator
 */
function deleteCustomIndicator(id) {
    if (!confirm('Are you sure you want to delete this custom indicator?')) return;
    if (typeof hypotheticalIndicators === 'undefined') return;

    hypotheticalIndicators.removeCustomIndicator(id);
    renderHypotheticalIndicators();
}

// ==========================================
// AI Summary Functions
// ==========================================

/**
 * Update AI settings status in sidebar
 */
function updateAISettingsStatus() {
    const statusDiv = document.getElementById('aiSettingsStatus');
    if (!statusDiv) return;

    if (typeof aiSummaryService !== 'undefined' && aiSummaryService.hasApiKey()) {
        statusDiv.innerHTML = `
            <p style="font-size: 0.875rem; color: var(--secondary);">
                &#10003; API key configured
            </p>
        `;
    } else {
        statusDiv.innerHTML = `
            <p style="font-size: 0.875rem; color: var(--gray-400);">API key not configured</p>
        `;
    }
}

/**
 * Show AI settings modal
 */
function showAISettingsModal() {
    const modal = document.getElementById('aiSettingsModal');
    const input = document.getElementById('geminiApiKey');

    // Load existing key (masked)
    if (typeof aiSummaryService !== 'undefined' && aiSummaryService.hasApiKey()) {
        const key = aiSummaryService.getApiKey();
        input.value = key;
    } else {
        input.value = '';
    }

    modal.style.display = 'flex';
}

/**
 * Hide AI settings modal
 */
function hideAISettingsModal() {
    document.getElementById('aiSettingsModal').style.display = 'none';
}

/**
 * Save AI API key
 */
function saveAIApiKey() {
    const key = document.getElementById('geminiApiKey').value.trim();

    if (!key) {
        alert('Please enter an API key.');
        return;
    }

    if (typeof aiSummaryService !== 'undefined') {
        aiSummaryService.setApiKey(key);
        updateAISettingsStatus();
        hideAISettingsModal();
        alert('API key saved successfully! AI analysis will be available when you run simulations.');

        // If we have current results, offer to generate summary
        if (currentResults) {
            if (confirm('Would you like to generate an AI analysis for the current simulation?')) {
                generateAISummary(currentResults);
            }
        }
    }
}

/**
 * Clear AI API key
 */
function clearAIApiKey() {
    if (!confirm('Are you sure you want to remove your API key?')) {
        return;
    }

    if (typeof aiSummaryService !== 'undefined') {
        aiSummaryService.clearApiKey();
        document.getElementById('geminiApiKey').value = '';
        updateAISettingsStatus();
        hideAISettingsModal();
        alert('API key removed.');
    }
}

/**
 * Generate AI summary for simulation results
 */
async function generateAISummary(results) {
    const contentDiv = document.getElementById('aiSummaryContent');
    if (!contentDiv) return;

    // Show loading state
    contentDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px; color: var(--gray-500);">
            <div class="spinner" style="width: 20px; height: 20px; border-width: 2px;"></div>
            <span>Generating AI analysis...</span>
        </div>
    `;

    try {
        const summary = await aiSummaryService.generateSummary(results);

        // Format the summary with proper paragraphs
        const formattedSummary = summary
            .split('\n\n')
            .map(para => `<p style="margin-bottom: 16px;">${para.replace(/\n/g, '<br>')}</p>`)
            .join('');

        contentDiv.innerHTML = `
            <div class="ai-summary-text">
                ${formattedSummary}
            </div>
            <div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--gray-200); display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.75rem; color: var(--gray-400);">
                    Generated by Google Gemini AI
                </span>
                <button class="btn btn-sm btn-outline" onclick="regenerateAISummary()">
                    Regenerate
                </button>
            </div>
        `;
    } catch (error) {
        console.error('AI Summary error:', error);
        contentDiv.innerHTML = `
            <div style="color: var(--danger);">
                <p style="margin-bottom: 8px;"><strong>Error generating AI analysis:</strong></p>
                <p style="margin-bottom: 12px;">${error.message}</p>
                <button class="btn btn-sm btn-outline" onclick="regenerateAISummary()">Try Again</button>
            </div>
        `;
    }
}

/**
 * Regenerate AI summary
 */
function regenerateAISummary() {
    if (currentResults) {
        generateAISummary(currentResults);
    }
}

// ==========================================
// Scenario Comparison Functions
// ==========================================

/**
 * Render the comparison view
 */
function renderComparisonView() {
    const contentDiv = document.getElementById('comparison-content');
    const countSpan = document.getElementById('comparisonCount');
    const clearBtn = document.getElementById('clearComparisonBtn');

    if (!contentDiv || typeof scenarioComparison === 'undefined') return;

    const count = scenarioComparison.getCount();

    // Update count badge
    if (countSpan) {
        countSpan.textContent = `${count}/3 scenarios`;
    }

    // Show/hide clear button
    if (clearBtn) {
        clearBtn.style.display = count > 0 ? 'inline-block' : 'none';
    }

    // Render comparison HTML
    contentDiv.innerHTML = scenarioComparison.generateComparisonHTML();

    // Render charts if we have 2+ scenarios
    if (count >= 2) {
        setTimeout(() => {
            scenarioComparison.renderCharts();
        }, 100);
    }
}

/**
 * Add current simulation to comparison
 */
function addToComparison() {
    if (!currentResults) {
        alert('No simulation results to add. Please run a simulation first.');
        return;
    }

    if (typeof scenarioComparison === 'undefined') {
        alert('Comparison feature not available.');
        return;
    }

    const config = {
        targetYear: currentResults.scenario.timeframe.end_year,
        targetUR: currentResults.scenario.targets.unemployment_rate,
        aiAdoption: currentResults.scenario.targets.ai_adoption_rate,
        automationPace: currentResults.scenario.targets.automation_pace,
        interventions: currentResults.scenario.interventions
    };

    const name = currentResults.scenario.name || `Scenario ${scenarioComparison.getCount() + 1}`;

    const result = scenarioComparison.addScenario(name, config, currentResults);

    if (result.success) {
        // Update the comparison badge in the add button
        updateComparisonButton();

        alert(`"${name}" added to comparison! Go to "Compare Scenarios" tab to view.`);
    } else {
        alert(result.message);
    }
}

/**
 * Update the comparison button badge
 */
function updateComparisonButton() {
    const btn = document.getElementById('addToComparisonBtn');
    if (btn && typeof scenarioComparison !== 'undefined') {
        const count = scenarioComparison.getCount();
        const canAdd = scenarioComparison.canAddMore();

        if (!canAdd) {
            btn.disabled = true;
            btn.innerHTML = 'Comparison Full (3/3)';
        } else {
            btn.disabled = false;
            btn.innerHTML = `Add to Comparison (${count}/3)`;
        }
    }
}

/**
 * Clear all comparisons
 */
function clearAllComparisons() {
    if (!confirm('Are you sure you want to clear all scenarios from comparison?')) {
        return;
    }

    if (typeof scenarioComparison !== 'undefined') {
        scenarioComparison.clearAll();
        renderComparisonView();
        updateComparisonButton();
    }
}

/**
 * Remove a scenario from comparison (called from comparison view)
 */
function removeFromComparison(id) {
    if (typeof scenarioComparison !== 'undefined') {
        scenarioComparison.removeScenario(id);
        renderComparisonView();
        updateComparisonButton();
    }
}

// ==========================================
// Occupation Drill-Down Functions
// ==========================================

/**
 * Render occupation list
 */
function renderOccupationList() {
    const contentDiv = document.getElementById('occupation-content');
    if (!contentDiv || typeof occupationDrilldown === 'undefined') return;

    contentDiv.innerHTML = occupationDrilldown.generateOccupationListHTML();
}

/**
 * Show occupation details
 */
function showOccupationDetails(occupationId) {
    const contentDiv = document.getElementById('occupation-content');
    if (!contentDiv || typeof occupationDrilldown === 'undefined') return;

    // Get current scenario parameters
    const aiAdoptionRate = parseInt(document.getElementById('aiAdoption').value) || 70;
    const targetYear = parseInt(document.getElementById('targetYear').value) || 2029;

    contentDiv.innerHTML = occupationDrilldown.generateDetailedViewHTML(occupationId, aiAdoptionRate, targetYear);
}

/**
 * Hide occupation details and return to list
 */
function hideOccupationDetails() {
    renderOccupationList();
}

// ==========================================
// Sensitivity Analysis Functions
// ==========================================

/**
 * Render sensitivity analysis overview
 */
function renderSensitivityOverview() {
    const contentDiv = document.getElementById('sensitivity-content');
    if (!contentDiv || typeof sensitivityAnalysis === 'undefined') return;

    contentDiv.innerHTML = sensitivityAnalysis.generateOverviewHTML();
}

/**
 * Run sensitivity analysis for a specific parameter
 */
async function runParameterSensitivity(parameterId) {
    const resultsDiv = document.getElementById('sensitivity-results');
    if (!resultsDiv || typeof sensitivityAnalysis === 'undefined') return;

    // Show loading state
    resultsDiv.innerHTML = `
        <div class="card" style="text-align: center; padding: 40px;">
            <div class="loading">
                <div class="spinner"></div>
                <span>Running sensitivity analysis...</span>
            </div>
            <p style="color: var(--gray-500); margin-top: 16px; font-size: 0.875rem;">
                This may take a moment as multiple simulations are run.
            </p>
        </div>
    `;

    try {
        // Get current configuration
        const baseConfig = {
            name: 'Sensitivity Analysis',
            end_year: parseInt(document.getElementById('targetYear').value),
            target_unemployment: parseFloat(document.getElementById('targetUR').value),
            ai_adoption_rate: parseInt(document.getElementById('aiAdoption').value),
            automation_pace: document.getElementById('automationPace').value,
            adoption_curve: document.getElementById('adoptionCurve').value
        };

        // Run analysis
        const analysisResults = await sensitivityAnalysis.runAnalysis(
            parameterId,
            simulationEngine,
            baseConfig
        );

        // Display results
        resultsDiv.innerHTML = sensitivityAnalysis.generateAnalysisHTML(analysisResults);

    } catch (error) {
        console.error('Sensitivity analysis error:', error);
        resultsDiv.innerHTML = `
            <div class="card" style="text-align: center; padding: 40px; color: var(--danger);">
                <h3>Analysis Error</h3>
                <p>${error.message}</p>
                <button class="btn btn-outline" onclick="renderSensitivityOverview()" style="margin-top: 16px;">
                    Try Again
                </button>
            </div>
        `;
    }
}

// ==========================================
// Real Metrics Functions
// ==========================================

/**
 * Initialize real metrics system
 */
async function initializeRealMetrics() {
    if (typeof realMetricsSystem !== 'undefined' && dataService) {
        await realMetricsSystem.initialize(dataService);
        renderRealMetrics();
        renderRealMetricsSources();
    }
}

/**
 * Render real metrics list
 */
function renderRealMetrics() {
    const container = document.getElementById('realMetricsList');
    if (!container || typeof realMetricsSystem === 'undefined') return;

    const metricsByCategory = realMetricsSystem.getMetricsByCategory();
    if (!metricsByCategory) {
        container.innerHTML = '<p style="color: var(--gray-500);">Loading metrics...</p>';
        return;
    }

    let html = '';

    Object.entries(metricsByCategory).forEach(([categoryId, category]) => {
        html += `
            <div style="margin-bottom: 24px;">
                <h4 style="font-size: 0.875rem; color: var(--gray-600); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; gap: 8px;">
                    <span>${category.icon}</span> ${category.category}
                </h4>
                <div style="display: grid; gap: 12px;">
        `;

        Object.values(category.metrics).forEach(metric => {
            const isAdjusted = metric.manuallyAdjusted;
            const trendIcon = metric.trend === 'increasing' ? '↑' : metric.trend === 'decreasing' ? '↓' : '→';
            const trendClass = metric.trend === 'increasing' ? 'positive' : metric.trend === 'decreasing' ? 'negative' : '';

            html += `
                <div class="real-metric-card" style="
                    background: var(--gray-50);
                    border: 1px solid ${isAdjusted ? 'var(--warning)' : 'var(--gray-200)'};
                    border-radius: 8px;
                    padding: 16px;
                    ${isAdjusted ? 'border-left: 3px solid var(--warning);' : ''}
                ">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <div>
                                <div style="font-weight: 600; color: var(--gray-800);">
                                    ${metric.name}
                                    ${isAdjusted ? '<span class="tag tag-high" style="margin-left: 8px; font-size: 0.65rem;">Adjusted</span>' : ''}
                                </div>
                                <div style="font-size: 0.75rem; color: var(--gray-500);">
                                    ${metric.shortName} • ${metric.source} • ${metric.date || 'Current'}
                                </div>
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 1.5rem; font-weight: 700; color: var(--gray-800);">
                                ${formatRealMetricValue(metric.value, metric.unit)}
                            </div>
                            <div class="change ${trendClass}" style="font-size: 0.75rem;">
                                ${trendIcon} ${metric.trend}
                            </div>
                        </div>
                    </div>

                    <p style="font-size: 0.8rem; color: var(--gray-600); margin-bottom: 12px;">
                        ${metric.description}
                    </p>

                    <div style="margin-bottom: 8px;">
                        <label style="font-size: 0.75rem; color: var(--gray-500); display: flex; justify-content: space-between;">
                            <span>Adjust Value</span>
                            <span>${formatRealMetricValue(metric.range.min, metric.unit)} - ${formatRealMetricValue(metric.range.max, metric.unit)}</span>
                        </label>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <input type="range"
                                   id="realmetric_slider_${metric.id}"
                                   min="${metric.range.min}"
                                   max="${metric.range.max}"
                                   step="${(metric.range.max - metric.range.min) / 100}"
                                   value="${metric.value}"
                                   onchange="updateRealMetricValue('${metric.id}', this.value)"
                                   style="flex: 1;">
                            <input type="number"
                                   id="realmetric_input_${metric.id}"
                                   value="${formatRealMetricInput(metric.value, metric.unit)}"
                                   min="${metric.range.min}"
                                   max="${metric.range.max}"
                                   step="${getMetricStep(metric.unit)}"
                                   onchange="updateRealMetricValue('${metric.id}', this.value)"
                                   style="width: 100px; padding: 4px 8px; border: 1px solid var(--gray-300); border-radius: 4px; color: var(--gray-800);">
                        </div>
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="font-size: 0.7rem; color: var(--gray-400);">
                            ${metric.seriesId ? `Series: ${metric.seriesId}` : ''}
                        </div>
                        <div style="display: flex; gap: 8px;">
                            ${isAdjusted ? `
                                <button class="btn btn-sm btn-outline" onclick="resetRealMetric('${metric.id}')" style="font-size: 0.7rem; padding: 2px 8px;">
                                    Reset
                                </button>
                            ` : ''}
                            <button class="btn btn-sm btn-outline" onclick="showRealMetricDetails('${metric.id}')" style="font-size: 0.7rem; padding: 2px 8px;">
                                Details
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

/**
 * Format real metric value for display
 */
function formatRealMetricValue(value, unit) {
    switch (unit) {
        case 'percent':
            return `${value.toFixed(1)}%`;
        case 'millions':
            if (value >= 1000000) {
                return `${(value / 1000000).toFixed(1)}M`;
            }
            return `${(value / 1000000).toFixed(2)}M`;
        case 'currency':
            return `$${value.toFixed(2)}`;
        case 'index':
            return value.toFixed(1);
        default:
            return value.toFixed(1);
    }
}

/**
 * Format real metric value for input field
 */
function formatRealMetricInput(value, unit) {
    if (unit === 'millions' && value >= 1000000) {
        return value.toFixed(0);
    }
    return value.toFixed(2);
}

/**
 * Get step value for metric input
 */
function getMetricStep(unit) {
    switch (unit) {
        case 'millions':
            return 100000;
        case 'percent':
            return 0.1;
        case 'currency':
            return 0.01;
        default:
            return 0.1;
    }
}

/**
 * Update real metric value
 */
function updateRealMetricValue(id, value) {
    if (typeof realMetricsSystem === 'undefined') return;

    const numValue = parseFloat(value);
    realMetricsSystem.setMetricValue(id, numValue);

    // Update both slider and input
    const slider = document.getElementById(`realmetric_slider_${id}`);
    const input = document.getElementById(`realmetric_input_${id}`);
    const metric = realMetricsSystem.getMetric(id);

    if (slider) slider.value = numValue;
    if (input && metric) input.value = formatRealMetricInput(numValue, metric.unit);

    // Re-render to show adjusted state
    renderRealMetrics();
}

/**
 * Reset a single real metric
 */
function resetRealMetric(id) {
    if (typeof realMetricsSystem === 'undefined') return;
    realMetricsSystem.resetMetric(id);
    renderRealMetrics();
}

/**
 * Reset all real metrics
 */
function resetAllRealMetrics() {
    if (!confirm('Reset all real metrics to their baseline values?')) return;
    if (typeof realMetricsSystem === 'undefined') return;
    realMetricsSystem.resetAllMetrics();
    renderRealMetrics();
}

/**
 * Show real metric details
 */
function showRealMetricDetails(id) {
    if (typeof realMetricsSystem === 'undefined') return;

    const metric = realMetricsSystem.getMetric(id);
    if (!metric) return;

    alert(`${metric.name} (${metric.shortName})

Description:
${metric.description}

Methodology:
${metric.methodology}

Source: ${metric.source}
${metric.sourceUrl ? `URL: ${metric.sourceUrl}` : ''}
${metric.seriesId ? `Series ID: ${metric.seriesId}` : ''}

Current Value: ${formatRealMetricValue(metric.value, metric.unit)}
Base Value: ${formatRealMetricValue(metric.baseValue, metric.unit)}
Data Date: ${metric.date || 'Current'}

Trend: ${metric.trend}`);
}

/**
 * Toggle real metrics sources details
 */
function toggleRealMetricsSourcesDetails() {
    const details = document.getElementById('realMetricsSourcesDetails');
    if (details) {
        details.style.display = details.style.display === 'none' ? 'block' : 'none';
    }
}

/**
 * Render real metrics data sources
 */
function renderRealMetricsSources() {
    const container = document.getElementById('realMetricsSourcesTable');
    if (!container || typeof realMetricsSystem === 'undefined') return;

    const sources = realMetricsSystem.getDataSources();

    let html = '';
    sources.forEach(source => {
        html += `
            <tr>
                <td><strong>${source.name}</strong></td>
                <td>${source.type}</td>
                <td>${source.metrics.join(', ')}</td>
                <td>${source.updateFrequency}</td>
                <td><a href="${source.url}" target="_blank" style="color: var(--primary);">View</a></td>
            </tr>
        `;
    });

    container.innerHTML = html;
}

// ==========================================
// Settings & API Key Functions
// ==========================================

/**
 * Initialize settings page
 */
function initializeSettings() {
    // Load saved API keys into fields
    loadApiKeyFields();

    // Update status badges
    updateAllApiStatuses();

    // Update fetch button state
    updateFetchButtonState();

    // Update auto data status
    updateAutoDataStatus();
}

/**
 * Update the auto-updated data status display
 */
function updateAutoDataStatus() {
    const statusDiv = document.getElementById('autoDataStatus');
    if (!statusDiv || !dataService) return;

    const liveStatus = dataService.getLiveDataStatus();

    if (liveStatus.available && liveStatus.sources.bls === 'success') {
        const lastUpdated = new Date(liveStatus.lastUpdated);
        const formattedDate = lastUpdated.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        statusDiv.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <span style="color: var(--secondary); font-size: 1.25rem;">&#10003;</span>
                <strong style="color: var(--secondary);">Live Data Active</strong>
            </div>
            <p style="color: var(--gray-600); font-size: 0.875rem; margin-bottom: 8px;">
                Data automatically updated: <strong>${formattedDate}</strong>
            </p>
            <div style="display: flex; gap: 16px; flex-wrap: wrap; font-size: 0.8rem; color: var(--gray-600);">
                <span>BLS: <strong style="color: var(--secondary);">${liveStatus.sources.bls}</strong></span>
                <span>FRED: <strong style="color: ${liveStatus.sources.fred === 'success' ? 'var(--secondary)' : 'var(--gray-400)'};">${liveStatus.sources.fred}</strong></span>
            </div>
            ${liveStatus.summary ? `
                <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--gray-200); font-size: 0.8rem;">
                    <strong>Latest Values:</strong>
                    <div style="display: flex; gap: 16px; flex-wrap: wrap; margin-top: 4px; color: var(--gray-600);">
                        ${liveStatus.summary.unemployment_rate ? `<span>Unemployment: <strong>${liveStatus.summary.unemployment_rate}%</strong></span>` : ''}
                        ${liveStatus.summary.total_employment ? `<span>Employment: <strong>${(liveStatus.summary.total_employment / 1e6).toFixed(1)}M</strong></span>` : ''}
                    </div>
                </div>
            ` : ''}
        `;
    } else {
        statusDiv.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <span style="color: var(--warning); font-size: 1.25rem;">&#9888;</span>
                <strong style="color: var(--gray-600);">Using Baseline Data</strong>
            </div>
            <p style="color: var(--gray-600); font-size: 0.875rem;">
                Currently using cached baseline data from late 2024.
            </p>
            <p style="color: var(--gray-500); font-size: 0.75rem; margin-top: 8px;">
                Auto-updated data will be available once the repository owner configures the GitHub Actions workflow with API keys.
            </p>
        `;
    }
}

/**
 * Load saved API keys into input fields
 */
function loadApiKeyFields() {
    const blsKey = getApiKey('bls');
    const fredKey = getApiKey('fred');
    const geminiKey = getApiKey('gemini');

    const blsInput = document.getElementById('blsApiKey');
    const fredInput = document.getElementById('fredApiKey');
    const geminiInput = document.getElementById('geminiApiKeySettings');

    if (blsInput && blsKey) blsInput.value = blsKey;
    if (fredInput && fredKey) fredInput.value = fredKey;
    if (geminiInput && geminiKey) geminiInput.value = geminiKey;
}

/**
 * Get API key from localStorage
 */
function getApiKey(service) {
    const storageKey = API_KEYS_STORAGE[service];
    if (!storageKey) return null;

    try {
        return localStorage.getItem(storageKey) || null;
    } catch (error) {
        console.error(`Error loading ${service} API key:`, error);
        return null;
    }
}

/**
 * Save API key
 */
function saveApiKey(service) {
    const inputMap = {
        bls: 'blsApiKey',
        fred: 'fredApiKey',
        gemini: 'geminiApiKeySettings'
    };

    const inputId = inputMap[service];
    const input = document.getElementById(inputId);

    if (!input) {
        alert('Error: Input field not found.');
        return;
    }

    const key = input.value.trim();

    if (!key) {
        alert('Please enter an API key.');
        return;
    }

    const storageKey = API_KEYS_STORAGE[service];

    try {
        localStorage.setItem(storageKey, key);

        // Also update the aiSummaryService if it's the Gemini key
        if (service === 'gemini' && typeof aiSummaryService !== 'undefined') {
            aiSummaryService.setApiKey(key);
        }

        updateAllApiStatuses();
        updateFetchButtonState();

        const serviceNames = {
            bls: 'BLS',
            fred: 'FRED',
            gemini: 'Gemini'
        };

        alert(`${serviceNames[service]} API key saved successfully!`);
    } catch (error) {
        console.error(`Error saving ${service} API key:`, error);
        alert('Failed to save API key. Storage may be full.');
    }
}

/**
 * Clear API key
 */
function clearApiKey(service) {
    if (!confirm(`Are you sure you want to remove the ${service.toUpperCase()} API key?`)) {
        return;
    }

    const storageKey = API_KEYS_STORAGE[service];
    const inputMap = {
        bls: 'blsApiKey',
        fred: 'fredApiKey',
        gemini: 'geminiApiKeySettings'
    };

    try {
        localStorage.removeItem(storageKey);

        // Clear the input field
        const input = document.getElementById(inputMap[service]);
        if (input) input.value = '';

        // Also clear from aiSummaryService if it's the Gemini key
        if (service === 'gemini' && typeof aiSummaryService !== 'undefined') {
            aiSummaryService.clearApiKey();
        }

        updateAllApiStatuses();
        updateFetchButtonState();

        alert('API key removed.');
    } catch (error) {
        console.error(`Error clearing ${service} API key:`, error);
        alert('Failed to clear API key.');
    }
}

/**
 * Update all API status badges
 */
function updateAllApiStatuses() {
    updateApiStatus('bls', 'blsApiStatus');
    updateApiStatus('fred', 'fredApiStatus');
    updateApiStatus('gemini', 'geminiApiStatus');

    // Also update the sidebar AI settings status
    updateAISettingsStatus();
}

/**
 * Update a single API status badge
 */
function updateApiStatus(service, elementId) {
    const statusElement = document.getElementById(elementId);
    if (!statusElement) return;

    const hasKey = !!getApiKey(service);

    if (hasKey) {
        statusElement.className = 'tag tag-medium';
        statusElement.textContent = 'Configured';
        statusElement.style.background = 'var(--secondary)';
        statusElement.style.color = 'white';
    } else {
        statusElement.className = 'tag tag-low';
        statusElement.textContent = 'Not Configured';
        statusElement.style.background = '';
        statusElement.style.color = '';
    }
}

/**
 * Update fetch button state based on available API keys
 */
function updateFetchButtonState() {
    const fetchBtn = document.getElementById('fetchLiveDataBtn');
    const statusDiv = document.getElementById('liveDataStatus');

    const hasBlsKey = !!getApiKey('bls');
    const hasFredKey = !!getApiKey('fred');
    const hasAnyKey = hasBlsKey || hasFredKey;

    if (fetchBtn) {
        fetchBtn.disabled = !hasAnyKey;
    }

    if (statusDiv) {
        if (hasAnyKey) {
            const sources = [];
            if (hasBlsKey) sources.push('BLS');
            if (hasFredKey) sources.push('FRED');

            statusDiv.innerHTML = `
                <p style="color: var(--secondary); font-size: 0.875rem;">
                    <strong>Ready to fetch live data</strong> from ${sources.join(' and ')}
                </p>
                <p style="color: var(--gray-500); font-size: 0.75rem; margin-top: 8px;">
                    Click "Fetch Live Data" to update metrics with the latest available data.
                </p>
            `;
        } else {
            statusDiv.innerHTML = `
                <p style="color: var(--gray-600); font-size: 0.875rem;">
                    <strong>Current Data Status:</strong> Using cached baseline data from late 2024
                </p>
                <p style="color: var(--gray-500); font-size: 0.75rem; margin-top: 8px;">
                    Configure BLS and/or FRED API keys above to enable live data fetching.
                </p>
            `;
        }
    }
}

/**
 * Fetch live data from configured APIs
 */
async function fetchLiveData() {
    const progressDiv = document.getElementById('fetchProgress');
    const progressText = document.getElementById('fetchProgressText');
    const resultsDiv = document.getElementById('fetchResults');
    const fetchBtn = document.getElementById('fetchLiveDataBtn');

    const blsKey = getApiKey('bls');
    const fredKey = getApiKey('fred');

    if (!blsKey && !fredKey) {
        alert('Please configure at least one API key to fetch live data.');
        return;
    }

    // Show progress
    if (progressDiv) progressDiv.style.display = 'block';
    if (fetchBtn) fetchBtn.disabled = true;
    if (resultsDiv) resultsDiv.innerHTML = '';

    const results = {
        bls: { success: false, data: null, error: null },
        fred: { success: false, data: null, error: null }
    };

    try {
        // Fetch BLS data if key is available
        if (blsKey) {
            if (progressText) progressText.textContent = 'Fetching BLS data...';

            try {
                const currentYear = new Date().getFullYear();
                const blsData = await dataService.fetchBLSData(
                    [
                        dataService.blsSeries.unemployment_rate,
                        dataService.blsSeries.total_employment,
                        dataService.blsSeries.labor_force_participation,
                        dataService.blsSeries.average_hourly_earnings,
                        dataService.blsSeries.job_openings
                    ],
                    currentYear - 1,
                    currentYear,
                    blsKey
                );

                results.bls.success = true;
                results.bls.data = blsData;

                // Update the metrics system with new BLS data
                if (blsData && blsData.length > 0) {
                    updateMetricsFromBLS(blsData);
                }
            } catch (error) {
                results.bls.error = error.message;
                console.error('BLS fetch error:', error);
            }
        }

        // Fetch FRED data if key is available
        if (fredKey) {
            if (progressText) progressText.textContent = 'Fetching FRED data...';

            try {
                const fredData = await dataService.fetchFREDData(
                    dataService.fredSeries.real_gdp_growth,
                    fredKey
                );

                results.fred.success = true;
                results.fred.data = fredData;
            } catch (error) {
                results.fred.error = error.message;
                console.error('FRED fetch error:', error);
            }
        }

        // Display results
        displayFetchResults(results);

    } catch (error) {
        console.error('Fetch error:', error);
        if (resultsDiv) {
            resultsDiv.innerHTML = `
                <div style="background: var(--danger); color: white; padding: 12px; border-radius: 6px;">
                    <strong>Error:</strong> ${error.message}
                </div>
            `;
        }
    } finally {
        if (progressDiv) progressDiv.style.display = 'none';
        if (fetchBtn) fetchBtn.disabled = false;
    }
}

/**
 * Update metrics from BLS API response
 */
function updateMetricsFromBLS(blsData) {
    if (!blsData || typeof realMetricsSystem === 'undefined') return;

    const seriesMap = {
        'LNS14000000': 'unemployment_rate',
        'CES0000000001': 'total_employment',
        'LNS11300000': 'labor_force_participation',
        'CES0500000003': 'average_hourly_earnings',
        'JTS000000000000000JOL': 'job_openings'
    };

    blsData.forEach(series => {
        const metricId = seriesMap[series.seriesID];
        if (metricId && series.data && series.data.length > 0) {
            // Get the most recent value
            const latestData = series.data[0];
            const value = parseFloat(latestData.value);

            if (!isNaN(value)) {
                // For employment figures, multiply by 1000 (BLS reports in thousands)
                if (metricId === 'total_employment' || metricId === 'job_openings') {
                    realMetricsSystem.setMetricValue(metricId, value * 1000);
                } else {
                    realMetricsSystem.setMetricValue(metricId, value);
                }
            }
        }
    });

    // Re-render the metrics display
    renderRealMetrics();
}

/**
 * Display fetch results
 */
function displayFetchResults(results) {
    const resultsDiv = document.getElementById('fetchResults');
    if (!resultsDiv) return;

    let html = '';

    if (results.bls.success || results.fred.success) {
        html += `
            <div style="background: var(--secondary); color: white; padding: 12px; border-radius: 6px; margin-bottom: 12px;">
                <strong>Data updated successfully!</strong>
            </div>
        `;
    }

    if (results.bls.success) {
        const seriesCount = results.bls.data ? results.bls.data.length : 0;
        html += `
            <div style="background: var(--gray-50); border: 1px solid var(--gray-200); padding: 12px; border-radius: 6px; margin-bottom: 8px;">
                <strong style="color: var(--gray-800);">BLS Data:</strong>
                <span style="color: var(--secondary);"> ${seriesCount} series updated</span>
            </div>
        `;
    } else if (results.bls.error) {
        html += `
            <div style="background: var(--gray-50); border: 1px solid var(--danger); padding: 12px; border-radius: 6px; margin-bottom: 8px;">
                <strong style="color: var(--danger);">BLS Error:</strong>
                <span style="color: var(--gray-600);"> ${results.bls.error}</span>
            </div>
        `;
    }

    if (results.fred.success) {
        html += `
            <div style="background: var(--gray-50); border: 1px solid var(--gray-200); padding: 12px; border-radius: 6px; margin-bottom: 8px;">
                <strong style="color: var(--gray-800);">FRED Data:</strong>
                <span style="color: var(--secondary);"> Updated successfully</span>
            </div>
        `;
    } else if (results.fred.error) {
        html += `
            <div style="background: var(--gray-50); border: 1px solid var(--danger); padding: 12px; border-radius: 6px; margin-bottom: 8px;">
                <strong style="color: var(--danger);">FRED Error:</strong>
                <span style="color: var(--gray-600);"> ${results.fred.error}</span>
            </div>
        `;
    }

    html += `
        <p style="font-size: 0.75rem; color: var(--gray-500); margin-top: 12px;">
            Last updated: ${new Date().toLocaleString()}
        </p>
    `;

    resultsDiv.innerHTML = html;
}

/**
 * Reset everything to defaults - complete reset of all simulator state
 */
function resetEverything() {
    if (!confirm('Reset everything to defaults? This will:\n\n• Reset all simulation parameters\n• Reset all economic metrics to baseline\n• Reset all AI indicators\n• Clear all interventions\n• Clear comparison scenarios\n\nSaved simulations will be preserved.')) {
        return;
    }

    // Reset simulation parameters
    resetToDefaults();

    // Reset real metrics
    if (typeof realMetricsSystem !== 'undefined') {
        realMetricsSystem.resetAllMetrics();
        renderRealMetrics();
    }

    // Reset hypothetical indicators
    if (typeof hypotheticalIndicators !== 'undefined') {
        hypotheticalIndicators.resetAllIndicators();
        renderHypotheticalIndicators();
    }

    // Clear interventions
    activeInterventions = [];
    updateInterventionsList();

    // Clear comparison scenarios
    if (typeof scenarioComparison !== 'undefined') {
        scenarioComparison.clearAll();
        renderComparisonView();
    }

    // Reset the current snapshot display
    updateSnapshot();

    // Show confirmation
    alert('Everything has been reset to defaults.');
}

/**
 * Reset to baseline data
 */
function resetToBaselineData() {
    if (!confirm('Reset all metrics to baseline values? This will undo any live data updates or manual adjustments.')) {
        return;
    }

    if (typeof realMetricsSystem !== 'undefined') {
        realMetricsSystem.resetAllMetrics();
        renderRealMetrics();
    }

    if (typeof hypotheticalIndicators !== 'undefined') {
        hypotheticalIndicators.resetAllIndicators();
        renderHypotheticalIndicators();
    }

    const resultsDiv = document.getElementById('fetchResults');
    if (resultsDiv) {
        resultsDiv.innerHTML = `
            <div style="background: var(--secondary); color: white; padding: 12px; border-radius: 6px;">
                Metrics reset to baseline values.
            </div>
        `;
    }

    updateFetchButtonState();
}

// ============================================
// SIMULATION SHARING FUNCTIONS
// ============================================

/**
 * Share the current simulation publicly
 */
async function shareSimulation() {
    if (!currentResults) {
        alert('Please run a simulation first before sharing.');
        return;
    }

    const name = prompt('Enter a name for your shared simulation:', currentResults.scenario.name || 'My Simulation');
    if (!name) return;

    const description = prompt('Add a description (optional):', '');

    const shareBtn = document.getElementById('shareBtn');
    const originalText = shareBtn.textContent;
    shareBtn.textContent = 'Sharing...';
    shareBtn.disabled = true;

    try {
        const result = await simulationSharing.savePublic({
            name,
            description,
            scenario: currentResults.scenario,
            results: currentResults.results,
            summary: currentResults.summary
        });

        // Copy URL to clipboard
        await simulationSharing.copyShareUrl(result.id);

        alert(`Simulation shared successfully!\n\nShare URL (copied to clipboard):\n${result.url}\n\nThis link will expire in ${result.expiresIn}.`);

    } catch (error) {
        console.error('Share error:', error);
        alert(`Failed to share simulation: ${error.message}`);
    } finally {
        shareBtn.textContent = originalText;
        shareBtn.disabled = false;
    }
}

/**
 * Check for and load a shared simulation from URL
 */
async function checkForSharedSimulation() {
    // First check for URL parameter sharing (scenario config only)
    if (typeof urlSharing !== 'undefined' && urlSharing.hasScenarioInURL()) {
        try {
            applyScenarioFromURL();
            updateSlidersFromInputs();
            return; // Don't also check for simulation sharing
        } catch (e) {
            console.warn('Failed to load URL parameters:', e);
        }
    }

    // Then check for cloud-based simulation sharing (full results)
    if (typeof simulationSharing === 'undefined') return;

    const sharedId = simulationSharing.getSharedIdFromUrl();
    if (!sharedId) return;

    console.log('Loading shared simulation:', sharedId);

    try {
        const simulation = await simulationSharing.load(sharedId);

        // Display notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--primary);
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        notification.innerHTML = `
            <strong>Viewing shared simulation:</strong> ${simulation.name}
            <br><small>Shared ${new Date(simulation.createdAt).toLocaleDateString()} • ${simulation.views} views</small>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);

        // Set the scenario configuration
        if (simulation.scenario) {
            document.getElementById('scenarioName').value = simulation.name || simulation.scenario.name;
            document.getElementById('targetYear').value = simulation.scenario.timeframe?.end_year || '2029';
            document.getElementById('targetUR').value = simulation.scenario.targets?.unemployment_rate || 10;
            document.getElementById('urValue').textContent = simulation.scenario.targets?.unemployment_rate || 10;
            document.getElementById('aiAdoption').value = simulation.scenario.targets?.ai_adoption_rate || 70;
            document.getElementById('aiValue').textContent = simulation.scenario.targets?.ai_adoption_rate || 70;
            document.getElementById('automationPace').value = simulation.scenario.targets?.automation_pace || 'moderate';
            document.getElementById('adoptionCurve').value = simulation.scenario.ai_parameters?.adoption_curve || 's_curve';
        }

        // Load the results
        currentResults = {
            scenario: simulation.scenario,
            results: simulation.results,
            summary: simulation.summary
        };

        // Display the results
        displaySimulationResults(currentResults);

        // Show share button
        document.getElementById('shareBtn').style.display = 'inline-block';

        // Switch to simulation tab
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        document.getElementById('simulation-section').classList.add('active');
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.nav-tab')[3].classList.add('active');

        // Clear URL parameter to prevent reload issues
        window.history.replaceState({}, document.title, window.location.pathname);

    } catch (error) {
        console.error('Failed to load shared simulation:', error);
        alert(`Failed to load shared simulation: ${error.message}`);
        // Clear the URL parameter
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

/**
 * Show share button after simulation runs
 */
function showShareButton() {
    const shareBtn = document.getElementById('shareBtn');
    if (shareBtn && typeof simulationSharing !== 'undefined' && simulationSharing.isAvailable()) {
        shareBtn.style.display = 'inline-block';
    }
}

// ==========================================
// Monte Carlo Simulation Functions
// ==========================================

let monteCarloInstance = null;

/**
 * Run Monte Carlo analysis on current simulation
 */
async function runMonteCarloAnalysis() {
    if (!currentResults || !simulationEngine) {
        alert('Please run a simulation first');
        return;
    }

    const btn = document.getElementById('runMonteCarloBtn');
    const content = document.getElementById('monteCarloContent');

    // Disable button and show progress
    btn.disabled = true;
    btn.innerHTML = 'Running... 0%';

    content.innerHTML = `
        <div style="margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span>Running 1000 iterations...</span>
                <span id="mcProgress">0%</span>
            </div>
            <div class="progress-bar" style="height: 12px;">
                <div class="fill" id="mcProgressBar" style="width: 0%;"></div>
            </div>
        </div>
        <p style="color: var(--gray-500); font-size: 0.875rem;">
            This may take 30-60 seconds. Each iteration randomizes parameters within realistic ranges.
        </p>
    `;

    try {
        // Initialize Monte Carlo
        monteCarloInstance = new MonteCarloSimulation(simulationEngine);
        monteCarloInstance.configure({ iterations: 1000 });

        // Get current scenario config
        const config = {
            name: currentResults.scenario.name,
            end_year: currentResults.scenario.timeframe.end_year,
            target_unemployment: currentResults.scenario.targets.unemployment_rate,
            ai_adoption_rate: currentResults.scenario.targets.ai_adoption_rate,
            automation_pace: currentResults.scenario.targets.automation_pace,
            adoption_curve: currentResults.scenario.ai_parameters.adoption_curve,
            new_job_multiplier: currentResults.scenario.ai_parameters.new_job_multiplier || 0.4,
            gdp_growth: currentResults.scenario.economic_parameters?.gdp_growth || 2.5,
            labor_elasticity: currentResults.scenario.economic_parameters?.labor_elasticity || 0.7
        };

        // Run with progress callback
        const results = await monteCarloInstance.run(config, (progress) => {
            const progressEl = document.getElementById('mcProgress');
            const progressBar = document.getElementById('mcProgressBar');
            if (progressEl) progressEl.textContent = `${Math.round(progress)}%`;
            if (progressBar) progressBar.style.width = `${progress}%`;
            btn.innerHTML = `Running... ${Math.round(progress)}%`;
        });

        // Display results
        displayMonteCarloResults(results);
        btn.innerHTML = 'Run Again';
        btn.disabled = false;

    } catch (error) {
        console.error('Monte Carlo error:', error);
        content.innerHTML = `
            <div style="color: var(--danger);">
                <p><strong>Error running Monte Carlo analysis:</strong></p>
                <p>${error.message}</p>
            </div>
        `;
        btn.innerHTML = 'Run 1000 Iterations';
        btn.disabled = false;
    }
}

/**
 * Display Monte Carlo results
 */
function displayMonteCarloResults(results) {
    const content = document.getElementById('monteCarloContent');
    const dist = results.distributions;

    // Format numbers helper
    const fmt = (n, decimals = 1) => {
        if (Math.abs(n) >= 1000000) return (n / 1000000).toFixed(decimals) + 'M';
        if (Math.abs(n) >= 1000) return (n / 1000).toFixed(decimals) + 'K';
        return n.toFixed(decimals);
    };

    const report = monteCarloInstance.generateReport();

    content.innerHTML = `
        <div style="margin-bottom: 24px;">
            <h4 style="margin-bottom: 12px; color: var(--gray-700);">Probability Distribution Summary</h4>
            <p style="color: var(--gray-500); font-size: 0.875rem; margin-bottom: 16px;">
                Based on ${results.iterations} simulations with randomized parameters
            </p>

            <!-- Key Metrics Grid -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px;">
                <!-- Unemployment -->
                <div style="background: var(--gray-50); padding: 16px; border-radius: 8px;">
                    <div style="font-size: 0.75rem; color: var(--gray-500); text-transform: uppercase; margin-bottom: 4px;">
                        Final Unemployment Rate
                    </div>
                    <div style="font-size: 1.5rem; font-weight: 700; color: var(--gray-900);">
                        ${dist.final_unemployment.median.toFixed(1)}%
                    </div>
                    <div style="font-size: 0.875rem; color: var(--gray-600);">
                        90% CI: ${dist.final_unemployment.p5.toFixed(1)}% - ${dist.final_unemployment.p95.toFixed(1)}%
                    </div>
                    <div style="font-size: 0.75rem; color: var(--warning); margin-top: 4px;">
                        ${(report.unemployment.probability_above_10 * 100).toFixed(0)}% chance above 10%
                    </div>
                </div>

                <!-- Net Job Change -->
                <div style="background: var(--gray-50); padding: 16px; border-radius: 8px;">
                    <div style="font-size: 0.75rem; color: var(--gray-500); text-transform: uppercase; margin-bottom: 4px;">
                        Net Job Change
                    </div>
                    <div style="font-size: 1.5rem; font-weight: 700; color: ${dist.net_job_change.median >= 0 ? 'var(--secondary)' : 'var(--danger)'};">
                        ${dist.net_job_change.median >= 0 ? '+' : ''}${fmt(dist.net_job_change.median)}
                    </div>
                    <div style="font-size: 0.875rem; color: var(--gray-600);">
                        Range: ${fmt(dist.net_job_change.p10)} to ${fmt(dist.net_job_change.p90)}
                    </div>
                    <div style="font-size: 0.75rem; color: var(--secondary); margin-top: 4px;">
                        ${(report.netJobChange.probability_positive * 100).toFixed(0)}% chance positive
                    </div>
                </div>

                <!-- Jobs Displaced -->
                <div style="background: var(--gray-50); padding: 16px; border-radius: 8px;">
                    <div style="font-size: 0.75rem; color: var(--gray-500); text-transform: uppercase; margin-bottom: 4px;">
                        Jobs Displaced
                    </div>
                    <div style="font-size: 1.5rem; font-weight: 700; color: var(--danger);">
                        ${fmt(dist.cumulative_displacement.median)}
                    </div>
                    <div style="font-size: 0.875rem; color: var(--gray-600);">
                        90% CI: ${fmt(dist.cumulative_displacement.p5)} - ${fmt(dist.cumulative_displacement.p95)}
                    </div>
                </div>

                <!-- New Jobs Created -->
                <div style="background: var(--gray-50); padding: 16px; border-radius: 8px;">
                    <div style="font-size: 0.75rem; color: var(--gray-500); text-transform: uppercase; margin-bottom: 4px;">
                        New Jobs Created
                    </div>
                    <div style="font-size: 1.5rem; font-weight: 700; color: var(--secondary);">
                        ${fmt(dist.cumulative_new_jobs.median)}
                    </div>
                    <div style="font-size: 0.875rem; color: var(--gray-600);">
                        90% CI: ${fmt(dist.cumulative_new_jobs.p5)} - ${fmt(dist.cumulative_new_jobs.p95)}
                    </div>
                </div>
            </div>

            <!-- Distribution Charts -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px;">
                <div>
                    <h5 style="margin-bottom: 8px; font-size: 0.875rem; color: var(--gray-700);">
                        Unemployment Distribution
                    </h5>
                    <div class="chart-container small">
                        <canvas id="mcUnemploymentHist"></canvas>
                    </div>
                </div>
                <div>
                    <h5 style="margin-bottom: 8px; font-size: 0.875rem; color: var(--gray-700);">
                        Net Job Change Distribution
                    </h5>
                    <div class="chart-container small">
                        <canvas id="mcJobChangeHist"></canvas>
                    </div>
                </div>
            </div>

            <!-- Confidence Intervals Table -->
            <div style="margin-top: 24px;">
                <h5 style="margin-bottom: 12px; font-size: 0.875rem; color: var(--gray-700);">
                    Confidence Intervals
                </h5>
                <table class="data-table" style="font-size: 0.875rem;">
                    <thead>
                        <tr>
                            <th>Metric</th>
                            <th>5th %ile</th>
                            <th>25th %ile</th>
                            <th>Median</th>
                            <th>75th %ile</th>
                            <th>95th %ile</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Unemployment Rate</td>
                            <td>${dist.final_unemployment.p5.toFixed(1)}%</td>
                            <td>${dist.final_unemployment.p25.toFixed(1)}%</td>
                            <td><strong>${dist.final_unemployment.median.toFixed(1)}%</strong></td>
                            <td>${dist.final_unemployment.p75.toFixed(1)}%</td>
                            <td>${dist.final_unemployment.p95.toFixed(1)}%</td>
                        </tr>
                        <tr>
                            <td>Jobs Displaced</td>
                            <td>${fmt(dist.cumulative_displacement.p5)}</td>
                            <td>${fmt(dist.cumulative_displacement.p25)}</td>
                            <td><strong>${fmt(dist.cumulative_displacement.median)}</strong></td>
                            <td>${fmt(dist.cumulative_displacement.p75)}</td>
                            <td>${fmt(dist.cumulative_displacement.p95)}</td>
                        </tr>
                        <tr>
                            <td>New Jobs Created</td>
                            <td>${fmt(dist.cumulative_new_jobs.p5)}</td>
                            <td>${fmt(dist.cumulative_new_jobs.p25)}</td>
                            <td><strong>${fmt(dist.cumulative_new_jobs.median)}</strong></td>
                            <td>${fmt(dist.cumulative_new_jobs.p75)}</td>
                            <td>${fmt(dist.cumulative_new_jobs.p95)}</td>
                        </tr>
                        <tr>
                            <td>Net Job Change</td>
                            <td>${fmt(dist.net_job_change.p5)}</td>
                            <td>${fmt(dist.net_job_change.p25)}</td>
                            <td><strong>${fmt(dist.net_job_change.median)}</strong></td>
                            <td>${fmt(dist.net_job_change.p75)}</td>
                            <td>${fmt(dist.net_job_change.p95)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    // Create histogram charts
    setTimeout(() => {
        createMonteCarloHistogram('mcUnemploymentHist', dist.final_unemployment, 'Unemployment Rate (%)', 'var(--danger)');
        createMonteCarloHistogram('mcJobChangeHist', dist.net_job_change, 'Net Job Change', 'var(--info)', true);
    }, 100);
}

/**
 * Create histogram chart for Monte Carlo results
 */
function createMonteCarloHistogram(canvasId, distribution, label, color, formatAsJobs = false) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const histogram = distribution.histogram;
    const labels = histogram.map(h => {
        if (formatAsJobs) {
            const val = h.binMid;
            if (Math.abs(val) >= 1000000) return (val / 1000000).toFixed(1) + 'M';
            if (Math.abs(val) >= 1000) return (val / 1000).toFixed(0) + 'K';
            return val.toFixed(0);
        }
        return h.binMid.toFixed(1);
    });

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Frequency',
                data: histogram.map(h => h.frequency * 100),
                backgroundColor: color,
                borderColor: color,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (ctx) => `${ctx.parsed.y.toFixed(1)}% of simulations`
                    }
                }
            },
            scales: {
                x: {
                    title: { display: true, text: label }
                },
                y: {
                    title: { display: true, text: 'Probability (%)' },
                    beginAtZero: true
                }
            }
        }
    });
}

// ==========================================
// Mobile Menu Functions
// ==========================================

/**
 * Open mobile menu
 */
function openMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    if (sidebar) sidebar.classList.add('open');
    if (overlay) overlay.classList.add('active');

    // Prevent body scroll when menu is open
    document.body.style.overflow = 'hidden';
}

/**
 * Close mobile menu
 */
function closeMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');

    // Restore body scroll
    document.body.style.overflow = '';
}

/**
 * Close mobile menu on escape key
 */
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeMobileMenu();
    }
});

// ==========================================
// Simulation History Functions
// ==========================================

/**
 * Show history modal
 */
function showHistoryModal() {
    const modal = document.getElementById('historyModal');
    modal.style.display = 'flex';
    renderHistoryList();
}

/**
 * Hide history modal
 */
function hideHistoryModal() {
    document.getElementById('historyModal').style.display = 'none';
}

/**
 * Render history list in modal
 */
function renderHistoryList() {
    const container = document.getElementById('historyList');
    const history = simulationHistory.getAll();

    if (history.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--text-muted, var(--gray-500));">
                <p style="font-size: 2rem; margin-bottom: 8px;">📭</p>
                <p>No simulation history yet.</p>
                <p style="font-size: 0.875rem;">Run a simulation to start building your history.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = history.map(item => `
        <div class="history-item" style="background: var(--gray-50, #f9fafb); border-radius: 8px; padding: 16px; margin-bottom: 12px; cursor: pointer; transition: all 0.2s; border: 1px solid transparent;"
             onmouseover="this.style.borderColor='var(--primary)'"
             onmouseout="this.style.borderColor='transparent'"
             onclick="loadFromHistory(${item.id})">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                <div>
                    <h4 style="font-size: 1rem; font-weight: 600; color: var(--text-primary, var(--gray-800)); margin-bottom: 4px;">
                        ${item.name}
                    </h4>
                    <span style="font-size: 0.75rem; color: var(--text-muted, var(--gray-500));">
                        ${simulationHistory.formatTimestamp(item.timestamp)}
                    </span>
                </div>
                <button onclick="event.stopPropagation(); deleteFromHistory(${item.id})"
                        style="background: none; border: none; color: var(--danger); cursor: pointer; padding: 4px;"
                        title="Delete this simulation">
                    🗑️
                </button>
            </div>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; font-size: 0.875rem;">
                <div>
                    <div style="color: var(--text-muted, var(--gray-500)); font-size: 0.7rem; text-transform: uppercase;">Timeframe</div>
                    <div style="font-weight: 500; color: var(--text-secondary, var(--gray-700));">${item.summary.timeframe}</div>
                </div>
                <div>
                    <div style="color: var(--text-muted, var(--gray-500)); font-size: 0.7rem; text-transform: uppercase;">Final Unemp.</div>
                    <div style="font-weight: 500; color: var(--danger);">${item.summary.finalUnemployment?.toFixed(1) || 'N/A'}%</div>
                </div>
                <div>
                    <div style="color: var(--text-muted, var(--gray-500)); font-size: 0.7rem; text-transform: uppercase;">Jobs Lost</div>
                    <div style="font-weight: 500; color: var(--danger);">${simulationHistory.formatNumber(item.summary.jobsDisplaced)}</div>
                </div>
                <div>
                    <div style="color: var(--text-muted, var(--gray-500)); font-size: 0.7rem; text-transform: uppercase;">Jobs Created</div>
                    <div style="font-weight: 500; color: var(--secondary);">${simulationHistory.formatNumber(item.summary.jobsCreated)}</div>
                </div>
            </div>
            <div style="margin-top: 8px; font-size: 0.75rem; color: var(--text-muted, var(--gray-500));">
                ${item.summary.adoptionCurve.replace('_', '-')} curve • ${item.summary.aiAdoption}% AI adoption • ${item.summary.interventions} intervention${item.summary.interventions !== 1 ? 's' : ''}
            </div>
        </div>
    `).join('');
}

/**
 * Load simulation from history
 */
function loadFromHistory(id) {
    const item = simulationHistory.get(id);
    if (!item) {
        alert('Simulation not found in history');
        return;
    }

    // Load into current results
    currentResults = {
        scenario: item.scenario,
        results: item.results,
        summary: item.summaryData
    };

    // Update UI controls if possible
    if (item.scenario) {
        const endYear = document.getElementById('endYear');
        const targetUR = document.getElementById('targetUR');
        const aiAdoptionRate = document.getElementById('aiAdoptionRate');
        const automationPace = document.getElementById('automationPace');
        const adoptionCurve = document.getElementById('adoptionCurve');

        if (endYear) endYear.value = item.scenario.timeframe?.end_year || 2030;
        if (targetUR) targetUR.value = item.scenario.targets?.unemployment_rate || 10;
        if (aiAdoptionRate) aiAdoptionRate.value = item.scenario.targets?.ai_adoption_rate || 50;
        if (automationPace) automationPace.value = item.scenario.targets?.automation_pace || 'moderate';
        if (adoptionCurve) adoptionCurve.value = item.scenario.ai_parameters?.adoption_curve || 's_curve';
    }

    // Display results
    displaySimulationResults(currentResults);

    // Show share button
    showShareButton();

    // Switch to simulation tab
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById('simulation-section').classList.add('active');
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-tab')[3].classList.add('active');

    // Hide modal
    hideHistoryModal();
}

/**
 * Delete simulation from history
 */
function deleteFromHistory(id) {
    if (confirm('Delete this simulation from history?')) {
        simulationHistory.delete(id);
        renderHistoryList();
    }
}

/**
 * Clear all history
 */
function clearAllHistory() {
    if (confirm('Clear all simulation history? This cannot be undone.')) {
        simulationHistory.clearAll();
        renderHistoryList();
    }
}

// ==========================================
// Theme Toggle Functions
// ==========================================

/**
 * Toggle between light and dark theme
 */
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    updateThemeIcon(newTheme);
    updateChartTheme(newTheme);
}

/**
 * Update theme icon
 */
function updateThemeIcon(theme) {
    const icon = document.getElementById('themeIcon');
    if (icon) {
        icon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
}

/**
 * Update chart colors for theme
 */
function updateChartTheme(theme) {
    const isDark = theme === 'dark';
    const textColor = isDark ? '#f1f5f9' : '#374151';
    const gridColor = isDark ? '#334155' : '#e5e7eb';

    Chart.defaults.color = textColor;
    Chart.defaults.borderColor = gridColor;

    // Update existing charts if any
    Chart.helpers.each(Chart.instances, (chart) => {
        if (chart.options.scales) {
            Object.keys(chart.options.scales).forEach(scaleKey => {
                if (chart.options.scales[scaleKey].grid) {
                    chart.options.scales[scaleKey].grid.color = gridColor;
                }
                if (chart.options.scales[scaleKey].ticks) {
                    chart.options.scales[scaleKey].ticks.color = textColor;
                }
            });
        }
        if (chart.options.plugins && chart.options.plugins.legend) {
            chart.options.plugins.legend.labels = chart.options.plugins.legend.labels || {};
            chart.options.plugins.legend.labels.color = textColor;
        }
        chart.update();
    });
}

/**
 * Initialize theme from localStorage or system preference
 */
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');

    document.documentElement.setAttribute('data-theme', theme);
    updateThemeIcon(theme);
    updateChartTheme(theme);
}

/**
 * Show a notification toast
 * @param {string} message - The message to show
 * @param {string} type - 'success', 'warning', 'error', or 'info'
 */
function showNotification(message, type = 'info') {
    const colors = {
        success: 'var(--secondary)',
        warning: 'var(--warning)',
        error: 'var(--danger)',
        info: 'var(--primary)'
    };

    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${colors[type] || colors.info};
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        font-weight: 500;
        animation: fadeIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ============================================
// ADVANCED AI SIMULATION FUNCTIONS
// ============================================

// Default password for AI simulation (change this or set via setAIPassword())
const DEFAULT_AI_PASSWORD = 'ai2025';
const AI_USAGE_LIMIT = 1000;
const AI_USAGE_STORAGE_KEY = 'ai_labor_sim_ai_usage_count';
const AI_LIMIT_ALERT_KEY = 'ai_labor_sim_limit_alert_sent';

/**
 * Get current AI simulation usage count
 */
function getAIUsageCount() {
    const count = localStorage.getItem(AI_USAGE_STORAGE_KEY);
    return count ? parseInt(count, 10) : 0;
}

/**
 * Increment AI simulation usage count
 */
function incrementAIUsageCount() {
    const currentCount = getAIUsageCount();
    const newCount = currentCount + 1;
    localStorage.setItem(AI_USAGE_STORAGE_KEY, newCount.toString());
    return newCount;
}

/**
 * Check if usage limit has been reached
 */
function isAIUsageLimitReached() {
    return getAIUsageCount() >= AI_USAGE_LIMIT;
}

/**
 * Send alert when usage limit is reached
 */
async function sendUsageLimitAlert() {
    // Check if alert already sent
    if (localStorage.getItem(AI_LIMIT_ALERT_KEY)) {
        return;
    }

    const usageCount = getAIUsageCount();
    const alertData = {
        event: 'AI_USAGE_LIMIT_REACHED',
        count: usageCount,
        limit: AI_USAGE_LIMIT,
        timestamp: new Date().toISOString(),
        url: window.location.href
    };

    console.log('AI Usage Limit Alert:', alertData);

    // Try to send email notification via webhook
    try {
        // Option 1: If you have a webhook endpoint, send there
        // await fetch('YOUR_WEBHOOK_URL', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(alertData)
        // });

        // Option 2: Use mailto link as fallback alert
        const subject = encodeURIComponent('AI Labor Simulator - Usage Limit Reached');
        const body = encodeURIComponent(
            `AI Usage Limit Alert\n\n` +
            `The AI Labor Market Simulator has reached ${usageCount} uses.\n` +
            `Limit: ${AI_USAGE_LIMIT}\n` +
            `Timestamp: ${alertData.timestamp}\n\n` +
            `Password protection is now enabled.\n` +
            `Default password: ${DEFAULT_AI_PASSWORD}`
        );

        // Show notification to admin
        showNotification(
            `AI usage limit (${AI_USAGE_LIMIT}) reached! Password protection now enabled.`,
            'warning'
        );

        // Mark alert as sent
        localStorage.setItem(AI_LIMIT_ALERT_KEY, 'true');

        // Log for analytics/monitoring
        console.warn(`[ALERT] AI Simulation usage limit reached: ${usageCount}/${AI_USAGE_LIMIT}`);

    } catch (error) {
        console.error('Failed to send usage limit alert:', error);
    }
}

/**
 * Get AI usage stats (for admin/debugging)
 */
function getAIUsageStats() {
    return {
        currentCount: getAIUsageCount(),
        limit: AI_USAGE_LIMIT,
        remaining: Math.max(0, AI_USAGE_LIMIT - getAIUsageCount()),
        limitReached: isAIUsageLimitReached(),
        alertSent: localStorage.getItem(AI_LIMIT_ALERT_KEY) === 'true'
    };
}

/**
 * Reset AI usage counter (admin function)
 * Call from console: resetAIUsageCount()
 */
function resetAIUsageCount() {
    localStorage.removeItem(AI_USAGE_STORAGE_KEY);
    localStorage.removeItem(AI_LIMIT_ALERT_KEY);
    console.log('AI usage counter reset to 0');
    return getAIUsageStats();
}

/**
 * Set AI usage count manually (admin function)
 * Call from console: setAIUsageCount(500)
 */
function setAIUsageCount(count) {
    localStorage.setItem(AI_USAGE_STORAGE_KEY, count.toString());
    console.log(`AI usage counter set to ${count}`);
    return getAIUsageStats();
}

// Expose admin functions globally
window.getAIUsageStats = getAIUsageStats;
window.resetAIUsageCount = resetAIUsageCount;
window.setAIUsageCount = setAIUsageCount;

/**
 * Run Advanced AI-Enhanced Simulation
 */
function runAdvancedAISimulation() {
    // Check if usage limit has been reached
    if (isAIUsageLimitReached()) {
        // Send alert if not already sent
        sendUsageLimitAlert();

        // Password required after limit reached
        if (!aiScenarioEnhancer.hasPassword()) {
            aiScenarioEnhancer.setPassword(DEFAULT_AI_PASSWORD);
        }
        showPasswordModal();
    } else {
        // Under limit - run directly without password
        executeAdvancedAISimulation();
    }
}

/**
 * Show password modal
 */
function showPasswordModal() {
    document.getElementById('passwordModal').style.display = 'flex';
    document.getElementById('aiSimPassword').value = '';
    document.getElementById('passwordError').style.display = 'none';
    document.getElementById('aiSimPassword').focus();
}

/**
 * Hide password modal
 */
function hidePasswordModal() {
    document.getElementById('passwordModal').style.display = 'none';
}

/**
 * Submit password and run AI simulation
 */
async function submitAIPassword() {
    const password = document.getElementById('aiSimPassword').value;

    if (!aiScenarioEnhancer.checkPassword(password)) {
        document.getElementById('passwordError').style.display = 'block';
        return;
    }

    hidePasswordModal();
    await executeAdvancedAISimulation();
}

/**
 * Execute the Advanced AI Simulation pipeline
 */
async function executeAdvancedAISimulation() {
    if (!aiScenarioEnhancer.isAvailable()) {
        alert('AI service not available. Please check your API configuration.');
        return;
    }

    // Show loading state
    const resultsDiv = document.getElementById('simulation-results');
    resultsDiv.innerHTML = `
        <div class="card" style="text-align: center; padding: 60px;">
            <div class="loading-spinner" style="margin-bottom: 20px;">
                <div style="width: 50px; height: 50px; border: 4px solid var(--gray-200); border-top-color: var(--primary); border-radius: 50%; margin: 0 auto; animation: spin 1s linear infinite;"></div>
            </div>
            <h3 style="margin-bottom: 16px;">Running AI-Enhanced Simulation</h3>
            <p style="color: var(--gray-500);" id="aiSimStatus">Step 1/3: Enhancing inputs with AI...</p>
        </div>
    `;

    // Switch to simulation tab so user can see progress
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById('simulation-section').classList.add('active');
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-tab')[3].classList.add('active');

    // Get simple inputs
    const simpleInputs = {
        targetUnemployment: parseFloat(document.getElementById('targetUR').value),
        aiAdoption: parseInt(document.getElementById('aiAdoption').value),
        automationPace: document.getElementById('automationPace').value,
        adoptionCurve: document.getElementById('adoptionCurve').value,
        startYear: new Date().getFullYear(),
        endYear: parseInt(document.getElementById('targetYear').value),
        years: parseInt(document.getElementById('targetYear').value) - new Date().getFullYear(),
        interventions: interventionSystem.interventions.filter(i => i.active)
    };

    try {
        // Step 1: Enhance inputs with AI
        updateAIStatus('Step 1/3: Enhancing inputs with AI...');
        const enhancedParams = await aiScenarioEnhancer.enhanceInputs(simpleInputs);
        console.log('Enhanced params:', enhancedParams);

        // Step 2: Run simulation with enhanced parameters
        updateAIStatus('Step 2/3: Running enhanced simulation...');

        // Create enhanced scenario
        const enhancedScenario = createEnhancedScenario(simpleInputs, enhancedParams);
        simulationEngine.createScenario(enhancedScenario);

        // Run simulation
        const results = await simulationEngine.runSimulation();
        currentResults = results;

        // Step 3: Generate AI analysis
        updateAIStatus('Step 3/3: Generating AI analysis...');
        const analysis = await aiScenarioEnhancer.analyzeResults(simpleInputs, enhancedParams, results);
        console.log('AI Analysis:', analysis);

        // Store the enhanced simulation
        const simId = aiScenarioEnhancer.storeSimulation({
            inputs: simpleInputs,
            enhancedParams,
            results,
            analysis
        });
        console.log('Stored simulation ID:', simId);

        // Store analysis for later viewing BEFORE displaying results
        // This ensures the "View AI Report" button will appear
        currentAIAnalysis = { analysis, enhancedParams, timestamp: new Date().toISOString() };

        // Display results (now the "View AI Report" button will show)
        displaySimulationResults(results);

        // Show AI analysis modal immediately
        displayAIAnalysis(analysis, enhancedParams);

        // Update model status
        updateAIModelStatus();

        // Increment usage counter
        const usageCount = incrementAIUsageCount();
        console.log(`AI Simulation usage: ${usageCount}/${AI_USAGE_LIMIT}`);

        // Check if we just hit the limit
        if (usageCount === AI_USAGE_LIMIT) {
            sendUsageLimitAlert();
        }

        showNotification('AI-enhanced simulation complete!', 'success');

    } catch (error) {
        console.error('AI Simulation error:', error);
        resultsDiv.innerHTML = `
            <div class="card" style="text-align: center; padding: 60px;">
                <h3 style="margin-bottom: 16px; color: var(--danger);">AI Simulation Failed</h3>
                <p style="color: var(--gray-500); margin-bottom: 24px;">${error.message}</p>
                <button class="btn btn-primary" onclick="runSimulation()">Run Standard Simulation</button>
            </div>
        `;
    }
}

/**
 * Update AI simulation status message
 */
function updateAIStatus(message) {
    const statusEl = document.getElementById('aiSimStatus');
    if (statusEl) {
        statusEl.textContent = message;
    }
}

/**
 * Create enhanced scenario from AI parameters
 */
function createEnhancedScenario(simpleInputs, enhancedParams) {
    const scenario = {
        name: document.getElementById('scenarioName').value + ' (AI Enhanced)',
        end_year: simpleInputs.endYear,
        target_unemployment: simpleInputs.targetUnemployment,
        ai_adoption_rate: simpleInputs.aiAdoption,
        automation_pace: simpleInputs.automationPace,
        adoption_curve: simpleInputs.adoptionCurve,

        // Enhanced parameters from AI
        ai_enhanced: true,
        enhanced_params: enhancedParams,

        // Apply AI-derived multipliers
        new_job_multiplier: enhancedParams.job_creation_coefficients?.base_multiplier || 0.3,
        displacement_lag: enhancedParams.transition_dynamics?.displacement_lag_months || 6
    };

    return scenario;
}

/**
 * Display AI Analysis in modal
 */
function displayAIAnalysis(analysis, enhancedParams) {
    // Store for later viewing
    currentAIAnalysis = { analysis, enhancedParams, timestamp: new Date().toISOString() };

    const modal = document.getElementById('aiResultsModal');
    const content = document.getElementById('aiResultsContent');

    content.innerHTML = `
        <div class="ai-analysis">
            <!-- Executive Summary -->
            <div class="analysis-section" style="margin-bottom: 24px;">
                <h4 style="color: var(--primary); margin-bottom: 12px;">Executive Summary</h4>
                <p style="font-size: 1rem; line-height: 1.6;">${analysis.executive_summary || 'Analysis in progress...'}</p>
            </div>

            <!-- Key Findings -->
            <div class="analysis-section" style="margin-bottom: 24px;">
                <h4 style="color: var(--primary); margin-bottom: 12px;">Key Findings</h4>
                <div style="display: grid; gap: 12px;">
                    ${(analysis.key_findings || []).map(f => `
                        <div style="display: flex; gap: 12px; padding: 12px; background: var(--gray-50); border-radius: 8px; border-left: 4px solid ${f.impact === 'high' ? 'var(--danger)' : f.impact === 'medium' ? 'var(--warning)' : 'var(--secondary)'};">
                            <div style="flex: 1;">
                                <p style="margin: 0; font-weight: 500;">${f.finding}</p>
                                <div style="display: flex; gap: 12px; margin-top: 8px; font-size: 0.75rem;">
                                    <span style="color: var(--gray-500);">Confidence: <strong>${f.confidence}</strong></span>
                                    <span style="color: var(--gray-500);">Impact: <strong>${f.impact}</strong></span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Workforce Impacts -->
            <div class="analysis-section" style="margin-bottom: 24px;">
                <h4 style="color: var(--primary); margin-bottom: 12px;">Workforce Impacts</h4>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
                    <div style="padding: 16px; background: var(--gray-50); border-radius: 8px;">
                        <h5 style="color: var(--danger); font-size: 0.875rem; margin-bottom: 8px;">High Risk Workers</h5>
                        <p style="margin: 0; font-size: 0.875rem;">${analysis.workforce_impacts?.high_risk_workers || 'N/A'}</p>
                    </div>
                    <div style="padding: 16px; background: var(--gray-50); border-radius: 8px;">
                        <h5 style="color: var(--secondary); font-size: 0.875rem; margin-bottom: 8px;">Emerging Opportunities</h5>
                        <p style="margin: 0; font-size: 0.875rem;">${analysis.workforce_impacts?.emerging_opportunities || 'N/A'}</p>
                    </div>
                </div>
                ${analysis.workforce_impacts?.skills_in_demand ? `
                    <div style="margin-top: 16px;">
                        <h5 style="font-size: 0.875rem; margin-bottom: 8px;">Skills in Demand</h5>
                        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                            ${analysis.workforce_impacts.skills_in_demand.map(s => `<span style="padding: 4px 12px; background: var(--secondary); color: white; border-radius: 16px; font-size: 0.75rem;">${s}</span>`).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>

            <!-- Policy Recommendations -->
            <div class="analysis-section" style="margin-bottom: 24px;">
                <h4 style="color: var(--primary); margin-bottom: 12px;">Policy Recommendations</h4>
                <div style="display: grid; gap: 12px;">
                    ${(analysis.policy_recommendations || []).map(p => `
                        <div style="display: flex; gap: 12px; padding: 12px; background: var(--gray-50); border-radius: 8px;">
                            <div style="width: 80px; text-align: center;">
                                <span style="display: inline-block; padding: 4px 8px; background: ${p.priority === 'immediate' ? 'var(--danger)' : p.priority === 'short-term' ? 'var(--warning)' : 'var(--primary)'}; color: white; border-radius: 4px; font-size: 0.625rem; text-transform: uppercase;">${p.priority}</span>
                            </div>
                            <div style="flex: 1;">
                                <p style="margin: 0;">${p.policy}</p>
                                <span style="font-size: 0.75rem; color: var(--gray-500);">Effectiveness: ${p.effectiveness}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Scenario Variations -->
            <div class="analysis-section" style="margin-bottom: 24px;">
                <h4 style="color: var(--primary); margin-bottom: 12px;">Scenario Variations</h4>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
                    <div style="padding: 16px; background: #ecfdf5; border-radius: 8px; border-left: 4px solid var(--secondary);">
                        <h5 style="color: var(--secondary); font-size: 0.75rem; text-transform: uppercase; margin-bottom: 8px;">Optimistic</h5>
                        <p style="margin: 0; font-size: 0.875rem;">${analysis.scenario_variations?.optimistic_case || 'N/A'}</p>
                    </div>
                    <div style="padding: 16px; background: #fef3c7; border-radius: 8px; border-left: 4px solid var(--warning);">
                        <h5 style="color: var(--warning); font-size: 0.75rem; text-transform: uppercase; margin-bottom: 8px;">Most Likely</h5>
                        <p style="margin: 0; font-size: 0.875rem;">${analysis.scenario_variations?.most_likely || 'N/A'}</p>
                    </div>
                    <div style="padding: 16px; background: #fef2f2; border-radius: 8px; border-left: 4px solid var(--danger);">
                        <h5 style="color: var(--danger); font-size: 0.75rem; text-transform: uppercase; margin-bottom: 8px;">Pessimistic</h5>
                        <p style="margin: 0; font-size: 0.875rem;">${analysis.scenario_variations?.pessimistic_case || 'N/A'}</p>
                    </div>
                </div>
            </div>

            <!-- Narrative Analysis -->
            ${analysis.narrative_analysis ? `
                <div class="analysis-section" style="margin-bottom: 24px;">
                    <h4 style="color: var(--primary); margin-bottom: 12px;">Detailed Analysis</h4>
                    <div style="padding: 20px; background: var(--gray-50); border-radius: 8px; line-height: 1.8;">
                        ${analysis.narrative_analysis.split('\n').map(p => `<p style="margin-bottom: 12px;">${p}</p>`).join('')}
                    </div>
                </div>
            ` : ''}

            <!-- Model Confidence -->
            <div class="analysis-section">
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: var(--gray-100); border-radius: 8px;">
                    <span style="font-weight: 500;">Model Confidence</span>
                    <span style="padding: 6px 16px; background: ${analysis.model_confidence?.overall === 'high' ? 'var(--secondary)' : analysis.model_confidence?.overall === 'medium' ? 'var(--warning)' : 'var(--danger)'}; color: white; border-radius: 16px; font-weight: bold; text-transform: uppercase;">${analysis.model_confidence?.overall || 'Unknown'}</span>
                </div>
            </div>
        </div>
    `;

    modal.style.display = 'flex';
}

/**
 * Hide AI Results Modal
 */
function hideAIResultsModal() {
    document.getElementById('aiResultsModal').style.display = 'none';
}

/**
 * Show stored AI Analysis (re-view after closing)
 */
function showAIAnalysis() {
    if (!currentAIAnalysis) {
        showNotification('No AI analysis available. Run an Advanced AI Simulation first.', 'warning');
        return;
    }
    displayAIAnalysis(currentAIAnalysis.analysis, currentAIAnalysis.enhancedParams);
}

/**
 * Check if AI analysis is available
 */
function hasAIAnalysis() {
    return currentAIAnalysis !== null;
}

/**
 * Show Training Modal
 */
function showTrainingModal() {
    const modal = document.getElementById('trainingModal');
    updateTrainingModalStatus();
    modal.style.display = 'flex';
}

/**
 * Hide Training Modal
 */
function hideTrainingModal() {
    document.getElementById('trainingModal').style.display = 'none';
}

/**
 * Update Training Modal Status
 */
function updateTrainingModalStatus() {
    const status = modelTrainer.getStatus();

    document.getElementById('trainSimCount').textContent = status.storedSimulations;
    document.getElementById('trainModelVersion').textContent = status.modelVersion;
    document.getElementById('trainConfidence').textContent = status.confidence ? (status.confidence * 100).toFixed(0) + '%' : '-';

    const trainBtn = document.getElementById('trainModelBtn');
    const messageDiv = document.getElementById('trainingMessage');

    if (status.readyForTraining) {
        trainBtn.disabled = false;
        messageDiv.innerHTML = `<span style="color: var(--secondary);">Ready to train!</span> ${status.storedSimulations} AI simulations available.`;
    } else {
        trainBtn.disabled = true;
        messageDiv.innerHTML = `Run at least 3 AI-enhanced simulations to enable model training. Currently: ${status.storedSimulations}`;
    }

    if (status.hasTrainedModel) {
        messageDiv.innerHTML += `<br><small style="color: var(--gray-500);">Last trained: ${new Date(status.lastTraining).toLocaleDateString()}</small>`;
    }
}

/**
 * Train Model
 */
async function trainModel() {
    const trainBtn = document.getElementById('trainModelBtn');
    const messageDiv = document.getElementById('trainingMessage');

    trainBtn.disabled = true;
    trainBtn.textContent = 'Training...';
    messageDiv.innerHTML = '<span style="color: var(--primary);">Training model with AI... This may take a minute.</span>';

    try {
        const result = await modelTrainer.trainModel();

        if (result.success) {
            messageDiv.innerHTML = `<span style="color: var(--secondary);">Training complete!</span> Model v${result.model.model_version} with ${(result.model.confidence_score * 100).toFixed(0)}% confidence.`;
            updateTrainingModalStatus();
            updateAIModelStatus();
            showNotification('Model trained successfully!', 'success');
        } else {
            messageDiv.innerHTML = `<span style="color: var(--danger);">Training failed:</span> ${result.message}`;
        }
    } catch (error) {
        messageDiv.innerHTML = `<span style="color: var(--danger);">Error:</span> ${error.message}`;
    }

    trainBtn.disabled = false;
    trainBtn.textContent = 'Train Model';
}

/**
 * Export Training Data
 */
function exportTrainingData() {
    const data = modelTrainer.exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-labor-sim-training-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Training data exported!', 'success');
}

/**
 * Update AI Model Status in sidebar
 */
function updateAIModelStatus() {
    const statusDiv = document.getElementById('aiModelStatus');
    if (!statusDiv) return;

    const status = modelTrainer.getStatus();

    statusDiv.innerHTML = `
        <div style="font-size: 0.75rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span style="color: var(--gray-400);">Simulations:</span>
                <span style="color: var(--text-primary); font-weight: 500;">${status.storedSimulations}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span style="color: var(--gray-400);">Model:</span>
                <span style="color: var(--text-primary); font-weight: 500;">${status.modelVersion}</span>
            </div>
            ${status.hasTrainedModel ? `
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: var(--gray-400);">Confidence:</span>
                    <span style="color: ${status.confidence > 0.7 ? 'var(--secondary)' : status.confidence > 0.4 ? 'var(--warning)' : 'var(--danger)'}; font-weight: 500;">${(status.confidence * 100).toFixed(0)}%</span>
                </div>
            ` : ''}
        </div>
    `;
}

/**
 * Set AI simulation password (admin function)
 */
function setAIPassword(newPassword) {
    aiScenarioEnhancer.setPassword(newPassword);
    console.log('AI simulation password updated');
}

// Add keyboard listener for password modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && document.getElementById('passwordModal').style.display === 'flex') {
        submitAIPassword();
    }
    if (e.key === 'Escape') {
        hidePasswordModal();
        hideTrainingModal();
        hideAIResultsModal();
    }
});

// Initialize AI model status on load
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(updateAIModelStatus, 500);
});

// Initialize theme early (before DOMContentLoaded to prevent flash)
initTheme();

// Initialize on page load
document.addEventListener('DOMContentLoaded', initApp);
