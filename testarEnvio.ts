async function enviarEmail() {
  const response = await fetch('http://localhost:5016/api/emails/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': '875d4e59329bd18ffe444f6040fa9610ac4f762184c6dcc5cedec187e19714fc' // <- sua chave de API dentro das aspas simples
    },
    body: JSON.stringify({
      to: 'intel.spec.lopes@gmail.com', // <- email de destinatário
      subject: 'Bem-vindo!', // <- assunto do email
      template: 'generico', // <- template usado (pode ser encontrado a lista no Repositório)
      // aqui são os campos do template que escolheu
      data: {
        nomeSistema: 'Meu App',
        nome: 'Ruan Lopes',
        mostrarBotao: true,
        textoBotao: 'Começar',
        urlBotao: 'https://app.com/login'
      }
    })
  });

  const result = await response.json();
  console.log(result);
}

enviarEmail();