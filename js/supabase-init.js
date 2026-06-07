// FinScheme Supabase Integration & Auth Bridge
// Integrates Supabase client, manages authentication, and mocks Clerk interface for compatibility.

(function initSupabase() {
  const supabaseUrl = "https://ncatgawvnuimaewtoidy.supabase.co";
  const supabaseKey = "sb_publishable_9q0XAFSbBMm3x7cGoh9oUQ_ePn1lNgb";

  // Injects styles for the premium user avatar dropdown
  function injectDropdownStyles() {
    if (document.getElementById('supabase-dropdown-styles')) return;
    const style = document.createElement('style');
    style.id = 'supabase-dropdown-styles';
    style.textContent = `
      .sb-user-btn-container {
        position: relative;
        display: inline-block;
      }
      .sb-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--primary, #10b981), #059669);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 0.95rem;
        cursor: pointer;
        border: 2px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
        transition: transform 0.2s, box-shadow 0.2s;
      }
      .sb-avatar:hover {
        transform: scale(1.05);
        box-shadow: 0 6px 16px rgba(16, 185, 129, 0.35);
      }
      .sb-dropdown {
        position: absolute;
        right: 0;
        top: calc(100% + 12px);
        width: 240px;
        background: rgba(255, 255, 255, 0.85);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 16px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        padding: 1rem;
        display: none;
        flex-direction: column;
        gap: 0.75rem;
        z-index: 1000;
        animation: sb-fade-in 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        transform-origin: top right;
      }
      [data-theme="dark"] .sb-dropdown {
        background: rgba(15, 23, 42, 0.85);
        border-color: rgba(255, 255, 255, 0.08);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
      }
      .sb-dropdown.active {
        display: flex;
      }
      .sb-dropdown-header {
        border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        padding-bottom: 0.75rem;
        margin-bottom: 0.25rem;
      }
      [data-theme="dark"] .sb-dropdown-header {
        border-color: rgba(255, 255, 255, 0.06);
      }
      .sb-dropdown-name {
        font-weight: 700;
        color: var(--dark, #0f172a);
        font-size: 0.95rem;
        word-break: break-all;
      }
      [data-theme="dark"] .sb-dropdown-name {
        color: #f8fafc;
      }
      .sb-dropdown-email {
        font-size: 0.78rem;
        color: var(--text-muted, #64748b);
        word-break: break-all;
      }
      .sb-dropdown-link {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 0.5rem 0.75rem;
        font-size: 0.85rem;
        color: var(--dark, #0f172a);
        text-decoration: none;
        border-radius: 8px;
        transition: background 0.15s, color 0.15s;
        cursor: pointer;
      }
      [data-theme="dark"] .sb-dropdown-link {
        color: #e2e8f0;
      }
      .sb-dropdown-link:hover {
        background: rgba(16, 185, 129, 0.08);
        color: var(--primary, #10b981);
      }
      .sb-dropdown-logout {
        border-top: 1px solid rgba(0, 0, 0, 0.06);
        padding-top: 0.5rem;
        margin-top: 0.25rem;
      }
      [data-theme="dark"] .sb-dropdown-logout {
        border-color: rgba(255, 255, 255, 0.06);
      }
      @keyframes sb-fade-in {
        from { opacity: 0; transform: scale(0.95) translateY(-5px); }
        to { opacity: 1; transform: scale(1) translateY(0); }
      }
    `;
    document.head.appendChild(style);
  }

  const authContainer = document.querySelector('.nav-actions');
  if (authContainer) authContainer.classList.add('auth-loading');

  async function bootSupabase() {
    if (!window.supabase) {
      setTimeout(bootSupabase, 100);
      return;
    }

    try {
      injectDropdownStyles();
      const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
      window.supabaseClient = supabase;

      // Fetch active session / user
      const { data: { session } } = await supabase.auth.getSession();
      let user = session ? session.user : null;
      window.supabaseUser = user;

      // Mock Clerk interface for pages/scripts that read window.Clerk
      window.Clerk = {
        get user() {
          if (!window.supabaseUser) return null;
          const u = window.supabaseUser;
          const fallbackName = u.email ? u.email.split('@')[0] : 'Citizen';
          return {
            id: u.id,
            fullName: u.user_metadata?.fullName || u.user_metadata?.full_name || fallbackName,
            primaryEmailAddress: { emailAddress: u.email }
          };
        },
        signOut: async () => {
          await supabase.auth.signOut();
          window.location.reload();
        }
      };

      // Dispatches clerk-ready and supabase-ready events for scripts
      const dispatchReadyEvents = () => {
        const detail = { user: window.Clerk.user };
        window.dispatchEvent(new CustomEvent('clerk-ready', { detail }));
        window.dispatchEvent(new CustomEvent('supabase-ready', { detail }));
      };

      dispatchReadyEvents();

      // Listen for auth updates
      supabase.auth.onAuthStateChange((event, newSession) => {
        window.supabaseUser = newSession ? newSession.user : null;
        dispatchReadyEvents();
        updateUI();
      });

      function updateUI() {
        const userButtonDiv = document.getElementById('user-button');
        const loginBtn = document.getElementById('login-btn');
        const signupBtn = document.getElementById('signup-btn');
        const welcomeChip = document.getElementById('welcome-msg');
        const userNameSpan = document.getElementById('user-name');

        if (window.supabaseUser) {
          const u = window.supabaseUser;
          const fallbackName = u.email ? u.email.split('@')[0] : 'Citizen';
          const fullName = u.user_metadata?.fullName || u.user_metadata?.full_name || fallbackName;

          if (loginBtn) loginBtn.style.display = 'none';
          if (signupBtn) signupBtn.style.display = 'none';

          if (welcomeChip && userNameSpan) {
            userNameSpan.textContent = fullName;
            welcomeChip.style.display = 'inline-flex';
          }

          if (userButtonDiv) {
            userButtonDiv.style.display = 'block';
            
            // Build custom premium profile dropdown
            const initials = fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?';
            const isSubPage = window.location.pathname.includes('/pages/');
            const profileUrl = isSubPage ? 'about.html' : 'pages/about.html';
            const savedUrl = isSubPage ? '../index.html#schemeWizard' : '#schemeWizard';

            userButtonDiv.innerHTML = `
              <div class="sb-user-btn-container">
                <div class="sb-avatar" id="sb-avatar-trigger">${initials}</div>
                <div class="sb-dropdown" id="sb-profile-dropdown">
                  <div class="sb-dropdown-header">
                    <div class="sb-dropdown-name">${fullName}</div>
                    <div class="sb-dropdown-email">${u.email}</div>
                  </div>
                  <a href="${savedUrl}" class="sb-dropdown-link">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
                    Saved Schemes
                  </a>
                  <a href="${profileUrl}" class="sb-dropdown-link">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    My Profile
                  </a>
                  <div class="sb-dropdown-logout">
                    <a class="sb-dropdown-link" id="sb-logout-btn" style="color: var(--danger, #ef4444);">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                      Sign Out
                    </a>
                  </div>
                </div>
              </div>
            `;

            // Click interactions for avatar and dropdown
            const trigger = document.getElementById('sb-avatar-trigger');
            const dropdown = document.getElementById('sb-profile-dropdown');
            const logout = document.getElementById('sb-logout-btn');

            if (trigger && dropdown) {
              trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('active');
              });

              document.addEventListener('click', (e) => {
                if (!trigger.contains(e.target) && !dropdown.contains(e.target)) {
                  dropdown.classList.remove('active');
                }
              });
            }

            if (logout) {
              logout.addEventListener('click', async (e) => {
                e.preventDefault();
                await supabase.auth.signOut();
                window.location.reload();
              });
            }
          }
        } else {
          // Logged out
          if (welcomeChip) welcomeChip.style.display = 'none';
          if (userButtonDiv) userButtonDiv.style.display = 'none';
          if (loginBtn) {
            loginBtn.style.display = 'inline-flex';
            loginBtn.onclick = () => {
              const isSubPage = window.location.pathname.includes('/pages/');
              window.location.href = isSubPage ? 'login.html' : 'pages/login.html';
            };
          }
          if (signupBtn) {
            signupBtn.style.display = 'inline-flex';
            signupBtn.onclick = () => {
              const isSubPage = window.location.pathname.includes('/pages/');
              window.location.href = isSubPage ? 'signup.html' : 'pages/signup.html';
            };
          }
        }
      }

      updateUI();
    } catch (err) {
      console.error("Supabase failed to load", err);
    } finally {
      if (authContainer) authContainer.classList.remove('auth-loading');
    }
  }

  // Set up loading
  if (!window.supabase) {
    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
    script.onload = bootSupabase;
    document.head.appendChild(script);
  } else {
    bootSupabase();
  }
})();
