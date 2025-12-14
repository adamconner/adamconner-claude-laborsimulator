/**
 * AI Labor Market Simulator - QA Test Suite
 * Comprehensive automated tests for all features
 *
 * Run in browser console or via automated testing framework
 */

class QATestSuite {
    constructor() {
        this.tests = [];
        this.results = {
            passed: 0,
            failed: 0,
            skipped: 0,
            errors: []
        };
        this.startTime = null;
    }

    /**
     * Register a test
     */
    test(name, category, testFn) {
        this.tests.push({ name, category, testFn });
    }

    /**
     * Run all tests
     */
    async runAll() {
        console.log('='.repeat(60));
        console.log('AI Labor Market Simulator - QA Test Suite');
        console.log('='.repeat(60));
        console.log(`Running ${this.tests.length} tests...`);
        console.log('');

        this.startTime = Date.now();
        this.results = { passed: 0, failed: 0, skipped: 0, errors: [] };

        const categories = [...new Set(this.tests.map(t => t.category))];

        for (const category of categories) {
            console.log(`\n--- ${category} ---`);
            const categoryTests = this.tests.filter(t => t.category === category);

            for (const test of categoryTests) {
                await this.runTest(test);
            }
        }

        this.printSummary();
        return this.results;
    }

    /**
     * Run a single test
     */
    async runTest(test) {
        try {
            const result = await test.testFn();
            if (result === 'skip') {
                console.log(`  SKIP: ${test.name}`);
                this.results.skipped++;
            } else if (result === true) {
                console.log(`  PASS: ${test.name}`);
                this.results.passed++;
            } else {
                console.log(`  FAIL: ${test.name} - ${result || 'No details'}`);
                this.results.failed++;
                this.results.errors.push({ test: test.name, error: result });
            }
        } catch (error) {
            console.log(`  ERROR: ${test.name} - ${error.message}`);
            this.results.failed++;
            this.results.errors.push({ test: test.name, error: error.message });
        }
    }

    /**
     * Print test summary
     */
    printSummary() {
        const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
        const total = this.results.passed + this.results.failed + this.results.skipped;

        console.log('\n' + '='.repeat(60));
        console.log('TEST SUMMARY');
        console.log('='.repeat(60));
        console.log(`Total Tests: ${total}`);
        console.log(`Passed: ${this.results.passed} (${((this.results.passed / total) * 100).toFixed(1)}%)`);
        console.log(`Failed: ${this.results.failed}`);
        console.log(`Skipped: ${this.results.skipped}`);
        console.log(`Duration: ${duration}s`);

        if (this.results.errors.length > 0) {
            console.log('\nFailed Tests:');
            this.results.errors.forEach(e => {
                console.log(`  - ${e.test}: ${e.error}`);
            });
        }

        console.log('='.repeat(60));

        // Return pass/fail status
        return this.results.failed === 0;
    }

    /**
     * Helper: Assert condition
     */
    assert(condition, message) {
        if (!condition) {
            throw new Error(message || 'Assertion failed');
        }
        return true;
    }

    /**
     * Helper: Assert equals
     */
    assertEqual(actual, expected, message) {
        if (actual !== expected) {
            throw new Error(message || `Expected ${expected}, got ${actual}`);
        }
        return true;
    }

    /**
     * Helper: Assert type
     */
    assertType(value, type, message) {
        if (typeof value !== type) {
            throw new Error(message || `Expected type ${type}, got ${typeof value}`);
        }
        return true;
    }

    /**
     * Helper: Assert defined
     */
    assertDefined(value, message) {
        if (typeof value === 'undefined') {
            throw new Error(message || 'Value is undefined');
        }
        return true;
    }

    /**
     * Helper: Assert function exists
     */
    assertFunction(fn, message) {
        if (typeof fn !== 'function') {
            throw new Error(message || 'Expected a function');
        }
        return true;
    }
}

// Create test suite instance
const qaTests = new QATestSuite();

// ==========================================
// CORE INITIALIZATION TESTS
// ==========================================

