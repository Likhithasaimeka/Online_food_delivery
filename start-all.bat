@echo off
echo ==============================================
echo   Starting Online Food Delivery Application
echo ==============================================
echo Starting Backend Server on http://localhost:5000 ...
start "Food Delivery Backend" cmd /k "cd backend && npm start"

echo Starting Frontend Server on http://localhost:5173 ...
start "Food Delivery Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are launching in separate windows!
echo Backend API:  http://localhost:5000
echo Frontend App: http://localhost:5173
echo.
pause
