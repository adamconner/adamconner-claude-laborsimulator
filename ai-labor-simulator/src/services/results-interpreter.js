/**
 * Results Interpretation API
 * Provides structured, rule-based interpretations of ABM simulation results
 *
 * This service analyzes simulation outcomes and generates:
 * - Key findings and insights
 * - Risk assessments
 * - Policy recommendations
 * - Trend analysis
 * - Comparative benchmarks
 */

class ResultsInterpreter {
    constructor() {
        // Thresholds for interpretation
        this.thresholds = {
            unemployment: {
                crisis: 10,      // Above this is crisis level
                high: 7,         // Above this is concerning
                moderate: 5,     // Normal range
                low: 3.5         // Below this may indicate overheating
            },
            displacement: {
                severe: 5,       // Millions - severe disruption
                significant: 2,  // Millions - significant
                moderate: 0.5    // Millions - moderate
            },
            jobCreation: {
                strong: 3,       // Millions - strong job creation
                moderate: 1,     // Millions - moderate
                weak: 0.3        // Millions - weak
            },
            wageGrowth: {
                strong: 3,       // Percent - strong growth
                moderate: 1.5,   // Percent - moderate
                stagnant: 0,     // Percent - stagnant
                declining: -1    // Percent - concerning decline
            },
            adoption: {
                rapid: 70,       // Percent - rapid adoption
                moderate: 40,    // Percent - moderate
                slow: 20         // Percent - slow
            }
        };

        // Risk weights for overall assessment
        this.riskWeights = {
            unemployment: 0.3,
            displacement: 0.25,
            wageChange: 0.2,
            netJobImpact: 0.15,
            inequality: 0.1
        };
    }

    /**
     * Generate comprehensive interpretation of simulation results
     */
    interpret(results) {
        if (!results || !results.summary) {
            return { error: 'Invalid results format' };
        }

        const summary = results.summary;
        const scenario = results.scenario;

        return {
            overview: this.generateOverview(summary, scenario),
            keyFindings: this.extractKeyFindings(summary, scenario),
            riskAssessment: this.assessRisks(summary),
            trendAnalysis: this.analyzeTrends(results),
            sectorAnalysis: this.analyzeSectors(summary),
            policyRecommendations: this.generateRecommendations(summary, scenario),
            comparativeBenchmarks: this.generateBenchmarks(summary),
            narrativeSummary: this.generateNarrativeSummary(summary, scenario),
            dataPoints: this.extractDataPoints(summary)
        };
    }

    /**
     * Generate executive overview
     */
    generateOverview(summary, scenario) {
        const urChange = summary.labor_market_changes.unemployment_rate.change;
        const netJobs = summary.ai_impact.net_impact;
        const finalUR = summary.labor_market_changes.unemployment_rate.final;

        let outlook = 'neutral';
        let severity = 'moderate';

        if (urChange <= -1 && netJobs > 0) {
            outlook = 'positive';
            severity = 'low';
        } else if (urChange >= 2 || netJobs < -2000000) {
            outlook = 'negative';
            severity = 'high';
        } else if (urChange >= 4 || netJobs < -5000000) {
            outlook = 'critical';
            severity = 'critical';
        }

        return {
            outlook,
            severity,
            timeframe: `${scenario.timeframe.start_year}-${scenario.timeframe.end_year}`,
            scenarioType: scenario.name,
            headline: this.generateHeadline(summary, scenario),
            subheadline: this.generateSubheadline(summary)
        };
    }

    /**
     * Generate headline summary
     */
    generateHeadline(summary, scenario) {
        const netJobs = summary.ai_impact.net_impact;
        const urChange = summary.labor_market_changes.unemployment_rate.change;

        if (netJobs > 1000000) {
            return `AI Integration Creates ${(netJobs / 1e6).toFixed(1)}M Net Jobs`;
        } else if (netJobs < -3000000) {
            return `Significant Labor Disruption: ${Math.abs(netJobs / 1e6).toFixed(1)}M Net Jobs Lost`;
        } else if (urChange >= 3) {
            return `Unemployment Rises ${urChange.toFixed(1)} Points Amid AI Transition`;
        } else if (urChange <= -1) {
            return `Labor Market Improves Despite AI Automation`;
        } else {
            return `Mixed Results as AI Reshapes Labor Market`;
        }
    }

