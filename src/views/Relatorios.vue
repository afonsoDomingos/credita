<template>
  <div class="relatorios-page">

    <!-- Page Header -->
    <div class="page-header">
      <div class="page-header-left">
        <div class="page-header-icon">
          <FileBarChart :size="22" />
        </div>
        <div>
          <h1 class="page-title">Relatório de Empréstimos</h1>
          <p class="page-subtitle">Listagem completa e detalhada da carteira de crédito.</p>
        </div>
      </div>
      <div class="header-actions no-print">
        <button class="btn-export" @click="exportarCSV" :disabled="loading || loans.length === 0">
          <Download :size="16" />
          Exportar CSV
        </button>
        <button class="btn-print" @click="imprimirRelatorio" :disabled="loading">
          <Printer :size="16" />
          Imprimir
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading-state surface">
      <Spinner message="A gerar relatório..." />
    </div>

    <div v-else>
      <!-- KPI Summary Cards -->
      <div class="kpi-grid no-print">
        <div class="kpi-card blue">
          <div class="kpi-icon">
            <CreditCard :size="20" />
          </div>
          <div class="kpi-info">
            <span class="kpi-label">Total Empréstimos</span>
            <strong class="kpi-value">{{ loans.length }}</strong>
          </div>
        </div>
        <div class="kpi-card red">
          <div class="kpi-icon">
            <TrendingDown :size="20" />
          </div>
          <div class="kpi-info">
            <span class="kpi-label">Capital Emprestado</span>
            <strong class="kpi-value">MT {{ formatMoney(somaCapital) }}</strong>
          </div>
        </div>
        <div class="kpi-card green">
          <div class="kpi-icon">
            <TrendingUp :size="20" />
          </div>
          <div class="kpi-info">
            <span class="kpi-label">Retorno Esperado</span>
            <strong class="kpi-value">MT {{ formatMoney(somaRetorno) }}</strong>
          </div>
        </div>
        <div class="kpi-card purple">
          <div class="kpi-icon">
            <Percent :size="20" />
          </div>
          <div class="kpi-info">
            <span class="kpi-label">Lucro Esperado</span>
            <strong class="kpi-value">MT {{ formatMoney(somaRetorno - somaCapital) }}</strong>
          </div>
        </div>
      </div>

      <!-- Filters + Table Card -->
      <div class="table-card surface">

        <!-- Toolbar -->
        <div class="table-toolbar no-print">
          <div class="toolbar-info">
            <span class="count-badge">{{ loansFiltrados.length }} empréstimos</span>
          </div>
          <div class="toolbar-filters">
            <div class="search-wrapper">
              <Search :size="15" class="search-icon" />
              <input
                type="text"
                v-model="filtroTexto"
                placeholder="Pesquisar cliente..."
                class="search-input"
              />
            </div>
            <select v-model="filtroStatus" class="status-select">
              <option value="">Todos os estados</option>
              <option value="pending">Pendente</option>
              <option value="active">Ativo</option>
              <option value="paid">Pago</option>
              <option value="defaulted">Em Falha</option>
            </select>
          </div>
        </div>

        <!-- Table -->
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Data Início</th>
                <th>Cliente</th>
                <th>Capital</th>
                <th>Juro</th>
                <th>Retorno Total</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="loan in loansFiltrados" :key="loan._id" class="table-row">
                <td class="date-cell">
                  <div class="date-wrapper">
                    <Calendar :size="13" class="date-icon" />
                    {{ formatDate(loan.startDate) }}
                  </div>
                </td>
                <td>
                  <div class="client-cell">
                    <div class="client-avatar">{{ getInitials(loan.client?.name) }}</div>
                    <span class="client-name">{{ loan.client?.name || 'Cliente Removido' }}</span>
                  </div>
                </td>
                <td class="mono text-danger">MT {{ formatMoney(loan.amount) }}</td>
                <td>
                  <span class="interest-badge">{{ loan.interestRate }}%</span>
                </td>
                <td class="mono font-bold text-success">MT {{ formatMoney(calcularTotal(loan)) }}</td>
                <td>
                  <span class="status-badge" :class="getStatusClass(loan.status)">
                    {{ getStatusLabel(loan.status) }}
                  </span>
                </td>
              </tr>

              <tr v-if="loansFiltrados.length === 0">
                <td colspan="6" class="empty-row">
                  <div class="empty-inline">
                    <FileBarChart :size="32" />
                    <span>Nenhum empréstimo encontrado com os filtros aplicados.</span>
                  </div>
                </td>
              </tr>
            </tbody>

            <!-- Totals Footer -->
            <tfoot v-if="loansFiltrados.length > 0">
              <tr class="tfoot-row">
                <td colspan="2" class="tfoot-label">
                  <BarChart2 :size="14" />
                  TOTAIS DA CARTEIRA FILTRADA
                </td>
                <td class="mono font-bold text-danger">MT {{ formatMoney(somaCapitalFiltrado) }}</td>
                <td></td>
                <td class="mono font-bold text-success">MT {{ formatMoney(somaRetornoFiltrado) }}</td>
                <td>
                  <span class="profit-chip">
                    +MT {{ formatMoney(somaRetornoFiltrado - somaCapitalFiltrado) }}
                  </span>
                </td>
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
import {
  FileBarChart, Download, Printer, CreditCard,
  TrendingUp, TrendingDown, Percent, Search,
  Calendar, BarChart2
} from '@lucide/vue';
import Spinner from '../components/Spinner.vue';
import api from '../api';

