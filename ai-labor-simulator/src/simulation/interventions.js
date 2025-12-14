/**
 * Policy Interventions Module
 * Models various policy interventions to mitigate AI labor market disruption
 */

class InterventionSystem {
    constructor() {
        this.interventions = [];
        this.interventionTypes = this.defineInterventionTypes();
    }

    /**
     * Define available intervention types with their parameters and effects
     */
    defineInterventionTypes() {
        return {
            ubi: {
                name: 'Universal Basic Income',
                description: 'Monthly cash payment to all adult citizens',
                category: 'income_support',
                parameters: {
                    monthly_amount: {
                        type: 'number',
                        default: 1000,
                        min: 0,
                        max: 5000,
                        unit: 'USD/month'
                    },
                    eligibility_age: {
                        type: 'number',
                        default: 18,
                        min: 16,
                        max: 25
                    },
                    phase_out_threshold: {
                        type: 'number',
                        default: 0,
                        min: 0,
                        max: 200000,
                        unit: 'USD/year',
                        description: 'Income level at which UBI phases out (0 = universal)'
                    }
                },
                effects: {
                    labor_force_participation: { direction: 'decrease', magnitude: 'small' },
                    consumption: { direction: 'increase', magnitude: 'medium' },
                    poverty_rate: { direction: 'decrease', magnitude: 'large' },
                    entrepreneurship: { direction: 'increase', magnitude: 'small' }
                },
                cost_model: 'population_based'
            },

            job_retraining: {
                name: 'Job Retraining Programs',
                description: 'Government-funded programs to retrain displaced workers',
                category: 'workforce_development',
                parameters: {
                    funding_per_worker: {
                        type: 'number',
                        default: 10000,
                        min: 1000,
                        max: 50000,
                        unit: 'USD'
                    },
                    program_duration: {
                        type: 'number',
                        default: 6,
                        min: 1,
                        max: 24,
                        unit: 'months'
                    },
                    success_rate: {
                        type: 'number',
                        default: 60,
                        min: 0,
                        max: 100,
                        unit: '%'
                    },
                    eligibility: {
                        type: 'select',
                        options: ['all_unemployed', 'displaced_only', 'means_tested'],
                        default: 'displaced_only'
                    }
                },
                effects: {
                    skill_mismatch: { direction: 'decrease', magnitude: 'large' },
                    unemployment_duration: { direction: 'decrease', magnitude: 'medium' },
                    wages_post_displacement: { direction: 'increase', magnitude: 'medium' }
                },
                cost_model: 'participant_based'
            },

            wage_subsidy: {
                name: 'Wage Subsidies',
                description: 'Government subsidies to employers for maintaining employment',
                category: 'employment_support',
                parameters: {
                    subsidy_rate: {
                        type: 'number',
                        default: 25,
                        min: 0,
                        max: 100,
                        unit: '% of wage'
                    },
                    max_wage_covered: {
                        type: 'number',
                        default: 50000,
                        min: 0,
                        max: 150000,
                        unit: 'USD/year'
                    },
                    duration: {
                        type: 'number',
                        default: 12,
                        min: 1,
                        max: 36,
                        unit: 'months'
                    },
                    sector_targeting: {
                        type: 'multiselect',
                        options: ['all', 'high_automation_risk', 'manufacturing', 'retail', 'transportation'],
                        default: ['high_automation_risk']
                    }
                },
                effects: {
                    employment_retention: { direction: 'increase', magnitude: 'large' },
                    business_costs: { direction: 'decrease', magnitude: 'medium' },
                    wage_pressure: { direction: 'decrease', magnitude: 'small' }
                },
                cost_model: 'wage_based'
            },

            reduced_workweek: {
                name: 'Reduced Work Week',
                description: 'Mandate or incentivize shorter work weeks to spread employment',
                category: 'work_sharing',
                parameters: {
                    target_hours: {
                        type: 'number',
                        default: 32,
                        min: 20,
                        max: 40,
                        unit: 'hours/week'
                    },
                    wage_adjustment: {
                        type: 'select',
                        options: ['full_wage', 'proportional', 'partial_subsidy'],
                        default: 'partial_subsidy'
                    },
                    implementation: {
                        type: 'select',
                        options: ['mandate', 'incentive', 'voluntary'],
                        default: 'incentive'
                    }
                },
                effects: {
                    employment: { direction: 'increase', magnitude: 'medium' },
                    productivity_per_hour: { direction: 'increase', magnitude: 'small' },
                    worker_wellbeing: { direction: 'increase', magnitude: 'medium' }
                },
                cost_model: 'economy_wide'
            },

            robot_tax: {
                name: 'Automation Tax',
                description: 'Tax on automation/robots to fund worker transition',
                category: 'taxation',
                parameters: {
                    tax_rate: {
                        type: 'number',
                        default: 5,
                        min: 0,
                        max: 50,
                        unit: '% of labor cost savings'
                    },
                    revenue_allocation: {
                        type: 'multiselect',
                        options: ['ubi', 'retraining', 'education', 'general_fund'],
                        default: ['retraining', 'education']
                    },
                    exemptions: {
                        type: 'multiselect',
                        options: ['small_business', 'healthcare', 'research'],
                        default: ['small_business']
                    }
                },
                effects: {
                    automation_pace: { direction: 'decrease', magnitude: 'small' },
                    tax_revenue: { direction: 'increase', magnitude: 'medium' },
                    business_investment: { direction: 'decrease', magnitude: 'small' }
                },
                cost_model: 'revenue_generating'
            },

            education_subsidy: {
                name: 'Education & Skills Subsidy',
                description: 'Subsidized education for AI-complementary skills',
                category: 'workforce_development',
                parameters: {
                    subsidy_amount: {
                        type: 'number',
                        default: 15000,
                        min: 0,
                        max: 100000,
                        unit: 'USD/year'
                    },
                    program_types: {
                        type: 'multiselect',
                        options: ['stem_degree', 'vocational', 'bootcamp', 'apprenticeship'],
                        default: ['stem_degree', 'bootcamp']
                    },
                    income_cap: {
                        type: 'number',
                        default: 75000,
                        min: 0,
                        max: 200000,
                        unit: 'USD/year'
                    }
                },
                effects: {
                    skill_supply: { direction: 'increase', magnitude: 'large' },
                    wage_premium: { direction: 'decrease', magnitude: 'small' },
                    inequality: { direction: 'decrease', magnitude: 'medium' }
                },
                cost_model: 'participant_based'
            },

            job_guarantee: {
                name: 'Federal Job Guarantee',
                description: 'Government as employer of last resort',
                category: 'employment_support',
                parameters: {
                    hourly_wage: {
                        type: 'number',
                        default: 20,
                        min: 15,
                        max: 30,
                        unit: 'USD/hour'
                    },
                    job_types: {
                        type: 'multiselect',
                        options: ['infrastructure', 'caregiving', 'environment', 'community_service'],
                        default: ['infrastructure', 'caregiving']
                    },
                    eligibility: {
                        type: 'select',
                        options: ['all_unemployed', 'long_term_only', 'displaced_only'],
                        default: 'all_unemployed'
                    }
                },
                effects: {
                    unemployment_floor: { direction: 'establish', magnitude: 'large' },
                    wage_floor: { direction: 'increase', magnitude: 'medium' },
                    public_services: { direction: 'increase', magnitude: 'medium' }
                },
                cost_model: 'participant_based'
            },

            portable_benefits: {
                name: 'Portable Benefits System',
                description: 'Benefits that follow workers across jobs and gig work',
                category: 'safety_net',
                parameters: {
                    benefit_types: {
                        type: 'multiselect',
                        options: ['healthcare', 'retirement', 'unemployment', 'disability'],
                        default: ['healthcare', 'retirement']
                    },
                    funding_model: {
                        type: 'select',
                        options: ['employer_mandate', 'payroll_tax', 'general_revenue'],
                        default: 'payroll_tax'
                    },
                    contribution_rate: {
                        type: 'number',
                        default: 5,
                        min: 0,
                        max: 20,
                        unit: '% of earnings'
                    }
                },
                effects: {
                    gig_worker_security: { direction: 'increase', magnitude: 'large' },
                    job_mobility: { direction: 'increase', magnitude: 'medium' },
                    entrepreneurship: { direction: 'increase', magnitude: 'small' }
                },
                cost_model: 'earnings_based'
            },

            transition_assistance: {
                name: 'Transition Assistance',
                description: 'Direct payments to workers displaced by automation',
                category: 'income_support',
                parameters: {
                    replacement_rate: {
                        type: 'number',
                        default: 70,
                        min: 0,
                        max: 100,
                        unit: '% of previous wage'
                    },
                    duration: {
                        type: 'number',
                        default: 24,
                        min: 6,
                        max: 48,
                        unit: 'months'
                    },
                    retraining_requirement: {
                        type: 'boolean',
                        default: true
                    }
                },
                effects: {
                    consumption_stability: { direction: 'increase', magnitude: 'large' },
                    job_search_quality: { direction: 'increase', magnitude: 'medium' },
                    skill_preservation: { direction: 'increase', magnitude: 'medium' }
                },
                cost_model: 'displaced_based'
            }
        };
    }

