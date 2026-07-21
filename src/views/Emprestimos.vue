<template>
  <div class="emprestimos-page">
    <div class="header-actions flex justify-between items-center mb-6">
      <div>
        <h1 class="text-xl font-bold">Empréstimos</h1>
        <p class="text-muted text-sm">Acompanhe os empréstimos ativos da sua empresa.</p>
      </div>
      <button class="btn-primary flex items-center gap-2" @click="openModal()">
        <Plus :size="16" />
        Novo Empréstimo
      </button>
    </div>

    <!-- Tabela de Empréstimos -->
    <div class="surface p-0 overflow-hidden">
      <div v-if="loading" class="loader-wrapper">
        <Spinner message="A carregar empréstimos..." />
      </div>
      
      <table v-else-if="emprestimos.length > 0" class="data-table">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Montante</th>
            <th>Juros (%)</th>
            <th>Vencimento</th>
            <th>Estado</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="emp in emprestimos" :key="emp._id">
            <td class="font-medium">{{ emp.client ? emp.client.name : 'Desconhecido' }}</td>
            <td class="font-bold">MT {{ emp.amount.toLocaleString() }}</td>
            <td>{{ emp.interestRate }}%</td>
            <td>{{ new Date(emp.dueDate).toLocaleDateString('pt-PT') }}</td>
            <td>
              <span class="badge badge-active" v-if="emp.status === 'active'">Ativo</span>
              <span class="badge badge-paid" v-else-if="emp.status === 'paid'">Pago</span>
              <span class="badge badge-danger" v-else>Em Dívida</span>
            </td>
            <td>
              <button class="btn-icon text-blue mr-2" @click="$router.push(`/app/emprestimos/${emp._id}`)" title="Ver Detalhes">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
              <button class="btn-icon text-red" @click="apagarEmprestimo(emp)" title="Apagar">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div v-else class="empty-state-beautiful">
        <div class="empty-icon-wrapper">
          <FileText :size="48" class="text-muted" />
        </div>
        <h3>Nenhum Empréstimo Registado</h3>
        <p>Ainda não existem empréstimos registados na sua empresa. Clique em "Novo Empréstimo" para começar a emprestar dinheiro.</p>
        <button class="btn-primary mt-6 flex items-center gap-2" @click="openModal()">
          <Plus :size="16" /> Novo Empréstimo
        </button>
      </div>
    </div>

    <!-- Modal Novo Empréstimo -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content surface">
        <div class="modal-header flex justify-between items-center mb-4">
          <h2 class="font-bold text-lg">Registar Novo Empréstimo</h2>
          <button class="btn-icon" @click="closeModal"><X :size="20" /></button>
        </div>
        
        <form @submit.prevent="salvarEmprestimo" class="modal-form">
          <div class="form-group">
            <label>Selecionar Cliente *</label>
            <select v-model="form.client" required class="form-select">
              <option value="" disabled>Escolha um cliente</option>
              <option v-for="c in clientes" :key="c._id" :value="c._id">{{ c.name }} ({{ c.idCard }})</option>
            </select>
            <small class="text-xs text-muted" v-if="clientes.length === 0">Precisa adicionar clientes primeiro.</small>
          </div>

          <div class="grid-2 gap-4">
            <div class="form-group">
              <label>Montante (MT) *</label>
              <input type="number" v-model="form.amount" required min="1" />
            </div>
            <div class="form-group">
              <label>Taxa de Juro (%) *</label>
              <input type="number" v-model="form.interestRate" required min="0" step="0.1" />
            </div>
          </div>

          <div class="form-group">
            <label>Data de Vencimento *</label>
            <input type="date" v-model="form.dueDate" required />
          </div>

          <!-- Simulador / Pré-visualização -->
          <div v-if="form.amount && form.interestRate" class="simulador-box mt-4 p-4 surface shadow-sm border rounded">
            <h4 class="font-bold text-sm mb-3 flex items-center gap-2 text-blue-600">
              <Calculator :size="16" /> Pré-visualização do Empréstimo
            </h4>
            <div class="flex justify-between items-center mb-2">
              <span class="text-sm text-muted">Capital Emprestado:</span>
              <span class="font-medium">MT {{ parseFloat(form.amount).toLocaleString() }}</span>
            </div>
            <div class="flex justify-between items-center mb-2">
              <span class="text-sm text-muted">Juros ({{ form.interestRate }}%):</span>
              <span class="font-medium text-orange-500">+ MT {{ simulacao.juros.toLocaleString() }}</span>
            </div>
            <div class="divider my-2 border-b border-dashed"></div>
            <div class="flex justify-between items-center">
              <span class="font-bold text-sm">Total a Receber:</span>
              <span class="font-bold text-lg text-green-600">MT {{ simulacao.total.toLocaleString() }}</span>
            </div>
          </div>

          <div v-if="errorMsg" class="error-msg mt-2">{{ errorMsg }}</div>

          <div class="modal-actions mt-6 flex justify-end gap-3">
            <button type="button" class="btn-secondary" @click="closeModal">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="saving || clientes.length === 0">
              {{ saving ? 'A registar...' : 'Registar Empréstimo' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { Plus, X, FileText, Calculator } from '@lucide/vue';
import Spinner from '../components/Spinner.vue';
import api from '../api';

const emprestimos = ref([]);
const clientes = ref([]);
const loading = ref(true);
const showModal = ref(false);
const saving = ref(false);
const errorMsg = ref('');

const form = ref({
  client: '',
  amount: '',
  interestRate: '',
  dueDate: ''
});

// Calculadora de Simulação
const simulacao = computed(() => {
  const cap = parseFloat(form.value.amount) || 0;
  const jurosRate = parseFloat(form.value.interestRate) || 0;
  const valJuros = cap * (jurosRate / 100);
  return {
    juros: valJuros,
    total: cap + valJuros
  };
});

const loadEmprestimos = async () => {
  try {
    const { data } = await api.get('/loans');
    emprestimos.value = data;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const loadClientes = async () => {
  try {
    const { data } = await api.get('/clients');
    clientes.value = data;
  } catch (error) {
    console.error(error);
  }
};

const openModal = async () => {
  errorMsg.value = '';
  form.value = { client: '', amount: '', interestRate: '', dueDate: '' };
  showModal.value = true;
  if (clientes.value.length === 0) {
    await loadClientes();
  }
};

const closeModal = () => {
  showModal.value = false;
};

const salvarEmprestimo = async () => {
  saving.value = true;
  errorMsg.value = '';
  try {
    await api.post('/loans', form.value);
    await loadEmprestimos();
    closeModal();
  } catch (error) {
    errorMsg.value = error.response?.data?.message || 'Erro ao criar empréstimo.';
  } finally {
    saving.value = false;
  }
};

const apagarEmprestimo = async (emp) => {
  if (confirm(`Aviso Crítico: Tem a certeza absoluta que deseja apagar o empréstimo de MT ${emp.amount.toLocaleString()} do cliente ${emp.client?.name}? Isto também apagará todo o histórico de pagamentos associado!`)) {
    try {
      await api.delete(`/loans/${emp._id}`);
      await loadEmprestimos();
    } catch (error) {
      console.error('Erro ao apagar', error);
      alert('Ocorreu um erro ao tentar apagar o empréstimo.');
    }
  }
};

onMounted(() => {
  loadEmprestimos();
});
</script>

<style scoped>
.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th, .data-table td {
  padding: 16px 20px;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.data-table th {
  background-color: var(--bg-body);
  color: var(--text-muted);
  font-weight: 600;
  font-size: 0.875rem;
}

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

/* Badge Styles */
.badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}
.badge-active { background-color: #DBEAFE; color: #2563EB; }
.badge-paid { background-color: #DCFCE7; color: #16A34A; }
.badge-defaulted { background-color: #FEE2E2; color: #DC2626; }

.loader-wrapper {
  padding: 60px 0;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 100%;
  max-width: 500px;
  padding: 24px;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-main);
}

.form-group input, .form-select {
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-family: inherit;
  outline: none;
  background-color: #fff;
}
.form-group input:focus, .form-select:focus { border-color: var(--primary-color); }

.error-msg {
  color: #DC2626;
  font-size: 0.875rem;
}

.btn-text {
  background: none;
  border: none;
  color: var(--primary-color);
  font-weight: 500;
  cursor: pointer;
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
</style>
