/**
 * International Data Sources Module
 * Integrates labor market data from multiple countries
 * 
 * Sources:
 * - OECD Statistics API (EU, UK, Canada, etc.)
 * - Eurostat (EU countries)
 * - ONS UK (United Kingdom)
 * - Statistics Canada
 * - ILO STAT (International Labour Organization)
 */

/**
 * International Labor Data Service
 * Provides unified access to international labor market statistics
 */
class InternationalDataService {
    constructor() {
        this.cache = new Map();
        this.cacheExpiry = 3600000; // 1 hour

        // API endpoints for international sources
        this.endpoints = {
            oecd: 'https://stats.oecd.org/SDMX-JSON/data',
            eurostat: 'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data',
            onsUk: 'https://api.ons.gov.uk/v1',
            statsCanada: 'https://www150.statcan.gc.ca/t1/wds/rest',
            ilostat: 'https://www.ilo.org/sdmx/rest/data/ILO,DF_YI_ALL_EMP_TEMP_SEX_AGE_NB'
        };

        // Country configurations
        this.countries = {
            usa: {
                name: 'United States',
                code: 'USA',
                region: 'north_america',
                currency: 'USD',
                timezone: 'America/New_York'
            },
            gbr: {
                name: 'United Kingdom',
                code: 'GBR',
                region: 'europe',
                currency: 'GBP',
                timezone: 'Europe/London'
            },
            can: {
                name: 'Canada',
                code: 'CAN',
                region: 'north_america',
                currency: 'CAD',
                timezone: 'America/Toronto'
            },
            deu: {
                name: 'Germany',
                code: 'DEU',
                region: 'europe',
                currency: 'EUR',
                timezone: 'Europe/Berlin'
            },
            fra: {
                name: 'France',
                code: 'FRA',
                region: 'europe',
                currency: 'EUR',
                timezone: 'Europe/Paris'
            },
            jpn: {
                name: 'Japan',
                code: 'JPN',
                region: 'asia_pacific',
                currency: 'JPY',
                timezone: 'Asia/Tokyo'
            },
            kor: {
                name: 'South Korea',
                code: 'KOR',
                region: 'asia_pacific',
                currency: 'KRW',
                timezone: 'Asia/Seoul'
            },
            aus: {
                name: 'Australia',
                code: 'AUS',
                region: 'asia_pacific',
                currency: 'AUD',
                timezone: 'Australia/Sydney'
            }
        };

        // Baseline international data (fallback when APIs unavailable)
        this.baselineData = {
            usa: {
                unemployment_rate: 4.1,
                employment_population_ratio: 60.4,
                labor_force_participation: 62.7,
                avg_hourly_wage: 34.25,
                wage_growth: 4.2,
                ai_adoption_rate: 35,
                automation_risk_index: 0.42,
                tech_sector_share: 0.08,
                gig_economy_share: 0.12,
                remote_work_rate: 0.28
            },
            gbr: {
                unemployment_rate: 4.2,
                employment_population_ratio: 60.1,
                labor_force_participation: 62.8,
                avg_hourly_wage: 17.40,
                wage_growth: 5.8,
                ai_adoption_rate: 30,
                automation_risk_index: 0.39,
                tech_sector_share: 0.07,
                gig_economy_share: 0.15,
                remote_work_rate: 0.24
            },
            can: {
                unemployment_rate: 6.4,
                employment_population_ratio: 62.1,
                labor_force_participation: 65.6,
                avg_hourly_wage: 34.50,
                wage_growth: 4.8,
                ai_adoption_rate: 28,
                automation_risk_index: 0.38,
                tech_sector_share: 0.06,
                gig_economy_share: 0.10,
                remote_work_rate: 0.26
            },
            deu: {
                unemployment_rate: 6.0,
                employment_population_ratio: 59.8,
                labor_force_participation: 63.7,
                avg_hourly_wage: 24.80,
                wage_growth: 4.5,
                ai_adoption_rate: 32,
                automation_risk_index: 0.45,
                tech_sector_share: 0.05,
                gig_economy_share: 0.08,
                remote_work_rate: 0.20
            },
            fra: {
                unemployment_rate: 7.3,
                employment_population_ratio: 54.8,
                labor_force_participation: 58.9,
                avg_hourly_wage: 22.30,
                wage_growth: 3.8,
                ai_adoption_rate: 25,
                automation_risk_index: 0.40,
                tech_sector_share: 0.05,
                gig_economy_share: 0.09,
                remote_work_rate: 0.22
            },
            jpn: {
                unemployment_rate: 2.6,
                employment_population_ratio: 61.2,
                labor_force_participation: 62.9,
                avg_hourly_wage: 2150,  // JPY
                wage_growth: 2.5,
                ai_adoption_rate: 38,
                automation_risk_index: 0.48,
                tech_sector_share: 0.09,
                gig_economy_share: 0.06,
                remote_work_rate: 0.18
            },
            kor: {
                unemployment_rate: 2.8,
                employment_population_ratio: 62.5,
                labor_force_participation: 64.3,
                avg_hourly_wage: 21500,  // KRW
                wage_growth: 3.2,
                ai_adoption_rate: 42,
                automation_risk_index: 0.50,
                tech_sector_share: 0.11,
                gig_economy_share: 0.07,
                remote_work_rate: 0.15
            },
            aus: {
                unemployment_rate: 4.0,
                employment_population_ratio: 64.2,
                labor_force_participation: 66.8,
                avg_hourly_wage: 42.80,
                wage_growth: 4.1,
                ai_adoption_rate: 27,
                automation_risk_index: 0.36,
                tech_sector_share: 0.06,
                gig_economy_share: 0.14,
                remote_work_rate: 0.32
            }
        };
    }

