async function enviarEmail() {
  const response = await fetch('http://localhost:5016/api/emails/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': '' // <- sua chave de API dentro das aspas simples
    },
    body: JSON.stringify({
      to: '', // <- email de destinatário
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