# Build script for Windows (PowerShell)
# This script prepares the deployment package for Terraform

Write-Host "🏗️  Starting build process..."

# 1. Clean dist folder
if (Test-Path "dist") {
    Remove-Item -Path "dist" -Recurse -Force
}
New-Item -ItemType Directory -Path "dist" | Out-Null

# 2. Compile TypeScript
Write-Host "📦 Compiling TypeScript..."
call npx tsc

# 3. Copy package.json and install production dependencies
Write-Host "📥 Installing production dependencies..."
Copy-Item "package.json" -Destination "dist/package.json"
Copy-Item "package-lock.json" -Destination "dist/package-lock.json"
# Copy Prisma schema for runtime usage if needed (usually generated client is enough, but schema is good for reference)
New-Item -ItemType Directory -Path "dist/prisma" | Out-Null
Copy-Item "prisma/schema.prisma" -Destination "dist/prisma/schema.prisma"

Set-Location "dist"
npm install --production --no-bin-links --legacy-peer-deps
# Generate Prisma Client in dist/node_modules
npx prisma generate --schema=./prisma/schema.prisma

# Copy Prisma engine for Linux (Lambda compatibility)
Write-Host "📦 Copying Prisma engine for Lambda..."
Copy-Item "../node_modules/.prisma/client/libquery_engine-rhel-openssl-3.0.x.so.node" -Destination "node_modules/.prisma/client/" -ErrorAction SilentlyContinue

Set-Location ..

# 4. Create ZIP file
Write-Host "🤐 Zipping artifacts..."
Set-Location "dist"
$compress = @{
    Path = "*"
    CompressionLevel = "Fastest"
    DestinationPath = "function.zip"
}
Compress-Archive @compress -Force
Set-Location ".."

Write-Host "✅ Build complete! Artifact: dist/function.zip"
