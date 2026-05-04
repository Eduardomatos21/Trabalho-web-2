const http = require('http');

const loginData = JSON.stringify({
  email: 'maria@demo.com',
  senha: '1234'
});

const reqLogin = http.request({
  hostname: 'localhost',
  port: 8081,
  path: '/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': loginData.length
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    const token = JSON.parse(body).token;
    
    // Now call the reverted endpoint: /funcionario/solicitacoes/abertas
    // Wait, the user reverted the frontend to call /abertas
    // But the backend is still /funcionario/solicitacoes/abertas because the class has @RequestMapping("/funcionario/solicitacoes")!
    // If the frontend calls /abertas, it gets 404!
    const reqAbertas = http.request({
      hostname: 'localhost',
      port: 8081,
      path: '/funcionario/solicitacoes/abertas',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }, (resAbertas) => {
      let bodyAbertas = '';
      resAbertas.on('data', chunk => bodyAbertas += chunk);
      resAbertas.on('end', () => {
        console.log('Abertas status:', resAbertas.statusCode);
        console.log('Abertas body:', bodyAbertas);
      });
    });
    reqAbertas.end();
  });
});

reqLogin.write(loginData);
reqLogin.end();
