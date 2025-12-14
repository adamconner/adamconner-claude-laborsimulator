/**
 * AI Scenario Enhancer Service
 * Uses Gemini to expand simple user inputs into rich, nuanced simulation parameters
 * and to generate deeper analysis of simulation outputs
 */

class AIScenarioEnhancer {
    constructor() {
        // Reuse the existing Gemini service configuration
        this.apiKey = localStorage.getItem('gemini_api_key') || '';
        this.proxyEndpoint = 'https://gemini-proxy.adamconner7.workers.dev';
        this.directEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

        // Storage for AI-enhanced simulations
        this.storageKey = 'ai_enhanced_simulations';

        // Password for advanced simulation (hashed)
        this.passwordKey = 'advanced_sim_password_hash';
    }

    /**
     * Check if service is available
     */
    isAvailable() {
        return this.proxyEndpoint || this.apiKey;
    }

    /**
     * Make API request to Gemini
     */
    async makeRequest(prompt, options = {}) {
        const body = {
            contents: [{
                parts: [{ text: prompt }]
            }],
            generationConfig: {
                temperature: options.temperature || 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: options.maxTokens || 2048,
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
            const error = await response.json();
            throw new Error(error.error?.message || 'AI request failed');
        }

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }

    /**
     * Enhance simple inputs into rich simulation parameters
     */
    async enhanceInputs(simpleInputs) {
        const prompt = `You are an expert labor economist and AI researcher. Given these simple simulation inputs, generate a comprehensive, nuanced set of parameters for a labor market simulation.

SIMPLE INPUTS:
- Target Unemployment Rate: ${simpleInputs.targetUnemployment}%
- AI Adoption Rate: ${simpleInputs.aiAdoption}%
- Automation Pace: ${simpleInputs.automationPace}
- Timeframe: ${simpleInputs.years} years (${simpleInputs.startYear} to ${simpleInputs.endYear})
- Adoption Curve: ${simpleInputs.adoptionCurve}
- Active Interventions: ${simpleInputs.interventions?.length > 0 ? simpleInputs.interventions.map(i => i.name).join(', ') : 'None'}

Based on current economic research and AI development trends, generate enhanced parameters. Consider:
1. How different sectors will be affected differently
2. Labor market dynamics (retraining effectiveness, geographic mobility)
3. Wage effects across skill levels
4. Second-order economic effects
5. Historical patterns from past technological transitions
6. Current AI capabilities and likely progression

Respond with ONLY a valid JSON object (no markdown, no explanation) in this exact format:
{
    "sector_dynamics": {
        "technology": { "adoption_multiplier": 1.0-2.0, "displacement_rate": 0.0-0.5, "new_role_creation": 0.0-1.0, "wage_premium": -0.1-0.3 },
        "finance": { "adoption_multiplier": 1.0-2.0, "displacement_rate": 0.0-0.5, "new_role_creation": 0.0-1.0, "wage_premium": -0.1-0.3 },
        "healthcare": { "adoption_multiplier": 1.0-2.0, "displacement_rate": 0.0-0.5, "new_role_creation": 0.0-1.0, "wage_premium": -0.1-0.3 },
        "manufacturing": { "adoption_multiplier": 1.0-2.0, "displacement_rate": 0.0-0.5, "new_role_creation": 0.0-1.0, "wage_premium": -0.1-0.3 },
        "retail": { "adoption_multiplier": 1.0-2.0, "displacement_rate": 0.0-0.5, "new_role_creation": 0.0-1.0, "wage_premium": -0.1-0.3 },
        "education": { "adoption_multiplier": 1.0-2.0, "displacement_rate": 0.0-0.5, "new_role_creation": 0.0-1.0, "wage_premium": -0.1-0.3 },
        "professional_services": { "adoption_multiplier": 1.0-2.0, "displacement_rate": 0.0-0.5, "new_role_creation": 0.0-1.0, "wage_premium": -0.1-0.3 },
        "transportation": { "adoption_multiplier": 1.0-2.0, "displacement_rate": 0.0-0.5, "new_role_creation": 0.0-1.0, "wage_premium": -0.1-0.3 }
    },
    "labor_market_dynamics": {
        "retraining_effectiveness": 0.1-0.6,
        "retraining_duration_months": 3-24,
        "geographic_mobility": 0.05-0.3,
        "gig_economy_absorption": 0.1-0.4,
        "early_retirement_rate": 0.05-0.2,
        "labor_force_participation_change": -0.05-0.05,
        "skills_mismatch_factor": 0.1-0.5
    },
    "wage_dynamics": {
        "skill_premium_growth": 0.0-5.0,
        "median_wage_pressure": -3.0-2.0,
        "top_decile_growth": 0.0-8.0,
        "bottom_decile_pressure": -5.0-0.0,
        "wage_polarization_index": 0.0-1.0
    },
    "economic_effects": {
        "productivity_multiplier": 1.0-2.0,
        "gdp_impact_modifier": -0.02-0.05,
        "consumer_spending_impact": -0.03-0.02,
        "business_investment_boost": 0.0-0.1,
        "inflation_pressure": -0.01-0.03
    },
    "transition_dynamics": {
        "displacement_lag_months": 3-18,
        "new_job_creation_lag_months": 6-36,
        "peak_disruption_year": 1-${simpleInputs.years},
        "recovery_speed": 0.5-2.0,
        "structural_unemployment_risk": 0.0-0.3
    },
    "confidence_intervals": {
        "unemployment_low": number,
        "unemployment_high": number,
        "displacement_low": number,
        "displacement_high": number
    },
    "key_assumptions": [
        "string describing assumption 1",
        "string describing assumption 2",
        "string describing assumption 3"
    ],
    "risk_factors": [
        "string describing risk 1",
        "string describing risk 2",
        "string describing risk 3"
    ]
}

Use realistic values based on economic research. Be specific to the scenario parameters provided.`;

        const response = await this.makeRequest(prompt, { temperature: 0.6, maxTokens: 2500 });

        // Parse JSON from response
        try {
            // Try to extract JSON from the response
            let jsonStr = response.trim();

            // Remove markdown code blocks if present
            if (jsonStr.startsWith('```json')) {
                jsonStr = jsonStr.slice(7);
            } else if (jsonStr.startsWith('```')) {
                jsonStr = jsonStr.slice(3);
            }
            if (jsonStr.endsWith('```')) {
                jsonStr = jsonStr.slice(0, -3);
            }

            return JSON.parse(jsonStr.trim());
        } catch (e) {
            console.error('Failed to parse AI response:', response);
            throw new Error('AI returned invalid JSON. Please try again.');
        }
    }

    /**
     * Generate deep analysis of simulation results
     */
    async analyzeResults(simpleInputs, enhancedParams, simulationResults) {
        const summary = simulationResults.summary;

        const prompt = `You are an expert labor economist analyzing an AI-enhanced labor market simulation. Provide a comprehensive, nuanced analysis.

SCENARIO INPUTS:
- Target Unemployment: ${simpleInputs.targetUnemployment}%
- AI Adoption: ${simpleInputs.aiAdoption}%
- Automation Pace: ${simpleInputs.automationPace}
- Timeframe: ${simpleInputs.years} years

AI-ENHANCED PARAMETERS USED:
${JSON.stringify(enhancedParams, null, 2)}

SIMULATION RESULTS:
- Starting Unemployment: ${summary.labor_market_changes.unemployment_rate.initial}%
- Final Unemployment: ${summary.labor_market_changes.unemployment_rate.final}%
- Jobs Displaced: ${(summary.ai_impact.cumulative_displacement / 1e6).toFixed(2)} million
- Jobs Created: ${(summary.ai_impact.cumulative_new_jobs / 1e6).toFixed(2)} million
- Net Impact: ${(summary.ai_impact.net_impact / 1e6).toFixed(2)} million
- Wage Change: ${summary.wages.average_hourly.change_percent}%

Respond with ONLY a valid JSON object (no markdown) in this format:
{
    "executive_summary": "2-3 sentence overview",
    "key_findings": [
        { "finding": "string", "confidence": "high/medium/low", "impact": "high/medium/low" },
        { "finding": "string", "confidence": "high/medium/low", "impact": "high/medium/low" },
        { "finding": "string", "confidence": "high/medium/low", "impact": "high/medium/low" }
    ],
    "sector_analysis": {
        "most_disrupted": ["sector1", "sector2"],
        "most_opportunity": ["sector1", "sector2"],
        "transition_sectors": ["sector1", "sector2"]
    },
    "workforce_impacts": {
        "high_risk_workers": "description of who is most at risk",
        "emerging_opportunities": "description of new opportunities",
        "skills_in_demand": ["skill1", "skill2", "skill3"],
        "skills_declining": ["skill1", "skill2", "skill3"]
    },
    "economic_implications": {
        "wage_inequality": "assessment",
        "productivity_gains": "assessment",
        "consumer_impact": "assessment",
        "regional_disparities": "assessment"
    },
    "policy_recommendations": [
        { "policy": "string", "priority": "immediate/short-term/long-term", "effectiveness": "high/medium/low" },
        { "policy": "string", "priority": "immediate/short-term/long-term", "effectiveness": "high/medium/low" },
        { "policy": "string", "priority": "immediate/short-term/long-term", "effectiveness": "high/medium/low" }
    ],
    "scenario_variations": {
        "optimistic_case": "brief description",
        "pessimistic_case": "brief description",
        "most_likely": "brief description"
    },
    "model_confidence": {
        "overall": "high/medium/low",
        "factors": ["factor affecting confidence 1", "factor 2"]
    },
    "narrative_analysis": "3-4 paragraph detailed narrative analysis of the scenario and its implications"
}`;

        const response = await this.makeRequest(prompt, { temperature: 0.5, maxTokens: 3000 });

        try {
            let jsonStr = response.trim();
            if (jsonStr.startsWith('```json')) jsonStr = jsonStr.slice(7);
            else if (jsonStr.startsWith('```')) jsonStr = jsonStr.slice(3);
            if (jsonStr.endsWith('```')) jsonStr = jsonStr.slice(0, -3);

            return JSON.parse(jsonStr.trim());
        } catch (e) {
            console.error('Failed to parse AI analysis:', response);
            throw new Error('AI returned invalid analysis. Please try again.');
        }
    }

    /**
     * Store an AI-enhanced simulation
     */
    storeSimulation(data) {
        const stored = this.getStoredSimulations();

        const record = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            inputs: data.inputs,
            enhancedParams: data.enhancedParams,
            results: data.results,
            analysis: data.analysis
        };

        stored.push(record);

        // Keep last 100 simulations
        if (stored.length > 100) {
            stored.shift();
        }

        localStorage.setItem(this.storageKey, JSON.stringify(stored));
        return record.id;
    }

    /**
     * Get all stored simulations
     */
    getStoredSimulations() {
        try {
            return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
        } catch {
            return [];
        }
    }

    /**
     * Get stored simulation by ID
     */
    getSimulation(id) {
        const stored = this.getStoredSimulations();
        return stored.find(s => s.id === id);
    }

    /**
     * Export stored simulations for training
     */
    exportForTraining() {
        const stored = this.getStoredSimulations();
        return {
            version: '1.0',
            exportDate: new Date().toISOString(),
            count: stored.length,
            simulations: stored
        };
    }

    /**
     * Password management
     */
    setPassword(password) {
        // Simple hash for client-side (not cryptographically secure, but sufficient for gating)
        const hash = this.simpleHash(password);
        localStorage.setItem(this.passwordKey, hash);
    }

    checkPassword(password) {
        const storedHash = localStorage.getItem(this.passwordKey);
        if (!storedHash) return true; // No password set
        return this.simpleHash(password) === storedHash;
    }

    hasPassword() {
        return !!localStorage.getItem(this.passwordKey);
    }

    clearPassword() {
        localStorage.removeItem(this.passwordKey);
    }

    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(36);
    }
}

// Global instance
const aiScenarioEnhancer = new AIScenarioEnhancer();
