/**
 * Labor Market Simulation Engine
 * Models AI impact scenarios on employment and economic indicators
 */

import { EconomicModelManager } from '../models/economic-models.js';

class SimulationEngine {
    constructor(economicData, indicators) {
        this.dataService = economicData;
        this.indicators = indicators;
        this.baselineSnapshot = null;
        this.currentScenario = null;
        this.results = [];

        // Initialize advanced economic models
        this.economicModels = new EconomicModelManager();
    }

    /**
     * Initialize engine with baseline data
     */
    async initialize() {
        this.baselineSnapshot = await this.dataService.getCurrentSnapshot();
        return this.baselineSnapshot;
    }

    /**
     * Create a simulation scenario
     */
    createScenario(config) {
        const scenario = {
            id: Date.now(),
            name: config.name || 'Unnamed Scenario',
            description: config.description || '',
            created: new Date().toISOString(),

            // Time parameters
            timeframe: {
                start_year: new Date().getFullYear(),
                end_year: config.end_year || new Date().getFullYear() + 5,
                steps_per_year: config.steps_per_year || 12
            },

            // Target conditions
            targets: {
                unemployment_rate: config.target_unemployment,
                ai_adoption_rate: config.ai_adoption_rate || 50,
                productivity_growth: config.productivity_growth || 3,
                automation_pace: config.automation_pace || 'moderate' // slow, moderate, fast, accelerating
            },

            // AI adoption curve parameters
            ai_parameters: {
                adoption_curve: config.adoption_curve || 's_curve', // linear, exponential, s_curve
                sector_variation: config.sector_variation !== false,
                displacement_lag: config.displacement_lag || 6, // months
                new_job_multiplier: config.new_job_multiplier || 0.3
            },

            // Economic parameters
            economic_parameters: {
                gdp_growth: config.gdp_growth || 2.0,
                inflation: config.inflation || 2.5,
                interest_rate: config.interest_rate || 4.0,
                labor_elasticity: config.labor_elasticity || -0.5
            },

            // Interventions (to be added later)
            interventions: []
        };

        this.currentScenario = scenario;
        return scenario;
    }

    /**
     * Run simulation for current scenario
     */
    async runSimulation() {
        if (!this.currentScenario) {
            throw new Error('No scenario configured');
        }

        if (!this.baselineSnapshot) {
            await this.initialize();
        }

        const scenario = this.currentScenario;
        const results = [];
        const years = scenario.timeframe.end_year - scenario.timeframe.start_year;
        const totalSteps = years * scenario.timeframe.steps_per_year;

        // Initialize state from baseline
        let state = this.initializeState();

        // Run simulation steps
        for (let step = 0; step <= totalSteps; step++) {
            const year = scenario.timeframe.start_year + (step / scenario.timeframe.steps_per_year);
            const progress = step / totalSteps;

            // Calculate AI adoption for this step
            const aiAdoption = this.calculateAIAdoption(progress, scenario);

            // Calculate labor market impacts
            const laborImpact = this.calculateLaborImpact(state, aiAdoption, scenario);

            // Apply interventions
            const interventionEffects = this.applyInterventions(state, laborImpact, scenario.interventions);

            // Update state
            state = this.updateState(state, laborImpact, interventionEffects);

            // Record result
            results.push({
                step,
                year: parseFloat(year.toFixed(2)),
                progress: parseFloat((progress * 100).toFixed(1)),
                ai_adoption: aiAdoption,
                labor_market: { ...state.labor_market },
                wages: { ...state.wages },
                productivity: { ...state.productivity },
                sectors: JSON.parse(JSON.stringify(state.sectors)),
                interventions: interventionEffects,
                derived: this.calculateDerivedMetrics(state)
            });
        }

        this.results = results;
        return {
            scenario: this.currentScenario,
            results,
            summary: this.generateSummary(results)
        };
    }

    /**
     * Get AI adoption value from ai_indicators (handles different data structures)
     */
    getAIAdoptionValue(aiIndicators) {
        // Handle both flattened structure (ai_indicators.companies_using_ai)
        // and nested structure (ai_indicators.real.companies_using_ai)
        if (aiIndicators.companies_using_ai) {
            return aiIndicators.companies_using_ai.value;
        }
        if (aiIndicators.real && aiIndicators.real.companies_using_ai) {
            return aiIndicators.real.companies_using_ai.value;
        }
        // Default fallback
        return 35;
    }

