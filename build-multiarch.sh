#!/bin/bash

# Script pour construire et pousser des images multi-architecture avec buildx
# Usage: ./build-multiarch.sh [tag]

set -e

REGISTRY="europe-west1-docker.pkg.dev/rognons/docker"
GIT_COMMIT=$(git rev-parse HEAD)
TAG=${1:-$GIT_COMMIT}

echo "🏗️ Building multi-architecture images with buildx..."
echo "Registry: $REGISTRY"
echo "Git commit: $GIT_COMMIT"
echo "Tag: $TAG"

# Créer/utiliser le builder multi-arch
echo "📦 Setting up buildx..."
docker buildx create --name multiarch --use 2>/dev/null || docker buildx use multiarch

# Vérifier que le builder supporte les plateformes nécessaires
echo "🔍 Checking supported platforms..."
docker buildx inspect --bootstrap

# Construire et pousser l'API
echo ""
echo "🦕 Building API image for multiple architectures..."
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --tag $REGISTRY/mon-bouchon_api:$TAG \
  --tag $REGISTRY/mon-bouchon_api:latest \
  --push \
  ./api

# Construire et pousser le Front
echo ""
echo "🎨 Building Front image for multiple architectures..."
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --tag $REGISTRY/mon-bouchon_front:$TAG \
  --tag $REGISTRY/mon-bouchon_front:latest \
  --push \
  ./front

echo ""
echo "✅ Multi-architecture images built and pushed successfully!"
echo "📍 Images disponibles:"
echo "   API:   $REGISTRY/mon-bouchon_api:$TAG"
echo "   API:   $REGISTRY/mon-bouchon_api:latest"
echo "   Front: $REGISTRY/mon-bouchon_front:$TAG"
echo "   Front: $REGISTRY/mon-bouchon_front:latest"
echo ""
echo "🐳 Pour tester localement:"
echo "   docker run -p 8000:8000 $REGISTRY/mon-bouchon_api:latest"
echo "   docker run -p 4321:4321 $REGISTRY/mon-bouchon_front:latest"