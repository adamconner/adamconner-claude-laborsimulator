/**
 * Regional Market System - Geographic economic zones in the ABM
 *
 * Each region has unique economic characteristics, industry mix,
 * cost of living, and labor market conditions.
 */

// US State/Region data based on real economic characteristics
const US_REGIONS = [
    { id: 1, name: 'California', abbrev: 'CA', population: 39.5, costOfLiving: 1.50, techHub: true },
    { id: 2, name: 'Texas', abbrev: 'TX', population: 29.1, costOfLiving: 0.92, techHub: true },
    { id: 3, name: 'Florida', abbrev: 'FL', population: 21.5, costOfLiving: 1.00, techHub: false },
    { id: 4, name: 'New York', abbrev: 'NY', population: 20.2, costOfLiving: 1.40, techHub: true },
    { id: 5, name: 'Pennsylvania', abbrev: 'PA', population: 13.0, costOfLiving: 0.98, techHub: false },
    { id: 6, name: 'Illinois', abbrev: 'IL', population: 12.8, costOfLiving: 1.02, techHub: false },
    { id: 7, name: 'Ohio', abbrev: 'OH', population: 11.8, costOfLiving: 0.88, techHub: false },
    { id: 8, name: 'Georgia', abbrev: 'GA', population: 10.7, costOfLiving: 0.95, techHub: true },
    { id: 9, name: 'North Carolina', abbrev: 'NC', population: 10.4, costOfLiving: 0.92, techHub: true },
    { id: 10, name: 'Michigan', abbrev: 'MI', population: 10.0, costOfLiving: 0.90, techHub: false },
    { id: 11, name: 'New Jersey', abbrev: 'NJ', population: 9.3, costOfLiving: 1.25, techHub: false },
    { id: 12, name: 'Virginia', abbrev: 'VA', population: 8.6, costOfLiving: 1.05, techHub: true },
    { id: 13, name: 'Washington', abbrev: 'WA', population: 7.6, costOfLiving: 1.20, techHub: true },
    { id: 14, name: 'Arizona', abbrev: 'AZ', population: 7.3, costOfLiving: 0.98, techHub: true },
    { id: 15, name: 'Massachusetts', abbrev: 'MA', population: 7.0, costOfLiving: 1.35, techHub: true },
    { id: 16, name: 'Tennessee', abbrev: 'TN', population: 6.9, costOfLiving: 0.88, techHub: false },
    { id: 17, name: 'Indiana', abbrev: 'IN', population: 6.8, costOfLiving: 0.85, techHub: false },
    { id: 18, name: 'Maryland', abbrev: 'MD', population: 6.2, costOfLiving: 1.12, techHub: true },
    { id: 19, name: 'Missouri', abbrev: 'MO', population: 6.2, costOfLiving: 0.85, techHub: false },
    { id: 20, name: 'Wisconsin', abbrev: 'WI', population: 5.9, costOfLiving: 0.90, techHub: false },
    { id: 21, name: 'Colorado', abbrev: 'CO', population: 5.8, costOfLiving: 1.10, techHub: true },
    { id: 22, name: 'Minnesota', abbrev: 'MN', population: 5.7, costOfLiving: 0.98, techHub: false },
    { id: 23, name: 'South Carolina', abbrev: 'SC', population: 5.1, costOfLiving: 0.88, techHub: false },
    { id: 24, name: 'Alabama', abbrev: 'AL', population: 5.0, costOfLiving: 0.85, techHub: false },
    { id: 25, name: 'Louisiana', abbrev: 'LA', population: 4.7, costOfLiving: 0.90, techHub: false },
    { id: 26, name: 'Kentucky', abbrev: 'KY', population: 4.5, costOfLiving: 0.85, techHub: false },
    { id: 27, name: 'Oregon', abbrev: 'OR', population: 4.2, costOfLiving: 1.12, techHub: true },
    { id: 28, name: 'Oklahoma', abbrev: 'OK', population: 4.0, costOfLiving: 0.85, techHub: false },
    { id: 29, name: 'Connecticut', abbrev: 'CT', population: 3.6, costOfLiving: 1.20, techHub: false },
    { id: 30, name: 'Utah', abbrev: 'UT', population: 3.3, costOfLiving: 0.98, techHub: true },
    { id: 31, name: 'Iowa', abbrev: 'IA', population: 3.2, costOfLiving: 0.85, techHub: false },
    { id: 32, name: 'Nevada', abbrev: 'NV', population: 3.1, costOfLiving: 1.02, techHub: false },
    { id: 33, name: 'Arkansas', abbrev: 'AR', population: 3.0, costOfLiving: 0.82, techHub: false },
    { id: 34, name: 'Mississippi', abbrev: 'MS', population: 3.0, costOfLiving: 0.80, techHub: false },
    { id: 35, name: 'Kansas', abbrev: 'KS', population: 2.9, costOfLiving: 0.85, techHub: false },
    { id: 36, name: 'New Mexico', abbrev: 'NM', population: 2.1, costOfLiving: 0.90, techHub: false },
    { id: 37, name: 'Nebraska', abbrev: 'NE', population: 2.0, costOfLiving: 0.88, techHub: false },
    { id: 38, name: 'Idaho', abbrev: 'ID', population: 1.9, costOfLiving: 0.95, techHub: false },
    { id: 39, name: 'West Virginia', abbrev: 'WV', population: 1.8, costOfLiving: 0.82, techHub: false },
    { id: 40, name: 'Hawaii', abbrev: 'HI', population: 1.5, costOfLiving: 1.85, techHub: false },
    { id: 41, name: 'New Hampshire', abbrev: 'NH', population: 1.4, costOfLiving: 1.10, techHub: false },
    { id: 42, name: 'Maine', abbrev: 'ME', population: 1.4, costOfLiving: 1.00, techHub: false },
    { id: 43, name: 'Montana', abbrev: 'MT', population: 1.1, costOfLiving: 0.95, techHub: false },
    { id: 44, name: 'Rhode Island', abbrev: 'RI', population: 1.1, costOfLiving: 1.08, techHub: false },
    { id: 45, name: 'Delaware', abbrev: 'DE', population: 1.0, costOfLiving: 1.02, techHub: false },
    { id: 46, name: 'South Dakota', abbrev: 'SD', population: 0.9, costOfLiving: 0.88, techHub: false },
    { id: 47, name: 'North Dakota', abbrev: 'ND', population: 0.8, costOfLiving: 0.90, techHub: false },
    { id: 48, name: 'Alaska', abbrev: 'AK', population: 0.7, costOfLiving: 1.25, techHub: false },
    { id: 49, name: 'Vermont', abbrev: 'VT', population: 0.6, costOfLiving: 1.05, techHub: false },
    { id: 50, name: 'Wyoming', abbrev: 'WY', population: 0.6, costOfLiving: 0.92, techHub: false }
];

