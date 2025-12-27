/**
 * Developer Experience Module
 * Tools and infrastructure for extending the AI Labor Simulator
 * 
 * Features:
 * - Plugin architecture for custom interventions
 * - Scenario templates library
 * - API documentation generator
 * - Developer utilities
 */

/**
 * Plugin Registry
 * Manages custom intervention plugins
 */
class PluginRegistry {
    constructor() {
        this.plugins = new Map();
        this.hooks = {
            beforeSimulation: [],
            afterSimulation: [],
            onInterventionAdded: [],
            onResultsGenerated: [],
            onStateUpdate: []
        };
    }

    /**
     * Register a new plugin
     * @param {object} plugin - Plugin configuration
     * @param {string} plugin.name - Unique plugin name
     * @param {string} plugin.version - Plugin version
     * @param {string} plugin.description - Plugin description
     * @param {function} plugin.init - Initialization function
     * @param {object} plugin.hooks - Hook handlers
     * @param {object} plugin.interventions - Custom intervention definitions
     */
    register(plugin) {
        if (!plugin.name) {
            throw new Error('Plugin must have a name');
        }

        if (this.plugins.has(plugin.name)) {
            console.warn(`Plugin ${plugin.name} already registered, overwriting`);
        }

        // Validate plugin structure
        const validated = this.validatePlugin(plugin);

        // Store plugin
        this.plugins.set(plugin.name, validated);

        // Register hooks
        if (plugin.hooks) {
            this.registerHooks(plugin.name, plugin.hooks);
        }

        // Initialize plugin
        if (typeof plugin.init === 'function') {
            plugin.init(this.getPluginAPI(plugin.name));
        }

        console.log(`Plugin registered: ${plugin.name} v${plugin.version || '1.0.0'}`);
        return true;
    }

    /**
     * Validate plugin structure
     */
    validatePlugin(plugin) {
        return {
            name: plugin.name,
            version: plugin.version || '1.0.0',
            description: plugin.description || '',
            author: plugin.author || 'Unknown',
            enabled: true,
            init: plugin.init,
            hooks: plugin.hooks || {},
            interventions: plugin.interventions || {},
            config: plugin.config || {}
        };
    }

    /**
     * Register plugin hooks
     */
    registerHooks(pluginName, hooks) {
        for (const [hookName, handler] of Object.entries(hooks)) {
            if (this.hooks[hookName] && typeof handler === 'function') {
                this.hooks[hookName].push({
                    plugin: pluginName,
                    handler
                });
            }
        }
    }

    /**
     * Execute hook handlers
     */
    async executeHook(hookName, data) {
        const handlers = this.hooks[hookName] || [];
        let result = data;

        for (const { plugin, handler } of handlers) {
            try {
                result = await handler(result) || result;
            } catch (error) {
                console.error(`Error in plugin ${plugin} hook ${hookName}:`, error);
            }
        }

        return result;
    }

    /**
     * Get plugin API for internal use
     */
    getPluginAPI(pluginName) {
        return {
            getConfig: () => this.plugins.get(pluginName)?.config || {},
            setConfig: (config) => {
                const plugin = this.plugins.get(pluginName);
                if (plugin) {
                    plugin.config = { ...plugin.config, ...config };
                }
            },
            registerIntervention: (intervention) => {
                this.registerCustomIntervention(pluginName, intervention);
            },
            emitEvent: (eventName, data) => {
                this.emitPluginEvent(pluginName, eventName, data);
            }
        };
    }

    /**
     * Register custom intervention from plugin
     */
    registerCustomIntervention(pluginName, intervention) {
        const id = `${pluginName}:${intervention.id}`;

        const plugin = this.plugins.get(pluginName);
        if (plugin) {
            plugin.interventions[intervention.id] = {
                ...intervention,
                source: pluginName
            };
        }

        return id;
    }

    /**
     * Emit plugin event
     */
    emitPluginEvent(pluginName, eventName, data) {
        const event = new CustomEvent(`plugin:${eventName}`, {
            detail: { plugin: pluginName, data }
        });
        document.dispatchEvent(event);
    }

