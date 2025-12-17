# Agent-Based Labor Market Simulation Architecture

## Executive Summary

This document describes an Agent-Based Modeling (ABM) system for simulating AI's impact on labor markets. The system models millions of individual workers and thousands of firms making autonomous decisions, enabling emergent behaviors that aggregate models miss.

---

## 1. System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ABM SIMULATION ENGINE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                  │
│  │   WORKERS    │    │    FIRMS     │    │  TRAINING    │                  │
│  │  (1M agents) │◄──►│ (50K agents) │◄──►│  PROGRAMS    │                  │
│  │              │    │              │    │ (500 agents) │                  │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘                  │
│         │                   │                   │                          │
│         └───────────────────┼───────────────────┘                          │
│                             ▼                                              │
│                    ┌────────────────┐                                      │
│                    │  LABOR MARKET  │                                      │
│                    │  ENVIRONMENT   │                                      │
│                    │                │                                      │
│                    │ • Job Postings │                                      │
│                    │ • Wage Signals │                                      │
│                    │ • AI Frontier  │                                      │
│                    │ • Regions (50) │                                      │
│                    └────────────────┘                                      │
│                             │                                              │
│         ┌───────────────────┼───────────────────┐                          │
│         ▼                   ▼                   ▼                          │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                  │
│  │   POLICY     │    │  SIMULATION  │    │   OUTPUT     │                  │
│  │ INTERVENTIONS│───►│    CLOCK     │───►│  COLLECTOR   │                  │
│  │              │    │  (monthly)   │    │              │                  │
│  └──────────────┘    └──────────────┘    └──────────────┘                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │     AI ANALYSIS LAYER         │
                    │  (3-5 API calls per scenario) │
                    │                               │
                    │  • Parameter Generation       │
                    │  • Pattern Detection          │
                    │  • Results Interpretation     │
                    └───────────────────────────────┘
```

---

## 2. Agent Specifications

### 2.1 Worker Agents (1,000,000 agents)

Each worker is an autonomous agent with attributes and decision-making capabilities.

#### Attributes

```javascript
class WorkerAgent {
    // Demographics
    id: string;                    // Unique identifier
    age: number;                   // 18-70
    education: EducationLevel;     // NO_DEGREE | HIGH_SCHOOL | SOME_COLLEGE | BACHELORS | ADVANCED
    region: RegionId;              // 1-50 (US states)

    // Employment
    status: EmploymentStatus;      // EMPLOYED | UNEMPLOYED | RETRAINING | OUT_OF_LABOR_FORCE
    occupation: OccupationId;      // 1-100 (mapped to O*NET)
    industry: IndustryId;          // 1-20 sectors
    employer: FirmId | null;       // Current employer
    tenure: number;                // Months at current job

    // Skills & Capabilities
    skills: SkillVector;           // 20-dimension vector (technical, interpersonal, cognitive, etc.)
    aiAugmentationSkill: number;   // 0-1: Ability to work WITH AI tools
    adaptability: number;          // 0-1: Learning speed for new skills

    // Economics
    wage: number;                  // Monthly wage
    savings: number;               // Months of expenses saved
    reservationWage: number;       // Minimum acceptable wage

    // Behavioral
    riskTolerance: number;         // 0-1: Willingness to take career risks
    mobilityWillingness: number;   // 0-1: Willingness to relocate
    networkSize: number;           // Number of connections (affects job search)
    informationLevel: number;      // 0-1: Awareness of AI trends and opportunities

    // History
    unemploymentSpells: number;    // Count of unemployment periods
    retrainingHistory: RetrainingRecord[];
    jobHistory: JobRecord[];

    // Political / Policy Support (0-1 scale: 0 = strongly oppose, 0.5 = neutral, 1 = strongly support)
    policySupport: {
        ubi: number;                   // Universal Basic Income
        retraining: number;            // Job Retraining Programs
        wageSubsidy: number;           // Wage Subsidies for Employers
        reducedWorkWeek: number;       // Reduced Work Week / Job Sharing
        publicWorks: number;           // Government Job Creation
        eitcExpansion: number;         // Earned Income Tax Credit Expansion
        aiRegulation: number;          // AI/Automation Regulation/Taxes
        tradeProtection: number;       // Trade/Offshoring Restrictions
        educationInvestment: number;   // Education & Skills Investment
    };

    // Political behavioral factors
    politicalEngagement: number;   // 0-1: Likelihood to vote, protest, advocate
    ideologicalPrior: number;      // -1 to 1: Pre-existing left/right lean (affects baseline support)
    economicAnxiety: number;       // 0-1: Current level of economic worry
    trustInGovernment: number;     // 0-1: Belief that government can help
    networkPoliticalInfluence: number; // How much network affects views

    // Experience-based sentiment
    personalAIExperience: 'positive' | 'negative' | 'neutral' | 'none';
    benefitedFromIntervention: InterventionType | null;
    harmedByLackOfIntervention: boolean;
}
```

#### Worker Decision Tree

```
Every Month, Each Worker Evaluates:

IF employed:
    ├── Calculate displacement_risk based on:
    │   • Occupation automation exposure
    │   • Employer AI adoption status
    │   • Personal AI augmentation skill
    │   • Tenure (longer = more vulnerable in some cases)
    │
    ├── IF displacement_risk > threshold (varies by risk_tolerance):
    │   ├── Search for new job? (based on savings, alternatives)
    │   ├── Start retraining? (based on ROI calculation)
    │   └── Stay and hope? (default for risk-averse)
    │
    ├── IF wage < market_rate * 0.8:
    │   └── Search for better job
    │
    └── IF received_layoff_notice:
        ├── Claim unemployment benefits
        ├── Begin job search
        └── Consider retraining

