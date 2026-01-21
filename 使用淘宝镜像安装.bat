@echo off
chcp 65001 >nul
cls
echo ========================================
echo 使用淘宝镜像安装前端依赖
echo ========================================
echo.
echo 如果网络较慢，使用国内镜像可以加速下载
echo.

cd frontend

echo 正在删除旧的依赖文件...
if exist "node_modules" rmdir /s /q "node_modules" 2>nul
if exist "package-lock.json" del /q "package-lock.json" 2>nul

echo.
echo 开始使用淘宝镜像安装...
echo 镜像地址: https://registry.npmmirror.com
echo.

call npm install --registry=https://registry.npmmirror.com

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo [SUCCESS] 安装成功！
    echo ========================================
    echo.
    echo 现在可以运行: npm start
    echo.
) else (
    echo.
    echo [ERROR] 安装失败
    echo 请检查网络连接或尝试其他方法
    echo.
)

cd ..
pause
