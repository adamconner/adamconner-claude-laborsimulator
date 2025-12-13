/**
 * Timeline Player
 * Animated playback of simulation results through time
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
 * Timeline UI Component
 * Renders the timeline player controls and display
 */
class TimelineUI {
    constructor(containerId, player) {
        this.container = document.getElementById(containerId);
        this.player = player;
        this.animatedMetrics = {};

        // Bind player events
        this.player.onYearChange = (index, data) => this.handleYearChange(index, data);
        this.player.onPlayStateChange = (isPlaying) => this.handlePlayStateChange(isPlaying);
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

        this.container.innerHTML = `
            <div class="timeline-player">
                <!-- Current Year Display -->
                <div class="timeline-year-display">
                    <span class="timeline-year-label">Year</span>
                    <span class="timeline-year-value" id="timeline-current-year">${years[0]}</span>
                </div>

                <!-- Animated Metrics -->
                <div class="timeline-metrics" id="timeline-metrics">
                    ${this.renderMetrics(this.player.getYearData(0))}
                </div>

                <!-- Timeline Slider -->
                <div class="timeline-slider-container">
                    <span class="timeline-year-marker">${years[0]}</span>
                    <input type="range"
                           class="timeline-slider"
                           id="timeline-slider"
                           min="0"
                           max="${years.length - 1}"
                           value="0"
                           oninput="timelineUI.handleSliderChange(this.value)">
                    <span class="timeline-year-marker">${years[years.length - 1]}</span>
                </div>

                <!-- Playback Controls -->
                <div class="timeline-controls">
                    <button class="timeline-btn" onclick="timelinePlayer.goToStart()" title="Go to start">
                        <span>⏮</span>
                    </button>
                    <button class="timeline-btn" onclick="timelinePlayer.stepBackward()" title="Previous year">
                        <span>◀</span>
                    </button>
                    <button class="timeline-btn timeline-btn-play" id="timeline-play-btn" onclick="timelinePlayer.toggle()" title="Play/Pause">
                        <span id="timeline-play-icon">▶</span>
                    </button>
                    <button class="timeline-btn" onclick="timelinePlayer.stepForward()" title="Next year">
                        <span>▶</span>
                    </button>
                    <button class="timeline-btn" onclick="timelinePlayer.goToEnd()" title="Go to end">
                        <span>⏭</span>
                    </button>
                </div>

                <!-- Speed Controls -->
                <div class="timeline-speed">
                    <label>Speed:</label>
                    <select id="timeline-speed" onchange="timelineUI.handleSpeedChange(this.value)">
                        <option value="2000">0.5x</option>
                        <option value="1000" selected>1x</option>
                        <option value="500">2x</option>
                        <option value="250">4x</option>
                    </select>
                </div>

                <!-- Progress Indicator -->
                <div class="timeline-progress">
                    <div class="timeline-progress-bar" id="timeline-progress-bar" style="width: 0%"></div>
                </div>
            </div>
        `;
    }

    /**
     * Render metrics for a given year
     */
    renderMetrics(yearData) {
        if (!yearData) return '';

        // Extract values from the simulation data structure
        const unemploymentRate = yearData.labor_market?.unemployment_rate || yearData.unemployment_rate || 0;
        const employment = yearData.labor_market?.total_employment || yearData.labor_market?.employment || yearData.employment || 0;
        const aiAdoption = yearData.ai_adoption?.rate || yearData.ai_adoption || 0;
        const productivity = yearData.productivity?.average || yearData.productivity || 0;

        const metrics = [
            {
                key: 'unemployment_rate',
                label: 'Unemployment',
                value: unemploymentRate,
                format: (v) => v.toFixed(1) + '%',
                color: this.getMetricColor(unemploymentRate, 4, 10)
            },
            {
                key: 'employment',
                label: 'Employment',
                value: employment,
                format: (v) => this.formatNumber(v),
                color: 'var(--primary)'
            },
            {
                key: 'ai_adoption',
                label: 'AI Adoption',
                value: aiAdoption * 100,
                format: (v) => v.toFixed(0) + '%',
                color: 'var(--secondary)'
            },
            {
                key: 'productivity',
                label: 'Productivity',
                value: productivity,
                format: (v) => v.toFixed(1) + '%',
                color: 'var(--success)'
            }
        ];

        return metrics.map(m => `
            <div class="timeline-metric">
                <div class="timeline-metric-label">${m.label}</div>
                <div class="timeline-metric-value" id="metric-${m.key}" style="color: ${m.color}">
                    ${m.format(m.value)}
                </div>
            </div>
        `).join('');
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

        // Update slider
        const slider = document.getElementById('timeline-slider');
        if (slider) {
            slider.value = index;
        }

        // Update progress bar
        const progressBar = document.getElementById('timeline-progress-bar');
        if (progressBar) {
            progressBar.style.width = this.player.getProgress() + '%';
        }

        // Update metrics with animation
        if (data) {
            // Extract values from the simulation data structure
            const unemploymentRate = data.labor_market?.unemployment_rate || data.unemployment_rate || 0;
            const employment = data.labor_market?.total_employment || data.labor_market?.employment || data.employment || 0;
            const aiAdoption = (data.ai_adoption?.rate || data.ai_adoption || 0) * 100;
            const productivity = data.productivity?.average || data.productivity || 0;

            this.animateMetricUpdate('unemployment_rate', unemploymentRate, v => v.toFixed(1) + '%');
            this.animateMetricUpdate('employment', employment, v => this.formatNumber(v));
            this.animateMetricUpdate('ai_adoption', aiAdoption, v => v.toFixed(0) + '%');
            this.animateMetricUpdate('productivity', productivity, v => v.toFixed(1) + '%');
        }
    }

    /**
     * Animate metric value update
     */
    animateMetricUpdate(key, newValue, formatter) {
        const el = document.getElementById(`metric-${key}`);
        if (!el) return;

        const oldValue = this.animatedMetrics[key] || newValue;
        this.animatedMetrics[key] = newValue;

        // Add animation class
        el.classList.add('timeline-metric-animate');

        // Animate the number change
        const duration = 300;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentValue = oldValue + (newValue - oldValue) * easeProgress;

            el.textContent = formatter(currentValue);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                el.classList.remove('timeline-metric-animate');
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

    /**
     * Get color based on value thresholds
     */
    getMetricColor(value, low, high) {
        if (value <= low) return 'var(--success)';
        if (value >= high) return 'var(--danger)';
        return 'var(--warning)';
    }

    /**
     * Format large numbers
     */
    formatNumber(n) {
        if (n >= 1e12) return (n / 1e12).toFixed(1) + 'T';
        if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
        if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
        if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
        return n.toFixed(0);
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
