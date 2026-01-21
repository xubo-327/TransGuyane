@echo off
chcp 65001 >nul
cls
echo ========================================
echo 验证前端 API 配置
echo ========================================
echo.

cd /d "%~dp0frontend"

echo [步骤 1/3] 检查 .env 文件...
if exist ".env" (
    echo [OK] .env 文件存在
    echo.
    echo .env 文件内容:
    type .env
    echo.
    findstr /C:"REACT_APP_API_URL" .env | findstr "http://localhost:5000/api" >nul 2>&1
    if !errorlevel! equ 0 (
        echo [OK] API URL 配置正确
    ) else (
        echo [ERROR] API URL 配置不正确
        echo 正在修复...
        echo REACT_APP_API_URL=http://localhost:5000/api > .env
        echo [OK] 已修复为正确配置
        type .env
    )
) else (
    echo [ERROR] .env 文件不存在
    echo 正在创建...
    echo REACT_APP_API_URL=http://localhost:5000/api > .env
    echo [OK] .env 文件已创建
    type .env
)
echo.

echo [步骤 2/3] 检查代码中的 API 配置...
findstr /C:"API_BASE_URL" src\services\api.js >nul 2>&1
if !errorlevel! equ 0 (
    echo [OK] 代码中使用了环境变量
    echo.
    echo api.js 中的配置:
    findstr /C:"API_BASE_URL" src\services\api.js
) else (
    echo [WARNING] 未找到 API_BASE_URL 配置
)
echo.

echo [步骤 3/3] 重要提示...
echo.
echo ========================================
echo [重要] 修改 .env 后必须重启前端服务
echo ========================================
echo.
echo 1. 如果前端服务正在运行:
echo    - 完全停止前端服务（关闭窗口或按 Ctrl+C）
echo    - 等待几秒钟确保进程完全退出
echo    - 重新运行: 启动前端.bat
echo.
echo 2. 清除浏览器缓存:
echo    - 按 Ctrl+Shift+Delete 清除缓存
echo    - 或按 Ctrl+F5 强制刷新
echo    - 或在浏览器中打开隐私模式测试
echo.
echo 3. 验证配置已生效:
echo    - 打开浏览器开发者工具（F12）
echo    - 查看 Network 标签
echo    - 尝试登录
echo    - 检查请求 URL 是否为: http://localhost:5000/api/auth/login
echo     （不应该只是 :5000/api/auth/login）
echo.
echo ========================================
cd ..
pause
