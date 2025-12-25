/**
 * TrainingProgramAgent - Training program in the Agent-Based Model
 *
 * Each training program has capacity, curriculum, completion rates, and costs.
 * Programs enroll workers, track progress, and graduate students with new skills.
 */

// Program type enum
const ProgramType = {
    BOOTCAMP: 'bootcamp',
    COMMUNITY_COLLEGE: 'community_college',
    UNIVERSITY: 'university',
    EMPLOYER_SPONSORED: 'employer_sponsored',
    ONLINE: 'online'
};

// Program status enum
const ProgramStatus = {
    ACTIVE: 'active',
    FULL: 'full',
    SUSPENDED: 'suspended',
    CLOSED: 'closed'
};

class TrainingProgramAgent {
    constructor(config = {}) {
        // Unique identifier
        this.id = config.id || `prog_${Math.random().toString(36).substr(2, 9)}`;

        // Program type and location
        this.type = config.type || this._randomType();
        this.region = config.region || 1;
        this.name = config.name || this._generateName();

        // Capacity management
        this.maxEnrollment = config.maxEnrollment || this._getDefaultCapacity();
        this.currentEnrollment = 0;
        this.waitlist = [];
        this.enrolledWorkers = [];

        // Program details
        this.targetOccupations = config.targetOccupations || this._getDefaultTargetOccupations();
        this.skillsProvided = config.skillsProvided || this._getDefaultSkills();
        this.duration = config.duration || this._getDefaultDuration(); // Months
        this.cost = config.cost || this._getDefaultCost();
        this.subsidyAvailable = config.subsidyAvailable || 0; // Percentage covered by government

        // Quality metrics
        this.qualityScore = config.qualityScore || (0.5 + Math.random() * 0.4); // 0.5-0.9
        this.completionRate = config.completionRate || this._calculateInitialCompletionRate();
        this.jobPlacementRate = config.jobPlacementRate || this._calculateInitialPlacementRate();
        this.reputation = config.reputation || this.qualityScore * 0.8 + Math.random() * 0.2;

        // Historical tracking
        this.totalGraduates = 0;
        this.totalDropouts = 0;
        this.placementsThisYear = 0;
        this.graduatesThisYear = 0;

        // Monthly tracking for students
        this.studentProgress = new Map(); // workerId -> { enrolledMonth, currentMonth, progress }

        // Program status
        this.status = ProgramStatus.ACTIVE;

        // Financial
        this.revenue = 0;
        this.operatingCosts = this._calculateOperatingCosts();
    }

    // ========== Initialization Helpers ==========

    _randomType() {
        const rand = Math.random();
        if (rand < 0.25) return ProgramType.BOOTCAMP;
        if (rand < 0.45) return ProgramType.COMMUNITY_COLLEGE;
        if (rand < 0.60) return ProgramType.UNIVERSITY;
        if (rand < 0.80) return ProgramType.EMPLOYER_SPONSORED;
        return ProgramType.ONLINE;
    }

    _generateName() {
        const prefixes = {
            [ProgramType.BOOTCAMP]: ['Tech', 'Code', 'Data', 'Digital', 'Cyber'],
            [ProgramType.COMMUNITY_COLLEGE]: ['Central', 'Metro', 'Valley', 'Regional', 'State'],
            [ProgramType.UNIVERSITY]: ['State', 'National', 'Metro', 'Technical', 'Applied'],
            [ProgramType.EMPLOYER_SPONSORED]: ['Corporate', 'Industry', 'Professional', 'Enterprise', 'Business'],
            [ProgramType.ONLINE]: ['Virtual', 'Online', 'Digital', 'Remote', 'eLearning']
        };

        const suffixes = {
            [ProgramType.BOOTCAMP]: ['Bootcamp', 'Academy', 'Institute', 'School', 'Lab'],
            [ProgramType.COMMUNITY_COLLEGE]: ['Community College', 'Technical College', 'College'],
            [ProgramType.UNIVERSITY]: ['University', 'Institute of Technology', 'Polytechnic'],
            [ProgramType.EMPLOYER_SPONSORED]: ['Training Center', 'Skills Program', 'Development Program'],
            [ProgramType.ONLINE]: ['Academy', 'Learning Platform', 'Skills Center']
        };

        const prefix = prefixes[this.type][Math.floor(Math.random() * prefixes[this.type].length)];
        const suffix = suffixes[this.type][Math.floor(Math.random() * suffixes[this.type].length)];

        return `${prefix} ${suffix}`;
    }