    /**
     * Get data for a specific country
     */
    async getCountryData(countryCode) {
        const code = countryCode.toLowerCase();
        const country = this.countries[code];

        if (!country) {
            throw new Error(`Unknown country code: ${countryCode}`);
        }

        // Try to fetch live data, fall back to baseline
        let data = await this.fetchLiveData(code);

        if (!data) {
            data = this.baselineData[code];
        }

        return {
            ...country,
            metrics: data,
            dataSource: data === this.baselineData[code] ? 'baseline' : 'live',
            lastUpdated: new Date().toISOString()
        };
    }

    /**
     * Get comparison data for multiple countries
     */
    async getCountryComparison(countryCodes) {
        const comparison = {};

        for (const code of countryCodes) {
            try {
                comparison[code] = await this.getCountryData(code);
            } catch (error) {
                console.warn(`Failed to get data for ${code}:`, error);
            }
        }

        return {
            countries: comparison,
            generated: new Date().toISOString(),
            rankings: this.calculateRankings(comparison)
        };
    }

    /**
     * Calculate rankings across countries
     */
    calculateRankings(comparison) {
        const countries = Object.keys(comparison);

        return {
            unemployment_rate: this.rankCountries(
                countries,
                comparison,
                'unemployment_rate',
                true  // lower is better
            ),
            ai_adoption_rate: this.rankCountries(
                countries,
                comparison,
                'ai_adoption_rate',
                false  // higher is better
            ),
            automation_risk_index: this.rankCountries(
                countries,
                comparison,
                'automation_risk_index',
                true  // lower is better
            ),
            wage_growth: this.rankCountries(
                countries,
                comparison,
                'wage_growth',
                false  // higher is better
            )
        };
    }

    /**
     * Rank countries by a specific metric
     */
    rankCountries(countries, comparison, metric, lowerIsBetter) {
        const ranked = countries
            .map(code => ({
                code,
                name: comparison[code].name,
                value: comparison[code].metrics[metric]
            }))
            .filter(c => c.value !== undefined)
            .sort((a, b) => lowerIsBetter
                ? a.value - b.value
                : b.value - a.value
            );

        return ranked.map((c, i) => ({ ...c, rank: i + 1 }));
    }