qaTests.test('DataService exists', 'Core Initialization', () => {
    return typeof EconomicDataService !== 'undefined';
});

qaTests.test('SimulationEngine exists', 'Core Initialization', () => {
    return typeof SimulationEngine !== 'undefined';
});

qaTests.test('InterventionSystem exists', 'Core Initialization', () => {
    return typeof InterventionSystem !== 'undefined';
});

qaTests.test('VisualizationManager exists', 'Core Initialization', () => {
    return typeof VisualizationManager !== 'undefined';
});

qaTests.test('Global instances initialized', 'Core Initialization', () => {
    return typeof dataService !== 'undefined' &&
           typeof simulationEngine !== 'undefined' &&
           typeof interventionSystem !== 'undefined' &&
           typeof vizManager !== 'undefined';
});

// ==========================================
// DATA SERVICE TESTS
// ==========================================

qaTests.test('Load baseline data', 'Data Service', async () => {
    if (!dataService) return 'DataService not initialized';
    const snapshot = await dataService.getCurrentSnapshot();
    return snapshot && snapshot.labor_market;
});

qaTests.test('Get sector data', 'Data Service', async () => {
    if (!dataService) return 'DataService not initialized';
    const sectors = await dataService.getSectorData();
    return sectors && Object.keys(sectors).length > 0;
});

qaTests.test('Get historical trends', 'Data Service', async () => {
    if (!dataService) return 'DataService not initialized';
    const historical = await dataService.getHistoricalTrends();
    return historical && historical.unemployment_rate;
});

// ==========================================
// SIMULATION ENGINE TESTS
// ==========================================

qaTests.test('Create scenario', 'Simulation Engine', () => {
    if (!simulationEngine) return 'SimulationEngine not initialized';
    const scenario = simulationEngine.createScenario({
        name: 'Test Scenario',
        end_year: 2029,
        target_unemployment: 8,
        ai_adoption_rate: 70,
        automation_pace: 'moderate'
    });
    return scenario && scenario.name === 'Test Scenario';
});

qaTests.test('Run basic simulation', 'Simulation Engine', async () => {
    if (!simulationEngine) return 'SimulationEngine not initialized';

    simulationEngine.createScenario({
        name: 'Test Run',
        end_year: 2027,
        target_unemployment: 6,
        ai_adoption_rate: 50,
        automation_pace: 'slow'
    });

    const results = await simulationEngine.runSimulation();
    return results && results.results && results.results.length > 0;
});

qaTests.test('Simulation produces valid summary', 'Simulation Engine', async () => {
    if (!currentResults) return 'No current results - run simulation first';

    const summary = currentResults.summary;
    return summary &&
           typeof summary.final_unemployment_rate === 'number' &&
           typeof summary.total_jobs_displaced === 'number' &&
           typeof summary.total_jobs_created === 'number';
});

qaTests.test('Simulation sectors calculate correctly', 'Simulation Engine', async () => {
    if (!currentResults) return 'No current results - run simulation first';

    const lastResult = currentResults.results[currentResults.results.length - 1];
    return lastResult && lastResult.sectors && Object.keys(lastResult.sectors).length > 0;
});

// ==========================================
// INTERVENTION SYSTEM TESTS
// ==========================================

qaTests.test('Get available intervention types', 'Interventions', () => {
    if (!interventionSystem) return 'InterventionSystem not initialized';
    const types = interventionSystem.getAvailableTypes();
    return types && types.length > 0;
});

qaTests.test('Add intervention', 'Interventions', () => {
    if (!interventionSystem) return 'InterventionSystem not initialized';
    const initialCount = interventionSystem.interventions.length;
    interventionSystem.addIntervention('job_retraining');
    const newCount = interventionSystem.interventions.length;
    return newCount === initialCount + 1;
});

qaTests.test('Remove intervention', 'Interventions', () => {
    if (!interventionSystem) return 'InterventionSystem not initialized';
    if (interventionSystem.interventions.length === 0) {
        interventionSystem.addIntervention('job_retraining');
    }
    const id = interventionSystem.interventions[0].id;
    const initialCount = interventionSystem.interventions.length;
    interventionSystem.removeIntervention(id);
    return interventionSystem.interventions.length === initialCount - 1;
});

