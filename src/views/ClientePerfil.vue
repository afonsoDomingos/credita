<template>
  <div class="cliente-perfil-page">
    <div class="header-actions flex justify-between items-center mb-6">
      <div class="flex items-center gap-4">
        <button class="back-btn flex items-center justify-center" @click="$router.push('/app/clientes')" title="Voltar aos Clientes">
          <ArrowLeft :size="20" />
        </button>
        <div>
          <h1 class="text-2xl font-bold text-main">Perfil do Cliente</h1>
          <p class="text-muted text-sm mt-0.5">Histórico financeiro completo e score de confiança.</p>
        </div>
      </div>
    </div>

    <div v-if="loading" class="surface loader-card p-12 text-center rounded-2xl shadow-sm">
      <Spinner message="A carregar perfil do cliente..." />
    </div>

    <div v-else-if="profile" class="profile-content space-y-6">
      <!-- Header do Perfil -->
      <div class="surface profile-header rounded-2xl shadow-sm border p-6">
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
            <div class="score-circle shadow-sm" :class="scoreClass">
              <span class="score-value">{{ profile.stats.score }}</span>
            </div>
            <span class="score-label mt-1">{{ scoreText }}</span>
          </div>
        </div>
      </div>

      <!-- Cards de Métricas -->
      <div class="stats-grid-4 gap-4">
        <div class="surface metric-card rounded-2xl shadow-sm border p-5">
          <span class="metric-title">Total Emprestado</span>
          <span class="metric-value text-blue-600 mt-1">MT {{ profile.stats.totalEmprestado.toLocaleString() }}</span>
        </div>
        <div class="surface metric-card rounded-2xl shadow-sm border p-5">
          <span class="metric-title">Total Pago</span>
          <span class="metric-value text-emerald-600 mt-1">MT {{ profile.stats.totalPago.toLocaleString() }}</span>
        </div>
        <div class="surface metric-card rounded-2xl shadow-sm border p-5">
          <span class="metric-title">Em Dívida</span>
          <span class="metric-value mt-1" :class="profile.stats.totalEmDivida > 0 ? 'text-red-600' : 'text-emerald-600'">
            MT {{ profile.stats.totalEmDivida.toLocaleString() }}
          </span>
        </div>
        <div class="surface metric-card rounded-2xl shadow-sm border p-5">
          <span class="metric-title">Estado Empréstimos</span>
          <div class="flex gap-2 mt-2 flex-wrap">
            <span class="mini-badge bg-blue-100 text-blue-700 font-bold">{{ profile.stats.emprestimosAtivos }} ativos</span>
            <span class="mini-badge bg-emerald-100 text-emerald-700 font-bold">{{ profile.stats.emprestimosPagos }} pagos</span>
            <span v-if="profile.stats.emprestimosAtraso > 0" class="mini-badge bg-red-100 text-red-700 font-bold">{{ profile.stats.emprestimosAtraso }} atraso</span>
          </div>
        </div>
      </div>

      <!-- Empréstimos do Cliente -->
      <div class="surface rounded-2xl shadow-sm border overflow-hidden">
        <div class="p-5 border-b bg-slate-50/50">
          <h3 class="font-bold text-base text-main">Empréstimos do Cliente</h3>
        </div>
        <div class="overflow-x-auto">
          <table v-if="profile.loans.length > 0" class="data-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Capital</th>
                <th>Juros</th>
                <th>Total c/ Juros</th>
                <th>Vencimento</th>
                <th>Estado</th>
                <th class="text-right">Ação</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="loan in profile.loans" :key="loan._id" class="table-row">
                <td>{{ new Date(loan.createdAt).toLocaleDateString('pt-PT') }}</td>
                <td class="font-bold">MT {{ loan.amount.toLocaleString() }}</td>
                <td>{{ loan.interestRate }}%</td>
                <td class="font-bold text-blue-600">MT {{ loan.totalComJuros.toLocaleString() }}</td>
                <td>{{ new Date(loan.dueDate).toLocaleDateString('pt-PT') }}</td>
                <td>
                  <span class="badge" :class="loan.status === 'active' ? 'badge-active' : loan.status === 'paid' ? 'badge-paid' : 'badge-danger'">
                    {{ loan.status === 'active' ? 'Ativo' : loan.status === 'paid' ? 'Pago' : 'Em Dívida' }}
                  </span>
                </td>
                <td class="text-right">
                  <button class="btn-detalhes" @click="$router.push(`/app/emprestimos/${loan._id}`)">Ver Detalhes</button>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-else class="p-8 text-center text-muted">Nenhum empréstimo registado para este cliente.</div>
        </div>
      </div>

      <!-- Últimos Pagamentos -->
      <div class="surface rounded-2xl shadow-sm border overflow-hidden">
        <div class="p-5 border-b bg-slate-50/50">
          <h3 class="font-bold text-base text-main">Últimos Pagamentos</h3>
        </div>
        <div class="overflow-x-auto">
          <table v-if="profile.payments.length > 0" class="data-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Valor Pago</th>
                <th>Método</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="pay in profile.payments" :key="pay._id" class="table-row">
                <td>{{ new Date(pay.paymentDate).toLocaleDateString('pt-PT') }}</td>
                <td class="font-bold text-emerald-600">MT {{ pay.amountPaid.toLocaleString() }}</td>
                <td class="capitalize">{{ traduzirMetodo(pay.paymentMethod) }}</td>
              </tr>
            </tbody>
          </table>
          <div v-else class="p-8 text-center text-muted">Nenhum pagamento registado.</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { ArrowLeft } from '@lucide/vue';
import Spinner from '../components/Spinner.vue';
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
.cliente-perfil-page {
  max-width: 1200px;
  margin: 0 auto;
}

.back-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  background-color: var(--bg-surface);
  color: var(--text-main);
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background-color: var(--bg-body);
  transform: translateX(-2px);
}

.profile-avatar {
  width: 76px;
  height: 76px;
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
  gap: 4px;
}

.score-circle {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4px solid;
}

.score-value {
  font-size: 1.4rem;
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
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.metric-card {
  display: flex;
  flex-direction: column;
}

.metric-title {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metric-value {
  font-size: 1.5rem;
  font-weight: 800;
}

.mini-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
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
  background-color: #F8FAFC;
  color: #64748B;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.table-row {
  transition: background-color 0.15s ease;
}

.table-row:hover {
  background-color: #F8FAFC;
}

.badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
}
.badge-active { background-color: #DBEAFE; color: #1D4ED8; }
.badge-paid { background-color: #DCFCE7; color: #15803D; }
.badge-danger { background-color: #FEE2E2; color: #B91C1C; }

.btn-detalhes {
  background-color: #EFF6FF;
  color: #2563EB;
  border: 1px solid #BFDBFE;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-detalhes:hover {
  background-color: #DBEAFE;
  color: #1D4ED8;
}

.capitalize { text-transform: capitalize; }

@media (max-width: 768px) {
  .profile-top {
    flex-direction: column;
    text-align: center;
  }
  .score-widget {
    margin-top: 12px;
  }
}
</style>
