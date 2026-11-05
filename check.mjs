#!/usr/bin/env node
// Regression checks for frontend-customizer.
// Stdlib only, no test framework. Run with: node check.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (rel) => readFileSync(new URL(rel, import.meta.url), 'utf8');

const plugin = read('./page/src/Plugin.vue');
const loader = read('./theme-loader.js');
const settingsRaw = read('./settings.json');

// 1. Routes follow current MOS: plugins under /plugins/:name, tools under /mosTools.
assert.ok(!plugin.includes('/plugin/'), 'Plugin.vue still has a singular /plugin/ route');
assert.ok(!loader.includes('/plugin/'), 'theme-loader.js still has a singular /plugin/ route');
assert.ok(loader.includes("route: '/mosTools/webterminal'") && loader.includes("route: '/mosTools/filebrowser'"), 'menu routes do not match the MOS AppShell');
assert.ok(!loader.includes("'/webTerminal'") && !loader.includes("'/users'"), 'stale pre-2.4 menu routes are back');

// 2. Images: built-in MOS choices, manual URL without Data URLs, uploads via the MOS file API into the plugin's icons dir.
for (const api of ['/api/v1/mos/upload', '/api/v1/mos/fsnavigator', '/api/v1/mos/delete']) {
  assert.ok(plugin.includes(api), `Plugin.vue no longer uses the MOS file API ${api}`);
}
assert.ok(plugin.includes("ICON_DIR = '/var/www/mos-plugins/frontend-customizer/icons'"), 'icon upload directory changed');
assert.ok(plugin.includes("ICON_URL = '/_plugins/frontend-customizer/icons/'"), 'icon URL changed');
const iconName = (plugin.match(/const ICON_NAME = (.*);/) || [])[1];
assert.ok(iconName && !/svg/i.test(iconName), 'ICON_NAME allows SVG uploads, which could run script from the MOS origin');
assert.ok(read('./functions').includes('mkdir -p /var/www/mos-plugins/frontend-customizer/icons'), 'functions install() no longer creates the icons dir');
assert.ok(read('./install.sh').includes('mkdir -p "$PLUGIN_DIR/frontend-customizer/icons"'), 'install.sh no longer creates the icons dir');
assert.ok(!plugin.includes('/plugins/${PLUGIN_NAME}/upload'), 'Plugin.vue calls the dead plugin-scoped upload endpoint');
assert.ok(!plugin.includes('readAsDataURL'), 'Plugin.vue still persists file Data URLs');
assert.ok(plugin.includes('/mos_white.png') && plugin.includes('/mos_black.png'), 'built-in logo choices were dropped');
assert.ok(!plugin.includes('/mos_dark.png'), 'Plugin.vue offers /mos_dark.png, which MOS does not ship');
assert.ok(/const selectManualUrl = [\s\S]*?url\.startsWith\('data:'\)/.test(plugin), 'manual image URL flow permits Data URLs');

// 3. One engine: theme-loader.js applies everything, Plugin.vue only edits and persists.
assert.ok(loader.includes('window.FrontendCustomizer = {'), 'theme-loader.js no longer exposes the engine');
assert.ok(!/applyThemeStyles|applyLayout|applyBranding|riddix-header-nav|headerPlugins/.test(plugin + loader), 'a second style engine or the old header nav is back');
assert.ok(!loader.includes('innerHTML'), 'theme-loader.js builds HTML from config strings');
assert.ok(/const persistConfig = async[\s\S]*?engine\.apply\(config\)/.test(plugin), 'saves no longer apply through the engine');
assert.ok(!plugin.includes('location.reload'), 'plugin page reloads instead of applying live');

// 4. Exactly one settings write path (persistConfig), used by every save flow; failures reach the user.
// The settings endpoint appears only twice: the GET in fetchSettings and the POST in persistConfig.
const settingsUses = plugin.split('/api/v1/mos/plugins/settings/${PLUGIN_NAME}').length - 1;
assert.equal(settingsUses, 2, `expected the settings endpoint only in fetchSettings and persistConfig, found ${settingsUses}`);
const inFn = (name, body) => new RegExp(`const ${name} = async[^\\n]*\\n(?:(?!\\nconst )[\\s\\S])*?${body}`).test(plugin);
const settingsFetch = 'fetch\\(`/api/v1/mos/plugins/settings/\\$\\{PLUGIN_NAME\\}`, \\{\\s*';
assert.ok(inFn('persistConfig', `${settingsFetch}method: 'POST'`), 'persistConfig no longer POSTs the settings');
assert.ok(inFn('fetchSettings', `${settingsFetch}headers: getAuthHeaders\\(\\),\\s*\\}\\)`), 'fetchSettings is no longer a plain GET');
const routed = (plugin.match(/persistConfig\(buildConfig\(\)\)/g) || []).length;
assert.ok(routed >= 10, `expected every save flow to route through persistConfig(buildConfig()), found ${routed}`);
assert.ok(/const persistConfig = async[\s\S]*?if \(res\.ok\)[\s\S]*?saveError\.value = `Server save failed/.test(plugin), 'persistConfig does not report failed server saves');
// theme-loader.js reads only localStorage, so the server copy must be mirrored there on load.
assert.ok(/const fetchSettings = async[\s\S]*?saveToLocalStorage\(buildConfig\(\)\)/.test(plugin), 'fetchSettings does not mirror server settings to localStorage');

// 5. Values from settings/imports are checked before they reach CSS or the DOM.
assert.ok(/function safeUrl\(/.test(loader) && /function hex\(/.test(loader), 'theme-loader.js lost its URL/colour checks');
assert.ok(loader.includes('nocss'), 'custom CSS safe mode (?nocss) missing');
assert.ok(/const normalizeConfig = \(data\)/.test(plugin) && plugin.includes('IMPORT_MAX_BYTES'), 'import is no longer normalised/size-limited');

// 6. settings.json is the install seed: flat flags, full customization, customThemes:[], no legacy options/layout.
const settings = JSON.parse(settingsRaw);
for (const flag of ['enableGlow', 'enableScanlines', 'enableAnimations']) {
  assert.ok(Object.prototype.hasOwnProperty.call(settings, flag), `settings.json missing flat flag ${flag}`);
}
assert.ok(!('options' in settings), 'settings.json still has legacy nested options');
assert.ok(!('layout' in settings), 'settings.json pins layout; the plugin and loader detect the install seed by its missing layout');
assert.ok(Array.isArray(settings.customThemes), 'settings.json customThemes must be an array');
for (const k of ['appName', 'logoUrl', 'primaryColor', 'secondaryColor', 'accentColor', 'buttonColor', 'buttonTextColor']) {
  assert.ok(k in settings.customization, `settings.json customization missing ${k}`);
}

console.log('check.mjs: all regression checks passed');
