@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
cls
echo ========================================
echo 配置 MongoDB Atlas 云数据库
echo ========================================
echo.

if not exist "backend\.env" (
    echo [INFO] 未找到 backend\.env 文件，正在创建...
    (
        echo PORT=5000
        echo MONGODB_URI=mongodb://localhost:27017/warehouse_management
        echo JWT_SECRET=warehouse_management_secret_key_2024_change_in_production
        echo WECHAT_APPID=your_wechat_appid
        echo WECHAT_SECRET=your_wechat_secret
    ) > backend\.env
    echo [OK] .env 文件已创建
    echo.
)

echo 当前 MongoDB 连接配置:
echo.
findstr /C:"MONGODB_URI" backend\.env
echo.

echo ========================================
echo 配置说明
echo ========================================
echo.
echo MongoDB Atlas 连接字符串格式:
echo   mongodb+srv://用户名:密码@集群地址.mongodb.net/数据库名?retryWrites=true^&w=majority
echo.
echo 示例:
echo   mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/warehouse_management?retryWrites=true^&w=majority
echo.

set /p use_atlas="是否使用 MongoDB Atlas 云数据库? (Y/N): "

if /i "%use_atlas%"=="Y" (
    echo.
    echo 请输入 MongoDB Atlas 连接字符串:
    echo (格式: mongodb+srv://用户名:密码@集群地址.mongodb.net/数据库名?retryWrites=true^&w=majority)
    echo.
    set /p atlas_uri="连接字符串: "
    
    if "!atlas_uri!"=="" (
        echo [ERROR] 连接字符串不能为空
        pause
        exit /b 1
    )
    
    echo.
    echo 正在更新配置...
    
    REM 读取现有 .env 文件并更新 MONGODB_URI
    (
        for /f "usebackq tokens=1* delims==" %%a in ("backend\.env") do (
            set "key=%%a"
            set "value=%%b"
            if "!key!"=="MONGODB_URI" (
                echo MONGODB_URI=!atlas_uri!
            ) else if "!key!" neq "" (
                echo !key!=!value!
            ) else (
                echo.
            )
        )
    ) > backend\.env.tmp
    
    move /y backend\.env.tmp backend\.env >nul
    
    echo [OK] MongoDB Atlas 配置已更新
    echo.
    echo 新的连接配置:
    findstr /C:"MONGODB_URI" backend\.env
    echo.
    echo ========================================
    echo 重要提示
    echo ========================================
    echo 1. 请确保 MongoDB Atlas 集群的网络访问已配置:
    echo    - 允许所有 IP (0.0.0.0/0) 或添加您的 IP 地址
    echo.
    echo 2. 请确保数据库用户已创建并有读写权限
    echo.
    echo 3. 测试连接: cd backend ^&^& node scripts\createAdmin.js
    echo.
) else (
    echo.
    echo 保持使用本地 MongoDB 配置
    echo 如需配置云数据库，请重新运行此脚本
    echo.
)

pause
