/**
 * Demographics Analysis Module
 * Analyzes AI/automation impact across different demographic groups
 */

class DemographicsAnalyzer {
    constructor() {
        // US labor force demographics data (approximate)
        this.demographicData = {
            age_groups: {
                '16-24': {
                    labor_force: 19500000,
                    avg_wage: 16.50,
                    sectors: { retail: 0.22, food_services: 0.18, healthcare: 0.08, technology: 0.05 },
                    education_distribution: { no_degree: 0.45, high_school: 0.35, bachelors: 0.15, advanced: 0.05 },
                    automation_vulnerability: 0.45 // Higher - more in automatable roles
                },
                '25-34': {
                    labor_force: 35800000,
                    avg_wage: 28.50,
                    sectors: { technology: 0.12, healthcare: 0.14, finance: 0.10, professional_services: 0.15 },
                    education_distribution: { no_degree: 0.12, high_school: 0.28, bachelors: 0.40, advanced: 0.20 },
                    automation_vulnerability: 0.32
                },
                '35-44': {
                    labor_force: 33200000,
                    avg_wage: 32.80,
                    sectors: { technology: 0.10, healthcare: 0.15, finance: 0.12, manufacturing: 0.10 },
                    education_distribution: { no_degree: 0.10, high_school: 0.30, bachelors: 0.38, advanced: 0.22 },
                    automation_vulnerability: 0.30
                },
                '45-54': {
                    labor_force: 32500000,
                    avg_wage: 33.20,
                    sectors: { healthcare: 0.16, manufacturing: 0.12, government: 0.10, education: 0.10 },
                    education_distribution: { no_degree: 0.12, high_school: 0.35, bachelors: 0.33, advanced: 0.20 },
                    automation_vulnerability: 0.35
                },
                '55-64': {
                    labor_force: 26800000,
                    avg_wage: 32.50,
                    sectors: { healthcare: 0.18, government: 0.12, manufacturing: 0.10, retail: 0.08 },
                    education_distribution: { no_degree: 0.14, high_school: 0.38, bachelors: 0.30, advanced: 0.18 },
                    automation_vulnerability: 0.38
                },
                '65+': {
                    labor_force: 10800000,
                    avg_wage: 28.00,
                    sectors: { healthcare: 0.15, retail: 0.12, professional_services: 0.10, education: 0.08 },
                    education_distribution: { no_degree: 0.18, high_school: 0.40, bachelors: 0.28, advanced: 0.14 },
                    automation_vulnerability: 0.30
                }
            },
            education_levels: {
                'No High School': {
                    labor_force: 8200000,
                    avg_wage: 14.50,
                    unemployment_rate: 8.5,
                    automation_vulnerability: 0.65,
                    primary_sectors: ['agriculture', 'construction', 'food_services']
                },
                'High School': {
                    labor_force: 35500000,
                    avg_wage: 20.50,
                    unemployment_rate: 5.8,
                    automation_vulnerability: 0.52,
                    primary_sectors: ['retail', 'manufacturing', 'transportation']
                },
                'Some College': {
                    labor_force: 32800000,
                    avg_wage: 24.80,
                    unemployment_rate: 4.5,
                    automation_vulnerability: 0.42,
                    primary_sectors: ['healthcare', 'retail', 'administrative']
                },
                'Bachelor\'s': {
                    labor_force: 48500000,
                    avg_wage: 35.50,
                    unemployment_rate: 3.2,
                    automation_vulnerability: 0.28,
                    primary_sectors: ['technology', 'finance', 'professional_services']
                },
                'Advanced Degree': {
                    labor_force: 26500000,
                    avg_wage: 48.00,
                    unemployment_rate: 2.1,
                    automation_vulnerability: 0.18,
                    primary_sectors: ['healthcare', 'education', 'technology', 'legal']
                }
            },
            gender: {
                'Male': {
                    labor_force: 82500000,
                    participation_rate: 68.2,
                    avg_wage: 31.50,
                    sector_concentration: {
                        construction: 0.96, transportation: 0.78, manufacturing: 0.72,
                        technology: 0.74, mining: 0.88
                    },
                    automation_vulnerability: 0.38
                },
                'Female': {
                    labor_force: 75000000,
                    participation_rate: 57.4,
                    avg_wage: 27.80,
                    sector_concentration: {
                        healthcare: 0.77, education: 0.73, administrative: 0.65,
                        retail: 0.52, food_services: 0.54
                    },
                    automation_vulnerability: 0.35
                }
            }
        };

        // Retraining difficulty by age
        this.retrainingFactors = {
            '16-24': { difficulty: 0.2, duration_multiplier: 0.8, success_rate: 0.85 },
            '25-34': { difficulty: 0.3, duration_multiplier: 1.0, success_rate: 0.80 },
            '35-44': { difficulty: 0.4, duration_multiplier: 1.2, success_rate: 0.70 },
            '45-54': { difficulty: 0.5, duration_multiplier: 1.4, success_rate: 0.55 },
            '55-64': { difficulty: 0.6, duration_multiplier: 1.6, success_rate: 0.40 },
            '65+': { difficulty: 0.7, duration_multiplier: 2.0, success_rate: 0.25 }
        };
    }