    _getDefaultCapacity() {
        const capacities = {
            [ProgramType.BOOTCAMP]: Math.floor(Math.random() * 30) + 20,           // 20-50
            [ProgramType.COMMUNITY_COLLEGE]: Math.floor(Math.random() * 200) + 100, // 100-300
            [ProgramType.UNIVERSITY]: Math.floor(Math.random() * 500) + 200,        // 200-700
            [ProgramType.EMPLOYER_SPONSORED]: Math.floor(Math.random() * 50) + 10,  // 10-60
            [ProgramType.ONLINE]: Math.floor(Math.random() * 1000) + 500            // 500-1500 (scalable)
        };
        return capacities[this.type];
    }

    _getDefaultDuration() {
        const durations = {
            [ProgramType.BOOTCAMP]: Math.floor(Math.random() * 3) + 3,              // 3-6 months
            [ProgramType.COMMUNITY_COLLEGE]: Math.floor(Math.random() * 12) + 12,   // 12-24 months
            [ProgramType.UNIVERSITY]: Math.floor(Math.random() * 24) + 24,          // 24-48 months
            [ProgramType.EMPLOYER_SPONSORED]: Math.floor(Math.random() * 4) + 2,    // 2-6 months
            [ProgramType.ONLINE]: Math.floor(Math.random() * 6) + 3                 // 3-9 months
        };
        return durations[this.type];
    }

    _getDefaultCost() {
        // Monthly cost to student
        const costs = {
            [ProgramType.BOOTCAMP]: Math.floor(Math.random() * 2000) + 2000,        // $2000-4000/month
            [ProgramType.COMMUNITY_COLLEGE]: Math.floor(Math.random() * 500) + 300,  // $300-800/month
            [ProgramType.UNIVERSITY]: Math.floor(Math.random() * 1500) + 1000,       // $1000-2500/month
            [ProgramType.EMPLOYER_SPONSORED]: 0,                                      // Free to employee
            [ProgramType.ONLINE]: Math.floor(Math.random() * 200) + 50               // $50-250/month
        };
        return costs[this.type];
    }

    _getDefaultTargetOccupations() {
        // Return array of occupation IDs this program trains for
        const baseOccupations = [];
        const numOccupations = Math.floor(Math.random() * 5) + 3; // 3-8 occupations

        for (let i = 0; i < numOccupations; i++) {
            baseOccupations.push(Math.floor(Math.random() * 100) + 1);
        }

        return baseOccupations;
    }

    _getDefaultSkills() {
        // Skills provided based on program type
        const skillSets = {
            [ProgramType.BOOTCAMP]: {
                programming: 0.4 + Math.random() * 0.2,
                dataAnalysis: 0.3 + Math.random() * 0.2,
                technical: 0.3 + Math.random() * 0.2,
                problemSolving: 0.2 + Math.random() * 0.1
            },
            [ProgramType.COMMUNITY_COLLEGE]: {
                technical: 0.3 + Math.random() * 0.2,
                communication: 0.2 + Math.random() * 0.1,
                customerService: 0.2 + Math.random() * 0.1,
                manufacturing: 0.2 + Math.random() * 0.2,
                healthcare: 0.15 + Math.random() * 0.15
            },
            [ProgramType.UNIVERSITY]: {
                analytical: 0.3 + Math.random() * 0.2,
                research: 0.3 + Math.random() * 0.2,
                writing: 0.25 + Math.random() * 0.15,
                leadership: 0.2 + Math.random() * 0.1,
                problemSolving: 0.25 + Math.random() * 0.15
            },
            [ProgramType.EMPLOYER_SPONSORED]: {
                technical: 0.35 + Math.random() * 0.2,
                projectManagement: 0.2 + Math.random() * 0.15,
                communication: 0.15 + Math.random() * 0.1
            },
            [ProgramType.ONLINE]: {
                programming: 0.3 + Math.random() * 0.2,
                dataAnalysis: 0.25 + Math.random() * 0.15,
                marketing: 0.2 + Math.random() * 0.1,
                technical: 0.2 + Math.random() * 0.15
            }
        };

        return skillSets[this.type];
    }

    _calculateInitialCompletionRate() {
        // Completion rates vary by program type
        const baseRates = {
            [ProgramType.BOOTCAMP]: 0.70,
            [ProgramType.COMMUNITY_COLLEGE]: 0.55,
            [ProgramType.UNIVERSITY]: 0.60,
            [ProgramType.EMPLOYER_SPONSORED]: 0.85,
            [ProgramType.ONLINE]: 0.35
        };

        const base = baseRates[this.type] || 0.6;
        return base + (Math.random() * 0.2 - 0.1); // +/- 10%
    }

