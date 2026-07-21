<template>
  <div class="auditoria-page">

    <!-- Page Header -->
    <div class="page-header">
      <div class="page-header-left">
        <div class="page-header-icon">
          <Shield :size="22" />
        </div>
        <div>
          <h1 class="page-title">Log de Auditoria</h1>
          <p class="page-subtitle">Histórico completo de ações realizadas no sistema.</p>
        </div>
      </div>
      <div class="page-header-badge">
        <Activity :size="14" />
        <span>{{ logsFiltrados.length }} registo{{ logsFiltrados.length !== 1 ? 's' : '' }}</span>
      </div>
    </div>

    <!-- Filters Bar -->
    <div class="filters-bar">
      <div class="search-wrapper">
        <Search :size="16" class="search-icon" />
        <input
          type="text"
          v-model="filtroTexto"
          placeholder="Pesquisar por ação, email ou descrição..."
          class="search-input"
        />
        <button v-if="filtroTexto" @click="filtroTexto = ''" class="search-clear">
          <X :size="14" />
        </button>
      </div>
      <div class="filter-pills">
        <button
          class="filter-pill"
          :class="{ active: filtroAcao === '' }"
          @click="filtroAcao = ''"
        >Todas</button>
        <button
          class="filter-pill create"
          :class="{ active: filtroAcao === '_create' }"
          @click="filtroAcao = '_create'"
        >
          <Plus :size="12" /> Criações
        </button>
        <button
          class="filter-pill update"
          :class="{ active: filtroAcao === '_update' }"
          @click="filtroAcao = '_update'"
        >
          <Pencil :size="12" /> Edições
        </button>
        <button
          class="filter-pill delete"
          :class="{ active: filtroAcao === '_delete' }"
          @click="filtroAcao = '_delete'"
        >
          <Trash2 :size="12" /> Remoções
        </button>
      </div>
    </div>

    <!-- Log List -->
    <div class="log-container">
      <div v-if="loading" class="loading-state">
        <Spinner message="A carregar registos de auditoria..." />
      </div>

      <div v-else-if="logsFiltrados.length === 0" class="empty-state">
        <div class="empty-icon-wrap">
          <ClipboardList :size="40" />
        </div>
        <h3>Nenhum registo encontrado</h3>
        <p>Não existem atividades que correspondam aos filtros aplicados.</p>
        <button v-if="filtroTexto || filtroAcao" @click="limparFiltros" class="btn-limpar">
          Limpar Filtros
        </button>
      </div>

      <div v-else class="log-timeline">
        <div
          v-for="log in logsFiltrados"
          :key="log._id"
          class="log-entry"
        >
          <!-- Action indicator dot -->
          <div class="log-dot" :class="getDotClass(log.action)">
            <Plus v-if="log.action.startsWith('CRIAR') || log.action.startsWith('REGISTAR')" :size="10" />
            <Pencil v-else-if="log.action.startsWith('EDITAR')" :size="10" />
            <Trash2 v-else-if="log.action.startsWith('APAGAR') || log.action.startsWith('ANULAR')" :size="10" />
            <Activity v-else :size="10" />
          </div>

          <!-- Content -->
          <div class="log-content">
            <div class="log-top">
              <span class="action-badge" :class="getActionClass(log.action)">
                {{ formatActionLabel(log.action) }}
              </span>
              <div class="log-meta">
                <div class="user-chip">
                  <User :size="12" />
                  {{ log.userEmail }}
                </div>
                <div class="time-chip">
                  <Clock :size="12" />
                  {{ formatDateTime(log.createdAt) }}
                </div>
              </div>
            </div>
            <p class="log-description">{{ log.description }}</p>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import {
  Shield, Activity, Search, X, Plus, Pencil, Trash2,
  ClipboardList, User, Clock
} from '@lucide/vue';
import Spinner from '../components/Spinner.vue';
import api from '../api';

const logs = ref([]);
const loading = ref(true);
const filtroTexto = ref('');
const filtroAcao = ref('');

const loadLogs = async () => {
  try {
    const { data } = await api.get('/audit');
    logs.value = data;
  } catch (error) {
    console.error('Erro ao carregar logs de auditoria:', error);
  } finally {
    loading.value = false;
  }
};

const logsFiltrados = computed(() => {
  return logs.value.filter(log => {
    const matchTexto = !filtroTexto.value ||
      log.description.toLowerCase().includes(filtroTexto.value.toLowerCase()) ||
      log.userEmail.toLowerCase().includes(filtroTexto.value.toLowerCase()) ||
      log.action.toLowerCase().includes(filtroTexto.value.toLowerCase());

    let matchAcao = true;
    if (filtroAcao.value === '_create') {
      matchAcao = log.action.startsWith('CRIAR') || log.action.startsWith('REGISTAR');
    } else if (filtroAcao.value === '_update') {
      matchAcao = log.action.startsWith('EDITAR');
    } else if (filtroAcao.value === '_delete') {
      matchAcao = log.action.startsWith('APAGAR') || log.action.startsWith('ANULAR');
    } else if (filtroAcao.value) {
      matchAcao = log.action === filtroAcao.value;
    }

    return matchTexto && matchAcao;
  });
});

const limparFiltros = () => {
  filtroTexto.value = '';
  filtroAcao.value = '';
};

const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-PT') + ' · ' + date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
};