    /**
     * Add an intervention to the simulation
     */
    addIntervention(type, parameters = {}, config = {}) {
        const interventionType = this.interventionTypes[type];
        if (!interventionType) {
            throw new Error(`Unknown intervention type: ${type}`);
        }

        // Merge default parameters with provided ones
        const finalParams = {};
        for (const [key, paramDef] of Object.entries(interventionType.parameters)) {
            finalParams[key] = parameters[key] !== undefined ? parameters[key] : paramDef.default;
        }

        const intervention = {
            id: Date.now() + Math.random(),
            type,
            name: config.name || interventionType.name,
            description: interventionType.description,
            category: interventionType.category,
            parameters: finalParams,
            effects: interventionType.effects,
            cost_model: interventionType.cost_model,
            active: config.active !== false,
            start_year: config.start_year || null,
            end_year: config.end_year || null
        };

        this.interventions.push(intervention);
        return intervention;
    }

    /**
     * Remove an intervention
     */
    removeIntervention(id) {
        this.interventions = this.interventions.filter(i => i.id !== id);
    }

    /**
     * Update intervention parameters
     */
    updateIntervention(id, updates) {
        const intervention = this.interventions.find(i => i.id === id);
        if (intervention) {
            if (updates.parameters) {
                Object.assign(intervention.parameters, updates.parameters);
            }
            if (updates.active !== undefined) {
                intervention.active = updates.active;
            }
            if (updates.start_year !== undefined) {
                intervention.start_year = updates.start_year;
            }
            if (updates.end_year !== undefined) {
                intervention.end_year = updates.end_year;
            }
        }
        return intervention;
    }

