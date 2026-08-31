#!/usr/bin/env node
// Regression checks for the frontend-customizer config/persistence fix.
// Stdlib only, no test framework. Run with: node check.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (rel) => readFileSync(new URL(rel, import.meta.url), 'utf8');

const plugin = read('./page/src/Plugin.vue');
const loader = read('./theme-loader.js');
const settingsRaw = read('./settings.json');
const configJs = read('./page/plugin.config.js');

// 1. No singular generated /plugin/ routes — current MOS contract is /plugins/:name.
assert.ok(!plugin.includes('/plugin/'), 'Plugin.vue still has a singular /plugin/ route');
assert.ok(!loader.includes('/plugin/'), 'theme-loader.js still has a singular /plugin/ route');
assert.ok(plugin.includes('/plugins/${pluginName}'), 'Plugin.vue lost the /plugins/ header-plugin route');
assert.ok(loader.includes("'/plugins/' + pluginName"), 'theme-loader.js lost the /plugins/ header-plugin route');

// 2. No dead plugin-scoped logo endpoints; built-in choices + manual URL retained; no Data URLs.
for (const dead of ['/upload', '/logos', '/logo?']) {
  assert.ok(!plugin.includes(dead), `Plugin.vue still calls a dead logo endpoint: ${dead}`);
}
assert.ok(!/handleLogoUpload|loadAvailableLogos|deleteLogo/.test(plugin), 'Plugin.vue still references a removed logo action');
assert.ok(!plugin.includes('readAsDataURL'), 'Plugin.vue still persists file Data URLs');
assert.ok(plugin.includes('/mos_white.png') && plugin.includes('/mos_dark.png'), 'built-in logo choices were dropped');
assert.ok(plugin.includes('selectManualLogo'), 'manual-logo-URL flow was dropped');
assert.ok(plugin.includes("logoUrl.startsWith('data:')"), 'manual-logo-URL flow permits Data URLs');

// 3. Exactly one canonical API POST persistence path, used by every save flow.
const postCount = (plugin.match(/method: 'POST'/g) || []).length;
assert.equal(postCount, 1, `expected exactly one POST in Plugin.vue, found ${postCount}`);
assert.ok(/const persistConfig = async \(config\) => \{/.test(plugin), 'missing canonical persistConfig()');
assert.ok(plugin.includes('/api/v1/mos/plugins/settings/${PLUGIN_NAME}'), 'canonical settings endpoint missing');
const routed = (plugin.match(/persistConfig\(buildConfig\(\)\)/g) || []).length;
assert.ok(routed >= 7, `expected every save flow to route through persistConfig(buildConfig()), found ${routed}`);

// 4. Button colors restored on load (normalize spreads the full customization defaults).
const defBlock = plugin.match(/const CUSTOMIZATION_DEFAULTS = \{([\s\S]*?)\};/);
assert.ok(defBlock, 'CUSTOMIZATION_DEFAULTS block not found');
assert.ok(/buttonColor:/.test(defBlock[1]) && /buttonTextColor:/.test(defBlock[1]), 'CUSTOMIZATION_DEFAULTS missing button colors');
assert.ok(plugin.includes('...CUSTOMIZATION_DEFAULTS, ...(data.customization'), 'load normalization does not restore full customization');
assert.ok(/const fetchSettings = async[\s\S]*?applyLoadedConfig\(data\)/.test(plugin), 'fetchSettings does not route through applyLoadedConfig');

// 5. Loader resolves built-in + saved customThemes; no invalid riddix-hacker fallback.
assert.ok(!loader.includes('riddix-hacker'), 'theme-loader.js still has the invalid riddix-hacker fallback');
assert.ok(loader.includes("themes['riddix-theme']"), 'theme-loader.js missing the riddix-theme fallback');
assert.ok(loader.includes('resolveTheme') && loader.includes('customThemes'), 'theme-loader.js does not resolve customThemes');

// 6. settings.json is canonical: flat flags, full customization, customThemes:[], no legacy options/layout.
const settings = JSON.parse(settingsRaw);
for (const flag of ['enableGlow', 'enableScanlines', 'enableAnimations']) {
  assert.ok(Object.prototype.hasOwnProperty.call(settings, flag), `settings.json missing flat flag ${flag}`);
}
assert.ok(!('options' in settings), 'settings.json still has legacy nested options');
assert.ok(!('layout' in settings), 'settings.json still pins layout (runtime defaults should apply)');
assert.ok(Array.isArray(settings.customThemes), 'settings.json customThemes must be an array');
for (const k of ['appName', 'logoUrl', 'primaryColor', 'secondaryColor', 'accentColor', 'buttonColor', 'buttonTextColor']) {
  assert.ok(k in settings.customization, `settings.json customization missing ${k}`);
}

// 7. Canonical plugin version bumped to 2.3.9.
assert.ok(configJs.includes("version: '2.3.9'"), 'plugin.config.js version is not 2.3.9');

console.log('check.mjs: all regression checks passed');