IF unemployed:
    ├── Search for jobs (intensity based on savings, desperation)
    │   • Apply to jobs matching skills
    │   • Consider jobs below skill level if desperate
    │   • Geographic search radius expands over time
    │
    ├── IF unemployment_duration > 6 months:
    │   ├── Consider retraining (if savings allow)
    │   ├── Expand job search criteria
    │   └── Consider relocation
    │
    └── IF unemployment_duration > 18 months AND age > 55:
        └── Risk of dropping out of labor force

IF retraining:
    ├── Progress through program
    ├── IF completed:
    │   ├── Update skills
    │   ├── Return to job search
    │   └── Target new occupation
    └── IF dropped_out (financial pressure, etc.):
        └── Return to job search with partial skills
```

#### Policy Support Decision Tree

```
Every Month, Each Worker Updates Policy Support:

┌─────────────────────────────────────────────────────────────────────────────┐
│                    POLICY SUPPORT UPDATE ALGORITHM                          │
└─────────────────────────────────────────────────────────────────────────────┘

FOR EACH policy IN [ubi, retraining, wageSubsidy, ...]:

    1. CALCULATE base_shift from PERSONAL EXPERIENCE:

       IF just_lost_job:
           ├── ubi_support         += 0.15
           ├── retraining_support  += 0.10
           ├── wageSubsidy_support += 0.08
           ├── aiRegulation_support += 0.12
           └── economicAnxiety     += 0.25

       IF unemployed_duration > 3_months:
           ├── ubi_support         += 0.02/month (compounding anxiety)
           ├── publicWorks_support += 0.03/month
           └── trustInGovernment   -= 0.01/month (if no help received)

       IF found_job_after_unemployment:
           ├── economicAnxiety     -= 0.20
           └── IF used_retraining:
               └── retraining_support += 0.15 (it worked for me!)
           └── IF found_without_help:
               └── ubi_support     -= 0.05 (I did it myself)

       IF wage_declined > 10%:
           ├── wageSubsidy_support += 0.08
           ├── eitc_support        += 0.10
           └── aiRegulation_support += 0.05

       IF wage_increased (AI augmentation success):
           ├── aiRegulation_support -= 0.10 (AI helped me!)
           └── educationInvestment  += 0.08 (skills matter)

       IF savings_depleted:
           ├── ubi_support         += 0.20
           ├── economicAnxiety     += 0.30
           └── ALL support         += 0.05 (desperate for any help)

    2. APPLY network_influence (social contagion):

       FOR connection IN worker.network:
           influence_weight = connection.closeness * worker.networkPoliticalInfluence

           IF connection.recently_lost_job:
               ├── ubi_support     += 0.03 * influence_weight
               └── economicAnxiety += 0.05 * influence_weight

           IF connection.benefited_from_intervention:
               └── that_intervention_support += 0.04 * influence_weight

           // Opinion convergence (echo chambers)
           policy_diff = connection.policySupport[policy] - worker.policySupport[policy]
           worker.policySupport[policy] += policy_diff * 0.02 * influence_weight

    3. APPLY ideological_prior (sticky beliefs):

       // Left-leaning workers more receptive to government programs
       IF worker.ideologicalPrior < 0:  // Left-leaning
           ├── ubi_support_floor         = 0.3
           ├── retraining_support_floor  = 0.4
           └── aiRegulation_support_floor = 0.3

       // Right-leaning workers prefer market solutions
       IF worker.ideologicalPrior > 0:  // Right-leaning
           ├── ubi_support_ceiling       = 0.6 (unless personally affected)
           ├── aiRegulation_ceiling      = 0.5
           └── educationInvestment bias toward private solutions

       // BUT personal hardship can override ideology
       IF economicAnxiety > 0.7:
           └── ideology_weight *= 0.5 (survival > ideology)

    4. APPLY trust_in_government modifier:

       IF trustInGovernment < 0.3:
           ├── ALL government_program_support *= 0.7
           └── EXCEPT ubi (direct cash = harder to mess up)

       IF trustInGovernment > 0.7:
           └── ALL government_program_support *= 1.1

    5. APPLY information_effects:

       IF worker.informationLevel > 0.7:  // Well-informed about AI
           ├── More nuanced policy views
           ├── Support based on evidence, not just emotion
           └── Less susceptible to network panic

       IF worker.informationLevel < 0.3:  // Low awareness
           ├── Reactive to personal experience only
           ├── Higher network influence weight
           └── More volatile opinion swings

    6. CLAMP all values to [0, 1]
```

#### Policy Support Triggers (Event-Driven)

```javascript
// Major life events cause immediate policy support shifts

class PolicySupportEvents {

    onJobLoss(worker: WorkerAgent, reason: 'automation' | 'downsizing' | 'other') {
        worker.economicAnxiety += 0.30;
        worker.policySupport.ubi += 0.15;
        worker.policySupport.retraining += 0.12;

        if (reason === 'automation') {
            worker.policySupport.aiRegulation += 0.20;
            worker.personalAIExperience = 'negative';
            worker.harmedByLackOfIntervention = true;
        }

        // Broadcast to network
        for (const contact of worker.network) {
            contact.economicAnxiety += 0.05;
            contact.policySupport.aiRegulation += 0.03;
        }
    }