    /**
     * Attempt to fetch live data from OECD API
     */
    async fetchLiveData(countryCode) {
        const cacheKey = `live_${countryCode}`;

        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheExpiry) {
                return cached.data;
            }
        }

        // For now, return null to use baseline data
        // In production, this would make actual API calls
        return null;
    }

    /**
     * Get AI adoption data by country
     */
    async getAIAdoptionData() {
        const countries = Object.keys(this.countries);
        const data = {};

        for (const code of countries) {
            const countryData = await this.getCountryData(code);
            data[code] = {
                name: countryData.name,
                ai_adoption_rate: countryData.metrics.ai_adoption_rate,
                automation_risk_index: countryData.metrics.automation_risk_index,
                tech_sector_share: countryData.metrics.tech_sector_share
            };
        }

        return data;
    }

    /**
     * Calculate AI impact projections by country
     */
    async calculateCountryProjections(countryCode, years = 5, scenario = 'moderate') {
        const data = await this.getCountryData(countryCode);
        const projections = [];

        const scenarioMultipliers = {
            slow: { adoption: 0.05, displacement: 0.3, reinstatement: 0.5 },
            moderate: { adoption: 0.08, displacement: 0.5, reinstatement: 0.4 },
            fast: { adoption: 0.12, displacement: 0.7, reinstatement: 0.35 },
            accelerating: { adoption: 0.15, displacement: 0.9, reinstatement: 0.3 }
        };

        const mult = scenarioMultipliers[scenario] || scenarioMultipliers.moderate;
        let currentAdoption = data.metrics.ai_adoption_rate;
        let currentUnemployment = data.metrics.unemployment_rate;

        for (let year = 0; year <= years; year++) {
            const adoptionIncrease = currentAdoption * mult.adoption;
            const displacementEffect = adoptionIncrease * mult.displacement * 0.1;
            const reinstatementEffect = adoptionIncrease * mult.reinstatement * 0.05;

            projections.push({
                year: new Date().getFullYear() + year,
                ai_adoption: Math.min(100, currentAdoption),
                unemployment_rate: Math.max(2, Math.min(20, currentUnemployment)),
                displacement_rate: displacementEffect,
                reinstatement_rate: reinstatementEffect,
                net_impact: reinstatementEffect - displacementEffect
            });

            currentAdoption += adoptionIncrease;
            currentUnemployment += (displacementEffect - reinstatementEffect);
        }

        return {
            country: data.name,
            scenario,
            projections
        };
    }

    /**
     * Get regional aggregate data
     */
    async getRegionalData(region) {
        const regionCountries = Object.entries(this.countries)
            .filter(([_, c]) => c.region === region)
            .map(([code, _]) => code);

        const countriesData = await Promise.all(
            regionCountries.map(code => this.getCountryData(code))
        );

        // Calculate regional averages
        const metrics = ['unemployment_rate', 'ai_adoption_rate', 'automation_risk_index', 'wage_growth'];
        const averages = {};

        metrics.forEach(metric => {
            const values = countriesData.map(c => c.metrics[metric]).filter(v => v !== undefined);
            averages[metric] = values.reduce((a, b) => a + b, 0) / values.length;
        });

        return {
            region,
            countries: countriesData,
            averages,
            countryCount: countriesData.length
        };
    }

    /**
     * Get all available countries
     */
    getAvailableCountries() {
        return Object.entries(this.countries).map(([code, data]) => ({
            code,
            ...data
        }));
    }

    /**
     * Get all available regions
     */
    getAvailableRegions() {
        const regions = new Set(
            Object.values(this.countries).map(c => c.region)
        );
        return Array.from(regions);
    }
}


/**
 * Job Posting Data Service
 * Integrates with job posting APIs for real-time labor demand data
 */
