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
            <div class="account-icon mpesa-icon shadow-sm flex items-center justify-center mr-4">
              <Smartphone :size="22" />
            </div>
            <div class="account-details flex flex-col flex-1">
              <span class="account-label text-xs font-bold text-gray-400 uppercase tracking-wider">M-Pesa</span>
              <span class="account-number text-base font-black text-gray-800 tracking-wide mt-0.5">{{ mpesaNumber }}</span>
            </div>
            <button class="copy-btn" title="Copiar" @click="copyText(mpesaNumber)"><Copy :size="18"/></button>
          </div>

          <div class="account-tile hover-lift">
            <div class="account-icon emola-icon shadow-sm flex items-center justify-center mr-4">
              <Smartphone :size="22" />
            </div>
            <div class="account-details flex flex-col flex-1">
              <span class="account-label text-xs font-bold text-gray-400 uppercase tracking-wider">e-Mola</span>
              <span class="account-number text-base font-black text-gray-800 tracking-wide mt-0.5">{{ emolaNumber }}</span>
            </div>
            <button class="copy-btn" title="Copiar" @click="copyText(emolaNumber)"><Copy :size="18"/></button>
          </div>

          <div class="account-tile hover-lift">
            <div class="account-icon bank-icon shadow-sm flex items-center justify-center mr-4">
              <Building :size="22" />
            </div>
            <div class="account-details flex flex-col flex-1">
              <span class="account-label text-xs font-bold text-gray-400 uppercase tracking-wider">Conta Bancária (BIM)</span>
              <span class="account-number text-base font-black text-gray-800 tracking-wide mt-0.5">{{ bankAccount }}</span>
            </div>
            <button class="copy-btn" title="Copiar" @click="copyText(bankAccount)"><Copy :size="18"/></button>
          </div>
          
          <div class="titular-box mt-3 p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between flex-wrap gap-2">
            <span class="text-gray-500 text-sm font-medium">Titular da Conta:</span>
            <span class="font-bold text-gray-800 text-sm bg-white py-1.5 px-3.5 rounded-lg shadow-xs border border-gray-100">{{ accountHolder }}</span>
          </div>
        </div>
        
        <div class="support-banner mt-6 flex items-center justify-between p-4 rounded-xl bg-blue-50 border border-blue-100">
          <div class="flex items-center gap-3">
            <div class="bg-blue-100 p-2.5 rounded-full text-blue-600">
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
          <button class="btn-icon-close" @click="closeModal">
            <X :size="20" />
          </button>
        </div>
        
        <form @submit.prevent="enviarComprovativo" class="modal-form">
          <div class="upload-area-wrapper mb-6 relative">
            <input type="file" required accept="image/*,.pdf" @change="onFileChange" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
            <div class="upload-dropzone border-2 border-dashed border-blue-300 bg-blue-50/70 rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all hover:bg-blue-100/70">
              <UploadCloud :size="44" class="text-blue-600 mb-3" />
              <h4 class="font-bold text-blue-950 text-base mb-1">Clique ou arraste o ficheiro</h4>
              <p class="text-blue-700 text-xs font-medium">JPG, PNG ou PDF (Máx. 5MB)</p>
              <div v-if="receiptFile" class="mt-4 px-4 py-2.5 bg-white rounded-xl shadow-sm text-xs font-bold text-emerald-700 border border-emerald-200 w-full truncate flex items-center justify-center gap-2">
                <span>📄</span> <span>{{ receiptFile.name }}</span>
              </div>
            </div>
          </div>
          
          <div class="form-group mb-6">
            <label class="font-bold text-gray-700 text-xs uppercase tracking-wider mb-2 block">Notas adicionais (Opcional)</label>
            <textarea v-model="notes" rows="3" placeholder="Ex: Pagamento referente ao mês de Julho..." class="premium-textarea w-full"></textarea>
          </div>

          <div class="modal-actions flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" class="btn-secondary-outline" @click="closeModal">Cancelar</button>
            <button type="submit" class="btn-confirm" :disabled="saving">
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
const emolaNumber = ref('+258 86 123 4567');
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
    emolaNumber.value = sysRes.data.emola_number || '+258 86 123 4567';
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

.mpesa-icon { background: #E11D48; color: white; }
.emola-icon { background: #7C3AED; color: white; }
.bank-icon { background: #2563EB; color: white; }

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
  text-decoration: none;
  transition: all 0.2s;
}

.whatsapp-btn:hover {
  background: #1D4ED8;
  transform: translateY(-1px);
}

/* Modal Styling */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.premium-modal {
  background: white;
  border-radius: 24px;
  width: 100%;
  max-width: 520px;
  padding: 32px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.btn-icon-close {
  background-color: #F1F5F9;
  color: #64748B;
  border-radius: 50%;
  padding: 8px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.btn-icon-close:hover {
  background-color: #E2E8F0;
  color: #0F172A;
}

.premium-textarea {
  padding: 14px 16px;
  border: 1.5px solid #E2E8F0;
  border-radius: 14px;
  font-family: inherit;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.2s;
}

.premium-textarea:focus {
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.btn-confirm {
  background: linear-gradient(135deg, #2563EB, #1D4ED8);
  color: white;
  font-weight: 700;
  font-size: 0.875rem;
  padding: 10px 24px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
  transition: all 0.2s ease;
}
.btn-confirm:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.35);
}
.btn-confirm:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary-outline {
  background: white;
  color: #475569;
  font-weight: 600;
  font-size: 0.875rem;
  padding: 10px 20px;
  border-radius: 12px;
  border: 1px solid #E2E8F0;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-secondary-outline:hover {
  background: #F8FAFC;
  color: #0F172A;
}

@media (max-width: 1024px) {
  .grid-layout { grid-template-columns: 1fr; }
  .header-banner { padding: 24px; border-radius: 20px; }
  .premium-card { padding: 24px; border-radius: 24px; }
}
</style>
