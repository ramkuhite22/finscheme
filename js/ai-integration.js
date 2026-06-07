/**
 * FinScheme AI Integration
 * Handles interactive chat and AI-driven performance improvements
 * v2.0 — Wizard Bridge + Smart Reply Suggestions
 */

// ─── Wizard Bridge: keywords that trigger the scheme wizard ───────────────────
const WIZARD_TRIGGERS = [
  'am i eligible', 'am i qualify', 'check eligibility', 'eligibility check',
  'help me apply', 'how to apply', 'how do i apply', 'want to apply',
  'find scheme', 'find schemes', 'which scheme', 'what scheme',
  'show me schemes', 'get benefits', 'check benefits', 'am i qualified',
  'eligible for', 'apply for', 'start wizard', 'use wizard', 'open wizard',
  'yojana milega', 'scheme milega', 'kya milega', 'kaise apply kare'
];

// ─── Quick reply suggestions shown below the chat input ───────────────────────
const QUICK_REPLIES = [
  '🔍 Am I eligible for any scheme?',
  '📋 Help me apply',
  '💡 What are my rights as an employee?',
  '🏦 What insurance rights do I have?',
  '🚀 Startup India tax benefits',
];

// ─── Wizard Bridge Function ────────────────────────────────────────────────────
/**
 * Checks if the user message contains wizard trigger keywords.
 * If yes, scrolls to and highlights the #schemeWizard element.
 * Returns true if triggered, false otherwise.
 */
function checkAndTriggerWizard(message) {
  const lower = message.toLowerCase().trim();
  const triggered = WIZARD_TRIGGERS.some(kw => lower.includes(kw));

  if (!triggered) return false;

  const wizard = document.getElementById('schemeWizard');
  if (!wizard) return false;

  // Scroll to wizard
  wizard.scrollIntoView({ behavior: 'smooth', block: 'center' });

  // Highlight pulse effect
  wizard.style.transition = 'box-shadow 0.4s ease, outline 0.4s ease';
  wizard.style.boxShadow = '0 0 0 4px rgba(15, 118, 110, 0.5), 0 0 40px rgba(15, 118, 110, 0.25)';
  wizard.style.outline = '2px solid var(--primary)';
  wizard.style.borderRadius = '32px';

  // Remove highlight after 2.5s
  setTimeout(() => {
    wizard.style.boxShadow = '';
    wizard.style.outline = '';
  }, 2500);

  return true;
}

// ─── Main DOMContentLoaded ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const chatForm     = document.getElementById('chatForm');
  const chatInput    = document.getElementById('chatInput');
  const chatMessages = document.getElementById('chatMessages');
  const bubble       = document.getElementById('agenticBubble');

  let chatHistory = [];

  // ── Quick Reply Chips ─────────────────────────────────────────────────────────
  const quickRepliesEl = document.getElementById('chatQuickReplies');
  if (quickRepliesEl && chatInput) {
    QUICK_REPLIES.forEach(text => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.textContent = text;
      chip.style.cssText = `
        background: rgba(15,118,110,0.08);
        border: 1px solid rgba(15,118,110,0.25);
        color: var(--primary);
        border-radius: 999px;
        padding: 0.3rem 0.85rem;
        font-size: 0.78rem;
        font-weight: 600;
        cursor: pointer;
        white-space: nowrap;
        transition: background 0.2s;
        font-family: inherit;
      `;
      chip.addEventListener('mouseenter', () => {
        chip.style.background = 'rgba(15,118,110,0.18)';
      });
      chip.addEventListener('mouseleave', () => {
        chip.style.background = 'rgba(15,118,110,0.08)';
      });
      chip.addEventListener('click', () => {
        chatInput.value = text.replace(/^[^\w\s]+\s/, ''); // strip emoji prefix
        chatInput.focus();
        // Auto-submit
        chatForm && chatForm.requestSubmit();
      });
      quickRepliesEl.appendChild(chip);
    });
  }

  // ── Chat Form Submit ───────────────────────────────────────────────────────────
  if (chatForm && chatInput && chatMessages) {
    chatForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const userMessage = chatInput.value.trim();
      if (!userMessage) return;

      appendMessage('user', userMessage);
      chatInput.value = '';
      chatHistory.push({ role: 'user', content: userMessage });

      // ── Wizard Bridge check ────────────────────────────────────────────────
      const wizardTriggered = checkAndTriggerWizard(userMessage);

      if (wizardTriggered) {
        const bridgeMsg = appendMessage('ai',
          '✨ I\'ve opened the Eligibility Wizard for you! Answer 3 quick questions above to find schemes matched to your profile.'
        );
        bridgeMsg.style.background = 'rgba(15,118,110,0.1)';
        bridgeMsg.style.borderLeft = '3px solid var(--primary)';
        chatHistory.push({
          role: 'assistant',
          content: 'I opened the Eligibility Wizard to help you find matching schemes.'
        });
        return; // Don't call AI API — wizard is the answer
      }

      // ── Normal AI call ─────────────────────────────────────────────────────
      const aiMessageDiv = appendMessage('ai', '');
      aiMessageDiv.innerHTML = '<span class="typing-dots"><span>.</span><span>.</span><span>.</span></span>';

      let fullAiContent = '';

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: chatHistory })
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const reader  = response.body.getReader();
        const decoder = new TextDecoder();
        aiMessageDiv.innerHTML = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('0:')) {
              try {
                const text = JSON.parse(line.substring(2));
                fullAiContent += text;
                aiMessageDiv.textContent = fullAiContent;
                chatMessages.scrollTop = chatMessages.scrollHeight;
              } catch (_) { /* skip malformed */ }
            }
          }
        }

        chatHistory.push({ role: 'assistant', content: fullAiContent });

      } catch (err) {
        console.error('FinScheme Chat Error:', err);
        aiMessageDiv.innerHTML = '';
        aiMessageDiv.textContent = '⚠️ Unable to reach the AI assistant right now. Please try again.';
        aiMessageDiv.style.color = 'var(--danger)';
      }
    });
  }

  // ── appendMessage helper ───────────────────────────────────────────────────────
  function appendMessage(role, content) {
    if (!chatMessages) return document.createElement('div');
    const msgDiv = document.createElement('div');
    msgDiv.style.cssText = `
      padding: 0.6rem 0.875rem;
      border-radius: 12px;
      max-width: 92%;
      font-size: 0.875rem;
      line-height: 1.5;
      transition: all 0.2s;
    `;
    if (role === 'user') {
      msgDiv.style.background    = 'var(--primary)';
      msgDiv.style.color         = 'white';
      msgDiv.style.alignSelf     = 'flex-end';
      msgDiv.style.borderRadius  = '12px 12px 2px 12px';
    } else {
      msgDiv.style.background    = 'rgba(15, 118, 110, 0.08)';
      msgDiv.style.color         = 'var(--dark)';
      msgDiv.style.alignSelf     = 'flex-start';
      msgDiv.style.borderRadius  = '12px 12px 12px 2px';
    }
    msgDiv.textContent = content;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return msgDiv;
  }

  // ── Auto-show bubble on main search focus ──────────────────────────────────────
  const mainSearch = document.getElementById('mainSearch');
  if (mainSearch && bubble) {
    mainSearch.addEventListener('focus', () => bubble.classList.add('visible'));
  }
});