    /**
     * Unregister a plugin
     */
    unregister(pluginName) {
        // Remove hooks
        for (const hookHandlers of Object.values(this.hooks)) {
            const index = hookHandlers.findIndex(h => h.plugin === pluginName);
            if (index !== -1) {
                hookHandlers.splice(index, 1);
            }
        }

        // Remove plugin
        this.plugins.delete(pluginName);
        console.log(`Plugin unregistered: ${pluginName}`);
    }

    /**
     * Get all registered plugins
     */
    getPlugins() {
        return Array.from(this.plugins.values());
    }

    /**
     * Get all custom interventions from plugins
     */
    getCustomInterventions() {
        const interventions = {};

        for (const plugin of this.plugins.values()) {
            for (const [id, intervention] of Object.entries(plugin.interventions)) {
                interventions[`${plugin.name}:${id}`] = intervention;
            }
        }

        return interventions;
    }

    /**
     * Enable/disable plugin
     */
    setEnabled(pluginName, enabled) {
        const plugin = this.plugins.get(pluginName);
        if (plugin) {
            plugin.enabled = enabled;
        }
    }
}


/**
 * Scenario Templates Library
 * Pre-built simulation scenarios for common use cases
 */
class ScenarioTemplates {
    constructor() {
        this.templates = this.initializeTemplates();
        this.customTemplates = new Map();
    }