    _calculateInitialPlacementRate() {
        // Job placement rates (of completers)
        const baseRates = {
            [ProgramType.BOOTCAMP]: 0.75,
            [ProgramType.COMMUNITY_COLLEGE]: 0.70,
            [ProgramType.UNIVERSITY]: 0.80,
            [ProgramType.EMPLOYER_SPONSORED]: 0.95,  // Often guaranteed placement
            [ProgramType.ONLINE]: 0.50
        };

        const base = baseRates[this.type] || 0.65;
        return base + (Math.random() * 0.15 - 0.05); // +/- variation
    }

    _calculateOperatingCosts() {
        // Monthly operating costs
        const costs = {
            [ProgramType.BOOTCAMP]: 50000,
            [ProgramType.COMMUNITY_COLLEGE]: 200000,
            [ProgramType.UNIVERSITY]: 500000,
            [ProgramType.EMPLOYER_SPONSORED]: 30000,
            [ProgramType.ONLINE]: 20000
        };

        return costs[this.type] || 50000;
    }

    // ========== Enrollment Management ==========

    /**
     * Check if a worker can enroll in this program
     */
    canEnroll(worker) {
        // Check if program is accepting students
        if (this.status !== ProgramStatus.ACTIVE) {
            return { eligible: false, reason: 'Program not accepting students' };
        }

        // Check capacity
        if (this.currentEnrollment >= this.maxEnrollment) {
            return { eligible: false, reason: 'Program at capacity', canWaitlist: true };
        }

        // Check if worker is already enrolled somewhere
        if (worker.retrainingProgram) {
            return { eligible: false, reason: 'Already enrolled in a program' };
        }

        // Check age (some programs have limits)
        if (this.type === ProgramType.UNIVERSITY && worker.age > 55) {
            return { eligible: false, reason: 'Age restriction' };
        }

        // Check financial ability (unless subsidized or free)
        const effectiveCost = this.cost * (1 - this.subsidyAvailable);
        if (effectiveCost > 0 && worker.savings < (effectiveCost / worker.wage) * this.duration * 0.5) {
            return { eligible: false, reason: 'Insufficient funds' };
        }

        // Check education prerequisites
        if (this.type === ProgramType.UNIVERSITY) {
            const eduRequired = ['high_school', 'some_college', 'bachelors', 'advanced'];
            if (!eduRequired.includes(worker.education)) {
                return { eligible: false, reason: 'Education requirements not met' };
            }
        }

        return { eligible: true };
    }

    /**
     * Enroll a worker in the program
     */
    enrollWorker(worker, currentMonth) {
        const eligibility = this.canEnroll(worker);

        if (!eligibility.eligible) {
            if (eligibility.canWaitlist) {
                this.addToWaitlist(worker);
            }
            return { success: false, reason: eligibility.reason };
        }

        // Enroll the worker
        this.enrolledWorkers.push(worker);
        this.currentEnrollment++;

        // Track student progress
        this.studentProgress.set(worker.id, {
            enrolledMonth: currentMonth,
            currentProgress: 0,
            expectedGraduation: currentMonth + this.duration,
            monthlyProgress: 1 / this.duration
        });

        // Calculate actual cost to worker
        const effectiveCost = this.cost * (1 - this.subsidyAvailable);

        // Update worker state
        worker.enrollInRetraining({
            id: this.id,
            name: this.name,
            type: this.type,
            duration: this.duration,
            skillsProvided: this.skillsProvided,
            monthlyCost: effectiveCost,
            qualityScore: this.qualityScore
        });

        // Track revenue
        this.revenue += effectiveCost;

        // Update status if at capacity
        if (this.currentEnrollment >= this.maxEnrollment) {
            this.status = ProgramStatus.FULL;
        }

        return { success: true, program: this };
    }

    /**
     * Add worker to waitlist
     */
    addToWaitlist(worker) {
        if (!this.waitlist.find(w => w.id === worker.id)) {
            this.waitlist.push({
                worker,
                addedMonth: worker.unemploymentDuration || 0,
                priority: this._calculateWaitlistPriority(worker)
            });

            // Sort by priority
            this.waitlist.sort((a, b) => b.priority - a.priority);
        }
    }

    _calculateWaitlistPriority(worker) {
        let priority = 0;

        // Higher priority for unemployed
        if (worker.status === 'unemployed') {
            priority += 30;
            priority += Math.min(20, worker.unemploymentDuration * 2);
        }

        // Higher priority for younger workers (more years to benefit)
        priority += Math.max(0, (60 - worker.age) / 2);

        // Higher priority for those with lower savings (more urgent need)
        priority += Math.max(0, 10 - worker.savings);

        return priority;
    }

    // ========== Monthly Operations ==========

