#!/bin/bash
#
# Frontend Customizer - MOS Uninstaller
# Removes the plugin and restores the original index.html
#

set -e

PLUGIN_NAME="frontend-customizer"
PLUGIN_DIR="/var/www/mos-plugins"
FRONTEND_DIR="/var/www"
INDEX_FILE="$FRONTEND_DIR/index.html"
BACKUP_FILE="$FRONTEND_DIR/index.html.backup"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║       Frontend Customizer - MOS Uninstaller               ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Note: MOS runs with appropriate permissions, no sudo needed

# Remove theme loader from index.html
echo -e "${GREEN}[1/3] Removing theme loader from index.html...${NC}"
if [ -f "$BACKUP_FILE" ]; then
    cp "$BACKUP_FILE" "$INDEX_FILE"
    rm "$BACKUP_FILE"
    echo -e "      Restored original index.html"
else
    # Manual removal if no backup exists
    sed -i '/frontend-customizer\/theme-loader.js/d' "$INDEX_FILE"
    echo -e "      Removed theme loader script"
fi

# Remove plugin directory
echo -e "${GREEN}[2/3] Removing plugin files...${NC}"
if [ -d "$PLUGIN_DIR/$PLUGIN_NAME" ]; then
    rm -rf "$PLUGIN_DIR/$PLUGIN_NAME"
    echo -e "      Removed $PLUGIN_DIR/$PLUGIN_NAME"
else
    echo -e "${YELLOW}      Plugin directory not found, skipping${NC}"
fi

# Clear localStorage reminder
echo -e "${GREEN}[3/3] Cleanup notes...${NC}"
echo -e "      To fully remove the theme, clear your browser's localStorage"
echo -e "      or open DevTools > Application > Local Storage > Clear"

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              Uninstallation Complete!                     ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "Frontend Customizer has been removed from your MOS installation."
echo -e "Refresh your browser to see the default MOS theme."
echo ""
