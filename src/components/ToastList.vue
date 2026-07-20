<template>
  <div class="toast-container">
    <TransitionGroup name="toast-list">
      <div 
        v-for="toast in toasts" 
        :key="toast.id" 
        class="toast" 
        :class="[`toast-${toast.type}`]"
      >
        <div class="toast-icon">
          <CheckCircle v-if="toast.type === 'success'" :size="20" />
          <AlertCircle v-else-if="toast.type === 'error'" :size="20" />
          <Info v-else :size="20" />
        </div>
        <div class="toast-content">
          {{ toast.message }}
        </div>
        <button class="toast-close" @click="remove(toast.id)">
          <X :size="16" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { CheckCircle, AlertCircle, Info, X } from '@lucide/vue';
import { useToast } from '../composables/useToast';

const { toasts, remove } = useToast();
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  pointer-events: auto;
  min-width: 300px;
  max-width: 400px;
  border-left: 4px solid transparent;
}

.toast-success {
  border-left-color: #10B981;
}

.toast-success .toast-icon {
  color: #10B981;
}

.toast-error {
  border-left-color: #EF4444;
}

.toast-error .toast-icon {
  color: #EF4444;
}

.toast-info {
  border-left-color: #3B82F6;
}

.toast-info .toast-icon {
  color: #3B82F6;
}

.toast-content {
  flex: 1;
  font-size: 0.95rem;
  font-weight: 500;
  color: #1F2937;
}

.toast-close {
  background: transparent;
  border: none;
  color: #9CA3AF;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 50%;
  transition: all 0.2s;
}

.toast-close:hover {
  background-color: #F3F4F6;
  color: #4B5563;
}

/* Transitions */
.toast-list-enter-active,
.toast-list-leave-active {
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.toast-list-enter-from {
  opacity: 0;
  transform: translateX(50px) scale(0.9);
}

.toast-list-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.9);
}
</style>