    initializeState() {
        const baseline = this.baselineSnapshot;

        // Initialize skill distribution using SBTC model
        const totalEmployment = baseline.labor_market.total_employment;
        const skillEmployment = this.economicModels.sbtcModel.calculateEmploymentBySkill(
            totalEmployment,
            this.getAIAdoptionValue(baseline.ai_indicators)
        );

        return {
            labor_market: {
                total_employment: baseline.labor_market.total_employment,
                unemployment_rate: baseline.labor_market.unemployment_rate,
                labor_force_participation: baseline.labor_market.labor_force_participation,
                job_openings: baseline.labor_market.job_openings,
                labor_force: baseline.labor_market.total_employment /
                    (1 - baseline.labor_market.unemployment_rate / 100)
            },
            wages: {
                average_hourly: baseline.wages.average_hourly,
                median_weekly: baseline.wages.median_weekly,
                real_wage_growth: baseline.wages.real_wage_growth
            },
            productivity: {
                growth_rate: baseline.productivity.growth_rate,
                output_per_hour: baseline.productivity.output_per_hour
            },
            sectors: JSON.parse(JSON.stringify(baseline.sectors)),
            ai: {
                adoption_rate: this.getAIAdoptionValue(baseline.ai_indicators),
                displaced_workers: 0,
                new_jobs_created: 0
            },
            // Enhanced: Skill-based tracking
            skills: {
                high: skillEmployment.high,
                mid: skillEmployment.mid,
                low: skillEmployment.low
            },
            // Enhanced: Macroeconomic factors from Solow model
            macroeconomic: {
                labor_share: this.economicModels.solowModel.getLaborShare(),
                ai_capital_share: this.economicModels.solowModel.beta,
                tfp_growth: this.economicModels.solowModel.techGrowth
            }
        };
    }

    /**
     * Calculate AI adoption rate based on curve type
     */
    calculateAIAdoption(progress, scenario) {
        const initial = this.getAIAdoptionValue(this.baselineSnapshot.ai_indicators);
        const target = scenario.targets.ai_adoption_rate;
        const curve = scenario.ai_parameters.adoption_curve;

        let adoption;

        switch (curve) {
            case 'linear':
                adoption = initial + (target - initial) * progress;
                break;

            case 'exponential':
                adoption = initial * Math.pow(target / initial, progress);
                break;

            case 's_curve':
            default:
                // Logistic S-curve
                const midpoint = 0.5;
                const steepness = 10;
                const sigmoid = 1 / (1 + Math.exp(-steepness * (progress - midpoint)));
                adoption = initial + (target - initial) * sigmoid;
                break;
        }

        return {
            rate: Math.min(100, Math.max(0, adoption)),
            change_from_baseline: adoption - initial,
            curve_type: curve
        };
    }

