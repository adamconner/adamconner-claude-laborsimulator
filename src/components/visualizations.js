/**
 * Visualization Components Module
 * Chart creation and data visualization for the simulator
 */

class VisualizationManager {
    constructor() {
        this.charts = {};
        this.colors = {
            primary: '#3b82f6',
            secondary: '#10b981',
            danger: '#ef4444',
            warning: '#f59e0b',
            info: '#6366f1',
            gray: '#6b7280',
            sectors: [
                '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
                '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
                '#06b6d4', '#84cc16', '#a855f7'
            ]
        };
    }

    /**
     * Initialize Chart.js with defaults
     */
    initDefaults() {
        if (typeof Chart !== 'undefined') {
            Chart.defaults.font.family = "'Inter', 'Segoe UI', sans-serif";
            Chart.defaults.color = '#374151';
            Chart.defaults.plugins.legend.labels.usePointStyle = true;
        }
    }

    /**
     * Create unemployment trend chart
     */
    createUnemploymentChart(containerId, data) {
        const ctx = document.getElementById(containerId);
        if (!ctx) return null;

        if (this.charts[containerId]) {
            this.charts[containerId].destroy();
        }

        this.charts[containerId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(d => d.year.toFixed(1)),
                datasets: [{
                    label: 'Unemployment Rate (%)',
                    data: data.map(d => d.labor_market.unemployment_rate),
                    borderColor: this.colors.danger,
                    backgroundColor: this.colors.danger + '20',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Projected Unemployment Rate'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: Math.max(45, Math.ceil(Math.max(...data.map(d => d.labor_market.unemployment_rate)) / 5) * 5 + 5),
                        title: {
                            display: true,
                            text: 'Rate (%)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Year'
                        }
                    }
                }
            }
        });

        return this.charts[containerId];
    }

    /**
     * Create employment by sector chart
     */
    createSectorEmploymentChart(containerId, sectors) {
        const ctx = document.getElementById(containerId);
        if (!ctx) return null;

        if (this.charts[containerId]) {
            this.charts[containerId].destroy();
        }

        const sectorNames = Object.keys(sectors).map(s =>
            s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        );
        const employment = Object.values(sectors).map(s => s.employment / 1000000);
        const exposures = Object.values(sectors).map(s => s.automation_exposure * 100);

        this.charts[containerId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sectorNames,
                datasets: [{
                    label: 'Employment (Millions)',
                    data: employment,
                    backgroundColor: this.colors.sectors,
                    yAxisID: 'y'
                }, {
                    label: 'Automation Exposure (%)',
                    data: exposures,
                    type: 'line',
                    borderColor: this.colors.danger,
                    backgroundColor: 'transparent',
                    yAxisID: 'y1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Employment & Automation Exposure by Sector'
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Employment (M)'
                        }
                    },
                    y1: {
                        type: 'linear',
                        position: 'right',
                        max: 100,
                        grid: { drawOnChartArea: false },
                        title: {
                            display: true,
                            text: 'Exposure (%)'
                        }
                    },
                    x: {
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45
                        }
                    }
                }
            }
        });

        return this.charts[containerId];
    }

    /**
     * Create AI adoption curve chart
     */
    createAdoptionChart(containerId, data) {
        const ctx = document.getElementById(containerId);
        if (!ctx) return null;

        if (this.charts[containerId]) {
            this.charts[containerId].destroy();
        }

        this.charts[containerId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(d => d.year.toFixed(1)),
                datasets: [{
                    label: 'AI Adoption Rate (%)',
                    data: data.map(d => d.ai_adoption.rate),
                    borderColor: this.colors.info,
                    backgroundColor: this.colors.info + '20',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'AI Adoption Rate Over Time'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Adoption (%)'
                        }
                    }
                }
            }
        });

        return this.charts[containerId];
    }

    /**
     * Create jobs displaced vs created chart
     */
    createJobImpactChart(containerId, data) {
        const ctx = document.getElementById(containerId);
        if (!ctx) return null;

        if (this.charts[containerId]) {
            this.charts[containerId].destroy();
        }

        this.charts[containerId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(d => d.year.toFixed(1)),
                datasets: [{
                    label: 'Jobs Displaced (Cumulative)',
                    data: data.map(d => d.derived.cumulative_displacement / 1000000),
                    borderColor: this.colors.danger,
                    backgroundColor: 'transparent',
                    tension: 0.4
                }, {
                    label: 'New Jobs Created (Cumulative)',
                    data: data.map(d => d.derived.cumulative_new_jobs / 1000000),
                    borderColor: this.colors.secondary,
                    backgroundColor: 'transparent',
                    tension: 0.4
                }, {
                    label: 'Net Impact',
                    data: data.map(d => d.derived.net_ai_job_impact / 1000000),
                    borderColor: this.colors.info,
                    backgroundColor: this.colors.info + '20',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'AI Job Impact Over Time'
                    }
                },
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: 'Jobs (Millions)'
                        }
                    }
                }
            }
        });

        return this.charts[containerId];
    }

    /**
     * Create wage trend chart
     */
    createWageChart(containerId, data) {
        const ctx = document.getElementById(containerId);
        if (!ctx) return null;

        if (this.charts[containerId]) {
            this.charts[containerId].destroy();
        }

        this.charts[containerId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(d => d.year.toFixed(1)),
                datasets: [{
                    label: 'Average Hourly Wage ($)',
                    data: data.map(d => d.wages.average_hourly),
                    borderColor: this.colors.primary,
                    backgroundColor: 'transparent',
                    tension: 0.4,
                    yAxisID: 'y'
                }, {
                    label: 'Real Wage Growth (%)',
                    data: data.map(d => d.wages.real_wage_growth),
                    borderColor: this.colors.secondary,
                    backgroundColor: 'transparent',
                    tension: 0.4,
                    yAxisID: 'y1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Wage Trends'
                    }
                },
                scales: {
                    y: {
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Wage ($)'
                        }
                    },
                    y1: {
                        position: 'right',
                        grid: { drawOnChartArea: false },
                        title: {
                            display: true,
                            text: 'Growth (%)'
                        }
                    }
                }
            }
        });

        return this.charts[containerId];
    }

    /**
     * Create productivity chart
     */
    createProductivityChart(containerId, data) {
        const ctx = document.getElementById(containerId);
        if (!ctx) return null;

        if (this.charts[containerId]) {
            this.charts[containerId].destroy();
        }

        this.charts[containerId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(d => d.year.toFixed(1)),
                datasets: [{
                    label: 'Output per Hour (Index)',
                    data: data.map(d => d.productivity.output_per_hour),
                    borderColor: this.colors.info,
                    backgroundColor: this.colors.info + '20',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Labor Productivity'
                    }
                },
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: 'Index (2017=100)'
                        }
                    }
                }
            }
        });

        return this.charts[containerId];
    }

    /**
     * Create sector impact comparison chart
     */
    createSectorImpactChart(containerId, initialSectors, finalSectors) {
        const ctx = document.getElementById(containerId);
        if (!ctx) return null;

        if (this.charts[containerId]) {
            this.charts[containerId].destroy();
        }

        const sectorNames = Object.keys(initialSectors).map(s =>
            s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        );

        const changes = Object.keys(initialSectors).map(s => {
            const change = finalSectors[s].employment - initialSectors[s].employment;
            return change / 1000000;
        });

        const backgroundColors = changes.map(c =>
            c >= 0 ? this.colors.secondary : this.colors.danger
        );

        this.charts[containerId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sectorNames,
                datasets: [{
                    label: 'Employment Change (Millions)',
                    data: changes,
                    backgroundColor: backgroundColors
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    title: {
                        display: true,
                        text: 'Employment Change by Sector'
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Change (Millions)'
                        }
                    }
                }
            }
        });

        return this.charts[containerId];
    }

    /**
     * Create intervention cost/benefit chart
     */
    createInterventionChart(containerId, interventions) {
        const ctx = document.getElementById(containerId);
        if (!ctx) return null;

        if (this.charts[containerId]) {
            this.charts[containerId].destroy();
        }

        const names = interventions.map(i => i.name);
        const costs = interventions.map(i => i.fiscal_cost / 1e9);
        const jobEffects = interventions.map(i => i.job_effect);

        this.charts[containerId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: names,
                datasets: [{
                    label: 'Annual Cost ($B)',
                    data: costs,
                    backgroundColor: this.colors.warning,
                    yAxisID: 'y'
                }, {
                    label: 'Monthly Job Effect',
                    data: jobEffects,
                    backgroundColor: this.colors.secondary,
                    yAxisID: 'y1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Intervention Costs & Effects'
                    }
                },
                scales: {
                    y: {
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Cost ($B)'
                        }
                    },
                    y1: {
                        position: 'right',
                        grid: { drawOnChartArea: false },
                        title: {
                            display: true,
                            text: 'Jobs'
                        }
                    }
                }
            }
        });

        return this.charts[containerId];
    }

    /**
     * Create historical comparison chart
     */
    createHistoricalChart(containerId, historical, projected) {
        const ctx = document.getElementById(containerId);
        if (!ctx) return null;

        if (this.charts[containerId]) {
            this.charts[containerId].destroy();
        }

        const historicalYears = historical.map(d => d.year);
        const projectedYears = projected.map(d => Math.floor(d.year));
        const uniqueProjectedYears = [...new Set(projectedYears)];

        // Get one value per projected year
        const projectedByYear = {};
        projected.forEach(d => {
            const year = Math.floor(d.year);
            if (!projectedByYear[year]) {
                projectedByYear[year] = d.labor_market.unemployment_rate;
            }
        });

        this.charts[containerId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [...historicalYears, ...uniqueProjectedYears.filter(y => !historicalYears.includes(y))],
                datasets: [{
                    label: 'Historical',
                    data: historical.map(d => ({ x: d.year, y: d.value })),
                    borderColor: this.colors.primary,
                    backgroundColor: 'transparent',
                    tension: 0.4
                }, {
                    label: 'Projected',
                    data: uniqueProjectedYears.map(y => ({ x: y, y: projectedByYear[y] })),
                    borderColor: this.colors.info,
                    backgroundColor: this.colors.info + '20',
                    borderDash: [5, 5],
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Historical vs Projected Unemployment'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Unemployment Rate (%)'
                        }
                    }
                }
            }
        });

        return this.charts[containerId];
    }

    /**
     * Create automation exposure gauge
     */
    createExposureGauge(containerId, exposure) {
        const ctx = document.getElementById(containerId);
        if (!ctx) return null;

        if (this.charts[containerId]) {
            this.charts[containerId].destroy();
        }

        const color = exposure >= 70 ? this.colors.danger :
            exposure >= 50 ? this.colors.warning :
                exposure >= 30 ? this.colors.primary : this.colors.secondary;

        this.charts[containerId] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Exposed', 'Protected'],
                datasets: [{
                    data: [exposure, 100 - exposure],
                    backgroundColor: [color, '#e5e7eb'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                circumference: 180,
                rotation: -90,
                cutout: '70%',
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                }
            }
        });

        return this.charts[containerId];
    }

    /**
     * Destroy all charts
     */
    destroyAll() {
        for (const chart of Object.values(this.charts)) {
            chart.destroy();
        }
        this.charts = {};
    }

    /**
     * Update chart data
     */
    updateChart(containerId, newData) {
        const chart = this.charts[containerId];
        if (chart) {
            chart.data = newData;
            chart.update();
        }
    }

    /**
     * Create summary statistics display
     */
    createSummaryHTML(summary) {
        return `
            <div class="summary-grid">
                <div class="summary-card">
                    <h4>Unemployment Rate</h4>
                    <div class="stat-change ${parseFloat(summary.labor_market_changes.unemployment_rate.change) > 0 ? 'negative' : 'positive'}">
                        ${summary.labor_market_changes.unemployment_rate.initial}% → ${summary.labor_market_changes.unemployment_rate.final}%
                        <span>(${summary.labor_market_changes.unemployment_rate.change > 0 ? '+' : ''}${summary.labor_market_changes.unemployment_rate.change}%)</span>
                    </div>
                </div>
                <div class="summary-card">
                    <h4>Total Employment</h4>
                    <div class="stat-change ${summary.labor_market_changes.total_employment.change < 0 ? 'negative' : 'positive'}">
                        ${(summary.labor_market_changes.total_employment.change / 1000000).toFixed(1)}M
                        <span>net change</span>
                    </div>
                </div>
                <div class="summary-card">
                    <h4>AI Adoption</h4>
                    <div class="stat-value">
                        ${summary.ai_impact.ai_adoption.initial}% → ${summary.ai_impact.ai_adoption.final}%
                    </div>
                </div>
                <div class="summary-card">
                    <h4>Net AI Job Impact</h4>
                    <div class="stat-change ${summary.ai_impact.net_impact < 0 ? 'negative' : 'positive'}">
                        ${(summary.ai_impact.net_impact / 1000000).toFixed(1)}M
                        <span>jobs</span>
                    </div>
                </div>
            </div>
        `;
    }
}

// Export for use in other modules
window.VisualizationManager = VisualizationManager;
