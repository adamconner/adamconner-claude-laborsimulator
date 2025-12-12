/**
 * Hypothetical AI Labor Market Indicators
 *
 * Based on research from:
 * - Anthropic Economic Index (https://www.anthropic.com/economic-index)
 * - MIT Iceberg Index (https://iceberg.mit.edu)
 * - IMF Labor Market Impact Research
 * - Yale Budget Lab Analysis
 * - Stanford Digital Economy Lab
 * - ILO Generative AI Reports
 * - BLS O*NET Task Framework
 */

class HypotheticalIndicatorsSystem {
    constructor() {
        // Storage key for custom indicators
        this.STORAGE_KEY = 'ai_labor_sim_hypothetical_indicators';
        this.CUSTOM_STORAGE_KEY = 'ai_labor_sim_custom_indicators';

        // Initialize built-in indicators
        this.indicators = this.getDefaultIndicators();

        // Load any saved adjustments
        this.loadSavedAdjustments();

        // Load custom indicators
        this.customIndicators = this.loadCustomIndicators();
    }

    /**
     * Get the top 10 research-based hypothetical indicators
     */
    getDefaultIndicators() {
        return {
            task_automation_rate: {
                id: 'task_automation_rate',
                name: 'Task Automation Rate',
                shortName: 'TAR',
                value: 43,
                baseValue: 43,
                unit: 'percent',
                description: 'Percentage of economic tasks performed via AI automation (vs. augmentation)',
                methodology: 'Measures the share of AI interactions that involve task delegation rather than human-AI collaboration',
                source: 'Anthropic Economic Index',
                sourceUrl: 'https://www.anthropic.com/economic-index',
                confidence: 'medium',
                category: 'automation',
                linkedMetrics: ['ai_adoption', 'productivity_growth'],
                linkageFormula: {
                    ai_adoption: 0.5,      // 1% AI adoption increase = 0.5% TAR increase
                    productivity_growth: 0.3
                },
                range: { min: 0, max: 100 },
                trend: 'increasing',
                icon: '🤖'
            },

            ai_occupational_exposure: {
                id: 'ai_occupational_exposure',
                name: 'AI Occupational Exposure Index',
                shortName: 'AIOE',
                value: 36,
                baseValue: 36,
                unit: 'percent_jobs_exposed',
                description: 'Percentage of jobs with significant AI exposure (25%+ of tasks)',
                methodology: 'Maps AI capabilities to O*NET occupational tasks to calculate exposure scores',
                source: 'Felten, Raj, Seamans (2023) / Anthropic Economic Index',
                sourceUrl: 'https://www.anthropic.com/news/the-anthropic-economic-index',
                confidence: 'high',
                category: 'exposure',
                linkedMetrics: ['unemployment_rate', 'ai_adoption'],
                linkageFormula: {
                    unemployment_rate: -0.8,  // Higher unemployment = lower exposure (paradox - layoffs reduce AI-exposed workforce)
                    ai_adoption: 0.4
                },
                range: { min: 0, max: 100 },
                trend: 'increasing',
                icon: '📊'
            },

            genai_workforce_adoption: {
                id: 'genai_workforce_adoption',
                name: 'GenAI Workforce Adoption Rate',
                shortName: 'GWAR',
                value: 23,
                baseValue: 23,
                unit: 'percent_workers',
                description: 'Percentage of workers using generative AI weekly for work tasks',
                methodology: 'Based on Real-Time Population Survey measuring actual workplace AI usage',
                source: 'Stanford Digital Economy Lab / Census surveys',
                sourceUrl: 'https://digitaleconomy.stanford.edu/',
                confidence: 'high',
                category: 'adoption',
                linkedMetrics: ['ai_adoption', 'productivity_growth'],
                linkageFormula: {
                    ai_adoption: 0.3,
                    productivity_growth: 0.2
                },
                range: { min: 0, max: 100 },
                trend: 'increasing',
                icon: '💼'
            },

            skills_transformation_score: {
                id: 'skills_transformation_score',
                name: 'Skills-Based Transformation Score',
                shortName: 'STS',
                value: 28,
                baseValue: 28,
                unit: 'index_0_100',
                description: 'Measures skills disruption invisible to traditional employment metrics',
                methodology: 'Models individual workers as agents with skills mapped across 32,000 skill categories',
                source: 'MIT Iceberg Index',
                sourceUrl: 'https://iceberg.mit.edu',
                confidence: 'medium',
                category: 'skills',
                linkedMetrics: ['ai_adoption', 'unemployment_rate', 'wage_growth'],
                linkageFormula: {
                    ai_adoption: 0.35,
                    unemployment_rate: 0.2,
                    wage_growth: -0.15
                },
                range: { min: 0, max: 100 },
                trend: 'increasing',
                icon: '🎯'
            },

            job_displacement_velocity: {
                id: 'job_displacement_velocity',
                name: 'AI Job Displacement Velocity',
                shortName: 'JDV',
                value: 0.8,
                baseValue: 0.8,
                unit: 'percent_monthly',
                description: 'Monthly rate of job displacement attributable to AI/automation',
                methodology: 'Isolates AI-related employment changes from cyclical and other structural factors',
                source: 'Yale Budget Lab / IMF Research',
                sourceUrl: 'https://budgetlab.yale.edu/',
                confidence: 'low',
                category: 'displacement',
                linkedMetrics: ['unemployment_rate', 'ai_adoption', 'automation_pace'],
                linkageFormula: {
                    unemployment_rate: 0.15,
                    ai_adoption: 0.08,
                    automation_pace: 0.25
                },
                range: { min: 0, max: 5 },
                trend: 'uncertain',
                icon: '⚡'
            },

            human_ai_collaboration_index: {
                id: 'human_ai_collaboration_index',
                name: 'Human-AI Collaboration Index',
                shortName: 'HACI',
                value: 57,
                baseValue: 57,
                unit: 'percent_augmented',
                description: 'Percentage of AI usage that augments (vs. replaces) human work',
                methodology: 'Classifies AI interactions as automation vs. augmentation based on human involvement',
                source: 'Anthropic Economic Index / ILO',
                sourceUrl: 'https://www.ilo.org/publications/generative-ai-and-jobs-2025-update',
                confidence: 'medium',
                category: 'collaboration',
                linkedMetrics: ['productivity_growth', 'wage_growth'],
                linkageFormula: {
                    productivity_growth: 0.25,
                    wage_growth: 0.15
                },
                range: { min: 0, max: 100 },
                trend: 'decreasing',  // Automation gaining on augmentation per latest data
                icon: '🤝'
            },

            ai_wage_premium: {
                id: 'ai_wage_premium',
                name: 'AI Skills Wage Premium',
                shortName: 'AIWP',
                value: 18,
                baseValue: 18,
                unit: 'percent_premium',
                description: 'Wage premium for workers with AI-complementary skills',
                methodology: 'Compares wages for similar roles with/without AI skill requirements',
                source: 'Research synthesis / Job posting analysis',
                sourceUrl: 'https://eig.org/ai-and-jobs-the-final-word/',
                confidence: 'medium',
                category: 'wages',
                linkedMetrics: ['wage_growth', 'ai_adoption', 'unemployment_rate'],
                linkageFormula: {
                    wage_growth: 0.5,
                    ai_adoption: 0.2,
                    unemployment_rate: -0.3
                },
                range: { min: -20, max: 50 },
                trend: 'increasing',
                icon: '💰'
            },

            emerging_role_creation: {
                id: 'emerging_role_creation',
                name: 'Emerging Role Creation Rate',
                shortName: 'ERCR',
                value: 2.1,
                baseValue: 2.1,
                unit: 'percent_new_roles',
                description: 'Annual rate of new job categories created by AI advancement',
                methodology: 'Tracks job postings for roles not in standard BLS occupation codes',
                source: 'BLS methodology gap / Indeed analysis',
                sourceUrl: 'https://www.bls.gov/opub/mlr/2025/article/incorporating-ai-impacts-in-bls-employment-projections.htm',
                confidence: 'low',
                category: 'creation',
                linkedMetrics: ['ai_adoption', 'productivity_growth', 'job_openings'],
                linkageFormula: {
                    ai_adoption: 0.05,
                    productivity_growth: 0.03,
                    job_openings: 0.02
                },
                range: { min: 0, max: 10 },
                trend: 'increasing',
                icon: '🌱'
            },

            regional_ai_vulnerability: {
                id: 'regional_ai_vulnerability',
                name: 'Regional AI Vulnerability Score',
                shortName: 'RAVS',
                value: 34,
                baseValue: 34,
                unit: 'index_0_100',
                description: 'Geographic concentration of AI displacement risk',
                methodology: 'Combines regional industry mix with occupation-level AI exposure',
                source: 'Anthropic Economic Index Geography / IMF',
                sourceUrl: 'https://www.anthropic.com/research/economic-index-geography',
                confidence: 'medium',
                category: 'geographic',
                linkedMetrics: ['unemployment_rate', 'ai_adoption'],
                linkageFormula: {
                    unemployment_rate: 0.4,
                    ai_adoption: 0.25
                },
                range: { min: 0, max: 100 },
                trend: 'increasing',
                icon: '🗺️'
            },

            labor_share_ai_impact: {
                id: 'labor_share_ai_impact',
                name: 'Labor Share AI Impact',
                shortName: 'LSAI',
                value: -0.8,
                baseValue: -0.8,
                unit: 'percent_annual_change',
                description: 'Annual change in labor share of income attributable to AI',
                methodology: 'Isolates AI contribution to labor-capital income shift',
                source: 'IMF Research / FRED data analysis',
                sourceUrl: 'https://www.imf.org/en/Publications/WP/Issues/2024/09/13/The-Labor-Market-Impact-of-Artificial-Intelligence-Evidence-from-US-Regions-554845',
                confidence: 'low',
                category: 'distribution',
                linkedMetrics: ['productivity_growth', 'wage_growth', 'ai_adoption'],
                linkageFormula: {
                    productivity_growth: -0.2,  // Higher productivity = more capital gains
                    wage_growth: 0.15,
                    ai_adoption: -0.1
                },
                range: { min: -5, max: 5 },
                trend: 'decreasing',
                icon: '⚖️'
            }
        };
    }

