<template>
  <div class="estatisticas-page">

    <!-- Page Header -->
    <div class="page-header">
      <div class="page-header-left">
        <div class="page-header-icon">
          <BarChart2 :size="22" />
        </div>
        <div>
          <h1 class="page-title">Estatísticas do Negócio</h1>
          <p class="page-subtitle">Acompanhe a saúde financeira da sua carteira de crédito.</p>
        </div>
      </div>
      <div class="header-badge">
        <RefreshCw :size="14" />
        <span>Dados em tempo real</span>
      </div>
    </div>

    <div v-if="loading" class="loading-state surface">
      <Spinner message="A calcular estatísticas..." />
    </div>

    <div v-else>
      <!-- KPI Cards -->
      <div class="kpi-grid">

        <div class="kpi-card">
          <div class="kpi-top">
            <div class="kpi-icon blue">
              <Users :size="20" />
            </div>
            <div class="kpi-trend neutral">
              <TrendingUp :size="12" />
              Clientes
            </div>
          </div>
          <div class="kpi-value">{{ stats.totalClientes }}</div>
          <div class="kpi-label">Total de Clientes</div>
          <div class="kpi-bar blue-bar" :style="{ width: '100%' }"></div>
        </div>

        <div class="kpi-card">
          <div class="kpi-top">
            <div class="kpi-icon orange">
              <Activity :size="20" />
            </div>
            <div class="kpi-trend orange-trend">
              <Activity :size="12" />
              Ativos
            </div>
          </div>
          <div class="kpi-value">{{ stats.totalEmprestimosAtivos }}</div>
          <div class="kpi-label">Empréstimos Ativos</div>
          <div class="kpi-bar orange-bar" :style="{ width: activeRatio + '%' }"></div>
        </div>

        <div class="kpi-card">
          <div class="kpi-top">
            <div class="kpi-icon green">
              <Wallet :size="20" />
            </div>
            <div class="kpi-trend green-trend">
              <TrendingUp :size="12" />
              Recebido
            </div>
          </div>
          <div class="kpi-value success">MT {{ formatMoney(stats.valorRecebido) }}</div>
          <div class="kpi-label">Capital Recuperado</div>
          <div class="kpi-bar green-bar" :style="{ width: getRecoveryPercentage() + '%' }"></div>
        </div>

        <div class="kpi-card">
          <div class="kpi-top">
            <div class="kpi-icon red">
              <CreditCard :size="20" />
            </div>
            <div class="kpi-trend red-trend">
              <TrendingDown :size="12" />
              Emprestado
            </div>
          </div>
          <div class="kpi-value danger">MT {{ formatMoney(stats.valorEmprestado) }}</div>
          <div class="kpi-label">Capital Total Emprestado</div>
          <div class="kpi-bar red-bar" :style="{ width: '100%' }"></div>
        </div>

      </div>

      <!-- Metrics Section -->
      <div class="metrics-grid">

        <!-- Recovery Card -->
        <div class="metric-card surface">
          <div class="metric-header">
            <div class="metric-icon-wrap">
              <Percent :size="18" />
            </div>
            <div>
              <h3 class="metric-title">Taxa de Recuperação</h3>
              <p class="metric-subtitle">Percentagem de capital já recuperado</p>
            </div>
          </div>

          <div class="recovery-display">
            <div class="recovery-circle">
              <svg viewBox="0 0 120 120" class="circle-svg">
                <circle cx="60" cy="60" r="50" fill="none" stroke="var(--border-color)" stroke-width="10" />
                <circle
                  cx="60" cy="60" r="50"
                  fill="none"
                  stroke="url(#recoveryGrad)"
                  stroke-width="10"
                  stroke-linecap="round"
                  :stroke-dasharray="`${getRecoveryPercentage() * 3.14} 314`"
                  stroke-dashoffset="78.5"
                  transform="rotate(-90 60 60)"
                />
                <defs>
                  <linearGradient id="recoveryGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#10B981" />
                    <stop offset="100%" stop-color="#34D399" />
                  </linearGradient>
                </defs>
              </svg>
              <div class="circle-center">
                <strong>{{ getRecoveryPercentage() }}%</strong>
                <span>recuperado</span>
              </div>
            </div>

            <div class="recovery-details">
              <div class="detail-row">
                <div class="detail-dot green-dot"></div>
                <div>
                  <span class="detail-label">Capital Recuperado</span>
                  <strong class="detail-value success">MT {{ formatMoney(stats.valorRecebido) }}</strong>
                </div>
              </div>
              <div class="detail-row">
                <div class="detail-dot red-dot"></div>
                <div>
                  <span class="detail-label">Capital em Risco</span>
                  <strong class="detail-value danger">MT {{ formatMoney(Math.max(0, stats.valorEmprestado - stats.valorRecebido)) }}</strong>
                </div>
              </div>
              <div class="detail-row">
                <div class="detail-dot blue-dot"></div>
                <div>
                  <span class="detail-label">Total Emprestado</span>
                  <strong class="detail-value">MT {{ formatMoney(stats.valorEmprestado) }}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Health Score Card -->
        <div class="metric-card surface">
          <div class="metric-header">
            <div class="metric-icon-wrap purple">
              <ShieldCheck :size="18" />
            </div>
            <div>
              <h3 class="metric-title">Saúde da Carteira</h3>
              <p class="metric-subtitle">Indicadores de desempenho chave</p>
            </div>
          </div>

          <div class="health-items">
            <div class="health-item">
              <div class="health-item-header">
                <span class="health-label">
                  <Users :size="14" />
                  Clientes Totais
                </span>
                <strong>{{ stats.totalClientes }}</strong>
              </div>
              <div class="health-bar-track">
                <div class="health-bar blue-fill" :style="{ width: '100%' }"></div>
              </div>
            </div>

            <div class="health-item">
              <div class="health-item-header">
                <span class="health-label">
                  <Activity :size="14" />
                  Empréstimos Ativos
                </span>
                <strong>{{ stats.totalEmprestimosAtivos }}</strong>
              </div>
              <div class="health-bar-track">
                <div class="health-bar orange-fill" :style="{ width: activeRatio + '%' }"></div>
              </div>
            </div>

            <div class="health-item">
              <div class="health-item-header">
                <span class="health-label">
                  <TrendingUp :size="14" />
                  Taxa de Recuperação
                </span>
                <strong :class="getRecoveryPercentage() >= 70 ? 'text-success' : 'text-danger'">
                  {{ getRecoveryPercentage() }}%
                </strong>
              </div>
              <div class="health-bar-track">
                <div
                  class="health-bar"
                  :class="getRecoveryPercentage() >= 70 ? 'green-fill' : 'red-fill'"
                  :style="{ width: getRecoveryPercentage() + '%' }"
                ></div>
              </div>
            </div>

            <div class="score-footer">
              <div class="score-badge" :class="getHealthClass()">
                <ShieldCheck :size="16" />
                {{ getHealthLabel() }}
              </div>
              <p class="score-desc">{{ getHealthDescription() }}</p>
            </div>
          </div>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import {
  BarChart2, Users, Activity, Wallet, CreditCard,
  TrendingUp, TrendingDown, Percent, RefreshCw,
  ShieldCheck
} from '@lucide/vue';
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