    /**
     * Analyze demographic impacts based on simulation results
     */
    analyzeImpacts(simulationResults) {
        const summary = simulationResults.summary;
        const aiImpact = summary.ai_impact;
        const sectorSummary = summary.sector_summary;

        const analysis = {
            by_age: this.analyzeByAge(aiImpact, sectorSummary),
            by_education: this.analyzeByEducation(aiImpact, sectorSummary),
            by_gender: this.analyzeByGender(aiImpact, sectorSummary),
            most_vulnerable: [],
            recommendations: [],
            summary_stats: {}
        };

        // Identify most vulnerable groups
        analysis.most_vulnerable = this.identifyMostVulnerable(analysis);

        // Generate recommendations
        analysis.recommendations = this.generateRecommendations(analysis);

        // Calculate summary statistics
        analysis.summary_stats = this.calculateSummaryStats(analysis);

        return analysis;
    }

    /**
     * Analyze impact by age group
     */
    analyzeByAge(aiImpact, sectorSummary) {
        const results = {};
        const totalDisplacement = aiImpact.cumulative_displacement;

        for (const [ageGroup, data] of Object.entries(this.demographicData.age_groups)) {
            // Calculate displacement based on sector exposure and vulnerability
            const sectorExposure = this.calculateSectorExposure(data.sectors, sectorSummary);
            const displacementShare = (data.labor_force / 158000000) * data.automation_vulnerability * sectorExposure;
            const estimatedDisplacement = Math.round(totalDisplacement * displacementShare);

            // Displacement rate as percentage of age group
            const displacementRate = (estimatedDisplacement / data.labor_force * 100).toFixed(1);

            // Impact level
            let impactLevel = 'Low';
            if (displacementRate > 8) impactLevel = 'Critical';
            else if (displacementRate > 5) impactLevel = 'High';
            else if (displacementRate > 3) impactLevel = 'Moderate';

            // Retraining outlook
            const retraining = this.retrainingFactors[ageGroup];

            results[ageGroup] = {
                labor_force: data.labor_force,
                estimated_displacement: estimatedDisplacement,
                displacement_rate: parseFloat(displacementRate),
                impact_level: impactLevel,
                avg_wage: data.avg_wage,
                wage_impact: this.estimateWageImpact(data.automation_vulnerability, impactLevel),
                retraining_success_rate: (retraining.success_rate * 100).toFixed(0) + '%',
                retraining_difficulty: retraining.difficulty < 0.4 ? 'Low' : retraining.difficulty < 0.6 ? 'Moderate' : 'High',
                key_risks: this.identifyAgeRisks(ageGroup, data)
            };
        }

        return results;
    }

    /**
     * Analyze impact by education level
     */
    analyzeByEducation(aiImpact, sectorSummary) {
        const results = {};
        const totalDisplacement = aiImpact.cumulative_displacement;

        for (const [eduLevel, data] of Object.entries(this.demographicData.education_levels)) {
            // Calculate displacement based on vulnerability
            const displacementShare = (data.labor_force / 151500000) * data.automation_vulnerability;
            const estimatedDisplacement = Math.round(totalDisplacement * displacementShare * 1.2); // Weight by vulnerability

            const displacementRate = (estimatedDisplacement / data.labor_force * 100).toFixed(1);

            let impactLevel = 'Low';
            if (displacementRate > 10) impactLevel = 'Critical';
            else if (displacementRate > 6) impactLevel = 'High';
            else if (displacementRate > 3) impactLevel = 'Moderate';

            results[eduLevel] = {
                labor_force: data.labor_force,
                estimated_displacement: estimatedDisplacement,
                displacement_rate: parseFloat(displacementRate),
                impact_level: impactLevel,
                current_unemployment: data.unemployment_rate + '%',
                projected_unemployment: (data.unemployment_rate + parseFloat(displacementRate) * 0.4).toFixed(1) + '%',
                avg_wage: '$' + data.avg_wage.toFixed(2),
                primary_sectors: data.primary_sectors.join(', '),
                upskilling_priority: data.automation_vulnerability > 0.4 ? 'High' : data.automation_vulnerability > 0.25 ? 'Medium' : 'Low'
            };
        }

        return results;
    }

