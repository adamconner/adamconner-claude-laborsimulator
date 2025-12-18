/**
 * Simulation Web Worker
 *
 * Runs ABM simulation in a background thread for better performance.
 * Handles agent processing in parallel chunks.
 */

// Import agent classes (will be loaded via importScripts in worker context)
let WorkerAgent, FirmAgent, TrainingProgramAgent, LaborMarket;
let WageDynamics, InformationDiffusion, AICapabilityFrontier, RegionalMarketSystem;

// Worker state
let isInitialized = false;
let workers = [];
let firms = [];
let trainingPrograms = [];
let laborMarket = null;
let wageDynamics = null;
let informationDiffusion = null;
let aiCapability = null;
let regionalSystem = null;
let config = {};

/**
 * Message handler
 */
self.onmessage = function(e) {
    const { type, payload, requestId } = e.data;

    switch (type) {
        case 'init':
            handleInit(payload, requestId);
            break;

        case 'runMonth':
            handleRunMonth(payload, requestId);
            break;

        case 'runSimulation':
            handleRunSimulation(payload, requestId);
            break;

        case 'getState':
            handleGetState(requestId);
            break;

        case 'processWorkerChunk':
            handleProcessWorkerChunk(payload, requestId);
            break;

        case 'processFirmChunk':
            handleProcessFirmChunk(payload, requestId);
            break;

        default:
            postMessage({
                type: 'error',
                requestId,
                error: `Unknown message type: ${type}`
            });
    }
};

/**
 * Initialize the simulation
 */
function handleInit(payload, requestId) {
    try {
        config = payload.config || {};

        // Initialize AI capability tracker
        aiCapability = createAICapabilityFrontier(payload.scenario || {});

        // Initialize regional system if available
        if (config.numRegions > 1) {
            regionalSystem = createRegionalSystem(config.numRegions);
        }

        // Generate agents
        workers = generateWorkers(config.numWorkers || 10000, payload.scenario || {});
        firms = generateFirms(config.numFirms || 500, payload.scenario || {});
        trainingPrograms = generateTrainingPrograms(config.numTrainingPrograms || 50, payload.scenario || {});

        // Assign initial employment
        assignInitialEmployment(workers, firms);

        // Build worker networks
        buildWorkerNetworks(workers);

        // Set firm competitors
        setFirmCompetitors(firms);

        // Initialize labor market
        laborMarket = createLaborMarket(workers, firms);

        // Initialize wage dynamics
        wageDynamics = createWageDynamics();

        // Initialize information diffusion
        informationDiffusion = createInformationDiffusion();

        isInitialized = true;

        postMessage({
            type: 'initComplete',
            requestId,
            payload: {
                workerCount: workers.length,
                firmCount: firms.length,
                trainingProgramCount: trainingPrograms.length
            }
        });

    } catch (error) {
        postMessage({
            type: 'error',
            requestId,
            error: error.message
        });
    }
}

/**
 * Run a single month of simulation
 */
function handleRunMonth(payload, requestId) {
    if (!isInitialized) {
        postMessage({
            type: 'error',
            requestId,
            error: 'Simulation not initialized'
        });
        return;
    }

    try {
        const { month, scenario } = payload;
        const results = runMonth(month, scenario);

        postMessage({
            type: 'monthComplete',
            requestId,
            payload: results
        });

    } catch (error) {
        postMessage({
            type: 'error',
            requestId,
            error: error.message
        });
    }
}

/**
 * Run the full simulation
 */
