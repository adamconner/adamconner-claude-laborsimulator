/**
 * ML Forecasting Service
 * Time series forecasting using TensorFlow.js for labor market predictions
 */

import { HistoricalDataService, DATA_SERIES } from './historical-data.js';

/**
 * Time Series Forecaster using TensorFlow.js
 */
class TimeSeriesForecaster {
    constructor() {
        this.model = null;
        this.lookback = 12; // 12 months lookback
        this.isLoaded = false;
        this.historicalData = new HistoricalDataService();
        this.normParams = {};
        this.tfLoaded = false;
    }

    /**
     * Check if TensorFlow.js is available
     */
    async checkTensorFlow() {
        if (typeof tf !== 'undefined') {
            this.tfLoaded = true;
            return true;
        }

        // Try to load TensorFlow.js dynamically
        try {
            await this.loadTensorFlowScript();
            this.tfLoaded = typeof tf !== 'undefined';
            return this.tfLoaded;
        } catch (error) {
            console.warn('TensorFlow.js not available, using fallback forecasting');
            return false;
        }
    }

    loadTensorFlowScript() {
        return new Promise((resolve, reject) => {
            if (typeof tf !== 'undefined') {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.17.0/dist/tf.min.js';
            script.async = true;
            script.onload = () => {
                console.log('TensorFlow.js loaded successfully');
                resolve();
            };
            script.onerror = () => reject(new Error('Failed to load TensorFlow.js'));
            document.head.appendChild(script);
        });
    }

    /**
     * Build LSTM model for time series forecasting
     */
    buildModel() {
        if (!this.tfLoaded) return null;

        const model = tf.sequential();

        // LSTM layer
        model.add(tf.layers.lstm({
            units: 32,
            inputShape: [this.lookback, 1],
            returnSequences: false
        }));

        // Dropout for regularization
        model.add(tf.layers.dropout({ rate: 0.2 }));

        // Dense output layer
        model.add(tf.layers.dense({ units: 1 }));

        model.compile({
            optimizer: tf.train.adam(0.001),
            loss: 'meanSquaredError',
            metrics: ['mae']
        });

        return model;
    }

    /**
     * Train model on historical data
     */
    async train(seriesKey = 'unemployment_rate', epochs = 50) {
        const hasTf = await this.checkTensorFlow();

        if (!hasTf) {
            console.log('Using statistical fallback for forecasting');
            this.isLoaded = true;
            return { fallback: true };
        }

        // Prepare training data
        const { X, y, min, max } = await this.historicalData.prepareTrainingData(seriesKey, this.lookback);

        this.normParams[seriesKey] = { min, max };

        // Convert to tensors
        const xTensor = tf.tensor3d(X.map(seq => seq.map(v => [v])));
        const yTensor = tf.tensor2d(y.map(v => [v]));

        // Build and train model
        this.model = this.buildModel();

        const history = await this.model.fit(xTensor, yTensor, {
            epochs,
            batchSize: 16,
            validationSplit: 0.2,
            shuffle: true,
            callbacks: {
                onEpochEnd: (epoch, logs) => {
                    if (epoch % 10 === 0) {
                        console.log(`Epoch ${epoch}: loss = ${logs.loss.toFixed(4)}, mae = ${logs.mae.toFixed(4)}`);
                    }
                }
            }
        });

        // Cleanup tensors
        xTensor.dispose();
        yTensor.dispose();

        this.isLoaded = true;

        return {
            trainLoss: history.history.loss[history.history.loss.length - 1],
            valLoss: history.history.val_loss[history.history.val_loss.length - 1]
        };
    }

    /**
     * Predict future values
     */
    async predict(seriesKey = 'unemployment_rate', stepsAhead = 12) {
        const series = await this.historicalData.fetchSeries(DATA_SERIES[seriesKey]);
        const values = series.map(d => d.value);

        // Use TensorFlow.js if available
        if (this.model && this.tfLoaded) {
            return this.predictWithModel(values, seriesKey, stepsAhead);
        }

        // Fallback: Exponential smoothing
        return this.predictExponentialSmoothing(values, stepsAhead);
    }

    /**
     * Predict using trained LSTM model
     */
    predictWithModel(values, seriesKey, stepsAhead) {
        const { min, max } = this.normParams[seriesKey] || {
            min: Math.min(...values),
            max: Math.max(...values)
        };

        const predictions = [];
        let currentWindow = values.slice(-this.lookback).map(v => (v - min) / (max - min));

        for (let i = 0; i < stepsAhead; i++) {
            const inputTensor = tf.tensor3d([[currentWindow.map(v => [v])]]);
            const prediction = this.model.predict(inputTensor);
            const normalizedPred = prediction.dataSync()[0];

            inputTensor.dispose();
            prediction.dispose();

            // Denormalize
            const actualPred = normalizedPred * (max - min) + min;
            predictions.push({
                step: i + 1,
                value: actualPred,
                normalized: normalizedPred
            });

            // Slide window
            currentWindow = [...currentWindow.slice(1), normalizedPred];
        }

        return {
            predictions,
            method: 'lstm',
            confidence: this.calculateConfidence(predictions)
        };
    }

    /**
     * Fallback: Holt-Winters exponential smoothing
     */
    predictExponentialSmoothing(values, stepsAhead) {
        const alpha = 0.3; // Level smoothing
        const beta = 0.1;  // Trend smoothing

        // Initialize
        let level = values[0];
        let trend = (values[1] - values[0]) || 0;

        // Fit on historical data
        for (let i = 1; i < values.length; i++) {
            const prevLevel = level;
            level = alpha * values[i] + (1 - alpha) * (level + trend);
            trend = beta * (level - prevLevel) + (1 - beta) * trend;
        }

        // Forecast
        const predictions = [];
        for (let i = 1; i <= stepsAhead; i++) {
            predictions.push({
                step: i,
                value: level + i * trend,
                normalized: null
            });
        }

        return {
            predictions,
            method: 'exponential_smoothing',
            confidence: this.calculateSimpleConfidence(values, predictions)
        };
    }

    /**
     * Calculate prediction confidence intervals
     */
    calculateConfidence(predictions) {
        // Simple confidence based on prediction variance
        const values = predictions.map(p => p.value);
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);

        return predictions.map((p, i) => ({
            ...p,
            lower: p.value - 1.96 * stdDev * Math.sqrt(i + 1),
            upper: p.value + 1.96 * stdDev * Math.sqrt(i + 1),
            confidenceLevel: Math.max(0, 100 - (i * 5)) // Decreases with forecast horizon
        }));
    }

