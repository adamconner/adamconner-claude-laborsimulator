/**
 * Intervention Cost Calculator
 * Calculates fiscal costs and ROI for policy interventions
 */

class InterventionCostCalculator {
    constructor() {
        // US economic baseline assumptions
        this.assumptions = {
            adultPopulation: 258000000, // US adult population (18+)
            averageWage: 59428, // Average annual wage
            workingPopulation: 160000000, // Labor force
            avgHoursPerWeek: 38.6,
            taxRevenueMultiplier: 0.25, // Avg effective tax rate
            gdp: 25.5e12 // US GDP in dollars
        };
    }

    /**
     * Calculate costs for all active interventions
     * @param {Array} interventions - Active interventions
     * @param {Object} simulationResults - Simulation results with displacement data
     * @returns {Object} Cost analysis results
     */
    calculateAllCosts(interventions, simulationResults) {
        const results = {
            interventions: [],
            totalCost: 0,
            totalRevenue: 0,
            netCost: 0,
            totalJobsSaved: 0,
            costPerJobSaved: 0
        };

        if (!interventions || interventions.length === 0) {
            return results;
        }

        // Get displacement data from simulation - correct path is ai_impact
        const summary = simulationResults?.summary || {};
        const jobsDisplaced = summary.ai_impact?.cumulative_displacement || 0;
        const yearsSimulated = this.getYearsSimulated(simulationResults);

        interventions.forEach(intervention => {
            const costAnalysis = this.calculateInterventionCost(
                intervention,
                jobsDisplaced,
                yearsSimulated
            );
            results.interventions.push(costAnalysis);
            results.totalCost += costAnalysis.annualCost * yearsSimulated;
            results.totalRevenue += costAnalysis.annualRevenue * yearsSimulated;
            results.totalJobsSaved += costAnalysis.estimatedJobsSaved;
        });

        results.netCost = results.totalCost - results.totalRevenue;
        results.costPerJobSaved = results.totalJobsSaved > 0
            ? results.netCost / results.totalJobsSaved
            : 0;

        return results;
    }

    /**
     * Calculate cost for a single intervention
     */
    calculateInterventionCost(intervention, jobsDisplaced, years) {
        const type = intervention.type;
        const params = intervention.parameters || {};

        let annualCost = 0;
        let annualRevenue = 0;
        let estimatedJobsSaved = 0;
        let description = '';

        switch (type) {
            case 'ubi':
                const result = this.calculateUBICost(params, jobsDisplaced);
                annualCost = result.cost;
                estimatedJobsSaved = result.jobsSaved;
                description = result.description;
                break;

            case 'job_retraining':
                const retraining = this.calculateRetrainingCost(params, jobsDisplaced, years);
                annualCost = retraining.cost;
                estimatedJobsSaved = retraining.jobsSaved;
                description = retraining.description;
                break;

            case 'wage_subsidy':
                const subsidy = this.calculateWageSubsidyCost(params, jobsDisplaced);
                annualCost = subsidy.cost;
                estimatedJobsSaved = subsidy.jobsSaved;
                description = subsidy.description;
                break;

            case 'reduced_workweek':
                const workweek = this.calculateReducedWorkweekCost(params);
                annualCost = workweek.cost;
                estimatedJobsSaved = workweek.jobsSaved;
                description = workweek.description;
                break;

            case 'robot_tax':
                const robotTax = this.calculateRobotTaxRevenue(params, jobsDisplaced);
                annualRevenue = robotTax.revenue;
                estimatedJobsSaved = robotTax.jobsSaved;
                description = robotTax.description;
                break;

            case 'education_subsidy':
                const education = this.calculateEducationSubsidyCost(params);
                annualCost = education.cost;
                estimatedJobsSaved = education.jobsSaved;
                description = education.description;
                break;

            default:
                description = 'Cost model not available for this intervention';
        }

        const roi = annualCost > 0 && estimatedJobsSaved > 0
            ? (estimatedJobsSaved * this.assumptions.averageWage) / annualCost
            : annualRevenue > 0 ? 'Revenue generating' : 0;

        return {
            name: intervention.name,
            type: type,
            annualCost,
            annualRevenue,
            netAnnualCost: annualCost - annualRevenue,
            estimatedJobsSaved,
            costPerJob: estimatedJobsSaved > 0 ? (annualCost - annualRevenue) / estimatedJobsSaved : 0,
            roi,
            description
        };
    }

    /**
     * Calculate UBI costs
     */
    calculateUBICost(params, jobsDisplaced) {
        const monthlyAmount = params.monthly_amount || 1000;
        const annualAmount = monthlyAmount * 12;

        // If phase_out_threshold is 0, it's truly universal
        const phaseOut = params.phase_out_threshold || 0;
        const eligiblePopulation = phaseOut === 0
            ? this.assumptions.adultPopulation
            : this.assumptions.adultPopulation * 0.7; // Assume 70% eligible with means testing

        const grossCost = eligiblePopulation * annualAmount;

        // Economic effects (stimulated consumption, reduced social costs)
        const economicBenefit = grossCost * 0.15; // Conservative multiplier
        const reducedSocialCosts = jobsDisplaced * 15000; // Reduced welfare, healthcare, crime costs

        const netCost = grossCost - economicBenefit - reducedSocialCosts;

        // Jobs "saved" through entrepreneurship and consumer spending
        const jobsFromSpending = Math.floor((grossCost * 0.7) / this.assumptions.averageWage * 0.1);

        return {
            cost: netCost,
            jobsSaved: jobsFromSpending,
            description: `$${monthlyAmount}/month to ${this.formatNumber(eligiblePopulation)} adults. Gross: $${this.formatNumber(grossCost)}/yr`
        };
    }

