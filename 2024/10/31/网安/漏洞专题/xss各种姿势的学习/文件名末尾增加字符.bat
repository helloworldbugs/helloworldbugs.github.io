@echo off
setlocal enabledelayedexpansion

set "folder_path=E:\Users\Administrator\Desktop\xss�������Ƶ�ѧϰ"  REM ���滻Ϊ����ļ���·��

for %%f in ("%folder_path%\*.jpg") do (
    set "filename=%%~nf"
    set "extension=%%~xf"
    ren "%%f" "!filename!-image!extension!"
)

echo �ļ����޸���ɡ�
pause