    /**
     * Generate subheadline
     */
    generateSubheadline(summary) {
        const displaced = summary.ai_impact.cumulative_displacement;
        const created = summary.ai_impact.cumulative_new_jobs;
        const finalAdoption = summary.ai_impact.ai_adoption.final;

        return `${(displaced / 1e6).toFixed(1)}M jobs displaced, ${(created / 1e6).toFixed(1)}M created at ${finalAdoption.toFixed(0)}% AI adoption`;
    }

    /**
     * Extract key findings
     */
    extractKeyFindings(summary, scenario) {
        const findings = [];

        // Unemployment finding
        const urChange = summary.labor_market_changes.unemployment_rate.change;
        const finalUR = summary.labor_market_changes.unemployment_rate.final;

        findings.push({
            category: 'unemployment',
            severity: this.getURSeverity(finalUR),
            finding: `Unemployment ${urChange >= 0 ? 'rises' : 'falls'} to ${finalUR.toFixed(1)}% (${urChange >= 0 ? '+' : ''}${urChange.toFixed(1)} points)`,
            impact: urChange >= 2 ? 'high' : urChange >= 0.5 ? 'medium' : 'low',
            icon: urChange >= 0 ? '📈' : '📉'
        });

        // Job displacement finding
        const displaced = summary.ai_impact.cumulative_displacement;
        findings.push({
            category: 'displacement',
            severity: this.getDisplacementSeverity(displaced),
            finding: `${(displaced / 1e6).toFixed(2)}M workers displaced by automation`,
            impact: displaced > 5000000 ? 'high' : displaced > 2000000 ? 'medium' : 'low',
            icon: '🤖'
        });

        // Job creation finding
        const created = summary.ai_impact.cumulative_new_jobs;
        findings.push({
            category: 'job_creation',
            severity: this.getCreationSeverity(created),
            finding: `${(created / 1e6).toFixed(2)}M new jobs created by AI economy`,
            impact: created > 3000000 ? 'positive' : created > 1000000 ? 'neutral' : 'negative',
            icon: '💼'
        });

        // Net impact finding
        const netImpact = summary.ai_impact.net_impact;
        findings.push({
            category: 'net_impact',
            severity: netImpact > 0 ? 'positive' : netImpact < -2000000 ? 'critical' : 'warning',
            finding: `Net job impact: ${netImpact >= 0 ? '+' : ''}${(netImpact / 1e6).toFixed(2)}M`,
            impact: netImpact > 0 ? 'positive' : netImpact < -2000000 ? 'high' : 'medium',
            icon: netImpact >= 0 ? '✅' : '⚠️'
        });

        // Wage finding
        const wageChange = summary.wages.average_hourly.change_percent;
        findings.push({
            category: 'wages',
            severity: wageChange > 2 ? 'positive' : wageChange < 0 ? 'warning' : 'neutral',
            finding: `Average wages ${wageChange >= 0 ? 'increase' : 'decrease'} by ${Math.abs(wageChange).toFixed(1)}%`,
            impact: wageChange > 2 ? 'positive' : wageChange < -1 ? 'negative' : 'neutral',
            icon: wageChange >= 0 ? '💰' : '📉'
        });

        // Productivity finding
        const productivityGrowth = summary.productivity.growth_rate.final;
        findings.push({
            category: 'productivity',
            severity: 'positive',
            finding: `Productivity growth reaches ${productivityGrowth.toFixed(1)}%`,
            impact: productivityGrowth > 3 ? 'high' : 'medium',
            icon: '📊'
        });

        return findings;
    }

