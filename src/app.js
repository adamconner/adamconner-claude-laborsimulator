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

    resultsDiv.innerHTML = `
        <div class="fade-in">
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
 * Export results
 */
function exportResults() {
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
 * Reset simulation
 */
function resetSimulation() {
    currentResults = null;
    interventionSystem.interventions = [];

    // Reset form values
    document.getElementById('scenarioName').value = 'My Scenario';
    document.getElementById('targetYear').value = '2029';
    document.getElementById('targetUR').value = 10;
    document.getElementById('urValue').textContent = '10.0';
    document.getElementById('aiAdoption').value = 70;
    document.getElementById('aiValue').textContent = '70';
    document.getElementById('automationPace').value = 'moderate';
    document.getElementById('adoptionCurve').value = 's_curve';

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

// Initialize on page load
document.addEventListener('DOMContentLoaded', initApp);
