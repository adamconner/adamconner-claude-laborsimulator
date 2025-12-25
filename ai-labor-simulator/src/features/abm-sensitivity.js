/**
 * ABM Sensitivity Analysis
 * Analyzes parameter sensitivity specifically for Agent-Based Model simulations
 */

class ABMSensitivityAnalysis {
    constructor() {
        // ABM-specific parameters
        this.parameters = {
            numWorkers: {
                name: 'Number of Workers',
                baseValue: 1000,
                range: { min: 500, max: 2000, step: 250 },
                description: 'Total worker agents in simulation'
            },
            numFirms: {
                name: 'Number of Firms',
                baseValue: 100,
                range: { min: 50, max: 200, step: 25 },
                description: 'Total firm agents in simulation'
            },
            initialAIAdoption: {
                name: 'Initial AI Adoption',
                baseValue: 0.2,
                range: { min: 0.05, max: 0.4, step: 0.05 },
                format: 'percent',
                description: 'Starting AI adoption rate among firms'
            },
            aiAdoptionSpeed: {
                name: 'AI Adoption Speed',
                baseValue: 1.0,
                range: { min: 0.5, max: 2.0, step: 0.25 },
                description: 'Multiplier for AI adoption rate'
            },
            laborMarketFriction: {
                name: 'Labor Market Friction',
                baseValue: 0.1,
                range: { min: 0.02, max: 0.25, step: 0.03 },
                format: 'percent',
                description: 'Difficulty of job matching'
            },
            retrainingEffectiveness: {
                name: 'Retraining Effectiveness',
                baseValue: 0.3,
                range: { min: 0.1, max: 0.6, step: 0.1 },
                format: 'percent',
                description: 'Success rate of retraining programs'
            },
            wageFlexibility: {
                name: 'Wage Flexibility',
                baseValue: 0.05,
                range: { min: 0.01, max: 0.15, step: 0.02 },
                format: 'percent',
                description: 'How quickly wages adjust to market conditions'
            },
            informationSpread: {
                name: 'Information Spread Rate',
                baseValue: 0.1,
                range: { min: 0.02, max: 0.2, step: 0.03 },
                format: 'percent',
                description: 'Rate at which workers learn about opportunities'
            }
        };

        // Outcomes to measure
        this.outcomes = {
            finalUnemployment: {
                name: 'Final Unemployment Rate',
                format: 'percent',
                extractor: (results) => results.summary.final.unemploymentRate
            },
            peakUnemployment: {
                name: 'Peak Unemployment',
                format: 'percent',
                extractor: (results) => results.summary.peakUnemployment
            },
            netJobChange: {
                name: 'Net Job Change',
                format: 'number',
                extractor: (results) => results.summary.totalHires - results.summary.totalLayoffs
            },
            totalDisplacement: {
                name: 'Total Displaced',
                format: 'number',
                extractor: (results) => results.summary.totalLayoffs
            },
            aiAdoptionFinal: {
                name: 'Final AI Adoption',
                format: 'percent',
                extractor: (results) => results.summary.final.aiAdoptionRate
            },
            avgPolicySupport: {
                name: 'Avg Policy Support',
                format: 'percent',
                extractor: (results) => {
                    const ps = results.summary.finalPolicySupport;
                    if (!ps) return 0;
                    const values = Object.values(ps).map(p => p.mean || 0);
                    return values.reduce((a, b) => a + b, 0) / values.length;
                }
            }
        };

        this.analysisCache = new Map();
        this.isRunning = false;
    }

