<template>
  <div class="cliente-perfil-page">
    <div class="header-actions flex justify-between items-center mb-6">
      <div class="flex items-center gap-4">
        <button class="btn-icon bg-surface" @click="$router.push('/app/clientes')" title="Voltar">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
        </button>
        <div>
          <h1 class="text-xl font-bold">Perfil do Cliente</h1>
          <p class="text-muted text-sm">Histórico financeiro completo e score de confiança.</p>
        </div>
      </div>
    </div>

    <div v-if="loading" class="surface p-12 text-center text-muted">A carregar perfil...</div>

    <div v-else-if="profile" class="profile-content">
      <!-- Header do Perfil -->
      <div class="surface profile-header mb-6">
        <div class="profile-top flex items-center gap-6">
          <div class="profile-avatar">{{ profile.client.name.charAt(0) }}</div>
          <div class="flex-1">
            <h2 class="text-2xl font-bold mb-1">{{ profile.client.name }}</h2>
            <div class="flex items-center gap-4 text-sm text-muted flex-wrap">
              <span v-if="profile.client.phone">📱 {{ profile.client.phone }}</span>
              <span v-if="profile.client.idCard">🪪 {{ profile.client.idCard }}</span>
              <span v-if="profile.client.address">📍 {{ profile.client.address }}</span>
            </div>
            <p class="text-xs text-muted mt-2">Cliente desde {{ new Date(profile.client.createdAt).toLocaleDateString('pt-PT') }}</p>
          </div>
          <!-- Score de Confiança -->
          <div class="score-widget">
            <div class="score-circle" :class="scoreClass">
              <span class="score-value">{{ profile.stats.score }}</span>
            </div>
            <span class="score-label">{{ scoreText }}</span>
          </div>
        </div>
      </div>

      <!-- Cards de Métricas -->
      <div class="stats-grid-4 mb-6">
        <div class="surface metric-card">
          <span class="metric-title">Total Emprestado</span>
          <span class="metric-value text-blue">MT {{ profile.stats.totalEmprestado.toLocaleString() }}</span>
        </div>
        <div class="surface metric-card">
          <span class="metric-title">Total Pago</span>
          <span class="metric-value text-green">MT {{ profile.stats.totalPago.toLocaleString() }}</span>
        </div>
        <div class="surface metric-card">
          <span class="metric-title">Em Dívida</span>
          <span class="metric-value" :class="profile.stats.totalEmDivida > 0 ? 'text-red' : 'text-green'">MT {{ profile.stats.totalEmDivida.toLocaleString() }}</span>
        </div>
        <div class="surface metric-card">
          <span class="metric-title">Empréstimos</span>
          <div class="flex gap-3 mt-1">
            <span class="mini-badge bg-blue-light text-blue">{{ profile.stats.emprestimosAtivos }} ativos</span>
            <span class="mini-badge bg-green-light text-green">{{ profile.stats.emprestimosPagos }} pagos</span>
            <span v-if="profile.stats.emprestimosAtraso > 0" class="mini-badge bg-red-light text-red">{{ profile.stats.emprestimosAtraso }} atraso</span>
          </div>
        </div>
      </div>

      <!-- Empréstimos do Cliente -->
      <div class="surface p-0 overflow-hidden mb-6">
        <div class="p-5 border-b">
          <h3 class="font-bold text-lg">Empréstimos</h3>
        </div>
        <table v-if="profile.loans.length > 0" class="data-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Capital</th>
              <th>Juros</th>
              <th>Total c/ Juros</th>
              <th>Vencimento</th>
              <th>Estado</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="loan in profile.loans" :key="loan._id">
              <td>{{ new Date(loan.createdAt).toLocaleDateString('pt-PT') }}</td>
              <td class="font-bold">MT {{ loan.amount.toLocaleString() }}</td>
              <td>{{ loan.interestRate }}%</td>
              <td class="font-bold text-blue">MT {{ loan.totalComJuros.toLocaleString() }}</td>
              <td>{{ new Date(loan.dueDate).toLocaleDateString('pt-PT') }}</td>
              <td>
                <span class="badge" :class="loan.status === 'active' ? 'badge-active' : loan.status === 'paid' ? 'badge-paid' : 'badge-danger'">
                  {{ loan.status === 'active' ? 'Ativo' : loan.status === 'paid' ? 'Pago' : 'Em Dívida' }}
                </span>
              </td>
              <td>
                <button class="btn-text" @click="$router.push(`/app/emprestimos/${loan._id}`)">Ver Detalhes</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else class="p-8 text-center text-muted">Nenhum empréstimo registado para este cliente.</div>
      </div>

      <!-- Últimos Pagamentos -->
      <div class="surface p-0 overflow-hidden">
        <div class="p-5 border-b">
          <h3 class="font-bold text-lg">Últimos Pagamentos</h3>
        </div>
        <table v-if="profile.payments.length > 0" class="data-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Valor Pago</th>
              <th>Método</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="pay in profile.payments" :key="pay._id">
              <td>{{ new Date(pay.paymentDate).toLocaleDateString('pt-PT') }}</td>
              <td class="font-bold text-green">MT {{ pay.amountPaid.toLocaleString() }}</td>
              <td class="capitalize">{{ traduzirMetodo(pay.paymentMethod) }}</td>
            </tr>
          </tbody>
        </table>
        <div v-else class="p-8 text-center text-muted">Nenhum pagamento registado.</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import api from '../api';

