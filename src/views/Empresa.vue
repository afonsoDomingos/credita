<template>
  <div class="empresa-page">
    <div class="header-actions mb-6">
      <h1 class="text-xl font-bold">Definições da Empresa</h1>
      <p class="text-muted text-sm">Gira os dados básicos da sua conta e empresa.</p>
    </div>

    <div class="surface settings-card">
      <div v-if="loading" class="text-center text-muted">A carregar definições...</div>
      
      <form v-else @submit.prevent="salvarDefinicoes" class="settings-form">
        <h3 class="font-semibold mb-4 border-b pb-2">Informações Gerais</h3>
        
        <div class="grid-2 gap-6">
          <div class="form-group">
            <label>Nome da Empresa</label>
            <input type="text" v-model="form.name" required />
          </div>
          <div class="form-group">
            <label>NIF / NUIT</label>
            <input type="text" v-model="form.nif" />
          </div>
        </div>

        <div class="grid-2 gap-6 mt-4">
          <div class="form-group">
            <label>Plano Atual</label>
            <input type="text" :value="planoAtual.toUpperCase()" disabled class="bg-light" />
            <small class="text-muted mt-1">Contacte o suporte para alterar o seu plano.</small>
          </div>
        </div>

        <div v-if="successMsg" class="success-msg mt-6">{{ successMsg }}</div>
        <div v-if="errorMsg" class="error-msg mt-6">{{ errorMsg }}</div>

        <div class="mt-8">
          <button type="submit" class="btn-primary" :disabled="saving">
            {{ saving ? 'A guardar...' : 'Guardar Alterações' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../api';

const loading = ref(true);
const saving = ref(false);
const successMsg = ref('');
const errorMsg = ref('');
const planoAtual = ref('');

const form = ref({
  name: '',
  nif: ''
});

const loadDefinicoes = async () => {
  try {
    const { data } = await api.get('/company/settings');
    form.value.name = data.name;
    form.value.nif = data.nif || '';
    planoAtual.value = data.subscriptionPlan;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const salvarDefinicoes = async () => {
  saving.value = true;
  successMsg.value = '';
  errorMsg.value = '';
  try {
    await api.put('/company/settings', form.value);
    successMsg.value = 'Definições atualizadas com sucesso!';
    setTimeout(() => { successMsg.value = ''; }, 3000);
  } catch (error) {
    errorMsg.value = error.response?.data?.message || 'Erro ao guardar definições.';
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  loadDefinicoes();
});
</script>

<style scoped>
.settings-card {
  max-width: 800px;
  padding: 32px;
}

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
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
.form-group input:focus:not(:disabled) { border-color: var(--primary-color); }
.form-group input:disabled { cursor: not-allowed; color: var(--text-muted); }

.bg-light { background-color: var(--bg-body); }

.border-b { border-bottom: 1px solid var(--border-color); }

.success-msg {
  color: #16A34A;
  font-size: 0.875rem;
  background-color: #DCFCE7;
  padding: 12px;
  border-radius: var(--radius-sm);
}

.error-msg {
  color: #DC2626;
  font-size: 0.875rem;
  background-color: #FEE2E2;
  padding: 12px;
  border-radius: var(--radius-sm);
}

@media (max-width: 768px) {
  .grid-2 { grid-template-columns: 1fr; }
}
</style>
