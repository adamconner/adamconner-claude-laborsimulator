/**
 * WageDynamics - Wage determination and adjustment mechanisms
 *
 * Models how wages evolve based on supply/demand, productivity,
 * AI impact, and market conditions.
 */

class WageDynamics {
    constructor(config = {}) {
        // Base national wage parameters
        this.nationalMedianWage = config.nationalMedianWage || 4500; // Monthly
        this.nationalMeanWage = config.nationalMeanWage || 5200;
        this.minimumWage = config.minimumWage || 1260; // ~$7.25/hr * 173 hrs

        // Wage adjustment speeds
        this.upwardStickiness = config.upwardStickiness || 0.02; // Slow to rise
        this.downwardStickiness = config.downwardStickiness || 0.01; // Even slower to fall

        // Market parameters
        this.supplyElasticity = config.supplyElasticity || 0.3;
        this.demandElasticity = config.demandElasticity || 0.4;

        // AI impact parameters
        this.aiWagePremium = config.aiWagePremium || 0.15; // Premium for AI skills
        this.automationWageDiscount = config.automationWageDiscount || 0.10; // Reduction for automatable roles

        // Tracking
        this.wageHistory = [];
        this.industryWages = {};
        this.regionWages = {};
        this.skillPremiums = {};
    }

    /**
     * Calculate market-clearing wage for a job
     */
    calculateJobWage(job, market, region) {
        let wage = this.nationalMedianWage;

        // Industry adjustment
        const industryMultiplier = this._getIndustryMultiplier(job.industry);
        wage *= industryMultiplier;

        // Regional cost of living adjustment
        if (region?.costOfLiving) {
            wage *= region.costOfLiving;
        }

        // Skill requirements
        if (job.requiredSkills) {
            const skillPremium = this._calculateSkillPremium(job.requiredSkills);
            wage *= (1 + skillPremium);
        }

        // Education requirements
        const eduMultiplier = this._getEducationMultiplier(job.requiredEducation);
        wage *= eduMultiplier;

        // AI-related adjustments
        if (job.aiAugmentation) {
            wage *= (1 + this.aiWagePremium * job.aiAugmentation);
        }

        // Automation exposure discount
        if (job.automationExposure) {
            wage *= (1 - this.automationWageDiscount * job.automationExposure);
        }

        // Market tightness adjustment
        const tightness = this._calculateMarketTightness(market, job);
        wage *= (1 + tightness * 0.1);

        // Apply minimum wage floor
        wage = Math.max(wage, this.minimumWage);

        return Math.round(wage);
    }

    /**
     * Adjust wages based on market conditions
     */
    adjustMarketWages(workers, firms, laborMarket) {
        const adjustments = {
            byIndustry: {},
            byRegion: {},
            bySkill: {},
            overall: 0
        };

        // Calculate overall supply/demand ratio
        const laborSupply = workers.filter(w =>
            w.status === 'unemployed' || w.activelySearching
        ).length;
        const laborDemand = firms.reduce((sum, f) =>
            sum + (f.openPositions?.length || 0), 0
        );

        const supplyDemandRatio = laborDemand > 0
            ? laborSupply / laborDemand
            : 2.0; // High ratio means loose labor market

        // Determine wage pressure
        let wagePressure = 0;
        if (supplyDemandRatio < 1.0) {
            // Tight labor market - upward pressure
            wagePressure = (1 - supplyDemandRatio) * this.upwardStickiness;
        } else if (supplyDemandRatio > 1.5) {
            // Loose labor market - downward pressure
            wagePressure = -(supplyDemandRatio - 1.5) * this.downwardStickiness;
        }

        adjustments.overall = wagePressure;

        // Calculate industry-specific adjustments
        this._calculateIndustryWageAdjustments(workers, firms, adjustments);

        // Calculate region-specific adjustments
        this._calculateRegionWageAdjustments(workers, firms, adjustments);

        // Calculate skill premium adjustments
        this._calculateSkillPremiumAdjustments(workers, firms, adjustments);

        // Apply adjustments to employed workers
        this._applyWageAdjustments(workers, adjustments);

        // Record history
        this.wageHistory.push({
            month: this.wageHistory.length,
            medianWage: this._calculateMedianWage(workers),
            meanWage: this._calculateMeanWage(workers),
            adjustments: { ...adjustments }
        });

        return adjustments;
    }

