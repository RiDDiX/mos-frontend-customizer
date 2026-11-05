<template>
  <div>
    <div class="mb-4">
      <h2>Frontend Customizer</h2>
      <div class="d-flex align-center ga-2 text-body-2 text-medium-emphasis">
        <v-chip size="x-small" label>v{{ pluginVersion }}</v-chip>
        <span>Active theme: {{ activeThemeName }}</span>
      </div>
    </div>
    <v-skeleton-loader v-if="loading" :loading="true" type="card, card" />
    <div v-else>
      <v-tabs v-model="tab" color="primary" class="mb-4" show-arrows>
        <v-tab v-for="t in TABS" :key="t.value" :value="t.value" :prepend-icon="t.icon">{{ t.title }}</v-tab>
      </v-tabs>
      <v-window v-model="tab" :touch="false">
      <v-window-item value="themes">
      <v-card class="mb-4 pa-0">
        <v-card-title>
          <v-icon class="mr-2">mdi-palette</v-icon>
          Theme Selection
        </v-card-title>
        <v-card-text class="pa-4">
          <v-row>
            <v-col
              v-for="theme in allThemes"
              :key="theme.id"
              cols="12"
              md="4"
            >
              <v-card
                :class="[
                  'theme-card',
                  { 'theme-card--active': selectedTheme === theme.id }
                ]"
                :style="{
                  '--card-border': selectedTheme === theme.id
                    ? `2px solid ${theme.primary}`
                    : '2px solid transparent',
                  '--card-bg': theme.background
                }"
                tabindex="0"
                role="button"
                :aria-pressed="selectedTheme === theme.id"
                @click="selectTheme(theme.id)"
                @keydown.enter.self.prevent="selectTheme(theme.id)"
                @keydown.space.self.prevent="selectTheme(theme.id)"
              >
                <v-card-text class="text-center pa-4">
                  <v-icon
                    :color="theme.primary"
                    size="48"
                    class="mb-2"
                  >
                    {{ theme.icon }}
                  </v-icon>
                  <h3 :style="{ color: theme.primary }">{{ theme.name }}</h3>
                  <p class="text-caption mt-2" :style="{ color: theme.textColor || (theme.isLight ? '#000000' : '#e0e0e0') }">
                    {{ theme.description }}
                  </p>
                  <div class="color-preview mt-3">
                    <span
                      v-for="color in [theme.primary, theme.secondary, theme.accent]"
                      :key="color"
                      class="color-dot"
                      :style="{ backgroundColor: color }"
                    />
                  </div>
                  <v-chip
                    v-if="currentTheme === theme.id"
                    size="small"
                    color="success"
                    class="mt-3"
                  >
                    Active
                  </v-chip>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn
            color="error"
            variant="outlined"
            :disabled="!currentTheme"
            @click="resetTheme"
          >
            Reset to Default
          </v-btn>
          <v-btn
            color="primary"
            :loading="saving"
            :disabled="selectedTheme === currentTheme"
            @click="applyTheme"
          >
            Apply Theme
          </v-btn>
        </v-card-actions>
      </v-card>

      <v-card class="mb-4 pa-0">
        <v-card-title>
          <v-icon class="mr-2">mdi-cog</v-icon>
          Theme Options
        </v-card-title>
        <v-card-text class="pa-4">
          <v-switch
            v-model="options.enableGlow"
            label="Enable Glow Effects"
            color="primary"
            hide-details
            class="mb-2"
          />
          <v-switch
            v-model="options.enableScanlines"
            label="Enable Scanline Overlay"
            color="primary"
            hide-details
            class="mb-2"
          />
          <v-switch
            v-model="options.enableAnimations"
            label="Enable Animations"
            color="primary"
            hide-details
          />
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn
            color="primary"
            :loading="savingOptions"
            @click="saveOptions"
          >
            Save Options
          </v-btn>
        </v-card-actions>
      </v-card>

      <!-- Custom Theme Creator -->
      <v-card class="mb-4 pa-0">
        <v-card-title>
          <v-icon class="mr-2">mdi-palette-swatch</v-icon>
          Custom Themes
          <v-spacer />
          <v-btn
            v-if="!showThemeEditor"
            color="primary"
            size="small"
            prepend-icon="mdi-plus"
            @click="openThemeEditor()"
          >
            Create Theme
          </v-btn>
        </v-card-title>
        <v-card-text class="pa-4">
          <!-- Theme Editor -->
          <div v-if="showThemeEditor">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="themeEditor.name"
                  label="Theme Name"
                  placeholder="My Custom Theme"
                  prepend-inner-icon="mdi-format-title"
                  variant="outlined"
                  density="comfortable"
                  :rules="[v => !!v || 'Name is required']"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="themeEditor.description"
                  label="Description"
                  placeholder="A short description..."
                  prepend-inner-icon="mdi-text"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
            </v-row>
            
            <v-divider class="my-3" />
            <div class="text-subtitle-2 mb-3">Colors</div>
            
            <v-row>
              <v-col cols="12" md="4">
                <ColorField v-model="themeEditor.primary" label="Primary" inputs />
              </v-col>
              <v-col cols="12" md="4">
                <ColorField v-model="themeEditor.secondary" label="Secondary" inputs />
              </v-col>
              <v-col cols="12" md="4">
                <ColorField v-model="themeEditor.accent" label="Accent" inputs />
              </v-col>
            </v-row>

            <v-row class="mt-2">
              <v-col cols="12" md="4">
                <ColorField v-model="themeEditor.background" label="Background" inputs />
              </v-col>
              <v-col cols="12" md="4">
                <ColorField v-model="themeEditor.surface" label="Surface" inputs />
              </v-col>
              <v-col cols="12" md="4">
                <ColorField v-model="themeEditor.textColor" label="Text Color" inputs />
              </v-col>
            </v-row>

            <v-divider class="my-3" />
            <div class="text-subtitle-2 mb-3">Button Colors</div>

            <v-row>
              <v-col cols="12" md="6">
                <ColorField v-model="themeEditor.buttonColor" label="Button Color" inputs />
              </v-col>
              <v-col cols="12" md="6">
                <ColorField v-model="themeEditor.buttonTextColor" label="Button Text/Icon Color" placeholder="auto" inputs />
              </v-col>
            </v-row>
            
            <v-divider class="my-4" />
            
            <!-- Live Preview -->
            <div class="text-subtitle-2 mb-2">Preview</div>
            <div 
              class="theme-preview pa-4 rounded"
              :style="{
                background: themeEditor.background,
                border: '1px solid ' + themeEditor.primary + '33'
              }"
            >
              <div class="d-flex align-center mb-3">
                <v-icon :color="themeEditor.primary" class="mr-2">mdi-palette</v-icon>
                <span :style="{ color: themeEditor.primary, fontWeight: 'bold' }">{{ themeEditor.name || 'Theme Name' }}</span>
              </div>
              <div class="d-flex ga-2 mb-3">
                <v-chip size="small" :color="themeEditor.primary">Primary</v-chip>
                <v-chip size="small" :color="themeEditor.secondary">Secondary</v-chip>
                <v-chip size="small" :color="themeEditor.accent">Accent</v-chip>
              </div>
              <div 
                class="pa-2 rounded"
                :style="{ background: themeEditor.surface, color: themeEditor.textColor }"
              >
                Sample text on surface
              </div>
            </div>
            
            <div class="d-flex justify-end mt-4 ga-2">
              <v-btn variant="text" @click="closeThemeEditor">Cancel</v-btn>
              <v-btn 
                color="primary" 
                :loading="savingCustomTheme"
                :disabled="!themeEditor.name"
                @click="saveCustomTheme"
              >
                {{ editingThemeId ? 'Update Theme' : 'Save Theme' }}
              </v-btn>
            </div>
          </div>
          
          <!-- Custom Themes List -->
          <div v-else>
            <div v-if="customThemes.length === 0" class="text-center py-6 text-medium-emphasis">
              <v-icon size="48" class="mb-2">mdi-palette-outline</v-icon>
              <div>No custom themes yet</div>
              <div class="text-caption">Click "Create Theme" to design your own!</div>
            </div>
            <v-row v-else>
              <v-col 
                v-for="theme in customThemes" 
                :key="theme.id" 
                cols="12" 
                md="4"
              >
                <v-card
                  :class="['theme-card', { 'theme-card--active': selectedTheme === theme.id }]"
                  :style="{
                    '--card-border': selectedTheme === theme.id ? '2px solid ' + theme.primary : '2px solid transparent',
                    '--card-bg': theme.background
                  }"
                >
                  <v-card-text class="text-center pa-3">
                    <div
                      tabindex="0"
                      role="button"
                      :aria-pressed="selectedTheme === theme.id"
                      @click="selectTheme(theme.id)"
                      @keydown.enter.prevent="selectTheme(theme.id)"
                      @keydown.space.prevent="selectTheme(theme.id)"
                    >
                      <v-icon :color="theme.primary" size="32" class="mb-1">mdi-palette</v-icon>
                      <h4 :style="{ color: theme.primary }">{{ theme.name }}</h4>
                      <p class="text-caption mt-1" :style="{ color: theme.textColor }">{{ theme.description }}</p>
                      <div class="color-preview mt-2">
                        <span v-for="c in [theme.primary, theme.secondary, theme.accent]" :key="c" class="color-dot" :style="{ backgroundColor: c }" />
                      </div>
                    </div>
                    <div class="mt-2">
                      <v-btn icon variant="text" :aria-label="`Edit ${theme.name}`" @click="editCustomTheme(theme)">
                        <v-icon size="16">mdi-pencil</v-icon>
                      </v-btn>
                      <v-btn icon variant="text" color="error" :aria-label="`Delete ${theme.name}`" @click="deleteCustomTheme(theme.id)">
                        <v-icon size="16">mdi-delete</v-icon>
                      </v-btn>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </div>
        </v-card-text>
      </v-card>
      </v-window-item>

      <v-window-item value="branding">
      <v-card class="mb-4 pa-0">
        <v-card-title>
          <v-icon class="mr-2">mdi-tune</v-icon>
          Customization
        </v-card-title>
        <v-card-text class="pa-4">
          <v-row>
            <v-col cols="12">
              <div class="text-subtitle-2 mb-2">Branding</div>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="customization.appName"
                label="App Name"
                placeholder="MOS"
                hint="Replace the MOS title in the app bar"
                persistent-hint
                prepend-inner-icon="mdi-format-title"
                variant="outlined"
                density="comfortable"
              />
            </v-col>
            <v-col cols="12" md="6">
              <div class="logo-upload-section">
                <v-text-field
                  v-model="customization.logoUrl"
                  label="Logo URL"
                  placeholder="/mos_white.png"
                  hint="Enter a URL, or choose or upload an image"
                  persistent-hint
                  prepend-inner-icon="mdi-image"
                  variant="outlined"
                  density="comfortable"
                >
                  <template v-slot:append>
                    <v-btn
                      icon
                      size="small"
                      variant="text"
                      aria-label="Choose logo"
                      @click="openPicker('logo')"
                    >
                      <v-icon>mdi-folder-image</v-icon>
                    </v-btn>
                  </template>
                </v-text-field>

                <!-- Logo Preview -->
                <div v-if="customization.logoUrl" class="logo-preview mt-2">
                  <v-img
                    :src="customization.logoUrl"
                    max-height="60"
                    max-width="200"
                    contain
                    class="rounded image-bg"
                    style="padding: 8px;"
                  />
                </div>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="customization.faviconUrl"
                label="Browser Tab Icon URL"
                placeholder="/mos_icon.svg"
                hint="http(s) URL or path on this server"
                persistent-hint
                prepend-inner-icon="mdi-star-box-outline"
                variant="outlined"
                density="comfortable"
              >
                <template v-slot:append>
                  <v-btn
                    icon
                    size="small"
                    variant="text"
                    aria-label="Choose browser tab icon"
                    @click="openPicker('favicon')"
                  >
                    <v-icon>mdi-folder-image</v-icon>
                  </v-btn>
                </template>
              </v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="customization.titlePrefix"
                label="Browser Tab Title Prefix"
                placeholder="My NAS"
                hint="Shown before the page title, e.g. My NAS | Dashboard"
                persistent-hint
                prepend-inner-icon="mdi-tab"
                variant="outlined"
                density="comfortable"
                maxlength="32"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-switch
                v-model="customization.loginBranding"
                label="Use logo, app name and message on the login page"
                color="primary"
                hide-details
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="customization.loginMessage"
                :disabled="!customization.loginBranding"
                label="Login Page Message"
                placeholder="Welcome back"
                prepend-inner-icon="mdi-message-text-outline"
                variant="outlined"
                density="comfortable"
                maxlength="200"
                hide-details
              />
            </v-col>
          </v-row>

          <v-divider class="my-4" />
          
          <v-row>
            <v-col cols="12">
              <div class="text-subtitle-2 mb-2">Custom Colors (Optional Override)</div>
              <p class="text-caption text-medium-emphasis mb-3">
                Leave empty to use the theme's default colors
              </p>
            </v-col>
            <v-col cols="12" md="4">
              <ColorField
                v-model="customization.primaryColor"
                label="Primary Color"
                placeholder="#00ff41"
                :fallback="getCurrentTheme()?.primary || '#00ff41'"
              />
            </v-col>
            <v-col cols="12" md="4">
              <ColorField
                v-model="customization.secondaryColor"
                label="Secondary Color"
                placeholder="#008f11"
                :fallback="getCurrentTheme()?.secondary || '#008f11'"
              />
            </v-col>
            <v-col cols="12" md="4">
              <ColorField
                v-model="customization.accentColor"
                label="Accent Color"
                placeholder="#00ff41"
                :fallback="getCurrentTheme()?.accent || '#00ff41'"
              />
            </v-col>
          </v-row>
          
          <v-divider class="my-4" />
          
          <v-row>
            <v-col cols="12">
              <div class="text-subtitle-2 mb-2">Button Colors</div>
              <p class="text-caption text-medium-emphasis mb-3">
                Customize button background and icon/text colors
              </p>
            </v-col>
            <v-col cols="12" md="6">
              <ColorField
                v-model="customization.buttonColor"
                label="Button Color"
                placeholder="#00ff41"
                :fallback="getCurrentTheme()?.buttonColor || getCurrentTheme()?.primary || '#00ff41'"
              />
            </v-col>
            <v-col cols="12" md="6">
              <ColorField
                v-model="customization.buttonTextColor"
                label="Button Text/Icon Color"
                placeholder="#ffffff"
                :fallback="getCurrentTheme()?.buttonTextColor || '#ffffff'"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4">
          <v-btn
            variant="text"
            @click="resetCustomization"
          >
            Reset to Defaults
          </v-btn>
          <v-spacer />
          <v-btn
            color="primary"
            :loading="savingCustomization"
            @click="saveCustomization"
          >
            Save Customization
          </v-btn>
        </v-card-actions>
      </v-card>
      </v-window-item>

      <v-window-item value="appearance">
      <v-card class="mb-4 pa-0">
        <v-card-title>
          <v-icon class="mr-2">mdi-image-filter-hdr</v-icon>
          Appearance
        </v-card-title>
        <v-card-text class="pa-4">
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="appearance.backgroundUrl"
                label="Background Image URL"
                placeholder="https://example.com/wallpaper.jpg"
                hint="http(s) URL or path on this server. Empty keeps the theme background."
                persistent-hint
                prepend-inner-icon="mdi-image"
                variant="outlined"
                density="comfortable"
                clearable
              >
                <template v-slot:append>
                  <v-btn
                    icon
                    size="small"
                    variant="text"
                    aria-label="Choose background image"
                    @click="openPicker('background')"
                  >
                    <v-icon>mdi-folder-image</v-icon>
                  </v-btn>
                </template>
              </v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-slider
                v-model="appearance.backgroundBlur"
                :disabled="!appearance.backgroundUrl"
                label="Background Blur"
                :min="0"
                :max="20"
                :step="1"
                thumb-label
                color="primary"
                hide-details
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-slider
                v-model="appearance.backgroundDim"
                :disabled="!appearance.backgroundUrl"
                label="Background Dim (%)"
                :min="0"
                :max="80"
                :step="5"
                thumb-label
                color="primary"
                hide-details
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="appearance.fontFamily"
                :items="fontOptions"
                label="Font"
                prepend-inner-icon="mdi-format-font"
                variant="outlined"
                density="comfortable"
                hide-details
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-slider
                v-model="appearance.uiScale"
                label="UI Scale (%)"
                :min="80"
                :max="125"
                :step="5"
                thumb-label
                color="primary"
                hide-details
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="appearance.cardStyle"
                :items="cardStyleOptions"
                label="Card Style"
                prepend-inner-icon="mdi-card-outline"
                variant="outlined"
                density="comfortable"
                hide-details
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="radiusModel"
                :items="radiusOptions"
                label="Corner Radius (cards, buttons, alerts)"
                prepend-inner-icon="mdi-rounded-corner"
                variant="outlined"
                density="comfortable"
                hide-details
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4">
          <v-btn
            variant="text"
            @click="resetAppearance"
          >
            Reset to Defaults
          </v-btn>
          <v-spacer />
          <v-btn
            color="primary"
            :loading="savingAppearance"
            @click="saveAppearance"
          >
            Save Appearance
          </v-btn>
        </v-card-actions>
      </v-card>

      <v-card class="mb-4 pa-0">
        <v-card-title>
          <v-icon class="mr-2">mdi-language-css3</v-icon>
          Custom CSS
        </v-card-title>
        <v-card-text class="pa-4">
          <p class="text-caption text-medium-emphasis mb-3">
            Added after all theme styles on every MOS page, including the login page.
            If something breaks, open MOS with <code>?nocss</code> at the end of the URL to load it without this CSS.
          </p>
          <v-textarea
            v-model="appearance.customCss"
            label="CSS"
            placeholder=".v-app-bar { border-bottom: 2px solid #ff6b00; }"
            rows="8"
            auto-grow
            variant="outlined"
            spellcheck="false"
            class="custom-css-input"
            :maxlength="CUSTOM_CSS_MAX"
            counter
          />
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn
            color="primary"
            :loading="savingAppearance"
            @click="saveAppearance"
          >
            Save CSS
          </v-btn>
        </v-card-actions>
      </v-card>
      </v-window-item>

      <v-window-item value="menu">
      <v-card class="mb-4 pa-0">
        <v-card-title>
          <v-icon class="mr-2">mdi-menu</v-icon>
          Menu
        </v-card-title>
        <v-card-text class="pa-4">
          <p class="text-caption text-medium-emphasis mb-3">
            Hide or drag to reorder the main menu entries. Changes show right away and are kept after "Save Menu".
            Sidebar or header menu and menu groups are MOS settings in your profile; reordering applies while menu groups are off.
          </p>
          <div class="menu-order-list">
            <div
              v-for="(item, index) in menuOrder"
              :key="item.id"
              class="menu-order-item d-flex align-center pa-2 mb-1 rounded"
              draggable="true"
              @dragstart="onDragStart($event, index)"
              @dragover.prevent
              @drop="onDrop($event, index)"
              :style="{
                background: 'rgba(var(--v-theme-primary), 0.1)',
                border: '1px solid rgba(var(--v-theme-primary), 0.3)',
                cursor: 'grab'
              }"
            >
              <v-icon size="small" class="mr-2 drag-handle">mdi-drag</v-icon>
              <v-icon size="small" class="mr-2">{{ item.icon }}</v-icon>
              <span class="text-body-2">{{ item.title }}</span>
              <v-spacer />
              <v-btn
                icon
                variant="text"
                :disabled="index === 0"
                :aria-label="`Move ${item.title} up`"
                @click="moveMenuItem(index, -1)"
              >
                <v-icon>mdi-chevron-up</v-icon>
              </v-btn>
              <v-btn
                icon
                variant="text"
                class="mr-2"
                :disabled="index === menuOrder.length - 1"
                :aria-label="`Move ${item.title} down`"
                @click="moveMenuItem(index, 1)"
              >
                <v-icon>mdi-chevron-down</v-icon>
              </v-btn>
              <v-switch
                :model-value="item.visible"
                @update:model-value="toggleMenuItemVisibility(item)"
                :aria-label="`Show ${item.title} in the menu`"
                hide-details
                density="compact"
                color="primary"
              />
            </div>
          </div>
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4">
          <v-btn
            variant="text"
            @click="resetMenu"
          >
            Reset Menu
          </v-btn>
          <v-spacer />
          <v-btn
            color="primary"
            :loading="savingMenu"
            @click="saveMenu"
          >
            Save Menu
          </v-btn>
        </v-card-actions>
      </v-card>
      </v-window-item>

      <v-window-item value="backup">
      <v-card class="mb-4 pa-0">
        <v-card-title>
          <v-icon class="mr-2">mdi-backup-restore</v-icon>
          Backup
        </v-card-title>
        <v-card-text class="pa-4">
          <p class="text-caption text-medium-emphasis">
            Export all settings as a JSON file, or import one from another server.
            Only import files you trust: custom CSS in the file runs on every MOS page.
          </p>
          <input
            ref="importInput"
            type="file"
            accept="application/json,.json"
            style="display: none"
            @change="importSettings"
          />
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4">
          <v-btn
            color="error"
            variant="text"
            @click="resetAll"
          >
            Reset Everything
          </v-btn>
          <v-spacer />
          <v-btn
            variant="outlined"
            prepend-icon="mdi-upload"
            @click="importInput.click()"
          >
            Import
          </v-btn>
          <v-btn
            color="primary"
            prepend-icon="mdi-download"
            @click="exportSettings"
          >
            Export
          </v-btn>
        </v-card-actions>
      </v-card>

      <v-card class="pa-0">
        <v-card-title>
          <v-icon class="mr-2">mdi-information</v-icon>
          About
        </v-card-title>
        <v-card-text class="pa-4">
          <v-row density="compact">
            <v-col cols="6" md="3">
              <div class="text-caption text-medium-emphasis"><strong>Version</strong></div>
              <div class="text-body-2">{{ pluginVersion }}</div>
            </v-col>
            <v-col cols="6" md="3">
              <div class="text-caption text-medium-emphasis"><strong>Author</strong></div>
              <div class="text-body-2">RiDDiX</div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="text-caption text-medium-emphasis"><strong>Homepage</strong></div>
              <div class="text-body-2">
                <a href="https://riddix.de" target="_blank" class="text-primary">riddix.de</a>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
      </v-window-item>
      </v-window>
    </div>

    <!-- One image picker for logo, tab icon and background -->
    <v-dialog v-model="showPicker" max-width="600">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2">mdi-image-multiple</v-icon>
          Choose {{ IMAGE_FIELDS[pickerTarget].label }}
          <v-spacer />
          <v-btn icon variant="text" aria-label="Close" @click="showPicker = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-4">
          <v-text-field
            v-model="manualUrl"
            label="Enter URL manually"
            placeholder="https://example.com/image.png or /path/to/image.png"
            variant="outlined"
            density="compact"
            class="mb-2"
            prepend-inner-icon="mdi-link"
          >
            <template v-slot:append>
              <v-btn
                color="primary"
                size="small"
                :disabled="!manualUrl"
                @click="selectManualUrl"
              >
                Use
              </v-btn>
            </template>
          </v-text-field>
          <v-btn
            variant="outlined"
            prepend-icon="mdi-upload"
            class="mb-4"
            :loading="uploadingIcon"
            @click="iconInput.click()"
          >
            Upload image
          </v-btn>
          <input
            ref="iconInput"
            type="file"
            accept="image/*"
            style="display: none"
            @change="onIconFile"
          />

          <template v-if="builtInImages.length">
            <div class="text-subtitle-2 mb-2">Built-in</div>
            <v-row density="compact" class="mb-2">
              <v-col v-for="logo in builtInImages" :key="logo.path" cols="4" sm="3">
                <v-card
                  class="logo-card pa-2"
                  :class="{ selected: pickerValue === logo.path }"
                  hover
                  tabindex="0"
                  role="button"
                  :aria-pressed="pickerValue === logo.path"
                  @click="pickImage(logo.path)"
                  @keydown.enter.prevent="pickImage(logo.path)"
                  @keydown.space.prevent="pickImage(logo.path)"
                >
                  <v-img :src="logo.path" height="60" contain class="rounded image-bg" />
                  <div class="text-caption text-truncate text-center mt-1">{{ logo.name }}</div>
                </v-card>
              </v-col>
            </v-row>
          </template>

          <div class="text-subtitle-2 mb-2">Uploaded</div>
          <div v-if="!uploadedIcons.length" class="text-caption text-medium-emphasis">
            Nothing uploaded yet.
          </div>
          <v-row v-else density="compact">
            <v-col v-for="icon in uploadedIcons" :key="icon.name" cols="4" sm="3">
              <v-card
                class="logo-card pa-2"
                :class="{ selected: pickerValue === icon.url }"
                hover
              >
                <v-img
                  :src="icon.url"
                  height="60"
                  contain
                  class="rounded image-bg"
                  tabindex="0"
                  role="button"
                  :aria-label="`Use ${icon.name}`"
                  :aria-pressed="pickerValue === icon.url"
                  @click="pickImage(icon.url)"
                  @keydown.enter.prevent="pickImage(icon.url)"
                  @keydown.space.prevent="pickImage(icon.url)"
                />
                <div class="d-flex align-center mt-1">
                  <span class="text-caption text-truncate flex-grow-1">{{ icon.name }}</span>
                  <v-btn
                    icon
                    variant="text"
                    color="error"
                    :aria-label="`Delete ${icon.name}`"
                    :loading="deletingIcon === icon.name"
                    :disabled="!!deletingIcon"
                    @click="deleteIcon(icon)"
                  >
                    <v-icon size="16">mdi-delete</v-icon>
                  </v-btn>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4">
          <v-btn variant="text" @click="pickImage('')">
            <v-icon class="mr-1">mdi-close-circle</v-icon>
            Clear
          </v-btn>
          <v-spacer />
          <v-btn color="primary" @click="showPicker = false">
            Done
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar :model-value="!!saveError" @update:model-value="saveError = ''" color="error" :timeout="8000">
      {{ saveError }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import ColorField from './ColorField.vue';

const PLUGIN_NAME = 'frontend-customizer';
const STORAGE_KEY = 'frontend-customizer-config';
const ENGINE_SRC = '/_plugins/frontend-customizer/theme-loader.js';
const pluginVersion = typeof __PLUGIN_VERSION__ !== 'undefined' ? __PLUGIN_VERSION__ : '1.0.0';

// theme-loader.js is the one engine that applies everything; built-in themes and menu entries come from it.
let engine = null;
const builtInThemes = ref([]);
const menuItems = ref([]);

let engineError = 'theme-loader.js could not be loaded. Reinstall the plugin, then reload this page.';

const loadEngine = () => new Promise((resolve) => {
  if (window.FrontendCustomizer) {
    resolve(window.FrontendCustomizer);
    return;
  }
  const stale = () => {
    engineError = 'Your browser still has an old theme-loader.js in its cache. Do a hard reload (Ctrl+F5 / Cmd+Shift+R) or clear the site cache, then reopen this page.';
    resolve(null);
  };
  // No global means the browser ran a stale cached 2.3.x loader; injecting it again would hang the page.
  if (document.querySelector('script[src*="frontend-customizer/theme-loader.js"]')) {
    stale();
    return;
  }
  // index.html normally loads it; load it here if that tag is missing.
  const script = document.createElement('script');
  script.src = `${ENGINE_SRC}?v=${pluginVersion}`;
  script.onload = () => (window.FrontendCustomizer ? resolve(window.FrontendCustomizer) : stale());
  script.onerror = () => resolve(null);
  document.head.appendChild(script);
});

const customThemes = ref([]);

const allThemes = computed(() => [...builtInThemes.value, ...customThemes.value]);

const TABS = [
  { value: 'themes', title: 'Themes', icon: 'mdi-palette' },
  { value: 'branding', title: 'Branding', icon: 'mdi-tune' },
  { value: 'appearance', title: 'Appearance', icon: 'mdi-image-filter-hdr' },
  { value: 'menu', title: 'Menu', icon: 'mdi-menu' },
  { value: 'backup', title: 'Backup', icon: 'mdi-backup-restore' },
];
const TAB_KEY = 'frontend-customizer-tab';
const readTab = () => {
  try {
    const stored = localStorage.getItem(TAB_KEY);
    return TABS.some(t => t.value === stored) ? stored : 'themes';
  } catch (e) {
    return 'themes';
  }
};
const tab = ref(readTab());
watch(tab, (value) => {
  try {
    localStorage.setItem(TAB_KEY, value);
  } catch (e) {
    // storage blocked: the tab is just not remembered
  }
});

// Custom Theme Editor State
const THEME_EDITOR_DEFAULTS = {
  name: '',
  description: '',
  primary: '#ff6b00',
  secondary: '#cc5500',
  accent: '#ffaa00',
  background: '#0d0d0d',
  surface: '#1a1a1a',
  textColor: '#e0e0e0',
  buttonColor: '#ff6b00',
  buttonTextColor: '', // empty: theme-loader picks black or white for contrast
};
const showThemeEditor = ref(false);
const editingThemeId = ref(null);
const savingCustomTheme = ref(false);
const themeEditor = ref({ ...THEME_EDITOR_DEFAULTS });

const saveToLocalStorage = (config) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save theme to localStorage:', e);
  }
};

const loadFromLocalStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    console.error('Failed to load theme from localStorage:', e);
    return null;
  }
};

const loading = ref(true);
const saving = ref(false);
const savingOptions = ref(false);
const savingCustomization = ref(false);
const savingAppearance = ref(false);
const savingMenu = ref(false);
const saveError = ref('');
const selectedTheme = ref(null);
const currentTheme = ref(null);
const OPTION_DEFAULTS = {
  enableGlow: true,
  enableScanlines: false,
  enableAnimations: true,
};
const options = ref({ ...OPTION_DEFAULTS });
const CUSTOMIZATION_DEFAULTS = {
  appName: '',
  logoUrl: '',
  primaryColor: '',
  secondaryColor: '',
  accentColor: '',
  buttonColor: '',
  buttonTextColor: '',
  faviconUrl: '',
  titlePrefix: '',
  loginBranding: false,
  loginMessage: '',
};
const customization = ref({ ...CUSTOMIZATION_DEFAULTS });
const APPEARANCE_DEFAULTS = {
  backgroundUrl: '',
  backgroundBlur: 0,
  backgroundDim: 0,
  fontFamily: 'default',
  uiScale: 100,
  radius: null,
  cardStyle: 'default',
  customCss: '',
};
const appearance = ref({ ...APPEARANCE_DEFAULTS });
const CUSTOM_CSS_MAX = 50000;

