window.__schemeScoutLiveEnabled = true;

document.addEventListener('DOMContentLoaded', () => {
  const logsEl = document.getElementById('scout-logs');
  const resultsEl = document.getElementById('scoutResults');
  const summaryEl = document.getElementById('scoutSummary');
  const updatedAtEl = document.getElementById('scoutUpdatedAt');
  const statusEl = document.getElementById('scoutStatusText');
  const refreshBtn = document.getElementById('scoutRefreshBtn');

  if (!logsEl || !resultsEl) return;

  const apiUrl = document.body.dataset.scoutApi || '/api/scout';
  const feedUrl = document.body.dataset.scoutFeed || 'data/scout-feed.json';
  let pollTimer = null;

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function relativeStamp(iso) {
    if (!iso) return 'Waiting for first background run...';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return 'Waiting for first background run...';
    return `Last updated ${date.toLocaleString()}`;
  }

  function badgeClass(kind) {
    return kind === 'updated' ? 'scout-badge scout-badge-blue' : 'scout-badge';
  }

  function badgeLabel(kind) {
    if (kind === 'new') return 'New discovery';
    if (kind === 'updated') return 'Updated';
    return 'Monitoring';
  }

  function renderLogs(logs) {
    const safeLogs = Array.isArray(logs) && logs.length
      ? logs.slice(-8)
      : [
          '[AGENT] Waiting for scout feed...',
          '[AGENT] Background worker will populate this terminal shortly.'
        ];

    logsEl.innerHTML = '';
    safeLogs.forEach((line) => {
      const item = document.createElement('div');
      item.className = 'log-line';
      item.innerHTML = `<span>[AGENT]</span> ${escapeHtml(line.replace(/^\[AGENT\]\s*/i, ''))}`;
      logsEl.appendChild(item);
    });

    const cursor = document.createElement('div');
    cursor.className = 'log-line cursor';
    cursor.textContent = '_';
    logsEl.appendChild(cursor);
    logsEl.scrollTop = logsEl.scrollHeight;
  }

  function renderCards(discoveries) {
    const items = Array.isArray(discoveries) && discoveries.length
      ? discoveries
      : [
          {
            kind: 'monitoring',
            title: 'Scout cache is warming up',
            summary: 'The background worker is enabled. Once the first run completes, official portal findings will replace this placeholder.',
            sourceLabel: 'Background worker',
            state: 'All States'
          }
        ];

    resultsEl.innerHTML = '';

    items.slice(0, 3).forEach((item) => {
      const article = document.createElement('article');
      article.className = 'scout-card fade-in';
      const sourceBits = [item.sourceLabel, item.state].filter(Boolean).join(' · ');
      article.innerHTML = `
        <div class="${badgeClass(item.kind)}">${escapeHtml(badgeLabel(item.kind))}</div>
        <h3>${escapeHtml(item.title || 'Monitoring insight')}</h3>
        <p>${escapeHtml(item.summary || 'Official source snapshot captured.')}</p>
        <div class="scout-meta">${escapeHtml(sourceBits || 'Official source')}</div>
      `;
      resultsEl.appendChild(article);
    });
  }

  function renderFeed(feed) {
    if (summaryEl) {
      summaryEl.textContent = feed.summary || 'Background scout refreshed its latest official-source cache.';
    }

    if (updatedAtEl) {
      updatedAtEl.textContent = relativeStamp(feed.updatedAt);
    }

    if (statusEl) {
      const statusText = feed.status ? `Scout status: ${feed.status}` : 'Scout status: idle';
      statusEl.textContent = statusText;
    }

    renderLogs(feed.logs);
    renderCards(feed.discoveries);

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  async function getFeed() {
    try {
      const response = await fetch(`${apiUrl}?ts=${Date.now()}`, {
        cache: 'no-store'
      });
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // Fall back to the static cache file below.
    }

    const fallback = await fetch(`${feedUrl}?ts=${Date.now()}`, {
      cache: 'no-store'
    });
    if (!fallback.ok) {
      throw new Error('Unable to load scout feed.');
    }
    return await fallback.json();
  }

  async function refreshFeed(runNow = false) {
    if (refreshBtn) {
      refreshBtn.disabled = true;
      refreshBtn.textContent = runNow ? 'Running scout...' : 'Loading...';
    }

    try {
      let feed;

      if (runNow) {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Refresh endpoint unavailable.');
        }

        feed = await response.json();
      } else {
        feed = await getFeed();
      }

      renderFeed(feed);
    } catch (error) {
      renderLogs([
        '[AGENT] Scout refresh failed.',
        `[AGENT] ${error.message}`
      ]);

      if (statusEl) {
        statusEl.textContent = 'Scout status: error';
      }
    } finally {
      if (refreshBtn) {
        refreshBtn.disabled = false;
        refreshBtn.textContent = 'Run scout now';
      }
    }
  }

  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      refreshFeed(true);
    });
  }

  window.refreshSchemeScout = refreshFeed;
  refreshFeed(false);
  pollTimer = window.setInterval(() => refreshFeed(false), 60_000);

  window.addEventListener('beforeunload', () => {
    if (pollTimer) {
      window.clearInterval(pollTimer);
    }
  });
});
