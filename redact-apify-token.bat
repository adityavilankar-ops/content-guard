@echo off
REM ============================================================
REM  Find and REDACT Apify API tokens (apify_api_...) in this
REM  folder's text files, so GitHub will let you push.
REM  Run this, then run reset-history-and-push.bat.
REM ============================================================
setlocal EnableExtensions
cd /d "%~dp0"
title Redact Apify token
echo.
echo Scanning files for Apify tokens (apify_api_...)
echo.
powershell -NoProfile -ExecutionPolicy Bypass -Command "$rx=[regex]'apify_api_[A-Za-z0-9]+'; $changed=@(); Get-ChildItem -Recurse -File | Where-Object { $_.FullName -notmatch '\.git' -and $_.FullName -notmatch 'node_modules' -and $_.Extension -match '^\.(ts|tsx|js|jsx|mjs|cjs|json|html|css|env|txt|md|yml|yaml|cfg|ini)$' } | ForEach-Object { $c = Get-Content -Raw -LiteralPath $_.FullName -ErrorAction SilentlyContinue; if ($c -and $rx.IsMatch($c)) { Set-Content -NoNewline -LiteralPath $_.FullName -Value ($rx.Replace($c,'REDACTED_USE_ENV_APIFY_API_TOKEN')); $changed += $_.FullName } }; if ($changed.Count -eq 0){ Write-Host 'No Apify tokens (apify_api_...) found in text files.' } else { Write-Host 'Redacted the Apify token in these files:'; $changed | ForEach-Object { Write-Host ('   ' + $_) } }"
echo.
echo If a file was redacted, open it and wire the value to an env
echo variable later, e.g.  process.env.APIFY_API_TOKEN
echo Then run reset-history-and-push.bat to upload a clean copy.
echo.
pause
endlocal
