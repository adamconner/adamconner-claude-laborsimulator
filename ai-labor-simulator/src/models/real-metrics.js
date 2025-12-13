/**
 * Real Economic Metrics Module
 * Manages and displays real economic indicators with adjustment capabilities
 */

class RealMetricsSystem {
    constructor() {
        this.STORAGE_KEY = 'ai_labor_sim_real_metrics_adjustments';
        this.metrics = null;
        this.adjustments = this.loadAdjustments();
    }

    /**
     * Initialize metrics from baseline data
     */
    async initialize(dataService) {
        const baseline = await dataService.loadBaselineData();
        this.metrics = this.buildMetricsStructure(baseline);
        this.applyAdjustments();
        return this.metrics;
    }

    /**
     * Build structured metrics from baseline data
     */
    buildMetricsStructure(baseline) {
        return {
            labor_market: {
                category: 'Labor Market',
                icon: '👥',
                metrics: {
                    unemployment_rate: {
                        id: 'unemployment_rate',
                        name: 'Unemployment Rate',
                        shortName: 'UR',
                        description: 'Percentage of labor force that is unemployed and actively seeking work',
                        value: baseline.labor_market.unemployment_rate.value,
                        baseValue: baseline.labor_market.unemployment_rate.value,
                        unit: 'percent',
                        source: 'Bureau of Labor Statistics (BLS)',
                        sourceUrl: 'https://www.bls.gov/cps/',
                        seriesId: 'LNS14000000',
                        date: baseline.labor_market.unemployment_rate.date,
                        range: { min: 0, max: 25 },
                        methodology: 'Current Population Survey (CPS) - monthly household survey of ~60,000 households',
                        trend: 'stable',
                        manuallyAdjusted: false
                    },
                    total_employment: {
                        id: 'total_employment',
                        name: 'Total Nonfarm Employment',
                        shortName: 'EMP',
                        description: 'Total number of persons employed in nonfarm industries',
                        value: baseline.labor_market.total_employment.value,
                        baseValue: baseline.labor_market.total_employment.value,
                        unit: 'millions',
                        source: 'Bureau of Labor Statistics (BLS)',
                        sourceUrl: 'https://www.bls.gov/ces/',
                        seriesId: 'CES0000000001',
                        date: baseline.labor_market.total_employment.date,
                        range: { min: 100000000, max: 200000000 },
                        methodology: 'Current Employment Statistics (CES) - monthly survey of ~131,000 businesses',
                        trend: 'increasing',
                        manuallyAdjusted: false
                    },
                    labor_force_participation: {
                        id: 'labor_force_participation',
                        name: 'Labor Force Participation Rate',
                        shortName: 'LFPR',
                        description: 'Percentage of working-age population in the labor force',
                        value: baseline.labor_market.labor_force_participation.value,
                        baseValue: baseline.labor_market.labor_force_participation.value,
                        unit: 'percent',
                        source: 'Bureau of Labor Statistics (BLS)',
                        sourceUrl: 'https://www.bls.gov/cps/',
                        seriesId: 'LNS11300000',
                        date: baseline.labor_market.labor_force_participation.date,
                        range: { min: 50, max: 75 },
                        methodology: 'Current Population Survey (CPS) - labor force / civilian noninstitutional population',
                        trend: 'stable',
                        manuallyAdjusted: false
                    },
                    job_openings: {
                        id: 'job_openings',
                        name: 'Job Openings',
                        shortName: 'JO',
                        description: 'Total number of job openings on the last business day of the month',
                        value: baseline.labor_market.job_openings.value,
                        baseValue: baseline.labor_market.job_openings.value,
                        unit: 'millions',
                        source: 'Job Openings and Labor Turnover Survey (JOLTS)',
                        sourceUrl: 'https://www.bls.gov/jlt/',
                        seriesId: 'JTS000000000000000JOL',
                        date: baseline.labor_market.job_openings.date,
                        range: { min: 3000000, max: 15000000 },
                        methodology: 'JOLTS survey of ~21,000 establishments',
                        trend: 'decreasing',
                        manuallyAdjusted: false
                    },
                    quits_rate: {
                        id: 'quits_rate',
                        name: 'Quits Rate',
                        shortName: 'QR',
                        description: 'Voluntary separations as a percent of total employment',
                        value: baseline.labor_market.quits_rate.value,
                        baseValue: baseline.labor_market.quits_rate.value,
                        unit: 'percent',
                        source: 'Job Openings and Labor Turnover Survey (JOLTS)',
                        sourceUrl: 'https://www.bls.gov/jlt/',
                        seriesId: 'JTS000000000000000QUR',
                        date: baseline.labor_market.quits_rate.date,
                        range: { min: 1, max: 4 },
                        methodology: 'JOLTS - quits / total employment × 100',
                        trend: 'stable',
                        manuallyAdjusted: false
                    }
                }
            },
            wages: {
                category: 'Wages & Earnings',
                icon: '💰',
                metrics: {
                    average_hourly_earnings: {
                        id: 'average_hourly_earnings',
                        name: 'Average Hourly Earnings',
                        shortName: 'AHE',
                        description: 'Average hourly earnings of all employees on private nonfarm payrolls',
                        value: baseline.wages.average_hourly_earnings.value,
                        baseValue: baseline.wages.average_hourly_earnings.value,
                        unit: 'currency',
                        source: 'Bureau of Labor Statistics (BLS)',
                        sourceUrl: 'https://www.bls.gov/ces/',
                        seriesId: 'CES0500000003',
                        date: baseline.wages.average_hourly_earnings.date,
                        range: { min: 20, max: 60 },
                        methodology: 'Current Employment Statistics - total earnings / total hours',
                        trend: 'increasing',
                        manuallyAdjusted: false
                    },
                    median_weekly_earnings: {
                        id: 'median_weekly_earnings',
                        name: 'Median Weekly Earnings',
                        shortName: 'MWE',
                        description: 'Median usual weekly earnings of full-time wage and salary workers',
                        value: baseline.wages.median_weekly_earnings.value,
                        baseValue: baseline.wages.median_weekly_earnings.value,
                        unit: 'currency',
                        source: 'Bureau of Labor Statistics (BLS)',
                        sourceUrl: 'https://www.bls.gov/cps/',
                        seriesId: 'LEU0252881500',
                        date: baseline.wages.median_weekly_earnings.date,
                        range: { min: 500, max: 2000 },
                        methodology: 'Current Population Survey - median of all full-time workers',
                        trend: 'increasing',
                        manuallyAdjusted: false
                    },
                    real_wage_growth: {
                        id: 'real_wage_growth',
                        name: 'Real Wage Growth',
                        shortName: 'RWG',
                        description: 'Year-over-year change in inflation-adjusted wages',
                        value: baseline.wages.real_wage_growth.value,
                        baseValue: baseline.wages.real_wage_growth.value,
                        unit: 'percent',
                        source: 'Bureau of Labor Statistics (BLS)',
                        sourceUrl: 'https://www.bls.gov/',
                        date: baseline.wages.real_wage_growth.date,
                        range: { min: -5, max: 10 },
                        methodology: 'Nominal wage growth minus CPI inflation rate',
                        trend: 'stable',
                        manuallyAdjusted: false
                    }
                }
            },
            productivity: {
                category: 'Productivity',
                icon: '📈',
                metrics: {
                    labor_productivity_growth: {
                        id: 'labor_productivity_growth',
                        name: 'Labor Productivity Growth',
                        shortName: 'LPG',
                        description: 'Year-over-year change in output per hour worked',
                        value: baseline.productivity.labor_productivity_growth.value,
                        baseValue: baseline.productivity.labor_productivity_growth.value,
                        unit: 'percent',
                        source: 'Bureau of Labor Statistics (BLS)',
                        sourceUrl: 'https://www.bls.gov/lpc/',
                        seriesId: 'PRS85006092',
                        date: baseline.productivity.labor_productivity_growth.date,
                        range: { min: -3, max: 8 },
                        methodology: 'Major Sector Productivity Program - real output / hours worked',
                        trend: 'increasing',
                        manuallyAdjusted: false
                    },
                    output_per_hour: {
                        id: 'output_per_hour',
                        name: 'Output Per Hour Index',
                        shortName: 'OPH',
                        description: 'Index of output per hour of all persons (2017=100)',
                        value: baseline.productivity.output_per_hour.value,
                        baseValue: baseline.productivity.output_per_hour.value,
                        unit: 'index',
                        source: 'Bureau of Labor Statistics (BLS)',
                        sourceUrl: 'https://www.bls.gov/lpc/',
                        seriesId: 'PRS85006093',
                        date: baseline.productivity.output_per_hour.date,
                        range: { min: 90, max: 150 },
                        methodology: 'Major Sector Productivity Program - indexed to 2017 base year',
                        trend: 'increasing',
                        manuallyAdjusted: false
                    },
                    unit_labor_costs: {
                        id: 'unit_labor_costs',
                        name: 'Unit Labor Costs Growth',
                        shortName: 'ULC',
                        description: 'Year-over-year change in labor costs per unit of output',
                        value: baseline.productivity.unit_labor_costs.value,
                        baseValue: baseline.productivity.unit_labor_costs.value,
                        unit: 'percent',
                        source: 'Bureau of Labor Statistics (BLS)',
                        sourceUrl: 'https://www.bls.gov/lpc/',
                        seriesId: 'PRS85006112',
                        date: baseline.productivity.unit_labor_costs.date,
                        range: { min: -3, max: 8 },
                        methodology: 'Major Sector Productivity - compensation / productivity',
                        trend: 'stable',
                        manuallyAdjusted: false
                    }
                }
            },
            demographics: {
                category: 'Demographics',
                icon: '👨‍👩‍👧‍👦',
                metrics: {
                    working_age_population: {
                        id: 'working_age_population',
                        name: 'Working Age Population',
                        shortName: 'WAP',
                        description: 'Civilian noninstitutional population 16 years and older',
                        value: baseline.demographics.working_age_population.value,
                        baseValue: baseline.demographics.working_age_population.value,
                        unit: 'millions',
                        source: 'U.S. Census Bureau',
                        sourceUrl: 'https://www.census.gov/',
                        date: '2024',
                        range: { min: 180000000, max: 250000000 },
                        methodology: 'Census population estimates and American Community Survey',
                        trend: 'increasing',
                        manuallyAdjusted: false
                    }
                }
            }
        };
    }

