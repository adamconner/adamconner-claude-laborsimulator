/**
 * Historical Data Module for ML Forecasting
 * Fetches and caches BLS/FRED economic time series data
 */

/**
 * Historical data series configuration
 */
const DATA_SERIES = {
    unemployment_rate: {
        source: 'FRED',
        seriesId: 'UNRATE',
        name: 'Unemployment Rate',
        frequency: 'monthly'
    },
    employment: {
        source: 'FRED',
        seriesId: 'PAYEMS',
        name: 'Total Nonfarm Payrolls',
        frequency: 'monthly'
    },
    labor_force: {
        source: 'FRED',
        seriesId: 'CLF16OV',
        name: 'Civilian Labor Force',
        frequency: 'monthly'
    },
    wages: {
        source: 'FRED',
        seriesId: 'CES0500000003',
        name: 'Average Hourly Earnings',
        frequency: 'monthly'
    },
    productivity: {
        source: 'FRED',
        seriesId: 'OPHNFB',
        name: 'Nonfarm Business Sector Productivity',
        frequency: 'quarterly'
    }
};

/**
 * Historical data cache with IndexedDB persistence
 */
class HistoricalDataCache {
    constructor() {
        this.memoryCache = new Map();
        this.dbName = 'LaborSimulatorML';
        this.storeName = 'historicalData';
        this.db = null;
    }

    async init() {
        if (typeof indexedDB === 'undefined') return;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName, { keyPath: 'seriesId' });
                }
            };
        });
    }

    async get(seriesId) {
        // Check memory cache first
        if (this.memoryCache.has(seriesId)) {
            const cached = this.memoryCache.get(seriesId);
            // Refresh if older than 24 hours
            if (Date.now() - cached.timestamp < 24 * 60 * 60 * 1000) {
                return cached.data;
            }
        }

        // Check IndexedDB
        if (this.db) {
            const data = await this.getFromDb(seriesId);
            if (data && Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
                this.memoryCache.set(seriesId, data);
                return data.data;
            }
        }

        return null;
    }

    async set(seriesId, data) {
        const entry = {
            seriesId,
            data,
            timestamp: Date.now()
        };

        this.memoryCache.set(seriesId, entry);

        if (this.db) {
            await this.setToDb(entry);
        }
    }

    getFromDb(seriesId) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(this.storeName, 'readonly');
            const store = tx.objectStore(this.storeName);
            const request = store.get(seriesId);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    }

    setToDb(entry) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(this.storeName, 'readwrite');
            const store = tx.objectStore(this.storeName);
            const request = store.put(entry);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }
}

/**
 * Historical data service for fetching BLS/FRED data
 */
class HistoricalDataService {
    constructor() {
        this.cache = new HistoricalDataCache();
        this.fredBaseUrl = 'https://api.stlouisfed.org/fred/series/observations';
        this.apiKey = null; // Optional - works without for limited requests
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;
        await this.cache.init();
        this.initialized = true;
    }

    /**
     * Fetch historical series from FRED
     */
    async fetchSeries(seriesConfig, startYear = 2010) {
        await this.init();

        // Check cache first
        const cached = await this.cache.get(seriesConfig.seriesId);
        if (cached) return cached;

        // Fetch from FRED
        const startDate = `${startYear}-01-01`;
        const params = new URLSearchParams({
            series_id: seriesConfig.seriesId,
            observation_start: startDate,
            file_type: 'json'
        });

        if (this.apiKey) {
            params.set('api_key', this.apiKey);
        }

        try {
            const response = await fetch(`${this.fredBaseUrl}?${params}`);

            if (!response.ok) {
                console.warn(`FRED API request failed for ${seriesConfig.seriesId}, using fallback data`);
                return this.getFallbackData(seriesConfig);
            }

            const json = await response.json();
            const data = this.processObservations(json.observations, seriesConfig);

            await this.cache.set(seriesConfig.seriesId, data);
            return data;
        } catch (error) {
            console.warn(`Error fetching ${seriesConfig.seriesId}:`, error);
            return this.getFallbackData(seriesConfig);
        }
    }

    /**
     * Process FRED observations into normalized format
     */
    processObservations(observations, seriesConfig) {
        return observations
            .filter(obs => obs.value !== '.')
            .map(obs => ({
                date: new Date(obs.date),
                year: new Date(obs.date).getFullYear(),
                month: new Date(obs.date).getMonth() + 1,
                value: parseFloat(obs.value),
                series: seriesConfig.seriesId,
                name: seriesConfig.name
            }));
    }

