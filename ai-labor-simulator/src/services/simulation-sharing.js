/**
 * Simulation Sharing Service
 * Handles saving, loading, and sharing simulations publicly
 */

class SimulationSharingService {
    constructor() {
        // Use the same Cloudflare Worker endpoint
        this.endpoint = 'https://gemini-proxy.adamconner7.workers.dev';
    }

    /**
     * Save a simulation publicly
     * @param {Object} simulation - The simulation to save
     * @returns {Promise<Object>} - Save result with share URL
     */
    async savePublic(simulation) {
        if (!simulation.results || !simulation.scenario) {
            throw new Error('Invalid simulation: missing results or scenario');
        }

        const response = await fetch(`${this.endpoint}/simulations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: simulation.name || simulation.scenario.name || 'Untitled Simulation',
                description: simulation.description || '',
                scenario: simulation.scenario,
                results: simulation.results,
                summary: simulation.summary || null
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to save simulation');
        }

        return await response.json();
    }

    /**
     * Load a simulation by ID
     * @param {string} id - The simulation ID
     * @returns {Promise<Object>} - The loaded simulation
     */
    async load(id) {
        const response = await fetch(`${this.endpoint}/simulations/${id}`);

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Simulation not found. It may have expired or been deleted.');
            }
            const error = await response.json();
            throw new Error(error.error || 'Failed to load simulation');
        }

        return await response.json();
    }

    /**
     * List recent public simulations
     * @param {number} limit - Max number to return (default 20)
     * @returns {Promise<Object>} - List of simulations
     */
    async listRecent(limit = 20) {
        const response = await fetch(`${this.endpoint}/simulations?limit=${limit}`);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to list simulations');
        }

        return await response.json();
    }

    /**
     * Check if sharing is available
     * @returns {boolean}
     */
    isAvailable() {
        return this.endpoint && this.endpoint.length > 0;
    }

    /**
     * Generate share URL for a simulation
     * @param {string} id - The simulation ID
     * @returns {string} - The share URL
     */
    getShareUrl(id) {
        const baseUrl = window.location.origin + window.location.pathname;
        return `${baseUrl}?sim=${id}`;
    }

    /**
     * Check URL for shared simulation ID
     * @returns {string|null} - The simulation ID if present
     */
    getSharedIdFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get('sim');
    }

    /**
     * Copy share URL to clipboard
     * @param {string} id - The simulation ID
     * @returns {Promise<boolean>} - Success status
     */
    async copyShareUrl(id) {
        const url = this.getShareUrl(id);
        try {
            await navigator.clipboard.writeText(url);
            return true;
        } catch {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = url;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return true;
        }
    }
}

// Global instance
const simulationSharing = new SimulationSharingService();
