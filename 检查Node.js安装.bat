@echo off
chcp 65001 >nul
cls
echo ========================================
echo Node.js 安装检查工具
echo ========================================
echo.

echo 正在检查 Node.js...
where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js 未安装或未添加到 PATH
    echo.
    echo 解决方案:
    echo 1. 下载并安装 Node.js:
    echo    https://nodejs.org/
    echo    建议安装 LTS (长期支持) 版本
    echo.
    echo 2. 安装步骤:
    echo    a) 下载 Windows Installer (.msi)
    echo    b) 运行安装程序
    echo    c) 安装过程中确保勾选 "Add to PATH"
    echo    d) 完成安装后重启命令行窗口
    echo.
    echo 3. 验证安装:
    echo    打开新的命令行窗口，运行: node --version
    echo    如果显示版本号，说明安装成功
    echo.
) else (
    echo [OK] Node.js 已安装
    echo.
    echo Node.js 版本:
    node --version
    echo.
    echo npm 版本:
    npm --version
    echo.
    echo Node.js 安装路径:
    where node
    echo.
    echo ========================================
    echo [SUCCESS] Node.js 环境正常
    echo ========================================
    echo.
    echo 您现在可以运行其他脚本了
    echo.
)

pause