async function handleRunSimulation(payload, requestId) {
    if (!isInitialized) {
        postMessage({
            type: 'error',
            requestId,
            error: 'Simulation not initialized'
        });
        return;
    }

    try {
        const { scenario } = payload;
        const durationMonths = config.durationMonths || 60;
        const results = {
            monthly: [],
            summary: null,
            policySupport: [],
            emergentPatterns: []
        };

        for (let month = 0; month < durationMonths; month++) {
            // Run one month
            const monthResults = runMonth(month, scenario);
            results.monthly.push(monthResults);

            // Track policy support
            results.policySupport.push({
                month,
                ...monthResults.policySupport
            });

            // Send progress update
            postMessage({
                type: 'progress',
                requestId,
                payload: {
                    month,
                    totalMonths: durationMonths,
                    progress: (month + 1) / durationMonths,
                    currentStats: monthResults
                }
            });

            // Yield to allow message processing (every 12 months)
            if (month % 12 === 0) {
                await new Promise(resolve => setTimeout(resolve, 0));
            }
        }

        // Finalize results
        results.summary = createSummary(results);

        postMessage({
            type: 'simulationComplete',
            requestId,
            payload: results
        });

    } catch (error) {
        postMessage({
            type: 'error',
            requestId,
            error: error.message
        });
    }
}

/**
 * Get current state
 */
function handleGetState(requestId) {
    postMessage({
        type: 'state',
        requestId,
        payload: {
            isInitialized,
            workerCount: workers.length,
            firmCount: firms.length,
            aiCapabilityLevel: aiCapability ? aiCapability.currentLevel : 0
        }
    });
}

/**
 * Process a chunk of workers (for distributed processing)
 */
function handleProcessWorkerChunk(payload, requestId) {
    const { startIndex, endIndex, month, scenario } = payload;

    try {
        const chunk = workers.slice(startIndex, endIndex);
        const results = [];

        for (const worker of chunk) {
            // Worker makes monthly decisions
            const decision = processWorkerDecision(worker, month, scenario);
            results.push({
                id: worker.id,
                decision
            });
        }

        postMessage({
            type: 'chunkComplete',
            requestId,
            payload: { startIndex, endIndex, results }
        });

    } catch (error) {
        postMessage({
            type: 'error',
            requestId,
            error: error.message
        });
    }
}

/**
 * Process a chunk of firms
 */
function handleProcessFirmChunk(payload, requestId) {
    const { startIndex, endIndex, month, scenario } = payload;

    try {
        const chunk = firms.slice(startIndex, endIndex);
        const results = [];

        for (const firm of chunk) {
            const decision = processFirmDecision(firm, month, scenario);
            results.push({
                id: firm.id,
                decision
            });
        }

        postMessage({
            type: 'chunkComplete',
            requestId,
            payload: { startIndex, endIndex, results }
        });

    } catch (error) {
        postMessage({
            type: 'error',
            requestId,
            error: error.message
        });
    }
}

// ========== Core Simulation Logic ==========

function runMonth(month, scenario) {
    // 1. Advance AI capabilities
    if (aiCapability) {
        advanceAICapability(month, scenario);
    }

    // 2. Firms make AI adoption and workforce decisions
    for (const firm of firms) {
        processFirmDecision(firm, month, scenario);
    }

    // 3. Workers evaluate situations and make decisions
    for (const worker of workers) {
        processWorkerDecision(worker, month, scenario);
    }

    // 4. Training programs process
    processTrainingPrograms(month);

    // 5. Labor market matching
    const matchingResults = runLaborMarketMatching();

    // 6. Wage dynamics
    if (wageDynamics) {
        adjustWages();
    }

    // 7. Apply interventions
    if (scenario && scenario.interventions) {
        applyInterventions(scenario.interventions, month);
    }

    // 8. Information diffusion
    if (informationDiffusion) {
        diffuseInformation(month, matchingResults);
    }

    // 9. Update regional stats
    if (regionalSystem) {
        updateRegionalStats();
    }

    // 10. Collect results
    return collectMonthlyResults(month, matchingResults);
}

// ========== Agent Generation ==========

