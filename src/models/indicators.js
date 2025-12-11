/**
 * Economic Indicators Module
 * Defines and tracks key indicators for AI labor market impact
 */

class EconomicIndicators {
    constructor() {
        this.indicators = this.defineIndicators();
        this.weights = this.defineWeights();
    }

    /**
     * Define all tracked indicators with metadata
     */
    defineIndicators() {
        return {
            // Core Labor Market Indicators
            labor_market: {
                unemployment_rate: {
                    name: 'Unemployment Rate',
                    description: 'Percentage of labor force unemployed',
                    unit: '%',
                    source: 'BLS',
                    frequency: 'monthly',
                    ai_relevance: 'high',
                    direction: 'lower_better'
                },
                underemployment_rate: {
                    name: 'U-6 Underemployment Rate',
                    description: 'Includes marginally attached and part-time for economic reasons',
                    unit: '%',
                    source: 'BLS',
                    frequency: 'monthly',
                    ai_relevance: 'high',
                    direction: 'lower_better'
                },
                labor_force_participation: {
                    name: 'Labor Force Participation Rate',
                    description: 'Percentage of working-age population in labor force',
                    unit: '%',
                    source: 'BLS',
                    frequency: 'monthly',
                    ai_relevance: 'medium',
                    direction: 'context_dependent'
                },
                job_openings: {
                    name: 'Job Openings (JOLTS)',
                    description: 'Number of unfilled job positions',
                    unit: 'millions',
                    source: 'BLS JOLTS',
                    frequency: 'monthly',
                    ai_relevance: 'high',
                    direction: 'context_dependent'
                },
                hires_rate: {
                    name: 'Hires Rate',
                    description: 'Rate of new hires as percentage of employment',
                    unit: '%',
                    source: 'BLS JOLTS',
                    frequency: 'monthly',
                    ai_relevance: 'medium',
                    direction: 'higher_better'
                },
                separations_rate: {
                    name: 'Separations Rate',
                    description: 'Rate of job separations (quits + layoffs)',
                    unit: '%',
                    source: 'BLS JOLTS',
                    frequency: 'monthly',
                    ai_relevance: 'medium',
                    direction: 'context_dependent'
                },
                unemployment_duration: {
                    name: 'Average Unemployment Duration',
                    description: 'Average weeks unemployed',
                    unit: 'weeks',
                    source: 'BLS',
                    frequency: 'monthly',
                    ai_relevance: 'high',
                    direction: 'lower_better'
                }
            },

            // Wage & Income Indicators
            wages: {
                real_wage_growth: {
                    name: 'Real Wage Growth',
                    description: 'Year-over-year growth in inflation-adjusted wages',
                    unit: '%',
                    source: 'BLS',
                    frequency: 'monthly',
                    ai_relevance: 'high',
                    direction: 'higher_better'
                },
                wage_percentile_10: {
                    name: '10th Percentile Wage',
                    description: 'Hourly wage at 10th percentile',
                    unit: 'USD/hr',
                    source: 'BLS',
                    frequency: 'annual',
                    ai_relevance: 'high',
                    direction: 'higher_better'
                },
                wage_percentile_50: {
                    name: 'Median Wage',
                    description: 'Hourly wage at 50th percentile',
                    unit: 'USD/hr',
                    source: 'BLS',
                    frequency: 'annual',
                    ai_relevance: 'medium',
                    direction: 'higher_better'
                },
                wage_percentile_90: {
                    name: '90th Percentile Wage',
                    description: 'Hourly wage at 90th percentile',
                    unit: 'USD/hr',
                    source: 'BLS',
                    frequency: 'annual',
                    ai_relevance: 'medium',
                    direction: 'context_dependent'
                },
                wage_polarization: {
                    name: 'Wage Polarization Index',
                    description: 'Ratio of 90th to 10th percentile wages',
                    unit: 'ratio',
                    source: 'calculated',
                    frequency: 'annual',
                    ai_relevance: 'high',
                    direction: 'lower_better'
                },
                labor_share: {
                    name: 'Labor Share of Income',
                    description: 'Percentage of national income going to workers',
                    unit: '%',
                    source: 'BLS/FRED',
                    frequency: 'quarterly',
                    ai_relevance: 'high',
                    direction: 'higher_better'
                },
                gini_coefficient: {
                    name: 'Gini Coefficient',
                    description: 'Income inequality measure (0=equal, 1=unequal)',
                    unit: 'index',
                    source: 'Census',
                    frequency: 'annual',
                    ai_relevance: 'high',
                    direction: 'lower_better'
                }
            },

            // Productivity Indicators
            productivity: {
                labor_productivity: {
                    name: 'Labor Productivity Growth',
                    description: 'Output per hour worked, year-over-year growth',
                    unit: '%',
                    source: 'BLS',
                    frequency: 'quarterly',
                    ai_relevance: 'high',
                    direction: 'higher_better'
                },
                multifactor_productivity: {
                    name: 'Multifactor Productivity',
                    description: 'Output growth not explained by labor/capital inputs',
                    unit: '%',
                    source: 'BLS',
                    frequency: 'annual',
                    ai_relevance: 'high',
                    direction: 'higher_better'
                },
                productivity_wage_gap: {
                    name: 'Productivity-Wage Gap',
                    description: 'Difference between productivity and wage growth',
                    unit: '%',
                    source: 'calculated',
                    frequency: 'annual',
                    ai_relevance: 'high',
                    direction: 'lower_better'
                }
            },

            // AI-Specific Indicators
            ai_impact: {
                automation_exposure_index: {
                    name: 'Automation Exposure Index',
                    description: 'Weighted average of job automation risk',
                    unit: 'index 0-100',
                    source: 'calculated',
                    frequency: 'calculated',
                    ai_relevance: 'critical',
                    direction: 'context_dependent'
                },
                ai_job_postings_share: {
                    name: 'AI Job Postings Share',
                    description: 'Percentage of job postings requiring AI skills',
                    unit: '%',
                    source: 'Indeed/LinkedIn',
                    frequency: 'monthly',
                    ai_relevance: 'critical',
                    direction: 'context_dependent'
                },
                ai_adoption_rate: {
                    name: 'AI Adoption Rate',
                    description: 'Percentage of firms using AI technologies',
                    unit: '%',
                    source: 'Census/Surveys',
                    frequency: 'quarterly',
                    ai_relevance: 'critical',
                    direction: 'context_dependent'
                },
                displaced_worker_ratio: {
                    name: 'Displaced Worker Ratio',
                    description: 'Workers displaced by technology as share of separations',
                    unit: '%',
                    source: 'calculated',
                    frequency: 'monthly',
                    ai_relevance: 'critical',
                    direction: 'lower_better'
                },
                skill_premium: {
                    name: 'AI Skill Premium',
                    description: 'Wage premium for AI-complementary skills',
                    unit: '%',
                    source: 'calculated',
                    frequency: 'annual',
                    ai_relevance: 'high',
                    direction: 'context_dependent'
                },
                task_automation_rate: {
                    name: 'Task Automation Rate',
                    description: 'Percentage of tasks automated by AI/ML',
                    unit: '%',
                    source: 'estimated',
                    frequency: 'annual',
                    ai_relevance: 'critical',
                    direction: 'context_dependent'
                },
                new_job_creation_rate: {
                    name: 'AI-Related Job Creation',
                    description: 'New jobs created in AI-related fields',
                    unit: 'thousands/month',
                    source: 'BLS/Indeed',
                    frequency: 'monthly',
                    ai_relevance: 'critical',
                    direction: 'higher_better'
                }
            },

            // Sector-Specific Indicators
            sector: {
                sector_employment_change: {
                    name: 'Sector Employment Change',
                    description: 'Year-over-year employment change by sector',
                    unit: '%',
                    source: 'BLS',
                    frequency: 'monthly',
                    ai_relevance: 'high',
                    direction: 'context_dependent'
                },
                sector_productivity: {
                    name: 'Sector Productivity',
                    description: 'Labor productivity by sector',
                    unit: 'index',
                    source: 'BLS',
                    frequency: 'annual',
                    ai_relevance: 'high',
                    direction: 'higher_better'
                },
                sector_automation_exposure: {
                    name: 'Sector Automation Exposure',
                    description: 'Automation risk score by sector',
                    unit: 'index 0-1',
                    source: 'calculated',
                    frequency: 'annual',
                    ai_relevance: 'critical',
                    direction: 'context_dependent'
                }
            },

            // Skills & Education
            skills: {
                skill_mismatch_index: {
                    name: 'Skill Mismatch Index',
                    description: 'Gap between job requirements and worker skills',
                    unit: 'index',
                    source: 'calculated',
                    frequency: 'annual',
                    ai_relevance: 'high',
                    direction: 'lower_better'
                },
                retraining_participation: {
                    name: 'Retraining Participation Rate',
                    description: 'Workers enrolled in retraining programs',
                    unit: '%',
                    source: 'DOL',
                    frequency: 'annual',
                    ai_relevance: 'high',
                    direction: 'higher_better'
                },
                education_wage_premium: {
                    name: 'Education Wage Premium',
                    description: 'Wage difference by education level',
                    unit: '%',
                    source: 'BLS',
                    frequency: 'annual',
                    ai_relevance: 'medium',
                    direction: 'context_dependent'
                },
                stem_employment_share: {
                    name: 'STEM Employment Share',
                    description: 'Percentage of employment in STEM fields',
                    unit: '%',
                    source: 'BLS',
                    frequency: 'annual',
                    ai_relevance: 'medium',
                    direction: 'context_dependent'
                }
            }
        };
    }