    _calculateIndustryWageAdjustments(workers, firms, adjustments) {
        // Group by industry
        const industries = {};

        workers.filter(w => w.status === 'employed').forEach(worker => {
            const ind = worker.industry;
            if (!industries[ind]) {
                industries[ind] = { employed: 0, totalWage: 0 };
            }
            industries[ind].employed++;
            industries[ind].totalWage += worker.wage;
        });

        firms.forEach(firm => {
            const ind = firm.industry;
            if (!industries[ind]) {
                industries[ind] = { employed: 0, totalWage: 0, openings: 0 };
            }
            industries[ind].openings = (industries[ind].openings || 0) +
                (firm.openPositions?.length || 0);
        });

        // Calculate adjustment for each industry
        Object.keys(industries).forEach(industry => {
            const data = industries[industry];
            const avgWage = data.employed > 0 ? data.totalWage / data.employed : this.nationalMedianWage;

            // Vacancy rate affects wages
            const vacancyRate = data.openings / Math.max(1, data.employed);

            let adjustment = 0;
            if (vacancyRate > 0.1) {
                // High vacancies - wage pressure up
                adjustment = Math.min(0.05, (vacancyRate - 0.1) * this.upwardStickiness);
            } else if (vacancyRate < 0.02) {
                // Low vacancies - wage pressure down
                adjustment = Math.max(-0.02, (vacancyRate - 0.02) * this.downwardStickiness);
            }

            adjustments.byIndustry[industry] = adjustment;
            this.industryWages[industry] = avgWage * (1 + adjustment);
        });
    }

    _calculateRegionWageAdjustments(workers, firms, adjustments) {
        // Group by region
        const regions = {};

        workers.forEach(worker => {
            const region = worker.region;
            if (!regions[region]) {
                regions[region] = {
                    employed: 0,
                    unemployed: 0,
                    totalWage: 0
                };
            }

            if (worker.status === 'employed') {
                regions[region].employed++;
                regions[region].totalWage += worker.wage;
            } else if (worker.status === 'unemployed') {
                regions[region].unemployed++;
            }
        });

        // Calculate regional adjustments
        Object.keys(regions).forEach(region => {
            const data = regions[region];
            const localUR = data.employed + data.unemployed > 0
                ? data.unemployed / (data.employed + data.unemployed)
                : 0.05;

            let adjustment = 0;
            if (localUR < 0.04) {
                // Very tight local market
                adjustment = (0.04 - localUR) * this.upwardStickiness * 2;
            } else if (localUR > 0.08) {
                // Loose local market
                adjustment = -(localUR - 0.08) * this.downwardStickiness * 2;
            }

            adjustments.byRegion[region] = adjustment;
            this.regionWages[region] = data.employed > 0
                ? (data.totalWage / data.employed) * (1 + adjustment)
                : this.nationalMedianWage;
        });
    }

    _calculateSkillPremiumAdjustments(workers, firms, adjustments) {
        const skills = [
            'programming', 'dataAnalysis', 'aiAugmentationSkill',
            'technical', 'leadership', 'healthcare'
        ];

        skills.forEach(skill => {
            // Count workers with high skill level
            const skilledWorkers = workers.filter(w => {
                if (skill === 'aiAugmentationSkill') {
                    return w.aiAugmentationSkill > 0.6;
                }
                return w.skills?.[skill] > 0.6;
            });

            const totalWorkers = workers.length;
            const skillShare = skilledWorkers.length / Math.max(1, totalWorkers);

            // Scarcity drives premiums
            let premium = 0;
            if (skillShare < 0.1) {
                premium = 0.2; // High premium for scarce skills
            } else if (skillShare < 0.2) {
                premium = 0.1;
            } else if (skillShare < 0.3) {
                premium = 0.05;
            }

            // AI-related skills get extra premium in high AI adoption environments
            if (['programming', 'dataAnalysis', 'aiAugmentationSkill'].includes(skill)) {
                premium *= 1.2;
            }

            adjustments.bySkill[skill] = premium;
            this.skillPremiums[skill] = premium;
        });
    }

