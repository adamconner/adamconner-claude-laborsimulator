/**
 * FirmAgent - Business entity in the Agent-Based Model
 *
 * Firms make decisions about AI adoption, hiring, layoffs, and wages.
 * They respond to market conditions and competitor behavior.
 */

// AI adoption status enum
const AIAdoptionStatus = {
    NONE: 'none',
    EXPLORING: 'exploring',
    PILOTING: 'piloting',
    SCALING: 'scaling',
    MATURE: 'mature'
};

// Firm size enum
const FirmSize = {
    SMALL: 'small',           // < 50 employees
    MEDIUM: 'medium',         // 50-500 employees
    LARGE: 'large',           // 500-5000 employees
    ENTERPRISE: 'enterprise'  // 5000+ employees
};

// Labor strategy enum
const LaborStrategy = {
    COST_MINIMIZER: 'cost_minimizer',
    TALENT_INVESTOR: 'talent_investor',
    BALANCED: 'balanced'
};

class FirmAgent {
    constructor(config = {}) {
        // Identity
        this.id = config.id || `firm_${Math.random().toString(36).substr(2, 9)}`;
        this.industry = config.industry || this._randomIndustry();
        this.region = config.region || 1;
        this.size = config.size || this._randomSize();

        // Workforce
        this.employees = config.employees || [];
        this.targetHeadcount = config.targetHeadcount || this._getTargetHeadcount();
        this.openPositions = [];

        // AI Adoption
        this.aiAdoptionStatus = config.aiAdoptionStatus || AIAdoptionStatus.NONE;
        this.aiCapabilities = config.aiCapabilities || {};
        this.automationLevel = config.automationLevel || 0; // 0-1
        this.aiInvestment = 0;
        this.aiROI = 0;
        this.monthsInCurrentStatus = 0;

        // Economics
        this.revenue = config.revenue || this._calculateInitialRevenue();
        this.laborCosts = 0;
        this.profitMargin = config.profitMargin || (0.05 + Math.random() * 0.15);

        // Behavioral
        this.innovativeness = config.innovativeness || Math.random();
        this.laborStrategy = config.laborStrategy || this._randomLaborStrategy();

        // Competition
        this.marketShare = config.marketShare || Math.random() * 0.1;
        this.competitors = []; // Will be populated during initialization
        this.competitorAIAdoption = 0; // Observed adoption level of competitors

        // Industry-specific automation potential
        this.industryAutomationPotential = this._getIndustryAutomationPotential();

        // Wage parameters
        this.baseWage = this._calculateBaseWage();
        this.wageAdjustmentRate = 0.02; // Max 2% adjustment per month
    }

    // ========== Initialization Helpers ==========

    _randomIndustry() {
        return Math.floor(Math.random() * 20) + 1;
    }

    _randomSize() {
        const rand = Math.random();
        if (rand < 0.70) return FirmSize.SMALL;
        if (rand < 0.90) return FirmSize.MEDIUM;
        if (rand < 0.98) return FirmSize.LARGE;
        return FirmSize.ENTERPRISE;
    }

    _getTargetHeadcount() {
        switch (this.size) {
            case FirmSize.SMALL: return Math.floor(Math.random() * 45) + 5;
            case FirmSize.MEDIUM: return Math.floor(Math.random() * 450) + 50;
            case FirmSize.LARGE: return Math.floor(Math.random() * 4500) + 500;
            case FirmSize.ENTERPRISE: return Math.floor(Math.random() * 10000) + 5000;
            default: return 25;
        }
    }

    _randomLaborStrategy() {
        const rand = Math.random();
        if (rand < 0.4) return LaborStrategy.COST_MINIMIZER;
        if (rand < 0.7) return LaborStrategy.BALANCED;
        return LaborStrategy.TALENT_INVESTOR;
    }

    _calculateInitialRevenue() {
        // Revenue scales with size
        const sizeMultipliers = {
            [FirmSize.SMALL]: 1,
            [FirmSize.MEDIUM]: 10,
            [FirmSize.LARGE]: 100,
            [FirmSize.ENTERPRISE]: 1000
        };
        return (500000 + Math.random() * 500000) * (sizeMultipliers[this.size] || 1);
    }