    onRetrainingSuccess(worker: WorkerAgent) {
        worker.policySupport.retraining += 0.20;
        worker.policySupport.educationInvestment += 0.15;
        worker.benefitedFromIntervention = 'retraining';
        worker.trustInGovernment += 0.10;

        // Positive network effect
        for (const contact of worker.network) {
            contact.policySupport.retraining += 0.05;
        }
    }

    onRetrainingFailure(worker: WorkerAgent) {
        worker.policySupport.retraining -= 0.15;
        worker.trustInGovernment -= 0.15;
        worker.policySupport.ubi += 0.10; // Maybe just give cash instead

        // Negative network effect
        for (const contact of worker.network) {
            contact.policySupport.retraining -= 0.03;
        }
    }

    onUBIReceived(worker: WorkerAgent, amount: number) {
        worker.policySupport.ubi += 0.25;
        worker.economicAnxiety -= 0.15;
        worker.benefitedFromIntervention = 'ubi';

        // Strong network effect (everyone talks about getting money)
        for (const contact of worker.network) {
            contact.policySupport.ubi += 0.08;
        }
    }

    onWageSubsidyHelped(worker: WorkerAgent) {
        // Worker kept job due to employer receiving subsidy
        worker.policySupport.wageSubsidy += 0.15;
        worker.benefitedFromIntervention = 'wageSubsidy';
    }

    onAIAugmentationSuccess(worker: WorkerAgent, wageIncrease: number) {
        worker.personalAIExperience = 'positive';
        worker.policySupport.aiRegulation -= 0.15;
        worker.policySupport.educationInvestment += 0.10;
        worker.economicAnxiety -= 0.10;

        // Network sees AI can be good
        for (const contact of worker.network) {
            contact.policySupport.aiRegulation -= 0.02;
        }
    }

    onNeighborhoodDecline(worker: WorkerAgent, localUnemploymentSpike: number) {
        // Community-level effects
        worker.economicAnxiety += localUnemploymentSpike * 0.5;
        worker.policySupport.publicWorks += 0.10;
        worker.policySupport.ubi += 0.08;
        worker.politicalEngagement += 0.05; // More likely to vote/protest
    }

    onMediaEvent(workers: WorkerAgent[], event: MediaEvent) {
        // Mass layoff announcement, policy debate, etc.
        const affectedWorkers = workers.filter(w =>
            w.informationLevel > 0.5 || // Informed workers hear about it
            w.industry === event.relevantIndustry // Directly relevant
        );

        for (const worker of affectedWorkers) {
            const impact = event.salience * (1 - worker.informationLevel * 0.3); // Informed = less reactive
            worker.policySupport[event.relevantPolicy] += event.direction * impact;
        }
    }
}
```

#### Aggregate Political Feasibility Metric

```javascript
class PoliticalFeasibilityTracker {

    calculateFeasibility(policy: InterventionType, workers: WorkerAgent[]): PoliticalFeasibility {
        // Calculate support distribution
        const supportLevels = workers.map(w => w.policySupport[policy]);
        const meanSupport = mean(supportLevels);
        const medianSupport = median(supportLevels);
        const strongSupport = supportLevels.filter(s => s > 0.7).length / workers.length;
        const strongOppose = supportLevels.filter(s => s < 0.3).length / workers.length;

        // Weight by political engagement (engaged people matter more politically)
        const engagementWeightedSupport = workers.reduce((sum, w) =>
            sum + w.policySupport[policy] * w.politicalEngagement, 0
        ) / workers.reduce((sum, w) => sum + w.politicalEngagement, 0);

        // Regional variation
        const regionalSupport = {};
        for (const region of regions) {
            const regionalWorkers = workers.filter(w => w.region === region.id);
            regionalSupport[region.id] = mean(regionalWorkers.map(w => w.policySupport[policy]));
        }

        // Demographic breakdowns
        const demographicSupport = {
            byAge: this.calculateByAge(workers, policy),
            byEducation: this.calculateByEducation(workers, policy),
            byEmploymentStatus: this.calculateByStatus(workers, policy),
            byIncome: this.calculateByIncome(workers, policy)
        };

        // Political feasibility score (0-100)
        const feasibilityScore = this.calculateScore(
            meanSupport,
            strongSupport,
            strongOppose,
            engagementWeightedSupport
        );

        return {
            policy,
            meanSupport,
            medianSupport,
            strongSupport,       // % strongly in favor
            strongOppose,        // % strongly opposed
            engagementWeighted: engagementWeightedSupport,
            feasibilityScore,
            feasibilityLabel: this.getLabel(feasibilityScore),
            regionalSupport,
            demographicSupport,
            momentum: this.calculateMomentum(policy), // Is support growing or shrinking?
            volatility: standardDeviation(supportLevels)
        };
    }

    getLabel(score: number): string {
        if (score >= 80) return 'Highly Feasible - Strong mandate';
        if (score >= 65) return 'Feasible - Majority support';
        if (score >= 50) return 'Contested - Close call';
        if (score >= 35) return 'Difficult - Significant opposition';
        return 'Unlikely - Strong opposition';
    }
}
```

---

### 2.2 Firm Agents (50,000 agents)

#### Attributes

```javascript
class FirmAgent {
    // Identity
    id: string;
    industry: IndustryId;
    region: RegionId;
    size: FirmSize;                // SMALL (<50) | MEDIUM (50-500) | LARGE (500-5000) | ENTERPRISE (5000+)

