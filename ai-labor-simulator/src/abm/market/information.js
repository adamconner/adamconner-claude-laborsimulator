/**
 * InformationDiffusion - Models how information spreads through worker networks
 *
 * Tracks awareness of AI trends, job opportunities, policy changes,
 * and how opinions/behaviors cascade through social networks.
 */

// Information types that diffuse through networks
const InformationType = {
    AI_AWARENESS: 'ai_awareness',           // Knowledge about AI impact
    JOB_OPPORTUNITIES: 'job_opportunities', // Job market information
    RETRAINING_OPTIONS: 'retraining_options', // Training program awareness
    POLICY_NEWS: 'policy_news',             // Policy changes/proposals
    LAYOFF_NEWS: 'layoff_news',             // Layoff announcements
    SUCCESS_STORIES: 'success_stories',     // Positive outcomes from adaptation
    FAILURE_STORIES: 'failure_stories'      // Negative outcomes
};

// Media event types that trigger broad information spread
const MediaEventType = {
    MASS_LAYOFF: 'mass_layoff',
    BREAKTHROUGH: 'ai_breakthrough',
    POLICY_ANNOUNCEMENT: 'policy_announcement',
    STUDY_RELEASE: 'study_release',
    COMPANY_NEWS: 'company_news'
};

class InformationDiffusion {
    constructor(config = {}) {
        // Base diffusion rates
        this.baseSpreadRate = config.baseSpreadRate || 0.05;
        this.networkWeight = config.networkWeight || 0.3;
        this.mediaWeight = config.mediaWeight || 0.2;

        // Information decay (people forget over time)
        this.decayRate = config.decayRate || 0.02;

        // Current global information levels (0-1)
        this.globalAwareness = {
            [InformationType.AI_AWARENESS]: 0.3,
            [InformationType.JOB_OPPORTUNITIES]: 0.5,
            [InformationType.RETRAINING_OPTIONS]: 0.2,
            [InformationType.POLICY_NEWS]: 0.3,
            [InformationType.LAYOFF_NEWS]: 0.2,
            [InformationType.SUCCESS_STORIES]: 0.2,
            [InformationType.FAILURE_STORIES]: 0.1
        };

        // Media event queue
        this.mediaEvents = [];
        this.mediaEventHistory = [];

        // Tracking
        this.diffusionHistory = [];
    }

    /**
     * Process monthly information diffusion
     */
    processMonth(workers, firms, month, marketConditions = {}) {
        const results = {
            month,
            networkDiffusion: 0,
            mediaEvents: [],
            awarenessChanges: {}
        };

        // Generate media events based on market conditions
        this._generateMediaEvents(marketConditions, month);

        // Process any queued media events
        results.mediaEvents = this._processMediaEvents(workers, month);

        // Network-based diffusion
        results.networkDiffusion = this._processNetworkDiffusion(workers);

        // Apply information decay
        this._applyDecay(workers);

        // Update global awareness levels
        this._updateGlobalAwareness(workers);

        // Track changes
        Object.keys(this.globalAwareness).forEach(type => {
            results.awarenessChanges[type] = this.globalAwareness[type];
        });

        // Record history
        this.diffusionHistory.push(results);

        return results;
    }

    _generateMediaEvents(marketConditions, month) {
        const { unemploymentRate, layoffCount, aiAdoptionRate, policyChanges } = marketConditions;

        // Mass layoff event
        if (layoffCount && layoffCount > 5000) {
            this.queueMediaEvent({
                type: MediaEventType.MASS_LAYOFF,
                month,
                magnitude: Math.min(1, layoffCount / 50000),
                affectedIndustry: marketConditions.mostAffectedIndustry,
                description: `Major layoffs: ${layoffCount.toLocaleString()} jobs lost`
            });
        }

        // AI breakthrough (random, more likely with high adoption)
        if (Math.random() < 0.02 * (1 + aiAdoptionRate)) {
            this.queueMediaEvent({
                type: MediaEventType.BREAKTHROUGH,
                month,
                magnitude: 0.3 + Math.random() * 0.4,
                description: 'Major AI capability breakthrough announced'
            });
        }

        // Policy announcements
        if (policyChanges && policyChanges.length > 0) {
            policyChanges.forEach(policy => {
                this.queueMediaEvent({
                    type: MediaEventType.POLICY_ANNOUNCEMENT,
                    month,
                    magnitude: 0.4,
                    policy: policy.type,
                    description: `New ${policy.type} policy announced`
                });
            });
        }

        // Periodic study releases
        if (month % 6 === 0) {
            this.queueMediaEvent({
                type: MediaEventType.STUDY_RELEASE,
                month,
                magnitude: 0.2,
                description: 'New study on AI employment impact released'
            });
        }
    }

