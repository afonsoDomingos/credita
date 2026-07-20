<template>
  <div class="admin-dashboard">
    <div class="header-actions flex justify-between items-center mb-6">
      <h2 class="text-xl font-bold">Gestão de Empresas (Inquilinos)</h2>
      <button class="btn-primary" @click="openModal">Adicionar Nova Empresa</button>
    </div>

    <div v-if="stats" class="stats-grid mb-6">
      <div class="stat-card surface">
        <h3 class="text-muted text-sm font-semibold mb-1">Total Empresas</h3>
        <p class="text-3xl font-bold">{{ stats.totalCompanies }}</p>
      </div>
      <div class="stat-card surface">
        <h3 class="text-muted text-sm font-semibold mb-1">Empresas Ativas</h3>
        <p class="text-3xl font-bold text-green-500">{{ stats.activeCompanies }}</p>
      </div>
      <div class="stat-card surface">
        <h3 class="text-muted text-sm font-semibold mb-1">Total Clientes Globais</h3>
        <p class="text-3xl font-bold text-blue-500">{{ stats.totalClients }}</p>
      </div>
    </div>

    <div class="surface p-0 overflow-hidden">
      <div v-if="loading" class="p-6 text-center text-muted">
        A carregar empresas...
      </div>
      
      <table class="companies-table" v-else-if="empresas.length > 0">
        <thead>
          <tr>
            <th>Nome da Empresa</th>
            <th>NIF</th>
            <th>Plano</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="empresa in empresas" :key="empresa._id">
            <td class="font-medium">{{ empresa.name }}</td>
            <td>{{ empresa.nif || 'N/A' }}</td>
            <td class="capitalize">{{ empresa.subscriptionPlan }}</td>
            <td>
              <span class="badge" :class="empresa.isActive ? 'badge-active' : 'badge-inactive'">
                {{ empresa.isActive ? 'Ativa' : 'Inativa' }}
              </span>
            </td>
            <td>
              <button class="btn-text" @click="openPlanModal(empresa)">Editar Plano</button>
              <button class="btn-text" @click="toggleStatus(empresa)" :disabled="togglingId === empresa._id" :class="empresa.isActive ? 'text-red' : 'text-green'">
                <span v-if="togglingId === empresa._id">...</span>
                <span v-else>{{ empresa.isActive ? 'Suspender' : 'Ativar' }}</span>
              </button>
              <button class="btn-text text-red" @click="apagarEmpresa(empresa)" title="Apagar Empresa">Apagar</button>
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
  form.value = { name: '', nif: '', plan: 'pro', email: '', password: '' };
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
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}
.stat-card {
  padding: 24px;
}
.text-green-500 { color: #10B981; }
.text-blue-500 { color: #3B82F6; }

.companies-table {
  width: 100%;
  border-collapse: collapse;
}

.companies-table th, .companies-table td {
  padding: 16px 20px;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.companies-table th {
  background-color: var(--bg-body);
  color: var(--text-muted);
  font-weight: 600;
  font-size: 0.875rem;
}

.capitalize {
  text-transform: capitalize;
}

.badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge-active {
  background-color: #DCFCE7;
  color: #16A34A;
}

.badge-inactive {
  background-color: #FEE2E2;
  color: #DC2626;
}

.text-green { color: #16A34A; }

.btn-text {
  background: none;
  border: none;
  color: var(--primary-color);
  font-weight: 500;
  cursor: pointer;
  margin-right: 12px;
}
.btn-text.text-red {
  color: #DC2626;
}
.btn-text:disabled { opacity: 0.5; cursor: not-allowed; }

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
</style>
