/**
 * Occupation-Level Drill-Down Module
 * Analyzes AI impact on specific occupations using O*NET-based task framework
 */

class OccupationDrilldown {
    constructor() {
        // O*NET-based occupation categories with task automation exposure
        this.occupations = this.getOccupationData();
        this.selectedOccupation = null;
    }

    /**
     * Get occupation data with AI automation exposure estimates
     * Based on O*NET task framework and AI capability research
     */
    getOccupationData() {
        return {
            // High-exposure white collar
            'data_entry_clerks': {
                name: 'Data Entry Clerks',
                socCode: '43-9021',
                category: 'Office & Administrative',
                employment: 152000,
                medianWage: 37810,
                automationExposure: 0.92,
                aiAugmentationPotential: 0.15,
                tasks: [
                    { name: 'Entering data from source documents', exposure: 0.95, type: 'routine_cognitive' },
                    { name: 'Verifying data accuracy', exposure: 0.85, type: 'routine_cognitive' },
                    { name: 'Maintaining data entry logs', exposure: 0.90, type: 'routine_cognitive' },
                    { name: 'Resolving data discrepancies', exposure: 0.70, type: 'non_routine_cognitive' }
                ],
                projectedChange: { 2025: -8, 2027: -22, 2029: -38, 2034: -65 }
            },
            'customer_service_reps': {
                name: 'Customer Service Representatives',
                socCode: '43-4051',
                employment: 2840000,
                category: 'Office & Administrative',
                medianWage: 39680,
                automationExposure: 0.78,
                aiAugmentationPotential: 0.45,
                tasks: [
                    { name: 'Answering routine inquiries', exposure: 0.90, type: 'routine_cognitive' },
                    { name: 'Processing orders and returns', exposure: 0.85, type: 'routine_cognitive' },
                    { name: 'Handling complaints', exposure: 0.55, type: 'non_routine_interactive' },
                    { name: 'Providing product information', exposure: 0.75, type: 'routine_cognitive' },
                    { name: 'Escalating complex issues', exposure: 0.30, type: 'non_routine_interactive' }
                ],
                projectedChange: { 2025: -5, 2027: -15, 2029: -28, 2034: -45 }
            },
            'accountants_auditors': {
                name: 'Accountants and Auditors',
                socCode: '13-2011',
                category: 'Business & Financial',
                employment: 1538000,
                medianWage: 79880,
                automationExposure: 0.68,
                aiAugmentationPotential: 0.65,
                tasks: [
                    { name: 'Preparing tax returns', exposure: 0.80, type: 'routine_cognitive' },
                    { name: 'Analyzing financial data', exposure: 0.55, type: 'non_routine_analytical' },
                    { name: 'Auditing financial statements', exposure: 0.60, type: 'non_routine_analytical' },
                    { name: 'Advising on financial strategy', exposure: 0.25, type: 'non_routine_interactive' },
                    { name: 'Regulatory compliance', exposure: 0.70, type: 'routine_cognitive' }
                ],
                projectedChange: { 2025: -3, 2027: -10, 2029: -18, 2034: -30 }
            },
            'paralegals': {
                name: 'Paralegals and Legal Assistants',
                socCode: '23-2011',
                category: 'Legal',
                employment: 358000,
                medianWage: 60970,
                automationExposure: 0.72,
                aiAugmentationPotential: 0.60,
                tasks: [
                    { name: 'Legal research', exposure: 0.75, type: 'non_routine_analytical' },
                    { name: 'Document review', exposure: 0.85, type: 'routine_cognitive' },
                    { name: 'Preparing legal documents', exposure: 0.70, type: 'routine_cognitive' },
                    { name: 'Client communication', exposure: 0.35, type: 'non_routine_interactive' },
                    { name: 'Case organization', exposure: 0.65, type: 'routine_cognitive' }
                ],
                projectedChange: { 2025: -4, 2027: -12, 2029: -22, 2034: -35 }
            },
            'software_developers': {
                name: 'Software Developers',
                socCode: '15-1256',
                category: 'Computer & IT',
                employment: 1847000,
                medianWage: 127260,
                automationExposure: 0.45,
                aiAugmentationPotential: 0.85,
                tasks: [
                    { name: 'Writing code', exposure: 0.55, type: 'non_routine_analytical' },
                    { name: 'Code review', exposure: 0.50, type: 'non_routine_analytical' },
                    { name: 'Debugging', exposure: 0.45, type: 'non_routine_analytical' },
                    { name: 'System design', exposure: 0.25, type: 'non_routine_analytical' },
                    { name: 'Requirements gathering', exposure: 0.20, type: 'non_routine_interactive' }
                ],
                projectedChange: { 2025: 5, 2027: 8, 2029: 12, 2034: 18 }
            },
            'radiologic_technologists': {
                name: 'Radiologic Technologists',
                socCode: '29-2034',
                category: 'Healthcare',
                employment: 241000,
                medianWage: 65140,
                automationExposure: 0.52,
                aiAugmentationPotential: 0.70,
                tasks: [
                    { name: 'Positioning patients', exposure: 0.15, type: 'non_routine_manual' },
                    { name: 'Operating imaging equipment', exposure: 0.40, type: 'routine_cognitive' },
                    { name: 'Image analysis (preliminary)', exposure: 0.75, type: 'non_routine_analytical' },
                    { name: 'Patient interaction', exposure: 0.10, type: 'non_routine_interactive' },
                    { name: 'Quality control', exposure: 0.55, type: 'routine_cognitive' }
                ],
                projectedChange: { 2025: 2, 2027: 3, 2029: 4, 2034: 6 }
            },
            'registered_nurses': {
                name: 'Registered Nurses',
                socCode: '29-1141',
                category: 'Healthcare',
                employment: 3175000,
                medianWage: 81220,
                automationExposure: 0.28,
                aiAugmentationPotential: 0.55,
                tasks: [
                    { name: 'Patient care planning', exposure: 0.35, type: 'non_routine_analytical' },
                    { name: 'Administering medications', exposure: 0.20, type: 'routine_manual' },
                    { name: 'Patient monitoring', exposure: 0.45, type: 'routine_cognitive' },
                    { name: 'Emotional support', exposure: 0.05, type: 'non_routine_interactive' },
                    { name: 'Documentation', exposure: 0.60, type: 'routine_cognitive' }
                ],
                projectedChange: { 2025: 4, 2027: 7, 2029: 10, 2034: 15 }
            },
            'truck_drivers': {
                name: 'Heavy Truck Drivers',
                socCode: '53-3032',
                category: 'Transportation',
                employment: 2097000,
                medianWage: 49920,
                automationExposure: 0.65,
                aiAugmentationPotential: 0.40,
                tasks: [
                    { name: 'Driving on highways', exposure: 0.80, type: 'routine_manual' },
                    { name: 'Loading/unloading', exposure: 0.35, type: 'routine_manual' },
                    { name: 'Route planning', exposure: 0.85, type: 'routine_cognitive' },
                    { name: 'Vehicle inspection', exposure: 0.40, type: 'routine_cognitive' },
                    { name: 'Urban navigation', exposure: 0.45, type: 'non_routine_manual' }
                ],
                projectedChange: { 2025: -2, 2027: -8, 2029: -15, 2034: -30 }
            },
            'retail_salespersons': {
                name: 'Retail Salespersons',
                socCode: '41-2031',
                category: 'Sales',
                employment: 3686000,
                medianWage: 31920,
                automationExposure: 0.58,
                aiAugmentationPotential: 0.35,
                tasks: [
                    { name: 'Processing transactions', exposure: 0.90, type: 'routine_cognitive' },
                    { name: 'Product recommendations', exposure: 0.60, type: 'non_routine_interactive' },
                    { name: 'Inventory management', exposure: 0.75, type: 'routine_cognitive' },
                    { name: 'Customer assistance', exposure: 0.35, type: 'non_routine_interactive' },
                    { name: 'Store maintenance', exposure: 0.20, type: 'routine_manual' }
                ],
                projectedChange: { 2025: -4, 2027: -10, 2029: -18, 2034: -28 }
            },
            'financial_analysts': {
                name: 'Financial Analysts',
                socCode: '13-2051',
                category: 'Business & Financial',
                employment: 330000,
                medianWage: 99010,
                automationExposure: 0.55,
                aiAugmentationPotential: 0.75,
                tasks: [
                    { name: 'Data analysis', exposure: 0.65, type: 'non_routine_analytical' },
                    { name: 'Report generation', exposure: 0.70, type: 'routine_cognitive' },
                    { name: 'Investment recommendations', exposure: 0.40, type: 'non_routine_analytical' },
                    { name: 'Client presentations', exposure: 0.25, type: 'non_routine_interactive' },
                    { name: 'Market research', exposure: 0.55, type: 'non_routine_analytical' }
                ],
                projectedChange: { 2025: 0, 2027: -3, 2029: -8, 2034: -12 }
            },
            'graphic_designers': {
                name: 'Graphic Designers',
                socCode: '27-1024',
                category: 'Arts & Design',
                employment: 265000,
                medianWage: 57990,
                automationExposure: 0.62,
                aiAugmentationPotential: 0.70,
                tasks: [
                    { name: 'Creating visual concepts', exposure: 0.55, type: 'non_routine_analytical' },
                    { name: 'Production design work', exposure: 0.75, type: 'routine_cognitive' },
                    { name: 'Client collaboration', exposure: 0.20, type: 'non_routine_interactive' },
                    { name: 'Asset resizing/formatting', exposure: 0.90, type: 'routine_cognitive' },
                    { name: 'Brand strategy', exposure: 0.25, type: 'non_routine_analytical' }
                ],
                projectedChange: { 2025: -3, 2027: -10, 2029: -18, 2034: -25 }
            },
            'marketing_managers': {
                name: 'Marketing Managers',
                socCode: '11-2021',
                category: 'Management',
                employment: 316000,
                medianWage: 157620,
                automationExposure: 0.35,
                aiAugmentationPotential: 0.70,
                tasks: [
                    { name: 'Campaign strategy', exposure: 0.30, type: 'non_routine_analytical' },
                    { name: 'Team leadership', exposure: 0.10, type: 'non_routine_interactive' },
                    { name: 'Performance analytics', exposure: 0.60, type: 'non_routine_analytical' },
                    { name: 'Content oversight', exposure: 0.45, type: 'non_routine_analytical' },
                    { name: 'Stakeholder communication', exposure: 0.15, type: 'non_routine_interactive' }
                ],
                projectedChange: { 2025: 2, 2027: 4, 2029: 6, 2034: 10 }
            }
        };
    }

