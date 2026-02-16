@echo off
echo ====================================
echo 重启后端服务脚本
echo ====================================

echo.
echo [1/3] 停止所有 node 进程...
taskkill /F /IM node.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo 已停止所有 node 进程
) else (
    echo 没有运行中的 node 进程
)

echo.
echo [2/3] 等待 3 秒...
timeout /t 3 /nobreak >nul

echo.
echo [3/3] 启动后端服务...
cd /d "%~dp0backend"
start "后端服务" cmd /k "npm run dev"

echo.
echo ====================================
echo 后端服务正在启动...
echo 服务地址: http://localhost:3001
echo 按 Ctrl+C 可停止服务
echo ====================================
