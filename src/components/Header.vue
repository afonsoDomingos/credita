<template>
  <header class="header">
    <div class="header-left">
      <button class="mobile-menu-btn" @click="$emit('toggle-mobile-sidebar')">
        <Menu :size="24" />
      </button>
      
      <div class="search-bar">
        <Search :size="18" class="search-icon" />
        <input type="text" placeholder="Pesquisar..." class="search-input" />
      </div>
    </div>
    
    <div class="header-right">
      <div class="header-actions">
        <button class="action-btn" title="Notificações">
          <Bell :size="20" />
          <span class="badge">3</span>
        </button>
        <button class="action-btn" title="Mensagens">
          <MessageSquare :size="20" />
          <span class="badge">1</span>
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
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { Menu, Search, Bell, MessageSquare, ChevronDown, User, LogOut } from '@lucide/vue';

defineEmits(['toggle-mobile-sidebar']);

const router = useRouter();
const user = ref(null);
const showDropdown = ref(false);
const profileRef = ref(null);

const loadUser = () => {
  const userData = localStorage.getItem('user');
  if (userData) {
    user.value = JSON.parse(userData);
  }
};

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

const closeDropdown = (e) => {
  if (profileRef.value && !profileRef.value.contains(e.target)) {
    showDropdown.value = false;
  }
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  router.push('/login');
};

onMounted(() => {
  loadUser();
  document.addEventListener('click', closeDropdown);
});

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown);
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
