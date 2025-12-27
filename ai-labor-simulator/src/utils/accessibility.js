/**
 * Accessibility Utilities Module
 * Provides comprehensive accessibility features for the AI Labor Simulator
 * 
 * Features:
 * - Screen reader optimization with ARIA live regions
 * - Keyboard navigation improvements
 * - High contrast mode
 * - Reduced motion options
 */

/**
 * Accessibility Manager
 * Centralizes accessibility features and preferences
 */
class AccessibilityManager {
    constructor() {
        this.preferences = {
            highContrast: false,
            reducedMotion: false,
            largeText: false,
            screenReaderMode: false,
            keyboardNavigation: true,
            focusIndicators: true
        };

        // Check system preferences
        this.detectSystemPreferences();

        // Load user preferences from storage
        this.loadPreferences();

        // Initialize
        this.init();
    }

    /**
     * Initialize accessibility features
     */
    init() {
        this.setupKeyboardNavigation();
        this.setupFocusManagement();
        this.createSkipLinks();
        this.createLiveRegion();
        this.applyPreferences();
    }

    /**
     * Detect system accessibility preferences
     */
    detectSystemPreferences() {
        // Reduced motion preference
        if (window.matchMedia) {
            const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            this.preferences.reducedMotion = motionQuery.matches;
            motionQuery.addEventListener('change', (e) => {
                this.preferences.reducedMotion = e.matches;
                this.applyPreferences();
            });

            // High contrast preference (Windows)
            const contrastQuery = window.matchMedia('(prefers-contrast: more)');
            if (contrastQuery.matches) {
                this.preferences.highContrast = true;
            }
            contrastQuery.addEventListener('change', (e) => {
                this.preferences.highContrast = e.matches;
                this.applyPreferences();
            });
        }
    }

