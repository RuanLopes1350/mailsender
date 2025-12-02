# Deploy Backend - Mail Sender

## Pré-requisitos

- Cluster Kubernetes configurado
- `kubectl` instalado e configurado
- Docker instalado (para build da imagem)
- Conta no Docker Hub (ou outro registry)

## 1. Build e Push da Imagem

```bash
cd /Users/ruanlopes/Documents/mailsender/backend

# Build da imagem
docker build -t ruanlopes1350/mailsender-backend:latest -f dockerfile .

# Push para o Docker Hub
docker push ruanlopes1350/mailsender-backend:latest
```

**Nota**: Ajuste o nome da imagem (`ruanlopes1350`) para o seu usuário do Docker Hub.

## 2. Configurar Variáveis de Ambiente

Antes do deploy, edite o arquivo `backend-configmap.yaml` e ajuste as seguintes variáveis:

```yaml
# Segurança - GERAR VALORES SEGUROS EM PRODUÇÃO
MASTER_KEY: "<GERAR_NOVO>"
JWT_SECRET: "<GERAR_NOVO>"
ADMIN_PASSWORD: "<SENHA_SEGURA>"
REDIS_PASSWORD: "<SENHA_REDIS>"

# MongoDB credentials
DB_URL: "mongodb://<USER>:<PASSWORD>@mongo-mailsender:27017/mailsender?authSource=admin"
```

**Gerar secrets seguros:**
```bash
# Para JWT_SECRET e MASTER_KEY
openssl rand -base64 32

# Para senhas
openssl rand -base64 24
```

## 3. Deploy no Kubernetes

Execute os comandos na seguinte ordem:

```bash
cd /Users/ruanlopes/Documents/mailsender/backend/deploy

# 1. MongoDB
kubectl apply -f deploy/deploy-mongodb.yaml

# 2. Redis
kubectl apply -f deploy/deploy-redis.yaml

# Aguardar MongoDB e Redis iniciarem
kubectl wait --for=condition=ready pod -l app=mongo-mailsender --timeout=120s
kubectl wait --for=condition=ready pod -l app=redis-mailsender --timeout=120s

# 3. Backend ConfigMap
kubectl apply -f deploy/backend-configmap.yaml

# 4. Backend Deployment
kubectl apply -f deploy/deploy-backend.yaml
```

## 4. Verificar Status

```bash
# Verificar todos os pods do mailsender
kubectl get pods | grep mailsender

# Logs do backend
kubectl logs -f deploy/mailsender-backend

# Logs do MongoDB
kubectl logs -f deploy/mongo-mailsender

# Logs do Redis
kubectl logs -f deploy/redis-mailsender

# Status detalhado
kubectl describe deployment mailsender-backend
```

## 5. Testar a API

```bash
# Health check (dentro do cluster)
kubectl run -it --rm debug --image=curlimages/curl --restart=Never -- \
  curl http://mailsender-backend/api

# Status detalhado
kubectl run -it --rm debug --image=curlimages/curl --restart=Never -- \
  curl http://mailsender-backend/api/status
```

## 6. Expor a API (Opcional)

Para acessar a API externamente, você pode criar um Ingress ou usar Port Forward:

### Port Forward (desenvolvimento)
```bash
kubectl port-forward service/mailsender-backend 5016:80
# Acesse: http://localhost:5016/api
```

### Ingress (produção)
Crie um arquivo `ingress.yaml`:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: mailsender-backend-ingress
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - api-mailsender.seudominio.com
      secretName: mailsender-backend-tls
  rules:
    - host: api-mailsender.seudominio.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: mailsender-backend
                port:
                  number: 80
```

Aplique:
```bash
kubectl apply -f ingress.yaml
```

## 7. Atualizar a Aplicação

Após fazer alterações no código:

```bash
# 1. Build da nova versão
docker build -t ruanlopes1350/mailsender-backend:latest -f dockerfile .
docker push ruanlopes1350/mailsender-backend:latest

# 2. Forçar atualização do deployment
kubectl rollout restart deployment/mailsender-backend

# 3. Acompanhar o rollout
kubectl rollout status deployment/mailsender-backend
```

## 8. Remover Deploy

```bash
# Remover na ordem inversa
kubectl delete -f deploy/deploy-backend.yaml
kubectl delete -f deploy/backend-configmap.yaml
kubectl delete -f deploy/deploy-redis.yaml
kubectl delete -f deploy/deploy-mongodb.yaml
```

**⚠️ ATENÇÃO**: Isso também removerá os PersistentVolumeClaims e os dados armazenados!

## Estrutura de Arquivos

```
backend/deploy/
├── README.md                       # Este arquivo
├── backend-configmap.example.yaml  # Exemplo de configuração
├── backend-configmap.yaml          # Configuração real (não commitar)
├── deploy-backend.yaml             # Deployment + Service do backend
├── deploy-mongodb.yaml             # PVC + Deployment + Service do MongoDB
└── deploy-redis.yaml               # PVC + Deployment + Service do Redis
```

## URLs e Portas

- **Backend API**: `http://mailsender-backend:80` (interno ao cluster)
- **MongoDB**: `mongodb://mongo-mailsender:27017` (interno ao cluster)
- **Redis**: `redis://redis-mailsender:6379` (interno ao cluster)

## Recursos Alocados

### Backend
- **Requests**: 256Mi RAM, 0.25 CPU
- **Limits**: 512Mi RAM, 0.5 CPU

### MongoDB
- **Requests**: 256Mi RAM, 0.25 CPU
- **Limits**: 512Mi RAM, 0.5 CPU
- **Storage**: 2Gi

### Redis
- **Requests**: 128Mi RAM, 0.1 CPU
- **Limits**: 256Mi RAM, 0.25 CPU
- **Storage**: 1Gi

## Troubleshooting

### Pod não inicia
```bash
kubectl describe pod <pod-name>
kubectl logs <pod-name>
```

### Erro de conexão com MongoDB
```bash
# Verificar se o MongoDB está rodando
kubectl get pods -l app=mongo-mailsender

# Testar conexão
kubectl run -it --rm mongo-test --image=mongo:8 --restart=Never -- \
  mongosh mongodb://mailsender:M@ilS3nd3r2024!@mongo-mailsender:27017/mailsender?authSource=admin
```

### Erro de conexão com Redis
```bash
# Verificar se o Redis está rodando
kubectl get pods -l app=redis-mailsender

# Testar conexão
kubectl run -it --rm redis-test --image=redis:alpine --restart=Never -- \
  redis-cli -h redis-mailsender -p 6379 -a R3d!sM@ilS3nd3r2024 ping
```

## Segurança

- Todos os containers rodam com usuário não-root
- Capabilities DROP ALL aplicadas
- ReadOnlyRootFilesystem quando possível
- Senhas e secrets devem ser alterados em produção
- Use Kubernetes Secrets para dados sensíveis em produção

## Próximos Passos

1. Configurar backup automático do MongoDB
2. Implementar monitoramento com Prometheus
3. Configurar alertas
4. Implementar CI/CD para deploys automáticos
5. Configurar frontend do mailsender
