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
 * Regional Labor Market Model
 * 
 * Models geographic variations in AI impact:
 * - Different regions have varying industry concentrations
 * - Labor mobility between regions
 * - Regional cost of living affects wage dynamics
 * - Tech hub effects on AI adoption speed
 */
class RegionalLaborMarketModel {
    constructor() {
        // US Census regions with economic characteristics
        this.regions = {
            northeast: {
                name: 'Northeast',
                states: ['CT', 'ME', 'MA', 'NH', 'RI', 'VT', 'NJ', 'NY', 'PA'],
                population: 56000000,
                employmentShare: 0.17,
                avgWageMultiplier: 1.20,  // 20% above national average
                costOfLiving: 1.25,
                techConcentration: 0.85,  // Moderate tech presence
                aiAdoptionSpeed: 1.1,     // 10% faster adoption
                sectorConcentration: {
                    finance: 1.5,
                    healthcare: 1.2,
                    education: 1.3,
                    technology: 1.1,
                    manufacturing: 0.7,
                    retail: 0.9,
                    transportation: 1.0,
                    professional_services: 1.3
                }
            },
            midwest: {
                name: 'Midwest',
                states: ['IL', 'IN', 'MI', 'OH', 'WI', 'IA', 'KS', 'MN', 'MO', 'NE', 'ND', 'SD'],
                population: 68000000,
                employmentShare: 0.21,
                avgWageMultiplier: 0.95,
                costOfLiving: 0.90,
                techConcentration: 0.50,
                aiAdoptionSpeed: 0.9,
                sectorConcentration: {
                    finance: 0.8,
                    healthcare: 1.0,
                    education: 1.0,
                    technology: 0.6,
                    manufacturing: 1.6,
                    retail: 1.0,
                    transportation: 1.2,
                    professional_services: 0.8
                }
            },
            south: {
                name: 'South',
                states: ['DE', 'FL', 'GA', 'MD', 'NC', 'SC', 'VA', 'WV', 'AL', 'KY', 'MS', 'TN', 'AR', 'LA', 'OK', 'TX'],
                population: 125000000,
                employmentShare: 0.38,
                avgWageMultiplier: 0.92,
                costOfLiving: 0.92,
                techConcentration: 0.70,
                aiAdoptionSpeed: 1.0,
                sectorConcentration: {
                    finance: 0.9,
                    healthcare: 1.1,
                    education: 0.9,
                    technology: 1.0,
                    manufacturing: 1.1,
                    retail: 1.1,
                    transportation: 1.1,
                    professional_services: 0.9
                }
            },
            west: {
                name: 'West',
                states: ['AZ', 'CO', 'ID', 'MT', 'NV', 'NM', 'UT', 'WY', 'AK', 'CA', 'HI', 'OR', 'WA'],
                population: 78000000,
                employmentShare: 0.24,
                avgWageMultiplier: 1.15,
                costOfLiving: 1.20,
                techConcentration: 1.40,  // High tech concentration (Silicon Valley, Seattle)
                aiAdoptionSpeed: 1.3,     // Fastest adoption
                sectorConcentration: {
                    finance: 0.9,
                    healthcare: 1.0,
                    education: 1.0,
                    technology: 1.8,
                    manufacturing: 0.8,
                    retail: 1.0,
                    transportation: 0.9,
                    professional_services: 1.2
                }
            }
        };

        // Labor mobility parameters
        this.mobilityParameters = {
            baseMobilityRate: 0.02,      // 2% annual inter-regional migration
            wageDifferentialSensitivity: 0.3,  // Migration response to wage gaps
            employmentOpportunitySensitivity: 0.4,
            movingCostFactor: 0.5        // Friction reducing mobility
        };
    }

    /**
     * Calculate regional AI impact variations
     */
    calculateRegionalImpact(nationalImpact, region) {
        const regionData = this.regions[region];
        if (!regionData) return nationalImpact;

        // Adjust displacement based on sector concentration
        let adjustedDisplacement = 0;
        let adjustedNewJobs = 0;

        for (const [sector, concentration] of Object.entries(regionData.sectorConcentration)) {
            const sectorImpact = nationalImpact.sector_impacts?.[sector];
            if (sectorImpact) {
                adjustedDisplacement += sectorImpact.displaced * concentration;
                adjustedNewJobs += sectorImpact.new_jobs * concentration;
            }
        }

        // Apply AI adoption speed multiplier
        adjustedDisplacement *= regionData.aiAdoptionSpeed;
        adjustedNewJobs *= regionData.aiAdoptionSpeed * regionData.techConcentration;

        // Scale by regional employment share
        const scaleFactor = regionData.employmentShare;

        return {
            region: regionData.name,
            displaced: Math.round(adjustedDisplacement * scaleFactor),
            new_jobs: Math.round(adjustedNewJobs * scaleFactor),
            net_change: Math.round((adjustedNewJobs - adjustedDisplacement) * scaleFactor),
            wage_effect: nationalImpact.wage_pressure * regionData.avgWageMultiplier,
            adoption_rate_modifier: regionData.aiAdoptionSpeed,
            vulnerability_index: this.calculateVulnerabilityIndex(regionData)
        };
    }

