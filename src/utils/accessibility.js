/**
 * Accessibility Utilities
 * Provides helper functions for managing focus, screen reader announcements, and other a11y features
 */

/**
 * Announce text to screen readers
 * @param {string} message - Message to announce
 * @param {string} priority - 'polite' or 'assertive'
 */
export function announceToScreenReader(message, priority = 'polite') {
  const announcer = document.createElement('div');
  announcer.setAttribute('aria-live', priority);
  announcer.setAttribute('aria-atomic', 'true');
  announcer.className = 'visually-hidden';
  announcer.textContent = message;

  document.body.appendChild(announcer);

  // Remove after announcement
  setTimeout(() => {
    if (announcer.parentNode) {
      announcer.parentNode.removeChild(announcer);
    }
  }, 1000);
}

/**
 * Focus the first focusable element in a container
 * @param {HTMLElement} container - Container element to search within
 */
export function focusFirstElement(container) {
  const focusableElements = getFocusableElements(container);
  if (focusableElements.length > 0) {
    focusableElements[0].focus();
  }
}

/**
 * Get all focusable elements within a container
 * @param {HTMLElement} container - Container element
 * @returns {NodeList} - List of focusable elements
 */
export function getFocusableElements(container = document) {
  const focusableSelector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'textarea:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
  ].join(', ');

  return container.querySelectorAll(focusableSelector);
}

/**
 * Trap focus within a container (useful for modals)
 * @param {HTMLElement} container - Container to trap focus in
 * @returns {function} - Function to remove the trap
 */
export function trapFocus(container) {
  const focusableElements = getFocusableElements(container);
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleTabKey = (event) => {
    if (event.key !== 'Tab') return;

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  };

  // Focus first element
  firstElement?.focus();

  // Add event listener
  container.addEventListener('keydown', handleTabKey);

  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleTabKey);
  };
}

/**
 * Check if user prefers reduced motion
 * @returns {boolean} - True if user prefers reduced motion
 */
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Check if user prefers high contrast
 * @returns {boolean} - True if user prefers high contrast
 */
export function prefersHighContrast() {
  return window.matchMedia('(prefers-contrast: high)').matches;
}

/**
 * Generate unique ID for form elements
 * @param {string} prefix - Prefix for the ID
 * @returns {string} - Unique ID
 */
export function generateId(prefix = 'element') {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Add skip link to page
 * @param {string} targetId - ID of the main content element
 */
export function addSkipLink(targetId = 'main-content') {
  if (document.querySelector('.skip-link')) return; // Already exists

  const skipLink = document.createElement('a');
  skipLink.href = `#${targetId}`;
  skipLink.className = 'skip-link';
  skipLink.textContent = 'Skip to main content';

  // Add styles
  const styles = `
    .skip-link {
      position: absolute;
      top: -40px;
      left: 6px;
      background: var(--ink, #1a1a1a);
      color: var(--white, #ffffff);
      padding: 8px 16px;
      text-decoration: none;
      border-radius: 4px;
      z-index: 10000;
      font-size: 14px;
      font-weight: 600;
      transition: top 0.3s;
    }

    .skip-link:focus {
      top: 6px;
    }
  `;

  // Add styles to document
  let styleSheet = document.querySelector('#skip-link-styles');
  if (!styleSheet) {
    styleSheet = document.createElement('style');
    styleSheet.id = 'skip-link-styles';
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }

  // Add link to document
  document.body.insertBefore(skipLink, document.body.firstChild);
}

/**
 * Update page title for single-page apps
 * @param {string} title - New page title
 * @param {boolean} announce - Whether to announce the change
 */
export function updatePageTitle(title, announce = true) {
  document.title = title;

  if (announce) {
    announceToScreenReader(`Page changed to: ${title}`, 'polite');
  }
}

/**
 * Handle route changes for screen readers
 * @param {string} routeName - Name of the new route/section
 */
export function announceRouteChange(routeName) {
  announceToScreenReader(`Navigated to ${routeName}`, 'assertive');
}

/**
 * Validate form field accessibility
 * @param {HTMLElement} field - Form field element
 * @returns {Object} - Validation result with issues array
 */
export function validateFieldAccessibility(field) {
  const issues = [];
  const fieldType = field.type || field.tagName.toLowerCase();

  // Check for label
  const label = field.labels?.[0] || document.querySelector(`label[for="${field.id}"]`);
  if (!label && !field.getAttribute('aria-label') && !field.getAttribute('aria-labelledby')) {
    issues.push('Field missing accessible name (label, aria-label, or aria-labelledby)');
  }

  // Check for required indicator
  if (field.required && !field.getAttribute('aria-describedby')) {
    issues.push('Required field should have aria-describedby pointing to requirement text');
  }

  // Check minimum tap target size for touch
  const rect = field.getBoundingClientRect();
  if (rect.width < 44 || rect.height < 44) {
    issues.push('Tap target too small (minimum 44x44px recommended)');
  }

  // Check color contrast (basic check)
  const styles = getComputedStyle(field);
  const bgColor = styles.backgroundColor;
  const textColor = styles.color;

  if (bgColor === textColor) {
    issues.push('Insufficient color contrast between text and background');
  }

  return {
    valid: issues.length === 0,
    issues
  };
}

/**
 * Auto-scroll to element with reduced motion consideration
 * @param {HTMLElement|string} element - Element or selector to scroll to
 * @param {Object} options - Scroll options
 */
export function scrollToElement(element, options = {}) {
  const target = typeof element === 'string' ? document.querySelector(element) : element;
  if (!target) return;

  const defaultOptions = {
    behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    block: 'start',
    inline: 'nearest'
  };

  target.scrollIntoView({ ...defaultOptions, ...options });
}

/**
 * Manage live region for dynamic content updates
 */
export class LiveRegion {
  constructor(priority = 'polite', atomic = true) {
    this.element = document.createElement('div');
    this.element.setAttribute('aria-live', priority);
    this.element.setAttribute('aria-atomic', atomic.toString());
    this.element.className = 'visually-hidden';
    this.element.id = generateId('live-region');

    document.body.appendChild(this.element);
  }

  announce(message) {
    this.element.textContent = message;
  }

  clear() {
    this.element.textContent = '';
  }

  destroy() {
    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}

/**
 * Initialize accessibility features for the app
 */
export function initializeAccessibility() {
  // Add skip link
  addSkipLink('main-content');

  // Listen for keyboard navigation
  document.addEventListener('keydown', (event) => {
    // Show focus indicators when using keyboard
    if (event.key === 'Tab') {
      document.body.classList.add('using-keyboard');
    }
  });

  // Hide focus indicators when using mouse
  document.addEventListener('mousedown', () => {
    document.body.classList.remove('using-keyboard');
  });

  // Add enhanced focus styles when using keyboard
  const keyboardFocusStyles = `
    body:not(.using-keyboard) *:focus {
      outline: none;
    }

    body.using-keyboard *:focus-visible {
      outline: 2px solid var(--accent, #FFB74D);
      outline-offset: 2px;
    }
  `;

  const focusStyleSheet = document.createElement('style');
  focusStyleSheet.id = 'keyboard-focus-styles';
  focusStyleSheet.textContent = keyboardFocusStyles;
  document.head.appendChild(focusStyleSheet);

  // Log accessibility initialization
  console.log('♿ Accessibility features initialized');
}