// Industry sectors
const INDUSTRY_SECTORS = {
    1: { name: 'Technology', automationExposure: 0.3, aiAdoptionRate: 0.7, growthRate: 0.05 },
    2: { name: 'Healthcare', automationExposure: 0.4, aiAdoptionRate: 0.4, growthRate: 0.04 },
    3: { name: 'Finance', automationExposure: 0.5, aiAdoptionRate: 0.6, growthRate: 0.02 },
    4: { name: 'Retail', automationExposure: 0.7, aiAdoptionRate: 0.5, growthRate: -0.01 },
    5: { name: 'Manufacturing', automationExposure: 0.8, aiAdoptionRate: 0.5, growthRate: -0.02 },
    6: { name: 'Transportation', automationExposure: 0.75, aiAdoptionRate: 0.4, growthRate: 0.01 },
    7: { name: 'Education', automationExposure: 0.35, aiAdoptionRate: 0.3, growthRate: 0.02 },
    8: { name: 'Government', automationExposure: 0.4, aiAdoptionRate: 0.2, growthRate: 0.01 },
    9: { name: 'Construction', automationExposure: 0.5, aiAdoptionRate: 0.2, growthRate: 0.02 },
    10: { name: 'Professional Services', automationExposure: 0.45, aiAdoptionRate: 0.55, growthRate: 0.03 },
    11: { name: 'Hospitality', automationExposure: 0.6, aiAdoptionRate: 0.3, growthRate: 0.02 },
    12: { name: 'Agriculture', automationExposure: 0.65, aiAdoptionRate: 0.3, growthRate: -0.01 },
    13: { name: 'Energy', automationExposure: 0.55, aiAdoptionRate: 0.4, growthRate: 0.01 },
    14: { name: 'Media & Entertainment', automationExposure: 0.5, aiAdoptionRate: 0.5, growthRate: 0.02 },
    15: { name: 'Real Estate', automationExposure: 0.4, aiAdoptionRate: 0.35, growthRate: 0.01 },
    16: { name: 'Utilities', automationExposure: 0.5, aiAdoptionRate: 0.35, growthRate: 0.00 },
    17: { name: 'Telecommunications', automationExposure: 0.55, aiAdoptionRate: 0.5, growthRate: 0.01 },
    18: { name: 'Pharmaceuticals', automationExposure: 0.45, aiAdoptionRate: 0.5, growthRate: 0.04 },
    19: { name: 'Logistics', automationExposure: 0.7, aiAdoptionRate: 0.45, growthRate: 0.03 },
    20: { name: 'Administrative', automationExposure: 0.8, aiAdoptionRate: 0.5, growthRate: -0.02 }
};