    /**
     * Run single parameter sensitivity analysis
     */
    async runSingleParameterAnalysis(paramId, engine, baseConfig, progressCallback) {
        const param = this.parameters[paramId];
        if (!param) return null;

        const results = [];
        const testValues = this.generateTestValues(param);

        for (let i = 0; i < testValues.length; i++) {
            const value = testValues[i];

            if (progressCallback) {
                progressCallback({
                    parameter: param.name,
                    current: i + 1,
                    total: testValues.length,
                    value
                });
            }

            // Create modified config
            const config = this.applyParameterValue(baseConfig, paramId, value);

            try {
                // Run ABM simulation
                const simResults = await this.runABMSimulation(engine, config);

                // Extract outcomes
                const outcomeValues = {};
                Object.entries(this.outcomes).forEach(([id, outcome]) => {
                    try {
                        outcomeValues[id] = outcome.extractor(simResults);
                    } catch (e) {
                        outcomeValues[id] = null;
                    }
                });

                results.push({
                    paramValue: value,
                    outcomes: outcomeValues
                });
            } catch (error) {
                console.error(`ABM sensitivity error at ${paramId}=${value}:`, error);
            }
        }

        return {
            parameter: param,
            parameterId: paramId,
            results,
            baseValue: param.baseValue
        };
    }

    /**
     * Generate test values for a parameter
     */
    generateTestValues(param) {
        const values = [];
        for (let v = param.range.min; v <= param.range.max; v += param.range.step) {
            values.push(Math.round(v * 1000) / 1000); // Avoid floating point issues
        }
        return values;
    }

    /**
     * Apply parameter value to config
     */
    applyParameterValue(baseConfig, paramId, value) {
        const config = JSON.parse(JSON.stringify(baseConfig));

        switch (paramId) {
            case 'numWorkers':
                config.numWorkers = value;
                break;
            case 'numFirms':
                config.numFirms = value;
                break;
            case 'initialAIAdoption':
                config.initialAIAdoption = value;
                break;
            case 'aiAdoptionSpeed':
                config.aiAdoptionSpeed = value;
                break;
            case 'laborMarketFriction':
                config.laborMarketFriction = value;
                break;
            case 'retrainingEffectiveness':
                config.retrainingEffectiveness = value;
                break;
            case 'wageFlexibility':
                config.wageFlexibility = value;
                break;
            case 'informationSpread':
                config.informationSpread = value;
                break;
        }

        return config;
    }

    /**
     * Run ABM simulation with given config
     */
    async runABMSimulation(engine, config) {
        // This integrates with the ABM engine
        if (typeof engine.runSimulation === 'function') {
            return await engine.runSimulation(config);
        }

        // Fallback: create mock results for development
        return this.generateMockResults(config);
    }

    /**
     * Generate mock results for development/testing
     */
    generateMockResults(config) {
        const baseUR = 0.05 + Math.random() * 0.03;
        const adoptionFactor = config.initialAIAdoption || 0.2;
        const frictionFactor = config.laborMarketFriction || 0.1;

        return {
            summary: {
                initial: { unemploymentRate: 0.05, aiAdoptionRate: adoptionFactor },
                final: {
                    unemploymentRate: baseUR + frictionFactor * 0.5 - adoptionFactor * 0.2,
                    aiAdoptionRate: Math.min(0.9, adoptionFactor + 0.4)
                },
                peakUnemployment: baseUR + frictionFactor * 0.8,
                totalHires: Math.floor(100000 * (1 - frictionFactor)),
                totalLayoffs: Math.floor(80000 * adoptionFactor),
                finalPolicySupport: {
                    ubi: { mean: 0.4 + adoptionFactor * 0.3 },
                    retraining: { mean: 0.5 + frictionFactor * 0.2 }
                }
            }
        };
    }

