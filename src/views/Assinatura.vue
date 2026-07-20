<template>
  <div class="assinatura-page">
    <div class="header-actions mb-6">
      <div>
        <h1 class="text-xl font-bold">Assinatura e Faturação</h1>
        <p class="text-muted text-sm">Gira o seu plano, pagamentos e estado da conta.</p>
      </div>
    </div>

    <div v-if="loading" class="loader-wrapper">
      <Spinner message="A carregar dados da assinatura..." />
    </div>

    <div v-else class="grid-layout">
      <!-- Status Card -->
      <div class="surface p-6 shadow-sm flex flex-col items-center text-center">
        <div 
          class="status-icon-wrapper" 
          :class="{
            'bg-green-100 text-green-600': status === 'active' || status === 'trial',
            'bg-yellow-100 text-yellow-600': status === 'pending_verification',
            'bg-red-100 text-red-600': status === 'expired'
          }"
        >
          <CheckCircle v-if="status === 'active'" :size="40" />
          <Clock v-else-if="status === 'pending_verification'" :size="40" />
          <AlertCircle v-else-if="status === 'expired'" :size="40" />
          <Star v-else :size="40" />
        </div>
        
        <h2 class="text-2xl font-bold mt-4 mb-1">
          Plano {{ plan === 'trial' ? 'TRIAL (30 Dias)' : 'MENSAL (150 MT)' }}
        </h2>
        
        <div class="status-badge mt-2 mb-4" :class="statusClass">
          {{ statusLabel }}
        </div>
        
        <p class="text-muted mb-6" v-if="status === 'pending_verification'">
          O seu comprovativo de pagamento está em análise. A sua conta será ativada em breve.
        </p>
        <p class="text-muted mb-6" v-else-if="status === 'expired'">
          A sua assinatura expirou. Regularize o pagamento para continuar a usar a plataforma.
        </p>
        <p class="text-muted mb-6" v-else-if="plan === 'trial'">
          Aproveite o período de teste gratuito para explorar todas as funcionalidades.
        </p>
        <p class="text-muted mb-6" v-else>
          O seu plano está ativo. O próximo pagamento será no dia <strong>{{ nextBillingDateFormatted }}</strong>.
        </p>

        <div class="divider w-full mb-6 border-b"></div>

        <div class="payment-actions flex flex-col gap-3 w-full">
          <a v-if="checkoutLink" :href="checkoutLink" target="_blank" class="btn-primary w-full flex items-center justify-center gap-2">
            <CreditCard :size="18" /> Pagar Online Agora
          </a>
          
          <button @click="showModal = true" class="btn-secondary w-full flex items-center justify-center gap-2">
            <UploadCloud :size="18" /> Enviar Comprovativo
          </button>
        </div>
      </div>
      
      <!-- Info Box -->
      <div class="surface p-6 shadow-sm">
        <h3 class="font-bold text-lg mb-4">Informação de Pagamento</h3>
        <p class="text-muted text-sm mb-4">Para transferências manuais, por favor utilize os seguintes dados bancários e envie o comprovativo.</p>
        
        <div class="bank-details bg-light p-4 rounded-md mb-6">
          <div class="detail-row flex justify-between mb-2">
            <span class="text-muted text-sm">M-Pesa / E-Mola:</span>
            <span class="font-semibold">+258 84 123 4567</span>
          </div>
          <div class="detail-row flex justify-between mb-2">
            <span class="text-muted text-sm">Banco (BIM):</span>
            <span class="font-semibold">00123456789</span>
          </div>
          <div class="detail-row flex justify-between">
            <span class="text-muted text-sm">Titular:</span>
            <span class="font-semibold">Etako Technologies</span>
          </div>
        </div>
        
        <h4 class="font-semibold mb-2">Precisa de Ajuda?</h4>
        <p class="text-muted text-sm">Contacte o suporte pelo WhatsApp: +258 84 000 0000</p>
      </div>
    </div>

    <!-- Modal Upload Comprovativo -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content surface">
        <div class="modal-header flex justify-between items-center mb-4">
          <h2 class="font-bold text-lg">Enviar Comprovativo</h2>
          <button class="btn-icon" @click="closeModal">
            <X :size="20" />
          </button>
        </div>
        
        <form @submit.prevent="enviarComprovativo" class="modal-form">
          <div class="form-group">
            <label>Selecione o ficheiro ou foto (JPG, PNG, PDF) *</label>
            <input type="file" required accept="image/*,.pdf" @change="onFileChange" class="mt-2" />
          </div>
          
          <div class="form-group mt-4">
            <label>Notas adicionais (Opcional)</label>
            <textarea v-model="notes" rows="3" placeholder="Referência da transferência, nome do titular..."></textarea>
          </div>

          <div class="modal-actions mt-6 flex justify-end gap-3">
            <button type="button" class="btn-secondary" @click="closeModal">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="saving">
              {{ saving ? 'A Enviar...' : 'Confirmar Envio' }}
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { CheckCircle, Clock, AlertCircle, Star, CreditCard, UploadCloud, X } from '@lucide/vue';
import Spinner from '../components/Spinner.vue';
import { useToast } from '../composables/useToast';
import api from '../api';

