<template>
  <div class="dashboard">
    <div class="dashboard-header flex justify-between items-center">
      <div>
        <h1 class="text-xl font-bold">Visão Geral</h1>
        <p class="text-muted text-sm">Resumo financeiro e operacional de hoje.</p>
      </div>
      <div class="header-actions">
        <button class="btn-secondary flex items-center gap-2" @click="exportarDados">
          <Download :size="16" />
          Exportar
        </button>
        <button class="btn-primary flex items-center gap-2" @click="irParaNovoEmprestimo">
          <Plus :size="16" />
          Novo Empréstimo
        </button>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="stats-grid">
      <div class="surface stat-card" v-for="stat in stats" :key="stat.title">
        <div class="stat-header flex justify-between items-center">
          <span class="stat-title text-sm font-medium text-muted">{{ stat.title }}</span>
          <div :class="['stat-icon-wrapper', stat.colorClass]">
            <component :is="stat.icon" :size="18" />
          </div>
        </div>
        <div class="stat-value font-bold text-xl">{{ stat.value }}</div>
        <div class="stat-footer flex items-center gap-1 text-xs">
          <TrendingUp v-if="stat.trend === 'up'" :size="14" class="text-green" />
          <TrendingDown v-if="stat.trend === 'down'" :size="14" class="text-red" />
          <span :class="{'text-green': stat.trend === 'up', 'text-red': stat.trend === 'down', 'text-muted': !stat.trend}">
            {{ stat.trendValue }}
          </span>
          <span class="text-muted">vs mês passado</span>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="main-grid">
      <!-- Charts Section (Placeholders) -->
      <div class="charts-section flex-col gap-6">
        <div class="surface chart-card">
          <div class="card-header flex justify-between items-center">
            <h3 class="font-semibold">Fluxo de Caixa & Recebimentos</h3>
            <span class="text-xs text-muted">Últimos 6 meses</span>
          </div>
          <div class="chart-container p-4">
            <Line v-if="lineChartData" :data="lineChartData" :options="lineChartOptions" />
            <div v-else class="chart-placeholder flex items-center justify-center bg-light">
              <span class="text-muted">A carregar gráfico...</span>
            </div>
          </div>
        </div>
        
        <div class="grid-2 gap-6">
          <div class="surface chart-card">
            <div class="card-header flex justify-between items-center">
              <h3 class="font-semibold">Estado da Carteira</h3>
              <span class="text-xs text-muted">Distribuição</span>
            </div>
            <div class="chart-container-sm p-4 flex items-center justify-center">
              <Doughnut v-if="doughnutChartData" :data="doughnutChartData" :options="doughnutChartOptions" />
              <div v-else class="text-muted text-sm">A carregar...</div>
            </div>
          </div>
          
          <!-- Últimos Clientes -->
          <div class="surface list-card">
            <div class="card-header flex justify-between items-center">
              <h3 class="font-semibold">Últimos Clientes</h3>
              <a href="#" class="text-sm text-primary font-medium">Ver todos</a>
            </div>
            <div class="list-content" v-if="dashboardData && dashboardData.ultimosClientes.length > 0">
              <div class="list-item flex items-center justify-between" v-for="(cliente, index) in dashboardData.ultimosClientes" :key="cliente._id">
                <div class="flex items-center gap-3">
                  <div class="avatar-sm bg-primary-light text-primary font-bold flex items-center justify-center rounded-full">
                    {{ cliente.name.charAt(0) }}
                  </div>
                  <div>
                    <div class="font-medium text-sm">{{ cliente.name }}</div>
                    <div class="text-xs text-muted">{{ cliente.phone }}</div>
                  </div>
                </div>
                <button class="btn-secondary-sm">Ver</button>
              </div>
            </div>
            <div v-else class="p-4 text-center text-sm text-muted">
              Nenhum cliente cadastrado ainda.
            </div>
          </div>
        </div>
      </div>

      <!-- Side Section (Removido - Dados mockados) -->
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { 
  Users, Banknote, CreditCard, Wallet, 
  TrendingUp, TrendingDown, AlertCircle, 
  CheckCircle2, Download, Plus, MoreHorizontal,
  BarChart2, PieChart, Calendar
} from '@lucide/vue';
import { Line, Doughnut } from 'vue-chartjs';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import api from '../api';

const router = useRouter();

const irParaNovoEmprestimo = () => {
  router.push({ path: '/app/emprestimos', query: { novo: '1' } });
};

const exportarDados = () => {
  router.push('/app/relatorios');
};

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler);

const loading = ref(true);
const dashboardData = ref(null);
const stats = ref([]);

const loadDashboard = async () => {
  try {
    const { data } = await api.get('/dashboard/empresa');
    dashboardData.value = data;
    
    stats.value = [
      { title: 'Total de Clientes', value: data.totalClientes, trend: null, trendValue: 'Cadastrados', icon: Users, colorClass: 'bg-blue-light text-blue' },
      { title: 'Empréstimos Ativos', value: data.totalEmprestimosAtivos, trend: null, trendValue: 'Em curso', icon: Banknote, colorClass: 'bg-indigo-light text-indigo' },
      { title: 'Valor Emprestado', value: `MT ${data.valorEmprestado.toLocaleString()}`, trend: null, trendValue: 'Total', icon: Wallet, colorClass: 'bg-purple-light text-purple' },
      { title: 'Valor Recebido', value: `MT ${data.valorRecebido.toLocaleString()}`, trend: null, trendValue: 'Total', icon: CreditCard, colorClass: 'bg-green-light text-green' },
      { title: 'Plano', value: data.plano.toUpperCase(), trend: null, trendValue: 'Assinatura', icon: CheckCircle2, colorClass: 'bg-green-light text-green' },
    ];
  } catch (error) {
    console.error('Error loading dashboard', error);
  } finally {
    loading.value = false;
  }
};

