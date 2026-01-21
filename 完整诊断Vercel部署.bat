@echo off
chcp 65001 >nul
echo ========================================
echo Vercel 部署完整诊断
echo ========================================
echo.

echo [步骤 1] 检查 API 根路径...
powershell -ExecutionPolicy Bypass -Command "try { $r = Invoke-RestMethod -Uri 'https://trans-guyane.vercel.app/api' -Method GET -ErrorAction Stop; Write-Host '✅ API 根路径可访问' -ForegroundColor Green; Write-Host ($r | ConvertTo-Json -Depth 3) } catch { Write-Host '❌ API 根路径不可访问' -ForegroundColor Red; Write-Host $_.Exception.Message }"
echo.

echo [步骤 2] 检查健康检查端点...
powershell -ExecutionPolicy Bypass -Command "try { $r = Invoke-RestMethod -Uri 'https://trans-guyane.vercel.app/api/health' -Method GET -ErrorAction Stop; Write-Host '✅ 健康检查端点可访问' -ForegroundColor Green; Write-Host ($r | ConvertTo-Json) } catch { Write-Host '❌ 健康检查端点不可访问' -ForegroundColor Red; if ($_.Exception.Response) { Write-Host ('状态码: ' + $_.Exception.Response.StatusCode.value__) -ForegroundColor Red } }"
echo.

echo [步骤 3] 检查创建管理员端点...
powershell -ExecutionPolicy Bypass -Command "try { $r = Invoke-RestMethod -Uri 'https://trans-guyane.vercel.app/api/create-admins' -Method POST -ContentType 'application/json' -ErrorAction Stop; Write-Host '✅ 创建管理员端点可访问' -ForegroundColor Green; if ($r.success) { Write-Host '管理员账户创建成功！' -ForegroundColor Green; foreach ($a in $r.accounts) { Write-Host ('用户名: ' + $a.username + ' | 密码: ' + $a.password) } } } catch { Write-Host '❌ 创建管理员端点失败' -ForegroundColor Red; if ($_.Exception.Response) { $code = $_.Exception.Response.StatusCode.value__; Write-Host ('状态码: ' + $code) -ForegroundColor Red; if ($code -eq 404) { Write-Host ''; Write-Host '⚠️ 404 错误 - 端点不存在' -ForegroundColor Yellow; Write-Host '可能原因：' -ForegroundColor Yellow; Write-Host '1. Vercel 项目根目录未设置为 backend' -ForegroundColor White; Write-Host '2. Vercel 部署尚未完成' -ForegroundColor White; Write-Host '3. 路由配置错误' -ForegroundColor White; Write-Host ''; Write-Host '解决方案：' -ForegroundColor Cyan; Write-Host '1. 访问：https://vercel.com/dashboard' -ForegroundColor White; Write-Host '2. 选择项目 trans-guyane' -ForegroundColor White; Write-Host '3. Settings → General → Root Directory' -ForegroundColor White; Write-Host '4. 设置为：backend' -ForegroundColor White; Write-Host '5. 保存后重新部署' -ForegroundColor White } elseif ($code -eq 500) { Write-Host ''; Write-Host '⚠️ 500 错误 - MongoDB 连接失败' -ForegroundColor Yellow; Write-Host '解决方案：配置 MongoDB Atlas IP 白名单' -ForegroundColor White } } else { Write-Host $_.Exception.Message -ForegroundColor Red } }"
echo.

echo [步骤 4] 检查其他端点...
powershell -ExecutionPolicy Bypass -Command "try { $r = Invoke-RestMethod -Uri 'https://trans-guyane.vercel.app/api/auth/login' -Method POST -ContentType 'application/json' -Body '{}' -ErrorAction Stop } catch { if ($_.Exception.Response) { $code = $_.Exception.Response.StatusCode.value__; if ($code -eq 404) { Write-Host '❌ /api/auth/login 返回 404' -ForegroundColor Red; Write-Host '说明：所有 API 路由都无法访问，可能是路由配置问题' -ForegroundColor Yellow } elseif ($code -eq 400) { Write-Host '✅ /api/auth/login 端点存在（返回 400 是正常的，因为请求体为空）' -ForegroundColor Green } } }"
echo.

echo ========================================
echo 诊断完成
echo ========================================
echo.
echo 如果所有端点都返回 404，请检查：
echo 1. Vercel Dashboard → Settings → General → Root Directory 设置为 "backend"
echo 2. Vercel 部署状态是否为 "Ready"
echo 3. 查看 Vercel 部署日志确认是否有错误
echo.
echo 详细解决方案请查看：Vercel 404错误完整解决方案.md
echo.
pause
