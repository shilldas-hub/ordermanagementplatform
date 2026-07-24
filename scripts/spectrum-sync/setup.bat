@echo off
echo ===================================================
echo Setting up Spectrum Sync Python Environment...
echo ===================================================

echo Creating virtual environment (venv)...
python -m venv venv

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing dependencies from requirements.txt...
pip install -r requirements.txt

echo.
echo ===================================================
echo Setup Complete! 
echo You can now use run_sync.bat to execute the script.
echo ===================================================
pause
