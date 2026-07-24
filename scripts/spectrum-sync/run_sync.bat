@echo off
cd /d "%~dp0"
echo Starting Spectrum Sync...

call venv\Scripts\activate.bat
python sync.py

echo Sync finished.
pause