    /**
     * Initialize built-in templates
     */
    initializeTemplates() {
        return {
            baseline: {
                id: 'baseline',
                name: 'Baseline Projection',
                description: 'No interventions, moderate AI adoption pace',
                category: 'foundational',
                config: {
                    name: 'Baseline Projection',
                    end_year: new Date().getFullYear() + 5,
                    ai_adoption_rate: 50,
                    automation_pace: 'moderate',
                    productivity_growth: 2.0,
                    gdp_growth: 2.0,
                    new_job_multiplier: 0.3
                },
                interventions: []
            },

            ubi_scenario: {
                id: 'ubi_scenario',
                name: 'Universal Basic Income',
                description: 'UBI implementation with $1,000/month benefit',
                category: 'income_support',
                config: {
                    name: 'UBI Scenario',
                    end_year: new Date().getFullYear() + 10,
                    ai_adoption_rate: 65,
                    automation_pace: 'fast'
                },
                interventions: [
                    {
                        type: 'ubi',
                        params: {
                            monthly_amount: 1000,
                            phase_in_months: 24,
                            funding_mechanism: 'ai_dividend',
                            eligibility_threshold: 75000
                        }
                    }
                ]
            },

            retraining_focus: {
                id: 'retraining_focus',
                name: 'Workforce Retraining Initiative',
                description: 'Aggressive job retraining with public-private partnerships',
                category: 'workforce_development',
                config: {
                    name: 'Retraining Focus',
                    end_year: new Date().getFullYear() + 7,
                    ai_adoption_rate: 55,
                    automation_pace: 'moderate'
                },
                interventions: [
                    {
                        type: 'job_retraining',
                        params: {
                            budget_per_worker: 15000,
                            program_duration: 12,
                            target_sectors: ['technology', 'healthcare', 'professional_services']
                        }
                    },
                    {
                        type: 'public_private_retraining',
                        params: {
                            government_match_rate: 0.75,
                            employer_commitment_minimum: 1000,
                            job_guarantee_requirement: true
                        }
                    }
                ]
            },

            gig_economy_protection: {
                id: 'gig_economy_protection',
                name: 'Gig Worker Protection',
                description: 'Comprehensive gig economy regulations',
                category: 'worker_protection',
                config: {
                    name: 'Gig Economy Protection',
                    end_year: new Date().getFullYear() + 5,
                    ai_adoption_rate: 50,
                    automation_pace: 'moderate'
                },
                interventions: [
                    {
                        type: 'gig_economy_regulations',
                        params: {
                            classification_strictness: 0.8,
                            minimum_wage_enforcement: true,
                            benefits_requirement: 0.6,
                            portable_benefits_fund: 0.03
                        }
                    },
                    {
                        type: 'portable_benefits',
                        params: {
                            contribution_rate: 0.04
                        }
                    }
                ]
            },

            robot_tax: {
                id: 'robot_tax',
                name: 'Automation Tax',
                description: 'Tax on automation to fund transition programs',
                category: 'taxation',
                config: {
                    name: 'Robot Tax Scenario',
                    end_year: new Date().getFullYear() + 8,
                    ai_adoption_rate: 45,  // Slower due to tax
                    automation_pace: 'slow'
                },
                interventions: [
                    {
                        type: 'robot_tax',
                        params: {
                            tax_rate: 0.15,
                            threshold_automation_level: 0.3,
                            revenue_allocation: {
                                retraining: 0.5,
                                ubi: 0.3,
                                infrastructure: 0.2
                            }
                        }
                    }
                ]
            },

            accelerated_ai: {
                id: 'accelerated_ai',
                name: 'Accelerated AI Adoption',
                description: 'Fast AI adoption with minimal intervention',
                category: 'projection',
                config: {
                    name: 'Accelerated AI',
                    end_year: new Date().getFullYear() + 5,
                    ai_adoption_rate: 85,
                    automation_pace: 'accelerating',
                    productivity_growth: 4.0
                },
                interventions: [
                    {
                        type: 'ai_licensing',
                        params: {
                            licensing_stringency: 0.3,
                            safety_requirements: 0.5
                        }
                    }
                ]
            },

            comprehensive_safety_net: {
                id: 'comprehensive_safety_net',
                name: 'Comprehensive Safety Net',
                description: 'Multiple interventions for worker protection',
                category: 'comprehensive',
                config: {
                    name: 'Comprehensive Safety Net',
                    end_year: new Date().getFullYear() + 10,
                    ai_adoption_rate: 60,
                    automation_pace: 'fast'
                },
                interventions: [
                    {
                        type: 'universal_basic_services',
                        params: {
                            healthcare_coverage: 1.0,
                            housing_assistance: 0.3,
                            childcare_subsidy: 0.5
                        }
                    },
                    {
                        type: 'job_guarantee',
                        params: {
                            wage_level: 20,
                            sectors: ['infrastructure', 'caregiving', 'environment']
                        }
                    },
                    {
                        type: 'sectoral_bargaining',
                        params: {
                            coverage_rate: 0.5
                        }
                    }
                ]
            },

            innovation_focus: {
                id: 'innovation_focus',
                name: 'Innovation Economy',
                description: 'High-skill immigration and education investment',
                category: 'growth',
                config: {
                    name: 'Innovation Economy',
                    end_year: new Date().getFullYear() + 10,
                    ai_adoption_rate: 70,
                    automation_pace: 'fast',
                    productivity_growth: 3.5
                },
                interventions: [
                    {
                        type: 'skills_based_immigration',
                        params: {
                            annual_visa_cap: 250000,
                            skill_threshold: 0.7,
                            priority_sectors: ['technology', 'healthcare', 'education']
                        }
                    },
                    {
                        type: 'education_subsidy',
                        params: {
                            subsidy_rate: 0.75,
                            target_skills: ['stem', 'ai', 'data_science']
                        }
                    }
                ]
            }
        };
    }

    /**
     * Get all available templates
     */
    getAll() {
        const all = { ...this.templates };
        for (const [id, template] of this.customTemplates) {
            all[id] = template;
        }
        return all;
    }

    /**
     * Get template by ID
     */
    get(id) {
        return this.templates[id] || this.customTemplates.get(id) || null;
    }

    /**
     * Get templates by category
     */
    getByCategory(category) {
        const all = this.getAll();
        return Object.values(all).filter(t => t.category === category);
    }

