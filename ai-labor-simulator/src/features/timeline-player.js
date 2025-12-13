/**
 * Timeline Player
 * Animated playback of simulation results through time with visual graphs
 */

class TimelinePlayer {
    constructor() {
        this.isPlaying = false;
        this.currentYearIndex = 0;
        this.playbackSpeed = 1000; // ms per year
        this.playbackInterval = null;
        this.simulationData = null;
        this.years = [];
        this.onYearChange = null;
        this.onPlayStateChange = null;
    }

    /**
     * Initialize the player with simulation data
     * @param {Object} simulationResults - Results from simulation engine
     */
    initialize(simulationResults) {
        // The simulation stores yearly data in results.results array
        const yearlyData = simulationResults?.results || simulationResults?.timeline;
        if (!yearlyData || yearlyData.length === 0) {
            console.warn('No timeline data available');
            return false;
        }

        // Store the data with timeline property for easier access
        this.simulationData = {
            ...simulationResults,
            timeline: yearlyData
        };
        this.years = yearlyData.map(t => t.year);
        this.currentYearIndex = 0;
        this.isPlaying = false;

        return true;
    }

    /**
     * Get current year data
     */
    getCurrentYearData() {
        if (!this.simulationData || !this.simulationData.timeline) {
            return null;
        }
        return this.simulationData.timeline[this.currentYearIndex];
    }

    /**
     * Get data for a specific year index
     */
    getYearData(index) {
        if (!this.simulationData || !this.simulationData.timeline) {
            return null;
        }
        return this.simulationData.timeline[Math.min(index, this.simulationData.timeline.length - 1)];
    }

    /**
     * Get all timeline data
     */
    getAllData() {
        return this.simulationData?.timeline || [];
    }

    /**
     * Start playback
     */
    play() {
        if (this.isPlaying) return;

        this.isPlaying = true;
        if (this.onPlayStateChange) {
            this.onPlayStateChange(true);
        }

        this.playbackInterval = setInterval(() => {
            if (this.currentYearIndex < this.years.length - 1) {
                this.currentYearIndex++;
                this.emitYearChange();
            } else {
                this.pause();
                // Reset to beginning for next play
                this.currentYearIndex = 0;
                this.emitYearChange();
            }
        }, this.playbackSpeed);
    }

    /**
     * Pause playback
     */
    pause() {
        this.isPlaying = false;
        if (this.playbackInterval) {
            clearInterval(this.playbackInterval);
            this.playbackInterval = null;
        }
        if (this.onPlayStateChange) {
            this.onPlayStateChange(false);
        }
    }

    /**
     * Toggle play/pause
     */
    toggle() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    /**
     * Seek to specific year index
     */
    seekTo(index) {
        this.pause();
        this.currentYearIndex = Math.max(0, Math.min(index, this.years.length - 1));
        this.emitYearChange();
    }

    /**
     * Seek to specific year
     */
    seekToYear(year) {
        const index = this.years.indexOf(year);
        if (index !== -1) {
            this.seekTo(index);
        }
    }

    /**
     * Step forward one year
     */
    stepForward() {
        this.pause();
        if (this.currentYearIndex < this.years.length - 1) {
            this.currentYearIndex++;
            this.emitYearChange();
        }
    }

    /**
     * Step backward one year
     */
    stepBackward() {
        this.pause();
        if (this.currentYearIndex > 0) {
            this.currentYearIndex--;
            this.emitYearChange();
        }
    }

    /**
     * Go to first year
     */
    goToStart() {
        this.pause();
        this.currentYearIndex = 0;
        this.emitYearChange();
    }

    /**
     * Go to last year
     */
    goToEnd() {
        this.pause();
        this.currentYearIndex = this.years.length - 1;
        this.emitYearChange();
    }

    /**
     * Set playback speed
     * @param {number} speed - Milliseconds per year (lower = faster)
     */
    setSpeed(speed) {
        this.playbackSpeed = speed;
        if (this.isPlaying) {
            this.pause();
            this.play();
        }
    }

    /**
     * Emit year change event
     */
    emitYearChange() {
        if (this.onYearChange) {
            this.onYearChange(this.currentYearIndex, this.getCurrentYearData());
        }
    }

    /**
     * Get progress percentage (0-100)
     */
    getProgress() {
        if (this.years.length <= 1) return 100;
        return (this.currentYearIndex / (this.years.length - 1)) * 100;
    }

