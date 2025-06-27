@echo off
setlocal enabledelayedexpansion

for %%f in (*.png) do (
    set "name=%%f"
    set "newname=!name:~4!"
    echo Renaming "%%f" to "!newname!"
    ren "%%f" "!newname!"
)

endlocal
pause
