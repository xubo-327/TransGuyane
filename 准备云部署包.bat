@echo off
chcp 65001 >nul
cls
echo ========================================
echo TransGuyane 准备云部署包
echo ========================================
echo.

cd /d "%~dp0"

echo 此脚本将创建一个可用于云部署的压缩包
echo.

echo [1/4] 检查必要文件...
if not exist "docker-compose.yml" (
    echo [错误] 缺少 docker-compose.yml
    pause
    exit /b 1
)
if not exist "backend\Dockerfile" (
    echo [错误] 缺少 backend\Dockerfile
    pause
    exit /b 1
)
if not exist "frontend\Dockerfile" (
    echo [错误] 缺少 frontend\Dockerfile
    pause
    exit /b 1
)
echo [OK] 必要文件检查通过
echo.

echo [2/4] 创建部署目录...
if exist "deploy-package" rmdir /s /q "deploy-package"
mkdir "deploy-package"
echo [OK] 部署目录已创建
echo.

echo [3/4] 复制文件...

:: 复制根目录文件
copy "docker-compose.yml" "deploy-package\" >nul
copy "deploy.sh" "deploy-package\" >nul
copy "ecosystem.config.js" "deploy-package\" >nul
copy "env.production.example" "deploy-package\" >nul
copy "云部署指南.md" "deploy-package\" >nul

:: 复制后端
mkdir "deploy-package\backend"
xcopy "backend\*.js" "deploy-package\backend\" /q >nul
xcopy "backend\*.json" "deploy-package\backend\" /q >nul
copy "backend\Dockerfile" "deploy-package\backend\" >nul
copy "backend\.dockerignore" "deploy-package\backend\" >nul
mkdir "deploy-package\backend\routes"
xcopy "backend\routes\*" "deploy-package\backend\routes\" /q >nul
mkdir "deploy-package\backend\models"
xcopy "backend\models\*" "deploy-package\backend\models\" /q >nul
mkdir "deploy-package\backend\middleware"
xcopy "backend\middleware\*" "deploy-package\backend\middleware\" /q >nul
mkdir "deploy-package\backend\scripts"
xcopy "backend\scripts\*" "deploy-package\backend\scripts\" /q >nul

:: 复制前端
mkdir "deploy-package\frontend"
xcopy "frontend\*.json" "deploy-package\frontend\" /q >nul
copy "frontend\Dockerfile" "deploy-package\frontend\" >nul
copy "frontend\.dockerignore" "deploy-package\frontend\" >nul
copy "frontend\nginx.conf" "deploy-package\frontend\" >nul
mkdir "deploy-package\frontend\public"
xcopy "frontend\public\*" "deploy-package\frontend\public\" /q >nul
mkdir "deploy-package\frontend\src"
xcopy "frontend\src\*" "deploy-package\frontend\src\" /s /q >nul

echo [OK] 文件复制完成
echo.

echo [4/4] 创建部署说明...
(
echo # TransGuyane 部署包
echo.
echo ## 快速部署步骤
echo.
echo 1. 上传此目录到服务器
echo 2. 复制配置文件: cp env.production.example .env.production
echo 3. 编辑配置: nano .env.production
echo 4. 运行部署: chmod +x deploy.sh ^&^& ./deploy.sh
echo.
echo ## 管理员账号
echo - 用户名: xubo327
echo - 密码: 3273279x
echo.
echo ## 详细说明
echo 请查看 云部署指南.md
) > "deploy-package\README.md"

echo [OK] 部署说明已创建
echo.

echo ========================================
echo 部署包准备完成！
echo ========================================
echo.
echo 部署包位置: %~dp0deploy-package
echo.
echo 下一步操作:
echo 1. 将 deploy-package 文件夹上传到云服务器
echo 2. 在服务器上执行: ./deploy.sh
echo.
echo 提示: 详细部署说明请查看 云部署指南.md
echo.
pause