const activeRatio = computed(() => {
  if (!stats.value.totalClientes) return 0;
  return Math.min(Math.round((stats.value.totalEmprestimosAtivos / stats.value.totalClientes) * 100), 100);
});

const getHealthClass = () => {
  const r = getRecoveryPercentage();
  if (r >= 80) return 'score-excellent';
  if (r >= 60) return 'score-good';
  if (r >= 40) return 'score-warning';
  return 'score-danger';
};

const getHealthLabel = () => {
  const r = getRecoveryPercentage();
  if (r >= 80) return 'Carteira Excelente';
  if (r >= 60) return 'Carteira Saudável';
  if (r >= 40) return 'Atenção Necessária';
  return 'Risco Elevado';
};

const getHealthDescription = () => {
  const r = getRecoveryPercentage();
  if (r >= 80) return 'A sua carteira tem uma performance excelente com alto índice de recuperação.';
  if (r >= 60) return 'A carteira está em bom estado. Continue a monitorizar os pagamentos pendentes.';
  if (r >= 40) return 'Há algum risco na carteira. Recomenda-se acompanhamento intensivo dos devedores.';
  return 'Carteira em risco elevado. Tome medidas urgentes para recuperar os créditos em atraso.';
};

onMounted(() => loadStats());
</script>

<style scoped>
.estatisticas-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* ── Page Header ── */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.page-header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-header-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #F59E0B, #EF4444);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.page-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-main);
  margin: 0;
}

.page-subtitle {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin: 4px 0 0;
}

.header-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #F0FDF4;
  border: 1px solid #BBF7D0;
  color: #16A34A;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 8px 14px;
  border-radius: 20px;
  white-space: nowrap;
}

/* ── Loading ── */
.loading-state {
  padding: 80px 24px;
  border-radius: 16px;
  text-align: center;
}

/* ── KPI Grid ── */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.kpi-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 18px;
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
  overflow: hidden;
}
.kpi-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px -8px rgba(0,0,0,0.12); }