class JobPostingDataService {
    constructor() {
        this.cache = new Map();
        this.cacheExpiry = 1800000; // 30 minutes

        // Mock data structure for job postings
        // In production, would integrate with Indeed, LinkedIn, etc.
        this.mockJobData = {
            totalPostings: 11200000,
            lastUpdated: new Date().toISOString(),
            byCategory: {
                technology: {
                    postings: 2100000,
                    avgSalary: 125000,
                    growthRate: 0.15,
                    aiMentioned: 0.42,
                    remoteRate: 0.65,
                    topSkills: ['Python', 'JavaScript', 'Cloud', 'AI/ML', 'DevOps']
                },
                healthcare: {
                    postings: 1800000,
                    avgSalary: 85000,
                    growthRate: 0.12,
                    aiMentioned: 0.18,
                    remoteRate: 0.15,
                    topSkills: ['Nursing', 'Patient Care', 'EMR', 'Clinical', 'Healthcare IT']
                },
                finance: {
                    postings: 980000,
                    avgSalary: 95000,
                    growthRate: 0.08,
                    aiMentioned: 0.35,
                    remoteRate: 0.45,
                    topSkills: ['Financial Analysis', 'Excel', 'SQL', 'Risk Management', 'Python']
                },
                manufacturing: {
                    postings: 720000,
                    avgSalary: 55000,
                    growthRate: -0.03,
                    aiMentioned: 0.12,
                    remoteRate: 0.05,
                    topSkills: ['CNC', 'Quality Control', 'Lean', 'AutoCAD', 'Robotics']
                },
                retail: {
                    postings: 1500000,
                    avgSalary: 42000,
                    growthRate: 0.02,
                    aiMentioned: 0.08,
                    remoteRate: 0.10,
                    topSkills: ['Customer Service', 'POS', 'Inventory', 'Sales', 'E-commerce']
                },
                education: {
                    postings: 850000,
                    avgSalary: 58000,
                    growthRate: 0.05,
                    aiMentioned: 0.15,
                    remoteRate: 0.35,
                    topSkills: ['Teaching', 'Curriculum', 'EdTech', 'Assessment', 'Online Learning']
                },
                transportation: {
                    postings: 650000,
                    avgSalary: 52000,
                    growthRate: 0.04,
                    aiMentioned: 0.10,
                    remoteRate: 0.08,
                    topSkills: ['CDL', 'Logistics', 'Fleet Management', 'Route Planning', 'Safety']
                },
                professional_services: {
                    postings: 1200000,
                    avgSalary: 88000,
                    growthRate: 0.09,
                    aiMentioned: 0.28,
                    remoteRate: 0.55,
                    topSkills: ['Consulting', 'Project Management', 'Business Analysis', 'Strategy', 'Communication']
                }
            },
            aiJobTrends: {
                aiSpecificRoles: 185000,
                aiMentionedRoles: 3200000,
                promptEngineer: 12500,
                mlEngineer: 45000,
                aiEthicist: 2800,
                dataScientist: 125000,
                roboticsEngineer: 28000
            },
            skillDemand: {
                emerging: [
                    { skill: 'Generative AI', growthRate: 2.5, demandIndex: 95 },
                    { skill: 'Prompt Engineering', growthRate: 3.2, demandIndex: 88 },
                    { skill: 'LLMs', growthRate: 2.8, demandIndex: 82 },
                    { skill: 'MLOps', growthRate: 1.8, demandIndex: 78 },
                    { skill: 'AI Ethics', growthRate: 1.5, demandIndex: 65 }
                ],
                declining: [
                    { skill: 'Data Entry', growthRate: -0.15, demandIndex: 42 },
                    { skill: 'Manual Bookkeeping', growthRate: -0.12, demandIndex: 38 },
                    { skill: 'Basic Excel', growthRate: -0.08, demandIndex: 55 },
                    { skill: 'Routine Transcription', growthRate: -0.20, demandIndex: 28 },
                    { skill: 'Simple Customer Support', growthRate: -0.10, demandIndex: 48 }
                ],
                stable: [
                    { skill: 'Project Management', growthRate: 0.05, demandIndex: 85 },
                    { skill: 'Communication', growthRate: 0.03, demandIndex: 92 },
                    { skill: 'Critical Thinking', growthRate: 0.04, demandIndex: 88 },
                    { skill: 'Leadership', growthRate: 0.02, demandIndex: 82 },
                    { skill: 'Problem Solving', growthRate: 0.05, demandIndex: 90 }
                ]
            }
        };
    }

    /**
     * Get job posting summary
     */
    async getJobPostingSummary() {
        return {
            totalPostings: this.mockJobData.totalPostings,
            lastUpdated: this.mockJobData.lastUpdated,
            categories: Object.keys(this.mockJobData.byCategory),
            aiJobCount: this.mockJobData.aiJobTrends.aiMentionedRoles
        };
    }

    /**
     * Get job data by sector
     */
    async getSectorJobData(sector) {
        return this.mockJobData.byCategory[sector] || null;
    }

    /**
     * Get AI-related job trends
     */
    async getAIJobTrends() {
        return this.mockJobData.aiJobTrends;
    }

    /**
     * Get skill demand data
     */
    async getSkillDemandData() {
        return this.mockJobData.skillDemand;
    }

    /**
     * Calculate AI impact on job postings by sector
     */
    async calculateAIImpactOnPostings() {
        const sectors = this.mockJobData.byCategory;
        const impact = {};

        for (const [sector, data] of Object.entries(sectors)) {
            impact[sector] = {
                sector,
                aiMentionRate: data.aiMentioned,
                potentialDisruption: data.aiMentioned > 0.3 ? 'high' :
                    data.aiMentioned > 0.15 ? 'medium' : 'low',
                remoteWorkRate: data.remoteRate,
                growthOutlook: data.growthRate > 0.05 ? 'positive' :
                    data.growthRate < 0 ? 'negative' : 'stable'
            };
        }

        return impact;
    }