    // Workforce
    employees: WorkerId[];
    openPositions: JobPosting[];

    // AI Adoption
    aiAdoptionStatus: AIStatus;    // NONE | EXPLORING | PILOTING | SCALING | MATURE
    aiCapabilities: AICapabilityVector;  // Which AI tools deployed
    automationLevel: number;       // 0-1: % of automatable tasks automated

    // Economics
    revenue: number;
    laborCosts: number;
    aiInvestment: number;
    profitMargin: number;

    // Behavioral
    innovativeness: number;        // 0-1: Early vs late adopter
    laborStrategy: LaborStrategy;  // COST_MINIMIZER | TALENT_INVESTOR | BALANCED

    // Competition
    marketShare: number;
    competitors: FirmId[];
    competitorAIAdoption: number;  // Observed AI adoption of competitors
}
```

#### Firm Decision Tree

```
Every Month, Each Firm Evaluates:

AI ADOPTION DECISION:
├── Calculate AI_ROI:
│   • Potential labor cost savings
│   • Implementation costs
│   • Productivity gains
│   • Competitive pressure (if competitors adopting)
│
├── IF AI_ROI > threshold (varies by innovativeness):
│   ├── IF status == NONE: → Move to EXPLORING
│   ├── IF status == EXPLORING: → Move to PILOTING (6-12 month delay)
│   ├── IF status == PILOTING: → Move to SCALING (if pilot successful)
│   └── IF status == SCALING: → Move to MATURE
│
└── Social learning: Observe competitor outcomes, adjust expectations

HIRING DECISION:
├── Calculate labor_need based on:
│   • Current workload
│   • Growth projections
│   • AI augmentation of existing workers
│
├── IF labor_need > current_employees:
│   ├── Post job openings
│   ├── Set wage based on market + urgency
│   └── Define skill requirements (may prioritize AI skills)
│
└── IF labor_need < current_employees (OR AI can replace):
    ├── Layoff decision (last hired, highest paid, or automatable roles)
    ├── Offer voluntary separation
    └── Implement hiring freeze

WAGE DECISION:
├── IF hard to fill positions:
│   └── Raise wages
├── IF easy to fill OR AI reducing need:
│   └── Hold or reduce wages
└── Adjust by skill category (AI skills command premium)
```

### 2.3 Training Program Agents (500 agents)

```javascript
class TrainingProgramAgent {
    id: string;
    type: ProgramType;             // BOOTCAMP | COMMUNITY_COLLEGE | UNIVERSITY | EMPLOYER_SPONSORED | ONLINE
    region: RegionId;

    // Capacity
    maxEnrollment: number;
    currentEnrollment: number;
    waitlist: WorkerId[];

    // Program Details
    targetOccupations: OccupationId[];
    skillsProvided: SkillVector;
    duration: number;              // Months
    cost: number;
    completionRate: number;        // Historical
    jobPlacementRate: number;      // Historical

    // Quality
    qualityScore: number;          // 0-1
    reputation: number;            // Affects enrollment demand
}
```

---

## 3. Environment & Market Mechanisms

### 3.1 Labor Market Matching

```javascript
class LaborMarket {
    // Job postings from firms
    jobPostings: JobPosting[];

    // Job applications from workers
    applications: Application[];

    // Matching algorithm runs each month
    matchJobs() {
        // 1. Workers search and apply
        for (worker of unemployedWorkers) {
            const visibleJobs = this.getVisibleJobs(worker);  // Based on network, region, search intensity
            const suitableJobs = visibleJobs.filter(job => this.isQualified(worker, job));
            worker.apply(suitableJobs.slice(0, worker.applicationLimit));
        }

        // 2. Firms evaluate and hire
        for (firm of firmsWithOpenings) {
            const applicants = this.getApplicants(firm);
            const ranked = firm.rankApplicants(applicants);  // Based on skills, wage demands, etc.
            firm.makeOffers(ranked.slice(0, firm.openPositions));
        }

        // 3. Workers accept/reject offers
        for (worker of workersWithOffers) {
            const bestOffer = worker.evaluateOffers();
            if (bestOffer.wage >= worker.reservationWage) {
                worker.acceptOffer(bestOffer);
            }
        }
    }
}
```

### 3.2 AI Capability Frontier

```javascript
class AICapabilityFrontier {
    // Tracks what AI can do over time
    capabilities: {
        [taskType: string]: {
            automationPotential: number;    // 0-1: Can AI do this?
            deploymentLevel: number;        // 0-1: Is AI being used for this?
            costEffectiveness: number;      // When does AI become cheaper than humans?
        }
    };

    // Advances each month based on scenario settings
    advance(month: number, scenario: Scenario) {
        // S-curve or exponential advancement
        // Different capabilities advance at different rates
    }
}
```

### 3.3 Regional Markets

```javascript
class Region {
    id: RegionId;
    name: string;                  // "California", "Texas", etc.

    // Economic characteristics
    costOfLiving: number;
    industryMix: IndustryDistribution;
    unemploymentRate: number;
    averageWage: number;

    // Labor market
    localWorkers: WorkerId[];
    localFirms: FirmId[];
    localTrainingPrograms: ProgramId[];

    // Migration
    inMigration: number;
    outMigration: number;
    attractiveness: number;        // Based on jobs, wages, cost of living
}
```

---

## 4. Simulation Loop

```javascript
class ABMSimulationEngine {

