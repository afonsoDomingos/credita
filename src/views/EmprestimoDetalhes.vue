<template>
  <div class="emprestimo-detalhes-page">
    <div class="header-actions flex justify-between items-center mb-6">
      <div class="flex items-center gap-4">
        <button class="btn-icon bg-surface" @click="$router.push('/app/emprestimos')" title="Voltar">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
        </button>
        <div>
          <h1 class="text-xl font-bold">Detalhes do Empréstimo</h1>
          <p class="text-muted text-sm">Histórico completo e situação financeira.</p>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loader-wrapper surface">
      <div class="p-8 text-center text-muted">A carregar dados do empréstimo...</div>
    </div>

    <div v-else-if="loan" class="loan-content">
      <!-- Cards de Resumo -->
      <div class="grid-3 mb-6 gap-4">
        <div class="surface stat-card">
          <p class="text-muted text-sm font-semibold mb-1">Cliente</p>
          <h3 class="text-lg font-bold">{{ loan.client?.name }}</h3>
          <p class="text-xs text-muted mt-1">{{ loan.client?.phone }}</p>
        </div>
        
        <div class="surface stat-card">
          <p class="text-muted text-sm font-semibold mb-1">Total a Receber</p>
          <h3 class="text-xl font-bold text-blue">MT {{ totalEsperado.toLocaleString() }}</h3>
          <p class="text-xs text-muted mt-1">Capital: MT {{ loan.amount.toLocaleString() }} + Juros: {{ loan.interestRate }}%</p>
        </div>

        <div class="surface stat-card">
          <p class="text-muted text-sm font-semibold mb-1">Em Dívida</p>
          <h3 class="text-xl font-bold" :class="valorEmDivida > 0 ? 'text-red' : 'text-green'">
            MT {{ valorEmDivida.toLocaleString() }}
          </h3>
          <p class="text-xs text-muted mt-1">Vencimento: {{ new Date(loan.dueDate).toLocaleDateString('pt-PT') }}</p>
        </div>
      </div>

      <!-- Barra de Progresso -->
      <div class="surface mb-6 p-6">
        <div class="flex justify-between mb-2">
          <span class="font-bold text-sm">Progresso do Pagamento</span>
          <span class="font-bold text-sm text-green">{{ percentagemPaga }}%</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill bg-green" :style="{ width: percentagemPaga + '%' }"></div>
        </div>
        <p class="text-xs text-muted mt-2 text-right">Já recebeu MT {{ totalPago.toLocaleString() }} de MT {{ totalEsperado.toLocaleString() }}</p>
      </div>

      <!-- Histórico de Pagamentos -->
      <div class="surface p-0 overflow-hidden">
        <div class="p-6 border-b">
          <h3 class="font-bold text-lg">Histórico de Pagamentos</h3>
        </div>
        
        <table v-if="loan.payments && loan.payments.length > 0" class="data-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Valor Pago</th>
              <th>Método</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="pay in loan.payments" :key="pay._id">
              <td>{{ new Date(pay.paymentDate).toLocaleDateString('pt-PT') }}</td>
              <td class="font-bold text-green">MT {{ pay.amountPaid.toLocaleString() }}</td>
              <td class="capitalize">{{ traduzirMetodo(pay.paymentMethod) }}</td>
              <td>
                <button class="btn-text" @click="imprimirRecibo(pay._id)">Imprimir Recibo</button>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div v-else class="p-8 text-center text-muted">
          Nenhum pagamento registado para este empréstimo até ao momento.
        </div>
      </div>
    </div>
    
    <div v-else class="surface p-8 text-center text-red">
      Erro: Empréstimo não encontrado.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../api';

const route = useRoute();
const router = useRouter();
const loan = ref(null);
const loading = ref(true);

const loadLoanDetails = async () => {
  try {
    const { data } = await api.get(`/loans/${route.params.id}`);
    loan.value = data;
  } catch (error) {
    console.error('Erro ao buscar detalhes do empréstimo:', error);
  } finally {
    loading.value = false;
  }
};

const traduzirMetodo = (metodo) => {
  const map = { 'cash': 'Numerário', 'transfer': 'Transferência', 'card': 'Cartão' };
  return map[metodo] || metodo;
};

const imprimirRecibo = (paymentId) => {
  window.open(`/print/recibo/${paymentId}`, '_blank');
};

const totalEsperado = computed(() => {
  if (!loan.value) return 0;
  return loan.value.amount + (loan.value.amount * (loan.value.interestRate / 100));
});

const totalPago = computed(() => {
  if (!loan.value || !loan.value.payments) return 0;
  return loan.value.payments.reduce((acc, pay) => acc + pay.amountPaid, 0);
});

const valorEmDivida = computed(() => {
  const div = totalEsperado.value - totalPago.value;
  return div > 0 ? div : 0;
});

const percentagemPaga = computed(() => {
  if (totalEsperado.value === 0) return 0;
  let p = (totalPago.value / totalEsperado.value) * 100;
  return Math.min(Math.round(p), 100);
});

onMounted(() => {
  loadLoanDetails();
});
</script>

<style scoped>
.grid-3 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

.stat-card {
  padding: 20px;
}

.text-blue { color: #2563EB; }
.text-red { color: #DC2626; }
.text-green { color: #16A34A; }
.bg-green { background-color: #10B981; }

.progress-track {
  width: 100%;
  height: 12px;
  background-color: var(--border-color);
  border-radius: 6px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 1s ease;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th, .data-table td {
  padding: 16px 24px;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.data-table th {
  background-color: var(--bg-body);
  color: var(--text-muted);
  font-weight: 600;
  font-size: 0.875rem;
}

.btn-text {
  background: none;
  border: none;
  color: var(--primary-color);
  font-weight: 500;
  cursor: pointer;
}

.btn-text:hover {
  text-decoration: underline;
}

.capitalize { text-transform: capitalize; }
</style>
