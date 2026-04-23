@echo off
if exist entrega.zip del entrega.zip
tar -a -c -f entrega.zip --exclude=.env --exclude=.git --exclude=node_modules *
echo.
echo ZIP creado: entrega.zip
pause