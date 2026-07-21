<template>
  <div class="recibos-page">
    <div class="header-actions mb-6 no-print">
      <h1 class="text-xl font-bold">Emissão de Recibos</h1>
      <p class="text-muted text-sm">Gere e imprima recibos de pagamentos recebidos.</p>
    </div>

    <div class="surface p-0 overflow-hidden no-print">
      <div v-if="loading" class="loader-wrapper">
        <Spinner message="A carregar histórico de pagamentos..." />
      </div>
      
      <table class="data-table" v-else-if="payments.length > 0">
        <thead>
          <tr>
            <th>Data</th>
            <th>Cliente</th>
            <th>Método</th>
            <th>Valor Pago</th>
            <th class="text-right">Ação</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="pay in payments" :key="pay._id" class="table-row">
            <td class="text-xs text-muted">{{ formatDate(pay.paymentDate) }}</td>
            <td>
              <div class="client-cell flex items-center gap-3">
                <img 
                  v-if="pay.loan?.client?.profileImageUrl" 
                  :src="pay.loan?.client?.profileImageUrl" 
                  alt="Cliente" 
                  class="avatar-circle" 
                  style="object-fit: cover;"
                />
                <div v-else class="avatar-circle flex items-center justify-center font-bold bg-blue-100 text-blue-700">
                  {{ (pay.loan?.client?.name || 'C').charAt(0).toUpperCase() }}
                </div>
                <span class="font-bold text-gray-800">{{ pay.loan?.client?.name || 'Cliente Removido' }}</span>
              </div>
            </td>
            <td>
              <span class="payment-method-tag capitalize">{{ pay.paymentMethod }}</span>
            </td>
            <td class="font-bold text-green">MT {{ pay.amountPaid.toLocaleString('pt-PT', { minimumFractionDigits: 2 }) }}</td>
            <td class="text-right">
              <button class="btn-print-action inline-flex items-center gap-1 text-xs" @click="imprimirRecibo(pay)">
                <Printer :size="14" /> Imprimir Recibo
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div v-else class="empty-state-beautiful">
        <div class="empty-icon-wrapper">
          <Printer :size="48" class="text-muted" />
        </div>
        <h3>Nenhum Recibo Disponível</h3>
        <p>Ainda não existem pagamentos registados para gerar recibos. Os recibos aparecerão aqui automaticamente após o registo de pagamentos.</p>
      </div>
    </div>

    <!-- Print Template (Hidden by default, shown when printing) -->
    <div class="print-container" v-if="selectedPayment">
      <div class="receipt-card">
        <div class="receipt-header">
          <img v-if="company.logoUrl" :src="company.logoUrl" alt="Logo" class="print-logo" />
          <div v-else class="print-logo-fallback">{{ company.name?.charAt(0) }}</div>
          <h2>{{ company.name }}</h2>
          <p class="company-sub">NIF: {{ company.nif || 'N/A' }} | Tel: {{ company.phone || 'N/A' }}</p>
        </div>
        
        <div class="receipt-title">
          <h3>RECIBO DE PAGAMENTO</h3>
          <p class="receipt-date">{{ formatDate(selectedPayment.paymentDate) }}</p>
        </div>
        
        <div class="receipt-body">
          <div class="receipt-row">
            <span class="label">Recebemos de:</span>
            <span class="value">{{ selectedPayment.loan?.client?.name || 'N/A' }}</span>
          </div>
          <div class="receipt-row">
            <span class="label">A quantia de:</span>
            <span class="value font-bold text-lg">MT {{ selectedPayment.amountPaid.toLocaleString('pt-PT', { minimumFractionDigits: 2 }) }}</span>
          </div>
          <div class="receipt-row">
            <span class="label">Referente a:</span>
            <span class="value">Pagamento de Empréstimo</span>
          </div>
          <div class="receipt-row">
            <span class="label">Método:</span>
            <span class="value capitalize">{{ selectedPayment.paymentMethod }}</span>
          </div>
        </div>
        
        <div class="receipt-footer">
          <div class="signature-line">
            <p>Assinatura</p>
          </div>
          <p class="thank-you">Obrigado pela preferência!</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Printer } from '@lucide/vue';
