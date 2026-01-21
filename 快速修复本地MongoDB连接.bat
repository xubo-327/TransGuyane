@echo off
chcp 65001 >nul
echo ========================================
echo 快速修复本地 MongoDB Atlas 连接
echo ========================================
echo.

echo 问题：MongoDB Atlas IP 白名单未配置
echo.
echo 解决方案：
echo.
echo 方法一：添加当前 IP 地址（推荐用于生产环境）
echo 1. 访问：https://cloud.mongodb.com/v2#/security/network/list
echo 2. 点击 "Add IP Address"
echo 3. 点击 "Add Current IP Address"
echo 4. 点击 "Confirm"
echo.
echo 方法二：允许所有 IP（推荐用于开发/测试环境）
echo 1. 访问：https://cloud.mongodb.com/v2#/security/network/list
echo 2. 点击 "Add IP Address"
echo 3. 选择 "Allow Access from Anywhere" 或输入 "0.0.0.0/0"
echo 4. 添加注释：开发环境
echo 5. 点击 "Confirm"
echo.
echo ========================================
echo 配置完成后：
echo 1. 等待 1-2 分钟让配置生效
echo 2. 重新启动本地服务器
echo 3. 检查连接是否成功
echo ========================================
echo.
pause