    /**
     * Queue a media event for processing
     */
    queueMediaEvent(event) {
        this.mediaEvents.push(event);
    }

    _processMediaEvents(workers, month) {
        const processedEvents = [];

        while (this.mediaEvents.length > 0) {
            const event = this.mediaEvents.shift();
            const affected = this._applyMediaEvent(workers, event);

            processedEvents.push({
                ...event,
                workersAffected: affected
            });

            this.mediaEventHistory.push(event);
        }

        return processedEvents;
    }

    _applyMediaEvent(workers, event) {
        let affectedCount = 0;

        workers.forEach(worker => {
            // Probability of being exposed to news
            const exposureProbability = this._calculateMediaExposure(worker, event);

            if (Math.random() < exposureProbability) {
                this._updateWorkerFromMedia(worker, event);
                affectedCount++;
            }
        });

        return affectedCount;
    }

    _calculateMediaExposure(worker, event) {
        // Base exposure probability
        let exposure = 0.3;

        // Information-aware workers more likely to see news
        exposure += worker.informationLevel * 0.3;

        // Event magnitude increases reach
        exposure *= event.magnitude;

        // Industry-specific events more likely seen by those in industry
        if (event.affectedIndustry && worker.industry === event.affectedIndustry) {
            exposure *= 1.5;
        }

        // Employed vs unemployed (unemployed more attentive to job news)
        if (worker.status === 'unemployed') {
            if ([MediaEventType.MASS_LAYOFF, MediaEventType.POLICY_ANNOUNCEMENT].includes(event.type)) {
                exposure *= 1.3;
            }
        }

        return Math.min(0.9, exposure);
    }

    _updateWorkerFromMedia(worker, event) {
        switch (event.type) {
            case MediaEventType.MASS_LAYOFF:
                // Increase AI awareness and anxiety
                worker.informationLevel = Math.min(1, worker.informationLevel + 0.1 * event.magnitude);
                worker.economicAnxiety = Math.min(1, worker.economicAnxiety + 0.08 * event.magnitude);

                // Shift policy support
                if (worker.policySupport) {
                    worker.policySupport.ubi = Math.min(1, worker.policySupport.ubi + 0.05 * event.magnitude);
                    worker.policySupport.aiRegulation = Math.min(1, worker.policySupport.aiRegulation + 0.04 * event.magnitude);
                }
                break;

            case MediaEventType.BREAKTHROUGH:
                // Increase AI awareness significantly
                worker.informationLevel = Math.min(1, worker.informationLevel + 0.15 * event.magnitude);

                // Mixed effect on anxiety (depends on current situation)
                if (worker.status === 'employed' && worker.aiAugmentationSkill > 0.5) {
                    // Tech-savvy see opportunity
                    worker.economicAnxiety = Math.max(0, worker.economicAnxiety - 0.03);
                } else {
                    // Others see threat
                    worker.economicAnxiety = Math.min(1, worker.economicAnxiety + 0.05 * event.magnitude);
                }
                break;

            case MediaEventType.POLICY_ANNOUNCEMENT:
                // Increase awareness of policy
                worker.informationLevel = Math.min(1, worker.informationLevel + 0.08);

                // Slightly reduce anxiety (help is coming)
                if (worker.economicAnxiety > 0.3) {
                    worker.economicAnxiety = Math.max(0, worker.economicAnxiety - 0.02);
                }

                // Increase trust in government
                worker.trustInGovernment = Math.min(1, worker.trustInGovernment + 0.03);
                break;

            case MediaEventType.STUDY_RELEASE:
                // Modest increase in awareness
                worker.informationLevel = Math.min(1, worker.informationLevel + 0.05);
                break;
        }
    }

