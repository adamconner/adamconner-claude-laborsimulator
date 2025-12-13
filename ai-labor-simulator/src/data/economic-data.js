/**
 * Economic Data Integration Module
 * Fetches and manages data from BLS, FRED, and other government sources
 */

class EconomicDataService {
    constructor() {
        this.cache = new Map();
        this.cacheExpiry = 3600000; // 1 hour
        this.baselineData = null;
        this.liveData = null;

        // API endpoints
        this.endpoints = {
            bls: 'https://api.bls.gov/publicAPI/v2/timeseries/data/',
            fred: 'https://api.stlouisfed.org/fred/series/observations'
        };

        // BLS Series IDs for key indicators
        this.blsSeries = {
            unemployment_rate: 'LNS14000000',
            total_employment: 'CES0000000001',
            labor_force_participation: 'LNS11300000',
            average_hourly_earnings: 'CES0500000003',
            job_openings: 'JTS000000000000000JOL',
            quits_rate: 'JTS000000000000000QUR',
            productivity: 'PRS85006092',
            // Sector employment
            manufacturing_employment: 'CES3000000001',
            retail_employment: 'CES4200000001',
            healthcare_employment: 'CES6562000001',
            technology_employment: 'CES5051200001',
            finance_employment: 'CES5500000001',
            transportation_employment: 'CES4300000001',
            construction_employment: 'CES2000000001'
        };

        // FRED Series IDs
        this.fredSeries = {
            gdp: 'GDP',
            real_gdp_growth: 'A191RL1Q225SBEA',
            labor_share: 'LABSHPUSA156NRUG',
            corporate_profits: 'CP',
            business_investment: 'PNFI',
            median_income: 'MEHOINUSA672N',
            gini_coefficient: 'SIPOVGINIUSA'
        };
    }

    /**
     * Load baseline data from JSON file
     */
    async loadBaselineData() {
        if (this.baselineData) return this.baselineData;

        try {
            const response = await fetch('./data/baseline-data.json');
            this.baselineData = await response.json();

            // Also try to load live data
            await this.loadLiveData();

            return this.baselineData;
        } catch (error) {
            console.error('Failed to load baseline data:', error);
            throw error;
        }
    }

    /**
     * Load live data from GitHub Actions-updated JSON file
     */
    async loadLiveData() {
        if (this.liveData) return this.liveData;

        try {
            const response = await fetch('./data/live-data.json');
            if (response.ok) {
                this.liveData = await response.json();
                console.log('Live data loaded, last updated:', this.liveData.lastUpdated);
                return this.liveData;
            }
        } catch (error) {
            console.log('No live data available, using baseline data');
        }
        return null;
    }

    /**
     * Get live data status
     */
    getLiveDataStatus() {
        if (!this.liveData) {
            return {
                available: false,
                lastUpdated: null,
                sources: { bls: 'unavailable', fred: 'unavailable' }
            };
        }

        return {
            available: true,
            lastUpdated: this.liveData.lastUpdated,
            sources: this.liveData.sources || {},
            summary: this.liveData.summary || {}
        };
    }

    /**
     * Get current economic snapshot
     * Uses live data from GitHub Actions when available, falls back to baseline
     */
    async getCurrentSnapshot() {
        const baseline = await this.loadBaselineData();
        const live = this.liveData;

        // Use live data if available and valid, otherwise use baseline
        const useLive = live && live.summary && live.sources?.bls === 'success';

        // Get values, preferring live data
        const unemployment_rate = useLive && live.summary.unemployment_rate
            ? live.summary.unemployment_rate
            : baseline.labor_market.unemployment_rate.value;

        const total_employment = useLive && live.summary.total_employment
            ? live.summary.total_employment
            : baseline.labor_market.total_employment.value;

        const labor_force_participation = useLive && live.summary.labor_force_participation
            ? live.summary.labor_force_participation
            : baseline.labor_market.labor_force_participation.value;

        const job_openings = useLive && live.summary.job_openings
            ? live.summary.job_openings
            : baseline.labor_market.job_openings.value;

        const average_hourly = useLive && live.summary.average_hourly_earnings
            ? live.summary.average_hourly_earnings
            : baseline.wages.average_hourly_earnings.value;

        return {
            timestamp: new Date().toISOString(),
            dataSource: useLive ? 'live' : 'baseline',
            dataDate: useLive ? live.summary.data_date : 'Oct 2024',
            lastUpdated: useLive ? live.lastUpdated : null,
            labor_market: {
                total_employment: total_employment,
                unemployment_rate: unemployment_rate,
                labor_force_participation: labor_force_participation,
                job_openings: job_openings,
                unemployed_count: Math.round(
                    total_employment *
                    (unemployment_rate / 100) /
                    (1 - unemployment_rate / 100)
                )
            },
            wages: {
                median_weekly: baseline.wages.median_weekly_earnings.value,
                average_hourly: average_hourly,
                real_wage_growth: baseline.wages.real_wage_growth.value
            },
            productivity: {
                growth_rate: baseline.productivity.labor_productivity_growth.value,
                output_per_hour: baseline.productivity.output_per_hour.value
            },
            sectors: baseline.sectors,
            ai_indicators: baseline.ai_indicators,
            demographics: baseline.demographics
        };
    }

