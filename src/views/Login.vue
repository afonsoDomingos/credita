<template>
  <div class="login-container">
    <div class="login-card surface">
      <div class="login-header">
        <h1 class="text-primary font-bold text-2xl">Etako</h1>
        <p class="text-muted text-sm mt-2">Bem-vindo de volta! Inicie sessão na sua conta.</p>
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

const router = useRouter();
const email = ref('');
const password = ref('');
const errorMsg = ref('');
const loading = ref(false);

const handleLogin = async () => {
  loading.value = true;
  errorMsg.value = '';
  
  try {
    // Para fins de teste sem API ligada, vamos simular o login com base nos emails que pediu:
    // Na vida real faríamos: const res = await axios.post('/api/auth/login', { email, password })
    
    setTimeout(() => {
      if (email.value === 'superadmin@credita.com' && password.value === '@Admin123@') {
        localStorage.setItem('user', JSON.stringify({ role: 'superadmin', email: email.value }));
        router.push('/admin');
      } else if (email.value === 'empresa@credita.com' && password.value === '@Empresa123@') {
        localStorage.setItem('user', JSON.stringify({ role: 'empresa', email: email.value }));
        router.push('/app');
      } else {
        errorMsg.value = 'Credenciais inválidas.';
      }
      loading.value = false;
    }, 800);
    
  } catch (error) {
    errorMsg.value = 'Erro ao tentar iniciar sessão.';
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