// Regional industry distribution (what % of region's economy is each industry)
const REGIONAL_INDUSTRY_MIX = {
    // Tech hubs
    'CA': { 1: 0.20, 2: 0.10, 3: 0.08, 10: 0.15, 14: 0.12 },
    'WA': { 1: 0.25, 2: 0.08, 10: 0.12, 19: 0.10 },
    'TX': { 1: 0.12, 3: 0.08, 5: 0.10, 13: 0.15, 2: 0.12 },
    'NY': { 3: 0.20, 10: 0.15, 14: 0.10, 2: 0.10 },
    'MA': { 1: 0.15, 2: 0.18, 7: 0.12, 18: 0.10 },

    // Manufacturing belt
    'MI': { 5: 0.25, 6: 0.12, 2: 0.10 },
    'OH': { 5: 0.20, 2: 0.12, 3: 0.08 },
    'IN': { 5: 0.22, 19: 0.12, 2: 0.10 },
    'WI': { 5: 0.18, 12: 0.10, 2: 0.12 },

    // Service economies
    'FL': { 11: 0.15, 2: 0.12, 15: 0.10, 4: 0.12 },
    'NV': { 11: 0.25, 15: 0.10, 9: 0.08 },

    // Energy states
    'LA': { 13: 0.20, 5: 0.10, 6: 0.08 },
    'OK': { 13: 0.18, 12: 0.10 },
    'WY': { 13: 0.25, 12: 0.15 },
    'ND': { 13: 0.20, 12: 0.25 },

    // Agriculture
    'IA': { 12: 0.25, 5: 0.12 },
    'NE': { 12: 0.22, 5: 0.10 },
    'KS': { 12: 0.20, 13: 0.08 }
};