    /**
     * Fetch data from BLS API
     * @param {string[]} seriesIds - BLS series IDs to fetch
     * @param {number} startYear - Start year
     * @param {number} endYear - End year
     * @param {string} apiKey - BLS API key (optional)
     */
    async fetchBLSData(seriesIds, startYear, endYear, apiKey = null) {
        const cacheKey = `bls_${seriesIds.join('_')}_${startYear}_${endYear}`;

        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheExpiry) {
                return cached.data;
            }
        }

        const payload = {
            seriesid: seriesIds,
            startyear: startYear.toString(),
            endyear: endYear.toString()
        };

        if (apiKey) {
            payload.registrationkey = apiKey;
        }

        try {
            const response = await fetch(this.endpoints.bls, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (data.status === 'REQUEST_SUCCEEDED') {
                this.cache.set(cacheKey, {
                    timestamp: Date.now(),
                    data: data.Results.series
                });
                return data.Results.series;
            }

            throw new Error(`BLS API error: ${data.message}`);
        } catch (error) {
            console.warn('BLS API fetch failed, using baseline data:', error);
            return this.getHistoricalFromBaseline(seriesIds);
        }
    }

    /**
     * Fetch data from FRED API
     * @param {string} seriesId - FRED series ID
     * @param {string} apiKey - FRED API key
     * @param {string} startDate - Start date (YYYY-MM-DD)
     * @param {string} endDate - End date (YYYY-MM-DD)
     */
    async fetchFREDData(seriesId, apiKey, startDate = null, endDate = null) {
        const cacheKey = `fred_${seriesId}_${startDate}_${endDate}`;

        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheExpiry) {
                return cached.data;
            }
        }

        let url = `${this.endpoints.fred}?series_id=${seriesId}&api_key=${apiKey}&file_type=json`;
        if (startDate) url += `&observation_start=${startDate}`;
        if (endDate) url += `&observation_end=${endDate}`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            this.cache.set(cacheKey, {
                timestamp: Date.now(),
                data: data.observations
            });

            return data.observations;
        } catch (error) {
            console.warn('FRED API fetch failed:', error);
            return null;
        }
    }

    /**
     * Get historical data from baseline when API unavailable
     */
    getHistoricalFromBaseline(indicators) {
        if (!this.baselineData) return null;

        const historical = this.baselineData.historical_trends;
        const result = {};

        indicators.forEach(indicator => {
            if (historical[indicator]) {
                result[indicator] = historical[indicator];
            }
        });

        return result;
    }

    /**
     * Get sector-specific data
     */
    async getSectorData() {
        const baseline = await this.loadBaselineData();
        return baseline.sectors;
    }

    /**
     * Get demographic breakdown
     */
    async getDemographicData() {
        const baseline = await this.loadBaselineData();
        return baseline.demographics;
    }

    /**
     * Get AI-specific indicators
     */
    async getAIIndicators() {
        const baseline = await this.loadBaselineData();
        return baseline.ai_indicators;
    }

    /**
     * Get historical trends
     */
    async getHistoricalTrends() {
        const baseline = await this.loadBaselineData();
        return baseline.historical_trends;
    }

    /**
     * Calculate derived metrics
     */
    calculateDerivedMetrics(snapshot) {
        const { labor_market, wages, productivity } = snapshot;

        return {
            // Employment-to-population ratio
            employment_ratio: (labor_market.total_employment / 210000000) * 100,

            // Beveridge curve point (vacancy rate vs unemployment)
            vacancy_rate: (labor_market.job_openings /
                (labor_market.total_employment + labor_market.job_openings)) * 100,

            // Labor market tightness
            market_tightness: labor_market.job_openings / labor_market.unemployed_count,

            // Productivity-wage gap (indexed)
            productivity_wage_gap: productivity.output_per_hour -
                (wages.average_hourly / 0.30), // Rough indexing

            // Annual wages estimate
            annual_median_wage: wages.median_weekly * 52
        };
    }

    /**
     * Export data for analysis
     */
    async exportData(format = 'json') {
        const snapshot = await this.getCurrentSnapshot();
        const derived = this.calculateDerivedMetrics(snapshot);

        const exportData = {
            snapshot,
            derived,
            historical: await this.getHistoricalTrends(),
            exported_at: new Date().toISOString()
        };

        if (format === 'json') {
            return JSON.stringify(exportData, null, 2);
        }

        // CSV format for key metrics
        if (format === 'csv') {
            const rows = [
                ['Metric', 'Value', 'Unit'],
                ['Unemployment Rate', snapshot.labor_market.unemployment_rate, '%'],
                ['Total Employment', snapshot.labor_market.total_employment, 'persons'],
                ['Labor Force Participation', snapshot.labor_market.labor_force_participation, '%'],
                ['Job Openings', snapshot.labor_market.job_openings, 'positions'],
                ['Median Weekly Earnings', snapshot.wages.median_weekly, 'USD'],
                ['Productivity Growth', snapshot.productivity.growth_rate, '%'],
                ['Market Tightness', derived.market_tightness.toFixed(2), 'ratio']
            ];

            return rows.map(row => row.join(',')).join('\n');
        }

        return exportData;
    }
}

// Export for use in other modules
window.EconomicDataService = EconomicDataService;
