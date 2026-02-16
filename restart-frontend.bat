@echo off
echo ====================================
echo 重启前端服务脚本
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
echo [3/3] 启动前端服务（端口 5173）...
cd /d "%~dp0frontend"
start "前端服务" cmd /k "npm run dev -- --port 5173"

echo.
echo ====================================
echo 前端服务正在启动...
echo 服务地址: http://localhost:5173
echo 按 Ctrl+C 可停止服务
echo ====================================
