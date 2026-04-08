# Dragonfly Deployment Script
# Deploys Dragonfly to the Oracle Cloud Kubernetes cluster

# Add Dragonfly Helm repository
helm repo add dragonfly https://dragonflydb.github.io/dragonfly-helm
helm repo update

# Install Dragonfly
helm install dragonfly dragonfly/dragonfly \
  --namespace redis \
  --create-namespace \
  --values kubernetes/dragonfly/values.yaml \
  --set fullnameOverride=dragonfly

# Verify deployment
kubectl get pods -n redis
kubectl get svc -n redis
