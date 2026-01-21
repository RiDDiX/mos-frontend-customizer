#!/bin/bash
#
# Frontend Customizer - MOS Installer
# Automatically installs the plugin and patches the MOS frontend
#

set -e

PLUGIN_NAME="frontend-customizer"
PLUGIN_DIR="/var/www/mos-plugins"
FRONTEND_DIR="/var/www"
INDEX_FILE="$FRONTEND_DIR/index.html"
BACKUP_FILE="$FRONTEND_DIR/index.html.backup"
LOADER_SCRIPT='<script src="/mos-plugins/frontend-customizer/theme-loader.js"></script>'

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║        Frontend Customizer - MOS Installer v2.2.0         ║"
echo "║     Themes, Branding & Layout Options for MOS             ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Note: MOS runs with appropriate permissions, no sudo needed

# Check if plugin directory exists
if [ ! -d "$PLUGIN_DIR" ]; then
    echo -e "${YELLOW}Creating plugin directory: $PLUGIN_DIR${NC}"
    mkdir -p "$PLUGIN_DIR"
fi

# Check if frontend exists
if [ ! -f "$INDEX_FILE" ]; then
    echo -e "${RED}Error: MOS frontend not found at $FRONTEND_DIR${NC}"
    echo -e "${RED}Make sure MOS is installed correctly.${NC}"
    exit 1
fi

# Install plugin files
echo -e "${GREEN}[1/3] Installing plugin files...${NC}"

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Check if we're running from the extracted archive
if [ -d "$SCRIPT_DIR/frontend-customizer" ]; then
    cp -r "$SCRIPT_DIR/frontend-customizer" "$PLUGIN_DIR/"
    echo -e "      Copied plugin to $PLUGIN_DIR/frontend-customizer"
else
    echo -e "${RED}Error: Plugin files not found. Make sure you extracted the archive correctly.${NC}"
    exit 1
fi

# Set permissions
chmod -R 755 "$PLUGIN_DIR/frontend-customizer"
echo -e "      Set permissions"

# Backup index.html
echo -e "${GREEN}[2/3] Backing up index.html...${NC}"
if [ ! -f "$BACKUP_FILE" ]; then
    cp "$INDEX_FILE" "$BACKUP_FILE"
    echo -e "      Backup created: $BACKUP_FILE"
else
    echo -e "${YELLOW}      Backup already exists, skipping${NC}"
fi

# Patch index.html
echo -e "${GREEN}[3/3] Patching index.html...${NC}"

# Check if already patched
if grep -q "frontend-customizer/theme-loader.js" "$INDEX_FILE"; then
    echo -e "${YELLOW}      Already patched, skipping${NC}"
else
    # Insert the loader script after <head> tag
    sed -i 's|<head>|<head>\n    '"$LOADER_SCRIPT"'|' "$INDEX_FILE"
    echo -e "      Injected theme loader script"
fi

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              Installation Complete!                       ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "Next steps:"
echo -e "  1. Open MOS in your browser"
echo -e "  2. Navigate to ${CYAN}Plugins → Frontend Customizer${NC}"
echo -e "  3. Select a theme and click ${CYAN}Apply Theme${NC}"
echo -e "  4. Customize your MOS experience!"
echo ""
echo -e "${YELLOW}To uninstall:${NC} ./uninstall.sh"
echo ""
