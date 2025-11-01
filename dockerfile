# ==============================================================================
# ESTÁGIO 1: Builder - Compilação do TypeScript
# ==============================================================================
FROM node:20-alpine AS builder

# Instala dependências do sistema necessárias para compilação
RUN apk add --no-cache python3 make g++

# Define o diretório de trabalho
WORKDIR /app

# Copia apenas os arquivos de dependências primeiro (cache layer)
COPY package*.json ./

# Instala TODAS as dependências (incluindo devDependencies para build)
RUN npm ci

# Copia o código fonte
COPY . .

# Compila o TypeScript para JavaScript
RUN npm run build

# Remove devDependencies após build
RUN npm prune --production

# ==============================================================================
# ESTÁGIO 2: Produção - Imagem final otimizada
# ==============================================================================
FROM node:20-alpine

# Adiciona metadados à imagem
LABEL maintainer="intel.spec.lopes@gmail.com"
LABEL description="Mail Sender Microservice"
LABEL version="2.0.0"

# Instala apenas dumb-init para gerenciamento de processos
RUN apk add --no-cache dumb-init

# Cria usuário não-root para executar a aplicação (segurança)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Define o diretório de trabalho
WORKDIR /app

# Copia as dependências de produção do estágio de build
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copia os arquivos compilados
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist

# Copia os templates MJML e arquivos estáticos
COPY --chown=nodejs:nodejs src/mail/templates ./src/mail/templates
COPY --chown=nodejs:nodejs public ./public

# Copia o package.json (necessário para metadados)
COPY --chown=nodejs:nodejs package.json ./

# Muda para o usuário não-root
USER nodejs

# Expõe a porta da aplicação
EXPOSE 5016

# Define variáveis de ambiente padrão
ENV NODE_ENV=production \
    PORT=5016 \
    NODE_OPTIONS="--max-old-space-size=512"

# Healthcheck para verificar se o container está saudável
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5016/api', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Usa dumb-init para gerenciar sinais corretamente
ENTRYPOINT ["dumb-init", "--"]

# Comando para iniciar a aplicação
CMD ["node", "dist/server.js"]