    _calculateBaseWage() {
        // Industry wage variations
        const industryWageMultipliers = {
            1: 1.3,  // Technology
            2: 1.2,  // Finance
            3: 1.1,  // Healthcare
            4: 0.9,  // Retail
            5: 0.85, // Food service
            6: 1.0,  // Manufacturing
            7: 1.15, // Professional services
            8: 0.95, // Transportation
            9: 1.05, // Education
            10: 0.9  // Construction
        };

        const baseMonthlyWage = 4000;
        const multiplier = industryWageMultipliers[this.industry] || 1.0;

        return baseMonthlyWage * multiplier;
    }

    _getIndustryAutomationPotential() {
        // Different industries have different automation potential
        const potentials = {
            1: 0.6,  // Technology - moderate (creates AI too)
            2: 0.7,  // Finance - high
            3: 0.4,  // Healthcare - lower (human touch needed)
            4: 0.8,  // Retail - very high
            5: 0.75, // Food service - high
            6: 0.85, // Manufacturing - very high
            7: 0.5,  // Professional services - moderate
            8: 0.65, // Transportation - high
            9: 0.3,  // Education - lower
            10: 0.4  // Construction - lower (physical)
        };

        return potentials[this.industry] || 0.5;
    }

    // ========== Decision Making ==========

    /**
     * Main monthly decision function
     */
    makeMonthlyDecisions(aiCapability, laborMarket, competitors) {
        // Update competitor observation
        this._observeCompetitors(competitors);

        // AI adoption decision
        this._makeAIAdoptionDecision(aiCapability);

        // Workforce decisions
        this._makeWorkforceDecisions(aiCapability, laborMarket);

        // Wage decisions
        this._makeWageDecisions(laborMarket);

        // Update financials
        this._updateFinancials();

        this.monthsInCurrentStatus++;
    }

    _observeCompetitors(competitors) {
        if (!competitors || competitors.length === 0) return;

        // Calculate average AI adoption of competitors
        const adoptionScores = {
            [AIAdoptionStatus.NONE]: 0,
            [AIAdoptionStatus.EXPLORING]: 0.2,
            [AIAdoptionStatus.PILOTING]: 0.4,
            [AIAdoptionStatus.SCALING]: 0.7,
            [AIAdoptionStatus.MATURE]: 1.0
        };

        const totalAdoption = competitors.reduce((sum, comp) => {
            return sum + (adoptionScores[comp.aiAdoptionStatus] || 0);
        }, 0);

        this.competitorAIAdoption = totalAdoption / competitors.length;
    }

    _makeAIAdoptionDecision(aiCapability) {
        // Calculate AI ROI based on current situation
        this._calculateAIROI(aiCapability);

        // Threshold varies by innovativeness
        const adoptionThreshold = 1.0 + (1 - this.innovativeness) * 0.5;

        // Competitive pressure can lower threshold
        const competitivePressure = this.competitorAIAdoption > 0.3 ? 0.2 : 0;
        const effectiveThreshold = adoptionThreshold - competitivePressure;

        switch (this.aiAdoptionStatus) {
            case AIAdoptionStatus.NONE:
                if (this.aiROI > effectiveThreshold || this.competitorAIAdoption > 0.5) {
                    this.aiAdoptionStatus = AIAdoptionStatus.EXPLORING;
                    this.monthsInCurrentStatus = 0;
                }
                break;

            case AIAdoptionStatus.EXPLORING:
                // Move to piloting after 3-6 months of exploration
                if (this.monthsInCurrentStatus >= 3 + Math.floor(Math.random() * 3)) {
                    if (this.aiROI > effectiveThreshold * 0.9) {
                        this.aiAdoptionStatus = AIAdoptionStatus.PILOTING;
                        this.monthsInCurrentStatus = 0;
                        this.automationLevel = 0.1;
                    }
                }
                break;

            case AIAdoptionStatus.PILOTING:
                // Move to scaling after 6-12 months if successful
                if (this.monthsInCurrentStatus >= 6 + Math.floor(Math.random() * 6)) {
                    // 80% success rate for pilots
                    if (Math.random() < 0.8) {
                        this.aiAdoptionStatus = AIAdoptionStatus.SCALING;
                        this.monthsInCurrentStatus = 0;
                        this.automationLevel = 0.3;
                    } else {
                        // Failed pilot - go back to exploring
                        this.aiAdoptionStatus = AIAdoptionStatus.EXPLORING;
                        this.monthsInCurrentStatus = 0;
                    }
                }
                break;

            case AIAdoptionStatus.SCALING:
                // Move to mature after 12-24 months
                if (this.monthsInCurrentStatus >= 12 + Math.floor(Math.random() * 12)) {
                    this.aiAdoptionStatus = AIAdoptionStatus.MATURE;
                    this.monthsInCurrentStatus = 0;
                    this.automationLevel = 0.6 + Math.random() * 0.3;
                }
                // Gradually increase automation during scaling
                this.automationLevel = Math.min(0.6, this.automationLevel + 0.02);
                break;

            case AIAdoptionStatus.MATURE:
                // Maintain and optimize
                this.automationLevel = Math.min(0.9, this.automationLevel + 0.005);
                break;
        }
    }