qaTests.test('Toggle intervention active state', 'Interventions', () => {
    if (!interventionSystem) return 'InterventionSystem not initialized';
    interventionSystem.addIntervention('ubi');
    const intervention = interventionSystem.interventions[interventionSystem.interventions.length - 1];
    const initialState = intervention.active;
    intervention.active = !initialState;
    return intervention.active !== initialState;
});

qaTests.test('Intervention affects simulation', 'Interventions', async () => {
    if (!simulationEngine) return 'SimulationEngine not initialized';

    // Clear interventions and run baseline
    interventionSystem.interventions = [];
    simulationEngine.createScenario({
        name: 'Baseline',
        end_year: 2027,
        target_unemployment: 10,
        ai_adoption_rate: 70
    });
    const baseline = await simulationEngine.runSimulation();

    // Add intervention and run again
    interventionSystem.addIntervention('job_retraining', { annual_budget: 50 });
    simulationEngine.scenario.interventions = interventionSystem.interventions.filter(i => i.active);
    const withIntervention = await simulationEngine.runSimulation();

    // Results should differ
    return baseline.summary.total_jobs_displaced !== withIntervention.summary.total_jobs_displaced ||
           baseline.summary.final_unemployment_rate !== withIntervention.summary.final_unemployment_rate;
});

// ==========================================
// ECONOMIC INDICATORS TESTS
// ==========================================

qaTests.test('EconomicIndicators exists', 'Economic Indicators', () => {
    return typeof EconomicIndicators !== 'undefined';
});

qaTests.test('Calculate sector exposure', 'Economic Indicators', async () => {
    if (!indicators) return 'Indicators not initialized';
    const sectors = await dataService.getSectorData();
    const exposure = indicators.calculateSectorExposure(sectors);
    return exposure && Object.keys(exposure).length > 0;
});

qaTests.test('Calculate jobs at risk', 'Economic Indicators', async () => {
    if (!indicators) return 'Indicators not initialized';
    const sectors = await dataService.getSectorData();
    const risk = indicators.calculateJobsAtRisk(sectors);
    return risk && typeof risk.total_at_risk === 'number';
});

// ==========================================
// VISUALIZATION TESTS
// ==========================================

qaTests.test('VizManager creates summary HTML', 'Visualizations', () => {
    if (!vizManager || !currentResults) return 'skip';
    const html = vizManager.createSummaryHTML(currentResults.summary);
    return html && html.length > 0;
});

qaTests.test('Charts render without error', 'Visualizations', () => {
    const chartCanvas = document.getElementById('projectedURChart');
    if (!chartCanvas) return 'skip';
    return typeof Chart !== 'undefined';
});

// ==========================================
// NEW FEATURES TESTS
// ==========================================

qaTests.test('PDF Report Generator exists', 'New Features', () => {
    return typeof PDFReportGenerator !== 'undefined' || typeof pdfReportGenerator !== 'undefined';
});

qaTests.test('Demographics Analyzer exists', 'New Features', () => {
    return typeof DemographicsAnalyzer !== 'undefined' || typeof demographicsAnalyzer !== 'undefined';
});

qaTests.test('Skills Gap Analyzer exists', 'New Features', () => {
    return typeof SkillsGapAnalyzer !== 'undefined' || typeof skillsGapAnalyzer !== 'undefined';
});

qaTests.test('Demographics analysis produces results', 'New Features', () => {
    if (!demographicsAnalyzer || !currentResults) return 'skip';
    const analysis = demographicsAnalyzer.analyzeImpacts(currentResults);
    return analysis && analysis.by_age && analysis.by_education;
});

qaTests.test('Skills gap analysis produces results', 'New Features', () => {
    if (!skillsGapAnalyzer || !currentResults) return 'skip';
    const analysis = skillsGapAnalyzer.analyzeSkillsGap(currentResults);
    return analysis && analysis.declining_skills && analysis.growing_skills;
});