    _applyWageAdjustments(workers, adjustments) {
        workers.filter(w => w.status === 'employed').forEach(worker => {
            let totalAdjustment = adjustments.overall;

            // Add industry adjustment
            if (adjustments.byIndustry[worker.industry]) {
                totalAdjustment += adjustments.byIndustry[worker.industry];
            }

            // Add regional adjustment
            if (adjustments.byRegion[worker.region]) {
                totalAdjustment += adjustments.byRegion[worker.region];
            }

            // Limit adjustment magnitude per month
            totalAdjustment = Math.max(-0.02, Math.min(0.05, totalAdjustment));

            // Apply adjustment
            if (totalAdjustment !== 0) {
                worker.wage = Math.round(worker.wage * (1 + totalAdjustment));
                worker.wage = Math.max(this.minimumWage, worker.wage);
            }
        });
    }

    // ========== Helper Methods ==========

    _getIndustryMultiplier(industry) {
        const multipliers = {
            1: 1.40,  // Technology
            2: 1.20,  // Healthcare
            3: 1.35,  // Finance
            4: 0.75,  // Retail
            5: 1.00,  // Manufacturing
            6: 0.90,  // Transportation
            7: 0.95,  // Education
            8: 1.05,  // Government
            9: 1.00,  // Construction
            10: 1.25, // Professional Services
            11: 0.70, // Hospitality
            12: 0.80, // Agriculture
            13: 1.15, // Energy
            14: 1.10, // Media
            15: 1.05, // Real Estate
            16: 1.10, // Utilities
            17: 1.15, // Telecom
            18: 1.30, // Pharma
            19: 0.95, // Logistics
            20: 0.85  // Administrative
        };

        return multipliers[industry] || 1.0;
    }

    _getEducationMultiplier(education) {
        const multipliers = {
            'no_degree': 0.70,
            'high_school': 0.85,
            'some_college': 1.00,
            'bachelors': 1.35,
            'advanced': 1.70
        };

        return multipliers[education] || 1.0;
    }

    _calculateSkillPremium(requiredSkills) {
        if (!requiredSkills) return 0;

        let totalPremium = 0;
        let skillCount = 0;

        Object.entries(requiredSkills).forEach(([skill, level]) => {
            const basePremium = this.skillPremiums[skill] || 0;
            totalPremium += basePremium * level;
            skillCount++;
        });

        return skillCount > 0 ? totalPremium / skillCount : 0;
    }

    _calculateMarketTightness(market, job) {
        if (!market) return 0;

        // Get unemployment rate for job's region/industry
        const stats = market.getMarketStatistics?.() || {};
        const unemploymentRate = stats.unemploymentRate || 0.05;

        // Tight market (low unemployment) = positive tightness
        // Loose market (high unemployment) = negative tightness
        return 0.05 - unemploymentRate;
    }

    _calculateMedianWage(workers) {
        const wages = workers
            .filter(w => w.status === 'employed' && w.wage > 0)
            .map(w => w.wage)
            .sort((a, b) => a - b);

        if (wages.length === 0) return this.nationalMedianWage;

        const mid = Math.floor(wages.length / 2);
        return wages.length % 2 !== 0
            ? wages[mid]
            : (wages[mid - 1] + wages[mid]) / 2;
    }

    _calculateMeanWage(workers) {
        const employed = workers.filter(w => w.status === 'employed' && w.wage > 0);
        if (employed.length === 0) return this.nationalMeanWage;

        return employed.reduce((sum, w) => sum + w.wage, 0) / employed.length;
    }

    // ========== Analysis Methods ==========