function generateWorkers(count, scenario) {
    const generatedWorkers = [];
    const regionWeights = getRegionPopulationWeights(config.numRegions || 10);

    for (let i = 0; i < count; i++) {
        const worker = {
            id: `w_${i}`,
            age: 18 + Math.floor(Math.random() * 52),
            education: randomEducation(),
            region: selectRegion(regionWeights),
            status: Math.random() < (scenario.initialUnemploymentRate || 0.04) ? 'unemployed' : 'employed',
            occupation: Math.floor(Math.random() * 100) + 1,
            industry: Math.floor(Math.random() * 20) + 1,
            employer: null,
            tenure: 0,
            skills: generateSkillVector(),
            aiAugmentationSkill: Math.random() * 0.5,
            adaptability: 0.3 + Math.random() * 0.5,
            wage: 2500 + Math.random() * 5000,
            savings: Math.random() * 12,
            reservationWage: 2000 + Math.random() * 2000,
            riskTolerance: Math.random(),
            mobilityWillingness: Math.random(),
            networkSize: 10 + Math.floor(Math.random() * 40),
            informationLevel: 0.3 + Math.random() * 0.4,
            unemploymentDuration: 0,
            unemploymentSpells: 0,
            activelySearching: false,
            network: [],
            policySupport: {
                ubi: 0.3 + Math.random() * 0.4,
                retraining: 0.4 + Math.random() * 0.3,
                wageSubsidy: 0.3 + Math.random() * 0.4,
                aiRegulation: 0.3 + Math.random() * 0.4,
                publicWorks: 0.3 + Math.random() * 0.4
            },
            economicAnxiety: 0.2 + Math.random() * 0.3,
            politicalEngagement: Math.random(),
            ideologicalPrior: Math.random() * 2 - 1,
            trustInGovernment: 0.3 + Math.random() * 0.4,
            retrainingProgram: null,
            wantsRetraining: false
        };

        generatedWorkers.push(worker);
    }

    return generatedWorkers;
}

function generateFirms(count, scenario) {
    const generatedFirms = [];
    const regionWeights = getRegionPopulationWeights(config.numRegions || 10);

    for (let i = 0; i < count; i++) {
        const sizeRand = Math.random();
        let size, targetHeadcount;

        if (sizeRand < 0.6) {
            size = 'small';
            targetHeadcount = 5 + Math.floor(Math.random() * 45);
        } else if (sizeRand < 0.85) {
            size = 'medium';
            targetHeadcount = 50 + Math.floor(Math.random() * 450);
        } else if (sizeRand < 0.97) {
            size = 'large';
            targetHeadcount = 500 + Math.floor(Math.random() * 4500);
        } else {
            size = 'enterprise';
            targetHeadcount = 5000 + Math.floor(Math.random() * 10000);
        }

        const firm = {
            id: `f_${i}`,
            industry: Math.floor(Math.random() * 20) + 1,
            region: selectRegion(regionWeights),
            size,
            targetHeadcount,
            employees: [],
            openPositions: [],
            aiAdoptionStatus: 'none',
            automationLevel: 0,
            innovativeness: Math.random(),
            laborStrategy: randomLaborStrategy(),
            competitors: []
        };

        // Initial AI adoption
        if (scenario.initialAIAdoption && Math.random() < scenario.initialAIAdoption) {
            firm.aiAdoptionStatus = 'exploring';
        }

        generatedFirms.push(firm);
    }

    return generatedFirms;
}

function generateTrainingPrograms(count, scenario) {
    const programs = [];
    const types = ['bootcamp', 'community_college', 'university', 'employer_sponsored', 'online'];
    const regionWeights = getRegionPopulationWeights(config.numRegions || 10);

    for (let i = 0; i < count; i++) {
        const type = types[Math.floor(Math.random() * types.length)];

        programs.push({
            id: `prog_${i}`,
            type,
            region: selectRegion(regionWeights),
            maxEnrollment: getMaxEnrollment(type),
            currentEnrollment: 0,
            enrolledWorkers: [],
            duration: getDuration(type),
            cost: getCost(type),
            completionRate: 0.5 + Math.random() * 0.3,
            jobPlacementRate: 0.5 + Math.random() * 0.3,
            qualityScore: 0.5 + Math.random() * 0.4,
            subsidyAvailable: scenario.trainingSubsidy || 0.3,
            totalGraduates: 0,
            totalDropouts: 0
        });
    }

    return programs;
}