    /**
     * Calculate intervention effects for a simulation step
     */
    calculateEffects(state, year, laborImpact) {
        const effects = {
            job_effect: 0,
            wage_effect: 0,
            lfpr_effect: 0,
            fiscal_cost: 0,
            economic_impact: 0,
            details: []
        };

        for (const intervention of this.interventions) {
            if (!intervention.active) continue;
            if (intervention.start_year && year < intervention.start_year) continue;
            if (intervention.end_year && year > intervention.end_year) continue;

            const effect = this.calculateSingleEffect(intervention, state, laborImpact);
            effects.job_effect += effect.job_effect;
            effects.wage_effect += effect.wage_effect;
            effects.lfpr_effect += effect.lfpr_effect;
            effects.fiscal_cost += effect.fiscal_cost;
            effects.economic_impact += effect.economic_impact || 0;
            effects.details.push({
                intervention: intervention.name,
                type: intervention.type,
                ...effect
            });
        }

        // Rename for consistency with engine expectations
        effects.total_job_effect = effects.job_effect;
        effects.total_wage_effect = effects.wage_effect;
        effects.total_fiscal_cost = effects.fiscal_cost;
        effects.total_economic_impact = effects.economic_impact;

        return effects;
    }

    /**
     * Calculate effect of a single intervention
     */
    calculateSingleEffect(intervention, state, laborImpact) {
        const params = intervention.parameters;
        let effect = {
            job_effect: 0,
            wage_effect: 0,
            lfpr_effect: 0,
            fiscal_cost: 0,
            economic_impact: 0
        };

        switch (intervention.type) {
            case 'ubi':
                effect = this.calculateUBIEffect(params, state);
                break;
            case 'job_retraining':
                effect = this.calculateRetrainingEffect(params, state, laborImpact);
                break;
            case 'wage_subsidy':
                effect = this.calculateWageSubsidyEffect(params, state);
                break;
            case 'reduced_workweek':
                effect = this.calculateWorkweekEffect(params, state);
                break;
            case 'robot_tax':
                effect = this.calculateRobotTaxEffect(params, state, laborImpact);
                break;
            case 'education_subsidy':
                effect = this.calculateEducationEffect(params, state);
                break;
            case 'job_guarantee':
                effect = this.calculateJobGuaranteeEffect(params, state);
                break;
            case 'portable_benefits':
                effect = this.calculatePortableBenefitsEffect(params, state);
                break;
            case 'transition_assistance':
                effect = this.calculateTransitionEffect(params, state, laborImpact);
                break;
        }

        return effect;
    }