    _processNetworkDiffusion(workers) {
        let totalDiffusion = 0;

        workers.forEach(worker => {
            if (!worker.network || worker.network.length === 0) return;

            // Calculate information received from network
            const networkInfo = this._calculateNetworkInformation(worker);

            // Update worker's information level (moves toward network average)
            const infoDiff = networkInfo.averageInfoLevel - worker.informationLevel;
            const infoChange = infoDiff * this.baseSpreadRate * this.networkWeight;
            worker.informationLevel = Math.max(0, Math.min(1, worker.informationLevel + infoChange));

            // Spread job opportunity information
            if (networkInfo.hasJobInfo && worker.status === 'unemployed') {
                worker.jobSearchEffectiveness = Math.min(1,
                    (worker.jobSearchEffectiveness || 0.5) + 0.05
                );
            }

            // Spread anxiety through network
            const anxietyDiff = networkInfo.averageAnxiety - worker.economicAnxiety;
            const anxietyChange = anxietyDiff * this.baseSpreadRate * this.networkWeight * 0.5;
            worker.economicAnxiety = Math.max(0, Math.min(1, worker.economicAnxiety + anxietyChange));

            // Spread retraining awareness
            if (networkInfo.retrainingSuccess) {
                worker.informationLevel = Math.min(1, worker.informationLevel + 0.02);
                if (worker.policySupport) {
                    worker.policySupport.retraining = Math.min(1, worker.policySupport.retraining + 0.02);
                }
            }

            totalDiffusion += Math.abs(infoChange);
        });

        return totalDiffusion;
    }

    _calculateNetworkInformation(worker) {
        const network = worker.network;

        let totalInfoLevel = 0;
        let totalAnxiety = 0;
        let hasJobInfo = false;
        let retrainingSuccess = false;

        network.forEach(contact => {
            const closeness = contact.closeness || 0.5;

            // Information level
            totalInfoLevel += (contact.informationLevel || 0.5) * closeness;

            // Economic anxiety
            totalAnxiety += (contact.economicAnxiety || 0.2) * closeness;

            // Job information (recently employed contacts)
            if (contact.status === 'employed' && contact.tenure < 3) {
                hasJobInfo = true;
            }

            // Retraining success stories
            if (contact.benefitedFromIntervention === 'retraining') {
                retrainingSuccess = true;
            }
        });

        const totalCloseness = network.reduce((sum, c) => sum + (c.closeness || 0.5), 0);

        return {
            averageInfoLevel: totalCloseness > 0 ? totalInfoLevel / totalCloseness : 0.5,
            averageAnxiety: totalCloseness > 0 ? totalAnxiety / totalCloseness : 0.2,
            hasJobInfo,
            retrainingSuccess
        };
    }

    _applyDecay(workers) {
        // Information decays over time (people forget, news becomes stale)
        workers.forEach(worker => {
            // Very slight decay on information level
            if (worker.informationLevel > 0.3) {
                worker.informationLevel = Math.max(0.3,
                    worker.informationLevel - this.decayRate * 0.1
                );
            }

            // Anxiety decays if situation is stable
            if (worker.status === 'employed' && worker.tenure > 6) {
                worker.economicAnxiety = Math.max(0.1,
                    worker.economicAnxiety - this.decayRate * 0.5
                );
            }
        });
    }

    _updateGlobalAwareness(workers) {
        const n = workers.length;
        if (n === 0) return;

        // Calculate average awareness levels
        this.globalAwareness[InformationType.AI_AWARENESS] =
            workers.reduce((sum, w) => sum + (w.informationLevel || 0.3), 0) / n;

        // Job opportunities awareness based on job search activity
        const searchingWorkers = workers.filter(w => w.activelySearching);
        this.globalAwareness[InformationType.JOB_OPPORTUNITIES] =
            searchingWorkers.length > 0
                ? searchingWorkers.reduce((sum, w) => sum + (w.jobSearchEffectiveness || 0.5), 0) / searchingWorkers.length
                : 0.5;

        // Retraining awareness
        const retrainingWorkers = workers.filter(w => w.status === 'retraining' || w.benefitedFromIntervention === 'retraining');
        this.globalAwareness[InformationType.RETRAINING_OPTIONS] =
            Math.min(0.8, 0.2 + (retrainingWorkers.length / n) * 2);
    }

