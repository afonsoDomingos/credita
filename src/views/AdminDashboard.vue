<template>
  <div class="admin-dashboard">
    <div class="header-actions">
      <h2 class="page-title">Torre de Controlo (Superadmin)</h2>
      <div class="flex gap-3">
        <button class="btn-secondary" @click="openSystemSettingsModal">Definições de Sistema</button>
        <button class="btn-primary" @click="openModal">Adicionar Nova Empresa</button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs flex gap-6 mb-6 border-b">
      <button class="tab-btn" :class="{ active: activeTab === 'empresas' }" @click="activeTab = 'empresas'">Empresas Registadas</button>
      <button class="tab-btn" :class="{ active: activeTab === 'analytics' }" @click="loadCharts(); activeTab = 'analytics'">📊 Analytics</button>
      <button class="tab-btn" :class="{ active: activeTab === 'faturacao' }" @click="loadFinance(); activeTab = 'faturacao'">Faturação / Receitas</button>
      <button class="tab-btn" :class="{ active: activeTab === 'comprovativos' }" @click="activeTab = 'comprovativos'">
        Comprovativos
        <span v-if="receipts.length > 0" class="badge-count">{{ receipts.length }}</span>
      </button>
      <button class="tab-btn" :class="{ active: activeTab === 'suporte' }" @click="loadInbox(); activeTab = 'suporte'">
        Suporte / Mensagens
        <span v-if="totalUnread > 0" class="badge-count">{{ totalUnread }}</span>
      </button>
    </div>

    <!-- System Health Banner -->
    <div class="system-banner surface">
      <div class="banner-content">
        <div class="banner-icon-bg">
          <Activity :size="24" class="banner-icon" />
        </div>
        <div class="banner-text">
          <h3>Estado do Sistema: 100% Operacional</h3>
          <p>Todos os serviços de microcrédito estão a funcionar normalmente e sem interrupções.</p>
        </div>
      </div>
      <span class="banner-badge">Atualizado agora</span>
    </div>

    <div v-if="stats && activeTab === 'empresas'" class="stats-grid mb-8">
      <div class="stat-card surface shadow-sm">
        <div class="stat-content">
          <h3 class="stat-title">Total Empresas</h3>
          <p class="stat-value text-gray-800">{{ stats.totalCompanies }}</p>
        </div>
        <div class="stat-icon-wrapper bg-blue-100 text-blue-600">
          <Building2 :size="32" />
        </div>
      </div>
      
      <div class="stat-card surface shadow-sm">
        <div class="stat-content">
          <h3 class="stat-title">Empresas Ativas</h3>
          <p class="stat-value text-green-500">{{ stats.activeCompanies }}</p>
        </div>
        <div class="stat-icon-wrapper bg-green-100 text-green-600">
          <Activity :size="32" />
        </div>
      </div>
      
      <div class="stat-card surface shadow-sm">
        <div class="stat-content">
          <h3 class="stat-title">Clientes Globais</h3>
          <p class="stat-value text-purple-600">{{ stats.totalClients }}</p>
        </div>
        <div class="stat-icon-wrapper bg-purple-100 text-purple-600">
          <Users :size="32" />
        </div>
      </div>
    </div>

    <div class="surface p-0 overflow-hidden">
      <div v-if="activeTab === 'empresas'">
        <div v-if="loading" class="loader-wrapper">
          <Spinner message="A carregar empresas do sistema..." />
        </div>
        
        <table class="companies-table" v-else-if="empresas.length > 0">
        <thead>
          <tr>
            <th>Nome da Empresa</th>
            <th>NIF</th>
            <th>Plano</th>
            <th>Status</th>
            <th class="text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="empresa in empresas" :key="empresa._id" class="table-row">
            <td>
              <div class="company-name-cell flex items-center gap-3">
                <img 
                  v-if="empresa.logoUrl && !logoErrors[empresa._id]" 
                  :src="empresa.logoUrl" 
                  alt="Logo" 
                  class="avatar-circle" 
                  style="object-fit: cover;" 
                  @error="onLogoError(empresa._id)" 
                />
                <div v-else class="avatar-circle flex items-center justify-center font-bold bg-blue-100 text-blue-700">
                  {{ empresa.name.charAt(0).toUpperCase() }}
                </div>
                <span class="font-bold text-gray-800">{{ empresa.name }}</span>
              </div>
            </td>
            <td class="text-gray-600">{{ empresa.nif || 'N/A' }}</td>
            <td>
              <span class="plan-badge">
                {{ empresa.subscriptionPlan }}
              </span>
            </td>
            <td>
              <span class="status-badge" :class="empresa.isActive ? 'badge-active' : 'badge-inactive'">
                <div class="status-dot" :class="empresa.isActive ? 'bg-green-500' : 'bg-red-500'"></div>
                {{ empresa.isActive ? 'Ativa' : 'Inativa' }}
              </span>
            </td>
            <td class="text-right">
              <div class="action-buttons">
                <button class="action-btn text-purple hover-bg-purple" @click="impersonate(empresa)" title="Entrar como Gestor">
                  <Eye :size="18" />
                </button>
                <button class="action-btn text-blue hover-bg-blue" @click="openPlanModal(empresa)" title="Editar Plano">
                  <Edit :size="18" />
                </button>
                <button class="action-btn hover-bg-gray" @click="toggleStatus(empresa)" :disabled="togglingId === empresa._id" :class="empresa.isActive ? 'text-orange' : 'text-green'" :title="empresa.isActive ? 'Suspender' : 'Ativar'">
                  <span v-if="togglingId === empresa._id" class="animate-pulse">...</span>
                  <Power v-else :size="18" />
                </button>
                <button class="action-btn text-red hover-bg-red" @click="apagarEmpresa(empresa)" title="Apagar Empresa">
                  <Trash2 :size="18" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      
        
        <div v-else class="p-6 text-center text-muted">
          Ainda não tem empresas registadas.
        </div>
      </div>

      <div v-if="activeTab === 'faturacao'">
        <div v-if="loadingFinance" class="loader-wrapper p-12 text-center">
          <Spinner message="A calcular faturação..." />
        </div>
        <div v-else-if="financeData">
          <div class="stats-grid mb-8 p-6">
            <div class="stat-card surface shadow-sm" style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-color: #bae6fd;">
              <div class="stat-content">
                <h3 class="stat-title text-blue-800">Receita Total</h3>
                <p class="stat-value text-blue-600">MT {{ financeData.totalRevenue.toLocaleString() }}</p>
              </div>
              <div class="stat-icon-wrapper bg-blue-100 text-blue-600">
                <DollarSign :size="32" />
              </div>
            </div>
            
            <div class="stat-card surface shadow-sm" style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-color: #bbf7d0;">
              <div class="stat-content">
                <h3 class="stat-title text-green-800">Faturado Este Mês</h3>
                <p class="stat-value text-green-600">MT {{ financeData.thisMonthRevenue.toLocaleString() }}</p>
              </div>
              <div class="stat-icon-wrapper bg-green-100 text-green-600">
                <TrendingUp :size="32" />
              </div>
            </div>
          </div>

          <h3 class="font-bold text-lg px-6 py-2 border-b">Histórico de Pagamentos (Receitas)</h3>
          <table class="companies-table" v-if="financeData.history && financeData.history.length > 0">
            <thead>
              <tr>
                <th>Data</th>
                <th>Empresa</th>
                <th>Plano</th>
                <th class="text-right">Valor Faturado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in financeData.history" :key="item._id" class="table-row">
                <td>{{ new Date(item.createdAt).toLocaleDateString('pt-PT') }}</td>
                <td class="font-bold">{{ item.company?.name || 'N/A' }}</td>
                <td><span class="plan-badge">{{ item.company?.subscriptionPlan || 'N/A' }}</span></td>
                <td class="text-right font-bold text-green-600">MT {{ item.amount.toLocaleString() }}</td>
              </tr>
            </tbody>
          </table>
          <div v-else class="p-6 text-center text-muted">
            Ainda não há receitas registadas.
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'comprovativos'">
        <table class="companies-table" v-if="receipts.length > 0">
          <thead>
            <tr>
              <th>Empresa</th>
              <th>Data</th>
              <th>Mês Pago</th>
              <th>Valor / Plano</th>
              <th>Comprovativo</th>
              <th class="text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="receipt in receipts" :key="receipt._id" class="table-row">
              <td class="font-bold">{{ receipt.company?.name || 'N/A' }}</td>
              <td>{{ new Date(receipt.createdAt).toLocaleDateString() }}</td>
              <td>
                <span v-if="receipt.billingMonth" class="billing-month-pill">
                  📅 {{ formatBillingMonth(receipt.billingMonth) }}
                </span>
                <span v-else class="text-muted">N/A</span>
              </td>
              <td>{{ receipt.amount }} MT</td>
              <td>
                <a :href="receipt.receiptUrl" target="_blank" class="text-blue flex items-center gap-1 hover:underline">
                  Ver Ficheiro
                </a>
              </td>
              <td class="text-right">
                <div class="action-buttons">
                  <button class="btn-primary" style="padding: 6px 12px; font-size: 0.8rem;" @click="reviewReceipt(receipt._id, 'approved')">Aprovar</button>
                  <button class="btn-secondary" style="padding: 6px 12px; font-size: 0.8rem; color: #DC2626; border-color: #DC2626;" @click="reviewReceipt(receipt._id, 'rejected')">Rejeitar</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else class="p-6 text-center text-muted">
          Não há comprovativos pendentes.
        </div>
      </div>

      <div v-if="activeTab === 'suporte'" class="support-container">
        <div class="inbox-list border-r">
          <div v-if="inbox.length === 0" class="p-4 text-center text-muted text-sm">
            Nenhuma mensagem.
          </div>
          <div 
            v-for="item in inbox" :key="item._id"
            class="inbox-item"
            :class="{ 'active-inbox': selectedCompanyId === item._id }"
            @click="selectCompanyChat(item._id)"
          >
            <div class="inbox-avatar">
              {{ item.companyInfo.name.charAt(0).toUpperCase() }}
              <span v-if="item.unreadCount > 0" class="unread-dot"></span>
            </div>
            <div class="inbox-details">
              <h4 class="font-bold text-sm truncate">{{ item.companyInfo.name }}</h4>
              <span class="text-xs text-muted">{{ new Date(item.lastMessageDate).toLocaleDateString() }}</span>
            </div>
          </div>
        </div>
        
        <div class="chat-area">
          <div v-if="!selectedCompanyId" class="empty-chat">
            <MessageSquare :size="48" class="text-gray-300 mb-4" />
            <p class="text-muted">Selecione uma empresa para ver as mensagens</p>
          </div>
          
          <template v-else>
            <div class="chat-messages" ref="adminMessagesContainer">
              <div 
                v-for="msg in adminMessages" 
                :key="msg._id" 
                class="message-wrapper" 
                :class="msg.sender === 'superadmin' ? 'my-msg' : 'company-msg'"
              >
                <div class="message-bubble">
                  {{ msg.content }}
                </div>
                <span class="msg-time">{{ new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}</span>
              </div>
            </div>
            
            <div class="chat-input-area border-t">
              <div class="quick-admin-replies mb-3 flex gap-2">
                <button class="quick-badge" @click="adminReplyMessageText = 'Olá! Recebemos a sua mensagem. Em que podemos ajudar?'">Saudação</button>
                <button class="quick-badge" @click="adminReplyMessageText = 'O seu problema já foi resolvido. Mais alguma questão?'">Resolvido</button>
                <button class="quick-badge" @click="adminReplyMessageText = 'Vamos analisar a situação e já lhe damos feedback.'">Em Análise</button>
              </div>
              <form @submit.prevent="sendAdminReply" class="flex gap-2">
                <input 
                  type="text" 
                  v-model="adminReplyMessageText" 
                  placeholder="Escreva a resposta..." 
                  class="chat-input flex-1"
                />
                <button type="submit" class="btn-primary flex items-center justify-center p-3 rounded-full" :disabled="!adminReplyMessageText.trim() || sendingReply">
                  <Send :size="18" />
                </button>
              </form>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Analytics / Charts Tab -->
    <div v-if="activeTab === 'analytics'" class="analytics-section">

      <!-- Page Header -->
      <div class="analytics-page-header">
        <div>
          <h2 class="analytics-title">📊 Analytics & Métricas</h2>
          <p class="analytics-subtitle">Visão geral do desempenho da plataforma em tempo real</p>
        </div>
        <div class="analytics-period-badge">
          Últimos 6 meses
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loadingCharts" class="analytics-loading">
        <Spinner message="A calcular métricas da plataforma..." />
      </div>

      <div v-else-if="chartsData" class="analytics-content">

        <!-- ── KPI Cards ── -->
        <div class="analytics-kpi-grid">
          <div class="kpi-card kpi-blue">
            <div class="kpi-top">
              <div class="kpi-icon-wrap kpi-icon-blue"><BarChart2 :size="22" /></div>
              <span class="kpi-trend kpi-trend-up">↑ receita</span>
            </div>
            <p class="kpi-value">MT {{ chartsData.monthlyRevenue.reduce((a,b) => a+b, 0).toLocaleString() }}</p>
            <p class="kpi-label">Receita Total Acumulada</p>
          </div>

          <div class="kpi-card kpi-emerald">
            <div class="kpi-top">
              <div class="kpi-icon-wrap kpi-icon-emerald"><TrendingUp :size="22" /></div>
              <span class="kpi-trend kpi-trend-up">este mês</span>
            </div>
            <p class="kpi-value">MT {{ (chartsData.monthlyRevenue[chartsData.monthlyRevenue.length - 1] || 0).toLocaleString() }}</p>
            <p class="kpi-label">Faturado Este Mês</p>
          </div>

          <div class="kpi-card kpi-purple">
            <div class="kpi-top">
              <div class="kpi-icon-wrap kpi-icon-purple"><Building2 :size="22" /></div>
              <span class="kpi-trend kpi-trend-neutral">ativas</span>
            </div>
            <p class="kpi-value">{{ chartsData.statusCounts[0] }}</p>
            <p class="kpi-label">Empresas Ativas</p>
          </div>

          <div class="kpi-card kpi-amber">
            <div class="kpi-top">
              <div class="kpi-icon-wrap kpi-icon-amber"><Users :size="22" /></div>
              <span class="kpi-trend kpi-trend-up">este mês</span>
            </div>
            <p class="kpi-value">{{ chartsData.newCompanies[chartsData.newCompanies.length - 1] || 0 }}</p>
            <p class="kpi-label">Novas Empresas</p>
          </div>
        </div>

        <!-- ── Section Label ── -->
        <div class="analytics-section-label">
          <span class="section-label-dot bg-blue-500"></span>
          Evolução Temporal
        </div>

        <!-- ── Charts Row 1: Bar + Line ── -->
        <div class="charts-grid-2">
          <div class="chart-panel">
            <div class="chart-panel-header">
              <div class="chart-panel-title-group">
                <div class="chart-panel-icon chart-panel-icon-blue">
                  <BarChart2 :size="16" />
                </div>
                <div>
                  <h3 class="chart-panel-title">Receita Mensal</h3>
                  <p class="chart-panel-sub">Aprovações por mês em MT</p>
                </div>
              </div>
            </div>
            <div class="chart-canvas-area">
              <canvas ref="revenueChart" height="180"></canvas>
            </div>
          </div>

          <div class="chart-panel">
            <div class="chart-panel-header">
              <div class="chart-panel-title-group">
                <div class="chart-panel-icon chart-panel-icon-emerald">
                  <TrendingUp :size="16" />
                </div>
                <div>
                  <h3 class="chart-panel-title">Crescimento da Plataforma</h3>
                  <p class="chart-panel-sub">Novas empresas registadas</p>
                </div>
              </div>
            </div>
            <div class="chart-canvas-area">
              <canvas ref="growthChart" height="180"></canvas>
            </div>
          </div>
        </div>

        <!-- ── Section Label ── -->
        <div class="analytics-section-label">
          <span class="section-label-dot bg-purple-500"></span>
          Distribuição & Composição
        </div>

        <!-- ── Charts Row 2: Donut + Donut ── -->
        <div class="charts-grid-2">
          <div class="chart-panel">
            <div class="chart-panel-header">
              <div class="chart-panel-title-group">
                <div class="chart-panel-icon chart-panel-icon-purple">
                  <Activity :size="16" />
                </div>
                <div>
                  <h3 class="chart-panel-title">Planos de Subscrição</h3>
                  <p class="chart-panel-sub">Distribuição por tipo de plano</p>
                </div>
              </div>
            </div>
            <div class="donut-canvas-area">
              <canvas ref="plansChart"></canvas>
            </div>
          </div>

          <div class="chart-panel">
            <div class="chart-panel-header">
              <div class="chart-panel-title-group">
                <div class="chart-panel-icon chart-panel-icon-emerald">
                  <Building2 :size="16" />
                </div>
                <div>
                  <h3 class="chart-panel-title">Estado das Empresas</h3>
                  <p class="chart-panel-sub">Ativas vs. Suspensas</p>
                </div>
              </div>
            </div>
            <div class="donut-canvas-area">
              <canvas ref="statusChart"></canvas>
            </div>
          </div>
        </div>

      </div>
    </div>
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content surface">
        <div class="modal-header flex justify-between items-center mb-4">
          <h2 class="font-bold text-lg">Adicionar Nova Empresa</h2>
          <button class="btn-icon" @click="closeModal">X</button>
        </div>
        
        <form @submit.prevent="salvarEmpresa" class="modal-form">
          <div class="form-group">
            <label>Nome da Empresa *</label>
            <input type="text" v-model="form.name" required />
          </div>
          <div class="form-group">
            <label>Telefone / Contacto *</label>
            <input type="text" v-model="form.phone" required />
          </div>
          <div class="form-group">
            <label>NIF *</label>
            <input type="text" v-model="form.nif" required />
          </div>
          <div class="form-group">
            <label>Plano *</label>
            <select v-model="form.plan" required class="form-select">
              <option value="trial">Trial</option>
              <option value="pro">Pro</option>
              <option value="premium">Premium</option>
            </select>
          </div>
          
          <div class="divider my-4 border-b"></div>
          <h3 class="font-bold text-sm mb-2">Dados de Acesso (Utilizador)</h3>
          
          <div class="form-group">
            <label>Email do Dono *</label>
            <input type="email" v-model="form.email" required />
          </div>
          <div class="form-group">
            <label>Password de Acesso *</label>
            <input type="password" v-model="form.password" required />
          </div>

          <div v-if="errorMsg" class="error-msg mt-2">{{ errorMsg }}</div>

          <div class="modal-actions mt-6 flex justify-end gap-3">
            <button type="button" class="btn-secondary" @click="closeModal">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="saving">
              {{ saving ? 'A criar...' : 'Criar Empresa' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Editar Plano -->
    <div v-if="showPlanModal" class="modal-overlay" @click.self="closePlanModal">
      <div class="modal-content surface">
        <div class="modal-header flex justify-between items-center mb-4">
          <h2 class="font-bold text-lg">Alterar Plano</h2>
          <button class="btn-icon" @click="closePlanModal">X</button>
        </div>
        
        <form @submit.prevent="salvarPlano" class="modal-form">
          <div class="form-group">
            <label>Novo Plano *</label>
            <select v-model="planForm.plan" required class="form-select">
              <option value="trial">Trial</option>
              <option value="pro">Pro</option>
              <option value="premium">Premium</option>
            </select>
          </div>

          <div class="modal-actions mt-6 flex justify-end gap-3">
            <button type="button" class="btn-secondary" @click="closePlanModal">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="saving">
              {{ saving ? 'A guardar...' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
    <!-- Modal System Settings -->
    <div v-if="showSystemSettingsModal" class="modal-overlay" @click.self="closeSystemSettingsModal">
      <div class="modal-content surface">
        <div class="modal-header flex justify-between items-center mb-4">
          <h2 class="font-bold text-lg">Definições do Sistema</h2>
          <button class="btn-icon" @click="closeSystemSettingsModal">X</button>
        </div>
        
        <form @submit.prevent="salvarSystemSettings" class="modal-form">
          <div class="form-group">
            <label>Link de Checkout Automático (Stripe, Pagaqui, etc.)</label>
            <input type="url" v-model="systemForm.checkout_link" placeholder="https://..." />
            <small class="text-muted mt-1">Este link aparecerá nas empresas para pagamento automático online.</small>
          </div>

          <div class="divider my-4 border-b"></div>
          <h3 class="font-bold text-sm mb-2 text-indigo-600">Preço da Subscrição</h3>

          <div class="form-group">
            <label>Preço do Plano Mensal (MT) *</label>
            <input type="number" v-model="systemForm.monthly_plan_price" placeholder="95" min="1" required />
            <small class="text-muted mt-1">Valor cobrado mensalmente a cada empresa.</small>
          </div>

          <div class="divider my-4 border-b"></div>
          <h3 class="font-bold text-sm mb-2 text-blue-600">Dados para Pagamento Manual</h3>

          <div class="form-group">
            <label>Número M-Pesa</label>
            <input type="text" v-model="systemForm.mpesa_number" placeholder="Ex: +258 84 123 4567" />
          </div>

          <div class="form-group">
            <label>Número e-Mola</label>
            <input type="text" v-model="systemForm.emola_number" placeholder="Ex: +258 86 123 4567" />
          </div>

          <div class="form-group">
            <label>Conta Bancária / NIB (BIM ou outro)</label>
            <input type="text" v-model="systemForm.bank_account" placeholder="Ex: 00123456789" />
          </div>

          <div class="form-group">
            <label>Nome do Titular da Conta</label>
            <input type="text" v-model="systemForm.account_holder" placeholder="Ex: Etako Technologies" />
          </div>

          <div class="divider my-4 border-b"></div>
          <h3 class="font-bold text-sm mb-2 text-green-600">Apoio ao Cliente</h3>

          <div class="form-group">
            <label>Número de WhatsApp para Suporte</label>
            <input type="text" v-model="systemForm.support_whatsapp" placeholder="Ex: 258840000000 (Sem o +)" />
            <small class="text-muted mt-1">Coloque apenas os números, código do país incluído.</small>
          </div>

          <div class="modal-actions mt-6 flex justify-end gap-3">
            <button type="button" class="btn-secondary" @click="closeSystemSettingsModal">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="saving">
              {{ saving ? 'A guardar...' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue';
import { Building2, Activity, Users, Edit, Power, Trash2, MessageSquare, Send, Eye, DollarSign, TrendingUp, BarChart2 } from '@lucide/vue';
import Spinner from '../components/Spinner.vue';
import { useToast } from '../composables/useToast';
import api from '../api';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

const toast = useToast();
const empresas = ref([]);
const receipts = ref([]);
const stats = ref(null);
const logoErrors = ref({});
const onLogoError = (id) => {
  logoErrors.value[id] = true;
};

const financeData = ref(null);
const loadingFinance = ref(false);

// Helper: formatar 'YYYY-MM' para texto legível ex: 'julho de 2026'
const formatBillingMonth = (ym) => {
  if (!ym) return '—';
  const [year, month] = ym.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' });
};

// Charts
const chartsData = ref(null);
const loadingCharts = ref(false);
const revenueChart = ref(null);
const growthChart = ref(null);
const plansChart = ref(null);
const statusChart = ref(null);
let revenueChartInstance = null;
let growthChartInstance = null;
let plansChartInstance = null;
let statusChartInstance = null;

const inbox = ref([]);
const adminMessages = ref([]);
const selectedCompanyId = ref(null);
const adminReplyMessageText = ref('');
const sendingReply = ref(false);
const adminMessagesContainer = ref(null);

const showModal = ref(false);
const showPlanModal = ref(false);
const showSystemSettingsModal = ref(false);
const saving = ref(false);
const errorMsg = ref('');
const togglingId = ref(null);
const editingCompany = ref(null);

const planForm = ref({ plan: 'trial' });

const form = ref({
  name: '',
  phone: '',
  nif: '',
  plan: 'pro',
  email: '',
  password: ''
});

const systemForm = ref({ 
  checkout_link: '',
  monthly_plan_price: '95',
  mpesa_number: '',
  emola_number: '',
  bank_account: '',
  account_holder: '',
  support_whatsapp: ''
});

const loadEmpresas = async () => {
  loading.value = true;
  try {
    const { data } = await api.get('/dashboard/superadmin');
    empresas.value = data.empresas;
    stats.value = data.stats;
    
    // Load receipts
    const receiptsRes = await api.get('/admin/receipts/pending');
    receipts.value = receiptsRes.data;
    
    // Load inbox silently
    const inboxRes = await api.get('/support/admin/inbox');
    inbox.value = inboxRes.data;
  } catch (error) {
    console.error('Error loading data', error);
  } finally {
    loading.value = false;
  }
};

const loadFinance = async () => {
  loadingFinance.value = true;
  try {
    const { data } = await api.get('/admin/finance');
    financeData.value = data;
  } catch (error) {
    toast.error('Erro ao carregar dados financeiros');
  } finally {
    loadingFinance.value = false;
  }
};

const loadCharts = async () => {
  if (chartsData.value) {
    // Already loaded, just re-render
    await nextTick();
    renderCharts();
    return;
  }
  loadingCharts.value = true;
  try {
    const { data } = await api.get('/admin/charts');
    chartsData.value = data;
    await nextTick();
    renderCharts();
  } catch (error) {
    toast.error('Erro ao carregar dados dos gráficos');
  } finally {
    loadingCharts.value = false;
  }
};

const renderCharts = () => {
  const d = chartsData.value;
  if (!d) return;

  const commonGridColor = 'rgba(148,163,184,0.12)';
  const commonTickColor = '#94a3b8';
  const fontFamily = "'Inter', 'system-ui', sans-serif";

  // --- Revenue Bar Chart ---
  if (revenueChartInstance) revenueChartInstance.destroy();
  if (revenueChart.value) {
    revenueChartInstance = new Chart(revenueChart.value, {
      type: 'bar',
      data: {
        labels: d.monthLabels,
        datasets: [{
          label: 'Receita (MT)',
          data: d.monthlyRevenue,
          backgroundColor: 'rgba(37,99,235,0.15)',
          borderColor: '#2563EB',
          borderWidth: 2,
          borderRadius: 10,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: { label: ctx => `MT ${ctx.raw.toLocaleString()}` }
          }
        },
        scales: {
          x: { grid: { color: commonGridColor }, ticks: { color: commonTickColor, font: { family: fontFamily } } },
          y: { grid: { color: commonGridColor }, ticks: { color: commonTickColor, font: { family: fontFamily }, callback: v => `MT ${v}` }, beginAtZero: true }
        }
      }
    });
  }

  // --- Growth Line Chart ---
  if (growthChartInstance) growthChartInstance.destroy();
  if (growthChart.value) {
    growthChartInstance = new Chart(growthChart.value, {
      type: 'line',
      data: {
        labels: d.monthLabels,
        datasets: [{
          label: 'Novas Empresas',
          data: d.newCompanies,
          borderColor: '#10B981',
          backgroundColor: 'rgba(16,185,129,0.08)',
          borderWidth: 2.5,
          pointBackgroundColor: '#10B981',
          pointRadius: 5,
          tension: 0.4,
          fill: true,
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { grid: { color: commonGridColor }, ticks: { color: commonTickColor, font: { family: fontFamily } } },
          y: { grid: { color: commonGridColor }, ticks: { color: commonTickColor, font: { family: fontFamily }, stepSize: 1 }, beginAtZero: true }
        }
      }
    });
  }

  // --- Plans Doughnut Chart ---
  if (plansChartInstance) plansChartInstance.destroy();
  if (plansChart.value) {
    const planColors = ['#2563EB', '#F59E0B', '#10B981', '#7C3AED', '#EF4444'];
    plansChartInstance = new Chart(plansChart.value, {
      type: 'doughnut',
      data: {
        labels: d.planLabels.length ? d.planLabels : ['Sem dados'],
        datasets: [{
          data: d.planCounts.length ? d.planCounts : [1],
          backgroundColor: planColors.slice(0, d.planLabels.length || 1),
          borderColor: '#ffffff',
          borderWidth: 3,
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        cutout: '65%',
        plugins: {
          legend: { position: 'bottom', labels: { color: '#475569', font: { family: fontFamily }, padding: 16 } }
        }
      }
    });
  }

  // --- Status Doughnut Chart ---
  if (statusChartInstance) statusChartInstance.destroy();
  if (statusChart.value) {
    statusChartInstance = new Chart(statusChart.value, {
      type: 'doughnut',
      data: {
        labels: ['Ativas', 'Suspensas'],
        datasets: [{
          data: d.statusCounts,
          backgroundColor: ['#10B981', '#EF4444'],
          borderColor: '#ffffff',
          borderWidth: 3,
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        cutout: '65%',
        plugins: {
          legend: { position: 'bottom', labels: { color: '#475569', font: { family: fontFamily }, padding: 16 } }
        }
      }
    });
  }
};

const totalUnread = computed(() => {
  return inbox.value.reduce((acc, item) => acc + item.unreadCount, 0);
});

const loadInbox = async () => {
  try {
    const inboxRes = await api.get('/support/admin/inbox');
    inbox.value = inboxRes.data;
  } catch (error) {
    console.error('Erro ao carregar inbox');
  }
};

const selectCompanyChat = async (companyId) => {
  selectedCompanyId.value = companyId;
  try {
    const { data } = await api.get(`/support/admin/company/${companyId}`);
    adminMessages.value = data;
    loadInbox(); // Refresh unread count
    
    nextTick(() => {
      if (adminMessagesContainer.value) {
        adminMessagesContainer.value.scrollTop = adminMessagesContainer.value.scrollHeight;
      }
    });
  } catch (error) {
    toast.error('Erro ao carregar mensagens');
  }
};

const sendAdminReply = async () => {
  if (!adminReplyMessageText.value.trim() || !selectedCompanyId.value) return;
  
  sendingReply.value = true;
  try {
    await api.post(`/support/admin/company/${selectedCompanyId.value}`, {
      content: adminReplyMessageText.value
    });
    
    adminReplyMessageText.value = '';
    // Reload chat
    await selectCompanyChat(selectedCompanyId.value);
  } catch (error) {
    toast.error('Erro ao enviar mensagem');
  } finally {
    sendingReply.value = false;
  }
};

const openModal = () => {
  errorMsg.value = '';
  form.value = { name: '', phone: '', nif: '', plan: 'pro', email: '', password: '' };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const salvarEmpresa = async () => {
  saving.value = true;
  errorMsg.value = '';
  try {
    await api.post('/admin/companies', form.value);
    await loadEmpresas();
    closeModal();
  } catch (error) {
    errorMsg.value = error.response?.data?.message || 'Erro ao criar empresa.';
  } finally {
    saving.value = false;
  }
};

const toggleStatus = async (empresa) => {
  if (confirm(`Tem a certeza que deseja ${empresa.isActive ? 'suspender' : 'ativar'} a empresa ${empresa.name}?`)) {
    togglingId.value = empresa._id;
    try {
      await api.put(`/admin/companies/${empresa._id}/toggle-status`);
      await loadEmpresas();
    } catch (error) {
      alert('Erro ao alterar estado.');
    } finally {
      togglingId.value = null;
    }
  }
};

const openPlanModal = (empresa) => {
  editingCompany.value = empresa;
  planForm.value.plan = empresa.subscriptionPlan;
  showPlanModal.value = true;
};

const closePlanModal = () => {
  showPlanModal.value = false;
  editingCompany.value = null;
};

const salvarPlano = async () => {
  saving.value = true;
  try {
    await api.put(`/admin/companies/${editingCompany.value._id}/plan`, planForm.value);
    await loadEmpresas();
    closePlanModal();
  } catch (error) {
    alert('Erro ao atualizar plano.');
  } finally {
    saving.value = false;
  }
};

const apagarEmpresa = async (empresa) => {
  if (confirm(`ATENÇÃO: Deseja apagar PERMANENTEMENTE a empresa ${empresa.name} e todos os seus dados (clientes, pagamentos, empréstimos)? ESTA AÇÃO NÃO PODE SER DESFEITA.`)) {
    try {
      await api.delete(`/admin/companies/${empresa._id}`);
      await loadEmpresas();
      toast.success('Empresa apagada!');
    } catch (error) {
      toast.error('Erro ao apagar empresa.');
    }
  }
};

const openSystemSettingsModal = async () => {
  try {
    const { data } = await api.get('/system/settings');
    systemForm.value.checkout_link = data.checkout_link || '';
    systemForm.value.monthly_plan_price = data.monthly_plan_price || '95';
    systemForm.value.mpesa_number = data.mpesa_number || '';
    systemForm.value.emola_number = data.emola_number || '';
    systemForm.value.bank_account = data.bank_account || '';
    systemForm.value.account_holder = data.account_holder || '';
    systemForm.value.support_whatsapp = data.support_whatsapp || '';
    showSystemSettingsModal.value = true;
  } catch (error) {
    toast.error('Erro ao carregar definições de sistema.');
  }
};

const closeSystemSettingsModal = () => {
  showSystemSettingsModal.value = false;
};

const salvarSystemSettings = async () => {
  saving.value = true;
  try {
    // Send array of settings
    const settingsArray = [
      { key: 'checkout_link', value: systemForm.value.checkout_link },
      { key: 'monthly_plan_price', value: systemForm.value.monthly_plan_price || '95' },
      { key: 'mpesa_number', value: systemForm.value.mpesa_number },
      { key: 'emola_number', value: systemForm.value.emola_number },
      { key: 'bank_account', value: systemForm.value.bank_account },
      { key: 'account_holder', value: systemForm.value.account_holder },
      { key: 'support_whatsapp', value: systemForm.value.support_whatsapp }
    ];
    
    await api.put('/admin/system/settings', { settings: settingsArray });
    toast.success('Definições guardadas com sucesso.');
    closeSystemSettingsModal();
  } catch (error) {
    toast.error('Erro ao guardar definições.');
  } finally {
    saving.value = false;
  }
};

const reviewReceipt = async (id, status) => {
  try {
    await api.put(`/admin/receipts/${id}/review`, { status });
    toast.success(`Comprovativo ${status === 'approved' ? 'Aprovado' : 'Rejeitado'}!`);
    await loadEmpresas();
    
    // Atualizar dados financeiros em background para manter sincronia
    if (activeTab.value === 'faturacao' || financeData.value) {
      const { data } = await api.get('/admin/finance');
      financeData.value = data;
    }
  } catch (error) {
    toast.error('Erro ao processar comprovativo.');
  }
};

const impersonate = async (empresa) => {
  try {
    const { data } = await api.get(`/admin/companies/${empresa._id}/impersonate`);
    
    // Backup superadmin info
    localStorage.setItem('superadmin_token', localStorage.getItem('token'));
    localStorage.setItem('superadmin_user', localStorage.getItem('user'));
    
    // Set new token and user
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify({
      _id: data._id,
      email: data.email,
      role: data.role,
      company: data.company
    }));
    
    toast.success(`A aceder à conta da ${empresa.name}...`);
    // Full reload to reset auth state completely in the app
    window.location.href = '/app';
  } catch (error) {
    toast.error(error.response?.data?.message || 'Erro ao aceder à empresa.');
  }
};

onMounted(() => {
  loadEmpresas();
});
</script>

<style scoped>
.tab-btn {
  background: none;
  border: none;
  padding: 10px 16px;
  font-weight: 600;
  color: var(--text-muted);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  display: flex;
  align-items: center;
  gap: 8px;
}
.tab-btn.active {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
}
.badge-count {
  background-color: #EF4444;
  color: white;
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 0.75rem;
}
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

/* System Banner */
.system-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  margin-bottom: 32px;
  border-left: 6px solid #10B981;
  border-radius: 0 16px 16px 0;
}
.banner-content {
  display: flex;
  align-items: center;
  gap: 20px;
}
.banner-icon-bg {
  background-color: #DCFCE7;
  color: #16A34A;
  padding: 14px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.banner-text h3 {
  margin: 0 0 4px 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #1F2937;
}
.banner-text p {
  margin: 0;
  font-size: 0.9rem;
  color: #6B7280;
}
.banner-badge {
  background-color: #F0FDF4;
  color: #16A34A;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 20px;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}
.stat-card {
  padding: 30px;
  border-radius: 20px;
  border: 1px solid rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.stat-title {
  margin: 0 0 8px 0;
  font-size: 0.85rem;
  font-weight: 600;
  color: #6B7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.stat-value {
  margin: 0;
  font-size: 2.5rem;
  font-weight: 800;
}
.stat-icon-wrapper {
  padding: 16px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.text-gray-800 { color: #1F2937; }
.text-green-500 { color: #10B981; }
.text-purple-600 { color: #9333EA; }
.bg-blue-100 { background-color: #DBEAFE; }
.bg-green-100 { background-color: #DCFCE7; }
.bg-purple-100 { background-color: #F3E8FF; }

/* Table styles */
.companies-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.companies-table th, .companies-table td {
  padding: 20px 24px;
  text-align: left;
  border-bottom: 1px solid #f1f5f9;
}

.table-row:hover {
  background-color: #f8fafc;
}

.company-name-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #F1F5F9;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748B;
  font-weight: 700;
  font-size: 1.1rem;
}

.plan-badge {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: 1px solid #E2E8F0;
  color: #475569;
}

.status-badge {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;
}
.bg-green-500 { background-color: #10B981; }
.bg-red-500 { background-color: #EF4444; }

.badge-active {
  background-color: #DCFCE7;
  color: #16A34A;
}

.badge-inactive {
  background-color: #FEE2E2;
  color: #DC2626;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.text-green { color: #16A34A; }

.action-btn {
  background: transparent;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-muted);
}
.action-btn:hover { transform: translateY(-2px); }
.text-blue { color: #3B82F6; }
.text-red { color: #EF4444; }
.text-green { color: #10B981; }
.text-orange { color: #F97316; }

.hover-bg-blue:hover { background-color: #DBEAFE; color: #1D4ED8; }
.hover-bg-red:hover { background-color: #FEE2E2; color: #B91C1C; }
.hover-bg-gray:hover { background-color: #F1F5F9; color: #0F172A; }

.action-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

/* Modal Styles */
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
  max-width: 500px;
  padding: 24px;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-main);
}

.form-group input, .form-select {
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-family: inherit;
  outline: none;
  background-color: #fff;
}
.form-group input:focus, .form-select:focus { border-color: var(--primary-color); }

.error-msg {
  color: #DC2626;
  font-size: 0.875rem;
}

.border-b { border-bottom: 1px solid var(--border-color); }

.loader-wrapper {
  padding: 60px 0;
}

/* Support Chat Styles */
.support-container {
  display: flex;
  height: 600px;
}
.inbox-list {
  width: 280px;
  background-color: #F8FAFC;
  overflow-y: auto;
}
.inbox-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  cursor: pointer;
  border-bottom: 1px solid var(--border-color);
  transition: background-color 0.2s;
}
.inbox-item:hover {
  background-color: #F1F5F9;
}
.active-inbox {
  background-color: #E0E7FF;
  border-left: 4px solid #4F46E5;
}
.inbox-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #CBD5E1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #475569;
  position: relative;
}
.unread-dot {
  position: absolute;
  top: 0;
  right: 0;
  width: 12px;
  height: 12px;
  background-color: #EF4444;
  border-radius: 50%;
  border: 2px solid white;
}
.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: white;
}
.empty-chat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background-color: #F8FAFC;
}
.message-wrapper {
  display: flex;
  flex-direction: column;
  max-width: 70%;
}
.my-msg {
  align-self: flex-end;
  align-items: flex-end;
}
.company-msg {
  align-self: flex-start;
  align-items: flex-start;
}
.message-bubble {
  padding: 12px 16px;
  border-radius: 16px;
  font-size: 0.95rem;
}
.my-msg .message-bubble {
  background-color: #3B82F6;
  color: white;
  border-bottom-right-radius: 4px;
}
.company-msg .message-bubble {
  background-color: white;
  color: var(--text-main);
  border: 1px solid var(--border-color);
  border-bottom-left-radius: 4px;
}
.msg-time {
  font-size: 0.7rem;
  color: var(--text-muted);
  margin-top: 4px;
}
.chat-input-area {
  padding: 16px;
  background-color: white;
}
.chat-input {
  padding: 12px 16px;
  border: 1px solid var(--border-color);
  border-radius: 24px;
  outline: none;
}
.quick-badge {
  font-size: 0.75rem;
  padding: 4px 10px;
  background-color: #F1F5F9;
  border-radius: 12px;
  cursor: pointer;
  border: 1px solid transparent;
}
.quick-badge:hover {
  border-color: #3B82F6;
  color: #3B82F6;
}

/* Mobile Responsiveness for Support Chat */
@media (max-width: 768px) {
  .support-container {
    flex-direction: column;
    height: auto;
  }
  .inbox-list {
    width: 100%;
    height: 200px;
    border-bottom: 1px solid var(--border-color);
  }
  .chat-area {
    height: 450px;
  }
  .message-wrapper {
    max-width: 90%;
  }
  .analytics-kpi-grid {
    grid-template-columns: 1fr 1fr;
  }
  .charts-grid-2 {
    grid-template-columns: 1fr;
  }
}

/* ═══════════════════════════════════════════
   ANALYTICS SECTION — Premium Styles
═══════════════════════════════════════════ */
.analytics-section {
  padding-bottom: 40px;
}

.analytics-page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 28px;
  flex-wrap: wrap;
  gap: 16px;
}

.analytics-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #0F172A;
  margin: 0 0 4px 0;
}

.analytics-subtitle {
  font-size: 0.875rem;
  color: #64748B;
  margin: 0;
}

.analytics-period-badge {
  background: linear-gradient(135deg, #EFF6FF, #DBEAFE);
  color: #2563EB;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 6px 16px;
  border-radius: 20px;
  border: 1px solid #BFDBFE;
  white-space: nowrap;
}

.analytics-loading {
  background: white;
  border-radius: 20px;
  padding: 64px;
  text-align: center;
  border: 1px solid #E2E8F0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

.analytics-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* ─── KPI Cards ─── */
.analytics-kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
}

.kpi-card {
  border-radius: 20px;
  padding: 22px 24px;
  border: 1px solid transparent;
  position: relative;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.kpi-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 28px rgba(0,0,0,0.08);
}

.kpi-card::before {
  content: '';
  position: absolute;
  top: -40px;
  right: -40px;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  opacity: 0.08;
}

.kpi-blue { background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%); border-color: #BFDBFE; }
.kpi-blue::before { background: #2563EB; }
.kpi-emerald { background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%); border-color: #BBF7D0; }
.kpi-emerald::before { background: #10B981; }
.kpi-purple { background: linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%); border-color: #DDD6FE; }
.kpi-purple::before { background: #7C3AED; }
.kpi-amber { background: linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%); border-color: #FDE68A; }
.kpi-amber::before { background: #F59E0B; }

.kpi-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.kpi-icon-wrap {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.kpi-icon-blue { background: rgba(37,99,235,0.12); color: #2563EB; }
.kpi-icon-emerald { background: rgba(16,185,129,0.12); color: #059669; }
.kpi-icon-purple { background: rgba(124,58,237,0.12); color: #7C3AED; }
.kpi-icon-amber { background: rgba(245,158,11,0.12); color: #D97706; }

.kpi-trend {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 3px 8px;
  border-radius: 10px;
}

.kpi-trend-up { background: rgba(16,185,129,0.12); color: #059669; }
.kpi-trend-neutral { background: rgba(99,102,241,0.12); color: #6366F1; }

.kpi-value {
  font-size: 1.75rem;
  font-weight: 900;
  color: #0F172A;
  line-height: 1;
  margin: 0 0 6px 0;
  letter-spacing: -0.5px;
}

.kpi-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: #64748B;
  margin: 0;
}

/* ─── Section Labels ─── */
.analytics-section-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #64748B;
  margin-bottom: -8px;
}

.section-label-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

/* ─── Chart Panels ─── */
.charts-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.chart-panel {
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  transition: box-shadow 0.2s ease;
}

.chart-panel:hover {
  box-shadow: 0 6px 20px rgba(0,0,0,0.06);
}

.chart-panel-header {
  padding: 20px 24px 16px;
  border-bottom: 1px solid #F1F5F9;
}

.chart-panel-title-group {
  display: flex;
  align-items: center;
  gap: 14px;
}

.chart-panel-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.chart-panel-icon-blue { background: #EFF6FF; color: #2563EB; }
.chart-panel-icon-emerald { background: #F0FDF4; color: #059669; }
.chart-panel-icon-purple { background: #F5F3FF; color: #7C3AED; }

.chart-panel-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: #1E293B;
  margin: 0 0 2px 0;
}

.chart-panel-sub {
  font-size: 0.75rem;
  color: #94A3B8;
  margin: 0;
}

.chart-canvas-area {
  padding: 20px 24px 24px;
}

.donut-canvas-area {
  padding: 20px 40px 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  max-height: 280px;
}

.billing-month-pill {
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
