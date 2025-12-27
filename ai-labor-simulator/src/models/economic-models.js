/**
 * Advanced Economic Models Module
 * Implements academic economic models for labor market simulation
 * 
 * Models included:
 * - Solow Growth Model with AI Capital
 * - Task-Based Labor Demand (Acemoglu & Restrepo)
 * - Skill-Biased Technological Change
 */

/**
 * Solow Growth Model with AI Capital Dynamics
 * 
 * Extended Solow-Swan model treating AI as a distinct capital type:
 * Y = A * K^α * K_AI^β * L^(1-α-β)
 * 
 * Where:
 * - Y = Output (GDP)
 * - A = Total Factor Productivity
 * - K = Physical capital
 * - K_AI = AI capital (software, algorithms, data)
 * - L = Labor
 * - α = Physical capital share (~0.30)
 * - β = AI capital share (growing, currently ~0.05-0.15)
 */
class SolowGrowthModel {
    constructor(params = {}) {
        // Default parameters calibrated to US economy
        this.alpha = params.alpha || 0.30;           // Physical capital share
        this.beta = params.beta || 0.08;             // AI capital share (growing)
        this.depreciation = params.depreciation || 0.05;  // Capital depreciation rate
        this.savingsRate = params.savingsRate || 0.22;    // Gross savings rate
        this.populationGrowth = params.populationGrowth || 0.005;  // Annual population growth
        this.techGrowth = params.techGrowth || 0.015;     // TFP growth rate (Solow residual)
        this.aiCapitalGrowth = params.aiCapitalGrowth || 0.15;  // AI investment growth rate
    }

    /**
     * Calculate total output using extended Cobb-Douglas production function
     */
    calculateOutput(params) {
        const {
            tfp = 1.0,
            physicalCapital,
            aiCapital,
            labor,
            alpha = this.alpha,
            beta = this.beta
        } = params;

        // Y = A * K^α * K_AI^β * L^(1-α-β)
        const laborShare = 1 - alpha - beta;
        return tfp *
            Math.pow(physicalCapital, alpha) *
            Math.pow(aiCapital, beta) *
            Math.pow(labor, laborShare);
    }

    /**
     * Calculate output per worker (labor productivity)
     */
    calculateProductivity(params) {
        const output = this.calculateOutput(params);
        return output / params.labor;
    }

    /**
     * Calculate steady-state capital-labor ratio
     * k* = (s / (δ + n + g))^(1/(1-α-β))
     */
    calculateSteadyState(params = {}) {
        const {
            savingsRate = this.savingsRate,
            depreciation = this.depreciation,
            populationGrowth = this.populationGrowth,
            techGrowth = this.techGrowth,
            alpha = this.alpha,
            beta = this.beta
        } = params;

        const denominator = depreciation + populationGrowth + techGrowth;
        const exponent = 1 / (1 - alpha - beta);

        return Math.pow(savingsRate / denominator, exponent);
    }

    /**
     * Calculate marginal product of labor (determines wages in competitive market)
     * MPL = (1-α-β) * Y/L
     */
    calculateMarginalProductLabor(output, labor) {
        const laborShare = 1 - this.alpha - this.beta;
        return laborShare * (output / labor);
    }

    /**
     * Calculate marginal product of AI capital (return on AI investment)
     * MPK_AI = β * Y/K_AI
     */
    calculateMarginalProductAI(output, aiCapital) {
        return this.beta * (output / aiCapital);
    }

    /**
     * Project capital accumulation over time
     * K(t+1) = (1-δ)K(t) + sY(t)
     */
    projectCapitalAccumulation(initialCapital, output, periods = 1) {
        let capital = initialCapital;
        const trajectory = [capital];

        for (let t = 0; t < periods; t++) {
            const investment = this.savingsRate * output;
            const depreciated = this.depreciation * capital;
            capital = capital - depreciated + investment;
            trajectory.push(capital);

            // Update output for next period (simplified)
            output *= (1 + this.techGrowth);
        }

        return trajectory;
    }

    /**
     * Calculate labor share of income
     * Labor share = (1 - α - β)
     */
    getLaborShare() {
        return 1 - this.alpha - this.beta;
    }

    /**
     * Update AI capital share based on adoption rate
     * As AI adoption increases, β grows (empirically observed)
     */
    updateAICapitalShare(aiAdoptionRate) {
        // AI capital share grows with adoption, capped at ~0.25
        const baseShare = 0.03;
        const maxShare = 0.25;
        const growth = aiAdoptionRate / 100 * 0.2;

        this.beta = Math.min(maxShare, baseShare + growth);
        return this.beta;
    }
}


