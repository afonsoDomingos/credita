<template>
  <header class="header">
    <div class="header-left">
      <button class="mobile-menu-btn" @click="$emit('toggle-mobile-sidebar')">
        <Menu :size="24" />
      </button>
      
      <div class="search-bar" ref="searchRef">
        <Search :size="18" class="search-icon" />
        <input type="text" placeholder="Pesquisar clientes, empréstimos..." class="search-input" v-model="searchQuery" @input="onSearch" @focus="showSearchResults = searchQuery.length >= 2" />
        <kbd v-if="!searchQuery" class="search-kbd">Ctrl+K</kbd>
        <button v-if="searchQuery" class="search-clear" @click="clearSearch">
          <X :size="14" />
        </button>
        
        <!-- Search Results Dropdown -->
        <div class="search-dropdown" v-if="showSearchResults && searchResults.length > 0">
          <div v-if="searchResults.filter(r => r.type === 'client').length > 0" class="search-group">
            <span class="search-group-title">Clientes</span>
            <div v-for="result in searchResults.filter(r => r.type === 'client')" :key="result._id" class="search-result-item" @click="goToResult(result)">
              <div class="result-avatar">{{ result.name.charAt(0) }}</div>
              <div class="result-info">
                <span class="result-name">{{ result.name }}</span>
                <span class="result-meta">{{ result.phone || result.idCard }}</span>
              </div>
            </div>
          </div>
          <div v-if="searchResults.filter(r => r.type === 'loan').length > 0" class="search-group">
            <span class="search-group-title">Empréstimos</span>
            <div v-for="result in searchResults.filter(r => r.type === 'loan')" :key="result._id" class="search-result-item" @click="goToResult(result)">
              <div class="result-avatar bg-blue">MT</div>
              <div class="result-info">
                <span class="result-name">{{ result.clientName }} — MT {{ result.amount?.toLocaleString() }}</span>
                <span class="result-meta">{{ result.status === 'active' ? 'Ativo' : result.status === 'paid' ? 'Pago' : 'Em Dívida' }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="search-dropdown" v-if="showSearchResults && searchQuery.length >= 2 && searchResults.length === 0 && !searching">
          <div class="search-empty">Nenhum resultado para "{{ searchQuery }}"</div>
        </div>
      </div>
    </div>
    
    <div class="header-right">
      <div class="header-actions">
        <!-- Notificações -->
        <div class="notification-wrapper" ref="notificationRef">
          <button class="action-btn" title="Notificações" @click="toggleNotifications">
            <Bell :size="20" />
            <span class="badge" v-if="unreadCount > 0">{{ unreadCount }}</span>
          </button>
          
          <!-- Notificações Dropdown -->
          <div class="notifications-dropdown" v-if="showNotifications">
            <div class="notif-header">
              <h4>Notificações</h4>
              <button class="mark-read-btn" @click="markAllAsRead" v-if="unreadCount > 0">Marcar todas lidas</button>
            </div>
            
            <div class="notif-list">
              <div v-if="notifications.length === 0" class="empty-state">
                <p>Sem notificações</p>
              </div>
              <div 
                v-for="notif in notifications.slice(0, 5)" 
                :key="notif._id" 
                class="notif-item" 
                :class="{ 'unread': !notif.isRead }"
                @click="markAsRead(notif)"
              >
                <div class="notif-icon" :class="'icon-' + notif.type">
                  <Bell v-if="notif.type === 'system'" :size="16" />
                  <CreditCard v-else-if="notif.type === 'billing'" :size="16" />
                  <AlertCircle v-else-if="notif.type === 'alert'" :size="16" />
                  <Info v-else :size="16" />
                </div>
                <div class="notif-content">
                  <h5>{{ notif.title }}</h5>
                  <p>{{ notif.message }}</p>
                  <span class="notif-time">{{ formatTime(notif.createdAt) }}</span>
                </div>
              </div>
            </div>
            
            <router-link to="/app/notificacoes" class="view-all-btn" @click="showNotifications = false">
              Ver todas as notificações
            </router-link>
          </div>
        </div>

        <button class="action-btn" title="Mensagens">
          <MessageSquare :size="20" />
        </button>
      </div>
      
      <div class="divider"></div>
      
      <div class="user-profile" @click="toggleDropdown" ref="profileRef">
        <div class="user-info">
          <span class="user-name">{{ user?.name || 'Administrador' }}</span>
          <span class="user-role">{{ user?.role === 'superadmin' ? 'Superadmin' : 'Gestor' }}</span>
        </div>
        <img :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Admin')}&background=2563EB&color=fff`" alt="User Profile" class="avatar" />
        <ChevronDown :size="16" class="dropdown-icon" />
        
        <!-- Dropdown Menu -->
        <div class="profile-dropdown" v-if="showDropdown">
          <router-link to="/app/perfil" class="dropdown-item" @click="showDropdown = false">
            <User :size="16" /> O meu Perfil
          </router-link>
          <router-link to="/app/assinatura" class="dropdown-item" @click="showDropdown = false">
            <CreditCard :size="16" /> Assinatura & Plano
          </router-link>
          <div class="dropdown-divider"></div>
          <button @click="logout" class="dropdown-item text-red">
            <LogOut :size="16" /> Terminar Sessão
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Menu, Search, Bell, MessageSquare, ChevronDown, User, LogOut, CreditCard, AlertCircle, Info, X } from '@lucide/vue';
import api from '../api';