    /**
     * Assess overall risks
     */
    assessRisks(summary) {
        const risks = [];

        // Structural unemployment risk
        const urFinal = summary.labor_market_changes.unemployment_rate.final;
        if (urFinal > this.thresholds.unemployment.high) {
            risks.push({
                type: 'structural_unemployment',
                level: urFinal > this.thresholds.unemployment.crisis ? 'critical' : 'high',
                description: `Unemployment at ${urFinal.toFixed(1)}% indicates structural labor market issues`,
                mitigation: 'Consider expanded retraining programs and job creation initiatives'
            });
        }

        // Skills gap risk
        const displaced = summary.ai_impact.cumulative_displacement;
        const created = summary.ai_impact.cumulative_new_jobs;
        if (displaced > created * 1.5) {
            risks.push({
                type: 'skills_gap',
                level: 'high',
                description: 'Job displacement significantly outpaces creation, suggesting skills mismatch',
                mitigation: 'Invest in education and skills training aligned with AI economy needs'
            });
        }

        // Wage stagnation risk
        const wageChange = summary.wages.average_hourly.change_percent;
        if (wageChange < 0) {
            risks.push({
                type: 'wage_decline',
                level: wageChange < -2 ? 'high' : 'medium',
                description: `Wage decline of ${Math.abs(wageChange).toFixed(1)}% threatens living standards`,
                mitigation: 'Consider minimum wage adjustments or wage subsidies'
            });
        }

        // Inequality risk
        if (summary.inequality) {
            const giniChange = summary.inequality.gini.final - summary.inequality.gini.initial;
            if (giniChange > 0.02) {
                risks.push({
                    type: 'inequality',
                    level: giniChange > 0.05 ? 'high' : 'medium',
                    description: 'Income inequality is increasing during AI transition',
                    mitigation: 'Progressive tax policies and targeted support for affected workers'
                });
            }
        }

        // Rapid displacement risk
        if (displaced > 5000000) {
            risks.push({
                type: 'rapid_displacement',
                level: 'high',
                description: `${(displaced / 1e6).toFixed(1)}M workers displaced may overwhelm support systems`,
                mitigation: 'Phase automation and strengthen unemployment insurance'
            });
        }

        // Calculate overall risk score
        const overallScore = this.calculateOverallRiskScore(summary);

        return {
            risks,
            overallScore,
            overallLevel: overallScore > 70 ? 'critical' : overallScore > 50 ? 'high' : overallScore > 30 ? 'medium' : 'low',
            riskCount: {
                critical: risks.filter(r => r.level === 'critical').length,
                high: risks.filter(r => r.level === 'high').length,
                medium: risks.filter(r => r.level === 'medium').length
            }
        };
    }

    /**
     * Calculate overall risk score (0-100)
     */
    calculateOverallRiskScore(summary) {
        let score = 0;

        // Unemployment component (0-30 points)
        const urFinal = summary.labor_market_changes.unemployment_rate.final;
        score += Math.min(30, (urFinal / this.thresholds.unemployment.crisis) * 30);

        // Displacement component (0-25 points)
        const displaced = summary.ai_impact.cumulative_displacement / 1e6;
        score += Math.min(25, (displaced / this.thresholds.displacement.severe) * 25);

        // Wage change component (0-20 points)
        const wageChange = summary.wages.average_hourly.change_percent;
        if (wageChange < 0) {
            score += Math.min(20, Math.abs(wageChange) * 5);
        }

        // Net job impact component (0-15 points)
        const netImpact = summary.ai_impact.net_impact / 1e6;
        if (netImpact < 0) {
            score += Math.min(15, Math.abs(netImpact) * 3);
        }

        // Inequality component (0-10 points)
        if (summary.inequality) {
            const giniChange = summary.inequality.gini.final - summary.inequality.gini.initial;
            score += Math.min(10, giniChange * 100);
        }

        return Math.min(100, Math.round(score));
    }