    /**
     * Get all categories
     */
    getCategories() {
        const categories = new Set();
        for (const template of Object.values(this.getAll())) {
            if (template.category) {
                categories.add(template.category);
            }
        }
        return Array.from(categories);
    }

    /**
     * Add custom template
     */
    addCustom(template) {
        if (!template.id) {
            template.id = `custom_${Date.now()}`;
        }

        template.category = template.category || 'custom';
        template.custom = true;

        this.customTemplates.set(template.id, template);
        this.saveCustomTemplates();

        return template.id;
    }

    /**
     * Remove custom template
     */
    removeCustom(id) {
        this.customTemplates.delete(id);
        this.saveCustomTemplates();
    }

    /**
     * Save custom templates to localStorage
     */
    saveCustomTemplates() {
        try {
            const data = Array.from(this.customTemplates.entries());
            localStorage.setItem('custom-scenario-templates', JSON.stringify(data));
        } catch (e) {
            console.warn('Failed to save custom templates:', e);
        }
    }

    /**
     * Load custom templates from localStorage
     */
    loadCustomTemplates() {
        try {
            const data = localStorage.getItem('custom-scenario-templates');
            if (data) {
                const entries = JSON.parse(data);
                this.customTemplates = new Map(entries);
            }
        } catch (e) {
            console.warn('Failed to load custom templates:', e);
        }
    }

    /**
     * Create scenario from template
     */
    createFromTemplate(templateId, overrides = {}) {
        const template = this.get(templateId);
        if (!template) {
            throw new Error(`Template not found: ${templateId}`);
        }

        return {
            ...template.config,
            ...overrides,
            name: overrides.name || template.config.name,
            interventions: [
                ...template.interventions,
                ...(overrides.additionalInterventions || [])
            ],
            sourceTemplate: templateId
        };
    }

    /**
     * Export template as JSON
     */
    exportTemplate(templateId) {
        const template = this.get(templateId);
        if (!template) return null;
        return JSON.stringify(template, null, 2);
    }

    /**
     * Import template from JSON
     */
    importTemplate(jsonString) {
        try {
            const template = JSON.parse(jsonString);
            return this.addCustom(template);
        } catch (e) {
            throw new Error('Invalid template JSON');
        }
    }
}


/**
 * API Documentation Generator
 * Auto-generates documentation from code structure
 */
class APIDocumentation {
    constructor() {
        this.docs = this.generateDocs();
    }

