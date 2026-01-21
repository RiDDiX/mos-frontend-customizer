<template>
  <div>
    <h2 class="mb-4">Frontend Customizer - MOS</h2>
    <v-skeleton-loader v-if="loading" :loading="true" type="card, card" />
    <div v-else style="margin-bottom: 80px">
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
                  border: selectedTheme === theme.id
                    ? `2px solid ${theme.primary}`
                    : '2px solid transparent',
                  background: theme.background,
                  cursor: 'pointer'
                }"
                @click="selectTheme(theme.id)"
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
                  <p class="text-caption mt-2" :style="{ color: theme.textColor }">
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
                  hint="Enter URL or click to select from gallery"
                  persistent-hint
                  prepend-inner-icon="mdi-image"
                  variant="outlined"
                  density="comfortable"
                  @click="showLogoDialog = true"
                  readonly
                >
                  <template v-slot:append>
                    <v-btn
                      icon
                      size="small"
                      variant="text"
                      @click.stop="showLogoDialog = true"
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
                    class="rounded"
                    style="background: #1a1a1a; padding: 8px;"
                  />
                </div>
              </div>
            </v-col>
          </v-row>
          
          <!-- Logo Selection Dialog -->
          <v-dialog v-model="showLogoDialog" max-width="600">
            <v-card>
              <v-card-title class="d-flex align-center">
                <v-icon class="mr-2">mdi-image-multiple</v-icon>
                Select Logo
                <v-spacer />
                <v-btn icon variant="text" @click="showLogoDialog = false">
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </v-card-title>
              <v-divider />
              <v-card-text class="pa-4">
                <!-- Manual URL Input -->
                <v-text-field
                  v-model="manualLogoUrl"
                  label="Enter Logo URL manually"
                  placeholder="https://example.com/logo.png or /path/to/logo.png"
                  variant="outlined"
                  density="compact"
                  class="mb-4"
                  prepend-inner-icon="mdi-link"
                >
                  <template v-slot:append>
                    <v-btn
                      color="primary"
                      size="small"
                      :disabled="!manualLogoUrl"
                      @click="selectManualLogo"
                    >
                      Use
                    </v-btn>
                  </template>
                </v-text-field>
                
                <v-divider class="mb-4" />
                
                <!-- Upload Section -->
                <div class="upload-section mb-4">
                  <input
                    ref="logoFileInput"
                    type="file"
                    accept="image/*"
                    style="display: none"
                    @change="handleLogoUpload"
                  />
                  <v-btn
                    color="primary"
                    variant="outlined"
                    block
                    :loading="uploadingLogo"
                    @click="$refs.logoFileInput.click()"
                  >
                    <v-icon class="mr-2">mdi-upload</v-icon>
                    Upload New Logo
                  </v-btn>
                </div>
                
                <v-divider class="mb-4" />
                
                <!-- Logo Gallery -->
                <div class="text-subtitle-2 mb-2">Available Logos</div>
                <div v-if="availableLogos.length === 0" class="text-center text-medium-emphasis pa-4">
                  <v-icon size="48" class="mb-2">mdi-image-off</v-icon>
                  <div>No logos uploaded yet</div>
                  <div class="text-caption">Upload a logo or enter a URL above</div>
                </div>
                <v-row v-else dense>
                  <v-col
                    v-for="logo in availableLogos"
                    :key="logo.path"
                    cols="4"
                    sm="3"
                  >
                    <v-card
                      class="logo-card pa-2"
                      :class="{ 'selected': customization.logoUrl === logo.path }"
                      @click="selectLogo(logo.path)"
                      hover
                    >
                      <v-img
                        :src="logo.path"
                        height="60"
                        contain
                        class="rounded"
                        style="background: #0d0d0d;"
                      />
                      <div class="text-caption text-truncate text-center mt-1">
                        {{ logo.name }}
                      </div>
                      <v-btn
                        v-if="logo.deletable"
                        icon
                        size="x-small"
                        color="error"
                        variant="text"
                        class="delete-btn"
                        @click.stop="deleteLogo(logo.path)"
                      >
                        <v-icon size="14">mdi-delete</v-icon>
                      </v-btn>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card-text>
              <v-divider />
              <v-card-actions class="pa-4">
                <v-btn variant="text" @click="clearLogo">
                  <v-icon class="mr-1">mdi-close-circle</v-icon>
                  Clear Logo
                </v-btn>
                <v-spacer />
                <v-btn color="primary" @click="showLogoDialog = false">
                  Done
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          
          <v-divider class="my-4" />
          
          <v-row>
            <v-col cols="12">
              <div class="text-subtitle-2 mb-2">Custom Colors (Optional Override)</div>
              <p class="text-caption text-medium-emphasis mb-3">
                Leave empty to use the theme's default colors
              </p>
            </v-col>
            <v-col cols="12" md="4">
              <div class="d-flex align-center">
                <v-menu :close-on-content-click="false">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      v-bind="props"
                      :color="customization.primaryColor || getCurrentTheme()?.primary || '#00ff41'"
                      variant="flat"
                      size="small"
                      class="mr-3"
                      style="min-width: 40px; height: 40px;"
                    />
                  </template>
                  <v-color-picker
                    v-model="customization.primaryColor"
                    mode="hex"
                    hide-inputs
                  />
                </v-menu>
                <v-text-field
                  v-model="customization.primaryColor"
                  label="Primary Color"
                  placeholder="#00ff41"
                  variant="outlined"
                  density="compact"
                  hide-details
                />
              </div>
            </v-col>
            <v-col cols="12" md="4">
              <div class="d-flex align-center">
                <v-menu :close-on-content-click="false">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      v-bind="props"
                      :color="customization.secondaryColor || getCurrentTheme()?.secondary || '#008f11'"
                      variant="flat"
                      size="small"
                      class="mr-3"
                      style="min-width: 40px; height: 40px;"
                    />
                  </template>
                  <v-color-picker
                    v-model="customization.secondaryColor"
                    mode="hex"
                    hide-inputs
                  />
                </v-menu>
                <v-text-field
                  v-model="customization.secondaryColor"
                  label="Secondary Color"
                  placeholder="#008f11"
                  variant="outlined"
                  density="compact"
                  hide-details
                />
              </div>
            </v-col>
            <v-col cols="12" md="4">
              <div class="d-flex align-center">
                <v-menu :close-on-content-click="false">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      v-bind="props"
                      :color="customization.accentColor || getCurrentTheme()?.accent || '#00ff41'"
                      variant="flat"
                      size="small"
                      class="mr-3"
                      style="min-width: 40px; height: 40px;"
                    />
                  </template>
                  <v-color-picker
                    v-model="customization.accentColor"
                    mode="hex"
                    hide-inputs
                  />
                </v-menu>
                <v-text-field
                  v-model="customization.accentColor"
                  label="Accent Color"
                  placeholder="#00ff41"
                  variant="outlined"
                  density="compact"
                  hide-details
                />
              </div>
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
              <div class="d-flex align-center">
                <v-menu :close-on-content-click="false">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      v-bind="props"
                      :color="customization.buttonColor || getCurrentTheme()?.buttonColor || getCurrentTheme()?.primary || '#00ff41'"
                      variant="flat"
                      size="small"
                      class="mr-3"
                      style="min-width: 40px; height: 40px;"
                    />
                  </template>
                  <v-color-picker
                    v-model="customization.buttonColor"
                    mode="hex"
                    hide-inputs
                  />
                </v-menu>
                <v-text-field
                  v-model="customization.buttonColor"
                  label="Button Color"
                  placeholder="#00ff41"
                  variant="outlined"
                  density="compact"
                  hide-details
                />
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="d-flex align-center">
                <v-menu :close-on-content-click="false">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      v-bind="props"
                      :color="customization.buttonTextColor || getCurrentTheme()?.buttonTextColor || '#ffffff'"
                      variant="flat"
                      size="small"
                      class="mr-3"
                      style="min-width: 40px; height: 40px; border: 1px solid #333;"
                    />
                  </template>
                  <v-color-picker
                    v-model="customization.buttonTextColor"
                    mode="hex"
                    hide-inputs
                  />
                </v-menu>
                <v-text-field
                  v-model="customization.buttonTextColor"
                  label="Button Text/Icon Color"
                  placeholder="#ffffff"
                  variant="outlined"
                  density="compact"
                  hide-details
                />
              </div>
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

      <v-card class="mb-4 pa-0">
        <v-card-title>
          <v-icon class="mr-2">mdi-page-layout-header</v-icon>
          Layout Settings
        </v-card-title>
        <v-card-text class="pa-4">
          <v-row>
            <v-col cols="12">
              <div class="text-subtitle-2 mb-2">Navigation Mode</div>
              <v-btn-toggle
                v-model="layoutSettings.navMode"
                mandatory
                color="primary"
                class="mb-4"
              >
                <v-btn value="sidebar" prepend-icon="mdi-dock-left">
                  Sidebar (Classic)
                </v-btn>
                <v-btn value="header" prepend-icon="mdi-dock-top">
                  Header Bar
                </v-btn>
              </v-btn-toggle>
            </v-col>
          </v-row>

          <v-divider class="my-4" />

          <v-row>
            <v-col cols="12">
              <div class="text-subtitle-2 mb-2">Menu Items Order</div>
              <p class="text-caption text-medium-emphasis mb-3">
                Drag to reorder menu items (changes apply after save)
              </p>
              <div class="menu-order-list">
                <div
                  v-for="(item, index) in layoutSettings.menuOrder"
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
                  <v-switch
                    v-model="item.visible"
                    hide-details
                    density="compact"
                    color="primary"
                  />
                </div>
              </div>
            </v-col>
          </v-row>

          <v-divider class="my-4" />

          <v-row>
            <v-col cols="12">
              <div class="text-subtitle-2 mb-2">Header Plugin Shortcuts</div>
              <p class="text-caption text-medium-emphasis mb-3">
                Add individual plugins directly to the header menu instead of going through "Plugins"
              </p>
              <v-btn
                v-if="installedPlugins.length === 0"
                variant="outlined"
                size="small"
                :loading="loadingPlugins"
                @click="fetchInstalledPlugins"
                class="mb-3"
              >
                <v-icon start>mdi-refresh</v-icon>
                Load Available Plugins
              </v-btn>
              <div v-if="installedPlugins.length > 0" class="header-plugins-list">
                <div
                  v-for="plugin in installedPlugins"
                  :key="plugin.name"
                  class="header-plugin-item d-flex align-center pa-2 mb-1 rounded"
                  :style="{
                    background: layoutSettings.headerPlugins?.includes(plugin.name) 
                      ? 'rgba(var(--v-theme-primary), 0.2)' 
                      : 'rgba(var(--v-theme-surface), 0.3)',
                    border: layoutSettings.headerPlugins?.includes(plugin.name)
                      ? '1px solid rgba(var(--v-theme-primary), 0.5)'
                      : '1px solid rgba(var(--v-theme-primary), 0.1)'
                  }"
                >
                  <v-icon size="small" class="mr-2">{{ plugin.icon || 'mdi-puzzle' }}</v-icon>
                  <span class="text-body-2">{{ plugin.displayName || plugin.name }}</span>
                  <v-spacer />
                  <v-switch
                    :model-value="layoutSettings.headerPlugins?.includes(plugin.name)"
                    @update:model-value="toggleHeaderPlugin(plugin.name, $event)"
                    hide-details
                    density="compact"
                    color="primary"
                  />
                </div>
              </div>
            </v-col>
          </v-row>

          <v-divider class="my-4" />

          <v-row>
            <v-col cols="12">
              <div class="text-subtitle-2 mb-3">Live Preview</div>
              <div 
                class="preview-container rounded pa-3"
                :style="{
                  background: getCurrentTheme()?.background || '#0d0d0d',
                  border: `1px solid ${getCurrentTheme()?.primary || '#00ff41'}`,
                  minHeight: '120px'
                }"
              >
                <div 
                  v-if="layoutSettings.navMode === 'header'"
                  class="preview-header d-flex align-center pa-2 rounded mb-2"
                  :style="{
                    background: getCurrentTheme()?.surface || '#1a1a1a',
                    borderBottom: `2px solid ${getCurrentTheme()?.primary || '#00ff41'}`
                  }"
                >
                  <div class="preview-logo mr-2" :style="{ color: getCurrentTheme()?.primary }">
                    <v-icon size="x-small">mdi-server</v-icon>
                  </div>
                  <span class="text-caption mr-4" :style="{ color: getCurrentTheme()?.primary }">
                    {{ customization.appName || 'MOS' }}
                  </span>
                  <div class="d-flex flex-wrap gap-1">
                    <span 
                      v-for="item in layoutSettings.menuOrder.filter(m => m.visible).slice(0, 6)"
                      :key="item.id"
                      class="preview-menu-item px-2 py-1 rounded"
                      :style="{
                        fontSize: '9px',
                        color: getCurrentTheme()?.textColor || '#b0b0b0',
                        background: 'rgba(255,255,255,0.05)'
                      }"
                    >
                      <v-icon size="8" class="mr-1">{{ item.icon }}</v-icon>
                      {{ item.title }}
                    </span>
                  </div>
                </div>
                <div 
                  v-else
                  class="preview-sidebar d-flex"
                >
                  <div 
                    class="preview-sidebar-nav pa-2 rounded mr-2"
                    :style="{
                      background: getCurrentTheme()?.surface || '#1a1a1a',
                      width: '80px',
                      borderRight: `2px solid ${getCurrentTheme()?.primary || '#00ff41'}`
                    }"
                  >
                    <div 
                      v-for="item in layoutSettings.menuOrder.filter(m => m.visible).slice(0, 5)"
                      :key="item.id"
                      class="preview-sidebar-item mb-1 pa-1 rounded"
                      :style="{
                        fontSize: '8px',
                        color: getCurrentTheme()?.textColor || '#b0b0b0',
                        background: 'rgba(255,255,255,0.03)'
                      }"
                    >
                      <v-icon size="8" class="mr-1">{{ item.icon }}</v-icon>
                      {{ item.title.slice(0, 6) }}
                    </div>
                  </div>
                  <div class="preview-content flex-grow-1 pa-2 rounded" :style="{ background: 'rgba(255,255,255,0.02)' }">
                    <div class="text-caption" :style="{ color: getCurrentTheme()?.textColor, opacity: 0.5 }">Content Area</div>
                  </div>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4">
          <v-btn
            variant="text"
            @click="resetLayout"
          >
            Reset Layout
          </v-btn>
          <v-spacer />
          <v-btn
            color="primary"
            :loading="savingLayout"
            @click="saveLayout"
          >
            Apply Layout
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
                <div class="d-flex align-center">
                  <v-menu :close-on-content-click="false">
                    <template v-slot:activator="{ props }">
                      <v-btn
                        v-bind="props"
                        :color="themeEditor.primary"
                        variant="flat"
                        size="small"
                        class="mr-3"
                        style="min-width: 40px; height: 40px;"
                      />
                    </template>
                    <v-color-picker v-model="themeEditor.primary" mode="hex" />
                  </v-menu>
                  <v-text-field
                    v-model="themeEditor.primary"
                    label="Primary"
                    variant="outlined"
                    density="compact"
                    hide-details
                  />
                </div>
              </v-col>
              <v-col cols="12" md="4">
                <div class="d-flex align-center">
                  <v-menu :close-on-content-click="false">
                    <template v-slot:activator="{ props }">
                      <v-btn
                        v-bind="props"
                        :color="themeEditor.secondary"
                        variant="flat"
                        size="small"
                        class="mr-3"
                        style="min-width: 40px; height: 40px;"
                      />
                    </template>
                    <v-color-picker v-model="themeEditor.secondary" mode="hex" />
                  </v-menu>
                  <v-text-field
                    v-model="themeEditor.secondary"
                    label="Secondary"
                    variant="outlined"
                    density="compact"
                    hide-details
                  />
                </div>
              </v-col>
              <v-col cols="12" md="4">
                <div class="d-flex align-center">
                  <v-menu :close-on-content-click="false">
                    <template v-slot:activator="{ props }">
                      <v-btn
                        v-bind="props"
                        :color="themeEditor.accent"
                        variant="flat"
                        size="small"
                        class="mr-3"
                        style="min-width: 40px; height: 40px;"
                      />
                    </template>
                    <v-color-picker v-model="themeEditor.accent" mode="hex" />
                  </v-menu>
                  <v-text-field
                    v-model="themeEditor.accent"
                    label="Accent"
                    variant="outlined"
                    density="compact"
                    hide-details
                  />
                </div>
              </v-col>
            </v-row>
            
            <v-row class="mt-2">
              <v-col cols="12" md="4">
                <div class="d-flex align-center">
                  <v-menu :close-on-content-click="false">
                    <template v-slot:activator="{ props }">
                      <v-btn
                        v-bind="props"
                        :color="themeEditor.background"
                        variant="flat"
                        size="small"
                        class="mr-3"
                        style="min-width: 40px; height: 40px; border: 1px solid #333;"
                      />
                    </template>
                    <v-color-picker v-model="themeEditor.background" mode="hex" />
                  </v-menu>
                  <v-text-field
                    v-model="themeEditor.background"
                    label="Background"
                    variant="outlined"
                    density="compact"
                    hide-details
                  />
                </div>
              </v-col>
              <v-col cols="12" md="4">
                <div class="d-flex align-center">
                  <v-menu :close-on-content-click="false">
                    <template v-slot:activator="{ props }">
                      <v-btn
                        v-bind="props"
                        :color="themeEditor.surface"
                        variant="flat"
                        size="small"
                        class="mr-3"
                        style="min-width: 40px; height: 40px; border: 1px solid #333;"
                      />
                    </template>
                    <v-color-picker v-model="themeEditor.surface" mode="hex" />
                  </v-menu>
                  <v-text-field
                    v-model="themeEditor.surface"
                    label="Surface"
                    variant="outlined"
                    density="compact"
                    hide-details
                  />
                </div>
              </v-col>
              <v-col cols="12" md="4">
                <div class="d-flex align-center">
                  <v-menu :close-on-content-click="false">
                    <template v-slot:activator="{ props }">
                      <v-btn
                        v-bind="props"
                        :color="themeEditor.textColor"
                        variant="flat"
                        size="small"
                        class="mr-3"
                        style="min-width: 40px; height: 40px; border: 1px solid #333;"
                      />
                    </template>
                    <v-color-picker v-model="themeEditor.textColor" mode="hex" />
                  </v-menu>
                  <v-text-field
                    v-model="themeEditor.textColor"
                    label="Text Color"
                    variant="outlined"
                    density="compact"
                    hide-details
                  />
                </div>
              </v-col>
            </v-row>
            
            <v-divider class="my-3" />
            <div class="text-subtitle-2 mb-3">Button Colors</div>
            
            <v-row>
              <v-col cols="12" md="6">
                <div class="d-flex align-center">
                  <v-menu :close-on-content-click="false">
                    <template v-slot:activator="{ props }">
                      <v-btn
                        v-bind="props"
                        :color="themeEditor.buttonColor"
                        variant="flat"
                        size="small"
                        class="mr-3"
                        style="min-width: 40px; height: 40px;"
                      />
                    </template>
                    <v-color-picker v-model="themeEditor.buttonColor" mode="hex" />
                  </v-menu>
                  <v-text-field
                    v-model="themeEditor.buttonColor"
                    label="Button Color"
                    variant="outlined"
                    density="compact"
                    hide-details
                  />
                </div>
              </v-col>
              <v-col cols="12" md="6">
                <div class="d-flex align-center">
                  <v-menu :close-on-content-click="false">
                    <template v-slot:activator="{ props }">
                      <v-btn
                        v-bind="props"
                        :color="themeEditor.buttonTextColor"
                        variant="flat"
                        size="small"
                        class="mr-3"
                        style="min-width: 40px; height: 40px; border: 1px solid #333;"
                      />
                    </template>
                    <v-color-picker v-model="themeEditor.buttonTextColor" mode="hex" />
                  </v-menu>
                  <v-text-field
                    v-model="themeEditor.buttonTextColor"
                    label="Button Text/Icon Color"
                    variant="outlined"
                    density="compact"
                    hide-details
                  />
                </div>
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
              <div class="d-flex gap-2 mb-3">
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
            
            <div class="d-flex justify-end mt-4 gap-2">
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
                  :style="{
                    border: selectedTheme === theme.id ? '2px solid ' + theme.primary : '2px solid transparent',
                    background: theme.background
                  }"
                  @click="selectTheme(theme.id)"
                  class="cursor-pointer"
                >
                  <v-card-text class="text-center pa-3">
                    <v-icon :color="theme.primary" size="32" class="mb-1">mdi-palette</v-icon>
                    <h4 :style="{ color: theme.primary }">{{ theme.name }}</h4>
                    <p class="text-caption mt-1" :style="{ color: theme.textColor }">{{ theme.description }}</p>
                    <div class="color-preview mt-2">
                      <span v-for="c in [theme.primary, theme.secondary, theme.accent]" :key="c" class="color-dot" :style="{ backgroundColor: c }" />
                    </div>
                    <div class="mt-2">
                      <v-btn size="x-small" icon variant="text" @click.stop="editCustomTheme(theme)">
                        <v-icon size="16">mdi-pencil</v-icon>
                      </v-btn>
                      <v-btn size="x-small" icon variant="text" color="error" @click.stop="deleteCustomTheme(theme.id)">
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

      <v-card class="pa-0">
        <v-card-title>
          <v-icon class="mr-2">mdi-information</v-icon>
          About
        </v-card-title>
        <v-card-text class="pa-4">
          <v-row dense>
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
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue';

