/**
 * Sensitivity Analysis Module
 * Analyzes how changes in input parameters affect simulation outcomes
 */

class SensitivityAnalysis {
    constructor() {
        this.parameters = {
            unemployment_rate: {
                name: 'Target Unemployment Rate',
                unit: '%',
                baseValue: 10,
                range: { min: 4, max: 20, step: 2 },
                inputId: 'targetUR'
            },
            ai_adoption: {
                name: 'AI Adoption Rate',
                unit: '%',
                baseValue: 70,
                range: { min: 30, max: 100, step: 10 },
                inputId: 'aiAdoption'
            },
            target_year: {
                name: 'Target Year',
                unit: '',
                baseValue: 2029,
                range: { min: 2026, max: 2034, step: 1 },
                inputId: 'targetYear'
            }
        };

        this.outcomes = {
            final_unemployment: {
                name: 'Final Unemployment Rate',
                unit: '%',
                extractor: (results) => results.summary.labor_market_changes.unemployment_rate.final
            },
            net_job_impact: {
                name: 'Net Job Impact',
                unit: 'millions',
                extractor: (results) => results.summary.ai_impact.net_impact / 1e6
            },
            jobs_displaced: {
                name: 'Jobs Displaced',
                unit: 'millions',
                extractor: (results) => results.summary.ai_impact.jobs_displaced / 1e6
            },
            jobs_created: {
                name: 'Jobs Created',
                unit: 'millions',
                extractor: (results) => results.summary.ai_impact.jobs_created / 1e6
            },
            productivity_growth: {
                name: 'Final Productivity Growth',
                unit: '%',
                extractor: (results) => results.summary.economic_indicators.productivity_growth.final
            }
        };

        this.analysisResults = null;
    }

    /**
     * Run sensitivity analysis for a parameter
     */
    async runAnalysis(parameterId, simulationEngine, baseConfig, selectedOutcomes = null) {
        const param = this.parameters[parameterId];
        if (!param) return null;

        const outcomes = selectedOutcomes || Object.keys(this.outcomes);
        const results = [];

        // Generate test values
        const testValues = [];
        for (let v = param.range.min; v <= param.range.max; v += param.range.step) {
            testValues.push(v);
        }

        // Run simulation for each test value
        for (const value of testValues) {
            const config = { ...baseConfig };

            // Apply test value
            switch (parameterId) {
                case 'unemployment_rate':
                    config.target_unemployment = value;
                    break;
                case 'ai_adoption':
                    config.ai_adoption_rate = value;
                    break;
                case 'target_year':
                    config.end_year = value;
                    break;
            }

            try {
                // Create scenario and run simulation
                simulationEngine.createScenario(config);
                const simResults = await simulationEngine.runSimulation();

                const outcomeValues = {};
                outcomes.forEach(outcomeId => {
                    const outcome = this.outcomes[outcomeId];
                    if (outcome) {
                        outcomeValues[outcomeId] = outcome.extractor(simResults);
                    }
                });

                results.push({
                    paramValue: value,
                    outcomes: outcomeValues
                });
            } catch (error) {
                console.error(`Sensitivity analysis error at ${parameterId}=${value}:`, error);
            }
        }

        return {
            parameter: param,
            parameterId,
            results,
            baseValue: param.baseValue
        };
    }

    /**
     * Calculate sensitivity metrics
     */
    calculateSensitivity(analysisResults) {
        if (!analysisResults || analysisResults.results.length < 2) return null;

        const metrics = {};

        Object.keys(this.outcomes).forEach(outcomeId => {
            const values = analysisResults.results.map(r => r.outcomes[outcomeId]).filter(v => v !== undefined);
            if (values.length < 2) return;

            const min = Math.min(...values);
            const max = Math.max(...values);
            const range = max - min;
            const mean = values.reduce((a, b) => a + b, 0) / values.length;

            // Calculate elasticity (% change in outcome / % change in parameter)
            const paramValues = analysisResults.results.map(r => r.paramValue);
            const paramRange = Math.max(...paramValues) - Math.min(...paramValues);
            const elasticity = paramRange > 0 ? (range / mean) / (paramRange / analysisResults.parameter.baseValue) : 0;

            metrics[outcomeId] = {
                name: this.outcomes[outcomeId].name,
                unit: this.outcomes[outcomeId].unit,
                min,
                max,
                range,
                mean,
                elasticity: Math.abs(elasticity),
                sensitivity: this.getSensitivityLevel(Math.abs(elasticity))
            };
        });

        return metrics;
    }

    /**
     * Get sensitivity level description
     */
    getSensitivityLevel(elasticity) {
        if (elasticity >= 1.5) return { level: 'high', color: 'var(--danger)', label: 'High' };
        if (elasticity >= 0.5) return { level: 'medium', color: 'var(--warning)', label: 'Medium' };
        return { level: 'low', color: 'var(--secondary)', label: 'Low' };
    }

    /**
     * Generate tornado chart data
     */
    generateTornadoData(multiParamResults) {
        const data = [];

        Object.entries(multiParamResults).forEach(([paramId, analysis]) => {
            if (!analysis || !analysis.results.length) return;

            const param = this.parameters[paramId];
            const outcomes = analysis.results.map(r => r.outcomes.final_unemployment);
            const min = Math.min(...outcomes);
            const max = Math.max(...outcomes);

            data.push({
                parameter: param.name,
                low: min,
                high: max,
                range: max - min
            });
        });

        // Sort by range (descending)
        data.sort((a, b) => b.range - a.range);

        return data;
    }