// ========== Initialization Helpers ==========

function assignInitialEmployment(workerList, firmList) {
    const employed = workerList.filter(w => w.status === 'employed');
    const shuffled = employed.sort(() => Math.random() - 0.5);

    let workerIndex = 0;
    for (const firm of firmList) {
        const toAssign = Math.min(firm.targetHeadcount, shuffled.length - workerIndex);

        for (let i = 0; i < toAssign && workerIndex < shuffled.length; i++) {
            const worker = shuffled[workerIndex++];
            worker.employer = firm.id;
            worker.industry = firm.industry;
            worker.tenure = Math.floor(Math.random() * 60);
            firm.employees.push(worker.id);
        }
    }
}

function buildWorkerNetworks(workerList) {
    for (const worker of workerList) {
        const potentialContacts = workerList.filter(w =>
            w.id !== worker.id &&
            (w.region === worker.region || Math.random() < 0.1)
        );

        const shuffled = potentialContacts.sort(() => Math.random() - 0.5);
        const networkSize = Math.min(worker.networkSize, shuffled.length);

        worker.network = shuffled.slice(0, networkSize).map(contact => ({
            id: contact.id,
            closeness: 0.3 + Math.random() * 0.5
        }));
    }
}

function setFirmCompetitors(firmList) {
    const byIndustry = {};

    for (const firm of firmList) {
        if (!byIndustry[firm.industry]) {
            byIndustry[firm.industry] = [];
        }
        byIndustry[firm.industry].push(firm);
    }

    for (const firm of firmList) {
        const sameIndustry = byIndustry[firm.industry] || [];
        firm.competitors = sameIndustry
            .filter(f => f.id !== firm.id)
            .slice(0, 10)
            .map(f => f.id);
    }
}

// ========== Decision Processing ==========

function processWorkerDecision(worker, month, scenario) {
    if (worker.status === 'employed') {
        // Check displacement risk
        const displacementRisk = calculateDisplacementRisk(worker);

        if (displacementRisk > worker.riskTolerance * 0.7) {
            worker.activelySearching = true;
            worker.wantsRetraining = Math.random() < 0.3;
        }

        worker.tenure++;

    } else if (worker.status === 'unemployed') {
        worker.unemploymentDuration++;
        worker.activelySearching = true;

        // Update economic anxiety
        worker.economicAnxiety = Math.min(1, worker.economicAnxiety + 0.02);

        // Deplete savings
        worker.savings = Math.max(0, worker.savings - 1);

        if (worker.savings <= 0) {
            worker.policySupport.ubi = Math.min(1, worker.policySupport.ubi + 0.05);
        }

        // Consider retraining after 6 months
        if (worker.unemploymentDuration > 6 && worker.age < 55) {
            worker.wantsRetraining = Math.random() < 0.4;
        }

        // Risk of leaving labor force
        if (worker.unemploymentDuration > 18 && worker.age > 55) {
            if (Math.random() < 0.05) {
                worker.status = 'out_of_labor_force';
            }
        }

    } else if (worker.status === 'retraining') {
        // Progress through training
        // (handled by training program)
    }

    // Update policy support based on network
    updatePolicySupport(worker);

    return {
        status: worker.status,
        activelySearching: worker.activelySearching,
        wantsRetraining: worker.wantsRetraining
    };
}

