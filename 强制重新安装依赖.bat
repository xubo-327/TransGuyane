@echo off
chcp 65001 >nul
cls
echo ========================================
echo 强制重新安装前端依赖
echo ========================================
echo.
echo 此脚本将：
echo 1. 删除旧的 node_modules 和 package-lock.json
echo 2. 清除 npm 缓存
echo 3. 重新安装所有依赖
echo.
echo 这可能需要 5-10 分钟，请耐心等待...
echo.
pause

cd frontend

echo [1/4] 删除旧的依赖文件...
if exist "node_modules" (
    echo 正在删除 node_modules...
    rmdir /s /q "node_modules"
    echo [OK] node_modules 已删除
) else (
    echo [OK] node_modules 不存在，跳过
)

if exist "package-lock.json" (
    echo 正在删除 package-lock.json...
    del /q "package-lock.json"
    echo [OK] package-lock.json 已删除
) else (
    echo [OK] package-lock.json 不存在，跳过
)

echo.
echo [2/4] 清除 npm 缓存...
call npm cache clean --force
echo [OK] 缓存已清除

echo.
echo [3/4] 开始安装依赖...
echo 正在从 npm 仓库下载依赖包...
echo 这可能需要几分钟，请耐心等待...
echo.

call npm install --verbose

echo.
if %errorlevel% equ 0 (
    echo [4/4] 验证安装...
    if exist "node_modules\react-scripts" (
        if exist "node_modules\.bin\react-scripts.cmd" (
            echo.
            echo ========================================
            echo [SUCCESS] 依赖安装成功！
            echo ========================================
            echo.
            echo react-scripts 已正确安装
            echo 现在可以运行: npm start
            echo.
        ) else (
            echo.
            echo [WARNING] react-scripts 已安装但找不到可执行文件
            echo 尝试重新安装...
            call npm install react-scripts --save-dev
        )
    ) else (
        echo.
        echo [ERROR] react-scripts 未正确安装
        echo 尝试单独安装 react-scripts...
        call npm install react-scripts --save-dev
    )
) else (
    echo.
    echo ========================================
    echo [ERROR] 依赖安装失败
    echo ========================================
    echo.
    echo 错误代码: %errorlevel%
    echo.
    echo 请尝试：
    echo 1. 检查网络连接
    echo 2. 使用淘宝镜像: npm install --registry=https://registry.npmmirror.com
    echo 3. 以管理员身份运行此脚本
    echo.
)

cd ..
echo.
pause
