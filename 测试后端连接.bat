@echo off
chcp 65001 >nul
cls
echo ========================================
echo 测试后端服务连接
echo ========================================
echo.

echo [步骤 1/3] 检查端口 5000 占用情况...
netstat -ano | findstr ":5000" >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] 端口 5000 未被占用，后端服务未运行
    echo.
    echo 请先启动后端服务: 快速启动后端.bat
    pause
    exit /b 1
)
echo [OK] 端口 5000 已被占用

echo.
echo [步骤 2/3] 测试后端 API 健康检查...
echo.

REM 使用 PowerShell 测试 HTTP 连接
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:5000/api/health' -Method Get -TimeoutSec 5 -UseBasicParsing; Write-Host '[OK] 后端服务正常响应'; Write-Host '状态码:' $response.StatusCode; Write-Host '响应内容:' $response.Content } catch { Write-Host '[ERROR] 无法连接到后端服务'; Write-Host '错误信息:' $_.Exception.Message }"

echo.
echo [步骤 3/3] 测试 API 根路径...
echo.

powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:5000/api' -Method Get -TimeoutSec 5 -UseBasicParsing; Write-Host '[OK] API 根路径可访问'; Write-Host '状态码:' $response.StatusCode } catch { Write-Host '[ERROR] API 根路径无法访问'; Write-Host '错误信息:' $_.Exception.Message }"

echo.
echo ========================================
echo 诊断结果
echo ========================================
echo.
echo 如果测试失败，可能的原因:
echo   1. 后端服务已启动但仍在初始化中（等待几秒后重试）
echo   2. 后端服务崩溃或出错（查看后端服务窗口的错误信息）
echo   3. 防火墙阻止了连接
echo.
echo 建议操作:
echo   1. 检查后端服务窗口，查看是否有错误信息
echo   2. 如果后端服务崩溃，重新启动: 快速启动后端.bat
echo   3. 确保前端配置的 API URL 为: http://localhost:5000/api
echo.
pause
