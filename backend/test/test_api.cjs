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
    console.log('Login status:', res.statusCode);
    console.log('Login body:', body);
    const token = JSON.parse(body).token;
    console.log('Token:', token);

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