    /**
     * Analyze trends from time series data
     */
    analyzeTrends(results) {
        if (!results.monthlyData || results.monthlyData.length < 6) {
            return { available: false };
        }

        const data = results.monthlyData;
        const midpoint = Math.floor(data.length / 2);

        // Calculate trend directions
        const firstHalf = data.slice(0, midpoint);
        const secondHalf = data.slice(midpoint);

        const getAvg = (arr, key) => arr.reduce((sum, d) => sum + (d[key] || 0), 0) / arr.length;

        const unemploymentTrend = this.calculateTrendDirection(
            getAvg(firstHalf, 'unemploymentRate'),
            getAvg(secondHalf, 'unemploymentRate')
        );

        const displacementTrend = this.calculateTrendDirection(
            getAvg(firstHalf, 'monthlyDisplacement'),
            getAvg(secondHalf, 'monthlyDisplacement')
        );

        // Identify inflection points
        const inflectionPoints = this.findInflectionPoints(data);

        return {
            available: true,
            unemploymentTrend: {
                direction: unemploymentTrend,
                description: `Unemployment ${unemploymentTrend} over simulation period`
            },
            displacementTrend: {
                direction: displacementTrend,
                description: `Displacement rate ${displacementTrend} in later months`
            },
            inflectionPoints,
            peakDisplacement: this.findPeakMonth(data, 'monthlyDisplacement'),
            steadyStateReached: this.checkSteadyState(data)
        };
    }

    /**
     * Calculate trend direction
     */
    calculateTrendDirection(early, late) {
        const diff = ((late - early) / early) * 100;
        if (diff > 10) return 'increasing';
        if (diff < -10) return 'decreasing';
        return 'stable';
    }

    /**
     * Find inflection points in time series
     */
    findInflectionPoints(data) {
        const points = [];

        for (let i = 2; i < data.length - 2; i++) {
            const prevSlope = data[i].unemploymentRate - data[i-2].unemploymentRate;
            const nextSlope = data[i+2].unemploymentRate - data[i].unemploymentRate;

            if (prevSlope > 0 && nextSlope < 0) {
                points.push({ month: i, type: 'peak', value: data[i].unemploymentRate });
            } else if (prevSlope < 0 && nextSlope > 0) {
                points.push({ month: i, type: 'trough', value: data[i].unemploymentRate });
            }
        }

        return points;
    }

    /**
     * Find peak month for a metric
     */
    findPeakMonth(data, key) {
        let maxVal = 0;
        let maxMonth = 0;

        data.forEach((d, i) => {
            if (d[key] > maxVal) {
                maxVal = d[key];
                maxMonth = i;
            }
        });

        return { month: maxMonth, value: maxVal };
    }

    /**
     * Check if steady state has been reached
     */
    checkSteadyState(data) {
        if (data.length < 6) return false;

        const last6 = data.slice(-6);
        const urValues = last6.map(d => d.unemploymentRate);
        const variance = this.calculateVariance(urValues);

        return variance < 0.5;
    }

    /**
     * Calculate variance
     */
    calculateVariance(values) {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    }

    /**
     * Analyze sector-specific impacts
     */
    analyzeSectors(summary) {
        if (!summary.sectorImpacts) {
            return { available: false };
        }

        const sectors = Object.entries(summary.sectorImpacts);

        // Sort by displacement
        const byDisplacement = sectors
            .sort((a, b) => (b[1].displaced || 0) - (a[1].displaced || 0))
            .slice(0, 5);

        // Sort by job creation
        const byCreation = sectors
            .filter(([_, data]) => data.created > 0)
            .sort((a, b) => (b[1].created || 0) - (a[1].created || 0))
            .slice(0, 5);

        return {
            available: true,
            mostAffected: byDisplacement.map(([name, data]) => ({
                name,
                displaced: data.displaced,
                percentAffected: ((data.displaced / data.employment) * 100).toFixed(1)
            })),
            mostGrowth: byCreation.map(([name, data]) => ({
                name,
                created: data.created,
                growthPercent: ((data.created / data.employment) * 100).toFixed(1)
            })),
            totalSectorsAffected: sectors.filter(([_, d]) => d.displaced > 0).length
        };
    }