    /**
     * Calculate all regional impacts
     */
    calculateAllRegionalImpacts(nationalImpact) {
        const regionalImpacts = {};

        for (const region of Object.keys(this.regions)) {
            regionalImpacts[region] = this.calculateRegionalImpact(nationalImpact, region);
        }

        return {
            regions: regionalImpacts,
            mostVulnerable: this.getMostVulnerableRegion(regionalImpacts),
            mostResilient: this.getMostResilientRegion(regionalImpacts),
            divergenceIndex: this.calculateDivergenceIndex(regionalImpacts)
        };
    }

    /**
     * Calculate regional vulnerability to AI displacement
     */
    calculateVulnerabilityIndex(regionData) {
        // High manufacturing + low tech + low education = high vulnerability
        const manufacturingRisk = (regionData.sectorConcentration.manufacturing || 1) * 0.3;
        const techBuffer = (1 / regionData.techConcentration) * 0.3;
        const mobilityFactor = (1 - this.mobilityParameters.baseMobilityRate) * 0.2;
        const costFactor = regionData.costOfLiving * 0.2;

        return Math.min(1, manufacturingRisk + techBuffer + mobilityFactor - (1 / costFactor));
    }

    /**
     * Calculate labor migration flows between regions
     */
    calculateMigrationFlows(regionalImpacts) {
        const flows = [];
        const regions = Object.keys(this.regions);

        for (let i = 0; i < regions.length; i++) {
            for (let j = i + 1; j < regions.length; j++) {
                const region1 = regions[i];
                const region2 = regions[j];

                const impact1 = regionalImpacts[region1];
                const impact2 = regionalImpacts[region2];

                // Calculate pull factors
                const wageDiff = (this.regions[region2].avgWageMultiplier -
                    this.regions[region1].avgWageMultiplier);
                const jobDiff = (impact2.net_change - impact1.net_change) / 1000000;

                // Net migration direction and magnitude
                const pullFactor = wageDiff * this.mobilityParameters.wageDifferentialSensitivity +
                    jobDiff * this.mobilityParameters.employmentOpportunitySensitivity;

                const migrationFlow = this.mobilityParameters.baseMobilityRate *
                    pullFactor *
                    (1 - this.mobilityParameters.movingCostFactor);

                flows.push({
                    from: migrationFlow > 0 ? region1 : region2,
                    to: migrationFlow > 0 ? region2 : region1,
                    magnitude: Math.abs(migrationFlow),
                    annualWorkers: Math.round(Math.abs(migrationFlow) *
                        this.regions[region1].population * 0.6 * 0.01)
                });
            }
        }

        return flows.sort((a, b) => b.magnitude - a.magnitude);
    }

    /**
     * Get most vulnerable region
     */
    getMostVulnerableRegion(regionalImpacts) {
        let mostVulnerable = null;
        let worstNetChange = Infinity;

        for (const [region, impact] of Object.entries(regionalImpacts)) {
            if (impact.net_change < worstNetChange) {
                worstNetChange = impact.net_change;
                mostVulnerable = { region, ...impact };
            }
        }

        return mostVulnerable;
    }

    /**
     * Get most resilient region
     */
    getMostResilientRegion(regionalImpacts) {
        let mostResilient = null;
        let bestNetChange = -Infinity;

        for (const [region, impact] of Object.entries(regionalImpacts)) {
            if (impact.net_change > bestNetChange) {
                bestNetChange = impact.net_change;
                mostResilient = { region, ...impact };
            }
        }

        return mostResilient;
    }