/**
 * Task-Based Labor Demand Model (Acemoglu & Restrepo Framework)
 * 
 * Key concepts:
 * - Jobs are bundles of tasks, not atomic units
 * - AI automates specific task types, not entire occupations
 * - Displacement effect: AI replaces human tasks
 * - Reinstatement effect: new tasks emerge for humans
 * - Net effect depends on relative strength of these forces
 */
class TaskBasedLaborModel {
    constructor() {
        // Task composition categories
        this.taskTypes = {
            routine_cognitive: {
                name: 'Routine Cognitive',
                description: 'Repetitive information processing (data entry, bookkeeping)',
                aiExposure: 0.85,
                share: 0.20
            },
            routine_manual: {
                name: 'Routine Manual',
                description: 'Repetitive physical tasks (assembly, packaging)',
                aiExposure: 0.70,
                share: 0.15
            },
            nonroutine_cognitive_analytical: {
                name: 'Non-Routine Analytical',
                description: 'Complex problem solving, analysis',
                aiExposure: 0.45,  // Increasing with LLMs
                share: 0.20
            },
            nonroutine_cognitive_interpersonal: {
                name: 'Non-Routine Interpersonal',
                description: 'Management, negotiation, teaching',
                aiExposure: 0.25,
                share: 0.20
            },
            nonroutine_manual: {
                name: 'Non-Routine Manual',
                description: 'Complex physical tasks requiring adaptability',
                aiExposure: 0.30,
                share: 0.15
            },
            creative: {
                name: 'Creative',
                description: 'Innovation, artistic creation, novel problem solving',
                aiExposure: 0.20,  // AI can augment but not fully replace
                share: 0.10
            }
        };

        // Sector task compositions (sum to 1 for each sector)
        this.sectorTaskComposition = {
            technology: {
                routine_cognitive: 0.10,
                routine_manual: 0.02,
                nonroutine_cognitive_analytical: 0.45,
                nonroutine_cognitive_interpersonal: 0.20,
                nonroutine_manual: 0.03,
                creative: 0.20
            },
            healthcare: {
                routine_cognitive: 0.15,
                routine_manual: 0.10,
                nonroutine_cognitive_analytical: 0.25,
                nonroutine_cognitive_interpersonal: 0.35,
                nonroutine_manual: 0.10,
                creative: 0.05
            },
            manufacturing: {
                routine_cognitive: 0.15,
                routine_manual: 0.40,
                nonroutine_cognitive_analytical: 0.15,
                nonroutine_cognitive_interpersonal: 0.10,
                nonroutine_manual: 0.15,
                creative: 0.05
            },
            retail: {
                routine_cognitive: 0.30,
                routine_manual: 0.20,
                nonroutine_cognitive_analytical: 0.10,
                nonroutine_cognitive_interpersonal: 0.30,
                nonroutine_manual: 0.05,
                creative: 0.05
            },
            finance: {
                routine_cognitive: 0.25,
                routine_manual: 0.02,
                nonroutine_cognitive_analytical: 0.35,
                nonroutine_cognitive_interpersonal: 0.25,
                nonroutine_manual: 0.03,
                creative: 0.10
            },
            education: {
                routine_cognitive: 0.15,
                routine_manual: 0.05,
                nonroutine_cognitive_analytical: 0.25,
                nonroutine_cognitive_interpersonal: 0.40,
                nonroutine_manual: 0.05,
                creative: 0.10
            },
            transportation: {
                routine_cognitive: 0.15,
                routine_manual: 0.35,
                nonroutine_cognitive_analytical: 0.10,
                nonroutine_cognitive_interpersonal: 0.15,
                nonroutine_manual: 0.20,
                creative: 0.05
            },
            professional_services: {
                routine_cognitive: 0.20,
                routine_manual: 0.05,
                nonroutine_cognitive_analytical: 0.35,
                nonroutine_cognitive_interpersonal: 0.25,
                nonroutine_manual: 0.05,
                creative: 0.10
            }
        };

        // Task reinstatement rate (new tasks created per displaced task)
        this.reinstatementRate = 0.4;  // Historical average ~0.3-0.5
    }