    /**
     * Calculate job retraining costs
     */
    calculateRetrainingCost(params, jobsDisplaced, years) {
        const fundingPerWorker = params.funding_per_worker || 10000;
        const successRate = (params.success_rate || 60) / 100;

        // Annual participants based on displacement
        const annualParticipants = Math.ceil(jobsDisplaced / years);
        const annualCost = annualParticipants * fundingPerWorker;

        // Jobs saved = successful retraining completers
        const jobsSaved = Math.floor(annualParticipants * successRate);

        return {
            cost: annualCost,
            jobsSaved: jobsSaved,
            description: `$${this.formatNumber(fundingPerWorker)} per worker, ${annualParticipants.toLocaleString()} annual participants, ${Math.round(successRate * 100)}% success rate`
        };
    }

    /**
     * Calculate wage subsidy costs
     */
    calculateWageSubsidyCost(params, jobsDisplaced) {
        const subsidyRate = (params.subsidy_rate || 25) / 100;
        const maxWageCovered = params.max_wage_covered || 50000;

        // Assume subsidy covers jobs that would otherwise be displaced
        const jobsCovered = Math.floor(jobsDisplaced * 0.8); // 80% of at-risk jobs
        const avgSubsidy = Math.min(this.assumptions.averageWage, maxWageCovered) * subsidyRate;
        const annualCost = jobsCovered * avgSubsidy;

        // Jobs saved = jobs covered that wouldn't exist without subsidy
        const jobsSaved = Math.floor(jobsCovered * 0.7); // 70% effectiveness

        return {
            cost: annualCost,
            jobsSaved: jobsSaved,
            description: `${Math.round(subsidyRate * 100)}% subsidy on wages up to $${this.formatNumber(maxWageCovered)}, covering ${jobsCovered.toLocaleString()} jobs`
        };
    }

    /**
     * Calculate reduced workweek costs
     */
    calculateReducedWorkweekCost(params) {
        const targetHours = params.target_hours || 32;
        const currentHours = this.assumptions.avgHoursPerWeek;
        const hourReduction = (currentHours - targetHours) / currentHours;

        // Government cost depends on wage adjustment approach
        const wageAdjustment = params.wage_adjustment || 'partial_subsidy';
        let costMultiplier = 0;

        switch (wageAdjustment) {
            case 'full_wage':
                costMultiplier = hourReduction * 0.5; // Gov covers half the gap
                break;
            case 'partial_subsidy':
                costMultiplier = hourReduction * 0.25;
                break;
            case 'proportional':
                costMultiplier = 0; // No gov cost, workers accept lower pay
                break;
        }

        const annualCost = this.assumptions.workingPopulation * this.assumptions.averageWage * costMultiplier;

        // Jobs created by spreading work
        const jobsCreated = Math.floor(this.assumptions.workingPopulation * hourReduction * 0.6); // 60% of theoretical max

        return {
            cost: annualCost,
            jobsSaved: jobsCreated,
            description: `${targetHours}hr week (from ${currentHours}hrs), ${wageAdjustment.replace('_', ' ')} approach`
        };
    }

    /**
     * Calculate robot tax revenue
     */
    calculateRobotTaxRevenue(params, jobsDisplaced) {
        const taxRate = (params.tax_rate || 5) / 100;

        // Revenue based on labor cost savings from automation
        const avgLaborCost = this.assumptions.averageWage * 1.3; // Include benefits
        const laborSavings = jobsDisplaced * avgLaborCost;
        const annualRevenue = laborSavings * taxRate;

        // Slight slowdown in automation = jobs "saved"
        const automationSlowdown = taxRate * 0.1; // 10% of tax rate slows adoption
        const jobsSaved = Math.floor(jobsDisplaced * automationSlowdown);

        return {
            revenue: annualRevenue,
            jobsSaved: jobsSaved,
            description: `${Math.round(taxRate * 100)}% tax on automation savings, generating $${this.formatNumber(annualRevenue)}/yr in revenue`
        };
    }

    /**
     * Calculate education subsidy costs
     */
    calculateEducationSubsidyCost(params) {
        const fundingLevel = params.funding_increase || 20;
        const currentEducationSpending = 800e9; // ~$800B current US education spending

        const additionalSpending = currentEducationSpending * (fundingLevel / 100);

        // Long-term job effects (10-20 year horizon compressed)
        const graduatesPerYear = 4000000; // Approx college graduates
        const improvedOutcomes = graduatesPerYear * 0.05; // 5% better employment outcomes

        return {
            cost: additionalSpending,
            jobsSaved: Math.floor(improvedOutcomes),
            description: `${fundingLevel}% increase in education funding, improving outcomes for ${this.formatNumber(improvedOutcomes)} graduates annually`
        };
    }

