/**
 * AI Summary Service - Gemini API Integration
 * Generates natural language summaries of simulation results
 */

class AISummaryService {
    constructor() {
        this.apiKey = localStorage.getItem('gemini_api_key') || '';
        // Use v1 endpoint with gemini-1.5-flash (v1beta is deprecated for this model)
        this.apiEndpoint = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';
    }

    /**
     * Set and save API key
     */
    setApiKey(key) {
        this.apiKey = key;
        localStorage.setItem('gemini_api_key', key);
    }

    /**
     * Get stored API key
     */
    getApiKey() {
        return this.apiKey;
    }

    /**
     * Check if API key is configured
     */
    hasApiKey() {
        return this.apiKey && this.apiKey.length > 0;
    }

    /**
     * Clear API key
     */
    clearApiKey() {
        this.apiKey = '';
        localStorage.removeItem('gemini_api_key');
    }

    /**
     * Generate summary prompt from simulation results
     */
    buildPrompt(results) {
        const summary = results.summary;
        const scenario = results.scenario;

        return `You are an expert labor economist analyzing AI's impact on employment. Based on the following simulation results, provide a clear, insightful summary in 3-4 paragraphs. Be specific with numbers and highlight key findings, risks, and recommendations.

SIMULATION PARAMETERS:
- Scenario: ${scenario.name}
- Timeframe: ${scenario.timeframe.start_year} to ${scenario.timeframe.end_year}
- Target Unemployment Rate: ${scenario.targets.unemployment_rate}%
- AI Adoption Rate Target: ${scenario.targets.ai_adoption_rate}%
- Automation Pace: ${scenario.targets.automation_pace}
- Adoption Curve: ${scenario.ai_parameters.adoption_curve}

LABOR MARKET RESULTS:
- Starting Unemployment: ${summary.labor_market_changes.unemployment_rate.initial}%
- Final Unemployment: ${summary.labor_market_changes.unemployment_rate.final}%
- Unemployment Change: ${summary.labor_market_changes.unemployment_rate.change}%
- Starting Employment: ${(summary.labor_market_changes.total_employment.initial / 1e6).toFixed(1)} million
- Final Employment: ${(summary.labor_market_changes.total_employment.final / 1e6).toFixed(1)} million
- Net Employment Change: ${(summary.labor_market_changes.total_employment.change / 1e6).toFixed(2)} million

AI IMPACT:
- Final AI Adoption: ${summary.ai_impact.ai_adoption.final}%
- Jobs Displaced by AI: ${(summary.ai_impact.cumulative_displacement / 1e6).toFixed(2)} million
- New Jobs Created by AI: ${(summary.ai_impact.cumulative_new_jobs / 1e6).toFixed(2)} million
- Net AI Job Impact: ${(summary.ai_impact.net_impact / 1e6).toFixed(2)} million

ECONOMIC INDICATORS:
- Final Productivity Growth: ${summary.productivity.growth_rate.final}%
- Final Wage Change: ${summary.wages.average_hourly.change_percent}%

POLICY INTERVENTIONS ACTIVE: ${scenario.interventions.length > 0 ? scenario.interventions.map(i => i.name).join(', ') : 'None'}

Please provide:
1. An executive summary of the key findings
2. Analysis of the most significant impacts and which sectors/workers are most affected
3. Economic implications (wages, productivity, inequality)
4. Recommendations or considerations for policymakers

Keep the tone professional but accessible. Use specific numbers from the data.`;
    }

    /**
     * Call Gemini API to generate summary
     */
    async generateSummary(results) {
        if (!this.hasApiKey()) {
            throw new Error('Gemini API key not configured. Please add your API key in settings.');
        }

        const prompt = this.buildPrompt(results);

        try {
            const response = await fetch(`${this.apiEndpoint}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024,
                    },
                    safetySettings: [
                        {
                            category: "HARM_CATEGORY_HARASSMENT",
                            threshold: "BLOCK_NONE"
                        },
                        {
                            category: "HARM_CATEGORY_HATE_SPEECH",
                            threshold: "BLOCK_NONE"
                        },
                        {
                            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                            threshold: "BLOCK_NONE"
                        },
                        {
                            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                            threshold: "BLOCK_NONE"
                        }
                    ]
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 400 && errorData.error?.message?.includes('API key')) {
                    throw new Error('Invalid API key. Please check your Gemini API key and try again.');
                }
                throw new Error(`API request failed: ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();

            if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
                return data.candidates[0].content.parts[0].text;
            } else {
                throw new Error('Unexpected API response format');
            }
        } catch (error) {
            if (error.message.includes('Failed to fetch')) {
                throw new Error('Network error. Please check your internet connection.');
            }
            throw error;
        }
    }

    /**
     * Generate a quick bullet-point summary (shorter, for sidebar)
     */
    async generateQuickInsights(results) {
        if (!this.hasApiKey()) {
            return null;
        }

        const summary = results.summary;

        const prompt = `Based on this labor market simulation data, provide exactly 4 brief, impactful bullet points (max 15 words each):

- Unemployment: ${summary.labor_market_changes.unemployment_rate.initial}% → ${summary.labor_market_changes.unemployment_rate.final}%
- Jobs Displaced: ${(summary.ai_impact.cumulative_displacement / 1e6).toFixed(1)}M
- Jobs Created: ${(summary.ai_impact.cumulative_new_jobs / 1e6).toFixed(1)}M
- Net Impact: ${(summary.ai_impact.net_impact / 1e6).toFixed(1)}M

Format as 4 bullet points starting with an emoji. Focus on the most important insights.`;

        try {
            const response = await fetch(`${this.apiEndpoint}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        temperature: 0.5,
                        maxOutputTokens: 256,
                    }
                })
            });

            if (!response.ok) return null;

            const data = await response.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
        } catch {
            return null;
        }
    }
}

// Global instance
const aiSummaryService = new AISummaryService();
