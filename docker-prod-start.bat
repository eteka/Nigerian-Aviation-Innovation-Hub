@echo off
echo ========================================
echo Nigeria Aviation Innovation Hub
echo Docker Production Environment
echo ========================================
echo.

if not exist .env (
    echo ERROR: .env file not found!
    echo.
    echo Please create .env file with production configuration:
    echo   1. Copy .env.docker.prod.example to .env
    echo   2. Edit .env and set secure values
    echo.
    pause
    exit /b 1
)

echo Building production images...
docker-compose -f docker-compose.prod.yml build

echo.
echo Starting services...
docker-compose -f docker-compose.prod.yml up -d

echo.
echo Waiting for services to be ready...
timeout /t 10 /nobreak >nul

echo.
echo Running database initialization...
docker-compose -f docker-compose.prod.yml exec -T api sh scripts/docker-init-prod.sh

echo.
echo ========================================
echo Production Environment Ready!
echo ========================================
echo.
echo To view logs: docker-compose -f docker-compose.prod.yml logs -f
echo To stop:      docker-compose -f docker-compose.prod.yml down
echo.
pause
