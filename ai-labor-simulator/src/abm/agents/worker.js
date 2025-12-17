/**
 * WorkerAgent - Individual worker in the Agent-Based Model
 *
 * Each worker has demographics, skills, employment status, and political opinions.
 * Workers make autonomous decisions about job search, retraining, and relocation.
 */

// Employment status enum
const EmploymentStatus = {
    EMPLOYED: 'employed',
    UNEMPLOYED: 'unemployed',
    RETRAINING: 'retraining',
    OUT_OF_LABOR_FORCE: 'out_of_labor_force'
};

// Education level enum
const EducationLevel = {
    NO_DEGREE: 'no_degree',
    HIGH_SCHOOL: 'high_school',
    SOME_COLLEGE: 'some_college',
    BACHELORS: 'bachelors',
    ADVANCED: 'advanced'
};

// AI experience enum
const AIExperience = {
    POSITIVE: 'positive',
    NEGATIVE: 'negative',
    NEUTRAL: 'neutral',
    NONE: 'none'
};

class WorkerAgent {
    constructor(config = {}) {
        // Unique identifier
        this.id = config.id || `worker_${Math.random().toString(36).substr(2, 9)}`;

        // Demographics
        this.age = config.age || this._randomAge();
        this.education = config.education || this._randomEducation();
        this.region = config.region || 1; // Default to region 1

        // Employment
        this.status = config.status || EmploymentStatus.EMPLOYED;
        this.occupation = config.occupation || this._randomOccupation();
        this.industry = config.industry || this._randomIndustry();
        this.employer = config.employer || null;
        this.tenure = config.tenure || Math.floor(Math.random() * 120); // 0-10 years in months
        this.unemploymentDuration = 0; // Months unemployed

        // Skills & Capabilities (0-1 scale)
        this.skills = config.skills || this._initializeSkills();
        this.aiAugmentationSkill = config.aiAugmentationSkill || Math.random() * 0.5 + 0.1;
        this.adaptability = config.adaptability || Math.random() * 0.6 + 0.2;

        // Economics
        this.wage = config.wage || this._calculateInitialWage();
        this.savings = config.savings || Math.random() * 12; // 0-12 months of expenses
        this.reservationWage = this.wage * 0.7; // Minimum acceptable wage

        // Behavioral traits (0-1 scale)
        this.riskTolerance = config.riskTolerance || Math.random();
        this.mobilityWillingness = config.mobilityWillingness || Math.random() * 0.5;
        this.networkSize = config.networkSize || Math.floor(Math.random() * 50) + 5;
        this.informationLevel = config.informationLevel || Math.random();

        // Network connections (populated during initialization)
        this.network = [];

        // History
        this.unemploymentSpells = 0;
        this.retrainingHistory = [];
        this.jobHistory = [];

        // Political behavioral factors (initialize BEFORE policy support, since it depends on these)
        this.politicalEngagement = config.politicalEngagement || Math.random() * 0.6 + 0.2;
        this.ideologicalPrior = config.ideologicalPrior || (Math.random() * 2 - 1); // -1 to 1
        this.economicAnxiety = config.economicAnxiety || 0.2;
        this.trustInGovernment = config.trustInGovernment || Math.random() * 0.5 + 0.25;
        this.networkPoliticalInfluence = config.networkPoliticalInfluence || Math.random() * 0.5;

        // Political / Policy Support (0-1 scale) - depends on ideologicalPrior above
        this.policySupport = {
            ubi: this._initializePolicySupport('ubi'),
            retraining: this._initializePolicySupport('retraining'),
            wageSubsidy: this._initializePolicySupport('wageSubsidy'),
            reducedWorkWeek: this._initializePolicySupport('reducedWorkWeek'),
            publicWorks: this._initializePolicySupport('publicWorks'),
            eitcExpansion: this._initializePolicySupport('eitcExpansion'),
            aiRegulation: this._initializePolicySupport('aiRegulation'),
            tradeProtection: this._initializePolicySupport('tradeProtection'),
            educationInvestment: this._initializePolicySupport('educationInvestment')
        };

        // Experience-based sentiment
        this.personalAIExperience = AIExperience.NONE;
        this.benefitedFromIntervention = null;
        this.harmedByLackOfIntervention = false;

        // Retraining state
        this.retrainingProgram = null;
        this.retrainingProgress = 0;

        // Job search state
        this.activelySearching = false;
        this.jobApplications = [];
        this.jobOffers = [];
    }