    /**
     * Generate policy recommendations
     */
    generateRecommendations(summary, scenario) {
        const recommendations = [];
        const urFinal = summary.labor_market_changes.unemployment_rate.final;
        const displaced = summary.ai_impact.cumulative_displacement;
        const netImpact = summary.ai_impact.net_impact;
        const wageChange = summary.wages.average_hourly.change_percent;

        // High priority recommendations
        if (urFinal > this.thresholds.unemployment.high) {
            recommendations.push({
                priority: 'high',
                category: 'employment',
                title: 'Expand Active Labor Market Policies',
                description: 'High unemployment requires immediate intervention through job training, placement services, and employment subsidies.',
                expectedImpact: 'Could reduce unemployment by 1-2 percentage points within 12 months'
            });
        }

        if (displaced > 3000000) {
            recommendations.push({
                priority: 'high',
                category: 'transition_support',
                title: 'Strengthen Transition Assistance',
                description: 'Large-scale displacement requires enhanced unemployment insurance, portable benefits, and career counseling.',
                expectedImpact: 'Helps displaced workers maintain income while transitioning to new opportunities'
            });
        }

        if (netImpact < -2000000) {
            recommendations.push({
                priority: 'high',
                category: 'job_creation',
                title: 'Invest in New Job Creation',
                description: 'Net job losses require public investment in infrastructure, green economy, and care sectors.',
                expectedImpact: 'Could create 1-3M jobs through targeted public investment'
            });
        }

        // Medium priority recommendations
        if (wageChange < 1) {
            recommendations.push({
                priority: 'medium',
                category: 'wages',
                title: 'Address Wage Pressures',
                description: 'Stagnant wages may require minimum wage adjustments, profit-sharing incentives, or EITC expansion.',
                expectedImpact: 'Supports living standards and maintains consumer demand'
            });
        }

        recommendations.push({
            priority: 'medium',
            category: 'education',
            title: 'Align Education with AI Economy',
            description: 'Update curricula to emphasize complementary skills: creativity, emotional intelligence, and AI literacy.',
            expectedImpact: 'Prepares future workforce for AI-augmented roles'
        });

        // Standard recommendations
        recommendations.push({
            priority: 'standard',
            category: 'monitoring',
            title: 'Establish Early Warning Systems',
            description: 'Create monitoring systems to identify at-risk occupations and regions before displacement occurs.',
            expectedImpact: 'Enables proactive rather than reactive policy responses'
        });

        // Sort by priority
        const priorityOrder = { high: 0, medium: 1, standard: 2 };
        recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

        return recommendations;
    }

    /**
     * Generate comparative benchmarks
     */
    generateBenchmarks(summary) {
        const urFinal = summary.labor_market_changes.unemployment_rate.final;
        const displaced = summary.ai_impact.cumulative_displacement;

        return {
            unemploymentBenchmarks: [
                { label: 'Your Scenario', value: urFinal, current: true },
                { label: 'Historical Average (2010-2019)', value: 5.8 },
                { label: 'Great Recession Peak', value: 10.0 },
                { label: 'Full Employment Target', value: 4.0 }
            ],
            displacementBenchmarks: [
                { label: 'Your Scenario', value: (displaced / 1e6).toFixed(1) + 'M', current: true },
                { label: 'Manufacturing Decline (1980-2010)', value: '7M' },
                { label: 'Great Recession Job Loss', value: '8.7M' },
                { label: 'Monthly Normal Turnover', value: '5M/month' }
            ],
            context: this.generateBenchmarkContext(summary)
        };
    }

    /**
     * Generate benchmark context
     */
    generateBenchmarkContext(summary) {
        const urFinal = summary.labor_market_changes.unemployment_rate.final;
        const displaced = summary.ai_impact.cumulative_displacement;

        if (urFinal > 10) {
            return 'Results indicate potential crisis exceeding Great Recession levels';
        } else if (urFinal > 7) {
            return 'Unemployment would reach concerning levels requiring significant intervention';
        } else if (displaced > 7000000) {
            return 'Displacement scale comparable to decades-long manufacturing transition';
        } else {
            return 'Results within range of manageable labor market adjustments';
        }
    }

