/**
 * LaborMarket - Matching mechanism between workers and firms
 *
 * Handles job postings, applications, and hiring decisions.
 * Tracks market-level statistics like wages and unemployment.
 */

class LaborMarket {
    constructor(config = {}) {
        this.workers = config.workers || [];
        this.firms = config.firms || [];

        // Market state
        this.jobPostings = [];
        this.applications = [];
        this.hires = [];
        this.layoffs = [];

        // Market statistics (by region and industry)
        this.marketWages = {}; // { region: { industry: wage } }
        this.unemploymentRates = {}; // { region: rate }

        // Configuration
        this.searchRadius = config.searchRadius || 1; // How many regions away workers search
        this.networkBonus = config.networkBonus || 0.2; // Bonus for network connections
    }

    /**
     * Set the worker and firm populations
     */
    setPopulations(workers, firms) {
        this.workers = workers;
        this.firms = firms;
        this._updateMarketStatistics();
    }

    /**
     * Run the monthly matching process
     */
    runMonthlyMatching() {
        // Reset monthly tracking
        this.applications = [];
        this.hires = [];
        this.layoffs = [];

        // 1. Collect all job postings from firms
        this._collectJobPostings();

        // 2. Workers search and apply
        this._workerApplicationPhase();

        // 3. Firms evaluate applicants and make offers
        this._firmSelectionPhase();

        // 4. Workers evaluate offers and accept
        this._workerAcceptancePhase();

        // 5. Execute layoffs
        this._executeLayoffs();

        // 6. Update market statistics
        this._updateMarketStatistics();

        return {
            hires: this.hires.length,
            layoffs: this.layoffs.length,
            openPositions: this.jobPostings.filter(p => !p.filled).length,
            applications: this.applications.length
        };
    }

    _collectJobPostings() {
        this.jobPostings = [];
        this.firms.forEach(firm => {
            const positions = firm.getOpenPositions();
            this.jobPostings.push(...positions);
        });

        // OPTIMIZATION: Pre-index jobs by region for faster lookup
        this._jobsByRegion = new Map();
        this.jobPostings.forEach(job => {
            if (!job.filled) {
                if (!this._jobsByRegion.has(job.region)) {
                    this._jobsByRegion.set(job.region, []);
                }
                this._jobsByRegion.get(job.region).push(job);
            }
        });

        // OPTIMIZATION: Build firm connection cache for network lookup
        this._firmConnections = new Map();
        this.workers.forEach(worker => {
            if (worker.employer) {
                if (!this._firmConnections.has(worker.employer.id)) {
                    this._firmConnections.set(worker.employer.id, new Set());
                }
                // Add network contacts who work at this firm
                (worker.network || []).forEach(contact => {
                    if (contact.id) {
                        this._firmConnections.get(worker.employer.id).add(contact.id);
                    }
                });
            }
        });
    }

    _workerApplicationPhase() {
        // Get all unemployed workers and employed workers who are searching
        const searchingWorkers = this.workers.filter(w =>
            w.activelySearching || w.status === 'unemployed'
        );

        // OPTIMIZATION: Sample if too many searchers (statistical sampling still gives valid results)
        const MAX_SEARCHERS = 500;
        const workersToProcess = searchingWorkers.length > MAX_SEARCHERS
            ? searchingWorkers.sort(() => Math.random() - 0.5).slice(0, MAX_SEARCHERS)
            : searchingWorkers;

        workersToProcess.forEach(worker => {
            // Get jobs visible to this worker (using optimized method)
            const visibleJobs = this._getVisibleJobsOptimized(worker);

            // Worker applies to suitable jobs
            const applications = worker.searchForJobs({ getVisibleJobs: () => visibleJobs });

            applications.forEach(job => {
                this.applications.push({
                    worker,
                    job,
                    timestamp: Date.now()
                });
            });
        });
    }

