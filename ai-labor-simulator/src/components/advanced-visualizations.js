/**
 * Advanced Visualization Components Module
 * Enhanced charts and visualizations for the AI Labor Simulator
 * 
 * Includes:
 * - Sankey diagrams for labor flow
 * - Animated job transition visualization
 * - Regional heat maps
 * - Skill gap radar charts
 * - Comparative policy dashboards
 */

/**
 * Advanced Visualization Manager
 * Extends basic charting with sophisticated visualization types
 */
class AdvancedVisualizationManager {
    constructor() {
        this.charts = {};
        this.animations = {};

        // Color palette for consistent styling
        this.colors = {
            // Sector colors
            sectors: {
                technology: '#3b82f6',
                healthcare: '#10b981',
                manufacturing: '#f59e0b',
                retail: '#ec4899',
                finance: '#8b5cf6',
                education: '#06b6d4',
                transportation: '#f97316',
                professional_services: '#6366f1'
            },
            // Skill level colors
            skills: {
                high: '#22c55e',
                mid: '#eab308',
                low: '#ef4444'
            },
            // Region colors
            regions: {
                northeast: '#3b82f6',
                midwest: '#f59e0b',
                south: '#10b981',
                west: '#8b5cf6'
            },
            // Flow colors
            flows: {
                positive: 'rgba(34, 197, 94, 0.6)',
                negative: 'rgba(239, 68, 68, 0.6)',
                neutral: 'rgba(148, 163, 184, 0.5)'
            }
        };
    }

    /**
     * Create Sankey diagram for labor flow visualization
     * Shows how workers move between sectors/states
     */
    createSankeyDiagram(containerId, flowData) {
        const container = document.getElementById(containerId);
        if (!container) return null;

        // Clear previous content
        container.innerHTML = '';

        const width = container.clientWidth || 800;
        const height = container.clientHeight || 500;

        // Create SVG canvas
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        svg.setAttribute('class', 'sankey-diagram');
        container.appendChild(svg);

        // Process flow data into nodes and links
        const { nodes, links } = this.processSankeyData(flowData);

        // Calculate node positions (left side: source, right side: target)
        const sourceNodes = nodes.filter(n => n.type === 'source');
        const targetNodes = nodes.filter(n => n.type === 'target');

        const sourceY = this.distributeNodes(sourceNodes, height, 50);
        const targetY = this.distributeNodes(targetNodes, height, 50);

        const sourceX = 50;
        const targetX = width - 150;
        const nodeWidth = 20;

        // Draw nodes
        sourceNodes.forEach((node, i) => {
            this.drawSankeyNode(svg, sourceX, sourceY[i], nodeWidth, node.height, node.label, 'left', node.color);
            node.x = sourceX + nodeWidth;
            node.y = sourceY[i] + node.height / 2;
        });

        targetNodes.forEach((node, i) => {
            this.drawSankeyNode(svg, targetX, targetY[i], nodeWidth, node.height, node.label, 'right', node.color);
            node.x = targetX;
            node.y = targetY[i] + node.height / 2;
        });

        // Draw links (flows)
        links.forEach(link => {
            const sourceNode = nodes.find(n => n.id === link.source);
            const targetNode = nodes.find(n => n.id === link.target);
            if (sourceNode && targetNode) {
                this.drawSankeyLink(svg, sourceNode, targetNode, link.value, link.color);
            }
        });

        return svg;
    }

    /**
     * Process raw flow data into Sankey format
     */
    processSankeyData(flowData) {
        const nodes = [];
        const links = [];

        // Build nodes from sources and targets
        const sourceSet = new Set();
        const targetSet = new Set();

        flowData.flows.forEach(flow => {
            sourceSet.add(flow.from);
            targetSet.add(flow.to);
        });

        // Create source nodes
        sourceSet.forEach(source => {
            const totalOutflow = flowData.flows
                .filter(f => f.from === source)
                .reduce((sum, f) => sum + Math.abs(f.value), 0);

            nodes.push({
                id: `source_${source}`,
                label: source,
                type: 'source',
                height: Math.max(20, totalOutflow / 1000),
                color: this.colors.sectors[source] || '#64748b'
            });
        });

        // Create target nodes
        targetSet.forEach(target => {
            const totalInflow = flowData.flows
                .filter(f => f.to === target)
                .reduce((sum, f) => sum + Math.abs(f.value), 0);

            nodes.push({
                id: `target_${target}`,
                label: target,
                type: 'target',
                height: Math.max(20, totalInflow / 1000),
                color: this.colors.sectors[target] || '#64748b'
            });
        });

        // Create links
        flowData.flows.forEach(flow => {
            links.push({
                source: `source_${flow.from}`,
                target: `target_${flow.to}`,
                value: flow.value,
                color: flow.value >= 0 ? this.colors.flows.positive : this.colors.flows.negative
            });
        });

        return { nodes, links };
    }