    // ========== Echo Chamber Detection ==========

    /**
     * Detect echo chambers in network (clusters with similar opinions)
     */
    detectEchoChambers(workers) {
        const chambers = [];

        // Sample workers for analysis
        const sampleSize = Math.min(100, workers.length);
        const sampled = workers
            .filter(w => w.network && w.network.length >= 5)
            .sort(() => Math.random() - 0.5)
            .slice(0, sampleSize);

        sampled.forEach(worker => {
            // Calculate opinion similarity with network
            const similarities = worker.network.map(contact => {
                if (!contact.policySupport || !worker.policySupport) return 0.5;

                let similarity = 0;
                let count = 0;

                Object.keys(worker.policySupport).forEach(policy => {
                    if (contact.policySupport[policy] !== undefined) {
                        const diff = Math.abs(worker.policySupport[policy] - contact.policySupport[policy]);
                        similarity += (1 - diff);
                        count++;
                    }
                });

                return count > 0 ? similarity / count : 0.5;
            });

            const avgSimilarity = similarities.reduce((a, b) => a + b, 0) / similarities.length;

            // High similarity (>0.8) indicates echo chamber
            if (avgSimilarity > 0.8) {
                chambers.push({
                    worker: worker.id,
                    similarity: avgSimilarity,
                    networkSize: worker.network.length,
                    dominantView: this._getDominantView(worker)
                });
            }
        });

        return {
            echoChamberCount: chambers.length,
            percentage: (chambers.length / sampleSize * 100).toFixed(1),
            chambers: chambers.slice(0, 10) // Top 10 examples
        };
    }

    _getDominantView(worker) {
        if (!worker.policySupport) return 'neutral';

        const policies = Object.entries(worker.policySupport);
        const strongSupport = policies.filter(([_, v]) => v > 0.7);
        const strongOppose = policies.filter(([_, v]) => v < 0.3);

        if (strongSupport.length > strongOppose.length) {
            return `pro-intervention (${strongSupport.map(p => p[0]).join(', ')})`;
        } else if (strongOppose.length > strongSupport.length) {
            return `anti-intervention`;
        }
        return 'mixed';
    }

    // ========== Cascade Detection ==========

    /**
     * Detect opinion cascades (rapid spread of views)
     */
    detectCascades() {
        if (this.diffusionHistory.length < 2) return [];

        const cascades = [];
        const current = this.diffusionHistory[this.diffusionHistory.length - 1];
        const previous = this.diffusionHistory[this.diffusionHistory.length - 2];

        Object.keys(current.awarenessChanges).forEach(type => {
            const change = current.awarenessChanges[type] - previous.awarenessChanges[type];

            // Significant change (>5%) indicates cascade
            if (Math.abs(change) > 0.05) {
                cascades.push({
                    type,
                    change,
                    direction: change > 0 ? 'increasing' : 'decreasing',
                    magnitude: Math.abs(change),
                    month: current.month
                });
            }
        });

        return cascades;
    }

    // ========== Getters ==========

    getGlobalAwareness() {
        return { ...this.globalAwareness };
    }

    getMediaEventHistory() {
        return [...this.mediaEventHistory];
    }

    getSummary() {
        return {
            globalAwareness: this.getGlobalAwareness(),
            mediaEventsTotal: this.mediaEventHistory.length,
            recentMediaEvents: this.mediaEventHistory.slice(-5),
            monthsProcessed: this.diffusionHistory.length,
            cascadesDetected: this.detectCascades()
        };
    }
}

// Export for ES modules
export { InformationDiffusion, InformationType, MediaEventType };

// Also export to window for backwards compatibility with script tags
if (typeof window !== 'undefined') {
    window.InformationDiffusion = InformationDiffusion;
    window.InformationType = InformationType;
    window.MediaEventType = MediaEventType;
}