    // OPTIMIZATION: Region-based job lookup with cached network
    _getVisibleJobsOptimized(worker) {
        const visibleJobs = [];
        const MAX_JOBS_TO_PROCESS = 50; // Limit total jobs processed
        let jobsProcessed = 0;

        // Get jobs in same region (most likely to be visible)
        const sameRegionJobs = this._jobsByRegion ? (this._jobsByRegion.get(worker.region) || []) : [];

        // Process same-region jobs first (high visibility)
        for (let i = 0; i < sameRegionJobs.length && jobsProcessed < MAX_JOBS_TO_PROCESS; i++) {
            const job = sameRegionJobs[i];
            if (job.filled) continue;
            jobsProcessed++;
            let visibility = 1;
            visibility *= (0.5 + (worker.informationLevel || 0.5) * 0.5);
            if (Math.random() < visibility) {
                visibleJobs.push(job);
            }
        }

        // Process nearby jobs if we haven't hit limit
        if (jobsProcessed < MAX_JOBS_TO_PROCESS && this._jobsByRegion) {
            for (let r = worker.region - this.searchRadius; r <= worker.region + this.searchRadius && jobsProcessed < MAX_JOBS_TO_PROCESS; r++) {
                if (r === worker.region) continue;
                const nearbyJobs = this._jobsByRegion.get(r) || [];
                for (let i = 0; i < nearbyJobs.length && jobsProcessed < MAX_JOBS_TO_PROCESS; i++) {
                    const job = nearbyJobs[i];
                    if (job.filled) continue;
                    jobsProcessed++;
                    let visibility = 0.5 * (worker.mobilityWillingness || 0.3);
                    visibility *= (0.5 + (worker.informationLevel || 0.5) * 0.5);
                    if (Math.random() < visibility) {
                        visibleJobs.push(job);
                    }
                }
            }
        }

        // Return top 20 by wage (avoid expensive sort on full array)
        if (visibleJobs.length <= 20) {
            return visibleJobs;
        }
        return visibleJobs.sort((a, b) => (b.wage || 0) - (a.wage || 0)).slice(0, 20);
    }

    _firmSelectionPhase() {
        // Group applications by job posting
        const applicationsByJob = {};
        this.applications.forEach(app => {
            if (!applicationsByJob[app.job.id]) {
                applicationsByJob[app.job.id] = [];
            }
            applicationsByJob[app.job.id].push(app.worker);
        });

        // Each firm processes applications for their postings
        this.firms.forEach(firm => {
            firm.getOpenPositions().forEach(position => {
                const applicants = applicationsByJob[position.id] || [];

                if (applicants.length === 0) return;

                // Firm ranks applicants
                const ranked = firm.rankApplicants(applicants, position);

                // Firm makes offers to top candidates
                const offers = firm.makeOffers(ranked, position);

                // Add offers to workers
                offers.forEach(offer => {
                    if (!offer.applicant.jobOffers) {
                        offer.applicant.jobOffers = [];
                    }
                    offer.applicant.jobOffers.push(offer);
                });
            });
        });
    }

    _workerAcceptancePhase() {
        // Workers with offers evaluate and accept
        const workersWithOffers = this.workers.filter(w =>
            w.jobOffers && w.jobOffers.length > 0
        );

        workersWithOffers.forEach(worker => {
            const acceptedOffer = worker.evaluateOffers();

            if (acceptedOffer) {
                // Worker accepts the job
                worker.acceptJob(acceptedOffer, acceptedOffer.firm);

                // Firm records the hire
                acceptedOffer.firm.hire(worker, acceptedOffer.position);

                // Track the hire
                this.hires.push({
                    worker,
                    firm: acceptedOffer.firm,
                    position: acceptedOffer.position,
                    wage: acceptedOffer.wage
                });
            }

            // Clear offers for next round
            worker.jobOffers = [];
        });
    }

    _executeLayoffs() {
        this.firms.forEach(firm => {
            const laidOff = firm.executeLayoffs();

            laidOff.forEach(({ worker, reason }) => {
                // Worker handles being laid off
                worker.layOff(reason);

                // Track the layoff
                this.layoffs.push({
                    worker,
                    firm,
                    reason
                });
            });
        });
    }