    /**
     * Get all indicators (built-in + custom)
     */
    getAllIndicators() {
        return { ...this.indicators, ...this.customIndicators };
    }

    /**
     * Get indicator by ID
     */
    getIndicator(id) {
        return this.indicators[id] || this.customIndicators[id];
    }

    /**
     * Update indicator value manually
     */
    setIndicatorValue(id, value) {
        const indicator = this.getIndicator(id);
        if (indicator) {
            indicator.value = Math.max(indicator.range.min, Math.min(indicator.range.max, value));
            indicator.manuallyAdjusted = true;
            this.saveAdjustments();
            return indicator;
        }
        return null;
    }

    /**
     * Reset indicator to base value
     */
    resetIndicator(id) {
        const indicator = this.getIndicator(id);
        if (indicator) {
            indicator.value = indicator.baseValue;
            indicator.manuallyAdjusted = false;
            this.saveAdjustments();
            return indicator;
        }
        return null;
    }

    /**
     * Reset all indicators to base values
     */
    resetAllIndicators() {
        Object.values(this.indicators).forEach(ind => {
            ind.value = ind.baseValue;
            ind.manuallyAdjusted = false;
        });
        this.saveAdjustments();
    }

    /**
     * Calculate indicator values based on real metrics
     * @param {Object} realMetrics - Current real metric values
     * @param {Object} baselineMetrics - Baseline real metric values for comparison
     */
    calculateFromRealMetrics(realMetrics, baselineMetrics) {
        const results = {};

        Object.entries(this.indicators).forEach(([id, indicator]) => {
            // Skip if manually adjusted
            if (indicator.manuallyAdjusted) {
                results[id] = indicator.value;
                return;
            }

            let newValue = indicator.baseValue;

            // Apply linkage formulas
            Object.entries(indicator.linkageFormula).forEach(([metric, coefficient]) => {
                const currentValue = realMetrics[metric];
                const baselineValue = baselineMetrics[metric];

                if (currentValue !== undefined && baselineValue !== undefined) {
                    const change = currentValue - baselineValue;
                    newValue += change * coefficient;
                }
            });

            // Clamp to range
            newValue = Math.max(indicator.range.min, Math.min(indicator.range.max, newValue));
            indicator.value = newValue;
            results[id] = newValue;
        });

        return results;
    }

