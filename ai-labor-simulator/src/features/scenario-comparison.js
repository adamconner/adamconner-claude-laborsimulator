/**
 * Scenario Comparison Module
 * Allows users to compare 2-3 scenarios side-by-side
 */

class ScenarioComparison {
    constructor() {
        this.scenarios = [];
        this.maxScenarios = 3;
        this.colors = [
            { primary: '#3b82f6', light: 'rgba(59, 130, 246, 0.1)' },  // Blue
            { primary: '#10b981', light: 'rgba(16, 185, 129, 0.1)' },  // Green
            { primary: '#f59e0b', light: 'rgba(245, 158, 11, 0.1)' }   // Orange
        ];
    }

    /**
     * Add a scenario to comparison
     */
    addScenario(name, config, results) {
        if (this.scenarios.length >= this.maxScenarios) {
            return { success: false, message: `Maximum ${this.maxScenarios} scenarios allowed for comparison.` };
        }

        // Check for duplicate names
        if (this.scenarios.some(s => s.name === name)) {
            return { success: false, message: 'A scenario with this name already exists in comparison.' };
        }

        const scenario = {
            id: `scenario_${Date.now()}`,
            name,
            config,
            results,
            color: this.colors[this.scenarios.length],
            addedAt: new Date().toISOString()
        };

        this.scenarios.push(scenario);
        return { success: true, scenario };
    }

    /**
     * Remove a scenario from comparison
     */
    removeScenario(id) {
        const index = this.scenarios.findIndex(s => s.id === id);
        if (index > -1) {
            this.scenarios.splice(index, 1);
            // Reassign colors
            this.scenarios.forEach((s, i) => {
                s.color = this.colors[i];
            });
            return true;
        }
        return false;
    }

    /**
     * Clear all scenarios
     */
    clearAll() {
        this.scenarios = [];
    }

    /**
     * Get comparison data
     */
    getComparisonData() {
        if (this.scenarios.length < 2) {
            return null;
        }

        return {
            scenarios: this.scenarios,
            metrics: this.extractComparisonMetrics(),
            charts: this.prepareChartData()
        };
    }

    /**
     * Extract key metrics for comparison table
     */
    extractComparisonMetrics() {
        return this.scenarios.map(s => {
            const summary = s.results.summary;
            const lastResult = s.results.results[s.results.results.length - 1];

            return {
                id: s.id,
                name: s.name,
                color: s.color,
                metrics: {
                    // Configuration
                    targetYear: s.config.targetYear,
                    targetUR: s.config.targetUR,
                    aiAdoption: s.config.aiAdoption,
                    automationPace: s.config.automationPace,
                    interventions: s.config.interventions?.length || 0,

                    // Results
                    finalUnemployment: summary.labor_market_changes.unemployment_rate.final,
                    unemploymentChange: summary.labor_market_changes.unemployment_rate.change,
                    jobsDisplaced: summary.ai_impact.jobs_displaced,
                    jobsCreated: summary.ai_impact.jobs_created,
                    netJobImpact: summary.ai_impact.net_impact,
                    finalProductivity: summary.economic_indicators.productivity_growth.final,
                    finalWageGrowth: summary.economic_indicators.wage_growth.final,
                    finalLaborShare: summary.economic_indicators.labor_share.final,
                    finalAIAdoption: summary.ai_impact.ai_adoption.final
                }
            };
        });
    }

    /**
     * Prepare data for comparison charts
     */
    prepareChartData() {
        const years = this.scenarios[0]?.results.results.map(r => r.year) || [];

        return {
            unemployment: {
                labels: years,
                datasets: this.scenarios.map(s => ({
                    label: s.name,
                    data: s.results.results.map(r => r.unemployment_rate),
                    borderColor: s.color.primary,
                    backgroundColor: s.color.light,
                    tension: 0.3,
                    fill: false
                }))
            },
            employment: {
                labels: years,
                datasets: this.scenarios.map(s => ({
                    label: s.name,
                    data: s.results.results.map(r => r.employment / 1e6),
                    borderColor: s.color.primary,
                    backgroundColor: s.color.light,
                    tension: 0.3,
                    fill: false
                }))
            },
            aiAdoption: {
                labels: years,
                datasets: this.scenarios.map(s => ({
                    label: s.name,
                    data: s.results.results.map(r => r.ai_adoption),
                    borderColor: s.color.primary,
                    backgroundColor: s.color.light,
                    tension: 0.3,
                    fill: false
                }))
            },
            productivity: {
                labels: years,
                datasets: this.scenarios.map(s => ({
                    label: s.name,
                    data: s.results.results.map(r => r.productivity_growth),
                    borderColor: s.color.primary,
                    backgroundColor: s.color.light,
                    tension: 0.3,
                    fill: false
                }))
            }
        };
    }

