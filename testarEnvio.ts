async function enviarEmail() {
  const response = await fetch('http://localhost:5016/api/emails/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': '85d83f9b.ee034ff05aeea4d7b90f1c65cfa7005533ba91abc53a6c68ec8e6ebcb1829e1f' // <- sua chave de API dentro das aspas simples
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