    /**
     * Get projected indicator values for a simulation scenario
     */
    projectIndicators(scenarioParams) {
        const projections = {};
        const { ai_adoption, unemployment_rate, productivity_growth, wage_growth, automation_pace } = scenarioParams;

        // Map automation pace to numeric multiplier
        const paceMultiplier = {
            'slow': 0.7,
            'moderate': 1.0,
            'fast': 1.4,
            'accelerating': 1.8
        }[automation_pace] || 1.0;

        Object.entries(this.indicators).forEach(([id, indicator]) => {
            let projectedValue = indicator.baseValue;

            // Apply linkage with scenario parameters
            if (indicator.linkageFormula.ai_adoption && ai_adoption !== undefined) {
                const aiChange = ai_adoption - 35; // Baseline ~35%
                projectedValue += aiChange * indicator.linkageFormula.ai_adoption;
            }

            if (indicator.linkageFormula.unemployment_rate && unemployment_rate !== undefined) {
                const urChange = unemployment_rate - 4.1; // Baseline 4.1%
                projectedValue += urChange * indicator.linkageFormula.unemployment_rate;
            }

            if (indicator.linkageFormula.productivity_growth && productivity_growth !== undefined) {
                const prodChange = productivity_growth - 2.2; // Baseline 2.2%
                projectedValue += prodChange * indicator.linkageFormula.productivity_growth;
            }

            if (indicator.linkageFormula.wage_growth && wage_growth !== undefined) {
                const wageChange = wage_growth - 1.4; // Baseline 1.4%
                projectedValue += wageChange * indicator.linkageFormula.wage_growth;
            }

            if (indicator.linkageFormula.automation_pace) {
                projectedValue *= paceMultiplier;
            }

            // Clamp and store
            projectedValue = Math.max(indicator.range.min, Math.min(indicator.range.max, projectedValue));

            projections[id] = {
                ...indicator,
                projectedValue,
                change: projectedValue - indicator.baseValue,
                percentChange: ((projectedValue - indicator.baseValue) / Math.abs(indicator.baseValue || 1)) * 100
            };
        });

        return projections;
    }