    /**
     * Process monthly program operations
     */
    processMonth(currentMonth, interventions = {}) {
        const results = {
            graduates: [],
            dropouts: [],
            newEnrollments: [],
            waitlistProcessed: 0
        };

        // Update student progress
        const studentsToProcess = [...this.enrolledWorkers];

        studentsToProcess.forEach(worker => {
            const progress = this.studentProgress.get(worker.id);
            if (!progress) return;

            // Advance progress
            progress.currentProgress += progress.monthlyProgress;

            // Check for graduation
            if (progress.currentProgress >= 1.0) {
                const graduated = this._graduateStudent(worker, currentMonth);
                if (graduated) {
                    results.graduates.push(worker);
                }
            }
            // Check for dropout
            else if (this._shouldDropout(worker, progress)) {
                this._handleDropout(worker, currentMonth);
                results.dropouts.push(worker);
            }
        });

        // Process waitlist if spots available
        if (this.currentEnrollment < this.maxEnrollment && this.waitlist.length > 0) {
            results.waitlistProcessed = this._processWaitlist(currentMonth);
        }

        // Update quality metrics based on outcomes
        this._updateQualityMetrics();

        // Update status
        if (this.currentEnrollment < this.maxEnrollment && this.status === ProgramStatus.FULL) {
            this.status = ProgramStatus.ACTIVE;
        }

        return results;
    }

    _graduateStudent(worker, currentMonth) {
        // Remove from enrollment
        this.enrolledWorkers = this.enrolledWorkers.filter(w => w.id !== worker.id);
        this.studentProgress.delete(worker.id);
        this.currentEnrollment--;

        // Update program stats
        this.totalGraduates++;
        this.graduatesThisYear++;

        // Apply skills to worker
        if (worker.skills && this.skillsProvided) {
            Object.entries(this.skillsProvided).forEach(([skill, value]) => {
                const currentSkill = worker.skills[skill] || 0;
                // Quality affects how much skill is gained
                const effectiveGain = value * this.qualityScore;
                worker.skills[skill] = Math.min(1, currentSkill + effectiveGain);
            });
        }

        // Boost AI augmentation skill
        if (worker.aiAugmentationSkill !== undefined) {
            worker.aiAugmentationSkill = Math.min(1, worker.aiAugmentationSkill + 0.15 * this.qualityScore);
        }

        // Update worker state
        if (typeof worker._completeRetraining === 'function') {
            worker._completeRetraining();
        } else {
            // Manual completion if method doesn't exist
            worker.status = 'unemployed';
            worker.retrainingProgram = null;
            worker.retrainingProgress = 0;
            worker.activelySearching = true;
        }

        // Track placement (simplified - actual placement tracked by labor market)
        if (Math.random() < this.jobPlacementRate) {
            this.placementsThisYear++;
        }

        return true;
    }

    _shouldDropout(worker, progress) {
        // Base dropout probability per month
        let dropoutProb = (1 - this.completionRate) / this.duration;

        // Financial pressure increases dropout
        if (worker.savings <= 0) {
            dropoutProb *= 3;
        } else if (worker.savings < 2) {
            dropoutProb *= 1.5;
        }

        // Online programs have higher dropout
        if (this.type === ProgramType.ONLINE) {
            dropoutProb *= 1.5;
        }

        // Quality programs have lower dropout
        dropoutProb *= (1.5 - this.qualityScore);

        // Longer unemployment before enrollment reduces dropout (more motivated)
        if (worker.unemploymentSpells > 0) {
            dropoutProb *= 0.8;
        }

        return Math.random() < dropoutProb;
    }

    _handleDropout(worker, currentMonth) {
        // Remove from enrollment
        this.enrolledWorkers = this.enrolledWorkers.filter(w => w.id !== worker.id);
        this.studentProgress.delete(worker.id);
        this.currentEnrollment--;

        // Update program stats
        this.totalDropouts++;

        // Update worker state
        if (typeof worker._dropoutRetraining === 'function') {
            worker._dropoutRetraining();
        } else {
            worker.status = 'unemployed';
            worker.retrainingProgram = null;
            worker.retrainingProgress = 0;
            worker.activelySearching = true;
        }
    }

    _processWaitlist(currentMonth) {
        let processed = 0;
        const spotsAvailable = this.maxEnrollment - this.currentEnrollment;

        while (this.waitlist.length > 0 && processed < spotsAvailable) {
            const entry = this.waitlist.shift();
            const worker = entry.worker;

            // Check if worker is still eligible
            if (worker.status === 'unemployed' || worker.wantsRetraining) {
                const result = this.enrollWorker(worker, currentMonth);
                if (result.success) {
                    processed++;
                }
            }
        }

        return processed;
    }

