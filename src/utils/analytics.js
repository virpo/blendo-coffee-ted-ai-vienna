/**
 * Analytics Utilities
 * Provides centralized analytics tracking with console logging for development
 * In production, this would integrate with services like Google Analytics, Mixpanel, etc.
 */

/**
 * Analytics events configuration
 */
const ANALYTICS_EVENTS = {
  // Page/View events
  HERO_VIEW: 'hero_view',
  QUIZ_VIEW: 'quiz_view',
  RESULT_VIEW: 'result_view',

  // Quiz interaction events
  QUIZ_START: 'quiz_start',
  QUIZ_COMPLETE: 'quiz_complete',
  Q_ANSWERED_1: 'q_answered_1',
  Q_ANSWERED_2: 'q_answered_2',
  Q_ANSWERED_3: 'q_answered_3',
  Q_ANSWERED_4: 'q_answered_4',
  Q_ANSWERED_5: 'q_answered_5',
  Q_ANSWERED_6: 'q_answered_6',
  Q_SKIPPED_1: 'q_skipped_1',
  Q_SKIPPED_2: 'q_skipped_2',
  Q_SKIPPED_3: 'q_skipped_3',
  Q_SKIPPED_4: 'q_skipped_4',
  Q_SKIPPED_5: 'q_skipped_5',
  Q_SKIPPED_6: 'q_skipped_6',

  // Result events
  BLEND_GENERATED: 'blend_generated',
  PLAN_SELECTED: 'plan_selected',

  // Navigation events
  QUIZ_RESET: 'quiz_reset',
  QUIZ_BACK: 'quiz_back',

  // Error events
  ERROR_OCCURRED: 'error_occurred',

  // Performance events
  PAGE_LOAD_COMPLETE: 'page_load_complete',
  QUIZ_COMPLETION_TIME: 'quiz_completion_time'
};

/**
 * User properties that can be tracked
 */
const USER_PROPERTIES = {
  DEVICE_TYPE: 'device_type',
  CONNECTION_TYPE: 'connection_type',
  PREFERS_REDUCED_MOTION: 'prefers_reduced_motion',
  TIMEZONE: 'timezone',
  LANGUAGE: 'language'
};

/**
 * Analytics service class
 */
class AnalyticsService {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.userId = this.getUserId();
    this.userProperties = {};
    this.isEnabled = true;