    /**
     * Fallback historical data when API is unavailable
     */
    getFallbackData(seriesConfig) {
        const fallbackData = {
            UNRATE: this.generateFallbackUnemployment(),
            PAYEMS: this.generateFallbackEmployment(),
            CLF16OV: this.generateFallbackLaborForce(),
            CES0500000003: this.generateFallbackWages(),
            OPHNFB: this.generateFallbackProductivity()
        };

        return fallbackData[seriesConfig.seriesId] || [];
    }

    generateFallbackUnemployment() {
        // Historical unemployment rate approximations (2010-2024)
        const rates = [
            9.6, 8.9, 8.1, 7.4, 6.2, 5.3, 4.9, 4.4, 3.9, 3.7,
            8.1, 5.4, 3.6, 3.6, 4.1
        ];
        return this.generateMonthlyFromAnnual(rates, 2010);
    }

    generateFallbackEmployment() {
        // Total employment in thousands
        const values = [
            129818, 131253, 133738, 136377, 138939, 141822, 144306, 146598, 149911, 151768,
            142318, 146104, 152536, 155938, 158088
        ];
        return this.generateMonthlyFromAnnual(values, 2010);
    }

    generateFallbackLaborForce() {
        const values = [
            153889, 153617, 154975, 155389, 155922, 157130, 159187, 160320, 162075, 163539,
            160742, 161204, 164048, 166747, 168113
        ];
        return this.generateMonthlyFromAnnual(values, 2010);
    }

    generateFallbackWages() {
        const values = [
            22.59, 23.10, 23.38, 23.87, 24.45, 25.00, 25.51, 26.14, 26.98, 27.77,
            28.78, 29.85, 31.35, 32.82, 34.38
        ];
        return this.generateMonthlyFromAnnual(values, 2010);
    }

    generateFallbackProductivity() {
        const values = [
            100.0, 100.5, 101.0, 101.8, 102.3, 103.1, 103.6, 104.5, 105.8, 106.9,
            107.2, 108.3, 109.5, 110.8, 112.1
        ];
        return this.generateMonthlyFromAnnual(values, 2010, 'quarterly');
    }

    generateMonthlyFromAnnual(annualValues, startYear, frequency = 'monthly') {
        const data = [];
        const step = frequency === 'quarterly' ? 3 : 1;

        for (let i = 0; i < annualValues.length; i++) {
            const year = startYear + i;
            const startValue = annualValues[i];
            const endValue = annualValues[i + 1] || startValue * 1.01;

            for (let month = 1; month <= 12; month += step) {
                const progress = (month - 1) / 12;
                const value = startValue + (endValue - startValue) * progress;

                data.push({
                    date: new Date(year, month - 1, 1),
                    year,
                    month,
                    value: parseFloat(value.toFixed(2))
                });
            }
        }

        return data;
    }

    /**
     * Get all historical series for ML training
     */
    async getAllSeries(startYear = 2010) {
        const results = {};

        for (const [key, config] of Object.entries(DATA_SERIES)) {
            results[key] = await this.fetchSeries(config, startYear);
        }

        return results;
    }

    /**
     * Prepare data for TensorFlow.js model
     */
    async prepareTrainingData(seriesKey = 'unemployment_rate', lookback = 12) {
        const series = await this.fetchSeries(DATA_SERIES[seriesKey]);

        if (!series || series.length < lookback + 1) {
            throw new Error('Insufficient data for training');
        }

        const values = series.map(d => d.value);

        // Normalize values
        const min = Math.min(...values);
        const max = Math.max(...values);
        const normalized = values.map(v => (v - min) / (max - min));

        // Create sequences
        const X = [];
        const y = [];

        for (let i = lookback; i < normalized.length; i++) {
            X.push(normalized.slice(i - lookback, i));
            y.push(normalized[i]);
        }

        return {
            X,
            y,
            min,
            max,
            dates: series.slice(lookback).map(d => d.date),
            rawValues: values.slice(lookback)
        };
    }

    /**
     * Get latest value for a series
     */
    async getLatestValue(seriesKey) {
        const config = DATA_SERIES[seriesKey];
        if (!config) return null;

        const series = await this.fetchSeries(config);
        return series && series.length > 0 ? series[series.length - 1] : null;
    }
}

// Export
export { HistoricalDataService, HistoricalDataCache, DATA_SERIES };

if (typeof window !== 'undefined') {
    window.HistoricalDataService = HistoricalDataService;
    window.DATA_SERIES = DATA_SERIES;
}
