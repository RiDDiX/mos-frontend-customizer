/**
 * Frontend Customizer - MOS - Theme Loader
 *
 * The one engine that applies every customization: theme CSS, menu, appearance,
 * custom CSS and branding. install.sh / postinst add it as the first child of <head>:
 * <script src="/_plugins/frontend-customizer/theme-loader.js"></script>
 * It applies the config saved in localStorage before Vue renders, keeps branding in
 * sync while MOS renders, and exposes window.FrontendCustomizer for the plugin page.
 * Add ?nocss to the URL to skip custom CSS (safe mode).
 */
(function() {
  'use strict';

  const STORAGE_KEY = 'frontend-customizer-config';

  const themeList = [
    { id: 'riddix-theme', name: 'RiDDiX', description: 'Signature orange tech style - the original', icon: 'mdi-alpha-r-circle',
      primary: '#ff6b00', secondary: '#cc5500', accent: '#ffaa00', background: '#0d0d0d', surface: '#1a1a1a' },
    { id: 'hacker-green', name: 'Hacker', description: 'Neon green on deep black - classic terminal vibes', icon: 'mdi-console',
      primary: '#00ff41', secondary: '#008f11', accent: '#39ff14', background: '#0d0d0d', surface: '#1a1a1a' },
    { id: 'cyber-blue', name: 'Cyber Blue', description: 'Electric blue cyberpunk aesthetic', icon: 'mdi-chip',
      primary: '#00d4ff', secondary: '#0066cc', accent: '#ff00ff', background: '#0a0a14', surface: '#14141e' },
    { id: 'matrix-green', name: 'Matrix', description: 'Pure green terminal - enter the matrix', icon: 'mdi-matrix',
      primary: '#00ff00', secondary: '#00aa00', accent: '#66ff66', background: '#000000', surface: '#0a0a0a' },
    { id: 'nos-nitro', name: 'NOS Nitro', description: 'Blazing fast - orange flames & nitro boost', icon: 'mdi-fire',
      primary: '#ff6600', secondary: '#ff3300', accent: '#ffcc00', background: '#0a0505', surface: '#1a0a0a', hasRallyStripes: true },
    { id: 'lumina-circuit', name: 'Lumina Circuit', description: 'Clean & bright - precision engineering in light', icon: 'mdi-lightbulb-on',
      primary: '#0057e0', secondary: '#0088cc', accent: '#7c3aed', background: '#f0f4f8', surface: '#ffffff', isLight: true },
  ];
  const themes = {};
  themeList.forEach(function(t) { themes[t.id] = t; });

  // Top-level entries of the native MOS menu (mos-frontend src/layouts/AppShell.vue), in native order.
  const menuItems = [
    { id: 'dashboard', title: 'Dashboard', icon: 'mdi-view-dashboard', route: '/dashboard' },
    { id: 'disks', title: 'Disks', icon: 'mdi-harddisk', route: '/disks' },
    { id: 'pools', title: 'Pools', icon: 'mdi-view-array', route: '/pools' },
    { id: 'shares', title: 'Shares', icon: 'mdi-share', route: '/shares' },
    { id: 'remoteMounting', title: 'Remote Mounting', icon: 'mdi-cloud-sync', route: '/remoteMounting' },
    { id: 'mosHub', title: 'MOS Hub', icon: 'mdi-hub', route: '/mosHub' },
    { id: 'docker', title: 'Docker', icon: 'mdi-docker', route: '/docker' },
    { id: 'lxc', title: 'LXC', icon: 'mdi-package-variant', route: '/lxc' },
    { id: 'vm', title: 'VM', icon: 'mdi-monitor-account', route: '/vm' },
    { id: 'plugins', title: 'Plugins', icon: 'mdi-puzzle', route: '/plugins' },
    { id: 'webTerminal', title: 'Terminal', icon: 'mdi-console', route: '/mosTools/webterminal' },
    { id: 'fileBrowser', title: 'File Browser', icon: 'mdi-folder', route: '/mosTools/filebrowser' },
    { id: 'mosSettings', title: 'Settings', icon: 'mdi-cog', route: '/mosSettings' },
  ];

  const fonts = {
    system: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    roboto: "Roboto, 'Helvetica Neue', Arial, sans-serif",
    sans: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    mono: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
  };

  function loadConfig() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  }

  // Values below end up in CSS text or DOM attributes; anything else is dropped.
  function hex(value, fallback) {
    return typeof value === 'string' && /^#[0-9a-f]{3,8}$/i.test(value) ? value : fallback;
  }

  // Black or white, whichever contrasts more with the hex colour c (WCAG relative luminance).
  function onColor(c) {
    const h = c.length < 6 ? c.slice(1, 4).replace(/./g, '$&$&') : c.slice(1, 7);
    const l = [0.2126, 0.7152, 0.0722].reduce(function(sum, w, i) {
      const v = parseInt(h.substr(i * 2, 2), 16) / 255;
      return sum + w * (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
    }, 0);
    return l > 0.179 ? '#000000' : '#ffffff';
  }

  // Vuetify keeps theme colours as "r, g, b" triplets.
  function rgb(c) {
    const h = c.length < 6 ? c.slice(1, 4).replace(/./g, '$&$&') : c.slice(1, 7);
    return [0, 2, 4].map(function(i) { return parseInt(h.substr(i, 2), 16); }).join(', ');
  }

  // http(s) URL, same-origin path, or a base64 image. No quotes, spaces or parens, so url("...") stays closed.
  function safeUrl(value) {
    if (typeof value !== 'string') return '';
    const url = value.trim();
    const ok = /^(https?:\/\/|\/(?!\/))[^\s"'\\()<>]*$/i.test(url) ||
      /^data:image\/(png|jpe?g|gif|webp|svg\+xml);base64,[a-z0-9+/=]+$/i.test(url);
    return ok ? url : '';
  }

  function clamp(value, min, max, fallback) {
    const n = Number(value);
    return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : fallback;
  }

  // Resolve a theme id against built-ins first, then saved custom themes.
  function resolveTheme(config) {
    if (!config || !config.theme) return null;
    if (themes[config.theme]) return themes[config.theme];
    if (Array.isArray(config.customThemes)) {
      return config.customThemes.find(function(t) {
        return t && t.id === config.theme;
      }) || null;
    }
    return null;
  }

  function menuCss(config) {
    const layout = config.layout || {};
    const entries = Array.isArray(layout.menuOrder) ? layout.menuOrder : [];
    const byId = {};
    menuItems.forEach(function(m) { byId[m.id] = m; });
    const seen = {};
    const ordered = [];
    const rules = [];
    entries.forEach(function(entry) {
      const item = entry && byId[entry.id];
      if (!item || seen[item.id]) return;
      seen[item.id] = true;
      ordered.push(item);
      if (entry.visible === false) {
        const a = 'a[href="' + item.route + '"]';
        rules.push('.v-navigation-drawer ' + a + ', .horizontal-menu-container ' + a + ', .v-overlay__content .v-list ' + a + ' { display: none !important; }');
      }
    });
    const reordered = ordered.some(function(item, i) { return menuItems.indexOf(item) !== i; });
    if (reordered) {
      // Order only top-level entries, and only while MOS shows the menu ungrouped.
      const drawer = '.v-navigation-drawer .v-list:not(:has(> .v-list-group))';
      const bar = '.horizontal-menu-left:not(:has(> [aria-haspopup]))';
      rules.push(drawer + ' { display: flex; flex-direction: column; }');
      rules.push(drawer + ' > *, ' + bar + ' > * { order: 100; }');
      ordered.forEach(function(item, i) {
        const a = 'a[href="' + item.route + '"]';
        rules.push(drawer + ' > ' + a + ', ' + bar + ' > ' + a + ' { order: ' + (i + 1) + '; }');
      });
    }
    return rules.join('\n');
  }

  function appearanceCss(config) {
    const a = config.appearance || {};
    const rules = [];
    const font = fonts[a.fontFamily];
    if (font) {
      rules.push(':root { --v-font-body: ' + font + '; --v-font-heading: ' + font + '; }');
      // Same selectors the themes force a font on; the web terminal and code keep their monospace grid.
      rules.push('html, body, .v-application, :is(p, span, div, h1, h2, h3, h4, h5, h6, .v-btn, button, input, textarea):not(.xterm *, code *, pre *) { font-family: ' + font + ' !important; }');
    }
    const scale = clamp(a.uiScale, 80, 125, 100);
    if (scale !== 100) rules.push('html { font-size: ' + scale + '% !important; }');
    const radius = a.radius === null || a.radius === '' || a.radius === undefined ? null : clamp(a.radius, 0, 32, null);
    if (radius !== null) rules.push('html .v-card, html .v-alert, html .v-btn:not(.v-btn--icon) { border-radius: ' + radius + 'px !important; }');
    if (a.cardStyle === 'flat') {
      rules.push('html .v-card { box-shadow: none !important; border: none !important; }');
    } else if (a.cardStyle === 'outlined') {
      rules.push('html .v-card { box-shadow: none !important; border: 1px solid color-mix(in srgb, currentColor 22%, transparent) !important; }');
    } else if (a.cardStyle === 'glass') {
      rules.push('html .v-card { background: color-mix(in srgb, var(--riddix-surface, rgb(var(--v-theme-surface))) 62%, transparent) !important; backdrop-filter: blur(12px) saturate(140%); -webkit-backdrop-filter: blur(12px) saturate(140%); }');
    }
    const bg = safeUrl(a.backgroundUrl);
    if (bg) {
      const blur = clamp(a.backgroundBlur, 0, 20, 0);
      const dim = clamp(a.backgroundDim, 0, 80, 0);
      rules.push('html, body, .v-application, .v-main, .login-wrap, .login-wrap-mobile { background: transparent !important; }');
      rules.push('html::before { content: ""; position: fixed; inset: ' + (-2 * blur) + 'px; z-index: -1; pointer-events: none; ' +
        'background: url("' + bg + '") center / cover no-repeat; filter: blur(' + blur + 'px) brightness(' + (100 - dim) / 100 + '); }');
    }
    return rules.join('\n');
  }

  function setStyle(id, css, first) {
    let el = document.getElementById(id);
    if (!css) {
      if (el) el.remove();
      return;
    }
    if (!el) {
      el = document.createElement('style');
      el.id = id;
      if (first && document.head.firstChild) document.head.insertBefore(el, document.head.firstChild);
      else document.head.appendChild(el);
    }
    if (el.textContent !== css) el.textContent = css;
  }

  // ─── DOM sync: branding lives in elements Vue renders late and re-renders, so re-check after every change ───
  let current = {};
  let appliedTitlePrefix = '';
  let syncQueued = false;

  function setText(el, text) {
    if (el && text && el.textContent !== text) el.textContent = text;
  }

  function setAttr(el, name, value) {
    if (el && value && el.getAttribute(name) !== value) el.setAttribute(name, value);
  }

  function syncTitle(prefix) {
    let title = document.title;
    if (appliedTitlePrefix && title.indexOf(appliedTitlePrefix + ' | ') === 0) title = title.slice(appliedTitlePrefix.length + 3);
    appliedTitlePrefix = prefix;
    const want = prefix ? prefix + ' | ' + title : title;
    if (document.title !== want) document.title = want;
  }

  function syncDom() {
    const c = current.customization || {};
    const appName = typeof c.appName === 'string' ? c.appName : '';
    const logo = safeUrl(c.logoUrl);
    setText(document.querySelector('.v-app-bar .v-toolbar-title__placeholder'), appName);
    setAttr(document.querySelector('.v-app-bar .v-img__img'), 'src', logo);
    if (c.loginBranding) {
      const brand = document.querySelector('.brand'); // mos-frontend src/views/login.vue
      if (brand) {
        setAttr(brand.querySelector('.v-img__img'), 'src', logo);
        setText(brand.querySelector('.brand__title'), appName);
        setText(brand.querySelector('.brand__copy'), typeof c.loginMessage === 'string' ? c.loginMessage : '');
      }
    }
    const icon = safeUrl(c.faviconUrl);
    if (icon) {
      let link = document.querySelector('link[rel~="icon"]');
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      if (link.hasAttribute('type')) link.removeAttribute('type'); // MOS declares image/svg+xml
      setAttr(link, 'href', icon);
    }
    syncTitle(typeof c.titlePrefix === 'string' ? c.titlePrefix.trim() : '');
  }

  function queueSync() {
    if (syncQueued) return;
    syncQueued = true;
    (window.requestAnimationFrame || setTimeout)(function() {
      syncQueued = false;
      syncDom();
    });
  }

  function apply(config) {
    current = config && typeof config === 'object' ? config : {};
    setStyle('riddix-theme-styles', themeCss(current), true);
    setStyle('fc-menu-styles', menuCss(current));
    setStyle('fc-appearance-styles', appearanceCss(current));
    const css = current.appearance && typeof current.appearance.customCss === 'string' ? current.appearance.customCss : '';
    setStyle('fc-custom-css', /[?&]nocss\b/.test(location.search) ? '' : css);
    queueSync();
  }

  function themeCss(config) {
    const baseTheme = resolveTheme(config);
    if (!baseTheme) return '';

    // Apply custom color overrides if set
    const custom = config.customization || {};
    const primary = hex(custom.primaryColor, hex(baseTheme.primary, '#ff6b00'));
    const background = hex(baseTheme.background, '#0d0d0d');
    const btn = hex(custom.buttonColor, hex(baseTheme.buttonColor, primary));
    // Custom themes carry no isLight flag, so a light background decides too.
    const light = baseTheme.isLight || onColor(background) === '#000000';
    const theme = {
      primary: primary,
      secondary: hex(custom.secondaryColor, hex(baseTheme.secondary, primary)),
      accent: hex(custom.accentColor, hex(baseTheme.accent, primary)),
      background: background,
      surface: hex(baseTheme.surface, '#1a1a1a'),
      text: hex(baseTheme.textColor, light ? '#000000' : '#e0e0e0'),
      btn: btn,
      btnText: hex(custom.buttonTextColor, hex(baseTheme.buttonTextColor, onColor(btn))),
    };
    const textMuted = light ? '#5f6b7a' : '#a8adb3';
    const textBody = light ? '#1f2933' : '#c8ccd0';

    const glow = config.enableGlow !== false;
    const anim = config.enableAnimations !== false;

    return `
      /* ═══════════════════════════════════════════════════════════════
         RiDDiX HACKER THEME - Complete Redesign
         Theme: ${config.theme}
      ═══════════════════════════════════════════════════════════════ */

      :root {
        --riddix-primary: ${theme.primary};
        --riddix-secondary: ${theme.secondary};
        --riddix-accent: ${theme.accent};
        --riddix-background: ${theme.background};
        --riddix-surface: ${theme.surface};
        --riddix-glow: ${glow ? `0 0 20px ${theme.primary}44` : 'none'};
        --riddix-glow-intense: ${glow ? `0 0 30px ${theme.primary}66` : 'none'};
      }

      /* Vuetify's own theme variables follow the palette; html raises specificity over .v-theme--* */
      html .v-theme--dark, html .v-theme--light, html .v-application {
        --v-theme-background: ${rgb(theme.background)};
        --v-theme-surface: ${rgb(theme.surface)};
        --v-theme-surface-bright: ${rgb(theme.surface)};
        --v-theme-surface-light: ${rgb(theme.surface)};
        --v-theme-surface-variant: ${rgb(theme.surface)};
        --v-theme-on-background: ${rgb(theme.text)};
        --v-theme-on-surface: ${rgb(theme.text)};
        --v-theme-on-surface-variant: ${rgb(theme.text)};
        --v-theme-primary: ${rgb(theme.primary)};
        --v-theme-on-primary: ${rgb(onColor(theme.primary))};
        --v-theme-secondary: ${rgb(theme.secondary)};
        --v-theme-on-secondary: ${rgb(onColor(theme.secondary))};
        --v-border-color: ${rgb(theme.text)};
      }

      /* ═══ GLOBAL STYLES ═══ */
      html, body {
        background-color: ${theme.background} !important;
        color: ${theme.text} !important;
      }

      .v-application {
        background-color: ${theme.background} !important;
        font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace !important;
        color: ${theme.text} !important;
      }

      /* ═══ LUMINA CIRCUIT LIGHT THEME ═══ */
      ${config.theme === 'lumina-circuit' ? `
      .v-application::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 0;
        background: 
          radial-gradient(ellipse at 20% 20%, ${theme.primary}08 0%, transparent 50%),
          radial-gradient(ellipse at 80% 80%, ${theme.secondary}08 0%, transparent 50%),
          radial-gradient(ellipse at 50% 50%, ${theme.accent}05 0%, transparent 70%),
          linear-gradient(135deg, ${theme.background} 0%, #e8eef5 100%);
      }
      
      .v-application::after {
        content: '';
        position: fixed;
        top: 0;
        right: 0;
        width: 400px;
        height: 400px;
        pointer-events: none;
        z-index: 0;
        background: 
          linear-gradient(135deg, ${theme.primary}10 0%, transparent 60%);
        border-radius: 0 0 0 100%;
        animation: ${anim ? 'luminaPulse 12s ease-in-out infinite' : 'none'};
      }
      
      @keyframes luminaPulse {
        0%, 100% { opacity: 0.5; transform: scale(1); }
        50% { opacity: 0.8; transform: scale(1.05); }
      }
      
      .v-main, .v-navigation-drawer, .v-app-bar {
        position: relative;
        z-index: 1;
      }
      
      .v-card {
        background: rgba(255,255,255,0.85) !important;
        backdrop-filter: blur(10px) !important;
        border: 1px solid ${theme.primary}15 !important;
        box-shadow: 0 4px 20px rgba(0,102,255,0.08) !important;
      }
      
      .v-card:hover {
        box-shadow: 0 8px 30px rgba(0,102,255,0.12) !important;
        border-color: ${theme.primary}30 !important;
      }
      
      .v-btn--variant-elevated, .v-btn--variant-flat {
        background: linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%) !important;
        color: white !important;
      }
      
      .v-list-item__title, .v-list-item__subtitle,
      .v-list-item-title, .v-list-item-subtitle,
      .v-application .v-list-item__title,
      .v-application .v-list-item-title,
      .v-application .v-list-item__subtitle,
      .v-application .v-list-item-subtitle {
        color: #000000 !important;
      }
      
      .v-list-item__title, .v-list-item-title {
        font-weight: 500 !important;
      }
      
      .v-navigation-drawer .v-list-item--active {
        background: linear-gradient(135deg, ${theme.primary}15 0%, ${theme.secondary}10 100%) !important;
        border-left: 3px solid ${theme.primary} !important;
      }
      
      .v-navigation-drawer .v-list-item--active .v-list-item__title {
        color: ${theme.primary} !important;
        font-weight: 600 !important;
      }
      
      .v-data-table {
        background: rgba(255,255,255,0.9) !important;
      }
      
      .v-data-table th {
        background: ${theme.primary}08 !important;
        color: ${theme.primary} !important;
        font-weight: 600 !important;
      }
      
      .v-text-field .v-field {
        background: rgba(255,255,255,0.95) !important;
        border: 1px solid #d0d7de !important;
      }
      
      .v-text-field .v-field:hover {
        border-color: ${theme.primary}50 !important;
      }
      
      .v-text-field .v-field--focused {
        border-color: ${theme.primary} !important;
        box-shadow: 0 0 0 3px ${theme.primary}20 !important;
      }
      
      .v-chip {
        background: ${theme.primary}12 !important;
        color: ${theme.primary} !important;
        border: 1px solid ${theme.primary}30 !important;
      }
      
      .v-progress-linear {
        background: ${theme.primary}15 !important;
      }
      
      .v-progress-linear__determinate {
        background: linear-gradient(90deg, ${theme.primary} 0%, ${theme.secondary} 100%) !important;
      }
      
      ::selection {
        background: ${theme.primary}30 !important;
        color: #1a1a2e !important;
      }
      
      ::-webkit-scrollbar-thumb {
        background: ${theme.primary}40 !important;
      }
      
      ::-webkit-scrollbar-thumb:hover {
        background: ${theme.primary}60 !important;
      }
      
      ::-webkit-scrollbar-track {
        background: ${theme.background} !important;
      }
      ` : ''}

      /* ═══ NOS NITRO RALLY STRIPES ═══ */
      ${config.theme === 'nos-nitro' ? `
      .v-application::before {
        content: '';
        position: fixed;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 0;
        background: 
          linear-gradient(180deg, 
            transparent 0%, 
            ${theme.primary}08 50%, 
            transparent 100%
          ),
          repeating-linear-gradient(
            90deg,
            transparent 0px,
            transparent calc(50% - 65px),
            ${theme.accent}15 calc(50% - 65px),
            ${theme.accent}25 calc(50% - 45px),
            transparent calc(50% - 45px),
            transparent calc(50% - 25px),
            ${theme.primary}20 calc(50% - 25px),
            ${theme.primary}35 calc(50% + 25px),
            transparent calc(50% + 25px),
            transparent calc(50% + 45px),
            ${theme.accent}25 calc(50% + 45px),
            ${theme.accent}15 calc(50% + 65px),
            transparent calc(50% + 65px)
          );
      }
      
      .v-application::after {
        content: '';
        position: fixed;
        top: -50%;
        left: 50%;
        transform: translateX(-50%) rotate(0deg);
        width: 200px;
        height: 200%;
        pointer-events: none;
        z-index: 0;
        background: linear-gradient(
          180deg,
          ${theme.primary}00 0%,
          ${theme.primary}06 20%,
          ${theme.accent}10 50%,
          ${theme.primary}06 80%,
          ${theme.primary}00 100%
        );
        animation: ${anim ? 'nitroFlare 8s ease-in-out infinite' : 'none'};
      }
      
      @keyframes nitroFlare {
        0%, 100% { opacity: 0.3; }
        50% { opacity: 0.7; }
      }
      
      .v-main, .v-navigation-drawer, .v-app-bar {
        position: relative;
        z-index: 1;
      }
      ` : ''}

      /* Scrollbar */
      ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      ::-webkit-scrollbar-track {
        background: ${theme.background};
      }
      ::-webkit-scrollbar-thumb {
        background: ${theme.primary}44;
        border-radius: 4px;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: ${theme.primary}88;
      }

      /* Selection */
      ::selection {
        background: ${theme.primary}44;
        color: ${theme.text};
      }

      /* ═══ APP BAR / HEADER ═══ */
      .v-app-bar, .v-toolbar {
        background: linear-gradient(180deg, ${theme.surface} 0%, ${theme.background} 100%) !important;
        color: ${theme.text} !important;
        border-bottom: 1px solid ${theme.primary}33 !important;
        ${glow ? `box-shadow: 0 2px 20px ${theme.primary}22 !important;` : ''}
      }

      /* Default MOS logos are white in the app bar and black on the login page: invert the one that would vanish */
      ${!safeUrl(custom.logoUrl) ? `${light ? '.v-img__img[src$="mos_white.png"]' : '.v-img__img[src$="mos_black.png"]'} { filter: invert(1); }` : ''}

      .v-app-bar .v-toolbar-title {
        color: ${theme.primary} !important;
        font-weight: 600 !important;
        text-shadow: ${glow ? `0 0 10px ${theme.primary}66` : 'none'};
      }

      /* ═══ NAVIGATION DRAWER ═══ */
      .v-navigation-drawer {
        background: linear-gradient(180deg, ${theme.surface} 0%, ${theme.background} 100%) !important;
        border-right: 1px solid ${theme.primary}22 !important;
      }

      .v-navigation-drawer .v-list-item {
        margin: 4px 8px !important;
        border-radius: 8px !important;
        transition: all 0.2s ease !important;
      }

      .v-navigation-drawer .v-list-item:hover {
        background: ${theme.primary}15 !important;
        transform: translateX(4px);
      }

      .v-navigation-drawer .v-list-item--active {
        background: linear-gradient(90deg, ${theme.primary}22 0%, transparent 100%) !important;
        border-left: 3px solid ${theme.primary} !important;
        ${glow ? `box-shadow: inset 0 0 20px ${theme.primary}11 !important;` : ''}
      }

      .v-navigation-drawer .v-list-item--active .v-list-item-title {
        color: ${theme.primary} !important;
        font-weight: 600 !important;
      }

      .v-navigation-drawer .v-icon {
        color: ${theme.primary}aa !important;
      }

      .v-navigation-drawer .v-list-item--active .v-icon {
        color: ${theme.primary} !important;
        ${glow ? `filter: drop-shadow(0 0 4px ${theme.primary}88);` : ''}
      }

      /* ═══ CARDS ═══ */
      .v-card {
        background: linear-gradient(135deg, ${theme.surface} 0%, ${theme.background} 100%) !important;
        color: ${theme.text} !important;
        border: 1px solid ${theme.primary}22 !important;
        border-radius: 12px !important;
        ${glow ? `box-shadow: 0 4px 30px ${theme.primary}11, inset 0 1px 0 ${theme.primary}11 !important;` : ''}
        backdrop-filter: blur(10px);
        transition: all 0.3s ease !important;
      }

      .v-card:hover {
        border-color: ${theme.primary}44 !important;
        ${glow ? `box-shadow: 0 8px 40px ${theme.primary}22 !important;` : ''}
      }

      .v-card-title {
        color: ${theme.primary} !important;
        font-weight: 600 !important;
        font-size: 1.1rem !important;
      }

      .v-card-subtitle {
        color: ${textMuted} !important;
      }

      .v-card-text {
        color: ${textBody} !important;
      }

      /* ═══ BUTTONS ═══ */
      .v-btn {
        font-family: 'JetBrains Mono', monospace !important;
        font-weight: 500 !important;
        letter-spacing: 0.5px !important;
        text-transform: uppercase !important;
        border-radius: 8px !important;
        ${anim ? 'transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;' : ''}
      }

      .v-btn--variant-elevated, .v-btn--variant-flat {
        background: linear-gradient(135deg, ${theme.btn} 0%, color-mix(in srgb, ${theme.btn} 70%, ${theme.secondary}) 100%) !important;
        color: ${theme.btnText} !important;
        border: none !important;
        ${glow ? `box-shadow: 0 4px 15px ${theme.btn}44 !important;` : ''}
      }

      .v-btn--variant-elevated:hover, .v-btn--variant-flat:hover {
        ${anim ? 'transform: translateY(-2px) scale(1.02) !important;' : ''}
        ${glow ? `box-shadow: 0 6px 25px ${theme.btn}66 !important;` : ''}
      }

      .v-btn--variant-outlined {
        border: 1px solid ${theme.btn}66 !important;
        color: ${theme.btn} !important;
        background: transparent !important;
      }

      .v-btn--variant-outlined:hover {
        background: ${theme.btn}11 !important;
        border-color: ${theme.btn} !important;
      }

      .v-btn--variant-text {
        color: ${theme.btn} !important;
      }

      .v-btn--variant-text:hover {
        background: ${theme.btn}11 !important;
      }

      .v-btn--icon {
        border-radius: 50% !important;
      }

      .v-btn--icon:hover {
        background: ${theme.btn}22 !important;
        ${glow ? `box-shadow: 0 0 15px ${theme.btn}44 !important;` : ''}
      }

      .v-btn .v-icon {
        ${glow ? `filter: drop-shadow(0 0 2px ${theme.btn}44);` : ''}
      }

      /* ═══ DATA TABLES ═══ */
      .v-data-table {
        background: ${theme.surface} !important;
        border: 1px solid ${theme.primary}22 !important;
        border-radius: 12px !important;
        overflow: hidden !important;
      }

      .v-data-table-header {
        background: linear-gradient(180deg, ${theme.surface} 0%, ${theme.background} 100%) !important;
      }

      .v-data-table-header th {
        color: ${theme.primary} !important;
        font-weight: 600 !important;
        text-transform: uppercase !important;
        font-size: 0.75rem !important;
        letter-spacing: 1px !important;
        border-bottom: 2px solid ${theme.primary}33 !important;
      }

      .v-data-table__tr {
        border-bottom: 1px solid ${theme.primary}11 !important;
        transition: all 0.2s ease !important;
      }

      .v-data-table__tr:hover {
        background: linear-gradient(90deg, ${theme.primary}11 0%, transparent 100%) !important;
      }

      .v-data-table__tr td {
        color: ${textBody} !important;
        border-bottom: 1px solid ${theme.primary}11 !important;
      }

      .v-data-table-footer {
        background: ${theme.surface} !important;
        border-top: 1px solid ${theme.primary}22 !important;
      }

      /* ═══ INPUTS / TEXT FIELDS ═══ */
      .v-field {
        background: ${theme.background} !important;
        border: 1px solid ${theme.primary}33 !important;
        border-radius: 8px !important;
        transition: all 0.2s ease !important;
      }

      .v-field:hover {
        border-color: ${theme.primary}66 !important;
      }

      .v-field--focused {
        border-color: ${theme.primary} !important;
        ${glow ? `box-shadow: 0 0 15px ${theme.primary}33 !important;` : ''}
      }

      .v-field__input {
        color: ${theme.text} !important;
      }

      .v-label {
        color: ${textMuted} !important;
      }

      .v-field--focused .v-label {
        color: ${theme.primary} !important;
      }

      /* ═══ SELECT / DROPDOWN ═══ */
      .v-select .v-field {
        background: ${theme.background} !important;
      }

      .v-menu > .v-overlay__content {
        background: ${theme.surface} !important;
        border: 1px solid ${theme.primary}33 !important;
        border-radius: 8px !important;
        ${glow ? `box-shadow: 0 8px 30px ${theme.primary}22 !important;` : ''}
      }

      .v-list {
        background: transparent !important;
        color: ${theme.text} !important;
      }

      .v-list-item {
        transition: all 0.15s ease !important;
      }

      .v-list-item:hover {
        background: ${theme.primary}15 !important;
      }

      .v-list-item--active {
        background: ${theme.primary}22 !important;
      }

      .v-list-item-title {
        color: ${textBody} !important;
      }

      .v-list-item--active .v-list-item-title {
        color: ${theme.primary} !important;
      }

      /* ═══ DIALOGS / MODALS ═══ */
      .v-dialog > .v-overlay__content {
        background: ${theme.surface} !important;
        border: 1px solid ${theme.primary}33 !important;
        border-radius: 16px !important;
        ${glow ? `box-shadow: 0 20px 60px ${theme.primary}22 !important;` : ''}
      }

      .v-dialog > .v-overlay__content > .v-card {
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
      }

      /* ═══ CHIPS ═══ */
      .v-chip {
        background: ${theme.primary}22 !important;
        border: 1px solid ${theme.primary}44 !important;
        color: ${theme.primary} !important;
        font-family: 'JetBrains Mono', monospace !important;
        font-size: 0.8rem !important;
      }

      .v-chip--variant-elevated {
        background: linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%) !important;
        color: ${onColor(theme.primary)} !important;
        ${glow ? `box-shadow: 0 2px 10px ${theme.primary}44 !important;` : ''}
      }

      /* ═══ PROGRESS BARS ═══ */
      .v-progress-linear {
        background: ${theme.background} !important;
        border-radius: 4px !important;
        overflow: hidden !important;
      }

      .v-progress-linear__background {
        background: ${theme.primary}22 !important;
      }

      .v-progress-linear__determinate, .v-progress-linear__indeterminate {
        background: linear-gradient(90deg, ${theme.secondary} 0%, ${theme.primary} 50%, ${theme.accent} 100%) !important;
        ${glow ? `box-shadow: 0 0 15px ${theme.primary}66 !important;` : ''}
      }

      .v-progress-circular__overlay {
        stroke: ${theme.primary} !important;
      }

      /* ═══ SWITCHES / TOGGLES ═══ */
      .v-switch .v-selection-control__input > .v-icon {
        color: ${theme.primary} !important;
      }

      .v-switch--inset .v-switch__track {
        background: ${theme.primary}33 !important;
      }

      .v-switch--inset.v-switch--selected .v-switch__track {
        background: ${theme.primary}66 !important;
        ${glow ? `box-shadow: 0 0 10px ${theme.primary}44 !important;` : ''}
      }

      .v-checkbox .v-selection-control__input > .v-icon {
        color: ${theme.primary} !important;
      }

      /* ═══ TABS ═══ */
      .v-tabs {
        background: transparent !important;
      }

      .v-tab {
        color: ${textMuted} !important;
        text-transform: uppercase !important;
        letter-spacing: 1px !important;
        font-weight: 500 !important;
        transition: all 0.2s ease !important;
      }

      .v-tab:hover {
        color: ${theme.primary}aa !important;
        background: ${theme.primary}11 !important;
      }

      .v-tab--selected {
        color: ${theme.primary} !important;
        background: ${theme.primary}15 !important;
      }

      .v-tabs-slider {
        background: ${theme.primary} !important;
        ${glow ? `box-shadow: 0 0 10px ${theme.primary}66 !important;` : ''}
      }

      /* ═══ EXPANSION PANELS ═══ */
      .v-expansion-panels {
        background: transparent !important;
      }

      .v-expansion-panel {
        background: ${theme.surface} !important;
        border: 1px solid ${theme.primary}22 !important;
        margin-bottom: 8px !important;
        border-radius: 8px !important;
      }

      .v-expansion-panel-title {
        color: ${textBody} !important;
        font-weight: 500 !important;
      }

      .v-expansion-panel--active .v-expansion-panel-title {
        color: ${theme.primary} !important;
      }

      .v-expansion-panel-text {
        color: ${textMuted} !important;
      }

      /* ═══ SLIDERS ═══ */
      .v-slider-track__background {
        background: ${theme.primary}33 !important;
      }

      .v-slider-track__fill {
        background: ${theme.primary} !important;
        ${glow ? `box-shadow: 0 0 8px ${theme.primary}66 !important;` : ''}
      }

      .v-slider-thumb__surface {
        background: ${theme.primary} !important;
        ${glow ? `box-shadow: 0 0 12px ${theme.primary}88 !important;` : ''}
      }

      /* ═══ SNACKBAR / ALERTS ═══ */
      .v-snackbar__wrapper {
        background: ${theme.surface} !important;
        border: 1px solid ${theme.primary}44 !important;
        ${glow ? `box-shadow: 0 8px 30px ${theme.primary}33 !important;` : ''}
      }

      .v-alert {
        border: 1px solid ${theme.primary}44 !important;
        border-radius: 8px !important;
      }

      /* ═══ DIVIDERS ═══ */
      .v-divider {
        border-color: ${theme.primary}22 !important;
      }

      /* ═══ TOOLTIPS ═══ */
      .v-tooltip > .v-overlay__content {
        background: ${theme.surface} !important;
        border: 1px solid ${theme.primary}44 !important;
        color: ${theme.primary} !important;
        font-family: 'JetBrains Mono', monospace !important;
        font-size: 0.8rem !important;
        ${glow ? `box-shadow: 0 4px 20px ${theme.primary}33 !important;` : ''}
      }

      /* ═══ AVATARS ═══ */
      .v-avatar {
        border: 2px solid ${theme.primary}44 !important;
        ${glow ? `box-shadow: 0 0 15px ${theme.primary}22 !important;` : ''}
      }

      /* ═══ BADGES ═══ */
      .v-badge__badge {
        background: ${theme.primary} !important;
        color: ${onColor(theme.primary)} !important;
        font-weight: 600 !important;
        ${glow ? `box-shadow: 0 0 10px ${theme.primary}66 !important;` : ''}
      }

      /* ═══ FAB BUTTONS ═══ */
      .v-btn--fab {
        background: linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%) !important;
        ${glow ? `box-shadow: 0 6px 25px ${theme.primary}66 !important;` : ''}
      }

      .v-btn--fab:hover {
        ${anim ? 'transform: scale(1.1) !important;' : ''}
        ${glow ? `box-shadow: 0 10px 40px ${theme.primary}88 !important;` : ''}
      }

      /* ═══ MENUS ═══ */
      .v-menu__content {
        background: ${theme.surface} !important;
        border: 1px solid ${theme.primary}33 !important;
        border-radius: 8px !important;
      }

      /* ═══ PAGINATION ═══ */
      .v-pagination__item {
        background: ${theme.surface} !important;
        border: 1px solid ${theme.primary}33 !important;
        color: ${textMuted} !important;
      }

      .v-pagination__item--is-active {
        background: ${theme.primary} !important;
        color: ${onColor(theme.primary)} !important;
        ${glow ? `box-shadow: 0 0 15px ${theme.primary}66 !important;` : ''}
      }

      /* ═══ TIMELINE ═══ */
      .v-timeline-item__dot {
        background: ${theme.primary} !important;
        ${glow ? `box-shadow: 0 0 15px ${theme.primary}66 !important;` : ''}
      }

      .v-timeline-divider__inner-dot {
        background: ${theme.primary} !important;
      }

      /* ═══ SPARKLINE / CHARTS ═══ */
      .v-sparkline path {
        stroke: ${theme.primary} !important;
      }

      /* ═══ ICONS ═══ */
      .v-icon {
        color: ${theme.primary}cc !important;
      }

      /* ═══ SKELETON LOADERS ═══ */
      .v-skeleton-loader__bone {
        background: linear-gradient(90deg, ${theme.surface} 0%, ${theme.primary}22 50%, ${theme.surface} 100%) !important;
        background-size: 200% 100% !important;
        animation: skeleton-loading 1.5s infinite !important;
      }

      @keyframes skeleton-loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }

      /* ═══ SCANLINES EFFECT ═══ */
      ${config.enableScanlines ? `
      body::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9999;
        background: repeating-linear-gradient(
          0deg,
          transparent,
          transparent 2px,
          ${theme.primary}05 2px,
          ${theme.primary}05 4px
        );
        animation: scanlines 0.1s linear infinite;
      }
      @keyframes scanlines {
        0% { transform: translateY(0); }
        100% { transform: translateY(4px); }
      }
      ` : ''}

      /* ═══ TYPOGRAPHY ═══ */
      h1, h2, h3, h4, h5, h6,
      .text-h1, .text-h2, .text-h3, .text-h4, .text-h5, .text-h6 {
        color: ${theme.primary} !important;
        font-family: 'JetBrains Mono', 'Fira Code', monospace !important;
        text-shadow: ${glow ? `0 0 10px ${theme.primary}44` : 'none'};
      }

      a:not(.v-btn) {
        color: ${theme.primary} !important;
        text-decoration: none !important;
        transition: all 0.2s ease !important;
      }

      a:not(.v-btn):hover {
        color: ${theme.accent} !important;
        text-shadow: ${glow ? `0 0 8px ${theme.primary}66` : 'none'};
      }

      /* ═══ BREADCRUMBS ═══ */
      .v-breadcrumbs {
        background: ${theme.surface} !important;
        border: 1px solid ${theme.primary}22 !important;
        border-radius: 8px !important;
        padding: 8px 16px !important;
      }

      .v-breadcrumbs-item {
        color: ${theme.primary} !important;
      }

      .v-breadcrumbs-divider {
        color: ${theme.primary}44 !important;
      }

      /* ═══ RATING / STARS ═══ */
      .v-rating .v-icon {
        color: ${theme.primary} !important;
      }

      /* ═══ STEPPER ═══ */
      .v-stepper {
        background: ${theme.surface} !important;
        border: 1px solid ${theme.primary}22 !important;
      }

      .v-stepper-item--selected .v-stepper-item__avatar {
        background: ${theme.primary} !important;
        ${glow ? `box-shadow: 0 0 15px ${theme.primary}66 !important;` : ''}
      }

      /* ═══ BOTTOM NAVIGATION ═══ */
      .v-bottom-navigation {
        background: ${theme.surface} !important;
        border-top: 1px solid ${theme.primary}33 !important;
      }

      .v-bottom-navigation .v-btn--active {
        color: ${theme.primary} !important;
      }

      /* ═══ SPEED DIAL / FAB ═══ */
      .v-speed-dial .v-btn {
        ${glow ? `box-shadow: 0 4px 20px ${theme.primary}44 !important;` : ''}
      }

      /* ═══ OVERLAY / BACKDROP ═══ */
      .v-overlay__scrim {
        background: ${theme.background}ee !important;
        backdrop-filter: blur(4px) !important;
      }

      /* ═══ SYSTEM BAR ═══ */
      .v-system-bar {
        background: ${theme.background} !important;
        border-bottom: 1px solid ${theme.primary}22 !important;
        color: ${theme.primary} !important;
      }

      /* ═══ FOOTER ═══ */
      .v-footer {
        background: ${theme.surface} !important;
        border-top: 1px solid ${theme.primary}33 !important;
      }

      /* ═══ BANNER ═══ */
      .v-banner {
        background: ${theme.surface} !important;
        border: 1px solid ${theme.primary}33 !important;
        border-left: 4px solid ${theme.primary} !important;
      }

      /* ═══ SHEET ═══ */
      .v-sheet {
        background: ${theme.surface} !important;
        border: 1px solid ${theme.primary}22 !important;
      }

      /* ═══ WINDOW / CAROUSEL ═══ */
      .v-window {
        background: transparent !important;
      }

      .v-carousel__controls {
        background: ${theme.surface}88 !important;
      }

      .v-carousel__controls .v-btn--active {
        color: ${theme.primary} !important;
      }

      /* ═══ COLOR PICKER ═══ */
      .v-color-picker {
        background: ${theme.surface} !important;
        border: 1px solid ${theme.primary}33 !important;
      }

      /* ═══ DATE/TIME PICKER ═══ */
      .v-picker {
        background: ${theme.surface} !important;
        border: 1px solid ${theme.primary}33 !important;
      }

      .v-picker-title {
        background: linear-gradient(135deg, ${theme.primary}22 0%, transparent 100%) !important;
        color: ${theme.primary} !important;
      }

      .v-date-picker-month__day--selected {
        background: ${theme.primary} !important;
        color: ${onColor(theme.primary)} !important;
        ${glow ? `box-shadow: 0 0 15px ${theme.primary}66 !important;` : ''}
      }

      /* ═══ OTP INPUT ═══ */
      .v-otp-input input {
        background: ${theme.background} !important;
        border: 2px solid ${theme.primary}44 !important;
        color: ${theme.primary} !important;
        font-family: 'JetBrains Mono', monospace !important;
      }

      .v-otp-input input:focus {
        border-color: ${theme.primary} !important;
        ${glow ? `box-shadow: 0 0 15px ${theme.primary}44 !important;` : ''}
      }

      /* ═══ FILE INPUT ═══ */
      .v-file-input .v-field {
        background: ${theme.background} !important;
      }

      /* ═══ TEXTAREA ═══ */
      .v-textarea .v-field {
        background: ${theme.background} !important;
      }

      /* ═══ RADIO BUTTONS ═══ */
      .v-radio .v-selection-control__input > .v-icon {
        color: ${theme.primary} !important;
      }

      /* ═══ COMBOBOX / AUTOCOMPLETE ═══ */
      .v-combobox .v-field, .v-autocomplete .v-field {
        background: ${theme.background} !important;
      }

      /* ═══ RANGE SLIDER ═══ */
      .v-range-slider .v-slider-track__fill {
        background: ${theme.primary} !important;
      }

      /* ═══ INFINITE SCROLL ═══ */
      .v-infinite-scroll__loading {
        color: ${theme.primary} !important;
      }

      /* ═══ VIRTUAL SCROLLER ═══ */
      .v-virtual-scroll {
        background: transparent !important;
      }

      /* ═══ TREEVIEW ═══ */
      .v-treeview-item {
        color: ${textBody} !important;
      }

      .v-treeview-item--active {
        background: ${theme.primary}22 !important;
      }

      .v-treeview-item--active .v-treeview-item__content {
        color: ${theme.primary} !important;
      }

      /* ═══ HOVER CARD EFFECT ═══ */
      .v-hover .v-card:hover {
        transform: translateY(-4px) !important;
        ${glow ? `box-shadow: 0 12px 40px ${theme.primary}33 !important;` : ''}
      }

      /* ═══ LAZY IMAGE ═══ */
      .v-lazy-image {
        border: 1px solid ${theme.primary}22 !important;
        border-radius: 8px !important;
      }

      /* ═══ RESPONSIVE LAYOUT ═══ */
      .v-container {
        background: transparent !important;
      }

      /* ═══ SPARKLINE MINI CHARTS ═══ */
      .v-sparkline {
        stroke: ${theme.primary} !important;
      }

      /* ═══ SNACKBAR VARIANTS ═══ */
      .v-snackbar--variant-success .v-snackbar__wrapper {
        border-color: #00e676 !important;
      }

      .v-snackbar--variant-error .v-snackbar__wrapper {
        border-color: #ff4444 !important;
      }

      .v-snackbar--variant-warning .v-snackbar__wrapper {
        border-color: #ffaa00 !important;
      }

      /* ═══ LOADING INDICATOR ═══ */
      .v-overlay--loading .v-progress-circular {
        color: ${theme.primary} !important;
      }

      /* ═══ EMPTY STATE ═══ */
      .v-data-table__empty-wrapper {
        color: ${theme.primary}88 !important;
        font-style: italic !important;
      }

      /* ═══ COPY/CODE BLOCKS ═══ */
      code, pre, .code {
        background: ${theme.background} !important;
        border: 1px solid ${theme.primary}33 !important;
        border-radius: 4px !important;
        color: ${theme.primary} !important;
        font-family: 'JetBrains Mono', 'Fira Code', monospace !important;
        padding: 2px 6px !important;
      }

      pre {
        padding: 12px !important;
        overflow-x: auto !important;
      }

      /* ═══ BLOCKQUOTE ═══ */
      blockquote {
        border-left: 4px solid ${theme.primary} !important;
        background: ${theme.surface} !important;
        padding: 12px 16px !important;
        margin: 12px 0 !important;
        color: ${textMuted} !important;
      }

      /* ═══ HORIZONTAL RULE ═══ */
      hr {
        border: none !important;
        height: 1px !important;
        background: linear-gradient(90deg, transparent, ${theme.primary}44, transparent) !important;
        margin: 24px 0 !important;
      }

      /* ═══ FORM VALIDATION ═══ */
      .v-field--error {
        border-color: #ff4444 !important;
      }

      /* ═══ FOCUS STATES ═══ */
      *:focus-visible {
        outline: 2px solid ${theme.primary} !important;
        outline-offset: 2px !important;
      }

      /* ═══ DISABLED STATES ═══ */
      .v-btn--disabled {
        opacity: 0.4 !important;
        filter: grayscale(50%) !important;
      }

      /* ═══ LOADING STATES ═══ */
      .v-btn--loading {
        color: transparent !important;
      }

      .v-btn--loading .v-progress-circular {
        color: ${theme.primary} !important;
      }

      /* ═══ CYBER GRID BACKGROUND ═══ */
      .v-main {
        background: 
          linear-gradient(${theme.primary}08 1px, transparent 1px),
          linear-gradient(90deg, ${theme.primary}08 1px, transparent 1px),
          ${theme.background} !important;
        background-size: 50px 50px, 50px 50px, 100% 100% !important;
      }

      /* ═══ TERMINAL CURSOR BLINK ═══ */
      @keyframes cursor-blink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0; }
      }

      /* ═══ TEXT GLOW ON HOVER ═══ */
      ${anim ? `
      .v-list-item-title:hover,
      .v-card-title:hover {
        text-shadow: 0 0 8px ${theme.primary}66;
      }
      ` : ''}

      /* ═══ BORDER ANIMATIONS ═══ */
      ${anim ? `
      @keyframes border-glow {
        0%, 100% { border-color: ${theme.primary}22; }
        50% { border-color: ${theme.primary}66; }
      }

      .v-card:focus-within {
        animation: border-glow 2s ease-in-out infinite;
      }
      ` : ''}

      /* ═══ CUSTOM ANIMATIONS ═══ */
      ${anim ? `
      @keyframes flicker {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.95; }
        75% { opacity: 0.98; }
      }

      @keyframes data-stream {
        0% { background-position: 0 0; }
        100% { background-position: 0 100%; }
      }

      .v-app-bar .v-toolbar-title {
        animation: flicker 3s ease-in-out infinite;
      }
      ` : ''}

      /* ═══ REDUCED MOTION ═══ */
      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
          animation: none !important;
          transition: none !important;
        }
      }

      /* ═══ PRINT STYLES ═══ */
      @media print {
        * {
          background: white !important;
          color: black !important;
          box-shadow: none !important;
        }
      }
    `;
  }

  window.FrontendCustomizer = { themes: themeList, menuItems: menuItems, fonts: Object.keys(fonts), apply: apply };

  // Pull the server copy once per page load, so every browser follows the last save.
  function syncFromServer() {
    const token = localStorage.getItem('authToken');
    if (!token || typeof fetch !== 'function') return;
    const before = localStorage.getItem(STORAGE_KEY);
    fetch('/api/v1/mos/plugins/settings/frontend-customizer', { headers: { Authorization: 'Bearer ' + token } })
      .then(function(res) { return res.ok ? res.json() : null; })
      .then(function(data) {
        // No layout = the install seed, not a save (the plugin page pushes this browser's copy then).
        // A save made on this page while the request ran wins.
        if (!data || typeof data !== 'object' || !data.layout || localStorage.getItem(STORAGE_KEY) !== before) return;
        const json = JSON.stringify(data);
        if (json === before) return;
        localStorage.setItem(STORAGE_KEY, json);
        apply(data);
      })
      .catch(function() {});
  }

  // Load and apply immediately, then keep branding in sync while MOS renders.
  apply(loadConfig() || {});
  syncFromServer();
  new MutationObserver(queueSync).observe(document.documentElement, {
    subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['src', 'href'],
  });
})();