    // ========== Initialization Helpers ==========

    _randomAge() {
        // Distribution weighted toward working-age adults
        const rand = Math.random();
        if (rand < 0.15) return Math.floor(Math.random() * 7) + 18; // 18-24
        if (rand < 0.35) return Math.floor(Math.random() * 10) + 25; // 25-34
        if (rand < 0.55) return Math.floor(Math.random() * 10) + 35; // 35-44
        if (rand < 0.75) return Math.floor(Math.random() * 10) + 45; // 45-54
        if (rand < 0.92) return Math.floor(Math.random() * 10) + 55; // 55-64
        return Math.floor(Math.random() * 6) + 65; // 65-70
    }

    _randomEducation() {
        const rand = Math.random();
        if (rand < 0.10) return EducationLevel.NO_DEGREE;
        if (rand < 0.38) return EducationLevel.HIGH_SCHOOL;
        if (rand < 0.58) return EducationLevel.SOME_COLLEGE;
        if (rand < 0.85) return EducationLevel.BACHELORS;
        return EducationLevel.ADVANCED;
    }

    _randomOccupation() {
        // Return occupation ID 1-100
        return Math.floor(Math.random() * 100) + 1;
    }

    _randomIndustry() {
        // Return industry ID 1-20
        return Math.floor(Math.random() * 20) + 1;
    }

    _initializeSkills() {
        // 20-dimension skill vector
        const skills = {};
        const skillTypes = [
            'technical', 'analytical', 'communication', 'leadership',
            'creativity', 'problemSolving', 'dataAnalysis', 'programming',
            'customerService', 'sales', 'projectManagement', 'writing',
            'research', 'financial', 'healthcare', 'manufacturing',
            'logistics', 'marketing', 'legal', 'teaching'
        ];

        skillTypes.forEach(skill => {
            // Base skill level influenced by education
            const educationBonus = this._getEducationBonus();
            skills[skill] = Math.min(1, Math.random() * 0.6 + educationBonus);
        });

        return skills;
    }

    _getEducationBonus() {
        switch (this.education) {
            case EducationLevel.ADVANCED: return 0.3;
            case EducationLevel.BACHELORS: return 0.2;
            case EducationLevel.SOME_COLLEGE: return 0.1;
            case EducationLevel.HIGH_SCHOOL: return 0.05;
            default: return 0;
        }
    }

    _calculateInitialWage() {
        // Base wage influenced by education and age (experience proxy)
        let baseWage = 3000; // $3000/month base

        // Education multiplier
        const eduMultipliers = {
            [EducationLevel.NO_DEGREE]: 0.7,
            [EducationLevel.HIGH_SCHOOL]: 0.85,
            [EducationLevel.SOME_COLLEGE]: 1.0,
            [EducationLevel.BACHELORS]: 1.4,
            [EducationLevel.ADVANCED]: 1.8
        };

        baseWage *= eduMultipliers[this.education] || 1;

        // Age/experience bonus (peaks around 50)
        const experienceMultiplier = 1 + Math.min(0.5, (this.age - 22) * 0.015);
        baseWage *= experienceMultiplier;

        // Add some randomness
        baseWage *= (0.8 + Math.random() * 0.4);

        return Math.round(baseWage);
    }

    _initializePolicySupport(policy) {
        // Initial support influenced by ideology
        let baseSupport = 0.5;

        // Left-leaning more supportive of government programs
        if (this.ideologicalPrior < 0) {
            if (['ubi', 'retraining', 'publicWorks', 'aiRegulation'].includes(policy)) {
                baseSupport += Math.abs(this.ideologicalPrior) * 0.2;
            }
        } else {
            // Right-leaning less supportive
            if (['ubi', 'aiRegulation', 'publicWorks'].includes(policy)) {
                baseSupport -= this.ideologicalPrior * 0.15;
            }
            if (policy === 'educationInvestment') {
                baseSupport += 0.1; // Generally bipartisan
            }
        }

        // Add noise
        baseSupport += (Math.random() - 0.5) * 0.2;

        return Math.max(0, Math.min(1, baseSupport));
    }

    // ========== Decision Making ==========