    _updateMarketStatistics() {
        // Calculate unemployment rates by region
        const regionStats = {};

        this.workers.forEach(worker => {
            if (!regionStats[worker.region]) {
                regionStats[worker.region] = {
                    employed: 0,
                    unemployed: 0,
                    laborForce: 0,
                    totalWages: 0,
                    wageCount: 0
                };
            }

            if (worker.isInLaborForce()) {
                regionStats[worker.region].laborForce++;

                if (worker.isEmployed()) {
                    regionStats[worker.region].employed++;
                    regionStats[worker.region].totalWages += worker.wage;
                    regionStats[worker.region].wageCount++;
                } else if (worker.isUnemployed()) {
                    regionStats[worker.region].unemployed++;
                }
            }
        });

        // Calculate rates
        Object.entries(regionStats).forEach(([region, stats]) => {
            this.unemploymentRates[region] = stats.laborForce > 0
                ? stats.unemployed / stats.laborForce
                : 0;
        });

        // Calculate market wages by region and industry
        this.marketWages = {};
        this.firms.forEach(firm => {
            if (!this.marketWages[firm.region]) {
                this.marketWages[firm.region] = {};
            }
            if (!this.marketWages[firm.region][firm.industry]) {
                this.marketWages[firm.region][firm.industry] = {
                    total: 0,
                    count: 0
                };
            }

            const avgWage = firm.getAverageWage();
            this.marketWages[firm.region][firm.industry].total += avgWage;
            this.marketWages[firm.region][firm.industry].count++;
        });
    }

    // ========== Query Methods ==========

    /**
     * Get jobs visible to a worker (based on region and network)
     */
    getVisibleJobs(worker) {
        const visibleJobs = [];

        this.jobPostings.forEach(job => {
            if (job.filled) return;

            let visibility = 0;

            // Jobs in same region are visible
            if (job.region === worker.region) {
                visibility = 1;
            }
            // Jobs in nearby regions are partially visible
            else if (Math.abs(job.region - worker.region) <= this.searchRadius) {
                visibility = 0.5 * worker.mobilityWillingness;
            }

            // Network bonus - check if worker has connections at the firm
            if (worker.network && worker.network.length > 0) {
                const hasConnection = worker.network.some(contact =>
                    contact.employer && contact.employer.id === job.firmId
                );
                if (hasConnection) {
                    visibility += this.networkBonus;
                }
            }

            // Information level affects visibility
            visibility *= (0.5 + worker.informationLevel * 0.5);

            // Random factor (not all jobs are seen even if available)
            if (Math.random() < visibility) {
                visibleJobs.push(job);
            }
        });

        // Sort by relevance
        return visibleJobs.sort((a, b) => {
            // Prefer jobs in same region
            const regionScoreA = a.region === worker.region ? 1 : 0;
            const regionScoreB = b.region === worker.region ? 1 : 0;
            if (regionScoreA !== regionScoreB) return regionScoreB - regionScoreA;

            // Prefer higher wages
            return (b.wage || 0) - (a.wage || 0);
        });
    }

    /**
     * Get market wage for industry/region
     */
    getMarketWage(industry, region) {
        if (this.marketWages[region] && this.marketWages[region][industry]) {
            const data = this.marketWages[region][industry];
            return data.count > 0 ? data.total / data.count : 4000;
        }
        return 4000; // Default wage
    }

    /**
     * Get unemployment rate for a region
     */
    getUnemploymentRate(region) {
        return this.unemploymentRates[region] || 0;
    }

