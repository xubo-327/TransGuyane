@echo off
chcp 65001 >nul
echo ========================================
echo 修复前端连接问题
echo ========================================
echo.

echo [1/3] 检查后端服务状态...
netstat -ano | findstr ":5000" >nul
if %errorlevel% equ 0 (
    echo [✓] 后端服务正在运行 (端口 5000)
) else (
    echo [✗] 后端服务未运行
    echo 请先启动后端服务: cd backend ^&^& npm run dev
    pause
    exit /b 1
)

echo.
echo [2/3] 创建前端环境变量文件...
if not exist "frontend\.env" (
    (
        echo REACT_APP_API_URL=http://localhost:5000/api
    ) > frontend\.env
    echo [✓] frontend\.env 文件已创建
) else (
    echo [✓] frontend\.env 文件已存在
)

echo.
echo [3/3] 检查前端依赖...
if not exist "frontend\node_modules" (
    echo [!] 前端依赖未安装，正在安装...
    cd frontend
    call npm install
    cd ..
    echo [✓] 依赖安装完成
) else (
    echo [✓] 前端依赖已安装
)

echo.
echo ========================================
echo 修复完成！
echo ========================================
echo.
echo 接下来请启动前端服务:
echo   cd frontend
echo   npm start
echo.
echo 或使用快速启动脚本启动前后端
echo.
pause
