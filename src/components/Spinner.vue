<template>
  <div class="spinner-container">
    <div class="loader">
      <div class="loader-circle"></div>
      <div class="loader-circle"></div>
      <div class="loader-circle"></div>
    </div>
    <p v-if="message" class="spinner-text">{{ message }}</p>
  </div>
</template>

<script setup>
defineProps({
  message: {
    type: String,
    default: 'A processar de forma segura...'
  }
});
</script>

<style scoped>
.spinner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  width: 100%;
}

.loader {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.loader-circle {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: var(--primary-color);
  animation: bounce 1.4s infinite ease-in-out both;
}

.loader-circle:nth-child(1) {
  animation-delay: -0.32s;
  background-color: #1E3A8A; /* Dark blue */
}

.loader-circle:nth-child(2) {
  animation-delay: -0.16s;
  background-color: #3B82F6; /* Primary blue */
}

.loader-circle:nth-child(3) {
  background-color: #60A5FA; /* Light blue */
}

@keyframes bounce {
  0%, 80%, 100% { 
    transform: scale(0);
  } 40% { 
    transform: scale(1);
  }
}

.spinner-text {
  color: var(--text-muted);
  font-size: 0.9rem;
  font-weight: 500;
  letter-spacing: 0.5px;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
