#!/usr/bin/env node

/**
 * Script para validar a configuração do Vercel
 */

import { promises as fs } from 'fs';
import path from 'path';

const requiredFiles = [
  'vercel.json',
  'package.json',
  'api/index.ts',
  'src/app.ts',
  'public/index.html'
];

const requiredEnvVars = [
  'MASTER_KEY',
  'SENDER_EMAIL',
  'APP_PASSWORD',
  'MONGO_URI'
];

async function validateVercelConfig() {
  console.log('🔍 Validando configuração do Vercel...\n');

  // Verificar arquivos obrigatórios
  console.log('📁 Verificando arquivos necessários:');
  for (const file of requiredFiles) {
    try {
      await fs.access(file);
      console.log(`✅ ${file}`);
    } catch (error) {
      console.log(`❌ ${file} - ARQUIVO FALTANDO!`);
      return false;
    }
  }

  // Verificar configuração do package.json
  console.log('\n📦 Verificando package.json:');
  try {
    const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
    
    if (packageJson.type === 'module') {
      console.log('✅ Configurado como módulo ES');
    } else {
      console.log('⚠️  Não configurado como módulo ES');
    }

    if (packageJson.devDependencies['@vercel/node']) {
      console.log('✅ @vercel/node instalado');
    } else {
      console.log('❌ @vercel/node não encontrado nas dependências');
    }
  } catch (error) {
    console.log('❌ Erro ao ler package.json');
    return false;
  }

  // Verificar configuração do vercel.json
  console.log('\n⚙️ Verificando vercel.json:');
  try {
    const vercelConfig = JSON.parse(await fs.readFile('vercel.json', 'utf8'));
    
    if (vercelConfig.version === 2) {
      console.log('✅ Versão 2 configurada');
    }
    
    if (vercelConfig.builds && vercelConfig.builds.length > 0) {
      console.log('✅ Builds configurados');
    }
    
    if (vercelConfig.routes && vercelConfig.routes.length > 0) {
      console.log('✅ Rotas configuradas');
    }
  } catch (error) {
    console.log('❌ Erro ao ler vercel.json');
    return false;
  }

  // Verificar .env.example
  console.log('\n🔐 Verificando .env.example:');
  try {
    const envExample = await fs.readFile('.env.example', 'utf8');
    
    for (const envVar of requiredEnvVars) {
      if (envExample.includes(envVar)) {
        console.log(`✅ ${envVar} documentado`);
      } else {
        console.log(`⚠️  ${envVar} não documentado`);
      }
    }
  } catch (error) {
    console.log('❌ Erro ao ler .env.example');
  }

  console.log('\n🎉 Validação concluída!');
  console.log('\n📋 Próximos passos:');
  console.log('1. Configure as variáveis de ambiente no Vercel');
  console.log('2. Faça o deploy: vercel --prod');
  console.log('3. Teste os endpoints após o deploy');
  console.log('\n📖 Consulte VERCEL_DEPLOY.md para instruções detalhadas');

  return true;
}

validateVercelConfig().catch(console.error);