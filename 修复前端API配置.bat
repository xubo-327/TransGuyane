@echo off
chcp 65001 >nul
cls
echo ========================================
echo 修复前端 API 配置
echo ========================================
echo.

cd /d "%~dp0frontend"

if not exist ".env" (
    echo [INFO] 创建 frontend\.env 文件...
    echo REACT_APP_API_URL=http://localhost:5000/api > .env
    echo [OK] .env 文件已创建
) else (
    echo [INFO] 检查现有 .env 文件...
    findstr /C:"REACT_APP_API_URL" .env >nul 2>&1
    if %errorlevel% neq 0 (
        echo REACT_APP_API_URL=http://localhost:5000/api >> .env
        echo [OK] 已添加 REACT_APP_API_URL 配置
    ) else (
        echo 当前配置:
        findstr /C:"REACT_APP_API_URL" .env
        echo.
        echo [INFO] 检查配置格式...
        findstr /C:"REACT_APP_API_URL" .env | findstr "http://localhost:5000/api" >nul 2>&1
        if %errorlevel% neq 0 (
            echo [WARNING] 配置格式可能不正确
            echo 正确的格式应该是: REACT_APP_API_URL=http://localhost:5000/api
            echo.
            echo 正在修复...
            REM 读取并更新
            (
                for /f "usebackq tokens=1* delims==" %%a in (".env") do (
                    set "key=%%a"
                    set "value=%%b"
                    if "!key!"=="REACT_APP_API_URL" (
                        echo REACT_APP_API_URL=http://localhost:5000/api
                    ) else if "!key!" neq "" (
                        echo !key!=!value!
                    ) else (
                        echo.
                    )
                )
            ) > .env.tmp
            move /y .env.tmp .env >nul
            echo [OK] 配置已修复
        ) else (
            echo [OK] 配置格式正确
        )
    )
)

echo.
echo ========================================
echo 配置验证
echo ========================================
echo.
echo 当前 frontend\.env 配置:
type .env
echo.

echo ========================================
echo [重要] 修改 .env 后需要重启前端服务
echo ========================================
echo.
echo 如果前端服务正在运行:
echo   1. 停止前端服务（按 Ctrl+C）
echo   2. 重新启动: 启动前端.bat
echo.
echo 如果前端服务未运行:
echo   直接运行: 启动前端.bat
echo.

cd ..
pause