function processFirmDecision(firm, month, scenario) {
    // AI adoption decision
    const aiROI = calculateAIROI(firm);
    const adoptionThreshold = 0.3 + (1 - firm.innovativeness) * 0.4;

    if (aiROI > adoptionThreshold) {
        advanceAIAdoption(firm);
    }

    // Workforce decisions
    const currentEmployees = firm.employees.length;
    const targetWithAI = Math.floor(firm.targetHeadcount * (1 - firm.automationLevel * 0.3));

    if (currentEmployees < targetWithAI) {
        // Need to hire
        const toHire = Math.min(5, targetWithAI - currentEmployees);
        for (let i = 0; i < toHire; i++) {
            firm.openPositions.push({
                id: `job_${firm.id}_${month}_${i}`,
                firmId: firm.id,
                industry: firm.industry,
                region: firm.region,
                wage: 3000 + Math.random() * 4000
            });
        }
    } else if (currentEmployees > targetWithAI * 1.1) {
        // Need to layoff
        const toLayoff = Math.min(3, currentEmployees - targetWithAI);
        for (let i = 0; i < toLayoff && firm.employees.length > 0; i++) {
            const layoffId = firm.employees.pop();
            const worker = workers.find(w => w.id === layoffId);
            if (worker) {
                worker.status = 'unemployed';
                worker.employer = null;
                worker.unemploymentDuration = 0;
                worker.unemploymentSpells++;
                worker.economicAnxiety = Math.min(1, worker.economicAnxiety + 0.3);
                worker.policySupport.ubi = Math.min(1, worker.policySupport.ubi + 0.15);
            }
        }
    }

    return {
        aiAdoptionStatus: firm.aiAdoptionStatus,
        openPositions: firm.openPositions.length,
        employees: firm.employees.length
    };
}

function processTrainingPrograms(month) {
    for (const program of trainingPrograms) {
        // Process graduations
        const toGraduate = program.enrolledWorkers.filter(wId => {
            const worker = workers.find(w => w.id === wId);
            return worker && worker.retrainingProgress >= 1;
        });

        for (const wId of toGraduate) {
            const worker = workers.find(w => w.id === wId);
            if (worker) {
                worker.status = 'unemployed';
                worker.retrainingProgram = null;
                worker.retrainingProgress = 0;
                worker.aiAugmentationSkill = Math.min(1, worker.aiAugmentationSkill + 0.2);
                worker.activelySearching = true;
                program.totalGraduates++;
            }
        }

        program.enrolledWorkers = program.enrolledWorkers.filter(wId => !toGraduate.includes(wId));
        program.currentEnrollment = program.enrolledWorkers.length;

        // Enroll new workers
        const wantingRetraining = workers.filter(w =>
            w.wantsRetraining &&
            !w.retrainingProgram &&
            w.region === program.region &&
            program.currentEnrollment < program.maxEnrollment
        );

        for (const worker of wantingRetraining.slice(0, 5)) {
            worker.status = 'retraining';
            worker.retrainingProgram = program.id;
            worker.retrainingProgress = 0;
            worker.wantsRetraining = false;
            program.enrolledWorkers.push(worker.id);
            program.currentEnrollment++;
        }

        // Progress enrolled workers
        for (const wId of program.enrolledWorkers) {
            const worker = workers.find(w => w.id === wId);
            if (worker) {
                worker.retrainingProgress = (worker.retrainingProgress || 0) + (1 / program.duration);
            }
        }
    }
}

function runLaborMarketMatching() {
    const results = { hires: 0, applications: 0 };

    // Collect all job postings
    const allJobs = [];
    for (const firm of firms) {
        allJobs.push(...firm.openPositions);
    }

    // Unemployed workers apply
    const jobSeekers = workers.filter(w => w.status === 'unemployed' && w.activelySearching);

    for (const worker of jobSeekers) {
        const suitableJobs = allJobs.filter(job =>
            (job.region === worker.region || worker.mobilityWillingness > 0.7) &&
            job.wage >= worker.reservationWage * 0.8
        );

        if (suitableJobs.length > 0 && Math.random() < 0.15) {
            // Worker gets hired
            const job = suitableJobs[Math.floor(Math.random() * suitableJobs.length)];
            const firm = firms.find(f => f.id === job.firmId);

            if (firm) {
                worker.status = 'employed';
                worker.employer = firm.id;
                worker.industry = firm.industry;
                worker.wage = job.wage;
                worker.tenure = 0;
                worker.unemploymentDuration = 0;
                worker.activelySearching = false;
                worker.economicAnxiety = Math.max(0, worker.economicAnxiety - 0.2);

                firm.employees.push(worker.id);
                firm.openPositions = firm.openPositions.filter(j => j.id !== job.id);
                allJobs.splice(allJobs.indexOf(job), 1);

                results.hires++;
            }
        }

        results.applications++;
    }

    return results;
}