    /**
     * Calculate divergence between regions (inequality measure)
     */
    calculateDivergenceIndex(regionalImpacts) {
        const netChanges = Object.values(regionalImpacts).map(r => r.net_change);
        const max = Math.max(...netChanges);
        const min = Math.min(...netChanges);
        const avg = netChanges.reduce((a, b) => a + b, 0) / netChanges.length;

        return {
            range: max - min,
            coefficientOfVariation: this.standardDeviation(netChanges) / Math.abs(avg || 1),
            maxMinRatio: max !== 0 ? min / max : 0
        };
    }

    /**
     * Helper: Calculate standard deviation
     */
    standardDeviation(values) {
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        const squareDiffs = values.map(v => Math.pow(v - avg, 2));
        return Math.sqrt(squareDiffs.reduce((a, b) => a + b, 0) / values.length);
    }

    /**
     * Get region summary for display
     */
    getRegionSummary(region) {
        const data = this.regions[region];
        if (!data) return null;

        return {
            name: data.name,
            population: data.population,
            topSectors: Object.entries(data.sectorConcentration)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([sector, concentration]) => ({ sector, concentration })),
            aiReadiness: data.techConcentration * data.aiAdoptionSpeed,
            economicProfile: {
                wageLevel: data.avgWageMultiplier > 1 ? 'above_average' : 'below_average',
                costOfLiving: data.costOfLiving > 1 ? 'high' : 'low',
                techHub: data.techConcentration > 1 ? true : false
            }
        };
    }
}


/**
 * Sector Interdependency Model (Input-Output Framework)
 * 
 * Models how AI impacts ripple through the economy:
 * - Direct effects: AI adoption in a sector
 * - Indirect effects: Upstream supplier impacts
 * - Induced effects: Downstream customer impacts
 * - Based on Leontief input-output analysis
 */
class SectorInterdependencyModel {
    constructor() {
        // Simplified input-output matrix (how much each sector buys from others)
        // Values represent share of inputs from row sector to column sector
        this.inputOutputMatrix = {
            technology: {
                technology: 0.25,        // Tech buys from tech (software, cloud)
                manufacturing: 0.15,     // Hardware components
                professional_services: 0.20,
                finance: 0.10,
                retail: 0.05,
                transportation: 0.05,
                healthcare: 0.02,
                education: 0.03
            },
            manufacturing: {
                technology: 0.15,
                manufacturing: 0.30,     // Intermediate goods
                professional_services: 0.10,
                finance: 0.08,
                retail: 0.05,
                transportation: 0.15,
                healthcare: 0.02,
                education: 0.02
            },
            retail: {
                technology: 0.12,
                manufacturing: 0.25,
                professional_services: 0.08,
                finance: 0.08,
                retail: 0.10,
                transportation: 0.20,
                healthcare: 0.02,
                education: 0.02
            },
            finance: {
                technology: 0.25,
                manufacturing: 0.05,
                professional_services: 0.25,
                finance: 0.15,
                retail: 0.05,
                transportation: 0.03,
                healthcare: 0.05,
                education: 0.05
            },
            healthcare: {
                technology: 0.15,
                manufacturing: 0.20,     // Medical devices, pharma
                professional_services: 0.15,
                finance: 0.10,
                retail: 0.08,
                transportation: 0.05,
                healthcare: 0.15,
                education: 0.08
            },
            education: {
                technology: 0.20,
                manufacturing: 0.08,
                professional_services: 0.15,
                finance: 0.08,
                retail: 0.10,
                transportation: 0.05,
                healthcare: 0.05,
                education: 0.20
            },
            transportation: {
                technology: 0.12,
                manufacturing: 0.25,     // Vehicles, parts
                professional_services: 0.10,
                finance: 0.12,
                retail: 0.08,
                transportation: 0.15,
                healthcare: 0.03,
                education: 0.02
            },
            professional_services: {
                technology: 0.30,
                manufacturing: 0.05,
                professional_services: 0.25,
                finance: 0.15,
                retail: 0.05,
                transportation: 0.05,
                healthcare: 0.05,
                education: 0.08
            }
        };

        // Multiplier effects (total impact per unit of direct impact)
        this.multipliers = {
            technology: 2.1,           // High multiplier due to broad impact
            manufacturing: 2.4,        // Manufacturing has strongest backward linkages
            retail: 1.6,
            finance: 1.8,
            healthcare: 1.9,
            education: 1.5,
            transportation: 2.0,
            professional_services: 1.7
        };

        // Employment intensity (jobs per $1M output)
        this.employmentIntensity = {
            technology: 3.2,
            manufacturing: 4.5,
            retail: 8.5,
            finance: 2.8,
            healthcare: 9.2,
            education: 12.0,
            transportation: 5.5,
            professional_services: 4.0
        };
    }