    /**
     * Get all occupations grouped by category
     */
    getOccupationsByCategory() {
        const grouped = {};
        Object.entries(this.occupations).forEach(([id, occ]) => {
            if (!grouped[occ.category]) {
                grouped[occ.category] = [];
            }
            grouped[occ.category].push({ id, ...occ });
        });
        return grouped;
    }

    /**
     * Get occupation by ID
     */
    getOccupation(id) {
        return this.occupations[id] || null;
    }

    /**
     * Calculate task-level impact for an occupation
     */
    calculateTaskImpact(occupationId, aiAdoptionRate = 70) {
        const occ = this.occupations[occupationId];
        if (!occ) return null;

        const adoptionFactor = aiAdoptionRate / 100;

        return occ.tasks.map(task => {
            const adjustedExposure = task.exposure * adoptionFactor;
            const automationLikelihood = this.getAutomationLikelihood(adjustedExposure);

            return {
                ...task,
                adjustedExposure,
                automationLikelihood,
                impact: this.getImpactLevel(adjustedExposure)
            };
        });
    }

    /**
     * Get automation likelihood description
     */
    getAutomationLikelihood(exposure) {
        if (exposure >= 0.8) return 'Very High';
        if (exposure >= 0.6) return 'High';
        if (exposure >= 0.4) return 'Moderate';
        if (exposure >= 0.2) return 'Low';
        return 'Very Low';
    }

