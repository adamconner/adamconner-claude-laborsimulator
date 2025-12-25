/**
 * AICapabilityFrontier - Tracks AI capabilities and automation potential over time
 *
 * Models the advancement of AI capabilities across different task types,
 * occupations, and industries. Determines what can be automated and when.
 */

// Task categories that AI can affect
const TaskCategories = {
    ROUTINE_COGNITIVE: 'routine_cognitive',      // Data entry, scheduling, basic analysis
    ROUTINE_MANUAL: 'routine_manual',            // Assembly, packaging, driving
    NON_ROUTINE_COGNITIVE: 'non_routine_cognitive', // Problem-solving, creativity, strategy
    NON_ROUTINE_MANUAL: 'non_routine_manual',    // Craftsmanship, surgery, repairs
    INTERPERSONAL: 'interpersonal',              // Sales, teaching, therapy, management
    CREATIVE: 'creative'                         // Art, writing, design, innovation
};

// Occupation automation exposure data (based on research)
const OCCUPATION_AUTOMATION_DATA = {
    // High exposure (>70%)
    1: { name: 'Data Entry Clerk', exposure: 0.95, category: TaskCategories.ROUTINE_COGNITIVE },
    2: { name: 'Bookkeeper', exposure: 0.90, category: TaskCategories.ROUTINE_COGNITIVE },
    3: { name: 'Cashier', exposure: 0.85, category: TaskCategories.ROUTINE_MANUAL },
    4: { name: 'Telemarketer', exposure: 0.90, category: TaskCategories.ROUTINE_COGNITIVE },
    5: { name: 'Assembly Worker', exposure: 0.80, category: TaskCategories.ROUTINE_MANUAL },
    6: { name: 'Truck Driver', exposure: 0.75, category: TaskCategories.ROUTINE_MANUAL },
    7: { name: 'Warehouse Worker', exposure: 0.78, category: TaskCategories.ROUTINE_MANUAL },
    8: { name: 'Fast Food Worker', exposure: 0.72, category: TaskCategories.ROUTINE_MANUAL },

    // Medium exposure (40-70%)
    20: { name: 'Accountant', exposure: 0.65, category: TaskCategories.ROUTINE_COGNITIVE },
    21: { name: 'Paralegal', exposure: 0.60, category: TaskCategories.ROUTINE_COGNITIVE },
    22: { name: 'Insurance Underwriter', exposure: 0.65, category: TaskCategories.ROUTINE_COGNITIVE },
    23: { name: 'Loan Officer', exposure: 0.55, category: TaskCategories.ROUTINE_COGNITIVE },
    24: { name: 'Customer Service Rep', exposure: 0.50, category: TaskCategories.INTERPERSONAL },
    25: { name: 'Radiologist', exposure: 0.55, category: TaskCategories.NON_ROUTINE_COGNITIVE },
    26: { name: 'Financial Analyst', exposure: 0.50, category: TaskCategories.NON_ROUTINE_COGNITIVE },
    27: { name: 'Journalist', exposure: 0.45, category: TaskCategories.CREATIVE },
    28: { name: 'Translator', exposure: 0.55, category: TaskCategories.NON_ROUTINE_COGNITIVE },

    // Low exposure (<40%)
    40: { name: 'Software Developer', exposure: 0.35, category: TaskCategories.NON_ROUTINE_COGNITIVE },
    41: { name: 'Nurse', exposure: 0.25, category: TaskCategories.INTERPERSONAL },
    42: { name: 'Teacher', exposure: 0.20, category: TaskCategories.INTERPERSONAL },
    43: { name: 'Therapist', exposure: 0.15, category: TaskCategories.INTERPERSONAL },
    44: { name: 'Surgeon', exposure: 0.20, category: TaskCategories.NON_ROUTINE_MANUAL },
    45: { name: 'CEO', exposure: 0.15, category: TaskCategories.NON_ROUTINE_COGNITIVE },
    46: { name: 'Sales Manager', exposure: 0.25, category: TaskCategories.INTERPERSONAL },
    47: { name: 'HR Manager', exposure: 0.30, category: TaskCategories.INTERPERSONAL },
    48: { name: 'Plumber', exposure: 0.20, category: TaskCategories.NON_ROUTINE_MANUAL },
    49: { name: 'Electrician', exposure: 0.22, category: TaskCategories.NON_ROUTINE_MANUAL },
    50: { name: 'Artist', exposure: 0.40, category: TaskCategories.CREATIVE }
};

