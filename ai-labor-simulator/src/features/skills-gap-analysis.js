/**
 * Skills Gap Analysis Module
 * Analyzes skill transitions, identifies gaps, and recommends training
 */

class SkillsGapAnalyzer {
    constructor() {
        // Skills taxonomy with current demand and automation risk
        this.skillsData = {
            // Declining skills (high automation risk)
            declining: {
                'Data Entry': { current_demand: 1200000, automation_risk: 0.95, decline_rate: 15, sector: 'administrative' },
                'Basic Bookkeeping': { current_demand: 800000, automation_risk: 0.90, decline_rate: 12, sector: 'finance' },
                'Assembly Line Work': { current_demand: 2500000, automation_risk: 0.85, decline_rate: 10, sector: 'manufacturing' },
                'Telemarketing': { current_demand: 400000, automation_risk: 0.90, decline_rate: 18, sector: 'retail' },
                'Cashier Operations': { current_demand: 3200000, automation_risk: 0.80, decline_rate: 8, sector: 'retail' },
                'Basic Customer Service': { current_demand: 2800000, automation_risk: 0.75, decline_rate: 7, sector: 'retail' },
                'Filing/Records Management': { current_demand: 600000, automation_risk: 0.88, decline_rate: 14, sector: 'administrative' },
                'Routine Analysis': { current_demand: 900000, automation_risk: 0.70, decline_rate: 6, sector: 'finance' },
                'Manual QA Testing': { current_demand: 450000, automation_risk: 0.72, decline_rate: 9, sector: 'technology' },
                'Basic Translation': { current_demand: 350000, automation_risk: 0.78, decline_rate: 11, sector: 'professional_services' }
            },
            // Growing skills (AI-resistant or AI-enhanced)
            growing: {
                'AI/ML Engineering': { current_demand: 280000, growth_rate: 35, avg_salary: 145000, training_months: 18, sector: 'technology' },
                'Data Science': { current_demand: 450000, growth_rate: 28, avg_salary: 125000, training_months: 12, sector: 'technology' },
                'Cybersecurity': { current_demand: 520000, growth_rate: 25, avg_salary: 115000, training_months: 12, sector: 'technology' },
                'Cloud Architecture': { current_demand: 380000, growth_rate: 22, avg_salary: 135000, training_months: 9, sector: 'technology' },
                'Healthcare Tech': { current_demand: 620000, growth_rate: 20, avg_salary: 85000, training_months: 12, sector: 'healthcare' },
                'Robotics Maintenance': { current_demand: 180000, growth_rate: 30, avg_salary: 72000, training_months: 9, sector: 'manufacturing' },
                'UX/UI Design': { current_demand: 340000, growth_rate: 18, avg_salary: 95000, training_months: 6, sector: 'technology' },
                'Digital Marketing': { current_demand: 580000, growth_rate: 15, avg_salary: 72000, training_months: 6, sector: 'professional_services' },
                'Project Management': { current_demand: 720000, growth_rate: 12, avg_salary: 95000, training_months: 6, sector: 'professional_services' },
                'Human-AI Collaboration': { current_demand: 150000, growth_rate: 45, avg_salary: 110000, training_months: 9, sector: 'technology' },
                'AI Ethics/Governance': { current_demand: 45000, growth_rate: 55, avg_salary: 120000, training_months: 12, sector: 'professional_services' },
                'Prompt Engineering': { current_demand: 85000, growth_rate: 80, avg_salary: 100000, training_months: 3, sector: 'technology' },
                'Renewable Energy Tech': { current_demand: 320000, growth_rate: 24, avg_salary: 78000, training_months: 12, sector: 'construction' },
                'Elder Care': { current_demand: 1800000, growth_rate: 18, avg_salary: 35000, training_months: 6, sector: 'healthcare' },
                'Mental Health Services': { current_demand: 420000, growth_rate: 22, avg_salary: 55000, training_months: 24, sector: 'healthcare' }
            },
            // Transition paths from declining to growing skills
            transitions: {
                'Data Entry': ['Data Science', 'Digital Marketing', 'Project Management'],
                'Basic Bookkeeping': ['Data Science', 'Cloud Architecture', 'AI Ethics/Governance'],
                'Assembly Line Work': ['Robotics Maintenance', 'Renewable Energy Tech', 'Healthcare Tech'],
                'Telemarketing': ['Digital Marketing', 'UX/UI Design', 'Project Management'],
                'Cashier Operations': ['Digital Marketing', 'Healthcare Tech', 'Elder Care'],
                'Basic Customer Service': ['UX/UI Design', 'Project Management', 'Mental Health Services'],
                'Filing/Records Management': ['Cybersecurity', 'Cloud Architecture', 'Project Management'],
                'Routine Analysis': ['Data Science', 'AI/ML Engineering', 'Prompt Engineering'],
                'Manual QA Testing': ['Cybersecurity', 'AI/ML Engineering', 'Human-AI Collaboration'],
                'Basic Translation': ['AI Ethics/Governance', 'Prompt Engineering', 'Digital Marketing']
            }
        };

        // Training programs database
        this.trainingPrograms = {
            'AI/ML Engineering': {
                programs: [
                    { name: 'Google ML Engineer Certificate', duration: 6, cost: '$300/month', provider: 'Coursera', format: 'Online' },
                    { name: 'AWS Machine Learning Specialty', duration: 3, cost: '$500 exam', provider: 'AWS', format: 'Self-paced' },
                    { name: 'University ML Bootcamp', duration: 12, cost: '$15,000', provider: 'Various', format: 'Hybrid' }
                ],
                prerequisites: ['Python programming', 'Statistics basics', 'Linear algebra'],
                career_paths: ['ML Engineer', 'AI Developer', 'Research Scientist']
            },
            'Data Science': {
                programs: [
                    { name: 'IBM Data Science Professional', duration: 5, cost: '$39/month', provider: 'Coursera', format: 'Online' },
                    { name: 'Data Science Bootcamp', duration: 6, cost: '$12,000', provider: 'Various', format: 'Intensive' },
                    { name: 'Google Data Analytics', duration: 4, cost: '$39/month', provider: 'Coursera', format: 'Online' }
                ],
                prerequisites: ['Excel proficiency', 'Basic statistics', 'SQL basics'],
                career_paths: ['Data Analyst', 'Data Scientist', 'Business Intelligence']
            },
            'Cybersecurity': {
                programs: [
                    { name: 'CompTIA Security+', duration: 3, cost: '$392 exam', provider: 'CompTIA', format: 'Self-paced' },
                    { name: 'Google Cybersecurity Certificate', duration: 6, cost: '$39/month', provider: 'Coursera', format: 'Online' },
                    { name: 'CISSP Certification', duration: 6, cost: '$749 exam', provider: 'ISC2', format: 'Self-paced' }
                ],
                prerequisites: ['Networking basics', 'Operating systems', 'IT fundamentals'],
                career_paths: ['Security Analyst', 'Penetration Tester', 'Security Engineer']
            },
            'Cloud Architecture': {
                programs: [
                    { name: 'AWS Solutions Architect', duration: 3, cost: '$300 exam', provider: 'AWS', format: 'Self-paced' },
                    { name: 'Google Cloud Professional', duration: 4, cost: '$200 exam', provider: 'Google', format: 'Self-paced' },
                    { name: 'Azure Administrator', duration: 3, cost: '$165 exam', provider: 'Microsoft', format: 'Self-paced' }
                ],
                prerequisites: ['IT fundamentals', 'Networking', 'Linux basics'],
                career_paths: ['Cloud Architect', 'DevOps Engineer', 'Platform Engineer']
            },
            'Prompt Engineering': {
                programs: [
                    { name: 'DeepLearning.AI Prompt Engineering', duration: 1, cost: 'Free', provider: 'DeepLearning.AI', format: 'Online' },
                    { name: 'Anthropic Prompt Design', duration: 1, cost: 'Free', provider: 'Anthropic', format: 'Online' },
                    { name: 'Enterprise AI Implementation', duration: 2, cost: '$500', provider: 'Various', format: 'Online' }
                ],
                prerequisites: ['Basic AI understanding', 'Writing skills', 'Domain expertise'],
                career_paths: ['Prompt Engineer', 'AI Product Manager', 'AI Consultant']
            },
            'Healthcare Tech': {
                programs: [
                    { name: 'Health Informatics Certificate', duration: 6, cost: '$5,000', provider: 'University', format: 'Online' },
                    { name: 'Epic Systems Certification', duration: 2, cost: '$3,000', provider: 'Epic', format: 'In-person' },
                    { name: 'Healthcare Data Analytics', duration: 4, cost: '$2,500', provider: 'Various', format: 'Online' }
                ],
                prerequisites: ['Healthcare experience', 'Basic IT skills', 'Data literacy'],
                career_paths: ['Health IT Specialist', 'Clinical Informatics', 'Medical Data Analyst']
            }
        };
    }

