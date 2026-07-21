<template>
  <div class="recibo-print">
    <div v-if="loading" class="text-center p-8">A carregar recibo...</div>
    
    <div v-else-if="payment" class="recibo-container">
      <div class="header">
        <h1 class="logo">Credita</h1>
        <p class="subtitle">Comprovativo de Pagamento</p>
      </div>
      
      <div class="recibo-details">
        <div class="detail-row">
          <span class="label">Data do Pagamento:</span>
          <span class="value">{{ new Date(payment.paymentDate).toLocaleString('pt-PT') }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Recibo Nº:</span>
          <span class="value">#{{ payment._id.slice(-6).toUpperCase() }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Cliente:</span>
          <span class="value">{{ payment.loan?.client?.name }}</span>
        </div>
        <div class="detail-row">
          <span class="label">NIF / BI:</span>
          <span class="value">{{ payment.loan?.client?.idCard || 'N/A' }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Referência do Empréstimo:</span>
          <span class="value">EMP-{{ payment.loan?._id.slice(-6).toUpperCase() }} (MT {{ payment.loan?.amount.toLocaleString() }})</span>
        </div>
      </div>
      
      <div class="amount-box">
        <span class="amount-label">Valor Pago</span>
        <h2 class="amount-value">MT {{ payment.amountPaid.toLocaleString() }}</h2>
        <p class="method">Método: {{ traduzirMetodo(payment.paymentMethod) }}</p>
      </div>
      
      <div class="footer">
        <p>Este documento serve como comprovativo do pagamento supracitado.</p>
        <p class="date-printed">Impresso em {{ new Date().toLocaleString('pt-PT') }}</p>
      </div>
    </div>
    
    <div v-else class="text-center p-8 text-red">
      Recibo não encontrado.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '../api';

const route = useRoute();
const payment = ref(null);
const loading = ref(true);

const loadPaymentDetails = async () => {
  try {
    const { data } = await api.get(`/payments/${route.params.id}`);
    payment.value = data;
    
    // Dispara a impressão automaticamente assim que carregar
    setTimeout(() => {
      window.print();
    }, 500);
  } catch (error) {
    console.error('Erro ao buscar pagamento:', error);
  } finally {
    loading.value = false;
  }
};

const traduzirMetodo = (metodo) => {
  const map = { 'cash': 'Numerário', 'transfer': 'Transferência', 'card': 'Cartão' };
  return map[metodo] || metodo;
};

onMounted(() => {
  // Hide all other UI elements by applying a global class or just using @media print
  document.body.classList.add('print-mode');
  loadPaymentDetails();
});
</script>

<style>
/* Global style just for this page to ensure no background colors mess up print */
body.print-mode {
  background-color: white !important;
}
</style>

<style scoped>
.recibo-print {
  background-color: white;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  padding: 40px 20px;
  color: #111827;
}

.recibo-container {
  width: 100%;
  max-width: 600px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 40px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.header {
  text-align: center;
  margin-bottom: 40px;
  border-bottom: 2px solid #E5E7EB;
  padding-bottom: 20px;
}

.logo {
  font-size: 2rem;
  font-weight: 800;
  color: #2563EB;
  margin: 0 0 8px 0;
}

.subtitle {
  font-size: 1.1rem;
  color: #6B7280;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.recibo-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 40px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px dashed #E5E7EB;
  padding-bottom: 8px;
}

.label {
  font-weight: 600;
  color: #4B5563;
}

.value {
  font-weight: 500;
  text-align: right;
}

.amount-box {
  background-color: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  margin-bottom: 40px;
}

.amount-label {
  display: block;
  font-size: 0.9rem;
  color: #64748B;
  text-transform: uppercase;
  font-weight: 600;
  margin-bottom: 8px;
}

.amount-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #16A34A; /* Green */
  margin: 0 0 8px 0;
}

.method {
  color: #64748B;
  margin: 0;
  font-size: 0.95rem;
}

.footer {
  text-align: center;
  font-size: 0.85rem;
  color: #9CA3AF;
  border-top: 1px solid #E5E7EB;
  padding-top: 20px;
}

.date-printed {
  margin-top: 8px;
  font-size: 0.75rem;
}

.text-red { color: #DC2626; }

@media print {
  body {
    background-color: white !important;
  }
  
  .recibo-print {
    padding: 0;
  }
  
  .recibo-container {
    border: none;
    box-shadow: none;
    padding: 0;
    max-width: 100%;
  }
  
  .amount-box {
    background-color: transparent !important;
    border: 2px solid #E2E8F0 !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  
  .amount-value {
    color: black !important;
  }
}
</style>
