@echo off
title 长安十二时辰 · 灯火如昼
cd /d "%~dp0"

echo ==============================
echo   长安十二时辰 · 灯火如昼
echo   元月十四 · 上元前夕
echo ==============================
echo.

where python >nul 2>nul
if errorlevel 1 (
  echo [错误] 找不到 python 命令。
  echo        请先安装 Python 3，并在安装时勾选 "Add Python to PATH"。
  echo.
  pause
  exit /b 1
)

REM 先起服务器、等它就绪，再开浏览器。
REM 原实现是先 start 浏览器再起服务，首次打开会因为端口还没监听而连不上。
echo 正在启动静态服务器（端口 8010）...
start "changan-server" cmd /k "python -m http.server 8010"

echo 等待服务器就绪...
ping -n 3 127.0.0.1 >nul

echo 打开浏览器 http://localhost:8010/
start "" http://localhost:8010/

echo.
echo 游戏已启动。关闭标题为 changan-server 的窗口即可停止服务器。
timeout /t 6 >nul