    async runSimulation(scenario: Scenario): SimulationResults {
        // Initialize agents
        const workers = this.initializeWorkers(scenario);      // 1M agents
        const firms = this.initializeFirms(scenario);          // 50K agents
        const programs = this.initializeTrainingPrograms();    // 500 agents
        const market = new LaborMarket(workers, firms);
        const aiCapability = new AICapabilityFrontier(scenario);

        const results = new ResultsCollector();

        // Main simulation loop
        for (let month = 0; month < scenario.durationMonths; month++) {

            // 1. Advance AI capabilities
            aiCapability.advance(month, scenario);

            // 2. Firms make AI adoption decisions
            for (const firm of firms) {
                firm.evaluateAIAdoption(aiCapability, market.getCompetitorInfo(firm));
            }

            // 3. Firms make hiring/layoff decisions
            for (const firm of firms) {
                firm.makeWorkforceDecisions(aiCapability);
            }

            // 4. Workers evaluate their situations
            for (const worker of workers) {
                worker.evaluateSituation(market, aiCapability);
            }

            // 5. Labor market matching
            market.matchJobs();

            // 6. Training program operations
            for (const program of programs) {
                program.processEnrollment();
                program.graduateStudents();
            }

            // 7. Apply policy interventions
            this.applyInterventions(scenario.interventions, workers, firms, month);

            // 8. Collect metrics
            results.collect(month, workers, firms, market);

            // 9. Information diffusion (workers learn about AI, share job info)
            this.diffuseInformation(workers);
        }

        return results.finalize();
    }
}
```

### 4.1 Performance Optimization

Running 1M+ agents requires optimization:

```javascript
// Strategy 1: Spatial partitioning by region
class RegionalPartition {
    // Only match workers with local firms (95% of matches)
    // Occasional cross-region matching for relocators
}

// Strategy 2: Agent sampling for decisions
class DecisionSampler {
    // Not every agent decides every month
    // Sample 10% of employed workers for job-search decisions
    // All unemployed workers are active every month
}

// Strategy 3: Web Workers for parallelism
class ParallelSimulation {
    // Distribute regions across Web Workers
    // Synchronize at end of each month
}