    /**
     * UBI Effect Calculation
     */
    calculateUBIEffect(params, state) {
        const adultPopulation = 210000000 * 0.78; // ~78% adult
        const annualCost = params.monthly_amount * 12 * adultPopulation;

        // Small decrease in LFPR (income effect)
        const lfprEffect = -0.5 * (params.monthly_amount / 1000);

        // Consumption boost supports job creation
        const consumptionMultiplier = 0.7; // Marginal propensity to consume
        const jobMultiplier = 0.00001; // Jobs per $100k spending
        const jobEffect = annualCost * consumptionMultiplier * jobMultiplier;

        // Economic impact: UBI spending creates economic activity through consumption
        // Fiscal multiplier for direct transfers is typically 0.8-1.5x
        const fiscalMultiplier = 1.2;
        const economicImpact = annualCost * consumptionMultiplier * fiscalMultiplier;

        return {
            job_effect: Math.round(jobEffect / 12), // Monthly
            wage_effect: 0.1 * (params.monthly_amount / 1000), // Slight wage floor increase
            lfpr_effect: lfprEffect / 12,
            fiscal_cost: annualCost / 12,
            economic_impact: economicImpact / 12
        };
    }

    /**
     * Job Retraining Effect Calculation
     */
    calculateRetrainingEffect(params, state, laborImpact) {
        const displacedMonthly = laborImpact.total_displaced || 0;
        const participants = displacedMonthly * (params.eligibility === 'all_unemployed' ? 2 : 1);
        const successfulRetrains = participants * (params.success_rate / 100);
        const monthlyLag = params.program_duration;

        // Delayed effect - reductions accumulate
        const jobEffect = successfulRetrains * 0.8; // 80% of successful retrains find jobs
        const cost = participants * params.funding_per_worker / monthlyLag;

        // Economic impact: Higher wages from retraining + increased productivity
        // Retrained workers earn ~15% more on average
        const avgWage = state.wages.average_hourly * 2080;
        const economicImpact = successfulRetrains * avgWage * 1.15;

        return {
            job_effect: Math.round(jobEffect),
            wage_effect: 0.05, // Better skills = slightly better wages
            lfpr_effect: 0.02, // Keeps people in labor force
            fiscal_cost: cost,
            economic_impact: economicImpact / 12
        };
    }

    /**
     * Wage Subsidy Effect Calculation
     */
    calculateWageSubsidyEffect(params, state) {
        // Estimate eligible workers (high automation risk sectors)
        const eligibleEmployment = state.labor_market.total_employment * 0.15;
        const avgWage = state.wages.average_hourly * 2080; // Annual
        const subsidyPerWorker = Math.min(avgWage, params.max_wage_covered) * (params.subsidy_rate / 100);
        const annualCost = eligibleEmployment * subsidyPerWorker;

        // Jobs saved from displacement
        const jobsSaved = eligibleEmployment * 0.05 * (params.subsidy_rate / 100);

        // Economic impact: Jobs saved = continued economic output
        const economicImpact = jobsSaved * avgWage * 0.8; // 80% of wage value as economic output

        return {
            job_effect: Math.round(jobsSaved / 12),
            wage_effect: -0.02, // Slight wage suppression
            lfpr_effect: 0,
            fiscal_cost: annualCost / 12,
            economic_impact: economicImpact / 12
        };
    }