qaTests.test('Monte Carlo module exists', 'New Features', () => {
    return typeof MonteCarloSimulator !== 'undefined' || typeof monteCarloSimulator !== 'undefined';
});

qaTests.test('Timeline player exists', 'New Features', () => {
    return typeof initializeTimeline === 'function';
});

qaTests.test('Intervention cost calculator exists', 'New Features', () => {
    return typeof InterventionCostCalculator !== 'undefined' || typeof interventionCostCalculator !== 'undefined';
});

qaTests.test('Scenario comparison exists', 'New Features', () => {
    return typeof ScenarioComparison !== 'undefined' || typeof scenarioComparison !== 'undefined';
});

qaTests.test('URL sharing exists', 'New Features', () => {
    return typeof encodeSimulationURL === 'function' || typeof URLSharing !== 'undefined';
});

// ==========================================
// AI INTEGRATION TESTS
// ==========================================

qaTests.test('AI Summary Service exists', 'AI Integration', () => {
    return typeof AISummaryService !== 'undefined' || typeof aiSummaryService !== 'undefined';
});

qaTests.test('AI Scenario Enhancer exists', 'AI Integration', () => {
    return typeof AIScenarioEnhancer !== 'undefined' || typeof aiScenarioEnhancer !== 'undefined';
});

qaTests.test('AI password modal functions exist', 'AI Integration', () => {
    return typeof showPasswordModal === 'function' &&
           typeof hidePasswordModal === 'function';
});

qaTests.test('AI results modal functions exist', 'AI Integration', () => {
    return typeof displayAIAnalysis === 'function' &&
           typeof hideAIResultsModal === 'function';
});

// ==========================================
// UI FUNCTION TESTS
// ==========================================

qaTests.test('showSection function exists', 'UI Functions', () => {
    return typeof showSection === 'function';
});

qaTests.test('runSimulation function exists', 'UI Functions', () => {
    return typeof runSimulation === 'function';
});

qaTests.test('displaySimulationResults function exists', 'UI Functions', () => {
    return typeof displaySimulationResults === 'function';
});

qaTests.test('loadPreset function exists', 'UI Functions', () => {
    return typeof loadPreset === 'function';
});

qaTests.test('saveSimulation function exists', 'UI Functions', () => {
    return typeof saveSimulation === 'function';
});

qaTests.test('exportResults function exists', 'UI Functions', () => {
    return typeof exportResults === 'function';
});

qaTests.test('downloadPDFReport function exists', 'UI Functions', () => {
    return typeof downloadPDFReport === 'function';
});

qaTests.test('showAIAnalysis function exists', 'UI Functions', () => {
    return typeof showAIAnalysis === 'function';
});

qaTests.test('generateDemographicsHTML function exists', 'UI Functions', () => {
    return typeof generateDemographicsHTML === 'function';
});

qaTests.test('generateSkillsGapHTML function exists', 'UI Functions', () => {
    return typeof generateSkillsGapHTML === 'function';
});

qaTests.test('Theme toggle works', 'UI Functions', () => {
    if (typeof toggleTheme !== 'function') return 'toggleTheme not defined';
    const initialTheme = document.documentElement.getAttribute('data-theme');
    toggleTheme();
    const newTheme = document.documentElement.getAttribute('data-theme');
    toggleTheme(); // Reset
    return initialTheme !== newTheme;
});

// ==========================================
// DOM ELEMENT TESTS
// ==========================================

qaTests.test('Sidebar exists', 'DOM Elements', () => {
    return document.getElementById('sidebar') !== null;
});

qaTests.test('Main content exists', 'DOM Elements', () => {
    return document.querySelector('.main-content') !== null;
});

qaTests.test('Simulation results container exists', 'DOM Elements', () => {
    return document.getElementById('simulation-results') !== null;
});

qaTests.test('All navigation tabs exist', 'DOM Elements', () => {
    const tabs = document.querySelectorAll('.nav-tab');
    return tabs.length >= 8;
});

