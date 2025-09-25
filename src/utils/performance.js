/**
 * Performance Utilities
 * Provides helpers for lazy loading, image optimization, and performance monitoring
 */

/**
 * Lazy load images when they enter viewport
 * @param {HTMLElement} img - Image element to lazy load
 * @param {Object} options - Intersection observer options
 */
export function lazyLoadImage(img, options = {}) {
  if (!('IntersectionObserver' in window)) {
    // Fallback for browsers without IntersectionObserver
    loadImage(img);
    return;
  }

  const defaultOptions = {
    rootMargin: '50px 0px',
    threshold: 0.01,
    ...options
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        loadImage(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, defaultOptions);

  observer.observe(img);
}

/**
 * Load image with proper loading states
 * @param {HTMLElement} img - Image element
 */
function loadImage(img) {
  const actualSrc = img.dataset.src || img.src;

  if (!actualSrc) return;

  img.classList.add('loading');

  const tempImg = new Image();
  tempImg.onload = () => {
    img.src = actualSrc;
    img.classList.remove('loading');
    img.classList.add('loaded');
  };

  tempImg.onerror = () => {
    img.classList.remove('loading');
    img.classList.add('error');
  };

  tempImg.src = actualSrc;
}

/**
 * Lazy load video when it enters viewport
 * @param {HTMLVideoElement} video - Video element to lazy load
 * @param {Object} options - Intersection observer options
 */
export function lazyLoadVideo(video, options = {}) {
  if (!('IntersectionObserver' in window)) {
    // Fallback
    loadVideo(video);
    return;
  }

  const defaultOptions = {
    rootMargin: '200px 0px',
    threshold: 0.25,
    ...options
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        loadVideo(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, defaultOptions);

  observer.observe(video);
}

/**
 * Load video sources and start playback
 * @param {HTMLVideoElement} video - Video element
 */
function loadVideo(video) {
  // Load video sources
  const sources = video.querySelectorAll('source[data-src]');
  sources.forEach(source => {
    source.src = source.dataset.src;
    source.removeAttribute('data-src');
  });

  // Set poster if available
  if (video.dataset.poster) {
    video.poster = video.dataset.poster;
  }

  // Load video and play if autoplay is set
  video.load();

  video.addEventListener('loadeddata', () => {
    video.dataset.loaded = 'true';
    if (video.autoplay && !video.paused) {
      video.play().catch(() => {
        // Autoplay failed, which is expected in many browsers
        console.log('Video autoplay prevented by browser');
      });
    }
  }, { once: true });
}

/**
 * Preload critical resources
 * @param {Array} resources - Array of resource objects with url and type
 */
export function preloadResources(resources) {
  resources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource.url;

    if (resource.type) {
      link.as = resource.type;
    }

    if (resource.type === 'font') {
      link.crossOrigin = 'anonymous';
    }

    document.head.appendChild(link);
  });
}

/**
 * Debounce function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function calls
 * @param {Function} func - Function to throttle
 * @param {number} limit - Limit in milliseconds
 * @returns {Function} - Throttled function
 */
export function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Check if device prefers reduced motion
 * @returns {boolean}
 */
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get device connection information for adaptive loading
 * @returns {Object} - Connection info
 */
export function getConnectionInfo() {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

  if (!connection) {
    return { effectiveType: '4g', saveData: false };
  }

  return {
    effectiveType: connection.effectiveType,
    downlink: connection.downlink,
    rtt: connection.rtt,
    saveData: connection.saveData
  };
}

/**
 * Adaptive media loading based on connection
 * @param {Object} mediaOptions - Different quality options
 * @returns {Object} - Selected media option
 */
export function getAdaptiveMedia(mediaOptions) {
  const connection = getConnectionInfo();

  // If user has data saver on, use lowest quality
  if (connection.saveData) {
    return mediaOptions.low || mediaOptions.medium || mediaOptions.high;
  }

  // Select based on connection type
  switch (connection.effectiveType) {
    case 'slow-2g':
    case '2g':
      return mediaOptions.low || mediaOptions.medium;
    case '3g':
      return mediaOptions.medium || mediaOptions.high;
    case '4g':
    default:
      return mediaOptions.high || mediaOptions.medium;
  }
}

/**
 * Monitor Core Web Vitals
 */
export function monitorCoreWebVitals() {
  // Largest Contentful Paint (LCP)
  if ('PerformanceObserver' in window) {
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('LCP:', lastEntry.startTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      // PerformanceObserver not supported for this metric
    }

    // First Input Delay (FID)
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          console.log('FID:', entry.processingStart - entry.startTime);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      // PerformanceObserver not supported for this metric
    }

    // Cumulative Layout Shift (CLS)
    try {
      let cumulativeLayoutShift = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (!entry.hadRecentInput) {
            cumulativeLayoutShift += entry.value;
          }
        });
        console.log('CLS:', cumulativeLayoutShift);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      // PerformanceObserver not supported for this metric
    }
  }
}

/**
 * Resource hints for better performance
 * @param {Array} domains - Array of domain strings to hint
 */
export function addResourceHints(domains) {
  domains.forEach(domain => {
    // DNS prefetch
    const dnsPrefetch = document.createElement('link');
    dnsPrefetch.rel = 'dns-prefetch';
    dnsPrefetch.href = `//${domain}`;
    document.head.appendChild(dnsPrefetch);

    // Preconnect for critical domains
    const preconnect = document.createElement('link');
    preconnect.rel = 'preconnect';
    preconnect.href = `https://${domain}`;
    preconnect.crossOrigin = 'anonymous';
    document.head.appendChild(preconnect);
  });
}

/**
 * Initialize performance monitoring
 */
export function initializePerformance() {
  // Monitor Core Web Vitals
  monitorCoreWebVitals();

  // Add resource hints for common domains
  addResourceHints([
    'fonts.googleapis.com',
    'fonts.gstatic.com'
  ]);

  // Preload critical fonts
  preloadResources([
    {
      url: 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@300;400;500;600;700&display=swap',
      type: 'style'
    }
  ]);

  // Log performance initialization
  console.log('⚡ Performance monitoring initialized');

  // Report initial page load time
  window.addEventListener('load', () => {
    setTimeout(() => {
      const perfData = performance.getEntriesByType('navigation')[0];
      if (perfData) {
        console.log('Page Load Time:', perfData.loadEventEnd - perfData.fetchStart, 'ms');
        console.log('DOM Content Loaded:', perfData.domContentLoadedEventEnd - perfData.fetchStart, 'ms');
        console.log('First Paint:', performance.getEntriesByType('paint').find(p => p.name === 'first-paint')?.startTime, 'ms');
      }
    }, 0);
  });
}

/**
 * Image optimization utility
 * @param {string} src - Original image source
 * @param {Object} options - Optimization options
 * @returns {string} - Optimized image source
 */
export function optimizeImage(src, options = {}) {
  const { width, height, quality = 85, format = 'auto' } = options;

  // This is a placeholder for actual image optimization service
  // In a real app, you might use services like Cloudinary, ImageKit, or build your own
  let optimizedSrc = src;

  const params = new URLSearchParams();

  if (width) params.append('w', width);
  if (height) params.append('h', height);
  if (quality !== 85) params.append('q', quality);
  if (format !== 'auto') params.append('f', format);

  if (params.toString()) {
    const separator = src.includes('?') ? '&' : '?';
    optimizedSrc = `${src}${separator}${params.toString()}`;
  }

  return optimizedSrc;
}