function adjustWages() {
    // Simple wage adjustment based on unemployment
    const unemployed = workers.filter(w => w.status === 'unemployed').length;
    const laborForce = workers.filter(w => w.status !== 'out_of_labor_force').length;
    const unemploymentRate = laborForce > 0 ? unemployed / laborForce : 0;

    let wageAdjustment = 0;
    if (unemploymentRate < 0.04) {
        wageAdjustment = 0.005; // Tight market - wages up
    } else if (unemploymentRate > 0.08) {
        wageAdjustment = -0.002; // Loose market - wages stagnant/down
    }

    for (const worker of workers.filter(w => w.status === 'employed')) {
        worker.wage *= (1 + wageAdjustment);
    }
}

function applyInterventions(interventions, month) {
    for (const intervention of interventions) {
        if (!intervention.active) continue;

        switch (intervention.type) {
            case 'ubi':
                for (const worker of workers.filter(w => w.status === 'unemployed')) {
                    worker.savings += 2;
                    worker.policySupport.ubi = Math.min(1, worker.policySupport.ubi + 0.05);
                    worker.economicAnxiety = Math.max(0, worker.economicAnxiety - 0.05);
                }
                break;

            case 'retraining':
                for (const program of trainingPrograms) {
                    program.subsidyAvailable = Math.min(1, program.subsidyAvailable + 0.2);
                    program.maxEnrollment = Math.floor(program.maxEnrollment * 1.1);
                }
                break;

            case 'wage_subsidy':
                // Reduce layoffs
                for (const firm of firms) {
                    if (firm.employees.length > firm.targetHeadcount * 0.9) {
                        // Subsidy prevents some layoffs
                    }
                }
                break;
        }
    }
}

function diffuseInformation(month, matchingResults) {
    for (const worker of workers) {
        if (worker.network.length === 0) continue;

        // Get network contacts
        const contacts = worker.network.map(n => workers.find(w => w.id === n.id)).filter(Boolean);

        if (contacts.length === 0) continue;

        // Average information level
        const avgInfo = contacts.reduce((sum, c) => sum + (c.informationLevel || 0.5), 0) / contacts.length;
        const diff = avgInfo - worker.informationLevel;
        worker.informationLevel = Math.max(0, Math.min(1, worker.informationLevel + diff * 0.05));

        // Anxiety spreads
        const avgAnxiety = contacts.reduce((sum, c) => sum + (c.economicAnxiety || 0.2), 0) / contacts.length;
        const anxietyDiff = avgAnxiety - worker.economicAnxiety;
        worker.economicAnxiety = Math.max(0, Math.min(1, worker.economicAnxiety + anxietyDiff * 0.03));
    }
}

function updateRegionalStats() {
    // Group workers by region and update stats
    // (simplified - real implementation would update regionalSystem)
}

function collectMonthlyResults(month, matchingResults) {
    const employed = workers.filter(w => w.status === 'employed').length;
    const unemployed = workers.filter(w => w.status === 'unemployed').length;
    const retraining = workers.filter(w => w.status === 'retraining').length;
    const outOfLaborForce = workers.filter(w => w.status === 'out_of_labor_force').length;
    const laborForce = employed + unemployed;

    // Calculate policy support averages
    const policySupport = {};
    const policies = ['ubi', 'retraining', 'wageSubsidy', 'aiRegulation', 'publicWorks'];

    for (const policy of policies) {
        const total = workers.reduce((sum, w) => sum + (w.policySupport[policy] || 0.5), 0);
        policySupport[policy] = {
            mean: total / workers.length,
            strongSupport: workers.filter(w => w.policySupport[policy] > 0.7).length / workers.length,
            strongOppose: workers.filter(w => w.policySupport[policy] < 0.3).length / workers.length
        };
    }

    // AI adoption stats
    const aiAdopting = firms.filter(f =>
        ['piloting', 'scaling', 'mature'].includes(f.aiAdoptionStatus)
    ).length;

    return {
        month,
        year: Math.floor(month / 12) + 2025,
        employed,
        unemployed,
        retraining,
        outOfLaborForce,
        laborForce,
        unemploymentRate: laborForce > 0 ? unemployed / laborForce : 0,
        aiAdoptionRate: firms.length > 0 ? aiAdopting / firms.length : 0,
        aiCapabilityLevel: aiCapability ? aiCapability.currentLevel : 0,
        monthlyHires: matchingResults.hires,
        policySupport,
        medianWage: calculateMedianWage()
    };
}

