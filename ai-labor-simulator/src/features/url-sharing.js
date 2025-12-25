/**
 * URL Sharing Service
 * Encodes and decodes scenario parameters in URL for easy sharing
 */

class URLSharingService {
    constructor() {
        // Compact parameter keys for shorter URLs
        this.paramMap = {
            // Scenario basics
            'n': 'name',
            'sy': 'start_year',
            'ey': 'end_year',
            // Targets
            'ur': 'unemployment_rate',
            'ai': 'ai_adoption_rate',
            'ap': 'automation_pace',
            // AI Parameters
            'ac': 'adoption_curve',
            'pd': 'productivity_dispersion',
            'njm': 'new_job_multiplier',
            'td': 'transition_delay',
            // Interventions (encoded as array)
            'iv': 'interventions'
        };

        // Reverse map for decoding
        this.reverseMap = {};
        for (const [short, long] of Object.entries(this.paramMap)) {
            this.reverseMap[long] = short;
        }
    }

    /**
     * Encode scenario to URL query string
     * @param {Object} scenario - The scenario object
     * @returns {string} URL query string
     */
    encodeScenario(scenario) {
        if (!scenario) return '';

        const params = new URLSearchParams();

        // Encode basic info
        if (scenario.name) {
            params.set('n', this.compressString(scenario.name));
        }

        // Encode timeframe
        if (scenario.timeframe) {
            params.set('sy', scenario.timeframe.start_year);
            params.set('ey', scenario.timeframe.end_year);
        }

        // Encode targets
        if (scenario.targets) {
            params.set('ur', scenario.targets.unemployment_rate);
            params.set('ai', scenario.targets.ai_adoption_rate);
            params.set('ap', scenario.targets.automation_pace);
        }

        // Encode AI parameters
        if (scenario.ai_parameters) {
            params.set('ac', this.encodeAdoptionCurve(scenario.ai_parameters.adoption_curve));
            params.set('pd', scenario.ai_parameters.productivity_dispersion);
            params.set('njm', scenario.ai_parameters.new_job_multiplier);
            params.set('td', scenario.ai_parameters.transition_delay);
        }

        // Encode interventions
        if (scenario.interventions && scenario.interventions.length > 0) {
            const ivEncoded = this.encodeInterventions(scenario.interventions);
            params.set('iv', ivEncoded);
        }

        return params.toString();
    }

    /**
     * Decode URL query string to scenario
     * @param {string} queryString - URL query string
     * @returns {Object} Partial scenario object
     */
    decodeScenario(queryString) {
        if (!queryString) return null;

        const params = new URLSearchParams(queryString);
        const scenario = {};

        // Decode name
        const name = params.get('n');
        if (name) {
            scenario.name = this.decompressString(name);
        }

        // Decode timeframe
        const startYear = params.get('sy');
        const endYear = params.get('ey');
        if (startYear || endYear) {
            scenario.timeframe = {
                start_year: startYear ? parseInt(startYear) : 2024,
                end_year: endYear ? parseInt(endYear) : 2034
            };
        }

        // Decode targets
        const ur = params.get('ur');
        const ai = params.get('ai');
        const ap = params.get('ap');
        if (ur || ai || ap) {
            scenario.targets = {
                unemployment_rate: ur ? parseFloat(ur) : 6,
                ai_adoption_rate: ai ? parseFloat(ai) : 50,
                automation_pace: ap || 'moderate'
            };
        }

        // Decode AI parameters
        const ac = params.get('ac');
        const pd = params.get('pd');
        const njm = params.get('njm');
        const td = params.get('td');
        if (ac || pd || njm || td) {
            scenario.ai_parameters = {
                adoption_curve: ac ? this.decodeAdoptionCurve(ac) : 's_curve',
                productivity_dispersion: pd ? parseFloat(pd) : 0.3,
                new_job_multiplier: njm ? parseFloat(njm) : 0.4,
                transition_delay: td ? parseFloat(td) : 2
            };
        }

        // Decode interventions
        const iv = params.get('iv');
        if (iv) {
            scenario.interventions = this.decodeInterventions(iv);
        }

        return Object.keys(scenario).length > 0 ? scenario : null;
    }