const PLUGIN_NAME = 'frontend-customizer';
const STORAGE_KEY = 'frontend-customizer-config';
const pluginVersion = typeof __PLUGIN_VERSION__ !== 'undefined' ? __PLUGIN_VERSION__ : '1.0.0';

const themes = ref([
  {
    id: 'riddix-theme',
    name: 'RiDDiX',
    description: 'Signature orange tech style - the original',
    icon: 'mdi-alpha-r-circle',
    primary: '#ff6b00',
    secondary: '#cc5500',
    accent: '#ffaa00',
    background: '#0d0d0d',
    surface: '#1a1a1a',
    textColor: '#e0e0e0',
    buttonColor: '#ff6b00',
    buttonTextColor: '#ffffff',
    isBuiltIn: true,
  },
  {
    id: 'hacker-green',
    name: 'Hacker',
    description: 'Neon green on deep black - classic terminal vibes',
    icon: 'mdi-console',
    primary: '#00ff41',
    secondary: '#008f11',
    accent: '#00ff41',
    background: '#0d0d0d',
    surface: '#1a1a1a',
    textColor: '#b0b0b0',
    buttonColor: '#00ff41',
    buttonTextColor: '#000000',
    isBuiltIn: true,
  },
  {
    id: 'cyber-blue',
    name: 'Cyber Blue',
    description: 'Electric blue cyberpunk aesthetic',
    icon: 'mdi-chip',
    primary: '#00d4ff',
    secondary: '#0066cc',
    accent: '#ff00ff',
    background: '#0a0a14',
    surface: '#14141e',
    textColor: '#a0a0b0',
    buttonColor: '#00d4ff',
    buttonTextColor: '#000000',
    isBuiltIn: true,
  },
  {
    id: 'matrix-green',
    name: 'Matrix',
    description: 'Pure green terminal - enter the matrix',
    icon: 'mdi-matrix',
    primary: '#00ff00',
    secondary: '#003300',
    accent: '#00ff00',
    background: '#000000',
    buttonColor: '#00ff00',
    buttonTextColor: '#000000',
    surface: '#0a0a0a',
    textColor: '#00cc00',
    isBuiltIn: true,
  },
  {
    id: 'nos-nitro',
    name: 'NOS Nitro',
    description: 'Blazing fast - orange flames & nitro boost',
    icon: 'mdi-fire',
    primary: '#ff6600',
    secondary: '#ff3300',
    accent: '#ffcc00',
    background: '#0a0505',
    surface: '#1a0a0a',
    textColor: '#ffaa66',
    buttonColor: '#ff6600',
    buttonTextColor: '#ffffff',
    hasRallyStripes: true,
    isBuiltIn: true,
  },
  {
    id: 'lumina-circuit',
    name: 'Lumina Circuit',
    description: 'Clean & bright - precision engineering in light',
    icon: 'mdi-lightbulb-on',
    primary: '#0066ff',
    secondary: '#00a8e8',
    accent: '#7c3aed',
    background: '#f0f4f8',
    surface: '#ffffff',
    textColor: '#000000',
    buttonColor: '#0066ff',
    buttonTextColor: '#ffffff',
    isLight: true,
    isBuiltIn: true,
  },
]);

