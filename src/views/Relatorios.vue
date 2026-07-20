<template>
  <div class="relatorios-page">
    <div class="header-actions mb-6">
      <h1 class="text-xl font-bold">Relatório de Empréstimos</h1>
      <p class="text-muted text-sm">Listagem completa e detalhada da carteira de crédito.</p>
    </div>

    <div class="surface p-0 overflow-hidden">
      <div v-if="loading" class="loader-wrapper">
        <Spinner message="A gerar relatório..." />
      </div>
      
      <div v-else>
        <div class="p-4 border-b flex justify-between items-center no-print">
          <p class="text-sm text-muted">A mostrar {{ loans.length }} empréstimos no histórico.</p>
          <button class="btn-secondary" @click="imprimirRelatorio">Imprimir Tabela</button>
        </div>

        <div style="overflow-x: auto;">
          <table class="data-table">
            <thead>
              <tr>
                <th>Data Início</th>
                <th>Cliente</th>
                <th>Capital Emprestado</th>
                <th>Juro (%)</th>
                <th>Retorno Esperado</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="loan in loans" :key="loan._id">
                <td>{{ formatDate(loan.startDate) }}</td>
                <td class="font-medium">{{ loan.client?.name || 'Cliente Removido' }}</td>
                <td>MZN {{ loan.amount.toFixed(2) }}</td>
                <td>{{ loan.interestRate }}%</td>
                <td class="font-bold">MZN {{ calcularTotal(loan).toFixed(2) }}</td>
                <td>
                  <span class="badge" :class="getStatusClass(loan.status)">
                    {{ getStatusLabel(loan.status) }}
                  </span>
                </td>
              </tr>
              <tr v-if="loans.length === 0">
                <td colspan="6" class="text-center p-6 text-muted">Sem registos de empréstimos.</td>
              </tr>
            </tbody>
            <tfoot v-if="loans.length > 0">
              <tr class="tfoot-row">
                <td colspan="2" class="text-right font-bold">TOTAIS DA CARTEIRA:</td>
                <td class="font-bold text-red">MZN {{ somaCapital.toFixed(2) }}</td>
                <td></td>
                <td class="font-bold text-green">MZN {{ somaRetorno.toFixed(2) }}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import Spinner from '../components/Spinner.vue';
import api from '../api';

const loans = ref([]);
const loading = ref(true);

const loadData = async () => {
  try {
    const { data } = await api.get('/loans');
    loans.value = data;
  } catch (error) {
    console.error('Error loading reports', error);
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('pt-PT');
};

const calcularTotal = (loan) => {
  return loan.amount + (loan.amount * (loan.interestRate / 100));
};

const getStatusLabel = (status) => {
  const labels = {
    'pending': 'Pendente',
    'active': 'Ativo',
    'paid': 'Pago',
    'defaulted': 'Em Falha'
  };
  return labels[status] || status;
};

const getStatusClass = (status) => {
  const classes = {
    'pending': 'bg-yellow text-yellow-dark',
    'active': 'bg-blue text-blue-dark',
    'paid': 'bg-green text-green-dark',
    'defaulted': 'bg-red text-red-dark'
  };
  return classes[status] || '';
};

const somaCapital = computed(() => {
  return loans.value.reduce((acc, curr) => acc + curr.amount, 0);
});

const somaRetorno = computed(() => {
  return loans.value.reduce((acc, curr) => acc + calcularTotal(curr), 0);
});

const imprimirRelatorio = () => {
  window.print();
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th, .data-table td {
  padding: 14px 20px;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
  font-size: 0.9rem;
}

.data-table th {
  background-color: var(--bg-body);
  color: var(--text-muted);
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
}

.tfoot-row td {
  background-color: var(--bg-body);
  border-top: 2px solid var(--border-color);
  padding: 16px 20px;
}

.text-green { color: #16A34A; }
.text-red { color: #EF4444; }

.badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.bg-yellow { background-color: #FEF08A; }
.text-yellow-dark { color: #854D0E; }
.bg-blue { background-color: #BFDBFE; }
.text-blue-dark { color: #1E3A8A; }
.bg-green { background-color: #BBF7D0; }
.text-green-dark { color: #14532D; }
.badge-danger {
  background-color: #FEE2E2;
  color: #DC2626;
}

.loader-wrapper {
  padding: 60px 0;
}

.btn-secondary {
  padding: 8px 16px;
  background-color: transparent;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-secondary:hover { background-color: var(--bg-body); }

@media print {
  body * {
    visibility: hidden;
  }
  
  .relatorios-page, .relatorios-page * {
    visibility: visible;
  }
  
  .relatorios-page {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }

  .no-print {
    display: none !important;
  }
}
</style>
