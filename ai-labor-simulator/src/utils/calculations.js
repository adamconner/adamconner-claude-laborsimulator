/**
 * Economic Calculations Utility Module
 * Helper functions for economic modeling and analysis
 */

const EconomicCalculations = {
    /**
     * Calculate compound growth
     */
    compoundGrowth(initial, rate, periods) {
        return initial * Math.pow(1 + rate, periods);
    },

    /**
     * Calculate CAGR (Compound Annual Growth Rate)
     */
    cagr(initial, final, years) {
        return Math.pow(final / initial, 1 / years) - 1;
    },

    /**
     * Calculate unemployment rate
     */
    unemploymentRate(employed, laborForce) {
        return ((laborForce - employed) / laborForce) * 100;
    },

    /**
     * Calculate labor force participation rate
     */
    lfpr(laborForce, workingAgePopulation) {
        return (laborForce / workingAgePopulation) * 100;
    },

    /**
     * Calculate employment-to-population ratio
     */
    employmentRatio(employed, population) {
        return (employed / population) * 100;
    },

    /**
     * Okun's Law: Relationship between unemployment and GDP
     * A 1% increase in unemployment typically corresponds to 2% decrease in GDP
     */
    okunsLaw(unemploymentChange, coefficient = 2) {
        return -coefficient * unemploymentChange;
    },

    /**
     * Phillips Curve: Relationship between unemployment and inflation
     */
    phillipsCurve(unemploymentRate, nairu = 4.5, coefficient = 0.5) {
        return coefficient * (nairu - unemploymentRate);
    },

    /**
     * Beveridge Curve: Relationship between unemployment and vacancies
     */
    beveridgeCurve(unemploymentRate, matchingEfficiency = 0.5) {
        // Simple hyperbolic approximation
        return matchingEfficiency / unemploymentRate;
    },

    /**
     * Calculate Gini coefficient from income distribution
     */
    giniCoefficient(incomes) {
        const sorted = [...incomes].sort((a, b) => a - b);
        const n = sorted.length;
        const mean = sorted.reduce((a, b) => a + b, 0) / n;

        let sum = 0;
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                sum += Math.abs(sorted[i] - sorted[j]);
            }
        }

        return sum / (2 * n * n * mean);
    },

    /**
     * Calculate labor share of income
     */
    laborShare(totalWages, gdp) {
        return (totalWages / gdp) * 100;
    },

    /**
     * Calculate productivity
     */
    productivity(output, hoursWorked) {
        return output / hoursWorked;
    },

    /**
     * Calculate real wage (inflation-adjusted)
     */
    realWage(nominalWage, priceIndex, baseIndex = 100) {
        return nominalWage * (baseIndex / priceIndex);
    },

    /**
     * Calculate wage polarization ratio
     */
    wagePolarization(percentile90, percentile10) {
        return percentile90 / percentile10;
    },

    /**
     * Automation exposure score based on task composition
     */
    automationExposure(tasks) {
        // Tasks is an array of { name, weight, automatable }
        const totalWeight = tasks.reduce((sum, t) => sum + t.weight, 0);
        const automatable = tasks.reduce((sum, t) =>
            sum + (t.automatable ? t.weight : 0), 0);
        return automatable / totalWeight;
    },

    /**
     * Job displacement estimate
     */
    displacementEstimate(employment, automationExposure, adoptionRate, timeframe) {
        // Gradual displacement based on adoption curve
        const annualRate = automationExposure * adoptionRate * 0.1;
        return employment * (1 - Math.pow(1 - annualRate, timeframe));
    },

    /**
     * New job creation estimate from AI
     */
    newJobEstimate(aiInvestment, jobMultiplier = 0.00001) {
        // Jobs created per dollar of AI investment
        return aiInvestment * jobMultiplier;
    },

    /**
     * Calculate Beveridge curve matching efficiency
     */
    matchingEfficiency(hires, unemployed, vacancies, elasticity = 0.5) {
        return hires / (Math.pow(unemployed, elasticity) * Math.pow(vacancies, 1 - elasticity));
    },

    /**
     * Calculate skill mismatch index
     */
    skillMismatch(jobRequirements, workerSkills) {
        // jobRequirements and workerSkills are objects with skill: level
        let mismatch = 0;
        let count = 0;

        for (const skill of Object.keys(jobRequirements)) {
            const required = jobRequirements[skill];
            const available = workerSkills[skill] || 0;
            mismatch += Math.max(0, required - available);
            count++;
        }

        return count > 0 ? mismatch / count : 0;
    },

    /**
     * Net present value calculation
     */
    npv(cashFlows, discountRate) {
        return cashFlows.reduce((sum, cf, t) =>
            sum + cf / Math.pow(1 + discountRate, t), 0);
    },

    /**
     * Calculate intervention ROI
     */
    interventionROI(costs, benefits, years) {
        const totalCost = costs.reduce((a, b) => a + b, 0);
        const totalBenefit = benefits.reduce((a, b) => a + b, 0);
        return ((totalBenefit - totalCost) / totalCost) * 100;
    },

    /**
     * Logistic (S-curve) function for adoption modeling
     */
    logistic(t, L = 1, k = 1, t0 = 0) {
        return L / (1 + Math.exp(-k * (t - t0)));
    },

    /**
     * Moving average calculation
     */
    movingAverage(data, window) {
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const start = Math.max(0, i - window + 1);
            const values = data.slice(start, i + 1);
            result.push(values.reduce((a, b) => a + b, 0) / values.length);
        }
        return result;
    },

    /**
     * Linear regression
     */
    linearRegression(xValues, yValues) {
        const n = xValues.length;
        const sumX = xValues.reduce((a, b) => a + b, 0);
        const sumY = yValues.reduce((a, b) => a + b, 0);
        const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
        const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        return { slope, intercept };
    },

    /**
     * Forecast using linear trend
     */
    forecast(historicalData, periods) {
        const xValues = historicalData.map((_, i) => i);
        const yValues = historicalData;
        const { slope, intercept } = this.linearRegression(xValues, yValues);

        const forecasts = [];
        for (let i = 0; i < periods; i++) {
            forecasts.push(slope * (historicalData.length + i) + intercept);
        }

        return forecasts;
    },

    /**
     * Calculate standard deviation
     */
    standardDeviation(values) {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
        return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / values.length);
    },

    /**
     * Calculate correlation coefficient
     */
    correlation(x, y) {
        const n = x.length;
        const meanX = x.reduce((a, b) => a + b, 0) / n;
        const meanY = y.reduce((a, b) => a + b, 0) / n;

        let numerator = 0;
        let denomX = 0;
        let denomY = 0;

        for (let i = 0; i < n; i++) {
            const dx = x[i] - meanX;
            const dy = y[i] - meanY;
            numerator += dx * dy;
            denomX += dx * dx;
            denomY += dy * dy;
        }

        return numerator / Math.sqrt(denomX * denomY);
    },

    /**
     * Format large numbers for display
     */
    formatNumber(num, precision = 1) {
        if (num >= 1e12) return (num / 1e12).toFixed(precision) + 'T';
        if (num >= 1e9) return (num / 1e9).toFixed(precision) + 'B';
        if (num >= 1e6) return (num / 1e6).toFixed(precision) + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(precision) + 'K';
        return num.toFixed(precision);
    },

    /**
     * Format currency
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    },

    /**
     * Format percentage
     */
    formatPercent(value, precision = 1) {
        return value.toFixed(precision) + '%';
    }
};

// Export for ES modules
export { EconomicCalculations };

// Also export to window for backwards compatibility with script tags
if (typeof window !== 'undefined') {
    window.EconomicCalculations = EconomicCalculations;
}
