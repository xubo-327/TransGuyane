@echo off
chcp 65001 >nul
cls
echo ========================================
echo   检查后端服务状态
echo ========================================
echo.

cd /d "%~dp0"

echo [1] 检查端口 5000 是否被监听...
netstat -ano | findstr ":5000" | findstr "LISTENING"
if errorlevel 1 (
    echo [错误] 后端服务未运行！端口 5000 没有监听
    echo.
    echo 请检查后端窗口的错误信息
) else (
    echo [OK] 后端服务正在运行
)
echo.

echo [2] 测试后端 API...
echo 正在请求 http://localhost:5000/api/health
curl -s http://localhost:5000/api/health 2>nul
if errorlevel 1 (
    echo.
    echo [错误] 无法连接后端 API
) else (
    echo.
    echo [OK] 后端 API 正常响应
)
echo.

echo [3] 测试注册 API...
echo 正在测试注册接口...
curl -s -X POST http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d "{\"username\":\"test_check\",\"password\":\"123456\"}" 2>nul
echo.
echo.

echo ========================================
echo   检查完成
echo ========================================
echo.
echo 如果看到 "MongoDB连接失败" 相关错误，请运行:
echo   快速配置数据库.bat
echo.
pause