const loans = ref([]);
const loading = ref(true);
const filtroTexto = ref('');
const filtroStatus = ref('');

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

const loansFiltrados = computed(() => {
  return loans.value.filter(loan => {
    const matchTexto = !filtroTexto.value ||
      (loan.client?.name || '').toLowerCase().includes(filtroTexto.value.toLowerCase());
    const matchStatus = !filtroStatus.value || loan.status === filtroStatus.value;
    return matchTexto && matchStatus;
  });
});

const formatDate = (dateString) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('pt-PT');
};

const formatMoney = (value) => {
  return Number(value || 0).toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const calcularTotal = (loan) => {
  return loan.amount + (loan.amount * (loan.interestRate / 100));
};

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const getStatusLabel = (status) => {
  const labels = { 'pending': 'Pendente', 'active': 'Ativo', 'paid': 'Pago', 'defaulted': 'Em Falha' };
  return labels[status] || status;
};

const getStatusClass = (status) => {
  const classes = {
    'pending': 'status-pending',
    'active': 'status-active',
    'paid': 'status-paid',
    'defaulted': 'status-defaulted'
  };
  return classes[status] || '';
};

const somaCapital = computed(() => loans.value.reduce((acc, l) => acc + l.amount, 0));
const somaRetorno = computed(() => loans.value.reduce((acc, l) => acc + calcularTotal(l), 0));
const somaCapitalFiltrado = computed(() => loansFiltrados.value.reduce((acc, l) => acc + l.amount, 0));
const somaRetornoFiltrado = computed(() => loansFiltrados.value.reduce((acc, l) => acc + calcularTotal(l), 0));

const imprimirRelatorio = () => window.print();

const exportarCSV = () => {
  if (loans.value.length === 0) return;
  const headers = ['Data Início', 'Cliente', 'BI/NIF', 'Capital (MT)', 'Juro (%)', 'Retorno (MT)', 'Estado'];
  const rows = loans.value.map(loan => [
    formatDate(loan.createdAt || loan.startDate),
    loan.client?.name || 'Cliente Removido',
    loan.client?.idCard || 'N/A',
    loan.amount.toFixed(2),
    loan.interestRate,
    calcularTotal(loan).toFixed(2),
    getStatusLabel(loan.status)
  ]);
  rows.push([]);
  rows.push(['', 'TOTAIS', '', somaCapital.value.toFixed(2), '', somaRetorno.value.toFixed(2), '']);
  const csvContent = '\uFEFF' + [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(';'))
    .join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `relatorio_emprestimos_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

onMounted(() => loadData());
</script>

<style scoped>
.relatorios-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ── Page Header ── */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.page-header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-header-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #0EA5E9, #3B82F6);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
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

.header-actions {
  display: flex;
  gap: 10px;
}

.btn-export, .btn-print {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 18px;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-export {
  background: linear-gradient(135deg, #10B981, #059669);
  color: white;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.25);
}
.btn-export:hover:not(:disabled) { filter: brightness(1.08); transform: translateY(-1px); }

.btn-print {
  background: var(--bg-surface);
  color: var(--text-main);
  border: 1px solid var(--border-color);
}
.btn-print:hover:not(:disabled) { background: var(--bg-body); }

.btn-export:disabled, .btn-print:disabled { opacity: 0.5; cursor: not-allowed; }

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
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.2s, box-shadow 0.2s;
}
.kpi-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px -8px rgba(0,0,0,0.1); }

.kpi-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.kpi-card.blue .kpi-icon { background: #EFF6FF; color: #3B82F6; }
.kpi-card.red .kpi-icon { background: #FEF2F2; color: #EF4444; }
.kpi-card.green .kpi-icon { background: #F0FDF4; color: #10B981; }
.kpi-card.purple .kpi-icon { background: #F5F3FF; color: #8B5CF6; }

.kpi-info { display: flex; flex-direction: column; gap: 4px; overflow: hidden; }
.kpi-label { font-size: 0.78rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.4px; }
.kpi-value { font-size: 1.05rem; font-weight: 800; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* ── Table Card ── */
.table-card {
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  padding: 0;
}

/* Toolbar */
.table-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
  gap: 16px;
  flex-wrap: wrap;
  background: var(--bg-body);
}

.count-badge {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-muted);
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  padding: 5px 12px;
  border-radius: 20px;
}

.toolbar-filters {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.search-wrapper {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
}

.search-input {
  padding: 8px 14px 8px 34px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.85rem;
  outline: none;
  background: var(--bg-surface);
  color: var(--text-main);
  width: 200px;
  transition: border-color 0.2s;
}
.search-input:focus { border-color: #3B82F6; }

.status-select {
  padding: 8px 14px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.85rem;
  outline: none;
  background: var(--bg-surface);
  color: var(--text-main);
  cursor: pointer;
}
.status-select:focus { border-color: #3B82F6; }

/* Table */
.table-wrapper { overflow-x: auto; }

.data-table { width: 100%; border-collapse: collapse; }

.data-table th {
  padding: 12px 20px;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-muted);
  background: var(--bg-body);
  border-bottom: 1px solid var(--border-color);
  white-space: nowrap;
}

.data-table td {
  padding: 14px 20px;
  border-bottom: 1px solid var(--border-color);
  font-size: 0.9rem;
  color: var(--text-main);
}

.table-row { transition: background 0.15s; }
.table-row:hover { background: var(--bg-body); }
.table-row:last-child td { border-bottom: none; }

/* Date cell */
.date-wrapper {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-muted);
  font-size: 0.875rem;
  white-space: nowrap;
}
.date-icon { flex-shrink: 0; }

/* Client cell */
.client-cell { display: flex; align-items: center; gap: 10px; }
.client-avatar {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, #3B82F6, #6366F1);
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.client-name { font-weight: 600; }

/* Badges */
.interest-badge {
  background: #FFF7ED;
  color: #C2410C;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 700;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
}
.status-pending { background: #FEF9C3; color: #854D0E; }
.status-active  { background: #DBEAFE; color: #1D4ED8; }
.status-paid    { background: #DCFCE7; color: #15803D; }
.status-defaulted { background: #FEE2E2; color: #B91C1C; }

/* Mono / Colors */
.mono { font-family: 'Courier New', monospace; font-weight: 600; }
.text-danger { color: #EF4444; }
.text-success { color: #10B981; }
.font-bold { font-weight: 700; }

/* Footer */
.tfoot-row td {
  background: var(--bg-body);
  border-top: 2px solid var(--border-color);
  padding: 14px 20px;
  font-size: 0.9rem;
}

.tfoot-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.profit-chip {
  background: #F0FDF4;
  color: #16A34A;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.78rem;
  font-weight: 700;
  white-space: nowrap;
}

/* Empty inline */
.empty-row { text-align: center; padding: 60px 20px !important; }
.empty-inline {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: var(--text-muted);
  font-size: 0.9rem;
}

/* ── Print ── */
@media print {
  .no-print { display: none !important; }
  body * { visibility: hidden; }
  .relatorios-page, .relatorios-page * { visibility: visible; }
  .relatorios-page { position: absolute; left: 0; top: 0; width: 100%; }
}

@media (max-width: 1024px) {
  .kpi-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
  .kpi-grid { grid-template-columns: 1fr; }
  .page-header { flex-direction: column; align-items: flex-start; }
  .table-toolbar { flex-direction: column; align-items: stretch; }
  .search-input { width: 100%; }
}
</style>
