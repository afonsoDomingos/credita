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
                  <div class="flex items-center gap-2 justify-end">
                    <a :href="gerarLinkWhatsApp(loan)" target="_blank" class="btn-sm btn-outline-green flex items-center gap-1" title="Cobrar via WhatsApp">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                      WhatsApp
                    </a>
                    <a :href="`tel:${loan.client?.phone}`" class="btn-sm btn-outline-red flex items-center gap-1">
                      <Phone :size="14" /> Ligar
                    </a>
                  </div>
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
                  <div class="flex items-center gap-2 justify-end">
                    <a :href="gerarLinkWhatsApp(loan)" target="_blank" class="btn-sm btn-outline-green flex items-center gap-1" title="Lembrete WhatsApp">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                      Lembrar
                    </a>
                    <router-link to="/app/pagamentos" class="text-blue-600 text-sm hover:underline">Registar</router-link>
                  </div>
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

const gerarLinkWhatsApp = (loan) => {
  const nome = loan.client?.name || 'Cliente';
  const phone = (loan.client?.phone || '').replace(/[^0-9]/g, '');
  const valor = loan.amount.toLocaleString();
  const vencimento = formatDate(loan.dueDate);
  
  const mensagem = encodeURIComponent(
    `Olá ${nome}, ` +
    `a sua prestação de MT ${valor} vence em ${vencimento}. ` +
    `Por favor, regularize o pagamento o mais breve possível. Obrigado!`
  );
  
  // Se o telefone começa com 8 (Moçambique), adiciona o código 258
  const phoneFormatted = phone.startsWith('258') ? phone : `258${phone}`;
  return `https://wa.me/${phoneFormatted}?text=${mensagem}`;
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

.btn-outline-green {
  border: 1px solid #25D366;
  color: #25D366;
  background: transparent;
  text-decoration: none;
}
.btn-outline-green:hover {
  background-color: #F0FFF4;
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