const route = useRoute();
const profile = ref(null);
const loading = ref(true);

const loadProfile = async () => {
  try {
    const { data } = await api.get(`/clients/${route.params.id}/profile`);
    profile.value = data;
  } catch (error) {
    console.error('Erro ao carregar perfil:', error);
  } finally {
    loading.value = false;
  }
};

const traduzirMetodo = (m) => {
  const map = { 'cash': 'Numerário', 'transfer': 'Transferência', 'card': 'Cartão' };
  return map[m] || m;
};

const scoreClass = computed(() => {
  if (!profile.value) return '';
  const s = profile.value.stats.score;
  if (s >= 70) return 'score-good';
  if (s >= 40) return 'score-medium';
  return 'score-bad';
});

const scoreText = computed(() => {
  if (!profile.value) return '';
  const s = profile.value.stats.score;
  if (s >= 70) return 'Excelente';
  if (s >= 50) return 'Bom';
  if (s >= 30) return 'Regular';
  return 'Alto Risco';
});

onMounted(() => {
  loadProfile();
});
</script>

<style scoped>
.profile-header {
  padding: 32px;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2563EB, #7C3AED);
  color: white;
  font-size: 2rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.score-widget {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.score-circle {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4px solid;
}

.score-value {
  font-size: 1.5rem;
  font-weight: 800;
}

.score-good { border-color: #10B981; color: #10B981; background-color: #F0FDF4; }
.score-medium { border-color: #F59E0B; color: #F59E0B; background-color: #FFFBEB; }
.score-bad { border-color: #EF4444; color: #EF4444; background-color: #FEF2F2; }

.score-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-muted);
}

.stats-grid-4 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.metric-card {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.metric-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.metric-value {
  font-size: 1.4rem;
  font-weight: 800;
}

.text-blue { color: #2563EB; }
.text-green { color: #16A34A; }
.text-red { color: #DC2626; }

.mini-badge {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 600;
}
.bg-blue-light { background-color: #DBEAFE; }
.bg-green-light { background-color: #DCFCE7; }
.bg-red-light { background-color: #FEE2E2; }

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

.badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
}
.badge-active { background-color: #DBEAFE; color: #2563EB; }
.badge-paid { background-color: #DCFCE7; color: #16A34A; }
.badge-danger { background-color: #FEE2E2; color: #DC2626; }

.btn-text {
  background: none;
  border: none;
  color: var(--primary-color);
  font-weight: 500;
  cursor: pointer;
  font-size: 0.875rem;
}
.btn-text:hover { text-decoration: underline; }

.capitalize { text-transform: capitalize; }

@media (max-width: 768px) {
  .profile-top {
    flex-direction: column;
    text-align: center;
  }
  .score-widget {
    margin-top: 16px;
  }
}
</style>