    /**
     * Main monthly decision function
     */
    makeMonthlyDecisions(laborMarket, aiCapability, interventions) {
        // Calculate current displacement risk
        const displacementRisk = this._calculateDisplacementRisk(aiCapability);

        switch (this.status) {
            case EmploymentStatus.EMPLOYED:
                this._employedDecisions(displacementRisk, laborMarket);
                break;
            case EmploymentStatus.UNEMPLOYED:
                this._unemployedDecisions(laborMarket);
                break;
            case EmploymentStatus.RETRAINING:
                this._retrainingDecisions();
                break;
            case EmploymentStatus.OUT_OF_LABOR_FORCE:
                this._outOfLaborForceDecisions(laborMarket);
                break;
        }

        // Update policy support based on current situation
        this._updatePolicySupport();

        // Age one month
        this._ageOneMonth();
    }

    _calculateDisplacementRisk(aiCapability) {
        // Base risk from occupation automation exposure
        const occupationExposure = aiCapability.getOccupationExposure(this.occupation);

        // Reduced by AI augmentation skill
        const personalMitigation = this.aiAugmentationSkill * 0.3;

        // Employer AI adoption increases risk
        const employerRisk = this.employer ? this.employer.automationLevel * 0.2 : 0;

        // Tenure can be double-edged (experience but also higher cost)
        const tenureRisk = this.tenure > 60 ? 0.05 : 0;

        return Math.max(0, Math.min(1,
            occupationExposure - personalMitigation + employerRisk + tenureRisk
        ));
    }

    _employedDecisions(displacementRisk, laborMarket) {
        // Threshold based on risk tolerance
        const searchThreshold = 0.5 - (this.riskTolerance * 0.2);

        // Consider job search if displacement risk is high
        if (displacementRisk > searchThreshold) {
            // More likely to search if have savings cushion
            const searchProbability = displacementRisk * (0.5 + this.savings / 24);

            if (Math.random() < searchProbability) {
                this.activelySearching = true;
            }
        }

        // Consider retraining if risk is very high and have savings
        if (displacementRisk > 0.7 && this.savings > 3 && this.age < 55) {
            const retrainROI = this._calculateRetrainingROI();
            if (retrainROI > 1.2 && Math.random() < 0.1) {
                this._considerRetraining();
            }
        }

        // Update savings (employed workers save)
        this.savings = Math.min(24, this.savings + 0.2);
    }

    _unemployedDecisions(laborMarket) {
        this.unemploymentDuration++;
        this.activelySearching = true;

        // Deplete savings
        this.savings = Math.max(0, this.savings - 1);

        // Increase economic anxiety
        this.economicAnxiety = Math.min(1, this.economicAnxiety + 0.03);

        // Lower reservation wage over time
        if (this.unemploymentDuration > 3) {
            this.reservationWage *= 0.98;
        }

        // Consider retraining after 6 months
        if (this.unemploymentDuration > 6 && this.savings > 2 && this.age < 55) {
            if (Math.random() < 0.15) {
                this._considerRetraining();
            }
        }

        // Consider leaving labor force after 18 months if older
        if (this.unemploymentDuration > 18 && this.age > 55) {
            if (Math.random() < 0.05) {
                this.status = EmploymentStatus.OUT_OF_LABOR_FORCE;
                this.activelySearching = false;
            }
        }

        // Expand job search criteria over time
        if (this.unemploymentDuration > 6) {
            // More willing to relocate
            this.mobilityWillingness = Math.min(1, this.mobilityWillingness + 0.02);
        }
    }

    _retrainingDecisions() {
        if (!this.retrainingProgram) {
            // Something went wrong, return to job search
            this.status = EmploymentStatus.UNEMPLOYED;
            return;
        }

        this.retrainingProgress++;

        // Check if program is complete
        if (this.retrainingProgress >= this.retrainingProgram.duration) {
            this._completeRetraining();
        }

        // Risk of dropout due to financial pressure
        if (this.savings <= 0 && Math.random() < 0.1) {
            this._dropoutRetraining();
        }

        // Deplete savings during retraining
        this.savings = Math.max(0, this.savings - 0.8);
    }

    _outOfLaborForceDecisions(laborMarket) {
        // Small chance of re-entering labor force
        if (Math.random() < 0.02) {
            this.status = EmploymentStatus.UNEMPLOYED;
            this.unemploymentDuration = 0;
            this.activelySearching = true;
        }
    }

    _considerRetraining() {
        // Would need to be connected to training program agents
        // For now, just flag interest
        this.wantsRetraining = true;
    }