    /**
     * Get impact level
     */
    getImpactLevel(exposure) {
        if (exposure >= 0.7) return { level: 'high', color: 'var(--danger)' };
        if (exposure >= 0.4) return { level: 'medium', color: 'var(--warning)' };
        return { level: 'low', color: 'var(--secondary)' };
    }

    /**
     * Project employment change for an occupation
     */
    projectEmploymentChange(occupationId, targetYear, aiAdoptionRate = 70) {
        const occ = this.occupations[occupationId];
        if (!occ) return null;

        // Get base projection for target year
        let baseChange = 0;
        const years = Object.keys(occ.projectedChange).map(Number).sort();

        if (targetYear <= years[0]) {
            baseChange = occ.projectedChange[years[0]];
        } else if (targetYear >= years[years.length - 1]) {
            baseChange = occ.projectedChange[years[years.length - 1]];
        } else {
            // Interpolate
            for (let i = 0; i < years.length - 1; i++) {
                if (targetYear >= years[i] && targetYear < years[i + 1]) {
                    const ratio = (targetYear - years[i]) / (years[i + 1] - years[i]);
                    baseChange = occ.projectedChange[years[i]] + ratio * (occ.projectedChange[years[i + 1]] - occ.projectedChange[years[i]]);
                    break;
                }
            }
        }

        // Adjust for AI adoption rate (higher adoption = stronger effect)
        const adoptionMultiplier = aiAdoptionRate / 70; // Normalize to baseline 70%
        const adjustedChange = baseChange * adoptionMultiplier;

        return {
            percentChange: adjustedChange,
            absoluteChange: Math.round(occ.employment * (adjustedChange / 100)),
            projectedEmployment: Math.round(occ.employment * (1 + adjustedChange / 100))
        };
    }

