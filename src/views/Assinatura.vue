<template>
  <div class="assinatura-page">
    <div class="header-banner mb-8">
      <div class="banner-content relative z-10">
        <h1 class="page-title text-2xl font-bold text-white mb-2">Assinatura & Faturação</h1>
        <p class="page-subtitle text-blue-100">Gira o seu plano, pagamentos e estado da conta de forma simples e segura.</p>
      </div>
      <div class="banner-bg-shape"></div>
    </div>

    <div v-if="loading" class="loader-wrapper">
      <Spinner message="A carregar dados da assinatura..." />
    </div>

    <div v-else class="grid-layout">
      <!-- Status Card -->
      <div class="premium-card status-card relative overflow-hidden">
        <div class="card-glow" :class="glowClass"></div>
        <div class="flex flex-col items-center text-center relative z-10">
          <div 
            class="status-icon-wrapper shadow-lg" 
            :class="{
              'icon-active': status === 'active' || status === 'trial',
              'icon-warning': status === 'pending_verification',
              'icon-error': status === 'expired'
            }"
          >
            <CheckCircle v-if="status === 'active'" :size="42" stroke-width="2" />
            <Clock v-else-if="status === 'pending_verification'" :size="42" stroke-width="2" />
            <AlertCircle v-else-if="status === 'expired'" :size="42" stroke-width="2" />
            <Star v-else :size="42" stroke-width="2" />
          </div>
          
          <h2 class="plan-title mt-6 mb-2 text-2xl font-black text-gray-800">
            Plano <span class="highlight-text">{{ plan === 'trial' ? 'TRIAL (30 Dias)' : 'MENSAL' }}</span>
          </h2>
          
          <div class="premium-badge mb-6 shadow-sm" :class="statusClass">
            <span class="badge-dot"></span>
            {{ statusLabel }}
          </div>
          
          <div class="status-desc-box mb-8 p-4 rounded-2xl w-full text-sm leading-relaxed" :class="descBoxClass">
            <p v-if="status === 'pending_verification'">
              O seu comprovativo está em análise pela nossa equipa. A sua conta será ativada brevemente.
            </p>
            <p v-else-if="status === 'expired'">
              A sua assinatura expirou. Regularize o seu pagamento para reativar o acesso à plataforma.
            </p>
            <p v-else-if="plan === 'trial'">
              Aproveite o período de teste gratuito para explorar todo o potencial do nosso sistema!
            </p>
            <p v-else>
              Tudo operacional! O seu próximo pagamento está previsto para <strong>{{ nextBillingDateFormatted }}</strong>.
            </p>
          </div>

          <div class="payment-actions w-full flex flex-col gap-3">
            <a v-if="checkoutLink" :href="checkoutLink" target="_blank" class="btn-premium btn-online w-full shadow-md">
              <CreditCard :size="20" /> Pagar Online Agora
            </a>
            
            <button @click="showModal = true" class="btn-premium btn-upload w-full shadow-md">
              <UploadCloud :size="20" /> Enviar Comprovativo
            </button>
          </div>
        </div>
      </div>
      
      <!-- Info Box -->
      <div class="premium-card info-card">
        <div class="card-header mb-6">
          <h3 class="font-bold text-xl text-gray-800">Pagamento por Transferência</h3>
          <p class="text-muted text-sm mt-1">Utilize uma das contas abaixo e envie o comprovativo no botão ao lado.</p>
        </div>
        
        <div class="bank-accounts flex flex-col gap-4">
          <div class="account-tile hover-lift">
            <div class="flex items-center gap-2 mr-4">
              <img src="/mpesa.svg" alt="M-Pesa" class="w-12 h-12 object-contain bg-white rounded-lg shadow-sm p-1 border border-gray-100" />
              <img src="/emola.svg" alt="e-Mola" class="w-12 h-12 object-contain bg-white rounded-lg shadow-sm p-1 border border-gray-100" />
            </div>
            <div class="account-details flex-1">
              <span class="account-label text-xs font-bold text-gray-500 uppercase tracking-wider">M-Pesa / e-Mola</span>
              <span class="account-number text-lg font-black text-gray-800">{{ mpesaNumber }}</span>
            </div>
            <button class="copy-btn" title="Copiar" @click="copyText(mpesaNumber)"><Copy :size="18"/></button>
          </div>

          <div class="account-tile hover-lift">
            <div class="account-icon bank-icon shadow-sm">
              <Building :size="20" />
            </div>
            <div class="account-details flex-1">
              <span class="account-label text-xs font-bold text-gray-500 uppercase tracking-wider">Conta Bancária (BIM)</span>
              <span class="account-number text-lg font-black text-gray-800">{{ bankAccount }}</span>
            </div>
            <button class="copy-btn" title="Copiar" @click="copyText(bankAccount)"><Copy :size="18"/></button>
          </div>
          
          <div class="titular-box mt-3 p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
            <span class="text-gray-500 text-sm font-medium">Titular da Conta:</span>
            <span class="font-bold text-gray-800 text-sm bg-white py-1 px-3 rounded-lg shadow-sm">{{ accountHolder }}</span>
          </div>
        </div>
        
        <div class="support-banner mt-auto flex items-center justify-between p-4 rounded-xl bg-blue-50 border border-blue-100">
          <div class="flex items-center gap-3">
            <div class="bg-blue-100 p-2 rounded-full text-blue-600">
              <MessageCircle :size="20" />
            </div>
            <div>
              <h4 class="font-bold text-blue-900 text-sm mb-0.5">Dúvidas?</h4>
              <p class="text-blue-700 text-xs font-medium">Fale connosco no WhatsApp</p>
            </div>
          </div>
          <a :href="`https://wa.me/${supportWhatsapp}`" target="_blank" class="whatsapp-btn font-bold text-xs">
            Contactar
          </a>
        </div>
      </div>
    </div>

    <!-- Modal Upload Comprovativo -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content premium-modal shadow-2xl">
        <div class="modal-header flex justify-between items-center mb-6">
          <h2 class="font-bold text-xl text-gray-800">Enviar Comprovativo</h2>
          <button class="btn-icon-close bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full p-2 transition-colors" @click="closeModal">
            <X :size="20" />
          </button>
        </div>
        
        <form @submit.prevent="enviarComprovativo" class="modal-form">
          <div class="upload-area-wrapper mb-6 relative">
            <input type="file" required accept="image/*,.pdf" @change="onFileChange" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
            <div class="upload-dropzone border-2 border-dashed border-blue-300 bg-blue-50 rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all hover:bg-blue-100">
              <UploadCloud :size="40" class="text-blue-500 mb-3" />
              <h4 class="font-bold text-blue-900 mb-1">Clique ou arraste o ficheiro</h4>
              <p class="text-blue-600 text-xs font-medium">JPG, PNG ou PDF (Máx. 5MB)</p>
              <div v-if="receiptFile" class="mt-4 px-4 py-2 bg-white rounded-lg shadow-sm text-sm font-bold text-gray-800 w-full truncate">
                ✅ {{ receiptFile.name }}
              </div>
            </div>
          </div>
          
          <div class="form-group mb-6">
            <label class="font-bold text-gray-700 text-sm mb-2 block">Notas adicionais (Opcional)</label>
            <textarea v-model="notes" rows="3" placeholder="Ex: Pagamento referente ao mês de Julho..." class="premium-textarea w-full"></textarea>
          </div>

          <div class="modal-actions flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" class="btn-secondary-outline px-6 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors" @click="closeModal">Cancelar</button>
            <button type="submit" class="btn-primary px-6 py-2.5 rounded-xl font-bold shadow-md hover:shadow-lg transition-all" :disabled="saving">
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
import { CheckCircle, Clock, AlertCircle, Star, CreditCard, UploadCloud, X, Smartphone, Building, Copy, MessageCircle } from '@lucide/vue';
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

