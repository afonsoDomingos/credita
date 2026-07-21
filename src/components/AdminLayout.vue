<template>
  <div class="app-container" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
    <!-- Superadmin Sidebar Simplificada -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="logo-area" v-if="!isSidebarCollapsed">
          <img src="/logo.png" alt="Microcrédito Admin" style="height: 40px; object-fit: contain;" />
        </div>
        <div class="logo-mini" v-else>
          <div class="mini-logo-placeholder">A</div>
        </div>
      </div>
      <div class="sidebar-content">
        <nav class="sidebar-nav">
          <ul>
            <li>
              <router-link to="/admin" class="nav-item" active-class="active" :title="isSidebarCollapsed ? 'Empresas' : ''">
                <Building2 :size="20" :class="{'mr-3': !isSidebarCollapsed}" />
                <span class="nav-text" v-if="!isSidebarCollapsed">Empresas (Inquilinos)</span>
              </router-link>
            </li>
          </ul>
        </nav>
        <div class="sidebar-footer">
          <ul>
            <li>
              <button class="nav-item toggle-btn" @click="toggleSidebar" :title="isSidebarCollapsed ? 'Expandir Menu' : 'Ocultar Menu'">
                <ChevronLeft v-if="!isSidebarCollapsed" :size="20" class="mr-3" />
                <ChevronRight v-else :size="20" />
                <span class="nav-text" v-if="!isSidebarCollapsed">Ocultar Menu</span>
              </button>
            </li>
            <li>
              <a href="#" @click.prevent="logout" class="nav-item logout" :title="isSidebarCollapsed ? 'Terminar Sessão' : ''">
                <LogOut :size="20" :class="{'mr-3': !isSidebarCollapsed}" />
                <span class="nav-text" v-if="!isSidebarCollapsed">Terminar Sessão</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </aside>

    <div class="main-content-wrapper">
      <header class="header">
        <div class="header-left flex items-center gap-4">
          <button class="mobile-menu-btn d-lg-none" @click="toggleSidebar">
            <Menu :size="24" />
          </button>
          <h1 class="font-semibold">Painel Superadmin</h1>
        </div>
      </header>
      <main class="main-content">
        <router-view></router-view>
      </main>
    </div>
    
    <!-- Global Toast Notifications -->
    <ToastList />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Building2, LogOut, ChevronLeft, ChevronRight, Menu } from '@lucide/vue';
import ToastList from './ToastList.vue';
const router = useRouter();

const isSidebarCollapsed = ref(false);

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
};

const logout = () => {
  localStorage.removeItem('user');
  router.push('/login');
};
</script>

<style scoped>
/* Aproveitar as classes globais do layout. Adicionar apenas o essencial para simplificar. */
.app-container {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.sidebar {
  width: var(--sidebar-width);
  height: 100vh;
  background-color: var(--bg-surface);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  z-index: 100;
}

.sidebar-collapsed .sidebar {
  width: 80px;
}

.sidebar-header {
  height: var(--header-height);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  border-bottom: 1px solid var(--border-color);
}

.mini-logo-placeholder {
  width: 40px;
  height: 40px;
  background-color: var(--primary-color);
  color: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
}

.sidebar-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px 0;
  overflow-y: auto;
  overflow-x: hidden;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  margin: 4px 16px;
  border-radius: var(--radius-md);
  color: var(--text-muted);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
  border: none;
  background: none;
  width: calc(100% - 32px);
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  font-size: 1rem;
}

.sidebar-collapsed .nav-item {
  justify-content: center;
  padding: 12px;
}

.mr-3 { margin-right: 12px; }

.nav-item:hover {
  background-color: var(--bg-body);
  color: var(--text-main);
}

.nav-item.active {
  background-color: #EFF6FF;
  color: #3B82F6;
}

.nav-item.logout:hover {
  background-color: #FEF2F2;
  color: #DC2626;
}

.main-content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  height: var(--header-height);
  background-color: var(--bg-surface);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  padding: 0 24px;
  flex-shrink: 0;
}

.mobile-menu-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-main);
  padding: 4px;
}

.d-lg-none {
  display: none;
}

@media (max-width: 991px) {
  .d-lg-none {
    display: block;
  }
  
  .sidebar {
    position: fixed;
    transform: translateX(-100%);
  }
  
  .sidebar-collapsed .sidebar {
    transform: translateX(0);
    width: var(--sidebar-width);
  }
}
</style>