    /**
     * Generate narrative summary
     */
    generateNarrativeSummary(summary, scenario) {
        const parts = [];

        // Opening
        const netImpact = summary.ai_impact.net_impact;
        const urChange = summary.labor_market_changes.unemployment_rate.change;

        if (netImpact > 0) {
            parts.push(`This ${scenario.name} scenario projects a net positive labor market outcome, with AI technology creating more jobs than it displaces over the ${scenario.timeframe.end_year - scenario.timeframe.start_year}-year period.`);
        } else {
            parts.push(`This ${scenario.name} scenario projects significant labor market disruption, with AI automation displacing more workers than new opportunities created.`);
        }

        // Key numbers
        parts.push(`The simulation shows ${(summary.ai_impact.cumulative_displacement / 1e6).toFixed(1)} million jobs displaced by automation, while ${(summary.ai_impact.cumulative_new_jobs / 1e6).toFixed(1)} million new positions emerge in the AI-augmented economy.`);

        // Unemployment trajectory
        if (urChange > 2) {
            parts.push(`Unemployment rises from ${summary.labor_market_changes.unemployment_rate.initial}% to ${summary.labor_market_changes.unemployment_rate.final}%, indicating that job creation fails to keep pace with displacement.`);
        } else if (urChange < -1) {
            parts.push(`Unemployment actually decreases from ${summary.labor_market_changes.unemployment_rate.initial}% to ${summary.labor_market_changes.unemployment_rate.final}%, suggesting successful adaptation to the AI economy.`);
        } else {
            parts.push(`Unemployment remains relatively stable at ${summary.labor_market_changes.unemployment_rate.final}%, suggesting the labor market absorbs changes without major disruption.`);
        }

        // Wages
        const wageChange = summary.wages.average_hourly.change_percent;
        if (wageChange > 2) {
            parts.push(`Wages grow by ${wageChange.toFixed(1)}%, indicating workers benefit from productivity gains.`);
        } else if (wageChange < 0) {
            parts.push(`Average wages decline by ${Math.abs(wageChange).toFixed(1)}%, suggesting increased competition for available positions.`);
        }

        // Conclusion
        if (netImpact < -2000000 || urChange > 3) {
            parts.push(`These results suggest policymakers should prepare robust transition support programs and consider regulatory measures to manage the pace of automation.`);
        } else {
            parts.push(`While transition challenges remain, these results suggest manageable adjustment with appropriate policy support.`);
        }

        return parts.join(' ');
    }

    /**
     * Extract structured data points for UI display
     */
    extractDataPoints(summary) {
        return {
            primary: [
                {
                    label: 'Final Unemployment Rate',
                    value: summary.labor_market_changes.unemployment_rate.final.toFixed(1),
                    unit: '%',
                    change: summary.labor_market_changes.unemployment_rate.change.toFixed(1),
                    changeDirection: summary.labor_market_changes.unemployment_rate.change >= 0 ? 'up' : 'down',
                    status: this.getURStatus(summary.labor_market_changes.unemployment_rate.final)
                },
                {
                    label: 'Jobs Displaced',
                    value: (summary.ai_impact.cumulative_displacement / 1e6).toFixed(2),
                    unit: 'M',
                    status: summary.ai_impact.cumulative_displacement > 3000000 ? 'warning' : 'neutral'
                },
                {
                    label: 'Jobs Created',
                    value: (summary.ai_impact.cumulative_new_jobs / 1e6).toFixed(2),
                    unit: 'M',
                    status: 'positive'
                },
                {
                    label: 'Net Impact',
                    value: (summary.ai_impact.net_impact / 1e6).toFixed(2),
                    unit: 'M',
                    status: summary.ai_impact.net_impact >= 0 ? 'positive' : 'warning'
                }
            ],
            secondary: [
                {
                    label: 'AI Adoption Rate',
                    value: summary.ai_impact.ai_adoption.final.toFixed(0),
                    unit: '%'
                },
                {
                    label: 'Wage Change',
                    value: summary.wages.average_hourly.change_percent.toFixed(1),
                    unit: '%'
                },
                {
                    label: 'Productivity Growth',
                    value: summary.productivity.growth_rate.final.toFixed(1),
                    unit: '%'
                }
            ]
        };
    }

