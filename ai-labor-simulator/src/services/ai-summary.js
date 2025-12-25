/**
 * AI Summary Service - Gemini API Integration
 * Generates natural language summaries of simulation results
 *
 * Uses Cloudflare Worker proxy for secure API access
 */

class AISummaryService {
    constructor() {
        // Cloudflare Worker proxy URL for AI analysis access
        this.proxyEndpoint = 'https://gemini-proxy.adamconner7.workers.dev';

        // Track quota from proxy responses
        this.lastQuotaInfo = null;

        // API call counter - persisted in localStorage
        this.apiCallCount = parseInt(localStorage.getItem('gemini_api_call_count') || '0', 10);
        this.apiCallHistory = JSON.parse(localStorage.getItem('gemini_api_call_history') || '[]');
        this.counterEnabled = localStorage.getItem('gemini_counter_enabled') !== 'false'; // Default enabled
    }

    /**
     * Get the total API call count
     */
    getApiCallCount() {
        return this.apiCallCount;
    }

    /**
     * Get API call history
     */
    getApiCallHistory() {
        return this.apiCallHistory;
    }

    /**
     * Check if counter is enabled
     */
    isCounterEnabled() {
        return this.counterEnabled;
    }

    /**
     * Enable/disable the counter
     */
    setCounterEnabled(enabled) {
        this.counterEnabled = enabled;
        localStorage.setItem('gemini_counter_enabled', enabled.toString());
    }

    /**
     * Reset the API call counter
     */
    resetApiCallCount() {
        this.apiCallCount = 0;
        this.apiCallHistory = [];
        localStorage.setItem('gemini_api_call_count', '0');
        localStorage.setItem('gemini_api_call_history', '[]');
    }

    /**
     * Increment and track API call
     */
    _trackApiCall(type = 'unknown') {
        if (!this.counterEnabled) return;

        this.apiCallCount++;

        const callRecord = {
            timestamp: new Date().toISOString(),
            type: type,
            mode: this.getMode(),
            count: this.apiCallCount
        };

        this.apiCallHistory.push(callRecord);

        // Keep only last 100 calls in history
        if (this.apiCallHistory.length > 100) {
            this.apiCallHistory = this.apiCallHistory.slice(-100);
        }

        // Persist
        localStorage.setItem('gemini_api_call_count', this.apiCallCount.toString());
        localStorage.setItem('gemini_api_call_history', JSON.stringify(this.apiCallHistory));

        // Dispatch event for UI updates
        window.dispatchEvent(new CustomEvent('geminiApiCallUpdated', {
            detail: { count: this.apiCallCount, lastCall: callRecord }
        }));
    }

    /**
     * Get stats summary
     */
    getApiCallStats() {
        const today = new Date().toDateString();
        const todayCalls = this.apiCallHistory.filter(c =>
            new Date(c.timestamp).toDateString() === today
        ).length;

        const thisWeek = new Date();
        thisWeek.setDate(thisWeek.getDate() - 7);
        const weekCalls = this.apiCallHistory.filter(c =>
            new Date(c.timestamp) >= thisWeek
        ).length;

        return {
            total: this.apiCallCount,
            today: todayCalls,
            thisWeek: weekCalls,
            lastCall: this.apiCallHistory.length > 0
                ? this.apiCallHistory[this.apiCallHistory.length - 1]
                : null
        };
    }

    /**
     * Check if AI analysis is available
     */
    isAvailable() {
        return this.proxyEndpoint && this.proxyEndpoint.length > 0;
    }

    /**
     * Get the mode being used
     */
    getMode() {
        return 'proxy';
    }

    /**
     * Get quota info from last proxy request
     */
    getQuotaInfo() {
        return this.lastQuotaInfo;
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
     * Make API request via Cloudflare proxy
     */
    async makeRequest(body) {
        if (!this.isAvailable()) {
            throw new Error('AI analysis is not available.');
        }

        const response = await fetch(this.proxyEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        return response;
    }

    /**
     * Call Gemini API to generate summary
     */
    async generateSummary(results) {
        if (!this.isAvailable()) {
            throw new Error('AI analysis is not available.');
        }

        const prompt = this.buildPrompt(results);

        try {
            const response = await this.makeRequest({
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
            });

            if (!response.ok) {
                const errorData = await response.json();

                // Handle rate limit from proxy
                if (response.status === 429) {
                    throw new Error('Daily AI analysis limit reached. Please try again tomorrow.');
                }

                throw new Error(`API request failed: ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();

            // Store quota info if using proxy
            if (data._quota) {
                this.lastQuotaInfo = data._quota;
            }

            // Track the API call (successful)
            this._trackApiCall('summary');

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
        if (!this.isAvailable()) {
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
            const response = await this.makeRequest({
                contents: [{
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    temperature: 0.5,
                    maxOutputTokens: 256,
                }
            });

            if (!response.ok) return null;

            const data = await response.json();

            // Track the API call (successful)
            this._trackApiCall('quick_insights');

            // Store quota info if using proxy
            if (data._quota) {
                this.lastQuotaInfo = data._quota;
            }

            return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
        } catch {
            return null;
        }
    }
}

// Global instance
const aiSummaryService = new AISummaryService();

// Export for ES modules
export { AISummaryService, aiSummaryService };

// Also export to window for backwards compatibility with script tags
if (typeof window !== 'undefined') {
    window.AISummaryService = AISummaryService;
    window.aiSummaryService = aiSummaryService;
}
