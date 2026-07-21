<template>
  <div class="assinatura-page">
    
    <!-- Header Page -->
    <div class="page-header">
      <div class="page-header-left">
        <div class="page-header-icon">
          <CreditCard :size="22" />
        </div>
        <div>
          <h1 class="page-title">Assinatura & Faturação</h1>
          <p class="page-subtitle">Gira o seu plano, consulte os dados de pagamento e envie os seus comprovativos.</p>
        </div>
      </div>
    </div>

    <!-- Spinner Loading -->
    <div v-if="loading" class="surface loading-state">
      <Spinner message="A carregar dados da assinatura..." />
    </div>

    <div v-else class="assinatura-content">
      
      <!-- Top Grid: Status Actual + Métodos de Pagamento -->
      <div class="top-grid">
        
        <!-- Card 1: Estado da Subscrição -->
        <div class="card-surface status-card">
          <div class="status-card-header">
            <div 
              class="status-icon-bubble" 
              :class="{
                'icon-active': status === 'active' || status === 'trial',
                'icon-warning': status === 'pending_verification',
                'icon-error': status === 'expired'
              }"
            >
              <CheckCircle v-if="status === 'active'" :size="24" />
              <Clock v-else-if="status === 'pending_verification'" :size="24" />
              <AlertCircle v-else-if="status === 'expired'" :size="24" />
              <Star v-else :size="24" />
            </div>
            
            <div class="status-header-titles">
              <span class="status-card-label">Subscrição Atual</span>
              <h2 class="status-plan-name">Plano {{ formatPlanName(plan) }}</h2>
            </div>

            <div class="status-badge" :class="statusClass">
              <span class="badge-dot"></span>
              {{ statusLabel }}
            </div>
          </div>

          <div class="status-info-box" :class="descBoxClass">
            <p v-if="status === 'pending_verification'">
              ⏳ O seu comprovativo está em análise. A sua conta será ativada brevemente pela equipa.
            </p>
            <p v-else-if="status === 'expired'">
              ⚠️ A sua assinatura expirou. Efetue o pagamento para reativar o acesso total.
            </p>
            <p v-else-if="plan === 'trial'">
              🎁 Período de teste ativo. Aproveite todas as funcionalidades do sistema!
            </p>
            <p v-else>
              ✅ Tudo operacional! Próxima renovação em: <strong>{{ nextBillingDateFormatted }}</strong>.
            </p>
          </div>

          <div class="status-actions">
            <button @click="openModalWithPlan(plan)" class="btn-primary-action">
              <UploadCloud :size="16" />
              Enviar Comprovativo
            </button>
            <a v-if="checkoutLink" :href="checkoutLink" target="_blank" class="btn-online-action">
              <CreditCard :size="16" />
              Pagar Online
            </a>
          </div>
        </div>

        <!-- Card 2: Contas de Pagamento / Transferência -->
        <div class="card-surface payment-methods-card">
          <div class="pm-header">
            <h3 class="pm-title">Contas para Transferência</h3>
            <span class="pm-subtitle">Efetue o pagamento para uma das contas abaixo:</span>
          </div>

          <div class="accounts-list">
            <!-- M-Pesa -->
            <div class="account-item mpesa">
              <div class="account-badge mpesa-bg">
                <Smartphone :size="16" />
                <span>M-Pesa</span>
              </div>
              <span class="account-num">{{ mpesaNumber }}</span>
              <button class="btn-copy" title="Copiar número" @click="copyText(mpesaNumber)">
                <Copy :size="14" />
              </button>
            </div>

            <!-- e-Mola -->
            <div class="account-item emola">
              <div class="account-badge emola-bg">
                <Smartphone :size="16" />
                <span>e-Mola</span>
              </div>
              <span class="account-num">{{ emolaNumber }}</span>
              <button class="btn-copy" title="Copiar número" @click="copyText(emolaNumber)">
                <Copy :size="14" />
              </button>
            </div>

            <!-- Banco BIM -->
            <div class="account-item bank">
              <div class="account-badge bank-bg">
                <Building :size="16" />
                <span>BIM</span>
              </div>
              <span class="account-num">{{ bankAccount }}</span>
              <button class="btn-copy" title="Copiar NIB/Conta" @click="copyText(bankAccount)">
                <Copy :size="14" />
              </button>
            </div>
          </div>

          <div class="pm-footer">
            <div class="holder-info">
              <span class="holder-label">Titular:</span>
              <strong class="holder-name">{{ accountHolder }}</strong>
            </div>
            <a :href="`https://wa.me/${supportWhatsapp}`" target="_blank" class="btn-whatsapp-support">
              <MessageCircle :size="14" />
              Suporte WhatsApp
            </a>
          </div>
        </div>

      </div>

      <!-- Card 3: O Nosso Plano Único (Pacote Promocional / Padrão) -->
      <div class="card-surface single-plan-card">
        <div class="plan-card-left">
          <div class="plan-header-row">
            <span class="plan-badge-tag">Pacote Profissional</span>
            <span class="plan-badge-highlight">Acesso Completo</span>
          </div>
          <div class="plan-price-row">
            <span class="price-currency">MT</span>
            <span class="price-amount">{{ monthlyPlanPrice }}</span>
            <span class="price-period">/ mês</span>
          </div>
          <p class="plan-desc">Tudo o que a sua microcrédito precisa para gerir empréstimos com eficiência e sem limites.</p>
        </div>

        <div class="plan-features-grid">
          <div class="feature-item"><CheckCircle :size="15" class="text-green" /> Empréstimos & Amortizações Ilimitados</div>
          <div class="feature-item"><CheckCircle :size="15" class="text-green" /> Gestão de Clientes & Rating de Confiança</div>
          <div class="feature-item"><CheckCircle :size="15" class="text-green" /> Lembretes Automáticos no WhatsApp</div>
          <div class="feature-item"><CheckCircle :size="15" class="text-green" /> Relatórios Exportáveis em PDF & Excel</div>
          <div class="feature-item"><CheckCircle :size="15" class="text-green" /> Registos de Auditoria & Segurança Total</div>
          <div class="feature-item"><CheckCircle :size="15" class="text-green" /> Suporte Técnico Prioritário</div>
        </div>

        <div class="plan-card-right">
          <button class="btn-select-plan" @click="openModalWithPlan('mensal')">
            <UploadCloud :size="16" />
            Subscrever por MT {{ monthlyPlanPrice }}
          </button>
        </div>
      </div>

      <!-- Card 4: Histórico de Comprovativos Enviados -->
      <div class="card-surface history-card">
        <div class="history-header">
          <div class="history-title-wrap">
            <FileText :size="18" class="text-blue" />
            <h3 class="history-title">Histórico de Comprovativos Enviados</h3>
          </div>
          <span class="history-count">{{ myReceipts.length }} registo{{ myReceipts.length !== 1 ? 's' : '' }}</span>
        </div>

        <div v-if="myReceipts.length > 0" class="table-responsive">
          <table class="receipts-table">
            <thead>
              <tr>
                <th>Data de Envio</th>
                <th>Mês Pago</th>
                <th>Valor</th>
                <th>Notas</th>
                <th>Estado</th>
                <th class="text-right">Comprovativo</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="rec in myReceipts" :key="rec._id">
                <td class="td-date">
                  <Clock :size="12" />
                  {{ formatDate(rec.createdAt) }}
                </td>
                <td>
                  <span v-if="rec.billingMonth" class="billing-month-badge">
                    📅 {{ formatBillingMonth(rec.billingMonth) }}
                  </span>
                  <span v-else class="text-muted text-xs">—</span>
                </td>
                <td class="td-amount">
                  MT {{ formatMoney(rec.amount || monthlyPlanPrice) }}
                </td>
                <td class="td-notes" :title="rec.notes">
                  {{ rec.notes || 'Sem observações' }}
                </td>
                <td>
                  <span class="receipt-status-pill" :class="getReceiptStatusClass(rec.status)">
                    {{ getReceiptStatusLabel(rec.status) }}
                  </span>
                </td>
                <td class="text-right">
                  <a :href="rec.receiptUrl" target="_blank" class="btn-view-file">
                    <FileText :size="13" /> Ver Ficheiro
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="empty-receipts">
          <FileText :size="32" class="text-muted opacity-50" />
          <p>Nenhum comprovativo enviado até ao momento.</p>
        </div>
      </div>

    </div>

    <!-- Modal Upload Comprovativo -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-card">
        <div class="modal-header">
          <div>
            <h3 class="modal-title">Submeter Comprovativo</h3>
            <p class="modal-subtitle">Plano Mensal - <strong>MT {{ monthlyPlanPrice }} / mês</strong></p>
          </div>
          <button class="btn-close-modal" @click="closeModal">
            <X :size="18" />
          </button>
        </div>

        <form @submit.prevent="enviarComprovativo" class="modal-form">
          <div class="form-group">
            <label class="form-label">Ficheiro do Comprovativo *</label>
            <div class="upload-dropzone" :class="{ 'has-file': receiptFile }">
              <input type="file" required accept="image/*,.pdf" @change="onFileChange" class="file-input" />
              <div class="dropzone-content">
                <UploadCloud :size="32" class="dropzone-icon" />
                <span class="dropzone-title">Clique para selecionar o comprovativo</span>
                <span class="dropzone-hint">Formatos suportados: PNG, JPG ou PDF (Máx. 5MB)</span>
                <div v-if="receiptFile" class="selected-file-pill">
                  📄 {{ receiptFile.name }}
                </div>
              </div>
            </div>
          </div>

          <!-- Mês de Faturação -->
          <div class="form-group">
            <label class="form-label">
              <span class="label-required">Mês a que se refere o pagamento *</span>
            </label>
            <div class="month-picker-wrapper">
              <div class="month-picker-header">
                <CalendarDays :size="15" class="month-icon" />
                <span>Selecione o mês que está a pagar</span>
              </div>
              <input
                type="month"
                v-model="billingMonth"
                required
                class="month-input"
                :min="minBillingMonth"
                :max="maxBillingMonth"
              />
              <p class="month-hint">
                💡 Este campo indica qual o mês de subscrição que está a liquidar (ex: se está a pagar Julho, o acesso será válido até final de Agosto).
              </p>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Notas ou Observações (Opcional)</label>
            <textarea 
              v-model="notes" 
              rows="2" 
              placeholder="Ex: Transferência efetuada via M-Pesa às 14:30..." 
              class="form-textarea"
            ></textarea>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-cancel" @click="closeModal">Cancelar</button>
            <button type="submit" class="btn-submit" :disabled="saving || !receiptFile">
              {{ saving ? 'A Enviar...' : 'Confirmar & Enviar' }}
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
  Smartphone, Building, Copy, MessageCircle, FileText, CalendarDays
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
const monthlyPlanPrice = ref('95');

