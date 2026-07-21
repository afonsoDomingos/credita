<template>
  <div class="assinatura-page space-y-8">
    <!-- Header Simples e Elegante -->
    <div class="header-actions flex justify-between items-center flex-wrap gap-4">
      <div>
        <h1 class="text-2xl font-bold text-main">Assinatura & Faturação</h1>
        <p class="text-muted text-sm mt-0.5">Escolha o seu plano, gira a sua subscrição e envie comprovativos de pagamento.</p>
      </div>
    </div>

    <!-- Spinner Loading -->
    <div v-if="loading" class="surface loader-card p-12 text-center rounded-2xl shadow-sm border">
      <Spinner message="A carregar dados da assinatura..." />
    </div>

    <div v-else class="space-y-8">
      <!-- Status Card + Contas Bancárias (Top Section) -->
      <div class="grid-layout">
        <!-- Status Card -->
        <div class="surface status-card rounded-2xl shadow-sm border p-6 flex flex-col justify-between relative overflow-hidden">
          <div class="card-glow" :class="glowClass"></div>
          
          <div class="flex flex-col items-center text-center relative z-10">
            <div 
              class="status-icon-wrapper shadow-md" 
              :class="{
                'icon-active': status === 'active' || status === 'trial',
                'icon-warning': status === 'pending_verification',
                'icon-error': status === 'expired'
              }"
            >
              <CheckCircle v-if="status === 'active'" :size="32" stroke-width="2.5" />
              <Clock v-else-if="status === 'pending_verification'" :size="32" stroke-width="2.5" />
              <AlertCircle v-else-if="status === 'expired'" :size="32" stroke-width="2.5" />
              <Star v-else :size="32" stroke-width="2.5" />
            </div>
            
            <h2 class="plan-title mt-4 mb-2 text-xl font-bold text-slate-800">
              Plano <span class="highlight-text">{{ formatPlanName(plan) }}</span>
            </h2>
            
            <div class="premium-badge mb-4 shadow-xs" :class="statusClass">
              <span class="badge-dot"></span>
              {{ statusLabel }}
            </div>
            
            <div class="status-desc-box mb-6 p-4 rounded-xl w-full text-xs leading-relaxed" :class="descBoxClass">
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

            <div class="payment-actions w-full flex flex-col gap-2">
              <button @click="openModalWithPlan(plan)" class="btn-action-primary w-full flex items-center justify-center gap-2">
                <UploadCloud :size="18" /> Enviar Comprovativo
              </button>

              <a v-if="checkoutLink" :href="checkoutLink" target="_blank" class="btn-action-online w-full flex items-center justify-center gap-2">
                <CreditCard :size="18" /> Pagar Online Agora
              </a>
            </div>
          </div>
        </div>
        
        <!-- Info Contas para Transferência -->
        <div class="surface info-card rounded-2xl shadow-sm border p-6 flex flex-col justify-between">
          <div>
            <div class="card-header mb-4 border-b pb-3">
              <h3 class="font-bold text-base text-slate-800">Pagamento por Transferência</h3>
              <p class="text-muted text-xs mt-0.5">Utilize uma das contas abaixo para efetuar o pagamento do seu plano.</p>
            </div>
            
            <div class="bank-accounts flex flex-col gap-3">
              <div class="account-tile">
                <div class="account-icon mpesa-icon flex items-center justify-center mr-3">
                  <Smartphone :size="20" />
                </div>
                <div class="account-details flex flex-col flex-1">
                  <span class="account-label text-xs font-bold text-slate-400 uppercase tracking-wider">M-Pesa</span>
                  <span class="account-number text-sm font-black text-slate-800 mt-0.5">{{ mpesaNumber }}</span>
                </div>
                <button class="copy-btn" title="Copiar" @click="copyText(mpesaNumber)"><Copy :size="16"/></button>
              </div>

              <div class="account-tile">
                <div class="account-icon emola-icon flex items-center justify-center mr-3">
                  <Smartphone :size="20" />
                </div>
                <div class="account-details flex flex-col flex-1">
                  <span class="account-label text-xs font-bold text-slate-400 uppercase tracking-wider">e-Mola</span>
                  <span class="account-number text-sm font-black text-slate-800 mt-0.5">{{ emolaNumber }}</span>
                </div>
                <button class="copy-btn" title="Copiar" @click="copyText(emolaNumber)"><Copy :size="16"/></button>
              </div>

              <div class="account-tile">
                <div class="account-icon bank-icon flex items-center justify-center mr-3">
                  <Building :size="20" />
                </div>
                <div class="account-details flex flex-col flex-1">
                  <span class="account-label text-xs font-bold text-slate-400 uppercase tracking-wider">Conta Bancária (BIM)</span>
                  <span class="account-number text-sm font-black text-slate-800 mt-0.5">{{ bankAccount }}</span>
                </div>
                <button class="copy-btn" title="Copiar" @click="copyText(bankAccount)"><Copy :size="16"/></button>
              </div>
              
              <div class="titular-box p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs">
                <span class="text-slate-500 font-medium">Titular da Conta:</span>
                <span class="font-bold text-slate-800 bg-white py-1 px-3 rounded-md shadow-xs border border-slate-200">{{ accountHolder }}</span>
              </div>
            </div>
          </div>
          
          <div class="support-banner mt-4 flex items-center justify-between p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-xs">
            <div class="flex items-center gap-2.5">
              <div class="bg-blue-100 p-2 rounded-full text-blue-600">
                <MessageCircle :size="16" />
              </div>
              <div>
                <h4 class="font-bold text-blue-950">Precisa de Ajuda?</h4>
                <p class="text-blue-700">Fale com o suporte no WhatsApp</p>
              </div>
            </div>
            <a :href="`https://wa.me/${supportWhatsapp}`" target="_blank" class="whatsapp-btn font-bold text-xs">
              Contactar
            </a>
          </div>
        </div>
      </div>

      <!-- Gestão de Planos de Subscrição (Cards de Planos) -->
      <div class="plans-section space-y-4">
        <div>
          <h2 class="text-xl font-bold text-slate-800">Planos de Subscrição Disponíveis</h2>
          <p class="text-muted text-xs mt-0.5">Selecione o plano ideal para a sua empresa e faça o upgrade a qualquer momento.</p>
        </div>

        <div class="grid-3-plans">
          <!-- Plano Mensal -->
          <div class="surface plan-card rounded-2xl border p-6 flex flex-col justify-between transition-all" :class="plan === 'mensal' ? 'plan-active-border' : ''">
            <div>
              <div class="flex justify-between items-center mb-3">
                <span class="plan-tag bg-blue-50 text-blue-700">Mensal</span>
                <span v-if="plan === 'mensal'" class="badge-current">Plano Atual</span>
              </div>
              <div class="price-box mb-4">
                <span class="text-3xl font-black text-slate-900">MT 1.500</span>
                <span class="text-xs text-muted"> / mês</span>
              </div>
              <ul class="plan-features space-y-2 text-xs text-slate-600 mb-6">
                <li class="flex items-center gap-2"><CheckCircle :size="14" class="text-emerald-500" /> Empréstimos Ilimitados</li>
                <li class="flex items-center gap-2"><CheckCircle :size="14" class="text-emerald-500" /> Gestão Completa de Clientes</li>
                <li class="flex items-center gap-2"><CheckCircle :size="14" class="text-emerald-500" /> Cobranças via WhatsApp</li>
                <li class="flex items-center gap-2"><CheckCircle :size="14" class="text-emerald-500" /> Exportação Excel / PDF</li>
              </ul>
            </div>
            <button class="btn-plan w-full" :class="plan === 'mensal' ? 'btn-plan-disabled' : 'btn-plan-select'" @click="openModalWithPlan('mensal')">
              {{ plan === 'mensal' ? 'Plano Atual' : 'Escolher Mensal' }}
            </button>
          </div>

          <!-- Plano Trimestral -->
          <div class="surface plan-card rounded-2xl border p-6 flex flex-col justify-between transition-all relative overflow-hidden" :class="plan === 'trimestral' ? 'plan-active-border' : ''">
            <div class="plan-ribbon bg-amber-500 text-white">Desconto MT 500</div>
            <div>
              <div class="flex justify-between items-center mb-3">
                <span class="plan-tag bg-amber-50 text-amber-700">Trimestral</span>
                <span v-if="plan === 'trimestral'" class="badge-current">Plano Atual</span>
              </div>
              <div class="price-box mb-4">
                <span class="text-3xl font-black text-slate-900">MT 4.000</span>
                <span class="text-xs text-muted"> / 3 meses</span>
              </div>
              <ul class="plan-features space-y-2 text-xs text-slate-600 mb-6">
                <li class="flex items-center gap-2"><CheckCircle :size="14" class="text-emerald-500" /> Todas as funcionalidades do Mensal</li>
                <li class="flex items-center gap-2"><CheckCircle :size="14" class="text-emerald-500" /> Economize MT 500 no período</li>
                <li class="flex items-center gap-2"><CheckCircle :size="14" class="text-emerald-500" /> Suporte prioritário</li>
                <li class="flex items-center gap-2"><CheckCircle :size="14" class="text-emerald-500" /> Log de Atividades & Auditoria</li>
              </ul>
            </div>
            <button class="btn-plan w-full" :class="plan === 'trimestral' ? 'btn-plan-disabled' : 'btn-plan-select'" @click="openModalWithPlan('trimestral')">
              {{ plan === 'trimestral' ? 'Plano Atual' : 'Escolher Trimestral' }}
            </button>
          </div>

          <!-- Plano Anual -->
          <div class="surface plan-card rounded-2xl border p-6 flex flex-col justify-between transition-all relative overflow-hidden" :class="plan === 'anual' ? 'plan-active-border' : ''">
            <div class="plan-ribbon bg-emerald-600 text-white">2 Meses Grátis</div>
            <div>
              <div class="flex justify-between items-center mb-3">
                <span class="plan-tag bg-emerald-50 text-emerald-700">Anual</span>
                <span v-if="plan === 'anual'" class="badge-current">Plano Atual</span>
              </div>
              <div class="price-box mb-4">
                <span class="text-3xl font-black text-slate-900">MT 15.000</span>
                <span class="text-xs text-muted"> / ano</span>
              </div>
              <ul class="plan-features space-y-2 text-xs text-slate-600 mb-6">
                <li class="flex items-center gap-2"><CheckCircle :size="14" class="text-emerald-500" /> Todas as funcionalidades Pro</li>
                <li class="flex items-center gap-2"><CheckCircle :size="14" class="text-emerald-500" /> 2 Meses de acesso Grátis</li>
                <li class="flex items-center gap-2"><CheckCircle :size="14" class="text-emerald-500" /> Backup Diário em Nuvem</li>
                <li class="flex items-center gap-2"><CheckCircle :size="14" class="text-emerald-500" /> Apoio personalizado dedicado</li>
              </ul>
            </div>
            <button class="btn-plan w-full" :class="plan === 'anual' ? 'btn-plan-disabled' : 'btn-plan-select'" @click="openModalWithPlan('anual')">
              {{ plan === 'anual' ? 'Plano Atual' : 'Escolher Anual' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Histórico de Comprovativos Enviados -->
      <div class="surface rounded-2xl shadow-sm border overflow-hidden">
        <div class="p-5 border-b bg-slate-50/50 flex justify-between items-center">
          <div>
            <h3 class="font-bold text-base text-slate-800">Histórico de Comprovativos Enviados</h3>
            <p class="text-muted text-xs mt-0.5">Acompanhe o estado das suas submissões de pagamento.</p>
          </div>
        </div>

        <div v-if="myReceipts.length > 0" class="overflow-x-auto">
          <table class="data-table">
            <thead>
              <tr>
                <th>Data de Envio</th>
                <th>Valor Informado</th>
                <th>Notas / Observações</th>
                <th>Estado</th>
                <th class="text-right">Comprovativo</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="rec in myReceipts" :key="rec._id" class="table-row">
                <td class="text-xs font-medium text-slate-700">
                  {{ new Date(rec.createdAt).toLocaleDateString('pt-PT') }} às {{ new Date(rec.createdAt).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }) }}
                </td>
                <td class="font-bold text-slate-800 text-xs">
                  MT {{ rec.amount?.toLocaleString() || '1.500' }}
                </td>
                <td class="text-xs text-muted max-w-xs truncate">
                  {{ rec.notes || 'Sem observações' }}
                </td>
                <td>
                  <span class="status-receipt-badge" :class="getReceiptStatusClass(rec.status)">
                    {{ getReceiptStatusLabel(rec.status) }}
                  </span>
                </td>
                <td class="text-right">
                  <a :href="rec.receiptUrl" target="_blank" class="btn-view-receipt inline-flex items-center gap-1 text-xs">
                    <FileText :size="14" /> Ver Ficheiro
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="p-8 text-center text-muted text-xs">
          Nenhum comprovativo enviado até ao momento.
        </div>
      </div>
    </div>

    <!-- Modal Upload Comprovativo -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content premium-modal shadow-2xl">
        <div class="modal-header flex justify-between items-center mb-6">
          <div>
            <h2 class="font-bold text-lg text-slate-800">Enviar Comprovativo</h2>
            <p class="text-xs text-muted">Plano selecionado: <strong class="text-blue-600 uppercase">{{ selectedPlanForModal }}</strong></p>
          </div>
          <button class="btn-icon-close" @click="closeModal">
            <X :size="18" />
          </button>
        </div>
        
        <form @submit.prevent="enviarComprovativo" class="modal-form">
          <div class="form-group mb-4">
            <label class="font-bold text-slate-700 text-xs uppercase tracking-wider mb-1 block">Plano Desejado</label>
            <select v-model="selectedPlanForModal" class="premium-select w-full">
              <option value="mensal">Plano Mensal - MT 1.500 / mês</option>
              <option value="trimestral">Plano Trimestral - MT 4.000 / 3 meses</option>
              <option value="anual">Plano Anual - MT 15.000 / ano</option>
            </select>
          </div>

          <div class="upload-area-wrapper mb-4 relative">
            <input type="file" required accept="image/*,.pdf" @change="onFileChange" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
            <div class="upload-dropzone border-2 border-dashed border-blue-300 bg-blue-50/70 rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all hover:bg-blue-100/70">
              <UploadCloud :size="36" class="text-blue-600 mb-2" />
              <h4 class="font-bold text-blue-950 text-sm mb-0.5">Clique ou arraste o ficheiro</h4>
              <p class="text-blue-700 text-xs font-medium">JPG, PNG ou PDF (Máx. 5MB)</p>
              <div v-if="receiptFile" class="mt-3 px-3 py-2 bg-white rounded-xl shadow-xs text-xs font-bold text-emerald-700 border border-emerald-200 w-full truncate flex items-center justify-center gap-2">
                <span>📄</span> <span>{{ receiptFile.name }}</span>
              </div>
            </div>
          </div>
          
          <div class="form-group mb-6">
            <label class="font-bold text-slate-700 text-xs uppercase tracking-wider mb-1 block">Notas adicionais (Opcional)</label>
            <textarea v-model="notes" rows="2" placeholder="Ex: Pagamento efetuado via M-Pesa..." class="premium-textarea w-full"></textarea>
          </div>

          <div class="modal-actions flex justify-end gap-2 pt-4 border-t border-slate-100">
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
import { 
  CheckCircle, Clock, AlertCircle, Star, CreditCard, UploadCloud, X, 
  Smartphone, Building, Copy, MessageCircle, FileText
} from '@lucide/vue';
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
const selectedPlanForModal = ref('mensal');
const myReceipts = ref([]);

const copyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success('Copiado para a área de transferência!');
  } catch (err) {
    toast.error('Erro ao copiar.');
  }
};

const formatPlanName = (p) => {
  if (p === 'trial') return 'TRIAL (30 Dias)';
  if (p === 'trimestral') return 'TRIMESTRAL';
  if (p === 'anual') return 'ANUAL';
  return 'MENSAL';
};

const openModalWithPlan = (selectedPlan) => {
  selectedPlanForModal.value = selectedPlan === 'trial' ? 'mensal' : selectedPlan;
  showModal.value = true;
};

const loadData = async () => {
  try {
    const [companyRes, sysRes, receiptsRes] = await Promise.all([
      api.get('/company/settings'),
      api.get('/system/settings'),
      api.get('/company/receipts')
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
    
    myReceipts.value = receiptsRes.data || [];

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
  if (status.value === 'active' || (status.value === 'trial' && plan.value === 'trial')) return 'badge-active text-emerald-700 bg-emerald-100 border border-emerald-200';
  if (status.value === 'pending_verification') return 'badge-warning text-amber-700 bg-amber-100 border border-amber-200';
  if (status.value === 'expired') return 'badge-error text-red-700 bg-red-100 border border-red-200';
  return '';
});

const descBoxClass = computed(() => {
  if (status.value === 'active' || (status.value === 'trial' && plan.value === 'trial')) return 'bg-emerald-50/70 text-emerald-900';
  if (status.value === 'pending_verification') return 'bg-amber-50/70 text-amber-900';
  if (status.value === 'expired') return 'bg-red-50/70 text-red-900';
  return 'bg-slate-50';
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

const getReceiptStatusLabel = (s) => {
  if (s === 'approved') return 'Aprovado';
  if (s === 'rejected') return 'Rejeitado';
  return 'Em Análise';
};

const getReceiptStatusClass = (s) => {
  if (s === 'approved') return 'receipt-approved';
  if (s === 'rejected') return 'receipt-rejected';
  return 'receipt-pending';
};

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
    formData.append('notes', `[Plano ${selectedPlanForModal.value.toUpperCase()}] ${notes.value}`);
    formData.append('amount', selectedPlanForModal.value === 'anual' ? '15000' : selectedPlanForModal.value === 'trimestral' ? '4000' : '1500');
    
    await api.post('/company/receipts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    toast.success('Comprovativo enviado com sucesso!');
    status.value = 'pending_verification';
    closeModal();
    loadData();
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
  max-width: 1200px;
  margin: 0 auto;
}

.grid-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

/* Status Card */
.status-icon-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
}

.icon-active { color: #10B981; }
.icon-warning { color: #F59E0B; }
.icon-error { color: #EF4444; }

.card-glow {
  position: absolute;
  top: -80px;
  left: 50%;
  transform: translateX(-50%);
  width: 160px;
  height: 160px;
  border-radius: 50%;
  filter: blur(50px);
  z-index: 0;
  opacity: 0.4;
}

.glow-green { background: #34D399; }
.glow-yellow { background: #FBBF24; }
.glow-red { background: #F87171; }

.highlight-text {
  background: linear-gradient(135deg, #2563EB, #7C3AED);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.premium-badge {
  padding: 4px 14px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  letter-spacing: 0.5px;
}

.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: currentColor;
}

/* Action Buttons */
.btn-action-primary {
  background-color: var(--primary-color);
  color: white;
  padding: 10px 20px;
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 0.875rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-action-primary:hover { background-color: var(--primary-hover); }

.btn-action-online {
  background-color: #10B981;
  color: white;
  padding: 10px 20px;
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 0.875rem;
  text-decoration: none;
  transition: all 0.2s ease;
}
.btn-action-online:hover { background-color: #059669; }

/* Bank Tiles */
.account-tile {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 14px;
  background: #F8FAFC;
  border: 1px solid #F1F5F9;
}

.account-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
}

.mpesa-icon { background: #E11D48; color: white; }
.emola-icon { background: #7C3AED; color: white; }
.bank-icon { background: #2563EB; color: white; }

.copy-btn {
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 10px;
  width: 34px;
  height: 34px;
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
  padding: 6px 14px;
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.2s;
}
.whatsapp-btn:hover { background: #1D4ED8; }

/* Plan Cards Grid */
.grid-3-plans {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.plan-card {
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.plan-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.06);
}

.plan-active-border {
  border: 2px solid #2563EB !important;
  background-color: #F8FAFC;
}

.plan-tag {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 12px;
  text-transform: uppercase;
}

.badge-current {
  font-size: 0.7rem;
  font-weight: 700;
  color: #2563EB;
  background-color: #DBEAFE;
  padding: 2px 8px;
  border-radius: 8px;
}

.plan-ribbon {
  position: absolute;
  top: 16px;
  right: -32px;
  transform: rotate(45deg);
  font-size: 0.65rem;
  font-weight: 800;
  padding: 4px 36px;
  text-transform: uppercase;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.btn-plan-select {
  background-color: #2563EB;
  color: white;
  font-weight: 700;
  font-size: 0.875rem;
  padding: 10px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}
.btn-plan-select:hover { background-color: #1D4ED8; }

.btn-plan-disabled {
  background-color: #E2E8F0;
  color: #64748B;
  font-weight: 700;
  font-size: 0.875rem;
  padding: 10px;
  border-radius: 12px;
  border: none;
  cursor: default;
}

/* Table Styles */
.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th, .data-table td {
  padding: 14px 20px;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.data-table th {
  background-color: #F8FAFC;
  color: #64748B;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
}

.status-receipt-badge {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 12px;
  text-transform: uppercase;
}
.receipt-approved { background-color: #DCFCE7; color: #15803D; }
.receipt-pending { background-color: #FEF3C7; color: #B45309; }
.receipt-rejected { background-color: #FEE2E2; color: #B91C1C; }

.btn-view-receipt {
  color: #2563EB;
  font-weight: 600;
  text-decoration: none;
}
.btn-view-receipt:hover { text-decoration: underline; }

/* Modal */
.premium-select {
  padding: 10px 14px;
  border: 1.5px solid #E2E8F0;
  border-radius: 12px;
  font-family: inherit;
  font-size: 0.875rem;
  outline: none;
  background-color: white;
}
.premium-select:focus { border-color: #3B82F6; }

@media (max-width: 1024px) {
  .grid-layout { grid-template-columns: 1fr; }
}
</style>
