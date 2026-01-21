@echo off
chcp 65001 >nul
cls
echo ========================================
echo    连接到GitHub并推送代码
echo ========================================
echo.

cd /d "%~dp0"

echo [检查] 检查Git仓库状态...
if not exist ".git" (
    echo     [错误] Git仓库未初始化！
    echo     请先运行 "初始化Git并提交.bat"
    pause
    exit /b 1
)

echo [提示] 在继续之前，请确保：
echo     1. 已在GitHub上创建仓库
echo     2. 已准备好仓库URL（格式：https://github.com/username/repo.git）
echo.
set /p GITHUB_URL="     请输入GitHub仓库URL: "

if "!GITHUB_URL!"=="" (
    echo     [错误] 仓库URL不能为空！
    pause
    exit /b 1
)

echo.
echo [1/4] 检查远程仓库配置...
git remote get-url origin >nul 2>&1
if errorlevel 1 (
    echo     [配置] 添加远程仓库...
    git remote add origin "!GITHUB_URL!"
    echo     [OK] 远程仓库已添加
) else (
    echo     [提示] 远程仓库已存在
    set /p UPDATE_REMOTE="     是否更新远程仓库URL? (y/n): "
    if /i "!UPDATE_REMOTE!"=="y" (
        git remote set-url origin "!GITHUB_URL!"
        echo     [OK] 远程仓库URL已更新
    )
)
echo.

echo [2/4] 确保分支名为main...
git branch -M main
echo     [OK] 分支已设置为main
echo.

echo [3/4] 检查本地提交...
git log --oneline -1
echo.

echo [4/4] 推送到GitHub...
echo     [提示] 如果提示输入用户名和密码：
echo      - Username: 您的GitHub用户名
echo      - Password: 使用Personal Access Token（不是GitHub密码）
echo      - 如何创建Token: GitHub → Settings → Developer settings → Personal access tokens
echo.
set /p CONFIRM="     确认推送? (y/n): "
if /i "!CONFIRM!"=="y" (
    git push -u origin main
    if errorlevel 1 (
        echo.
        echo     [错误] 推送失败！
        echo     常见原因：
        echo     1. 认证失败（使用Personal Access Token作为密码）
        echo     2. 仓库不存在或URL错误
        echo     3. 网络问题
        echo.
        echo     详细指南请查看: docs\GIT_SETUP_GUIDE.md
    ) else (
        echo.
        echo     [成功] 代码已推送到GitHub！
        echo     访问您的仓库: !GITHUB_URL!
    )
) else (
    echo     [取消] 推送已取消
)

echo.
pause