// Chart.js Data (Computed from API data)
const lineChartData = computed(() => {
  if (!dashboardData.value?.chartData) return null;
  const cd = dashboardData.value.chartData;
  return {
    labels: cd.labelsMeses,
    datasets: [{
      label: 'Recebimentos (MT)',
      data: cd.receitasMensais,
      borderColor: '#2563EB',
      backgroundColor: 'rgba(37, 99, 235, 0.08)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#2563EB',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 7
    }]
  };
});

const lineChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1F2937',
      titleFont: { size: 13 },
      bodyFont: { size: 12 },
      padding: 12,
      cornerRadius: 8,
      callbacks: {
        label: (ctx) => `MT ${ctx.parsed.y.toLocaleString()}`
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(0,0,0,0.04)' },
      ticks: {
        callback: (v) => `MT ${v.toLocaleString()}`,
        font: { size: 11 },
        color: '#9CA3AF'
      }
    },
    x: {
      grid: { display: false },
      ticks: { font: { size: 11 }, color: '#9CA3AF' }
    }
  },
  animation: {
    duration: 1200,
    easing: 'easeOutQuart'
  }
};

const doughnutChartData = computed(() => {
  if (!dashboardData.value?.chartData) return null;
  const c = dashboardData.value.chartData.carteira;
  return {
    labels: ['Ativos', 'Pagos', 'Em Dívida'],
    datasets: [{
      data: [c.ativos, c.pagos, c.divida],
      backgroundColor: ['#3B82F6', '#10B981', '#EF4444'],
      borderColor: ['#fff', '#fff', '#fff'],
      borderWidth: 3,
      hoverOffset: 8
    }]
  };
});

const doughnutChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        padding: 16,
        usePointStyle: true,
        pointStyle: 'circle',
        font: { size: 12 }
      }
    }
  },
  cutout: '65%',
  animation: {
    animateRotate: true,
    duration: 1000
  }
};

onMounted(() => {
  loadDashboard();
});
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.dashboard-header {
  margin-bottom: 8px;
}

.header-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
  padding: 10px 20px;
  border-radius: var(--radius-sm);
  font-weight: 500;
  font-size: 0.875rem;
  transition: background-color var(--transition-fast), transform var(--transition-fast);
  cursor: pointer;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
}

.btn-primary:hover {
  background-color: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(37, 99, 235, 0.3);
}

.btn-primary:active {
  transform: translateY(0);
}

.btn-secondary {
  background-color: var(--bg-surface);
  color: var(--text-main);
  border: 1px solid var(--border-color);
  padding: 10px 20px;
  border-radius: var(--radius-sm);
  font-weight: 500;
  font-size: 0.875rem;
  transition: all var(--transition-fast);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-secondary:hover {
  background-color: var(--bg-body);
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.btn-secondary-sm {
  background-color: var(--bg-body);
  color: var(--text-main);
  border: 1px solid var(--border-color);
  padding: 4px 12px;
  border-radius: var(--radius-sm);
  font-weight: 500;
  font-size: 0.75rem;
  transition: all var(--transition-fast);
}

.btn-secondary-sm:hover {
  background-color: #E5E7EB;
}

.btn-icon {
  color: var(--text-muted);
  padding: 4px;
  border-radius: 4px;
}
.btn-icon:hover {
  background-color: var(--bg-body);
  color: var(--text-main);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.stat-card {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.stat-icon-wrapper {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-blue-light { background-color: #DBEAFE; }
.text-blue { color: #2563EB; }
.bg-indigo-light { background-color: #E0E7FF; }
.text-indigo { color: #4F46E5; }
.bg-purple-light { background-color: #F3E8FF; }
.text-purple { color: #9333EA; }
.bg-green-light { background-color: #DCFCE7; }
.text-green { color: #16A34A; }
.bg-emerald-light { background-color: #D1FAE5; }
.text-emerald { color: #059669; }
.bg-red-light { background-color: #FEE2E2; }
.text-red { color: #DC2626; }
.bg-orange-light { background-color: #FFEDD5; }
.text-orange { color: #EA580C; }

.bg-primary-light { background-color: #EFF6FF; }

.main-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.card-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
}

.chart-container {
  height: 300px;
  position: relative;
}

.chart-container-sm {
  height: 260px;
  position: relative;
}

.chart-placeholder {
  height: 300px;
  background-color: var(--bg-body);
  border-bottom-left-radius: var(--radius-md);
  border-bottom-right-radius: var(--radius-md);
}

.list-content {
  display: flex;
  flex-direction: column;
}

.list-item {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
}

.list-item:last-child {
  border-bottom: none;
}

.payment-item {
  transition: background-color var(--transition-fast);
}

.payment-item:hover {
  background-color: var(--bg-body);
}

.avatar-sm {
  width: 36px;
  height: 36px;
}

.status-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
}

.status-warning {
  background-color: #FEF3C7;
  color: #D97706;
}

@media (max-width: 1024px) {
  .main-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .grid-2 {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .header-actions {
    width: 100%;
    flex-direction: column;
  }
  
  .header-actions .btn-primary,
  .header-actions .btn-secondary {
    width: 100%;
    justify-content: center;
  }
  
  .chart-container {
    height: 250px;
  }
  
  .chart-container-sm {
    height: 220px;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .dashboard-header h1 {
    font-size: 1.25rem;
  }
  
  .dashboard-header p {
    font-size: 0.875rem;
  }
  
  .stat-card {
    padding: 16px;
  }
  
  .stat-value {
    font-size: 1.5rem;
  }
}
</style>