    /**
     * Calculate sensitivity metrics from analysis results
     */
    calculateMetrics(analysisResults) {
        if (!analysisResults || analysisResults.results.length < 2) return null;

        const metrics = {};

        Object.entries(this.outcomes).forEach(([outcomeId, outcome]) => {
            const values = analysisResults.results
                .map(r => r.outcomes[outcomeId])
                .filter(v => v !== null && v !== undefined && !isNaN(v));

            if (values.length < 2) return;

            const min = Math.min(...values);
            const max = Math.max(...values);
            const range = max - min;
            const mean = values.reduce((a, b) => a + b, 0) / values.length;
            const stdDev = Math.sqrt(
                values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length
            );

            // Calculate coefficient of variation
            const cv = mean !== 0 ? (stdDev / Math.abs(mean)) * 100 : 0;

            // Calculate elasticity
            const paramValues = analysisResults.results.map(r => r.paramValue);
            const paramRange = Math.max(...paramValues) - Math.min(...paramValues);
            const paramMean = analysisResults.parameter.baseValue;
            const elasticity = paramRange > 0 && paramMean > 0
                ? (range / mean) / (paramRange / paramMean)
                : 0;

            metrics[outcomeId] = {
                name: outcome.name,
                format: outcome.format,
                min,
                max,
                range,
                mean,
                stdDev,
                cv,
                elasticity: Math.abs(elasticity),
                sensitivity: this.getSensitivityLevel(Math.abs(elasticity), cv)
            };
        });

        return metrics;
    }

    /**
     * Determine sensitivity level
     */
    getSensitivityLevel(elasticity, cv) {
        const score = elasticity * 0.6 + (cv / 100) * 0.4;

        if (score >= 0.8) return { level: 'critical', color: '#ef4444', label: 'Critical' };
        if (score >= 0.5) return { level: 'high', color: '#f97316', label: 'High' };
        if (score >= 0.25) return { level: 'medium', color: '#fbbf24', label: 'Medium' };
        return { level: 'low', color: '#10b981', label: 'Low' };
    }

    /**
     * Run multi-parameter analysis
     */
    async runMultiParameterAnalysis(paramIds, engine, baseConfig, progressCallback) {
        const results = {};

        for (let i = 0; i < paramIds.length; i++) {
            const paramId = paramIds[i];

            if (progressCallback) {
                progressCallback({
                    phase: 'parameter',
                    current: i + 1,
                    total: paramIds.length,
                    paramName: this.parameters[paramId]?.name
                });
            }

            results[paramId] = await this.runSingleParameterAnalysis(
                paramId,
                engine,
                baseConfig,
                (p) => {
                    if (progressCallback) {
                        progressCallback({
                            phase: 'simulation',
                            parameter: p.parameter,
                            current: p.current,
                            total: p.total,
                            paramIndex: i + 1,
                            paramTotal: paramIds.length
                        });
                    }
                }
            );
        }

        return results;
    }

    /**
     * Generate tornado chart data for comparison
     */
    generateTornadoData(multiResults, outcomeId = 'finalUnemployment') {
        const data = [];

        Object.entries(multiResults).forEach(([paramId, analysis]) => {
            if (!analysis || !analysis.results.length) return;

            const values = analysis.results
                .map(r => r.outcomes[outcomeId])
                .filter(v => v !== null && !isNaN(v));

            if (values.length < 2) return;

            const param = this.parameters[paramId];
            const baseValue = this.getBaseOutcome(analysis, outcomeId);
            const min = Math.min(...values);
            const max = Math.max(...values);

            data.push({
                parameterId: paramId,
                parameter: param.name,
                low: min,
                high: max,
                range: max - min,
                baseValue,
                lowDiff: min - baseValue,
                highDiff: max - baseValue
            });
        });

        // Sort by range (largest impact first)
        data.sort((a, b) => b.range - a.range);

        return data;
    }

    /**
     * Get base outcome value
     */
    getBaseOutcome(analysis, outcomeId) {
        if (!analysis || !analysis.results.length) return 0;

        const baseResult = analysis.results.find(r =>
            Math.abs(r.paramValue - analysis.baseValue) < 0.001
        );

        return baseResult?.outcomes[outcomeId] || analysis.results[0].outcomes[outcomeId] || 0;
    }

