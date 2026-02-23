@echo off
echo ========================================
echo   FFmpeg Quick Installer (Windows)
echo ========================================
echo.

REM Check if ffmpeg already exists
where ffmpeg >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo FFmpeg is already installed!
    ffmpeg -version | findstr "ffmpeg version"
    echo.
    set /p continue="Reinstall anyway? (y/N): "
    if /i not "%continue%"=="y" (
        echo Installation cancelled.
        exit /b 0
    )
)

echo.
echo Step 1: Downloading FFmpeg...
REM Download using PowerShell
powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip' -OutFile '%TEMP%\ffmpeg.zip'}"

if not exist "%TEMP%\ffmpeg.zip" (
    echo ERROR: Download failed!
    echo.
    echo Please download manually from:
    echo https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip
    echo.
    echo Extract to C:\ffmpeg
    echo Add C:\ffmpeg\bin to your PATH
    pause
    exit /b 1
)

echo Download complete!
echo.
echo Step 2: Removing old installation...
if exist "C:\ffmpeg" (
    rmdir /s /q "C:\ffmpeg"
)

echo.
echo Step 3: Extracting (this may take a moment)...
powershell -Command "& {Expand-Archive -Path '%TEMP%\ffmpeg.zip' -DestinationPath '%TEMP%\ffmpeg-extract' -Force}"

REM Find and move the extracted folder
for /d %%i in ("%TEMP%\ffmpeg-extract\*") do (
    move "%%i" "C:\ffmpeg"
    goto :moved
)
:moved

echo Extraction complete!

REM Verify ffmpeg.exe exists
if not exist "C:\ffmpeg\bin\ffmpeg.exe" (
    echo ERROR: ffmpeg.exe not found!
    echo Please check C:\ffmpeg\bin\
    pause
    exit /b 1
)

echo.
echo Step 4: Adding to PATH...
REM Add to user PATH using PowerShell
powershell -Command "& {$path = [Environment]::GetEnvironmentVariable('Path', 'User'); if ($path -notlike '*C:\ffmpeg\bin*') { [Environment]::SetEnvironmentVariable('Path', $path + ';C:\ffmpeg\bin', 'User'); Write-Host 'Added to PATH!' } else { Write-Host 'Already in PATH!' }}"

echo.
echo Step 5: Verifying installation...
"C:\ffmpeg\bin\ffmpeg.exe" -version | findstr "ffmpeg version"

echo.
echo Cleaning up...
del /q "%TEMP%\ffmpeg.zip" 2>nul
rmdir /s /q "%TEMP%\ffmpeg-extract" 2>nul

echo.
echo ========================================
echo   Installation Complete!
echo ========================================
echo.
echo IMPORTANT: Close and restart VS Code!
echo.
echo Then verify with: ffmpeg -version
echo.
echo Location: C:\ffmpeg\bin\ffmpeg.exe
echo.
pause