    /**
     * Load preferences from localStorage
     */
    loadPreferences() {
        try {
            const saved = localStorage.getItem('a11y-preferences');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.preferences = { ...this.preferences, ...parsed };
            }
        } catch (e) {
            console.warn('Failed to load accessibility preferences:', e);
        }
    }

    /**
     * Save preferences to localStorage
     */
    savePreferences() {
        try {
            localStorage.setItem('a11y-preferences', JSON.stringify(this.preferences));
        } catch (e) {
            console.warn('Failed to save accessibility preferences:', e);
        }
    }

    /**
     * Apply current preferences to the document
     */
    applyPreferences() {
        const root = document.documentElement;

        // High contrast mode
        root.classList.toggle('high-contrast', this.preferences.highContrast);

        // Reduced motion
        root.classList.toggle('reduced-motion', this.preferences.reducedMotion);

        // Large text
        root.classList.toggle('large-text', this.preferences.largeText);

        // Screen reader mode - add hidden live region updates
        root.classList.toggle('sr-mode', this.preferences.screenReaderMode);

        // Focus indicators
        root.classList.toggle('focus-visible', this.preferences.focusIndicators);

        // Inject CSS if not already present
        this.injectAccessibilityStyles();
    }

    /**
     * Inject accessibility styles
     */
    injectAccessibilityStyles() {
        if (document.getElementById('a11y-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'a11y-styles';
        styles.textContent = `
            /* High Contrast Mode */
            .high-contrast {
                --bg-primary: #000000;
                --bg-secondary: #1a1a1a;
                --text-primary: #ffffff;
                --text-secondary: #ffff00;
                --border-color: #ffffff;
                --accent-color: #00ffff;
                --error-color: #ff6b6b;
                --success-color: #00ff00;
                --warning-color: #ffff00;
            }

            .high-contrast body {
                background-color: var(--bg-primary);
                color: var(--text-primary);
            }

            .high-contrast a,
            .high-contrast button {
                color: var(--accent-color);
                border: 2px solid var(--accent-color);
            }

            .high-contrast input,
            .high-contrast select,
            .high-contrast textarea {
                background-color: var(--bg-secondary);
                color: var(--text-primary);
                border: 2px solid var(--border-color);
            }

            .high-contrast .card,
            .high-contrast .panel {
                background-color: var(--bg-secondary);
                border: 2px solid var(--border-color);
            }

            /* Reduced Motion */
            .reduced-motion *,
            .reduced-motion *::before,
            .reduced-motion *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
                scroll-behavior: auto !important;
            }

            /* Large Text Mode */
            .large-text {
                font-size: 125%;
            }

            .large-text h1 { font-size: 2.5rem; }
            .large-text h2 { font-size: 2rem; }
            .large-text h3 { font-size: 1.75rem; }
            .large-text p, .large-text li { font-size: 1.25rem; }
            .large-text button { font-size: 1.1rem; padding: 0.75rem 1.5rem; }

            /* Focus Indicators */
            .focus-visible :focus {
                outline: 3px solid var(--accent-color, #3b82f6);
                outline-offset: 2px;
            }

            .focus-visible :focus:not(:focus-visible) {
                outline: none;
            }

            .focus-visible :focus-visible {
                outline: 3px solid var(--accent-color, #3b82f6);
                outline-offset: 2px;
            }

            /* Skip Links */
            .skip-link {
                position: absolute;
                top: -40px;
                left: 0;
                background: #3b82f6;
                color: white;
                padding: 8px 16px;
                z-index: 10000;
                text-decoration: none;
                font-weight: bold;
            }

            .skip-link:focus {
                top: 0;
            }

            /* Screen Reader Only */
            .sr-only {
                position: absolute;
                width: 1px;
                height: 1px;
                padding: 0;
                margin: -1px;
                overflow: hidden;
                clip: rect(0, 0, 0, 0);
                white-space: nowrap;
                border: 0;
            }

            /* Live Region */
            .a11y-live-region {
                position: absolute;
                width: 1px;
                height: 1px;
                padding: 0;
                margin: -1px;
                overflow: hidden;
                clip: rect(0, 0, 0, 0);
                white-space: nowrap;
                border: 0;
            }

            /* Keyboard Focus Indicator for Charts */
            .chart-container:focus-within {
                outline: 3px solid var(--accent-color, #3b82f6);
                outline-offset: 4px;
            }
        `;
        document.head.appendChild(styles);
    }

    /**
     * Create skip links for keyboard navigation
     */
    createSkipLinks() {
        if (document.querySelector('.skip-link')) return;

        const skipLinks = [
            { href: '#main-content', text: 'Skip to main content' },
            { href: '#simulation-controls', text: 'Skip to simulation controls' },
            { href: '#results', text: 'Skip to results' }
        ];

        const container = document.createElement('div');
        container.className = 'skip-links';
        container.setAttribute('role', 'navigation');
        container.setAttribute('aria-label', 'Skip links');

        skipLinks.forEach(link => {
            const a = document.createElement('a');
            a.href = link.href;
            a.className = 'skip-link';
            a.textContent = link.text;
            container.appendChild(a);
        });

        document.body.insertBefore(container, document.body.firstChild);
    }

    /**
     * Create ARIA live region for announcements
     */
    createLiveRegion() {
        if (document.getElementById('a11y-live-region')) return;

        const liveRegion = document.createElement('div');
        liveRegion.id = 'a11y-live-region';
        liveRegion.className = 'a11y-live-region';
        liveRegion.setAttribute('role', 'status');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        document.body.appendChild(liveRegion);

        // Also create an assertive region for urgent announcements
        const urgentRegion = document.createElement('div');
        urgentRegion.id = 'a11y-live-region-urgent';
        urgentRegion.className = 'a11y-live-region';
        urgentRegion.setAttribute('role', 'alert');
        urgentRegion.setAttribute('aria-live', 'assertive');
        urgentRegion.setAttribute('aria-atomic', 'true');
        document.body.appendChild(urgentRegion);
    }

    /**
     * Announce message to screen readers
     */
    announce(message, urgent = false) {
        const regionId = urgent ? 'a11y-live-region-urgent' : 'a11y-live-region';
        const region = document.getElementById(regionId);

        if (region) {
            // Clear and re-add to trigger announcement
            region.textContent = '';
            setTimeout(() => {
                region.textContent = message;
            }, 100);
        }
    }

    /**
     * Setup keyboard navigation enhancements
     */
    setupKeyboardNavigation() {
        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Alt + 1-9 for quick navigation
            if (e.altKey && e.key >= '1' && e.key <= '9') {
                this.handleQuickNav(parseInt(e.key));
                e.preventDefault();
            }

            // Escape to close modals/panels
            if (e.key === 'Escape') {
                this.handleEscape();
            }

            // ? for help
            if (e.key === '?' && !this.isInputFocused()) {
                this.showKeyboardHelp();
                e.preventDefault();
            }
        });

        // Arrow key navigation in lists
        this.setupArrowKeyNavigation();
    }

    /**
     * Check if an input element is focused
     */
    isInputFocused() {
        const active = document.activeElement;
        return active && (
            active.tagName === 'INPUT' ||
            active.tagName === 'TEXTAREA' ||
            active.tagName === 'SELECT' ||
            active.isContentEditable
        );
    }

    /**
     * Handle quick navigation with Alt+number
     */
    handleQuickNav(num) {
        const landmarks = {
            1: '#main-content',
            2: '#simulation-controls',
            3: '#results',
            4: '#interventions',
            5: '#charts',
            6: '#settings',
            7: '#help',
            8: '#export',
            9: '#navigation'
        };

        const target = document.querySelector(landmarks[num]);
        if (target) {
            target.focus();
            target.scrollIntoView({ behavior: this.preferences.reducedMotion ? 'auto' : 'smooth' });
            this.announce(`Navigated to ${target.getAttribute('aria-label') || landmarks[num]}`);
        }
    }

    /**
     * Handle escape key
     */
    handleEscape() {
        // Close any open modals
        const modals = document.querySelectorAll('[role="dialog"][aria-hidden="false"], .modal.open');
        modals.forEach(modal => {
            modal.setAttribute('aria-hidden', 'true');
            modal.classList.remove('open');
        });

        // Close any open dropdowns
        const dropdowns = document.querySelectorAll('[aria-expanded="true"]');
        dropdowns.forEach(dropdown => {
            dropdown.setAttribute('aria-expanded', 'false');
        });
    }

    /**
     * Setup arrow key navigation for list elements
     */
    setupArrowKeyNavigation() {
        document.addEventListener('keydown', (e) => {
            const list = e.target.closest('[role="listbox"], [role="menu"], [role="tablist"]');
            if (!list) return;

            const items = Array.from(list.querySelectorAll('[role="option"], [role="menuitem"], [role="tab"]'));
            const currentIndex = items.indexOf(e.target);

            if (currentIndex === -1) return;

            let nextIndex;

            switch (e.key) {
                case 'ArrowDown':
                case 'ArrowRight':
                    nextIndex = (currentIndex + 1) % items.length;
                    e.preventDefault();
                    break;
                case 'ArrowUp':
                case 'ArrowLeft':
                    nextIndex = (currentIndex - 1 + items.length) % items.length;
                    e.preventDefault();
                    break;
                case 'Home':
                    nextIndex = 0;
                    e.preventDefault();
                    break;
                case 'End':
                    nextIndex = items.length - 1;
                    e.preventDefault();
                    break;
                default:
                    return;
            }

            items[nextIndex].focus();
        });
    }

    /**
     * Setup focus management
     */
    setupFocusManagement() {
        // Track focus for modals
        this.focusStack = [];

        // Focus trap for modals
        document.addEventListener('keydown', (e) => {
            if (e.key !== 'Tab') return;

            const modal = document.querySelector('[role="dialog"]:not([aria-hidden="true"])');
            if (!modal) return;

            const focusable = modal.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );

            if (focusable.length === 0) return;

            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (e.shiftKey && document.activeElement === first) {
                last.focus();
                e.preventDefault();
            } else if (!e.shiftKey && document.activeElement === last) {
                first.focus();
                e.preventDefault();
            }
        });
    }

    /**
     * Show keyboard shortcuts help dialog
     */
    showKeyboardHelp() {
        const existingDialog = document.getElementById('keyboard-help-dialog');
        if (existingDialog) {
            existingDialog.remove();
        }

        const dialog = document.createElement('div');
        dialog.id = 'keyboard-help-dialog';
        dialog.setAttribute('role', 'dialog');
        dialog.setAttribute('aria-label', 'Keyboard shortcuts');
        dialog.setAttribute('aria-modal', 'true');
        dialog.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            z-index: 10001;
            max-width: 500px;
            max-height: 80vh;
            overflow-y: auto;
        `;

        dialog.innerHTML = `
            <h2 style="margin-top: 0;">Keyboard Shortcuts</h2>
            <button id="close-keyboard-help" style="position: absolute; top: 16px; right: 16px; border: none; background: none; font-size: 24px; cursor: pointer;">&times;</button>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr><th style="text-align: left; padding: 8px; border-bottom: 1px solid #e2e8f0;">Key</th><th style="text-align: left; padding: 8px; border-bottom: 1px solid #e2e8f0;">Action</th></tr>
                </thead>
                <tbody>
                    <tr><td style="padding: 8px;"><kbd>?</kbd></td><td style="padding: 8px;">Show this help</td></tr>
                    <tr><td style="padding: 8px;"><kbd>Alt + 1</kbd></td><td style="padding: 8px;">Main content</td></tr>
                    <tr><td style="padding: 8px;"><kbd>Alt + 2</kbd></td><td style="padding: 8px;">Simulation controls</td></tr>
                    <tr><td style="padding: 8px;"><kbd>Alt + 3</kbd></td><td style="padding: 8px;">Results</td></tr>
                    <tr><td style="padding: 8px;"><kbd>Tab</kbd></td><td style="padding: 8px;">Next element</td></tr>
                    <tr><td style="padding: 8px;"><kbd>Shift + Tab</kbd></td><td style="padding: 8px;">Previous element</td></tr>
                    <tr><td style="padding: 8px;"><kbd>Escape</kbd></td><td style="padding: 8px;">Close dialog/panel</td></tr>
                    <tr><td style="padding: 8px;"><kbd>↑ ↓</kbd></td><td style="padding: 8px;">Navigate lists</td></tr>
                    <tr><td style="padding: 8px;"><kbd>Enter/Space</kbd></td><td style="padding: 8px;">Activate button</td></tr>
                </tbody>
            </table>
            <p style="margin-top: 16px; color: #64748b; font-size: 14px;">Press Escape to close</p>
        `;

        // Overlay
        const overlay = document.createElement('div');
        overlay.id = 'keyboard-help-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 10000;
        `;

        document.body.appendChild(overlay);
        document.body.appendChild(dialog);

        // Focus the dialog
        dialog.focus();

        // Close handlers
        const closeDialog = () => {
            dialog.remove();
            overlay.remove();
        };

        document.getElementById('close-keyboard-help').addEventListener('click', closeDialog);
        overlay.addEventListener('click', closeDialog);
        dialog.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeDialog();
        });
    }

    /**
     * Set a preference
     */
    setPreference(key, value) {
        if (this.preferences.hasOwnProperty(key)) {
            this.preferences[key] = value;
            this.savePreferences();
            this.applyPreferences();
            this.announce(`${key.replace(/([A-Z])/g, ' $1').trim()} ${value ? 'enabled' : 'disabled'}`);
        }
    }

    /**
     * Toggle a preference
     */
    togglePreference(key) {
        if (this.preferences.hasOwnProperty(key)) {
            this.setPreference(key, !this.preferences[key]);
        }
    }

    /**
     * Get current preferences
     */
    getPreferences() {
        return { ...this.preferences };
    }

    /**
     * Create accessibility settings panel
     */
    createSettingsPanel(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return null;

        container.innerHTML = '';
        container.setAttribute('role', 'region');
        container.setAttribute('aria-label', 'Accessibility settings');

        const panel = document.createElement('div');
        panel.className = 'a11y-settings-panel';
        panel.style.cssText = `
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        `;

        const title = document.createElement('h3');
        title.textContent = 'Accessibility Settings';
        title.style.marginTop = '0';
        panel.appendChild(title);

        const settings = [
            { key: 'highContrast', label: 'High Contrast Mode', description: 'Increase contrast for better visibility' },
            { key: 'reducedMotion', label: 'Reduced Motion', description: 'Disable animations and transitions' },
            { key: 'largeText', label: 'Large Text', description: 'Increase text size by 25%' },
            { key: 'screenReaderMode', label: 'Screen Reader Mode', description: 'Enhanced announcements for screen readers' },
            { key: 'focusIndicators', label: 'Focus Indicators', description: 'Show visible focus outlines' }
        ];

        settings.forEach(setting => {
            const row = document.createElement('div');
            row.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #e2e8f0;';

            const labelContainer = document.createElement('div');
            const label = document.createElement('label');
            label.htmlFor = `a11y-${setting.key}`;
            label.textContent = setting.label;
            label.style.fontWeight = '500';

            const description = document.createElement('div');
            description.textContent = setting.description;
            description.style.cssText = 'font-size: 12px; color: #64748b; margin-top: 2px;';
            description.id = `a11y-${setting.key}-desc`;

            labelContainer.appendChild(label);
            labelContainer.appendChild(description);

            const toggle = this.createToggleSwitch(setting.key);

            row.appendChild(labelContainer);
            row.appendChild(toggle);
            panel.appendChild(row);
        });

        container.appendChild(panel);
        return panel;
    }

    /**
     * Create accessible toggle switch
     */
    createToggleSwitch(key) {
        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'position: relative; width: 48px; height: 24px;';

        const input = document.createElement('input');
        input.type = 'checkbox';
        input.id = `a11y-${key}`;
        input.checked = this.preferences[key];
        input.setAttribute('role', 'switch');
        input.setAttribute('aria-checked', this.preferences[key]);
        input.setAttribute('aria-describedby', `a11y-${key}-desc`);
        input.style.cssText = `
            position: absolute;
            width: 100%;
            height: 100%;
            opacity: 0;
            cursor: pointer;
            z-index: 1;
        `;

        const track = document.createElement('div');
        track.style.cssText = `
            position: absolute;
            width: 100%;
            height: 100%;
            background: ${this.preferences[key] ? '#3b82f6' : '#e2e8f0'};
            border-radius: 12px;
            transition: background 0.2s;
        `;

        const thumb = document.createElement('div');
        thumb.style.cssText = `
            position: absolute;
            width: 20px;
            height: 20px;
            background: white;
            border-radius: 50%;
            top: 2px;
            left: ${this.preferences[key] ? '26px' : '2px'};
            transition: left 0.2s;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        `;

        input.addEventListener('change', () => {
            this.togglePreference(key);
            input.setAttribute('aria-checked', this.preferences[key]);
            track.style.background = this.preferences[key] ? '#3b82f6' : '#e2e8f0';
            thumb.style.left = this.preferences[key] ? '26px' : '2px';
        });

        wrapper.appendChild(track);
        wrapper.appendChild(thumb);
        wrapper.appendChild(input);

        return wrapper;
    }

    /**
     * Add ARIA attributes to chart container for screen readers
     */
    makeChartAccessible(containerId, chartData) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.setAttribute('role', 'figure');
        container.setAttribute('tabindex', '0');

        // Create accessible description
        const description = this.generateChartDescription(chartData);

        const descId = `${containerId}-desc`;
        let descElement = document.getElementById(descId);

        if (!descElement) {
            descElement = document.createElement('div');
            descElement.id = descId;
            descElement.className = 'sr-only';
            container.appendChild(descElement);
        }

        descElement.textContent = description;
        container.setAttribute('aria-describedby', descId);
    }

    /**
     * Generate text description of chart for screen readers
     */
    generateChartDescription(chartData) {
        if (!chartData) return 'Chart data not available';

        const { type, title, datasets, labels } = chartData;
        let description = `${type || 'Chart'}: ${title || 'Untitled'}. `;

        if (datasets && datasets.length > 0) {
            datasets.forEach(dataset => {
                const values = dataset.data || [];
                if (values.length > 0) {
                    const min = Math.min(...values);
                    const max = Math.max(...values);
                    const avg = values.reduce((a, b) => a + b, 0) / values.length;
                    description += `${dataset.label}: ranges from ${min.toFixed(1)} to ${max.toFixed(1)}, average ${avg.toFixed(1)}. `;
                }
            });
        }

        return description;
    }
}

// Export for ES modules
export { AccessibilityManager };

// Also export to window for backwards compatibility
if (typeof window !== 'undefined') {
    window.AccessibilityManager = AccessibilityManager;
}
