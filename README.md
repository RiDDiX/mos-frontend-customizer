# Frontend Customizer for MOS

<p align="center">
  <img src="https://img.shields.io/badge/Version-2.5.0-ff6b00?style=for-the-badge&labelColor=0a0a0a" alt="Version">
  <img src="https://img.shields.io/badge/MOS-Compatible-00d4ff?style=for-the-badge&labelColor=0a0a0a" alt="MOS Compatible">
  <img src="https://img.shields.io/badge/License-MIT-7b68ee?style=for-the-badge&labelColor=0a0a0a" alt="License">
</p>

<p align="center">Themes, branding and layout options for the whole MOS web interface.</p>

## What it is

Frontend Customizer is a plugin for [MOS (Mountain OS)](https://github.com/ich777/mos-frontend) that themes and brands the entire MOS web UI, not just its own page.

- One engine script, `theme-loader.js`, is loaded from `/var/www/index.html`. It applies the theme, branding, appearance, menu and custom CSS on every MOS page, including the login page.
- The settings page is under **Plugins > Frontend Customizer - MOS**.
- Settings are saved on the server through the MOS plugin settings API and mirrored in the browser, so they follow you to every browser you log in with and are applied before MOS draws the page.
- Changes apply live. There's no need to reload.

## Themes

Six themes are built in. Pick one on the Themes tab and press **Apply Theme**.

| Theme | Primary | Secondary | Accent | Background | Surface |
|---|---|---|---|---|---|
| RiDDiX | `#ff6b00` | `#cc5500` | `#ffaa00` | `#0d0d0d` | `#1a1a1a` |
| Hacker | `#00ff41` | `#008f11` | `#39ff14` | `#0d0d0d` | `#1a1a1a` |
| Cyber Blue | `#00d4ff` | `#0066cc` | `#ff00ff` | `#0a0a14` | `#14141e` |
| Matrix | `#00ff00` | `#00aa00` | `#66ff66` | `#000000` | `#0a0a0a` |
| NOS Nitro | `#ff6600` | `#ff3300` | `#ffcc00` | `#0a0505` | `#1a0a0a` |
| Lumina Circuit | `#0057e0` | `#0088cc` | `#7c3aed` | `#f0f4f8` | `#ffffff` |

- **RiDDiX**: the original signature orange tech style.
- **Hacker**: neon green on deep black, classic terminal look.
- **Cyber Blue**: electric blue cyberpunk with magenta accents.
- **Matrix**: pure green terminal on black.
- **NOS Nitro**: orange flames and nitro boost, with rally stripes.
- **Lumina Circuit**: the light theme, clean and bright.

If none of them fits, build your own with the custom theme creator.

## Features

The settings page has five tabs.

### Themes

- Theme cards for the built-in themes and your own. **Apply Theme** activates the selected one, **Reset to Default** goes back to plain MOS.
- Theme options: glow effects, scanline overlay and animations, each with its own switch.
- Custom theme creator: name, description and eight colours (primary, secondary, accent, background, surface, text, button, button text/icon) with a live preview. Saved themes can be edited or deleted.

### Branding

- App name in place of the MOS title in the app bar.
- Logo and browser tab icon, from a URL or the [image picker](#images-and-uploads).
- Browser tab title prefix, for example `My NAS | Dashboard`.
- Login page branding: one switch puts your logo, app name and an optional message on the login page.
- Custom colour overrides for primary, secondary and accent. Leave them empty to keep the theme's colours.
- Button colour and button text/icon colour.

### Appearance

- Background image URL with blur and dim. Leave it empty to keep the theme background.
- Font: System UI, Roboto, Helvetica / Arial, Serif or Monospace.
- UI scale from 80 to 125 %.
- Card style: flat, outlined or glass.
- Corner radius for cards, buttons and alerts, from 0 to 32 px, or the theme default.
- Custom CSS, added after all theme styles on every MOS page. If it breaks something, use [safe mode](#safe-mode).

### Menu

- Hide main menu entries, or reorder them by dragging or with the up and down buttons. Changes show right away and are kept after **Save Menu**.
- The sidebar or header layout and menu groups are MOS settings in your profile. Reordering applies while menu groups are off.

### Backup

- Export all settings as a JSON file, or import one from another server. Only import files you trust: custom CSS in the file runs on every MOS page.
- **Reset Everything** puts all settings back to their defaults.

### Accessibility

Theme cards and the image picker work with the keyboard, icon buttons have labels for screen readers, and animations and transitions are turned off when your system asks for reduced motion.

## Images and uploads

New in 2.5.0. The image button next to the logo, browser tab icon and background image fields opens a picker with:

- the built-in MOS images (for the logo and tab icon),
- a field for a manual URL (http(s) or a path on this server),
- the images you uploaded,
- an **Upload image** button.

Uploads go through the MOS file API into `/var/www/mos-plugins/frontend-customizer/icons` and are served from `/_plugins/frontend-customizer/icons/`.

- Allowed: PNG, JPEG, GIF, WebP and ICO, up to 2 MB each.
- SVG is not accepted, because an SVG served from the MOS origin could run scripts when opened directly.
- Uploads survive plugin updates and are deleted when the plugin is uninstalled.
- Deleting an image in the picker clears every field that used it. Press the tab's save button to store that.

## Installation

### MOS Hub (recommended)

1. Open **MOS Hub** in MOS.
2. Add the template repository `https://github.com/RiDDiX/mos-templates`.
3. Find **Frontend Customizer** and install it.

### Manual

Each release on [GitHub Releases](https://github.com/RiDDiX/mos-frontend-customizer/releases) has three files:

| File | Contents |
|---|---|
| `mos-frontend-customizer-<version>.tar.gz` | Plugin files plus `install.sh` and `uninstall.sh` |
| `mos-frontend-customizer-<version>.tar.gz.md5` | MD5 checksum of the archive |
| `mos-frontend-customizer_<version>_amd64.deb` | Debian package with the same plugin files |

The `latest` release always carries the newest build under the names `mos-frontend-customizer-latest.tar.gz`, `.md5` and `mos-frontend-customizer_latest_amd64.deb`.

The archive has no top-level folder, so extract it into an empty directory and run the installer:

```bash
mkdir -p /tmp/frontend-customizer && cd /tmp/frontend-customizer
wget https://github.com/RiDDiX/mos-frontend-customizer/releases/download/latest/mos-frontend-customizer-latest.tar.gz
tar -xzf mos-frontend-customizer-latest.tar.gz
./install.sh
```

`install.sh` does four things:

- copies the plugin to `/var/www/mos-plugins/frontend-customizer/`,
- backs up `/var/www/index.html` to `/var/www/index.html.backup`, once (an existing backup is left alone),
- inserts the loader tag `<script src="/_plugins/frontend-customizer/theme-loader.js?v=<version>"></script>` right after `<head>`, or updates the version on an existing tag,
- creates the `icons` folder for uploads.

The `.deb` installs the same files and runs the plugin's install hook, which sets the loader tag and creates the `icons` folder.

### Uninstall

Remove the plugin in MOS Hub, or run `./uninstall.sh` from the extracted archive. The script restores the backed-up `index.html` (or removes the loader tag if there is no backup) and deletes `/var/www/mos-plugins/frontend-customizer`, uploaded images included.

## Updating

- **MOS Hub:** update the plugin there. The update hook points the loader tag at the new version.
- **Manual:** extract the new archive into an empty directory and run `./install.sh` again. It overwrites the plugin files, keeps your uploads and updates the loader tag.
- The plugin also checks the loader tag when MOS starts and after an OS update, in case `index.html` was replaced.

**Coming from 2.3.x:** hard-reload once after updating (Ctrl+F5, or Cmd+Shift+R on macOS) so the browser drops the cached old `theme-loader.js`. The plugin's own header navigation and header plugin shortcuts are gone; use the horizontal menu in your MOS profile instead. Hidden menu entries are kept.

## Usage notes

### Safe mode

If custom CSS breaks the UI, add `?nocss` to the URL, for example `http://your-server/plugins/frontend-customizer?nocss`. MOS then loads without your custom CSS, and you can fix or clear it on the Appearance tab.

### Light themes

- The engine also sets Vuetify's theme variables, so MOS's own pages follow the palette of Lumina Circuit and light custom themes too.
- Dashboard chart legends are drawn on a canvas by MOS and keep MOS's colours. This is a known limit.
- The default MOS logos are inverted automatically when they would vanish against a light or dark theme. A custom logo is never touched.

## Development

Build the settings page:

```bash
cd page
npm install
npm run build
```

The build writes `page/dist/frontend-customizer/`, including `remoteEntry.js` and `manifest.json`. The version comes from `page/plugin.config.js`.

Run the regression checks from the repository root (plain Node, no dependencies):

```bash
node check.mjs
```

Releases are built by `.github/workflows/release.yml`. It runs on pushes to `main` that touch `page/`, `theme-loader.js` or `functions`, builds the tar.gz, its .md5 and the .deb, and publishes them as release `v<version>` and as `latest`.

`install.sh`, `uninstall.sh` and `functions` must keep LF line endings (see `.gitattributes`). Pull requests are welcome; please run the build and `node check.mjs` first.

## Project structure

```
mos-frontend-customizer/
├── page/                    # Settings page (Vue, loaded by MOS as a plugin)
│   ├── src/
│   │   ├── Plugin.vue       # Settings page with all tabs and the image picker
│   │   ├── ColorField.vue   # Colour swatch and picker field
│   │   └── main.js          # Standalone entry point
│   ├── plugin.config.js     # Plugin name, version and metadata
│   └── vite.config.js       # Build config, writes manifest.json
├── theme-loader.js          # Engine injected into /var/www/index.html
├── functions                # MOS lifecycle hooks (install, update, uninstall, start)
├── install.sh               # Manual installer
├── uninstall.sh             # Manual uninstaller
├── check.mjs                # Regression checks
└── settings.json            # Default settings
```

## Support

If this plugin is useful to you, you can support its development here.

[![GitHub Sponsors](https://img.shields.io/badge/GitHub-Sponsors-db61a2?style=for-the-badge&logo=githubsponsors&logoColor=white)](https://github.com/sponsors/RiDDiX)
[![PayPal](https://img.shields.io/badge/PayPal-Donate-0070ba?style=for-the-badge&logo=paypal&logoColor=white)](https://www.paypal.me/RiDDiX93)

## License

MIT, see [LICENSE](LICENSE).

## Credits

- Built for [MOS (Mountain OS)](https://github.com/ich777/mos-frontend)
- Made by [RiDDiX](https://riddix.de)