    /**
     * Get all metrics in flat format
     */
    getAllMetrics() {
        const allMetrics = {};
        if (!this.metrics) return allMetrics;

        Object.values(this.metrics).forEach(category => {
            Object.entries(category.metrics).forEach(([id, metric]) => {
                allMetrics[id] = {
                    ...metric,
                    category: category.category,
                    categoryIcon: category.icon
                };
            });
        });
        return allMetrics;
    }

    /**
     * Get metrics grouped by category
     */
    getMetricsByCategory() {
        return this.metrics;
    }

    /**
     * Get a single metric
     */
    getMetric(id) {
        const all = this.getAllMetrics();
        return all[id] || null;
    }

    /**
     * Set metric value (manual adjustment)
     */
    setMetricValue(id, value) {
        const metric = this.findMetricById(id);
        if (metric) {
            metric.value = parseFloat(value);
            metric.manuallyAdjusted = true;
            this.saveAdjustments();
        }
    }

    /**
     * Find metric by ID across all categories
     */
    findMetricById(id) {
        if (!this.metrics) return null;

        for (const category of Object.values(this.metrics)) {
            if (category.metrics[id]) {
                return category.metrics[id];
            }
        }
        return null;
    }

    /**
     * Reset a single metric to base value
     */
    resetMetric(id) {
        const metric = this.findMetricById(id);
        if (metric) {
            metric.value = metric.baseValue;
            metric.manuallyAdjusted = false;
            this.saveAdjustments();
        }
    }

