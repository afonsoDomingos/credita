<template>
  <div class="dashboard">
    <div class="dashboard-header flex justify-between items-center">
      <div>
        <h1 class="text-xl font-bold">Visão Geral</h1>
        <p class="text-muted text-sm">Resumo financeiro e operacional de hoje.</p>
      </div>
      <div class="header-actions">
        <button class="btn-secondary flex items-center gap-2">
          <Download :size="16" />
          Exportar
        </button>
        <button class="btn-primary flex items-center gap-2">
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
            <button class="btn-icon"><MoreHorizontal :size="18" /></button>
          </div>
          <div class="chart-placeholder flex items-center justify-center bg-light">
            <BarChart2 :size="48" class="text-muted opacity-50" />
            <span class="text-muted ml-2">Gráfico de Barras / Linhas</span>
          </div>
        </div>
        
        <div class="grid-2 gap-6">
          <div class="surface chart-card">
            <div class="card-header flex justify-between items-center">
              <h3 class="font-semibold">Status de Empréstimos</h3>
              <button class="btn-icon"><MoreHorizontal :size="18" /></button>
            </div>
            <div class="chart-placeholder flex items-center justify-center bg-light" style="height: 200px;">
              <PieChart :size="48" class="text-muted opacity-50" />
            </div>
          </div>
          
          <!-- Últimos Clientes -->
          <div class="surface list-card">
            <div class="card-header flex justify-between items-center">
              <h3 class="font-semibold">Últimos Clientes</h3>
              <a href="#" class="text-sm text-primary font-medium">Ver todos</a>
            </div>
            <div class="list-content">
              <div class="list-item flex items-center justify-between" v-for="i in 3" :key="'cliente'+i">
                <div class="flex items-center gap-3">
                  <div class="avatar-sm bg-primary-light text-primary font-bold flex items-center justify-center rounded-full">
                    C{{ i }}
                  </div>
                  <div>
                    <div class="font-medium text-sm">Cliente Exemplo {{ i }}</div>
                    <div class="text-xs text-muted">Há {{ i * 2 }} horas</div>
                  </div>
                </div>
                <button class="btn-secondary-sm">Ver</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Side Section -->
      <div class="side-section flex-col gap-6">
        <!-- Próximos Vencimentos -->
        <div class="surface list-card">
          <div class="card-header flex justify-between items-center">
            <h3 class="font-semibold">Próximos Vencimentos</h3>
            <button class="btn-icon"><MoreHorizontal :size="18" /></button>
          </div>
          <div class="list-content">
            <div class="list-item payment-item" v-for="i in 4" :key="'venc'+i">
              <div class="flex justify-between items-center mb-1">
                <span class="font-medium text-sm">Parcela #{{ i }} - Cliente {{ i }}</span>
                <span class="font-bold text-sm text-orange">Kz 50.000</span>
              </div>
              <div class="flex justify-between items-center text-xs text-muted">
                <span class="flex items-center gap-1"><Calendar :size="12" /> Vence em {{ i }} dias</span>
                <span class="status-badge status-warning">Pendente</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Últimos Pagamentos -->
        <div class="surface list-card">
          <div class="card-header flex justify-between items-center">
            <h3 class="font-semibold">Últimos Pagamentos</h3>
            <button class="btn-icon"><MoreHorizontal :size="18" /></button>
          </div>
          <div class="list-content">
            <div class="list-item payment-item" v-for="i in 4" :key="'pag'+i">
              <div class="flex justify-between items-center mb-1">
                <span class="font-medium text-sm">João Oliveira</span>
                <span class="font-bold text-sm text-green">+ Kz 25.000</span>
              </div>
              <div class="flex justify-between items-center text-xs text-muted">
                <span>Recebido via Transf.</span>
                <span>Hoje, 10:{{ i * 10 }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { 
  Users, Banknote, CreditCard, Wallet, 
  TrendingUp, TrendingDown, AlertCircle, 
  CheckCircle2, Download, Plus, MoreHorizontal,
  BarChart2, PieChart, Calendar
} from '@lucide/vue';

const stats = [
  { title: 'Total de Clientes', value: '1.248', trend: 'up', trendValue: '+12%', icon: Users, colorClass: 'bg-blue-light text-blue' },
  { title: 'Empréstimos Ativos', value: '342', trend: 'up', trendValue: '+5%', icon: Banknote, colorClass: 'bg-indigo-light text-indigo' },
  { title: 'Valor Emprestado', value: 'Kz 15.4M', trend: 'up', trendValue: '+8.2%', icon: Wallet, colorClass: 'bg-purple-light text-purple' },
  { title: 'Valor Recebido', value: 'Kz 4.2M', trend: 'down', trendValue: '-2.4%', icon: CreditCard, colorClass: 'bg-green-light text-green' },
  { title: 'Lucro do Mês', value: 'Kz 1.8M', trend: 'up', trendValue: '+14%', icon: TrendingUp, colorClass: 'bg-emerald-light text-emerald' },
  { title: 'Cobranças em Atraso', value: '45', trend: 'down', trendValue: '-5', icon: AlertCircle, colorClass: 'bg-red-light text-red' },
  { title: 'Caixa Atual', value: 'Kz 8.5M', trend: 'up', trendValue: '+2.1%', icon: Wallet, colorClass: 'bg-blue-light text-blue' },
  { title: 'Assinatura', value: 'Plano Pro', trend: null, trendValue: 'Ativa até Dez', icon: CheckCircle2, colorClass: 'bg-green-light text-green' },
];
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

.btn-primary {
  background-color: var(--primary-color);
  color: white;
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  font-weight: 500;
  font-size: 0.875rem;
  transition: background-color var(--transition-fast);
}

.btn-primary:hover {
  background-color: var(--primary-hover);
}

.btn-secondary {
  background-color: var(--bg-surface);
  color: var(--text-main);
  border: 1px solid var(--border-color);
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  font-weight: 500;
  font-size: 0.875rem;
  transition: all var(--transition-fast);
}

.btn-secondary:hover {
  background-color: var(--bg-body);
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
  grid-template-columns: 2fr 1fr;
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
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
