<template>
  <div class="app-container">
    <!-- Superadmin Sidebar Simplificada -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="logo-area">
          <img src="/logo.png" alt="Microcrédito Admin" style="height: 40px; object-fit: contain;" />
        </div>
      </div>
      <div class="sidebar-content">
        <nav class="sidebar-nav">
          <ul>
            <li>
              <router-link to="/admin" class="nav-item" active-class="active">
                <Building2 :size="20" class="mr-3" />
                <span class="nav-text">Empresas (Inquilinos)</span>
              </router-link>
            </li>
          </ul>
        </nav>
        <div class="sidebar-footer">
          <ul>
            <li>
              <a href="#" @click.prevent="logout" class="nav-item logout">
                <LogOut :size="20" class="mr-3" />
                <span class="nav-text">Terminar Sessão</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </aside>

    <div class="main-content-wrapper">
      <header class="header">
        <div class="header-left">
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
import { useRouter } from 'vue-router';
import { Building2, LogOut } from '@lucide/vue';
import ToastList from './ToastList.vue';
const router = useRouter();

const logout = () => {
  localStorage.removeItem('user');
  router.push('/login');
};
</script>

<style scoped>
/* Aproveitar as classes globais do layout. Adicionar apenas o essencial para simplificar. */
.sidebar {
  width: var(--sidebar-width);
  height: 100vh;
  background-color: var(--bg-surface);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  height: var(--header-height);
  display: flex;
  align-items: center;
  padding: 0 20px;
  border-bottom: 1px solid var(--border-color);
}

.sidebar-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px 0;
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

.header {
  height: var(--header-height);
  background-color: var(--bg-surface);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  padding: 0 24px;
}
</style>
