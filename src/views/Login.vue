<template>
  <div class="login-container">
    <div class="login-card surface">
      <div class="login-header">
        <h1 class="text-primary font-bold text-2xl">Microcrédito</h1>
        <p class="text-muted text-sm mt-2">Inicie sessão na sua conta de Microcrédito para gerir os seus microcréditos.</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            type="email" 
            id="email" 
            v-model="email" 
            placeholder="admin@credita.com" 
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
          <span v-if="loading">A entrar...</span>
          <span v-else>Entrar</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../api';

const router = useRouter();
const email = ref('');
const password = ref('');
const errorMsg = ref('');
const loading = ref(false);

const handleLogin = async () => {
  loading.value = true;
  errorMsg.value = '';
  
  try {
    const { data } = await api.post('/auth/login', {
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
    
    // Redirect based on role
    if (data.role === 'superadmin') {
      router.push('/admin');
    } else {
      router.push('/app');
    }
  } catch (error) {
    errorMsg.value = error.response?.data?.message || 'Erro ao tentar iniciar sessão.';
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
  max-width: 400px;
  padding: 40px;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
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
</style>