    /**
     * Get required vs available skills comparison
     */
    async getSkillGapAnalysis() {
        const emerging = this.mockJobData.skillDemand.emerging;
        const declining = this.mockJobData.skillDemand.declining;

        return {
            required: Object.fromEntries(
                emerging.map(s => [s.skill.toLowerCase().replace(' ', '_'), s.demandIndex / 10])
            ),
            available: Object.fromEntries(
                emerging.map(s => [s.skill.toLowerCase().replace(' ', '_'), (s.demandIndex / 10) * (1 - s.growthRate)])
            ),
            gap: emerging.map(s => ({
                skill: s.skill,
                gap: s.demandIndex / 10 * s.growthRate,
                urgency: s.growthRate > 2 ? 'critical' : s.growthRate > 1 ? 'high' : 'moderate'
            }))
        };
    }
}


/**
 * Skills Taxonomy Service
 * Provides standardized skill classifications and mappings
 */
class SkillsTaxonomyService {
    constructor() {
        // Based on O*NET, ESCO, and emerging AI-related skills
        this.taxonomy = {
            categories: {
                cognitive: {
                    name: 'Cognitive Skills',
                    skills: {
                        'critical_thinking': { level: 'high', aiImpact: 'complement', demand: 0.92 },
                        'complex_problem_solving': { level: 'high', aiImpact: 'complement', demand: 0.90 },
                        'creativity': { level: 'high', aiImpact: 'augment', demand: 0.85 },
                        'analytical_reasoning': { level: 'high', aiImpact: 'augment', demand: 0.88 },
                        'judgment_decision_making': { level: 'high', aiImpact: 'complement', demand: 0.86 },
                        'systems_thinking': { level: 'high', aiImpact: 'complement', demand: 0.80 }
                    }
                },
                technical: {
                    name: 'Technical Skills',
                    skills: {
                        'programming': { level: 'high', aiImpact: 'augment', demand: 0.95 },
                        'data_analysis': { level: 'high', aiImpact: 'augment', demand: 0.92 },
                        'machine_learning': { level: 'high', aiImpact: 'complement', demand: 0.88 },
                        'cloud_computing': { level: 'high', aiImpact: 'neutral', demand: 0.85 },
                        'cybersecurity': { level: 'high', aiImpact: 'augment', demand: 0.90 },
                        'database_management': { level: 'mid', aiImpact: 'automate', demand: 0.72 },
                        'network_administration': { level: 'mid', aiImpact: 'automate', demand: 0.65 }
                    }
                },
                interpersonal: {
                    name: 'Interpersonal Skills',
                    skills: {
                        'communication': { level: 'high', aiImpact: 'complement', demand: 0.95 },
                        'leadership': { level: 'high', aiImpact: 'complement', demand: 0.88 },
                        'negotiation': { level: 'high', aiImpact: 'complement', demand: 0.82 },
                        'teamwork': { level: 'mid', aiImpact: 'neutral', demand: 0.90 },
                        'empathy': { level: 'high', aiImpact: 'protected', demand: 0.85 },
                        'conflict_resolution': { level: 'high', aiImpact: 'complement', demand: 0.78 }
                    }
                },
                routine_cognitive: {
                    name: 'Routine Cognitive Skills',
                    skills: {
                        'data_entry': { level: 'low', aiImpact: 'automate', demand: 0.35 },
                        'bookkeeping': { level: 'low', aiImpact: 'automate', demand: 0.40 },
                        'basic_calculation': { level: 'low', aiImpact: 'automate', demand: 0.30 },
                        'scheduling': { level: 'low', aiImpact: 'automate', demand: 0.45 },
                        'transcription': { level: 'low', aiImpact: 'automate', demand: 0.25 },
                        'form_processing': { level: 'low', aiImpact: 'automate', demand: 0.32 }
                    }
                },
                physical: {
                    name: 'Physical Skills',
                    skills: {
                        'fine_motor': { level: 'mid', aiImpact: 'partial_automate', demand: 0.68 },
                        'gross_motor': { level: 'mid', aiImpact: 'partial_automate', demand: 0.65 },
                        'spatial_awareness': { level: 'mid', aiImpact: 'augment', demand: 0.72 },
                        'physical_stamina': { level: 'low', aiImpact: 'protected', demand: 0.60 },
                        'dexterity': { level: 'mid', aiImpact: 'partial_automate', demand: 0.55 }
                    }
                },
                emerging_ai: {
                    name: 'Emerging AI Skills',
                    skills: {
                        'prompt_engineering': { level: 'mid', aiImpact: 'new', demand: 0.88 },
                        'ai_model_training': { level: 'high', aiImpact: 'new', demand: 0.85 },
                        'ai_ethics': { level: 'high', aiImpact: 'new', demand: 0.78 },
                        'human_ai_collaboration': { level: 'high', aiImpact: 'new', demand: 0.82 },
                        'ai_oversight': { level: 'high', aiImpact: 'new', demand: 0.75 },
                        'explainable_ai': { level: 'high', aiImpact: 'new', demand: 0.72 }
                    }
                }
            }
        };
    }

