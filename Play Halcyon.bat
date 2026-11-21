@echo off
setlocal
rem Runs from the folder this file is in, wherever it is double-clicked from.
cd /d "%~dp0"
title Halcyon

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo  Node.js is not installed, or Windows cannot find it.
  echo  Install the LTS version from https://nodejs.org and then double-click this file again.
  echo.
  pause
  exit /b 1
)

rem Install or update the game's packages when they are missing or changed after an update.
set "NEED_INSTALL="
if not exist "node_modules\" set "NEED_INSTALL=1"
if not exist "node_modules\.halcyon-lock" set "NEED_INSTALL=1"
if not defined NEED_INSTALL (
  fc /b "package-lock.json" "node_modules\.halcyon-lock" >nul 2>nul || set "NEED_INSTALL=1"
)
if defined NEED_INSTALL (
  echo  Installing the game's packages. This only happens after an update and takes a minute...
  call npm.cmd install --no-audit --no-fund
  if errorlevel 1 (
    echo.
    echo  Installing failed. Check your internet connection and try again.
    pause
    exit /b 1
  )
  copy /y "package-lock.json" "node_modules\.halcyon-lock" >nul
)

echo.
echo  Starting Halcyon. Your browser will open in a moment.
echo  Keep this window open while you play. Close it to stop.
echo.
call npm.cmd run play
echo.
pause