const fontOptions = [
  { title: 'Theme / MOS default', value: 'default' },
  { title: 'System UI', value: 'system' },
  { title: 'Roboto', value: 'roboto' },
  { title: 'Helvetica / Arial', value: 'sans' },
  { title: 'Serif', value: 'serif' },
  { title: 'Monospace', value: 'mono' },
];
const cardStyleOptions = [
  { title: 'Theme / MOS default', value: 'default' },
  { title: 'Flat (no shadow)', value: 'flat' },
  { title: 'Outlined', value: 'outlined' },
  { title: 'Glass (translucent)', value: 'glass' },
];
const radiusOptions = [
  { title: 'Theme / MOS default', value: 'default' },
  ...[0, 4, 8, 12, 16, 24, 32].map((px) => ({ title: `${px}px`, value: px })),
];
// Radius is stored as null (keep default) or px; v-select needs a non-null value for "default".
const radiusModel = computed({
  get: () => (appearance.value.radius === null ? 'default' : appearance.value.radius),
  set: (value) => { appearance.value.radius = value === 'default' ? null : value; },
});

// Image picker: built-in MOS images, uploaded icons or a manual URL, for three fields.
const IMAGE_FIELDS = {
  logo: { label: 'logo', state: customization, key: 'logoUrl' },
  favicon: { label: 'browser tab icon', state: customization, key: 'faviconUrl' },
  background: { label: 'background image', state: appearance, key: 'backgroundUrl' },
};
const availableLogos = [
  { name: 'MOS White', path: '/mos_white.png' },
  { name: 'MOS Black', path: '/mos_black.png' },
];
const pickerTarget = ref('logo');
const showPicker = ref(false);
const manualUrl = ref('');
const pickerValue = computed(() => {
  const field = IMAGE_FIELDS[pickerTarget.value];
  return field.state.value[field.key];
});
const builtInImages = computed(() => {
  if (pickerTarget.value === 'background') return [];
  return pickerTarget.value === 'favicon' ? [...availableLogos, { name: 'MOS Icon', path: '/mos_icon.svg' }] : availableLogos;
});

