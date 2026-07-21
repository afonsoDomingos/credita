<template>
  <div class="pagamentos-page">
    <div class="header-actions flex justify-between items-center mb-6">
      <div>
        <h1 class="text-xl font-bold">Pagamentos (Recebimentos)</h1>
        <p class="text-muted text-sm">Gira as entradas de dinheiro das parcelas pagas pelos seus clientes.</p>
      </div>
      <button class="btn-primary flex items-center gap-2" @click="openModal()">
        <Plus :size="16" />
        Registar Pagamento
      </button>
    </div>

    <!-- Tabela de Pagamentos -->
    <div class="surface p-0 overflow-hidden">
      <div v-if="loading" class="p-6 text-center text-muted">A carregar pagamentos...</div>
      
      <table v-else-if="pagamentos.length > 0" class="data-table">
        <thead>
          <tr>
            <th>Data</th>
            <th>Cliente</th>
            <th>Empréstimo Ref.</th>
            <th>Valor Pago</th>
            <th>Método</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="pagamento in pagamentos" :key="pagamento._id">
            <td>{{ new Date(pagamento.paymentDate).toLocaleDateString('pt-PT') }}</td>
            <td class="font-medium">{{ pagamento.loan && pagamento.loan.client ? pagamento.loan.client.name : 'N/A' }}</td>
            <td>Empréstimo (MT {{ pagamento.loan ? pagamento.loan.amount.toLocaleString() : '?' }})</td>
            <td class="font-bold text-green">MT {{ pagamento.amountPaid.toLocaleString() }}</td>
            <td class="capitalize">{{ traduzirMetodo(pagamento.paymentMethod) }}</td>
            <td>
              <button class="btn-text mr-3" @click="imprimirRecibo(pagamento._id)" title="Imprimir Recibo">Ver Recibo</button>
              <button class="btn-icon text-red" @click="apagarPagamento(pagamento)" title="Anular Pagamento">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div v-else class="empty-state-beautiful">
        <div class="empty-icon-wrapper">
          <CreditCard :size="48" class="text-muted" />
        </div>
        <h3>Nenhum Pagamento Registado</h3>
        <p>Ainda não existem entradas de dinheiro no sistema. Quando os seus clientes pagarem, registe-os aqui.</p>
        <button class="btn-primary mt-6 flex items-center gap-2" @click="openModal()">
          <Plus :size="16" /> Registar Primeiro Pagamento
        </button>
      </div>
    </div>

    <!-- Modal Registar Pagamento -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content surface">
        <div class="modal-header flex justify-between items-center mb-4">
          <h2 class="font-bold text-lg">Registar Novo Pagamento</h2>
          <button class="btn-icon" @click="closeModal"><X :size="20" /></button>
        </div>
        
        <form @submit.prevent="salvarPagamento" class="modal-form">
          <div class="form-group">
            <label>Selecione o Empréstimo Ativo *</label>
            <select v-model="form.loanId" required class="form-select">
              <option value="" disabled>Escolha um empréstimo</option>
              <option v-for="emp in emprestimosAtivos" :key="emp._id" :value="emp._id">
                {{ emp.client ? emp.client.name : 'Desconhecido' }} - MT {{ emp.amount.toLocaleString() }}
              </option>
            </select>
            <small class="text-xs text-muted" v-if="emprestimosAtivos.length === 0">Não há empréstimos ativos para pagar.</small>
          </div>

          <div class="grid-2 gap-4">
            <div class="form-group">
              <label>Valor Pago (MT) *</label>
              <input type="number" v-model="form.amountPaid" required min="1" />
            </div>
            <div class="form-group">
              <label>Método de Pagamento *</label>
              <select v-model="form.paymentMethod" required class="form-select">
                <option value="cash">Numerário (Dinheiro)</option>
                <option value="transfer">Transferência Bancária</option>
                <option value="card">Cartão (TPA)</option>
              </select>
            </div>
          </div>

          <div v-if="errorMsg" class="error-msg mt-2">{{ errorMsg }}</div>

          <div class="modal-actions mt-6 flex justify-end gap-3">
            <button type="button" class="btn-secondary" @click="closeModal">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="saving || emprestimosAtivos.length === 0">
              {{ saving ? 'A registar...' : 'Salvar Pagamento' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Plus, X, CreditCard } from '@lucide/vue';
import api from '../api';

const pagamentos = ref([]);
const emprestimosAtivos = ref([]);
const loading = ref(true);
const showModal = ref(false);
const saving = ref(false);
const errorMsg = ref('');

const form = ref({
  loanId: '',
  amountPaid: '',
  paymentMethod: 'cash'
});

const traduzirMetodo = (metodo) => {
  const map = {
    'cash': 'Numerário',
    'transfer': 'Transferência',
    'card': 'Cartão'
  };
  return map[metodo] || metodo;
};

const loadPagamentos = async () => {
  try {
    const { data } = await api.get('/payments');
    pagamentos.value = data;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const loadEmprestimosAtivos = async () => {
  try {
    const { data } = await api.get('/loans');
    // Filtrar apenas os que estão em curso (active)
    emprestimosAtivos.value = data.filter(emp => emp.status === 'active');
  } catch (error) {
    console.error(error);
  }
};

const openModal = async () => {
  errorMsg.value = '';
  form.value = { loanId: '', amountPaid: '', paymentMethod: 'cash' };
  showModal.value = true;
  await loadEmprestimosAtivos();
};

const closeModal = () => {
  showModal.value = false;
};

const imprimirRecibo = (paymentId) => {
  window.open(`/print/recibo/${paymentId}`, '_blank');
};

const apagarPagamento = async (pagamento) => {
  if (confirm(`Tem a certeza absoluta que deseja anular este pagamento de MT ${pagamento.amountPaid.toLocaleString()}?`)) {
    try {
      await api.delete(`/payments/${pagamento._id}`);
      await loadPagamentos();
    } catch (error) {
      console.error('Erro ao anular pagamento', error);
      alert('Erro ao tentar anular o pagamento.');
    }
  }
};

const salvarPagamento = async () => {
  saving.value = true;
  errorMsg.value = '';
  try {
    await api.post('/payments', form.value);
    await loadPagamentos();
    closeModal();
  } catch (error) {
    errorMsg.value = error.response?.data?.message || 'Erro ao registar pagamento.';
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  loadPagamentos();
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

.text-green { color: #16A34A; }
.capitalize { text-transform: capitalize; }

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