    /**
     * Calculate displacement effect for a sector
     * Returns fraction of jobs affected by task automation
     */
    calculateDisplacementEffect(sector, aiAdoptionRate, automationPace = 1.0) {
        const composition = this.sectorTaskComposition[sector] || this.sectorTaskComposition.retail;

        let totalDisplacement = 0;
        const taskImpacts = {};

        for (const [taskType, share] of Object.entries(composition)) {
            const taskInfo = this.taskTypes[taskType];
            // Displacement = task share × AI exposure × adoption rate × pace
            const displacement = share * taskInfo.aiExposure * (aiAdoptionRate / 100) * automationPace;
            taskImpacts[taskType] = {
                share,
                exposure: taskInfo.aiExposure,
                displacement
            };
            totalDisplacement += displacement;
        }

        return {
            totalDisplacement,
            taskImpacts,
            // Not all displaced tasks mean job loss - partial automation
            effectiveJobLoss: totalDisplacement * 0.6  // ~60% of task displacement translates to job loss
        };
    }

    /**
     * Calculate reinstatement effect (new tasks created for humans)
     * Based on Acemoglu & Restrepo's empirical findings
     */
    calculateReinstatementEffect(sector, aiAdoptionRate, productivityGrowth) {
        const composition = this.sectorTaskComposition[sector] || this.sectorTaskComposition.retail;

        // New task creation is driven by:
        // 1. Productivity growth (more output = new needs)
        // 2. AI adoption (creates complementary tasks)
        // 3. Sector's creative/interpersonal task concentration

        const creativeShare = (composition.creative || 0) +
            (composition.nonroutine_cognitive_interpersonal || 0) * 0.5;

        const baseReinstatement = this.reinstatementRate * (aiAdoptionRate / 100);
        const productivityBonus = productivityGrowth * 0.02;
        const sectorBonus = creativeShare * 0.1;

        return {
            totalReinstatement: baseReinstatement + productivityBonus + sectorBonus,
            newTaskCategories: {
                'AI supervision': baseReinstatement * 0.3,
                'Human-AI collaboration': baseReinstatement * 0.25,
                'Creative expansion': sectorBonus * 0.5,
                'Service quality': baseReinstatement * 0.25,
                'New products/services': productivityBonus
            }
        };
    }

    /**
     * Calculate net labor impact using task-based framework
     */
    calculateNetImpact(sector, aiAdoptionRate, productivityGrowth, automationPace = 1.0) {
        const displacement = this.calculateDisplacementEffect(sector, aiAdoptionRate, automationPace);
        const reinstatement = this.calculateReinstatementEffect(sector, aiAdoptionRate, productivityGrowth);

        const netChange = reinstatement.totalReinstatement - displacement.effectiveJobLoss;

        return {
            displacement,
            reinstatement,
            netChange,
            // Job polarization indicator: middle-skill routine jobs most affected
            polarizationRisk: this.calculatePolarizationRisk(displacement.taskImpacts)
        };
    }

    /**
     * Calculate job polarization risk
     * High risk when routine cognitive/manual tasks are heavily displaced
     */
    calculatePolarizationRisk(taskImpacts) {
        const routineDisplacement =
            (taskImpacts.routine_cognitive?.displacement || 0) +
            (taskImpacts.routine_manual?.displacement || 0);

        const nonRoutineDisplacement =
            (taskImpacts.nonroutine_cognitive_analytical?.displacement || 0) +
            (taskImpacts.nonroutine_cognitive_interpersonal?.displacement || 0) +
            (taskImpacts.creative?.displacement || 0);

        // Polarization = routine jobs disappearing faster than non-routine
        const polarizationIndex = routineDisplacement / (nonRoutineDisplacement + 0.01);

        if (polarizationIndex > 3) return 'high';
        if (polarizationIndex > 1.5) return 'medium';
        return 'low';
    }

    /**
     * Get task composition for visualization
     */
    getSectorTaskBreakdown(sector) {
        const composition = this.sectorTaskComposition[sector];
        if (!composition) return null;

        return Object.entries(composition).map(([taskType, share]) => ({
            taskType,
            taskName: this.taskTypes[taskType].name,
            share,
            aiExposure: this.taskTypes[taskType].aiExposure
        }));
    }
}


/**
 * Skill-Biased Technological Change (SBTC) Model
 * 
 * Models differential impact of technology on skill groups:
 * - High-skill: Complemented by AI, wage premium increases
 * - Mid-skill: "Hollowing out" effect, routine jobs displaced
 * - Low-skill: Mixed - some tasks automated, others protected by economics
 */