function createSummary(results) {
    const first = results.monthly[0];
    const last = results.monthly[results.monthly.length - 1];

    return {
        durationMonths: results.monthly.length,
        totalWorkers: workers.length,
        totalFirms: firms.length,
        initial: {
            unemploymentRate: first.unemploymentRate,
            aiAdoptionRate: first.aiAdoptionRate
        },
        final: {
            unemploymentRate: last.unemploymentRate,
            aiAdoptionRate: last.aiAdoptionRate,
            employed: last.employed,
            unemployed: last.unemployed
        },
        changes: {
            unemploymentChange: last.unemploymentRate - first.unemploymentRate,
            aiAdoptionChange: last.aiAdoptionRate - first.aiAdoptionRate
        },
        peakUnemployment: Math.max(...results.monthly.map(m => m.unemploymentRate)),
        finalPolicySupport: last.policySupport
    };
}

// ========== Utility Functions ==========

function createAICapabilityFrontier(scenario) {
    return {
        currentLevel: scenario.initialAILevel || 0.3,
        adoptionCurve: scenario.adoptionCurve || 's_curve',
        automationPace: scenario.automationPace || 'moderate'
    };
}

function advanceAICapability(month, scenario) {
    const paceMultipliers = {
        slow: 0.5,
        moderate: 1.0,
        fast: 1.5,
        accelerating: 2.0
    };

    const pace = paceMultipliers[aiCapability.automationPace] || 1.0;

    switch (aiCapability.adoptionCurve) {
        case 'linear':
            aiCapability.currentLevel += 0.005 * pace;
            break;
        case 'exponential':
            aiCapability.currentLevel *= 1 + (0.01 * pace);
            break;
        case 's_curve':
        default:
            const growth = 0.015 * pace / (1 + Math.exp(-0.05 * (month - 60)));
            aiCapability.currentLevel += growth;
            break;
    }

    aiCapability.currentLevel = Math.min(0.95, aiCapability.currentLevel);
}

function createRegionalSystem(numRegions) {
    const regions = [];
    for (let i = 1; i <= numRegions; i++) {
        regions.push({
            id: i,
            unemploymentRate: 0.04 + Math.random() * 0.02,
            costOfLiving: 0.8 + Math.random() * 0.6
        });
    }
    return { regions };
}

function createLaborMarket(workerList, firmList) {
    return {
        workers: workerList,
        firms: firmList
    };
}

function createWageDynamics() {
    return { enabled: true };
}

function createInformationDiffusion() {
    return { enabled: true };
}

function getRegionPopulationWeights(numRegions) {
    const weights = [];
    let total = 0;
    for (let i = 0; i < numRegions; i++) {
        const w = 0.5 + Math.random() * 1.5;
        weights.push(w);
        total += w;
    }
    return weights.map(w => w / total);
}

function selectRegion(weights) {
    const rand = Math.random();
    let cumulative = 0;
    for (let i = 0; i < weights.length; i++) {
        cumulative += weights[i];
        if (rand <= cumulative) return i + 1;
    }
    return weights.length;
}

function randomEducation() {
    const rand = Math.random();
    if (rand < 0.10) return 'no_degree';
    if (rand < 0.35) return 'high_school';
    if (rand < 0.55) return 'some_college';
    if (rand < 0.85) return 'bachelors';
    return 'advanced';
}

