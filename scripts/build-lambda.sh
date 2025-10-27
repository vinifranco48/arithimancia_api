#!/bin/bash

# Script para build da aplicação para AWS Lambda

echo "🏗️  Building Arithimancia API for AWS Lambda..."

# Limpar build anterior
echo "🧹 Cleaning previous build..."
rm -rf dist

# Compilar TypeScript
echo "📦 Compiling TypeScript..."
npx tsc

# Gerar Prisma Client para Lambda (Linux)
echo "🔄 Generating Prisma Client for Lambda..."
npx prisma generate

# Copiar arquivos necessários
echo "📋 Copying necessary files..."
cp package.json dist/
cp package-lock.json dist/
cp -r prisma dist/

# Instalar dependências de produção
echo "📦 Installing production dependencies..."
cd dist
npm ci --only=production

echo "✅ Build completed successfully!"
echo ""
echo "📊 Build size:"
du -sh .
echo ""
echo "🚀 Ready to deploy with: serverless deploy"