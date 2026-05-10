// ─────────────────────────────────────────────────────────────────────────────
// Addon Initializers
// Each active addon in the build gets its DOM/behavior initialized here
// Reads config from /addon-configs/<slug>.json (served from www/)
// ─────────────────────────────────────────────────────────────────────────────

import type { EventBus } from './events';

type AddonConfig = Record<string, unknown>;

async function loadConfig(slug: string): Promise<AddonConfig> {
  try {
    const res = await fetch(`/addon-configs/${slug}.json`);
    if (!res.ok) return {};
    return await res.json() as AddonConfig;
  } catch {
    return {};
  }
}

function onDOMReady(fn: () => void): void {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn, { once: true });
  } else {
    fn();
  }
}

// ── WhatsApp Bridge ────────────────────────────────────────────────────────────

export async function initWhatsAppBridge(bus: EventBus): Promise<void> {
  const cfg = await loadConfig('whatsapp-bridge');
  if (!cfg['phoneNumber']) return;

  onDOMReady(() => {
    const phone = String(cfg['phoneNumber']).replace(/[^0-9]/g, '');
    const message = cfg['defaultMessage'] ? `?text=${encodeURIComponent(String(cfg['defaultMessage']))}` : '';
    const href = `https://wa.me/${phone}${message}`;
    const pos = String(cfg['buttonPosition'] ?? 'bottom-right');
    const color = String(cfg['buttonColor'] ?? '#25D366');
    const posStyle = pos === 'bottom-left' ? 'bottom:20px;left:20px' : 'bottom:20px;right:20px';

    const btn = document.createElement('a');
    btn.id = 'qa-whatsapp-btn';
    btn.href = href;
    btn.target = '_blank';
    btn.rel = 'noopener noreferrer';
    btn.setAttribute('aria-label', 'Chat on WhatsApp');
    btn.style.cssText = `position:fixed;${posStyle};z-index:9999;width:56px;height:56px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(0,0,0,0.25);text-decoration:none;transition:transform 0.2s,box-shadow 0.2s;`;
    btn.innerHTML = `<svg width="28" height="28" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a8 8 0 01-4.16-1.163l-.29-.175-3.012.79.803-2.934-.192-.305A8 8 0 1112 20z"/>
    </svg>`;

    btn.addEventListener('mouseenter', () => { btn.style.transform = 'scale(1.1)'; btn.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)'; });
    btn.addEventListener('mouseleave', () => { btn.style.transform = 'scale(1)'; btn.style.boxShadow = '0 4px 16px rgba(0,0,0,0.25)'; });

    document.body.appendChild(btn);
    bus.emit('ready', undefined);
  });
}

// ── Bottom Navigation ──────────────────────────────────────────────────────────

export async function initBottomNavigation(bus: EventBus): Promise<void> {
  const cfg = await loadConfig('bottom-navigation');
  const tabs = (cfg['tabs'] as Array<{ id: string; label: string; icon: string; url: string; badge?: number }>) ?? [];
  if (!tabs.length) return;

  onDOMReady(() => {
    const activeColor = String(cfg['activeColor'] ?? '#F97316');
    const inactiveColor = String(cfg['inactiveColor'] ?? '#9CA3AF');
    const bgColor = String(cfg['backgroundColor'] ?? '#FFFFFF');

    const nav = document.createElement('nav');
    nav.id = 'qa-bottom-nav';
    nav.setAttribute('role', 'navigation');
    nav.setAttribute('aria-label', 'Bottom navigation');
    nav.style.cssText = `position:fixed;bottom:0;left:0;right:0;z-index:1000;display:flex;height:56px;background:${bgColor};box-shadow:0 -1px 8px rgba(0,0,0,0.12);safe-area-inset-bottom:env(safe-area-inset-bottom);padding-bottom:env(safe-area-inset-bottom);`;

    const currentPath = window.location.pathname;

    tabs.forEach((tab) => {
      const isActive = tab.url && (currentPath === tab.url || currentPath.startsWith(tab.url + '/'));
      const btn = document.createElement('button');
      btn.id = `qa-tab-${tab.id}`;
      btn.setAttribute('aria-label', tab.label);
      btn.style.cssText = `flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;border:none;background:none;cursor:pointer;color:${isActive ? activeColor : inactiveColor};position:relative;`;

      const badgeHtml = tab.badge && tab.badge > 0
        ? `<span style="position:absolute;top:4px;right:calc(50% - 18px);min-width:16px;height:16px;background:#EF4444;color:#fff;border-radius:8px;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;padding:0 3px;">${tab.badge > 99 ? '99+' : tab.badge}</span>`
        : '';

      btn.innerHTML = `
        ${badgeHtml}
        <span style="font-size:22px;line-height:1;">${tab.icon}</span>
        <span style="font-size:10px;font-weight:500;">${tab.label}</span>
      `;

      btn.addEventListener('click', () => {
        bus.emit('bottomTabSelect', { id: tab.id });
        if (tab.url) window.location.href = tab.url;
        // Update active states
        nav.querySelectorAll('button').forEach(b => (b as HTMLElement).style.color = inactiveColor);
        btn.style.color = activeColor;
      });

      nav.appendChild(btn);
    });

    document.body.appendChild(nav);
    // Add padding to body so content doesn't hide behind nav
    document.body.style.paddingBottom = '56px';
  });
}

// ── Onboarding Screens ────────────────────────────────────────────────────────

export async function initOnboarding(bus: EventBus): Promise<void> {
  const cfg = await loadConfig('onboarding-screens');
  const screens = (cfg['screens'] as Array<{ title: string; subtitle?: string; imageUrl?: string; backgroundColor?: string; textColor?: string }>) ?? [];
  if (!screens.length) return;

  // Only show once
  const shown = localStorage.getItem('qa_onboarding_shown');
  if (shown) return;

  onDOMReady(() => {
    let currentIndex = 0;
    const skipText = String(cfg['skipButtonText'] ?? 'Skip');
    const doneText = String(cfg['doneButtonText'] ?? 'Get Started');

    const overlay = document.createElement('div');
    overlay.id = 'qa-onboarding';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;flex-direction:column;';

    const render = () => {
      const screen = screens[currentIndex]!;
      const bg = screen.backgroundColor ?? '#FFFFFF';
      const fg = screen.textColor ?? '#111827';
      const isLast = currentIndex === screens.length - 1;

      overlay.innerHTML = `
        <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 24px;background:${bg};gap:24px;">
          ${screen.imageUrl ? `<img src="${screen.imageUrl}" alt="${screen.title}" style="max-width:240px;max-height:240px;object-fit:contain;border-radius:12px;">` : ''}
          <h2 style="font-size:26px;font-weight:700;color:${fg};text-align:center;margin:0;">${screen.title}</h2>
          ${screen.subtitle ? `<p style="font-size:16px;color:${fg};opacity:0.7;text-align:center;margin:0;line-height:1.5;">${screen.subtitle}</p>` : ''}
          <div style="display:flex;gap:8px;margin-top:8px;">
            ${screens.map((_, i) => `<div style="width:${i === currentIndex ? 24 : 8}px;height:8px;border-radius:4px;background:${i === currentIndex ? '#F97316' : '#D1D5DB'};transition:width 0.3s;"></div>`).join('')}
          </div>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding:16px 24px;background:${bg};padding-bottom:max(16px, env(safe-area-inset-bottom));">
          <button id="qa-ob-skip" style="padding:10px 20px;background:transparent;border:none;font-size:15px;color:${fg};opacity:0.5;cursor:pointer;">${isLast ? '' : skipText}</button>
          <button id="qa-ob-next" style="padding:12px 28px;background:#F97316;color:#fff;border:none;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;">${isLast ? doneText : 'Next →'}</button>
        </div>
      `;

      overlay.querySelector('#qa-ob-next')?.addEventListener('click', () => {
        if (isLast) {
          localStorage.setItem('qa_onboarding_shown', '1');
          overlay.remove();
          bus.emit('onboardingComplete', undefined);
        } else {
          currentIndex++;
          render();
        }
      });

      overlay.querySelector('#qa-ob-skip')?.addEventListener('click', () => {
        if (!isLast) {
          localStorage.setItem('qa_onboarding_shown', '1');
          overlay.remove();
          bus.emit('onboardingSkip', undefined);
        }
      });
    };

    render();
    document.body.appendChild(overlay);
  });
}

// ── Offer / Promo Card ─────────────────────────────────────────────────────────

export async function initPromoCard(bus: EventBus): Promise<void> {
  const cfg = await loadConfig('offer-promo-card');
  if (!cfg['title']) return;

  const trigger = String(cfg['trigger'] ?? 'on_open');
  const delayMs = (Number(cfg['delaySeconds'] ?? 2)) * 1000;

  const show = () => {
    onDOMReady(() => {
      const card = document.createElement('div');
      card.id = 'qa-promo-card';
      card.style.cssText = 'position:fixed;inset:0;z-index:9998;display:flex;align-items:flex-end;justify-content:center;background:rgba(0,0,0,0.5);padding:16px;';
      card.innerHTML = `
        <div style="background:#fff;border-radius:20px 20px 16px 16px;width:100%;max-width:480px;overflow:hidden;box-shadow:0 -4px 32px rgba(0,0,0,0.2);">
          ${cfg['imageUrl'] ? `<img src="${cfg['imageUrl']}" alt="${cfg['title']}" style="width:100%;max-height:200px;object-fit:cover;">` : ''}
          <div style="padding:20px 20px 24px;">
            <button id="qa-promo-close" style="float:right;background:none;border:none;font-size:20px;cursor:pointer;color:#9CA3AF;margin:-4px -8px 0 0;">✕</button>
            <h3 style="font-size:20px;font-weight:700;color:#111827;margin:0 0 8px;">${cfg['title']}</h3>
            ${cfg['ctaText'] && cfg['ctaUrl'] ? `<a id="qa-promo-cta" href="${cfg['ctaUrl']}" style="display:inline-block;padding:12px 24px;background:#F97316;color:#fff;border-radius:10px;font-size:15px;font-weight:600;text-decoration:none;margin-top:8px;">${cfg['ctaText']}</a>` : ''}
          </div>
        </div>
      `;

      card.querySelector('#qa-promo-close')?.addEventListener('click', () => {
        card.remove();
        bus.emit('promoCardDismiss', undefined);
      });

      card.querySelector('#qa-promo-cta')?.addEventListener('click', () => {
        bus.emit('promoCardCta', { url: String(cfg['ctaUrl']) });
      });

      document.body.appendChild(card);
    });
  };

  if (trigger === 'on_open') {
    setTimeout(show, delayMs);
  } else if (trigger === 'on_exit') {
    document.addEventListener('mouseleave', (e) => {
      if (e.clientY <= 0) show();
    }, { once: true });
  }
}

// ── Passcode Lock ──────────────────────────────────────────────────────────────

export async function initPasscodeLock(bus: EventBus): Promise<void> {
  const cfg = await loadConfig('passcode-lock');
  const pinLength = Number(cfg['pinLength'] ?? 4);
  const inactivityTimeout = Number(cfg['inactivityTimeout'] ?? 5) * 60 * 1000;
  const storageKey = 'qa_passcode_hash';
  const lastActiveKey = 'qa_last_active';

  let lastActive = Date.now();
  let lockShown = false;

  const updateActivity = () => { lastActive = Date.now(); localStorage.setItem(lastActiveKey, String(lastActive)); };
  document.addEventListener('click', updateActivity, { passive: true });
  document.addEventListener('touchstart', updateActivity, { passive: true });
  document.addEventListener('keydown', updateActivity, { passive: true });

  const showLock = () => {
    if (lockShown) return;
    lockShown = true;

    const stored = localStorage.getItem(storageKey);
    const isSetup = !stored;

    const overlay = document.createElement('div');
    overlay.id = 'qa-passcode-lock';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:99998;background:#F9FAFB;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;';

    let entered = '';
    let setupPin = '';
    let step: 'enter' | 'setup' | 'confirm' = isSetup ? 'setup' : 'enter';

    const getMessage = () => {
      if (step === 'setup') return 'Set a PIN to protect your app';
      if (step === 'confirm') return 'Confirm your PIN';
      return 'Enter your PIN to continue';
    };

    const render = () => {
      overlay.innerHTML = `
        <div style="text-align:center;">
          <h2 style="font-size:20px;font-weight:700;color:#111827;margin:0 0 8px;">🔒 App Locked</h2>
          <p style="font-size:14px;color:#6B7280;margin:0;">${getMessage()}</p>
        </div>
        <div style="display:flex;gap:12px;">
          ${Array.from({ length: pinLength }, (_, i) => `<div style="width:16px;height:16px;border-radius:50%;background:${entered.length > i ? '#F97316' : '#E5E7EB'};transition:background 0.15s;"></div>`).join('')}
        </div>
        <div style="display:grid;grid-template-columns:repeat(3,80px);gap:12px;">
          ${[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map(k => `<button data-key="${k}" style="width:80px;height:80px;border-radius:50%;border:none;background:${k === '' ? 'transparent' : '#fff'};box-shadow:${k === '' ? 'none' : '0 2px 8px rgba(0,0,0,0.1)'};font-size:24px;font-weight:600;color:#111827;cursor:${k === '' ? 'default' : 'pointer'};">${k}</button>`).join('')}
        </div>
        ${cfg['biometricFallback'] ? `<button id="qa-biometric-btn" style="padding:10px 20px;background:transparent;border:1px solid #E5E7EB;border-radius:10px;font-size:14px;color:#6B7280;cursor:pointer;">Use Biometric</button>` : ''}
      `;

      overlay.querySelectorAll('[data-key]').forEach(btn => {
        const key = (btn as HTMLElement).dataset['key'];
        if (!key && key !== '0') return;
        btn.addEventListener('click', () => {
          if (key === '⌫') { entered = entered.slice(0, -1); }
          else if (key !== '' && entered.length < pinLength) { entered += key; }

          if (entered.length === pinLength) {
            setTimeout(() => {
              if (step === 'setup') {
                setupPin = entered;
                entered = '';
                step = 'confirm';
                render();
              } else if (step === 'confirm') {
                if (entered === setupPin) {
                  localStorage.setItem(storageKey, btoa(entered));
                  overlay.remove();
                  lockShown = false;
                } else {
                  entered = '';
                  render();
                  overlay.querySelector('p')!.textContent = '❌ PINs do not match. Try again.';
                }
              } else {
                if (btoa(entered) === stored) {
                  overlay.remove();
                  lockShown = false;
                  bus.emit('ready', undefined);
                } else {
                  entered = '';
                  render();
                  overlay.querySelector('p')!.textContent = '❌ Incorrect PIN. Try again.';
                }
              }
            }, 100);
          } else {
            render();
          }
        });
      });
    };

    render();
    document.body.appendChild(overlay);
  };

  // Show on load if PIN is set
  const stored = localStorage.getItem(storageKey);
  if (stored) {
    onDOMReady(showLock);
  } else {
    // First time — setup
    onDOMReady(showLock);
  }

  // Check inactivity
  setInterval(() => {
    if (Date.now() - lastActive > inactivityTimeout && !lockShown) {
      showLock();
    }
  }, 30000);
}

// ── Top Action Bar ─────────────────────────────────────────────────────────────

export async function initTopActionBar(bus: EventBus): Promise<void> {
  const cfg = await loadConfig('top-action-bar');

  onDOMReady(() => {
    const bar = document.createElement('div');
    bar.id = 'qa-top-bar';
    bar.style.cssText = `position:fixed;top:0;left:0;right:0;z-index:1000;height:44px;display:flex;align-items:center;justify-content:space-between;padding:0 12px;background:${cfg['backgroundColor'] ?? '#FFFFFF'};box-shadow:0 1px 4px rgba(0,0,0,0.08);padding-top:env(safe-area-inset-top);`;

    const showBack = cfg['showBackButton'] !== false && window.history.length > 1;
    const showShare = cfg['showShare'] !== false;

    bar.innerHTML = `
      ${showBack ? `<button id="qa-top-back" style="padding:8px;background:none;border:none;cursor:pointer;color:${cfg['textColor'] ?? '#111827'};">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>` : '<div style="width:40px;"></div>'}
      <div id="qa-top-title" style="font-size:16px;font-weight:600;color:${cfg['textColor'] ?? '#111827'};"></div>
      ${showShare ? `<button id="qa-top-share" style="padding:8px;background:none;border:none;cursor:pointer;color:${cfg['textColor'] ?? '#111827'};">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
      </button>` : '<div style="width:40px;"></div>'}
    `;

    bar.querySelector('#qa-top-back')?.addEventListener('click', () => {
      window.history.back();
      bus.emit('backButton', undefined);
    });

    bar.querySelector('#qa-top-share')?.addEventListener('click', () => {
      if (navigator.share) {
        navigator.share({ title: document.title, url: window.location.href }).catch(() => {});
      }
    });

    document.body.appendChild(bar);
    // Offset body
    document.body.style.paddingTop = `calc(44px + env(safe-area-inset-top))`;

    // Update title on navigation
    const updateTitle = () => {
      const el = bar.querySelector('#qa-top-title') as HTMLElement;
      if (el) el.textContent = document.title.split(' - ')[0] ?? document.title;
    };
    updateTitle();
    const observer = new MutationObserver(updateTitle);
    const titleEl = document.querySelector('title');
    if (titleEl) observer.observe(titleEl, { childList: true, characterData: true });
  });
}

// ── AI Chatbot ─────────────────────────────────────────────────────────────────

export async function initAiChatbot(bus: EventBus): Promise<void> {
  const cfg = await loadConfig('ai-chatbot');

  onDOMReady(() => {
    const pos = String(cfg['position'] ?? 'bottom-right');
    const posStyle = pos === 'bottom-left' ? 'bottom:80px;left:20px' : 'bottom:80px;right:20px';
    const iconUrl = cfg['iconUrl'] as string | undefined;

    // Floating button
    const fab = document.createElement('button');
    fab.id = 'qa-chatbot-btn';
    fab.setAttribute('aria-label', 'Open Chat');
    fab.style.cssText = `position:fixed;${posStyle};z-index:9997;width:52px;height:52px;border-radius:50%;background:#6366F1;border:none;cursor:pointer;box-shadow:0 4px 16px rgba(99,102,241,0.4);display:flex;align-items:center;justify-content:center;transition:transform 0.2s;`;
    fab.innerHTML = iconUrl
      ? `<img src="${iconUrl}" width="28" height="28" style="border-radius:50%;">`
      : `<svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>`;

    // Chat panel
    const panel = document.createElement('div');
    panel.id = 'qa-chatbot-panel';
    panel.style.cssText = `position:fixed;${pos.includes('left') ? 'left:16px' : 'right:16px'};bottom:148px;z-index:9996;width:320px;max-height:480px;background:#fff;border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,0.15);display:none;flex-direction:column;overflow:hidden;`;
    panel.innerHTML = `
      <div style="background:#6366F1;padding:14px 16px;display:flex;align-items:center;gap:10px;">
        <div style="width:8px;height:8px;background:#4ADE80;border-radius:50%;"></div>
        <span style="font-size:15px;font-weight:600;color:#fff;">AI Assistant</span>
        <button id="qa-chat-close" style="margin-left:auto;background:none;border:none;color:#fff;font-size:18px;cursor:pointer;">✕</button>
      </div>
      <div id="qa-chat-messages" style="flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px;max-height:320px;"></div>
      <div style="padding:8px;border-top:1px solid #F3F4F6;display:flex;gap:8px;">
        <input id="qa-chat-input" type="text" placeholder="Type a message..." style="flex:1;padding:8px 12px;border:1px solid #E5E7EB;border-radius:8px;font-size:14px;outline:none;">
        <button id="qa-chat-send" style="padding:8px 14px;background:#6366F1;color:#fff;border:none;border-radius:8px;font-size:14px;cursor:pointer;">Send</button>
      </div>
    `;

    let isOpen = false;

    const addMessage = (role: 'user' | 'assistant', text: string) => {
      const msgs = panel.querySelector('#qa-chat-messages')!;
      const el = document.createElement('div');
      el.style.cssText = `align-self:${role === 'user' ? 'flex-end' : 'flex-start'};max-width:80%;padding:8px 12px;border-radius:12px;font-size:13px;line-height:1.4;background:${role === 'user' ? '#6366F1' : '#F3F4F6'};color:${role === 'user' ? '#fff' : '#111827'};`;
      el.textContent = text;
      msgs.appendChild(el);
      msgs.scrollTop = msgs.scrollHeight;
    };

    const systemPrompt = String(cfg['systemPrompt'] ?? 'You are a helpful assistant for this app.');

    const sendMessage = async () => {
      const input = panel.querySelector('#qa-chat-input') as HTMLInputElement;
      const text = input.value.trim();
      if (!text) return;
      input.value = '';
      addMessage('user', text);

      // Simple echo-bot in dev; in production you'd call your AI endpoint
      addMessage('assistant', `I received: "${text}". (Configure AI endpoint in system prompt settings)`);
    };

    panel.querySelector('#qa-chat-send')?.addEventListener('click', sendMessage);
    panel.querySelector('#qa-chat-input')?.addEventListener('keydown', (e) => {
      if ((e as KeyboardEvent).key === 'Enter') sendMessage();
    });
    panel.querySelector('#qa-chat-close')?.addEventListener('click', () => {
      isOpen = false;
      panel.style.display = 'none';
    });

    fab.addEventListener('click', () => {
      isOpen = !isOpen;
      panel.style.display = isOpen ? 'flex' : 'none';
      fab.style.transform = isOpen ? 'scale(0.9)' : 'scale(1)';
    });

    document.body.appendChild(fab);
    document.body.appendChild(panel);

    // Initial greeting
    if (systemPrompt) {
      setTimeout(() => {
        if (!isOpen) {
          isOpen = true;
          panel.style.display = 'flex';
          addMessage('assistant', 'Hi! How can I help you today?');
        }
      }, 3000);
    }
  });
}

// ── Indian Language Overlay ────────────────────────────────────────────────────

export async function initIndianLanguageOverlay(bus: EventBus): Promise<void> {
  const cfg = await loadConfig('indian-language-overlay');
  const languages = (cfg['languages'] as string[]) ?? [];
  const defaultLang = String(cfg['defaultLanguage'] ?? 'en');

  if (!languages.length) return;

  const LANGUAGE_NAMES: Record<string, string> = {
    en: 'English', hi: 'हिन्दी', mr: 'मराठी', gu: 'ગુજરાતી',
    ta: 'தமிழ்', te: 'తెలుగు', kn: 'ಕನ್ನಡ', ml: 'മലയാളം',
    bn: 'বাংলা', pa: 'ਪੰਜਾਬੀ', or: 'ଓଡ଼ିଆ', as: 'অসমীয়া',
  };

  onDOMReady(() => {
    const currentLang = localStorage.getItem('qa_language') ?? defaultLang;

    const selector = document.createElement('div');
    selector.id = 'qa-lang-selector';
    selector.style.cssText = 'position:fixed;top:env(safe-area-inset-top,8px);right:16px;z-index:9995;';

    const btn = document.createElement('button');
    btn.style.cssText = 'padding:6px 12px;background:#fff;border:1px solid #E5E7EB;border-radius:8px;font-size:13px;font-weight:500;cursor:pointer;display:flex;align-items:center;gap:6px;box-shadow:0 2px 8px rgba(0,0,0,0.08);';
    btn.innerHTML = `🌐 ${LANGUAGE_NAMES[currentLang] ?? currentLang}`;

    const dropdown = document.createElement('div');
    dropdown.style.cssText = 'display:none;position:absolute;right:0;top:calc(100% + 4px);background:#fff;border-radius:10px;border:1px solid #E5E7EB;box-shadow:0 4px 16px rgba(0,0,0,0.12);overflow:hidden;min-width:140px;';

    const allLangs = [defaultLang, ...languages.filter(l => l !== defaultLang)];
    allLangs.forEach(lang => {
      const item = document.createElement('button');
      item.style.cssText = `width:100%;padding:10px 14px;background:${lang === currentLang ? '#FFF7ED' : 'transparent'};border:none;text-align:left;font-size:13px;cursor:pointer;color:${lang === currentLang ? '#F97316' : '#111827'};font-weight:${lang === currentLang ? '600' : '400'};`;
      item.textContent = LANGUAGE_NAMES[lang] ?? lang;
      item.addEventListener('click', () => {
        localStorage.setItem('qa_language', lang);
        document.documentElement.lang = lang;
        dropdown.style.display = 'none';
        btn.innerHTML = `🌐 ${LANGUAGE_NAMES[lang] ?? lang}`;
        bus.emit('ready', undefined);
        // Reload to apply language
        window.location.reload();
      });
      dropdown.appendChild(item);
    });

    btn.addEventListener('click', () => {
      dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    });
    document.addEventListener('click', (e) => {
      if (!selector.contains(e.target as Node)) dropdown.style.display = 'none';
    });

    // Apply current language
    document.documentElement.lang = currentLang;

    selector.appendChild(btn);
    selector.appendChild(dropdown);
    document.body.appendChild(selector);
  });
}

// ── Tawk.to Live Chat ──────────────────────────────────────────────────────────

export async function initTawkTo(): Promise<void> {
  const cfg = await loadConfig('tawkto');
  if (!cfg['propertyId'] || !cfg['widgetId']) return;

  onDOMReady(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).Tawk_API = (window as any).Tawk_API ?? {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).Tawk_LoadStart = new Date();

    const s = document.createElement('script');
    s.async = true;
    s.src = `https://embed.tawk.to/${cfg['propertyId']}/${cfg['widgetId']}`;
    s.charset = 'UTF-8';
    s.setAttribute('crossorigin', '*');
    document.head.appendChild(s);
  });
}