const mpesaNumber = ref('+258 84 123 4567');
const bankAccount = ref('00123456789');
const accountHolder = ref('Etako Technologies');
const supportWhatsapp = ref('258840000000');

const receiptFile = ref(null);
const notes = ref('');

const copyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success('Copiado para a área de transferência!');
  } catch (err) {
    toast.error('Erro ao copiar.');
  }
};

const loadData = async () => {
  try {
    const [companyRes, sysRes] = await Promise.all([
      api.get('/company/settings'),
      api.get('/system/settings')
    ]);
    
    plan.value = companyRes.data.subscriptionPlan || 'trial';
    status.value = companyRes.data.subscriptionStatus || 'active';
    
    if (companyRes.data.nextBillingDate) {
      nextDate.value = new Date(companyRes.data.nextBillingDate);
    } else if (plan.value === 'trial') {
      const created = new Date(companyRes.data.createdAt);
      created.setDate(created.getDate() + 30);
      nextDate.value = created;
      
      if (status.value === 'active' && nextDate.value < new Date()) {
        status.value = 'expired';
      }
    }
    
    checkoutLink.value = sysRes.data.checkout_link || null;
    mpesaNumber.value = sysRes.data.mpesa_number || '+258 84 123 4567';
    bankAccount.value = sysRes.data.bank_account || '00123456789';
    accountHolder.value = sysRes.data.account_holder || 'Etako Technologies';
    supportWhatsapp.value = sysRes.data.support_whatsapp || '258840000000';
    
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
  if (status.value === 'active' || (status.value === 'trial' && plan.value === 'trial')) return 'badge-active text-green-700 bg-green-100 border border-green-200';
  if (status.value === 'pending_verification') return 'badge-warning text-yellow-700 bg-yellow-100 border border-yellow-200';
  if (status.value === 'expired') return 'badge-error text-red-700 bg-red-100 border border-red-200';
  return '';
});

