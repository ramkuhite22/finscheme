(function initFinSchemeAnalytics() {
  const defaultConfigUrl = '/api/public-config';
  const state = {
    configLoaded: false,
    initialized: false,
    measurementId: '',
    queue: []
  };

  function getConfigUrl() {
    return document.body?.dataset?.publicConfig || defaultConfigUrl;
  }

  function getConsentValue() {
    const analyticsAllowed = window.FinSchemeCookies?.allowed?.('analytics');
    return analyticsAllowed ? 'granted' : 'denied';
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        resolve(existing);
        return;
      }

      const script = document.createElement('script');
      script.async = true;
      script.src = src;
      script.onload = () => resolve(script);
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function ensureGtagBase() {
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtag() {
      window.dataLayer.push(arguments);
    };
  }

  function applyConsentDefaults() {
    if (!window.gtag) return;
    window.gtag('consent', 'default', {
      analytics_storage: getConsentValue(),
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
  }

  function flushQueue() {
    if (!state.initialized || !window.gtag) return;
    while (state.queue.length) {
      const [eventName, params] = state.queue.shift();
      window.gtag('event', eventName, params);
    }
  }

  async function init() {
    if (state.configLoaded) return state.measurementId;
    state.configLoaded = true;

    try {
      const response = await fetch(getConfigUrl(), { headers: { Accept: 'application/json' } });
      if (!response.ok) {
        return '';
      }

      const config = await response.json();
      state.measurementId = (config.gaMeasurementId || '').trim();

      if (!state.measurementId) {
        return '';
      }

      ensureGtagBase();
      applyConsentDefaults();
      await loadScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(state.measurementId)}`);

      window.gtag('js', new Date());
      window.gtag('config', state.measurementId, {
        anonymize_ip: true,
        send_page_view: false,
        transport_type: 'beacon'
      });

      state.initialized = true;
      flushQueue();
      pageView();
      return state.measurementId;
    } catch (error) {
      console.warn('FinScheme analytics failed to initialize.', error);
      return '';
    }
  }

  function track(eventName, params = {}) {
    if (!eventName) return;

    const payload = {
      page_path: window.location.pathname,
      page_title: document.title,
      ...params
    };

    if (!state.initialized || !window.gtag) {
      state.queue.push([eventName, payload]);
      init();
      return;
    }

    window.gtag('event', eventName, payload);
  }

  function pageView(params = {}) {
    track('page_view', {
      page_location: window.location.href,
      page_referrer: document.referrer || '',
      ...params
    });
  }

  function bindClickTracking() {
    if (document.body?.dataset?.analyticsBound === 'true') return;
    if (document.body) {
      document.body.dataset.analyticsBound = 'true';
    }

    document.addEventListener('click', (event) => {
      const target = event.target.closest('[data-analytics-event]');
      if (!target) return;

      track(target.dataset.analyticsEvent, {
        cta_label: target.dataset.analyticsLabel || target.textContent.trim(),
        cta_location: target.dataset.analyticsLocation || window.location.pathname
      });
    });
  }

  window.addEventListener('finscheme:consent', () => {
    if (!window.gtag) return;
    window.gtag('consent', 'update', {
      analytics_storage: getConsentValue()
    });
  });

  document.addEventListener('DOMContentLoaded', () => {
    bindClickTracking();
    init();
  });

  window.FinSchemeAnalytics = {
    init,
    track,
    pageView,
    getState() {
      return { ...state };
    }
  };
})();
