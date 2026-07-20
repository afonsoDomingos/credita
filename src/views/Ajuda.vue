<template>
  <div class="chat-container">
    <div class="chat-header">
      <div class="support-agent">
        <div class="agent-avatar">
          <Headset :size="24" class="text-white" />
        </div>
        <div class="agent-info">
          <h2>Suporte Superadmin</h2>
          <span class="status text-green-500">Online e pronto a ajudar</span>
        </div>
      </div>
    </div>

    <div class="chat-messages" ref="messagesContainer">
      <div v-if="loading" class="text-center py-4">A carregar mensagens...</div>
      
      <div class="message-wrapper admin-msg">
        <div class="message-bubble">
          Olá! Bem-vindo ao centro de suporte da Credita. Como podemos ajudar a sua empresa hoje?
        </div>
        <span class="msg-time">Sistema</span>
      </div>

      <div 
        v-for="msg in messages" 
        :key="msg._id" 
        class="message-wrapper" 
        :class="msg.sender === 'company' ? 'my-msg' : 'admin-msg'"
      >
        <div class="message-bubble">
          {{ msg.content }}
        </div>
        <span class="msg-time">{{ formatTime(msg.createdAt) }}</span>
      </div>
    </div>

    <div class="quick-replies" v-if="showQuickReplies">
      <button class="quick-btn" @click="sendQuick('Preciso de ajuda com a minha Assinatura.')">Assinatura / Pagamentos</button>
      <button class="quick-btn" @click="sendQuick('Como apago ou edito um empréstimo?')">Dúvida Técnica</button>
      <button class="quick-btn" @click="sendQuick('Tenho um problema técnico ou bug a reportar.')">Reportar Bug</button>
      <button class="quick-btn" @click="sendQuick('Gostaria de sugerir uma nova funcionalidade.')">Sugestão de Melhoria</button>
    </div>

    <div class="chat-input-area">
      <form @submit.prevent="sendMessage" class="input-form">
        <input 
          type="text" 
          v-model="newMessage" 
          placeholder="Escreva a sua mensagem aqui..." 
          class="chat-input"
          :disabled="sending"
        />
        <button type="submit" class="send-btn" :disabled="!newMessage.trim() || sending">
          <Send :size="20" />
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue';
import { Headset, Send } from '@lucide/vue';
import api from '../api';

const messages = ref([]);
const newMessage = ref('');
const loading = ref(true);
const sending = ref(false);
const messagesContainer = ref(null);

const showQuickReplies = ref(true);

const loadMessages = async () => {
  try {
    const { data } = await api.get('/support/company');
    messages.value = data;
    if (messages.value.length > 0) {
      showQuickReplies.value = false;
    }
    scrollToBottom();
  } catch (error) {
    console.error('Erro ao carregar chat', error);
  } finally {
    loading.value = false;
  }
};

const sendQuick = (text) => {
  newMessage.value = text;
  sendMessage();
};

const sendMessage = async () => {
  if (!newMessage.value.trim()) return;
  
  const textToSend = newMessage.value;
  newMessage.value = '';
  sending.value = true;
  showQuickReplies.value = false;

  // Optimistic UI
  messages.value.push({
    _id: Date.now().toString(),
    content: textToSend,
    sender: 'company',
    createdAt: new Date().toISOString()
  });
  scrollToBottom();

  try {
    await api.post('/support/company', { content: textToSend });
    await loadMessages();
  } catch (error) {
    console.error('Erro ao enviar mensagem', error);
  } finally {
    sending.value = false;
  }
};

const formatTime = (dateString) => {
  const d = new Date(dateString);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - ' + d.toLocaleDateString();
};

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

onMounted(() => {
  loadMessages();
});
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 140px);
  background-color: var(--bg-surface);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border-color);
}

.chat-header {
  padding: 16px 24px;
  background-color: white;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.support-agent {
  display: flex;
  align-items: center;
  gap: 16px;
}

.agent-avatar {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #3B82F6, #8B5CF6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.agent-info h2 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-main);
}

.agent-info .status {
  font-size: 0.8rem;
  font-weight: 600;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background-color: #F8FAFC;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-wrapper {
  display: flex;
  flex-direction: column;
  max-width: 75%;
}

.my-msg {
  align-self: flex-end;
  align-items: flex-end;
}

.admin-msg {
  align-self: flex-start;
  align-items: flex-start;
}

.message-bubble {
  padding: 12px 16px;
  border-radius: 16px;
  font-size: 0.95rem;
  line-height: 1.5;
  word-wrap: break-word;
}

.my-msg .message-bubble {
  background-color: #3B82F6;
  color: white;
  border-bottom-right-radius: 4px;
}

.admin-msg .message-bubble {
  background-color: white;
  color: var(--text-main);
  border: 1px solid var(--border-color);
  border-bottom-left-radius: 4px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.msg-time {
  font-size: 0.7rem;
  color: var(--text-muted);
  margin-top: 4px;
}

.quick-replies {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 16px 24px;
  background-color: #F8FAFC;
}

.quick-btn {
  background-color: white;
  border: 1px solid #3B82F6;
  color: #3B82F6;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-btn:hover {
  background-color: #EFF6FF;
  transform: translateY(-2px);
}

.chat-input-area {
  padding: 16px 24px;
  background-color: white;
  border-top: 1px solid var(--border-color);
}

.input-form {
  display: flex;
  gap: 12px;
  align-items: center;
}

.chat-input {
  flex: 1;
  padding: 14px 20px;
  border: 1px solid var(--border-color);
  border-radius: 24px;
  font-family: inherit;
  font-size: 0.95rem;
  outline: none;
  background-color: #F8FAFC;
  transition: all 0.2s;
}

.chat-input:focus {
  border-color: #3B82F6;
  background-color: white;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.send-btn {
  background-color: #3B82F6;
  color: white;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.send-btn:hover:not(:disabled) {
  background-color: #2563EB;
  transform: scale(1.05);
}

.send-btn:disabled {
  background-color: #93C5FD;
  cursor: not-allowed;
}
</style>