function randomLaborStrategy() {
    const rand = Math.random();
    if (rand < 0.4) return 'cost_minimizer';
    if (rand < 0.7) return 'balanced';
    return 'talent_investor';
}

function generateSkillVector() {
    const skills = {};
    const skillNames = ['technical', 'communication', 'analytical', 'leadership', 'creativity'];
    for (const name of skillNames) {
        skills[name] = Math.random();
    }
    return skills;
}

function getMaxEnrollment(type) {
    const capacities = {
        bootcamp: 30,
        community_college: 200,
        university: 500,
        employer_sponsored: 30,
        online: 1000
    };
    return capacities[type] || 100;
}

function getDuration(type) {
    const durations = {
        bootcamp: 4,
        community_college: 18,
        university: 36,
        employer_sponsored: 3,
        online: 6
    };
    return durations[type] || 6;
}

function getCost(type) {
    const costs = {
        bootcamp: 3000,
        community_college: 500,
        university: 1500,
        employer_sponsored: 0,
        online: 100
    };
    return costs[type] || 500;
}

function calculateDisplacementRisk(worker) {
    let risk = 0.1;

    // AI capability increases risk
    if (aiCapability) {
        risk += aiCapability.currentLevel * 0.3;
    }

    // Low AI skills increase risk
    risk += (1 - worker.aiAugmentationSkill) * 0.2;

    // Certain industries more at risk
    const highRiskIndustries = [4, 5, 6, 11, 19, 20]; // Retail, Manufacturing, etc.
    if (highRiskIndustries.includes(worker.industry)) {
        risk += 0.15;
    }

    return Math.min(1, risk);
}

function calculateAIROI(firm) {
    let roi = 0.2;

    // Larger firms get more benefit
    if (firm.size === 'large' || firm.size === 'enterprise') {
        roi += 0.2;
    }

    // AI capability level affects ROI
    if (aiCapability) {
        roi += aiCapability.currentLevel * 0.3;
    }

    // Competitive pressure
    const competitorAdopting = firm.competitors.filter(cId => {
        const comp = firms.find(f => f.id === cId);
        return comp && ['piloting', 'scaling', 'mature'].includes(comp.aiAdoptionStatus);
    }).length;

    if (competitorAdopting > 0) {
        roi += 0.1 * (competitorAdopting / firm.competitors.length);
    }

    return roi;
}

function advanceAIAdoption(firm) {
    const statusProgression = ['none', 'exploring', 'piloting', 'scaling', 'mature'];
    const currentIndex = statusProgression.indexOf(firm.aiAdoptionStatus);

    if (currentIndex < statusProgression.length - 1 && Math.random() < 0.15) {
        firm.aiAdoptionStatus = statusProgression[currentIndex + 1];
        firm.automationLevel = Math.min(0.5, firm.automationLevel + 0.1);
    }
}

function updatePolicySupport(worker) {
    // Network influence on policy support
    if (worker.network.length === 0) return;

    const contacts = worker.network.map(n => workers.find(w => w.id === n.id)).filter(Boolean);
    if (contacts.length === 0) return;

    const policies = ['ubi', 'retraining', 'wageSubsidy', 'aiRegulation', 'publicWorks'];

    for (const policy of policies) {
        const avgSupport = contacts.reduce((sum, c) => sum + (c.policySupport[policy] || 0.5), 0) / contacts.length;
        const diff = avgSupport - worker.policySupport[policy];
        worker.policySupport[policy] = Math.max(0, Math.min(1, worker.policySupport[policy] + diff * 0.02));
    }
}

function calculateMedianWage() {
    const wages = workers
        .filter(w => w.status === 'employed' && w.wage > 0)
        .map(w => w.wage)
        .sort((a, b) => a - b);

    if (wages.length === 0) return 0;

    const mid = Math.floor(wages.length / 2);
    return wages.length % 2 !== 0 ? wages[mid] : (wages[mid - 1] + wages[mid]) / 2;
}
