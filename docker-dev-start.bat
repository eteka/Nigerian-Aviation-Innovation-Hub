@echo off
echo ========================================
echo Nigeria Aviation Innovation Hub
echo Docker Development Environment
echo ========================================
echo.

echo Starting services...
docker-compose -f docker-compose.dev.yml up -d

echo.
echo Waiting for services to be ready...
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo Services Started Successfully!
echo ========================================
echo.
echo Frontend:  http://localhost:3000
echo API:       http://localhost:5000
echo API Docs:  http://localhost:5000/api/docs
echo Adminer:   http://localhost:8080
echo.
echo Database Connection (Adminer):
echo   System:   PostgreSQL
echo   Server:   db
echo   Username: aviation_user
echo   Password: dev_password_123
echo   Database: aviation_hub_dev
echo.
echo ========================================
echo.
echo To view logs: docker-compose -f docker-compose.dev.yml logs -f
echo To stop:      docker-compose -f docker-compose.dev.yml down
echo.
pause
