/**
 * Monte Carlo Simulation Feature
 * Runs multiple iterations with randomized parameters to show probability distributions
 */

class MonteCarloSimulation {
    constructor(simulationEngine) {
        this.engine = simulationEngine;
        this.iterations = 1000;
        this.results = null;
        this.isRunning = false;
        this.progress = 0;
    }

    /**
     * Configure Monte Carlo parameters
     */
    configure(options = {}) {
        this.iterations = options.iterations || 1000;
        this.parameterRanges = {
            // AI adoption variation (+/- percentage points)
            ai_adoption_variance: options.ai_adoption_variance || 15,
            // Productivity growth variance (+/- percentage points)
            productivity_variance: options.productivity_variance || 1.5,
            // New job multiplier variance
            job_multiplier_variance: options.job_multiplier_variance || 0.15,
            // Displacement lag variance (months)
            displacement_lag_variance: options.displacement_lag_variance || 3,
            // GDP growth variance
            gdp_variance: options.gdp_variance || 1.0,
            // Labor elasticity variance
            elasticity_variance: options.elasticity_variance || 0.2
        };
    }

    /**
     * Run Monte Carlo simulation
     * @param {Object} baseScenario - Base scenario configuration
     * @param {Function} progressCallback - Called with progress updates
     * @returns {Object} Monte Carlo results with distributions
     */
    async run(baseScenario, progressCallback = null) {
        this.isRunning = true;
        this.progress = 0;
        const allResults = [];

        // Store original scenario
        const originalScenario = { ...this.engine.currentScenario };

        try {
            for (let i = 0; i < this.iterations; i++) {
                // Create randomized scenario
                const randomizedConfig = this.randomizeScenario(baseScenario);

                // Create and run scenario
                this.engine.createScenario(randomizedConfig);
                const result = await this.engine.runSimulation();

                // Store key metrics from final state
                allResults.push(this.extractKeyMetrics(result));

                // Update progress
                this.progress = ((i + 1) / this.iterations) * 100;
                if (progressCallback && i % 50 === 0) {
                    progressCallback(this.progress);
                }
            }

            // Restore original scenario
            this.engine.currentScenario = originalScenario;

            // Analyze results
            this.results = this.analyzeDistributions(allResults);
            this.isRunning = false;

            return this.results;
        } catch (error) {
            this.isRunning = false;
            this.engine.currentScenario = originalScenario;
            throw error;
        }
    }

    /**
     * Randomize scenario parameters within configured ranges
     */
    randomizeScenario(baseConfig) {
        const config = JSON.parse(JSON.stringify(baseConfig));
        const ranges = this.parameterRanges;

        // Randomize AI adoption rate
        config.ai_adoption_rate = this.randomize(
            config.ai_adoption_rate || 50,
            ranges.ai_adoption_variance
        );

        // Randomize productivity growth
        config.productivity_growth = this.randomize(
            config.productivity_growth || 3,
            ranges.productivity_variance
        );

        // Randomize new job multiplier
        config.new_job_multiplier = Math.max(0.1, this.randomize(
            config.new_job_multiplier || 0.3,
            ranges.job_multiplier_variance
        ));

        // Randomize displacement lag
        config.displacement_lag = Math.max(1, Math.round(this.randomize(
            config.displacement_lag || 6,
            ranges.displacement_lag_variance
        )));

        // Randomize GDP growth
        config.gdp_growth = this.randomize(
            config.gdp_growth || 2.0,
            ranges.gdp_variance
        );

        // Randomize labor elasticity
        config.labor_elasticity = this.randomize(
            config.labor_elasticity || -0.5,
            ranges.elasticity_variance
        );

        return config;
    }

    /**
     * Add Gaussian noise to a value
     */
    randomize(value, variance) {
        // Box-Muller transform for normal distribution
        const u1 = Math.random();
        const u2 = Math.random();
        const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        return value + z * (variance / 2);
    }

    /**
     * Extract key metrics from simulation result
     */
    extractKeyMetrics(result) {
        const summary = result.summary;
        const finalResult = result.results[result.results.length - 1];
        const yearlyResults = this.getYearlySnapshots(result.results);

        // Use correct property paths from simulation engine's generateSummary
        return {
            // Final state metrics
            final_unemployment: parseFloat(summary.labor_market_changes.unemployment_rate.final),
            final_employment: finalResult.labor_market.total_employment,
            cumulative_displacement: summary.ai_impact.cumulative_displacement,
            cumulative_new_jobs: summary.ai_impact.cumulative_new_jobs,
            net_job_change: summary.ai_impact.net_impact,
            final_ai_adoption: finalResult.ai_adoption,
            final_productivity: finalResult.productivity.growth_rate,
            final_wage_growth: parseFloat(summary.wages.average_hourly.change_percent),

            // Yearly trajectory
            yearly: yearlyResults
        };
    }

    /**
     * Get yearly snapshots from results
     */
    getYearlySnapshots(results) {
        const yearly = {};
        results.forEach(r => {
            const year = Math.floor(r.year);
            if (!yearly[year] || r.year === year) {
                yearly[year] = {
                    unemployment: r.labor_market.unemployment_rate,
                    employment: r.labor_market.total_employment,
                    ai_adoption: r.ai_adoption,
                    productivity: r.productivity.growth_rate
                };
            }
        });
        return yearly;
    }