// Industry automation potential
const INDUSTRY_AUTOMATION = {
    1: { name: 'Technology', potential: 0.35, aiAdoptionSpeed: 'fast' },
    2: { name: 'Healthcare', potential: 0.40, aiAdoptionSpeed: 'moderate' },
    3: { name: 'Finance', potential: 0.55, aiAdoptionSpeed: 'fast' },
    4: { name: 'Retail', potential: 0.70, aiAdoptionSpeed: 'moderate' },
    5: { name: 'Manufacturing', potential: 0.75, aiAdoptionSpeed: 'moderate' },
    6: { name: 'Transportation', potential: 0.70, aiAdoptionSpeed: 'slow' },
    7: { name: 'Education', potential: 0.30, aiAdoptionSpeed: 'slow' },
    8: { name: 'Government', potential: 0.40, aiAdoptionSpeed: 'slow' },
    9: { name: 'Construction', potential: 0.45, aiAdoptionSpeed: 'slow' },
    10: { name: 'Professional Services', potential: 0.50, aiAdoptionSpeed: 'fast' },
    11: { name: 'Hospitality', potential: 0.60, aiAdoptionSpeed: 'moderate' },
    12: { name: 'Agriculture', potential: 0.65, aiAdoptionSpeed: 'slow' },
    13: { name: 'Energy', potential: 0.50, aiAdoptionSpeed: 'moderate' },
    14: { name: 'Media', potential: 0.55, aiAdoptionSpeed: 'fast' },
    15: { name: 'Real Estate', potential: 0.40, aiAdoptionSpeed: 'moderate' },
    16: { name: 'Utilities', potential: 0.50, aiAdoptionSpeed: 'slow' },
    17: { name: 'Telecom', potential: 0.55, aiAdoptionSpeed: 'fast' },
    18: { name: 'Pharma', potential: 0.45, aiAdoptionSpeed: 'moderate' },
    19: { name: 'Logistics', potential: 0.70, aiAdoptionSpeed: 'fast' },
    20: { name: 'Administrative', potential: 0.80, aiAdoptionSpeed: 'fast' }
};

class AICapabilityFrontier {
    constructor(scenario = {}) {
        this.scenario = scenario;

        // Current AI capability level (0-1 scale)
        this.currentLevel = scenario.initialAILevel || 0.30;

        // Adoption curve type
        this.adoptionCurve = scenario.adoptionCurve || 's_curve';

        // Automation pace
        this.automationPace = scenario.automationPace || 'moderate';

        // Capability levels by task category
        this.taskCapabilities = this._initializeTaskCapabilities();

        // Occupation-specific exposure (memoized calculations)
        this.occupationExposure = {};

        // Industry AI adoption levels
        this.industryAdoption = {};

        // Historical tracking
        this.history = [];

        // Breakthrough events (random significant advances)
        this.breakthroughs = [];

        // Cost-effectiveness threshold (when AI becomes cheaper than humans)
        this.costThreshold = scenario.costThreshold || 0.6;
    }

