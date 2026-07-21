<template>
  <div class="calendar-page">
    <div class="header-actions">
      <div>
        <h2 class="page-title">Cobranças & Calendário</h2>
        <p class="text-muted mt-1">Antecipe falhas e organize o fluxo de caixa diário.</p>
      </div>
    </div>

    <div v-if="loading" class="loader-wrapper">
      <Spinner message="A calcular calendário de cobranças..." />
    </div>

    <div v-else>
      <!-- Summary Cards -->
      <div class="stats-grid mb-8">
        <div class="stat-card surface shadow-sm border-l-4 border-red-500">
          <div class="stat-content">
            <h3 class="stat-title text-red-500">Em Atraso (Urgente)</h3>
            <p class="stat-value text-red-600">{{ atrasados.length }}</p>
            <p class="text-xs text-muted mt-2">Valor Total: <span class="font-bold">{{ formatCurrency(totalAtrasado) }}</span></p>
          </div>
          <div class="stat-icon-wrapper bg-red-100 text-red-600">
            <AlertCircle :size="32" />
          </div>
        </div>
        
        <div class="stat-card surface shadow-sm border-l-4 border-yellow-500">
          <div class="stat-content">
            <h3 class="stat-title text-yellow-600">Vencem Hoje</h3>
            <p class="stat-value text-yellow-600">{{ hoje.length }}</p>
            <p class="text-xs text-muted mt-2">Valor Esperado: <span class="font-bold">{{ formatCurrency(totalHoje) }}</span></p>
          </div>
          <div class="stat-icon-wrapper bg-yellow-100 text-yellow-600">
            <Clock :size="32" />
          </div>
        </div>
        
        <div class="stat-card surface shadow-sm border-l-4 border-blue-500">
          <div class="stat-content">
            <h3 class="stat-title text-blue-500">Próximos 7 Dias</h3>
            <p class="stat-value text-blue-600">{{ proximos.length }}</p>
            <p class="text-xs text-muted mt-2">Valor Previsto: <span class="font-bold">{{ formatCurrency(totalProximos) }}</span></p>
          </div>
          <div class="stat-icon-wrapper bg-blue-100 text-blue-600">
            <CalendarIcon :size="32" />
          </div>
        </div>
      </div>

      <!-- Detail Tables -->
      <div class="grid-layout">
        <!-- Atrasados -->
        <div class="surface p-0 overflow-hidden shadow-sm">
          <div class="p-4 bg-red-50 border-b border-red-100 flex items-center justify-between">
            <h3 class="font-bold text-red-700 flex items-center gap-2">
              <AlertCircle :size="18" /> Em Atraso
            </h3>
          </div>
          <div class="empty-state-mini" v-if="atrasados.length === 0">
            <div class="empty-icon-mini bg-red-50 text-red-300">
              <AlertCircle :size="32" />
            </div>
            <p class="text-muted text-sm mt-3">Nenhum empréstimo em atraso. Parabéns!</p>
          </div>
          <table class="data-table" v-else>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Em Falta</th>
                <th>Vencimento</th>
                <th class="text-right">Ação</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="loan in atrasados" :key="loan._id">
                <td class="font-medium">{{ loan.client?.name || 'Desconhecido' }}</td>
                <td class="text-red-600 font-bold">{{ formatCurrency(loan.amount) }}</td>
                <td class="text-red-500 text-sm">{{ formatDate(loan.dueDate) }}</td>
                <td class="text-right">
                  <a :href="`tel:${loan.client?.phone}`" class="btn-sm btn-outline-red flex items-center gap-1 ml-auto">
                    <Phone :size="14" /> Ligar
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Hoje -->
        <div class="surface p-0 overflow-hidden shadow-sm">
          <div class="p-4 bg-yellow-50 border-b border-yellow-100 flex items-center justify-between">
            <h3 class="font-bold text-yellow-700 flex items-center gap-2">
              <Clock :size="18" /> Vencem Hoje
            </h3>
          </div>
          <div class="empty-state-mini" v-if="hoje.length === 0">
            <div class="empty-icon-mini bg-yellow-50 text-yellow-300">
              <Clock :size="32" />
            </div>
            <p class="text-muted text-sm mt-3">Nenhuma cobrança para hoje.</p>
          </div>
          <table class="data-table" v-else>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Valor</th>
                <th class="text-right">Ação</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="loan in hoje" :key="loan._id">
                <td class="font-medium">{{ loan.client?.name || 'Desconhecido' }}</td>
                <td class="font-bold">{{ formatCurrency(loan.amount) }}</td>
                <td class="text-right">
                  <router-link to="/app/pagamentos" class="text-blue-600 text-sm hover:underline">Registar</router-link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Próximos 7 Dias -->
        <div class="surface p-0 overflow-hidden shadow-sm md-col-span-2">
          <div class="p-4 bg-blue-50 border-b border-blue-100 flex items-center justify-between">
            <h3 class="font-bold text-blue-700 flex items-center gap-2">
              <CalendarIcon :size="18" /> Próximos 7 Dias
            </h3>
          </div>
          <div class="empty-state-mini" v-if="proximos.length === 0">
            <div class="empty-icon-mini bg-blue-50 text-blue-300">
              <CalendarIcon :size="32" />
            </div>
            <p class="text-muted text-sm mt-3">Nenhuma cobrança planeada para a próxima semana.</p>
          </div>
          <table class="data-table" v-else>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Valor</th>
                <th>Data Prevista</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="loan in proximos" :key="loan._id">
                <td class="font-medium">{{ loan.client?.name || 'Desconhecido' }}</td>
                <td class="font-bold">{{ formatCurrency(loan.amount) }}</td>
                <td class="text-blue-600 text-sm">{{ formatDate(loan.dueDate) }}</td>
                <td>
                  <span class="badge-blue">Previsto</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { AlertCircle, Clock, Calendar as CalendarIcon, Phone } from '@lucide/vue';
