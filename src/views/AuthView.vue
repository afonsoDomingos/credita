<template>
  <div class="auth-wrapper">
    <div class="auth-container" :class="{ 'right-panel-active': isSignUp }">
      <!-- SIGN UP FORM -->
      <div class="form-container sign-up-container">
        <form @submit.prevent="handleRegister">
          <img src="/logo.png" alt="Microcrédito" style="height: 60px; margin-bottom: 10px; object-fit: contain;" />
          <p class="subtitle">Registe a sua empresa de Microcrédito</p>
          
          <input type="text" placeholder="Nome da Empresa *" v-model="regForm.companyName" required />
          <input type="text" placeholder="Contacto Telefónico *" v-model="regForm.phone" required />
          <input type="text" placeholder="NIF (Opcional)" v-model="regForm.nif" />
          <input type="email" placeholder="Email do Administrador *" v-model="regForm.email" required />
          <input type="password" placeholder="Palavra-passe" v-model="regForm.password" required />
          
          <div v-if="regError" class="error-msg">{{ regError }}</div>
          
          <button type="submit" class="btn-solid" :disabled="loading">
            {{ loading ? 'A criar...' : 'Registar' }}
          </button>
          <p class="mobile-toggle mt-4 text-sm">Já tem conta? <a href="#" @click.prevent="isSignUp = false" class="text-green-600 font-bold">Iniciar Sessão</a></p>
        </form>
      </div>
      
      <!-- SIGN IN FORM -->
      <div class="form-container sign-in-container">
        <form @submit.prevent="handleLogin">
          <img src="/logo.png" alt="Microcrédito" style="height: 60px; margin-bottom: 10px; object-fit: contain;" />
          <p class="subtitle">Bem-vindo de volta! Inicie sessão.</p>
          
          <input type="email" placeholder="Email" v-model="loginForm.email" required />
          <input type="password" placeholder="Palavra-passe" v-model="loginForm.password" required />
          
          <div class="w-full text-right mb-2">
            <a href="#" @click.prevent="openForgotModal" class="forgot-link">Esqueceu-se da palavra-passe?</a>
          </div>
          
          <div v-if="loginError" class="error-msg">{{ loginError }}</div>
          
          <button type="submit" class="btn-solid" :disabled="loading">
            {{ loading ? 'A entrar...' : 'Entrar' }}
          </button>
          <p class="mobile-toggle mt-4 text-sm">Não tem conta? <a href="#" @click.prevent="isSignUp = true" class="text-green-600 font-bold">Criar Conta</a></p>
        </form>
      </div>

      <!-- FORGOT PASSWORD MODAL -->
      <div v-if="showForgotModal" class="modal-overlay" @click.self="closeForgotModal">
        <div class="modal-content surface text-left">
          <div class="modal-header flex justify-between items-center mb-4">
            <h2 class="font-bold text-lg">Recuperar Palavra-passe</h2>
            <button class="btn-icon" @click="closeForgotModal">✕</button>
          </div>

          <div v-if="forgotStep === 1">
            <p class="text-sm text-muted mb-4">Insira o seu endereço de email para receber o código de recuperação de 6 dígitos.</p>
            <form @submit.prevent="handleForgotPassword" class="modal-form-inline">
              <input type="email" placeholder="Email *" v-model="forgotEmail" required />
              <div v-if="forgotMsg" :class="forgotError ? 'error-msg' : 'success-msg'">{{ forgotMsg }}</div>
              <div class="modal-actions mt-4 flex justify-end gap-2">
                <button type="button" class="btn-secondary-modal" @click="closeForgotModal">Cancelar</button>
                <button type="submit" class="btn-solid-sm" :disabled="forgotLoading">
                  {{ forgotLoading ? 'A enviar...' : 'Enviar Código' }}
                </button>
              </div>
            </form>
          </div>

          <div v-else-if="forgotStep === 2">
            <p class="text-sm text-muted mb-4">Insira o código de 6 dígitos enviado para <strong>{{ forgotEmail }}</strong> e a sua nova palavra-passe.</p>
            <form @submit.prevent="handleResetPassword" class="modal-form-inline">
              <input type="text" placeholder="Código de 6 dígitos *" v-model="resetCode" maxlength="6" required />
              <input type="password" placeholder="Nova Palavra-passe *" v-model="newPassword" required minlength="6" />
              <div v-if="forgotMsg" :class="forgotError ? 'error-msg' : 'success-msg'">{{ forgotMsg }}</div>
              <div class="modal-actions mt-4 flex justify-end gap-2">
                <button type="button" class="btn-secondary-modal" @click="forgotStep = 1">Voltar</button>
                <button type="submit" class="btn-solid-sm" :disabled="forgotLoading">
                  {{ forgotLoading ? 'A redefinir...' : 'Redefinir Password' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <!-- OVERLAY PANEL -->
      <div class="overlay-container">
        <div class="overlay">
          <div class="overlay-panel overlay-left">
            <h1 class="text-white font-bold text-3xl">Já nos conhece?</h1>
            <p class="text-white mt-4 mb-6">Se já possui uma conta de microcrédito connosco, inicie sessão e volte ao seu dashboard.</p>
            <button class="btn-outline" @click="isSignUp = false">Iniciar Sessão</button>
          </div>
          <div class="overlay-panel overlay-right">
            <h1 class="text-white font-bold text-3xl">Olá, Parceiro!</h1>
            <p class="text-white mt-4 mb-6">Registe a sua empresa e comece a gerir a sua carteira de microcréditos hoje mesmo.</p>
            <button class="btn-outline" @click="isSignUp = true">Criar Conta</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import api from '../api';

const router = useRouter();
const route = useRoute();

const isSignUp = ref(false);
const loading = ref(false);

const loginForm = ref({ email: '', password: '' });
const loginError = ref('');

const regForm = ref({ companyName: '', phone: '', nif: '', email: '', password: '' });
const regError = ref('');

// Forgot Password State
const showForgotModal = ref(false);
const forgotStep = ref(1);
const forgotEmail = ref('');
const resetCode = ref('');
const newPassword = ref('');
const forgotLoading = ref(false);
const forgotMsg = ref('');
const forgotError = ref(false);

const openForgotModal = () => {
  showForgotModal.value = true;
  forgotStep.value = 1;
  forgotEmail.value = loginForm.value.email || '';
  resetCode.value = '';
  newPassword.value = '';
  forgotMsg.value = '';
  forgotError.value = false;
};

const closeForgotModal = () => {
  showForgotModal.value = false;
};

const handleForgotPassword = async () => {
  forgotLoading.value = true;
  forgotMsg.value = '';
  forgotError.value = false;

  try {
    const { data } = await api.post('/auth/forgot-password', { email: forgotEmail.value });
    forgotMsg.value = data.message;
    forgotStep.value = 2;
  } catch (error) {
    forgotError.value = true;
    forgotMsg.value = error.response?.data?.message || 'Erro ao enviar pedido.';
  } finally {
    forgotLoading.value = false;
  }
};

const handleResetPassword = async () => {
  forgotLoading.value = true;
  forgotMsg.value = '';
  forgotError.value = false;

  try {
    const { data } = await api.post('/auth/reset-password', {
      email: forgotEmail.value,
      code: resetCode.value,
      newPassword: newPassword.value
    });
    forgotMsg.value = data.message;
    setTimeout(() => {
      closeForgotModal();
      loginForm.value.email = forgotEmail.value;
    }, 2000);
  } catch (error) {
    forgotError.value = true;
    forgotMsg.value = error.response?.data?.message || 'Erro ao redefinir password.';
  } finally {
    forgotLoading.value = false;
  }
};

onMounted(() => {
  if (route.path === '/register') {
    isSignUp.value = true;
  }
});

const handleLogin = async () => {
  loading.value = true;
  loginError.value = '';
  
  console.log('[AUTH-FRONTEND] Iniciando login para:', loginForm.value.email);
  
  try {
    const { data } = await api.post('/auth/login', loginForm.value);
    
    console.log('[AUTH-FRONTEND] Login bem-sucedido:', {
      id: data._id,
      email: data.email,
      role: data.role,
      hasToken: !!data.token
    });
    
    localStorage.setItem('user', JSON.stringify({
      id: data._id,
      email: data.email,
      role: data.role,
      token: data.token
    }));
    
    console.log('[AUTH-FRONTEND] Utilizador guardado no localStorage');
    
    if (data.role === 'superadmin') {
      console.log('[AUTH-FRONTEND] Redirecionando para /admin');
      router.push('/admin');
    } else {
      console.log('[AUTH-FRONTEND] Redirecionando para /app');
      router.push('/app');
    }
  } catch (error) {
    console.error('[AUTH-FRONTEND-ERROR] Falha no login:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      code: error.response?.data?.code
    });
    loginError.value = error.response?.data?.message || 'Erro ao iniciar sessão.';
  } finally {
    loading.value = false;
  }
};

const handleRegister = async () => {
  loading.value = true;
  regError.value = '';
  
  try {
    const { data } = await api.post('/auth/register', regForm.value);
    
    localStorage.setItem('user', JSON.stringify({
      id: data._id,
      email: data.email,
      role: data.role,
      token: data.token
    }));
    
    router.push('/app');
  } catch (error) {
    regError.value = error.response?.data?.message || 'Erro ao criar conta.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@700;900&display=swap');

.auth-wrapper {
  background-color: #f6f5f7;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  font-family: 'Inter', sans-serif;
  height: 100vh;
  margin: 0;
}

h1 {
  font-weight: bold;
  margin: 0;
}

.logo-title {
  font-family: 'Poppins', sans-serif;
  font-weight: 900;
  color: #000000;
  font-size: 2.2rem;
  margin-bottom: 5px;
}

.subtitle {
  font-size: 14px;
  font-weight: 400;
  color: #6b7280;
  margin-bottom: 20px;
  text-align: center;
}

p {
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  letter-spacing: 0.5px;
}

.auth-container {
  background-color: #ffffff;
  border-radius: 20px;
  box-shadow: 0 14px 28px rgba(0,0,0,0.15), 0 10px 10px rgba(0,0,0,0.1);
  position: relative;
  overflow: hidden;
  width: 900px;
  max-width: 100%;
  min-height: 550px;
}

.form-container {
  position: absolute;
  top: 0;
  height: 100%;
  transition: all 0.6s ease-in-out;
}

form {
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 0 50px;
  height: 100%;
  text-align: center;
}

input {
  background-color: #f9f9f9;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px 15px;
  margin: 8px 0;
  width: 100%;
  outline: none;
  font-family: 'Inter', sans-serif;
  transition: border 0.3s;
}
input:focus {
  border-color: var(--primary-color);
}

.btn-solid {
  border-radius: 20px;
  border: 1px solid var(--primary-color);
  background-color: var(--primary-color);
  color: #ffffff;
  font-size: 12px;
  font-weight: bold;
  padding: 12px 45px;
  letter-spacing: 1px;
  text-transform: uppercase;
  transition: transform 80ms ease-in;
  cursor: pointer;
  margin-top: 15px;
}
.btn-solid:active { transform: scale(0.95); }
.btn-solid:focus { outline: none; }
.btn-solid:disabled { opacity: 0.7; cursor: not-allowed; }

.btn-outline {
  background-color: transparent;
  border-color: #ffffff;
  border-radius: 20px;
  border: 1px solid #ffffff;
  color: #ffffff;
  font-size: 12px;
  font-weight: bold;
  padding: 12px 45px;
  letter-spacing: 1px;
  text-transform: uppercase;
  transition: transform 80ms ease-in;
  cursor: pointer;
}
.btn-outline:active { transform: scale(0.95); }

.sign-in-container {
  left: 0;
  width: 50%;
  z-index: 2;
}

.auth-container.right-panel-active .sign-in-container {
  transform: translateX(100%);
}

.sign-up-container {
  left: 0;
  width: 50%;
  opacity: 0;
  z-index: 1;
}

.auth-container.right-panel-active .sign-up-container {
  transform: translateX(100%);
  opacity: 1;
  z-index: 5;
  animation: show 0.6s;
}

@keyframes show {
  0%, 49.99% { opacity: 0; z-index: 1; }
  50%, 100% { opacity: 1; z-index: 5; }
}

.overlay-container {
  position: absolute;
  top: 0;
  left: 50%;
  width: 50%;
  height: 100%;
  overflow: hidden;
  transition: transform 0.6s ease-in-out;
  z-index: 100;
}

.auth-container.right-panel-active .overlay-container {
  transform: translateX(-100%);
}

.overlay {
  background: var(--primary-color);
  background: linear-gradient(to right, #16A34A, #22c55e);
  background-repeat: no-repeat;
  background-size: cover;
  background-position: 0 0;
  color: #ffffff;
  position: relative;
  left: -100%;
  height: 100%;
  width: 200%;
  transform: translateX(0);
  transition: transform 0.6s ease-in-out;
}

.auth-container.right-panel-active .overlay {
  transform: translateX(50%);
}

.overlay-panel {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 0 40px;
  text-align: center;
  top: 0;
  height: 100%;
  width: 50%;
  transform: translateX(0);
  transition: transform 0.6s ease-in-out;
}

.overlay-left {
  transform: translateX(-20%);
}

.auth-container.right-panel-active .overlay-left {
  transform: translateX(0);
}

.overlay-right {
  right: 0;
  transform: translateX(0);
}

.auth-container.right-panel-active .overlay-right {
  transform: translateX(20%);
}

.error-msg {
  color: #DC2626;
  font-size: 0.875rem;
  background-color: #FEE2E2;
  padding: 10px;
  border-radius: 8px;
  width: 100%;
  margin-top: 10px;
}

.success-msg {
  color: #15803D;
  font-size: 0.875rem;
  background-color: #DCFCE7;
  padding: 10px;
  border-radius: 8px;
  width: 100%;
  margin-top: 10px;
}

.forgot-link {
  font-size: 0.8rem;
  color: #6B7280;
  text-decoration: none;
  transition: color 0.2s;
}
.forgot-link:hover {
  color: var(--primary-color);
  text-decoration: underline;
}

.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  width: 90%;
  max-width: 440px;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2);
}

.modal-form-inline input {
  margin: 6px 0;
}

.btn-solid-sm {
  border-radius: 12px;
  background-color: var(--primary-color);
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  padding: 8px 20px;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s;
}
.btn-solid-sm:hover { opacity: 0.9; }

.btn-secondary-modal {
  border-radius: 12px;
  background-color: #F3F4F6;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 8px 16px;
  border: 1px solid #E5E7EB;
  cursor: pointer;
}
.btn-secondary-modal:hover { background-color: #E5E7EB; }

.btn-icon {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #9CA3AF;
}
.btn-icon:hover { color: #1F2937; }

.text-white { color: white; }
.font-bold { font-weight: 700; }
.text-3xl { font-size: 1.875rem; }
.mt-4 { margin-top: 1rem; }
.mb-6 { margin-bottom: 1.5rem; }
.text-green-600 { color: #16a34a; }

.mobile-toggle {
  display: none;
}

@media (max-width: 768px) {
  .mobile-toggle {
    display: block;
  }
  .auth-container {
    min-height: 100vh;
    border-radius: 0;
    width: 100vw;
  }
  .sign-in-container, .sign-up-container {
    width: 100%;
    left: 0;
  }
  .auth-container.right-panel-active .sign-in-container {
    transform: translateX(0);
    opacity: 0;
    z-index: 1;
  }
  .auth-container.right-panel-active .sign-up-container {
    transform: translateX(0);
    opacity: 1;
    z-index: 5;
    animation: none;
  }
  form {
    padding: 0 30px;
  }
  .overlay-container {
    display: none;
  }
}
</style>
