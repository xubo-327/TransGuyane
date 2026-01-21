@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
cls
echo ========================================
echo 启动后端并测试登录
echo ========================================
echo.

cd /d "%~dp0"

echo [步骤 1/3] 检查后端服务状态...
netstat -ano | findstr ":5000" | findstr "LISTENING" >nul 2>&1
if !errorlevel! equ 0 (
    echo [OK] 后端服务已在运行
    goto :test_login
) else (
    echo [INFO] 后端服务未运行
    echo 正在启动后端服务...
    echo.
    echo 请在新窗口中运行: 快速启动后端.bat
    echo 等待后端启动成功后再继续...
    echo.
    pause
)

:test_login
echo.
echo [步骤 2/3] 等待后端服务就绪...
timeout /t 3 /nobreak >nul

echo.
echo [步骤 3/3] 测试登录...
cd backend
if not exist "node_modules" (
    call npm install >nul 2>&1
)

REM 创建测试登录脚本
echo const axios=require('axios');axios.post('http://localhost:5000/api/auth/login',{username:'xubo327',password:'3273279x'}).then(res=>{console.log('[SUCCESS] 登录成功');console.log('Token:',res.data.token?res.data.token.substring(0,20)+'...':'未返回');console.log('用户:',res.data.user.username);process.exit(0);}).catch(err=>{console.error('[ERROR] 登录失败');console.error('错误:',err.response?err.response.data.error:err.message);process.exit(1);}); > test_login.js

node test_login.js
set LOGIN_RESULT=!errorlevel!
if exist test_login.js del test_login.js >nul 2>&1
cd ..

echo.
if !LOGIN_RESULT! equ 0 (
    echo ========================================
    echo [SUCCESS] 登录测试通过
    echo ========================================
    echo.
    echo 现在可以在浏览器中登录:
    echo   地址: http://localhost:3000
    echo   用户名: xubo327
    echo   密码: 3273279x
    echo.
) else (
    echo ========================================
    echo [ERROR] 登录测试失败
    echo ========================================
    echo.
    echo 可能的原因:
    echo   1. 后端服务未完全启动
    echo   2. 管理员账号未创建
    echo   3. 密码不正确
    echo.
    echo 请检查:
    echo   1. 后端服务窗口是否显示 "服务器运行在端口 5000"
    echo   2. 运行: 创建管理员并测试登录.bat
    echo.
)

pause
