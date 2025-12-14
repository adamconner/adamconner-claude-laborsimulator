/**
 * Model Training Service
 * Uses stored AI-enhanced simulations to train and improve the base economic model
 * Leverages AI (Gemini) to analyze patterns and generate optimized parameters
 */

class ModelTrainer {
    constructor() {
        this.modelVersion = '1.0';
        this.trainedModelKey = 'trained_model_params';
        this.trainingHistoryKey = 'training_history';

        // Proxy for AI calls
        this.proxyEndpoint = 'https://gemini-proxy.adamconner7.workers.dev';
        this.directEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
        this.apiKey = localStorage.getItem('gemini_api_key') || '';
    }

    /**
     * Make AI request
     */
    async makeRequest(prompt, options = {}) {
        const body = {
            contents: [{
                parts: [{ text: prompt }]
            }],
            generationConfig: {
                temperature: options.temperature || 0.3,
                maxOutputTokens: options.maxTokens || 4096,
            }
        };

        let response;
        if (this.apiKey) {
            response = await fetch(`${this.directEndpoint}?key=${this.apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
        } else {
            response = await fetch(this.proxyEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
        }

        if (!response.ok) {
            throw new Error('Training AI request failed');
        }

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }

    /**
     * Analyze stored simulations to extract patterns
     */
    async analyzeStoredSimulations() {
        const simulations = aiScenarioEnhancer.getStoredSimulations();

        if (simulations.length < 3) {
            return {
                success: false,
                message: 'Need at least 3 stored AI simulations to analyze patterns',
                count: simulations.length
            };
        }

        // Extract key patterns
        const patterns = simulations.map(sim => ({
            inputs: {
                unemployment: sim.inputs.targetUnemployment,
                aiAdoption: sim.inputs.aiAdoption,
                pace: sim.inputs.automationPace,
                years: sim.inputs.years
            },
            enhancedParams: sim.enhancedParams,
            outcomes: {
                finalUnemployment: parseFloat(sim.results.summary.labor_market_changes.unemployment_rate.final),
                displacement: sim.results.summary.ai_impact.cumulative_displacement,
                newJobs: sim.results.summary.ai_impact.cumulative_new_jobs,
                wageChange: parseFloat(sim.results.summary.wages.average_hourly.change_percent)
            }
        }));

        return {
            success: true,
            count: simulations.length,
            patterns
        };
    }

    /**
     * Train improved model parameters using AI analysis of stored data
     */
    async trainModel(options = {}) {
        const analysis = await this.analyzeStoredSimulations();

        if (!analysis.success) {
            return analysis;
        }

        const prompt = `You are an expert economist and machine learning engineer. Analyze these AI-enhanced labor market simulations and derive optimized parameters for a base economic model.

TRAINING DATA (${analysis.count} simulations):
${JSON.stringify(analysis.patterns.slice(0, 20), null, 2)}

Your task:
1. Identify patterns between inputs and AI-enhanced parameters
2. Find relationships between enhanced parameters and outcomes
3. Generate optimized base model coefficients

Generate improved model parameters that will make the BASE simulation (without AI enhancement) produce more realistic results.

Respond with ONLY a valid JSON object (no markdown):
{
    "model_version": "2.0",
    "training_date": "${new Date().toISOString()}",
    "training_samples": ${analysis.count},

    "displacement_coefficients": {
        "base_rate": 0.05-0.2,
        "ai_adoption_factor": 0.5-2.0,
        "pace_multipliers": {
            "slow": 0.3-0.7,
            "moderate": 0.8-1.2,
            "fast": 1.3-1.8,
            "accelerating": 1.8-2.5
        },
        "sector_exposure_weights": {
            "technology": 0.1-0.3,
            "finance": 0.3-0.5,
            "healthcare": 0.1-0.3,
            "manufacturing": 0.5-0.8,
            "retail": 0.4-0.7,
            "education": 0.1-0.3,
            "professional_services": 0.3-0.5,
            "transportation": 0.5-0.8
        }
    },

    "job_creation_coefficients": {
        "base_multiplier": 0.2-0.5,
        "ai_complementarity_factor": 0.3-0.8,
        "lag_months": 6-24,
        "sector_creation_rates": {
            "technology": 0.3-0.6,
            "finance": 0.2-0.4,
            "healthcare": 0.3-0.5,
            "manufacturing": 0.1-0.3,
            "retail": 0.1-0.3,
            "education": 0.2-0.4,
            "professional_services": 0.3-0.5,
            "transportation": 0.1-0.2
        }
    },

    "wage_coefficients": {
        "productivity_wage_pass_through": 0.2-0.6,
        "displacement_wage_pressure": -0.02--0.005,
        "skill_premium_growth_rate": 0.01-0.05,
        "polarization_factor": 0.1-0.4
    },

    "transition_coefficients": {
        "retraining_effectiveness": 0.2-0.5,
        "mobility_factor": 0.1-0.3,
        "structural_unemployment_rate": 0.02-0.08,
        "recovery_half_life_months": 12-36
    },

    "feedback_loops": {
        "unemployment_to_spending": -0.3--0.1,
        "productivity_to_investment": 0.1-0.4,
        "wage_to_consumption": 0.4-0.7,
        "ai_adoption_acceleration": 0.05-0.2
    },

    "calibration_notes": [
        "observation about the training data",
        "key insight derived",
        "recommendation for model use"
    ],

    "confidence_score": 0.0-1.0,
    "recommended_for_production": true/false
}

Base your parameters on patterns observed in the training data. Use realistic economic values.`;

        try {
            const response = await this.makeRequest(prompt, { temperature: 0.2, maxTokens: 4000 });

            let jsonStr = response.trim();
            if (jsonStr.startsWith('```json')) jsonStr = jsonStr.slice(7);
            else if (jsonStr.startsWith('```')) jsonStr = jsonStr.slice(3);
            if (jsonStr.endsWith('```')) jsonStr = jsonStr.slice(0, -3);

            const trainedParams = JSON.parse(jsonStr.trim());

            // Store trained model
            this.saveTrainedModel(trainedParams);

            // Log training history
            this.logTraining({
                timestamp: new Date().toISOString(),
                samples: analysis.count,
                version: trainedParams.model_version,
                confidence: trainedParams.confidence_score
            });

            return {
                success: true,
                model: trainedParams,
                message: `Model trained on ${analysis.count} simulations`
            };
        } catch (e) {
            console.error('Training failed:', e);
            return {
                success: false,
                message: 'Failed to train model: ' + e.message
            };
        }
    }

    /**
     * Save trained model parameters
     */
    saveTrainedModel(params) {
        localStorage.setItem(this.trainedModelKey, JSON.stringify(params));
    }

    /**
     * Get trained model parameters
     */
    getTrainedModel() {
        try {
            return JSON.parse(localStorage.getItem(this.trainedModelKey));
        } catch {
            return null;
        }
    }

    /**
     * Check if trained model exists
     */
    hasTrainedModel() {
        return !!localStorage.getItem(this.trainedModelKey);
    }

    /**
     * Clear trained model
     */
    clearTrainedModel() {
        localStorage.removeItem(this.trainedModelKey);
    }

    /**
     * Log training event
     */
    logTraining(entry) {
        const history = this.getTrainingHistory();
        history.push(entry);
        if (history.length > 50) history.shift();
        localStorage.setItem(this.trainingHistoryKey, JSON.stringify(history));
    }

    /**
     * Get training history
     */
    getTrainingHistory() {
        try {
            return JSON.parse(localStorage.getItem(this.trainingHistoryKey) || '[]');
        } catch {
            return [];
        }
    }

    /**
     * Apply trained model to simulation engine
     */
    applyToEngine(engine) {
        const trained = this.getTrainedModel();
        if (!trained) return false;

        // Store original coefficients
        engine._originalCoefficients = engine._originalCoefficients || {
            automationPaceMultipliers: { ...engine.getAutomationPaceMultiplier }
        };

        // Apply trained coefficients
        // This modifies the engine's behavior based on learned parameters
        engine.trainedModel = trained;

        return true;
    }

    /**
     * Get model status summary
     */
    getStatus() {
        const trained = this.getTrainedModel();
        const history = this.getTrainingHistory();
        const simCount = aiScenarioEnhancer.getStoredSimulations().length;

        return {
            hasTrainedModel: !!trained,
            modelVersion: trained?.model_version || 'None',
            confidence: trained?.confidence_score || 0,
            trainingCount: history.length,
            lastTraining: history.length > 0 ? history[history.length - 1].timestamp : null,
            storedSimulations: simCount,
            readyForTraining: simCount >= 3
        };
    }

    /**
     * Export training data and model
     */
    exportAll() {
        return {
            exportDate: new Date().toISOString(),
            trainedModel: this.getTrainedModel(),
            trainingHistory: this.getTrainingHistory(),
            simulations: aiScenarioEnhancer.exportForTraining()
        };
    }
}

// Global instance
const modelTrainer = new ModelTrainer();