    /**
     * Calculate ripple effects from a sector shock
     */
    calculateRippleEffects(sourceSector, directImpact) {
        const effects = {
            direct: {
                sector: sourceSector,
                employment_change: directImpact,
                gdp_impact: directImpact / (this.employmentIntensity[sourceSector] || 5)
            },
            indirect: [],
            induced: [],
            total: {
                employment_change: directImpact,
                gdp_impact: 0
            }
        };

        // Calculate indirect effects (upstream - suppliers affected)
        const inputShares = this.inputOutputMatrix[sourceSector] || {};

        for (const [supplierSector, share] of Object.entries(inputShares)) {
            if (supplierSector === sourceSector) continue;

            const indirectImpact = directImpact * share * 0.5;  // 50% transmission rate

            if (Math.abs(indirectImpact) > 100) {  // Only track meaningful impacts
                effects.indirect.push({
                    sector: supplierSector,
                    relationship: 'supplier',
                    employment_change: Math.round(indirectImpact),
                    transmission_rate: share
                });
                effects.total.employment_change += indirectImpact;
            }
        }

        // Calculate induced effects (downstream - customers affected)
        for (const [customerSector, customerInputs] of Object.entries(this.inputOutputMatrix)) {
            if (customerSector === sourceSector) continue;

            const purchaseShare = customerInputs[sourceSector] || 0;
            if (purchaseShare > 0) {
                const inducedImpact = directImpact * purchaseShare * 0.3;  // 30% downstream transmission

                if (Math.abs(inducedImpact) > 100) {
                    effects.induced.push({
                        sector: customerSector,
                        relationship: 'customer',
                        employment_change: Math.round(inducedImpact),
                        dependency: purchaseShare
                    });
                    effects.total.employment_change += inducedImpact;
                }
            }
        }

        // Apply multiplier for total impact
        const multiplier = this.multipliers[sourceSector] || 1.5;
        effects.total.employment_change = Math.round(effects.total.employment_change * multiplier);
        effects.total.gdp_impact = effects.total.employment_change /
            (this.employmentIntensity[sourceSector] || 5) * 1000000;
        effects.total.multiplier_used = multiplier;

        return effects;
    }

    /**
     * Calculate economy-wide interdependency effects
     */
    calculateEconomyWideEffects(sectorImpacts) {
        const economyEffects = {
            sectors: {},
            totalIndirect: 0,
            totalInduced: 0,
            cascadeRisk: 'low'
        };

        let totalNegativeImpact = 0;

        for (const [sector, impact] of Object.entries(sectorImpacts)) {
            const netChange = impact.net_change || 0;
            const rippleEffects = this.calculateRippleEffects(sector, netChange);

            economyEffects.sectors[sector] = {
                direct: netChange,
                indirect: rippleEffects.indirect.reduce((sum, e) => sum + e.employment_change, 0),
                induced: rippleEffects.induced.reduce((sum, e) => sum + e.employment_change, 0),
                total: rippleEffects.total.employment_change,
                multiplier: rippleEffects.total.multiplier_used
            };

            economyEffects.totalIndirect += economyEffects.sectors[sector].indirect;
            economyEffects.totalInduced += economyEffects.sectors[sector].induced;

            if (netChange < 0) {
                totalNegativeImpact += Math.abs(netChange);
            }
        }

        // Calculate cascade risk based on concentration of negative impacts
        const negativeImpactRatio = totalNegativeImpact /
            Math.abs(Object.values(sectorImpacts).reduce((sum, s) => sum + (s.net_change || 0), 0) || 1);

        if (negativeImpactRatio > 0.7 && economyEffects.totalIndirect < -100000) {
            economyEffects.cascadeRisk = 'high';
        } else if (negativeImpactRatio > 0.5 && economyEffects.totalIndirect < -50000) {
            economyEffects.cascadeRisk = 'medium';
        }

        return economyEffects;
    }

