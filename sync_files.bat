@echo off
chcp 65001 >nul
echo Syncing files to deploy-package...

REM Backend files
copy /Y "backend\routes\export.js" "deploy-package\backend\routes\export.js"
copy /Y "backend\routes\logistics.js" "deploy-package\backend\routes\logistics.js"
copy /Y "backend\services\logisticsService.js" "deploy-package\backend\services\logisticsService.js"
copy /Y "backend\routes\batches.js" "deploy-package\backend\routes\batches.js"
copy /Y "backend\routes\orders.js" "deploy-package\backend\routes\orders.js"
copy /Y "backend\models\Order.js" "deploy-package\backend\models\Order.js"
copy /Y "backend\server.js" "deploy-package\backend\server.js"

REM Frontend files
copy /Y "frontend\src\services\api.js" "deploy-package\frontend\src\services\api.js"
copy /Y "frontend\src\pages\admin\Info.js" "deploy-package\frontend\src\pages\admin\Info.js"
copy /Y "frontend\src\pages\admin\Batches.js" "deploy-package\frontend\src\pages\admin\Batches.js"

echo Sync completed!
pause