    /**
     * Encode adoption curve to short code
     */
    encodeAdoptionCurve(curve) {
        const curveMap = {
            'linear': 'L',
            'exponential': 'E',
            's_curve': 'S',
            'step': 'T'
        };
        return curveMap[curve] || 'S';
    }

    /**
     * Decode adoption curve from short code
     */
    decodeAdoptionCurve(code) {
        const curveMap = {
            'L': 'linear',
            'E': 'exponential',
            'S': 's_curve',
            'T': 'step'
        };
        return curveMap[code] || 's_curve';
    }

    /**
     * Encode interventions array
     */
    encodeInterventions(interventions) {
        if (!interventions || interventions.length === 0) return '';

        const typeMap = {
            'ubi': 'U',
            'job_retraining': 'R',
            'wage_subsidy': 'W',
            'reduced_workweek': 'H',
            'robot_tax': 'T',
            'education_subsidy': 'E'
        };

        return interventions.map(iv => {
            const typeCode = typeMap[iv.type] || iv.type.charAt(0).toUpperCase();
            // Encode key parameters as compact string
            const params = this.encodeInterventionParams(iv.type, iv.parameters);
            return typeCode + (params ? ':' + params : '');
        }).join(',');
    }

    /**
     * Encode intervention parameters to compact string
     */
    encodeInterventionParams(type, params) {
        if (!params) return '';

        const parts = [];
        switch (type) {
            case 'ubi':
                if (params.monthly_amount) parts.push('m' + params.monthly_amount);
                if (params.phase_out_threshold) parts.push('p' + params.phase_out_threshold);
                break;
            case 'job_retraining':
                if (params.funding_per_worker) parts.push('f' + params.funding_per_worker);
                if (params.success_rate) parts.push('s' + params.success_rate);
                break;
            case 'wage_subsidy':
                if (params.subsidy_rate) parts.push('r' + params.subsidy_rate);
                if (params.max_wage_covered) parts.push('w' + params.max_wage_covered);
                break;
            case 'reduced_workweek':
                if (params.target_hours) parts.push('h' + params.target_hours);
                break;
            case 'robot_tax':
                if (params.tax_rate) parts.push('t' + params.tax_rate);
                break;
            case 'education_subsidy':
                if (params.funding_increase) parts.push('i' + params.funding_increase);
                break;
        }
        return parts.join('-');
    }

    /**
     * Decode interventions from compact string
     */
    decodeInterventions(encoded) {
        if (!encoded) return [];

        const typeMap = {
            'U': 'ubi',
            'R': 'job_retraining',
            'W': 'wage_subsidy',
            'H': 'reduced_workweek',
            'T': 'robot_tax',
            'E': 'education_subsidy'
        };

        const typeNames = {
            'ubi': 'Universal Basic Income',
            'job_retraining': 'Job Retraining',
            'wage_subsidy': 'Wage Subsidy',
            'reduced_workweek': 'Reduced Work Week',
            'robot_tax': 'Robot Tax',
            'education_subsidy': 'Education Subsidy'
        };

        return encoded.split(',').map(part => {
            const typeCode = part.charAt(0);
            const type = typeMap[typeCode];
            if (!type) return null;

            const paramsStr = part.includes(':') ? part.split(':')[1] : '';
            const parameters = this.decodeInterventionParams(type, paramsStr);

            return {
                type,
                name: typeNames[type],
                parameters
            };
        }).filter(iv => iv !== null);
    }