    /**
     * Get sector dependency analysis
     */
    getSectorDependencyAnalysis(sector) {
        const inputs = this.inputOutputMatrix[sector] || {};

        // Find which sectors depend most on this sector (forward linkages)
        const dependents = [];
        for (const [otherSector, otherInputs] of Object.entries(this.inputOutputMatrix)) {
            if (otherSector !== sector && otherInputs[sector]) {
                dependents.push({
                    sector: otherSector,
                    dependency: otherInputs[sector]
                });
            }
        }

        // Sort suppliers and dependents by importance
        const suppliers = Object.entries(inputs)
            .filter(([s, _]) => s !== sector)
            .map(([s, share]) => ({ sector: s, share }))
            .sort((a, b) => b.share - a.share);

        return {
            sector,
            topSuppliers: suppliers.slice(0, 3),
            topDependents: dependents.sort((a, b) => b.dependency - a.dependency).slice(0, 3),
            selfDependency: inputs[sector] || 0,
            multiplier: this.multipliers[sector] || 1.5,
            employmentIntensity: this.employmentIntensity[sector] || 5,
            backwardLinkages: Object.values(inputs).reduce((a, b) => a + b, 0),
            forwardLinkages: dependents.reduce((sum, d) => sum + d.dependency, 0)
        };
    }

    /**
     * Calculate supply chain vulnerability
     */
    calculateSupplyChainVulnerability(sectorExposures) {
        const vulnerabilities = {};

        for (const sector of Object.keys(this.inputOutputMatrix)) {
            const inputs = this.inputOutputMatrix[sector];
            let weightedExposure = 0;

            // Calculate exposure based on supplier vulnerabilities
            for (const [supplier, share] of Object.entries(inputs)) {
                const supplierExposure = sectorExposures[supplier]?.automation_exposure || 0.5;
                weightedExposure += share * supplierExposure;
            }

            vulnerabilities[sector] = {
                directExposure: sectorExposures[sector]?.automation_exposure || 0.5,
                supplyChainExposure: weightedExposure,
                totalVulnerability: (sectorExposures[sector]?.automation_exposure || 0.5) * 0.6 +
                    weightedExposure * 0.4,
                criticalDependencies: Object.entries(inputs)
                    .filter(([s, share]) => share > 0.15)
                    .map(([s, share]) => ({
                        sector: s,
                        share,
                        exposure: sectorExposures[s]?.automation_exposure || 0.5
                    }))
            };
        }

        return vulnerabilities;
    }
}


/**
 * Integrated Economic Model Manager
 * Coordinates all models for simulation use
 */
class EconomicModelManager {
    constructor() {
        this.solowModel = new SolowGrowthModel();
        this.taskModel = new TaskBasedLaborModel();
        this.sbtcModel = new SkillBiasedTechModel();
        this.regionalModel = new RegionalLaborMarketModel();
        this.interdependencyModel = new SectorInterdependencyModel();
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
     * Calculate full impact with regional and interdependency effects
     */
    calculateFullImpact(nationalImpact, sectorStates) {
        // Regional variations
        const regionalImpacts = this.regionalModel.calculateAllRegionalImpacts(nationalImpact);

        // Migration flows
        const migrationFlows = this.regionalModel.calculateMigrationFlows(regionalImpacts.regions);

        // Sector interdependencies
        const interdependencyEffects = this.interdependencyModel.calculateEconomyWideEffects(
            nationalImpact.sector_impacts || {}
        );

        // Supply chain vulnerabilities
        const supplyChainVulnerabilities = this.interdependencyModel.calculateSupplyChainVulnerability(
            sectorStates || {}
        );

        return {
            national: nationalImpact,
            regional: regionalImpacts,
            migration: migrationFlows,
            interdependencies: interdependencyEffects,
            supplyChain: supplyChainVulnerabilities
        };
    }

    /**
     * Get enhanced sector exposure using task-based model
     */
    getEnhancedSectorExposure(sector, aiAdoptionRate) {
        const taskBreakdown = this.taskModel.getSectorTaskBreakdown(sector);
        const displacement = this.taskModel.calculateDisplacementEffect(sector, aiAdoptionRate);
        const dependencies = this.interdependencyModel.getSectorDependencyAnalysis(sector);

        return {
            taskBreakdown,
            displacement,
            dependencies,
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
    RegionalLaborMarketModel,
    SectorInterdependencyModel,
    EconomicModelManager
};

// Also export to window for backwards compatibility
if (typeof window !== 'undefined') {
    window.SolowGrowthModel = SolowGrowthModel;
    window.TaskBasedLaborModel = TaskBasedLaborModel;
    window.SkillBiasedTechModel = SkillBiasedTechModel;
    window.RegionalLaborMarketModel = RegionalLaborMarketModel;
    window.SectorInterdependencyModel = SectorInterdependencyModel;
    window.EconomicModelManager = EconomicModelManager;
}

