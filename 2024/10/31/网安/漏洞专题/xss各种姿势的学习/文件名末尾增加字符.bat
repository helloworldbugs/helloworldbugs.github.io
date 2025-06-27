@echo off
setlocal enabledelayedexpansion

set "folder_path=E:\Users\Administrator\Desktop\xss各种姿势的学习"  REM 请替换为你的文件夹路径

for %%f in ("%folder_path%\*.jpg") do (
    set "filename=%%~nf"
    set "extension=%%~xf"
    ren "%%f" "!filename!-image!extension!"
)

echo 文件名修改完成。
pause