    /**
     * Generate comprehensive API documentation
     */
    generateDocs() {
        return {
            version: '1.0.0',
            title: 'AI Labor Simulator API Documentation',
            description: 'Complete API reference for the AI Labor Simulator',

            modules: {
                SimulationEngine: {
                    description: 'Core simulation engine for running labor market scenarios',
                    methods: {
                        createScenario: {
                            signature: 'createScenario(config: ScenarioConfig): Scenario',
                            description: 'Creates a new simulation scenario',
                            parameters: {
                                config: {
                                    type: 'ScenarioConfig',
                                    description: 'Scenario configuration object',
                                    properties: {
                                        name: { type: 'string', description: 'Scenario name' },
                                        end_year: { type: 'number', description: 'End year for simulation' },
                                        ai_adoption_rate: { type: 'number', description: 'Target AI adoption rate (0-100)' },
                                        automation_pace: { type: 'string', enum: ['slow', 'moderate', 'fast', 'accelerating'] }
                                    }
                                }
                            },
                            returns: 'Scenario object with unique ID'
                        },
                        runSimulation: {
                            signature: 'runSimulation(): Promise<SimulationResults>',
                            description: 'Executes the current scenario simulation',
                            returns: 'Promise resolving to simulation results'
                        }
                    }
                },

                InterventionSystem: {
                    description: 'Policy intervention management system',
                    methods: {
                        addIntervention: {
                            signature: 'addIntervention(type: string, params?: object): string',
                            description: 'Adds a policy intervention to the simulation',
                            parameters: {
                                type: { type: 'string', description: 'Intervention type ID' },
                                params: { type: 'object', description: 'Custom parameters (optional)' }
                            },
                            returns: 'Intervention ID'
                        },
                        getAvailableTypes: {
                            signature: 'getAvailableTypes(): InterventionType[]',
                            description: 'Returns all available intervention types',
                            returns: 'Array of intervention type definitions'
                        }
                    },
                    interventionTypes: [
                        'ubi', 'job_retraining', 'wage_subsidy', 'robot_tax',
                        'education_subsidy', 'job_guarantee', 'portable_benefits',
                        'transition_assistance', 'negative_income_tax', 'sectoral_bargaining',
                        'ai_licensing', 'universal_basic_services', 'worker_ownership',
                        'gig_economy_regulations', 'skills_based_immigration',
                        'public_private_retraining'
                    ]
                },

                EconomicModels: {
                    description: 'Advanced economic modeling classes',
                    classes: {
                        SolowGrowthModel: {
                            description: 'Extended Solow model with AI capital dynamics',
                            keyMethods: ['calculateOutput', 'getLaborShare', 'updateAICapitalShare']
                        },
                        TaskBasedLaborModel: {
                            description: 'Acemoglu & Restrepo task-based labor demand',
                            keyMethods: ['calculateDisplacementEffect', 'calculateReinstatementEffect', 'calculateNetImpact']
                        },
                        SkillBiasedTechModel: {
                            description: 'Skill-biased technological change',
                            keyMethods: ['calculateSkillPremiums', 'calculateEmploymentBySkill', 'calculateInequalityMetrics']
                        },
                        RegionalLaborMarketModel: {
                            description: 'Geographic labor market variations',
                            keyMethods: ['calculateRegionalImpact', 'calculateMigrationFlows']
                        },
                        SectorInterdependencyModel: {
                            description: 'Input-output sector relationships',
                            keyMethods: ['calculateRippleEffects', 'calculateEconomyWideEffects']
                        }
                    }
                },

                DataServices: {
                    description: 'Data fetching and management services',
                    classes: {
                        EconomicDataService: 'US economic data from BLS/FRED',
                        InternationalDataService: 'International labor market data',
                        JobPostingDataService: 'Real-time job posting analytics',
                        SkillsTaxonomyService: 'Skill classification and AI impact'
                    }
                },

                Visualization: {
                    description: 'Chart and visualization components',
                    classes: {
                        VisualizationManager: 'Basic Chart.js visualizations',
                        AdvancedVisualizationManager: {
                            description: 'Advanced visualization types',
                            methods: {
                                createSankeyDiagram: 'Labor flow visualization',
                                createJobTransitionAnimation: 'Animated worker transitions',
                                createRegionalHeatMap: 'Geographic impact heat map',
                                createSkillGapRadar: 'Skill gap analysis radar',
                                createPolicyDashboard: 'Scenario comparison dashboard'
                            }
                        }
                    }
                }
            },

            events: {
                'simulation:started': 'Fired when simulation begins',
                'simulation:step': 'Fired for each simulation step',
                'simulation:complete': 'Fired when simulation finishes',
                'intervention:added': 'Fired when intervention is added',
                'intervention:removed': 'Fired when intervention is removed',
                'data:updated': 'Fired when live data is refreshed'
            },

            examples: {
                basicUsage: `
// Create and run a simulation
const engine = new SimulationEngine(dataService, indicators);
await engine.initialize();

const scenario = engine.createScenario({
    name: 'My Scenario',
    end_year: 2030,
    ai_adoption_rate: 60,
    automation_pace: 'moderate'
});

const results = await engine.runSimulation();
console.log(results.summary);
                `,

                withInterventions: `
// Add policy interventions
const interventions = new InterventionSystem();

interventions.addIntervention('ubi', {
    monthly_amount: 1000,
    eligibility_threshold: 75000
});

interventions.addIntervention('job_retraining', {
    budget_per_worker: 10000
});

scenario.interventions = interventions.getActive();
                `,

                customPlugin: `
// Register a custom plugin
pluginRegistry.register({
    name: 'my-plugin',
    version: '1.0.0',
    description: 'Custom intervention plugin',
    
    init: (api) => {
        api.registerIntervention({
            id: 'custom_policy',
            name: 'Custom Policy',
            calculate: (state, params) => {
                return { employment_effect: params.strength * 1000 };
            }
        });
    },
    
    hooks: {
        afterSimulation: (results) => {
            console.log('Simulation complete:', results);
            return results;
        }
    }
});
                `
            }
        };
    }

