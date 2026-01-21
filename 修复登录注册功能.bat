@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
cls
echo ========================================
echo 修复登录和注册功能
echo ========================================
echo.

cd /d "%~dp0"

echo [诊断 1/4] 检查后端服务状态...
netstat -ano | findstr ":5000" | findstr "LISTENING" >nul 2>&1
if !errorlevel! equ 0 (
    echo [OK] 后端服务正在运行（端口 5000）
    set BACKEND_OK=1
    
    REM 测试后端 API
    timeout /t 1 /nobreak >nul
    powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:5000/api/health' -TimeoutSec 2 -UseBasicParsing; Write-Host '[OK] 后端 API 正常响应' } catch { Write-Host '[ERROR] 后端 API 无响应' }" 2>nul
) else (
    echo [ERROR] 后端服务未运行！
    set BACKEND_OK=0
)
echo.

echo [诊断 2/4] 检查前端服务状态...
netstat -ano | findstr ":3000" | findstr "LISTENING" >nul 2>&1
if !errorlevel! equ 0 (
    echo [OK] 前端服务正在运行（端口 3000）
    set FRONTEND_OK=1
) else (
    echo [INFO] 前端服务未运行
    set FRONTEND_OK=0
)
echo.

echo [诊断 3/4] 检查前端 API 配置...
if exist "frontend\.env" (
    findstr /C:"REACT_APP_API_URL" frontend\.env | findstr "http://localhost:5000/api" >nul 2>&1
    if !errorlevel! equ 0 (
        echo [OK] 前端 API 配置正确
        set CONFIG_OK=1
    ) else (
        echo [ERROR] 前端 API 配置不正确
        echo 正在修复...
        echo REACT_APP_API_URL=http://localhost:5000/api > frontend\.env
        echo [OK] 配置已修复
        set CONFIG_OK=1
        set FRONTEND_NEED_RESTART=1
    )
) else (
    echo [ERROR] 前端 .env 文件不存在
    echo 正在创建...
    echo REACT_APP_API_URL=http://localhost:5000/api > frontend\.env
    echo [OK] 已创建
    set CONFIG_OK=1
    set FRONTEND_NEED_RESTART=1
)
echo.

echo [诊断 4/4] 检查管理员账号...
cd backend
if not exist "node_modules" (
    call npm install >nul 2>&1
)

REM 创建快速检查脚本
echo const mongoose=require('mongoose');const User=require('./models/User');require('dotenv').config();mongoose.connect(process.env.MONGODB_URI,{useNewUrlParser:true,useUnifiedTopology:true,serverSelectionTimeoutMS:5000}).then(async()=>{const user=await User.findOne({username:'xubo327'});if(user){console.log('[OK] 管理员账号存在');process.exit(0);}else{console.log('[WARNING] 管理员账号不存在');process.exit(1);}}).catch(()=>{console.log('[WARNING] 无法检查账号');process.exit(1);}); > check_user.js

node check_user.js >nul 2>&1
set USER_OK=!errorlevel!
del check_user.js >nul 2>&1
cd ..

if !USER_OK! equ 0 (
    echo [OK] 管理员账号已存在
) else (
    echo [WARNING] 管理员账号可能不存在，将自动创建
)
echo.

echo ========================================
echo 诊断结果
echo ========================================
echo.
if !BACKEND_OK! equ 0 (
    echo [严重问题] 后端服务未运行
    echo.
    echo 这是导致登录和注册功能无法使用的根本原因！
    echo.
    echo 解决方案:
    echo   1. 打开新窗口
    echo   2. 运行: 快速启动后端.bat
    echo   3. 等待看到服务器运行在端口 5000的提示
    echo   4. 保持该窗口运行
    echo.
)

if !FRONTEND_OK! equ 0 (
    echo [提示] 前端服务未运行
    echo 如需启动: 运行 启动前端.bat
    echo.
)

if defined FRONTEND_NEED_RESTART (
    echo [重要] 前端配置已修改，需要重启前端服务
    echo   1. 停止前端服务（如果正在运行）
    echo   2. 重新运行: 启动前端.bat
    echo.
)

if !USER_OK! neq 0 (
    echo [提示] 正在创建管理员账号...
    cd backend
    node scripts\createAdmin.js
    cd ..
    echo.
)

echo ========================================
echo 操作指南
echo ========================================
echo.
if !BACKEND_OK! equ 0 (
    echo [必须先做] 启动后端服务:
    echo   双击运行: 快速启动后端.bat
    echo.
    echo 等待后端启动成功后，再继续下一步
    echo.
)

echo [测试步骤]
echo   1. 确保后端服务正在运行
echo   2. 打开浏览器访问: http://localhost:3000
echo   3. 尝试登录:
echo      用户名: xubo327
echo      密码: 3273279x
echo   4. 或尝试注册新账号
echo.
echo [如果仍然失败]
echo   1. 打开浏览器开发者工具（F12）
echo   2. 查看 Console 和 Network 标签的错误信息
echo   3. 检查后端服务窗口的错误信息
echo.

pause
