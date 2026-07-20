<template>
  <div class="app-container">
    <Sidebar :collapsed="sidebarCollapsed" @toggle="toggleSidebar" :mobile-open="mobileSidebarOpen" @close-mobile="mobileSidebarOpen = false" />
    
    <div class="main-content-wrapper">
      <Header @toggle-mobile-sidebar="mobileSidebarOpen = true" />
      <main class="main-content">
        <router-view></router-view>
      </main>
    </div>
    
    <!-- Mobile overlay -->
    <div 
      v-if="mobileSidebarOpen" 
      class="mobile-overlay" 
      @click="mobileSidebarOpen = false"
    ></div>
    
    <!-- Global Toast Notifications -->
    <ToastList />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import Sidebar from './Sidebar.vue';
import Header from './Header.vue';
import ToastList from './ToastList.vue';

const sidebarCollapsed = ref(false);
const mobileSidebarOpen = ref(false);

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value;
};

// Handle responsive logic
const handleResize = () => {
  if (window.innerWidth <= 1024) {
    sidebarCollapsed.value = true;
  } else {
    sidebarCollapsed.value = false;
    mobileSidebarOpen.value = false;
  }
};

onMounted(() => {
  handleResize();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 40;
  display: none;
}

@media (max-width: 768px) {
  .mobile-overlay {
    display: block;
  }
}
</style>
