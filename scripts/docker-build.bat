@echo off

REM Build da aplicação TypeScript
echo Building TypeScript...
call npm run build

REM Build da imagem Docker
echo Building Docker image...
docker build -f Dockerfile.lambda -t arithimancia-api:latest .

echo Build completed!