    /**
     * Define weights for composite index calculation
     */
    defineWeights() {
        return {
            ai_impact_composite: {
                automation_exposure_index: 0.25,
                displaced_worker_ratio: 0.20,
                productivity_wage_gap: 0.15,
                ai_adoption_rate: 0.15,
                new_job_creation_rate: 0.10,
                skill_mismatch_index: 0.10,
                wage_polarization: 0.05
            },
            labor_market_health: {
                unemployment_rate: 0.30,
                labor_force_participation: 0.15,
                real_wage_growth: 0.20,
                job_openings: 0.15,
                underemployment_rate: 0.10,
                unemployment_duration: 0.10
            }
        };
    }

    /**
     * Calculate AI Impact Composite Score
     */
    calculateAIImpactScore(values) {
        const weights = this.weights.ai_impact_composite;
        let score = 0;
        let totalWeight = 0;

        for (const [indicator, weight] of Object.entries(weights)) {
            if (values[indicator] !== undefined) {
                // Normalize values to 0-100 scale
                let normalizedValue = this.normalizeValue(indicator, values[indicator]);
                score += normalizedValue * weight;
                totalWeight += weight;
            }
        }

        return totalWeight > 0 ? score / totalWeight : null;
    }

    /**
     * Calculate Labor Market Health Score
     */
    calculateLaborMarketHealth(values) {
        const weights = this.weights.labor_market_health;
        let score = 100; // Start at 100, subtract for problems

        // Lower unemployment is better
        if (values.unemployment_rate !== undefined) {
            score -= (values.unemployment_rate - 4) * 5 * weights.unemployment_rate;
        }

        // Higher LFPR is generally better
        if (values.labor_force_participation !== undefined) {
            score += (values.labor_force_participation - 62) * 2 * weights.labor_force_participation;
        }

        // Positive wage growth is better
        if (values.real_wage_growth !== undefined) {
            score += values.real_wage_growth * 5 * weights.real_wage_growth;
        }

        return Math.max(0, Math.min(100, score));
    }