    _calculateRetrainingROI() {
        // Simplified ROI calculation
        const potentialWageIncrease = this.wage * 0.3;
        const yearsRemaining = Math.max(1, 65 - this.age);
        const trainingCost = 10000; // Average training cost

        return (potentialWageIncrease * 12 * yearsRemaining) / trainingCost;
    }

    _completeRetraining() {
        // Update skills based on program
        if (this.retrainingProgram.skillsProvided) {
            Object.entries(this.retrainingProgram.skillsProvided).forEach(([skill, value]) => {
                this.skills[skill] = Math.min(1, (this.skills[skill] || 0) + value);
            });
        }

        // Update AI augmentation skill
        this.aiAugmentationSkill = Math.min(1, this.aiAugmentationSkill + 0.2);

        // Record in history
        this.retrainingHistory.push({
            program: this.retrainingProgram.id,
            completedMonth: Date.now(),
            success: true
        });

        // Return to job search
        this.status = EmploymentStatus.UNEMPLOYED;
        this.unemploymentDuration = 0;
        this.retrainingProgram = null;
        this.retrainingProgress = 0;
        this.activelySearching = true;

        // Boost policy support for retraining (it worked!)
        this.policySupport.retraining = Math.min(1, this.policySupport.retraining + 0.2);
        this.policySupport.educationInvestment = Math.min(1, this.policySupport.educationInvestment + 0.15);
        this.trustInGovernment = Math.min(1, this.trustInGovernment + 0.1);
        this.benefitedFromIntervention = 'retraining';
    }

    _dropoutRetraining() {
        this.retrainingHistory.push({
            program: this.retrainingProgram.id,
            completedMonth: Date.now(),
            success: false
        });

        this.status = EmploymentStatus.UNEMPLOYED;
        this.retrainingProgram = null;
        this.retrainingProgress = 0;
        this.activelySearching = true;

        // Reduced policy support for retraining (didn't work for me)
        this.policySupport.retraining = Math.max(0, this.policySupport.retraining - 0.15);
        this.trustInGovernment = Math.max(0, this.trustInGovernment - 0.15);

        // Maybe just give cash instead
        this.policySupport.ubi = Math.min(1, this.policySupport.ubi + 0.1);
    }

    _ageOneMonth() {
        // Simplified - age increases every 12 months
        // In a real implementation, track actual month count
    }

    // ========== Job Market Interactions ==========

    /**
     * Search for and apply to jobs
     */
    searchForJobs(laborMarket) {
        if (!this.activelySearching) return [];

        // Get visible jobs based on network and region
        const visibleJobs = laborMarket.getVisibleJobs(this);

        // Filter to jobs we're qualified for
        const suitableJobs = visibleJobs.filter(job => this._isQualifiedFor(job));

        // Apply to top matches (limit based on desperation)
        const applicationLimit = this.unemploymentDuration > 6 ? 10 : 5;
        const applications = suitableJobs.slice(0, applicationLimit);

        this.jobApplications = applications.map(job => job.id);

        return applications;
    }

    _isQualifiedFor(job) {
        // Check education requirement
        const eduRank = {
            [EducationLevel.NO_DEGREE]: 0,
            [EducationLevel.HIGH_SCHOOL]: 1,
            [EducationLevel.SOME_COLLEGE]: 2,
            [EducationLevel.BACHELORS]: 3,
            [EducationLevel.ADVANCED]: 4
        };

        if (eduRank[this.education] < eduRank[job.requiredEducation || EducationLevel.NO_DEGREE]) {
            return false;
        }

        // Check skill match
        if (job.requiredSkills) {
            const skillMatch = Object.entries(job.requiredSkills).every(([skill, level]) => {
                return (this.skills[skill] || 0) >= level * 0.7; // Allow 70% match
            });
            if (!skillMatch) return false;
        }

        // Check wage expectations (unless desperate)
        if (this.unemploymentDuration < 6 && job.wage < this.reservationWage) {
            return false;
        }

        // Check region (unless willing to relocate)
        if (job.region !== this.region && this.mobilityWillingness < 0.5) {
            return false;
        }

        return true;
    }

    /**
     * Evaluate and potentially accept job offers
     */
    evaluateOffers() {
        if (this.jobOffers.length === 0) return null;

        // Score each offer
        const scoredOffers = this.jobOffers.map(offer => ({
            offer,
            score: this._scoreJobOffer(offer)
        }));

        // Sort by score
        scoredOffers.sort((a, b) => b.score - a.score);

        const bestOffer = scoredOffers[0];

        // Accept if meets reservation wage or if desperate
        if (bestOffer.offer.wage >= this.reservationWage || this.unemploymentDuration > 9) {
            return bestOffer.offer;
        }

        return null;
    }

