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

IMPORTANT: Respond with ONLY valid JSON. All values must be actual numbers, not ranges. Choose specific values appropriate for this scenario.

VALUE GUIDELINES (pick a specific number within these ranges):
- adoption_multiplier: between 1.0 and 2.0
- displacement_rate: between 0.0 and 0.5
- new_role_creation: between 0.0 and 1.0
- wage_premium: between -0.1 and 0.3
- retraining_effectiveness: between 0.1 and 0.6
- retraining_duration_months: between 3 and 24
- geographic_mobility: between 0.05 and 0.3
- gig_economy_absorption: between 0.1 and 0.4
- early_retirement_rate: between 0.05 and 0.2
- labor_force_participation_change: between -0.05 and 0.05
- skills_mismatch_factor: between 0.1 and 0.5
- skill_premium_growth: between 0.0 and 5.0
- median_wage_pressure: between -3.0 and 2.0
- top_decile_growth: between 0.0 and 8.0
- bottom_decile_pressure: between -5.0 and 0.0
- wage_polarization_index: between 0.0 and 1.0
- productivity_multiplier: between 1.0 and 2.0
- gdp_impact_modifier: between -0.02 and 0.05
- consumer_spending_impact: between -0.03 and 0.02
- business_investment_boost: between 0.0 and 0.1
- inflation_pressure: between -0.01 and 0.03
- displacement_lag_months: between 3 and 18
- new_job_creation_lag_months: between 6 and 36
- peak_disruption_year: between 1 and ${simpleInputs.years}
- recovery_speed: between 0.5 and 2.0
- structural_unemployment_risk: between 0.0 and 0.3

Return this exact JSON structure with your chosen values:
{
    "sector_dynamics": {
        "technology": { "adoption_multiplier": 1.5, "displacement_rate": 0.2, "new_role_creation": 0.6, "wage_premium": 0.15 },
        "finance": { "adoption_multiplier": 1.4, "displacement_rate": 0.25, "new_role_creation": 0.4, "wage_premium": 0.1 },
        "healthcare": { "adoption_multiplier": 1.2, "displacement_rate": 0.1, "new_role_creation": 0.5, "wage_premium": 0.12 },
        "manufacturing": { "adoption_multiplier": 1.6, "displacement_rate": 0.35, "new_role_creation": 0.2, "wage_premium": -0.05 },
        "retail": { "adoption_multiplier": 1.4, "displacement_rate": 0.3, "new_role_creation": 0.15, "wage_premium": -0.08 },
        "education": { "adoption_multiplier": 1.1, "displacement_rate": 0.05, "new_role_creation": 0.4, "wage_premium": 0.05 },
        "professional_services": { "adoption_multiplier": 1.5, "displacement_rate": 0.2, "new_role_creation": 0.5, "wage_premium": 0.1 },
        "transportation": { "adoption_multiplier": 1.7, "displacement_rate": 0.4, "new_role_creation": 0.1, "wage_premium": -0.1 }
    },
    "labor_market_dynamics": {
        "retraining_effectiveness": 0.35,
        "retraining_duration_months": 12,
        "geographic_mobility": 0.15,
        "gig_economy_absorption": 0.25,
        "early_retirement_rate": 0.1,
        "labor_force_participation_change": -0.02,
        "skills_mismatch_factor": 0.3
    },
    "wage_dynamics": {
        "skill_premium_growth": 2.5,
        "median_wage_pressure": -0.5,
        "top_decile_growth": 4.0,
        "bottom_decile_pressure": -2.0,
        "wage_polarization_index": 0.5
    },
    "economic_effects": {
        "productivity_multiplier": 1.4,
        "gdp_impact_modifier": 0.02,
        "consumer_spending_impact": -0.01,
        "business_investment_boost": 0.05,
        "inflation_pressure": 0.01
    },
    "transition_dynamics": {
        "displacement_lag_months": 9,
        "new_job_creation_lag_months": 18,
        "peak_disruption_year": 3,
        "recovery_speed": 1.2,
        "structural_unemployment_risk": 0.15
    },
    "confidence_intervals": {
        "unemployment_low": 5.5,
        "unemployment_high": 9.5,
        "displacement_low": 8.0,
        "displacement_high": 15.0
    },
    "key_assumptions": [
        "Your first key assumption about this scenario",
        "Your second key assumption",
        "Your third key assumption"
    ],
    "risk_factors": [
        "First major risk factor",
        "Second major risk factor",
        "Third major risk factor"
    ]
}

Adjust all values based on the specific inputs provided. Be realistic and consistent with economic research.`;

        const response = await this.makeRequest(prompt, { temperature: 0.6, maxTokens: 2500 });

        // Parse JSON from response
        return this.extractJSON(response, 'enhanceInputs');
    }

    /**
     * Extract and parse JSON from AI response
     */
    extractJSON(response, context = '') {
        try {
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

            // Try to find JSON object in the response
            const jsonStart = jsonStr.indexOf('{');
            const jsonEnd = jsonStr.lastIndexOf('}');

            if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
                jsonStr = jsonStr.slice(jsonStart, jsonEnd + 1);
            }

            // Clean up common issues
            jsonStr = jsonStr.trim();

            return JSON.parse(jsonStr);
        } catch (e) {
            console.error(`Failed to parse AI response (${context}):`, response);
            console.error('Parse error:', e.message);
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

        return this.extractJSON(response, 'analyzeResults');
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