const receiptFile = ref(null);
const notes = ref('');
const billingMonth = ref(new Date().toISOString().slice(0, 7)); // 'YYYY-MM'
const selectedPlanForModal = ref('mensal');
const myReceipts = ref([]);

// Helper: formatar 'YYYY-MM' para texto legível ex: 'Julho 2026'
const formatBillingMonth = (ym) => {
  if (!ym) return '—';
  const [year, month] = ym.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' });
};

const formatMoney = (val) => {
  return Number(val || 0).toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-PT') + ' às ' + d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
};

const copyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success('Copiado para a área de transferência!');
  } catch (err) {
    toast.error('Erro ao copiar.');
  }
};

const formatPlanName = (p) => {
  if (p === 'trial') return 'TRIAL (Grátis)';
  if (p === 'trimestral') return 'Trimestral';
  if (p === 'anual') return 'Anual';
  return 'Mensal';
};

const openModalWithPlan = (selectedPlan) => {
  selectedPlanForModal.value = selectedPlan === 'trial' ? 'mensal' : selectedPlan;
  // Reset billing month to current month each time modal is opened
  billingMonth.value = new Date().toISOString().slice(0, 7);
  showModal.value = true;
};

// Limites do seletor de mês: 3 meses atrás até 2 meses à frente
const minBillingMonth = computed(() => {
  const d = new Date();
  d.setMonth(d.getMonth() - 3);
  return d.toISOString().slice(0, 7);
});

