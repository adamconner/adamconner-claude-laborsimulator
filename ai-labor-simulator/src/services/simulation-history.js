/**
 * Simulation History Service
 * Tracks and manages past simulation runs in localStorage
 */

class SimulationHistoryService {
    constructor() {
        this.storageKey = 'simulation_history';
        this.maxHistory = 20; // Keep last 20 simulations
    }

    /**
     * Get all saved simulations
     * @returns {Array} List of saved simulations
     */
    getAll() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Error reading simulation history:', e);
            return [];
        }
    }

    /**
     * Save a simulation to history
     * @param {Object} simulation - The simulation to save
     */
    save(simulation) {
        if (!simulation || !simulation.scenario || !simulation.results) {
            return;
        }

        const history = this.getAll();

        // Create a summary for the history entry
        const entry = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            name: simulation.scenario.name || 'Unnamed Scenario',
            summary: {
                timeframe: `${simulation.scenario.timeframe.start_year}-${simulation.scenario.timeframe.end_year}`,
                targetUnemployment: simulation.scenario.targets.unemployment_rate,
                aiAdoption: simulation.scenario.targets.ai_adoption_rate,
                adoptionCurve: simulation.scenario.ai_parameters.adoption_curve,
                interventions: simulation.scenario.interventions?.length || 0,
                finalUnemployment: simulation.summary?.labor_market_changes?.unemployment?.final,
                jobsDisplaced: simulation.summary?.labor_market_changes?.cumulative_displacement,
                jobsCreated: simulation.summary?.labor_market_changes?.cumulative_new_jobs
            },
            // Store full data for loading
            scenario: simulation.scenario,
            results: simulation.results,
            summaryData: simulation.summary
        };

        // Add to front
        history.unshift(entry);

        // Trim to max
        const trimmed = history.slice(0, this.maxHistory);

        try {
            localStorage.setItem(this.storageKey, JSON.stringify(trimmed));
        } catch (e) {
            console.error('Error saving simulation history:', e);
            // If storage is full, try removing oldest entries
            if (e.name === 'QuotaExceededError') {
                const smaller = trimmed.slice(0, Math.floor(this.maxHistory / 2));
                localStorage.setItem(this.storageKey, JSON.stringify(smaller));
            }
        }

        return entry;
    }

    /**
     * Get a specific simulation by ID
     * @param {number} id - The simulation ID
     * @returns {Object|null} The simulation or null if not found
     */
    get(id) {
        const history = this.getAll();
        return history.find(h => h.id === id) || null;
    }

    /**
     * Delete a simulation from history
     * @param {number} id - The simulation ID to delete
     */
    delete(id) {
        const history = this.getAll();
        const filtered = history.filter(h => h.id !== id);
        localStorage.setItem(this.storageKey, JSON.stringify(filtered));
    }

    /**
     * Clear all history
     */
    clearAll() {
        localStorage.removeItem(this.storageKey);
    }

    /**
     * Get history count
     * @returns {number}
     */
    getCount() {
        return this.getAll().length;
    }

    /**
     * Format timestamp for display
     * @param {string} timestamp - ISO timestamp
     * @returns {string} Formatted date/time
     */
    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;

        // Less than 1 hour ago
        if (diff < 3600000) {
            const mins = Math.floor(diff / 60000);
            return mins <= 1 ? 'Just now' : `${mins} minutes ago`;
        }

        // Less than 24 hours ago
        if (diff < 86400000) {
            const hours = Math.floor(diff / 3600000);
            return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
        }

        // Less than 7 days ago
        if (diff < 604800000) {
            const days = Math.floor(diff / 86400000);
            return days === 1 ? 'Yesterday' : `${days} days ago`;
        }

        // Otherwise show date
        return date.toLocaleDateString();
    }

    /**
     * Format number for display
     * @param {number} n - Number to format
     * @returns {string}
     */
    formatNumber(n) {
        if (n === undefined || n === null) return 'N/A';
        if (Math.abs(n) >= 1000000) return (n / 1000000).toFixed(1) + 'M';
        if (Math.abs(n) >= 1000) return (n / 1000).toFixed(1) + 'K';
        return n.toFixed(1);
    }
}

// Global instance
const simulationHistory = new SimulationHistoryService();