class SkillBiasedTechModel {
    constructor() {
        // Skill group definitions with AI interaction effects
        this.skillGroups = {
            high: {
                name: 'High-Skill',
                description: 'Advanced degree, specialized knowledge',
                shareOfWorkforce: 0.30,
                avgWage: 45.00,  // Hourly
                aiComplementarity: 0.7,  // AI augments productivity
                aiSubstitutability: 0.2,  // Some tasks can be automated
                wageElasticity: 0.3      // Wage response to productivity
            },
            mid: {
                name: 'Mid-Skill',
                description: 'Some college, vocational training',
                shareOfWorkforce: 0.40,
                avgWage: 25.00,
                aiComplementarity: 0.3,
                aiSubstitutability: 0.6,  // Many routine tasks automatable
                wageElasticity: 0.5
            },
            low: {
                name: 'Low-Skill',
                description: 'High school or less',
                shareOfWorkforce: 0.30,
                avgWage: 15.00,
                aiComplementarity: 0.2,
                aiSubstitutability: 0.4,  // Some tasks, but many require physical presence
                wageElasticity: 0.6
            }
        };

        // Skill transition probabilities (upskilling/reskilling)
        this.transitionRates = {
            lowToMid: 0.05,   // 5% annually with intervention
            midToHigh: 0.03, // 3% annually
            highToMid: 0.01, // Rare downgrading
            midToLow: 0.02   // Job loss without reskilling
        };
    }

    /**
     * Calculate skill premium changes from AI adoption
     */
    calculateSkillPremiums(aiAdoptionRate, productivityGrowth = 0.02) {
        const adoptionFactor = aiAdoptionRate / 100;

        // High-skill premium = complementarity effect - substitution effect
        const highSkillEffect =
            this.skillGroups.high.aiComplementarity * adoptionFactor * productivityGrowth -
            this.skillGroups.high.aiSubstitutability * adoptionFactor * 0.01;

        // Mid-skill effect: primarily negative (hollowing out)
        const midSkillEffect =
            this.skillGroups.mid.aiComplementarity * adoptionFactor * productivityGrowth -
            this.skillGroups.mid.aiSubstitutability * adoptionFactor * 0.015;

        // Low-skill effect: mixed
        const lowSkillEffect =
            this.skillGroups.low.aiComplementarity * adoptionFactor * productivityGrowth -
            this.skillGroups.low.aiSubstitutability * adoptionFactor * 0.01;

        return {
            high: {
                wageChange: highSkillEffect * this.skillGroups.high.wageElasticity,
                employmentChange: adoptionFactor * 0.02,  // Net positive
                premiumVsMedian: 1 + highSkillEffect
            },
            mid: {
                wageChange: midSkillEffect * this.skillGroups.mid.wageElasticity,
                employmentChange: -adoptionFactor * 0.03,  // Negative
                premiumVsMedian: 1 + midSkillEffect
            },
            low: {
                wageChange: lowSkillEffect * this.skillGroups.low.wageElasticity,
                employmentChange: -adoptionFactor * 0.01,  // Slight negative
                premiumVsMedian: 1 + lowSkillEffect
            }
        };
    }

    /**
     * Calculate employment by skill group
     */
    calculateEmploymentBySkill(totalEmployment, aiAdoptionRate) {
        const premiums = this.calculateSkillPremiums(aiAdoptionRate);

        return {
            high: {
                employment: totalEmployment * this.skillGroups.high.shareOfWorkforce *
                    (1 + premiums.high.employmentChange),
                share: this.skillGroups.high.shareOfWorkforce * (1 + premiums.high.employmentChange),
                avgWage: this.skillGroups.high.avgWage * (1 + premiums.high.wageChange)
            },
            mid: {
                employment: totalEmployment * this.skillGroups.mid.shareOfWorkforce *
                    (1 + premiums.mid.employmentChange),
                share: this.skillGroups.mid.shareOfWorkforce * (1 + premiums.mid.employmentChange),
                avgWage: this.skillGroups.mid.avgWage * (1 + premiums.mid.wageChange)
            },
            low: {
                employment: totalEmployment * this.skillGroups.low.shareOfWorkforce *
                    (1 + premiums.low.employmentChange),
                share: this.skillGroups.low.shareOfWorkforce * (1 + premiums.low.employmentChange),
                avgWage: this.skillGroups.low.avgWage * (1 + premiums.low.wageChange)
            }
        };
    }

    /**
     * Calculate wage inequality metrics
     */
    calculateInequalityMetrics(skillEmployment) {
        const highWage = skillEmployment.high.avgWage;
        const midWage = skillEmployment.mid.avgWage;
        const lowWage = skillEmployment.low.avgWage;

        return {
            // 90/10 ratio approximation
            wageRatio90_10: highWage / lowWage,
            // 90/50 ratio (upper inequality)
            wageRatio90_50: highWage / midWage,
            // 50/10 ratio (lower inequality)
            wageRatio50_10: midWage / lowWage,
            // Skill premium (high vs. average)
            skillPremium: highWage / ((highWage + midWage + lowWage) / 3),
            // Polarization index
            polarizationIndex: (skillEmployment.high.share + skillEmployment.low.share) /
                skillEmployment.mid.share
        };
    }

