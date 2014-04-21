@echo off
echo [INFO] Package the war in target dir.

cd /d %~dp0

cd ..

chdir

call mvn clean war:inplace -Dmaven.test.skip=true

pause