// Strategy 4: TypedArrays for agent data
class AgentPool {
    // Store agent attributes in TypedArrays
    // Much faster iteration than object arrays
    ages: Uint8Array;           // 1M entries
    wages: Float32Array;        // 1M entries
    skills: Float32Array;       // 1M × 20 entries
}
```

Expected performance:
- **Browser (single thread)**: ~30 seconds for 10-year simulation
- **Browser (Web Workers)**: ~8 seconds
- **Node.js server**: ~2 seconds

---

## 5. AI Integration Points

### 5.1 API Call #1: Agent Behavior Calibration (Pre-simulation)

```javascript
async function calibrateAgentBehaviors(scenario: Scenario): AgentParameters {
    const prompt = `
    Given this labor market scenario:
    - AI adoption rate: ${scenario.aiAdoption}%
    - Automation pace: ${scenario.automationPace}
    - Time horizon: ${scenario.years} years
    - Active interventions: ${scenario.interventions.map(i => i.type).join(', ')}

    Calibrate realistic agent behavior parameters:

    1. Worker decision thresholds:
       - At what displacement risk level do workers start job searching? (0-1)
       - At what savings level do workers consider retraining? (months)
       - How does age affect retraining willingness? (multiplier by age group)
       - Geographic mobility willingness by age and family status

    2. Firm decision thresholds:
       - AI ROI threshold for adoption by firm size
       - Layoff propensity when AI is available
       - Wage adjustment speed

    3. Information diffusion rates:
       - How fast does AI awareness spread?
       - Network effects on job search success

    Return as JSON with specific numeric parameters.
    `;

    const response = await geminiAPI.generate(prompt);
    return parseParameters(response);
}
```

### 5.2 API Call #2: Occupation-AI Mapping (Pre-simulation)

```javascript
async function mapOccupationsToAI(occupations: Occupation[]): OccupationAIMapping {
    const prompt = `
    For each occupation, estimate AI impact parameters:

    ${occupations.map(o => `- ${o.title} (${o.id})`).join('\n')}

    For each, provide:
    1. automation_exposure: 0-1 (what % of tasks can AI do?)
    2. augmentation_potential: 0-1 (how much can AI boost productivity?)
    3. displacement_timeline: months until significant job loss
    4. new_skills_needed: array of skills to remain competitive
    5. transition_paths: array of occupations this role could transition to

    Base on current AI capabilities (LLMs, computer vision, robotics) and
    realistic 5-year projections.

    Return as JSON array.
    `;

    const response = await geminiAPI.generate(prompt);
    return parseOccupationMapping(response);
}
```

### 5.3 API Call #3: Emergent Pattern Detection (Mid-simulation, optional)

```javascript
async function detectEmergentPatterns(
    monthlySnapshots: SimulationSnapshot[]
): PatternAnalysis {
    const prompt = `
    Analyze these monthly labor market snapshots for emergent patterns:

    ${JSON.stringify(summarizeSnapshots(monthlySnapshots))}

    Identify:
    1. Tipping points: Months where dynamics shifted suddenly
    2. Feedback loops: Self-reinforcing patterns (positive or negative)
    3. Unexpected outcomes: Results that differ from simple projections
    4. Regional divergence: Areas doing much better or worse than average
    5. Demographic surprises: Groups affected differently than expected

    Explain the causal mechanisms behind each pattern.
    `;

    const response = await geminiAPI.generate(prompt);
    return parsePatternAnalysis(response);
}
```

### 5.4 API Call #4: Results Interpretation (Post-simulation)

```javascript
async function interpretResults(results: SimulationResults): ResultsInterpretation {
    const prompt = `
    Interpret these agent-based simulation results:

    Summary Statistics:
    - Final unemployment: ${results.finalUnemployment}%
    - Peak unemployment: ${results.peakUnemployment}% (month ${results.peakMonth})
    - Jobs displaced: ${results.totalDisplaced.toLocaleString()}
    - Jobs created: ${results.totalCreated.toLocaleString()}
    - Workers retrained: ${results.totalRetrained.toLocaleString()}
    - Workers who left labor force: ${results.leftLaborForce.toLocaleString()}

    Emergent Dynamics:
    ${results.emergentPatterns.map(p => `- ${p.description}`).join('\n')}

    Regional Variation:
    ${results.regionalSummary}

    Demographic Impacts:
    ${results.demographicSummary}

    Provide:
    1. Executive summary (2-3 paragraphs)
    2. Key policy implications
    3. Most vulnerable populations
    4. Intervention effectiveness assessment
    5. Confidence level and key uncertainties
    `;

    const response = await geminiAPI.generate(prompt);
    return parseInterpretation(response);
}
```

### 5.5 API Call #5: Policy Recommendation (Post-simulation)

```javascript
async function recommendPolicies(
    results: SimulationResults,
    constraints: PolicyConstraints
): PolicyRecommendations {
    const prompt = `
    Based on these simulation results and constraints, recommend policies:

    Results Summary:
    ${results.summary}

    Constraints:
    - Budget: $${constraints.maxBudget.toLocaleString()} per year
    - Political feasibility: ${constraints.politicalContext}
    - Implementation timeline: ${constraints.timeline}

    Current interventions and their effectiveness:
    ${results.interventionEffectiveness.map(i =>
        `- ${i.name}: ${i.effectiveness} (cost: $${i.cost})`
    ).join('\n')}

    Recommend:
    1. Highest-impact additions within budget
    2. Modifications to existing interventions
    3. Targeting refinements (which demographics, regions)
    4. Implementation sequencing
    5. Success metrics to track
    `;

    const response = await geminiAPI.generate(prompt);
    return parseRecommendations(response);
}
```

---

## 6. File Structure

```
ai-labor-simulator/
├── src/
│   ├── abm/
│   │   ├── engine.js              # Main ABM simulation engine
│   │   ├── agents/
│   │   │   ├── worker.js          # Worker agent class
│   │   │   ├── firm.js            # Firm agent class
│   │   │   ├── training-program.js # Training program agent
│   │   │   └── agent-pool.js      # Optimized agent storage
│   │   ├── market/
│   │   │   ├── labor-market.js    # Job matching mechanism
│   │   │   ├── wage-dynamics.js   # Wage determination
│   │   │   └── information.js     # Information diffusion
│   │   ├── environment/
│   │   │   ├── ai-frontier.js     # AI capability progression
│   │   │   ├── regions.js         # Regional market definitions
│   │   │   └── economy.js         # Macro conditions
│   │   ├── decisions/
│   │   │   ├── worker-decisions.js  # Worker decision trees
│   │   │   ├── firm-decisions.js    # Firm decision trees
│   │   │   └── calibration.js       # AI-calibrated parameters
│   │   ├── initialization/
│   │   │   ├── population-generator.js  # Generate 1M workers
│   │   │   ├── firm-generator.js        # Generate 50K firms
│   │   │   └── distributions.js         # Statistical distributions
│   │   └── output/
│   │       ├── results-collector.js     # Collect metrics
│   │       ├── pattern-detector.js      # Find emergent patterns
│   │       └── visualizations.js        # ABM-specific charts
│   ├── services/
│   │   └── ai-calibration.js      # AI API integration for ABM
│   └── workers/
│       └── simulation-worker.js    # Web Worker for parallel execution
├── data/
│   ├── occupations.json           # O*NET occupation data
│   ├── regions.json               # US state/region data
│   └── industry-sectors.json      # Industry definitions
└── docs/
    └── ABM_ARCHITECTURE.md        # This document
```

---

## 7. New Visualizations

### 7.1 Agent Flow Sankey Diagram
Shows worker flows between states:
```
Employed → Unemployed → Retraining → Re-employed
                     → Left Labor Force
                     → Different Sector
```

### 7.2 Regional Heat Map
Interactive US map showing:
- Unemployment rate by state
- Net migration flows
- AI adoption levels
- Color-coded by relative performance

### 7.3 Agent Distribution Plots
- Skill distribution evolution over time
- Wage distribution changes
- Age × unemployment relationship
- Network effects visualization

### 7.4 Tipping Point Timeline
- Marks key inflection points in simulation
- Shows what triggered each tipping point
- Counterfactual: "what if this intervention started earlier?"

### 7.5 Policy Support Dashboard
Real-time tracking of political feasibility:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    POLICY SUPPORT OVER TIME                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Support %                                                              │
│  100│                                                                   │
│     │                                    ╭──── UBI                      │
│   80│                               ╭────╯                              │
│     │                          ╭────╯                                   │
│   60│     ╭────────────────────╯          ╭── Retraining               │
│     │ ────╯                    ╭──────────╯                             │
│   40│              ╭───────────╯                                        │
│     │    ──────────╯                      ──── AI Regulation           │
│   20│                                                                   │
│     │                                                                   │
│    0└────────────────────────────────────────────────────────────────   │
│      2025    2026    2027    2028    2029    2030                       │
│                         ▲                                               │
│                    Mass layoff event                                    │
│                    (support spike)                                      │
└─────────────────────────────────────────────────────────────────────────┘
```