    /**
     * Analyze skills gap based on simulation results
     */
    analyzeSkillsGap(simulationResults) {
        const summary = simulationResults.summary;
        const sectorSummary = summary.sector_summary;
        const aiImpact = summary.ai_impact;

        // Calculate skill demand changes based on sector impacts
        const decliningSkills = this.analyzeDecliningSkills(sectorSummary, aiImpact);
        const growingSkills = this.analyzeGrowingSkills(sectorSummary, aiImpact);
        const transitionPaths = this.analyzeTransitionPaths(decliningSkills, growingSkills);
        const trainingRecommendations = this.generateTrainingRecommendations(transitionPaths, aiImpact);
        const gapMetrics = this.calculateGapMetrics(decliningSkills, growingSkills);

        return {
            declining_skills: decliningSkills,
            growing_skills: growingSkills,
            transition_paths: transitionPaths,
            training_recommendations: trainingRecommendations,
            gap_metrics: gapMetrics,
            sector_skill_needs: this.analyzeSectorSkillNeeds(sectorSummary)
        };
    }

    /**
     * Analyze declining skills with projected impact
     */
    analyzeDecliningSkills(sectorSummary, aiImpact) {
        const results = [];
        const displacementFactor = aiImpact.cumulative_displacement / 10000000; // Normalize

        for (const [skill, data] of Object.entries(this.skillsData.declining)) {
            // Find sector impact
            const sectorImpact = this.getSectorImpact(data.sector, sectorSummary);

            // Calculate projected decline
            const adjustedDecline = data.decline_rate * (1 + displacementFactor) * (1 + Math.abs(sectorImpact) / 100);
            const workersAffected = Math.round(data.current_demand * (adjustedDecline / 100));

            results.push({
                name: skill,
                current_workers: data.current_demand,
                decline_rate: Math.round(adjustedDecline),
                workers_affected: workersAffected,
                automation_risk: Math.round(data.automation_risk * 100) + '%',
                sector: data.sector,
                urgency: adjustedDecline > 12 ? 'Critical' : adjustedDecline > 8 ? 'High' : 'Moderate',
                transition_options: this.skillsData.transitions[skill] || []
            });
        }

        return results.sort((a, b) => b.decline_rate - a.decline_rate);
    }

