@echo off
chcp 65001 >nul
echo ========================================
echo 创建环境变量文件
echo ========================================
echo.

echo [1/2] 创建后端环境变量文件...
if exist "backend\.env" (
    echo [INFO] backend\.env 文件已存在，跳过创建
) else (
    (
        echo PORT=5000
        echo MONGODB_URI=mongodb://localhost:27017/warehouse_management
        echo REM 如需使用 MongoDB Atlas 云数据库，请修改 MONGODB_URI 为:
        echo REM MONGODB_URI=mongodb+srv://用户名:密码@集群地址.mongodb.net/warehouse_management?retryWrites=true^&w=majority
        echo JWT_SECRET=warehouse_management_secret_key_2024_change_in_production
        echo WECHAT_APPID=your_wechat_appid
        echo WECHAT_SECRET=your_wechat_secret
    ) > backend\.env
    echo ✓ 后端 .env 文件已创建
    echo [提示] 如需使用云数据库，请运行 配置MongoDB Atlas.bat
)

echo.
echo [2/2] 创建前端环境变量文件...
(
echo REACT_APP_API_URL=http://localhost:5000/api
) > frontend\.env
echo ✓ 前端 .env 文件已创建

echo.
echo ========================================
echo 环境变量文件创建完成！
echo ========================================
echo.
pause
