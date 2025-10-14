# Deployment Guide

## Docker Deployment

### Using Docker Compose

1. **Clone and Setup**

```bash
git clone <repository-url>
cd LensCore
cp env.example .env
```

2. **Configure Environment**
   Edit `.env` file with your configuration:

```env
NODE_ENV=production
PORT=3001
STORAGE_TYPE=s3
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=your_bucket
```

3. **Start Services**

```bash
docker-compose up -d
```

4. **Verify Deployment**

```bash
curl http://localhost:3001/api/health
```

### Using Docker

1. **Build Image**

```bash
docker build -t lenscore .
```

2. **Run Container**

```bash
docker run -d \
  --name lenscore \
  -p 3001:3001 \
  -e NODE_ENV=production \
  -e STORAGE_TYPE=s3 \
  -e AWS_ACCESS_KEY_ID=your_key \
  -e AWS_SECRET_ACCESS_KEY=your_secret \
  -e AWS_REGION=us-east-1 \
  -e AWS_S3_BUCKET=your_bucket \
  lenscore
```

## Cloud Deployment

### AWS ECS

1. **Create Task Definition**

```json
{
  "family": "lenscore",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "lenscore",
      "image": "your-account.dkr.ecr.region.amazonaws.com/lenscore:latest",
      "portMappings": [
        {
          "containerPort": 3001,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "STORAGE_TYPE",
          "value": "s3"
        }
      ],
      "secrets": [
        {
          "name": "AWS_ACCESS_KEY_ID",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:lenscore/aws-key"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/lenscore",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

2. **Create Service**

```bash
aws ecs create-service \
  --cluster your-cluster \
  --service-name lenscore \
  --task-definition lenscore:1 \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-12345],securityGroups=[sg-12345],assignPublicIp=ENABLED}"
```

### Google Cloud Run

1. **Build and Push**

```bash
docker build -t gcr.io/your-project/lenscore .
docker push gcr.io/your-project/lenscore
```

2. **Deploy**

```bash
gcloud run deploy lenscore \
  --image gcr.io/your-project/lenscore \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3001 \
  --set-env-vars NODE_ENV=production,STORAGE_TYPE=gcs
```

### Kubernetes

1. **Create Deployment**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: lenscore
spec:
  replicas: 3
  selector:
    matchLabels:
      app: lenscore
  template:
    metadata:
      labels:
        app: lenscore
    spec:
      containers:
        - name: lenscore
          image: lenscore:latest
          ports:
            - containerPort: 3001
          env:
            - name: NODE_ENV
              value: 'production'
            - name: STORAGE_TYPE
              value: 's3'
          resources:
            requests:
              memory: '512Mi'
              cpu: '250m'
            limits:
              memory: '1Gi'
              cpu: '500m'
```

2. **Create Service**

```yaml
apiVersion: v1
kind: Service
metadata:
  name: lenscore-service
spec:
  selector:
    app: lenscore
  ports:
    - port: 80
      targetPort: 3001
  type: LoadBalancer
```

## Production Considerations

### Environment Variables

- Set `NODE_ENV=production`
- Configure storage backend
- Set appropriate log levels
- Configure rate limiting
- Set up monitoring

### Security

- Use HTTPS in production
- Implement authentication if needed
- Configure CORS properly
- Set up rate limiting
- Monitor logs and metrics

### Performance

- Adjust concurrency settings
- Configure timeouts appropriately
- Monitor memory usage
- Set up health checks
- Configure logging levels

### Monitoring

- Set up health checks
- Monitor response times
- Track error rates
- Monitor resource usage
- Set up alerts

### Scaling

- Use load balancers
- Implement horizontal scaling
- Monitor resource usage
- Set up auto-scaling
- Configure caching

## Troubleshooting

### Common Issues

- Check logs for errors
- Verify environment variables
- Check network connectivity
- Verify storage configuration
- Check resource limits

### Debug Mode

```bash
DEBUG=* npm start
```

### Health Checks

```bash
curl http://localhost:3001/api/health
```

### Logs

```bash
docker logs lenscore
```

### Resource Usage

```bash
docker stats lenscore
```