    _initializeTaskCapabilities() {
        return {
            [TaskCategories.ROUTINE_COGNITIVE]: 0.7,     // Already quite capable
            [TaskCategories.ROUTINE_MANUAL]: 0.5,        // Moderate capability
            [TaskCategories.NON_ROUTINE_COGNITIVE]: 0.4, // Improving rapidly
            [TaskCategories.NON_ROUTINE_MANUAL]: 0.2,    // Still limited
            [TaskCategories.INTERPERSONAL]: 0.2,         // Limited
            [TaskCategories.CREATIVE]: 0.35              // Surprisingly capable (LLMs, diffusion)
        };
    }

    /**
     * Advance AI capabilities by one month
     */
    advance(month, scenario = {}) {
        const paceMultipliers = {
            slow: 0.5,
            moderate: 1.0,
            fast: 1.5,
            accelerating: 2.0
        };

        const pace = paceMultipliers[this.automationPace] || 1.0;

        // Calculate capability growth based on curve type
        let growth = 0;

        switch (this.adoptionCurve) {
            case 'linear':
                growth = 0.005 * pace;
                break;

            case 'exponential':
                growth = this.currentLevel * 0.01 * pace;
                break;

            case 's_curve':
            default:
                // S-curve: slow start, fast middle, slow end
                const midpoint = 60; // Peak growth around month 60
                const steepness = 0.05;
                growth = 0.015 * pace / (1 + Math.exp(-steepness * (month - midpoint)));
                break;

            case 'step':
                // Step function with occasional jumps
                if (month % 24 === 0) {
                    growth = 0.15 * pace;
                    this._recordBreakthrough(month, growth);
                } else {
                    growth = 0.002 * pace;
                }
                break;
        }

        // Apply growth
        this.currentLevel = Math.min(0.95, this.currentLevel + growth);

        // Update task-specific capabilities
        this._updateTaskCapabilities(month, pace);

        // Check for random breakthroughs (1% chance per month in fast scenarios)
        if (Math.random() < 0.01 * pace) {
            this._generateBreakthrough(month);
        }

        // Record history
        this.history.push({
            month,
            level: this.currentLevel,
            taskCapabilities: { ...this.taskCapabilities },
            breakthrough: this.breakthroughs.length > 0 &&
                this.breakthroughs[this.breakthroughs.length - 1].month === month
        });

        return this.currentLevel;
    }

    _updateTaskCapabilities(month, pace) {
        // Different task categories advance at different rates
        const advanceRates = {
            [TaskCategories.ROUTINE_COGNITIVE]: 0.008 * pace,
            [TaskCategories.ROUTINE_MANUAL]: 0.005 * pace,
            [TaskCategories.NON_ROUTINE_COGNITIVE]: 0.007 * pace,  // LLMs advancing fast
            [TaskCategories.NON_ROUTINE_MANUAL]: 0.003 * pace,      // Robotics slower
            [TaskCategories.INTERPERSONAL]: 0.002 * pace,           // Hardest to automate
            [TaskCategories.CREATIVE]: 0.006 * pace                 // Generative AI
        };

        Object.keys(this.taskCapabilities).forEach(category => {
            const rate = advanceRates[category] || 0.004;
            this.taskCapabilities[category] = Math.min(0.95, this.taskCapabilities[category] + rate);
        });
    }

    _recordBreakthrough(month, impact) {
        this.breakthroughs.push({
            month,
            impact,
            type: 'scheduled'
        });
    }

    _generateBreakthrough(month) {
        // Random breakthrough affects specific capability
        const categories = Object.keys(this.taskCapabilities);
        const affectedCategory = categories[Math.floor(Math.random() * categories.length)];

        const impact = 0.05 + Math.random() * 0.1;
        this.taskCapabilities[affectedCategory] = Math.min(0.95,
            this.taskCapabilities[affectedCategory] + impact
        );

        this.breakthroughs.push({
            month,
            impact,
            category: affectedCategory,
            type: 'random',
            description: `Breakthrough in ${affectedCategory.replace('_', ' ')} automation`
        });

        return this.breakthroughs[this.breakthroughs.length - 1];
    }

