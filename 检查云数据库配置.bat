@echo off
chcp 65001 >nul
cls
echo ========================================
echo 检查 MongoDB Atlas 云数据库配置
echo ========================================
echo.

cd /d "%~dp0backend"
if not exist ".env" (
    echo [ERROR] 未找到 backend\.env 文件
    echo.
    echo 请先创建环境变量文件:
    echo   运行: 创建环境变量.bat
    echo   或运行: 一键配置Atlas连接.bat
    echo.
    pause
    exit /b 1
)

echo [步骤 1/4] 检查 .env 文件...
echo.
echo 当前 .env 文件内容:
echo ----------------------------------------
type .env | findstr /V "SECRET" | findstr /V "WECHAT"
echo ----------------------------------------
echo.

echo [步骤 2/4] 检查 MONGODB_URI 配置...
echo.
findstr /C:"MONGODB_URI" .env >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] 未找到 MONGODB_URI 配置
    echo.
    echo 请配置 MongoDB Atlas 连接字符串
    echo   运行: 一键配置Atlas连接.bat
    echo.
    pause
    exit /b 1
)

echo [OK] MONGODB_URI 配置已存在
echo.

REM 读取 MONGODB_URI（隐藏密码显示）
for /f "tokens=2 delims==" %%a in ('findstr /C:"MONGODB_URI" .env') do (
    set "MONGODB_URI=%%a"
)

echo 连接字符串（隐藏密码）:
echo %MONGODB_URI% | powershell -Command "$input = $input -replace ':(.+?)@', ':****@'; Write-Host $input"
echo.

echo [步骤 3/4] 检查连接字符串格式...
echo.

echo %MONGODB_URI% | findstr "mongodb+srv://" >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] 检测到 MongoDB Atlas 连接字符串（mongodb+srv://）
    echo.
    
    REM 检查是否包含数据库名称
    echo %MONGODB_URI% | findstr /C:".mongodb.net/" >nul 2>&1
    if %errorlevel% equ 0 (
        echo [OK] 连接字符串包含数据库路径
        REM 提取数据库名称
        for /f "tokens=2 delims=/" %%a in ("%MONGODB_URI:.mongodb.net/=%") do (
            for /f "tokens=1 delims=?" %%b in ("%%a") do (
                echo [INFO] 数据库名称: %%b
            )
        )
    ) else (
        echo [WARNING] 连接字符串可能缺少数据库名称
        echo 格式应为: mongodb+srv://用户:密码@集群/数据库名?参数
        echo.
        echo 正确的格式示例:
        echo   mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/warehouse_management?retryWrites=true^&w=majority
        echo.
        echo [注意] .mongodb.net/ 后面必须有数据库名称
    )
    
    echo.
    REM 检查参数
    echo %MONGODB_URI% | findstr "retryWrites" >nul 2>&1
    if %errorlevel% equ 0 (
        echo [OK] 连接字符串包含标准参数（retryWrites）
    ) else (
        echo [INFO] 连接字符串未包含 retryWrites 参数（可选）
    )
    
) else (
    echo [WARNING] 未检测到 MongoDB Atlas 连接字符串
    echo 当前配置可能是本地 MongoDB 连接
    echo.
    echo 如需使用云数据库，请运行: 一键配置Atlas连接.bat
    echo.
)

echo.
echo [步骤 4/4] 测试数据库连接...
echo.

if not exist "node_modules" (
    echo [INFO] 依赖未安装，正在安装...
    call npm install >nul 2>&1
)

echo 正在测试连接（请稍候，这可能需要10-15秒）...
echo.

