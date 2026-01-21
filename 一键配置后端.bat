@echo off
chcp 65001 >nul
cls
echo ========================================
echo    一键配置后端 - Vercel 部署准备
echo ========================================
echo.

cd /d "%~dp0"

:: 检查是否在项目根目录
if not exist "backend" (
    echo [错误] 未找到 backend 目录！
    echo 请确保在项目根目录运行此脚本。
    pause
    exit /b 1
)

echo [检查] 检查后端配置文件...
echo.

:: 检查必要文件
set ERROR_COUNT=0

if not exist "backend\vercel.json" (
    echo     [缺失] backend\vercel.json
    set /a ERROR_COUNT+=1
) else (
    echo     [OK] backend\vercel.json
)

if not exist "backend\api\index.js" (
    echo     [缺失] backend\api\index.js
    set /a ERROR_COUNT+=1
) else (
    echo     [OK] backend\api\index.js
)

if not exist "backend\server.js" (
    echo     [缺失] backend\server.js
    set /a ERROR_COUNT+=1
) else (
    echo     [OK] backend\server.js
)

if not exist "backend\package.json" (
    echo     [缺失] backend\package.json
    set /a ERROR_COUNT+=1
) else (
    echo     [OK] backend\package.json
)

echo.

if %ERROR_COUNT% GTR 0 (
    echo [错误] 缺少必要的配置文件！请检查项目完整性。
    pause
    exit /b 1
)

echo [成功] 所有必要文件都存在！
echo.

:: 创建环境变量示例文件
echo [配置] 创建环境变量示例文件...
if not exist "backend\.env.vercel.example" (
    (
        echo # Vercel 环境变量配置
        echo # 这些变量需要在 Vercel 控制台中配置
        echo.
        echo # MongoDB 数据库连接字符串
        echo # 格式: mongodb+srv://用户名:密码@集群地址.mongodb.net/数据库名?retryWrites=true^&w=majority
        echo MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/warehouse_management?retryWrites=true^&w=majority
        echo.
        echo # JWT 密钥（至少32字符，建议使用强随机字符串）
        echo JWT_SECRET=your_very_secure_secret_key_at_least_32_characters_long
        echo.
        echo # 环境类型
        echo NODE_ENV=production
        echo.
        echo # 前端 URL（用于 CORS 配置）
        echo # GitHub Pages: https://xubo-327.github.io/TransGuyane
        echo FRONTEND_URL=https://xubo-327.github.io/TransGuyane
        echo.
        echo # 微信配置（可选）
        echo # WECHAT_APPID=your_wechat_appid
        echo # WECHAT_SECRET=your_wechat_secret
    ) > "backend\.env.vercel.example"
    echo     [创建] backend\.env.vercel.example
) else (
    echo     [存在] backend\.env.vercel.example
)

echo.

:: 检查 Vercel CLI
where vercel >nul 2>&1
if errorlevel 1 (
    echo [提示] Vercel CLI 未安装
    echo     可以使用网页版部署，或者安装 Vercel CLI：
    echo     npm install -g vercel
    echo.
    set USE_CLI=0
) else (
    echo [发现] Vercel CLI 已安装
    echo.
    set USE_CLI=1
)

:: 显示配置信息
echo ========================================
echo     后端配置信息
echo ========================================
echo.
echo 后端目录: backend
echo Vercel 配置: backend\vercel.json
echo API 入口: backend\api\index.js
echo.
echo ========================================
echo     部署方式选择
echo ========================================
echo.
echo 方式一：网页版部署（推荐，最简单）
echo     1. 访问 https://vercel.com
echo     2. 使用 GitHub 账号登录
echo     3. 点击 "Add New..." → "Project"
echo     4. 选择仓库: xubo-327/TransGuyane
echo     5. 配置:
echo        - Framework Preset: Other
echo        - Root Directory: backend ⚠️ 重要
echo        - Build Command: 留空
echo        - Install Command: npm install
echo     6. 添加环境变量（参考 backend\.env.vercel.example）
echo     7. 点击 Deploy
echo.
echo 方式二：使用 Vercel CLI（如果已安装）
echo     运行以下命令：
echo     cd backend
echo     vercel
echo.

if %USE_CLI%==1 (
    set /p DEPLOY_NOW="是否现在使用 CLI 部署? (y/n): "
    if /i "!DEPLOY_NOW!"=="y" (
        echo.
        echo [部署] 切换到 backend 目录...
        cd backend
        echo [提示] 按照提示完成部署：
        echo     - 首次部署会要求登录
        echo     - 选择项目设置
        echo     - 环境变量可以在部署后添加
        echo.
        vercel
        cd ..
    )
)

echo.
echo ========================================
echo     环境变量配置清单
echo ========================================
echo.
echo 在 Vercel 控制台中需要配置以下环境变量：
echo.
echo 必需变量：
echo   MONGODB_URI      - MongoDB Atlas 连接字符串
echo   JWT_SECRET       - JWT 密钥（至少32字符）
echo   NODE_ENV         - 设置为 production
echo   FRONTEND_URL     - https://xubo-327.github.io/TransGuyane
echo.
echo 可选变量：
echo   WECHAT_APPID     - 微信 AppID（如果使用微信登录）
echo   WECHAT_SECRET    - 微信 Secret（如果使用微信登录）
echo.
echo 详细说明请查看: backend\.env.vercel.example
echo.

:: 生成 JWT Secret 提示
echo ========================================
echo     生成 JWT Secret
echo ========================================
echo.
echo 如果您还没有 JWT Secret，可以使用以下方法生成：
echo.
echo PowerShell 命令：
echo     -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
echo.
echo 或在线工具：https://www.random.org/strings/
echo.
echo ========================================
echo     部署完成后的步骤
echo ========================================
echo.
echo 1. 获取后端 API URL（Vercel 部署后提供）
echo    格式: https://your-project.vercel.app/api
echo.
echo 2. 更新前端 API 配置：
echo    - 创建 frontend\.env.production
echo    - 设置: REACT_APP_API_URL=https://your-project.vercel.app/api
echo.
echo 3. 在 Vercel 中配置 CORS：
echo    - 确保 FRONTEND_URL 环境变量正确
echo    - 重新部署项目
echo.
echo 4. 测试部署：
echo    curl https://your-project.vercel.app/api/health
echo.
echo 详细部署指南: Vercel后端+GitHub Pages前端部署方案.md
echo.

pause
