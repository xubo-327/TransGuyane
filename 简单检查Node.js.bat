@echo off
chcp 65001 >nul
cls
echo ========================================
echo Node.js 安装检查
echo ========================================
echo.
echo 正在检查 Node.js...
where node >nul 2>&1
if errorlevel 1 (
    echo.
    echo [ERROR] Node.js 未安装或未添加到 PATH
    echo.
    echo 解决方案:
    echo 1. 访问 https://nodejs.org/ 下载安装
    echo 2. 建议安装 LTS (长期支持) 版本
    echo 3. 安装时确保勾选 "Add to PATH"
    echo 4. 安装后重启命令行窗口
    echo.
) else (
    echo [OK] Node.js 已安装
    echo.
    echo 版本信息:
    node --version
    npm --version
    echo.
    echo 安装路径:
    where node
    echo.
    echo ========================================
    echo [SUCCESS] Node.js 环境正常
    echo ========================================
    echo.
)
pause