    /**
     * Generate sensitivity analysis HTML
     */
    generateAnalysisHTML(analysisResults) {
        if (!analysisResults || !analysisResults.results.length) {
            return '<p style="color: var(--gray-500);">No analysis results available.</p>';
        }

        const metrics = this.calculateSensitivity(analysisResults);
        const param = analysisResults.parameter;

        return `
            <div class="sensitivity-analysis">
                <div class="card" style="margin-bottom: 24px;">
                    <div class="card-header">
                        <h3>Sensitivity to ${param.name}</h3>
                    </div>
                    <p style="color: var(--gray-600); margin-bottom: 16px;">
                        Analysis of how changes in ${param.name} (${param.range.min}${param.unit} to ${param.range.max}${param.unit})
                        affect simulation outcomes.
                    </p>

                    <!-- Sensitivity Metrics Table -->
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Outcome</th>
                                <th>Min</th>
                                <th>Max</th>
                                <th>Range</th>
                                <th>Sensitivity</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.entries(metrics).map(([id, m]) => `
                                <tr>
                                    <td><strong>${m.name}</strong></td>
                                    <td>${m.min.toFixed(2)}${m.unit === '%' ? '%' : m.unit === 'millions' ? 'M' : ''}</td>
                                    <td>${m.max.toFixed(2)}${m.unit === '%' ? '%' : m.unit === 'millions' ? 'M' : ''}</td>
                                    <td>${m.range.toFixed(2)}${m.unit === '%' ? '%' : m.unit === 'millions' ? 'M' : ''}</td>
                                    <td>
                                        <span class="tag" style="background: ${m.sensitivity.color}20; color: ${m.sensitivity.color};">
                                            ${m.sensitivity.label}
                                        </span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <!-- Parameter Values vs Outcomes -->
                <div class="card">
                    <div class="card-header">
                        <h3>${param.name} Impact Table</h3>
                    </div>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>${param.name}</th>
                                ${Object.keys(this.outcomes).map(id => `<th>${this.outcomes[id].name}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${analysisResults.results.map(r => `
                                <tr ${r.paramValue === param.baseValue ? 'style="background: var(--primary); color: white;"' : ''}>
                                    <td><strong>${r.paramValue}${param.unit}</strong></td>
                                    ${Object.keys(this.outcomes).map(id => {
                                        const val = r.outcomes[id];
                                        const unit = this.outcomes[id].unit;
                                        return `<td>${val !== undefined ? val.toFixed(2) : 'N/A'}${unit === '%' ? '%' : unit === 'millions' ? 'M' : ''}</td>`;
                                    }).join('')}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    /**
     * Generate quick sensitivity overview
     */
    generateOverviewHTML() {
        return `
            <div class="sensitivity-overview">
                <div class="card" style="margin-bottom: 24px;">
                    <div class="card-header">
                        <h3>Sensitivity Analysis</h3>
                    </div>
                    <p style="color: var(--gray-600); margin-bottom: 24px;">
                        Analyze how changes in key input parameters affect simulation outcomes.
                        Select a parameter to see how sensitive the results are to changes in that variable.
                    </p>

                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px;">
                        ${Object.entries(this.parameters).map(([id, param]) => `
                            <div class="sensitivity-param-card" style="
                                background: var(--gray-50);
                                border: 1px solid var(--gray-200);
                                border-radius: 8px;
                                padding: 16px;
                                cursor: pointer;
                                transition: all 0.2s;
                            " onclick="runParameterSensitivity('${id}')"
                               onmouseover="this.style.borderColor='var(--primary)'; this.style.boxShadow='var(--shadow)';"
                               onmouseout="this.style.borderColor='var(--gray-200)'; this.style.boxShadow='none';">
                                <h4 style="margin-bottom: 8px; color: var(--gray-800);">${param.name}</h4>
                                <p style="font-size: 0.875rem; color: var(--gray-500); margin-bottom: 12px;">
                                    Test range: ${param.range.min}${param.unit} to ${param.range.max}${param.unit}
                                </p>
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <span style="font-size: 0.75rem; color: var(--gray-400);">
                                        Base: ${param.baseValue}${param.unit}
                                    </span>
                                    <span class="tag tag-medium">Analyze</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div id="sensitivity-results">
                    <div class="card" style="text-align: center; padding: 40px; color: var(--gray-500);">
                        <p>Select a parameter above to run sensitivity analysis.</p>
                        <p style="font-size: 0.875rem; margin-top: 8px;">
                            Analysis will show how outcomes change as the parameter varies.
                        </p>
                    </div>
                </div>
            </div>
        `;
    }
}

// Global instance
const sensitivityAnalysis = new SensitivityAnalysis();

// Export for ES modules
export { SensitivityAnalysis, sensitivityAnalysis };

// Also export to window for backwards compatibility with script tags
if (typeof window !== 'undefined') {
    window.SensitivityAnalysis = SensitivityAnalysis;
    window.sensitivityAnalysis = sensitivityAnalysis;
}