// Uploads go through the MOS file API into the plugin dir, which nginx serves (no-cache) under /_plugins/.
const ICON_DIR = '/var/www/mos-plugins/frontend-customizer/icons';
const ICON_URL = '/_plugins/frontend-customizer/icons/';
// No SVG: an uploaded SVG served from the MOS origin could run script when opened directly.
const ICON_NAME = /^[A-Za-z0-9._-]+\.(png|jpe?g|gif|webp|ico)$/i;
const ICON_MAX_BYTES = 2 * 1024 * 1024;
const uploadedIcons = ref([]);
const uploadingIcon = ref(false);
const deletingIcon = ref('');
const iconInput = ref(null);

const menuOrder = ref([]);
const importInput = ref(null);
let draggedIndex = null;

const getCurrentTheme = () => {
  return allThemes.value.find(t => t.id === currentTheme.value) || builtInThemes.value[0];
};

const activeThemeName = computed(() => allThemes.value.find(t => t.id === currentTheme.value)?.name || 'MOS default');

const getAuthHeaders = () => ({
  Authorization: 'Bearer ' + localStorage.getItem('authToken'),
});

// ─── Canonical config path: normalize (load) → build → persist ───
// One place that knows the full config shape, so no save can drop a section.
// Also the trust boundary for settings from the API, localStorage and imported files:
// only known keys with the right type, range and length survive. theme-loader.js
// additionally checks every URL and colour before it reaches CSS or the DOM.
const HEX = /^#[0-9a-f]{3,8}$/i;
const CUSTOMIZATION_COLORS = ['primaryColor', 'secondaryColor', 'accentColor', 'buttonColor', 'buttonTextColor'];
const TEXT_LIMITS = { appName: 64, titlePrefix: 32, loginMessage: 200 };
const THEME_COLORS = ['primary', 'secondary', 'accent', 'background', 'surface', 'textColor', 'buttonColor', 'buttonTextColor'];
const text = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : '');
const int = (value, min, max, fallback) => {
  const n = Number(value);
  return value !== null && value !== '' && Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : fallback;
};
const oneOf = (value, list, fallback) => (list.some(o => o.value === value) ? value : fallback);