class Region {
    constructor(config) {
        this.id = config.id;
        this.name = config.name;
        this.abbrev = config.abbrev || config.name.substring(0, 2).toUpperCase();
        this.population = config.population || 5.0; // Millions
        this.costOfLiving = config.costOfLiving || 1.0; // Index (1.0 = national average)
        this.techHub = config.techHub || false;

        // Economic characteristics
        this.industryMix = this._initializeIndustryMix();
        this.unemploymentRate = config.initialUnemploymentRate || 0.04 + (Math.random() * 0.02 - 0.01);
        this.averageWage = this._calculateAverageWage();
        this.laborForceParticipation = 0.60 + Math.random() * 0.08;

        // Labor market dynamics
        this.localWorkers = [];
        this.localFirms = [];
        this.localTrainingPrograms = [];
        this.jobPostings = [];

        // Migration tracking
        this.inMigration = 0;
        this.outMigration = 0;

        // Regional attractiveness (affects migration)
        this.attractiveness = this._calculateAttractiveness();

        // AI adoption level in region
        this.regionalAIAdoption = this.techHub ? 0.25 + Math.random() * 0.15 : 0.10 + Math.random() * 0.10;

        // Policy support averages
        this.policySupport = {
            ubi: 0.5,
            retraining: 0.5,
            aiRegulation: 0.5
        };
    }

    _initializeIndustryMix() {
        const mix = {};
        const regionMix = REGIONAL_INDUSTRY_MIX[this.abbrev] || {};

        // Start with regional specializations
        Object.entries(regionMix).forEach(([industry, share]) => {
            mix[industry] = share;
        });

        // Fill in remaining industries with smaller shares
        let totalShare = Object.values(mix).reduce((sum, s) => sum + s, 0);

        Object.keys(INDUSTRY_SECTORS).forEach(industry => {
            if (!mix[industry]) {
                const remainingShare = Math.max(0.02, (1 - totalShare) / 15);
                mix[industry] = remainingShare * (0.5 + Math.random());
            }
        });

        // Normalize to 1.0
        totalShare = Object.values(mix).reduce((sum, s) => sum + s, 0);
        Object.keys(mix).forEach(industry => {
            mix[industry] = mix[industry] / totalShare;
        });

        return mix;
    }

    _calculateAverageWage() {
        // Base national average wage
        const nationalAverage = 4500; // Monthly

        // Adjust for cost of living
        let wage = nationalAverage * this.costOfLiving;

        // Tech hubs have higher wages
        if (this.techHub) {
            wage *= 1.15;
        }

        // Add some randomness
        wage *= (0.95 + Math.random() * 0.1);

        return Math.round(wage);
    }

    _calculateAttractiveness() {
        let score = 50; // Base score

        // Economic opportunity
        score += (1 - this.unemploymentRate) * 20;

        // Wage vs cost of living ratio
        const wageToCost = this.averageWage / (4500 * this.costOfLiving);
        score += wageToCost * 10;

        // Tech hub bonus
        if (this.techHub) {
            score += 10;
        }

        // Cost of living penalty (high cost = less attractive for migration)
        if (this.costOfLiving > 1.2) {
            score -= (this.costOfLiving - 1.2) * 20;
        } else if (this.costOfLiving < 0.9) {
            score += (0.9 - this.costOfLiving) * 10;
        }

        return Math.max(0, Math.min(100, score));
    }

    // ========== Monthly Updates ==========

    updateMonth(workers, firms, globalConditions = {}) {
        // Update local references
        this.localWorkers = workers.filter(w => w.region === this.id);
        this.localFirms = firms.filter(f => f.region === this.id);

        // Recalculate unemployment rate
        const laborForce = this.localWorkers.filter(w => w.status !== 'out_of_labor_force');
        const unemployed = laborForce.filter(w => w.status === 'unemployed');
        this.unemploymentRate = laborForce.length > 0 ? unemployed.length / laborForce.length : 0;

        // Update average wage
        const employedWorkers = this.localWorkers.filter(w => w.status === 'employed' && w.wage > 0);
        if (employedWorkers.length > 0) {
            this.averageWage = Math.round(
                employedWorkers.reduce((sum, w) => sum + w.wage, 0) / employedWorkers.length
            );
        }

        // Update AI adoption level
        const aiAdoptingFirms = this.localFirms.filter(f =>
            ['piloting', 'scaling', 'mature'].includes(f.aiAdoptionStatus)
        );
        this.regionalAIAdoption = this.localFirms.length > 0
            ? aiAdoptingFirms.length / this.localFirms.length
            : 0;

        // Update policy support averages
        this._updatePolicySupport();

        // Recalculate attractiveness
        this.attractiveness = this._calculateAttractiveness();

        return this.getSnapshot();
    }

