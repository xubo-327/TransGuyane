@echo off
chcp 65001 >nul
echo ========================================
echo 快速测试 Vercel API
echo ========================================
echo.

echo 测试 1: 检查 API 根路径...
powershell -ExecutionPolicy Bypass -Command "try { $r = Invoke-RestMethod -Uri 'https://trans-guyane.vercel.app/api' -Method GET; Write-Host '✅ API 可访问' -ForegroundColor Green; Write-Host ($r | ConvertTo-Json) } catch { Write-Host '❌ API 不可访问' -ForegroundColor Red; Write-Host $_.Exception.Message }"
echo.

echo 测试 2: 检查创建管理员端点...
powershell -ExecutionPolicy Bypass -Command "try { $r = Invoke-RestMethod -Uri 'https://trans-guyane.vercel.app/api/create-admins' -Method POST -ContentType 'application/json'; Write-Host '✅ 端点可访问' -ForegroundColor Green; if ($r.success) { Write-Host '管理员账户创建成功！' -ForegroundColor Green; foreach ($a in $r.accounts) { Write-Host ('用户名: ' + $a.username + ' | 密码: ' + $a.password) } } } catch { Write-Host '❌ 端点失败' -ForegroundColor Red; if ($_.Exception.Response) { Write-Host ('状态码: ' + $_.Exception.Response.StatusCode.value__) -ForegroundColor Red } else { Write-Host $_.Exception.Message -ForegroundColor Red } }"
echo.

echo ========================================
pause