// ── No Internet Screen ─────────────────────────────────────────────────────────

export function initNoInternetScreen(noInternetCfg: {
  headingText?: string;
  bodyText?: string;
  retryButtonLabel?: string;
  retryButtonColor?: string;
}, bus: EventBus): void {
  const heading = noInternetCfg.headingText ?? 'No Internet Connection';
  const body = noInternetCfg.bodyText ?? 'Please check your connection and try again.';
  const retryLabel = noInternetCfg.retryButtonLabel ?? 'Try Again';
  const retryColor = noInternetCfg.retryButtonColor ?? '#F97316';

  let overlay: HTMLElement | null = null;

  const show = () => {
    if (overlay) return;
    overlay = document.createElement('div');
    overlay.id = 'qa-no-internet';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#F9FAFB;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:32px;text-align:center;';
    overlay.innerHTML = `
      <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="1.5"><line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0119 12.55M5 12.55a10.94 10.94 0 015.17-2.39M10.71 5.05A16 16 0 0122.56 9M1.42 9a15.91 15.91 0 014.7-2.88M8.53 16.11a6 6 0 016.95 0M12 20h.01"/></svg>
      <h2 style="font-size:22px;font-weight:700;color:#111827;margin:0;">${heading}</h2>
      <p style="font-size:15px;color:#6B7280;margin:0;line-height:1.5;">${body}</p>
      <button id="qa-retry-btn" style="margin-top:8px;padding:12px 28px;background:${retryColor};color:#fff;border:none;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;">${retryLabel}</button>
    `;

    overlay.querySelector('#qa-retry-btn')?.addEventListener('click', () => {
      if (navigator.onLine) {
        overlay?.remove();
        overlay = null;
      }
    });

    document.body.appendChild(overlay);
    bus.emit('networkChange', { connected: false, connectionType: 'none' });
  };

  const hide = () => {
    if (overlay) {
      overlay.remove();
      overlay = null;
      bus.emit('networkChange', { connected: true, connectionType: 'wifi' });
    }
  };

  window.addEventListener('offline', show);
  window.addEventListener('online', hide);
  if (!navigator.onLine) onDOMReady(show);
}