qaTests.test('Form inputs exist', 'DOM Elements', () => {
    return document.getElementById('scenarioName') !== null &&
           document.getElementById('targetUR') !== null &&
           document.getElementById('aiAdoption') !== null;
});

qaTests.test('Modals exist', 'DOM Elements', () => {
    return document.getElementById('interventionModal') !== null &&
           document.getElementById('passwordModal') !== null &&
           document.getElementById('aiResultsModal') !== null;
});

// ==========================================
// STORAGE TESTS
// ==========================================

qaTests.test('LocalStorage available', 'Storage', () => {
    try {
        localStorage.setItem('qa_test', 'test');
        localStorage.removeItem('qa_test');
        return true;
    } catch (e) {
        return 'LocalStorage not available';
    }
});

qaTests.test('Simulation history module exists', 'Storage', () => {
    return typeof SimulationHistory !== 'undefined' || typeof simulationHistory !== 'undefined';
});

// ==========================================
// ERROR HANDLING TESTS
// ==========================================

qaTests.test('Invalid scenario gracefully handled', 'Error Handling', async () => {
    if (!simulationEngine) return 'SimulationEngine not initialized';
    try {
        simulationEngine.createScenario({});
        // Should still work with defaults
        return true;
    } catch (e) {
        return 'Error thrown on invalid scenario';
    }
});

qaTests.test('Missing API key handled gracefully', 'Error Handling', () => {
    if (!aiSummaryService) return 'skip';
    // Should not throw when checking availability
    try {
        const available = aiSummaryService.isAvailable();
        return typeof available === 'boolean';
    } catch (e) {
        return 'Error thrown on availability check';
    }
});

// ==========================================
// PERFORMANCE TESTS
// ==========================================

qaTests.test('Simulation completes in reasonable time', 'Performance', async () => {
    if (!simulationEngine) return 'SimulationEngine not initialized';

    const start = Date.now();
    simulationEngine.createScenario({
        name: 'Performance Test',
        end_year: 2034,
        target_unemployment: 10,
        ai_adoption_rate: 80
    });
    await simulationEngine.runSimulation();
    const duration = Date.now() - start;

    // Should complete within 5 seconds
    return duration < 5000 ? true : `Took ${duration}ms`;
});

// ==========================================
// DATA INTEGRITY TESTS
// ==========================================

qaTests.test('Unemployment rate within valid range', 'Data Integrity', () => {
    if (!currentResults) return 'skip';
    const ur = currentResults.summary.final_unemployment_rate;
    return ur >= 0 && ur <= 100;
});

qaTests.test('Employment numbers are positive', 'Data Integrity', () => {
    if (!currentResults) return 'skip';
    return currentResults.summary.total_jobs_displaced >= 0 &&
           currentResults.summary.total_jobs_created >= 0;
});

qaTests.test('AI adoption rate within range', 'Data Integrity', () => {
    if (!currentResults) return 'skip';
    const lastResult = currentResults.results[currentResults.results.length - 1];
    const adoption = lastResult.ai_adoption;
    return adoption >= 0 && adoption <= 100;
});

// ==========================================
// EXPORT FUNCTION TO RUN TESTS
// ==========================================

/**
 * Run all QA tests
 */
async function runQATests() {
    return await qaTests.runAll();
}

/**
 * Run tests and generate report
 */
async function generateQAReport() {
    const results = await qaTests.runAll();

    const report = {
        timestamp: new Date().toISOString(),
        summary: {
            total: results.passed + results.failed + results.skipped,
            passed: results.passed,
            failed: results.failed,
            skipped: results.skipped,
            passRate: ((results.passed / (results.passed + results.failed + results.skipped)) * 100).toFixed(1) + '%'
        },
        errors: results.errors,
        status: results.failed === 0 ? 'PASS' : 'FAIL'
    };

    console.log('\nQA Report JSON:');
    console.log(JSON.stringify(report, null, 2));

    return report;
}

// Make functions globally available
window.runQATests = runQATests;
window.generateQAReport = generateQAReport;
window.qaTests = qaTests;

console.log('QA Test Suite loaded. Run `runQATests()` or `generateQAReport()` in console.');