    calculateSimpleConfidence(historical, predictions) {
        // Calculate historical volatility
        const returns = [];
        for (let i = 1; i < historical.length; i++) {
            returns.push(historical[i] - historical[i - 1]);
        }
        const stdDev = Math.sqrt(returns.reduce((a, b) => a + b * b, 0) / returns.length);

        return predictions.map((p, i) => ({
            ...p,
            lower: p.value - 1.96 * stdDev * Math.sqrt(i + 1),
            upper: p.value + 1.96 * stdDev * Math.sqrt(i + 1),
            confidenceLevel: Math.max(30, 90 - (i * 5))
        }));
    }

    /**
     * Validate model on held-out data
     */
    async backtest(seriesKey = 'unemployment_rate', testMonths = 12) {
        const series = await this.historicalData.fetchSeries(DATA_SERIES[seriesKey]);
        const values = series.map(d => d.value);

        // Split data
        const trainEnd = values.length - testMonths;
        const trainData = values.slice(0, trainEnd);
        const testData = values.slice(trainEnd);

        // Predict on test period
        const predictions = await this.predict(seriesKey, testMonths);
        const predicted = predictions.predictions.map(p => p.value);

        // Calculate metrics
        const mae = testData.reduce((sum, actual, i) =>
            sum + Math.abs(actual - predicted[i]), 0) / testMonths;

        const mape = testData.reduce((sum, actual, i) =>
            sum + Math.abs((actual - predicted[i]) / actual), 0) / testMonths * 100;

        return {
            actual: testData,
            predicted,
            mae,
            mape,
            testPeriodStart: series[trainEnd].date
        };
    }

    /**
     * Get forecaster status
     */
    getStatus() {
        return {
            isLoaded: this.isLoaded,
            modelType: this.model ? 'lstm' : 'exponential_smoothing',
            tfAvailable: this.tfLoaded,
            lookback: this.lookback
        };
    }

    /**
     * Dispose model to free memory
     */
    dispose() {
        if (this.model) {
            this.model.dispose();
            this.model = null;
        }
        this.isLoaded = false;
    }
}

/**
 * Forecasting Service - Main entry point
 */
class ForecastingService {
    constructor() {
        this.forecaster = new TimeSeriesForecaster();
        this.forecasts = {};
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;

        await this.forecaster.historicalData.init();
        this.initialized = true;
    }

    /**
     * Train forecaster on historical data
     */
    async trainForecaster(seriesKey = 'unemployment_rate') {
        await this.init();
        return this.forecaster.train(seriesKey);
    }

    /**
     * Get forecast for a series
     */
    async getForecast(seriesKey, months = 36) {
        await this.init();

        // Check cache
        if (this.forecasts[seriesKey] &&
            Date.now() - this.forecasts[seriesKey].timestamp < 3600000) {
            return this.forecasts[seriesKey].data;
        }

        const forecast = await this.forecaster.predict(seriesKey, months);

        this.forecasts[seriesKey] = {
            data: forecast,
            timestamp: Date.now()
        };

        return forecast;
    }

    /**
     * Get all forecasts for simulation integration
     */
    async getAllForecasts(months = 36) {
        const series = ['unemployment_rate', 'employment', 'wages', 'productivity'];
        const results = {};

        for (const key of series) {
            results[key] = await this.getForecast(key, months);
        }

        return results;
    }

    /**
     * Blend ML forecast with simulation model
     */
    blendPredictions(modelValue, mlPrediction, weight = 0.3) {
        // Weight: 0 = pure model, 1 = pure ML
        return modelValue * (1 - weight) + mlPrediction * weight;
    }

    getStatus() {
        return this.forecaster.getStatus();
    }
}

// Export
export { TimeSeriesForecaster, ForecastingService };

if (typeof window !== 'undefined') {
    window.TimeSeriesForecaster = TimeSeriesForecaster;
    window.ForecastingService = ForecastingService;
}