    /**
     * Destroy the player
     */
    destroy() {
        this.pause();
        this.simulationData = null;
        this.years = [];
        this.onYearChange = null;
        this.onPlayStateChange = null;
    }
}

/**
 * Timeline UI Component with Visual Charts
 * Renders the timeline player controls, display, and animated graphs
 */
class TimelineUI {
    constructor(containerId, player) {
        this.container = document.getElementById(containerId);
        this.player = player;
        this.animatedMetrics = {};
        this.charts = {};
        this.metricConfigs = [
            {
                key: 'unemployment_rate',
                label: 'Unemployment Rate',
                unit: '%',
                color: '#ef4444',
                colorLight: 'rgba(239, 68, 68, 0.2)',
                decimals: 1,
                extract: (d) => this.getNumber(d.labor_market?.unemployment_rate ?? d.unemployment_rate ?? 0)
            },
            {
                key: 'ai_adoption',
                label: 'AI Adoption',
                unit: '%',
                color: '#10b981',
                colorLight: 'rgba(16, 185, 129, 0.2)',
                decimals: 0,
                extract: (d) => {
                    const raw = d.ai_adoption;
                    return (typeof raw === 'object' ? this.getNumber(raw?.rate) : this.getNumber(raw)) * 100;
                }
            },
            {
                key: 'productivity',
                label: 'Productivity Growth',
                unit: '%',
                color: '#6366f1',
                colorLight: 'rgba(99, 102, 241, 0.2)',
                decimals: 1,
                extract: (d) => {
                    const raw = d.productivity;
                    return typeof raw === 'object' ? this.getNumber(raw?.growth_rate) : this.getNumber(raw);
                }
            },
            {
                key: 'employment',
                label: 'Total Employment',
                unit: 'M',
                color: '#3b82f6',
                colorLight: 'rgba(59, 130, 246, 0.2)',
                decimals: 1,
                extract: (d) => this.getNumber(d.labor_market?.total_employment ?? d.labor_market?.employment ?? d.employment ?? 0) / 1e6,
                formatValue: (v) => v.toFixed(1) + 'M'
            }
        ];

        // Bind player events
        this.player.onYearChange = (index, data) => this.handleYearChange(index, data);
        this.player.onPlayStateChange = (isPlaying) => this.handlePlayStateChange(isPlaying);
    }

    /**
     * Helper to safely get numeric value
     */
    getNumber(val) {
        if (typeof val === 'number') return val;
        if (typeof val === 'object' && val !== null) return 0;
        return parseFloat(val) || 0;
    }

    /**
     * Extract all metric values from timeline data
     */
    extractMetricSeries() {
        const allData = this.player.getAllData();
        const series = {};

        for (const config of this.metricConfigs) {
            series[config.key] = allData.map(d => config.extract(d));
        }

        return series;
    }

    /**
     * Render the timeline UI
     */
    render() {
        if (!this.container) {
            console.error('Timeline container not found');
            return;
        }

        const years = this.player.years;
        console.log('Rendering timeline with years:', years.length > 0 ? `${years[0]} to ${years[years.length-1]}` : 'empty');

        if (years.length === 0) {
            this.container.innerHTML = '<p style="text-align: center; color: var(--gray-500);">Run a simulation to see the timeline player.</p>';
            return;
        }

        const metricSeries = this.extractMetricSeries();

        this.container.innerHTML = `
            <div class="timeline-player">
                <!-- Header with Year and Controls -->
                <div class="timeline-header">
                    <div class="timeline-year-display">
                        <span class="timeline-year-label">Year</span>
                        <span class="timeline-year-value" id="timeline-current-year">${years[0]}</span>
                    </div>

                    <div class="timeline-controls">
                        <button class="timeline-btn" onclick="timelinePlayer.goToStart()" title="Go to start">⏮</button>
                        <button class="timeline-btn" onclick="timelinePlayer.stepBackward()" title="Previous year">◀</button>
                        <button class="timeline-btn timeline-btn-play" id="timeline-play-btn" onclick="timelinePlayer.toggle()" title="Play/Pause">
                            <span id="timeline-play-icon">▶</span>
                        </button>
                        <button class="timeline-btn" onclick="timelinePlayer.stepForward()" title="Next year">▶</button>
                        <button class="timeline-btn" onclick="timelinePlayer.goToEnd()" title="Go to end">⏭</button>

                        <select class="timeline-speed-select" id="timeline-speed" onchange="timelineUI.handleSpeedChange(this.value)" title="Playback speed">
                            <option value="2000">0.5x</option>
                            <option value="1000" selected>1x</option>
                            <option value="500">2x</option>
                            <option value="250">4x</option>
                        </select>
                    </div>
                </div>

                <!-- Visual Timeline Scrubber -->
                <div class="timeline-scrubber">
                    <div class="timeline-track">
                        ${years.map((year, i) => `
                            <div class="timeline-tick ${i === 0 ? 'active' : ''}"
                                 data-index="${i}"
                                 onclick="timelineUI.handleTickClick(${i})"
                                 title="${year}">
                                <div class="timeline-tick-dot"></div>
                                ${i === 0 || i === years.length - 1 || i % Math.ceil(years.length / 5) === 0 ?
                                  `<span class="timeline-tick-label">${year}</span>` : ''}
                            </div>
                        `).join('')}
                        <div class="timeline-track-line"></div>
                        <div class="timeline-track-progress" id="timeline-track-progress"></div>
                    </div>
                </div>

                <!-- Charts Grid -->
                <div class="timeline-charts-grid">
                    ${this.metricConfigs.map(config => this.renderChartCard(config, metricSeries[config.key])).join('')}
                </div>
            </div>
        `;

        // Initialize charts after DOM is ready
        requestAnimationFrame(() => this.initializeCharts(metricSeries));
    }

