<template>
  <div class="admin-dashboard">
    <div class="header-actions">
      <h2 class="page-title">Gestão de Empresas (Inquilinos)</h2>
      <button class="btn-primary" @click="openModal">Adicionar Nova Empresa</button>
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

    <div v-if="stats" class="stats-grid mb-8">
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
              <div class="company-name-cell">
                <div class="avatar-circle">
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

    <!-- Modal Nova Empresa -->
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

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Building2, Activity, Users, Edit, Power, Trash2 } from '@lucide/vue';
import Spinner from '../components/Spinner.vue';
import api from '../api';

const empresas = ref([]);
const stats = ref(null);
const loading = ref(true);

const showModal = ref(false);
const showPlanModal = ref(false);
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

const loadEmpresas = async () => {
  try {
    const { data } = await api.get('/dashboard/superadmin');
    empresas.value = data.empresas;
    stats.value = data.stats;
  } catch (error) {
    console.error('Error loading companies', error);
  } finally {
    loading.value = false;
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
    } catch (error) {
      alert('Erro ao apagar empresa.');
    }
  }
};

onMounted(() => {
  loadEmpresas();
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
</style>