    /**
     * Analyze impact by gender
     */
    analyzeByGender(aiImpact, sectorSummary) {
        const results = {};
        const totalDisplacement = aiImpact.cumulative_displacement;

        for (const [gender, data] of Object.entries(this.demographicData.gender)) {
            // Calculate based on sector concentration
            let weightedVulnerability = 0;
            let totalWeight = 0;

            for (const [sector, concentration] of Object.entries(data.sector_concentration)) {
                const sectorData = sectorSummary.most_affected?.find(s => s.name === sector) ||
                    sectorSummary.least_affected?.find(s => s.name === sector);
                if (sectorData) {
                    weightedVulnerability += concentration * Math.abs(parseFloat(sectorData.employment_change_percent) / 100);
                    totalWeight += concentration;
                }
            }

            const effectiveVulnerability = totalWeight > 0 ?
                data.automation_vulnerability * (1 + weightedVulnerability / totalWeight) :
                data.automation_vulnerability;

            const displacementShare = (data.labor_force / 157500000) * effectiveVulnerability;
            const estimatedDisplacement = Math.round(totalDisplacement * displacementShare);
            const displacementRate = (estimatedDisplacement / data.labor_force * 100).toFixed(1);

            let impactLevel = 'Low';
            if (displacementRate > 7) impactLevel = 'High';
            else if (displacementRate > 4) impactLevel = 'Moderate';

            results[gender] = {
                labor_force: data.labor_force,
                participation_rate: data.participation_rate + '%',
                estimated_displacement: estimatedDisplacement,
                displacement_rate: parseFloat(displacementRate),
                impact_level: impactLevel,
                avg_wage: '$' + data.avg_wage.toFixed(2),
                high_exposure_sectors: Object.entries(data.sector_concentration)
                    .filter(([_, v]) => v > 0.6)
                    .map(([k, _]) => k.replace(/_/g, ' '))
                    .join(', ')
            };
        }

        return results;
    }

    /**
     * Calculate sector exposure for an age group
     */
    calculateSectorExposure(sectors, sectorSummary) {
        let exposure = 1.0;

        const affectedSectors = [...(sectorSummary.most_affected || [])];
        for (const [sector, share] of Object.entries(sectors)) {
            const affected = affectedSectors.find(s => s.name === sector);
            if (affected) {
                exposure += share * Math.abs(parseFloat(affected.employment_change_percent) / 100);
            }
        }

        return Math.min(2.0, exposure);
    }

    /**
     * Estimate wage impact
     */
    estimateWageImpact(vulnerability, impactLevel) {
        const baseImpact = vulnerability * -3; // Base percentage impact
        const levelMultiplier = impactLevel === 'Critical' ? 1.5 :
            impactLevel === 'High' ? 1.2 :
                impactLevel === 'Moderate' ? 1.0 : 0.8;

        return (baseImpact * levelMultiplier).toFixed(1) + '%';
    }

    /**
     * Identify age-specific risks
     */
    identifyAgeRisks(ageGroup, data) {
        const risks = [];

        if (ageGroup === '16-24') {
            risks.push('Limited work experience');
            risks.push('High concentration in retail/food service');
        } else if (ageGroup === '55-64' || ageGroup === '65+') {
            risks.push('Retraining challenges');
            risks.push('Potential early workforce exit');
        }

        if (data.automation_vulnerability > 0.4) {
            risks.push('High automation exposure');
        }

        return risks;
    }

    /**
     * Identify most vulnerable groups
     */
    identifyMostVulnerable(analysis) {
        const vulnerable = [];

        // Check age groups
        for (const [group, data] of Object.entries(analysis.by_age)) {
            if (data.impact_level === 'Critical' || data.impact_level === 'High') {
                vulnerable.push({
                    type: 'Age Group',
                    group: group,
                    impact_level: data.impact_level,
                    displacement_rate: data.displacement_rate,
                    estimated_affected: data.estimated_displacement
                });
            }
        }

        // Check education levels
        for (const [level, data] of Object.entries(analysis.by_education)) {
            if (data.impact_level === 'Critical' || data.impact_level === 'High') {
                vulnerable.push({
                    type: 'Education',
                    group: level,
                    impact_level: data.impact_level,
                    displacement_rate: data.displacement_rate,
                    estimated_affected: data.estimated_displacement
                });
            }
        }

        // Sort by displacement rate
        return vulnerable.sort((a, b) => b.displacement_rate - a.displacement_rate);
    }