    _updatePolicySupport() {
        if (this.localWorkers.length === 0) return;

        const policies = ['ubi', 'retraining', 'aiRegulation'];

        policies.forEach(policy => {
            const totalSupport = this.localWorkers.reduce((sum, w) =>
                sum + (w.policySupport?.[policy] || 0.5), 0
            );
            this.policySupport[policy] = totalSupport / this.localWorkers.length;
        });
    }

    // ========== Migration ==========

    calculateMigrationPressure(otherRegions) {
        // Workers in this region may want to leave if:
        // - High unemployment
        // - Lower wages relative to other regions
        // - Other regions are more attractive

        const avgOtherAttractiveness = otherRegions.reduce((sum, r) => sum + r.attractiveness, 0) / otherRegions.length;

        let outPressure = 0;

        // High unemployment pushes people out
        if (this.unemploymentRate > 0.06) {
            outPressure += (this.unemploymentRate - 0.06) * 50;
        }

        // Low attractiveness relative to average
        if (this.attractiveness < avgOtherAttractiveness) {
            outPressure += (avgOtherAttractiveness - this.attractiveness) * 0.5;
        }

        // Calculate in-migration pressure (opposite factors)
        let inPressure = 0;

        if (this.attractiveness > avgOtherAttractiveness) {
            inPressure += (this.attractiveness - avgOtherAttractiveness) * 0.5;
        }

        if (this.unemploymentRate < 0.04) {
            inPressure += (0.04 - this.unemploymentRate) * 30;
        }

        return {
            outPressure: Math.max(0, outPressure),
            inPressure: Math.max(0, inPressure)
        };
    }

    processMigration(workers, destinationRegion) {
        // Called when workers migrate away
        this.outMigration++;
    }

    receiveMigrant(worker) {
        // Called when workers migrate here
        this.inMigration++;
    }

    // ========== Industry Analysis ==========

    getIndustryEmployment() {
        const employment = {};

        Object.keys(INDUSTRY_SECTORS).forEach(industryId => {
            const industryWorkers = this.localWorkers.filter(w =>
                w.industry === parseInt(industryId) && w.status === 'employed'
            );
            employment[industryId] = {
                name: INDUSTRY_SECTORS[industryId].name,
                employed: industryWorkers.length,
                share: this.localWorkers.length > 0
                    ? industryWorkers.length / this.localWorkers.length
                    : 0
            };
        });

        return employment;
    }

    getAutomationExposure() {
        // Weighted average automation exposure based on industry mix
        let totalExposure = 0;
        let totalWeight = 0;

        Object.entries(this.industryMix).forEach(([industry, share]) => {
            const sector = INDUSTRY_SECTORS[industry];
            if (sector) {
                totalExposure += sector.automationExposure * share;
                totalWeight += share;
            }
        });

        return totalWeight > 0 ? totalExposure / totalWeight : 0.5;
    }

    // ========== Getters ==========

    getSnapshot() {
        return {
            id: this.id,
            name: this.name,
            abbrev: this.abbrev,
            population: this.population,
            laborForce: this.localWorkers.filter(w => w.status !== 'out_of_labor_force').length,
            employed: this.localWorkers.filter(w => w.status === 'employed').length,
            unemployed: this.localWorkers.filter(w => w.status === 'unemployed').length,
            unemploymentRate: this.unemploymentRate,
            averageWage: this.averageWage,
            costOfLiving: this.costOfLiving,
            techHub: this.techHub,
            aiAdoptionRate: this.regionalAIAdoption,
            attractiveness: this.attractiveness,
            automationExposure: this.getAutomationExposure(),
            policySupport: { ...this.policySupport },
            migration: {
                in: this.inMigration,
                out: this.outMigration,
                net: this.inMigration - this.outMigration
            }
        };
    }

