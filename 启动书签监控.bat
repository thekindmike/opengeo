@echo off
chcp 65001 > nul
echo ================================================
echo    豆包浏览器书签自动备份服务
echo ================================================
echo.

cd /d C:\Users\Administrator\WorkBuddy\20260423220849

echo 🔍 启动书签监控...
node bookmarks_watcher.js

echo.
echo 监控已停止，按任意键退出...
pause > nul
