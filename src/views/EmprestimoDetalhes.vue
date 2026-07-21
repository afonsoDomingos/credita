<template>
  <div class="emprestimo-detalhes-page">
    <!-- Header Navigation & Actions -->
    <div class="header-actions flex justify-between items-center mb-6 flex-wrap gap-4">
      <div class="flex items-center gap-4">
        <button class="back-btn flex items-center justify-center" @click="$router.push('/app/emprestimos')" title="Voltar aos Empréstimos">
          <ArrowLeft :size="20" />
        </button>
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-2xl font-bold text-main">Detalhes do Empréstimo</h1>
            <span v-if="loan" class="status-pill" :class="statusBadgeClass">
              {{ statusLabel }}
            </span>
          </div>
          <p class="text-muted text-sm mt-0.5">Histórico completo, progresso e situação financeira.</p>
        </div>
      </div>

      <div v-if="loan" class="flex items-center gap-3 flex-wrap">
        <a v-if="valorEmDivida > 0 && loan.client?.phone" :href="gerarLinkWhatsApp(loan)" target="_blank" class="btn-whatsapp flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
          Cobrar no WhatsApp
        </a>
        <button v-if="valorEmDivida > 0" class="btn-primary flex items-center gap-2" @click="$router.push('/app/pagamentos')">
          <Plus :size="16" /> Registar Pagamento
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="surface loader-card p-12 text-center rounded-2xl shadow-sm">
      <Spinner message="A carregar dados do empréstimo..." />
    </div>

    <!-- Content State -->
    <div v-else-if="loan" class="loan-content space-y-6">
      <!-- Grid de Cards de Resumo -->
      <div class="stats-grid-cards">
        <!-- Card 1: Cliente -->
        <div class="surface premium-card">
          <div class="flex items-start justify-between">
            <div>
              <span class="card-label">Cliente</span>
              <router-link :to="`/app/clientes/${loan.client?._id}`" class="text-lg font-bold text-main hover:text-blue-600 block mt-1 transition-colors">
                {{ loan.client?.name || 'Desconhecido' }}
              </router-link>
              <p class="text-xs text-muted mt-1 flex items-center gap-1">
                <span>📱 {{ loan.client?.phone || 'Sem telefone' }}</span>
                <span v-if="loan.client?.idCard">• BI: {{ loan.client.idCard }}</span>
              </p>
            </div>
            <div class="card-icon bg-blue-50 text-blue-600">
              <User :size="22" />
            </div>
          </div>
        </div>
        
        <!-- Card 2: Total a Receber -->
        <div class="surface premium-card">
          <div class="flex items-start justify-between">
            <div>
              <span class="card-label">Total Esperado</span>
              <h3 class="text-2xl font-black text-blue-600 mt-1">MT {{ totalEsperado.toLocaleString() }}</h3>
              <p class="text-xs text-muted mt-1">
                Capital: <strong class="text-main">MT {{ loan.amount.toLocaleString() }}</strong> + Juro: <strong class="text-main">{{ loan.interestRate }}%</strong>
              </p>
            </div>
            <div class="card-icon bg-emerald-50 text-emerald-600">
              <Banknote :size="22" />
            </div>
          </div>
        </div>

        <!-- Card 3: Em Dívida / Vencimento -->
        <div class="surface premium-card" :class="valorEmDivida > 0 ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-green-500'">
          <div class="flex items-start justify-between">
            <div>
              <span class="card-label">Saldo em Dívida</span>
              <h3 class="text-2xl font-black mt-1" :class="valorEmDivida > 0 ? 'text-red-600' : 'text-green-600'">
                MT {{ valorEmDivida.toLocaleString() }}
              </h3>
              <p class="text-xs text-muted mt-1 flex items-center gap-1">
                <Calendar :size="12" /> Vencimento: <strong class="text-main">{{ new Date(loan.dueDate).toLocaleDateString('pt-PT') }}</strong>
              </p>
            </div>
            <div class="card-icon" :class="valorEmDivida > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'">
              <AlertCircle v-if="valorEmDivida > 0" :size="22" />
              <CheckCircle2 v-else :size="22" />
            </div>
          </div>
        </div>
      </div>

      <!-- Barra de Progresso Interativa -->
      <div class="surface progress-card p-6 rounded-2xl shadow-sm border">
        <div class="flex justify-between items-center mb-3">
          <div>
            <h3 class="font-bold text-base text-main">Progresso de Amortização</h3>
            <p class="text-xs text-muted mt-0.5">Acompanhamento em tempo real das parcelas liquidadas</p>
          </div>
          <div class="text-right">
            <span class="text-2xl font-extrabold" :class="percentagemPaga === 100 ? 'text-green-600' : 'text-blue-600'">
              {{ percentagemPaga }}%
            </span>
          </div>
        </div>

        <div class="progress-track-lg">
          <div 
            class="progress-fill-lg" 
            :class="percentagemPaga === 100 ? 'bg-gradient-green' : 'bg-gradient-blue'" 
            :style="{ width: percentagemPaga + '%' }"
          ></div>
        </div>

        <div class="flex justify-between items-center mt-3 text-xs">
          <span class="font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
            Recebido: <strong>MT {{ totalPago.toLocaleString() }}</strong>
          </span>
          <span class="font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
            Falta Amortizar: <strong>MT {{ valorEmDivida.toLocaleString() }}</strong>
          </span>
        </div>
      </div>

      <!-- Histórico de Pagamentos -->
      <div class="surface rounded-2xl shadow-sm border overflow-hidden">
        <div class="p-5 border-b flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 class="font-bold text-base text-main">Histórico de Pagamentos</h3>
            <p class="text-xs text-muted mt-0.5">Recibos e amortizações efetuadas neste empréstimo</p>
          </div>
          <span class="badge-count-pill" v-if="loan.payments && loan.payments.length > 0">
            {{ loan.payments.length }} {{ loan.payments.length === 1 ? 'pagamento' : 'pagamentos' }}
          </span>
        </div>
        
        <div v-if="loan.payments && loan.payments.length > 0" class="overflow-x-auto">
          <table class="data-table">
            <thead>
              <tr>
                <th>Data do Pagamento</th>
                <th>Valor Pago</th>
                <th>Método de Pagamento</th>
                <th class="text-right">Ação</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="pay in loan.payments" :key="pay._id" class="table-row">
                <td class="font-medium text-slate-700">
                  {{ new Date(pay.paymentDate).toLocaleDateString('pt-PT') }}
                </td>
                <td class="font-bold text-green-600 text-base">
                  MT {{ pay.amountPaid.toLocaleString() }}
                </td>
                <td>
                  <span class="method-badge">
                    {{ traduzirMetodo(pay.paymentMethod) }}
                  </span>
                </td>
                <td class="text-right">
                  <button class="btn-recibo flex items-center gap-1.5 ml-auto" @click="imprimirRecibo(pay._id)">
                    <Printer :size="14" />
                    <span>Ver Recibo</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Estado Vazio Lindo -->
        <div v-else class="empty-payments p-10 text-center flex flex-col items-center justify-center">
          <div class="empty-icon-box mb-3 bg-slate-100 text-slate-400 p-4 rounded-full">
            <Receipt :size="36" />
          </div>
          <h4 class="font-bold text-slate-800 text-base">Nenhum Pagamento Registado</h4>
          <p class="text-muted text-xs max-w-sm mt-1 mb-4">
            Ainda não foi efetuada nenhuma amortização para este empréstimo. Assim que o cliente pagar, registe aqui.
          </p>
          <button class="btn-primary text-xs flex items-center gap-2" @click="$router.push('/app/pagamentos')">
            <Plus :size="14" /> Registar Primeiro Pagamento
          </button>
        </div>
      </div>
    </div>
    
    <!-- State de Erro -->
    <div v-else class="surface p-12 text-center text-red-600 rounded-2xl shadow-sm border border-red-100">
      <AlertCircle :size="40" class="mx-auto mb-2 text-red-500" />
      <h3 class="font-bold text-lg">Empréstimo não encontrado</h3>
      <p class="text-xs text-muted mt-1 mb-4">O registo procurado não existe ou foi removido.</p>
      <button class="btn-secondary text-xs" @click="$router.push('/app/emprestimos')">Voltar à lista</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { 
  ArrowLeft, User, Banknote, Calendar, AlertCircle, 
  CheckCircle2, Printer, Plus, Receipt
} from '@lucide/vue';
import Spinner from '../components/Spinner.vue';
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

