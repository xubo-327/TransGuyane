@echo off
chcp 65001 >nul
cls
echo ========================================
echo 登录功能检查工具
echo ========================================
echo.

echo [1] 检查后端服务...
echo.
curl -s http://localhost:5000/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] 后端服务正在运行
) else (
    echo [ERROR] 后端服务未运行
    echo 请先启动后端服务: cd backend ^&^& npm run dev
    echo.
    pause
    exit /b 1
)

echo.
echo [2] 检查前端配置...
echo.
if exist "frontend\.env" (
    echo [OK] frontend\.env 文件存在
    type frontend\.env | findstr "REACT_APP_API_URL"
) else (
    echo [WARNING] frontend\.env 文件不存在
    echo 正在创建...
    (
        echo REACT_APP_API_URL=http://localhost:5000/api
    ) > frontend\.env
    echo [OK] 已创建 frontend\.env 文件
)

echo.
echo [3] 检查管理员账号...
echo.
cd backend
node -e "const mongoose=require('mongoose');const User=require('./models/User');require('dotenv').config();(async()=>{try{await mongoose.connect(process.env.MONGODB_URI||'mongodb://localhost:27017/warehouse_management');const user=await User.findOne({username:'xubo327'});if(user){console.log('[OK] 管理员账号存在');console.log('用户名:',user.username);console.log('角色:',user.role);}else{console.log('[ERROR] 管理员账号不存在');console.log('请运行: 创建管理员账号.bat');}await mongoose.connection.close();process.exit(0);}catch(e){console.error('[ERROR]',e.message);process.exit(1);}})();"
set CHECK_RESULT=%errorlevel%
cd ..

echo.
if %CHECK_RESULT% neq 0 (
    echo [ERROR] 无法连接到数据库
    echo 请检查: MongoDB 服务是否已启动
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo 检查完成
echo ========================================
echo.
echo 如果所有检查都通过，但仍无法登录:
echo 1. 清除浏览器缓存和 Cookie
echo 2. 查看浏览器控制台 (F12) 的错误信息
echo 3. 查看后端控制台的错误日志
echo.
pause
