(function initEconomicsSurvey() {
  const form = document.getElementById('economicsSurveyForm');
  if (!form) return;

  const statusEl = document.getElementById('surveyStatus');
  const successEl = document.getElementById('surveySuccess');
  const submitBtn = form.querySelector('button[type="submit"]');
  const surveyName = form.dataset.surveyName || 'economics-survey';
  let hasStarted = false;

  function createSessionId() {
    if (window.crypto?.randomUUID) {
      return window.crypto.randomUUID();
    }
    return `survey-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  let sessionId = createSessionId();

  function setStatus(message, type = 'idle') {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.dataset.state = type;
  }

  function setSubmitting(isSubmitting) {
    if (!submitBtn) return;
    submitBtn.disabled = isSubmitting;
    submitBtn.textContent = isSubmitting ? 'Submitting...' : 'Submit survey';
  }

  function updateHiddenField(name, value) {
    const field = form.querySelector(`input[name="${name}"]`);
    if (field) {
      field.value = value;
    }
  }

  function fillTrackingFields() {
    const params = new URLSearchParams(window.location.search);
    updateHiddenField('pageUrl', window.location.href);
    updateHiddenField('referrer', document.referrer || '');
    updateHiddenField('sessionId', sessionId);
    updateHiddenField('utmSource', params.get('utm_source') || '');
    updateHiddenField('utmMedium', params.get('utm_medium') || '');
    updateHiddenField('utmCampaign', params.get('utm_campaign') || '');
    updateHiddenField('utmContent', params.get('utm_content') || '');
    updateHiddenField('utmTerm', params.get('utm_term') || '');
  }

  function maybeTrackStart() {
    if (hasStarted) return;
    hasStarted = true;
    window.FinSchemeAnalytics?.track?.('survey_started', {
      survey_name: surveyName
    });
  }

  async function submitSurvey(event) {
    event.preventDefault();
    maybeTrackStart();
    setSubmitting(true);
    setStatus('Submitting your response...', 'loading');

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    payload.surveyName = surveyName;
    payload.locale = navigator.language || '';
    payload.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    payload.userAgent = navigator.userAgent || '';
    payload.screenSize = `${window.screen?.width || 0}x${window.screen?.height || 0}`;

    try {
      const response = await fetch('/api/survey-submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || 'Survey submission failed.');
      }

      form.reset();
      sessionId = createSessionId();
      fillTrackingFields();
      if (successEl) {
        successEl.hidden = false;
      }
      setStatus('Thanks. Your response has been recorded.', 'success');
      window.FinSchemeAnalytics?.track?.('survey_submitted', {
        survey_name: surveyName,
        storage_mode: result.storage || 'unknown'
      });
    } catch (error) {
      console.error(error);
      if (successEl) {
        successEl.hidden = true;
      }
      setStatus(error.message || 'We could not submit your response. Please try again.', 'error');
      window.FinSchemeAnalytics?.track?.('survey_submit_error', {
        survey_name: surveyName
      });
    } finally {
      setSubmitting(false);
    }
  }

  form.addEventListener('input', maybeTrackStart);
  form.addEventListener('change', maybeTrackStart);
  form.addEventListener('submit', submitSurvey);

  document.addEventListener('DOMContentLoaded', () => {
    fillTrackingFields();
    window.FinSchemeAnalytics?.track?.('survey_viewed', {
      survey_name: surveyName
    });
  });

  fillTrackingFields();
})();