    /**
     * Render a chart card for a metric
     */
    renderChartCard(config, data) {
        const currentValue = data[0];
        const formatValue = config.formatValue || ((v) => v.toFixed(config.decimals) + config.unit);

        return `
            <div class="timeline-chart-card" data-metric="${config.key}">
                <div class="timeline-chart-header">
                    <span class="timeline-chart-label">${config.label}</span>
                    <span class="timeline-chart-value" id="chart-value-${config.key}" style="color: ${config.color}">
                        ${formatValue(currentValue)}
                    </span>
                </div>
                <div class="timeline-chart-container">
                    <canvas id="chart-${config.key}" class="timeline-chart-canvas"></canvas>
                </div>
            </div>
        `;
    }

    /**
     * Initialize canvas charts
     */
    initializeCharts(metricSeries) {
        for (const config of this.metricConfigs) {
            const canvas = document.getElementById(`chart-${config.key}`);
            if (!canvas) continue;

            const ctx = canvas.getContext('2d');
            const data = metricSeries[config.key];

            // Set canvas size
            const rect = canvas.parentElement.getBoundingClientRect();
            canvas.width = rect.width * window.devicePixelRatio;
            canvas.height = rect.height * window.devicePixelRatio;
            canvas.style.width = rect.width + 'px';
            canvas.style.height = rect.height + 'px';
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

            // Store chart info
            this.charts[config.key] = {
                canvas,
                ctx,
                data,
                config,
                width: rect.width,
                height: rect.height
            };

            this.drawChart(config.key, 0);
        }
    }

