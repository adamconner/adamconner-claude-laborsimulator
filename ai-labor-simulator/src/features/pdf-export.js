/**
 * PDF Export Module
 * Generates printable reports from simulation results
 */

class PDFExporter {
    constructor() {
        this.reportStyles = `
            @media print {
                body {
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                    color: #111827;
                    line-height: 1.6;
                }
                .no-print { display: none !important; }
                .page-break { page-break-before: always; }
                .report-section { margin-bottom: 24px; }
                table { width: 100%; border-collapse: collapse; }
                th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
                th { background: #f9fafb; font-weight: 600; }
            }
        `;
    }

    /**
     * Generate and open print dialog for simulation report
     */
    generateReport(results, options = {}) {
        if (!results) {
            alert('No simulation results to export. Please run a simulation first.');
            return;
        }

        const reportContent = this.buildReportHTML(results, options);
        this.openPrintWindow(reportContent);
    }

    /**
     * Build report HTML content
     */
    buildReportHTML(results, options) {
        const summary = results.summary;
        const scenario = results.scenario;
        const timestamp = new Date().toLocaleString();

        const includeCharts = options.includeCharts !== false;
        const includeRawData = options.includeRawData === true;

        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>AI Labor Market Simulation Report - ${scenario.name}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            color: #111827;
            line-height: 1.6;
            padding: 40px;
            max-width: 1000px;
            margin: 0 auto;
        }
        .report-header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 2px solid #3b82f6;
        }
        .report-header h1 { font-size: 24px; margin-bottom: 8px; }
        .report-header p { color: #6b7280; }
        .section { margin-bottom: 32px; }
        .section h2 {
            font-size: 18px;
            color: #1f2937;
            margin-bottom: 16px;
            padding-bottom: 8px;
            border-bottom: 1px solid #e5e7eb;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
            margin-bottom: 24px;
        }
        .stat-box {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 16px;
            text-align: center;
        }
        .stat-box .label { font-size: 12px; color: #6b7280; margin-bottom: 4px; }
        .stat-box .value { font-size: 24px; font-weight: 700; }
        .stat-box .value.positive { color: #10b981; }
        .stat-box .value.negative { color: #ef4444; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
        th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        th { background: #f9fafb; font-weight: 600; font-size: 12px; text-transform: uppercase; color: #6b7280; }
        .highlight { background: #fef3c7; }
        .tag {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 9999px;
            font-size: 11px;
            font-weight: 500;
        }
        .tag-high { background: #fee2e2; color: #ef4444; }
        .tag-medium { background: #fef3c7; color: #f59e0b; }
        .tag-low { background: #d1fae5; color: #10b981; }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            font-size: 12px;
            color: #9ca3af;
        }
        .page-break { page-break-before: always; }
        @media print {
            body { padding: 20px; }
            .no-print { display: none !important; }
        }
    </style>
</head>
<body>
    <div class="report-header">
        <h1>AI Labor Market Impact Simulation Report</h1>
        <p><strong>${scenario.name}</strong> | Generated: ${timestamp}</p>
    </div>

    <!-- Executive Summary -->
    <div class="section">
        <h2>Executive Summary</h2>
        <div class="stats-grid">
            <div class="stat-box">
                <div class="label">Final Unemployment Rate</div>
                <div class="value ${parseFloat(summary.labor_market_changes.unemployment_rate.final) > 6 ? 'negative' : ''}">
                    ${summary.labor_market_changes.unemployment_rate.final}%
                </div>
            </div>
            <div class="stat-box">
                <div class="label">Net Job Impact</div>
                <div class="value ${summary.ai_impact.net_impact < 0 ? 'negative' : 'positive'}">
                    ${summary.ai_impact.net_impact > 0 ? '+' : ''}${(summary.ai_impact.net_impact / 1e6).toFixed(2)}M
                </div>
            </div>
            <div class="stat-box">
                <div class="label">Jobs Displaced</div>
                <div class="value negative">
                    ${(summary.ai_impact.cumulative_displacement / 1e6).toFixed(2)}M
                </div>
            </div>
            <div class="stat-box">
                <div class="label">Jobs Created</div>
                <div class="value positive">
                    ${(summary.ai_impact.cumulative_new_jobs / 1e6).toFixed(2)}M
                </div>
            </div>
        </div>
    </div>

    <!-- Scenario Configuration -->
    <div class="section">
        <h2>Scenario Configuration</h2>
        <table>
            <tbody>
                <tr>
                    <td><strong>Timeframe</strong></td>
                    <td>${scenario.timeframe.start_year} - ${scenario.timeframe.end_year} (${scenario.timeframe.end_year - scenario.timeframe.start_year} years)</td>
                </tr>
                <tr>
                    <td><strong>Target Unemployment Rate</strong></td>
                    <td>${scenario.targets.unemployment_rate}%</td>
                </tr>
                <tr>
                    <td><strong>Target AI Adoption Rate</strong></td>
                    <td>${scenario.targets.ai_adoption_rate}%</td>
                </tr>
                <tr>
                    <td><strong>Automation Pace</strong></td>
                    <td>${scenario.targets.automation_pace.charAt(0).toUpperCase() + scenario.targets.automation_pace.slice(1)}</td>
                </tr>
                <tr>
                    <td><strong>Adoption Curve</strong></td>
                    <td>${scenario.ai_parameters.adoption_curve.replace('_', '-').replace(/\b\w/g, l => l.toUpperCase())}</td>
                </tr>
                <tr>
                    <td><strong>New Job Multiplier</strong></td>
                    <td>${scenario.ai_parameters.new_job_multiplier}</td>
                </tr>
                <tr>
                    <td><strong>Active Interventions</strong></td>
                    <td>${scenario.interventions.length > 0 ?
                        scenario.interventions.map(i => i.name).join(', ') : 'None'}</td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- Labor Market Outcomes -->
    <div class="section">
        <h2>Labor Market Outcomes</h2>
        <table>
            <thead>
                <tr>
                    <th>Indicator</th>
                    <th>Initial</th>
                    <th>Final</th>
                    <th>Change</th>
                </tr>
            </thead>
            <tbody>
                <tr class="highlight">
                    <td><strong>Unemployment Rate</strong></td>
                    <td>${summary.labor_market_changes.unemployment_rate.initial}%</td>
                    <td>${summary.labor_market_changes.unemployment_rate.final}%</td>
                    <td>${parseFloat(summary.labor_market_changes.unemployment_rate.change) > 0 ? '+' : ''}${summary.labor_market_changes.unemployment_rate.change}%</td>
                </tr>
                <tr>
                    <td><strong>Total Employment</strong></td>
                    <td>${(summary.labor_market_changes.total_employment.initial / 1e6).toFixed(2)}M</td>
                    <td>${(summary.labor_market_changes.total_employment.final / 1e6).toFixed(2)}M</td>
                    <td>${summary.labor_market_changes.total_employment.change > 0 ? '+' : ''}${(summary.labor_market_changes.total_employment.change / 1e6).toFixed(2)}M</td>
                </tr>
                <tr>
                    <td><strong>Job Openings</strong></td>
                    <td>${(summary.labor_market_changes.job_openings.initial / 1e6).toFixed(2)}M</td>
                    <td>${(summary.labor_market_changes.job_openings.final / 1e6).toFixed(2)}M</td>
                    <td>${summary.labor_market_changes.job_openings.change > 0 ? '+' : ''}${(summary.labor_market_changes.job_openings.change / 1e6).toFixed(2)}M</td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- Economic Indicators -->
    <div class="section">
        <h2>Economic Indicators</h2>
        <table>
            <thead>
                <tr>
                    <th>Indicator</th>
                    <th>Initial</th>
                    <th>Final</th>
                    <th>Change</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Productivity Growth</strong></td>
                    <td>${summary.productivity.growth_rate.initial}%</td>
                    <td>${summary.productivity.growth_rate.final}%</td>
                    <td>${(parseFloat(summary.productivity.growth_rate.final) - parseFloat(summary.productivity.growth_rate.initial)) > 0 ? '+' : ''}${(parseFloat(summary.productivity.growth_rate.final) - parseFloat(summary.productivity.growth_rate.initial)).toFixed(1)}%</td>
                </tr>
                <tr>
                    <td><strong>Average Hourly Wage</strong></td>
                    <td>$${summary.wages.average_hourly.initial}</td>
                    <td>$${summary.wages.average_hourly.final}</td>
                    <td>${parseFloat(summary.wages.average_hourly.change_percent) > 0 ? '+' : ''}${summary.wages.average_hourly.change_percent}%</td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- AI Impact -->
    <div class="section">
        <h2>AI Impact Analysis</h2>
        <div class="stats-grid">
            <div class="stat-box">
                <div class="label">AI Adoption (Initial)</div>
                <div class="value">${summary.ai_impact.ai_adoption.initial}%</div>
            </div>
            <div class="stat-box">
                <div class="label">AI Adoption (Final)</div>
                <div class="value">${summary.ai_impact.ai_adoption.final}%</div>
            </div>
            <div class="stat-box">
                <div class="label">Total Jobs Displaced</div>
                <div class="value negative">${(summary.ai_impact.cumulative_displacement / 1e6).toFixed(2)}M</div>
            </div>
            <div class="stat-box">
                <div class="label">Total Jobs Created</div>
                <div class="value positive">${(summary.ai_impact.cumulative_new_jobs / 1e6).toFixed(2)}M</div>
            </div>
        </div>
    </div>

    ${scenario.interventions.length > 0 ? `
    <!-- Policy Interventions -->
    <div class="section page-break">
        <h2>Policy Interventions</h2>
        <table>
            <thead>
                <tr>
                    <th>Intervention</th>
                    <th>Category</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${scenario.interventions.map(intervention => `
                    <tr>
                        <td><strong>${intervention.name}</strong></td>
                        <td>${intervention.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</td>
                        <td><span class="tag tag-low">Active</span></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
    ` : ''}

    <!-- Year-by-Year Projections -->
    <div class="section ${scenario.interventions.length > 0 ? '' : 'page-break'}">
        <h2>Year-by-Year Projections</h2>
        <table>
            <thead>
                <tr>
                    <th>Year</th>
                    <th>UR (%)</th>
                    <th>Employment (M)</th>
                    <th>AI Adoption (%)</th>
                    <th>Jobs Displaced (K)</th>
                    <th>Jobs Created (K)</th>
                    <th>Productivity (%)</th>
                </tr>
            </thead>
            <tbody>
                ${results.results.map(year => `
                    <tr>
                        <td><strong>${year.year}</strong></td>
                        <td>${year.unemployment_rate.toFixed(1)}</td>
                        <td>${(year.employment / 1e6).toFixed(2)}</td>
                        <td>${year.ai_adoption.toFixed(1)}</td>
                        <td>${(year.jobs_displaced / 1000).toFixed(0)}</td>
                        <td>${(year.jobs_created / 1000).toFixed(0)}</td>
                        <td>${year.productivity_growth.toFixed(1)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <!-- Methodology Notes -->
    <div class="section">
        <h2>Methodology Notes</h2>
        <p style="font-size: 13px; color: #6b7280;">
            This simulation uses economic modeling based on historical labor market data from the Bureau of Labor Statistics,
            combined with AI adoption projections from research institutions including the Anthropic Economic Index,
            MIT Iceberg Index, and IMF working papers. Job displacement and creation estimates are derived from
            sector-level automation exposure analysis using O*NET task frameworks. All projections are hypothetical
            and intended for educational and research purposes only. Actual labor market outcomes will depend on
            numerous factors not captured in this model.
        </p>
    </div>

    <div class="footer">
        <p>AI Labor Market Impact Simulator | Report generated automatically</p>
        <p style="margin-top: 4px;">This report is for informational purposes only and should not be considered financial or policy advice.</p>
    </div>

    <div class="no-print" style="text-align: center; margin-top: 40px;">
        <button onclick="window.print()" style="
            background: #3b82f6;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-size: 14px;
            cursor: pointer;
        ">Print / Save as PDF</button>
        <button onclick="window.close()" style="
            background: #e5e7eb;
            color: #374151;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-size: 14px;
            cursor: pointer;
            margin-left: 8px;
        ">Close</button>
    </div>
</body>
</html>
        `;
    }

    /**
     * Open print window with report content
     */
    openPrintWindow(content) {
        const printWindow = window.open('', '_blank', 'width=1000,height=800');
        if (!printWindow) {
            alert('Please allow pop-ups to generate the PDF report.');
            return;
        }
        printWindow.document.write(content);
        printWindow.document.close();
    }

    /**
     * Generate quick summary text
     */
    generateQuickSummary(results) {
        const summary = results.summary;
        const scenario = results.scenario;

        return `
AI Labor Market Simulation Summary
==================================
Scenario: ${scenario.name}
Timeframe: ${scenario.timeframe.start_year}-${scenario.timeframe.end_year}

Key Results:
- Final Unemployment: ${summary.labor_market_changes.unemployment_rate.final}% (${parseFloat(summary.labor_market_changes.unemployment_rate.change) > 0 ? '+' : ''}${summary.labor_market_changes.unemployment_rate.change}%)
- Jobs Displaced: ${(summary.ai_impact.cumulative_displacement / 1e6).toFixed(2)}M
- Jobs Created: ${(summary.ai_impact.cumulative_new_jobs / 1e6).toFixed(2)}M
- Net Impact: ${summary.ai_impact.net_impact > 0 ? '+' : ''}${(summary.ai_impact.net_impact / 1e6).toFixed(2)}M jobs
- Final AI Adoption: ${summary.ai_impact.ai_adoption.final}%

Configuration:
- Target Unemployment: ${scenario.targets.unemployment_rate}%
- AI Adoption Rate: ${scenario.targets.ai_adoption_rate}%
- Automation Pace: ${scenario.targets.automation_pace}
- Interventions: ${scenario.interventions.length > 0 ? scenario.interventions.map(i => i.name).join(', ') : 'None'}
        `.trim();
    }
}

// Global instance
const pdfExporter = new PDFExporter();

// Export for ES modules
export { PDFExporter, pdfExporter };

// Also export to window for backwards compatibility with script tags
if (typeof window !== 'undefined') {
    window.PDFExporter = PDFExporter;
    window.pdfExporter = pdfExporter;
}
