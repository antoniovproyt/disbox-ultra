@echo off
title Disbox Ultra - Menu de Instalacion y Ejecucion
set PATH=%~dp0node_modules\.bin;%PATH%

:MENU
cls
echo ===================================================
echo   DISBOX ULTRA - PANEL DE CONTROL (ELECTRON + HTML)
echo ===================================================
echo.
echo   1. Iniciar Aplicacion de Escritorio (Electron Desktop)
echo   2. Compilar e Instalar (.exe) con Electron Builder
echo   3. Instalar / Actualizar Dependencias (npm install)
echo   4. Limpiar temporal y cache
echo   5. Salir
echo.
set /p option="Seleccione una opcion [1-5]: "

if "%option%"=="1" goto RUN_APP
if "%option%"=="2" goto BUILD_EXE
if "%option%"=="3" goto INSTALL_DEPS
if "%option%"=="4" goto CLEAN_CACHE
if "%option%"=="5" exit

goto MENU

:INSTALL_DEPS
echo.
echo Instalando dependencias...
call npm install --legacy-peer-deps
echo Hecho.
pause
goto MENU

:CLEAN_CACHE
echo.
echo Limpiando carpetas dist y release...
rmdir /s /q dist 2>nul
rmdir /s /q release 2>nul
echo Limpieza completada.
pause
goto MENU

:RUN_APP
echo.
echo [1/2] Compilando assets web de produccion...
call vite build
if %errorlevel% neq 0 (
    echo [ERROR] Error al compilar. Asegurese de ejecutar la opcion 3 primero.
    pause
    goto MENU
)
echo [2/2] Abriendo aplicacion de escritorio Electron...
set ELECTRON_DISABLE_GPU=1
call electron .
goto MENU

:BUILD_EXE
echo.
echo [1/2] Compilando aplicacion web...
call vite build
if %errorlevel% neq 0 (
    echo [ERROR] Error al compilar web.
    pause
    goto MENU
)
echo [2/2] Generando instalador .exe con electron-builder...
call electron-builder
if %errorlevel% neq 0 (
    echo [ERROR] Error al generar el instalador.
    pause
    goto MENU
)
echo.
echo ===================================================
echo   INSTALADOR GENERADO CON EXITO EN LA CARPETA \release
echo ===================================================
pause
goto MENU