    _updateQualityMetrics() {
        // Update completion rate based on recent performance
        if (this.totalGraduates + this.totalDropouts > 10) {
            const recentCompletion = this.totalGraduates / (this.totalGraduates + this.totalDropouts);
            // Smooth update
            this.completionRate = this.completionRate * 0.9 + recentCompletion * 0.1;
        }

        // Update reputation based on quality and outcomes
        const outcomeScore = (this.completionRate + this.jobPlacementRate) / 2;
        this.reputation = this.reputation * 0.95 + outcomeScore * 0.05;
    }

    // ========== Program Adjustments ==========

    /**
     * Update program based on market conditions
     */
    respondToMarket(marketConditions) {
        const { demandedSkills, unemploymentRate, aiAdoptionRate } = marketConditions;

        // If high unemployment, increase capacity if possible
        if (unemploymentRate > 0.08 && this.currentEnrollment > this.maxEnrollment * 0.8) {
            // Try to expand
            this.maxEnrollment = Math.floor(this.maxEnrollment * 1.1);
        }

        // Adjust skills offered based on demand
        if (demandedSkills && aiAdoptionRate > 0.3) {
            // Increase AI-related skills
            if (this.skillsProvided.programming) {
                this.skillsProvided.programming = Math.min(1, this.skillsProvided.programming * 1.05);
            }
            if (this.skillsProvided.dataAnalysis) {
                this.skillsProvided.dataAnalysis = Math.min(1, this.skillsProvided.dataAnalysis * 1.05);
            }
        }
    }

    /**
     * Apply government intervention (e.g., increased funding)
     */
    receiveSubsidy(subsidyLevel) {
        this.subsidyAvailable = Math.min(1, subsidyLevel);

        // With more subsidy, can potentially expand capacity
        if (subsidyLevel > 0.5) {
            this.maxEnrollment = Math.floor(this.maxEnrollment * 1.2);
        }
    }

    // ========== Getters ==========

    /**
     * Get program summary for reporting
     */
    getSummary() {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            region: this.region,
            status: this.status,
            enrollment: {
                current: this.currentEnrollment,
                max: this.maxEnrollment,
                waitlist: this.waitlist.length
            },
            metrics: {
                completionRate: this.completionRate,
                jobPlacementRate: this.jobPlacementRate,
                qualityScore: this.qualityScore,
                reputation: this.reputation
            },
            program: {
                duration: this.duration,
                cost: this.cost,
                subsidyAvailable: this.subsidyAvailable,
                effectiveCost: this.cost * (1 - this.subsidyAvailable)
            },
            outcomes: {
                totalGraduates: this.totalGraduates,
                totalDropouts: this.totalDropouts,
                graduatesThisYear: this.graduatesThisYear,
                placementsThisYear: this.placementsThisYear
            },
            skillsProvided: this.skillsProvided
        };
    }

    /**
     * Get available capacity
     */
    getAvailableCapacity() {
        return Math.max(0, this.maxEnrollment - this.currentEnrollment);
    }

    /**
     * Check if accepting applications
     */
    isAcceptingApplications() {
        return this.status === ProgramStatus.ACTIVE && this.currentEnrollment < this.maxEnrollment;
    }

    /**
     * Get effective cost for a worker (accounting for subsidies)
     */
    getEffectiveCost() {
        return this.cost * (1 - this.subsidyAvailable);
    }

    /**
     * Calculate expected ROI for a worker
     */
    calculateROIForWorker(worker) {
        const totalCost = this.getEffectiveCost() * this.duration;
        const expectedWageIncrease = worker.wage * 0.25 * this.qualityScore; // Assume 25% wage boost * quality
        const yearsRemaining = Math.max(1, 65 - worker.age - (this.duration / 12));
        const successProbability = this.completionRate * this.jobPlacementRate;

        const expectedBenefit = expectedWageIncrease * 12 * yearsRemaining * successProbability;

        return {
            cost: totalCost,
            expectedBenefit,
            roi: totalCost > 0 ? expectedBenefit / totalCost : Infinity,
            paybackYears: expectedWageIncrease > 0 ? totalCost / (expectedWageIncrease * 12) : Infinity,
            successProbability
        };
    }
}

// Export for ES modules
export { TrainingProgramAgent, ProgramType, ProgramStatus };

// Also export to window for backwards compatibility with script tags
if (typeof window !== 'undefined') {
    window.TrainingProgramAgent = TrainingProgramAgent;
    window.ProgramType = ProgramType;
    window.ProgramStatus = ProgramStatus;
}