    /**
     * Get full taxonomy
     */
    getTaxonomy() {
        return this.taxonomy;
    }

    /**
     * Get skills by AI impact type
     */
    getSkillsByAIImpact(impactType) {
        const result = [];

        for (const [categoryId, category] of Object.entries(this.taxonomy.categories)) {
            for (const [skillId, skill] of Object.entries(category.skills)) {
                if (skill.aiImpact === impactType) {
                    result.push({
                        id: skillId,
                        category: categoryId,
                        categoryName: category.name,
                        ...skill
                    });
                }
            }
        }

        return result.sort((a, b) => b.demand - a.demand);
    }

    /**
     * Get skills by demand level
     */
    getHighDemandSkills(threshold = 0.8) {
        const result = [];

        for (const [categoryId, category] of Object.entries(this.taxonomy.categories)) {
            for (const [skillId, skill] of Object.entries(category.skills)) {
                if (skill.demand >= threshold) {
                    result.push({
                        id: skillId,
                        category: categoryId,
                        categoryName: category.name,
                        ...skill
                    });
                }
            }
        }

        return result.sort((a, b) => b.demand - a.demand);
    }

    /**
     * Get AI vulnerability assessment
     */
    getAIVulnerabilityAssessment() {
        const assessment = {
            highRisk: [],
            mediumRisk: [],
            lowRisk: [],
            protected: [],
            emerging: []
        };

        for (const [categoryId, category] of Object.entries(this.taxonomy.categories)) {
            for (const [skillId, skill] of Object.entries(category.skills)) {
                const entry = {
                    id: skillId,
                    name: this.formatSkillName(skillId),
                    category: category.name,
                    demand: skill.demand
                };

                switch (skill.aiImpact) {
                    case 'automate':
                        assessment.highRisk.push(entry);
                        break;
                    case 'partial_automate':
                        assessment.mediumRisk.push(entry);
                        break;
                    case 'augment':
                    case 'neutral':
                        assessment.lowRisk.push(entry);
                        break;
                    case 'complement':
                    case 'protected':
                        assessment.protected.push(entry);
                        break;
                    case 'new':
                        assessment.emerging.push(entry);
                        break;
                }
            }
        }

        return assessment;
    }

    /**
     * Format skill ID to readable name
     */
    formatSkillName(skillId) {
        return skillId.split('_').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    /**
     * Map job title to required skills
     */
    mapJobToSkills(jobTitle) {
        // Simplified mapping - in production would use ML/NLP
        const jobSkillMap = {
            'software_engineer': ['programming', 'critical_thinking', 'teamwork', 'data_analysis'],
            'data_scientist': ['data_analysis', 'machine_learning', 'programming', 'communication'],
            'nurse': ['empathy', 'communication', 'fine_motor', 'critical_thinking'],
            'accountant': ['data_analysis', 'bookkeeping', 'critical_thinking', 'communication'],
            'manager': ['leadership', 'communication', 'negotiation', 'systems_thinking'],
            'ai_specialist': ['machine_learning', 'prompt_engineering', 'ai_ethics', 'programming']
        };

        const normalizedTitle = jobTitle.toLowerCase().replace(/\s+/g, '_');
        return jobSkillMap[normalizedTitle] || [];
    }
}


// Export all services
export {
    InternationalDataService,
    JobPostingDataService,
    SkillsTaxonomyService
};

// Also export to window for backwards compatibility
if (typeof window !== 'undefined') {
    window.InternationalDataService = InternationalDataService;
    window.JobPostingDataService = JobPostingDataService;
    window.SkillsTaxonomyService = SkillsTaxonomyService;
}
