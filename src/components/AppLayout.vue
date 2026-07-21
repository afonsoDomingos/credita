<template>
  <div class="app-container">
    <Sidebar :collapsed="sidebarCollapsed" @toggle="toggleSidebar" :mobile-open="mobileSidebarOpen" @close-mobile="mobileSidebarOpen = false" />
    
    <div class="main-content-wrapper">
      
      <!-- IMPERSONATION BANNER -->
      <div v-if="isImpersonating" class="impersonation-banner bg-orange-600 text-white p-3 text-center text-sm font-bold flex justify-center items-center gap-4 shadow-md z-50 relative">
        <span>Atenção: A visualizar como Gestor (Modo Superadmin)</span>
        <button @click="returnToSuperadmin" class="bg-white text-orange-600 px-3 py-1 rounded-md text-xs hover:bg-orange-50 transition-colors">
          Voltar ao Superadmin
        </button>
      </div>

      <Header @toggle-mobile-sidebar="mobileSidebarOpen = true" />
      
      <!-- Expiry Alert Banner -->
      <div v-if="daysRemaining !== null && daysRemaining <= 5 && daysRemaining > 0" class="expiry-banner bg-yellow-100 text-yellow-800 p-3 text-center text-sm font-semibold border-b border-yellow-200">
        Atenção: A sua assinatura expira em {{ daysRemaining }} dia{{ daysRemaining > 1 ? 's' : '' }}! <router-link to="/app/assinatura" class="underline text-blue-600">Renovar agora</router-link>.
      </div>
      
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
import api from '../api';

const sidebarCollapsed = ref(false);
const mobileSidebarOpen = ref(false);
const daysRemaining = ref(null);
const isImpersonating = ref(false);

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value;
};

const returnToSuperadmin = () => {
  const superToken = localStorage.getItem('superadmin_token');
  const superUser = localStorage.getItem('superadmin_user');
  
  if (superToken && superUser) {
    localStorage.setItem('token', superToken);
    localStorage.setItem('user', superUser);
    localStorage.removeItem('superadmin_token');
    localStorage.removeItem('superadmin_user');
    window.location.href = '/admin';
  }
};

const loadCompanyData = async () => {
  try {
    const { data } = await api.get('/company/settings');
    if (data.nextBillingDate) {
      const next = new Date(data.nextBillingDate);
      const now = new Date();
      const diffTime = next - now;
      daysRemaining.value = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } else if (data.subscriptionPlan === 'trial') {
      const created = new Date(data.createdAt);
      created.setDate(created.getDate() + 30);
      const now = new Date();
      const diffTime = created - now;
      daysRemaining.value = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
  } catch (error) {
    console.error('Error loading expiry data');
  }
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
  isImpersonating.value = !!localStorage.getItem('superadmin_token');
  handleResize();
  loadCompanyData();
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