    /**
     * Decode intervention parameters from compact string
     */
    decodeInterventionParams(type, encoded) {
        const params = {};
        if (!encoded) return params;

        const parts = encoded.split('-');
        for (const part of parts) {
            if (part.length < 2) continue;
            const key = part.charAt(0);
            const value = parseFloat(part.substring(1));

            switch (type) {
                case 'ubi':
                    if (key === 'm') params.monthly_amount = value;
                    if (key === 'p') params.phase_out_threshold = value;
                    break;
                case 'job_retraining':
                    if (key === 'f') params.funding_per_worker = value;
                    if (key === 's') params.success_rate = value;
                    break;
                case 'wage_subsidy':
                    if (key === 'r') params.subsidy_rate = value;
                    if (key === 'w') params.max_wage_covered = value;
                    break;
                case 'reduced_workweek':
                    if (key === 'h') params.target_hours = value;
                    break;
                case 'robot_tax':
                    if (key === 't') params.tax_rate = value;
                    break;
                case 'education_subsidy':
                    if (key === 'i') params.funding_increase = value;
                    break;
            }
        }
        return params;
    }

    /**
     * Compress string for URL (basic encoding)
     */
    compressString(str) {
        return encodeURIComponent(str.replace(/ /g, '_'));
    }

    /**
     * Decompress string from URL
     */
    decompressString(str) {
        return decodeURIComponent(str).replace(/_/g, ' ');
    }

    /**
     * Generate shareable URL for current scenario
     * @param {Object} scenario - The scenario object
     * @returns {string} Full shareable URL
     */
    generateShareableURL(scenario) {
        const queryString = this.encodeScenario(scenario);
        const baseURL = window.location.origin + window.location.pathname;
        return queryString ? `${baseURL}?${queryString}` : baseURL;
    }

    /**
     * Check if URL has scenario parameters
     * @returns {boolean}
     */
    hasScenarioInURL() {
        return window.location.search.length > 1;
    }

    /**
     * Load scenario from current URL
     * @returns {Object|null} Decoded scenario or null
     */
    loadFromURL() {
        if (!this.hasScenarioInURL()) return null;
        return this.decodeScenario(window.location.search.substring(1));
    }

    /**
     * Update URL with current scenario (without page reload)
     * @param {Object} scenario - The scenario object
     */
    updateURL(scenario) {
        const queryString = this.encodeScenario(scenario);
        const newURL = queryString
            ? `${window.location.pathname}?${queryString}`
            : window.location.pathname;

        window.history.replaceState({ scenario }, '', newURL);
    }

    /**
     * Copy shareable URL to clipboard
     * @param {Object} scenario - The scenario object
     * @returns {Promise<boolean>} Success status
     */
    async copyToClipboard(scenario) {
        const url = this.generateShareableURL(scenario);
        try {
            await navigator.clipboard.writeText(url);
            return true;
        } catch (e) {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = url;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand('copy');
                document.body.removeChild(textarea);
                return true;
            } catch (e2) {
                document.body.removeChild(textarea);
                return false;
            }
        }
    }
}

// Global instance
const urlSharing = new URLSharingService();

/**
 * Copy current scenario URL to clipboard
 */
async function copyScenarioURL() {
    const scenario = getCurrentScenario();
    if (!scenario) {
        showNotification('No scenario configured yet', 'warning');
        return;
    }

    const success = await urlSharing.copyToClipboard(scenario);
    if (success) {
        showNotification('Shareable URL copied to clipboard!', 'success');
    } else {
        // Show URL in modal as fallback
        const url = urlSharing.generateShareableURL(scenario);
        showShareURLModal(url);
    }
}

/**
 * Show modal with shareable URL
 */
function showShareURLModal(url) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal" style="max-width: 600px;">
            <div class="modal-header">
                <h3>Share This Scenario</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <p style="margin-bottom: 16px;">Copy this URL to share your scenario configuration:</p>
                <div style="display: flex; gap: 8px;">
                    <input type="text" id="shareUrlInput" value="${url}" readonly
                        style="flex: 1; padding: 12px; font-size: 0.875rem; border: 1px solid var(--gray-300);
                               border-radius: var(--radius); background: var(--gray-50);">
                    <button class="btn btn-primary" onclick="copyShareInput()">Copy</button>
                </div>
                <p style="font-size: 0.75rem; color: var(--gray-500); margin-top: 12px;">
                    This URL contains your scenario parameters. Anyone with this link can load your exact configuration.
                </p>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Select input text
    setTimeout(() => {
        document.getElementById('shareUrlInput').select();
    }, 100);
}

/**
 * Copy from share input field
 */