    /**
     * Normalize indicator value to 0-100 scale
     */
    normalizeValue(indicator, value) {
        const ranges = {
            automation_exposure_index: { min: 0, max: 100 },
            displaced_worker_ratio: { min: 0, max: 20 },
            productivity_wage_gap: { min: -5, max: 10 },
            ai_adoption_rate: { min: 0, max: 100 },
            new_job_creation_rate: { min: -100, max: 500 },
            skill_mismatch_index: { min: 0, max: 100 },
            wage_polarization: { min: 2, max: 8 },
            unemployment_rate: { min: 2, max: 15 }
        };

        const range = ranges[indicator] || { min: 0, max: 100 };
        return ((value - range.min) / (range.max - range.min)) * 100;
    }

    /**
     * Get indicator metadata
     */
    getIndicatorInfo(category, indicator) {
        if (this.indicators[category] && this.indicators[category][indicator]) {
            return this.indicators[category][indicator];
        }
        return null;
    }

    /**
     * Get all indicators for a category
     */
    getCategoryIndicators(category) {
        return this.indicators[category] || {};
    }

    /**
     * Get list of all indicator categories
     */
    getCategories() {
        return Object.keys(this.indicators);
    }

    /**
     * Calculate sector automation exposure
     */
    calculateSectorExposure(sectorData) {
        const exposures = {};

        for (const [sector, data] of Object.entries(sectorData)) {
            exposures[sector] = {
                name: sector.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                exposure: data.automation_exposure,
                employment: data.employment,
                at_risk_jobs: Math.round(data.employment * data.automation_exposure),
                risk_level: this.getRiskLevel(data.automation_exposure)
            };
        }

        return exposures;
    }

    /**
     * Get risk level category
     */
    getRiskLevel(exposure) {
        if (exposure >= 0.7) return 'high';
        if (exposure >= 0.5) return 'medium-high';
        if (exposure >= 0.3) return 'medium';
        return 'low';
    }

    /**
     * Calculate jobs at risk summary
     */
    calculateJobsAtRisk(sectorData) {
        let totalEmployment = 0;
        let totalAtRisk = 0;
        const byRiskLevel = { high: 0, 'medium-high': 0, medium: 0, low: 0 };

        for (const data of Object.values(sectorData)) {
            totalEmployment += data.employment;
            const atRisk = data.employment * data.automation_exposure;
            totalAtRisk += atRisk;

            const level = this.getRiskLevel(data.automation_exposure);
            byRiskLevel[level] += data.employment;
        }

        return {
            total_employment: totalEmployment,
            total_at_risk: Math.round(totalAtRisk),
            percentage_at_risk: ((totalAtRisk / totalEmployment) * 100).toFixed(1),
            by_risk_level: byRiskLevel
        };
    }

    /**
     * Project indicator values based on scenario
     */
    projectIndicator(currentValue, targetYear, scenario) {
        const years = targetYear - new Date().getFullYear();
        const growth = scenario.annual_growth || 0;
        const shock = scenario.shock || 0;

        return currentValue * Math.pow(1 + growth, years) + shock;
    }

    /**
     * Export indicator definitions
     */
    exportDefinitions() {
        return JSON.stringify(this.indicators, null, 2);
    }
}

// Export for use in other modules
window.EconomicIndicators = EconomicIndicators;
