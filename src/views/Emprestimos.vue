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

    <!-- Filtros -->
    <div class="surface p-4 mb-4 flex items-center gap-4 flex-wrap no-print">
      <div class="filter-search flex-1">
        <input type="text" v-model="filtroTexto" placeholder="Filtrar por nome do cliente..." class="filter-input" />
      </div>
      <select v-model="filtroEstado" class="filter-select">
        <option value="">Todos os estados</option>
        <option value="active">Ativos</option>
        <option value="paid">Pagos</option>
        <option value="defaulted">Em Dívida</option>
      </select>
    </div>

    <!-- Tabela de Empréstimos -->
    <div class="surface p-0 overflow-hidden">
      <div v-if="loading" class="loader-wrapper">
        <Spinner message="A carregar empréstimos..." />
      </div>
      
      <table v-else-if="emprestimosFiltrados.length > 0" class="data-table">
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
          <tr v-for="emp in emprestimosFiltrados" :key="emp._id">
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
          <transition name="preview-fade">
            <div v-if="form.amount && form.interestRate" class="simulador-preview">
              <!-- Header -->
              <div class="preview-header">
                <div class="preview-header-icon">
                  <Calculator :size="15" />
                </div>
                <span class="preview-header-title">Simulação do Empréstimo</span>
              </div>

              <!-- Rows -->
              <div class="preview-body">
                <div class="preview-row">
                  <span class="preview-label">Capital Emprestado</span>
                  <span class="preview-value">MT {{ formatMoney(form.amount) }}</span>
                </div>
                <div class="preview-row">
                  <span class="preview-label">Taxa de Juro aplicada</span>
                  <span class="preview-rate">{{ form.interestRate }}%</span>
                </div>
                <div class="preview-row">
                  <span class="preview-label">Juro a cobrar</span>
                  <span class="preview-interest">+ MT {{ formatMoney(simulacao.juros) }}</span>
                </div>
              </div>

              <!-- Total -->  
              <div class="preview-total">
                <span class="preview-total-label">Total a Receber</span>
                <span class="preview-total-value">MT {{ formatMoney(simulacao.total) }}</span>
              </div>
            </div>
          </transition>

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
import { useRoute } from 'vue-router';
import { Plus, X, FileText, Calculator } from '@lucide/vue';
import Spinner from '../components/Spinner.vue';
import api from '../api';

const route = useRoute();

const formatMoney = (value) => {
  return Number(value || 0).toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const emprestimos = ref([]);
const clientes = ref([]);
const loading = ref(true);
const showModal = ref(false);
const saving = ref(false);
const errorMsg = ref('');

const filtroTexto = ref('');
const filtroEstado = ref('');

const emprestimosFiltrados = computed(() => {
  return emprestimos.value.filter(emp => {
    const matchTexto = !filtroTexto.value || 
      (emp.client?.name || '').toLowerCase().includes(filtroTexto.value.toLowerCase());
    const matchEstado = !filtroEstado.value || emp.status === filtroEstado.value;
    return matchTexto && matchEstado;
  });
});

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

onMounted(async () => {
  await loadEmprestimos();
  // Se vier do Dashboard com ?novo=1, abre o modal automaticamente
  if (route.query.novo === '1') {
    await openModal();
  }
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

.filter-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-family: inherit;
  outline: none;
  font-size: 0.875rem;
  transition: border-color 0.2s;
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
  cursor: pointer;
}
.filter-select:focus { border-color: var(--primary-color); }

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

/* ── Simulador / Preview ── */
.simulador-preview {
  border-radius: 14px;
  overflow: hidden;
  border: 1.5px solid #DBEAFE;
  background: #F8FBFF;
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  background: linear-gradient(135deg, #EFF6FF, #F0F9FF);
  border-bottom: 1px solid #DBEAFE;
}

.preview-header-icon {
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #3B82F6, #6366F1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.preview-header-title {
  font-size: 0.82rem;
  font-weight: 700;
  color: #1D4ED8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.preview-body {
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-bottom: 1.5px dashed #BFDBFE;
}

.preview-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-label {
  font-size: 0.85rem;
  color: var(--text-muted);
  font-weight: 500;
}

.preview-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-main);
  font-family: 'Courier New', monospace;
}

.preview-rate {
  font-size: 0.85rem;
  font-weight: 700;
  background: #FFF7ED;
  color: #C2410C;
  padding: 3px 10px;
  border-radius: 20px;
}

.preview-interest {
  font-size: 0.9rem;
  font-weight: 700;
  color: #EA580C;
  font-family: 'Courier New', monospace;
}

.preview-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 18px;
  background: linear-gradient(135deg, #F0FDF4, #ECFDF5);
}

.preview-total-label {
  font-size: 0.875rem;
  font-weight: 700;
  color: #166534;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.preview-total-value {
  font-size: 1.3rem;
  font-weight: 800;
  color: #15803D;
  font-family: 'Courier New', monospace;
}

/* Transition */
.preview-fade-enter-active { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.preview-fade-enter-from { opacity: 0; transform: translateY(-8px); }
.preview-fade-leave-active { transition: all 0.2s ease; }
.preview-fade-leave-to { opacity: 0; transform: translateY(-4px); }

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .header-actions {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .header-actions button {
    width: 100%;
    justify-content: center;
  }
  
  .filter-search {
    width: 100%;
  }
  
  .filter-select {
    width: 100%;
    min-width: auto;
  }
  
  .data-table {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
    -webkit-overflow-scrolling: touch;
  }
  
  .data-table th,
  .data-table td {
    padding: 12px 16px;
    font-size: 0.875rem;
  }
  
  .modal-content {
    width: 95%;
    max-width: none;
    margin: 10px;
    padding: 20px;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .modal-actions button {
    width: 100%;
  }
  
  .grid-2 {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .data-table th,
  .data-table td {
    padding: 10px 12px;
    font-size: 0.8rem;
  }
  
  .badge {
    font-size: 0.7rem;
    padding: 3px 8px;
  }
}
</style>