    /**
     * Reduced Work Week Effect Calculation
     */
    calculateWorkweekEffect(params, state) {
        const currentHours = 40;
        const reduction = (currentHours - params.target_hours) / currentHours;

        // Work spreading creates jobs
        const newJobs = state.labor_market.total_employment * reduction * 0.5; // 50% efficiency

        // Cost depends on wage adjustment
        let wageCost = 0;
        if (params.wage_adjustment === 'partial_subsidy') {
            wageCost = newJobs * state.wages.average_hourly * 2080 * 0.25; // 25% subsidy
        }

        // Economic impact: New jobs create consumer spending
        const avgWage = state.wages.average_hourly * 2080;
        const economicImpact = newJobs * avgWage * 0.7; // 70% marginal propensity to consume

        return {
            job_effect: Math.round(newJobs / 12),
            wage_effect: params.wage_adjustment === 'full_wage' ? 0.1 : -0.05,
            lfpr_effect: 0.05,
            fiscal_cost: wageCost / 12,
            economic_impact: economicImpact / 12
        };
    }

    /**
     * Robot Tax Effect Calculation
     */
    calculateRobotTaxEffect(params, state, laborImpact) {
        // Estimate automation savings
        const automationSavings = laborImpact.total_displaced *
            state.wages.average_hourly * 2080;
        const taxRevenue = automationSavings * (params.tax_rate / 100);

        // Slight slowdown in automation
        const displacementReduction = laborImpact.total_displaced * 0.1 * (params.tax_rate / 100);

        // Economic impact: Revenue can fund other programs; jobs saved maintain spending
        // But slight drag on business investment
        const avgWage = state.wages.average_hourly * 2080;
        const jobsSavedValue = displacementReduction * avgWage * 0.5;
        const investmentDrag = taxRevenue * 0.3; // 30% drag on investment
        const economicImpact = taxRevenue + jobsSavedValue - investmentDrag;

        return {
            job_effect: Math.round(displacementReduction / 12),
            wage_effect: 0,
            lfpr_effect: 0,
            fiscal_cost: -taxRevenue / 12, // Negative = revenue
            economic_impact: economicImpact / 12
        };
    }

    /**
     * Education Subsidy Effect Calculation
     */
    calculateEducationEffect(params, state) {
        // Estimate participants (income-eligible adults seeking education)
        const eligiblePop = 210000000 * 0.05; // 5% of population
        const participants = eligiblePop * (params.income_cap / 100000); // More eligible = more participants
        const annualCost = participants * params.subsidy_amount;

        // Long-term skill improvement
        const futureJobEffect = participants * 0.001; // Delayed effect

        // Economic impact: Education spending + long-term productivity gains
        // Education has high long-term ROI (estimated 8-12% per year of education)
        const avgWage = state.wages.average_hourly * 2080;
        const productivityGain = futureJobEffect * avgWage * 1.2; // 20% productivity premium
        const economicImpact = annualCost * 0.8 + productivityGain; // Direct + indirect

        return {
            job_effect: Math.round(futureJobEffect / 12),
            wage_effect: 0.02, // Gradual wage improvement
            lfpr_effect: -0.01, // Some leave workforce for education
            fiscal_cost: annualCost / 12,
            economic_impact: economicImpact / 12
        };
    }

    /**
     * Job Guarantee Effect Calculation
     */
    calculateJobGuaranteeEffect(params, state) {
        // Calculate unemployed who would take jobs
        const unemployed = state.labor_market.labor_force - state.labor_market.total_employment;
        const takeupRate = params.eligibility === 'all_unemployed' ? 0.4 :
            params.eligibility === 'long_term_only' ? 0.2 : 0.3;
        const participants = unemployed * takeupRate;

        const annualWage = params.hourly_wage * 2080;
        const annualCost = participants * annualWage * 1.3; // Include program overhead

        // Economic impact: Jobs = output + consumer spending
        // Public jobs create value (infrastructure, services) + spending multiplier
        const outputValue = participants * annualWage * 0.8; // 80% productivity of market jobs
        const spendingMultiplier = 1.5; // Government spending multiplier
        const economicImpact = outputValue * spendingMultiplier;

        return {
            job_effect: Math.round(participants / 12),
            wage_effect: 0.15 * (params.hourly_wage / 20), // Wage floor effect
            lfpr_effect: 0.1, // Brings people back to workforce
            fiscal_cost: annualCost / 12,
            economic_impact: economicImpact / 12
        };
    }

