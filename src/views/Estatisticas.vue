<template>
  <div class="estatisticas-page">
    <div class="header-actions mb-6">
      <h1 class="text-xl font-bold">Estatísticas do Negócio</h1>
      <p class="text-muted text-sm">Acompanhe a saúde financeira da sua carteira de empréstimos.</p>
    </div>

    <div v-if="loading" class="loader-wrapper surface">
      <Spinner message="A calcular estatísticas..." />
    </div>

    <div v-else>
      <div class="stats-grid mb-8">
        <div class="stat-card surface">
          <div class="stat-icon bg-blue-light text-blue">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div class="stat-info">
            <p class="text-muted text-sm font-semibold">Total Clientes</p>
            <h3 class="text-2xl font-bold mt-1">{{ stats.totalClientes }}</h3>
          </div>
        </div>

        <div class="stat-card surface">
          <div class="stat-icon bg-orange-light text-orange">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
          </div>
          <div class="stat-info">
            <p class="text-muted text-sm font-semibold">Empréstimos Ativos</p>
            <h3 class="text-2xl font-bold mt-1">{{ stats.totalEmprestimosAtivos }}</h3>
          </div>
        </div>

        <div class="stat-card surface">
          <div class="stat-icon bg-green-light text-green">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div class="stat-info">
            <p class="text-muted text-sm font-semibold">Total Recebido</p>
            <h3 class="text-2xl font-bold mt-1 text-green">MZN {{ formatMoney(stats.valorRecebido) }}</h3>
          </div>
        </div>

        <div class="stat-card surface">
          <div class="stat-icon bg-red-light text-red">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div class="stat-info">
            <p class="text-muted text-sm font-semibold">Total Emprestado (Capital)</p>
            <h3 class="text-2xl font-bold mt-1 text-red">MZN {{ formatMoney(stats.valorEmprestado) }}</h3>
          </div>
        </div>
      </div>

      <!-- Financial Health -->
      <div class="surface p-6 mb-8">
        <h3 class="font-bold text-lg mb-4">Análise de Liquidez (Capital de Giro)</h3>
        
        <div class="progress-bar-container">
          <div class="progress-labels">
            <span>MZN {{ formatMoney(stats.valorRecebido) }} Recuperados</span>
            <span>MZN {{ formatMoney(stats.valorEmprestado) }} Emprestados</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill bg-green" :style="{ width: getRecoveryPercentage() + '%' }"></div>
          </div>
          <p class="text-center text-sm text-muted mt-2">
            A sua taxa de recuperação de capital é de <strong>{{ getRecoveryPercentage() }}%</strong>.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { TrendingUp, Users, Wallet, CreditCard, Activity } from '@lucide/vue';
import Spinner from '../components/Spinner.vue';
import api from '../api';

const loading = ref(true);
const stats = ref({
  totalClientes: 0,
  totalEmprestimosAtivos: 0,
  valorEmprestado: 0,
  valorRecebido: 0
});

const loadStats = async () => {
  try {
    const { data } = await api.get('/dashboard/empresa');
    stats.value = data;
  } catch (error) {
    console.error('Error loading stats', error);
  } finally {
    loading.value = false;
  }
};

const formatMoney = (value) => {
  return Number(value || 0).toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const getRecoveryPercentage = () => {
  if (!stats.value.valorEmprestado) return 100;
  let percent = (stats.value.valorRecebido / stats.value.valorEmprestado) * 100;
  return Math.min(Math.round(percent), 100);
};

onMounted(() => {
  loadStats();
});
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
}

.stat-card {
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Colors */
.bg-blue-light { background-color: #EFF6FF; }
.text-blue { color: #3B82F6; }
.bg-orange-light { background-color: #FFF7ED; }
.text-orange { color: #F97316; }
.bg-green-light { background-color: #F0FDF4; }
.text-green { color: #16A34A; }
.bg-green { background-color: #16A34A; }
.bg-red-light { background-color: #FEF2F2; }
.text-red { color: #EF4444; }

/* Progress bar */
.progress-bar-container {
  margin-top: 16px;
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.875rem;
  font-weight: 500;
}

.progress-track {
  width: 100%;
  height: 12px;
  background-color: var(--border-color);
  border-radius: 6px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #10B981;
  border-radius: 8px;
  transition: width 1s ease-in-out;
}

.loader-wrapper {
  padding: 60px 0;
}
</style>