const normalizeCustomization = (c) => {
  const out = { ...CUSTOMIZATION_DEFAULTS };
  for (const key of Object.keys(out)) {
    const value = c[key];
    if (typeof out[key] === 'boolean') out[key] = value === true;
    else if (CUSTOMIZATION_COLORS.includes(key)) out[key] = typeof value === 'string' && HEX.test(value.trim()) ? value.trim() : '';
    else out[key] = text(value, TEXT_LIMITS[key] || 2048);
  }
  return out;
};

const normalizeAppearance = (a) => ({
  backgroundUrl: text(a.backgroundUrl, 2048),
  backgroundBlur: int(a.backgroundBlur, 0, 20, 0),
  backgroundDim: int(a.backgroundDim, 0, 80, 0),
  fontFamily: oneOf(a.fontFamily, fontOptions, 'default'),
  uiScale: int(a.uiScale, 80, 125, 100),
  radius: oneOf(int(a.radius, 0, 32, null), radiusOptions, null),
  cardStyle: oneOf(a.cardStyle, cardStyleOptions, 'default'),
  customCss: typeof a.customCss === 'string' ? a.customCss.slice(0, CUSTOM_CSS_MAX) : '',
});

// Menu entries come from the engine; stored entries keep only id order + visibility.
// Unknown ids (e.g. the old "users" entry) are dropped, routes always come from the engine.
// Default order of 2.3.x (old MOS menu); stored unchanged, it is not a user choice.
const LEGACY_DEFAULT_ORDER = 'dashboard,disks,pools,shares,remoteMounting,mosHub,docker,lxc,vm,users,webTerminal,plugins,mosSettings';

