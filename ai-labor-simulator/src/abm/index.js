/**
 * Agent-Based Modeling Module
 *
 * Entry point for the ABM labor market simulation system.
 * Exports all agent classes, market mechanisms, and the simulation engine.
 */

// For browser usage, classes are loaded via script tags
// For Node.js, we use require

if (typeof module !== 'undefined' && module.exports) {
    // Node.js exports
    const { WorkerAgent, EmploymentStatus, EducationLevel, AIExperience } = require('./agents/worker.js');
    const { FirmAgent, AIAdoptionStatus, FirmSize, LaborStrategy } = require('./agents/firm.js');
    const { LaborMarket } = require('./market/labor-market.js');
    const { ABMSimulationEngine, AICapabilityFrontier } = require('./engine.js');

    module.exports = {
        // Agents
        WorkerAgent,
        FirmAgent,

        // Enums
        EmploymentStatus,
        EducationLevel,
        AIExperience,
        AIAdoptionStatus,
        FirmSize,
        LaborStrategy,

        // Market
        LaborMarket,

        // Engine
        ABMSimulationEngine,
        AICapabilityFrontier
    };
}

/**
 * Browser initialization helper
 * Call this after all ABM scripts are loaded
 */
function initializeABM() {
    console.log('ABM Module Initialized');
    console.log('Available classes:');
    console.log('  - WorkerAgent');
    console.log('  - FirmAgent');
    console.log('  - LaborMarket');
    console.log('  - ABMSimulationEngine');

    return {
        WorkerAgent: typeof WorkerAgent !== 'undefined' ? WorkerAgent : null,
        FirmAgent: typeof FirmAgent !== 'undefined' ? FirmAgent : null,
        LaborMarket: typeof LaborMarket !== 'undefined' ? LaborMarket : null,
        ABMSimulationEngine: typeof ABMSimulationEngine !== 'undefined' ? ABMSimulationEngine : null
    };
}

/**
 * Quick test function to verify ABM is working
 */
async function testABM() {
    console.log('Running ABM test simulation...');

    const engine = new ABMSimulationEngine({
        numWorkers: 1000,    // Small for testing
        numFirms: 50,
        numRegions: 5,
        durationMonths: 12,  // 1 year
        onProgress: (progress) => {
            console.log(`Month ${progress.month + 1}/${progress.totalMonths}`);
        }
    });

    const scenario = {
        initialUnemploymentRate: 0.05,
        initialAIAdoption: 0.1,
        adoptionCurve: 's_curve',
        automationPace: 'moderate'
    };

    try {
        const results = await engine.runSimulation(scenario);

        console.log('\n=== ABM Test Results ===');
        console.log(`Initial unemployment: ${(results.summary.initial.unemploymentRate * 100).toFixed(1)}%`);
        console.log(`Final unemployment: ${(results.summary.final.unemploymentRate * 100).toFixed(1)}%`);
        console.log(`Peak unemployment: ${(results.summary.peakUnemployment * 100).toFixed(1)}%`);
        console.log(`Initial AI adoption: ${(results.summary.initial.aiAdoptionRate * 100).toFixed(1)}%`);
        console.log(`Final AI adoption: ${(results.summary.final.aiAdoptionRate * 100).toFixed(1)}%`);
        console.log(`Total hires: ${results.summary.totalHires}`);
        console.log(`Total layoffs: ${results.summary.totalLayoffs}`);
        console.log(`Emergent patterns detected: ${results.summary.emergentPatterns.length}`);

        console.log('\n=== Policy Support (Final) ===');
        Object.entries(results.summary.finalPolicySupport).forEach(([policy, stats]) => {
            console.log(`  ${policy}: ${(stats.mean * 100).toFixed(0)}% support (feasibility: ${stats.feasibilityScore})`);
        });

        return results;
    } catch (error) {
        console.error('ABM test failed:', error);
        throw error;
    }
}
