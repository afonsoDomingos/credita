<template>
  <div class="placeholder-view">
    <div class="surface empty-state">
      <h2>{{ route.name }}</h2>
      <p class="text-muted">Esta página está em construção.</p>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router';
const route = useRoute();
</script>

<style scoped>
.placeholder-view {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
.empty-state {
  padding: 48px;
  text-align: center;
  max-width: 400px;
  width: 100%;
}
.empty-state h2 {
  margin-bottom: 8px;
  color: var(--primary-color);
}
</style>