const statusLabel = computed(() => {
  if (!loan.value) return '';
  if (loan.value.status === 'paid' || valorEmDivida.value === 0) return 'Pago Concluído';
  const due = new Date(loan.value.dueDate);
  if (due < new Date()) return 'Em Atraso';
  return 'Em Curso';
});

const statusBadgeClass = computed(() => {
  if (!loan.value) return '';
  if (loan.value.status === 'paid' || valorEmDivida.value === 0) return 'pill-green';
  const due = new Date(loan.value.dueDate);
  if (due < new Date()) return 'pill-red';
  return 'pill-blue';
});

const gerarLinkWhatsApp = (loan) => {
  const nome = loan.client?.name || 'Cliente';
  const phone = (loan.client?.phone || '').replace(/[^0-9]/g, '');
  const valor = valorEmDivida.value.toLocaleString();
  const vencimento = new Date(loan.dueDate).toLocaleDateString('pt-PT');
  
  const mensagem = encodeURIComponent(
    `Olá ${nome}, ` +
    `lembramos que tem um valor pendente de MT ${valor} com vencimento a ${vencimento}. ` +
    `Por favor, efetue a regularização. Obrigado!`
  );
  
  const phoneFormatted = phone.startsWith('258') ? phone : `258${phone}`;
  return `https://wa.me/${phoneFormatted}?text=${mensagem}`;
};

