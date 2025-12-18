/**
 * Regional Heat Map Visualization
 * Displays US state-level data with interactive heat map
 */

class RegionalHeatMap {
    constructor() {
        // State coordinates for simplified US map (relative positions)
        this.statePositions = {
            WA: { x: 6, y: 2, w: 3, h: 2 },
            OR: { x: 6, y: 4, w: 3, h: 2 },
            CA: { x: 5, y: 6, w: 2, h: 4 },
            NV: { x: 7, y: 6, w: 2, h: 2 },
            ID: { x: 9, y: 3, w: 2, h: 3 },
            MT: { x: 11, y: 2, w: 4, h: 2 },
            WY: { x: 12, y: 4, w: 3, h: 2 },
            UT: { x: 9, y: 6, w: 2, h: 2 },
            CO: { x: 12, y: 6, w: 3, h: 2 },
            AZ: { x: 9, y: 8, w: 2, h: 2 },
            NM: { x: 11, y: 8, w: 2, h: 2 },
            ND: { x: 15, y: 2, w: 3, h: 1.5 },
            SD: { x: 15, y: 3.5, w: 3, h: 1.5 },
            NE: { x: 15, y: 5, w: 3, h: 1.5 },
            KS: { x: 15, y: 6.5, w: 3, h: 1.5 },
            OK: { x: 15, y: 8, w: 3, h: 1.5 },
            TX: { x: 14, y: 9.5, w: 4, h: 3 },
            MN: { x: 18, y: 2, w: 2, h: 2 },
            IA: { x: 18, y: 4, w: 2, h: 1.5 },
            MO: { x: 18, y: 5.5, w: 2, h: 2 },
            AR: { x: 18, y: 7.5, w: 2, h: 1.5 },
            LA: { x: 18, y: 9, w: 2, h: 1.5 },
            WI: { x: 20, y: 2, w: 2, h: 2 },
            IL: { x: 20, y: 4, w: 2, h: 2.5 },
            IN: { x: 22, y: 4, w: 1.5, h: 2 },
            MI: { x: 22, y: 2, w: 2, h: 2 },
            OH: { x: 23.5, y: 4, w: 2, h: 2 },
            KY: { x: 22, y: 6, w: 3, h: 1.5 },
            TN: { x: 21, y: 7.5, w: 4, h: 1.5 },
            MS: { x: 20, y: 9, w: 1.5, h: 2 },
            AL: { x: 21.5, y: 9, w: 1.5, h: 2 },
            GA: { x: 23, y: 9, w: 2, h: 2 },
            FL: { x: 24, y: 11, w: 2, h: 2 },
            SC: { x: 25, y: 8, w: 2, h: 1.5 },
            NC: { x: 25, y: 6.5, w: 3, h: 1.5 },
            VA: { x: 26, y: 5, w: 2.5, h: 1.5 },
            WV: { x: 25, y: 5, w: 1, h: 1.5 },
            PA: { x: 26, y: 3.5, w: 2.5, h: 1.5 },
            NY: { x: 27, y: 2, w: 2, h: 1.5 },
            VT: { x: 29, y: 1, w: 1, h: 1 },
            NH: { x: 30, y: 1.5, w: 0.8, h: 1 },
            ME: { x: 30.8, y: 0.5, w: 1.2, h: 2 },
            MA: { x: 29.5, y: 2.5, w: 1.5, h: 0.8 },
            RI: { x: 30, y: 3.3, w: 0.8, h: 0.5 },
            CT: { x: 29, y: 3.3, w: 1, h: 0.7 },
            NJ: { x: 28.5, y: 4, w: 0.8, h: 1 },
            DE: { x: 28.5, y: 5, w: 0.5, h: 0.7 },
            MD: { x: 27.5, y: 5, w: 1, h: 0.8 },
            AK: { x: 1, y: 10, w: 3, h: 2 },
            HI: { x: 4, y: 12, w: 2, h: 1 }
        };

        // Color scales
        this.colorScales = {
            unemployment: {
                stops: [
                    { value: 3, color: '#10b981' },   // Green - low
                    { value: 5, color: '#84cc16' },   // Light green
                    { value: 7, color: '#fbbf24' },   // Yellow
                    { value: 9, color: '#f97316' },   // Orange
                    { value: 12, color: '#ef4444' }   // Red - high
                ]
            },
            displacement: {
                stops: [
                    { value: 0, color: '#10b981' },
                    { value: 0.02, color: '#84cc16' },
                    { value: 0.05, color: '#fbbf24' },
                    { value: 0.08, color: '#f97316' },
                    { value: 0.12, color: '#ef4444' }
                ]
            },
            aiAdoption: {
                stops: [
                    { value: 0.2, color: '#94a3b8' },
                    { value: 0.4, color: '#60a5fa' },
                    { value: 0.6, color: '#3b82f6' },
                    { value: 0.8, color: '#2563eb' },
                    { value: 1.0, color: '#1d4ed8' }
                ]
            },
            wageChange: {
                stops: [
                    { value: -5, color: '#ef4444' },
                    { value: -2, color: '#f97316' },
                    { value: 0, color: '#fbbf24' },
                    { value: 2, color: '#84cc16' },
                    { value: 5, color: '#10b981' }
                ]
            }
        };

        this.selectedMetric = 'unemployment';
        this.regionalData = null;
    }

