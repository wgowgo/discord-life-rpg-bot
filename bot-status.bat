@echo off
cd /d "C:\Users\LIFEPC\discord-life-rpg"
pm2 status
pm2 logs discord-life-rpg-bot --lines 20
pause