import Spinner from '../components/Spinner.vue';
import api from '../api';

const loans = ref([]);
const loading = ref(true);

const loadLoans = async () => {
  try {
    const { data } = await api.get('/loans');
    loans.value = data;
  } catch (error) {
    console.error('Error loading loans', error);
  } finally {
    loading.value = false;
  }
};

const atrasados = computed(() => {
  const today = new Date();
  today.setHours(0,0,0,0);
  return loans.value.filter(loan => {
    if (loan.status === 'paid') return false;
    const due = new Date(loan.dueDate);
    return due < today;
  }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
});

const hoje = computed(() => {
  const today = new Date();
  today.setHours(0,0,0,0);
  return loans.value.filter(loan => {
    if (loan.status === 'paid') return false;
    const due = new Date(loan.dueDate);
    due.setHours(0,0,0,0);
    return due.getTime() === today.getTime();
  });
});

const proximos = computed(() => {
  const today = new Date();
  today.setHours(0,0,0,0);
  
  const in7Days = new Date(today);
  in7Days.setDate(in7Days.getDate() + 7);
  
  return loans.value.filter(loan => {
    if (loan.status === 'paid') return false;
    const due = new Date(loan.dueDate);
    due.setHours(0,0,0,0);
    return due > today && due <= in7Days;
  }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
});

const totalAtrasado = computed(() => atrasados.value.reduce((acc, curr) => acc + curr.amount, 0));
const totalHoje = computed(() => hoje.value.reduce((acc, curr) => acc + curr.amount, 0));
const totalProximos = computed(() => proximos.value.reduce((acc, curr) => acc + curr.amount, 0));

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(value);
};

const formatDate = (dateString) => {
  const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
  return new Date(dateString).toLocaleDateString('pt-PT', options);
};

onMounted(() => {
  loadLoans();
});
</script>

<style scoped>
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}
.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-main);
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}
.stat-card {
  padding: 24px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.stat-title {
  margin: 0 0 8px 0;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.stat-value {
  margin: 0;
  font-size: 2rem;
  font-weight: 800;
}
.stat-icon-wrapper {
  padding: 16px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.grid-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}
.md-col-span-2 {
  grid-column: span 2;
}
@media (max-width: 1024px) {
  .grid-layout {
    grid-template-columns: 1fr;
  }
  .md-col-span-2 {
    grid-column: span 1;
  }
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}
.data-table th, .data-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #f1f5f9;
}
.data-table th {
  font-size: 0.8rem;
  text-transform: uppercase;
  color: var(--text-muted);
  font-weight: 600;
  background-color: #fafafa;
}
.data-table tr:hover {
  background-color: #f8fafc;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
}
.btn-outline-red {
  border: 1px solid #EF4444;
  color: #EF4444;
  background: transparent;
}
.btn-outline-red:hover {
  background-color: #FEF2F2;
}

.badge-blue {
  background-color: #EFF6FF;
  color: #2563EB;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
}

.loader-wrapper {
  padding: 60px 0;
}

/* Mini Empty State for Dashboard Cards */
.empty-state-mini {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.empty-icon-mini {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
