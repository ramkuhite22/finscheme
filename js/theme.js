(function initFinSchemeTheme() {
  const root = document.documentElement;
  const storageKey = "finscheme_theme";
  const stored = localStorage.getItem(storageKey);
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const initial = stored || (prefersDark ? "dark" : "light");
  root.setAttribute("data-theme", initial);

  const nav = document.querySelector(".nav");
  const actionWrap = nav
    ? nav.querySelector(".lang")?.closest(".nav-links") ||
      nav.querySelector(".btn")?.closest(".nav-links") ||
      nav.querySelector(".nav-actions") ||
      nav.querySelector(".nav-links:last-of-type")
    : null;

  if (actionWrap) {
    actionWrap.classList.add("nav-actions");
  }

  let toggle = nav ? nav.querySelector(".theme-toggle") : null;
  if (!toggle && actionWrap) {
    toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "theme-toggle";
    toggle.setAttribute("aria-label", "Toggle theme");
    toggle.setAttribute("aria-pressed", initial === "dark");
    toggle.innerHTML =
      '<svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<circle cx="12" cy="12" r="4"></circle>' +
      '<path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"></path>' +
      "</svg>" +
      '<svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M21 14.5A8.5 8.5 0 1 1 9.5 3a7 7 0 1 0 11.5 11.5z"></path>' +
      "</svg>" +
      '<span class="sr-only">Toggle theme</span>';

    const insertBefore = actionWrap.querySelector(".btn");
    if (insertBefore) {
      actionWrap.insertBefore(toggle, insertBefore);
    } else {
      actionWrap.appendChild(toggle);
    }
  }

  if (toggle && !toggle.dataset.bound) {
    toggle.dataset.bound = "true";
    toggle.setAttribute("aria-pressed", initial === "dark");
    toggle.addEventListener("click", function () {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      localStorage.setItem(storageKey, next);
      toggle.setAttribute("aria-pressed", next === "dark");
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        root.classList.add("theme-animate");
        window.setTimeout(function () {
          root.classList.remove("theme-animate");
        }, 400);
      }
    });
  }

  // --- Premium UI Interactions ---

  // 1. Spotlight Effect
  function initSpotlight() {
    const cards = document.querySelectorAll('.glass3d, .card-hover, .segment-card, .btn-primary');
    
    cards.forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    });
  }

  // 2. Scroll Reveal Animation
  function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-active');
          // Optional: stop observing once revealed
          // observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in, section, .card, .step-item').forEach(el => {
      observer.observe(el);
    });
  }

  // 3. Word Pull / Staggered Text (Hero)
  function initHeroAnimations() {
    const heroTitle = document.querySelector('.hero-content h1');
    if (heroTitle && !heroTitle.dataset.animated) {
      const text = heroTitle.innerText;
      const html = text.split(' ').map((word, i) => 
        `<span style="display:inline-block; animation: fadeUp 0.5s ease forwards ${0.1 + i * 0.1}s; opacity:0; transform:translateY(20px);">${word}&nbsp;</span>`
      ).join('');
      // heroTitle.innerHTML = html; // Re-enable if we want word-by-word reveal
      heroTitle.dataset.animated = "true";
    }
  }

  // 4. Accordion FAQ Toggle
  function initAccordion() {
    const items = document.querySelectorAll('.accordion-item');
    items.forEach(item => {
      const header = item.querySelector('.accordion-header');
      header.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        
        // Close all items
        items.forEach(i => i.classList.remove('active'));
        
        // Toggle current
        if (!isActive) {
          item.classList.add('active');
        }
      });
    });
  }

  // 5. Scroll Progress Bar
  function initScrollProgress() {
    const scrollBar = document.getElementById('scrollBar');
    if (scrollBar) {
      window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        scrollBar.style.width = scrolled + "%";
      });
    }
  }

  // 6. Magnetic Effect (21st.dev Inspiration)
  function initMagneticEffect() {
    const targets = document.querySelectorAll('.magnetic-target');
    targets.forEach(target => {
      target.addEventListener('mousemove', (e) => {
        const { clientX, clientY } = e;
        const { left, top, width, height } = target.getBoundingClientRect();
        const x = clientX - (left + width / 2);
        const y = clientY - (top + height / 2);
        
        target.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
      });
      
      target.addEventListener('mouseleave', () => {
        target.style.transform = 'translate(0, 0)';
      });
    });
  }

  // 8. Conversational Wizard Logic (Typeform/Fillout)
  function initWizard() {
    const wizard = document.getElementById('schemeWizard');
    if (!wizard) return;

    const steps = wizard.querySelectorAll('.form-step');
    const dots = wizard.querySelectorAll('.step-dot');
    let currentStep = 1;

    function validateStep(stepNum) {
      const step = wizard.querySelector(`.form-step[data-step="${stepNum}"]`);
      if (stepNum === 1 || stepNum === 2) {
        return step.querySelector('.choice-card.selected') !== null;
      }
      if (stepNum === 3) {
        return document.getElementById('wizardState').value !== "";
      }
      return true;
    }

    function updateWizard() {
      steps.forEach((s, i) => {
        s.classList.toggle('active', i + 1 === currentStep);
      });
      dots.forEach((d, i) => {
        d.classList.toggle('active', i + 1 === currentStep);
      });

      // Update progress bar at the top too
      const progress = (currentStep / steps.length) * 100;
      const progressBar = document.getElementById('searchProgress');
      const progressText = document.getElementById('progressText');
      if (progressBar) progressBar.style.width = progress + '%';
      if (progressText) progressText.innerText = Math.round(progress) + '%';
    }

    wizard.querySelectorAll('.next-step').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!validateStep(currentStep)) {
          alert("Please select an option to continue.");
          return;
        }
        if (currentStep < steps.length) {
          currentStep++;
          updateWizard();
        }
      });
    });

    wizard.querySelectorAll('.prev-step').forEach(btn => {
      btn.addEventListener('click', () => {
        if (currentStep > 1) {
          currentStep--;
          updateWizard();
        }
      });
    });

    wizard.querySelectorAll('.choice-card').forEach(card => {
      card.addEventListener('click', () => {
        // Clear siblings
        card.parentElement.querySelectorAll('.choice-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        
        // Auto-advance if not the last step
        if (currentStep < steps.length) {
          setTimeout(() => {
            currentStep++;
            updateWizard();
          }, 400);
        }
      });
    });

    const finalizeBtn = document.getElementById('finalizeWizard');
    if (finalizeBtn) {
      finalizeBtn.addEventListener('click', () => {
        if (!validateStep(3)) {
          alert("Please select your state to continue.");
          return;
        }
        const income = wizard.querySelector('.form-step[data-step="1"] .choice-card.selected')?.dataset.value || '';
        const category = wizard.querySelector('.form-step[data-step="2"] .choice-card.selected')?.dataset.value || '';
        const state = document.getElementById('wizardState').value;
        
        console.log('Wizard Results:', { income, category, state });
        window.location.href = `pages/find.html?income=${income}&cat=${category}&state=${state}`;
      });
    }
  }

  // Initialize all interactions
  document.addEventListener('DOMContentLoaded', () => {
    initScrollProgress();

    const hasStandaloneInteractions = Boolean(
      document.querySelector('script[src$="interactions.js"]')
    );

    if (hasStandaloneInteractions) {
      return;
    }

    initSpotlight();
    initScrollReveal();
    initHeroAnimations();
    initAccordion();
    initMagneticEffect();
    initWizard();
  });

  // Re-run interactions on dynamic content changes if needed
  window.refreshInteractions = () => {
    initSpotlight();
    initScrollReveal();
    initAccordion();
    initScrollProgress();
  };

})();