    _calculateAIROI(aiCapability) {
        // Potential labor cost savings
        const potentialSavings = this.laborCosts * this.industryAutomationPotential * 0.3;

        // Implementation costs (vary by size)
        const sizeMultipliers = {
            [FirmSize.SMALL]: 0.5,
            [FirmSize.MEDIUM]: 1,
            [FirmSize.LARGE]: 2,
            [FirmSize.ENTERPRISE]: 5
        };
        const implementationCost = 100000 * (sizeMultipliers[this.size] || 1);

        // AI capability level affects ROI
        const capabilityMultiplier = aiCapability ? aiCapability.getCurrentLevel() : 0.5;

        // Calculate annual ROI
        this.aiROI = (potentialSavings * 12 * capabilityMultiplier) / implementationCost;
    }

    _makeWorkforceDecisions(aiCapability, laborMarket) {
        // Calculate labor need based on automation level
        const automationReduction = this.automationLevel * this.industryAutomationPotential;
        const effectiveHeadcount = this.targetHeadcount * (1 - automationReduction * 0.5);

        const currentHeadcount = this.employees.length;
        const headcountGap = effectiveHeadcount - currentHeadcount;

        if (headcountGap > 5) {
            // Need to hire
            this._createJobPostings(Math.ceil(headcountGap * 0.3)); // Hire 30% of gap per month
        } else if (headcountGap < -5) {
            // Need to reduce workforce
            this._planLayoffs(Math.ceil(Math.abs(headcountGap) * 0.2)); // Layoff 20% of excess per month
        }

        // Clear filled positions
        this.openPositions = this.openPositions.filter(pos => !pos.filled);
    }

    _createJobPostings(count) {
        for (let i = 0; i < count; i++) {
            const posting = {
                id: `job_${this.id}_${Date.now()}_${i}`,
                firm: this,
                firmId: this.id,
                industry: this.industry,
                region: this.region,
                occupation: this._getTypicalOccupation(),
                wage: this._calculateOfferWage(),
                requiredEducation: this._getRequiredEducation(),
                requiredSkills: this._getRequiredSkills(),
                automationExposure: this.industryAutomationPotential * (1 - this.automationLevel),
                aiAugmentation: this.automationLevel > 0.3 ? 0.3 : 0,
                growthPotential: this.aiAdoptionStatus === AIAdoptionStatus.SCALING ? 0.7 : 0.5,
                posted: Date.now(),
                filled: false
            };
            this.openPositions.push(posting);
        }
    }

    _getTypicalOccupation() {
        // Return a typical occupation ID for this industry
        // Simplified - would map to actual occupation data
        return this.industry * 5 + Math.floor(Math.random() * 5);
    }

    _calculateOfferWage() {
        let wage = this.baseWage;

        // Adjust based on labor strategy
        if (this.laborStrategy === LaborStrategy.TALENT_INVESTOR) {
            wage *= 1.1;
        } else if (this.laborStrategy === LaborStrategy.COST_MINIMIZER) {
            wage *= 0.9;
        }

        // Add some variation
        wage *= (0.95 + Math.random() * 0.1);

        // AI-adopting firms may offer premium for AI skills
        if (this.automationLevel > 0.3) {
            wage *= 1.05;
        }

        return Math.round(wage);
    }

