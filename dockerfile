# 1. Imagem base do Node.js
FROM node:18-alpine AS builder

# 2. Define o diretório de trabalho dentro do container
WORKDIR /app

# 3. Copia os arquivos de dependência
COPY package.json package-lock.json ./

# 4. Instala as dependências de produção
RUN npm ci --only=production

# 5. Copia o restante do código fonte
COPY . .

# 6. Compila o TypeScript para JavaScript
RUN npm run build

# --- Estágio de Produção ---
FROM node:18-alpine

WORKDIR /app

# Copia as dependências de produção do estágio anterior
COPY --from=builder /app/node_modules ./node_modules

# Copia os arquivos compilados (dist) do estágio anterior
COPY --from=builder /app/dist ./dist

# Copia os templates MJML e a pasta public
COPY src/mail/templates ./src/mail/templates
COPY public ./public

# 7. Expõe a porta que a aplicação usa (definida no .env ou padrão 5015/3010)
# Vamos usar 5015 como padrão, ajuste se necessário
EXPOSE 5015

# 8. Define variáveis de ambiente padrão (podem ser sobrescritas no `docker run`)
ENV NODE_ENV=production
ENV PORT=5015

# 9. Comando para iniciar a aplicação quando o container iniciar
CMD ["node", "dist/server.js"]