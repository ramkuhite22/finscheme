/* =========================================================
 * FinScheme — Cookie Consent Manager
 * ---------------------------------------------------------
 * Features:
 *  • Shows the consent banner ONLY on the home page (index.html)
 *  • Once a user accepts/rejects on a device, it never shows again
 *  • Persists a full JSON consent record in localStorage
 *  • Also mirrors a lightweight flag in document.cookie so
 *    server-side / other scripts can read it
 *  • Exposes window.FinSchemeCookies API for managing prefs
 *    (used by pages/cookie-policy.html)
 * =======================================================*/
(function () {
    'use strict';

    const STORAGE_KEY = 'finscheme_cookie_consent_v1';
    const CACHE_KEY = 'finscheme_cookie_cache_v1';
    const COOKIE_NAME = 'finscheme_consent';
    const CONSENT_VERSION = '1.0.0';
    // How long the consent is considered valid (days)
    const CONSENT_TTL_DAYS = 365;

    /* ---------- helpers ---------- */
    const now = () => new Date().toISOString();

    function setCookie(name, value, days) {
        try {
            const d = new Date();
            d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
            document.cookie =
                name + '=' + encodeURIComponent(value) +
                ';expires=' + d.toUTCString() +
                ';path=/;SameSite=Lax';
        } catch (e) { /* ignore */ }
    }

    function getCookie(name) {
        try {
            const match = document.cookie.match(
                new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)')
            );
            return match ? decodeURIComponent(match[1]) : null;
        } catch (e) { return null; }
    }

    // Lightweight, non-PII device fingerprint (for "per device" memory)
    function deviceFingerprint() {
        try {
            const raw = [
                navigator.userAgent,
                navigator.language,
                (navigator.languages || []).join(','),
                screen.width + 'x' + screen.height,
                screen.colorDepth,
                new Date().getTimezoneOffset(),
                navigator.hardwareConcurrency || '',
                navigator.platform || ''
            ].join('|');
            let h = 0;
            for (let i = 0; i < raw.length; i++) {
                h = ((h << 5) - h) + raw.charCodeAt(i);
                h |= 0;
            }
            return 'dev_' + Math.abs(h).toString(36);
        } catch (e) { return 'dev_unknown'; }
    }

    /* ---------- persistence layer (JSON) ---------- */
    function readConsent() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            if (!parsed || parsed.version !== CONSENT_VERSION) return null;
            // expiry check
            if (parsed.expiresAt && new Date(parsed.expiresAt) < new Date()) return null;
            return parsed;
        } catch (e) { return null; }
    }

    function writeConsent(consent) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
        } catch (e) { /* storage full or disabled */ }
        // tiny cookie mirror (so server or 3rd-party scripts can peek)
        setCookie(COOKIE_NAME, consent.status, CONSENT_TTL_DAYS);
    }

    function readCache() {
        try {
            const raw = localStorage.getItem(CACHE_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch (e) { return {}; }
    }

    function writeCache(cache) {
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); }
        catch (e) { /* ignore */ }
    }

    function buildConsent(status, categories) {
        const expires = new Date();
        expires.setDate(expires.getDate() + CONSENT_TTL_DAYS);
        return {
            version: CONSENT_VERSION,
            status: status,                // 'accepted' | 'rejected' | 'custom'
            categories: Object.assign({
                necessary: true,   // always on
                preferences: false,
                analytics: false,
                marketing: false
            }, categories || {}),
            device: deviceFingerprint(),
            url: location.href,
            createdAt: now(),
            expiresAt: expires.toISOString()
        };
    }

    function recordEvent(type) {
        const cache = readCache();
        cache.events = cache.events || [];
        cache.events.push({ type: type, at: now(), page: location.pathname });
        // Keep last 50 events only
        if (cache.events.length > 50) cache.events = cache.events.slice(-50);
        cache.lastSeen = now();
        writeCache(cache);
    }

    /* ---------- banner UI ---------- */
    function injectStyles() {
        if (document.getElementById('fs-cookie-styles')) return;
        const css = `
    #fs-cookie-banner{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);
      width:min(960px,calc(100% - 32px));background:rgba(15,23,42,.96);
      backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);
      color:#fff;padding:18px 22px;border-radius:16px;
      box-shadow:0 20px 50px rgba(0,0,0,.35);
      border:1px solid rgba(255,255,255,.08);
      font:14px/1.55 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
      z-index:99999;display:flex;flex-wrap:wrap;gap:14px;align-items:center;
      animation:fsCookieIn .35s ease-out both;}
    @keyframes fsCookieIn{from{opacity:0;transform:translate(-50%,20px)}
                          to{opacity:1;transform:translate(-50%,0)}}
    #fs-cookie-banner .fs-ctext{flex:1 1 320px;min-width:260px;}
    #fs-cookie-banner h4{margin:0 0 4px;font-size:15px;font-weight:600;}
    #fs-cookie-banner p{margin:0;color:#cbd5e1;font-size:13px;}
    #fs-cookie-banner a{color:#60a5fa;text-decoration:underline;}
    #fs-cookie-banner .fs-cbtns{display:flex;gap:8px;flex-wrap:wrap;}
    #fs-cookie-banner button{cursor:pointer;border:0;border-radius:10px;
      padding:9px 16px;font-size:13px;font-weight:600;transition:transform .15s,opacity .15s;}
    #fs-cookie-banner button:hover{transform:translateY(-1px);}
    #fs-cookie-banner .fs-accept{background:linear-gradient(135deg,#3b82f6,#6366f1);color:#fff;}
    #fs-cookie-banner .fs-reject{background:rgba(255,255,255,.08);color:#fff;
      border:1px solid rgba(255,255,255,.15);}
    #fs-cookie-banner .fs-custom{background:transparent;color:#cbd5e1;
      border:1px solid rgba(255,255,255,.15);}
    #fs-cookie-prefs{position:fixed;inset:0;background:rgba(2,6,23,.65);
      backdrop-filter:blur(4px);display:none;align-items:center;justify-content:center;
      z-index:100000;padding:16px;}
    #fs-cookie-prefs.open{display:flex;animation:fsCookieIn .25s ease-out both;}
    #fs-cookie-prefs .fs-modal{background:#0f172a;color:#fff;border-radius:16px;
      width:min(520px,100%);padding:24px;border:1px solid rgba(255,255,255,.08);}
    #fs-cookie-prefs h3{margin:0 0 8px;font-size:18px;}
    #fs-cookie-prefs p.fs-lead{margin:0 0 16px;color:#94a3b8;font-size:13px;}
    #fs-cookie-prefs .fs-row{display:flex;justify-content:space-between;align-items:center;
      padding:12px 0;border-top:1px solid rgba(255,255,255,.06);}
    #fs-cookie-prefs .fs-row:first-of-type{border-top:0;}
    #fs-cookie-prefs .fs-row .fs-name{font-weight:600;font-size:14px;}
    #fs-cookie-prefs .fs-row .fs-desc{font-size:12px;color:#94a3b8;margin-top:2px;}
    #fs-cookie-prefs .fs-toggle{position:relative;width:40px;height:22px;
      background:rgba(255,255,255,.12);border-radius:20px;cursor:pointer;transition:.2s;}
    #fs-cookie-prefs .fs-toggle::after{content:"";position:absolute;top:2px;left:2px;
      width:18px;height:18px;border-radius:50%;background:#fff;transition:.2s;}
    #fs-cookie-prefs .fs-toggle.on{background:#3b82f6;}
    #fs-cookie-prefs .fs-toggle.on::after{left:20px;}
    #fs-cookie-prefs .fs-toggle.locked{opacity:.5;cursor:not-allowed;background:#3b82f6;}
    #fs-cookie-prefs .fs-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:18px;}
    #fs-cookie-prefs button{cursor:pointer;border:0;border-radius:10px;padding:9px 16px;
      font-size:13px;font-weight:600;}
    #fs-cookie-prefs .fs-save{background:linear-gradient(135deg,#3b82f6,#6366f1);color:#fff;}
    #fs-cookie-prefs .fs-cancel{background:rgba(255,255,255,.08);color:#fff;}
    @media(max-width:540px){
      #fs-cookie-banner{bottom:12px;padding:14px 16px;}
      #fs-cookie-banner .fs-cbtns{width:100%;}
      #fs-cookie-banner .fs-cbtns button{flex:1;}
    }`;
        const style = document.createElement('style');
        style.id = 'fs-cookie-styles';
        style.textContent = css;
        document.head.appendChild(style);
    }

    function policyHref() {
        // resolve relative path depending on current location
        return location.pathname.includes('/pages/')
            ? 'cookie-policy.html'
            : 'pages/cookie-policy.html';
    }

    function renderBanner() {
        if (document.getElementById('fs-cookie-banner')) return;
        injectStyles();
        const el = document.createElement('div');
        el.id = 'fs-cookie-banner';
        el.setAttribute('role', 'dialog');
        el.setAttribute('aria-live', 'polite');
        el.setAttribute('aria-label', 'Cookie consent');
        el.innerHTML =
            '<div class="fs-ctext">' +
            '<h4>🍪 We value your privacy</h4>' +
            '<p>We use cookies to improve your experience, analyze traffic and ' +
            'remember your preferences. Read our ' +
            '<a href="' + policyHref() + '">Cookie Policy</a>.</p>' +
            '</div>' +
            '<div class="fs-cbtns">' +
            '<button class="fs-custom" type="button">Customize</button>' +
            '<button class="fs-reject" type="button">Reject All</button>' +
            '<button class="fs-accept" type="button">Accept All</button>' +
            '</div>';
        document.body.appendChild(el);

        el.querySelector('.fs-accept').addEventListener('click', function () {
            FinSchemeCookies.acceptAll(); dismissBanner();
        });
        el.querySelector('.fs-reject').addEventListener('click', function () {
            FinSchemeCookies.rejectAll(); dismissBanner();
        });
        el.querySelector('.fs-custom').addEventListener('click', function () {
            openPreferences();
        });
    }

    function dismissBanner() {
        const el = document.getElementById('fs-cookie-banner');
        if (!el) return;
        el.style.transition = 'opacity .25s, transform .25s';
        el.style.opacity = '0';
        el.style.transform = 'translate(-50%, 20px)';
        setTimeout(() => el.remove(), 260);
    }

    function openPreferences() {
        injectStyles();
        let modal = document.getElementById('fs-cookie-prefs');
        const existing = readConsent();
        const cats = existing ? existing.categories : {
            necessary: true, preferences: false, analytics: false, marketing: false
        };
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'fs-cookie-prefs';
            modal.innerHTML =
                '<div class="fs-modal" role="dialog" aria-label="Cookie preferences">' +
                '<h3>Cookie preferences</h3>' +
                '<p class="fs-lead">Choose which categories of cookies you allow. ' +
                'Your choice is stored only on this device.</p>' +
                cookieRow('necessary', 'Strictly necessary', 'Required for the site to function. Cannot be disabled.', true, true) +
                cookieRow('preferences', 'Preferences', 'Remember your language, theme and other settings.', cats.preferences) +
                cookieRow('analytics', 'Analytics', 'Help us understand how visitors use the site.', cats.analytics) +
                cookieRow('marketing', 'Marketing', 'Used to show relevant content and measure campaigns.', cats.marketing) +
                '<div class="fs-actions">' +
                '<button class="fs-cancel" type="button">Cancel</button>' +
                '<button class="fs-save"   type="button">Save preferences</button>' +
                '</div>' +
                '</div>';
            document.body.appendChild(modal);

            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.classList.remove('open');
            });
            modal.querySelectorAll('.fs-toggle').forEach(t => {
                t.addEventListener('click', () => {
                    if (t.classList.contains('locked')) return;
                    t.classList.toggle('on');
                });
            });
            modal.querySelector('.fs-cancel').addEventListener('click', () => {
                modal.classList.remove('open');
            });
            modal.querySelector('.fs-save').addEventListener('click', () => {
                const chosen = {};
                modal.querySelectorAll('.fs-toggle').forEach(t => {
                    chosen[t.dataset.cat] = t.classList.contains('on');
                });
                chosen.necessary = true;
                FinSchemeCookies.saveCustom(chosen);
                modal.classList.remove('open');
                dismissBanner();
            });
        }
        modal.classList.add('open');
    }

    function cookieRow(key, name, desc, checked, locked) {
        return '<div class="fs-row">' +
            '<div><div class="fs-name">' + name + '</div>' +
            '<div class="fs-desc">' + desc + '</div></div>' +
            '<div class="fs-toggle ' + (checked ? 'on' : '') + (locked ? ' locked' : '') +
            '" data-cat="' + key + '" role="switch" aria-checked="' + !!checked + '"></div>' +
            '</div>';
    }

    /* ---------- public API ---------- */
    const FinSchemeCookies = {
        get: readConsent,
        getCache: readCache,
        has: function () { return !!readConsent(); },
        allowed: function (category) {
            const c = readConsent();
            if (!c) return category === 'necessary';
            return !!c.categories[category];
        },
        acceptAll: function () {
            const consent = buildConsent('accepted', {
                necessary: true, preferences: true, analytics: true, marketing: true
            });
            writeConsent(consent);
            recordEvent('accept_all');
            dispatch(consent);
        },
        rejectAll: function () {
            const consent = buildConsent('rejected', {
                necessary: true, preferences: false, analytics: false, marketing: false
            });
            writeConsent(consent);
            recordEvent('reject_all');
            dispatch(consent);
        },
        saveCustom: function (categories) {
            const consent = buildConsent('custom', categories);
            writeConsent(consent);
            recordEvent('custom_save');
            dispatch(consent);
        },
        reset: function () {
            try { localStorage.removeItem(STORAGE_KEY); } catch (e) { }
            setCookie(COOKIE_NAME, '', -1);
            recordEvent('reset');
        },
        openPreferences: openPreferences,
        showBanner: function () {                // force-show (for policy page)
            if (!readConsent()) renderBanner();
        }
    };

    function dispatch(consent) {
        try {
            window.dispatchEvent(new CustomEvent('finscheme:consent', { detail: consent }));
        } catch (e) { /* ignore */ }
    }

    /* ---------- boot ---------- */
    function isHomePage() {
        const p = location.pathname.replace(/\\/g, '/').toLowerCase();
        if (p === '/' || p === '') return true;
        if (p.endsWith('/index.html')) return true;
        if (p.endsWith('/index.htm')) return true;
        // Also treat site root served from sub-path (e.g. GitHub pages)
        const last = p.split('/').filter(Boolean).pop() || '';
        return last === 'index.html' || last === '';
    }

    function boot() {
        // Always record a page view (for cache)
        recordEvent('page_view');

        const existing = readConsent();
        if (existing) return;              // already decided on this device — never show again

        // Only show the banner on the home page
        if (!isHomePage()) return;

        // Slight delay to let main content render first
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => setTimeout(renderBanner, 600));
        } else {
            setTimeout(renderBanner, 600);
        }
    }

    // expose
    window.FinSchemeCookies = FinSchemeCookies;

    boot();
})();
