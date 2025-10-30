<template>
  <div class="swagger-container">
    <div id="swagger-ui"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

const props = defineProps<{
  spec: string;
}>();

onMounted(async () => {
  // Dynamically import SwaggerUIBundle
  const SwaggerUIBundle = (await import('swagger-ui-dist/swagger-ui-bundle.js')).default;
  
  // Import Swagger UI CSS
  await import('swagger-ui-dist/swagger-ui.css');
  
  // Initialize Swagger UI
  SwaggerUIBundle({
    url: props.spec,
    dom_id: '#swagger-ui',
    deepLinking: true,
    presets: [
      SwaggerUIBundle.presets.apis
    ],
    layout: "BaseLayout"
  });
});
</script>

<style scoped>
.swagger-container {
  margin: 2rem 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
}

.swagger-container :deep(#swagger-ui) {
  font-family: inherit;
}

.swagger-container :deep(.swagger-ui .info) {
  margin: 2rem 0;
}
</style>