.kpi-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.kpi-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.kpi-icon.blue   { background: #EFF6FF; color: #3B82F6; }
.kpi-icon.orange { background: #FFF7ED; color: #F97316; }
.kpi-icon.green  { background: #F0FDF4; color: #10B981; }
.kpi-icon.red    { background: #FEF2F2; color: #EF4444; }

.kpi-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 20px;
}
.kpi-trend.neutral      { background: #F3F4F6; color: #6B7280; }
.kpi-trend.orange-trend { background: #FFF7ED; color: #EA580C; }
.kpi-trend.green-trend  { background: #F0FDF4; color: #16A34A; }
.kpi-trend.red-trend    { background: #FEF2F2; color: #DC2626; }

.kpi-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-main);
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.kpi-value.success { color: #10B981; }
.kpi-value.danger  { color: #EF4444; }

.kpi-label {
  font-size: 0.8rem;
  color: var(--text-muted);
  font-weight: 500;
}

/* Progress bar bottom of each kpi card */
.kpi-bar {
  height: 3px;
  border-radius: 3px;
  margin-top: 8px;
  transition: width 1.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.blue-bar   { background: linear-gradient(90deg, #93C5FD, #3B82F6); }
.orange-bar { background: linear-gradient(90deg, #FCD34D, #F97316); }
.green-bar  { background: linear-gradient(90deg, #6EE7B7, #10B981); }
.red-bar    { background: linear-gradient(90deg, #FCA5A5, #EF4444); }

/* ── Metrics Grid ── */
.metrics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.metric-card {
  border-radius: 18px;
  border: 1px solid var(--border-color);
  padding: 28px;
}

.metric-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
}

.metric-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #10B981, #34D399);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.metric-icon-wrap.purple {
  background: linear-gradient(135deg, #8B5CF6, #A78BFA);
}

.metric-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-main);
  margin: 0 0 4px;
}
.metric-subtitle {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin: 0;
}

/* ── Recovery Card ── */
.recovery-display {
  display: flex;
  align-items: center;
  gap: 32px;
}

.recovery-circle {
  position: relative;
  width: 140px;
  height: 140px;
  flex-shrink: 0;
}

.circle-svg {
  width: 100%;
  height: 100%;
  transform: rotate(0deg);
}

.circle-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  line-height: 1.2;
}
.circle-center strong {
  display: block;
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--text-main);
}
.circle-center span {
  font-size: 0.7rem;
  color: var(--text-muted);
  font-weight: 500;
}

.recovery-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.detail-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
.green-dot { background: #10B981; }
.red-dot   { background: #EF4444; }
.blue-dot  { background: #3B82F6; }

.detail-label {
  display: block;
  font-size: 0.78rem;
  color: var(--text-muted);
  font-weight: 500;
  margin-bottom: 2px;
}
.detail-value {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-main);
}
.detail-value.success { color: #10B981; }
.detail-value.danger  { color: #EF4444; }

/* ── Health Card ── */
.health-items {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.health-item { display: flex; flex-direction: column; gap: 8px; }

.health-item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.health-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: var(--text-muted);
  font-weight: 500;
}

.health-bar-track {
  width: 100%;
  height: 8px;
  background: var(--border-color);
  border-radius: 4px;
  overflow: hidden;
}

.health-bar {
  height: 100%;
  border-radius: 4px;
  transition: width 1.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.blue-fill   { background: linear-gradient(90deg, #93C5FD, #3B82F6); }
.orange-fill { background: linear-gradient(90deg, #FCD34D, #F97316); }
.green-fill  { background: linear-gradient(90deg, #6EE7B7, #10B981); }
.red-fill    { background: linear-gradient(90deg, #FCA5A5, #EF4444); }

.text-success { color: #10B981; }
.text-danger  { color: #EF4444; }

/* Score badge */
.score-footer {
  margin-top: 8px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

.score-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.82rem;
  font-weight: 700;
  margin-bottom: 10px;
}
.score-excellent { background: #DCFCE7; color: #15803D; }
.score-good      { background: #DBEAFE; color: #1D4ED8; }
.score-warning   { background: #FEF9C3; color: #854D0E; }
.score-danger    { background: #FEE2E2; color: #B91C1C; }

.score-desc {
  font-size: 0.82rem;
  color: var(--text-muted);
  line-height: 1.5;
  margin: 0;
}

@media (max-width: 1024px) {
  .kpi-grid { grid-template-columns: repeat(2, 1fr); }
  .metrics-grid { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .kpi-grid { grid-template-columns: 1fr 1fr; }
  .page-header { flex-direction: column; align-items: flex-start; }
  .recovery-display { flex-direction: column; align-items: center; }
}
@media (max-width: 400px) {
  .kpi-grid { grid-template-columns: 1fr; }
}
</style>