    _scoreJobOffer(offer) {
        let score = 0;

        // Wage (normalized)
        score += (offer.wage / this.wage) * 40;

        // Location preference
        if (offer.region === this.region) {
            score += 20;
        } else {
            score += this.mobilityWillingness * 10;
        }

        // Job stability (inverse of automation exposure)
        score += (1 - (offer.automationExposure || 0.5)) * 20;

        // Growth potential
        score += (offer.growthPotential || 0.5) * 10;

        // AI augmentation opportunity
        score += (offer.aiAugmentation || 0) * 10;

        return score;
    }

    /**
     * Accept a job offer
     */
    acceptJob(offer, firm) {
        // Record previous job in history if employed
        if (this.status === EmploymentStatus.EMPLOYED && this.employer) {
            this.jobHistory.push({
                employer: this.employer.id,
                occupation: this.occupation,
                wage: this.wage,
                tenure: this.tenure,
                endReason: 'voluntary_quit'
            });
        }

        this.status = EmploymentStatus.EMPLOYED;
        this.employer = firm;
        this.occupation = offer.occupation;
        this.industry = firm.industry;
        this.wage = offer.wage;
        this.tenure = 0;
        this.unemploymentDuration = 0;
        this.activelySearching = false;
        this.jobOffers = [];
        this.jobApplications = [];

        // Reset reservation wage
        this.reservationWage = this.wage * 0.7;

        // Reduce economic anxiety
        this.economicAnxiety = Math.max(0, this.economicAnxiety - 0.2);
    }

    /**
     * Handle being laid off
     */
    layOff(reason = 'automation') {
        // Record in history
        this.jobHistory.push({
            employer: this.employer ? this.employer.id : null,
            occupation: this.occupation,
            wage: this.wage,
            tenure: this.tenure,
            endReason: reason
        });

        this.status = EmploymentStatus.UNEMPLOYED;
        this.employer = null;
        this.tenure = 0;
        this.unemploymentDuration = 0;
        this.unemploymentSpells++;
        this.activelySearching = true;

        // Increase economic anxiety
        this.economicAnxiety = Math.min(1, this.economicAnxiety + 0.3);

        // Update policy support based on layoff reason
        this.policySupport.ubi = Math.min(1, this.policySupport.ubi + 0.15);
        this.policySupport.retraining = Math.min(1, this.policySupport.retraining + 0.12);

        if (reason === 'automation') {
            this.policySupport.aiRegulation = Math.min(1, this.policySupport.aiRegulation + 0.2);
            this.personalAIExperience = AIExperience.NEGATIVE;
            this.harmedByLackOfIntervention = true;
        }

        // Broadcast anxiety to network
        this.network.forEach(contact => {
            if (contact.economicAnxiety !== undefined) {
                contact.economicAnxiety = Math.min(1, contact.economicAnxiety + 0.05);
                contact.policySupport.aiRegulation = Math.min(1, contact.policySupport.aiRegulation + 0.03);
            }
        });
    }

    // ========== Policy Support Updates ==========

    _updatePolicySupport() {
        // Apply network influence
        this._applyNetworkInfluence();

        // Apply ideology bounds
        this._applyIdeologyBounds();

        // Apply trust modifier
        this._applyTrustModifier();

        // Clamp all values
        Object.keys(this.policySupport).forEach(policy => {
            this.policySupport[policy] = Math.max(0, Math.min(1, this.policySupport[policy]));
        });
    }

    _applyNetworkInfluence() {
        if (this.network.length === 0) return;

        this.network.forEach(contact => {
            if (!contact.policySupport) return;

            const influenceWeight = (contact.closeness || 0.5) * this.networkPoliticalInfluence;

            // Opinion convergence
            Object.keys(this.policySupport).forEach(policy => {
                if (contact.policySupport[policy] !== undefined) {
                    const diff = contact.policySupport[policy] - this.policySupport[policy];
                    this.policySupport[policy] += diff * 0.02 * influenceWeight;
                }
            });

            // If contact recently lost job, increase anxiety and UBI support
            if (contact.status === EmploymentStatus.UNEMPLOYED && contact.unemploymentDuration < 3) {
                this.policySupport.ubi += 0.03 * influenceWeight;
                this.economicAnxiety += 0.05 * influenceWeight;
            }
        });
    }