const customThemes = ref([]);

const allThemes = computed(() => [...themes.value, ...customThemes.value]);

// Custom Theme Editor State
const showThemeEditor = ref(false);
const editingThemeId = ref(null);
const savingCustomTheme = ref(false);
const themeEditor = ref({
  name: '',
  description: '',
  primary: '#ff6b00',
  secondary: '#cc5500',
  accent: '#ffaa00',
  background: '#0d0d0d',
  surface: '#1a1a1a',
  textColor: '#e0e0e0',
  buttonColor: '#ff6b00',
  buttonTextColor: '#ffffff',
});

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
const selectedTheme = ref(null);
const currentTheme = ref(null);
const options = ref({
  enableGlow: true,
  enableScanlines: false,
  enableAnimations: true,
});
const customization = ref({
  appName: '',
  logoUrl: '',
  primaryColor: '',
  secondaryColor: '',
  accentColor: '',
  buttonColor: '',
  buttonTextColor: '',
});

// Logo Upload State
const showLogoDialog = ref(false);
const manualLogoUrl = ref('');
const uploadingLogo = ref(false);
const availableLogos = ref([
  { name: 'MOS White', path: '/mos_white.png', deletable: false },
  { name: 'MOS Dark', path: '/mos_dark.png', deletable: false },
]);

