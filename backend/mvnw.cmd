@REM ----------------------------------------------------------------------------
@REM Maven Startup Script for Windows
@REM ----------------------------------------------------------------------------
@echo off
@setlocal

set ERROR_CODE=0

@REM To isolate internal variables from possible post scripts, we use another setlocal
@setlocal

set MAVEN_PROJECTBASEDIR=%~dp0
if "%MAVEN_PROJECTBASEDIR:~-1%"=="\" set "MAVEN_PROJECTBASEDIR=%MAVEN_PROJECTBASEDIR:~0,-1%"
if not defined MAVEN_PROJECTBASEDIR (
  set MAVEN_PROJECTBASEDIR=%CD%
)

@REM Set local repo if not set
if not "%MAVEN_USER_HOME%" == "" (
  set "MAVEN_USER_HOME=%MAVEN_USER_HOME%"
) else (
  set "MAVEN_USER_HOME=%USERPROFILE%\.m2"
)

set "MAVEN_WRAPPER_JAR=%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.jar"

if exist "%MAVEN_WRAPPER_JAR%" (
  goto :runWrapper
)

@REM Download wrapper jar if not exists
powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; (New-Object Net.WebClient).DownloadFile('https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar', '%MAVEN_WRAPPER_JAR%')}"

:runWrapper
if not defined JAVA_HOME (
  set "JAVA_EXE=java.exe"
) else (
  set "JAVA_EXE=%JAVA_HOME%\bin\java.exe"
)

"%JAVA_EXE%" "-Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECTBASEDIR%" -classpath "%MAVEN_WRAPPER_JAR%" org.apache.maven.wrapper.MavenWrapperMain %*
if ERRORLEVEL 1 goto error
goto end

:error
set ERROR_CODE=1

:end
@endlocal & set ERROR_CODE=%ERROR_CODE%
exit /B %ERROR_CODE%