    _getRequiredEducation() {
        // Higher-tech industries need more education
        if ([1, 2, 7].includes(this.industry)) {
            return Math.random() < 0.7 ? 'bachelors' : 'some_college';
        }
        return Math.random() < 0.5 ? 'high_school' : 'some_college';
    }

    _getRequiredSkills() {
        // Return skill requirements based on industry
        const skills = {};

        // Industry-specific skills
        const industrySkills = {
            1: ['technical', 'programming', 'problemSolving'],
            2: ['financial', 'analytical', 'dataAnalysis'],
            3: ['healthcare', 'communication', 'problemSolving'],
            4: ['customerService', 'sales', 'communication'],
            5: ['customerService', 'communication'],
            6: ['manufacturing', 'technical', 'problemSolving'],
            7: ['analytical', 'communication', 'projectManagement'],
            8: ['logistics', 'technical'],
            9: ['teaching', 'communication', 'research'],
            10: ['technical', 'manufacturing']
        };

        const relevantSkills = industrySkills[this.industry] || ['communication'];
        relevantSkills.forEach(skill => {
            skills[skill] = 0.3 + Math.random() * 0.3;
        });

        // AI-adopting firms need AI skills
        if (this.automationLevel > 0.3) {
            skills['dataAnalysis'] = 0.4;
        }

        return skills;
    }

    _planLayoffs(count) {
        if (this.employees.length === 0) return;

        // Sort employees by layoff priority
        const sortedEmployees = [...this.employees].sort((a, b) => {
            // Prioritize laying off based on strategy
            let scoreA = 0, scoreB = 0;

            // Higher cost = higher priority for layoff (especially for cost minimizers)
            if (this.laborStrategy === LaborStrategy.COST_MINIMIZER) {
                scoreA += (a.wage || 0) / 10000;
                scoreB += (b.wage || 0) / 10000;
            }

            // More automatable roles = higher priority
            scoreA += (a.automationExposure || 0.5);
            scoreB += (b.automationExposure || 0.5);

            // Lower tenure = higher priority (last in, first out)
            scoreA += Math.max(0, 1 - (a.tenure || 0) / 120);
            scoreB += Math.max(0, 1 - (b.tenure || 0) / 120);

            return scoreB - scoreA;
        });

        // Mark employees for layoff
        const toLay = sortedEmployees.slice(0, Math.min(count, sortedEmployees.length));
        toLay.forEach(employee => {
            employee.markedForLayoff = true;
            employee.layoffReason = this.automationLevel > 0.3 ? 'automation' : 'downsizing';
        });
    }

    _makeWageDecisions(laborMarket) {
        // Get market wage info
        const marketWage = laborMarket ? laborMarket.getMarketWage(this.industry, this.region) : this.baseWage;

        // Adjust base wage toward market
        if (this.baseWage < marketWage * 0.9) {
            // Below market - raise wages
            this.baseWage *= (1 + this.wageAdjustmentRate);
        } else if (this.baseWage > marketWage * 1.1 && this.laborStrategy !== LaborStrategy.TALENT_INVESTOR) {
            // Above market - can lower wages
            this.baseWage *= (1 - this.wageAdjustmentRate * 0.5);
        }

        // AI adoption can suppress wages (less labor needed)
        if (this.automationLevel > 0.5) {
            this.baseWage *= 0.998; // Slight downward pressure
        }
    }

    _updateFinancials() {
        // Calculate labor costs
        this.laborCosts = this.employees.reduce((sum, emp) => sum + (emp.wage || 0), 0);

        // AI investment costs
        if (this.aiAdoptionStatus !== AIAdoptionStatus.NONE) {
            const investmentRates = {
                [AIAdoptionStatus.EXPLORING]: 0.001,
                [AIAdoptionStatus.PILOTING]: 0.005,
                [AIAdoptionStatus.SCALING]: 0.01,
                [AIAdoptionStatus.MATURE]: 0.003
            };
            this.aiInvestment = this.revenue * (investmentRates[this.aiAdoptionStatus] || 0);
        }

        // Update profit margin based on automation
        const automationSavings = this.laborCosts * this.automationLevel * 0.2;
        this.profitMargin = Math.min(0.3, this.profitMargin + automationSavings / this.revenue * 0.1);
    }

    // ========== Hiring Interface ==========

    /**
     * Get current job postings
     */
    getOpenPositions() {
        return this.openPositions.filter(pos => !pos.filled);
    }