    _applyIdeologyBounds() {
        // Hardship can override ideology
        const ideologyWeight = this.economicAnxiety > 0.7 ? 0.5 : 1.0;

        if (this.ideologicalPrior < 0) {
            // Left-leaning floors
            this.policySupport.ubi = Math.max(this.policySupport.ubi, 0.3 * ideologyWeight);
            this.policySupport.retraining = Math.max(this.policySupport.retraining, 0.4 * ideologyWeight);
            this.policySupport.aiRegulation = Math.max(this.policySupport.aiRegulation, 0.3 * ideologyWeight);
        } else {
            // Right-leaning ceilings (can be overridden by hardship)
            if (this.economicAnxiety < 0.7) {
                this.policySupport.ubi = Math.min(this.policySupport.ubi, 0.6);
                this.policySupport.aiRegulation = Math.min(this.policySupport.aiRegulation, 0.5);
            }
        }
    }

    _applyTrustModifier() {
        if (this.trustInGovernment < 0.3) {
            // Low trust reduces support for government programs (except UBI - direct cash)
            ['retraining', 'publicWorks', 'wageSubsidy'].forEach(policy => {
                this.policySupport[policy] *= 0.7;
            });
        } else if (this.trustInGovernment > 0.7) {
            // High trust boosts support
            Object.keys(this.policySupport).forEach(policy => {
                this.policySupport[policy] = Math.min(1, this.policySupport[policy] * 1.1);
            });
        }
    }

    // ========== Intervention Effects ==========

    /**
     * Receive UBI payment
     */
    receiveUBI(amount) {
        this.savings += amount / this.wage; // Convert to months of expenses
        this.policySupport.ubi = Math.min(1, this.policySupport.ubi + 0.25);
        this.economicAnxiety = Math.max(0, this.economicAnxiety - 0.15);
        this.benefitedFromIntervention = 'ubi';

        // Strong network effect
        this.network.forEach(contact => {
            if (contact.policySupport) {
                contact.policySupport.ubi = Math.min(1, contact.policySupport.ubi + 0.08);
            }
        });
    }

    /**
     * Start a retraining program
     */
    enrollInRetraining(program) {
        this.status = EmploymentStatus.RETRAINING;
        this.retrainingProgram = program;
        this.retrainingProgress = 0;
        this.activelySearching = false;
    }

    /**
     * Experience AI augmentation success
     */
    experienceAISuccess(wageIncrease) {
        this.wage += wageIncrease;
        this.personalAIExperience = AIExperience.POSITIVE;
        this.policySupport.aiRegulation = Math.max(0, this.policySupport.aiRegulation - 0.15);
        this.policySupport.educationInvestment = Math.min(1, this.policySupport.educationInvestment + 0.1);
        this.economicAnxiety = Math.max(0, this.economicAnxiety - 0.1);

        // Network effect
        this.network.forEach(contact => {
            if (contact.policySupport) {
                contact.policySupport.aiRegulation = Math.max(0, contact.policySupport.aiRegulation - 0.02);
            }
        });
    }

    // ========== Getters ==========

    getAgeGroup() {
        if (this.age < 25) return '18-24';
        if (this.age < 35) return '25-34';
        if (this.age < 45) return '35-44';
        if (this.age < 55) return '45-54';
        if (this.age < 65) return '55-64';
        return '65+';
    }

    isEmployed() {
        return this.status === EmploymentStatus.EMPLOYED;
    }

    isUnemployed() {
        return this.status === EmploymentStatus.UNEMPLOYED;
    }

    isInLaborForce() {
        return this.status !== EmploymentStatus.OUT_OF_LABOR_FORCE;
    }

    /**
     * Get summary for aggregation
     */
    getSummary() {
        return {
            id: this.id,
            age: this.age,
            ageGroup: this.getAgeGroup(),
            education: this.education,
            region: this.region,
            status: this.status,
            occupation: this.occupation,
            industry: this.industry,
            wage: this.wage,
            unemploymentDuration: this.unemploymentDuration,
            economicAnxiety: this.economicAnxiety,
            policySupport: { ...this.policySupport }
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { WorkerAgent, EmploymentStatus, EducationLevel, AIExperience };
}
