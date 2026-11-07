// ============================================================
//  SR Central — catálogo de sistemas
//
//  Cada sistema mora na sua própria pasta: /sistemas/<id>/index.html
//  e cuida do PRÓPRIO login (Supabase) antes de liberar o uso.
//  A Central só organiza e alterna entre eles — não exige login.
//
//  Para adicionar um sistema novo:
//   1. Crie /sistemas/<id>/index.html
//   2. Adicione uma entrada abaixo
//
//  Campos:
//   id       identificador (usado na URL: #/compras)
//   nome     nome exibido
//   curto    nome curto para a barra lateral / celular
//   desc     descrição de uma linha
//   recursos 2 a 4 etiquetas mostradas no cartão
//   icone    nome de um ícone em assets/app.js (ICONES)
//   cor      cor de destaque do sistema
//   caminho  arquivo do sistema (ou URL externa)
//   novaAba  (opcional) true = abre em nova aba em vez de dentro da Central
// ============================================================

window.SR_CENTRAL = {
  empresa: 'Souza Ribeiro',
  nome: 'SR Central'
};

window.SR_SISTEMAS = [
  {
    id: 'compras',
    nome: 'SR Compras',
    curto: 'Compras',
    desc: 'Pedidos de compra, cotações com fornecedores e reposição de estoque.',
    recursos: ['Pedidos de compra', 'Cotações', 'Fornecedores'],
    icone: 'cart',
    cor: '#b2e04a',
    caminho: 'sistemas/compras/index.html'
  },
  {
    id: 'comercial',
    nome: 'SR Comercial',
    curto: 'Comercial',
    desc: 'Carteira de clientes, tabela de revenda e vendas confirmadas.',
    recursos: ['Carteira', 'Tabela de revenda', 'Vendas'],
    icone: 'chart',
    cor: '#4fe0c1',
    caminho: 'sistemas/comercial/index.html'
  },
  {
    id: 'tarefas',
    nome: 'SR Tarefas',
    curto: 'Tarefas',
    desc: 'Tarefas da equipe, prioridades e agenda do dia.',
    recursos: ['Equipes', 'Agenda do dia', 'Checklist'],
    icone: 'check',
    cor: '#a78bfa',
    caminho: 'sistemas/tarefas/index.html'
  },
  {
    id: 'expedicao',
    nome: 'SR Expedição',
    curto: 'Expedição',
    desc: 'Separação, conferência e etiquetas de transporte dos pedidos.',
    recursos: ['Separação', 'Conferência', 'Etiquetas 100×150'],
    icone: 'box',
    cor: '#ffad4d',
    caminho: 'sistemas/expedicao/index.html'
  },
  {
    id: 'motorista',
    nome: 'SR Motorista',
    curto: 'Motorista',
    desc: 'Rotas, entregas do dia e comprovantes de entrega.',
    recursos: ['Rotas', 'Entregas', 'Comprovantes'],
    icone: 'truck',
    cor: '#5aa9ff',
    caminho: 'sistemas/motorista/index.html'
  }
];
