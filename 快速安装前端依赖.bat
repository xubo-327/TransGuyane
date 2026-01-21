@echo off
chcp 65001 >nul
cls
echo ========================================
echo 快速安装前端依赖
echo ========================================
echo.
echo Node.js 版本检测...
node --version
echo.
echo 正在安装依赖，请稍候...
echo 这可能需要 3-10 分钟，请耐心等待...
echo.

cd frontend

if exist "node_modules" (
    echo 删除旧的依赖文件...
    rmdir /s /q node_modules 2>nul
    del package-lock.json 2>nul
)

echo.
echo 开始安装...
npm install

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo [SUCCESS] 依赖安装成功！
    echo ========================================
    echo.
    echo 现在可以运行: npm start
    echo 或使用启动脚本: 启动前端.bat
    echo.
) else (
    echo.
    echo ========================================
    echo [FAILED] 依赖安装失败
    echo ========================================
    echo.
    echo 请尝试以下方法：
    echo.
    echo 方法1: 清除缓存后重试
    echo   npm cache clean --force
    echo   npm install
    echo.
    echo 方法2: 使用淘宝镜像
    echo   npm install --registry=https://registry.npmmirror.com
    echo.
    echo 方法3: 检查网络连接和防火墙设置
    echo.
)

cd ..
echo.
pause