    /**
     * Distribute nodes vertically with spacing
     */
    distributeNodes(nodes, totalHeight, padding) {
        const totalNodeHeight = nodes.reduce((sum, n) => sum + n.height, 0);
        const spacing = Math.max(10, (totalHeight - 2 * padding - totalNodeHeight) / (nodes.length + 1));

        const positions = [];
        let currentY = padding + spacing;

        nodes.forEach(node => {
            positions.push(currentY);
            currentY += node.height + spacing;
        });

        return positions;
    }

    /**
     * Draw a Sankey node (rectangle)
     */
    drawSankeyNode(svg, x, y, width, height, label, align, color) {
        // Node rectangle
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', x);
        rect.setAttribute('y', y);
        rect.setAttribute('width', width);
        rect.setAttribute('height', height);
        rect.setAttribute('fill', color);
        rect.setAttribute('rx', '3');
        svg.appendChild(rect);

        // Label
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', align === 'left' ? x - 10 : x + width + 10);
        text.setAttribute('y', y + height / 2 + 4);
        text.setAttribute('text-anchor', align === 'left' ? 'end' : 'start');
        text.setAttribute('font-size', '12');
        text.setAttribute('fill', '#1f2937');
        text.textContent = label;
        svg.appendChild(text);
    }

    /**
     * Draw a Sankey link (curved path)
     */
    drawSankeyLink(svg, source, target, value, color) {
        const thickness = Math.max(2, Math.abs(value) / 5000);

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const d = this.generateBezierPath(source.x, source.y, target.x, target.y);

        path.setAttribute('d', d);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', color);
        path.setAttribute('stroke-width', thickness);
        path.setAttribute('opacity', '0.7');

        // Add hover effects
        path.addEventListener('mouseenter', () => path.setAttribute('opacity', '1'));
        path.addEventListener('mouseleave', () => path.setAttribute('opacity', '0.7'));

        svg.appendChild(path);
    }

