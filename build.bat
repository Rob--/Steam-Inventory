:main
call browserify js/index.js > js/main.js
timeout /t 5 /nobreak > NUL

goto main