defineEmits(['toggle-mobile-sidebar']);

const router = useRouter();
const user = ref(null);
const showDropdown = ref(false);
const profileRef = ref(null);

// Notifications
const notifications = ref([]);
const showNotifications = ref(false);
const notificationRef = ref(null);

// Global Search
const searchQuery = ref('');
const searchResults = ref([]);
const showSearchResults = ref(false);
const searching = ref(false);
const searchRef = ref(null);
let searchTimeout = null;

const unreadCount = computed(() => {
  return notifications.value.filter(n => !n.isRead).length;
});

const loadUser = () => {
  const userData = localStorage.getItem('user');
  if (userData) {
    user.value = JSON.parse(userData);
  }
};

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
  if (showDropdown.value) showNotifications.value = false;
};

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value;
  if (showNotifications.value) showDropdown.value = false;
};

const closeDropdowns = (e) => {
  if (profileRef.value && !profileRef.value.contains(e.target)) {
    showDropdown.value = false;
  }
  if (notificationRef.value && !notificationRef.value.contains(e.target)) {
    showNotifications.value = false;
  }
  if (searchRef.value && !searchRef.value.contains(e.target)) {
    showSearchResults.value = false;
  }
};

const onSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  if (searchQuery.value.length < 2) {
    searchResults.value = [];
    showSearchResults.value = false;
    return;
  }
  searching.value = true;
  searchTimeout = setTimeout(async () => {
    try {
      const results = [];
      
      // Search clients
      const { data: clients } = await api.get('/clients');
      const matchedClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        (c.phone && c.phone.includes(searchQuery.value)) ||
        (c.idCard && c.idCard.toLowerCase().includes(searchQuery.value.toLowerCase()))
      ).slice(0, 4);
      matchedClients.forEach(c => results.push({ ...c, type: 'client' }));
      
      // Search loans
      const { data: loans } = await api.get('/loans');
      const matchedLoans = loans.filter(l =>
        (l.client?.name && l.client.name.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
        l.amount.toString().includes(searchQuery.value)
      ).slice(0, 4);
      matchedLoans.forEach(l => results.push({ ...l, type: 'loan', clientName: l.client?.name || 'Desconhecido' }));
      
      searchResults.value = results;
      showSearchResults.value = true;
    } catch (error) {
      console.error('Erro na pesquisa', error);
    } finally {
      searching.value = false;
    }
  }, 300); // 300ms debounce
};

const clearSearch = () => {
  searchQuery.value = '';
  searchResults.value = [];
  showSearchResults.value = false;
};

const goToResult = (result) => {
  showSearchResults.value = false;
  searchQuery.value = '';
  if (result.type === 'client') {
    router.push(`/app/clientes/${result._id}`);
  } else if (result.type === 'loan') {
    router.push(`/app/emprestimos/${result._id}`);
  }
};

const loadNotifications = async () => {
  try {
    const { data } = await api.get('/notifications');
    notifications.value = data;
  } catch (error) {
    console.error('Erro ao carregar notificações', error);
  }
};

const markAsRead = async (notif) => {
  if (notif.isRead) return;
  try {
    await api.put(`/notifications/${notif._id}/read`);
    notif.isRead = true;
  } catch (error) {
    console.error('Erro ao marcar como lida', error);
  }
};

const markAllAsRead = async () => {
  try {
    await api.put('/notifications/read-all');
    notifications.value.forEach(n => n.isRead = true);
  } catch (error) {
    console.error('Erro ao marcar todas como lidas', error);
  }
};

const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-PT') + ' ' + date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  router.push('/login');
};

onMounted(() => {
  loadUser();
  loadNotifications();
  document.addEventListener('click', closeDropdowns);
});

onUnmounted(() => {
  document.removeEventListener('click', closeDropdowns);
});
</script>

<style scoped>
.header {
  height: var(--header-height);
  background-color: var(--bg-surface);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 30;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.mobile-menu-btn {
  display: none;
  color: var(--text-main);
  padding: 4px;
}

.search-bar {
  display: flex;
  align-items: center;
  background-color: var(--bg-body);
  border-radius: var(--radius-md);
  padding: 0 12px;
  width: 100%;
  max-width: 400px;
  border: 1px solid transparent;
  transition: all var(--transition-fast);
}

.search-bar:focus-within {
  background-color: var(--bg-surface);
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.search-icon {
  color: var(--text-muted);
}

.search-input {
  border: none;
  background: transparent;
  padding: 10px 8px;
  width: 100%;
  outline: none;
  font-family: inherit;
  color: var(--text-main);
}

.search-bar {
  position: relative;
}

.search-kbd {
  background-color: var(--border-color);
  color: var(--text-muted);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.65rem;
  font-family: inherit;
  border: 1px solid rgba(0,0,0,0.06);
  white-space: nowrap;
}

.search-clear {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
}
.search-clear:hover { color: var(--text-main); }

.search-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background-color: white;
  border-radius: var(--radius-md);
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.2);
  border: 1px solid var(--border-color);
  z-index: 100;
  max-height: 400px;
  overflow-y: auto;
}