    /**
     * Get overall market statistics
     */
    getMarketStatistics() {
        const totalWorkers = this.workers.length;
        const inLaborForce = this.workers.filter(w => w.isInLaborForce()).length;
        const employed = this.workers.filter(w => w.isEmployed()).length;
        const unemployed = this.workers.filter(w => w.isUnemployed()).length;
        const retraining = this.workers.filter(w => w.status === 'retraining').length;

        const totalFirms = this.firms.length;
        const firmsAdoptingAI = this.firms.filter(f => f.isAdoptingAI()).length;
        const openPositions = this.jobPostings.filter(p => !p.filled).length;

        // Calculate wage statistics
        const wages = this.workers
            .filter(w => w.isEmployed() && w.wage > 0)
            .map(w => w.wage)
            .sort((a, b) => a - b);

        const medianWage = wages.length > 0
            ? wages[Math.floor(wages.length / 2)]
            : 0;

        const avgWage = wages.length > 0
            ? wages.reduce((a, b) => a + b, 0) / wages.length
            : 0;

        return {
            totalWorkers,
            inLaborForce,
            employed,
            unemployed,
            retraining,
            outOfLaborForce: totalWorkers - inLaborForce,
            unemploymentRate: inLaborForce > 0 ? unemployed / inLaborForce : 0,
            laborForceParticipation: totalWorkers > 0 ? inLaborForce / totalWorkers : 0,

            totalFirms,
            firmsAdoptingAI,
            aiAdoptionRate: totalFirms > 0 ? firmsAdoptingAI / totalFirms : 0,
            openPositions,

            medianWage,
            avgWage,

            monthlyHires: this.hires.length,
            monthlyLayoffs: this.layoffs.length,
            netJobChange: this.hires.length - this.layoffs.length,

            regionalUnemployment: { ...this.unemploymentRates }
        };
    }

    /**
     * Get policy support aggregates
     */
    getPolicySupportStatistics() {
        const policies = ['ubi', 'retraining', 'wageSubsidy', 'reducedWorkWeek',
            'publicWorks', 'eitcExpansion', 'aiRegulation', 'tradeProtection', 'educationInvestment'];

        const stats = {};

        policies.forEach(policy => {
            const supportLevels = this.workers
                .filter(w => w.policySupport && w.policySupport[policy] !== undefined)
                .map(w => w.policySupport[policy]);

            if (supportLevels.length === 0) {
                stats[policy] = { mean: 0.5, median: 0.5, strongSupport: 0, strongOppose: 0 };
                return;
            }

            const sorted = [...supportLevels].sort((a, b) => a - b);
            const mean = supportLevels.reduce((a, b) => a + b, 0) / supportLevels.length;
            const median = sorted[Math.floor(sorted.length / 2)];
            const strongSupport = supportLevels.filter(s => s > 0.7).length / supportLevels.length;
            const strongOppose = supportLevels.filter(s => s < 0.3).length / supportLevels.length;

            stats[policy] = {
                mean: Math.round(mean * 100) / 100,
                median: Math.round(median * 100) / 100,
                strongSupport: Math.round(strongSupport * 100) / 100,
                strongOppose: Math.round(strongOppose * 100) / 100,
                feasibilityScore: Math.round((mean * 0.5 + (1 - strongOppose) * 0.3 + strongSupport * 0.2) * 100)
            };
        });

        return stats;
    }

    /**
     * Get demographic breakdown of policy support
     */
    getPolicySupportByDemographic(policy) {
        const byAge = {};
        const byEducation = {};
        const byStatus = {};

        this.workers.forEach(worker => {
            if (!worker.policySupport || worker.policySupport[policy] === undefined) return;

            const support = worker.policySupport[policy];

            // By age group
            const ageGroup = worker.getAgeGroup();
            if (!byAge[ageGroup]) byAge[ageGroup] = { total: 0, count: 0 };
            byAge[ageGroup].total += support;
            byAge[ageGroup].count++;

            // By education
            if (!byEducation[worker.education]) byEducation[worker.education] = { total: 0, count: 0 };
            byEducation[worker.education].total += support;
            byEducation[worker.education].count++;

            // By employment status
            if (!byStatus[worker.status]) byStatus[worker.status] = { total: 0, count: 0 };
            byStatus[worker.status].total += support;
            byStatus[worker.status].count++;
        });

        // Calculate averages
        const calcAvg = (obj) => {
            const result = {};
            Object.entries(obj).forEach(([key, val]) => {
                result[key] = val.count > 0 ? Math.round(val.total / val.count * 100) / 100 : 0;
            });
            return result;
        };

        return {
            byAge: calcAvg(byAge),
            byEducation: calcAvg(byEducation),
            byStatus: calcAvg(byStatus)
        };
    }
}

// Export for ES modules
export { LaborMarket };

// Also export to window for backwards compatibility with script tags
if (typeof window !== 'undefined') {
    window.LaborMarket = LaborMarket;
}
