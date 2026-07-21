<template>
  <div class="auditoria-page">
    <div class="header-actions flex justify-between items-center mb-6">
      <div>
        <h1 class="text-xl font-bold">Log de Atividades & Auditoria</h1>
        <p class="text-muted text-sm">Histórico de ações realizadas no sistema pelos utilizadores.</p>
      </div>
    </div>

    <!-- Filtros -->
    <div class="surface p-4 mb-4 flex items-center gap-4 flex-wrap">
      <div class="filter-search flex-1">
        <input type="text" v-model="filtroTexto" placeholder="Pesquisar por ação, email ou descrição..." class="filter-input" />
      </div>
      <select v-model="filtroAcao" class="filter-select">
        <option value="">Todas as Ações</option>
        <option value="CRIAR_EMPRESTIMO">Criar Empréstimo</option>
        <option value="EDITAR_EMPRESTIMO">Editar Empréstimo</option>
        <option value="APAGAR_EMPRESTIMO">Apagar Empréstimo</option>
        <option value="REGISTAR_PAGAMENTO">Registar Pagamento</option>
        <option value="ANULAR_PAGAMENTO">Anular Pagamento</option>
        <option value="CRIAR_CLIENTE">Criar Cliente</option>
        <option value="EDITAR_CLIENTE">Editar Cliente</option>
        <option value="APAGAR_CLIENTE">Apagar Cliente</option>
      </select>
    </div>

    <!-- Tabela / Timeline de Logs -->
    <div class="surface p-0 overflow-hidden">
      <div v-if="loading" class="p-8 text-center text-muted">A carregar registos de auditoria...</div>
      
      <table v-else-if="logsFiltrados.length > 0" class="data-table">
        <thead>
          <tr>
            <th>Data & Hora</th>
            <th>Utilizador</th>
            <th>Ação</th>
            <th>Descrição</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in logsFiltrados" :key="log._id">
            <td class="whitespace-nowrap text-sm text-muted">
              {{ formatDateTime(log.createdAt) }}
            </td>
            <td class="font-medium">
              <span class="user-badge">{{ log.userEmail }}</span>
            </td>
            <td>
              <span class="action-badge" :class="getActionClass(log.action)">
                {{ formatActionLabel(log.action) }}
              </span>
            </td>
            <td class="text-sm">{{ log.description }}</td>
          </tr>
        </tbody>
      </table>

      <div v-else class="p-8 text-center text-muted">
        Nenhum registo de atividade encontrado.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
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
      
    const matchAcao = !filtroAcao.value || log.action === filtroAcao.value;
    
    return matchTexto && matchAcao;
  });
});

const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-PT') + ' às ' + date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
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
  if (action.startsWith('CRIAR') || action.startsWith('REGISTAR')) return 'action-create';
  if (action.startsWith('EDITAR')) return 'action-update';
  if (action.startsWith('APAGAR') || action.startsWith('ANULAR')) return 'action-delete';
  return 'action-default';
};

onMounted(() => {
  loadLogs();
});
</script>

<style scoped>
.filter-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-family: inherit;
  outline: none;
  font-size: 0.875rem;
}
.filter-input:focus { border-color: var(--primary-color); }

.filter-select {
  padding: 10px 14px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-family: inherit;
  outline: none;
  font-size: 0.875rem;
  background-color: white;
  min-width: 180px;
}
.filter-select:focus { border-color: var(--primary-color); }

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th, .data-table td {
  padding: 14px 20px;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.data-table th {
  background-color: var(--bg-body);
  color: var(--text-muted);
  font-weight: 600;
  font-size: 0.8rem;
  text-transform: uppercase;
}

.user-badge {
  background-color: #F3F4F6;
  color: #374151;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.action-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  white-space: nowrap;
}

.action-create { background-color: #DCFCE7; color: #16A34A; }
.action-update { background-color: #DBEAFE; color: #2563EB; }
.action-delete { background-color: #FEE2E2; color: #DC2626; }
.action-default { background-color: #F3F4F6; color: #4B5563; }
.whitespace-nowrap { white-space: nowrap; }
</style>
