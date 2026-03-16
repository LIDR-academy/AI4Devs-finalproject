import { useCallback, useEffect, useRef } from 'react';
import { log } from '../utils/logger';

// Analytics event types
interface AnalyticsEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  userId?: string;
  sessionId?: string;
  timestamp: string;
  url: string;
  userAgent: string;
  properties?: Record<string, any>;
}

// Performance metrics
interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: string;
  url: string;
  additionalData?: Record<string, any>;
}

// User behavior tracking
interface UserAction {
  action: string;
  element?: string;
  page: string;
  timestamp: string;
  userId?: string;
  sessionId?: string;
  properties?: Record<string, any>;
}

class Analytics {
  private sessionId: string;
  private userId?: string;
  private isEnabled: boolean;
  private queue: AnalyticsEvent[] = [];
  private performanceQueue: PerformanceMetric[] = [];
  private userActionQueue: UserAction[] = [];

  constructor() {
    this.sessionId = this.generateSessionId();
    this.isEnabled = process.env.NODE_ENV === 'production' || 
                     localStorage.getItem('analytics_enabled') === 'true';
    
    // Flush queues periodically
    setInterval(() => this.flush(), 30000); // Every 30 seconds
    
    // Flush on page unload
    window.addEventListener('beforeunload', () => this.flush());
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  setUserId(userId: string) {
    this.userId = userId;
    this.track('user_identified', 'auth', 'login', { userId });
  }

  clearUserId() {
    this.track('user_logout', 'auth', 'logout');
    this.userId = undefined;
  }

  enable() {
    this.isEnabled = true;
    localStorage.setItem('analytics_enabled', 'true');
  }

  disable() {
    this.isEnabled = false;
    localStorage.setItem('analytics_enabled', 'false');
  }

  // Core tracking method
  track(
    event: string,
    category: string,
    action: string,
    properties?: Record<string, any>
  ) {
    if (!this.isEnabled) return;

    const analyticsEvent: AnalyticsEvent = {
      event,
      category,
      action,
      label: properties?.label,
      value: properties?.value,
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      properties,
    };

    this.queue.push(analyticsEvent);
    log.info(`Analytics: ${event}`, analyticsEvent);

    // Auto-flush if queue gets too large
    if (this.queue.length >= 10) {
      this.flush();
    }
  }

  // Page view tracking
  trackPageView(page: string, title?: string) {
    this.track('page_view', 'navigation', 'view', {
      page,
      title: title || document.title,
      referrer: document.referrer,
    });
  }

  // User interaction tracking
  trackUserAction(action: string, element?: string, properties?: Record<string, any>) {
    const userAction: UserAction = {
      action,
      element,
      page: window.location.pathname,
      timestamp: new Date().toISOString(),
      userId: this.userId,
      sessionId: this.sessionId,
      properties,
    };

    this.userActionQueue.push(userAction);
    this.track('user_action', 'interaction', action, { element, ...properties });
  }

  // Performance tracking
  trackPerformance(name: string, value: number, unit: string = 'ms', additionalData?: Record<string, any>) {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      additionalData,
    };

    this.performanceQueue.push(metric);
    log.performance.measure(name, value, unit);
  }

  // Error tracking
  trackError(error: Error, context?: string, additionalData?: Record<string, any>) {
    this.track('error', 'system', 'error_occurred', {
      error_name: error.name,
      error_message: error.message,
      error_stack: error.stack,
      context,
      ...additionalData,
    });
  }

  // Business events
  trackBusinessEvent(event: string, properties?: Record<string, any>) {
    this.track(event, 'business', 'event', properties);
  }

  // E-commerce tracking
  trackPurchase(orderId: string, value: number, currency: string = 'EUR', items?: any[]) {
    this.track('purchase', 'ecommerce', 'purchase_completed', {
      order_id: orderId,
      value,
      currency,
      items,
    });
  }

  trackAddToCart(productId: string, productName: string, price: number, quantity: number = 1) {
    this.track('add_to_cart', 'ecommerce', 'add_to_cart', {
      product_id: productId,
      product_name: productName,
      price,
      quantity,
    });
  }

  // Search tracking
  trackSearch(query: string, results: number, category?: string) {
    this.track('search', 'search', 'search_performed', {
      query,
      results_count: results,
      category,
    });
  }

  // Form tracking
  trackFormStart(formName: string) {
    this.track('form_start', 'form', 'form_started', { form_name: formName });
  }

  trackFormComplete(formName: string, success: boolean, errors?: string[]) {
    this.track('form_complete', 'form', success ? 'form_completed' : 'form_failed', {
      form_name: formName,
      success,
      errors,
    });
  }