    /**
     * Analyze growing skills with projected demand
     */
    analyzeGrowingSkills(sectorSummary, aiImpact) {
        const results = [];
        const adoptionFactor = parseFloat(aiImpact.ai_adoption.final) / 100;

        for (const [skill, data] of Object.entries(this.skillsData.growing)) {
            // AI-related skills grow faster with higher AI adoption
            let adjustedGrowth = data.growth_rate;
            if (['AI/ML Engineering', 'Data Science', 'Prompt Engineering', 'Human-AI Collaboration', 'AI Ethics/Governance'].includes(skill)) {
                adjustedGrowth *= (1 + adoptionFactor * 0.5);
            }

            const projectedDemand = Math.round(data.current_demand * (1 + adjustedGrowth / 100));
            const newPositions = projectedDemand - data.current_demand;

            results.push({
                name: skill,
                current_demand: data.current_demand,
                growth_rate: Math.round(adjustedGrowth),
                projected_demand: projectedDemand,
                new_positions: newPositions,
                avg_salary: '$' + data.avg_salary.toLocaleString(),
                training_months: data.training_months,
                sector: data.sector,
                opportunity_score: this.calculateOpportunityScore(adjustedGrowth, data.avg_salary, data.training_months)
            });
        }

        return results.sort((a, b) => b.opportunity_score - a.opportunity_score);
    }

    /**
     * Analyze transition paths from declining to growing skills
     */
    analyzeTransitionPaths(decliningSkills, growingSkills) {
        const paths = [];

        for (const declining of decliningSkills.slice(0, 5)) { // Top 5 declining
            const transitions = declining.transition_options;

            for (const targetSkill of transitions) {
                const growing = growingSkills.find(g => g.name === targetSkill);
                if (growing) {
                    const training = this.trainingPrograms[targetSkill];
                    paths.push({
                        from_skill: declining.name,
                        to_skill: targetSkill,
                        workers_needing_transition: declining.workers_affected,
                        salary_change: growing.avg_salary,
                        training_duration: growing.training_months + ' months',
                        difficulty: this.assessTransitionDifficulty(declining, growing),
                        recommended_programs: training?.programs?.slice(0, 2) || [],
                        success_likelihood: this.estimateSuccessLikelihood(declining, growing)
                    });
                }
            }
        }

        return paths.sort((a, b) => b.success_likelihood - a.success_likelihood);
    }