    // Initialize user properties
    this.setUserProperties();
  }

  /**
   * Generate a unique session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get or create a user ID
   */
  getUserId() {
    let userId = localStorage.getItem('coffee_user_id');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('coffee_user_id', userId);
    }
    return userId;
  }

  /**
   * Set user properties based on device/browser capabilities
   */
  setUserProperties() {
    // Device type
    const userAgent = navigator.userAgent;
    const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
    const isTablet = /iPad|Android/.test(userAgent) && !/Mobile/.test(userAgent);
    let deviceType = 'desktop';
    if (isMobile) deviceType = 'mobile';
    else if (isTablet) deviceType = 'tablet';

    // Connection type
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const connectionType = connection ? connection.effectiveType : 'unknown';

    // User preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.userProperties = {
      [USER_PROPERTIES.DEVICE_TYPE]: deviceType,
      [USER_PROPERTIES.CONNECTION_TYPE]: connectionType,
      [USER_PROPERTIES.PREFERS_REDUCED_MOTION]: prefersReducedMotion,
      [USER_PROPERTIES.TIMEZONE]: Intl.DateTimeFormat().resolvedOptions().timeZone,
      [USER_PROPERTIES.LANGUAGE]: navigator.language
    };
  }

  /**
   * Track an analytics event
   * @param {string} eventName - Name of the event
   * @param {Object} properties - Event properties
   */
  track(eventName, properties = {}) {
    if (!this.isEnabled) return;

    const eventData = {
      event: eventName,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      userId: this.userId,
      properties: {
        ...properties,
        ...this.userProperties,
        url: window.location.href,
        referrer: document.referrer,
        user_agent: navigator.userAgent
      }
    };

    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      console.group(`📊 Analytics: ${eventName}`);
      console.log('Event Data:', eventData);
      console.groupEnd();
    }

    // In production, you would send to your analytics service
    // Example integrations:
    this.sendToAnalyticsServices(eventData);
  }

  /**
   * Track page view
   * @param {string} pageName - Name of the page
   * @param {Object} properties - Additional properties
   */
  trackPageView(pageName, properties = {}) {
    this.track('page_view', {
      page_name: pageName,
      page_title: document.title,
      ...properties
    });
  }

  /**
   * Track quiz progress
   * @param {number} questionNumber - Current question number
   * @param {number} totalQuestions - Total number of questions
   * @param {number} timeElapsed - Time elapsed in milliseconds
   */
  trackQuizProgress(questionNumber, totalQuestions, timeElapsed) {
    this.track('quiz_progress', {
      question_number: questionNumber,
      total_questions: totalQuestions,
      progress_percentage: (questionNumber / totalQuestions) * 100,
      time_elapsed: timeElapsed,
      average_time_per_question: timeElapsed / questionNumber
    });
  }

  /**
   * Track quiz completion with detailed metrics
   * @param {Object} completionData - Quiz completion data
   */
  trackQuizCompletion(completionData) {
    const {
      answers,
      timeElapsed,
      questionsSkipped,
      questionsAnswered,
      blendResult
    } = completionData;

    this.track(ANALYTICS_EVENTS.QUIZ_COMPLETE, {
      total_time: Math.round(timeElapsed / 1000),
      questions_answered: questionsAnswered,
      questions_skipped: questionsSkipped,
      completion_rate: (questionsAnswered / 6) * 100,
      blend_name: blendResult?.name,
      roast_preference: answers[2],
      drink_style: answers[1],
      flavors_selected: Array.isArray(answers[3]) ? answers[3].join(',') : answers[3],
      brew_method: answers[5],
      caffeine_preference: answers[6]
    });
  }

  /**
   * Track errors
   * @param {Error} error - Error object
   * @param {Object} context - Additional context
   */
  trackError(error, context = {}) {
    this.track(ANALYTICS_EVENTS.ERROR_OCCURRED, {
      error_message: error.message,
      error_stack: error.stack,
      error_name: error.name,
      ...context
    });
  }

  /**
   * Track performance metrics
   * @param {Object} metrics - Performance metrics
   */
  trackPerformance(metrics) {
    this.track('performance_metrics', {
      ...metrics,
      connection_type: this.userProperties[USER_PROPERTIES.CONNECTION_TYPE]
    });
  }

  /**
   * Send data to analytics services (placeholder)
   * @param {Object} eventData - Event data to send
   */
  sendToAnalyticsServices(eventData) {
    // Google Analytics 4 example
    if (typeof gtag !== 'undefined') {
      gtag('event', eventData.event, {
        custom_parameter: eventData.properties,
        session_id: eventData.sessionId,
        user_id: eventData.userId
      });
    }

    // Mixpanel example
    if (typeof mixpanel !== 'undefined') {
      mixpanel.track(eventData.event, eventData.properties);
      mixpanel.identify(eventData.userId);
    }

    // Facebook Pixel example
    if (typeof fbq !== 'undefined') {
      fbq('track', 'CustomEvent', {
        event_name: eventData.event,
        ...eventData.properties
      });
    }

    // Custom analytics endpoint example
    if (process.env.NODE_ENV === 'production') {
      // fetch('/api/analytics', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(eventData),
      // }).catch(err => console.warn('Analytics failed:', err));
    }
  }

  /**
   * Enable or disable analytics
   * @param {boolean} enabled - Whether analytics should be enabled
   */
  setEnabled(enabled) {
    this.isEnabled = enabled;
    if (enabled) {
      console.log('📊 Analytics enabled');
    } else {
      console.log('📊 Analytics disabled');
    }
  }

  /**
   * Update user properties
   * @param {Object} properties - Properties to update
   */
  updateUserProperties(properties) {
    this.userProperties = {
      ...this.userProperties,
      ...properties
    };
  }
}

// Create singleton instance
const analytics = new AnalyticsService();

// Export convenience functions
export const trackEvent = (event, properties) => analytics.track(event, properties);
export const trackPageView = (page, properties) => analytics.trackPageView(page, properties);
export const trackQuizProgress = (q, total, time) => analytics.trackQuizProgress(q, total, time);
export const trackQuizCompletion = (data) => analytics.trackQuizCompletion(data);
export const trackError = (error, context) => analytics.trackError(error, context);
export const trackPerformance = (metrics) => analytics.trackPerformance(metrics);
export const setAnalyticsEnabled = (enabled) => analytics.setEnabled(enabled);
export const updateUserProperties = (props) => analytics.updateUserProperties(props);

// Export events and properties constants
export { ANALYTICS_EVENTS, USER_PROPERTIES };

// Export the analytics service instance
export default analytics;