    /**
     * Add a custom indicator
     */
    addCustomIndicator(config) {
        const id = config.id || `custom_${Date.now()}`;

        const newIndicator = {
            id,
            name: config.name,
            shortName: config.shortName || config.name.substring(0, 4).toUpperCase(),
            value: config.value || 0,
            baseValue: config.value || 0,
            unit: config.unit || 'index',
            description: config.description || '',
            methodology: config.methodology || 'User-defined metric',
            source: 'Custom',
            sourceUrl: '',
            confidence: 'user_defined',
            category: config.category || 'custom',
            linkedMetrics: config.linkedMetrics || [],
            linkageFormula: config.linkageFormula || {},
            range: config.range || { min: 0, max: 100 },
            trend: config.trend || 'unknown',
            icon: config.icon || '📌',
            isCustom: true
        };

        this.customIndicators[id] = newIndicator;
        this.saveCustomIndicators();
        return newIndicator;
    }

    /**
     * Remove a custom indicator
     */
    removeCustomIndicator(id) {
        if (this.customIndicators[id]) {
            delete this.customIndicators[id];
            this.saveCustomIndicators();
            return true;
        }
        return false;
    }

    /**
     * Update a custom indicator
     */
    updateCustomIndicator(id, updates) {
        if (this.customIndicators[id]) {
            Object.assign(this.customIndicators[id], updates);
            this.saveCustomIndicators();
            return this.customIndicators[id];
        }
        return null;
    }