    /**
     * Generate policy recommendations
     */
    generateRecommendations(analysis) {
        const recommendations = [];

        // Age-based recommendations
        const youngWorkers = analysis.by_age['16-24'];
        const olderWorkers = analysis.by_age['55-64'];

        if (youngWorkers?.impact_level === 'High' || youngWorkers?.impact_level === 'Critical') {
            recommendations.push({
                target: 'Young Workers (16-24)',
                priority: 'High',
                actions: [
                    'Expand apprenticeship programs in growing sectors',
                    'Provide tech skills training in high schools',
                    'Create entry-level positions in AI-adjacent roles'
                ]
            });
        }

        if (olderWorkers?.impact_level === 'High' || olderWorkers?.impact_level === 'Critical') {
            recommendations.push({
                target: 'Older Workers (55-64)',
                priority: 'High',
                actions: [
                    'Phased retirement programs with knowledge transfer',
                    'Age-appropriate retraining with extended timelines',
                    'Bridge employment in supervisory/consulting roles'
                ]
            });
        }

        // Education-based recommendations
        const lowEdu = analysis.by_education['No High School'];
        const hsOnly = analysis.by_education['High School'];

        if (lowEdu?.impact_level === 'Critical' || hsOnly?.impact_level === 'High') {
            recommendations.push({
                target: 'Workers without College Degree',
                priority: 'Critical',
                actions: [
                    'Free community college for high-demand fields',
                    'Stackable credentials and micro-certifications',
                    'On-the-job training subsidies for employers',
                    'Basic digital literacy programs'
                ]
            });
        }

        // General recommendations
        recommendations.push({
            target: 'All Workers',
            priority: 'Medium',
            actions: [
                'Portable benefits for gig and transitioning workers',
                'Career counseling and job matching services',
                'Income support during retraining periods'
            ]
        });

        return recommendations;
    }

    /**
     * Calculate summary statistics
     */
    calculateSummaryStats(analysis) {
        let totalDisplaced = 0;
        let highImpactGroups = 0;
        let criticalGroups = 0;

        for (const data of Object.values(analysis.by_age)) {
            totalDisplaced += data.estimated_displacement;
            if (data.impact_level === 'High') highImpactGroups++;
            if (data.impact_level === 'Critical') criticalGroups++;
        }

        return {
            total_estimated_displacement: totalDisplaced,
            high_impact_demographic_groups: highImpactGroups,
            critical_impact_groups: criticalGroups,
            most_vulnerable_segment: analysis.most_vulnerable[0]?.group || 'None identified',
            policy_recommendations_count: analysis.recommendations.length
        };
    }