    // ========== Exposure Calculations ==========

    /**
     * Get automation exposure for a specific occupation
     */
    getOccupationExposure(occupation) {
        // Check cache
        if (this.occupationExposure[occupation] !== undefined) {
            return this.occupationExposure[occupation] * this.currentLevel;
        }

        // Get occupation data or generate
        const occData = OCCUPATION_AUTOMATION_DATA[occupation];

        let baseExposure;
        if (occData) {
            baseExposure = occData.exposure;
        } else {
            // Generate exposure for unknown occupation based on ID pattern
            // Higher IDs tend to be newer, potentially AI-related jobs
            const idNormalized = (occupation % 100) / 100;
            baseExposure = 0.3 + Math.random() * 0.4;

            // Some randomness based on occupation ID
            if (occupation > 80) {
                baseExposure *= 0.7; // Newer jobs less automatable
            }
        }

        // Cache the result
        this.occupationExposure[occupation] = baseExposure;

        // Return current effective exposure (base * current AI level)
        return baseExposure * this.currentLevel;
    }

    /**
     * Get industry-level automation metrics
     */
    getIndustryAutomation(industry) {
        const indData = INDUSTRY_AUTOMATION[industry];

        if (!indData) {
            return {
                potential: 0.5,
                currentExposure: 0.5 * this.currentLevel,
                adoptionSpeed: 'moderate'
            };
        }

        // Apply adoption speed modifier
        const speedModifiers = {
            slow: 0.7,
            moderate: 1.0,
            fast: 1.3
        };

        const modifier = speedModifiers[indData.aiAdoptionSpeed] || 1.0;

        return {
            name: indData.name,
            potential: indData.potential,
            currentExposure: indData.potential * this.currentLevel * modifier,
            adoptionSpeed: indData.aiAdoptionSpeed
        };
    }

    /**
     * Calculate task-weighted exposure for a worker
     */
    getWorkerExposure(worker) {
        // Base occupation exposure
        let exposure = this.getOccupationExposure(worker.occupation);

        // Adjust for AI augmentation skill (higher skill = lower risk)
        const skillMitigation = (worker.aiAugmentationSkill || 0) * 0.3;
        exposure = exposure * (1 - skillMitigation);

        // Adjust for education (higher education = more adaptable)
        const eduMitigation = this._getEducationMitigation(worker.education);
        exposure = exposure * (1 - eduMitigation);

        // Age factor (older workers may face more displacement)
        if (worker.age > 50) {
            exposure *= 1.1;
        }

        return Math.min(1, Math.max(0, exposure));
    }

    _getEducationMitigation(education) {
        const mitigations = {
            'no_degree': 0.0,
            'high_school': 0.05,
            'some_college': 0.10,
            'bachelors': 0.15,
            'advanced': 0.20
        };

        return mitigations[education] || 0.05;
    }

    /**
     * Determine if a task can be cost-effectively automated
     */
    canAutomate(taskCategory, wage) {
        // AI capability for this task type
        const capability = this.taskCapabilities[taskCategory] || 0.3;

        // Base automation cost (decreases as AI advances)
        const automationCost = 3000 / (capability + 0.1); // Simplified cost model

        // Can automate if AI is capable enough AND cost-effective
        return capability >= this.costThreshold && automationCost < wage;
    }

    /**
     * Calculate augmentation potential (AI helping, not replacing)
     */
    getAugmentationPotential(occupation) {
        const exposure = this.getOccupationExposure(occupation);

        // Mid-exposure jobs often have highest augmentation potential
        // Too high = replacement, too low = limited AI applicability
        if (exposure > 0.7) {
            return 0.3; // High exposure = mostly replacement
        } else if (exposure < 0.2) {
            return 0.4; // Low exposure = limited AI benefit
        } else {
            return 0.7; // Sweet spot for augmentation
        }
    }

    // ========== Analysis Methods ==========

