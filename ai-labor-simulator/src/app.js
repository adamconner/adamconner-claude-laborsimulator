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

    // Switch to simulation tab
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById('simulation-section').classList.add('active');
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-tab')[2].classList.add('active');

    try {
        // Create and run scenario
        const scenario = simulationEngine.createScenario(config);

        // Add active interventions
        scenario.interventions = interventionSystem.interventions.filter(i => i.active);

        const results = await simulationEngine.runSimulation();
        currentResults = results;

        // Display results
        displaySimulationResults(results);
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

/**
 * Display simulation results
 */
function displaySimulationResults(results) {
    const resultsDiv = document.getElementById('simulation-results');
    const summary = results.summary;

    // Check if AI summary is available
    const hasApiKey = typeof aiSummaryService !== 'undefined' && aiSummaryService.hasApiKey();

    // Comparison button state
    const comparisonAvailable = typeof scenarioComparison !== 'undefined';
    const canAddToComparison = comparisonAvailable && scenarioComparison.canAddMore();
    const comparisonCount = comparisonAvailable ? scenarioComparison.getCount() : 0;

    const comparisonButton = comparisonAvailable ? `
        <button id="addToComparisonBtn" class="btn btn-success" onclick="addToComparison()" ${!canAddToComparison ? 'disabled' : ''}>
            ${canAddToComparison ? `Add to Comparison (${comparisonCount}/3)` : 'Comparison Full (3/3)'}
        </button>
    ` : '';

    const aiSummarySection = `
        <div class="card" id="aiSummaryCard" style="margin-bottom: 24px; border-left: 4px solid var(--primary);">
            <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
                <h3 style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 1.25rem;">&#129302;</span> AI Analysis
                </h3>
                <div style="display: flex; gap: 8px;">
                    ${comparisonButton}
                    ${hasApiKey ? `
                        <button class="btn btn-sm btn-outline" onclick="regenerateAISummary()" id="regenerateBtn">
                            Regenerate
                        </button>
                    ` : ''}
                </div>
            </div>
            <div id="aiSummaryContent" style="line-height: 1.7;">
                ${hasApiKey ? `
                    <div style="display: flex; align-items: center; gap: 12px; color: var(--gray-500);">
                        <div class="spinner" style="width: 20px; height: 20px; border-width: 2px;"></div>
                        <span>Generating AI analysis...</span>
                    </div>
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

    // Generate AI summary if API key is configured
    if (typeof aiSummaryService !== 'undefined' && aiSummaryService.hasApiKey()) {
        generateAISummary(results);
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
        container.innerHTML = '<p style="font-size: 0.875rem; color: var(--gray-400);">No interventions added</p>';
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
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 0.75rem; color: var(--gray-400);">${intervention.category.replace('_', ' ')}</span>
                    <button class="btn btn-sm" style="padding: 4px 8px; background: var(--gray-600);"
                            onclick="removeIntervention('${intervention.id}')">Remove</button>
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

    // Switch to simulation tab
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById('simulation-section').classList.add('active');
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-tab')[2].classList.add('active');

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
            <div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--gray-200); font-size: 0.75rem; color: var(--gray-400);">
                Generated by Google Gemini AI &bull; Analysis based on simulation parameters and results
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

// Initialize on page load
document.addEventListener('DOMContentLoaded', initApp);
