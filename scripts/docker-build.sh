#!/bin/bash

# Build da aplicação TypeScript
echo "Building TypeScript..."
npm run build

# Build da imagem Docker
echo "Building Docker image..."
docker build -f Dockerfile.lambda -t arithimancia-api:latest .

echo "Build completed!"
