# Deploy do Mailsender Backend no Kubernetes

Este guia explica como fazer o deploy do backend do Mailsender no Kubernetes.

## Pré-requisitos

- Acesso ao cluster Kubernetes configurado
- kubectl instalado e configurado
- Docker instalado para build das imagens
- Conta no Docker Hub (ruanlopes1350)

## Estrutura dos Arquivos

- `backend-configmap.example.yaml` - Template de configuração (copiar e editar)
- `deploy-mongodb.yaml` - Deploy do MongoDB com PersistentVolume
- `deploy-redis.yaml` - Deploy do Redis com PersistentVolume  
- `deploy-backend.yaml` - Deploy da API do backend

## Passo a Passo

### 1. Preparar ConfigMap

```bash
# Copiar o template
cp backend-configmap.example.yaml backend-configmap.yaml

# Editar e substituir os placeholders:
# - <MONGO_USER> e <MONGO_PASSWORD>
# - <REPLACE_WITH_SECURE_PASSWORD> (Redis)
# - <REPLACE_WITH_SECURE_MASTER_KEY>
# - <REPLACE_WITH_SECURE_JWT_SECRET>
# - <REPLACE_WITH_SECURE_ADMIN_PASSWORD>
```

**Gerar secrets seguros:**
```bash
openssl rand -base64 48  # Para JWT_SECRET e MASTER_KEY
```

### 2. Build e Push da Imagem Docker

```bash
# Build da imagem
docker build -t ruanlopes1350/mailsender-backend:latest -f dockerfile .

# Login no Docker Hub (se necessário)
docker login

# Push da imagem
docker push ruanlopes1350/mailsender-backend:latest
```

### 3. Deploy no Kubernetes

```bash
# Aplicar ConfigMap (com suas configurações)
kubectl apply -f backend-configmap.yaml

# Deploy do MongoDB
kubectl apply -f deploy-mongodb.yaml

# Deploy do Redis
kubectl apply -f deploy-redis.yaml

# Aguardar MongoDB e Redis estarem prontos
kubectl wait --for=condition=ready pod -l app=mailsender-mongodb --timeout=120s
kubectl wait --for=condition=ready pod -l app=mailsender-redis --timeout=120s

# Deploy da API
kubectl apply -f deploy-backend.yaml
```

### 4. Verificar o Deploy

```bash
# Ver todos os recursos
kubectl get all -l app=mailsender-backend
kubectl get all -l app=mailsender-mongodb
kubectl get all -l app=mailsender-redis

# Ou ver tudo de uma vez
kubectl get all | grep mailsender

# Ver logs da API
kubectl logs -f deployment/mailsender-backend

# Verificar se os pods estão rodando
kubectl get pods

# Descrever um pod (para troubleshooting)
kubectl describe pod <nome-do-pod>
```

### 5. Acessar o Serviço

O serviço é exposto internamente no cluster como `api-mailsender` na porta 80.

Para acesso externo, configure um Ingress ou use port-forward para testes:

```bash
# Port forward para teste local
kubectl port-forward service/api-mailsender 5016:80

# Testar
curl http://localhost:5016/api
```

## Atualizar Deploy

### Atualização do Código

Quando fizer alterações no código:

```bash
# 1. Build nova imagem
docker build -t ruanlopes1350/mailsender-backend:latest -f dockerfile .

# 2. Push para Docker Hub
docker push ruanlopes1350/mailsender-backend:latest

# 3. Forçar atualização no Kubernetes (rollout)
kubectl rollout restart deployment/mailsender-backend

# 4. Acompanhar o rollout
kubectl rollout status deployment/mailsender-backend
```

### Atualização do ConfigMap

Quando alterar configurações no ConfigMap:

```bash
# 1. Editar o arquivo
vim backend-configmap.yaml

# 2. Aplicar as mudanças
kubectl apply -f backend-configmap.yaml

# 3. Reiniciar o deployment para carregar as novas configurações
kubectl rollout restart deployment/mailsender-backend

# 4. Verificar se aplicou corretamente
kubectl rollout status deployment/mailsender-backend
```

## Troubleshooting

### Pod não inicia

```bash
# Ver eventos do pod
kubectl describe pod <pod-name>

# Ver logs
kubectl logs <pod-name>

# Ver logs anteriores (se o pod reiniciou)
kubectl logs <pod-name> --previous
```

### Verificar ConfigMap

```bash
kubectl get configmap mailsender-backend-env -o yaml
```

### Verificar PersistentVolumes

```bash
kubectl get pvc
kubectl describe pvc mongo-mailsender-pvc
kubectl describe pvc redis-mailsender-pvc
```

### Testar conectividade

```bash
# Entrar em um pod para testar conexões
kubectl exec -it deployment/mailsender-backend -- sh

# Dentro do pod, testar:
ping mailsender-mongodb
ping mailsender-redis
curl http://localhost:5016/api
```

## Limpar Recursos

Para remover tudo:

```bash
kubectl delete -f deploy-backend.yaml
kubectl delete -f deploy-redis.yaml
kubectl delete -f deploy-mongodb.yaml
kubectl delete -f backend-configmap.yaml

# Remover PVCs (isso apaga os dados!)
kubectl delete pvc mongo-mailsender-pvc
kubectl delete pvc redis-mailsender-pvc
```

## Backup dos Dados

### Backup do MongoDB

```bash
# Entrar no pod do MongoDB
kubectl exec -it deployment/mongo-mailsender -- sh

# Fazer backup
mongodump --uri="mongodb://user:pass@localhost:27017/mailsender" --out=/tmp/backup

# Copiar backup para fora do pod
kubectl cp mongo-mailsender-<pod-id>:/tmp/backup ./backup-$(date +%Y%m%d)
```

### Backup do Redis

```bash
# O Redis já persiste com AOF (append-only file)
# Para backup manual:
kubectl exec -it deployment/redis-mailsender -- redis-cli -a $REDIS_PASSWORD BGSAVE
```

## Monitoramento

Ver métricas de recursos:

```bash
# Uso de CPU e memória
kubectl top pod -l app=mailsender-backend
kubectl top pod -l app=mailsender-mongodb
kubectl top pod -l app=mailsender-redis
```

## Notas Importantes

1. **Secrets**: Em produção, use Kubernetes Secrets ao invés de ConfigMap para dados sensíveis
2. **Storage**: Os PVCs usam 2Gi (MongoDB) e 1Gi (Redis) - ajuste conforme necessário
3. **Recursos**: Os limits estão definidos para ambientes compartilhados - ajuste conforme sua necessidade
4. **Backup**: Configure backups automáticos dos PVCs em produção
5. **Segurança**: O nome do serviço no cluster será usado como subdomínio