    /**
     * Calculate labor market impacts from AI adoption
     * Enhanced with task-based labor model (Acemoglu & Restrepo) and SBTC
     */
    calculateLaborImpact(state, aiAdoption, scenario) {
        const adoptionChange = aiAdoption.rate - state.ai.adoption_rate;
        const automationPace = this.getAutomationPaceMultiplier(scenario.targets.automation_pace);
        const productivityGrowth = state.productivity.growth_rate;

        // Calculate job displacement by sector using task-based model
        let totalDisplaced = 0;
        let totalNewJobs = 0;
        const sectorImpacts = {};
        let aggregatePolarizationRisk = 0;

        for (const [sector, data] of Object.entries(state.sectors)) {
            const employment = data.employment;

            // Use task-based model for more nuanced displacement calculation
            const taskImpact = this.economicModels.taskModel.calculateNetImpact(
                sector,
                aiAdoption.rate,
                productivityGrowth,
                automationPace
            );

            // Calculate displaced based on task-based effective job loss
            const displaced = Math.round(employment * taskImpact.displacement.effectiveJobLoss);

            // New jobs from reinstatement effect
            const newJobs = Math.round(employment * taskImpact.reinstatement.totalReinstatement);

            sectorImpacts[sector] = {
                displaced,
                new_jobs: newJobs,
                net_change: newJobs - displaced,
                polarization_risk: taskImpact.polarizationRisk,
                task_details: taskImpact.displacement.taskImpacts
            };

            totalDisplaced += displaced;
            totalNewJobs += newJobs;

            // Track polarization
            if (taskImpact.polarizationRisk === 'high') aggregatePolarizationRisk += 2;
            else if (taskImpact.polarizationRisk === 'medium') aggregatePolarizationRisk += 1;
        }

        // Calculate target-based adjustment
        const targetAdjustment = this.calculateTargetAdjustment(state, scenario);

        // Calculate skill-biased wage effects
        const skillPremiums = this.economicModels.sbtcModel.calculateSkillPremiums(
            aiAdoption.rate,
            productivityGrowth
        );

        // Update Solow model's AI capital share based on adoption
        this.economicModels.solowModel.updateAICapitalShare(aiAdoption.rate);
        const laborShare = this.economicModels.solowModel.getLaborShare();

        // Wage pressure now incorporates skill-biased effects
        const avgWageEffect = (
            skillPremiums.high.wageChange * 0.3 +
            skillPremiums.mid.wageChange * 0.4 +
            skillPremiums.low.wageChange * 0.3
        );

        return {
            total_displaced: totalDisplaced,
            total_new_jobs: totalNewJobs,
            net_job_change: totalNewJobs - totalDisplaced + targetAdjustment,
            sector_impacts: sectorImpacts,
            productivity_gain: adoptionChange * 0.02,
            wage_pressure: avgWageEffect,
            // Enhanced metrics
            skill_effects: skillPremiums,
            labor_share: laborShare,
            polarization_index: aggregatePolarizationRisk / Object.keys(state.sectors).length
        };
    }

    /**
     * Get automation pace multiplier
     */
    getAutomationPaceMultiplier(pace) {
        const multipliers = {
            slow: 0.5,
            moderate: 1.0,
            fast: 1.5,
            accelerating: 2.0
        };
        return multipliers[pace] || 1.0;
    }

    /**
     * Calculate adjustment to move toward target unemployment
     */
    calculateTargetAdjustment(state, scenario) {
        if (!scenario.targets.unemployment_rate) return 0;

        const currentUR = state.labor_market.unemployment_rate;
        const targetUR = scenario.targets.unemployment_rate;
        const progress = 1 / (scenario.timeframe.end_year - scenario.timeframe.start_year);

        // Calculate needed job change to move toward target
        const laborForce = state.labor_market.labor_force;
        const currentUnemployed = laborForce * (currentUR / 100);
        const targetUnemployed = laborForce * (targetUR / 100);
        const neededChange = (currentUnemployed - targetUnemployed) * progress;

        return Math.round(neededChange);
    }

    /**
     * Apply intervention effects
     */
    applyInterventions(state, laborImpact, interventions) {
        if (!interventions || interventions.length === 0) {
            return { applied: [], total_effect: 0 };
        }

        const effects = [];
        let totalJobEffect = 0;
        let totalWageEffect = 0;

        for (const intervention of interventions) {
            if (!intervention.active) continue;

            const effect = this.calculateInterventionEffect(intervention, state, laborImpact);
            effects.push({
                name: intervention.name,
                type: intervention.type,
                ...effect
            });

            totalJobEffect += effect.job_effect || 0;
            totalWageEffect += effect.wage_effect || 0;
        }

        return {
            applied: effects,
            total_job_effect: totalJobEffect,
            total_wage_effect: totalWageEffect
        };
    }

    /**
     * Calculate effect of a single intervention
     */
    calculateInterventionEffect(intervention, state, laborImpact) {
        // This is calculated by the Interventions module
        // Return placeholder for engine-level calculation
        return {
            job_effect: 0,
            wage_effect: 0,
            cost: 0
        };
    }

