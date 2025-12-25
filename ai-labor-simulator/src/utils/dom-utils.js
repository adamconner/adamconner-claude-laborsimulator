/**
 * DOM Utility Functions
 * Safe DOM manipulation helpers to prevent XSS vulnerabilities
 */

/**
 * Create an element with text content (safe - no HTML parsing)
 * @param {string} tag - HTML tag name
 * @param {string} text - Text content
 * @param {Object} attrs - HTML attributes
 * @returns {HTMLElement}
 */
function createElement(tag, text = '', attrs = {}) {
    const el = document.createElement(tag);
    if (text) {
        el.textContent = text;
    }
    Object.entries(attrs).forEach(([key, value]) => {
        if (key === 'className') {
            el.className = value;
        } else if (key === 'style' && typeof value === 'object') {
            Object.assign(el.style, value);
        } else if (key.startsWith('on') && typeof value === 'function') {
            el.addEventListener(key.slice(2).toLowerCase(), value);
        } else if (key === 'dataset' && typeof value === 'object') {
            Object.entries(value).forEach(([dataKey, dataValue]) => {
                el.dataset[dataKey] = dataValue;
            });
        } else {
            el.setAttribute(key, value);
        }
    });
    return el;
}

/**
 * Safely set text content of an element
 * @param {HTMLElement|string} element - Element or selector
 * @param {string} text - Text to set
 */
function setText(element, text) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (el) {
        el.textContent = text;
    }
}

/**
 * Clear all children from an element
 * @param {HTMLElement|string} element - Element or selector
 */
function clearChildren(element) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (el) {
        while (el.firstChild) {
            el.removeChild(el.firstChild);
        }
    }
}

/**
 * Append multiple children to an element
 * @param {HTMLElement} parent - Parent element
 * @param {...HTMLElement} children - Child elements to append
 */
function appendChildren(parent, ...children) {
    children.forEach(child => {
        if (child) {
            parent.appendChild(child);
        }
    });
}

/**
 * Create a document fragment from multiple elements
 * @param {...HTMLElement} elements - Elements to include
 * @returns {DocumentFragment}
 */
function createFragment(...elements) {
    const fragment = document.createDocumentFragment();
    elements.forEach(el => {
        if (el) {
            fragment.appendChild(el);
        }
    });
    return fragment;
}

/**
 * Create a table row with cells (safe)
 * @param {Array<string|{text: string, attrs?: Object}>} cells - Cell content
 * @param {Object} rowAttrs - Row attributes
 * @returns {HTMLTableRowElement}
 */
function createTableRow(cells, rowAttrs = {}) {
    const tr = createElement('tr', '', rowAttrs);
    cells.forEach(cell => {
        const td = document.createElement('td');
        if (typeof cell === 'string') {
            td.textContent = cell;
        } else if (cell && typeof cell === 'object') {
            td.textContent = cell.text || '';
            if (cell.attrs) {
                Object.entries(cell.attrs).forEach(([key, value]) => {
                    if (key === 'className') {
                        td.className = value;
                    } else {
                        td.setAttribute(key, value);
                    }
                });
            }
            if (cell.element) {
                td.appendChild(cell.element);
            }
        }
        tr.appendChild(td);
    });
    return tr;
}

/**
 * Create a card element with header and content
 * @param {Object} options - Card options
 * @returns {HTMLElement}
 */
function createCard({ title, content, className = '', style = {} }) {
    const card = createElement('div', '', { className: `card ${className}`.trim(), style });

    if (title) {
        const header = createElement('h3', title);
        card.appendChild(header);
    }

    if (typeof content === 'string') {
        const p = createElement('p', content);
        card.appendChild(p);
    } else if (content instanceof HTMLElement) {
        card.appendChild(content);
    }

    return card;
}

/**
 * Create a loading spinner element
 * @param {string} message - Loading message
 * @returns {HTMLElement}
 */
function createLoadingSpinner(message = 'Loading...') {
    const container = createElement('div', '', { className: 'loading' });
    const spinner = createElement('div', '', { className: 'spinner' });
    const text = createElement('span', message);
    appendChildren(container, spinner, text);
    return container;
}

