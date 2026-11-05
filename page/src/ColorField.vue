<template>
  <div class="d-flex align-center">
    <v-menu :close-on-content-click="false">
      <template v-slot:activator="{ props }">
        <v-btn
          v-bind="props"
          :aria-label="`Pick ${label}`"
          variant="flat"
          size="small"
          class="swatch mr-3"
          :style="{ '--swatch': model || fallback }"
        />
      </template>
      <v-color-picker v-model="model" mode="hex" :hide-inputs="!inputs" />
    </v-menu>
    <v-text-field
      v-model="model"
      :label="label"
      :placeholder="placeholder"
      variant="outlined"
      density="compact"
      hide-details
    />
  </div>
</template>

<script setup>
// Colour swatch with a picker menu and a hex text field, bound with v-model.
const model = defineModel({ type: String });
defineProps({
  label: String,
  placeholder: String,
  fallback: String,
  inputs: Boolean,
});
</script>

<style scoped>
/* Scoped + !important outranks theme-loader's .v-btn--variant-flat gradient and border */
.swatch {
  min-width: 40px;
  height: 40px;
  background: var(--swatch) !important;
  border: 1px solid rgba(127, 127, 127, 0.4) !important;
}
</style>
