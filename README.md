# 🎨 Frontend Customizer - MOS

<p align="center">
  <img src="https://img.shields.io/badge/Version-2.2.0-ff6b00?style=for-the-badge&labelColor=0a0a0a" alt="Version">
  <img src="https://img.shields.io/badge/MOS-Compatible-00d4ff?style=for-the-badge&labelColor=0a0a0a" alt="MOS Compatible">
  <img src="https://img.shields.io/badge/License-MIT-7b68ee?style=for-the-badge&labelColor=0a0a0a" alt="License">
</p>

<p align="center">
  <strong>🔥 Advanced Frontend Customizer for MOS 🔥</strong>
</p>

<p align="center">
  <em>Your Style. Your System.</em>
</p>

---

## 🎨 Themes Included

### 1. RiDDiX 🟠
The signature theme - Orange tech style by [riddix.de](https://riddix.de).

- **Primary:** `#ff6b00` (RiDDiX Orange)
- **Secondary:** `#cc5500` (Deep Orange)
- **Accent:** `#ffaa00` (Gold)
- **Background:** `#0d0d0d` (Deep Black)

### 2. Hacker 💚
Classic neon green on deep black - terminal vibes.

- **Primary:** `#00ff41` (Matrix Green)
- **Secondary:** `#008f11` (Dark Green)
- **Accent:** `#00ff41` (Neon Green)
- **Background:** `#0d0d0d` (Deep Black)

### 3. Cyber Blue 💙
Electric blue cyberpunk vibes for those who prefer a cooler palette.

- **Primary:** `#00d4ff` (Electric Blue)
- **Secondary:** `#0066cc` (Deep Blue)
- **Accent:** `#ff00ff` (Magenta)
- **Background:** `#0a0a14` (Dark Blue)

### 4. Matrix 🟢
Pure green terminal experience - Enter the Matrix.

- **Primary:** `#00ff00` (Pure Green)
- **Secondary:** `#003300` (Dark Green)
- **Accent:** `#00ff00` (Matrix Green)
- **Background:** `#000000` (Pure Black)

### 5. NOS Nitro 🔥
Blazing fast racing aesthetic with rally stripes!

- **Primary:** `#ff6600` (Nitro Orange)
- **Secondary:** `#ff3300` (Flame Red)
- **Accent:** `#ffcc00` (Racing Yellow)
- **Background:** `#0a0505` (Charred Black)
- **Special:** Rally Stripes Effect

### 6. Lumina Circuit 💡
Clean, bright, precision engineering - The ultimate light theme.

- **Primary:** `#0066ff` (Electric Blue)
- **Secondary:** `#00a8e8` (Sky Cyan)
- **Accent:** `#7c3aed` (Tech Purple)
- **Background:** `#f0f4f8` (Cloud White)
- **Surface:** `#ffffff` (Pure White)

---

## ✨ Features

- 🌟 **Glow Effects** - Neon glow on buttons, cards, and interactive elements
- 📺 **Scanline Overlay** - Subtle CRT-style scanlines for authenticity
- 🎯 **Terminal-Style Inputs** - Monospace fonts and bordered inputs
- 🔲 **Cyber Cards** - Gradient backgrounds with glowing borders
- 📊 **Matrix Tables** - Styled data tables with hover effects
- 🎚️ **Custom Scrollbars** - Themed scrollbars matching the aesthetic
- ⚡ **Smooth Animations** - Pulse and glow animations

---

## 📦 Installation

### Via MOS Hub (Recommended)

1. Open MOS Hub in your browser
2. Add this template repository: `https://github.com/RiDDiX/mos-templates`
3. Find "Frontend Customizer" and click Install

### Manual Installation

```bash
cd /tmp
wget https://github.com/RiDDiX/mos-frontend-customizer/releases/latest/download/mos-frontend-customizer.tar.gz
tar -xzf mos-frontend-customizer.tar.gz
./install.sh
```

The installer will:
- Copy plugin files to `/var/www/mos-plugins/frontend-customizer/`
- Backup the original `index.html`
- Inject the theme loader script automatically

### Alternative Manual Installation

```bash
mkdir -p /var/www/mos-plugins/frontend-customizer
cd /var/www/mos-plugins/frontend-customizer
wget https://github.com/RiDDiX/mos-frontend-customizer/releases/latest/download/mos-frontend-customizer.tar.gz
tar -xzf mos-frontend-customizer.tar.gz
```

Then add this line to `/var/www/index.html` inside the `<head>` tag:

```html
<script src="/mos-plugins/frontend-customizer/theme-loader.js"></script>
```

---

## 🚀 Usage

Once installed, the theme plugin will appear in the MOS plugin list. Navigate to:

**Plugins → RiDDiX Theme**

From there you can:
- Select and preview different themes
- Enable/disable glow effects
- Enable/disable scanline overlay
- Enable/disable animations

## 📁 Project Structure

```
mos-theme-riddix/
├── page/                    # Vue plugin source
│   ├── src/
│   │   ├── Plugin.vue       # Main plugin component
│   │   └── main.js          # Entry point
│   ├── plugin.config.js     # Plugin metadata
│   ├── vite.config.js       # Build configuration
│   └── package.json
├── settings.json            # Default settings
├── README.md
└── LICENSE
```

## 🎯 Theme Colors

| Theme | Primary | Secondary | Accent | Background |
|-------|---------|-----------|--------|------------|
| RiDDiX | `#ff6b00` | `#cc5500` | `#ffaa00` | `#0d0d0d` |
| Hacker | `#00ff41` | `#008f11` | `#00ff41` | `#0d0d0d` |
| Cyber Blue | `#00d4ff` | `#0066cc` | `#ff00ff` | `#0a0a14` |
| Matrix | `#00ff00` | `#003300` | `#00ff00` | `#000000` |
| NOS Nitro | `#ff6600` | `#ff3300` | `#ffcc00` | `#0a0505` |
| Lumina Circuit | `#0066ff` | `#00a8e8` | `#7c3aed` | `#f0f4f8` |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Credits

- Inspired by [riddix.de](https://riddix.de)
- Built for [MOS (Mountain OS)](https://github.com/ich777/mos-frontend)
- Created by RiDDiX

---

<p align="center">
  <strong>「 Code. Deploy. Repeat. 」</strong>

<p align="center">
  Made with 💚 for the MOS community
</p>