    /**
     * Analyze distributions from all iterations
     */
    analyzeDistributions(allResults) {
        const metrics = [
            'final_unemployment',
            'final_employment',
            'cumulative_displacement',
            'cumulative_new_jobs',
            'net_job_change',
            'final_ai_adoption',
            'final_productivity',
            'final_wage_growth'
        ];

        const distributions = {};

        metrics.forEach(metric => {
            const values = allResults.map(r => r[metric]).filter(v => !isNaN(v)).sort((a, b) => a - b);
            distributions[metric] = this.calculateDistributionStats(values);
        });

        // Calculate yearly distributions
        const years = Object.keys(allResults[0].yearly).map(Number).sort((a, b) => a - b);
        const yearlyDistributions = {};

        years.forEach(year => {
            const yearMetrics = ['unemployment', 'employment', 'ai_adoption', 'productivity'];
            yearlyDistributions[year] = {};

            yearMetrics.forEach(metric => {
                const values = allResults
                    .map(r => r.yearly[year]?.[metric])
                    .filter(v => v !== undefined && !isNaN(v))
                    .sort((a, b) => a - b);
                yearlyDistributions[year][metric] = this.calculateDistributionStats(values);
            });
        });

        return {
            iterations: this.iterations,
            distributions,
            yearlyDistributions,
            rawResults: allResults
        };
    }

    /**
     * Calculate distribution statistics
     */
    calculateDistributionStats(sortedValues) {
        if (sortedValues.length === 0) {
            return null;
        }

        const n = sortedValues.length;
        const mean = sortedValues.reduce((a, b) => a + b, 0) / n;
        const variance = sortedValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
        const stdDev = Math.sqrt(variance);

        return {
            min: sortedValues[0],
            max: sortedValues[n - 1],
            mean: mean,
            median: this.percentile(sortedValues, 50),
            stdDev: stdDev,
            p5: this.percentile(sortedValues, 5),
            p10: this.percentile(sortedValues, 10),
            p25: this.percentile(sortedValues, 25),
            p75: this.percentile(sortedValues, 75),
            p90: this.percentile(sortedValues, 90),
            p95: this.percentile(sortedValues, 95),
            histogram: this.createHistogram(sortedValues, 20)
        };
    }

    /**
     * Calculate percentile value
     */
    percentile(sortedValues, p) {
        const index = (p / 100) * (sortedValues.length - 1);
        const lower = Math.floor(index);
        const upper = Math.ceil(index);
        const fraction = index - lower;

        if (lower === upper) {
            return sortedValues[lower];
        }
        return sortedValues[lower] * (1 - fraction) + sortedValues[upper] * fraction;
    }

    /**
     * Create histogram bins
     */
    createHistogram(sortedValues, bins) {
        const min = sortedValues[0];
        const max = sortedValues[sortedValues.length - 1];
        const binWidth = (max - min) / bins;
        const histogram = [];

        for (let i = 0; i < bins; i++) {
            const binStart = min + i * binWidth;
            const binEnd = min + (i + 1) * binWidth;
            const count = sortedValues.filter(v => v >= binStart && (i === bins - 1 ? v <= binEnd : v < binEnd)).length;
            histogram.push({
                binStart,
                binEnd,
                binMid: (binStart + binEnd) / 2,
                count,
                frequency: count / sortedValues.length
            });
        }

        return histogram;
    }

    /**
     * Get probability of outcome
     */
    getProbability(metric, threshold, comparison = 'less') {
        if (!this.results) return null;

        const dist = this.results.distributions[metric];
        if (!dist) return null;

        const values = this.results.rawResults.map(r => r[metric]).filter(v => !isNaN(v));
        let count;

        if (comparison === 'less') {
            count = values.filter(v => v < threshold).length;
        } else if (comparison === 'greater') {
            count = values.filter(v => v > threshold).length;
        } else {
            count = values.filter(v => v === threshold).length;
        }

        return count / values.length;
    }

    /**
     * Generate summary report
     */
    generateReport() {
        if (!this.results) return null;

        const dist = this.results.distributions;

        return {
            iterations: this.iterations,
            unemployment: {
                mostLikely: dist.final_unemployment.median,
                range: `${dist.final_unemployment.p10.toFixed(1)}% - ${dist.final_unemployment.p90.toFixed(1)}%`,
                confidence90: {
                    low: dist.final_unemployment.p5,
                    high: dist.final_unemployment.p95
                },
                probability_above_10: this.getProbability('final_unemployment', 10, 'greater')
            },
            displacement: {
                mostLikely: dist.cumulative_displacement.median,
                range: `${(dist.cumulative_displacement.p10 / 1000000).toFixed(1)}M - ${(dist.cumulative_displacement.p90 / 1000000).toFixed(1)}M`,
                confidence90: {
                    low: dist.cumulative_displacement.p5,
                    high: dist.cumulative_displacement.p95
                }
            },
            netJobChange: {
                mostLikely: dist.net_job_change.median,
                range: `${(dist.net_job_change.p10 / 1000000).toFixed(1)}M - ${(dist.net_job_change.p90 / 1000000).toFixed(1)}M`,
                probability_positive: this.getProbability('net_job_change', 0, 'greater')
            }
        };
    }
}

// Export for use
window.MonteCarloSimulation = MonteCarloSimulation;
