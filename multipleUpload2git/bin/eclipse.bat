@echo off
echo [INFO] Package the war in target dir.

cd /d %~dp0

cd ..

chdir

call mvn eclipse:eclipse

pause