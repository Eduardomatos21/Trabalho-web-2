import assert from 'assert';

const mapSolicitacao = (item) => ({
  codigo: item.codigo,
  nomeCliente: item.nomeCliente?.trim() || 'Cliente',
  emailCliente: item.emailCliente || '',
  dataHora: item.dataHora,
  descricaoEquipamento: item.descricaoEquipamento,
  estado: item.estado
});

const parseDataHora = (dataHora) => {
  if (!dataHora) return 0;
  const [data, hora] = dataHora.split(' ');
  if (!data || !hora) return 0;

  const [dia, mes, ano] = data.split('/').map(Number);
  const [h, m] = hora.split(':').map(Number);
  return new Date(ano, mes - 1, dia, h, m).getTime();
};

const filterAndSort = (data, ordemDataHora) => {
  const solicitacoes = data.map(mapSolicitacao);
  return solicitacoes
    .filter((sol) => sol.estado === 'ABERTA')
    .sort((a, b) => {
      const diff = parseDataHora(a.dataHora) - parseDataHora(b.dataHora);
      return ordemDataHora === 'asc' ? diff : -diff;
    });
};

// Dados de teste com variados casos
const data = [
  {"codigo":"SOL-0001","dataHora":"01/03/2026 08:15","nomeCliente":"João","emailCliente":"joao@demo.com","descricaoEquipamento":"Notebook Lenovo IdeaPad 3","estado":"ABERTA"},
  {"codigo":"SOL-0017","dataHora":"17/03/2026 09:00","nomeCliente":"João","emailCliente":"joao@demo.com","descricaoEquipamento":"Desktop Intel i5","estado":"ABERTA"},
  {"codigo":"SOL-0002","dataHora":"05/03/2026 14:20","nomeCliente":"Maria","emailCliente":"maria@demo.com","descricaoEquipamento":"Smartphone","estado":"REJEITADA"},
  {"codigo":"SOL-0003","dataHora":"10/03/2026 10:10","nomeCliente":" Carlos ","emailCliente":"","descricaoEquipamento":"Tablet","estado":"ABERTA"},
  {"codigo":"SOL-0005","dataHora":"10/03/2026 09:10","nomeCliente":null,"emailCliente":null,"descricaoEquipamento":"Monitor","estado":"ABERTA"}
];

try {
  console.log('Iniciando testes do frontend (simulação)...');

  // Teste 1: Filtragem por estado ABERTA e ordem ascendente
  const resultAsc = filterAndSort(data, 'asc');
  assert.strictEqual(resultAsc.length, 4, 'Deveria retornar 4 solicitações ABERTAS');
  assert.strictEqual(resultAsc[0].codigo, 'SOL-0001', 'A primeira deve ser a mais antiga (01/03)');
  assert.strictEqual(resultAsc[1].codigo, 'SOL-0005', 'A segunda deve ser (10/03 09:10)');
  assert.strictEqual(resultAsc[2].codigo, 'SOL-0003', 'A terceira deve ser (10/03 10:10)');
  assert.strictEqual(resultAsc[3].codigo, 'SOL-0017', 'A quarta deve ser a mais recente (17/03)');

  console.log('✔ Teste 1: Ordenação ascendente e filtro ABERTA aprovados.');

  // Teste 2: Ordem descendente
  const resultDesc = filterAndSort(data, 'desc');
  assert.strictEqual(resultDesc.length, 4, 'Deveria retornar 4 solicitações ABERTAS');
  assert.strictEqual(resultDesc[0].codigo, 'SOL-0017', 'A primeira deve ser a mais recente (17/03)');
  assert.strictEqual(resultDesc[3].codigo, 'SOL-0001', 'A quarta deve ser a mais antiga (01/03)');

  console.log('✔ Teste 2: Ordenação descendente aprovada.');

  // Teste 3: Tratamento de nome e email
  const carlosResult = resultAsc.find(s => s.codigo === 'SOL-0003');
  assert.strictEqual(carlosResult.nomeCliente, 'Carlos', 'O nome deve ter os espaços removidos pelo trim()');
  assert.strictEqual(carlosResult.emailCliente, '', 'O email deve ser retornado vazio e não undefined se ausente');

  console.log('✔ Teste 3: Tratamento de strings e espaços aprovados.');

  // Teste 4: Tratamento de nome e email nulos
  const nullResult = resultAsc.find(s => s.codigo === 'SOL-0005');
  assert.strictEqual(nullResult.nomeCliente, 'Cliente', 'Deveria usar valor padrão "Cliente" para nome nulo');
  assert.strictEqual(nullResult.emailCliente, '', 'Deveria usar valor padrão vazio para email nulo');

  console.log('✔ Teste 4: Tratamento de valores nulos aprovados.');

  console.log('\nTodos os testes passaram com sucesso! 🚀');
} catch (error) {
  console.error('\n❌ Falha nos testes:', error.message);
  process.exit(1);
}