    /**
     * Helper: Get unemployment rate severity
     */
    getURSeverity(rate) {
        if (rate >= this.thresholds.unemployment.crisis) return 'critical';
        if (rate >= this.thresholds.unemployment.high) return 'high';
        if (rate >= this.thresholds.unemployment.moderate) return 'moderate';
        return 'low';
    }

    /**
     * Helper: Get unemployment rate status
     */
    getURStatus(rate) {
        if (rate >= this.thresholds.unemployment.crisis) return 'danger';
        if (rate >= this.thresholds.unemployment.high) return 'warning';
        return 'neutral';
    }

    /**
     * Helper: Get displacement severity
     */
    getDisplacementSeverity(displaced) {
        const millions = displaced / 1e6;
        if (millions >= this.thresholds.displacement.severe) return 'critical';
        if (millions >= this.thresholds.displacement.significant) return 'high';
        if (millions >= this.thresholds.displacement.moderate) return 'moderate';
        return 'low';
    }

    /**
     * Helper: Get creation severity
     */
    getCreationSeverity(created) {
        const millions = created / 1e6;
        if (millions >= this.thresholds.jobCreation.strong) return 'positive';
        if (millions >= this.thresholds.jobCreation.moderate) return 'neutral';
        return 'low';
    }

    /**
     * Quick interpretation for display
     */
    getQuickInterpretation(results) {
        const summary = results.summary;
        const netImpact = summary.ai_impact.net_impact;
        const urChange = summary.labor_market_changes.unemployment_rate.change;

        const bullets = [];

        // Net impact bullet
        if (netImpact > 1000000) {
            bullets.push({ icon: '✅', text: `Net positive: ${(netImpact / 1e6).toFixed(1)}M more jobs created than displaced` });
        } else if (netImpact < -2000000) {
            bullets.push({ icon: '⚠️', text: `Significant disruption: ${Math.abs(netImpact / 1e6).toFixed(1)}M net job losses` });
        } else {
            bullets.push({ icon: '➡️', text: `Balanced transition: modest net job changes` });
        }

        // Unemployment bullet
        if (urChange > 2) {
            bullets.push({ icon: '📈', text: `Unemployment rises ${urChange.toFixed(1)} points - requires intervention` });
        } else if (urChange < -1) {
            bullets.push({ icon: '📉', text: `Unemployment falls ${Math.abs(urChange).toFixed(1)} points - positive trajectory` });
        } else {
            bullets.push({ icon: '📊', text: `Unemployment stable - labor market absorbs changes` });
        }

        // Wage bullet
        const wageChange = summary.wages.average_hourly.change_percent;
        if (wageChange > 2) {
            bullets.push({ icon: '💰', text: `Wages grow ${wageChange.toFixed(1)}% - workers share in gains` });
        } else if (wageChange < -1) {
            bullets.push({ icon: '💸', text: `Wages decline ${Math.abs(wageChange).toFixed(1)}% - competitive pressure` });
        }

        // Productivity bullet
        const productivity = summary.productivity.growth_rate.final;
        bullets.push({ icon: '🚀', text: `Productivity reaches ${productivity.toFixed(1)}% growth rate` });

        return bullets;
    }
}

// Global instance
const resultsInterpreter = new ResultsInterpreter();

// Export for ES modules
export { ResultsInterpreter, resultsInterpreter };

// Also export to window for backwards compatibility with script tags
if (typeof window !== 'undefined') {
    window.ResultsInterpreter = ResultsInterpreter;
    window.resultsInterpreter = resultsInterpreter;
}
