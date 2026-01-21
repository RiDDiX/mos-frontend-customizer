/**
 * Frontend Customizer - MOS - Theme Loader
 * 
 * This script loads the saved theme from localStorage and applies it
 * BEFORE Vue/MOS loads, preventing flash of unstyled content.
 * 
 * Add this to /var/www/mos-frontend/index.html:
 * <script src="/mos-plugins/frontend-customizer/theme-loader.js"></script>
 */
(function() {
  'use strict';
  
  const STORAGE_KEY = 'frontend-customizer-config';
  
  const themes = {
    'riddix-theme': {
      primary: '#ff6b00',
      secondary: '#cc5500',
      accent: '#ffaa00',
      background: '#0d0d0d',
      surface: '#1a1a1a',
    },
    'hacker-green': {
      primary: '#00ff41',
      secondary: '#008f11',
      accent: '#00ff41',
      background: '#0d0d0d',
      surface: '#1a1a1a',
    },
    'cyber-blue': {
      primary: '#00d4ff',
      secondary: '#0066cc',
      accent: '#ff00ff',
      background: '#0a0a14',
      surface: '#14141e',
    },
    'matrix-green': {
      primary: '#00ff00',
      secondary: '#003300',
      accent: '#00ff00',
      background: '#000000',
      surface: '#0a0a0a',
    },
    'nos-nitro': {
      primary: '#ff6600',
      secondary: '#ff3300',
      accent: '#ffcc00',
      background: '#0a0505',
      surface: '#1a0a0a',
      hasRallyStripes: true,
    },
    'lumina-circuit': {
      primary: '#0066ff',
      secondary: '#00a8e8',
      accent: '#7c3aed',
      background: '#f0f4f8',
      surface: '#ffffff',
      isLight: true,
    },
  };

  function loadConfig() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  }

  function applyBranding(config) {
    if (!config || !config.customization) return;
    
    const custom = config.customization;
    
    // Wait for DOM to be ready
    const applyWhenReady = () => {
      // Apply custom app name
      if (custom.appName) {
        const titleEl = document.querySelector('.v-toolbar-title__placeholder');
        if (titleEl) {
          titleEl.textContent = custom.appName;
        }
      }
      
      // Apply custom logo
      if (custom.logoUrl) {
        const logoImg = document.querySelector('.v-app-bar img.v-img__img');
        if (logoImg) {
          logoImg.src = custom.logoUrl;
        }
      }
    };
    
    // Try immediately and also after DOM load
    if (document.readyState === 'complete') {
      setTimeout(applyWhenReady, 100);
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(applyWhenReady, 100);
      });
    }
    
    // Also observe for dynamic changes (Vue mounting)
    const observer = new MutationObserver(() => {
      applyWhenReady();
    });
    
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
      setTimeout(() => observer.disconnect(), 5000); // Stop after 5s
    }
  }

  function applyLayout(config) {
    if (!config || !config.layout || config.layout.navMode !== 'header') return;
    
    const layout = config.layout;
    const baseTheme = themes[config.theme] || themes['riddix-hacker'];
    
    const applyWhenReady = () => {
      // Check if already applied
      if (document.getElementById('riddix-layout-styles')) return;
      
      const appBar = document.querySelector('.v-app-bar .v-toolbar__content');
      if (!appBar) return;
      
      // Create layout styles
      const layoutStyle = document.createElement('style');
      layoutStyle.id = 'riddix-layout-styles';
      layoutStyle.textContent = `
        .v-navigation-drawer { display: none !important; }
        .v-main { padding-left: 0 !important; }
        .v-app-bar-nav-icon { display: none !important; }
        
        #riddix-header-nav {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-left: 16px;
          flex-wrap: wrap;
        }
        
        #riddix-header-nav a {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          border-radius: 6px;
          text-decoration: none;
          font-size: 11px;
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          color: #b0b0b0;
          background: rgba(255,255,255,0.03);
          border: 1px solid transparent;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        
        #riddix-header-nav a:hover {
          color: ${baseTheme.primary};
          background: ${baseTheme.primary}18;
          border-color: ${baseTheme.primary}44;
          box-shadow: 0 0 10px ${baseTheme.primary}22;
        }
        
        #riddix-header-nav a .v-icon { font-size: 14px; }
        
        @media (max-width: 960px) {
          #riddix-header-nav { display: none; }
          .v-app-bar-nav-icon { display: flex !important; }
          .v-navigation-drawer { display: block !important; }
        }
      `;
      document.head.appendChild(layoutStyle);
      
      // Create header navigation
      const headerNav = document.createElement('nav');
      headerNav.id = 'riddix-header-nav';
      
      const menuItems = layout.menuOrder || [];
      menuItems.filter(item => item.visible).forEach(item => {
        const link = document.createElement('a');
        link.href = item.route;
        link.innerHTML = '<span class="v-icon mdi ' + item.icon + '"></span><span>' + item.title + '</span>';
        link.addEventListener('click', function(e) {
          e.preventDefault();
          window.history.pushState({}, '', item.route);
          window.dispatchEvent(new PopStateEvent('popstate'));
        });
        headerNav.appendChild(link);
      });
      
      const toolbarTitle = appBar.querySelector('.v-toolbar-title');
      if (toolbarTitle && toolbarTitle.nextSibling) {
        appBar.insertBefore(headerNav, toolbarTitle.nextSibling);
      } else {
        appBar.appendChild(headerNav);
      }
    };
    
    if (document.readyState === 'complete') {
      setTimeout(applyWhenReady, 200);
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(applyWhenReady, 200);
      });
    }
    
    const observer = new MutationObserver(() => {
      if (!document.getElementById('riddix-header-nav')) {
        applyWhenReady();
      }
    });
    
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
      setTimeout(() => observer.disconnect(), 5000);
    }
  }

  function applyTheme(config) {
    if (!config || !config.theme) return;
    
    const baseTheme = themes[config.theme];
    if (!baseTheme) return;

    // Apply custom color overrides if set
    const custom = config.customization || {};
    const theme = {
      primary: custom.primaryColor || baseTheme.primary,
      secondary: custom.secondaryColor || baseTheme.secondary,
      accent: custom.accentColor || baseTheme.accent,
      background: baseTheme.background,
      surface: baseTheme.surface,
    };

    const glow = config.enableGlow !== false;
    const anim = config.enableAnimations !== false;

    const styleEl = document.createElement('style');
    styleEl.id = 'riddix-theme-styles';
    styleEl.textContent = `
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

      /* ═══ GLOBAL STYLES ═══ */
      html, body {
        background-color: ${theme.background} !important;
        color: ${baseTheme.isLight ? '#000000' : '#e0e0e0'} !important;
      }

      .v-application {
        background-color: ${theme.background} !important;
        font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace !important;
        color: ${baseTheme.isLight ? '#000000' : '#e0e0e0'} !important;
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
      
      .v-btn {
        color: #000000 !important;
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
      
      .v-application .v-card,
      .v-application .v-card *,
      .v-application .v-list *,
      .v-application .v-navigation-drawer *,
      .v-application .v-toolbar *,
      .v-application .v-app-bar * {
        color: #000000;
      }
      
      .v-application .v-icon {
        color: #000000 !important;
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
        color: ${theme.primary};
      }

      /* ═══ APP BAR / HEADER ═══ */
      .v-app-bar, .v-toolbar {
        background: linear-gradient(180deg, ${theme.surface} 0%, ${theme.background} 100%) !important;
        border-bottom: 1px solid ${theme.primary}33 !important;
        ${glow ? `box-shadow: 0 2px 20px ${theme.primary}22 !important;` : ''}
      }

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
        border-bottom: 1px solid ${theme.primary}22;
        padding-bottom: 12px !important;
        margin-bottom: 12px !important;
      }

      .v-card-subtitle {
        color: #888 !important;
      }

      .v-card-text {
        color: #b0b0b0 !important;
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
        background: linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%) !important;
        color: ${theme.background} !important;
        border: none !important;
        ${glow ? `box-shadow: 0 4px 15px ${theme.primary}44 !important;` : ''}
      }

      .v-btn--variant-elevated:hover, .v-btn--variant-flat:hover {
        ${anim ? 'transform: translateY(-2px) scale(1.02) !important;' : ''}
        ${glow ? `box-shadow: 0 6px 25px ${theme.primary}66 !important;` : ''}
      }

      .v-btn--variant-outlined {
        border: 1px solid ${theme.primary}66 !important;
        color: ${theme.primary} !important;
        background: transparent !important;
      }

      .v-btn--variant-outlined:hover {
        background: ${theme.primary}11 !important;
        border-color: ${theme.primary} !important;
      }

      .v-btn--variant-text {
        color: ${theme.primary} !important;
      }

      .v-btn--variant-text:hover {
        background: ${theme.primary}11 !important;
      }

      .v-btn--icon {
        border-radius: 50% !important;
      }

      .v-btn--icon:hover {
        background: ${theme.primary}22 !important;
        ${glow ? `box-shadow: 0 0 15px ${theme.primary}44 !important;` : ''}
      }

      .v-btn .v-icon {
        ${glow ? `filter: drop-shadow(0 0 2px ${theme.primary}44);` : ''}
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
        color: #c0c0c0 !important;
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
        color: #e0e0e0 !important;
      }

      .v-label {
        color: #888 !important;
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
        color: #c0c0c0 !important;
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

      .v-dialog .v-card {
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
        color: ${theme.background} !important;
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
        color: #888 !important;
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
        color: #c0c0c0 !important;
        font-weight: 500 !important;
      }

      .v-expansion-panel--active .v-expansion-panel-title {
        color: ${theme.primary} !important;
      }

      .v-expansion-panel-text {
        color: #a0a0a0 !important;
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
        color: ${theme.background} !important;
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
        color: #a0a0a0 !important;
      }

      .v-pagination__item--is-active {
        background: ${theme.primary} !important;
        color: ${theme.background} !important;
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

      .text-success .v-icon, .text-success {
        color: ${theme.primary} !important;
      }

      .text-error .v-icon, .text-error {
        color: #ff4444 !important;
      }

      .text-warning .v-icon, .text-warning {
        color: #ffaa00 !important;
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

      p, span, div {
        font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace !important;
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
        color: ${theme.primary}aa !important;
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
        color: ${theme.background} !important;
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
        color: #c0c0c0 !important;
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

      .v-row {
        margin: 0 !important;
      }

      /* ═══ SPARKLINE MINI CHARTS ═══ */
      .v-sparkline {
        stroke: ${theme.primary} !important;
      }

      /* ═══ SNACKBAR VARIANTS ═══ */
      .v-snackbar--variant-success .v-snackbar__wrapper {
        border-color: ${theme.primary} !important;
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
        color: #a0a0a0 !important;
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

      .v-messages__message {
        color: ${theme.primary}aa !important;
      }

      .v-field--error .v-messages__message {
        color: #ff4444 !important;
      }

      /* ═══ FOCUS STATES ═══ */
      *:focus-visible {
        outline: 2px solid ${theme.primary}66 !important;
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
      @keyframes glow-pulse {
        0%, 100% { box-shadow: 0 0 20px ${theme.primary}22; }
        50% { box-shadow: 0 0 30px ${theme.primary}44; }
      }

      @keyframes flicker {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.95; }
        75% { opacity: 0.98; }
      }

      @keyframes data-stream {
        0% { background-position: 0 0; }
        100% { background-position: 0 100%; }
      }

      .v-card {
        animation: glow-pulse 4s ease-in-out infinite;
      }

      .v-app-bar .v-toolbar-title {
        animation: flicker 3s ease-in-out infinite;
      }
      ` : ''}

      /* ═══ PRINT STYLES ═══ */
      @media print {
        * {
          background: white !important;
          color: black !important;
          box-shadow: none !important;
        }
      }
    `;
    
    // Insert at the beginning of head for immediate effect
    if (document.head) {
      document.head.insertBefore(styleEl, document.head.firstChild);
    } else {
      // If head doesn't exist yet, wait for it
      document.addEventListener('DOMContentLoaded', function() {
        document.head.insertBefore(styleEl, document.head.firstChild);
      });
    }
  }

  // Load and apply immediately
  const config = loadConfig();
  if (config && config.theme) {
    applyTheme(config);
    console.log('[RiDDiX Theme] Loaded theme:', config.theme);
  }
  
  // Apply branding (logo, name) even if no theme is selected
  if (config && config.customization) {
    applyBranding(config);
    console.log('[RiDDiX Theme] Applied branding customization');
  }
  
  // Apply layout (header navigation) if configured
  if (config && config.layout) {
    applyLayout(config);
    console.log('[RiDDiX Theme] Applied layout:', config.layout.navMode);
  }
})();