    /**
     * Generate training recommendations
     */
    generateTrainingRecommendations(transitionPaths, aiImpact) {
        const recommendations = [];
        const urgentSkills = new Set();

        // Identify most urgent training needs
        for (const path of transitionPaths.slice(0, 10)) {
            if (!urgentSkills.has(path.to_skill)) {
                urgentSkills.add(path.to_skill);

                const training = this.trainingPrograms[path.to_skill];
                if (training) {
                    recommendations.push({
                        skill: path.to_skill,
                        priority: path.difficulty === 'Low' ? 'High' : path.difficulty === 'Medium' ? 'Medium' : 'Low',
                        workers_to_train: path.workers_needing_transition,
                        programs: training.programs,
                        prerequisites: training.prerequisites,
                        career_outcomes: training.career_paths,
                        estimated_cost: this.estimateTrainingCost(training.programs, path.workers_needing_transition),
                        roi_estimate: this.estimateTrainingROI(path)
                    });
                }
            }
        }

        // Add AI-specific recommendations based on adoption rate
        const aiAdoption = parseFloat(aiImpact.ai_adoption.final);
        if (aiAdoption > 50) {
            recommendations.unshift({
                skill: 'AI Literacy (All Workers)',
                priority: 'Critical',
                workers_to_train: Math.round(aiImpact.cumulative_displacement * 0.8),
                programs: [
                    { name: 'AI Fundamentals for Everyone', duration: 1, cost: 'Free', provider: 'Various', format: 'Online' },
                    { name: 'Working with AI Tools', duration: 2, cost: '$200', provider: 'LinkedIn Learning', format: 'Online' }
                ],
                prerequisites: ['Basic computer skills'],
                career_outcomes: ['Enhanced productivity in any role'],
                estimated_cost: 'Low',
                roi_estimate: 'High'
            });
        }

        return recommendations;
    }

    /**
     * Calculate gap metrics
     */
    calculateGapMetrics(decliningSkills, growingSkills) {
        const totalDecliningWorkers = decliningSkills.reduce((sum, s) => sum + s.workers_affected, 0);
        const totalNewPositions = growingSkills.reduce((sum, s) => sum + s.new_positions, 0);

        const skillGap = totalDecliningWorkers - totalNewPositions;

        return {
            workers_needing_reskilling: totalDecliningWorkers,
            new_positions_available: totalNewPositions,
            net_skill_gap: skillGap,
            gap_status: skillGap > 0 ? 'Deficit' : 'Surplus',
            critical_skills_declining: decliningSkills.filter(s => s.urgency === 'Critical').length,
            high_opportunity_skills: growingSkills.filter(s => s.opportunity_score > 70).length,
            avg_retraining_time: Math.round(growingSkills.slice(0, 5).reduce((sum, s) => sum + s.training_months, 0) / 5) + ' months',
            market_readiness: skillGap > 1000000 ? 'Low' : skillGap > 500000 ? 'Moderate' : 'Good'
        };
    }

    /**
     * Analyze sector-specific skill needs
     */
    analyzeSectorSkillNeeds(sectorSummary) {
        const sectorNeeds = {};

        const sectorSkillMap = {
            technology: ['AI/ML Engineering', 'Cybersecurity', 'Cloud Architecture', 'Data Science'],
            healthcare: ['Healthcare Tech', 'Data Science', 'Elder Care', 'Mental Health Services'],
            manufacturing: ['Robotics Maintenance', 'AI/ML Engineering', 'Project Management'],
            retail: ['Digital Marketing', 'UX/UI Design', 'Data Science'],
            finance: ['Data Science', 'Cybersecurity', 'AI Ethics/Governance'],
            professional_services: ['Prompt Engineering', 'Project Management', 'AI Ethics/Governance']
        };

        for (const [sector, skills] of Object.entries(sectorSkillMap)) {
            const impact = this.getSectorImpact(sector, sectorSummary);
            sectorNeeds[sector] = {
                impact_level: Math.abs(impact) > 10 ? 'High' : Math.abs(impact) > 5 ? 'Moderate' : 'Low',
                priority_skills: skills,
                hiring_outlook: impact > 0 ? 'Growing' : impact < -5 ? 'Declining' : 'Stable'
            };
        }

        return sectorNeeds;
    }

