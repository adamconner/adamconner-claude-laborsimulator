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
            },

            negative_income_tax: {
                name: 'Negative Income Tax',
                description: 'Cash transfers that phase out as income increases',
                category: 'income_support',
                parameters: {
                    base_amount: {
                        type: 'number',
                        default: 12000,
                        min: 0,
                        max: 30000,
                        unit: 'USD/year'
                    },
                    phase_out_rate: {
                        type: 'number',
                        default: 50,
                        min: 10,
                        max: 100,
                        unit: '%',
                        description: 'Rate at which benefit reduces per dollar earned'
                    },
                    breakeven_income: {
                        type: 'number',
                        default: 24000,
                        min: 10000,
                        max: 100000,
                        unit: 'USD/year',
                        description: 'Income level where benefit reaches zero'
                    }
                },
                effects: {
                    poverty_reduction: { direction: 'decrease', magnitude: 'large' },
                    work_incentive: { direction: 'increase', magnitude: 'small' },
                    administrative_simplicity: { direction: 'increase', magnitude: 'medium' }
                },
                cost_model: 'income_based'
            },

            sectoral_bargaining: {
                name: 'Sectoral Bargaining',
                description: 'Industry-wide collective bargaining for wages and conditions',
                category: 'labor_rights',
                parameters: {
                    coverage_rate: {
                        type: 'number',
                        default: 50,
                        min: 0,
                        max: 100,
                        unit: '%',
                        description: 'Percentage of workforce covered'
                    },
                    wage_floor_increase: {
                        type: 'number',
                        default: 15,
                        min: 0,
                        max: 50,
                        unit: '%',
                        description: 'Minimum wage increase in covered sectors'
                    },
                    sectors_covered: {
                        type: 'multiselect',
                        options: ['all', 'manufacturing', 'retail', 'healthcare', 'technology', 'hospitality'],
                        default: ['retail', 'hospitality', 'healthcare']
                    }
                },
                effects: {
                    wage_inequality: { direction: 'decrease', magnitude: 'large' },
                    worker_power: { direction: 'increase', magnitude: 'large' },
                    business_flexibility: { direction: 'decrease', magnitude: 'small' }
                },
                cost_model: 'economy_wide'
            },

            ai_licensing: {
                name: 'AI Licensing & Certification',
                description: 'Regulatory requirements for deploying AI in workplaces',
                category: 'regulation',
                parameters: {
                    compliance_cost: {
                        type: 'number',
                        default: 50000,
                        min: 0,
                        max: 500000,
                        unit: 'USD per deployment'
                    },
                    approval_delay: {
                        type: 'number',
                        default: 6,
                        min: 1,
                        max: 24,
                        unit: 'months'
                    },
                    exemptions: {
                        type: 'multiselect',
                        options: ['small_business', 'research', 'healthcare', 'safety_critical'],
                        default: ['small_business', 'research']
                    },
                    worker_impact_assessment: {
                        type: 'boolean',
                        default: true,
                        description: 'Require assessment of worker displacement'
                    }
                },
                effects: {
                    automation_pace: { direction: 'decrease', magnitude: 'medium' },
                    ai_safety: { direction: 'increase', magnitude: 'medium' },
                    regulatory_burden: { direction: 'increase', magnitude: 'medium' }
                },
                cost_model: 'revenue_generating'
            },

            universal_basic_services: {
                name: 'Universal Basic Services',
                description: 'Free access to essential services for all citizens',
                category: 'safety_net',
                parameters: {
                    services: {
                        type: 'multiselect',
                        options: ['healthcare', 'childcare', 'housing', 'transit', 'internet', 'education'],
                        default: ['healthcare', 'childcare', 'transit']
                    },
                    coverage_level: {
                        type: 'select',
                        options: ['basic', 'standard', 'comprehensive'],
                        default: 'standard'
                    },
                    income_cap: {
                        type: 'number',
                        default: 0,
                        min: 0,
                        max: 200000,
                        unit: 'USD/year',
                        description: 'Income limit for eligibility (0 = universal)'
                    }
                },
                effects: {
                    cost_of_living: { direction: 'decrease', magnitude: 'large' },
                    labor_mobility: { direction: 'increase', magnitude: 'medium' },
                    entrepreneurship: { direction: 'increase', magnitude: 'small' }
                },
                cost_model: 'population_based'
            },

            worker_ownership: {
                name: 'Worker Ownership Incentives',
                description: 'Tax incentives and support for employee-owned businesses',
                category: 'economic_democracy',
                parameters: {
                    tax_credit_rate: {
                        type: 'number',
                        default: 25,
                        min: 0,
                        max: 50,
                        unit: '%',
                        description: 'Tax credit for converting to worker ownership'
                    },
                    conversion_subsidy: {
                        type: 'number',
                        default: 10000,
                        min: 0,
                        max: 100000,
                        unit: 'USD per worker'
                    },
                    min_employee_stake: {
                        type: 'number',
                        default: 30,
                        min: 10,
                        max: 100,
                        unit: '%',
                        description: 'Minimum employee ownership for eligibility'
                    }
                },
                effects: {
                    wage_inequality: { direction: 'decrease', magnitude: 'medium' },
                    job_stability: { direction: 'increase', magnitude: 'medium' },
                    productivity: { direction: 'increase', magnitude: 'small' }
                },
                cost_model: 'participant_based'
            },

            gig_economy_regulations: {
                name: 'Gig Economy Regulations',
                description: 'Labor protections for gig and platform workers (AB5-style)',
                category: 'labor_rights',
                parameters: {
                    classification_strictness: {
                        type: 'select',
                        options: ['strict', 'moderate', 'flexible'],
                        default: 'moderate',
                        description: 'How strictly worker vs contractor is defined'
                    },
                    minimum_wage_enforcement: {
                        type: 'boolean',
                        default: true,
                        description: 'Require minimum wage for gig work hours'
                    },
                    benefits_requirement: {
                        type: 'select',
                        options: ['none', 'partial', 'full'],
                        default: 'partial',
                        description: 'Employer benefit obligations for gig workers'
                    },
                    portable_benefits_fund: {
                        type: 'number',
                        default: 3,
                        min: 0,
                        max: 10,
                        unit: '% of earnings',
                        description: 'Mandatory contribution to portable benefits'
                    },
                    platform_transparency: {
                        type: 'boolean',
                        default: true,
                        description: 'Require platforms to disclose algorithm/pay info'
                    }
                },
                effects: {
                    gig_worker_wages: { direction: 'increase', magnitude: 'medium' },
                    gig_worker_security: { direction: 'increase', magnitude: 'large' },
                    platform_costs: { direction: 'increase', magnitude: 'medium' },
                    gig_job_availability: { direction: 'decrease', magnitude: 'small' }
                },
                cost_model: 'economy_wide'
            },

            skills_based_immigration: {
                name: 'Skills-Based Immigration Policy',
                description: 'Immigration policy prioritizing high-skill workers (H-1B style)',
                category: 'workforce_development',
                parameters: {
                    annual_visa_cap: {
                        type: 'number',
                        default: 200000,
                        min: 50000,
                        max: 1000000,
                        unit: 'visas/year',
                        description: 'Annual limit on skilled worker visas'
                    },
                    skill_threshold: {
                        type: 'select',
                        options: ['advanced_degree', 'bachelors', 'vocational', 'any_skilled'],
                        default: 'bachelors',
                        description: 'Minimum qualification requirement'
                    },
                    wage_floor: {
                        type: 'number',
                        default: 60000,
                        min: 30000,
                        max: 150000,
                        unit: 'USD/year',
                        description: 'Minimum salary for visa eligibility'
                    },
                    labor_market_test: {
                        type: 'boolean',
                        default: true,
                        description: 'Require proof no domestic workers available'
                    },
                    priority_sectors: {
                        type: 'multiselect',
                        options: ['technology', 'healthcare', 'engineering', 'research', 'finance', 'all'],
                        default: ['technology', 'healthcare', 'research']
                    },
                    path_to_residency: {
                        type: 'boolean',
                        default: true,
                        description: 'Allow transition to permanent residency'
                    }
                },
                effects: {
                    skill_supply: { direction: 'increase', magnitude: 'large' },
                    innovation: { direction: 'increase', magnitude: 'medium' },
                    wage_pressure_skilled: { direction: 'decrease', magnitude: 'small' },
                    entrepreneurship: { direction: 'increase', magnitude: 'medium' }
                },
                cost_model: 'revenue_generating'
            },

            public_private_retraining: {
                name: 'Public-Private Retraining Partnerships',
                description: 'Employer-funded retraining with government matching',
                category: 'workforce_development',
                parameters: {
                    government_match_rate: {
                        type: 'number',
                        default: 50,
                        min: 0,
                        max: 100,
                        unit: '%',
                        description: 'Government matches employer contribution'
                    },
                    employer_commitment_minimum: {
                        type: 'number',
                        default: 5000,
                        min: 1000,
                        max: 50000,
                        unit: 'USD per worker',
                        description: 'Minimum employer investment per trainee'
                    },
                    job_guarantee_requirement: {
                        type: 'boolean',
                        default: true,
                        description: 'Require employers to offer job post-training'
                    },
                    training_duration: {
                        type: 'number',
                        default: 6,
                        min: 1,
                        max: 24,
                        unit: 'months'
                    },
                    eligible_workers: {
                        type: 'select',
                        options: ['displaced_only', 'at_risk', 'any_unemployed', 'incumbent_workers'],
                        default: 'at_risk',
                        description: 'Who qualifies for the program'
                    },
                    certification_standards: {
                        type: 'boolean',
                        default: true,
                        description: 'Require industry-recognized credentials'
                    }
                },
                effects: {
                    skill_mismatch: { direction: 'decrease', magnitude: 'large' },
                    employment_placement: { direction: 'increase', magnitude: 'large' },
                    wages_post_training: { direction: 'increase', magnitude: 'medium' },
                    employer_training_investment: { direction: 'increase', magnitude: 'medium' }
                },
                cost_model: 'participant_based'
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
            case 'negative_income_tax':
                effect = this.calculateNITEffect(params, state);
                break;
            case 'sectoral_bargaining':
                effect = this.calculateSectoralBargainingEffect(params, state);
                break;
            case 'ai_licensing':
                effect = this.calculateAILicensingEffect(params, state, laborImpact);
                break;
            case 'universal_basic_services':
                effect = this.calculateUBSEffect(params, state);
                break;
            case 'worker_ownership':
                effect = this.calculateWorkerOwnershipEffect(params, state);
                break;
            case 'gig_economy_regulations':
                effect = this.calculateGigEconomyEffect(params, state);
                break;
            case 'skills_based_immigration':
                effect = this.calculateImmigrationEffect(params, state);
                break;
            case 'public_private_retraining':
                effect = this.calculatePublicPrivateRetrainingEffect(params, state, laborImpact);
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
     * Negative Income Tax Effect Calculation
     */
    calculateNITEffect(params, state) {
        // NIT provides base_amount that phases out at phase_out_rate
        // More targeted than UBI, lower total cost
        const adultPopulation = 210000000 * 0.78;

        // Estimate eligible population (those below breakeven)
        const eligibleRate = Math.min(1, params.breakeven_income / 50000); // Rough estimate
        const eligiblePop = adultPopulation * eligibleRate * 0.6; // 60% take-up

        // Average benefit is roughly half of base_amount due to phase-out
        const avgBenefit = params.base_amount * 0.5;
        const annualCost = eligiblePop * avgBenefit;

        // NIT preserves work incentives better than cliff-based programs
        const lfprEffect = 0.03; // Slight positive - encourages partial work

        // Consumption boost and poverty reduction
        const consumptionMultiplier = 0.85; // Higher than UBI - targeted to those who spend more
        const economicImpact = annualCost * consumptionMultiplier * 1.3;

        return {
            job_effect: Math.round(annualCost * 0.000005), // Small job creation from consumption
            wage_effect: 0.02, // Slight wage floor effect
            lfpr_effect: lfprEffect / 12,
            fiscal_cost: annualCost / 12,
            economic_impact: economicImpact / 12
        };
    }

    /**
     * Sectoral Bargaining Effect Calculation
     */
    calculateSectoralBargainingEffect(params, state) {
        const coveredEmployment = state.labor_market.total_employment * (params.coverage_rate / 100);
        const wageIncrease = params.wage_floor_increase / 100;
        const avgWage = state.wages.average_hourly * 2080;

        // Direct wage increase for covered workers
        const wageEffect = wageIncrease * (params.coverage_rate / 100);

        // Some job losses from higher wages, but offset by increased consumption
        const jobLossRate = 0.02 * wageIncrease; // ~2% job loss per 100% wage increase
        const jobLoss = coveredEmployment * jobLossRate;

        // Economic impact: Higher wages = higher consumption, but some business costs
        const wageGains = coveredEmployment * avgWage * wageIncrease;
        const consumptionGain = wageGains * 0.75; // 75% of wage gains go to consumption
        const productivityGain = coveredEmployment * avgWage * 0.02; // 2% productivity from worker engagement
        const economicImpact = consumptionGain + productivityGain;

        return {
            job_effect: Math.round(-jobLoss / 12),
            wage_effect: wageEffect,
            lfpr_effect: 0.01, // Slightly more attractive to work
            fiscal_cost: 0, // No direct government cost
            economic_impact: economicImpact / 12
        };
    }

    /**
     * AI Licensing Effect Calculation
     */
    calculateAILicensingEffect(params, state, laborImpact) {
        // Licensing creates delays and costs that slow automation
        const baseDisplacement = laborImpact.total_displaced || 0;
        const delayFactor = params.approval_delay / 12; // Months of delay
        const costFactor = params.compliance_cost / 100000; // Relative cost burden

        // Reduced automation pace
        const automationReduction = 0.15 * delayFactor + 0.1 * costFactor;
        const jobsSaved = baseDisplacement * automationReduction;

        // License fees generate revenue
        const numDeployments = state.labor_market.total_employment * 0.001; // Estimate AI deployments
        const licenseRevenue = numDeployments * params.compliance_cost * 0.1; // 10% are new each year

        // Economic impact: Jobs saved vs innovation slowdown
        const avgWage = state.wages.average_hourly * 2080;
        const jobsSavedValue = jobsSaved * avgWage * 0.8;
        const innovationDrag = state.labor_market.total_employment * avgWage * 0.001; // Small innovation cost
        const economicImpact = jobsSavedValue - innovationDrag;

        return {
            job_effect: Math.round(jobsSaved / 12),
            wage_effect: 0,
            lfpr_effect: 0,
            fiscal_cost: -licenseRevenue / 12, // Negative = revenue
            economic_impact: economicImpact / 12
        };
    }

    /**
     * Universal Basic Services Effect Calculation
     */
    calculateUBSEffect(params, state) {
        const adultPopulation = 210000000 * 0.78;

        // Cost per service (annual per person)
        const serviceCosts = {
            healthcare: 8000,
            childcare: 6000,
            housing: 12000,
            transit: 1500,
            internet: 600,
            education: 4000
        };

        // Coverage level multiplier
        const coverageMultiplier = {
            basic: 0.5,
            standard: 0.75,
            comprehensive: 1.0
        }[params.coverage_level] || 0.75;

        // Calculate total cost based on selected services
        const services = params.services || ['healthcare', 'childcare', 'transit'];
        const eligiblePop = params.income_cap > 0
            ? adultPopulation * (params.income_cap / 100000) * 0.5
            : adultPopulation;

        let annualCost = 0;
        for (const service of services) {
            annualCost += (serviceCosts[service] || 2000) * coverageMultiplier * eligiblePop;
        }

        // Reduces cost of living, increases disposable income
        const disposableIncomeBoost = annualCost * 0.6; // 60% translates to freed income

        // Economic impact: Freed income + public service jobs + reduced inequality
        const serviceJobs = annualCost / 60000; // ~$60k per service job
        const consumptionMultiplier = 1.4;
        const economicImpact = disposableIncomeBoost * consumptionMultiplier + (serviceJobs * 60000);

        return {
            job_effect: Math.round(serviceJobs / 12),
            wage_effect: 0.03, // Reduces desperation, improves bargaining
            lfpr_effect: 0.02, // Childcare/transit improves access to work
            fiscal_cost: annualCost / 12,
            economic_impact: economicImpact / 12
        };
    }

    /**
     * Worker Ownership Incentives Effect Calculation
     */
    calculateWorkerOwnershipEffect(params, state) {
        const totalFirms = 6000000; // Approximate US businesses
        const eligibleFirms = totalFirms * 0.1; // 10% might consider conversion
        const conversionRate = 0.05 * (params.tax_credit_rate / 25); // 5% baseline at 25% credit
        const convertingFirms = eligibleFirms * conversionRate;

        // Average workers per converting firm
        const avgWorkers = 15;
        const workersAffected = convertingFirms * avgWorkers;

        // Costs
        const taxCreditCost = workersAffected * state.wages.average_hourly * 2080 * (params.tax_credit_rate / 100) * 0.1;
        const subsidyCost = workersAffected * params.conversion_subsidy;
        const annualCost = (taxCreditCost + subsidyCost) / 5; // Spread over 5 years

        // Worker-owned firms have lower turnover, higher productivity
        const productivityGain = 0.04; // 4% productivity boost
        const turnoverReduction = 0.3; // 30% less turnover

        // Economic impact: Productivity gains + reduced inequality
        const avgWage = state.wages.average_hourly * 2080;
        const productivityValue = workersAffected * avgWage * productivityGain;
        const turnoverSavings = workersAffected * avgWage * 0.2 * turnoverReduction; // 20% of wage is turnover cost
        const economicImpact = productivityValue + turnoverSavings;

        return {
            job_effect: Math.round(workersAffected * 0.02 / 12), // 2% more jobs from growth
            wage_effect: 0.02, // Profit sharing increases effective wages
            lfpr_effect: 0.01, // Better job quality attracts workers
            fiscal_cost: annualCost / 12,
            economic_impact: economicImpact / 12
        };
    }

    /**
     * Gig Economy Regulations Effect Calculation
     */
    calculateGigEconomyEffect(params, state) {
        // Estimate gig workforce (~15% of total employment)
        const gigWorkforce = state.labor_market.total_employment * 0.15;
        const avgGigWage = state.wages.average_hourly * 0.75; // Gig wages typically lower
        const avgWage = state.wages.average_hourly * 2080;

        // Classification strictness affects how many workers get reclassified
        const reclassificationRate = {
            strict: 0.6,    // 60% of gig workers reclassified as employees
            moderate: 0.3,  // 30% reclassified
            flexible: 0.1   // 10% reclassified
        }[params.classification_strictness] || 0.3;

        const reclassifiedWorkers = gigWorkforce * reclassificationRate;

        // Wage effects
        let wageBoost = 0;
        if (params.minimum_wage_enforcement) {
            wageBoost += 0.15; // 15% wage increase for affected workers
        }

        // Benefits cost to platforms
        const benefitsCostMultiplier = {
            none: 0,
            partial: 0.15,  // 15% of wages for partial benefits
            full: 0.30      // 30% of wages for full benefits
        }[params.benefits_requirement] || 0.15;

        // Platform compliance costs (passed to economy, not government)
        const complianceCost = reclassifiedWorkers * avgGigWage * 2080 * benefitsCostMultiplier;

        // Job reduction due to higher costs (some platforms reduce workforce)
        const jobReductionRate = reclassificationRate * 0.1; // ~10% of reclassified rate
        const jobsLost = gigWorkforce * jobReductionRate;

        // But reclassified workers are now regular employees (net neutral on jobs, positive on quality)
        const netJobEffect = -jobsLost + (reclassifiedWorkers * 0.05); // 5% new traditional jobs created

        // Portable benefits fund contribution (government cost if subsidized)
        const portableBenefitsCost = gigWorkforce * avgGigWage * 2080 * (params.portable_benefits_fund / 100) * 0.2; // 20% gov subsidy

        // Economic impact: Higher wages = more consumption, but some platform cost drag
        const wageGains = (reclassifiedWorkers + gigWorkforce * 0.5) * avgGigWage * 2080 * wageBoost;
        const consumptionGain = wageGains * 0.85; // High MPC for low-wage workers
        const stabilitybenefit = reclassifiedWorkers * avgWage * 0.1; // 10% benefit from job security
        const platformDrag = complianceCost * 0.3; // Some innovation/service reduction
        const economicImpact = consumptionGain + stabilitybenefit - platformDrag;

        return {
            job_effect: Math.round(netJobEffect / 12),
            wage_effect: wageBoost * (reclassificationRate + 0.2), // Spillover to other gig workers
            lfpr_effect: 0.02, // Better conditions attract workers
            fiscal_cost: portableBenefitsCost / 12,
            economic_impact: economicImpact / 12
        };
    }

    /**
     * Skills-Based Immigration Effect Calculation
     */
    calculateImmigrationEffect(params, state) {
        const avgWage = state.wages.average_hourly * 2080;

        // Skill threshold affects average productivity of immigrants
        const productivityMultiplier = {
            advanced_degree: 1.8,  // 80% above average
            bachelors: 1.4,        // 40% above average
            vocational: 1.1,       // 10% above average
            any_skilled: 1.0       // Average
        }[params.skill_threshold] || 1.4;

        // Annual immigrant workers
        const annualWorkers = params.annual_visa_cap;
        const monthlyWorkers = annualWorkers / 12;

        // Wage floor effect - immigrants earn at least this wage
        const avgImmigrantWage = Math.max(params.wage_floor, avgWage * productivityMultiplier);

        // Labor market test reduces job competition
        const competitionFactor = params.labor_market_test ? 0.3 : 0.7;

        // Job effects: 
        // - Immigrants fill open positions (positive)
        // - Some wage pressure on similar workers (negative for natives)
        // - But also create jobs through consumption and entrepreneurship (positive)
        const jobsFilled = monthlyWorkers * 0.95; // 95% employment rate
        const jobsCreated = monthlyWorkers * 0.3; // Each immigrant creates 0.3 additional jobs
        const netJobEffect = jobsFilled + jobsCreated;

        // Wage pressure on skilled workers (negative) but entrepreneurship premium (positive)
        const wagePressure = -0.005 * (monthlyWorkers / 10000) * competitionFactor;
        const innovationBoost = 0.002 * productivityMultiplier * (monthlyWorkers / 10000);
        const netWageEffect = wagePressure + innovationBoost;

        // Visa fees generate revenue (~$5000 per visa average)
        const visaRevenue = annualWorkers * 5000;

        // Path to residency increases long-term economic contribution
        const residencyBonus = params.path_to_residency ? 1.2 : 1.0;

        // Economic impact: wages earned + innovation + entrepreneurship
        const earningsValue = monthlyWorkers * avgImmigrantWage;
        const innovationValue = monthlyWorkers * avgImmigrantWage * 0.2 * productivityMultiplier;
        const entrepreneurshipValue = monthlyWorkers * 0.15 * avgImmigrantWage * 2; // 15% start businesses
        const economicImpact = (earningsValue + innovationValue + entrepreneurshipValue) * residencyBonus;

        return {
            job_effect: Math.round(netJobEffect),
            wage_effect: netWageEffect,
            lfpr_effect: 0.01, // Slight increase in overall labor force
            fiscal_cost: -visaRevenue / 12, // Negative = revenue
            economic_impact: economicImpact / 12
        };
    }

    /**
     * Public-Private Retraining Partnership Effect Calculation
     */
    calculatePublicPrivateRetrainingEffect(params, state, laborImpact) {
        const displacedMonthly = laborImpact.total_displaced || 0;
        const atRiskWorkers = state.labor_market.total_employment * 0.1; // 10% at risk
        const avgWage = state.wages.average_hourly * 2080;

        // Eligible pool depends on policy
        const eligiblePool = {
            displaced_only: displacedMonthly * 12,
            at_risk: atRiskWorkers * 0.1, // 10% of at-risk participate
            any_unemployed: (state.labor_market.labor_force - state.labor_market.total_employment) * 0.1,
            incumbent_workers: state.labor_market.total_employment * 0.02 // 2% upskilling
        }[params.eligible_workers] || atRiskWorkers * 0.1;

        // Training capacity limited by employer commitment
        const trainingCostPerWorker = params.employer_commitment_minimum * (1 + params.government_match_rate / 100);
        const participants = Math.min(eligiblePool, 500000); // Cap at 500k annual

        // Government cost = match rate of employer contribution
        const annualGovCost = participants * params.employer_commitment_minimum * (params.government_match_rate / 100);

        // Success rate higher with job guarantee and certification
        let successRate = 0.6; // Base 60%
        if (params.job_guarantee_requirement) successRate += 0.2; // +20%
        if (params.certification_standards) successRate += 0.1; // +10%

        const successfulRetrains = participants * successRate;

        // Job effects - successful retrains find employment
        const jobEffect = successfulRetrains * 0.85; // 85% of successful find jobs

        // Wage effect - retrained workers earn more
        const wageBoost = params.certification_standards ? 0.15 : 0.08; // 15% or 8% wage increase

        // Economic impact: reduced unemployment costs + higher productivity + employer investment
        const unemploymentSavings = successfulRetrains * avgWage * 0.4; // 40% of wage was unemployment cost
        const productivityGain = successfulRetrains * avgWage * 0.1; // 10% productivity boost
        const employerInvestment = participants * params.employer_commitment_minimum; // Private investment
        const economicImpact = unemploymentSavings + productivityGain + employerInvestment * 0.5;

        return {
            job_effect: Math.round(jobEffect / 12),
            wage_effect: wageBoost * (successfulRetrains / 1000000), // Scale by participants
            lfpr_effect: 0.03 * (successfulRetrains / 1000000), // Brings people back to workforce
            fiscal_cost: annualGovCost / 12,
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

// Export for ES modules
export { InterventionSystem };

// Also export to window for backwards compatibility with script tags
if (typeof window !== 'undefined') {
    window.InterventionSystem = InterventionSystem;
}
