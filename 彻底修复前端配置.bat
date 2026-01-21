@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
cls
echo ========================================
echo 彻底修复前端配置
echo ========================================
echo.

cd /d "%~dp0frontend"

echo [步骤 1/4] 备份并重新创建 .env 文件...
if exist ".env" (
    copy .env .env.backup >nul 2>&1
    echo [OK] 已备份原 .env 文件为 .env.backup
)

REM 强制创建正确的 .env 文件（只有一行，确保没有格式问题）
echo REACT_APP_API_URL=http://localhost:5000/api > .env

echo [OK] .env 文件已重新创建
echo.
echo 当前 .env 文件内容:
type .env
echo.

echo [步骤 2/4] 清除 React 缓存...
if exist "node_modules\.cache" (
    rd /s /q "node_modules\.cache" >nul 2>&1
    echo [OK] React 缓存已清除
) else (
    echo [INFO] 未找到缓存目录
)
echo.

echo [步骤 3/4] 验证代码配置...
findstr /C:"REACT_APP_API_URL" src\services\api.js >nul 2>&1
if !errorlevel! equ 0 (
    echo [OK] 代码中正确使用了环境变量
    echo.
    echo 代码中的配置行:
    findstr /C:"API_BASE_URL" src\services\api.js
) else (
    echo [WARNING] 代码中可能有问题
)
echo.

echo [步骤 4/4] 检查环境变量格式...
for /f "tokens=2 delims==" %%a in ('findstr /C:"REACT_APP_API_URL" .env') do (
    set "ENV_VALUE=%%a"
)

if "!ENV_VALUE!"=="http://localhost:5000/api" (
    echo [OK] 环境变量值正确
) else (
    echo [ERROR] 环境变量值不正确: !ENV_VALUE!
    echo 正在修复...
    echo REACT_APP_API_URL=http://localhost:5000/api > .env
    echo [OK] 已修复
)
echo.

cd ..

echo ========================================
echo [重要] 配置已修复，现在必须重启前端
echo ========================================
echo.
echo 请按以下步骤操作:
echo.
echo 1. 完全停止前端服务:
echo    - 关闭前端服务窗口
echo    - 或在窗口按 Ctrl+C 停止
echo    - 等待进程完全退出（约 5 秒）
echo.
echo 2. 清除浏览器缓存:
echo    - 按 Ctrl+Shift+Delete
echo    - 选择"缓存的图片和文件"
echo    - 点击"清除数据"
echo    - 或使用隐私模式（Ctrl+Shift+N）测试
echo.
echo 3. 重新启动前端服务:
echo    - 双击运行: 启动前端.bat
echo    - 等待看到 "Compiled successfully!"
echo.
echo 4. 验证配置:
echo    - 打开浏览器开发者工具（F12）
echo    - 在 Console 中输入: console.log(process.env.REACT_APP_API_URL)
echo    - 应该显示: http://localhost:5000/api
echo    - 如果显示 undefined，说明环境变量未加载
echo.
echo ========================================
pause