### 7.6 Political Feasibility Gauge
For each intervention, show:
```
┌─────────────────────────────────────────┐
│  Universal Basic Income                 │
│                                         │
│  ◀━━━━━━━━━━━━━●━━━━━━━━▶              │
│  Oppose      Neutral     Support        │
│                                         │
│  Feasibility: 67% (Feasible)           │
│  Momentum: ↑ +3.2% / month             │
│  Volatility: Medium                     │
│                                         │
│  Strong Support: 34%  Strong Oppose: 18%│
└─────────────────────────────────────────┘
```

### 7.7 Support by Demographics Heatmap
Shows which groups support which policies:

```
                    UBI   Retrain  Regulate  PublicWorks  EITC
Age 18-24          ████    ███      ████       ██         ███
Age 25-34          ███     ████     ███        ██         ███
Age 35-44          ███     ███      ███        ███        ████
Age 45-54          ████    ██       ████       ████       ████
Age 55-64          █████   █        █████      █████      ████
Age 65+            ███     █        ███        ███        ██

No Degree          █████   ██       █████      █████      █████
High School        ████    ██       ████       ████       ████
Some College       ███     ███      ███        ███        ███
Bachelor's         ██      ████     ██         ██         ██
Advanced           █       █████    █          █          █

Employed           ██      ███      ██         ██         ██
Unemployed         █████   ████     █████      █████      █████
Retraining         ███     █████    ███        ███        ███

█ = Low Support (0-20%)  ███ = Medium (40-60%)  █████ = High (80-100%)
```

### 7.8 Regional Political Map
US map colored by policy support, showing:
- Which states support which policies
- Urban vs rural divide on interventions
- Swing regions where support is volatile
- Overlay with unemployment rates to show correlation

### 7.9 Network Influence Visualization
Animated network graph showing:
- How opinions spread through worker networks
- Echo chamber formation
- Key influencer nodes
- Cascade events (when opinion shifts rapidly spread)

### 7.10 Policy Window Indicator
Shows when political conditions are ripe for action:

