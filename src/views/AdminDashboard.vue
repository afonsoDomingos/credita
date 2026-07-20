<template>
  <div class="admin-dashboard">
    <div class="header-actions flex justify-between items-center mb-6">
      <h2 class="text-xl font-bold">Gestão de Empresas (Inquilinos)</h2>
      <button class="btn-primary">Adicionar Nova Empresa</button>
    </div>

    <div class="surface p-0 overflow-hidden">
      <table class="companies-table">
        <thead>
          <tr>
            <th>Nome da Empresa</th>
            <th>Email Dono</th>
            <th>Plano</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Empresa Teste</td>
            <td>empresa@credita.com</td>
            <td>Premium</td>
            <td><span class="badge badge-active">Ativa</span></td>
            <td>
              <button class="btn-text">Ver Dados</button>
              <button class="btn-text text-red">Suspender</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.companies-table {
  width: 100%;
  border-collapse: collapse;
}

.companies-table th, .companies-table td {
  padding: 16px 20px;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.companies-table th {
  background-color: var(--bg-body);
  color: var(--text-muted);
  font-weight: 600;
  font-size: 0.875rem;
}

.badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge-active {
  background-color: #DCFCE7;
  color: #16A34A;
}

.btn-text {
  background: none;
  border: none;
  color: var(--primary-color);
  font-weight: 500;
  cursor: pointer;
  margin-right: 12px;
}
.btn-text.text-red {
  color: #DC2626;
}
</style>
