@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
cls
echo ========================================
echo 诊断登录问题
echo ========================================
echo.

echo [步骤 1/4] 检查后端服务状态...
netstat -ano | findstr ":5000" | findstr "LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] 后端服务正在运行（端口 5000）
    set BACKEND_RUNNING=1
) else (
    echo [ERROR] 后端服务未运行
    echo 请先启动后端服务: 快速启动后端.bat
    echo.
    set BACKEND_RUNNING=0
)
echo.

echo [步骤 2/4] 测试后端 API 健康检查...
if !BACKEND_RUNNING! equ 1 (
    powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:5000/api/health' -Method Get -TimeoutSec 3 -UseBasicParsing; Write-Host '[OK] 后端 API 正常响应'; Write-Host '状态码:' $response.StatusCode } catch { Write-Host '[ERROR] 后端 API 无响应'; Write-Host '错误:' $_.Exception.Message }" 2>nul
) else (
    echo [SKIP] 后端服务未运行，跳过 API 测试
)
echo.

echo [步骤 3/4] 检查管理员账号...
cd /d "%~dp0backend"
if not exist "node_modules" (
    call npm install >nul 2>&1
)

REM 创建检查账号脚本
echo const mongoose=require('mongoose');const User=require('./models/User');require('dotenv').config();mongoose.connect(process.env.MONGODB_URI,{useNewUrlParser:true,useUnifiedTopology:true,serverSelectionTimeoutMS:10000}).then(async()=>{const user=await User.findOne({username:'xubo327'});if(user){console.log('[OK] 管理员账号存在');console.log('用户名:',user.username);console.log('角色:',user.role);console.log('登录类型:',user.loginType);const bcrypt=require('bcryptjs');const testPassword='3273279x';const isValid=await user.comparePassword(testPassword);console.log('密码验证:',isValid?'正确':'错误');}else{console.log('[ERROR] 管理员账号不存在');}mongoose.connection.close();process.exit(0);}).catch(err=>{console.error('[ERROR]',err.message);process.exit(1);}); > check_user.js

node check_user.js
set USER_CHECK=!errorlevel!
if exist check_user.js del check_user.js >nul 2>&1
cd ..
echo.

echo [步骤 4/4] 测试登录 API...
if !BACKEND_RUNNING! equ 1 (
    echo 正在测试登录 API...
    powershell -Command "$body = @{username='xubo327';password='3273279x'} | ConvertTo-Json; try { $response = Invoke-WebRequest -Uri 'http://localhost:5000/api/auth/login' -Method Post -Body $body -ContentType 'application/json' -TimeoutSec 5 -UseBasicParsing; Write-Host '[OK] 登录 API 响应正常'; Write-Host '状态码:' $response.StatusCode; $result = $response.Content | ConvertFrom-Json; if ($result.token) { Write-Host '[OK] 登录成功，已获取 token' } else { Write-Host '[WARNING] 登录响应中未找到 token' } } catch { Write-Host '[ERROR] 登录 API 调用失败'; Write-Host '错误:' $_.Exception.Message; if ($_.Exception.Response) { Write-Host '状态码:' $_.Exception.Response.StatusCode.value__ } }" 2>nul
) else (
    echo [SKIP] 后端服务未运行，跳过登录 API 测试
)
echo.

echo ========================================
echo 诊断结果
echo ========================================
echo.
if !BACKEND_RUNNING! equ 0 (
    echo [重要] 后端服务未运行
    echo 请先启动后端服务: 快速启动后端.bat
    echo.
)
if !USER_CHECK! neq 0 (
    echo [重要] 管理员账号检查失败
    echo 请重新创建管理员账号: 创建管理员并测试登录.bat
    echo.
)

echo 如果所有检查都通过但登录仍然失败:
echo   1. 检查浏览器控制台（按 F12）查看错误信息
echo   2. 检查后端服务窗口的错误信息
echo   3. 确认前端 API URL 配置正确（frontend/.env）
echo.
pause