    /**
     * Initialize the heat map with regional data
     */
    initialize(results) {
        this.regionalData = this.extractRegionalData(results);
    }

    /**
     * Extract regional data from simulation results
     */
    extractRegionalData(results) {
        const data = {};

        // If we have regional data from the simulation
        if (results.regionalData) {
            return results.regionalData;
        }

        // Otherwise, generate synthetic regional data based on simulation summary
        if (typeof US_REGIONS !== 'undefined') {
            const summary = results.summary;
            const baseUR = summary.final?.unemploymentRate || 0.05;
            const baseDisplacement = (summary.totalLayoffs || 0) / 150000000; // Relative to workforce

            US_REGIONS.forEach(region => {
                // Adjust based on region characteristics
                let urMultiplier = 1;
                let displacementMultiplier = 1;
                let aiAdoption = 0.3;
                let wageChange = 0;

                // Tech hubs have lower unemployment but faster AI adoption
                if (region.techHub) {
                    urMultiplier = 0.8;
                    displacementMultiplier = 0.7;
                    aiAdoption = 0.6;
                    wageChange = 2;
                }

                // High cost of living areas have different dynamics
                if (region.costOfLiving > 1.2) {
                    urMultiplier *= 0.9;
                    wageChange += 1;
                }

                // Manufacturing states face more displacement
                const manufacturingStates = ['MI', 'OH', 'IN', 'WI', 'PA'];
                if (manufacturingStates.includes(region.abbrev)) {
                    displacementMultiplier = 1.3;
                    urMultiplier = 1.2;
                    wageChange -= 1;
                }

                // Rural states
                if (region.population < 2) {
                    urMultiplier *= 1.1;
                    aiAdoption *= 0.7;
                }

                // Add some randomness for visual interest
                const noise = () => 0.9 + Math.random() * 0.2;

                data[region.abbrev] = {
                    name: region.name,
                    unemployment: (baseUR * 100 * urMultiplier * noise()).toFixed(1),
                    displacement: (baseDisplacement * displacementMultiplier * noise()).toFixed(3),
                    aiAdoption: (aiAdoption * noise()).toFixed(2),
                    wageChange: (wageChange * noise()).toFixed(1),
                    population: region.population,
                    techHub: region.techHub,
                    costOfLiving: region.costOfLiving
                };
            });
        }

        return data;
    }

    /**
     * Get color for a value based on color scale
     */
    getColor(value, scaleName) {
        const scale = this.colorScales[scaleName];
        if (!scale) return '#94a3b8';

        const stops = scale.stops;

        // Handle edge cases
        if (value <= stops[0].value) return stops[0].color;
        if (value >= stops[stops.length - 1].value) return stops[stops.length - 1].color;

        // Find the two stops to interpolate between
        for (let i = 0; i < stops.length - 1; i++) {
            if (value >= stops[i].value && value <= stops[i + 1].value) {
                const t = (value - stops[i].value) / (stops[i + 1].value - stops[i].value);
                return this.interpolateColor(stops[i].color, stops[i + 1].color, t);
            }
        }

        return '#94a3b8';
    }

