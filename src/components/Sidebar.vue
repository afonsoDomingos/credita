<template>
  <aside :class="['sidebar', { 'collapsed': collapsed, 'mobile-open': mobileOpen }]">
    <div class="sidebar-header">
      <div class="logo-area" v-if="!collapsed">
        <img src="/logo.png" alt="Microcrédito" style="height: 40px; object-fit: contain;" />
      </div>
      <div class="logo-area-collapsed" v-else style="display: flex; justify-content: center; width: 100%;">
        <img src="/logo.png" alt="Microcrédito" style="height: 28px; object-fit: contain;" />
      </div>
      <button class="collapse-btn desktop-only" @click="$emit('toggle')">
        <ChevronLeft v-if="!collapsed" :size="20" />
        <ChevronRight v-else :size="20" />
      </button>
      <button class="close-mobile-btn mobile-only" @click="$emit('close-mobile')">
        <X :size="24" />
      </button>
    </div>

    <div class="sidebar-content">
      <nav class="sidebar-nav">
        <ul>
          <li v-for="item in menuItems" :key="item.path" :title="collapsed ? item.name : ''">
            <router-link :to="item.path" class="nav-item" active-class="active">
              <component :is="item.icon" :size="20" class="nav-icon" />
              <span class="nav-text" v-if="!collapsed">{{ item.name }}</span>
            </router-link>
          </li>
        </ul>
      </nav>

      <div class="sidebar-footer">
        <ul>
          <li :title="collapsed ? 'Configurações' : ''">
            <router-link to="/app/configuracoes" class="nav-item" active-class="active">
              <Settings :size="20" class="nav-icon" />
              <span class="nav-text" v-if="!collapsed">Configurações</span>
            </router-link>
          </li>
          <li :title="collapsed ? 'Ajuda' : ''">
            <router-link to="/app/ajuda" class="nav-item" active-class="active">
              <HelpCircle :size="20" class="nav-icon" />
              <span class="nav-text" v-if="!collapsed">Ajuda</span>
            </router-link>
          </li>
          <li :title="collapsed ? 'Terminar Sessão' : ''">
            <a href="#" class="nav-item logout" @click.prevent="logout">
              <LogOut :size="20" class="nav-icon" />
              <span class="nav-text" v-if="!collapsed">Terminar Sessão</span>
            </a>
          </li>
        </ul>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { 
  Building2, 
  ChevronLeft, 
  ChevronRight, 
  X,
  LayoutDashboard, 
  Users, 
  Banknote, 
  CreditCard, 
  Calendar, 
  FileText, 
  ReceiptText, 
  Bell, 
  BarChart3, 
  Building, 
  Briefcase, 
  Settings, 
  HelpCircle, 
  LogOut 
} from '@lucide/vue';

const router = useRouter();

const logout = () => {
  localStorage.removeItem('user');
  router.push('/login');
};

defineProps({
  collapsed: Boolean,
  mobileOpen: Boolean
});

defineEmits(['toggle', 'close-mobile']);

const menuItems = [
  { name: 'Dashboard', path: '/app', icon: LayoutDashboard },
  { name: 'Clientes', path: '/app/clientes', icon: Users },
  { name: 'Empréstimos', path: '/app/emprestimos', icon: Banknote },
  { name: 'Pagamentos', path: '/app/pagamentos', icon: CreditCard },
  { name: 'Calendário', path: '/app/calendario', icon: Calendar },
  { name: 'Relatórios', path: '/app/relatorios', icon: FileText },
  { name: 'Recibos', path: '/app/recibos', icon: ReceiptText },
  { name: 'Notificações', path: '/app/notificacoes', icon: Bell },
  { name: 'Estatísticas', path: '/app/estatisticas', icon: BarChart3 },
  { name: 'Empresa', path: '/app/empresa', icon: Building },
  { name: 'Assinatura', path: '/app/assinatura', icon: Briefcase },
];
</script>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  height: 100vh;
  background-color: var(--bg-surface);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  transition: width var(--transition-normal);
  z-index: 50;
  position: relative;
}

.sidebar.collapsed {
  width: var(--sidebar-collapsed-width);
}

.sidebar-header {
  height: var(--header-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  border-bottom: 1px solid var(--border-color);
}

.sidebar.collapsed .sidebar-header {
  justify-content: center;
  padding: 0;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 36px;
  height: 36px;
  background-color: var(--primary-color);
  border-radius: var(--radius-sm);
}

.company-info h2 {
  margin: 0;
  line-height: 1.2;
}

.company-info p {
  margin: 0;
}

.collapse-btn {
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 4px;
}

.collapse-btn:hover {
  background-color: var(--bg-body);
  color: var(--text-main);
}

.sidebar-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow-y: auto;
  padding: 20px 0;
}

.sidebar-content::-webkit-scrollbar {
  width: 4px;
}
.sidebar-content::-webkit-scrollbar-thumb {
  background-color: var(--border-color);
  border-radius: 4px;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sidebar-nav {
  padding: 0 16px;
}

.sidebar.collapsed .sidebar-nav {
  padding: 0 12px;
}

.sidebar-footer {
  padding: 0 16px;
  margin-top: 24px;
  border-top: 1px solid var(--border-color);
  padding-top: 20px;
}

.sidebar.collapsed .sidebar-footer {
  padding: 0 12px;
  padding-top: 20px;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  color: var(--text-muted);
  transition: all var(--transition-fast);
  gap: 12px;
  text-decoration: none;
  font-weight: 500;
  white-space: nowrap;
}

.sidebar.collapsed .nav-item {
  justify-content: center;
  padding: 12px;
}

.nav-icon {
  flex-shrink: 0;
}

.nav-item:hover {
  background-color: var(--bg-body);
  color: var(--text-main);
}

.nav-item.active {
  background-color: #EFF6FF; /* Light blue background */
  color: var(--primary-color);
}

.nav-item.active .nav-icon {
  color: var(--primary-color);
}

.nav-item.logout:hover {
  background-color: #FEF2F2; /* Light red */
  color: #DC2626; /* Red */
}

.mobile-only {
  display: none;
}

/* Tooltip for collapsed sidebar could be improved with a library, but title attribute is a native fallback */

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: -260px; /* Hidden by default */
    bottom: 0;
    width: var(--sidebar-width); /* Fixed width on mobile */
  }
  
  .sidebar.mobile-open {
    left: 0;
    box-shadow: var(--shadow-lg);
  }

  .desktop-only {
    display: none;
  }

  .mobile-only {
    display: flex;
  }
}
</style>
