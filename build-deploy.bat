@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ====================================
echo User Management - Deploy Package
echo ====================================
echo.

for /f "tokens=2 delims==" %%a in ('wmic os get localdatetime /value') do set "dt=%%a"
set "TIMESTAMP=%dt:~0,8%_%dt:~8,6%"
set "OUTPUT_DIR=deploy\user-management-%TIMESTAMP%"

echo [1/6] Clean deploy folder...
if exist deploy rmdir /s /q deploy 2>nul
mkdir deploy

echo.
echo [2/6] Build frontend...
cd frontend
call npm run build
if errorlevel 1 (
    echo Frontend build failed
    pause
    exit /b 1
)
cd ..

echo.
echo [3/6] Build backend...
cd backend
call npm run build
if errorlevel 1 (
    echo Backend build failed
    pause
    exit /b 1
)
cd ..

echo.
echo [4/6] Copy files...
mkdir "%OUTPUT_DIR%"
mkdir "%OUTPUT_DIR%\frontend"
mkdir "%OUTPUT_DIR%\backend"
mkdir "%OUTPUT_DIR%\backend\prisma"

echo Copying frontend dist and env...
xcopy /s /e /i /q /y frontend\dist "%OUTPUT_DIR%\frontend\dist"
if exist frontend\.env.production copy /y frontend\.env.production "%OUTPUT_DIR%\frontend\"

echo Copying backend dist and node_modules...
xcopy /s /e /i /q /y backend\dist "%OUTPUT_DIR%\backend\dist"
if exist backend\node_modules xcopy /s /e /i /q /y backend\node_modules "%OUTPUT_DIR%\backend\node_modules"
copy /y backend\package.json "%OUTPUT_DIR%\backend\"
if exist backend\package-lock.json copy /y backend\package-lock.json "%OUTPUT_DIR%\backend\"
if exist backend\.env copy /y backend\.env "%OUTPUT_DIR%\backend\"
copy /y backend\prisma\schema.prisma "%OUTPUT_DIR%\backend\prisma\"
if exist backend\prisma\seed.ts copy /y backend\prisma\seed.ts "%OUTPUT_DIR%\backend\prisma\"

echo.
echo [5/6] Create start script...
(
echo @echo off
echo setlocal
echo cd /d "%%~dp0"
echo echo ====================================
echo echo User Management - Start
echo echo ====================================
echo echo.
echo echo [1/4] Start backend service...
echo cd backend
echo echo.
echo echo Backend: http://localhost:3001
echo echo Frontend: Use nginx to host frontend\dist
echo.
echo echo Starting backend...
echo start "Backend" cmd /k "npm start"
echo pause
) > "%OUTPUT_DIR%\start.bat"

echo.
echo [5/6] Create seed script...
(
echo @echo off
echo cd /d "%%~dp0"
echo cd backend
echo echo.
echo echo Initializing database with test data...
echo call npx tsx prisma\seed.ts
echo echo.
echo echo Database initialized. You can now login with:
echo echo - admin/admin123 (System Administrator)
echo echo - hr/hr123 (HR Zhang)
echo echo - manager/manager123 (Manager Li)
echo echo - user/user123 (Employee Wang)
echo pause
) > "%OUTPUT_DIR%\init-data.bat"

echo.
echo [6/6] Create README...
(
echo # User Management System
echo.
echo ## Start
echo 1. First run init-data.bat to initialize database
echo 2. Then run start.bat to start backend
echo 3. Host frontend\dist with web server
echo.
echo ## Frontend API
echo Frontend includes .env.production with VITE_API_BASE_URL=http://localhost:3001/api
echo This means frontend will send API requests to backend directly
echo.
echo ## Frontend Start
echo npx serve frontend\dist -p 8080
echo.
echo ## Nginx Config
echo server { listen 80; root C:/path/to/frontend/dist; }
echo   location /api { proxy_pass http://localhost:3001; }
echo }
) > "%OUTPUT_DIR%\README.md"

echo.
echo ====================================
echo Deploy package complete: %OUTPUT_DIR%
echo ====================================
echo.
echo NOTE: node_modules included - no npm install needed!
pause