const maxBillingMonth = computed(() => {
  const d = new Date();
  d.setMonth(d.getMonth() + 2);
  return d.toISOString().slice(0, 7);
});

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
    monthlyPlanPrice.value = sysRes.data.monthly_plan_price || '95';
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
  if (status.value === 'active' || (status.value === 'trial' && plan.value === 'trial')) return 'badge-active';
  if (status.value === 'pending_verification') return 'badge-warning';
  if (status.value === 'expired') return 'badge-error';
  return '';
});

const descBoxClass = computed(() => {
  if (status.value === 'active' || (status.value === 'trial' && plan.value === 'trial')) return 'box-green';
  if (status.value === 'pending_verification') return 'box-amber';
  if (status.value === 'expired') return 'box-red';
  return 'box-slate';
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
  if (s === 'approved') return 'pill-approved';
  if (s === 'rejected') return 'pill-rejected';
  return 'pill-pending';
};

const closeModal = () => {
  showModal.value = false;
  receiptFile.value = null;
  notes.value = '';
  billingMonth.value = new Date().toISOString().slice(0, 7);
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
    formData.append('notes', `[Plano Mensal - ${monthlyPlanPrice.value} MT] ${notes.value}`);
    formData.append('amount', monthlyPlanPrice.value);
    formData.append('billingMonth', billingMonth.value);
    
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
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ── Page Header ── */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.page-header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.page-header-icon {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #2563EB, #4F46E5);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
  flex-shrink: 0;
}

.page-title {
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--text-main);
  margin: 0;
}

.page-subtitle {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin: 2px 0 0;
}

.loading-state {
  padding: 60px 24px;
  text-align: center;
  border-radius: 16px;
}

.assinatura-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ── Cards Surface Generic ── */
.card-surface {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 20px 24px;
}

/* ── Top Grid (Card 1 + Card 2) ── */
.top-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

/* Card 1: Subscrição Atual */
.status-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 16px;
}