const defaultMenuItems = [
  { id: 'dashboard', title: 'Dashboard', icon: 'mdi-view-dashboard', route: '/dashboard', visible: true },
  { id: 'disks', title: 'Disks', icon: 'mdi-harddisk', route: '/disks', visible: true },
  { id: 'pools', title: 'Pools', icon: 'mdi-view-array', route: '/pools', visible: true },
  { id: 'shares', title: 'Shares', icon: 'mdi-share', route: '/shares', visible: true },
  { id: 'remoteMounting', title: 'Remote', icon: 'mdi-cloud-sync', route: '/remoteMounting', visible: true },
  { id: 'mosHub', title: 'Hub', icon: 'mdi-hub', route: '/mosHub', visible: true },
  { id: 'docker', title: 'Docker', icon: 'mdi-docker', route: '/docker', visible: true },
  { id: 'lxc', title: 'LXC', icon: 'mdi-arrange-send-backward', route: '/lxc', visible: true },
  { id: 'vm', title: 'VM', icon: 'mdi-monitor-account', route: '/vm', visible: true },
  { id: 'users', title: 'Users', icon: 'mdi-account', route: '/users', visible: true },
  { id: 'webTerminal', title: 'Terminal', icon: 'mdi-powershell', route: '/webTerminal', visible: true },
  { id: 'plugins', title: 'Plugins', icon: 'mdi-puzzle', route: '/plugins', visible: true },
  { id: 'mosSettings', title: 'Settings', icon: 'mdi-tools', route: '/mosSettings', visible: true },
];

const layoutSettings = ref({
  navMode: 'sidebar',
  menuOrder: JSON.parse(JSON.stringify(defaultMenuItems)),
  headerPlugins: [],
});

const savingLayout = ref(false);
const installedPlugins = ref([]);
const loadingPlugins = ref(false);
let draggedIndex = null;

const getCurrentTheme = () => {
  return allThemes.value.find(t => t.id === currentTheme.value) || themes.value[0];
};

const getAuthHeaders = () => ({
  Authorization: 'Bearer ' + localStorage.getItem('authToken'),
});

const fetchSettings = async () => {
  try {
    const res = await fetch(`/api/v1/mos/plugins/settings/${PLUGIN_NAME}`, {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      currentTheme.value = data.theme || null;
      selectedTheme.value = data.theme || null;
      options.value = {
        enableGlow: data.enableGlow !== false,
        enableScanlines: data.enableScanlines === true,
        enableAnimations: data.enableAnimations !== false,
      };
      if (data.customization) {
        customization.value = {
          appName: data.customization.appName || '',
          logoUrl: data.customization.logoUrl || '',
          primaryColor: data.customization.primaryColor || '',
          secondaryColor: data.customization.secondaryColor || '',
          accentColor: data.customization.accentColor || '',
        };
      }
      if (data.layout) {
        layoutSettings.value = {
          navMode: data.layout.navMode || 'sidebar',
          menuOrder: data.layout.menuOrder || JSON.parse(JSON.stringify(defaultMenuItems)),
          headerPlugins: data.layout.headerPlugins || [],
        };
      }
      if (data.customThemes && Array.isArray(data.customThemes)) {
        customThemes.value = data.customThemes;
      }
      if (currentTheme.value) {
        applyThemeStyles(currentTheme.value);
      }
      applyBranding();
      applyLayout();
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
    const config = {
      theme: selectedTheme.value,
      ...options.value,
    };
    
    // Save to localStorage for persistence across page loads
    saveToLocalStorage(config);
    
    // Also try to save to backend API
    try {
      await fetch(`/api/v1/mos/plugins/settings/${PLUGIN_NAME}`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });
    } catch (apiError) {
      console.warn('Could not save to API, using localStorage only:', apiError);
    }

    currentTheme.value = selectedTheme.value;
    applyThemeStyles(selectedTheme.value);
    
    // Force reload to apply theme globally
    window.location.reload();
  } catch (e) {
    console.error('Failed to apply theme:', e);
  } finally {
    saving.value = false;
  }
};

const resetTheme = async () => {
  saving.value = true;
  try {
    const config = {
      theme: null,
      enableGlow: true,
      enableScanlines: false,
      enableAnimations: true,
    };
    
    // Clear from localStorage
    saveToLocalStorage(config);
    
    // Also try to clear from backend API
    try {
      await fetch(`/api/v1/mos/plugins/settings/${PLUGIN_NAME}`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });
    } catch (apiError) {
      console.warn('Could not save to API:', apiError);
    }

    currentTheme.value = null;
    selectedTheme.value = null;
    options.value = { enableGlow: true, enableScanlines: false, enableAnimations: true };
    removeThemeStyles();
  } catch (e) {
    console.error('Failed to reset theme:', e);
  } finally {
    saving.value = false;
  }
};

const saveOptions = async () => {
  savingOptions.value = true;
  try {
    const config = {
      theme: currentTheme.value,
      ...options.value,
    };
    
    // Save to localStorage
    saveToLocalStorage(config);
    
    // Also try to save to backend API
    try {
      await fetch(`/api/v1/mos/plugins/settings/${PLUGIN_NAME}`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });
    } catch (apiError) {
      console.warn('Could not save to API:', apiError);
    }

    if (currentTheme.value) {
      applyThemeStyles(currentTheme.value);
    }
  } catch (e) {
    console.error('Failed to save options:', e);
  } finally {
    savingOptions.value = false;
  }
};

const saveCustomization = async () => {
  savingCustomization.value = true;
  try {
    const config = {
      theme: currentTheme.value,
      ...options.value,
      customization: { ...customization.value },
    };
    
    saveToLocalStorage(config);
    
    try {
      await fetch(`/api/v1/mos/plugins/settings/${PLUGIN_NAME}`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });
    } catch (apiError) {
      console.warn('Could not save to API:', apiError);
    }

    if (currentTheme.value) {
      applyThemeStyles(currentTheme.value);
    }
    applyBranding();
  } catch (e) {
    console.error('Failed to save customization:', e);
  } finally {
    savingCustomization.value = false;
  }
};

const resetCustomization = () => {
  customization.value = {
    appName: '',
    logoUrl: '',
    primaryColor: '',
    secondaryColor: '',
    accentColor: '',
    buttonColor: '',
    buttonTextColor: '',
  };
};

