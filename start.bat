@echo off
title 长安十二时辰 · 灯火如昼
cd /d "%~dp0"
echo ==============================
echo   长安十二时辰 · 灯火如昼
echo   元月十四 · 上元前夕
echo ==============================
echo.
echo 正在启动游戏服务器...
echo.
start http://localhost:8010/
python -m http.server 8010
echo.
pause