    /**
     * Interpolate between two hex colors
     */
    interpolateColor(color1, color2, t) {
        const r1 = parseInt(color1.slice(1, 3), 16);
        const g1 = parseInt(color1.slice(3, 5), 16);
        const b1 = parseInt(color1.slice(5, 7), 16);

        const r2 = parseInt(color2.slice(1, 3), 16);
        const g2 = parseInt(color2.slice(3, 5), 16);
        const b2 = parseInt(color2.slice(5, 7), 16);

        const r = Math.round(r1 + (r2 - r1) * t);
        const g = Math.round(g1 + (g2 - g1) * t);
        const b = Math.round(b1 + (b2 - b1) * t);

        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    /**
     * Render the heat map
     */
    render(containerId, metric = 'unemployment') {
        this.selectedMetric = metric;
        const container = document.getElementById(containerId);
        if (!container || !this.regionalData) return;

        const scale = 20; // pixels per unit
        const width = 35 * scale;
        const height = 15 * scale;

        let html = `
            <div style="margin-bottom: 16px;">
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <button class="heatmap-btn ${metric === 'unemployment' ? 'active' : ''}" onclick="regionalHeatMap.render('${containerId}', 'unemployment')">Unemployment</button>
                    <button class="heatmap-btn ${metric === 'displacement' ? 'active' : ''}" onclick="regionalHeatMap.render('${containerId}', 'displacement')">Displacement</button>
                    <button class="heatmap-btn ${metric === 'aiAdoption' ? 'active' : ''}" onclick="regionalHeatMap.render('${containerId}', 'aiAdoption')">AI Adoption</button>
                    <button class="heatmap-btn ${metric === 'wageChange' ? 'active' : ''}" onclick="regionalHeatMap.render('${containerId}', 'wageChange')">Wage Change</button>
                </div>
            </div>
            <style>
                .heatmap-btn {
                    padding: 8px 16px;
                    border: 1px solid var(--gray-300);
                    background: var(--gray-50);
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.875rem;
                    transition: all 0.2s;
                }
                .heatmap-btn:hover {
                    background: var(--gray-100);
                }
                .heatmap-btn.active {
                    background: var(--primary);
                    color: white;
                    border-color: var(--primary);
                }
                .state-rect {
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .state-rect:hover {
                    filter: brightness(1.1);
                    stroke-width: 2;
                }
            </style>
            <div style="position: relative; overflow-x: auto;">
                <svg viewBox="0 0 ${width} ${height}" style="width: 100%; max-width: ${width}px; height: auto;">
        `;

        // Draw states
        Object.entries(this.statePositions).forEach(([abbrev, pos]) => {
            const data = this.regionalData[abbrev];
            if (!data) return;

            let value;
            switch (metric) {
                case 'unemployment':
                    value = parseFloat(data.unemployment);
                    break;
                case 'displacement':
                    value = parseFloat(data.displacement);
                    break;
                case 'aiAdoption':
                    value = parseFloat(data.aiAdoption);
                    break;
                case 'wageChange':
                    value = parseFloat(data.wageChange);
                    break;
            }

            const color = this.getColor(value, metric);

            html += `
                <g class="state-group" data-state="${abbrev}">
                    <rect
                        class="state-rect"
                        x="${pos.x * scale}"
                        y="${pos.y * scale}"
                        width="${pos.w * scale}"
                        height="${pos.h * scale}"
                        fill="${color}"
                        stroke="white"
                        stroke-width="1"
                        rx="3"
                        onclick="regionalHeatMap.showStateDetails('${abbrev}')"
                    />
                    <text
                        x="${(pos.x + pos.w / 2) * scale}"
                        y="${(pos.y + pos.h / 2 + 0.15) * scale}"
                        text-anchor="middle"
                        dominant-baseline="middle"
                        font-size="${Math.min(pos.w, pos.h) * scale * 0.35}"
                        fill="white"
                        font-weight="600"
                        style="text-shadow: 0 1px 2px rgba(0,0,0,0.3); pointer-events: none;"
                    >${abbrev}</text>
                </g>
            `;
        });

        html += '</svg></div>';

        // Legend
        html += this.renderLegend(metric);

        // State details panel
        html += '<div id="stateDetailsPanel" style="display: none; margin-top: 16px;"></div>';

        container.innerHTML = html;
    }

    /**
     * Render the legend
     */
    renderLegend(metric) {
        const scale = this.colorScales[metric];
        if (!scale) return '';

        const labels = {
            unemployment: 'Unemployment Rate (%)',
            displacement: 'Job Displacement Rate',
            aiAdoption: 'AI Adoption Rate',
            wageChange: 'Wage Change (%)'
        };

        const formatValue = (val) => {
            if (metric === 'displacement') return (val * 100).toFixed(0) + '%';
            if (metric === 'aiAdoption') return (val * 100).toFixed(0) + '%';
            return val + '%';
        };

        let html = `
            <div style="margin-top: 16px; padding: 12px; background: var(--gray-50); border-radius: 8px;">
                <div style="font-size: 0.875rem; font-weight: 600; color: var(--gray-700); margin-bottom: 8px;">${labels[metric]}</div>
                <div style="display: flex; align-items: center; gap: 4px;">
        `;

        // Create gradient bar
        html += '<div style="flex: 1; height: 12px; border-radius: 6px; background: linear-gradient(to right';
        scale.stops.forEach((stop, i) => {
            const percent = (i / (scale.stops.length - 1)) * 100;
            html += `, ${stop.color} ${percent}%`;
        });
        html += ');"></div>';

        html += '</div><div style="display: flex; justify-content: space-between; margin-top: 4px; font-size: 0.75rem; color: var(--gray-500);">';

        scale.stops.forEach(stop => {
            html += `<span>${formatValue(stop.value)}</span>`;
        });

        html += '</div></div>';

        return html;
    }

    /**
     * Show detailed information for a state
     */
    showStateDetails(abbrev) {
        const panel = document.getElementById('stateDetailsPanel');
        const data = this.regionalData[abbrev];

        if (!panel || !data) return;

        panel.style.display = 'block';

        panel.innerHTML = `
            <div style="padding: 16px; background: var(--gray-50); border-radius: 8px; border-left: 4px solid var(--primary);">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                    <div>
                        <h4 style="margin: 0; color: var(--gray-800);">${data.name} (${abbrev})</h4>
                        <div style="font-size: 0.875rem; color: var(--gray-500);">
                            Pop: ${data.population}M ${data.techHub ? '• Tech Hub' : ''} • COL: ${(data.costOfLiving * 100).toFixed(0)}%
                        </div>
                    </div>
                    <button onclick="document.getElementById('stateDetailsPanel').style.display='none'" style="background: none; border: none; cursor: pointer; font-size: 1.2rem; color: var(--gray-400);">✕</button>
                </div>
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;">
                    <div style="text-align: center; padding: 12px; background: white; border-radius: 8px;">
                        <div style="font-size: 1.5rem; font-weight: 700; color: ${parseFloat(data.unemployment) > 7 ? 'var(--danger)' : 'var(--gray-700)'};">${data.unemployment}%</div>
                        <div style="font-size: 0.75rem; color: var(--gray-500);">Unemployment</div>
                    </div>
                    <div style="text-align: center; padding: 12px; background: white; border-radius: 8px;">
                        <div style="font-size: 1.5rem; font-weight: 700; color: var(--gray-700);">${(parseFloat(data.displacement) * 100).toFixed(1)}%</div>
                        <div style="font-size: 0.75rem; color: var(--gray-500);">Displacement</div>
                    </div>
                    <div style="text-align: center; padding: 12px; background: white; border-radius: 8px;">
                        <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary);">${(parseFloat(data.aiAdoption) * 100).toFixed(0)}%</div>
                        <div style="font-size: 0.75rem; color: var(--gray-500);">AI Adoption</div>
                    </div>
                    <div style="text-align: center; padding: 12px; background: white; border-radius: 8px;">
                        <div style="font-size: 1.5rem; font-weight: 700; color: ${parseFloat(data.wageChange) >= 0 ? 'var(--secondary)' : 'var(--danger)'};">${data.wageChange > 0 ? '+' : ''}${data.wageChange}%</div>
                        <div style="font-size: 0.75rem; color: var(--gray-500);">Wage Change</div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Get summary statistics
     */
    getSummaryStats() {
        if (!this.regionalData) return null;

        const values = Object.values(this.regionalData);

        const getAvg = (key) => values.reduce((sum, v) => sum + parseFloat(v[key]), 0) / values.length;
        const getMax = (key) => Math.max(...values.map(v => parseFloat(v[key])));
        const getMin = (key) => Math.min(...values.map(v => parseFloat(v[key])));

        const findState = (key, findMax) => {
            const sorted = [...values].sort((a, b) =>
                findMax ? parseFloat(b[key]) - parseFloat(a[key]) : parseFloat(a[key]) - parseFloat(b[key])
            );
            return sorted[0]?.name;
        };

        return {
            unemployment: {
                avg: getAvg('unemployment').toFixed(1),
                max: getMax('unemployment').toFixed(1),
                min: getMin('unemployment').toFixed(1),
                highest: findState('unemployment', true),
                lowest: findState('unemployment', false)
            },
            displacement: {
                avg: (getAvg('displacement') * 100).toFixed(1),
                max: (getMax('displacement') * 100).toFixed(1),
                min: (getMin('displacement') * 100).toFixed(1),
                highest: findState('displacement', true),
                lowest: findState('displacement', false)
            },
            aiAdoption: {
                avg: (getAvg('aiAdoption') * 100).toFixed(0),
                max: (getMax('aiAdoption') * 100).toFixed(0),
                min: (getMin('aiAdoption') * 100).toFixed(0),
                highest: findState('aiAdoption', true),
                lowest: findState('aiAdoption', false)
            },
            techHubCount: values.filter(v => v.techHub).length,
            statesAboveNationalUR: values.filter(v => parseFloat(v.unemployment) > getAvg('unemployment')).length
        };
    }

    /**
     * Render summary statistics panel
     */
    renderSummaryPanel(containerId) {
        const container = document.getElementById(containerId);
        const stats = this.getSummaryStats();

        if (!container || !stats) return;

        container.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
                <div style="padding: 16px; background: var(--gray-50); border-radius: 8px;">
                    <div style="font-size: 0.875rem; font-weight: 600; color: var(--gray-700); margin-bottom: 12px;">Unemployment</div>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; text-align: center;">
                        <div>
                            <div style="font-size: 1.25rem; font-weight: 700; color: var(--secondary);">${stats.unemployment.min}%</div>
                            <div style="font-size: 0.65rem; color: var(--gray-500);">Lowest</div>
                        </div>
                        <div>
                            <div style="font-size: 1.25rem; font-weight: 700; color: var(--gray-600);">${stats.unemployment.avg}%</div>
                            <div style="font-size: 0.65rem; color: var(--gray-500);">Average</div>
                        </div>
                        <div>
                            <div style="font-size: 1.25rem; font-weight: 700; color: var(--danger);">${stats.unemployment.max}%</div>
                            <div style="font-size: 0.65rem; color: var(--gray-500);">Highest</div>
                        </div>
                    </div>
                    <div style="font-size: 0.75rem; color: var(--gray-500); margin-top: 8px;">
                        Best: ${stats.unemployment.lowest} • Worst: ${stats.unemployment.highest}
                    </div>
                </div>
                <div style="padding: 16px; background: var(--gray-50); border-radius: 8px;">
                    <div style="font-size: 0.875rem; font-weight: 600; color: var(--gray-700); margin-bottom: 12px;">AI Adoption</div>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; text-align: center;">
                        <div>
                            <div style="font-size: 1.25rem; font-weight: 700; color: var(--gray-400);">${stats.aiAdoption.min}%</div>
                            <div style="font-size: 0.65rem; color: var(--gray-500);">Lowest</div>
                        </div>
                        <div>
                            <div style="font-size: 1.25rem; font-weight: 700; color: var(--primary);">${stats.aiAdoption.avg}%</div>
                            <div style="font-size: 0.65rem; color: var(--gray-500);">Average</div>
                        </div>
                        <div>
                            <div style="font-size: 1.25rem; font-weight: 700; color: var(--primary);">${stats.aiAdoption.max}%</div>
                            <div style="font-size: 0.65rem; color: var(--gray-500);">Highest</div>
                        </div>
                    </div>
                    <div style="font-size: 0.75rem; color: var(--gray-500); margin-top: 8px;">
                        ${stats.techHubCount} tech hub states driving adoption
                    </div>
                </div>
                <div style="padding: 16px; background: var(--gray-50); border-radius: 8px;">
                    <div style="font-size: 0.875rem; font-weight: 600; color: var(--gray-700); margin-bottom: 12px;">Regional Disparity</div>
                    <div style="text-align: center; padding: 8px 0;">
                        <div style="font-size: 2rem; font-weight: 700; color: var(--warning);">${stats.statesAboveNationalUR}</div>
                        <div style="font-size: 0.75rem; color: var(--gray-500);">states above national average</div>
                    </div>
                    <div style="font-size: 0.75rem; color: var(--gray-500); margin-top: 8px;">
                        UR range: ${stats.unemployment.min}% - ${stats.unemployment.max}%
                    </div>
                </div>
            </div>
        `;
    }
}

// Global instance
const regionalHeatMap = new RegionalHeatMap();