REM 创建测试连接脚本
echo const mongoose = require('mongoose'); > test_atlas_connection.js
echo require('dotenv').config(); >> test_atlas_connection.js
echo const mongoUri = process.env.MONGODB_URI; >> test_atlas_connection.js
echo if (!mongoUri) { >> test_atlas_connection.js
echo   console.error('[ERROR] MONGODB_URI 未配置'); >> test_atlas_connection.js
echo   process.exit(1); >> test_atlas_connection.js
echo } >> test_atlas_connection.js
echo const isAtlas = mongoUri.includes('mongodb+srv://'); >> test_atlas_connection.js
echo console.log('连接类型:', isAtlas ? 'MongoDB Atlas (云数据库)' : '本地 MongoDB'); >> test_atlas_connection.js
echo const displayUri = mongoUri.replace(/:[^:@]+@/, ':****@'); >> test_atlas_connection.js
echo console.log('连接字符串:', displayUri); >> test_atlas_connection.js
echo console.log(''); >> test_atlas_connection.js
echo console.log('正在连接...'); >> test_atlas_connection.js
echo mongoose.connect(mongoUri, { >> test_atlas_connection.js
echo   useNewUrlParser: true, >> test_atlas_connection.js
echo   useUnifiedTopology: true, >> test_atlas_connection.js
echo   serverSelectionTimeoutMS: isAtlas ? 15000 : 5000, >> test_atlas_connection.js
echo   socketTimeoutMS: isAtlas ? 45000 : 45000, >> test_atlas_connection.js
echo }).then(() =^> { >> test_atlas_connection.js
echo   console.log('[SUCCESS] MongoDB Atlas 连接成功！'); >> test_atlas_connection.js
echo   console.log('数据库名称:', mongoose.connection.name); >> test_atlas_connection.js
echo   console.log('集群地址:', mongoose.connection.host); >> test_atlas_connection.js
echo   process.exit(0); >> test_atlas_connection.js
echo }).catch(err =^> { >> test_atlas_connection.js
echo   console.error('[ERROR] 数据库连接失败'); >> test_atlas_connection.js
echo   console.error(''); >> test_atlas_connection.js
echo   console.error('错误信息:', err.message); >> test_atlas_connection.js
echo   if (isAtlas) { >> test_atlas_connection.js
echo     console.error(''); >> test_atlas_connection.js
echo     console.error('Atlas 连接故障排查:'); >> test_atlas_connection.js
echo     console.error('  1. 检查连接字符串是否正确（用户名、密码、集群地址）'); >> test_atlas_connection.js
echo     console.error('  2. 检查连接字符串是否包含数据库名称'); >> test_atlas_connection.js
echo     console.error('     正确格式: mongodb+srv://用户:密码@集群/数据库名?参数'); >> test_atlas_connection.js
echo     console.error('  3. 检查 MongoDB Atlas 网络访问设置（IP 白名单）'); >> test_atlas_connection.js
echo     console.error('     登录 Atlas -^> Network Access -^> 添加 IP (0.0.0.0/0 允许所有)'); >> test_atlas_connection.js
echo     console.error('  4. 检查数据库用户名和密码是否正确'); >> test_atlas_connection.js
echo     console.error('  5. 检查网络连接是否正常（防火墙、代理）'); >> test_atlas_connection.js
echo   } >> test_atlas_connection.js
echo   process.exit(1); >> test_atlas_connection.js
echo }); >> test_atlas_connection.js

node test_atlas_connection.js
set TEST_RESULT=%errorlevel%

del test_atlas_connection.js >nul 2>&1

echo.
if %TEST_RESULT% equ 0 (
    echo ========================================
    echo [SUCCESS] 云数据库配置正确
    echo ========================================
    echo.
    echo 现在可以:
    echo   1. 启动后端服务: 快速启动后端.bat
    echo   2. 创建管理员账号: 创建管理员并测试登录.bat
    echo   3. 启动前端服务: 启动前端.bat
    echo.
) else (
    echo ========================================
    echo [ERROR] 云数据库连接失败
    echo ========================================
    echo.
    echo 请按照上面的故障排查步骤解决问题
    echo.
    echo 如果连接字符串格式不正确，可以:
    echo   运行: 一键配置Atlas连接.bat 重新配置
    echo.
)

cd ..
pause