  // Flush data to server
  private async flush() {
    if (this.queue.length === 0 && this.performanceQueue.length === 0 && this.userActionQueue.length === 0) {
      return;
    }

    const payload = {
      events: [...this.queue],
      performance: [...this.performanceQueue],
      userActions: [...this.userActionQueue],
      sessionId: this.sessionId,
      userId: this.userId,
      timestamp: new Date().toISOString(),
    };

    // Clear queues
    this.queue = [];
    this.performanceQueue = [];
    this.userActionQueue = [];

    try {
      // In a real app, send to your analytics service
      // await fetch('/api/analytics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload),
      // });

      // For development, store in localStorage
      if (process.env.NODE_ENV === 'development') {
        const stored = JSON.parse(localStorage.getItem('analytics_data') || '[]');
        stored.push(payload);
        // Keep only last 50 batches
        if (stored.length > 50) {
          stored.splice(0, stored.length - 50);
        }
        localStorage.setItem('analytics_data', JSON.stringify(stored));
      }

      log.info('Analytics data flushed', { eventCount: payload.events.length });
    } catch (error) {
      log.error('Failed to flush analytics data', error);
      // Re-add to queue for retry
      this.queue.unshift(...payload.events);
      this.performanceQueue.unshift(...payload.performance);
      this.userActionQueue.unshift(...payload.userActions);
    }
  }

  // Get analytics data for debugging
  getStoredData() {
    try {
      return JSON.parse(localStorage.getItem('analytics_data') || '[]');
    } catch {
      return [];
    }
  }

  // Clear stored data
  clearStoredData() {
    localStorage.removeItem('analytics_data');
  }
}

// Singleton instance
const analytics = new Analytics();

// React hook for analytics
export const useAnalytics = () => {
  const pageViewTracked = useRef(false);

  // Track page view on mount
  useEffect(() => {
    if (!pageViewTracked.current) {
      analytics.trackPageView(window.location.pathname);
      pageViewTracked.current = true;
    }
  }, []);

  const trackClick = useCallback((element: string, properties?: Record<string, any>) => {
    analytics.trackUserAction('click', element, properties);
  }, []);

  const trackFormSubmit = useCallback((formName: string, success: boolean, errors?: string[]) => {
    analytics.trackFormComplete(formName, success, errors);
  }, []);

  const trackSearch = useCallback((query: string, results: number, category?: string) => {
    analytics.trackSearch(query, results, category);
  }, []);

  const trackError = useCallback((error: Error, context?: string) => {
    analytics.trackError(error, context);
  }, []);

  const trackCustomEvent = useCallback((event: string, category: string, action: string, properties?: Record<string, any>) => {
    analytics.track(event, category, action, properties);
  }, []);

  return {
    trackClick,
    trackFormSubmit,
    trackSearch,
    trackError,
    trackCustomEvent,
    trackPageView: analytics.trackPageView.bind(analytics),
    trackPurchase: analytics.trackPurchase.bind(analytics),
    trackAddToCart: analytics.trackAddToCart.bind(analytics),
    setUserId: analytics.setUserId.bind(analytics),
    clearUserId: analytics.clearUserId.bind(analytics),
  };
};

// Performance monitoring hook
export const usePerformanceMonitoring = () => {
  const startTime = useRef<number>();

  const startMeasure = useCallback((name: string) => {
    startTime.current = performance.now();
    log.performance.time(name);
  }, []);

  const endMeasure = useCallback((name: string, additionalData?: Record<string, any>) => {
    if (startTime.current) {
      const duration = performance.now() - startTime.current;
      analytics.trackPerformance(name, duration, 'ms', additionalData);
      log.performance.timeEnd(name);
      startTime.current = undefined;
      return duration;
    }
    return 0;
  }, []);

  const measureRender = useCallback((componentName: string) => {
    const renderStart = performance.now();
    
    return () => {
      const renderTime = performance.now() - renderStart;
      analytics.trackPerformance(`render_${componentName}`, renderTime, 'ms');
    };
  }, []);

  const measureApiCall = useCallback((endpoint: string, method: string) => {
    const apiStart = performance.now();
    
    return (success: boolean, statusCode?: number) => {
      const apiTime = performance.now() - apiStart;
      analytics.trackPerformance(`api_${method}_${endpoint}`, apiTime, 'ms', {
        success,
        statusCode,
      });
    };
  }, []);

  return {
    startMeasure,
    endMeasure,
    measureRender,
    measureApiCall,
  };
};

// Web Vitals monitoring
export const useWebVitals = () => {
  useEffect(() => {
    // Measure Core Web Vitals
    if ('web-vital' in window) {
      // This would integrate with web-vitals library
      // import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';
      
      // getCLS((metric) => analytics.trackPerformance('CLS', metric.value, 'score'));
      // getFID((metric) => analytics.trackPerformance('FID', metric.value, 'ms'));
      // getFCP((metric) => analytics.trackPerformance('FCP', metric.value, 'ms'));
      // getLCP((metric) => analytics.trackPerformance('LCP', metric.value, 'ms'));
      // getTTFB((metric) => analytics.trackPerformance('TTFB', metric.value, 'ms'));
    }

    // Basic performance metrics
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (navigation) {
          analytics.trackPerformance('page_load_time', navigation.loadEventEnd - navigation.fetchStart, 'ms');
          analytics.trackPerformance('dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.fetchStart, 'ms');
          analytics.trackPerformance('first_byte', navigation.responseStart - navigation.fetchStart, 'ms');
        }
      }, 0);
    });
  }, []);
};

export default analytics; 