const normalizeMenu = (list) => {
  const known = menuItems.value;
  const visible = {};
  const storedIds = [];
  const entries = Array.isArray(list) ? list : [];
  const legacyDefault = entries.map(e => e && e.id).join() === LEGACY_DEFAULT_ORDER;
  for (const entry of entries) {
    if (!entry || !known.some(m => m.id === entry.id) || entry.id in visible) continue;
    visible[entry.id] = entry.visible !== false;
    storedIds.push(entry.id);
  }
  const nativeIds = known.map(m => m.id).filter(id => id in visible);
  // Never reordered: follow the native order so new MOS entries land in their native place.
  const ids = legacyDefault || storedIds.join() === nativeIds.join()
    ? known.map(m => m.id)
    : [...storedIds, ...known.map(m => m.id).filter(id => !(id in visible))];
  return ids.map(id => ({ ...known.find(m => m.id === id), visible: visible[id] !== false }));
};

const normalizeCustomThemes = (list) => {
  const seen = new Set();
  return (Array.isArray(list) ? list : [])
    .filter(t => t && typeof t.id === 'string' && /^custom-[a-z0-9-]{1,64}$/.test(t.id) && !seen.has(t.id) && seen.add(t.id))
    .slice(0, 50)
    .map((t) => {
      const theme = {
        id: t.id,
        name: text(t.name, 64) || t.id,
        description: text(t.description, 200) || 'Custom theme',
        icon: 'mdi-palette',
        isCustom: true,
      };
      for (const key of THEME_COLORS) theme[key] = typeof t[key] === 'string' && HEX.test(t[key]) ? t[key] : THEME_EDITOR_DEFAULTS[key];
      return theme;
    });
};

// Accepts both the legacy nested settings.json ({ options: {...} }) and the canonical flat shape.
const normalizeConfig = (data) => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  const flags = data.options && typeof data.options === 'object' ? data.options : data;
  const theme = typeof data.theme === 'string' && /^[a-z0-9-]{1,80}$/.test(data.theme) ? data.theme : null;
  return {
    theme,
    enableGlow: flags.enableGlow !== false,
    enableScanlines: flags.enableScanlines === true,
    enableAnimations: flags.enableAnimations !== false,
    customization: normalizeCustomization(data.customization || {}),
    appearance: normalizeAppearance(data.appearance || {}),
    layout: { menuOrder: normalizeMenu(data.layout && data.layout.menuOrder) },
    customThemes: normalizeCustomThemes(data.customThemes),
  };
};

// Assign a normalized config into reactive state (used by API, localStorage and import).
const applyLoadedConfig = (data) => {
  const cfg = normalizeConfig(data);
  if (!cfg) return null;
  currentTheme.value = cfg.theme;
  selectedTheme.value = cfg.theme;
  options.value = {
    enableGlow: cfg.enableGlow,
    enableScanlines: cfg.enableScanlines,
    enableAnimations: cfg.enableAnimations,
  };
  customization.value = { ...cfg.customization };
  appearance.value = { ...cfg.appearance };
  menuOrder.value = cfg.layout.menuOrder;
  customThemes.value = cfg.customThemes;
  return cfg;
};