    /**
     * Generate HTML display for demographics section
     */
    generateHTML(analysis) {
        if (!analysis) return '<p>Demographics analysis not available.</p>';

        return `
            <div class="demographics-analysis">
                <!-- Summary Stats -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin-bottom: 24px;">
                    <div style="background: var(--gray-50); padding: 16px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 0.75rem; color: var(--gray-500); text-transform: uppercase;">High Impact Groups</div>
                        <div style="font-size: 1.5rem; font-weight: 700; color: var(--warning);">${analysis.summary_stats.high_impact_demographic_groups}</div>
                    </div>
                    <div style="background: var(--gray-50); padding: 16px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 0.75rem; color: var(--gray-500); text-transform: uppercase;">Critical Groups</div>
                        <div style="font-size: 1.5rem; font-weight: 700; color: var(--danger);">${analysis.summary_stats.critical_impact_groups}</div>
                    </div>
                    <div style="background: var(--gray-50); padding: 16px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 0.75rem; color: var(--gray-500); text-transform: uppercase;">Most Vulnerable</div>
                        <div style="font-size: 1rem; font-weight: 700; color: var(--primary);">${analysis.summary_stats.most_vulnerable_segment}</div>
                    </div>
                </div>

                <!-- Age Group Impact -->
                <h4 style="margin-bottom: 12px; color: var(--text-primary);">Impact by Age Group</h4>
                <div style="overflow-x: auto; margin-bottom: 24px;">
                    <table style="width: 100%; font-size: 0.875rem; border-collapse: collapse;">
                        <thead>
                            <tr style="border-bottom: 2px solid var(--gray-200);">
                                <th style="text-align: left; padding: 8px;">Age</th>
                                <th style="text-align: right; padding: 8px;">Displacement</th>
                                <th style="text-align: right; padding: 8px;">Rate</th>
                                <th style="text-align: center; padding: 8px;">Impact</th>
                                <th style="text-align: center; padding: 8px;">Retraining</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.entries(analysis.by_age).map(([age, data]) => `
                                <tr style="border-bottom: 1px solid var(--gray-100);">
                                    <td style="padding: 8px; font-weight: 500;">${age}</td>
                                    <td style="padding: 8px; text-align: right;">${this.formatNumber(data.estimated_displacement)}</td>
                                    <td style="padding: 8px; text-align: right;">${data.displacement_rate}%</td>
                                    <td style="padding: 8px; text-align: center;">
                                        <span style="padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; background: ${this.getImpactColor(data.impact_level)}; color: white;">
                                            ${data.impact_level}
                                        </span>
                                    </td>
                                    <td style="padding: 8px; text-align: center; color: var(--gray-500);">${data.retraining_success_rate}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <!-- Education Impact -->
                <h4 style="margin-bottom: 12px; color: var(--text-primary);">Impact by Education Level</h4>
                <div style="overflow-x: auto; margin-bottom: 24px;">
                    <table style="width: 100%; font-size: 0.875rem; border-collapse: collapse;">
                        <thead>
                            <tr style="border-bottom: 2px solid var(--gray-200);">
                                <th style="text-align: left; padding: 8px;">Education</th>
                                <th style="text-align: right; padding: 8px;">Displacement</th>
                                <th style="text-align: right; padding: 8px;">Rate</th>
                                <th style="text-align: center; padding: 8px;">Impact</th>
                                <th style="text-align: center; padding: 8px;">Priority</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.entries(analysis.by_education).map(([edu, data]) => `
                                <tr style="border-bottom: 1px solid var(--gray-100);">
                                    <td style="padding: 8px; font-weight: 500;">${edu}</td>
                                    <td style="padding: 8px; text-align: right;">${this.formatNumber(data.estimated_displacement)}</td>
                                    <td style="padding: 8px; text-align: right;">${data.displacement_rate}%</td>
                                    <td style="padding: 8px; text-align: center;">
                                        <span style="padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; background: ${this.getImpactColor(data.impact_level)}; color: white;">
                                            ${data.impact_level}
                                        </span>
                                    </td>
                                    <td style="padding: 8px; text-align: center;">
                                        <span style="color: ${data.upskilling_priority === 'High' ? 'var(--danger)' : data.upskilling_priority === 'Medium' ? 'var(--warning)' : 'var(--secondary)'};">
                                            ${data.upskilling_priority}
                                        </span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <!-- Recommendations -->
                ${analysis.recommendations.length > 0 ? `
                    <h4 style="margin-bottom: 12px; color: var(--text-primary);">Policy Recommendations</h4>
                    <div style="display: grid; gap: 12px;">
                        ${analysis.recommendations.slice(0, 3).map(rec => `
                            <div style="padding: 12px; background: var(--gray-50); border-radius: 8px; border-left: 4px solid ${rec.priority === 'Critical' ? 'var(--danger)' : rec.priority === 'High' ? 'var(--warning)' : 'var(--primary)'};">
                                <div style="font-weight: 600; margin-bottom: 8px;">${rec.target}</div>
                                <ul style="margin: 0; padding-left: 20px; font-size: 0.875rem; color: var(--text-secondary);">
                                    ${rec.actions.slice(0, 2).map(a => `<li>${a}</li>`).join('')}
                                </ul>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Get color for impact level
     */
    getImpactColor(level) {
        switch (level) {
            case 'Critical': return 'var(--danger)';
            case 'High': return '#f97316';
            case 'Moderate': return 'var(--warning)';
            default: return 'var(--secondary)';
        }
    }

    /**
     * Format number
     */
    formatNumber(n) {
        if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(1) + 'M';
        if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(1) + 'K';
        return n.toLocaleString();
    }
}

// Global instance
const demographicsAnalyzer = new DemographicsAnalyzer();

window.DemographicsAnalyzer = DemographicsAnalyzer;
window.demographicsAnalyzer = demographicsAnalyzer;
