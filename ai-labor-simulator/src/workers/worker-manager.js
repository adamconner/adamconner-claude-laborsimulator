/**
 * WorkerManager - Manages Web Worker for ABM simulation
 *
 * Provides a clean async interface to the simulation worker,
 * handling initialization, communication, and result collection.
 */

class WorkerManager {
    constructor() {
        this.worker = null;
        this.isInitialized = false;
        this.pendingRequests = new Map();
        this.requestId = 0;
        this.onProgress = null;
        this.onComplete = null;
    }

    /**
     * Check if Web Workers are supported
     */
    static isSupported() {
        return typeof Worker !== 'undefined';
    }

    /**
     * Initialize the worker
     */
    async initialize(config = {}, scenario = {}) {
        if (!WorkerManager.isSupported()) {
            throw new Error('Web Workers are not supported in this browser');
        }

        // Terminate existing worker if any
        if (this.worker) {
            this.terminate();
        }

        return new Promise((resolve, reject) => {
            try {
                // Create the worker
                this.worker = new Worker('src/workers/simulation-worker.js');

                // Setup message handler
                this.worker.onmessage = (e) => this._handleMessage(e);

                // Setup error handler
                this.worker.onerror = (e) => {
                    console.error('Worker error:', e);
                    reject(new Error(e.message));
                };

                // Send init message
                const requestId = this._getRequestId();
                this.pendingRequests.set(requestId, { resolve, reject });

                this.worker.postMessage({
                    type: 'init',
                    requestId,
                    payload: { config, scenario }
                });

            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Run a single month of simulation
     */
    async runMonth(month, scenario = {}) {
        if (!this.isInitialized) {
            throw new Error('Worker not initialized');
        }

        return new Promise((resolve, reject) => {
            const requestId = this._getRequestId();
            this.pendingRequests.set(requestId, { resolve, reject });

            this.worker.postMessage({
                type: 'runMonth',
                requestId,
                payload: { month, scenario }
            });
        });
    }

    /**
     * Run the full simulation
     */
    async runSimulation(scenario = {}) {
        if (!this.isInitialized) {
            throw new Error('Worker not initialized');
        }

        return new Promise((resolve, reject) => {
            const requestId = this._getRequestId();
            this.pendingRequests.set(requestId, {
                resolve,
                reject,
                isSimulation: true
            });

            this.worker.postMessage({
                type: 'runSimulation',
                requestId,
                payload: { scenario }
            });
        });
    }

    /**
     * Get current worker state
     */
    async getState() {
        if (!this.worker) {
            return { isInitialized: false };
        }

        return new Promise((resolve, reject) => {
            const requestId = this._getRequestId();
            this.pendingRequests.set(requestId, { resolve, reject });

            this.worker.postMessage({
                type: 'getState',
                requestId
            });
        });
    }

    /**
     * Set progress callback
     */
    setProgressCallback(callback) {
        this.onProgress = callback;
    }

    /**
     * Set completion callback
     */
    setCompletionCallback(callback) {
        this.onComplete = callback;
    }

    /**
     * Terminate the worker
     */
    terminate() {
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }
        this.isInitialized = false;
        this.pendingRequests.clear();
    }

    /**
     * Handle messages from worker
     */
    _handleMessage(e) {
        const { type, requestId, payload, error } = e.data;

        switch (type) {
            case 'initComplete':
                this.isInitialized = true;
                this._resolveRequest(requestId, payload);
                break;

            case 'monthComplete':
                this._resolveRequest(requestId, payload);
                break;

            case 'simulationComplete':
                if (this.onComplete) {
                    this.onComplete(payload);
                }
                this._resolveRequest(requestId, payload);
                break;

            case 'progress':
                if (this.onProgress) {
                    this.onProgress(payload);
                }
                // Don't resolve - simulation still running
                break;

            case 'state':
                this._resolveRequest(requestId, payload);
                break;

            case 'chunkComplete':
                this._resolveRequest(requestId, payload);
                break;

            case 'error':
                this._rejectRequest(requestId, new Error(error));
                break;

            default:
                console.warn('Unknown message type from worker:', type);
        }
    }

    /**
     * Get a unique request ID
     */
    _getRequestId() {
        return `req_${++this.requestId}`;
    }

    /**
     * Resolve a pending request
     */
    _resolveRequest(requestId, payload) {
        const request = this.pendingRequests.get(requestId);
        if (request) {
            this.pendingRequests.delete(requestId);
            request.resolve(payload);
        }
    }

    /**
     * Reject a pending request
     */
    _rejectRequest(requestId, error) {
        const request = this.pendingRequests.get(requestId);
        if (request) {
            this.pendingRequests.delete(requestId);
            request.reject(error);
        }
    }
}

/**
 * ParallelSimulationManager - Coordinates multiple workers for large simulations
 *
 * Splits agent processing across multiple Web Workers for better performance
 * on multi-core systems.
 */
class ParallelSimulationManager {
    constructor(numWorkers = navigator.hardwareConcurrency || 4) {
        this.numWorkers = numWorkers;
        this.workers = [];
        this.isInitialized = false;
    }

    /**
     * Initialize parallel workers
     */
    async initialize(config = {}, scenario = {}) {
        if (!WorkerManager.isSupported()) {
            throw new Error('Web Workers are not supported');
        }

        // For now, use single worker (full parallel implementation would
        // require splitting agent data across workers)
        const manager = new WorkerManager();
        await manager.initialize(config, scenario);

        this.workers = [manager];
        this.isInitialized = true;

        return {
            workerCount: this.workers.length,
            ready: true
        };
    }

    /**
     * Run simulation with optional parallelization
     */
    async runSimulation(scenario = {}, callbacks = {}) {
        if (!this.isInitialized || this.workers.length === 0) {
            throw new Error('Workers not initialized');
        }

        const mainWorker = this.workers[0];

        if (callbacks.onProgress) {
            mainWorker.setProgressCallback(callbacks.onProgress);
        }

        if (callbacks.onComplete) {
            mainWorker.setCompletionCallback(callbacks.onComplete);
        }

        return mainWorker.runSimulation(scenario);
    }

    /**
     * Terminate all workers
     */
    terminate() {
        for (const worker of this.workers) {
            worker.terminate();
        }
        this.workers = [];
        this.isInitialized = false;
    }
}

// Export for ES modules
export { WorkerManager, ParallelSimulationManager };

// Also export to window for backwards compatibility with script tags
if (typeof window !== 'undefined') {
    window.WorkerManager = WorkerManager;
    window.ParallelSimulationManager = ParallelSimulationManager;
}
