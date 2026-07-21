<template>
  <div class="empresa-page">
    <div class="header-actions mb-6">
      <h1 class="text-xl font-bold">Definições da Empresa</h1>
      <p class="text-muted text-sm">Gira os dados básicos da sua conta e empresa.</p>
    </div>

    <div class="surface settings-card">
      <div v-if="loading" class="loader-wrapper">
        <Spinner message="A carregar definições..." />
      </div>
      
      <form v-else @submit.prevent="salvarDefinicoes" class="settings-form">
        <div class="profile-header mb-8">
          <div class="logo-preview">
            <img v-if="logoPreviewUrl || form.logoUrl" :src="logoPreviewUrl || form.logoUrl" alt="Logótipo" />
            <div v-else class="logo-placeholder">Sem Logo</div>
          </div>
          <div class="logo-upload">
            <label class="btn-secondary" style="cursor: pointer;">
              Alterar Logótipo
              <input type="file" accept="image/*" @change="onLogoChange" hidden />
            </label>
            <p class="text-muted text-xs mt-2">Formatos: JPG, PNG. Máx 5MB.</p>
          </div>
        </div>

        <h3 class="font-semibold mb-4 border-b pb-2">Informações Gerais</h3>
        
        <div class="grid-2 gap-6">
          <div class="form-group">
            <label>Nome da Empresa</label>
            <input type="text" v-model="form.name" required />
          </div>
          <div class="form-group">
            <label>Telefone / Contacto</label>
            <input type="text" v-model="form.phone" required />
          </div>
        </div>
        
        <div class="grid-2 gap-6 mt-4">
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

        <div class="mt-8 border-t pt-6">
          <button type="submit" class="btn-primary btn-large w-full-mobile" :disabled="saving">
            {{ saving ? 'A guardar...' : 'Guardar Todas as Alterações' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Spinner from '../components/Spinner.vue';
import { useToast } from '../composables/useToast';
import api from '../api';

const toast = useToast();
const loading = ref(true);
const saving = ref(false);
const successMsg = ref('');
const errorMsg = ref('');
const planoAtual = ref('');
const logoFile = ref(null);
const logoPreviewUrl = ref(null);

const form = ref({
  name: '',
  phone: '',
  nif: '',
  logoUrl: ''
});

const loadDefinicoes = async () => {
  try {
    const { data } = await api.get('/company/settings');
    form.value.name = data.name;
    form.value.phone = data.phone || '';
    form.value.nif = data.nif || '';
    form.value.logoUrl = data.logoUrl || '';
    planoAtual.value = data.subscriptionPlan;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const onLogoChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    logoFile.value = file;
    logoPreviewUrl.value = URL.createObjectURL(file);
  }
};

const salvarDefinicoes = async () => {
  saving.value = true;
  successMsg.value = '';
  errorMsg.value = '';
  try {
    let responseData;
    
    if (logoFile.value) {
      const formData = new FormData();
      formData.append('name', form.value.name);
      formData.append('phone', form.value.phone);
      formData.append('nif', form.value.nif);
      formData.append('logo', logoFile.value);
      
      const res = await api.put('/company/settings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      responseData = res.data;
    } else {
      const res = await api.put('/company/settings', {
        name: form.value.name,
        phone: form.value.phone,
        nif: form.value.nif
      });
      responseData = res.data;
    }
    
    form.value.logoUrl = responseData.logoUrl; // Update with new remote URL
    logoFile.value = null; // Clear pending file

    // Synchronize company name in localStorage for Header / User Profile
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        u.name = responseData.name;
        if (u.company) u.company.name = responseData.name;
        localStorage.setItem('user', JSON.stringify(u));
      } catch (e) {
        console.error('Error updating localStorage user:', e);
      }
    }
    
    toast.success('Definições atualizadas com sucesso!');
  } catch (error) {
    toast.error(error.response?.data?.message || 'Erro ao guardar definições.');
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

.profile-header {
  display: flex;
  align-items: center;
  gap: 24px;
}

.logo-preview img, .logo-placeholder {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
}

.logo-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--border-color);
  color: var(--text-muted);
  font-size: 0.875rem;
}

.btn-secondary {
  padding: 8px 16px;
  background-color: transparent;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-weight: 500;
  transition: all 0.2s;
  display: inline-block;
}

.btn-secondary:hover {
  background-color: var(--bg-body);
}

.upgrade-btn {
  background-color: #FACC15;
  color: #854D0E;
  border: none;
  padding: 8px 16px;
  border-radius: var(--radius-full);
  font-weight: 700;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-large {
  padding: 14px 24px;
  font-size: 1rem;
  font-weight: 600;
  width: auto;
  min-width: 200px;
}

.border-t {
  border-top: 1px solid var(--border-color);
}
.pt-6 {
  padding-top: 24px;
}

.upgrade-btn:hover {
  background-color: #FDE047;
  transform: translateY(-1px);
}

.loader-wrapper {
  padding: 60px 0;
}

@media (max-width: 768px) {
  .grid-2 { grid-template-columns: 1fr; }
  .profile-header { flex-direction: column; align-items: flex-start; }
}
</style>
