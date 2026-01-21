@echo off
chcp 65001 >nul
cls
echo ========================================
echo 修复登录问题
echo ========================================
echo.

echo [前置检查] 检查 Node.js 安装...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js 未安装或未添加到 PATH 环境变量
    echo.
    echo 请执行以下操作:
    echo 1. 安装 Node.js: https://nodejs.org/
    echo 2. 安装后重启此脚本
    echo 3. 如果已安装，请检查 PATH 环境变量是否包含 Node.js 路径
    echo.
    pause
    exit /b 1
)
echo [OK] Node.js 已安装
node --version
echo.

echo [步骤 1/3] 检查并创建前端环境变量文件...
if not exist "frontend\.env" (
    echo 正在创建 frontend\.env 文件...
    (
        echo REACT_APP_API_URL=http://localhost:5000/api
    ) > frontend\.env
    echo [OK] 已创建 frontend\.env 文件
) else (
    echo [OK] frontend\.env 文件已存在
    findstr /C:"REACT_APP_API_URL" frontend\.env >nul 2>&1
    if %errorlevel% neq 0 (
        echo REACT_APP_API_URL=http://localhost:5000/api >> frontend\.env
        echo [OK] 已添加 REACT_APP_API_URL 配置
    ) else (
        echo [OK] API URL 配置已存在
    )
)

echo.
echo [步骤 2/3] 检查并创建后端环境变量文件...
if not exist "backend\.env" (
    echo 正在创建 backend\.env 文件...
    (
        echo MONGODB_URI=mongodb://localhost:27017/warehouse_management
        echo JWT_SECRET=your_jwt_secret_key_change_in_production
        echo PORT=5000
    ) > backend\.env
    echo [OK] 已创建 backend\.env 文件
) else (
    echo [OK] backend\.env 文件已存在
)

echo.
echo [步骤 3/3] 检查管理员账号...
cd backend

if not exist "node_modules" (
    echo [WARNING] 后端依赖未安装
    echo 正在安装依赖，请稍候...
    call npm install >nul 2>&1
    if %errorlevel% neq 0 (
        echo [ERROR] 依赖安装失败
        echo 请手动运行: cd backend ^&^& npm install
        cd ..
        pause
        exit /b 1
    )
    echo [OK] 依赖安装完成
)

if not exist "models\User.js" (
    echo [ERROR] 找不到 User 模型文件
    cd ..
    pause
    exit /b 1
)

node -e "const mongoose=require('mongoose');const User=require('./models/User');require('dotenv').config();(async()=>{try{console.log('正在连接数据库...');await mongoose.connect(process.env.MONGODB_URI||'mongodb://localhost:27017/warehouse_management',{useNewUrlParser:true,useUnifiedTopology:true});const user=await User.findOne({username:'xubo327'});if(user){console.log('[OK] 管理员账号已存在');console.log('  用户名:',user.username);console.log('  角色:',user.role);console.log('  登录类型:',user.loginType);}else{console.log('[INFO] 管理员账号不存在，正在创建...');const newUser=new User({username:'xubo327',password:'3273279x',nickname:'管理员',role:'admin',loginType:'account'});await newUser.save();console.log('[OK] 管理员账号创建成功');console.log('  用户名: xubo327');console.log('  密码: 3273279x');console.log('  角色: admin');}await mongoose.connection.close();process.exit(0);}catch(e){console.error('[ERROR]',e.message);if(e.message.includes('connect')||e.message.includes('ECONNREFUSED')){console.error('无法连接到MongoDB');console.error('请确保MongoDB服务已启动');}process.exit(1);}})();"
set CHECK_RESULT=%errorlevel%
cd ..

echo.
if %CHECK_RESULT% equ 0 (
    echo ========================================
    echo [SUCCESS] 修复完成
    echo ========================================
    echo.
    echo 请执行以下操作:
    echo 1. 确保 MongoDB 服务已启动
    echo 2. 启动后端服务: cd backend ^&^& npm run dev
    echo 3. 启动前端服务: cd frontend ^&^& npm start
    echo 4. 使用以下账号登录:
    echo    用户名: xubo327
    echo    密码: 3273279x
    echo.
) else (
    echo ========================================
    echo [ERROR] 修复过程中出现错误
    echo ========================================
    echo.
    echo 请检查:
    echo 1. MongoDB 服务是否已启动
    echo 2. Node.js 是否正确安装
    echo 3. 后端依赖是否已安装 (cd backend ^&^& npm install)
    echo.
)

pause