    /**
     * Get full documentation
     */
    getAll() {
        return this.docs;
    }

    /**
     * Get documentation for a specific module
     */
    getModule(moduleName) {
        return this.docs.modules[moduleName] || null;
    }

    /**
     * Generate HTML documentation
     */
    generateHTML() {
        const { title, description, modules, events, examples } = this.docs;

        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body { font-family: system-ui, sans-serif; max-width: 900px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        h1 { color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
        h2 { color: #374151; margin-top: 40px; }
        h3 { color: #4b5563; }
        code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 14px; }
        pre { background: #1f2937; color: #f9fafb; padding: 20px; border-radius: 8px; overflow-x: auto; }
        pre code { background: none; padding: 0; }
        .method { background: #f9fafb; border-left: 4px solid #3b82f6; padding: 16px; margin: 16px 0; }
        .param { color: #6366f1; }
        .returns { color: #10b981; }
        table { border-collapse: collapse; width: 100%; margin: 16px 0; }
        th, td { border: 1px solid #e5e7eb; padding: 12px; text-align: left; }
        th { background: #f9fafb; }
    </style>
</head>
<body>
    <h1>${title}</h1>
    <p>${description}</p>
    
    <h2>Modules</h2>
    ${Object.entries(modules).map(([name, mod]) => `
        <h3>${name}</h3>
        <p>${mod.description}</p>
        ${mod.methods ? Object.entries(mod.methods).map(([methodName, method]) => `
            <div class="method">
                <code>${method.signature}</code>
                <p>${method.description}</p>
            </div>
        `).join('') : ''}
    `).join('')}
    
    <h2>Events</h2>
    <table>
        <tr><th>Event</th><th>Description</th></tr>
        ${Object.entries(events).map(([event, desc]) => `
            <tr><td><code>${event}</code></td><td>${desc}</td></tr>
        `).join('')}
    </table>
    
    <h2>Examples</h2>
    ${Object.entries(examples).map(([name, code]) => `
        <h3>${name}</h3>
        <pre><code>${code.trim()}</code></pre>
    `).join('')}
</body>
</html>
        `;
    }

    /**
     * Generate Markdown documentation
     */
    generateMarkdown() {
        const { title, description, modules, events, examples } = this.docs;

        let md = `# ${title}\n\n${description}\n\n`;

        md += `## Modules\n\n`;
        for (const [name, mod] of Object.entries(modules)) {
            md += `### ${name}\n\n${mod.description}\n\n`;
            if (mod.methods) {
                for (const [methodName, method] of Object.entries(mod.methods)) {
                    md += `#### \`${method.signature}\`\n\n${method.description}\n\n`;
                }
            }
        }

        md += `## Events\n\n`;
        md += `| Event | Description |\n| --- | --- |\n`;
        for (const [event, desc] of Object.entries(events)) {
            md += `| \`${event}\` | ${desc} |\n`;
        }

        md += `\n## Examples\n\n`;
        for (const [name, code] of Object.entries(examples)) {
            md += `### ${name}\n\n\`\`\`javascript\n${code.trim()}\n\`\`\`\n\n`;
        }

        return md;
    }
}


// Export all classes
export {
    PluginRegistry,
    ScenarioTemplates,
    APIDocumentation
};

// Also export to window for backwards compatibility
if (typeof window !== 'undefined') {
    window.PluginRegistry = PluginRegistry;
    window.ScenarioTemplates = ScenarioTemplates;
    window.APIDocumentation = APIDocumentation;
}
