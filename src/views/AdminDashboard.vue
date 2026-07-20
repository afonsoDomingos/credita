<template>
  <div class="admin-dashboard">
    <div class="header-actions flex justify-between items-center mb-6">
      <h2 class="text-xl font-bold">Gestão de Empresas (Inquilinos)</h2>
      <button class="btn-primary">Adicionar Nova Empresa</button>
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
              <button class="btn-text">Ver Dados</button>
              <button class="btn-text" :class="empresa.isActive ? 'text-red' : 'text-green'">
                {{ empresa.isActive ? 'Suspender' : 'Ativar' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div v-else class="p-6 text-center text-muted">
        Ainda não tem empresas registadas.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../api';

const empresas = ref([]);
const loading = ref(true);

const loadEmpresas = async () => {
  try {
    const { data } = await api.get('/dashboard/superadmin');
    empresas.value = data.empresas;
  } catch (error) {
    console.error('Error loading companies', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadEmpresas();
});
</script>

<style scoped>
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
</style>