/**
 * Create an error message element
 * @param {string} message - Error message
 * @returns {HTMLElement}
 */
function createErrorMessage(message) {
    const card = createElement('div', '', {
        className: 'card',
        style: { textAlign: 'center', padding: '60px' }
    });
    const title = createElement('h3', 'Error', { style: { color: 'var(--danger)' } });
    const text = createElement('p', message);
    appendChildren(card, title, text);
    return card;
}

/**
 * Create a stat/metric display
 * @param {Object} options - Stat options
 * @returns {HTMLElement}
 */
function createStatDisplay({ label, value, unit = '', color = '' }) {
    const container = createElement('div', '', { className: 'indicator-item' });
    const labelDiv = createElement('div');
    const nameSpan = createElement('div', label, { className: 'indicator-name' });
    labelDiv.appendChild(nameSpan);

    const valueDiv = createElement('div', `${value}${unit}`, {
        className: 'indicator-value',
        style: color ? { color } : {}
    });

    appendChildren(container, labelDiv, valueDiv);
    return container;
}

/**
 * Create a button element
 * @param {Object} options - Button options
 * @returns {HTMLButtonElement}
 */
function createButton({ text, onClick, className = 'btn', disabled = false, style = {} }) {
    const btn = createElement('button', text, {
        className,
        style,
        disabled: disabled ? 'disabled' : null
    });
    if (onClick) {
        btn.addEventListener('click', onClick);
    }
    return btn;
}

/**
 * Create a progress bar element
 * @param {number} percentage - Progress percentage (0-100)
 * @param {string} color - Bar color
 * @returns {HTMLElement}
 */
function createProgressBar(percentage, color = 'var(--primary)') {
    const container = createElement('div', '', {
        className: 'progress-bar',
        style: { width: '100px', display: 'inline-block', verticalAlign: 'middle' }
    });
    const fill = createElement('div', '', {
        className: 'fill',
        style: { width: `${percentage}%`, background: color }
    });
    container.appendChild(fill);
    return container;
}

/**
 * Create a tag/badge element
 * @param {string} text - Tag text
 * @param {string} variant - Tag variant (low, medium, high)
 * @returns {HTMLElement}
 */
function createTag(text, variant = 'medium') {
    return createElement('span', text, { className: `tag tag-${variant}` });
}

/**
 * Escape HTML entities in a string (for rare cases where HTML is needed)
 * @param {string} str - String to escape
 * @returns {string}
 */
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Safely parse and display markdown-like text (bold, links only)
 * @param {string} text - Text to parse
 * @returns {DocumentFragment}
 */
function parseSimpleMarkdown(text) {
    const fragment = document.createDocumentFragment();

    // Split by bold markers **text**
    const parts = text.split(/(\*\*[^*]+\*\*)/g);

    parts.forEach(part => {
        if (part.startsWith('**') && part.endsWith('**')) {
            // Bold text
            const strong = createElement('strong', part.slice(2, -2));
            fragment.appendChild(strong);
        } else {
            // Regular text
            fragment.appendChild(document.createTextNode(part));
        }
    });

    return fragment;
}

// Export for ES modules
export {
    createElement,
    setText,
    clearChildren,
    appendChildren,
    createFragment,
    createTableRow,
    createCard,
    createLoadingSpinner,
    createErrorMessage,
    createStatDisplay,
    createButton,
    createProgressBar,
    createTag,
    escapeHtml,
    parseSimpleMarkdown
};

// Also export to window for backwards compatibility with script tags
if (typeof window !== 'undefined') {
    window.DOMUtils = {
        createElement,
        setText,
        clearChildren,
        appendChildren,
        createFragment,
        createTableRow,
        createCard,
        createLoadingSpinner,
        createErrorMessage,
        createStatDisplay,
        createButton,
        createProgressBar,
        createTag,
        escapeHtml,
        parseSimpleMarkdown
    };
}
