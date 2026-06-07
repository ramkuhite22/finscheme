(function initClerk() {
  const authContainer = document.querySelector('.nav-actions');
  if (authContainer) authContainer.classList.add('auth-loading');

  const isSubPage = window.location.pathname.includes('/pages/');
  const loginUrl = isSubPage ? 'login.html' : 'pages/login.html';
  const signupUrl = isSubPage ? 'signup.html' : 'pages/signup.html';

  async function bootClerk() {
    if (!window.Clerk) {
      // If Clerk isn't ready yet, wait a bit
      setTimeout(bootClerk, 100);
      return;
    }

    try {
      await window.Clerk.load({
        appearance: {
          variables: { colorPrimary: '#10b981' },
          elements: {
            userButtonTrigger: 'magnetic-target',
            userButtonPopoverCard: 'glass spotlight-card clay',
          }
        }
      });
      
      const userButtonDiv = document.getElementById('user-button');
      const loginBtn = document.getElementById('login-btn');
      const signupBtn = document.getElementById('signup-btn');

      window.dispatchEvent(new CustomEvent('clerk-ready', { detail: { user: window.Clerk.user } }));

      if (window.Clerk.user) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (signupBtn) signupBtn.style.display = 'none';
        if (userButtonDiv) {
          userButtonDiv.style.display = 'block';
          window.Clerk.mountUserButton(userButtonDiv, {
            afterSignOutUrl: window.location.href
          });
        }
      } else {
        if (userButtonDiv) userButtonDiv.style.display = 'none';
        if (loginBtn) {
          loginBtn.style.display = 'inline-flex';
          loginBtn.addEventListener('click', () => {
            window.location.href = loginUrl;
          });
        }
      }
    } catch (err) {
      console.error("Clerk failed to load", err);
    } finally {
      if (authContainer) authContainer.classList.remove('auth-loading');
    }
  }

  if (document.readyState === 'loading') {
    window.addEventListener('load', bootClerk);
  } else {
    bootClerk();
  }
})();
