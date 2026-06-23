@echo off
REM ============================================================
REM  Reset local git history and push ONE clean commit.
REM  Use this when GitHub blocked your push because a secret was
REM  found in an earlier commit. REMOVE the secret from your files
REM  FIRST (e.g. server.ts), then run this.
REM ============================================================
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"
title Reset history and push (clean)

echo.
echo ===========================================
echo   Reset git history + push clean
echo   Folder: %CD%
echo ===========================================
echo.
echo WARNING: this DELETES this folder's local git history and makes
echo one fresh commit, then force-pushes it. Do this only after you
echo have removed the secret (e.g. the token in server.ts) from your
echo files. Your files are NOT touched - only the hidden .git history.
echo.
set "OK="
set /p "OK=Type YES to continue: "
if /i not "!OK!"=="YES" ( echo Cancelled. & echo. & pause & exit /b 0 )

where git >nul 2>&1
if errorlevel 1 ( echo [ERROR] Git not installed. & pause & exit /b 1 )

REM --- remember the repo before wiping ---
set "REPO="
for /f "delims=" %%u in ('git remote get-url origin 2^>nul') do set "REPO=%%u"

REM --- wipe local history ---
if exist ".git" rmdir /s /q ".git"
git init >nul
git branch -M main

REM --- repo: remembered > argument > ask ---
if not defined REPO set "REPO=%~1"
if not defined REPO (
  echo.
  set /p "REPO=GitHub repo (owner/repo or full URL): "
)
if not defined REPO ( echo [ERROR] No repository given. & pause & exit /b 1 )
echo !REPO! | findstr /b /i "http git@" >nul
if errorlevel 1 set "REPO=https://github.com/!REPO!"
set "REPO=!REPO:.git=!"
set "REPO=!REPO!.git"
git remote add origin "!REPO!"

echo.
echo Staging all files...
git add -A
git commit -m "Initial clean commit" >nul 2>&1

echo Pushing a clean history to !REPO! ...
git push -u origin main --force
if errorlevel 1 (
  echo.
  echo [ERROR] Push failed. If GitHub still reports a SECRET, it is still
  echo inside one of your files. Remove it from the file, save, and run
  echo this again.
  echo.
  pause
  exit /b 1
)
echo.
echo ===========================================
echo   Done. Clean history pushed.
echo   !REPO!
echo ===========================================
echo.
pause
endlocal
