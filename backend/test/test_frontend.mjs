const data = [
  {"codigo":"SOL-0001","dataHora":"01/03/2026 08:15","nomeCliente":"João","emailCliente":"joao@demo.com","descricaoEquipamento":"Notebook Lenovo IdeaPad 3","categoriaEquipamento":"NOTEBOOK","estado":"ABERTA"},
  {"codigo":"SOL-0017","dataHora":"17/03/2026 09:00","nomeCliente":"João","emailCliente":"joao@demo.com","descricaoEquipamento":"Desktop Intel i5 10a geração","categoriaEquipamento":"DESKTOP","estado":"ABERTA"}
];

const solicitacoes = data.map((item) => ({
  codigo: item.codigo, // Or \`SOL-${item.codigo}\` if reverted
  nomeCliente: item.nomeCliente?.trim() || 'Cliente',
  emailCliente: '',
  dataHora: item.dataHora,
  descricaoEquipamento: item.descricaoEquipamento,
  estado: item.estado
}));

const parseDataHora = (dataHora) => {
  const [data, hora] = dataHora.split(' ');
  if (!data || !hora) return 0;

  const [dia, mes, ano] = data.split('/').map(Number);
  const [h, m] = hora.split(':').map(Number);
  return new Date(ano, mes - 1, dia, h, m).getTime();
};

const ordemDataHora = 'asc';

const solicitacoesAbertasOrdenadas = solicitacoes
  .filter((sol) => sol.estado === 'ABERTA')
  .sort((a, b) => {
    const diff = parseDataHora(a.dataHora) - parseDataHora(b.dataHora);
    return ordemDataHora === 'asc' ? diff : -diff;
  });

console.log('Result:', JSON.stringify(solicitacoesAbertasOrdenadas, null, 2));