// Build the canonical full config from current reactive state — never drops a section.
const buildConfig = () => {
  const cfg = normalizeConfig({
    theme: currentTheme.value,
    ...options.value,
    customization: customization.value,
    appearance: appearance.value,
    layout: { menuOrder: menuOrder.value },
    customThemes: customThemes.value,
  });
  cfg.layout.menuOrder = cfg.layout.menuOrder.map(({ id, visible }) => ({ id, visible }));
  return cfg;
};

// Show unsaved menu changes on this page right away (saved with "Save Menu").
const preview = () => {
  if (engine) engine.apply(buildConfig());
};

// The single persistence path: localStorage + live apply + one API POST. Every save routes here.
// Returns false when the server copy was not updated; the snackbar tells the user.
const persistConfig = async (config) => {
  if (!engine) {
    // Without the engine the menu list is empty, so a save would drop menu settings.
    saveError.value = engineError;
    return false;
  }
  saveToLocalStorage(config);
  engine.apply(config);
  let reason;
  try {
    const res = await fetch(`/api/v1/mos/plugins/settings/${PLUGIN_NAME}`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });
    if (res.ok) {
      saveError.value = '';
      return true;
    }
    reason = `HTTP ${res.status}`;
  } catch (apiError) {
    reason = 'network error';
  }
  saveError.value = `Server save failed (${reason}). Settings are saved in this browser only.`;
  console.warn('Could not save to API, using localStorage only:', reason);
  return false;
};