    /**
     * Get years simulated from results
     */
    getYearsSimulated(results) {
        if (!results?.scenario?.timeframe) return 5;
        const { start_year, end_year } = results.scenario.timeframe;
        return end_year - start_year;
    }

    /**
     * Format large numbers
     */
    formatNumber(n) {
        if (n >= 1e12) return '$' + (n / 1e12).toFixed(1) + 'T';
        if (n >= 1e9) return '$' + (n / 1e9).toFixed(1) + 'B';
        if (n >= 1e6) return '$' + (n / 1e6).toFixed(1) + 'M';
        if (n >= 1e3) return '$' + (n / 1e3).toFixed(1) + 'K';
        return '$' + n.toFixed(0);
    }

    /**
     * Generate summary HTML
     */
    generateSummaryHTML(analysis) {
        if (!analysis || analysis.interventions.length === 0) {
            return `
                <div style="text-align: center; padding: 24px; color: var(--gray-500);">
                    <p>No interventions active. Add interventions to see cost analysis.</p>
                </div>
            `;
        }

        const interventionRows = analysis.interventions.map(i => `
            <tr>
                <td><strong>${i.name}</strong></td>
                <td style="text-align: right;">${i.annualCost > 0 ? this.formatNumber(i.annualCost) : '-'}</td>
                <td style="text-align: right; color: var(--secondary);">${i.annualRevenue > 0 ? this.formatNumber(i.annualRevenue) : '-'}</td>
                <td style="text-align: right;">${i.estimatedJobsSaved.toLocaleString()}</td>
                <td style="text-align: right;">${i.costPerJob > 0 ? this.formatNumber(i.costPerJob) : 'N/A'}</td>
                <td style="text-align: right;">${typeof i.roi === 'number' ? i.roi.toFixed(2) + 'x' : i.roi}</td>
            </tr>
        `).join('');

        return `
            <div style="margin-bottom: 24px;">
                <!-- Summary Cards -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin-bottom: 24px;">
                    <div style="background: var(--gray-50); padding: 16px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 0.75rem; color: var(--gray-500); text-transform: uppercase;">Total Cost</div>
                        <div style="font-size: 1.25rem; font-weight: 700; color: var(--danger);">${this.formatNumber(analysis.totalCost)}</div>
                    </div>
                    <div style="background: var(--gray-50); padding: 16px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 0.75rem; color: var(--gray-500); text-transform: uppercase;">Tax Revenue</div>
                        <div style="font-size: 1.25rem; font-weight: 700; color: var(--secondary);">${this.formatNumber(analysis.totalRevenue)}</div>
                    </div>
                    <div style="background: var(--gray-50); padding: 16px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 0.75rem; color: var(--gray-500); text-transform: uppercase;">Net Cost</div>
                        <div style="font-size: 1.25rem; font-weight: 700; color: var(--gray-900);">${this.formatNumber(analysis.netCost)}</div>
                    </div>
                    <div style="background: var(--gray-50); padding: 16px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 0.75rem; color: var(--gray-500); text-transform: uppercase;">Jobs Saved</div>
                        <div style="font-size: 1.25rem; font-weight: 700; color: var(--primary);">${analysis.totalJobsSaved.toLocaleString()}</div>
                    </div>
                    <div style="background: var(--gray-50); padding: 16px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 0.75rem; color: var(--gray-500); text-transform: uppercase;">Cost Per Job</div>
                        <div style="font-size: 1.25rem; font-weight: 700; color: var(--warning);">${this.formatNumber(analysis.costPerJobSaved)}</div>
                    </div>
                </div>

                <!-- Detailed Table -->
                <table class="data-table" style="font-size: 0.875rem;">
                    <thead>
                        <tr>
                            <th>Intervention</th>
                            <th style="text-align: right;">Annual Cost</th>
                            <th style="text-align: right;">Revenue</th>
                            <th style="text-align: right;">Jobs Saved</th>
                            <th style="text-align: right;">Cost/Job</th>
                            <th style="text-align: right;">ROI</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${interventionRows}
                    </tbody>
                </table>

                <p style="font-size: 0.75rem; color: var(--gray-400); margin-top: 12px;">
                    * Costs are estimates based on economic models. Actual costs depend on implementation details.
                    ROI = (Jobs Saved × Avg Wage) / Net Cost. Values >1 indicate positive economic return.
                </p>
            </div>
        `;
    }
}

// Global instance
const interventionCostCalculator = new InterventionCostCalculator();

// Export for ES modules
export { InterventionCostCalculator, interventionCostCalculator };

// Also export to window for backwards compatibility with script tags
if (typeof window !== 'undefined') {
    window.InterventionCostCalculator = InterventionCostCalculator;
    window.interventionCostCalculator = interventionCostCalculator;
}