    /**
     * Get skill recommendations for transition
     */
    getTransitionRecommendations(occupationId) {
        const occ = this.occupations[occupationId];
        if (!occ) return [];

        const recommendations = {
            routine_cognitive: [
                'Data analysis and interpretation',
                'AI/ML tool proficiency',
                'Process optimization',
                'Quality assurance oversight'
            ],
            routine_manual: [
                'Robotics and automation supervision',
                'Technical troubleshooting',
                'Safety and compliance management',
                'Equipment maintenance'
            ],
            non_routine_analytical: [
                'Strategic thinking and planning',
                'Complex problem-solving',
                'AI model interpretation',
                'Innovation and creativity'
            ],
            non_routine_interactive: [
                'Emotional intelligence',
                'Negotiation and persuasion',
                'Leadership and mentoring',
                'Cross-cultural communication'
            ],
            non_routine_manual: [
                'Fine motor skills development',
                'Adaptive response training',
                'Human-robot collaboration',
                'Environmental awareness'
            ]
        };

        // Find most exposed task types
        const taskTypeExposure = {};
        occ.tasks.forEach(task => {
            if (!taskTypeExposure[task.type]) {
                taskTypeExposure[task.type] = 0;
            }
            taskTypeExposure[task.type] += task.exposure;
        });

        // Get recommendations based on most exposed types
        const sortedTypes = Object.entries(taskTypeExposure)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 2)
            .map(([type]) => type);

        const skills = new Set();
        sortedTypes.forEach(type => {
            if (recommendations[type]) {
                recommendations[type].forEach(skill => skills.add(skill));
            }
        });