    /**
     * Reset all metrics to base values
     */
    resetAllMetrics() {
        if (!this.metrics) return;

        Object.values(this.metrics).forEach(category => {
            Object.values(category.metrics).forEach(metric => {
                metric.value = metric.baseValue;
                metric.manuallyAdjusted = false;
            });
        });
        localStorage.removeItem(this.STORAGE_KEY);
    }

    /**
     * Save adjustments to localStorage
     */
    saveAdjustments() {
        if (!this.metrics) return;

        const adjustments = {};
        Object.values(this.metrics).forEach(category => {
            Object.entries(category.metrics).forEach(([id, metric]) => {
                if (metric.manuallyAdjusted) {
                    adjustments[id] = metric.value;
                }
            });
        });
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(adjustments));
    }

    /**
     * Load adjustments from localStorage
     */
    loadAdjustments() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            return saved ? JSON.parse(saved) : {};
        } catch (error) {
            console.error('Error loading metric adjustments:', error);
            return {};
        }
    }

    /**
     * Apply saved adjustments to metrics
     */
    applyAdjustments() {
        if (!this.metrics || !this.adjustments) return;

        Object.entries(this.adjustments).forEach(([id, value]) => {
            const metric = this.findMetricById(id);
            if (metric) {
                metric.value = value;
                metric.manuallyAdjusted = true;
            }
        });
    }

    /**
     * Get current values as object (for simulation)
     */
    getCurrentValues() {
        const values = {};
        const all = this.getAllMetrics();
        Object.entries(all).forEach(([id, metric]) => {
            values[id] = metric.value;
        });
        return values;
    }

    /**
     * Get data sources info
     */
    getDataSources() {
        return [
            {
                id: 'bls',
                name: 'Bureau of Labor Statistics (BLS)',
                type: 'Government',
                url: 'https://www.bls.gov/',
                description: 'Primary source for employment, unemployment, wages, and productivity data',
                metrics: ['Unemployment Rate', 'Employment', 'Wages', 'Productivity', 'JOLTS'],
                updateFrequency: 'Monthly/Quarterly'
            },
            {
                id: 'fred',
                name: 'Federal Reserve Economic Data (FRED)',
                type: 'Government',
                url: 'https://fred.stlouisfed.org/',
                description: 'Comprehensive database of economic time series from various sources',
                metrics: ['GDP', 'Interest Rates', 'Labor Share', 'Corporate Profits'],
                updateFrequency: 'Varies by series'
            },
            {
                id: 'census',
                name: 'U.S. Census Bureau',
                type: 'Government',
                url: 'https://www.census.gov/',
                description: 'Population estimates, demographic data, and economic surveys',
                metrics: ['Population', 'Demographics', 'Income Distribution'],
                updateFrequency: 'Annual/Decennial'
            },
            {
                id: 'jolts',
                name: 'Job Openings and Labor Turnover Survey (JOLTS)',
                type: 'Government',
                url: 'https://www.bls.gov/jlt/',
                description: 'Data on job openings, hires, and separations',
                metrics: ['Job Openings', 'Hires Rate', 'Quits Rate', 'Layoffs'],
                updateFrequency: 'Monthly'
            },
            {
                id: 'onet',
                name: 'O*NET (Occupational Information Network)',
                type: 'Government',
                url: 'https://www.onetonline.org/',
                description: 'Comprehensive database of occupational characteristics',
                metrics: ['Occupation Skills', 'Task Requirements', 'Work Activities'],
                updateFrequency: 'Annual'
            }
        ];
    }
}

// Global instance
const realMetricsSystem = new RealMetricsSystem();