const formatActionLabel = (action) => {
  const map = {
    'CRIAR_EMPRESTIMO': 'Novo Empréstimo',
    'EDITAR_EMPRESTIMO': 'Edição Empréstimo',
    'APAGAR_EMPRESTIMO': 'Remoção Empréstimo',
    'REGISTAR_PAGAMENTO': 'Novo Pagamento',
    'ANULAR_PAGAMENTO': 'Anulação Pagamento',
    'CRIAR_CLIENTE': 'Novo Cliente',
    'EDITAR_CLIENTE': 'Edição Cliente',
    'APAGAR_CLIENTE': 'Remoção Cliente'
  };
  return map[action] || action;
};

const getActionClass = (action) => {
  if (action.startsWith('CRIAR') || action.startsWith('REGISTAR')) return 'badge-create';
  if (action.startsWith('EDITAR')) return 'badge-update';
  if (action.startsWith('APAGAR') || action.startsWith('ANULAR')) return 'badge-delete';
  return 'badge-default';
};

const getDotClass = (action) => {
  if (action.startsWith('CRIAR') || action.startsWith('REGISTAR')) return 'dot-create';
  if (action.startsWith('EDITAR')) return 'dot-update';
  if (action.startsWith('APAGAR') || action.startsWith('ANULAR')) return 'dot-delete';
  return 'dot-default';
};

onMounted(() => {
  loadLogs();
});
</script>

<style scoped>
.auditoria-page {
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ── Page Header ── */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.page-header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-header-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #6366F1, #8B5CF6);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.page-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-main);
  margin: 0;
}

.page-subtitle {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin: 4px 0 0;
}

.page-header-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  color: var(--text-muted);
  font-size: 0.8rem;
  font-weight: 600;
  padding: 8px 14px;
  border-radius: 20px;
  white-space: nowrap;
}

/* ── Filters Bar ── */
.filters-bar {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 16px 20px;
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.search-wrapper {
  position: relative;
  flex: 1;
  min-width: 220px;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 10px 40px 10px 40px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  font-family: inherit;
  font-size: 0.875rem;
  outline: none;
  background: var(--bg-body);
  color: var(--text-main);
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.search-input:focus {
  border-color: #6366F1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}

.search-clear {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 2px;
  border-radius: 4px;
  transition: color 0.2s;
}
.search-clear:hover { color: var(--text-main); }

.filter-pills {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-pill {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 7px 14px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  border: 1px solid var(--border-color);
  background: var(--bg-body);
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s;
}
.filter-pill:hover { border-color: #6366F1; color: #6366F1; }
.filter-pill.active { background: #EEF2FF; border-color: #6366F1; color: #6366F1; }
.filter-pill.create.active { background: #F0FDF4; border-color: #16A34A; color: #16A34A; }
.filter-pill.update.active { background: #EFF6FF; border-color: #2563EB; color: #2563EB; }
.filter-pill.delete.active { background: #FEF2F2; border-color: #DC2626; color: #DC2626; }

/* ── Log Container ── */
.log-container {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  overflow: hidden;
}

/* Loading */
.loading-state {
  padding: 60px 24px;
  text-align: center;
}

/* Empty State */
.empty-state {
  padding: 72px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
}

.empty-icon-wrap {
  width: 88px;
  height: 88px;
  background: linear-gradient(135deg, #EEF2FF, #F5F3FF);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #818CF8;
  margin-bottom: 8px;
}

.empty-state h3 {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-main);
  margin: 0;
}

.empty-state p {
  font-size: 0.9rem;
  color: var(--text-muted);
  max-width: 360px;
  margin: 0;
  line-height: 1.5;
}

.btn-limpar {
  margin-top: 8px;
  padding: 9px 20px;
  background: #6366F1;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-limpar:hover { background: #4F46E5; }

/* ── Timeline ── */
.log-timeline {
  padding: 8px 0;
}

.log-entry {
  display: flex;
  gap: 0;
  padding: 0 24px;
  position: relative;
  transition: background 0.15s;
}
.log-entry:hover { background: var(--bg-body); }

/* Vertical line connecting dots */
.log-entry:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 39px;
  top: 52px;
  bottom: 0;
  width: 2px;
  background: var(--border-color);
}

.log-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 20px;
  margin-right: 16px;
  position: relative;
  z-index: 1;
  border: 2px solid white;
  box-shadow: 0 0 0 2px var(--border-color);
}

.dot-create { background: #16A34A; color: white; box-shadow: 0 0 0 2px #DCFCE7; }
.dot-update { background: #2563EB; color: white; box-shadow: 0 0 0 2px #DBEAFE; }
.dot-delete { background: #DC2626; color: white; box-shadow: 0 0 0 2px #FEE2E2; }
.dot-default { background: #6B7280; color: white; box-shadow: 0 0 0 2px #F3F4F6; }

.log-content {
  flex: 1;
  padding: 18px 0;
  border-bottom: 1px solid var(--border-color);
}
.log-entry:last-child .log-content { border-bottom: none; }

.log-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.action-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  white-space: nowrap;
}
.badge-create { background: #DCFCE7; color: #15803D; }
.badge-update { background: #DBEAFE; color: #1D4ED8; }
.badge-delete { background: #FEE2E2; color: #B91C1C; }
.badge-default { background: #F3F4F6; color: #4B5563; }

.log-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.user-chip, .time-chip {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.78rem;
  color: var(--text-muted);
  font-weight: 500;
}

.log-description {
  font-size: 0.875rem;
  color: var(--text-main);
  margin: 0;
  line-height: 1.5;
}

@media (max-width: 640px) {
  .filters-bar { flex-direction: column; align-items: stretch; }
  .page-header { flex-direction: column; align-items: flex-start; }
  .log-entry { padding: 0 16px; }
  .log-entry:not(:last-child)::after { left: 31px; }
  .log-top { flex-direction: column; align-items: flex-start; }
}
</style>
