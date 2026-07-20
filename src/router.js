import { createRouter, createWebHistory } from 'vue-router';
import AppLayout from './components/AppLayout.vue';
import Dashboard from './views/Dashboard.vue';

const routes = [
  {
    path: '/',
    component: AppLayout,
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: Dashboard,
      },
      // Placeholders for other routes
      { path: 'clientes', name: 'Clientes', component: () => import('./views/Placeholder.vue') },
      { path: 'emprestimos', name: 'Empréstimos', component: () => import('./views/Placeholder.vue') },
      { path: 'pagamentos', name: 'Pagamentos', component: () => import('./views/Placeholder.vue') },
      { path: 'calendario', name: 'Calendário', component: () => import('./views/Placeholder.vue') },
      { path: 'relatorios', name: 'Relatórios', component: () => import('./views/Placeholder.vue') },
      { path: 'recibos', name: 'Recibos', component: () => import('./views/Placeholder.vue') },
      { path: 'notificacoes', name: 'Notificações', component: () => import('./views/Placeholder.vue') },
      { path: 'estatisticas', name: 'Estatísticas', component: () => import('./views/Placeholder.vue') },
      { path: 'empresa', name: 'Empresa', component: () => import('./views/Placeholder.vue') },
      { path: 'assinatura', name: 'Assinatura', component: () => import('./views/Placeholder.vue') },
      { path: 'configuracoes', name: 'Configurações', component: () => import('./views/Placeholder.vue') },
      { path: 'ajuda', name: 'Ajuda', component: () => import('./views/Placeholder.vue') },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