        return Array.from(skills).slice(0, 6);
    }

    /**
     * Generate HTML for occupation drill-down
     */
    generateOccupationListHTML() {
        const grouped = this.getOccupationsByCategory();

        let html = '<div class="occupation-drilldown">';

        Object.entries(grouped).forEach(([category, occupations]) => {
            html += `
                <div class="occupation-category" style="margin-bottom: 24px;">
                    <h4 style="font-size: 0.875rem; color: var(--gray-600); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
                        ${category}
                    </h4>
                    <div class="occupation-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px;">
            `;

            occupations.forEach(occ => {
                const riskClass = occ.automationExposure >= 0.7 ? 'tag-high' :
                    occ.automationExposure >= 0.4 ? 'tag-medium' : 'tag-low';
                const riskLabel = occ.automationExposure >= 0.7 ? 'High Risk' :
                    occ.automationExposure >= 0.4 ? 'Medium Risk' : 'Low Risk';

                html += `
                    <div class="occupation-card" style="
                        background: var(--gray-50);
                        border: 1px solid var(--gray-200);
                        border-radius: 8px;
                        padding: 16px;
                        cursor: pointer;
                        transition: all 0.2s;
                    " onclick="showOccupationDetails('${occ.id}')"
                       onmouseover="this.style.borderColor='var(--primary)'; this.style.boxShadow='var(--shadow)';"
                       onmouseout="this.style.borderColor='var(--gray-200)'; this.style.boxShadow='none';">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                            <div>
                                <div style="font-weight: 600; color: var(--gray-800);">${occ.name}</div>
                                <div style="font-size: 0.75rem; color: var(--gray-500);">SOC: ${occ.socCode}</div>
                            </div>
                            <span class="tag ${riskClass}">${riskLabel}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 0.875rem; color: var(--gray-600);">
                            <span>${(occ.employment / 1000).toFixed(0)}K employed</span>
                            <span>$${(occ.medianWage / 1000).toFixed(0)}K median</span>
                        </div>
                        <div style="margin-top: 8px;">
                            <div style="height: 6px; background: var(--gray-200); border-radius: 3px; overflow: hidden;">
                                <div style="height: 100%; width: ${occ.automationExposure * 100}%; background: ${
                    occ.automationExposure >= 0.7 ? 'var(--danger)' :
                        occ.automationExposure >= 0.4 ? 'var(--warning)' : 'var(--secondary)'
                }"></div>
                            </div>
                            <div style="display: flex; justify-content: space-between; font-size: 0.7rem; color: var(--gray-400); margin-top: 4px;">
                                <span>AI Exposure: ${(occ.automationExposure * 100).toFixed(0)}%</span>
                                <span>Augmentation: ${(occ.aiAugmentationPotential * 100).toFixed(0)}%</span>
                            </div>
                        </div>
                    </div>
                `;
            });

            html += '</div></div>';
        });

        html += '</div>';
        return html;
    }

    /**
     * Generate detailed view for an occupation
     */
    generateDetailedViewHTML(occupationId, aiAdoptionRate = 70, targetYear = 2029) {
        const occ = this.getOccupation(occupationId);
        if (!occ) return '<p>Occupation not found.</p>';

        const taskImpact = this.calculateTaskImpact(occupationId, aiAdoptionRate);
        const projection = this.projectEmploymentChange(occupationId, targetYear, aiAdoptionRate);
        const recommendations = this.getTransitionRecommendations(occupationId);

        const riskClass = occ.automationExposure >= 0.7 ? 'tag-high' :
            occ.automationExposure >= 0.4 ? 'tag-medium' : 'tag-low';

        return `
            <div class="occupation-detail">
                <button class="btn btn-outline btn-sm" onclick="hideOccupationDetails()" style="margin-bottom: 16px;">
                    &larr; Back to List
                </button>

                <div class="card" style="margin-bottom: 24px;">
                    <div style="display: flex; justify-content: space-between; align-items: start; flex-wrap: wrap; gap: 16px;">
                        <div>
                            <h2 style="font-size: 1.5rem; color: var(--gray-900); margin-bottom: 4px;">${occ.name}</h2>
                            <p style="color: var(--gray-500);">SOC Code: ${occ.socCode} | ${occ.category}</p>
                        </div>
                        <span class="tag ${riskClass}" style="font-size: 1rem; padding: 8px 16px;">
                            ${occ.automationExposure >= 0.7 ? 'High Risk' : occ.automationExposure >= 0.4 ? 'Medium Risk' : 'Low Risk'}
                        </span>
                    </div>

                    <div class="stats-grid" style="margin-top: 24px;">
                        <div class="stat-card">
                            <div class="label">Current Employment</div>
                            <div class="value">${(occ.employment / 1e6).toFixed(2)}M</div>
                        </div>
                        <div class="stat-card">
                            <div class="label">Median Wage</div>
                            <div class="value">$${occ.medianWage.toLocaleString()}</div>
                        </div>
                        <div class="stat-card">
                            <div class="label">AI Exposure</div>
                            <div class="value" style="color: ${occ.automationExposure >= 0.7 ? 'var(--danger)' : 'var(--warning)'}">
                                ${(occ.automationExposure * 100).toFixed(0)}%
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="label">Augmentation Potential</div>
                            <div class="value" style="color: var(--secondary);">
                                ${(occ.aiAugmentationPotential * 100).toFixed(0)}%
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Employment Projection -->
                <div class="card" style="margin-bottom: 24px;">
                    <div class="card-header">
                        <h3>Employment Projection to ${targetYear}</h3>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; text-align: center;">
                        <div>
                            <div style="font-size: 0.875rem; color: var(--gray-500);">Projected Change</div>
                            <div style="font-size: 1.75rem; font-weight: 700; color: ${projection.percentChange < 0 ? 'var(--danger)' : 'var(--secondary)'};">
                                ${projection.percentChange > 0 ? '+' : ''}${projection.percentChange.toFixed(1)}%
                            </div>
                        </div>
                        <div>
                            <div style="font-size: 0.875rem; color: var(--gray-500);">Jobs Impact</div>
                            <div style="font-size: 1.75rem; font-weight: 700; color: ${projection.absoluteChange < 0 ? 'var(--danger)' : 'var(--secondary)'};">
                                ${projection.absoluteChange > 0 ? '+' : ''}${(projection.absoluteChange / 1000).toFixed(0)}K
                            </div>
                        </div>
                        <div>
                            <div style="font-size: 0.875rem; color: var(--gray-500);">Projected Employment</div>
                            <div style="font-size: 1.75rem; font-weight: 700; color: var(--gray-900);">
                                ${(projection.projectedEmployment / 1e6).toFixed(2)}M
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Task-Level Analysis -->
                <div class="card" style="margin-bottom: 24px;">
                    <div class="card-header">
                        <h3>Task-Level AI Exposure Analysis</h3>
                    </div>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Task</th>
                                <th>Type</th>
                                <th>AI Exposure</th>
                                <th>Automation Likelihood</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${taskImpact.map(task => `
                                <tr>
                                    <td><strong>${task.name}</strong></td>
                                    <td style="font-size: 0.75rem; color: var(--gray-500);">
                                        ${task.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </td>
                                    <td>
                                        <div style="display: flex; align-items: center; gap: 8px;">
                                            <div style="width: 60px; height: 8px; background: var(--gray-200); border-radius: 4px; overflow: hidden;">
                                                <div style="height: 100%; width: ${task.adjustedExposure * 100}%; background: ${task.impact.color};"></div>
                                            </div>
                                            <span>${(task.adjustedExposure * 100).toFixed(0)}%</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span class="tag ${task.impact.level === 'high' ? 'tag-high' : task.impact.level === 'medium' ? 'tag-medium' : 'tag-low'}">
                                            ${task.automationLikelihood}
                                        </span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <!-- Skill Recommendations -->
                <div class="card">
                    <div class="card-header">
                        <h3>Recommended Skills for AI Era</h3>
                    </div>
                    <p style="color: var(--gray-600); margin-bottom: 16px;">
                        Workers in this occupation should consider developing these skills to adapt to AI-driven changes:
                    </p>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                        ${recommendations.map(skill => `
                            <span style="
                                background: var(--primary);
                                color: white;
                                padding: 8px 16px;
                                border-radius: 9999px;
                                font-size: 0.875rem;
                            ">${skill}</span>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }
}

// Global instance
const occupationDrilldown = new OccupationDrilldown();

// Export for ES modules
export { OccupationDrilldown, occupationDrilldown };

// Also export to window for backwards compatibility with script tags
if (typeof window !== 'undefined') {
    window.OccupationDrilldown = OccupationDrilldown;
    window.occupationDrilldown = occupationDrilldown;
}
