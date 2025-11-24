#!/bin/bash

# ==============================================================================
# Script de Deploy - Mail Sender Microservice
# ==============================================================================

set -e  # Sai em caso de erro

echo "🚀 Iniciando processo de deploy..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se o arquivo .env existe
if [ ! -f .env ]; then
    echo -e "${RED}❌ Erro: arquivo .env não encontrado!${NC}"
    echo -e "${YELLOW}💡 Copie o arquivo .env.production e configure as variáveis:${NC}"
    echo "   cp .env.production .env"
    exit 1
fi

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Erro: Docker não está rodando!${NC}"
    exit 1
fi

# Perguntar se quer fazer build
read -p "Fazer build da imagem? (s/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    echo -e "${GREEN}📦 Construindo imagem Docker...${NC}"
    docker-compose build mailsender
    
    # Perguntar se quer fazer push para Docker Hub
    read -p "Fazer push da imagem para Docker Hub? (s/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        echo -e "${GREEN}⬆️  Enviando imagem para Docker Hub...${NC}"
        docker push ruanlopes1350/mailsender:latest
    fi
fi

# Parar containers existentes
echo -e "${YELLOW}🛑 Parando containers existentes...${NC}"
docker-compose down

# Iniciar serviços
echo -e "${GREEN}▶️  Iniciando serviços...${NC}"
docker-compose up -d

# Aguardar serviços ficarem prontos
echo -e "${YELLOW}⏳ Aguardando serviços ficarem prontos...${NC}"
sleep 10

# Verificar status
echo -e "${GREEN}✅ Verificando status dos containers...${NC}"
docker-compose ps

# Mostrar logs
echo -e "${YELLOW}📄 Últimas linhas dos logs:${NC}"
docker-compose logs --tail=20 mailsender

echo -e "${GREEN}✅ Deploy concluído!${NC}"
echo -e "${YELLOW}📝 Para ver os logs em tempo real, execute:${NC}"
echo "   docker-compose logs -f mailsender"
