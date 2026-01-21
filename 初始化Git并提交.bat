@echo off
chcp 65001 >nul
cls
echo ========================================
echo    Git 初始化和首次提交
echo ========================================
echo.

cd /d "%~dp0"

echo [1/7] 检查Git是否已安装...
git --version >nul 2>&1
if errorlevel 1 (
    echo     [错误] Git未安装！
    echo.
    echo     请先安装Git:
    echo     1. 访问 https://git-scm.com/download/win
    echo     2. 下载并安装Git for Windows
    echo     3. 安装完成后重新运行此脚本
    echo.
    pause
    exit /b 1
)
echo     [OK] Git已安装
git --version
echo.

echo [2/7] 检查Git用户配置...
git config --global user.name >nul 2>&1
if errorlevel 1 (
    echo     [提示] 需要配置Git用户信息
    set /p GIT_USERNAME="     请输入您的Git用户名: "
    set /p GIT_EMAIL="     请输入您的邮箱: "
    git config --global user.name "!GIT_USERNAME!"
    git config --global user.email "!GIT_EMAIL!"
    echo     [OK] Git用户信息已配置
) else (
    echo     [OK] Git用户信息已配置
    echo     用户名: 
    git config --global user.name
    echo     邮箱: 
    git config --global user.email
)
echo.

echo [3/7] 检查是否已初始化Git仓库...
if exist ".git" (
    echo     [提示] Git仓库已存在
) else (
    echo     [初始化] 正在初始化Git仓库...
    git init
    echo     [OK] Git仓库初始化完成
)
echo.

echo [4/7] 检查.gitignore文件...
if exist ".gitignore" (
    echo     [OK] .gitignore文件已存在
) else (
    echo     [警告] .gitignore文件不存在，将创建...
    echo # 依赖> .gitignore
    echo node_modules/>> .gitignore
    echo .env>> .gitignore
    echo     [OK] .gitignore文件已创建
)
echo.

echo [5/7] 添加文件到Git...
git add .
echo     [OK] 文件已添加到暂存区
echo.

echo [6/7] 查看将要提交的文件...
git status --short
echo.

echo [7/7] 创建首次提交...
set /p COMMIT_MSG="     请输入提交信息（直接回车使用默认信息）: "
if "!COMMIT_MSG!"=="" set COMMIT_MSG=Initial commit: Warehouse management system
git commit -m "!COMMIT_MSG!"
echo     [OK] 提交完成
echo.

echo ========================================
echo    提交完成！
echo ========================================
echo.
echo 下一步操作：
echo 1. 在GitHub上创建仓库
echo 2. 运行以下命令连接远程仓库：
echo.
echo    git remote add origin https://github.com/your-username/warehouse-management.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo 详细指南请查看: docs\GIT_SETUP_GUIDE.md
echo.
pause
