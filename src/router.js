import { createRouter, createWebHistory } from 'vue-router';
import AppLayout from './components/AppLayout.vue';
import AdminLayout from './components/AdminLayout.vue';
import Dashboard from './views/Dashboard.vue';
import AuthView from './views/AuthView.vue';
import AdminDashboard from './views/AdminDashboard.vue';
import Clientes from './views/Clientes.vue';
import Emprestimos from './views/Emprestimos.vue';
import Pagamentos from './views/Pagamentos.vue';
import Empresa from './views/Empresa.vue';
import Recibos from './views/Recibos.vue';
import Estatisticas from './views/Estatisticas.vue';
import Relatorios from './views/Relatorios.vue';
import Perfil from './views/Perfil.vue';
import Assinatura from './views/Assinatura.vue';
import Ajuda from './views/Ajuda.vue';
import Calendario from './views/Calendario.vue';
import EmprestimoDetalhes from './views/EmprestimoDetalhes.vue';
import ReciboPrint from './views/ReciboPrint.vue';
import ClientePerfil from './views/ClientePerfil.vue';
const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: AuthView
  },
  {
    path: '/register',
    name: 'Register',
    component: AuthView
  },
  {
    path: '/print/recibo/:id',
    name: 'ReciboPrint',
    component: ReciboPrint,
    meta: { requiresAuth: true }
  },
  {
    path: '/app',
    component: AppLayout,
    meta: { requiresAuth: true, role: 'empresa' },
    children: [
      { path: '', name: 'Dashboard', component: Dashboard },
      { path: 'clientes', name: 'Clientes', component: Clientes },
      { path: 'clientes/:id', name: 'ClientePerfil', component: ClientePerfil },
      { path: 'emprestimos', name: 'Empréstimos', component: Emprestimos },
      { path: 'emprestimos/:id', name: 'EmprestimoDetalhes', component: EmprestimoDetalhes },
      { path: 'pagamentos', name: 'Pagamentos', component: Pagamentos },
      { path: 'calendario', name: 'Calendário', component: Calendario },
      { path: 'relatorios', name: 'Relatórios', component: Relatorios },
      { path: 'recibos', name: 'Recibos', component: Recibos },
      { path: 'notificacoes', name: 'Notificações', component: () => import('./views/Notificacoes.vue') },
      { path: 'estatisticas', name: 'Estatísticas', component: Estatisticas },
      { path: 'empresa', name: 'Empresa', component: Empresa },
      { path: 'perfil', name: 'Perfil', component: Perfil },
      { path: 'assinatura', name: 'Assinatura', component: Assinatura },
      { path: 'configuracoes', name: 'Configurações', component: Empresa },
      { path: 'ajuda', name: 'Ajuda', component: Ajuda },
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