    /**
     * Generate comparison HTML
     */
    generateComparisonHTML() {
        if (this.scenarios.length < 2) {
            return `
                <div style="text-align: center; padding: 40px; color: var(--gray-500);">
                    <h3 style="margin-bottom: 16px;">Add Scenarios to Compare</h3>
                    <p>Run simulations and click "Add to Comparison" to compare up to ${this.maxScenarios} scenarios side-by-side.</p>
                    <p style="margin-top: 12px; font-size: 0.875rem;">Current scenarios: ${this.scenarios.length}/${this.maxScenarios}</p>
                </div>
            `;
        }

        const metrics = this.extractComparisonMetrics();

        return `
            <div class="comparison-container">
                <!-- Scenario Cards -->
                <div style="display: grid; grid-template-columns: repeat(${this.scenarios.length}, 1fr); gap: 16px; margin-bottom: 24px;">
                    ${metrics.map(m => `
                        <div class="card" style="border-top: 4px solid ${m.color.primary};">
                            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
                                <div>
                                    <h3 style="color: ${m.color.primary}; margin-bottom: 4px;">${m.name}</h3>
                                    <span style="font-size: 0.75rem; color: var(--gray-500);">Target: ${m.metrics.targetYear}</span>
                                </div>
                                <button class="btn btn-sm btn-outline" onclick="scenarioComparison.removeScenario('${m.id}'); renderComparisonView();" style="font-size: 0.7rem;">
                                    Remove
                                </button>
                            </div>
                            <div class="comparison-metrics">
                                <div class="metric-row">
                                    <span class="metric-label">Final Unemployment</span>
                                    <span class="metric-value" style="color: ${m.metrics.finalUnemployment > 6 ? 'var(--danger)' : 'var(--secondary)'}">
                                        ${m.metrics.finalUnemployment.toFixed(1)}%
                                    </span>
                                </div>
                                <div class="metric-row">
                                    <span class="metric-label">Jobs Displaced</span>
                                    <span class="metric-value">${(m.metrics.jobsDisplaced / 1e6).toFixed(1)}M</span>
                                </div>
                                <div class="metric-row">
                                    <span class="metric-label">Jobs Created</span>
                                    <span class="metric-value">${(m.metrics.jobsCreated / 1e6).toFixed(1)}M</span>
                                </div>
                                <div class="metric-row">
                                    <span class="metric-label">Net Impact</span>
                                    <span class="metric-value" style="color: ${m.metrics.netJobImpact < 0 ? 'var(--danger)' : 'var(--secondary)'}">
                                        ${m.metrics.netJobImpact > 0 ? '+' : ''}${(m.metrics.netJobImpact / 1e6).toFixed(1)}M
                                    </span>
                                </div>
                                <div class="metric-row">
                                    <span class="metric-label">Interventions</span>
                                    <span class="metric-value">${m.metrics.interventions}</span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <!-- Comparison Table -->
                <div class="card" style="margin-bottom: 24px;">
                    <div class="card-header">
                        <h3>Detailed Comparison</h3>
                    </div>
                    <table class="data-table comparison-table">
                        <thead>
                            <tr>
                                <th>Metric</th>
                                ${metrics.map(m => `<th style="color: ${m.color.primary};">${m.name}</th>`).join('')}
                                <th>Difference</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.generateComparisonRows(metrics)}
                        </tbody>
                    </table>
                </div>

                <!-- Comparison Charts -->
                <div class="card-grid" style="margin-bottom: 24px;">
                    <div class="card">
                        <div class="card-header"><h3>Unemployment Rate Comparison</h3></div>
                        <div class="chart-container">
                            <canvas id="comparisonURChart"></canvas>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-header"><h3>Employment Comparison</h3></div>
                        <div class="chart-container">
                            <canvas id="comparisonEmpChart"></canvas>
                        </div>
                    </div>
                </div>