// Logo Upload Functions
const selectLogo = (path) => {
  customization.value.logoUrl = path;
  showLogoDialog.value = false;
};

const selectManualLogo = () => {
  if (manualLogoUrl.value) {
    customization.value.logoUrl = manualLogoUrl.value;
    manualLogoUrl.value = '';
    showLogoDialog.value = false;
  }
};

const clearLogo = () => {
  customization.value.logoUrl = '';
  showLogoDialog.value = false;
};

const handleLogoUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  uploadingLogo.value = true;
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const headers = getAuthHeaders();
    const response = await fetch(`/api/v1/mos/plugins/${PLUGIN_NAME}/upload`, {
      method: 'POST',
      headers: {
        ...headers,
      },
      body: formData,
    });
    
    if (response.ok) {
      const result = await response.json();
      const logoPath = result.path || `/mos-plugins/${PLUGIN_NAME}/logos/${file.name}`;
      
      // Add to available logos
      availableLogos.value.push({
        name: file.name,
        path: logoPath,
        deletable: true,
      });
      
      // Select the uploaded logo
      customization.value.logoUrl = logoPath;
    } else {
      // Fallback: Use data URL for local preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        customization.value.logoUrl = dataUrl;
      };
      reader.readAsDataURL(file);
    }
  } catch (e) {
    console.error('Failed to upload logo:', e);
    // Fallback: Use data URL
    const reader = new FileReader();
    reader.onload = (e) => {
      customization.value.logoUrl = e.target.result;
    };
    reader.readAsDataURL(file);
  } finally {
    uploadingLogo.value = false;
    event.target.value = '';
  }
};

const deleteLogo = async (path) => {
  try {
    const headers = getAuthHeaders();
    await fetch(`/api/v1/mos/plugins/${PLUGIN_NAME}/logo?path=${encodeURIComponent(path)}`, {
      method: 'DELETE',
      headers,
    });
  } catch (e) {
    console.error('Failed to delete logo:', e);
  }
  
  // Remove from available logos
  availableLogos.value = availableLogos.value.filter(l => l.path !== path);
  
  // Clear if currently selected
  if (customization.value.logoUrl === path) {
    customization.value.logoUrl = '';
  }
};

const loadAvailableLogos = async () => {
  try {
    const headers = getAuthHeaders();
    const response = await fetch(`/api/v1/mos/plugins/${PLUGIN_NAME}/logos`, {
      headers,
    });
    
    if (response.ok) {
      const logos = await response.json();
      // Merge with default logos
      const customLogos = logos.map(l => ({
        name: l.name || l.path.split('/').pop(),
        path: l.path,
        deletable: true,
      }));
      availableLogos.value = [
        { name: 'MOS White', path: '/mos_white.png', deletable: false },
        { name: 'MOS Dark', path: '/mos_dark.png', deletable: false },
        ...customLogos,
      ];
    }
  } catch (e) {
    console.error('Failed to load available logos:', e);
  }
};

// Custom Theme Functions
const openThemeEditor = (theme = null) => {
  if (theme) {
    editingThemeId.value = theme.id;
    themeEditor.value = { ...theme };
  } else {
    editingThemeId.value = null;
    themeEditor.value = {
      name: '',
      description: '',
      primary: '#ff6b00',
      secondary: '#cc5500',
      accent: '#ffaa00',
      background: '#0d0d0d',
      surface: '#1a1a1a',
      textColor: '#e0e0e0',
      buttonColor: '#ff6b00',
      buttonTextColor: '#ffffff',
    };
  }
  showThemeEditor.value = true;
};

const closeThemeEditor = () => {
  showThemeEditor.value = false;
  editingThemeId.value = null;
};

const generateThemeId = (name) => {
  return 'custom-' + name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
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
      buttonTextColor: themeEditor.value.buttonTextColor || '#ffffff',
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
    
    // Save to localStorage and API
    const config = {
      theme: currentTheme.value,
      ...options.value,
      customization: { ...customization.value },
      customThemes: customThemes.value,
    };
    
    saveToLocalStorage(config);
    
    try {
      await fetch(`/api/v1/mos/plugins/settings/${PLUGIN_NAME}`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });
    } catch (apiError) {
      console.warn('Could not save to API:', apiError);
    }
    
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
    removeThemeStyles();
  }
  
  // Save to localStorage and API
  const config = {
    theme: currentTheme.value,
    ...options.value,
    customization: { ...customization.value },
    customThemes: customThemes.value,
  };
  
  saveToLocalStorage(config);
  
  try {
    await fetch(`/api/v1/mos/plugins/settings/${PLUGIN_NAME}`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });
  } catch (apiError) {
    console.warn('Could not save to API:', apiError);
  }
};

const applyBranding = () => {
  // Apply custom app name
  if (customization.value.appName) {
    const titleEl = document.querySelector('.v-toolbar-title__placeholder');
    if (titleEl) {
      titleEl.textContent = customization.value.appName;
    }
  }
  
  // Apply custom logo
  if (customization.value.logoUrl) {
    const logoImg = document.querySelector('.v-app-bar img.v-img__img');
    if (logoImg) {
      logoImg.src = customization.value.logoUrl;
    }
  }
};

// Layout functions
const onDragStart = (event, index) => {
  draggedIndex = index;
  event.dataTransfer.effectAllowed = 'move';
};

const onDrop = (event, targetIndex) => {
  if (draggedIndex === null || draggedIndex === targetIndex) return;
  
  const items = [...layoutSettings.value.menuOrder];
  const [draggedItem] = items.splice(draggedIndex, 1);
  items.splice(targetIndex, 0, draggedItem);
  layoutSettings.value.menuOrder = items;
  draggedIndex = null;
};

const resetLayout = () => {
  layoutSettings.value = {
    navMode: 'sidebar',
    menuOrder: JSON.parse(JSON.stringify(defaultMenuItems)),
    headerPlugins: [],
  };
};

const saveLayout = async () => {
  savingLayout.value = true;
  try {
    const config = {
      theme: currentTheme.value,
      ...options.value,
      customization: { ...customization.value },
      layout: {
        navMode: layoutSettings.value.navMode,
        menuOrder: layoutSettings.value.menuOrder,
        headerPlugins: layoutSettings.value.headerPlugins || [],
      },
    };
    
    saveToLocalStorage(config);
    
    try {
      await fetch(`/api/v1/mos/plugins/settings/${PLUGIN_NAME}`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });
    } catch (apiError) {
      console.warn('Could not save to API:', apiError);
    }

    applyLayout();
  } catch (e) {
    console.error('Failed to save layout:', e);
  } finally {
    savingLayout.value = false;
  }
};

