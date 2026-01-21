@echo off
chcp 65001 >nul
cls
echo ========================================
echo 解决依赖冲突并安装前端依赖
echo ========================================
echo.
echo 检测到 TypeScript 版本冲突
echo react-scripts@5.0.1 需要 TypeScript 3.x 或 4.x
echo 但项目中使用的是 TypeScript 5.x
echo.
echo 解决方案：使用 --legacy-peer-deps 标志
echo.

cd frontend

echo [1/3] 清理旧文件...
if exist "node_modules" rmdir /s /q "node_modules" 2>nul
if exist "package-lock.json" del /q "package-lock.json" 2>nul
echo [OK] 清理完成

echo.
echo [2/3] 清除 npm 缓存...
call npm cache clean --force
echo [OK] 缓存已清除

echo.
echo [3/3] 使用 --legacy-peer-deps 安装依赖...
echo 这将忽略 peer dependency 冲突
echo 正在安装，请稍候...
echo.

call npm install --legacy-peer-deps --registry=https://registry.npmmirror.com

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo [SUCCESS] 依赖安装成功！
    echo ========================================
    echo.
    echo 现在可以运行: npm start
    echo.
) else (
    echo.
    echo ========================================
    echo [ERROR] 安装失败
    echo ========================================
    echo.
    echo 请尝试：
    echo 1. 检查网络连接
    echo 2. 以管理员身份运行
    echo 3. 查看详细错误日志
    echo.
)

cd ..
pause
