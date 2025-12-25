/**
 * Unit tests for the AI Labor Market Simulator
 *
 * Run with: npm run test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock fetch for data loading
global.fetch = vi.fn();

describe('EconomicCalculations', () => {
    // Import dynamically since it uses browser globals
    let EconomicCalculations;

    beforeEach(async () => {
        // Reset modules before each test
        vi.resetModules();
        const module = await import('../src/utils/calculations.js');
        EconomicCalculations = module.EconomicCalculations;
    });

    describe('okunLaw', () => {
        it('should calculate unemployment change from GDP gap', () => {
            // Okun coefficient is typically -0.5
            // 2% below potential GDP should increase unemployment by ~1%
            const result = EconomicCalculations.okunLaw(-2, -0.5);
            expect(result).toBeCloseTo(1, 1);
        });

        it('should return positive value for negative GDP gap', () => {
            const result = EconomicCalculations.okunLaw(-4, -0.5);
            expect(result).toBeGreaterThan(0);
        });

        it('should return negative value for positive GDP gap', () => {
            const result = EconomicCalculations.okunLaw(2, -0.5);
            expect(result).toBeLessThan(0);
        });
    });

    describe('phillipsCurve', () => {
        it('should calculate inflation from unemployment', () => {
            // When unemployment is at NAIRU (natural rate), inflation should equal expected
            const result = EconomicCalculations.phillipsCurve(5, 5, 2, -0.5);
            expect(result).toBeCloseTo(2, 1);
        });

        it('should increase inflation when unemployment below NAIRU', () => {
            const result = EconomicCalculations.phillipsCurve(3, 5, 2, -0.5);
            expect(result).toBeGreaterThan(2);
        });

        it('should decrease inflation when unemployment above NAIRU', () => {
            const result = EconomicCalculations.phillipsCurve(7, 5, 2, -0.5);
            expect(result).toBeLessThan(2);
        });
    });

    describe('beveridgeCurve', () => {
        it('should return valid unemployment for given vacancy rate', () => {
            const result = EconomicCalculations.beveridgeCurve(7);
            expect(result).toBeGreaterThan(0);
            expect(result).toBeLessThan(50); // Reasonable unemployment bound
        });

        it('should increase unemployment as vacancy rate decreases', () => {
            const highVacancy = EconomicCalculations.beveridgeCurve(10);
            const lowVacancy = EconomicCalculations.beveridgeCurve(3);
            expect(lowVacancy).toBeGreaterThan(highVacancy);
        });
    });

    describe('giniCoefficient', () => {
        it('should return 0 for perfect equality', () => {
            const result = EconomicCalculations.giniCoefficient([100, 100, 100, 100]);
            expect(result).toBeCloseTo(0, 2);
        });

        it('should return close to 1 for high inequality', () => {
            const result = EconomicCalculations.giniCoefficient([0, 0, 0, 1000]);
            expect(result).toBeGreaterThan(0.7);
        });

        it('should handle empty array', () => {
            const result = EconomicCalculations.giniCoefficient([]);
            expect(result).toBe(0);
        });
    });

    describe('compoundGrowth', () => {
        it('should calculate compound growth correctly', () => {
            // $100 at 10% for 2 years should be ~$121
            const result = EconomicCalculations.compoundGrowth(100, 0.10, 2);
            expect(result).toBeCloseTo(121, 0);
        });

        it('should return initial value for 0 periods', () => {
            const result = EconomicCalculations.compoundGrowth(100, 0.10, 0);
            expect(result).toBe(100);
        });
    });

    describe('formatNumber', () => {
        it('should format millions correctly', () => {
            expect(EconomicCalculations.formatNumber(1500000)).toBe('1.5M');
        });

        it('should format thousands correctly', () => {
            expect(EconomicCalculations.formatNumber(1500)).toBe('1.5K');
        });

        it('should format small numbers without suffix', () => {
            expect(EconomicCalculations.formatNumber(150)).toBe('150');
        });
    });

    describe('formatPercent', () => {
        it('should format percentage with default precision', () => {
            expect(EconomicCalculations.formatPercent(5.678)).toBe('5.7%');
        });

        it('should format percentage with custom precision', () => {
            expect(EconomicCalculations.formatPercent(5.678, 2)).toBe('5.68%');
        });
    });
});

describe('SimulationEngine', () => {
    let SimulationEngine;
    let mockDataService;

    beforeEach(async () => {
        vi.resetModules();

        // Mock data service
        mockDataService = {
            getCurrentSnapshot: vi.fn().mockResolvedValue({
                labor_market: {
                    unemployment_rate: 4.0,
                    total_employment: 160000000,
                    labor_force_participation: 62.5,
                    job_openings: 10000000,
                    unemployed_count: 6700000
                },
                wages: {
                    median_weekly: 1100,
                    average_hourly: 34,
                    real_wage_growth: 1.5
                },
                productivity: {
                    growth_rate: 1.5,
                    output_per_hour: 60
                },
                sectors: {},
                ai_indicators: {},
                demographics: {}
            })
        };

        const module = await import('../src/simulation/engine.js');
        SimulationEngine = module.SimulationEngine;
    });

    describe('createScenario', () => {
        it('should create a scenario with default values', () => {
            const engine = new SimulationEngine(mockDataService, {});
            const scenario = engine.createScenario({
                name: 'Test Scenario'
            });

            expect(scenario.name).toBe('Test Scenario');
            expect(scenario.timeframe.start_year).toBe(new Date().getFullYear());
            expect(scenario.timeframe.end_year).toBe(new Date().getFullYear() + 5);
            expect(scenario.targets.automation_pace).toBe('moderate');
            expect(scenario.ai_parameters.adoption_curve).toBe('s_curve');
        });

        it('should accept custom parameters', () => {
            const engine = new SimulationEngine(mockDataService, {});
            const scenario = engine.createScenario({
                name: 'Custom Scenario',
                end_year: 2030,
                target_unemployment: 8,
                ai_adoption_rate: 75,
                automation_pace: 'fast',
                adoption_curve: 'exponential'
            });

            expect(scenario.timeframe.end_year).toBe(2030);
            expect(scenario.targets.unemployment_rate).toBe(8);
            expect(scenario.targets.ai_adoption_rate).toBe(75);
            expect(scenario.targets.automation_pace).toBe('fast');
            expect(scenario.ai_parameters.adoption_curve).toBe('exponential');
        });
    });

    describe('runSimulation', () => {
        it('should throw if no scenario is configured', async () => {
            const engine = new SimulationEngine(mockDataService, {});
            await expect(engine.runSimulation()).rejects.toThrow('No scenario configured');
        });

        it('should return results with expected structure', async () => {
            const engine = new SimulationEngine(mockDataService, {});
            await engine.initialize();
            engine.createScenario({
                name: 'Test',
                end_year: new Date().getFullYear() + 1
            });

            const results = await engine.runSimulation();

            expect(results).toHaveProperty('scenario');
            expect(results).toHaveProperty('timeline');
            expect(results).toHaveProperty('summary');
            expect(results.timeline).toBeInstanceOf(Array);
            expect(results.timeline.length).toBeGreaterThan(0);
        });
    });
});

describe('InterventionSystem', () => {
    let InterventionSystem;

    beforeEach(async () => {
        vi.resetModules();
        const module = await import('../src/simulation/interventions.js');
        InterventionSystem = module.InterventionSystem;
    });

    describe('getAvailableTypes', () => {
        it('should return list of intervention types', () => {
            const system = new InterventionSystem();
            const types = system.getAvailableTypes();

            expect(types).toBeInstanceOf(Array);
            expect(types.length).toBeGreaterThan(0);

            const firstType = types[0];
            expect(firstType).toHaveProperty('type');
            expect(firstType).toHaveProperty('name');
            expect(firstType).toHaveProperty('description');
            expect(firstType).toHaveProperty('category');
        });

        it('should include key intervention types', () => {
            const system = new InterventionSystem();
            const types = system.getAvailableTypes();
            const typeNames = types.map(t => t.type);

            expect(typeNames).toContain('universal_basic_income');
            expect(typeNames).toContain('job_retraining');
            expect(typeNames).toContain('wage_subsidy');
        });
    });

    describe('addIntervention', () => {
        it('should add an intervention with default parameters', () => {
            const system = new InterventionSystem();
            system.addIntervention('universal_basic_income');

            expect(system.interventions.length).toBe(1);
            expect(system.interventions[0].type).toBe('universal_basic_income');
            expect(system.interventions[0].active).toBe(true);
        });

        it('should add an intervention with custom parameters', () => {
            const system = new InterventionSystem();
            system.addIntervention('universal_basic_income', {
                monthly_amount: 2000,
                phase_out_threshold: 100000
            });

            expect(system.interventions[0].params.monthly_amount).toBe(2000);
            expect(system.interventions[0].params.phase_out_threshold).toBe(100000);
        });
    });

    describe('calculateCost', () => {
        it('should calculate intervention cost', () => {
            const system = new InterventionSystem();
            system.addIntervention('universal_basic_income', {
                monthly_amount: 1000
            });

            const cost = system.calculateTotalCost({}, 160000000);
            expect(cost).toBeGreaterThan(0);
        });
    });
});

describe('EconomicIndicators', () => {
    let EconomicIndicators;

    beforeEach(async () => {
        vi.resetModules();
        const module = await import('../src/models/indicators.js');
        EconomicIndicators = module.EconomicIndicators;
    });

    describe('getRiskLevel', () => {
        it('should classify high automation exposure as high risk', () => {
            const indicators = new EconomicIndicators();
            expect(indicators.getRiskLevel(0.75)).toBe('high');
        });

        it('should classify low automation exposure as low risk', () => {
            const indicators = new EconomicIndicators();
            expect(indicators.getRiskLevel(0.20)).toBe('low');
        });

        it('should classify medium automation exposure as medium risk', () => {
            const indicators = new EconomicIndicators();
            const risk = indicators.getRiskLevel(0.45);
            expect(risk).toMatch(/medium/);
        });
    });

    describe('calculateSectorExposure', () => {
        it('should calculate exposure for each sector', () => {
            const indicators = new EconomicIndicators();
            const sectors = {
                manufacturing: { employment: 12000000, automation_exposure: 0.6 },
                healthcare: { employment: 20000000, automation_exposure: 0.3 }
            };

            const exposure = indicators.calculateSectorExposure(sectors);

            expect(exposure.manufacturing.at_risk_jobs).toBe(7200000);
            expect(exposure.healthcare.at_risk_jobs).toBe(6000000);
            expect(exposure.manufacturing.risk_level).toBe('medium-high');
            expect(exposure.healthcare.risk_level).toBe('low');
        });
    });

    describe('calculateJobsAtRisk', () => {
        it('should calculate total jobs at risk', () => {
            const indicators = new EconomicIndicators();
            const sectors = {
                sector1: { employment: 1000000, automation_exposure: 0.5 },
                sector2: { employment: 2000000, automation_exposure: 0.3 }
            };

            const risk = indicators.calculateJobsAtRisk(sectors);

            expect(risk.total_employment).toBe(3000000);
            expect(risk.total_at_risk).toBe(1100000); // 500K + 600K
            expect(parseFloat(risk.percentage_at_risk)).toBeCloseTo(36.7, 0);
        });
    });
});
