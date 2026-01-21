@echo off
chcp 65001 >nul
echo ========================================
echo 在 Vercel 数据库创建管理员账户
echo ========================================
echo.

powershell -ExecutionPolicy Bypass -Command "& { $apiUrl = 'https://trans-guyane.vercel.app/api/create-admins'; Write-Host '正在连接: ' $apiUrl -ForegroundColor Yellow; Write-Host ''; try { $response = Invoke-RestMethod -Uri $apiUrl -Method POST -ContentType 'application/json' -ErrorAction Stop; Write-Host '✅ 请求成功！' -ForegroundColor Green; Write-Host ''; Write-Host ($response | ConvertTo-Json -Depth 10); Write-Host ''; if ($response.success) { Write-Host '========================================' -ForegroundColor Green; Write-Host '管理员账户创建成功！' -ForegroundColor Green; Write-Host '========================================' -ForegroundColor Green; Write-Host ''; Write-Host '已创建的管理员账户：' -ForegroundColor Yellow; Write-Host ''; foreach ($account in $response.accounts) { Write-Host ('  用户名: ' + $account.username + ' | 密码: ' + $account.password + ' | 角色: ' + $account.role) -ForegroundColor White } } } catch { Write-Host '❌ 请求失败！' -ForegroundColor Red; Write-Host ''; if ($_.Exception.Response) { $statusCode = $_.Exception.Response.StatusCode.value__; Write-Host ('HTTP 状态码: ' + $statusCode) -ForegroundColor Red; if ($statusCode -eq 500) { Write-Host ''; Write-Host '⚠️ 500 错误通常表示：' -ForegroundColor Yellow; Write-Host '1. MongoDB Atlas 连接失败（IP白名单问题）' -ForegroundColor White; Write-Host '   解决方案：在 MongoDB Atlas 中添加 IP 白名单 0.0.0.0/0' -ForegroundColor White; Write-Host '   详细步骤：修复MongoDB Atlas IP白名单问题.md' -ForegroundColor White; Write-Host '2. 数据库环境变量配置错误' -ForegroundColor White; Write-Host '3. 查看 Vercel Logs 获取详细错误信息' -ForegroundColor White } elseif ($statusCode -eq 404) { Write-Host ''; Write-Host '⚠️ 404 错误表示端点不存在' -ForegroundColor Yellow; Write-Host '可能原因：Vercel 部署未完成或路由配置错误' -ForegroundColor White } } else { Write-Host ('错误信息: ' + $_.Exception.Message) -ForegroundColor Red } } }"

echo.
echo ========================================
echo 按任意键退出...
pause >nul