    /**
     * Update simulation state
     */
    updateState(state, laborImpact, interventionEffects) {
        const newState = JSON.parse(JSON.stringify(state));

        // Update labor market
        const netJobChange = laborImpact.net_job_change + (interventionEffects.total_job_effect || 0);
        newState.labor_market.total_employment += netJobChange;

        // Update unemployment rate
        const laborForce = newState.labor_market.labor_force;
        const employed = newState.labor_market.total_employment;
        newState.labor_market.unemployment_rate =
            ((laborForce - employed) / laborForce) * 100;
        newState.labor_market.unemployment_rate =
            Math.max(0, Math.min(50, newState.labor_market.unemployment_rate));

        // Update job openings (inverse relationship with unemployment)
        const urChange = newState.labor_market.unemployment_rate - state.labor_market.unemployment_rate;
        newState.labor_market.job_openings = Math.max(
            1000000,
            state.labor_market.job_openings * (1 - urChange * 0.05)
        );

        // Update wages
        newState.wages.real_wage_growth = state.wages.real_wage_growth +
            laborImpact.wage_pressure +
            (interventionEffects.total_wage_effect || 0);
        newState.wages.average_hourly *= (1 + newState.wages.real_wage_growth / 100 / 12);
        newState.wages.median_weekly *= (1 + newState.wages.real_wage_growth / 100 / 12);

        // Update productivity
        newState.productivity.growth_rate = state.productivity.growth_rate + laborImpact.productivity_gain;
        newState.productivity.output_per_hour *= (1 + newState.productivity.growth_rate / 100 / 12);

        // Update sectors
        for (const [sector, impact] of Object.entries(laborImpact.sector_impacts)) {
            if (newState.sectors[sector]) {
                newState.sectors[sector].employment += impact.net_change;
            }
        }

        // Update AI metrics
        newState.ai.displaced_workers += laborImpact.total_displaced;
        newState.ai.new_jobs_created += laborImpact.total_new_jobs;

        return newState;
    }

    /**
     * Calculate derived metrics for a state
     */
    calculateDerivedMetrics(state) {
        return {
            employment_to_population: (state.labor_market.total_employment / 210000000) * 100,
            jobs_per_unemployed: state.labor_market.job_openings /
                (state.labor_market.labor_force - state.labor_market.total_employment),
            cumulative_displacement: state.ai.displaced_workers,
            cumulative_new_jobs: state.ai.new_jobs_created,
            net_ai_job_impact: state.ai.new_jobs_created - state.ai.displaced_workers
        };
    }

    /**
     * Generate summary statistics from results
     */
    generateSummary(results) {
        const initial = results[0];
        const final = results[results.length - 1];

        // Calculate cumulative intervention effects
        const interventionSummary = this.calculateInterventionSummary(results);

        return {
            timeframe: {
                start_year: initial.year,
                end_year: final.year,
                duration_years: final.year - initial.year
            },
            labor_market_changes: {
                unemployment_rate: {
                    initial: initial.labor_market.unemployment_rate.toFixed(1),
                    final: final.labor_market.unemployment_rate.toFixed(1),
                    change: (final.labor_market.unemployment_rate - initial.labor_market.unemployment_rate).toFixed(1)
                },
                total_employment: {
                    initial: initial.labor_market.total_employment,
                    final: final.labor_market.total_employment,
                    change: final.labor_market.total_employment - initial.labor_market.total_employment
                },
                job_openings: {
                    initial: initial.labor_market.job_openings,
                    final: final.labor_market.job_openings,
                    change: final.labor_market.job_openings - initial.labor_market.job_openings
                }
            },
            ai_impact: {
                ai_adoption: {
                    initial: initial.ai_adoption.rate.toFixed(1),
                    final: final.ai_adoption.rate.toFixed(1)
                },
                cumulative_displacement: final.derived.cumulative_displacement,
                cumulative_new_jobs: final.derived.cumulative_new_jobs,
                net_impact: final.derived.net_ai_job_impact
            },
            wages: {
                average_hourly: {
                    initial: initial.wages.average_hourly.toFixed(2),
                    final: final.wages.average_hourly.toFixed(2),
                    change_percent: ((final.wages.average_hourly - initial.wages.average_hourly) /
                        initial.wages.average_hourly * 100).toFixed(1)
                }
            },
            productivity: {
                growth_rate: {
                    initial: initial.productivity.growth_rate.toFixed(1),
                    final: final.productivity.growth_rate.toFixed(1)
                }
            },
            interventions: interventionSummary,
            sector_summary: this.generateSectorSummary(initial.sectors, final.sectors)
        };
    }