    /**
     * Render sensitivity analysis dashboard
     */
    renderDashboard(containerId, multiResults) {
        const container = document.getElementById(containerId);
        if (!container) return;

        let html = '';

        // Summary cards
        html += this.renderSummaryCards(multiResults);

        // Tornado chart
        html += this.renderTornadoChart(multiResults);

        // Detailed parameter tables
        html += this.renderParameterTables(multiResults);

        container.innerHTML = html;
    }

    /**
     * Render summary cards
     */
    renderSummaryCards(multiResults) {
        const paramCount = Object.keys(multiResults).length;
        const allMetrics = {};

        Object.entries(multiResults).forEach(([paramId, analysis]) => {
            const metrics = this.calculateMetrics(analysis);
            if (metrics) {
                allMetrics[paramId] = metrics;
            }
        });

        // Find most sensitive parameters
        const sensitivities = [];
        Object.entries(allMetrics).forEach(([paramId, metrics]) => {
            const avgElasticity = Object.values(metrics)
                .reduce((sum, m) => sum + m.elasticity, 0) / Object.keys(metrics).length;

            sensitivities.push({
                paramId,
                name: this.parameters[paramId].name,
                avgElasticity,
                level: this.getSensitivityLevel(avgElasticity, 50)
            });
        });

        sensitivities.sort((a, b) => b.avgElasticity - a.avgElasticity);

        const mostSensitive = sensitivities[0];
        const leastSensitive = sensitivities[sensitivities.length - 1];
        const criticalCount = sensitivities.filter(s => s.level.level === 'critical' || s.level.level === 'high').length;

        return `
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;">
                <div style="background: var(--gray-50); padding: 16px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 2rem; font-weight: 700; color: var(--primary);">${paramCount}</div>
                    <div style="font-size: 0.875rem; color: var(--gray-500);">Parameters Analyzed</div>
                </div>
                <div style="background: var(--gray-50); padding: 16px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 2rem; font-weight: 700; color: var(--danger);">${criticalCount}</div>
                    <div style="font-size: 0.875rem; color: var(--gray-500);">High Sensitivity</div>
                </div>
                <div style="background: var(--gray-50); padding: 16px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 1rem; font-weight: 600; color: ${mostSensitive?.level.color || 'var(--gray-600)'}; margin-bottom: 4px;">
                        ${mostSensitive?.name || 'N/A'}
                    </div>
                    <div style="font-size: 0.875rem; color: var(--gray-500);">Most Sensitive</div>
                </div>
                <div style="background: var(--gray-50); padding: 16px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 1rem; font-weight: 600; color: ${leastSensitive?.level.color || 'var(--gray-600)'}; margin-bottom: 4px;">
                        ${leastSensitive?.name || 'N/A'}
                    </div>
                    <div style="font-size: 0.875rem; color: var(--gray-500);">Least Sensitive</div>
                </div>
            </div>
        `;
    }