const toast = useToast();
const loading = ref(true);
const showModal = ref(false);
const saving = ref(false);

const plan = ref('trial');
const status = ref('active');
const nextDate = ref(null);
const checkoutLink = ref(null);

const receiptFile = ref(null);
const notes = ref('');

const loadData = async () => {
  try {
    const [companyRes, sysRes] = await Promise.all([
      api.get('/company/settings'),
      api.get('/system/settings')
    ]);
    
    plan.value = companyRes.data.subscriptionPlan || 'trial';
    status.value = companyRes.data.subscriptionStatus || 'active';
    
    // Calculate date
    if (companyRes.data.nextBillingDate) {
      nextDate.value = new Date(companyRes.data.nextBillingDate);
    } else if (plan.value === 'trial') {
      const created = new Date(companyRes.data.createdAt);
      created.setDate(created.getDate() + 30);
      nextDate.value = created;
      
      // Auto-expire if past 30 days and still active
      if (status.value === 'active' && nextDate.value < new Date()) {
        status.value = 'expired';
      }
    }
    
    checkoutLink.value = sysRes.data.checkout_link || null;
    
  } catch (error) {
    toast.error('Erro ao carregar dados da assinatura.');
  } finally {
    loading.value = false;
  }
};

const statusLabel = computed(() => {
  if (status.value === 'active' || (status.value === 'trial' && plan.value === 'trial')) return 'Ativo';
  if (status.value === 'pending_verification') return 'Em Análise';
  if (status.value === 'expired') return 'Expirado';
  return status.value;
});

const statusClass = computed(() => {
  if (status.value === 'active' || (status.value === 'trial' && plan.value === 'trial')) return 'badge-active';
  if (status.value === 'pending_verification') return 'badge-warning';
  if (status.value === 'expired') return 'badge-error';
  return '';
});

const nextBillingDateFormatted = computed(() => {
  if (!nextDate.value) return 'N/A';
  return nextDate.value.toLocaleDateString('pt-PT');
});

const closeModal = () => {
  showModal.value = false;
  receiptFile.value = null;
  notes.value = '';
};

const onFileChange = (e) => {
  receiptFile.value = e.target.files[0];
};

const enviarComprovativo = async () => {
  if (!receiptFile.value) {
    toast.error('Selecione um ficheiro primeiro.');
    return;
  }
  
  saving.value = true;
  try {
    const formData = new FormData();
    formData.append('receipt', receiptFile.value);
    formData.append('notes', notes.value);
    formData.append('amount', '150');
    
    await api.post('/company/receipts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    toast.success('Comprovativo enviado com sucesso!');
    status.value = 'pending_verification';
    closeModal();
  } catch (error) {
    toast.error('Erro ao enviar comprovativo.');
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.grid-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  max-width: 900px;
}

.status-icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-green-100 { background-color: #DCFCE7; }
.text-green-600 { color: #16A34A; }
.bg-yellow-100 { background-color: #FEF9C3; }
.text-yellow-600 { color: #CA8A04; }
.bg-red-100 { background-color: #FEE2E2; }
.text-red-600 { color: #DC2626; }

.status-badge {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 700;
  text-transform: uppercase;
  display: inline-block;
}

.badge-active { background-color: #DCFCE7; color: #16A34A; }
.badge-warning { background-color: #FEF9C3; color: #CA8A04; }
.badge-error { background-color: #FEE2E2; color: #DC2626; }

.bg-light {
  background-color: var(--bg-body);
}

.rounded-md {
  border-radius: var(--radius-md);
}

.border-b {
  border-bottom: 1px solid var(--border-color);
}

textarea {
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-family: inherit;
  outline: none;
  width: 100%;
  resize: vertical;
}

textarea:focus { border-color: var(--primary-color); }

.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 100%;
  max-width: 450px;
  padding: 24px;
}

@media (max-width: 768px) {
  .grid-layout { grid-template-columns: 1fr; }
}
</style>
