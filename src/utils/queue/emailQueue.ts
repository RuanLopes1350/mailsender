import { Queue } from 'bullmq';
import { redisConfig } from '../../config/redis.js';
import ConfigRepository from '../../repository/configRepository.js';

const configRepository = new ConfigRepository();
let retentativas = 3; // Valor padrão inicial

// Função para obter o número de retentativas da configuração
export async function getRetentativas() {
  try {
    const config = await configRepository.obterConfig();
    retentativas = config ? config.retentativas : 3; // Valor padrão de 3 se não definido
    return retentativas;
  } catch (error) {
    console.log('Erro ao obter retentativas da configuração:', error);
    return 3; // Valor padrão em caso de erro
  }
}

// Inicializa o valor de retentativas ao carregar o módulo
getRetentativas();

// Função para atualizar o número de retentativas
export async function updateRetentativas(novoValor: number) {
  retentativas = novoValor;
}

// Cria a fila chamada 'email-sending'
export const emailQueue = new Queue('email-sending', {
  connection: redisConfig,
});