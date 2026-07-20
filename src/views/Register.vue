<template>
  <div class="login-container">
    <div class="login-card surface">
      <div class="login-header">
        <h1 class="logo-title">Microcrédito</h1>
        <p class="text-muted text-sm mt-2">Crie a sua conta e comece a gerir os seus microcréditos.</p>
      </div>

      <form @submit.prevent="handleRegister" class="login-form">
        <div class="form-group">
          <label for="companyName">Nome da Empresa</label>
          <input 
            type="text" 
            id="companyName" 
            v-model="companyName" 
            placeholder="Ex: A Minha Empresa Lda" 
            required 
          />
        </div>

        <div class="form-group">
          <label for="nif">NIF (Opcional)</label>
          <input 
            type="text" 
            id="nif" 
            v-model="nif" 
            placeholder="NIF da Empresa" 
          />
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input 
            type="email" 
            id="email" 
            v-model="email" 
            placeholder="seu@email.com" 
            required 
          />
        </div>

        <div class="form-group">
          <label for="password">Palavra-passe</label>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            placeholder="••••••••" 
            required 
          />
        </div>

        <div v-if="errorMsg" class="error-msg">
          {{ errorMsg }}
        </div>

        <button type="submit" class="btn-primary login-btn" :disabled="loading">
          <span v-if="loading">A criar conta...</span>
          <span v-else>Criar Conta</span>
        </button>
      </form>
      
      <div class="mt-6 text-center text-sm">
        <p class="text-muted">
          Já tem conta? 
          <router-link to="/login" class="text-primary font-medium hover-underline">Inicie sessão</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../api';

const router = useRouter();
const companyName = ref('');
const nif = ref('');
const email = ref('');
const password = ref('');
const errorMsg = ref('');
const loading = ref(false);

const handleRegister = async () => {
  loading.value = true;
  errorMsg.value = '';
  
  try {
    const { data } = await api.post('/auth/register', {
      companyName: companyName.value,
      nif: nif.value,
      email: email.value,
      password: password.value
    });
    
    // Save token and user details to localStorage
    localStorage.setItem('user', JSON.stringify({
      id: data._id,
      email: data.email,
      role: data.role,
      token: data.token
    }));
    
    // Redirect to app
    router.push('/app');
  } catch (error) {
    errorMsg.value = error.response?.data?.message || 'Erro ao tentar criar conta.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: var(--bg-body);
}

.login-card {
  width: 100%;
  max-width: 450px;
  padding: 40px;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo-title {
  font-family: 'Poppins', sans-serif;
  font-weight: 900;
  color: #000000;
  font-size: 2rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-main);
}

input {
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  outline: none;
  font-family: inherit;
  transition: border-color var(--transition-fast);
}

input:focus {
  border-color: var(--primary-color);
}

.login-btn {
  margin-top: 8px;
  padding: 14px;
  border-radius: var(--radius-sm);
  font-size: 1rem;
}

.error-msg {
  color: #DC2626;
  font-size: 0.875rem;
  background-color: #FEE2E2;
  padding: 10px;
  border-radius: var(--radius-sm);
  text-align: center;
}

.hover-underline:hover {
  text-decoration: underline;
}
</style>