                <div class="card-grid">
                    <div class="card">
                        <div class="card-header"><h3>AI Adoption Comparison</h3></div>
                        <div class="chart-container">
                            <canvas id="comparisonAIChart"></canvas>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-header"><h3>Productivity Growth Comparison</h3></div>
                        <div class="chart-container">
                            <canvas id="comparisonProdChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Generate comparison table rows
     */
    generateComparisonRows(metrics) {
        const rows = [
            { label: 'Target Year', key: 'targetYear', format: v => v },
            { label: 'Target Unemployment', key: 'targetUR', format: v => `${v}%` },
            { label: 'AI Adoption Target', key: 'aiAdoption', format: v => `${v}%` },
            { label: 'Automation Pace', key: 'automationPace', format: v => v.charAt(0).toUpperCase() + v.slice(1) },
            { label: 'Final Unemployment', key: 'finalUnemployment', format: v => `${v.toFixed(1)}%`, highlight: true },
            { label: 'Unemployment Change', key: 'unemploymentChange', format: v => `${v > 0 ? '+' : ''}${v.toFixed(1)}%` },
            { label: 'Jobs Displaced', key: 'jobsDisplaced', format: v => `${(v / 1e6).toFixed(2)}M` },
            { label: 'Jobs Created', key: 'jobsCreated', format: v => `${(v / 1e6).toFixed(2)}M` },
            { label: 'Net Job Impact', key: 'netJobImpact', format: v => `${v > 0 ? '+' : ''}${(v / 1e6).toFixed(2)}M`, highlight: true },
            { label: 'Final AI Adoption', key: 'finalAIAdoption', format: v => `${v.toFixed(1)}%` },
            { label: 'Final Productivity Growth', key: 'finalProductivity', format: v => `${v.toFixed(1)}%` },
            { label: 'Final Wage Growth', key: 'finalWageGrowth', format: v => `${v.toFixed(1)}%` },
            { label: 'Final Labor Share', key: 'finalLaborShare', format: v => `${v.toFixed(1)}%` }
        ];

        return rows.map(row => {
            const values = metrics.map(m => m.metrics[row.key]);
            const min = Math.min(...values.filter(v => typeof v === 'number'));
            const max = Math.max(...values.filter(v => typeof v === 'number'));
            const diff = max - min;

            return `
                <tr ${row.highlight ? 'style="background: var(--gray-50); font-weight: 600;"' : ''}>
                    <td>${row.label}</td>
                    ${metrics.map((m, i) => {
                        const val = m.metrics[row.key];
                        const isMin = val === min && typeof val === 'number';
                        const isMax = val === max && typeof val === 'number';
                        return `<td style="${isMin ? 'color: var(--secondary);' : ''} ${isMax && row.key.includes('Displaced') ? 'color: var(--danger);' : ''}">${row.format(val)}</td>`;
                    }).join('')}
                    <td style="color: var(--gray-500);">
                        ${typeof values[0] === 'number' ? (row.key.includes('job') ? `${(diff / 1e6).toFixed(2)}M` : `${diff.toFixed(1)}${row.key.includes('Rate') || row.key.includes('Unemployment') || row.key.includes('Adoption') || row.key.includes('Growth') || row.key.includes('Share') ? '%' : ''}`) : '-'}
                    </td>
                </tr>
            `;
        }).join('');
    }

    /**
     * Render comparison charts
     */
    renderCharts() {
        if (this.scenarios.length < 2) return;

        const chartData = this.prepareChartData();
        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        };

        // Destroy existing charts
        ['comparisonURChart', 'comparisonEmpChart', 'comparisonAIChart', 'comparisonProdChart'].forEach(id => {
            const canvas = document.getElementById(id);
            if (canvas) {
                const existingChart = Chart.getChart(canvas);
                if (existingChart) existingChart.destroy();
            }
        });

        // Create new charts
        setTimeout(() => {
            new Chart(document.getElementById('comparisonURChart'), {
                type: 'line',
                data: chartData.unemployment,
                options: { ...chartOptions, scales: { y: { title: { display: true, text: 'Unemployment Rate (%)' } } } }
            });

            new Chart(document.getElementById('comparisonEmpChart'), {
                type: 'line',
                data: chartData.employment,
                options: { ...chartOptions, scales: { y: { title: { display: true, text: 'Employment (Millions)' } } } }
            });

            new Chart(document.getElementById('comparisonAIChart'), {
                type: 'line',
                data: chartData.aiAdoption,
                options: { ...chartOptions, scales: { y: { title: { display: true, text: 'AI Adoption (%)' } } } }
            });

            new Chart(document.getElementById('comparisonProdChart'), {
                type: 'line',
                data: chartData.productivity,
                options: { ...chartOptions, scales: { y: { title: { display: true, text: 'Productivity Growth (%)' } } } }
            });
        }, 100);
    }

    /**
     * Get scenario count
     */
    getCount() {
        return this.scenarios.length;
    }

    /**
     * Check if can add more scenarios
     */
    canAddMore() {
        return this.scenarios.length < this.maxScenarios;
    }
}

// Global instance
const scenarioComparison = new ScenarioComparison();

// Export for ES modules
export { ScenarioComparison, scenarioComparison };

// Also export to window for backwards compatibility with script tags
if (typeof window !== 'undefined') {
    window.ScenarioComparison = ScenarioComparison;
    window.scenarioComparison = scenarioComparison;
}
