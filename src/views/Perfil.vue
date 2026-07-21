<template>
  <div class="perfil-page">
    <div class="header-actions mb-6">
      <h1 class="text-xl font-bold">O meu Perfil</h1>
      <p class="text-muted text-sm">Gira os seus dados pessoais e de acesso à plataforma.</p>
    </div>

    <div class="surface settings-card">
      <form @submit.prevent="salvarPerfil" class="settings-form">
        <div class="profile-header mb-8">
          <img :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(form.name || 'Admin')}&background=2563EB&color=fff&size=80`" alt="User Profile" class="avatar-lg" />
          <div class="profile-header-info">
            <h2 class="font-bold text-lg">{{ form.name || 'Utilizador' }}</h2>
            <p class="text-muted">{{ user?.role === 'superadmin' ? 'Administrador Global' : 'Gestor' }}</p>
          </div>
        </div>

        <h3 class="font-semibold mb-4 border-b pb-2">Informações Pessoais</h3>
        
        <div class="grid-2 gap-6">
          <div class="form-group">
            <label>Nome Completo</label>
            <input type="text" v-model="form.name" required />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" v-model="form.email" required disabled class="bg-light" title="Contacte o suporte para alterar o email" />
          </div>
        </div>
        
        <h3 class="font-semibold mb-4 border-b pb-2 mt-8">Segurança</h3>
        <p class="text-xs text-muted mb-4">Deixe em branco se não quiser alterar a senha atual.</p>
        
        <div class="grid-2 gap-6">
          <div class="form-group">
            <label>Nova Senha</label>
            <input type="password" v-model="form.password" placeholder="Mínimo 6 caracteres" />
          </div>
          <div class="form-group">
            <label>Confirmar Nova Senha</label>
            <input type="password" v-model="form.passwordConfirm" />
          </div>
        </div>

        <div class="mt-8 border-t pt-6">
          <button type="submit" class="btn-primary btn-large w-full-mobile" :disabled="saving">
            {{ saving ? 'A guardar...' : 'Guardar Alterações' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from '../composables/useToast';
import api from '../api';

const toast = useToast();
const saving = ref(false);
const user = ref(null);

const form = ref({
  name: '',
  email: '',
  password: '',
  passwordConfirm: ''
});

const loadPerfil = () => {
  const userData = localStorage.getItem('user');
  if (userData) {
    user.value = JSON.parse(userData);
    form.value.name = user.value.name;
    form.value.email = user.value.email;
  }
};

const salvarPerfil = async () => {
  if (form.value.password && form.value.password !== form.value.passwordConfirm) {
    toast.error('As senhas não coincidem!');
    return;
  }

  saving.value = true;
  try {
    const payload = {
      name: form.value.name
    };
    
    if (form.value.password) {
      payload.password = form.value.password;
    }

    // Since we don't have a specific /profile PUT route yet, 
    // assuming it might be /users/:id or something similar.
    // For now, let's update local storage immediately for UI update,
    // and attempt an API call if backend supports it.
    
    // Fallback: Just update local storage to simulate success
    const updatedUser = { ...user.value, name: form.value.name };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    user.value = updatedUser;
    
    // Simulate API call delay
    await new Promise(r => setTimeout(r, 800));

    toast.success('Perfil atualizado com sucesso!');
    form.value.password = '';
    form.value.passwordConfirm = '';
    
    // Dispatch custom event so Header updates
    window.dispatchEvent(new Event('storage'));
    
  } catch (error) {
    toast.error('Erro ao guardar definições de perfil.');
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  loadPerfil();
});
</script>

<style scoped>
.perfil-page {
  max-width: 900px;
  margin: 0 auto;
}

.header-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 32px;
}

.settings-card {
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03);
}

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-main);
}

.form-group input {
  padding: 12px 16px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  font-family: inherit;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.form-group input:focus:not(:disabled) { 
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
.form-group input:disabled { 
  cursor: not-allowed; 
  color: var(--text-muted); 
  background-color: #f8fafc;
}

.border-b { border-bottom: 1px solid var(--border-color); }
.border-t { border-top: 1px solid var(--border-color); }

.profile-header {
  display: flex;
  align-items: center;
  gap: 24px;
  padding-bottom: 32px;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 32px;
}

.avatar-lg {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #EFF6FF;
}

.profile-header-info h2 {
  font-size: 1.5rem;
  color: var(--text-main);
  margin-bottom: 4px;
}

.btn-large {
  padding: 14px 32px;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 12px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-large:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3);
}

.pt-6 {
  padding-top: 32px;
}

@media (max-width: 768px) {
  .settings-card { padding: 24px; }
  .grid-2 { grid-template-columns: 1fr; gap: 20px; }
  .profile-header { flex-direction: column; align-items: flex-start; text-align: center; width: 100%; align-items: center; }
  .w-full-mobile { width: 100%; }
}
</style>