    /**
     * Draw a chart with current year highlighted
     */
    drawChart(key, currentIndex) {
        const chart = this.charts[key];
        if (!chart) return;

        const { ctx, data, config, width, height } = chart;
        const padding = { top: 10, right: 10, bottom: 10, left: 10 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        if (data.length < 2) return;

        // Calculate min/max with some padding
        const minVal = Math.min(...data);
        const maxVal = Math.max(...data);
        const range = maxVal - minVal || 1;
        const yMin = minVal - range * 0.1;
        const yMax = maxVal + range * 0.1;

        // Helper to convert data point to canvas coordinates
        const toX = (i) => padding.left + (i / (data.length - 1)) * chartWidth;
        const toY = (v) => padding.top + chartHeight - ((v - yMin) / (yMax - yMin)) * chartHeight;

        // Draw filled area up to current index
        ctx.beginPath();
        ctx.moveTo(toX(0), toY(data[0]));
        for (let i = 1; i <= currentIndex; i++) {
            ctx.lineTo(toX(i), toY(data[i]));
        }
        ctx.lineTo(toX(currentIndex), height - padding.bottom);
        ctx.lineTo(toX(0), height - padding.bottom);
        ctx.closePath();
        ctx.fillStyle = config.colorLight;
        ctx.fill();

        // Draw full line (faded)
        ctx.beginPath();
        ctx.moveTo(toX(0), toY(data[0]));
        for (let i = 1; i < data.length; i++) {
            ctx.lineTo(toX(i), toY(data[i]));
        }
        ctx.strokeStyle = 'rgba(150, 150, 150, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw active line up to current index
        ctx.beginPath();
        ctx.moveTo(toX(0), toY(data[0]));
        for (let i = 1; i <= currentIndex; i++) {
            ctx.lineTo(toX(i), toY(data[i]));
        }
        ctx.strokeStyle = config.color;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw current point
        ctx.beginPath();
        ctx.arc(toX(currentIndex), toY(data[currentIndex]), 5, 0, Math.PI * 2);
        ctx.fillStyle = config.color;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw vertical line at current position
        ctx.beginPath();
        ctx.moveTo(toX(currentIndex), padding.top);
        ctx.lineTo(toX(currentIndex), height - padding.bottom);
        ctx.strokeStyle = 'rgba(150, 150, 150, 0.2)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    /**
     * Handle year change
     */
    handleYearChange(index, data) {
        // Update year display
        const yearDisplay = document.getElementById('timeline-current-year');
        if (yearDisplay) {
            yearDisplay.textContent = this.player.years[index];
            yearDisplay.classList.add('timeline-year-animate');
            setTimeout(() => yearDisplay.classList.remove('timeline-year-animate'), 300);
        }

        // Update timeline ticks
        const ticks = document.querySelectorAll('.timeline-tick');
        ticks.forEach((tick, i) => {
            tick.classList.toggle('active', i <= index);
            tick.classList.toggle('current', i === index);
        });

        // Update track progress
        const progress = document.getElementById('timeline-track-progress');
        if (progress) {
            const percentage = this.player.years.length > 1
                ? (index / (this.player.years.length - 1)) * 100
                : 0;
            progress.style.width = percentage + '%';
        }

        // Update charts
        for (const config of this.metricConfigs) {
            this.drawChart(config.key, index);

            // Update value display
            const valueEl = document.getElementById(`chart-value-${config.key}`);
            if (valueEl && data) {
                const value = config.extract(data);
                const formatValue = config.formatValue || ((v) => v.toFixed(config.decimals) + config.unit);
                this.animateValue(valueEl, value, formatValue);
            }
        }
    }

    /**
     * Animate value change
     */
    animateValue(el, newValue, formatter) {
        const key = el.id;
        const oldValue = this.animatedMetrics[key] ?? newValue;
        this.animatedMetrics[key] = newValue;

        const duration = 300;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentValue = oldValue + (newValue - oldValue) * easeProgress;

            el.textContent = formatter(currentValue);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    /**
     * Handle play state change
     */
    handlePlayStateChange(isPlaying) {
        const playIcon = document.getElementById('timeline-play-icon');
        const playBtn = document.getElementById('timeline-play-btn');

        if (playIcon) {
            playIcon.textContent = isPlaying ? '⏸' : '▶';
        }
        if (playBtn) {
            playBtn.classList.toggle('playing', isPlaying);
        }
    }

    /**
     * Handle tick click
     */
    handleTickClick(index) {
        this.player.seekTo(index);
    }

    /**
     * Handle slider change
     */
    handleSliderChange(value) {
        this.player.seekTo(parseInt(value));
    }

    /**
     * Handle speed change
     */
    handleSpeedChange(value) {
        this.player.setSpeed(parseInt(value));
    }
}

// Global instances
const timelinePlayer = new TimelinePlayer();
let timelineUI = null;

/**
 * Initialize timeline with simulation results
 */
function initializeTimeline(simulationResults) {
    console.log('Initializing timeline player...');

    // Check if container exists
    const container = document.getElementById('timeline-player-container');
    if (!container) {
        console.warn('Timeline container not found, retrying...');
        // Retry after a short delay
        setTimeout(() => initializeTimeline(simulationResults), 100);
        return false;
    }

    if (timelinePlayer.initialize(simulationResults)) {
        console.log('Timeline player initialized with', timelinePlayer.years.length, 'data points');
        timelineUI = new TimelineUI('timeline-player-container', timelinePlayer);
        timelineUI.render();
        console.log('Timeline UI rendered');
        return true;
    } else {
        console.warn('Failed to initialize timeline player - no data');
        container.innerHTML = '<p style="text-align: center; color: var(--gray-500); padding: 20px;">No timeline data available.</p>';
    }
    return false;
}