function copyShareInput() {
    const input = document.getElementById('shareUrlInput');
    input.select();
    document.execCommand('copy');
    showNotification('URL copied!', 'success');
    input.closest('.modal-overlay').remove();
}

/**
 * Apply scenario from URL on page load
 */
function applyScenarioFromURL() {
    const scenario = urlSharing.loadFromURL();
    if (!scenario) return false;

    // Apply to form fields - using correct element IDs from index.html
    if (scenario.name) {
        const nameInput = document.getElementById('scenarioName');
        if (nameInput) nameInput.value = scenario.name;
    }

    if (scenario.timeframe) {
        // targetYear is a select element with year options
        const endInput = document.getElementById('targetYear');
        if (endInput) endInput.value = scenario.timeframe.end_year;
    }

    if (scenario.targets) {
        // targetUR and aiAdoption are range inputs
        const urInput = document.getElementById('targetUR');
        const aiInput = document.getElementById('aiAdoption');
        const apInput = document.getElementById('automationPace');

        if (urInput) {
            urInput.value = scenario.targets.unemployment_rate;
            // Also update the displayed value
            const urValue = document.getElementById('urValue');
            if (urValue) urValue.textContent = scenario.targets.unemployment_rate;
        }
        if (aiInput) {
            aiInput.value = scenario.targets.ai_adoption_rate;
            // Also update the displayed value
            const aiValue = document.getElementById('aiValue');
            if (aiValue) aiValue.textContent = scenario.targets.ai_adoption_rate;
        }
        if (apInput) apInput.value = scenario.targets.automation_pace;
    }

    if (scenario.ai_parameters) {
        const acInput = document.getElementById('adoptionCurve');
        if (acInput) acInput.value = scenario.ai_parameters.adoption_curve;
    }

    // Apply interventions
    if (scenario.interventions && scenario.interventions.length > 0 &&
        typeof interventionSystem !== 'undefined') {
        scenario.interventions.forEach(iv => {
            interventionSystem.addIntervention(iv.type, iv.parameters);
        });
        if (typeof updateInterventionsList !== 'undefined') {
            updateInterventionsList();
        }
    }

    // Show notification
    setTimeout(() => {
        showNotification('Scenario loaded from shared URL', 'success');
    }, 500);

    return true;
}

/**
 * Update sliders to match input values
 */
function updateSlidersFromInputs() {
    const pairs = [
        ['targetUnemployment', 'targetUnemploymentSlider'],
        ['targetAIAdoption', 'targetAIAdoptionSlider'],
        ['productivityDispersion', 'productivityDispersionSlider'],
        ['newJobMultiplier', 'newJobMultiplierSlider'],
        ['transitionDelay', 'transitionDelaySlider']
    ];

    pairs.forEach(([inputId, sliderId]) => {
        const input = document.getElementById(inputId);
        const slider = document.getElementById(sliderId);
        if (input && slider) {
            slider.value = input.value;
        }
    });
}

// Aliases for backwards compatibility
const showShareModal = copyScenarioURL;
const hideShareModal = () => {
    const modal = document.querySelector('.modal-overlay');
    if (modal) modal.remove();
};
const copyShareUrl = copyScenarioURL;

// Export for ES modules
export {
    URLSharingService,
    urlSharing,
    copyScenarioURL,
    showShareURLModal,
    copyShareInput,
    applyScenarioFromURL,
    updateSlidersFromInputs,
    showShareModal,
    hideShareModal,
    copyShareUrl
};

// Also export to window for backwards compatibility with script tags
if (typeof window !== 'undefined') {
    window.URLSharingService = URLSharingService;
    window.urlSharing = urlSharing;
    window.copyScenarioURL = copyScenarioURL;
    window.showShareURLModal = showShareURLModal;
    window.copyShareInput = copyShareInput;
    window.applyScenarioFromURL = applyScenarioFromURL;
    window.updateSlidersFromInputs = updateSlidersFromInputs;
    window.showShareModal = showShareModal;
    window.hideShareModal = hideShareModal;
    window.copyShareUrl = copyShareUrl;
}