const descBoxClass = computed(() => {
  if (status.value === 'active' || (status.value === 'trial' && plan.value === 'trial')) return 'bg-green-50 text-green-800';
  if (status.value === 'pending_verification') return 'bg-yellow-50 text-yellow-800';
  if (status.value === 'expired') return 'bg-red-50 text-red-800';
  return 'bg-gray-50';
});

const glowClass = computed(() => {
  if (status.value === 'active' || (status.value === 'trial' && plan.value === 'trial')) return 'glow-green';
  if (status.value === 'pending_verification') return 'glow-yellow';
  if (status.value === 'expired') return 'glow-red';
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
.assinatura-page {
  padding-bottom: 40px;
}

.header-banner {
  position: relative;
  background: linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%);
  border-radius: 24px;
  padding: 32px 40px;
  overflow: hidden;
  box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.3);
}

.banner-bg-shape {
  position: absolute;
  top: -50px;
  right: -50px;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  filter: blur(20px);
}

.grid-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  max-width: 1000px;
  margin: 0 auto;
}

/* Premium Card Base */
.premium-card {
  background: #ffffff;
  border-radius: 28px;
  padding: 40px;
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(226, 232, 240, 0.8);
  display: flex;
  flex-direction: column;
}

.card-glow {
  position: absolute;
  top: -100px;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: 200px;
  border-radius: 50%;
  filter: blur(60px);
  z-index: 0;
  opacity: 0.5;
}

.glow-green { background: #4ADE80; }
.glow-yellow { background: #FACC15; }
.glow-red { background: #F87171; }

.status-icon-wrapper {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  margin-bottom: 8px;
}

.icon-active { color: #16A34A; }
.icon-warning { color: #CA8A04; }
.icon-error { color: #DC2626; }

.highlight-text {
  background: linear-gradient(135deg, #2563EB, #7C3AED);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.premium-badge {
  padding: 8px 20px;
  border-radius: 24px;
  font-size: 0.85rem;
  font-weight: 800;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  letter-spacing: 0.5px;
}

.badge-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: currentColor;
}

/* Buttons */
.btn-premium {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px;
  border-radius: 16px;
  font-weight: 700;
  font-size: 0.95rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border: none;
}

.btn-premium:hover {
  transform: translateY(-2px);
}

.btn-online {
  background: linear-gradient(135deg, #10B981, #059669);
  color: white;
}

.btn-online:hover {
  box-shadow: 0 10px 20px -5px rgba(16, 185, 129, 0.4);
}

.btn-upload {
  background: white;
  border: 2px solid #E2E8F0;
  color: #475569;
}

.btn-upload:hover {
  border-color: #3B82F6;
  color: #3B82F6;
  box-shadow: 0 10px 20px -5px rgba(59, 130, 246, 0.1);
}

/* Info Card */
.info-card {
  display: flex;
  flex-direction: column;
}

.account-tile {
  display: flex;
  align-items: center;
  padding: 16px;
  border-radius: 20px;
  background: #F8FAFC;
  border: 1px solid #F1F5F9;
  transition: all 0.3s ease;
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px -10px rgba(0,0,0,0.05);
  background: white;
  border-color: #E2E8F0;
}

.account-icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

.mpesa-icon { background: #EF4444; color: white; }
.bank-icon { background: #3B82F6; color: white; }

.copy-btn {
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748B;
  cursor: pointer;
  transition: all 0.2s;
}

.copy-btn:hover {
  background: #F1F5F9;
  color: #0F172A;
}

.whatsapp-btn {
  background: #2563EB;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  transition: all 0.2s;
}

.whatsapp-btn:hover {
  background: #1D4ED8;
  transform: translateY(-1px);
}

/* Modal */
.premium-modal {
  background: white;
  border-radius: 32px;
}

.premium-textarea {
  padding: 16px;
  border: 2px solid #E2E8F0;
  border-radius: 16px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
}

.premium-textarea:focus {
  border-color: #3B82F6;
}

@media (max-width: 1024px) {
  .grid-layout { grid-template-columns: 1fr; }
  .header-banner { padding: 24px; border-radius: 20px; }
  .premium-card { padding: 24px; border-radius: 24px; }
}
</style>