    /**
     * Generate bezier curve path for smooth links
     */
    generateBezierPath(x1, y1, x2, y2) {
        const midX = (x1 + x2) / 2;
        return `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;
    }

    /**
     * Create animated job transition visualization
     * Shows workers moving between employment states over time
     */
    createJobTransitionAnimation(containerId, transitionData) {
        const container = document.getElementById(containerId);
        if (!container) return null;

        container.innerHTML = '';
        container.style.position = 'relative';
        container.style.overflow = 'hidden';

        const width = container.clientWidth || 600;
        const height = container.clientHeight || 400;

        // Create canvas for animation
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        container.appendChild(canvas);

        const ctx = canvas.getContext('2d');

        // Define employment states
        const states = [
            { id: 'employed', label: 'Employed', x: width * 0.2, y: height * 0.5, color: '#22c55e' },
            { id: 'unemployed', label: 'Unemployed', x: width * 0.5, y: height * 0.2, color: '#ef4444' },
            { id: 'retraining', label: 'Retraining', x: width * 0.8, y: height * 0.35, color: '#f59e0b' },
            { id: 'new_job', label: 'New Role', x: width * 0.8, y: height * 0.65, color: '#3b82f6' },
            { id: 'retired', label: 'Retired/NILF', x: width * 0.5, y: height * 0.8, color: '#6b7280' }
        ];

        // Create particles representing workers
        const particles = [];
        const numParticles = transitionData.workers || 200;

        for (let i = 0; i < numParticles; i++) {
            const sourceState = states[Math.floor(Math.random() * 2)]; // Start employed or unemployed
            particles.push({
                x: sourceState.x + (Math.random() - 0.5) * 40,
                y: sourceState.y + (Math.random() - 0.5) * 40,
                targetX: 0,
                targetY: 0,
                color: sourceState.color,
                state: sourceState.id,
                speed: 0.5 + Math.random() * 1.5,
                transitioning: false
            });
        }

        // Animation frame counter
        let frame = 0;
        const transitionInterval = 60; // frames between transitions

        // Animation loop
        const animate = () => {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fillRect(0, 0, width, height);

            // Draw state circles
            states.forEach(state => {
                ctx.beginPath();
                ctx.arc(state.x, state.y, 50, 0, Math.PI * 2);
                ctx.fillStyle = state.color + '20';
                ctx.fill();
                ctx.strokeStyle = state.color;
                ctx.lineWidth = 2;
                ctx.stroke();

                // Label
                ctx.fillStyle = '#1f2937';
                ctx.font = 'bold 12px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(state.label, state.x, state.y + 65);
            });

            // Update and draw particles
            particles.forEach(particle => {
                // Trigger random transitions
                if (!particle.transitioning && frame % transitionInterval === 0 && Math.random() < 0.1) {
                    const transitions = this.getValidTransitions(particle.state, transitionData.rates || {});
                    if (transitions.length > 0) {
                        const newState = transitions[Math.floor(Math.random() * transitions.length)];
                        const targetState = states.find(s => s.id === newState);
                        if (targetState) {
                            particle.transitioning = true;
                            particle.targetX = targetState.x + (Math.random() - 0.5) * 30;
                            particle.targetY = targetState.y + (Math.random() - 0.5) * 30;
                            particle.color = targetState.color;
                            particle.state = newState;
                        }
                    }
                }

                // Move toward target
                if (particle.transitioning) {
                    const dx = particle.targetX - particle.x;
                    const dy = particle.targetY - particle.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 2) {
                        particle.transitioning = false;
                    } else {
                        particle.x += (dx / dist) * particle.speed;
                        particle.y += (dy / dist) * particle.speed;
                    }
                } else {
                    // Random movement around state
                    particle.x += (Math.random() - 0.5) * 0.5;
                    particle.y += (Math.random() - 0.5) * 0.5;
                }

                // Draw particle
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
                ctx.fillStyle = particle.color;
                ctx.fill();
            });

            frame++;
            this.animations[containerId] = requestAnimationFrame(animate);
        };

        animate();

        return {
            stop: () => {
                if (this.animations[containerId]) {
                    cancelAnimationFrame(this.animations[containerId]);
                    delete this.animations[containerId];
                }
            }
        };
    }

    /**
     * Get valid transition targets based on current state
     */
    getValidTransitions(currentState, rates) {
        const transitions = {
            employed: ['unemployed', 'retraining', 'retired'],
            unemployed: ['employed', 'retraining', 'retired', 'new_job'],
            retraining: ['employed', 'new_job'],
            new_job: ['employed', 'unemployed'],
            retired: []
        };
        return transitions[currentState] || [];
    }

    /**
     * Create regional heat map showing AI impact by geography
     */
    createRegionalHeatMap(containerId, regionalData) {
        const container = document.getElementById(containerId);
        if (!container) return null;

        container.innerHTML = '';

        const width = container.clientWidth || 800;
        const height = container.clientHeight || 500;

        // Create SVG
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        svg.setAttribute('viewBox', '0 0 800 500');
        container.appendChild(svg);

        // Simplified US region boundaries (approximate)
        const regionPaths = {
            northeast: 'M 650,100 L 750,80 L 780,150 L 720,200 L 650,180 Z',
            midwest: 'M 400,120 L 550,100 L 580,180 L 550,280 L 400,260 L 380,180 Z',
            south: 'M 380,260 L 550,280 L 700,300 L 680,420 L 400,400 L 300,350 Z',
            west: 'M 50,100 L 300,80 L 380,180 L 400,400 L 200,450 L 50,350 Z'
        };

        // Find min/max for color scaling
        const values = Object.values(regionalData.regions || {}).map(r => r.net_change);
        const minVal = Math.min(...values, 0);
        const maxVal = Math.max(...values, 0);

        // Draw regions
        Object.entries(regionPaths).forEach(([region, pathData]) => {
            const data = regionalData.regions?.[region] || { net_change: 0 };
            const color = this.getHeatMapColor(data.net_change, minVal, maxVal);

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', pathData);
            path.setAttribute('fill', color);
            path.setAttribute('stroke', '#1f2937');
            path.setAttribute('stroke-width', '2');
            path.style.cursor = 'pointer';

            // Hover effects
            path.addEventListener('mouseenter', () => {
                path.setAttribute('stroke-width', '3');
                this.showTooltip(container, data, region);
            });
            path.addEventListener('mouseleave', () => {
                path.setAttribute('stroke-width', '2');
                this.hideTooltip(container);
            });

            svg.appendChild(path);

            // Region label
            const centroid = this.getPathCentroid(pathData);
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', centroid.x);
            text.setAttribute('y', centroid.y);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('font-size', '14');
            text.setAttribute('font-weight', 'bold');
            text.setAttribute('fill', '#1f2937');
            text.textContent = region.charAt(0).toUpperCase() + region.slice(1);
            svg.appendChild(text);

            // Value label
            const valueText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            valueText.setAttribute('x', centroid.x);
            valueText.setAttribute('y', centroid.y + 18);
            valueText.setAttribute('text-anchor', 'middle');
            valueText.setAttribute('font-size', '12');
            valueText.setAttribute('fill', data.net_change >= 0 ? '#22c55e' : '#ef4444');
            valueText.textContent = (data.net_change >= 0 ? '+' : '') +
                this.formatNumber(data.net_change) + ' jobs';
            svg.appendChild(valueText);
        });

        // Add legend
        this.addHeatMapLegend(svg, minVal, maxVal, 650, 420);

        return svg;
    }

    /**
     * Get heat map color based on value
     */
    getHeatMapColor(value, min, max) {
        if (value === 0) return '#f3f4f6';

        if (value > 0) {
            const intensity = Math.min(1, value / max);
            const r = Math.round(34 + (1 - intensity) * 200);
            const g = Math.round(197 - intensity * 50);
            const b = Math.round(94 + (1 - intensity) * 150);
            return `rgb(${r}, ${g}, ${b})`;
        } else {
            const intensity = Math.min(1, Math.abs(value) / Math.abs(min));
            const r = Math.round(239 - (1 - intensity) * 100);
            const g = Math.round(68 + (1 - intensity) * 150);
            const b = Math.round(68 + (1 - intensity) * 150);
            return `rgb(${r}, ${g}, ${b})`;
        }
    }

    /**
     * Get approximate centroid of SVG path
     */
    getPathCentroid(pathData) {
        const coords = pathData.match(/[\d.]+/g).map(Number);
        let sumX = 0, sumY = 0, count = 0;

        for (let i = 0; i < coords.length; i += 2) {
            sumX += coords[i];
            sumY += coords[i + 1];
            count++;
        }

        return { x: sumX / count, y: sumY / count };
    }

    /**
     * Add color legend to heat map
     */
    addHeatMapLegend(svg, min, max, x, y) {
        const width = 120;
        const height = 15;

        // Gradient definition
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        gradient.setAttribute('id', 'heatmap-gradient');

        const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop1.setAttribute('offset', '0%');
        stop1.setAttribute('stop-color', '#ef4444');

        const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop2.setAttribute('offset', '50%');
        stop2.setAttribute('stop-color', '#f3f4f6');

        const stop3 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop3.setAttribute('offset', '100%');
        stop3.setAttribute('stop-color', '#22c55e');

        gradient.appendChild(stop1);
        gradient.appendChild(stop2);
        gradient.appendChild(stop3);
        defs.appendChild(gradient);
        svg.appendChild(defs);

        // Legend bar
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', x);
        rect.setAttribute('y', y);
        rect.setAttribute('width', width);
        rect.setAttribute('height', height);
        rect.setAttribute('fill', 'url(#heatmap-gradient)');
        rect.setAttribute('stroke', '#1f2937');
        svg.appendChild(rect);

        // Labels
        const labels = [
            { text: this.formatNumber(min), x: x },
            { text: '0', x: x + width / 2 },
            { text: '+' + this.formatNumber(max), x: x + width }
        ];

        labels.forEach(label => {
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', label.x);
            text.setAttribute('y', y + height + 15);
            text.setAttribute('text-anchor', label.x === x ? 'start' :
                label.x === x + width ? 'end' : 'middle');
            text.setAttribute('font-size', '10');
            text.setAttribute('fill', '#64748b');
            text.textContent = label.text;
            svg.appendChild(text);
        });
    }

    /**
     * Create skill gap radar chart
     * Shows mismatch between required skills and available workforce skills
     */
    createSkillGapRadar(containerId, skillData) {
        const container = document.getElementById(containerId);
        if (!container) return null;

        const ctx = this.getOrCreateCanvas(container);
        const chartId = containerId;

        // Destroy existing chart
        if (this.charts[chartId]) {
            this.charts[chartId].destroy();
        }

        const skills = Object.keys(skillData.required || {});
        const required = Object.values(skillData.required || {});
        const available = Object.values(skillData.available || {});

        this.charts[chartId] = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: skills.map(s => this.formatSkillLabel(s)),
                datasets: [
                    {
                        label: 'Required Skills',
                        data: required,
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.2)',
                        pointBackgroundColor: '#ef4444',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: '#ef4444'
                    },
                    {
                        label: 'Available Skills',
                        data: available,
                        borderColor: '#22c55e',
                        backgroundColor: 'rgba(34, 197, 94, 0.2)',
                        pointBackgroundColor: '#22c55e',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: '#22c55e'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Skill Gap Analysis',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const gap = required[context.dataIndex] - available[context.dataIndex];
                                return `${context.dataset.label}: ${context.raw.toFixed(1)} (Gap: ${gap > 0 ? '+' : ''}${gap.toFixed(1)})`;
                            }
                        }
                    }
                },
                scales: {
                    r: {
                        angleLines: {
                            display: true,
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        suggestedMin: 0,
                        suggestedMax: 10,
                        ticks: {
                            stepSize: 2
                        }
                    }
                }
            }
        });

        return this.charts[chartId];
    }

    /**
     * Format skill label for display
     */
    formatSkillLabel(skill) {
        return skill.split('_').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    /**
     * Create comparative policy dashboard
     * Compare outcomes of different intervention scenarios
     */
    createPolicyDashboard(containerId, scenarios) {
        const container = document.getElementById(containerId);
        if (!container) return null;

        container.innerHTML = '';
        container.style.display = 'grid';
        container.style.gridTemplateColumns = 'repeat(auto-fit, minmax(300px, 1fr))';
        container.style.gap = '20px';
        container.style.padding = '20px';

        // Create comparison cards for each scenario
        scenarios.forEach((scenario, index) => {
            const card = this.createScenarioCard(scenario, index);
            container.appendChild(card);
        });

        // Add summary comparison chart
        const summaryContainer = document.createElement('div');
        summaryContainer.style.gridColumn = '1 / -1';
        summaryContainer.id = `${containerId}-summary`;
        summaryContainer.style.height = '300px';
        container.appendChild(summaryContainer);

        this.createComparisonChart(`${containerId}-summary`, scenarios);

        return container;
    }

    /**
     * Create scenario comparison card
     */
    createScenarioCard(scenario, index) {
        const card = document.createElement('div');
        card.className = 'scenario-card';
        card.style.cssText = `
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            border-left: 4px solid ${this.getScenarioColor(index)};
        `;

        const title = document.createElement('h3');
        title.style.cssText = 'margin: 0 0 15px 0; color: #1f2937; font-size: 18px;';
        title.textContent = scenario.name || `Scenario ${index + 1}`;
        card.appendChild(title);

        // Metrics grid
        const metrics = [
            { label: 'Unemployment', value: scenario.unemployment_rate, suffix: '%', positive: false },
            { label: 'Job Change', value: scenario.net_job_change, suffix: '', positive: true },
            { label: 'Wage Growth', value: scenario.wage_growth, suffix: '%', positive: true },
            { label: 'Fiscal Cost', value: scenario.fiscal_cost, suffix: 'B', positive: false }
        ];

        const grid = document.createElement('div');
        grid.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr; gap: 10px;';

        metrics.forEach(metric => {
            const item = document.createElement('div');
            item.style.cssText = 'text-align: center; padding: 10px; background: #f8fafc; border-radius: 8px;';

            const value = document.createElement('div');
            value.style.cssText = `
                font-size: 20px; 
                font-weight: bold; 
                color: ${this.getMetricColor(metric.value, metric.positive)};
            `;
            value.textContent = this.formatMetricValue(metric.value, metric.suffix);

            const label = document.createElement('div');
            label.style.cssText = 'font-size: 12px; color: #64748b; margin-top: 4px;';
            label.textContent = metric.label;

            item.appendChild(value);
            item.appendChild(label);
            grid.appendChild(item);
        });

        card.appendChild(grid);

        // Interventions list
        if (scenario.interventions && scenario.interventions.length > 0) {
            const interventionsDiv = document.createElement('div');
            interventionsDiv.style.cssText = 'margin-top: 15px; padding-top: 15px; border-top: 1px solid #e2e8f0;';

            const interventionsTitle = document.createElement('div');
            interventionsTitle.style.cssText = 'font-size: 12px; color: #64748b; margin-bottom: 8px;';
            interventionsTitle.textContent = 'Active Interventions:';
            interventionsDiv.appendChild(interventionsTitle);

            scenario.interventions.slice(0, 3).forEach(intervention => {
                const tag = document.createElement('span');
                tag.style.cssText = `
                    display: inline-block;
                    background: #e0f2fe;
                    color: #0369a1;
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 11px;
                    margin: 2px;
                `;
                tag.textContent = intervention;
                interventionsDiv.appendChild(tag);
            });

            card.appendChild(interventionsDiv);
        }

        return card;
    }

    /**
     * Create comparison bar chart for scenarios
     */
    createComparisonChart(containerId, scenarios) {
        const container = document.getElementById(containerId);
        if (!container) return null;

        const ctx = this.getOrCreateCanvas(container);
        const chartId = containerId;

        if (this.charts[chartId]) {
            this.charts[chartId].destroy();
        }

        const labels = scenarios.map(s => s.name || 'Scenario');
        const colors = scenarios.map((_, i) => this.getScenarioColor(i));

        this.charts[chartId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Net Job Change (thousands)',
                        data: scenarios.map(s => (s.net_job_change || 0) / 1000),
                        backgroundColor: colors.map(c => c + '80'),
                        borderColor: colors,
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Scenario Comparison: Net Employment Impact',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Jobs (thousands)'
                        }
                    }
                }
            }
        });

        return this.charts[chartId];
    }

    /**
     * Get scenario color by index
     */
    getScenarioColor(index) {
        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];
        return colors[index % colors.length];
    }

    /**
     * Get metric color based on value and whether positive is good
     */
    getMetricColor(value, positiveIsGood) {
        if (value === 0 || value === null) return '#64748b';
        const isPositive = value > 0;
        if (positiveIsGood) {
            return isPositive ? '#22c55e' : '#ef4444';
        } else {
            return isPositive ? '#ef4444' : '#22c55e';
        }
    }

    /**
     * Format metric value for display
     */
    formatMetricValue(value, suffix) {
        if (value === null || value === undefined) return 'N/A';
        const formatted = Math.abs(value) >= 1000000
            ? (value / 1000000).toFixed(1) + 'M'
            : Math.abs(value) >= 1000
                ? (value / 1000).toFixed(1) + 'K'
                : value.toFixed(1);
        return (value > 0 ? '+' : '') + formatted + suffix;
    }

    /**
     * Helper: Get or create canvas in container
     */
    getOrCreateCanvas(container) {
        let canvas = container.querySelector('canvas');
        if (!canvas) {
            container.innerHTML = '';
            canvas = document.createElement('canvas');
            container.appendChild(canvas);
        }
        return canvas.getContext('2d');
    }

    /**
     * Helper: Format large numbers
     */
    formatNumber(num) {
        if (Math.abs(num) >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (Math.abs(num) >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toFixed(0);
    }

    /**
     * Show tooltip on hover
     */
    showTooltip(container, data, region) {
        let tooltip = container.querySelector('.viz-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.className = 'viz-tooltip';
            tooltip.style.cssText = `
                position: absolute;
                background: white;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 12px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                pointer-events: none;
                z-index: 100;
                font-size: 12px;
            `;
            container.appendChild(tooltip);
        }

        tooltip.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 8px; color: #1f2937;">
                ${region.charAt(0).toUpperCase() + region.slice(1)}
            </div>
            <div>Net Change: <span style="color: ${data.net_change >= 0 ? '#22c55e' : '#ef4444'}">
                ${data.net_change >= 0 ? '+' : ''}${this.formatNumber(data.net_change)}
            </span></div>
            <div>Displaced: ${this.formatNumber(data.displaced || 0)}</div>
            <div>New Jobs: ${this.formatNumber(data.new_jobs || 0)}</div>
            <div>Vulnerability: ${(data.vulnerability_index * 100).toFixed(0)}%</div>
        `;

        tooltip.style.display = 'block';
        tooltip.style.top = '10px';
        tooltip.style.right = '10px';
    }

    /**
     * Hide tooltip
     */
    hideTooltip(container) {
        const tooltip = container.querySelector('.viz-tooltip');
        if (tooltip) {
            tooltip.style.display = 'none';
        }
    }

    /**
     * Destroy all charts and animations
     */
    destroyAll() {
        Object.values(this.charts).forEach(chart => {
            if (chart && chart.destroy) {
                chart.destroy();
            }
        });
        this.charts = {};

        Object.values(this.animations).forEach(animId => {
            cancelAnimationFrame(animId);
        });
        this.animations = {};
    }
}


// Export for ES modules
export { AdvancedVisualizationManager };

// Also export to window for backwards compatibility
if (typeof window !== 'undefined') {
    window.AdvancedVisualizationManager = AdvancedVisualizationManager;
}
