/**
 * Empanadas CRM — Universal Chat Widget Embed Script v2
 * 
 * Usage:
 *   <script src="https://crm-empanadalab.vercel.app/widget/embed.js"
 *           data-source="empanadas-paisanas"
 *           data-color="#FFC107"></script>
 *
 * Attributes:
 *   data-source  — brand identifier sent to the CRM (required)
 *   data-color   — primary hex color for the bubble (default: #ea580c)
 *   data-position — "left" | "right" (default: "right")
 *   data-lang    — "es" | "en" (default: "es")
 */
(function () {
    // Prevent double-init
    if (window.__ecWidgetLoaded) return;
    window.__ecWidgetLoaded = true;

    // --- Read config from <script> tag ---
    var script = document.currentScript;
    var source = script.getAttribute('data-source') || 'default';
    var color = script.getAttribute('data-color') || '#ea580c';
    var position = script.getAttribute('data-position') || 'right';
    var lang = script.getAttribute('data-lang') || 'es';

    var BASE = 'https://crm-empanadalab.vercel.app';
    var iframeSrc = BASE + '/widget/chat?source=' + encodeURIComponent(source) +
        '&primary=' + encodeURIComponent(color.replace('#', '')) +
        '&lang=' + encodeURIComponent(lang);

    // --- Inject CSS ---
    var posRight = position === 'right';
    var posCSS = posRight ? 'right' : 'left';

    var css = '\n' +
        /* ===== BUBBLE ===== */
        '#ec-widget-bubble {\n' +
        '  position: fixed;\n' +
        '  bottom: 24px;\n' +
        '  ' + posCSS + ': 24px;\n' +
        '  width: 60px;\n' +
        '  height: 60px;\n' +
        '  background-color: ' + color + ';\n' +
        '  border-radius: 50%;\n' +
        '  box-shadow: 0 4px 20px rgba(0,0,0,0.25);\n' +
        '  z-index: 99999;\n' +
        '  cursor: pointer;\n' +
        '  display: flex;\n' +
        '  align-items: center;\n' +
        '  justify-content: center;\n' +
        '  border: none;\n' +
        '  padding: 0;\n' +
        '  transition: transform 0.3s cubic-bezier(0.175,0.885,0.32,1.275), opacity 0.3s ease;\n' +
        '}\n' +
        '#ec-widget-bubble:hover { transform: scale(1.1); }\n' +
        '#ec-widget-bubble svg { width: 28px; height: 28px; fill: none; stroke: white; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }\n' +
        '\n' +
        /* ===== BACKDROP (mobile only) ===== */
        '#ec-widget-backdrop {\n' +
        '  position: fixed;\n' +
        '  inset: 0;\n' +
        '  background: rgba(0,0,0,0.5);\n' +
        '  z-index: 99997;\n' +
        '  display: none;\n' +
        '  opacity: 0;\n' +
        '  transition: opacity 0.3s ease;\n' +
        '  -webkit-backdrop-filter: blur(2px);\n' +
        '  backdrop-filter: blur(2px);\n' +
        '}\n' +
        '#ec-widget-backdrop.ec-active {\n' +
        '  display: block;\n' +
        '  opacity: 1;\n' +
        '}\n' +
        '\n' +
        /* ===== CONTAINER ===== */
        '#ec-widget-container {\n' +
        '  position: fixed;\n' +
        '  bottom: 100px;\n' +
        '  ' + posCSS + ': 24px;\n' +
        '  width: 380px;\n' +
        '  height: 600px;\n' +
        '  max-height: calc(100dvh - 140px);\n' +
        '  background: white;\n' +
        '  border-radius: 24px;\n' +
        '  box-shadow: 0 12px 48px rgba(0,0,0,0.15);\n' +
        '  z-index: 99998;\n' +
        '  overflow: hidden;\n' +
        '  display: none;\n' +
        '  flex-direction: column;\n' +
        '  border: 1px solid rgba(0,0,0,0.08);\n' +
        '  transition: transform 0.35s cubic-bezier(0.32,0.72,0,1), opacity 0.3s ease;\n' +
        '  transform: translateY(20px) scale(0.95);\n' +
        '  opacity: 0;\n' +
        '}\n' +
        '#ec-widget-container.ec-active {\n' +
        '  display: flex;\n' +
        '  transform: translateY(0) scale(1);\n' +
        '  opacity: 1;\n' +
        '}\n' +
        '\n' +
        /* ===== CLOSE BUTTON (inside container) ===== */
        '#ec-widget-close {\n' +
        '  position: absolute;\n' +
        '  top: 10px;\n' +
        '  right: 10px;\n' +
        '  width: 32px;\n' +
        '  height: 32px;\n' +
        '  background: rgba(255,255,255,0.25);\n' +
        '  border: none;\n' +
        '  border-radius: 50%;\n' +
        '  cursor: pointer;\n' +
        '  display: flex;\n' +
        '  align-items: center;\n' +
        '  justify-content: center;\n' +
        '  z-index: 10;\n' +
        '  transition: background 0.2s ease, transform 0.2s ease;\n' +
        '  padding: 0;\n' +
        '}\n' +
        '#ec-widget-close:hover { background: rgba(255,255,255,0.4); transform: scale(1.1); }\n' +
        '#ec-widget-close svg { width: 18px; height: 18px; fill: none; stroke: white; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }\n' +
        '\n' +
        /* ===== IFRAME ===== */
        '#ec-widget-container iframe {\n' +
        '  width: 100%; height: 100%; border: none; flex: 1;\n' +
        '}\n' +
        '\n' +
        /* ===== MOBILE OVERRIDES ===== */
        '@media (max-width: 640px) {\n' +
        '  #ec-widget-container {\n' +
        '    width: 100%;\n' +
        '    height: 100dvh;\n' +
        '    max-height: 100dvh;\n' +
        '    bottom: 0;\n' +
        '    left: 0;\n' +
        '    right: 0;\n' +
        '    border-radius: 0;\n' +
        '    box-shadow: none;\n' +
        '    border: none;\n' +
        '    transform: translateY(100%);\n' +
        '    opacity: 1;\n' +
        '  }\n' +
        '  #ec-widget-container.ec-active {\n' +
        '    transform: translateY(0);\n' +
        '  }\n' +
        '  #ec-widget-bubble {\n' +
        '    bottom: calc(20px + env(safe-area-inset-bottom, 0px));\n' +
        '    ' + posCSS + ': 20px;\n' +
        '    width: 56px;\n' +
        '    height: 56px;\n' +
        '  }\n' +
        '  /* Hide bubble when chat is open */\n' +
        '  #ec-widget-bubble.ec-hidden {\n' +
        '    opacity: 0;\n' +
        '    pointer-events: none;\n' +
        '    transform: scale(0.5);\n' +
        '  }\n' +
        '  #ec-widget-close {\n' +
        '    top: calc(12px + env(safe-area-inset-top, 0px));\n' +
        '    right: 12px;\n' +
        '    width: 36px;\n' +
        '    height: 36px;\n' +
        '  }\n' +
        '  #ec-widget-close svg { width: 20px; height: 20px; }\n' +
        '}\n';

    var style = document.createElement('style');
    style.id = 'ec-widget-styles';
    style.textContent = css;
    document.head.appendChild(style);

    // --- SVG Icons (inline, no external dependency) ---
    var ICON_CHAT = '<svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
    var ICON_CLOSE = '<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';

    // --- Detect mobile ---
    function isMobile() {
        return window.innerWidth <= 640;
    }

    // --- Create Elements ---
    // Backdrop (for mobile)
    var backdrop = document.createElement('div');
    backdrop.id = 'ec-widget-backdrop';

    // Container
    var container = document.createElement('div');
    container.id = 'ec-widget-container';

    // Close button (inside container)
    var closeBtn = document.createElement('button');
    closeBtn.id = 'ec-widget-close';
    closeBtn.innerHTML = ICON_CLOSE;
    closeBtn.setAttribute('aria-label', lang === 'es' ? 'Cerrar chat' : 'Close chat');
    container.appendChild(closeBtn);

    // Iframe
    var iframe = document.createElement('iframe');
    iframe.src = iframeSrc;
    iframe.title = 'Chat Widget';
    iframe.allow = 'clipboard-write';
    container.appendChild(iframe);

    // Bubble
    var bubble = document.createElement('button');
    bubble.id = 'ec-widget-bubble';
    bubble.setAttribute('aria-label', lang === 'es' ? 'Abrir chat' : 'Open chat');
    bubble.innerHTML = ICON_CHAT;

    // --- Toggle Logic ---
    var isOpen = false;

    function openWidget() {
        if (isOpen) return;
        isOpen = true;

        container.style.display = 'flex';
        if (isMobile()) {
            backdrop.style.display = 'block';
        }
        // Force reflow before adding class for animation
        container.offsetHeight;
        backdrop.offsetHeight;

        container.classList.add('ec-active');
        backdrop.classList.add('ec-active');

        if (isMobile()) {
            bubble.classList.add('ec-hidden');
            document.body.style.overflow = 'hidden';
            document.body.style.touchAction = 'none';
        } else {
            bubble.innerHTML = ICON_CLOSE;
        }

        bubble.setAttribute('aria-label', lang === 'es' ? 'Cerrar chat' : 'Close chat');
    }

    function closeWidget() {
        if (!isOpen) return;
        isOpen = false;

        container.classList.remove('ec-active');
        backdrop.classList.remove('ec-active');

        if (isMobile()) {
            bubble.classList.remove('ec-hidden');
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        } else {
            bubble.innerHTML = ICON_CHAT;
        }

        bubble.setAttribute('aria-label', lang === 'es' ? 'Abrir chat' : 'Open chat');

        setTimeout(function () {
            if (!isOpen) {
                container.style.display = 'none';
                backdrop.style.display = 'none';
            }
        }, 350);
    }

    function toggleWidget() {
        if (isOpen) {
            closeWidget();
        } else {
            openWidget();
        }
    }

    bubble.addEventListener('click', toggleWidget);
    closeBtn.addEventListener('click', closeWidget);
    backdrop.addEventListener('click', closeWidget);

    // Expose global function to trigger chat from anywhere
    window.openEmpanadasChat = openWidget;
    window.closeEmpanadasChat = closeWidget;

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && isOpen) {
            closeWidget();
        }
    });

    // --- Append to DOM when ready ---
    function init() {
        document.body.appendChild(backdrop);
        document.body.appendChild(container);
        document.body.appendChild(bubble);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
