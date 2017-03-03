pushd C:\PRGMS\Applications\node

set SCRIPTS_DIR=C:\Users\blanquet\workspace\tetr\scripts

rem node node_modules\requirejs\bin\r.js -o %SCRIPTS_DIR%\tetr.build.js include=requireLib

set CLOSURE_COMPILER=C:\PRGMS\Applications\closure compiler
echo %CLOSURE_COMPILER%

set java_home=C:\PRGMS\Java64
set path=
set path=%path%;%java_home%\bin

java -classpath "%CLOSURE_COMPILER%\js.jar;%CLOSURE_COMPILER%\compiler.jar" org.mozilla.javascript.tools.shell.Main node_modules\requirejs\bin\r.js -o C:\Users\blanquet\workspace\tetr\scripts\tetr.build.js include=requireLib
rem java -jar "%CLOSURE_COMPILER%\compiler.jar" --compilation_level ADVANCED_OPTIMIZATIONS --create_source_map %SCRIPTS_DIR%\tetr.closure.js.map --js %SCRIPTS_DIR%\tetr.bin.js > %SCRIPTS_DIR%\tetr.closure.js

popd