    /**
     * Calculate wage distribution statistics
     */
    getWageDistribution(workers) {
        const wages = workers
            .filter(w => w.status === 'employed' && w.wage > 0)
            .map(w => w.wage)
            .sort((a, b) => a - b);

        if (wages.length === 0) {
            return {
                min: 0,
                p10: 0,
                p25: 0,
                median: 0,
                p75: 0,
                p90: 0,
                max: 0,
                mean: 0,
                stdDev: 0,
                gini: 0
            };
        }

        const n = wages.length;
        const mean = wages.reduce((a, b) => a + b, 0) / n;
        const variance = wages.reduce((sum, w) => sum + Math.pow(w - mean, 2), 0) / n;

        return {
            min: wages[0],
            p10: wages[Math.floor(n * 0.1)],
            p25: wages[Math.floor(n * 0.25)],
            median: wages[Math.floor(n * 0.5)],
            p75: wages[Math.floor(n * 0.75)],
            p90: wages[Math.floor(n * 0.9)],
            max: wages[n - 1],
            mean: Math.round(mean),
            stdDev: Math.round(Math.sqrt(variance)),
            gini: this._calculateGini(wages)
        };
    }

    _calculateGini(wages) {
        if (wages.length === 0) return 0;

        const n = wages.length;
        let sumOfDifferences = 0;
        const total = wages.reduce((a, b) => a + b, 0);

        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                sumOfDifferences += Math.abs(wages[i] - wages[j]);
            }
        }

        return sumOfDifferences / (2 * n * total);
    }

    /**
     * Calculate wage polarization (hollowing of middle class)
     */
    getWagePolarization(workers) {
        const distribution = this.getWageDistribution(workers);

        // Define income groups
        const lowWage = distribution.p25;
        const highWage = distribution.p75;

        const wages = workers
            .filter(w => w.status === 'employed' && w.wage > 0)
            .map(w => w.wage);

        const lowShare = wages.filter(w => w < lowWage).length / wages.length;
        const midShare = wages.filter(w => w >= lowWage && w <= highWage).length / wages.length;
        const highShare = wages.filter(w => w > highWage).length / wages.length;

        // Polarization ratio: (low + high) / middle
        const polarizationRatio = midShare > 0
            ? (lowShare + highShare) / midShare
            : 0;

        return {
            lowShare,
            midShare,
            highShare,
            polarizationRatio,
            isPolarizing: polarizationRatio > 1.5
        };
    }

    /**
     * Get AI-related wage analysis
     */
    getAIWageImpact(workers) {
        const employed = workers.filter(w => w.status === 'employed' && w.wage > 0);

        // High AI skill workers
        const highAISkill = employed.filter(w => w.aiAugmentationSkill > 0.6);
        const lowAISkill = employed.filter(w => w.aiAugmentationSkill <= 0.6);

        const highAIAvgWage = highAISkill.length > 0
            ? highAISkill.reduce((sum, w) => sum + w.wage, 0) / highAISkill.length
            : 0;

        const lowAIAvgWage = lowAISkill.length > 0
            ? lowAISkill.reduce((sum, w) => sum + w.wage, 0) / lowAISkill.length
            : 0;

        const premium = lowAIAvgWage > 0
            ? (highAIAvgWage - lowAIAvgWage) / lowAIAvgWage
            : 0;

        return {
            highAISkillCount: highAISkill.length,
            lowAISkillCount: lowAISkill.length,
            highAIAvgWage: Math.round(highAIAvgWage),
            lowAIAvgWage: Math.round(lowAIAvgWage),
            aiSkillPremium: premium,
            premiumPercent: (premium * 100).toFixed(1) + '%'
        };
    }

    /**
     * Get current summary
     */
    getSummary(workers) {
        return {
            distribution: this.getWageDistribution(workers),
            polarization: this.getWagePolarization(workers),
            aiImpact: this.getAIWageImpact(workers),
            industryWages: { ...this.industryWages },
            skillPremiums: { ...this.skillPremiums },
            historyLength: this.wageHistory.length
        };
    }
}

// Export for ES modules
export { WageDynamics };

// Also export to window for backwards compatibility with script tags
if (typeof window !== 'undefined') {
    window.WageDynamics = WageDynamics;
}