    /**
     * Render tornado chart
     */
    renderTornadoChart(multiResults) {
        const tornadoData = this.generateTornadoData(multiResults, 'finalUnemployment');

        if (tornadoData.length === 0) {
            return '<p style="color: var(--gray-500);">No data for tornado chart</p>';
        }

        const maxRange = Math.max(...tornadoData.map(d => Math.max(Math.abs(d.lowDiff), Math.abs(d.highDiff))));
        const scale = 100 / (maxRange * 2);

        let html = `
            <div style="background: var(--gray-50); padding: 20px; border-radius: 12px; margin-bottom: 24px;">
                <h4 style="margin-bottom: 16px; color: var(--gray-700);">🌪️ Impact on Final Unemployment Rate</h4>
                <div style="position: relative;">
                    <!-- Center line -->
                    <div style="position: absolute; left: 50%; top: 0; bottom: 0; width: 2px; background: var(--gray-300);"></div>

                    ${tornadoData.map((d, i) => {
                        const lowWidth = Math.abs(d.lowDiff) * scale;
                        const highWidth = Math.abs(d.highDiff) * scale;

                        return `
                            <div style="display: flex; align-items: center; margin-bottom: 12px; position: relative;">
                                <div style="width: 180px; text-align: right; padding-right: 12px; font-size: 0.875rem; color: var(--gray-600);">
                                    ${d.parameter}
                                </div>
                                <div style="flex: 1; display: flex; position: relative;">
                                    <!-- Low bar (left side) -->
                                    <div style="width: 50%; display: flex; justify-content: flex-end;">
                                        <div style="background: #3b82f6; height: 24px; width: ${lowWidth}%; border-radius: 4px 0 0 4px; display: flex; align-items: center; justify-content: flex-start; padding-left: 4px;">
                                            <span style="font-size: 0.7rem; color: white;">${(d.low * 100).toFixed(1)}%</span>
                                        </div>
                                    </div>
                                    <!-- High bar (right side) -->
                                    <div style="width: 50%; display: flex; justify-content: flex-start;">
                                        <div style="background: #ef4444; height: 24px; width: ${highWidth}%; border-radius: 0 4px 4px 0; display: flex; align-items: center; justify-content: flex-end; padding-right: 4px;">
                                            <span style="font-size: 0.7rem; color: white;">${(d.high * 100).toFixed(1)}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
                <div style="display: flex; justify-content: center; gap: 24px; margin-top: 16px; font-size: 0.75rem; color: var(--gray-500);">
                    <span>🔵 Lower Values</span>
                    <span>🔴 Higher Values</span>
                </div>
            </div>
        `;

        return html;
    }

    /**
     * Render detailed parameter tables
     */
    renderParameterTables(multiResults) {
        let html = '<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">';

        Object.entries(multiResults).forEach(([paramId, analysis]) => {
            if (!analysis) return;

            const param = this.parameters[paramId];
            const metrics = this.calculateMetrics(analysis);

            html += `
                <div style="background: var(--gray-50); padding: 16px; border-radius: 12px;">
                    <h5 style="margin-bottom: 12px; color: var(--gray-700);">${param.name}</h5>
                    <p style="font-size: 0.75rem; color: var(--gray-500); margin-bottom: 12px;">${param.description}</p>

                    ${metrics ? `
                        <div style="display: grid; gap: 8px;">
                            ${Object.entries(metrics).slice(0, 4).map(([id, m]) => `
                                <div style="display: flex; justify-content: space-between; padding: 8px; background: white; border-radius: 6px;">
                                    <span style="font-size: 0.875rem; color: var(--gray-600);">${m.name}</span>
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <span style="font-size: 0.75rem; color: var(--gray-400);">
                                            ${this.formatValue(m.min, m.format)} - ${this.formatValue(m.max, m.format)}
                                        </span>
                                        <span style="background: ${m.sensitivity.color}20; color: ${m.sensitivity.color}; padding: 2px 6px; border-radius: 4px; font-size: 0.65rem; font-weight: 600;">
                                            ${m.sensitivity.label}
                                        </span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : '<p style="color: var(--gray-400); font-size: 0.875rem;">No metrics available</p>'}
                </div>
            `;
        });

        html += '</div>';
        return html;
    }

    /**
     * Format value based on type
     */
    formatValue(value, format) {
        if (value === null || value === undefined || isNaN(value)) return 'N/A';

        switch (format) {
            case 'percent':
                return (value * 100).toFixed(1) + '%';
            case 'number':
                return value.toLocaleString();
            default:
                return value.toFixed(2);
        }
    }
}

// Global instance
const abmSensitivity = new ABMSensitivityAnalysis();

// Export for ES modules
export { ABMSensitivityAnalysis, abmSensitivity };

// Also export to window for backwards compatibility with script tags
if (typeof window !== 'undefined') {
    window.ABMSensitivityAnalysis = ABMSensitivityAnalysis;
    window.abmSensitivity = abmSensitivity;
}