    /**
     * Model skill transition dynamics
     */
    calculateSkillTransitions(currentDistribution, interventionStrength = 1.0) {
        const { high, mid, low } = currentDistribution;

        // Adjusted transition rates based on intervention (e.g., retraining programs)
        const adjLowToMid = this.transitionRates.lowToMid * interventionStrength;
        const adjMidToHigh = this.transitionRates.midToHigh * interventionStrength;

        // Calculate flows
        const lowToMidFlow = low * adjLowToMid;
        const midToHighFlow = mid * adjMidToHigh;
        const midToLowFlow = mid * this.transitionRates.midToLow;
        const highToMidFlow = high * this.transitionRates.highToMid;

        return {
            newDistribution: {
                high: high + midToHighFlow - highToMidFlow,
                mid: mid + lowToMidFlow + highToMidFlow - midToHighFlow - midToLowFlow,
                low: low + midToLowFlow - lowToMidFlow
            },
            flows: {
                upward: lowToMidFlow + midToHighFlow,
                downward: midToLowFlow + highToMidFlow,
                netUpward: (lowToMidFlow + midToHighFlow) - (midToLowFlow + highToMidFlow)
            }
        };
    }

    /**
     * Calculate intervention effect on skill distribution
     */
    applyInterventionEffect(distribution, interventionType, strength) {
        const effects = {
            job_retraining: { lowToMid: 1.5, midToHigh: 1.2 },
            education_subsidy: { lowToMid: 1.3, midToHigh: 1.5 },
            public_private_retraining: { lowToMid: 1.8, midToHigh: 1.4 },
            skills_based_immigration: { midToHigh: 0.9, highInflow: 1.2 }  // Immigration affects supply
        };

        const effect = effects[interventionType] || { lowToMid: 1.0, midToHigh: 1.0 };

        return this.calculateSkillTransitions(distribution, strength * effect.lowToMid);
    }
}


/**
 * Integrated Economic Model Manager
 * Coordinates the three models for simulation use
 */
class EconomicModelManager {
    constructor() {
        this.solowModel = new SolowGrowthModel();
        this.taskModel = new TaskBasedLaborModel();
        this.sbtcModel = new SkillBiasedTechModel();
    }

    /**
     * Calculate comprehensive labor market impact
     */
    calculateComprehensiveImpact(params) {
        const {
            sector,
            aiAdoptionRate,
            totalEmployment,
            productivityGrowth,
            automationPace = 1.0
        } = params;

        // Task-based displacement and reinstatement
        const taskImpact = this.taskModel.calculateNetImpact(
            sector,
            aiAdoptionRate,
            productivityGrowth,
            automationPace
        );

        // Skill-biased effects
        const skillPremiums = this.sbtcModel.calculateSkillPremiums(aiAdoptionRate, productivityGrowth);
        const skillEmployment = this.sbtcModel.calculateEmploymentBySkill(totalEmployment, aiAdoptionRate);
        const inequalityMetrics = this.sbtcModel.calculateInequalityMetrics(skillEmployment);

        // Solow model updates
        this.solowModel.updateAICapitalShare(aiAdoptionRate);
        const laborShare = this.solowModel.getLaborShare();

        return {
            taskBased: taskImpact,
            skillBiased: {
                premiums: skillPremiums,
                employment: skillEmployment,
                inequality: inequalityMetrics
            },
            macroeconomic: {
                laborShare,
                aiCapitalShare: this.solowModel.beta,
                physicalCapitalShare: this.solowModel.alpha
            }
        };
    }

    /**
     * Get enhanced sector exposure using task-based model
     */
    getEnhancedSectorExposure(sector, aiAdoptionRate) {
        const taskBreakdown = this.taskModel.getSectorTaskBreakdown(sector);
        const displacement = this.taskModel.calculateDisplacementEffect(sector, aiAdoptionRate);

        return {
            taskBreakdown,
            displacement,
            riskLevel: displacement.effectiveJobLoss > 0.1 ? 'high' :
                displacement.effectiveJobLoss > 0.05 ? 'medium' : 'low'
        };
    }
}


// Export all models
export {
    SolowGrowthModel,
    TaskBasedLaborModel,
    SkillBiasedTechModel,
    EconomicModelManager
};

// Also export to window for backwards compatibility
if (typeof window !== 'undefined') {
    window.SolowGrowthModel = SolowGrowthModel;
    window.TaskBasedLaborModel = TaskBasedLaborModel;
    window.SkillBiasedTechModel = SkillBiasedTechModel;
    window.EconomicModelManager = EconomicModelManager;
}