.search-group {
  padding: 8px 0;
  border-bottom: 1px solid var(--border-color);
}
.search-group:last-child { border-bottom: none; }

.search-group-title {
  display: block;
  padding: 4px 16px 8px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-muted);
}

.search-result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  cursor: pointer;
  transition: background-color 0.15s;
}
.search-result-item:hover { background-color: #F3F4F6; }

.result-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #EFF6FF;
  color: #2563EB;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
}
.result-avatar.bg-blue { background-color: #DBEAFE; color: #1D4ED8; }

.result-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.result-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-meta {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.search-empty {
  padding: 24px 16px;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.875rem;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: var(--text-muted);
  transition: all var(--transition-fast);
}

.action-btn:hover {
  background-color: var(--bg-body);
  color: var(--text-main);
}

.badge {
  position: absolute;
  top: 6px;
  right: 6px;
  background-color: #EF4444; /* Red */
  color: white;
  font-size: 10px;
  font-weight: bold;
  height: 16px;
  min-width: 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--bg-surface);
}

.divider {
  width: 1px;
  height: 32px;
  background-color: var(--border-color);
}

.notification-wrapper {
  position: relative;
}

.notifications-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: -50px;
  background-color: white;
  border-radius: var(--radius-md);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  width: 320px;
  border: 1px solid var(--border-color);
  z-index: 50;
  display: flex;
  flex-direction: column;
}

.notif-header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notif-header h4 {
  font-weight: 700;
  font-size: 0.875rem;
  color: var(--text-main);
  margin: 0;
}

.mark-read-btn {
  background: none;
  border: none;
  color: var(--primary-color);
  font-size: 0.75rem;
  cursor: pointer;
}

.mark-read-btn:hover {
  text-decoration: underline;
}

.notif-list {
  max-height: 300px;
  overflow-y: auto;
}

.empty-state {
  padding: 24px;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.875rem;
}

.notif-item {
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  transition: background-color 0.2s;
}

.notif-item:hover {
  background-color: var(--bg-body);
}

.notif-item.unread {
  background-color: #EFF6FF; /* blue-50 */
}

.notif-item.unread:hover {
  background-color: #DBEAFE; /* blue-100 */
}

.notif-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-system { background-color: #F3F4F6; color: #4B5563; }
.icon-billing { background-color: #DCFCE7; color: #16A34A; }
.icon-alert { background-color: #FEE2E2; color: #DC2626; }
.icon-info { background-color: #DBEAFE; color: #2563EB; }
.icon-success { background-color: #DCFCE7; color: #16A34A; }

.notif-content {
  flex: 1;
}

.notif-content h5 {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-main);
  margin: 0 0 2px 0;
}

.notif-content p {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin: 0 0 4px 0;
  line-height: 1.4;
}

.notif-time {
  font-size: 0.65rem;
  color: #9CA3AF;
}

.view-all-btn {
  display: block;
  text-align: center;
  padding: 12px;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--primary-color);
  text-decoration: none;
  border-top: 1px solid var(--border-color);
  background-color: #F9FAFB;
}

.view-all-btn:hover {
  background-color: #F3F4F6;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 4px;
  border-radius: var(--radius-sm);
  transition: background-color var(--transition-fast);
}

.user-profile:hover {
  background-color: var(--bg-body);
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-main);
}

.user-role {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.dropdown-icon {
  color: var(--text-muted);
}

.profile-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 24px;
  background-color: white;
  border-radius: var(--radius-md);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  padding: 8px 0;
  border: 1px solid var(--border-color);
  z-index: 50;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  color: var(--text-main);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background-color 0.2s;
  width: 100%;
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: left;
}

.dropdown-item:hover {
  background-color: var(--bg-body);
}

.dropdown-item.text-red {
  color: #DC2626;
}

.dropdown-item.text-red:hover {
  background-color: #FEE2E2;
}

.dropdown-divider {
  height: 1px;
  background-color: var(--border-color);
  margin: 8px 0;
}

@media (max-width: 768px) {
  .header {
    padding: 0 16px;
  }
  
  .mobile-menu-btn {
    display: flex;
  }
  
  .search-bar {
    display: none; /* Hide search on mobile header to save space, could be an icon instead */
  }
  
  .user-info {
    display: none;
  }
  
  .profile-dropdown {
    right: 16px;
  }
}
</style>