    /**
     * Save adjustments to localStorage
     */
    saveAdjustments() {
        try {
            const adjustments = {};
            Object.entries(this.indicators).forEach(([id, ind]) => {
                if (ind.manuallyAdjusted) {
                    adjustments[id] = { value: ind.value, manuallyAdjusted: true };
                }
            });
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(adjustments));
        } catch (e) {
            console.error('Failed to save indicator adjustments:', e);
        }
    }

    /**
     * Load saved adjustments
     */
    loadSavedAdjustments() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                const adjustments = JSON.parse(saved);
                Object.entries(adjustments).forEach(([id, data]) => {
                    if (this.indicators[id]) {
                        this.indicators[id].value = data.value;
                        this.indicators[id].manuallyAdjusted = data.manuallyAdjusted;
                    }
                });
            }
        } catch (e) {
            console.error('Failed to load indicator adjustments:', e);
        }
    }

    /**
     * Save custom indicators
     */
    saveCustomIndicators() {
        try {
            localStorage.setItem(this.CUSTOM_STORAGE_KEY, JSON.stringify(this.customIndicators));
        } catch (e) {
            console.error('Failed to save custom indicators:', e);
        }
    }

    /**
     * Load custom indicators
     */
    loadCustomIndicators() {
        try {
            const saved = localStorage.getItem(this.CUSTOM_STORAGE_KEY);
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            console.error('Failed to load custom indicators:', e);
            return {};
        }
    }

    /**
     * Get indicators grouped by category
     */
    getIndicatorsByCategory() {
        const allIndicators = this.getAllIndicators();
        const categories = {};

        Object.values(allIndicators).forEach(ind => {
            const cat = ind.category || 'other';
            if (!categories[cat]) {
                categories[cat] = [];
            }
            categories[cat].push(ind);
        });

        return categories;
    }

    /**
     * Get category display names
     */
    getCategoryDisplayNames() {
        return {
            automation: 'Task Automation',
            exposure: 'AI Exposure',
            adoption: 'Adoption Metrics',
            skills: 'Skills & Training',
            displacement: 'Job Displacement',
            collaboration: 'Human-AI Collaboration',
            wages: 'Wage Impacts',
            creation: 'Job Creation',
            geographic: 'Geographic Impact',
            distribution: 'Income Distribution',
            custom: 'Custom Indicators'
        };
    }

    /**
     * Export all indicators for saving
     */
    exportIndicators() {
        return {
            builtIn: this.indicators,
            custom: this.customIndicators,
            exportDate: new Date().toISOString()
        };
    }

    /**
     * Import indicators from saved data
     */
    importIndicators(data) {
        if (data.builtIn) {
            Object.entries(data.builtIn).forEach(([id, ind]) => {
                if (this.indicators[id]) {
                    this.indicators[id].value = ind.value;
                    this.indicators[id].manuallyAdjusted = ind.manuallyAdjusted;
                }
            });
        }
        if (data.custom) {
            this.customIndicators = { ...this.customIndicators, ...data.custom };
        }
        this.saveAdjustments();
        this.saveCustomIndicators();
    }
}

// Global instance
const hypotheticalIndicators = new HypotheticalIndicatorsSystem();