    /**
     * Helper: Get sector impact from summary
     */
    getSectorImpact(sector, sectorSummary) {
        const found = [...(sectorSummary.most_affected || []), ...(sectorSummary.least_affected || [])]
            .find(s => s.name === sector);
        return found ? parseFloat(found.employment_change_percent) : 0;
    }

    /**
     * Helper: Calculate opportunity score
     */
    calculateOpportunityScore(growthRate, salary, trainingMonths) {
        const salaryScore = Math.min(100, salary / 1500);
        const growthScore = Math.min(100, growthRate * 2);
        const accessibilityScore = Math.max(0, 100 - trainingMonths * 4);

        return Math.round((salaryScore * 0.4 + growthScore * 0.4 + accessibilityScore * 0.2));
    }

    /**
     * Helper: Assess transition difficulty
     */
    assessTransitionDifficulty(fromSkill, toSkill) {
        const trainingMonths = toSkill.training_months;
        if (trainingMonths <= 6) return 'Low';
        if (trainingMonths <= 12) return 'Medium';
        return 'High';
    }

    /**
     * Helper: Estimate success likelihood
     */
    estimateSuccessLikelihood(fromSkill, toSkill) {
        let likelihood = 70;

        // Shorter training = higher likelihood
        if (toSkill.training_months <= 6) likelihood += 15;
        else if (toSkill.training_months > 12) likelihood -= 15;

        // Higher salary growth potential = higher motivation
        likelihood += toSkill.growth_rate > 20 ? 10 : 0;

        return Math.min(95, Math.max(30, likelihood));
    }

    /**
     * Helper: Estimate training cost
     */
    estimateTrainingCost(programs, workers) {
        if (!programs || programs.length === 0) return 'Unknown';

        const avgCost = programs.reduce((sum, p) => {
            const cost = p.cost.includes('Free') ? 0 :
                parseInt(p.cost.replace(/[^0-9]/g, '')) || 500;
            return sum + cost;
        }, 0) / programs.length;

        const total = avgCost * workers;
        if (total > 1e9) return '$' + (total / 1e9).toFixed(1) + 'B';
        if (total > 1e6) return '$' + (total / 1e6).toFixed(1) + 'M';
        return '$' + total.toLocaleString();
    }

    /**
     * Helper: Estimate training ROI
     */
    estimateTrainingROI(path) {
        const salaryNum = parseInt(path.salary_change.replace(/[^0-9]/g, ''));
        if (salaryNum > 100000) return 'Very High';
        if (salaryNum > 70000) return 'High';
        if (salaryNum > 50000) return 'Moderate';
        return 'Standard';
    }