const fetchSettings = async () => {
  try {
    const res = await fetch(`/api/v1/mos/plugins/settings/${PLUGIN_NAME}`, {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      const local = loadFromLocalStorage();
      // Every save writes `layout`; the settings.json seed MOS copies on (re)install has none.
      // Browser copy with layout + server copy without = server was reset: keep the browser copy.
      // shortcut: a pre-2.3.9 save (no layout) from another browser loses to this one once; add a seed marker if that matters.
      if (local?.layout && !data?.layout) {
        applyLoadedConfig(local);
        await persistConfig(buildConfig());
      } else {
        applyLoadedConfig(data);
        // theme-loader.js reads only localStorage, so mirror the server copy there
        // (only with the engine: without its menu list the copy would lose menu settings).
        if (engine) {
          saveToLocalStorage(buildConfig());
          preview();
        }
      }
    }
  } catch (e) {
    console.error('Failed to fetch settings:', e);
  }
};

const selectTheme = (themeId) => {
  selectedTheme.value = themeId;
};

const applyTheme = async () => {
  saving.value = true;
  try {
    currentTheme.value = selectedTheme.value;
    await persistConfig(buildConfig());
  } catch (e) {
    console.error('Failed to apply theme:', e);
  } finally {
    saving.value = false;
  }
};

const resetTheme = async () => {
  saving.value = true;
  try {
    // Reset only theme + options; customization, appearance, menu and custom themes are preserved.
    currentTheme.value = null;
    selectedTheme.value = null;
    options.value = { ...OPTION_DEFAULTS };
    await persistConfig(buildConfig());
  } catch (e) {
    console.error('Failed to reset theme:', e);
  } finally {
    saving.value = false;
  }
};

const saveOptions = async () => {
  savingOptions.value = true;
  try {
    await persistConfig(buildConfig());
  } catch (e) {
    console.error('Failed to save options:', e);
  } finally {
    savingOptions.value = false;
  }
};

const saveCustomization = async () => {
  savingCustomization.value = true;
  try {
    await persistConfig(buildConfig());
  } catch (e) {
    console.error('Failed to save customization:', e);
  } finally {
    savingCustomization.value = false;
  }
};

const resetCustomization = () => {
  customization.value = { ...CUSTOMIZATION_DEFAULTS };
};

const saveAppearance = async () => {
  savingAppearance.value = true;
  try {
    await persistConfig(buildConfig());
  } catch (e) {
    console.error('Failed to save appearance:', e);
  } finally {
    savingAppearance.value = false;
  }
};

// Keeps custom CSS: it has its own card and is easy to lose.
const resetAppearance = () => {
  appearance.value = { ...APPEARANCE_DEFAULTS, customCss: appearance.value.customCss };
};

const openPicker = (target) => {
  pickerTarget.value = target;
  manualUrl.value = '';
  showPicker.value = true;
};

// Writes the chosen URL into the target field; it is saved with that card's Save button.
const pickImage = (url) => {
  const field = IMAGE_FIELDS[pickerTarget.value];
  field.state.value[field.key] = url;
  showPicker.value = false;
};

const selectManualUrl = () => {
  const url = manualUrl.value.trim();
  if (!url || url.startsWith('data:')) return;
  pickImage(url);
};

const postJson = (url, body) => fetch(url, {
  method: 'POST',
  headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

// Missing directory or API error just means an empty gallery.
const loadIcons = async () => {
  try {
    const res = await fetch(`/api/v1/mos/fsnavigator?path=${encodeURIComponent(ICON_DIR)}&type=all`, {
      headers: getAuthHeaders(),
    });
    const items = res.ok ? (await res.json()).items : [];
    uploadedIcons.value = (Array.isArray(items) ? items : [])
      .filter(i => i && i.type === 'file' && ICON_NAME.test(i.name))
      .map(i => ({ name: i.name, url: ICON_URL + i.name }));
  } catch (e) {
    uploadedIcons.value = [];
  }
};

const uploadIcon = async (file) => {
  const name = file.name.replace(/[^A-Za-z0-9._-]/g, '_');
  // nginx serves by extension and the gallery lists only these names, so the extension decides.
  if (!ICON_NAME.test(name)) {
    saveError.value = 'Upload failed: use a .png, .jpg, .gif, .webp or .ico image.';
    return null;
  }
  if (file.size > ICON_MAX_BYTES) {
    saveError.value = 'Upload failed: the image is larger than 2 MB.';
    return null;
  }
  const send = () => {
    const form = new FormData();
    form.append('path', ICON_DIR);
    form.append('file', file, name);
    return fetch('/api/v1/mos/upload', { method: 'POST', headers: getAuthHeaders(), body: form });
  };
  uploadingIcon.value = true;
  try {
    let res = await send();
    if (res.status === 404) {
      // Target directory missing (install normally creates it): create it and retry once.
      await postJson('/api/v1/mos/createfolder', { path: ICON_DIR, user: '1001', group: '1001', permissions: '755' });
      res = await send();
    }
    if (!res.ok) {
      saveError.value = `Upload failed (HTTP ${res.status}).`;
      return null;
    }
    await loadIcons();
    return ICON_URL + name;
  } catch (e) {
    saveError.value = 'Upload failed (network error).';
    return null;
  } finally {
    uploadingIcon.value = false;
  }
};

const onIconFile = async (event) => {
  const file = event.target.files && event.target.files[0];
  event.target.value = '';
  if (!file) return;
  const url = await uploadIcon(file);
  if (url) pickImage(url);
};

const deleteIcon = async (icon) => {
  if (deletingIcon.value || !confirm(`Delete ${icon.name}?`)) return;
  deletingIcon.value = icon.name;
  try {
    const res = await postJson('/api/v1/mos/delete', { path: `${ICON_DIR}/${icon.name}` });
    if (!res.ok) {
      saveError.value = `Delete failed (HTTP ${res.status}).`;
      return;
    }
    for (const field of Object.values(IMAGE_FIELDS)) {
      if (field.state.value[field.key] === icon.url) field.state.value[field.key] = '';
    }
    await loadIcons();
  } catch (e) {
    saveError.value = 'Delete failed (network error).';
  } finally {
    deletingIcon.value = '';
  }
};

// Custom Theme Functions
const openThemeEditor = (theme = null) => {
  if (theme) {
    editingThemeId.value = theme.id;
    themeEditor.value = { ...theme };
  } else {
    editingThemeId.value = null;
    themeEditor.value = { ...THEME_EDITOR_DEFAULTS };
  }
  showThemeEditor.value = true;
};

const closeThemeEditor = () => {
  showThemeEditor.value = false;
  editingThemeId.value = null;
};

const generateThemeId = (name) => {
  return ('custom-' + name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')).slice(0, 71);
};

const saveCustomTheme = async () => {
  if (!themeEditor.value.name) return;

  savingCustomTheme.value = true;
  try {
    const newTheme = {
      id: editingThemeId.value || generateThemeId(themeEditor.value.name),
      name: themeEditor.value.name,
      description: themeEditor.value.description || 'Custom theme',
      icon: 'mdi-palette',
      primary: themeEditor.value.primary,
      secondary: themeEditor.value.secondary,
      accent: themeEditor.value.accent,
      background: themeEditor.value.background,
      surface: themeEditor.value.surface,
      textColor: themeEditor.value.textColor,
      buttonColor: themeEditor.value.buttonColor || themeEditor.value.primary,
      buttonTextColor: themeEditor.value.buttonTextColor || '',
      isCustom: true,
    };

    if (editingThemeId.value) {
      // Update existing theme
      const index = customThemes.value.findIndex(t => t.id === editingThemeId.value);
      if (index !== -1) {
        customThemes.value[index] = newTheme;
      }
    } else {
      // Add new theme
      customThemes.value.push(newTheme);
    }

    await persistConfig(buildConfig());
    closeThemeEditor();
  } catch (e) {
    console.error('Failed to save custom theme:', e);
  } finally {
    savingCustomTheme.value = false;
  }
};

const editCustomTheme = (theme) => {
  openThemeEditor(theme);
};

const deleteCustomTheme = async (themeId) => {
  if (!confirm('Delete this custom theme?')) return;

  customThemes.value = customThemes.value.filter(t => t.id !== themeId);

  // If deleted theme was active, reset
  if (currentTheme.value === themeId) {
    currentTheme.value = null;
    selectedTheme.value = null;
  }

  await persistConfig(buildConfig());
};

// Menu functions
const onDragStart = (event, index) => {
  draggedIndex = index;
  event.dataTransfer.effectAllowed = 'move';
};

const onDrop = (event, targetIndex) => {
  if (draggedIndex === null || draggedIndex === targetIndex) return;

  const items = [...menuOrder.value];
  const [draggedItem] = items.splice(draggedIndex, 1);
  items.splice(targetIndex, 0, draggedItem);
  menuOrder.value = items;
  draggedIndex = null;
  preview();
};

// Keyboard alternative to drag and drop; the buttons are disabled at the ends.
const moveMenuItem = (index, delta) => {
  const items = [...menuOrder.value];
  [items[index], items[index + delta]] = [items[index + delta], items[index]];
  menuOrder.value = items;
  preview();
};

const toggleMenuItemVisibility = (item) => {
  item.visible = !item.visible;
  preview();
};

const resetMenu = () => {
  menuOrder.value = normalizeMenu([]);
  preview();
};

const saveMenu = async () => {
  savingMenu.value = true;
  try {
    await persistConfig(buildConfig());
  } catch (e) {
    console.error('Failed to save menu:', e);
  } finally {
    savingMenu.value = false;
  }
};

// ─── Backup: export / import / reset everything ───
const IMPORT_MAX_BYTES = 1024 * 1024;

const exportSettings = () => {
  const blob = new Blob([JSON.stringify(buildConfig(), null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'frontend-customizer-settings.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const importSettings = async (event) => {
  const file = event.target.files && event.target.files[0];
  event.target.value = '';
  if (!file) return;
  let data;
  try {
    if (file.size > IMPORT_MAX_BYTES) throw new Error('file is larger than 1 MB');
    data = JSON.parse(await file.text());
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('not a settings object');
  } catch (e) {
    saveError.value = `Import failed: ${e.message}`;
    return;
  }
  applyLoadedConfig(data);
  await persistConfig(buildConfig());
};

const resetAll = async () => {
  if (!confirm('Reset all Frontend Customizer settings to defaults? Export first if you want to keep them.')) return;
  applyLoadedConfig({});
  await persistConfig(buildConfig());
};

onMounted(async () => {
  try {
    engine = await loadEngine();
    if (engine) {
      builtInThemes.value = engine.themes;
      menuItems.value = engine.menuItems;
    } else {
      saveError.value = engineError;
    }

    // First, load from localStorage (instant)
    const storedConfig = loadFromLocalStorage();
    applyLoadedConfig(storedConfig || {});

    // Then fetch from API (may override localStorage)
    await fetchSettings();
    loadIcons(); // gallery only, no need to hold the page for it
  } catch (e) {
    console.error('Failed to initialize:', e);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
/* .v-card in the selector + !important: outranks theme-loader's .v-card / .v-card:hover rules */
.v-card.theme-card {
  background: var(--card-bg) !important;
  border: var(--card-border) !important;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 12px;
}

.theme-card:hover {
  transform: translateY(-4px);
}

.theme-card--active {
  transform: scale(1.02);
}

.color-preview {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.color-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.logo-card {
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.logo-card:hover {
  border-color: rgba(127, 127, 127, 0.4);
}

/* outline, not border: theme-loader forces .v-card borders */
.logo-card.selected {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: -2px;
  background: rgba(var(--v-theme-primary), 0.1);
}

/* Neutral backdrop so light and dark images stay visible on both themes */
.image-bg {
  background: rgba(127, 127, 127, 0.15);
}

.logo-preview {
  display: inline-block;
}
</style>