.status-card-header {
  display: flex;
  align-items: center;
  gap: 14px;
}

.status-icon-bubble {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.icon-active { background: #DCFCE7; color: #16A34A; }
.icon-warning { background: #FEF9C3; color: #CA8A04; }
.icon-error { background: #FEE2E2; color: #DC2626; }

.status-header-titles {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.status-card-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-plan-name {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--text-main);
  margin: 0;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
}
.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}
.badge-active { background: #DCFCE7; color: #15803D; }
.badge-warning { background: #FEF9C3; color: #854D0E; }
.badge-error { background: #FEE2E2; color: #B91C1C; }

.status-info-box {
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 0.82rem;
  line-height: 1.4;
}
.status-info-box p { margin: 0; }
.box-green { background: #F0FDF4; border: 1px solid #DCFCE7; color: #166534; }
.box-amber { background: #FFFBEB; border: 1px solid #FEF3C7; color: #92400E; }
.box-red { background: #FEF2F2; border: 1px solid #FEE2E2; color: #991B1B; }
.box-slate { background: #F8FAFC; border: 1px solid #E2E8F0; color: #334155; }

.status-actions {
  display: flex;
  gap: 10px;
}

.btn-primary-action, .btn-online-action {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  text-decoration: none;
}

.btn-primary-action {
  background: #2563EB;
  color: white;
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.2);
}
.btn-primary-action:hover { background: #1D4ED8; }

.btn-online-action {
  background: #F1F5F9;
  color: #334155;
  border: 1px solid var(--border-color);
}
.btn-online-action:hover { background: #E2E8F0; }

/* Card 2: Contas de Pagamento */
.payment-methods-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 14px;
}

.pm-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-main);
  margin: 0;
}

.pm-subtitle {
  font-size: 0.78rem;
  color: var(--text-muted);
  display: block;
  margin-top: 2px;
}

.accounts-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.account-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-body);
  border: 1px solid var(--border-color);
  padding: 8px 12px;
  border-radius: 10px;
}

.account-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  min-width: 80px;
}
.mpesa-bg { background: #FEE2E2; color: #DC2626; }
.emola-bg { background: #F3E8FF; color: #7E22CE; }
.bank-bg { background: #DBEAFE; color: #1D4ED8; }

.account-num {
  font-family: 'Courier New', monospace;
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--text-main);
}

.btn-copy {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.2s;
  display: flex;
}
.btn-copy:hover { color: #2563EB; }

.pm-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 10px;
  border-top: 1px solid var(--border-color);
  gap: 12px;
}

.holder-info {
  font-size: 0.78rem;
  color: var(--text-muted);
}
.holder-name {
  color: var(--text-main);
  font-weight: 700;
  margin-left: 4px;
}

.btn-whatsapp-support {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #DCFCE7;
  color: #15803D;
  border-radius: 20px;
  font-size: 0.78rem;
  font-weight: 700;
  text-decoration: none;
  transition: background 0.2s;
}
.btn-whatsapp-support:hover { background: #BBF7D0; }

/* ── Card 3: Plano Único ── */
.single-plan-card {
  display: grid;
  grid-template-columns: 260px 1fr 220px;
  align-items: center;
  gap: 24px;
  background: linear-gradient(135deg, #F8FAFC, #EFF6FF);
  border: 1.5px solid #BFDBFE;
}

.plan-card-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.plan-header-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.plan-badge-tag {
  background: #2563EB;
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;
  text-transform: uppercase;
}

.plan-badge-highlight {
  background: #DBEAFE;
  color: #1D4ED8;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;
}

.plan-price-row {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.price-currency {
  font-size: 1.1rem;
  font-weight: 800;
  color: #1E3A8A;
}

.price-amount {
  font-size: 2.2rem;
  font-weight: 900;
  color: #0F172A;
  line-height: 1;
}

.price-period {
  font-size: 0.85rem;
  color: var(--text-muted);
  font-weight: 600;
}

.plan-desc {
  font-size: 0.78rem;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.4;
}

.plan-features-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 16px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #334155;
}
.text-green { color: #10B981; flex-shrink: 0; }

.plan-card-right {
  display: flex;
  justify-content: flex-end;
}

.btn-select-plan {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 18px;
  background: linear-gradient(135deg, #2563EB, #1D4ED8);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  transition: all 0.2s;
}
.btn-select-plan:hover { transform: translateY(-1px); filter: brightness(1.05); }

/* ── Card 4: Histórico de Comprovativos ── */
.history-card {
  padding: 0;
  overflow: hidden;
}

.history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-body);
}

.history-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.text-blue { color: #2563EB; }

.history-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-main);
  margin: 0;
}

.history-count {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-muted);
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  padding: 3px 10px;
  border-radius: 20px;
}

.table-responsive {
  overflow-x: auto;
}

.receipts-table {
  width: 100%;
  border-collapse: collapse;
}

.receipts-table th {
  padding: 12px 20px;
  text-align: left;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-muted);
  background: var(--bg-body);
  border-bottom: 1px solid var(--border-color);
}

.receipts-table td {
  padding: 14px 20px;
  border-bottom: 1px solid var(--border-color);
  font-size: 0.85rem;
  color: var(--text-main);
}
.receipts-table tr:last-child td { border-bottom: none; }

.td-date {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-muted);
  font-size: 0.82rem;
}

.td-amount {
  font-family: 'Courier New', monospace;
  font-weight: 700;
  color: var(--text-main);
}

.td-notes {
  color: var(--text-muted);
  max-width: 260px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.receipt-status-pill {
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
}
.pill-approved { background: #DCFCE7; color: #15803D; }
.pill-pending { background: #FEF9C3; color: #854D0E; }
.pill-rejected { background: #FEE2E2; color: #B91C1C; }

.text-right { text-align: right; }

.btn-view-file {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  background: #F1F5F9;
  color: #334155;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.2s;
}
.btn-view-file:hover { background: #E2E8F0; }

.empty-receipts {
  padding: 48px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--text-muted);
  font-size: 0.85rem;
}

/* ── Modal Design ── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.modal-card {
  background: var(--bg-surface);
  border-radius: 20px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-body);
}

.modal-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-main);
  margin: 0;
}

.modal-subtitle {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin: 2px 0 0;
}

.btn-close-modal {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  display: flex;
  transition: color 0.2s;
}
.btn-close-modal:hover { color: var(--text-main); background: var(--bg-body); }

.modal-form {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-main);
}

.upload-dropzone {
  position: relative;
  border: 2px dashed #BFDBFE;
  background: #F0F9FF;
  border-radius: 14px;
  padding: 24px 16px;
  text-align: center;
  transition: border-color 0.2s, background 0.2s;
}
.upload-dropzone:hover, .upload-dropzone.has-file {
  border-color: #2563EB;
  background: #EFF6FF;
}

.file-input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 10;
}

.dropzone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.dropzone-icon {
  color: #2563EB;
  margin-bottom: 4px;
}

.dropzone-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: #1E3A8A;
}

.dropzone-hint {
  font-size: 0.75rem;
  color: #64748B;
}

.selected-file-pill {
  margin-top: 8px;
  background: white;
  border: 1px solid #BBF7D0;
  color: #15803D;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.78rem;
  font-weight: 700;
}

.form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  font-family: inherit;
  font-size: 0.85rem;
  outline: none;
  resize: vertical;
  background: var(--bg-body);
  box-sizing: border-box;
}
.form-textarea:focus { border-color: #2563EB; }

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 8px;
}

.btn-cancel, .btn-submit {
  padding: 10px 18px;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-cancel {
  background: var(--bg-body);
  color: var(--text-main);
  border: 1px solid var(--border-color);
}
.btn-cancel:hover { background: var(--border-color); }

.btn-submit {
  background: #2563EB;
  color: white;
}
.btn-submit:hover:not(:disabled) { background: #1D4ED8; }
.btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

/* Responsive adjustments */
@media (max-width: 900px) {
  .top-grid { grid-template-columns: 1fr; }
  .single-plan-card { grid-template-columns: 1fr; gap: 16px; }
  .plan-card-right { justify-content: stretch; }
  .btn-select-plan { width: 100%; }
}

/* ── Month Picker ── */
.label-required {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-main);
}

.month-picker-wrapper {
  background: linear-gradient(135deg, #F0F9FF, #EFF6FF);
  border: 1.5px solid #BFDBFE;
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.month-picker-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #1E40AF;
}

.month-icon {
  color: #2563EB;
  flex-shrink: 0;
}

.month-input {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid #BFDBFE;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 700;
  color: #1E3A8A;
  background: white;
  outline: none;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}
.month-input:focus {
  border-color: #2563EB;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.month-hint {
  font-size: 0.75rem;
  color: #3B82F6;
  margin: 0;
  line-height: 1.4;
  background: #EFF6FF;
  padding: 8px 10px;
  border-radius: 8px;
  border-left: 3px solid #3B82F6;
}

/* ── Billing Month Badge in history table ── */
.billing-month-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #EFF6FF;
  color: #1D4ED8;
  border: 1px solid #BFDBFE;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.78rem;
  font-weight: 700;
  white-space: nowrap;
}
</style>