onMounted(() => {
  loadLoanDetails();
});
</script>

<style scoped>
.emprestimo-detalhes-page {
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

.status-pill {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.pill-blue { background-color: #DBEAFE; color: #1D4ED8; }
.pill-green { background-color: #DCFCE7; color: #15803D; }
.pill-red { background-color: #FEE2E2; color: #B91C1C; }

.btn-whatsapp {
  background-color: #25D366;
  color: white;
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 0.875rem;
  text-decoration: none;
  transition: background-color 0.2s ease;
}
.btn-whatsapp:hover { background-color: #1EBE5D; }

.btn-primary {
  background-color: var(--primary-color);
  color: white;
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 0.875rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.btn-primary:hover { background-color: var(--primary-hover); }

.btn-secondary {
  background-color: #F3F4F6;
  color: #374151;
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 0.875rem;
  border: 1px solid #E5E7EB;
  cursor: pointer;
}

.stats-grid-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.premium-card {
  padding: 24px;
  border-radius: 16px;
  border: 1px solid var(--border-color);
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.premium-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
}

.card-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-muted);
}

.card-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.progress-track-lg {
  width: 100%;
  height: 14px;
  background-color: #E2E8F0;
  border-radius: 20px;
  overflow: hidden;
  padding: 2px;
}

.progress-fill-lg {
  height: 100%;
  border-radius: 20px;
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.bg-gradient-blue {
  background: linear-gradient(90deg, #3B82F6 0%, #2563EB 100%);
}

.bg-gradient-green {
  background: linear-gradient(90deg, #10B981 0%, #059669 100%);
}

.badge-count-pill {
  background-color: #EFF6FF;
  color: #2563EB;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 20px;
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

.method-badge {
  background-color: #F1F5F9;
  color: #475569;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 8px;
  text-transform: capitalize;
}

.btn-recibo {
  background-color: #F0FDFA;
  color: #0D9488;
  border: 1px solid #CCFBF1;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-recibo:hover {
  background-color: #CCFBF1;
  color: #0F766E;
}

@media (max-width: 768px) {
  .stats-grid-cards {
    grid-template-columns: 1fr;
  }
}
</style>