    /**
     * Generate HTML display
     */
    generateHTML(analysis) {
        if (!analysis) return '<p>Skills gap analysis not available.</p>';

        return `
            <div class="skills-gap-analysis">
                <!-- Gap Metrics Summary -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 16px; margin-bottom: 24px;">
                    <div style="background: var(--gray-50); padding: 16px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 0.75rem; color: var(--gray-500); text-transform: uppercase;">Need Reskilling</div>
                        <div style="font-size: 1.25rem; font-weight: 700; color: var(--danger);">${this.formatNumber(analysis.gap_metrics.workers_needing_reskilling)}</div>
                    </div>
                    <div style="background: var(--gray-50); padding: 16px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 0.75rem; color: var(--gray-500); text-transform: uppercase;">New Positions</div>
                        <div style="font-size: 1.25rem; font-weight: 700; color: var(--secondary);">${this.formatNumber(analysis.gap_metrics.new_positions_available)}</div>
                    </div>
                    <div style="background: var(--gray-50); padding: 16px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 0.75rem; color: var(--gray-500); text-transform: uppercase;">Net Gap</div>
                        <div style="font-size: 1.25rem; font-weight: 700; color: ${analysis.gap_metrics.net_skill_gap > 0 ? 'var(--danger)' : 'var(--secondary)'};">${this.formatNumber(Math.abs(analysis.gap_metrics.net_skill_gap))}</div>
                        <div style="font-size: 0.7rem; color: var(--gray-400);">${analysis.gap_metrics.gap_status}</div>
                    </div>
                    <div style="background: var(--gray-50); padding: 16px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 0.75rem; color: var(--gray-500); text-transform: uppercase;">Avg Training</div>
                        <div style="font-size: 1.25rem; font-weight: 700; color: var(--primary);">${analysis.gap_metrics.avg_retraining_time}</div>
                    </div>
                </div>

                <!-- Declining Skills -->
                <h4 style="margin-bottom: 12px; color: var(--text-primary);">
                    <span style="color: var(--danger);">↓</span> Declining Skills
                </h4>
                <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px;">
                    ${analysis.declining_skills.slice(0, 6).map(skill => `
                        <span style="padding: 6px 12px; background: #fef2f2; color: #991b1b; border-radius: 16px; font-size: 0.8rem;">
                            ${skill.name} <span style="opacity: 0.7;">-${skill.decline_rate}%</span>
                        </span>
                    `).join('')}
                </div>

                <!-- Growing Skills -->
                <h4 style="margin-bottom: 12px; color: var(--text-primary);">
                    <span style="color: var(--secondary);">↑</span> In-Demand Skills
                </h4>
                <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px;">
                    ${analysis.growing_skills.slice(0, 6).map(skill => `
                        <span style="padding: 6px 12px; background: #ecfdf5; color: #065f46; border-radius: 16px; font-size: 0.8rem;">
                            ${skill.name} <span style="opacity: 0.7;">+${skill.growth_rate}%</span>
                        </span>
                    `).join('')}
                </div>

                <!-- Top Transition Paths -->
                <h4 style="margin-bottom: 12px; color: var(--text-primary);">Recommended Transitions</h4>
                <div style="display: grid; gap: 12px; margin-bottom: 20px;">
                    ${analysis.transition_paths.slice(0, 3).map(path => `
                        <div style="padding: 12px; background: var(--gray-50); border-radius: 8px; display: flex; align-items: center; gap: 12px;">
                            <div style="flex: 1;">
                                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                                    <span style="color: var(--danger); font-weight: 500;">${path.from_skill}</span>
                                    <span style="color: var(--gray-400);">→</span>
                                    <span style="color: var(--secondary); font-weight: 500;">${path.to_skill}</span>
                                </div>
                                <div style="font-size: 0.8rem; color: var(--gray-500);">
                                    ${path.training_duration} training • ${path.salary_change} avg salary • ${path.success_likelihood}% success rate
                                </div>
                            </div>
                            <div style="padding: 4px 10px; background: ${path.difficulty === 'Low' ? 'var(--secondary)' : path.difficulty === 'Medium' ? 'var(--warning)' : 'var(--danger)'}; color: white; border-radius: 12px; font-size: 0.7rem;">
                                ${path.difficulty}
                            </div>
                        </div>
                    `).join('')}
                </div>

                <!-- Training Recommendations -->
                <h4 style="margin-bottom: 12px; color: var(--text-primary);">Training Programs</h4>
                ${analysis.training_recommendations.slice(0, 3).map(rec => `
                    <div style="padding: 12px; background: var(--gray-50); border-radius: 8px; margin-bottom: 12px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <span style="font-weight: 600;">${rec.skill}</span>
                            <span style="padding: 2px 8px; background: ${rec.priority === 'Critical' ? 'var(--danger)' : rec.priority === 'High' ? 'var(--warning)' : 'var(--primary)'}; color: white; border-radius: 10px; font-size: 0.7rem;">
                                ${rec.priority} Priority
                            </span>
                        </div>
                        <div style="font-size: 0.85rem; color: var(--gray-600);">
                            ${rec.programs?.slice(0, 2).map(p => `${p.name} (${p.duration}mo, ${p.cost})`).join(' • ') || 'Various programs available'}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * Format number helper
     */
    formatNumber(n) {
        if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(1) + 'M';
        if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(0) + 'K';
        return n.toLocaleString();
    }
}

// Global instance
const skillsGapAnalyzer = new SkillsGapAnalyzer();

// Export for ES modules
export { SkillsGapAnalyzer, skillsGapAnalyzer };

// Also export to window for backwards compatibility with script tags
if (typeof window !== 'undefined') {
    window.SkillsGapAnalyzer = SkillsGapAnalyzer;
    window.skillsGapAnalyzer = skillsGapAnalyzer;
}
