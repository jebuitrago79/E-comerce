@echo off
echo ======================================
echo   INICIANDO E-COMMERCE (Backend + Frontend)
echo ======================================

REM Ir siempre a la carpeta donde está este .bat (E-comerce)
cd /d "%~dp0"

REM ======================= BACKEND =======================
echo.
echo Iniciando BACKEND...
REM OJO: aqui NO entramos a la carpeta backend, nos quedamos en la raiz
start "BACKEND" cmd /k "cd /d ""%~dp0"" && python -m uvicorn backend.main:app --reload"

REM Esperar unos segundos antes de iniciar el frontend
echo Esperando a que el backend inicie...
timeout /t 5 /nobreak >nul

REM ======================= FRONTEND ======================
echo.
echo Iniciando FRONTEND...
start "FRONTEND" cmd /k "cd /d ""%~dp0frontend"" && npm run dev"

echo.
echo ======================================
echo   Proyecto iniciado correctamente.
echo ======================================
pause