    /**
     * Portable Benefits Effect Calculation
     */
    calculatePortableBenefitsEffect(params, state) {
        // Reduces job lock, increases mobility
        const gigWorkforce = state.labor_market.total_employment * 0.15;
        const benefitCost = gigWorkforce * state.wages.average_hourly * 2080 *
            (params.contribution_rate / 100);

        // Modest employment effect through entrepreneurship
        const jobEffect = gigWorkforce * 0.02;

        // Economic impact: Better labor market matching + entrepreneurship
        const avgWage = state.wages.average_hourly * 2080;
        const mobilityGain = gigWorkforce * 0.03 * avgWage * 0.1; // 3% better matching
        const entrepreneurshipGain = jobEffect * avgWage * 1.2; // New businesses
        const economicImpact = mobilityGain + entrepreneurshipGain;

        return {
            job_effect: Math.round(jobEffect / 12),
            wage_effect: 0,
            lfpr_effect: 0.03, // More people willing to work
            fiscal_cost: params.funding_model === 'general_revenue' ? benefitCost / 12 : 0,
            economic_impact: economicImpact / 12
        };
    }

    /**
     * Transition Assistance Effect Calculation
     */
    calculateTransitionEffect(params, state, laborImpact) {
        const displaced = laborImpact.total_displaced || 0;
        const avgWage = state.wages.average_hourly * 2080;
        const assistancePerWorker = avgWage * (params.replacement_rate / 100);
        const annualCost = displaced * 12 * assistancePerWorker * (params.duration / 12);

        // Better job matching due to reduced pressure
        const jobMatchImprovement = 0.1;

        // Economic impact: Maintains consumer spending during transition + better job matches
        // Income support has high fiscal multiplier (~1.5x)
        const consumptionMaintained = annualCost * 0.8; // 80% spent on consumption
        const betterMatchValue = displaced * jobMatchImprovement * avgWage * 0.1; // 10% wage premium from better matches
        const economicImpact = consumptionMaintained * 1.5 + betterMatchValue;

        return {
            job_effect: Math.round(displaced * jobMatchImprovement / 12),
            wage_effect: 0.05, // Better matches = better wages
            lfpr_effect: 0.02, // Keeps people searching
            fiscal_cost: annualCost / 12,
            economic_impact: economicImpact / 12
        };
    }

    /**
     * Get intervention summary
     */
    getSummary() {
        return {
            total_interventions: this.interventions.length,
            active_interventions: this.interventions.filter(i => i.active).length,
            by_category: this.getByCategory(),
            interventions: this.interventions.map(i => ({
                id: i.id,
                name: i.name,
                type: i.type,
                active: i.active,
                parameters: i.parameters
            }))
        };
    }

    /**
     * Get interventions grouped by category
     */
    getByCategory() {
        const categories = {};
        for (const intervention of this.interventions) {
            if (!categories[intervention.category]) {
                categories[intervention.category] = [];
            }
            categories[intervention.category].push(intervention.name);
        }
        return categories;
    }

    /**
     * Export interventions configuration
     */
    exportConfig() {
        return JSON.stringify({
            interventions: this.interventions,
            exported_at: new Date().toISOString()
        }, null, 2);
    }

    /**
     * Import interventions configuration
     */
    importConfig(config) {
        const parsed = typeof config === 'string' ? JSON.parse(config) : config;
        this.interventions = parsed.interventions || [];
    }

    /**
     * Get available intervention types
     */
    getAvailableTypes() {
        return Object.entries(this.interventionTypes).map(([key, value]) => ({
            type: key,
            name: value.name,
            description: value.description,
            category: value.category,
            parameters: value.parameters
        }));
    }
}

// Export for use in other modules
window.InterventionSystem = InterventionSystem;