const fetchInstalledPlugins = async () => {
  loadingPlugins.value = true;
  try {
    const res = await fetch('/api/v1/mos/plugins', {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      // MOS API returns { count, results: [...] }
      const pluginList = data.results || data.plugins || data.data || (Array.isArray(data) ? data : []);
      installedPlugins.value = pluginList
        .filter(p => p && p.name && p.name !== 'frontend-customizer')
        .map(p => ({
          name: p.name,
          displayName: p.displayName || p.name,
          icon: p.icon || 'mdi-puzzle',
          route: `/plugins/${p.name}`,
        }));
    }
  } catch (e) {
    console.error('Failed to fetch plugins:', e);
  } finally {
    loadingPlugins.value = false;
  }
};

const toggleHeaderPlugin = (pluginName, enabled) => {
  if (!layoutSettings.value.headerPlugins) {
    layoutSettings.value.headerPlugins = [];
  }
  
  if (enabled) {
    if (!layoutSettings.value.headerPlugins.includes(pluginName)) {
      layoutSettings.value.headerPlugins.push(pluginName);
    }
  } else {
    layoutSettings.value.headerPlugins = layoutSettings.value.headerPlugins.filter(
      p => p !== pluginName
    );
  }
};

const applyLayout = () => {
  const theme = getCurrentTheme();
  const navMode = layoutSettings.value.navMode;
  const menuOrder = layoutSettings.value.menuOrder;
  
  // Remove existing layout styles
  const existingLayoutStyle = document.getElementById('riddix-layout-styles');
  if (existingLayoutStyle) {
    existingLayoutStyle.remove();
  }
  
  // Remove existing header nav if present
  const existingHeaderNav = document.getElementById('riddix-header-nav');
  if (existingHeaderNav) {
    existingHeaderNav.remove();
  }

  if (navMode === 'header') {
    // Create header navigation CSS
    const layoutStyle = document.createElement('style');
    layoutStyle.id = 'riddix-layout-styles';
    layoutStyle.textContent = `
      /* Hide sidebar navigation drawer */
      .v-navigation-drawer {
        display: none !important;
      }
      
      /* Adjust main content for no sidebar */
      .v-main {
        padding-left: 0 !important;
      }
      
      /* Header nav container */
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
        color: ${theme?.textColor || '#b0b0b0'};
        background: rgba(255,255,255,0.03);
        border: 1px solid transparent;
        transition: all 0.2s ease;
        white-space: nowrap;
      }
      
      #riddix-header-nav a:hover {
        color: ${theme?.primary || '#00ff41'};
        background: rgba(${theme?.primary || '#00ff41'}, 0.1);
        border-color: ${theme?.primary || '#00ff41'}44;
        box-shadow: 0 0 10px ${theme?.primary || '#00ff41'}22;
      }
      
      #riddix-header-nav a.router-link-active,
      #riddix-header-nav a.router-link-exact-active {
        color: ${theme?.primary || '#00ff41'};
        background: ${theme?.primary || '#00ff41'}22;
        border-color: ${theme?.primary || '#00ff41'}66;
      }
      
      #riddix-header-nav a .v-icon {
        font-size: 14px;
      }
      
      /* Hide hamburger menu in header mode */
      .v-app-bar-nav-icon {
        display: none !important;
      }
      
      @media (max-width: 960px) {
        #riddix-header-nav {
          display: none;
        }
        .v-app-bar-nav-icon {
          display: flex !important;
        }
        .v-navigation-drawer {
          display: block !important;
        }
      }
    `;
    document.head.appendChild(layoutStyle);
    
    // Create header navigation element
    const appBar = document.querySelector('.v-app-bar .v-toolbar__content');
    if (appBar) {
      const headerNav = document.createElement('nav');
      headerNav.id = 'riddix-header-nav';
      
      const visibleItems = menuOrder.filter(item => item.visible);
      visibleItems.forEach(item => {
        if (item.id === 'logout') return; // Skip logout in header
        
        const link = document.createElement('a');
        link.href = item.route;
        link.innerHTML = '<span class="v-icon mdi ' + item.icon + '"></span><span>' + item.title + '</span>';
        link.addEventListener('click', (e) => {
          e.preventDefault();
          window.history.pushState({}, '', item.route);
          window.dispatchEvent(new PopStateEvent('popstate'));
        });
        headerNav.appendChild(link);
      });
      
      // Add header plugins as direct links
      const headerPlugins = layoutSettings.value.headerPlugins || [];
      if (headerPlugins.length > 0) {
        // Add separator
        const separator = document.createElement('span');
        separator.style.cssText = 'width: 1px; height: 20px; background: ' + (theme?.primary || '#00ff41') + '44; margin: 0 8px;';
        headerNav.appendChild(separator);
        
        // Add plugin links
        headerPlugins.forEach(pluginName => {
          const plugin = installedPlugins.value.find(p => p.name === pluginName);
          const link = document.createElement('a');
          link.href = `/plugins/${pluginName}`;
          link.innerHTML = '<span class="v-icon mdi ' + (plugin?.icon || 'mdi-puzzle') + '"></span><span>' + (plugin?.displayName || pluginName) + '</span>';
          link.style.cssText = 'background: ' + (theme?.primary || '#00ff41') + '11 !important; border-color: ' + (theme?.primary || '#00ff41') + '33 !important;';
          link.addEventListener('click', (e) => {
            e.preventDefault();
            window.history.pushState({}, '', `/plugins/${pluginName}`);
            window.dispatchEvent(new PopStateEvent('popstate'));
          });
          headerNav.appendChild(link);
        });
      }
      
      // Insert after the title (before spacer)
      const toolbarTitle = appBar.querySelector('.v-toolbar-title');
      const spacer = appBar.querySelector('.v-spacer');
      if (spacer) {
        appBar.insertBefore(headerNav, spacer);
      } else if (toolbarTitle && toolbarTitle.nextSibling) {
        appBar.insertBefore(headerNav, toolbarTitle.nextSibling);
      } else {
        appBar.appendChild(headerNav);
      }
    }
  }
};

const applyThemeStyles = (themeId) => {
  const theme = allThemes.value.find(t => t.id === themeId);
  if (!theme) return;

  removeThemeStyles();

  const glow = options.value.enableGlow;
  const anim = options.value.enableAnimations;
  
  // Use customization colors if set, otherwise fall back to theme colors
  const btnColor = customization.value.buttonColor || theme.buttonColor || theme.primary;
  const btnTextColor = customization.value.buttonTextColor || theme.buttonTextColor || '#ffffff';

  const styleEl = document.createElement('style');
  styleEl.id = 'riddix-theme-styles';
  styleEl.textContent = `
    /* ═══════════════════════════════════════════════════════════════
       RiDDiX HACKER THEME - Complete Redesign
       Theme: ${themeId}
    ═══════════════════════════════════════════════════════════════ */

    :root {
      --riddix-primary: ${theme.primary};
      --riddix-secondary: ${theme.secondary};
      --riddix-accent: ${theme.accent};
      --riddix-background: ${theme.background};
      --riddix-surface: ${theme.surface};
      --riddix-glow: ${glow ? `0 0 20px ${theme.primary}44` : 'none'};
    }

    /* ═══ GLOBAL STYLES ═══ */
    html, body {
      background-color: ${theme.background} !important;
      color: #e0e0e0 !important;
    }

    .v-application {
      background-color: ${theme.background} !important;
      font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace !important;
    }

    /* ═══ NOS NITRO RALLY STRIPES ═══ */
    ${themeId === 'nos-nitro' ? `
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
        linear-gradient(180deg, transparent 0%, ${theme.primary}08 50%, transparent 100%),
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
      transform: translateX(-50%);
      width: 200px;
      height: 200%;
      pointer-events: none;
      z-index: 0;
      background: linear-gradient(180deg, ${theme.primary}00 0%, ${theme.primary}06 20%, ${theme.accent}10 50%, ${theme.primary}06 80%, ${theme.primary}00 100%);
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

    /* ═══ LUMINA CIRCUIT LIGHT THEME ═══ */
    ${themeId === 'lumina-circuit' ? `
    html, body, .v-application {
      color: #000000 !important;
    }
    
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
      background: linear-gradient(135deg, ${theme.primary}10 0%, transparent 60%);
      border-radius: 0 0 0 100%;
      animation: ${anim ? 'luminaPulse 12s ease-in-out infinite' : 'none'};
    }
    
    @keyframes luminaPulse {
      0%, 100% { opacity: 0.5; transform: scale(1); }
      50% { opacity: 0.8; transform: scale(1.05); }
    }
    
    .v-main, .v-navigation-drawer, .v-app-bar { position: relative; z-index: 1; }
    
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
    
    .v-btn { color: #000000 !important; }
    .v-btn--variant-elevated, .v-btn--variant-flat {
      background: linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%) !important;
      color: white !important;
    }
    
    .v-list-item__title, .v-list-item__subtitle,
    .v-list-item-title, .v-list-item-subtitle,
    .v-application .v-list-item__title,
    .v-application .v-list-item-title,
    .v-application .v-list-item__subtitle,
    .v-application .v-list-item-subtitle { color: #000000 !important; }
    .v-list-item__title, .v-list-item-title { font-weight: 500 !important; }
    
    .v-application .v-card,
    .v-application .v-card *,
    .v-application .v-list *,
    .v-application .v-navigation-drawer *,
    .v-application .v-toolbar *,
    .v-application .v-app-bar * { color: #000000; }
    
    .v-application .v-icon { color: #000000 !important; }
    
    .v-navigation-drawer .v-list-item--active {
      background: linear-gradient(135deg, ${theme.primary}15 0%, ${theme.secondary}10 100%) !important;
      border-left: 3px solid ${theme.primary} !important;
    }
    
    .v-navigation-drawer .v-list-item--active .v-list-item__title {
      color: ${theme.primary} !important;
      font-weight: 600 !important;
    }
    
    .v-data-table { background: rgba(255,255,255,0.9) !important; }
    .v-data-table th {
      background: ${theme.primary}08 !important;
      color: ${theme.primary} !important;
      font-weight: 600 !important;
    }
    
    .v-text-field .v-field {
      background: rgba(255,255,255,0.95) !important;
      border: 1px solid #d0d7de !important;
    }
    .v-text-field .v-field:hover { border-color: ${theme.primary}50 !important; }
    .v-text-field .v-field--focused {
      border-color: ${theme.primary} !important;
      box-shadow: 0 0 0 3px ${theme.primary}20 !important;
    }
    
    .v-chip {
      background: ${theme.primary}12 !important;
      color: ${theme.primary} !important;
      border: 1px solid ${theme.primary}30 !important;
    }
    
    .v-progress-linear { background: ${theme.primary}15 !important; }
    .v-progress-linear__determinate {
      background: linear-gradient(90deg, ${theme.primary} 0%, ${theme.secondary} 100%) !important;
    }
    
    ::selection { background: ${theme.primary}30 !important; color: #000000 !important; }
    ::-webkit-scrollbar-thumb { background: ${theme.primary}40 !important; }
    ::-webkit-scrollbar-thumb:hover { background: ${theme.primary}60 !important; }
    ::-webkit-scrollbar-track { background: ${theme.background} !important; }
    ` : ''}

    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-track { background: ${theme.background}; }
    ::-webkit-scrollbar-thumb { background: ${theme.primary}44; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: ${theme.primary}88; }

    ::selection { background: ${theme.primary}44; color: ${theme.primary}; }

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

    .v-navigation-drawer .v-list-item--active .v-list-item-title { color: ${theme.primary} !important; font-weight: 600 !important; }
    .v-navigation-drawer .v-icon { color: ${theme.primary}aa !important; }
    .v-navigation-drawer .v-list-item--active .v-icon { color: ${theme.primary} !important; ${glow ? `filter: drop-shadow(0 0 4px ${theme.primary}88);` : ''} }

    /* ═══ CARDS ═══ */
    .v-card {
      background: linear-gradient(135deg, ${theme.surface} 0%, ${theme.background} 100%) !important;
      border: 1px solid ${theme.primary}22 !important;
      border-radius: 12px !important;
      ${glow ? `box-shadow: 0 4px 30px ${theme.primary}11, inset 0 1px 0 ${theme.primary}11 !important;` : ''}
      backdrop-filter: blur(10px);
      transition: all 0.3s ease !important;
    }

    .v-card:hover { border-color: ${theme.primary}44 !important; ${glow ? `box-shadow: 0 8px 40px ${theme.primary}22 !important;` : ''} }
    .v-card-title { color: ${theme.primary} !important; font-weight: 600 !important; font-size: 1.1rem !important; border-bottom: 1px solid ${theme.primary}22; padding-bottom: 12px !important; margin-bottom: 12px !important; }
    .v-card-subtitle { color: #888 !important; }
    .v-card-text { color: #b0b0b0 !important; }

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
      background: linear-gradient(135deg, ${btnColor} 0%, ${theme.secondary} 100%) !important;
      color: ${btnTextColor} !important;
      border: none !important;
      ${glow ? `box-shadow: 0 4px 15px ${btnColor}44 !important;` : ''}
    }

    .v-btn--variant-elevated:hover, .v-btn--variant-flat:hover {
      ${anim ? 'transform: translateY(-2px) scale(1.02) !important;' : ''}
      ${glow ? `box-shadow: 0 6px 25px ${btnColor}66 !important;` : ''}
    }

    .v-btn--variant-outlined { border: 1px solid ${btnColor}66 !important; color: ${btnColor} !important; background: transparent !important; }
    .v-btn--variant-outlined:hover { background: ${btnColor}11 !important; border-color: ${btnColor} !important; }
    .v-btn--variant-text { color: ${btnColor} !important; }
    .v-btn--variant-text:hover { background: ${btnColor}11 !important; }
    .v-btn--icon { border-radius: 50% !important; }
    .v-btn--icon:hover { background: ${btnColor}22 !important; ${glow ? `box-shadow: 0 0 15px ${btnColor}44 !important;` : ''} }
    .v-btn .v-icon { 
      ${glow ? `filter: drop-shadow(0 0 2px ${btnColor}44);` : ''} 
      --v-icon-size-multiplier: .8571428571;
    }
    .v-btn__content > .v-icon--start {
      margin-inline: calc(var(--v-btn-height) / -9) calc(var(--v-btn-height) / 4.5);
    }
    .v-btn--variant-elevated .v-icon,
    .v-btn--variant-flat .v-icon {
      color: ${btnTextColor} !important;
    }
    .v-btn--variant-outlined .v-icon,
    .v-btn--variant-text .v-icon {
      color: ${btnColor} !important;
    }

    /* ═══ DATA TABLES ═══ */
    .v-data-table { background: ${theme.surface} !important; border: 1px solid ${theme.primary}22 !important; border-radius: 12px !important; overflow: hidden !important; }
    .v-data-table-header { background: linear-gradient(180deg, ${theme.surface} 0%, ${theme.background} 100%) !important; }
    .v-data-table-header th { color: ${theme.primary} !important; font-weight: 600 !important; text-transform: uppercase !important; font-size: 0.75rem !important; letter-spacing: 1px !important; border-bottom: 2px solid ${theme.primary}33 !important; }
    .v-data-table__tr { border-bottom: 1px solid ${theme.primary}11 !important; transition: all 0.2s ease !important; }
    .v-data-table__tr:hover { background: linear-gradient(90deg, ${theme.primary}11 0%, transparent 100%) !important; }
    .v-data-table__tr td { color: #c0c0c0 !important; border-bottom: 1px solid ${theme.primary}11 !important; }
    .v-data-table-footer { background: ${theme.surface} !important; border-top: 1px solid ${theme.primary}22 !important; }

    /* ═══ INPUTS / TEXT FIELDS ═══ */
    .v-field { background: ${theme.background} !important; border: 1px solid ${theme.primary}33 !important; border-radius: 8px !important; transition: all 0.2s ease !important; }
    .v-field:hover { border-color: ${theme.primary}66 !important; }
    .v-field--focused { border-color: ${theme.primary} !important; ${glow ? `box-shadow: 0 0 15px ${theme.primary}33 !important;` : ''} }
    .v-field__input { color: #e0e0e0 !important; }
    .v-label { color: #888 !important; }
    .v-field--focused .v-label { color: ${theme.primary} !important; }

    /* ═══ SELECT / DROPDOWN ═══ */
    .v-select .v-field { background: ${theme.background} !important; }
    .v-menu > .v-overlay__content { background: ${theme.surface} !important; border: 1px solid ${theme.primary}33 !important; border-radius: 8px !important; ${glow ? `box-shadow: 0 8px 30px ${theme.primary}22 !important;` : ''} }
    .v-list { background: transparent !important; }
    .v-list-item { transition: all 0.15s ease !important; }
    .v-list-item:hover { background: ${theme.primary}15 !important; }
    .v-list-item--active { background: ${theme.primary}22 !important; }
    .v-list-item-title { color: #c0c0c0 !important; }
    .v-list-item--active .v-list-item-title { color: ${theme.primary} !important; }

    /* ═══ DIALOGS / MODALS ═══ */
    .v-dialog > .v-overlay__content { background: ${theme.surface} !important; border: 1px solid ${theme.primary}33 !important; border-radius: 16px !important; ${glow ? `box-shadow: 0 20px 60px ${theme.primary}22 !important;` : ''} }
    .v-dialog .v-card { background: transparent !important; border: none !important; box-shadow: none !important; }

    /* ═══ CHIPS ═══ */
    .v-chip { background: ${theme.primary}22 !important; border: 1px solid ${theme.primary}44 !important; color: ${theme.primary} !important; font-family: 'JetBrains Mono', monospace !important; font-size: 0.8rem !important; }
    .v-chip--variant-elevated { background: linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%) !important; color: ${theme.background} !important; ${glow ? `box-shadow: 0 2px 10px ${theme.primary}44 !important;` : ''} }

    /* ═══ PROGRESS BARS ═══ */
    .v-progress-linear { background: ${theme.background} !important; border-radius: 4px !important; overflow: hidden !important; }
    .v-progress-linear__background { background: ${theme.primary}22 !important; }
    .v-progress-linear__determinate, .v-progress-linear__indeterminate { background: linear-gradient(90deg, ${theme.secondary} 0%, ${theme.primary} 50%, ${theme.accent} 100%) !important; ${glow ? `box-shadow: 0 0 15px ${theme.primary}66 !important;` : ''} }
    .v-progress-circular__overlay { stroke: ${theme.primary} !important; }

    /* ═══ SWITCHES / TOGGLES ═══ */
    .v-switch .v-selection-control__input > .v-icon { color: ${theme.primary} !important; }
    .v-switch--inset .v-switch__track { background: ${theme.primary}33 !important; }
    .v-switch--inset.v-switch--selected .v-switch__track { background: ${theme.primary}66 !important; ${glow ? `box-shadow: 0 0 10px ${theme.primary}44 !important;` : ''} }
    .v-checkbox .v-selection-control__input > .v-icon { color: ${theme.primary} !important; }

    /* ═══ TABS ═══ */
    .v-tabs { background: transparent !important; }
    .v-tab { color: #888 !important; text-transform: uppercase !important; letter-spacing: 1px !important; font-weight: 500 !important; transition: all 0.2s ease !important; }
    .v-tab:hover { color: ${theme.primary}aa !important; background: ${theme.primary}11 !important; }
    .v-tab--selected { color: ${theme.primary} !important; background: ${theme.primary}15 !important; }
    .v-tabs-slider { background: ${theme.primary} !important; ${glow ? `box-shadow: 0 0 10px ${theme.primary}66 !important;` : ''} }

    /* ═══ EXPANSION PANELS ═══ */
    .v-expansion-panels { background: transparent !important; }
    .v-expansion-panel { background: ${theme.surface} !important; border: 1px solid ${theme.primary}22 !important; margin-bottom: 8px !important; border-radius: 8px !important; }
    .v-expansion-panel-title { color: #c0c0c0 !important; font-weight: 500 !important; }
    .v-expansion-panel--active .v-expansion-panel-title { color: ${theme.primary} !important; }
    .v-expansion-panel-text { color: #a0a0a0 !important; }

    /* ═══ SLIDERS ═══ */
    .v-slider-track__background { background: ${theme.primary}33 !important; }
    .v-slider-track__fill { background: ${theme.primary} !important; ${glow ? `box-shadow: 0 0 8px ${theme.primary}66 !important;` : ''} }
    .v-slider-thumb__surface { background: ${theme.primary} !important; ${glow ? `box-shadow: 0 0 12px ${theme.primary}88 !important;` : ''} }

    /* ═══ SNACKBAR / ALERTS ═══ */
    .v-snackbar__wrapper { background: ${theme.surface} !important; border: 1px solid ${theme.primary}44 !important; ${glow ? `box-shadow: 0 8px 30px ${theme.primary}33 !important;` : ''} }
    .v-alert { border: 1px solid ${theme.primary}44 !important; border-radius: 8px !important; }

    /* ═══ MISC ═══ */
    .v-divider { border-color: ${theme.primary}22 !important; }
    .v-tooltip > .v-overlay__content { background: ${theme.surface} !important; border: 1px solid ${theme.primary}44 !important; color: ${theme.primary} !important; font-family: 'JetBrains Mono', monospace !important; font-size: 0.8rem !important; ${glow ? `box-shadow: 0 4px 20px ${theme.primary}33 !important;` : ''} }
    .v-avatar { border: 2px solid ${theme.primary}44 !important; ${glow ? `box-shadow: 0 0 15px ${theme.primary}22 !important;` : ''} }
    .v-badge__badge { background: ${theme.primary} !important; color: ${theme.background} !important; font-weight: 600 !important; ${glow ? `box-shadow: 0 0 10px ${theme.primary}66 !important;` : ''} }
    .v-btn--fab { background: linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%) !important; ${glow ? `box-shadow: 0 6px 25px ${theme.primary}66 !important;` : ''} }
    .v-btn--fab:hover { ${anim ? 'transform: scale(1.1) !important;' : ''} ${glow ? `box-shadow: 0 10px 40px ${theme.primary}88 !important;` : ''} }
    .v-menu__content { background: ${theme.surface} !important; border: 1px solid ${theme.primary}33 !important; border-radius: 8px !important; }
    .v-pagination__item { background: ${theme.surface} !important; border: 1px solid ${theme.primary}33 !important; color: #a0a0a0 !important; }
    .v-pagination__item--is-active { background: ${theme.primary} !important; color: ${theme.background} !important; ${glow ? `box-shadow: 0 0 15px ${theme.primary}66 !important;` : ''} }
    .v-timeline-item__dot { background: ${theme.primary} !important; ${glow ? `box-shadow: 0 0 15px ${theme.primary}66 !important;` : ''} }
    .v-timeline-divider__inner-dot { background: ${theme.primary} !important; }
    .v-sparkline path { stroke: ${theme.primary} !important; }
    .v-icon { color: ${theme.primary}cc !important; }
    .text-success .v-icon, .text-success { color: ${theme.primary} !important; }
    .text-error .v-icon, .text-error { color: #ff4444 !important; }
    .text-warning .v-icon, .text-warning { color: #ffaa00 !important; }

    /* ═══ SKELETON LOADERS ═══ */
    .v-skeleton-loader__bone { background: linear-gradient(90deg, ${theme.surface} 0%, ${theme.primary}22 50%, ${theme.surface} 100%) !important; background-size: 200% 100% !important; animation: skeleton-loading 1.5s infinite !important; }
    @keyframes skeleton-loading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

    /* ═══ SCANLINES EFFECT ═══ */
    ${options.value.enableScanlines ? `
    body::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
      background: repeating-linear-gradient(0deg, transparent, transparent 2px, ${theme.primary}05 2px, ${theme.primary}05 4px);
      animation: scanlines 0.1s linear infinite;
    }
    @keyframes scanlines { 0% { transform: translateY(0); } 100% { transform: translateY(4px); } }
    ` : ''}

    /* ═══ CUSTOM ANIMATIONS ═══ */
    ${anim ? `
    @keyframes glow-pulse { 0%, 100% { box-shadow: 0 0 20px ${theme.primary}22; } 50% { box-shadow: 0 0 30px ${theme.primary}44; } }
    .v-card { animation: glow-pulse 4s ease-in-out infinite; }
    ` : ''}
  `;
  document.head.appendChild(styleEl);
};

const removeThemeStyles = () => {
  const existing = document.getElementById('riddix-theme-styles');
  if (existing) {
    existing.remove();
  }
};

onMounted(async () => {
  try {
    // First, try to load from localStorage (instant)
    const storedConfig = loadFromLocalStorage();
    if (storedConfig) {
      currentTheme.value = storedConfig.theme || null;
      selectedTheme.value = storedConfig.theme || null;
      options.value = {
        enableGlow: storedConfig.enableGlow !== false,
        enableScanlines: storedConfig.enableScanlines === true,
        enableAnimations: storedConfig.enableAnimations !== false,
      };
      if (currentTheme.value) {
        applyThemeStyles(currentTheme.value);
      }
    }
    
    // Then try to fetch from API (may override localStorage)
    try {
      await fetchSettings();
    } catch (apiError) {
      console.warn('Could not fetch from API, using localStorage:', apiError);
    }
    
    // Load available logos
    await loadAvailableLogos();
  } catch (e) {
    console.error('Failed to initialize:', e);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.theme-card {
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
  border-color: rgba(255, 255, 255, 0.3);
}

.logo-card.selected {
  border-color: var(--v-theme-primary);
  background: rgba(var(--v-theme-primary), 0.1);
}

.logo-card .delete-btn {
  position: absolute;
  top: 2px;
  right: 2px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.logo-card:hover .delete-btn {
  opacity: 1;
}

.logo-preview {
  display: inline-block;
}
</style>