    /**
     * Get jobs at high risk in current state
     */
    getHighRiskOccupations(threshold = 0.5) {
        const highRisk = [];

        Object.entries(OCCUPATION_AUTOMATION_DATA).forEach(([id, data]) => {
            const currentExposure = data.exposure * this.currentLevel;
            if (currentExposure >= threshold) {
                highRisk.push({
                    id: parseInt(id),
                    name: data.name,
                    exposure: currentExposure,
                    category: data.category
                });
            }
        });

        return highRisk.sort((a, b) => b.exposure - a.exposure);
    }

    /**
     * Get industries by automation risk
     */
    getIndustryRiskRanking() {
        const rankings = [];

        Object.entries(INDUSTRY_AUTOMATION).forEach(([id, data]) => {
            const metrics = this.getIndustryAutomation(parseInt(id));
            rankings.push({
                id: parseInt(id),
                ...data,
                currentExposure: metrics.currentExposure
            });
        });

        return rankings.sort((a, b) => b.currentExposure - a.currentExposure);
    }

    /**
     * Estimate jobs at risk
     */
    estimateJobsAtRisk(workers, threshold = 0.5) {
        let atRisk = 0;
        let highRisk = 0;

        workers.forEach(worker => {
            if (worker.status !== 'employed') return;

            const exposure = this.getWorkerExposure(worker);

            if (exposure >= threshold) {
                atRisk++;
            }
            if (exposure >= 0.7) {
                highRisk++;
            }
        });

        return {
            atRisk,
            highRisk,
            atRiskPercent: workers.length > 0 ? (atRisk / workers.length * 100).toFixed(1) : 0,
            highRiskPercent: workers.length > 0 ? (highRisk / workers.length * 100).toFixed(1) : 0
        };
    }

    /**
     * Project future capability levels
     */
    projectCapabilities(monthsAhead) {
        const projections = [];
        let projectedLevel = this.currentLevel;

        for (let m = 1; m <= monthsAhead; m++) {
            // Simplified projection using current curve
            switch (this.adoptionCurve) {
                case 'linear':
                    projectedLevel += 0.005;
                    break;
                case 'exponential':
                    projectedLevel *= 1.01;
                    break;
                case 's_curve':
                default:
                    const currentMonth = this.history.length + m;
                    const growth = 0.015 / (1 + Math.exp(-0.05 * (currentMonth - 60)));
                    projectedLevel += growth;
                    break;
            }

            projectedLevel = Math.min(0.95, projectedLevel);

            if (m % 12 === 0) {
                projections.push({
                    month: m,
                    year: Math.floor(m / 12),
                    level: projectedLevel
                });
            }
        }

        return projections;
    }

    // ========== Getters ==========

    getCurrentLevel() {
        return this.currentLevel;
    }

    getTaskCapabilities() {
        return { ...this.taskCapabilities };
    }

    getBreakthroughs() {
        return [...this.breakthroughs];
    }

    getSummary() {
        return {
            currentLevel: this.currentLevel,
            adoptionCurve: this.adoptionCurve,
            automationPace: this.automationPace,
            taskCapabilities: this.getTaskCapabilities(),
            breakthroughCount: this.breakthroughs.length,
            monthsSimulated: this.history.length,
            highRiskOccupations: this.getHighRiskOccupations(0.5).length
        };
    }
}

// Export for ES modules
export { AICapabilityFrontier, TaskCategories, OCCUPATION_AUTOMATION_DATA, INDUSTRY_AUTOMATION };

// Also export to window for backwards compatibility with script tags
if (typeof window !== 'undefined') {
    window.AICapabilityFrontier = AICapabilityFrontier;
    window.TaskCategories = TaskCategories;
    window.OCCUPATION_AUTOMATION_DATA = OCCUPATION_AUTOMATION_DATA;
    window.INDUSTRY_AUTOMATION = INDUSTRY_AUTOMATION;
}
