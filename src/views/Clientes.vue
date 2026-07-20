<template>
  <div class="clientes-page">
    <div class="header-actions flex justify-between items-center mb-6">
      <div>
        <h1 class="text-xl font-bold">Clientes</h1>
        <p class="text-muted text-sm">Faça a gestão dos seus clientes (criar, editar, remover).</p>
      </div>
      <button class="btn-primary flex items-center gap-2" @click="openModal()">
        <Plus :size="16" />
        Novo Cliente
      </button>
    </div>

    <!-- Tabela de Clientes -->
    <div class="surface p-0 overflow-hidden">
      <div v-if="loading" class="loader-wrapper">
        <Spinner message="A carregar clientes da base de dados..." />
      </div>
      
      <table v-else-if="clientes.length > 0" class="data-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>NIF/BI</th>
            <th>Telefone</th>
            <th>Morada</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cliente in clientes" :key="cliente._id">
            <td class="font-medium">
              <div class="flex items-center gap-3">
                <div class="avatar-sm bg-primary-light text-primary font-bold flex items-center justify-center rounded-full">
                  {{ cliente.name.charAt(0) }}
                </div>
                {{ cliente.name }}
              </div>
            </td>
            <td>{{ cliente.idCard }}</td>
            <td>{{ cliente.phone }}</td>
            <td>{{ cliente.address || '-' }}</td>
            <td>
              <button class="btn-icon text-blue" @click="openModal(cliente)" title="Editar">
                <Edit2 :size="18" />
              </button>
              <button class="btn-icon text-red ml-2" @click="apagarCliente(cliente._id)" title="Apagar">
                <Trash2 :size="18" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div v-else class="empty-state">
        <div class="empty-icon-wrapper">
          <Users :size="48" class="text-gray-400" />
        </div>
        <h3 class="empty-title">Nenhum cliente cadastrado</h3>
        <p class="empty-desc">A sua base de dados de clientes está vazia. Comece por adicionar o seu primeiro cliente.</p>
        <button class="btn-primary mt-4" @click="openModal">
          <Plus :size="18" style="display:inline; margin-right:8px;" /> Adicionar Cliente
        </button>
      </div>
    </div>

    <!-- Modal Adicionar/Editar Cliente -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content surface">
        <div class="modal-header flex justify-between items-center mb-4">
          <h2 class="font-bold text-lg">{{ isEditing ? 'Editar Cliente' : 'Novo Cliente' }}</h2>
          <button class="btn-icon" @click="closeModal"><X :size="20" /></button>
        </div>
        
        <form @submit.prevent="salvarCliente" class="modal-form">
          <div class="form-group">
            <label>Nome Completo *</label>
            <input type="text" v-model="form.name" required />
          </div>
          <div class="form-group">
            <label>NIF / BI *</label>
            <input type="text" v-model="form.idCard" required />
          </div>
          <div class="form-group">
            <label>Telefone *</label>
            <input type="text" v-model="form.phone" required />
          </div>
          <div class="form-group">
            <label>Morada</label>
            <input type="text" v-model="form.address" />
          </div>

          <div v-if="errorMsg" class="error-msg mt-2">{{ errorMsg }}</div>

          <div class="modal-actions mt-6 flex justify-end gap-3">
            <button type="button" class="btn-secondary" @click="closeModal">Cancelar</button>
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
import { Plus, Edit2, Trash2, X } from '@lucide/vue';
import Spinner from '../components/Spinner.vue';
import { useToast } from '../composables/useToast';
import api from '../api';

const clientes = ref([]);
const toast = useToast();
const loading = ref(true);
const showModal = ref(false);
const isEditing = ref(false);
const saving = ref(false);
const errorMsg = ref('');

const form = ref({
  id: null,
  name: '',
  idCard: '',
  phone: '',
  address: ''
});

const loadClientes = async () => {
  try {
    const { data } = await api.get('/clients');
    clientes.value = data;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const openModal = (cliente = null) => {
  errorMsg.value = '';
  if (cliente) {
    isEditing.value = true;
    form.value = {
      id: cliente._id,
      name: cliente.name,
      idCard: cliente.idCard,
      phone: cliente.phone,
      address: cliente.address || ''
    };
  } else {
    isEditing.value = false;
    form.value = { id: null, name: '', idCard: '', phone: '', address: '' };
  }
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const salvarCliente = async () => {
  saving.value = true;
  errorMsg.value = '';
  try {
    if (isEditing.value) {
      await api.put(`/clients/${form.value.id}`, form.value);
      toast.success('Cliente atualizado com sucesso!');
    } else {
      await api.post('/clients', form.value);
      toast.success('Novo cliente cadastrado com sucesso!');
    }
    await loadClientes();
    closeModal();
  } catch (error) {
    toast.error(error.response?.data?.message || 'Erro ao guardar cliente.');
    errorMsg.value = error.response?.data?.message || 'Erro ao guardar cliente.';
  } finally {
    saving.value = false;
  }
};

const apagarCliente = async (cliente) => {
  if (confirm(`Tem a certeza que deseja apagar o cliente ${cliente.name}?`)) {
    try {
      await api.delete(`/clients/${cliente._id}`);
      toast.success('Cliente removido com sucesso!');
      await loadClientes();
    } catch (error) {
      toast.error('Erro ao apagar cliente.');
    }
  }
};

onMounted(() => {
  loadClientes();
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
}

.data-table th {
  background-color: var(--bg-body);
  color: var(--text-muted);
  font-weight: 600;
  font-size: 0.875rem;
}

.avatar-sm {
  width: 32px;
  height: 32px;
}
.bg-primary-light { background-color: #EFF6FF; }

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

.form-group input {
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-family: inherit;
  outline: none;
}
.form-group input:focus { border-color: var(--primary-color); }

.form-select {
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  outline: none;
  font-family: inherit;
  background-color: #fff;
}
.form-select:focus { border-color: var(--primary-color); }

.error-msg {
  color: #DC2626;
  font-size: 0.875rem;
}

.loader-wrapper {
  padding: 60px 0;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon-wrapper {
  width: 80px;
  height: 80px;
  background-color: #F1F5F9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  color: #94A3B8;
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-main);
  margin: 0 0 8px 0;
}

.empty-desc {
  color: var(--text-muted);
  max-width: 400px;
  margin: 0 0 24px 0;
  line-height: 1.5;
}

.text-gray-400 { color: #94A3B8; }
.mt-4 { margin-top: 16px; }

.btn-icon.text-blue { color: #2563EB; }
.btn-icon.text-blue:hover { background-color: #DBEAFE; }
.btn-icon.text-red { color: #DC2626; }
.btn-icon.text-red:hover { background-color: #FEE2E2; }
</style>
