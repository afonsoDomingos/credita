import { createRouter, createWebHistory } from 'vue-router';
import AppLayout from './components/AppLayout.vue';
import AdminLayout from './components/AdminLayout.vue';
import Dashboard from './views/Dashboard.vue';
import Login from './views/Login.vue';
import Register from './views/Register.vue';
import AdminDashboard from './views/AdminDashboard.vue';
import Clientes from './views/Clientes.vue';
import Emprestimos from './views/Emprestimos.vue';
import Pagamentos from './views/Pagamentos.vue';
import Empresa from './views/Empresa.vue';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/app',
    component: AppLayout,
    meta: { requiresAuth: true, role: 'empresa' },
    children: [
      { path: '', name: 'Dashboard', component: Dashboard },
      { path: 'clientes', name: 'Clientes', component: Clientes },
      { path: 'emprestimos', name: 'Empréstimos', component: Emprestimos },
      { path: 'pagamentos', name: 'Pagamentos', component: Pagamentos },
      { path: 'calendario', name: 'Calendário', component: () => import('./views/Placeholder.vue') },
      { path: 'relatorios', name: 'Relatórios', component: () => import('./views/Placeholder.vue') },
      { path: 'recibos', name: 'Recibos', component: () => import('./views/Placeholder.vue') },
      { path: 'notificacoes', name: 'Notificações', component: () => import('./views/Placeholder.vue') },
      { path: 'estatisticas', name: 'Estatísticas', component: () => import('./views/Placeholder.vue') },
      { path: 'empresa', name: 'Empresa', component: Empresa },
      { path: 'assinatura', name: 'Assinatura', component: () => import('./views/Placeholder.vue') },
      { path: 'configuracoes', name: 'Configurações', component: () => import('./views/Placeholder.vue') },
      { path: 'ajuda', name: 'Ajuda', component: () => import('./views/Placeholder.vue') },
    ],
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, role: 'superadmin' },
    children: [
      { path: '', name: 'AdminDashboard', component: AdminDashboard }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Auth Guard
router.beforeEach((to, from, next) => {
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  if (to.meta.requiresAuth && !user) {
    next('/login');
  } else if (to.meta.requiresAuth && user) {
    if (to.meta.role && to.meta.role !== user.role) {
      // Bloquear se tiver role errado (ex: empresa tentar ir para /admin)
      next(user.role === 'superadmin' ? '/admin' : '/app');
    } else {
      next();
    }
  } else if (to.path === '/login' && user) {
    next(user.role === 'superadmin' ? '/admin' : '/app');
  } else {
    next();
  }
});

export default router;