    /**
     * Receive and rank job applicants
     */
    rankApplicants(applicants, position) {
        return applicants.map(applicant => ({
            applicant,
            score: this._scoreApplicant(applicant, position)
        })).sort((a, b) => b.score - a.score);
    }

    _scoreApplicant(applicant, position) {
        let score = 0;

        // Skill match
        if (position.requiredSkills && applicant.skills) {
            const skillMatches = Object.entries(position.requiredSkills).map(([skill, required]) => {
                const has = applicant.skills[skill] || 0;
                return Math.min(1, has / required);
            });
            score += (skillMatches.reduce((a, b) => a + b, 0) / skillMatches.length) * 40;
        }

        // Education match
        const eduRank = { 'no_degree': 0, 'high_school': 1, 'some_college': 2, 'bachelors': 3, 'advanced': 4 };
        const requiredRank = eduRank[position.requiredEducation] || 0;
        const applicantRank = eduRank[applicant.education] || 0;
        if (applicantRank >= requiredRank) {
            score += 20 + Math.min(10, (applicantRank - requiredRank) * 5);
        }

        // AI augmentation skill (valued by AI-adopting firms)
        if (this.automationLevel > 0.3) {
            score += (applicant.aiAugmentationSkill || 0) * 20;
        }

        // Lower wage expectations = better for cost minimizers
        if (this.laborStrategy === LaborStrategy.COST_MINIMIZER) {
            const wageRatio = (applicant.reservationWage || position.wage) / position.wage;
            score += (2 - wageRatio) * 10;
        }

        // Local candidates preferred
        if (applicant.region === this.region) {
            score += 10;
        }

        return score;
    }

    /**
     * Make job offers to top candidates
     */
    makeOffers(rankedApplicants, position) {
        const offers = [];
        const maxOffers = Math.min(3, rankedApplicants.length); // Make up to 3 offers per position

        for (let i = 0; i < maxOffers; i++) {
            const { applicant, score } = rankedApplicants[i];

            // Adjust offer based on score
            let offerWage = position.wage;
            if (score > 80 && this.laborStrategy === LaborStrategy.TALENT_INVESTOR) {
                offerWage *= 1.1; // Premium for top talent
            }

            offers.push({
                firm: this,
                position,
                applicant,
                wage: Math.round(offerWage),
                score
            });
        }

        return offers;
    }

    /**
     * Hire a worker
     */
    hire(worker, position) {
        this.employees.push(worker);
        position.filled = true;

        // Update worker's employer reference
        worker.employer = this;
    }

    /**
     * Execute planned layoffs
     */
    executeLayoffs() {
        const laidOff = [];

        this.employees = this.employees.filter(emp => {
            if (emp.markedForLayoff) {
                laidOff.push({
                    worker: emp,
                    reason: emp.layoffReason || 'downsizing'
                });
                return false;
            }
            return true;
        });

        return laidOff;
    }

    // ========== Getters ==========

    getHeadcount() {
        return this.employees.length;
    }

    getAverageWage() {
        if (this.employees.length === 0) return this.baseWage;
        return this.employees.reduce((sum, emp) => sum + (emp.wage || 0), 0) / this.employees.length;
    }

    isAdoptingAI() {
        return this.aiAdoptionStatus !== AIAdoptionStatus.NONE;
    }

    /**
     * Get summary for aggregation
     */
    getSummary() {
        return {
            id: this.id,
            industry: this.industry,
            region: this.region,
            size: this.size,
            headcount: this.employees.length,
            targetHeadcount: this.targetHeadcount,
            openPositions: this.openPositions.filter(p => !p.filled).length,
            aiAdoptionStatus: this.aiAdoptionStatus,
            automationLevel: this.automationLevel,
            averageWage: this.getAverageWage(),
            laborCosts: this.laborCosts,
            profitMargin: this.profitMargin
        };
    }
}

// Export for ES modules
export { FirmAgent, AIAdoptionStatus, FirmSize, LaborStrategy };

// Also export to window for backwards compatibility with script tags
if (typeof window !== 'undefined') {
    window.FirmAgent = FirmAgent;
    window.AIAdoptionStatus = AIAdoptionStatus;
    window.FirmSize = FirmSize;
    window.LaborStrategy = LaborStrategy;
}
