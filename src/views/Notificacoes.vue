<template>
  <div class="notifications-page">
    <div class="header-actions mb-6 flex-between">
      <div>
        <h1 class="text-xl font-bold">Notificações</h1>
        <p class="text-muted text-sm">Acompanhe todos os alertas e mensagens do sistema.</p>
      </div>
      <button v-if="unreadCount > 0" @click="markAllAsRead" class="btn-secondary" :disabled="loading">
        Marcar todas como lidas
      </button>
    </div>

    <div class="surface p-0 notifications-container">
      <div v-if="loading" class="p-8 text-center">
        <Spinner message="A carregar notificações..." />
      </div>
      
      <div v-else-if="notifications.length === 0" class="empty-state-beautiful">
        <div class="empty-icon-wrapper">
          <Bell :size="48" class="text-muted" />
        </div>
        <h3>Tudo em dia!</h3>
        <p>Não tem nenhuma notificação de momento. Avisaremos quando houver novidades.</p>
      </div>

      <div v-else class="notif-list">
        <div 
          v-for="notif in notifications" 
          :key="notif._id" 
          class="notif-row"
          :class="{ 'is-unread': !notif.isRead }"
          @click="markAsRead(notif)"
        >
          <div class="notif-icon-large" :class="'icon-' + notif.type">
            <Bell v-if="notif.type === 'system'" :size="24" />
            <CreditCard v-else-if="notif.type === 'billing'" :size="24" />
            <AlertCircle v-else-if="notif.type === 'alert'" :size="24" />
            <Info v-else :size="24" />
          </div>
          <div class="notif-details">
            <h4 class="notif-title">{{ notif.title }} <span v-if="!notif.isRead" class="unread-dot"></span></h4>
            <p class="notif-message">{{ notif.message }}</p>
            <span class="notif-date">{{ formatTime(notif.createdAt) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { Bell, CreditCard, AlertCircle, Info } from '@lucide/vue';
import Spinner from '../components/Spinner.vue';
import api from '../api';

const notifications = ref([]);
const loading = ref(true);

const unreadCount = computed(() => {
  return notifications.value.filter(n => !n.isRead).length;
});

const loadNotifications = async () => {
  loading.value = true;
  try {
    const { data } = await api.get('/notifications');
    notifications.value = data;
  } catch (error) {
    console.error('Erro ao carregar notificações', error);
  } finally {
    loading.value = false;
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
  return date.toLocaleDateString('pt-PT') + ' às ' + date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
};

onMounted(() => {
  loadNotifications();
});
</script>

<style scoped>
.notifications-page {
  max-width: 900px;
  margin: 0 auto;
}

.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-secondary {
  background-color: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-main);
  padding: 8px 16px;
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover:not(:disabled) {
  background-color: var(--bg-body);
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.notifications-container {
  overflow: hidden;
}

.notif-row {
  display: flex;
  gap: 20px;
  padding: 24px;
  border-bottom: 1px solid var(--border-color);
  transition: background-color 0.2s;
  cursor: pointer;
}

.notif-row:last-child {
  border-bottom: none;
}

.notif-row:hover {
  background-color: var(--bg-body);
}

.notif-row.is-unread {
  background-color: #F8FAFC;
}

.notif-row.is-unread:hover {
  background-color: #F1F5F9;
}

.notif-icon-large {
  width: 56px;
  height: 56px;
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

.notif-details {
  flex: 1;
}

.notif-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-main);
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.unread-dot {
  width: 8px;
  height: 8px;
  background-color: var(--primary-color);
  border-radius: 50%;
  display: inline-block;
}

.notif-message {
  font-size: 0.95rem;
  color: var(--text-muted);
  margin: 0 0 12px 0;
  line-height: 1.5;
}

.notif-date {
  font-size: 0.8rem;
  color: #9CA3AF;
  font-weight: 500;
}

/* Beautiful Empty State */
.empty-state-beautiful {
  padding: 60px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.empty-icon-wrapper {
  width: 96px;
  height: 96px;
  background-color: var(--bg-body);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  color: var(--text-muted);
}

.empty-state-beautiful h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-main);
  margin: 0 0 8px 0;
}

.empty-state-beautiful p {
  color: var(--text-muted);
  max-width: 400px;
  margin: 0;
  line-height: 1.5;
}

@media (max-width: 640px) {
  .flex-between {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  .notif-row {
    padding: 16px;
    gap: 16px;
  }
  .notif-icon-large {
    width: 48px;
    height: 48px;
  }
}
</style>