    /**
     * Calculate cumulative intervention effects across simulation
     */
    calculateInterventionSummary(results) {
        const summary = {
            total_job_effect: 0,
            total_wage_effect: 0,
            total_fiscal_cost: 0,
            total_economic_impact: 0,
            monthly_averages: {
                job_effect: 0,
                wage_effect: 0,
                fiscal_cost: 0,
                economic_impact: 0
            },
            details: []
        };

        // Sum up all intervention effects
        for (const result of results) {
            if (result.interventions) {
                summary.total_job_effect += result.interventions.total_job_effect || 0;
                summary.total_wage_effect += result.interventions.total_wage_effect || 0;
                summary.total_fiscal_cost += result.interventions.total_fiscal_cost || 0;
                summary.total_economic_impact += result.interventions.total_economic_impact || 0;
            }
        }

        // Calculate monthly averages
        const months = results.length;
        if (months > 0) {
            summary.monthly_averages.job_effect = summary.total_job_effect / months;
            summary.monthly_averages.wage_effect = summary.total_wage_effect / months;
            summary.monthly_averages.fiscal_cost = summary.total_fiscal_cost / months;
            summary.monthly_averages.economic_impact = summary.total_economic_impact / months;
        }

        // Get last intervention details for breakdown
        const lastResult = results[results.length - 1];
        if (lastResult?.interventions?.details) {
            summary.details = lastResult.interventions.details;
        }

        return summary;
    }

    /**
     * Generate sector-level summary
     */
    generateSectorSummary(initialSectors, finalSectors) {
        const summary = {};

        for (const sector of Object.keys(initialSectors)) {
            summary[sector] = {
                employment_change: finalSectors[sector].employment - initialSectors[sector].employment,
                employment_change_percent: ((finalSectors[sector].employment - initialSectors[sector].employment) /
                    initialSectors[sector].employment * 100).toFixed(1),
                automation_exposure: initialSectors[sector].automation_exposure
            };
        }

        // Sort by employment change
        const sorted = Object.entries(summary)
            .sort((a, b) => a[1].employment_change - b[1].employment_change);

        return {
            most_affected: sorted.slice(0, 3).map(([name, data]) => ({ name, ...data })),
            least_affected: sorted.slice(-3).reverse().map(([name, data]) => ({ name, ...data }))
        };
    }

    /**
     * Get results for a specific year
     */
    getResultsForYear(year) {
        return this.results.filter(r => Math.floor(r.year) === year);
    }

    /**
     * Export simulation results
     */
    exportResults(format = 'json') {
        if (format === 'json') {
            return JSON.stringify({
                scenario: this.currentScenario,
                results: this.results,
                summary: this.generateSummary(this.results)
            }, null, 2);
        }

        // CSV format
        if (format === 'csv') {
            const headers = [
                'Year',
                'AI Adoption %',
                'Unemployment Rate %',
                'Total Employment',
                'Job Openings',
                'Avg Hourly Wage',
                'Productivity Growth %',
                'Cumulative Displaced',
                'Cumulative New Jobs'
            ];

            const rows = this.results.map(r => [
                r.year,
                r.ai_adoption.rate.toFixed(1),
                r.labor_market.unemployment_rate.toFixed(2),
                r.labor_market.total_employment,
                Math.round(r.labor_market.job_openings),
                r.wages.average_hourly.toFixed(2),
                r.productivity.growth_rate.toFixed(2),
                r.derived.cumulative_displacement,
                r.derived.cumulative_new_jobs
            ]);

            return [headers, ...rows].map(row => row.join(',')).join('\n');
        }

        return this.results;
    }

    /**
     * Run sensitivity analysis on a parameter
     */
    async runSensitivityAnalysis(parameterName, values) {
        const originalScenario = JSON.parse(JSON.stringify(this.currentScenario));
        const results = [];

        for (const value of values) {
            // Modify parameter
            this.setParameter(parameterName, value);

            // Run simulation
            const result = await this.runSimulation();

            results.push({
                parameter_value: value,
                summary: result.summary
            });
        }

        // Restore original scenario
        this.currentScenario = originalScenario;

        return {
            parameter: parameterName,
            analysis: results
        };
    }

    /**
     * Set a scenario parameter
     */
    setParameter(path, value) {
        const parts = path.split('.');
        let obj = this.currentScenario;

        for (let i = 0; i < parts.length - 1; i++) {
            obj = obj[parts[i]];
        }

        obj[parts[parts.length - 1]] = value;
    }
}

// Export for ES modules
export { SimulationEngine };

// Also export to window for backwards compatibility with script tags
if (typeof window !== 'undefined') {
    window.SimulationEngine = SimulationEngine;
}
