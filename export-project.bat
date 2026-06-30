@echo off
chcp 65001 >nul
echo ========================================
echo   智能错题本 - 项目导出工具
echo ========================================
echo.

set PROJECT_NAME=mistake-book
set EXPORT_DIR=%~dp0%EXPORT_%PROJECT_NAME%_%date:~0,4%%date:~5,2%%date:~8,2%

echo [1/3] 正在创建导出目录...
if not exist "%EXPORT_DIR%" mkdir "%EXPORT_DIR%"
echo     导出目录: %EXPORT_DIR%
echo.

echo [2/3] 正在复制项目文件...
xcopy "%~dp0*" "%EXPORT_DIR%\" /E /I /Y /Q >nul 2>&1
echo     文件复制完成
echo.

echo [3/3] 清理临时文件...
if exist "%EXPORT_DIR%\node_modules" rmdir /s /q "%EXPORT_DIR%\node_modules"
if exist "%EXPORT_DIR%\prisma\dev.db" del /q "%EXPORT_DIR%\prisma\dev.db"
if exist "%EXPORT_DIR%.env.local" del /q "%EXPORT_DIR%.env.local"
echo     清理完成
echo.

echo ========================================
echo   导出完成！
echo ========================================
echo.
echo 导出位置: %EXPORT_DIR%
echo.
echo 使用说明:
echo   1. 将导出的文件夹复制到目标位置
echo   2. 运行: npm install
echo   3. 运行: copy .env.example .env.local
echo   4. 编辑 .env.local 配置环境变量
echo   5. 运行: npx prisma generate ^&^& npx prisma db push
echo   6. 运行: npm run dev
echo.
pause