```
┌─────────────────────────────────────────────────────────────────┐
│                    POLICY WINDOW ANALYSIS                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  UBI Implementation Window:                                     │
│  ════════════════╗                                             │
│                  ║ OPEN NOW                                     │
│  ════════════════╝                                             │
│  • Public support: 67% (above 60% threshold)                   │
│  • Economic anxiety: High (0.72)                               │
│  • Political engagement: Elevated                               │
│  • Opposition intensity: Moderate                               │
│                                                                 │
│  ⚠️  Window may close if:                                       │
│     - Economy recovers (anxiety drops)                         │
│     - Failed pilot program erodes trust                        │
│     - Counter-narrative gains traction                         │
│                                                                 │
│  Recommended action: Implement within 6-12 months              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. Implementation Phases

### Phase 1: Core Agent Framework (2-3 weeks)
- Worker agent with basic attributes and decisions
- Firm agent with AI adoption logic
- Simple labor market matching
- Single-region prototype

### Phase 2: Full Market Dynamics (2-3 weeks)
- Multi-region support
- Wage dynamics
- Training program agents
- Information diffusion

### Phase 3: AI Integration (1-2 weeks)
- Calibration API calls
- Pattern detection
- Results interpretation

### Phase 4: Optimization & UI (2-3 weeks)
- Web Worker parallelization
- TypedArray optimization
- New visualizations
- Integration with existing simulator

### Phase 5: Validation (1-2 weeks)
- Historical backtesting
- Sensitivity analysis
- Documentation

---

## 9. Example Scenario Output

```javascript
{
    "scenario": "Rapid AI Adoption - No Intervention",
    "duration_months": 120,
    "agents": {
        "workers": 1000000,
        "firms": 50000,
        "training_programs": 500
    },
    "results": {
        "final_unemployment_rate": 12.4,
        "peak_unemployment_rate": 15.2,
        "peak_month": 67,
        "total_jobs_displaced": 4200000,
        "total_jobs_created": 2800000,
        "net_job_change": -1400000,
        "workers_retrained": 890000,
        "retraining_success_rate": 0.72,
        "workers_left_labor_force": 1100000,
        "average_unemployment_duration_months": 8.4,
        "wage_change_median": -0.04,
        "wage_change_p90": 0.12,
        "wage_change_p10": -0.18,
        "gini_coefficient_change": 0.03
    },
    "emergent_patterns": [
        {
            "type": "tipping_point",
            "month": 34,
            "description": "Retail sector collapse accelerated as multiple major chains adopted AI checkout simultaneously",
            "trigger": "Competitive pressure cascade in retail"
        },
        {
            "type": "feedback_loop",
            "month": 45,
            "description": "High-skill workers in AI-augmented roles saw wage premium, attracting more to retraining, creating skill supply surge",
            "effect": "Temporary wage compression in tech sector"
        },
        {
            "type": "regional_divergence",
            "month": 60,
            "description": "Coastal tech hubs recovered faster; Midwest manufacturing regions stuck in high unemployment",
            "affected_regions": ["MI", "OH", "IN", "WI"]
        }
    ],
    "demographic_impacts": {
        "by_age": {
            "18-24": { "unemployment_change": 3.2, "wage_change": -0.02 },
            "25-34": { "unemployment_change": 2.8, "wage_change": 0.01 },
            "35-44": { "unemployment_change": 3.5, "wage_change": -0.03 },
            "45-54": { "unemployment_change": 4.8, "wage_change": -0.06 },
            "55-64": { "unemployment_change": 6.2, "wage_change": -0.09 },
            "65+": { "unemployment_change": 2.1, "wage_change": -0.04 }
        },
        "by_education": {
            "no_degree": { "unemployment_change": 7.1, "wage_change": -0.12 },
            "high_school": { "unemployment_change": 5.4, "wage_change": -0.08 },
            "some_college": { "unemployment_change": 3.8, "wage_change": -0.04 },
            "bachelors": { "unemployment_change": 2.1, "wage_change": 0.02 },
            "advanced": { "unemployment_change": 1.2, "wage_change": 0.08 }
        }
    },
    "policy_support": {
        "final_state": {
            "ubi": {
                "mean_support": 0.71,
                "median_support": 0.74,
                "strong_support_pct": 0.42,
                "strong_oppose_pct": 0.12,
                "feasibility_score": 74,
                "feasibility_label": "Feasible - Majority support",
                "momentum": 0.028,
                "momentum_direction": "increasing"
            },
            "retraining": {
                "mean_support": 0.58,
                "median_support": 0.55,
                "strong_support_pct": 0.24,
                "strong_oppose_pct": 0.15,
                "feasibility_score": 56,
                "feasibility_label": "Contested - Close call",
                "momentum": -0.008,
                "momentum_direction": "decreasing"
            },
            "ai_regulation": {
                "mean_support": 0.67,
                "median_support": 0.69,
                "strong_support_pct": 0.38,
                "strong_oppose_pct": 0.14,
                "feasibility_score": 68,
                "feasibility_label": "Feasible - Majority support",
                "momentum": 0.015,
                "momentum_direction": "increasing"
            },
            "public_works": {
                "mean_support": 0.62,
                "median_support": 0.60,
                "strong_support_pct": 0.29,
                "strong_oppose_pct": 0.18,
                "feasibility_score": 61,
                "feasibility_label": "Contested - Close call",
                "momentum": 0.005,
                "momentum_direction": "stable"
            }
        },
        "support_trajectory": {
            "ubi": [0.42, 0.45, 0.48, 0.52, 0.58, 0.63, 0.67, 0.69, 0.71, 0.71],
            "retraining": [0.55, 0.58, 0.61, 0.62, 0.60, 0.59, 0.58, 0.57, 0.58, 0.58],
            "ai_regulation": [0.38, 0.42, 0.48, 0.55, 0.60, 0.63, 0.65, 0.66, 0.67, 0.67]
        },
        "key_shifts": [
            {
                "month": 34,
                "event": "Retail sector mass layoffs",
                "policy_affected": "ubi",
                "shift": 0.12,
                "description": "UBI support surged as 800K retail workers lost jobs in 3 months"
            },
            {
                "month": 52,
                "event": "High-profile retraining program failures",
                "policy_affected": "retraining",
                "shift": -0.08,
                "description": "Support dropped after reports of low job placement rates"
            },
            {
                "month": 67,
                "event": "Peak unemployment reached",
                "policy_affected": "all",
                "shift": 0.05,
                "description": "Support for all interventions increased as crisis peaked"
            }
        ],
        "demographic_support_breakdown": {
            "ubi": {
                "unemployed": 0.89,
                "employed_high_risk": 0.72,
                "employed_low_risk": 0.48,
                "age_55_plus": 0.78,
                "age_under_35": 0.68,
                "no_degree": 0.82,
                "bachelors_plus": 0.54
            }
        },
        "regional_variation": {
            "highest_ubi_support": ["MI", "OH", "PA", "WI"],
            "lowest_ubi_support": ["TX", "UT", "ID"],
            "most_volatile": ["FL", "AZ", "NC"]
        },
        "policy_windows": {
            "ubi": {
                "window_open": true,
                "opened_month": 58,
                "support_threshold_met": true,
                "opposition_manageable": true,
                "recommended_action": "Implement within 12 months while support holds"
            },
            "ai_regulation": {
                "window_open": true,
                "opened_month": 45,
                "support_threshold_met": true,
                "opposition_manageable": true,
                "recommended_action": "Build coalition now; momentum is positive"
            },
            "retraining": {
                "window_open": false,
                "reason": "Recent failures eroded trust; rebuild credibility first",
                "recommended_action": "Pilot improved programs before scaling"
            }
        }
    },
    "ai_analysis": {
        "executive_summary": "The simulation reveals a deeply uneven transition...",
        "policy_implications": [...],
        "confidence": "medium-high"
    }
}
```

---

## 10. Cost Estimate

| API Call | When | Tokens | Cost |
|----------|------|--------|------|
| Behavior Calibration | Pre-sim | ~2000 | $0.06 |
| Occupation Mapping | Pre-sim (cached) | ~3000 | $0.09 |
| Pattern Detection | Mid-sim (optional) | ~2000 | $0.06 |
| Results Interpretation | Post-sim | ~2500 | $0.08 |
| Policy Recommendations | Post-sim (optional) | ~2000 | $0.06 |

**Total per scenario: $0.15-0.35**

With caching of occupation mapping, subsequent runs: **$0.10-0.20**
