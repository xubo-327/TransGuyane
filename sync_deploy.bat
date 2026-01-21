@echo off
chcp 65001 >nul
echo 正在同步文件到 deploy-package...

REM 后端文件
copy /Y "backend\routes\orders.js" "deploy-package\backend\routes\orders.js"
copy /Y "backend\routes\export.js" "deploy-package\backend\routes\export.js"
copy /Y "backend\routes\users.js" "deploy-package\backend\routes\users.js"
copy /Y "backend\routes\messages.js" "deploy-package\backend\routes\messages.js"

REM 前端文件
copy /Y "frontend\src\App.js" "deploy-package\frontend\src\App.js"
copy /Y "frontend\src\services\api.js" "deploy-package\frontend\src\services\api.js"
copy /Y "frontend\src\index.css" "deploy-package\frontend\src\index.css"
copy /Y "frontend\src\layouts\UserLayout.js" "deploy-package\frontend\src\layouts\UserLayout.js"
copy /Y "frontend\src\layouts\AdminLayout.js" "deploy-package\frontend\src\layouts\AdminLayout.js"
copy /Y "frontend\src\pages\user\Messages.js" "deploy-package\frontend\src\pages\user\Messages.js"
copy /Y "frontend\src\pages\admin\Batches.js" "deploy-package\frontend\src\pages\admin\Batches.js"

REM 创建新目录和文件
if not exist "deploy-package\frontend\src\components" mkdir "deploy-package\frontend\src\components"
if not exist "deploy-package\frontend\src\pages\admin\Input.js" copy NUL "deploy-package\frontend\src\pages\admin\Input.js" >nul
if not exist "deploy-package\frontend\src\pages\admin\Info.js" copy NUL "deploy-package\frontend\src\pages\admin\Info.js" >nul

echo 同步完成!
pause