import Spinner from '../components/Spinner.vue';
import api from '../api';

const payments = ref([]);
const loading = ref(true);
const company = ref({});
const selectedPayment = ref(null);

const loadData = async () => {
  try {
    const [payRes, compRes] = await Promise.all([
      api.get('/payments'),
      api.get('/company/settings')
    ]);
    payments.value = payRes.data;
    company.value = compRes.data;
  } catch (error) {
    console.error('Error loading data', error);
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('pt-PT');
};

const imprimirRecibo = (pay) => {
  selectedPayment.value = pay;
  
  // Need to wait for Vue to render the print container before calling window.print()
  setTimeout(() => {
    window.print();
    // Clear selection after printing so it hides again
    setTimeout(() => {
      selectedPayment.value = null;
    }, 1000);
  }, 100);
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th, .data-table td {
  padding: 16px 20px;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
  vertical-align: middle;
}

.data-table th {
  background-color: var(--bg-body);
  color: var(--text-muted);
  font-weight: 650;
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.avatar-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 0.85rem;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-color);
}

.payment-method-tag {
  background-color: #F1F5F9;
  color: #475569;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.78rem;
  font-weight: 650;
}

.btn-print-action {
  background: white;
  border: 1px solid var(--border-color);
  color: var(--text-main);
  font-weight: 600;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 8px;
  transition: all 0.2s;
}
.btn-print-action:hover {
  background: var(--bg-body);
  color: var(--primary-color);
  border-color: var(--primary-color);
}

.text-right {
  text-align: right;
}

.capitalize { text-transform: capitalize; }
.text-green { color: #16A34A; }

/* Beautiful Empty State */
.empty-state-beautiful {
  padding: 60px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.empty-icon-wrapper {
  width: 96px;
  height: 96px;
  background-color: var(--bg-body);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  color: var(--text-muted);
}

.empty-state-beautiful h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-main);
  margin: 0 0 8px 0;
}

.empty-state-beautiful p {
  color: var(--text-muted);
  max-width: 400px;
  margin: 0;
  line-height: 1.5;
}

/* Print styling */
.print-container {
  display: none;
}

@media print {
  body {
    background-color: white;
  }
  
  body * {
    visibility: hidden;
  }
  
  .print-container, .print-container * {
    visibility: visible !important;
  }
  
  .print-container {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    display: flex;
    justify-content: center;
  }
  
  .receipt-card {
    width: 100%;
    max-width: 600px;
    border: 2px solid #000;
    padding: 40px;
    background: #fff;
    margin-top: 20px;
  }
  
  .receipt-header {
    text-align: center;
    border-bottom: 2px dashed #ccc;
    padding-bottom: 20px;
    margin-bottom: 20px;
  }
  
  .print-logo {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    object-fit: cover;
    margin-bottom: 10px;
  }

  .print-logo-fallback {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background-color: #EFF6FF;
    color: #1D4ED8;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    font-weight: 800;
    margin: 0 auto 10px;
    border: 2px solid #BFDBFE;
  }
  
  .receipt-header h2 { margin: 0; font-size: 24px; }
  .receipt-header p { margin: 5px 0 0; color: #555; font-size: 14px; }
  
  .receipt-title {
    text-align: center;
    margin-bottom: 30px;
  }
  
  .receipt-title h3 { margin: 0; font-size: 20px; text-decoration: underline; }
  .receipt-title p { margin: 5px 0 0; color: #555; }
  
  .receipt-row {
    display: flex;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px solid #eee;
  }
  
  .receipt-row .label { font-weight: bold; color: #555; }
  
  .receipt-footer {
    margin-top: 50px;
    text-align: center;
  }
  
  .signature-line {
    width: 200px;
    border-top: 1px solid #000;
    margin: 0 auto;
    padding-top: 5px;
  }
  
  .thank-you {
    margin-top: 30px;
    font-style: italic;
    color: #555;
  }
}
</style>
