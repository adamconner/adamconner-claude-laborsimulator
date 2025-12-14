/**
 * PDF Report Generator
 * Generates downloadable PDF reports from simulation results
 */

class PDFReportGenerator {
    constructor() {
        this.pageWidth = 595.28; // A4 width in points
        this.pageHeight = 841.89; // A4 height in points
        this.margin = 40;
        this.lineHeight = 14;
        this.currentY = this.margin;
    }

    /**
     * Generate and download PDF report
     */
    async generateReport(results, options = {}) {
        // Check if jsPDF is available, if not load it
        if (typeof jspdf === 'undefined' && typeof jsPDF === 'undefined') {
            await this.loadJsPDF();
        }

        const { jsPDF } = window.jspdf || window;
        const doc = new jsPDF('p', 'pt', 'a4');

        this.doc = doc;
        this.currentY = this.margin;

        const summary = results.summary;
        const scenario = results.scenario;

        // Title Page
        this.addTitlePage(scenario, summary);

        // Executive Summary
        this.addNewPage();
        this.addExecutiveSummary(summary, scenario);

        // Labor Market Projections
        this.addNewPage();
        this.addLaborMarketSection(summary);

        // AI Impact Analysis
        this.addNewPage();
        this.addAIImpactSection(summary);

        // Sector Analysis
        this.addNewPage();
        this.addSectorAnalysis(summary);

        // Intervention Analysis (if applicable)
        if (scenario.interventions && scenario.interventions.length > 0) {
            this.addNewPage();
            this.addInterventionSection(summary, scenario.interventions);
        }

        // Demographics Analysis (if available)
        if (summary.demographics) {
            this.addNewPage();
            this.addDemographicsSection(summary.demographics);
        }

        // Skills Gap Analysis (if available)
        if (summary.skills_gap) {
            this.addNewPage();
            this.addSkillsGapSection(summary.skills_gap);
        }

        // Methodology
        this.addNewPage();
        this.addMethodologySection(scenario);

        // Download
        const filename = `labor-market-simulation-${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(filename);

        return filename;
    }

    /**
     * Load jsPDF library dynamically
     */
    async loadJsPDF() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    /**
     * Add title page
     */
    addTitlePage(scenario, summary) {
        const doc = this.doc;
        const centerX = this.pageWidth / 2;

        // Title
        doc.setFontSize(28);
        doc.setFont('helvetica', 'bold');
        doc.text('AI Labor Market', centerX, 200, { align: 'center' });
        doc.text('Impact Simulation', centerX, 235, { align: 'center' });

        // Subtitle
        doc.setFontSize(16);
        doc.setFont('helvetica', 'normal');
        doc.text('Comprehensive Analysis Report', centerX, 280, { align: 'center' });

        // Scenario info
        doc.setFontSize(12);
        const scenarioName = scenario.name || 'Custom Scenario';
        doc.text(`Scenario: ${scenarioName}`, centerX, 340, { align: 'center' });

        const timeframe = `${summary.timeframe.start_year} - ${summary.timeframe.end_year}`;
        doc.text(`Timeframe: ${timeframe}`, centerX, 360, { align: 'center' });

        // Key metrics preview
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Key Projections', centerX, 420, { align: 'center' });

        doc.setFont('helvetica', 'normal');
        const metrics = [
            `Unemployment: ${summary.labor_market_changes.unemployment_rate.initial}% → ${summary.labor_market_changes.unemployment_rate.final}%`,
            `Jobs Displaced: ${this.formatNumber(summary.ai_impact.cumulative_displacement)}`,
            `Jobs Created: ${this.formatNumber(summary.ai_impact.cumulative_new_jobs)}`,
            `Net Impact: ${this.formatNumber(summary.ai_impact.net_impact)}`
        ];

        metrics.forEach((metric, i) => {
            doc.text(metric, centerX, 450 + (i * 20), { align: 'center' });
        });

        // Footer
        doc.setFontSize(10);
        doc.setTextColor(128);
        const date = new Date().toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
        doc.text(`Generated: ${date}`, centerX, this.pageHeight - 60, { align: 'center' });
        doc.text('AI Labor Market Impact Simulator', centerX, this.pageHeight - 45, { align: 'center' });
        doc.setTextColor(0);
    }

    /**
     * Add executive summary
     */
    addExecutiveSummary(summary, scenario) {
        this.addSectionHeader('Executive Summary');

        const ur = summary.labor_market_changes.unemployment_rate;
        const aiImpact = summary.ai_impact;

        // Overview paragraph
        const overviewText = `This simulation projects labor market outcomes from ${summary.timeframe.start_year} to ${summary.timeframe.end_year} under a scenario with ${scenario.targets.ai_adoption_rate}% AI adoption and ${scenario.targets.automation_pace} automation pace. The analysis indicates ${ur.change > 0 ? 'an increase' : 'a decrease'} in unemployment from ${ur.initial}% to ${ur.final}%.`;

        this.addParagraph(overviewText);
        this.currentY += 10;

        // Key findings
        this.addSubHeader('Key Findings');

        const findings = [
            `• Unemployment Rate Change: ${ur.change > 0 ? '+' : ''}${ur.change} percentage points`,
            `• Total Jobs Displaced by AI: ${this.formatNumber(aiImpact.cumulative_displacement)}`,
            `• New Jobs Created: ${this.formatNumber(aiImpact.cumulative_new_jobs)}`,
            `• Net Job Impact: ${this.formatNumber(aiImpact.net_impact)} ${aiImpact.net_impact >= 0 ? '(net positive)' : '(net negative)'}`,
            `• Average Wage Change: ${summary.wages.average_hourly.change_percent}%`
        ];

        findings.forEach(finding => {
            this.addText(finding);
        });

        this.currentY += 15;

        // Risk assessment
        this.addSubHeader('Risk Assessment');

        let riskLevel = 'Moderate';
        let riskColor = [255, 165, 0];
        if (parseFloat(ur.final) > 10) {
            riskLevel = 'High';
            riskColor = [255, 0, 0];
        } else if (parseFloat(ur.final) < 5) {
            riskLevel = 'Low';
            riskColor = [0, 128, 0];
        }

        this.doc.setTextColor(...riskColor);
        this.addText(`Overall Risk Level: ${riskLevel}`);
        this.doc.setTextColor(0);

        const riskFactors = [];
        if (aiImpact.net_impact < -1000000) {
            riskFactors.push('• Significant net job losses projected');
        }
        if (parseFloat(ur.final) > 8) {
            riskFactors.push('• Elevated unemployment exceeding historical norms');
        }
        if (parseFloat(summary.wages.average_hourly.change_percent) < 0) {
            riskFactors.push('• Wage pressure from automation');
        }

        if (riskFactors.length > 0) {
            riskFactors.forEach(factor => this.addText(factor));
        } else {
            this.addText('• No major risk factors identified');
        }
    }

    /**
     * Add labor market section
     */
    addLaborMarketSection(summary) {
        this.addSectionHeader('Labor Market Projections');

        const lm = summary.labor_market_changes;

        // Unemployment
        this.addSubHeader('Unemployment Rate');
        this.addText(`Initial: ${lm.unemployment_rate.initial}%`);
        this.addText(`Final: ${lm.unemployment_rate.final}%`);
        this.addText(`Change: ${lm.unemployment_rate.change > 0 ? '+' : ''}${lm.unemployment_rate.change} percentage points`);

        this.currentY += 10;

        // Employment
        this.addSubHeader('Total Employment');
        this.addText(`Initial: ${this.formatNumber(lm.total_employment.initial)} workers`);
        this.addText(`Final: ${this.formatNumber(lm.total_employment.final)} workers`);
        this.addText(`Change: ${this.formatNumber(lm.total_employment.change)} workers`);

        this.currentY += 10;

        // Job Openings
        this.addSubHeader('Job Openings');
        this.addText(`Initial: ${this.formatNumber(lm.job_openings.initial)}`);
        this.addText(`Final: ${this.formatNumber(lm.job_openings.final)}`);
        this.addText(`Change: ${this.formatNumber(lm.job_openings.change)}`);

        this.currentY += 10;

        // Wages
        this.addSubHeader('Wage Trends');
        this.addText(`Initial Average Hourly Wage: $${summary.wages.average_hourly.initial}`);
        this.addText(`Final Average Hourly Wage: $${summary.wages.average_hourly.final}`);
        this.addText(`Wage Growth: ${summary.wages.average_hourly.change_percent}%`);
    }

    /**
     * Add AI impact section
     */
    addAIImpactSection(summary) {
        this.addSectionHeader('AI & Automation Impact');

        const ai = summary.ai_impact;

        // Adoption
        this.addSubHeader('AI Adoption');
        this.addText(`Initial Adoption Rate: ${ai.ai_adoption.initial}%`);
        this.addText(`Final Adoption Rate: ${ai.ai_adoption.final}%`);

        this.currentY += 10;

        // Job displacement
        this.addSubHeader('Job Displacement');
        this.addText(`Cumulative Jobs Displaced: ${this.formatNumber(ai.cumulative_displacement)}`);
        this.addParagraph('Job displacement represents positions eliminated or significantly transformed by AI and automation technologies.');

        this.currentY += 10;

        // Job creation
        this.addSubHeader('Job Creation');
        this.addText(`Cumulative New Jobs Created: ${this.formatNumber(ai.cumulative_new_jobs)}`);
        this.addParagraph('New jobs include AI-adjacent roles, technology implementation positions, and emerging occupations enabled by automation.');

        this.currentY += 10;

        // Net impact
        this.addSubHeader('Net Impact Analysis');
        const netImpact = ai.net_impact;
        const impactType = netImpact >= 0 ? 'positive' : 'negative';
        this.addText(`Net Job Impact: ${this.formatNumber(netImpact)} (${impactType})`);

        if (netImpact < 0) {
            this.addParagraph(`The simulation projects a net loss of ${this.formatNumber(Math.abs(netImpact))} jobs. Policy interventions may help mitigate this impact.`);
        } else {
            this.addParagraph(`The simulation projects a net gain of ${this.formatNumber(netImpact)} jobs, suggesting job creation outpaces displacement in this scenario.`);
        }
    }

    /**
     * Add sector analysis
     */
    addSectorAnalysis(summary) {
        this.addSectionHeader('Sector-Level Analysis');

        const sectors = summary.sector_summary;

        // Most affected
        this.addSubHeader('Most Affected Sectors');
        if (sectors.most_affected) {
            sectors.most_affected.forEach((sector, i) => {
                const name = sector.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                this.addText(`${i + 1}. ${name}`);
                this.addText(`   Employment Change: ${this.formatNumber(sector.employment_change)} (${sector.employment_change_percent}%)`);
                this.addText(`   Automation Exposure: ${(sector.automation_exposure * 100).toFixed(0)}%`);
                this.currentY += 5;
            });
        }

        this.currentY += 10;

        // Least affected
        this.addSubHeader('Most Resilient Sectors');
        if (sectors.least_affected) {
            sectors.least_affected.forEach((sector, i) => {
                const name = sector.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                this.addText(`${i + 1}. ${name}`);
                this.addText(`   Employment Change: ${this.formatNumber(sector.employment_change)} (${sector.employment_change_percent}%)`);
                this.addText(`   Automation Exposure: ${(sector.automation_exposure * 100).toFixed(0)}%`);
                this.currentY += 5;
            });
        }
    }

    /**
     * Add intervention section
     */
    addInterventionSection(summary, interventions) {
        this.addSectionHeader('Policy Intervention Analysis');

        this.addParagraph(`This simulation includes ${interventions.length} active policy intervention(s) designed to mitigate negative labor market impacts.`);

        this.currentY += 10;

        // List interventions
        this.addSubHeader('Active Interventions');
        interventions.forEach((intervention, i) => {
            this.addText(`${i + 1}. ${intervention.name}`);
            if (intervention.description) {
                this.doc.setFontSize(10);
                this.addText(`   ${intervention.description.substring(0, 80)}...`);
                this.doc.setFontSize(11);
            }
            this.currentY += 5;
        });

        // Intervention effects summary
        if (summary.interventions) {
            this.currentY += 10;
            this.addSubHeader('Combined Intervention Effects');

            const effects = summary.interventions;
            this.addText(`Total Job Effect: ${this.formatNumber(effects.total_job_effect || 0)}`);
            this.addText(`Total Economic Impact: $${this.formatNumber(effects.total_economic_impact || 0)}`);
            this.addText(`Total Fiscal Cost: $${this.formatNumber(Math.abs(effects.total_fiscal_cost || 0))}${effects.total_fiscal_cost < 0 ? ' (revenue)' : ''}`);
        }
    }

    /**
     * Add demographics section
     */
    addDemographicsSection(demographics) {
        this.addSectionHeader('Demographic Impact Analysis');

        // Age groups
        if (demographics.by_age) {
            this.addSubHeader('Impact by Age Group');
            Object.entries(demographics.by_age).forEach(([age, data]) => {
                this.addText(`${age}: ${data.impact_level} impact (${data.displacement_rate}% displacement risk)`);
            });
            this.currentY += 10;
        }

        // Education
        if (demographics.by_education) {
            this.addSubHeader('Impact by Education Level');
            Object.entries(demographics.by_education).forEach(([edu, data]) => {
                this.addText(`${edu}: ${data.impact_level} impact (${data.displacement_rate}% displacement risk)`);
            });
            this.currentY += 10;
        }

        // Recommendations
        if (demographics.recommendations) {
            this.addSubHeader('Targeted Recommendations');
            demographics.recommendations.forEach((rec, i) => {
                this.addText(`${i + 1}. ${rec}`);
            });
        }
    }

    /**
     * Add skills gap section
     */
    addSkillsGapSection(skillsGap) {
        this.addSectionHeader('Skills Gap Analysis');

        // Declining skills
        if (skillsGap.declining_skills) {
            this.addSubHeader('Declining Skills');
            skillsGap.declining_skills.forEach(skill => {
                this.addText(`• ${skill.name} (-${skill.decline_rate}% demand)`);
            });
            this.currentY += 10;
        }

        // Growing skills
        if (skillsGap.growing_skills) {
            this.addSubHeader('In-Demand Skills');
            skillsGap.growing_skills.forEach(skill => {
                this.addText(`• ${skill.name} (+${skill.growth_rate}% demand)`);
            });
            this.currentY += 10;
        }

        // Training recommendations
        if (skillsGap.training_recommendations) {
            this.addSubHeader('Training Recommendations');
            skillsGap.training_recommendations.forEach((rec, i) => {
                this.addText(`${i + 1}. ${rec.program}: ${rec.duration} months, ${rec.cost}`);
            });
        }
    }

    /**
     * Add methodology section
     */
    addMethodologySection(scenario) {
        this.addSectionHeader('Methodology');

        this.addSubHeader('Simulation Parameters');
        this.addText(`Target Unemployment Rate: ${scenario.targets.unemployment_rate}%`);
        this.addText(`Target AI Adoption: ${scenario.targets.ai_adoption_rate}%`);
        this.addText(`Automation Pace: ${scenario.targets.automation_pace}`);
        this.addText(`Adoption Curve: ${scenario.ai_parameters.adoption_curve.replace('_', '-')}`);

        this.currentY += 15;

        this.addSubHeader('Model Description');
        this.addParagraph('This simulation uses a multi-factor economic model that projects labor market outcomes based on AI adoption trajectories, sector-specific automation exposure rates, historical employment patterns, and policy intervention effects.');

        this.currentY += 10;

        this.addParagraph('Key model components include:');
        const components = [
            '• Sector-specific automation exposure coefficients derived from occupational task analysis',
            '• AI adoption curves (linear, exponential, or S-curve) based on technology diffusion research',
            '• Labor market dynamics including job displacement, creation, and wage effects',
            '• Policy intervention models with fiscal cost and effectiveness estimates'
        ];
        components.forEach(c => this.addText(c));

        this.currentY += 15;

        this.addSubHeader('Limitations');
        this.addParagraph('This simulation provides projections based on model assumptions and historical patterns. Actual outcomes may vary due to unforeseen technological developments, policy changes, economic shocks, or other factors not captured in the model.');
    }

    /**
     * Helper: Add section header
     */
    addSectionHeader(text) {
        this.checkPageBreak(40);
        this.doc.setFontSize(18);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text(text, this.margin, this.currentY);
        this.currentY += 25;
        this.doc.setFontSize(11);
        this.doc.setFont('helvetica', 'normal');
    }

    /**
     * Helper: Add sub-header
     */
    addSubHeader(text) {
        this.checkPageBreak(25);
        this.doc.setFontSize(13);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text(text, this.margin, this.currentY);
        this.currentY += 18;
        this.doc.setFontSize(11);
        this.doc.setFont('helvetica', 'normal');
    }

    /**
     * Helper: Add text line
     */
    addText(text) {
        this.checkPageBreak(this.lineHeight);
        this.doc.text(text, this.margin, this.currentY);
        this.currentY += this.lineHeight;
    }

    /**
     * Helper: Add paragraph (wrapped text)
     */
    addParagraph(text) {
        const maxWidth = this.pageWidth - (this.margin * 2);
        const lines = this.doc.splitTextToSize(text, maxWidth);
        lines.forEach(line => {
            this.checkPageBreak(this.lineHeight);
            this.doc.text(line, this.margin, this.currentY);
            this.currentY += this.lineHeight;
        });
        this.currentY += 5;
    }

    /**
     * Helper: Check if need new page
     */
    checkPageBreak(neededSpace) {
        if (this.currentY + neededSpace > this.pageHeight - this.margin) {
            this.addNewPage();
        }
    }

    /**
     * Helper: Add new page
     */
    addNewPage() {
        this.doc.addPage();
        this.currentY = this.margin;

        // Add page number
        const pageNum = this.doc.internal.getNumberOfPages();
        this.doc.setFontSize(9);
        this.doc.setTextColor(128);
        this.doc.text(`Page ${pageNum}`, this.pageWidth - this.margin, this.pageHeight - 20, { align: 'right' });
        this.doc.setTextColor(0);
        this.doc.setFontSize(11);
    }

    /**
     * Helper: Format number
     */
    formatNumber(n) {
        if (n === undefined || n === null) return 'N/A';
        const num = parseFloat(n);
        if (isNaN(num)) return 'N/A';

        if (Math.abs(num) >= 1e9) return (num / 1e9).toFixed(1) + 'B';
        if (Math.abs(num) >= 1e6) return (num / 1e6).toFixed(1) + 'M';
        if (Math.abs(num) >= 1e3) return (num / 1e3).toFixed(1) + 'K';
        return num.toLocaleString();
    }
}

// Global instance
const pdfReportGenerator = new PDFReportGenerator();

// Export for use
window.PDFReportGenerator = PDFReportGenerator;
window.pdfReportGenerator = pdfReportGenerator;