    getTopIndustries(count = 5) {
        const sorted = Object.entries(this.industryMix)
            .map(([id, share]) => ({
                id: parseInt(id),
                name: INDUSTRY_SECTORS[id]?.name || 'Unknown',
                share,
                automationExposure: INDUSTRY_SECTORS[id]?.automationExposure || 0.5
            }))
            .sort((a, b) => b.share - a.share);

        return sorted.slice(0, count);
    }
}

/**
 * RegionalMarketSystem - Manages all regions
 */
class RegionalMarketSystem {
    constructor(numRegions = 50) {
        this.regions = [];
        this.numRegions = Math.min(numRegions, US_REGIONS.length);

        this._initializeRegions();
    }

    _initializeRegions() {
        // Use real US state data for regions
        for (let i = 0; i < this.numRegions; i++) {
            const regionData = US_REGIONS[i];
            this.regions.push(new Region(regionData));
        }
    }

    getRegion(id) {
        return this.regions.find(r => r.id === id);
    }

    getRegionByAbbrev(abbrev) {
        return this.regions.find(r => r.abbrev === abbrev);
    }

    /**
     * Update all regions for a month
     */
    updateAllRegions(workers, firms) {
        const snapshots = [];

        this.regions.forEach(region => {
            const snapshot = region.updateMonth(workers, firms);
            snapshots.push(snapshot);
        });

        return snapshots;
    }

    /**
     * Get population-weighted distribution for worker assignment
     */
    getPopulationDistribution() {
        const totalPop = this.regions.reduce((sum, r) => sum + r.population, 0);
        return this.regions.map(r => ({
            id: r.id,
            weight: r.population / totalPop
        }));
    }

    /**
     * Select a region based on population distribution
     */
    selectRegionByPopulation() {
        const distribution = this.getPopulationDistribution();
        const rand = Math.random();
        let cumulative = 0;

        for (const { id, weight } of distribution) {
            cumulative += weight;
            if (rand <= cumulative) {
                return id;
            }
        }

        return this.regions[0].id;
    }

    /**
     * Get national statistics
     */
    getNationalStats() {
        const allWorkers = this.regions.reduce((sum, r) => sum + r.localWorkers.length, 0);
        const allUnemployed = this.regions.reduce((sum, r) =>
            sum + r.localWorkers.filter(w => w.status === 'unemployed').length, 0
        );
        const allEmployed = this.regions.reduce((sum, r) =>
            sum + r.localWorkers.filter(w => w.status === 'employed').length, 0
        );

        const laborForce = allEmployed + allUnemployed;

        return {
            totalWorkers: allWorkers,
            laborForce,
            employed: allEmployed,
            unemployed: allUnemployed,
            unemploymentRate: laborForce > 0 ? allUnemployed / laborForce : 0,
            averageWage: this.regions.reduce((sum, r) => sum + r.averageWage, 0) / this.regions.length,
            regionalVariation: this._calculateRegionalVariation()
        };
    }

    _calculateRegionalVariation() {
        const rates = this.regions.map(r => r.unemploymentRate);
        const mean = rates.reduce((sum, r) => sum + r, 0) / rates.length;
        const variance = rates.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / rates.length;

        return {
            min: Math.min(...rates),
            max: Math.max(...rates),
            mean,
            stdDev: Math.sqrt(variance)
        };
    }

    /**
     * Get regions sorted by a metric
     */
    getRankedRegions(metric = 'unemploymentRate', ascending = true) {
        const sorted = [...this.regions].sort((a, b) => {
            const aVal = a[metric] || 0;
            const bVal = b[metric] || 0;
            return ascending ? aVal - bVal : bVal - aVal;
        });

        return sorted.map(r => ({
            id: r.id,
            name: r.name,
            abbrev: r.abbrev,
            value: r[metric]
        }));
    }

    /**
     * Get summary for all regions
     */
    getAllRegionSnapshots() {
        return this.regions.map(r => r.getSnapshot());
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Region, RegionalMarketSystem, US_REGIONS, INDUSTRY_SECTORS };
}
